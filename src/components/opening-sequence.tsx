"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

type OpeningSequenceProps = {
  initials: string;
  name: string;
};

export function OpeningSequence({ initials, name }: OpeningSequenceProps) {
  const reduceMotion = useReducedMotion();
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;

    const timer = window.setTimeout(() => setFinished(true), 1850);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  if (reduceMotion || finished) return null;

  return (
    <div className="opening-sequence" aria-hidden="true">
      <div className="opening-sequence__grid" />
      <span className="opening-sequence__rail opening-sequence__rail--horizontal" />
      <span className="opening-sequence__rail opening-sequence__rail--vertical" />
      <span className="opening-sequence__sun" />

      <div className="opening-sequence__seal">{initials}</div>
      <div className="opening-sequence__role">
        <span lang="ja">開発者</span>
        <small>Full-stack developer</small>
      </div>
      <strong className="opening-sequence__name">{name}</strong>
      <span className="opening-sequence__place">Kabacan / Cotabato</span>

      <span className="opening-sequence__panel opening-sequence__panel--top" />
      <span className="opening-sequence__panel opening-sequence__panel--bottom" />
    </div>
  );
}
