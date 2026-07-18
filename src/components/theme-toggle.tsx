"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";

const storageKey = "gab-portfolio-theme";

type Theme = "light" | "dark";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  useEffect(() => {
    const syncTheme = (event: StorageEvent) => {
      if (event.key !== storageKey || (event.newValue !== "light" && event.newValue !== "dark")) {
        return;
      }

      applyTheme(event.newValue);
    };

    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    const updateTheme = () => {
      applyTheme(nextTheme);
      try {
        localStorage.setItem(storageKey, nextTheme);
      } catch {
        // The theme still changes when storage is unavailable.
      }
    };
    const viewTransitionDocument = document as ViewTransitionDocument;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (viewTransitionDocument.startViewTransition && !reduceMotion) {
      viewTransitionDocument.startViewTransition(updateTheme);
      return;
    }

    updateTheme();
  };

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      <Sun className="theme-toggle__sun" aria-hidden="true" />
      <Moon className="theme-toggle__moon" aria-hidden="true" />
    </button>
  );
}
