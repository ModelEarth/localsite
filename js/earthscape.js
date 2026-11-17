// EARTHSCAPE
// A single function that calls multiple visualizations for a dataset

// Declare global chart variables so they can be accessed in resize handler
let timelineChart;
let lineAreaChart;
let manualSizingActive = false; // Flag to track if manual sizing is being used
const api_key = "AIzaSyCTI4Xz-UW_G2Q2RfknhcfdAnTHq5X5XuI";


function loadEarthScape(my) {
    earthscape_loadD3().then(function () {
        d3.csv(my.dataset).then(function (data) {
            console.log("File loaded " + my.dataset);
            earthscape_loadTabulator().then(function () {
                $(document).ready(function () {
                    earthscape_TableDisplay(my, data);
                });
            });
        });
    });
}

function loadEarthScape2(my) {
    // Displays the table once every year has loaded. Missing years are skipped.
    earthscape_loadYears(Object.assign({ startYear: 2017, endYear: 2021 }, my)).then(function (allData) {
        earthscape_loadTabulator().then(function () {
            $(document).ready(function () {
                earthscape_TableDisplay2(my, allData);
            });
        });
    });
}

// Loads one file per year into a single Tabulator grid, then resolves with {table, rows}.
// my.dataset   - URL with "this_is_year" in place of the year. An array of URLs is tried in order, e.g. local then GitHub.
// my.startYear - First year to look for (default 2018).
// my.endYear   - Last year to look for (default: the current year). Years not found are skipped, so new years appear on their own.
// my.parse     - Optional parse(text, year, url) returning a row or an array of rows. Default: CSV rows via d3.
// my.yearField - Field that receives the year when parse doesn't set it (default "Year").
// my.onData    - Optional onData(rows) to sort or add fields before display. May return a Promise, e.g. to fetch more per-year data.
// Also accepts the earthscape_TableDisplay options: my.columns, my.maxHeight, my.initialSort, my.index, my.layout, my.tableOptions.
function loadEarthScapeYears(my) {
    return earthscape_loadYears(my).then(function (loadedRows) {
        return Promise.resolve(my.onData ? my.onData(loadedRows) : loadedRows).then(function (result) {
            return result || loadedRows;
        });
    }).then(function (rows) {
        return Promise.all([earthscape_loadTabulator(), waitForElm("#" + my.elementID)]).then(function () {
            return { table: earthscape_TableDisplay(my, rows), rows: rows };
        });
    });
}

// Fetches each year's file in parallel and resolves with the parsed rows, oldest year first.
function earthscape_loadYears(my) {
    const startYear = parseInt(my.startYear || 2018, 10);
    const endYear = parseInt(my.endYear || new Date().getFullYear(), 10);
    const yearField = my.yearField || "Year";
    const urls = [].concat(my.dataset);
    const years = [];
    for (let year = startYear; year <= endYear; year++) years.push(year);

    const parserReady = my.parse ? Promise.resolve() : earthscape_loadD3();
    return parserReady
        .then(function () {
            return Promise.all(years.map(function (year) { return earthscape_fetchFirst(urls, year); }));
        })
        .then(function (results) {
            let rows = [];
            results.filter(Boolean).forEach(function (result) {
                const parsed = my.parse ? my.parse(result.text, result.year, result.url) : d3.csvParse(result.text);
                [].concat(parsed || []).forEach(function (row) {
                    if (row[yearField] === undefined) row[yearField] = result.year;
                    rows.push(row);
                });
            });
            return rows;
        });
}

// Resolves with {year, url, text} from the first URL that has the file, or null when no source has that year.
async function earthscape_fetchFirst(urls, year) {
    for (const pattern of urls) {
        const url = pattern.replace(/this_is_year/g, year);
        try {
            const response = await fetch(url);
            const type = response.headers.get("content-type") || "";
            // Some dev servers answer a missing file with an HTML page instead of a 404.
            if (!response.ok || (type.includes("text/html") && !/\.html?$/i.test(url))) continue;
            console.log("File loaded " + url);
            return { year: year, url: url, text: await response.text() };
        } catch (error) {
            // Source unreachable: try the next one.
        }
    }
    return null;
}

function earthscape_loadD3() {
    return new Promise(function (resolve) {
        loadScript(theroot + 'js/d3.v5.min.js', function () {
            waitForVariable('customD3loaded', resolve);
        });
    });
}

// Loads Tabulator when the page hasn't included it, preventing "ReferenceError: Tabulator is not defined".
function earthscape_loadTabulator() {
    if (typeof Tabulator !== "undefined") return Promise.resolve();
    includeCSS3(theroot + 'css/tabulator.min.css');
    includeCSS3(theroot + 'css/base-tabulator.css');
    return new Promise(function (resolve) {
        loadScript(theroot + 'js/tabulator.min.js', function () {
            waitForVariable('Tabulator', resolve);
        });
    });
}

// Tabulator grid below diagram. Returns the table.
// Uses autoColumns unless my.columns is provided. Set my.maxHeight to false for no height limit.
function earthscape_TableDisplay(my, data) {
    let options = {
        data: data,
        addRowPos: "top",          //when adding a new row, add it to the top of the table
        history: true,             //allow undo and redo actions on the table
        paginationSize: 7,         //allow 7 rows per page of data
        movableColumns: true,      //allow column order to be changed
        resizableRows: true,       //allow row order to be changed
    };
    if (my.maxHeight !== false) options.maxHeight = my.maxHeight || "300px"; // For frozenRows
    if (my.columns) {
        options.columns = my.columns;
    } else {
        options.autoColumns = true; // cellHozAlign:"right" is not compatible with autoColumns
    }
    if (my.index) options.index = my.index;
    if (my.layout) options.layout = my.layout;
    if (my.initialSort) options.initialSort = my.initialSort; // e.g. [{column:"Year", dir:"desc"}]
    Object.assign(options, my.tableOptions || {});

    return new Tabulator("#" + my.elementID, options);
}


function earthscape_TableDisplay2(my, data) {
    // Group data by Fips code
    let groupedData = groupDataByFips(data);

    // Create a new array to hold the final data
    let finalData = [];

    // Iterate over the grouped data and construct the final data array
    for (let fips in groupedData) {
        let rowData = {
            "Fips": fips,
            "Name": groupedData[fips][0].Name, // Assume the name is the same for all rows with the same Fips
        };

        // Add the UrbanDensity values for each year
        for (let year = 2017; year <= 2021; year++) {
            let urbanDensity = getUrbanDensityForYear(groupedData[fips], year);
            rowData["UrbanDensity" + year] = urbanDensity;
        }

        // Add the row to the final data array
        finalData.push(rowData);
    }

    let table = new Tabulator("#" + my.elementID, {
        data: finalData,
        headerVisible: true,
        maxHeight: "300px",
        addRowPos: "top",
        history: true,
        paginationSize: 7,
        movableColumns: true,
        resizableRows: true,
        layout: "fitColumns",
        columns: [
            { title: "Fips", field: "Fips" },
            { title: "Name", field: "Name" },
            { title: "2017", field: "UrbanDensity2017" },
            { title: "2018", field: "UrbanDensity2018" },
            { title: "2019", field: "UrbanDensity2019" },
            { title: "2020", field: "UrbanDensity2020" },
            { title: "2021", field: "UrbanDensity2021" },
        ],
    });
}

// Helper function to group data by Fips code
function groupDataByFips(data) {
    let groupedData = {};
    data.forEach(function (item) {
        if (!groupedData[item.Fips]) {
            groupedData[item.Fips] = [];
        }
        groupedData[item.Fips].push(item);
    });
    return groupedData;
}

// Helper function to get UrbanDensity for a specific year
function getUrbanDensityForYear(data, year) {
    let result = data.find(function (item) {
        return item.Year == year;
    });
    return result ? result.UrbanDensity : "";
}

