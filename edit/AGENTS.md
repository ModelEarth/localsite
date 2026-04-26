# AGENTS.md — ModelEarth / sveltia-cms work notes

Tracking files for cms submodule work live here in `localsite/editor/`:
- `PLAN-theming.md` — theming PR roadmap (logo, CSS variables, themes folder)
- `PLAN-inline.md` — inline editor implementation plan
- `PR-NOTES.md` — detailed change specs for upstream PRs

---

## Repo layout (cms/ submodule)

| Path | Purpose |
|---|---|
| `cms/src/` | Svelte source — edit here, then rebuild |
| `cms/package/dist/` | Build output — `pnpm build` from `cms/` root (requires Node ≥22) |
| `cms/package/schema/` | JSON schema — auto-regenerated on build from `src/lib/types/public.js` |
| `cms/themes/` | CSS variable theme overrides; `themes/index.html` is the preview page |

## Build

```bash
source ~/.nvm/nvm.sh && nvm use 22
cd cms
pnpm build
```

## Theme files

CSS files in `cms/themes/` are the source of truth.
`cms/themes/index.html` loads them from `/sveltia-cms/themes/`.
Do not duplicate them back into localsite.

## Inline editor

The CMS supports custom mounting via a `#nc-root` element.
See `PLAN-inline.md` for implementation details and `launchCMS()` in
`localsite/js/localsite.js` for the runtime helper.
