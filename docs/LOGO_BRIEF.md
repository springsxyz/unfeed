# UnFeed — Logo / extension icon brief

**Product:** UnFeed — Chrome extension that hides social feeds; keeps search, messages, profiles, links.  
**Site:** https://unfeed.dev/  
**Org:** Springs XYZ  
**Contact:** support@unfeed.dev  

## Goal
A durable **app icon + simple mark** that works for years — Chrome Web Store, toolbar (16px), site favicon, and light marketing. Not a temporary AI doodle.

## One-sentence idea (pick in exploration; recommend locking one)
UnFeed **stops the infinite feed** so you can use the app without the scroll.

Preferred territories (designer may propose a stronger abstraction):
1. **Feed is cut** — lines interrupted by a hard cut  
2. **Scroll stops** — motion ends / hard stop (abstract; not a literal scrollbar widget)  
3. **Loop broken** — cycle interrupted  

Avoid: stacked wordmark in the toolbar icon, mute/pause clones, Wi‑Fi / loading spinners, platform logos.

## Brand system (Signal Cut) — locked
| Token | Hex | Use |
|-------|-----|-----|
| Paper | `#f4f2ec` | Light field |
| Ink | `#0a0a0a` | Primary mark / type |
| Lime | `#c8e046` | Accent only |

**Type (UI / wordmark):** Space Grotesk — used in product UI; icon mark should stand alone without relying on type at 16px.

## Deliverables
1. **Primary mark** — monochrome (ink on transparent / paper)  
2. **App icon** — 512×512 and 128×128 PNG (flat square; Chrome masks to squircle). Also 48 and 16.  
3. **Colorways** — at least: ink on paper; lime on paper *or* ink; ink on lime (optional)  
4. **SVG** — clean, geometric, editable (no traced bitmap)  
5. **Favicon** pack (16 / 32)  
6. One-line rationale (what it means)

## Constraints (hard)
- Must read at **16×16** (Chrome toolbar)  
- Must work in **one color** first  
- No tiny lettering inside the icon  
- No gradients, shadows, skeuomorphism, or 3D  
- Distinct enough not to be confused with mute / block / Wi‑Fi  
- Trademark-safe (no social network marks)

## References (exploration only — not final)
Repo folder: `icons/exploration/`  
Shortlist that tested OK small: feed-cut-all (A2), open-loop (C2).  
Scroll-stop literal scrollbar (B1) was **rejected** as too UI-chrome / unprofessional — keep the *idea*, not the widget.

## Success criteria
- Looks intentional next to serious indie/productivity extensions  
- Same mark works on store listing, toolbar, and site without redrawing  
- Still clear if printed black-only on a sticker  

## Timeline / budget
_TBD by Springs XYZ — fill before sending._

## Status
**Locked DIY mark (Jul 2026):** Feed cut — four bars + hard diagonal.  
Assets: `icons/unfeed-icon-master.svg`, `icon16/48/128.png` (ink on paper).  
Alt punch: `icon128-punch.png` (lime on ink). Regenerate: `npm run icons`.

A paid designer brief above remains useful if you revisit later.
