import assert from "node:assert/strict";
import { test } from "node:test";
import { virusLimbPose } from "../src/lib/virus-creature";

test("stepping limbs keep both textured bones attached at their physical joint", () => {
  const hip = [109, 56] as const, knee = [71, 35] as const, toe = [3, 107] as const;
  const rotate = (x: number, y: number, angle: number) => [x * Math.cos(angle) - y * Math.sin(angle), x * Math.sin(angle) + y * Math.cos(angle)];
  for (let step = 0; step < 48; step++) {
    const pose = virusLimbPose(hip, knee, toe, step / 48 * Math.PI * 2, 13);
    const upper = rotate(knee[0] - hip[0], knee[1] - hip[1], pose.upperTurn);
    const lower = rotate(toe[0] - knee[0], toe[1] - knee[1], pose.upperTurn + pose.lowerTurn);
    assert.ok(Math.hypot(hip[0] + upper[0] - pose.knee[0], hip[1] + upper[1] - pose.knee[1]) < .0001);
    assert.ok(Math.hypot(pose.knee[0] + lower[0] - pose.foot[0], pose.knee[1] + lower[1] - pose.foot[1]) < .0001);
    assert.ok(Number.isFinite(pose.upperTurn) && Number.isFinite(pose.lowerTurn));
  }
});

test("opposing legs alternate between lifted return and planted stance, and loop cleanly", () => {
  const hip = [0, 0] as const, knee = [20, 0] as const, toe = [20, 20] as const;
  const lifted = virusLimbPose(hip, knee, toe, Math.PI / 2, 4);
  const planted = virusLimbPose(hip, knee, toe, Math.PI * 1.5, 4);
  assert.ok(Math.abs(lifted.foot[1] - 15.6) < .0001);
  assert.ok(Math.abs(planted.foot[1] - 20) < .0001);
  const first = virusLimbPose(hip, knee, toe, 0, 4);
  const last = virusLimbPose(hip, knee, toe, Math.PI * 2, 4);
  assert.ok(Math.abs(first.upperTurn - last.upperTurn) < .0001);
  assert.ok(Math.abs(first.lowerTurn - last.lowerTurn) < .0001);
  assert.notEqual(lifted.lowerTurn, planted.lowerTurn);
  const stanceStart=virusLimbPose(hip,knee,toe,Math.PI*1.1,4);
  const stanceEnd=virusLimbPose(hip,knee,toe,Math.PI*1.9,4);
  assert.ok(stanceStart.foot[0]>stanceEnd.foot[0], "a planted foot must push back as the creature crawls forward");
});
