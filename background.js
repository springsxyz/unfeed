/* Background service worker — keeps site defaults and removes legacy billing state. */

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

const UNFEED_DEFAULT_ENABLED = [
  "instagramEnabled",
  "youtubeEnabled",
  "xEnabled",
];

const LEGACY_BILLING_KEYS = [
  "proUnlocked",
  "licenseKey",
  "licenseValidatedAt",
];

function unfeedDefaultState() {
  return Object.fromEntries(
    UNFEED_SITES.map((key) => [key, UNFEED_DEFAULT_ENABLED.includes(key)])
  );
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

  await chrome.storage.sync.remove(LEGACY_BILLING_KEYS);
}

chrome.runtime.onInstalled.addListener(ensureDefaults);
chrome.runtime.onStartup.addListener(ensureDefaults);

ensureDefaults();
