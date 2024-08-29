/* Localsite Filters */
// hashChanged() responds to hash changes
// loadLocalObjectLayers(1) - Loads all layers for layer settings. Also loads localObject.layers for later use when showApps clicked. Also adds state hash for layers requiring a state.
// Works WITHOUT map.js. Loads map.js if hash.show gets populated.
// renderGeomapShapes() in navigation.js - For #geomap in search filters
// showTabulatorList() renders country and state lists

if(typeof local_app == 'undefined') { var local_app = {}; console.log("BUG: Move navigation.js after localsite.js"); } // In case navigation.js included before localsite.js
if(typeof layerControls=='undefined') { var layerControls = {}; } // Object containing one control for each map on page.
if(typeof dataObject == 'undefined') { var dataObject = {}; }
if(typeof localObject == 'undefined') { var localObject = {};} // localObject.geo will save a list of loaded counties for multiple states
if(typeof localObject.stateCountiesLoaded == 'undefined') { localObject.stateCountiesLoaded = []; } // Holds a geo code for each state and province loaded. (but not actual counties)
if(typeof localObject.geo == 'undefined') { localObject.geo = []; } // Holds counties. Should this also be {} ?
localObject.us_stateIDs = {AL:1,AK:2,AZ:4,AR:5,CA:6,CO:8,CT:9,DE:10,FL:12,GA:13,HI:15,ID:16,IL:17,IN:18,IA:19,KS:20,KY:21,LA:22,ME:23,MD:24,MA:25,MI:26,MN:27,MS:28,MO:29,MT:30,NE:31,NV:32,NH:33,NJ:34,NM:35,NY:36,NC:37,ND:38,OH:39,OK:40,OR:41,PA:42,RI:44,SC:45,SD:46,TN:47,TX:48,UT:49,VT:50,VA:51,WA:53,WV:54,WI:55,WY:56,AS:60,GU:66,MP:69,PR:72,VI:78};
// Later: localObject.stateZipsLoaded

