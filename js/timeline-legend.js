// Location legend for the Data Commons timeline charts drawn by earthscape.js, shared by localsite/timeline/ and home/.
// Placements: On Right (floating legend), On Left (the side nav's list, via navigation.js) and Under Chart (#bottom-legend).
// Also the More Locations and Change Locations checkbox popups, the Locations/Continents views and the saved list.
// Load it at the end of the body, after the chart containers (#div1 holding #timelineChart, and #div2).
// Pages set window.timelineLegendDefaultPosition ("left", "right" or "below") before it loads, for visitors without a saved choice.
// Styles are in localsite/css/timeline-legend.css

// Adds the floating legend to #div1 on pages that don't include its markup, such as /home/
(function ensureFloatingLegendMarkup() {
    if (document.getElementById('floating-legend')) return;
    const holder = document.getElementById('div1');
    if (!holder) return;
    holder.insertAdjacentHTML('beforeend', `
        <div id="floating-legend" aria-hidden="false" style="display:none">
            <div id="floating-legend-drag-handle" aria-label="Drag legend" title="Drag legend"></div>
            <div id="floating-legend-header">
                <div id="legend-view-toggle">
                    <button id="view-locations-btn" class="view-toggle-btn active" title="Show flat list of locations">Locations</button>
                    <button id="view-continents-btn" class="view-toggle-btn" title="Group by continent">Continents</button>
                </div>
                <button id="floating-legend-close" title="Close">&times;</button>
            </div>
            <div id="legend-content"></div>
        </div>`);
})();

// Legend Position Handler
document.addEventListener('DOMContentLoaded', function() {
    const legendRadios = document.querySelectorAll('input[name="legendPosition"]');
    window._legendListDirty = false;
    
    // Load saved position from localStorage. Without one, the page's default is used (window.timelineLegendDefaultPosition,
    // "below" on /home/), and isn't saved as the visitor's choice.
    let storedPosition = null;
    try { storedPosition = localStorage.getItem('legendPosition'); } catch (e) { /* ignore */ }
    const validPositions = ['left', 'right', 'below'];
    const hasStored = validPositions.includes(storedPosition);
    const pageDefault = validPositions.includes(window.timelineLegendDefaultPosition) ? window.timelineLegendDefaultPosition : 'right';
    const savedPosition = hasStored ? storedPosition : pageDefault;
    window._cachedLegendPosition = savedPosition;
    if (savedPosition === 'below') window._floatingLegendManuallyClosed = true;
    const savedRadio = document.querySelector(`input[name="legendPosition"][value="${savedPosition}"]`);
    if (savedRadio) savedRadio.checked = true;
    updateLegendPosition(savedPosition);
    if (!hasStored) {
        try { localStorage.removeItem('legendPosition'); } catch (e) { /* ignore */ }
    }
    
    // Add change event listeners
    legendRadios.forEach(radio => {
        radio.addEventListener('change', function(e) {
            const position = e.target.value;
            updateLegendPosition(position);
            localStorage.setItem('legendPosition', position);
        });
    });
    // Initial legend build is triggered by chart creation flow (earthscape.js).

    if (typeof updateStateMenuVisibility === 'function') updateStateMenuVisibility(); // Timeline page only
});

function moveLegendToLeft(ev) {
    if (ev) { ev.preventDefault(); ev.stopPropagation(); }
    try {
        localStorage.setItem('legendPosition', 'left');
        window._cachedLegendPosition = 'left';
        window._timelineLegendAllowSidebar = true;
        window._floatingLegendManuallyClosed = false;
        updateOnLeftButtonsVisibility();
        updateOnRightButtonsVisibility();
        if (typeof window.showNavColumn === 'function') {
            window.showNavColumn();
        } else {
            updateLegendPosition('left');
        }
        const bottomLegend = document.getElementById('bottom-legend');
        if (bottomLegend) {
            bottomLegend.style.display = 'none';
            bottomLegend.setAttribute('aria-hidden', 'true');
        }
    } catch (e) {}
}

function moveLegendToRight(ev) {
    if (ev) { ev.preventDefault(); ev.stopPropagation(); }
    try {
        localStorage.setItem('legendPosition', 'right');
        window._cachedLegendPosition = 'right';
        window._timelineLegendAllowSidebar = false;
        window._floatingLegendManuallyClosed = false;
        updateOnLeftButtonsVisibility();
        updateOnRightButtonsVisibility();
        if (typeof window.hideNavColumn === 'function') {
            window.hideNavColumn();
        } else {
            updateLegendPosition('right');
        }
        const floatingLegend = document.getElementById('floating-legend');
        if (floatingLegend) {
            floatingLegend.style.position = 'fixed';
            floatingLegend.style.left = 'auto';
            floatingLegend.style.right = '20px';
            floatingLegend.style.top = '126px';
            floatingLegend.style.display = 'block';
            floatingLegend.style.opacity = '1';
            floatingLegend.setAttribute('aria-hidden', 'false');
            floatingLegend.classList.add('chart-visible');
        }
        const bottomLegend = document.getElementById('bottom-legend');
        if (bottomLegend) {
            bottomLegend.style.display = 'none';
            bottomLegend.setAttribute('aria-hidden', 'true');
        }
    } catch (e) {}
}

// Closes the floating legend and shows the location list under the chart, as its X does
function moveLegendUnderChart(ev) {
    if (ev) { ev.preventDefault(); ev.stopPropagation(); }
    if (window._timelineLegendAllowSidebar && typeof window.hideNavColumn === 'function') {
        try { window.hideNavColumn(); } catch (e) { /* ignore */ }
    }
    try {
        localStorage.setItem('legendPosition', 'below');
        window._cachedLegendPosition = 'below';
    } catch (e) { /* ignore */ }
    window._timelineLegendAllowSidebar = false;
    window._floatingLegendManuallyClosed = true;
    const floatingLegend = document.getElementById('floating-legend');
    if (floatingLegend) {
        floatingLegend.style.display = 'none';
        floatingLegend.setAttribute('aria-hidden', 'true');
        floatingLegend.classList.remove('chart-visible');
    }
    const bottomLegend = document.getElementById('bottom-legend');
    if (bottomLegend) {
        bottomLegend.style.display = 'flex';
        bottomLegend.setAttribute('aria-hidden', 'false');
    }
    updateOnLeftButtonsVisibility();
    updateOnRightButtonsVisibility();
}

// The left nav's X while it holds the locations list (navigation.js). The list goes to the page's default placement,
// or the floating legend when the default is the left, and the left nav gets its regular content back.
window.moveLegendOffLeftNav = function () {
    if (window.timelineLegendDefaultPosition === 'below') {
        moveLegendUnderChart();
    } else {
        moveLegendToRight();
    }
};

// Popup from the "More" button at the end of #bottom-legend: On Left, On Right, Under Chart
function openBottomLegendPlacementMenu(anchorBtn) {
    let menu = document.getElementById('bottom-legend-menu');
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'bottom-legend-menu';
        menu.className = 'bottom-legend-menu';
        menu.setAttribute('role', 'menu');
        menu.style.display = 'none';
        document.body.appendChild(menu);
    }
    if (menu.style.display === 'block' && menu._anchor === anchorBtn) {
        closeBottomLegendPlacementMenu();
        return;
    }
    let current = 'right';
    try { current = window._cachedLegendPosition || localStorage.getItem('legendPosition') || 'right'; } catch (e) { /* ignore */ }
    if (window._floatingLegendManuallyClosed) current = 'below';
    // Under the chart already, the third item adds locations, or changes them when every location is in the chart
    const allInChart = getAddableCountriesForMenu('').length === 0;
    const locationsMode = allInChart ? 'change' : 'more';
    const items = [
        { id: 'left', label: 'On Left', run: moveLegendToLeft },
        { id: 'right', label: 'On Right', run: moveLegendToRight },
        {
            id: 'below',
            label: current === 'below' ? (allInChart ? 'Change Locations' : 'More Locations') : 'Under Chart',
            run: (ev) => {
                if (current !== 'below') moveLegendUnderChart(ev);
                openBottomLegendLocationsPopup(locationsMode);
            }
        }
    ];
    menu.innerHTML = '';
    items.forEach((it) => {
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'bottom-legend-menu-item';
        // Under the chart, the third item is an action rather than the current placement
        const isCurrent = it.id === current && it.id !== 'below';
        row.setAttribute('role', 'menuitem');
        if (isCurrent) {
            row.classList.add('selected');
            row.setAttribute('aria-current', 'true');
        }
        row.textContent = it.label;
        row.addEventListener('click', (ev) => {
            ev.stopPropagation(); // Otherwise the document click would close the popup this opens
            closeBottomLegendPlacementMenu();
            if (!isCurrent) it.run(ev);
        });
        menu.appendChild(row);
    });
    menu._anchor = anchorBtn;
    anchorBtn.setAttribute('aria-expanded', 'true');
    // Below the button with right edges lined up, kept inside the window. Absolute, so it scrolls with the page.
    menu.style.display = 'block';
    positionBottomLegendPopup(menu, anchorBtn);
    const first = menu.querySelector('.selected') || menu.firstChild;
    if (first) first.focus();
    if (!window._bottomLegendMenuDocBound) {
        document.addEventListener('click', (ev) => {
            if (!ev.isTrusted) return; // Clicks the popups forward to legend rows aren't outside clicks
            const m = document.getElementById('bottom-legend-menu');
            if (m && m.style.display === 'block' && !m.contains(ev.target)) closeBottomLegendPlacementMenu();
            const pop = document.getElementById('bottom-legend-locations');
            if (pop && pop.style.display === 'block' && !pop.contains(ev.target) && ev.target.isConnected) pop.style.display = 'none';
        });
        document.addEventListener('keydown', (ev) => {
            if (ev.key !== 'Escape') return;
            closeBottomLegendPlacementMenu(true);
            const pop = document.getElementById('bottom-legend-locations');
            if (pop) pop.style.display = 'none';
        });
        window._bottomLegendMenuDocBound = true;
    }
}
// Places a body-level popup under its button with right edges lined up, or above it near the bottom of the window
function positionBottomLegendPopup(popup, anchorBtn) {
    popup.style.left = '0px';
    popup.style.top = '0px';
    const rect = anchorBtn.getBoundingClientRect();
    const mw = popup.offsetWidth;
    const mh = popup.offsetHeight;
    const left = Math.min(Math.max(6, rect.right - mw), window.innerWidth - mw - 6);
    let top = rect.bottom + 6;
    if (top + mh > window.innerHeight - 6) top = Math.max(6, rect.top - mh - 6);
    popup.style.left = (left + window.scrollX) + 'px';
    popup.style.top = (top + window.scrollY) + 'px';
}

// Checkbox list opened from the placement menu. mode "more" lists locations to add, as the floating legend's
// More Locations does. mode "change" lists every location, checked when it's in the chart, to remove or add back.
// It stays open while boxes are checked, and closes on a click outside it or Escape.
// The checklist icon at its upper right switches between the two lists.
function openBottomLegendLocationsPopup(mode) {
    let pop = document.getElementById('bottom-legend-locations');
    if (!pop) {
        pop = document.createElement('div');
        pop.id = 'bottom-legend-locations';
        pop.className = 'bottom-legend-menu';
        pop.setAttribute('role', 'dialog');
        pop.innerHTML = '<div class="bottom-legend-locations-head">' +
                '<span class="bottom-legend-locations-title"></span>' +
                '<button type="button" class="bottom-legend-locations-switch" aria-pressed="false">' +
                    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                    '<rect x="3" y="4" width="6" height="6" rx="1"/><path d="M4.5 7l1.2 1.2L8 5.8"/><rect x="3" y="14" width="6" height="6" rx="1"/>' +
                    '<line x1="13" y1="7" x2="21" y2="7"/><line x1="13" y1="17" x2="21" y2="17"/></svg>' +
                '</button>' +
            '</div>' +
            '<input type="text" class="legend-more-inline-input" placeholder="Search locations...">' +
            '<div class="floating-legend-menu-list"></div>';
        document.body.appendChild(pop);
        pop.querySelector('.bottom-legend-locations-switch').addEventListener('click', (ev) => {
            ev.stopPropagation();
            pop._mode = pop._mode === 'change' ? 'more' : 'change';
            pop._render();
        });
    }
    const title = pop.querySelector('.bottom-legend-locations-title');
    const switchBtn = pop.querySelector('.bottom-legend-locations-switch');
    const input = pop.querySelector('input');
    const list = pop.querySelector('.floating-legend-menu-list');
    pop._mode = mode;
    input.value = '';
    const render = () => {
        const change = pop._mode === 'change';
        title.textContent = change ? 'Change Locations' : 'More Locations';
        pop.setAttribute('aria-label', title.textContent);
        const switchLabel = change ? 'Show only locations to add' : 'Show all locations, checked when in the chart';
        switchBtn.title = switchLabel;
        switchBtn.setAttribute('aria-label', switchLabel);
        switchBtn.setAttribute('aria-pressed', String(change));
        if (change) {
            renderChangeLocationsList(list, input.value);
        } else {
            renderMoreLocationsMenuList(list, pop, input.value, { limit: 50, closeOnSelect: false, onSelect: render });
        }
    };
    pop._render = render;
    input.oninput = render;
    render();
    pop.style.display = 'block';
    // The list under the chart may have just been revealed, so wait a frame for its "More" button to be laid out
    requestAnimationFrame(() => {
        const anchor = document.querySelector('#bottom-legend .bottom-legend-place-btn');
        if (anchor) {
            anchor.scrollIntoView({ block: 'nearest' });
            positionBottomLegendPopup(pop, anchor);
        }
        input.focus();
    });
}

