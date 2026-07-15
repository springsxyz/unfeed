(() => {
  const STYLE_ID = "unfeed-th-injected";
  const HIDDEN = "data-unfeed-th-hidden";

  // Threads is IG/Meta-style — obscure layout; nuke main column on feed routes
  const ACTIVE_CSS = `
html.unfeed-th-on[data-unfeed-surface="feed"] [role="main"],
html.unfeed-th-on[data-unfeed-surface="feed"] main,
html.unfeed-th-on[data-unfeed-surface="explore"] [role="main"],
html.unfeed-th-on[data-unfeed-surface="explore"] main {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  max-height: 0 !important;
  overflow: hidden !important;
  pointer-events: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

html.unfeed-th-on[data-unfeed-surface="feed"] [role="feed"],
html.unfeed-th-on[data-unfeed-surface="feed"] [role="article"],
html.unfeed-th-on[data-unfeed-surface="feed"] [role="region"],
html.unfeed-th-on[data-unfeed-surface="explore"] [role="feed"],
html.unfeed-th-on[data-unfeed-surface="explore"] [role="article"] {
  display: none !important;
}

html.unfeed-th-on[data-unfeed-surface="feed"],
html.unfeed-th-on[data-unfeed-surface="feed"] body,
html.unfeed-th-on[data-unfeed-surface="explore"],
html.unfeed-th-on[data-unfeed-surface="explore"] body {
  overflow: hidden !important;
  overscroll-behavior: none !important;
}
`;

  function getSurface(pathname) {
    const path = pathname || "/";

    if (path.startsWith("/t/") || path.includes("/post/")) return "post";
    if (path.startsWith("/@")) return "profile";
    if (path.startsWith("/search")) return "search";
    if (
      path.startsWith("/activity") ||
      path.startsWith("/notifications") ||
      path.startsWith("/inbox") ||
      path.startsWith("/messages")
    ) {
      return "messages";
    }
    if (
      path.startsWith("/settings") ||
      path.startsWith("/privacy") ||
      path.startsWith("/account")
    ) {
      return "settings";
    }
    if (path.startsWith("/explore") || path.startsWith("/search/tags")) {
      return "explore";
    }
    // Default home / tabs
    if (
      path === "/" ||
      path === "/for_you" ||
      path === "/following" ||
      path.startsWith("/for_you") ||
      path.startsWith("/following") ||
      path === "/text_post" ||
      path.startsWith("/live")
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
    } else if (el.parentNode !== document.documentElement) {
      document.documentElement.appendChild(el);
    }
    el.textContent = ACTIVE_CSS;
  }

  function markHidden(node) {
    if (!node || node.getAttribute(HIDDEN) === "1") return;
    if (node.closest("nav") || node.closest('[role="navigation"]') || node.closest('[role="banner"]')) {
      return;
    }
    node.style.setProperty("display", "none", "important");
    node.setAttribute(HIDDEN, "1");
  }

  function hideNodes() {
    if (!document.documentElement.classList.contains("unfeed-th-on")) return;
    const surface = document.documentElement.dataset.unfeedSurface;
    if (surface !== "feed" && surface !== "explore") return;

    document.querySelectorAll('[role="main"], main').forEach(markHidden);

    document
      .querySelectorAll(
        '[role="feed"], [role="article"], [role="region"], a[href*="/post/"]'
      )
      .forEach((node) => {
        // Hide the post card, not just the link — climb a few levels
        if (node.tagName === "A" && node.getAttribute("href")?.includes("/post/")) {
          let el = node;
          for (let i = 0; i < 6 && el.parentElement; i++) {
            el = el.parentElement;
            if (el.getAttribute("role") === "article" || el.getAttribute("role") === "region") {
              markHidden(el);
              return;
            }
          }
          markHidden(node.closest("div"));
          return;
        }
        markHidden(node);
      });
  }

  function restore() {
    document.querySelectorAll(`[${HIDDEN}]`).forEach((n) => {
      n.style.removeProperty("display");
      n.style.removeProperty("visibility");
      n.removeAttribute(HIDDEN);
    });
  }

  function apply(state) {
    ensureCss(!!state.enabled);
    if (state.enabled) hideNodes();
    else restore();
  }

  UnFeed.bindSite({
    storageKey: "threadsEnabled",
    className: "unfeed-th-on",
    getSurface,
    scrollLockSurfaces: ["feed", "explore"],
    onEnable: apply,
    onDisable: apply,
    onMutation: apply,
  });
})();
