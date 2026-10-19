// Impact sets: groups of USEEIO indicators used to filter impacts (Air, Water, Land, Energy, Health, Prosperity).
// The one shared list for the impact icons (localsite/header.html and info/template-charts.html via iNav in
// navigation.js), the info page titles (naics.js) and impact set dropdowns. localsite.js loads this file.
//
// Dropdown usage:
//   <select id="impact-set-select"></select>
//   const sets = addImpactSetSelect('#impact-set-select', { onChange: setId => { ... } });
//   sets.setAvailable(['GHG', 'WATR', ...]); // Optional: disable sets with no indicators in the current model
//   impactSetIncludes(sets.value(), 'GHG');  // true when GHG is in the chosen set (or no set is chosen)
//
// The dropdown keeps only set=... in the URL hash. Pages get the indicators from this list.
// Requires localsite.js for getHash() and goHashQuiet().

// var, so loading this file a second time (script tag plus loadScript) doesn't throw
var impactSets = [
  { id: 'air', title: 'Air', heading: 'Air and Climate', indicators: ['GHG', 'GCC', 'MGHG', 'OGHG', 'HRSP', 'OZON', 'SMOG', 'HAPS'] },
  { id: 'water', title: 'Water', heading: 'Water Use and Quality', indicators: ['WATR', 'ACID', 'EUTR', 'ETOX'] },
  { id: 'land', title: 'Land', heading: 'Land Use', indicators: ['LAND', 'MNRL', 'PEST', 'METL', 'CRHW', 'CMSW', 'FMSW', 'CCDD'] },
  // Energy indicators are only in the national model (USEEIO), not the state models. With a state, localsite/info
  // shows eGRID electricity data (profile/js/state-energy.js) and profile/footprint switches to the national model.
  { id: 'energy', title: 'Energy', heading: 'Energy Use', indicators: ['ENRG', 'NNRG', 'RNRG'] },
  { id: 'health', title: 'Health', heading: 'Health Impact', indicators: ['HTOX', 'HCAN', 'HNCN', 'HRSP'] },
  { id: 'prosperity', title: 'Prosperity', heading: 'Jobs and Value Added', indicators: ['VADD', 'JOBS'] }
];

// Adverse: every indicator except the Prosperity ones. A dropdown choice rather than an impact icon.
var impactSetAdverse = { id: 'adverse', title: 'Adverse', heading: 'Adverse Impacts' };

function impactSetById(setId) {
  const id = String(setId || '').toLowerCase();
  if (id === impactSetAdverse.id) return impactSetAdverse;
  return impactSets.find(set => set.id === id) || null;
}

// Indicator codes for a set, e.g. "GHG,GCC,..." for links and widgets that read hash.indicators.
// Empty for Adverse and unknown sets, since those aren't a fixed list.
function impactSetIndicators(setId) {
  const set = impactSetById(setId);
  return set && set.indicators ? set.indicators.join(',') : '';
}

// True when the indicator code is in the set, or when no set is chosen
function impactSetIncludes(setId, code) {
  const set = impactSetById(setId);
  const upper = String(code || '').toUpperCase();
  if (!set) return true;
  if (set === impactSetAdverse) return !impactSetById('prosperity').indicators.includes(upper);
  return set.indicators.includes(upper);
}

// Fills a <select> with "All Impacts", "Adverse" and the six sets, starting from hash.set.
// Changing it puts set=... in the hash quietly (no hashChangeEvent), removes any indicators=...
// left by the impact icons, and calls options.onChange(setId).
function addImpactSetSelect(selectOrSelector, options = {}) {
  const select = typeof selectOrSelector === 'string' ? document.querySelector(selectOrSelector) : selectOrSelector;
  if (!select) return null;
  const choices = [impactSetAdverse].concat(impactSets);
  select.innerHTML = `<option value="">${options.allLabel || 'All Impacts'}</option>`
    + choices.map(set => `<option value="${set.id}" title="${set.indicators ? set.indicators.join(', ') : 'All except Prosperity (' + impactSetIndicators('prosperity') + ')'}">${set.title}</option>`).join('');
  if (!select.getAttribute('aria-label')) select.setAttribute('aria-label', 'Impact set');

  const fromHash = () => {
    const hash = typeof getHash === 'function' ? getHash() : {};
    return impactSetById(hash.set) ? hash.set.toLowerCase() : '';
  };
  select.value = fromHash();

  select.addEventListener('change', () => {
    if (typeof goHashQuiet === 'function') {
      if (select.value) goHashQuiet({ set: select.value }, ['indicators']);
      else goHashQuiet({}, ['set', 'indicators']);
    }
    if (options.onChange) options.onChange(select.value);
  });

  // Follow set changes made elsewhere, such as the impact icons in the header
  document.addEventListener('hashChangeEvent', () => {
    const setId = fromHash();
    if (setId !== select.value) {
      select.value = setId;
      if (options.onChange) options.onChange(setId);
    }
  }, false);

  return {
    select: select,
    value: () => select.value,
    // Disable sets that have none of the model's indicators, except the ids in keepEnabled
    // (for sets the page handles itself, such as switching to the national model for Energy)
    setAvailable: (codes, keepEnabled = []) => {
      const available = (codes || []).map(code => String(code).toUpperCase());
      Array.from(select.options).forEach(option => {
        const set = impactSetById(option.value);
        if (!set) return;
        const none = !keepEnabled.includes(set.id) && !available.some(code => impactSetIncludes(set.id, code));
        option.disabled = none;
        option.textContent = none ? `${set.title} (not in this model)` : set.title;
      });
    }
  };
}