// Every location, checked when it shows in the chart. Unchecking hides it, as clicking it in the legend does.
function renderChangeLocationsList(list, query) {
    const q = (query || '').toLowerCase();
    const shown = new Set();
    document.querySelectorAll('#legend-content .legend-item').forEach((el) => {
        const label = (el.getAttribute('data-legend-label') || el.title || el.textContent || '').trim();
        if (label && !el.classList.contains('hidden')) shown.add(label);
    });
    const names = Object.keys(window._timelineCountryDataByName || {})
        .filter((n) => n && (!q || n.toLowerCase().indexOf(q) >= 0))
        .sort((a, b) => a.localeCompare(b));
    list.innerHTML = '';
    names.forEach((name) => {
        const row = document.createElement('label');
        row.className = 'bottom-legend-menu-item';
        row.style.cssText = 'display:flex; align-items:center; gap:8px; cursor:pointer; padding:8px 12px; border-radius:4px;';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = shown.has(name);
        cb.style.cssText = 'width:15px; height:15px; cursor:pointer; flex-shrink:0;';
        cb.addEventListener('change', (e) => {
            e.stopPropagation();
            if (cb.checked) {
                if (typeof window.addCountryToCharts === 'function') window.addCountryToCharts(name);
            } else {
                const item = document.querySelector(`#legend-content .legend-item[data-legend-label="${CSS.escape(name)}"]`);
                if (item && !item.classList.contains('hidden')) item.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                // Dim it in the list under the chart too, which isn't rebuilt by that click
                const bottomItem = document.querySelector(`#bottom-legend .bottom-legend-item[data-legend-label="${CSS.escape(name)}"]`);
                if (bottomItem) bottomItem.classList.add('hidden');
            }
        });
        row.appendChild(cb);
        const span = document.createElement('span');
        span.textContent = name;
        row.appendChild(span);
        list.appendChild(row);
    });
}

function closeBottomLegendPlacementMenu(refocus) {
    const menu = document.getElementById('bottom-legend-menu');
    if (!menu || menu.style.display !== 'block') return;
    menu.style.display = 'none';
    const anchor = menu._anchor;
    menu._anchor = null;
    if (anchor) {
        anchor.setAttribute('aria-expanded', 'false');
        if (refocus && anchor.isConnected) anchor.focus();
    }
}

function updateOnLeftButtonsVisibility() {
    const hideOnLeft = !!window._timelineLegendAllowSidebar;
    const leftButtons = document.querySelectorAll('.legend-on-left-btn');
    leftButtons.forEach((btn) => {
        btn.style.display = hideOnLeft ? 'none' : 'inline-flex';
    });
}
function updateOnRightButtonsVisibility() {
    let currentPosition = 'right';
    try { currentPosition = window._cachedLegendPosition || localStorage.getItem('legendPosition') || 'right'; } catch (e) { /* ignore */ }
    const showOnRight = currentPosition !== 'right' || !!window._floatingLegendManuallyClosed;
    const rightButtons = document.querySelectorAll('.legend-on-right-btn');
    rightButtons.forEach((btn) => {
        btn.style.display = showOnRight ? 'inline-flex' : 'none';
    });
}
function getAddableCountriesForMenu(query) {
    const q = (query || '').toLowerCase();
    const labelsInLegend = new Set();
    document.querySelectorAll('#legend-content .legend-item').forEach((el) => {
        const label = (el.getAttribute('data-legend-label') || el.title || el.textContent || '').trim();
        if (!label) return;
        const isHidden = el.classList.contains('hidden');
        // Only currently visible legend items should be excluded from More Locations.
        if (!isHidden) labelsInLegend.add(label);
    });
    const allMap = window._timelineCountryDataByName || {};
    return Object.keys(allMap).filter((n) => n && !labelsInLegend.has(n) && (!q || n.toLowerCase().indexOf(q) >= 0));
}
function renderMoreLocationsMenuList(list, panel, query, options) {
    if (!list) return;
    const opts = options || {};
    const limit = Number.isFinite(opts.limit) ? opts.limit : 40;
    const hoverBg = opts.hoverBg || null;
    const closeOnSelect = opts.closeOnSelect !== false;
    const closeTarget = opts.closeTarget || panel;
    const onSelect = opts.onSelect || null;
    list.innerHTML = '';
    const addable = getAddableCountriesForMenu(query).slice(0, limit);

    function doAdd(names) {
        try {
            if (typeof window.addCountryToCharts === 'function') {
                (Array.isArray(names) ? names : [names]).forEach(n => window.addCountryToCharts(n));
            }
        } catch (e) {}
        if (closeOnSelect && closeTarget) { try { closeTarget.style.display = 'none'; } catch (e) {} }
        if (onSelect) { try { onSelect(); } catch (e) {} }
    }

    if (addable.length > 0) {
        const allRow = document.createElement('label');
        allRow.className = 'bottom-legend-menu-item';
        allRow.style.cssText = 'display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:600; padding:8px 12px; border-radius:4px;';
        const allCb = document.createElement('input');
        allCb.type = 'checkbox';
        allCb.style.cssText = 'width:15px; height:15px; cursor:pointer; flex-shrink:0;';
        allCb.addEventListener('change', (e) => {
            e.stopPropagation();
            if (allCb.checked) doAdd(addable.slice());
        });
        if (hoverBg) {
            allRow.addEventListener('mouseenter', () => { allRow.style.background = hoverBg; });
            allRow.addEventListener('mouseleave', () => { allRow.style.background = ''; });
        }
        allRow.appendChild(allCb);
        const allSpan = document.createElement('span');
        allSpan.textContent = 'All';
        allRow.appendChild(allSpan);
        list.appendChild(allRow);
        const divider = document.createElement('div');
        divider.style.cssText = 'border-top: 1px solid rgba(0,0,0,0.14); margin: 4px 6px;';
        list.appendChild(divider);
    }

    addable.forEach((name) => {
        const row = document.createElement('label');
        row.className = 'bottom-legend-menu-item';
        row.style.cssText = 'display:flex; align-items:center; gap:8px; cursor:pointer; padding:8px 12px; border-radius:4px;';
        if (hoverBg) {
            row.addEventListener('mouseenter', () => { row.style.background = hoverBg; });
            row.addEventListener('mouseleave', () => { row.style.background = ''; });
        }
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.style.cssText = 'width:15px; height:15px; cursor:pointer; flex-shrink:0;';
        cb.addEventListener('change', (e) => {
            e.stopPropagation();
            if (cb.checked) doAdd(name);
        });
        row.appendChild(cb);
        const span = document.createElement('span');
        span.textContent = name;
        row.appendChild(span);
        list.appendChild(row);
    });
}
function openMoreLocationsPanel(anchorBtn, panel, listSelector, options) {
    if (!anchorBtn || !panel) return;
    try {
        const inp = panel.querySelector('input');
        const list = panel.querySelector(listSelector);
        if (inp && list) {
            renderMoreLocationsMenuList(list, panel, inp.value, options);
        }
        const rect = anchorBtn.getBoundingClientRect();
        panel.style.left = (rect.left + window.scrollX) + 'px';
        panel.style.top = (rect.bottom + window.scrollY + 6) + 'px';
        panel.style.display = 'block';
    } catch (e) { /* ignore */ }
}
function getLegendScopeAndCountry() {
    let scope = 'country';
    let country = 'US';
    try {
        const hash = (typeof getHash === 'function') ? getHash() : {};
        const rawScope = String(hash.scope || hash.geoview || '').toLowerCase();
        if (rawScope.indexOf('zip') >= 0) scope = 'zip';
        else if (rawScope.indexOf('county') >= 0) scope = 'county';
        else if (rawScope.indexOf('state') >= 0) scope = 'state';
        else scope = 'country';

        const candidates = [hash.country, hash.geo, hash.iso, hash.nation];
        for (let i = 0; i < candidates.length; i++) {
            const val = String(candidates[i] || '').trim();
            if (/^[A-Za-z]{2}$/.test(val)) { country = val.toUpperCase(); break; }
            const prefixed = val.match(/^([A-Za-z]{2})\d/);
            if (prefixed && prefixed[1]) { country = prefixed[1].toUpperCase(); break; }
        }
    } catch (e) { /* ignore */ }
    return { scope, country };
}
function getLegendCacheKey() {
    const info = getLegendScopeAndCountry();
    if (info.scope === 'country') return 'timelineLegendList_country';
    return `timelineLegendList_${info.country}_${info.scope}`;
}
function getActiveLegendLabelsFromCharts() {
    // Prefer authoritative legend DOM visibility when available.
    try {
        const domItems = Array.from(document.querySelectorAll('#legend-content .legend-item'));
        if (domItems.length > 0) {
            return domItems
                .filter((el) => !el.classList.contains('hidden'))
                .map((el) => (el.getAttribute('data-legend-label') || el.title || el.textContent || '').trim())
                .filter(Boolean);
        }
    } catch (e) { /* ignore */ }
    const labels = new Set();
    const charts = [];
    if (window.timelineChart) charts.push(window.timelineChart);
    if (window.lineAreaChart) charts.push(window.lineAreaChart);
    try { if (typeof timelineChart !== 'undefined' && timelineChart) charts.push(timelineChart); } catch (e) { /* ignore */ }
    try { if (typeof lineAreaChart !== 'undefined' && lineAreaChart) charts.push(lineAreaChart); } catch (e) { /* ignore */ }
    charts.forEach((chart) => {
        try {
            (chart.data?.datasets || []).forEach((ds, idx) => {
                if (!ds || !ds.label) return;
                const hidden = !!chart.getDatasetMeta(idx).hidden;
                if (!hidden) labels.add(ds.label);
            });
        } catch (e) { /* ignore */ }
    });
    return Array.from(labels);
}
function getDefaultLegendLabels() {
    try {
        return Array.isArray(window._timelineSelectedLabels) ? window._timelineSelectedLabels.slice() : [];
    } catch (e) { return []; }
}
function isLegendListChangedFromBaseline() {
    try {
        let currentLabels = [];
        const domItems = Array.from(document.querySelectorAll('#legend-content .legend-item'));
        if (domItems.length > 0) {
            currentLabels = domItems
                .filter((el) => !el.classList.contains('hidden'))
                .map((el) => (el.getAttribute('data-legend-label') || el.title || el.textContent || '').trim())
                .filter(Boolean);
        } else {
            currentLabels = getActiveLegendLabelsFromCharts();
        }
        const current = new Set(currentLabels.map((s) => String(s)));
        const key = getLegendCacheKey();
        let baselineLabels = null;
        try {
            const raw = localStorage.getItem(key);
            const parsed = raw ? JSON.parse(raw) : null;
            if (Array.isArray(parsed)) baselineLabels = parsed;
        } catch (e) { /* ignore */ }
        if (!Array.isArray(baselineLabels)) {
            baselineLabels = getDefaultLegendLabels();
        }
        const baseline = new Set((baselineLabels || []).map((s) => String(s)));
        if (baseline.size === 0) return current.size > 0;
        if (current.size !== baseline.size) return true;
        for (const label of current) {
            if (!baseline.has(label)) return true;
        }
        return false;
    } catch (e) { return false; }
}
function saveLegendListToCache() {
    try {
        const key = getLegendCacheKey();
        const labels = getActiveLegendLabelsFromCharts();
        localStorage.setItem(key, JSON.stringify(labels));
        window._legendSavedListAppliedKey = key;
        window._legendListJustSaved = true;
        window._legendListDirty = false;
        updateLegendCacheButtonsVisibility();
    } catch (e) { /* ignore */ }
}
function hasLegendListCache() {
    try {
        const key = getLegendCacheKey();
        const raw = localStorage.getItem(key);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length > 0;
    } catch (e) { return false; }
}
function isLegendCachePendingApply() {
    try {
        if (window._legendListDirty) return false;
        const key = getLegendCacheKey();
        const raw = localStorage.getItem(key);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) return false;
        const sameKeyApplied = window._legendSavedListAppliedKey === key;
        const cycle = Number(window._legendBuildCycle || 0);
        const cycleApplied = Number(window._legendSavedListAppliedCycle || -1);
        return !(sameKeyApplied && cycleApplied === cycle);
    } catch (e) { return false; }
}
function updateLegendCacheButtonsVisibility() {
    const showClear = hasLegendListCache();
    const showSave = !!window._legendListDirty && isLegendListChangedFromBaseline() && !window._legendListJustSaved;
    document.querySelectorAll('.legend-cache-clear-btn').forEach((btn) => {
        btn.style.display = showClear ? 'inline-flex' : 'none';
        btn.textContent = (showClear && showSave) ? 'Defaults' : 'Restore Defaults';
    });
    document.querySelectorAll('.legend-cache-save-btn').forEach((btn) => {
        btn.style.display = showSave ? 'inline-flex' : 'none';
        btn.textContent = (showSave && !showClear) ? 'Save Locations' : 'Save';
    });
}
function applySavedLegendListToCharts(charts) {
    try {
        // User made unsaved legend edits (toggle/add/remove): don't override with cached list.
        if (window._legendListDirty) return;
        const cacheKey = getLegendCacheKey();
        const raw = localStorage.getItem(cacheKey);
        const saved = raw ? JSON.parse(raw) : null;
        if (!Array.isArray(saved) || saved.length === 0) return;
        const savedSet = new Set(saved.map((s) => String(s)));

        // Re-add any saved labels missing from current datasets.
        const datasetLabels = new Set();
        charts.forEach((chartObj) => {
            try {
                (chartObj?.data?.datasets || []).forEach((ds) => {
                    if (ds && ds.label) datasetLabels.add(String(ds.label));
                });
            } catch (e) { /* ignore */ }
        });
        const missing = saved.filter((label) => !datasetLabels.has(String(label)));
        if (missing.length > 0 && typeof window.addCountryToCharts === 'function' && !window._applyingSavedLegendList) {
            const dataReady = window._timelineCountryDataByName && Object.keys(window._timelineCountryDataByName).length > 0;
            if (!dataReady && typeof waitForElm === 'function') {
                waitForElm('#legend-content').then(() => {
                    try {
                        if (typeof window.buildFloatingLegendFromChart === 'function') {
                            window.buildFloatingLegendFromChart();
                        }
                    } catch (e) { /* ignore */ }
                });
                return;
            }
            window._applyingSavedLegendList = true;
            try {
                missing.forEach((label) => {
                    try { window.addCountryToCharts(label); } catch (e) { /* ignore */ }
                });
            } finally {
                window._applyingSavedLegendList = false;
            }
            // Rebuild once after all missing series are added; avoids per-item flash.
            try {
                window._forceLegendRebuild = true;
                if (!window._legendRebuildQueuedAfterCacheApply) {
                    window._legendRebuildQueuedAfterCacheApply = true;
                    Promise.resolve().then(() => {
                        window._legendRebuildQueuedAfterCacheApply = false;
                        try {
                            if (typeof window.buildFloatingLegendFromChart === 'function') {
                                window.buildFloatingLegendFromChart();
                            }
                        } catch (e) { /* ignore */ }
                    });
                }
            } catch (e) { /* ignore */ }
        }

        // Apply hidden state from saved list.
        charts.forEach((chartObj) => {
            try {
                (chartObj?.data?.datasets || []).forEach((ds, idx) => {
                    if (!ds || !ds.label) return;
                    const meta = chartObj.getDatasetMeta(idx);
                    if (meta) meta.hidden = !savedSet.has(String(ds.label));
                });
                chartObj.update('none');
            } catch (e) { /* ignore */ }
        });
        window._legendSavedListAppliedKey = cacheKey;
        window._legendSavedListAppliedCycle = Number(window._legendBuildCycle || 0);
    } catch (e) { /* ignore */ }
}
function clearLegendListCache() {
    try {
        const key = getLegendCacheKey();
        localStorage.removeItem(key);
        window._legendSavedListAppliedKey = null;
        window._legendSavedListAppliedCycle = -1;
        window._legendListJustSaved = false;
        window._legendListDirty = false;
        window._legendCachePending = false;
        updateLegendCacheButtonsVisibility();
        const defaults = new Set(getDefaultLegendLabels().map((s) => String(s)));
        const charts = [];
        try { if (window.timelineChart) charts.push(window.timelineChart); } catch (e) { /* ignore */ }
        try { if (window.lineAreaChart) charts.push(window.lineAreaChart); } catch (e) { /* ignore */ }
        try { if (typeof timelineChart !== 'undefined' && timelineChart) charts.push(timelineChart); } catch (e) { /* ignore */ }
        try { if (typeof lineAreaChart !== 'undefined' && lineAreaChart) charts.push(lineAreaChart); } catch (e) { /* ignore */ }
        charts.forEach((chartObj) => {
            try {
                (chartObj?.data?.datasets || []).forEach((ds, idx) => {
                    if (!ds || !ds.label) return;
                    const meta = chartObj.getDatasetMeta(idx);
                    if (!meta) return;
                    if (defaults.size > 0) {
                        meta.hidden = !defaults.has(String(ds.label));
                    } else {
                        meta.hidden = false;
                    }
                });
                chartObj.update('none');
            } catch (e) { /* ignore */ }
        });
        window._forceLegendRebuild = true;
        if (typeof buildFloatingLegendFromChart === 'function') {
            buildFloatingLegendFromChart();
        }
        if (typeof refreshTimeline === 'function') {
            refreshTimeline();
        }
    } catch (e) { /* ignore */ }
}
window.updateOnLeftButtonsVisibility = updateOnLeftButtonsVisibility;
window.updateOnRightButtonsVisibility = updateOnRightButtonsVisibility;
window.updateLegendCacheButtonsVisibility = updateLegendCacheButtonsVisibility;

