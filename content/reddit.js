(() => {
  const HIDDEN = "data-unfeed-rd-hidden";

  function getSurface(pathname) {
    if (
      pathname === "/" ||
      pathname === "/home" ||
      pathname === "/r/popular" ||
      pathname === "/r/all" ||
      pathname.startsWith("/r/popular/") ||
      pathname.startsWith("/r/all/")
    ) {
      return "home";
    }
    if (
      pathname.startsWith("/search") ||
      (pathname.startsWith("/r/") && pathname.includes("/search"))
    ) {
      return "search";
    }
    if (/^\/r\/[^/]+\/comments\//.test(pathname) || pathname.startsWith("/comments/")) {
      return "post";
    }
    if (/^\/r\/[^/]+/.test(pathname)) return "community";
    if (pathname.startsWith("/user/") || pathname.startsWith("/u/")) return "profile";
    if (pathname.startsWith("/message") || pathname.startsWith("/chat")) return "messages";
    return "other";
  }

  function inChrome(node) {
    return Boolean(
      node.closest("nav") ||
        node.closest("header") ||
        node.closest('[role="navigation"]') ||
        node.closest("#left-sidebar") ||
        node.closest("#right-sidebar")
    );
  }

  function textOf(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function markHidden(node) {
    if (!node || node.getAttribute(HIDDEN) === "1" || inChrome(node)) return;
    node.style.setProperty("display", "none", "important");
    node.setAttribute(HIDDEN, "1");
  }

  function hideSortChrome() {
    if (!document.documentElement.classList.contains("unfeed-rd-on")) return;
    if (document.documentElement.dataset.unfeedSurface !== "home") return;

    document
      .querySelectorAll(
        "shreddit-sort-dropdown, shreddit-layout-events, [slot='sort'], faceplate-dropdown-menu"
      )
      .forEach((el) => {
        if (inChrome(el)) return;
        const name = (el.getAttribute("name") || "").toLowerCase();
        const t = textOf(el);
        if (
          name === "sort" ||
          el.tagName.toLowerCase().includes("sort") ||
          el.tagName.toLowerCase().includes("layout") ||
          /^(Best|Hot|New|Top|Rising|Controversial)$/i.test(t)
        ) {
          markHidden(el);
        }
      });

    // "Best" / layout row leftover
    document.querySelectorAll("button, [role='button'], span").forEach((el) => {
      if (inChrome(el)) return;
      const t = textOf(el);
      if (!/^(Best|Hot|New|Top|Rising|Controversial)$/i.test(t)) return;
      markHidden(
        el.closest("shreddit-sort-dropdown") ||
          el.closest("faceplate-dropdown-menu") ||
          el.closest("[class*='sort']") ||
          el.parentElement
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
    if (state.enabled) hideSortChrome();
    else restore();
  }

  UnFeed.bindSite({
    storageKey: "redditEnabled",
    className: "unfeed-rd-on",
    getSurface,
    onEnable: apply,
    onDisable: apply,
    onMutation: apply,
  });
})();
