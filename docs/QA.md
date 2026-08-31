# UnFeed — pre-publish QA

Last updated: 2026-08-31 · Extension version target: **1.3.3**

## How to smoke-test

1. `chrome://extensions` → Reload UnFeed  
2. For each site: enable it in the popup
3. Hard-refresh the site (Ctrl+Shift+R)  
4. Check home feed is blank; search / profile / direct link still work  
5. Toggle OFF → feed returns (no manual reload preferred)

## Site status

| Site | Status | Notes |
|---|---|---|
| YouTube | OK | Home + related/up next; disable may soft-revive |
| X | OK | Home / Following / Explore |
| Instagram | OK | Home / Explore / Reels; scroll locked |
| Reddit | OK | Home / Popular / All |
| Pinterest | OK | Home; toggle restore watched |
| Substack | OK | Notes / home on substack.com only; Inbox kept |
| LinkedIn | OK | Feed; watch loading/scroll |
| Facebook | OK | Needs JS-injected CSS (fragile DOM) |
| TikTok | OK | For You blank; search/profiles/links keep |
| Threads | OK | Feed posts hidden; composer/chrome kept |
| Bluesky | OK | Feed removal verified on `bsky.app` |
| Twitch | NEW | Desktop **and** `m.twitch.tv` — the mobile app is a separate DOM with no shared selectors. Both verified logged out; needs a logged-in pass on each |
| Tumblr | NEW | Dashboard + Explore. Hashed classes, so posts match on `<article>`; needs a logged-in dashboard pass |

## Free access

- [ ] Default on a fresh profile: all thirteen sites ON  
- [ ] Upgrading from ≤1.1.1 keeps existing toggles — no site flips on by itself  
- [ ] Any combination of all thirteen supported sites can be enabled
- [ ] Enable all and Disable all update open tabs immediately

## Alternate hosts

The manifest matches more than the main desktop host for several sites. These
are separate applications, not responsive variants — selectors do not carry
over. Checked logged out:

| Host | State |
|---|---|
| `m.twitch.tv` | Fixed in 1.3.2 — separate DOM, uses `main [role="list"]` |
| `m.youtube.com` | Fixed in 1.3.3 — `ytm-*` elements, no `ytd-*` selectors exist |
| `m.facebook.com` / `www.facebook.com` logged out | Fixed in 1.3.3 — was blanking the login page |
| `www.instagram.com` logged out | Safe; no `main[role="main"]`, though scroll lock still applies |
| `www.threads.com` logged out | Safe; no `main` element at all |
| `old.reddit.com` | **Unchecked** — blocked in the test browser. One CSS rule (`#siteTable`) |
| `sh.reddit.com` | **Unchecked** |
| `web.facebook.com` | **Unchecked** |

- [ ] Load `old.reddit.com` logged in and confirm the front page blanks
- [ ] Confirm no site blanks its logged-out landing or login page

## Known limitations (OK for v1)

- Social DOMs change often — expect occasional selector breakage  
- TikTok/Threads “working” = empty main column, not a custom UI  
- No Firefox/Safari yet  

## Do not advertise until verified

- Any site you personally don’t use logged-in
