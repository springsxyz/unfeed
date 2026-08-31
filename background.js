/* Background service worker — keeps site defaults and removes legacy billing state. */

// Single source of truth for the site list and defaults. A classic MV3 service
// worker (no "type": "module") supports importScripts, so this file and the
// popup read the same config instead of keeping hand-synced copies.
importScripts("shared/config.js");

const LEGACY_BILLING_KEYS = [
  "proUnlocked",
  "licenseKey",
  "licenseValidatedAt",
];

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
