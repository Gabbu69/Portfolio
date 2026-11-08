"use client";

import { useEffect, useRef } from "react";
import { getEffectsEnabled } from "@/lib/effects-preference";

type Cell = { x: number; y: number; energy: number; variant: number; quiet: number };
type GeometricGridProps = { className: string; textSelector: string; intensity?: number };

const smoothstep = (value: number) => {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
};

/** A reactive ASCII field; pointer movement never updates React state. */
export function GeometricGrid({ className, textSelector, intensity = 1 }: GeometricGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Own and clean up the browser drawing system as documented by React:
  // https://react.dev/reference/react/useEffect#connecting-to-an-external-system
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    const context = canvas?.getContext("2d");
    if (!canvas || !container || !context) return;

    const field=document.createElement("canvas");
    const fieldInk=field.getContext("2d");
    if(!fieldInk)return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cells: Cell[] = [];
    let width = 0;
    let height = 0;
    let frame: number | null = null;
    let lastTime = 0;
    let lastPaint = 0;
    let visible = true;
    let disposed = false;
    let restingColor = "";
    let accentColor = "";
    let secondaryColor = "";
    const pointer = { x: 0, y: 0, active: false };

    const canAnimate = () => getEffectsEnabled() && visible && !document.hidden;

    function draw(time: number) {
      frame=null;
      const interactive=canAnimate();
      if(interactive&&time-lastPaint<45){frame=requestAnimationFrame(draw);return;}
      lastPaint=time;
      const delta=Math.min(time-lastTime||45,90);lastTime=time;
      const radius=Math.min(210,width*.4);
      context!.clearRect(0,0,width,height);
      context!.globalAlpha=1;context!.drawImage(field,0,0,width,height);
      context!.textAlign="center";context!.textBaseline="middle";
      const alphabet="01:<>/\\+*#@";
      for(const cell of cells){
        const distance=Math.hypot(cell.x-pointer.x,cell.y-pointer.y);
        const target=interactive&&pointer.active?smoothstep(1-distance/radius):0;
        cell.energy+=(target-cell.energy)*(1-Math.exp(-delta/(target>cell.energy?90:300)));
        if(Math.abs(target-cell.energy)<.002)cell.energy=target;
        const column=Math.round(cell.x/20);
        const head=(time*(.028+(column%5)*.006)+column*97)%height;
        const trail=(cell.y-head+height)%height;
        const rain=interactive&&column%3!==1?Math.max(0,1-trail/(width<600?90:130)):0;
        const energy=cell.energy;
        if(energy<.005&&rain<=0)continue;
        const edge=smoothstep(Math.min(cell.y/40,(height-cell.y)/55));
        context!.globalAlpha=Math.min(.85,energy*.72+rain*.52)*cell.quiet*edge*intensity;
        const index=Math.floor(time/145+column*7+cell.variant+energy*9)%alphabet.length;
        const direction=Math.atan2(cell.y-pointer.y,cell.x-pointer.x);
        context!.font=`${Math.round((10+energy*4+rain*2)*2)/2}px monospace`;
        context!.fillStyle=rain>.8||energy>.75?secondaryColor:accentColor;
        context!.fillText(alphabet[index],cell.x+Math.cos(direction)*energy*11,cell.y+Math.sin(direction)*energy*11);
      }
      // Ambient code streams are capped near 22 fps; offscreen, hidden and
      // reduced-motion surfaces stop completely. The quiet grid is cached.
      if(interactive)frame=requestAnimationFrame(draw);
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
      const scale = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas!.width = Math.round(width * scale);
      canvas!.height = Math.round(height * scale);
      context!.setTransform(scale, 0, 0, scale, 0, 0);

      const styles = getComputedStyle(container!);
      restingColor = styles.getPropertyValue("--grid-resting").trim() || styles.getPropertyValue("--muted").trim();
      accentColor = document.documentElement.dataset.theme === "dark" ? "#93ff62" : "#34764a";
      secondaryColor = document.documentElement.dataset.theme === "dark" ? "#62e8d4" : "#286d77";

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
      field.width=canvas!.width;field.height=canvas!.height;
      fieldInk!.setTransform(scale,0,0,scale,0,0);
      fieldInk!.font="9px monospace";fieldInk!.textAlign="center";fieldInk!.textBaseline="middle";
      fieldInk!.fillStyle=restingColor;
      for(const cell of cells){
        const edge=smoothstep(Math.min(cell.y/60,(height-cell.y)/80));
        fieldInk!.globalAlpha=.17*cell.quiet*edge*intensity;
        fieldInk!.fillText(".:+01"[cell.variant%5],cell.x,cell.y);
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
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-effects"] });
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
    // Remeasure the text protection after web fonts have settled.
    void document.fonts.ready.then(() => { if (!disposed) measure(); });
    measure();

    return () => {
      disposed = true;
      if (frame !== null) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      field.width=0;field.height=0;
      intersectionObserver.disconnect();
      container.removeEventListener("pointermove", move);
      container.removeEventListener("pointerleave", leave);
      container.removeEventListener("pointercancel", leave);
      container.removeEventListener("animationend", measure);
      window.removeEventListener("blur", leave);
      window.removeEventListener("scroll", leave);
      document.removeEventListener("visibilitychange", reset);
      motion.removeEventListener("change", reset);
    };
  }, [textSelector, intensity]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
