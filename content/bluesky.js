(() => {
  const STYLE_ID = "unfeed-bsky-injected";
  const HIDDEN = "data-unfeed-bsky-hidden";

  const ACTIVE_CSS = `
html.unfeed-bsky-on[data-unfeed-surface="feed"] [data-testid="postsFeed-flatlist"],
html.unfeed-bsky-on[data-unfeed-surface="feed"] [data-testid="followingFeed-flatlist"],
html.unfeed-bsky-on[data-unfeed-surface="feed"] [data-testid="customFeed-flatlist"],
html.unfeed-bsky-on[data-unfeed-surface="feed"] [data-testid^="feedItem-"],
html.unfeed-bsky-on[data-unfeed-surface="feed"] div[data-testid*="Feed"],
html.unfeed-bsky-on[data-unfeed-surface="feed"] [role="feed"],
html.unfeed-bsky-on[data-unfeed-surface="discover"] [data-testid^="feedItem-"],
html.unfeed-bsky-on[data-unfeed-surface="discover"] [role="feed"],
html.unfeed-bsky-on[data-unfeed-surface="search"] [data-testid="exploreScreenContent"] [data-testid^="feedItem-"] {
  display: none !important;
  visibility: hidden !important;
  max-height: 0 !important;
  overflow: hidden !important;
  pointer-events: none !important;
}

html.unfeed-bsky-on[data-unfeed-surface="feed"],
html.unfeed-bsky-on[data-unfeed-surface="feed"] body,
html.unfeed-bsky-on[data-unfeed-surface="discover"],
html.unfeed-bsky-on[data-unfeed-surface="discover"] body {
  overflow: hidden !important;
  overscroll-behavior: none !important;
}
`;

  function getSurface(pathname) {
    if (pathname.startsWith("/profile/") && pathname.includes("/post/")) return "post";
    if (pathname.includes("/post/")) return "post";
    if (pathname.startsWith("/profile/")) return "profile";
    if (pathname.startsWith("/messages") || pathname.startsWith("/messages/")) {
      return "messages";
    }
    if (pathname.startsWith("/settings") || pathname.startsWith("/lists/")) {
      return "settings";
    }
    if (pathname.startsWith("/search")) return "search";
    if (
      pathname.startsWith("/feeds") ||
      pathname === "/discover" ||
      pathname.startsWith("/discover") ||
      pathname.startsWith("/starter-packs")
    ) {
      return "discover";
    }
    // Home / Following / custom feed hub
    if (
      pathname === "/" ||
      pathname === "" ||
      pathname.startsWith("/?") ||
      pathname === "/home" ||
      pathname.startsWith("/feed/")
    ) {
      return "feed";
    }
    return "other";
  }

  function ensureCss(on) {
    let el = document.getElementById(STYLE_ID);
    if (!on) {
      el?.remove();
      return;
    }
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID;
      document.documentElement.appendChild(el);
    }
    el.textContent = ACTIVE_CSS;
  }

  function hideNodes() {
    if (!document.documentElement.classList.contains("unfeed-bsky-on")) return;
    const surface = document.documentElement.dataset.unfeedSurface;
    if (surface !== "feed" && surface !== "discover" && surface !== "search") return;

    const sels =
      surface === "search"
        ? ['[data-testid="exploreScreenContent"] [data-testid^="feedItem-"]']
        : [
            '[data-testid="postsFeed-flatlist"]',
            '[data-testid="followingFeed-flatlist"]',
            '[data-testid="customFeed-flatlist"]',
            '[data-testid^="feedItem-"]',
            'div[data-testid*="Feed"]',
            '[role="feed"]',
          ];

    for (const sel of sels) {
      document.querySelectorAll(sel).forEach((node) => {
        if (node.closest("nav") || node.closest('[role="navigation"]')) return;
        node.style.setProperty("display", "none", "important");
        node.setAttribute(HIDDEN, "1");
      });
    }

    // Top-bar Feeds hashtag only — keep left-nav "Feeds"
    if (surface === "feed" || surface === "discover") {
      document
        .querySelectorAll(
          'a[href="/feeds"], a[href^="/feeds"], a[aria-label="Feeds"], a[aria-label*="Feeds" i], [data-testid="feedsTab"], [href="/feeds"]'
        )
        .forEach((node) => {
          if (node.closest("nav") || node.closest('[role="navigation"]')) return;
          // Sidebar rows include the "Feeds" label text; top bar is icon-only
          const label = (node.textContent || "").replace(/\s+/g, " ").trim();
          if (/feeds/i.test(label)) return;
          node.style.setProperty("display", "none", "important");
          node.setAttribute(HIDDEN, "1");
        });
    }
  }

  function restore() {
    document.querySelectorAll(`[${HIDDEN}]`).forEach((n) => {
      n.style.removeProperty("display");
      n.removeAttribute(HIDDEN);
    });
  }

  function apply(state) {
    ensureCss(state.enabled);
    if (state.enabled) hideNodes();
    else restore();
  }

  UnFeed.bindSite({
    storageKey: "blueskyEnabled",
    className: "unfeed-bsky-on",
    getSurface,
    scrollLockSurfaces: ["feed", "discover"],
    onEnable: apply,
    onDisable: apply,
    onMutation: apply,
  });
})();
