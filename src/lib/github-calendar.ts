import { Parser } from "htmlparser2";

export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type ContributionCalendar = {
  username: "Gabbu69";
  total: number;
  days: ContributionDay[];
  fetchedAt: string;
};

const contributionUrl = "https://github.com/users/Gabbu69/contributions";
const dayMilliseconds = 86_400_000;
const integerPattern = "(?:0|[1-9]\\d*|[1-9]\\d{0,2}(?:,\\d{3})+)";
const totalPattern = new RegExp(`^(${integerPattern}) contributions? in the last year$`);
const countPattern = new RegExp(`^(${integerPattern}) contributions? on .+\\.$`);

function invalid(reason: string): never {
  throw new Error(`Invalid GitHub contribution calendar: ${reason}`);
}

function dateTimestamp(date: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) invalid("invalid date");
  const timestamp = Date.parse(`${date}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== date) {
    invalid("invalid date");
  }
  return timestamp;
}

function parseInteger(value: string): number {
  const number = Number(value.replaceAll(",", ""));
  if (!Number.isSafeInteger(number) || number < 0) invalid("invalid contribution count");
  return number;
}

/** Parse GitHub's public calendar markup without embedding upstream HTML. */
export function parseContributionCalendar(
  html: string,
  now = new Date(),
): Pick<ContributionCalendar, "total" | "days"> {
  if (!html || html.length > 2_000_000) invalid("unexpected response size");

  const cells = new Map<string, { date: string; level: ContributionDay["level"] }>();
  const tooltips = new Map<string, string>();
  const duplicateTooltips = new Set<string>();
  const headings: string[] = [];
  let tooltip: { target: string; text: string } | undefined;
  let heading: string | undefined;

  const parser = new Parser({
    onopentag(name, attributes) {
      if (name === "td" && attributes["data-date"] !== undefined) {
        const id = attributes.id;
        const level = attributes["data-level"];
        if (!id || cells.has(id)) invalid("missing or duplicate cell id");
        if (!/^[0-4]$/.test(level ?? "")) invalid("invalid contribution level");
        cells.set(id, {
          date: attributes["data-date"],
          level: Number(level) as ContributionDay["level"],
        });
      }
      if (name === "tool-tip" && attributes.for) {
        tooltip = { target: attributes.for, text: "" };
      }
      if (name === "h2") heading = "";
    },
    ontext(text) {
      if (tooltip) tooltip.text += text;
      if (heading !== undefined) heading += text;
    },
    onclosetag(name) {
      if (name === "tool-tip" && tooltip) {
        if (tooltips.has(tooltip.target)) duplicateTooltips.add(tooltip.target);
        tooltips.set(tooltip.target, tooltip.text.replace(/\s+/g, " ").trim());
        tooltip = undefined;
      }
      if (name === "h2" && heading !== undefined) {
        headings.push(heading.replace(/\s+/g, " ").trim());
        heading = undefined;
      }
    },
  });
  parser.end(html);

  if (cells.size < 365 || cells.size > 371) invalid("expected a full year of dates");
  const totals = headings.map((text) => totalPattern.exec(text)).filter((match) => match !== null);
  if (totals.length !== 1) invalid("missing or ambiguous annual total");
  const total = parseInteger(totals[0][1]);

  const days: ContributionDay[] = [];
  for (const [id, cell] of cells) {
    dateTimestamp(cell.date);
    const label = tooltips.get(id);
    if (!label || duplicateTooltips.has(id)) invalid("missing or duplicate day tooltip");
    const match = countPattern.exec(label);
    const count = /^No contributions on .+\.$/.test(label)
      ? 0
      : match ? parseInteger(match[1]) : invalid("unrecognized day count");
    if ((count === 0) !== (cell.level === 0)) invalid("count and level disagree");
    days.push({ ...cell, count });
  }
  days.sort((left, right) => left.date.localeCompare(right.date));

  for (let index = 1; index < days.length; index++) {
    if (dateTimestamp(days[index].date) - dateTimestamp(days[index - 1].date) !== dayMilliseconds) {
      invalid("duplicate or noncontiguous dates");
    }
  }
  const first = dateTimestamp(days[0].date);
  const last = dateTimestamp(days.at(-1)!.date);
  const today = dateTimestamp(now.toISOString().slice(0, 10));
  if (new Date(first).getUTCDay() !== 0 || Math.abs(last - today) > dayMilliseconds) {
    invalid("unexpected calendar date range");
  }
  const sum = days.reduce((value, day) => value + day.count, 0);
  if (!Number.isSafeInteger(sum) || sum !== total) invalid("annual total does not match daily counts");
  return { total, days };
}

/** Only validated results reach the persistent server cache. */
export async function fetchContributionCalendar(
  fetcher: typeof fetch = fetch,
  clock: () => Date = () => new Date(),
): Promise<ContributionCalendar> {
  const response = await fetcher(contributionUrl, {
    cache: "no-store",
    headers: {
      Accept: "text/html",
      "Accept-Language": "en-US",
      "User-Agent": "Gabbu69-Portfolio",
    },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error("GitHub contribution request failed");
  const html = await response.text();
  const now = clock();
  return {
    username: "Gabbu69",
    ...parseContributionCalendar(html, now),
    fetchedAt: now.toISOString(),
  };
}