// Function to update legend position
function updateLegendPosition(position) {
    const validPositions = ['left', 'right', 'below'];
    const nextPosition = validPositions.includes(position) ? position : 'right';
    try {
        localStorage.setItem('legendPosition', nextPosition);
        window._cachedLegendPosition = nextPosition;
    } catch (e) {}
    const floatingLegend = document.getElementById('floating-legend');
    const bottomLegend = document.getElementById('bottom-legend');
    const overlayLegends = document.querySelectorAll('.overlay-legend');
    
    // Hide all legends first
    if (floatingLegend) {
        floatingLegend.style.display = 'none';
        floatingLegend.setAttribute('aria-hidden', 'true');
        floatingLegend.classList.remove('chart-visible');
    }
    if (bottomLegend) bottomLegend.style.display = 'none';
    overlayLegends.forEach(ol => ol.style.display = 'none');
    
    // Show selected legend position
    switch(nextPosition) {
        case 'left':
            // Left Nav - show floating legend on left
            if (floatingLegend) {
                window._timelineLegendAllowSidebar = true;
                if (typeof window.showNavColumn === 'function') {
                    window.showNavColumn();
                    floatingLegend.style.display = 'none';
                    floatingLegend.setAttribute('aria-hidden', 'true');
                } else {
                    floatingLegend.style.display = 'block';
                    floatingLegend.style.position = 'fixed';
                    floatingLegend.style.left = '20px';
                    floatingLegend.style.right = 'auto';
                    floatingLegend.style.top = '120px';
                }
            }
            break;
            
        case 'right':
            // Float Right - show floating legend on right (default)
            window._floatingLegendManuallyClosed = false;
            window._timelineLegendAllowSidebar = false;
            if (floatingLegend) {
                floatingLegend.style.display = 'block';
                floatingLegend.style.position = 'fixed';
                floatingLegend.style.right = '20px';
                floatingLegend.style.left = 'auto';
                floatingLegend.style.top = '126px';
            }
            break;
            
        case 'below':
            // Below - show bottom legend
            window._timelineLegendAllowSidebar = false;
            if (bottomLegend) {
                bottomLegend.style.display = 'flex';
            }
            break;
    }
    updateOnLeftButtonsVisibility();
    updateOnRightButtonsVisibility();
    console.log('Legend position changed to:', position);
}

// Continent to Countries mapping for grouping
const continentToCountriesMap = {
    "North America": [
        "United States", "United States of America", "Canada", "Mexico"
    ],
    "Central America": [
        "Guatemala", "Belize", "Honduras", "El Salvador", "Nicaragua", "Costa Rica", "Panama"
    ],
    "Caribbean": [
        "Cuba", "Jamaica", "Haiti", "Dominican Republic", "Puerto Rico", "Trinidad and Tobago",
        "Bahamas", "Barbados", "Saint Lucia", "Grenada", "Antigua and Barbuda", "Saint Kitts and Nevis",
        "Saint Vincent and the Grenadines", "Dominica"
    ],
    "South America": [
        "Brazil", "Argentina", "Colombia", "Peru", "Venezuela", "Chile", "Ecuador",
        "Bolivia", "Paraguay", "Uruguay", "Guyana", "Suriname", "French Guiana"
    ],
    "Europe": [
        "United Kingdom", "Germany", "France", "Italy", "Spain", "Poland", "Romania",
        "Netherlands", "Belgium", "Czech Republic", "Czechia", "Greece", "Portugal",
        "Sweden", "Hungary", "Austria", "Switzerland", "Bulgaria", "Denmark", "Finland",
        "Slovakia", "Norway", "Ireland", "Croatia", "Moldova", "Bosnia and Herzegovina",
        "Albania", "Lithuania", "North Macedonia", "Slovenia", "Latvia", "Estonia",
        "Montenegro", "Luxembourg", "Malta", "Iceland", "Andorra", "Monaco",
        "Liechtenstein", "San Marino", "Holy See", "Serbia", "Kosovo", "Belarus",
        "Ukraine", "Russia", "Russian Federation"
    ],
    "Asia": [
        "China", "India", "Indonesia", "Pakistan", "Bangladesh", "Japan", "Philippines",
        "Vietnam", "Viet Nam", "Turkey", "Iran", "Thailand", "Myanmar", "South Korea",
        "Korea, Republic of", "Iraq", "Afghanistan", "Saudi Arabia", "Uzbekistan",
        "Malaysia", "Yemen", "Nepal", "North Korea", "Korea, Democratic People's Republic of",
        "Sri Lanka", "Kazakhstan", "Syria", "Cambodia", "Jordan", "Azerbaijan",
        "United Arab Emirates", "Tajikistan", "Israel", "Laos", "Lao People's Democratic Republic",
        "Lebanon", "Kyrgyzstan", "Turkmenistan", "Singapore", "Oman", "State of Palestine",
        "Palestine", "Kuwait", "Georgia", "Mongolia", "Armenia", "Qatar", "Bahrain",
        "Timor-Leste", "Cyprus", "Bhutan", "Maldives", "Brunei", "Taiwan", "Hong Kong", "Macau"
    ],
    "Africa": [
        "Nigeria", "Ethiopia", "Egypt", "Democratic Republic of the Congo", "Tanzania",
        "South Africa", "Kenya", "Uganda", "Algeria", "Sudan", "Morocco", "Angola",
        "Mozambique", "Ghana", "Madagascar", "Cameroon", "Ivory Coast", "Côte d'Ivoire",
        "Niger", "Burkina Faso", "Mali", "Malawi", "Zambia", "Senegal", "Chad",
        "Somalia", "Zimbabwe", "Guinea", "Rwanda", "Benin", "Burundi", "Tunisia",
        "South Sudan", "Togo", "Sierra Leone", "Libya", "Congo", "Liberia",
        "Central African Republic", "Mauritania", "Eritrea", "Namibia", "Gambia",
        "Botswana", "Gabon", "Lesotho", "Guinea-Bissau", "Equatorial Guinea",
        "Mauritius", "Eswatini", "Djibouti", "Comoros", "Cabo Verde",
        "Sao Tome and Principe", "Seychelles"
    ],
    "Oceania": [
        "Australia", "Papua New Guinea", "New Zealand", "Fiji", "Solomon Islands",
        "Vanuatu", "Samoa", "Kiribati", "Micronesia", "Tonga", "Marshall Islands",
        "Palau", "Tuvalu", "Nauru"
    ]
};

