# Maestro style

CSS theme overrides for the shared theme layer in `base.css`, based on the member dashboard at [maestropro.io](https://tsqatl.maestropro.io/member): clean white cards on a light stone background, black pill buttons, and raspberry and orange brand accents from the Maestro logo.

## Usage

Add the `.maestro` class to any container element to apply the theme:

```html
<div class="maestro">...</div>
```

For dark mode, combine with the `.dark` class:

```html
<div class="dark maestro">...</div>
```

## Design Tokens

| Token | Light | Dark |
|---|---|---|
| `--bg-page` | `#f6f6f6` | `#141414` |
| `--bg-card` | `#ffffff` | `#262626` |
| `--accent` | `#801343` | `#eb418c` |
| `--color-primary` (buttons) | `#262626` | `#f6f6f6` |
| `--text-main` | `#262626` | `#f6f6f6` |
| `--text-muted` | `#5d5d5d` | `#b0b0b0` |
| `--border-subtle` | `#e7e7e7` | `rgba(246, 246, 246, 0.1)` |
| `--panel-radius` | `12px` | `12px` |
| `--button-radius` | `9999px` | `9999px` |
| `--chip-radius` | `9999px` | `9999px` |

## Font Stack

`Metropolis` → `Helvetica` → `Arial` → sans-serif

Maestro self-hosts Metropolis as `.otf` files (regular, medium, semi-bold, bold, italic). Those files are served without CORS headers, so browsers block them from other domains. `maestro.css` instead declares `@font-face` rules for the same weights (400, 400 italic, 500, 600, 700) using the Unlicense [Fontsource](https://fontsource.org/fonts/metropolis) `.woff2` build on jsDelivr. Each weight downloads only when text on the page uses it. Headings use weight 600 at 20px; body text is 16px.

## Buttons

Primary buttons are near-black (`#262626`) pills with white medium-weight text, matching Maestro's "Search" and "Enhance Profile" buttons. In dark mode they invert to light pills with dark text.

## Accent Colors

| Name | Hex | Use |
|---|---|---|
| Raspberry | `#801343` | `--accent`, links, `--color-secondary` |
| Dark Raspberry | `#501e37` | Link hover, deepest heatmap step |
| Orange | `#ff9400` | `--color-tertiary`, heatmap midpoint |
| Dark Pink | `#e62077` | Logo gradient, dark-mode accent family |
| Peach | `#ff7840` | Soft tints for highlights |

Icon tiles and highlight panels use very soft tints: orange-50 `#fff5e6`, pink-50 `#fdf2f8` and fuchsia-50 `#fdf4ff`.

## Source Design System

Maestro's stylesheet uses shadcn-style tokens (`--primary`, `--muted`, `--border`, `--radius: .625rem`) mapped onto about 190 `--ds-color-*` variables. The theme uses these scales:

- **stone**: neutrals. 50 `#f6f6f6` page, 100 `#e7e7e7` card borders, 200 `#d1d1d1` inputs, 600 `#5d5d5d` muted text, 950 `#262626` text and buttons.
- **branddarkpink** and **primary-raspberry**: brand accents.
- **orange** and **peach**: warm highlights.
- **green**, **red** and **sky**: success, danger and info.

The live site has no dark mode, so the `.dark` colors here are derived from the same scales.

## Design Character

Quiet and professional. White cards with 1px stone borders and no shadows sit on a light gray page. The black pill buttons and the warm orange-to-raspberry brand gradient carry most of the personality.
