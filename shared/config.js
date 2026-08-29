/** Shared site configuration used by the popup. */
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
