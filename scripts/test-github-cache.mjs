import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { cp, mkdir, mkdtemp, readFile, readdir, rename, rm, unlink, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { dirname, join, resolve, sep } from "node:path";
import { setTimeout as pause } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const work = join(root, "work");
const build = join(root, ".next");
await readFile(join(build, "BUILD_ID")); // Require a completed production build.
async function cacheSnapshot(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch((error) => {
    if (error.code === "ENOENT") return [];
    throw error;
  });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await cacheSnapshot(path));
    else if (entry.isFile()) files.push([path, createHash("sha256").update(await readFile(path)).digest("hex")]);
  }
  return files.sort(([left], [right]) => left.localeCompare(right));
}
const originalFetchCache = join(build, "cache/fetch-cache");
const cacheBefore = await cacheSnapshot(originalFetchCache);
await mkdir(work, { recursive: true });
const isolated = await mkdtemp(join(work, "github-calendar-cache-"));
const statePath = join(isolated, "fixture-state.json");
const logPath = join(isolated, "fixture-requests.jsonl");
let child;
let output = "";
let state = { mode: "malformed", count: 3, clockOffset: 0 };

async function setState(changes) {
  state = { ...state, ...changes };
  const temporary = `${statePath}.tmp`;
  await writeFile(temporary, JSON.stringify(state));
  await rename(temporary, statePath);
  await pause(120);
}

