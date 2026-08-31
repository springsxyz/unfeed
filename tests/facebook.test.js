const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.join(__dirname, "..");

/**
 * Just enough DOM for content/facebook.js's apply() path. Returns the list of
 * nodes it tried to hide, so the assertions read as behaviour rather than
 * string matching.
 */
function runApply({ loggedOut, surface = "home" }) {
  const hidden = [];

  const documentElement = {
    classList: { contains: () => true, toggle() {} },
    dataset: { unfeedSurface: surface },
    appendChild() {},
  };

  const roleMain = {
    style: { setProperty: () => hidden.push("[role=main]"), removeProperty() {} },
    setAttribute() {},
    getAttribute: () => null,
    removeAttribute() {},
    querySelector: () => null, // no role=feed inside — the fallback's trigger
    querySelectorAll: () => [],
    closest: () => null,
  };

  const document = {
    documentElement,
    getElementById: (id) => (id === "login_form" && loggedOut ? {} : null),
    createElement: () => ({ style: {}, remove() {} }),
    querySelector: (sel) =>
      loggedOut && /password|name="pass"/.test(sel) ? {} : null,
    querySelectorAll: (sel) => (sel === '[role="main"]' ? [roleMain] : []),
  };

  let config = null;
  const context = {
    document,
    window: { addEventListener() {}, dispatchEvent() {} },
    location: { pathname: "/", search: "" },
    UnFeed: { bindSite: (opts) => (config = opts) },
    requestAnimationFrame: () => {},
    Event: class {},
  };
  context.globalThis = context;

  vm.runInNewContext(
    fs.readFileSync(path.join(root, "content", "facebook.js"), "utf8"),
    context,
    { filename: "content/facebook.js" }
  );

  config.onEnable({ enabled: true, surface });
  return hidden;
}

test("logged in: the main column fallback still fires when there is no feed", () => {
  assert.deepEqual(runApply({ loggedOut: false }), ["[role=main]"]);
});

test("logged out: the login page is left alone", () => {
  // Facebook's login page has [role="main"] and no feed inside, which used to
  // trip the fallback above and blank it — main went 830px to 0, leaving the
  // page with the single word "Facebook". Verified on www. and m. alike.
  assert.deepEqual(runApply({ loggedOut: true }), []);
});

test("logged out: non-feed surfaces are unaffected either way", () => {
  assert.deepEqual(runApply({ loggedOut: true, surface: "profile" }), []);
  assert.deepEqual(runApply({ loggedOut: false, surface: "profile" }), []);
});
