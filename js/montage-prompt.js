// "Ask an SI" prompt on /home/, hidden until its "Ask an SI" button is clicked.
// The prompt is built from the NASA picture of the day shown above it (window.nasaDayPrompt, set by home/index.html),
// else from the selected location and filters. It can be edited before sending to Claude, ChatGPT, Grok and other LLMs.
(function () {
  // Icons are saved in localsite/img/icon/llm/, found from this script's own URL
  const ICON_ROOT = (document.currentScript && document.currentScript.src)
    ? new URL("../img/icon/llm/", document.currentScript.src).href
    : "/localsite/img/icon/llm/";

  // Each button opens the LLM in a new tab with the prompt filled in.
  // mono: a black icon, shown white in dark mode
  // copy: also copies the prompt, for sites that may not fill in the q= prompt
  // more: hidden until the "More" button is clicked
  // A url that doesn't end in "=" opens without the prompt, so copy: true pastes it in
  const LLMS = [
    { id: "askClaudeBtn", name: "Claude", color: "#D97757", icon: "claude.svg", url: "https://claude.ai/new?q=" },
    { id: "askGrokBtn", name: "Grok", color: "#3B82F6", icon: "grok.svg", mono: true, url: "https://grok.com/?q=" },
    { id: "askChatGPTBtn", name: "ChatGPT", color: "#10A37F", icon: "chatgpt.svg", mono: true, url: "https://chatgpt.com/?q=" },
    { id: "askGeminiBtn", name: "Gemini", color: "#8B5CF6", icon: "gemini.png", copy: true, url: "https://gemini.google.com/app?q=" },
    { id: "askMetaBtn", name: "Meta", color: "#D946EF", icon: "meta.png", copy: true, url: "https://www.meta.ai/?prompt=" },
    // China (DeepSeek and Alibaba's Qwen)
    { id: "askDeepSeekBtn", name: "Deep", color: "#4D6BFE", icon: "deepseek.svg", copy: true, more: true, url: "https://chat.deepseek.com/?q=" },
    { id: "askQwenBtn", name: "Qwen", color: "#615CED", icon: "qwen.svg", copy: true, more: true, url: "https://chat.qwen.ai/?q=" },
    // Europe (Mistral's Le Chat, France)
    { id: "askMistralBtn", name: "Mistral", color: "#FA500F", icon: "mistral.svg", copy: true, more: true, url: "https://chat.mistral.ai/chat?q=" },
    // Image and video generators: Kling (Kuaishou), Seedance (ByteDance, in Dreamina by CapCut) and Midjourney
    { id: "askKlingBtn", name: "Kling", color: "#04A6F0", icon: "kling.svg", copy: true, more: true, url: "https://app.klingai.com/global/" },
    { id: "askSeedanceBtn", name: "SeeDance", color: "#3C8CFF", icon: "seedance.svg", copy: true, more: true, url: "https://dreamina.capcut.com/" },
    { id: "askMidjourneyBtn", name: "Midjourney", color: "#6B7280", icon: "midjourney.svg", mono: true, copy: true, more: true, url: "https://www.midjourney.com/imagine" }
  ];

  let lastGenerated = ""; // The prompt text last written to the box
  let edited = false; // True once the visitor types in the box, so their edits are kept
  let shownImageUrl = ""; // The picture or video shown to the right of the box

  function getValue(selector) {
    const el = document.querySelector(selector);
    if (!el) return "";
    return "value" in el ? el.value.trim() : el.textContent.trim();
  }

  // Prompts are lists of segments: { text, bold }. Bold segments show bold in the box and are sent as plain text.
  function joinBlocks(blocks) {
    const segments = [];
    blocks.filter(function (block) { return block.length; }).forEach(function (block, i) {
      if (i) segments.push({ text: "\n\n" });
      block.forEach(function (seg) { segments.push(seg); });
    });
    return segments;
  }

  // Asks the LLM for an update on the NASA picture, with images including one generated from the description
  function buildNasaPrompt(day) {
    const intro = "Provide an update on the space image described below. Share what has been learned or observed since it was published, " +
      "including the latest discoveries and research about this subject. Provide related images with links to their sources, " +
      "and generate a new image based on the description and source image.";
    // "Date - Title - Credit: Name" on one line, with the title bold
    const headingParts = [];
    if (day.date) headingParts.push({ text: day.date });
    if (day.title) headingParts.push({ text: day.title, bold: true });
    if (day.credit) headingParts.push({ text: "Credit: " + day.credit });
    const heading = [];
    headingParts.forEach(function (seg, i) {
      if (i) heading.push({ text: " - " });
      heading.push(seg);
    });
    // The explanation, with "Source: link" on the next line (no blank line between)
    const explanationLine = [day.explanation, day.permalink ? "Source: " + day.permalink : ""].filter(Boolean).join("\n");
    return joinBlocks([
      [{ text: intro }],
      heading,
      explanationLine ? [{ text: explanationLine }] : []
    ]);
  }

  function buildPrompt() {
    if (window.nasaDayPrompt) return buildNasaPrompt(window.nasaDayPrompt);
    const location = getValue("#keywordsTB");
    const request = getValue("#requests");
    const country =
      getValue("#country") ||
      getValue("#countrySelect") ||
      getValue("[name='country']");

    const parts = [];

    if (location) {
      parts.push(`Create a cinematic image/video montage for this location: ${location}.`);
    }

    if (country) {
      parts.push(`Use country context: ${country}.`);
    }

    if (request) {
      parts.push(`Additional context: ${request}.`);
    }

    parts.push("Include realistic environmental details, local culture, and visually engaging scenes.");

    return [{ text: parts.join("\n") }];
  }

  function segmentsText(segments) {
    return segments.map(function (seg) { return seg.text; }).join("");
  }

  // The box's text with line breaks. innerText needs the box rendered, so textContent is used while it's hidden.
  function getPromptText() {
    const field = document.querySelector("#llmPrompt");
    if (!field) return "";
    return (field.offsetParent ? field.innerText : field.textContent).trim();
  }

  function addStyles() {
    if (document.getElementById("llmPromptStyles")) return;
    const style = document.createElement("style");
    style.id = "llmPromptStyles";
    style.textContent = `
      .llm-prompt-text {
        display: block; box-sizing: border-box;
        width: 100%; /* Width comes from .llm-prompt-box, which the corner drag resizes */
        padding: 14px 16px;
        font-family: inherit; font-size: 15px; line-height: 1.55;
        color: var(--text-primary, #1F2937);
        background: #F9FAFB;
        border: 1px solid transparent;
        border-radius: 14px;
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
        min-height: calc(1.55em + 30px); /* One line */
        white-space: pre-wrap; /* Keeps the prompt's line breaks */
        overflow-wrap: anywhere; /* Long links wrap */
        overflow-y: hidden; /* Grows with its text, see autoGrow(). Resized by the invisible .llm-prompt-resize corner. */
        cursor: text;
        outline: none;
        transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
      }
      /* Sizes below follow the width of the prompt section (container queries), not the window */
      #llmPromptWrap { container-type: inline-size; }
      /* The prompt box and, once a swiper picture is clicked, the picture to its right */
      .llm-prompt-row { display: flex; flex-wrap: wrap; align-items: stretch; gap: 16px; }
      .llm-prompt-box { position: relative; flex: 1 1 320px; min-width: 0; max-width: 100%; } /* The corner drag sets its width */
      /* The picture is as tall as the text box. It's absolutely placed so its own height doesn't stretch the row. */
      .llm-prompt-image { position: relative; flex: 0 1 300px; min-width: 200px; margin: 0; }
      /* The whole picture shows, never cropped: it shrinks to fit the panel and sits at its top */
      .llm-prompt-image-link { position: absolute; inset: 0; display: flex; align-items: flex-start; justify-content: center; }
      .llm-prompt-image img {
        display: block; width: auto; height: auto; max-width: 100%; max-height: 100%;
        border-radius: 14px;
      }
      .llm-prompt-image [hidden] { display: none; } /* The link and player set display, which would override hidden */
      /* A video plays in an embedded player, wider than a picture */
      .llm-prompt-image.is-video { flex-basis: 480px; }
      .llm-prompt-video {
        position: absolute; inset: 0; display: block;
        width: 100%; height: 100%; min-height: 0; /* Overrides a site-wide iframe min-height of 65vh */
        border: 0; border-radius: 14px; background: #000;
      }
      /* Narrow: the picture or video goes below the text box at the same full width, at its own height */
      @container (max-width: 640px) {
        .llm-prompt-image, .llm-prompt-image.is-video { flex: 1 1 100%; }
        .llm-prompt-image-link { position: static; }
        .llm-prompt-image img { width: 100%; max-height: none; }
        .llm-prompt-video { position: static; height: auto; aspect-ratio: 16 / 9; }
      }
      /* Invisible drag area on the lower-right corner. Only the cursor shows it can be dragged. */
      .llm-prompt-resize {
        position: absolute; right: 0; bottom: 0;
        width: 18px; height: 18px;
        cursor: nwse-resize;
        touch-action: none;
      }
      .llm-prompt-text b { font-weight: 700; }
      .llm-prompt-text:empty::before { content: attr(data-placeholder); color: #9CA3AF; pointer-events: none; }
      .llm-prompt-text:hover { background: #fff; }
      .llm-prompt-text:focus {
        background: #fff;
        border-color: #D97757;
        box-shadow: 0 0 0 4px rgba(217, 119, 87, 0.15);
      }
      .dark .llm-prompt-text {
        color: #e8edf5;
        background: #2a2a2a;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
      }
      .dark .llm-prompt-text:hover, .dark .llm-prompt-text:focus { background: #303030; }
      .dark .llm-prompt-text:focus { border-color: #D97757; box-shadow: 0 0 0 4px rgba(217, 119, 87, 0.22); }
      .llm-reveal-btn .llm-icon { color: var(--llm-color); }
      .llm-ask-buttons { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
      .llm-copy-note { min-height: 1.4em; margin-top: 6px; font-size: 14px; color: var(--text-secondary, #4B5563); }
      .dark .llm-copy-note { color: #cbd5e1; }
      .llm-ask-btn {
        --llm-color: #6B7280;
        display: inline-flex; align-items: center; gap: 8px;
        padding: 8px 18px 8px 14px;
        font-family: inherit; font-size: 15px; font-weight: 600; line-height: 1.4;
        color: var(--text-primary, #1F2937);
        background: color-mix(in srgb, var(--llm-color) 10%, var(--bg-card, #fff));
        border: none;
        border-radius: 999px;
        cursor: pointer;
        transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
      }
      .llm-ask-btn:hover {
        background: color-mix(in srgb, var(--llm-color) 18%, var(--bg-card, #fff));
        box-shadow: 0 2px 8px color-mix(in srgb, var(--llm-color) 35%, transparent);
        transform: translateY(-1px);
      }
      .llm-ask-btn[hidden] { display: none; }
      .llm-more-btn { color: #4B5563; }
      .llm-ask-btn:active { transform: translateY(0); box-shadow: none; }
      .llm-ask-btn:focus-visible { outline: 2px solid var(--llm-color); outline-offset: 2px; }
      .llm-ask-btn .llm-icon { width: 20px; height: 20px; display: block; transition: transform 0.12s ease; }
      /* Narrow: smaller LLM buttons. Very narrow: icons only, with the name in the button's title and aria-label. */
      @container (max-width: 640px) {
        .llm-ask-buttons { gap: 8px; }
        .llm-ask-btn { padding: 6px 12px 6px 10px; font-size: 13px; gap: 6px; }
        .llm-ask-btn .llm-icon { width: 18px; height: 18px; }
      }
      @container (max-width: 440px) {
        .llm-ask-btn { padding: 8px; }
        .llm-ask-btn .llm-name { display: none; }
      }
      .llm-ask-btn:hover .llm-icon { transform: rotate(-8deg) scale(1.08); }
      .dark .llm-ask-btn .llm-icon.mono { filter: invert(1); }
      .dark .llm-ask-btn { color: #e8edf5; background: color-mix(in srgb, var(--llm-color) 18%, #222); }
      .dark .llm-ask-btn:hover { background: color-mix(in srgb, var(--llm-color) 28%, #222); }
    `;
    document.head.appendChild(style);
  }

  function ensurePromptUI() {
    if (document.querySelector("#llmPromptWrap")) return;

    // Placed in #llmPromptHolder when the page has one (after the charts on /home/), else before #requests
    const holder = document.querySelector("#llmPromptHolder");
    const requests = document.querySelector("#requests");
    if (!holder && (!requests || !requests.parentNode)) return;

    addStyles();
    // "Ask an SI" button that reveals the section, then hides itself
    const reveal = document.createElement("button");
    reveal.type = "button";
    reveal.id = "askSIBtn";
    reveal.className = "llm-ask-btn llm-reveal-btn";
    reveal.style.setProperty("--llm-color", "#6366F1");
    reveal.innerHTML = '<svg class="llm-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z"/></svg>Ask an SI';

    const wrap = document.createElement("div");
    wrap.id = "llmPromptWrap";
    wrap.style.margin = "0";
    wrap.style.display = "none";

    const buttons = LLMS.map(function (llm) {
      const title = llm.copy ? `Copy this prompt and open ${llm.name}` : `Open ${llm.name} with this prompt`;
      return `<button type="button" id="${llm.id}" class="llm-ask-btn" style="--llm-color:${llm.color}" title="${title}" aria-label="${llm.name}"${llm.more ? " hidden" : ""}>` +
        `<img class="llm-icon${llm.mono ? " mono" : ""}" src="${ICON_ROOT + llm.icon}" alt="" aria-hidden="true"><span class="llm-name">${llm.name}</span></button>`;
    }).join("") +
      // Reveals the "more" LLMs, then hides itself
      (LLMS.some(function (llm) { return llm.more; })
        ? `<button type="button" id="askMoreBtn" class="llm-ask-btn llm-more-btn" style="--llm-color:#6B7280" title="More LLMs" aria-label="More LLMs">` +
          `<svg class="llm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>` +
          `<span class="llm-name">More</span></button>`
        : "");

    wrap.innerHTML = `
      <div class="llm-prompt-row">
      <div class="llm-prompt-box">
        <!-- An editable div rather than a textarea, so the title can show bold -->
        <div
          id="llmPrompt"
          class="llm-prompt-text"
          role="textbox"
          aria-multiline="true"
          aria-label="Ask an SI"
          spellcheck="false"
          data-placeholder="Prompt will be generated from the picture above..."
        ></div>
        <div class="llm-prompt-resize" aria-hidden="true"></div>
      </div>
      <!-- Shown by showLlmPromptImage() when a swiper picture is clicked -->
      <figure class="llm-prompt-image" hidden>
        <a class="llm-prompt-image-link" target="_blank" rel="noopener noreferrer"><img alt=""></a>
        <iframe class="llm-prompt-video" hidden allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
      </figure>
      </div>

      <div class="llm-ask-buttons">${buttons}</div>
      <div class="llm-copy-note" role="status" aria-live="polite"></div>
    `;

    // plaintext-only keeps pasted text plain. Browsers without it use true, with plain-text pasting below.
    const field = wrap.querySelector("#llmPrompt");
    try { field.contentEditable = "plaintext-only"; } catch (e) { /* Not supported */ }
    if (field.contentEditable !== "plaintext-only") {
      field.contentEditable = "true";
      field.addEventListener("paste", function (event) {
        event.preventDefault();
        const text = (event.clipboardData || window.clipboardData).getData("text/plain");
        document.execCommand("insertText", false, text);
      });
    }

    // A landscape picture's panel is sized once its shape is known
    wrap.querySelector(".llm-prompt-image img").addEventListener("load", fitImagePanel);

    if (holder) {
      holder.append(reveal, wrap);
    } else {
      requests.parentNode.insertBefore(reveal, requests);
      requests.parentNode.insertBefore(wrap, requests);
    }
    reveal.addEventListener("click", function () {
      openPrompt();
      showDayImage(); // The picture the prompt describes, to the right of the box
      field.focus();
    });
  }

  // Shows the prompt section and hides the "Ask an SI" button
  function openPrompt() {
    const reveal = document.querySelector("#askSIBtn");
    const wrap = document.querySelector("#llmPromptWrap");
    if (!wrap) return;
    if (reveal) reveal.style.display = "none";
    wrap.style.display = "block";
    document.body.classList.add("llm-prompt-open"); // Pages can hide text the prompt repeats, such as #nasaDay on /home/
    autoGrow(document.querySelector("#llmPrompt")); // Sized now that it's visible
  }

  // Opens the prompt with a picture to the right of the box. Clicking the picture opens it in a new tab.
  // A video plays in an embedded player there instead. APOD video urls are already embed urls (YouTube, Vimeo and others).
  // Called by home/index.html when a swiper slide is clicked: { url, title, mediaType, autoplay }
  // autoplay: true starts a video playing, for a click on its slide
  window.showLlmPromptImage = function (image) {
    if (!image || !/^https?:\/\//i.test(image.url || "")) return;
    ensurePromptUI();
    const figure = document.querySelector(".llm-prompt-image");
    if (!figure) return;
    const isVideo = image.mediaType === "video";
    const imageLink = figure.querySelector(".llm-prompt-image-link");
    const img = imageLink.querySelector("img");
    const video = figure.querySelector(".llm-prompt-video");
    figure.classList.toggle("is-video", isVideo);
    imageLink.hidden = isVideo;
    video.hidden = !isVideo;
    if (isVideo) {
      // Starts playing from the click. Browsers that block autoplay show the player's play button.
      const url = new URL(image.url);
      if (image.autoplay) url.searchParams.set("autoplay", "1");
      if (video.src !== url.href) video.src = url.href;
      video.title = image.title || "Video";
      img.removeAttribute("src");
    } else {
      if (video.getAttribute("src")) video.src = "about:blank"; // Stops a video that was playing
      imageLink.href = image.url;
      imageLink.title = "Open image in new tab";
      figure.style.flexBasis = ""; // Back to the default 300px until the new picture's shape is known
      img.src = image.url;
      img.alt = image.title || "";
    }
    figure.hidden = false;
    shownImageUrl = image.url;
    openPrompt();
  };

  // Shows the picture of the NASA day the prompt describes (window.nasaDayPrompt from home/index.html)
  function showDayImage() {
    const day = window.nasaDayPrompt;
    if (!day || !day.url || day.url === shownImageUrl) return;
    window.showLlmPromptImage({ url: day.url, title: day.title, mediaType: day.mediaType });
  }

  // A landscape picture widens its panel, narrowing the text box, so the picture is closer to the text box's height.
  // A narrower box is taller, so the width is found in a few rounds. Each round only widens the panel, so it settles.
  // The panel stays 300px for portrait and square-ish pictures (up to 1.1 wide) and videos, and below the box in narrow areas.
  // It's left alone once the text box has been dragged to a width.
  function fitImagePanel() {
    const figure = document.querySelector(".llm-prompt-image");
    const box = document.querySelector(".llm-prompt-box");
    const wrap = document.querySelector("#llmPromptWrap");
    if (!figure || !box || !wrap || figure.hidden || figure.classList.contains("is-video")) return;
    const img = figure.querySelector("img");
    const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 0;
    const narrow = wrap.clientWidth <= 640; // Matches the @container (max-width: 640px) layout
    if (ratio <= 1.1 || narrow || box.style.flexBasis) { // Square-ish pictures stay at 300px too
      figure.style.flexBasis = "";
      return;
    }
    const MIN_WIDTH = 300, GAP = 16, MIN_TEXT_WIDTH = 360;
    const rowWidth = figure.parentElement.clientWidth;
    const maxWidth = Math.max(MIN_WIDTH, Math.min(rowWidth * 0.55, rowWidth - GAP - MIN_TEXT_WIDTH));
    let width = MIN_WIDTH;
    for (let i = 0; i < 5; i++) {
      figure.style.flexBasis = width + "px";
      const next = Math.round(Math.min(maxWidth, Math.max(MIN_WIDTH, ratio * box.offsetHeight)));
      if (Math.abs(next - width) < 4) break;
      width = next;
    }
    figure.style.flexBasis = width + "px";
  }

  let manualHeight = 0; // Height from dragging the lower-right corner

  // Fits all its text, at least one line tall.
  // A height dragged larger is kept. A height dragged smaller lasts until the text changes.
  function autoGrow(field) {
    if (!field) return;
    field.style.height = ""; // Natural height fits the text
    if (manualHeight > field.offsetHeight) field.style.height = manualHeight + "px";
    field.style.overflowY = "hidden";
    fitImagePanel(); // The text's height changed, so a landscape picture's panel may need a new width
  }

  // Drag the invisible lower-right corner to resize the prompt box down and to the right.
  // Width ranges from 200px to the full width of the area holding the box, which is also its starting width.
  function bindResizeCorner() {
    const handle = document.querySelector(".llm-prompt-resize");
    const field = document.querySelector("#llmPrompt");
    const box = document.querySelector(".llm-prompt-box");
    if (!handle || !field || !box) return;
    const MIN_WIDTH = 200;
    let startX = 0, startY = 0, startWidth = 0, startHeight = 0, minHeight = 0, maxWidth = 0, dragging = false;
    handle.addEventListener("pointerdown", function (event) {
      event.preventDefault();
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      startWidth = box.offsetWidth;
      maxWidth = box.parentElement ? box.parentElement.clientWidth : startWidth; // The row. The picture wraps below a wide box.
      box.style.flex = "0 1 " + startWidth + "px"; // Shrinks to stay within the page if the window narrows
      startHeight = field.offsetHeight;
      minHeight = parseFloat(getComputedStyle(field).minHeight) || 0; // One line
      handle.setPointerCapture(event.pointerId);
    });
    handle.addEventListener("pointermove", function (event) {
      if (!dragging) return;
      const width = Math.min(maxWidth, Math.max(MIN_WIDTH, startWidth + event.clientX - startX));
      const height = Math.max(minHeight, startHeight + event.clientY - startY);
      box.style.flexBasis = width + "px";
      field.style.height = height + "px";
      field.style.overflowY = field.scrollHeight > field.clientHeight ? "auto" : "hidden";
    });
    function endDrag(event) {
      if (!dragging) return;
      dragging = false;
      manualHeight = field.offsetHeight;
      if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    }
    handle.addEventListener("pointerup", endDrag);
    handle.addEventListener("pointercancel", endDrag);
  }

  function updatePrompt() {
    const field = document.querySelector("#llmPrompt");
    if (!field || edited) return; // Leave the prompt alone once the visitor has edited it
    const segments = buildPrompt();
    const text = segmentsText(segments);
    if (text === lastGenerated) return; // Unchanged, so keep any height dragged smaller
    lastGenerated = text;
    field.textContent = "";
    segments.forEach(function (seg) {
      if (seg.bold) {
        const b = document.createElement("b");
        b.textContent = seg.text;
        field.appendChild(b);
      } else {
        field.appendChild(document.createTextNode(seg.text));
      }
    });
    autoGrow(field);
  }

  function bindEvents() {
    ["#keywordsTB", "#requests", "#country", "#countrySelect", "[name='country']"].forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        el.addEventListener("input", updatePrompt);
        el.addEventListener("change", updatePrompt);
      });
    });

    document.addEventListener("click", function () {
      setTimeout(updatePrompt, 150);
    });

    const moreBtn = document.getElementById("askMoreBtn");
    if (moreBtn) {
      moreBtn.addEventListener("click", function () {
        LLMS.forEach(function (llm) {
          const btn = llm.more && document.getElementById(llm.id);
          if (btn) btn.hidden = false;
        });
        moreBtn.hidden = true;
        const first = LLMS.find(function (llm) { return llm.more; });
        if (first) document.getElementById(first.id).focus(); // Keyboard focus moves to the first revealed button
      });
    }

    LLMS.forEach(function (llm) {
      const btn = document.getElementById(llm.id);
      if (!btn) return;
      btn.addEventListener("click", function () {
        const prompt = getPromptText();
        // Copied before the new tab opens, since the clipboard can't be written once this page loses focus
        if (llm.copy) {
          const key = /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘V" : "Ctrl+V";
          showCopyNote(copyText(prompt) ? `Prompt copied. Paste it into ${llm.name} with ${key}.` : "");
        } else {
          showCopyNote("");
        }
        window.open(/=$/.test(llm.url) ? llm.url + encodeURIComponent(prompt) : llm.url, "_blank", "noopener");
      });
    });
  }

  // Copies right away, within the click. Returns false if the browser blocked it.
  function copyText(text) {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.cssText = "position:fixed; top:0; left:0; opacity:0; pointer-events:none";
    document.body.appendChild(area);
    area.select();
    let copied = false;
    try { copied = document.execCommand("copy"); } catch (error) { copied = false; }
    area.remove();
    if (!copied && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(function (error) { console.warn("Prompt not copied:", error); });
      copied = true;
    }
    return copied;
  }

  function showCopyNote(message) {
    const note = document.querySelector(".llm-copy-note");
    if (note) note.textContent = message;
  }

  document.addEventListener("input", function (event) {
    const field = event.target;
    if (!field || field.id !== "llmPrompt") return;
    if (field.innerText.trim() === "") {
      field.textContent = ""; // Clears a leftover <br> so the placeholder shows
      edited = false; // An emptied box takes the generated prompt again
      lastGenerated = "";
    } else {
      edited = true;
    }
    autoGrow(field);
  });
  window.addEventListener("resize", function () {
    const field = document.querySelector("#llmPrompt");
    if (field && field.offsetParent) autoGrow(field); // Skip while hidden
  });
  // home/index.html sets window.nasaDayPrompt and fires this when the swiper's centered picture changes
  // While the prompt is open and unedited, the picture follows the prompt to the newly centered slide.
  document.addEventListener("nasaDayChange", function () {
    updatePrompt();
    const wrap = document.querySelector("#llmPromptWrap");
    if (wrap && wrap.style.display !== "none" && !edited) showDayImage();
  });

  document.addEventListener("DOMContentLoaded", function () {
    ensurePromptUI();
    bindEvents();
    bindResizeCorner();
    updatePrompt();
  });
})();
