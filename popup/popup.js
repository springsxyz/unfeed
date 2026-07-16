/* global UNFEED_SITES, UNFEED_FREE_LIMIT, UNFEED_DEFAULT_ENABLED, unfeedDefaultState, unfeedClampFreeTier, UNFEED_CHECKOUT_URL, UNFEED_POLAR_ORG_ID, UNFEED_POLAR_BENEFIT_ID, UNFEED_POLAR_VALIDATE_URL, UNFEED_PRO_PRICE_LABEL, unfeedCheckoutConfigured, SITE_ICONS */

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

/* SITE_ICONS from popup/site-icons.js (generated via npm run sync:icons) */

const defaults = unfeedDefaultState();

const list = document.getElementById("site-list");
const planEl = document.getElementById("plan");
const upgradeEl = document.getElementById("upgrade");
const licenseInput = document.getElementById("license-input");
const licenseBtn = document.getElementById("license-btn");
const licenseMsg = document.getElementById("license-msg");
const buyBtn = document.getElementById("buy-btn");
const proPriceEl = document.getElementById("pro-price");
const bulkEl = document.getElementById("bulk");
const enableAllBtn = document.getElementById("enable-all");
const disableAllBtn = document.getElementById("disable-all");

let rowLimitTimer = null;

if (proPriceEl && typeof UNFEED_PRO_PRICE_LABEL === "string") {
  proPriceEl.textContent = UNFEED_PRO_PRICE_LABEL;
}

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
    planEl.innerHTML = `<span class="plan-badge plan-pro">Pro</span>`;
    upgradeEl.hidden = true;
    if (bulkEl) bulkEl.hidden = false;
    return;
  }
  const n = countEnabled(state);
  planEl.innerHTML = `<span class="plan-badge">Free</span><span class="plan-count">${n} / ${FREE_LIMIT}</span>`;
  upgradeEl.hidden = false;
  if (bulkEl) bulkEl.hidden = true;
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

function clearRowLimits() {
  list.querySelectorAll(".row-limit").forEach((el) => el.remove());
  if (rowLimitTimer) {
    clearTimeout(rowLimitTimer);
    rowLimitTimer = null;
  }
}

function showRowLimit(toggle) {
  clearRowLimits();
  const row = toggle.closest(".row");
  if (!row) return;
  const msg = document.createElement("p");
  msg.className = "row-limit";
  msg.textContent = `Free includes ${FREE_LIMIT} sites. Turn one off, or unlock Pro.`;
  row.insertAdjacentElement("afterend", msg);
  rowLimitTimer = setTimeout(() => {
    msg.remove();
    rowLimitTimer = null;
  }, 4000);
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
          showRowLimit(toggle);
          upgradeEl.hidden = false;
          return;
        }
      }

      clearRowLimits();
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

async function unlockPro(licenseKey) {
  await chrome.storage.sync.set({
    proUnlocked: true,
    licenseKey: licenseKey || "",
  });
  const state = await chrome.storage.sync.get(defaults);
  renderPlan({ ...state, proUnlocked: true });
  licenseMsg.textContent = "Pro unlocked. Enable every site you want.";
  licenseMsg.className = "license-msg ok";
  licenseInput.value = "";
}

async function validatePolarLicense(key) {
  if (!UNFEED_POLAR_ORG_ID) {
    return { ok: false, reason: "not_configured" };
  }

  const body = {
    key,
    organization_id: UNFEED_POLAR_ORG_ID,
  };
  if (UNFEED_POLAR_BENEFIT_ID) {
    body.benefit_id = UNFEED_POLAR_BENEFIT_ID;
  }

  try {
    const res = await fetch(UNFEED_POLAR_VALIDATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.status === 404) {
      return { ok: false, reason: "invalid" };
    }
    if (!res.ok) {
      return { ok: false, reason: "network" };
    }

    const data = await res.json();
    if (data?.status === "granted") {
      return { ok: true };
    }
    return { ok: false, reason: "invalid" };
  } catch {
    return { ok: false, reason: "network" };
  }
}

async function setAllSites(enabled) {
  const current = await chrome.storage.sync.get(defaults);
  if (!current.proUnlocked) return;

  const patch = Object.fromEntries(SITES.map((s) => [s.id, enabled]));
  await chrome.storage.sync.set(patch);
  clearRowLimits();
  list.innerHTML = SITES.map((site) => rowHtml(site, enabled)).join("");
  renderPlan({ ...current, ...patch });
  wireToggles();
  await broadcastMany({ ...current, ...patch });
}

enableAllBtn?.addEventListener("click", () => setAllSites(true));
disableAllBtn?.addEventListener("click", () => setAllSites(false));

buyBtn?.addEventListener("click", () => {
  if (!UNFEED_CHECKOUT_URL) {
    licenseMsg.textContent =
      "Checkout isn’t configured yet. See docs/POLAR.md.";
    licenseMsg.className = "license-msg warn";
    return;
  }
  chrome.tabs.create({ url: UNFEED_CHECKOUT_URL });
});

licenseBtn.addEventListener("click", async () => {
  const code = licenseInput.value.trim();
  if (!code) {
    licenseMsg.textContent = "Enter a license key.";
    licenseMsg.className = "license-msg warn";
    return;
  }

  if (code.toUpperCase() === DEV_PRO_CODE) {
    await unlockPro(code);
    return;
  }

  licenseBtn.disabled = true;
  licenseMsg.textContent = "Checking license…";
  licenseMsg.className = "license-msg";

  const result = await validatePolarLicense(code);
  licenseBtn.disabled = false;

  if (result.ok) {
    await unlockPro(code);
    return;
  }

  if (result.reason === "not_configured") {
    licenseMsg.textContent =
      "Polar isn’t configured yet. Set checkout + org ID (docs/POLAR.md), or use UNFEED-PRO for local QA.";
  } else if (result.reason === "network") {
    licenseMsg.textContent =
      "Couldn’t reach Polar. Check your connection and try again.";
  } else {
    licenseMsg.textContent = "That license key isn’t valid.";
  }
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

  if (buyBtn && !unfeedCheckoutConfigured()) {
    buyBtn.title = "Add Polar checkout URL in shared/config.js";
  }
}

load();

document.getElementById("privacy-link")?.addEventListener("click", (e) => {
  e.preventDefault();
  const url = chrome.runtime.getURL("privacy.html");
  chrome.tabs.create({ url });
});

document.getElementById("site-link")?.addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: "https://unfeed.dev/" });
});
