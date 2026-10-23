# PLAN-inline.md — Inline editor implementation

Goal: show the Sveltia CMS editor inline within the page (where the "Edit Page"
button lives) rather than taking over the full viewport.

---

## How it works — no CMS source changes required

Sveltia CMS already supports custom mounting via a `#nc-root` element
(`sveltia-cms/src/lib/components/app.svelte`, around line 80):

- **No `#nc-root`** → CMS mounts to `<body>` and fills the full page (default).
- **`#nc-root` present, `position: static`** → CMS sets it to `position: relative`
  and mounts inside it, staying in document flow (inline).
- **`#nc-root` present, height = 0** → CMS falls back to `position: fixed` with
  `inset: ${top}px 0 0 0` (anchored below the element but still full-viewport-width).

Creating `#nc-root` in the DOM before the CMS script loads is all that is needed.

---

## Implementation (done — no CMS source changes)

### `localsite/js/localsite.js` — `launchCMS(options)`

Accepts an optional `options` object:
- `options.inline` — boolean; overrides the global default
- `options.target` — element or CSS selector; `#nc-root` is inserted after this
  element when creating it (so the editor appears below the button)
- `options.heightRatio` — scales the initial height (the window space below `#nc-root`);
  `options.extraHeight` adds pixels to it. The Markdown "Edit Content" menu uses `0.5`
  plus `220`. A bar along the bottom of `#nc-root` drags the height taller or shorter.
  While an entry is open, `#nc-root` grows to fit its fields as text is added, and shrinks
  back toward that starting or dragged height as text is removed.

Falls back to `window.cmsInlineEditor` for the global default, which is set by
reading `inline_editor` from the `cms:` block in `support/site/config.yaml`
(via `localsite/js/cms.js`).

```javascript
// Per-page call:
launchCMS({ inline: true, target: '#editPageBtn' });

// Full-page call (explicit):
launchCMS({ inline: false });

// Use whatever support/site/config.yaml / window.cmsInlineEditor says:
launchCMS();
```

### `support/site/config.yaml` — universal default

```yaml
cms:
  inline_editor: true   # show editor inline; false (default) = full-page takeover
```

`localsite/js/cms.js` reads the `cms:` block and sets `window.cmsInlineEditor`
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
