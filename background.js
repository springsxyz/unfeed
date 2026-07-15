/* global importScripts, unfeedDefaultState, unfeedClampFreeTier, UNFEED_SITES */

importScripts("shared/config.js");

async function ensureDefaults() {
  const stored = await chrome.storage.sync.get(null);
  const defaults = unfeedDefaultState();
  const patch = {};

  for (const [key, value] of Object.entries(defaults)) {
    if (stored[key] === undefined) patch[key] = value;
  }

  if (Object.keys(patch).length) {
    await chrome.storage.sync.set(patch);
  }

  const merged = { ...defaults, ...stored, ...patch };
  const { state, changed } = unfeedClampFreeTier(merged);
  if (changed) {
    const clampPatch = {};
    for (const key of UNFEED_SITES) clampPatch[key] = !!state[key];
    await chrome.storage.sync.set(clampPatch);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  ensureDefaults();
});

chrome.runtime.onStartup.addListener(() => {
  ensureDefaults();
});

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area !== "sync") return;
  const relevant = ["proUnlocked", ...UNFEED_SITES].some((k) => k in changes);
  if (!relevant) return;

  const stored = await chrome.storage.sync.get(unfeedDefaultState());
  const { state, changed } = unfeedClampFreeTier(stored);
  if (!changed) return;

  const patch = {};
  for (const key of UNFEED_SITES) {
    if (!!stored[key] !== !!state[key]) patch[key] = !!state[key];
  }
  if (Object.keys(patch).length) await chrome.storage.sync.set(patch);
});

ensureDefaults();
