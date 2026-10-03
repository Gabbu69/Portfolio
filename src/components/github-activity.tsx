"use client";

import { ArrowUpRight, Github } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { ContributionCalendar, ContributionDay } from "@/lib/github-calendar";

const refreshInterval = 60 * 60 * 1000;
const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
});
const monthFormatter = new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" });
const checkedFormatter = new Intl.DateTimeFormat("en", {
  month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
});

function labelForDay(day: ContributionDay) {
  const count = day.count === 0 ? "No contributions" : `${day.count.toLocaleString("en")} contribution${day.count === 1 ? "" : "s"}`;
  return `${count} on ${dateFormatter.format(new Date(`${day.date}T00:00:00Z`))}`;
}

function Calendar({ calendar }: { calendar: ContributionCalendar }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const firstDay = calendar.days[0];
  const lastDay = calendar.days[calendar.days.length - 1];
  const selectedDay = calendar.days.find((day) => day.date === selectedDate) ?? lastDay;
  const offset = new Date(`${firstDay.date}T00:00:00Z`).getUTCDay();
  const weeks = Math.ceil((calendar.days.length + offset) / 7);
  const cells: (ContributionDay | null)[] = [
    ...Array<null>(offset).fill(null), ...calendar.days,
    ...Array<null>(weeks * 7 - offset - calendar.days.length).fill(null),
  ];
  const months = calendar.days.flatMap((day, index) => {
    if (index !== 0 && day.date.slice(-2) !== "01") return [];
    const column = Math.floor((index + offset) / 7) + 1;
    // The next month's label takes this column if both begin in the same week.
    if (index === 0 && calendar.days.slice(1, 7 - offset).some((next) => next.date.slice(-2) === "01")) return [];
    return [{ date: day.date, column, label: monthFormatter.format(new Date(`${day.date}T00:00:00Z`)) }];
  });

  function navigateDay(event: KeyboardEvent<HTMLButtonElement>, day: ContributionDay) {
    const index = calendar.days.findIndex((candidate) => candidate.date === day.date);
    let nextIndex: number;
    switch (event.key) {
      case "ArrowUp": nextIndex = index - 1; break;
      case "ArrowDown": nextIndex = index + 1; break;
      case "ArrowLeft": nextIndex = index - 7; break;
      case "ArrowRight": nextIndex = index + 7; break;
      case "Home": nextIndex = 0; break;
      case "End": nextIndex = calendar.days.length - 1; break;
      default: return;
    }
    event.preventDefault();
    const nextDay = calendar.days[Math.max(0, Math.min(calendar.days.length - 1, nextIndex))];
    setSelectedDate(nextDay.date);
    buttons.current.get(nextDay.date)?.focus();
  }

  return (
    <>
      <div className="github-calendar__summary">
        <p><strong>{calendar.total.toLocaleString("en")}</strong> contributions in the last year</p>
        <span>{monthFormatter.format(new Date(`${firstDay.date}T00:00:00Z`))} {firstDay.date.slice(0, 4)} — {monthFormatter.format(new Date(`${lastDay.date}T00:00:00Z`))} {lastDay.date.slice(0, 4)}</span>
      </div>
      <div className="github-calendar__scroll">
        <div className="github-calendar" style={{ "--calendar-weeks": weeks } as CSSProperties}>
          <div className="github-calendar__months" aria-hidden="true">
            {months.map((month) => <span key={month.date} style={{ gridColumn: month.column }}>{month.label}</span>)}
          </div>
          <div className="github-calendar__weekdays" aria-hidden="true">
            <span style={{ gridRow: 2 }}>Mon</span>
            <span style={{ gridRow: 4 }}>Wed</span>
            <span style={{ gridRow: 6 }}>Fri</span>
          </div>
          <div className="github-calendar__days" role="group" aria-label="Daily GitHub contributions" aria-describedby="github-calendar-instructions">
            {cells.map((day, index) => day ? (
              <button
                key={day.date}
                type="button"
                className={`github-calendar__day${selectedDay.date === day.date ? " is-selected" : ""}`}
                data-level={day.level}
                aria-label={labelForDay(day)}
                aria-pressed={selectedDay.date === day.date}
                title={labelForDay(day)}
                tabIndex={selectedDay.date === day.date ? 0 : -1}
                ref={(element) => { if (element) buttons.current.set(day.date, element); else buttons.current.delete(day.date); }}
                onMouseEnter={() => setSelectedDate(day.date)}
                onFocus={() => setSelectedDate(day.date)}
                onClick={() => setSelectedDate(day.date)}
                onKeyDown={(event) => navigateDay(event, day)}
              />
            ) : <span className="github-calendar__blank" key={`blank-${index}`} aria-hidden="true" />)}
          </div>
        </div>
      </div>
      <div className="github-calendar__detail-row">
        <p className="github-calendar__detail" role="status" aria-live="polite">{labelForDay(selectedDay)}</p>
        <div className="github-calendar__legend" aria-label="Contribution intensity, from fewer to more">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => <i key={level} data-level={level} aria-hidden="true" />)}
          <span>More</span>
        </div>
      </div>
      <p className="github-calendar__instructions" id="github-calendar-instructions">Hover or tap a day to see its count. Use arrow keys when focused.</p>
    </>
  );
}

