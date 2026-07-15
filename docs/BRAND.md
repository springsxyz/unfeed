# UnFeed brand — Off-Hours Soft

Locked from design mockups (Jul 2026).

## Type
- **Display / brand:** Fraunces (optical size), weight 400–500
- **UI / body:** DM Sans, weight 400–600
- Fallbacks: Georgia / system-ui

## Color
| Token | Hex | Use |
|-------|-----|-----|
| `--bg` / mist | `#d4dde6` → `#c8d4e0` | Atmosphere field |
| `--bg-deep` | `#9aafc0` | Gradient depth |
| `--text` | `#1c2a36` | Deep slate |
| `--muted` | `#5c6d7c` | Secondary copy |
| `--accent` | `#3f7d7a` | CTA, toggles, links |
| `--accent-soft` | `#5a9a96` | Hover |

## Motion
1. Mist drift (slow ambient scale/translate on `.atmosphere`)
2. Hero rise-in (brand → headline → lede → CTA, staggered)
3. CTA / toggle soft hover (translate or color)

Respect `prefers-reduced-motion`.

## Surfaces
- Landing: full-bleed atmosphere; brand is hero wordmark; no cards in first viewport
- Popup: soft mist panel, no list card chrome, large teal toggles, pill Free/Pro badge
