# CSS Themes

CSS variable overrides for theming site-specific UI and the Sveltia CMS editor. Each file scopes
overrides to a body class so multiple themes can coexist in one stylesheet.

## Usage

Add the theme stylesheet to your admin page alongside `sveltia-cms.js`, then
set the matching class on `<body>`:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>CMS</title>
    <link rel="stylesheet" href="/localsite/css/themes/claude.css">
  </head>
  <body class="claude">
    <script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
  </body>
</html>
```

## Available themes

| File | Body class | Inspired by |
|---|---|---|
| `notion.css` | `notion` | Notion — soft sage neutrals |
| `claude.css` | `claude` | Claude.ai — warm terracotta |
| `openai.css` | `openai` | OpenAI — signal green |
| `codex.css` | `codex` | Codex — dark terminal |
| `grok.css` | `grok` | Grok — deep violet |
| `xai.css` | `xai` | xAI — orbit blue |
| `georgia.css` | `georgia` | Georgia.org — pine green |
| `maestro.css` | `maestro` | Maestro (maestropro.io) — black pills, raspberry accent |

Themes with design notes also have a matching `.md` file (`codex.md`, `grok.md`,
`maestro.md`, `openai.md`, `xai.md`), shown on the preview page when that theme
is selected.

`palette.css` and `heatmap.css` are shared utilities included by the preview
page; they do not need to be loaded for individual themes.

## Adding a theme

Register the body class in each of these places:

- `localsite/js/localsite.js`: `localStylelookThemes`, so the stylesheet loads on demand
- `localsite/js/navigation.js`: `localsiteStylelookMenu`, for the style dropdown
- `themes/index.html`: `localThemeClasses`, the `colorPalettes` entry,
  `softBackgroundPalettes`, `softColorPalettes`, and `markdownStyles` if the theme has a `.md` file

## Fonts

Most themes name system or commonly installed fonts and fall back gracefully.
`maestro.css` loads its Metropolis webfont with `@font-face` rules pointing to
the Fontsource `.woff2` files on jsDelivr. A weight downloads only when text on
the page uses it, so the rules cost nothing on pages without `.maestro`.

## Preview

Open `themes/index.html` locally to switch between themes interactively.

## Variables

Themes override the following CSS custom properties:

| Variable | Purpose |
|---|---|
| `--font-primary` / `--font-body` / `--font-headline` | Typography |
| `--bg-page` | Page background |
| `--bg-card` | Card / panel background |
| `--accent` | Primary action color |
| `--accent-hover` | Hover state of accent |
| `--accent-soft` | Soft tint of accent (secondary buttons, badges) |
| `--text-main` | Primary text |
| `--text-muted` | Secondary / label text |
| `--border-subtle` | Borders and dividers |
| `--link-color` / `--link-hover` | Link colors |
| `--panel-radius` | Card and panel corner radius |
| `--button-radius` | Button corner radius |
| `--chip-radius` | Chip / badge corner radius |
| `--chip-bg` / `--chip-text` | Chip colors |
| `--notion-green/blue/yellow/red/purple` | Semantic highlight colors |
| `--soft-bg-*` | Very soft background tints |
| `--heatmap-0` … `--heatmap-5` | Six-step light-mode scale for charts and heatmaps (low → high), plus `-hot-`, `-cool-` and `-warm-` variants |
| `--heatmap-dark-0` … `--heatmap-dark-5` | Dark-mode scale: step 0 sits near the theme's dark `--bg-card`, step 5 is brightest |

Charts pick the dark scale when `body` has the `dark` class. Each theme defines its dark scale in its main block,
next to `--heatmap-*`, so the preview page can show both scales side by side. A new theme's dark scale starts from
its darkest light step that has at least 1.5 contrast with its dark `--bg-card`, mixed halfway toward that card
color for step 0, followed by the lighter light steps.

## Sveltia CMS UI variables

Each theme file also overrides `--sui-*` variables from `@sveltia/ui` so the
CMS interface itself (toolbar, inputs, buttons, panels) inherits the theme.

| Variable | Purpose | Default |
|---|---|---|
| `--sui-base-hue` | Hue for the entire UI color system — accent, backgrounds, borders, text all derive from this | `210` (blue) |
| `--sui-font-family-default` | Primary font across all UI controls and headings | `"Merriweather Sans", sans-serif` |
| `--sui-control-font-family` | Font for inputs and buttons specifically | inherits `--sui-font-family-default` |
| `--sui-font-family-monospace` | Monospace font for code fields | `"Noto Sans Mono", monospace` |
| `--sui-font-size-default` | Base font size | `14px` |
| `--sui-font-size-small` | Small labels | `12px` |
| `--sui-font-size-large` | Section headings | `16px` |
| `--sui-control-medium-height` | Height of inputs and buttons | `32px` |
| `--sui-textbox-height` | Text input height | inherits `--sui-control-medium-height` |
| `--sui-button-medium-height` | Button height | inherits `--sui-control-medium-height` |
| `--sui-control-medium-border-radius` | Input/button corner radius | `calc(height / 8)` |
| `--sui-menu-border-radius` | Dropdown menu corner radius | `4px` |
| `--sui-menu-padding` | Dropdown menu padding | `4px` |

Changing `--sui-base-hue` alone shifts the toolbar, sidebar, accent buttons,
focus rings, borders, and backgrounds in one step.
