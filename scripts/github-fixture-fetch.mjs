// Loaded only by the isolated integration-test child, never by the app.
import { appendFileSync, readFileSync, watchFile } from "node:fs";
import { calendarHtml } from "../tests/fixtures/github-calendar.mjs";

const statePath = process.env.GITHUB_CALENDAR_FIXTURE_STATE_PATH;
const logPath = process.env.GITHUB_CALENDAR_FIXTURE_LOG_PATH;
if (!statePath || !logPath) throw new Error("The fixture shim requires isolated test state.");

const realFetch = globalThis.fetch;
const realNow = Date.now;
const realPerformanceNow = performance.now.bind(performance);
let state = JSON.parse(readFileSync(statePath, "utf8"));
function refreshState() {
  try {
    state = JSON.parse(readFileSync(statePath, "utf8"));
  } catch {
    // Keep the prior state while the controller atomically replaces the file.
  }
}
watchFile(statePath, { interval: 50, persistent: false }, refreshState);
// The clock changes only inside this disposable child process.
Date.now = () => realNow() + state.clockOffset;
// Next 16.3 computes FETCH-cache age from the monotonic performance clock.
Object.defineProperty(performance, "now", {
  configurable: true,
  value: () => realPerformanceNow() + state.clockOffset,
});

globalThis.fetch = async (input, options) => {
  const url = input instanceof Request ? input.url : String(input);
  if (url !== "https://github.com/users/Gabbu69/contributions") return realFetch(input, options);
  refreshState();
  appendFileSync(logPath, `${JSON.stringify({ mode: state.mode, count: state.count })}\n`);
  if (state.mode === "network-error") throw new TypeError("Simulated upstream transport failure");
  if (state.mode === "malformed") return new Response("<html>Simulated invalid upstream HTTP 200</html>");
  return new Response(calendarHtml({
    endDate: new Date(realNow()).toISOString().slice(0, 10),
    count: state.count,
  }), { headers: { "Content-Type": "text/html" } });
};