function hashChanged() {
    let loadGeomap = false;
    let hash = getHash(); // Might still include changes to hiddenhash
    console.log("hashChanged() navigation.js");
    if (hash.geoview == "state" && !hash.state) {
        goHash({"geoview":"country"});
        return;
    }
    if (hash.country && hash.country != "US" && !hash.geoview) {

        //hash.geoview = "countries"; // This caused top map to be open.

        // Not working
        //updateHash({"geoview":"countries"});
        //return;
    }
    populateFieldsFromHash();
    productList("01","99","All Harmonized System Categories"); // Sets title for new HS hash.

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
        //$(".locationTabText").text("United States");
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
        loadScript(theroot + 'js/map.js', function(results) {
        });

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

        if ($("#navcolumn .catList").is(":visible")) {
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
                $("#geoview_select").val(hash.geoview);
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
    if (hash.state != priorHash.state) {
        if (hash.geoview) {
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
        } else {
            $(".locationTabText").text("Locations");
            //$("#filterLocations").hide();
            //$("#industryListHolder").hide(); // Remove once national naics are loaded.
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
            //element.datasource = local_app.modelearth_root() + "/localsite/info/data/map-filters/us-states.json";
            element.datasource = local_app.modelearth_root() + "/localsite/info/data/map-filters/us-states-edited.csv";
            element.columns = [
                {formatter:"rowSelection", titleFormatter:"rowSelection", hozAlign:"center", headerHozAlign:"center", width:10, headerSort:false},
                {title:"State", field:"id"},
                {title:"State", field:"StateName"},
                {title:"Population", field:"population", hozAlign:"right", headerSortStartingDir:"desc", formatter:"money", formatterParams:{precision:false}},
                {title:"CO<sub>2</sub> per capita", field:"CO2_per_capita", hozAlign:"right", formatter:"money", formatterParams:{precision:false}},
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
            let element = {};
            element.scope = "countries";
            element.key = "Country Code";
            //element.datasource = "https://model.earth/country-data/population/population-total.csv";
            element.datasource = local_app.modelearth_root() + "/localsite/info/data/map-filters/country-populations.csv";
            element.columns = [
                    {formatter:"rowSelection", titleFormatter:"rowSelection", hozAlign:"center", headerHozAlign:"center", width:10, headerSort:false},
                    {title:"Country Name", field:"Country Name"},
                    {title:"2010", field:"2010", hozAlign:"right", headerSortStartingDir:"desc", formatter:"money", formatterParams:{precision:false}},
                    {title:"2020", field:"2020", hozAlign:"right", headerSortStartingDir:"desc", formatter:"money", formatterParams:{precision:false}}
                ];
            loadObjectData(element, 0);
        } else { // For backing up within apps
        
            // Since geoview "earth" does uses an iFrame instead of the geomap display.
            if (typeof relocatedStateMenu != "undefined") {
                waitForElm('#state_select').then((elm) => {
                    relocatedStateMenu.appendChild(state_select); // For apps hero
                });
            }
            $("#hero_holder").show();
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
    } else if (!hash.geoview && priorHash.geoview) {
        closeLocationFilter();
    }

    //Resides before geo
    if (hash.regiontitle != priorHash.regiontitle || hash.state != priorHash.state || hash.show != priorHash.show) {
        let theStateName;

        //alert("hash.regiontitle  " + hash.regiontitle);

        // Don't use, needs a waitfor
        if ($("#state_select").find(":selected").value) {
            theStateName = $("#state_select").find(":selected").text();
        }
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

        //alert("hash.regiontitle " + hash.regiontitle);
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
                $(".region_service").text(local_app.loctitle + " - " + hash.show.toTitleCaseFormat());
                
            } else if (hash.state) {

                $(".region_service").text(hash.state); // While waiting for full state name
                waitForElm('#state_select').then((elm) => {
                    //$("#state_select").val(stateAbbrev);
                    console.log("fetch theStateName from #state_select");
                    //$("#state_select").val(hash.state.split(",")[0].toUpperCase());

                    if ($("#state_select").find(":selected").val()) { // Omits top which has no text
                        theStateName = $("#state_select").find(":selected").text();
                        console.log("fetched " + theStateName);
                        $(".region_service").text(theStateName + " Industries");
                        if (showTitle) {
                            $(".region_service").text(theStateName + " - " + hash.show.toTitleCaseFormat());
                        }
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
            hiddenhash.loctitle = hash.regiontitle;
            $(".regiontitle").text(hash.regiontitle);
            if (hash.show) {
                $(".region_service").text(hash.regiontitle + " - " + hash.show.toTitleCaseFormat());
            } else {
                $(".region_service").text(hash.regiontitle);
            }
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

        if($("#geomap").is(':visible')) {
            if (hash.geoview != "country") {
                //if(location.host.indexOf('localhost') >= 0) {

                    let geoDeselect = "";
                    if (hash.regiontitle != priorHash.regiontitle || hash.state != priorHash.state) {
                        geoDeselect = hash.geo
                        delete hash.geo;
                    }
                    updateSelectedTableRows(hash.geo, geoDeselect, 0);
                //}
            }
            // Triggered by hash change to hash.geoview (values: county, state, country)
            // Allows location just clicked (in tabulator and on map) to be highlighted. 
            renderGeomapShapes("geomap", hash, hash.geoview, 1); 
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

    $(".locationTabText").attr("title",$(".locationTabText").text());
    if (hash.cat != priorHash.cat) {
        changeCat(hash.cat)
    }
    if (hash.catsort) {
        $("#catsort").val(hash.catsort);
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
        filterLocationChange();
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
        if (hash.geoview && hash.geoview != "earth") {
            $("#nullschoolHeader").hide();
        }
        waitForElm('#state_select').then((elm) => {
            if (!hash.geoview || hash.geoview == "none") {
                $("#geoPicker").hide();
                $(".stateFilters").hide();
            } else {
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
        } else if (hash.geoview) {
            loadGeomap = true;
            // if ((priorHash.sidetab == "locale" && hash.sidetab != "locale") || (priorHash.locpop  && !hash.locpop)) {
                // Closing sidetab or locpop, move geomap back to holder.
                $("#filterLocations").prependTo($("#locationFilterHolder")); // Move back from sidetabs
                $("#geomap").appendTo($("#geomapHolder")); // Move back from sidetabs

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
    if (loadGeomap) {
        // TO DO: Should we avoid reloading if already loaded for a state?  Occurs when hash.locpop & changes.

        //$("#filterLocations").show();$("#locationFilterHolder").show();$("#imagineBar").show();
        //if($("#geomap").is(':visible')){
        waitForElm('#geomap').then((elm) => {
            console.log("call renderGeomapShapes from navigation.js hashChanged()");
            renderGeomapShapes("geomap", hash, "county", 1); // County select map
        });
        //}
    }
}
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
    console.log("hideSide " + which);
    if (which == "list") {
        $("#listcolumn").hide();
        if ($("#listcolumnList").text().trim().length > 0) {
            $("#showListInBar").show();
        }
        $("#showSideInBar").show();
    } else {
        $("#navcolumn").hide();
        $('body').removeClass('bodyLeftMarginFull');
        if ($("#fullcolumn > .datascape").is(":visible")) { // When NOT embedded
            if ($("#listcolumn").is(':visible')) {
                $('#listcolumn').addClass('listcolumnOnly');
                console.log("addClass bodyLeftMarginList");
                $('body').addClass('bodyLeftMarginList');
            }
        }
    }
    if (!$("#navcolumn").is(':visible') && !$("#listcolumn").is(':visible')) {
        $("#showNavColumn").show();$("#showSideInBar").hide();
        $("#sideIcons").show();
    } else if (!$("#navcolumn").is(':visible') && $("#listcolumn").is(':visible')) {
        $("#showSideInBar").show();
    }
    if (!$("#navcolumn").is(':visible')) {
        $('body').removeClass('bodyLeftMargin');
    }
    if (!$("#listcolumn").is(':visible')) {
        $('body').removeClass('bodyLeftMarginList');
    }
    if (!$("#navcolumn").is(':visible') || !$("#listcolumn").is(':visible')) {
        $('body').removeClass('bodyLeftMarginFull');
    }
    if (!$('body').hasClass('bodyRightMargin')) {
        $('body').removeClass('mobileView');
    }
    // Might not need this with mobile

    // Stopped working after reconfuring to load map1 and map2 with same function.
    /*
    if (document.querySelector('#map1')._leaflet_map) {
        document.querySelector('#map1')._leaflet_map.invalidateSize(); // Refresh map tiles.
    }
    if (document.querySelector('#map2')._leaflet_map) {
        document.querySelector('#map2')._leaflet_map.invalidateSize(); // Refresh map tiles.
    }
    */
    // Works instead
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
        /*
        loadScript(theroot + 'js/map.js', function(results) {
            loadScript(theroot + 'js/navigation.js', function(results) { // For pages without
                goHash({'geoview':'state'});
                //filterClickLocation();
            });
        });
        */
        $("#filterClickLocation").removeClass("filterClickActive");
        $("#filterLocations").appendTo($("#locationFilterPop"));
        $("#draggableSearch").show();
    });
}
function showSideTabs() {
    consoleLog("showSideTabs() in navigation.js");
    waitForElm('#sideTabs').then((elm) => {
        let hash = getHash();

        if (hash.sidetab) {
            $('body').addClass('bodyRightMargin'); // Creates margin on right for fixed sidetabs.
            $('body').addClass('mobileView');
            $(".rightTopMenuInner div").removeClass("active");
            $(".menuExpanded").hide(); // Hide any open
            if (hash.sidetab == "sections") {
                //showSections();
                $(".showSections").addClass("active");
                $("#sectionsPanel").show();
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
            } else if (hash.sidetab == "desktop") {
                $(".showDesktop").addClass("active");
                $("#desktopPanel").show();
            } else if (hash.sidetab == "account") {
                $(".showAccount").addClass("active");
                $("#accountPanel").show();
            } else {
                //$("#sideTabs").show();
            }
            $("#sideTabs").show();
        } else {
            $('body').removeClass('bodyRightMargin'); // Creates margin on right for fixed sidetabs.
            $('body').removeClass('mobileView');
            updateHash({"sidetab":""});
            $("#sideTabs").hide();
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
// var param = loadParams(location.search,location.hash); // This occurs in localsite.js


// INIT
//$(".showSearch").css("display","inline-block");
//$(".showSearch").removeClass("local");

catArray = [];

// TO DO: Wait for other elements in page for several $(document).ready here
$(document).ready(function() {

// Avoid since does not work when localsite.js loads navigation.js.
//document.addEventListener('DOMContentLoaded', function() { // $(document).ready

    // Gets overwritten
    if (param.state) {
        $("#state_select").val(param.state.split(",")[0]);
    }
    
    // This can be reactivated for international harmonized system.
    /*
    alert(local_app.modelearth_root() + '/localsite/js/d3.v5.min.js'); // Is model.earth used to avoid CORS error? Better to avoid and move harmonized-system.txt in localsite repo.
    loadScript(local_app.modelearth_root() + '/localsite/js/d3.v5.min.js', function(results) {

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
            if ($("#navcolumn").is(':hidden')) {
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
        alert("#catSearch click - #toppanel has been deactivated and moved to map/index-categories.html")
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
    $(document).on("change", "#geoview_select", function(event) {
        if (this.value == "countries" || this.value == "earth") {
            hiddenhash.state = "";
            goHash({"geoview":this.value,"state":"",});
        } else {
            goHash({"geoview":this.value});
        }
        
    });
    $('.selected_state').on('change', function() {
        //alert("selected_state " + this.getAttribute("id"))
        $("#state_select").val(this.getAttribute("id"));
        goHash({'name':'','state':this.getAttribute("id")}); // triggers renderGeomapShapes("geomap", hash); // County select map
    });
    $('#region_select').on('change', function() {
        //alert($(this).attr("geo"))
        //goHash({'regiontitle':this.value,'lat':this.options[this.selectedIndex].getAttribute('lat'),'lon':this.options[this.selectedIndex].getAttribute('lon'),'geo':this.options[this.selectedIndex].getAttribute('geo')});
        hiddenhash.geo = this.options[this.selectedIndex].getAttribute('geo');
        console.log("hiddenhash.geo " + hiddenhash.geo);
        delete hash.geo;
        delete param.geo;
        try {
            delete params.geo; // Used by old naics.js
        } catch(e) {
            console.log("Remove params.geo after upgrading naics.js " + e);
        }
        //params.geo = hiddenhash.geo; // Used by naics.js
        local_app.latitude = this.options[this.selectedIndex].getAttribute('lat');
        local_app.longitude = this.options[this.selectedIndex].getAttribute('lon');
        goHash({'regiontitle':this.value,'geo':''});
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
        console.log("document click -  Hide open menus")
        if ( !$(event.target).closest( "#goSearch" ).length ) {
            // BUGBUG - Reactivate after omitting clicks within location selects
            //$(".fieldSelector").hide(); // Avoid since this occurs when typing text in search field.
        }
        $('#keywordFields').hide();
        $('#topPanel').hide();
    });
    $(document).on("click", "body", function(event) {
        if ($("#navcolumn").is(":visible") && window.innerWidth < 1200) { 
            $("#navcolumn").hide();
            $("#showNavColumn").show();$("#showSideInBar").hide();
            $("#sideIcons").show();
            $('body').removeClass('bodyLeftMargin');
            $('body').removeClass('bodyLeftMarginList');
            $('body').removeClass('bodyLeftMarginFull');
            $('body').removeClass('bodyLeftMarginNone'); // For DS side over hero
            if (!$('body').hasClass('bodyRightMargin')) {
                $('body').removeClass('mobileView');
            }
            $('#listcolumn').addClass('listcolumnOnly');
        }
    });

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
        if ($('#dataList').css('display') != 'none') {
            $('#dataGrid').show();
            $('#dataList').hide();
        } else {
            $('#dataList').show();
            $('#dataGrid').hide();
        }
        //event.stopPropagation();
    });
    function escapeRegExp(str) {
        return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }
    function replaceAll(str, find, replace) {
        return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
    }
    $('#requestInfo').click(function () {
        var checkedCompaniesArray = $('[name="contact"]:checked').map(function() {return replaceAll(this.value,",","");}).get();
        var checkedCompanies = checkedCompaniesArray.join(', ').trim();
        if (checkedCompaniesArray.length <= 0) {
            alert("Select one or more companies to pre-fill our request form.");
            return;
        }
        else if (checkedCompaniesArray.length > 10) {
            alert("Please reduce your selected companies to 10 or less. You've selected " + checkedCompaniesArray.length + ".");
            return;
        }
        //alert("Please select 1 to 10 exporters to request contact info.\r(Under development, please return soon. Thank you!)")
        //window.location = "https://www.cognitoforms.com/GDECD1/ExportGeorgiaUSARequestForSupplierIntroduction";

        


        window.open(
          'https://www.cognitoforms.com/GDECD1/ExportGeorgiaUSARequestForSupplierIntroduction?entry={"RequestForIntroduction":{"Suppliers":"' + checkedCompanies + '"}}',
          '_blank' // open in a new tab.
        );
    });
    $('#addCompany').click(function () {
        //window.location="exporters/add";
        window.open(
          'exporters/add',
          '_blank' // open in a new tab.
        );
    });
});

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
  loadScript('/localsite/js/topojson-client.min.js', function(results) {
    renderMapShapeAfterPromise(whichmap, hash, attempts);
  });
}

//var geojsonLayer; // Hold the prior letter. We can use an array or object instead.
var geoOverlays = {};
function renderMapShapeAfterPromise(whichmap, hash, geoview, attempts) {
 includeCSS3(theroot + 'css/leaflet.css',theroot);
  loadScript(theroot + 'js/leaflet.js', function(results) {
    waitForVariable('L', function() { // Wait for Leaflet

    let stateAbbr = "";
    if (hash.state) {
      stateAbbr = hash.state.split(",")[0].toUpperCase();
    }

    // Occurs twice in page
    let modelsite = Cookies.get('modelsite');
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
        hashclone = $.extend(true, {}, hash); // Clone/copy object without entanglement
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
    loadScript('/localsite/js/topojson-client.min.js', function(results) {
    console.log("topoJsonReady loaded from " + local_app.topojson_root());
    //waitForVariable('topoJsonReady', function () {
    //console.log("topoJsonReady " + topoJsonReady);
    //window.topojson = require('topojson-client');
    //topojson = topojson-client;
    waitForElm('#' + whichmap).then((elm) => {

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

        if (hash.geoview == "zip") {
          layerName = "Zipcodes";
          if (stateAbbr) {
            url = local_app.modelearth_root() + "/community-forecasting/map/zcta/states/" + getState(stateAbbr) + ".topo.json";
          } else {
            url = local_app.modelearth_root() + "/community-forecasting/map/zip/topo/zips_us_topo.json";
          }
          topoObjName = "topoob.objects.data";
        }  else if (hash.geoview == "country") { // USA  && stateAbbr.length != 2
          layerName = "States";
          url = local_app.modelearth_root() + "/localsite/map/topo/states-10m.json";
          topoObjName = "topoob.objects.states";
        } else if (stateAbbr && stateAbbr.length <= 2) { // COUNTIES
          layerName = stateAbbr + " Counties";
          let stateNameLowercase = getStateNameFromID(stateAbbr).toLowerCase();
          let countyFileTerm = "-counties.json";
          let countyTopoTerm = "_county_20m";
          if (stateNameLowercase == "louisiana") {
            countyFileTerm = "-parishes.json";
            countyTopoTerm = "_parish_20m";
          }
          url = local_app.modelearth_root() + "/topojson/countries/us-states/" + stateAbbr + "-" + state2char + "-" + stateNameLowercase.replace(/\s+/g, '-') + countyFileTerm;
          topoObjName = "topoob.objects.cb_2015_" + stateNameLowercase.replace(/\s+/g, '_') + countyTopoTerm;

          //url = local_app.modelearth_root() + "/topojson/countries/us-states/GA-13-georgia-counties.json";
          // IMPORTANT: ALSO change localhost setting that uses cb_2015_alabama_county_20m below
        } else { // ALL COUNTRIES
          url = local_app.modelearth_root() + "/topojson/world-countries-sans-antarctica.json";
          topoObjName = "topoob.objects.countries1";
        }
        //console.log("topojson url " + url); // TEMP

        req.open('GET', url, true);
        req.onreadystatechange = handler;
        req.send();

        var topoob = {};
        var topodata = {};
        var neighbors = {};
        function handler(){

        if(req.readyState === XMLHttpRequest.DONE) {

          //map.invalidateSize();
          //map.addLayer(OpenStreetMap_BlackAndWhite)

         
          // try and catch json parsing of the responseText
          //try {
                topoob = JSON.parse(req.responseText)

                // Originated in community/map/leaflet/zips-sm.html
                // zips_us_topo.json
                // {"type":"Topology","objects":{"data":{"type":"GeometryCollection","geometries":[{"type":"Polygon

                // {"type":"Topology","transform":{"scale":[0.00176728378633945,0.0012459509163533049],"translate":

                //"arcs":[[38,39,40,41,42]],"type":"Polygon","properties":{"STATEFP":"13","COUNTYFP":"003","COUNTYNS":"00345784","AFFGEOID":"0500000US13003","GEOID":"13003","NAME":"Atkinson","LSAD":"06","ALAND":879043416,"AWATER":13294218}}


                // Since this line returns error, subsquent assignment to "neighbors" can be removed, or update with Community Forecasting boundaries.
                //console.log(topojson)



                // Was used by applyStyle
                ////neighbors = topojson.neighbors(topoob.objects.data.geometries);
                      // comented out May 29, 2021 due to "topojson is not defined" error.
                //neighbors = topojson.neighbors(topoob.arcs); // .properties

                // ADD geometries  see https://observablehq.com/@d3/choropleth
                //topodata = topojson.feature(topoob, topoob.objects.data)

                //topodata = topojson.feature(topoob, topoob.transform)

                // 
                
                //if (param.geo == "US01" || param.state == "AL") {
                  // Example: topoob.objects.cb_2015_alabama_county_20m
                  
                  topodata = topojson.feature(topoob, eval(topoObjName));

                  console.log(topodata)
              //} else {
              //  topodata = topojson.feature(topoob, topoob.objects.cb_2015_georgia_county_20m)
              //}

                // ADD 
                // For region colors
                //mergeInDetailData(topodata, dp.data); // See start/maps/counties/counties.html



                // IS THIS BEING USED?
                //topodata.features = topodata.features.map(function(fm,i){
                /*
                topodata.features = topodata.features.map(function(fm,i){
                    var ret = fm;
                    //console.log("fm: " + fm.COUNTYFP);
                    console.log("fm: " + fm.properties.countyfp);
                    ret.indie = i;
                    return ret
                  });
                */

                //dp.data.forEach(function(datarow) { // For each county row from the region lookup table
                  
                  // All these work:
                  //console.log("name:: " + datarow.name);
                  //console.log("county_num:: " + datarow.county_num);
                  //console.log("economic_region:: " + datarow.economic_region);

                //})

                //console.log('topodata: ', topodata)

                //geojsonLayer.clearLayers(); // Clear prior
                //        layerControls[whichmap].clearLayers();

                

                //console.log('neigh', neighbors)
             //}
            //catch(e){
            //  geojson = {};
            //   console.log(e)
            //}


            //console.log(topodata)
          

          if (hash.geoview == "earth" && theState == "") {
            zoom = 2
            lat = "25"
            lon = "0"
          } else if (hash.geoview == "country") {
            zoom = 4
            lat = "39.5"
            lon = "-96"
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
              'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
              mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZWUyZGV2IiwiYSI6ImNqaWdsMXJvdTE4azIzcXFscTB1Nmcwcm4ifQ.hECfwyQtM7RtkBtydKpc5g';

          var grayscale = L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr}),
              satellite = L.tileLayer(mbUrl, {id: 'mapbox.satellite',   attribution: mbAttr}),
              streets = L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: mbAttr});

          var OpenStreetMap_BlackAndWhite = L.tileLayer('//{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
              maxZoom: 18,
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          });

          let dataParameters = {}; // Temp



          //let map;
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

            // setView(lng, lat, zoom = zoom_level)
          

            
        } else { // Add the new state

          geoOverlays[layerName] = L.geoJson(topodata, {
                style: styleShape, 
                onEachFeature: onEachFeature
          }).addTo(map);

          map.setView(mapCenter,zoom);
        }
        
        console.log("zoom " + zoom);
        console.log(mapCenter);


        /* From other map, probably not Leaflet
        var layersToRemove = [];
        map.getLayers().forEach(function (layer) {
            if (layer.get('name') != undefined && layer.get('name') === layerName) {
                layersToRemove.push(layer);
            }
        });
        var len = layersToRemove.length;
        for(var i = 0; i < len; i++) {
            map.removeLayer(layersToRemove[i]);
            alert("remove layer: " + layersToRemove[i])
        }
        */





        if (map) {
        } else {
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
            console.log("layerControls is available to CountyMap.");

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

            // CLICK SHAPE ON MAP
            function mapFeatureClick(e) {

              

              param = loadParams(location.search,location.hash); // param is declared in localsite.js
              var layer = e.target;
              //map.fitBounds(e.target.getBounds()); // Zoom to boundary area clicked
              if (layer.feature.properties.COUNTYFP) {
                consoleLog("Click state map");
                var fips = "US" + layer.feature.properties.STATEFP + layer.feature.properties.COUNTYFP;
                
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

                //alert("disabled to avoid double call.")
                //goHash({'geo':param.geo,'regiontitle':''});

                // Try this
                goHash({'geo':param.geo});

              } else if (layer.feature.properties.name) { // Full state name
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
                      goHash({'state':hash.state,'geoview':'state'});
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
                if (props && props.COUNTYFP) {
                  this._div.innerHTML = "" 
                  + (props ? "<b>" + props.NAME + " County</b><br>" : "Select Locations") 
                  + (props ? "FIPS 13" + props.COUNTYFP : "")
                } else { // US
                  this._div.innerHTML = "" 
                  + (props ? "<b>" + props.name + "</b><br>" : "Select Locations")
                }

                // To fix if using state - id is not defined
                // Also, other state files may need to have primary node renamed to "data"
                //this._div.innerHTML = "<h4>Zip code</h4>" + (1==1 ? id + '<br>' : "Hover over map")
            }
            if (map) {
              info.addTo(map);
            }
          }
        }
  }); // waitforElm # whichmap
  //}); // waitforVar
  });
  });
  });
}

function updateGeoFilter(geo) {
  $(".geo").prop('checked', false);
  if (geo && geo.length > 0) {

    //locationFilterChange("counties");
    let sectors = geo.split(",");
      for(var i = 0 ; i < sectors.length ; i++) {
        $("#" + sectors[i]).prop('checked', true);
      }

  }
  console.log('ALERT: Change to support multiple states as GEO. Current geo: ' + geo)
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

                let csvFilePath = local_app.community_data_root() + "us/state/" + theState + "/" + theState + "counties.csv";
                if (hash.geoview == "zip") {
                    csvFilePath = local_app.community_data_root() + "us/zipcodes/zipcodes6.csv";
                } else if (hash.show == "cameraready" && hash.state == "GA") {
                    csvFilePath = "/localsite/info/data/map-filters/state-county-sections-ga.csv";
                }
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

                        //alert($("#county-table").length());
                        // No effect
                        //$("#county-table").empty(); // Clear previous state. geo is retained in URL hash.
                        //$("#county-table").text("")
                        //alert($("#county-table").length());

                        // Add a new variable, to make it easier to do a color scale.
                        // Alternately, you could extract these values with a map function.
                        let allDifferences = [];

                        // geo is country, state/province, county

                        let theStateGeo = "US" + ('0' + localObject.us_stateIDs[theState]).slice(-2);
                        
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

                            // Save to localObject so counties in multiple states can be selected
                            if (localObject.stateCountiesLoaded.indexOf(theStateGeo)==-1) { // Just add first time

                                //BUGBUG - Also need to check that state was not already added.
                                let geoElement = {};
                                geoElement.id = "US" + d.GEOID;
                                //geoElement.county = d.NAME;
                                geoElement.name = d.NAME + " County, " + theState;
                                geoElement.state = theState;
                                geoElement.sqmiles = d.sq_miles;
                                geoElement.pop = d.totalpop18;
                                geoElement.permile = d.perMile;

                                localObject.geo.push(geoElement); 
                             }

                            // this is just a convenience, another way would be to use a function to get the values in the d3 scale.
                            //alert("d.perMile " + d.perMile)

                            // Not working
                            //allDifferences.push(d.difference);
                            //allDifferences.push(d.perMile + 0);
                            allDifferences.push(d.perMile);
                        });

                        // Track the states that have been added to localObject.geo
                        if (localObject.stateCountiesLoaded.indexOf(theStateGeo)==-1) {
                            if (localObject.stateCountiesLoaded.indexOf(theStateGeo)==-1) localObject.stateCountiesLoaded.push(theStateGeo);
                            //alert(localObject.stateCountiesLoaded)
                        }
                        //console.log("geoCountyTable");
                        //console.log(geoCountyTable);
                    }
                    consoleLog(myData.length + " counties loaded.");
                    //console.log(myData);

                    //alert("showTabulatorList 1 loadStateCounties element.scope: " + element.scope + " (geo is counties)")
                    showTabulatorList(element, 0);
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
    // Calls showTabulatorList - retains prior location data loads in localObject(element.scope)
    if (typeof d3 !== 'undefined') {
        //alert("loadObjectData element.scope: " + element.scope)
        if(typeof localObject[element.scope] == 'undefined') {
            localObject[element.scope] = {}; // Holds states, countries.
        }

        // Just load from file the first time
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
                    showTabulatorList(element, 0);
                })
            } else {
                d3.json(element.datasource).then(function(json,error) {

                    stateImpact = $.extend(true, {}, json); // Clone/copy object without entanglement

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

                        localObject[element.scope] = $.extend(true, {}, json); // Clone/copy object without entanglement
                        console.log("localObject.state")
                        //console.log(localObject[element.scope])
                        console.log(localObject.state)
                        //alert("showTabulatorList 3")
                        showTabulatorList(element, 0);
                });
            }

        } else { // Already loaded, reuse
            console.log("Reuse localObject element.scope: " + element.scope);
            //alert("showTabulatorList - From existing Object element.scope " + element.scope)
            showTabulatorList(element, 0);
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

const countryCodes = {
    "AFG": "AF",
    "ALB": "AL",
    "DZA": "DZ",
    "ASM": "AS",
    "AND": "AD",
    "AGO": "AO",
    "AIA": "AI",
    "ATA": "AQ",
    "ATG": "AG",
    "ARG": "AR",
    "ARM": "AM",
    "ABW": "AW",
    "AUS": "AU",
    "AUT": "AT",
    "AZE": "AZ",
    "BHS": "BS",
    "BHR": "BH",
    "BGD": "BD",
    "BRB": "BB",
    "BLR": "BY",
    "BEL": "BE",
    "BLZ": "BZ",
    "BEN": "BJ",
    "BMU": "BM",
    "BTN": "BT",
    "BOL": "BO",
    "BIH": "BA",
    "BWA": "BW",
    "BVT": "BV",
    "BRA": "BR",
    "IOT": "IO",
    "BRN": "BN",
    "BGR": "BG",
    "BFA": "BF",
    "BDI": "BI",
    "CPV": "CV",
    "KHM": "KH",
    "CMR": "CM",
    "CAN": "CA",
    "CYM": "KY",
    "CAF": "CF",
    "TCD": "TD",
    "CHL": "CL",
    "CHN": "CN",
    "CXR": "CX",
    "CCK": "CC",
    "COL": "CO",
    "COM": "KM",
    "COG": "CG",
    "COD": "CD",
    "COK": "CK",
    "CRI": "CR",
    "CIV": "CI",
    "HRV": "HR",
    "CUB": "CU",
    "CYP": "CY",
    "CZE": "CZ",
    "DNK": "DK",
    "DJI": "DJ",
    "DMA": "DM",
    "DOM": "DO",
    "ECU": "EC",
    "EGY": "EG",
    "SLV": "SV",
    "GNQ": "GQ",
    "ERI": "ER",
    "EST": "EE",
    "SWZ": "SZ",
    "ETH": "ET",
    "FLK": "FK",
    "FRO": "FO",
    "FJI": "FJ",
    "FIN": "FI",
    "FRA": "FR",
    "GUF": "GF",
    "PYF": "PF",
    "ATF": "TF",
    "GAB": "GA",
    "GMB": "GM",
    "GEO": "GE",
    "DEU": "DE",
    "GHA": "GH",
    "GIB": "GI",
    "GRC": "GR",
    "GRL": "GL",
    "GRD": "GD",
    "GLP": "GP",
    "GUM": "GU",
    "GTM": "GT",
    "GGY": "GG",
    "GIN": "GN",
    "GNB": "GW",
    "GUY": "GY",
    "HTI": "HT",
    "HMD": "HM",
    "HND": "HN",
    "HKG": "HK",
    "HUN": "HU",
    "ISL": "IS",
    "IND": "IN",
    "IDN": "ID",
    "IRN": "IR",
    "IRQ": "IQ",
    "IRL": "IE",
    "IMN": "IM",
    "ISR": "IL",
    "ITA": "IT",
    "JAM": "JM",
    "JPN": "JP",
    "JEY": "JE",
    "JOR": "JO",
    "KAZ": "KZ",
    "KEN": "KE",
    "KIR": "KI",
    "PRK": "KP",
    "KOR": "KR",
    "KWT": "KW",
    "KGZ": "KG",
    "LAO": "LA",
    "LVA": "LV",
    "LBN": "LB",
    "LSO": "LS",
    "LBR": "LR",
    "LBY": "LY",
    "LIE": "LI",
    "LTU": "LT",
    "LUX": "LU",
    "MAC": "MO",
    "MDG": "MG",
    "MWI": "MW",
    "MYS": "MY",
    "MDV": "MV",
    "MLI": "ML",
    "MLT": "MT",
    "MHL": "MH",
    "MTQ": "MQ",
    "MRT": "MR",
    "MUS": "MU",
    "MYT": "YT",
    "MEX": "MX",
    "FSM": "FM",
    "MDA": "MD",
    "MCO": "MC",
    "MNG": "MN",
    "MNE": "ME",
    "MSR": "MS",
    "MAR": "MA",
    "MOZ": "MZ",
    "MMR": "MM",
    "NAM": "NA",
    "NRU": "NR",
    "NPL": "NP",
    "NLD": "NL",
    "ANT": "AN",
    "NCL": "NC",
    "NZL": "NZ",
    "NIC": "NI",
    "NER": "NE",
    "NGA": "NG",
    "NIU": "NU",
    "NFK": "NF",
    "MNP": "MP",
    "NOR": "NO",
    "OMN": "OM",
    "PAK": "PK",
    "PLW": "PW",
    "PAN": "PA",
    "PNG": "PG",
    "PRY": "PY",
    "PER": "PE",
    "PHL": "PH",
    "PCN": "PN",
    "POL": "PL",
    "PRT": "PT",
    "PRI": "PR",
    "QAT": "QA",
    "MKD": "MK",
    "ROU": "RO",
    "RUS": "RU",
    "RWA": "RW",
    "REU": "RE",
    "BLM": "BL",
    "SHN": "SH",
    "KNA": "KN",
    "LCA": "LC",
    "MAF": "MF",
    "SPM": "PM",
    "VCT": "VC",
    "WSM": "WS",
    "SMR": "SM",
    "STP": "ST",
    "SAU": "SA",
    "SEN": "SN",
    "SRB": "RS",
    "SYC": "SC",
    "SLE": "SL",
    "SGP": "SG",
    "SVK": "SK",
    "SVN": "SI",
    "SLB": "SB",
    "SOM": "SO",
    "ZAF": "ZA",
    "SGS": "GS",
    "SSD": "SS",
    "ESP": "ES",
    "LKA": "LK",
    "SDN": "SD",
    "SUR": "SR",
    "SJM": "SJ",
    "SWZ": "SZ",
    "SWE": "SE",
    "CHE": "CH",
    "SYR": "SY",
    "TWN": "TW",
    "TJK": "TJ",
    "TZA": "TZ",
    "THA": "TH",
    "TLS": "TL",
    "TGO": "TG",
    "TKL": "TK",
    "TON": "TO",
    "TTO": "TT",
    "TUN": "TN",
    "TUR": "TR",
    "TKM": "TM",
    "TCA": "TC",
    "TUV": "TV",
    "UGA": "UG",
    "UKR": "UA",
    "ARE": "AE",
    "GBR": "GB",
    "USA": "US",
    "URY": "UY",
    "UZB": "UZ",
    "VUT": "VU",
    "VEN": "VE",
    "VNM": "VN",
    "VGB": "VG",
    "VIR": "VI",
    "WLF": "WF",
    "ESH": "EH",
    "YEM": "YE",
    "ZMB": "ZM",
    "ZWE": "ZW"
};

function convertCountry3to2char(threeCharCode) {
    if (countryCodes.hasOwnProperty(threeCharCode)) {
        return countryCodes[threeCharCode];
    } else {
        return null; // or you can return an error message
    }
}



var statetable = {};
var geotable = {};
function showTabulatorList(element, attempts) {
    let currentRowIDs = [];
    let currentCountryIDs = [];
    console.log("showTabulatorList scope: " + element.scope + ". Length: " + Object.keys(element).length + ". Attempt: " + attempts);
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
    if (param.display != "everything") { // Since it's already loaded for "everything" in localsite.js
        loadTabulator();
    }

    // This loop could be replaced with a wait for Tabulator
    if (typeof Tabulator !== 'undefined') {

        // Convert key-value object to a flat array (like a spreadsheet)
        let dataForTabulator = [];
        $.each(localObject[element.scope] , function(key,val) { // val is an object

            // Not used for states (country) now that json replaced with csv file.
            // Saving in case we have another json ke-value data source later.
              if (1==2 && element.scope == "state") {
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

        // For fixed header, also allows only visible rows to be loaded. See "Row Display Test" below.
        // maxHeight:"100%",

        // COUNTRY - LIST OF STATES

        //if (!hash.state && typeof stateImpact != 'undefined') {
        //alert("theStatewait " + theState);
        // && hash.geoview != "countries"
        if (hash.geoview == "country" || (!theState && onlineApp )) {
             
            // Showing alert prevents tabulator from loading - it probably runs before a DOM element is available.
            //alert("Load USA states or countries list. element.scope: " + element.scope);

            // BUG - element columns are gone when add &state=NY
            console.log("element.columns: ");
            console.log(element.columns);
            //if (element.columns) {
            //   alert(element.columns.length); 
            //   alert("element.columns.length " + element.columns.length); // Error: Cannot read properties of undefined (reading 'length')
            //}
            waitForElm('#tabulator-statetable').then((elm) => {
                //alert("element.scope " + element.scope);
                //alert("element.columns.length inside " + element.columns.length);
                $("#tabulator-geotable").hide();
                $("#tabulator-statetable").show();
                
                // BUGBUG - TypeError: Cannot read properties of undefined (reading 'slice')
                // This occurs when adding a state to the url hash.
                // element.columns were gone!
                // Example http://localhost:8887/apps/ev/#geoview=country  then add &state=NY
                
                // Called twice when clicking state checkbox. Seems to update map (select state) on second pass only.
                if(location.host.indexOf('localhost') >= 0) {
                    //alert("Localhost alert (was called twice when clicking state checkbox.) element.columns " + element.columns);
                }
                console.log("dataForTabulator");
                console.log(dataForTabulator);

                statetable = new Tabulator("#tabulator-statetable", {
                    data:dataForTabulator,    //load row data from array of objects
                    layout:"fitColumns",      //fit columns to width of table
                    responsiveLayout:"hide",  //hide columns that dont fit on the table
                    tooltips:true,            //show tool tips on cells
                    addRowPos:"top",          //when adding a new row, add it to the top of the table
                    history:true,             //allow undo and redo actions on the table
                    movableColumns:true,      //allow column order to be changed
                    resizableRows:true,       //allow row order to be changed
                    maxHeight:"500px",        // For frozenRows
                    paginationSize:10000,
                    columns:element.columns,
                    selectable:true,
                });

                // TO DO: 2-char state needs to be added
                if(hash.state) {
                    let currentStateIDs = hash.state.split(',');
                    statetable.on("tableBuilt", function() {
                        //alert("currentStateIDs " + currentStateIDs)
                        statetable.selectRow(currentStateIDs);
                    });
                }

                statetable.on("rowSelected", function(row) {
                    //alert("statetable rowSelected " + row._row.data.id);
                    // Important: The incoming 2-char state is a column called "id"
                    if (!currentRowIDs.includes(row._row.data.id)) {
                        currentRowIDs.push(row._row.data.id);
                    }
                    //if(hash.geo) {
                        //hash.geo = hash.geo + "," + currentRowIDs.toString();
                    //  hash.geo = hash.geo + "," + row._row.data.id;
                    //} else {
                    if (!hash.geoview || hash.geoview == "state") { // Clicking on counties for a state
                        if (hash.geo != currentRowIDs.toString()) {
                            hash.geo = currentRowIDs.toString();
                            console.log("Got hash.geo " + hash.geo);
                        }
                    } else if (hash.geoview == "countries") {
                        //alert("row._row.data.id " + row._row.data["Country Code"])
                        let countryCode = convertCountry3to2char(row._row.data["Country Code"]);
                        if (countryCode && !currentCountryIDs.includes(countryCode)) {
                            
                            currentCountryIDs.push(countryCode);
                        }
                        goHash({'country':currentCountryIDs.toString()});
                    }
                    if (row._row.data["Country Name"] == "United States") {
                        goHash({'geoview':'country'});
                    } else if(row._row.data.id) {
                        // Prepend new state to existing hash.state.
                        let statesArray = hash.state.split(',');
                        if ($.inArray(row._row.data.id, statesArray) === -1) {
                            if (hash.state) {
                                hash.state = row._row.data.id + ',' + hash.state;
                            } else {
                                hash.state = row._row.data.id;
                            }
                        }
                        goHash({'state':hash.state});
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

                })
                statetable.on("rowDeselected", function(row){
                    let countryCode = convertCountry3to2char(row._row.data["Country Code"]);
                    let filteredCountryArray = currentCountryIDs.filter(item => item !== countryCode);
                    if (hash.geoview == "countries") {
                        goHash({'country':filteredCountryArray.toString()});
                        return;
                    }

                    let filteredArray = currentRowIDs.filter(item => item !== row._row.data.id);
                    if (hash.state != filteredArray.toString()) {
                        //hash.geo = filteredArray.toString();
                        goHash({'state':filteredArray.toString()});
                        return;
                    }
                })
                if (hash.geoview != "countries") {
                    // Not working yet
                    if(hash.state) {
                        let currentStates = hash.state.split(',');
                        statetable.on("tableBuilt", function() {
                            //alert("try it")
                            statetable.selectRow(currentStates); // Uses "id" incoming rowData
                        });
                    }
                }

            }); // End wait for element #tabulator-statetable

        } else if (theState) { // EACH STATE'S COUNTIES

            waitForElm('#tabulator-geotable').then((elm) => {

            // 0.1 sec delay - A delay is needed when initially opening Locations tab for tablator rows to be populated from rowData, not sure why.  
            // Header columns get populated and rowData is, but needs delay to populate .tabulator-tableholder div.  http://localhost:8887/localsite/map/#show=farmfresh&state=GA
            setTimeout( function() { //  One tenth second.

            // Don't use. Never triggered
            //document.addEventListener("#tabulator-geotable", function(event) { // Wait for #tabulator-geotable div availability.

                console.log("#tabulator-geotable available. State: " + hash.state + " element.scope: " + element.scope);

                $("#tabulator-statetable").hide();
                $("#tabulator-geotable").show();

                // Prevented up-down scrolling:
                // maxHeight:"100%",

                // More filter samples
                // https://stackoverflow.com/questions/2722159/how-to-filter-object-array-based-on-attributes

                var columnArray;
                var rowData;
                // omitting titleFormatter:"rowSelection" in both of the following because browser gets overwhelmed.
                if (hash.geoview == "zip") {
                    columnArray = [
                        {formatter:"rowSelection", hozAlign:"center", headerHozAlign:"center", width:10, headerSort:false},
                        {title:"ZIPCODE", field:"name"}
                    ];
                } else {
                    rowData = localObject.geo.filter(function(el){return el.state == theState.split(",")[0].toUpperCase();}); // load row data from array of objects
                    columnArray = [
                        {formatter:"rowSelection", hozAlign:"center", headerHozAlign:"center", width:10, headerSort:false},
                        
                        {title:"County", field:"name", width:170},
                        {title:"Population", field:"pop", width:110, hozAlign:"right", headerSortStartingDir:"desc", sorter:"number", formatter:"money", formatterParams:{precision:false}},
                        {title:"Sq Miles", field:"sqmiles", width:90, hozAlign:"right", sorter:"number"},
                        {title:"Per Mile", field:"permile", width:100, hozAlign:"right", sorter:"number"},
                    ];
                }
                currentRowIDs = [];
                if(hash.geo) {
                    currentRowIDs = hash.geo.split(',');
                }

                // Confirms rowData is available.
                console.log("showTabulatorList rowData: ");
                console.log(rowData);

                geotable = new Tabulator("#tabulator-geotable", {
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
                });
                /*
                geotable.on("dataSorting", function(sorters){
                    alert("dataSorting1");
                    updateMapColors("geomap");
                });
                */
                geotable.on("dataSorted", function(sorters, rows){
                    //sorters - array of the sorters currently applied
                    //rows - array of row components in their new order

                    console.log("REACTIVATE AND TEST")
                    //updateMapColors("geomap");
                });

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
                consoleLog("Before Update Map Colors Tabulator list displayed. State: " + theState);

                if(hash.geo) {
                    let currentGeoIDs = hash.geo.split(',');
                    geotable.on("tableBuilt", function() {
                        //alert("currentGeoIDs " + currentGeoIDs)
                        geotable.selectRow(currentGeoIDs); // Uses "id" of incoming rowData, which is the fips geo value. US01097,US01098
                    });
                }

            }, 100 );
            }); // End wait for element #tabulator-geotable
        }
        //geotable.selectRow(geotable.getRows().filter(row => row.getData().name == 'Fulton County, GA'));
        //geotable.selectRow(geotable.getRows().filter(row => row.getData().name.includes('Ba')));

        // Place click-through on checkbox - allows hashchange to update row.
        //$('.tabulator-row input:checkbox').prop('pointer-events', 'none'); // Bug - this only checks visible
        

    } else {
      attempts = attempts + 1;
      loadTabulator();
      if (attempts < 4000) {
        // To do: Add a loading image after a coouple seconds. 2000 waits about 300 seconds.
        setTimeout( function() {
          showTabulatorList(element, attempts);
        }, 100 );
      } else {
        alert("Tabulator JS not available for displaying " + element.scope + ". (4000 attempts by navigation.js)")
      }
    }
}
function updateSelectedTableRows(geo, geoDeselect, attempts) {
    console.log("updateSelectedTableRows"); // Got called when removing everything from localsite.js include. Occurs 10 times here: http://localhost:8887/explore/locations/#geo=US13251
                    
    let hash = getHash();
    if (!hash.state) {
        console.log("ALERT - A state value is needed in the URL")
    } else {
        if (typeof geotable.getRows === "function") {
            //alert("geotable.getRows === function")
            // #tabulator-geotable
            //geotable.selectRow(geotable.getRows().filter(row => row.getData().name.includes('Ba')));
            if (geo) {
                $.each(geo.split(','), function(index, value) {
                    geotable.selectRow(geotable.getRows().filter(row => row.getData().id == value));
                });
            }
            // Row Display Test - scroll down to see which rows were not initially in DOM.
            //$('.tabulator-row input:checkbox').css('display', 'none');

            //var selectedRows = ; //get array of currently selected row components.
            let county_names = []
            $.each(geotable.getSelectedRows(), function(index, value) {
                // TODO - Group by state
                county_names.push(value._row.data.name.split(",")[0].replace(" County",""));
                //if (geoDeselect.length && ) {

                //}
            });
            console.log("county_names from geotable{} set by current tabulator: " + county_names.toString());
            $(".counties_title").text(county_names.toString().replaceAll(",",", "));
        } else {
          attempts = attempts + 1;
          if (attempts < 200) {
            // To do: Add a loading image after a coouple seconds. 2000 waits about 300 seconds.
            setTimeout( function() {
              updateSelectedTableRows(geo,geoDeselect,attempts);
            }, 20 );
          } else {
            alert("geotable.getRows not available after " + attempts + " attempts.")
          }
        }
    }
}

function updateMapColors(whichmap) {
    waitForElm('#' + whichmap + " .leaflet-pane").then((elm) => {
        console.log("Update #" + whichmap + " colors")
        let hash = getHash();
        let layerName = hash.state.split(",")[0].toUpperCase() + " Counties";
        var sortedData = geotable.getData("active").map(function(row) {
            return row.location;
        });
        //alert("layerName " + layerName);

        if (location.host.indexOf('localhost') >= 0) {
            // Add color to this log
            //alert("To debug: Cannot read properties of undefined (reading 'eachLayer')")

            // Not working, but prevents error in subsequent line
            waitForVariable('geoOverlays[layerName]', function() {

                // Working. If it stops working, check if we need to wait for geoOverlays[layerName]
                geoOverlays[layerName].eachLayer(function(layer) {
                    var location = layer.feature.properties.COUNTYFP; // Assuming 'name' property in GeoJSON
                    var index = sortedData.indexOf(location);
                    var colorIntensity = index >= 0 ? (index / sortedData.length) * 360 : 0; // Adjust color intensity based on position
                    // Makes the background transparent pink instead of blue. All turn back to blue when clicking.
                    layer.setStyle({ fillColor: "hsl(" + colorIntensity + ", 100%, 50%)" });
                });
            });
        }
    });
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
    var file = "https://map.georgia.org/explore/menu/data/cities.csv";
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
    $("#dataList").append( "<div><div><div style='float:right'>Add</div>" + rowArray[0] + "</div><div><b class='exporter'>Export Categories: </b><span class='exporter'> " + rowArray[2] + "</span></div><div>" + rowArray[3] + "</div><div>" + rowArray[4] + "</div><div><b>Product HS Codes: </b>" + rowArray[5] + "</div></div>");
    //<div>" + rowArray[6] + "</div><div>" + rowArray[7] + "</div>
}

var dataSet = [];

function displayListX() {
    console.log("displayList");
    var matchCount = 0;

    $("#dataList").html("");
    for(var i = 0; i < dataSet.length; i++) {
        if (i > 2) {
            //if (entry[0] > (startRange*100) && entry[0] < (endRange*100+99)) {
                matchCount++;
                // <input name='contact' type='checkbox' value='" + dataSet[i][0] + "'> 
                $("#dataList").append( "<div><div style='float:right'>Add<div></div>" + dataSet[i][0] + "</div><div><b class='exporter'>Export Categories: </b><span class='exporter'> " + dataSet[i][2] + "</span></div><div><b>Description: </b>" + dataSet[i][3] + "</div>");
                $("#dataList").append( "<div><b>Product HS Codes: </b>" + dataSet[i][5] + "</div></div>");
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
    alert(json.Message);
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

/* Allows map to remove selected shapes when backing up. */
document.addEventListener('hashChangeEvent', function (elem) {
    console.log("navigation.js detects URL hashChangeEvent");
    hashChanged();
}, false);

if(typeof hiddenhash == 'undefined') {
    var hiddenhash = {};
}
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

// For stateImpact colors
var colorTheStateCarbon = "#fcc"; // pink
var colorTheCountry = "#ccf" // lite blue
//loadScript(theroot + 'js/d3.v5.min.js', function(results) { // Allows lists to be displayed before maps
  // TODO: Apply the colors after list loaded
  /*
  colorTheStateCarbon = d3.scaleThreshold()
      .domain(d3.range(2, 10))
      .range(d3.schemeBlues[9]);
  colorTheCountry = d3.scaleThreshold()
      .domain(d3.range(2, 1000000))
      .range(d3.schemeBlues[9]);
  */
//});

function styleShape(feature) { // Called FOR EACH topojson row

  let hash = getHash(); // To do: pass in as parameter
  //console.log("feature: ", feature)

  var fillColor = 'rgb(51, 136, 255)'; // blue for borders
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
      fillColor = 'red';
      fillOpacity = .2;

      fillColor = 'white';
      fillOpacity = 0;

  } else if (hash.geoview == "countries") {
      let theValue = 2;
      //console.log("country: " + (feature.properties.name));
      if (localObject.countries && localObject.countries[feature.id]) {
        //alert("Country 2020 " + localObject.countries[feature.id]["2020"]);
        theValue = localObject.countries[feature.id]["2020"];
      }
      // TO DO - Adjust for 2e-7
      theValue = theValue/10000000;
      //fillColor = colorTheCountry(theValue);
      fillColor = colorTheCountry;
      //console.log("fillColor: " + fillColor + "; theValue: " + theValue + " " + feature.properties.name);
      fillOpacity = .5;
  } else if ((hash.geoview == "country" || (hash.geoview == "state" && !hash.state)) && typeof localObject.state != 'undefined') {
      let theValue = 2;
       if (localObject.state[getState(stateID)] && localObject.state[getState(stateID)].CO2_per_capita != "No data") {
        //console.log("state: " + stateID + " " + getState(stateID));
        //console.log("state: " + stateID + " " + localObject.state[getState(stateID)].CO2_per_capita);
        theValue = localObject.state[getState(stateID)].CO2_per_capita;
      }
      theValue = theValue/4; // Ranges from 0 to 26
      //fillColor = colorTheStateCarbon(theValue); // Stopped working. Wasn't a function. Maybe try to reactivate.
      fillColor = colorTheStateCarbon;
      //console.log("fillColor: " + fillColor + "; theValue: " + theValue + " " + feature.properties.name);
      fillOpacity = .5;
  } return {
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
    location.href = location.href.replace("http://", "https://");
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
if (typeof local_app.modelearth_root === 'function') {
    modelpath = local_app.modelearth_root();
}
//alert("modelpath " + modelpath)

if(location.host.indexOf('localhost') < 0 && location.host.indexOf('model.') < 0 && location.host.indexOf('neighborhood.org') < 0) { // When not localhost or other site that has a fork of io and community.
    // To do: allow "Input-Output Map" link in footer to remain relative.
    //modelpath = "https://model.earth/" + modelpath; // Avoid - use local_app.modelearth_root() instead - Check if/why used for #headerSiteTitle and hamburger menu
    ////modelroot = "https://model.earth"; // For embeds
}
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
    $("#navcolumn").show(); $("#showSideInBar").hide();
    if ($("#fullcolumn > .datascape").is(":visible")) { // When NOT embedded.
        if ($("#listcolumn").is(":visible")) {
            $('body').addClass('bodyLeftMarginFull'); // Creates margin on left for both fixed side columns.
            $('#listcolumn').removeClass('listcolumnOnly');
        }
    }
    $("#showSideInBar").hide();
    if(document.getElementById("containerLayout") != null) {
        $('#navcolumn').addClass("navcolumnClear");
        $('body').addClass('bodyLeftMarginNone');
    } else {
        $("#fullcolumn #showNavColumn").hide();
        $('body').addClass('bodyLeftMargin'); // Margin on left for fixed nav column.
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
    $("#sideIcons").show();
    $("#navcolumn").hide();
    $("#showNavColumn").show();$("#showSideInBar").hide();
    $('body').removeClass('bodyLeftMargin');
    $('body').removeClass('bodyLeftMarginFull');
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
        location.href = local_app.modelearth_root() + "/localsite/info/#" + hashString;
    } else {
        goHash({"set":set,"indicators":hash.indicators});
    }
}
function applyNavigation() { // Waits for localsite.js 'localStart' variable so local_app path is available.

    // To do: fetch the existing background-image.
    
    let modelsite = Cookies.get('modelsite');
    let hash = getHash();
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
    if (location.href.indexOf("dreamstudio") >= 0 || param.startTitle == "DreamStudio" || location.href.indexOf("/swarm/") >= 0 || location.href.toLowerCase().indexOf("lineara") >= 0) {
        localsiteTitle = "DreamStudio";
        $(".siteTitleShort").text("DreamStudio");
        param.titleArray = [];
        //param.headerLogo = "<a href='https://dreamstudio.com'><img src='https://dreamstudio.com/dreamstudio/img/logo/dreamstudio-text.png' style='height:23px'></a>";
        
        let siteRoot = "";
        if (location.host.indexOf("localhost") >= 0) {
            siteRoot = "/dreamstudio";
        }
        if (!param.headerLogo) {
            param.headerLogo = "<a href='" + siteRoot + "/'><img src='/storyboard/img/logo/ds/favicon.png' style='float:left;width:38px;margin-right:7px'><img src='/storyboard/img/logo/ds/dreamstudio-text.png' alt='DreamStudio' style='height:22px; margin-top:9px' class='headerLogoDesktop'></a>";
        }
        param.headerLogoNoText = "<img src='/storyboard/img/logo/ds/favicon.png' style='float:left;width:38px;margin-right:7px'>";
        if (location.href.indexOf("/seasons") >= 0) {
            changeFavicon("/storyboard/img/logo/ds/faveye.png");
            param.headerLogo = "<a href='" + siteRoot + "/'><img src='/storyboard/img/logo/ds/faveye.png' style='float:left;width:38px;margin-right:7px'><img src='/storyboard/img/logo/ds/dreamstudio-text.png' alt='DreamStudio' style='height:22px; margin-top:9px' class='headerLogoDesktop'></a>";
        } else {
            changeFavicon("/localsite/img/logo/apps/dreamstudio.png");
        }
        if (location.host.indexOf("dreamstudio") >= 0) {
            //param.headerLogo = param.headerLogo.replace(/\/dreamstudio\//g,"\/");
        }
        showClassInline(".dreamstudio");
    } else if (location.href.indexOf("atlanta") >= 0) {
        showLeftIcon = true;
        $(".siteTitleShort").text("Civic Tech Atlanta");
        param.titleArray = ["civic tech","atlanta"]
        param.headerLogo = "<a href='https://codeforatlanta.org'><img src='" + local_app.modelearth_root() + "/community/img/logo/orgs/civic-tech-atlanta-text.png' style='width:186px;padding-top:8px'></a>";
        
        localsiteTitle = "Civic Tech Atlanta";
        changeFavicon(local_app.modelearth_root() + "/localsite/img/logo/apps/neighborhood.png")
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
        param.headerLogo = "<a href='https://georgia.org'><img src='" + local_app.modelearth_root() + "/localsite/img/logo/states/GA.png' style='width:140px;padding-top:4px'></a>";
        param.headerLogoNoText = "<a href='https://georgia.org'><img src='" + local_app.modelearth_root() + "/localsite/img/logo/states/GA-notext.png' style='width:50px;padding-top:0px;margin-top:-1px'></a>";
        localsiteTitle = "Georgia.org";
        changeFavicon(local_app.modelearth_root() + "/localsite/img/logo/states/GA-favicon.png");
        if (location.host.indexOf("locations.pages.dev") >= 0 || location.host.indexOf("locations.georgia.org") >= 0) {
            showClassInline(".acct");
            showClassInline(".garesource");
        }
        showClassInline(".georgia");
        if (location.host.indexOf("locations.pages.dev") >= 0 || location.host.indexOf("locations.georgia.org") >= 0) {
            // To activate when filter are ready
            //showClassInline(".earth");
        }
        $('#headerOffset').css('display', 'block'); // Show under site's Drupal header
        if (location.host.indexOf('localhost') >= 0) {
            //showClassInline(".earth"); // Show extra side nav
            earthFooter = true;
        }
        
    } else if (!Array.isArray(param.titleArray) && (param.startTitle == "Neighborhood.org" || location.host.indexOf('neighborhood.org') >= 0)) {
        showLeftIcon = true;
        $(".siteTitleShort").text("Neighborhood Modeling");
        param.titleArray = ["neighbor","hood"]
        param.headerLogoSmall = "<img src='" + local_app.modelearth_root() + "/localsite/img/logo/apps/neighborhood.png' style='width:40px;opacity:0.7'>"
        localsiteTitle = "Neighborhood.org";
        changeFavicon(local_app.modelearth_root() + "/localsite/img/logo/apps/neighborhood.png")
        showClassInline(".neighborhood");
        earthFooter = true;
    } else if (!Array.isArray(param.titleArray) && (location.host.indexOf("democracy.lab") >= 0)) {
        showLeftIcon = true;
        $(".siteTitleShort").text("Democracy Lab");

        param.headerLogo = "<img src='" + local_app.modelearth_root() + "/localsite/img/logo/partners/democracy-lab.png' style='width:190px;margin-top:15px'>";
        param.headerLogoSmall = "<img src='" + local_app.modelearth_root() + "/localsite/img/logo/partners/democracy-lab-icon.jpg' style='width:32px;margin:4px 8px 0 0'>";
        showClassInline(".dlab'");
        earthFooter = true;
    } else if (!Array.isArray(param.titleArray) && !param.headerLogo) {
    //} else if (location.host.indexOf('model.earth') >= 0) {
        showLeftIcon = true;
        if (location.host.indexOf("planet.live") >= 0) {
            $(".siteTitleShort").text("Planet Live");
            param.titleArray = ["planet","live"]
            localsiteTitle = "Planet Live";
        } else {
            $(".siteTitleShort").text("Model Earth");
            param.titleArray = ["model","earth"]
            localsiteTitle = "Model Earth";
        }
        param.headerLogoSmall = "<img src='" + local_app.modelearth_root() + "/localsite/img/logo/earth/model-earth.png' style='width:34px; margin-right:2px'>";
        changeFavicon(local_app.modelearth_root() + "/localsite/img/logo/earth/model-earth.png")
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
        $("body").wrapInner( "<div id='fullcolumn'></div>"); // Creates space for navcolumn
        
        
        $("body").addClass("flexbody"); // For footer to stick at bottom on short pages
        $("body").wrapInner("<main class='flexmain' style='position:relative'></main>"); // To stick footer to bottom
        // min-height allows header to serve as #filterbaroffset when header.html not loaded
        // pointer-events:none; // Avoid because sub-divs inherite and settings dropdowns are then not clickable.
        if(document.getElementById("datascape") == null) {
            $("#fullcolumn").prepend("<div id='datascape' class='datascape'></div>\r");
        }
    });
    waitForElm('#datascape').then((elm) => {
        let listColumnElement = "<div id='listcolumn' class='listcolumn pagecolumn sidelist pagecolumnLow pagecolumnLower' style='display:none'><div class='listHeader'><div class='hideSideList close-X-sm' style='position:absolute;right:0;top:0;z-index:1;margin-top:0px'>✕</div><h1 class='listTitle'></h1><div class='listSubtitle'></div><div class='sideListSpecs'></div></div><div id='listmain'><div id='listcolumnList'></div></div><div id='listInfo' class='listInfo content'></div></div>\r";
        if(document.getElementById("datascape") != null || document.getElementById("datascape1") != null) {
            $("#datascape").addClass("datascape");
            $("#datascape").addClass("datascapeEmbed");
            $("#fullcolumn > #datascape").removeClass("datascapeEmbed");  // When #datascape is NOT embedded.
            if (!$("#datascape").hasClass("datascapeEmbed")) {
                $("#datascape").addClass("datascapeTop");
            }

            $('body').removeClass('bodyLeftMarginFull'); // Gets added back if navcolumn is displayed.
            // Wait for template to be loaded so it doesn't overwrite listcolumn in #datascape.
            //waitForElm('#insertedText').then((elm) => {
            waitForElm('#fullcolumn > .datascapeTop').then((elm) => { // When #datascape is NOT embedded.
                // Place list in left margin for whole page use.
                //$("#datascape").prepend(listColumnElement);
                $("body").prepend(listColumnElement);
                listColumnElement = "";
                //$('body').addClass('bodyLeftMarginFull'); // Avoid here. Places gap on /community
            });
            
        } else {
            console.log("#datascape not available");
        }
        if(document.getElementById("navcolumn") == null) {
            let prependTo = "#datascape";
            // BUG #fullcolumn > .datascape does not seem to be loaded yet
            if ($("#fullcolumn > .datascape").is(":visible")) { // When NOT embedded
                console.log("Not embed");
                //prependTo = "body"; // Might not have worked intermintantly for the following prepend here: http://localhost:8887/recycling/
            }
            // min-height added since ds.ai html cropping to short side

            // REMOVED pagecolumnLower class from initial load
            // TO DO: Remove pagecolumnLow when there is no top nav. It provides a minimum of 60px when taller header is hidden.
            $(prependTo).prepend("<div id='navcolumn' class='navcolumn pagecolumn greyDiv noprint sidecolumnLeft pagecolumnLow liteDiv' style='display:none; min-height:300px'><div class='hideSide close-X-sm' style='position:absolute;right:0;top:0;z-index:1;margin-top:0px'>✕</div><div class='navcolumnBar'></div><div class='sidecolumnLeftScroll'><div id='navcolumnTitle' class='maincat' style='display:none'></div><div id='listLeft'></div><div id='cloneLeftTarget'></div></div></div>" + listColumnElement); //  listColumnElement will be blank if already applied above.
        } else {
            // TODO - change to fixed when side reaches top of page
            console.log("navigation.js report: navcolumn already exists")
            $("#navcolumn").addClass("navcolumn-inpage");
        }

        $(document).on("click", ".showNavColumn", function(event) {
            console.log(".showNavColumn click");
            if ($("#navcolumn").is(':hidden')) {
                showNavColumn();
            } else {
                hideNavColumn();
            }
            let headerFixedHeight = $("#headerLarge").height();
            $('#cloneLeft').css("top",headerFixedHeight + "px");
        });
        $(document).on("click", ".hideSideList", function(event) {
            hideSide("list");
            event.stopPropagation();
            event.preventDefault();
        });
        $(document).on("click", ".hideSide", function(event) {
            hideSide("");
            console.log(".hideSide click");
        });

        $(document).on("click", ".showNavColumn, #navcolumn", function(event) {
          event.stopPropagation();
        });
        $(document).on('click', function(event) {
            if ($("#navcolumn").is(':visible')) {
                if ($('#fullcolumn').width() <= 800) {
                    hideSide();
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
                    headerFile = local_app.modelearth_root() + param.header;
                } else if (param.headerFile) {
                    modelpath = ""; // Use the current repo when custom headerFile provided. Allows for site to reside within repo.
                    headerFile = param.headerFile;
                } else {
                    headerFile = local_app.modelearth_root() + "/localsite/header.html";
                }

                //if (earthFooter && param.showSideTabs != "false") { // Sites includieng modelearth and neighborhood
                //  $(".showSideTabs").show(); // Before load headerFile for faster display.
                //}
                if (headerFile) {
                    // headerFile contains only navigation
                    //alert("headerFile " + headerFile);
                    waitForElm('#local-header').then((elm) => { 
                    $("#local-header").load(headerFile, function( response, status, xhr ) {
                        //alert("headerFile loaded");
                        waitForElm('#sidecolumnContent').then((elm) => { // Resides in header.html
                            //alert("got sidecolumnContent");
                            console.log("Doc is ready, header file loaded, place #cloneLeft into #navcolumn")

                            waitForElm('#navcolumn').then((elm) => { // #navcolumn is appended by this navigation.js script, so typically not needed.
                                $("#showNavColumn").show();
                                if(location.host.indexOf("dreamstudio") >= 0) {
                                    $("#sidecolumnContent a").each(function() {
                                      $(this).attr('href', $(this).attr('href').replace(/\/dreamstudio\//g,"\/"));
                                    });
                                }
                                let colEleLeft = document.querySelector('#sidecolumnContent');
                                let colCloneLeft = colEleLeft.cloneNode(true)
                                colCloneLeft.id = "cloneLeft";
                                $("#cloneLeftTarget").append(colCloneLeft);

                                waitForElm('#topicsMenu').then((elm) => { // From info/template-main.html
                                    let colEleRight = document.querySelector('#sidecolumnContent');
                                    let colCloneRight = colEleRight.cloneNode(true)
                                    colCloneRight.id = "cloneRight";

                                    $("#topicsMenu").prepend(colCloneRight);

                                    if (location.href.indexOf('desktop') >= 0 || location.host.indexOf('dreamstudio') >= 0 || location.href.indexOf('dreamstudio') >= 0 || location.href.indexOf('/swarm/') >= 0 || location.href.indexOf('/LinearA/') >= 0) {
                                        let storiesFile = "https://dreamstudio.com/seasons/episodes.md";
                                        //console.log("location.href index: " + location.href.indexOf("/dreamstudio/"));
                                        if(location.host.indexOf('localhost') >= 0) {
                                            storiesFile = "/dreamstudio/seasons/episodes.md";
                                        } else if (location.href.indexOf("dreamstudio") >= 0) {
                                            storiesFile = "/seasons/episodes.md";
                                        }
                                        waitForElm('#storiesDiv').then((elm) => {
                                            // TO DO - Lazy load elsewhere, and avoid if already loaded
                                            loadMarkdown(storiesFile, "storiesDiv", "_parent");
                                            console.log("after storiesFile")
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
                                        $(this).attr("src", local_app.modelearth_root() + $(this).attr('src'));
                                    } else {
                                    $(this).attr("src", modelpath + $(this).attr('src'));
                                }
                              }
                            });

                            if(location.host.indexOf('neighborhood') >= 0) {
                                // Since deactivated above due to conflict with header logo in app.
                                $('.neighborhood').css('display', 'block');
                            }
                            if (param.titleArray && !param.headerLogo) {
                                if (param.titleArray[1] == undefined) {
                                    if (param.titleArray[0] != undefined) {
                                        $('#headerSiteTitle').html(param.titleArray[0]);
                                    }
                                } else {
                                    //let titleValue = "<span style='float:left'><a href='" + climbpath + "' style='text-decoration:none'>";
                                    let titleValue = "<span style='float:left'><a href='/' style='text-decoration:none'>";
                                    
                                    let modelsite = Cookies.get('modelsite');
                                    if (modelsite && modelsite.length && modelsite != "model.earth") {
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

                            if (param.favicon) {
                                changeFavicon(param.favicon);
                            }

                            // WAS LIMITED TO HEADER
                            //$(document).ready(function() { // Needed for info/index.html page. Fast, but could probably use a timeout delay instead since we are already within the header.html load.
                            //alert("test2");
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
            $("body").append( "<div id='local-footer' class='flexfooter noprint'></div>\r" );
        } else {
            //$("#footer").addClass("flexfooter");
            $("#footer").prepend( "<div id='local-footer' class='flexfooter noprint'></div>\r" );
        }
        if (location.host.indexOf('localhost') >= 0 && param.showfooter != false && !param.footer) {
            earthFooter = true; // Need to drive localhost by settings in a file ignored by .gitignore
        }
        if (param["showfooter"] && param["showfooter"] == "false") {
        } else if (earthFooter || param.footer) {
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
                //alert(footerClimbpath)
            } else {
                footerClimbpath = climbpath;
            }
            $("#local-footer").load(footerFile, function( response, status, xhr ) {
                console.log("footerFile: " + footerFile);
                let pageFolder = getPageFolder(footerFile);
                // Append footerClimbpath to relative paths
                makeLinksRelative("local-footer", footerClimbpath, pageFolder);
            });
        }

        // SIDE NAV WITH HIGHLIGHT ON SCROLL

        // Not currently using nav.html, will likely use later for overrides.  Primary side nav resides in header.
        if (1==2 && param["navcolumn"]) {
            // Wait for header to load?

            let targetColumn = "#navcolumn";
            // Had ..
            $(targetColumn).load( modelpath + "/localsite/nav.html", function( response, status, xhr ) {
                activateSideColumn();
            });
        }
        // END SIDE NAV WITH HIGHLIGHT ON SCROLL
    });
} // end applyNavigation function

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

// SInce we may sometimes load before JQuery avoiding $(document).on("click", ".showSections", function(event) { etc.
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('showSections')) {
        goHash({'sidetab':'sections'});
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
        goHash({'sidetab':'desktop'});
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
    $("#sideTabs").show();
}
function showLocale() {
    $("#filterClickLocation").removeClass("filterClickActive");
    loadScript(theroot + 'js/navigation.js', function(results) { // Since pages like embeds don't pre-load nav
        openMapLocationFilter();
        $("#sideTabs").show();
        $("#filterLocations").appendTo($("#localeDiv"));
        $("#geomap").appendTo($("#rightTopMenu"));
        $("#locationFilterHolder").hide(); // Checked when opening with tab.
        $(".showLocale").addClass("active");
        $("#localePanel").show();
    });
}

// SETTINGS
$(document).on("change", ".sitemode", function(event) {
    if ($(".sitemode").val() == "fullnav" && $('#siteHeader').is(':empty')) { // #siteHeader exists. This will likely need to be changed later.
        layerName = getLayerName();
        window.location = "./#" + layerName;
    }
    sitemode = $(".sitemode").val();
    setSiteMode($(".sitemode").val());
    Cookies.set('sitemode', $(".sitemode").val());
    if ($(".sitemode").val() == "fullnav") {
        $('.showSearchClick').trigger("click");
    }
    //event.stopPropagation();
});
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
$(document).on("change", "#globecenter", function(event) { // Public or Dev
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
        Cookies.set('modelsite', $("#modelsite").val());

        // Apply the cookie
        location.reload();
    }
    setModelsite($("#modelsite").val());
});
$(document).on("change", ".sitebasemap", function(event) {
    sitebasemap = $(".sitebasemap").val();
    if (typeof Cookies != 'undefined') {
        Cookies.set('sitebasemap', $(".sitebasemap").val());
    }
    //event.stopPropagation();
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
//$('.showPrintOptions, .print_button').click(function(event) {
    //alert("show print2")
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
    let hash = getHash();
    if (hash.sidetab) {
        goHash({'sidetab':''});
    } else {
        if(location.href.indexOf("/seasons") >= 0) {
            goHash({'sidetab':'seasons'});
        } else {
            goHash({'sidetab':'sections'});
        }
    }
    event.stopPropagation();
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
$(document).on("click", ".showEarth", function(event) {
    showEarth("show");
    event.stopPropagation();
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
        closeSideTabs();
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
    //alert(layerJson)
    //console.log(layerJson);

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
                // alert($("#fullcolumn").width()) = null
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
        //alert(directlink)
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
                    //alert(layer) // Returns a nummber: 1,2,3 etc
                    var directlink = getDirectLink(thelayers[layer].livedomain, thelayers[layer].directlink, thelayers[layer].rootfolder, thelayers[layer].item);
                    //alert("directlink " + directlink);
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

    //$(theclass).css('display', 'inline');

    // Load when body head becomes available, faster than waiting for all DOM .js files to load.
    waitForElm('head').then((elm) => {
        var div = $("<style />", {
            html: theclass + ' {display: inline !important}'
        }).appendTo("head");
    });

    /*
    setTimeout( function() {
        $(theclass).css('display', 'inline');
    }, 1000);
    setTimeout( function() {
        $(theclass).css('display', 'inline');
    }, 2000);
    setTimeout( function() {
        $(theclass).css('display', 'inline');
    }, 5000);
    setTimeout( function() {
        $(theclass).css('display', 'inline');
    }, 10000);
    setTimeout( function() {
        $(theclass).css('display', 'inline');
    }, 30000);
    */
}
function imagineLocation() {
    if (location.href.indexOf('/info') == -1) {
        updateHash({"geoview":""}); // Prevents location filter from remaining open after redirect.
        location.href = local_app.modelearth_root() + "/localsite/info/" + location.hash;
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
        relocatedStateMenu.appendChild(state_select); // For apps hero
    }
    $("#hero_holder").show();
    $(".locationTabText").text($(".locationTabText").attr("title"));
}
function activateSideColumn() {
    // Make paths relative to current page
        $("#navcolumn a[href]").each(function() {
            if($(this).attr("href").toLowerCase().indexOf("http") < 0) {
                if($(this).attr("href").indexOf("/") != 0) { // Don't append if starts with /
                    $(this).attr("href", climbpath + $(this).attr('href'));
            }
        }
    })
        $("#navcolumn img[src]").each(function() {
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

    /*
    // Alternative to flaky $(this).scrollTop()+topMenuHeight; // this is the window
    function getScrollTop(){
        if(typeof pageYOffset != 'undefined'){
            //most browsers except IE before #9
            return pageYOffset;
        }
        else{
            var B= document.body; //IE 'quirks'
            var D= document.documentElement; //IE with doctype
            D= (D.clientHeight)? D: B;
            return D.scrollTop;
        }
    }
    */

    // HIGHLIGHT SIDE NAVIGATION ON SCROLL
    function currentSideID() {
        var scrollTop = window.pageYOffset || (document.documentElement.clientHeight ? document.documentElement.scrollTop : document.body.scrollTop) || 0;
        var topMenuHeight = 150;
        // Get container scroll position
        var fromTop = scrollTop+topMenuHeight; // this is the window
        //console.log('fromTop ' + fromTop);
        // Get id of current scroll item
        var cur = scrollItems.map(function(){
            // scrollItems is the sections fron nav.html, but just return the current one.
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
        //console.log('currentSideID id: ' + id);
        return id;
    }
    var lastID;
    
    $(window).scroll(function() {
        var id = currentSideID();
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
                // Page without sections
            } else if (id == "intro") {
                // To do: Change to highlight the uppermost section.
                menuItems.filter("[href='..\/tools\/#']").addClass("active");
            } else {
                //alert("id " + id)
                menuItems.filter("[href*='#"+id+"']").addClass("active"); // *= means contains
                menuItems.filter("[hashid='" + id + "']").addClass("active");
            }
          }
          /*
          menuItems
             .parent().removeClass("active")
             .end().filter("[href*='#"+id+"']").parent().addClass("active");
           */
       } else {
            //console.log("Scrolling, no action");
       }
       
      if (id == "intro") {
        console.log("headerbar show");
        $('.headerbar').show();

        // For when entering from a #intro link from another page.
        // Would be better to disable browser jump to #intro elsewhere.
        //$('html,body').scrollTop(0); 
      }
    });

    // Initial page load
    var currentSection = currentSideID();
    //alert("currentSection " + currentSection)
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
    if (this.value) {
        $("#region_select").val("");
        // Later a checkbox could be added to retain geo values across multiple states
        // Omitting for BC apps page  ,'geoview':'state'
        goHash({'state':this.value,'geo':'','name':'','regiontitle':''}); // triggers renderGeomapShapes("geomap", hash); // County select map
        //$("#filterLocations").hide(); // So state appears on map immediately
    } else { // US selected
        hiddenhash.state = ""; // BugFix - Without this prior state stays in dropdown when choosing no state using top option.
        goHash({'geoview':'country','state':'','geo':''});
    }
});
$(document).on("click", "#filterClickLocation", function(event) {

    if ($("#draggableSearch").is(':visible')) {
        $("#draggableSearch").hide();
        //alert("append")
        //$("#filterLocations").prependTo($("#locationFilterHolder"));
        $("#filterLocations").hide();
    }
    /*
    if ($("#localePanel").is(':visible')) {
        closeSideTabs();
        $("#topicsPanel").show(); // So return to apps menu shows something
        $(".rightTopMenuInner div").removeClass("active"); // So not displayed when returning
    }
    */

    filterClickLocation();
    event.stopPropagation();
    return;



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
    showApps("#bigThumbMenu");
    event.stopPropagation();
});

function showApps(menuDiv) {
    loadScript(theroot + 'js/navigation.js', function(results) {

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
                closeExpandedMenus($(".showSections")); // Close all sidetab's prior to opening new tab
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
    //alert("filterLocationChange")
    $("#bigThumbPanelHolder").hide();
    $('.showApps').removeClass("filterClickActive"); ////updateHash({'appview':''});
    let distanceFilterFromTop = 120;
    if ($("#locationFilterHolder #filterLocations").length) {
        distanceFilterFromTop = $("#filterLocations").offset().top - $(document).scrollTop();
    }
    //alert("distanceFilterFromTop  " + distanceFilterFromTop);
    //$('.hideMetaMenuClick').trigger("click"); // Otherwise covers location popup. Problem: hides hideLayers/hideLocationsMenu.
    

    if ($("#filterLocations").is(':visible')) { // && (distanceFilterFromTop < 300 || distanceFilterFromTop > 300)
        //alert("closeLocationFilter()");
        closeLocationFilter();
        console.log("closeLocationFilter");
    } else { // OPEN MAP FILTER
        //alert("openLocationFilter() 1");
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
    //alert("openMapLocationFilter");
    let hash = getHash();

    if (!hash.geoview) { // && hash.sidetab != "locale"
        let currentStates = [];
        if(hash.geo && !hash.state) {
            let geos = hash.geo.split(",");
            for(var i = 0 ; i < geos.length ; i++) {
                currentStates.push(getKeyByValue(localObject.us_stateIDs, Number(geos[i].replace("US","").substring(0,2))));
            }
        }

        /*
        if (currentStates.length > 0) { // Multiple states, use first one.
            goHash({"geoview":"state","state":currentStates[0]});
        } else {
            goHash({"geoview":"state"});
        }
        */
    }
    ///$("#geoPicker").show();
    $("#geomap").appendTo($("#geomapHolder")); // Move back from sidetabs


    $(".locationTabText").text("Locations");
    $("#topPanel").hide();
    $("#showLocations").show();
    $("#hideLocations").hide();

    // Not sure why, but show() is not revealing again when Locations tab closed.
    //$("#hero_holder").hide();

    if (typeof state_select_holder != "undefined") {
        state_select_holder.appendChild(state_select); // For apps hero
    }

    if (hash.geo) {
        let geoDeselect = "";
        if (hash.regiontitle != priorHash.regiontitle || hash.state != priorHash.state) {
            geoDeselect = hash.geo
            delete hash.geo;
        }
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
        $("#filterLocations").prependTo($("#locationFilterHolder")); // Move back from sidetabs
        // Here we show the interior, but not #locationFilterHolder.
        // Jul2 $("#filterLocations").show();$("#imagineBar").show();
        //if ($("#filterLocations").length) {
            $('html,body').animate({
                scrollTop: $("#filterLocations").offset().top - $("#headerbar").height() - $("#filterFieldsHolder").height()
            });
        //} else {
        //    console.log("ALERT #filterLocations not available yet.")
        //}
    });
    if (location.host == 'georgia.org' || location.host == 'www.georgia.org') { 
        $("#header.nav-up").show();
    }
}
function closeLocationFilter() {
    $(".locationTabText").text($(".locationTabText").attr("title"));
    $("#showLocations").hide();
    $("#hideLocations").show();
    //$(".locationTabText").text("Entire State");
    $("#locationFilterHolder").hide();
    $("#filterLocations").hide(); // Not sure why this was still needed.
    $("#imagineBar").hide();
    $("#filterClickLocation").removeClass("filterClickActive");
    if (location.host == 'georgia.org' || location.host == 'www.georgia.org') { 
        $("#header.nav-up").hide();
    }

    if (typeof relocatedStateMenu != "undefined") {
        relocatedStateMenu.appendChild(state_select); // For apps hero
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
        //alert("headerbar hide");
        if (!$("#filterFieldsHolder").is(':visible')) { // Move to top if no small top bar
          $(".pagecolumn").addClass("pagecolumnToTop");
        }

        $('.headerbar').hide();
        $('.headerOffset').hide();
        $('#logoholderbar').show();

        // BUGBUG - occuring on initial reload when page is a little from top.
        //$('#logoholderside').show();

        if (!$("#filterFieldsHolder").hasClass("filterFieldsHidden")) {
          $("#filterFieldsHolder").addClass("filterFieldsHolderFixed");
          $("body").addClass("filterFieldsBodyTop");

          //if (param.showheader != "false") {
          if (param.showfilters == "true") {
            $('.showMenuSmNav').show(); 
          }
          $('.headerOffset').hide();
          $('.bothSideIcons').removeClass('sideIconsLower');$(".pagecolumn").removeClass("pagecolumnLower");
          $('#headerbar').hide(); // Not working
          $('#headerbar').addClass("headerbarhide");
        }
        if (sideTopOffsetEnabled) {
          //$('.sidecolumnLeft').css("top","54px");
        }
        //alert("#headerbar hide")
        //$('#showNavColumn').css("top","7px");
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
      //alert(mapHolderInner)
      console.log('topReached - fixed side map position');
      $('#mapHolderInner').addClass('mapHolderFixed');
      $("#mapHolderInner").css("max-width",mapHolderInner);
      $('#mapHolderInner').removeClass('mapHolderBottom');
      //alert("fixed position")
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