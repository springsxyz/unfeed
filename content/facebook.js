(() => {
  const STYLE_ID = "unfeed-fb-injected";
  const HIDDEN = "data-unfeed-fb-hidden";

  // Survives FB wiping/rebuilding stylesheets better than extension CSS alone
  const ACTIVE_CSS = `
html.unfeed-fb-on div[role="feed"],
html.unfeed-fb-on [aria-label*="News Feed" i],
html.unfeed-fb-on [aria-label*="Newsfeed" i],
html.unfeed-fb-on [aria-label*="feed de noticias" i],
html.unfeed-fb-on [aria-label*="Feed de noticias" i],
html.unfeed-fb-on [data-pagelet*="Feed" i],
html.unfeed-fb-on [data-pagelet*="Stories" i],
html.unfeed-fb-on[data-unfeed-surface="home"] [role="navigation"] ~ [role="main"],
html.unfeed-fb-on[data-unfeed-surface="home"] [role="main"] [role="article"],
html.unfeed-fb-on[data-unfeed-surface="watch"] [role="main"] [role="article"],
html.unfeed-fb-on[data-unfeed-surface="reels"] [role="main"] [role="article"] {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  max-height: 0 !important;
  overflow: hidden !important;
  margin: 0 !important;
  padding: 0 !important;
  pointer-events: none !important;
}

html.unfeed-fb-on[data-unfeed-surface="home"],
html.unfeed-fb-on[data-unfeed-surface="home"] body,
html.unfeed-fb-on[data-unfeed-surface="watch"],
html.unfeed-fb-on[data-unfeed-surface="watch"] body,
html.unfeed-fb-on[data-unfeed-surface="reels"],
html.unfeed-fb-on[data-unfeed-surface="reels"] body {
  overflow: hidden !important;
  overscroll-behavior: none !important;
}
`;

  function getSurface(pathname) {
    const path = pathname || "/";
    const search = location.search || "";

    if (path.startsWith("/messages") || path.startsWith("/marketplace/item")) {
      return "utility";
    }
    if (
      path.includes("/posts/") ||
      path.includes("/permalink") ||
      /\/photo\/?\d*/.test(path) ||
      /\/videos\/\d+/.test(path)
    ) {
      return "post";
    }
    if (path.startsWith("/watch/") && path.length > 7) return "post";

    if (
      path === "/" ||
      path === "/home" ||
      path === "/home.php" ||
      path.startsWith("/index.php") ||
      path === "/latest" ||
      search.includes("sk=h_")
    ) {
      return "home";
    }
    if (path === "/watch" || path.startsWith("/watch")) return "watch";
    if (path.startsWith("/reel") || path.startsWith("/reels")) return "reels";
    if (path === "/marketplace" || path.startsWith("/marketplace")) return "marketplace";
    if (path.startsWith("/gaming") || path === "/games") return "gaming";
    if (path.startsWith("/groups/")) return "group";
    if (path.startsWith("/profile.php") || path.startsWith("/people/")) return "profile";
    if (/^\/[A-Za-z0-9.]+$/.test(path)) return "profile";
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

  function hideMatches() {
    if (!document.documentElement.classList.contains("unfeed-fb-on")) return;
    const surface = document.documentElement.dataset.unfeedSurface;
    const hideMain =
      surface === "home" || surface === "watch" || surface === "reels";

    const selectors = [
      'div[role="feed"]',
      '[data-pagelet*="Feed"]',
      '[data-pagelet*="feed"]',
      '[data-pagelet*="Stories"]',
      '[aria-label*="News Feed"]',
      '[aria-label*="Newsfeed"]',
      '[aria-label*="feed de noticias" i]',
    ];

    for (const sel of selectors) {
      try {
        document.querySelectorAll(sel).forEach((node) => {
          if (node.closest('[role="navigation"]') || node.closest('[role="banner"]')) {
            return;
          }
          node.style.setProperty("display", "none", "important");
          node.setAttribute(HIDDEN, "1");
        });
      } catch {
        /* invalid selector in older engines for i flag on attr — skip */
      }
    }

    if (hideMain) {
      document.querySelectorAll('[role="main"]').forEach((main) => {
        // Prefer hiding feed children over nuking composer if we can find a feed
        const feed = main.querySelector('[role="feed"]');
        if (feed) {
          feed.style.setProperty("display", "none", "important");
          feed.setAttribute(HIDDEN, "1");
          main.querySelectorAll('[role="article"]').forEach((a) => {
            a.style.setProperty("display", "none", "important");
            a.setAttribute(HIDDEN, "1");
          });
          return;
        }
        // No role=feed — hide main column (NFE approach for new FB)
        if (surface === "home") {
          main.style.setProperty("display", "none", "important");
          main.setAttribute(HIDDEN, "1");
        }
      });
    }
  }

  function restore() {
    document.querySelectorAll(`[${HIDDEN}]`).forEach((node) => {
      node.style.removeProperty("display");
      node.style.removeProperty("visibility");
      node.removeAttribute(HIDDEN);
    });
  }

  function apply(state) {
    ensureInjectedCss(state.enabled);
    if (state.enabled) hideMatches();
    else restore();
  }

  UnFeed.bindSite({
    storageKey: "facebookEnabled",
    className: "unfeed-fb-on",
    getSurface,
    scrollLockSurfaces: ["home", "watch", "reels", "gaming", "marketplace"],
    onEnable: apply,
    onDisable: apply,
    onMutation: apply,
  });
})();