// Build reverse lookup map for quick country -> continent lookup
const countryToContinentMap = {};
for (const [continent, countries] of Object.entries(continentToCountriesMap)) {
    for (const country of countries) {
        countryToContinentMap[country] = continent;
        countryToContinentMap[country.toLowerCase()] = continent; // Also add lowercase version
    }
}

// Get continent for a country name (with fuzzy matching)
function getContinentForCountry(countryName) {
    if (!countryName) return "Other";
    // Direct match
    if (countryToContinentMap[countryName]) return countryToContinentMap[countryName];
    // Try lowercase comparison
    const lower = countryName.toLowerCase();
    if (countryToContinentMap[lower]) return countryToContinentMap[lower];
    // Try partial match
    for (const [continent, countries] of Object.entries(continentToCountriesMap)) {
        for (const country of countries) {
            if (lower.includes(country.toLowerCase()) || country.toLowerCase().includes(lower)) {
                return continent;
            }
        }
    }
    return "Other";
}

// Continent display order
const continentOrder = ["North America", "Central America", "Caribbean", "South America", "Europe", "Asia", "Africa", "Oceania", "Other"];

// Floating legend helper for Chart.js timelineChart
function buildFloatingLegendFromChart() {
    window._legendBuildCycle = Number(window._legendBuildCycle || 0) + 1;
    const canvas = document.getElementById('timelineChart');
    if (!canvas || typeof Chart === 'undefined') return false;
    // Decide which chart(s) to build the legend for based on the chart-type toggle
    const selectedToggle = document.querySelector('input[name="toogleChartType"]:checked')?.value || 'div1';
    const timelineCanvas = document.getElementById('timelineChart');
    const lineAreaCanvas = document.getElementById('lineAreaChart');
    const timelineChartObj = (timelineCanvas && (Chart.getChart(timelineCanvas) || timelineCanvas.__chart__));
    const lineAreaChartObj = (lineAreaCanvas && (Chart.getChart(lineAreaCanvas) || lineAreaCanvas.__chart__));

    if (!timelineChartObj && !lineAreaChartObj) return false;

    // Turn off built-in legend on both charts if present
    [timelineChartObj, lineAreaChartObj].forEach((c) => {
        if (!c) return;
        try {
            if (!c.options) c.options = {};
            if (!c.options.plugins) c.options.plugins = {};
            c.options.plugins.legend = { display: false };
            try { c.update(); } catch (e) { /* ignore update errors */ }
        } catch (e) { console.warn('Could not set built-in legend display:', e); }
    });

    const legend = document.getElementById('floating-legend');
    if (!legend) return true;
    const legendContent = document.getElementById('legend-content');
    if (!legendContent) return true;
    legendContent.innerHTML = '';
    legendContent.style.maxHeight = ''; // The rebuilt More Locations panel starts closed (see fitFloatingLegendToMorePanel)
    // Hide legend content during rebuild to prevent flashing
    legendContent.style.visibility = 'hidden';
    function syncLegendContinentStateFromDom() {
        try {
            const state = {};
            let hasAny = false;
            let allOpen = true;
            document.querySelectorAll('#legend-content .region-section').forEach((section) => {
                const key = section.getAttribute('data-continent') || '';
                const panel = section.querySelector('.country-buttons-region');
                if (!key || !panel) return;
                const open = panel.style.display !== 'none';
                state[key] = open;
                hasAny = true;
                if (!open) allOpen = false;
            });
            window._legendContinentSectionState = state;
            if (hasAny) window._legendContinentAllOpen = allOpen;
        } catch (e) { /* ignore */ }
    }
    window.syncLegendContinentStateFromDom = syncLegendContinentStateFromDom;

    // Count datasets across available charts for diagnostics
    const timelineCount = (timelineChartObj && timelineChartObj.data && timelineChartObj.data.datasets) ? timelineChartObj.data.datasets.length : 0;
    const areaCount = (lineAreaChartObj && lineAreaChartObj.data && lineAreaChartObj.data.datasets) ? lineAreaChartObj.data.datasets.length : 0;
    const datasetCount = timelineCount + areaCount;
    // Determine selected chart count based on toggle
    const selectedCount = (selectedToggle === 'div2') ? areaCount : (selectedToggle === 'both' ? datasetCount : timelineCount);
    console.log('buildFloatingLegendFromChart: toggle=', selectedToggle, 'timeline=', timelineCount, 'area=', areaCount, 'selectedCount=', selectedCount);

    // Which-lines mode (controls which series are shown): showAll, showSelected, showTop5, showBottom5
    const whichLinesMode = document.querySelector('input[name="whichLines"]:checked')?.value || 'showTop5';

    // Helper to convert various color formats into an rgba(...) string with given alpha
    function colorToRgba(color, alpha) {
        alpha = (typeof alpha === 'number') ? alpha : 0.12;
        if (!color) return `rgba(0,0,0,${alpha})`;
        color = String(color).trim();
        // rgb(...) -> rgba(...)
        if (color.indexOf('rgb(') === 0) {
            return color.replace('rgb(', 'rgba(').replace(')', `,${alpha})`);
        }
        // rgba(...) -> override alpha
        if (color.indexOf('rgba(') === 0) {
            const parts = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)/);
            if (parts) return `rgba(${parts[1]}, ${parts[2]}, ${parts[3]}, ${alpha})`;
        }
        // hsl(...) or hsla(...) -> convert to rgba
        if (color.toLowerCase().indexOf('hsl(') === 0 || color.toLowerCase().indexOf('hsla(') === 0) {
            const parts = color.match(/hsla?\(\s*([0-9.+-]+)\s*,\s*([0-9.+-]+)%\s*,\s*([0-9.+-]+)%\s*(?:,\s*([0-9.+-]+)\s*)?\)/i);
            if (parts) {
                let h = parseFloat(parts[1]);
                let s = parseFloat(parts[2]) / 100;
                let l = parseFloat(parts[3]) / 100;
                // parse original alpha if present
                let originalA = (typeof parts[4] !== 'undefined') ? parseFloat(parts[4]) : null;
                // convert HSL to RGB
                function hslToRgb(h, s, l) {
                    h = ((h % 360) + 360) % 360 / 360; // normalize to [0,1]
                    let r, g, b;
                    if (s === 0) {
                        r = g = b = l; // achromatic
                    } else {
                        const hue2rgb = (p, q, t) => {
                            if (t < 0) t += 1;
                            if (t > 1) t -= 1;
                            if (t < 1/6) return p + (q - p) * 6 * t;
                            if (t < 1/2) return q;
                            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                            return p;
                        };
                        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                        const p = 2 * l - q;
                        r = hue2rgb(p, q, h + 1/3);
                        g = hue2rgb(p, q, h);
                        b = hue2rgb(p, q, h - 1/3);
                    }
                    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
                }
                const [r, g, b] = hslToRgb(h, s, l);
                // if original had an alpha and caller didn't pass an explicit alpha, use it
                const outA = (originalA !== null && typeof alpha === 'undefined') ? originalA : alpha;
                return `rgba(${r}, ${g}, ${b}, ${outA})`;
            }
        }
        // Hex formats #rrggbb or #rgb
        if (color[0] === '#') {
            let hex = color.slice(1);
            if (hex.length === 3) {
                hex = hex.split('').map(c => c + c).join('');
            }
            if (hex.length === 6) {
                const r = parseInt(hex.slice(0,2), 16);
                const g = parseInt(hex.slice(2,4), 16);
                const b = parseInt(hex.slice(4,6), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }
        }
        // Fallback: return the original color (may be a named color) with alpha applied via rgba(0,0,0,alpha) overlay
        return `rgba(0,0,0,${alpha})`;
    }

    // Apply selection visuals to a legend item
    function setItemSelectionStyle(item, color, visible) {
        const bg = visible ? colorToRgba(color, 0.12) : 'transparent';
        const border = visible ? color : 'transparent';
        item.style.background = bg;
        item.style.borderLeft = `4px solid ${border}`;
        item.classList.toggle('hidden', !visible);
    }

    // Highlight datasets for a given info object when hovering a legend item
    function highlightDatasets(info, highlight) {
        if (!info || !info.charts) return;
        info.charts.forEach(({chart, index}) => {
            try {
                if (!chart || typeof index !== 'number') return;
                // Prepare backup storage on the chart object
                chart._legendHighlightBackup = chart._legendHighlightBackup || {};
                const key = 'ds_' + index;
                if (highlight) {
                    // Backup original dataset props if not already backed up
                    if (!chart._legendHighlightBackup[key]) {
                        const ds = chart.data && chart.data.datasets && chart.data.datasets[index];
                        chart._legendHighlightBackup[key] = ds ? {
                            borderWidth: ds.borderWidth,
                            pointRadius: ds.pointRadius,
                            borderColor: ds.borderColor,
                            backgroundColor: ds.backgroundColor,
                            tension: ds.tension
                        } : null;
                    }
                    // Emphasize the dataset
                    const ds = chart.data && chart.data.datasets && chart.data.datasets[index];
                    if (ds) {
                        ds.borderWidth = (ds.borderWidth || 2) * 2.5;
                        ds.pointRadius = Math.max(2, (ds.pointRadius || 0) * 2);
                        // Make border/background fully opaque using colorToRgba
                        try { ds.borderColor = colorToRgba((Array.isArray(ds.borderColor) ? ds.borderColor[0] : ds.borderColor) || ds.backgroundColor || '#000', 1); } catch (e) {}
                        try { ds.backgroundColor = colorToRgba((Array.isArray(ds.backgroundColor) ? ds.backgroundColor[0] : ds.backgroundColor) || ds.borderColor || '#000', 0.18); } catch (e) {}
                    }
                } else {
                    // Restore original props
                    const backup = chart._legendHighlightBackup && chart._legendHighlightBackup[key];
                    const ds = chart.data && chart.data.datasets && chart.data.datasets[index];
                    if (backup && ds) {
                        ds.borderWidth = backup.borderWidth;
                        ds.pointRadius = backup.pointRadius;
                        ds.borderColor = backup.borderColor;
                        ds.backgroundColor = backup.backgroundColor;
                        ds.tension = backup.tension;
                        // Remove backup object
                        try { delete chart._legendHighlightBackup[key]; } catch (e) {}
                    }
                }
                // For performance, update chart without animation
                try { chart.update('none'); } catch (e) { try { chart.update(); } catch (ee) { /* ignore */ } }
            } catch (e) { /* ignore per-chart highlight errors */ }
        });
    }

    // Helper: get the latest numeric value for an info entry
    function getLatestValueForInfo(info) {
        // Sum latest numeric values across any chart datasets for this label
        let total = 0;
        let found = false;
        try {
            info.charts.forEach(({chart, index}) => {
                try {
                    const ds = chart.data && chart.data.datasets && chart.data.datasets[index];
                    if (!ds) return;
                    const data = ds.data || [];
                    // walk from end to find last numeric-ish value
                    for (let i = data.length - 1; i >= 0; i--) {
                        const v = data[i];
                        let num = null;
                        if (v == null) continue;
                        if (typeof v === 'number') num = v;
                        else if (typeof v === 'object') {
                            if (typeof v.y === 'number') num = v.y;
                            else if (typeof v.value === 'number') num = v.value;
                        } else if (!isNaN(Number(v))) {
                            num = Number(v);
                        }
                        if (typeof num === 'number' && !isNaN(num)) {
                            total += num;
                            found = true;
                            break; // only take latest for this dataset
                        }
                    }
                } catch (e) { /* ignore dataset errors */ }
            });
        } catch (e) { /* ignore */ }
        return found ? total : null;
    }

    // Format a number using suffixes: T (trillions), B (billions), M (millions), K (thousands)
    function formatSuffix(n) {
        if (n == null || isNaN(n)) return '';
        const abs = Math.abs(n);
        const sign = n < 0 ? '-' : '';
        if (abs >= 1e12) {
            const v = Math.round((abs / 1e12) * 10) / 10; // 1 decimal
            return sign + v + 'T';
        }
        if (abs >= 1e9) {
            const v = Math.round((abs / 1e9) * 10) / 10;
            return sign + v + 'B';
        }
        if (abs >= 1e6) {
            const v = Math.round((abs / 1e6) * 10) / 10;
            return sign + v + 'M';
        }
        if (abs >= 1e3) {
            const v = Math.round((abs / 1e3) * 10) / 10;
            return sign + v + 'K';
        }
        // For smaller numbers, show with commas (and up to 2 decimals)
        try {
            return sign + (Math.round(n * 100) / 100).toLocaleString();
        } catch (e) { return sign + String(n); }
    }

    // Unified legend: merge dataset labels across both charts so each country appears once
    const labelMap = new Map(); // label -> { color, charts: [{chart, index}] }
    const initiallySelectedLabels = new Set((window._timelineSelectedLabels || []).map((s) => String(s)));
    function collectFromChart(chartObj) {
        if (!chartObj || !chartObj.data || !chartObj.data.datasets) return;
        chartObj.data.datasets.forEach((ds, i) => {
            const label = ds.label || `Series ${i+1}`;
            const color = (Array.isArray(ds.borderColor) ? ds.borderColor[0] : ds.borderColor) || (Array.isArray(ds.backgroundColor) ? ds.backgroundColor[0] : ds.backgroundColor) || '#666';
            if (!labelMap.has(label)) labelMap.set(label, { color: color, charts: [] });
            labelMap.get(label).charts.push({ chart: chartObj, index: i });
        });
    }
    collectFromChart(timelineChartObj);
    collectFromChart(lineAreaChartObj);
    // Apply cached custom list for the current scope key on each rebuild.
    try { applySavedLegendListToCharts([timelineChartObj, lineAreaChartObj]); } catch (e) { /* ignore */ }
    const cachePendingApply = isLegendCachePendingApply();
    window._legendCachePending = cachePendingApply;
    try {
        if (cachePendingApply) legendContent.classList.add('legend-list-pending');
        else legendContent.classList.remove('legend-list-pending');
    } catch (e) { /* ignore */ }

    // Initialize legend view mode (default to flat 'locations' view)
    if (typeof window._legendViewMode === 'undefined') {
        window._legendViewMode = 'locations';
    }

    // Build unified legend items (authoritative in #legend-content)
    // Group countries by continent for 'continents' view (only meaningful for country scope)
    const currentScope = (typeof getHash === 'function') ? String(getHash().scope || 'country').toLowerCase() : 'country';
    const continentGroups = {};
    labelMap.forEach((info, label) => {
        const continent = (currentScope === 'country') ? getContinentForCountry(label) : 'Other';
        if (!continentGroups[continent]) continentGroups[continent] = [];
        continentGroups[continent].push({ label, info });
    });

    // Helper function to create a legend item
    function createLegendItem(label, info) {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.classList.add('hidden');
        item.title = label;
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'legend-checkbox';
        try { cb.style.accentColor = info.color; } catch (e) {}
        item.appendChild(cb);
        const lbl = document.createElement('span');
        lbl.className = 'legend-label';
        lbl.textContent = label;
        item.appendChild(lbl);

        // initialize selection visuals: visible if at least one chart has dataset visible
        const visible = info.charts.some(({chart, index}) => !chart.getDatasetMeta(index).hidden);
        // If not showing all series, omit items that are currently not visible
        const whichLinesModeLocal = document.querySelector('input[name="whichLines"]:checked')?.value || 'showTop5';
        if (whichLinesModeLocal !== 'showAll' && !visible) {
            return null; // don't add this legend item
        }
        const revealInitially = visible && !cachePendingApply;
        setItemSelectionStyle(item, info.color, revealInitially);
        try { cb.checked = revealInitially; } catch (e) {}

        // Toggle handler: toggles the dataset in all charts where it exists
        item.addEventListener('click', (ev) => {
            info.charts.forEach(({chart, index}) => {
                const meta = chart.getDatasetMeta(index);
                meta.hidden = !meta.hidden;
                try { chart.update(); } catch (e) {}
            });
            const nowVisible = info.charts.some(({chart, index}) => !chart.getDatasetMeta(index).hidden);
            setItemSelectionStyle(item, info.color, nowVisible);
            try { cb.checked = nowVisible; } catch (e) {}
            window._legendListJustSaved = false;
            window._legendListDirty = true;
            try { if (typeof updateLegendCacheButtonsVisibility === 'function') updateLegendCacheButtonsVisibility(); } catch (e) {}
        });
        cb.addEventListener('click', (ev) => { try { ev.stopPropagation(); } catch (e) {} try { item.dispatchEvent(new MouseEvent('click', { bubbles: true })); } catch (e) {} });

        // Hover handlers
        item.addEventListener('mouseenter', (ev) => {
            try { highlightDatasets(info, true); } catch (e) {}
            try { item.style.transform = 'translateY(-2px) scale(1.02)'; item.style.boxShadow = '0 12px 28px rgba(0,0,0,0.08)'; } catch (e) {}
        });
        item.addEventListener('mouseleave', (ev) => {
            try { highlightDatasets(info, false); } catch (e) {}
            try { item.style.transform = ''; item.style.boxShadow = ''; } catch (e) {}
        });

        item.setAttribute('data-legend-label', label);
        item.setAttribute('data-initial-selected', initiallySelectedLabels.has(label) ? '1' : '0');
        return item;
    }

    // Check view mode and build accordingly
    if (window._legendViewMode === 'continents') {
        // Build continent sections (grouped view)
        continentOrder.forEach((continent) => {
            const countries = continentGroups[continent];
            if (!countries || countries.length === 0) return;

            // Create continent section
            const section = document.createElement('div');
            section.className = 'region-section';
            section.setAttribute('data-continent', continent);

            // Create toggle button for continent. Colors are in the .region-section CSS, including dark mode.
            const toggle = document.createElement('button');
            toggle.className = 'region-toggle';

            const nameSpan = document.createElement('span');
            nameSpan.style.cssText = 'flex: 1; text-align: left;';
            nameSpan.textContent = `${continent} (${countries.length})`;

            const arrow = document.createElement('span');
            arrow.className = 'toggle-arrow';
            arrow.textContent = '▼';
            const remembered = window._legendContinentSectionState && typeof window._legendContinentSectionState[continent] === 'boolean'
                ? !!window._legendContinentSectionState[continent]
                : !!window._legendContinentAllOpen;
            arrow.style.cssText = `font-size: 10px; transition: transform 0.2s; transform: ${remembered ? 'rotate(0deg)' : 'rotate(-90deg)'};`;

            toggle.appendChild(nameSpan);
            toggle.appendChild(arrow);

            // Create country list container
            const countryList = document.createElement('div');
            countryList.className = 'country-buttons-region';
            countryList.style.display = remembered ? 'block' : 'none';
            section.classList.toggle('collapsed', !remembered);

            // Add country items to the list
            countries.forEach(({ label, info }) => {
                const item = createLegendItem(label, info);
                if (item) {
                    item.style.cssText += 'margin: 2px 0; padding: 4px 8px; font-size: 11px;';
                    countryList.appendChild(item);
                }
            });

            // Toggle handler for continent section
            toggle.addEventListener('click', () => {
                const isHidden = countryList.style.display === 'none';
                countryList.style.display = isHidden ? 'block' : 'none';
                arrow.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(-90deg)';
                section.classList.toggle('collapsed', !isHidden);
                syncLegendContinentStateFromDom();
            });

            section.appendChild(toggle);
            section.appendChild(countryList);

            // Only append if there are visible items in this section
            if (countryList.children.length > 0) {
                legendContent.appendChild(section);
            }
        });
    } else {
        // Build flat list of locations (default view - no continent grouping)
        const flatContainer = document.createElement('div');
        flatContainer.className = 'locations-flat-list';
        flatContainer.style.cssText = 'display: flex; flex-direction: column; gap: 2px;';

        // Collect all items and sort alphabetically
        const allItems = [];
        labelMap.forEach((info, label) => {
            allItems.push({ label, info });
        });
        allItems.sort((a, b) => a.label.localeCompare(b.label));

        allItems.forEach(({ label, info }) => {
            const item = createLegendItem(label, info);
            if (item) {
                item.style.cssText += 'margin: 2px 0; padding: 4px 8px; font-size: 13px;';
                flatContainer.appendChild(item);
            }
        });

        if (flatContainer.children.length > 0) {
            legendContent.appendChild(flatContainer);
        }
    }

    // Add "More Locations" button after continent sections
    try {
        const legendContent = document.getElementById('legend-content');
        if (legendContent) {
            // Remove existing action/cache rows before rebuilding them
            legendContent.querySelectorAll('.legend-actions-row').forEach((row) => row.remove());
            legendContent.querySelectorAll('.legend-cache-row').forEach((row) => row.remove());
            
            // Get list of countries already displayed
            const existingLabels = new Set(
                Array.from(labelMap.keys())
            );
            
            // Only show "More Locations" actions if there are countries to add
            if (getAddableCountriesForMenu('').length > 0) {
                const moreBtn = document.createElement('div');
                moreBtn.className = 'legend-more-btn';
                moreBtn.style.cssText = `
                    margin-top: 8px;
                    padding: 8px 12px;
                    background: #0066ff;
                    color: white;
                    border-radius: 6px;
                    text-align: center;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 12px;
                    pointer-events: auto;
                `;
                moreBtn.textContent = `More Locations`;
                moreBtn.setAttribute('role', 'button');
                moreBtn.tabIndex = 0;

                const onLeftBtn = document.createElement('div');
                onLeftBtn.className = 'legend-more-btn legend-on-left-btn';
                onLeftBtn.id = 'floating-legend-on-left-btn';
                onLeftBtn.textContent = 'On Left';
                onLeftBtn.setAttribute('role', 'button');
                onLeftBtn.tabIndex = 0;
                onLeftBtn.style.cssText = moreBtn.style.cssText + '; background: #5f6f84;';
                
                const inlinePanel = document.createElement('div');
                inlinePanel.id = 'floating-legend-more-inline';
                inlinePanel.className = 'legend-more-inline-panel';
                inlinePanel.style.display = 'none';
                const inlineInput = document.createElement('input');
                inlineInput.type = 'text';
                inlineInput.placeholder = 'Search locations...';
                inlineInput.className = 'legend-more-inline-input';
                inlinePanel.appendChild(inlineInput);
                const inlineList = document.createElement('div');
                inlineList.className = 'floating-legend-menu-list';
                inlinePanel.appendChild(inlineList);
                const renderInlinePanel = () => {
                    renderMoreLocationsMenuList(inlineList, inlinePanel, inlineInput.value, {
                        limit: 50,
                        hoverBg: 'rgba(0,102,255,0.1)',
                        closeOnSelect: false,
                        onSelect: () => renderInlinePanel()
                    });
                };
                inlineInput.addEventListener('input', () => {
                    window._legendMorePanelQuery = inlineInput.value; // Kept when the legend rebuilds
                    renderInlinePanel();
                });
                // While the More Locations panel is open, the legend grows taller to show its checkbox list,
                // ending 12px above the bottom of the browser window. It scrolls inside when that isn't enough room.
                window.fitFloatingLegendToMorePanel = () => {
                    const content = document.getElementById('legend-content');
                    const panel = document.getElementById('floating-legend-more-inline');
                    const legend = document.getElementById('floating-legend');
                    if (!content || !legend) return;
                    if (!panel || panel.style.display === 'none') {
                        content.style.maxHeight = '';
                        return;
                    }
                    const contentRect = content.getBoundingClientRect();
                    const belowContent = legend.getBoundingClientRect().bottom - contentRect.bottom; // Legend border and padding under the list
                    const room = Math.floor(window.innerHeight - 12 - belowContent - contentRect.top);
                    content.style.maxHeight = Math.max(200, room) + 'px';
                    // Scroll the list so the panel shows, keeping its top in view
                    const panelRect = panel.getBoundingClientRect();
                    const fitRect = content.getBoundingClientRect();
                    if (panelRect.bottom > fitRect.bottom) {
                        content.scrollTop += Math.min(panelRect.bottom - fitRect.bottom, panelRect.top - fitRect.top);
                    }
                };
                if (!window._legendMorePanelResizeBound) {
                    window.addEventListener('resize', () => window.fitFloatingLegendToMorePanel());
                    window._legendMorePanelResizeBound = true;
                }
                const toggleInlinePanel = () => {
                    const nextVisible = inlinePanel.style.display === 'none';
                    inlinePanel.style.display = nextVisible ? 'block' : 'none';
                    // Remembered so the panel stays open when a checked location rebuilds the legend
                    window._legendMorePanelOpen = nextVisible;
                    if (nextVisible) renderInlinePanel();
                    window.fitFloatingLegendToMorePanel();
                };
                moreBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleInlinePanel();
                });
                moreBtn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleInlinePanel();
                    }
                });
                
                moreBtn.addEventListener('mouseenter', () => {
                    moreBtn.style.background = '#0052cc';
                    moreBtn.style.transform = 'translateY(-1px)';
                });
                
                moreBtn.addEventListener('mouseleave', () => {
                    moreBtn.style.background = '#0066ff';
                    moreBtn.style.transform = 'none';
                });

                onLeftBtn.addEventListener('mouseenter', () => {
                    onLeftBtn.style.background = '#516175';
                    onLeftBtn.style.transform = 'translateY(-1px)';
                });

                onLeftBtn.addEventListener('mouseleave', () => {
                    onLeftBtn.style.background = '#5f6f84';
                    onLeftBtn.style.transform = 'none';
                });

                onLeftBtn.addEventListener('click', moveLegendToLeft);
                onLeftBtn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        moveLegendToLeft(e);
                    }
                });

                const actionsRow = document.createElement('div');
                actionsRow.className = 'legend-actions-row';
                actionsRow.style.cssText = 'display:flex; gap:8px; margin-top:8px; align-items:center;';
                moreBtn.style.marginTop = '0';
                onLeftBtn.style.marginTop = '0';
                actionsRow.appendChild(moreBtn);
                actionsRow.appendChild(onLeftBtn);
                legendContent.appendChild(actionsRow);
                legendContent.appendChild(inlinePanel);
                updateOnLeftButtonsVisibility();
                // Checking a location adds it to the charts, which rebuilds this legend. Reopen the panel it was in.
                if (window._legendMorePanelOpen) {
                    inlineInput.value = window._legendMorePanelQuery || '';
                    inlinePanel.style.display = 'block';
                    renderInlinePanel();
                    requestAnimationFrame(() => window.fitFloatingLegendToMorePanel()); // After the rows below it are added
                }
            }
            const cacheRow = document.createElement('div');
            cacheRow.className = 'legend-cache-row';
            const saveBtn = document.createElement('div');
            saveBtn.className = 'legend-cache-btn legend-cache-save-btn';
            saveBtn.textContent = 'Save';
            saveBtn.setAttribute('role', 'button');
            saveBtn.tabIndex = 0;
            saveBtn.addEventListener('click', saveLegendListToCache);
            saveBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); saveLegendListToCache(); } });

            const clearBtn = document.createElement('div');
            clearBtn.className = 'legend-cache-btn legend-cache-clear-btn';
            clearBtn.textContent = 'Restore Defaults';
            clearBtn.setAttribute('role', 'button');
            clearBtn.tabIndex = 0;
            clearBtn.addEventListener('click', clearLegendListCache);
            clearBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clearLegendListCache(); } });
            cacheRow.appendChild(saveBtn);
            cacheRow.appendChild(clearBtn);
            legendContent.appendChild(cacheRow);
            updateLegendCacheButtonsVisibility();
        }
    } catch (e) {
        console.error('Error adding More Locations to floating legend:', e);
    }

        // Populate value spans inside the floating legend authoritative items (#legend-content)
        try {
            Array.from(legendContent.children).forEach((child) => {
                try {
                    // Only location rows. Continent sections, the flat list and the button rows don't get an empty value span.
                    if (!child.classList.contains('legend-item')) return;
                    const label = child.getAttribute('data-legend-label') || child.title || child.textContent.trim();
                    const info = labelMap.get(label);
                    const latest = info ? getLatestValueForInfo(info) : null;
                    let vs = child.querySelector('.legend-value');
                    if (!vs) {
                        vs = document.createElement('span');
                        vs.className = 'legend-value';
                        vs.style.marginLeft = '8px';
                        vs.style.fontSize = '12px';
                        vs.style.opacity = '0.9';
                        child.appendChild(vs);
                    }
                    vs.textContent = latest != null ? formatSuffix(latest) : '';
                    if (latest != null) vs.setAttribute('title', String(latest));
                } catch (e) { /* ignore per-item */ }
            });
        } catch (e) { /* ignore */ }

    // Reveal legend content after all items are created and filtered
    setTimeout(() => {
        if (legendContent) legendContent.style.visibility = 'visible';
    }, 0);

    // Populate per-chart overlay legends by cloning authoritative items
    // Map of scope keys to human-readable overlay title
    const SCOPE_TITLES = {
        country: 'Countries',
        state: 'States',
        county: 'Counties'
    };

    function getScopeKeyFromHash() {
        try {
            const h = window.location.hash ? new URLSearchParams(window.location.hash.substring(1)) : null;
            if (h) {
                const geoview = (h.get('scope') || '').toLowerCase();
                if (geoview === 'countries' || geoview === 'country' || geoview === 'earth') return 'country';
                if (geoview === 'states' || geoview === 'state') return 'state';
                if (geoview === 'counties' || geoview === 'county') return 'county';
                if (h.get('state')) return 'state';
                // If geo param looks like a list of county FIPS (many commas) assume county
                const geo = h.get('geo') || h.get('geoIds') || h.get('geo_id');
                if (geo && geo.indexOf(',') >= 0) {
                    // If tokens look like county FIPS (USxxxxx) or many numeric codes, treat as county
                    const tokens = geo.split(',').map(s => s.trim()).filter(Boolean);
                    const numericCount = tokens.filter(t => /^\d+$/.test(t)).length;
                    const usFipsLike = tokens.filter(t => /^US\d{2,}/i.test(t)).length;
                    if (tokens.length > 2 && (numericCount > 2 || usFipsLike > 0)) return 'county';
                }
            }
        } catch (e) { /* ignore */ }
        // Fallback: check visible controls such as #entityId
        try {
            const select = document.getElementById('entityId');
            if (select && select.value) {
                const val = String(select.value).trim();
                // Common localsite convention: geoId/NN -> state
                if (val.indexOf('geoId/') === 0 || /^geoId:\/\//i.test(val)) return 'state';
                // Two-letter uppercase values likely indicate country codes (e.g. US, GB)
                if (/^[A-Za-z]{2}$/.test(val)) return 'country';
                // If value contains 'country' keyword, treat as country
                if (val.toLowerCase().indexOf('country') >= 0) return 'country';
            }
        } catch (e) { /* ignore */ }
        return 'country';
    }

    function getOverlayTitleText() {
        const key = getScopeKeyFromHash();
        return SCOPE_TITLES[key] || '';
    }

    // Build legend depending on toggle state
    const toggle = selectedToggle || 'div1';

    // Short-circuit if legend already matches the current toggle and counts
    if (!window._lastLegendState) window._lastLegendState = {};
    const last = window._lastLegendState;
    // If toggle and selectedCount match previous and legend already has expected children, skip rebuild
    if (!window._forceLegendRebuild && last.toggle === toggle && last.selectedCount === selectedCount && last.whichLines === whichLinesMode && legendContent.children.length === last.itemsCount) {
        console.log('buildFloatingLegendFromChart: no change detected, skipping rebuild');
        // Ensure visibility still correct
        let preferredPosition = 'right';
        try { preferredPosition = window._cachedLegendPosition || localStorage.getItem('legendPosition') || 'right'; } catch (e) { /* ignore */ }
        const suppressFloating = !!window._floatingLegendManuallyClosed || !!window._timelineLegendAllowSidebar || preferredPosition === 'left' || preferredPosition === 'below';
        const shouldShow = selectedCount > 0 && legendContent.children.length > 0 && !suppressFloating;
        legend.style.display = shouldShow ? 'block' : 'none';
        legend.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
        if (!shouldShow) legend.classList.remove('chart-visible');
        // Refresh selection visuals on existing legend items in case dataset visibility changed
        try {
            Array.from(legendContent.children).forEach((child) => {
                const label = (child.title && child.title.trim()) || (child.textContent && child.textContent.trim());
                if (!label) return;
                const info = labelMap.get(label);
                if (info) {
                    const visible = info.charts.some(({chart, index}) => !chart.getDatasetMeta(index).hidden);
                    setItemSelectionStyle(child, info.color, visible);
                }
            });
        } catch (e) { /* ignore */ }
        return true;
    }
    window._forceLegendRebuild = false;
    // Unified legend already built above (labelMap). Record last state for future short-circuiting.
    last.toggle = toggle;
    last.selectedCount = selectedCount;
    last.whichLines = whichLinesMode;
    last.itemsCount = legendContent.children.length;

    // Default legend mode: 'fixed' (viewport corner). Previously sticky-in-chart is disabled by default.
    if (typeof window._timelineLegendMode === 'undefined') window._timelineLegendMode = 'fixed';

    // Show legend if we built any items
    const visible = datasetCount > 0 && legendContent.children.length > 0;
    // Ensure legend is appended to body (fixed viewport legend)
    try {
        if (legend.parentElement !== document.body) document.body.appendChild(legend);
    } catch (e) { /* ignore */ }

    if (visible) {
        let preferredPosition = 'right';
        try { preferredPosition = window._cachedLegendPosition || localStorage.getItem('legendPosition') || 'right'; } catch (e) { /* ignore */ }
        const suppressFloating = !!window._floatingLegendManuallyClosed || !!window._timelineLegendAllowSidebar || preferredPosition === 'left' || preferredPosition === 'below';
        if (suppressFloating) {
            legend.style.display = 'none';
            legend.setAttribute('aria-hidden', 'true');
            legend.classList.remove('chart-visible');
        } else {
            legend.style.display = 'block';
            legend.setAttribute('aria-hidden', 'false');
            // Add chart-visible class so CSS rules can show legend when nav is closed
            legend.classList.add('chart-visible');
            try { clearOverlayClosed('floating'); } catch (e) {}
                    // Place the legend at a fixed viewport location so it stays put even when canvases resize/update.
                    // Small screens still get the legend inside the content area for better UX.
                    try {
                        // fixed viewport placement
                        if (window.innerWidth <= 700) {
                            legend.style.position = 'fixed';
                            legend.style.left = '12px';
                            legend.style.top = '12px';
                            legend.style.right = 'auto';
                        } else {
                            legend.style.position = 'fixed';
                            legend.style.top = '126px';
                            legend.style.right = '20px';
                            legend.style.left = 'auto';
                        }
                        legend.style.zIndex = 999;
                    } catch (e) { console.warn('Could not set legend position:', e); }
        }
    } else {
        legend.style.display = 'none';
        legend.setAttribute('aria-hidden', 'true');
    }
    console.log('buildFloatingLegendFromChart: legend visible=', !!visible, 'datasetCount=', datasetCount, 'items=', legendContent.children.length);
    // After building the legend and overlay clones, let the page decide visibility
    try {
        if (window.updateOverlayLegendVisibility) window.updateOverlayLegendVisibility();
    } catch (e) { /* ignore */ }
    // Ensure bottom legend visibility is recalculated after legend visibility changed
    try { if (typeof updateBottomLegendVisibility === 'function') updateBottomLegendVisibility(); } catch (e) {}
    // Ensure titles are up-to-date after rebuild
    try { if (typeof updateOverlayTitles === 'function') updateOverlayTitles(); } catch (e) { /* ignore */ }
    // Ensure close buttons exist on overlays and floating legend (creates X if missing)
    try { if (typeof ensureCloseButtons === 'function') ensureCloseButtons(); } catch (e) { /* ignore */ }
    // --- Bottom horizontal legend: clone authoritative items into a scrollable inline row under charts ---
    try {
        // Ensure container exists once
        let bottom = document.getElementById('bottom-legend');
        if (!bottom) {
            bottom = document.createElement('div');
            bottom.id = 'bottom-legend';
            bottom.className = 'bottom-legend';
            // hidden by default; page decides visibility
            bottom.style.display = 'none';
            const insertAfter = document.getElementById('div2') || document.getElementById('div1');
            if (insertAfter && insertAfter.parentElement) insertAfter.parentElement.insertBefore(bottom, insertAfter.nextSibling);
            else document.body.appendChild(bottom);
        }
        // Clear and repopulate with collapse/expand behavior when many items
        bottom.innerHTML = '';
        const authItems = Array.from(document.querySelectorAll('#legend-content .legend-item'));
        const maxVisible = 12;
        const created = [];
        authItems.forEach((auth, idx) => {
            const label = auth.getAttribute('data-legend-label') || auth.title || auth.textContent.trim();
            if (!label) return;
            const item = document.createElement('div');
            item.className = 'bottom-legend-item';
            if (idx >= maxVisible) item.classList.add('extra');
            item.setAttribute('data-legend-label', label);
            item.title = label;
            const sw = document.createElement('span'); sw.className = 'legend-swatch';
            let color = null;
            const authSw = auth.querySelector('.legend-swatch');
            if (authSw) color = authSw.style.backgroundColor || authSw.style.background || authSw.getAttribute('data-color') || null;
            try { if (!color && labelMap && labelMap.has(label)) color = labelMap.get(label).color; } catch (e) {}
            if (color) sw.style.background = color;
            item.appendChild(sw);
            const txt = document.createElement('span'); txt.className = 'legend-label'; txt.textContent = label; item.appendChild(txt);
            // Do not add a numeric value in the bottom legend; values are shown only in the floating legend
            // mirror selection
            try { const info = labelMap.get(label); const visible = info ? info.charts.some(({chart, index}) => !chart.getDatasetMeta(index).hidden) : true; if (!visible) item.classList.add('hidden'); } catch (e) {}
            item.addEventListener('click', (ev) => {
                const auth = document.querySelector(`#legend-content .legend-item[data-legend-label="${CSS.escape(label)}"]`);
                if (auth) {
                    auth.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                    setTimeout(() => {
                        try { const info = labelMap.get(label); const nowVisible = info ? info.charts.some(({chart, index}) => !chart.getDatasetMeta(index).hidden) : true; item.classList.toggle('hidden', !nowVisible); } catch (e) {}
                    }, 40);
                }
            });
            // Forward hover events to the authoritative legend item so highlighting also works from bottom legend
            item.addEventListener('mouseenter', (ev) => {
                const auth = document.querySelector(`#legend-content .legend-item[data-legend-label="${CSS.escape(label)}"]`);
                if (auth) try { auth.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true })); } catch (e) {}
            });
            item.addEventListener('mouseleave', (ev) => {
                const auth = document.querySelector(`#legend-content .legend-item[data-legend-label="${CSS.escape(label)}"]`);
                if (auth) try { auth.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true })); } catch (e) {}
            });
            created.push(item);
        });
        // Append visible items, then if extras exist add a "more" control
        created.forEach((el, i) => {
            if (i < maxVisible) bottom.appendChild(el);
        });
        // "More" at the right end of the list opens the legend placement menu. It's a three-dot icon when every location is showing.
        const placeBtn = document.createElement('button');
        placeBtn.type = 'button';
        placeBtn.className = 'bottom-legend-place-btn';
        placeBtn.title = 'Legend placement';
        placeBtn.setAttribute('aria-label', 'Legend placement');
        placeBtn.setAttribute('aria-haspopup', 'menu');
        placeBtn.setAttribute('aria-expanded', 'false');
        const updatePlaceBtn = () => {
            const allShown = !bottom.classList.contains('bottom-legend-collapsed');
            placeBtn.classList.toggle('is-icon', allShown);
            placeBtn.innerHTML = allShown
                ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>'
                : 'More';
        };
        placeBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            openBottomLegendPlacementMenu(placeBtn);
        });

        if (created.length > maxVisible) {
            // Create a container state class to control extra visibility
            bottom.classList.add('bottom-legend-collapsed');
            // Append the extra items hidden initially
            for (let i = maxVisible; i < created.length; i++) bottom.appendChild(created[i]);
            const more = document.createElement('div');
            more.className = 'bottom-legend-more';
            const extraCount = created.length - maxVisible;
            const moreLabel = document.createElement('span');
            moreLabel.className = 'more-label';
            moreLabel.textContent = `... +${extraCount} more`;
            more.appendChild(moreLabel);
            more.setAttribute('role','button');
            more.setAttribute('aria-expanded','false');
            // Make keyboard-focusable
            more.tabIndex = 0;
            // Click handler toggles collapsed state
            more.addEventListener('click', (e) => {
                e.stopPropagation();
                bottom.classList.toggle('bottom-legend-collapsed');
                // When class present we consider collapsed; toggle text accordingly
                if (bottom.classList.contains('bottom-legend-collapsed')) {
                    moreLabel.textContent = `... +${extraCount} more`;
                    more.setAttribute('aria-expanded','false');
                } else {
                    moreLabel.textContent = 'Show less';
                    more.setAttribute('aria-expanded','true');
                }
                updatePlaceBtn();
            });
            // Keyboard handler for Enter / Space
            more.addEventListener('keydown', (ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    more.click();
                }
            });
            bottom.appendChild(more);
        } else {
            bottom.classList.remove('bottom-legend-collapsed');
            created.forEach(el => bottom.appendChild(el));
        }
        updatePlaceBtn();
        bottom.appendChild(placeBtn);
        // Defer visibility decision to updateBottomLegendVisibility (driven by user X clicks)
        try { if (typeof updateBottomLegendVisibility === 'function') updateBottomLegendVisibility(); } catch (e) {}
    } catch (e) { /* ignore bottom-legend errors */ }
    return true;
}

