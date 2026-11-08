import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { canPlayIntro, createChoreography, sampleVirusCrawl, INTRO_DURATION, INTRO_LIMIT, REVEAL_DURATION } from "../src/lib/virus-animation";
import type { PaintTarget } from "../src/lib/virus-animation";
import { virusBootstrap, virusRuntimeScript } from "../src/lib/virus-bootstrap";

test("full intro supports refreshes while preserving motion and navigation safeguards", () => {
  const eligible = { path: "/", hash: "", restored: false, reduced: false, seen: false };
  assert.equal(canPlayIntro(eligible), true);
  for (const exception of [{ path: "/projects/pasibudget" }, { hash: "#work" }, { restored: true }, { reduced: true }, { seen: true }]) {
    assert.equal(canPlayIntro({ ...eligible, ...exception }), false);
  }
  assert.equal(canPlayIntro({ ...eligible, reload: true, hash: "#work", restored: true }), true);
  assert.equal(canPlayIntro({ ...eligible, reload: true, path: "/projects/pasibudget" }), true);
  assert.equal(canPlayIntro({ ...eligible, reload: true, reduced: true }), false);
});

test("swarm and cell work stay bounded on phones, desktops and very large screens", () => {
  for (const [width, height, mobile] of [[375, 812, true], [1440, 900, false], [7680, 4320, false]] as const) {
    for (const intro of [true, false]) {
      const targets: PaintTarget[] = Array.from({ length: 60 }, (_, index) => ({
        x: index % 10 * width / 12, y: Math.floor(index / 10) * height / 8, width: 18, height: 30,
        kind: "letter", priority: 0, background: "#f4f0e7",
        points: Array.from({ length: 8 }, (_, point) => ({ x: point % 2 * 6, y: Math.floor(point / 2) * 6, width: 3, height: 3 })),
      }));
      const scene = createChoreography(width, height, intro, mobile, targets);
      assert.equal(scene.paths.length, intro ? (mobile ? 18 : 40) : (mobile ? 5 : 8));
      assert.ok(scene.tiles.length <= (mobile ? 12000 : 24000), "cell count must not grow without a budget");
      assert.ok(scene.tiles.every(tile => tile.at >= 0 && tile.at + 65 < scene.duration), "every tile clears before the scene deadline");
      assert.ok(scene.paths.every(path => path.delay + path.travel < scene.duration), "spiders leave before the scene deadline");
      assert.equal(scene.duration, intro ? INTRO_DURATION : REVEAL_DURATION);
    }
  }
});

test("every painted pixel belongs to a letter or photo and is revealed when its own virus reaches it", () => {
  const targets: PaintTarget[] = [
    { x: 100, y: 80, width: 25, height: 36, kind: "letter", priority: 0, background: "#eee",
      points: [{ x: 0, y: 0, width: 3, height: 3 }, { x: 0, y: 6, width: 3, height: 3 }, { x: 6, y: 6, width: 3, height: 3 }] },
    { x: 300, y: 150, width: 80, height: 80, kind: "image", priority: 0, background: "#eee",
      points: [{ x: 0, y: 0, width: 10, height: 10 }, { x: 10, y: 0, width: 10, height: 10 }, { x: 10, y: 10, width: 10, height: 10 }] },
  ];
  const scene = createChoreography(1200, 800, true, false, targets);
  assert.equal(scene.masks.length, 2);
  assert.equal(scene.tiles.length, 6);
  for (let worker = 0; worker < scene.paths.length; worker++) {
    const path = scene.paths[worker];
    const painted = scene.tiles.filter(tile => tile.worker === worker);
    assert.equal(painted.length, path.points.length);
    painted.forEach((tile, index) => {
      const point = path.points[index];
      assert.equal(point.x, tile.x + tile.width / 2);
      assert.equal(point.y, tile.y + tile.height / 2);
      assert.ok(Math.abs(tile.at - (path.delay + point.distance / path.length * path.travel)) < .0001);
      const mask = scene.masks[tile.target];
      assert.ok(tile.x >= mask.x && tile.y >= mask.y && tile.x + tile.width <= mask.x + mask.width && tile.y + tile.height <= mask.y + mask.height);
    });
  }
  for (let index = 0; index < scene.masks.length; index++) {
    assert.equal(scene.masks[index].end, Math.max(...scene.tiles.filter(tile => tile.target === index).map(tile => tile.at)));
  }
});

