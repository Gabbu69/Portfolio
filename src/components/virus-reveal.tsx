"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** The canvas engine starts before hydration; React coordinates route changes. */
export function VirusReveal() {
  const pathname = usePathname();
  useEffect(() => { window.__gabVirus?.navigate(pathname); }, [pathname]);

  return (
    <>
      <canvas className="virus-canvas" aria-hidden="true" suppressHydrationWarning />
      <div className="virus-boot" aria-hidden="true" />
    </>
  );
}
