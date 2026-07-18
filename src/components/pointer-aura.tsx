"use client";

import { useEffect, useRef } from "react";

export function PointerAura() {
  const auraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const aura = auraRef.current;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame: number | null = null;

    if (!aura || !finePointer.matches || reduceMotion.matches) return;

    const moveAura = (event: PointerEvent) => {
      if (frame !== null) cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        aura.style.setProperty("--aura-x", `${event.clientX}px`);
        aura.style.setProperty("--aura-y", `${event.clientY}px`);
        aura.dataset.visible = "true";
      });
    };

    const hideAura = () => {
      aura.dataset.visible = "false";
    };

    window.addEventListener("pointermove", moveAura, { passive: true });
    document.documentElement.addEventListener("mouseleave", hideAura);

    return () => {
      window.removeEventListener("pointermove", moveAura);
      document.documentElement.removeEventListener("mouseleave", hideAura);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={auraRef} className="pointer-aura" aria-hidden="true" />;
}
