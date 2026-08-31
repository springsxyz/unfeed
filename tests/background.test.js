const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), "utf8");

/**
 * Boot background.js the way a classic MV3 service worker does, with
 * importScripts resolving against the extension root.
 */
function bootServiceWorker(stored = {}) {
  const sync = { ...stored };
  const removed = [];
  const listeners = { onInstalled: [], onStartup: [] };

  const context = {
    chrome: {
      storage: {
        sync: {
          get: async (keys) => (keys === null ? { ...sync } : { ...sync }),
          set: async (patch) => Object.assign(sync, patch),
          remove: async (keys) => removed.push(...[].concat(keys)),
        },
      },
      runtime: {
        onInstalled: { addListener: (fn) => listeners.onInstalled.push(fn) },
        onStartup: { addListener: (fn) => listeners.onStartup.push(fn) },
      },
    },
  };
  context.globalThis = context;
  vm.createContext(context);

  context.importScripts = (...files) => {
    for (const file of files) {
      vm.runInContext(read(...file.split("/")), context, { filename: file });
    }
  };

  vm.runInContext(read("background.js"), context, { filename: "background.js" });
  return { context, sync, removed, listeners };
}

test("background.js loads its site list from shared/config.js", () => {
  // The two used to hold hand-synced copies; nothing caught them drifting.
  const background = read("background.js");
  assert.match(background, /importScripts\(\s*["']shared\/config\.js["']\s*\)/);
  assert.doesNotMatch(background, /UNFEED_SITES\s*=\s*\[/);
  assert.doesNotMatch(background, /UNFEED_DEFAULT_ENABLED\s*=\s*\[/);
});

test("first install seeds exactly the shared defaults", async () => {
  const { context, sync, listeners } = bootServiceWorker();
  await listeners.onInstalled[0]();

  // Spread into this realm — the VM builds objects on its own Object.prototype.
  const expected = { ...context.unfeedDefaultState() };
  assert.deepEqual(sync, expected);
  assert.deepEqual(
    Object.keys(expected).filter((key) => !expected[key]),
    [],
    "a fresh install should hide every feed"
  );
});

test("existing choices survive a re-run, and legacy billing keys are dropped", async () => {
  const { sync, removed, listeners } = bootServiceWorker({
    youtubeEnabled: false,
    proUnlocked: true,
  });
  await listeners.onInstalled[0]();

  // Widening the defaults must not reach back into settled installs: YouTube
  // stays off because the user turned it off, while Reddit — never set — picks
  // up the new on-by-default.
  assert.equal(sync.youtubeEnabled, false, "must not overwrite a user's choice");
  assert.equal(sync.redditEnabled, true, "unset sites still get their default");
  // ensureDefaults runs on load and again per event, so dedupe before comparing.
  assert.deepEqual(
    [...new Set(removed)],
    ["proUnlocked", "licenseKey", "licenseValidatedAt"]
  );
});
