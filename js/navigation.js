/* Localsite Filters */
// hashChanged() responds to hash changes
// loadLocalObjectLayers(1) - Loads all layers for layer settings. Also loads localObject.layers for later use when showApps clicked. Also adds state hash for layers requiring a state.
// Works WITHOUT map.js. Loads map.js if hash.show gets populated.

// FLOW
// renderMapShapeAfterPromise() loads topo shapes - For #geomap in search filters
// showTabulatorList() renders country and state lists
// updateMapColors() uses values in sorted column to place color scale on map shapes

// Map click → goHash() → hash change → updateSelectedTableRows() → geotable.selectRow() → rowSelected event WITHOUT goHash() again.

// We disable the rowSelected event handler during the updateSelectedTableRows function so it doesn't re-fire the goHash().



// TO DO: Unselecting county on map is not unchecking tabulator checkbox

if(typeof window.local_app == 'undefined') { window.local_app = {}; console.log("BUG: Move navigation.js after localsite.js"); } // In case navigation.js included before localsite.js
var local_app = window.local_app; // Reference to global local_app
if(typeof layerControls=='undefined') { var layerControls = {}; } // Object containing one control for each map on page.
if(typeof dataObject == 'undefined') { var dataObject = {}; }
if(typeof localObject == 'undefined') { var localObject = {};} // localObject.geo will save a list of loaded counties for multiple states
if(typeof localObject.stateCountiesLoaded == 'undefined') { localObject.stateCountiesLoaded = []; } // Holds a geo code for each state and province loaded. (but not actual counties)
if(typeof localObject.geo == 'undefined') { localObject.geo = []; } // Holds counties.
localObject.us_stateIDs = {AL:1,AK:2,AZ:4,AR:5,CA:6,CO:8,CT:9,DE:10,FL:12,GA:13,HI:15,ID:16,IL:17,IN:18,IA:19,KS:20,KY:21,LA:22,ME:23,MD:24,MA:25,MI:26,MN:27,MS:28,MO:29,MT:30,NE:31,NV:32,NH:33,NJ:34,NM:35,NY:36,NC:37,ND:38,OH:39,OK:40,OR:41,PA:42,RI:44,SC:45,SD:46,TN:47,TX:48,UT:49,VT:50,VA:51,WA:53,WV:54,WI:55,WY:56,AS:60,GU:66,MP:69,PR:72,VI:78};
// Later: localObject.stateZipsLoaded

/* Allows map to remove selected shapes when backing up. */
document.addEventListener('hashChangeEvent', function (elem) {
    console.log("navigation.js detects URL hashChangeEvent");
    hashChanged();
}, false);
if(typeof hiddenhash == 'undefined') {
    var hiddenhash = {};
}
function updateCountiesTabText() {
    let hash = getHash();
    if (!hash.geo) {
        $(".countiesTabText").text(hash.state ? "Counties" : "States");
        return;
    }
    let geoIds = hash.geo.split(",").filter(Boolean);
    if (geoIds.length === 1) {
        let match = localObject.geo && localObject.geo.find(function(row) { return row.id === geoIds[0]; });
        $(".countiesTabText").text(match && match.name ? match.name : "1 County");
    } else if (geoIds.length > 1) {
        $(".countiesTabText").text(geoIds.length + " Counties");
    } else {
        $(".countiesTabText").text("Counties");
    }
}
function updateGeoviewSelectText() {
    let hash = getHash();
    let updated = false;
    if ((hash.geoview == "country" || hash.geoview == "state" || !hash.geoview) && hash.state) {
        let states = hash.state.split(",").filter(Boolean);
        if (states.length === 1 && typeof getState === 'function') {
            $("#geoview_select_text").text(getState(states[0]) || states[0]);
            updated = true;
        } else if (states.length > 1) {
            $("#geoview_select_text").text(states.length + " States");
            updated = true;
        }
    } else if (hash.geoview == "countries" && hash.country) {
        let countries = hash.country.split(",").filter(Boolean);
        if (countries.length === 1 && localObject["countries"]) {
            let match = localObject["countries"][countries[0]];
            $("#geoview_select_text").text(match ? match.CountryName : countries[0]);
            updated = true;
        } else if (countries.length > 1) {
            $("#geoview_select_text").text(countries.length + " Countries");
            updated = true;
        }
    }
    if (updated) {
        $("#geoview_select_text").show();
        $("#geoview_select_open").hide();
    }
}
function hashChanged() {

    let loadGeomap = false;
    let hash = getHash(); // Might still include changes to hiddenhash
    const validGeoviews = ["state", "country", "countries", "county", "zip", "city", "earth"];
    const isValidGeoview = !hash.geoview || validGeoviews.includes(hash.geoview);
    console.log("hashChanged() navigation.js");
    if (hash.state != priorHash.state || hash.country != priorHash.country || hash.geoview != priorHash.geoview) {
        updateGeoviewSelectText();
        updateCountiesTabText();
    }
    // Clear geo values that don't belong to the current single state
    if (hash.geo && hash.state && !hash.state.includes(",")) {
        let stateFips = localObject.us_stateIDs[hash.state.toUpperCase()];
        if (stateFips) {
            let prefix = "US" + String(stateFips).padStart(2, "0");
            let geoIds = hash.geo.split(",").filter(Boolean);
            let valid = geoIds.filter(function(id) { return id.startsWith(prefix); });
            if (valid.length < geoIds.length) {
                goHash({"geo": valid.join(",")});
                return;
            }
        }
    }
    if (hash.geo != priorHash.geo) {
        updateCountiesTabText();
        if (location.pathname.indexOf('/localsite/info/') >= 0) {
            let earlyGeoDeselect = "";
            if (priorHash.geo) {
                const priorGeoArray = priorHash.geo.split(",");
                const hashGeoArray = hash.geo ? hash.geo.split(",") : [];
                earlyGeoDeselect = priorGeoArray.filter(value => !hashGeoArray.includes(value)).join(",");
            }
            if (hash.geoview != "country") {
                updateSelectedTableRows(hash.geo, earlyGeoDeselect, 0);
            }
        }
    }
    if (hash.geoview == "state" && !hash.state) { // When deleting state in URL
        $(".region_service").text("");
        // TO DO - Send states to tabulator somewhere. Might be intermitant.
        goHash({"geoview":"country"});

        //goHash({"geoview":""}); // Until states are sent to tabulator. Didn't help, still no state list whe reopening locations tab.

        return;
    }
    // Was getting called for each state checked. 4th check calls hashChanged() 5 times (1 + 4)
    // Add timestamp to prevent multiple calls
    consoleLog("nav hash changed " + JSON.stringify(hash));
    populateFieldsFromHash();
    productList("01","99","All Harmonized System Categories"); // Sets title for new HS hash.

    if (hash.geoview == "earth") {
        let latLonZoom = "-115.84,31.09,1037";
        if (localStorage.latitude && localStorage.longitude) {
            latLonZoom = localStorage.longitude + "," + localStorage.latitude + ",1037";
        }
        testAlert("hashChanged earth: waiting for #globalMapHolder");
        waitForElm('#globalMapHolder').then((elm) => {
            testAlert("hashChanged earth: showGlobalMap");
            showGlobalMap(`https://earth.nullschool.net/#current/chem/surface/currents/overlay=no2/orthographic=${latLonZoom}`);
        });
        $("#geoPicker").hide();
        $(".stateFilters").hide();
    }

    let stateAbbrev = "";
    if (hash.statename) { // From Tabulator state list, convert to 2-char abbrviation
        //alert("hash.statename1 " + hash.statename);
        //alert("hiddenhash.statename1 " + hiddenhash.statename);
        waitForElm('#state_select').then((elm) => {
            //theState = $("#state_select").find(":selected").val();
            //stateAbbrev = $("#state_select[name=\"" + hash.statename + "\"]").val();
            stateAbbrev = $('#state_select option:contains(' + hash.statename + ')').val();
            $("#state_select").val(stateAbbrev);
            //alert("hiddenhash.state " + hiddenhash.state);
            hiddenhash.statename = "";
            goHash({'state':stateAbbrev,'statename':''});
        });
        return;
    }

    if (hash.state) {
        stateAbbrev = hash.state.split(",")[0].toUpperCase();
        waitForElm('#state_select').then((elm) => {
            $("#state_select").val(stateAbbrev);
        });      
        // Apply early since may be used by changes to geo
        $("#state_select").val(stateAbbrev);
        if (priorHash.state && hash.state != priorHash.state) {
            console.log("hitRefreshNote is now turned off")
            //$("#hitRefreshNote").show();
        }
    } else {
        $(".locationTabText").text("United States");
    }
    if (hash.state != priorHash.state) {
        waitForElm('#state_select').then((elm) => {
            //alert("hash.state " + hash.state + " stateAbbrev: " + stateAbbrev);
            if (stateAbbrev) {
                $("#state_select").val(stateAbbrev);
            } else {
                $("#state_select").val("");
            }
        });
    }
    if (priorHash.show && hash.show !== priorHash.show) {
        hideSide("list");
    } else if (hash.state !== priorHash.state) {
        hideSide("list");

        // Seemed to get repopulated with Georgia.
        //$(".listTitle").hide(); // Recyclers
        //alert("test2")
    }
    if (hash.show != priorHash.show) {
        if (hash.show && priorHash.show) {
            console.log("Close location filter, show new layer.");
            closeLocationFilter();
        }
        if (!hash.appview) {
            waitForElm('.showApps').then((elm) => {
                // Same as in closeAppsMenu(), but calling that function from here generates blank page
                $("#bigThumbPanelHolder").hide();
                $(".showApps").removeClass("filterClickActive");
            });
        }
        // Prevents older top maps on new tab pages, where details reside at top.
        if (param.showtopmap != "false") {
            loadScript(theroot + 'js/map.js', function(results) {
                console.log("navigation.js loaded map.js");
            });
        }
        //if (hash.show == priorHash.show) {
        //  hash.show = ""; // Clear the suppliers display
        //}
        if (priorHash.show) {
          $(".listTitle").empty();
          $(".catList").empty();
        } else if (!hash.show) {
            hideSide("list");
        }
        delete hash.naics; // Since show value invokes new hiddenhash
        clearHash("naics");
        //getNaics_setHiddenHash(hash.show); // Sets hiddenhash.naics for use by other widgets.

        //hash.naics = ""; // Since go value invokes hiddenhash
        // Then we call applyIO at end of this hashChanged function

        if (hash.show != "vehicles") {
            $("#introframe").hide();
        }
        if (hash.show != "ppe" || hash.show != "suppliers") {
            $(".layerclass.ppe").hide();
        }
        if (hash.show != "opendata") {
            $(".layerclass.opendata").hide();
        }

        //$("#tableSide").hide();

        if ($("#main-nav .catList").is(":visible")) {
            $("#selected_states").hide();
        }

        $(".layerclass." + hash.show).show();
    }

    let mapCenter = [];
    let zoom = 4; // Wide for entire US

    // Before hash.state to utilize initial lat/lon
    if (hash.lat != priorHash.lat || hash.lon != priorHash.lon) {
        //alert("hash.lat " + hash.lat + " priorHash.lat " + priorHash.lat)
        $("#lat").val(hash.lat);
        $("#lon").val(hash.lon);
        mapCenter = [hash.lat,hash.lon];
    }
    if (hash.state != priorHash.state) {
        // If map is already loaded, recenter map.  See same thing below
        // Get lat/lon from state dropdown #state_select

        // Potential BugBug - this runs after initial map load, not needed (but okay as long as zoom is not set).
        
        // Similar resides in map.js for ds
        
        // Used for map2
        /*
        if($("#state_select").find(":selected").val()) {
            let theState = $("#state_select").find(":selected").val();
            if (theState != "") {
              let kilometers_wide = $("#state_select").find(":selected").attr("km");
              zoom = zoomFromKm(kilometers_wide); // In map.js
              let lat = $("#state_select").find(":selected").attr("lat");
              let lon = $("#state_select").find(":selected").attr("lon");
              //alert("lat " + lat + " lon " + lon)
              mapCenter = [lat,lon];
            }
        } else {
            console.log("ERROR #state_select not available");
        }
        console.log("Recenter map " + mapCenter)
        */

        //showThumbMenu(hash.show, "#bigThumbMenu");
    }
    if (hash.state) {
        $(".showforstates").show();
    } else {
        $(".showforstates").hide();
    }
    
    if (mapCenter.length > 0) { // Set when hash.lat changes
        if (typeof L === 'undefined') {
            console.log("Error: L not defined for map");
        } else if (typeof L.DomUtil === "object") {
            // Avoiding including ",5" for zoom since 7 is already set. 
            // NOT IDEAL: This also runs during init.
            // TODO: If reactiveating, omit on init, or pass in default zoom.
            /*
            console.log("Recenter map zoom " + zoom)
            let pagemap = document.querySelector('#map1')._leaflet_map; // Recall existing map
            let pagemap_container = L.DomUtil.get(pagemap);
            if (pagemap_container != null) {
                // Test here: http://localhost:8887/localsite/info/embed.html#state=GA
              pagemap.flyTo(mapCenter, zoom);
            }
            */
            if (typeof document.querySelector('#map2') === 'undefined' || typeof document.querySelector('#map2') === 'null') {
                console.log("#map2 undefined");
            } else if (document.querySelector('#map2')) {

                let pagemap2 = document.querySelector('#map2')._leaflet_map; // Recall existing map
                let pagemap_container2 = L.DomUtil.get(pagemap2);
                // This will not be reachable on initial load.
                if (pagemap_container2 != null) {
                  pagemap2.flyTo(mapCenter);

                }
            }
        } else {
            console.log("ERROR lat changed for map2, but leaflet not loaded. typeof L undefined.");
        }
    }
    
    if (hash.geoview != priorHash.geoview) {
        if (hash.geoview) {
            waitForElm('#geoview_select').then((elm) => {
                setGeoviewSelect(hash.geoview);
            });
            /*
            // Tabulator list is already updated before adjacent geomap is rendered.
            if (hash.geoview == "state" && hash.state) {
                console.log("Call1 locationFilterChange counties");
                locationFilterChange("counties");
            } else {
                //console.log("Call locationFilterChange with no value")
                //locationFilterChange("");
            }
            */
        } else {
            $("#hero_holder").show(); // Didn't work, so kept #hero_holder visible.
        }
    }
    if (hash.scope != priorHash.scope) {
        if (hash.scope) {
            waitForElm('#selectScope').then((elm) => {
                $("#selectScope").val(hash.scope);
                if (hash.scope == "county" || hash.scope == "zip") {
                    $("#entityId").show(); // List of states
                } else {
                    $("#entityId").hide();
                }
            })
        }
    }
    if (hash.state != priorHash.state) {
        if (hash.geoview && hash.geoview != "earth" && isValidGeoview) {
            loadGeomap = true;
        }
        if(location.host.indexOf('model.georgia') >= 0) {
            if (hash.state != "" && hash.state.split(",")[0].toUpperCase() != "GA") { // If viewing other state, use model.earth
                let goModelEarth = "https://model.earth" + window.location.pathname + window.location.search + window.location.hash;
                window.location = goModelEarth;
            }
        }

        $("#state_select").val(stateAbbrev);

        if (hash.state != "GA") {
            $(".regionFilter").hide();
            $(".geo-limited").hide();
        } else {
            $(".regionFilter").show();
            $(".geo-US13").show();
        }
        if (hash.state && hash.state.length == 2 && !($("#filterLocations").is(':visible'))) {
            $(".locationTabText").text($("#state_select").find(":selected").text());
            setGeoviewTitleFromState();
        } else if (!hash.state) {
           // $(".locationTabText").text("United States");
        }

        //&& hash.geoview == "state"
        if (hash.geoview && hash.geoview == priorHash.geoview) { // Prevents dup loading when hash.geoview != priorHash.geoview below.
            //if (hash.geoview != "earth" && hash.geoview != "countries" && hash.geoview != "country") {
            if (hash.geoview == "state") { // Might need other way to check we're viewing a state's counties
                console.log("loadStateCounties invoked by state change");
                loadStateCounties(0); // Add counties to state boundaries.
            }
        }
    }

    //if (hash.geoview != priorHash.geoview || (priorHash.state && !hash.state)) { // This did not support changing state in the URL.
    if (hash.geoview != priorHash.geoview || hash.state != priorHash.state) {
        if (!isValidGeoview) {
            $("#geoPicker").hide();
            $(".stateFilters").hide();
            $("#filterClickLocation").removeClass("filterClickActive");
            closeLocationFilter();
            updateHash({"geoview":""});
            console.log("Invalid geoview removed from hash");
        } else {
        /*
        if (hash.geoview) {
            openMapLocationFilter();
        }
        */

        // UNBUG - red goes away with 
        //if (hash.geoview == "country" && hash.state) { // Includes with and without hash.state

        //alert("hash.geoview " + hash.geoview);
        if (hash.geoview == "country") { // Includes with and without hash.state
            // COUNTRY - US and later other countries
            // TO DO - Make selected state(s) a color on country map.

            // BUG this displays the US map with all red shapes - and white for hash.state(s)

            let element = {};
            //element.scope = "state";

            element.scope = "country-us"

            //element.key = "State";
            //element.datasource = local_app.web_root() + "/localsite/info/data/map-filters/us-states.json";
            //element.datasource = local_app.web_root() + "/localsite/info/data/map-filters/us-states-edited.csv";
            // https://github.com/ModelEarth/localsite/blob/main/info/data/map-filters/us-states.csv
            element.datasource = local_app.web_root() + "/localsite/info/data/map-filters/us-states-full.csv";
            let formatType = "simple";

            
            element.columns = [
                {formatter:"rowSelection", titleFormatter:"rowSelection", hozAlign:"center", headerHozAlign:"center", width:10, headerSort:false},
                {title:"State", field:"StateName"},
                {title:"Pop", field:"Population", width:80, hozAlign:"right", headerSortStartingDir:"desc", headerHozAlign: "right", formatterParams:{precision:false}
                ,formatter: function(cell, formatterParams) {
                    let value = formatCell(cell.getValue());
                    //return value >= 0 ? `` : value;
                    return value;
                }

                // We can skip the sorter since formatCell() is applied above.
                /*
                ,
                sorter: formatType === "simple" ? function(a, b, aRow, bRow, column, dir, sorterParams) {
                    let aOutput = aRow.getData().PopulationSort;
                    let bOutput = bRow.getData().PopulationSort;
                    return aOutput - bOutput; // Sort based on the numeric `PopulationSort` values
                } : undefined
                */

                },
                {title:"CO<sub>2</sub>", field:"CO2", hozAlign:"right", formatter:"money", headerHozAlign: "right", formatterParams:{precision:false}
                ,formatter: function(cell, formatterParams) {
                    let value = formatCell(cell.getValue());
                    /*
                    if (value >= 1) {
                        return `${Math.round(value)}K`;  // Remove decimals if >= 1
                    } else if (value > 0) {
                        return `${value}K`;  // Keep decimals for values between 0 and 1
                    }
                    */
                    return value;  // No suffix if the value is 0
                }
                },
                {title:"Methane", field:"Methane", hozAlign:"right", formatter:"money", headerHozAlign: "right", formatterParams:{precision:false},formatter: function(cell, formatterParams) {
                    let value = formatCell(cell.getValue());
                    //return value > 0 ? `${value}K` : value;
                    return value;
                }},
                {title:"SqMiles", field:"SqMiles", hozAlign:"right", headerHozAlign: "right", headerSortStartingDir:"desc",formatter: function(cell, formatterParams) {
                    let value = formatCell(cell.getValue());
                    //return value > 0 ? `${value}K` : value;
                    return value;
                }}
            ];
            // Displays tabulator list of states, but USA map shapes turned red. See also "pink" in this page
            //if (hash.geoview == "country") {
                loadObjectData(element, 0);
            //} else if (hash.geoview == "state" && !hash.state) {
            //    loadObjectData(element, 0); // Display tabulator list of states.
            //}

        } else if (hash.state && hash.geoview == "state") { // hash.geoview && hash.geoview != "country"
            console.log("loadStateCounties invoked by geoview change");
            console.log("priorHash.geoview: " + priorHash.geoview + ", hash.geoview: " + hash.geoview);
            loadStateCounties(0);
        } else if (hash.geoview == "countries") {
            // COUNTRIES
            // TO DO: Remove countries.csv and other non-full.csv files from python file generation.
            const csvFilePath = local_app.web_root() + "/localsite/info/data/map-filters/countries-full.csv"; // Or use the full version
            
            const element = {};
            element.scope = "countries";
            element.key = "Country";
            element.columns = [
                    {formatter:"rowSelection", titleFormatter:"rowSelection", hozAlign:"center", headerHozAlign:"center", width:10, headerSort:false},
                    {title:"Country", field:"CountryName", minWidth:140},
                    {title:"Pop", field:"Population", minWidth:70, hozAlign:"right", headerSortStartingDir:"desc", sorter:"number", formatter:"money", headerHozAlign: "right", formatterParams:{precision:false},formatter: function(cell, 
                    formatterParams) {
                        let value = formatCell(cell.getValue());
                        return value;
                    }},
                    {title:"CO<sub>2</sub>", field:"CO2", minWidth:90, hozAlign:"right", sorter:"number", headerHozAlign: "right", formatter: function(cell, formatterParams) {
                        if (cell.getValue() === '') {return}
                        let value = formatCell(cell.getValue());
                        return value;
                    }},
                    {title:"Per Person", field:"co2percap", minWidth:90, hozAlign:"right", sorter:"number", headerHozAlign: "right", formatter: function(cell, formatterParams) {
                        const rawValue = Number(cell.getValue());
                        if (isNaN(rawValue)) {return}
                        let value = rawValue.toFixed(2);
                        return value + " tons";
                    }},
                    {title:"Sq Miles", field:"SqMiles", minWidth:90, hozAlign:"right", sorter:"number", headerHozAlign: "right", formatter: function(cell, formatterParams) {
                        let value = formatCell(cell.getValue());
                        return value;
                    }},
                ];
            if(typeof localObject[element.scope] == 'undefined') {
                localObject[element.scope] = []; // Holds countries.
            }

            // Fetch just once, otherwise recall from localObject.
            if (Object.keys(localObject[element.scope]).length <= 0) {
                function parseCsvRows(csvText) {
                    const rows = [];
                    let row = [];
                    let current = "";
                    let inQuotes = false;
                    for (let i = 0; i < csvText.length; i++) {
                        const char = csvText[i];
                        if (char === '"') {
                            if (inQuotes && csvText[i + 1] === '"') {
                                current += '"';
                                i++;
                            } else {
                                inQuotes = !inQuotes;
                            }
                        } else if (char === "," && !inQuotes) {
                            row.push(current);
                            current = "";
                        } else if ((char === "\n" || char === "\r") && !inQuotes) {
                            if (char === "\r" && csvText[i + 1] === "\n") {
                                i++;
                            }
                            row.push(current);
                            rows.push(row);
                            row = [];
                            current = "";
                        } else {
                            current += char;
                        }
                    }
                    if (current.length > 0 || row.length > 0) {
                        row.push(current);
                        rows.push(row);
                    }
                    return rows;
                }

                fetch(csvFilePath)
                  .then(response => {
                      if (!response.ok) {
                          throw new Error("Failed to load CSV: " + response.status);
                      }
                      return response.text();
                  })
                  .then(csvText => {
                      const rows = parseCsvRows(csvText);
                      if (!rows.length) {
                          return;
                      }
                      const headers = rows[0].map(cell => (cell || "").trim());
                      const myData = rows.slice(1).filter(row => row && row.length).map(row => {
                          const obj = {};
                          headers.forEach((header, index) => {
                              obj[header] = (row[index] || "").trim();
                          });
                          return obj;
                      });
                    // Add PerCapita field to each row
                    const processedData = myData.map(row => {
                        const population = parseFloat(row.Population); // Ensure Population is treated as a number
                        const co2 = parseFloat(row.CO2); // Ensure CO2 is treated as a number
                        if (isNaN(population) || isNaN(co2)) {
                            console.warn(`Invalid data in row:`, row);
                        }
                        return {
                            ...row,
                            co2percap: (population > 0 && co2 > 0) ? co2/population : '', // Add PerCapita or null
                        };
                    });

                    // Either of these work, switch back to the first.
                    //localObject[element.scope] = [...processedData];
                    localObject[element.scope] = $.extend(true, [], processedData); // Clone/copy object without entanglement

                    //  Throughout the rest of page, changed:
                    //  extend(true, {}  to  extend(true, []

                    //const processedData = myData.map(row => {
                    //    return { ...row }; // Spread operator to include all keys dynamically
                    //});

                    console.log("localObject[element.scope] ");
                    console.log(localObject[element.scope]);

                    showTabulatorList(element);
                    //alert("Countries CSV loaded");
                  })
                  .catch(error => {
                      console.log("Error loading countries CSV: " + error);
                  });
            } else {
                // Data already exists, but still need to show the tabulator on reload
                console.log("localObject[element.scope] already exists, showing tabulator with existing data");
                showTabulatorList(element);
            }
        } else { // For backing up within apps
        
            // Since geoview "earth" does uses an iFrame instead of the geomap display.
            if (typeof relocatedStateMenu != "undefined") {
                waitForElm('#state_select').then((elm) => {
                    // DEACTIVATED, OCCURRED ON LOAD OF /localsite/info/
                    //relocatedStateMenu.appendChild(state_select); // For apps hero
                });
            }
            if (typeof relocatedScopeMenu != "undefined") {
                waitForElm('#selectScope').then((elm) => {
                    // DROPDOWN #selectScope was REMOVED  relocatedScopeMenu.appendChild(selectScope); // For apps hero
                });
            }
            $("#hero_holder").show();
        }
        }
    }
    if (hash.geoview == "earth" || hash.geoview == "countries") {
        waitForElm('#state_select').then((elm) => {
            $("#state_select").hide();
        });
    } else if (hash.geoview == "country") {
        if (hash.geoview != priorHash.geoview) {
            //alert("country");
            ///$("#geoPicker").show(); // Required for map to load
            $("#state_select").show();
        }
    } else if (hash.geoview == "state") {
        $("#state_select").show();
    } else if (hash.geoview && !isValidGeoview) {
        $("#state_select").hide();
        closeLocationFilter();
    } else if (!hash.geoview && priorHash.geoview) {
        closeLocationFilter();
    }

    // Hide Counties tab until sub-selections exist
    let showCountiesTab = hash.geo || hash.state || hash.geoview == "countries" || hash.geoview == "earth";
    let hideForNoSelection = (hash.geoview == "country" && !hash.state) || (hash.geoview == "state" && !hash.geo);
    if (hideForNoSelection) {
        $("#filterClickLocation").hide();
    } else if (showCountiesTab) {
        $("#filterClickLocation").show();
    }

    //Resides before geo
    if (hash.regiontitle != priorHash.regiontitle || hash.state != priorHash.state || hash.show != priorHash.show) {
        let theStateName;

        //alert("hash.regiontitle  " + hash.regiontitle);

        // Don't use, needs a waitfor
        if ($("#state_select").find(":selected").value) {
            theStateName = $("#state_select").find(":selected").text();
        }
        //waitForElm('#filterClickState').then((elm) => {
            //alert("#filterClickState available");
            if (theStateName != "") {
                $(".statetitle").text(theStateName);
                $(".regiontitle").text(theStateName);
                $(".locationTabText").text(theStateName);
                local_app.loctitle = theStateName;
            } else if (hash.state) {
                //let multiStateString = hash.state.replace(",",", ") + " - USA";
                let multiStateString = hash.state + " USA";
                $(".statetitle").text(multiStateString);
                $(".regiontitle").text(multiStateString);
                $(".locationTabText").text(multiStateString);
                local_app.loctitle = multiStateString;
            } else {
                local_app.loctitle = "USA";
                $(".statetitle").text("US");
                $(".regiontitle").text("United States");
                $(".locationTabText").text("United States");
            }
        //});

        if(!hash.regiontitle) {
            //alert("OKAY hash.geo before: " + hash.geo);
            delete hiddenhash.loctitle;
            delete hiddenhash.geo;
            //alert("BUG hash.geo after: " + hash.geo);
            //delete param.geo;
            $(".regiontitle").text("");
            // Could add full "United States" from above. Could display longer "show" manufacing title.
            let appTitle = $("#showAppsText").attr("title");
            console.log("appTitle: " + appTitle);

            let showTitle;
            if (hash.show) {
                /*
                if (appTitle) {
                    $("#pageTitle").text(appTitle); // Ex: Parts Manufacturing
                } else {
                    ////$(".region_service").text(hash.show.toTitleCaseFormat());
                    $("#pageTitle").text(hash.show.toTitleCaseFormat());
                }
                */
                showTitle = hash.show.toTitleCaseFormat();
            }

            if (hash.show && local_app.loctitle) {
                waitForElm('.region_service').then((elm) => {
                    $(".region_service").text(local_app.loctitle + " - " + hash.show.toTitleCaseFormat());
                });

            } else if (hash.state) {

                waitForElm('.region_service').then((elm) => {
                    $(".region_service").text(hash.state); // While waiting for full state name
                });
                waitForElm('#state_select').then((elm) => {
                    //$("#state_select").val(stateAbbrev);
                    console.log("fetch theStateName from #state_select");
                    //$("#state_select").val(hash.state.split(",")[0].toUpperCase());

                    if ($("#state_select").find(":selected").val()) { // Omits top which has no text
                        theStateName = $("#state_select").find(":selected").text();
                        console.log("fetched " + theStateName);
                        waitForElm('.region_service').then((elm) => {
                            $(".region_service").text(theStateName + " Industries");
                            if (showTitle) {
                                $(".region_service").text(theStateName + " - " + hash.show.toTitleCaseFormat());
                            }
                        });
                    }

                    if (hash.show && param.display == "everything") { // Limitig to everything since /map page does not load layers, or need longer title.
                        let layer = hash.show;

                        /* Bug waitForSubObject is not finding localObject layers
                        waitForSubObject('localObject','layers', function() {
                        //waitForObjectProperty('localObject','layers', function() {
                            if (localObject.layers[layer] && localObject.layers[layer].section) {
                                let section = localObject.layers[layer].section;
                                updateRegionService(section);
                            }
                        });
                        */
                        //setTimeout(() => { // Works
                        //    alert("localObject.layers " + localObject.layers[layer].section);
                        //},3000);
                    }
                });

                /*
                if (theStateName) {
                    $(".region_service").text(theStateName);
                } else {
                    $(".region_service").text(hash.state);
                }
                */
            } else {
                ////$(".region_service").text("Top " + $(".locationTabText").text() + " Industries");
                waitForElm('.region_service').then((elm) => {
                    $(".region_service").text(""); // Clear prior state
                    consoleLog("Clear prior state")
                });
            }
            if (appTitle) {

                /*
                // Under development
                alert(document.title);
                let siteAppTitle = appTitle;
                //if (document.title != siteAppTitle) {
                    document.title = siteAppTitle;
                //}
                alert(document.title);
                */
            }
        } else {
            //alert("hash.regiontitle1 " + hash.regiontitle);
            hiddenhash.loctitle = hash.regiontitle.replace(/\+/g," ");
            $(".regiontitle").text(hash.regiontitle.replace(/\+/g," "));
            waitForElm('.region_service').then((elm) => {
                if (hash.show) {
                    $(".region_service").text(hash.regiontitle.replace(/\+/g," ") + " - " + hash.show.toTitleCaseFormat());
                } else {
                    $(".region_service").text(hash.regiontitle.replace(/\+/g," "));
                }
            });
            $(".locationTabText").text(hash.regiontitle.replace(/\+/g," "));
            local_app.loctitle = hash.regiontitle.replace(/\+/g," ");
            
            $(".regiontitle").val(hash.regiontitle.replace(/\+/g," "));
            hiddenhash.geo = $("#region_select option:selected").attr("geo");
            hash.geo = $("#region_select option:selected").attr("geo");
            //hash.geo = hiddenhash.geo;
            
            try {
                params.geo = hiddenhash.geo; // Used by old naics.js
            } catch(e) {
                console.log("Remove params.geo after upgrading naics.js " + e);
            }
        }
    }

    // Updates updateSelectedTableRows to check counties in tabulator

    if (hash.geo != priorHash.geo) {
        
        if (!hash.state && hash.geo) {
            // get 2-char state from first hash.geo state number
            const stateAbbreviationStr = getUniqueStateAbbreviations(hash.geo);
            if (stateAbbreviationStr) {
                hash.state = stateAbbreviationStr;
            }
            //alert("Got state " + hash.state);
        }
        let geoUncheck = [];
        if (hash.geo && hash.geo.length > 4) { 
            $(".state-view").hide();
            $(".county-view").show();
            //$(".industry_filter_settings").show(); // temp
        } else {
            $(".county-view").hide();
            $(".state-view").show();
            //$(".industry_filter_settings").hide(); // temp
        }
        if (hash.geo) {
            if (hash.geo.split(",").length >= 3) {
                $("#top-content-columns").addClass("top-content-columns-wide");
            } else {
                $("#top-content-columns").removeClass("top-content-columns-wide");
            }
        } else {
            $(".mainColumn1").show();
        }
  
        if (hash.geoview != "country") {
            let geoDeselect = "";

            //alert("priorHash.geo " + priorHash.geo + " hash.geo " + hash.geo);
            if (priorHash.geo) {
                const priorGeoArray = priorHash.geo.split(",");
                const hashGeoArray = hash.geo ? hash.geo.split(",") : [];

                // Find values in priorHash.geo that are not in hash.geo
                const geoDeselectArray = priorGeoArray.filter(value => !hashGeoArray.includes(value));

                // Create a comma-separated string of removed values
                geoDeselect = geoDeselectArray.join(",");
            }
            updateSelectedTableRows(hash.geo, geoDeselect, 0);
        }

        if($("#geomap").is(':visible')) {
            // Triggered by hash change to hash.geoview (values: county, state, country)
            // Allows location just clicked (in tabulator and on map) to be highlighted. 
            renderGeomapShapes("geomap", hash, hash.geoview, 1); 
        //} else {
            // Clear colored shapes
        }

        // TEST
        //dataObject.stateshown = getStateFips(hash);
        
        /*
        if (hash.geo) {
            alert("hash geo");
            loadGeos(hash.geo,0,function(results) {
                alert("test3");
            });
        }
        */
        //loadGeomap = true; // No longer showing map when just geo.
    }
    if (hash.country != priorHash.country && hash.geoview == "countries") {
        let countryDeselect = "";
        if (priorHash.country) {
            const priorList = priorHash.country.split(",");
            const currentList = hash.country ? hash.country.split(",") : [];
            countryDeselect = priorList.filter(value => !currentList.includes(value)).join(",");
        }
        updateSelectedCountryRows(hash.country || "", countryDeselect);
        refreshSelectedGeoStyles("geomap");
    }

    $(".locationTabText").attr("title",$(".locationTabText").text());
    if (hash.cat != priorHash.cat) {
        changeCat(hash.cat)
    }
    if (hash.catsort) {
        $("#catsort").val(hash.catsort);
    }
    if (hash.catyear) {
        $("#catyear").val(hash.catyear);
    }
    if (hash.catsize) {
        $("#catsize").val(hash.catsize);
    }
    if (hash.catmethod) {
        $("#catmethod").val(hash.catmethod);
    }
    if (hash.indicators != priorHash.indicators) {
        //alert("Selected hash.indicators " + hash.indicators);
        //$("#indicators").prop("selectedIndex", 0).value("Selected hash.indicators " + hash.indicators);

        //$("#indicators").prepend("<option value='" + hash.indicators + "' selected='selected'>" + hash.indicators + "</option>");
       $("#indicators").val(hash.indicators);
       if (!$("#indicators").val()) { // Select first one
           $('#indicators option').each(function () {
                if ($(this).css('display') != 'none') {
                    $(this).prop("selected", true);
                    return false;
                }
            });
        }

        /*
        if (hash.indicators) {
           $('#indicators option').each(function () {
                if ($(this).val() == 'JOBS' || $(this).val() == 'VADD') {
                    $(this).prop("selected", true);
                    alert("select")
                    //return false;
                }
            });
        }
        */
    }

    if (hash.state != priorHash.state) {
        // Load state hero graphic
        let theStateName; // Full name of state.
        let theStateNameLowercase;
        let imageUrl;
        if (hash.state) {
            let stateAbbrev = hash.state.split(",")[0].toUpperCase();
            waitForElm('#state_select').then((elm) => {
                $("#state_select").val(stateAbbrev);
                if ($("#state_select").find(":selected").val()) { // Omits top which has no text
                    theStateName = $("#state_select").find(":selected").text();
                    //theState = $("#state_select").find(":selected").val();
                }
                if (theStateName && theStateName.length > 0) {
                    theStateNameLowercase = theStateName.toLowerCase();
                    imageUrl = "https://model.earth/us-states/images/backgrounds/1280x720/landscape/" + theStateNameLowercase.replace(/\s+/g, '-') + ".jpg";
                    if (theStateNameLowercase == "georgia") {
                        imageUrl = "/apps/img/hero/state/GA/GA-hero.jpg";
                    }
                    if (theStateNameLowercase == "district of columbia") {
                        // DC doesn't have a hero image, use default stars image
                        imageUrl = "../localsite/img/hero/stars.jpg";
                    }
                    if (theStateName.length == 0) {
                        imageUrl = "/apps/img/hero/state/GA/GA-hero.jpg";
                    }
                } else {
                    imageUrl = "/apps/img/hero/state/GA/GA-hero.jpg";
                }
                let imageUrl_scr = "url(" + imageUrl + ")";
                //alert("imageUrl_scr  " + imageUrl_scr)
                $("#hero-landscape-image").css('background-image', imageUrl_scr);
            });
        }
    }
    if (hash.show != priorHash.show) {
        let show = hash.show;
        if (!hash.show) {
            //show = "industries";
        }
        //if (activeLayer) {
            $(".bigThumbMenuContent").removeClass("bigThumbActive");
            $(".bigThumbMenuContent[show='" + show +"']").addClass("bigThumbActive");
            let activeTitle = $(".bigThumbMenuContent[show='" + show +"'] .bigThumbText").text();
            $("#showAppsText").attr("title",activeTitle);
        //}
    }
    if (hash.imgview != priorHash.imgview) {
        if (hash.imgview == "state") {
            loadScript('/apps/js/apps-menus.js', function(results) {
                showHeroMenu("feature", {}, "my_site");
            });
        }
    }
    if (hash.appview != priorHash.appview) {
        if (hash.appview) {
            console.log("hash.appview exists: " + hash.appview);
            //navigationJsLoaded
            waitForVariable('navigationJsLoaded', function() {
                showApps("#bigThumbMenu");
            });
        } else {
            closeAppsMenu();
        }
    }
    if (hash.geoview != priorHash.geoview) {
        if (hash.geoview == "earth") {
            if ($("#filterLocations").is(':visible')) {
                closeLocationFilter();
            }
            $("#geoPicker").hide();
            $(".stateFilters").hide();
        } else if (hash.geoview && isValidGeoview) {
            filterLocationChange();
        } else {
            closeLocationFilter();
        }
    }
    if (hash.sidetab != priorHash.sidetab) {
        showSideTabs();
        if(priorHash.sidetab == "locale") {
            //alert("hide locale")
        }
    }
    if (hash.locpop != priorHash.locpop) {
        if(hash.locpop){
            popAdvanced();
        } else {
            hideAdvanced();
        }
    }

    if (hash.geoview != priorHash.geoview) {

        //$("#filterLocations").show();$("#locationFilterHolder").show();$("#imagineBar").show();
        //$("#geomap").show(); // To trigger map filter display below.
        if (hash.geoview == "earth") {
            $("#nullschoolHeader").show();
        } else if (!hash.geoview && priorHash.geoview == "earth") {
            $("#nullschoolHeader").hide();
        } else if (hash.geoview && hash.geoview != "earth") {
            $("#nullschoolHeader").hide();
        } else if (!hash.geoview && priorHash.geoview) {
            if ($('#globalMapHolder #mainframe').attr('src')) { // Checking so we don't show a close-X when there is no content in the iframe.
                $("#nullschoolHeader").show();
            }
        }
        waitForElm('#state_select').then((elm) => {
            if (!hash.geoview || hash.geoview == "none" || hash.geoview == "earth" || !validGeoviews.includes(hash.geoview)) {
                if (location.host.indexOf('localhost') >= 0) {
                    testAlert("geoPicker hide in hashChanged: hash.geoview='" + (hash.geoview || "") + "' priorHash.geoview='" + (priorHash.geoview || "") + "' hash.state='" + (hash.state || "") + "'");
                }
                $("#geoPicker").hide();
                $(".stateFilters").hide();
            } else {
                if (location.host.indexOf('localhost') >= 0) {
                    testAlert("geoPicker show in hashChanged: hash.geoview='" + hash.geoview + "' priorHash.geoview='" + (priorHash.geoview || "") + "' hash.state='" + (hash.state || "") + "'");
                }
                $("#geoPicker").show();
                $(".stateFilters").show();
            }
        });
        if (hash.geoview == "earth") {
            let latLonZoom = "-115.84,31.09,1037";
            if (localStorage.latitude && localStorage.longitude) {
                latLonZoom = localStorage.longitude + "," + localStorage.latitude + ",1037";
            }
            showGlobalMap(`https://earth.nullschool.net/#current/chem/surface/currents/overlay=no2/orthographic=${latLonZoom}`);
        } else if (hash.geoview && isValidGeoview) {
            loadGeomap = true;
            // if ((priorHash.sidetab == "locale" && hash.sidetab != "locale") || (priorHash.locpop  && !hash.locpop)) {
                // Closing sidetab or locpop, move geomap back to holder.
                $("#filterLocations").prependTo($("#locationFilterHolder")); // Move back from rightSideTabs
                $("#geomap").appendTo($("#geomapHolder")); // Move back from rightSideTabs

                if (!hash.sidetab) { // For when clicking on Location top tab
                    $("#locationFilterHolder").show();
                    loadGeomap = true;
                }
            //}
        } else {
            $("#filterLocations").hide();
            //$("#geoPicker").hide();
        }
    }
    if (hash.locpop != priorHash.locpop) {
        if (hash.locpop) {
            loadGeomap = true;
        }
    }
    $(".regiontitle").text(local_app.loctitle);
    $(".service_title").text(local_app.loctitle + " - " + local_app.showtitle);
    if (hash.geoview && !isValidGeoview) {
        loadGeomap = false;
    }
    if (loadGeomap) {
        // TO DO: Should we avoid reloading if already loaded for a state?  Occurs when hash.locpop & changes.

        //$("#filterLocations").show();$("#locationFilterHolder").show();$("#imagineBar").show();
        //if($("#geomap").is(':visible')){
        waitForElm('#geomap').then((elm) => {
            console.log("call renderGeomapShapes from navigation.js hashChanged()");
            renderGeomapShapes("geomap", hash, hash.geoview || "county", 1); // Use the actual geoview from hash
        });
        //}
    }
}



// Standalone Navigation System - JavaScript

var StandaloneNavigation = window.StandaloneNavigation || class StandaloneNavigation {
    constructor(options = {}) {
        // Singleton pattern to prevent multiple instances
        if (StandaloneNavigation.instance) {
            return StandaloneNavigation.instance;
        }
        
        // Auto-detect webroot container from script path
        const autoDetected = this.detectWebrootFromScriptPath();
        console.log('[Constructor] Auto-detected values:', autoDetected);
        console.log('[Constructor] Options passed in:', options);
        
        this.options = {
            basePath: options.basePath || '',
            currentPage: options.currentPage || 'admin',
            // Use auto-detected values if they exist, otherwise fall back to options
            isWebrootContainer: autoDetected.isWebrootContainer !== null ? autoDetected.isWebrootContainer : (options.isWebrootContainer || false),
            repoFolderName: autoDetected.repoFolderName || options.repoFolderName || null,
            webrootFolderName: autoDetected.webrootFolderName || options.webrootFolderName || null,
            isExternalSite: options.isExternalSite || false,
            ...options
        };
        
        // Override any conflicting options with auto-detected values if they exist
        if (autoDetected.repoFolderName) {
            this.options.repoFolderName = autoDetected.repoFolderName;
        }
        if (autoDetected.webrootFolderName) {
            this.options.webrootFolderName = autoDetected.webrootFolderName;
        }
        if (autoDetected.isWebrootContainer !== null) {
            this.options.isWebrootContainer = autoDetected.isWebrootContainer;
        }
        
        console.log('[Constructor] Final options:', this.options);
        
        // Initialize collapsed state from localStorage immediately to prevent flash
        const savedCollapsed = localStorage.getItem('standaloneNavCollapsed');
        const savedLocked = localStorage.getItem('standaloneNavLocked');
        const savedHidden = localStorage.getItem('standaloneNavHidden');
        
        // Check screen size immediately on refresh
        this.isMobile = window.innerWidth <= 600;
        
        // Set initial state based on screen size
        if (this.isMobile) {
            console.log('INIT: Narrow screen detected on refresh - forcing collapsed and hidden state');
            this.isCollapsed = true;
            this.isLocked = false;
            this.isHidden = true; // Hide sidebar on mobile
        } else {
            // Use saved preferences on wide screens
            this.isCollapsed = savedCollapsed === 'true' || savedCollapsed === null; // Default to collapsed
            this.isLocked = savedLocked === 'true'; // Default to unlocked
            this.isHidden = savedHidden === 'true'; // Use saved hidden state on desktop
        }
        
        this.mobileOpen = false;
        
        console.log('INIT: Screen width:', window.innerWidth, 'isMobile:', this.isMobile, 'isCollapsed:', this.isCollapsed, 'isHidden:', this.isHidden);
        
        // Store event listeners for cleanup
        this.eventListeners = [];
        this.featherTimeout = null;
        this.resizeTimeout = null;
        this.faviconUpdateInterval = null;
        this.currentFavicon = null;
        
        StandaloneNavigation.instance = this;
        this.loadFeatherIcons();
        this.init();
    }
    
    init() {
        //this.checkMobile();
        
        // Check for shownav parameter in script src URL
        let showNav = true;
        const scripts = document.getElementsByTagName('script');
        for (const script of scripts) {
            if (script.src && script.src.includes('navigation.js')) {
                try {
                    // Handle both absolute and relative URLs
                    const scriptUrl = script.src.includes('://') ? 
                        new URL(script.src) : 
                        new URL(script.src, window.location.href);
                    if (scriptUrl.searchParams.get('shownav') === 'false') {
                        showNav = false;
                        console.log('Found shownav=false in script URL:', script.src);
                        break;
                    }
                } catch (e) {
                    // Fallback: parse manually if URL constructor fails
                    if (script.src.includes('shownav=false')) {
                        showNav = false;
                        console.log('Found shownav=false via string match in:', script.src);
                        break;
                    }
                }
            }
        }
        
        // Also check page URL for backward compatibility
        if (showNav) {
            const urlParams = new URLSearchParams(window.location.search);
            showNav = urlParams.get('shownav') !== 'false';
        }
        
        if (showNav) {
            this.createNavigation();
            this.setupEventListeners();
            this.setupMobileHandlers();
        } else {
            console.log('Navigation disabled due to shownav=false parameter');
        }
        
        this.initializeNavFeatherIcons();
        this.startPeriodicFaviconUpdate();
    }
    
    // TO DO - Try using variable set in localsite.js instead 

    // Auto-detect webroot container from script path
    detectWebrootFromScriptPath() {
        // Get the current script path
        const scripts = document.getElementsByTagName('script');
        let scriptSrc = '';
        
        // Find the nav.js script - check both src and resolved URL
        for (const script of scripts) {
            if (script.src && script.src.includes('nav.js')) {
                scriptSrc = script.src;
                console.log('[WebrootDetector] Found script element with src:', script.getAttribute('src'), 'resolved to:', script.src);
                break;
            }
        }
        
        if (!scriptSrc) {
            console.log('[WebrootDetector] Could not find nav.js script src');
            return { isWebrootContainer: false, repoFolderName: null, webrootFolderName: null };
        }
        
        console.log('[WebrootDetector] Script src:', scriptSrc);
        
        // Parse URL to get pathname
        try {
            const url = new URL(scriptSrc);
            const pathname = url.pathname;
            console.log('[WebrootDetector] Script pathname:', pathname);
            
            // Check for webroot container patterns
            // Pattern 1: /{webrootFolder}/{repoFolder}/js/nav.js (two-level structure)
            let match = pathname.match(/^\/([^\/]+)\/([^\/]+)\/js\/nav\.js$/);
            
            if (match) {
                const [, firstFolder, secondFolder] = match;
                
                // Check if first folder looks like a webroot container name
                const webrootNames = ['webroot', 'www', 'public', 'html', 'htdocs', 'public_html'];
                const isLikelyWebroot = webrootNames.includes(firstFolder.toLowerCase());
                
                if (isLikelyWebroot && secondFolder === 'localsite') {
                    console.log('[WebrootDetector] Detected webroot container with localsite:', { webrootName: firstFolder });
                    
                    return {
                        isWebrootContainer: true,
                        repoFolderName: 'localsite',
                        webrootFolderName: firstFolder
                    };
                } else if (secondFolder === 'localsite') {
                    // Cross-repo access pattern like /comparison/localsite/js/nav.js
                    console.log('[WebrootDetector] Detected cross-repo access to localsite:', { callingRepo: firstFolder });
                    
                    return {
                        isWebrootContainer: true,
                        repoFolderName: 'localsite',
                        webrootFolderName: null
                    };
                }
            }
            
            // Pattern for direct repo serving: /{repoFolder}/js/nav.js
            match = pathname.match(/^\/([^\/]+)\/js\/nav\.js$/);
            if (match) {
                const [, repoFolder] = match;
                if (repoFolder === 'localsite') {
                    console.log('[WebrootDetector] Detected direct localsite serving');
                    
                    return {
                        isWebrootContainer: false,
                        repoFolderName: 'localsite',
                        webrootFolderName: null
                    };
                }
            }
            
            console.log('[WebrootDetector] No pattern matched, assuming relative path');
            return { isWebrootContainer: false, repoFolderName: null, webrootFolderName: null };
            
        } catch (error) {
            console.warn('[WebrootDetector] Error parsing script URL:', error);
            return { isWebrootContainer: false, repoFolderName: null, webrootFolderName: null };
        }
    }

    /*
    // Immediate resize handler for responsive behavior
    checkMobile() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 600;
        
        console.log('CHECK MOBILE: width', window.innerWidth, 'wasMobile:', wasMobile, 'isMobile:', this.isMobile);
        
        if (wasMobile !== this.isMobile) {
            this.handleMobileChange();
        }
    }
    
    // Helper function to safely set sidebar state classes
    setSidebarState(sidenav, state) {
        if (!sidenav) return;
        
        // Remove all state classes first to prevent duplicates
        sidenav.classList.remove('collapsed', 'expanded', 'hovered', 'locked', 'mobile-open');
        
        // Add the specified state
        if (state === 'collapsed') {
            sidenav.classList.add('collapsed');
        } else if (state === 'expanded') {
            sidenav.classList.add('expanded');
        }
    }

    handleMobileChange() {
        //alert("handleMobileChange")
        //console.log("handleMobileChange() disabled since it expands #side-nav on hover")
        //return;

        console.log('MOBILE CHANGE: isMobile changed to', this.isMobile, 'isCollapsed:', this.isCollapsed);
        const sidenav = document.querySelector('#side-nav');
        const overlay = document.querySelector('.mobile-overlay');
        
        if (this.isMobile) {
            console.log('MOBILE CHANGE: Switching to mobile mode - applying collapsed state');
            // Apply collapsed state like manual toggle does (to hide titles/arrows)
            this.setSidebarState(sidenav, 'collapsed');
            overlay?.classList.remove('active');
            this.isLocked = false;
            // Update body class
            document.body.classList.remove('sidenav-expanded', 'sidenav-hovered');
            //// document.body.classList.add('sidenav-collapsed');
        } else {
            console.log('MOBILE CHANGE: Switching to desktop mode - checking if should restore expanded');
            sidenav?.classList.remove('mobile-open');
            this.mobileOpen = false;
            
            // Restore expanded state when switching back to desktop if not user-collapsed
            if (!this.isCollapsed) {
                console.log('MOBILE CHANGE: Restoring expanded class for desktop');
                this.setSidebarState(sidenav, 'expanded');
                //// document.body.classList.add('sidenav-expanded');
                //// document.body.classList.remove('sidenav-collapsed');
            } else {
                console.log('MOBILE CHANGE: Staying collapsed as per user preference');
                this.setSidebarState(sidenav, 'collapsed');
                if (this.isLocked) {
                    sidenav?.classList.add('locked');
                }
                //// document.body.classList.add('sidenav-collapsed');
                //// document.body.classList.remove('sidenav-expanded');
            }
        }
        
        // Update toggle icon after mobile state change
        this.debouncedUpdateToggleIcon();
    }
    */

    createNavigation() {
        // Check if navigation already exists to prevent duplicates
        const existingSidebar = document.getElementById('side-nav');
        if (existingSidebar) {
            // Remove existing navigation to recreate it
            existingSidebar.remove();
        }
        
        // Also remove any existing app-container to ensure clean slate
        /*
        const existingAppContainer = document.querySelector('.app-container');
        if (existingAppContainer) {
            // Move main content back to body before removing container
            const mainContent = existingAppContainer.querySelector('.main-content');
            if (mainContent) {
                const children = [...mainContent.children];
                children.forEach(child => {
                    document.body.appendChild(child);
                });
            }
            existingAppContainer.remove();
        }
        */

        const existingAppContainer = document.querySelector('body');
        const basePath = this.options.basePath || '';
        const isWebrootContainer = this.options.isWebrootContainer;
        const repoFolderName = this.options.repoFolderName;
        const isExternalSite = this.options.isExternalSite;
        
        // Calculate paths based on container type
        let rootPath, adminPath, logoPath, teamPath;
        const webrootFolderName = this.options.webrootFolderName;
        if (isExternalSite) {
            // Called from external site, use absolute paths to repo folder
            const repoName = repoFolderName || 'localsite';
            rootPath = `/${repoName}/`;
            adminPath = `/${repoName}/admin/`;
            teamPath = `/team/`;
            // Favicon is in localsite repo
            logoPath = `/localsite/img/logo/neighborhood/favicon.png`;
        } else if (isWebrootContainer && repoFolderName) {
            // In webroot container, need to include both webroot and repo folder in paths
            if (webrootFolderName) {
                // Root path points to webroot folder
                rootPath = `/${webrootFolderName}/`;
                adminPath = `/${webrootFolderName}/team/admin/`;
                teamPath = `/${webrootFolderName}/team/`;
                // Favicon is in localsite repo
                logoPath = `/${webrootFolderName}/localsite/img/logo/neighborhood/favicon.png`;
            } else {
                // Webroot name unknown - root path goes up one level to repo collection
                rootPath = `../`;
                adminPath = `../team/admin/`;
                teamPath = `../team/`;
                // Favicon is in localsite repo
                logoPath = `../localsite/img/logo/neighborhood/favicon.png`;
            }
        } else {

            // Direct repo serving - go up to root level where all repos are
            rootPath = basePath ? `${basePath}/../` : '../';
            adminPath = basePath ? `${basePath}/../team/admin/` : '../team/admin/';
            teamPath = basePath ? `${basePath}/../team/` : '../team/';
            // Favicon is in localsite repo
            // Calculate additional ../ needed based on current URL depth
            const currentPath = window.location.pathname;
            const pathSegments = currentPath.split('/').filter(segment => segment && !segment.endsWith('.html'));
            const extraLevels = Math.max(0, pathSegments.length - 1); // Subtract 1 for the base repo level
            const additionalDotDots = '../'.repeat(extraLevels);
            
            logoPath = basePath ? `${basePath}/../team/img/logo/neighborhood/favicon.png` : `${additionalDotDots}../team/img/logo/neighborhood/favicon.png`;
            //alert("logoPath " + logoPath)
        }
        
        // Debug logging
        console.log('Navigation paths:', { 
            repoFolderName, 
            webrootFolderName, 
            isWebrootContainer, 
            isExternalSite, 
            basePath, 
            rootPath, 
            adminPath, 
            teamPath,
            logoPath,
            'options': this.options
        });
        
        // Apply initial collapsed state to prevent flash
        const initialClasses = [
            isExternalSite ? 'external-site' : '',
            // Apply collapsed class immediately if narrow screen OR user preference
            this.isCollapsed || this.isMobile ? 'collapsed' : '',
            this.isLocked && !this.isMobile ? 'locked' : ''
        ].filter(Boolean).join(' ');
        
        // Apply hidden state immediately to prevent flash
        //const initialStyle = this.isHidden ? 'display: none;' : '';
        const initialStyle = '';
        console.log('INIT: Creating navigation with classes:', initialClasses);
        
        const navHTML = `
            <div id="side-nav" class="sidebar ${initialClasses}${!this.isCollapsed && !this.isMobile && !this.isHidden ? ' expanded' : ' collapsed'}" style="${initialStyle}">
                      
                <div id="side-nav-absolute">

                    <div id="side-nav-content">
                        <div id="side-nav-header"><button id="nav-close-btn" class="nav-x" title="Close navigation">✕</button></div>
                  
                        <div id="side-nav-menu">
                            <div class="nav-section">
                                <div class="nav-item">
                                    <button class="nav-link" data-section="home" data-href="${teamPath}">
                                        <i class="nav-icon" data-feather="home"></i>
                                        <span class="nav-text">Welcome</span>
                                        <i class="nav-arrow" data-feather="chevron-right"></i>
                                    </button>
                                    <div class="subnav">
                                        <a href="${teamPath}#home" class="subnav-link">
                                            <i class="subnav-icon" data-feather="smile"></i>
                                            <span>Welcome</span>
                                        </a>
                                        <a href="${teamPath}#home/documentation" class="subnav-link">
                                            <i class="subnav-icon" data-feather="book"></i>
                                            <span>Getting Started</span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div class="nav-section earth" style="display:none">
                                <div class="nav-item">
                                    <button class="nav-link" data-section="projects" data-href="${rootPath}projects">
                                        <i class="nav-icon" data-feather="folder"></i>
                                        <span class="nav-text">Projects</span>
                                        <i class="nav-arrow" data-feather="chevron-right"></i>
                                    </button>
                                    <div class="subnav">
                                        <a href="${rootPath}projects" class="subnav-link">
                                            <i class="subnav-icon" data-feather="globe"></i>
                                            <span>Active Projects</span>
                                        </a>
                                        <a href="https://github.com/modelearth/projects/issues/" class="subnav-link">
                                            <i class="subnav-icon" data-feather="check-square"></i>
                                            <span>ToDos (GitHub)</span>
                                        </a>
                                        <a href="${rootPath}projects/hub/" class="subnav-link">
                                            <i class="subnav-icon" data-feather="target"></i>
                                            <span>Our Project Hub</span>
                                        </a>
                                        <a href="https://www.democracylab.org/projects/834" class="subnav-link">
                                            <i class="subnav-icon" data-feather="code"></i>
                                            <span>Democracy Lab</span>
                                        </a>
                                        <div style="display:none">
                                        Before removing, investigate via: Reveal opportunities section on the team/index.html page
                                        <a href="${teamPath}#projects/opportunities" class="subnav-link">
                                            <i class="subnav-icon" data-feather="target"></i>
                                            <span>Opportunities</span>
                                        </a>
                                        </div>
                                        <!--
                                        <a href="${teamPath}#projects/assigned-tasks" class="subnav-link">
                                            <i class="subnav-icon" data-feather="check-square"></i>
                                            <span>Assigned Tasks</span>
                                        </a>
                                        <a href="/localsite/timeline/" class="subnav-link">
                                            <i class="subnav-icon" data-feather="calendar"></i>
                                            <span>UN Timelines</span>
                                        </a>
                                        -->
                                    </div>
                                </div>
                            </div>

                            <div class="nav-section earthX" style="display:none">
                                <div class="nav-item">
                                    <button class="nav-link" data-section="people" data-href="${teamPath}#people">
                                        <i class="nav-icon" data-feather="users"></i>
                                        <span class="nav-text">People & Places</span>
                                        <i class="nav-arrow" data-feather="chevron-right"></i>
                                    </button>
                                    <div class="subnav">
                                        <a href="${teamPath}projects/#list=modelteam" class="subnav-link">
                                            <i class="subnav-icon" data-feather="map"></i>
                                            <span>Model Team</span>
                                        </a>
                                        <a href="${teamPath}#people/people" class="subnav-link">
                                            <i class="subnav-icon" data-feather="user"></i>
                                            <span>People</span>
                                        </a>
                                        <a href="${teamPath}#people/teams" class="subnav-link">
                                            <i class="subnav-icon" data-feather="users"></i>
                                            <span>Teams</span>
                                        </a>
                                        <a href="${teamPath}#people/organizations" class="subnav-link">
                                            <i class="subnav-icon" data-feather="grid"></i>
                                            <span>Organizations</span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div class="nav-section earthX" style="display:none">
                                <div class="nav-item">
                                    <button class="nav-link" data-section="account" data-href="${teamPath}#account">
                                        <i class="nav-icon" data-feather="user"></i>
                                        <span class="nav-text">My Account</span>
                                        <i class="nav-arrow" data-feather="chevron-right"></i>
                                    </button>
                                    <div class="subnav">
                                        <a href="${teamPath}#account/preferences" class="subnav-link">
                                            <i class="subnav-icon" data-feather="sliders"></i>
                                            <span>Preferences</span>
                                        </a>
                                        <a href="${teamPath}#account/skills" class="subnav-link">
                                            <i class="subnav-icon" data-feather="award"></i>
                                            <span>Skills</span>
                                        </a>
                                        <a href="${teamPath}#account/interests" class="subnav-link">
                                            <i class="subnav-icon" data-feather="heart"></i>
                                            <span>Interests</span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div class="nav-section">
                                <div class="nav-item">
                                    <button class="nav-link" data-section="realitystream" data-href="${teamPath}projects/#list=all">
                                        <i class="nav-icon" data-feather="activity"></i>
                                        <span class="nav-text">Data Insights</span>
                                        <i class="nav-arrow" data-feather="chevron-right"></i>
                                    </button>
                                    <div class="subnav">
                                        
                                        <div style="display:none" class="geo">
                                        <a href="${teamPath}projects/map/#list=cities" class="subnav-link">
                                            <i class="subnav-icon" data-feather="map"></i>
                                            <span>Location Visits Map</span>
                                        </a>
                                        </div>

                                        <!-- Not all have images
                                        <div style="display:none" class="geo">
                                        <a href="${teamPath}projects/#list=cameraready" class="subnav-link">
                                            <i class="subnav-icon" data-feather="heart"></i>
                                            <span>Film Location Insights</span>
                                        </a>
                                        </div>
                                        -->

                                        <div style="display:none" class="geo">
                                        <a href="${teamPath}projects/#list=film-liaisons" class="subnav-link">
                                            <i class="subnav-icon" data-feather="film"></i>
                                            <span>Film Community Insights</span>
                                        </a>
                                        </div>
                                        <div style="display:none" class="geo">
                                        <a href="${rootPath}localsite/info/#state=GA" class="subnav-link">
                                            <i class="subnav-icon" data-feather="bar-chart-2"></i>
                                            <span>Industry Comparisons</span>
                                        </a>
                                        </div>
                                        <div style="display:none" class="earth">
                                        <a href="${rootPath}localsite/info/" class="subnav-link">
                                            <i class="subnav-icon" data-feather="bar-chart-2"></i>
                                            <span>Industry Comparisons</span>
                                        </a>
                                        </div>
                                        <div style="display:none" class="earth">
                                        <a href="${rootPath}realitystream/models/" class="subnav-link">
                                            <i class="subnav-icon" data-feather="trending-up"></i>
                                            <span>Forecasting Models</span>
                                        </a>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                            
                            <div class="nav-section">
                                <div class="nav-item">
                                    <button class="nav-link ${this.options.currentPage === 'admin' ? 'active' : ''}" data-section="admin" data-href="${teamPath}admin">
                                        <i class="nav-icon" data-feather="tool"></i>
                                        <span class="nav-text">Partner Tools</span>
                                        <i class="nav-arrow" data-feather="chevron-right"></i>
                                    </button>
                                    <div class="subnav">
                                        <div style="display:none" class="earth">
                                        <a href="${teamPath}projects/" class="subnav-link">
                                            <i class="subnav-icon" data-feather="users"></i>
                                            <span>Meetup Integration</span>
                                        </a>
                                        </div>
                                        <a href="${teamPath}admin/server/" class="subnav-link">
                                            <i class="subnav-icon" data-feather="zap"></i>
                                            <span>Configure Server</span>
                                        </a>
                                        <a href="${teamPath}admin/sql/panel/" class="subnav-link">
                                            <i class="subnav-icon" data-feather="database"></i>
                                            <span>Database Admin</span>
                                        </a>
                                        <a href="${teamPath}admin/import-data.html" class="subnav-link">
                                            <i class="subnav-icon" data-feather="upload"></i>
                                            <span>Data Import</span>
                                        </a>
                                        <a href="${teamPath}admin/log-output/" class="subnav-link">
                                            <i class="subnav-icon" data-feather="monitor"></i>
                                            <span>Log Monitor</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="side-nav-footer">
                            <button class="sidebar-toggle" id="sidebar-toggle">
                                <i data-feather="chevrons-left"></i>
                            </button>
                        </div>
                    </div>
                    
                </div>
            </div>
            
            <div class="mobile-overlay" id="mobile-overlay"></div>
        `;
        
        waitForElm('#main-container').then((elm) => {
            $("body").addClass("sidebar-hidden");
            $("#main-container").prepend(navHTML);
            waitForElm('#legend-content').then((elm) => { // On timeline page
                 setTimeout(() => { // Temp until Leaflet load timing is resolved.
                    if (window._timelineLegendAllowSidebar) {
                        showNavColumn();
                    } else {
                        hideNavColumn();
                        return;
                    }
                    // First add header with toggle, then legend content after it
                    if (!$('#locations-header').length) {
                        $('#listLeft').prepend(`
                            <div id="locations-header">
                                <b><a href="#" onclick="toggleDiv('#locations-content');return false;">LOCATIONS</a></b>
                                <div id="locations-content">
                                    <div id="sidebar-view-toggle" class="legend-view-toggle">
                                        <button id="sidebar-locations-btn" class="view-toggle-btn active" title="Show flat list of locations">Locations</button>
                                        <button id="sidebar-continents-btn" class="view-toggle-btn" title="Group by continent">Continents</button>
                                    </div>
                                </div>
                            </div>
                        `);
                        // Setup toggle event handlers for sidebar
                        setupSidebarViewToggle();
                    }
                    // Insert legend content inside locations-content, after the toggle
                    $('#locations-content').append($('#legend-content'));
                    $('#legend-content').css('font-size', '12px');
                    $('#legend-content').css('line-height', '1em');
                    $('#floating-legend').hide(); // No effect since display: is on #floating-legend
                    $('#floating-legend').css('opacity', '0'); // Works, but might block clicks
                }, 1000);
            });
        });
    }
    
    // Update logo and favicon based on SITE_FAVICON environment variable or config
    async updateLogoFromConfig() {
        let siteFavicon = null;

        // First, try to fetch current config from the server
        try {
            const apiUrl = 'http://localhost:8081/api/config/current';
            const response = await fetch(apiUrl); // Since a connection error would be network-level, it cannot be surpressed by javascript
            if (response.ok) {
                const config = await response.json();
                if (config.site_favicon) {
                    siteFavicon = config.site_favicon;
                    console.log('[FaviconManager] Found site_favicon:', siteFavicon);
                }
            }
        } catch (error) {
            console.log('Could not fetch server config, falling back to client-side detection:', error);
        }
        
        // Fallback to client-side detection if server config not available
        if (!siteFavicon) {
            // Check if it's available as a global variable
            if (typeof SITE_FAVICON !== 'undefined' && SITE_FAVICON) {
                siteFavicon = SITE_FAVICON;
            }
            // Check if it's in a config object
            else if (typeof window.config !== 'undefined' && window.config.SITE_FAVICON) {
                siteFavicon = window.config.SITE_FAVICON;
            }
            // Check if it's in process.env (if available in browser context)
            else if (typeof process !== 'undefined' && process.env && process.env.SITE_FAVICON) {
                siteFavicon = process.env.SITE_FAVICON;
            }
        }
        
        // Update both sidebar logo and page favicon if a custom favicon is found
        console.log('[FaviconManager] Final siteFavicon:', siteFavicon, 'currentFavicon:', this.currentFavicon);
        if (siteFavicon && siteFavicon !== this.currentFavicon) {
            console.log('[FaviconManager] Updating favicon from', this.currentFavicon, 'to', siteFavicon);
            
            // Update sidebar logo
            const logoImg = document.getElementById('sidebar-logo');
            if (logoImg) {
                logoImg.src = siteFavicon;
                console.log('[FaviconManager] Updated sidebar logo to:', siteFavicon);
            } else {
                console.log('[FaviconManager] No sidebar-logo element found');
            }
            
            // Update page favicon
            try {
                await this.updatePageFavicon(siteFavicon);
                this.currentFavicon = siteFavicon;
                console.log('[FaviconManager] Successfully updated page favicon to:', siteFavicon);
            } catch (error) {
                console.warn('[FaviconManager] Failed to update page favicon:', error);
            }
        } else {
            console.log('[FaviconManager] No favicon update needed - same as current or no favicon found');
        }
    }
    
    // Update the page favicon with validation
    async updatePageFavicon(faviconUrl) {
        return new Promise((resolve, reject) => {
            // Validate the image URL before setting it
            const testImg = new Image();
            
            testImg.onload = () => {
                // Image is valid, proceed with setting favicon
                this.applyPageFavicon(faviconUrl);
                console.log('Updated page favicon to:', faviconUrl);
                resolve();
            };
            
            testImg.onerror = () => {
                console.warn('Invalid favicon URL:', faviconUrl);
                reject(new Error('Invalid favicon URL'));
            };
            
            testImg.src = faviconUrl;
        });
    }
    
    // Apply the favicon to the page
    applyPageFavicon(faviconUrl) {
        // Remove existing favicon links
        const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
        existingFavicons.forEach(favicon => favicon.remove());

        // Create new favicon link
        const favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.type = 'image/png'; // Assume PNG, but browsers are flexible
        favicon.href = faviconUrl;

        // Add to document head
        document.head.appendChild(favicon);

        // For older browsers, also create a shortcut icon link
        const shortcutFavicon = document.createElement('link');
        shortcutFavicon.rel = 'shortcut icon';
        shortcutFavicon.type = 'image/png';
        shortcutFavicon.href = faviconUrl;
        document.head.appendChild(shortcutFavicon);
    }
    
    // Start periodic updates to check for favicon changes
    startPeriodicFaviconUpdate() {
        // Disabled periodic favicon updates to reduce unnecessary API calls
        // The favicon will be set once on initialization
        console.log('[FaviconManager] Periodic updates disabled');
        /*
        // Check for updates every 30 seconds
        this.faviconUpdateInterval = setInterval(() => {
            this.updateLogoFromConfig().catch(error => {
                console.log('Periodic favicon update failed:', error);
            });
        }, 30000);
        */
    }
    
    // Manual refresh method for external use
    async refreshFavicon() {
        console.log('Manual favicon refresh requested');
        try {
            await this.updateLogoFromConfig();
            return true;
        } catch (error) {
            console.warn('Manual favicon refresh failed:', error);
            return false;
        }
    }
    
    setupEventListeners() {
        // Sidebar toggle - use native event delegation for dynamic elements
        document.addEventListener('click', (e) => {
            if (e.target.closest('#sidebar-toggle')) {
                this.toggleSidebar();
            }
        });
        
        // Close button handler - use native event delegation for dynamic elements
        document.addEventListener('click', (e) => {
            // Handle the specific close button in #side-nav-content
            if (e.target.closest('#nav-close-btn')) {
                //alert("hideSidebar() 3");
                const sideNav = document.getElementById('side-nav');
                sideNav.classList.remove('expanded');
                sideNav.classList.add('collapsed');
                this.hideSidebar();
                if (window.updateOverlayLegendVisibility) window.updateOverlayLegendVisibility();
                return;
            }
            
            // Handle main nav close button
            const mainNavCloseBtn = e.target.closest('.main-nav-close-btn');
            if (mainNavCloseBtn) {
                console.log('Clicked .main-nav-close-btn in #main-nav');
                // Just hide #main-nav, keep #side-nav-content open
                document.getElementById('main-nav').style.display = 'none';
                document.body.classList.add('main-nav-hidden');
                $("#side-nav").removeClass("main-nav").removeClass("main-nav-full");

                // Exiting left-nav legend mode: restore "On Left" controls in all legend placements.
                window._timelineLegendAllowSidebar = false;
                if (typeof window.updateOnLeftButtonsVisibility === 'function') {
                    try { window.updateOnLeftButtonsVisibility(); } catch (e) {}
                }
                const wasInLeftNavLegend = $('#legend-content').length && $('#legend-content').closest('#locations-content').length > 0;
                const bottomLegendVisible = $('#bottom-legend').length && $('#bottom-legend').is(':visible');
                try {
                    const newPosition = wasInLeftNavLegend ? 'below' : (bottomLegendVisible ? 'below' : 'right');
                    localStorage.setItem('legendPosition', newPosition);
                    window._cachedLegendPosition = newPosition;
                    window._floatingLegendManuallyClosed = (newPosition === 'below');
                } catch (e) {}
                if (typeof window.updateOnRightButtonsVisibility === 'function') {
                    try { window.updateOnRightButtonsVisibility(); } catch (e) {}
                }

                // Move legend content back to floating legend if needed
                if ($('#legend-content').length && $('#floating-legend').length) {
                    if ($('#legend-content').parent().attr('id') !== 'floating-legend') {
                        $('#floating-legend').append($('#legend-content'));
                    }
                }

                // When left-nav legend is closed, switch to horizontal legend (keep floating hidden).
                if (wasInLeftNavLegend) {
                    $('#floating-legend').hide();
                    $('#floating-legend').css('opacity', '0');
                    $('#floating-legend').css('display', 'none');
                    const bottomLegend = document.getElementById('bottom-legend');
                    if (bottomLegend) {
                        bottomLegend.style.display = 'flex';
                        bottomLegend.setAttribute('aria-hidden', 'false');
                    }
                // Otherwise restore floating legend only when horizontal legend is not visible.
                } else if (!bottomLegendVisible) {
                    $('#floating-legend').show();
                    $('#floating-legend').css('opacity', '1');
                    $('#floating-legend').css('display', 'block');
                    if (typeof window.buildFloatingLegendFromChart === 'function') {
                        setTimeout(() => { try { window.buildFloatingLegendFromChart(); } catch(e) {} }, 100);
                    }
                } else {
                    $('#floating-legend').hide();
                    $('#floating-legend').css('opacity', '0');
                }
                
                // Mobile behavior: if browser is 600px or less and #side-nav-content is visible, 
                // replace collapsed class with expanded
                if (window.innerWidth <= 600) {
                    const sideNavContent = document.getElementById('side-nav-content');
                    const sideNav = document.getElementById('side-nav');
                    if (sideNavContent && sideNav && 
                        window.getComputedStyle(sideNavContent).display !== 'none') {
                        sideNav.classList.remove('collapsed');
                        sideNav.classList.add('expanded');
                    }
                }
                // Ensure overlay legends refresh visibility now that main-nav is closed.
                // Run immediately and once after a short delay to handle any DOM transitions.
                if (window.updateOverlayLegendVisibility) {
                    try { window.updateOverlayLegendVisibility(); } catch (err) { console.warn('updateOverlayLegendVisibility error', err); }
                    setTimeout(() => {
                        try { if (window.updateOverlayLegendVisibility) window.updateOverlayLegendVisibility(); } catch (e) { /* ignore */ }
                    }, 60);
                }
            }
        });

        // Navigation click handling - use native event delegation for dynamic elements
        document.addEventListener('click', (e) => {
            const link = e.target.closest('.nav-link');
            if (link) {
                if (e.target.closest('.nav-arrow') || e.target.classList.contains('nav-arrow')) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // For all nav arrows, toggle the subnav
                    this.toggleSubnav(link);
                } else {
                    // Handle main button clicks - check if already on target page
                    if (link.hasAttribute('data-href')) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const href = link.getAttribute('data-href');
                        const hashMatch = href.match(/#([^']+)/);
                        
                        if (hashMatch) {
                            const targetHash = hashMatch[1];
                            const currentHash = window.location.hash.substring(1);
                            
                            // Check if we're on the root index.html page AND the href is for hash navigation only (not a different page)
                            const isRootPage = window.location.pathname === '/' || 
                                             window.location.pathname.endsWith('/index.html') ||
                                             window.location.pathname.endsWith('/team/') ||
                                             window.location.pathname.endsWith('/team/index.html');
                            
                            // Check if href is for same page hash navigation (starts with # or has no path before #)
                            const isSamePageHash = href.startsWith('#') || !href.includes('/');
                            
                            if (isRootPage && isSamePageHash) {
                                // On root page with same-page hash, use hash navigation only
                                window.location.hash = targetHash;
                            } else {
                                // Different page or not root page, use full href navigation
                                window.location.href = href;
                            }
                        } else {
                            // Direct navigation (like admin path)
                            window.location.href = href;
                        }
                    }
                }
            }
        });
        

        // Tooltip handlers for collapsed nav - use native event delegation
        /*
        document.addEventListener('mouseenter', (e) => {
            //alert("mouseenter")
            // Check if target has closest method (Element nodes only)
            if (!e.target || typeof e.target.closest !== 'function') return;
            
            const link = e.target.closest('.nav-link');
            if (link && self.isCollapsed && self.isLocked) {
                self.showTooltip(e, link);
            }
        }, true);
        
        document.addEventListener('mouseleave', (e) => {
            // Check if target has closest method (Element nodes only)
            if (!e.target || typeof e.target.closest !== 'function') return;
            
            if (e.target.closest('.nav-link') && self.isCollapsed && self.isLocked) {
                // Add a small delay to allow moving to the tooltip
                setTimeout(() => {
                    const tooltip = document.getElementById('nav-tooltip');
                    if (tooltip && !tooltip.matches(':hover')) {
                        self.hideTooltip();
                    }
                }, 100);
            }
        }, true);
        */

        // Global click handler for mobile menu
        const globalClickHandler = (e) => {
            if (this.isMobile && this.mobileOpen) {
                const sidenav = document.getElementById('side-nav');
                if (sidenav && !sidenav.contains(e.target)) {
                    this.closeMobileMenu();
                }
            }
        };
        
        document.addEventListener('click', globalClickHandler);
        this.eventListeners.push({ element: document, event: 'click', handler: globalClickHandler });
        
        // Click handler for side-nav-content area to expand when collapsed or collapse when expanded
        // Use native event delegation to handle dynamically inserted elements
        document.addEventListener('click', (e) => {
            if (e.target.closest('#side-nav-content')) {
                // Check if click is not on interactive elements
                const isInteractiveElement = e.target.closest('.nav-link, .subnav-link, button, a, input, select, textarea');
                
                if (!isInteractiveElement && !this.isMobile) {
                    if (this.isCollapsed) {
                        console.log('CONTENT CLICK: Expanding sidebar from content area click');
                        this.toggleSidebar();
                    } else {
                        console.log('CONTENT CLICK: Collapsing sidebar from content area click');
                        this.toggleSidebar();
                    }
                }
            }
        });
        
        // Tooltip link click handling - use native event delegation for dynamic tooltips
        document.addEventListener('click', (e) => {
            const tooltipLink = e.target.closest('.tooltip-link');
            if (tooltipLink) {
                e.preventDefault();
                e.stopPropagation();
                
                const href = tooltipLink.getAttribute('data-href');
                if (href) {
                    const hashMatch = href.match(/#([^']+)/);
                    
                    if (hashMatch) {
                        const targetHash = hashMatch[1];
                        const currentHash = window.location.hash.substring(1);
                        
                        // Check if we're on the root index.html page
                        const isRootPage = window.location.pathname === '/' || 
                                         window.location.pathname.endsWith('/index.html') ||
                                         window.location.pathname.endsWith('/team/') ||
                                         window.location.pathname.endsWith('/team/index.html');
                        
                        if (isRootPage) {
                            // On root page, use hash navigation only
                            window.location.hash = targetHash;
                        } else {
                            // On other pages, use full href navigation
                            window.location.href = href;
                        }
                    } else {
                        // Direct navigation (like admin path)
                        window.location.href = href;
                    }
                }
            }
        });
    }
    
    setupMobileHandlers() {
        // Mobile menu toggle button - use native event delegation for dynamic elements
        document.addEventListener('click', (e) => {
            if (e.target.closest('#mobile-menu-toggle')) {
                this.toggleMobileMenu();
            }
        });
        
        // Overlay click to close - use native event delegation for dynamic elements
        document.addEventListener('click', (e) => {
            if (e.target.closest('#mobile-overlay')) {
                this.closeMobileMenu();
            }
        });
    }
    
    toggleSidebar() {
        
        const sidenav = document.getElementById('side-nav');
        if (sidenav) {
            if (this.isCollapsed) {
                // Expanding - add expanded class
                this.isCollapsed = false;
                this.isLocked = false;
                sidenav.classList.remove('collapsed', 'locked', 'hovered');
                sidenav.classList.add('expanded');
                // Update body class for headerbar positioning
                //// document.body.classList.remove('sidenav-collapsed');
                //// document.body.classList.add('sidenav-expanded');
            } else {
                // Collapsing - remove expanded class and lock it collapsed
                this.isCollapsed = true;
                this.isLocked = true;
                sidenav.classList.remove('expanded', 'hovered');
                sidenav.classList.add('collapsed', 'locked');
                // Update body class for headerbar positioning
                //// document.body.classList.remove('sidenav-expanded');
                //// document.body.classList.add('sidenav-collapsed');
            }
            
            // Update toggle icon with debouncing
            this.debouncedUpdateToggleIcon();
            
            
            // Store state in localStorage
            localStorage.setItem('standaloneNavCollapsed', this.isCollapsed);
            localStorage.setItem('standaloneNavLocked', this.isLocked);
            // Update overlay legend visibility (timeline listens for this function)
            if (window.updateOverlayLegendVisibility) window.updateOverlayLegendVisibility();
        }
    }
    
    unlockSidebar() {
        const sidenav = document.getElementById('side-nav');
        if (sidenav) {
            this.isCollapsed = false;
            this.isLocked = false;
            sidenav.classList.remove('collapsed', 'locked', 'hovered');
            sidenav.classList.add('expanded');
            // Update body class for headerbar positioning
            //// document.body.classList.remove('sidenav-collapsed');
            //// document.body.classList.add('sidenav-expanded');
            
            // Update toggle icon with debouncing
            this.debouncedUpdateToggleIcon();
            
            // Store state in localStorage
            localStorage.setItem('standaloneNavCollapsed', this.isCollapsed);
            localStorage.setItem('standaloneNavLocked', this.isLocked);
        }
    }
    
    // .sideBar contains both
    hideSidebar(whichNav) {

        console.log('hideSidebar called, isMobile:', this.isMobile, 'windowWidth:', window.innerWidth);
        const sidenavcontent = document.getElementById('side-nav-content');
        const mainNav = document.getElementById('main-nav');
        const isNarrowScreen = window.innerWidth <= 600;
        
        if (sidenavcontent) {
            console.log('Hiding sidebar...');
            // Hide the sidenavcontent icon sidebar
            sidenavcontent.style.display = 'none';
            $("#side-nav").removeClass("main-nav-full");
            
            // Check if main-nav is visible and handle accordingly
            const mainNavVisible = mainNav && $("#main-nav").is(":visible");
            
            if (mainNavVisible) {
                // Keep #main-nav visible and #side-nav open
                $("#side-nav").addClass("main-nav");
                console.log('Keeping main-nav visible, only hiding side-nav-content');
                
                // On narrow screens (≤600px), when main-nav is visible, 
                // do NOT add sidebar-hidden class - just hide side-nav-content
                if (isNarrowScreen) {
                    console.log('Narrow screen: main-nav visible, NOT adding sidebar-hidden class');
                    return; // Don't set isHidden or add sidebar-hidden class
                } else {
                    // Wide screen: keep existing behavior
                    return; // Don't set isHidden or add sidebar-hidden class
                }
            } else {
                // No main-nav visible, close entire sidebar
                console.log('No main-nav visible, closing entire sidebar');
                document.body.classList.add('sidebar-hidden');
                // Update internal state
                this.isHidden = true;
                
                // Store hidden state (but don't persist mobile state to localStorage on narrow screens)
                if (!isNarrowScreen) {
                    localStorage.setItem('standaloneNavHidden', 'true');
                }
            }
            
            document.body.classList.remove('sidenav-collapsed', 'sidenav-expanded');
            console.log('Body classes updated');
            console.log('Sidebar hidden successfully');
        } else {
            console.log('Cannot hide sidebar - not found');
        }
    }
    
    showSidebar() {
        const sidenav = document.getElementById('side-nav');
        if (sidenav) {
            // Explicitly remove any display:none and show the sidebar
            sidenav.style.removeProperty('display');
            sidenav.style.display = '';  // Clear any inline display first
            sidenav.style.display = 'flex';  // Then set to flex
            
            // Remove hidden class and restore previous state
            document.body.classList.remove('sidebar-hidden');
            
            // Check if sidebar has neither collapsed nor expanded class and add collapsed if needed
            if (!sidenav.classList.contains('collapsed') && !sidenav.classList.contains('expanded')) {
                sidenav.classList.add('collapsed');
                this.isCollapsed = true;
            }
            
            // Restore previous collapsed/expanded state
            if (this.isCollapsed) {
                //// document.body.classList.add('sidenav-collapsed');
            } else {
                //// document.body.classList.add('sidenav-expanded');
            }
            
            // Clear hidden state
            localStorage.removeItem('standaloneNavHidden');
            this.isHidden = false;
            // Update overlay legend visibility after showing the sidebar
            if (window.updateOverlayLegendVisibility) window.updateOverlayLegendVisibility();
        }
    }
    
    handleNavigationToggle() {
        const sidenav = document.getElementById('side-nav');
        const mainNav = document.getElementById('main-nav');
        const body = document.body;
        const isNarrowScreen = window.innerWidth <= 600;
        const isCurrentlyHidden = body.classList.contains('sidebar-hidden');
        
        console.log('🔍 handleNavigationToggle:', {
            windowWidth: window.innerWidth,
            isNarrowScreen,
            currentBodyClasses: body.className,
            isExpanded: sidenav?.classList.contains('expanded'),
            mainNavVisible: mainNav ? window.getComputedStyle(mainNav).display !== 'none' : false,
            isCurrentlyHidden
        });
        
        // FIRST: If sidebar is not hidden, always add .sidebar-hidden and return
        if (!isCurrentlyHidden) {
            console.log('🔍 DEBUG: Adding .sidebar-hidden to body - early return');
            body.classList.add('sidebar-hidden');
            // On mobile (600px and less), don't set display:none on #side-nav
            if (sidenav && !isNarrowScreen) sidenav.style.display = 'none';
            if (mainNav) mainNav.style.display = 'none';
            this.isHidden = true;
            
            // Store hidden state (but don't persist mobile state to localStorage on narrow screens)
            if (!isNarrowScreen) {
                localStorage.setItem('standaloneNavHidden', 'true');
            }
            
            console.log('🔍 DEBUG: Body classes after adding:', body.className);
            // Recompute overlay visibility after hiding
            if (window.updateOverlayLegendVisibility) window.updateOverlayLegendVisibility();
            return; // Exit early - no additional navigation changes
        }
        
        // SECOND: Only proceed here if sidebar is currently hidden
        console.log('🔍 DEBUG: Sidebar currently hidden - showing navigation');
        
        if (isNarrowScreen) {
            // Narrow screen behavior - show both navigations
            body.classList.remove('sidebar-hidden');
            
            // Show #side-nav-content with .collapsed
            if (sidenav) {
                sidenav.style.removeProperty('display');
                sidenav.style.display = 'flex';
                this.setSidebarState(sidenav, 'collapsed');
                this.isCollapsed = true;
                this.isLocked = true;
            }
            
            // Show #main-nav
            if (mainNav) {
                mainNav.style.removeProperty('display');
                mainNav.style.display = 'block';
            }
            
            this.isHidden = false;
            // update overlay visibility after showing
            if (window.updateOverlayLegendVisibility) window.updateOverlayLegendVisibility();
        } else {
            // Wide screen behavior - show sidebar in collapsed state
            this.showSidebar();
            // Set to collapsed state initially
            if (sidenav) {
                this.setSidebarState(sidenav, 'collapsed');
                this.isCollapsed = true;
                this.isLocked = true;
            }
            // update overlay visibility after showing
            if (window.updateOverlayLegendVisibility) window.updateOverlayLegendVisibility();
        }
    }
    
    
    // Debounced icon update to prevent excessive DOM manipulation
    debouncedUpdateToggleIcon() {
        if (this.featherTimeout) {
            clearTimeout(this.featherTimeout);
        }
        
        this.featherTimeout = setTimeout(() => {
            this.updateToggleIcon();
        }, 50);
    }
    
    updateToggleIcon() {
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (!sidebarToggle) return;
        
        // Check actual sidenav state from DOM
        const sidenav = document.getElementById('side-nav');
        const actuallyCollapsed = sidenav?.classList.contains('collapsed') || false;
        const mobileOpen = sidenav?.classList.contains('mobile-open') || false;
        const actuallyExpanded = sidenav?.classList.contains('expanded') || false;
        
        // Sync the class property with actual DOM state
        this.isCollapsed = actuallyCollapsed;
        
        // Target icon based on state - consider both collapsed state and mobile-open/expanded
        let targetIcon;
        if (this.isMobile) {
            // On mobile: right arrow when collapsed, left arrow when mobile-open OR expanded
            targetIcon = (mobileOpen || actuallyExpanded) ? 'chevrons-left' : 'chevrons-right';
        } else {
            // On desktop: right arrow when collapsed, left arrow when expanded
            targetIcon = this.isCollapsed ? 'chevrons-right' : 'chevrons-left';
        }
        
        console.log('UPDATE ICON: collapsed:', this.isCollapsed, 'mobileOpen:', mobileOpen, 'isMobile:', this.isMobile, 'targetIcon:', targetIcon);
        
        // Clear all existing icons (both <i> and <svg> elements)
        sidebarToggle.innerHTML = '';
        
        // Create new icon element
        const icon = document.createElement('i');
        icon.setAttribute('data-feather', targetIcon);
        sidebarToggle.appendChild(icon);
        
        // Debounced feather icon refresh
        this.refreshFeatherIcons();
    }
    
    toggleMobileMenu() {
        const sidenav = document.getElementById('side-nav');
        const overlay = document.getElementById('mobile-overlay');
        
        this.mobileOpen = !this.mobileOpen;
        
        console.log('TOGGLE MOBILE: mobileOpen:', this.mobileOpen);
        
        sidenav?.classList.toggle('mobile-open', this.mobileOpen);
        overlay?.classList.toggle('active', this.mobileOpen);
        
        // Update toggle icon to reflect new state
        this.debouncedUpdateToggleIcon();
    }
    
    closeMobileMenu() {
        const sidenav = document.getElementById('side-nav');
        const overlay = document.getElementById('mobile-overlay');
        
        this.mobileOpen = false;
        
        sidenav?.classList.remove('mobile-open');
        overlay?.classList.remove('active');
    }
    
    toggleSubnav(navLink) {
        const subnav = navLink.parentElement?.querySelector('.subnav');
        const arrow = navLink.querySelector('.nav-arrow');
        
        if (subnav && arrow) {
            const isExpanded = subnav.classList.contains('expanded');
            
            subnav.classList.toggle('expanded', !isExpanded);
            arrow.classList.toggle('expanded', !isExpanded);
        }
    }
    
    navigateToRoot(hash = '') {
        const basePath = this.options.basePath;
        const rootPath = basePath ? `${basePath}/index.html` : './index.html';
        window.location.href = rootPath + hash;
    }
    
    navigateToAdmin() {
        const basePath = this.options.basePath;
        const adminPath = basePath ? `${basePath}/admin/` : './admin/';
        window.location.href = adminPath;
    }
    
    // Initialize feather icons with 22px size
    initializeNavFeatherIcons() {
        if (typeof feather !== 'undefined') {
            feather.replace({
                width: 22,
                height: 22
            });
        }
    }

    // Load feather icons script if not already loaded
    loadFeatherIcons() {
        if (typeof feather !== 'undefined') {
            // Already loaded
            return;
        }
        
        // Check if script is already in the DOM
        const existingScript = document.querySelector('script[src*="feather-icons"]');
        if (existingScript) {
            return;
        }
        
        // Load feather icons script
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/feather-icons';
        script.onload = () => {
            this.initializeNavFeatherIcons();
        };
        document.head.appendChild(script);
    }

    // Debounced feather icon refresh
    refreshFeatherIcons() {
        if (this.featherTimeout) {
            clearTimeout(this.featherTimeout);
        }
        
        this.featherTimeout = setTimeout(() => {
            this.initializeNavFeatherIcons();
        }, 100);
    }
    
    // Public method to force immediate feather icon refresh
    replaceFeatherIcons() {
        this.initializeNavFeatherIcons();
    }
    
    
    // Update tooltip for the sidebar toggle button based on current state
    updateExpanderTooltip() {
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (!sidebarToggle) return;
        
        // Check actual sidenav state from DOM
        const sidenav = document.getElementById('side-nav');
        const actuallyCollapsed = sidenav?.classList.contains('collapsed') || false;
        const mobileOpen = sidenav?.classList.contains('mobile-open') || false;
        
        // Set appropriate tooltip text based on current state
        if (this.isMobile) {
            // On mobile, the button opens/closes the mobile menu
            const tooltipText = mobileOpen ? 'Close navigation' : 'Open navigation';
            sidebarToggle.setAttribute('title', tooltipText);
        } else {
            // On desktop, the button expands/collapses the sidebar
            const tooltipText = actuallyCollapsed ? 'Expand navigation' : 'Collapse navigation';
            sidebarToggle.setAttribute('title', tooltipText);
        }
    }
    
    // Initialize state after DOM is ready (no longer changes state, just updates UI)
    restoreState() {
        // Update expander tooltip based on current state
        this.updateExpanderTooltip();
        
        // Update icon to match current state
        this.debouncedUpdateToggleIcon();
    }
    
    // Invoked by .nav-link circle hover
    // Allow .tooltip-link button to transend edge of absolute.

    // Switching to rollover instead
    showTooltip(event, navLink) {
        //alert("showTooltip")
        // Remove existing tooltip
        this.hideTooltip();
        
        // Get the nav text content
        const navText = navLink.querySelector('.nav-text');
        if (!navText) return;
        
        const tooltipText = navText.textContent.trim();
        if (!tooltipText) return;
        
        // Get the nav icon
        const navIcon = navLink.querySelector('.nav-icon');
        if (!navIcon) return;
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'nav-tooltip show';
        tooltip.id = 'nav-tooltip';
        
        // Create clickable link wrapper
        const tooltipLink = document.createElement('button');
        tooltipLink.className = 'tooltip-link';
        
        // Copy the navigation functionality from the main nav button
        const href = navLink.getAttribute('data-href');
        if (href) {
            // Store href in data attribute for event delegation
            tooltipLink.setAttribute('data-href', href);
        }
        
        // Clone the icon and create tooltip content
        const iconClone = navIcon.cloneNode(true);
        
        // Handle both <i> and <svg> elements properly
        if (iconClone.tagName === 'svg') {
            iconClone.classList.add('tooltip-icon');
        } else {
            iconClone.className = 'tooltip-icon';
        }
        
        const textSpan = document.createElement('span');
        textSpan.className = 'tooltip-text';
        textSpan.textContent = tooltipText;
        
        // Add icon and text to tooltip link
        tooltipLink.appendChild(iconClone);
        tooltipLink.appendChild(textSpan);
        
        // Add link to tooltip
        tooltip.appendChild(tooltipLink);
        
        // Add tooltip event handlers to keep it visible when hovering
        const tooltipMouseEnterHandler = () => {
            tooltip.classList.add('show');
        };
        
        const tooltipMouseLeaveHandler = () => {
            this.hideTooltip();
        };
        
        tooltip.addEventListener('mouseenter', tooltipMouseEnterHandler);
        tooltip.addEventListener('mouseleave', tooltipMouseLeaveHandler);
        
        // Store handlers for cleanup
        tooltip._enterHandler = tooltipMouseEnterHandler;
        tooltip._leaveHandler = tooltipMouseLeaveHandler;
        
        // Add to body
        document.body.appendChild(tooltip);
        
        // Initialize feather icons for the cloned icon
        this.initializeNavFeatherIcons();
        
        // Position tooltip
        const rect = navLink.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        // Position tooltip so the icon aligns with the original nav circle
        const left = rect.left;
        const top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }
    
    hideTooltip() {
        const existingTooltip = document.getElementById('nav-tooltip');
        if (existingTooltip) {
            // Clean up event listeners
            if (existingTooltip._enterHandler) {
                existingTooltip.removeEventListener('mouseenter', existingTooltip._enterHandler);
            }
            if (existingTooltip._leaveHandler) {
                existingTooltip.removeEventListener('mouseleave', existingTooltip._leaveHandler);
            }
            existingTooltip.remove();
        }
    }
    
    // Clean up event listeners to prevent memory leaks
    destroy() {
        // Clear all timeouts and intervals
        if (this.featherTimeout) {
            clearTimeout(this.featherTimeout);
        }
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        if (this.faviconUpdateInterval) {
            clearInterval(this.faviconUpdateInterval);
        }
        
        // Remove any tooltips
        this.hideTooltip();
        
        // Remove all event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        
        this.eventListeners = [];
        
        // Clear singleton instance
        //StandaloneNavigation.instance = null;
    }
}

const navParam = getNavParam();
//const testParam = getNavParam('https://example.com?features.path=dashboard&user.name=john#features.story=onboarding&user.age=25&features.path=old-dashboard');
//console.log(JSON.stringify(testParam, null, 2));
//alert(testParam.features.story);

// Static property for singleton pattern
StandaloneNavigation.instance = null;

// Global instance
let standaloneNav;

// Initialize navigation function
function initializeStandaloneNav() {

    //alert("initializeStandaloneNav")
    //let hash = getHash();
    const defaultToGeo = (navParam.list == "geo" || window.location.hostname.includes('geo') || window.location.hostname.includes('location'));
    if (defaultToGeo) {
        //return; // Return for maps with Add City Visit
    }
    console.log('[StandaloneNav] initializeStandaloneNav called, existing instance:', !!StandaloneNavigation.instance);
    
    // Clean up existing instance if it exists
    if (standaloneNav) {
        console.log('[StandaloneNav] Destroying existing navigation instance');
        standaloneNav.destroy();
    }
    
    // Clear singleton instance to force recreation
    StandaloneNavigation.instance = null;
    
    // Determine base path based on current location
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(segment => segment && !segment.endsWith('.html'));
    let basePath = '';
    let repoFolderName = null;
    let isWebrootContainer = false;
    let isExternalSite = false;
    
    // Auto-detect repository folder name by checking for known files
    // Look for typical repo files to identify the repository folder
    const knownRepoFiles = ['Cargo.toml', 'package.json', 'README.md', 'CLAUDE.md'];
    let detectedRepoName = null;
    
    // Check if we're being called from an external site or within a webroot container
    if (detectedRepoName && pathSegments.includes(detectedRepoName)) {
        // We're inside the repository folder
        repoFolderName = detectedRepoName;
        isWebrootContainer = true;
        const repoIndex = pathSegments.indexOf(detectedRepoName);
        const segmentsAfterRepo = pathSegments.slice(repoIndex + 1);
        
        if (segmentsAfterRepo.length > 0) {
            basePath = '../'.repeat(segmentsAfterRepo.length);
            basePath = basePath.replace(/\/$/, '');
        }
    } else if (pathSegments.length > 0 && detectedRepoName) {
        // We're in a different site in the webroot, need to reference detected repo folder
        isExternalSite = true;
        repoFolderName = detectedRepoName;
        basePath = `/${detectedRepoName}`;
    } else if (pathSegments.length === 0) {
        // We're at root level - check if it's actually direct repo serving
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Local development - likely direct repo serving
            isExternalSite = false;
            basePath = './';
        } else {
            // External site at root - use fallback name
            isExternalSite = true;
            repoFolderName = 'explore'; // Default fallback
            basePath = '/explore';
        }
    } else {
        // Direct repo serving (legacy behavior)
        if (pathSegments.length > 1) {
            basePath = '../'.repeat(pathSegments.length - 1);
            basePath = basePath.replace(/\/$/, '');
        }
    }
    
    // Determine current page
    let currentPage = 'home';
    if (currentPath.includes('/admin/')) {
        currentPage = 'admin';
    }
    
    // Initialize standalone navigation
    standaloneNav = new StandaloneNavigation({
        basePath: basePath,
        currentPage: currentPage,
        isWebrootContainer: isWebrootContainer,
        repoFolderName: repoFolderName,
        isExternalSite: isExternalSite
    });
    
    // Make instance globally accessible
    window.standaloneNav = standaloneNav;
    
    // Restore state after initialization
    setTimeout(() => {
        //standaloneNav.restoreState();
    }, 100);
}


function getNavParam(url = window.location.href) {
  const urlObj = new URL(url);
  const quickNavParam = {};
  
  // Helper function to set nested object properties using dot notation
  function setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    // Navigate to the parent object, creating nested objects as needed
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {};
      }
      current = current[key];
    }
    
    // Set the final property
    const finalKey = keys[keys.length - 1];
    current[finalKey] = value;
  }
  
  // Parse hash parameters first (lower priority)
  const hashParams = new URLSearchParams(urlObj.hash.substring(1));
  for (const [key, value] of hashParams.entries()) {
    setNestedProperty(quickNavParam, key, value);
  }
  
  // Parse query parameters second (higher priority - will override hash params)
  const queryParams = urlObj.searchParams;
  for (const [key, value] of queryParams.entries()) {
    setNestedProperty(quickNavParam, key, value);
  }
  
  return quickNavParam;
}

initializeStandaloneNav();

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (standaloneNav) {
        standaloneNav.destroy();
    }
});

// Global function for manual favicon refresh
window.refreshFavicon = function() {
    if (standaloneNav && standaloneNav.refreshFavicon) {
        return standaloneNav.refreshFavicon();
    } else {
        console.warn('[FaviconManager] Navigation not initialized yet');
        return Promise.resolve(false);
    }
};


/// Navigation.js

const stateFromCountryAndStateNumber = {
  "US01": "AL", "US02": "AK", "US04": "AZ", "US05": "AR", "US06": "CA",
  "US08": "CO", "US09": "CT", "US10": "DE", "US11": "DC", "US12": "FL",
  "US13": "GA", "US15": "HI", "US16": "ID", "US17": "IL", "US18": "IN",
  "US19": "IA", "US20": "KS", "US21": "KY", "US22": "LA", "US23": "ME",
  "US24": "MD", "US25": "MA", "US26": "MI", "US27": "MN", "US28": "MS",
  "US29": "MO", "US30": "MT", "US31": "NE", "US32": "NV", "US33": "NH",
  "US34": "NJ", "US35": "NM", "US36": "NY", "US37": "NC", "US38": "ND",
  "US39": "OH", "US40": "OK", "US41": "OR", "US42": "PA", "US44": "RI",
  "US45": "SC", "US46": "SD", "US47": "TN", "US48": "TX", "US49": "UT",
  "US50": "VT", "US51": "VA", "US53": "WA", "US54": "WV", "US55": "WI",
  "US56": "WY", "US60": "AS", "US66": "GU", "US69": "MP", "US72": "PR",
  "US78": "VI"
};

function getUniqueStateAbbreviations(geo) {
  const fipsCodes = geo.split(',');
  const stateAbbreviations = new Set();

  fipsCodes.forEach(code => {
    const countryState = code.slice(0, 4);
    if (stateFromCountryAndStateNumber[countryState]) {
      stateAbbreviations.add(stateFromCountryAndStateNumber[countryState]);
    }
  });
  return Array.from(stateAbbreviations).join(',');
}

function hideSide(which) {
    console.log("hideSide");
    if (which == "list") {
        $("#main-nav").hide();
        $("#side-nav").removeClass("main-nav");
        $("#side-nav").removeClass("main-nav-full");

        $("#listcolumn").hide();
        if ($("#listcolumnList").text().trim().length > 0) {
            $("#showListInBar").show();
        }
        $("#showSideFromBar").show();
        if (!$("#side-nav-content").is(":visible")) {
            $('body').addClass("sidebar-hidden");
        }
    } else {
        $("#main-nav").hide();
        $("#side-nav").hide();
        $("#side-nav").removeClass("main-nav");
        $("#side-nav").removeClass("main-nav-full");
        $('body').removeClass('bodyLeftMarginFull');
        if ($("#main-content > .datascape").is(":visible")) { // When NOT embedded
            if ($("#listcolumn").is(':visible')) {
                $('#listcolumn').addClass('listcolumnOnly');
                console.log("addClass bodyLeftMarginList");
                $('body').addClass('bodyLeftMarginList');
            }
        }
    }
    if ($("#map1").text().trim().length > 1) {
        if (map1) {
            map1.invalidateSize(); // Refresh map tiles.
        }
    }
    if ($("#map2").text().trim().length > 1) {
        if (map2) {
            map2.invalidateSize(); // Refresh map tiles.
        }
    }

}
function popAdvanced() {
    waitForElm('#filterLocations').then((elm) => {        
        console.log("popAdvanced");
        closeSideTabs();
        $("#filterClickLocation").removeClass("filterClickActive");
        $("#filterLocations").appendTo($("#locationFilterPop"));
        $("#draggableSearch").show();
    });
}
function showSideTabs() {
    consoleLog("showSideTabs() in navigation.js");
    waitForElm('#rightSideTabs').then((elm) => {
        let hash = getHash();

        if (hash.sidetab) {
            $("#showSideTabs").hide();
            $('body').addClass('bodyRightMargin'); // Creates margin on right for fixed rightSideTabs.
            $('body').addClass('mobileView');
            $(".rightTopMenuInner div").removeClass("active");
            $(".menuExpanded").hide(); // Hide any open
            if (hash.sidetab == "sections") {
                $(".showSections").addClass("active");
                $("#sectionsPanel").show();
            } else if (hash.sidetab == "resources") {
                $(".showResources").addClass("active");
                $("#resourcesPanel").show();
            } else if (hash.sidetab == "seasons") {
                $(".showSeasons").addClass("active");
                $("#seasonsPanel").show();
            } else if (hash.sidetab == "topics") {
                showTopics();
            } else if (hash.sidetab == "locale") {
                showLocale();
            } else if (hash.sidetab == "settings") {
                $(".showSettings").addClass("active");
                $(".settingsPanel").show();
            } else if (hash.sidetab == "home") {
                $(".showDesktop").addClass("active");
                $("#desktopPanel").show();
            } else if (hash.sidetab == "account") {
                $(".showAccount").addClass("active");
                $("#accountPanel").show();
                $("#accountPanel .menuExpandedScroll").show();
            } else {
                //$("#rightSideTabs").show();
            }
            $("#rightSideTabs").show();
        } else {
            $("#showSideTabs").show();
            $('body').removeClass('bodyRightMargin'); // Creates margin on right for fixed rightSideTabs.
            $('body').removeClass('mobileView');
            //updateHash({"sidetab":""}); // Commented out since we're checking the hash above.
            $("#rightSideTabs").hide();
        }
    });
}
function populateFieldsFromHash() {
    let hash = getHash();
    waitForElm('#keywordsTB').then((elm) => {
        $("#keywordsTB").val(hash.q);
    });
    waitForElm('#mainCatList').then((elm) => {
        if (hash.cat) {
            var catString = hash.cat.replace(/_/g, ' ');
            consoleLog("#catSearch val: " + catString);
            $("#catSearch").val(catString);
            $('.catList > div').filter(function(){
                return $(this).text() === catString
            }).addClass('catListSelected');
        }
    });
    /*
    // This occurs in showList when checkboxes are added.
    if (param["search"]) {
        //$(".selected_col").prop('checked', false);
        alert("deselect")
        let search = param["search"].split(",");
        for(var i = 0 ; i < search.length ; i++) {
            if($("#" + search[i]).length) {
                alert(search[i]);
                //$("#" + search[i]).prop('checked', true);
                $("#items").prop('checked', true);
            }
        }
    }
    */
    $("#productCodes").val(hash.hs);
    if (hash.region) {
        if (hash.show) {
            $(".regiontitle").val(hash.region + " - " + hash.show.toTitleCaseFormat());
        } else {
            $(".regiontitle").val(hash.region);
        }
    }
}

// INIT
//$(".showSearch").css("display","inline-block");
//$(".showSearch").removeClass("local");

catArray = [];

// TO DO: Wait for other elements in page for several $(document).ready here
//$(document).ready(function() {

// Avoid since does not work when localsite.js loads navigation.js.
/////document.addEventListener('DOMContentLoaded', function() { // $(document).ready

    // Gets overwritten
    if (param.state) {
        $("#state_select").val(param.state.split(",")[0]);
    }
    
    // This can be reactivated for international harmonized system.
    /*
    alert(local_app.localsite_root() + 'js/d3.v5.min.js'); // Using localsite_root() for proper path resolution
    loadScript(local_app.localsite_root() + 'js/d3.v5.min.js', function(results) {

        // This avoids cross domain CORS error      
        
            d3.text(local_app.community_data_root() + 'global/hs/harmonized-system.txt').then(function(data) {
                if(location.host.indexOf('localhost') >= 0) {
                    console.log("Loaded Harmonized System (HS) codes - harmonized-system.txt");
                }
                let catLines = d3.csvParseRows(data);
                //alert(catLines.length)
                for(var i = 0; i < catLines.length; i++) {
                    catArray.push([catLines[i][0], catLines[i][1]]);
                }

                //catLines.forEach(function(element) {
                //  //catArray.push([element.substr(0,4), element.substr(5)]);
                //  catArray.push([element[0], element.[1]]);
                //});
                ////$('#mainCats > div:nth-child(11)').trigger("click"); // Specific category

                productList("01","99","Harmonized System (HS) Product Categories")

            });
        

        // Would this be usable? Old, find newer perhaps
        // https://github.com/FengJun-dev/harmonized-system
    });
    */


    /*
    // cross domain CORS error
    $.get(local_app.community_data_root() + 'global/hs/harmonized-system.txt', function(data) {

        var catLines = data.split("\n");
        
        catLines.forEach(function(element) {
          // 
          catArray.push([element.substr(0,4), element.substr(5)]);
        });
        //$('#mainCats > div:nth-child(11)').trigger("click"); // Specific category
        productList("01","99","Harmonized System (HS) Product Categories")
    }, 'text');
    */

    $("#productCodes").css('width','200px');
    $('#catListHolderShow').click(function () {
        if ($('#catsMobile').css('display') == 'none') {
            $('#catsMobile').show();
            $('#catListHolderShow').text('Hide Categories');
            $('#tableSide').removeClass('hideCatsMobile');
        } else {
            $('#catsMobile').hide();
            $('#catListHolderShow').text('Product Categories');
            $('#tableSide').addClass('hideCatsMobile');
        }
    });

    
    $(document).on("click", "#headerLogoholder", function(event) {
        const headerbarWidth = $("#headerbar").width();
        if (headerbarWidth && headerbarWidth <= 600) {
            if ($("#main-nav").is(':hidden')) {
                showNavColumn();
            } else {
                hideNavColumn();
            }
            event.stopPropagation();
            event.preventDefault();
        }
    });
    $(document).on("click", "#show_county_colors", function(event) {
        let hash = getHash();
        let layerName = "";
        if (hash.state) {
            layerName = hash.state.split(",")[0].toUpperCase() + " Counties";
        } else {
            console.log("State needed")
        }
        d3.csv("/community/start/maps/counties/topo/GA_county_regions.csv").then(function(detail_data) {
            // Similar to aside
            let dp = {
              numColumns: ["county_num","economic_region","wia_region","io_region"], // Omit "name" since not number.
              valueColumn: "io_region",
              //scaleType: "scaleQuantile",
              scaleType: "scaleOrdinal",
            }
            dp.name = "Regions"; // For top of legend. Differs from name column.
            dp.data = readCsvData(detail_data, dp.numColumns, dp.valueColumn); // This automatically includes all columns, even those not listed in numColumns.
            dp.scale = getScale(dp.data, dp.scaleType, dp.valueColumn); // Was used by addLegend. Returns a domain and range
            console.log("dp.scale");
            console.log(dp.scale);
        });

        geoOverlays[layerName].eachLayer(function (layer) {  
            if(layer.feature.properties.COUNTYFP == '037' || layer.feature.properties.COUNTYFP == '121') { // Los Angeles or Fulton Counties
              // Instead, we'll just make the border:3
              layer.setStyle({fillColor :'blue', fillOpacity:.5 }) 
              alert("blue")
              // Or call a function:
              // layer.setStyle(function...)
            }
        });
        //alert("done"); // Occurs before layers above appear.
    });

    $('#hsCatList > div').click(function () {
        //consoleLog('.menuRectLink click ' + $(this).attr("data-section").toLowerCase());
        $('#hsCatList > div').css('border', 'solid 1px #fff');
        //$('#mainCats > div:first-child').css('background-color', '#3B99FC');
        $(this).css('border', 'solid 1px #aaa');

        var attr = $(this).attr("range");
        if (typeof attr !== typeof undefined && attr !== false) {
            //productList($(this).html().substr(0,2), $(this).html().substr(3,2), $(this).html().substr(6));
            // + " (HS " + $(this).attr("range").replace("-","00 to ") + "00)"
            productList($(this).attr("range").substr(0,2), $(this).attr("range").substr(3,2), $(this).html());

            $('#topPanel').show();
            $('#allProductCats').show();
        }
        event.stopPropagation();
    });
    $('#allProductCats, #subcatHeader').click(function () {
        $('#hsCatList').show();
        $('#allProductCats').hide();
        $("#subcatHeader").html("Harmonized System (HS) Product Categories");
        $('#hsCatList > div').css('border', 'solid 1px #fff');
        productList("01","99","Harmonized System (HS) Product Categories");
    });
    $('#botButton').click(function () {
        if ($('#botPanel').css('display') === 'none') {
            $('#botPanel').show();
        } else {
            $('#botPanel').hide();
        }
        //$(".fieldSelector").hide();
        event.stopPropagation();
    });
    $(document).on("click", "#mapButton", function(event) {
        if ($('#mapPanel').css('display') === 'none') {
            $('#mapPanel').show();
        } else {
            $('#mapPanel').hide();
        }
        $("#introText").hide();
        event.stopPropagation();
    });
    $(document).on("click", "#topPanel", function(event) {
        event.stopPropagation(); // Allows HS codes to remain visible when clicking in panel.
    });

    $('#mainCats > div').each(function(index) { // Initial load
        $(this).attr("text", $(this).text());
    });
    $(document).on("click", "#catSearch", function(event) {
        //alert("#catSearch click - #toppanel has been deactivated and moved to map/index-categories.html")
        if ($('#topPanel').css('display') === 'none') {
            
            $('#productSubcats').css("max-height","300px");
            $('#topPanelFooter').show();
            $('#topPanel').show();
            $('#introText').hide();
            $('#mainCats > div').each(function(index) {
                if ($(this).attr("range")) {
                    $(this).html($(this).attr("text") + ' (' + $(this).attr("range") + ')');
                }
            });
        } else {
            $('#topPanel').hide();
            $('#mainCats > div').each(function(index) {
                if ($(this).attr("range")) {
                    $(this).html($(this).attr("text"));
                }
            });
        }
        $(".fieldSelector").hide();
        event.stopPropagation();
    });

    $('#productCodes').click(function () {
        // Needs to be changed after replacing/moving with #catSearch above.
        if ($('#topPanel').css('display') === 'none') {
            $('#productSubcats').css("max-height","300px");
            $('#topPanelFooter').show();
            $('#topPanel').show();
            $('#introText').hide();
            $('#mainCats > div').each(function(index) {
                if ($(this).attr("range")) {
                    $(this).html($(this).attr("text") + ' (' + $(this).attr("range") + ')');
                }
            });

        } else {
            //$('#topPanel').hide();
            $('#mainCats > div').each(function(index) {
                if ($(this).attr("range")) {
                    $(this).html($(this).attr("text"));
                }
            });
        }
        $(".fieldSelector").hide();
        event.stopPropagation();
    });

    
    /*
    $(".filterUL li").click(function(e) {
        //$(".filterBubbleHolder").hide();
        e.preventDefault();
        $(".filterUL li").removeClass("selected");
        $(this).addClass("selected");
        //$(".locationTabText").html($(this).text() + '<i class="entypo-down-open" style="font-size:13pt"></i>');
        $("#filterClickLocation .locationTabText").html($(this).text()).data('selected', $(this).data('id'));
        $("#locationDD option[value='" + $(this).data('id') + "']").prop("selected", true).trigger("change");
        
        $("#locationStatus").hide();
        //alert($(this).data('id'));
        consoleLog("Call locationFilterChange from .filterUL li click: " + $(this).data('id'));
        locationFilterChange($(this).data('id'),$(this).attr('geo'));
        goHash({"filter":$(this).data('id'),"geo":$(this).attr('geo')}, false);

        //$(".fieldSelector").hide(); // Close loc menu
        e.stopPropagation(); // Prevents click on containing #filterClickLocation.
     });
    */
    $('#topPanelFooter').click(function () {
        $('#productSubcats').css("max-height","none");
        $('#topPanelFooter').hide();
        event.stopPropagation();
    });

    $('#searchloc').click(function () {
        event.stopPropagation();
    });
    function getGeoviewLabel(value) {
        if (value == "country") {
            return "United States";
        }
        if (value == "none" || !value) {
            return "Geoview...";
        }
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
    function getGeoviewOptions() {
        return $("#geoview_select_list .geoviewSelectOption");
    }
    function setGeoviewSelect(value) {
        const allowedValues = ["none", "state", "country", "countries", "county", "zip", "city", "earth"];
        const safeValue = allowedValues.includes(value) ? value : "none";
        const stateValue = $("#state_select").val();
        if (safeValue == "state" && stateValue) {
            const stateText = $("#state_select").find(":selected").text();
            $("#geoview_select_text")
                .text(stateText)
                .data("value", safeValue);
            updateCountiesTabText();
        } else {
            $("#geoview_select_text")
                .text(getGeoviewLabel(safeValue))
                .data("value", safeValue);
        }
        updateGeoviewSelectText();
        const options = getGeoviewOptions();
        options.removeClass("selected").attr("aria-selected", "false");
        options.filter("[data-value='" + safeValue + "']").addClass("selected").attr("aria-selected", "true");
    }
    function setGeoviewTitleFromState() {
        waitForElm('#state_select').then((elm) => {
            waitForElm('#geoview_select_text').then((elm) => {
                const stateValue = $("#state_select").val();
                if (stateValue) {
                    const stateText = $("#state_select").find(":selected").text();
                    $("#geoview_select_text").text(stateText);
                }
            });
        });
    }
    function getActiveFilterSection() {
        const hash = getHash();
        if (!hash.geoview) {
            return "";
        }
        if (hash.geoview === "country") {
            return "state";
        }
        return hash.geoview;
    }
    function setFilterToggleIcon(iconName) {
        const holders = $("#filterFieldToggleHolder, #filterFieldToggleInHeader");
        if (!holders.length) {
            return;
        }
        holders.each(function() {
            const $holder = $(this);
            const $toggleIcon = $holder.find(".filter-field-toggle-icon");
            if (!$toggleIcon.length) {
                return;
            }
            $toggleIcon.text(iconName);
            if (iconName === "arrow_drop_down_circle") {
                // arrow_drop_down_circle has its own circle, hide the background circle
                $holder.find(".material-icons:first").hide();
                $holder.removeClass("filter-toggle-forward");
            } else {
                // arrow_right needs the background circle
                $holder.find(".material-icons:first").show();
                $holder.addClass("filter-toggle-forward");
            }
        });
    }
    function refreshFilterToggleIcon() {
        if (!$("#filterFieldToggleHolder, #filterFieldToggleInHeader").length) {
            return;
        }
        if ($("#filterFieldMenu").is(":visible")) {
            setFilterToggleIcon("arrow_drop_down_circle");
            return;
        }
        const activeSection = getActiveFilterSection();
        if (activeSection) {
            setFilterToggleIcon("arrow_drop_down_circle");
        } else {
            setFilterToggleIcon("arrow_right");
        }
    }
    function updateFilterMenuState() {
        const hash = getHash();
        const activeSection = getActiveFilterSection();
        const hasGeoview = !!activeSection;
        const hasAppview = !!hash.appview;
        $("#filterFieldMenuClose").toggle(hasGeoview);
        $("#filterFieldMenuCloseApps").toggle(hasAppview);
        // The first divider sits below "Close Map View" and should only show when a close action is visible.
        $("#filterFieldMenu .menuToggleDivider").first().toggle(hasGeoview || hasAppview);
        $("#filterFieldMenu .menuToggleItem[data-action='county']").toggle(!!hash.state);
        $("#filterFieldMenu .menuToggleItem[data-action]").each(function() {
            const action = $(this).data("action");
            const isActive = (action === activeSection) || (action === "topics" && hasAppview);
            $(this).toggleClass("is-active", isActive);
        });
    }
    function applyGeoviewSelection(value) {
        if (value == "earth" && $("#nullschoolHeader").is(":visible")) {
            goHash({"geoview":""});
            return;
        }
        if (value == "countries" || value == "earth") {
            hiddenhash.state = "";
            goHash({"geoview":value,"state":"",});
        } else if (value == "state" && !getHash().state) {
            let modelsite = Cookies.get('modelsite');
            if (modelsite == "model.georgia") {
                goHash({"geoview":value,"state":"GA"});
            } else {
                goHash({"geoview":value});
            }
        } else {
            goHash({"geoview":value});
        }
    }
    function openGeoviewList() {
        $("#geoview_container").show();
        $("#geoview_select").attr("aria-expanded", "true");
        $("#showLocations").show();
        $("#hideLocations").hide();
        $("#geoview_select_open").show();
        $("#geoview_select_text").hide();
        const options = getGeoviewOptions();
        let focused = options.filter(".selected");
        if (!focused.length) {
            focused = options.first();
        }
        options.removeClass("focused");
        focused.addClass("focused");
        $("#geoview_select_list").data("focusIndex", options.index(focused));
        refreshFilterToggleIcon();
    }
    function closeGeoviewList() {
        $("#geoview_container").hide();
        $("#geoview_select").attr("aria-expanded", "false");
        $("#showLocations").hide();
        $("#hideLocations").show();
        $("#geoview_select_open").hide();
        $("#geoview_select_text").show();
        getGeoviewOptions().removeClass("focused");
        refreshFilterToggleIcon();
    }
    function moveGeoviewFocus(direction) {
        const options = getGeoviewOptions();
        if (!options.length) {
            return;
        }
        let index = $("#geoview_select_list").data("focusIndex");
        if (typeof index !== "number" || index < 0) {
            index = 0;
        }
        index = (index + direction + options.length) % options.length;
        options.removeClass("focused");
        options.eq(index).addClass("focused");
        $("#geoview_select_list").data("focusIndex", index);
    }
    function selectFocusedGeoview() {
        const options = getGeoviewOptions();
        let index = $("#geoview_select_list").data("focusIndex");
        if (typeof index !== "number" || index < 0) {
            index = 0;
        }
        const option = options.eq(index);
        if (option.length) {
            const value = option.data("value");
            setGeoviewSelect(value);
            applyGeoviewSelection(value);
        }
        closeGeoviewList();
    }
    $(document).on("click", "#geoview_select", function(event) {
        if ($("#geoview_container").is(":visible")) {
            closeGeoviewList();
        } else {
            openGeoviewList();
        }
        event.stopPropagation();
    });
    $(document).on("click", "#geoview_select_list .geoviewSelectOption", function(event) {
        const value = $(this).data("value");
        setGeoviewSelect(value);
        applyGeoviewSelection(value);
        closeGeoviewList();
        event.stopPropagation();
    });
    $(document).on("keydown", "#geoview_select", function(event) {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            if (!$("#geoview_container").is(":visible")) {
                openGeoviewList();
            }
            moveGeoviewFocus(1);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            if (!$("#geoview_container").is(":visible")) {
                openGeoviewList();
            }
            moveGeoviewFocus(-1);
        } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if ($("#geoview_container").is(":visible")) {
                selectFocusedGeoview();
            } else {
                openGeoviewList();
            }
        } else if (event.key === "Escape") {
            if ($("#geoview_container").is(":visible")) {
                event.preventDefault();
                closeGeoviewList();
            }
        }
    });

    $(document).on("click", "#filterFieldToggleHolder, #filterFieldToggleInHeader", function(event) {
        $("#filterFieldMenu").toggle();
        updateFilterMenuState();
        refreshFilterToggleIcon();
        event.stopPropagation();
    });
    $(document).on("click", "#filterFieldsDropdownToggle", function(event) {
        if (!$("#filteFieldsDropdowns").length) {
            return;
        }
        const isOpen = $("#filteFieldsDropdowns").toggleClass("auto-hide-narrow").hasClass("auto-hide-narrow") === false;
        $(this).attr("aria-expanded", isOpen ? "true" : "false");
        event.stopPropagation();
    });
    waitForElm("#filterFieldsDropdownToggle").then(() => {
        if ($("#headerIcons").length) {
            $("#filterFieldsDropdownToggle").prependTo("#headerIcons");
            if ($("#filterFieldToggleHolder").length && !$("#filterFieldToggleInHeader").length) {
                const headerToggle = $("#filterFieldToggleHolder").clone();
                headerToggle.attr("id", "filterFieldToggleInHeader");
                headerToggle.find("#filterFieldToggleIcon").attr("id", "filterFieldToggleIconInHeader");
                headerToggle.prependTo("#headerIcons");
                refreshFilterToggleIcon();
            }
        }
    });

    $(document).on("click", "#filterFieldMenu .menuToggleItem", function(event) {
        const action = $(this).data("action");
        if (!action) {
            return;
        }
        const hash = getHash();
        const activeSection = getActiveFilterSection();
        $("#filterFieldMenu").hide();
        if (action === "aboutfilters") {
            window.location = "/localsite/info/data/map-filters/";
            refreshFilterToggleIcon();
            event.stopPropagation();
            return;
        }
        if (action === "hidefilters") {
            if (typeof showSearchFilter === "function") {
                showSearchFilter();
            } else {
                $(".showSearch").trigger("click");
            }
            refreshFilterToggleIcon();
            event.stopPropagation();
            return;
        }
        if (action === activeSection) {
            if (hash.appview) {
                goHash({"appview":""});
            } else {
                goHash({"geoview":""});
            }
            refreshFilterToggleIcon();
            event.stopPropagation();
            return;
        }
        if (action === "topics") {
            showApps("#bigThumbMenu");
            refreshFilterToggleIcon();
            event.stopPropagation();
            return;
        }
        if (typeof setGeoviewSelect === "function") {
            setGeoviewSelect(action);
        }
        if (typeof applyGeoviewSelection === "function") {
            applyGeoviewSelection(action);
        }
        refreshFilterToggleIcon();
        event.stopPropagation();
    });
    $(document).on("click", "#filterFieldMenu .menuToggleLink", function() {
        $("#filterFieldMenu").hide();
        refreshFilterToggleIcon();
    });
    $(document).on("click", "#filterFieldMenuClose", function(event) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        $("#filterFieldMenu").hide();
        goHash({"geoview":""});
        refreshFilterToggleIcon();
        requestAnimationFrame(() => {
            window.scrollTo(0, scrollTop);
        });
        event.stopPropagation();
    });
    $(document).on("click", "#filterFieldMenuCloseApps", function(event) {
        $("#filterFieldMenu").hide();
        goHash({"appview":""});
        refreshFilterToggleIcon();
        event.stopPropagation();
    });

    $(document).on("click", function(event) {
        if (!$(event.target).closest("#filterFieldMenu, #filterFieldToggleHolder").length) {
            $("#filterFieldMenu").hide();
            refreshFilterToggleIcon();
        }
    });

    function getWidgetSectionElement(sectionId) {
        if (!sectionId) {
            return $();
        }
        if (sectionId === "sectors") {
            if ($("#sectors").length) {
                return $("#sectors");
            }
            return $("#sector");
        }
        return $("#" + sectionId);
    }

    function widgetSectionIsHidden(sectionId) {
        const target = getWidgetSectionElement(sectionId);
        if (!target.length) {
            return false;
        }
        return !target.is(":visible");
    }

    function updateWidgetMenuState() {
        if (!$("#widgetList").length) {
            return;
        }
        let anyHidden = false;
        $("#widgetList .menuToggleItem[data-section]").each(function() {
            const sectionId = $(this).data("section");
            const isHidden = widgetSectionIsHidden(sectionId);
            $(this).toggleClass("is-active", !isHidden);
            if (isHidden) {
                anyHidden = true;
            }
        });
        $("#widgetListShowAll").toggle(anyHidden);
    }

    $(document).on("click", "#widgetToggleHolder", function(event) {
        $("#widgetList").toggle();
        updateWidgetMenuState();
        event.stopPropagation();
    });

    $(document).on("click", "#widgetList .menuToggleItem", function(event) {
        const action = $(this).data("action");
        const sectionId = $(this).data("section");
        if (action === "show-all") {
            $("#widgetList .menuToggleItem[data-section]").each(function() {
                const targetSection = $(this).data("section");
                const target = getWidgetSectionElement(targetSection);
                if (target.length) {
                    target.show();
                }
            });
            updateWidgetMenuState();
            $("#widgetList").hide();
            event.stopPropagation();
            return;
        }
        if (!sectionId) {
            return;
        }
        const target = getWidgetSectionElement(sectionId);
        if (target.length) {
            if (target.is(":visible")) {
                target.hide();
            } else {
                target.show();
            }
        }
        updateWidgetMenuState();
        $("#widgetList").hide();
        event.stopPropagation();
    });

    $(document).on("click", function(event) {
        if (!$(event.target).closest("#widgetList, #widgetToggleHolder").length) {
            $("#widgetList").hide();
        }
    });

    document.addEventListener('hashChangeEvent', function () {
        updateWidgetMenuState();
    });
    if (typeof waitForElm === "function") {
        waitForElm('#widgetToggleIcon').then(() => {
            updateWidgetMenuState();
        });
    }

    document.addEventListener('hashChangeEvent', function () {
        updateFilterMenuState();
        refreshFilterToggleIcon();
    });
    waitForElm('#filterFieldToggleIcon').then(() => {
        updateFilterMenuState();
        refreshFilterToggleIcon();
    });

    waitForElm('#geoview_statelist').then((elm) => {
        if ($("#state_select_holder").length) {
            $("#state_select_holder").appendTo("#geoview_statelist").show();
        }
    });

    // Move state select to relocatedStateMenu if it exists
    if ($("#relocatedStateMenu").length) {
        waitForElm('#state_select').then((elm) => {
            $("#state_select").appendTo("#relocatedStateMenu").show();
            $("#relocatedStateMenu").parent().show();
        });
    }

    // Watch for state_select_holder visibility and move state_select between locations
    waitForElm('#state_select_holder').then((holderElm) => {
        function checkAndMove() {
            const holderVisible = $("#state_select_holder").is(':visible');
            const stateSelectParent = $("#state_select").parent().attr('id');

            if (holderVisible && stateSelectParent !== 'state_select_holder') {
                // Move to holder and hide relocatedStateMenu parent
                $("#state_select").appendTo("#state_select_holder");
                if ($("#relocatedStateMenu").length) {
                    $("#relocatedStateMenu").parent().hide();
                }
            } else if (!holderVisible && $("#relocatedStateMenu").length && stateSelectParent !== 'relocatedStateMenu') {
                // Move to relocatedStateMenu and show its parent
                $("#state_select").appendTo("#relocatedStateMenu").show();
                $("#relocatedStateMenu").parent().show();
            }
        }

        // Initial check
        checkAndMove();

        // Watch for visibility changes
        const stateSelectObserver = new MutationObserver(checkAndMove);

        // Observe the holder and its parent containers
        stateSelectObserver.observe(holderElm, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });

        // Also observe parent elements for visibility changes
        let parent = holderElm.parentElement;
        while (parent && parent !== document.body) {
            stateSelectObserver.observe(parent, {
                attributes: true,
                attributeFilter: ['style', 'class']
            });
            parent = parent.parentElement;
        }
    });

    $(document).on("change", "#selectScope", function(event) {
        goHash({"scope":this.value});
    });
    //$('.selected_state').on('change', function() {
    $(document).on("change", ".selected_state", function(event) {
        $("#state_select").val(this.getAttribute("id"));
        goHash({'name':'','state':this.getAttribute("id")}); // triggers renderGeomapShapes("geomap", hash); // County select map
    });
    $(document).on("change", "#region_select", function(event) {
        regionSelect(this)
    });

    /*
    <li><a onClick="goHash({
    'regiontitle':'West+Central+Georgia',
    'geo':'US13045,US13077,US13143,US13145,US13149,US13199,US13223,US13233,US13263,US13285,US01111,US01017', 
    'lat':'33.0362',
    'lon':'-85.0322'
    }); $('.fieldSelector').hide(); return false;" href="#regiontitle=West+Central+Georgia&geo=US13045,US13077,US13143,US13145,US13149,US13199,US13223,US13233,US13263,US13285,US01111,US01017">West&nbsp;Central</a></li>
    <!-- Smaller region: US13077,US13145,US13149,US13199,US13263,US13285 -->

    <li><a onClick="goHash({
    'regiontitle':'Central+Georgia',
    'geo':'US13023,US13043,US13091,US13109,US13167,US13175,US13209,US13267,US13271,US13279,US13283,US13309,US13315,US13107,US13235', 
    'lat':'33.0362',
    'lon':'-85.0322'
    }); $('.fieldSelector').hide(); return false;" href="#regiontitle=Central+Georgia&geo=US13023,US13043,US13091,US13109,US13167,US13175,US13209,US13267,US13271,US13279,US13283,US13309,US13315,US13107,US13235">Central</a></li>

    <li><a onClick="goHash({
    'regiontitle':'Southeast+Coastal+Georgia',
    'geo':'US13001,US13005,US13127,US13161,US13229,US13305', 
    'lat':'31.1891',
    'lon':'-81.4979'
    }); $('.fieldSelector').hide(); return false;" href="#regiontitle=Southeast+Coastal+Georgia&geo=US13001,US13005,US13127,US13161,US13229,US13305&lat=31.1891&lon=-81.4980">Southeast Coastal</a></li>
    */
    
    $(document).click(function(event) { // Hide open menus
        console.log("document click -  Hide open menus (not active)")
        if ( !$(event.target).closest( "#goSearch" ).length ) {
            // BUGBUG - Reactivate after omitting clicks within location selects
            //$(".fieldSelector").hide(); // Avoid since this occurs when typing text in search field.
        }
        $('#keywordFields').hide();
        $('#topPanel').hide();
    });
    $(document).on("click", "body", function(event) {
        // Might revise this to hide right

        /*
        if ($("#main-nav").is(":visible") && window.innerWidth < 1200) { 
            $("#main-nav").hide();
            $("#showNavColumn").show();$("#showSideFromBar").hide();
            $("#sideIcons").show();
            //////$('body').removeClass('bodyLeftMargin');
            //////$('body').removeClass('bodyLeftMarginList');
            //////$('body').removeClass('bodyLeftMarginFull');
            //////$('body').removeClass('bodyLeftMarginNone'); // For DS side over hero
            if (!$('body').hasClass('bodyRightMargin')) {
                $('body').removeClass('mobileView');
            }
            $('#listcolumn').addClass('listcolumnOnly');
        }
        */
    });

    function regionSelect(selectMenu) {
        if(location.host.indexOf('localhost') >= 0) {
            //alert("localhost: #region_select change")
        }
        let hash = getHash();
        //alert($(selectMenu).attr("geo"))
        //goHash({'regiontitle':selectMenu.value,'lat':selectMenu.options[selectMenu.selectedIndex].getAttribute('lat'),'lon':selectMenu.options[selectMenu.selectedIndex].getAttribute('lon'),'geo':selectMenu.options[selectMenu.selectedIndex].getAttribute('geo')});
        //hiddenhash.geo = selectMenu.options[selectMenu.selectedIndex].getAttribute('geo');
        //console.log("hiddenhash.geo " + hiddenhash.geo);
        delete hash.geo;
        delete param.geo;
        /*
        try {
            delete params.geo; // Used by old naics.js
        } catch(e) {
            console.log("Remove params.geo after upgrading naics.js " + e);
        }
        */

        //params.geo = hiddenhash.geo; // Used by naics.js
        local_app.latitude = selectMenu.options[selectMenu.selectedIndex].getAttribute('lat');
        local_app.longitude = selectMenu.options[selectMenu.selectedIndex].getAttribute('lon');

        // Infinite loop - locks up the browser
        // BUGBUG: Map quickly gets progressively darker
        console.log("regionSelect() goHash was previously disabled due to possible map update loop.")
        //goHash({'state':hash.state, 'regiontitle':selectMenu.value,'geo':''});
        
        // Try this instead
        updateHash({'regiontitle':selectMenu.value,'geo':''});
    }
    function hideNonListPanels() {
        goHash({"geoview":""});
        $(".fieldSelector").hide(); // Avoid since this occurs when typing text in search field.
        $('#topPanel').hide();
        $("#introText").hide();
        $("#mapPanel").hide(); $("#filterClickLocation").removeClass("filterClickActive");
        if(location.host.indexOf('localhost') >= 0) {
            $('#mapButton').show();
        }
    }
    $(document).on("click", "#goSearch", function(event) {
        console.log("goSearch")
        let hash = getHash();
        let searchQuery = $('#keywordsTB').val();
        console.log("Search for " + searchQuery);
        let search = $('.selected_col:checked').map(function() {return this.id;}).get().join(',');
        // TODO: set search to empty array if all search boxes are checked.
        if(!hash.show && location.href.indexOf('/localsite/info/') < 0) {
            updateHash({"geoview":""});
            window.location = "/localsite/info/" + location.hash;
            return;
        }
        goHash({"q":searchQuery,"search":search,"geoview":""}); // triggers hash change event.
        //event.stopPropagation(); // Avoid so search checkboxes are hidden.
    });

    $(document).on("click", "#keywordsTB", function(event) {
        closeGeoviewList();
        if ($("#keywordFields").is(':visible')) {
            $("#keywordFields").hide();
        } else {
            $("#filterLocations").hide();
            if (!$("#selected_col_checkboxes").is(':empty')) {
             $("#keywordFields").show();
            }
        }
        event.stopPropagation();
    });
    $("#findWhat, #productCodeHolder").click(function() { /* Stop drilldown */
        event.stopPropagation();
    });
    $("#hideCatPanel").click(function() {
        $("#mainCats").hide();
        //$("#hideCatPanel").hide();
        $("#showCatPanel").show();
        event.stopPropagation();
    });
    $("#showCatPanel").click(function() {
        $("#showCatPanel").hide();
        $("#mainCats").show();
        event.stopPropagation();
    });
    $("#hideBotPanel").click(function() {
        $("#botPanel").hide();
        event.stopPropagation();
    });
    $("#hideTopPanel").click(function() {
        $("#topPanel").hide();
    });
    $("#hideMapPanel").click(function() {
        $("#mapPanel").hide();
        $("#mapButton").show();
        event.stopPropagation();
    });

    
    $(".showLocMenu").click(function() {
        $(".locMenu").show();
    });
    $("#hideSidemap").click(function() {
        $("#sidemapCard").hide();
        $("#detaillist > .detail").css("border","none");
    });

    function clearFields() {
        $(".eWidget").show();
        hideNonListPanels();
        //$('#industryCatList > div').removeClass('catListSelected');
        $("#keywordsTB").val("");
        $("#catSearch").val("");
        $("#productCodes").val("");
        $("#productCatTitle").html("");
        $("#eTable_alert").hide();
        $("#mainframe").hide();
        $("#filterClickLocation").removeClass("filterClickActive");
        $(".output_table input").prop('checked',false); // geo counties
        $("input[name='hs']").prop('checked',false);
        $("input[name='in']").prop('checked',true);
    }
    clearButtonClick = function () { // Allow return false to be passed back.
        clearFields();
        clearHash("cat,search,q,geo,name"); // Avoids triggering hash change
        //dataObject.geos = null; // Loaded when geo is in hash on init, to avoid time to place hidden checkboxes.
        //history.pushState("", document.title, window.location.pathname);
        //loadHtmlTable(true); // New list

        let hash = getHash();
        goHash(hash); // Now trigger the hash change
        return false; // Deactivates a href
    }
    $("#clearButton").click(function() {
        clearButtonClick();
    });
    $("#botGo").click(function() {
        alert("Chat Bot under development.");
    });
    
    $('showMap').click(function () {

    });
    $('#toggleList').click(function () {
        if ($('#mainList').css('display') != 'none') {
            $('#dataGrid').show();
            $('#mainList').hide();
        } else {
            $('#mainList').show();
            $('#dataGrid').hide();
        }
        //event.stopPropagation();
    });

    //DELETE
    //function replaceAll(str, find, replace) {
    //    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
    //}
//});

function readCsvData(_data, columnsNum, valueCol) {
  if (typeof columnsNum !== "undefined") {
    _data.forEach( function (row) {
      //row = removeWhiteSpaces(row);
      convertToNumber(row, columnsNum);
    });
  }
  console.log(_data);
  return _data;
}
function convertToNumber(d, _columnsNum) {
  for (var perm in d) {
    if (_columnsNum.indexOf(perm) > -1)
      if (Object.prototype.hasOwnProperty.call(d, perm)) {
        d[perm] = +d[perm];
      }
    }  
  return d;
} 
function getScale(data, scaleType, valueCol) {
  // Also see: http://d3indepth.com/scales/
  var scale;
  if (scaleType === "scaleThreshold") {
    var min = d3.min(data, function(d) { return d[valueCol]; });
    var max = d3.max(data, function(d) { return d[valueCol]; });
    var d = (max-min)/7;
    scale = d3.scaleThreshold()
      .domain([min+1*d,min+2*d,min+3*d,min+4*d,min+5*d,min+6*d])
      .range(['#ffffe0','#ffd59b','#ffa474','#f47461','#db4551','#b81b34','#8b0000']);
  } else if (scaleType === "scaleQuantize") {
    scale = d3.scaleQuantize()
      .domain(d3.extent(data, function(d) { return d[valueCol]; }))
      .range(['#ffffe0','#ffd59b','#ffa474','#f47461','#db4551','#b81b34','#8b0000']);
  } else if (scaleType === "scaleQuantile") {
    scale = d3.scaleQuantile()
      .domain(data.map(function(d) { return d[valueCol]; }).sort(function(a, b){return a-b}))
      .range(['#ffffe0','#ffd59b','#ffa474','#f47461','#db4551','#b81b34','#8b0000']);            
  } else if (scaleType === "scaleOrdinal") {
    scale = d3.scaleOrdinal()
      //.domain(data.map(function(d) { return d[valueCol]; }))
      .domain(data.map(function(d) { return d[valueCol]; }).sort(function(a, b){return a-b}))
      .range(d3.schemePaired);
  }
  return scale;
}

function productList(startRange, endRange, text) {
    // Displays Harmonized System (HS) subcategories
    // To Do: Lazyload file when initially requested - when #catSearch is clicked.

    // BUGBUG - called twice, sometimes without catArray.
    //alert("catArray.length " + catArray.length)

    if (!$("#productCodes").length) {
        return;
    }
    $("#productSubcats").html("");
    $("#productCatTitle").html("");
    console.log("productList " + startRange + ' to ' + endRange + " " + text);
    $("#subcatHeader").html(text);

    console.log("pcodes: " + $("#productCodes").val())
    var productcodes = $("#productCodes").val().replace(";",",");
    var productcode_array = productcodes.split(/\s*,\s*/); // Removes space when splitting on comma
    //alert("productcode_array " + productcode_array[0].length);

    if (catArray.length > 0) {
        $("#catRowCount").html(catArray.length);
        $("#botWelcome").show();
    }
    //console.log("catArray " + catArray)
    var checkProductBox;
    catArray.forEach(function(entry) {
        checkProductBox = false;
        for(var i = 0; i < productcode_array.length; i++) {
            if (productcode_array[i].length > 0) {
                if (isInt(productcode_array[i])) { // Int
                        // Reduce to four digits
                        productcode_truncated = productcode_array[i].substring(0,4);
                        //console.log("Does " + entry[0] + " start with " + productcode_truncated);

                        if (entry[0].startsWith(productcode_truncated)) { // If columns values start with search values.
                            $("#productCatTitle").append(entry[0] + " - " + entry[1] + "<br>");
                            checkProductBox = true;
                            // To activate on list of HS types is displayed.
                            $("#catSearchHolder").removeClass("localonly");
                        } else {
                            //console.log("Not Found");
                        }
                    
                } else {
                    console.log("Alert: productcode " + productcode_array[i] + " not integer.")
                    //productMatchFound++;
                }
            }
        }

        if (entry[0] > (startRange*100) && entry[0] < (endRange*100+99)) {
            //console.log(entry[0]);
            var ischecked = "";
            if (checkProductBox) {
                ischecked = "checked";
            }
            $("#productSubcats").append( "<div><div><input name='hs' type='checkbox' " + ischecked + " value='" + entry[0] + "'> " + entry[0] + "</div><div>" + entry[1] + "</div></div>" );
        }
    });
    if ($(window).width() < 600) {
        //$('#mainCats').hide();
    }
    
    $('#productSubcats > div').click(function () {
        $(this).find('input[type=checkbox]').prop("checked", !$(this).find('input[type=checkbox]').prop("checked")); // toggle
        let hsCodes = $('#productSubcats input:checked').map(function() {return this.value;}).get().join(','); // Note use of value instead of id.
        updateHash({"hs":hsCodes});
        event.stopPropagation();
    });

    //$('#productSubcats > div:first-child').click(function () {
    //  $('#mainCats').show();
    //  $('.backArrow').hide();
    //    event.stopPropagation();
    //});
}
function renderGeomapShapes(whichmap, hash, geoview, attempts) {
  console.log("renderGeomapShapes() state: " + hash.state + " attempts: " + attempts);
  // local_app.topojson_root() + 
  loadScript(local_app.localsite_root() + 'js/topojson-client.min.js', function(results) {
    renderMapShapeAfterPromise(whichmap, hash, attempts);
  });
}

function getStateAbbreviation(stateID) {
  const stateIDs = localObject.us_stateIDs;
  for (const [abbreviation, id] of Object.entries(stateIDs)) {
    if (id.toString() === stateID.toString()) {
      return abbreviation;
    }
  }
  return null; // Return null if no match is found
}

//var geojsonLayer; // Hold the prior letter. We can use an array or object instead.
var geoOverlays = {};
function renderMapShapeAfterPromise(whichmap, hash, geoview, attempts) {
  // Called for each state in URL hash. Arrives as hash.state with one state each time.
  let stateAbbr = "";
  //alert("hash.state " + hash.state);
  if (hash.state) {
              hash.state = hash.state.split(",").filter(s => s.length === 2).join(","); // Remove if not 2-char, including state=all
        stateAbbr = hash.state.split(",")[0].toUpperCase();
  }
  if (stateAbbr == "DC") {
    console.log("TOPOJSON IS NOT AVAILABLE FOR DC");
    return
  }

 includeCSS3(theroot + 'css/leaflet.css',theroot);
  loadScript(theroot + 'js/leaflet.js', function(results) {

    waitForVariable('L', function() { // Wait for Leaflet

    // Occurs twice in page
    let modelsite = Cookies.get('modelsite');

    // Allow URL parameter to override cookie for testing
    if (hash.site) {
        modelsite = hash.site;
    }

    if (!stateAbbr && modelsite) {
        if (modelsite == "model.georgia" || location.host.indexOf("georgia") >= 0 || location.host.indexOf("locations.pages.dev") >= 0) { // Add loop if other states added to settings.
            stateAbbr = "GA";
        }
    }

    // In addition, the state could also be derived from the county geo value(s).
    var stateCount = typeof hash.state !== "undefined" ? hash.state.split(",").length : 0;
    if (stateCount > 1 && hash.geoview != "country") {
      console.log("Call renderMapShapeAfterPromise for each state in " + hash.state);
      let reversedStr = hash.state.split(",").reverse().join(",");
      console.log("TO DO: Figure out why ony last state is retained on map")
      reversedStr.split(",").forEach(function(state) { // Loop through each state
        hashclone = $.extend(true, [], hash); // Clone/copy object without entanglement
        hashclone.state = state.toUpperCase(); // One state at a time
        renderMapShapeAfterPromise(whichmap, hashclone, 0); // Using clone since hash could be modified mid-loop by another widget,
      });
      return;
    }
    console.log("renderMapShapeAfterPromise " + whichmap + " state: " + stateAbbr);

    if (stateAbbr == "GA") { // TO DO: Add regions for all states
      $(".regionFilter").show();
    } else {
      $(".regionFilter").hide();
    }
    $("#state_select").val(stateAbbr); // Used for lat lon fetch

    // local_app.topojson_root() + 
    loadScript(local_app.localsite_root() + 'js/topojson-client.min.js', function(results) {
    console.log("topoJsonReady loaded from " + local_app.topojson_root());
    //waitForVariable('topoJsonReady', function () {
    //console.log("topoJsonReady " + topoJsonReady);
    //window.topojson = require('topojson-client');
    //topojson = topojson-client;
    waitForElm('#' + whichmap).then((elm) => {

        if (hash.geoview == "earth") {
          $("#geoPicker").hide();
          return;
        }
        $("#geoPicker").show();
        $('#' + whichmap).show();
        if (!$("#" + whichmap).is(":visible")) {
          // Oddly, this is needed when using 3-keys to reload: Cmd-shift-R
          $("#filterLocations").show();$("#locationFilterHolder").show();$("#imagineBar").show(); 

          consoleLog("Caution: #" + whichmap + " not visible. May effect tile loading.");
          //return; // Prevents incomplete tiles
        }

        var req = new XMLHttpRequest();
        //const whichGeoRegion = hash.geomap;

        // Topo data source
        //https://github.com/deldersveld/topojson/tree/master/countries/us-states

        updateGeoFilter(hash.geo); // Checks and unchecks geo (counties) when backing up.

        // BUGBUG - Shouldn't need to fetch counties.json every time.

        // TOPO Files: https://github.com/modelearth/topojson/countries/us-states/AL-01-alabama-counties.json";

        // US:
        let stateIDs = {AL:1,AK:2,AZ:4,AR:5,CA:6,CO:8,CT:9,DE:10,FL:12,GA:13,HI:15,ID:16,IL:17,IN:18,IA:19,KS:20,KY:21,LA:22,ME:23,MD:24,MA:25,MI:26,MN:27,MS:28,MO:29,MT:30,NE:31,NV:32,NH:33,NJ:34,NM:35,NY:36,NC:37,ND:38,OH:39,OK:40,OR:41,PA:42,RI:44,SC:45,SD:46,TN:47,TX:48,UT:49,VT:50,VA:51,WA:53,WV:54,WI:55,WY:56,AS:60,GU:66,MP:69,PR:72,VI:78};
        let state2char = ('0'+stateIDs[stateAbbr]).slice(-2);
        //let stateNameLowercase = $("#state_select option:selected").text().toLowerCase();

        let map;
        // MAPS FROM TOPOJSON

        //alert($("#state_select option:selected").attr("stateid"));
        //alert($("#state_select option:selected").val()); // works

        // $("#state_select").find(":selected").text();

        //if(location.host.indexOf('localhost') >= 0) {
        //if (param.geo == "US01" || param.state == "AL") { // Bug, change to get state from string, also below.
        // https://github.com/modelearth/topojson/blob/master/countries/us-states/AL-01-alabama-counties.json

        //var url = local_app.custom_data_root() + '/counties/GA-13-georgia-counties.json';
        
        var lat = 32.69;
        var lon = -20; // -83.2;
        let zoom = 2;
        let theState = $("#state_select").find(":selected").val();

        var url;
        let topoObjName = "";
        var layerName = "Map Layer";

            let allowedStates = [];
            if (hash.state) {
                allowedStates = hash.state.split(",").map(function(state){
                    return state.trim().toUpperCase();
                }).filter(Boolean);
            } else if (theState) {
                allowedStates = [theState.toUpperCase()];
            }
            let missingStates = allowedStates.filter(function(stateAbbr){
                const stateID = localObject.us_stateIDs[stateAbbr];
                if (!stateID) {
                    return false;
                }
                const stateGeo = "US" + ('0' + stateID).slice(-2);
                return localObject.stateCountiesLoaded.indexOf(stateGeo) === -1;
            });

            if (hash.geoview == "zip") {
          layerName = "Zipcodes";
          if (stateAbbr) {
            url = local_app.web_root() + "/community-forecasting/map/zcta/states/" + getState(stateAbbr) + ".topo.json";
          } else {
            url = local_app.web_root() + "/community-forecasting/map/zip/topo/zips_us_topo.json";
          }
          topoObjName = "topoob.objects.data";
        }  else if (hash.geoview == "country") { // USA  && stateAbbr.length != 2
          layerName = "States";
          url = local_app.web_root() + "/localsite/map/topo/states-10m.json"; // name parameter is full state name
          topoObjName = "topoob.objects.states";
        } else if (stateAbbr && stateAbbr.length <= 2 && hash.geoview != "countries") { // COUNTIES
          layerName = stateAbbr + " Counties";
          let stateNameLowercase = getStateNameFromID(stateAbbr).toLowerCase();
          let countyFileTerm = "-counties.json";
          let countyTopoTerm = "_county_20m";
          if (stateNameLowercase == "louisiana") {
            countyFileTerm = "-parishes.json";
            countyTopoTerm = "_parish_20m";
          }
          // Contains topo shape, plus STATEFP and COUNTYFP and GEOID (which combines both)
          url = local_app.topojson_root() + "/topojson/countries/us-states/" + stateAbbr + "-" + state2char + "-" + stateNameLowercase.replace(/\s+/g, '-') + countyFileTerm;
          topoObjName = "topoob.objects.cb_2015_" + stateNameLowercase.replace(/\s+/g, '_') + countyTopoTerm;

          //url = local_app.topojson_root_root() + "/topojson/countries/us-states/GA-13-georgia-counties.json";
        } else { // ALL COUNTRIES
          layerName = "Countries";
          url = local_app.topojson_root() + "/topojson/world-countries-sans-antarctica.json";
          topoObjName = "topoob.objects.countries1";
        }
        console.log("Loading topojson url: " + url);
        console.log("State parameter: " + (hash.state || 'undefined'));
        console.log("geoview parameter: " + (hash.geoview || 'undefined'));

        req.open('GET', url, true);
        req.onreadystatechange = handler;
        req.send();

        var topoob = {};
        var topodata = {};
        var neighbors = {};
        function handler(){

        if(req.readyState === XMLHttpRequest.DONE) {

            topoob = JSON.parse(req.responseText)
            
            // Check if topojson library is loaded
            if (typeof topojson === 'undefined') {
                console.log('topojson library not loaded. Loading it now...');
                
                // Check if we're already in the process of loading topojson
                if (window.topojsonLoading) {
                    console.log('topojson already loading, waiting...');
                    setTimeout(function() {
                        handler(); // Retry the entire handler
                    }, 200);
                    return;
                }
                
                window.topojsonLoading = true;
                
                // Instead of fighting the existing script loading system, 
                // work with it by forcing a reload of the global object
                console.log('Forcing topojson global creation...');
                
                // Check if the script content is already loaded but global not created
                const existingScript = document.querySelector('script[src*="topojson"]');
                if (existingScript) {
                    
                    // Try to manually execute the UMD pattern
                    try {
                        // Create a new script element that forces global execution
                        const forceScript = document.createElement('script');
                        forceScript.textContent = `
                            // Force topojson global creation
                            if (typeof window.topojson === 'undefined') {
                                // Load and execute the topojson script content directly
                                var script = document.createElement('script');
                                script.src = local_app.localsite_root() + 'js/topojson-client310.min.js';
                                script.onload = function() {
                                    setTimeout(function() {
                                        if (typeof topojson !== 'undefined' && topojson.feature) {
                                            console.log('topojson global successfully created');
                                            window.topojsonLoading = false;
                                            // Trigger the continuation
                                            window.dispatchEvent(new CustomEvent('topojsonReady'));
                                        }
                                    }, 50);
                                };
                                document.head.appendChild(script);
                            }
                        `;
                        document.head.appendChild(forceScript);
                        
                        // Listen for the ready event
                        window.addEventListener('topojsonReady', function() {
                            if (typeof topojson !== 'undefined' && topojson.feature) {
                                topodata = topojson.feature(topoob, eval(topoObjName));
                                continueHandler();
                            }
                        }, { once: true });
                        
                        // Also set a timeout fallback
                        setTimeout(function() {
                            if (typeof topojson !== 'undefined' && topojson.feature) {
                                console.log('topojson available via timeout fallback');
                                window.topojsonLoading = false;
                                topodata = topojson.feature(topoob, eval(topoObjName));
                                continueHandler();
                            } else {
                                console.error('topojson still not available after force loading');
                                window.topojsonLoading = false;
                            }
                        }, 300);
                        
                    } catch (e) {
                        console.error('Failed to force topojson loading:', e);
                        window.topojsonLoading = false;
                    }
                } else {
                    // No existing script, load it fresh
                    const script = document.createElement('script');
                    script.src = local_app.localsite_root() + 'js/topojson-client310.min.js';
                    script.onload = function() {
                        setTimeout(function() {
                            if (typeof topojson !== 'undefined' && topojson.feature) {
                                console.log('topojson library loaded successfully');
                                window.topojsonLoading = false;
                                topodata = topojson.feature(topoob, eval(topoObjName));
                                continueHandler();
                            }
                        }, 100);
                    };
                    document.head.appendChild(script);
                }
                return;
            }
            
            topodata = topojson.feature(topoob, eval(topoObjName));
            continueHandler();
        }
        }
        
        function continueHandler() {
            //console.log("topodata")
            //console.log(topodata)
              
              
              if (hash.geoview == "earth" && theState == "") {
                zoom = 2
                lat = "25"
                lon = "0"
              } else if (hash.geoview == "country") {
                zoom = 4
                lat = "39.5"
                lon = "-96"
              } else if (hash.geoview == "countries") {
                zoom = 2
                lat = "25"
                lon = "0"
              } else if ($("#state_select").find(":selected").attr("lat")) {
                let kilometers_wide = $("#state_select").find(":selected").attr("km");
                zoom = zoomFromKm(kilometers_wide,theState);
                lat = $("#state_select").find(":selected").attr("lat");
                //alert("lat " + lat)
                lon = $("#state_select").find(":selected").attr("lon");
              }
              var mapCenter = [lat,lon];

              var mbAttr = '<a href="https://neighborhood.org">Neighborhood.org</a> | <a href="https://www.openstreetmap.org/">OpenStreetMap</a> | ' +
                  '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                  'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
              const mapboxToken = (typeof window !== "undefined" && typeof window.mapboxAccessToken === "string") ? window.mapboxAccessToken : "";
              const mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png' + (mapboxToken ? ('?access_token=' + mapboxToken) : '');

              var grayscale = L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr}),
                  satellite = L.tileLayer(mbUrl, {id: 'mapbox.satellite',   attribution: mbAttr}),
                  streets = L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: mbAttr});

              var OpenStreetMap_BlackAndWhite = L.tileLayer('//{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
                  maxZoom: 18,
                  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              });

              //let dataParameters = {}; // Temp

              if (document.querySelector('#' + whichmap)) {
                //alert("Recall existing map: " + whichmap);
                map = document.querySelector('#' + whichmap)._leaflet_map; // Recall existing map
              }
              var container = L.DomUtil.get(map);
              //if (container == null || map == undefined || map == null) { // Does not work

                // Don't add, breaks /info
                // && $('#' + whichmap).html()
                //if ($('#' + whichmap) && $('#' + whichmap).html().length == 0) { // Note: Avoid putting loading icon within map div.
                      //alert("set " + whichmap)

                 //var container = L.DomUtil.get(map);
                 //alert(container)
                 if (container == null) { // Initialize map
                    //alert("container null")
                    // Line above does not work, so we remove map:

                    var basemaps1 = {
                  'Satellite' : L.tileLayer(mbUrl, {maxZoom: 25, id: 'mapbox.satellite', attribution: mbAttr}),
                  // OpenStreetMap
                  'Street Map' : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                      maxZoom: 19, attribution: '<a href="https://neighborhood.org">Neighborhood.org</a> | <a href="http://openstreetmap.org">OpenStreetMap</a> | <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                  }),
                  // OpenStreetMap_BlackAndWhite:
                  'Grey' : L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
                      maxZoom: 18, attribution: '<a href="https://neighborhood.org">Neighborhood.org</a> | <a href="http://openstreetmap.org">OpenStreetMap</a> | <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                  }),
                }


                container = L.DomUtil.get(whichmap);
                if(container != null) {
                  container._leaflet_id = null; // Prevents error: Map container is already initialized.
                }

                // Try commenting this out
                /*
                try { // Traps the first to avoid error when changing from US to state, or adding state.
                  //map.off();
                  map.remove(); // removes the previous map element using Leaflet's library (instead of jquery's).


                } catch(e) {

                }        
                */
                if(!map) {
                  map = L.map(whichmap, {
                    center: new L.LatLng(lat,lon),
                    scrollWheelZoom: false,
                    zoom: zoom,
                    dragging: !L.Browser.mobile, 
                    tap: !L.Browser.mobile
                  });

                  //L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                  //    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  //}).addTo(map);
                }
                
                // Add
                geoOverlays[layerName] = L.geoJson(topodata, {style:styleShape, onEachFeature: onEachFeature}).addTo(map); // Called within addTo(map)
            
                layerControls[whichmap] = L.control.layers(basemaps1, geoOverlays, {position: 'bottomleft'}).addTo(map); // Push multple layers
                if (onlineApp) {
                    basemaps1["Grey"].addTo(map);
                }

            //} else if (geojsonLayer) { // INDICATES TOPO WAS ALREADY LOADED
            } else if (map.hasLayer(geoOverlays[layerName])) {

                // Add 
                  //geojsonLayer = L.geoJson(topodata, {style:styleShape, onEachFeature: onEachFeature}).addTo(map); // Called within addTo(map)
                
                  //map.removeLayer(geoOverlays[layerName]);

                  if (geoOverlays[layerName]) {
                    map.removeLayer(geoOverlays[layerName]); // Remove overlay but not checkbox.
                  }
                  //map.removeOverlay(geoOverlays[layerName]);

                  //layerControls[whichmap].addOverlay(geoOverlays[layerName], layerName); // Sorta works - use to add a duplicate check box
                  
                  //layerControls[whichmap].removeOverlay(layerName);
                  //layerControls[whichmap].removeOverlay(geoOverlays[layerName], layerName);

                  geoOverlays[layerName] = L.geoJson(topodata, {
                        style: styleShape, 
                        onEachFeature: onEachFeature
                  }).addTo(map);

                  /*
                  var geojsonLayer = L.geoJson(topodata, {
                        style: styleShape, 
                        onEachFeature: onEachFeature
                  }).addTo(map);
                  geoOverlays[layerName] = geojsonLayer;
                  */


                  //console.log("DISABLE REMOVE - Remove the prior topo layer")
                  //alert("Remove prior, has geojsonLayer")


                  /*
                  // Prevent drawing on top of 
              
                // Causes error in /map : leaflet.js:5 Uncaught TypeError: Cannot read property '_removePath' of undefined
                //if(map.hasLayer(geojsonLayer)) {
                
                  alert("HAS PRIOR LAYER, REMOVE")
                  //alert("Need to check if already exists: " + layerName);
                  // Need to use name of prior layer.
                  //map.removeLayer(geojsonLayer); // Prevents overlapping by removing the prior topo layer
                  ////map.geojsonLayer.clearLayers();

                  //alert(geoOverlays[layerName])
                  geoOverlays[layerName].remove(); // Prevent thick overlapping colors
                  //geoOverlays[layerName].clearLayers();
                  map.removeLayer(geoOverlays[layerName]);
                
                //map.geojsonLayer.clearLayers(); // Clear prior
                */

                map.setView(mapCenter,zoom);
              

            } else { // Add the new state

                geoOverlays[layerName] = L.geoJson(topodata, {
                    style: styleShape, 
                    onEachFeature: onEachFeature
                }).addTo(map);

                map.setView(mapCenter,zoom);
            }
            
            console.log("zoom: " + zoom + " mapCenter: ");
            console.log(mapCenter);

            if (!map) {
              console.log("WARNING - map not available from _leaflet_map")
            }

            var baseLayers = {
              "Open Street Map": OpenStreetMap_BlackAndWhite,
              "Grayscale Mapbox": grayscale,
              "Streets Mapbox": streets,
              "Satellite Mapbox": satellite
            };
            
              //dataParameters.forEach(function(ele) {
                //geoOverlays[ele.name] = ele.group; // Allows for use of dp.name with removeLayer and addLayer
                //console.log("Layer added: " + ele.name);
              //})

              //if(layerControls[whichmap] === false) { // First time, add new layer
                // Add the layers control to the map
              //  layerControl_CountyMap = L.control.layers(baseLayers, geoOverlays).addTo(map);
              //}

              if (typeof layerControls != "undefined") {
                console.log("layerControls is available to map.");

                // layerControls object is declared in map.js. Contains element for each map.
                if (layerControls[whichmap] != undefined) {
                  if (geoOverlays[stateAbbr + " Counties"]) {
                    // Reached on county click, but shapes are not removed.
                    //console.log("geoOverlays: ");
                    //console.log(geoOverlays);
                    
                    //resetHighlight(layerControls[whichmap].);
                    // No effect
                    //layerControls[whichmap].removeLayer(geoOverlays["Counties"]);

                    //geojsonLayer.remove();

                    // Might work a little

                    //alert("Remove the prior topo layer")
                    //map.removeLayer(geojsonLayer); // Remove the prior topo layer
                  }
                }

                // layerControls wasn't yet available in loading sequence.
                // Could require localsite/js/map.js load first, but top maps might not always be loaded.
                // Or only declare layerControls object if not yet declared.
                //alert("map.length " + map.length);
                if (map.length) { // was just map until {} added
                  //alert("map " + map);
                    if (1==2 && layerControls[whichmap] == undefined) { //NEW MAP
                      //TESTING
                      //alert("NEW MAP " + whichmap)

                      //geoOverlays = {
                      //  [layerName]: geojsonLayer
                      //};
                      //geoOverlays[layerName] = geojsonLayer;


                      //layerControls[whichmap] = L.control.layers(basemaps1, geoOverlays).addTo(map); // Push multple layers
                      //basemaps1["Grey"].addTo(map);



                      // layerControls[whichmap]
                  
                      /*
                      // create the master layer group
                      var masterLayerGroup = L.layerGroup().addTo(map);

                      // create layer groups
                      var aLayerGroup = L.layerGroup([
                        // create a bunch of layers
                      ]);

                      masterLayerGroup.addLayer(aLayerGroup);
                      */

                    //} else if (!geoOverlays[layerName]) {
                    } else if (!map.hasLayer(geoOverlays[layerName])) { // LAYER NOT ADDED YET

                      alert("hasLayer false - LAYER NOT ADDED YET");
                      // Error: Cannot read property 'on' of undefined
                      //layerControls[whichmap].addOverlay(layerGroup, dp.dataTitle); // Appends to existing layers
                      //alert("Existing " + whichmap + " has no overlay for: " + layerName)

                      

                      //if(map.hasLayer(geojsonLayer)) {
                        //alert("HAS LAYER")
                        //map.removeLayer(geojsonLayer); // Remove the prior topo layer - BUGBUG this hid the new layer.
                        ////map.geojsonLayer.clearLayers();
                      //}

                      //geoOverlays[layerName] = geojsonLayer; // Add element to existing geoOverlays object.

                      //geoOverlays[layerName] = stateAbbr + " Counties";

                      // Add dup
                      //layerControls[whichmap].addOverlay(geojsonLayer, stateAbbr + " Counties");


                      //layerControls[whichmap].addLayer(stateAbbr + " Counties");
                      //layerControls[whichmap].addOverlay(geojsonLayer, geoOverlays);

                      //layerControls[whichmap].addOverlay(basemaps1, geoOverlays); // Appends to existing layers
                      //layerControls[whichmap] = L.control.layers(basemaps1, geoOverlays).addTo(map); 
                    } else {
                        //alert("DELETE ALL OF THIS PART layer already exists2: " + layerName);
                        //geoOverlays[layerName].remove(); // Also above
                      
                        //map.removeLayer(geoOverlays[layerName]);
                        //layerControls[whichmap].removeOverlay(geoOverlays[layerName]);

                        console.log("getgeoOverlays");
                        console.log(layerControls[whichmap].getgeoOverlays());
                        if (location.host.indexOf('localhost') >= 0) {
                            alert("Local only layerString");
                            let layerString = "";
                            Object.keys(layerControls[whichmap].getgeoOverlays()).forEach(key => {
                              layerString += key;
                              if (layerControls[whichmap].getgeoOverlays()[key]) {
                                layerString += " - selected";
                              }
                              layerString += "<br>";
                            });

                            // Show map layers, to use later
                            //$("#layerStringDiv").remove();
                            //$("#locationFilterHolder").prepend("<div id='layerStringDiv' style='width:220px'>" + layerString + "<hr></div>");
                          
                        }
                    }
                }
            } // end layerControls

            // To add additional layers:
            //layerControls.addOverlay(layerGroup, dp.name); // Appends to existing layers


            /* Rollover effect */
            function highlightFeature(e){
              var layer = e.target;
              
              // Adds 3px border
              // Add blue by increasing fillOpacity
              // Avoiding toggling fillOpacity. Using just border so choropleth opacity is not modified.
              layer.setStyle({
                weight: 3,
                color: '#665',
                dashArray: '',
                fillOpacityX: .7}
              )

              if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
              }
              
              // Send text to side box
              info.update(layer.feature.properties);

            }
            // Rollout map shape (county)
            function resetHighlight(e){
              // Bug - Unselects recent colors, 
              // colors would need to reside in 
              //geoOverlays[layerName].resetStyle(e.target);

              // Alternative to restoring color
              // Bug - This deselects color
              var layer = e.target;
              layer.setStyle({
                weight: 1,
                color: 'rgb(51, 136, 255)',
                fillOpacityX: 0.05}
              )

              info.update(); // Used with either approach above.
            }

            function resetHighlightX(e){
                // Restores color prior to rollover
                /*
                if (geoOverlays[layerName]) {
                  //console.log("Rollout resetHighlight e.target ");
                  //console.log(e.target);
                  geoOverlays[layerName].resetStyle(e.target);
                  info.update();
                } else {
                    console.log("Found NO layerName: " + layerName);
                }
                */
            }

            function newPrimaryState(stateList, stateAbbr) {
                // Split the string into an array
                let states = stateList.split(',');

                // Find the index of the stateAbbr in the array
                let index = states.indexOf(stateAbbr);

                // If stateAbbr is found, move it to the front
                if (index !== -1) {
                    states.splice(index, 1); // Remove the stateAbbr from its current position
                    states.unshift(stateAbbr); // Add it to the front
                }

                // Return the reorganized list as a string
                return states.join(',');
            }

            // CLICK SHAPE ON MAP
            function mapFeatureClick(e) {
              param = loadParams(location.search,location.hash); // param is declared in localsite.js
              var layer = e.target;

              //alert("mapFeatureClick")
              //map.fitBounds(e.target.getBounds()); // Zoom to boundary area clicked

              if (layer.feature.properties.COUNTYFP) { // From topo data, indicates a state
                //if (layer.feature.properties.CountyName) {
                consoleLog("Click state map");
                var fips = "US" + layer.feature.properties.STATEFP + layer.feature.properties.COUNTYFP;
                
                // Doesn't work for county click in state map
                //var fips = "US" + layer.feature.properties.State + layer.feature.properties.FIPS;
                
                //alert("mapFeatureClick fips: " + fips)
                //var fipsString = fips;
                if (param.geo && param.geo.split(",").includes(fips)) {
                  // Remove clicked fips from array, then convert back to string
                  param.geo = jQuery.grep(param.geo.split(","), function(value) {return value != fips;}).toString();
                  //fipsString = param.geo;
                } else if (param.geo && param.geo.split(",").length > 0) {
                  param.geo = param.geo + "," + fips;
                } else {
                  param.geo = fips;
                }

                let primaryState = getStateAbbreviation(layer.feature.properties.STATEFP);

                console.log("mapFeatureClick param.geo: " + param.geo + " state: " + primaryState);
                
                let stateList = newPrimaryState(hash.state, primaryState)
                goHash({'geo':param.geo, 'state':stateList});

              } else if (layer.feature.properties["Alpha-2"] && hash.geoview == "countries") {
                  let latestHash = getHash();
                  let countryCode = layer.feature.properties["Alpha-2"];
                  let countryList = latestHash.country ? latestHash.country.split(",").filter(Boolean) : [];
                  if (countryList.includes(countryCode)) {
                      countryList = countryList.filter(function(code){ return code !== countryCode; });
                  } else {
                      countryList.push(countryCode);
                  }
                  goHash({'country':countryList.join(",")});
              } else if (layer.feature.properties.name) { // Full state name
                  //alert("layer.feature.properties.name: " + layer.feature.properties.name);
                  let hash = getHash();
                  let theStateID = getIDfromStateName(layer.feature.properties.name);
                  consoleLog("Click state map theStateID " + theStateID);
                  //console.log("hash.state " + hash.state);
                  if (!theStateID && layer.feature.properties.name == "United States of America") {
                    console.log("Click  " + layer.feature.properties.name);
                    goHash({'geoview':'country','geo':'','regiontitle':''});
                  } else {

                      if (hash.state) {
                        if (hash.state.includes(theStateID)) {
                            //if (hash.state.includes(",")) { // Assuming user is removing state.
                            //    hash.state = hash.state.replace(/&/g, '%26');
                            //}
                            let hashStateArray = hash.state.split(",");

                            hashStateArray = hashStateArray.filter(function(item) {
                                return item !== theStateID
                            })

                            console.log(hashStateArray);
                            hash.state = hashStateArray.toString();
                            console.log("After hash.state " + hash.state);

                          // BUGBUG returned F,L from state=FL,GA
                          //hash.state = jQuery.grep(hash.state.split(",")[0].toUpperCase(), function(value) {
                          //  return value != theStateID;
                          //}).toString();
                        } else {
                          hash.state = theStateID + "," + hash.state;
                        }
                      } else {
                        hash.state = theStateID;
                      }
                      var currentGeoview = getHash().geoview;
                      var nextGeoview = (currentGeoview == "country") ? "country" : "state";
                      goHash({'state':hash.state,'geoview':nextGeoview});
                }
              }
            }
            // ROLLOVER SHAPE ON MAP
            function onEachFeature(feature, layer){
              layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight, 
                    click: mapFeatureClick
              })
            }

            var info = L.control();

            info.onAdd = function(map) {
              //alert("attempt")
              if ($(".info.leaflet-control").length) {
                $(".info.leaflet-control").remove(); // Prevent adding multiple times
              }
              this._div = L.DomUtil.create('div', 'info');
              this.update();
              return this._div;
            }

            info.update = function(props){

                if (props) {
                  $(".info.leaflet-control").show();
                } else {
                  $(".info.leaflet-control").hide();
                }
                // National
                // Hover over map
                //this._div.innerHTML = "<h4>Zip code</h4>" + (props ? props.zip + '<br>' + props.name + ' ' + props.state + '<br>' : "Select Locations")
                
                // CSS resides in map.css at .leaflet-top > .info

                // Occurs when rolling over, otherwise "props" is not available.
                if (props && props.COUNTYFP) {
                  // GEOID is the same as STATEFP + COUNTYFP (all in topo file)
                  this._div.innerHTML = "" 
                  + (props ? "<b>" + props.NAME + " County</b><br>" : "Select Locations") 
                  // + (props ? "FIPS " + props.GEOID : "")
                  
                    const localObjectArray = localObject.geo; // Pass the array directly
                    const idColumn = "id";
                    const idToSearch = 'US' + props.GEOID;
                    const columnToRetrieve = 'CO2';

                    const value = getValueByIdAndColumn(localObjectArray, idColumn, idToSearch, columnToRetrieve);
                    //value = Number(value) * 1000;
                    //alert(value); // Outputs: '60' (if columnToRetrieve is 'pop') or null if not

                    this._div.innerHTML = this._div.innerHTML + "CO<sub>2</sub> " + formatCell(value);

                } else { // US
                  this._div.innerHTML = "" 
                  + (props ? "<b>" + props.name + "</b><br>" : "Select Locations")

                  if (props) {
                      //console.log("props");
                      //console.log(props);

                      let localObjectArray = localObject["country-us"];
                      let idColumn = "StateName";
                      let idToSearch = props.name;
                      let columnToRetrieve = 'CO2';
                      //console.log("idToSearch " + idToSearch);
                      //console.log("localObject.country-us");
                      //console.log(localObject["country-us"]);
                      if (hash.geoview == "countries") {
                        localObjectArray = localObject["countries"];
                        idColumn = "CountryName";
                      }
                      const value = getValueByIdAndColumn(localObjectArray, idColumn, idToSearch, columnToRetrieve);                    
                      this._div.innerHTML = this._div.innerHTML + "CO<sub>2</sub> " + formatCell(value);
                  }
                }

                // To fix if using state - id is not defined
                // Also, other state files may need to have primary node renamed to "data"
                //this._div.innerHTML = "<h4>Zip code</h4>" + (1==1 ? id + '<br>' : "Hover over map")
            }
            if (map) {
              info.addTo(map);
            }
          }
        }); // end continueHandler
    }); // waitforElm # whichmap
    //}); // waitforVar
    });
  });
} 

function getValueByIdAndColumn(array, idColumn, id, column) {
    const row = array.find(obj => obj[idColumn] === id);
    return row ? row[column] : null; // Return the value of the specified column or null if not found
}



function updateGeoFilter(geo) {
  $(".geo").prop('checked', false);
  if (geo && geo.length > 0) {
    //locationFilterChange("counties");
    let sectors = geo.split(",");
      for(var i = 0 ; i < sectors.length ; i++) {
        $("#" + sectors[i]).prop('checked', true);
      }
    console.log('ALERT: Change to support multiple states as GEO. Current geo: ' + geo)
  }
  if (geo && geo.length > 4) // Then county or multiple states - Bug
  {
      $(".state-view").hide();
      $(".county-view").show();
      //$(".industry_filter_settings").show(); // temp
  } else {
      $(".county-view").hide();
      $(".state-view").show();
      //$(".industry_filter_settings").hide(); // temp
  }
}
function getStateNameFromID(stateID) {
  if (typeof stateID == "undefined" || stateID.length < 2) { return; }
  let stateName = ""; // Avoids error when made lowercase
  $("#state_select option").map(function(index) {
    if ($("#state_select option").get(index).value == stateID) {
      stateName = $("#state_select option").get(index).text;
    }
  });
  return(stateName);
}
function getIDfromStateName(stateName) {
  let theStateID;
  $("#state_select option").map(function(index) {
    if ($("#state_select option").get(index).text == stateName) {
      theStateID = $("#state_select option").get(index).value.toString();
    }
  });
  return(theStateID);
}
function zoomFromKm(kilometers_wide, theState) {
  //alert(kilometers_wide) // undefined for the 1st of 3.
  let zoom = 5;
  if (!kilometers_wide) return zoom;
  if (kilometers_wide > 1000000) { // Alaska
    zoom = 4
  } else if (kilometers_wide > 600000) { // Texas
    zoom = 5
  } else if (kilometers_wide > 105000) { // Hawaii and Idaho
    zoom = 6
  }
  if (theState == "AL" || theState == "AR" || theState == "GA" || theState == "CO" || theState == "IA") { // Zoom closer for some states
    zoom = zoom + 1;
  }
  if (theState == "HI" || theState == "IN") {
    zoom = zoom + 2;
  }
  if (theState == "DE" || theState == "RI" || theState == "MA") {
    zoom = zoom + 3;
  }
  return zoom;
}

function locationFilterChange(selectedValue,selectedGeo) {
    let hash = getHash();
    var useCookies = false; // Would need Cookies from explore repo.

    console.log("locationFilterChange: " + selectedValue + " " + selectedGeo);
    //$("#geoListHolder > div").hide();
    $(".geoListCounties").show();

    //showSearchFilter(); // Display filters

    //alert("reactivate these 2. " + selectedValue);
    // When to hide?
    //hideLocationFilters();
    //hideLocationsMenu();

    //$(".hideLocationsMenu").trigger("click");
    $('.countyTitleText').text(""); // Used by cities and counties
    removeCityFilter();
    $('.countyList').hide();

    
    $(".listHolder").hide();

    //hideCounties();
    $("#cityFields").hide();

    // Avoid always showing since some show values do not have searchable datasets, until we also search industries.
    //$(".keywordField").show(); // Since hidden by zip search

    //filterULSelect(selectedValue); // When from hash

    //$(".filterUL li").removeClass("selected");
        //$(this).addClass("selected");

        //$("#filterClickLocation .locationTabText").html($(this).text()).data('selected', $(this).data('id'));

    
    if (selectedValue == 'all' || selectedValue == 'state') { // its entire state
        // Reached by clicking "Entire State"
        if(useCookies) {
            //Cookies.set('searchParams', { 'useCurrent': null, 'locationDD': 'all' });
            Cookies.set('searchParams', { 'useCurrent': null, 'locationDD': 'all' });
        }
        //activateEntireState();
        $("#zip").val('');
        //$('.goSearch').trigger("click");
    }
    /*
    if (selectedValue == 'country') {
        $(".stateFilters").hide();
    } else {
        if (hash.state || hash.geo) {
            ///$("#geoPicker").show();
        }
        $(".stateFilters").show();
    }
    */
    if (selectedValue == 'nearby') { // My current location, set cookie useCurrent=1
        $("#distanceField").show();
        activateMyLocation(true);
        if(useCookies) {
            Cookies.set('searchParams', { 'useCurrent': '1', 'centerlat': $(".mylat").val(), 'centerlon': $(".mylon").val(), 'locationDD': selectedValue });
        }
        //geoSelected();
    }

    if (selectedValue == 'latlon') { // Other location, set cookie useCurrent=0
        $("#coordFields").show();
        $("#distanceField").show();
        //$('#latLonFields').show();
        if(useCookies) {
            Cookies.set('searchParams', { 'useCurrent': '0', 'centerlat': $("#lat").val(), 'centerlon': $("#lon").val(), 'locationDD': selectedValue });
        }
        //geoSelected();
    }

    if (selectedValue == 'zip') {
        $("#coordFields").hide();
        $("#distanceField").hide();
        $("#distanceField").show();
        $("#zipFields").show();
        $("#zip").focus();

        if(useCookies) {
            var cookieParam = Cookies.set('searchParams');
            if (typeof (cookieParam) != 'undefined' && typeof (cookieParam.zip) != 'undefined') {
                $("#zip").val(cookieParam.zip);
            }
            Cookies.set('searchParams', { 'useCurrent': '0', 'centerlat': $("#lat").val(), 'centerlon': $("#lon").val(), 'locationDD': 'zip' });
        }
    }
    if (selectedValue == 'city') {
        $("#distanceField").show();
        $("#cityFields").show();
        //$('.currentCities').show();
        //$(".detailsPanel").hide();
        //$(".listPanelInner").hide();
        //$(".listPanelSideBkgd").hide(); // Alphabet
        $(".cityList").show();
        $(".listPanelRows").show();
        
        populateCityList(function(results) { // Returns asynchronous results. Waits for city cvs to load.
            if (results) {
                // Reached when changing location dropdown, if cityList not yet loaded.
            }
            else {
                consoleLog('No cities results found');
            }
        });

        $(".listHolder").show();

        if(useCookies) {
            //var cookieParam = Cookies.set('searchParams');
            var cookieParam = Cookies.get('searchParams');
            if (cookieParam && typeof (cookieParam.city) != 'undefined') {
                consoleLog(cookieParam.city);
                $("#cities").val(cookieParam.city.split(','))
            }
            //alert("City lat: " + $("#lat").val());
            //Cookies.set('searchParams', { 'useCurrent': '0', 'centerlat': $("#lat").val(), 'centerlon': $("#lon").val(), 'locationDD': 'city' });
           Cookies.set('searchParams', { 'useCurrent': '0', 'centerlat': $("#lat").val(), 'centerlon': $("#lon").val(), 'locationDD': 'city' });
        }
    }
}
/*
function locClick(which) {
    let geo = $('.geo:checked').map(function() {return this.id;}).get().join(',');
    $(".regiontitle").text(""); //Clear
    let regiontitle = ""; // Remove from hash. Later associate existing regions.
    goHash({"geo":geo,"regiontitle":regiontitle});
}
*/
// Data as values, not objects.
//let geoCountyTable = []; // Array of arrays


function loadStateCounties(attempts) { // To avoid broken tiles, this won't be executed if the #geomap div is not visible.
    consoleLog("loadStateCounties " + attempts);
    loadScript(theroot + 'js/d3.v5.min.js', function(results) {
        if (typeof d3 !== 'undefined') {

            // Switching to: http://tabulator.info/examples/5.0
            let element = {};
            element.scope = "geo";

            let hash = getHash();
            let theState = param.state; // From navigation.js
            let theStateSelect = $("#state_select").find(":selected").val();
            if (theStateSelect) {
                theState = theStateSelect;
            }
            if (hash.state) {
                theState = hash.state.split(",")[0].toUpperCase();
            }
            if (theState && theState.length > 2) {
                theState = theState.substring(0,2);
            }
            if ($(".output_table > table").length) {
                if (theState == priorHash.state || (theState == "GA" && !priorHash.state)) {
                    console.log("cancel loadStateCounties: " + theState + " prior: " + priorHash.state);
                    return; // Avoid reloading
                }
                $(".output_table").html(""); // Clear prior state
            }

            
            //Load in contents of CSV file for Tabulator (separate from map county shapes)
            if (theState && theState.length == 2) {
                consoleLog("loadStateCounties tabulator for state: " + theState);

                // This was the source of COUNTYFP
                //let csvFilePath = local_app.community_data_root() + "us/state/" + theState + "/" + theState + "counties.csv";
                
                // All states in one file
                let csvFilePath = "/localsite/info/data/map-filters/us-counties-full.csv";
                if (hash.geoview == "zip") {
                    csvFilePath = local_app.community_data_root() + "us/zipcodes/zipcodes6.csv";
                } else if (hash.show == "cameraready" && hash.state == "GA") {
                    csvFilePath = "/localsite/info/data/map-filters/state-county-sections-ga.csv";
                }
                //alert("csvFilePath " + csvFilePath)
                let allowedStates = [];
                if (hash.state) {
                    allowedStates = hash.state.split(",").map(function(state){
                        return state.trim().toUpperCase();
                    }).filter(Boolean);
                } else if (theState) {
                    allowedStates = [theState.toUpperCase()];
                }
                let missingStates = allowedStates.filter(function(stateAbbr){
                    const stateID = localObject.us_stateIDs[stateAbbr];
                    if (!stateID) {
                        return false;
                    }
                    const stateGeo = "US" + ('0' + stateID).slice(-2);
                    return localObject.stateCountiesLoaded.indexOf(stateGeo) === -1;
                });
                d3.csv(csvFilePath).then(function(myData,error) {
                //d3.csv(csvFilePath, function(myData) {
                //d3.csv(csvFilePath).then(function(error,myData) {

                    if (error) { // Wasn't reached. Will delete this. Now reaches error message at bottom of ds.csv function instead.
                        //alert("error")
                        if (location.host.indexOf('localhost') >= 0) {
                            alert("Error loading file. " + error);
                        } else {
                           console.log("Error loading file. " + error);
                        }
                    }

                    if (hash.geoview == "zip") {

                    } else { // Counties
                        if (missingStates.length > 0) {
                            //alert($("#county-table").length());
                            // No effect
                            //$("#county-table").empty(); // Clear previous state. geo is retained in URL hash.
                            //$("#county-table").text("")
                            //alert($("#county-table").length());

                            // Add a new variable, to make it easier to do a color scale.
                            // Alternately, you could extract these values with a map function.
                            let allDifferences = [];

                            // geo is country, state/province, county

                            let statesLoadedThisPass = new Set();

                            //alert("theStateGeo: " + theStateGeo + " theState: " + theState);
                            //console.log("myData");
                            //console.log(myData);

                            // myData contains counties for all states/territories
                            myData.forEach(function(d, i) {

                                d.difference =  d.US_2007_Demand_$;

                                // OBJECTID,STATEFP10,COUNTYFP10,GEOID10,NAME10,NAMELSAD10,totalpop18,Reg_Comm,Acres,sq_miles,Label,lat,lon
                                //d.name = ;
                                d.idname = "US" + d.GEOID + "-" + d.NAME + " County, " + theState;

                                //d.perMile = Math.round(d.totalpop18 / d.sq_miles).toLocaleString(); // Breaks sort
                                d.perMile = Math.round(d.totalpop18 / d.sq_miles);

                                //console.log("d.sq_miles " + d.sq_miles);

                                //d.sq_miles = Number(Math.round(d.sq_miles).toLocaleString());

                                d.sq_miles = Math.round(d.sq_miles).toLocaleString();

                                // Add an array to the empty array with the values of each:
                                // d.difference, 
                                // , d.sq_miles
                                //geoCountyTable.push([d.idname, d.totalpop18, d.perMile]);

                                const stateAbbr = (d.State || "").toUpperCase();
                                if (missingStates.length && !missingStates.includes(stateAbbr)) {
                                    return;
                                }
                                const stateID = localObject.us_stateIDs[stateAbbr];
                                if (!stateID) {
                                    return;
                                }
                                const stateGeo = "US" + ('0' + stateID).slice(-2);
                                // Save to localObject so counties in multiple states can be selected
                                if (localObject.stateCountiesLoaded.indexOf(stateGeo)==-1) { // Just add first time

                                    //BUGBUG - Also need to check that state was not already added.
                                    let geoElement = {};

                                    //geoElement.id = "US" + d.GEOID;

                                    if (d.FIPS.length == 4) {
                                        geoElement.id = "US0" + d.FIPS;
                                    } else {
                                        geoElement.id = "US" + d.FIPS;
                                    }
                                    geoElement.name = d.CountyName + " County, " + d.State;
                                    geoElement.pop = d.Population;
                                    geoElement.CO2 = d.CO2;
                                    if (d.CO2 && d.Population) {
                                        geoElement.co2percap = d.CO2/d.Population;
                                    }
                                    geoElement.methane = d.Methane;
                                    if (d.Methane && d.Population) {
                                        geoElement.methanepercap = d.Methane/d.Population;
                                    }
                                    geoElement.sqmiles = d.SqMiles;
                                    
                                    geoElement.county = d.NAME;
                                    geoElement.state = d.State;

                                    //geoElement.sqmiles = d.sq_miles;
                                    //geoElement.pop = d.totalpop18;
                                    //geoElement.permile = d.perMile;
                                    
                                    // For each county
                                    console.log("geoElement for each county selected. " + geoElement.state);
                                    console.log(geoElement);
                                    localObject.geo.push(geoElement); 
                                    statesLoadedThisPass.add(stateGeo);
                                 }

                                // this is just a convenience, another way would be to use a function to get the values in the d3 scale.
                                //alert("d.perMile " + d.perMile)

                                // Not working
                                //allDifferences.push(d.difference);
                                //allDifferences.push(d.perMile + 0);
                                allDifferences.push(d.perMile);
                            });

                            // Track the states that have been added to localObject.geo
                            statesLoadedThisPass.forEach(function(stateGeo){
                                if (localObject.stateCountiesLoaded.indexOf(stateGeo)==-1) {
                                    localObject.stateCountiesLoaded.push(stateGeo);
                                }
                            });
                            //console.log("geoCountyTable");
                            //console.log(geoCountyTable);
                        }
                    }
                    consoleLog(myData.length + " counties loaded.");
                    //console.log(myData);

                    //alert("showTabulatorList 1 loadStateCounties element.scope: " + element.scope + " (geo is counties)")
                    showTabulatorList(element);
                    $(".geoListCounties").show();
                }, function(error, rows) {
                    console.log("ERROR fetching csv file for TabulatorList (counties or zip). " + error);
                    $(".geoListCounties").hide();
                    //console.log(error);
                });
            }
        } else {
            attempts = attempts + 1;
              if (attempts < 500) {
                setTimeout( function() {
                  loadStateCounties(attempts);
                }, 20 );
              } else {
                console.log("ALERT: D3 javascript not available for loadStateCounties csv.");
              }
        }
    });
}

function makeRowValuesNumeric(_data, columnsNum, valueCol) {
  console.log("makeRowValuesNumeric");
  console.log(_data);
  
  // 'for of' loop is more efficient than forEach. 
  // Also works on objects. You can call it like this 'for let d of Object.entries(data){ }'

  // Might not need this, try removing
  if (typeof columnsNum !== "undefined") {
    _data.forEach( function (row) {
      //row = removeWhiteSpaces(row);
      convertToNumber(row, columnsNum);
    });
  }

  //console.log(_data); // Careful, this can overwhelm browser
  return _data;
}
function loadObjectData(element, attempts) {
    // We'll elminate this. Calling showTabulatorList directly instead. 
    // Need to update for US (country) when adding per capita columns.

    // Calls showTabulatorList - retains prior location data loads in localObject(element.scope)
    if (typeof d3 !== 'undefined') {
        //alert("loadObjectData element.scope: " + element.scope)
        if(typeof localObject[element.scope] == 'undefined') {
            // Holds countries, states, counties (geo)
            localObject[element.scope] = {}; 
        }

        // Only fetch from a file when page is loaded, otherwise recall from localObject.
        if (Object.keys(localObject[element.scope]).length <= 0) { // state, country (us), countries
            //alert("element.scope " + element.scope + " does not exist yet.");
            if (element.datasource.toLowerCase().endsWith(".csv")) {
                d3.csv(element.datasource).then(function(data) { // One row per line
                    if (element.key) {
                        data.forEach(function(d, i) {
                          // TO DO - might remove the key from the data
                          localObject[element.scope][d[element.key]] = data[i];
                        });
                    } else {
                        localObject[element.scope] = makeRowValuesNumeric(data, element.numColumns, element.valueColumn);
                    }
                    //alert("showTabulatorList from initial load off loadObjectData element.scope: " + element.scope)
                    console.log("initial loadObjectData for element.scope: " + element.scope)
                    showTabulatorList(element);
                })
            } else {
                d3.json(element.datasource).then(function(json,error) {

                    stateImpact = $.extend(true, [], json); // Clone/copy object without entanglement

                      /*
                      if (Array.isArray(json)) { // Other than DifBot - NASA when count included
                        for (a in json) {
                          fullHtml += "<div class='level1'><b>Product ID:</b> " + json[a].id + "</div>\n";
                          for (b in json[a]) {
                            fullHtml += formatRow(b,json[a][b],1); // Resides in localsite.js
                          }
                        }
                      } else {
                        alert("not array")
                        if (!json.data) {
                          //json.data = json; // For NASA
                        }
                      }
                      alert(fullHtml);
                      */

                      if (error) throw error;
                      //console.log("stateImpact");
                      //return(stateImpact);
                      
                      /*
                      let rowcount = 0;
                      //stateImpactArray = [];
                      $.each(stateImpact, function(key,val) {             
                          //alert(key+val);
                          if (val["jurisdiction"]) {
                            //stateImpactArray.push(val)

                            localObject.state.push(val)
                            rowcount++;
                          }
                      });
                      console.log("Loaded set of states. rowcount: " + rowcount)
                      */

                        // To Do: Remove from json:
                        // jurisdiction: "Alabama"

                        localObject[element.scope] = $.extend(true, [], json); // Clone/copy object without entanglement
                        console.log("localObject.state")
                        //console.log(localObject[element.scope])
                        console.log(localObject.state)
                        //alert("showTabulatorList 3")
                        showTabulatorList(element);
                });
            }

        } else { // Already loaded, reuse
            console.log("Reuse localObject element.scope: " + element.scope);
            //alert("showTabulatorList - From existing Object element.scope " + element.scope)
            showTabulatorList(element);
        }

    } else {
        loadScript(theroot + 'js/d3.v5.min.js', function(results) {
        });
        attempts = attempts + 1;
          if (attempts < 200) {
            setTimeout( function() {
              loadObjectData(element, attempts);
            }, 100 );
          } else {
            alert("D3 javascript not available for loadObjectData csv.")
          }
    }
}

var statetable = {};
var geotable = {};
var geotableLastSorters = [];
var mapColorLastSorters = [];
var geotableIsBuilt = false;
var showAlerts = false;
var geotableClickHandlerBound = false;
var geotableVisibilityForced = false;
var geotableInitState = "";
var geotableInitInProgress = false;
var geotablePendingSelection = null;
var geotablePendingDeselect = null;
var geotablePendingListener = false;

function testAlert(message) {
    if (showAlerts) {
        alert(message);
    }
}

function getGeoTableInstance() {
    if (geotable && typeof geotable.getRows === "function") {
        return geotable;
    }
    if (typeof Tabulator !== "undefined" && typeof Tabulator.findTable === "function") {
        const tables = Tabulator.findTable("#tabulator-geotable");
        if (tables && tables.length) {
            return tables[0];
        }
    }
    return null;
}
function getStateTableInstance() {
    if (statetable && typeof statetable.getRows === "function") {
        return statetable;
    }
    if (typeof Tabulator !== "undefined" && typeof Tabulator.findTable === "function") {
        const tables = Tabulator.findTable("#tabulator-statetable");
        if (tables && tables.length) {
            return tables[0];
        }
    }
    return null;
}
var currentRowIDs = [];
var currentCountryIDs = [];
var programmaticSelection = false; // Flag to prevent goHash() during programmatic selections

function showTabulatorList(element) {
    // currentRowIDs and currentCountryIDs are now global variables
    console.log("showTabulatorList scope: " + element.scope + ". Length: " + Object.keys(element).length);
    let hash = getHash();
    let theState = "";
    if (hash.state) {
        // apps/ev has the state hardcoded
        theState = hash.state.split(",")[0].toUpperCase();
    }
    if (element.state) {
        theState = element.state;
    }
    
    if(typeof param=='undefined'){ var param={}; } // In case navigation.js included before localsite.js
    loadTabulator().then(function() {
    if (typeof Tabulator !== 'undefined') {
        // Convert key-value object to a flat array (like a spreadsheet)
        let dataForTabulator = [];
        $.each(localObject[element.scope] , function(key,val) { // val is an object

          if (1==2 && element.scope == "state") {
            // Not used for states (country) now that json replaced with csv file.
            // Saving in case we have another json ke-value data source later.
            if (val["jurisdiction"]) { // 3 in the state json file don't have a jurisdiction value.
                dataForTabulator.push(val);
            } else {
                console.log("No jurisdiction value " + val["name"]);
            }
          } else { // countries
            dataForTabulator.push(val);
          }
          //console.log("Scope in Tabulator " + element.scope);
        });

        console.log("dataForTabulator: ");
        console.log(dataForTabulator);

        // For fixed header, also allows only visible rows to be loaded. See "Row Display Test" below.
        // maxHeight:"100%",

        // COUNTRY - LIST OF STATES
        // COUNTRIES - MAP OF WORLD

        
        // Both states and country
        if (hash.geoview == "country" || (!theState && onlineApp )) {
            consoleLog("LOAD TABULATOR (country)");

            waitForElm('#tabulator-statetable').then((elm) => {
                $("#tabulator-geotable").hide();
                $("#tabulator-statetable").show();

                // Remove rows with blank population
                dataForTabulator = dataForTabulator
                  .filter(item => item.Population !== "" && item.Population !== null && item.Population !== undefined) 
                ;
                console.log("dataForTabulator");
                console.log(dataForTabulator);

                // Wait for the container to have layout dimensions before creating Tabulator
                waitForLayout(elm).then(function() {
                    const statetableIndex = (hash.geoview == "countries") ? "Country" : "State";
                    statetable = new Tabulator("#tabulator-statetable", {
                        data:dataForTabulator,    //load row data from array of objects
                        layout:"fitColumns",      //fit columns to width of table
                        responsiveLayout:"hide",  //hide columns that dont fit on the table
                        tooltips:true,            //show tool tips on cells
                        addRowPos:"top",          //when adding a new row, add it to the top of the table
                        history:true,             //allow undo and redo actions on the table
                        movableColumns:true,      //allow column order to be changed
                        resizableRows:true,       //allow row order to be changed
                        maxHeight:"520px",        // For frozenRows
                        paginationSize:10000,
                        index:statetableIndex,
                        columns:element.columns,
                        selectable:true,
                        autoResize:false,         //disable auto resize to prevent infinite loop
                    });

                    // Manually redraw statetable after build since autoResize is disabled
                    statetable.on("tableBuilt", function() {
                        statetable.redraw(true); // Force full redraw
                    });

                    // TO DO: 2-char state needs to be added
                    if(hash.state) {
                        let currentStateIDs = hash.state.split(',');
                        statetable.on("tableBuilt", function() {
                            //alert("currentStateIDs " + currentStateIDs)
                            programmaticSelection = true;
                            statetable.selectRow(currentStateIDs);
                            programmaticSelection = false;
                        });
                    }
                    if (hash.country && hash.geoview == "countries") {
                        let currentCountryIDs = hash.country.split(',');
                        statetable.on("tableBuilt", function() {
                            programmaticSelection = true;
                            statetable.selectRow(currentCountryIDs);
                            programmaticSelection = false;
                        });
                    }

                    // Called for every box check when loading tabulator.
                    statetable.on("rowSelected", function(row) {
                        const rowData = row.getData();
                        const stateId = rowData.id || rowData.State || rowData.state;
                        console.log("statetable rowSelected " + stateId + " (programmatic: " + programmaticSelection + ")");
                        testAlert("statetable rowSelected " + stateId);
                        if (!programmaticSelection && hash.geoview == "country" && stateId && stateId.length === 2) {
                            let stateList = hash.state ? hash.state.split(",").filter(Boolean) : [];
                            if (!stateList.includes(stateId)) {
                                stateList.push(stateId);
                            }
                            goHash({'state':stateList.join(",")});
                            return;
                        }

                        //alert("statetable rowSelected " + row._row.data.id);
                        // Important: The incoming 2-char state is a column called "id"
                        if (stateId && !currentRowIDs.includes(stateId)) {
                            currentRowIDs.push(stateId);
                        }
                        //if(hash.geo) {
                            //hash.geo = hash.geo + "," + currentRowIDs.toString();
                        //  hash.geo = hash.geo + "," + row._row.data.id;
                        //} else {
                        
                        // Only trigger goHash if this is a user-initiated selection, not programmatic
                        if (!programmaticSelection) {
                            const latestHash = getHash();
                            if (!latestHash.geoview || latestHash.geoview == "state") { // Clicking on counties for a state
                                if (hash.geo != currentRowIDs.toString()) {
                                    hash.geo = currentRowIDs.toString();
                                    console.log("Got hash.geo " + hash.geo);
                                    goHash({'geo':hash.geo}); // Update URL hash with selected counties
                                }
                            } else if (latestHash.geoview == "countries") {
                                //alert("row._row.data.id " + row._row.data["Country Code"])
                                //let countryCode = convertCountry3to2char(row._row.data["Country Code"]);
                                
                                let countryCode = row._row.data["Country"];
                                if (countryCode) {
                                    let countryList = latestHash.country ? latestHash.country.split(",").filter(Boolean) : [];
                                    if (!countryList.includes(countryCode)) {
                                        countryList.push(countryCode);
                                    }
                                    goHash({'country':countryList.join(",")});
                                }
                            }
                        }
                        
                        // Only trigger these goHash calls if user-initiated
                        if (!programmaticSelection) {
                            if (row._row.data["CountryName"] == "United States") {
                                goHash({'geoview':'country'});
                            } else if(row._row.data.id) {
                                if (hash.state) {
                                    // Prepend new state to existing hash.state.
                                    let statesArray = hash.state.split(',');
                                    if ($.inArray(row._row.data.id, statesArray) === -1) {
                                        //if (hash.state) {
                                            hash.state = row._row.data.id + ',' + hash.state;
                                        //} else {
                                        //    hash.state = row._row.data.id;
                                        //}
                                    }
                                } else {
                                    hash.state = row._row.data.id;
                                }
                                //goHash({'state':hash.state});

                                consoleLog("ALERT state checked - called for everybox checked")
                                // Don't clear naics parameter - preserve it for industry detail pages
                                //delete hiddenhash.naics;
                                goHash({'state':hash.state}); // Preserve other hash parameters like naics

                            } else if(!hash.geo && row._row.data.StateName) { // Or StateName?
                                if(row._row.data.statename == "Georgia") { // From state checkboxes
                                    // Temp, later we'll pull from data file or dropdown.
                                    row._row.data.state = "GA";
                                }
                                if (!row._row.data.state) {
                                    // TO DO: Get the 2-char abbrev here from the row._row.data.jurisdiction (statename). Better would be to update the source data to include 2-char state.
                                }
                                if (!row._row.data.state) {
                                    console.log('%cTO DO: add state abbreviation to data file. ', 'color: green; background: yellow; font-size: 14px');
                                    // This prevents backing up.
                                    goHash({'geoview':'state','geo':'','statename':row._row.data.jurisdiction});
                                } else {
                                    console.log('%cTO DO: add support for multiple states. ', 'color: green; background: yellow; font-size: 14px');
                                    goHash({'geoview':'state','geo':'','statename':'','state':row._row.data.state});
                                }
                            } else {
                                //console.log("ALERT: filteredArray wasn't available here.")
                                let filteredArray = currentRowIDs.filter(item => item !== row._row.data.id);
                                goHash({'state':filteredArray.toString()});
                                return;
                            }
                        }
                    })
                    statetable.on("rowDeselected", function(row) {
                        const rowData = row.getData();
                        const stateId = rowData.id || rowData.State || rowData.state;
                        console.log("statetable rowDeselected " + stateId + " (programmatic: " + programmaticSelection + ")");
                        testAlert("statetable rowDeselected " + stateId);
                        if (!programmaticSelection && hash.geoview == "country" && stateId && stateId.length === 2) {
                            let stateList = hash.state ? hash.state.split(",").filter(Boolean) : [];
                            stateList = stateList.filter(function(stateAbbr){ return stateAbbr !== stateId; });
                            goHash({'state':stateList.join(",")});
                            return;
                        }
                        
                        // Only trigger goHash if this is a user-initiated deselection, not programmatic
                        if (!programmaticSelection) {
                            const latestHash = getHash();
                            let countryCode = row._row.data["Country"];
                            if (latestHash.geoview == "countries") {
                                let countryList = latestHash.country ? latestHash.country.split(",").filter(Boolean) : [];
                                countryList = countryList.filter(function(code){ return code !== countryCode; });
                                goHash({'country':countryList.join(",")});
                                return;
                            }

                            let filteredArray = currentRowIDs.filter(item => item !== row._row.data.id);
                            if (hash.state != filteredArray.toString()) {
                                //hash.geo = filteredArray.toString();
                                goHash({'state':filteredArray.toString()});
                                return;
                            }
                        }
                    })
                    statetable.on("dataSorted", function(sorters, rows){
                        //sorters - array of the sorters currently applied
                        //rows - array of row components in their new order
                        const currentSorters = Array.isArray(sorters) ? sorters : [];
                        mapColorLastSorters = currentSorters;
                        const isCO2Sort = currentSorters.some(function(sorter){
                            return sorter && (sorter.field === "CO2" || sorter.field === "co2percap");
                        });
                        if (isCO2Sort) {
                            updateMapColors("geomap");
                        } else {
                            refreshSelectedGeoStyles("geomap");
                        }
                    });
                    function checkStateTableCheckbox(row, check) {
                        if (typeof row.getCell !== "function") {
                            console.warn("Invalid row object passed:", row);
                            return;
                        }

                        const cell = row.getCell(0);
                        if (!cell) {
                            console.warn("Cell not found in the first column of the row:", row);
                            return;
                        }

                        const cellElement = cell.getElement();
                        const checkbox = cellElement.querySelector("input[type='checkbox']");
                        if (checkbox) {
                            checkbox.checked = check;
                        }
                    }
                    statetable.on("rowClick", function(e, row) {
                        const hash = getHash();
                        if (hash.geoview == "countries") {
                            if (e.target.type === 'checkbox') {
                                e.stopPropagation();
                                return;
                            }
                            row.toggleSelect();
                            checkStateTableCheckbox(row, row.isSelected());
                            return;
                        }
                        const rowData = row.getData();
                        const stateId = rowData.id || rowData.State || rowData.state;
                        testAlert("statetable row clicked " + stateId);
                        if (stateId && stateId.length === 2) {
                            let stateList = hash.state ? hash.state.split(",").filter(Boolean) : [];
                            if (stateList.includes(stateId)) {
                                stateList = stateList.filter(function(stateAbbr){ return stateAbbr !== stateId; });
                            } else {
                                stateList.push(stateId);
                            }
                            goHash({'state':stateList.join(",")});
                        }
                    });
                    if (hash.geoview != "countries") {
                        // Not working yet
                        if(hash.state) {
                            let currentStates = hash.state.split(',');
                            statetable.on("tableBuilt", function() {
                                //alert("try it")
                                programmaticSelection = true;
                                statetable.selectRow(currentStates); // Uses "id" incoming rowData
                                programmaticSelection = false;
                            });
                        }
                    }
                }); // End waitForLayout
            }); // End wait for element #tabulator-statetable

        } else if (theState) { // EACH STATE'S COUNTIES

            consoleLog("LOAD TABULATOR (state counties) " + theState);

            waitForElm('#tabulator-geotable').then((elm) => {
                console.log("#tabulator-geotable available. State: " + hash.state + " element.scope: " + element.scope);
                const stateKey = theState.toUpperCase();
                if (geotableInitInProgress && geotableInitState === stateKey) {
                    return;
                }
                if (geotableIsBuilt && geotableInitState === stateKey) {
                    return;
                }
                geotableInitInProgress = true;
                geotableInitState = stateKey;

                $("#tabulator-statetable").hide();
                $("#tabulator-geotable").show();

                // Wait for the container to have layout dimensions before creating Tabulator
                waitForLayout(elm).then(function() {

                // Prevented up-down scrolling:
                // maxHeight:"100%",

                // More filter samples
                // https://stackoverflow.com/questions/2722159/how-to-filter-object-array-based-on-attributes

                var columnArray;
                var rowData;
                // omitting titleFormatter:"rowSelection" in both of the following because browser gets overwhelmed.
                if (hash.geoview == "zip") {
                    columnArray = [
                        {formatter:"rowSelection", hozAlign:"center", headerHozAlign:"center", width:10, headerSort:false,
                            cellClick:function(e, cell){
                                testAlert("checkbox clicked");
                                e.stopPropagation();
                            }
                        },
                        {title:"ZIPCODE", field:"name"}
                    ];
                } else { // Counties
                    rowData = localObject.geo.filter(function(el){return el.state == theState.split(",")[0].toUpperCase();}); // load row data from array of objects
                    columnArray = [
                        {formatter:"rowSelection", hozAlign:"center", headerHozAlign:"center", width:10, headerSort:false,
                            cellClick:function(e, cell){
                                testAlert("checkbox clicked");
                                e.stopPropagation();
                            }
                        },
                        // See geoElement.pop etc above
                        {title:"County", field:"name", minWidth:140},
                        {title:"Pop", field:"pop", minWidth:50, hozAlign:"right", headerHozAlign: "right", headerSortStartingDir:"desc", sorter:"number", formatter:"money", formatterParams:{precision:false},formatter: function(cell, 
                        formatterParams) {
                            let value = formatCell(cell.getValue());
                            return value;
                        }},
                        {title:"CO<sub>2</sub>", field:"CO2", minWidth:80, hozAlign:"right", headerHozAlign: "right", sorter:"number", formatter: function(cell, formatterParams) {
                            if (cell.getValue() === '') {return}
                            let value = formatCell(cell.getValue());
                            return value;
                        }},
                        {title:"Per Person", field:"co2percap", minWidth:70, hozAlign:"right", headerHozAlign: "right", sorter:"number", formatter: function(cell, formatterParams) {
                            const rawValue = Number(cell.getValue());
                            if (isNaN(rawValue)) {return}
                            let value = rawValue.toFixed(2);
                            return value + " tons";
                        }},
                        {title:"Methane", field:"methane", minWidth:90, hozAlign:"right", headerHozAlign: "right", sorter:"number", formatter: function(cell, formatterParams) {
                            if (cell.getValue() === '') {return}
                            let value = formatCell(cell.getValue());
                            return value;
                        }},
                        {title:"Per Capita", field:"methanepercap", minWidth:90, hozAlign:"right", headerHozAlign: "right", sorter:"number", formatter: function(cell, formatterParams) {
                            const rawValue = Number(cell.getValue());
                            if (isNaN(rawValue)) {return}
                            return rawValue.toFixed(2);
                        }},
                        {title:"Sq Miles", field:"sqmiles", minWidth:90, hozAlign:"right", headerHozAlign: "right", sorter:"number", formatter: function(cell, formatterParams) {
                            let value = formatCell(cell.getValue());
                            return value;
                        }},
                    ];
                }
                currentRowIDs = [];
                if(hash.geo) {
                    currentRowIDs = hash.geo.split(',');
                }

                // Confirms rowData is available.
                console.log("showTabulatorList rowData: ");
                //alert(JSON.stringify(rowData, null, 2));
                console.log(rowData);
                if (location.host.indexOf('localhost') >= 0 && (!rowData || rowData.length === 0)) {
                    testAlert("geotable rowData is empty for state: " + theState);
                }

                // TO DO: Avoid this line to select counties throughout country.
                // Reduce to the current state
                rowData = rowData.filter(item => item.state === theState);
                //const rowData2 = rowData.filter(item => item.state.trim().toUpperCase() === "GA");
                //alert(JSON.stringify(rowData2, null, 2));

                geotableIsBuilt = false;
                const geotableInstance = new Tabulator("#tabulator-geotable", {
                    data:rowData,
                    layout:"fitColumns",      //fit columns to width of table
                    responsiveLayout:"hide",  //hide columns that dont fit on the table
                    //tooltips:true,          //show tool tips on cells
                    addRowPos:"top",          //when adding a new row, add it to the top of the table
                    history:true,             //allow undo and redo actions on the table
                    movableColumns:true,      //allow column order to be changed
                    resizableRows:true,       //allow row order to be changed
                    initialSort:[             //set the initial sort order of the data - NOT WORKING
                        {column:"pop", dir:"desc"},
                    ],
                    maxHeight:"500px", // For frozenRows
                    paginationSize:10000,
                    columns:columnArray,
                    selectable:true,
                    movableRows:true,
                    autoResize:false,         //disable auto resize to prevent infinite loop
                });
                geotable = geotableInstance;

                geotableInstance.on("dataSorted", function(sorters, rows){
                    geotableLastSorters = Array.isArray(sorters) ? sorters : [];
                    mapColorLastSorters = geotableLastSorters;
                    testAlert("columns sorted");
                    //sorters - array of the sorters currently applied
                    //rows - array of row components in their new order
                    const isCO2Sort = geotableLastSorters.some(function(sorter){
                        return sorter && (sorter.field === "CO2" || sorter.field === "co2percap");
                    });
                    if (isCO2Sort) {
                        updateMapColors("geomap");
                    } else {
                        refreshSelectedGeoStyles("geomap");
                    }
                });

                /*
                geotable.on("rowSelected", function(row){
                    console.log("rowSelected " + row._row.data.id);
                    if (!currentRowIDs.includes(row._row.data.id)) {
                     currentRowIDs.push(row._row.data.id);
                    }
                    //if(hash.geo) {
                        //hash.geo = hash.geo + "," + currentRowIDs.toString();
                    //  hash.geo = hash.geo + "," + row._row.data.id;
                    //} else {
                    if (hash.geo != currentRowIDs.toString()) {
                        hash.geo = currentRowIDs.toString();
                        console.log("goHash rowSelected")
                        goHash({'geo':hash.geo});
                    }
                })
                geotable.on("rowDeselected", function(row){
                    currentRowIDs = currentRowIDs.filter(item => item !== row._row.data.id);
                    if (hash.geo != currentRowIDs.toString()) {
                        hash.geo = currentRowIDs.toString();
                        console.log("rowDeselected hash.geo " + hash.geo);
                        goHash({'geo':hash.geo});
                    }
                })
                */

                function checkFirstColumnCheckbox(row, check) {
                    if (typeof row.getCell !== "function") {
                        console.warn("Invalid row object passed:", row);
                        return;
                    }

                    const cell = row.getCell(0); // Access the first column cell
                    if (!cell) {
                        console.warn("Cell not found in the first column of the row:", row);
                        return;
                    }

                    const cellElement = cell.getElement(); // Access the cell's DOM element
                    const checkbox = cellElement.querySelector("input[type='checkbox']");
                    if (checkbox) {
                        checkbox.checked = check; // Set to true to check, false to uncheck
                        if(location.host.indexOf('localhost') >= 0) {
                            testAlert("Localhost - just used checkFirstColumnCheckbox");
                        }
                    } else {
                        console.warn("Checkbox not found in the first column cell:", cellElement);
                    }
                }

                // Scope click alerts to #tabulator-geotable only (bind once)
                if (!geotableClickHandlerBound) {
                    geotableClickHandlerBound = true;
                    $(document).on("click", "#tabulator-geotable", function(e){
                        const checkbox = e.target.closest("input[type='checkbox']");
                        if (checkbox) {
                            testAlert("checkbox clicked");
                            e.stopPropagation();
                            return;
                        }
                        const rowElement = e.target.closest(".tabulator-row");
                        if (rowElement) {
                            testAlert("row clicked");
                        }
                    });
                }

                geotableInstance.on("rowClick", function(e, row){
                    if (e.target.type === 'checkbox') {
                        if(location.host.indexOf('localhost') >= 0) {
                            testAlert("checkbox via rowClick - never gets called so probably okay to delete");
                        }
                        // Stop the row click event if the checkbox was directly clicked
                        e.stopPropagation();
                        //toggleCheckbox(row);
                    } else {
                        //alert("row click")
                        // Gets called for both row and checkbox click.
                        row.toggleSelect();
                        checkFirstColumnCheckbox(row, row.isSelected());
                        //toggleCheckbox(row);
                    }

                    // rowClick is called at end of sequence, so triggering updateMapColors
                    const isCO2Sort = geotableLastSorters.some(function(sorter){
                        return sorter && (sorter.field === "CO2" || sorter.field === "co2percap");
                    });
                    if (isCO2Sort) {
                        updateMapColors("geomap");
                    }
                });

                // Function to toggle checkbox and update row selection
                function toggleCheckbox(row) {
                    if (row.isSelected()) {
                        row.deselect();
                    } else {
                        row.select();
                    }
                }

                // Row selection handler
                geotableInstance.on("rowSelected", function(row){
                    console.log("geotable rowSelected " + row._row.data.id + " (programmatic: " + programmaticSelection + ")");
                    if (!currentRowIDs.includes(row._row.data.id)) {
                        //alert("Add to geo in url hash: " + row._row.data.id)
                        // Updates geo in url hash
                        currentRowIDs.push(row._row.data.id);
                    }
                    
                    // Only trigger goHash if this is a user-initiated selection, not programmatic
                    if (!programmaticSelection && hash.geo != currentRowIDs.toString()) {
                        hash.geo = currentRowIDs.toString();
                        //alert("goHash rowSelected " + hash.geo);
                        //alert("rowSelected currentRowIDs call goHash " + currentRowIDs.toString());
                        goHash({'geo':hash.geo});
                    }
                });

                // Row deselection handler
                geotableInstance.on("rowDeselected", function(row){
                    currentRowIDs = currentRowIDs.filter(item => item !== row._row.data.id);
                    console.log("rowDeselected. Remaining currentRowIDs: " + currentRowIDs.toString() + " (programmatic: " + programmaticSelection + ")");
                    
                    // Only trigger goHash if this is a user-initiated deselection, not programmatic
                    if (!programmaticSelection && hash.geo != currentRowIDs.toString()) {
                        // Why is currentRowIDs incorrect? (blank)
                        hash.geo = currentRowIDs.toString();
                        goHash({'geo':hash.geo}); // Reapplies selections to map (otherwise map reverts to chlorpleth)
                    }
                });


                consoleLog("Before Update Map Colors Tabulator list displayed. State: " + theState);

                // Manually redraw geotable after build since autoResize is disabled
                geotableInstance.on("tableBuilt", function() {
                    geotableIsBuilt = true;
                    geotableInitInProgress = false;
                    geotableInstance.redraw(true); // Force full redraw
                    $("#tabulator-geotable").show();
                    if (!$("#tabulator-geotable").is(':visible')) {
                        $("#geoPicker").show();
                        $("#geoListHolder").show();
                        $(".geoListCounties").show();
                        $("#tabulator-geotable").show();
                    }
                    if (!geotableVisibilityForced && hash.geoview === "state") {
                        geotableVisibilityForced = true;
                        $("#geoPicker").show();
                        $("#geoListHolder").show();
                        $(".geoListCounties").show();
                        $("#tabulator-geotable").show();
                    }
                    if (location.host.indexOf('localhost') >= 0) {
                        testAlert(
                            "geotable tableBuilt - visible: " + $("#tabulator-geotable").is(':visible') +
                            " | geoPicker: " + $("#geoPicker").is(':visible') +
                            " | geoListCounties: " + $(".geoListCounties").is(':visible')
                        );
                    }
                });

                if(hash.geo) {
                    let currentGeoIDs = hash.geo.split(',');
                    geotableInstance.on("tableBuilt", function() {
                        //alert("currentGeoIDs " + currentGeoIDs)
                        geotableInstance.selectRow(currentGeoIDs); // Uses "id" of incoming rowData, which is the fips geo value. US01097,US01098
                    });
                }

            }); // End waitForLayout
            }); // End wait for element #tabulator-geotable
        }
    } else {
      console.log("Tabulator JS not available after loadTabulator() resolved for " + element.scope);
    }
    }); // End loadTabulator().then()
}
function updateSelectedTableRows(geo, geoDeselect, attempts) {

    // Loop until geotable.getRows is available (about 10 times)
    // This functions DOES NOT cause bug that redirects off geoview and geo from
    // Texas link and others: http://localhost:8887/io/

    console.log("updateSelectedTableRows"); // Got called when removing everything from localsite.js include. Occurs 10 times here: http://localhost:8887/explore/locations/#geo=US13251
                    
    let hash = getHash();
    if (!hash.state) {
        console.log("ALERT - A state value is needed in the URL")
    } else {
        const geotableInstance = getGeoTableInstance();
        const canUseTable = geotableInstance && typeof geotableInstance.getRows === "function" && geotableIsBuilt;
        if (canUseTable) {
            //alert("geotable.getRows === function")
            // #tabulator-geotable
            //geotable.selectRow(geotable.getRows().filter(row => row.getData().name.includes('Ba')));
            
            // Set flag to indicate programmatic selection (don't trigger goHash)
            programmaticSelection = true;
            
            if (geo) {
                $.each(geo.split(','), function(index, value) {
                    console.log("geo value: " + value);
                    //geotable.selectRow(geotable.getRows().filter(row => row.getData().id == value));
                    geotableInstance.selectRow(value);
                });
            }
            if (geoDeselect) {
                $.each(geoDeselect.split(','), function(index, value) {
                    console.log("geoDeselect: " + value);
                    //geotable.deselectRow(geotable.getRows().filter(row => row.getData().id == value));

                    // Preferable if we have the row's actual ID value
                    geotableInstance.deselectRow(value); // Pass the row ID directly
                });
            }
            
            // Reset flag after programmatic selections are complete
            programmaticSelection = false;
            // Row Display Test - scroll down to see which rows were not initially in DOM.
            //$('.tabulator-row input:checkbox').css('display', 'none');

            //var selectedRows = ; //get array of currently selected row components.
            let county_names = []
            $.each(geotableInstance.getSelectedRows(), function(index, value) {
                // TODO - Group by state
                county_names.push(value._row.data.name.split(",")[0].replace(" County",""));
                //if (geoDeselect.length && ) {

                //}
            });
            console.log("county_names from geotable{} set by current tabulator: " + county_names.toString());
            $(".counties_title").text(county_names.toString().replaceAll(",",", "));
        } else {
          geotablePendingSelection = geo || "";
          geotablePendingDeselect = geoDeselect || "";
          if (!geotablePendingListener) {
            geotablePendingListener = true;
            waitForElm('#tabulator-geotable').then(() => {
              const pendingInstance = getGeoTableInstance();
              if (!pendingInstance) {
                geotablePendingListener = false;
                return;
              }
              if (geotableIsBuilt && typeof pendingInstance.getRows === "function") {
                updateSelectedTableRows(geotablePendingSelection, geotablePendingDeselect, 0);
                geotablePendingListener = false;
                return;
              }
              pendingInstance.on("tableBuilt", function() {
                updateSelectedTableRows(geotablePendingSelection, geotablePendingDeselect, 0);
                geotablePendingListener = false;
              });
            });
          }
        }
    }
}

function updateSelectedCountryRows(countryList, countryDeselect) {
    const table = getStateTableInstance();
    if (!table || typeof table.getRows !== "function") {
        waitForElm('#tabulator-statetable').then(() => {
            const pendingTable = getStateTableInstance();
            if (pendingTable) {
                pendingTable.on("tableBuilt", function() {
                    updateSelectedCountryRows(countryList, countryDeselect);
                });
            }
        });
        return;
    }
    programmaticSelection = true;
    if (countryList) {
        const current = countryList.split(",").filter(Boolean);
        if (current.length) {
            table.selectRow(current);
        }
    }
    if (countryDeselect) {
        const removeList = countryDeselect.split(",").filter(Boolean);
        if (removeList.length) {
            table.deselectRow(removeList);
        }
    }
    programmaticSelection = false;
}

function updateMapColorsOld(whichmap) {
    waitForElm('#' + whichmap + " .leaflet-pane").then((elm) => {
        //alert("updateMapColors #" + whichmap)
        let hash = getHash();
        let layerName = hash.state.split(",")[0].toUpperCase() + " Counties";
        var sortedData = geotable.getData("active").map(function(row) {
            return row.location;
        });
        console.log("layerName " + layerName); // The checkable layer residing in the legend.

        if (location.host.indexOf('localhost') >= 0) {
            // Add color to this log
            //alert("To debug: Cannot read properties of undefined (reading 'eachLayer')")

            // Prevents error in subsequent line
            //waitForVariable('geoOverlays[layerName]', function() {

                // Make red

                // Working. If it stops working, check if we need to wait for geoOverlays[layerName]
                geoOverlays[layerName].eachLayer(function(layer) {
                    var location = layer.feature.properties.COUNTYFP; // Assuming 'name' property in GeoJSON
                    alert("location: " + location)
                    var index = sortedData.indexOf(location);
                    var colorIntensity = index >= 0 ? (index / sortedData.length) * 360 : 0; // Adjust color intensity based on position
                    // Makes the background transparent pink instead of blue. All turn back to blue when clicking.
                    layer.setStyle({ fillColor: "hsl(" + colorIntensity + ", 100%, 50%)" });
                });
            //});
        }
    });
}
function updateMapColors(whichmap) {
    waitForElm('#' + whichmap + " .leaflet-pane").then((elm) => {
        
        let hash = getHash();
        const selectedGeoList = hash.geo ? hash.geo.split(",") : [];
        const selectedCountryList = hash.country ? hash.country.split(",") : [];
        if (hash.geo) {
            testAlert("updateMapColors: applying choropleth to selected geo values: " + hash.geo);
        }
        let layerName = "States";
        let validRows = [];
        let colorBy = "CO2";
        let legendTitle = "CO<sub>2</sub> Emissions"
        if (hash.state && hash.geoview != "country") {
            //console.log("localObject.geo")
            //console.log(localObject.geo)
            validRows = localObject.geo.filter(d => !isNaN(Number(d.CO2)));
            layerName = hash.state.split(",")[0].toUpperCase() + " Counties";
        } else if (hash.geoview == "countries") {
            validRows = localObject["countries"].filter(d => !isNaN(Number(d.CO2)));
            layerName = "Countries";
            colorBy = "co2percap";
            legendTitle = "CO<sub>2</sub> Per Person"
            //colorBy = "Population";
        } else {
            //console.log("localObject['country-us']");
            //console.log(localObject["country-us"]);
            validRows = localObject["country-us"].filter(d => !isNaN(Number(d.CO2)));
        }
        // Convert co2 to numbers and filter valid rows
        const minCO2 = Math.min(...validRows.map(d => Number(d[colorBy])));
        const maxCO2 = Math.max(...validRows.map(d => Number(d[colorBy])));

        // Map a value to a color in the blue range
        function getColor(co2) {
            //console.log("co2: ");
            //console.log(co2);
            const co2Value = Number(co2);
            if (isNaN(co2Value)) {
                return `hsl(210, 100%, 95%)`; // Lightest blue for missing/invalid co2
            }
            const intensity = (co2Value - minCO2) / (maxCO2 - minCO2); // Normalize to [0, 1]
            // const blueShade = 240 - (intensity * 120); // Adjust blue hue from 240 (light) to 120 (dark)
            const lightness = 95 - (intensity * 75); // Adjust lightness from 95% (light) to 20% (dark)
            return `hsl(210, 100%, ${lightness}%)`;
        }

        // From topojson file (differs from file for Tabulator)

        // BUGBUG - When state included with geoview=country
        // http://localhost:8887/community/start/maps/#geoview=country&state=GA
        
        // Check if geoOverlays[layerName] exists before calling eachLayer
        if (geoOverlays[layerName]) {
            let selectedRecoloredCount = 0;
            geoOverlays[layerName].eachLayer(function (layer) {
            const location = layer.feature.properties.COUNTYFP; // Match GeoJSON property
            const stateFP = layer.feature.properties.STATEFP;
            //alert("locationA: " + location)
            //console.log("layer.feature.properties")
            //console.log(layer.feature.properties)
            let data = [];
            let fullLocation = layer.feature.properties.name; // State name
            const countryAlpha2 = layer.feature.properties["Alpha-2"];
            
            if (location) {
                fullLocation = "US" + stateFP + location;
                data = localObject.geo.find(row => row.id === fullLocation);
            } else if (hash.geoview == "countries") {
                if (selectedCountryList.length && (!countryAlpha2 || !selectedCountryList.includes(countryAlpha2))) {
                    layer.setStyle({
                        fillColor: '#ccc',
                        fillOpacity: 0.1,
                        color: '#77a',
                        weight: 1
                    });
                    return;
                }
                //console.log("fullLocation: " + fullLocation)
                if(fullLocation=="United States of America") fullLocation = "United States";
                if(fullLocation=="Republic of the Congo") fullLocation = "Congo [Republic]";
                if(fullLocation=="Democratic Republic of the Congo") fullLocation = "Congo [DRC]";
                if(fullLocation=="United Republic of Tanzania") fullLocation = "Tanzania";
                data = localObject["countries"].find(row => row.CountryName === fullLocation);
            } else {
                // For state, using row.name rather than row.id
                data = localObject["country-us"].find(row => row.StateName === fullLocation);
            }
            //console.log("fullLocation");
            //console.log(fullLocation);

            // BUGBUG - for states, capitalize data.CO2
            if (data) {
                layer.setStyle({
                    fillColor: getColor(data[colorBy]),
                    fillOpacity: 0.7,
                    color: '#77a',
                    weight: 1
                });
            } else {
                layer.setStyle({
                    fillColor: '#ccc', // Default color for missing data
                    fillOpacity: 0.5,
                    color: '#77a',
                    weight: 1
                });
            }

            if (selectedGeoList.length && fullLocation && selectedGeoList.includes(fullLocation)) {
                selectedRecoloredCount += 1;
            }
        });
        if (selectedGeoList.length) {
            testAlert("updateMapColors: recolored " + selectedRecoloredCount + " selected boundary areas in " + layerName);
        }
        } else {
            console.log("WARN: geoOverlays[" + layerName + "] is undefined, skipping eachLayer processing");
        }

        // Add a legend only when sorting by CO2 in the active tabulator
        const isCO2Sort = mapColorLastSorters.some(function(sorter){
            return sorter && (sorter.field === "CO2" || sorter.field === "co2percap");
        });
        if (isCO2Sort) {
            addLegendToMap(minCO2, maxCO2, whichmap, legendTitle);
        }
    });
}

function refreshSelectedGeoStyles(whichmap) {
    let hash = getHash();
    let layerName = "States";
    if (hash.state && hash.geoview != "country") {
        layerName = hash.state.split(",")[0].toUpperCase() + " Counties";
    } else if (hash.geoview == "countries") {
        layerName = "Countries";
    }
    if (geoOverlays[layerName]) {
        geoOverlays[layerName].setStyle(styleShape);
    }
    const mapContainer = document.querySelector(`#${whichmap}`);
    if (mapContainer) {
        const existingLegend = mapContainer.querySelector('.info.legend');
        if (existingLegend) {
            existingLegend.remove();
        }
    }
}
function addLegendToMap(minCO2, maxCO2, whichmap, legendTitle) {
    // Get the map container
    const mapContainer = document.querySelector(`#${whichmap}`);
    if (!mapContainer) return;

    // Remove existing legend if present
    const existingLegend = mapContainer.querySelector('.info.legend');
    if (existingLegend) {
        existingLegend.remove();
    }

    // Create a new legend
    const legend = document.createElement('div');
    legend.className = 'info legend';

    const grades = 8; // Number of legend segments
    const step = (maxCO2 - minCO2) / grades;

    let labels = [];
    for (let i = 0; i <= grades; i++) {
        const value = minCO2 + (i * step);
        const intensity = (value - minCO2) / (maxCO2 - minCO2);
        const lightness = 95 - (intensity * 75);
        const color = `hsl(210, 100%, ${lightness}%)`;
        // Math.round(value)
        labels.push(
            `<i style="background:${color}"></i> ${formatCell(value)}`
        );
    }

    labels.push(`<i style="background:hsl(210, 100%, 95%)"></i> No Data`);

    legend.innerHTML = `<h4>` + legendTitle + `</h4>` + labels.join('<br>');

    // Append the legend to the map container
    mapContainer.appendChild(legend);
}

// To remove, or use as fallback
function applyStupidTable(count) {
    console.log("applyStupidTable attempt " + count);

    if ($.fn.stupidtable) { // Prevents TypeError: $(...).stupidtable is not a function
        console.log("Table function available. Count " + count);
        //$("table").stupidtable();
        
        $("#county-table").stupidtable();
        //$("table2").stupidtable();
    } else if (count <= 100) {
        setTimeout( function() {
            applyStupidTable(count+1);
        }, 10 );
    } else {
        console.log("applyStupidTable attepts exceeded 100.");
    }
}

function activateMyLocation(limitByDistance) {
    $('#latLonFields').show();
    getLatLonFromBrowser(limitByDistance);
}
function getLatLonFromBrowser(limitByDistance) {
    // For when Leafet/Carto map is not in use.
    consoleLog("Refresh Latitude and Longitude");
    //if (chkGeoPosition) {
        // Get latitude and longitude
        $("#currentButtons").hide();
        if (navigator.geolocation) { // Browser supports lookup
            //Show loading icon
            $("#loadingLatLon").html('<div style="margin:0 10px 10px 0; padding-left:6px"><img src="https://map.georgia.org/explore/img/icons/loading-sm.gif" alt="Geo Loading" title="Geo Loading" style="width:18px;float:left;margin:14px 6px 0 0" /><div style="float:left;line-height:28px">Loading GeoLocation</div></div>');
            $("#loadingLatLon").show();

            navigator.geolocation.getCurrentPosition(function (position) {
                consoleLog(position.coords.latitude.toFixed(3));
                $("#lat").val(position.coords.latitude.toFixed(3));
                $("#lon").val(position.coords.longitude.toFixed(3));
                $(".mylat").val(position.coords.latitude.toFixed(3));
                $(".mylon").val(position.coords.longitude.toFixed(3));
                if (limitByDistance) { // Shows points within distance in dropdown menu.
                    consoleLog("limitByDistance");
                    distanceSearchType = 'latlon';
                    $("#currentButtons").show();
                    $('.searchText').show();
                    $('.goSearch').trigger("click");
                }
                $("#loadingLatLon").html('<div style="margin-right:10px"><img src="https://map.georgia.org/explore/img/icons/loading-sm.gif" alt="Geo Loading" title="Geo Loading" style="width:18px;float:left;margin:6px 6px 0 0" /><div style="float:left;line-height:40px">Recentering map</div></div>');
                setTimeout(function(){
                    $("#loadingLatLon").hide();
                }, 5000);
                
            }, function (error) {
                consoleLog(error);
                console.log('geolocation error occurred. Error code: ' + error.code);
                $("#loadingLatLon").html('Unable to fetch your geolocation.');
                $('.searchText').hide();

                // error.code 2 occurred when disconnected.
                //alert(error.code);
                //loadPageAsync(jsonFile);       
            });
            //alert('Break page'); // CAUTION - Putting an alert here breaks page.
        }
        if (!$("#lat").val()) {
            //alert("Approve geocoding at the top of your browser.");
        }
        //chkGeoPosition = false;
    //}
}


function hideLocationFilters() {
    $("#distanceField").hide();
    //$(".currentCities").hide(); // Avoid hiding when clicking addCity
    $("#zipFields").hide();
}
function removeCityFilter() {
    $('.cityTitleText').text("");
    $('.currentCities').hide();
    //$('.hideMainMenu').trigger("click");
    $(".cityCB").prop('checked', false);
    // Also need to update URL.
}
function hideLocationsMenu() {
    $('.listHolder').hide();
}
function populateCityList(callback) {
    //$(".menuPanel").hide(); // Also called from loadStateCounties
    $(".countyList").hide();

    if ($('.cityList').length > 0) { // Already populated
        return;
    }
    console.log("cityList");
    var file = "/team/projects/map/cities.csv";
    $.get(file, function(data) {
        var cityList;
        var lines = data.split('\n');

        var n = $('<div class="sideSelectList cityList"></div>');      
        //n.append('<label for="county-' + r[columnName] + '" class="countyLabel"><input type="checkbox" class="countyCB" name="countyCB" id="county-' + r[columnName] + '" value="' + r[columnName] + '" economic_region="' + r["economic_region"] + '" wia_region="' + r["wia_region"] + '">' + r[columnName] + ' County</label>');
        //$('.countyList').append(n);

        $.each(lines, function (lineNo, line) {
            var items = line.split(',');
            //cityList +=  + "," + items[2] + "<br>";
            if (lineNo > 0 && items[1]) {
                n.append('<label for="city-' + items[1].toLowerCase() + '"><input type="checkbox" class="cityCB" name="cityCB" id="city-' + items[1].toLowerCase() + '" value="' + items[1].toLowerCase() + '" data-latitude="' + items[2] + '" data-longitude="' + items[3] + '">' + items[1] + '</label><br>');
            }
        });
        $(".listHolder").append(n);

        // We avoid showing .listHolder here because sometime list is populated without displaying.
        $('.cityList :checkbox').change(function () {
            $('#goSearch').trigger("click");
        });
        $('.cityText').click(function(event) {
            locationFilterChange("city");          
        });
        callback('done');
    });
}


// UPPER ("extra" in display)
// Some may go in search-display.js

function SearchFormTextCheck(t, dirn) {
    if (dirn == 1 && t.value == "") {
        t.value = "";
        $(".fieldSelector").show();
        //console.log('boo');
    }
    //return false;
    event.stopPropagation();
}

function SearchEnter(event1) {
    var kCode = String.fromCharCode(event1.keyCode);
    ////if (kCode == "\n" || kCode == "\r") {

        // Reactivate on pages where auto-update appropriate.
        //$("#goSearch").click();

    ////    return false;
    ////}
}
function isInt(value) {
  var x;
  return isNaN(value) ? !1 : (x = parseFloat(value), (0 | x) === x);
}
String.prototype.split2 = function(separator) {
    return this == "" ? [] : this.split(separator); // Avoid returning 1 when null.
}
function displayRow(rowArray) {
    // NOT USED?
    // <input name='contact' type='checkbox' value='" + rowArray[0] + "'> 
    $("#mainList").append( "<div><div><div style='float:right'>Add</div>" + rowArray[0] + "</div><div><b class='exporter'>Export Categories: </b><span class='exporter'> " + rowArray[2] + "</span></div><div>" + rowArray[3] + "</div><div>" + rowArray[4] + "</div><div><b>Product HS Codes: </b>" + rowArray[5] + "</div></div>");
    //<div>" + rowArray[6] + "</div><div>" + rowArray[7] + "</div>
}

var dataSet = [];

function displayListX() {
    console.log("displayList");
    var matchCount = 0;

    $("#mainList").html("");
    for(var i = 0; i < dataSet.length; i++) {
        if (i > 2) {
            //if (entry[0] > (startRange*100) && entry[0] < (endRange*100+99)) {
                matchCount++;
                // <input name='contact' type='checkbox' value='" + dataSet[i][0] + "'> 
                $("#mainList").append( "<div><div style='float:right'>Add<div></div>" + dataSet[i][0] + "</div><div><b class='exporter'>Export Categories: </b><span class='exporter'> " + dataSet[i][2] + "</span></div><div><b>Description: </b>" + dataSet[i][3] + "</div>");
                $("#mainList").append( "<div><b>Product HS Codes: </b>" + dataSet[i][5] + "</div></div>");
                    //<div>" + dataSet[i][6] + "</div><div>" + dataSet[i][7] + "</div>
            //}
        }
        if (matchCount > 0) {
            $("#resultsPanel").show();
        }
     }
     if (matchCount > 0) {
        $("#resultsPanel").show();
    }
}

function changeCat(catTitle) {
    if (catTitle) {
        catTitle = catTitle.replace(/_/g, ' ');
    }
    //$('#catSearch').val(catTitle);
    //alert("changeCat catTitle1 " + catTitle)
    $('#catSearchText').text(catTitle);
    $('#items').prop("checked", true); // Add front to parameter name.

    $('.catList > div').removeClass('catListSelected');

    // Side nav with title attribut
    if (catTitle) {
        $('.catList div[ title="' + catTitle + '" ]').addClass("catListSelected");
    } else {
        $('.catList .all_categories').addClass('catListSelected');
    }
    $("#topPanel").hide();
    $('#catListHolderShow').text('Product Categories');
    //$('html,body').animate({
    //    scrollTop: $("#hublist").offset().top - 250
    //});
}

function changeCatDelete(catTitle) {
  $('#catSearch').val(catTitle);

  $('#items').prop("checked", true); // Add front to parameter name.

  //$('#industryCatList > div').removeClass('catListSelected');

  $('.catList > div').filter(function(){
      return $(this).text() === catTitle
  }).addClass('catListSelected');

  $("#topPanel").hide();
  $('#catListHolderShow').text('Product Categories');
  //$('html,body').animate({
  //    scrollTop: $("#hublist").offset().top - 250
  //});
}

$(document).ready(function() {
    if (param["show"] == "mockup" || param["mockup"] || param["design"]) {
        // Phase out .mock-up and switch to .mockup
    var div = $("<div />", {
        html: '<style>.mock-up{display: block !important;}.mockup{display: block !important;}</style>'
      }).appendTo("body");
    }
    if (param["show"] == "suppliers") {
    //var div = $("<div />", {
    //    html: '<style>.suppliers{display:inline !important;}</style>'
    //}).appendTo("body");
    $(".suppliers").show();
    }

    if (param["show"] == "produce") {
    $('.addlisting').show();
    }

    $('#catListClone').html($('#industryCatList').clone());

    $(document).on("click", ".catList > div", function(event) {
    var catTitle = $(this).text();
    if ($(this).attr("title")) {
        catTitle = $(this).attr("title");
    }
    var catString = catTitle.replace(/ /g, '_').replace(/&/g, '%26');
    $("#bigThumbPanelHolder").hide();
    $(".showApps").removeClass("filterClickActive");
    //updateHash({'appview':''});
    if (catString == "All_Categories") {
        catString = "";
    } else {
        console.log("catList triggers update. cat: " + catString);
        // Too soon here
        //clearListDisplay();
    }
    goHash({"cat":catString,"subcat":"","name":""}); // Let the hash change trigger updates
    event.stopPropagation();
    });
    $('.toggleListOptions').click(function(event) {
      if ($('.toggleListOptions').hasClass("expand")) {
          $('.toggleListOptions').removeClass("expand");
          $('.listOptions').hide();
      } else {
          $('.toggleListOptions').addClass("expand");
          if ($(".listPanel").is(':visible')) {
              $('.listOptions .hideList').show();
          } else {
              $('.listOptions .hideList').hide();
          }
          $('.listOptions').show();
      }
      event.stopPropagation();
    });

    // If this does not work, may need to call when map1 is initially loaded, but only once.
    $('.refreshMap').click(function(event) {

        alert("Not fully implemented.")
      //$("#map1").show();
      //displayMap(layerName, localObject.layers);
      $(".listOptions").hide();
      console.log(".refreshMap ");

      if (document.querySelector('#geomap')._leaflet_map) {
        document.querySelector('#geomap')._leaflet_map.invalidateSize(); // Force Leaflet map to reload
      } else {
        console.log("document.querySelector('#geomap')._leaflet_map not found");

        // To try as alternative. Not yet tested.
        /*
        if (map1) {
            map1.invalidateSize(); // Refresh map tiles.
        }
        if (map2) {
            map2.invalidateSize(); // Refresh map tiles.
        }
        */
      }
      document.querySelector('#map1')._leaflet_map.invalidateSize(); 
      document.querySelector('#map2')._leaflet_map.invalidateSize(); 
    });
    $('.sendfeedback').click(function(event) {
      window.open(local_app.localsite_root() + "/info/input/",'_parent');
      event.stopPropagation();
    });

    $('.addlisting').click(function(event) {
      window.location = "https://www.ams.usda.gov/services/local-regional/food-directories-update";
      event.stopPropagation();
    });
    $('.go_map').click(function(event) {
      goHash({'geoview':'country'});
      window.scrollTo({
          top: $('#map1').offset().top,
          left: 0
        });
    });
    $('.go_list').click(function(event) {
      window.scrollTo({
          top: $('#detaillist').offset().top,
          left: 0
        });
    });
    $('.go_local').click(function(event) {
      window.scrollTo({
          top: $('#mapHolder').offset().top - 95,
          left: 0
        });
      $("#sidemapCard").show(); // map2
    });
    $('.go_search').click(function(event) {
      window.scrollTo({
          top: 0,
          left: 0
        });
    });
});


// These is missing var promises = [] and ready.
// Let's look at Industry Mix first: http://localhost:8887/community/zip/leaflet/#columns=JobsAgriculture:50;JobsManufacturing:50
//var geojsonLayer;
function renderGeomapShapesSimple(whichmap, hash) {
    console.log("renderGeomapShapesSimple " + whichmap);
    let map = document.querySelector('#' + whichmap)._leaflet_map; 
    //alert("renderGeomapShapesSimple " + whichmap);
    //if (geojsonLayer) {
        //alert("found geojsonLayer")
        // Problem, this removes the whole layer, shapes and all.
        //map.removeLayer(geojsonLayer); // Remove the prior topo layer
    //}
}

// This could be reactivated to merge another dataset to map popups
function mergeInDetailData(topodata,detail_data) {
  var data_by_id = d3.nest() // where id is a zipcode or countyID
    .key(function(d){return d.zcta;})
    .entries(detail_data);

  topodata.features.forEach(function(d) {
        // d.properties.zip becomes d.properties.COUNTYFP
        var topoID = data_by_id.find(x=>x.key === d.properties.COUNTYFP.replace(/^0+/, ''));
        if(topoID) {
            columns.forEach(function(c){
                d[c] = parseFloat(topoID.values[0][c]);
            });
            cluster_data.push(d); // Topo shape data now has census attributes added, including zcta
        }
  });
  return cluster_data;
}

function isElementInViewport(el) {

    // Special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }

    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
}
function localJsonpCallback(json) {
  if (!json.Error) {
    //$('#resultForm').submit();
  } else {
    //$('#loading').hide();
    //$('#userForm').show();
    //alert("json.Message " + json.Message);
  }
}

// INIT
// BUGBUG - param is not available here
/*
if(!param.state) {
    local_app.loctitle = "United States";
}
if(!param.show) {
    local_app.showtitle = "Industries";
}
*/

function updateRegionService(section) {

    //alert("updateRegionService");
    let theLocation = hash.regiontitle;
    if (!theLocation) {
        let theStateName = $("#state_select").find(":selected").text();
        if (theStateName) {
            theLocation = theStateName;
            //alert("theLocation " + theLocation)
        } else if (hash.state) {
            theLocation = hash.state;
            waitForElm('#state_select').then((elm) => {
                //$("#state_select").val(param.state.split(",")[0]);
                //alert(param.state.split(",")[0])applyNavigation();
                //if ($("#state_select").find(":selected").value) {
                //    alert("found #state_select");
                //    updateRegionService(section);
                //}
            });
        }
    }
    if (theLocation) {
        $(".region_service").text(theLocation + " - " + section);
    } else {
        $(".region_service").text(section);
    }
}

// INIT
$(document).ready(function() {
    // Wait for localsite.js
    hashChanged(); // Ideally this resides before $(document).ready, but we'll need a copy of waitForVariable here

    let hash = getHash();
    if (hash.state) {
        let stateAbbrev = hash.state.split(",")[0].toUpperCase();
        $("#state_select").val(stateAbbrev);
    }
    if (hash.regiontitle) {
        $("#region_select").val(hash.regiontitle);
    }
});

function styleShape(feature) { // Called FOR EACH topojson row
    console.log("styleShape")
    let hash = getHash(); // To do: pass in as parameter
    //console.log("feature: ", feature)

    var fillColor = 'rgb(51, 136, 255)'; // blue for borders (not shapes)

    // For hover '#665';

    // REGION COLORS: See community/start/map/counties.html for colored region sample.

    /*
    dp.data.forEach(function(datarow) { // For each county row from the region lookup table
      if (datarow.county_num == feature.properties.COUNTYFP) {
        fillColor = color(datarow.io_region);
      }
    })
    */
    let stateID = getIDfromStateName(feature.properties.name);
    let fillOpacity = .05;
    if (hash.geo && hash.geo.includes("US" + feature.properties.STATEFP + feature.properties.COUNTYFP)) {
      fillColor = 'purple';
      fillOpacity = .2;
    } else if (hash.geoview == "country" && hash.state && hash.state.includes(stateID)) {
      fillColor = '#3a74d6';
      fillOpacity = 0.6;

    } else if (hash.geoview == "countries") {
      const selectedCountries = hash.country ? hash.country.split(",") : [];
      const countryAlpha2 = feature.properties["Alpha-2"];
      if (selectedCountries.length && countryAlpha2 && selectedCountries.includes(countryAlpha2)) {
        fillColor = '#3a74d6';
        fillOpacity = 0.6;
      } else {
        fillOpacity = .05;
      }
    } else if ((hash.geoview == "country" || (hash.geoview == "state" && !hash.state)) && typeof localObject.state != 'undefined') {
      let theValue = 2;
      console.log("localObject.state2")
      //console.log(localObject[element.scope])
      console.log(localObject.state)

        if (localObject.state[getState(stateID)]) { // && localObject.state[getState(stateID)].CO2_per_capita != "No data"
        console.log("state found: " + stateID + " " + getState(stateID));
        //console.log("state: " + stateID + " " + localObject.state[getState(stateID)].CO2_per_capita);
        //theValue = localObject.state[getState(stateID)].CO2_per_capita;
        theValue = localObject.state[getState(stateID)].co2percap;
      }
      theValue = theValue/4; // Ranges from 0 to 26
      fillColor = colorTheStateCarbon(theValue); // Stopped working. Wasn't a function. Maybe try to reactivate.
      //fillColor = colorTheStateCarbon;
      console.log("fillColor: " + fillColor + "; theValue: " + theValue + " " + feature.properties.name);
      fillOpacity = .5;
    } 

    console.log("fillColor " + fillColor);
    return {
      weight: 1,
      opacity: .4,
      color: fillColor, // '#ccc', // 'white'
      //dashArray: '3',
      fillOpacity: fillOpacity,
      fillColor: fillColor
    };
}


///// NAVIGATION

// Site specific settings
// Maintained in localsite/js/navigation.js
//alert("navigation.js param.state " + param.state);
var navigationJsLoaded = "true";
if(typeof page_scripts == 'undefined') {  // Wraps script below to insure navigation.js is only loaded once.
if(typeof localObject == 'undefined') { var localObject = {};}
if(typeof localObject.layers == 'undefined') {
    localObject.layers = {}; // Holds layers.
}
const page_scripts = document.getElementsByTagName("script");
let earthFooter = false;
let showLeftIcon = false;
if(typeof param=='undefined'){ var param={}; }

if (window.location.protocol != 'https:' && location.host.indexOf('localhost') < 0) {
    location.href = location.href.replace("http://", "https://"); // Leave http
}
// Get the levels below root
var foldercount = (location.pathname.split('/').length - 1); // - (location.pathname[location.pathname.length - 1] == '/' ? 1 : 0) // Removed because ending with slash or filename does not effect levels. Increased -1 to -2.
foldercount = foldercount - 2;
var climbcount = foldercount;
var climbpath = "";
for (var i = 0; i < climbcount; i++) {
    climbpath += "../";
}
if (climbpath == "") {
    //climbpath += "./"; // Eliminates ? portion of URL
    console.log("climbpath = '', set to '../'")
    climbpath += "../";
}
//console.log("climbpath " + climbpath);

var modelpath = climbpath;
if (modelpath == "./") {
    //modelpath = "";
}
//var modelroot = ""; // For links that start with /

// 2024 June - Override everything above to allow for other localsite ports not having local files.
// If navigation.js is loaded first, this will be...
if (typeof local_app.web_root === 'function') {
    modelpath = local_app.web_root();
}
//alert("modelpath " + modelpath)

if(location.host.indexOf('localhost') < 0 && location.host.indexOf('model.') < 0 && location.host.indexOf('neighborhood.org') < 0) { // When not localhost or other site that has a fork of io and community.
    // To do: allow "Input-Output Map" link in footer to remain relative.
    //modelpath = "https://model.earth/" + modelpath; // Avoid - use local_app.web_root() instead - Check if/why used for #headerSiteTitle and hamburger menu
    ////modelroot = "https://model.earth"; // For embeds
}
consoleLog("theroot NOT APPENDED: " + theroot + modelpath); // Not correct since modelpath starts with https://locasite etc
//modelpath = theroot + modelpath;
consoleLog("modelpath " + modelpath);


function waitForVariableNav(variable, callback) { // Declare variable using var since let will not be detected.
  var interval = setInterval(function() {
    if (window[variable]) {
      clearInterval(interval);
      consoleLog('waitForVariable found ' + variable);
      callback();
      return;
    }
    consoleLog('waitForVariable waiting ' + variable);
  }, 80);
}

// INIT
waitForVariableNav('localStart', function() {
    if (typeof localObject.navigationLoaded == "undefined") {
        // Initial load. Prevents reload if navigation.js is placed on page without id.
        localObject.navigationLoaded = true; // Var so universally available.
    } else {
        console.log("ALERT! navigation.js already loaded. Add an id in the javascript include. Or remove navigation.js since localsite.js loads.");
        return;
    }
    applyNavigation();
});

// Not in use, but might be cool to use
function displayHexagonMenu(layerName, localObject) {

  var currentAccess = 0;
  consoleLog("Display HEXAGON MENU");

  $("#honeycombMenu").html(""); // Clear prior
  $("#honeycombPanel").show();
  var thelayers = localObject.layers;
  //console.log(thelayers);
  var sectionMenu = "";
  var categoryMenu = "";
  //var iconMenu = "";
  var layer;
  for(layer in thelayers) {

        var menuaccess = 10; // no one
        menuaccess = 0; //Temp
        try { // For IE error. Might not be necessary.
            if (typeof(localObject.layers[layer].menuaccess) === "undefined") {
                menuaccess = 0;
            } else {
                menuaccess = localObject.layers[layer].menuaccess;
            }
        } catch(e) {
            consoleLog("displayLayerCheckboxes: no menuaccess");
        }
        if (access(currentAccess,menuaccess)) {
            if (localObject.layers[layer].menulevel == "1") {
            //var layerTitleAndArrow = (thelayers[layer].navtitle ? thelayers[layer].navtitle : thelayers[layer].title);
            var layerTitleAndArrow = thelayers[layer].section;
                var icon = (thelayers[layer].icon ? thelayers[layer].icon : '<i class="material-icons">&#xE880;</i>');
             if (thelayers[layer].item != "main" && thelayers[layer].section != "Admin" && thelayers[layer].title != "") {
                // <h1 class='honeyTitle'>" + thelayers[layer].provider + "</h1>
                sectionMenu += "<li class='hex'><a class='hexIn hash-changer' href='#" + thelayers[layer].item + "'><img src='" + removeFrontFolder(thelayers[layer].image) + "' alt='' /> <p class='honeySubtitle'>" + layerTitleAndArrow + "</p></a></li>";
                }
            }
        }
  }
  $("#honeycombMenu").append("<ul id='hexGrid'>" + sectionMenu + "</ul>"); // Resides in template-main.html
  $("#bigThumbPanelHolder").show();
  //$("#iconMenu").append(iconMenu);
    $("#honeyMenuHolder").show();
}
function thumbClick(show,path) {
    let hash = getHashOnly(); // Not hiddenhash
    let priorShow = hash.show;
    hash.show = show;
    if (!hash.state && param.state) {
        hash.state = param.state; // At least until states are pulled from geo values.
    }
    delete hash.cat;
    delete hash.naics;
    delete hash.name;
    delete hash.details;
    delete hash.m; // Birdseye view
    let pageContainsInfoWidgets = false;
    if ($("#iogrid").length >= 0 || $("#sector-list").length >= 0) {
        pageContainsInfoWidgets = true; // Stay on the current page if it contains widgets.
    }
    // !pageContainsInfoWidgets && // Prevented bioeconomy from leaving map page.
    if (path && !window.location.pathname.includes(path)) {
        // Leave current page
        var hashString = decodeURIComponent($.param(hash));
        window.location = "/localsite/" + path + "#" + hashString;
    } else { // Remain in current page
        if (show != priorShow) {
            delete hiddenhash.show;
            delete hiddenhash.naics;
            delete param.show;
            if (typeof params != 'undefined') {
                delete params.show;
            }
        }
        $(".bigThumbMenuContent").removeClass("bigThumbActive");
        $(".bigThumbMenuContent[show='" + show +"']").addClass("bigThumbActive");
        console.log(hash);
        goHash(hash,"name,loc"); // Remove name and loc (loc is not used yet)
    }
}

function closeExpandedMenus(menuClicked) {
    $(".rightTopMenuInner div").removeClass("active");
    $(menuClicked).addClass("active");
    $(".menuExpanded").hide(); // Hide any open
    //alert("rightTopMenuInner 3");
}
function showNavColumn() {
    console.log("showNavColumn");
    $("#sideIcons").hide();
    $("#side-nav-content").show();
    $("#main-nav").show();
    $("#side-nav").show();
    $("#side-nav").addClass("main-nav-full");
    $("body").removeClass("sidebar-hidden");
    $("body").removeClass("main-nav-hidden");
    $("#showSideFromBar").hide();
    // Move legend content to sidebar and hide floating legend only when timeline requests it.
    const allowTimelineLegendSidebar = !!window._timelineLegendAllowSidebar;
    if ($('#legend-content').length && $('#listLeft').length && allowTimelineLegendSidebar) {
        // Ensure header with toggle exists at top of listLeft
        if (!$('#locations-header').length) {
            $('#listLeft').prepend(`
                <div id="locations-header">
                    <b><a href="#" onclick="toggleDiv('#locations-content');return false;">LOCATIONS</a></b>
                    <div id="locations-content">
                        <div id="sidebar-view-toggle" class="legend-view-toggle">
                            <button id="sidebar-locations-btn" class="view-toggle-btn active" title="Show flat list of locations">Locations</button>
                            <button id="sidebar-continents-btn" class="view-toggle-btn" title="Group by continent">Continents</button>
                        </div>
                    </div>
                </div>
            `);
            // Setup toggle event handlers for sidebar
            setupSidebarViewToggle();
        } else {
            // Move header to top if it exists elsewhere
            $('#listLeft').prepend($('#locations-header'));
        }
        // Insert legend content inside locations-content, after the toggle
        $('#locations-content').append($('#legend-content'));
        $('#legend-content').css('font-size', '12px');
        $('#legend-content').css('line-height', '1em');
        const cloneLeftTarget = document.getElementById('cloneLeftTarget');
        if (cloneLeftTarget) {
            cloneLeftTarget.style.display = 'none';
        }
    }
    if (allowTimelineLegendSidebar) {
        $('#floating-legend').hide();
        $('#floating-legend').css('opacity', '0');
    }
    
    // Refresh feather icons when showing navigation
    if (window.standaloneNav && window.standaloneNav.replaceFeatherIcons) {
        window.standaloneNav.replaceFeatherIcons();
    }

    if ($("#main-content > .datascape").is(":visible")) { // When NOT embedded.
        if ($("#listcolumn").is(":visible")) {
            //////$('body').addClass('bodyLeftMarginFull'); // Creates margin on left for both fixed side columns.
            $('#listcolumn').removeClass('listcolumnOnly');
        }
    }

    $("#showSideFromBar").hide();
    if(document.getElementById("containerLayout") != null) {
        $('#main-nav').addClass("navcolumnClear");
        //////$('body').addClass('bodyLeftMarginNone');
    } else {
        //$("#main-content #showNavColumn").hide();
        //////$('body').addClass('bodyLeftMargin'); // Margin on left for fixed nav column.
        if ($('body').hasClass('bodyRightMargin')) {
          $('body').addClass('mobileView');
        }
        // Refreshs to load map tiles. Worked at one point.
        // Maybe vars map1 and map2 need to be called directly? They are now declaired universally.
        // Test is we need this with mobile.
        if (document.querySelector('#map1')._leaflet_map) {
            document.querySelector('#map1')._leaflet_map.invalidateSize(); // Refresh map tiles.
        }
        if (document.querySelector('#map2')._leaflet_map) {
            document.querySelector('#map2')._leaflet_map.invalidateSize(); // Refresh map tiles.
        }
    }
}
function hideNavColumn() {
    $('body').addClass('sidebar-hidden');
    // Move legend content back to floating legend and show it when nav is closed
    if ($('#legend-content').length && $('#floating-legend').length) {
        $('#floating-legend').append($('#legend-content'));
    }
    const cloneLeftTarget = document.getElementById('cloneLeftTarget');
    if (cloneLeftTarget) {
        cloneLeftTarget.style.display = '';
    }
    let preferredLegendPosition = 'right';
    try {
        preferredLegendPosition = window._cachedLegendPosition || localStorage.getItem('legendPosition') || 'right';
    } catch (e) { /* ignore */ }
    const shouldForceFloating = preferredLegendPosition === 'right' && !window._floatingLegendManuallyClosed && !window._timelineLegendAllowSidebar;
    if (shouldForceFloating) {
        $('#floating-legend').show();
        $('#floating-legend').css('opacity', '1');
        $('#floating-legend').css('display', 'block');
    } else {
        $('#floating-legend').hide();
        $('#floating-legend').css('opacity', '0');
        $('#floating-legend').css('display', 'none');
    }
    // Rebuild legend only when content is actually missing.
    if (typeof window.buildFloatingLegendFromChart === 'function') {
        const hasLegendRows = document.querySelector('#legend-content .legend-item, #legend-content .region-section, #legend-content .locations-flat-list');
        if (!hasLegendRows) {
            setTimeout(() => {
                try { window.buildFloatingLegendFromChart(); } catch(e) {}
            }, 100);
        }
    }
    try {
        if (typeof window.updateBottomLegendVisibility === 'function') {
            setTimeout(() => window.updateBottomLegendVisibility(), 130);
        }
    } catch (e) { /* ignore */ }
    // Trigger overlay legend visibility update for timeline page
    if (typeof window.updateOverlayLegendVisibility === 'function') {
        setTimeout(() => window.updateOverlayLegendVisibility(), 150);
    }
    return;

    $("#sideIcons").show();
    $("#side-nav").removeClass("main-nav-full")
    $("#main-nav").hide();
    $("#showNavColumn").show();
    $("#showSideFromBar").hide();
    //////$('body').removeClass('bodyLeftMargin');
    //////$('body').removeClass('bodyLeftMarginFull');
    if (!$('body').hasClass('bodyRightMargin')) {
        $('body').removeClass('mobileView');
    }
}
function toggleDiv(theClass) {
    const divsToToggle = document.querySelectorAll(theClass);
    const elements = document.querySelectorAll(theClass);
    let elementDisplay = "none";
    for (let i = 0; i < elements.length; i++) { // Allows for multoiple instances of class or id
        if (elements[i].style.display === 'none') {
          elementDisplay = "block";
        }
    }
    divsToToggle.forEach((div) => {
        div.style.display = elementDisplay;
    });

    //const toggleBtn = thisDiv;
    //const toggleContent = toggleBtn.nextElementSibling;
    //event.target.nextElementSibling.style.display = 'block';

    //alert("toggle2");

    /*
    const toggleContainer = document.querySelector('.toggle-container');

    toggleContainer.addEventListener('click', (event) => {
      alert("toggleContainer click");
      if (event.target.classList.contains('toggle-btn')) {
        const toggleBtn = event.target;
        const toggleContent = toggleBtn.nextElementSibling;

        toggleContent.style.display = toggleContent.style.display === 'none' ? 'block' : 'none';
      }
    });
    */
}
function iNav(set) {
    let hash = getHashOnly();
    hash.set = set;
    if (set=="air") {
        hash.indicators = "GHG,GCC,MGHG,OGHG,HRSP,OZON,SMOG,HAPS";
    } else if (set=="water") {
        hash.indicators = "WATR,ACID,EUTR,ETOX";
    } else if (set=="land") {
        hash.indicators = "LAND,MNRL,PEST,METL,CRHW,CMSW,FMSW,CCDD";
    } else if (set=="energy") {
        hash.indicators = "ENRG,NNRG,RNRG";
    } else if (set=="health") {
        hash.indicators = "HTOX,HCAN,HNCN,HTOX,HRSP";
    } else if (set=="prosperity") {
        hash.indicators = "VADD,JOBS";
    }
    delete hash.geoview;
    let hashString = decodeURIComponent($.param(hash)); // decode to display commas in URL
    if (location.href.indexOf('/info') == -1) {
        //updateHash({"geoview":""}); // Close location filter before redirect.
        location.href = local_app.web_root() + "/localsite/info/#" + hashString;
    } else {
        goHash({"set":set,"indicators":hash.indicators});
    }
}

// Setup toggle buttons for Locations/Continents view in sidebar
function setupSidebarViewToggle() {
    const locationsBtn = document.getElementById('sidebar-locations-btn');
    const continentsBtn = document.getElementById('sidebar-continents-btn');

    if (!locationsBtn || !continentsBtn) return;
    const setAllRegionSectionsOpen = (open) => {
        try {
            const state = {};
            document.querySelectorAll('#legend-content .region-section').forEach((section) => {
                const key = section.getAttribute('data-continent') || '';
                const panel = section.querySelector('.country-buttons-region');
                const toggle = section.querySelector('.region-toggle');
                const arrow = section.querySelector('.toggle-arrow');
                if (panel) panel.style.display = open ? 'block' : 'none';
                if (arrow) arrow.style.transform = open ? 'rotate(0deg)' : 'rotate(-90deg)';
                if (toggle) toggle.style.background = open ? 'rgba(248,249,250,0.9)' : 'rgba(232,236,240,0.9)';
                if (key) state[key] = !!open;
            });
            window._legendContinentSectionState = state;
            window._legendContinentAllOpen = !!open;
            if (typeof window.syncLegendContinentStateFromDom === 'function') window.syncLegendContinentStateFromDom();
        } catch (e) { /* ignore */ }
    };
    const toggleAllRegionSections = () => {
        try {
            let panels = Array.from(document.querySelectorAll('#legend-content .country-buttons-region'));
            if (panels.length === 0) {
                if (typeof buildFloatingLegendFromChart === 'function') {
                    buildFloatingLegendFromChart();
                }
                panels = Array.from(document.querySelectorAll('#legend-content .country-buttons-region'));
                if (panels.length === 0) return;
                setAllRegionSectionsOpen(true);
                return;
            }
            const anyClosed = panels.some((panel) => panel.style.display === 'none');
            setAllRegionSectionsOpen(anyClosed);
        } catch (e) { /* ignore */ }
    };

    const updateToggleState = () => {
        const mode = window._legendViewMode || 'locations';
        if (mode === 'continents') {
            locationsBtn.classList.remove('active');
            continentsBtn.classList.add('active');
        } else {
            locationsBtn.classList.add('active');
            continentsBtn.classList.remove('active');
        }
        // Also sync floating legend toggle if it exists
        const floatingLocBtn = document.getElementById('view-locations-btn');
        const floatingContBtn = document.getElementById('view-continents-btn');
        if (floatingLocBtn && floatingContBtn) {
            if (mode === 'continents') {
                floatingLocBtn.classList.remove('active');
                floatingContBtn.classList.add('active');
            } else {
                floatingLocBtn.classList.add('active');
                floatingContBtn.classList.remove('active');
            }
        }
    };

    locationsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window._legendViewMode !== 'locations') {
            window._legendViewMode = 'locations';
            updateToggleState();
            if (typeof buildFloatingLegendFromChart === 'function') {
                buildFloatingLegendFromChart();
            }
        }
    });

    continentsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window._legendViewMode !== 'continents') {
            window._legendViewMode = 'continents';
            updateToggleState();
            if (typeof buildFloatingLegendFromChart === 'function') {
                buildFloatingLegendFromChart();
            }
        } else {
            toggleAllRegionSections();
        }
    });

    // Initialize toggle state
    updateToggleState();
}

function toggleShowNavColumn() {
    // Original showNavColumn behavior
    if ($("body").hasClass("sidebar-hidden")) {
        //alert("showNavColumn")
        showNavColumn();
    } else {
        hideNavColumn();
    }
    let headerFixedHeight = $("#headerLarge").height();
    $('#cloneLeft').css("top",headerFixedHeight + "px");
}
let localsiteTitle = "";
function applyNavigation() { // Waits for localsite.js 'localStart' variable so local_app path is available.

    // To do: fetch the existing background-image.

    let hash = getHash();
    let modelsite = Cookies.get('modelsite');

    // Allow URL parameter to override cookie for testing
    if (hash.site) {
        modelsite = hash.site;
        // Optionally set cookie for persistence across page loads
        if (typeof Cookies != 'undefined') {
            Cookies.set('modelsite', hash.site);
        }
    }
    const changeFavicon = link => { // var for Safari
      let $favicon = document.querySelector('link[rel="icon"]')
      // If a <link rel="icon"> element already exists,
      // change its href to the given link.
      if ($favicon !== null) {
        $favicon.href = link
        // Otherwise, create a new element and append it to <head>.
      } else {
        $favicon = document.createElement("link")
        $favicon.rel = "icon"
        $favicon.href = link
        document.head.appendChild($favicon)
      }
    }
    if (modelsite=="dreamstudio" || modelsite=="planet.live" || location.href.indexOf("dreamstudio.com") >= 0 || param.startTitle == "DreamStudio" || location.href.indexOf("/swarm/") >= 0 || location.href.toLowerCase().indexOf("lineara") >= 0 || location.href.indexOf("planet.live") >= 0) {
        param.titleArray = [];
        let siteRoot = "";
        localsiteTitle = "DreamStudio";
        $(".siteTitleShort").text("DreamStudio");
        
        if (location.host.indexOf("localhost") >= 0) {
            siteRoot = "/dreamstudio";
        }
        param.headerLogoNoText = "<img src='/localsite/img/logo/dreamstudio/favicon.png' style='float:left;width:38px;margin-right:7px'>";
        if (modelsite=="planet.live" || location.href.indexOf("planet.live") >= 0) {
            localsiteTitle = "Planet.Live"
            $(".siteTitleShort").text("Planet.Live")
            param.headerLogoSmall = "<img src='/localsite/img/logo/planetlive/faveye-lg.png' style='width:40px;opacity:0.85'>"
            param.titleArray = ["planet","live"]
            param.headerLogoNoText = "<img src='/localsite/img/logo/planetlive/faveye-lg.png' style='float:left;width:38px;margin-right:7px'>";
            //param.headerLogo = "<a href='" + siteRoot + "/'><img src='/localsite/img/logo/planetlive/faveye-lg.png' style='float:left;width:38px;margin-right:16px'><img src='https://planet.live/video/img/logo/planet-live-text.png' alt='Planet.Live' style='height:16px; margin-top:15px' class='headerLogoDesktop'></a>";
            param.headerLogo = "<a href='" + siteRoot + "/'><img src='/localsite/img/logo/planetlive/faveye-lg.png' style='float:left;width:38px;margin-right:10px'><img src='/localsite/img/logo/planetlive/planet.live.png' alt='planet.live' style='height:24px; margin-top:8px' class='headerLogoDesktop'></a>";
            
            // Quick fix, need to adjust for period in class name on datah page.
            showClassInline(".planetlive");
        } else {
            if (!param.headerLogo) {
                param.headerLogo = "<a href='" + siteRoot + "/'><img src='/localsite/img/logo/dreamstudio/favicon.png' style='float:left;width:38px;margin-right:7px'><img src='/localsite/img/logo/dreamstudio/text.png' alt='DreamStudio' style='height:22px; margin-top:9px' class='headerLogoDesktop'></a>";
            }
            showClassInline(".dreamstudio");
        }
        if (param.icon) {
            changeFavicon(param.icon);
        } else if (location.href.indexOf("planet.live") >= 0 || location.href.indexOf("datahaus") >= 0) {
            changeFavicon("/localsite/img/logo/planetlive/faveye-lg.png");
        } else {
            changeFavicon("/localsite/img/logo/dreamstudio/favicon.png");
        }
        if (location.host.indexOf("dreamstudio") >= 0) {
            //param.headerLogo = param.headerLogo.replace(/\/dreamstudio\//g,"\/");
        }
        
        // modelsite will not always be available
        //alert("modelsite " + modelsite)
        //showClassInline("." + modelsite); // Not working for planet yet

    } else if (location.href.indexOf("atlanta") >= 0) {
        showLeftIcon = true;
        $(".siteTitleShort").text("Civic Tech Atlanta");
        param.titleArray = ["civic tech","atlanta"]
        param.headerLogo = "<a href='https://codeforatlanta.org'><img src='" + local_app.web_root() + "/community/img/logo/orgs/civic-tech-atlanta-text.png' style='width:186px;padding-top:8px'></a>";
        
        localsiteTitle = "Civic Tech Atlanta";
        changeFavicon(local_app.web_root() + "/localsite/img/logo/neighborhood/favicon.png")
        showClassInline(".neighborhood");
        earthFooter = true;
        showClassInline(".georgia"); // Temp side nav
        showClassInline(".earth"); // Temp side nav

    // Skips pages with custom site titles in param.titleArray
    } else if ((modelsite=="model.georgia" && location.host.indexOf('localhost') >= 0 && !Array.isArray(param.titleArray)) || (defaultState == "GA" && !Array.isArray(param.titleArray) && location.host.indexOf('localhost') >= 0 && navigator && navigator.brave)   || param.startTitle == "Georgia.org" || location.host.indexOf("georgia") >= 0 || location.host.indexOf("locations.pages.dev") >= 0) {

        // To show locally for Brave Browser only - insert before:  ) || false
        // && navigator && navigator.brave
        if (!param.state && !hash.state) {
            if (param.geoview != "earth") {
                if (onlineApp && defaultState) {
                    param.state = defaultState; // For longer displayBigThumbnails menu in navigation.js
                }
            }
        }
        showLeftIcon = true;
        $(".siteTitleShort").text("Model Georgia");
        param.titleArray = [];
        console.log("local_app.localsite_root() " + local_app.localsite_root()); // https://model.earth was in here: https://map.georgia.org/localsite/map/#show=recyclers
        param.headerLogo = "<a href='https://georgia.org'><img src='" + local_app.web_root() + "/localsite/img/logo/states/GA.png' style='width:160px;margin-top:0px'></a>";
        param.headerLogoNoText = "<a href='https://georgia.org'><img src='" + local_app.web_root() + "/localsite/img/logo/states/GA-icon.png' style='width:52px;padding:0px;margin-top:-2px'></a>";
        localsiteTitle = "Georgia.org";
        changeFavicon(local_app.web_root() + "/localsite/img/logo/states/GA-favicon.png");
        if (location.host.indexOf('localhost') >= 0) {
            showClassInline(".acct");
            showClassInline(".garesource");
            showClassInline(".georgia");
        } else if (location.host.indexOf("locations.pages.dev") >= 0 || location.host.indexOf("locations.georgia.org") >= 0) {
            showClassInline(".acct");
            showClassInline(".garesource");
        } else {
            showClassInline(".georgia");
        }
        showClassInline(".geo");
        
        if (location.host.indexOf("locations.pages.dev") >= 0 || location.host.indexOf("locations.georgia.org") >= 0) {
            // To activate when filter are ready
            //showClassInline(".earth");
        }
        $('#headerOffset').css('display', 'block'); // Show under site's Drupal header
        if (location.host.indexOf('localhost') >= 0) {
            //showClassInline(".earth"); // Show extra side nav
            earthFooter = true;
        }
    } else if ((modelsite=="neighborhood.org" || param.startTitle == "Neighborhood.org" || location.host.indexOf('neighborhood.org') >= 0)) {
        showLeftIcon = true;
        param.titleArray = ["neighbor","hood"]
        param.headerLogoSmall = "<img src='" + local_app.web_root() + "/localsite/img/logo/neighborhood/favicon.png' style='width:40px;opacity:0.7'>"
        localsiteTitle = "Neighborhood.org";
        changeFavicon(local_app.web_root() + "/localsite/img/logo/neighborhood/favicon.png")
        showClassInline(".neighborhood");
        showClassInline(".earth");
        earthFooter = true;
    } else if (modelsite=="democracylab" || location.host.indexOf("democracylab") >= 0) {
        if (location.host.indexOf('localhost') >= 0) {
            showLeftIcon = true;
            earthFooter = true;
        } else {
            showLeftIcon = false;
        }
        param.showLeftIcon = false;
        localsiteTitle = "DemocracyLab 2.0";
        changeFavicon(local_app.web_root() + "/localsite/img/logo/democracylab/favicon.png")
        $(".siteTitleShort").text("Democracy Lab");
        param.titleArray = ["democracy","lab"]
        //param.headerLogo = "<img src='" + local_app.web_root() + "/localsite/img/logo/partners/democracylab/democracy-lab-2.png' style='width:190px;margin-top:15px'>";
        param.headerLogo = "<a href='/'><img src='https://neighborhood.org/community/img/logo/orgs/democracy-lab-2.png' style='width:170px;margin-top:10px'></a>";
        
        //param.headerLogoSmall = "<img src='" + local_app.web_root() + "/localsite/img/logo/partners/democracylab/democracy-lab-icon.jpg' style='width:32px;margin:4px 8px 0 0'>";
        param.headerLogoSmall = "<img src='https://neighborhood.org/community/img/logo/orgs/democracy-lab-2.png' style='width:120px;margin:4px 8px 0 0'>";
        //param.headerLogoNoText = "<a href='https://democracylab2.org'><img src='https://neighborhood.org/community/img/logo/orgs/democracy-lab-2.png' style='width:50px;padding-top:0px;margin-top:-1px'></a>";
        showClassInline(".dlab");
    } else if (modelsite=="membercommons" || location.host.indexOf("membercommons.org") >= 0) {
        localsiteTitle = "MemberCommons";
        $(".siteTitleShort").text("MemberCommons");
        param.titleArray = ["Member","Commons"];
        param.headerLogoSmall = "<img src='" + local_app.web_root() + "/localsite/img/logo/neighborhood/favicon.png' style='width:40px;opacity:0.7'>"
        changeFavicon(local_app.web_root() + "/localsite/img/logo/neighborhood/favicon.png")
        showClassInline(".membercommons");
    } else if (!Array.isArray(param.titleArray) && !param.headerLogo) {
    //} else if (location.host.indexOf('model.earth') >= 0) {
        showLeftIcon = true;
        $(".siteTitleShort").text("Model Earth");
        param.titleArray = ["model","earth"];
        localsiteTitle = "Model Earth";
        param.headerLogoSmall = "<img src='" + local_app.web_root() + "/localsite/img/logo/modelearth/model-earth.png' style='width:34px; margin-right:2px' class='logoTopPadding'>";
        
        // Works correctly for model.earth sitemodel, but not reached by geo.
        //alert("changeFavicon")
        changeFavicon(local_app.web_root() + "/localsite/img/logo/modelearth/model-earth.png")
        showClassInline(".earth");
        console.log(".earth display");
        earthFooter = true;
    }
    if (localStorage.state == "GA") {
        showClassInline(".garesource");
    }
    if (document.title) {
        document.title = localsiteTitle + " - " + document.title;
    } else {
        document.title = localsiteTitle;
    }

    if (location.host.indexOf('model.earth') >= 0) { // Since above might not be detecting model.earth, probably is now.
        showLeftIcon = true;
        earthFooter = true;
    }

    if (param.footer || param.showfooter == false) {
        earthFooter = false;
        console.log("param.footer " + param.footer);
    }
    // Load when body div becomes available, faster than waiting for all DOM .js files to load.
    waitForElm('#bodyloaded').then((elm) => {
        $("body").wrapInner( "<div id='main-content'></div>"); // Innermost. Wraps existing. A column to the right of other children.
        $("body").wrapInner( "<div id='main-container'></div>"); // Creates space for main-nav to the left of #main-content.
        $("body").wrapInner("<main id='main-layout' class='flexmain'></main>"); // Outermost. So footer resides at bottom.
        
        //$("body").addClass("flexbody"); // For left - No longer adding left of header.
        // min-height allows header to serve as #filterbaroffset when header.html not loaded
        // pointer-events:none; // Avoid because sub-divs inherite and settings dropdowns are then not clickable.
        if(document.getElementById("datascape") == null) {
            $("#main-content").prepend("<div id='datascape' class='datascape' style='displayX:none'></div>\r");
        }
        //// Move main-nav back to immediately in body
        //const sideNav = document.getElementById("side-nav");
        //if (sideNav) {
        //    document.body.insertBefore(sideNav, document.body.firstChild);
        //} else {
        //    console.log("#side-nav not found");
        //}
    });
    waitForElm('#datascape').then((elm) => {
        
        /*
        if(document.getElementById("datascape") != null || document.getElementById("datascape1") != null) {
            $("#datascape").addClass("datascape");
            $("#datascape").addClass("datascapeEmbed");
            $("#main-content > #datascape").removeClass("datascapeEmbed");  // When #datascape is NOT embedded.
            if (!$("#datascape").hasClass("datascapeEmbed")) {
                $("#datascape").addClass("datascapeTop");
            }

            //////$('body').removeClass('bodyLeftMarginFull'); // Gets added back if main-nav is displayed.
            // Wait for template to be loaded so it doesn't overwrite listcolumn in #datascape.
            //waitForElm('#insertedText').then((elm) => {
            waitForElm('#main-content > .datascapeTop').then((elm) => { // When #datascape is NOT embedded.
                // Place list in left margin for whole page use.
                //$("#datascape").prepend(listColumnElement);
                $("body").prepend(listColumnElement);
                listColumnElement = "";
                ////// //$('body').addClass('bodyLeftMarginFull'); // Avoid here. Places gap on /community
            });
            
        } else {
            console.log("#datascape not available");
        }
        */

        waitForElm('#side-nav-absolute').then((elm) => {
            // For map list
            let listColumnElement = "<div id='listcolumn' class='listcolumn pagecolumn sidelist pagecolumnLow pagecolumnLower' style='display:none'><div class='listHeader'><div class='hideSideList nav-x' style='position:absolute;right:0;top:0;z-index:1;margin-top:0px'>✕</div><h1 class='listTitle'></h1><div class='listSubtitle'></div><div class='sideListSpecs'></div></div><div id='listmain'><div id='listcolumnList'></div></div><div id='listInfo' class='listInfo content'></div></div>\r";
        
            if(document.getElementById("main-nav") == null) {
                let prependTo = "#side-nav-absolute";
                // Includes listColumnElement with #listcolumn
                $(prependTo).append("<div id='main-nav' class='main-nav pagecolumn noprint sidecolumnLeft pagecolumnLow liteDiv' style='display:none; min-height:300px'><div class='hideSide main-nav-close-btn nav-x' style='position:absolute;right:8px;top:8px;z-index:1;margin-top:0px'>✕</div><div class='navcolumnBar'></div><div class='main-nav-scroll'><div id='navcolumnTitle' class='maincat' style='display:none'></div><div id='listLeft'></div><div id='cloneLeftTarget'></div></div></div>" + listColumnElement); //  listColumnElement will be blank if already applied above.
                $("#mapFilters").prependTo($("#main-layout"));
            } else {
                // TODO - change to fixed when side reaches top of page
                console.log("navigation.js report: main-nav already exists")
                $("#main-nav").addClass("main-nav-inpage");
            }
        });

        $(document).on("click", ".showNavColumn", function(event) {
            console.log(".showNavColumn click");
            toggleShowNavColumn();
        });
        $(document).on("click", ".hideSideList", function(event) {
            hideSide("list");
            event.stopPropagation();
            event.preventDefault();
        });
        $(document).on("click", ".hideSide", function(event) {
            hideSide("list");
            //////$('body').removeClass('bodyLeftMarginNone'); // For DS side over hero
            console.log(".hideSide click");
        });

        $(document).on("click", ".showNavColumn, #main-nav", function(event) {
          event.stopPropagation();
        });
        $(document).on('click', function(event) {
            if ($("#main-nav").is(':visible')) {
                if ($('#main-container').width() <= 800) {
                    //hideSide();
                }
            }
        });
        if (param["showapps"] && param["showapps"] == "false") {
            $(".showApps").hide();
            $("#appSelectHolder").hide();
        }
        if (param["showheader"] && param["showheader"] == "false") {

            //$(".filterPanel").addClass("filterPanel_fixed"); // This cause everything but top nav to disappear.
            //$(".filterbarOffset").hide();
            $(".headerOffset").hide();
            $("#headeroffset").hide();
            $(".headerOffset").hide();
            $("#headerbar").addClass("headerbarhide");

            // Insert for map filters since header.html file is not loaded.
            //$("body").prepend( "<div id='filterbaroffset' style='height:56px; pointer-events:none'></div>");

            // TO DO: Add support for custom headerpath

        } else {

            $(".headerOffset").show();
            $("#headeroffset").show();
            $(".headerOffset").show();

            // LOAD HEADER.HTML
            //if (earthFooter) {
                let headerFile;

                /*
                const current_code_path = page_scripts[page_scripts.length-1].src;
                console.log("current_code_path " + current_code_path);
                const slash_count = (current_code_path.match(/\//g) || []).length; // To set path to header.html
                if (slash_count <= 4) { // Folder is the root of site
                    // Currently avoid since "https://model.earth/" is prepended to climbpath above.
                    //headerFile = climbpath + "../header.html";
                }
                */

                if (param.header) {
                    headerFile = local_app.web_root() + param.header;
                } else if (param.headerFile) {
                    modelpath = ""; // Use the current repo when custom headerFile provided. Allows for site to reside within repo.
                    headerFile = param.headerFile;
                } else {
                    headerFile = local_app.web_root() + "/localsite/header.html";
                }

                //if (earthFooter && param.showSideTabs != "false") { // Sites including modelearth and neighborhood
                //  $(".showSideTabs").show(); // Before load headerFile for faster display.
                //}
                if (headerFile) {
                    // headerFile contains only navigation
                    //alert("headerFile " + headerFile);
                    waitForElm('#local-header').then((elm) => { 
                    $("#local-header").load(headerFile, function( response, status, xhr ) {
                        waitForElm('#sidecolumnContent').then((elm) => { // Resides in header.html
                            //alert("got sidecolumnContent");
                            console.log("Doc is ready, header file loaded, place #cloneLeft into #main-nav")

                            waitForElm('#main-nav').then((elm) => { // #main-nav is appended by this navigation.js script, so typically not needed.
                                $("#showNavColumn").show();
                                if(location.host.indexOf("dreamstudio") >= 0 || location.host.indexOf("planet.live") >= 0) {
                                    $("#sidecolumnContent a").each(function() {
                                      $(this).attr('href', $(this).attr('href').replace(/\/dreamstudio\//g,"\/"));
                                    });
                                }
                                let colEleLeft = document.querySelector('#sidecolumnContent');
                                let colCloneLeft = colEleLeft.cloneNode(true)
                                colCloneLeft.id = "cloneLeft";
                                $("#cloneLeftTarget").append(colCloneLeft);

                                waitForElm('#resourcesMenu').then((elm) => { // From info/template-main.html
                                    let colEleRight = document.querySelector('#sidecolumnContent');
                                    let colCloneRight = colEleRight.cloneNode(true)
                                    colCloneRight.id = "cloneRight";

                                    $("#sectionsMenu").prepend(colCloneRight);

                                    if (location.href.indexOf('desktop') >= 0 || modelsite=="dreamstudio" || location.host.indexOf('dreamstudio') >= 0 || location.href.indexOf('dreamstudio') >= 0 || location.href.indexOf('/swarm/') >= 0 || location.href.indexOf('/LinearA/') >= 0 || location.href.indexOf("planet.live") >= 0 || modelsite=="planet.live") {
                                        let prependFolder = "";
                                        let storiesFile = "https://dreamstudio.com/seasons/episodes.md";
                                        //console.log("location.href index: " + location.href.indexOf("/dreamstudio/"));
                                        if(location.host.indexOf('localhost') >= 0 && location.pathname.toLowerCase().indexOf('/dreamstudio') === 0) {
                                            prependFolder = "/dreamstudio"
                                            storiesFile = prependFolder + "/seasons/episodes.md";
                                        } else if (location.href.indexOf("dreamstudio") >= 0 || location.href.indexOf("planet.live") >= 0) {
                                            storiesFile = "/seasons/episodes.md";
                                        }
                                        waitForElm('#storiesDiv').then((elm) => {
                                            // TO DO - Lazy load elsewhere, and avoid if already loaded
                                            loadMarkdown(storiesFile, "storiesDiv", "_parent");
                                            //alert("after storiesFile")
                                            let resourcesFile = prependFolder + "/resources.md";
                                            loadMarkdown(resourcesFile, "resourcesMenu", "_parent");
                                        });
                                    }
                                });

                            });

                            // Move filterbarOffset and filterEmbedHolder immediately after body tag start.
                            // Allows map embed to reside below intro text and additional navigation on page.

                            //if (param.showSideTabs != "false") { // brig
                            
                            $("#filterEmbedHolder").insertAfter("#headeroffset");
                            ////$(".filterbarOffset").insertAfter("#headeroffset");
                            
                            //$(".filterbarOffset").insertAfter("#headerLarge");

                            // Not needed since moved into header.html
                            //$(".filterbarOffset").insertAfter("#headeroffset");

                            //$(".filterbarOffset").insertAfter("#header");
                            //$('body').prepend($(".filterbarOffset"));

                            //$(".filterbarOffset").hide();

                            // Make paths relative to current page
                            // Only updates right side navigation, so not currently necessary to check if starts with / but doing so anyway.
                            $("#local-header a[href]").each(function() {
                              if($(this).attr("href").toLowerCase().indexOf("http") < 0) {
                                if($(this).attr("href").indexOf("/") != 0) { // Don't append if starts with /
                                    //alert($(this).attr('href'))
                                    $(this).attr("href", modelpath + $(this).attr('href'));
                                }
                              }
                            });
                            $("#local-header img[src]").each(function() {
                                if($(this).attr("src").toLowerCase().indexOf("http") < 0) {
                                    if($(this).attr("src").indexOf("/") == 0) { // Starts with slash
                                        $(this).attr("src", local_app.web_root() + $(this).attr('src'));
                                    } else {
                                    $(this).attr("src", modelpath + $(this).attr('src'));
                                }
                              }
                            });

                            if(location.host.indexOf('neighborhood') >= 0) {
                                // Since deactivated above due to conflict with header logo in app.
                                $('.neighborhood').css('display', 'block');
                            }
                            waitForElm('#headerSiteTitle').then((elm) => { // Resides in template-main.html
                                if (param.titleArray && !param.headerLogo) {
                                    if (param.titleArray[1] == undefined) {
                                        if (param.titleArray[0] != undefined) {
                                            $('#headerSiteTitle').html(param.titleArray[0]);
                                        }
                                    } else {
                                        //let titleValue = "<span style='float:left'><a href='" + climbpath + "' style='text-decoration:none'>";
                                        let titleValue = "<span style='float:left'><a href='/' style='text-decoration:none'>";
                                        
                                        let modelsite = Cookies.get('modelsite');
                                        if (!param.titleArray && modelsite && modelsite.length && modelsite != "model.earth") {
                                            param.titleArray = modelsite.split(".");
                                        }
                                        titleValue += "<span style='color: #777;'>" + param.titleArray[0] + "</span>";
                                        for (var i = 1; i < param.titleArray.length; i++) {
                                            titleValue += "<span id='titleTwo' style='color:#bbb;margin-left:1px'>" + param.titleArray[i] + "</span>";
                                        }
                                        
                                        titleValue += "</a></span>";
                                        
                                            $('#headerSiteTitle').html(titleValue);
                                        

                                        let theState = $("#state_select").find(":selected").text();
                                        if (theState) {
                                            //$(".locationTabText").text(theState);
                                        }
                                    }
                                }
                            });

                            if (param.favicon) {
                                changeFavicon(param.favicon);
                            }

                            // Equivalent to checking for #headerbar, but using #localsiteDetails since template pages already have a #headerbar.
                            //waitForElm('#localsiteDetails').then((elm) => {
                            waitForElm('#headerbar').then((elm) => {
                                //alert("climbpath value: " + climbpath);

                                waitForElm('#headerLogo').then((elm) => {
                                    if (!param.headerLogo && param.headerLogoSmall) {
                                        $('#headerLogo').html("<a href='" + climbpath + "' style='text-decoration:none'>" + param.headerLogoSmall + "</a>");
                                    } else if (param.headerLogo) {
                                        //alert("Display param.headerLogo")
                                        $('#headerLogo').html("<a href='" + climbpath + "' style='text-decoration:none'>" + param.headerLogo + "</a>");
                                    } else if (param.favicon) {
                                        let imageUrl = climbpath + ".." + param.favicon;
                                        $('#headerLogo').css('background-image', 'url(' + imageUrl + ')');
                                        $('#headerLogo').css('background-repeat', 'no-repeat');
                                    }
                                });

                                // Resides in map/filter.html
                                waitForElm('#logoholderbar').then((elm) => { // Note, #logoholderbar becomes available after #localsiteDetails
                                    if (param.headerLogoSmall) {
                                        $('#logoholderbar').html("<a href='" + climbpath + "' style='text-decoration:none'>" + param.headerLogoSmall+ "</a>");
                                    } else if (param.headerLogoNoText) {
                                        $('#logoholderbar').html("<a href='" + climbpath + "' style='text-decoration:none'>" + param.headerLogoNoText + "</a>");
                                    } else if (param.headerLogo) {
                                        $('#logoholderbar').html("<a href='" + climbpath + "' style='text-decoration:none'>" + param.headerLogo + "</a>");
                                    }
                                });

                                
                                // END WAS LIMITED TO HEADER
                                $(".headerOffset").show();
                                //$("#local-header").append( "<div id='filterbaroffset' style='display:none;height:56px; pointer-events:none; display:none'></div>"); // Might stop using now that search filters are in main.
                                if ($("#filterFieldsHolder").length) {
                                    //$("#filterbaroffset").css('display','block');
                                }

                                // Slight delay
                                setTimeout( function() {
                                    if ($("#filterFieldsHolder").length) {
                                        $("#filterbaroffset").css('display','block');
                                    }
                                }, 200);
                                setTimeout( function() {
                                    if ($("#filterFieldsHolder").length) {
                                        $("#filterbaroffset").css('display','block');
                                    }
                                }, 1000);

                                activateSideColumn();

                                if (location.host.indexOf('localhost') >= 0 && earthFooter) {
                                    showLeftIcon = true;
                                }
                            });
                            if (param["showheader"] && param["showheader"] == "false") {
                                // Don't show header
                                $("#headerbar").addClass("headerbarhide");
                            }
                        });
                    }); // End $("#header").load
                
                    });
                } // End header.html sidenav

                //waitForElm('#/icon?family=Material+Icons').then((elm) => {
                    // Only apply if id="/icon?family=Material+Icons" is already in DOM.
                    // Running here incase header has not loaded yet when the same runs in localsite.js.
                    if (document.getElementById("/icon?family=Material+Icons")) {
                        $(".show-on-load").removeClass("show-on-load");
                    }
                //});
            //}
        }

        if (param.headerFile) {
            //$(document).ready(function () {
            setTimeout( function() {
                //$('body').prepend($("#local-header"));
                $('.headerOffsetOne').prepend($("#local-header"));

                //$("#headerLarge").hide();
            }, 1000);
            //});
        }

        /*
        var link = document.querySelector("link[rel~='icon']");
        alert("link " + link);
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = 'https://stackoverflow.com/favicon.ico';
        */

        if(document.getElementById("footer") == null) {
            $("#main-content").append( "<div id='main-footer' class='flexfooter noprint'></div>\r" );
        } else {
            //$("#footer").addClass("flexfooter");
            $("#footer").prepend( "<div id='main-footer' class='flexfooter noprint'></div>\r" );
        }
        if (location.host.indexOf('localhost') >= 0 && param.showfooter != false && !param.footer) {
            earthFooter = true; // Need to drive localhost by settings in a file ignored by .gitignore
        }
        if (param["showfooter"] && param["showfooter"] == "false") {

        } else if (earthFooter || param.footer || location.href.indexOf("dreamstudio") >= 0 || location.href.indexOf("planet.live") >= 0) {
            var footerClimbpath = "";
            // Had ..
            let footerFile = modelpath + "/localsite/footer.html"; // modelpath remains relative for site desgnated above as having a local copy of io and community.
            if (param.footer) {
                footerFile = param.footer; // Custom

                var footerFilePath = location.pathname + footerFile;
                if (footerFile.indexOf("/") > 0) {
                    footerFilePath = footerFilePath.substr(0, footerFilePath.lastIndexOf("/") + 1); // Remove file name
                }

                console.log("footerFilePath " + footerFilePath);

                var upLevelInstance = (footerFilePath.match(/\.\.\//g) || []).length; // count of ../ in path.

                var climbLevels = ""
                for (var i = 0; i < upLevelInstance; i++) { // Remove ../ for each found
                    climbLevels = climbLevels + "../";
                }       
                footerClimbpath = climbLevels; // Example: ../
                console.log("footerClimbpath (Levels up to current page): " + footerClimbpath);
            } else {
                footerClimbpath = climbpath;
            }
            $("#main-footer").load(footerFile, function( response, status, xhr ) {
                console.log("footerFile: " + footerFile);
                let pageFolder = getPageFolder(footerFile);
                // Append footerClimbpath to relative paths
                makeLinksRelative("main-footer", footerClimbpath, pageFolder);
            });
        }

        // SIDE NAV WITH HIGHLIGHT ON SCROLL

        // Not currently using nav.html. Might use later for overrides. Primary side nav resides in header.
        if (1==2 && param["main-nav"]) {
            // Wait for header to load?

            let targetColumn = "#main-nav";
            // Had ..
            $(targetColumn).load( modelpath + "/localsite/nav.html", function( response, status, xhr ) {
                activateSideColumn();
            });
        }
        // END SIDE NAV WITH HIGHLIGHT ON SCROLL
    });
} // end applyNavigation function


// Load when body div becomes available, faster than waiting for all DOM .js files to load.
waitForElm('#bodyloaded').then((elm) => {
  consoleLog("#bodyloaded becomes available");
  waitForElm('#datascape').then((elm) => { // Wait for navigation.js to set
    let modelsite = Cookies.get('modelsite');
    if(location.host.indexOf('localhost') >= 0 || param["view"] == "local") {
      var div = $("<div />", {
          html: '<style>.local{display:inline-block !important}.local-block{display:block !important}.localonly{display:block !important}.hidelocal{display:none}</style>'
        }).appendTo("body");
    } else {
      // Inject style rule
        var div = $("<div />", {
          html: '<style>.local{display:none}.localonly{display:none}</style>'
        }).appendTo("body");
    }

    // LOAD HTML TEMPLATE - Holds search filters and maps
    // View html source: https://model.earth/localsite/map
    // Consider pulling in HTML before DOM is loaded, then send to page once #datascape is available.

   if (param.insertafter && $("#" + param.insertafter).length) {
      $("#" + param.insertafter).append("<div id='datascape' style='display:none'></div>");
    } else if(document.getElementById("datascape") == null) {
      $('body').prepend("<div id='datascape' style='display:none'></div>");
    }

    if (param.showLeftIcon != false) { // && param.showheader == "true"
      // <div id='sideIcons' class='noprint bothSideIcons' style='displayX:none;z-index:3000'></div>
      //$('body').prepend("<div id='showNavColumn' class='showNavColumn' style='margin-top:64px;'><i class='material-icons show-on-load' style='font-size:35px; opacity:1; background:#fcfcfc; color:#333; padding-left:2px; padding-right:2px; border: 1px solid #555; border-radius:8px; min-width: 38px;'>&#xE5D2;</i></div>");
    }
    waitForElm('#pageControls').then((elm) => {
      // Move to start of pageControls if exists
      //$('#pageControls').prepend($('#sideIcons'));
    });
      

    if (param.showheader == "true" || param.showsearch == "true" || param.display == "everything" || param.display == "locfilters" || param.display == "map") {
      //if (param.templatepage != "true") { // Prevents dup header on map/index.html - Correction, this is needed. param.templatepage can probably be removed.
        //if (param.shownav != "true") { // Test for mentors page, will likely revise
          loadLocalTemplate();
        //}
      //}
    }
    
    // #infoFile - Holds input-output widgets
    // View html source: https://model.earth/localsite/info/template-charts.html
    waitForElm("#main-content").then((elm) => {
      $("#main-content").append("<div id='infoFile'></div>");

      // Move to bottom of main-content
      const infoFile = document.getElementById("infoFile");
      const mainContent = document.getElementById("main-content");
      mainContent.appendChild(infoFile);

      if (param.display == "everything") {
          let infoFileTemplate = theroot + "info/template-charts.html #template-charts"; // Including #template-charts limits to div within page, prevents other includes in page from being loaded.
          //alert("Before template Loaded infoFile: " + infoFile);
          $("#infoFile").load(infoFileTemplate, function( response, status, xhr ) {

            /*
            waitForElm('#industryFilters').then((elm) => {
              alert("Info Template Loaded: " + infoFile);
              $("#industryFilters").appendTo("#append_industryFilters");
            });
            */
          });
      }
    });

    // Move main-footer to the end of main-layout
    
    let foundTemplate = false;
    // When the template (map/index.html) becomes available
    waitForElm('#templateLoaded').then((elm) => {
      foundTemplate = true;
      $("#main-footer").appendTo("#main-content");
    });
    if (foundTemplate == false) { // An initial move to the bottom - occurs when the template is not yet available.
      // Might reactivate
      //$("#main-footer").appendTo("#main-layout");
    }
    
  });
}); // End body ready

$(document).ready(function () {
    $(document).on("click", ".hideMenu", function(event) {
        $("#menuHolder").show();
        $("#menuHolder").css('margin-right','-250px');
        //$("#listingMenu").appendTo($(this).parent().parent());
        event.stopPropagation();
    });
    $(document).on("click", ".imagineLocation", function(event) {
        console.log("imagineLocation")
        imagineLocation();
    });
    $(document).on("click", ".hideAdvanced", function(event) {
        let hash = getHash();
        if (!hash.geoview) {
            $("#filterLocations").hide();
        } else {
            goHash({'locpop':'','geoview':''}); // Triggers closure
        }
    });
    $(document).on("click", ".popAdvanced", function(event) {
        goHash({'locpop':'true'});
    });
    $(document).on("click", ".hideThumbMenu", function(event) {
        $("#bigThumbPanelHolder").hide();
        $(".showApps").removeClass("filterClickActive"); updateHash({'appview':''});
    });
});

// Since we may sometimes load before JQuery avoiding $(document).on("click", ".showSections", function(event) { etc.
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('showSections')) {
        goHash({'sidetab':'sections'});
        event.stopPropagation();
    }
    if (event.target.classList.contains('showResources')) {
        goHash({'sidetab':'resources'});
        event.stopPropagation();
    }
    if (event.target.classList.contains('showTopics')) {
        goHash({'sidetab':'topics'});
        event.stopPropagation();
    }
    if (event.target.classList.contains('showLocale')) {
        goHash({'sidetab':'locale'});
        event.stopPropagation();
    }
    if (event.target.classList.contains('showSettings')) {
        goHash({'sidetab':'settings'});
        event.stopPropagation();
    }
    if (event.target.classList.contains('showAccount')) {
        goHash({'sidetab':'account'});
        event.stopPropagation();
    }
    if (event.target.classList.contains('contactUs')) {
        alert("The Contact Us link is not active.")
        event.stopPropagation();
    }
    if (event.target.classList.contains('shareThis')) {
        window.location = "https://www.addthis.com/bookmark.php?v=250&amp;pub=xa-4a9818987bca104e";
        event.stopPropagation();
    }
    if (event.target.classList.contains('showSeasons')) {
        goHash({'sidetab':'seasons'});
        event.stopPropagation();
    }
    if (event.target.classList.contains('showDesktop')) { // Was .showDesktopNav
        goHash({'sidetab':'home'});
        event.stopPropagation();
    }
});
function showTopics() {
    //closeExpandedMenus(event.currentTarget);
    if (!$.trim($("#mapList1").html())) { // If the location list is not empty, load the list of types.
        $("#bigThumbMenuInner").appendTo("#listingsPanelScroll");
        if (!document.getElementById("#bigThumbMenuInner")) {
            let hash = getHash();
            showThumbMenu(hash.show, "#listingsPanelScroll");
        }
    }
    $(".showTopics").addClass("active");
    $("#listingsPanel").show();
    $("#rightSideTabs").show();
}
function showLocale() {
    $("#filterClickLocation").removeClass("filterClickActive");
    loadScript(theroot + 'js/navigation.js', function(results) { // Since pages like embeds don't pre-load nav
        openMapLocationFilter();
        $("#rightSideTabs").show();
        $("#filterLocations").appendTo($("#localeDiv"));
        $("#geomap").appendTo($("#rightTopMenu"));
        $("#locationFilterHolder").hide(); // Checked when opening with tab.
        $(".showLocale").addClass("active");
        $("#localePanel").show();
    });
}

// SETTINGS
$(document).on("change", "#sitesource", function(event) {
    // Options: Overview or Directory
    sitesource = $("#sitesource").val();
    Cookies.set('sitesource', $("#sitesource").val());
    setSitesource($("#sitesource").val());
    //event.stopPropagation();
});
$(document).on("change", "#sitelook", function(event) { // Dark mode
    if (typeof Cookies != 'undefined') {
        Cookies.set('sitelook', $("#sitelook").val());
    }
    setSitelook($("#sitelook").val());
});
$(document).on("change", "#devmode", function(event) { // Public or Dev
    if (typeof Cookies != 'undefined') {
        Cookies.set('devmode', $("#devmode").val());
    }
    setDevmode($("#devmode").val());
});
$(document).on("change", "#onlinemode", function(event) { // Online or Offline
    if (typeof Cookies != 'undefined') {
        Cookies.set('onlinemode', $("#onlinemode").val());
    }
    if ($("#onlinemode").val() == "false") {
        Cookies.set('showlog','1'); // Could be an icon
    }
    setOnlinemode($("#onlinemode").val());
});
$(document).on("change", "#globecenter", function(event) { // Map center
    if (typeof Cookies != 'undefined') {
        Cookies.set('globecenter', $("#globecenter").val());
    }
    if ($("#globecenter").val() == "me") {
        getGeolocation(); // User gets prompted for location
        $("#globeLatitude").val(localStorage.latitude);
        $("#globeLongitude").val(localStorage.longitude);
        setGlobecenter($("#globecenter").val());
    } else {
        setGlobecenter($("#globecenter").val());
    }
});
$(document).on("change", "#modelsite", function(event) {
    if (typeof Cookies != 'undefined') {
        updateHash({"show":""});
        Cookies.set('modelsite', $("#modelsite").val());

        closeSideTabs();
        // Apply the cookie
        location.reload();
    }
    // Not currently used
    //setModelsite($("#modelsite").val());
});
$(document).on("change", ".sitebasemap", function(event) {
    sitebasemap = $(".sitebasemap").val();
    if (typeof Cookies != 'undefined') {
        Cookies.set('sitebasemap', $(".sitebasemap").val());
    }
    //event.stopPropagation();
});

waitForElm('#mainHero').then((elm) => {
    waitForElm('#mapFilters').then((elm) => {
        $("#showSideFromHeader").hide();
        $("#datascape").prependTo($("#mainHero"));
        $("#filterFieldsHolder").show();
        $("#filterFieldsHolder").addClass("dark");
    });
});
$(document).on("change", "#mainhero", function(event) { // Public or Dev
    if (typeof Cookies != 'undefined') {
        Cookies.set('mainhero', $("#mainhero").val());
    }
    if ($("#mainhero").val() == "globe") {
        getGeolocation(); // User gets prompted for location
        $("#globeLatitude").val(localStorage.latitude);
        $("#globeLongitude").val(localStorage.longitude);
        showEarth("show");
        setGlobecenter($("#globecenter").val());
        $("#mainHero").hide();
    } else {
        $("#globalMapHolder").hide();
        $("#mainHero").show();
        console.log("Not yet fully implemented.");
    }

    if ($("#mainhero").val() == "gitrepo") {
        $("#gitrepoHolder").show();
    } else {
        $("#gitrepoHolder").hide();
    }
});

function setSitesource(sitesource) {
    console.log("setSitesource inactive");
    /*
    if ($("#sitesource").val() == "directory") {
        //$('.navTopHolder').hide();
        $('.navTopInner').hide();
        if (!embedded()) { // Settings would become hidden if embedded.
            $(".topButtons").hide();
        }
        $('.mapBarHolder').hide();
    } else {
        $('.navTopInner').show();
        $('.navTopHolder').show();
    }
    */
}

$(document).on("click", ".showPrintOptions, .print_button", function(event) {
    $('.menuExpanded').hide();
    $('.printOptionsText').show();
    $('.printOptionsHolderWide').show();
    event.stopPropagation();
});

$(document).on("click", ".showTheMenu", function(event) { // Seasons
    console.log("Clicked .showTheMenu");
        $(".navLinks").show();
        //$("#showSideTabs").hide();
    event.stopPropagation();
});

$(document).on("click", ".showSideTabs", function(event) {
    // Prevent any left navigation mobile menu from interfering
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    // Close any open left mobile navigation on mobile devices
    if (window.innerWidth <= 600) {
        const sidenav = document.getElementById('side-nav');
        const overlay = document.getElementById('mobile-overlay');
        if (sidenav?.classList.contains('mobile-open')) {
            sidenav.classList.remove('mobile-open');
            overlay?.classList.remove('active');
        }
    }
    
    let hash = getHash();
    let modelsite = Cookies.get('modelsite');
    if (hash.sidetab) {
        goHash({'sidetab':''});
    } else {
        // && location.host.indexOf("planet.live") >= 0 && modelsite != "planet.live"
        if(location.href.indexOf("/seasons") >= 0) {
            goHash({'sidetab':'seasons'});
        } else {
            goHash({'sidetab':'sections'});
        }
    }
});

$(document).on('click', '.closeParent', function () {
    $(this).parent().fadeOut();
    event.stopPropagation();
});
$(document).on("click", ".closeSideTabs", function(event) {
    goHash({'sidetab':''});
    //closeSideTabs();
    event.stopPropagation();
});
// Function to auto-close right navigation on narrow screens
function autoCloseRightNavOnNarrow() {
    if (window.innerWidth <= 1000) {
        goHash({'sidetab':''});
    }
}

$(document).on("click", ".showEarth", function(event) {
    showEarth("show");
    autoCloseRightNavOnNarrow();
    event.stopPropagation();
});

// Auto-close right navigation when dropdowns change in settings panel on narrow screens
$(document).on("change", ".settingsPanel select", function(event) {
    autoCloseRightNavOnNarrow();
});

// Auto-close right navigation when any input changes in settings panel on narrow screens  
$(document).on("change", ".settingsPanel input", function(event) {
    autoCloseRightNavOnNarrow();
});
function showEarth(show) {
    if ($("#nullschoolHeader").is(':visible') && show != "show") {
        $("#nullschoolHeader").hide();
        //$("#globalMapHolder").show();
        $("#hero_holder").show();
        closeSideTabs();
    } else {
        includeCSS3('/localsite/css/leaflet.css',''); // For zoom icons
        //$("#globalMapHolder").hide(); // Home page nullschool map.
        $("#globalMapHolder").show();

        // TO DO: Close if mobile
        //closeSideTabs();

        $("#hero_holder").hide();
        // Add a setting to choose map: Temperatures or just wind
        // Big blue: https://earth.nullschool.net/#current/wind/surface/level/orthographic=-35.06,40.67,511
        let latLonZoom = "-72.24,46.06,511";
        if (localStorage.latitude && localStorage.longitude) {
            latLonZoom = localStorage.longitude + "," + localStorage.latitude + ",511";
        }
        showGlobalMap(`https://earth.nullschool.net/#current/wind/surface/level/overlay=temp/orthographic=${latLonZoom}`);
    }
}
$(document).click(function(event) { // Hide open menus
    if($("#menuHolder").css('display') !== 'none') {
        $("#menuHolder").hide(); // Since menu motion may freeze when going to another page.
        if (!$(event.target).parents("#menuHolder").length) {
            //event.preventDefault(); // Using requires double click
        }
    }
    //$("#filterLocations").hide();
});

function loadLocalObjectLayers(layerName, callback) { // layerName is not currently used
    //alert("loadLocalObjectLayers " + layerName);
    // Do we need to load this function on init, for state hash for layers requiring a state.

    let hash = getHash();

    // Greenville:
    // https://github.com/codeforgreenville/leaflet-google-sheets-template
    // https://data.openupstate.org/map-layers

    //var layerJson = local_app.community_data_root() + "us/state/GA/ga-layers.json"; // CORS prevents live
    // The URL above is outdated. Now resides here:
    let layerJson = local_app.localsite_root() + "info/data/ga-layers-array.json";
    if(location.host.indexOf("georgia") >= 0) {
        // For B2B Recyclers, since localsite folder does not reside on same server.
        layerJson = "https://model.earth/localsite/info/data/ga-layers-array.json";
        console.log("Set layerJson: " + layerJson);
    }
    if (localObject.layers.length >= 0) {
        callback();
        return;
    }
    let layerObject = (function() {
        //alert("loadLocalObjectLayers layerObject " + layerName);
        if(!localObject.layers) {
            console.log("Error: no localObject.layers");
        }
        $.getJSON(layerJson, function (layers) {

            //console.log("The localObject.layers");
            //console.log(localObject.layers);

            // Create an object of objects so show.hash is the layers key
            $.each(layers, function (i) {

                // To Do, avoid including "item" in object since it is already the key.
                localObject.layers[layers[i].item] = layers[i];

                //$.each(layerObject[i], function (key, val) {
                //    alert(key + val);
                //});
            });

            console.log("The localObject 2");
            console.log(localObject);

            //console.log("The localObject.layers");
            //console.log(localObject.layers);

            let layer = hash.show;
            //alert(hash.show)
            //alert(localObject.layers[layer].state)

            // These should be lazy loaded when clicking menu
            //displayBigThumbnails(0, hash.show, "main");
            //displayHexagonMenu("", layerObject);
            
            if (!hash.show && !param.show) { // INITial load
                if ($("body").width() >= 800) {
                    //showThumbMenu(hash.show, "#bigThumbMenu");
                }
            }
            callback();
            return;
            //return layerObject;
            
        });
    })(); // end layerObject
    
} // end loadLocalObjectLayers

function showThumbMenu(activeLayer, insertInto) {
    $("#menuHolder").css('margin-right','-250px');
    if (insertInto == "#bigThumbMenu") {
       $("#bigThumbPanelHolder").show();
    }
    if (!$(".bigThumbMenuContent").length) {
        displayBigThumbnails(0, activeLayer, "main", insertInto);
    }
    if (insertInto != "#bigThumbMenu") {
        $("#bigThumbPanelHolder").hide();
        $(".showApps").removeClass("filterClickActive"); updateHash({'appview':''});
    } else {
        //$('.showApps').addClass("filterClickActive");
    }
}

function removeFrontFolder(path) {
    //return("../.." + path);
    return(path);
}
function getDirectLink(livedomain,directlink,rootfolder,hashStr) {
    let hash = getHash();
    if (directlink) {
        directlink = removeFrontFolder(directlink);
    } else if (rootfolder) {
        if (rootfolder.indexOf('/explore/') < 0) {
            //rootfolder = "/explore/" + rootfolder;
        }
        directlink = removeFrontFolder(rootfolder + "#" + hashStr);
    } else {
        //directlink = removeFrontFolder("/explore/#" + hashStr);
    }
    if (hash.state && directlink.indexOf('state=') < 0) {
        if (directlink.indexOf('#') >= 0) {
            directlink = directlink + "&state=" + hash.state;
        } else {
            directlink = directlink + "#state=" + hash.state;
        }
    }
    if (livedomain && location.host.indexOf('localhost') < 0) {
        return(livedomain + directlink);
    } else {
        return(directlink);
    }
}
function access(minlevel,alevel) {
    var level = 0;
    if (alevel) { level = parseInt(alevel) }
    if (minlevel >= level) {
        //consoleLog("TRUE minlevel " + minlevel + " level " + level);
        return true;
    } else {
        //consoleLog("FALSE minlevel " + minlevel + " level " + level);
        return false;
    }
}
function displayBigThumbnails(attempts, activeLayer, layerName, insertInto) {
    if (!activeLayer) {
        //activeLayer = "industries";
    }
    loadScript(theroot + 'js/navigation.js', function(results) {
        loadLocalObjectLayers(activeLayer, function() {

          waitForElm('#bigThumbPanelHolder').then((elm) => { //Not needed
            // Setting param.state in navigation.js passes to hash here for menu to use stateAbbr:
            let hash = getHash();

            let stateAbbr = $("#state_select").find(":selected").val();
            if (param.state) { // Bugbug - might need a way to clear param.state
                stateAbbr = param.state.split(",")[0].toUpperCase();
            }
            if (hash.state) {
                        hash.state = hash.state.split(",").filter(s => s.length === 2).join(","); // Remove if not 2-char, including state=all
        stateAbbr = hash.state.split(",")[0].toUpperCase();
            }
            if (stateAbbr && stateAbbr.length > 2) {
                stateAbbr = stateAbbr.substring(0,2);
            }

            // Occurs twice in page
            let modelsite = Cookies.get('modelsite');
            if (!stateAbbr && modelsite) {
                if (modelsite == "model.georgia" || location.host.indexOf("georgia") >= 0 || location.host.indexOf("locations.pages.dev") >= 0) { // Add loop if other states added to settings.
                    stateAbbr = "GA";
                }
            }

            if ($('#bigThumbMenu').length <= 1) {
                console.log("Initial load of #bigThumbMenu");
                var currentAccess = 0;
                $(".bigThumbMenu").html("");

                //$("#bigThumbPanelHolder").show();
                var thelayers = localObject.layers;
                var sectionMenu = "";
                var categoryMenu = "";
                var iconMenu = "";
                var bigThumbSection = layerName;
                var layer;
                for(layer in thelayers) {
                    var menuaccess = 10; // no one
                    try { // For IE error. Might not be necessary.
                        if (typeof(localObject.layers[layer].menuaccess) === "undefined") {
                            menuaccess = 0;
                        } else {
                            menuaccess = localObject.layers[layer].menuaccess;
                        }
                    } catch(e) {
                        consoleLog("displayLayerCheckboxes: no menuaccess");
                    }
                    var linkJavascript = "";
                    var directlink = getDirectLink(thelayers[layer].livedomain, thelayers[layer].directlink, thelayers[layer].rootfolder, thelayers[layer].item);
                    if (bigThumbSection == "main") {
                        if (thelayers[layer].menulevel == "1") {
                            if (access(currentAccess,menuaccess)) {
                                //if (localObject.layers[layer].section == bigThumbSection && localObject.layers[layer].showthumb != '0' && bigThumbSection.replace(/ /g,"-").toLowerCase() != thelayers[layer].item) {
                                
                                    var thumbTitle = ( thelayers[layer].thumbtitle ? thelayers[layer].thumbtitle : (thelayers[layer].section ? thelayers[layer].section : thelayers[layer].primarytitle));
                                    var thumbTitleSecondary = (thelayers[layer].thumbTitleSecondary ? thelayers[layer].thumbTitleSecondary : '&nbsp;');

                                    var icon = (thelayers[layer].icon ? thelayers[layer].icon : '<i class="material-icons">&#xE880;</i>');
                                       if (thelayers[layer].item != "main" && thelayers[layer].section != "Admin" && thelayers[layer].title != "") {
                                            //console.log("Thumb title: " + thelayers[layer].title);
                                            var bkgdUrl = thelayers[layer].image;
                                            if (thelayers[layer].bigthumb) {
                                                bkgdUrl = thelayers[layer].bigthumb;
                                            }
                                            bkgdUrl = removeFrontFolder(bkgdUrl);

                                            
                                            if (thelayers[layer].directlink) { // Omit thumbClick javascript
                                                //hrefLink = "href='" + removeFrontFolder(thelayers[layer].directlink) + "'";
                                            } else if (thelayers[layer].rootfolder && thelayers[layer].rootfolder) {
                                                // Change to pass entire hash

                                                //linkJavascript = 'onclick="window.location = \'/localsite/' + thelayers[layer].rootfolder + '/#show=' + localObject.layers[layer].item + '\';return false;"';
                                                linkJavascript = 'onclick="thumbClick(\'' + localObject.layers[layer].item + '\',\'' + thelayers[layer].rootfolder + '\');return false;"';
                                            //} else if ((directlink.indexOf('/map/') >= 0 && location.pathname.indexOf('/map/') >= 0) || (directlink.indexOf('/info/') >= 0 && location.pathname.indexOf('/info/') >= 0)) {
                                            } else if ((location.pathname.indexOf('/map/') >= 0) || (location.pathname.indexOf('/info/') >= 0)) {
                                                // Stayon page when on map or info
                                                //linkJavascript = "onclick='goHash({\"show\":\"" + localObject.layers[layer].item + "\",\"cat\":\"\",\"sectors\":\"\",\"naics\":\"\",\"go\":\"\",\"m\":\"\"}); return false;'"; // Remain in current page.
                                                linkJavascript = 'onclick="thumbClick(\'' + localObject.layers[layer].item + '\',\'\');return false;"';
                                            } else {
                                                linkJavascript = "";
                                            }

                                            // !thelayers[layer].states || (thelayers[layer].states == "GA" && (!param.state || param.state=="GA")  )
                                            if (menuaccess!=0 || (thelayers[layer].states == "GA")) {
                                                // This one is hidden. If a related state, shown with geo-US13
                                                let hideforAccessLevel = "";
                                                if (menuaccess!=0) { // Also hiddden for access leven
                                                    hideforAccessLevel = "style='display:none'";
                                                }
                                                // TODO: lazy load images only when visible by moving img tag into an attribute.
                                                // TODO: Add geo-US13 for other states
                                                sectionMenu += "<div class='bigThumbMenuContent geo-US13 geo-limited' style='display:none' show='" + localObject.layers[layer].item + "'><div class='bigThumbWidth user-" + menuaccess + "' " + hideforAccessLevel + "><div class='bigThumbHolder'><a href='" + directlink + "' " + linkJavascript + "><div class='bigThumb' style='background-image:url(" + bkgdUrl + ");'><div class='bigThumbStatus'><div class='bigThumbSelected'></div></div></div><div class='bigThumbText'>" + thumbTitle + "</div><div class='bigThumbSecondary'>" + thumbTitleSecondary + "</div></a></div></div></div>";
                                            
                                            } else if (menuaccess==0) { // Quick hack until user-0 displays for currentAccess 1. In progress...
                                                sectionMenu += "<div class='bigThumbMenuContent' show='" + localObject.layers[layer].item + "'><div class='bigThumbWidth user-" + menuaccess + "' style='displayX:none'><div class='bigThumbHolder'><a ";
                                                if (directlink) { // This is a fallback and won't contain the hash values.
                                                    sectionMenu += "href='" + directlink + "' ";
                                                }
                                                sectionMenu += linkJavascript + "><div class='bigThumb' style='background-image:url(" + bkgdUrl + ");'><div class='bigThumbStatus'><div class='bigThumbSelected'></div></div></div><div class='bigThumbText'>" + thumbTitle + "</div><div class='bigThumbSecondary'>" + thumbTitleSecondary + "</div></a></div></div></div>";
                                            }
                                        }
                                //}
                            }
                        }
                    } else {
                        if (access(currentAccess,menuaccess)) {
                            if (localObject.layers[layer].section == bigThumbSection && localObject.layers[layer].showthumb != '0' && bigThumbSection.replace(/ /g,"-").toLowerCase() != thelayers[layer].item) {
                                var thumbTitle = (thelayers[layer].navtitle ? thelayers[layer].navtitle : thelayers[layer].title);
                                var thumbTitleSecondary = (thelayers[layer].thumbTitleSecondary ? thelayers[layer].thumbTitleSecondary : '&nbsp;');

                                var icon = (thelayers[layer].icon ? thelayers[layer].icon : '<i class="material-icons">&#xE880;</i>');
                                if (!localObject.layers[layer].bigThumbSection) { // Omit the section parent
                                   if (thelayers[layer].item != "main" && thelayers[layer].section != "Admin" && thelayers[layer].title != "") {
                                        // <h1 class='honeyTitle'>" + thelayers[layer].provider + "</h1>
                                        //var thumbTitle = thelayers[layer].title;
                                        var bkgdUrl = thelayers[layer].image;
                                        if (thelayers[layer].bigthumb) {
                                            bkgdUrl = thelayers[layer].bigthumb;
                                        }
                                        bkgdUrl = removeFrontFolder(bkgdUrl);

                                        //var hrefLink = "";
                                        if (thelayers[layer].directlink) {
                                            //hrefLink = "href='" + removeFrontFolder(thelayers[layer].directlink) + "'";
                                        }
                                        sectionMenu += "<div class='bigThumbMenuContent' show='" + localObject.layers[layer].item + "'><div class='bigThumbWidth user-" + menuaccess + "' style='display:none'><div class='bigThumbHolder'><a href='" + directlink + "' " + linkJavascript + "><div class='bigThumb' style='background-image:url(" + bkgdUrl + ");'><div class='bigThumbStatus'><div class='bigThumbSelected'></div></div></div><div class='bigThumbText'>" + thumbTitle + "</div><div class='bigThumbSecondary'>" + thumbTitleSecondary + "</div></a></div></div></div>";
                                    }
                                }
                            }
                        }
                    }
                }
                // Hidden to reduce clutter
                $("#honeycombPanel").prepend("<div class='hideThumbMenu close-X' style='display:none; position:absolute; right:0px; top:0px;'><i class='material-icons' style='font-size:32px'>&#xE5CD;</i></div>");
                $(insertInto).append("<div id='bigThumbMenuInner' class='bigThumbMenuInner'>" + sectionMenu + "</div>");

                if (stateAbbr == "GA") {
                // if (hash.state && hash.state.split(",")[0].toUpperCase() == "GA") {
                    $(".geo-US13").show();
                }
                //$("#honeycombMenu").append("<ul class='bigThumbUl'>" + sectionMenu + "</ul>");
                $("#iconMenu").append(iconMenu);
                if (insertInto == "#bigThumbMenu") {
                   $("#bigThumbPanelHolder").show();
                }
                $("#honeyMenuHolder").show(); // Might be able to remove display:none on this

                // 
                //$(".thumbModule").append($("#bigThumbPanelHolder"));
            } else if ($("#bigThumbPanelHolder").css("display") == "none") {
                if (insertInto == "#bigThumbMenu") {
                  $("#bigThumbPanelHolder").show();
                }
            } else {
                $("#bigThumbPanelHolder").hide();
                $(".showApps").removeClass("filterClickActive"); updateHash({'appview':''});
            }

            $('.bigThumbHolder').click(function(event) {
                $("#bigThumbPanelHolder").hide(); // Could remain open when small version above map added. 
                $(".showApps").removeClass("filterClickActive"); ////updateHash({'appview':''});     
            });
            if (activeLayer) {
                $(".bigThumbMenuContent[show='" + activeLayer +"']").addClass("bigThumbActive");
                let activeTitle = $(".bigThumbMenuContent[show='" + activeLayer +"'] .bigThumbText").text();
                if (activeTitle) { // Keep prior if activeLayer is not among app list.
                    $("#showAppsText").attr("title",activeTitle);
                }
            }
          });
        });
    });
}

function showClassInline(theclass) {
    // Load when body head becomes available, faster than waiting for all DOM .js files to load.
    // Append -hide to hide a div for a site.
    waitForElm('head').then((elm) => { // -omit
        var div = $("<style />", {
            html: theclass + ' {display: inline !important} ' + theclass + '-hide {display:none}'
        }).appendTo("head");
    });
}
function imagineLocation() {
    if (location.href.indexOf('/info') == -1) {
        updateHash({"geoview":""}); // Prevents location filter from remaining open after redirect.
        location.href = local_app.web_root() + "/localsite/info/" + location.hash;
        return;
    }
    updateHash({"imgview":"state","geoview":"","appview":""}); // Should this reside in hideAdvanced()?
    hideAdvanced();
}
function hideAdvanced() {
    console.log("hideAdvanced");
    // Should we show a search icon when closing?
    $(".fieldSelector").hide();
    $("#filterLocations").hide();
    $("#imagineBar").hide();
    $("#filterClickLocation").removeClass("filterClickActive");
    $("#draggableSearch").hide();

    if (typeof relocatedStateMenu != "undefined") {
        // DEACTIVATED, OCCURRED ON LOAD OF /localsite/info/
        //relocatedStateMenu.appendChild(state_select); // For apps hero
    }
    $("#hero_holder").show();
    $(".locationTabText").text($(".locationTabText").attr("title"));
}
function activateSideColumn() {
    // Make paths relative to current page
        $("#main-nav a[href]").each(function() {
            if($(this).attr("href").toLowerCase().indexOf("http") < 0) {
                if($(this).attr("href").indexOf("/") != 0) { // Don't append if starts with /
                    $(this).attr("href", climbpath + $(this).attr('href'));
            }
        }
    })
        $("#main-nav img[src]").each(function() {
            if($(this).attr("src").indexOf("/") != 0) { // Don't append if starts with /
            $(this).attr("src", climbpath + $(this).attr('src'));
        }
    })
    
    // Clone after path change
        
        // Might need to reactivate, but should we give a different ID?
        // Double use of ID seems to prevent display here: http://localhost:8887/recycling/
        //$("#headerLogo").clone().appendTo("#logoholderside");

        // ALL SIDE COLUMN ITEMS
        var topMenu = $("#cloneLeft");
        //console.log("topMenu:");
        //console.log(topMenu);
    var menuItems = topMenu.find("a");
    var scrollItems = menuItems.map(function(){ // Only include "a" tag elements that have an href.

        // Get the section using the names of hash tags (since id's start with #). Example: #intro, #objectives
        if ($(this).attr("href").includes('#')) {
            var sectionID = '#' + $(this).attr("href").split('#')[1].split('&')[0]; 
            if (sectionID.indexOf("=") >= 0) { // Sometimes the show (section) value may be passed without an equals sign.
                sectionID = sectionID.split('=')[0];
            }
            var item = $(sectionID); //   .replace(/\//g, "").replace(/../g, "")    Use of replaces fixes error due to slash in path.
            if (item.length) {
                return item;
            }
        }
    });
    var bottomSection = "partners";

        // BIND CLICK HANDLER TO MENU ITEMS
    menuItems.click(function(e){
      var href = $(this).attr("href");
      /*
      console.log('Clicked ' + href);
      var offsetTop = href === "#" ? 0 : $(href).offset().top-topMenuHeight+1;
      */
      if (href.includes("#intro")) { 

        // If current page contains a section called intro
        if($('#intro').length > 0) {
            //alert("intro click")
            $('html,body').scrollTop(0);

            // BUGBUG - still need to set URL since this is needed to override default position:
            e.preventDefault();
        }
      }
    });

    // HIGHLIGHT SIDE NAVIGATION ON SCROLL
    function currentSideID() {
        var scrollTop = window.pageYOffset || (document.documentElement.clientHeight ? document.documentElement.scrollTop : document.body.scrollTop) || 0;
        var topMenuHeight = 150;
        // Get container scroll position
        var fromTop = scrollTop+topMenuHeight; // this is the window
        //console.log('fromTop ' + fromTop);
        // Get id of current scroll item
        var cur = scrollItems.map(function(){
            // scrollItems fron header.html, but just return the current one.
            //console.log('offset().top ' + $(this).offset().top)
            if ($(this).offset().top < fromTop) {
                //console.log('offset().top < fromTop ' + $(this).offset().top + ' < ' + fromTop);
                return this;
            }
        });
        if (cur.length == 0 && $("#allsections").length) {
            // At top, above top of intro section
            // To Do: Get the top most section
            // allsections
            return $("#allsections section:first").attr("id"); // "intro" when on tools page,
        }
        // Get the id of the last item fetched from scrollItems
        cur = cur[cur.length-1];
        var id = cur && cur.length ? cur[0].id : "";
        console.log('STILL IN USE? currentSideID id: ' + id);
        return id;
    }
    var lastID;
    
    /*
    $(window).scroll(function() {
        var id = currentSideID();
        if (location.host.indexOf('localhost') >= 0) {
            console.log("DO WE STILL USE? (window).scroll navigation.js")
        }
        //console.log("id: " + id + " lastID: " + lastID);
       if($('#' + bottomSection).length > 0 && $(window).scrollTop() + $(window).height() == $(document).height()) { // If bottomSection exists and at bottom
          //console.log('at bottom');
          menuItems.removeClass("active");
          menuItems.filter("[href*='#"+bottomSection+"']").addClass("active");
          lastID = bottomSection;
       } else if (id && lastID !== id) { // Highlight side navigation
          //console.log("CURRENT ID: " + id);
          lastID = id;
          menuItems.removeClass("active");
          if (currentSection && currentSection.length) {
            if (id.length == 0) {
                // Page without sections/resources
            } else if (id == "intro") {
                // To do: Change to highlight the uppermost section.
                menuItems.filter("[href='..\/tools\/#']").addClass("active");
            } else {
                menuItems.filter("[href*='#"+id+"']").addClass("active"); // *= means contains
                menuItems.filter("[hashid='" + id + "']").addClass("active");
            }
          }
       }
    

      if (id == "intro") {
        console.log("headerbar show");
        $('.headerbar').show();

        // For when entering from a #intro link from another page.
        // Would be better to disable browser jump to #intro elsewhere.
        //$('html,body').scrollTop(0); 
      }
    });
    */

    // Initial page load
    var currentSection = currentSideID();
    if (currentSection && currentSection.length) {
        if (currentSection == "intro") {
            // To do: Change to highlight the uppermost section.
            menuItems.filter("[href='..\/tools\/#']").addClass("active");
            lastID = "intro";
        } else {
            menuItems.filter("[href*='#"+currentSection+"']").addClass("active");
            menuItems.filter("[hashid='" + currentSection + "']").addClass("active");
            // To do: If not found, try using folder name from link when no #
            //menuItems.filter("[href*='interns/']").addClass("active");
        }
    }
}

// INIT
showHeaderBar();

//if (param.geoview == "state") {
//  loadScript(theroot + 'js/map.js', function(results) {
//      loadScript(theroot + 'js/navigation.js', function(results) {
//          // geoview=state triggers display of location filter in navigation.js. No additional script needed here.
//      });
//  });
//}

function makeLinksRelative(divID,climbpath,pageFolder) {
      $("#" + divID + " a[href]").each(function() {

      //if (pagePath.indexOf('../') >= 0) { // If .md file is not in the current directory
      //$("#" + divID + " a[href]").each(function() {
      if($(this).attr("href").toLowerCase().indexOf("http") < 0){ // Relative links only        
          $(this).attr("href", climbpath + $(this).attr('href'));
      } else if (!/^http/.test($(this).attr("href"))) { // Also not Relative link
          alert("Adjust: " + $(this).attr('href'))
          $(this).attr("href", pageFolder + $(this).attr('href'));
      }
    })
}
function getPageFolder(pagePath) {
  let pageFolder = pagePath;
  if (pageFolder.lastIndexOf('?') > 0) { // Incase slash reside in parameters
    pageFolder = pageFolder.substring(0, pageFolder.lastIndexOf('?'));
  }
  // If there is a period after the last slash, remove the filename.
  if (pageFolder.lastIndexOf('.') > pageFolder.lastIndexOf('/')) {
    pageFolder = pageFolder.substring(0, pageFolder.lastIndexOf('/')) + "/";
  }
  if (pageFolder == "/") {
    pageFolder = "";
  }
  return pageFolder;
}


} else { 
    if (location.host.indexOf('localhost') >= 0) {
        alert("ALERT: navigation.js is being loaded twice.");
    }
    console.log("ALERT: navigation.js is being loaded twice.")
} // End typeof page_scripts which checks if file is loaded twice.

$(document).on("change", "#state_select", function(event) {
    console.log("state_select change");
    $("#geoview_container").hide();
    closeAppsMenu();
    let hash = getHash();

    // Temporary 300ms delay when #state_select is inside #geoview_container
    // Allows time for hash listeners to read state properties before #state_select moves to #relocatedStateMenu
    // TODO: Remove delay once state list properties (state names etc) are fetched from page cache variable instead of #state_select
    const isInContainer = $(this).closest('#geoview_container').length > 0;
    const delay = isInContainer ? 300 : 0;

    if (this.value) {
        $("#region_select").val("");
        // Later a checkbox could be added to retain geo values across multiple states
        // Omitting for BC apps page  ,'geoview':'state'
        if (hash.geoview) {
            var nextGeoview = (hash.geoview == "country") ? "country" : "state";
            goHash({'state':this.value,'geo':'','name':'','regiontitle':'','geoview':nextGeoview}); // triggers renderGeomapShapes("geomap", hash); // County select map
        } else {
            goHash({'state':this.value,'geo':'','name':'','regiontitle':''}); // triggers renderGeomapShapes("geomap", hash); // County select map
        }

        setTimeout(() => {
            setGeoviewTitleFromState();
            //$("#filterLocations").hide(); // So state appears on map immediately
        }, delay);
    } else { // US selected
        hiddenhash.state = ""; // BugFix - Without this prior state stays in dropdown when choosing no state using top option.
        goHash({'geoview':'country','state':'','geo':''});
    }
});
$(document).on("change", "#selectScope", function(event) {
    goHash({'scope':this.value});
});

// Close inline dropdown when clicking elsewhere
$(document).on("click", function(event) {
    // Only close if click is outside dropdown and trigger button
    if (!$(event.target).closest('#inlineStateDropdown, #filterClickState').length) {
        $("#inlineStateDropdown").hide();
    }
    if (!$(event.target).closest('#geoviewSelectHolder').length) {
        closeGeoviewList();
    }
});
// Click handler for Counties Tab - Opens location filter panel
$(document).on("click", "#filterClickLocation", function(event) {

    if ($("#draggableSearch").is(':visible')) {
        $("#draggableSearch").hide();
        $("#filterLocations").hide();
    }
    closeGeoviewList();
    // When geoview=country and a state is selected, switch to geoview=state
    var clickHash = getHash();
    if (clickHash.geoview == "country" && clickHash.state) {
        goHash({"geoview": "state"});
        event.stopPropagation();
        return;
    }
    filterClickLocation();
    event.stopPropagation();
    return;


    /// NOT USED

    //delete(hiddenhash.geoview); // Not sure where this gets set.
    if ($("#geoPicker").is(':visible')) {
        console.log($("#filterLocations").offset().top);
    }
    let hash = getHash();
    if ($("#locationFilterHolder").is(':visible') && $("#bigThumbPanelHolder").is(':visible')) { // was #geoPicker
        //$("#bigThumbPanelHolder").hide();
        //$("#filterClickLocation").removeClass("filterClickActive");
        //$("#filterClickLocation").addClass("filterClickActive");
        //goHash({"appview":""});
        closeAppsMenu();
        $("#filterClickLocation").addClass("filterClickActive");
        $("#locationFilterHolder").show();
        updateHash({"geoview":""});
    } else if ($("#locationFilterHolder").is(':visible')) { // was #geoPicker
        //if (hash.geoview && hash.appview) {

        $("#locationFilterHolder").hide();
        //$("#geoPicker").hide();
        closeAppsMenu();
        $("#filterClickLocation").removeClass("filterClickActive");
        updateHash({"geoview":""});
    } else {
        $("#locationFilterHolder").show();
        closeAppsMenu();
        loadScript(theroot + 'js/navigation.js', function(results) {
            // Jul2 $("#filterLocations").show();$("#locationFilterHolder").show();$("#imagineBar").show();
            ///$("#geoPicker").show();
            if (!hash.appview) {
                $("#filterClickLocation").addClass("filterClickActive");
            }
            if(!hash.geoview && (hash.state || param.state)) {
                /*
                hash.geoview = "state";
                if (!hash.state) {
                    hash.state = param.state + "";
                }
                goHash({"geoview":hash.geoview});
                */
                //alert("updateHash " + hash.geoview);
            } else {
                goHash({"geoview":"country"});
            }

            console.log("#filterClickLocation click hash.geoview: " + hash.geoview);
        });
        $('html,body').scrollTop(0);
        /*
         if (!hash.geoview) {
            if (!hash.appview) {
                closeAppsMenu();
            }
            loadScript(theroot + 'js/navigation.js', function(results) {
                //if (!param.geoview) {
                // Hash change triggers call to filterClickLocation() and map display.
                if (mapviewState) {
                    console.log("#filterClickLocation click go state");
                    goHash({'geoview':'state'});
                } else {
                    goHash({'geoview':'country'});
                }
            });
        } else {
            // Triggers closeLocationFilter()
            console.log("remove geoview from hash")
            goHash({"geoview":""}); // Remove from URL using gohash so priorhash is also reset
        }
        */
    }
    event.stopPropagation();
});


$(document).on("click", ".showApps, .hideApps", function(event) {
    closeGeoviewList();
    showApps("#bigThumbMenu");
    event.stopPropagation();
});

function setLocationTabArrow(isOpen) {
    const locationArrowIcons = $("#filterClickLocation .select-menu-arrow-holder .material-icons");
    if (!locationArrowIcons.length) {
        return;
    }
    locationArrowIcons.hide();
    if (isOpen) {
        $("#filterClickLocation .select-menu-arrow-holder .material-icons:nth-of-type(2)").show();
    } else {
        $("#filterClickLocation .select-menu-arrow-holder .material-icons:first-of-type").show();
    }
}

function showApps(menuDiv) {
    loadScript(theroot + 'js/navigation.js', function(results) {
        let modelsite;
        if (Cookies.get('modelsite')) {
            //$("#modelsite").val(Cookies.get('modelsite'));
            modelsite = Cookies.get('modelsite');
        }
        let hash = getHash();
        console.log('showApps in ' + menuDiv);
        $("#filterClickLocation").removeClass("filterClickActive"); // But leave open

        if ($("#bigThumbPanelHolder").is(':visible')) { // CLOSE APPS MENU
        //if($("#bigThumbPanelHolder").is(':visible') && isElementInViewport($("#bigThumbPanelHolder"))) { // Prevented tab click from closing app menu
            updateHash({"appview":""});
            $("#appSelectHolder .select-menu-arrow-holder .material-icons").hide();
            $("#appSelectHolder .select-menu-arrow-holder .material-icons:first-of-type").show();

            $("#appSelectHolder .showApps").removeClass("filterClickActive"); updateHash({'appview':''});
            $("#showAppsText").text($("#showAppsText").attr("title"));
            $(".hideWhenPop").show();
            // To do: Only up scroll AND SHOW if not visible
            // Bug bug this closed filters
            $('html,body').animate({
                scrollTop: 0
            });
            closeAppsMenu();
            if (!hash.appview) {
                if ($("#filterLocations").is(':visible')) {
                    $("#filterClickLocation").addClass("filterClickActive");
                }
            }
        } else { // Show Apps, Close Locations (if no geoview)
            updateHash({"appview":"topics"});
            console.log("call showThumbMenu from navidation.js");
            if (!hash.geoview) {

                if (modelsite=="dreamstudio" || location.host.indexOf("dreamstudio") >= 0) {
                    closeExpandedMenus($(".showSections")); // Close all sidetab's prior to opening new tab
                } else {
                    closeExpandedMenus($(".showResources"));
                }
            }
            $("#topicsPanel").show();

            if ($("#filterLocations").is(':visible')) {
                ////goHash({"geoview":""});
                // Deactivated so both apps and geoview shown on localsite/map:
                //goHash({},["geoview"]); //TODO - Alter so the above works instead.

                ////filterClickLocation(); // Toggle county-select closedhttp://localhost:8887/localsite/map/#show=recyclers&state=GA
            }
            $("#appSelectHolder .select-menu-arrow-holder .material-icons:first-of-type").hide();
            $("#appSelectHolder .select-menu-arrow-holder .material-icons:nth-of-type(2)").show();

            $("#showAppsText").text("Location Topics");
            waitForElm('#appSelectHolder').then((elm) => {
                $("#appSelectHolder .showApps").addClass("filterClickActive"); // Adds to local topics
            });
            $("#bigThumbMenuInner").appendTo(menuDiv);
            showThumbMenu(hash.show, menuDiv);
            //$('.showApps').addClass("filterClickActive");
            waitForElm('#bigThumbPanelHolder').then((elm) => { 
                $('html,body').animate({
                    //- $("#filterFieldsHolder").height()  
                    scrollTop: $("#bigThumbPanelHolder").offset().top - $("#headerbar").height() - $("#filterFieldsHolder").height()
                });
            });
        }

        

    });
}
function closeAppsMenu() {
    $("#bigThumbPanelHolder").hide();
    $(".showApps").removeClass("filterClickActive"); updateHash({'appview':''});
}
function filterClickLocation(loadGeoTable) {
    console.log("filterClickLocation() " + loadGeoTable);
    let hash = getHash();
    if (hash.sidetab == "locale" && hash.geoview) {
        goHash({'sidetab':'','locpop':''});
    } else if (hash.geoview) {
        goHash({'geoview':'','locpop':''});
    } else if (hash.state) {
        goHash({'geoview':'state','locpop':''});
    } else {
        goHash({'geoview':'country','locpop':''});
    }
    return;
}
function filterLocationChange() {
    $("#bigThumbPanelHolder").hide();
    $('.showApps').removeClass("filterClickActive"); ////updateHash({'appview':''});
    let distanceFilterFromTop = 120;
    if ($("#locationFilterHolder #filterLocations").length) {
        distanceFilterFromTop = $("#filterLocations").offset().top - $(document).scrollTop();
    }
    if ($("#filterLocations").is(':visible')) { // && (distanceFilterFromTop < 300 || distanceFilterFromTop > 300)
        closeLocationFilter();
        console.log("closeLocationFilter");
    } else { // OPEN MAP FILTER

        $("#filterLocations").prependTo($("#locationFilterHolder"));
        openMapLocationFilter();

        /*
        waitForElm('#geomap').then((elm) => {

          if (document.querySelector('#geomap')._leaflet_map) {
            alert("found, refresh geomap")
            document.querySelector('#geomap')._leaflet_map.invalidateSize(); // Force Leaflet map to reload
          }
        });
        */
    }
    $("#keywordFields").hide();
}
function openMapLocationFilter() {
    let hash = getHash();

    if (!hash.geoview) { // && hash.sidetab != "locale"
        let currentStates = [];
        if(hash.geo && !hash.state) {
            let geos = hash.geo.split(",");
            for(var i = 0 ; i < geos.length ; i++) {
                currentStates.push(getKeyByValue(localObject.us_stateIDs, Number(geos[i].replace("US","").substring(0,2))));
            }
        }
    }
    $("#geomap").appendTo($("#geomapHolder")); // Move back from rightSideTabs

    // Keep state name, don't revert to "Locations"
    // $(".locationTabText").text("Locations"); // REMOVED - keep state name
    
    updateCountiesTabText();
    
    $("#topPanel").hide();
    $("#showLocations").show();
    $("#hideLocations").hide();
    setLocationTabArrow(true);

    // Move state_select to location filter holder when Counties panel opens
    waitForElm('#locationFilterHolder').then((elm) => {
        if (typeof state_select != "undefined") {
            // Move state dropdown to top of location filter panel
            // If this is reactivated, move it somewhere else.
            //$("#locationFilterHolder").prepend(state_select);
        }
    });

    if (typeof select_scope_holder != "undefined") {
        select_scope_holder.appendChild(selectScope); // For apps hero
    }

    if (hash.geo) {
        let geoDeselect = "";
        if (hash.geoview != "country") {
            updateSelectedTableRows(hash.geo, geoDeselect, 0);
        }
    }
    if (!hash.appview) {
        waitForElm('#filterClickLocation').then((elm) => {
            if ($("#locationFilterHolder").is(':visible')) {
                $("#filterClickLocation").addClass("filterClickActive");
            }
        });
    }

    waitForElm('#filterLocations').then((elm) => {
        $("#filterLocations").prependTo($("#locationFilterHolder")); // Move back from rightSideTabs
        $('html,body').animate({
            scrollTop: $("#filterLocations").offset().top - $("#headerbar").height() - $("#filterFieldsHolder").height()
        });
    });
    if (location.host == 'georgia.org' || location.host == 'www.georgia.org') { 
        $("#header.nav-up").show();
    }
}
function closeLocationFilter() {
    // Keep state name in locationTabText (don't revert)
    // $(".locationTabText").text($(".locationTabText").attr("title")); // REMOVED
    
    updateCountiesTabText();
    
    $("#showLocations").hide();
    $("#hideLocations").show();
    setLocationTabArrow(false);
    $("#locationFilterHolder").hide();
    $("#filterLocations").hide(); // Not sure why this was still needed.
    $("#imagineBar").hide();
    $("#filterClickLocation").removeClass("filterClickActive");
    
    // Close inline state dropdown if open
    $("#inlineStateDropdown").hide();
    
    if (location.host == 'georgia.org' || location.host == 'www.georgia.org') {
        $("#header.nav-up").hide();
    }

    if (typeof relocatedStateMenu != "undefined") {
        // DEACTIVATED, OCCURRED ON LOAD OF /localsite/info/
        //relocatedStateMenu.appendChild(state_select); // For apps hero
    }
    if (typeof relocatedScopeMenu != "undefined") {
        // DROPDOWN #selectScope was REMOVED  relocatedScopeMenu.appendChild(selectScope); // For apps hero
    }
    $("#hero_holder").show();
}

// LOCK HEADER TO TOP ON FAST SCROLL

// Previously in map.js

var mapFixed = false;
var previousScrollTop = $(window).scrollTop();
var revealHeader = true;
$('.sidecolumnLeft a').click(function(event) {
  revealHeader = false;
  /*
  setTimeout(function(){ 
    var y = $(window).scrollTop();  //your current y position on the page
    //$(window).scrollTop(y-50); // Adjust for fixed header.

  }, 10);
  */
});

//$('#headerbar').addClass("headerbarhide");

if (1==1) {
$(window).scroll(function() {
  if (revealHeader == false) {
    $("#headerLarge").addClass("headerLargeHide"); $('.bothSideIcons').removeClass('sideIconsLower');$(".pagecolumn").removeClass("pagecolumnLower"); $('.headerbar').hide(); $('.headerOffset').hide(); $('#logoholderbar').show(); $('#logoholderside').show();
    $("#filterFieldsHolder").addClass("filterFieldsHolderFixed");
    $("body").addClass("filterFieldsBodyTop");
    if (param.showheader != "false") {
      $('.showMenuSmNav').show(); 
    }
    $('#filterFieldsHolder').hide();
    $('.headerOffset').hide();
    $('.bothSideIcons').removeClass('sideIconsLower');$(".pagecolumn").removeClass("pagecolumnLower");
    $('#headerbar').hide();
    if (sideTopOffsetEnabled) {
      //$('.sidecolumnLeft').css("top","54px");
    }
    //$('#showNavColumn').css("top","7px");

    if (!$("#filterFieldsHolder").is(':visible')) { // Retain search filters space at top, unless they are already hidden
      $('#headerLarge').hide();
    }
    
    revealHeader = true; // For next manual scroll
  } else if ($(window).scrollTop() > previousScrollTop) { // Scrolling Up
    if ($('#headerbar').is(':visible')) {
      if ($(window).scrollTop() > previousScrollTop + 20) { // Scrolling Up fast
        // Switch to smaller header

        $("#headerLarge").addClass("headerLargeHide");
        $('.bothSideIcons').removeClass('sideIconsLower');$(".pagecolumn").removeClass("pagecolumnLower");
        if (!$("#filterFieldsHolder").is(':visible')) { // Move to top if no small top bar
          $(".pagecolumn").addClass("pagecolumnToTop");
        }

        $('.headerbar').hide();
        $('.headerOffset').hide();
        $('#logoholderbar').show();

        if (!$("#filterFieldsHolder").hasClass("filterFieldsHidden")) {
          $("#filterFieldsHolder").addClass("filterFieldsHolderFixed");
          $("body").addClass("filterFieldsBodyTop");
          if (param.showfilters == "true") {
            $('.showMenuSmNav').show(); 
          }
          $('.headerOffset').hide();
          $('.bothSideIcons').removeClass('sideIconsLower');$(".pagecolumn").removeClass("pagecolumnLower");
          $('#headerbar').hide(); // Not working
          $('#headerbar').addClass("headerbarhide");
        }
        if (!$("#filterFieldsHolder").is(':visible')) { // Retain search filters space at top, unless they are already hidden
          $('#headerLarge').hide();
        }
      }
    }
  } else { // Scrolling Down
    if ($(window).scrollTop() < (previousScrollTop - 20)) { // Reveal #headerLarge if scrolling down fast
      $("#headerLarge").removeClass("headerLargeHide"); $('.bothSideIcons').addClass('sideIconsLower');
      $(".pagecolumn").addClass("pagecolumnLower");$(".pagecolumn").removeClass("pagecolumnToTop");$('.headerbar').show(); $('#logoholderbar').hide(); $('#logoholderside').hide();
      //$('#filterFieldsHolder').show();
      $("#filterFieldsHolder").removeClass("filterFieldsHolderFixed");
      $("body").removeClass("filterFieldsBodyTop");
      if ($("#headerbar").length) {
        if (param.showheader != "false") {
          $('.headerOffset').show();
          $('.bothSideIcons').addClass('sideIconsLower');$(".pagecolumn").addClass("pagecolumnLower");$(".pagecolumn").removeClass("pagecolumnToTop");
          $('#headerbar').show();
          $('#headerbar').removeClass("headerbarhide");
          if (param.shortheader != "true") {
            $('#local-header').show();
          } else {
            //$('#local-header-short').show();
          }
          $('.showMenuSmNav').hide();
        }
        if (sideTopOffsetEnabledBig) {
          let headerFixedHeight = $("#headerbar").height(); // #headerLarge was too big at 150px
          //$('.sidecolumnLeft').css("top",headerFixedHeight + "px");
        } else {
          //$('.sidecolumnLeft').css("top","0px");
        }
      }
      $('#headerLarge').show();
    } else if ($(window).scrollTop() == 0) { // At top
      $("#headerLarge").removeClass("headerLargeHide"); $('.headerbar').show(); $('#logoholderbar').hide(); $('#logoholderside').hide();
      // We avoid hiding #filterFieldsHolder here since we retain it if already open.
      $("#filterFieldsHolder").removeClass("filterFieldsHolderFixed");
      $("body").removeClass("filterFieldsBodyTop");
      if ($("#headerbar").length) {
        if (param.showheader != "false") {
          $('.headerOffset').show();
          $('.bothSideIcons').addClass('sideIconsLower');$(".pagecolumn").addClass("pagecolumnLower");$(".pagecolumn").removeClass("pagecolumnToTop");
          $('#headerbar').show();
          $('#headerbar').removeClass("headerbarhide");
          if (param.shortheader != "true") {
            $('#local-header').show();
          }
          $('.showMenuSmNav').hide();
        }
        if (sideTopOffsetEnabledBig) {
          let headerFixedHeight = $("#headerbar").height(); // #headerLarge was too big at 150px
          //$('.sidecolumnLeft').css("top",headerFixedHeight + "px");
        } else {
          //$('.sidecolumnLeft').css("top","0px");
        }
      }
      $('#headerLarge').show();
    }
  }
  previousScrollTop = $(window).scrollTop();

  lockSidemap(mapFixed);
  
});
}

function lockSidemap() {
  // Detect when #hublist is scrolled into view and add class mapHolderFixed.
  // Include mapHolderBottom when at bottom.
  if (bottomReached('#hublist')) {
    if (mapFixed==true) { // Only unstick when crossing thresehold to minimize interaction with DOM.
      console.log('bottomReached unfix');
      $('#mapHolderInner').removeClass('mapHolderFixed');
      $("#mapHolderInner").css("max-width","none");
      $('#mapHolderInner').addClass('mapHolderBottom');
      // Needs to be at bottom of dev
      mapFixed = false;
    }
  } else if (topReached('#hublist')) {
    if (mapFixed==false) {
      let mapHolderInner = $('#mapHolderInner').width();
      console.log('topReached - fixed side map position');
      $('#mapHolderInner').addClass('mapHolderFixed');
      $("#mapHolderInner").css("max-width",mapHolderInner);
      $('#mapHolderInner').removeClass('mapHolderBottom');
      mapFixed = true;
    }
  } else if(!topReached('#hublist') && mapFixed == true) { // Not top reached (scrolling down)
    console.log('Scrolling down unfix');
    $('#mapHolderInner').removeClass('mapHolderFixed');
    mapFixed = false;
  }
}

// FIXED MAP POSITION ON SCROLL
var sideTopOffsetEnabled = true;
var sideTopOffsetEnabledBig = false;
function elementScrolled(elem) { // scrolled into view
  var docViewTop = $(window).scrollTop();
  var docViewBottom = docViewTop + $(window).height();
  var elemTop = $(elem).offset().top;
  return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
}
function bottomReached(elem) { // bottom scrolled into view
  if(!$(elem).length) {
    console.log("Element for bottomReached does not exist: " + elem);
    return 0;
  }
  var docViewTop = $(window).scrollTop();
  var docViewBottom = docViewTop + $(window).height();
  var hangover = -10; // Extend into the next section, so map remains visible. // Was 10
  //var elemTop = $(elem).offset().top;
  var elemBottom = $(elem).offset().top + $(elem).height() + hangover - docViewBottom;
  //console.log('offset: ' + $(elem).offset().top + ' height:' + $(elem).height() + ' docViewBottom:' + docViewBottom + ' elemBottom: ' + elemBottom);
  //console.log('bottomReached elemBottom: ' + elemBottom);
  return (elemBottom < 0);
}
function topReached(elem) { // top scrolled out view
  if(!$(elem).length) {
    //console.log("Element for topReached does not exist: " + elem);
    return 0;
  }
  var docViewTop = $(window).scrollTop();
  //var docViewBottom = docViewTop + $(window).height();
  var pretop = 80; // Extend into the next section, so map remains visible.
  //var elemTop = $(elem).offset().top;
  var elemTop = $(elem).offset().top - docViewTop - pretop;
  //console.log('offset: ' + $(elem).offset().top + ' height:' + $(elem).height() + ' docViewBottom:' + docViewBottom + ' elemBottom: ' + elemBottom);
  //console.log('topReached elemTop: ' + elemTop);
  return (elemTop < 0);
}
function hideScopeOptions(hideScopes) {
    // Avoids revealing if option is already hidden
    waitForElm('#selectScope').then((elm) => {
        let select = $("#selectScope");
        let selectedOption = select.find(":selected");
        let isSelectedHidden = hideScopes.includes(selectedOption.val());

        select.find("option").each(function () {
            let $option = $(this);
            if (hideScopes.includes(this.value)) {
                $option.prop("hidden", true);
            }
        });
        // If the selected option was hidden, force-select the first visible one
        if (isSelectedHidden || !select.find(":selected").length) {
            let firstVisibleOption = select.find("option:not([hidden])").first();
            if (firstVisibleOption.length) {
                select.val(firstVisibleOption.val()); // Properly select without showing a hidden option
                updateHash({'scope':firstVisibleOption.val()});
            }
        }

    });
}

if (!onlineApp) {
    console.log("You are currently in offline mode.")
}

// Navigation toggle handler for both openNav and showSideFromHeader
function handleNavigationToggle() {
    console.log('🔍 DEBUG: Global handleNavigationToggle called');
    // Get the navigation instance if it exists
    if (typeof window.standaloneNav !== 'undefined' && window.standaloneNav) {
        console.log('🔍 DEBUG: Using window.standaloneNav');
        window.standaloneNav.handleNavigationToggle();
    } else if (typeof StandaloneNavigation !== 'undefined' && StandaloneNavigation.instance) {
        console.log('🔍 DEBUG: Using StandaloneNavigation.instance');
        StandaloneNavigation.instance.handleNavigationToggle();
    } else {
        console.log('🔍 DEBUG: Navigation instance not found');
    }
}