test("no decorative fly-by workers are generated when there is no content to paint", () => {
  const scene = createChoreography(1440, 900, true, false);
  assert.equal(scene.paths.length, 0);
  assert.equal(scene.tiles.length, 0);
});

test("workers travel real crawl routes, face their direction of travel and expose distance for footfalls", () => {
  const scene = createChoreography(1440, 900, true, false, [{
    x: 400, y: 300, width: 100, height: 100, kind: "image", priority: 0, background: "#eee",
    points: [{x:0,y:0,width:5,height:5},{x:90,y:80,width:5,height:5}],
  }]);
  const path = scene.paths[0];
  assert.ok(path.crawlLength > path.size, "a worker must visibly cross its work instead of hovering at its laser tip");
  const poses = Array.from({length: 21}, (_, index) => sampleVirusCrawl(path, index / 20));
  for (let index=1; index<poses.length; index++) {
    const previous=poses[index-1], pose=poses[index];
    assert.ok(pose.travelled > previous.travelled);
    const displacement=Math.hypot(pose.x-previous.x,pose.y-previous.y);
    assert.ok(displacement > path.crawlLength / 20 * .95);
    const direction=Math.atan2(pose.y-previous.y,pose.x-previous.x);
    assert.ok(Math.abs(direction-pose.angle)<.15, "body must face the direction it is walking");
  }
  assert.deepEqual(sampleVirusCrawl(path,-1),sampleVirusCrawl(path,0));
  assert.deepEqual(sampleVirusCrawl(path,2),sampleVirusCrawl(path,1));
});

test("letter, image and body-text crews keep painting their own content in parallel", () => {
  const targets: PaintTarget[] = Array.from({ length: 48 }, (_, index) => ({
    x: index * 20, y: index < 16 ? 100 : index < 32 ? 300 : 500, width: 12, height: 18,
    kind: index >= 16 && index < 32 ? "image" : "letter", priority: index >= 32 ? 2 : 0, background: "#eee",
    points: [{ x: 0, y: 0, width: 3, height: 3 }, { x: 3, y: 6, width: 3, height: 3 }],
  }));
  const scene = createChoreography(1440, 900, true, false, targets);
  for (let worker = 0; worker < scene.paths.length; worker++) {
    const jobs = scene.tiles.filter(tile => tile.worker === worker).map(tile => scene.masks[tile.target]);
    assert.ok(jobs.length > 0);
    assert.equal(new Set(jobs.map(job => `${job.kind}-${job.priority}`)).size, 1);
  }
  for (const kind of ["letter", "image"]) {
    assert.ok(scene.tiles.filter(tile => scene.masks[tile.target].kind === kind).some(tile => tile.at > scene.duration * .8), `${kind} should still be actively painted near the end`);
  }
});

function bootstrap(options: { seen?: boolean; brokenStorage?: boolean; reduced?: boolean; effects?: "on" | "off"; restored?: boolean; reload?: boolean; scrollY?: number; hash?: string; path?: string; hidden?: boolean } = {}) {
  const dataset: Record<string, string> = {};
  if (options.effects) dataset.effects = options.effects;
  const timers: { callback: () => void; ms: number }[] = [];
  const events: Record<string, (event: { persisted?: boolean; key?: string }) => void> = {};
  runInNewContext(virusBootstrap, {
    document: { documentElement: { dataset }, hidden: options.hidden ?? false },
    location: { pathname: options.path ?? "/", hash: options.hash ?? "" },
    performance: { now: () => 42, getEntriesByType: () => [{ type: options.restored ? "back_forward" : options.reload ? "reload" : "navigate" }] },
    sessionStorage: {
      getItem() { if (options.brokenStorage) throw new Error("unavailable"); return options.seen ? "1" : null; },
      setItem() { if (options.brokenStorage) throw new Error("unavailable"); },
    },
    matchMedia: () => ({ matches: options.reduced ?? false }),
    scrollY: options.scrollY ?? 0,
    setTimeout: (callback: () => void, ms: number) => { timers.push({ callback, ms }); },
    addEventListener: (name: string, callback: (event: { persisted?: boolean; key?: string }) => void) => { events[name] = callback; },
  });
  return { dataset, timers, events };
}

