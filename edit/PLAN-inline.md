# PLAN-inline.md — Inline editor implementation

Goal: show the Sveltia CMS editor inline within the page (where the "Edit Page"
button lives) rather than taking over the full viewport.

---

## How it works — no cms/ changes required

Sveltia CMS already supports custom mounting via a `#nc-root` element
(`cms/src/lib/components/app.svelte` lines 72–92):

- **No `#nc-root`** → CMS mounts to `<body>` and fills the full page (default).
- **`#nc-root` present, `position: static`** → CMS sets it to `position: relative`
  and mounts inside it, staying in document flow (inline).
- **`#nc-root` present, height = 0** → CMS falls back to `position: fixed` with
  `inset: ${top}px 0 0 0` (anchored below the element but still full-viewport-width).

Creating `#nc-root` in the DOM before the CMS script loads is all that is needed.

---

## Implementation (done — no cms/ changes)

### `localsite/js/localsite.js` — `launchCMS(options)`

Accepts an optional `options` object:
- `options.inline` — boolean; overrides the global default
- `options.target` — element or CSS selector; `#nc-root` is inserted after this
  element when creating it (so the editor appears below the button)

Falls back to `window.cmsInlineEditor` for the global default, which is set by
reading `inline_editor` from `/config.yaml` on page init.

```javascript
// Per-page call:
launchCMS({ inline: true, target: '#editPageBtn' });

// Full-page call (explicit):
launchCMS({ inline: false });

// Use whatever config.yaml / window.cmsInlineEditor says:
launchCMS();
```

### `/config.yaml` — universal default

```yaml
# inline_editor: true   # show editor inline; false (default) = full-page takeover
inline_editor: false
```

`localsite.js` fetches `/config.yaml` on init and sets `window.cmsInlineEditor`
from the `inline_editor` key. Any page that calls `launchCMS()` without explicit
options inherits this default.

---

## CSS notes

When inline, `#nc-root` must have an explicit height or the CMS will treat it as
zero-height and fall back to fixed positioning. Options:

```css
/* Fixed height */
#nc-root { height: 80vh; }

/* Or let it grow to fill remaining page */
#nc-root { min-height: 600px; }
```

The CMS UI is designed for full-viewport use. In a smaller inline container
the entrance (sign-in) page and collection list still render correctly; the
main editor toolbar may feel cramped below ~800px width.

---

## Possible future cms/ PR — `inline` config option

If a cleaner UX is desired (e.g. the CMS reads `display: inline` from config and
manages height automatically), a small upstream PR would be needed:

**`src/lib/types/public.js`** — add `display` to `CmsConfig`:
```js
* @property {'fullpage'|'inline'} [display] Editor display mode. Default: `'fullpage'`.
```

**`cms/src/lib/components/app.svelte`** — on mount, if `$cmsConfig.display === 'inline'`
and no `#nc-root` exists, create one and insert it before `#smartFooter` (or a
configurable selector).

This would let sites set `display: inline` in their `config.yml` without any
per-page JS. File in `localsite/editor/PR-NOTES.md` when ready to submit.
