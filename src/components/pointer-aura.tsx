"use client";

import { useEffect, useRef } from "react";

export function PointerAura() {
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const root = document.documentElement;

    const handlePointerMove = (event: PointerEvent) => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);

      frame.current = requestAnimationFrame(() => {
        root.style.setProperty("--pointer-x", `${event.clientX}px`);
        root.style.setProperty("--pointer-y", `${event.clientY}px`);
      });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  return null;
}
