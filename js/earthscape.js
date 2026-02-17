// EARTHSCAPE
// A single function that calls multiple visualizations for a dataset

// Declare global chart variables so they can be accessed in resize handler
let timelineChart;
let lineAreaChart;
let manualSizingActive = false; // Flag to track if manual sizing is being used
const api_key = "AIzaSyCTI4Xz-UW_G2Q2RfknhcfdAnTHq5X5XuI";


function loadEarthScape(my) {
    loadScript(theroot + 'js/d3.v5.min.js', function (results) {
        waitForVariable('customD3loaded', function () {
            d3.csv(my.dataset).then(function (data) {
                console.log("File loaded " + my.dataset);
                $(document).ready(function () {
                    earthscape_TableDisplay(my, data);
                });
            });
        });
    });
}

function loadEarthScape2(my) {
    loadScript(theroot + 'js/d3.v5.min.js', function (results) {
        waitForVariable('customD3loaded', function () {

            // Initialize an empty array to store the data for each year
            let allData = [];

            // Load data for years 2017 to 2021
            for (let year = 2017; year <= 2021; year++) {
                let dataset = my.dataset.replace(/this_is_year/g, year.toString());
                d3.csv(dataset).then(function (data) {
                    console.log("File loaded " + dataset);
                    // Add the year to each row of data
                    data.forEach(function (row) {
                        row['Year'] = year;
                    });
                    // Add the data for this year to the array
                    allData = allData.concat(data);
                    // Check if this is the last year, then display the table
                    if (year === 2021) {
                        $(document).ready(function () {
                            // Display the table after all years' data is loaded
                            earthscape_TableDisplay2(my, allData);
                        });
                    }
                });
            }
        });
    });
}

// Tabulator grid below diagram
function earthscape_TableDisplay(my, data) {
    console.log("Python file data:");
    console.log(data); // An array of objects
    console.log("Python file columns:");
    //columns = data["columns"];
    //console.log(columns);

    let table = new Tabulator("#" + my.elementID, {
        data: data,
        //layout:"fitColumns",      //fit columns to width of table
        //responsiveLayout:"hide",  //hide columns that dont fit on the table
        //tooltips:true,          //show tool tips on cells
        maxHeight: "300px",        // For frozenRows
        addRowPos: "top",          //when adding a new row, add it to the top of the table
        history: true,             //allow undo and redo actions on the table
        paginationSize: 7,         //allow 7 rows per page of data
        movableColumns: true,      //allow column order to be changed
        //cellHozAlign:"right",   //Not compatible with autoColumns:true
        resizableRows: true,       //allow row order to be changed
        //initialSort:[             //set the initial sort order of the data
        //    {column:"progress", dir:"desc"},
        //],
        autoColumns: true,
        scrollHorizontal: true,
        //columnMinWidth: 300,      //all columns

    });
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
        scrollHorizontal: true,
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
function setTimelineMinYear(year) {
    const parsedYear = parseInt(year, 10);
    if (!Number.isNaN(parsedYear)) {
        MIN_YEAR = parsedYear;
        window._timelineMinYear = parsedYear;
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
}
window.setTimelineMinYear = setTimelineMinYear;
window.updateTimelineMinYearFromSelect = updateTimelineMinYearFromSelect;

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
    try {
        let hash = getHash(); // Add hash check at top of function
        geoValues = {}; // Clear prior
        const defaultCountries3Char = defaultCountries.map(code => countryCodeMap[code] || code);
        const userSelected = hash.country ? hash.country.split(',').map(code => countryCodeMap[code.trim()] || code.trim()) : [];
        const selectedCountries3Char = [...new Set([...defaultCountries3Char, ...userSelected])];
        const selectedCountries = []; // top-level
        let response, data, geoIds;
        let whichPer = document.querySelector('input[name="whichPer"]:checked')?.value || 'totals';

        if (scope === "county") {
            // Fetch county data
            response = await fetch(`https://api.datacommons.org/v2/observation?key=${api_key}&entity.expression=${entityId}%3C-containedInPlace%2B%7BtypeOf%3ACounty%7D&select=date&select=entity&select=value&select=variable&variable.dcids=${chartVariable}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "dates": ""
                })
            });
            data = await response.json();
            geoIds = Object.keys(data.byVariable[chartVariable].byEntity);

            // Fetch county and state names
            const response2 = await fetch(`https://api.datacommons.org/v2/node?key=${api_key}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "nodes": geoIds,
                    "property": "->[containedInPlace, name]"
                })
            });
            const data2 = await response2.json();

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
        response = await fetch(`https://api.datacommons.org/v2/resolve?key=${api_key}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "nodes": statesList,
                "property": "<-description{typeOf:State}->dcid"
            })
        });
        data = await response.json();
        geoIds = data.entities.map(entity => entity.candidates[0].dcid);

        // Fetch state names
        const response2 = await fetch(`https://api.datacommons.org/v2/node?key=${api_key}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "nodes": geoIds,
                "property": "->name"
            })
        });
        const data2 = await response2.json();

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
        response = await fetch(`https://api.datacommons.org/v2/resolve?key=${api_key}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "nodes": selectedCountries,
                "property": "<-description{typeOf:Country}->dcid"
            })
        });

        data = await response.json();

        geoIds = data.entities
            .map(entity => entity?.candidates?.[0]?.dcid)
            .filter(Boolean); // remove undefined/null

        // Fetch country names
        const response2 = await fetch(`https://api.datacommons.org/v2/node?key=${api_key}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "nodes": geoIds,
                "property": "->name"
            })
        });

        const data2 = await response2.json();

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
    const response3 = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "date": "",
            "select": ["date", "entity", "value", "variable"]
        })
    });
    const timelineData = await response3.json();
    console.log("timeline obsevational data for country:",timelineData)
    let populationData = {};
