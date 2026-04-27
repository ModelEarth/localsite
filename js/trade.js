// localsite/js/trade.js
// Shared trade controls: Year, Factor, Currency, Inflows
// Used by profile/charts/sankey and profile/trade/map

window.TradeShared = (function () {

  var METRICS = {
    amount:           { label: "Amount Spent",        unit: "M EUR",       scale: 1,    sourceKeys: ["amount"],                                     scoreDirection: "higher" },
    CO2_total:        { label: "CO\u2082 Emissions",  unit: "Gt CO\u2082", scale: 1e12, sourceKeys: ["CO2_total"],                                 scoreDirection: "lower"  },
    Water_total:      { label: "Water Use",           unit: "Gm\u00B3",    scale: 1e9,  sourceKeys: ["Water_total"],                                scoreDirection: "lower"  },
    Employment_total: { label: "Employment",          unit: "M jobs",      scale: 1e6,  sourceKeys: ["Employment_total", "Employment_people_total"], scoreDirection: "higher" }
  };

  var CURRENCY_NAMES = {
    EUR: "Euro",               USD: "US Dollar",          JPY: "Japanese Yen",
    GBP: "British Pound",      CHF: "Swiss Franc",        SEK: "Swedish Krona",
    NOK: "Norwegian Krone",    DKK: "Danish Krone",       CZK: "Czech Koruna",
    PLN: "Polish Zloty",       HUF: "Hungarian Forint",   RON: "Romanian Leu",
    HRK: "Croatian Kuna",      BGN: "Bulgarian Lev",      TRY: "Turkish Lira",
    AUD: "Australian Dollar",  CAD: "Canadian Dollar",    HKD: "Hong Kong Dollar",
    SGD: "Singapore Dollar",   KRW: "South Korean Won",   ZAR: "South African Rand",
    MXN: "Mexican Peso",       INR: "Indian Rupee",       CNY: "Chinese Renminbi",
    BRL: "Brazilian Real",     IDR: "Indonesian Rupiah",  ILS: "Israeli New Shekel",
    MYR: "Malaysian Ringgit",  PHP: "Philippine Peso",    THB: "Thai Baht",
    ISK: "Icelandic Krona",    NZD: "New Zealand Dollar", RUB: "Russian Rouble"
  };

  var CURRENCY_SYMBOLS = {
    EUR: "\u20ac", USD: "$",   JPY: "\u00a5", GBP: "\u00a3", CHF: "CHF ",
    SEK: "kr ",   NOK: "kr ",  DKK: "kr ",   CZK: "K\u010d ", PLN: "z\u0142 ",
    HUF: "Ft ",   RON: "lei ", HRK: "kn ",   BGN: "\u043b\u0432 ", TRY: "\u20ba",
    AUD: "A$",    CAD: "C$",   HKD: "HK$",   SGD: "S$",      KRW: "\u20a9",
    ZAR: "R ",    MXN: "MX$",  INR: "\u20b9", CNY: "\u00a5", BRL: "R$",
    IDR: "Rp ",   ILS: "\u20aa", MYR: "RM ", PHP: "\u20b1", THB: "\u0e3f",
    ISK: "kr ",   NZD: "NZ$",  RUB: "\u20bd"
  };

  var _state = { year: "", metric: "amount", currency: "EUR", topn: 15 };
  var _currencyRatesByYear = {};
  var _callbacks = [];
  var _exactAmountFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

  function _currencyName(code) {
    var normalized = String(code || "").trim().toUpperCase();
    return CURRENCY_NAMES[normalized] || normalized;
  }

  function _currencySymbol(code) {
    var normalized = String(code || "").trim().toUpperCase();
    return CURRENCY_SYMBOLS[normalized] || (normalized ? normalized + " " : "");
  }

  function _parseNumber(value) {
    var parsed = Number(value);
    return isFinite(parsed) ? parsed : 0;
  }

  function _formatMagnitudeWordValue(value) {
    var numericValue = _parseNumber(value);
    var absolute = Math.abs(numericValue);
    var thresholds = [
      { size: 1e12, label: "Trillion" },
      { size: 1e9,  label: "Billion" },
      { size: 1e6,  label: "Million" },
      { size: 1e3,  label: "Thousand" }
    ];
    var threshold = thresholds.find(function (entry) {
      return absolute >= entry.size;
    });

    if (!threshold) {
      return numericValue.toLocaleString(undefined, { maximumFractionDigits: 0 });
    }

    var scaled = numericValue / threshold.size;
    var maximumFractionDigits = Math.abs(scaled) >= 100 ? 0 : 1;
    var precision = Math.pow(10, maximumFractionDigits);
    var rounded = Math.round(scaled * precision) / precision;

    return rounded.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: maximumFractionDigits
    }) + " " + threshold.label;
  }

  function currencyRateForYear(year, currencyCode) {
    var normalized = String(currencyCode || "").trim().toUpperCase() || "EUR";
    if (normalized === "EUR") {
      return 1;
    }
    var yearRates = _currencyRatesByYear[String(year || "").trim()] || {};
    return _parseNumber(yearRates[normalized]) || 1;
  }

  function convertAmountValue(value, year, currencyCode) {
    return _parseNumber(value) * currencyRateForYear(year, currencyCode);
  }

  function formatCurrencyMagnitudeWordValue(value, currencyCode) {
    return _currencySymbol(currencyCode) + _formatMagnitudeWordValue(_parseNumber(value) * 1e6);
  }

  function formatCurrencyCompactValue(value, currencyCode) {
    var numericValue = _parseNumber(value) * 1e6;
    var formatter = Math.abs(numericValue) >= 1e6
      ? { notation: "compact", maximumFractionDigits: 1 }
      : { maximumFractionDigits: 0 };
    return _currencySymbol(currencyCode) + numericValue.toLocaleString(undefined, formatter);
  }

  function formatCurrencyExactValue(value, currencyCode) {
    return _currencySymbol(currencyCode) + _exactAmountFormatter.format(_parseNumber(value) * 1e6);
  }

  function formatAmountExact(value, year, currencyCode) {
    var currency = String(currencyCode || "").trim().toUpperCase() || _state.currency || "EUR";
    return formatCurrencyExactValue(convertAmountValue(value, year, currency), currency);
  }

  function formatAmountCompact(value, year, currencyCode) {
    var currency = String(currencyCode || "").trim().toUpperCase() || _state.currency || "EUR";
    return formatCurrencyCompactValue(convertAmountValue(value, year, currency), currency);
  }

  function setCurrencyRates(ratesByYear) {
    _currencyRatesByYear = ratesByYear || {};
  }

  function _injectStyles() {
    if (document.getElementById("trade-shared-styles")) { return; }
    var style = document.createElement("style");
    style.id = "trade-shared-styles";
    style.textContent =
      "#trade-shared-controls {" +
      "  display:flex; flex-wrap:wrap; gap:1rem 1.5rem; align-items:center;" +
      "  padding:0 0 0.5em;" +
      "  box-sizing:border-box;" +
      "}" +
      "#trade-shared-controls label {" +
      "  display:flex; align-items:center; gap:0.5em;" +
      "  font-size:0.93em; color:var(--text-primary, #333);" +
      "  min-width:0;" +
      "}" +
      "#trade-shared-controls select {" +
      "  padding:0.25em 0.5em; font-size:0.93em;" +
      "  border:1px solid #ccc; border-radius:4px; background:var(--bg-tertiary, #fff);" +
      "}" +
      "#trade-shared-controls input[type=range] { width:120px; cursor:pointer; }" +
      "#trade-topn-label { font-weight:600; min-width:2em; text-align:right; }";
    document.head.appendChild(style);
  }

  function _syncCurrencyVisibility(metricKey) {
    var currencyLabel = document.getElementById("trade-currency-label");
    if (!currencyLabel) { return; }
    currencyLabel.hidden = metricKey !== "amount";
  }

  function _buildControls(container, years, currencies) {
    container.innerHTML = "";

    // Year
    var yearLabel = document.createElement("label");
    yearLabel.appendChild(document.createTextNode("Year: "));
    var yearSelect = document.createElement("select");
    yearSelect.id = "trade-year-select";
    (years || []).forEach(function (y) {
      var opt = document.createElement("option");
      opt.value = y; opt.textContent = y;
      yearSelect.appendChild(opt);
    });
    if (_state.year && yearSelect.querySelector('option[value="' + _state.year + '"]')) {
      yearSelect.value = _state.year;
    } else if (years && years.length) {
      yearSelect.value = years[0];
      _state.year = years[0];
    }
    yearLabel.appendChild(yearSelect);
    container.appendChild(yearLabel);

    // Factor
    var metricLabel = document.createElement("label");
    metricLabel.appendChild(document.createTextNode("Factor: "));
    var metricSelect = document.createElement("select");
    metricSelect.id = "factor";
    Object.keys(METRICS).forEach(function (key) {
      var opt = document.createElement("option");
      opt.value = key; opt.textContent = METRICS[key].label;
      metricSelect.appendChild(opt);
    });
    metricSelect.value = _state.metric || "amount";
    metricLabel.appendChild(metricSelect);
    container.appendChild(metricLabel);

    // Currency
    var currencyLabel = document.createElement("label");
    currencyLabel.id = "trade-currency-label";
    currencyLabel.appendChild(document.createTextNode("Currency: "));
    var currencySelect = document.createElement("select");
    currencySelect.id = "trade-currency-select";
    (currencies || ["EUR"]).forEach(function (code) {
      var opt = document.createElement("option");
      opt.value = code; opt.textContent = code + " - " + _currencyName(code);
      currencySelect.appendChild(opt);
    });
    if (_state.currency && currencySelect.querySelector('option[value="' + _state.currency + '"]')) {
      currencySelect.value = _state.currency;
    }
    currencyLabel.appendChild(currencySelect);
    container.appendChild(currencyLabel);

    // Inflows
    var topnLabel = document.createElement("label");
    topnLabel.appendChild(document.createTextNode("Inflows: "));
    var topnSlider = document.createElement("input");
    topnSlider.type = "range"; topnSlider.id = "trade-topn-slider";
    topnSlider.min = "5"; topnSlider.max = "50"; topnSlider.step = "1";
    topnSlider.value = String(_state.topn || 15);
    var topnDisplay = document.createElement("span");
    topnDisplay.id = "trade-topn-label";
    topnDisplay.textContent = String(_state.topn || 15);
    topnLabel.appendChild(topnSlider);
    topnLabel.appendChild(topnDisplay);
    container.appendChild(topnLabel);
    _syncCurrencyVisibility(metricSelect.value);

    // Event listeners — each fires _dispatch so other pages can react
    yearSelect.addEventListener("change", function () {
      _state.year = yearSelect.value;
      _dispatch();
    });
    metricSelect.addEventListener("change", function () {
      _state.metric = metricSelect.value;
      _syncCurrencyVisibility(_state.metric);
      _dispatch();
    });
    currencySelect.addEventListener("change", function () {
      _state.currency = currencySelect.value;
      _dispatch();
    });
    topnSlider.addEventListener("input", function () {
      var val = parseInt(topnSlider.value, 10) || 15;
      topnDisplay.textContent = String(val);
      _state.topn = val;
      _dispatch();
    });
  }

  function _dispatch() {
    var state = getState();
    try { document.dispatchEvent(new CustomEvent("trade:change", { detail: state })); } catch (e) {}
    _callbacks.forEach(function (cb) { try { cb(state); } catch (e) {} });
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  function init(options) {
    options = options || {};
    var initial = options.initialState || {};
    if (initial.year)     { _state.year     = initial.year;     }
    if (initial.metric)   { _state.metric   = initial.metric;   }
    if (initial.currency) { _state.currency = initial.currency; }
    if (initial.topn)     { _state.topn     = initial.topn;     }
    if (typeof options.onChange === "function") { _callbacks.push(options.onChange); }

    var container = document.getElementById(options.container || "trade-shared-controls");
    if (container) {
      _injectStyles();
      _buildControls(container, options.years || [], options.currencies || ["EUR"]);
    }
  }

  function getState() {
    return { year: _state.year, metric: _state.metric, currency: _state.currency, topn: _state.topn };
  }

  function setState(partial) {
    var changed = false;
    if (partial.year !== undefined && partial.year !== _state.year) {
      _state.year = partial.year;
      var ys = document.getElementById("trade-year-select");
      if (ys && ys.querySelector('option[value="' + partial.year + '"]')) { ys.value = partial.year; }
      changed = true;
    }
    if (partial.metric !== undefined && partial.metric !== _state.metric) {
      _state.metric = partial.metric;
      var ms = document.getElementById("factor");
      if (ms) { ms.value = partial.metric; }
      _syncCurrencyVisibility(_state.metric);
      changed = true;
    }
    if (partial.currency !== undefined && partial.currency !== _state.currency) {
      _state.currency = partial.currency;
      var cs = document.getElementById("trade-currency-select");
      if (cs && cs.querySelector('option[value="' + partial.currency + '"]')) { cs.value = partial.currency; }
      changed = true;
    }
    if (partial.topn !== undefined && partial.topn !== _state.topn) {
      _state.topn = partial.topn;
      var ts = document.getElementById("trade-topn-slider");
      var tl = document.getElementById("trade-topn-label");
      if (ts) { ts.value = String(partial.topn); }
      if (tl) { tl.textContent = String(partial.topn); }
      changed = true;
    }
    if (changed) { _dispatch(); }
  }

  function setYears(years) {
    var select = document.getElementById("trade-year-select");
    if (!select) { return; }
    var current = _state.year;
    select.innerHTML = "";
    (years || []).forEach(function (y) {
      var opt = document.createElement("option");
      opt.value = y; opt.textContent = y;
      select.appendChild(opt);
    });
    var available = years || [];
    if (available.indexOf(current) !== -1) {
      select.value = current;
    } else if (available.length) {
      select.value = available[0];
      _state.year = available[0];
    }
  }

  function setCurrencies(currencies) {
    var select = document.getElementById("trade-currency-select");
    if (!select) { return; }
    var current = _state.currency;
    select.innerHTML = "";
    (currencies || ["EUR"]).forEach(function (code) {
      var opt = document.createElement("option");
      opt.value = code; opt.textContent = code + " - " + _currencyName(code);
      select.appendChild(opt);
    });
    var available = currencies || ["EUR"];
    if (available.indexOf(current) !== -1) {
      select.value = current;
    } else {
      select.value = available[0] || "EUR";
      _state.currency = select.value;
    }
    _syncCurrencyVisibility(_state.metric);
  }

  return {
    init: init,
    getState: getState,
    setState: setState,
    setYears: setYears,
    setCurrencies: setCurrencies,
    setCurrencyRates: setCurrencyRates,
    currencyRateForYear: currencyRateForYear,
    convertAmountValue: convertAmountValue,
    currencyName: _currencyName,
    currencySymbol: _currencySymbol,
    formatMagnitudeWordValue: _formatMagnitudeWordValue,
    formatCurrencyExactValue: formatCurrencyExactValue,
    formatCurrencyCompactValue: formatCurrencyCompactValue,
    formatCurrencyMagnitudeWordValue: formatCurrencyMagnitudeWordValue,
    formatAmountExact: formatAmountExact,
    formatAmountCompact: formatAmountCompact,
    METRICS: METRICS,
    CURRENCY_NAMES: CURRENCY_NAMES,
    CURRENCY_SYMBOLS: CURRENCY_SYMBOLS
  };

})();
