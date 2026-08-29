/* global UNFEED_SITES, unfeedDefaultState, SITE_ICONS */

const SITE_LABELS = {
  blueskyEnabled: "Bluesky",
  facebookEnabled: "Facebook",
  instagramEnabled: "Instagram",
  linkedinEnabled: "LinkedIn",
  pinterestEnabled: "Pinterest",
  redditEnabled: "Reddit",
  substackEnabled: "Substack",
  threadsEnabled: "Threads",
  tiktokEnabled: "TikTok",
  xEnabled: "X",
  youtubeEnabled: "YouTube",
};

const SITES = UNFEED_SITES.map((id) => ({
  id,
  label: SITE_LABELS[id] || id,
}));

const defaults = unfeedDefaultState();
const list = document.getElementById("site-list");
const enableAllBtn = document.getElementById("enable-all");
const disableAllBtn = document.getElementById("disable-all");

const URL_PATTERNS = {
  youtubeEnabled: ["*://www.youtube.com/*", "*://youtube.com/*", "*://m.youtube.com/*"],
  instagramEnabled: ["*://www.instagram.com/*", "*://instagram.com/*"],
  facebookEnabled: [
    "*://www.facebook.com/*",
    "*://facebook.com/*",
    "*://web.facebook.com/*",
    "*://m.facebook.com/*",
  ],
  xEnabled: [
    "*://www.x.com/*",
    "*://x.com/*",
    "*://twitter.com/*",
    "*://www.twitter.com/*",
  ],
  redditEnabled: [
    "*://www.reddit.com/*",
    "*://reddit.com/*",
    "*://old.reddit.com/*",
    "*://sh.reddit.com/*",
  ],
  linkedinEnabled: ["*://www.linkedin.com/*", "*://linkedin.com/*"],
  tiktokEnabled: ["*://www.tiktok.com/*", "*://tiktok.com/*"],
  pinterestEnabled: [
    "*://www.pinterest.com/*",
    "*://pinterest.com/*",
    "*://*.pinterest.com/*",
  ],
  substackEnabled: ["*://substack.com/*", "*://www.substack.com/*"],
  threadsEnabled: [
    "*://www.threads.net/*",
    "*://threads.net/*",
    "*://www.threads.com/*",
    "*://threads.com/*",
  ],
  blueskyEnabled: ["*://bsky.app/*", "*://www.bsky.app/*"],
};

function rowHtml(site, enabled) {
  const icon = SITE_ICONS[site.id] || "";
  return `
    <label class="row" for="${site.id}">
      <span class="row-left">
        ${icon}
        <span class="platform">${site.label}</span>
      </span>
      <input
        type="checkbox"
        id="${site.id}"
        class="toggle"
        data-storage-key="${site.id}"
        aria-label="Remove the ${site.label} feed"
        ${enabled ? "checked" : ""}
        role="switch"
      />
    </label>
  `;
}

async function broadcast(storageKey, enabled) {
  const urls = URL_PATTERNS[storageKey];
  if (!urls) return;

  const tabs = await chrome.tabs.query({ url: urls });
  for (const tab of tabs) {
    if (tab.id == null) continue;
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: "UNFEED_SETTINGS",
        storageKey,
        [storageKey]: enabled,
        sites: { [storageKey]: enabled },
      });
    } catch {
      // Content script may not be injected yet.
    }
  }
}

async function broadcastMany(state) {
  await Promise.all(SITES.map((site) => broadcast(site.id, !!state[site.id])));
}

function wireToggles() {
  list.querySelectorAll(".toggle").forEach((toggle) => {
    toggle.addEventListener("change", async () => {
      const key = toggle.dataset.storageKey;
      const enabled = toggle.checked;
      await chrome.storage.sync.set({ [key]: enabled });
      await broadcast(key, enabled);
    });
  });
}

async function setAllSites(enabled) {
  const patch = Object.fromEntries(SITES.map((site) => [site.id, enabled]));
  await chrome.storage.sync.set(patch);
  list.innerHTML = SITES.map((site) => rowHtml(site, enabled)).join("");
  wireToggles();
  await broadcastMany(patch);
}

enableAllBtn.addEventListener("click", () => setAllSites(true));
disableAllBtn.addEventListener("click", () => setAllSites(false));

async function load() {
  const stored = await chrome.storage.sync.get(defaults);
  list.innerHTML = SITES.map((site) => rowHtml(site, !!stored[site.id])).join("");
  wireToggles();
}

load();

document.getElementById("privacy-link")?.addEventListener("click", (event) => {
  event.preventDefault();
  chrome.tabs.create({ url: chrome.runtime.getURL("privacy.html") });
});

document.getElementById("site-link")?.addEventListener("click", (event) => {
  event.preventDefault();
  chrome.tabs.create({ url: "https://unfeed.dev/" });
});
