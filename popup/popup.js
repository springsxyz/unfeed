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
  return `
    <label class="row" for="${site.id}">
      <span class="row-label">
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
  const n = countEnabled(state);
  if (state.proUnlocked) {
    planEl.innerHTML =
      '<span class="plan-badge plan-pro">Pro</span><span>All sites unlocked</span>';
    upgradeEl.hidden = true;
    return;
  }
  planEl.innerHTML = `<span class="plan-badge">Free</span><span><strong>${n}</strong> / ${FREE_LIMIT} sites</span>`;
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
