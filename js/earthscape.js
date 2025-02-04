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
//Updated code displays timelinechart(Line chart only)for scopes country, state, and county 
let geoValues = {};

async function getTimelineChart(scope, chartVariable, entityId, showAll, chartText) {
    geoValues = {}; // Clear prior

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
        const statesList = ['Florida', 'New Jersey', 'New York State', 'New Mexico', 'Alaska'];
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
    } else if (scope === "country") {
        // Fetch country data
        const selectedCountries = ["US", "CN", "IN"];
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
        geoIds = data.entities.map(entity => entity.candidates[0].dcid);

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
            const countryName = data2.data[geoId].arcs.name.nodes[0]['value'];
            geoValues[geoId] = {
                name: countryName,
                state: countryName
            };
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
    for (const geoId in geoValues) {
        if (timelineData.byVariable[chartVariable].byEntity[geoId]) {
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
    formattedData.forEach(location => {
        location.averageValue = location.observations.reduce((sum, obs) => sum + obs.value, 0) / location.observations.length;
    });
    if (showAll === 'showTop5') {
        selectedData = formattedData.sort((a, b) => b.averageValue - a.averageValue).slice(0, 5);
    } else if (showAll === 'showBottom5') {
        selectedData = formattedData.sort((a, b) => a.averageValue - b.averageValue).slice(0, 5);
    } else {
        selectedData = formattedData;
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
    const datasets1 = selectedData.map(county => {
        return {
            label: county.county,
            data: years.map(year => {
                const observation = county.observations.find(obs => obs.date === year);
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
                    text: chartText
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
                        text: chartText
                    }
                }
            }
        }
    };

    // For Area Chart
    let chartVariableSelect = document.getElementById('chartVariable');
    let chartTitle = chartVariableSelect.options[chartVariableSelect.selectedIndex].value;

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
                  text: 'County Population'
                } 
              }
            }
            }
    }

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
/*//original-code
// Function to get multi-location timelines
// IN PROGRESS: Making interchangable with country, state and zip code datasets.
let geoValues = {};

async function getTimelineChart(scope, chartVariable, entityId, showAll, chartText) {
    geoValues = {}; // Clear prior
    // scope:
        // zip
        // county - Fetch all geoIds for counties
        // state
        // country

    // chartVariable - Count_Person, etc.

    // entityId is geoId of the location, eg, geoId/06 for California
    
    // THREE API calls to Gooogle Data Commons

    // GET GeoID list
    const response = await fetch(`https://api.datacommons.org/v2/observation?key=AIzaSyCTI4Xz-UW_G2Q2RfknhcfdAnTHq5X5XuI&entity.expression=${entityId}%3C-containedInPlace%2B%7BtypeOf%3ACounty%7D&select=date&select=entity&select=value&select=variable&variable.dcids=${chartVariable}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "dates": ""
        })
    });
    const data = await response.json();

    // Use the geoId list to fetch respective county + state names
    const geoIds = Object.keys(data.byVariable[chartVariable].byEntity);
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
        node = data2.data[geoId].arcs;
        stateName = node.containedInPlace.nodes[0]['name'];
        countyName = node.name.nodes[0]['value'];
        // countyCodes
        geoValues[geoId] = {
            name: countyName,
            state: stateName
        };
    })

    // Fetch country codes for selected countries
    if (scope == "country") {
        let selectedCountries = "CN,IN,US";
        chartVariable = "Count_Person"; // HACK, should not be needed

        // Fetch country codes for selected countries
        let responseCountryCodes = await fetch('https://api.datacommons.org/v2/resolve?key=AIzaSyCTI4Xz-UW_G2Q2RfknhcfdAnTHq5X5XuI', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "nodes": selectedCountries,
                "property": "<-description{typeOf:Country}->dcid"
            })
        });

        // Make a dictionary of country code -> name
        //const countryCodes = {};

        const data = await responseCountryCodes.json();
        if (data?.entities && Array.isArray(data.entities)) { 
            data.entities.forEach(entity => {
                if (entity.node && entity.candidates && entity.candidates[0] && entity.candidates[0].dcid) {
                    //countryCodes
                    geoValues[entity.candidates[0].dcid] = entity.node;
                }
            });
        } else {
            console.warn('No entities found in the response data. Append to URL: #country=IN,CN,US');
            alert('Append to URL: #country=IN,CN,US');
        }

        // Fetch data for selected countries and selected variable
        const geoIds = Object.keys(geoValues);
        const url = `https://api.datacommons.org/v2/observation?key=AIzaSyCTI4Xz-UW_G2Q2RfknhcfdAnTHq5X5XuI&variable.dcids=${chartVariable}&${geoIds.map(id => `entity.dcids=${id}`).join('&')}`
        //alert(url);
        const response2 = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "date": "",
                "select": ["date", "entity", "value", "variable"]
            })
        })
        geoValues = await response2.json();
        //universalData = await response2.json(); // HACK - name will be changed from universalData
    }

    // Fetch observational data using geoIds list
    let url = `https://api.datacommons.org/v2/observation?key=AIzaSyCTI4Xz-UW_G2Q2RfknhcfdAnTHq5X5XuI&variable.dcids=${chartVariable}&${geoIds.map(id => `entity.dcids=${id}`).join('&')}`

    let response3;
    let timelineData;

    // Not implimented here yet.
    const scopeNodes = {
        state: ['Florida', 'New Jersey', 'New York State', 'New Mexico', 'Alaska'],
        country: ['US', 'CN', 'IN'],
    };


    if (scope == "county") {
        response3 = await fetch(url, {
            
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "date": "",
                    "select": ["date", "entity", "value", "variable"]
                })
        })
        timelineData = await response3.json();
    } else if (scope == "country") {
        // Fetch data for selected countries and selected variable

        let geoIds = Object.keys(geoValues);
        let url = `https://api.datacommons.org/v2/observation?key=AIzaSyCTI4Xz-UW_G2Q2RfknhcfdAnTHq5X5XuI&variable.dcids=${chartVariable}&${geoIds.map(id => `entity.dcids=${id}`).join('&')}`
        response3 = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "date": "",
                "select": ["date", "entity", "value", "variable"]
            })
        })
        timelineData = await response3.json();
        console.log("timelineData")
        console.log(timelineData)
    } else if (scope == "state") {
        let statesList = ['Florida', 'New Jersey', 'New York State', 'New Mexico', 'Alaska']; // 'New York' does not work, use 'New York State' - idk why
    
        response3 = await fetch('https://api.datacommons.org/v2/resolve?key=AIzaSyCTI4Xz-UW_G2Q2RfknhcfdAnTHq5X5XuI', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "nodes": statesList,
                "property": "<-description{typeOf:State}->dcid"
            })
        });
        timelineData = await response3.json();
        console.log("timelineData");
        console.log(timelineData);
    }
    

    // Format data
    const formattedData = [];
    console.log("geoValues: ");
    console.log(geoValues);
    for (const geoId in geoValues) {
        // BUGBUG - changing DCID menu or state leads to: Cannot read properties of undefined (reading 'orderedFacets')
        if (scope == "county") {
            formattedData.push({
                county: `${geoValues[geoId].name}, ${geoValues[geoId].state}`,
                observations: timelineData.byVariable[chartVariable].byEntity[geoId].orderedFacets[0]['observations']
            })
        } else {
            // TO INVESTIGATE
            formattedData.push({
                country: geoValues[geoId],
                observations: timelineData.byVariable[chartVariable].byEntity[geoId].orderedFacets.find((element) => element.facetId == facetId)['observations']
            })
        }
    }

    // Get unique years
    let yearsSet = new Set();
    formattedData.forEach(county => {
        county.observations.forEach(obs => {
            yearsSet.add(obs.date);
        });
    });
    const years = [...yearsSet].sort((a, b) => a - b);
    
    // Showing all or top 5 or bottom 5
    let selectedData;
    formattedData.forEach(county => {
        county.averageLandCover = county.observations.reduce((sum, obs) => sum + obs.value, 0) / county.observations.length;
    });
    if (showAll == 'showTop5') {
        selectedData = formattedData.sort((a, b) => b.averageLandCover - a.averageLandCover).slice(0, 5);
    } 
    else if (showAll == 'showBottom5') {
        selectedData = formattedData.sort((a, b) => a.averageLandCover - b.averageLandCover).slice(0, 5);
    }
    else {
        selectedData = formattedData;
    }

    // Get datasets
    const datasets = selectedData.map(county => {
        return {
            label: county.county,
            data: years.map(year => {
                const observation = county.observations.find(obs => obs.date === year);
                return observation ? observation.value : null;
            }),
            borderColor: 'rgb(' + Math.floor(Math.random() * 256) + ', ' + Math.floor(Math.random() * 256) + ', ' + Math.floor(Math.random() * 256) + ')',
            backgroundColor: 'rgba(0, 0, 0, 0)',
        };
    });

    const datasets1 = selectedData.map(county => {
        return {
            label: county.county,
            data: years.map(year => {
                const observation = county.observations.find(obs => obs.date === year);
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
                    text: chartText
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
                        text: chartText
                    }
                }
            }
        }
    };

      const data1 = {
        labels: years,
        datasets: datasets1
      };

    //let chartTitle = 'The County Populations X'; // chartVariable DD

    // Do we need to wait for #chartVariable to have a value?
    // Might share this with refreshTimeline()
    let chartVariableSelect = document.getElementById('chartVariable');
    let chartTitle = chartVariableSelect.options[chartVariableSelect.selectedIndex].value;

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
                  text: 'County Population'
                } 
              }
            }
            }
    }

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
*/
function refreshTimeline() {
    let hash = getHash();
    let scope = "county";
    if (hash.scope) {
        scope = hash.scope;
    }
    //waitForElm('#chartVariable').then((elm) => { // Avoid this since values won't be there yet.
        //let chartVariable = 'Count_Person';
        let chartVariableSelect = document.getElementById('chartVariable');
        //setTimeout(() => { // Hack - wait 3 seconds. Later we'll wait for #chartVariable to have a value.
                        
            let chartVariable = chartVariableSelect.options[chartVariableSelect.selectedIndex].value;

            let showAll = document.querySelector('input[name="countyShow"]:checked').value;
            if(!showAll) {showAll = 'showTop5';}

            let entityIdSelect = document.getElementById('entityId');
            let entityId = entityIdSelect.options[entityIdSelect.selectedIndex].value;
            let chartText = document.getElementById('chartVariable').options[document.getElementById('chartVariable').selectedIndex].text;

            //alert(chartVariable + " " + chartText)
            getTimelineChart(scope, chartVariable, entityId, showAll, chartText);
        //},3000);
    //});
}
async function updateDcidSelectFromSheet(scope) {

    let hash = getHash();
    if (!scope && hash.scope) {
        scope = hash.scope;
    }

    /*
    // Several Google Sheet tabs were previously hardcoded

    //loadGoalsDropdown("goals","https://docs.google.com/spreadsheets/d/1IGyvcMV5wkGaIWM5dyB-vQIXXZFJUMV3WRf_UmyLkRk/pub?gid=456266073&single=true&output=csv");

    // Copy the sheet URL and modify in this format

    loadGoalsDropdown("water","https://docs.google.com/spreadsheets/d/1IGyvcMV5wkGaIWM5dyB-vQIXXZFJUMV3WRf_UmyLkRk/pub?gid=2049347939&single=true&output=csv");

    loadGoalsDropdown("air","https://docs.google.com/spreadsheets/d/1IGyvcMV5wkGaIWM5dyB-vQIXXZFJUMV3WRf_UmyLkRk/pub?gid=0&single=true&output=csv");

    loadGoalsDropdown("health", "https://docs.google.com/spreadsheets/d/1IGyvcMV5wkGaIWM5dyB-vQIXXZFJUMV3WRf_UmyLkRk/pub?gid=1911215802&single=true&output=csv");

    //loadGoalsDropdown("aquifers","https://docs.google.com/spreadsheets/d/1IGyvcMV5wkGaIWM5dyB-vQIXXZFJUMV3WRf_UmyLkRk/pub?gid=484745180&single=true&output=csv");

    //loadGoalsDropdown("conservation","https://docs.google.com/spreadsheets/d/1IGyvcMV5wkGaIWM5dyB-vQIXXZFJUMV3WRf_UmyLkRk/pub?gid=374006451&single=true&output=csv");

    //loadGoalsDropdown("population", "https://docs.google.com/spreadsheets/d/1IGyvcMV5wkGaIWM5dyB-vQIXXZFJUMV3WRf_UmyLkRk/pub?gid=471398138&single=true&output=csv");

    //loadGoalsDropdown("zipcodeleveldata","https://docs.google.com/spreadsheets/d/1IGyvcMV5wkGaIWM5dyB-vQIXXZFJUMV3WRf_UmyLkRk/pub?gid=492624247&single=true&output=csv");

    */


    const dcidSelect = document.getElementById('chartVariable');
    if (!dcidSelect) {
        alert("Dropdown element with ID 'chartVariable' not found.");
        return;
    }

    dcidSelect.innerHTML = ''; // Clear existing options

    //try {
        // Replace this URL with your specific sheet's export URL
        const sheetUrl = "https://docs.google.com/spreadsheets/d/1IGyvcMV5wkGaIWM5dyB-vQIXXZFJUMV3WRf_UmyLkRk/export?format=csv&gid=0";

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
            console.warn("No options matched the provided scope:", normalizedScope);
        }
    //} catch (error) {
    //    console.error("Error fetching or parsing Google Sheet data:", error);
    //}
}
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
