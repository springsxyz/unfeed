(() => {
  const LOCK = "unfeed-pin-scroll-lock";

  function getSurface(pathname) {
    if (pathname.startsWith("/pin/")) return "pin";
    if (pathname.startsWith("/search")) return "search";
    if (pathname.startsWith("/settings")) return "settings";
    if (
      pathname === "/" ||
      pathname === "/homefeed" ||
      pathname.startsWith("/today") ||
      pathname.startsWith("/ideas") ||
      pathname.startsWith("/shop") ||
      pathname.startsWith("/video")
    ) {
      return "home";
    }
    if (/^\/[^/]+$/.test(pathname)) return "profile";
    return "other";
  }

  function shouldLock(state) {
    return state.enabled && state.surface === "home";
  }

  function syncLock(state) {
    document.documentElement.classList.toggle(LOCK, shouldLock(state));
  }

  function blockScroll(e) {
    if (!document.documentElement.classList.contains(LOCK)) return;
    e.preventDefault();
  }

  function feedHasPins() {
    return Boolean(
      document.querySelector(
        '[data-test-id="pin"], [data-test-id="pinWrapper"], [data-test-id="standalonePinRep"]'
      )
    );
  }

  /** SPA remount only — never full page reload */
  function softRemountHome() {
    const home =
      document.querySelector('a[href="/"]') ||
      document.querySelector('a[href="/homefeed"]') ||
      document.querySelector('[data-test-id="header-home"]');
    const search =
      document.querySelector('a[href*="/search"]') ||
      document.querySelector('[data-test-id="search-icon"]');

    if (search && home) {
      const back = () => {
        window.removeEventListener("unfeed:navigate", back);
        requestAnimationFrame(() => home.click());
      };
      window.addEventListener("unfeed:navigate", back);
      search.click();
      setTimeout(() => {
        window.removeEventListener("unfeed:navigate", back);
        if (!feedHasPins()) home.click();
      }, 1000);
      return;
    }

    home?.click();
  }

  window.addEventListener("wheel", blockScroll, { passive: false });
  window.addEventListener("touchmove", blockScroll, { passive: false });

  UnFeed.bindSite({
    storageKey: "pinterestEnabled",
    className: "unfeed-pin-on",
    getSurface,
    onEnable(state) {
      syncLock(state);
    },
    onDisable(state) {
      syncLock(state);
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("resize"));
        window.dispatchEvent(new Event("scroll"));
        if (state.surface === "home" && !feedHasPins()) {
          softRemountHome();
        }
      });
    },
    onMutation: syncLock,
  });
})();
