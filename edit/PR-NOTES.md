# PR Notes — ModelEarth contributions to sveltia-cms

Tracked in `localsite/editor/`. Changes described here target the `cms/` submodule
(fork of `sveltia/sveltia-cms`) for eventual upstream PRs.

---

## Change 1 — `logo.show_in_intro` config option

**Issue:** #29 (partial — logo portion only; #29 covers broader theming)
**PR keyword:** `References #29` (don't close; issue covers typography, colors, spacing too)

### What it does
Adds a `show_in_intro` boolean to the `logo` config block, matching the existing
`show_in_header` pattern. When set to `false`, the logo is hidden on the entrance
(sign-in) page.

```yaml
logo:
  show_in_intro: false   # new
  show_in_header: false  # existing
```

### Files to change

1. **`src/lib/types/public.js`** — Add `show_in_intro` to the `LogoOptions` typedef
   Current (line ~1533):
   ```js
   * @property {boolean} [show_in_header] Whether to show the logo in the header. Default: `true`.
   ```
   Add after:
   ```js
   * @property {boolean} [show_in_intro] Whether to show the logo on the entrance (sign-in) page. Default: `true`.
   ```

2. **`src/lib/components/entrance/entrance-page.svelte`** — Wrap the logo `<img>` in a conditional
   Current (line ~34):
   ```svelte
   <img src={$appLogoURL} alt="" class="logo" />
   ```
   Replace with:
   ```svelte
   {#if $cmsConfig?.logo?.show_in_intro ?? true}
     <img src={$appLogoURL} alt="" class="logo" />
   {/if}
   ```

3. **`package/schema/sveltia-cms.json`** — Regenerated automatically when `pnpm build` runs

### Does this close #29?
No. #29 requests full theming (typography, colors, spacing, font size). Our change
only addresses the logo on the entrance page.

---

## Change 2 — CSS variable theme overrides (`themes/` folder)

**Issue:** #29 (theming — colors, typography, spacing)
**PR keyword:** `References #29`

### What it does
Adds a `themes/` directory containing per-theme CSS files that override Sveltia
CMS's CSS variables (as recommended by the maintainer in issue #29). Each file
scopes overrides to a body class (e.g. `.claude`, `.notion`) so multiple themes
can coexist in one page.

Also includes `themes/index.html` — a standalone preview page showing how the
CMS entrance page and common UI elements look under each theme.

Themes included:
- `notion.css` — Notion-inspired soft neutrals
- `claude.css` — Claude.ai terracotta and warm tones
- `openai.css` — OpenAI signal green
- `codex.css` — Codex dark terminal aesthetic
- `grok.css` — Grok violet
- `xai.css` — xAI orbit blue
- `georgia.css` — Georgia.org pine green
- `palette.css` — shared color utility classes
- `heatmap.css` — heatmap scale utilities

### Usage (in admin page)
```html
<link rel="stylesheet" href="/sveltia-cms/themes/claude.css">
<body class="claude">
```

### Files added
- `themes/*.css` — theme overrides
- `themes/*.md` — theme notes (codex, grok, openai, xai)
- `themes/index.html` — preview page

---

## Change 3 — `extra_css` / `extra_js` config options

**Issue:** #29 (custom theming — site-specific stylesheet and script injection)
**PR keyword:** `References #29`

### What it does
Adds `extra_css` and `extra_js` string arrays to `CmsConfig`. The CMS injects
them as `<link>` and `<script async>` tags via `<svelte:head>` before rendering.
Reads from `/config.yaml` at the site root so each deployment controls its own
dependencies without touching the CMS source.

```yaml
extra_css:
  - /localsite/css/base.css

extra_js:
  - /localsite/js/localsite.js?showheader=true&showsearch=false
```

### Files changed
- `src/lib/types/public.js` — `extra_css` and `extra_js` added to `CmsConfig` typedef
- `src/lib/components/app.svelte` — fetches `/config.yaml` via `fetchSiteConfig()`,
  renders injected tags in `<svelte:head>`
- `src/lib/services/config/site-config.js` — new; fetches and parses `/config.yaml`,
  returns empty object if absent (never errors)
- `config.yaml` — placeholder in repo root; sites place their own at webroot `/config.yaml`
- `themes/index.html` — now fetches `/config.yaml` with a minimal inline YAML parser
  instead of hardcoding localsite paths

### Config file locations
- `webroot/config.yaml` — site-specific (localsite); not in sveltia-cms repo
- `cms/config.yaml` — placeholder with commented examples; overwritten per site

---

## Combined PR — one PR covers Changes 1–3

All changes address #29. Submit as one PR with:
- Title: `Add logo.show_in_intro config option and CSS variable theme overrides`
- Body: `References #29`
- Do NOT use `Closes #29` — the issue requested broader theming that is still outstanding.

---

## Naming note
The param is `show_in_intro`, not `show_in_entrance`, to stay concise and match
the informal term used in the Sveltia UI source ("entrance page" in code,
"intro" as the user-facing concept).
