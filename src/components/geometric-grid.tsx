"use client";

import { useEffect, useRef } from "react";

type Cell = { x: number; y: number; energy: number; variant: number; quiet: number };
type GeometricGridProps = { className: string; textSelector: string; intensity?: number };

const smoothstep = (value: number) => {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
};

/** A decorative ink grid; pointer movement never updates React state. */
export function GeometricGrid({ className, textSelector, intensity = 1 }: GeometricGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Own and clean up the browser drawing system as documented by React:
  // https://react.dev/reference/react/useEffect#connecting-to-an-external-system
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    const context = canvas?.getContext("2d");
    if (!canvas || !container || !context) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");
    let cells: Cell[] = [];
    let width = 0;
    let height = 0;
    let frame: number | null = null;
    let lastTime = 0;
    let visible = true;
    let disposed = false;
    let restingColor = "";
    let accentColor = "";
    let secondaryColor = "";
    const pointer = { x: 0, y: 0, active: false };

    const canAnimate = () => !motion.matches && finePointer.matches && visible && !document.hidden;

    function draw(time: number) {
      frame = null;
      // Time-based easing keeps the same feel on 60 Hz and high-refresh displays.
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
      const delta = Math.min(time - lastTime || 16, 64);
      lastTime = time;
      const interactive = canAnimate();
      const radius = Math.min(200, width * 0.3);
      let unsettled = false;
      context!.clearRect(0, 0, width, height);

      for (const cell of cells) {
        const distance = Math.hypot(cell.x - pointer.x, cell.y - pointer.y);
        const target = interactive && pointer.active ? smoothstep(1 - distance / radius) : 0;
        const difference = target - cell.energy;
        cell.energy += difference * (1 - Math.exp(-delta / (difference > 0 ? 95 : 260)));
        if (Math.abs(target - cell.energy) < 0.001) cell.energy = target;
        else unsettled = true;

        const energy = cell.energy;
        const size = 1.05 + energy * 3.05;
        const edge = smoothstep(Math.min(cell.y / 60, (height - cell.y) / 80));
        const opacity = (0.17 + energy * 0.6) * cell.quiet * edge * intensity;
        if (opacity < 0.004) continue;

        context!.save();
        context!.translate(cell.x, cell.y);
        context!.rotate(energy * (cell.variant % 2 === 0 ? Math.PI / 4 : -Math.PI / 4));
        context!.globalAlpha = opacity;
        context!.lineWidth = 0.65 + energy * 0.2;
        context!.strokeStyle = restingColor;
        context!.beginPath();

        // Most of the denser grid stays at rest: draw those circles directly.
        if (energy === 0) {
          context!.arc(0, 0, size, 0, Math.PI * 2);
        } else for (let point = 0; point < 32; point++) {
          const angle = (point / 32) * Math.PI * 2;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const shapeRadius = cell.variant % 3 === 0
            ? 1 / Math.max(Math.abs(cos), Math.abs(sin))
            : cell.variant % 3 === 1
              ? 1 / (Math.abs(cos) + Math.abs(sin))
              : 0.72 + 0.28 * Math.cos(4 * angle);
          const r = size * (1 + (shapeRadius - 1) * energy);
          if (point === 0) context!.moveTo(cos * r, sin * r);
          else context!.lineTo(cos * r, sin * r);
        }

        context!.closePath();
        context!.stroke();
        if (energy > 0) {
          context!.globalAlpha = opacity * energy;
          context!.strokeStyle = cell.variant % 3 === 0 ? secondaryColor : accentColor;
          context!.stroke();
          context!.globalAlpha = opacity * energy * 0.15;
          context!.fillStyle = context!.strokeStyle;
          context!.fill();
        }
        context!.restore();
      }

      // No perpetual idle loop: render again only while shapes are settling.
      if (unsettled && interactive) frame = requestAnimationFrame(draw);
    }

    function requestDraw() {
      if (!disposed && frame === null && visible && !document.hidden) {
        lastTime = performance.now();
        frame = requestAnimationFrame(draw);
      }
    }

    function measure() {
      const bounds = container!.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * scale);
      canvas!.height = Math.round(height * scale);
      context!.setTransform(scale, 0, 0, scale, 0, 0);

      const styles = getComputedStyle(container!);
      restingColor = styles.getPropertyValue("--grid-resting").trim() || styles.getPropertyValue("--muted").trim();
      accentColor = styles.getPropertyValue("--grid-accent").trim() || styles.getPropertyValue("--red").trim();
      secondaryColor = styles.getPropertyValue("--grid-secondary").trim();

      const textRects: { left: number; right: number; top: number; bottom: number }[] = [];
      for (const copy of container!.querySelectorAll<HTMLElement>(textSelector)) {
        // Fade around rendered text lines, never the empty area of a grid column.
        // https://developer.mozilla.org/en-US/docs/Web/API/Range/getClientRects
        const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT);
        const range = document.createRange();
        let node = walker.nextNode();
        while (node) {
          if (node.textContent?.trim()) {
            range.selectNodeContents(node);
            for (const rect of range.getClientRects()) {
              if (rect.width && rect.height) {
                textRects.push({ left: rect.left - bounds.left, right: rect.right - bounds.left,
                  top: rect.top - bounds.top, bottom: rect.bottom - bounds.top });
              }
            }
          }
          node = walker.nextNode();
        }
      }

      const spacing = width < 600 ? 18 : 20;
      const columns = Math.floor(width / spacing);
      const offset = (width - columns * spacing) / 2;
      cells = [];
      for (let row = 0; row * spacing < height; row++) {
        for (let col = 0; col <= columns; col++) {
          const x = offset + col * spacing;
          const y = 16 + row * spacing;
          let quiet = 1;
          for (const rect of textRects) {
            const distance = Math.hypot(Math.max(rect.left - x, 0, x - rect.right),
              Math.max(rect.top - y, 0, y - rect.bottom));
            quiet = Math.min(quiet, 0.06 + 0.94 * smoothstep(distance / 28));
          }
          cells.push({ x, y, energy: 0, variant: (col * 7 + row * 11) % 6, quiet });
        }
      }
      requestDraw();
    }

    function move(event: PointerEvent) {
      if (event.pointerType === "touch" || !canAnimate()) return;
      const bounds = container!.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.active = true;
      requestDraw();
    }

    function leave() {
      pointer.active = false;
      requestDraw();
    }

    function reset() {
      pointer.active = false;
      for (const cell of cells) cell.energy = 0;
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      requestDraw();
    }

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(container);
    const themeObserver = new MutationObserver(measure);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      reset();
    });
    intersectionObserver.observe(container);
    container.addEventListener("pointermove", move, { passive: true });
    container.addEventListener("pointerleave", leave);
    container.addEventListener("pointercancel", leave);
    container.addEventListener("animationend", measure);
    window.addEventListener("blur", leave);
    window.addEventListener("scroll", leave, { passive: true });
    document.addEventListener("visibilitychange", reset);
    motion.addEventListener("change", reset);
    finePointer.addEventListener("change", reset);
    // Remeasure the text protection after web fonts have settled.
    void document.fonts.ready.then(() => { if (!disposed) measure(); });
    measure();

    return () => {
      disposed = true;
      if (frame !== null) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      intersectionObserver.disconnect();
      container.removeEventListener("pointermove", move);
      container.removeEventListener("pointerleave", leave);
      container.removeEventListener("pointercancel", leave);
      container.removeEventListener("animationend", measure);
      window.removeEventListener("blur", leave);
      window.removeEventListener("scroll", leave);
      document.removeEventListener("visibilitychange", reset);
      motion.removeEventListener("change", reset);
      finePointer.removeEventListener("change", reset);
    };
  }, [textSelector, intensity]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