// Legend build is primarily triggered by chart creation flow (earthscape.js).
document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('resize', () => setTimeout(buildFloatingLegendFromChart, 300));
    // Install visibility observer so legend only appears when chart area is visible in viewport
    try {
        if (!window._timelineLegendVisibilityObserver) {
            const legend = document.getElementById('floating-legend');
            const chartContainers = [];
            const d1 = document.getElementById('div1');
            const d2 = document.getElementById('div2');
            if (d1) chartContainers.push(d1);
            if (d2) chartContainers.push(d2);
            // If no containers found, fallback to observing the whole page (show legend normally)
            if (chartContainers.length > 0 && legend) {
                // Initially check if chart is visible and add class
                const checkInitialVisibility = () => {
                    const hasItems = document.getElementById('legend-content')?.children?.length > 0;
                    let preferredPosition = 'right';
                    try { preferredPosition = window._cachedLegendPosition || localStorage.getItem('legendPosition') || 'right'; } catch (e) { /* ignore */ }
                    const allowFloating = preferredPosition === 'right' && !window._timelineLegendAllowSidebar && !window._floatingLegendManuallyClosed;
                    if (hasItems) {
                        // Check if any chart container is in viewport
                        const anyVisible = chartContainers.some(c => {
                            const rect = c.getBoundingClientRect();
                            return rect.top < window.innerHeight && rect.bottom > 0;
                        });
                        if (anyVisible && allowFloating) {
                            legend.classList.add('chart-visible');
                        } else {
                            legend.classList.remove('chart-visible');
                        }
                    }
                };
                // Check initial visibility after legend is built
                setTimeout(checkInitialVisibility, 600);
                setTimeout(checkInitialVisibility, 1500);
                
                const onIntersect = (entries) => {
                    // Show legend if any container is at least partially visible
                    const anyVisible = entries.some(e => e.isIntersecting && e.intersectionRatio > 0.05);
                    // Only show legend if it has content (built) and chart datasets exist
                    const hasItems = document.getElementById('legend-content')?.children?.length > 0;
                    let preferredPosition = 'right';
                    try { preferredPosition = window._cachedLegendPosition || localStorage.getItem('legendPosition') || 'right'; } catch (e) { /* ignore */ }
                    const allowFloating = preferredPosition === 'right' && !window._timelineLegendAllowSidebar && !window._floatingLegendManuallyClosed;
                    if (allowFloating && anyVisible && hasItems) {
                        legend.classList.add('chart-visible');
                    } else {
                        legend.classList.remove('chart-visible');
                    }
                    // Also update bottom legend visibility based on chart visibility
                    const bottomLegend = document.getElementById('bottom-legend');
                    if (bottomLegend) {
                        // If user manually closed floating legend, bottom legend follows chart visibility
                        if (window._floatingLegendManuallyClosed) {
                            bottomLegend.style.display = (anyVisible && hasItems) ? 'flex' : 'none';
                        } else {
                            // Bottom legend hidden when floating legend is visible
                            bottomLegend.style.display = 'none';
                        }
                    }
                };
                const obs = new IntersectionObserver(onIntersect, { root: null, threshold: [0, 0.05, 0.2] });
                chartContainers.forEach(c => obs.observe(c));
                window._timelineLegendVisibilityObserver = obs;
            }
        }
    } catch (e) { console.warn('Legend visibility observer failed to install:', e); }

    // Setup close button for floating legend
    const closeBtn = document.getElementById('floating-legend-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const legend = document.getElementById('floating-legend');
            if (legend) {
                legend.style.display = 'none';
                legend.setAttribute('aria-hidden', 'true');
                legend.classList.remove('chart-visible');
                // Mark that user manually closed floating legend
                window._floatingLegendManuallyClosed = true;
                try {
                    localStorage.setItem('legendPosition', 'below');
                    window._cachedLegendPosition = 'below';
                } catch (e) { /* ignore */ }
            }
            // Show bottom legend when floating legend is closed
            const bottomLegend = document.getElementById('bottom-legend');
            if (bottomLegend) {
                bottomLegend.style.display = 'flex';
            }
            try {
                if (typeof window.updateOnRightButtonsVisibility === 'function') {
                    window.updateOnRightButtonsVisibility();
                }
            } catch (e) { /* ignore */ }
        });
    }

    // Setup toggle buttons for Locations/Continents view
    const locationsBtn = document.getElementById('view-locations-btn');
    const continentsBtn = document.getElementById('view-continents-btn');
    // Hide Continents tab for non-country scopes; reset to Locations view if needed
    if (continentsBtn) {
        const currentScope = (typeof getHash === 'function') ? String(getHash().scope || 'country').toLowerCase() : 'country';
        const isCountryScope = currentScope === 'country';
        continentsBtn.style.display = isCountryScope ? '' : 'none';
        if (!isCountryScope && window._legendViewMode === 'continents') {
            window._legendViewMode = 'locations';
        }
    }
    if (locationsBtn && continentsBtn) {
        const setAllContinentPanels = (open) => {
            try {
                const state = {};
                document.querySelectorAll('#legend-content .country-buttons-region').forEach((panel) => {
                    panel.style.display = open ? 'block' : 'none';
                });
                document.querySelectorAll('#legend-content .region-section').forEach((section) => {
                    const key = section.getAttribute('data-continent') || '';
                    const arrow = section.querySelector('.toggle-arrow');
                    if (arrow) arrow.style.transform = open ? 'rotate(0deg)' : 'rotate(-90deg)';
                    section.classList.toggle('collapsed', !open);
                    if (key) state[key] = !!open;
                });
                window._legendContinentSectionState = state;
                window._legendContinentAllOpen = !!open;
                if (typeof window.syncLegendContinentStateFromDom === 'function') window.syncLegendContinentStateFromDom();
            } catch (e) { /* ignore */ }
        };
        const toggleAllContinentPanels = () => {
            try {
                const panels = Array.from(document.querySelectorAll('#legend-content .country-buttons-region'));
                if (panels.length === 0) {
                    buildFloatingLegendFromChart();
                    setAllContinentPanels(true);
                    return;
                }
                const anyClosed = panels.some((panel) => panel.style.display === 'none');
                setAllContinentPanels(anyClosed);
            } catch (e) { /* ignore */ }
        };
        const updateToggleState = () => {
            if (window._legendViewMode === 'continents') {
                locationsBtn.classList.remove('active');
                continentsBtn.classList.add('active');
            } else {
                locationsBtn.classList.add('active');
                continentsBtn.classList.remove('active');
            }
            // Also sync sidebar toggle if it exists
            const sidebarLocBtn = document.getElementById('sidebar-locations-btn');
            const sidebarContBtn = document.getElementById('sidebar-continents-btn');
            if (sidebarLocBtn && sidebarContBtn) {
                if (window._legendViewMode === 'continents') {
                    sidebarLocBtn.classList.remove('active');
                    sidebarContBtn.classList.add('active');
                } else {
                    sidebarLocBtn.classList.add('active');
                    sidebarContBtn.classList.remove('active');
                }
            }
        };

        const handleLegendViewToggleClick = (targetBtn, e) => {
            if (!targetBtn) return;
            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }
            const targetId = targetBtn.id;
            if (targetId === 'view-locations-btn') {
                if (window._legendViewMode !== 'locations') {
                    window._legendViewMode = 'locations';
                    updateToggleState();
                    buildFloatingLegendFromChart();
                }
                return;
            }
            if (targetId === 'view-continents-btn') {
                if (window._legendViewMode !== 'continents') {
                    window._legendViewMode = 'continents';
                    // Every continent starts open. Clicking Continents again closes them all.
                    window._legendContinentSectionState = {};
                    window._legendContinentAllOpen = true;
                    updateToggleState();
                    buildFloatingLegendFromChart();
                } else {
                    toggleAllContinentPanels();
                }
            }
        };
        if (!window._legendViewToggleDelegatedBound) {
            document.addEventListener('click', (e) => {
                const btn = e.target && e.target.closest ? e.target.closest('#view-locations-btn, #view-continents-btn') : null;
                if (!btn) return;
                handleLegendViewToggleClick(btn, e);
            }, true);
            window._legendViewToggleDelegatedBound = true;
        }
        locationsBtn.addEventListener('click', (e) => handleLegendViewToggleClick(locationsBtn, e));
        continentsBtn.addEventListener('click', (e) => handleLegendViewToggleClick(continentsBtn, e));

        // Initialize toggle state
        updateToggleState();
    }

    // Setup drag functionality for floating legend
    const legendHeader = document.getElementById('floating-legend-drag-handle');
    const legend = document.getElementById('floating-legend');
    if (legendHeader && legend) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        legendHeader.addEventListener('mousedown', (e) => {
            isDragging = true;
            legend.classList.add('dragging');
            
            // Get current position
            const rect = legend.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            startLeft = rect.left;
            startTop = rect.top;
            
            // Switch to left/top positioning for dragging
            legend.style.right = 'auto';
            legend.style.left = startLeft + 'px';
            legend.style.top = startTop + 'px';
            legend.style.position = 'fixed';
            
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            let newLeft = startLeft + deltaX;
            let newTop = startTop + deltaY;
            
            // Keep within viewport bounds
            const legendRect = legend.getBoundingClientRect();
            const maxLeft = window.innerWidth - legendRect.width;
            const maxTop = window.innerHeight - legendRect.height;
            
            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));
            
            legend.style.left = newLeft + 'px';
            legend.style.top = newTop + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                legend.classList.remove('dragging');
            }
        });

        // Touch support for mobile
        legendHeader.addEventListener('touchstart', (e) => {
            isDragging = true;
            legend.classList.add('dragging');
            
            const touch = e.touches[0];
            const rect = legend.getBoundingClientRect();
            startX = touch.clientX;
            startY = touch.clientY;
            startLeft = rect.left;
            startTop = rect.top;
            
            legend.style.right = 'auto';
            legend.style.left = startLeft + 'px';
            legend.style.top = startTop + 'px';
            legend.style.position = 'fixed';
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;
            
            let newLeft = startLeft + deltaX;
            let newTop = startTop + deltaY;
            
            const legendRect = legend.getBoundingClientRect();
            const maxLeft = window.innerWidth - legendRect.width;
            const maxTop = window.innerHeight - legendRect.height;
            
            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));
            
            legend.style.left = newLeft + 'px';
            legend.style.top = newTop + 'px';
        }, { passive: true });

        document.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                legend.classList.remove('dragging');
            }
        });
    }
});

