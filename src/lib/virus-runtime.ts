import type { createChoreography as choreograph, clamp as clampValue, sampleVirusCrawl } from "./virus-animation";
import type { PaintTarget, PaintPoint } from "./virus-animation";
import type { createVirusPainter } from "./virus-creature";
import type { sampleVirusDuel } from "./virus-duel";

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
  makeCreature: () => ReturnType<typeof createVirusPainter>,
  sampleDuel: typeof sampleVirusDuel,
  config: { INTRO_LIMIT: number; REVEAL_SESSION_KEY: string },
) {
  const { INTRO_LIMIT, REVEAL_SESSION_KEY } = config;
  const canPlayIntro = ({ path, hash, restored, reduced, seen, reload }: {
    path: string; hash: string; restored: boolean; reduced: boolean; seen: boolean; reload: boolean;
  }) => (path === "/" || (reload && path.startsWith("/projects/"))) &&
    (reload || ((!hash || hash === "#top") && !restored)) && !reduced && !seen;
  const completed = new Set<string>();
  let introConsumed = false;
  let openingPullConsumed = false;
  let creature: ReturnType<typeof createVirusPainter> | undefined;


  type Scene = ReturnType<typeof createChoreography> & {
    element: HTMLElement | null;
    key: string;
    start: number;
    width: number;
    height: number;
    intro: boolean;
    anchorX?: number;
    anchorY?: number;
    coveredKeys?: string[];
    decorative?: boolean;
    ordered?: ReturnType<typeof createChoreography>["tiles"];
    cursor?: number;
    wetCursor?: number;
    cover?: HTMLCanvasElement;
    buffer?: CanvasRenderingContext2D;
    coverBounds?: PaintPoint;
  };

  function mount(pathname: string) {
    const root = document.documentElement;
    const startupRequested=Boolean(root.dataset.virusIntro);
    const startupAt=Number(root.dataset.virusStart);
    const replayRequested=root.dataset.virusReplay==="true";
    let startupCanceled=false;
    const isReload = (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type === "reload";
    const canvas = document.querySelector<HTMLCanvasElement>(".virus-canvas");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const effectsEnabled = () => root.dataset.effects ? root.dataset.effects === "on" : !motion.matches;
    let disposed = false;
    let initialized = false;
    let frame = 0;
    let observer: IntersectionObserver | undefined;
    let mutations: MutationObserver | undefined;
    let deadline = 0;
    let scenes: Scene[] = [];
    let width = innerWidth;
    let height = innerHeight;
    let intro = false;
    let batch = 0;
    let pull: {
      start: number; from: number; hospital: number; contact: number;
      expected: number; seed: number;
      timing: { haul: number; solo: number; delivery: number };
      elapsed: number; lastNow: number; expiryAt: number;
      pose?: ReturnType<typeof sampleVirusDuel>;
      hospitalElement: Element | null; contactElement: Element | null; offset: number;
      headings: { x: number; y: number; width: number }[];
    } | undefined;
    let previousOverflowAnchor: string | undefined;
    let openingInterrupted = false;
    const pending = new Set<HTMLElement>();
    const observed = new WeakSet<HTMLElement>();

    function clearIntro() {
      delete root.dataset.virusIntro;
      delete root.dataset.virusStart;
      delete root.dataset.virusReplay;
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

    function paintTargets(scope: HTMLElement, fullIntro: boolean): PaintTarget[] {
      const bounds=scope.getBoundingClientRect();
      const top=fullIntro?(document.querySelector(".site-header")?.getBoundingClientRect().bottom??0):0;
      const introHeight=Math.max(height,(document.querySelector(".folio-hero")?.getBoundingClientRect().bottom??height)+80);
      const areaWidth=fullIntro?width:bounds.width, areaHeight=fullIntro?introHeight-top:bounds.height;
      if(areaWidth<=0||areaHeight<=0)return [];
      let element:Element|null=scope, background="";
      while(element){const color=getComputedStyle(element).backgroundColor;if(color&&color!=="transparent"&&color!=="rgba(0, 0, 0, 0)"){background=color;break;}element=element.parentElement;}
      background ||= getComputedStyle(root).getPropertyValue("--paper").trim();
      const columns=fullIntro?(mobile?6:8):(mobile?5:4),rows=fullIntro?(mobile?3:5):(mobile?1:2);
      const cell=Math.max(mobile?6:8,Math.ceil(Math.sqrt(areaWidth*areaHeight/(mobile?9000:18000))));
      const targets:PaintTarget[]=[];
      for(let row=0;row<rows;row++)for(let column=0;column<columns;column++){
        const patchWidth=areaWidth/columns,patchHeight=areaHeight/rows,points:PaintPoint[]=[];
        let line=0;
        for(let y=0;y<patchHeight;y+=cell,line++){
          const cells:PaintPoint[]=[];
          for(let x=0;x<patchWidth;x+=cell)cells.push({x,y,width:Math.min(cell,patchWidth-x),height:Math.min(cell,patchHeight-y)});
          points.push(...(line%2?cells.reverse():cells));
        }
        // A stable spatial scramble exposes individual pixels throughout the
        // patch, rather than turning synchronized scan rows into broad wipes.
        const rank=(point:PaintPoint)=>{let hash=Math.imul(Math.floor(point.x/cell)+column*97,0x9e3779b1)^Math.imul(Math.floor(point.y/cell)+row*83,0x85ebca6b);hash=Math.imul(hash^(hash>>>16),0x7feb352d);hash=Math.imul(hash^(hash>>>15),0x846ca68b);return(hash^(hash>>>16))>>>0;};
        points.sort((a,b)=>rank(a)-rank(b));
        targets.push({x:column*patchWidth,y:top+row*patchHeight,width:patchWidth,height:patchHeight,kind:"image",priority:0,background,points});
      }
      return targets;
    }

    function prepareScene(scene:Scene):Scene {
      scene.ordered=[...scene.tiles].sort((a,b)=>a.at-b.at);
      scene.cursor=0;scene.wetCursor=0;
      if(!scene.decorative&&scene.masks.length){
        const x=Math.min(...scene.masks.map(m=>m.x)),y=Math.min(...scene.masks.map(m=>m.y));
        const w=Math.max(...scene.masks.map(m=>m.x+m.width))-x,h=Math.max(...scene.masks.map(m=>m.y+m.height))-y;
        const cover=document.createElement("canvas");cover.width=Math.min(2048,Math.ceil(w));cover.height=Math.min(2048,Math.ceil(h));
        const buffer=cover.getContext("2d");if(!buffer)throw Error("Pixel mask unavailable");
        buffer.setTransform(cover.width/w,0,0,cover.height/h,0,0);
        buffer.fillStyle=scene.masks[0].background;buffer.fillRect(0,0,w,h);
        for(const mask of scene.masks){buffer.fillStyle=mask.background;buffer.fillRect(mask.x-x,mask.y-y,mask.width,mask.height);}
        buffer.globalAlpha=.13;buffer.fillStyle=root.dataset.theme==="dark"?"#62e8a5":"#34764a";buffer.font="9px monospace";
        for(let row=12;row<h;row+=24)for(let column=12;column<w;column+=24)buffer.fillText("01.:+"[(Math.floor(column/24)+Math.floor(row/24)*7)%5],column,row);
        buffer.globalAlpha=1;
        scene.cover=cover;scene.buffer=buffer;scene.coverBounds={x,y,width:w,height:h};
      }
      return scene;
    }

    function choreography(element: HTMLElement | null, fullIntro: boolean) {
      const started = performance.now();
      const rect = element?.getBoundingClientRect();
      const sceneWidth = rect?.width ?? width;
      const sceneHeight = rect?.height ?? Math.max(height,(document.querySelector(".folio-hero")?.getBoundingClientRect().bottom??height)+80);
      const result = createChoreography(sceneWidth, sceneHeight, fullIntro, mobile,
        paintTargets(element ?? document.body, fullIntro),height);
      performance.measure("virus:prepare-painting", { start: started, end: performance.now() });
      surface.dataset.virusPaintCells = String(result.tiles.length);
      return result;
    }

    function finish(scene: Scene, now: number, natural = false) {
      remember(scene.key);
      if (scene.intro) {
        intro = false;
        delete surface.dataset.virusStage;
        surface.style.removeProperty("--virus-time-left");
        clearIntro();
        window.clearTimeout(deadline);
        performance.measure("virus:intro", { start: scene.start, end: now });
        for (const key of scene.coveredKeys ?? []) remember(key);
        for(const element of document.querySelectorAll<HTMLElement>("[data-virus-reveal]")){
          const rect=element.getBoundingClientRect(),top=rect.top+scrollY;
          if(visible(element)&&top>=(scene.anchorY??0)&&top+rect.height<=(scene.anchorY??0)+scene.height)remember(keyFor(element));
        }
        for (const element of pending) if (scene.coveredKeys?.includes(keyFor(element))) pending.delete(element);
        if (natural && startupRequested && !replayRequested && !openingPullConsumed && !openingInterrupted && pathname === "/" && (!location.hash || location.hash === "#top") && scrollY < 8 && !document.hidden && effectsEnabled()) {
          openingPullConsumed = true;
          const remaining = document.documentElement.scrollHeight - innerHeight - scrollY;
          if (remaining > 80 && !document.querySelector("dialog[open],details[open],[aria-modal=true]") && !document.activeElement?.closest("input,textarea,select,[contenteditable=true]")) {
            let variant = Math.floor(Math.random() * 3);
            try {
              const previous = sessionStorage.getItem("gab-portfolio-duel-variant");
              if (previous === "0" || previous === "1" || previous === "2") variant = (Number(previous) + 1 + Math.floor(Math.random() * 2)) % 3;
              sessionStorage.setItem("gab-portfolio-duel-variant", String(variant));
            } catch { /* A random seed still varies the movement without storage. */ }
            const seed = Math.floor(Math.random() * 100000000) * 3 + variant;
            const header = document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 80;
            const stopAt = (element: Element | null) => Math.max(scrollY, Math.min(remaining + scrollY, (element?.getBoundingClientRect().top ?? height) + scrollY - header - 24));
            const hospitalElement = document.querySelector('[data-virus-reveal="project-usm-hospital"]') ?? document.querySelector("#work");
            const contactElement = document.querySelector("#contact");
            const hospital = stopAt(hospitalElement);
            const contact = Math.max(hospital, stopAt(contactElement));
            const pace = Math.max(160, Math.min(480, height * .55));
            const timing = {
              haul: Math.max(5000, (hospital - scrollY) / pace * 1250),
              solo: Math.max(18000, (contact - hospital) / pace * 1200),
              delivery: Math.max(3200, (remaining + scrollY - contact) / pace * 1600),
            };
            const headings = Array.from(document.querySelectorAll(".page-section h2,.project-entry h3,.contact-section h2")).map(element => {
              const rect = element.getBoundingClientRect();
              return { x: rect.left + scrollX, y: rect.top + scrollY, width: rect.width };
            });
            pull = { start: now + 250, from: scrollY, hospital, contact, expected: scrollY, seed, headings, hospitalElement, contactElement, offset: header + 24, timing, elapsed: 0, lastNow: now + 250, expiryAt: now };
            previousOverflowAnchor = root.style.overflowAnchor;
            root.style.overflowAnchor = "none";
            surface.dataset.virusDuelSeed = String(seed);
            surface.dataset.virusStage = "pull";
            surface.style.animation = "virus-section-expire-a 3600ms step-end forwards";
            surface.dataset.virusJourneyDuration = String(Math.round(650 + timing.haul + 4150 + timing.solo + timing.delivery + 700));
          }
        }
      } else performance.measure("virus:section", { start: scene.start, end: now });
    }

    function clear() {
      pull = undefined;
      if (previousOverflowAnchor !== undefined) { root.style.overflowAnchor = previousOverflowAnchor; previousOverflowAnchor = undefined; }
      delete surface.dataset.virusPullProgress;
      delete surface.dataset.virusDuelPhase;
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
      // Mobile browser chrome changes viewport height while scrolling.
      // Preserve the timeline for those changes; orientation/layout changes
      // still finish the old scene because its measured content has moved.
      const preserve = Math.abs(innerWidth - width) < 2 && Math.abs(innerHeight - height) < height * .3;
      if (!preserve) clear();
      width = innerWidth;
      height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      surface.width = Math.round(width * dpr);
      surface.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      anchorSurface();
      queue();
    }

    function queue() {
      if (!disposed && !frame && !document.hidden && effectsEnabled()) frame = requestAnimationFrame(draw);
    }

    function anchorSurface() {
      // A viewport-sized document layer scrolls with the compositor between
      // frames. Rebase and repaint together, without a document-sized bitmap.
      surface.style.top = `${scrollY}px`;
      surface.style.left = `${scrollX}px`;
      surface.style.width = `${width}px`;
      surface.style.height = `${height}px`;
    }

    function startPending(now: number) {
      // Start groups in pairs so one CSS deadline protects the entire batch.
      if (intro || scenes.length >= 2 || (!pull && scenes.length)) return;
      for (const element of pending) {
        const key = keyFor(element);
        if (!element.isConnected || completed.has(key)) { pending.delete(element); continue; }
        if (scenes.length >= 2) break;
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height || rect.top >= height - 24 || rect.bottom <= 0) continue;
        // Only the viewport-sized piece needs pixels, including very tall cards.
        const artwork = choreography(element, false);
        if (!artwork.paths.length) { remember(key); pending.delete(element); continue; }
        if (pull) {
          const duration = rect.height < 240 ? 1800 : 2600;
          const scale = duration / artwork.duration;
          artwork.duration = duration;
          for (const path of artwork.paths) { path.delay *= scale; path.travel *= scale; }
          for (const tile of artwork.tiles) tile.at *= scale;
          for (const mask of artwork.masks) mask.end *= scale;
        }
        scenes.push(prepareScene({ ...artwork, element, key, start: now, intro: false }));
        pending.delete(element);
        // Reserve immediately, so re-mounted filter results cannot queue twice.
        remember(key);
        performance.mark("virus:section-start");
      }
      if (scenes.length && !pull) {
        surface.dataset.virusStage = "section";
        // Alternate names to restart the CSS clock without forced layout.
        surface.style.animation = `virus-section-expire-${batch++ % 2 ? "a" : "b"} ${scenes[0].duration}ms step-end forwards`;
      }
    }

    function paint(scene: Scene, now: number) {
      const elapsed = now - scene.start;
      const rect = scene.element?.getBoundingClientRect();
      const x = rect?.left ?? (scene.anchorX ?? 0) - scrollX;
      const y = rect?.top ?? (scene.anchorY ?? 0) - scrollY;
      const headerBottom = document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
      const left = Math.max(0, x);
      const top = Math.max(0, y, headerBottom);
      const right = Math.min(width, rect?.right ?? x + scene.width);
      const bottom = Math.min(height, rect?.bottom ?? y + scene.height);
      if (right <= left || bottom <= top) return;
      const fade = clamp((scene.duration - elapsed) / (scene.intro ? 350 : 180));
      ctx.save();
      ctx.beginPath();
      ctx.rect(left, top, right - left, bottom - top);
      ctx.clip();
      ctx.translate(x, y);

      const ordered=scene.ordered!;
      let cursor=scene.cursor!;
      while(cursor<ordered.length&&ordered[cursor].at<=elapsed){
        const tile=ordered[cursor++],box=scene.coverBounds;
        if(scene.buffer&&box)scene.buffer.clearRect(tile.x-box.x,tile.y-box.y,tile.width+.5,tile.height+.5);
      }
      scene.cursor=cursor;
      if(scene.cover&&scene.coverBounds){const box=scene.coverBounds;ctx.drawImage(scene.cover,box.x,box.y,box.width,box.height);}
      const wetTime=scene.intro?130:85;
      let wet=scene.wetCursor!;
      while(wet<cursor&&elapsed-ordered[wet].at>wetTime)wet++;
      scene.wetCursor=wet;
      for(let index=wet;index<cursor;index++){
        const tile=ordered[index],age=elapsed-tile.at;
        ctx.globalAlpha=(1-age/wetTime)*.24*fade;
        ctx.fillStyle="#78ed5c";ctx.fillRect(tile.x,tile.y,tile.width,tile.height);
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
        const count = Math.min(12, Math.max(3, Math.ceil(Math.hypot(px-emitterX,py-emitterY)/18)));
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let packet=0; packet<count; packet++) {
          const t=(elapsed/900+worker*.137+packet/count)%1, inverse=1-t;
          const bx=inverse*inverse*emitterX+2*inverse*t*controlX+t*t*px;
          const by=inverse*inverse*emitterY+2*inverse*t*controlY+t*t*py;
          ctx.globalAlpha=opacity*(.25+.55*Math.sin(t*Math.PI));
          ctx.fillStyle=packet%3===0?"#62e8d4":"#70cb50";
          ctx.fillText(packet%3===0?"+":packet%3===1?":":".",bx,by);
        }
        creature!.draw(ctx, vx, vy, path.size, angle, crawl.travelled, worker, opacity);
        ctx.globalAlpha = opacity;
        ctx.fillStyle = "#70cb50";
        ctx.fillText("+",px,py);
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

    function updatePull(now: number) {
      if (!pull) return;
      if (document.hidden || document.activeElement?.closest("input,textarea,select,[contenteditable=true]") || document.querySelector("dialog[open],details[open],[aria-modal=true]") || window.getSelection()?.isCollapsed === false) { dismiss(); return; }
      // Do not catch up with a sudden page jump after a dropped frame.
      pull.elapsed += Math.min(64, Math.max(0, now - pull.lastNow));
      pull.lastNow = Math.max(pull.start, now);
      const duel = sampleDuel(pull.elapsed, width, height, pull.seed, pull.timing);
      pull.pose = duel;
      const bottom = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      if (pull.hospitalElement?.isConnected) pull.hospital = Math.max(pull.from, Math.min(bottom, pull.hospitalElement.getBoundingClientRect().top + scrollY - pull.offset));
      if (pull.contactElement?.isConnected) pull.contact = Math.max(pull.hospital, Math.min(bottom, pull.contactElement.getBoundingClientRect().top + scrollY - pull.offset));
      const stops = [pull.from, Math.min(bottom, pull.hospital), Math.min(bottom, pull.contact), bottom];
      const next = Math.round(stops[duel.leg] + (stops[duel.leg + 1] - stops[duel.leg]) * duel.fraction);
      pull.expected = next;
      if (Math.abs(scrollY - next) > .5) window.scrollTo({ top: next, behavior: "instant" });
      // Rebase the shared document canvas after scrolling, in the same frame.
      anchorSurface();
      surface.dataset.virusPullProgress = String(Math.round(duel.progress * 100));
      if (surface.dataset.virusDuelPhase !== duel.phase) surface.dataset.virusDuelPhase = duel.phase;
      surface.dataset.virusDuelWinner = String(duel.winner);
      surface.dataset.virusJourneyElapsed = String(Math.round(pull.elapsed));
      // A short CSS watchdog keeps any builder mask fail-open if JS stalls.
      if (now - pull.expiryAt >= 700) {
        surface.style.animation = `virus-section-expire-${batch++ % 2 ? "a" : "b"} 3600ms step-end forwards`;
        pull.expiryAt = now;
      }
    }

    function paintPull() {
      if (!pull?.pose) return;
      const elapsed = pull.elapsed;
      const duel = pull.pose;
      ctx.save();
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let worker = 0; worker < 2; worker++) {
        const actor = duel.actors[worker];
        if (actor.opacity <= .001) continue;
        for (const side of [-1, 1]) {
          const ax = actor.anchorX + side * 22;
          const jawX = actor.x + Math.cos(actor.angle) * actor.size * .26 + side * 9;
          const jawY = actor.y + Math.sin(actor.angle) * actor.size * .26;
          for (let packet = 0; packet < 8; packet++) {
            const t = (packet / 8 + elapsed / 650) % 1;
            ctx.globalAlpha = actor.opacity * actor.grip * (.35 + Math.sin(t * Math.PI) * .6);
            ctx.fillStyle = packet % 2 ? "#62e8d4" : "#93ff62";
            ctx.fillText(packet % 2 ? ":" : "+", jawX + (ax - jawX) * t, jawY + (actor.anchorY - jawY) * t);
          }
          ctx.globalAlpha = actor.opacity * actor.grip;
          ctx.fillStyle = "#93ff62";
          ctx.fillText(side < 0 ? "[" : "]", ax, actor.anchorY);
          // A small serrated edge makes the bottom attachment read as a grip
          // on the portfolio, instead of a laser aimed at floating content.
          for (let tooth = 0; tooth < 3; tooth++) ctx.fillRect(ax + side * tooth * 5, height - 6 - tooth % 2 * 3, 3, 2);
          ctx.strokeStyle = "#62e8d4";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ax - 28, height - 1);
          ctx.quadraticCurveTo(ax, height - 10 - actor.grip * 12, ax + 28, height - 1);
          ctx.stroke();
        }
        creature!.draw(ctx, actor.x, actor.y, actor.size, actor.angle, actor.travel, worker, actor.opacity);
        if (actor.wins && (duel.phase === "solo" || duel.phase === "delivery" || duel.phase === "exit")) {
          for (let code = 0; code < 16; code++) {
            const age = (elapsed / 900 + code / 16) % 1;
            ctx.globalAlpha = (1 - age) * .42;
            ctx.fillStyle = code % 2 ? "#62e8d4" : "#93ff62";
            ctx.fillText("01:+"[code % 4], actor.x + Math.sin(code * 2.4) * (8 + age * 20), actor.y - age * 150);
          }
        }
      }
      if (duel.phase === "solo" || duel.phase === "haul") {
        for (const heading of pull.headings) {
          const y = heading.y - scrollY;
          if (y < 100 || y > height - 40) continue;
          const glow = Math.max(0, 1 - Math.abs(y - height * .65) / (height * .45));
          ctx.globalAlpha = glow * .45;
          ctx.fillStyle = "#62e8d4";
          ctx.fillText("[", Math.max(12, heading.x - scrollX - 12), y + 12);
          ctx.fillText("01:+", Math.min(width - 30, heading.x - scrollX + heading.width - 25), y + 34);
        }
      }
      // Local contact sparks and a collapsing ASCII shell: no screen flash.
      if (duel.impact > .25) {
        for (let spark = 0; spark < 7; spark++) {
          const angle = spark * 2.4 + elapsed / 160;
          const reach = 8 + duel.impact * (12 + spark * 2);
          ctx.globalAlpha = duel.impact * .85;
          ctx.fillStyle = spark % 2 ? "#62e8d4" : "#93ff62";
          ctx.fillText("+x:*"[spark % 4], duel.center + Math.cos(angle) * reach, duel.floor - 22 + Math.sin(angle) * reach);
        }
      }
      if (duel.phase === "defeat") {
        const loser = duel.actors[1 - duel.winner];
        for (let shard = 0; shard < 22; shard++) {
          const angle = shard * 2.399 + pull.seed % 11;
          const reach = duel.defeat * (22 + shard * 2);
          ctx.globalAlpha = (1 - duel.defeat) * .9;
          ctx.fillStyle = shard % 3 ? "#62e8d4" : "#93ff62";
          ctx.fillText("01x:+"[shard % 5], loser.x + Math.cos(angle) * reach, loser.y + Math.sin(angle) * reach - Math.sin(duel.defeat * Math.PI) * 20);
        }
      }
      ctx.restore();
      if (duel.done) {
        pull = undefined;
        if (previousOverflowAnchor !== undefined) { root.style.overflowAnchor = previousOverflowAnchor; previousOverflowAnchor = undefined; }
        if (scenes.length) {
          surface.dataset.virusStage = "section";
          const remaining = Math.max(...scenes.map(scene => scene.duration - (performance.now() - scene.start)));
          surface.style.animation = `virus-section-expire-${batch++ % 2 ? "a" : "b"} ${Math.max(64, remaining + 64)}ms step-end forwards`;
        } else {
          delete surface.dataset.virusStage;
          surface.style.removeProperty("animation");
        }
        delete surface.dataset.virusPullProgress;
        delete surface.dataset.virusDuelPhase;
        queue();
      }
    }

    function draw(now: number) {
      frame = 0;
      try {
        updatePull(now);
        anchorSurface();
        ctx.clearRect(0, 0, width, height);
        const alive: Scene[] = [];
        for (const scene of scenes) {
          const introOffscreen = scene.intro && ((scene.anchorY ?? 0) - scrollY + scene.height <= 0 || (scene.anchorY ?? 0) - scrollY >= height);
          if (now - scene.start >= scene.duration || introOffscreen || (scene.element && (!scene.element.isConnected || !visible(scene.element)))) finish(scene, now, now - scene.start >= scene.duration && !introOffscreen);
          else alive.push(scene);
        }
        scenes = alive;
        if (!scenes.length && surface.dataset.virusStage === "section") {
          delete surface.dataset.virusStage;
          surface.style.removeProperty("animation");
        }
        startPending(now);
        for (const scene of scenes) paint(scene, now);
        paintPull();
        surface.dataset.virusScenes = String(scenes.length);
        if (scenes.length || pull) queue();
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
      openingInterrupted = true;
      startupCanceled=true;
      clear();
      // Never start another cover on the control the visitor is using.
      for (const element of pending) if (visible(element)) { remember(keyFor(element)); pending.delete(element); }
    }

    function onVisibility() {
      if(document.hidden){dismiss();return;}
      if(!initialized&&effectsEnabled()){
        // A preview loaded in a background tab should still greet the visitor
        // when first shown, without covering content that is already visible.
        window.dispatchEvent(new Event("portfolio:effects-change"));
      }else queue();
    }
    function onScroll() {
      if (pull && Math.abs(scrollY - pull.expected) > 2) { dismiss(); return; }
      if (!pull && scrollY > 8) openingInterrupted = true;
      queue();
    }
    function interruptOpening() {
      openingInterrupted = true;
      if (pull) dismiss();
    }
    function onKeydown(event: KeyboardEvent) {
      const control = (event.target as Element | null)?.closest?.("input,textarea,select,button,[role=button]");
      if (!control && ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) return;
      dismiss();
    }
    function onClick(event: MouseEvent) {
      if((event.target as Element|null)?.closest?.(".effects-toggle"))return;
      if ((event.target as Element | null)?.closest?.("a,button,input,textarea,select,[role=button]")) dismiss();
    }
    function onMotion() {
      if (!effectsEnabled()) { dismiss(); observer?.disconnect(); mutations?.disconnect(); }
    }

    // Size before decoding without dismissing the bootstrap cover.
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    surface.width = Math.round(width * dpr);
    surface.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    anchorSurface();

    // Mosaic geometry covers the actual DOM, so it needs no font rasterization
    // or external image. Wait only until the initial HTML has been parsed.
    const contentReady=document.readyState==="loading"?new Promise<void>(resolve=>document.addEventListener("DOMContentLoaded",()=>resolve(),{once:true})):Promise.resolve();
    contentReady.then(() => {
      if (disposed) return;
      if (!effectsEnabled() || document.hidden) { clearIntro(); return; }
      initialized=true;
      performance.mark("virus:creature-start");
      creature ??= makeCreature();
      performance.measure("virus:prepare-creature", "virus:creature-start");
      surface.dataset.virusRigFrames = String(creature.frames);
      root.dataset.virusEnabled = "true";
      const bootAt = startupAt;
      intro = startupRequested && !startupCanceled && Number.isFinite(bootAt) &&
        canPlayIntro({ path: pathname, hash: location.hash, restored: false,
          reduced: !effectsEnabled(), seen: introConsumed, reload: isReload });
      if (intro) {
        introConsumed = true;
        // A fresh opening gets fresh building crews. Returning from a case
        // study, filters and effects toggles still keep completed targets.
        if (!replayRequested && pathname === "/" && scrollY < 8) {
          for (const key of completed) if (key.startsWith("/:")) completed.delete(key);
          try { sessionStorage.setItem(REVEAL_SESSION_KEY, JSON.stringify([...completed])); } catch { /* In-memory fallback. */ }
        }
        root.dataset.virusAssembled = "true";
        const artwork = choreography(null, true);
        if (!artwork.paths.length) { intro = false; clearIntro(); return; }
        const coveredKeys = Array.from(document.querySelectorAll<HTMLElement>("[data-virus-reveal]")).filter(visible).map(keyFor);
        const readyAt = performance.now();
        const decorative=replayRequested||!root.dataset.virusIntro||readyAt-bootAt>INTRO_LIMIT-1400;
        const budget=decorative?artwork.duration:Math.min(artwork.duration,INTRO_LIMIT-(readyAt-bootAt)-64);
        const scale=budget/artwork.duration;
        artwork.duration=budget;
        for(const path of artwork.paths){path.delay*=scale;path.travel*=scale;}
        for(const tile of artwork.tiles)tile.at*=scale;
        for(const mask of artwork.masks)mask.end*=scale;
        scenes.push(prepareScene({ ...artwork, element: null, key: "intro", start: readyAt, intro: true, anchorX: scrollX, anchorY: scrollY, coveredKeys,decorative }));
        surface.dataset.virusCoverage = "mosaic";
        surface.dataset.virusImagePatches = String(artwork.masks.filter(mask => mask.kind === "image").length);
        // A compositor-side expiry also hides a stale frame if the main thread
        // is busy at the deadline. Leave two frames for style activation.
        surface.style.setProperty("--virus-time-left", `${budget+32}ms`);
        surface.dataset.virusStage = "intro";
        // Paint the canvas before making the independent CSS cover transparent.
        anchorSurface();
        paint(scenes[0], readyAt);
        if(root.dataset.virusIntro)root.dataset.virusIntro = "drawing";
        deadline = window.setTimeout(() => {
          if (disposed) return;
          const scene = scenes.find(candidate => candidate.intro);
          if (!scene) return;
          // A missed frame is still a completed build, not a user cancellation.
          // The independent CSS cover keeps its original fail-open deadline.
          scenes = scenes.filter(candidate => candidate !== scene);
          finish(scene, performance.now(), true);
          ctx.clearRect(0, 0, width, height);
          queue();
        }, budget + 32);
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

    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    const pullInputs = ["wheel", "touchstart", "touchmove", "pointerdown", "keydown"] as const;
    for (const event of pullInputs) window.addEventListener(event, interruptOpening, { passive: true, capture: true });
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("keydown", onKeydown);
    window.addEventListener("click", onClick, { passive: true });
    window.addEventListener("pagehide", dismiss);
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", onMotion);
    return () => {
      disposed = true;
      clear();
      window.clearTimeout(deadline);
      observer?.disconnect();
      mutations?.disconnect();
      window.removeEventListener("scroll", onScroll, true);
      for (const event of pullInputs) window.removeEventListener(event, interruptOpening, true);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeydown);
      window.removeEventListener("click", onClick);
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
    const root=document.documentElement;
    if(root.dataset.effects==="on"&&!document.hidden){introConsumed=false;root.dataset.virusStart=String(performance.now());root.dataset.virusIntro="drawing";root.dataset.virusReplay="true";}
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
