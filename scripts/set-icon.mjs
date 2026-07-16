/**
 * Set active UnFeed extension icon to a disappear variant.
 * Usage: node scripts/set-icon.mjs d1|d2|d3|d4
 */
import { buildAll, setActive } from "./explore-feed-disappear.mjs";

const id = process.argv[2];
if (!id) {
  console.error("Usage: node scripts/set-icon.mjs d1|d2|d3|d4");
  process.exit(1);
}

await buildAll();
await setActive(id);
