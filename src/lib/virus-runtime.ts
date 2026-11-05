import type { createChoreography as choreograph, clamp as clampValue, sampleVirusCrawl } from "./virus-animation";
import type { PaintTarget, PaintPoint } from "./virus-animation";
import type { createVirusPainter } from "./virus-creature";

declare global {
  interface Window {
    __gabVirus?: { pathname: string; navigate: (path: string) => void };
  }
}

/** Self-contained so this small engine can start before the React bundle. */
export function installVirusRuntime(
  createChoreography: typeof choreograph,
  clamp: typeof clampValue,
  sampleCrawl: typeof sampleVirusCrawl,
  makeCreature: (image: HTMLImageElement) => ReturnType<typeof createVirusPainter>,
  config: { INTRO_LIMIT: number; REVEAL_SESSION_KEY: string },
) {
  const { INTRO_LIMIT, REVEAL_SESSION_KEY } = config;
  const canPlayIntro = ({ path, hash, restored, reduced, seen, reload }: {
    path: string; hash: string; restored: boolean; reduced: boolean; seen: boolean; reload: boolean;
  }) => (path === "/" || (reload && path.startsWith("/projects/"))) &&
    (reload || (!hash && !restored)) && !reduced && !seen;
  const completed = new Set<string>();
  let introConsumed = false;
  let spritePromise: Promise<HTMLImageElement> | undefined;
  let creature: ReturnType<typeof createVirusPainter> | undefined;

  function loadSprite() {
    return spritePromise ??= new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      // This 320px sprite is ready for drawImage after load. Waiting for decode()
      // can defer startup behind a whole React hydration task on slower CPUs.
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = "/images/virus-spider.webp";
    });
  }

  type Scene = ReturnType<typeof createChoreography> & {
    element: HTMLElement | null;
    key: string;
    start: number;
    width: number;
    height: number;
    intro: boolean;
  };

  function mount(pathname: string) {
    const root = document.documentElement;
    const isReload = (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type === "reload";
    const canvas = document.querySelector<HTMLCanvasElement>(".virus-canvas");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const effectsEnabled = () => root.dataset.effects ? root.dataset.effects === "on" : !motion.matches;
    let disposed = false;
    let frame = 0;
    let observer: IntersectionObserver | undefined;
    let mutations: MutationObserver | undefined;
    let deadline = 0;
    let scenes: Scene[] = [];
    let width = innerWidth;
    let height = innerHeight;
    let intro = false;
    let batch = 0;
    const pending = new Set<HTMLElement>();
    const observed = new WeakSet<HTMLElement>();

    function clearIntro() {
      delete root.dataset.virusIntro;
      delete root.dataset.virusStart;
    }

    if (pathname !== "/" && !(isReload && pathname.startsWith("/projects/"))) clearIntro();

    let context: CanvasRenderingContext2D | null = null;
    try { context = canvas?.getContext("2d", { alpha: true }) ?? null; } catch { /* Fail open. */ }
    if (!canvas || !context || !effectsEnabled() || !window.IntersectionObserver) {
      clearIntro();
      return;
    }
    const ctx = context;
    const surface = canvas;
    const mobile = width < 700;

    try {
      const saved: unknown = JSON.parse(sessionStorage.getItem(REVEAL_SESSION_KEY) || "[]");
      if (Array.isArray(saved)) for (const key of saved) if (typeof key === "string") completed.add(key);
    } catch { /* The module Set is the fallback when storage is blocked. */ }

    function keyFor(element: HTMLElement) { return `${pathname}:${element.dataset.virusReveal}`; }

    function remember(key: string) {
      completed.add(key);
      try { sessionStorage.setItem(REVEAL_SESSION_KEY, JSON.stringify([...completed])); } catch { /* In-memory fallback. */ }
    }

    function visible(element: HTMLElement) {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < height && rect.right > 0 && rect.left < width;
    }

    function paintTargets(scope: HTMLElement, originX: number, originY: number): PaintTarget[] {
      const targets: PaintTarget[] = [];
      const backgrounds = new Map<Element, string>();
      const styles = new Map<Element, CSSStyleDeclaration>();
      const styleOf = (element: Element) => {
        let style = styles.get(element);
        if (!style) { style = getComputedStyle(element); styles.set(element, style); }
        return style;
      };
      const backgroundOf = (element: Element): string => {
        const cached = backgrounds.get(element);
        if (cached) return cached;
        const color = styleOf(element).backgroundColor;
        const result = color && color !== "transparent" && color !== "rgba(0, 0, 0, 0)"
          ? color : element.parentElement ? backgroundOf(element.parentElement) : getComputedStyle(root).getPropertyValue("--paper").trim() || "#181917";
        backgrounds.set(element, result);
        return result;
      };
      const inView = (rect: DOMRect) => rect.width > .5 && rect.height > 2 && rect.right > 0 && rect.left < width && rect.bottom > 0 && rect.top < height;

      // Different workers paint different patches of each real image. The DOM
      // image remains underneath, so newly painted pixels retain its true colors.
      const images = scope.matches("img") ? [scope as HTMLImageElement] : Array.from(scope.querySelectorAll<HTMLImageElement>("img"));
      for (const picture of images) {
        const bounds = picture.getBoundingClientRect();
        if (!inView(bounds) || bounds.width < 40 || bounds.height < 40 || styleOf(picture).visibility === "hidden") continue;
        const columns = bounds.width > 180 ? 4 : 2;
        const rows = bounds.height > 180 ? 3 : 2;
        const cell = Math.max(5, Math.ceil(Math.sqrt(bounds.width * bounds.height / 1150)));
        for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) {
          const patchWidth = bounds.width / columns;
          const patchHeight = bounds.height / rows;
          const points: PaintPoint[] = [];
          let line = 0;
          for (let y = 0; y < patchHeight; y += cell, line++) {
            const cells: PaintPoint[] = [];
            for (let x = 0; x < patchWidth; x += cell) cells.push({ x, y, width: Math.min(cell, patchWidth - x), height: Math.min(cell, patchHeight - y) });
            points.push(...(line % 2 ? cells.reverse() : cells));
          }
          targets.push({ x: bounds.left - originX + column * patchWidth, y: bounds.top - originY + row * patchHeight,
            width: patchWidth, height: patchHeight, kind: "image", background: backgroundOf(picture), priority: 0, points });
        }
      }

      const nodes: { node: Text; element: HTMLElement; priority: number }[] = [];
      const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const element = node.parentElement;
        if (!element || !node.textContent?.trim() || element.closest("script,style,svg,textarea,input,select,option,.virus-boot,dialog")) continue;
        const bounds = element.getBoundingClientRect();
        if (!inView(bounds) || styleOf(element).visibility === "hidden" || styleOf(element).display === "none") continue;
        nodes.push({ node: node as Text, element, priority: element.closest("h1,h2,h3") ? 0 : 2 });
      }
      nodes.sort((a, b) => a.priority - b.priority);
      const raster = document.createElement("canvas");
      const ink = raster.getContext("2d", { willReadFrequently: true });
      if (!ink) return targets;
      const range = document.createRange();
      let letters = 0;
      for (const { node, element, priority } of nodes) {
        const style = styleOf(element);
        const size = parseFloat(style.fontSize);
        const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        let offset = 0;
        for (const character of node.data) {
          const start = offset;
          offset += character.length;
          if (!character.trim() || letters >= (mobile ? 280 : 440)) continue;
          range.setStart(node, start);
          range.setEnd(node, offset);
          const bounds = range.getBoundingClientRect();
          if (!inView(bounds)) continue;
          const glyph = style.textTransform === "uppercase" ? character.toUpperCase() : style.textTransform === "lowercase" ? character.toLowerCase() : character;
          raster.width = Math.max(1, Math.ceil(bounds.width));
          raster.height = Math.max(1, Math.ceil(bounds.height));
          ink.font = font;
          ink.textBaseline = "alphabetic";
          const metrics = ink.measureText(glyph);
          const ascent = metrics.fontBoundingBoxAscent ?? size * .8;
          const descent = metrics.fontBoundingBoxDescent ?? size * .2;
          const spacing = parseFloat(style.letterSpacing) || 0;
          const scaleX = metrics.width > 0 ? Math.min(1.25, Math.max(.6, (bounds.width - spacing) / metrics.width)) : 1;
          ink.setTransform(scaleX, 0, 0, 1, 0, 0);
          ink.fillStyle = "#fff";
          ink.fillText(glyph, 0, (bounds.height - ascent - descent) / 2 + ascent);
          const pixels = ink.getImageData(0, 0, raster.width, raster.height).data;
          const cell = Math.max(3, Math.ceil(size / 14));
          const points: PaintPoint[] = [];
          let line = 0;
          for (let y = 0; y < raster.height; y += cell, line++) {
            const cells: PaintPoint[] = [];
            for (let x = 0; x < raster.width; x += cell) {
              const cellWidth = Math.min(cell, raster.width - x);
              const cellHeight = Math.min(cell, raster.height - y);
              let painted = false;
              for (let py = y; py < y + cellHeight && !painted; py += 2) for (let px = x; px < x + cellWidth; px += 2) {
                if (pixels[(py * raster.width + px) * 4 + 3] > 40) { painted = true; break; }
              }
              if (painted) cells.push({ x, y, width: Math.min(cellWidth, bounds.width - x), height: Math.min(cellHeight, bounds.height - y) });
            }
            points.push(...(line % 2 ? cells.reverse() : cells));
          }
          if (!points.length) continue;
          targets.push({ x: bounds.left - originX, y: bounds.top - originY, width: bounds.width, height: bounds.height,
            kind: "letter", background: backgroundOf(element), priority, points });
          letters++;
        }
      }
      return targets;
    }

    function choreography(element: HTMLElement | null, fullIntro: boolean) {
      const started = performance.now();
      const rect = element?.getBoundingClientRect();
      const sceneWidth = rect?.width ?? width;
      const sceneHeight = rect?.height ?? height;
      const result = createChoreography(sceneWidth, sceneHeight, fullIntro, mobile,
        paintTargets(element ?? document.body, rect?.left ?? 0, rect?.top ?? 0));
      performance.measure("virus:prepare-painting", { start: started, end: performance.now() });
      surface.dataset.virusPaintCells = String(result.tiles.length);
      return result;
    }

    function finish(scene: Scene, now: number) {
      remember(scene.key);
      if (scene.intro) {
        intro = false;
        delete surface.dataset.virusStage;
        surface.style.removeProperty("--virus-time-left");
        clearIntro();
        window.clearTimeout(deadline);
        performance.measure("virus:intro", { start: scene.start, end: now });
        for (const element of document.querySelectorAll<HTMLElement>("[data-virus-reveal]")) {
          if (visible(element)) { remember(keyFor(element)); pending.delete(element); }
        }
      } else performance.measure("virus:section", { start: scene.start, end: now });
    }

    function clear() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      const now = performance.now();
      for (const scene of scenes) finish(scene, now);
      scenes = [];
      ctx.clearRect(0, 0, width, height);
      surface.dataset.virusScenes = "0";
      delete surface.dataset.virusStage;
      surface.style.removeProperty("animation");
      clearIntro();
    }

    function resize() {
      clear();
      width = innerWidth;
      height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      surface.width = Math.round(width * dpr);
      surface.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function queue() {
      if (!disposed && !frame && !document.hidden && effectsEnabled()) frame = requestAnimationFrame(draw);
    }

    function startPending(now: number) {
      // Start groups in pairs so one CSS deadline protects the entire batch.
      if (intro || scenes.length) return;
      for (const element of pending) {
        const key = keyFor(element);
        if (!element.isConnected || completed.has(key)) { pending.delete(element); continue; }
        if (scenes.length >= 2) break;
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height || rect.top >= height - 24 || rect.bottom <= 0) continue;
        // Only the viewport-sized piece needs pixels, including very tall cards.
        const artwork = choreography(element, false);
        if (!artwork.paths.length) { remember(key); pending.delete(element); continue; }
        scenes.push({ ...artwork, element, key, start: now, intro: false });
        pending.delete(element);
        // Reserve immediately, so re-mounted filter results cannot queue twice.
        remember(key);
        performance.mark("virus:section-start");
      }
      if (scenes.length) {
        surface.dataset.virusStage = "section";
        // Alternate names to restart the CSS clock without forced layout.
        surface.style.animation = `virus-section-expire-${batch++ % 2 ? "a" : "b"} ${scenes[0].duration}ms step-end forwards`;
      }
    }

    function paint(scene: Scene, now: number) {
      const elapsed = now - scene.start;
      const rect = scene.element?.getBoundingClientRect();
      const x = rect?.left ?? 0;
      const y = rect?.top ?? 0;
      const headerBottom = rect ? (document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0) : 0;
      const left = Math.max(0, x);
      const top = Math.max(0, y, headerBottom);
      const right = Math.min(width, rect?.right ?? width);
      const bottom = Math.min(height, rect?.bottom ?? height);
      if (right <= left || bottom <= top) return;
      const fade = clamp((scene.duration - elapsed) / (scene.intro ? 350 : 180));
      ctx.save();
      ctx.beginPath();
      ctx.rect(left, top, right - left, bottom - top);
      ctx.clip();
      ctx.translate(x, y);

      // Each letter and photo patch has its own paper-colored mask. Only the
      // cells actually reached by its worker's brush become visible underneath.
      for (const mask of scene.masks) {
        if (elapsed >= mask.end + 40) continue;
        ctx.globalAlpha = clamp((mask.end + 40 - elapsed) / 40);
        ctx.fillStyle = mask.background;
        ctx.fillRect(mask.x, mask.y, mask.width, mask.height);
      }
      for (const tile of scene.tiles) {
        if (elapsed < tile.at || elapsed >= scene.masks[tile.target].end + 40) continue;
        ctx.clearRect(tile.x, tile.y, tile.width + .25, tile.height + .25);
      }
      const wetTime = scene.intro ? 180 : 100;
      for (const tile of scene.tiles) {
        const age = elapsed - tile.at;
        if (age < 0 || age > wetTime) continue;
        const picture = scene.masks[tile.target].kind === "image";
        ctx.globalAlpha = (1 - age / wetTime) * (picture ? .28 : .8) * fade;
        ctx.fillStyle = "#93ff62";
        ctx.fillRect(tile.x, tile.y, tile.width, tile.height);
        if (picture) {
          ctx.globalAlpha *= 1.8;
          ctx.strokeStyle = "#b8ff8b";
          ctx.strokeRect(tile.x + .5, tile.y + .5, Math.max(0, tile.width - 1), Math.max(0, tile.height - 1));
        }
      }
      ctx.restore();
      ctx.save();
      // Feet may step beyond a short heading's box; keep the entire creature
      // visible while the content masks remain confined to their own group.
      ctx.beginPath(); ctx.rect(0, headerBottom, width, height - headerBottom); ctx.clip();
      ctx.translate(x, y);
      for (let worker = 0; worker < scene.paths.length; worker++) {
        const path = scene.paths[worker];
        const progress = (elapsed - path.delay) / path.travel;
        if (progress < 0 || progress > 1) continue;
        const distance = progress * path.length;
        let low = 0;
        let high = path.points.length - 1;
        while (low < high) {
          const middle = (low + high) >> 1;
          if (path.points[middle].distance < distance) low = middle + 1;
          else high = middle;
        }
        const next = path.points[low];
        const previous = path.points[Math.max(0, low - 1)];
        const fraction = clamp((distance - previous.distance) / Math.max(1, next.distance - previous.distance));
        const px = previous.x + (next.x - previous.x) * fraction;
        const py = previous.y + (next.y - previous.y) * fraction;
        const crawl = sampleCrawl(path, progress);
        const vx = crawl.x, vy = crawl.y, angle = crawl.angle;
        const emitterX = vx + Math.cos(angle) * path.size * .22;
        const emitterY = vy + Math.sin(angle) * path.size * .22;
        const opacity = fade * Math.min(1, progress * 22) * Math.min(1, (1 - progress) * 20);

        // A gently flexing beam carries moving packets from the jaws to the
        // exact painted pixel. The tip stays locked to the real brush route.
        const bend = Math.sin(elapsed / 180 + worker) * 2.4;
        const controlX = (emitterX + px) / 2 - Math.sin(angle) * bend;
        const controlY = (emitterY + py) / 2 + Math.cos(angle) * bend;
        const energy = .92 + Math.sin(elapsed / 240 + worker * 1.9) * .08;
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(emitterX, emitterY); ctx.quadraticCurveTo(controlX, controlY, px, py);
        ctx.strokeStyle = "#51ef38";
        ctx.globalAlpha = opacity * .12 * energy;
        ctx.lineWidth = 9;
        ctx.stroke();
        ctx.globalAlpha = opacity * .55 * energy;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.strokeStyle = "#e5ffd7";
        ctx.globalAlpha = opacity * .95;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 8]);
        ctx.lineDashOffset = -(elapsed * .065 + worker * 3);
        ctx.stroke();
        ctx.setLineDash([]);
        for (let packet = 0; packet < 3; packet++) {
          const t = (elapsed / 420 + worker * .137 + packet / 3) % 1;
          const inverse = 1 - t;
          const bx = inverse * inverse * emitterX + 2 * inverse * t * controlX + t * t * px;
          const by = inverse * inverse * emitterY + 2 * inverse * t * controlY + t * t * py;
          ctx.globalAlpha = opacity * .85;
          ctx.fillStyle = "#efffe7";
          ctx.beginPath(); ctx.arc(bx, by, 1.25, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = opacity * .18;
        ctx.fillStyle = "#93ff62";
        ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill();
        creature!.draw(ctx, vx, vy, path.size, angle, crawl.travelled, worker, opacity);
        ctx.globalAlpha = opacity * .6;
        ctx.strokeStyle = "#93ff62";
        ctx.lineWidth = 1.2;
        const scan = elapsed / 160 + worker;
        ctx.beginPath(); ctx.arc(px, py, 4.5, scan, scan + Math.PI * 1.35); ctx.stroke();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = "#dfffcd";
        ctx.fillRect(px - 1.25, py - 1.25, 2.5, 2.5);
        ctx.fillStyle = "#93ff62";
        for (let speck = 1; speck <= 3; speck++) {
          const life = (elapsed / 340 + speck / 3 + worker * .17) % 1;
          ctx.globalAlpha = opacity * (1 - life) * .65;
          const sparkAngle = angle + (speck - 2) * 1.1 + Math.sin(elapsed / 400) * .3;
          const spread = 3 + life * 12;
          ctx.fillRect(px + Math.cos(sparkAngle) * spread, py + Math.sin(sparkAngle) * spread, 2, 2);
        }
      }
      ctx.restore();
    }

    function draw(now: number) {
      frame = 0;
      try {
        ctx.clearRect(0, 0, width, height);
        const alive: Scene[] = [];
        for (const scene of scenes) {
          if (now - scene.start >= scene.duration || (scene.element && (!scene.element.isConnected || !visible(scene.element)))) finish(scene, now);
          else alive.push(scene);
        }
        scenes = alive;
        if (!scenes.length && surface.dataset.virusStage === "section") {
          delete surface.dataset.virusStage;
          surface.style.removeProperty("animation");
        }
        startPending(now);
        for (const scene of scenes) paint(scene, now);
        surface.dataset.virusScenes = String(scenes.length);
        if (scenes.length) queue();
      } catch {
        clear();
        observer?.disconnect();
        mutations?.disconnect();
        delete root.dataset.virusEnabled;
      }
    }

    function discover() {
      for (const element of document.querySelectorAll<HTMLElement>("[data-virus-reveal]")) {
        if (!observed.has(element) && !completed.has(keyFor(element))) {
          observed.add(element);
          observer?.observe(element);
        }
      }
    }

    function dismiss() {
      clear();
      // Never start another cover on the control the visitor is using.
      for (const element of pending) if (visible(element)) { remember(keyFor(element)); pending.delete(element); }
    }

    function onVisibility() { if (document.hidden) dismiss(); }
    function onMotion() {
      if (!effectsEnabled()) { dismiss(); observer?.disconnect(); mutations?.disconnect(); }
    }

    // Size before decoding without dismissing the bootstrap cover.
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    surface.width = Math.round(width * dpr);
    surface.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Trace the settled web-font shapes, so a late font swap cannot move a
    // letter away from the virus painting it. The cover still expires on time.
    loadSprite().then(decoded => document.fonts.ready.then(() => decoded)).then((decoded) => {
      if (disposed) return;
      if (!effectsEnabled() || document.hidden) { clearIntro(); return; }
      performance.mark("virus:creature-start");
      creature ??= makeCreature(decoded);
      performance.measure("virus:prepare-creature", "virus:creature-start");
      surface.dataset.virusRigFrames = String(creature.frames);
      root.dataset.virusEnabled = "true";
      const bootAt = Number(root.dataset.virusStart);
      const now = performance.now();
      intro = Boolean(root.dataset.virusIntro) && Number.isFinite(bootAt) && now - bootAt < 850 &&
        canPlayIntro({ path: pathname, hash: location.hash, restored: scrollY > 0,
          reduced: !effectsEnabled(), seen: introConsumed, reload: isReload });
      if (intro) {
        introConsumed = true;
        root.dataset.virusAssembled = "true";
        const artwork = choreography(null, true);
        if (!artwork.paths.length) { intro = false; clearIntro(); return; }
        scenes.push({ ...artwork, element: null, key: "intro", start: bootAt, intro: true });
        surface.dataset.virusLetters = String(artwork.masks.filter(mask => mask.kind === "letter").length);
        surface.dataset.virusImagePatches = String(artwork.masks.filter(mask => mask.kind === "image").length);
        const readyAt = performance.now();
        // A compositor-side expiry also hides a stale frame if the main thread
        // is busy at the deadline. Leave two frames for style activation.
        surface.style.setProperty("--virus-time-left", `${Math.max(0, INTRO_LIMIT - (readyAt - bootAt) - 32)}ms`);
        surface.dataset.virusStage = "intro";
        // Paint the canvas before making the independent CSS cover transparent.
        paint(scenes[0], readyAt);
        root.dataset.virusIntro = "drawing";
        deadline = window.setTimeout(dismiss, Math.max(0, INTRO_LIMIT - (readyAt - bootAt)));
      } else {
        clearIntro();
        // Do not cover content that was already visible while JS/image loaded.
        for (const element of document.querySelectorAll<HTMLElement>("[data-virus-reveal]")) {
          if (visible(element)) remember(keyFor(element));
        }
      }
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          if (entry.isIntersecting) pending.add(element);
          else pending.delete(element);
        }
        queue();
      }, { rootMargin: "0px 0px 80px 0px" });
      // Filters may mount fresh cards; observe only child-list changes, not styles.
      mutations = new MutationObserver(discover);
      mutations.observe(document.body, { childList: true, subtree: true });
      discover();
      queue();
    }).catch(() => { if (!disposed) clear(); });

    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("keydown", dismiss);
    window.addEventListener("pointerdown", dismiss, { passive: true });
    window.addEventListener("pagehide", dismiss);
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", onMotion);
    return () => {
      disposed = true;
      clear();
      window.clearTimeout(deadline);
      observer?.disconnect();
      mutations?.disconnect();
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("pagehide", dismiss);
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", onMotion);
    };
  }

  let cleanup: (() => void) | undefined;
  window.__gabVirus = {
    pathname: "",
    navigate(path) {
      if (!document.querySelector(".virus-canvas")) return;
      if (window.__gabVirus!.pathname === path) return;
      cleanup?.();
      window.__gabVirus!.pathname = path;
      cleanup = mount(path);
    },
  };
  window.addEventListener("portfolio:effects-change", () => {
    cleanup?.();
    cleanup = undefined;
    window.__gabVirus!.pathname = "";
    window.__gabVirus!.navigate(location.pathname);
  });
  // The head script runs before the body. Start as soon as its first canvas is
  // parsed instead of waiting for DOMContentLoaded or React hydration.
  if (document.querySelector(".virus-canvas")) window.__gabVirus.navigate(location.pathname);
  else {
    const ready = new MutationObserver(() => {
      if (document.querySelector(".virus-canvas")) {
        ready.disconnect();
        window.__gabVirus!.navigate(location.pathname);
      }
    });
    ready.observe(document.documentElement, { childList: true, subtree: true });
  }
}
