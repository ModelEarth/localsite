// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
function getCSVRepoPath(year, country) {
  return "year/" + (year || "2022") + "/" + (country || "WM") + "/domestic/trade_impact.csv";
}

function getCSV_URL(year, country) {
  return "https://raw.githubusercontent.com/ModelEarth/trade-data/main/" + getCSVRepoPath(year, country);
}

function getCSVSourceURL(year, country) {
  return "https://github.com/ModelEarth/trade-data/blob/main/" + getCSVRepoPath(year, country);
}

function getIndustryRepoPath(year) {
  return "year/" + (year || "2022") + "/industry.csv";
}

function getIndustryURL(year) {
  return "https://raw.githubusercontent.com/ModelEarth/trade-data/main/" + getIndustryRepoPath(year);
}

function getCurrencyRatesURL() {
  return "https://raw.githubusercontent.com/ModelEarth/trade-data/main/concordance/eur_annual_rates.csv";
}

const SECTOR_NAMES = {
  AGRIC: "Agriculture",
  AGRI: "Agriculture",
  FORE: "Forestry",
  FISH: "Fishing",
  COAL: "Coal Mining",
  CRUDE: "Crude Oil & Gas",
  URAN: "Uranium Mining",
  IRON: "Iron Ore Mining",
  NFMET: "Non-ferrous Metal Ores",
  STONE: "Stone Quarrying",
  SALT: "Salt Mining",
  NATUR: "Natural Resources",
  MINNG: "Mining & Quarrying",
  FOOD: "Food Products",
  BEVER: "Beverages",
  TOBAC: "Tobacco",
  TEXTI: "Textiles",
  WEAR: "Wearing Apparel",
  LEATH: "Leather & Footwear",
  WOOD: "Wood Products",
  PAPER: "Paper & Pulp",
  PRINT: "Printing & Publishing",
  PETRO: "Petroleum Refining",
  NUCLE: "Nuclear Fuel",
  CHEMI: "Basic Chemicals",
  SPCHE: "Specialty Chemicals",
  PHARMA: "Pharmaceuticals",
  FERTL: "Fertilizers",
  RUBBE: "Rubber & Plastics",
  PLAST: "Plastics",
  GLASS: "Glass & Ceramics",
  CEMEN: "Cement & Concrete",
  STEEL: "Iron & Steel",
  NFMTL: "Non-ferrous Metals",
  METAL: "Fabricated Metals",
  MACHI: "Machinery & Equipment",
  OFMAC: "Office Machinery",
  ELECT: "Electrical Equipment",
  ELEC2: "Electricity",
  RADIO: "Radio & TV Equipment",
  MEDIC: "Medical Instruments",
  MOTOR: "Motor Vehicles",
  SHIPS: "Shipbuilding",
  AIRCR: "Aircraft",
  RAILW: "Railway Equipment",
  FURNI: "Furniture",
  RECYC: "Recycling",
  CONST: "Construction",
  DISTR: "Trade & Distribution",
  HOTEL: "Hotels & Restaurants",
  TRANS: "Transport Services",
  AIRTX: "Air Transport",
  WATRX: "Water Transport",
  POST: "Post & Telecom",
  FINAN: "Financial Services",
  INSUR: "Insurance",
  REALE: "Real Estate",
  RESEA: "Research & Development",
  PUBLI: "Public Administration",
  EDUCA: "Education",
  HEALT: "Health Services",
  SEWAG: "Sewage & Waste Treatment",
  GAS: "Gas Supply",
  WATR: "Water Supply",
  GASES: "Industrial Gases",
  TRAN1: "Land Transport",
  TRAN2: "Water Transport",
  TRAN3: "Air Transport",
  GASDI: "Gas Distribution",
  RETA1: "Retail Trade",
  PFERT: "Fertilizers & Nitrogen",
  POSTT: "Post & Telecommunications",
  ALUM1: "Aluminium Production",
  VEGET: "Vegetable & Animal Oils",
  BASIC: "Basic Pharmaceuticals",
  WHOLT: "Wholesale Trade",
  PAPPE: "Paper & Paperboard",
  COALT: "Coal & Lignite",
  COKNG: "Coke & Refined Petroleum",
  ELECTR: "Electricity Distribution",
  SEWWT: "Sewage & Waste Treatment",
  PUBAD: "Public Administration",
  ACTIV: "Business Activities",
  RENTS: "Renting of Machinery"
};

