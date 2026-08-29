/**
 * Generate the active UnFeed extension icon sizes from the browser/feed-cut
 * bitmap master.
 *
 * Run: npm run icons
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { copyFileSync, unlinkSync } from "node:fs";
import sharp from "sharp";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");
const iconsDir = join(root, "icons");
const master = join(iconsDir, "unfeed-icon-master.png");

for (const size of [16, 48, 128]) {
  const output = join(iconsDir, `icon${size}.png`);
  const temporary = `${output}.next`;
  await sharp(master)
    .resize(size, size, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .png({ compressionLevel: 9, palette: size <= 48 })
    .toFile(temporary);
  copyFileSync(temporary, output);
  unlinkSync(temporary);
}

console.log("Generated browser/feed-cut icon → icons/icon16.png, icon48.png, icon128.png");
