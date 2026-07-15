/* global UNFEED_SITES, UNFEED_FREE_LIMIT, UNFEED_DEFAULT_ENABLED, unfeedDefaultState, unfeedClampFreeTier */

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

const FREE_LIMIT = UNFEED_FREE_LIMIT;
const DEV_PRO_CODE = "UNFEED-PRO";

/** Compact brand marks (inline SVG) for Signal Cut list */
const SITE_ICONS = {
  blueskyEnabled:
    '<svg class="site-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="#1185fe" d="M12 11.5c-1.7-3.2-6.3-9.1-8.4-8.4C1.4 3.7 2 9.5 5.1 14c1.7 2.5 3.6 3.4 4.5 3.2.4-.1.8-.4 1.1-.8.3.4.7.7 1.1.8.9.2 2.8-.7 4.5-3.2 3.1-4.5 3.7-10.3 1.5-11-2.1-.7-6.7 5.2-8.4 8.5z"/></svg>',
  facebookEnabled:
    '<svg class="site-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path fill="#fff" d="M13.3 19v-6.2h2.1l.3-2.5h-2.4V8.8c0-.7.2-1.2 1.3-1.2h1.3V5.4c-.2 0-1-.1-1.9-.1-1.9 0-3.2 1.2-3.2 3.3v1.8H8.6v2.5h2.2V19h2.5z"/></svg>',
  instagramEnabled:
    '<svg class="site-icon" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="ig" x1="0" y1="24" x2="24" y2="0"><stop stop-color="#feda75"/><stop offset=".3" stop-color="#fa7e1e"/><stop offset=".6" stop-color="#d62976"/><stop offset="1" stop-color="#4f5bd5"/></linearGradient></defs><rect width="24" height="24" rx="6" fill="url(#ig)"/><rect x="5.5" y="5.5" width="13" height="13" rx="4" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="12" cy="12" r="3.2" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="16.6" cy="7.5" r="1.1" fill="#fff"/></svg>',
  linkedinEnabled:
    '<svg class="site-icon" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="3" fill="#0A66C2"/><path fill="#fff" d="M7.1 9.4H4.6V19h2.5V9.4zM5.8 5A1.5 1.5 0 1 0 5.8 8a1.5 1.5 0 0 0 0-3zM19.4 12.3c0-2.3-1.2-3.8-3.5-3.8-1.2 0-2 .6-2.4 1.3h-.1V9.4h-2.4V19h2.5v-4.9c0-1.3.2-2.5 1.8-2.5s1.6 1.4 1.6 2.6V19h2.5v-6.7z"/></svg>',
  pinterestEnabled:
    '<svg class="site-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#E60023"/><path fill="#fff" d="M12.1 6.2c-3 0-4.6 2.1-4.6 4.4 0 1.3.5 2.5 1.6 2.9.2.1.3 0 .4-.2l.2-.6c0-.2.1-.3 0-.4-.3-.4-.5-.9-.5-1.5 0-2 1.5-3.7 3.8-3.7 2.1 0 3.2 1.3 3.2 3 0 2.2-1 4-2.4 4-.8 0-1.4-.6-1.2-1.4.2-1 .7-2.1.7-2.8 0-.6-.4-1.2-1.1-1.2-.9 0-1.6.9-1.6 2.1 0 .8.3 1.3.3 1.3l-1 4.2c-.3 1.2 0 2.7 0 2.8 0 .1.1.1.1 0 .1-.2 1.4-1.7 1.8-3.3l.5-1.7c.3.5.9.9 1.7.9 2.2 0 3.7-2 3.7-4.7 0-2.5-2.1-4.3-4.9-4.3z"/></svg>',
  redditEnabled:
    '<svg class="site-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#FF4500"/><circle cx="8.8" cy="12.4" r="1.3" fill="#fff"/><circle cx="15.2" cy="12.4" r="1.3" fill="#fff"/><path fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" d="M9.2 15.2c1.1.8 4.5.8 5.6 0"/><circle cx="16.8" cy="8.3" r="1.2" fill="#fff"/><path stroke="#fff" stroke-width="1.4" fill="none" d="M12.2 7.2 13.7 4.3 16.2 5"/><circle cx="12.2" cy="7.4" r="1.5" fill="#fff"/></svg>',
  substackEnabled:
    '<svg class="site-icon" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="4" fill="#FF6719"/><path fill="#fff" d="M5 6.2h14v2.2H5V6.2zm0 3.6h14V17l-7 3.2L5 17V9.8z"/></svg>',
  threadsEnabled:
    '<svg class="site-icon" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#000"/><path fill="#fff" d="M15.7 11.3c-.1-.9-.5-1.6-1.1-2-.6-.4-1.3-.6-2.2-.6-1.4 0-2.5.6-3.1 1.6l1.3.8c.4-.6 1-1 1.8-1 .5 0 .9.1 1.2.4.3.2.5.6.5 1v.3c-.6-.1-1.2-.1-1.9 0-1.8.2-3 1.2-3 2.7 0 .9.3 1.6.9 2.1.6.5 1.3.7 2.2.7 1 0 1.8-.3 2.4-1 .3.6.8 1 1.5 1.2l.5-1.3c-.4-.1-.6-.4-.7-.8.8-.7 1.2-1.6 1.1-2.8v-.3zm-3.3 3.3c-.4 0-.8-.1-1-.4-.2-.2-.3-.5-.3-.8 0-.7.5-1.1 1.6-1.2.5-.1 1-.1 1.5 0v.5c0 .8-.7 1.9-1.8 1.9z"/></svg>',
  tiktokEnabled:
    '<svg class="site-icon" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#000"/><path fill="#25F4EE" d="M16.4 8.2a4.4 4.4 0 0 1-2.5-3.7V4h-2.1v10.3a2.1 2.1 0 1 1-1.5-2v-2.2a4.3 4.3 0 1 0 3.6 4.2V9.8a6.5 6.5 0 0 0 2.5.6V8.2z"/><path fill="#FE2C55" d="M17.1 8.9a6.5 6.5 0 0 1-2.5-.6v4.7a4.3 4.3 0 1 1-4.3-4.3v2.2a2.1 2.1 0 1 0 1.5 2V4h2.1v.5a4.4 4.4 0 0 0 2.5 3.7v.7z"/><path fill="#fff" d="M14.6 8.3a4.4 4.4 0 0 1-2.5-3.7V4h-1.4v10.3a2.1 2.1 0 1 1-1.5-2v-2.2a4.3 4.3 0 1 0 3.6 4.2V9.8c.4.2.9.4 1.8.5V8.3z"/></svg>',
  xEnabled:
    '<svg class="site-icon" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#000"/><path fill="#fff" d="m13.3 11.4 5-5.8h-1.2l-4.3 5-3.5-5H5.5l5.2 7.5-5.2 6h1.2l4.6-5.3 3.6 5.3H18l-5.4-7.7zm-1.6 1.9-.5-.8-4.2-6h1.8l3.4 4.9.5.8 4.4 6.3h-1.8l-3.6-5.2z"/></svg>',
  youtubeEnabled:
    '<svg class="site-icon" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#FF0000"/><path fill="#fff" d="M10 8.5v7l6-3.5-6-3.5z"/></svg>',
};

