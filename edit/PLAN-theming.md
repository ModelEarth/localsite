# PLAN-theming.md — Theming Sveltia CMS from localsite

Sveltia CMS is used unmodified. Theming happens in localsite, without changes to the CMS source.

---

## Done

- [x] `localsite/css/themes/*.css` — theme overrides. Each file sets `--sui-base-hue`
      and `--sui-font-family-default` so the Sveltia CMS UI (toolbar, inputs, buttons)
      inherits the theme
- [x] `localsite/css/themes/index.html` — preview page for all themes
- [x] `localsite/css/themes/README.md` — usage docs, theme table, `--sui-*` variable reference

---

## Later / backlog

- Load a theme CSS file by name from `localsite/css/themes/` automatically,
  driven by a setting in `support/site/config.yaml`
- Additional themes as needed
