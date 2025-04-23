// EARTHSCAPE
// A single function that calls multiple visualizations for a dataset

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

//Timelinechart for scopes country, state, and county 
let geoValues = {};

async function getTimelineChart(scope, chartVariable, entityId, showAll, chartText) {
    //alert("getTimelineChart chartVariable: " + chartVariable + ", scope: " + scope)
    let hash = getHash(); // Add hash check at top of function
    geoValues = {}; // Clear prior
    const selectedCountries = []; // top-level
    let response, data, geoIds;

    if (scope === "county") {
        // Fetch county data
        response = await fetch(`https://api.datacommons.org/v2/observation?key=AIzaSyCTI4Xz-UW_G2Q2RfknhcfdAnTHq5X5XuI&entity.expression=${entityId}%3C-containedInPlace%2B%7BtypeOf%3ACounty%7D&select=date&select=entity&select=value&select=variable&variable.dcids=${chartVariable}`, {
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
        const response2 = await fetch('https://api.datacommons.org/v2/node?key=AIzaSyCTI4Xz-UW_G2Q2RfknhcfdAnTHq5X5XuI', {
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
        response = await fetch('https://api.datacommons.org/v2/resolve?key=AIzaSyCTI4Xz-UW_G2Q2RfknhcfdAnTHq5X5XuI', {
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
        const response2 = await fetch('https://api.datacommons.org/v2/node?key=AIzaSyCTI4Xz-UW_G2Q2RfknhcfdAnTHq5X5XuI', {
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

    } else if (scope === "country") {// Fetch country ISO codes first
        const restResponse = await fetch("https://restcountries.com/v3.1/all");
        const countriesData = await restResponse.json();
    
        // Get all ISO Alpha-2 codes
        const selectedCountries = countriesData.map(country => country.cca2).filter(Boolean); // filter out undefined/null
    
        console.log("Selected Countries:", selectedCountries); // Debug log
    
        // Fetch country dcids using ISO codes

        response = await fetch('https://api.datacommons.org/v2/resolve?key=AIzaSyCTI4Xz-UW_G2Q2RfknhcfdAnTHq5X5XuI', {
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
        const response2 = await fetch('https://api.datacommons.org/v2/node?key=AIzaSyCTI4Xz-UW_G2Q2RfknhcfdAnTHq5X5XuI', {
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
    const url = `https://api.datacommons.org/v2/observation?key=AIzaSyCTI4Xz-UW_G2Q2RfknhcfdAnTHq5X5XuI&variable.dcids=${chartVariable}&${geoIds.map(id => `entity.dcids=${id}`).join('&')}`;
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
   // Format data
   const formattedData = [];
    //alert(JSON.stringify(geoValues)) // TO DO: Only send countries that exist in the dataset.
    for (const geoId in geoValues) {
        if (timelineData.byVariable[chartVariable].byEntity[geoId].orderedFacets) { // Avoids error if country (India) is not in water timeline
            formattedData.push({
                name: geoValues[geoId].name,
                observations: timelineData.byVariable[chartVariable].byEntity[geoId].orderedFacets[0]['observations']
            });
        }
    }
     
    // Get unique years
    let yearsSet = new Set();
    formattedData.forEach(location => {
        location.observations.forEach(obs => {
            yearsSet.add(obs.date);
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
    dataCopy.forEach(location => {
        if (location.observations && location.observations.length > 0) {
            // Find the observation for the latest year
            const latestObs = location.observations.find(obs => obs.date.split('-')[0] === latestYear);
            location.latestValue = latestObs ? latestObs.value : null;
        } else {
            location.latestValue = null;
        }
    });
    // Filter out locations with no valid latest value
    const validData = dataCopy.filter(location => location.latestValue !== null);
    if (showAll === 'showTop5') {
        selectedData = validData
            .sort((a, b) => b.latestValue - a.latestValue)
            .slice(0, Math.min(5, validData.length));
    } else if (showAll === 'showBottom5') {
        selectedData = validData
            .sort((a, b) => a.latestValue - b.latestValue)
            .slice(0, Math.min(5, validData.length));
    } else {
        selectedData = dataCopy;
    }

    // Get datasets
    const datasets = selectedData.map(location => {
        return {
            label: location.name,
            data: years.map(year => {
                const observation = location.observations.find(obs => obs.date === year);
                return observation ? observation.value : null;
            }),
            borderColor: 'rgb(' + Math.floor(Math.random() * 256) + ', ' + Math.floor(Math.random() * 256) + ', ' + Math.floor(Math.random() * 256) + ')',
            backgroundColor: 'rgba(0, 0, 0, 0)',
        };
    });

    // For Area Chart
    const datasets1 = selectedData.map(location => {
        return {
            label: location.name,
            data: years.map(year => {
                const observation = location.observations.find(obs => obs.date === year);
                return observation ? observation.value : null;
            }),
            backgroundColor: 'rgba(' + Math.floor(Math.random() * 256) + ', ' + Math.floor(Math.random() * 256) + ', ' + Math.floor(Math.random() * 256) + ',0.2)',
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
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text:chartText
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: `${chartText}` // Update y-axis label//chartText
                        //text: `${chartText} (Per Capita)` // Update y-axis label//chartText
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
              plugins: {
                title: {
                  display: true,
                  text: (ctx) => chartTitle
                },
                tooltip: {
                  mode: 'index'
                },
              },
              interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
              },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Years'
                }
              },
              y: {
                stacked: true,
                title: {
                  display: true,
                  text: `${chartText}` 
                 // text:`${chartText} (Per Capita)`// 'County Population'
                } 
              }
            }
            }
    }

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
    } 
}
function refreshTimeline() {
    let hash = getHash();
    let scope = "country";
    if (hash.scope) {
        scope = hash.scope;
    }
    //waitForElm('#chartVariable').then((elm) => { // Avoid this since values won't be there yet.
        //let chartVariable = 'Count_Person';
        let chartVariableSelect = document.getElementById('chartVariable');
        //setTimeout(() => { // Hack - wait 3 seconds. Later we'll wait for #chartVariable to have a value.
                        
            let chartVariable = chartVariableSelect.options[chartVariableSelect.selectedIndex].value;

            let showAll = document.querySelector('input[name="whichLines"]:checked').value;
            if(!showAll) {showAll = 'showTop5';}

            let entityIdSelect = document.getElementById('entityId');
            let entityId = entityIdSelect.options[entityIdSelect.selectedIndex].value;
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
        if (value && text) {
            const opt = document.createElement('option');
            opt.value = value;
            opt.text = text;
            dcidSelect.add(opt);
        }
    });

    // Set default selection if options exist
    if (filteredOptions.length > 0) {
        dcidSelect.value = filteredOptions[0][valueIndex].trim(); // Set to the first option's value
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
function toggleDivs() {
    // Get selected value from radio buttons
    const selectedValue = document.querySelector('input[name="toogleChartType"]:checked').value;
    if (selectedValue == "both") {
        document.getElementById('div1').style.display = 'block';
        document.getElementById('div2').style.display = 'block';
        return;
    }
    // Hide both divs initially
    document.getElementById('div1').style.display = 'none';
    document.getElementById('div2').style.display = 'none';

    // Show the selected div
    document.getElementById(selectedValue).style.display = 'block';
}
//Population data for different scope