const BELL_OFF_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 22a2.2 2.2 0 0 0 2.2-2.2h-4.4A2.2 2.2 0 0 0 12 22zm7.2-5.5-1.5-1.5V10a5.7 5.7 0 0 0-4.4-5.5V3.8a1.3 1.3 0 1 0-2.6 0v.7c-.3.1-.6.2-.9.3L19.2 16.5zM4.3 3.7 2.9 5.1l3.4 3.4c-.2.5-.3 1-.3 1.5v5l-1.5 1.5v1.1h12.6l2.1 2.1 1.4-1.4L4.3 3.7z"/></svg>';

const defaults = unfeedDefaultState();

const list = document.getElementById("site-list");
const planEl = document.getElementById("plan");
const upgradeEl = document.getElementById("upgrade");
const licenseInput = document.getElementById("license-input");
const licenseBtn = document.getElementById("license-btn");
const licenseMsg = document.getElementById("license-msg");

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

function hintFor(enabled) {
  return enabled ? "Feed removed" : "Feed visible";
}

function countEnabled(state) {
  return SITES.reduce((n, s) => n + (state[s.id] ? 1 : 0), 0);
}

function rowHtml(site, enabled) {
  const icon = SITE_ICONS[site.id] || "";
  return `
    <label class="row" for="${site.id}">
      <span class="row-left">
        ${icon}
        <span class="platform">${site.label}</span>
        <span class="hint ${enabled ? "" : "is-off"}" data-hint-for="${site.id}">${hintFor(enabled)}</span>
      </span>
      <input
        type="checkbox"
        id="${site.id}"
        class="toggle"
        data-storage-key="${site.id}"
        ${enabled ? "checked" : ""}
        role="switch"
      />
    </label>
  `;
}

