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
  "tumblrEnabled",
  "twitchEnabled",
  "xEnabled",
  "youtubeEnabled",
];

/**
 * Sites enabled on a fresh install — currently every supported site. UnFeed's
 * whole promise is that the feed is gone, and a new user who finds eight of
 * eleven silently off reasonably concludes the extension is broken.
 *
 * This was Instagram/YouTube/X until 1.2.0, which was the cap of the old free
 * tier rather than a considered default. Remove a key here to ship it off.
 */
const UNFEED_DEFAULT_ENABLED = [...UNFEED_SITES];

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