// Show/hide per-chart overlay legends only when the main navigation is explicitly closed/hidden.
function isMainNavClosed() {
    try {
        const mainNav = document.getElementById('main-nav');
        const body = document.body;
        // If there's no main-nav element, do NOT treat as closed: overlays should remain hidden
        if (!mainNav) return false;
        // If body explicitly hides main-nav (app-level class), treat as closed
        if (body.classList.contains('main-nav-hidden') || body.classList.contains('sidebar-hidden')) return true;
        // If #main-nav has inline display:none or visibility hidden, treat as closed
        const style = window.getComputedStyle(mainNav);
        if (style.display === 'none' || style.visibility === 'hidden') return true;
        // If main-nav has semantic classes that indicate it's collapsed/closed
        if (mainNav.classList.contains('closed') || mainNav.classList.contains('collapsed') || mainNav.getAttribute('aria-hidden') === 'true') return true;
        // If width is very small (collapsed to icons only), consider it closed for overlay purposes
        const w = parseFloat(style.width || '0');
        if (!isNaN(w) && w > 0 && w < 48) return true;
        // Otherwise not closed
        return false;
    } catch (e) { return false; }
}

function updateOverlayLegendVisibility() {
    // Overlay legend removed - using only floating legend
    return;
}

// Expose functions to window for external access (e.g., from navigation.js)
window.updateOverlayLegendVisibility = updateOverlayLegendVisibility;
window.buildFloatingLegendFromChart = buildFloatingLegendFromChart;

