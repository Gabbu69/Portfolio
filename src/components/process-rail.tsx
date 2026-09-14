"use client";

import { Pause, Play } from "lucide-react";
import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const steps = [
  { jp: "観察", label: "Observe" }, { jp: "設計", label: "Design" },
  { jp: "構築", label: "Build" }, { jp: "検証", label: "Test" }, { jp: "改善", label: "Refine" },
];

export function ProcessRail() {
  const railRef = useRef<HTMLDivElement>(null);
  const inView = useInView(railRef);
  const reduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const sync = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);
  return (
    <div className="process-rail" ref={railRef} aria-label="Gabriel’s working process">
      <div className="process-rail__track" style={{ animationPlayState: paused || !inView || !visible || reduceMotion ? "paused" : "running" }}>
        {[0, 1].map((copy) => <div className="process-rail__set" aria-hidden={copy === 1} key={copy}>
          {steps.map((step, index) => <span className="process-rail__step" key={step.label}><span lang="ja">{step.jp}</span><b>{step.label}</b><i>{String(index + 1).padStart(2, "0")}</i></span>)}
        </div>)}
      </div>
      <button className="process-rail__control" type="button" onClick={() => setPaused(!paused)} aria-label={paused ? "Play process animation" : "Pause process animation"} aria-pressed={paused}>
        {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
      </button>
    </div>
  );
}
