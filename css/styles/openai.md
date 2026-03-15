# OpenAI Style (by Codex)

This theme is a solid approximation of the current OpenAI / ChatGPT UI language within the shared `base.css` token system.

## Review

The strongest parts of [`openai.css`](/Users/Loren/Documents/webroot/localsite/css/styles/openai.css) are the surface and control decisions:

- The light theme uses a soft off-white page (`#f7f7f2`) instead of flat white, which gets closer to ChatGPT’s quieter canvas.
- The dark theme lands on the expected near-charcoal surfaces (`#171717` and `#212121`) rather than pure black, which matches the product better.
- The primary accent stays in the OpenAI green family (`#10a37f` / `#19b58c`) and is used consistently across buttons, links, alerts, and badges.
- Large radii on cards and pills push the interface toward the modern ChatGPT feel without changing the underlying shared components too aggressively.

## What Reads Well

- The typography is restrained and neutral, which suits the OpenAI style better than expressive or editorial fonts.
- The light/dark token pairs are coherent, especially for `--text-main`, `--text-muted`, `--color-light`, and the info/primary alert families.
- The `.openai .card` override adds enough softness and depth to separate it from the more generic base style.

## What Is Still Approximate

- The real OpenAI product surfaces tend to be even more minimal and less decorative than this version, especially around shadows and border contrast.
- The palette rows necessarily invent a broader color system than the actual site exposes.
- The theme uses `OpenAI Sans` as a preferred font, but actual rendering still depends on what is available to the browser.

## Overall

As a reusable local demo theme, this is a good fit. It captures the current OpenAI / ChatGPT direction with the right neutrals, spacing feel, rounded controls, and green emphasis, while still working cleanly inside the existing shared component framework.