test("startup expires independently of hydration, including with blocked storage", () => {
  for (const brokenStorage of [false, true]) {
    const { dataset, timers } = bootstrap({ brokenStorage });
    assert.equal(dataset.virusIntro, "pending");
    assert.equal(timers[0].ms, INTRO_LIMIT);
    timers[0].callback();
    assert.equal(dataset.virusIntro, undefined);
    assert.equal(dataset.virusStart, undefined);
  }
});

test("startup skips ordinary anchor navigation, direct case studies, reduced motion and history restores", () => {
  for (const exception of [{ hash: "#work" }, { path: "/projects/pasibudget" }, { reduced: true }, { restored: true }, { hidden: true }]) {
    const { dataset, timers } = bootstrap(exception);
    assert.equal(dataset.virusIntro, undefined);
    assert.equal(timers.length, 0);
  }
});

test("every refresh replays despite old session flags, anchors and restored scroll positions", () => {
  for (const options of [
    { reload: true, seen: true },
    { reload: true, seen: true, hash: "#work", scrollY: 2000 },
    { reload: true, seen: true, path: "/projects/pasibudget", hash: "#workflow", scrollY: 900 },
    { reload: true, brokenStorage: true },
  ]) {
    const { dataset, timers } = bootstrap(options);
    assert.equal(dataset.virusIntro, "pending");
    assert.equal(timers[0].ms, INTRO_LIMIT);
  }
});

test("the virus honors explicit site opt-in on a reduced-motion system and explicit opt-out otherwise", () => {
  assert.equal(bootstrap({ reduced: true, effects: "on", reload: true }).dataset.virusIntro, "pending");
  assert.equal(bootstrap({ reduced: false, effects: "off", reload: true }).dataset.virusIntro, undefined);
});

test("focus navigation and page lifecycle events dismiss the startup cover", () => {
  for (const event of ["keydown", "pagehide", "pageshow"]) {
    const { dataset, events } = bootstrap();
    events[event]({ persisted: true });
    assert.equal(dataset.virusIntro, undefined);
  }
});

test("scroll input preserves the intro, including keyboard scrolling before focus navigation", () => {
  const {dataset,events}=bootstrap();
  for(const event of ["wheel","touchmove","scroll"]) {
    events[event]?.({});
    assert.equal(dataset.virusIntro,"pending");
  }
  for(const key of ["ArrowDown","PageDown","Home","End"," "]) {
    events.keydown({key});
    assert.equal(dataset.virusIntro,"pending");
  }
  events.keydown({key:"Tab"});
  assert.equal(dataset.virusIntro,undefined);
});

test("serialized early engine is self-contained and fails open without a canvas context", () => {
  const dataset = { virusIntro: "pending", virusStart: "42" };
  const fakeWindow = { IntersectionObserver: undefined, __gabVirus: undefined as { pathname: string } | undefined, addEventListener() {} };
  runInNewContext(virusRuntimeScript, {
    window: fakeWindow,
    document: { documentElement: { dataset }, querySelector: () => ({ getContext: () => null }) },
    location: { pathname: "/" },
    innerWidth: 1440, innerHeight: 900,
    matchMedia: () => ({ matches: false }),
    performance: { getEntriesByType: () => [{ type: "navigate" }] },
  });
  assert.equal("virusIntro" in dataset, false);
  assert.equal(fakeWindow.__gabVirus?.pathname, "/");
});
