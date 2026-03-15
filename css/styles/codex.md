# OpenAI/ChatGPT style (by Claude)

CSS theme overrides for the shared theme layer in `base.css`, replicating the OpenAI Codex / ChatGPT visual identity.

## Usage

Add the `.codex` class to any container element to apply the theme:

```html
<div class="codex">...</div>
```

For dark mode, combine with the `.dark` class:

```html
<div class="dark codex">...</div>
```

## Design Tokens

| Token | Light | Dark |
|---|---|---|
| `--bg-page` | `#f9f9f9` | `#212121` |
| `--bg-card` | `#ffffff` | `#2f2f2f` |
| `--accent` | `#10a37f` | `#19c37d` |
| `--text-main` | `#0d0d0d` | `#ececec` |
| `--text-muted` | `#6e6e80` | `#8e8ea0` |
| `--panel-radius` | `12px` | `12px` |
| `--button-radius` | `6px` | `6px` |
| `--chip-radius` | `6px` | `6px` |

## Font Stack

`'OpenAI Sans'` → `'Söhne'` → `Inter` → system sans-serif fallbacks

## Accent Color

`#10a37f` — the iconic ChatGPT teal-green, used for buttons, links, and interactive elements.