if (whichPer === 'percapita') {
  const popUrl = `https://api.datacommons.org/v2/observation?key=${api_key}&variable.dcids=Count_Person&${geoIds.map(id => `entity.dcids=${id}`).join('&')}`;

  const popResponse = await fetch(popUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      "date": "",
      "select": ["date", "entity", "value", "variable"]
    })
  });

  const popJson = await popResponse.json();
  populationData = popJson.byVariable["Count_Person"].byEntity;
}
        // Format data
        const formattedData = [];
//alert(JSON.stringify(geoValues)) // TO DO: Only send countries that exist in the dataset.
for (const geoId in geoValues) {
    //console.log("GeoId:", geoId, "Name:", geoValues[geoId].name);
    if (timelineData.byVariable[chartVariable]?.byEntity?.[geoId]?.orderedFacets?.[0]?.observations) {
        const isPopulationGoal = getHash().goal === "population";
        // Replace the observation filtering logic with this:
const filteredObservations = timelineData.byVariable[chartVariable].byEntity[geoId].orderedFacets[0].observations.filter(obs => {
    // Handle both ISO dates (YYYY-MM-DD) and simple years (YYYY)
    const yearPart = obs.date.split('-')[0];
    const year = parseInt(yearPart);
    return year >= MIN_YEAR;
    
    // Special handling for population data
    if (isPopulationGoal) {
        return year >= MIN_YEAR;
    }
    return true; // Keep all observations for other goals
}).map(obs => {
    // Normalize date format to just the year for population data
    if (isPopulationGoal) {
        return {
            date: obs.date.split('-')[0], // Keep only the year part
            value: obs.value
            
        };
    }
    return obs; // Return original for other data
});
      
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
        selectedData = formattedData.filter(location => {
            const geoId = Object.keys(geoValues).find(id => geoValues[id].name === location.name);
            if (!geoId) return false;
            const countryCode = geoId.includes('country/') ? geoId.replace('country/', '') : geoId;
            //console.log(`Checking ${location.name}, geoId: ${geoId}, code: ${countryCode}`); // Debug
            console.log("Filtered Countries:", selectedData);
           return selectedCountries3Char.includes(countryCode);
           
        });
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
        
        const ctx = document.getElementById('timelineChart').getContext('2d');
        timelineChart = new Chart(ctx, config);

        if (lineAreaChart instanceof Chart) {
            lineAreaChart.destroy();
        }
        const ctx1 = document.getElementById('lineAreaChart');
        lineAreaChart = new Chart(ctx1, config1);

        // Trigger floating legend build only after BOTH charts are rebuilt.
        // This avoids mixing stale labels from the previous scope during transitions
        // (for example switching from state -> country).
        (function tryBuildLegend(attempt) {
            attempt = attempt || 0;
            if (typeof window.buildFloatingLegendFromChart === 'function') {
                try {
                    window.buildFloatingLegendFromChart();
                } catch (e) {
                    console.warn('buildFloatingLegendFromChart failed:', e);
                }
            } else if (attempt < 10) {
                setTimeout(() => tryBuildLegend(attempt + 1), 250);
            }
        })();

        // Handle window resize to ensure charts adjust correctly when the window size changes
        // Chart.js automatically handles shrinking, but to handle expansion properly, 
        // we need to manually trigger a resize on each chart instance.
        // Without this, charts may not redraw correctly when window size increases after load.
        // Remove existing listener to avoid duplicates
        window.removeEventListener('resize', handleChartResize);
        window.addEventListener('resize', handleChartResize);
        }
    } finally {
        document.body.classList.remove('timeline-loading');
    }
}

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
            entityId = 'geoId/26';
            if (entityIdSelect) {
                entityIdSelect.value = entityId;
            }
            }
            let chartText = document.getElementById('chartVariable').options[document.getElementById('chartVariable').selectedIndex].text;

            //alert(chartVariable + " " + chartText)
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
    dcidSelect.innerHTML = ''; // Clear existing options
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
    

    const response = await fetch(sheetUrl);
    const csvText = await response.text();

    console.log("CSV Data:", csvText); // Log the entire CSV data for debugging

    // Parse CSV data correctly, handling quoted commas
    const rows = parseCSV(csvText);

    console.log("Parsed Rows:", rows); // Log parsed rows for debugging

    const headers = rows[0]; // Assuming the first row contains headers
    console.log("Headers:", headers); // Log headers to ensure correct column names

    // Find the indices for the Scope, Value, and Text columns
    const scopeIndex = headers.indexOf('Scope');
    const valueIndex = headers.indexOf('DCID'); // Assuming 'Value' is stored in the 'DCID' column
    const textIndex = headers.indexOf('Title'); // Assuming 'Text' is stored in the 'Title' column
    const startYearIndex = headers.indexOf('StartYear');
    const endYearIndex = headers.indexOf('EndYear');

    if (scopeIndex === -1 || valueIndex === -1 || textIndex === -1) {
        console.error("Missing required columns in the CSV data.");
        return;
    }

    // Normalize the provided scope (trim and lowercase for comparison)
    const normalizedScope = scope.trim().toLowerCase();

    // Filter rows by the selected scope (case-insensitive)
    const filteredOptions = rows.slice(1).filter(row => {
        const scopeColumn = row[scopeIndex]?.trim(); // Get the Scope column value
        if (!scopeColumn) {
            console.log("Skipping row with empty Scope column:", row); // Log empty rows for debugging
            return false;
        }

        // Handle comma-separated values within quotes in the Scope column
        const scopes = scopeColumn.replace(/"/g, '').split(',').map(s => s.trim().toLowerCase());

        console.log("Row Scope Column:", scopeColumn); // Log the original Scope column value
        console.log("Row Split Scopes:", scopes); // Log split scopes

        // Compare each scope against the user-provided scope (case-insensitive)
        const matchFound = scopes.some(s => s === normalizedScope); // Use 'some' for matching any of the scopes
        console.log(`Match found for scope '${normalizedScope}':`, matchFound); // Log the result of the match check

        return matchFound; // Return true if scope matches
    });

    // TO DO: Apply based on incoming Google Sheet rows
    if (hash.goal == "health" || hash.goal == "water") {
        updateScopeOptions(["country"]);
    } else {
        updateScopeOptions(["country","state","county"]); // TO DO: Zip not yet activated, add to function
    }
    console.log("Filtered Options:", filteredOptions); // Log the filtered options to verify

    // Populate dropdown
    filteredOptions.forEach(row => {
        const value = row[valueIndex]?.trim();
        const text = row[textIndex]?.trim();
        const startYearValue = startYearIndex > -1 ? row[startYearIndex]?.trim() : '';
        if (value && text) {
            const opt = document.createElement('option');
            opt.value = value;
            opt.text = text;
            if (startYearValue) {
                opt.dataset.startYear = startYearValue;
            }
            dcidSelect.add(opt);
        }
    });

    // Set default selection if options exist
    if (filteredOptions.length > 0) {
        dcidSelect.value = filteredOptions[0][valueIndex].trim(); // Set to the first option's value
        if (typeof updateTimelineMinYearFromSelect === 'function') {
            updateTimelineMinYearFromSelect(dcidSelect);
        }
        refreshTimeline();
    } else {
        alert("No datasets in the Google Sheet for scope \"" + normalizedScope + "\" with the goal \"" + hash.goal + "\"");
        console.warn("No options matched the provided scope:", normalizedScope);
    }

    // Commented out since we don't need to show the rows from the Google Sheet.
    // Maybe the generateTable() function is not needed?

    /* call table function */
    //generateTable(rows);

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
