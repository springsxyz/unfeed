/**
 * UnFeed mark exploration — 3 territories × 2 variants
 * Monochrome silhouette first (ink on paper), then lime accent set.
 * Run: node scripts/render-mark-exploration.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "icons", "exploration");
mkdirSync(outDir, { recursive: true });

const PAPER = "#f4f2ec";
const INK = "#0a0a0a";
const LIME = "#c8e046";

function frame(inner, fill = PAPER) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="${fill}"/>
  ${inner}
</svg>`;
}

/** A1 — Feed cut: 3 bars, middle severed by diagonal */
function a1(color) {
  return frame(`
  <defs>
    <mask id="midcut">
      <rect width="1024" height="1024" fill="white"/>
      <polygon points="470,450 510,450 570,560 530,560" fill="black"/>
    </mask>
  </defs>
  <g fill="${color}">
    <rect x="220" y="340" width="584" height="72" rx="8"/>
    <rect x="220" y="470" width="584" height="72" rx="8" mask="url(#midcut)"/>
    <rect x="220" y="600" width="584" height="72" rx="8"/>
  </g>`, PAPER);
}

/** A2 — Feed cut: 4 lines, continuous diagonal interrupt */
function a2(color) {
  const bars = [320, 420, 520, 620];
  const h = 56;
  const x0 = 240;
  const x1 = 784;
  // Diagonal cut band from (420,300) to (604,724) — gap width ~36
  // Use mask: draw full bars then cut with paper polygon
  return frame(`
  <defs>
    <mask id="cut">
      <rect width="1024" height="1024" fill="white"/>
      <polygon points="390,280 430,280 650,744 610,744" fill="black"/>
    </mask>
  </defs>
  <g fill="${color}" mask="url(#cut)">
    ${bars.map((y) => `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="${h}" rx="6"/>`).join("\n    ")}
  </g>`, PAPER);
}

/** B1 — Scroll stop: track + thumb + hard stop */
function b1(color) {
  return frame(`
  <g fill="${color}">
    <!-- track -->
    <rect x="454" y="220" width="116" height="520" rx="58"/>
    <!-- inner well (paper) -->
    <rect x="478" y="244" width="68" height="472" rx="34" fill="${PAPER}"/>
    <!-- thumb -->
    <rect x="486" y="268" width="52" height="140" rx="26"/>
    <!-- hard stop bar -->
    <rect x="360" y="780" width="304" height="56" rx="12"/>
  </g>`, PAPER);
}

/** B2 — Scroll stop: descending segments ending in brake */
function b2(color) {
  return frame(`
  <g fill="${color}">
    <rect x="472" y="240" width="80" height="80" rx="16"/>
    <rect x="472" y="360" width="80" height="80" rx="16"/>
    <rect x="472" y="480" width="80" height="80" rx="16"/>
    <!-- stop: heavier base -->
    <rect x="400" y="640" width="224" height="88" rx="16"/>
    <rect x="440" y="760" width="144" height="28" rx="8"/>
  </g>`, PAPER);
}

/** C1 — Loop break: ring with hard diagonal knife cut */
function c1(color) {
  return frame(`
  <defs>
    <mask id="ringcut">
      <rect width="1024" height="1024" fill="white"/>
      <polygon points="520,200 580,200 380,824 320,824" fill="black"/>
    </mask>
  </defs>
  <circle cx="512" cy="512" r="268" fill="none" stroke="${color}" stroke-width="96" mask="url(#ringcut)"/>
`, PAPER);
}

/** C2 — Loop break: open arc with flat terminals (gap at 1 o'clock) */
function c2(color) {
  // Arc path with stroke, gap ~70 degrees
  return frame(`
  <path d="M712 320
    A 268 268 0 1 1 620 248"
    fill="none" stroke="${color}" stroke-width="96" stroke-linecap="butt"/>
`, PAPER);
}

const marks = [
  ["A1-feed-cut-middle", a1],
  ["A2-feed-cut-all", a2],
  ["B1-scroll-track-stop", b1],
  ["B2-scroll-steps-stop", b2],
  ["C1-loop-knife-cut", c1],
  ["C2-loop-open-arc", c2],
];

async function writeMark(name, svgFn) {
  const svgInk = svgFn(INK);
  const svgLime = svgFn(LIME);
  writeFileSync(join(outDir, `${name}.svg`), svgInk);
  for (const [label, svg, size] of [
    ["ink-128", svgInk, 128],
    ["ink-48", svgInk, 48],
    ["ink-16", svgInk, 16],
    ["lime-128", svgLime, 128],
  ]) {
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(join(outDir, `${name}-${label}.png`));
  }
}

// Contact sheet: 3×2 at 128 ink
const cells = [];
let i = 0;
for (const [name, fn] of marks) {
  await writeMark(name, fn);
  const col = i % 3;
  const row = Math.floor(i / 3);
  const x = 40 + col * 328;
  const y = 40 + row * 328;
  cells.push(`<image href="${name}-ink-128.png" x="${x}" y="${y}" width="288" height="288"/>
  <text x="${x + 144}" y="${y + 312}" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="${INK}">${name.split("-").slice(0, 2).join(" ")}</text>`);
  i++;
}

// Build sheet by compositing with sharp instead of SVG image href
const sheet = sharp({
  create: {
    width: 1040,
    height: 720,
    channels: 3,
    background: PAPER,
  },
});

const composites = [];
for (let idx = 0; idx < marks.length; idx++) {
  const [name] = marks[idx];
  const col = idx % 3;
  const row = Math.floor(idx / 3);
  composites.push({
    input: join(outDir, `${name}-ink-128.png`),
    left: 40 + col * 328,
    top: 40 + row * 340,
  });
}

await sheet
  .composite(composites)
  .png()
  .toFile(join(outDir, "_sheet-ink-128.png"));

// 16px stress strip
const stripInputs = marks.map(([name], idx) => ({
  input: join(outDir, `${name}-ink-16.png`),
  left: 24 + idx * 40,
  top: 24,
}));
await sharp({
  create: { width: 24 + marks.length * 40 + 8, height: 64, channels: 3, background: PAPER },
})
  .composite(stripInputs)
  .png()
  .toFile(join(outDir, "_sheet-ink-16.png"));

console.log(`Wrote ${marks.length} marks → ${outDir}`);
console.log("Sheets: _sheet-ink-128.png , _sheet-ink-16.png");
