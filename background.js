/* Background service worker — keep self-contained (no importScripts / module import). */

const UNFEED_SITES = [
  "blueskyEnabled",
  "facebookEnabled",
  "instagramEnabled",
  "linkedinEnabled",
  "pinterestEnabled",
  "redditEnabled",
  "substackEnabled",
  "threadsEnabled",
  "tiktokEnabled",
  "xEnabled",
  "youtubeEnabled",
];

const UNFEED_FREE_LIMIT = 3;

const UNFEED_DEFAULT_ENABLED = [
  "instagramEnabled",
  "youtubeEnabled",
  "xEnabled",
];

function unfeedDefaultState() {
  const state = { proUnlocked: false, licenseKey: "" };
  for (const key of UNFEED_SITES) {
    state[key] = UNFEED_DEFAULT_ENABLED.includes(key);
  }
  return state;
}

function unfeedClampFreeTier(state) {
  if (state.proUnlocked) return { state, changed: false };

  let on = 0;
  for (const key of UNFEED_SITES) if (state[key]) on += 1;
  if (on <= UNFEED_FREE_LIMIT) return { state, changed: false };

  const keep = new Set();
  for (const key of UNFEED_DEFAULT_ENABLED) {
    if (state[key] && keep.size < UNFEED_FREE_LIMIT) keep.add(key);
  }
  for (const key of UNFEED_SITES) {
    if (state[key] && keep.size < UNFEED_FREE_LIMIT) keep.add(key);
  }

  let changed = false;
  const next = { ...state };
  for (const key of UNFEED_SITES) {
    if (next[key] && !keep.has(key)) {
      next[key] = false;
      changed = true;
    }
  }
  return { state: next, changed };
}

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
