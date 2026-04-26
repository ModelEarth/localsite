# PLAN-theming.md — ModelEarth / sveltia-cms theming roadmap

Tracking file lives in `localsite/editor/`. The work itself happens in the `cms/` submodule
(fork of `sveltia/sveltia-cms`). Source changes are built locally and served from
`cms/package/dist/sveltia-cms.js`.

---

## PR 1 — Full theming support (issue #29 — one combined PR)

**Status:** Ready to submit.

### Done
- [x] `src/lib/types/public.js` — added `show_in_intro` to `LogoOptions` typedef
- [x] `src/lib/components/entrance/entrance-page.svelte` — wrapped logo `<img>`
      in `{#if $cmsConfig?.logo?.show_in_intro ?? true}`
- [x] `pnpm build` — schema and dist regenerated, `show_in_intro` confirmed in schema
- [x] `/config.yaml` — `show_in_intro: false`, `show_in_header: false`, `app_title` set at webroot level
- [x] `explore/config.yml` — `show_in_intro: false` added (site-specific override)

### Remaining
- [ ] Open PR against `sveltia/sveltia-cms` — references #29, does not close it

---

### Also done (theming — originally planned as PR 2, merged into PR 1)
- [x] `themes/` folder — CSS files moved from `localsite/css/styles/`
- [x] Each theme file — `--sui-base-hue` and `--sui-font-family-default` added
      so the Sveltia CMS UI (toolbar, inputs, buttons) inherits each theme
- [x] `themes/index.html` — preview page for all themes
- [x] `themes/README.md` — usage docs, theme table, `--sui-*` variable reference

---

## Later / backlog

- Explore whether a `custom_theme` config key makes sense (load a theme CSS by
  name from the `themes/` folder automatically)
- `logo.show_in_intro` naming: flag to maintainer — they may prefer
  `show_in_entrance` to match internal component naming
- Additional themes as needed

---

## Build reminder

```bash
source ~/.nvm/nvm.sh && nvm use 22
cd /path/to/webroot/cms
pnpm build
```

Pages load the built output from `/cms/package/dist/sveltia-cms.js`.
