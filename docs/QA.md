# UnFeed — pre-publish QA

Last updated: 2026-08-31 · Extension version target: **1.3.0**

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
| Twitch | NEW | Front page carousel + shelves, browse grid. Selectors verified against live DOM; needs a logged-in pass |
| Tumblr | NEW | Dashboard + Explore. Hashed classes, so posts match on `<article>`; needs a logged-in dashboard pass |

## Free access

- [ ] Default on a fresh profile: all thirteen sites ON  
- [ ] Upgrading from ≤1.1.1 keeps existing toggles — no site flips on by itself  
- [ ] Any combination of all thirteen supported sites can be enabled
- [ ] Enable all and Disable all update open tabs immediately

## Known limitations (OK for v1)

- Social DOMs change often — expect occasional selector breakage  
- TikTok/Threads “working” = empty main column, not a custom UI  
- No Firefox/Safari yet  

## Do not advertise until verified

- Any site you personally don’t use logged-in
