# UnFeed — pre-publish QA

Last updated: 2026-08-29 · Extension version target: **1.1.0**

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

## Free access

- [ ] Default: Instagram, YouTube, X ON  
- [ ] Any combination of all eleven supported sites can be enabled
- [ ] Enable all and Disable all update open tabs immediately

## Known limitations (OK for v1)

- Social DOMs change often — expect occasional selector breakage  
- TikTok/Threads “working” = empty main column, not a custom UI  
- No Firefox/Safari yet  

## Do not advertise until verified

- Any site you personally don’t use logged-in
