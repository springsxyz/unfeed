const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const popup = fs.readFileSync(path.join(root, "popup", "popup.html"), "utf8");

test("every manifest asset exists", () => {
  const files = [manifest.background.service_worker, manifest.action.default_popup];
  for (const script of manifest.content_scripts) files.push(...script.js, ...script.css);
  for (const file of files) assert.equal(fs.existsSync(path.join(root, file)), true, `Missing ${file}`);
});

test("content scripts run early and share the site bootstrap", () => {
  for (const script of manifest.content_scripts) {
    assert.equal(script.run_at, "document_start");
    assert.equal(script.js[0], "shared/site.js");
  }
});

test("free extension has no payment or license host access", () => {
  assert.equal(
    manifest.host_permissions.some((permission) => permission.includes("polar.sh")),
    false
  );
});

test("popup exposes bulk controls without a paywall", () => {
  assert.match(popup, /id="enable-all"/);
  assert.match(popup, /id="disable-all"/);
  assert.doesNotMatch(popup, /Buy Pro|License key|Unlock all sites/i);
  assert.doesNotMatch(popup, /dev-unlock/i);
});