const CURRENCY_NAMES = {
  EUR: "Euro",
  USD: "US Dollar",
  JPY: "Japanese Yen",
  GBP: "British Pound",
  CHF: "Swiss Franc",
  SEK: "Swedish Krona",
  NOK: "Norwegian Krone",
  DKK: "Danish Krone",
  CZK: "Czech Koruna",
  PLN: "Polish Zloty",
  HUF: "Hungarian Forint",
  RON: "Romanian Leu",
  HRK: "Croatian Kuna",
  BGN: "Bulgarian Lev",
  TRY: "Turkish Lira",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  HKD: "Hong Kong Dollar",
  SGD: "Singapore Dollar",
  KRW: "South Korean Won",
  ZAR: "South African Rand",
  MXN: "Mexican Peso",
  INR: "Indian Rupee",
  CNY: "Chinese Renminbi",
  BRL: "Brazilian Real",
  IDR: "Indonesian Rupiah",
  ILS: "Israeli New Shekel",
  MYR: "Malaysian Ringgit",
  PHP: "Philippine Peso",
  THB: "Thai Baht",
  ISK: "Icelandic Krona",
  NZD: "New Zealand Dollar",
  RUB: "Russian Rouble"
};

const METRICS = {
  amount: { label: "Amount Spent", unit: "M EUR", scale: 1 },
  CO2_total: { label: "CO\u2082 Emissions", unit: "Gt CO\u2082", scale: 1e12 },
  Water_total: { label: "Water Use", unit: "Gm\u00B3", scale: 1e9 },
  Employment_total: { label: "Employment", unit: "M jobs", scale: 1e6 }
};

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let rawData = null;
let currentMetric = "amount";
let currentTopN = 15;
let currentTitleMode = "title";
let currentCurrency = "EUR";
let currentSelection = { year: "2022", country: "WM" };

const industryNamesByYear = {};
const currencyRatesByYear = {};
let availableCurrencies = ["EUR"];
let currencyRatesPromise = null;

// ---------------------------------------------------------------------------
// DOM
// ---------------------------------------------------------------------------
const chartDom = document.getElementById("sankey-chart");
const chart = echarts.init(chartDom);
const countrySelect = document.getElementById("country-select");
const yearSelect = document.getElementById("year-select");
const metricSelect = document.getElementById("metric-select");
const currencySelect = document.getElementById("currency-select");
const currencyLabel = document.getElementById("currency-label");
const titleModeSelect = document.getElementById("title-mode-select");
const topnSlider = document.getElementById("topn-slider");
const topnLabel = document.getElementById("topn-label");

window.addEventListener("resize", function () {
  chart.resize();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function normalizeCode(value) {
  return String(value || "").trim();
}

function parseNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function setStatus(message) {
  document.getElementById("sankey-status").textContent = message;
}

function updateCSVSourceLink(year, country) {
  const csvPath = getCSVRepoPath(year, country);
  const csvLink = document.getElementById("sankey-csv-link");
  const csvPathElem = document.getElementById("sankey-csv-path");
  if (csvLink) {
    csvLink.href = getCSVSourceURL(year, country);
  }
  if (csvPathElem) {
    csvPathElem.textContent = csvPath;
  }
}

function fetchText(url) {
  return fetch(url).then(function (response) {
    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }
    return response.text();
  });
}

function resolveIndustryNames(code) {
  const key = normalizeCode(code);
  const yearMap = industryNamesByYear[normalizeCode(currentSelection.year)] || {};
  const verbose = yearMap[key] || key;
  const title = SECTOR_NAMES[key] || String(verbose || "")
    .replace(/\s*\([^)]*\)\s*$/g, "")
    .split(";")[0]
    .trim() || key;
  return {
    code: key,
    title: title || key,
    verbose: verbose || title || key
  };
}

