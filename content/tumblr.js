(() => {
  const HIDDEN = "data-unfeed-tm-hidden";

  // Single-segment paths that are Tumblr features, not blog names.
  const RESERVED = new Set([
    "about",
    "apps",
    "blog",
    "changes",
    "dashboard",
    "explore",
    "following",
    "inbox",
    "likes",
    "login",
    "messages",
    "new",
    "policy",
    "privacy",
    "register",
    "search",
    "settings",
    "tagged",
  ]);

  function getSurface(pathname) {
    const path = pathname || "/";

    if (path.startsWith("/inbox") || path.startsWith("/messages")) return "messages";
    if (path.startsWith("/settings") || path.startsWith("/account")) return "settings";
    if (path.startsWith("/new") || path.startsWith("/edit")) return "compose";
    if (path.startsWith("/search") || path.startsWith("/tagged")) return "search";

    // Likes and Following are lists you chose — not discovery.
    if (path.startsWith("/likes") || path.startsWith("/following")) return "library";

    if (path.startsWith("/explore")) return "explore";
    if (path === "/dashboard" || path.startsWith("/dashboard/")) return "feed";
    // Logged in, "/" is the dashboard.
    if (path === "/" || path === "") return "feed";

    if (path.startsWith("/blog/")) return "blog";
    const single = path.match(/^\/([A-Za-z0-9-]+)\/?$/);
    if (single && !RESERVED.has(single[1].toLowerCase())) return "blog";

    return "other";
  }

  function inChrome(node) {
    return Boolean(node.closest("nav") || node.closest('[role="navigation"]'));
  }

  function markHidden(node) {
    if (!node || node.getAttribute(HIDDEN) === "1" || inChrome(node)) return;
    node.style.setProperty("display", "none", "important");
    node.setAttribute(HIDDEN, "1");
  }

  function hideNodes() {
    if (!document.documentElement.classList.contains("unfeed-tm-on")) return;
    const surface = document.documentElement.dataset.unfeedSurface;
    if (surface !== "feed" && surface !== "explore") return;

    // Tumblr ships hashed class names, so posts are matched semantically:
    // every post is an <article>, and the timeline is a <ul> of <li> shells.
    document.querySelectorAll("main article").forEach((post) => {
      markHidden(post.closest("li") || post);
    });
  }

  function restore() {
    document.querySelectorAll(`[${HIDDEN}]`).forEach((node) => {
      node.style.removeProperty("display");
      node.removeAttribute(HIDDEN);
    });
  }

  function apply(state) {
    if (state.enabled) hideNodes();
    else restore();
  }

  UnFeed.bindSite({
    storageKey: "tumblrEnabled",
    className: "unfeed-tm-on",
    getSurface,
    scrollLockSurfaces: ["feed", "explore"],
    onEnable: apply,
    onDisable() {
      restore();
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("resize"));
        window.dispatchEvent(new Event("scroll"));
      });
    },
    onMutation: apply,
  });
})();
