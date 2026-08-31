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
  tumblrEnabled: "Tumblr",
  twitchEnabled: "Twitch",
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

// Writing to chrome.storage.sync is all this popup has to do: every content
// script listens on chrome.storage.onChanged, so open tabs update themselves —
// and so do tabs on the user's other synced devices.

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

function wireToggles() {
  list.querySelectorAll(".toggle").forEach((toggle) => {
    toggle.addEventListener("change", async () => {
      await chrome.storage.sync.set({
        [toggle.dataset.storageKey]: toggle.checked,
      });
    });
  });
}

async function setAllSites(enabled) {
  const patch = Object.fromEntries(SITES.map((site) => [site.id, enabled]));
  await chrome.storage.sync.set(patch);
  list.innerHTML = SITES.map((site) => rowHtml(site, enabled)).join("");
  wireToggles();
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
