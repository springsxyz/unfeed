const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

function loadConfig() {
  const context = { globalThis: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "shared", "config.js"), "utf8"), context);
  return context.globalThis;
}

test("default state enables exactly the three advertised free sites", () => {
  const config = loadConfig();
  const state = config.unfeedDefaultState();
  const enabled = config.UNFEED_SITES.filter((key) => state[key]);
  assert.deepEqual(Array.from(enabled), ["instagramEnabled", "xEnabled", "youtubeEnabled"]);
});

test("free tier clamp never leaves more than three sites enabled", () => {
  const config = loadConfig();
  const state = config.unfeedDefaultState();
  for (const key of config.UNFEED_SITES) state[key] = true;
  const result = config.unfeedClampFreeTier(state);
  assert.equal(config.UNFEED_SITES.filter((key) => result.state[key]).length, 3);
  assert.equal(result.changed, true);
});

test("Pro state is not clamped", () => {
  const config = loadConfig();
  const state = config.unfeedDefaultState();
  state.proUnlocked = true;
  for (const key of config.UNFEED_SITES) state[key] = true;
  const result = config.unfeedClampFreeTier(state);
  assert.equal(config.UNFEED_SITES.filter((key) => result.state[key]).length, 11);
  assert.equal(result.changed, false);
});