const countryCodeMap = {
    "AF": "AFG", "AX": "ALA", "AL": "ALB", "DZ": "DZA", "AS": "ASM", "AD": "AND", "AO": "AGO", "AI": "AIA", "AQ": "ATA", "AG": "ATG",
    "AR": "ARG", "AM": "ARM", "AW": "ABW", "AU": "AUS", "AT": "AUT", "AZ": "AZE", "BS": "BHS", "BH": "BHR", "BD": "BGD", "BB": "BRB",
    "BY": "BLR", "BE": "BEL", "BZ": "BLZ", "BJ": "BEN", "BM": "BMU", "BT": "BTN", "BO": "BOL", "BQ": "BES", "BA": "BIH", "BW": "BWA",
    "BV": "BVT", "BR": "BRA", "IO": "IOT", "BN": "BRN", "BG": "BGR", "BF": "BFA", "BI": "BDI", "KH": "KHM", "CM": "CMR", "CA": "CAN",
    "CV": "CPV", "KY": "CYM", "CF": "CAF", "TD": "TCD", "CL": "CHL", "CN": "CHN", "CX": "CXR", "CC": "CCK", "CO": "COL", "KM": "COM",
    "CG": "COG", "CD": "COD", "CK": "COK", "CR": "CRI", "CI": "CIV", "HR": "HRV", "CU": "CUB", "CW": "CUW", "CY": "CYP", "CZ": "CZE",
    "DK": "DNK", "DJ": "DJI", "DM": "DMA", "DO": "DOM", "EC": "ECU", "EG": "EGY", "SV": "SLV", "GQ": "GNQ", "ER": "ERI", "EE": "EST",
    "ET": "ETH", "FK": "FLK", "FO": "FRO", "FJ": "FJI", "FI": "FIN", "FR": "FRA", "GF": "GUF", "PF": "PYF", "TF": "ATF", "GA": "GAB",
    "GM": "GMB", "GE": "GEO", "DE": "DEU", "GH": "GHA", "GI": "GIB", "GR": "GRC", "GL": "GRL", "GD": "GRD", "GP": "GLP", "GU": "GUM",
    "GT": "GTM", "GG": "GGY", "GN": "GIN", "GW": "GNB", "GY": "GUY", "HT": "HTI", "HM": "HMD", "VA": "VAT", "HN": "HND", "HK": "HKG",
    "HU": "HUN", "IS": "ISL", "IN": "IND", "ID": "IDN", "IR": "IRN", "IQ": "IRQ", "IE": "IRL", "IM": "IMN", "IL": "ISR", "IT": "ITA",
    "JM": "JAM", "JP": "JPN", "JE": "JEY", "JO": "JOR", "KZ": "KAZ", "KE": "KEN", "KI": "KIR", "KP": "PRK", "KR": "KOR", "KW": "KWT",
    "KG": "KGZ", "LA": "LAO", "LV": "LVA", "LB": "LBN", "LS": "LSO", "LR": "LBR", "LY": "LBY", "LI": "LIE", "LT": "LTU", "LU": "LUX",
    "MO": "MAC", "MK": "MKD", "MG": "MDG", "MW": "MWI", "MY": "MYS", "MV": "MDV", "ML": "MLI", "MT": "MLT", "MH": "MHL", "MQ": "MTQ",
    "MR": "MRT", "MU": "MUS", "YT": "MYT", "MX": "MEX", "FM": "FSM", "MD": "MDA", "MC": "MCO", "MN": "MNG", "ME": "MNE", "MS": "MSR",
    "MA": "MAR", "MZ": "MOZ", "MM": "MMR", "NA": "NAM", "NR": "NRU", "NP": "NPL", "NL": "NLD", "NC": "NCL", "NZ": "NZL", "NI": "NIC",
    "NE": "NER", "NG": "NGA", "NU": "NIU", "NF": "NFK", "MP": "MNP", "NO": "NOR", "OM": "OMN", "PK": "PAK", "PW": "PLW", "PS": "PSE",
    "PA": "PAN", "PG": "PNG", "PY": "PRY", "PE": "PER", "PH": "PHL", "PN": "PCN", "PL": "POL", "PT": "PRT", "PR": "PRI", "QA": "QAT",
    "RE": "REU", "RO": "ROU", "RU": "RUS", "RW": "RWA", "BL": "BLM", "SH": "SHN", "KN": "KNA", "LC": "LCA", "MF": "MAF", "PM": "SPM",
    "VC": "VCT", "WS": "WSM", "SM": "SMR", "ST": "STP", "SA": "SAU", "SN": "SEN", "RS": "SRB", "SC": "SYC", "SL": "SLE", "SG": "SGP",
    "SX": "SXM", "SK": "SVK", "SI": "SVN", "SB": "SLB", "SO": "SOM", "ZA": "ZAF", "GS": "SGS", "SS": "SSD", "ES": "ESP", "LK": "LKA",
    "SD": "SDN", "SR": "SUR", "SJ": "SJM", "SE": "SWE", "CH": "CHE", "SY": "SYR", "TW": "TWN", "TJ": "TJK", "TZ": "TZA", "TH": "THA",
    "TL": "TLS", "TG": "TGO", "TK": "TKL", "TO": "TON", "TT": "TTO", "TN": "TUN", "TR": "TUR", "TM": "TKM", "TC": "TCA", "TV": "TUV",
    "UG": "UGA", "UA": "UKR", "AE": "ARE", "GB": "GBR", "US": "USA", "UM": "UMI", "UY": "URY", "UZ": "UZB", "VU": "VUT", "VE": "VEN",
    "VN": "VNM", "VG": "VGB", "VI": "VIR", "WF": "WLF", "EH": "ESH", "YE": "YEM", "ZM": "ZMB", "ZW": "ZWE"
  };
  const defaultCountries = ['IN', 'CN', 'US', 'GB', 'DE', 'JP', 'BR', 'RU', 'ZA', 'SA', 'AE'];

// Cache for all countries data to avoid re-fetching
let allCountriesCache = null;

//Timelinechart for scopes country, state, and county
let geoValues = {};
let MIN_YEAR = 1960; // Minimum year to filter data
let MAX_YEAR = 9999; // Maximum year to filter data (9999 = no limit)
function setTimelineMinYear(year) {
    const parsedYear = parseInt(year, 10);
    if (!Number.isNaN(parsedYear)) {
        MIN_YEAR = parsedYear;
        window._timelineMinYear = parsedYear;
    }
}
function setTimelineMaxYear(year) {
    const parsedYear = parseInt(year, 10);
    if (!Number.isNaN(parsedYear)) {
        MAX_YEAR = parsedYear;
        window._timelineMaxYear = parsedYear;
    }
}
function updateTimelineMinYearFromSelect(selectEl) {
    if (!selectEl || !selectEl.options || !selectEl.options.length) {
        return;
    }
    const opt = selectEl.options[selectEl.selectedIndex];
    const startYear = opt && opt.dataset ? opt.dataset.startYear : null;
    if (startYear) {
        setTimelineMinYear(startYear);
    }
    // Reset max year when a new dataset is selected
    MAX_YEAR = 9999;
    window._timelineMaxYear = 9999;
}
window.setTimelineMinYear = setTimelineMinYear;
window.setTimelineMaxYear = setTimelineMaxYear;
window.updateTimelineMinYearFromSelect = updateTimelineMinYearFromSelect;

// Data Commons responses, keyed by request. A redraw (such as the title and StartYear arriving from the Google Sheet)
// reuses data already fetched, or still in flight, instead of requesting it again.
const timelineFetchCache = {};
function fetchJsonCached(url, options) {
    const key = url + '|' + ((options && options.body) || '');
    if (!timelineFetchCache[key]) {
        timelineFetchCache[key] = fetch(url, options).then(response => {
            if (!response.ok) {
                delete timelineFetchCache[key]; // Retry on the next request
            }
            return response.json();
        }).catch(error => {
            delete timelineFetchCache[key];
            throw error;
        });
    }
    return timelineFetchCache[key];
}
let timelineChartRequestId = 0; // Only the latest getTimelineChart() call draws the charts

