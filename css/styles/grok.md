# xAI Grok style (by Claude)

CSS theme overrides for the shared theme layer in `base.css`, replicating the xAI Grok / x.ai visual identity.

## Usage

Add the `.grok` class to any container element to apply the theme:

```html
<div class="grok">...</div>
```

For dark mode, combine with the `.dark` class:

```html
<div class="dark grok">...</div>
```

## Design Tokens

| Token | Light | Dark |
|---|---|---|
| `--bg-page` | `#ffffff` | `#0a0a0a` |
| `--bg-card` | `#f7f7f7` | `#141414` |
| `--accent` | `#7c3aed` | `#a78bfa` |
| `--text-main` | `#0a0a0a` | `#f5f5f5` |
| `--text-muted` | `#6b7280` | `#9ca3af` |
| `--panel-radius` | `8px` | `8px` |
| `--button-radius` | `6px` | `6px` |
| `--chip-radius` | `6px` | `6px` |

## Font Stack

`'Inter'` → system sans-serif fallbacks — clean geometric sans matching xAI's minimal aesthetic.

## Accent Color

`#7c3aed` — violet/purple matching xAI Grok's brand highlights, shifting to `#a78bfa` in dark mode for contrast against near-black backgrounds.

## Design Character

Stark and high-contrast. The dark mode uses an extreme near-black (`#0a0a0a`) background — darker than both Claude and ChatGPT — reflecting xAI's bold, technical aesthetic. Titles use tight negative letter-spacing (`-0.03em`) and heavy weight (`700`), echoing the aggressive typographic style of the x.ai and Grok interfaces. Corners are squarer (`6–8px`) than Claude's rounded approach.