function sectorLabel(code) {
  const names = resolveIndustryNames(code);
  if (currentTitleMode === "short") {
    return names.code;
  }
  if (currentTitleMode === "verbose") {
    return names.verbose;
  }
  return names.title;
}

function displaySectorLabel(code) {
  const names = resolveIndustryNames(code);
  const label = sectorLabel(code);
  return label !== names.code ? label + " (" + names.code + ")" : names.code;
}

function wrapLabel(text, maxChars) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  if (!words.length) {
    return "";
  }
  const lines = [];
  let currentLine = "";
  words.forEach(function (word) {
    if (!currentLine) {
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= maxChars) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines.join("\n");
}

function metricUnit(metricKey) {
  if (metricKey === "amount") {
    return "M " + currentCurrency;
  }
  return (METRICS[metricKey] && METRICS[metricKey].unit) || "";
}

function metricScale(metricKey) {
  return (METRICS[metricKey] && METRICS[metricKey].scale) || 1;
}

function currencyRateForYear(year, currencyCode) {
  const currency = normalizeCode(currencyCode) || "EUR";
  if (currency === "EUR") {
    return 1;
  }
  const yearRates = currencyRatesByYear[normalizeCode(year)] || {};
  return parseNumber(yearRates[currency]) || 1;
}

function displayMetricValue(value, metricKey) {
  if (metricKey === "amount") {
    return parseNumber(value) * currencyRateForYear(currentSelection.year, currentCurrency);
  }
  return parseNumber(value);
}

function fmtValue(value, metricKey) {
  const scaled = displayMetricValue(value, metricKey) / metricScale(metricKey);
  const formatted = scaled >= 1000
    ? scaled.toLocaleString(undefined, { maximumFractionDigits: 0 })
    : scaled.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return formatted + "\u00A0" + metricUnit(metricKey);
}

function currencyName(code) {
  return CURRENCY_NAMES[normalizeCode(code)] || normalizeCode(code);
}

function syncCurrencyVisibility() {
  if (currencyLabel) {
    currencyLabel.style.display = currentMetric === "amount" ? "flex" : "none";
  }
}

function currenciesForYear(year) {
  const rates = currencyRatesByYear[normalizeCode(year)] || { EUR: 1 };
  return availableCurrencies.filter(function (currencyCode) {
    return currencyCode === "EUR" || parseNumber(rates[currencyCode]) > 0;
  });
}

function syncCurrencyOptions(year, preferredCurrency) {
  const supported = currenciesForYear(year);
  currencySelect.innerHTML = "";
  (supported.length ? supported : ["EUR"]).forEach(function (currencyCode) {
    const option = document.createElement("option");
    option.value = currencyCode;
    option.textContent = currencyCode + " - " + currencyName(currencyCode);
    currencySelect.appendChild(option);
  });
  currentCurrency = supported.includes(preferredCurrency) ? preferredCurrency : (supported[0] || "EUR");
  currencySelect.value = currentCurrency;
}

function loadIndustryNamesForYear(year) {
  const key = normalizeCode(year);
  if (!key || industryNamesByYear[key]) {
    return Promise.resolve();
  }
  return fetchText(getIndustryURL(year)).then(function (text) {
    const rows = d3.csvParse(text);
    const yearMap = {};
    rows.forEach(function (row) {
      const industryId = normalizeCode(row.industry_id);
      const name = String(row.name || "").trim();
      if (industryId) {
        yearMap[industryId] = name || industryId;
      }
    });
    industryNamesByYear[key] = yearMap;
  }).catch(function () {
    industryNamesByYear[key] = {};
  });
}

function loadCurrencyRates() {
  if (currencyRatesPromise) {
    return currencyRatesPromise;
  }

  currencyRatesPromise = fetchText(getCurrencyRatesURL()).then(function (text) {
    const rows = d3.csvParse(text);
    const columns = (rows.columns || []).filter(function (column) {
      return column !== "Year";
    });
    availableCurrencies = ["EUR"].concat(columns);
    rows.forEach(function (row) {
      const year = normalizeCode(row.Year);
      if (!year) {
        return;
      }
      const yearRates = { EUR: 1 };
      columns.forEach(function (currencyCode) {
        const rate = parseNumber(row[currencyCode]);
        if (rate > 0) {
          yearRates[currencyCode] = rate;
        }
      });
      currencyRatesByYear[year] = yearRates;
    });
  }).catch(function () {
    availableCurrencies = ["EUR"];
  });

  return currencyRatesPromise;
}

// ---------------------------------------------------------------------------
// Build Sankey data
// ---------------------------------------------------------------------------
function buildSankeyData(metricKey, topN) {
  const flowMap = new Map();
  rawData.forEach(function (row) {
    const source = normalizeCode(row.industry1);
    const target = normalizeCode(row.industry2);
    if (!source || !target || source === target) {
      return;
    }
    const value = parseNumber(row[metricKey]);
    if (value <= 0) {
      return;
    }
    const key = source + "\x00" + target;
    flowMap.set(key, (flowMap.get(key) || 0) + value);
  });

  const resolvedMap = new Map();
  flowMap.forEach(function (value, key) {
    const separator = key.indexOf("\x00");
    const source = key.slice(0, separator);
    const target = key.slice(separator + 1);
    const reverseKey = target + "\x00" + source;
    if (resolvedMap.has(reverseKey)) {
      if (value > resolvedMap.get(reverseKey)) {
        resolvedMap.delete(reverseKey);
        resolvedMap.set(key, value);
      }
    } else {
      resolvedMap.set(key, value);
    }
  });

  let links = Array.from(resolvedMap.entries())
    .sort(function (a, b) { return b[1] - a[1]; })
    .slice(0, topN)
    .map(function (entry) {
      const key = entry[0];
      const separator = key.indexOf("\x00");
      return {
        source: key.slice(0, separator),
        target: key.slice(separator + 1),
        value: entry[1]
      };
    });

  links = removeCycles(links);

  const nodeSet = new Set();
  links.forEach(function (link) {
    nodeSet.add(link.source);
    nodeSet.add(link.target);
  });

  return {
    nodes: Array.from(nodeSet).map(function (name) {
      return { name: name };
    }),
    links: links
  };
}

function findBackEdges(links) {
  const adjacency = new Map();
  links.forEach(function (link) {
    if (!adjacency.has(link.source)) {
      adjacency.set(link.source, []);
    }
    adjacency.get(link.source).push(link);
  });

  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map();
  const backEdges = [];

  function dfs(node) {
    color.set(node, GRAY);
    (adjacency.get(node) || []).forEach(function (link) {
      const nextColor = color.get(link.target) || WHITE;
      if (nextColor === GRAY) {
        backEdges.push(link);
      } else if (nextColor === WHITE) {
        dfs(link.target);
      }
    });
    color.set(node, BLACK);
  }

  const nodes = new Set();
  links.forEach(function (link) {
    nodes.add(link.source);
    nodes.add(link.target);
  });
  nodes.forEach(function (node) {
    if (!color.get(node)) {
      dfs(node);
    }
  });
  return backEdges;
}

function removeCycles(links) {
  let remaining = links.slice();
  for (let guard = 0; guard < links.length; guard += 1) {
    const backEdges = findBackEdges(remaining);
    if (!backEdges.length) {
      break;
    }
    const worst = backEdges.reduce(function (minEdge, edge) {
      return edge.value < minEdge.value ? edge : minEdge;
    });
    remaining = remaining.filter(function (link) {
      return link !== worst;
    });
  }
  return remaining;
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
function render() {
  if (!rawData) {
    return;
  }

  const metric = METRICS[currentMetric];
  const sankeyData = buildSankeyData(currentMetric, currentTopN);

  if (!sankeyData.links.length) {
    setStatus("No data available for this combination.");
    chart.clear();
    return;
  }

  chart.setOption({
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
      confine: true,
      formatter: function (params) {
        if (params.dataType === "edge") {
          return "<b>" + displaySectorLabel(params.data.source) + "</b>"
            + " &rarr; "
            + "<b>" + displaySectorLabel(params.data.target) + "</b><br/>"
            + metric.label + ": <b>" + fmtValue(params.data.value, currentMetric) + "</b>";
        }
        return "<b>" + displaySectorLabel(params.name) + "</b>";
      }
    },
    series: [{
      type: "sankey",
      layout: "none",
      layoutIterations: 32,
      emphasis: {
        focus: "adjacency"
      },
      nodeAlign: "left",
      nodeGap: 14,
      nodeWidth: 22,
      left: "1%",
      right: "8%",
      top: "2%",
      bottom: "2%",
      data: sankeyData.nodes,
      links: sankeyData.links,
      label: {
        position: "right",
        fontSize: 12,
        width: 150,
        overflow: "break",
        lineHeight: 14,
        align: "left",
        color: "#333",
        formatter: function (params) {
          return wrapLabel(sectorLabel(params.name), 24);
        }
      },
      lineStyle: {
        color: "gradient",
        opacity: 0.45,
        curveness: 0.5
      },
      itemStyle: {
        borderWidth: 1,
        borderColor: "#aaa"
      }
    }]
  }, true);

  chart.resize();
  setStatus(
    "Showing top\u00A0" + sankeyData.links.length + " flows by " + metric.label
      + " for " + currentSelection.country + " " + currentSelection.year
  );
}

// ---------------------------------------------------------------------------
// Hash and loading
// ---------------------------------------------------------------------------
function loadFromHash() {
  const hash = typeof getHash === "function" ? (getHash() || {}) : {};
  const year = hash.year || "2022";
  const country = hash.country || "WM";

  currentSelection = { year: year, country: country };
  if (countrySelect) {
    countrySelect.value = country;
  }
  if (yearSelect) {
    yearSelect.value = year;
  }

  syncCurrencyOptions(year, currentCurrency);
  updateCSVSourceLink(year, country);
  setStatus("Loading data...");
  chart.clear();
  rawData = null;

  Promise.all([
    loadIndustryNamesForYear(year),
    loadCurrencyRates(),
    d3.csv(getCSV_URL(year, country))
  ]).then(function (results) {
    rawData = results[2];
    syncCurrencyOptions(year, currentCurrency);
    render();
  }).catch(function (error) {
    setStatus("Error loading CSV: " + error.message);
  });
}

function initFilters() {
  syncCurrencyVisibility();
  syncCurrencyOptions(currentSelection.year, currentCurrency);
  topnSlider.value = String(currentTopN);
  topnLabel.textContent = String(currentTopN);
  metricSelect.value = currentMetric;
  titleModeSelect.value = currentTitleMode;

  countrySelect.addEventListener("change", function () {
    goHash({
      country: countrySelect.value,
      year: yearSelect.value
    });
  });

  yearSelect.addEventListener("change", function () {
    goHash({
      country: countrySelect.value,
      year: yearSelect.value
    });
  });

  metricSelect.addEventListener("change", function (event) {
    currentMetric = event.target.value;
    syncCurrencyVisibility();
    render();
  });

  currencySelect.addEventListener("change", function (event) {
    currentCurrency = event.target.value || "EUR";
    render();
  });

  titleModeSelect.addEventListener("change", function (event) {
    currentTitleMode = event.target.value || "title";
    render();
  });

  topnSlider.addEventListener("input", function (event) {
    currentTopN = parseInt(event.target.value, 10) || 15;
    topnLabel.textContent = String(currentTopN);
    render();
  });

  loadCurrencyRates().finally(function () {
    loadFromHash();
  });
}

document.addEventListener("hashChangeEvent", loadFromHash, false);
initFilters();
