// localsite/js/trade.js
// Shared trade controls: Year, Factor, Currency, Inflows
// Used by profile/charts/sankey, io/charts/sankey/desktop, and profile/trade/map

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

  function _detectCurrency() {
    try {
      var lang = (navigator.languages && navigator.languages[0]) || navigator.language || "";
      var parts = lang.split(/[-_]/);
      var region = (parts[1] || "").toUpperCase();
      if (region.length !== 2) { region = (parts[2] || "").toUpperCase(); }
      var map = {
        US: "USD", GB: "GBP", AU: "AUD", CA: "CAD", NZ: "NZD",
        JP: "JPY", CN: "CNY", KR: "KRW", HK: "HKD", SG: "SGD",
        IN: "INR", ID: "IDR", MY: "MYR", PH: "PHP", TH: "THB",
        CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK", CZ: "CZK",
        PL: "PLN", HU: "HUF", RO: "RON", HR: "HRK", BG: "BGN",
        TR: "TRY", IL: "ILS", ZA: "ZAR", MX: "MXN", BR: "BRL",
        RU: "RUB", IS: "ISK",
        // Eurozone
        AT: "EUR", BE: "EUR", CY: "EUR", DE: "EUR", EE: "EUR",
        ES: "EUR", FI: "EUR", FR: "EUR", GR: "EUR", IE: "EUR",
        IT: "EUR", LT: "EUR", LU: "EUR", LV: "EUR", MT: "EUR",
        NL: "EUR", PT: "EUR", SI: "EUR", SK: "EUR"
      };
      return map[region] || null;
    } catch (e) { return null; }
  }
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
    _state.currency = initial.currency || _detectCurrency() || "EUR";
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
    detectCurrency: _detectCurrency,
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

