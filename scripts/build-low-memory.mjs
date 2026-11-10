import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const env = {
  ...process.env,
  PORTFOLIO_LOW_MEMORY: "1",
  UV_THREADPOOL_SIZE: "1",
  NODE_OPTIONS: "--max-old-space-size=512 --max-semi-space-size=8",
};

function run(label, entry, args, checked) {
  console.log(`\n${label}`);
  const result = spawnSync(process.execPath, [fileURLToPath(new URL(entry, import.meta.url)), ...args], {
    cwd: root,
    env: { ...env, PORTFOLIO_TYPES_PRECHECKED: checked ? "1" : "0" },
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

// The type-check process exits before the Next build starts, releasing its
// heap. A failed check stops here; it never starts an unchecked build.
run("Generating route types…", "../node_modules/next/dist/bin/next", ["typegen"], false);
run("Checking TypeScript separately…", "../node_modules/typescript/bin/tsc", ["--noEmit"], false);
run("Building with one worker…", "../node_modules/next/dist/bin/next", ["build", "--webpack"], true);
