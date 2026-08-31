const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), "utf8");

/**
 * Run shared/config.js + shared/site.js against a DOM stub thin enough to be
 * readable, then bind a site and report whether it ended up enabled.
 */
function bindWith(stored, storageKey = "youtubeEnabled") {
  const classes = new Set();
  const documentElement = {
    classList: {
      contains: (name) => classes.has(name),
      toggle: (name, on) => (on ? classes.add(name) : classes.delete(name)),
    },
    dataset: {},
  };

  const context = {
    document: {
      documentElement,
      querySelectorAll: () => [],
      addEventListener() {},
    },
    window: {
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {},
      scrollTo() {},
      scrollX: 0,
    },
    location: { pathname: "/", search: "" },
    history: { pushState() {}, replaceState() {} },
    chrome: {
      storage: {
        sync: { get: (keys, cb) => cb({ ...stored }) },
        onChanged: { addListener() {} },
      },
    },
    Event: class {
      constructor(type) {
        this.type = type;
      }
    },
    MutationObserver: class {
      observe() {}
    },
    setInterval: () => 0,
    clearInterval() {},
    setTimeout: () => 0,
    clearTimeout() {},
  };
  context.globalThis = context;
  vm.createContext(context);

  for (const file of ["config.js", "site.js"]) {
    vm.runInContext(read("shared", file), context, { filename: `shared/${file}` });
  }

  context.window.UnFeed.bindSite({ storageKey, className: "unfeed-yt-on" });
  return classes.has("unfeed-yt-on");
}

test("an unseeded key falls back to the shipped default, not to off", () => {
  // The service worker seeds storage asynchronously, so a tab can read before
  // it lands. Treating undefined as "off" made the popup (which reads through
  // unfeedDefaultState) claim every site was on while nothing was blocked.
  assert.equal(bindWith({}), true);
});

test("an explicit false is still honoured", () => {
  assert.equal(bindWith({ youtubeEnabled: false }), false);
});

test("an explicit true is still honoured", () => {
  assert.equal(bindWith({ youtubeEnabled: true }), true);
});

test("a site left out of the defaults stays off when unseeded", () => {
  const context = { globalThis: {} };
  vm.runInNewContext(read("shared", "config.js"), context);
  const defaults = context.globalThis.UNFEED_DEFAULT_ENABLED;

  // Guards the fallback itself rather than today's all-on list: drop a site
  // from UNFEED_DEFAULT_ENABLED and this must start failing closed.
  assert.ok(defaults.includes("youtubeEnabled"));
  assert.equal(bindWith({}, "notASiteEnabled"), false);
});
