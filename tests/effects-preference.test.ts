import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { effectsAllowed, effectsBootstrap } from "../src/lib/effects-preference";

test("explicit effects preference overrides the system only when the visitor chooses", () => {
  assert.equal(effectsAllowed(undefined, true), false);
  assert.equal(effectsAllowed(undefined, false), true);
  assert.equal(effectsAllowed("on", true), true);
  assert.equal(effectsAllowed("off", false), false);
});

function initialize({ reduced = true, saved, query = "", blocked = false }: {
  reduced?: boolean; saved?: string; query?: string; blocked?: boolean;
} = {}) {
  const dataset: Record<string, string> = {};
  let stored = saved;
  runInNewContext(effectsBootstrap, {
    document: { documentElement: { dataset } },
    location: { search: query },
    URLSearchParams,
    matchMedia: () => ({ matches: reduced, addEventListener() {} }),
    localStorage: {
      getItem() { if (blocked) throw new Error("blocked"); return stored; },
      setItem(_key: string, value: string) { if (blocked) throw new Error("blocked"); stored = value; },
    },
    addEventListener() {},
  });
  return { dataset, stored };
}

test("first visit follows reduced motion, and the explicit enable link persists the site preference", () => {
  assert.equal(initialize().dataset.effects, "off");
  const enabled = initialize({ query: "?effects=on" });
  assert.equal(enabled.dataset.effects, "on");
  assert.equal(enabled.stored, "on");
  assert.equal(initialize({ saved: enabled.stored }).dataset.effects, "on");
  assert.equal(initialize({ reduced: false, query: "?effects=off", saved: "on" }).dataset.effects, "off");
});

test("invalid flags are ignored and unavailable storage does not prevent an explicit opt-in", () => {
  assert.equal(initialize({ query: "?effects=unexpected" }).dataset.effects, "off");
  const enabled = initialize({ query: "?effects=on", blocked: true });
  assert.equal(enabled.dataset.effects, "on");
  assert.equal(enabled.dataset.effectsPreference, "on");
});
