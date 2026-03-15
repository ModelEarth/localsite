# X.AI Grok style (by Codex)

CSS theme overrides for the shared theme layer in `base.css`, aimed at the current xAI corporate look rather than the louder Grok product accenting.

## Usage

Add the `.xai` class to any container element to apply the theme:

```html
<div class="xai">...</div>
```

For dark mode, combine with the `.dark` class:

```html
<div class="dark xai">...</div>
```

## Design Tokens

| Token | Light | Dark |
|---|---|---|
| `--bg-page` | `#f6f8fc` | `#020617` |
| `--bg-card` | `#ffffff` | `#0b1020` |
| `--accent` | `#4b6bfb` | `#8fa5ff` |
| `--text-main` | `#0b1020` | `#e5ecff` |
| `--text-muted` | `#5b6475` | `#8b94a7` |
| `--panel-radius` | `18px` | `18px` |
| `--button-radius` | `999px` | `999px` |
| `--chip-radius` | `999px` | `999px` |

## Font Stack

`Inter` → `Söhne` → system sans-serif fallbacks

## Accent Color

`#4b6bfb` in light mode and `#8fa5ff` in dark mode. The palette stays cool and technical, with blue-violet orbit tones instead of Grok’s stronger purple.

## Design Character

Sharper and more corporate than the Grok theme. The style uses near-space-black dark surfaces, cool blue UI accents, uppercase section headings, glassy alerts/badges, and softer monochrome neutrals to better match the broader xAI product and company presentation.
