"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore, type MouseEvent } from "react";
import { EFFECTS_CHANGE_EVENT, getEffectsEnabled } from "@/lib/effects-preference";
import { themeReveal, THEME_TRANSITION_DURATION } from "@/lib/theme-transition";

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
  const animationsRef = useRef<Animation[]>([]);
  const requestRef = useRef(0);
  const requestedThemeRef = useRef<Theme | null>(null);

  useEffect(() => {
    const stop = () => {
      transitionRef.current?.skipTransition();
      animationsRef.current.forEach(animation => animation.cancel());
      animationsRef.current = [];
    };
    const effectsChanged = () => { if (!getEffectsEnabled()) stop(); };
    window.addEventListener(EFFECTS_CHANGE_EVENT, effectsChanged);
    return () => { window.removeEventListener(EFFECTS_CHANGE_EVENT, effectsChanged); stop(); };
  }, []);

  const toggleTheme = (event: MouseEvent<HTMLButtonElement>) => {
    const root = document.documentElement;
    const current = requestedThemeRef.current ?? (root.dataset.theme === "dark" ? "dark" : "light");
    const nextTheme: Theme = current === "dark" ? "light" : "dark";
    const request = ++requestRef.current;
    requestedThemeRef.current = nextTheme;
    let applied = false;
    const update = () => {
      if (request !== requestRef.current || applied) return;
      applied = true;
      applyTheme(nextTheme);
      try { localStorage.setItem(storageKey, nextTheme); } catch { /* Keep the selected theme without storage. */ }
    };
    const clear = () => {
      if (request !== requestRef.current) return;
      delete root.dataset.themeSwitch;
      requestedThemeRef.current = null;
      transitionRef.current = null;
      animationsRef.current = [];
    };
    transitionRef.current?.skipTransition();
    animationsRef.current.forEach(animation => animation.cancel());
    animationsRef.current = [];
    if (!document.startViewTransition || !getEffectsEnabled() || document.hidden) {
      update();
      clear();
      return;
    }
    const bounds = (event.currentTarget.querySelector(".theme-toggle__icons") ?? event.currentTarget).getBoundingClientRect();
    const x = bounds.x + bounds.width / 2;
    const y = bounds.y + bounds.height / 2;
    root.style.setProperty("--theme-x", `${x}px`);
    root.style.setProperty("--theme-y", `${y}px`);
    root.dataset.themeSwitch = nextTheme;
    try {
      const transition = document.startViewTransition(update);
      transitionRef.current = transition;
      void transition.ready.then(() => {
        if (request !== requestRef.current) return;
        const { frames } = themeReveal(x, y, innerWidth, innerHeight, nextTheme === "dark");
        const reveal = root.animate(frames, {
          duration: THEME_TRANSITION_DURATION,
          easing: "cubic-bezier(.22,.8,.25,1)",
          pseudoElement: "::view-transition-new(root)",
          fill: "both",
        });
        animationsRef.current.push(reveal);
        void reveal.finished.catch(() => {});
      }).catch(() => { transition.skipTransition(); });
      void transition.updateCallbackDone.catch(() => { update(); });
      void transition.finished.catch(() => {}).finally(() => {
        update();
        clear();
      });
    } catch {
      update();
      clear();
    }
  };
  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
      <span className="theme-toggle__icons"><Sun className="theme-toggle__sun" aria-hidden="true" /><Moon className="theme-toggle__moon" aria-hidden="true" /></span>
      <span className="theme-toggle__label"><span className="theme-toggle__day">Day</span><span className="theme-toggle__night">Night</span></span>
    </button>
  );
}
