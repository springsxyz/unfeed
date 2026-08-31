const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.join(__dirname, "..");

/** Run a content script with a stub bindSite, and hand back its config. */
function loadSite(name) {
  let config = null;
  const context = {
    UnFeed: { bindSite: (options) => (config = options) },
    window: {},
    document: {},
    location: { pathname: "/", search: "" },
    chrome: { storage: { sync: {} }, runtime: {} },
  };
  context.globalThis = context;
  vm.runInNewContext(
    fs.readFileSync(path.join(root, "content", `${name}.js`), "utf8"),
    context,
    { filename: `content/${name}.js` }
  );
  assert.ok(config, `${name}.js did not call UnFeed.bindSite`);
  return config;
}

// Threads hides all of <main> on "feed", and TikTok freezes scroll there, so a
// default of "feed" blanked every route the matcher didn't already know about.
for (const name of ["threads", "tiktok"]) {
  test(`${name}: unknown routes fall back to "other", not "feed"`, () => {
    const { getSurface } = loadSite(name);
    for (const route of ["/login", "/about", "/press", "/some-new-route"]) {
      assert.equal(getSurface(route), "other", `${route} must stay untouched`);
    }
  });
}

test("threads: real feed routes are still detected", () => {
  const { getSurface } = loadSite("threads");
  assert.equal(getSurface("/"), "feed");
  assert.equal(getSurface("/for_you"), "feed");
  assert.equal(getSurface("/following"), "feed");
  assert.equal(getSurface("/explore"), "explore");
  assert.equal(getSurface("/@someone"), "profile");
  assert.equal(getSurface("/@someone/post/abc"), "post");
  assert.equal(getSurface("/search"), "search");
});

test("tiktok: real feed routes are still detected", () => {
  const { getSurface } = loadSite("tiktok");
  assert.equal(getSurface("/"), "feed");
  assert.equal(getSurface("/foryou"), "feed");
  assert.equal(getSurface("/following"), "feed");
  assert.equal(getSurface("/explore"), "feed");
  assert.equal(getSurface("/@someone"), "profile");
  assert.equal(getSurface("/@someone/video/123"), "video");
  assert.equal(getSurface("/search?q=x"), "search");
});

test("every site locks scroll only on surfaces its getSurface can return", () => {
  const sites = fs
    .readdirSync(path.join(root, "content"))
    .map((file) => path.basename(file, ".js"));

  for (const name of sites) {
    const { getSurface, scrollLockSurfaces = [] } = loadSite(name);
    if (!scrollLockSurfaces.length) continue;

    const reachable = new Set(
      [
        "/", "/home", "/feed", "/explore", "/reels", "/foryou", "/following",
        "/mynetwork", "/watch", "/for_you", "/notes", "/discover",
      ].map((route) => getSurface(route))
    );

    for (const surface of scrollLockSurfaces) {
      assert.ok(
        reachable.has(surface),
        `${name}: scrollLockSurfaces has "${surface}" but no route maps to it`
      );
    }
  }
});
