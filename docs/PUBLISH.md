# Publish UnFeed to the Chrome Web Store

## 0. One-time setup

1. Create a [Chrome Web Store developer account](https://chrome.google.com/webstore/devconsole) ($5 USD once)
2. Create a GitHub repo (suggested name: `unfeed`) and push this project
3. **GitHub Pages:** Settings → Pages → Source: Deploy from branch → Branch `main` → Folder `/docs`
4. Confirm these URLs load:
   - `https://YOUR_USER.github.io/unfeed/`
   - `https://YOUR_USER.github.io/unfeed/privacy.html`
5. In the Chrome Web Store form, set:
   - **Homepage:** your Pages URL  
   - **Privacy policy:** `…/privacy.html`  
   - **Support email:** an email you actually check (Gmail is fine — you don’t need unfeed.app)
6. Optionally paste the live store URL into `docs/index.html` (`#cws-link`) after approval

> Note: the in-extension **Privacy** link opens bundled `privacy.html`. The store still needs the **public** Pages URL.

## 1. Pre-flight

- [ ] Run through `docs/QA.md` on the sites you advertise  
- [ ] Confirm Bluesky or remove it from the store description if untested  
- [ ] `manifest.json` version is `1.0.0` (or higher)  
- [ ] Popup + privacy link look good  

## 2. Build the store zip

From the `unfeed` folder, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\pack-extension.ps1
```

This creates `dist/unfeed-1.0.0.zip` with only extension files (no `docs/`, no `.git`).

## 3. Submit

1. [Developer Dashboard](https://chrome.google.com/webstore/devconsole) → **New item**
2. Upload the zip
3. Paste copy from `docs/STORE_LISTING.md`
4. Upload screenshots
5. Set privacy policy URL to your Pages privacy URL
6. Justify host permissions: “Modify supported social sites to hide feeds only”
7. Submit for review

## 4. After approval

- [ ] Paste the store URL into `docs/index.html` (`#cws-link`)
- [ ] Share with a few friends; fix breakages fast (version `1.0.1`, etc.)
- [ ] Wire real Pro checkout later (Lemon Squeezy / Polar)

## Updates later

Bump `version` in `manifest.json` → re-run pack script → Upload new package → Submit again.  
Users update automatically.