/**
 * Fetches time-series data from Google Data Commons and renders
 * a multi-line timeline chart and stacked area chart using Chart.js.
 *
 * This function:
 *  - Resolves geographic entities based on the selected scope (country, state, county)
 *  - Fetches observations for a given Statistical Variable (SV / DCID)
 *  - Optionally converts values to per-capita
 *  - Filters data by minimum year
 *  - Determines which locations to display (Top 5, Bottom 5, Selected, All)
 *  - Builds and renders both the line chart and area chart
 *
 * param {string} scope
 *   Geographic level of analysis. Determines which entities are queried.
 *   Possible values: "country", "state", "county".
 *
 * param {string} chartVariable
 *   The Data Commons Statistical Variable DCID (SV) to fetch.
 *   Example: "Count_Person", "Amount_Emissions_CarbonDioxide".
 *
 * param {string} entityId
 *   Parent entity DCID used when scope is "county".
 *   Used to retrieve all counties contained within this entity.
 *   (Not used for country/state scope.)
 *
 * param {string} showAll
 *   Controls which locations are displayed on the chart.
 *   Possible values:
 *     - "showAll"      → show all valid locations
 *     - "showTop5"     → show top 5 by latest value
 *     - "showBottom5"  → show bottom 5 by latest value
 *     - "showSelected" → show only selected countries from URL hash
 *
 * param {string} chartText
 *   Human-readable title of the selected metric.
 *   Used for chart titles and axis labels.
 */


async function getTimelineChart(scope, chartVariable, entityId, showAll, chartText) {
    //alert("getTimelineChart chartVariable: " + chartVariable + ", scope: " + scope)
    document.body.classList.add('timeline-loading');
    const requestId = ++timelineChartRequestId;
    try {
        let hash = getHash(); // Add hash check at top of function
        geoValues = {}; // Clear prior
        const defaultCountries3Char = defaultCountries.map(code => countryCodeMap[code] || code);
        const userSelected = hash.country ? hash.country.split(',').map(code => countryCodeMap[code.trim()] || code.trim()) : [];
        const selectedCountries3Char = [...new Set([...defaultCountries3Char, ...userSelected])];
        const selectedCountries = []; // top-level
        let data, geoIds;
        let whichPer = document.querySelector('input[name="whichPer"]:checked')?.value || 'totals';

        if (scope === "county") {
            // Fetch county data
            data = await fetchJsonCached(`https://api.datacommons.org/v2/observation?key=${api_key}&entity.expression=${entityId}%3C-containedInPlace%2B%7BtypeOf%3ACounty%7D&select=date&select=entity&select=value&select=variable&variable.dcids=${chartVariable}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "dates": ""
                })
            });
            geoIds = Object.keys(data.byVariable[chartVariable].byEntity);

            // Fetch county and state names
            const data2 = await fetchJsonCached(`https://api.datacommons.org/v2/node?key=${api_key}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "nodes": geoIds,
                    "property": "->[containedInPlace, name]"
                })
            });

            Object.keys(data2.data).forEach(geoId => {
                const node = data2.data[geoId].arcs;
                const stateName = node.containedInPlace.nodes[0]['name'];
                const countyName = node.name.nodes[0]['value'];
                geoValues[geoId] = {
                    name: countyName,
                    state: stateName
                };
            });
        } else if (scope === "state") {
            // Fetch state data
            const statesList = [
                'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 
                'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
                'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
            'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
            'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
            'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
            'New Mexico', 'New York State', 'North Carolina', 'North Dakota', 'Ohio',
            'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
            'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
            'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
          ];
        data = await fetchJsonCached(`https://api.datacommons.org/v2/resolve?key=${api_key}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "nodes": statesList,
                "property": "<-description{typeOf:State}->dcid"
            })
        });
        geoIds = data.entities.map(entity => entity?.candidates?.[0]?.dcid).filter(Boolean);

        // Fetch state names
        const data2 = await fetchJsonCached(`https://api.datacommons.org/v2/node?key=${api_key}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "nodes": geoIds,
                "property": "->name"
            })
        });

        Object.keys(data2.data).forEach(geoId => {
            const stateName = data2.data[geoId].arcs.name.nodes[0]['value'];
            geoValues[geoId] = {
                name: stateName,
                state: stateName
            };
        });

    } else if (scope === "country") {
        // Only fetch ALL countries if showAll === 'showAll'
        // Otherwise use default countries for better performance
        let selectedCountries;

        if (showAll === 'showAll') {
            // Lazy load: Fetch all countries only when "All" is selected
            if (!allCountriesCache) {
                console.log("Fetching all countries from RESTCountries API...");
                const restResponse = await fetch("https://restcountries.com/v3.1/all?fields=cca2,name");
                const countriesData = await restResponse.json();

                // Cache the result
                allCountriesCache = countriesData.map(country => country.cca2).filter(Boolean);
                console.log(`Loaded ${allCountriesCache.length} countries from API`);
                // Note: Label will be updated later with actual count of countries that have data
            } else {
                console.log("Using cached country data");
            }
            selectedCountries = allCountriesCache;
        } else {
            // Use default countries for Top 5, Top Economics, Bottom 5
            selectedCountries = defaultCountries;
            console.log("Using default countries:", selectedCountries);
        }

        console.log("Selected Countries:", selectedCountries); // Debug log

        // Fetch country dcids using ISO codes
        data = await fetchJsonCached(`https://api.datacommons.org/v2/resolve?key=${api_key}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "nodes": selectedCountries,
                "property": "<-description{typeOf:Country}->dcid"
            })
        });

        geoIds = data.entities
            .map(entity => entity?.candidates?.[0]?.dcid)
            .filter(Boolean); // remove undefined/null

        // Fetch country names
        const data2 = await fetchJsonCached(`https://api.datacommons.org/v2/node?key=${api_key}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "nodes": geoIds,
                "property": "->name"
            })
        });

        Object.keys(data2.data).forEach(geoId => {
            const countryName = data2.data[geoId]?.arcs?.name?.nodes?.[0]?.value;
            if (countryName) {
                geoValues[geoId] = {
                    name: countryName,
                    state: countryName
                };
            }
        });

    }

    // Fetch observational data using geoIds list
    const url = `https://api.datacommons.org/v2/observation?key=${api_key}&variable.dcids=${chartVariable}&${geoIds.map(id => `entity.dcids=${id}`).join('&')}`;
    console.log("url data:",url)
    const timelineData = await fetchJsonCached(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "date": "",
            "select": ["date", "entity", "value", "variable"]
        })
    });
    console.log("timeline obsevational data for country:",timelineData)
    let populationData = {};
if (whichPer === 'percapita') {
  const popUrl = `https://api.datacommons.org/v2/observation?key=${api_key}&variable.dcids=Count_Person&${geoIds.map(id => `entity.dcids=${id}`).join('&')}`;

  const popJson = await fetchJsonCached(popUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      "date": "",
      "select": ["date", "entity", "value", "variable"]
    })
  });

  populationData = popJson.byVariable["Count_Person"].byEntity;
}
    if (requestId !== timelineChartRequestId) {
        return; // A newer call (such as the redraw after the Google Sheet loads) draws the charts
    }
        // Format data
        const formattedData = [];
//alert(JSON.stringify(geoValues)) // TO DO: Only send countries that exist in the dataset.
for (const geoId in geoValues) {
    //console.log("GeoId:", geoId, "Name:", geoValues[geoId].name);
    if (timelineData.byVariable[chartVariable]?.byEntity?.[geoId]?.orderedFacets?.[0]?.observations) {
        const isPopulationGoal = getHash().goal === "population";
        const filteredObservations = timelineData.byVariable[chartVariable].byEntity[geoId].orderedFacets[0].observations.filter(obs => {
    const year = parseInt(obs.date.split('-')[0]);
    return year >= MIN_YEAR && year <= MAX_YEAR;
}).map(obs => ({
    date: obs.date.split('-')[0],
    value: obs.value
}));
      
        formattedData.push({
            name: geoValues[geoId].name,
            observations: filteredObservations.map(obs =>{
            //timelineData.byVariable[chartVariable].byEntity[geoId].orderedFacets[0]['observations'].map(obs => {
                let value = obs.value;
                if (whichPer === 'percapita') {
                    let popFacets = populationData[geoId]?.orderedFacets?.[0]?.observations;
                    if (popFacets) {
                        let popObs = popFacets.find(p => p.date === obs.date);
                        if (popObs && popObs.value) {
                            value = value / popObs.value;
                        } else {
                            value = null;
                        }
                    } else {
                        value = null;
                    }
                }
                return { date: obs.date, value: value };
            })
        });
    }
}
  
