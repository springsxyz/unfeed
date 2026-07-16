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

/** Polar Pro — see docs/POLAR.md */
const UNFEED_PRO_PRICE_LABEL = "$9";
const UNFEED_CHECKOUT_URL =
  "https://buy.polar.sh/polar_cl_wgxb6PrGXuI6mnXik4eZ4BauDYB5GNe5DuXgI398KiB";
const UNFEED_POLAR_ORG_ID = "fa6be024-1152-4b4a-b9b0-8c4c8db5c079";
const UNFEED_POLAR_BENEFIT_ID = "4fa79cee-44c2-4dce-a24f-4cb31216700a";
const UNFEED_POLAR_VALIDATE_URL =
  "https://api.polar.sh/v1/customer-portal/license-keys/validate";

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

function unfeedCheckoutConfigured() {
  return Boolean(UNFEED_CHECKOUT_URL && UNFEED_POLAR_ORG_ID);
}

function unfeedIsDevUnlockCode(code) {
  if (!code || typeof UNFEED_DEV_UNLOCK_CODES === "undefined") return false;
  const normalized = String(code).trim().toUpperCase();
  return UNFEED_DEV_UNLOCK_CODES.some((c) => String(c).trim().toUpperCase() === normalized);
}

// Export for service worker + popup (importScripts / window).
if (typeof globalThis !== "undefined") {
  globalThis.UNFEED_SITES = UNFEED_SITES;
  globalThis.UNFEED_FREE_LIMIT = UNFEED_FREE_LIMIT;
  globalThis.UNFEED_DEFAULT_ENABLED = UNFEED_DEFAULT_ENABLED;
  globalThis.UNFEED_PRO_PRICE_LABEL = UNFEED_PRO_PRICE_LABEL;
  globalThis.UNFEED_CHECKOUT_URL = UNFEED_CHECKOUT_URL;
  globalThis.UNFEED_POLAR_ORG_ID = UNFEED_POLAR_ORG_ID;
  globalThis.UNFEED_POLAR_BENEFIT_ID = UNFEED_POLAR_BENEFIT_ID;
  globalThis.UNFEED_POLAR_VALIDATE_URL = UNFEED_POLAR_VALIDATE_URL;
  globalThis.unfeedDefaultState = unfeedDefaultState;
  globalThis.unfeedClampFreeTier = unfeedClampFreeTier;
  globalThis.unfeedCheckoutConfigured = unfeedCheckoutConfigured;
  globalThis.unfeedIsDevUnlockCode = unfeedIsDevUnlockCode;
}
