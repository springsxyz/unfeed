(() => {
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
    if (pathname.startsWith("/search")) return "search";
    if (pathname.startsWith("/chat") || pathname.startsWith("/messages")) {
      return "messages";
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

  UnFeed.bindSite({
    storageKey: "substackEnabled",
    className: "unfeed-ss-on",
    getSurface,
    scrollLockSurfaces: ["feed"],
  });
})();