console.log("formattedData:",formattedData)
     
    // Get unique years
    /*let yearsSet = new Set();
    formattedData.forEach(location => {
        location.observations.forEach(obs => {
            yearsSet.add(obs.date);
        });
    });
    const years = [...yearsSet].sort((a, b) => a - b);*/
    // Get unique years
let yearsSet = new Set();
formattedData.forEach(location => {
    location.observations.forEach(obs => {
        yearsSet.add(obs.date.split('-')[0]); // Always use year part
    });
});
const years = [...yearsSet].sort((a, b) => a - b);

    // Showing all or top 5 or bottom 5
    let selectedData;
    // Create a deep copy to avoid modifying the original array
    const dataCopy = JSON.parse(JSON.stringify(formattedData));
    // Get the latest year across all observations
    let latestYear = '';
    dataCopy.forEach(location => {
        if (location.observations && location.observations.length > 0) {
            location.observations.forEach(obs => {
                const year = obs.date.split('-')[0]; // Normalize to year only
                if (year > latestYear) latestYear = year;
            });
        }
    });
    console.log(`Latest year identified: ${latestYear}`);
    // Calculate latest value for each location
    // Calculate latest value for each location
dataCopy.forEach(location => {
    if (location.observations && location.observations.length > 0) {
        // Create a sorted copy of observations by date
        const sortedObservations = [...location.observations].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
        
        // Get the latest observation (last in sorted array)
        const latestObs = sortedObservations[sortedObservations.length - 1];
        location.latestValue = latestObs ? latestObs.value : null;
    } else {
        location.latestValue = null;
    }// Add 1960 value specifically for population
    if (getHash().goal === "population") {
        const obs1960 = location.observations?.find(obs => obs.date === "1960");
        location.valueIn1960 = obs1960 ? obs1960.value : null;
    }
});
    // Filter out locations with no valid latest value
    const validData = dataCopy.filter(location => 
    getHash().goal === "population" 
        ? location.valueIn1960 !== null 
        : location.latestValue !== null);
    console.log("validData:",validData)
    if (showAll === 'showSelected') {
        if (scope !== 'country') {
            selectedData = validData
                .sort((a, b) => b.latestValue - a.latestValue)
                .slice(0, Math.min(5, validData.length));
        } else {
            selectedData = formattedData.filter(location => {
                const geoId = Object.keys(geoValues).find(id => geoValues[id].name === location.name);
                if (!geoId) return false;
                const countryCode = geoId.includes('country/') ? geoId.replace('country/', '') : geoId;
                return selectedCountries3Char.includes(countryCode);
            });
        }
    } else if (showAll === 'showTop5') {
       selectedData = validData
        .sort((a, b) => 
            getHash().goal === "population"
                ? b.valueIn1960 - a.valueIn1960
                : b.latestValue - a.latestValue
        )
        .slice(0, Math.min(5, validData.length));
    } else if (showAll === 'showBottom5') {
        selectedData = validData
        .sort((a, b) => 
            getHash().goal === "population"
                ? a.valueIn1960 - b.valueIn1960
                : a.latestValue - b.latestValue
        )
        .slice(0, Math.min(5, validData.length));

    } else {
        selectedData = dataCopy;
        // Update label with actual count of countries that have data
        if (scope === "country" && showAll === 'showAll') {
            updateAllCountryLabel(selectedData.length);
        }
    }

    // Reset the "All" label when other modes are selected
    if (scope === "country" && showAll !== 'showAll') {
        resetAllCountryLabel();
    }

     console.log("Filtered Countries:", selectedData);

    // Get datasets
    // Deterministic color generator per label so line and area charts match
    function colorForLabel(label, alpha) {
        // Simple string hash
        let hash = 0;
        for (let i = 0; i < label.length; i++) {
            hash = label.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = Math.abs(hash) % 360; // hue
        const s = 62; // saturation
        const l = 48; // lightness
        if (typeof alpha === 'number') {
            return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
        }
        return `hsl(${h}, ${s}%, ${l}%)`;
    }

    const datasets = selectedData.map(location => {
        const border = colorForLabel(location.name);
        return {
            label: location.name,
            data: years.map(year => {
                const observation = location.observations.find(obs => obs.date.split('-')[0] === year);
                return observation ? observation.value : null;
            }),
            borderColor: border,
            backgroundColor: 'rgba(0, 0, 0, 0)',
        };
    });

    // For Area Chart - reuse the same colors (with alpha)
    const datasets1 = selectedData.map(location => {
        const bg = colorForLabel(location.name, 0.18);
        const border = colorForLabel(location.name);
        return {
            label: location.name,
            data: years.map(year => {
                const observation = location.observations.find(obs => obs.date.split('-')[0] === year);
                return observation ? observation.value : null;
            }),
            backgroundColor: bg,
            borderColor: 'rgba(0,0,0,0)',
            fill: true
        };
    });
    const config = {
        type: 'line',
        data: {
            labels: years,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            elements: {
                point: {
                    radius: 0,
                    hoverRadius: 0,
                    hitRadius: 6
                }
            },
            
            plugins: {
                // Use a floating DOM legend instead of the built-in Chart.js legend
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text:whichPer === 'percapita' ? `${chartText} per person` : chartText,
                    font:{
                        size: 14
                    }
                }
            },
            layout: {
                padding: 5
            },
            scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Year'
                  },
                  ticks: {
                    font: {
                      size: 12 // smaller font size for better mobile readability
                    }
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: whichPer === 'percapita' ? `${chartText} per person` : chartText
                  },
                  ticks: {
                    font: {
                      size: 10
                    }
                  }
                }
              }
        }
    };

    // For Area Chart
    let chartVariableSelect = document.getElementById('chartVariable');
    let chartTitle = chartVariableSelect.options[chartVariableSelect.selectedIndex].text;

    const data1 = {
        labels: years,
        datasets: datasets1
      };
    const config1 = {
            type: 'line',
            data: data1,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                elements: {
                    point: {
                        radius: 0,
                        hoverRadius: 0,
                        hitRadius: 6
                    }
                },
                 // Important for fluid resizing
                plugins: {
                  title: {
                    display: true,
                    text: (ctx) => whichPer === 'percapita' ? `${chartText} per person` : chartText,
                    font: {
                      size: 14 // Slightly smaller for mobile balance
                    }
                  },
                  tooltip: {
                    mode: 'index'
                  },
                                        // Disable built-in legend in favor of floating DOM legend
                                        legend: {
                                            display: false
                                        }
                },
                interaction: {
                  mode: 'nearest',
                  axis: 'x',
                  intersect: false
                },
                layout: {
                  padding: 10
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Years'
                    },
                    ticks: {
                      font: {
                        size: 12
                      }
                    }
                  },
                  y: {
                    stacked: true,
                    title: {
                      display: true,
                      text: whichPer === 'percapita' ? `${chartText} per person` : chartText

                    },
                    ticks: {
                      font: {
                        size: 12
                      }
                    },
                    
                  }
                }
              }
              
    }

    window._timelineYears = years;
    if (typeof window.updateDateRangeLabel === 'function') { try { window.updateDateRangeLabel(); } catch(e) {} }
    window._timelineCountryDataByName = {};
    formattedData.forEach(function(loc){ window._timelineCountryDataByName[loc.name] = loc; });
    window._timelineSelectedLabels = selectedData.map(function(loc){ return loc.name; });
    window.addCountryToCharts = function(name){
        try {
            // Force legend DOM rebuild so re-enabled hidden items appear immediately.
            window._forceLegendRebuild = true;
            if (!window._applyingSavedLegendList) {
                window._legendListDirty = true;
                window._legendListJustSaved = false;
                try { if (typeof window.updateLegendCacheButtonsVisibility === 'function') window.updateLegendCacheButtonsVisibility(); } catch (e) {}
            }
            var loc = window._timelineCountryDataByName && window._timelineCountryDataByName[name];
            if (!loc) return;
            var yrs = window._timelineYears || [];
            var existsLine = false;
            var existsArea = false;
            try { existsLine = Array.isArray(timelineChart?.data?.datasets) && timelineChart.data.datasets.some(function(ds){ return ds.label === name; }); } catch (e) {}
            try { existsArea = Array.isArray(lineAreaChart?.data?.datasets) && lineAreaChart.data.datasets.some(function(ds){ return ds.label === name; }); } catch (e) {}
            var border = colorForLabel(name);
            var dataArr = yrs.map(function(year){ var observation = (loc.observations || []).find(function(obs){ return (obs.date.split('-')[0]) === year; }); return observation ? observation.value : null; });
            if (timelineChart && !existsLine) {
                try {
                    timelineChart.data.datasets.push({ label: name, data: dataArr, borderColor: border, backgroundColor: 'rgba(0, 0, 0, 0)' });
                    timelineChart.update();
                } catch (e) {}
            } else if (timelineChart && existsLine) {
                // Restore an existing hidden series when selected from More Locations.
                try {
                    timelineChart.data.datasets.forEach(function(ds, idx){
                        if (ds && ds.label === name) {
                            var meta = timelineChart.getDatasetMeta(idx);
                            if (meta) meta.hidden = false;
                        }
                    });
                    timelineChart.update();
                } catch (e) {}
            }
            if (lineAreaChart && !existsArea) {
                try {
                    var bg = colorForLabel(name, 0.18);
                    lineAreaChart.data.datasets.push({ label: name, data: dataArr, backgroundColor: bg, borderColor: 'rgba(0,0,0,0)', fill: true });
                    lineAreaChart.update();
                } catch (e) {}
            } else if (lineAreaChart && existsArea) {
                // Restore an existing hidden area series when selected from More Locations.
                try {
                    lineAreaChart.data.datasets.forEach(function(ds, idx){
                        if (ds && ds.label === name) {
                            var meta = lineAreaChart.getDatasetMeta(idx);
                            if (meta) meta.hidden = false;
                        }
                    });
                    lineAreaChart.update();
                } catch (e) {}
            }
            // Avoid intermediate legend flashes while cached legend list is being applied.
            if (!window._applyingSavedLegendList) {
                try { if (typeof window.buildFloatingLegendFromChart === 'function') window.buildFloatingLegendFromChart(); } catch (e) {}
            }
        } catch (e) {}
    };

        if (hash.output === "json") {
        // Output JSON data to the page
        const jsonOutput = {
            years: years,
            datasets: selectedData.map(location => ({
                name: location.name,
                observations: location.observations
            })),
            chartTitle: chartTitle
        };
        document.body.innerHTML = '<pre>' + JSON.stringify(jsonOutput, null, 2) + '</pre>';
    } else {
        // Delete chart if it already exists
        if (timelineChart instanceof Chart) {
            timelineChart.destroy();
        }
        
        applyTimelineChartTheme(config.options);
        applyTimelineChartTheme(config1.options);
        const ctx = document.getElementById('timelineChart').getContext('2d');
        timelineChart = new Chart(ctx, config);

        if (lineAreaChart instanceof Chart) {
            lineAreaChart.destroy();
        }
        const ctx1 = document.getElementById('lineAreaChart');
        lineAreaChart = new Chart(ctx1, config1);

        // Build the legend only after BOTH charts are rebuilt, so it doesn't mix in stale labels from the previous scope
        // (for example switching from state -> country). localsite/js/timeline-legend.js builds it. When that script
        // loads after the charts are drawn, it builds the legend itself, so nothing waits here.
        if (typeof window.buildFloatingLegendFromChart === 'function') {
            try {
                window.buildFloatingLegendFromChart();
            } catch (e) {
                console.warn('buildFloatingLegendFromChart failed:', e);
            }
        }

        // Handle window resize to ensure charts adjust correctly when the window size changes
        // Chart.js automatically handles shrinking, but to handle expansion properly, 
        // we need to manually trigger a resize on each chart instance.
        // Without this, charts may not redraw correctly when window size increases after load.
        // Remove existing listener to avoid duplicates
        window.removeEventListener('resize', handleChartResize);
        window.addEventListener('resize', handleChartResize);
        }
    } finally {
        if (requestId === timelineChartRequestId) { // Keep the loading overlay while a newer call is still loading
            document.querySelectorAll('.timeline-loading-overlay .loading-text').forEach(el => {
                el.textContent = 'Timeline Display';
            });
            document.body.classList.remove('timeline-loading');
        }
    }
}

