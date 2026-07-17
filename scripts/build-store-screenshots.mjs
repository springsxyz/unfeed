import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...value] = arg.replace(/^--/, "").split("=");
    return [key, value.join("=")];
  })
);

const outputDir = path.resolve(args.output || "docs/store/screenshots");
const iconPath = path.resolve(args.icon || "icons/icon128.png");

const shots = [
  {
    key: "youtube",
    filename: "02-youtube.png",
    title: "YouTube without recommendations",
    subtitle: "Keep search, subscriptions, and your library. Remove the home feed.",
  },
  {
    key: "instagram",
    filename: "03-instagram.png",
    title: "Instagram without the feed",
    subtitle: "Keep navigation and messages. Lose the endless scroll.",
  },
  {
    key: "tiktok",
    filename: "04-tiktok.png",
    title: "TikTok, minus endless scrolling",
    subtitle: "Search, messages, uploads, and your profile stay available.",
  },
  {
    key: "reddit",
    filename: "05-reddit.png",
    title: "Reddit without the front page",
    subtitle: "Keep communities, search, and navigation without the content stream.",
  },
];

const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

await mkdir(outputDir, { recursive: true });

const icon = await sharp(iconPath).resize(56, 56).png().toBuffer();

async function cleanPopup(sourcePath) {
  const source = sharp(path.resolve(sourcePath));
  const { width, height } = await source.metadata();
  const left = 5;
  const top = 5;
  const right = 18;
  const bottom = 5;

  return source
    .extract({
      left,
      top,
      width: width - left - right,
      height: height - top - bottom,
    })
    .png()
    .toBuffer();
}

async function maskPanel(input, width, height) {
  return sharp(input)
    .composite([
      {
        input: Buffer.from(
          `<svg width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="14" fill="white"/></svg>`
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();
}

async function fitPopup(sourcePath, width, height) {
  const cleaned = await cleanPopup(sourcePath);
  const fitted = await sharp(cleaned)
    .resize(width, height, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
      position: "top",
    })
    .png()
    .toBuffer();

  return maskPanel(fitted, width, height);
}

async function buildControl() {
  if (!args.free || !args.pro) {
    throw new Error("Missing --free=path and/or --pro=path");
  }

  const panelW = 352;
  const panelH = 660;

  let freeSource = path.resolve(args.free);
  if (args["free-upgrade"]) {
    const listH = 380;
    const upgradeH = panelH - listH;
    const cleanList = await cleanPopup(args.free);
    const cleanUpgrade = await cleanPopup(args["free-upgrade"]);
    const list = await sharp(cleanList)
      .resize(panelW, listH, { fit: "cover", position: "top" })
      .png()
      .toBuffer();
    const upgrade = await sharp(cleanUpgrade)
      .resize(panelW, upgradeH, { fit: "cover", position: "top" })
      .png()
      .toBuffer();
    freeSource = await sharp({
      create: {
        width: panelW,
        height: panelH,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([
        { input: list, left: 0, top: 0 },
        { input: upgrade, left: 0, top: listH },
      ])
      .png()
      .toBuffer();
  }

  const freeFit =
    typeof freeSource === "string"
      ? await fitPopup(freeSource, panelW, panelH)
      : await maskPanel(freeSource, panelW, panelH);
  const proFit = await fitPopup(args.pro, panelW, panelH);

  const frame = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0a0a0a" flood-opacity=".16"/>
        </filter>
      </defs>
      <rect width="1280" height="800" fill="#f4f2ec"/>
      <text x="40" y="48" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#0a0a0a">UnFeed</text>
      <rect x="40" y="60" width="78" height="6" rx="3" fill="#c8e046"/>
      <text x="640" y="48" text-anchor="middle" font-family="Arial, sans-serif" font-size="35" font-weight="700" letter-spacing="-1.1" fill="#0a0a0a">Free for 3 sites. Pro for every network.</text>
      <text x="640" y="78" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#595959">Remove the feed. Keep the app.</text>

      <text x="336" y="117" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#0a0a0a">FREE</text>
      <text x="944" y="117" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#0a0a0a">PRO</text>

      <rect x="160" y="128" width="352" height="660" rx="16" fill="#ffffff" stroke="#0a0a0a" stroke-width="2" filter="url(#shadow)"/>
      <rect x="768" y="128" width="352" height="660" rx="16" fill="#ffffff" stroke="#0a0a0a" stroke-width="2" filter="url(#shadow)"/>
    </svg>
  `);

  await sharp({
    create: {
      width: 1280,
      height: 800,
      channels: 4,
      background: { r: 244, g: 242, b: 236, alpha: 1 },
    },
  })
    .composite([
      { input: frame, left: 0, top: 0 },
      { input: freeFit, left: 160, top: 128 },
      { input: proFit, left: 768, top: 128 },
      { input: icon, left: 1184, top: 20 },
    ])
    .png()
    .toFile(path.join(outputDir, "01-control.png"));
}

async function buildSiteShots() {
  const provided = shots.filter((shot) => args[shot.key]);
  if (!provided.length) return 0;
  if (provided.length !== shots.length) {
    throw new Error(
      `Provide all site shots or none. Missing: ${shots
        .filter((s) => !args[s.key])
        .map((s) => s.key)
        .join(", ")}`
    );
  }

  for (const shot of shots) {
    const source = path.resolve(args[shot.key]);
    const screenshot = await sharp(source)
      .resize(1148, 545, { fit: "cover", position: "top" })
      .composite([
        {
          input: Buffer.from(
            '<svg width="1148" height="545"><rect width="1148" height="545" rx="14" fill="white"/></svg>'
          ),
          blend: "dest-in",
        },
      ])
      .png()
      .toBuffer();

    const frame = Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0a0a0a" flood-opacity=".16"/>
          </filter>
        </defs>
        <rect width="1280" height="800" fill="#f4f2ec"/>
        <text x="64" y="66" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#0a0a0a">UnFeed</text>
        <rect x="64" y="83" width="90" height="8" rx="4" fill="#c8e046"/>
        <text x="64" y="150" font-family="Arial, sans-serif" font-size="48" font-weight="700" letter-spacing="-1.5" fill="#0a0a0a">${escapeXml(shot.title)}</text>
        <text x="64" y="193" font-family="Arial, sans-serif" font-size="22" fill="#595959">${escapeXml(shot.subtitle)}</text>
        <rect x="64" y="230" width="1152" height="549" rx="16" fill="#ffffff" stroke="#0a0a0a" stroke-width="2" filter="url(#shadow)"/>
      </svg>
    `);

    await sharp({
      create: {
        width: 1280,
        height: 800,
        channels: 4,
        background: { r: 244, g: 242, b: 236, alpha: 1 },
      },
    })
      .composite([
        { input: frame, left: 0, top: 0 },
        { input: screenshot, left: 66, top: 232, blend: "over" },
        { input: icon, left: 1160, top: 48, blend: "over" },
      ])
      .png()
      .toFile(path.join(outputDir, shot.filename));
  }

  return shots.length;
}

await buildControl();
const siteCount = await buildSiteShots();
console.log(`Created ${1 + siteCount} screenshot(s) in ${outputDir}`);
