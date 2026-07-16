/**
 * Alt mark: open loop (C2 refined) — for A/B if feed-cut isn't preferred.
 * Run: node scripts/generate-icons-loop.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "icons");
const PAPER = "#f4f2ec";
const INK = "#0a0a0a";

function loopSvg() {
  // Thick ring, single hard gap at ~1:30, flat butt caps
  // Gap ~55° for 16px legibility
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="${PAPER}"/>
  <path d="M 702 318
           A 250 250 0 1 1 648 268"
        fill="none"
        stroke="${INK}"
        stroke-width="108"
        stroke-linecap="butt"/>
</svg>`;
}

mkdirSync(iconsDir, { recursive: true });
const svg = loopSvg();
writeFileSync(join(iconsDir, "exploration", "FINAL-loop-alt.svg"), svg);
await sharp(Buffer.from(svg)).resize(128, 128).png().toFile(join(iconsDir, "exploration", "FINAL-loop-alt-128.png"));
await sharp(Buffer.from(svg)).resize(16, 16).png().toFile(join(iconsDir, "exploration", "FINAL-loop-alt-16.png"));
console.log("Wrote loop alt to icons/exploration/FINAL-loop-alt-*.png");