// Text and grid colors for the timeline charts, following the page's dark mode (body.dark)
function applyTimelineChartTheme(options) {
    const dark = document.body.classList.contains('dark');
    const text = dark ? '#bbb' : '#666'; // Light values are Chart.js defaults
    const grid = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
    options.color = text;
    if (options.plugins && options.plugins.title) options.plugins.title.color = text;
    ['x', 'y'].forEach((axis) => {
        const scale = options.scales && options.scales[axis];
        if (!scale) return;
        scale.ticks = Object.assign(scale.ticks || {}, { color: text });
        scale.grid = Object.assign(scale.grid || {}, { color: grid });
        scale.border = Object.assign(scale.border || {}, { color: grid });
        if (scale.title) scale.title.color = text;
    });
}
// Recolor drawn charts when dark mode is switched (localsite.js setSitelook)
document.addEventListener('sitelookchange', () => {
    if (typeof Chart === 'undefined' || !Chart.getChart) return;
    ['timelineChart', 'lineAreaChart'].forEach((id) => {
        const chart = Chart.getChart(id);
        if (!chart) return;
        applyTimelineChartTheme(chart.options);
        chart.update('none');
    });
});

// Chart resize handler function
function handleChartResize() {
    // Only auto-resize if manual sizing is not active
    if (!manualSizingActive) {
        if (timelineChart instanceof Chart) {
            timelineChart.resize();
        }
        if (lineAreaChart instanceof Chart) {
            lineAreaChart.resize();
        }
    }
}

// Chart size control functions
function updateChartSize() {
    const widthSlider = document.getElementById('widthSlider');
    const heightSlider = document.getElementById('heightSlider');
    const widthValue = document.getElementById('widthValue');
    const heightValue = document.getElementById('heightValue');
    
    if (!widthSlider || !heightSlider || !widthValue || !heightValue) {
        return; // Elements not found, exit gracefully
    }
    
    const width = widthSlider.value + 'px';
    const height = heightSlider.value + 'px';
    
    // Update display values
    widthValue.textContent = width;
    heightValue.textContent = height;
    
    // Set manual sizing flag to prevent auto-resize
    manualSizingActive = true;
    
    // Apply size ONLY to chart containers (divs that hold the canvases)
    // Don't modify canvas attributes directly to avoid diagonal scaling
    const timelineContainer = document.getElementById('div1');
    const lineAreaContainer = document.getElementById('div2');
    
    if (timelineContainer) {
        timelineContainer.style.width = width;
        timelineContainer.style.height = height;
        // Ensure container has proper positioning for chart sizing
        timelineContainer.style.position = 'relative';
    }
    
    if (lineAreaContainer) {
        lineAreaContainer.style.width = width;
        lineAreaContainer.style.height = height;
        // Ensure container has proper positioning for chart sizing
        lineAreaContainer.style.position = 'relative';
    }
    
    // Update chart options to disable aspect ratio maintenance for manual sizing
    if (timelineChart instanceof Chart) {
        timelineChart.options.maintainAspectRatio = false;
        timelineChart.options.responsive = true;
        timelineChart.update('none'); // Update without animation
    }
    
    if (lineAreaChart instanceof Chart) {
        lineAreaChart.options.maintainAspectRatio = false;
        lineAreaChart.options.responsive = true;
        lineAreaChart.update('none'); // Update without animation
    }
    
    // Force chart resize with manual sizing active
    setTimeout(() => {
        if (timelineChart instanceof Chart) {
            timelineChart.resize();
        }
        if (lineAreaChart instanceof Chart) {
            lineAreaChart.resize();
        }
    }, 100);
}

