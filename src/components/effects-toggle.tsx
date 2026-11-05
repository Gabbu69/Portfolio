"use client";

import { Sparkles } from "lucide-react";
import { useSyncExternalStore } from "react";
import { getEffectsEnabled, setEffectsEnabled } from "@/lib/effects-preference";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-effects"] });
  return () => observer.disconnect();
}

export function EffectsToggle({ mobile = false }: { mobile?: boolean }) {
  const enabled = useSyncExternalStore(subscribe, getEffectsEnabled, () => false);
  return (
    <button
      className={`effects-toggle${mobile ? " effects-toggle--mobile" : ""}`}
      type="button"
      aria-label={`Turn ${enabled ? "off" : "on"} visual effects`}
      aria-pressed={enabled}
      title="Interactive background and virus intro on refresh"
      onClick={() => setEffectsEnabled(!enabled)}
    >
      <Sparkles aria-hidden="true" />
      <span>Effects {enabled ? "on" : "off"}</span>
    </button>
  );
}
