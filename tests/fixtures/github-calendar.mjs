/** A complete calendar fixture, with cells emitted by weekday like GitHub. */
export function calendarHtml({ endDate = "2026-10-03", count = 3 } = {}) {
  const end = new Date(`${endDate}T00:00:00.000Z`);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 364);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  const dates = [];
  for (const date = new Date(start); date <= end; date.setUTCDate(date.getUTCDate() + 1)) {
    dates.push(date.toISOString().slice(0, 10));
  }
  const cells = dates.map((date, index) => {
    const dayCount = index === dates.length - 2 ? count : 0;
    return {
      date,
      cell: `<td data-level='${dayCount ? 2 : 0}' id='day-${index}' data-date='${date}'></td>`,
      tooltip: `<tool-tip for='day-${index}'>${dayCount ? `${dayCount.toLocaleString("en-US")} contribution${dayCount === 1 ? "" : "s"}` : "No contributions"} on this day.</tool-tip>`,
    };
  });
  const rows = Array.from({ length: 7 }, (_, weekday) =>
    `<tr>${cells.filter(({ date }) => new Date(`${date}T00:00:00Z`).getUTCDay() === weekday).map(({ cell }) => cell).join("")}</tr>`,
  ).join("");
  return `<h2>\n ${count.toLocaleString("en-US")} contributions\n in the last year\n</h2><table>${rows}</table>${cells.reverse().map(({ tooltip }) => tooltip).join("")}`;
}
