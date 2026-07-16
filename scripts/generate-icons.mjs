/**
 * UnFeed extension icon — locked D3 wipe on ink tile.
 * Full-bleed ink plate (Chrome masks to squircle) so it doesn’t float on white UI.
 * Run: npm run icons
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildAll, setActive } from "./explore-feed-disappear.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

await buildAll();
await setActive("d3");

// Keep exploration labeled final
const explore = join(root, "icons", "exploration");
mkdirSync(explore, { recursive: true });
copyFileSync(
  join(root, "icons", "packs", "d3", "icon128.png"),
  join(explore, "FINAL-d3-ink-tile-128.png")
);

console.log("Locked: D3 wipe on ink tile → icons/icon*.png");
