/**
 * Shared site configuration — the single source of truth for which sites exist
 * and which are on by default. Loaded by popup/popup.html via <script> and by
 * background.js via importScripts, so it must stay plain classic-script JS.
 */
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

function unfeedDefaultState() {
  return Object.fromEntries(
    UNFEED_SITES.map((key) => [key, UNFEED_DEFAULT_ENABLED.includes(key)])
  );
}

if (typeof globalThis !== "undefined") {
  globalThis.UNFEED_SITES = UNFEED_SITES;
  globalThis.UNFEED_DEFAULT_ENABLED = UNFEED_DEFAULT_ENABLED;
  globalThis.unfeedDefaultState = unfeedDefaultState;
}
