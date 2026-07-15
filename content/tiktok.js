(() => {
  const STYLE_ID = "unfeed-tt-injected";
  const HIDDEN = "data-unfeed-tt-hidden";

  const ACTIVE_CSS = `
html.unfeed-tt-on[data-unfeed-surface="feed"] #main-content-homepage,
html.unfeed-tt-on[data-unfeed-surface="feed"] #main-content-foryou,
html.unfeed-tt-on[data-unfeed-surface="feed"] #main-content-following,
html.unfeed-tt-on[data-unfeed-surface="feed"] #main-content-explore,
html.unfeed-tt-on[data-unfeed-surface="feed"] #column-list-container,
html.unfeed-tt-on[data-unfeed-surface="feed"] [data-e2e="recommend-list-item-container"],
html.unfeed-tt-on[data-unfeed-surface="feed"] article[data-e2e="recommend-list-item-container"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [data-e2e="recommend-list-item"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [data-e2e="explore-item"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [data-e2e="browse-video"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [class*="DivItemContainer"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [class*="DivVideoFeed"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [class*="DivVideoContainer"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [class*="OneColumnGridContainer"],
html.unfeed-tt-on[data-unfeed-surface="feed"] [class*="DivTwoColumnContainer"] {
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

html.unfeed-tt-on[data-unfeed-surface="feed"] video {
  display: none !important;
}

/* Leftover browse chrome (up/down feed arrows) */
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
`

  function getSurface(pathname) {
    if (/^\/@[^/]+\/video\//.test(pathname) || pathname.startsWith("/video/")) {
      return "video";
    }
    if (pathname.startsWith("/messages") || pathname.startsWith("/inbox")) {
      return "messages";
    }
    if (pathname.startsWith("/search") || pathname.startsWith("/find")) {
      return "search";
    }
    if (
      pathname.startsWith("/setting") ||
      pathname.startsWith("/legal") ||
      pathname.startsWith("/upload")
    ) {
      return "settings";
    }
    if (/^\/@[^/]+$/.test(pathname) || pathname.startsWith("/@") && !pathname.includes("/video/")) {
      // /@user or /@user/ something that isn't video
      if (/^\/@[^/]+\/?$/.test(pathname)) return "profile";
      if (/^\/@[^/]+\//.test(pathname) && !pathname.includes("/video/")) return "profile";
    }
    if (
      pathname === "/" ||
      pathname === "/foryou" ||
      pathname === "/following" ||
      pathname === "/friends" ||
      pathname.startsWith("/explore") ||
      pathname === "/live" ||
      pathname.startsWith("/live/") ||
      pathname.startsWith("/channel/")
    ) {
      return "feed";
    }
    return "other";
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

  function killMedia() {
    if (document.documentElement.dataset.unfeedSurface !== "feed") return;
    document.querySelectorAll("video, audio").forEach((media) => {
      try {
        media.pause();
        media.muted = true;
        media.removeAttribute("autoplay");
        media.style.setProperty("display", "none", "important");
      } catch {
        /* ignore */
      }
    });
  }

  function hideFeedNodes() {
    if (!document.documentElement.classList.contains("unfeed-tt-on")) return;
    if (document.documentElement.dataset.unfeedSurface !== "feed") return;

    const selectors = [
      "#main-content-homepage",
      "#main-content-foryou",
      "#main-content-following",
      "#main-content-explore",
      "#column-list-container",
      '[data-e2e="recommend-list-item-container"]',
      'article[data-e2e="recommend-list-item-container"]',
      '[data-e2e="recommend-list-item"]',
      '[data-e2e="explore-item"]',
      '[data-e2e="browse-video"]',
      'button[data-e2e="arrow-left"]',
      'button[data-e2e="arrow-right"]',
      'button[aria-label="Go to previous video"]',
      'button[aria-label="Go to next video"]',
    ];

    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach((node) => {
        if (node.closest("nav") || node.closest('[data-e2e="nav-bar"]')) return;
        node.style.setProperty("display", "none", "important");
        node.setAttribute(HIDDEN, "1");
      });
    }

    // Catch hashed Div* feed wrappers that contain videos
    document.querySelectorAll('div[class*="DivVideo"], div[class*="VideoFeed"]').forEach((node) => {
      if (node.closest('[data-e2e="browse-video"]') || node.querySelector("video")) {
        // Only on feed surface — already gated above
        if (node.closest("#app") && !node.closest('[data-e2e="user-page"]')) {
          node.style.setProperty("display", "none", "important");
          node.setAttribute(HIDDEN, "1");
        }
      }
    });

    killMedia();
  }

  function restore() {
    document.querySelectorAll(`[${HIDDEN}]`).forEach((node) => {
      node.style.removeProperty("display");
      node.removeAttribute(HIDDEN);
    });
  }

  function apply(state) {
    ensureInjectedCss(state.enabled);
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
