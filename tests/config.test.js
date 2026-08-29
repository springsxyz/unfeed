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

test("default state starts with Instagram, X, and YouTube enabled", () => {
  const config = loadConfig();
  const state = config.unfeedDefaultState();
  const enabled = config.UNFEED_SITES.filter((key) => state[key]);
  assert.deepEqual(Array.from(enabled), ["instagramEnabled", "xEnabled", "youtubeEnabled"]);
});

test("every supported site is available in the free state", () => {
  const config = loadConfig();
  const state = config.unfeedDefaultState();
  assert.equal(config.UNFEED_SITES.length, 11);
  for (const key of config.UNFEED_SITES) {
    assert.equal(typeof state[key], "boolean");
  }
});

test("configuration contains no billing or license state", () => {
  const config = loadConfig();
  const state = config.unfeedDefaultState();
  assert.equal("proUnlocked" in state, false);
  assert.equal("licenseKey" in state, false);
  assert.equal("unfeedClampFreeTier" in config, false);
});
