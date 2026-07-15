(() => {
  function getSurface(pathname) {
    if (pathname.startsWith("/direct")) return "messages";
    if (pathname.startsWith("/accounts") || pathname.startsWith("/emails")) return "settings";
    if (pathname.startsWith("/p/") || pathname.startsWith("/reel/") || pathname.startsWith("/tv/")) {
      return "post";
    }
    if (pathname.startsWith("/stories/")) return "story";
    if (pathname === "/explore" || pathname.startsWith("/explore/")) return "explore";
    if (pathname === "/reels" || pathname === "/reels/videos") return "reels";
    if (pathname === "/") return "home";
    if (/^\/[A-Za-z0-9._]+$/.test(pathname)) return "profile";
    return "other";
  }

  UnFeed.bindSite({
    storageKey: "instagramEnabled",
    className: "unfeed-ig-on",
    getSurface,
    scrollLockSurfaces: ["home", "explore", "reels"],
  });
})();
