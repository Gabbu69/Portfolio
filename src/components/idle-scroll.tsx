"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { EFFECTS_CHANGE_EVENT, getEffectsEnabled } from "@/lib/effects-preference";

const IDLE_DELAY = 15_000;
const SCROLL_SPEED = 18; // CSS pixels per second, after a gentle two-second start.

/** A quiet portfolio tour that always yields to the visitor. */
export function IdleScroll() {
  const pathname = usePathname();

  useEffect(() => {
    let timer = 0;
    let frame = 0;
    let disposed = false;
    let started = 0;
    let previous = 0;
    let position = 0;
    let expected: number | null = null;
    let pointer: { x: number; y: number } | null = null;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");

    function blocked() {
      return document.hidden || !getEffectsEnabled() ||
        Boolean(document.activeElement?.closest("input,textarea,select,[contenteditable=true]")) ||
        Boolean(document.querySelector("dialog[open],details[open],[aria-modal=true]")) ||
        window.getSelection()?.isCollapsed === false;
    }

    function stop() {
      window.clearTimeout(timer);
      if (frame) cancelAnimationFrame(frame);
      timer = 0;
      frame = 0;
      expected = null;
      delete document.documentElement.dataset.idleScrolling;
    }

    function tick(now: number) {
      frame = 0;
      if (disposed || blocked()) { stop(); return; }
      const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      if (scrollY >= max - 1) { stop(); return; }
      const delta = Math.min(64, Math.max(0, now - previous));
      previous = now;
      const ramp = Math.min(1, (now - started) / 2_000);
      position = Math.min(max, position + SCROLL_SPEED * ramp * delta / 1_000);
      const next = Math.floor(position);
      if (next !== Math.round(scrollY)) {
        expected = next;
        // The CSS smooth-scroll setting must not add a second, lagging animation.
        window.scrollTo({ top: next, behavior: "instant" });
      }
      frame = requestAnimationFrame(tick);
    }

    function start() {
      timer = 0;
      if (disposed || blocked()) return;
      if (scrollY >= document.documentElement.scrollHeight - innerHeight - 1) return;
      started = performance.now();
      previous = started;
      position = scrollY;
      document.documentElement.dataset.idleScrolling = "true";
      frame = requestAnimationFrame(tick);
    }

    function activity() {
      stop();
      if (!disposed && !document.hidden && getEffectsEnabled()) timer = window.setTimeout(start, IDLE_DELAY);
    }

    function moved(event: PointerEvent) {
      if (pointer && Math.abs(event.clientX - pointer.x) < 1 && Math.abs(event.clientY - pointer.y) < 1) return;
      pointer = { x: event.clientX, y: event.clientY };
      activity();
    }

    function scrolled() {
      // Our own scroll events keep the tour running; any other scroll wins.
      if (frame && expected !== null && Math.abs(scrollY - expected) <= 1) return;
      activity();
    }

    window.addEventListener("pointermove", moved, { passive: true });
    const inputEvents = ["pointerdown", "wheel", "touchstart", "touchmove", "keydown", "click"] as const;
    for (const event of inputEvents) window.addEventListener(event, activity, { passive: true, capture: true });
    window.addEventListener("scroll", scrolled, { passive: true });
    window.addEventListener(EFFECTS_CHANGE_EVENT, activity);
    motion.addEventListener("change", activity);
    const documentEvents = ["visibilitychange", "focusin", "focusout", "selectionchange", "toggle", "close", "cancel"] as const;
    for (const event of documentEvents) document.addEventListener(event, activity, true);
    activity();

    return () => {
      disposed = true;
      stop();
      window.removeEventListener("pointermove", moved);
      for (const event of inputEvents) window.removeEventListener(event, activity, true);
      window.removeEventListener("scroll", scrolled);
      window.removeEventListener(EFFECTS_CHANGE_EVENT, activity);
      motion.removeEventListener("change", activity);
      for (const event of documentEvents) document.removeEventListener(event, activity, true);
    };
  }, [pathname]);

  return null;
}