async function requests() {
  const text = await readFile(logPath, "utf8");
  return text.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

async function waitFor(check, message, milliseconds = 12_000) {
  const deadline = Date.now() + milliseconds;
  while (Date.now() < deadline) {
    if (child?.exitCode !== null && child?.exitCode !== undefined) throw new Error(`Child server exited.\n${output}`);
    if (await check()) return;
    await pause(100);
  }
  throw new Error(`${message}\n${output}`);
}

try {
  // Excluding the original build cache guarantees a cold isolated cache.
  const originalCache = join(build, "cache");
  await cp(build, join(isolated, ".next"), {
    recursive: true,
    filter: (source) => source !== originalCache && !source.startsWith(`${originalCache}${sep}`),
  });
  await cp(join(root, "public"), join(isolated, "public"), { recursive: true });
  await cp(join(root, "next.config.ts"), join(isolated, "next.config.ts"));
  await writeFile(join(isolated, "package.json"), JSON.stringify({ name: "github-calendar-cache-check", private: true, type: "module" }));
  const { symlink } = await import("node:fs/promises");
  await symlink(join(root, "node_modules"), join(isolated, "node_modules"), process.platform === "win32" ? "junction" : "dir");
  await writeFile(logPath, "");
  await writeFile(statePath, JSON.stringify(state));

  const probe = createServer();
  probe.listen(0, "127.0.0.1");
  await once(probe, "listening");
  const port = probe.address().port;
  await new Promise((done) => probe.close(done));
  const endpoint = `http://127.0.0.1:${port}/api/github-activity`;
  child = spawn(process.execPath, [
    "--import", pathToFileURL(join(root, "scripts/github-fixture-fetch.mjs")).href,
    join(root, "node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port),
  ], {
    cwd: isolated,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      NODE_ENV: "production",
      GITHUB_CALENDAR_FIXTURE_STATE_PATH: statePath,
      GITHUB_CALENDAR_FIXTURE_LOG_PATH: logPath,
      NEXT_TELEMETRY_DISABLED: "1",
    },
  });
  for (const stream of [child.stdout, child.stderr]) {
    stream.on("data", (chunk) => { output = `${output}${chunk}`.slice(-20_000); });
  }
  child.on("error", (error) => { output += error.message; });
  await waitFor(async () => {
    try {
      const response = await fetch(endpoint, { signal: AbortSignal.timeout(1_000) });
      return response.status === 503;
    } catch { return false; }
  }, "Cold-cache unavailable state did not return HTTP 503.");
  const unavailable = await fetch(endpoint);
  assert.equal(unavailable.status, 503);
  assert.equal(unavailable.headers.get("Cache-Control"), "no-store");
  assert.deepEqual(await unavailable.json(), { error: "GitHub activity is temporarily unavailable." });
  console.log("PASS: cold-cache malformed HTTP 200 returns a clean uncached 503.");

  if (process.argv.includes("--preview-unavailable")) {
    console.log(JSON.stringify({
      previewUrl: `http://127.0.0.1:${port}`,
      isolatedDirectory: isolated,
      statePath,
      childPid: child.pid,
      stop: "Set shutdown to true in the isolated fixture-state.json to stop and clean up.",
    }));
    while (true) {
      if (child.exitCode !== null) throw new Error(`Preview child exited.\n${output}`);
      const control = await readFile(statePath, "utf8").then(JSON.parse).catch(() => ({}));
      if (control.shutdown) break;
      await pause(250);
    }
    // A regular preview may legitimately fill its own cache during this browser check.
    // The standalone cache test below performs the isolation assertion without that race.
    console.log("Unavailable preview stopped.");
  } else {

  await setState({ mode: "valid" });
  const baselineResponse = await fetch(endpoint);
  assert.equal(baselineResponse.status, 200);
  const baseline = await baselineResponse.json();
  assert.equal(baseline.total, 3);
  assert.equal(baseline.username, "Gabbu69");
  const beforeCachedRequest = (await requests()).length;
  assert.deepEqual(await (await fetch(endpoint)).json(), baseline);
  assert.equal((await requests()).length, beforeCachedRequest);
  console.log("PASS: successful normalized data is cached across requests.");

  await setState({ mode: "malformed", clockOffset: 3_601_000 });
  assert.deepEqual(await (await fetch(endpoint)).json(), baseline);
  await waitFor(async () => (await requests()).at(-1)?.mode === "malformed", "Expired cache did not attempt malformed refresh.");
  await pause(200);
  assert.deepEqual(await (await fetch(endpoint)).json(), baseline);
  console.log("PASS: after one hour, malformed HTTP 200 preserves the last successful calendar.");

  await setState({ mode: "network-error", clockOffset: 7_202_000 });
  assert.deepEqual(await (await fetch(endpoint)).json(), baseline);
  await waitFor(async () => (await requests()).at(-1)?.mode === "network-error", "Expired cache did not attempt transport refresh.");
  await pause(200);
  assert.deepEqual(await (await fetch(endpoint)).json(), baseline);
  console.log("PASS: transport failure also preserves data and its original fetchedAt.");

  await setState({ mode: "valid", count: 7 });
  await fetch(endpoint);
  await waitFor(async () => {
    const result = await (await fetch(endpoint)).json();
    return result.total === 7;
  }, "Valid refresh did not replace the last successful calendar.");
  const beforeFinalCachedRequest = (await requests()).length;
  const refreshed = await (await fetch(endpoint)).json();
  assert.equal(refreshed.total, 7);
  assert.notEqual(refreshed.fetchedAt, baseline.fetchedAt);
  assert.equal((await requests()).length, beforeFinalCachedRequest);
  console.log("PASS: a later valid refresh replaces the data and restarts the hourly cache.");
  assert.deepEqual(await cacheSnapshot(originalFetchCache), cacheBefore);
  console.log("PASS: the actual preview cache remains byte-identical.");
  }
} finally {
  if (child && child.exitCode === null) {
    child.kill();
    await Promise.race([once(child, "exit"), pause(5_000)]);
  }
  // Verify the computed recursive-removal target remains in the owned work area.
  assert.ok(resolve(isolated).startsWith(`${resolve(work)}${sep}github-calendar-cache-`));
  // Remove the junction first so cleanup can never descend into shared dependencies.
  await unlink(join(isolated, "node_modules")).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
  await rm(isolated, { recursive: true, force: true });
}