// ---------------------------------------------------------------------------
// TradePartner — partner-country bar chart, country name lookup, select swap
// Depends on TradeShared (defined above) and echarts (loaded by the page).
// ---------------------------------------------------------------------------
window.TradePartner = (function () {

  var _countryNameMap = {
    US: "United States", CN: "China",          DE: "Germany",
    IN: "India",         RU: "Russia",         CA: "Canada",
    JP: "Japan",         GB: "United Kingdom", FR: "France",
    BR: "Brazil",        AU: "Australia",      MX: "Mexico",
    KR: "South Korea",   IT: "Italy",          ES: "Spain",
    NL: "Netherlands",   SA: "Saudi Arabia",   ZA: "South Africa",
    AR: "Argentina",     TR: "Turkey",         ID: "Indonesia",
    PL: "Poland",        BE: "Belgium",        SE: "Sweden",
    NO: "Norway",        CH: "Switzerland",    AT: "Austria",
    CZ: "Czech Republic",FI: "Finland",        DK: "Denmark",
    TW: "Taiwan",        TH: "Thailand",       MY: "Malaysia",
    SG: "Singapore",     PH: "Philippines",    VN: "Vietnam",
    NG: "Nigeria",       EG: "Egypt",          GR: "Greece",
    PT: "Portugal",      HU: "Hungary",        RO: "Romania",
    BG: "Bulgaria",      CY: "Cyprus",         EE: "Estonia",
    HR: "Croatia",       IE: "Ireland",        IL: "Israel",
    LT: "Lithuania",     LU: "Luxembourg",     LV: "Latvia",
    MT: "Malta",         SI: "Slovenia",       SK: "Slovakia",
    WA: "Asia & Pacific",WE: "Europe",         WF: "Africa",
    WL: "Latin America", WM: "Middle East"
  };
  var _chartInstance = null;

  // ---------------------------------------------------------------------------
  // Internal utilities
  // ---------------------------------------------------------------------------
  function _parseNumber(value) {
    var parsed = Number(value);
    return isFinite(parsed) ? parsed : 0;
  }

  function _normalizeRange(value, min, max, invert) {
    if (!isFinite(value)) { return 0; }
    if (!isFinite(min) || !isFinite(max) || max <= min) { return 1; }
    var n = (value - min) / (max - min);
    return invert ? (1 - n) : n;
  }

  function _getMetricValue(row, metricKey) {
    var metric = TradeShared.METRICS[metricKey] || {};
    var keys = Array.isArray(metric.sourceKeys) && metric.sourceKeys.length
      ? metric.sourceKeys : [metricKey];
    for (var i = 0; i < keys.length; i++) {
      var val = _parseNumber(row[keys[i]]);
      if (val) { return val; }
    }
    return 0;
  }

  function _partnerCountryCode(row, selection) {
    var origin = String(row.region1 || "").trim();
    var dest   = String(row.region2 || "").trim();
    var self   = String(selection.country || "").trim();
    if (selection.flow === "exports") {
      if (dest && dest !== self) { return dest; }
      if (origin && origin !== self) { return origin; }
      return dest || origin;
    }
    if (selection.flow === "imports") {
      if (origin && origin !== self) { return origin; }
      if (dest && dest !== self) { return dest; }
      return origin || dest;
    }
    return "";
  }

  function _rowMatchesCountryPair(row, selection) {
    var other = String(selection.otherCountry || "").trim();
    if (!other || selection.flow === "domestic") { return true; }
    var self = String(selection.country || "").trim();
    var r1 = String(row.region1 || "").trim();
    var r2 = String(row.region2 || "").trim();
    return (r1 === self && r2 === other) || (r1 === other && r2 === self);
  }

  function _metricUnit(metricKey, currency) {
    if (metricKey === "amount") { return "M " + (currency || "EUR"); }
    var metric = TradeShared.METRICS[metricKey];
    return metric ? metric.unit : "";
  }

  function _fmtValue(val, metricKey, year, currency) {
    var metric = TradeShared.METRICS[metricKey];
    if (!metric) { return _parseNumber(val).toLocaleString(undefined, { maximumFractionDigits: 2 }); }
    if (metricKey === "amount") {
      return TradeShared.formatCurrencyMagnitudeWordValue(
        TradeShared.convertAmountValue(val, year, currency), currency);
    }
    var scaled = _parseNumber(val) / (metric.scale || 1);
    var formatted = scaled >= 1000
      ? scaled.toLocaleString(undefined, { maximumFractionDigits: 0 })
      : scaled.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return formatted + " " + metric.unit;
  }

  function _fmtAxisTick(val, metricKey, year, currency) {
    if (metricKey === "amount") {
      return TradeShared.formatCurrencyCompactValue(
        TradeShared.convertAmountValue(val, year, currency), currency);
    }
    var metric = TradeShared.METRICS[metricKey];
    if (!metric) { return String(val); }
    var scaled = _parseNumber(val) / (metric.scale || 1);
    return scaled.toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 1 });
  }

  function _fmtCompactValue(val, metricKey, year, currency) {
    if (metricKey === "amount") {
      return TradeShared.formatCurrencyCompactValue(
        TradeShared.convertAmountValue(val, year, currency), currency);
    }
    var metric = TradeShared.METRICS[metricKey];
    if (!metric) { return String(val); }
    var scaled = _parseNumber(val) / (metric.scale || 1);
    return scaled.toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 1 }) +
      " " + metric.unit;
  }

  function _fmtScore(val) {
    return _parseNumber(val).toLocaleString(undefined, {
      minimumFractionDigits: 1, maximumFractionDigits: 1
    });
  }

  function _convertIntensityPerCurrency(value, year, currency) {
    var rate = TradeShared.currencyRateForYear(year, currency);
    return rate > 0 ? (_parseNumber(value) / rate) : _parseNumber(value);
  }

  function countryFullName(code) {
    var key = String(code || "").trim();
    return _countryNameMap[key] || key;
  }

  function initCountryNameSwap(selectEl) {
    if (!selectEl) { return; }
    selectEl.addEventListener("mousedown", function () {
      Array.from(selectEl.options).forEach(function (opt) {
        if (opt.value) { opt.textContent = countryFullName(opt.value); }
      });
    });
    function restoreCodes() {
      Array.from(selectEl.options).forEach(function (opt) {
        if (opt.value) { opt.textContent = opt.value; }
      });
    }
    selectEl.addEventListener("change", restoreCodes);
    selectEl.addEventListener("blur", restoreCodes);
  }

  // ---------------------------------------------------------------------------
  // Data
  // ---------------------------------------------------------------------------
  function buildPartnerBreakdown(rawData, selection) {
    var metricKey = selection.metric;
    var byPartner = {};

    (rawData || []).forEach(function (row) {
      if (!_rowMatchesCountryPair(row, selection)) { return; }
      var partner = _partnerCountryCode(row, selection);
      if (!partner) { return; }
      var metricValue = _getMetricValue(row, metricKey);
      var amountValue = _getMetricValue(row, "amount");
      if (metricValue <= 0 && amountValue <= 0) { return; }
      if (!byPartner[partner]) {
        byPartner[partner] = { partner: partner, metricValue: 0, amountValue: 0 };
      }
      byPartner[partner].metricValue += metricValue;
      byPartner[partner].amountValue += amountValue;
    });

    var rows = Object.keys(byPartner).map(function (k) {
      var r = byPartner[k];
      return { partner: r.partner, metricValue: r.metricValue, amountValue: r.amountValue,
               intensity: r.amountValue > 0 ? (r.metricValue / r.amountValue) : 0 };
    });

    if (!rows.length) { return rows; }

    var maxAmount = Math.max.apply(null, rows.map(function (r) { return r.amountValue; }));
    var intensities = rows.map(function (r) { return r.intensity; });
    var minIntensity = Math.min.apply(null, intensities);
    var maxIntensity = Math.max.apply(null, intensities);
    var invertIntensity = (TradeShared.METRICS[metricKey] &&
      TradeShared.METRICS[metricKey].scoreDirection) === "lower";

    return rows
      .map(function (r) {
        var tradeStrength = maxAmount > 0 ? (r.amountValue / maxAmount) : 0;
        var impactEfficiency = metricKey === "amount"
          ? tradeStrength
          : _normalizeRange(r.intensity, minIntensity, maxIntensity, invertIntensity);
        var score = metricKey === "amount"
          ? (tradeStrength * 100)
          : ((tradeStrength * 0.6 + impactEfficiency * 0.4) * 100);
        return { partner: r.partner, metricValue: r.metricValue, amountValue: r.amountValue,
                 intensity: r.intensity, tradeStrength: tradeStrength,
                 impactEfficiency: impactEfficiency, score: score };
      })
      .sort(function (a, b) {
        return b.score !== a.score ? b.score - a.score : b.amountValue - a.amountValue;
      })
      .slice(0, 10);
  }

  function buildBalanceBreakdown(importsData, exportsData, selection) {
    var self   = String(selection.country || "").trim().toUpperCase();
    var metricKey = selection.metric || "amount";
    var byPartner = {};

    function _addRows(data, flowDir) {
      var fakeSel = { country: self, flow: flowDir, otherCountry: "" };
      (data || []).forEach(function (row) {
        var partner = _partnerCountryCode(row, fakeSel);
        if (!partner || partner === self) { return; }
        var val = _getMetricValue(row, metricKey);
        var amt = _getMetricValue(row, "amount");
        if (!byPartner[partner]) {
          byPartner[partner] = { partner: partner, imports: 0, exports: 0 };
        }
        if (flowDir === "imports") {
          byPartner[partner].imports += val;
          byPartner[partner].importAmt = (byPartner[partner].importAmt || 0) + amt;
        } else {
          byPartner[partner].exports += val;
          byPartner[partner].exportAmt = (byPartner[partner].exportAmt || 0) + amt;
        }
      });
    }

    _addRows(importsData, "imports");
    _addRows(exportsData, "exports");

    var rows = Object.keys(byPartner).map(function (k) {
      var r = byPartner[k];
      return { partner: r.partner, imports: r.imports, exports: r.exports,
               imbalance: r.imports - r.exports };
    }).filter(function (r) { return r.imports > 0 || r.exports > 0; });

    rows.sort(function (a, b) { return Math.abs(b.imbalance) - Math.abs(a.imbalance); });
    return rows.slice(0, selection.topn || 10);
  }

  // ---------------------------------------------------------------------------
  // Chart init and resize
  // ---------------------------------------------------------------------------
  function initChart(elementId) {
    var el = typeof elementId === "string"
      ? document.getElementById(elementId) : elementId;
    if (!el || typeof echarts === "undefined") { return; }
    _chartInstance = echarts.init(el);
  }

  function resize() {
    if (_chartInstance) { _chartInstance.resize(); }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  function render(rawData, activeSelection) {
    var panel  = document.getElementById("partner-chart-panel");
    var header = document.getElementById("partner-chart-header");
    var note   = document.getElementById("partner-chart-note");
    var status = document.getElementById("partner-chart-status");

    var isPairFiltered = !!(activeSelection &&
      String(activeSelection.otherCountry || "").trim());

    if (!rawData || !activeSelection || activeSelection.flow === "domestic" || isPairFiltered) {
      if (panel)  { panel.hidden = true; }
      if (_chartInstance) { _chartInstance.clear(); }
      if (note)   { note.textContent = "Top 10 partner countries for the selected import/export view, showing the selected indicator alongside amount spent."; }
      if (status) { status.textContent = ""; status.style.color = ""; }
      return;
    }

    if (panel)  { panel.hidden = false; }

    // ---- Balance mode: diverging imbalance chart ----
    if (activeSelection.flow === "balance") {
      var bMetricLabel = (TradeShared.METRICS[activeSelection.metric] || {}).label || "";
      if (header) { header.textContent = countryFullName(activeSelection.country) + " - Top Trade Imbalances" + (bMetricLabel ? " - " + bMetricLabel : ""); }
      var bMetricKey = activeSelection.metric;
      var bYear      = activeSelection.year;
      var bCurrency  = activeSelection.currency || "EUR";
      var balRows = (rawData && rawData.importsData)
        ? buildBalanceBreakdown(rawData.importsData, rawData.exportsData, activeSelection)
        : [];
      if (!balRows.length) {
        if (_chartInstance) { _chartInstance.clear(); }
        if (note)   { note.textContent = "No partner-country balance data available for this selection."; }
        if (status) { status.textContent = "No partner-country data available for this selection."; status.style.color = "#a3412d"; }
        return;
      }
      if (note) {
        note.textContent = "Partner countries ranked by the size of their trade imbalance. "
          + "Orange bars show a deficit (more imports than exports); blue bars show a surplus.";
      }
      var bStyle      = getComputedStyle(document.body);
      var bTooltipBg  = bStyle.getPropertyValue("--bg-primary").trim()   || "#fff";
      var bTooltipTxt = bStyle.getPropertyValue("--text-primary").trim() || "#333";
      var bCategories = balRows.map(function (r) { return countryFullName(r.partner); });
      var bSeries = balRows.map(function (r) {
        return { value: r.imbalance, imports: r.imports, exports: r.exports,
                 itemStyle: { color: r.imbalance >= 0 ? "#dd6b20" : "#2563eb" } };
      });
      if (!_chartInstance) { return; }
      _chartInstance.setOption({
        animationDuration: 300,
        legend: { show: false },
        grid: { left: 88, right: 88, top: 30, bottom: 28, containLabel: true },
        tooltip: {
          trigger: "axis", axisPointer: { type: "shadow" }, confine: true,
          backgroundColor: bTooltipBg, textStyle: { color: bTooltipTxt },
          formatter: function (params) {
            var d = params[0]; var row = d && d.data ? d.data : {};
            var lines = ["<b>" + d.axisValue + "</b>"];
            lines.push("Imports: <b>" + _fmtValue(row.imports || 0, bMetricKey, bYear, bCurrency) + "</b>");
            lines.push("Exports: <b>" + _fmtValue(row.exports || 0, bMetricKey, bYear, bCurrency) + "</b>");
            var sign = (row.value || 0) >= 0 ? "Deficit" : "Surplus";
            lines.push(sign + ": <b>" + _fmtValue(Math.abs(row.value || 0), bMetricKey, bYear, bCurrency) + "</b>");
            return lines.join("<br/>");
          }
        },
        yAxis: { type: "category", inverse: true, axisTick: { show: false }, data: bCategories },
        xAxis: {
          type: "value",
          name: "Trade Imbalance (+ deficit − surplus)",
          nameLocation: "middle", nameGap: 28,
          axisLabel: { formatter: function (v) { return _fmtAxisTick(Math.abs(v), bMetricKey, bYear, bCurrency); } }
        },
        series: [{ type: "bar", data: bSeries, barMaxWidth: 22 }]
      }, true);
      _chartInstance.resize();
      if (status) {
        var defCount = balRows.filter(function (r) { return r.imbalance >= 0; }).length;
        var surCount = balRows.length - defCount;
        status.textContent = countryFullName(activeSelection.country) + " " + activeSelection.year
          + ": " + defCount + " deficit partner" + (defCount !== 1 ? "s" : "")
          + ", " + surCount + " surplus partner" + (surCount !== 1 ? "s" : "") + ".";
        status.style.color = "";
      }
      return;
    }

    var flowLabel = activeSelection.flow === "exports" ? "Export" : "Import";
    var metricLabel = (TradeShared.METRICS[activeSelection.metric] || {}).label || "";
    if (header) { header.textContent = countryFullName(activeSelection.country) + " - Top " + flowLabel + " Partners" + (metricLabel ? " - " + metricLabel : ""); }

    var metricKey    = activeSelection.metric;
    var metric       = TradeShared.METRICS[metricKey];
    var amountMetric = TradeShared.METRICS.amount;
    var year         = activeSelection.year;
    var currency     = activeSelection.currency || "EUR";
    var rows         = buildPartnerBreakdown(rawData, activeSelection);

    if (!rows.length) {
      if (_chartInstance) { _chartInstance.clear(); }
      if (note)   { note.textContent = "Top 10 partner countries for the selected import/export view, showing the selected indicator alongside amount spent."; }
      if (status) { status.textContent = "No partner-country data available for this selection."; status.style.color = "#a3412d"; }
      return;
    }

    if (note) {
      note.textContent = metricKey === "amount"
        ? "Countries are ranked from strongest to weakest by amount-spent score, scaled relative to the largest partner-country trade value."
        : "Countries are ranked from best to worst using a score that blends 60% trade-value strength with 40% indicator efficiency per amount spent.";
    }

    var bodyStyle   = getComputedStyle(document.body);
    var tooltipBg   = bodyStyle.getPropertyValue("--bg-primary").trim()   || "#fff";
    var tooltipText = bodyStyle.getPropertyValue("--text-primary").trim() || "#333";

    var categories       = rows.map(function (r) { return countryFullName(r.partner); });
    var showAmountSeries = metricKey !== "amount";

    var metricSeries = rows.map(function (r) {
      return { value: r.metricValue, amountValue: r.amountValue, score: r.score, intensity: r.intensity };
    });
    var amountSeries = rows.map(function (r) {
      return { value: r.amountValue, metricValue: r.metricValue, score: r.score, intensity: r.intensity };
    });

    if (!_chartInstance) { return; }
    _chartInstance.setOption({
      animationDuration: 300,
      legend: {
        top: 10, left: "center", itemGap: 18,
        data: showAmountSeries ? [metric.label, amountMetric.label] : [amountMetric.label]
      },
      grid: { left: 88, right: 88, top: 62, bottom: 28, containLabel: true },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        confine: true,
        backgroundColor: tooltipBg,
        textStyle: { color: tooltipText },
        formatter: function (params) {
          var lines = ["<b>" + params[0].axisValue + "</b>"];
          params.forEach(function (item) {
            var mk = item.seriesName === amountMetric.label ? "amount" : metricKey;
            lines.push(item.marker + item.seriesName + ": <b>" + _fmtValue(item.value, mk, year, currency) + "</b>");
          });
          var source = params[0] && params[0].data ? params[0].data : null;
          if (source) {
            lines.push("Score: <b>" + _fmtScore(source.score) + "</b>");
            if (metricKey !== "amount") {
              lines.push("Indicator per " + _metricUnit("amount", currency) + ": <b>" +
                _fmtCompactValue(_convertIntensityPerCurrency(source.intensity, year, currency),
                  metricKey, year, currency) + "</b>");
            }
          }
          return lines.join("<br/>");
        }
      },
      yAxis: { type: "category", inverse: true, axisTick: { show: false }, data: categories },
      xAxis: showAmountSeries ? [
        {
          type: "value",
          name: metric.label + " (" + _metricUnit(metricKey, currency) + ")",
          position: "top",
          nameTextStyle: { padding: [0, 0, 8, 0] },
          axisLabel: { formatter: function (v) { return _fmtAxisTick(v, metricKey, year, currency); } }
        },
        {
          type: "value",
          name: amountMetric.label + " (" + _metricUnit("amount", currency) + ")",
          position: "bottom",
          nameTextStyle: { padding: [0, 0, 8, 0] },
          axisLabel: { formatter: function (v) { return _fmtAxisTick(v, "amount", year, currency); } }
        }
      ] : [
        {
          type: "value",
          name: amountMetric.label + " (" + _metricUnit("amount", currency) + ")",
          position: "bottom",
          nameTextStyle: { padding: [0, 0, 8, 0] },
          axisLabel: { formatter: function (v) { return _fmtAxisTick(v, "amount", year, currency); } }
        }
      ],
      series: showAmountSeries ? [
        {
          name: metric.label, type: "bar", xAxisIndex: 0, data: metricSeries,
          itemStyle: { color: "#2563eb" }, barMaxWidth: 18, barGap: "20%"
        },
        {
          name: amountMetric.label, type: "bar", xAxisIndex: 1, data: amountSeries,
          itemStyle: { color: "#f59e0b" }, barMaxWidth: 18,
          label: {
            show: true, position: "right", distance: 10, color: "#333", fontWeight: 600,
            formatter: function (params) { return "Score " + _fmtScore(params.data.score); }
          }
        }
      ] : [
        {
          name: amountMetric.label, type: "bar", data: amountSeries,
          itemStyle: { color: "#f59e0b" }, barMaxWidth: 22,
          label: {
            show: true, position: "right", distance: 10, color: "#333", fontWeight: 600,
            formatter: function (params) { return "Score " + _fmtScore(params.data.score); }
          }
        }
      ]
    }, true);
    _chartInstance.resize();

    if (status) {
      status.textContent = "Top 10 " + activeSelection.flow +
        " partner countries ranked best to worst for " +
        countryFullName(activeSelection.country) + " " + activeSelection.year + ".";
      status.style.color = "";
    }
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  return {
    countryFullName:      countryFullName,
    initCountryNameSwap:  initCountryNameSwap,
    buildPartnerBreakdown:  buildPartnerBreakdown,
    buildBalanceBreakdown:  buildBalanceBreakdown,
    initChart:              initChart,
    render:               render,
    resize:               resize
  };

})();