// Install a MutationObserver to watch for main-nav class/style changes and body class toggles
try {
    if (!window._timelineOverlayNavObserver) {
        const targets = [];
        const mainNav = document.getElementById('main-nav');
        if (mainNav) targets.push(mainNav);
        targets.push(document.body);
        const obs = new MutationObserver((mutations) => {
            // Quick debounce
            clearTimeout(window._overlayNavVisibilityTimer);
            window._overlayNavVisibilityTimer = setTimeout(() => updateOverlayLegendVisibility(), 40);
        });
        targets.forEach((n) => {
            try { obs.observe(n, { attributes: true, attributeFilter: ['class', 'style', 'aria-hidden'] }); } catch (e) { /* ignore */ }
        });
        window._timelineOverlayNavObserver = obs;
    }
} catch (e) { /* ignore */ }

// Storage events may toggle saved collapsed state in navigation code; listen for changes from other windows
window.addEventListener('storage', (ev) => {
    if (!ev.key || ev.key.indexOf('Nav') >= 0 || ev.key.indexOf('standaloneNavCollapsed') >= 0) {
        setTimeout(updateOverlayLegendVisibility, 30);
    }
});

// Do not auto-run visibility update on page init; visibility will be driven
// by the nav MutationObserver and explicit nav-close/open actions.

