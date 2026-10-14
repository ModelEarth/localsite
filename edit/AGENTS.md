# AGENTS.md — ModelEarth / Sveltia CMS work notes

Pages load Sveltia CMS from its npm release, or from a local build of `sveltia-cms/`, a git-ignored
clone of `sveltia/sveltia-cms` kept as a read-only reference. Never commit, push, fork, or send PRs
from it. Customize the editor from localsite (config, `launchCMS()`, theme CSS) instead of the CMS source.

Tracking files live here in `localsite/edit/`:
- `PLAN-theming.md` — theming from localsite (CSS variables, themes folder)
- `PLAN-inline.md` — inline editor implementation plan

---

## Repo layout

| Path | Purpose |
|---|---|
| `sveltia-cms/src/` | Upstream Svelte source — read only |
| `sveltia-cms/package/dist/` | Optional local build, used by `launchCMS()` when present — `pnpm build` from `sveltia-cms/` |
| `support/site/config.yaml` | Site config: `backend`, `collections`, and the `cms:` block read by `localsite/js/cms.js` |
| `localsite/css/themes/` | CSS variable theme overrides; `themes/index.html` is the preview page |

## Build

Optional: pull `sveltia-cms` to update it, then build locally. Without a build, pages use
the npm release from unpkg.

```bash
cd sveltia-cms
source ~/.nvm/nvm.sh && nvm use   # Node version from .nvmrc
pnpm install
pnpm build
```

## Theme files

CSS files in `localsite/css/themes/` are the source of truth.
`localsite/css/themes/index.html` is the preview page.

## Inline editor

The CMS supports custom mounting via a `#nc-root` element.
See `PLAN-inline.md` for implementation details and `launchCMS()` in
`localsite/js/localsite.js` for the runtime helper.
