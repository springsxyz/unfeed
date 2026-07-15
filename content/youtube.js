(() => {
  const GUIDE_ATTR = "data-unfeed-hidden-guide";

  function hideGuideLabels() {
    const blockedTitles = new Set(["Shorts", "Trending"]);
    const blockedHref = ["/shorts", "/feed/trending"];

    document
      .querySelectorAll("ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer")
      .forEach((node) => {
        const a = node.querySelector("a");
        if (!a) return;
        const title = (
          a.getAttribute("title") ||
          a.querySelector("yt-formatted-string")?.textContent ||
          ""
        ).trim();
        const href = a.getAttribute("href") || "";
        const blocked =
          blockedTitles.has(title) ||
          blockedHref.some((h) => href === h || href.startsWith(h + "?"));

        if (blocked) {
          node.style.setProperty("display", "none", "important");
          node.setAttribute(GUIDE_ATTR, "1");
        }
      });
  }

  function restoreGuideLabels() {
    document.querySelectorAll(`[${GUIDE_ATTR}]`).forEach((node) => {
      node.style.removeProperty("display");
      node.removeAttribute(GUIDE_ATTR);
    });
  }

  function getSurface(pathname) {
    if (pathname === "/" || pathname === "/feed" || pathname === "/feed/recommended") {
      return "home";
    }
    if (pathname === "/feed/trending" || pathname.startsWith("/feed/trending")) {
      return "trending";
    }
    if (pathname === "/shorts") return "shorts-feed";
    if (pathname.startsWith("/shorts/")) return "shorts-video";
    if (pathname === "/watch" || pathname.startsWith("/watch")) return "watch";
    if (pathname.startsWith("/results")) return "search";
    if (pathname.startsWith("/feed/subscriptions")) return "subscriptions";
    if (pathname.startsWith("/feed/library") || pathname.startsWith("/feed/history")) {
      return "library";
    }
    return "other";
  }

  function feedHasRenderableVideos() {
    return Boolean(
      document.querySelector(
        "ytd-browse ytd-rich-item-renderer, ytd-browse ytd-rich-grid-row, ytd-browse ytd-video-renderer"
      )
    );
  }

  /** SPA remount only — never location.reload(). */
  function softRemountHome() {
    const home =
      document.querySelector("ytd-masthead a#logo") ||
      document.querySelector('ytd-guide-entry-renderer a[href="/"]') ||
      document.querySelector('ytd-mini-guide-entry-renderer a[href="/"]');
    const sub =
      document.querySelector('a[href="/feed/subscriptions"]') ||
      document.querySelector('ytd-guide-entry-renderer a[href="/feed/subscriptions"]');

    if (!home || !sub) {
      home?.click();
      return;
    }

    const onSub = () => {
      window.removeEventListener("yt-navigate-finish", onSub);
      requestAnimationFrame(() => home.click());
    };
    window.addEventListener("yt-navigate-finish", onSub);
    sub.click();
    setTimeout(() => {
      window.removeEventListener("yt-navigate-finish", onSub);
      if (!feedHasRenderableVideos()) home.click();
    }, 1000);
  }

  UnFeed.bindSite({
    storageKey: "youtubeEnabled",
    className: "unfeed-yt-on",
    getSurface,
    onEnable() {
      document.getElementById("unfeed-intent")?.remove();
      hideGuideLabels();
    },
    onDisable(state) {
      document.getElementById("unfeed-intent")?.remove();
      restoreGuideLabels();
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("resize"));
        window.dispatchEvent(new Event("scroll"));
        const feedSurface =
          state.surface === "home" ||
          state.surface === "trending" ||
          state.surface === "shorts-feed";
        if (feedSurface && !feedHasRenderableVideos()) {
          softRemountHome();
        }
      });
    },
    onMutation() {
      hideGuideLabels();
    },
  });
})();
