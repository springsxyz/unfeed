(() => {
  const STYLE_ID = "unfeed-th-injected";
  const HIDDEN = "data-unfeed-th-hidden";

  // Blank the main feed column; keep left nav + bottom compose FAB
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
html.unfeed-th-on[data-unfeed-surface="feed"] [data-pressable-container="true"],
html.unfeed-th-on[data-unfeed-surface="explore"] [role="feed"],
html.unfeed-th-on[data-unfeed-surface="explore"] [role="article"],
html.unfeed-th-on[data-unfeed-surface="explore"] [data-pressable-container="true"] {
  display: none !important;
  visibility: hidden !important;
  max-height: 0 !important;
  overflow: hidden !important;
  pointer-events: none !important;
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
    return "feed";
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
      (document.documentElement || document.head).appendChild(el);
    }
    if (el.parentNode !== document.documentElement && document.documentElement) {
      document.documentElement.appendChild(el);
    }
    el.textContent = ACTIVE_CSS;
  }

  function inLeftRail(node) {
    if (node.closest("nav") || node.closest('[role="navigation"]')) return true;
    try {
      const r = node.getBoundingClientRect();
      if (r.width > 0 && r.left < Math.max(380, window.innerWidth * 0.28)) return true;
    } catch {
      /* ignore */
    }
    return false;
  }

  function textOf(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function markHidden(node) {
    if (!node || node.getAttribute(HIDDEN) === "1") return;
    if (inLeftRail(node)) return;
    node.style.setProperty("display", "none", "important");
    node.setAttribute(HIDDEN, "1");
  }

  function hideMidFloatingChip() {
    // Only the orphan mid-screen compose chip.
    // Keep: left-rail New thread, bottom-right FAB.
    document.querySelectorAll("div, a, button, [role='button']").forEach((el) => {
      if (el.getAttribute(HIDDEN) === "1" || inLeftRail(el)) return;

      let r;
      try {
        r = el.getBoundingClientRect();
      } catch {
        return;
      }

      // Right half, vertically centered — not the bottom FAB
      if (r.left < window.innerWidth * 0.45) return;
      if (r.bottom > window.innerHeight - 100) return;
      if (r.top < 80) return;
      const midY = r.top + r.height / 2;
      if (midY < window.innerHeight * 0.2 || midY > window.innerHeight * 0.8) return;

      // Compact square chip only
      if (r.width < 24 || r.height < 24 || r.width > 56 || r.height > 56) return;
      if (Math.abs(r.width - r.height) > 12) return;
      if (!el.querySelector("svg")) return;

      el.style.setProperty("display", "none", "important");
      el.setAttribute(HIDDEN, "1");
    });
  }

  function hideResidualChrome() {
    document.querySelectorAll("h1, h2, span, div, button, a").forEach((el) => {
      const t = textOf(el);
      if (!/^(For you|Following)$/i.test(t)) return;
      if (inLeftRail(el)) return;

      let target = el;
      for (let i = 0; i < 5 && target.parentElement; i++) {
        const parent = target.parentElement;
        if (inLeftRail(parent)) break;
        const kids = parent.children?.length || 0;
        if (kids > 0 && kids <= 6 && textOf(parent).length < 40) {
          target = parent;
          continue;
        }
        break;
      }
      markHidden(target);
    });

    hideMidFloatingChip();
  }

  function hideNodes() {
    if (!document.documentElement.classList.contains("unfeed-th-on")) return;
    const surface = document.documentElement.dataset.unfeedSurface;
    if (surface !== "feed" && surface !== "explore") return;

    document.querySelectorAll('[role="main"], main').forEach(markHidden);

    document
      .querySelectorAll(
        '[role="feed"], [role="article"], [data-pressable-container="true"], a[href*="/post/"]'
      )
      .forEach((node) => {
        if (inLeftRail(node)) return;
        if (node.tagName === "A" && node.getAttribute("href")?.includes("/post/")) {
          let el = node;
          for (let i = 0; i < 6 && el.parentElement; i++) {
            el = el.parentElement;
            if (
              el.getAttribute("role") === "article" ||
              el.getAttribute("data-pressable-container") === "true"
            ) {
              markHidden(el);
              return;
            }
          }
          markHidden(node.closest("div"));
          return;
        }
        markHidden(node);
      });

    hideResidualChrome();
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
