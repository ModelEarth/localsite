// Page tabs: a set of tabs, with the panel of the one selected below them, over the left 2/3 of a page's #fullscreen
// (the Earth map, or a page's photos), modeled on project/goals' tabs. Any page with #fullscreen can open one. Styles are
// in localsite/css/page-tabs.css, which this loads.
//
//   const set = PageTabs.create({ id: "infoTabs", label: "Info", hash: "info", tabs: [
//     { name: "weather", label: "Weather", readme: "/engine/info/weather.md" },  // A README, loaded once (loadMarkdown)
//     { name: "voices", label: "Voices", render: (panel) => {...} },            // Or the page fills the panel
//   ]});
//   set.open("voices");  set.close();  set.toggle();  set.isOpen();  set.selected;
//
// A set is .mapoverlay (localsite.js setMapOverlayHidden): it minimizes to the mini nav pill (#mininavpill) with the page's
// other tab sets, by its left-pointing triangle, or when the Earth map is clicked or played. The pill holds the tabs of
// the set shown last. Its × closes it. With a hash key (hash: "info"), the selected tab is in the hash (#info=weather),
// so a link opens it, and it closes when the key leaves the hash.
//
// While a set is open, not minimized and not stepping aside for the lower-left panel, <html> has .pagetabsOpen, and PageTabs.side() is the clear space to its right,
// where the talk circle (engine/js/talk-circle.js) moves.
(function () {
  "use strict";
  if (window.PageTabs) return;
  const SCRIPT = document.currentScript?.src || "";
  const CSS = SCRIPT ? new URL("../css/page-tabs.css", SCRIPT).href : "";
  if (CSS && !document.querySelector(`link[href="${CSS}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = CSS;
    document.head.append(link);
  }
  const GAP = 16; // Around a set, inside #fullscreen
  const BOTTOM = 88; // Kept clear at #fullscreen's bottom, for the voice widget's controls and the map's
  const NARROW = window.matchMedia("(max-width: 900px)");
  const sets = new Map();
  let shownAt = 0;

  const el = (tag, attrs = {}, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "text") e.textContent = v;
      else if (k === "html") e.innerHTML = v;
      else if (v !== false && v != null) e.setAttribute(k, v === true ? "" : v);
    }
    e.append(...kids);
    return e;
  };
  const minimized = () => document.documentElement.classList.contains("mapoverlayHidden");
  // The lower-left panel (#beanPanel: the Earth map's controls, or the bean's) open over the page: the sets end above it,
  // or step aside (.pagetabsAside on <html>, page-tabs.css) when that leaves them under MIN_H. Opening a set closes it.
  const MIN_H = 160;
  const html = document.documentElement;
  const panelOpen = () => html.classList.contains("beanPanelOpen") || html.classList.contains("earthControlsOpen");
  const aside = () => html.classList.contains("pagetabsAside");
  function panelTop(b) {
    const r = panelOpen() && document.getElementById("beanPanel")?.getBoundingClientRect();
    return r && r.height > 0 && r.top < b.top + b.height && r.left < b.left + b.width ? r.top : Infinity;
  }
  function closePanel() {
    const toggle = document.getElementById("earthControlsToggle");
    if (toggle?.getAttribute("aria-expanded") === "true") toggle.click();
    else if (panelOpen() || document.getElementById("beanPanel")?.classList.contains("ef-over")) window.mainEarthFilters?.setMapPanelOpen?.(false);
  }
  const openSets = () => [...sets.values()].filter((s) => s.isOpen());

  // The part of the window #fullscreen shows in: below the header and search filters when it's fixed behind them.
  function frame() {
    const fs = document.getElementById("fullscreen");
    const r = fs ? fs.getBoundingClientRect() : { top: 0, bottom: innerHeight, left: 0, right: innerWidth };
    const root = getComputedStyle(document.documentElement);
    const header = parseFloat(root.getPropertyValue("--header-h")) || window.topNavOffset || 0;
    const top = Math.max(r.top, fs && getComputedStyle(fs).position === "fixed" ? header : r.top, 0);
    return { top, bottom: Math.min(r.bottom, innerHeight), left: Math.max(r.left, 0), right: Math.min(r.right, innerWidth) };
  }
  // A set's box: the left 2/3 of the frame, or all of it on narrow windows, less GAP and the BOTTOM strip.
  function box() {
    const f = frame();
    const w = f.right - f.left - 2 * GAP;
    const width = NARROW.matches ? w : Math.round((f.right - f.left) * 2 / 3 - 1.5 * GAP);
    return { top: f.top + GAP, left: f.left + GAP, width, height: Math.max(0, f.bottom - BOTTOM - f.top - GAP) };
  }
  // The space right of an open set, for the talk circle. None on narrow windows, where the set is as wide as the frame.
  function side() {
    const f = frame(), b = box();
    const left = b.left + b.width + GAP;
    return { top: f.top + GAP, left, width: Math.max(0, f.right - GAP - left), height: Math.max(0, f.bottom - BOTTOM - f.top - GAP) };
  }
  let placing = 0;
  function place() {
    if (placing) return;
    placing = requestAnimationFrame(() => {
      placing = 0;
      const b = box();
      const height = Math.min(b.height, panelTop(b) - GAP - b.top);
      html.classList.toggle("pagetabsAside", height < MIN_H);
      b.height = Math.max(height, 0);
      for (const s of openSets()) {
        const st = s.el.style;
        st.top = `${Math.round(b.top)}px`;
        st.left = `${Math.round(b.left)}px`;
        st.width = `${Math.round(b.width)}px`;
        st.maxHeight = `${Math.round(b.height)}px`;
      }
      sync();
    });
  }
  // .pagetabsOpen on <html> while a set shows, and the mini nav pill redrawn while minimized; the talk circle moves aside.
  function sync() {
    const open = openSets().length > 0 && !minimized() && !aside();
    const was = document.documentElement.classList.contains("pagetabsOpen");
    document.documentElement.classList.toggle("pagetabsOpen", open);
    if (minimized() && typeof window.renderMiniNavPill === "function") window.renderMiniNavPill();
    if (open !== was || open) window.TalkCircle?.place?.();
  }
  window.addEventListener("resize", place);
  window.addEventListener("scroll", place, { passive: true });
  NARROW.addEventListener?.("change", place);
  new MutationObserver(place).observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });

  function create(opts) {
    if (sets.has(opts.id)) return sets.get(opts.id);
    const id = opts.id;
    const list = el("div", { class: "pagetabs-list", role: "tablist", "aria-label": opts.label || "Sections" });
    const tri = '<svg viewBox="0 0 15 8" aria-hidden="true"><path d="M7.5 0L15 8H0z"/></svg>';
    const minimize = el("button", { type: "button", class: "pagetabs-min", title: "Minimize", "aria-label": "Minimize", html: `<span>${tri}</span>` });
    const close = el("button", { type: "button", class: "pagetabs-close", title: "Close", "aria-label": "Close",
      html: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>' });
    const bar = el("nav", { class: "pagetabs-bar" }, list, el("div", { class: "pagetabs-ctrls" }, minimize, close));
    const body = el("div", { class: "pagetabs-body" });
    const root = el("div", { class: "pagetabs mapoverlay", id, hidden: true }, bar, body);
    const tabs = new Map();
    for (const t of opts.tabs) {
      const button = el("button", { type: "button", role: "tab", id: `${id}-tab-${t.name}`, "aria-controls": `${id}-${t.name}`, "aria-selected": "false", "data-tab": t.name, text: t.label });
      const panel = el("section", { class: "pagetabs-panel", role: "tabpanel", id: `${id}-${t.name}`, "aria-labelledby": button.id, hidden: true });
      button.addEventListener("click", () => set.open(t.name));
      list.append(button);
      body.append(panel);
      tabs.set(t.name, { ...t, button, panel, filled: false });
    }
    // The arrow keys move through the tabs, as in a tablist.
    list.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const all = [...tabs.values()].filter((t) => !t.button.hidden);
      const i = all.findIndex((t) => t.name === set.selected);
      const next = all[(i + (e.key === "ArrowRight" ? 1 : all.length - 1)) % all.length];
      set.open(next.name);
      next.button.focus();
    });
    minimize.addEventListener("click", () => window.setMapOverlayHidden?.(true));
    close.addEventListener("click", () => set.close());
    document.body.append(root);

    function fill(t) {
      if (t.filled) return;
      t.filled = true;
      if (t.render) return t.render(t.panel);
      if (!t.readme) return;
      const md = el("div", { class: "pagetabs-readme", id: `${id}-${t.name}-md` });
      t.panel.append(md);
      if (typeof window.loadMarkdown === "function") window.loadMarkdown(t.readme, md.id, "_parent", 1);
      else fetch(t.readme).then((r) => (r.ok ? r.text() : Promise.reject(r.status))).then((text) => md.append(el("pre", { text }))).catch(() => { t.filled = false; });
    }
    const hashOf = () => (opts.hash && typeof window.getHash === "function" ? window.getHash()[opts.hash] || "" : "");
    const setHash = (value) => {
      if (!opts.hash || typeof window.goHashQuiet !== "function" || hashOf() === value) return;
      if (value) window.goHashQuiet({ [opts.hash]: value });
      else window.goHashQuiet({}, [opts.hash]);
    };

    const set = {
      el: root,
      id,
      selected: "",
      isOpen: () => !root.hidden,
      tab: (name) => tabs.get(name),
      // Opens the set on a tab (the one selected before, else the first), bringing back minimized sets.
      open(name) {
        const t = tabs.get(name) || tabs.get(set.selected) || tabs.values().next().value;
        const changed = t.name !== set.selected;
        set.selected = t.name;
        for (const o of tabs.values()) {
          o.button.setAttribute("aria-selected", String(o === t));
          o.button.tabIndex = o === t ? 0 : -1;
          o.panel.hidden = o !== t;
        }
        fill(t);
        const wasOpen = set.isOpen();
        root.hidden = false;
        root.dataset.shownAt = String(++shownAt);
        if (minimized()) window.setMapOverlayHidden?.(false);
        if (!wasOpen) closePanel();
        setHash(t.name);
        if (changed && wasOpen) t.panel.scrollTop = 0;
        if (changed || !wasOpen) opts.onChange?.(t.name, set);
        place();
        return set;
      },
      close() {
        if (!set.isOpen()) return set;
        root.hidden = true;
        setHash("");
        opts.onClose?.(set);
        place();
        // Minimized with nothing else of the page's to bring back, the pill goes too.
        if (minimized() && !document.querySelector(".mapoverlay:not([hidden]) [role=\"tablist\"]")) window.setMapOverlayHidden?.(false);
        return set;
      },
      toggle(name) { return set.isOpen() && !minimized() && (!name || name === set.selected) ? set.close() : set.open(name); },
      // A README into a tab's panel, in place of what it had.
      load(name, readme) {
        const t = tabs.get(name);
        if (!t) return set;
        t.readme = readme;
        t.render = null;
        t.filled = false;
        t.panel.replaceChildren();
        if (set.selected === name && set.isOpen()) fill(t);
        return set;
      },
    };
    sets.set(id, set);
    if (opts.hash) {
      const fromHash = () => {
        const name = hashOf();
        if (name && tabs.has(name)) { if (!set.isOpen() || set.selected !== name) set.open(name); }
        else if (!name && set.isOpen()) set.close();
      };
      if (typeof window.getHash === "function") document.addEventListener("hashChangeEvent", fromHash);
      else window.addEventListener("hashchange", fromHash);
      fromHash();
    }
    return set;
  }

  window.PageTabs = { create, get: (id) => sets.get(id), side, place, isOpen: () => openSets().length > 0 && !minimized() && !aside() };
})();
