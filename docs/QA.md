# UnFeed — pre-publish QA

Last updated: 2026-07-15 · Extension version target: **1.0.0**

## How to smoke-test

1. `chrome://extensions` → Reload UnFeed  
2. For each site: enable in popup (respect free 3 / use Pro key `UNFEED-PRO` for full QA)  
3. Hard-refresh the site (Ctrl+Shift+R)  
4. Check home feed is blank; search / profile / direct link still work  
5. Toggle OFF → feed returns (no manual reload preferred)

## Site status

| Site | Status | Notes |
|---|---|---|
| YouTube | OK | Home + related/up next; disable may soft-revive |
| X | OK | Home / Explore |
| Instagram | OK | Home / Explore / Reels; scroll locked |
| Reddit | OK | Home / Popular / All |
| Pinterest | OK | Home; toggle restore watched |
| Substack | OK | Notes / home; Inbox kept |
| LinkedIn | OK | Feed; watch loading/scroll |
| Facebook | OK | Needs JS-injected CSS (fragile DOM) |
| TikTok | OK | For You blank; search/profiles/links keep |
| Threads | OK | Main column blank on feed routes |
| Bluesky | Untested / fragile | First pass; verify `bsky.app` before marketing it |

## Free tier

- [ ] Default: Instagram, YouTube, X ON  
- [ ] Enabling a 4th site blocked until one is turned off  
- [ ] Pro key unlocks all (dev: `UNFEED-PRO`)

## Known limitations (OK for v1)

- Social DOMs change often — expect occasional selector breakage  
- TikTok/Threads “working” = empty main column, not a custom UI  
- No Firefox/Safari yet  
- Pro checkout not wired (license stub only)

## Do not advertise until verified

- Bluesky (confirm Once after reload of 1.0.0)  
- Any site you personally don’t use logged-in
