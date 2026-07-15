(() => {
  function getSurface(pathname) {
    if (pathname === "/home" || pathname === "/") return "home";
    if (pathname === "/explore" || pathname.startsWith("/explore")) return "explore";
    if (pathname.startsWith("/messages") || pathname === "/i/chat") return "messages";
    if (pathname.startsWith("/search")) return "search";
    if (pathname.startsWith("/settings") || pathname.startsWith("/i/")) return "settings";
    // status or user tweet
    if (/\/status\//.test(pathname)) return "post";
    return "other";
  }

  UnFeed.bindSite({
    storageKey: "xEnabled",
    className: "unfeed-x-on",
    getSurface,
  });
})();
