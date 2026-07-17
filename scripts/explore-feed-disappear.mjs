/**
 * Feed-disappear marks (D1–D4) + set active extension icon.
 *
 * Preview all:  node scripts/explore-feed-disappear.mjs
 * Try one:      node scripts/set-icon.mjs d1|d2|d3|d4
 */
import { mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "icons", "exploration");
const packDir = join(root, "icons", "packs");
mkdirSync(outDir, { recursive: true });
mkdirSync(packDir, { recursive: true });

const PAPER = "#f4f2ec";
const INK = "#0a0a0a";
const LIME = "#c8e046";

function frame(inner, bg = PAPER) {
  const bgRect =
    bg === "transparent" || bg === null
      ? ""
      : `<rect width="1024" height="1024" fill="${bg}"/>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${bgRect}
  ${inner}
</svg>`;
}

function feedRow(y, opts) {
  const {
    avatar = 84,
    w1 = 500,
    w2 = 320,
    opacity = 1,
    ax = 200,
    fill = INK,
  } = opts;
  const lineH = Math.max(18, avatar * 0.32);
  const gap = Math.max(10, avatar * 0.12);
  const ly1 = y + (avatar - lineH * 2 - gap) / 2;
  const lx = ax + avatar + 32;
  return `<g opacity="${opacity}" fill="${fill}">
    <rect x="${ax}" y="${y}" width="${avatar}" height="${avatar}" rx="${Math.max(10, avatar * 0.18)}"/>
    <rect x="${lx}" y="${ly1}" width="${w1}" height="${lineH}" rx="8"/>
    ${
      w2 > 0
        ? `<rect x="${lx}" y="${ly1 + lineH + gap}" width="${w2}" height="${lineH}" rx="8"/>`
        : ""
    }
  </g>`;
}

/** D1 — fade out down the feed */
function d1() {
  return frame(
    [
      feedRow(200, { opacity: 1, w1: 520, w2: 360 }),
      feedRow(370, { opacity: 0.7, w1: 480, w2: 300 }),
      feedRow(540, { opacity: 0.4, w1: 420, w2: 240 }),
      feedRow(710, { opacity: 0.16, w1: 340, w2: 160 }),
    ].join("\n")
  );
}

/** D2 — solid → dash → dots → gone */
function d2() {
  return frame(`
  <g fill="${INK}">
    ${feedRow(190, { w1: 520, w2: 340 })}
    <!-- dashed row -->
    <rect x="200" y="370" width="84" height="84" rx="14"/>
    <rect x="316" y="384" width="88" height="26" rx="8"/>
    <rect x="420" y="384" width="88" height="26" rx="8"/>
    <rect x="524" y="384" width="88" height="26" rx="8"/>
    <rect x="628" y="384" width="72" height="26" rx="8"/>
    <rect x="316" y="426" width="72" height="26" rx="8"/>
    <rect x="404" y="426" width="72" height="26" rx="8"/>
    <rect x="492" y="426" width="56" height="26" rx="8"/>
    <!-- dots -->
    <rect x="200" y="540" width="84" height="84" rx="14" opacity="0.5"/>
    <circle cx="360" cy="582" r="15"/>
    <circle cx="420" cy="582" r="15"/>
    <circle cx="480" cy="582" r="13"/>
    <circle cx="532" cy="582" r="10"/>
    <circle cx="574" cy="582" r="7"/>
    <!-- almost gone -->
    <circle cx="242" cy="730" r="16" opacity="0.22"/>
    <circle cx="360" cy="730" r="9" opacity="0.16"/>
    <circle cx="400" cy="730" r="6" opacity="0.1"/>
  </g>`);
}

