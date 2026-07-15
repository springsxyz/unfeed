/** Shared product config — keep in sync with popup defaults. */
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
  const state = { proUnlocked: false };
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

// Export for service worker + popup (importScripts / window).
if (typeof globalThis !== "undefined") {
  globalThis.UNFEED_SITES = UNFEED_SITES;
  globalThis.UNFEED_FREE_LIMIT = UNFEED_FREE_LIMIT;
  globalThis.UNFEED_DEFAULT_ENABLED = UNFEED_DEFAULT_ENABLED;
  globalThis.unfeedDefaultState = unfeedDefaultState;
  globalThis.unfeedClampFreeTier = unfeedClampFreeTier;
}