export function GithubActivity({ github }: { github: string }) {
  const [calendar, setCalendar] = useState<ContributionCalendar | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let disposed = false;
    let lastAttempt = 0;
    let controller: AbortController | null = null;

    async function refresh() {
      if (controller || document.visibilityState === "hidden") return;
      lastAttempt = Date.now();
      controller = new AbortController();
      const requestController = controller;
      const timeout = window.setTimeout(() => requestController.abort(), 15_000);
      try {
        const response = await fetch("/api/github-activity", { cache: "no-store", signal: requestController.signal });
        if (!response.ok) throw new Error("GitHub activity unavailable");
        const data: ContributionCalendar = await response.json();
        if (data.username !== "Gabbu69" || !Array.isArray(data.days) || data.days.length === 0) throw new Error("Invalid activity response");
        if (!disposed) { setCalendar(data); setLoadError(false); }
      } catch {
        if (!disposed) setLoadError(true);
      } finally {
        window.clearTimeout(timeout);
        controller = null;
      }
    }

    function refreshWhenVisible() {
      if (Date.now() - lastAttempt >= refreshInterval) void refresh();
    }
    void refresh();
    const interval = window.setInterval(refreshWhenVisible, refreshInterval);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => { disposed = true; controller?.abort(); window.clearInterval(interval); document.removeEventListener("visibilitychange", refreshWhenVisible); };
  }, []);

  return (
    <section className="github-activity" aria-labelledby="github-activity-title">
      <header className="github-activity__heading">
        <div>
          <p className="eyebrow"><Github aria-hidden="true" /> Building, one contribution at a time</p>
          <h2 id="github-activity-title">GitHub Activity</h2>
        </div>
        <a href={github} target="_blank" rel="noreferrer">View on GitHub <ArrowUpRight aria-hidden="true" /></a>
      </header>
      <div className="github-activity__panel" aria-busy={!calendar && !loadError}>
        {calendar ? <Calendar calendar={calendar} /> : (
          <div className="github-activity__placeholder" role="status">
            <Github aria-hidden="true" />
            <p>{loadError ? "GitHub activity is temporarily unavailable." : "Loading GitHub contributions…"}</p>
            {loadError ? <a href={github} target="_blank" rel="noreferrer">See activity on GitHub <ArrowUpRight aria-hidden="true" /></a> : <span>Fetching the calendar from GitHub.</span>}
          </div>
        )}
      </div>
      <footer className="github-activity__footer">
        <span>{calendar ? `${loadError ? "Couldn’t refresh. Last checked" : "Last checked"} ${checkedFormatter.format(new Date(calendar.fetchedAt))}.` : "Counts follow GitHub profile visibility settings."}</span>
        <span>Refreshes hourly · GitHub processing may take longer</span>
      </footer>
    </section>
  );
}