// Run a guarded initial visibility update shortly after load so overlays appear
// when the page first renders (kept short to allow chart setup).
setTimeout(() => {
    try {
        if (window.updateOverlayLegendVisibility) window.updateOverlayLegendVisibility();
    } catch (e) { /* ignore */ }
}, 120);

// Stub functions (overlay legend removed - using only floating legend)
function updateOverlayTitles() {}
function getOverlayClosedTracker() { return null; }
function markOverlayClosed(containerId) {}
function clearOverlayClosed(containerId) {}
function isAnyOverlayClosed() { return false; }
function updateBottomLegendVisibility() {
    const floatingLegend = document.getElementById('floating-legend');
    const bottomLegend = document.getElementById('bottom-legend');
    if (!bottomLegend) return;
    
    // Check if chart is visible in viewport
    const d1 = document.getElementById('div1');
    const d2 = document.getElementById('div2');
    const chartContainers = [d1, d2].filter(Boolean);
    const chartVisible = chartContainers.some(c => {
        const rect = c.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    });
    const hasItems = document.getElementById('legend-content')?.children?.length > 0;
    
    // If chart is not visible, hide both legends
    if (!chartVisible || !hasItems) {
        bottomLegend.style.display = 'none';
        return;
    }

    // On Left, the list is in the side nav, so it isn't repeated under the chart
    if (window._timelineLegendAllowSidebar) {
        bottomLegend.style.display = 'none';
        return;
    }
    
    // If user manually closed floating legend, show bottom legend and hide floating legend
    if (window._floatingLegendManuallyClosed) {
        bottomLegend.style.display = 'flex';
        // Ensure floating legend stays hidden
        if (floatingLegend) {
            floatingLegend.style.display = 'none';
        }
        return;
    }
    
    // Check if bottom legend is visible - if so, hide floating legend
    const bottomVisible = window.getComputedStyle(bottomLegend).display !== 'none';
    if (bottomVisible && floatingLegend) {
        floatingLegend.style.display = 'none';
        floatingLegend.classList.remove('chart-visible');
        return;
    }
    
    // If floating legend is visible, hide bottom legend
    const floatingVisible = floatingLegend && 
        window.getComputedStyle(floatingLegend).display !== 'none' &&
        floatingLegend.classList.contains('chart-visible');
    
    if (floatingVisible) {
        bottomLegend.style.display = 'none';
    } else {
        bottomLegend.style.display = 'flex';
        // If bottom legend is now visible, hide floating legend
        if (floatingLegend) {
            floatingLegend.style.display = 'none';
        }
    }
}
function tidyOverlayLegends() {}
function checkForClosedOverlays() {}

// Helper: position legend next to a target canvas. Also manages observers/listeners
function _positionLegendHelper(legend, targetCanvas, selectedToggle) {
    if (!legend || !targetCanvas) return;

    // Debounced reposition function
    const reposition = () => {
        try {
            const rect = targetCanvas.getBoundingClientRect();
            const lw = legend.offsetWidth || 220;
            const topPos = rect.top + window.scrollY + 20;
            if (window.innerWidth <= 700) {
                legend.style.left = Math.max(8, rect.left + 12 + window.scrollX) + 'px';
                legend.style.top = Math.max(8, rect.top + 12 + window.scrollY) + 'px';
            } else {
                const leftPos = rect.left + window.scrollX - lw - 18;
                let chosenLeft = (leftPos < 8 ? rect.right + 18 + window.scrollX : leftPos);
                // Avoid overlapping the whichLinesHolder controls
                try {
                    const which = document.querySelector('.whichLinesHolder');
                    if (which) {
                        const wRect = which.getBoundingClientRect();
                        const legendRectCandidate = { left: chosenLeft, top: Math.max(12, topPos), right: chosenLeft + lw, bottom: Math.max(12, topPos) + (legend.offsetHeight || 220) };
                        const whichRectAbs = { left: wRect.left + window.scrollX, top: wRect.top + window.scrollY, right: wRect.right + window.scrollX, bottom: wRect.bottom + window.scrollY };
                        const intersects = !(legendRectCandidate.right < whichRectAbs.left || legendRectCandidate.left > whichRectAbs.right || legendRectCandidate.bottom < whichRectAbs.top || legendRectCandidate.top > whichRectAbs.bottom);
                        if (intersects) {
                            // move legend to the right of the canvas instead
                            chosenLeft = rect.right + 18 + window.scrollX;
                        }
                    }
                } catch (e) { /* ignore */ }
                legend.style.left = chosenLeft + 'px';
                legend.style.top = Math.max(12, topPos) + 'px';
            }
            legend.style.position = 'absolute';
            legend.style.right = 'auto';
            legend.style.zIndex = 999;
        } catch (e) { /* ignore */ }
    };

    // Clean up any previous observers/listeners we created
    try {
        if (window._timelineLegendCleanup) {
            window._timelineLegendCleanup();
        }
    } catch (e) { /* ignore */ }

    // Create a ResizeObserver on the canvas to reposition when it changes
    let ro = null;
    try {
        ro = new ResizeObserver(() => {
            reposition();
        });
        ro.observe(targetCanvas);
    } catch (e) { ro = null; }

    // Debounce helper for scroll/resize
    let timer = null;
    //const onScrollOrResize = () => { clearTimeout(timer); timer = setTimeout(reposition, 80); };
    //window.addEventListener('scroll', onScrollOrResize, { passive: true });
    //window.addEventListener('resize', onScrollOrResize);

    // Store cleanup so next call removes these
    window._timelineLegendCleanup = () => {
        try { if (ro) ro.disconnect(); } catch (e) {}
        try { window.removeEventListener('scroll', onScrollOrResize); } catch (e) {}
        try { window.removeEventListener('resize', onScrollOrResize); } catch (e) {}
        try { clearTimeout(timer); } catch (e) {}
        window._timelineLegendCleanup = null;
    };

    // Initial position
    reposition();
}

// Charts that earthscape.js drew before this script loaded get their legend now
try {
    if (typeof Chart !== 'undefined' && Chart.getChart && Chart.getChart('timelineChart') && Chart.getChart('lineAreaChart')) {
        buildFloatingLegendFromChart();
    }
} catch (e) { console.warn('buildFloatingLegendFromChart failed:', e); }
