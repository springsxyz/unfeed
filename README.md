# UnFeed

Remove the feed. Keep the app.

Chrome extension **v1.0.2** (Manifest V3).

## Install (developer)

1. `chrome://extensions` → Developer mode → **Load unpacked** → this folder  
2. Pin UnFeed and toggle sites in the popup  

Free: any **3** sites. Pro: **$9** one-time via Polar (see [docs/POLAR.md](docs/POLAR.md)).  
Local QA Pro: add your key to `shared/dev-unlock.personal.stub.js` (not shipped in store zip).

## Publish

See **[docs/PUBLISH.md](docs/PUBLISH.md)** for Chrome Web Store steps.  
Store listing copy: **[docs/STORE_LISTING.md](docs/STORE_LISTING.md)**  
QA checklist: **[docs/QA.md](docs/QA.md)**  
Polar Pro: **[docs/POLAR.md](docs/POLAR.md)**  
Privacy (web): **[docs/privacy.html](docs/privacy.html)** · in-extension: `privacy.html`

Pack a store zip:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\pack-extension.ps1
```

## Supported

YouTube · Instagram · Facebook · X · Reddit · LinkedIn · TikTok · Pinterest · Substack · Threads · Bluesky

## Layout

```
manifest.json
background.js
privacy.html
shared/
content/
styles/
popup/
icons/
docs/          # GitHub Pages (site + store docs)
scripts/
```
