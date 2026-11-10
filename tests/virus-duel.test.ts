import assert from "node:assert/strict";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { sampleVirusDuel } from "../src/lib/virus-duel";

test("bottom-edge duel scroll is bounded and never reverses across styles and screen sizes", () => {
  for (const [width, height] of [[375, 812], [1440, 900], [7680, 4320]]) {
    for (const seed of [0, 1, 2, 341, 8917, 299999999]) {
      let previous = 0;
      for (let time = 0; time <= 16000; time += 20) {
        const frame = sampleVirusDuel(time, width, height, seed);
        assert.ok(frame.progress >= previous && frame.progress <= 1);
        previous = frame.progress;
        for (const actor of frame.actors) {
          assert.ok([actor.x, actor.y, actor.angle, actor.opacity, actor.travel].every(Number.isFinite));
          if (time >= 650 && time <= 14250 && actor.opacity > .1) {
            assert.ok(actor.y > height - 200 && actor.y < height - 30, "keep the action at the bottom");
          }
        }
      }
      assert.equal(previous, 1);
      assert.equal(sampleVirusDuel(0, width, height, seed).progress, 0);
    }
  }
});

test("two rivals fight, one dissolves, and only the survivor finishes pulling", () => {
  for (let seed = 0; seed < 30; seed++) {
    const fight = sampleVirusDuel(5800, 1440, 900, seed);
    assert.equal(fight.phase, "fight");
    assert.equal(fight.actors.filter(actor => actor.opacity > 0).length, 2);
    assert.equal(sampleVirusDuel(6900, 1440, 900, seed).phase, "defeat");
    const solo = sampleVirusDuel(10000, 1440, 900, seed);
    assert.equal(solo.phase, "solo");
    assert.equal(solo.actors.filter(actor => actor.opacity > 0).length, 1);
    assert.ok(solo.actors[solo.winner].opacity > 0);
    const end = sampleVirusDuel(14950, 1440, 900, seed);
    assert.ok(end.done && end.actors.every(actor => actor.opacity === 0));
  }
});

test("seeds vary the fighting route, pulling style and winner", () => {
  const frames = Array.from({ length: 30 }, (_, seed) => sampleVirusDuel(5950, 1440, 900, seed));
  assert.equal(new Set(frames.map(frame => frame.variant)).size, 3);
  assert.equal(new Set(frames.map(frame => frame.winner)).size, 2);
  assert.ok(new Set(frames.map(frame => frame.actors[0].x)).size > 20);
});

test("the early duel renderer needs no imported runtime when serialized", () => {
  const frame = runInNewContext(`(${sampleVirusDuel.toString()})(10000,375,812,17)`, { __name: (fn: unknown) => fn });
  assert.equal(frame.phase, "solo");
  assert.equal(frame.actors.filter((actor: { opacity: number }) => actor.opacity > 0).length, 1);
});

test("the journey pauses at USM before the duel and reaches Contact before the footer", () => {
  for (const time of [3200, 4200, 5000, 6600, 7349]) {
    const frame = sampleVirusDuel(time, 1440, 900, 5);
    assert.equal(frame.leg, 0);
    assert.equal(frame.fraction, 1, "keep USM in view throughout the pause and rivalry");
  }
  assert.equal(sampleVirusDuel(4200, 1440, 900, 5).phase, "hospital");
  const contact = sampleVirusDuel(12350, 1440, 900, 5);
  assert.equal(contact.phase, "delivery");
  assert.equal(contact.leg, 2);
  assert.equal(contact.fraction, 0);
  const footer = sampleVirusDuel(14250, 1440, 900, 5);
  assert.equal(footer.fraction, 1);
  assert.equal(footer.progress, 1);
});

test("long-page pacing keeps movement slow instead of compressing the page into fifteen seconds", () => {
  const timing = { haul: 6000, solo: 40000, delivery: 4000 };
  const stops = [0, 1800, 15000, 16000];
  for (let seed = 0; seed < 9; seed++) {
    let previous = 0;
    for (let time = 0; time <= 56000; time += 16) {
      const frame = sampleVirusDuel(time, 1440, 900, seed, timing);
      const position = stops[frame.leg] + (stops[frame.leg + 1] - stops[frame.leg]) * frame.fraction;
      assert.ok(position >= previous - .001);
      assert.ok((position - previous) / .016 < 400, "keep pulling below 400 pixels per second with these distances");
      previous = position;
    }
    assert.equal(previous, 16000);
    assert.equal(sampleVirusDuel(7200, 1440, 900, seed, timing).phase, "hospital");
    assert.equal(sampleVirusDuel(9200, 1440, 900, seed, timing).phase, "fight");
    assert.equal(sampleVirusDuel(52000, 1440, 900, seed, timing).phase, "delivery");
  }
});

test("the survivor keeps stepping during a long haul", () => {
  const timing = { haul: 6000, solo: 40000, delivery: 4000 };
  const first = sampleVirusDuel(20000, 1440, 900, 2, timing);
  const next = sampleVirusDuel(20300, 1440, 900, 2, timing);
  assert.equal(first.phase, "solo");
  assert.ok(next.actors[first.winner].travel > first.actors[first.winner].travel + 15);
  assert.notEqual(first.actors[first.winner].angle, next.actors[first.winner].angle);
});