function resetChartSize() {
    const widthSlider = document.getElementById('widthSlider');
    const heightSlider = document.getElementById('heightSlider');
    const widthValue = document.getElementById('widthValue');
    const heightValue = document.getElementById('heightValue');
    
    if (!widthSlider || !heightSlider || !widthValue || !heightValue) {
        return; // Elements not found, exit gracefully
    }
    
    // Reset sliders to default values
    widthSlider.value = 800;
    heightSlider.value = 400;
    
    // Clear manual sizing flag to restore responsive behavior
    manualSizingActive = false;
    
    // Reset chart containers to auto sizing
    const timelineContainer = document.getElementById('div1');
    const lineAreaContainer = document.getElementById('div2');
    
    if (timelineContainer) {
        timelineContainer.style.width = '';
        timelineContainer.style.height = '';
    }
    
    if (lineAreaContainer) {
        lineAreaContainer.style.width = '';
        lineAreaContainer.style.height = '';
    }
    
    // Reset canvases to auto sizing
    const timelineCanvas = document.getElementById('timelineChart');
    const lineAreaCanvas = document.getElementById('lineAreaChart');
    
    if (timelineCanvas) {
        timelineCanvas.style.width = '';
        timelineCanvas.style.height = '';
        timelineCanvas.removeAttribute('width');
        timelineCanvas.removeAttribute('height');
    }
    
    if (lineAreaCanvas) {
        lineAreaCanvas.style.width = '';
        lineAreaCanvas.style.height = '';
        lineAreaCanvas.removeAttribute('width');
        lineAreaCanvas.removeAttribute('height');
    }
    
    // Update display values
    widthValue.textContent = '800px';
    heightValue.textContent = '400px';
    
    // Restore chart options to default responsive behavior
    if (timelineChart instanceof Chart) {
        timelineChart.options.maintainAspectRatio = true;
        timelineChart.options.responsive = true;
        timelineChart.update('none'); // Update without animation
    }
    
    if (lineAreaChart instanceof Chart) {
        lineAreaChart.options.maintainAspectRatio = true;
        lineAreaChart.options.responsive = true;
        lineAreaChart.update('none'); // Update without animation
    }
    
    // Trigger chart resize with responsive behavior restored
    setTimeout(() => {
        handleChartResize();
    }, 100);
}

// Select the #entityId state menu option for the first state in hash.state (such as state=GA). Returns true when the selection changed.
function setStateMenuFromHash() {
    const entityIdSelect = document.getElementById('entityId');
    const stateAbbr = String(getHash().state || '').split(',')[0].trim().toUpperCase();
    if (!entityIdSelect || !stateAbbr) return false;
    const option = Array.from(entityIdSelect.options).find(opt => opt.dataset.state === stateAbbr);
    if (!option || option.selected) return false;
    entityIdSelect.value = option.value;
    return true;
}
function refreshTimeline() {
    document.body.classList.add('timeline-loading');
    let hash = getHash();
    let scope = "country";
    if (hash.scope) {
        scope = hash.scope;
    }
    let chartVariableSelect = document.getElementById('chartVariable');        
    let chartVariable = chartVariableSelect.options[chartVariableSelect.selectedIndex].value;
    updateHash({"scope":scope,"features.dcid":chartVariable}); // Used by refreshTimeline()

            let showAll = document.querySelector('input[name="whichLines"]:checked').value;
            if(!showAll) {showAll = 'showTop5';}

            let entityId = '';
            const entityIdSelect = document.getElementById('entityId');
            if (entityIdSelect && entityIdSelect.selectedIndex >= 0) {
            entityId = entityIdSelect.options[entityIdSelect.selectedIndex].value;
            }

            // Only required for county scope.
            // Treat placeholder/non-geoId values (like "State...") as empty.
            if (scope === 'county' && (!entityId || !String(entityId).startsWith('geoId/'))) {
            entityId = 'geoId/13'; // Georgia
            if (entityIdSelect) {
                entityIdSelect.value = entityId;
            }
            }
            // Keep the state menu's choice in the URL hash as state=GA. Only for county scope, where the menu shows.
            if (scope === 'county' && entityIdSelect) {
                const stateAbbr = entityIdSelect.options[entityIdSelect.selectedIndex]?.dataset.state;
                if (stateAbbr && stateAbbr !== String(hash.state || '').toUpperCase()) {
                    updateHash({"state": stateAbbr});
                }
            }
            let chartText = document.getElementById('chartVariable').options[document.getElementById('chartVariable').selectedIndex].text;

            if (typeof window.onBeforeRefreshTimeline === 'function') {
                try { window.onBeforeRefreshTimeline(scope, chartVariable); } catch(e) {}
            }
            getTimelineChart(scope, chartVariable, entityId, showAll, chartText);
        //},3000);
    //});
}
function updateScopeOptions(availableScopes) {
    waitForElm('#selectScope').then((elm) => {
        $("#selectScope option").each(function () {
            $(this).prop("hidden", !availableScopes.includes(this.value));
        });
    });
}
let sheetLoadsPending = 0; // Google Sheet list requests in flight
async function updateDcidSelectFromSheet(scope) {

    let hash = getHash();
    if (!scope && hash.scope) {
        scope = hash.scope;
    }
    // Temp
    if (scope == "country" && hash.goal == "health") {
        scope = "country" // Until Google Sheet has counties for health
        updateHash({"scope":scope}); // Used by refreshTimeline()

    }
    // The scope and goal this list is for. The timeline page's hashChangeEvent reloads the list when these differ from the hash.
    // (priorHash can't be used: on the first change it holds scope=country from the localsite.js include, not the URL's scope.)
    window._timelineSheetView = scope + '|' + (hash.goal || '');

    // Temp here, will be in it's own function for choosing current goal view
    const airTimelinesLink = document.getElementById("airTimelinesLink");
    const healthTimelinesLink = document.getElementById("healthTimelinesLink");
    if (hash.goal === "air" || !hash.goal) {
      if (airTimelinesLink) airTimelinesLink.style.display = "none";
      if (healthTimelinesLink) healthTimelinesLink.style.display = "block";
    } else if (hash.goal === "health" ) {
      if (healthTimelinesLink) healthTimelinesLink.style.display = "none";
      if (airTimelinesLink) airTimelinesLink.style.display = "block";
    } else {
      if (airTimelinesLink) airTimelinesLink.style.display = "none";
      if (healthTimelinesLink) healthTimelinesLink.style.display = "none";
    }

    const dcidSelect = document.getElementById('chartVariable');
    if (!dcidSelect) {
        alert("Dropdown element with ID 'chartVariable' not found.");
        return;
    }

    // When getting a Google link for a .csv pull, also uncheck "Restrict access..."
    // air tab
    let sheetUrl = "https://docs.google.com/spreadsheets/d/1IGyvcMV5wkGaIWM5dyB-vQIXXZFJUMV3WRf_UmyLkRk/export?format=csv&gid=0"; // air
    if (hash.goal == "water") {
        sheetUrl = "https://docs.google.com/spreadsheets/d/1IGyvcMV5wkGaIWM5dyB-vQIXXZFJUMV3WRf_UmyLkRk/pub?gid=2049347939&single=true&output=csv"; // water
    } else if (hash.goal == "health") {
        sheetUrl = "https://docs.google.com/spreadsheets/d/1IGyvcMV5wkGaIWM5dyB-vQIXXZFJUMV3WRf_UmyLkRk/pub?gid=1911215802&single=true&output=csv"; // health
    } else if (hash.goal == "jobs") {
        sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRTBiwDM6b0i_jnaE37fq_GFxCyigP0OondJk17dMRgE8QFiIMNHabFymizwIUYOAVdxh6nj6ZueBak/pub?gid=1835621753&single=true&output=csv";
    } else if (hash.goal == "economy") {
        sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRTBiwDM6b0i_jnaE37fq_GFxCyigP0OondJk17dMRgE8QFiIMNHabFymizwIUYOAVdxh6nj6ZueBak/pub?gid=2098911331&single=true&output=csv";
    } else if (hash.goal == "biodiverse") {
        sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRTBiwDM6b0i_jnaE37fq_GFxCyigP0OondJk17dMRgE8QFiIMNHabFymizwIUYOAVdxh6nj6ZueBak/pub?gid=288814302&single=true&output=csv";
    } else if (hash.goal == "population") {
        sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRTBiwDM6b0i_jnaE37fq_GFxCyigP0OondJk17dMRgE8QFiIMNHabFymizwIUYOAVdxh6nj6ZueBak/pub?gid=471398138&single=true&output=csv";
    }

    

    //loadGoalsDropdown("aquifers","https://docs.google.com/spreadsheets/d/1IGyvcMV5wkGaIWM5dyB-vQIXXZFJUMV3WRf_UmyLkRk/pub?gid=484745180&single=true&output=csv");

    //loadGoalsDropdown("conservation","https://docs.google.com/spreadsheets/d/1IGyvcMV5wkGaIWM5dyB-vQIXXZFJUMV3WRf_UmyLkRk/pub?gid=374006451&single=true&output=csv");

    //loadGoalsDropdown("zipcodeleveldata","https://docs.google.com/spreadsheets/d/1IGyvcMV5wkGaIWM5dyB-vQIXXZFJUMV3WRf_UmyLkRk/pub?gid=492624247&single=true&output=csv");
    

    // Chart right away instead of waiting for the Google Sheet list (some sheet tabs take 10+ seconds).
    // The list is saved in localStorage, so return visits fill the dropdown and chart from it while the sheet reloads.
    // Without a saved list, chart the features.dcid from the URL hash on first load, else the goal's usual first DCID.
    const sheetView = window._timelineSheetView;
    const chartEarly = hash.output !== "json";
    let chartedKey = null; // The dropdown choice already charted, so the sheet's arrival only redraws when it differs
    if (chartEarly) {
        const savedCsv = getSavedSheetCsv(sheetUrl);
        if (savedCsv && fillDcidSelectFromCsv(dcidSelect, savedCsv, scope)) {
            chartedKey = dcidSelectKey(dcidSelect);
            refreshTimeline();
        } else {
            const goalDefault = (timelineDefaultDcids[hash.goal || 'air'] || {})[String(scope).toLowerCase()];
            // The hash DCID belongs to the prior goal after a goal change, so it's only used before the dropdown has options.
            const hashDcid = dcidSelect.options.length === 0 ? hash.features?.dcid : null; // getHash() nests dotted keys
            const earlyDcid = hashDcid || (goalDefault && goalDefault[0]);
            if (earlyDcid) {
                const fromDefault = goalDefault && goalDefault[0] === earlyDcid;
                // The placeholder shows the DCID (underscores as spaces) until the sheet provides the Title and StartYear
                const opt = new Option(fromDefault ? goalDefault[1] : earlyDcid.replace(/_/g, ' '), earlyDcid);
                if (fromDefault && goalDefault[2]) opt.dataset.startYear = goalDefault[2];
                dcidSelect.innerHTML = '';
                dcidSelect.add(opt);
                updateTimelineMinYearFromSelect(dcidSelect);
                chartedKey = dcidSelectKey(dcidSelect);
                refreshTimeline();
            }
        }
    }

    // body.timeline-sheet-loading twirls the showControl() gear while the sheet loads. Data Commons loading uses body.timeline-loading.
    // It is removed in the same task that calls refreshTimeline() below, so the gear keeps twirling through the redraw.
    sheetLoadsPending++;
    document.body.classList.add('timeline-sheet-loading');
    let csvText;
    try {
        csvText = await fetchSheetCsv(sheetUrl);
    } catch (error) {
        console.warn("Google Sheet list did not load:", sheetUrl, error);
        return;
    } finally {
        if (--sheetLoadsPending === 0) {
            document.body.classList.remove('timeline-sheet-loading');
        }
    }
    if (csvText.indexOf('DCID') >= 0) { // Skip saving an error page
        saveSheetCsv(sheetUrl, csvText);
    }

    // A newer scope or goal started loading its own list
    if (window._timelineSheetView !== sheetView) return;

    if (!fillDcidSelectFromCsv(dcidSelect, csvText, scope)) {
        alert("No datasets in the Google Sheet for scope \"" + String(scope).trim().toLowerCase() + "\" with the goal \"" + hash.goal + "\"");
        return;
    }
    // Redraw when the sheet's choice, Title or StartYear differs from what was charted. Data Commons responses are reused from fetchJsonCached().
    if (dcidSelectKey(dcidSelect) !== chartedKey) {
        refreshTimeline();
    }
}

