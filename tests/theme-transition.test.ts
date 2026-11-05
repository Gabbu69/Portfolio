import assert from "node:assert/strict";
import { test } from "node:test";
import { themeReveal, THEME_TRANSITION_DURATION } from "../src/lib/theme-transition";

function points(polygon: string) {
  return polygon.slice(8, -1).split(",").map(pair => pair.split(" ").map(value => parseFloat(value)));
}

function contains(polygon: number[][], x: number, y: number) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const [ax, ay] = polygon[index];
    const [bx, by] = polygon[previous];
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
  }
  return inside;
}

test("pixel reveal reaches every viewport corner from desktop, mobile and keyboard control origins", () => {
  for (const [width, height] of [[375, 812], [1440, 900], [2560, 1080], [7680, 4320]]) {
    for (const [x, y] of [[width - 100, 40], [width / 2, height / 2], [0, 0]]) {
      for (const dark of [false, true]) {
        const result = themeReveal(x, y, width, height, dark);
        const final = points(result.frames[result.frames.length - 1].clipPath);
        for (const [cx, cy] of [[0, 0], [width, 0], [0, height], [width, height]]) {
          assert.ok(contains(final, cx, cy), `uncovered corner ${cx},${cy} at ${width}x${height}`);
        }
      }
    }
  }
});

test("both directions start at the button, end at natural colors and share compatible polygon frames", () => {
  for (const dark of [true, false]) {
    const result = themeReveal(283, 36, 375, 812, dark);
    const frames = result.frames;
    assert.ok(points(frames[0].clipPath).every(([x, y]) => x === 283 && y === 36));
    assert.equal(new Set(frames.map(frame => points(frame.clipPath).length)).size, 1);
    assert.equal(frames[0].offset, 0);
    assert.equal(frames[frames.length - 1].offset, 1);
    assert.equal(frames[frames.length - 1].filter, "brightness(1) saturate(1)");
    assert.ok(points(frames[frames.length - 1].clipPath).every(([x, y]) => x % (dark ? 12 : 8) === 0 && y % (dark ? 12 : 8) === 0));
  }
  assert.ok(THEME_TRANSITION_DURATION < 750);
});
