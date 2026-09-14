"use client";

import { Moon, Sun } from "lucide-react";
import { useRef, useSyncExternalStore, type MouseEvent } from "react";

const storageKey = "gab-portfolio-theme";
type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#181917" : "#f4f0e7");
}

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const syncSystem = () => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(storageKey); } catch { /* Storage is optional. */ }
    if (saved !== "light" && saved !== "dark") applyTheme(systemTheme.matches ? "dark" : "light");
  };
  const syncStorage = (event: StorageEvent) => {
    if (event.key !== storageKey && event.key !== null) return;
    if (event.newValue === "light" || event.newValue === "dark") applyTheme(event.newValue);
    else syncSystem();
  };
  systemTheme.addEventListener("change", syncSystem);
  window.addEventListener("storage", syncStorage);
  return () => {
    observer.disconnect();
    systemTheme.removeEventListener("change", syncSystem);
    window.removeEventListener("storage", syncStorage);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, () => document.documentElement.dataset.theme ?? "light", () => "light");
  const transitionRef = useRef<ViewTransition | null>(null);
  const toggleTheme = (event: MouseEvent<HTMLButtonElement>) => {
    const nextTheme: Theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    const update = () => {
      applyTheme(nextTheme);
      try { localStorage.setItem(storageKey, nextTheme); } catch { /* Keep the selected theme without storage. */ }
    };
    const bounds = event.currentTarget.getBoundingClientRect();
    document.documentElement.style.setProperty("--theme-x", `${bounds.x + bounds.width / 2}px`);
    document.documentElement.style.setProperty("--theme-y", `${bounds.y + bounds.height / 2}px`);
    transitionRef.current?.skipTransition();
    if (document.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const transition = document.startViewTransition(update);
      transitionRef.current = transition;
      void transition.finished.catch(() => {}).finally(() => {
        if (transitionRef.current === transition) transitionRef.current = null;
      });
    } else update();
  };
  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
      <span className="theme-toggle__icons"><Sun className="theme-toggle__sun" aria-hidden="true" /><Moon className="theme-toggle__moon" aria-hidden="true" /></span>
      <span className="theme-toggle__label"><span className="theme-toggle__day">Day <span lang="ja">昼</span></span><span className="theme-toggle__night">Night <span lang="ja">夜</span></span></span>
    </button>
  );
}
