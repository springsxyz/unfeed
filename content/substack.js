(() => {
  const HIDDEN = "data-unfeed-ss-hidden";

  function getSurface(pathname) {
    if (pathname.startsWith("/inbox")) return "inbox";
    if (
      pathname.startsWith("/settings") ||
      pathname.startsWith("/account") ||
      pathname.startsWith("/email-settings")
    ) {
      return "settings";
    }
    if (
      pathname.startsWith("/publish") ||
      pathname.startsWith("/new") ||
      pathname.startsWith("/write")
    ) {
      return "compose";
    }
    if (pathname.startsWith("/search") || pathname.startsWith("/explore")) {
      return "search";
    }
    if (pathname.startsWith("/chat") || pathname.startsWith("/messages")) {
      return "messages";
    }
    if (pathname.startsWith("/activity") || pathname.startsWith("/notifications")) {
      return "activity";
    }
    if (pathname.startsWith("/profile") || pathname.startsWith("/@")) {
      return "profile";
    }
    if (pathname.startsWith("/subscribe") || pathname.startsWith("/checkout")) {
      return "utility";
    }
    if (/\/p\/[^/]+/.test(pathname)) return "post";

    if (
      pathname === "/" ||
      pathname === "/home" ||
      pathname.startsWith("/home/") ||
      pathname === "/notes" ||
      pathname.startsWith("/notes/") ||
      pathname === "/feed" ||
      pathname.startsWith("/feed/") ||
      pathname === "/reader" ||
      pathname.startsWith("/reader/")
    ) {
      return "feed";
    }
    return "other";
  }

  function inNav(node) {
    return Boolean(
      node.closest("nav") ||
        node.closest('[role="navigation"]') ||
        node.closest('a[href="/activity"]') ||
        node.closest('a[href*="/activity"]')
    );
  }

  function markHidden(node) {
    if (!node || node.hasAttribute(HIDDEN) || inNav(node)) return;
    node.style.setProperty("display", "none", "important");
    node.setAttribute(HIDDEN, "1");
  }

  function textOf(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function hideChrome() {
    if (!document.documentElement.classList.contains("unfeed-ss-on")) return;
    if (document.documentElement.dataset.unfeedSurface !== "feed") return;

    // Feed sort dropdown: "For you" / "Following" / etc.
    document
      .querySelectorAll("button, [role='button'], [aria-haspopup='listbox'], [aria-haspopup='menu']")
      .forEach((el) => {
        const t = textOf(el);
        if (!/^(For you|Following|Latest|Top)$/i.test(t)) return;
        if (inNav(el)) return;
        markHidden(
          el.closest("[class*='dropdown']") ||
            el.closest("[class*='Dropdown']") ||
            el.closest("[class*='sort']") ||
            el.closest("[class*='Sort']") ||
            el.closest("[class*='filter']") ||
            el.closest("[class*='Filter']") ||
            el
        );
      });
  }

  function restore() {
    document.querySelectorAll(`[${HIDDEN}]`).forEach((n) => {
      n.style.removeProperty("display");
      n.removeAttribute(HIDDEN);
    });
  }

  function apply(state) {
    if (state.enabled) hideChrome();
    else restore();
  }

  UnFeed.bindSite({
    storageKey: "substackEnabled",
    className: "unfeed-ss-on",
    getSurface,
    scrollLockSurfaces: ["feed"],
    onEnable: apply,
    onDisable: apply,
    onMutation: apply,
  });
})();
