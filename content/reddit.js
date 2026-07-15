(() => {
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

  UnFeed.bindSite({
    storageKey: "redditEnabled",
    className: "unfeed-rd-on",
    getSurface,
  });
})();
