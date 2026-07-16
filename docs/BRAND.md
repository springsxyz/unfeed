# UnFeed brand — Signal Cut

Locked from design mockups (Jul 2026). User-selected direction.

## Type
- **UI / brand:** Space Grotesk, weights 400–700
- Fallbacks: Helvetica Neue, sans-serif

## Color
| Token | Hex | Use |
|-------|-----|-----|
| `--bg` | `#f4f2ec` | Paper field |
| `--bg-deep` | `#e8e4dc` | Gradient depth |
| `--text` | `#0a0a0a` | Ink |
| `--muted` | `#6b6b6b` | Secondary copy |
| `--accent` | `#c8e046` | Lime — toggles, Free badge, CTA |
| `--off` | `#d0d0d0` | Toggle off |

## Motion
1. Cut-shift on `.atmosphere` (slow horizontal drift of feed→silence plane)
2. Hero rise-in (brand → headline → lede → CTA)
3. Toggle / CTA hover

Respect `prefers-reduced-motion`.

## Surfaces
- Landing: paper grain + abstract feed-blur cut into silence; brand wordmark hero; lime CTA
- Popup: paper, bold UnFeed + lime Free badge (text only), site list with icons, black Unlock, centered Privacy

## Extension icon
Lime squircle + **blocked feed** mark (stacked rows + slash). No circle/lens. Master from AI gen → `icons/unfeed-icon-master.png`; export sizes with `scripts/export-icons-from-master.ps1`.