// The usual first DCID, Title and StartYear in each goal's Google Sheet tab, by scope.
// Charted on a first visit while the sheet loads. If the sheet's first row changes, the chart redraws once the sheet arrives.
const timelineDefaultDcids = {
    air: {
        country: ['Annual_Amount_Emissions_CarbonDioxide', 'Annual Carbon Emissions', '1970'],
        state: ['Annual_Emissions_GreenhouseGas_NonBiogenic', 'NonBiogenic Emissions', ''],
        county: ['Annual_Emissions_GreenhouseGas_NonBiogenic', 'NonBiogenic Emissions', '']
    },
    health: {
        country: ['sdg/SH_STA_MORT.SEX--F', 'Maternal mortality ratio', '']
    },
    jobs: {
        country: ['sdg/SI_POV_NAHC', 'Proportion of population living below the national poverty line', '1985'],
        state: ['UnemploymentRate_Person', 'Unemployment Rate of a Population', '1976'],
        county: ['UnemploymentRate_Person', 'Unemployment Rate of a Population', '1976']
    },
    economy: {
        country: ['sdg/NY_GDP_MKTP_KD_ZG', 'Annual GDP growth', '2000'],
        state: ['Median_Income_Household', 'Median Income for All Households', '2011'],
        county: ['Median_Income_Household', 'Median Income for All Households', '2011']
    },
    biodiverse: {
        country: ['sdg/ER_MRN_MPA', 'Average proportion of Marine Key Biodiversity Areas covered by protected areas', '2000'],
        state: ['LandCoverFraction_Forest', 'Percent of Forest Covered Area', '2015']
    },
    population: {
        country: ['Count_Person', 'Total Population', '1960'],
        state: ['Count_Person', 'Total Population', '1900'],
        county: ['Count_Person', 'Total Population', '1970']
    }
};

// Google Sheet list CSVs saved in localStorage by URL
const SHEET_CSV_STORAGE_PREFIX = 'timelineSheetCsv_';
function getSavedSheetCsv(url) {
    try { return localStorage.getItem(SHEET_CSV_STORAGE_PREFIX + url); } catch (e) { return null; }
}
function saveSheetCsv(url, csvText) {
    try { localStorage.setItem(SHEET_CSV_STORAGE_PREFIX + url, csvText); } catch (e) { /* storage full or blocked */ }
}
// One request per sheet URL, shared by calls made while it is in flight
const sheetCsvRequests = {};
function fetchSheetCsv(url) {
    if (!sheetCsvRequests[url]) {
        sheetCsvRequests[url] = fetch(url).then(response => {
            if (!response.ok) throw new Error("HTTP " + response.status);
            return response.text();
        }).finally(() => {
            delete sheetCsvRequests[url];
        });
    }
    return sheetCsvRequests[url];
}
function dcidSelectKey(dcidSelect) {
    const opt = dcidSelect.options[dcidSelect.selectedIndex];
    return opt ? opt.value + '|' + opt.text + '|' + (opt.dataset.startYear || '') : null;
}