/** D3 — feed wipe inside a rounded frame on white (store-style tile, not a black blob) */
function d3() {
  const x = 56;
  const y = 56;
  const w = 912;
  const h = 912;
  const r = 144;
  const stroke = 36;

  const innerX = x + stroke / 2;
  const innerY = y + stroke / 2;
  const innerW = w - stroke;
  const innerH = h - stroke;
  const innerR = r - stroke / 2;

  const row = (ry, w1, w2) =>
    feedRow(ry, { w1, w2, fill: INK, ax: innerX + 92, avatar: 76 });

  return frame(
    `
  <defs>
    <clipPath id="card">
      <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" rx="${innerR}"/>
    </clipPath>
    <mask id="keep">
      <rect width="1024" height="1024" fill="black"/>
      <polygon points="${innerX},${innerY} ${innerX + innerW},${innerY} ${innerX},${innerY + innerH}" fill="white"/>
    </mask>
  </defs>

  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"
        fill="${PAPER}" stroke="${INK}" stroke-width="${stroke}"/>

  <g clip-path="url(#card)" mask="url(#keep)">
    ${row(innerY + 140, 480, 310)}
    ${row(innerY + 340, 420, 250)}
    ${row(innerY + 540, 350, 190)}
  </g>

  <g clip-path="url(#card)">
    <line x1="${innerX + innerW}" y1="${innerY}" x2="${innerX}" y2="${innerY + innerH}"
          stroke="${LIME}" stroke-width="68" stroke-linecap="butt"/>
  </g>
`,
    "transparent"
  );
}

/** D4 — shrink away toward nothing */
function d4() {
  return frame(
    [
      feedRow(180, { avatar: 88, w1: 520, w2: 340, opacity: 1, ax: 190 }),
      feedRow(340, { avatar: 70, w1: 400, w2: 250, opacity: 0.8, ax: 250 }),
      feedRow(480, { avatar: 50, w1: 280, w2: 160, opacity: 0.5, ax: 310 }),
      feedRow(600, { avatar: 28, w1: 140, w2: 0, opacity: 0.25, ax: 380 }),
    ].join("\n")
  );
}

export const MARKS = {
  d1: { name: "D1-fade-out", label: "Fade out", svg: d1 },
  d2: { name: "D2-dissolve", label: "Dissolve", svg: d2 },
  d3: { name: "D3-wipe-silence", label: "Wipe to silence", svg: d3 },
  d4: { name: "D4-shrink-away", label: "Shrink away", svg: d4 },
};

async function raster(svg, size, dest) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(dest);
}

export async function buildAll() {
  const composites = [];
  let i = 0;
  for (const [id, mark] of Object.entries(MARKS)) {
    const svg = mark.svg();
    const dir = join(packDir, id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(outDir, `${mark.name}.svg`), svg);
    writeFileSync(join(dir, "master.svg"), svg);

    for (const size of [128, 48, 16]) {
      const explorePng = join(outDir, `${mark.name}-${size}.png`);
      await raster(svg, size, explorePng);
      await raster(svg, size, join(dir, `icon${size}.png`));
    }
    await raster(svg, 1024, join(dir, "unfeed-icon-master.png"));

    composites.push({
      input: join(outDir, `${mark.name}-128.png`),
      left: 40 + (i % 2) * 328,
      top: 40 + Math.floor(i / 2) * 340,
    });
    i++;
  }

  await sharp({
    create: { width: 736, height: 720, channels: 3, background: PAPER },
  })
    .composite(composites)
    .png()
    .toFile(join(outDir, "_sheet-disappear-128.png"));

  console.log("Built D1–D4 packs →", packDir);
  console.log("Sheet →", join(outDir, "_sheet-disappear-128.png"));
}

export async function setActive(id) {
  const key = String(id).toLowerCase();
  if (!MARKS[key]) {
    throw new Error(`Unknown mark "${id}". Use: d1 d2 d3 d4`);
  }
  const dir = join(packDir, key);
  const iconsDir = join(root, "icons");
  copyFileSync(join(dir, "icon16.png"), join(iconsDir, "icon16.png"));
  copyFileSync(join(dir, "icon48.png"), join(iconsDir, "icon48.png"));
  copyFileSync(join(dir, "icon128.png"), join(iconsDir, "icon128.png"));
  copyFileSync(join(dir, "unfeed-icon-master.png"), join(iconsDir, "unfeed-icon-master.png"));
  copyFileSync(join(dir, "master.svg"), join(iconsDir, "unfeed-icon-master.svg"));
  console.log(`Active icon → ${key.toUpperCase()} (${MARKS[key].label})`);
  console.log("Reload the extension in chrome://extensions");
}

import { pathToFileURL } from "node:url";

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await buildAll();
}
