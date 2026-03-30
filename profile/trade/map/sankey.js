(function () {
  const YEARS_BY_COUNTRY = {
    AU: ["2019"],
    BR: ["2019"],
    CA: ["2019"],
    CN: ["2019", "2022"],
    DE: ["2019", "2022"],
    FR: ["2019"],
    GB: ["2019"],
    IN: ["2019", "2022"],
    IT: ["2019"],
    JP: ["2019"],
    KR: ["2019"],
    RU: ["2019", "2022"],
    US: ["2019", "2020", "2021", "2022"],
    WM: ["2019", "2022"]
  };
  const COUNTRIES = Object.keys(YEARS_BY_COUNTRY);
  const DEFAULT_SELECTION = { country: "US", year: "2022" };
  const SOURCE_LIMIT = 5;
  const EXCLUDED_SOURCES = ["WHOLE", "CONST"];
  const DATA_BASES = [
    "https://cdn.jsdelivr.net/gh/ModelEarth/trade-data@main",
    "https://raw.githubusercontent.com/ModelEarth/trade-data/main"
  ];
  const IMPACT_BASE_COLUMNS = new Set([
    "trade_id", "year", "region1", "region2", "industry1", "industry2",
    "amount", "total_impact_value", "factor_count", "unique_factors"
  ]);
  const RESOURCE_BASE_COLUMNS = new Set([
    "trade_id", "year", "region1", "region2", "industry1", "industry2",
    "amount", "total_resources_value", "resources_count", "unique_resources_factors"
  ]);
  const DEFAULT_INDICATORS = ["air_emissions", "employment"];
  const panelConfigs = [
    {
      kind: "impact",
      title: "Impact Flow 1",
      selectable: true,
      defaultIndicatorIndex: 0,
      note: "trade_impact.csv",
      stats: [
        { key: "total", label: "Displayed Total" },
        { key: "scope", label: "Industry1 Scope" },
        { key: "largest", label: "Largest Link" }
      ]
    },
    {
      kind: "impact",
      title: "Impact Flow 2",
      selectable: true,
      defaultIndicatorIndex: 1,
      note: "trade_impact.csv",
      stats: [
        { key: "total", label: "Displayed Total" },
        { key: "scope", label: "Industry1 Scope" },
        { key: "largest", label: "Largest Link" }
      ]
    },
    {
      kind: "resource-flow",
      title: "Resource Flow",
      selectable: false,
      note: "trade_resource.csv",
      stats: [
        { key: "total", label: "Displayed Total" },
        { key: "scope", label: "Industry1 Scope" },
        { key: "largest", label: "Largest Link" }
      ]
    },
    {
      kind: "resource-mix",
      title: "Resource Mix",
      selectable: false,
      note: "trade_resource.csv",
      stats: [
        { key: "total", label: "Visible Buckets" },
        { key: "scope", label: "Dominant Bucket" },
        { key: "largest", label: "Spotlight Flow" }
      ]
    }
  ];

  const chartGrid = document.getElementById("chart-grid");
  const countryInput = document.getElementById("country-input");
  const yearInput = document.getElementById("year-input");
  const countryOptions = document.getElementById("country-options");
  const yearOptions = document.getElementById("year-options");
  const statusText = document.getElementById("status-text");
  const selectionPill = document.getElementById("selection-pill");
  const rulePill = document.getElementById("rule-pill");
  const pageTitle = document.getElementById("page-title");
  const restorePanelsButton = document.getElementById("restore-panels");
  const hoverTooltip = document.getElementById("hover-tooltip");
  const clickTooltip = document.getElementById("click-tooltip");

  if (!chartGrid || !countryInput || !yearInput || !hoverTooltip || !clickTooltip) {
    return;
  }

  const compactFormatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2
  });
  const exactFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2
  });

  let activeSelection = {
    countries: [DEFAULT_SELECTION.country],
    years: [DEFAULT_SELECTION.year],
    pairs: [{ country: DEFAULT_SELECTION.country, year: DEFAULT_SELECTION.year }]
  };
  let loadRequestId = 0;
  let selectedMark = null;
  let impactData = null;
  let resourceData = null;
  let currentIndustryLookup = {};
  const industryLookupCache = {};
  const panels = [];

  function parseHashFallback() {
    const rawHash = window.location.hash.replace(/^#/, "");
    const params = {};
    if (!rawHash) {
      return params;
    }

    rawHash.split("&").forEach(function (segment) {
      if (!segment) {
        return;
      }
      const parts = segment.split("=");
      const key = decodeURIComponent(parts[0] || "").trim();
      const value = decodeURIComponent(parts.slice(1).join("=") || "").trim();
      if (key) {
        params[key] = value;
      }
    });
    return params;
  }

  function getHashValues() {
    if (typeof getHash === "function") {
      return getHash() || {};
    }
    return parseHashFallback();
  }

  function splitList(value) {
    return String(value || "")
      .split(",")
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);
  }

  function uniqueList(items) {
    return Array.from(new Set(items));
  }

  function getAllYears() {
    const years = new Set();
    Object.keys(YEARS_BY_COUNTRY).forEach(function (country) {
      (YEARS_BY_COUNTRY[country] || []).forEach(function (year) {
        years.add(String(year));
      });
    });
    return Array.from(years).sort();
  }

  function sanitizeSelection(rawSelection) {
    const requestedCountries = uniqueList(
      splitList(rawSelection.countries || rawSelection.country).map(function (country) {
        return country.toUpperCase();
      })
    );
    const validCountries = requestedCountries.filter(function (country) {
      return COUNTRIES.includes(country);
    });
    const countries = validCountries.length ? validCountries : [DEFAULT_SELECTION.country];

    const requestedYears = uniqueList(
      splitList(rawSelection.years || rawSelection.year).map(function (year) {
        return String(year);
      })
    );
    const validYears = requestedYears.filter(function (year) {
      return getAllYears().includes(year);
    });
    const years = validYears.length ? validYears : [DEFAULT_SELECTION.year];

    const pairs = [];
    countries.forEach(function (country) {
      years.forEach(function (year) {
        if ((YEARS_BY_COUNTRY[country] || []).includes(year)) {
          pairs.push({ country: country, year: year });
        }
      });
    });

    if (!pairs.length) {
      return {
        countries: [DEFAULT_SELECTION.country],
        years: [DEFAULT_SELECTION.year],
        pairs: [{ country: DEFAULT_SELECTION.country, year: DEFAULT_SELECTION.year }]
      };
    }

    return {
      countries: countries,
      years: years,
      pairs: pairs
    };
  }

  function getSelectionFromInputs() {
    return sanitizeSelection({
      countries: countryInput.value,
      years: yearInput.value
    });
  }

  function syncInputsToSelection(selection) {
    countryInput.value = selection.countries.join(",");
    yearInput.value = selection.years.join(",");
  }

  function buildHashString(selection) {
    return [
      "country=" + encodeURIComponent(selection.countries.join(",")),
      "year=" + encodeURIComponent(selection.years.join(","))
    ].join("&");
  }

  function syncHashToSelection(selection) {
    const nextHash = buildHashString(selection);
    if (window.location.hash.replace(/^#/, "") === nextHash) {
      return;
    }

    if (typeof updateHash === "function") {
      updateHash({
        country: selection.countries.join(","),
        year: selection.years.join(",")
      });
      return;
    }

    window.location.hash = nextHash;
  }

  function populateDatalist(datalist, values) {
    datalist.innerHTML = "";
    values.forEach(function (value) {
      const option = document.createElement("option");
      option.value = value;
      datalist.appendChild(option);
    });
  }

  function parseCsvRows(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      const nextCharacter = text[index + 1];

      if (character === "\"") {
        if (inQuotes && nextCharacter === "\"") {
          cell += "\"";
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (!inQuotes && character === ",") {
        row.push(cell);
        cell = "";
        continue;
      }

      if (!inQuotes && (character === "\n" || character === "\r")) {
        if (character === "\r" && nextCharacter === "\n") {
          index += 1;
        }
        row.push(cell);
        if (row.some(function (value) {
          return value !== "";
        })) {
          rows.push(row);
        }
        row = [];
        cell = "";
        continue;
      }

      cell += character;
    }

    if (cell.length || row.length) {
      row.push(cell);
      rows.push(row);
    }

    if (!rows.length) {
      return [];
    }

    const headers = rows.shift().map(function (header) {
      return String(header || "").trim();
    });

    return rows
      .filter(function (values) {
        return values.length && values.some(function (value) {
          return String(value || "").trim() !== "";
        });
      })
      .map(function (values) {
        const entry = {};
        headers.forEach(function (header, headerIndex) {
          entry[header] = values[headerIndex] || "";
        });
        return entry;
      });
  }

  async function fetchFirstText(paths) {
    const errors = [];

    for (let pathIndex = 0; pathIndex < paths.length; pathIndex += 1) {
      const path = paths[pathIndex];
      for (let baseIndex = 0; baseIndex < DATA_BASES.length; baseIndex += 1) {
        const url = DATA_BASES[baseIndex] + "/" + path;
        try {
          const response = await fetch(url);
          if (!response.ok) {
            errors.push(url + " (" + response.status + ")");
            continue;
          }
          return {
            text: await response.text(),
            source: url
          };
        } catch (error) {
          errors.push(url + " (" + error.message + ")");
        }
      }
    }

    throw new Error("No matching source found. Tried " + errors.slice(0, 4).join(" | "));
  }

  function getImpactPaths(pair) {
    return [
      "year/" + pair.year + "/" + pair.country + "/trade_impact.csv",
      "year/" + pair.year + "/" + pair.country + "/domestic/trade_impact.csv"
    ];
  }

  function getResourcePaths(pair) {
    return [
      "year/" + pair.year + "/" + pair.country + "/trade_resource.csv",
      "year/" + pair.year + "/" + pair.country + "/domestic/trade_resource.csv"
    ];
  }

  function isExcludedIndustry(label) {
    const normalized = String(label || "").trim().toUpperCase();
    return EXCLUDED_SOURCES.some(function (excluded) {
      return excluded === normalized;
    });
  }

  function formatSelectionSummary() {
    return activeSelection.countries.join(", ") + " / " + activeSelection.years.join(", ");
  }

  function startCase(text) {
    return String(text || "")
      .split(" ")
      .filter(Boolean)
      .map(function (part) {
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      })
      .join(" ");
  }

  function titleizeLabel(label) {
    if (currentIndustryLookup[label] && currentIndustryLookup[label].name) {
      return currentIndustryLookup[label].name;
    }

    const replacements = {
      air_emissions: "Air Emissions",
      employment: "Employment",
      energy: "Energy",
      land: "Land",
      material: "Material",
      water: "Water",
      CO2_total: "CO2 Total",
      CH4_total: "CH4 Total",
      N2O_total: "N2O Total",
      NOX_total: "NOX Total",
      Water_total: "Water Total",
      Employment_total: "Employment Total",
      Energy_total: "Energy Total",
      Land_total: "Land Total",
      impact_intensity: "Impact Intensity",
      resources_intensity: "Resource Intensity",
      "natural_resource/water": "Water",
      "natural_resource/energy": "Energy",
      "natural_resource/land": "Land",
      "resources_Water_Consumption": "Water Consumption",
      "resources_Water_Withdrawal": "Water Withdrawal",
      "resources_Energy": "Energy",
      "resources_Land_Crops": "Land Crops",
      "resources_Land_Forest": "Land Forest",
      "resources_Land_Other": "Land Other",
      "resources_Crops": "Crops",
      "emission/air": "Air Emissions"
    };

    if (replacements[label]) {
      return replacements[label];
    }

    return startCase(
      String(label || "")
        .replace(/^resources_/, "")
        .replace(/^natural_resource\//, "")
        .replace(/^emission\//, "")
        .replace(/_/g, " ")
        .replace(/\//g, " ")
    );
  }

  function formatSectorDetail(label) {
    if (currentIndustryLookup[label] && currentIndustryLookup[label].name) {
      return currentIndustryLookup[label].name + " (" + label + ")";
    }
    return titleizeLabel(label);
  }

  function formatFlowLabel(source, target) {
    return titleizeLabel(source) + " -> " + titleizeLabel(target);
  }

  function formatCompact(value) {
    return compactFormatter.format(Number(value) || 0);
  }

  function formatExact(value) {
    return exactFormatter.format(Number(value) || 0);
  }

  function hashHue(text) {
    let hash = 0;
    for (let index = 0; index < text.length; index += 1) {
      hash = (hash << 5) - hash + text.charCodeAt(index);
      hash |= 0;
    }
    return Math.abs(hash) % 360;
  }

  function colorFor(label, alpha) {
    return "hsla(" + hashHue(label) + ", 62%, 48%, " + alpha + ")";
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    if (typeof text === "string") {
      element.textContent = text;
    }
    return element;
  }

  function appendTitle(node, text) {
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = text;
    node.appendChild(title);
  }

  function updateStatus(message, isError) {
    statusText.textContent = message;
    statusText.dataset.state = isError ? "error" : "default";
  }

  function renderTooltip(tooltip, title, rows) {
    tooltip.innerHTML = "";
    const heading = createElement("div", "tooltip-title", title);
    const body = createElement("div", "tooltip-body");
    (rows || []).forEach(function (row) {
      const tooltipRow = createElement("div", "tooltip-row");
      tooltipRow.append(
        createElement("div", "tooltip-key", row.label),
        createElement("div", "tooltip-value", row.value)
      );
      body.appendChild(tooltipRow);
    });
    tooltip.append(heading, body);
  }

  function clampTooltipPosition(x, y, tooltip) {
    const margin = 14;
    const rect = tooltip.getBoundingClientRect();
    const maxLeft = window.innerWidth - rect.width - margin;
    const maxTop = window.innerHeight - rect.height - margin;
    return {
      left: Math.max(margin, Math.min(x, maxLeft)),
      top: Math.max(margin, Math.min(y, maxTop))
    };
  }

  function showTooltip(tooltip, title, rows, x, y) {
    renderTooltip(tooltip, title, rows);
    tooltip.classList.add("is-visible");
    const position = clampTooltipPosition(x, y, tooltip);
    tooltip.style.left = position.left + "px";
    tooltip.style.top = position.top + "px";
    tooltip.setAttribute("aria-hidden", "false");
  }

  function hideTooltip(tooltip) {
    tooltip.classList.remove("is-visible");
    tooltip.setAttribute("aria-hidden", "true");
  }

  function resetDetailPanels() {
    if (selectedMark) {
      selectedMark.classList.remove("is-selected");
      selectedMark = null;
    }
    hideTooltip(hoverTooltip);
    hideTooltip(clickTooltip);
  }

  function wireInteractiveMark(mark, hoverRowsFactory, clickRowsFactory) {
    mark.classList.add("interactive-mark");

    mark.addEventListener("mouseenter", function (event) {
      showTooltip(hoverTooltip, "Hover Preview", hoverRowsFactory(), event.clientX + 18, event.clientY + 18);
    });
    mark.addEventListener("mousemove", function (event) {
      showTooltip(hoverTooltip, "Hover Preview", hoverRowsFactory(), event.clientX + 18, event.clientY + 18);
    });
    mark.addEventListener("mouseleave", function () {
      hideTooltip(hoverTooltip);
    });
    mark.addEventListener("click", function (event) {
      if (selectedMark) {
        selectedMark.classList.remove("is-selected");
      }
      selectedMark = mark;
      selectedMark.classList.add("is-selected");
      showTooltip(clickTooltip, "Pinned Detail", clickRowsFactory(), event.clientX + 20, event.clientY + 20);
    });
  }

  function updateHeroMeta() {
    selectionPill.textContent = "Selection: " + formatSelectionSummary();
    rulePill.textContent =
      "Visible flows keep the top " + SOURCE_LIMIT + " links after removing " +
      EXCLUDED_SOURCES.join(" and ");
    pageTitle.textContent = "Trade Impact And Resource Dashboard";
  }

  function cacheIndustryLookup(year, lookup) {
    industryLookupCache[year] = lookup || {};
    return industryLookupCache[year];
  }

  async function loadIndustryLookupForYear(year) {
    if (industryLookupCache[year]) {
      return industryLookupCache[year];
    }

    try {
      const result = await fetchFirstText(["year/" + year + "/industry.csv"]);
      const lookup = {};
      parseCsvRows(result.text).forEach(function (row) {
        const industryId = String(row.industry_id || "").trim();
        if (!industryId) {
          return;
        }
        lookup[industryId] = {
          name: String(row.name || "").trim(),
          category: String(row.category || "").trim()
        };
      });
      return cacheIndustryLookup(year, lookup);
    } catch (error) {
      return cacheIndustryLookup(year, {});
    }
  }

  async function loadIndustryLookupForSelection(selection) {
    const years = uniqueList(selection.years.map(String));
    await Promise.all(years.map(loadIndustryLookupForYear));
    currentIndustryLookup = {};
    years.forEach(function (year) {
      const lookup = industryLookupCache[year] || {};
      Object.keys(lookup).forEach(function (industryId) {
        currentIndustryLookup[industryId] = lookup[industryId];
      });
    });
  }

  async function loadImpactSelection(pair) {
    try {
      const result = await fetchFirstText(getImpactPaths(pair));
      const rows = parseCsvRows(result.text);
      return {
        selection: pair,
        source_csv: result.source,
        rows: rows,
        indicatorColumns: rows.length
          ? Object.keys(rows[0]).filter(function (key) {
              return !IMPACT_BASE_COLUMNS.has(key);
            })
          : []
      };
    } catch (error) {
      return {
        selection: pair,
        source_csv: "",
        rows: [],
        indicatorColumns: [],
        error: error.message
      };
    }
  }

  async function loadResourceSelection(pair) {
    try {
      const result = await fetchFirstText(getResourcePaths(pair));
      const rows = parseCsvRows(result.text);
      return {
        selection: pair,
        source_csv: result.source,
        rows: rows,
        factorColumns: rows.length
          ? Object.keys(rows[0]).filter(function (key) {
              return !RESOURCE_BASE_COLUMNS.has(key);
            })
          : []
      };
    } catch (error) {
      return {
        selection: pair,
        source_csv: "",
        rows: [],
        factorColumns: [],
        error: error.message
      };
    }
  }

  function aggregateLinks(rawLinks, includeImpactTotals) {
    const grouped = new Map();

    rawLinks.forEach(function (link) {
      const key = [link.source, link.target].join("||");
      if (!grouped.has(key)) {
        grouped.set(key, {
          trade_id: key,
          source: link.source,
          target: link.target,
          value: 0,
          amount: 0,
          trade_count: 0,
          selection_labels: [],
          total_impact_value: 0
        });
      }

      const current = grouped.get(key);
      current.value += Number(link.value) || 0;
      current.amount += Number(link.amount) || 0;
      current.trade_count += 1;
      if (link.selection_label && !current.selection_labels.includes(link.selection_label)) {
        current.selection_labels.push(link.selection_label);
      }
      if (includeImpactTotals) {
        current.total_impact_value += Number(link.total_impact_value) || 0;
      }
    });

    return Array.from(grouped.values()).sort(function (left, right) {
      return right.value - left.value || left.source.localeCompare(right.source) || left.target.localeCompare(right.target);
    });
  }

  function buildTopSources(rawLinks, limit) {
    const totals = new Map();
    rawLinks.forEach(function (link) {
      totals.set(link.source, (totals.get(link.source) || 0) + Number(link.value || 0));
    });

    return Array.from(totals.entries())
      .sort(function (left, right) {
        return right[1] - left[1] || left[0].localeCompare(right[0]);
      })
      .slice(0, limit)
      .map(function (entry) {
        return entry[0];
      });
  }

  function combineImpactSelections(entries) {
    const validEntries = entries.filter(function (entry) {
      return entry.rows && entry.rows.length;
    });

    if (!validEntries.length) {
      return null;
    }

    const indicatorSet = new Set();
    validEntries.forEach(function (entry) {
      entry.indicatorColumns.forEach(function (indicator) {
        indicatorSet.add(indicator);
      });
    });

    const combined = {
      meta: {
        countries: activeSelection.countries.slice(),
        years: activeSelection.years.slice(),
        selection_count: activeSelection.pairs.length,
        source_limit: SOURCE_LIMIT,
        excluded_sources: EXCLUDED_SOURCES.slice()
      },
      indicatorColumns: Array.from(indicatorSet),
      defaults: DEFAULT_INDICATORS.slice(),
      dataset: {}
    };

    combined.indicatorColumns.forEach(function (indicator) {
      const rawLinks = [];

      validEntries.forEach(function (entry) {
        entry.rows.forEach(function (row) {
          const source = String(row.industry1 || "").trim();
          const target = String(row.industry2 || "").trim();
          const value = Number(row[indicator]) || 0;
          if (!source || !target || !value || isExcludedIndustry(source) || isExcludedIndustry(target)) {
            return;
          }
          rawLinks.push({
            trade_id: entry.selection.year + ":" + entry.selection.country + ":" + row.trade_id,
            selection_label: entry.selection.country + " " + entry.selection.year,
            source: source,
            target: target,
            value: value,
            amount: Number(row.amount) || 0,
            total_impact_value: Number(row.total_impact_value) || 0
          });
        });
      });

      const topSources = buildTopSources(rawLinks, SOURCE_LIMIT);
      combined.dataset[indicator] = {
        links: aggregateLinks(rawLinks.filter(function (link) {
          return topSources.includes(link.source);
        }), true),
        top_sources: topSources
      };
    });

    return combined;
  }

  function bucketNameForFactor(factor) {
    const normalized = String(factor || "").toLowerCase();
    if (normalized.indexOf("water") >= 0) {
      return "Water";
    }
    if (normalized.indexOf("energy") >= 0) {
      return "Energy";
    }
    if (normalized.indexOf("land") >= 0) {
      return "Land";
    }
    if (normalized.indexOf("crops") >= 0) {
      return "Crops";
    }
    if (normalized.indexOf("employment") >= 0) {
      return "Employment";
    }
    if (normalized.indexOf("air") >= 0) {
      return "Air";
    }
    return titleizeLabel(factor);
  }

  function combineResourceSelections(entries) {
    const validEntries = entries.filter(function (entry) {
      return entry.rows && entry.rows.length;
    });

    if (!validEntries.length) {
      return null;
    }

    const rawLinks = [];
    const bucketMap = new Map();

    validEntries.forEach(function (entry) {
      entry.rows.forEach(function (row) {
        const source = String(row.industry1 || "").trim();
        const target = String(row.industry2 || "").trim();
        const totalValue = Number(row.total_resources_value) || 0;
        if (!source || !target || !totalValue || isExcludedIndustry(source) || isExcludedIndustry(target)) {
          return;
        }

        rawLinks.push({
          trade_id: entry.selection.year + ":" + entry.selection.country + ":" + row.trade_id,
          selection_label: entry.selection.country + " " + entry.selection.year,
          source: source,
          target: target,
          value: totalValue,
          amount: Number(row.amount) || 0
        });

        entry.factorColumns.forEach(function (factor) {
          const factorValue = Number(row[factor]) || 0;
          if (!factorValue) {
            return;
          }

          const bucketName = bucketNameForFactor(factor);
          if (!bucketMap.has(bucketName)) {
            bucketMap.set(bucketName, {
              name: bucketName,
              value: 0,
              source_factor: factor,
              spotlight: null
            });
          }

          const bucket = bucketMap.get(bucketName);
          bucket.value += factorValue;
          if (!bucket.source_factor) {
            bucket.source_factor = factor;
          }
          if (!bucket.spotlight || factorValue > bucket.spotlight.value) {
            bucket.spotlight = {
              trade_id: entry.selection.year + ":" + entry.selection.country + ":" + row.trade_id,
              source: source,
              target: target,
              amount: Number(row.amount) || 0,
              value: factorValue,
              factor: factor,
              selection_label: entry.selection.country + " " + entry.selection.year
            };
          }
        });
      });
    });

    const topSources = buildTopSources(rawLinks, SOURCE_LIMIT);
    return {
      source_csv: validEntries.length === 1 ? validEntries[0].source_csv : "multiple trade_resource.csv files",
      top_sources: topSources,
      flow_links: aggregateLinks(rawLinks.filter(function (link) {
        return topSources.includes(link.source);
      }), false),
      summary_mix: Array.from(bucketMap.values()).sort(function (left, right) {
        return right.value - left.value || left.name.localeCompare(right.name);
      })
    };
  }

  function indicatorColumns() {
    return impactData && impactData.indicatorColumns ? impactData.indicatorColumns : DEFAULT_INDICATORS.slice();
  }

  function defaultIndicators() {
    const defaults = impactData && impactData.defaults ? impactData.defaults : DEFAULT_INDICATORS;
    return defaults.length ? defaults.slice(0, 2) : indicatorColumns().slice(0, 2);
  }

  function setIndicatorOptions(select, selectedValue) {
    select.innerHTML = "";
    indicatorColumns().forEach(function (column) {
      const option = document.createElement("option");
      option.value = column;
      option.textContent = titleizeLabel(column);
      if (column === selectedValue) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  }

  function setPanelStats(panelState, values) {
    panelState.config.stats.forEach(function (stat) {
      panelState.statValues[stat.key].textContent = values[stat.key] || "Awaiting load";
    });
  }

  function showEmpty(panelState, message) {
    panelState.title.textContent = panelState.config.title;
    panelState.subtitle.textContent = message;
    setPanelStats(panelState, {});
    panelState.svg.innerHTML = "";

    const empty = document.createElementNS("http://www.w3.org/2000/svg", "text");
    empty.setAttribute("x", "590");
    empty.setAttribute("y", "230");
    empty.setAttribute("text-anchor", "middle");
    empty.setAttribute("fill", "#59606d");
    empty.textContent = message;
    panelState.svg.appendChild(empty);
  }

  function buildLayout(links) {
    const sourceTotals = new Map();
    const targetTotals = new Map();
    let totalValue = 0;

    links.forEach(function (link) {
      totalValue += link.value;
      sourceTotals.set(link.source, (sourceTotals.get(link.source) || 0) + link.value);
      targetTotals.set(link.target, (targetTotals.get(link.target) || 0) + link.value);
    });

    const width = 1180;
    const height = 460;
    const top = 24;
    const bottom = 24;
    const nodeWidth = 18;
    const leftX = 280;
    const rightX = width - 280 - nodeWidth;
    const padSource = Math.max(8, Math.min(18, 220 / Math.max(sourceTotals.size, 1)));
    const padTarget = Math.max(8, Math.min(18, 220 / Math.max(targetTotals.size, 1)));
    const innerHeightSources = height - top - bottom - padSource * Math.max(sourceTotals.size - 1, 0);
    const innerHeightTargets = height - top - bottom - padTarget * Math.max(targetTotals.size - 1, 0);
    const scale = Math.min(
      innerHeightSources / Math.max(totalValue, 1),
      innerHeightTargets / Math.max(totalValue, 1)
    );

    const sourceNodes = Array.from(sourceTotals.entries())
      .map(function (entry) {
        return { label: entry[0], total: entry[1] };
      })
      .sort(function (left, right) {
        return right.total - left.total || left.label.localeCompare(right.label);
      });

    const targetNodes = Array.from(targetTotals.entries())
      .map(function (entry) {
        return { label: entry[0], total: entry[1] };
      })
      .sort(function (left, right) {
        return right.total - left.total || left.label.localeCompare(right.label);
      });

    let sourceY = top;
    sourceNodes.forEach(function (node) {
      node.x = leftX;
      node.y = sourceY;
      node.height = node.total * scale;
      sourceY += node.height + padSource;
    });

    let targetY = top;
    targetNodes.forEach(function (node) {
      node.x = rightX;
      node.y = targetY;
      node.height = node.total * scale;
      targetY += node.height + padTarget;
    });

    const sourceMap = new Map(sourceNodes.map(function (node) {
      return [node.label, node];
    }));
    const targetMap = new Map(targetNodes.map(function (node) {
      return [node.label, node];
    }));
    const sourceOffsets = new Map();
    const targetOffsets = new Map();

    return {
      nodeWidth: nodeWidth,
      sourceNodes: sourceNodes,
      targetNodes: targetNodes,
      links: links.map(function (link) {
        const sourceNode = sourceMap.get(link.source);
        const targetNode = targetMap.get(link.target);
        const thickness = link.value * scale;
        const sourceOffset = sourceOffsets.get(link.source) || 0;
        const targetOffset = targetOffsets.get(link.target) || 0;
        const sourceCenter = sourceNode.y + sourceOffset + thickness / 2;
        const targetCenter = targetNode.y + targetOffset + thickness / 2;
        const curve = (rightX - leftX) * 0.42;

        sourceOffsets.set(link.source, sourceOffset + thickness);
        targetOffsets.set(link.target, targetOffset + thickness);

        return {
          data: link,
          thickness: thickness,
          path: [
            "M", leftX + nodeWidth, sourceCenter,
            "C", leftX + nodeWidth + curve, sourceCenter,
            rightX - curve, targetCenter,
            rightX, targetCenter
          ].join(" ")
        };
      })
    };
  }

  function renderSankeyPanel(panelState, options) {
    panelState.title.textContent = options.title;
    panelState.subtitle.textContent = options.subtitle;
    setPanelStats(panelState, options.stats);
    panelState.svg.innerHTML = "";

    if (!options.links.length) {
      showEmpty(panelState, options.emptyMessage || "No eligible rows for this view.");
      return;
    }

    const layout = buildLayout(options.links);

    layout.links.forEach(function (link) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("class", "sankey-link");
      path.setAttribute("d", link.path);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", colorFor(link.data.source, 0.38));
      path.setAttribute("stroke-width", Math.max(link.thickness, 1));
      path.setAttribute("stroke-linecap", "round");
      appendTitle(path, options.title + "\n" + options.buildTitle(link.data));
      wireInteractiveMark(path, function () {
        return options.buildHoverRows(link.data);
      }, function () {
        return options.buildClickRows(link.data);
      });
      panelState.svg.appendChild(path);
    });

    layout.sourceNodes.forEach(function (node) {
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", node.x);
      rect.setAttribute("y", node.y);
      rect.setAttribute("width", layout.nodeWidth);
      rect.setAttribute("height", Math.max(node.height, 1));
      rect.setAttribute("rx", "6");
      rect.setAttribute("fill", colorFor(node.label, 0.9));
      rect.setAttribute("opacity", "0.92");
      appendTitle(rect, titleizeLabel(node.label) + " source total: " + formatExact(node.total));
      group.appendChild(rect);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "node-label");
      label.setAttribute("x", node.x - 10);
      label.setAttribute("y", node.y + node.height / 2 - 7);
      label.setAttribute("text-anchor", "end");
      label.textContent = titleizeLabel(node.label);
      group.appendChild(label);

      const value = document.createElementNS("http://www.w3.org/2000/svg", "text");
      value.setAttribute("class", "node-value");
      value.setAttribute("x", node.x - 10);
      value.setAttribute("y", node.y + node.height / 2 + 9);
      value.setAttribute("text-anchor", "end");
      value.textContent = formatCompact(node.total);
      group.appendChild(value);

      panelState.svg.appendChild(group);
    });

    layout.targetNodes.forEach(function (node) {
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", node.x);
      rect.setAttribute("y", node.y);
      rect.setAttribute("width", layout.nodeWidth);
      rect.setAttribute("height", Math.max(node.height, 1));
      rect.setAttribute("rx", "6");
      rect.setAttribute("fill", colorFor(node.label, 0.9));
      rect.setAttribute("opacity", "0.92");
      appendTitle(rect, titleizeLabel(node.label) + " target total: " + formatExact(node.total));
      group.appendChild(rect);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "node-label");
      label.setAttribute("x", node.x + layout.nodeWidth + 10);
      label.setAttribute("y", node.y + node.height / 2 - 7);
      label.setAttribute("text-anchor", "start");
      label.textContent = titleizeLabel(node.label);
      group.appendChild(label);

      const value = document.createElementNS("http://www.w3.org/2000/svg", "text");
      value.setAttribute("class", "node-value");
      value.setAttribute("x", node.x + layout.nodeWidth + 10);
      value.setAttribute("y", node.y + node.height / 2 + 9);
      value.setAttribute("text-anchor", "start");
      value.textContent = formatCompact(node.total);
      group.appendChild(value);

      panelState.svg.appendChild(group);
    });
  }

  function renderBarPanel(panelState, options) {
    panelState.title.textContent = options.title;
    panelState.subtitle.textContent = options.subtitle;
    setPanelStats(panelState, options.stats);
    panelState.svg.innerHTML = "";

    if (!options.items.length) {
      showEmpty(panelState, options.emptyMessage || "No resource mix available for this selection.");
      return;
    }

    const width = 1180;
    const height = 460;
    const left = 330;
    const right = 120;
    const top = 54;
    const barHeight = 28;
    const rowGap = 24;
    const plotWidth = width - left - right;
    const maxValue = Math.max.apply(null, options.items.map(function (item) {
      return item.value;
    }).concat([1]));

    [0, 0.25, 0.5, 0.75, 1].forEach(function (tick) {
      const x = left + plotWidth * tick;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("class", "bar-grid-line");
      line.setAttribute("x1", x);
      line.setAttribute("y1", top - 26);
      line.setAttribute("x2", x);
      line.setAttribute("y2", height - 30);
      panelState.svg.appendChild(line);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "bar-grid-text");
      label.setAttribute("x", x);
      label.setAttribute("y", top - 32);
      label.setAttribute("text-anchor", tick === 1 ? "end" : tick === 0 ? "start" : "middle");
      label.textContent = formatCompact(maxValue * tick);
      panelState.svg.appendChild(label);
    });

    options.items.forEach(function (item, index) {
      const y = top + index * (barHeight + rowGap);
      const barWidth = Math.max(4, plotWidth * (item.value / maxValue));

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "bar-label");
      label.setAttribute("x", left - 14);
      label.setAttribute("y", y + barHeight / 2 - 3);
      label.setAttribute("text-anchor", "end");
      label.textContent = item.name;
      panelState.svg.appendChild(label);

      const hint = document.createElementNS("http://www.w3.org/2000/svg", "text");
      hint.setAttribute("class", "bar-hint");
      hint.setAttribute("x", left - 14);
      hint.setAttribute("y", y + barHeight / 2 + 12);
      hint.setAttribute("text-anchor", "end");
      hint.textContent = titleizeLabel(item.sourceFactor || "");
      panelState.svg.appendChild(hint);

      const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      bar.setAttribute("class", "bar-mark");
      bar.setAttribute("x", left);
      bar.setAttribute("y", y);
      bar.setAttribute("width", barWidth);
      bar.setAttribute("height", barHeight);
      bar.setAttribute("rx", "10");
      bar.setAttribute("fill", colorFor(item.name, 0.82));
      appendTitle(bar, item.name + ": " + formatExact(item.value));
      wireInteractiveMark(bar, function () {
        return options.buildHoverRows(item);
      }, function () {
        return options.buildClickRows(item);
      });
      panelState.svg.appendChild(bar);

      const value = document.createElementNS("http://www.w3.org/2000/svg", "text");
      value.setAttribute("class", "bar-value");
      value.setAttribute("x", Math.min(left + barWidth + 10, width - 10));
      value.setAttribute("y", y + barHeight / 2 + 4);
      value.setAttribute("text-anchor", left + barWidth + 90 > width ? "end" : "start");
      if (left + barWidth + 90 > width) {
        value.setAttribute("x", width - 12);
      }
      value.textContent = formatCompact(item.value);
      panelState.svg.appendChild(value);
    });
  }

  function renderImpactPanel(panelState) {
    if (!impactData || !impactData.dataset) {
      showEmpty(panelState, "Choose one or more countries and years to load impact data.");
      return;
    }

    const fallbackIndicator =
      defaultIndicators()[panelState.config.defaultIndicatorIndex] ||
      indicatorColumns()[panelState.config.defaultIndicatorIndex] ||
      indicatorColumns()[0];
    const indicator = panelState.select && panelState.select.value ? panelState.select.value : fallbackIndicator;
    const indicatorData = impactData.dataset[indicator];
    const links = indicatorData && indicatorData.links ? indicatorData.links : [];

    if (!links.length) {
      showEmpty(panelState, "No eligible rows for this indicator.");
      return;
    }

    const total = links.reduce(function (sum, link) {
      return sum + link.value;
    }, 0);
    const topLink = links[0];
    const targetCount = new Set(links.map(function (link) {
      return link.target;
    })).size;
    const topSources = indicatorData.top_sources || [];

    renderSankeyPanel(panelState, {
      title: panelState.config.title + ": " + titleizeLabel(indicator) + " (" + formatSelectionSummary() + ")",
      subtitle:
        "Top " + SOURCE_LIMIT + " visible domestic links for " + formatSelectionSummary() +
        ", with " + EXCLUDED_SOURCES.join(" and ") + " removed from both source and target sectors.",
      links: links,
      stats: {
        total: formatCompact(total) + " (" + formatExact(total) + ")",
        scope: (topSources.length ? topSources.map(titleizeLabel).join(", ") : "No sources") + " | " + targetCount + " targets",
        largest: formatFlowLabel(topLink.source, topLink.target) + " (" + formatCompact(topLink.value) + ")"
      },
      buildTitle: function (link) {
        return [
          titleizeLabel(indicator) + ": " + formatExact(link.value),
          "Flow: " + formatFlowLabel(link.source, link.target),
          "Trades Combined: " + link.trade_count,
          "Trade Amount: " + formatExact(link.amount),
          "Total Impact Value: " + formatExact(link.total_impact_value)
        ].join("\n");
      },
      buildHoverRows: function (link) {
        return [
          { label: "Chart", value: panelState.config.title },
          { label: "Indicator", value: titleizeLabel(indicator) },
          { label: "Source", value: formatSectorDetail(link.source) },
          { label: "Target", value: formatSectorDetail(link.target) },
          { label: "Value", value: formatExact(link.value) }
        ];
      },
      buildClickRows: function (link) {
        return [
          { label: "Chart", value: panelState.config.title },
          { label: "Indicator", value: titleizeLabel(indicator) },
          { label: "Source", value: formatSectorDetail(link.source) },
          { label: "Target", value: formatSectorDetail(link.target) },
          { label: "Selections", value: link.selection_labels.join(", ") || "1 selection" },
          { label: "Trades", value: String(link.trade_count) },
          { label: "Amount", value: formatExact(link.amount) },
          { label: "Impact", value: formatExact(link.total_impact_value) }
        ];
      }
    });
  }