// Fill the #chartVariable dropdown with the sheet rows for a scope. Returns false when the sheet has none.
// Keeps the features.dcid from the URL hash when this scope offers it, else selects the first option.
function fillDcidSelectFromCsv(dcidSelect, csvText, scope) {
    const hash = getHash();
    const rows = parseCSV(csvText); // Handles quoted commas
    const headers = rows[0] || [];
    const scopeIndex = headers.indexOf('Scope');
    const valueIndex = headers.indexOf('DCID');
    const textIndex = headers.indexOf('Title');
    const startYearIndex = headers.indexOf('StartYear');
    // The sheet's EndYear is ignored: Data Commons often has newer years than the sheet lists, so the chart runs to the latest data.

    if (scopeIndex === -1 || valueIndex === -1 || textIndex === -1) {
        console.error("Missing required columns in the CSV data.");
        return false;
    }

    // The Scope column can hold several comma-separated scopes. Compare case-insensitively.
    const normalizedScope = String(scope).trim().toLowerCase();
    const filteredOptions = rows.slice(1).filter(row => {
        const scopeColumn = row[scopeIndex]?.trim();
        if (!scopeColumn) return false;
        const scopes = scopeColumn.replace(/"/g, '').split(',').map(s => s.trim().toLowerCase());
        return scopes.includes(normalizedScope);
    }).filter(row => row[valueIndex]?.trim() && row[textIndex]?.trim());
    console.log("Google Sheet options for scope " + normalizedScope + ":", filteredOptions.length);

    // TO DO: Apply based on incoming Google Sheet rows
    if (hash.goal == "health" || hash.goal == "water") {
        updateScopeOptions(["country"]);
    } else {
        updateScopeOptions(["country","state","county"]); // TO DO: Zip not yet activated, add to function
    }
    if (filteredOptions.length === 0) {
        console.warn("No options matched the provided scope:", normalizedScope);
        return false;
    }

    dcidSelect.innerHTML = ''; // Cleared once rows are ready, so the dropdown is never empty
    filteredOptions.forEach(row => {
        const opt = document.createElement('option');
        opt.value = row[valueIndex].trim();
        opt.text = row[textIndex].trim();
        const startYearValue = startYearIndex > -1 ? row[startYearIndex]?.trim() : '';
        if (startYearValue) {
            opt.dataset.startYear = startYearValue;
        }
        dcidSelect.add(opt);
    });

    const hashDcid = hash.features?.dcid; // getHash() nests dotted keys
    const hasHashDcid = hashDcid && Array.from(dcidSelect.options).some(opt => opt.value === hashDcid);
    dcidSelect.value = hasHashDcid ? hashDcid : dcidSelect.options[0].value;
    updateTimelineMinYearFromSelect(dcidSelect);
    return true;
}

/* Function to generate table, takes the data to be loaded on to the table as an argument, start */

function generateTable(tableData) {
    // check if table already exixts and remove it to generate the required table
    const tableExist = document.getElementById("table-container");
    if(tableExist) {
        const checkTable = tableExist.querySelector(".table");
        if(checkTable) {
            checkTable.remove();
        }
    }

    const table = document.createElement("table");
    //table.setAttribute("border", "1"); // Add border for visibility

    // Create table header via JS
    const headerRow = document.createElement("tr");
    tableData[0].forEach((element) => {
        const headerCell = document.createElement("th");
        headerCell.textContent = element.replace(/\r/g, "").toUpperCase(); // remove any occurances of the characters \r and capitalize header names.
        headerCell.className = element.replace(/\r/g, ""); // assigning classname to control CSS
        headerRow.appendChild(headerCell);
    });
    table.appendChild(headerRow);

    // Create table rows for each data entry without the first element of the table data array since it contains the table header and is not required for populating the other rows
    let newTableData = tableData.slice(1);
    newTableData.forEach((item) => {
        const row = document.createElement("tr");
        item.forEach((elem, index) => {
            const cell = document.createElement("td");
            cell.className = "num"+index;
            if(elem == "" || elem == null || elem == undefined) {
                cell.textContent = '---'; // replace empty cell data with "---"
            } else {
                cell.textContent = elem.replace(/\r/g, "");
                if(cell.textContent == "") {
                    cell.textContent = '---'; // replace empty cell data after replacing \r above, with "---"
                }
            }
            row.appendChild(cell);
        });
        table.appendChild(row);
        //console.log(`DATA ROW CONTAINS ${item}`);
    });

    // Add the constructed table to the container.
    const container = document.getElementById("table-container");
    if(location.host.indexOf("dreamstudio") < 0) {
        //check if it's the health table or the air table and append className accordingly
        switch(tableData[1][0]) {
            case "Emissions": 
                table.className = "air table";
                break;

            case "Mortality":
                table.className = "health table";
                break;

            default:
                table.className = "col table"
        }
        container.appendChild(table);
    }
}
/* Function to generate table, end */

// CSV Parsing function to handle quoted commas
function parseCSV(csvText) {
    // Split rows by newlines
    const rows = csvText.split('\n').map(row => {
        // Use a regular expression to handle commas inside quotes
        const regex = /(?:,|\r?\n|^)(?:"([^"]*)"|([^",]*))/g;
        const columns = [];
        let match;
        while ((match = regex.exec(row)) !== null) {
            columns.push(match[1] || match[2]); // Take the value inside quotes or the normal value
        }
        return columns;
    });
    return rows;
}

// Function to update the "All" radio button label with country count
function updateAllCountryLabel(count) {
    try {
        // Find the "All" radio button's parent label
        const allRadio = document.querySelector('input[name="whichLines"][value="showAll"]');
        if (allRadio && allRadio.parentElement) {
            // Update the label text to show count in parentheses
            const labelText = allRadio.parentElement.childNodes;
            // Find the text node and update it
            for (let i = 0; i < labelText.length; i++) {
                if (labelText[i].nodeType === Node.TEXT_NODE && labelText[i].textContent.includes('All')) {
                    labelText[i].textContent = `All (${count}) `;
                    console.log(`Updated "All" label to "All (${count})"`);
                    break;
                }
            }
        }
    } catch (error) {
        console.warn('Could not update All label:', error);
    }
}

// Function to reset the "All" radio button label (remove count)
function resetAllCountryLabel() {
    try {
        // Find the "All" radio button's parent label
        const allRadio = document.querySelector('input[name="whichLines"][value="showAll"]');
        if (allRadio && allRadio.parentElement) {
            // Reset the label text to just "All"
            const labelText = allRadio.parentElement.childNodes;
            // Find the text node and reset it
            for (let i = 0; i < labelText.length; i++) {
                if (labelText[i].nodeType === Node.TEXT_NODE && (labelText[i].textContent.includes('All'))) {
                    labelText[i].textContent = 'All ';
                    console.log('Reset "All" label to just "All"');
                    break;
                }
            }
        }
    } catch (error) {
        console.warn('Could not reset All label:', error);
    }
}

function toggleDivs() {
    // Get selected value from radio buttons
    const selectedValue = document.querySelector('input[name="toogleChartType"]:checked').value;
    
    const div1 = document.getElementById('div1');
    const div2 = document.getElementById('div2');
    
    if (selectedValue == "both") {
        // Show both charts
        div1.style.display = 'block';
        div1.style.height = '';
        div1.style.margin = '';
        div1.style.padding = '';
        
        div2.style.display = 'block';
        div2.style.height = '';
        div2.style.margin = '';
        div2.style.padding = '';
        return;
    }
    
    // Hide both divs initially and remove all spacing
    div1.style.display = 'none';
    div1.style.height = '0';
    div1.style.margin = '0';
    div1.style.padding = '0';
    div1.style.overflow = 'hidden';
    
    div2.style.display = 'none';
    div2.style.height = '0';
    div2.style.margin = '0';
    div2.style.padding = '0';
    div2.style.overflow = 'hidden';

    // Show the selected div and restore its spacing
    const selectedDiv = document.getElementById(selectedValue);
    selectedDiv.style.display = 'block';
    selectedDiv.style.height = '';
    selectedDiv.style.margin = '';
    selectedDiv.style.padding = '';
    selectedDiv.style.overflow = '';
}