function renderPlan(state) {
  if (state.proUnlocked) {
    planEl.innerHTML = `<span class="plan-badge plan-pro">${BELL_OFF_ICON}Pro</span>`;
    upgradeEl.hidden = true;
    return;
  }
  planEl.innerHTML = `<span class="plan-badge">${BELL_OFF_ICON}Free</span>`;
  upgradeEl.hidden = false;
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
      // Content script not injected yet.
    }
  }
}

async function broadcastMany(state) {
  for (const site of SITES) {
    await broadcast(site.id, !!state[site.id]);
  }
}

function wireToggles() {
  list.querySelectorAll(".toggle").forEach((toggle) => {
    toggle.addEventListener("change", async () => {
      const key = toggle.dataset.storageKey;
      const wantOn = toggle.checked;
      const current = await chrome.storage.sync.get(defaults);

      if (wantOn && !current.proUnlocked) {
        const othersOn = countEnabled({ ...current, [key]: false });
        if (othersOn >= FREE_LIMIT) {
          toggle.checked = false;
          licenseMsg.textContent = `Free includes ${FREE_LIMIT} sites. Turn one off, or unlock Pro.`;
          licenseMsg.className = "license-msg warn";
          upgradeEl.hidden = false;
          return;
        }
      }

      await chrome.storage.sync.set({ [key]: wantOn });
      const hint = list.querySelector(`[data-hint-for="${key}"]`);
      if (hint) {
        hint.textContent = hintFor(wantOn);
        hint.classList.toggle("is-off", !wantOn);
      }
      renderPlan({ ...current, [key]: wantOn });
      licenseMsg.textContent = "";
      licenseMsg.className = "license-msg";
      await broadcast(key, wantOn);
    });
  });
}

async function unlockPro() {
  await chrome.storage.sync.set({ proUnlocked: true });
  const state = await chrome.storage.sync.get(defaults);
  renderPlan({ ...state, proUnlocked: true });
  licenseMsg.textContent = "Pro unlocked. Enable every site you want.";
  licenseMsg.className = "license-msg ok";
  licenseInput.value = "";
}

licenseBtn.addEventListener("click", async () => {
  const code = licenseInput.value.trim().toUpperCase();
  if (!code) {
    licenseMsg.textContent = "Enter a license key.";
    licenseMsg.className = "license-msg warn";
    return;
  }
  if (code === DEV_PRO_CODE) {
    await unlockPro();
    return;
  }
  licenseMsg.textContent = "That key isn’t valid yet. Checkout coming later.";
  licenseMsg.className = "license-msg warn";
});

licenseInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") licenseBtn.click();
});

async function load() {
  let stored = await chrome.storage.sync.get(defaults);
  const { state, changed } = unfeedClampFreeTier(stored);
  stored = state;

  if (changed) {
    const patch = Object.fromEntries(SITES.map((s) => [s.id, !!stored[s.id]]));
    await chrome.storage.sync.set(patch);
    await broadcastMany(stored);
  }

  list.innerHTML = SITES.map((site) => rowHtml(site, !!stored[site.id])).join("");
  renderPlan(stored);
  wireToggles();
}

load();

document.getElementById("privacy-link")?.addEventListener("click", (e) => {
  e.preventDefault();
  const url = chrome.runtime.getURL("privacy.html");
  chrome.tabs.create({ url });
});
