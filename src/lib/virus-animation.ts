/** Timing and brush routes for viruses painting the actual page content. */
export const INTRO_DURATION = 3200;
export const INTRO_LIMIT = 3600;
export const REVEAL_DURATION = 1200;
export const REVEAL_SESSION_KEY = "gab-virus-reveals-v2";

export const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

export type PaintPoint = { x: number; y: number; width: number; height: number };
export type PaintTarget = {
  x: number; y: number; width: number; height: number;
  kind: "letter" | "image";
  background: string;
  priority: number;
  points: PaintPoint[];
};
export type PixelTile = PaintPoint & { at: number; target: number; worker: number };
export type BrushPoint = { x: number; y: number; distance: number };
export type VirusPath = {
  points: BrushPoint[];
  length: number;
  crawl: BrushPoint[];
  crawlLength: number;
  size: number;
  delay: number;
  travel: number;
};

export function createChoreography(width: number, height: number, intro: boolean, mobile: boolean, input: PaintTarget[] = []) {
  // Self-contained for the early inline engine: no imported runtime bindings.
  const duration = intro ? 3200 : 1200;
  const budget = mobile ? 4200 : 6400;
  let used = 0;
  const targets = input.filter(target => {
    if (!target.points.length || used + target.points.length > budget) return false;
    used += target.points.length;
    return true;
  }).sort((a, b) => a.priority - b.priority || a.y - b.y || a.x - b.x);
  const count = Math.min(intro ? (mobile ? 18 : 40) : (mobile ? 5 : 8), targets.length);
  const paths: VirusPath[] = Array.from({ length: count }, (_, index) => ({
    points: [], length: 0, crawl: [], crawlLength: 0,
    size: intro ? (mobile ? 68 : 86) + (index * 13 % 21) : 58 + (index * 7 % 13),
    delay: intro ? 100 + index * 11 % 150 : index * 5 % 45,
    travel: intro ? 2600 : 930,
  }));
  const tiles: PixelTile[] = [];
  const owners: number[] = [];
  const tileDistances: number[] = [];
  const ends: number[] = [];
  const groups = [
    { weight: .4, indices: targets.flatMap((target, index) => target.kind === "letter" && target.priority === 0 ? [index] : []), quota: 0 },
    { weight: .32, indices: targets.flatMap((target, index) => target.kind === "image" ? [index] : []), quota: 0 },
    { weight: .28, indices: targets.flatMap((target, index) => target.kind === "letter" && target.priority !== 0 ? [index] : []), quota: 0 },
  ];
  for (const group of groups) if (group.indices.length) group.quota = 1;
  let remaining = count - groups.reduce((sum, group) => sum + group.quota, 0);
  while (remaining > 0) {
    let chosen = groups[0];
    let best = -1;
    for (const group of groups) {
      const score = group.quota < group.indices.length ? group.weight / (group.quota + 1) : -1;
      if (score > best) { best = score; chosen = group; }
    }
    if (best < 0) break;
    chosen.quota++;
    remaining--;
  }
  let firstWorker = 0;
  for (const group of groups) {
    group.indices.forEach((targetIndex, index) => {
      owners[targetIndex] = firstWorker + Math.min(group.quota - 1, Math.floor(index * group.quota / group.indices.length));
    });
    firstWorker += group.quota;
  }
  for (let targetIndex = 0; targetIndex < targets.length; targetIndex++) {
    const target = targets[targetIndex];
    // Dedicated crews stay with heading strokes, pictures, or reading-order
    // text runs instead of abandoning the portrait to fly across the page.
    const owner = owners[targetIndex];
    const path = paths[owner];
    for (const point of target.points) {
      const x = target.x + point.x + point.width / 2;
      const y = target.y + point.y + point.height / 2;
      const last = path.points[path.points.length - 1];
      path.length += last ? Math.max(1, Math.hypot(x - last.x, y - last.y)) : 1;
      path.points.push({ x, y, distance: path.length });
      tiles.push({ x: target.x + point.x, y: target.y + point.y, width: point.width, height: point.height, at: 0, target: targetIndex, worker: owner });
      tileDistances.push(path.length);
    }
    ends[targetIndex] = path.length;
  }
  for (let index = 0; index < tiles.length; index++) {
    const path = paths[tiles[index].worker];
    tiles[index].at = path.delay + tileDistances[index] / path.length * path.travel;
  }
  for (let worker = 0; worker < paths.length; worker++) {
    const path = paths[worker];
    const first = path.points[0], last = path.points[path.points.length - 1];
    const heading = Math.hypot(last.x - first.x, last.y - first.y) > 10 ? Math.atan2(last.y - first.y, last.x - first.x) : worker % 2 ? Math.PI / 2 : 0;
    const dx = Math.cos(heading), dy = Math.sin(heading), side = worker % 2 ? -1 : 1;
    const padX = Math.min(path.size * .4, width / 3), padY = Math.min(path.size * .4, height / 3);
    const bounded = (x: number, y: number) => ({ x: Math.max(padX, Math.min(width - padX, x)), y: Math.max(padY, Math.min(height - padY, y)) });
    const start = intro
      ? bounded(width*.5+Math.cos(worker*2.4)*path.size*.3,height*.42+Math.sin(worker*2.4)*path.size*.3)
      : bounded(first.x - dx * path.size * 1.4 - dy * path.size * .3 * side, first.y - dy * path.size * 1.4 + dx * path.size * .3 * side);
    const end = bounded(last.x - dx * path.size * .45 - dy * path.size * .3 * side, last.y - dy * path.size * .45 + dx * path.size * .3 * side);
    const middle = bounded((start.x + end.x) / 2 - dy * path.size * .65 * side, (start.y + end.y) / 2 + dx * path.size * .65 * side);
    // Bodies crawl a continuous route across their work. The laser can scan
    // tiny glyph pixels independently without making the creature jitter.
    for (let step = 0; step <= 24; step++) {
      const t = step / 24, inverse = 1 - t;
      const x = inverse * inverse * start.x + 2 * inverse * t * middle.x + t * t * end.x;
      const y = inverse * inverse * start.y + 2 * inverse * t * middle.y + t * t * end.y;
      const previous = path.crawl[path.crawl.length - 1];
      if (previous) path.crawlLength += Math.hypot(x - previous.x, y - previous.y);
      path.crawl.push({ x, y, distance: path.crawlLength });
    }
  }
  const masks = targets.map((target, index) => {
    const path = paths[owners[index]];
    return { ...target, points: undefined, end: path.delay + ends[index] / path.length * path.travel };
  });
  return { paths, tiles, masks, duration, width, height };
}

/** Sample by travelled distance so walking speed and footfalls stay coupled. */
export function sampleVirusCrawl(path: Pick<VirusPath, "crawl" | "crawlLength">, progress: number) {
  const travelled = Math.max(0, Math.min(1, progress)) * path.crawlLength;
  let index = 1;
  while (index < path.crawl.length - 1 && path.crawl[index].distance < travelled) index++;
  const previous = path.crawl[index - 1], next = path.crawl[index];
  const fraction = (travelled - previous.distance) / Math.max(.001, next.distance - previous.distance);
  return { x: previous.x + (next.x - previous.x) * fraction, y: previous.y + (next.y - previous.y) * fraction, angle: Math.atan2(next.y - previous.y, next.x - previous.x), travelled };
}

export function canPlayIntro({ path, hash, restored, reduced, seen, reload = false }: {
  path: string; hash: string; restored: boolean; reduced: boolean; seen: boolean; reload?: boolean;
}) {
  return (path === "/" || (reload && path.startsWith("/projects/"))) &&
    (reload || (!hash && !restored)) && !reduced && !seen;
}
