import assert from "node:assert/strict";
import { test } from "node:test";
import { calendarHtml } from "./fixtures/github-calendar.mjs";
import { fetchContributionCalendar, parseContributionCalendar } from "../src/lib/github-calendar";

const now = new Date("2026-10-03T06:00:00.000Z");

test("joins unordered day cells and tooltips and preserves GitHub dates", () => {
  const result = parseContributionCalendar(calendarHtml(), now);
  assert.equal(result.days.length, 371);
  assert.equal(result.total, 3);
  assert.deepEqual(result.days[0], { date: "2025-09-28", count: 0, level: 0 });
  assert.deepEqual(result.days.at(-2), { date: "2026-10-02", count: 3, level: 2 });
  assert.equal(result.days.at(-1)?.date, "2026-10-03");
});

test("accepts a valid empty calendar, singular counts, comma counts and decoded nested text", () => {
  assert.equal(parseContributionCalendar(calendarHtml({ count: 0 }), now).total, 0);
  assert.equal(parseContributionCalendar(calendarHtml({ count: 1 }), now).total, 1);
  const nested = calendarHtml({ count: 1234 })
    .replace("1,234 contributions on this day.", "<span>1,234</span>&nbsp;contributions on this day.");
  assert.equal(parseContributionCalendar(nested, now).total, 1234);
});

const invalidCases: [string, (html: string) => string][] = [
  ["missing tooltip", (html) => html.replace(/<tool-tip for='day-0'>.*?<\/tool-tip>/, "")],
  ["duplicate tooltip", (html) => `${html}<tool-tip for='day-0'>No contributions on this day.</tool-tip>`],
  ["duplicate cell id", (html) => html.replace("id='day-1'", "id='day-0'")],
  ["duplicate date", (html) => html.replace("data-date='2025-09-29'", "data-date='2025-09-28'")],
  ["invalid date", (html) => html.replace("data-date='2025-09-28'", "data-date='2025-02-30'")],
  ["missing day", (html) => html.replace(/<td data-level='0' id='day-1' data-date='2025-09-29'><\/td>/, "")],
  ["invalid level", (html) => html.replace("data-level='0'", "data-level='5'")],
  ["count-level mismatch", (html) => html.replace("data-level='2'", "data-level='0'")],
  ["invalid count", (html) => html.replace("3 contributions on this day.", "-3 contributions on this day.")],
  ["unrecognized count", (html) => html.replace("3 contributions on this day.", "Activity on this day.")],
  ["unsafe count", (html) => html.replace("3 contributions on this day.", "9007199254740992 contributions on this day.")],
  ["missing total", (html) => html.replace(/<h2>[\s\S]*?<\/h2>/, "")],
  ["inconsistent total", (html) => html.replace("3 contributions\n in the last year", "4 contributions\n in the last year")],
  ["duplicate total", (html) => `${html}<h2>3 contributions in the last year</h2>`],
];

for (const [name, change] of invalidCases) {
  test(`rejects ${name}`, () => {
    assert.throws(() => parseContributionCalendar(change(calendarHtml()), now), /Invalid GitHub contribution calendar/);
  });
}

test("rejects a truncated, oversized or stale response instead of inventing empty activity", () => {
  assert.throws(() => parseContributionCalendar("<html>Sign in</html>", now));
  assert.throws(() => parseContributionCalendar(" ".repeat(2_000_001), now));
  assert.throws(() => parseContributionCalendar(calendarHtml(), new Date("2026-10-06T00:00:00Z")));
});

test("loader fetches only the fixed public account with an uncached request and timeout", async () => {
  let receivedInput: Parameters<typeof fetch>[0] | undefined;
  let receivedOptions: RequestInit | undefined;
  const fetcher: typeof fetch = async (input, options) => {
    receivedInput = input;
    receivedOptions = options;
    return new Response(calendarHtml(), { headers: { "Content-Type": "text/html" } });
  };
  const result = await fetchContributionCalendar(fetcher, () => now);
  assert.equal(receivedInput, "https://github.com/users/Gabbu69/contributions");
  assert.equal(receivedOptions?.cache, "no-store");
  assert.ok(receivedOptions?.signal instanceof AbortSignal);
  assert.equal(new Headers(receivedOptions?.headers).get("Accept-Language"), "en-US");
  assert.equal(result.username, "Gabbu69");
  assert.equal(result.fetchedAt, now.toISOString());
  assert.equal(result.total, 3);
});

test("loader rejects HTTP, transport and malformed HTTP-200 failures", async () => {
  await assert.rejects(fetchContributionCalendar(async () => new Response("unavailable", { status: 503 }), () => now));
  await assert.rejects(fetchContributionCalendar(async () => { throw new TypeError("fetch failed"); }, () => now));
  await assert.rejects(fetchContributionCalendar(async () => new Response("<html>temporary upstream error</html>"), () => now));
});
