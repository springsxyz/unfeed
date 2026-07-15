(() => {
  const HIDDEN = "data-unfeed-li-hidden";

  const FEED_SELECTORS = [
    '[data-view-name="feed-full-update"]',
    '[data-view-name="feed-mini-update"]',
    'div[componentkey*="FeedType_MAIN_FEED"]',
    'div[componentkey*="FeedType_FOLLOWING"]',
    '[data-testid="mainFeed"] [data-finite-scroll-hotkey-item]',
    'main[aria-label="Main Feed"] [data-finite-scroll-hotkey-item]',
    "main.scaffold-layout__main .scaffold-finite-scroll__content > div",
    ".feed-shared-update-v2",
    ".occludable-update",
    ".scaffold-finite-scroll__loader",
    "progressive-loader",
  ];

  function getSurface(pathname) {
    if (pathname.startsWith("/messaging") || pathname.startsWith("/inbox")) {
      return "messages";
    }
    if (pathname.startsWith("/search") || pathname.startsWith("/jobs")) {
      return "search";
    }
    if (pathname.startsWith("/in/")) return "profile";
    if (pathname.startsWith("/company/") || pathname.startsWith("/school/")) {
      return "company";
    }
    if (pathname === "/mynetwork" || pathname.startsWith("/mynetwork/")) {
      return "network";
    }
    if (
      pathname === "/feed" ||
      pathname.startsWith("/feed/") ||
      pathname === "/" ||
      pathname === "/preload" ||
      pathname.startsWith("/recent-activity")
    ) {
      return "feed";
    }
    return "other";
  }

  function isShareComposer(el) {
    if (!el || !el.closest) return false;
    return Boolean(
      el.closest(".share-box-feed-entry") ||
        el.closest(".share-creation-state") ||
        el.closest('[data-view-name="share-box"]') ||
        el.closest('[data-view-name*="share-box"]') ||
        el.closest('[data-testid*="share-box"]')
    );
  }

  function hideFeedNodes() {
    const surface = document.documentElement.dataset.unfeedSurface;
    if (surface !== "feed" && surface !== "network") return;

    for (const sel of FEED_SELECTORS) {
      document.querySelectorAll(sel).forEach((el) => {
        if (isShareComposer(el)) return;
        if (el.getAttribute(HIDDEN) === "1") return;
        el.style.setProperty("display", "none", "important");
        el.setAttribute(HIDDEN, "1");
      });
    }

    if (surface === "feed") {
      document.querySelectorAll("div[componentkey]").forEach((el) => {
        const key = el.getAttribute("componentkey") || "";
        if (!/FeedType_/i.test(key)) return;
        if (isShareComposer(el)) return;
        if (el.getAttribute(HIDDEN) === "1") return;
        el.style.setProperty("display", "none", "important");
        el.setAttribute(HIDDEN, "1");
      });
    }
  }

  function restoreFeedNodes() {
    document.querySelectorAll(`[${HIDDEN}]`).forEach((el) => {
      el.style.removeProperty("display");
      el.removeAttribute(HIDDEN);
    });
  }

  UnFeed.bindSite({
    storageKey: "linkedinEnabled",
    className: "unfeed-li-on",
    getSurface,
    scrollLockSurfaces: ["feed", "network"],
    onEnable() {
      hideFeedNodes();
    },
    onDisable() {
      restoreFeedNodes();
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("resize"));
        window.dispatchEvent(new Event("scroll"));
      });
    },
    onMutation() {
      hideFeedNodes();
    },
  });
})();
