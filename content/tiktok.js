(() => {
  const STYLE_ID = "unfeed-tt-injected";
  const HIDDEN = "data-unfeed-tt-hidden";

  // Blank the video feed only — keep left nav + top-right profile / actions
  const ACTIVE_CSS = `
html.unfeed-tt-on[data-unfeed-surface="feed"] [id^="main-content-"] #column-list-container,
html.unfeed-tt-on[data-unfeed-surface="feed"] #column-list-container,
html.unfeed-tt-on[data-unfeed-surface="feed"] [data-e2e="recommend-list-item-container"],
html.unfeed-tt-on[data-unfeed-surface="feed"] article[data-e2e="recommend-list-item-container"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [data-e2e="recommend-list-item"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [data-e2e="explore-item"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [data-e2e="browse-video"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [data-e2e="feed-video"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [data-e2e="video-feed"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [class*="DivColumnListContainer"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [class*="DivVideoFeed"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [class*="DivVideoContainer"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [class*="DivBrowserModeContainer"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [class*="StyledVideoModeContainer"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [class*="AsideOneColumnSidebar"] {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  max-height: 0 !important;
  overflow: hidden !important;
  pointer-events: none !important;
}

html.unfeed-tt-on[data-unfeed-surface="feed"],
html.unfeed-tt-on[data-unfeed-surface="feed"] body {
  overflow: hidden !important;
  overscroll-behavior: none !important;
}

html.unfeed-tt-on[data-unfeed-surface="feed"] #column-list-container video,
html.unfeed-tt-on[data-unfeed-surface="feed"] [data-e2e="browse-video"] video {
  display: none !important;
}

html.unfeed-tt-on[data-unfeed-surface="feed"] button[data-e2e="arrow-left"],
html.unfeed-tt-on[data-unfeed-surface="feed"] button[data-e2e="arrow-right"],
html.unfeed-tt-on[data-unfeed-surface="feed"] button[aria-label="Go to previous video"],
html.unfeed-tt-on[data-unfeed-surface="feed"] button[aria-label="Go to next video"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [class*="StyledVideoSwitch"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [class*="DivVideoSwitch"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [class*="VideoSwitch"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [class*="DivBrowse"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [class*="DivArrow"] {
  display: none !important;
}
`;

  function getSurface(pathname) {
    const path = pathname || "/";

    if (/^\/@[^/]+\/video\//.test(path) || path.startsWith("/video/")) {
      return "video";
    }
    if (path.startsWith("/messages") || path.startsWith("/inbox")) {
      return "messages";
    }
    if (path.startsWith("/search") || path.startsWith("/find")) {
      return "search";
    }
    if (
      path.startsWith("/setting") ||
      path.startsWith("/legal") ||
      path.startsWith("/upload") ||
      path.startsWith("/tiktokstudio")
    ) {
      return "settings";
    }
    if (/^\/@[^/]+\/?$/.test(path)) return "profile";
    if (/^\/@[^/]+\//.test(path) && !path.includes("/video/")) return "profile";

    if (
      path === "/" ||
      path === "/foryou" ||
      path.startsWith("/foryou") ||
      path === "/following" ||
      path.startsWith("/following") ||
      path === "/friends" ||
      path.startsWith("/friends") ||
      path.startsWith("/explore") ||
      path === "/live" ||
      path.startsWith("/live/") ||
      path.startsWith("/channel/") ||
      path.startsWith("/music/") ||
      path.startsWith("/tag/")
    ) {
      return "feed";
    }

    return "feed";
  }

  function inChrome(node) {
    return Boolean(
      node.closest("nav") ||
        node.closest("header") ||
        node.closest("#fixed-top-container") ||
        node.closest("#top-right-action-bar") ||
        node.closest('[data-e2e="nav-bar"]') ||
        node.closest('[data-e2e="top-navbar"]') ||
        node.closest('[data-e2e="nav-profile"]') ||
        node.closest('[data-e2e="top-right-action-bar-get-coin"]') ||
        node.closest('[class*="DivSideNav"]') ||
        node.closest('[class*="StyledTUXSideNav"]') ||
        node.closest('[class*="DivFixedTopContainer"]') ||
        node.closest('[class*="DivTopRightContainer"]') ||
        node.closest('[class*="DivActionBarContainer"]') ||
        node.closest('[class*="DivMainNavContainer"]')
    );
  }

  function ensureInjectedCss(on) {
    let el = document.getElementById(STYLE_ID);
    if (!on) {
      el?.remove();
      return;
    }
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID;
      (document.documentElement || document.head).appendChild(el);
    }
    if (el.parentNode !== document.documentElement && document.documentElement) {
      document.documentElement.appendChild(el);
    }
    el.textContent = ACTIVE_CSS;
  }

  function markHidden(node) {
    if (!node || node.getAttribute(HIDDEN) === "1") return;
    if (inChrome(node)) return;
    node.style.setProperty("display", "none", "important");
    node.style.setProperty("visibility", "hidden", "important");
    node.setAttribute(HIDDEN, "1");
  }

  function killMedia() {
    if (document.documentElement.dataset.unfeedSurface !== "feed") return;
    document.querySelectorAll("#column-list-container video, [data-e2e='browse-video'] video, [class*='DivColumnListContainer'] video").forEach((media) => {
      if (inChrome(media)) return;
      try {
        media.pause();
        media.muted = true;
        media.removeAttribute("autoplay");
        media.style.setProperty("display", "none", "important");
        media.setAttribute(HIDDEN, "1");
      } catch {
        /* ignore */
      }
    });
  }

  function hideFeedNodes() {
    if (!document.documentElement.classList.contains("unfeed-tt-on")) return;
    if (document.documentElement.dataset.unfeedSurface !== "feed") return;

    // Never hide whole <main> — top-right profile lives inside it
    const selectors = [
      "#column-list-container",
      '[class*="DivColumnListContainer"]',
      '[class*="AsideOneColumnSidebar"]',
      '[data-e2e="recommend-list-item-container"]',
      'article[data-e2e="recommend-list-item-container"]',
      '[data-e2e="recommend-list-item"]',
      '[data-e2e="explore-item"]',
      '[data-e2e="browse-video"]',
      '[data-e2e="feed-video"]',
      '[data-e2e="video-feed"]',
      'button[data-e2e="arrow-left"]',
      'button[data-e2e="arrow-right"]',
      'button[aria-label="Go to previous video"]',
      'button[aria-label="Go to next video"]',
    ];

    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach(markHidden);
    }

    document
      .querySelectorAll(
        'div[class*="DivVideo"], div[class*="VideoFeed"], div[class*="BrowserMode"]'
      )
      .forEach((node) => {
        if (inChrome(node)) return;
        if (!node.querySelector("video")) return;
        markHidden(node);
      });

    killMedia();
  }

  function restore() {
    document.querySelectorAll(`[${HIDDEN}]`).forEach((node) => {
      node.style.removeProperty("display");
      node.style.removeProperty("visibility");
      node.removeAttribute(HIDDEN);
    });
  }

  function apply(state) {
    ensureInjectedCss(!!state.enabled);
    if (state.enabled) hideFeedNodes();
    else restore();
  }

  UnFeed.bindSite({
    storageKey: "tiktokEnabled",
    className: "unfeed-tt-on",
    getSurface,
    scrollLockSurfaces: ["feed"],
    onEnable: apply,
    onDisable: apply,
    onMutation: apply,
  });
})();
