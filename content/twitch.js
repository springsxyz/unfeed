(() => {
  const HIDDEN = "data-unfeed-tw-hidden";

  // Single-segment paths that are Twitch features, not channel names.
  const RESERVED = new Set([
    "about",
    "directory",
    "downloads",
    "drops",
    "friends",
    "inventory",
    "jobs",
    "legal",
    "moderator",
    "p",
    "payments",
    "popout",
    "prime",
    "search",
    "settings",
    "store",
    "subscriptions",
    "turbo",
    "u",
    "videos",
    "wallet",
  ]);

  function getSurface(pathname) {
    const path = pathname || "/";

    // Following is a chosen list, not discovery — same call as YouTube's
    // subscriptions feed, which UnFeed also leaves alone.
    if (path === "/directory/following" || path.startsWith("/directory/following/")) {
      return "following";
    }
    if (path === "/directory" || path.startsWith("/directory/")) return "browse";

    if (path.startsWith("/videos/") || /\/(video|clip)\//.test(path)) return "video";
    if (path.startsWith("/search")) return "search";
    if (
      path.startsWith("/settings") ||
      path.startsWith("/wallet") ||
      path.startsWith("/subscriptions") ||
      path.startsWith("/drops") ||
      path.startsWith("/inventory") ||
      path.startsWith("/payments")
    ) {
      return "settings";
    }
    if (path === "/" || path === "") return "home";

    const single = path.match(/^\/([A-Za-z0-9_]+)\/?$/);
    if (single && !RESERVED.has(single[1].toLowerCase())) return "channel";

    return "other";
  }

  function inChrome(node) {
    return Boolean(
      node.closest("nav") ||
        node.closest('[role="navigation"]') ||
        node.closest('[data-a-target="side-nav-bar"]') ||
        node.closest('[data-a-target="top-nav-container"]')
    );
  }

  function markHidden(node) {
    if (!node || node.getAttribute(HIDDEN) === "1" || inChrome(node)) return;
    node.style.setProperty("display", "none", "important");
    node.setAttribute(HIDDEN, "1");
  }

  /** The front-page carousel autoplays a live stream — that is the hook. */
  function killCarouselMedia() {
    document
      .querySelectorAll('[data-a-target="front-page-carousel"] video, .front-page-carousel video')
      .forEach((media) => {
        try {
          media.pause();
          media.muted = true;
          media.removeAttribute("autoplay");
        } catch {
          /* ignore */
        }
      });
  }

  function hideNodes() {
    if (!document.documentElement.classList.contains("unfeed-tw-on")) return;
    const surface = document.documentElement.dataset.unfeedSurface;
    if (surface !== "home" && surface !== "browse") return;

    // Ads are left alone on purpose — hiding them would make this an ad
    // blocker rather than a feed blocker.
    const selectors =
      surface === "home"
        ? [
            '[data-a-target="front-page-main-content"]',
            '[data-a-target="front-page-carousel"]',
            '[data-a-target="frontpage-headliner-layout"]',
            ".tw-tower",
            // m.twitch.tv keeps every shelf in one role="list"; desktop has none.
            'main [role="list"]',
          ]
        : [".tw-tower", 'main [role="list"]'];

    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach(markHidden);
    }

    if (surface === "home") killCarouselMedia();
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
    storageKey: "twitchEnabled",
    className: "unfeed-tw-on",
    getSurface,
    scrollLockSurfaces: ["home", "browse"],
    onEnable: apply,
    onDisable(state) {
      restore();
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("resize"));
        window.dispatchEvent(new Event("scroll"));
      });
      void state;
    },
    onMutation: apply,
  });
})();
