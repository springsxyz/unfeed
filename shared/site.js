/**
 * UnFeed site bootstrap — CSS class + surface attribute, SPA-aware.
 * Loaded before each site content script.
 */
window.UnFeed = window.UnFeed || {};

const SCROLL_LOCK = "unfeed-scroll-lock";

function installGlobalScrollFreeze() {
  if (window.UnFeed._scrollFreezeInstalled) return;
  window.UnFeed._scrollFreezeInstalled = true;

  function locked() {
    return document.documentElement.classList.contains(SCROLL_LOCK);
  }

  function freeze() {
    if (!locked()) return;
    const x = window.scrollX;
    window.scrollTo(x, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.querySelectorAll("[data-unfeed-scroll-root]").forEach((el) => {
      try {
        el.scrollTop = 0;
      } catch {
        /* ignore */
      }
    });
  }

  function block(e) {
    if (!locked()) return;
    e.preventDefault();
    freeze();
  }

  window.addEventListener("wheel", block, { passive: false, capture: true });
  window.addEventListener("touchmove", block, { passive: false, capture: true });
  window.addEventListener(
    "scroll",
    () => {
      if (locked()) freeze();
    },
    { capture: true, passive: true }
  );
  document.addEventListener(
    "scroll",
    (e) => {
      if (!locked()) return;
      const t = e.target;
      if (t && t !== document && t.scrollTop != null) t.scrollTop = 0;
      freeze();
    },
    { capture: true, passive: true }
  );
}

window.UnFeed.bindSite = function bindSite({
  storageKey,
  className,
  /** @returns {string} surface id used for data-unfeed-surface (e.g. home, feed, watch) */
  getSurface,
  /** Surfaces where page scroll + infinite-load should freeze */
  scrollLockSurfaces = [],
  onEnable,
  onDisable,
  /** Extra work when DOM mutates while enabled (e.g. YouTube guide entries) */
  onMutation,
}) {
  const STATE = {
    enabled: false,
    path: location.pathname + location.search,
    surface: "other",
  };

  const lockSurfaces = new Set(scrollLockSurfaces);

  function normalizePath(pathname) {
    const p = pathname || "/";
    if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
    return p || "/";
  }

  function computeSurface() {
    if (typeof getSurface === "function") {
      return getSurface(normalizePath(location.pathname), location) || "other";
    }
    return "other";
  }

  function markScrollRoots() {
    const sels = [
      "main",
      "main[aria-label='Main Feed']",
      ".scaffold-finite-scroll",
      ".scaffold-finite-scroll__content",
      "[data-testid='mainFeed']",
      "#scrollview",
      "[role='main']",
    ];
    for (const sel of sels) {
      document.querySelectorAll(sel).forEach((el) => {
        el.setAttribute("data-unfeed-scroll-root", "1");
      });
    }
  }

  function syncScrollLock() {
    const on =
      STATE.enabled && lockSurfaces.size > 0 && lockSurfaces.has(STATE.surface);
    document.documentElement.classList.toggle(SCROLL_LOCK, on);
    if (on) {
      installGlobalScrollFreeze();
      markScrollRoots();
      window.scrollTo(window.scrollX, 0);
    }
  }

  function applyClass() {
    const root = document.documentElement;
    STATE.surface = computeSurface();
    root.classList.toggle(className, STATE.enabled);
    root.dataset.unfeedPath = normalizePath(location.pathname);
    root.dataset.unfeedSurface = STATE.enabled ? STATE.surface : "off";
    syncScrollLock();
  }

  function setEnabled(enabled) {
    const next = enabled === true;
    const changed = next !== STATE.enabled;
    STATE.enabled = next;
    applyClass();
    if (STATE.enabled) onEnable?.(STATE);
    else if (changed) onDisable?.(STATE);
  }

  function onRouteMaybeChanged() {
    const next = location.pathname + location.search;
    const changed = next !== STATE.path;
    if (changed) STATE.path = next;
    applyClass();
    if (STATE.enabled) onEnable?.(STATE);
  }

  chrome.storage.sync.get([storageKey], (data) => {
    setEnabled(data[storageKey] === true);
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync" || !changes[storageKey]) return;
    setEnabled(changes[storageKey].newValue === true);
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type !== "UNFEED_SETTINGS") return;
    if (msg.storageKey && msg.storageKey !== storageKey) return;
    if (typeof msg[storageKey] === "boolean") {
      setEnabled(msg[storageKey]);
      return;
    }
    if (msg.sites && typeof msg.sites[storageKey] === "boolean") {
      setEnabled(msg.sites[storageKey]);
    }
  });

  if (!window.UnFeed._historyPatched) {
    window.UnFeed._historyPatched = true;
    const wrap = (fn) =>
      function (...args) {
        const ret = fn.apply(this, args);
        window.dispatchEvent(new Event("unfeed:navigate"));
        return ret;
      };
    history.pushState = wrap(history.pushState.bind(history));
    history.replaceState = wrap(history.replaceState.bind(history));
  }

  window.addEventListener("unfeed:navigate", onRouteMaybeChanged);
  window.addEventListener("popstate", onRouteMaybeChanged);
  window.addEventListener("yt-navigate-finish", onRouteMaybeChanged);

  let tick = null;
  const observer = new MutationObserver(() => {
    if (!STATE.enabled) return;
    clearTimeout(tick);
    tick = setTimeout(() => {
      onRouteMaybeChanged();
      onMutation?.(STATE);
    }, 120);
  });

  const startObserver = () => {
    if (!document.documentElement) return;
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  };

  if (document.documentElement) startObserver();
  else document.addEventListener("DOMContentLoaded", startObserver, { once: true });

  applyClass();
  return { setEnabled, STATE };
};
