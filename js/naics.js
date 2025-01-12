// Displays list of industries to identify local areas of impact
// View at https://model.earth/localsite/info/#state=NY

// SEQUENCE
// refreshNaicsWidget()
// loadIndustryData()
//  - Gets NAICS for selected state or set of counties
//  - Also loads US Supply Chain Inflow-Outflow without NAICS filter via applyIO("")
// renderIndustryChart()
// topRatesInFips() - Top industry rows for a specific set of fips (states and counties)

let initialNaicsLoad = true;
if (typeof dataObject == 'undefined') {
    var dataObject = {};
}
if(typeof localObject == 'undefined') {
    var localObject = {};
}

// For v2
let industries = d3.map(); // Populated in promises from industryTitleFile
let epaSectors = d3.map(); // Populated from sectorsJsonFile

let stateID = {AL:1,AK:2,AZ:4,AR:5,CA:6,CO:8,CT:9,DE:10,FL:12,GA:13,HI:15,ID:16,IL:17,IN:18,IA:19,KS:20,KY:21,LA:22,ME:23,MD:24,MA:25,MI:26,MN:27,MS:28,MO:29,MT:30,NE:31,NV:32,NH:33,NJ:34,NM:35,NY:36,NC:37,ND:38,OH:39,OK:40,OR:41,PA:42,RI:44,SC:45,SD:46,TN:47,TX:48,UT:49,VT:50,VA:51,WA:53,WV:54,WI:55,WY:56,AS:60,GU:66,MP:69,PR:72,VI:78,}
let stateAbbr;
let initialPageLoad = true;

// TO DO - Point at US naics Gaurav generated and remove "GA" now that EPA has all states.
// TO DO - Use the 73 Sectors loaded below with io/js/bubble.js (previously 389)

// Phasing out these columns: Columns from 6_state_all
// id  COUNTY  GEO_TTL NAICS_Sector    NAICS2012_TTL   state   relevant_naics  estab_agg   emp_agg payann_agg  emp_api payann_api  estab_api
// 759 13  999 Statewide   55  Corporate, subsidiary, and regional managing offices    13  551114  1541.3499999999995  110283.20000000004  11605999.4  116336.0    12059746.4  1542.8


// INIT
let priorHash_naicspage = {};
initialWidgetLoad();
if (typeof hiddenhash == 'undefined') {
    var hiddenhash = {}; // Use var only. Declaired in localsite.js
}
function initialWidgetLoad() {
    let hash = getHash();
    if (!hash.indicators) {
        hiddenhash.indicators = "ACID,ETOX,EUTR,GHG,HTOX,LAND,OZON,PEST,SMOG,WATR";
    }
    refreshNaicsWidget(true);
    waitForElm('#sectorListTitles').then((elm) => {
        waitForElm('#sector-list .sector-list-table').then((elm) => {
            $("#sectorListTitles").prependTo($("#sector-list > div"));
            $("<style>#sector-list > div { margin-top:50px !important}</style>").prependTo($("#sector-list > div"));
        });
    });
}

// remove refresh 1 and refresh 3

document.addEventListener('hashChangeEvent', function (elem) {
    let hash = getHash();
    if (hiddenhash.debug && location.host.indexOf('localhost') >= 0) {
        //alert('Localhost Alert: hashChangeEvent invoked by naics.js'); // Invoked twice by iogrid inflow-outflow chart
    }
    //let hash = loadParams(location.search,location.hash);
    //alert("naics.js detects hash change. New hash:\r\r" + JSON.stringify(hash) + "\r\rPrior hash:" + JSON.stringify(priorHash_naicspage));
    
    if (!objectsMatch(hash,priorHash_naicspage)) {
        //alert("hashChangeEvent " + location.hash)
        refreshNaicsWidget(false);
    }            
 }, false);

// For v2
// BUGBUG - Use a small file with just two columns
// Used in old version, but it contains 2,4,6 naics
// https://github.com/ModelEarth/community-data/blob/master/us/id_lists/industry_id_list.csv
//let industryTitleFile = local_app.community_data_root() + "us/state/" + stateAbbr + "/industries_state" + stateID + "_naics6_state_all.tsv";
let industryTitleFile = "/localsite/info/naics/lookup/6-digit_2012_Codes.csv"; // Source: https://www.census.gov/eos/www/naics/downloadables/downloadables.html
function getIndustryLocFileString(catsize) {
    //return local_app.community_data_root() + "industries/naics/US/country/US-2021-Q1-naics-" + catsize + "-digits.csv"; // Removed
    return local_app.community_data_root() + "industries/naics/US/country/US-census-naics" + catsize + "-2021.csv";
    //return local_app.community_data_root() + "industries/naics/US/country/US-census-naics" + catsize + "-2021.csv";
}
// Copied from v2 - Not yet implemented
// Need to place in a function with let hash = getHash();
//let industryZipFile = getIndustryZipPath(hash.zip); // BUGBUG
function getIndustryZipPath(zip) {
    if (zip == undefined) {
        return;
    }
    return local_app.community_data_root() + "us/zipcodes/naics/" + zip.replace(/(.{1})/g,"\/$1") + "/zipcode" + zip + "-census-naics6-2018.csv";
}

function refreshNaicsWidget(initialLoad) {
    //alert("refreshNaicsWidget() hiddenhash.indicators: " + hiddenhash.indicators);

    //hiddenhash.naics is populated after changing state in hash, not on initial load (unless set in param.naics within page).
    //alert("refreshNaicsWidget() hiddenhash.naics: " + hiddenhash.naics);

    let hash = getHash(); // Includes hiddenhash
    console.log("refreshNaicsWidget hash.naics: " + hash.naics + " and prior naics: " + priorHash_naicspage.naics);

    if (hash.set != priorHash_naicspage.set) {
        if (!hash.set) {
            $('#pageTitle').hide();
        } else {
            if (hash.set == "air") {
                $('#pageTitle').text('Air and Climate')
            } else if (hash.set == "water") {
                $('#pageTitle').text('Water Use and Quality')
            } else if (hash.set == "land") {
                $('#pageTitle').text('Land Use')
            } else if (hash.set == "energy") {
                $('#pageTitle').text('Energy Use')
            } else if (hash.set == "prosperity") {
                $('#pageTitle').text('Jobs and Value Added')
            } else if (hash.set == "health") {
                $('#pageTitle').text('Health Impact')
            }
            $('#pageTitle').show();
        }
        $(".impactIcons div").removeClass("active");
        if (hash.set) {
            const capitalizeSetName = hash.set.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                return letter.toUpperCase();
            });
            $(".impactIcons div:contains(" + capitalizeSetName + ")").addClass("active");
        }
    }

    // Exit if no change to: county (geo) or state.
    if (!initialLoad) {
        if (!(hash.geo != priorHash_naicspage.geo || hash.state != priorHash_naicspage.state)) {
            console.log("No geo change for refreshNaicsWidget()");
            priorHash_naicspage = $.extend(true, {}, getHash()); // Clone/copy object without entanglement
            initialNaicsLoad = false;
            return;
        }
    }

    if (hash.geo){
        let fip = hash.geo.split("US")[1]   
        if (fip.startsWith("0")) {
            dataObject.stateshown = hash.geo.split("US0")[1]
        } else {
            dataObject.stateshown = hash.geo.split("US")[1]
        }
    }
    //[fips,dataObject.stateshown]=getStateFips(hash);
    dataObject.stateshown = getStateFips(hash);

    if (hash.show == "undefined") { // To eventually remove
        delete hash.show; // Fix URL bug from indicator select hamburger menu
        updateHash({'show':''}); // Remove from URL hash without invoking hashChanged event.
        console.log("REMOVED hash=undefined");
    }

    //hash = loadParams(location.search,location.hash); // Also used by loadIndustryData(hash)
    //hash = mix(param,hash); // Add include file's param values.



    // Get naics and set titles
    getNaics_setHiddenHash2(hash.show); // Sets hiddenhash.naics for use by other widgets.
    // Get the hash again - since hiddenhash.naics is set in getNaics_setHiddenHash2
    hash = getHash(); // Get new hiddenhash

    /*  
    if (!hash.show || hash.show != priorHash_naicspage.show) { // GET NAICS BASED ON THEME (recycing, bioeconomy, etc.)
        // Initial load
        //alert("hash.show " + hash.show)
        getNaics_setHiddenHash2(hash.show); // Sets hiddenhash.naics for use by other widgets.

        // Get the hash again - hiddenhash.naics is set in getNaics_setHiddenHash2
        hash = getHash(); // Get new hiddenhash
    } else if (hash.naics != priorHash_naicspage.naics) { // IF NAICS, AVOID THEME NAICS (from show) 
        //alert("hash.naics " + hash.naics);
    } else if (hash.state != priorHash_naicspage.state) {
        // Not working yet
        //getNaics_setHiddenHash2(hash.show); // Show the state name above naics list.
    } else if (hash.catsize != priorHash_naicspage.catsize) {
        //getNaics_setHiddenHash2(hash.show);
    }
    */

    let loadNAICS = false;
    // The following will narrow the naics to the current location
    
    if (hash.regiontitle != priorHash_naicspage.regiontitle) {
        if (!hash.regiontitle) {
            if(!hash.geo) {
                
            }
        } else {
            // BUGBUG - check the implications
            hiddenhash.loctitle = hash.regiontitle;
            $("#region_select").val(hash.regiontitle.replace(/\+/g," "));
            hiddenhash.geo = $("#region_select option:selected").attr("geo");
            hash.geo = $("#region_select option:selected").attr("geo");
            // Avoid this:
            //hash.geo = hiddenhash.geo; // Used by naics.js
        }
        loadNAICS = true;
    } else if (hash.state != priorHash_naicspage.state) {
        // Occurs on INIT if there is a state, and when changing the state.
        //alert("hash.state change call loadIndustryData(hash). hash.state " + hash.state);
        // Also supports when user has switched from state back to national.
        loadNAICS = true;
    } else if (hash.show != priorHash_naicspage.show) {
        loadNAICS = true;
    } else if (hash.geo != priorHash_naicspage.geo) {
        loadNAICS = true;
    } else if ((hash.naics != priorHash_naicspage.naics) && hash.naics && hash.naics.indexOf(",") > 0) { // Skip if only one naics
        loadNAICS = true;
    } else if (hash.catsize != priorHash_naicspage.catsize) {
        loadNAICS = true;
    } else if (hash.catsort != priorHash_naicspage.catsort) {
        loadNAICS = true;
    } else if (hash.x != priorHash_naicspage.x || hash.y != priorHash_naicspage.y || hash.z != priorHash_naicspage.z) {
        loadNAICS = true; // Bubblechart axis change.
        //alert("xyz changed")
    } else {
        if (hash.name && hash.name != priorHash_naicspage.name) {
            console.log("Exit refreshNaicsWidget - not for name change");
            // BUGBUG - Only return here if no other sector-related hash changes occured.
            return;
        }
        if (!hash.state && (initialNaicsLoad || priorHash_naicspage.state)) {
            // initialNaicsLoad prevents calling when clicking Locations tab (geoview=country) or opening upper right.
            if (location.host.indexOf('localhost') >= 0) {
                //alert("Localhost notice: loadNAICS called for any change - for US when no state");
            }
            console.log("loadNAICS for any change - for US when no state");
            loadNAICS = true; // Allows toggleBubbleHighlights() to be called, which calls midFunc
        }
    }
    /*
    } else if (hash.indicators != priorHash_naicspage.indicators) {
        // Avoid invoking change to widget since indicators is auto-detected
        //alert("hash.indicators " + hash.indicators);
        // initial
    } else if (hash.sectors != priorHash_naicspage.sectors) {
        // Avoid invoking change to widget since sectors is auto-detected
    }
    */

    console.log("hiddenhash.indicators " + hiddenhash.indicators)
    // hash.naics.indexOf(",") causes error when no hash.naics
    //if ((hash.naics != priorHash_naicspage.naics) && hash.naics.indexOf(",") < 0) {
        //if (!hash.indicators) {
            //param.indicators = "ACID,CCDD,CMSW,CRHW,ENRG,ETOX,EUTR,GHG,HAPS,HCAN,HNCN,HRSP,HTOX,JOBS,LAND,MNRL,NNRG,OZON,PEST,RNRG,SMOG,VADD,WATR";
            //hiddenhash.indicators = "ACID,CCDD,CMSW,CRHW,ENRG,ETOX,EUTR,GHG,HAPS,HCAN,HNCN,HRSP,HTOX,JOBS,LAND,MNRL,NNRG,OZON,PEST,RNRG,SMOG,VADD,WATR";
            
            // Shows too many (all) in input-output chart
            // Commercial Municipal Solid Waste outweighs other indicators.
            //hiddenhash.indicators = "ACID,CCDD,CMSW,CRHW,ENRG,ETOX,EUTR,GHG,HAPS,HCAN,HNCN,HRSP,HTOX,JOBS,LAND,MNRL,NNRG,OZON,PEST,RNRG,SMOG,VADD,WATR";

            // For input-output chart - This also originates somewhere else.
            //hiddenhash.indicators = "GHG,GCC,MGHG,OGHG,HRSP,OZON,SMOG,HAPS,ENRG,WATR";

        //}
    //}

    //alert("naics " + hash.naics)
    if (loadNAICS) {
        if (hash.state && hash.naics && hash.naics.indexOf(",") < 0) { // Hide when viewing just 1 naics within a state.
            $("#industryListHolder").hide();
            $("#industryDetail").show();
        } else if (!hash.state) {
            $("#industryListHolder").show();
            //$("#industries").html("<div class='contentpadding' style='padding-top:10px; padding-bottom:10px'>Select a location above for industry and impact details.</div>");
        
            $("#econ_list").hide(); // Hides loading icon when no state

            // Replaces loading icon
            //waitForElm('#econ_list').then((elm) => {
            //    $("#econ_list").html("<div class='contentpadding' style='padding-top:10px; padding-bottom:10px'>Select a location above for industry and impact details.</div>");
            //});
        } else {
            $("#industryListHolder").show();
            $("#industryDetail").hide();
        }
        if (!hash.catsort) {
            hash.catsort = "payann";
        }
        if (!hash.catsize) {
           hash.catsize = 6;
        }
        if (!hash.census_scope) {
           hash.census_scope = 'state';
        }

        // v2
        if ((location.host.indexOf('localhost') >= 0 || hash.beta == "true") || location.href.indexOf('/info/naics/') >= 0) {

            $("#industryTableHolder").show();
            $("#sectorTableHolder").show();
            if (hash.catsize == "6") {
                //hash.catsize = "2"
            }
            let industryLocDataFile = getIndustryLocFileString(hash.catsize);
            if (location.host.indexOf('localhost') >= 0) {
                waitForElm('#tabulator-industrytable-intro').then((elm) => {
                    // Occurs everytime state or county changes.
                    //$("#tabulator-industrytable-datalink").html("<a href='" + industryLocDataFile + "''>" + industryLocDataFile + "</a><br>");
                    $("#tabulator-industrytable-realitystream").attr("href", "/RealityStream/#features.path=" + industryLocDataFile);
                });
            }
            d3.csv(industryLocDataFile).then( function(county_data) {
                // Loads Tabulator via showIndustryTabulatorList()
                callPromises(industryLocDataFile); 
            });
        }
        loadIndustryData(hash);
        hash.naics = hiddenhash.naics;
        //alert("before " + hash.naics);
    } else {
        $("#industryListHolder").hide();
        $("#industryDetail").hide();
    }
    console.log("naics1 " + loadNAICS + " " + hash.show + " " + priorHash_naicspage.show);
    // || hash.show != priorHash_naicspage.show
    if (initialPageLoad || loadNAICS) {
        //if (loadNAICS == false) { // Not sure if loadNAICS==false needed, or if applyIO is ever used here.
            //applyIO("");
            //applyIO(hash.naics);
        //}
        if(initialPageLoad) {
            loadScript(theroot + '../localsite/js/d3.v5.min.js', function(results) {
                loadScript(theroot + '../io/charts/bubble/js/bubble.js', function(results) {
                });
            });
            initialPageLoad = false;
        }
    }


    // This might be reached before naics.hiddenhash is set.
    // So maybe localStorage should be used for the naics list.

    //alert("Assign priorHash_naicspage")
    priorHash_naicspage = $.extend(true, {}, getHash()); // Clone/copy object without entanglement

    //alert("afterr " + priorHash_naicspage.naics);
    // priorHash_naicspage = mix(getHash(),hash); // So we include changes above.
    initialNaicsLoad = false;
}

function combineArrays(arrays) {
    // Remove duplicates by converting to a Set and then back to an array
    let combinedArray = Array.from(new Set(arrays));
    // Sort the combined array numerically
    combinedArray.sort((a, b) => a - b);
    return combinedArray;
}
function getNaics_setHiddenHash2(go) {

    let showtitle, showtab;
    let cat_filter = [];
    let states = "";

    let naicsArrays = {};

    // NAICS FROM community/projects/biotech
    naicsArrays.computers = [541511,541512,551114,611310]
    naicsArrays.bio_input = [113000,321113,113310,32121,32191,562213,322121,322110]; // Omitted 541620
    naicsArrays.bio_output = [325211,325991,3256,335991,325120,326190];
    naicsArrays.green_energy = [221117,221111,221113,221114,221115,221116,221118];
    naicsArrays.fossil_energy = [221112,324110,325110];
    naicsArrays.electric = [335910,335911,335912];
    naicsArrays.auto_parts = [336390,336211,336340,336370,336320,336360,331221,336111,336330];
    naicsArrays.parts = [336412,336413,339110,333111,325211,326112,332211,336370,336390,326199,331110,336320];
    naicsArrays.solar = [221114,334313,335999];
    naicsArrays.combustion_engine = [333613,326220,336350,336310,333618];
    naicsArrays.parts_carpets = [325520,314110,313110,313210];
    naicsArrays.ppe = [622110,621111,325414,339113,423450]; // ppe_suppliers
    naicsArrays.farmfresh = [311612,311615,311911,311919,311830,311824,311941,311710,311611,115114,311613,311811,311942,311991,311999,311211,311224,311920];
    naicsArrays.recycling = [423930,562111,562112,562119,562211,562212,562213,562219,562910,562920,562991,562998,56299]; // All 6-digit NAICS codes under the 5 digit 56299 code are assigned to 562OTH in the USEEIO classification
    
    // Sectors from 2.0 https://github.com/USEPA/useeior/wiki/Disaggregation-of-Sectors#disaggregation-inputs-for-envfile
    naicsArrays.recycling = combineArrays([...naicsArrays.recycling,...[562111,562212,562213,562910,562920,"562HAZ","562OTH"]]);

    naicsArrays.bioeconomy = combineArrays([
        ...naicsArrays.bio_input,
        ...naicsArrays.bio_output,
        ...naicsArrays.green_energy,
        ...naicsArrays.fossil_energy
    ]);
    naicsArrays.smart = combineArrays([
        ...naicsArrays.electric,
        ...naicsArrays.auto_parts
    ]);
    naicsArrays.ev = combineArrays([
        ...naicsArrays.electric,
        ...naicsArrays.auto_parts
    ]);
    naicsArrays.parts = combineArrays([
        ...naicsArrays.electric,
        ...naicsArrays.auto_parts,
        ...naicsArrays.parts,
        ...naicsArrays.combustion_engine
    ]);
    naicsArrays.vehicles = combineArrays([
        ...naicsArrays.electric,
        ...naicsArrays.auto_parts,
        ...naicsArrays.parts
    ]);
    naicsArrays.transfer = [...naicsArrays.recycling]; // Creates a shallow copy to avoid sharing memory.
    naicsArrays.recyclers = [...naicsArrays.recycling];
    naicsArrays.inert = [...naicsArrays.recycling];
    naicsArrays.landfills = [...naicsArrays.recycling];

    // Not yet used
    localStorage.setItem("naicsArrays", JSON.stringify(naicsArrays));

    // Jorge is working on Electricity and waste (sectors 411 to 422)

    if (go) {

        if (naicsArrays[go] && naicsArrays[go].length > 0) {
            cat_filter = [...naicsArrays[go]];
        } else if (param.naics) {
            cat_filter = param.naics.split(',');
        }

        if (go == "opendata") {
            states = "GA";
        } else if (go == "bioeconomy") {
            showtab = "Bioeconomy and Energy";
            showtitle = "Bioeconomy and Energy Industries";
        } else if (go == "farmfresh") {
            showtitle = "Farm Fresh";
        } else if (go == "smart") {
            // smart also shows list of data-driven mobility projects
            // electric + auto_parts
        } else if (go == "ev") {
            showtab = "EV Ecosystem";
            showtitle = "EV Related Manufacturing";
        } else if (go == "parts") {
            showtitle = "Parts Manufacturing";
            //cat_filter = (electric + auto_parts + parts + combustion_engine).split(',');
        } else if (go == "ppe") {
            showtitle = "Healthcare Industries";
            //cat_filter = (ppe_suppliers).split(',');
            states = "GA";
        } else if (go == "solar") {
            showtab = "Solar";
            showtitle = "Solar Power";
        } else if (go == "vehicles") {
            showtab = "Automotive"
            showtitle = "Vehicles and Vehicle Parts";
        } else if (go == "recycling") {
            showtab = "Recycling";
            showtitle = "Recycling Processors (B2B)";
            states = "GA";
        } else if (go == "transfer") {
            showtab = "Transfer Stations";
            showtitle = "Recycling Transfer Stations (B2B)";
            states = "GA";
        } else if (go == "recyclers") {
            showtab = "Recyclers";
            showtitle = "Companies that Recycle during Manufacturing";
            states = "GA";
        } else if (go == "inert") {
            showtab = "Inert Waste Landfills";
            showtitle = "Inert Waste Landfills";
            states = "GA";
        } else if (go == "landfills") {
            showtab = "Landfills";
            showtitle = "Landfills";
            states = "GA";
        } else if (go=="manufacturing") {
            showtitle = "Manufacturing";
            //cat_filter=["manufacturing placeholder"];
        } else if (go=="industries") {
            showtitle = "Local Topics";
            $("#keywordsTB").attr("placeholder","City name..."); // For layers = brigades
        } else if (param.naics) {
            showtitle = go.charAt(0).toUpperCase() + go.substr(1).replace(/\_/g," ");
        } else {
            showtitle = go.charAt(0).toUpperCase() + go.substr(1).replace(/\_/g," ");
        }

        /* DELETE - no longer limiting to 6.
        if (cat_filter.length) {
            cat_filt=[]
            for(i=0; i < cat_filter.length; i++){
                cat_filt.push(cat_filter[i].slice(0,6));
            }
            cat_filter=cat_filt
        }
        if (Array.isArray(cat_filter) && cat_filter.length) {
            cat_filter = cat_filter.map(cat => cat.slice(0, 6));
        }
        */
        
        if (!showtab) {
            showtab = showtitle;
        }
        if (!showtab) {
            showtab = hash.show.charAt(0).toUpperCase() + hash.show.substr(1).replace(/\_/g," ");
        }
    } else if (param.naics) {
        showtitle = "Local Topics";
        showtab = "Local Topics";
        cat_filter = param.naics.split(',');
    }

    if (!go) { // Check the "industries" topic.
        let checkWhat = "industries"; // Not essential, works without being checked
        waitForElm(".bigThumbMenuContent[show='" + checkWhat + "']").then((elm) => {
            $(".bigThumbMenuContent[show='" + checkWhat + "']").addClass("bigThumbActive");
        });
    }
    // BUGBUG - Not sure where this sends the naics to the URL hash, which might be good until widget updates are tested.
    // Problem, naics in URL is not updated after initial load.
    console.log("Assign hiddenhash.naics")

    hiddenhash.naics = cat_filter.join(','); // Overrides the existing naics
    //alert("hiddenhash.naics: " + hiddenhash.naics)

    //alert("hiddenhash.naics in getNaics_setHiddenHash2 " + JSON.stringify(hiddenhash.naics));

    //console.log("hiddenhash.naics before delete " + hiddenhash.naics)

    //delete hash.naics; // Since show value invokes new hiddenhash

    updateHash({'naics':''})

    // If states are not available yet, wait for DOM.
    if(!$("#state_select").length) {
        $(document).ready(function() {
            populateTitle(showtitle,showtab)
        });
    } else {
        populateTitle(showtitle,showtab);
    }
    
    if (showtitle) {
        local_app.showtitle = showtitle;
        //alert($(".locationTabText").val())
        //$(".regiontitle").text($(".locationTabText").val() + " - " + showtitle);
        $(".regiontitle").text(local_app.loctitle + " - " + showtitle);
        $(".listTitle").html(showtitle); // Title is also set in map.js
    } else {
        //alert("local_app.loctitle " + local_app.loctitle)
        //$(".regiontitle").text(local_app.loctitle);
    }
    return cat_filter;
}
function populateTitle(showtitle,showtab) {
    //alert("showtitle " + showtitle);
    hash = getHash();
    let thestate;
    let regionServiceTitle = showtitle;
    if (hiddenhash.loctitle) {
        if (showtitle) {
            regionServiceTitle = hiddenhash.loctitle + " - " + showtitle;
        } else {
            regionServiceTitle = hiddenhash.loctitle;
        }
    } else if (hash.state) {
        $("#state_select").val(hash.state.split(",")[0].toUpperCase());
        thestate = $("#state_select").find(":selected").text();
        hiddenhash.loctitle = thestate;

        if (showtitle) {
            regionServiceTitle = thestate + " - " + showtitle;
        } else {
            regionServiceTitle = thestate + " Industries";
        }
        
    }

    delete hiddenhash.loctitle; // Clear until we are setting elsewhere.
    $("#showAppsText").text(showtab);
    $("#showAppsText").attr("title",showtab); // Swaps in when viewing app thumbs
    $(".regiontitle").text(regionServiceTitle);

    if (thestate && localsiteTitle.indexOf(thestate) >= 0) { // Avoids showing state twice in browser title
        if (showtitle) {
            document.title = localsiteTitle + " - " + showtitle;
        } else {
            console.log("TODO: Load state here");
            document.title = localsiteTitle + " - " + thestate;
        }
    } else if (regionServiceTitle) {
        document.title = localsiteTitle + " - " + regionServiceTitle;
    } else if (showtitle) {
        document.title = localsiteTitle + " - " + showtitle;
    }
}

// NOT OPTIMALLY DESIGNED - No need to load all 3 naics datasets for state.
// Calls promisesReady when completed.
function loadIndustryData(hash) {
    let stateAbbr;
    if (hash.state && hash.state.length >= 2) {
        stateAbbr = hash.state.split(",")[0].toUpperCase();
    }
    $("#top-content-columns").hide();
    if (stateAbbr) { // Display loading icon
        $("#econ_list").html("<img src='" + local_app.localsite_root() + "img/icon/loading.gif' style='margin:40px; width:120px'><br>");
    } else {
        $("#econ_list").html("");
    }
    $("#econ_list").show(); 
    if(!stateAbbr) {
        stateAbbr = param.state;
    }

    consoleLog("naics stateAbbr: " + stateAbbr)

    if(!stateAbbr) {
        //delete hiddenhash.naics;
        //delete hash.naics;

        //alert("no state") // applyIO will update to US industry charts
        applyIO(""); // Loads "Supply Chain Inflow-Outflow" for entire US.

        //console.log("ALERT - Hid bubble chart until we send it 73 sectors")
        //$("#bubble-graph-id").hide();
        //renderIndustryChart(dataObject,values,hash);
            
    } else {
        dataObject.stateshown=stateID[stateAbbr.toUpperCase()];
        console.log("Load naics promises using " + stateAbbr);
        //alert(local_app.community_data_root() + "us/id_lists/industry_id_list.csv");
        var promises = [
            // OLD VERSION - Removing soon now that new naics county data is ready.
            d3.csv(local_app.community_data_root() + "us/id_lists/industry_id_list.csv"),
            d3.tsv(local_app.community_data_root() + "us/state/" + stateAbbr + "/industries_state"+dataObject.stateshown+"_naics2_all.tsv"),
            //d3.tsv(local_app.community_data_root() + "data/c3.tsv"),
            d3.tsv(local_app.community_data_root() + "us/state/" + stateAbbr + "/industries_state"+dataObject.stateshown+"_naics4_all.tsv"),
            //d3.tsv(local_app.community_data_root() + "data/c5.tsv"),
            d3.tsv(local_app.community_data_root() + "us/state/" + stateAbbr + "/industries_state"+dataObject.stateshown+"_naics6_all.tsv"),
            d3.csv(local_app.community_data_root() + "us/id_lists/county_id_list.csv"),
            d3.tsv(local_app.community_data_root() + "us/state/" + stateAbbr + "/industries_state"+dataObject.stateshown+"_naics2_state_all.tsv"),
            d3.tsv(local_app.community_data_root() + "us/state/" + stateAbbr + "/industries_state"+dataObject.stateshown+"_naics4_state_all.tsv"),
            d3.tsv(local_app.community_data_root() + "us/state/" + stateAbbr + "/industries_state"+dataObject.stateshown+"_naics6_state_all.tsv"),
            d3.tsv(local_app.community_data_root() + "us/state/" + stateAbbr + "/" + stateAbbr + "counties.csv"),
            hash
        ]
        Promise.all(promises).then(promisesReady);
    }
}
function promisesReady(values) {
    //let hash = getHash();
    let hash = values[9]; // This include hash.naics
    console.log("promisesReady - promises loaded");
    console.log(hash);

    //alert("temp uncomented: #industryListHolder")
    //$("#industryListHolder").show();

    d3.csv(local_app.community_data_root() + "us/id_lists/state_fips.csv").then( function(consdata) {
        var filteredData = consdata.filter(function(d) {
            if (d["FIPS"]==String(dataObject.stateshown)) {
                //let hash = loadParams(location.search,location.hash);
                let lastParams = {};
                
                let industryData ={}
                subsetKeys = ['emp_reported','emp_est1','emp_est3', 'payann_reported','payann_est1','payann_est3', 'estab', 'NAICS2012_TTL','GEO_TTL','state','COUNTY','relevant_naics','estimate_est1','estimate_est3']
                subsetKeys_state = ['emp_agg', 'payann_agg', 'estab_agg', 'NAICS2012_TTL','GEO_TTL','state','COUNTY','relevant_naics']
                subsetKeys_state_api = ['emp_api', 'payann_api', 'estab_api', 'NAICS2012_TTL','GEO_TTL','state','COUNTY','relevant_naics']
                dataObject.subsetKeys=subsetKeys
                dataObject.subsetKeys_state=subsetKeys_state
                dataObject.subsetKeys_state_api=subsetKeys_state_api
                
                console.log("hash.census_scope " + hash.census_scope)
                industryData = {
                    'ActualRate': formatIndustryData(values[hash.catsize/2],dataObject.subsetKeys),
                }
                dataObject.industryData = industryData;
                //console.log(dataObject.industryData)
                if (hash.catsize==2){
                    industryDataState = {
                        'ActualRate': formatIndustryData(values[5],dataObject.subsetKeys_state)
                    }
                } else if (hash.catsize==4){
                    industryDataState = {
                        'ActualRate': formatIndustryData(values[6],dataObject.subsetKeys_state)
                    }
                } else if (hash.catsize==6){
                    industryDataState = {
                        'ActualRate': formatIndustryData(values[7],dataObject.subsetKeys_state)
                    }
                } else {
                    // Default to 6-digit naics
                    industryDataState = {
                        'ActualRate': formatIndustryData(values[7],dataObject.subsetKeys_state)
                    }
                }
                    
                dataObject.industryDataState = industryDataState;

                console.log(dataObject.industryDataState)
                if (hash.catsize==2){
                    industryDataStateApi = {
                        'ActualRate': formatIndustryData(values[5],dataObject.subsetKeys_state_api)
                    }
                } else if (hash.catsize==4){
                    industryDataStateApi = {
                        'ActualRate': formatIndustryData(values[6],dataObject.subsetKeys_state_api)
                    }
                } else if (hash.catsize==6){
                    industryDataStateApi = {
                        'ActualRate': formatIndustryData(values[7],dataObject.subsetKeys_state_api)
                    }
                } else {
                    // Default to 6-digit naics
                    industryDataStateApi = {
                        'ActualRate': formatIndustryData(values[7],dataObject.subsetKeys_state_api)
                    }
                }
                
                dataObject.industryDataStateApi=industryDataStateApi;
                
                industryNames = {}
                values[0].forEach(function(item){
                    industryNames[+item.relevant_naics] = item.industry_detail
                })
                dataObject.industryNames=industryNames;
                counties = []
                //console.log("values[4] counties")
                //console.log(values[4])
                values[4].forEach(function(item) { // All counties for all states.
                    //if (item.abvr == d['Name']) {
                    if (item.state == d['Name']) { // Comparing the full name of state.
                        counties.push(item.id)
                    }
                })
                dataObject.counties = counties;
                //countiesCount = dataObject.counties.length;
                countiesCount = counties.length;
                //alert("countiesCount (takes too long) " + countiesCount);
                [fips,dataObject.stateshown] = getStateFips(hash);
                renderIndustryChart(dataObject,values,hash);
            }
        })
    })
}

$(document).ready(function() {

    /*
    // `hashChangeEvent` event reside in multiple widgets. 
    // Called by goHash within localsite.js
    //alert("Add addEventListener"); // Confirms only added once, but why does this occur twice?
    document.addEventListener('hashChangeEvent', function (elem) {
        if (location.host.indexOf('localhost') >= 0) {
            alert('Localhost Alert: BUGBUG hashChangeEvent invoked 2 times by naics.js'); // Invoked twice by iogrid inflow-outflow chart
        }
        console.log("The hash: " + location.hash);
        let hash = loadParams(location.search,location.hash);
        console.log("naics.js detects hash change hashChangeEvent");
        if (typeof value == 'undefined') {
            console.log("ALERT value object undefined in naics.js")
        } else {

            // Might need
            //renderIndustryChart(dataObject,values,hash);
        }

    }, false);
    */

    if (document.getElementById("clearButton")) {
        document.getElementById("clearButton").addEventListener("click", function(){

            // Clears all counties, so reset title:
            let currentState = $("#state_select").find(":selected").text();
            if (currentState) {
                local_app.loctitle = currentState;
                local_app.showtitle = "Local Topics";
                $(".regiontitle").text(currentState + "'s Local Topics");
            } else {
                local_app.loctitle = "United States";
                local_app.showtitle = "Local Topics";
                $(".regiontitle").text("US Local Topics");
            }
            alert("refresh 3")
            refreshNaicsWidget(false);
            return; 


            // Disabled
            clearHash("geo,regiontitle");
            console.log('clearButton clicked (but disabled)');

            // BUGBUG - This causes industry list removal and commodity list reduction.
            // Problem occurred before adding applyIO function and the newer script it contains.
            //geoChanged(dataObject)

        }); 
    }
    //addGeoChangeDetectToDOM(1);
    function addGeoChangeDetectToDOM(count) { // Wait for county checkboxes to be added to DOM by map-filters.js
        if($(".geo").length) {
            //d3.selectAll(".geo").on("change",function() {
            $(".geo").change(function(e) {
                //geoChanged(dataObject);
            });
        } else if (count<100) { 
            setTimeout( function() {
                addGeoChangeDetectToDOM(count+1)
            }, 10 );
        } else {
            console.log("Geo location filter probably not in page. addGeoChangeDetectToDOM exceeded 100 attempts.");
        }
    }
});


/////// Functions /////// 

function renderIndustryChart(dataObject,values,hash) {
    let stateAbbr 
    if (hash.state) {
        stateAbbr = hash.state.split(",")[0].toUpperCase();
        dataObject.stateshown=stateID[stateAbbr.toUpperCase()];
    }
    if(!hash.catsort){
        hash.catsort = "payann";
    }
    if(!hash.catsize){
        hash.catsize = 6;
    }
    if(!hash.census_scope){
        hash.census_scope='state'
    }

    // Reduce hash to only those used
    const filteredKeys = ['state','show','geo','regiontitle','catsort','catsize','catmethod','catpage','catcount','census_scope','naics','state','hs']; // hs not yet implemented for Harmonized System codes.
    hash = filteredKeys.reduce((obj, key) => ({ ...obj, [key]: hash[key] }), {});

    console.log("hash reduced within naics.js")
    console.log(hash)
    // Check which naics hash have channged
    let whichHaveChanged = [];
    for (const key in hash) {
      //if (watchingHash.includes(${key})) {
      console.log("hash[key] " + key + " " + hash[key] + " prior: " + priorHash_naicspage[key])
      if (hash[key] != priorHash_naicspage[key]) {
        whichHaveChanged.push(key)
      }
    }
    console.log("whichHaveChanged: ");
    console.log(whichHaveChanged);

    console.log(hash.show + " priorHash_naicspage " + priorHash_naicspage.show)
    // BUG - this return prevented change to show from reloading
    //if (whichHaveChanged.length == 0 && initialNaicsLoad == false) {
    //    console.log("Cancel naics.js, no hash values have changed.");
    //    return; // None have changed
    //}

    //initialNaicsLoad = false; // So further non-related hash changes are ignored by return above.

    subsetKeys = ['emp_reported','emp_est1','emp_est3', 'payann_reported','payann_est1','payann_est3', 'estab', 'NAICS2012_TTL','GEO_TTL','state','COUNTY','relevant_naics','estimate_est1','estimate_est3']
    subsetKeys_state = ['emp_agg', 'payann_agg', 'estab_agg', 'NAICS2012_TTL','GEO_TTL','state','COUNTY','relevant_naics']
    subsetKeys_state_api = ['emp_api', 'payann_api', 'estab_api', 'NAICS2012_TTL','GEO_TTL','state','COUNTY','relevant_naics']
    dataObject.subsetKeys=subsetKeys
    dataObject.subsetKeys_state=subsetKeys_state
    dataObject.subsetKeys_state_api=subsetKeys_state_api
    industryData = {
        'ActualRate': formatIndustryData(values[hash.catsize/2],dataObject.subsetKeys),
    }
    dataObject.industryData = industryData;
    dataObject.industryData=industryData;
    if (hash.catsize==2){
        industryDataState = {
            'ActualRate': formatIndustryData(values[5],dataObject.subsetKeys_state)
        }
    } else if (hash.catsize==4){
        industryDataState = {
            'ActualRate': formatIndustryData(values[6],dataObject.subsetKeys_state)
        }
    } else if (hash.catsize==6){
        industryDataState = {
            'ActualRate': formatIndustryData(values[7],dataObject.subsetKeys_state)
        }
    }
        
    dataObject.industryDataState=industryDataState;
    console.log(dataObject.industryDataState)
    if (hash.catsize==2){
        industryDataStateApi = {
            'ActualRate': formatIndustryData(values[5],dataObject.subsetKeys_state_api)
        }
    } else if (hash.catsize==4){
        industryDataStateApi = {
            'ActualRate': formatIndustryData(values[6],dataObject.subsetKeys_state_api)
        }
    } else if (hash.catsize==6){
        industryDataStateApi = {
            'ActualRate': formatIndustryData(values[7],dataObject.subsetKeys_state_api)
        }
    }
        
    dataObject.industryDataStateApi=industryDataStateApi;
    [fips,dataObject.stateshown]=getStateFips(hash)
    console.log("renderIndustryChart calls topRatesInFips with fips: " + fips);
    topRatesInFips(dataObject, dataObject.industryNames, fips, hash);
}

function parseSubsetValues(entry, subsetKeys, randOffset) {
    subsets = {}
    subsetKeys.forEach(d=>{
        if (randOffset==true) {
            subsets[d] = entry[d] + getRndPercentError() * +entry[d]
        } else {
            subsets[d] = entry[d]
        }
    })
    return subsets
}


function formatIndustryData(rawData,subsetKeys) {
    // var industryByType = d3.map()
    var industryByType = {}

    if (rawData) {
    for (var i = 0; i<rawData.length; i++){

        entry = rawData[i]
        industryID = entry.relevant_naics

        if (industryID in industryByType) {
            industryByType[entry.relevant_naics][entry.id] = parseSubsetValues(entry, subsetKeys)
        } else {
            industryByType[entry.relevant_naics] = {}
            industryByType[entry.relevant_naics][entry.id] = parseSubsetValues(entry, subsetKeys)
        }
    }
    }
    return industryByType
}


function keyFound(this_key, cat_filter, hash) {
    if (!hash.show) {
        hash.show = hash.go;
    }

    if (this_key <= 1) {
        return false;
    } else if (cat_filter == undefined) { // No filter
        return true;
    } else if (cat_filter.length == 0) { // No filter
        return true;
    } else if (hash.show == "bioeconomy" && (this_key.startsWith("11") || this_key.startsWith("311"))) { // Quick hack, always include Agriculture
        return true;
    //} else if (hash.show == "farmfresh" && (this_key.startsWith("11") || this_key.startsWith("311"))) { // Quick hack, always include Agriculture
    //    return true;
    } else if (hash.show == "manufacturing" && (this_key.startsWith("31") || this_key.startsWith("32") || this_key.startsWith("33") )) { // All manufacturing
        return true;
    } else if ( (hash.show == "bioeconomy" || hash.show=="parts") && hash.catsize == 2) { // Our 4 digit array matches key
        cat_filt=[]
        for(i=0;i<cat_filter.length;i++){
            cat_filt.push(cat_filter[i].slice(0,2))
        }
        if (cat_filt.includes(this_key.slice(0,2))){
            return true;
        }
    } else if ( (hash.show == "bioeconomy" || hash.show=="parts") && hash.catsize == 4 ) { // Our 4 digit array matches key
        cat_filt=[]
        for(i=0;i<cat_filter.length;i++){
            cat_filt.push(cat_filter[i].slice(0,4))
        }
        if (cat_filt.includes(this_key.slice(0,4))){
            return true;
        }
    } else if ( (hash.show == "bioeconomy" || hash.show=="parts" || cat_filter.length > 0) && hash.catsize == 6 && cat_filter.includes(this_key.slice(0,6))) { // Our 6 digit array matches key
        return true;
    } else {
        //console.log("NO NAICS CAT MATCH FOUND FOR hash.show: " + hash.show + " with this_key: " + this_key);
        return false;
    }
}

// Top rows for a specific set of fips (states and counties)
function topRatesInFips(dataSet, dataNames, fips, hash) {

    let catcount = (hash.catcount && typeof hash.catcount !== undefined) ? hash.catcount : 40;
    let gotext = "";
    if (hash.show) {
        gotext = hash.show.replace(/_/g," ").toTitleCaseFormat();
        if (gotext == "Smart") {
            gotext = "EV Ecosystem";
        } else if (gotext == "Ppe") {
            gotext = "Healthcare";
        }
    }
    //alert(String(dataObject.stateshown)) // State's fips number

    // Redirect occurs somewhere below....
    //alert("dataObject.stateshown " + dataObject.stateshown)
    d3.csv(local_app.community_data_root() + "us/id_lists/state_fips.csv").then( function(consdata) {
        console.log("naics.js reports state_fips.csv loaded");
        var filteredData = consdata.filter(function(d) { // Loop through
            if (d["FIPS"]==String(dataObject.stateshown)) {
                if (hash.catsort=='estab'){
                    which=hash.catsort;
                } else {
                    if (hash.catmethod==0){
                        which=hash.catsort+'_reported'
                    } else if (hash.catmethod==2){
                        which=hash.catsort+'_est3'
                        estimed='estimate_est3'
                    } else { // hash.catmethod==1 or null
                        which= hash.catsort+'_est1'
                        estimed='estimate_est1'
                    }
                }

                if (hash['census_scope']=="state") {
                    which_state_api=hash.catsort+'_api'
                } else {
                    which_state=hash.catsort+'_agg'
                }

                //alert("naics.js hiddenhash.naics: " + hiddenhash.naics);
                //var cat_filter = getNaics_setHiddenHash(hash.show); // Resides in map-filters.js
                //var cat_filter = hiddenhash.naics;
                var cat_filter = hash.naics; // Should include hiddenhash

                //alert(cat_filter)
                var rates_dict = {};
                var rates_list = [];
                var forlist={}
                //selectedFIPS = fips;
                if (Array.isArray(fips)) {
                    for (var i = 0; i<fips.length; i++){
                        Object.keys(dataSet.industryData.ActualRate).forEach( this_key=>{
                            // this_key = parseInt(d.split("$")[1])
                            if (keyFound(this_key, cat_filter,hash)){
                                this_rate = dataSet.industryData.ActualRate[this_key]
                                if (this_rate.hasOwnProperty(fips[i])){ 
                                    if (rates_dict[this_key]){
                                        forlist[this_key]=rates_dict[this_key]+parseFloat(this_rate[fips[i]][which])
                                        rates_dict[this_key] = rates_dict[this_key]+parseFloat(this_rate[fips[i]][which])      
                                    } else {
                                        rates_dict[this_key] = parseFloat(this_rate[fips[i]][which])
                                        forlist[this_key]=parseFloat(this_rate[fips[i]][which])
                                    }
                                    
                                } else {
                                    if (rates_dict[this_key]){
                                        rates_dict[this_key] = rates_dict[this_key]+0.0
                                        forlist[this_key]=rates_dict[this_key]+0.0
                                    } else {
                                    rates_dict[this_key] = 0.0
                                    forlist[this_key]=0.0
                                    }
                                }
                            }
                        })
                    }
                    var keys = Object.keys(forlist);
                    keys.forEach(function(key){
                        rates_list.push(forlist[key])
                    });

                } else if (fips==dataObject.stateshown) { //Example: fips=13
                    
                        if (hash['census_scope']=="state"){
                            Object.keys(dataSet.industryDataStateApi.ActualRate).forEach( this_key=>{
                                if (keyFound(this_key, cat_filter,hash)){
                                    this_rate = dataSet.industryDataStateApi.ActualRate[this_key]
                                    if (this_rate.hasOwnProperty(fips)){ 
                                        rates_dict[this_key] = parseFloat(this_rate[fips][which_state_api])
                                        rates_list.push(parseFloat(this_rate[fips][which_state_api]))
                                    } else {
                                        rates_dict[this_key] = 0.0
                                        rates_list.push(0.0)
                                    }
                                }
                            })
                        }
                    else{
                        Object.keys(dataSet.industryDataState.ActualRate).forEach( this_key=>{
                            if (keyFound(this_key, cat_filter,hash)){
                                this_rate = dataSet.industryDataState.ActualRate[this_key]
                                if (this_rate.hasOwnProperty(fips)){ 
                                    rates_dict[this_key] = parseFloat(this_rate[fips][which_state])
                                    rates_list.push(parseFloat(this_rate[fips][which_state]))
                                } else {
                                    rates_dict[this_key] = 0.0
                                    rates_list.push(0.0)
                                }
                            }
                        })
                    }    

                } else {
                    Object.keys(dataSet.industryData.ActualRate).forEach( this_key=>{
                        if (keyFound(this_key, cat_filter,hash)){
                            this_rate = dataSet.industryData.ActualRate[this_key]
                            if (this_rate.hasOwnProperty(fips)){ 
                                rates_dict[this_key] = parseFloat(this_rate[fips][which])
                                rates_list.push(parseFloat(this_rate[fips][which]))
                            } else {
                                rates_dict[this_key] = 0.0
                                rates_list.push(0.0)
                            }
                        }
                    })
                }

                rates_list = rates_list.sort(function(a,b) { return a - b}).reverse()
                top_data_list = [];
                top_data_ids = [];
                naCount = 1;
                let naicscode = [];
                x=Math.min(catcount,rates_list.length)

                if (Array.isArray(fips)) {
                    for (var i=0; i<rates_list.length; i++) {
                        id = parseInt(getKeyByValue(rates_dict, rates_list[i]))
                        delete rates_dict[id]
                        rateInFips=0
                        rateArray={}
                        estim={}
                        naicscode=0
                        for (var j = 0; j<fips.length; j++){ 
                            if (dataSet.industryData.ActualRate[id]){ 
                                if (dataSet.industryData.ActualRate[id].hasOwnProperty(fips[j])) {
                                    rateInFips = rateInFips+parseFloat(dataSet.industryData.ActualRate[id][fips[j]][which])
                                    rateArray[j]=parseFloat(dataSet.industryData.ActualRate[id][fips[j]][which]);
                                    naicscode = dataSet.industryData.ActualRate[id][fips[j]]['relevant_naics']
                                    if (hash.catmethod!=0 & hash.catsort!='estab'){
                                        estim[j]=parseFloat(dataSet.industryData.ActualRate[id][fips[j]][estimed])
                                    } else {
                                        estim[j]=parseFloat(0)
                                    }
                                } else {
                                        rateInFips = rateInFips+0
                                        estim[j]=parseFloat(0)

                                }
                            }
                        }
                        if (keyFound(naicscode, cat_filter,hash)){
                            if (dataNames[id]){
                                if (rateInFips == null) {
                                    rateInFips = 1
                                    top_data_list.push(
                                        {'data_id': dataNames[id], [which]: 1,'NAICScode': 1, 'rank': i,'Estimate':0}
                                    )
                                }  else {
                                    top_data_list.push(
                                        {'data_id': dataNames[id], [which]: rateInFips,'NAICScode': naicscode, 'rank': i, 'ratearray':rateArray,'Estimate':estim}
                                    )
                                    top_data_ids.push(id)
                                }
                            }
                        }
                    }   
                } else {
                    // US Reaches here
                    console.log("fips state ID " + fips + ", dataObject.stateshown stateID " + dataObject.stateshown);
                    if (fips==dataObject.stateshown){
                    
                        if (hash['census_scope']=="state"){
                            for (var i=0; i<rates_list.length; i++) {
                                id = parseInt(getKeyByValue(rates_dict, rates_list[i]))
                                //console.log("dataSet.industryData.ActualRate[id] ");
                                //console.log(dataSet.industryData.ActualRate[id]);
                                /*
                                Example of row returned from dataSet.industryData.ActualRate[id]
                                COUNTY numbers are unique, includes all counties for state.

                                COUNTY: "3"
                                GEO_TTL: "Cochise County, Arizona"
                                NAICS2012_TTL: "All other miscellaneous waste management services"
                                emp_est1: "2.293333333333333"
                                emp_est3: "8.218095238095236"
                                emp_reported: "0.0"
                                estab: "1.0"
                                estimate_est1: "1.0"
                                estimate_est3: "1.0"
                                payann_est1: "74.20444444444446"
                                payann_est3: "325.364126984127"
                                payann_reported: "0.0"
                                relevant_naics: "562998"
                                */

                                delete rates_dict[id]

                                if (dataSet.industryDataStateApi.ActualRate[id].hasOwnProperty(fips)) {
                                    rateInFips = dataSet.industryDataStateApi.ActualRate[id][fips][which_state_api]
                                    naicscode = dataSet.industryDataStateApi.ActualRate[id][fips]['relevant_naics']
                                } else {
                                    rateInFips = 0
                                    naicscode = 1
                                }
                                
                                if (keyFound(naicscode, cat_filter,hash)){
                                    if (rateInFips == null) {
                                        rateInFips = 1
                                        top_data_list.push(
                                            {'data_id': dataNames[id], [which_state_api]: 1,'NAICScode': 1, 'rank': i}
                                        )
                                    }  else {

                                        /// ENTIRE STATE
                                        top_data_list.push(
                                            {'data_id': dataNames[id], [which_state_api]: rateInFips, 'emp_api': dataSet.industryDataStateApi.ActualRate[id][fips]['emp_api'], 'estab_api': dataSet.industryDataStateApi.ActualRate[id][fips]['estab_api'], 'NAICScode': naicscode, 'rank': i}
                                        )
                                        top_data_ids.push(id)
                                    }
                                }
                            }
                        } else {
                            for (var i=0; i<rates_list.length; i++) {
                                id = parseInt(getKeyByValue(rates_dict, rates_list[i]))
                                //alert("Test2 " + dataSet.industryData.ActualRate[id]);
                                delete rates_dict[id]

                                if (dataSet.industryDataState.ActualRate[id] && dataSet.industryDataState.ActualRate[id].hasOwnProperty(fips)) {
                                    rateInFips = dataSet.industryDataState.ActualRate[id][fips][which_state]
                                    naicscode = dataSet.industryDataState.ActualRate[id][fips]['relevant_naics']
                                } else {
                                    rateInFips = 0
                                    naicscode = 1
                                }
                                
                                if (keyFound(naicscode, cat_filter,hash)){
                                    if (rateInFips == null) {
                                        rateInFips = 1
                                        top_data_list.push(
                                            {'data_id': dataNames[id], [which_state]: 1,'NAICScode': 1, 'rank': i}
                                        )
                                    }  else {
                                        top_data_list.push(
                                            {'data_id': dataNames[id], [which_state]: rateInFips,'NAICScode': naicscode, 'rank': i}
                                        )
                                        top_data_ids.push(id)
                                    }
                                }
                            }
                        }
                    } else {
                        for (var i=0; i<rates_list.length; i++) {
                            id = parseInt(getKeyByValue(rates_dict, rates_list[i]))
                            delete rates_dict[id]

                            if (dataSet.industryData.ActualRate[id].hasOwnProperty(fips)) {
                                rateInFips = dataSet.industryData.ActualRate[id][fips][which]
                                naicscode = dataSet.industryData.ActualRate[id][fips]['relevant_naics']
                                if (hash.catmethod!=0 & hash.catsort != 'estab'){
                                    estim = dataSet.industryData.ActualRate[id][fips][estimed]
                                } else {
                                    estim=0
                                }
                                //console.log(estim)
                            } else {
                                rateInFips = 0
                                naicscode = 1
                                estim = 0
                            }
                            
                            if (keyFound(naicscode, cat_filter,hash)){
                                if (rateInFips == null) {
                                    rateInFips = 1
                                    top_data_list.push(
                                        {'data_id': dataNames[id], [which]: 1,'NAICScode': 1, 'rank': i,'Estimate':0}
                                    )
                                }  else {
                                    top_data_list.push(
                                        {'data_id': dataNames[id], [which]: rateInFips, 'NAICScode': naicscode, 'rank': i,'Estimate':estim}
                                    )
                                    top_data_ids.push(id)
                                }
                            }
                        }
                    }
                }

                consoleLog("naics.js top_data_list: ");
                console.log(top_data_list);

                let icon = "";
                let rightCol = "";
                let midCol="";
                var text = ""; // Avoid let since set inside function
                let dollar = ""; // optionally: $
                let totalLabel = "Total Payroll";
                let stateAbbr;
                
                if (hash.state) {
                    stateAbbr = hash.state.split(",")[0].toUpperCase();
                } else {
                    if (hash.beta != "true") {
                        //stateAbbr = "GA"; // Temp HACK to show US
                    }
                }
                if (hash.catsort=="payann"){
                    totalLabel = "Total Payroll ($)";
                }
                let thestate = $("#state_select").find(":selected").text();

                //alert("stateAbbr: " + stateAbbr);
                if (stateAbbr) {
                
                //BUGBUG - Contains all the counties in the US
                // Do we need to load counties if entire state is being displayed?
                d3.csv(local_app.community_data_root() + "us/id_lists/county_id_list.csv").then( function(consdata) {
                    d3.csv(local_app.community_data_root() + "us/state/" + stateAbbr + "/" + stateAbbr + "counties.csv").then( function(latdata) {
                         // TABLE HEADER ROW
                         //alert("countiesCount " + countiesCount + " fips.length: " + fips.length);
                         // && countiesCount != fips.length
                        if (Array.isArray(fips)){

                            for(var i=0; i < fips.length; i++) {

                                var filteredData = consdata.filter(function(d) {

                                    if (d["id"]==fips[i]){
                                        if (i == fips.length-1){
                                           text += "<div class='cell-right'>" + d["county"].split("County")[0] + " County</div>";
                                        } else {
                                            text += "<div class='cell-right'>" + d["county"].split(" County")[0] + " County</div>";
                                        }
                                    }
                                })
                            }
                        }
                        text = "<div class='row'><div class='cell'><!-- col 1 -->NAICS</div><div class='cell' style='min-width:300px'><!-- col 2 -->Industry</div>" + text + "<div class='cell-right'>" + totalLabel + "</div>";
                        if (fips == dataObject.stateshown && hash.catsort == "payann") {
                            text += "<div class='cell' style='text-align:right'>Employees</div><div class='cell' style='text-align:right'>Firms</div>";
                        }
                        text += "</div>"; // #9933aa
                        
                        // INDUSTRY ROWS
                        let naicsRowCount = Math.min(catcount, top_data_ids.length);
                        let naicshash = "";
                        
                        //waitForElm('#econ_list').then((elm) => {
                            // BUGBUG - Overwrites need fields
                            //$("#econ_list").html("<div style='displayX:none'><br>No results found.</div><br>");
                            
                            //consoleLog("Industry matches found (max of " + catcount + "): " + naicsRowCount);

                            // TO DO - change to let naics narrow results
                            if (naicsRowCount == 0 && hash.naics) { // NAICS from parameters or URL hash
                                naicshash = hash.naics;
                            }

                            //alert("naicsRowCount " + naicsRowCount);

                            for (i = 0; i < naicsRowCount; i++) { // Naics from data
                                rightCol="";
                                midCol="";
                                //console.log("NAICS ROW " + i);
                                // Update these:
                                    let latitude = "";
                                    let longitude = "";

                                    // Populate maplink with Google Map URL for each industry

                                    //d3.csv(local_app.community_data_root() + "us/id_lists/county_id_list.csv").then( function(consdata) {
                                        if (Array.isArray(fips) && countiesCount > 0) {
                                            //  && countiesCount != fips.length
                                            console.log("NOT COMPARING count for counties and fips. countiesCount " + countiesCount + " fips.length: " + fips.length);

                                            mapLink=[]
                                            for(var j=0; j<fips.length; j++){
                                                var filteredData = consdata.filter(function(d) {
                                                    var filteredData = latdata.filter(function(e) {
                                                        if (d["id"]==fips[j]){
                                                            if (d["county"]==e["NAMELSAD"]){
                                                                //mapLink.push("https://www.google.com/search?q=" + top_data_list[i]['data_id'].replace(/ /g,"+") + " " + d["county"].replace(/ /g,"+") + ",+Georgia")
                                                                mapLink.push("https://www.google.com/maps/search/" + top_data_list[i]['data_id'].replace(/ /g,"+") + "/@" + e['latitude'] + "," + e['longitude'] + ",11z")
                                                                //mapLink.push("https://bing.com/maps/?q=" + top_data_list[i]['data_id'].replace(/ /g,"+") + "&cp=" + e['latitude'] + "~" + e['longitude'] + "&lvl=11"); // lvl not working
                                                            }
                                                        }
                                                    })
                                                })
                                            }
                                        } else if (fips == dataObject.stateshown) {
                                                //county=""
                                                mapLink = "https://www.google.com/maps/search/" + top_data_list[i]['data_id'].replace(/ /g,"+") + "/@32.9406955,-84.5411485,8z"
                                                //mapLink = "https://bing.com/maps/?q=" + top_data_list[i]['data_id'].replace(/ /g,"+") + "&cp=32.94~-84.54&z=8"; // lvl not working
                                        } else {
                                            var filteredData = consdata.filter(function(d) {
                                                var filteredData = latdata.filter(function(e) {
                                                    if (d["id"]==fips ){      
                                                        if (d["county"]==e["NAMELSAD"]){
                                                                    //mapLink.push("https://www.google.com/search?q=" + top_data_list[i]['data_id'].replace(/ /g,"+") + " " + d["county"].replace(/ /g,"+") + ",+Georgia")
                                                            mapLink = "https://www.google.com/maps/search/" + top_data_list[i]['data_id'].replace(/ /g,"+") + "/@" + e['latitude'] + "," + e['longitude'] + ",11z"
                                                                    //console.log("xxxxxxxxx"+e["longitude"])
                                                        }
                                                    }
                                                })
                                            })
                                        }
                                    //})
                                    //let mapLink = "https://www.google.com/maps/search/" + top_data_list[i]['data_id'].replace(/ /g,"+") + "/@" + latitude + "," + longitude + ",11z";


                                if (hash.catsort=="payann"){

                                    //alert("here payann")

                                    //text += top_data_list[i]['NAICScode'] + ": <b>" +top_data_list[i]['data_id']+"</b>, "+String(whichVal.node().options[whichVal.node().selectedIndex].text).slice(3, )+": $"+String((top_data_list[i][whichVal.node().value]/1000).toFixed(2))+" million <br>";
                                    
                                    // Multiple counties
                                    if (Array.isArray(fips)) {

                                        //if (String((top_data_list[i][whichVal.node().value]/1000).toFixed(2)).length<7){
                                        if (1==1) { // Always use million
                                            
                                            // The county cell values
                                            for (var j = 0; j < fips.length; j++) { // For each county selected
                                                if (top_data_list[i]['ratearray'][j]){ // An array of payrole for only the selected conties
                                                    if (top_data_list[i]['Estimate'][j]){    
                                                        if (top_data_list[i]['Estimate'][j]>0){ // Purple color for estimate
                                                            
                                                            midCol += "<div class='cell-right'>" + dollar +"<a href='" + mapLink[j] + "' target='_blank'>"+'<span style="color: #9933aa" >'+ String((top_data_list[i]['ratearray'][j]/1000).toFixed(2)) + " million</span></a></div>";
                                                        } else {
                                                            midCol += "<div class='cell-right'>" + dollar +"<a href='" + mapLink[j] + "' target='_blank'>"+ String((top_data_list[i]['ratearray'][j]/1000).toFixed(2)) + " million</a></div>";
                                                        }
                                                    } else {
                                                        midCol += "<div class='cell-right'>" + dollar +"<a href='" + mapLink[j] + "' target='_blank'>"+ String((top_data_list[i]['ratearray'][j]/1000).toFixed(2)) + " million</a></div>";
                                                    }
                                                } else {
                                                    midCol += "<div class='cell-right'>" + "<a href='" + mapLink[j] + "' target='_blank'>" + "0</a></div>";
                                                }    
                                            }
                                            // The total
                                            rightCol += "<div class='cell-right'>" + dollar + String((top_data_list[i][which]/1000).toFixed(2)) + " million</div>";
                                        } else {
                                            for (var j = 0; j<fips.length; j++){
                                                if (top_data_list[i]['ratearray'][j]){
                                                    
                                                        midCol += "<div class='cell-right'>" + dollar + String((top_data_list[i]['ratearray'][j]/1000000).toFixed(2)) + " million</div>";
                                                    
                                                } else {
                                                        midCol +="<div class='cell-right'>" + "<a href='" + mapLink[j] + "' target='_blank'>" + "0</a></div>";
                                                }   
                                            }
                                            // <span style="color: #9933aa">
                                            rightCol += "<div class='cell-right'>" + dollar + String((top_data_list[i][which]/1000000).toFixed(2)) + " billion</div>";
                                        }
                                        
                                    } else { // One entity (state or county)
                                        //if (String((top_data_list[i][whichVal.node().value]/1000).toFixed(2)).length<7){

                                        if (top_data_list[i]['Estimate']){    
                                            if (top_data_list[i]['Estimate'] > 0){
                                                rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+'<span style="color: #9933aa" >'+String((top_data_list[i][which]/1000).toFixed(2))+" million</span></a></div>";
                                            } else {
                                                rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((top_data_list[i][which]/1000).toFixed(2))+" million</a></div>";  
                                            }
                                        } else {
                                            if (fips==dataObject.stateshown){
                                                if (hash['census_scope']=="state"){
                                                    rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((top_data_list[i][which_state_api]/1000).toFixed(2))+" million</a></div>";  
                                                } else {
                                                    rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((top_data_list[i][which_state]/1000).toFixed(2))+" million</a></div>";  
                                                }
                                            } else {
                                                rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((top_data_list[i][which]/1000).toFixed(2))+" million</a></div>";  
                                            
                                            }

                                            // ADDITIONAL COLUMNS

                                            // employee count
                                            if (fips==dataObject.stateshown){
                                                if (hash['census_scope']=="state"){
                                                    rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i]["emp_api"])) + "</a></div>";
                                                } else {
                                                    //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i][which_state])) + "</a></div>";
                                                }
                                            } else {
                                                //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i][which])) + "</a></div>";
                                            }

                                            // establishments
                                            if (fips==dataObject.stateshown){
                                                if (hash['census_scope']=="state"){
                                                    rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i]["estab_api"])) + "</a></div>";
                                                } else {
                                                    //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i][which_state])) + "</a></div>";
                                                }
                                            } else {
                                                //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i][which])) + "</a></div>";
                                            }
                                        }
                                    }
                         
                                } else {

                                    //rightCol = String(whichVal.node().options[whichVal.node().selectedIndex].text).slice(3, )+": "+Math.round(top_data_list[i][whichVal.node().value]);
                                    if (Array.isArray(fips)){
                                        rightCol = ""
                                        midCol = ""
                                        for (var j = 0; j<fips.length; j++){
                                            if (top_data_list[i]['ratearray'][j]){

                                                if (hash.catsort=="estab"){
                                                    midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + String(Math.round(top_data_list[i]['ratearray'][j])) + "</a></div>";
                                                    
                                                } else {
                                                    if (top_data_list[i]['Estimate'][j]){    
                                                            if (top_data_list[i]['Estimate'][j]>0){
                                                                midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + '<span style="color: #9933aa" >'+String(Math.round(top_data_list[i]['ratearray'][j])) + "</span></a></div>";
                                                    
                                                            } else {
                                                                midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + String(Math.round(top_data_list[i]['ratearray'][j])) + "</a></div>";
                                                    
                                                            }
                                                        } else {
                                                            midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + String(Math.round(top_data_list[i]['ratearray'][j])) + "</a></div>";
                                                    
                                                        }
                                                }

                                                    
                                            } else {
                                                    midCol += "<div class='cell-right'>" + "<a href='" + mapLink[j] + "' target='_blank'>" + "0</a></div>";
                                            } 
                                        }
                                        rightCol += "<div class='cell-right'>" + String(Math.round(top_data_list[i][which])) + "</div>";


                                        //rightCol = String(Math.round(top_data_list[i][whichVal.node().value]));
                                    } else {
                                        if (hash.catsort=="estab"){
                                            if (fips==dataObject.stateshown){
                                                if (hash['census_scope']=="state"){
                                                    rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i][which_state_api])) + "</a></div>";
                                                } else {
                                                    rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i][which_state])) + "</a></div>";
                                                }
                                            } else {
                                                rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i][which])) + "</a></div>";
                                            }
                                        } else {

                                            if (top_data_list[i]['Estimate']){    
                                                if (top_data_list[i]['Estimate']>0){
                                                    
                                                    rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'><span style='color:#9933aa'>" + String(Math.round(top_data_list[i][which])) + "</span></a></div>";

                                                } else {
                                                    rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i][which])) + "</a></div>";
                                                }
                                            } else {
                                                if (fips==dataObject.stateshown){
                                                    if (hash['census_scope']=="state"){
                                                        rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i][which_state_api])) + "</a></div>";
                                                    } else {
                                                        rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i][which_state])) + "</a></div>";
                                                    }
                                                } else {
                                                    rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i][which])) + "</a></div>";
                                                }
                                            }
                                        }
                                    }
                                }

                                //rightCol += "<div class='cell mock-up' style='display:none'><img src='http://localhost:8887/localsite/info/img/plus-minus.gif' class='plus-minus'></div>";
                                ////text += top_data_list[i]['NAICScode'] + ": <b>" +top_data_list[i]['data_id']+"</b>, "+String(whichVal.node().options[whichVal.node().selectedIndex].text).slice(3, )+": "+Math.round(top_data_list[i][whichVal.node().value])+"<br>";
                                
                                

                                // THE INDUSTRY ROW
                                text += "<div class='row'><div class='cell'><a href='#state=" + hash.state + "&naics=" + top_data_list[i]['NAICScode'] + "' onClick='goHash({\"naics\":" + top_data_list[i]['NAICScode'] + "}); return false;' style='color:#aaa;white-space:nowrap'>" + icon + top_data_list[i]['NAICScode'] + "</a></div><div class='cell'>" + top_data_list[i]['data_id'].replace("Other ","") +"</div>"
                                if (Array.isArray(fips)) {
                                    text +=  midCol; // Columns for counties
                                }
                                text += rightCol + "</div>";
                                
                                // use GoHash()
                                

                                if (i<=20){
                                    if (i==0){
                                        naicshash = naicshash+top_data_list[i]['NAICScode'];
                                    } else {
                                        naicshash = naicshash+","+top_data_list[i]['NAICScode']
                                    }
                                    
                                }
                            } // End naics rows
                            //alert("the text " + text);
                        //});
                        let lowerMessage = "";
                        // If none estimated
                        if (!param.naics) {
                            lowerMessage += "Click NAICS number above to view industry's supply chain. ";
                        }
                        consoleLog("NAICS count: top " + naicsRowCount + " displayed out of " + top_data_ids.length);
                        if (naicsRowCount > 0) {
                            lowerMessage += "Purple&nbsp;text&nbsp;indicates approximated values. List does not yet include data for industries without state-level payroll reporting by BLS or BEA. - <a href='/localsite/info/data/'>More&nbsp;Details</a>";
                            
                            waitForElm('#econ_list').then((elm) => {
                                $("#top-content-columns").show();
                                $("#econ_list").html("<div id='sector_list'>" + text + "</div><br><p style='font-size:13px'>" + lowerMessage + "</p>");
                            });
                        }
                        $("#econ_list").show(); 
                        $("#econ_list div").show(); // Do we need?

                        consoleLog('send naics to #industry-list data-naics attribute: ' + naicshash)

                        // BUGBUG - causes naics to appear in hash
                        // Used by bubble.js
                        //alert("naicshash " + naicshash)
                        // Why is this needed for buuble even when naicshash is null?
                        //hiddenhash.naics = naicshash;

                        //console.log("naicshash  " + naicshash);
                        updateHiddenhash({"naics":naicshash}); // Used by bubble

                        // Send to USEEIO Widget
                        //$('#industry-list').attr('data-naics', naicshash);
                        
                        // Problem, this will call a second time if there is a state in hash

                        //if (!$.trim( $('#iogrid').html() ).length) { // If empty, otherwise triggered by hash change.
                            
                            // BUG - HASH GETS CLEARED HERE when SectorList passed to React config
                            applyIO(naicshash);
                        //}
                        
                        // To Remove - Moveed into applyIO below instead. BugBug
                        //updateMosic(naicshash);

                        //updateHash({"naics":naicshash});
                        //hash = loadParams(location.search,location.hash);
                        //midFunc(hash.x,hash.y,hash.z,hash);

                        //alert("#industries show");
                        //$("#industries").show();


                        // Quick hack - might need better way to wait for naics
                        loadScript(theroot + '../localsite/js/d3.v5.min.js', function(results) {
                            loadScript(theroot + '../io/charts/bubble/js/bubble.js', function(results) {
                                waitForElm('#bubble-graph-id').then((elm) => {
                                    //setTimeout(() => {
                                        // This may run before naics is available.
                                        hash.naics = naicshash;
                                        // Quick fix because allData (in io repo) not found with waitForVariable in allData.
                                        // Will later add bubble chart when no state.
                                        //if (hash.state) { // Not needed since this is not reached when no state because naics does not yet load for entire US.
                                            console.log("toggleBubbleHighlights from naics.js for " + hash.state)
                                            toggleBubbleHighlights(hash);
                                        //}
                                    //},3000);
                                });
                            });
                        });
                             

                    })
                })
                d3.csv(local_app.community_data_root() + "us/id_lists/county_id_list.csv").then( function(consdata) {
                    //document.getElementById("industryheader").text = ""; // Clear initial.
                    $(".location_titles").text(""); //Clear

                    /*
                    if (hash.show == "bioeconomy") {
                        $(".regiontitle").text("Bioeconomy and Energy");
                    } else if (hash.show == "parts") {
                        $(".regiontitle").text("Parts Manufacturing");
                    } else if (hash.show == "manufacturing") {
                        $(".regiontitle").text("Manufacturing");
                    } else if (hash.show == "ppe") {
                        $(".regiontitle").text("Healthcare");
                    } else if (hash.show == "vehicles") {
                        $(".regiontitle").text("Vehicle Manufacturing");
                    } else if (gotext) {
                        //$(".regiontitle").text(gotext);
                    }
                    */
                    //alert("countiesCount " + countiesCount + " fips.length " + fips.length)
                    //if (Array.isArray(fips) && countiesCount != fips.length) {
                    if (Array.isArray(fips)) {
                        if (!hash.regiontitle) {
                            //if (hash.show && fips.length == 1) {
                            //    // Remove " County" from this .replace(" County","")
                            //    $(".regiontitle").text(d["county"] + " - " + gotext);
                            //} else 
                            if (hash.show) {
                                //local_app.loctitle = fips.length + " counties";
                                local_app.showtitle = gotext;
                                $(".regiontitle").text(gotext + " within "+ fips.length + " counties");
                            } else {
                                //local_app.loctitle = fips.length + " counties";
                                local_app.showtitle = "Industries";
                                $(".regiontitle").text("Industries within "+ fips.length + " counties");
                            }
                            if (fips.length == 1) {
                                //local_app.loctitle = "County in " + thestate;
                                // To Do: Add county name here
                                //$(".locationTabText").text(thestate);
                            } else {
                                //local_app.loctitle = fips.length + " counties in " + thestate;
                                //$(".locationTabText").text(fips.length + " counties in " + thestate);
                            }
                            //}
                        }
                        /*
                        else if (hash.regiontitle) {
                            local_app.loctitle = hash.regiontitle.replace(/\+/g," ");
                            if (hash.show) {
                                $(".regiontitle").text(local_app.loctitle+ " - " + gotext);
                            } else {
                                $(".regiontitle").text(local_app.loctitle);
                            }
                            $(".locationTabText").text(local_app.loctitle);
                        }
                        */

                        var countytitle = "";
                        for(var i=0; i < fips.length; i++){
                            var filteredData = consdata.filter(function(d) {
                                if (d["id"]==fips[i]){
                                    
                                    /*
                                    if (i==fips.length-1){
                                        document.getElementById("industryheader").innerHTML=document.getElementById("industryheader").innerHTML+'<font size="3">'+d["county"]+'</font>'
                                    } else if (i==0){
                                        document.getElementById("industryheader").innerHTML=document.getElementById("industryheader").innerHTML+'<font size="3">'+d["county"]+', '+'</font>'
                                    } else {
                                    document.getElementById("industryheader").innerHTML=document.getElementById("industryheader").innerHTML+'<font size="3">'+d["county"]+', '+'</font>'
                                    }
                                    */
                                    if (fips.length > 1 && i==fips.length-1) {
                                        countytitle += " and " + d["county"].split(" County")[0];
                                    } else if (i>0) {
                                        countytitle += ", " + d["county"].split(" County")[0];
                                    } else {
                                        countytitle += d["county"].split(" County")[0];
                                    }
                                }
                            })
                        }
                        //countytitle = countytitle.replace(/,\s*$/, ""); // Trim right comma

                        if (fips.length == 1) {
                            countytitle += " County";
                        } else if (fips.length > 1) {
                            countytitle += " Counties";
                        }
                        local_app.countytitle = countytitle;

                        if (fips.length >= 1 && fips.length <= 3) {
                            //local_app.countytitle = $(".location_titles").text();
                            if (hash.show) {
                                $(".regiontitle").text(countytitle + " - " + gotext);
                            } else {
                                $(".regiontitle").text(countytitle);
                            }
                        }

                        $(".location_titles").text(countytitle);
                        $(".location_titles").show();

                    } else if (fips==dataObject.stateshown) {
                        

                        // NOW Resides in map-filters.js

                        /*
                        if (hash.show == "bioeconomy") {
                            $(".regiontitle").text("Bioeconomy and Energy");
                        } else if (hash.show == "parts") {
                            //$(".regiontitle").text("Parts Manufacturing");
                        } else if (hash.show == "manufacturing") {
                            $(".regiontitle").text("Manufacturing");
                        } else if (hash.show == "farmfresh") {
                            $(".regiontitle").text("Farm Fresh");
                        } else if (hash.show == "ppe") {
                            $(".regiontitle").text("Healthcare Industries");
                        } else if (hash.show == "smart") {
                            $(".regiontitle").text("Mobility Tech"); // data-driven list
                        } else if (hash.show == "ev") {
                            $(".regiontitle").text("EV Related Manufacturing"); // Excludes parts and data-driven list
                        } else if (hash.show == "vehicles") {
                            $(".regiontitle").text("Vehicles and Vehicle Parts");
                        } else if (gotext) {
                            // Would overwrite longer title from map.js loadDataset which includes non-datasets
                            //$(".regiontitle").text(gotext);
                        } else {
                            // Temp, reactivate after iogrid stops deleteing hash values.
                            $(".regiontitle").text("Industries");
                            //$(".regiontitle").text(String(d['Name'])+"'s Local Topics");
                        }
                        //alert("locationTabText2")
                        //$(".locationTabText").text("State"); // Temp
                        */
                    } else {
                        var filteredData = consdata.filter(function(d) {
                            if (hash.show) {
                                // Remove " County" from this .replace(" County","")
                                local_app.loctitle = d["county"];
                                local_app.showtitle = gotext;
                                $(".regiontitle").text(d["county"] + " - " + gotext);
                            } else if (d["id"]==fips ) {
                                local_app.loctitle = d["county"] + " Industries";
                                $(".regiontitle").text(d["county"] + " Industries");
                            }
                        })
                    }
                })
                console.log("Done naics loctitle: " + local_app.loctitle)
                return top_data_list;
                } // end if stateAbbr
            }
        })
    })
}

// v2
function topRatesInFipsNew(dataSet, fips) {
    // Adds values to industries list based on:
    // - Selected counties (fips)

    let catFilter = {
        "payann": "Payroll",
        "emp": "Employees",
        "estab": "Establishments"
    }
    //alert(catFilter['estab'])

    // This code will be removed

    // This code will be removed
    /*
    // TABLE HEADER ROW
    //alert("countiesCount " + countiesCount + " fips.length: " + fips.length);
    // && countiesCount != fips.length
    let text = "";
    let totalLabel = "Total";
    if(Array.isArray(fips)) {

        for(var i=0; i < fips.length; i++){

            //var filteredData = consdata.filter(function(county_id_list) { // For every countyID in the country
                //alert(county_id_list["id"] + " - " + fips[i]);
                //if (county_id_list["id"]==fips[i]) {
                    if(i == fips.length-1){
                        // text += "<div class='cell-right'>" + county_id_list["county"].split("County")[0] + " County</div>";
                       text += "<div class='cell-right'>" + fips[i] + " County</div>"; // TEMP
                    } else {
                        //text += "<div class='cell-right'>" + county_id_list["county"].split(" County")[0] + " County</div>";
                        text += "<div class='cell-right'>" + fips[i] + " County</div>"; // TEMP
                    }
                //}
            //})
        }
    }
    //if (fips == stateID && hash.catsort == "payann") {
        text += "<div class='cell' style='text-align:right'>Payroll</div><div class='cell' style='text-align:right'>Establishments</div><div class='cell' style='text-align:right'>Employees</div>";
    //}

    text = "<div class='row' style='table_header'><div class='cell'><!-- col 1 -->NAICS</div><div class='cell' style='min-width:300px'><!-- col 2 -->Industry</div>" + text + "<div class='cell-right'>Population</div>";
    // <div class='cell-right'>" + totalLabel + "</div>
    
    text += "</div>"; // #9933aa
    
    // Write header to browser
    $("#sector_list").prepend(text);
    */

    let naicsFoundCount = 0;
    let naicsNotFoundCount = 0;
    let appendIndustries = [];
    if(dataSet.industies) {
        alert("clear prior industry list")
        for (var i=0; i < dataSet.industies.length; i++) {

            delete dataSet.industies[i].establishments;
            delete dataSet.industies[i].employees; 
            delete dataSet.industies[i].payroll;
            delete dataSet.industies[i].population;
            delete dataSet.industies[i].aggregate;
            delete dataSet.industies[i].instances;
        }
    }
    for (var i=0; i < dataSet.industryCounties.length; i++) { // For each NAICS-county set for a state.
        //alert(dataSet.industryCounties[i].NAICS);
        //alert(dataSet.industryCounties[i].FIPS);
        //alert(fips); // Contains US
        if (fips.length == 0 || fips.includes(dataSet.industryCounties[i].FIPS)) {
            //alert(dataSet.industries[1].id);

            // Walk through the list of industries and aggregate a total from multiple selected counties.
            let objIndex = dataSet.industries.findIndex((obj => obj.id == dataSet.industryCounties[i].NAICS));
            if (objIndex >= 0) {
                if (dataSet.industries[objIndex].aggregate === undefined) { // Add new row
                    dataSet.industries[objIndex].establishments = +dataSet.industryCounties[i]['Establishments'];
                    dataSet.industries[objIndex].employees = Number(dataSet.industryCounties[i]['Employees']); 
                    dataSet.industries[objIndex].payroll = Number(dataSet.industryCounties[i]['Payroll']);
                    dataSet.industries[objIndex].population = Number(dataSet.industryCounties[i]['Population']);
                    dataSet.industries[objIndex].aggregate = Number(dataSet.industryCounties[i][catFilter['estab']]); // Set by dropdown
                    dataSet.industries[objIndex].instances = 1;
                } else { // Add to existing row
                    dataSet.industries[objIndex].establishments = Number(dataSet.industries[objIndex].establishments) + Number(dataSet.industryCounties[i]['Establishments']);
                    dataSet.industries[objIndex].employees = Number(dataSet.industries[objIndex].employees) + Number(dataSet.industryCounties[i]['Employees']);
                    dataSet.industries[objIndex].payroll = Number(dataSet.industries[objIndex].payroll) + Number(dataSet.industryCounties[i]['Payroll']);
                    dataSet.industries[objIndex].population = Number(dataSet.industries[objIndex].population) + Number(dataSet.industryCounties[i]['Population']);
                    dataSet.industries[objIndex].aggregate = Number(dataSet.industries[objIndex].aggregate) + Number(dataSet.industryCounties[i][catFilter['estab']]); // Set by dropdown
                    dataSet.industries[objIndex].instances++;
                }
                //alert(dataSet.industries[objIndex].population)
                ++naicsFoundCount; 
            } else { // An object with new rows to add
                let appendIndex = appendIndustries.findIndex((obj => obj.id == dataSet.industryCounties[i].NAICS));
                if (appendIndex >= 0) {
                    appendIndustries[appendIndex].establishments = +appendIndustries[appendIndex].establishments + +dataSet.industryCounties[i]['Establishments'];
                    appendIndustries[appendIndex].employees = +appendIndustries[appendIndex].employees + +dataSet.industryCounties[i]['Employees'];
                    appendIndustries[appendIndex].payroll = Number(appendIndustries[appendIndex].payroll) + Number(dataSet.industryCounties[i]['Payroll']);
                    appendIndustries[appendIndex].population = Number(appendIndustries[appendIndex].population) + Number(dataSet.industryCounties[i]['Population']);
                    appendIndustries[appendIndex].aggregate = +appendIndustries[appendIndex].aggregate + +dataSet.industryCounties[i][catFilter['estab']]; // Set by dropdown
                    appendIndustries[appendIndex].instances++;
                } else {
                    let newIndustryRow = {};
                    newIndustryRow.id = dataSet.industryCounties[i]['NAICS'];
                    newIndustryRow.title = "NAICS " + dataSet.industryCounties[i]['NAICS'];
                    newIndustryRow.establishments = Number(dataSet.industryCounties[i]['Establishments']);
                    newIndustryRow.employees = Number(dataSet.industryCounties[i]['Employees']); 
                    newIndustryRow.payroll = Number(dataSet.industryCounties[i]['Payroll']);
                    newIndustryRow.population = Number(dataSet.industryCounties[i]['Population']);
                    newIndustryRow.aggregate = Number(dataSet.industryCounties[i][catFilter['estab']]);
                    newIndustryRow.instances = 1;
                    appendIndustries.push(newIndustryRow);
                }
                ++naicsNotFoundCount;
            }
            //dataSet.industries.id[dataSet.industryCounties[i].NAICS].aggregate = dataSet.industryCounties[i].establishments;
            //alert(dataSet.industries.id[dataSet.industryCounties[i].NAICS].aggregate);
        }

        //if (dataSet.industries.id[i.NAICS]) {
        //    alert(i.NAICS);
        //}
    }
    //alert(typeof dataSet.industries);
    //alert(typeof appendIndustries);

    dataSet.industries = $.merge(dataSet.industries, appendIndustries);
    //alert("NAICS found: " + naicsFoundCount + " and " + naicsNotFoundCount + " NAICS not found in " + industryTitleFile);
    //alert(dataSet.industries.length);

    console.log("dataSet.industries v2")
    console.log(dataSet.industries);
    return;

    for (var j = 0; j < fips.length; j++) { 
        
        if(localObject.industryCounties.FIPS == fips[j]) {
            alert(localObject.industryCounties.FIPS);

            break;
            if (localObject.industryCounties[id].hasOwnProperty(fips[j])) {
                rateInFips = rateInFips+parseFloat(localObject.industryCounties[id][fips[j]][which])
                rateArray[j]=parseFloat(localObject.industryCounties[id][fips[j]][which]);
                naicscode = localObject.industryCounties[id][fips[j]]['relevant_naics']
                if(hash.catmethod!=0 & hash.catsort!='estab'){
                    estim[j]=parseFloat(localObject.industryCounties[id][fips[j]][estimed])
                } else {
                    estim[j]=parseFloat(0)
                }
            } else {
                    rateInFips = rateInFips+0
                    estim[j]=parseFloat(0)
            }
        }
    }

}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value)
}

function applyIO(naics) {
    // Built from useeio-widgets/src/widgets/config.ts
    // Minified file resides at io/build/lib/useeio_widgets.js
    //naics = {}; // Kill it
    let hash = getHash(); // Includes hiddenhash
    var config = useeio.urlConfig();
    let endpoint = "/io/build/api";
    // Change && to || in these two lines to test locally.
    if (hash.beta == "true") {
        endpoint = "/OpenFootprint/impacts/2020";
    }
    let theModel = 'USEEIOv2.0.1-411';
    if (hash.beta == "true") {
        if (hash.state) { // Prior to 2024 states were GA, ME, MN, OR, WA
        
            let thestate = hash.state.split(",")[0].toUpperCase();
            theModel = thestate + "EEIOv1.0-s-20"

            //naics = ""; // TEMP. 

            // With transition to 73 Sectors the Naics are not in the models.
            console.log("BETA BUG " + theModel + " with transition to 73 Sectors. Model:\r" + endpoint + "/" + theModel + "\rApplyIO heatmap with naics: " + naics);
        }
    }
    //alert(theModel)
    var modelID = config.get().model || theModel;

    consoleLog("modelID " + modelID + " - ApplyIO heatmap with naics: " + naics);
    //alert("modelID " + modelID + " - ApplyIO heatmap with naics: " + naics);
    
    var naicsCodes;
    if (naics) {
        naicsCodes = naics.split(',');
        
        // Major delay - occur after prior hash is set
        hiddenhash.naics = naics;

        //alert("hiddenhash.naics 2: " + hiddenhash.naics)

        ////hiddenhash.naics = naicsCodes; // Causes split error in bubble chart.

        // HACK - we might use localStorage instead
        priorHash_naicspage = $.extend(true, {}, getHash()); // Clone/copy object without entanglement


    }
    //hiddenhash.naics = {}; // Kill it

    if (!hash.state && !param.state) {
        //console.log("Show national by clearing hiddenhash.naics.")
        // Clear to show national heatmap mosaic and input-output chart.
        //delete hiddenhash.naics;
    }

    var indicators = "";
    //let hash = getHash();
    if (hash.indicators) {
        indicators = hash.indicators;
        hiddenhash.indicators = hash.indicators;
    }

    var indicatorCodes = indicators.split(',');


    if (param.iomodel) {
        modelID = param.iomodel;
    }
    var model = useeio.model({
        endpoint: endpoint,
        model: modelID,
        asJsonFiles: true
    });
    var ioGrid = useeio.ioGrid({
        model: model,
        selector: '#iogrid',
        indicators: indicatorCodes,
    });
    config.withDefaults({
        count: 20,
    })
    config.join(ioGrid);

    var sectorList = useeio.sectorList({
        model: model,
        selector: '#sector-list',
    });
    
    //alert("hiddenhash.naics " + hiddenhash.naics);
    //hiddenhash.naics = {}; // Kill it

    if (typeof sectorList.config != "undefined") {
        //sectorList.config.naics = {}; // Kill it
    }
    console.log("sectorList - applyIO() impact indicators and sectors for Supply Chain inflow-outflow chart:");
    console.log(sectorList);


    config.withDefaults({
        view: ["mosaic"],
        count: 50,
        //naics: naicsCodes,
        //sectors: useeio.toBEA(naicsCodes),
        //naics: naics,
        //sectors: useeio.toBEA(naics),
    })
    // Neither of the above naics attempts works for second state loaded.
    
    console.log("sectorList");
    console.log(sectorList);

    if (hash.beta == "true") {
        if (hash.state && location.host.indexOf('localhost') >= 0) {
            alert("BUG (message on localhost): sectorList React drops state " + JSON.stringify(sectorList, null, 2));
        } else if (location.host.indexOf('localhost') >= 0) {

            alert("localhost: sectorList " + JSON.stringify(sectorList, null, 2));
        }
        alert("HASH GETS CLEARED by call applyIO with naics " + naicshash)
        config.join(sectorList); // BUG BUG - Dumps hash state and geoview - Comment out to preserve state, but you'll lose the mosaic heatmap.
    } else {

        // Displays mosaic - but dumps hash from URL (when hitting reload, or entering via a URL)
        config.join(sectorList); // BUG BUG - Only works when hash changes in page already loaded.

        // Alternative that preserves state
        //config.join(); // Doesn't work for passing sectorList
    }
}

// New 73 Sectors
getEpaSectors();
function getEpaSectors() {
    let hash = getHash();
    // sectorsJsonFile is not used
    let sectorsJsonFile = "/io/build/api/USEEIOv2.0.1-411/sectors.json"; // 411 sectors
    if (hash.beta == "true") {
        if (hash.state) {
            let thestate = hash.state.split(",")[0].toUpperCase();
            theModel = thestate + "EEIOv1.0-s-20"
            // if (hash.state == "GA" || hash.state == "ME") {
            sectorsJsonFile = "/OpenFootprint/impacts/2020/" + theModel + "/sectors.json"; // 146/2 = 73
            //alert(thestate + " sectorsJsonFile " + sectorsJsonFile);
        }
    }
    waitForElm('#tabulator-sectortable-intro').then((elm) => {
        $("#tabulator-sectortable-intro").text("#tabulator-sectortable - " + sectorsJsonFile)
    });
    let promises = [
        d3.json(sectorsJsonFile, function(d) {
            // Not reached, so commenting out. But the above line is needed.
            //epaSectors.set(d.id, d.index, d.name, d.code, d.location, d.description);
            //alert("epaSectors");
            //return d;
        })
    ]
    Promise.all(promises).then(sectorsPromisesReady);
    function sectorsPromisesReady(values) { // Wait for sectors json
        // Returns Residential building repair and maintanence
        //alert(epaSectors.get("230302/US"));
        localObject.epaSectors = values[0]; // 73 EPA sectors

        // Remove duplicates using filter() method to remove objects with a "location" equal to "RoUS" (Rest of US)
        localObject.epaSectors = localObject.epaSectors.filter(obj => obj.location !== "RoUS");

        console.log("localObject.epaSectors");
        console.log(localObject.epaSectors);
        showSectorTabulatorList(0);
    }
}

var sectortable = {};
function showSectorTabulatorList(attempts) {
    let hash = getHash();
    if (typeof Tabulator !== 'undefined') {
        sectortable = new Tabulator("#tabulator-sectortable", {
            data:localObject.epaSectors,     //load row data from array of objects
            layout:"fitColumns",      //fit columns to width of table
            responsiveLayout:"hide",  //hide columns that dont fit on the table
            tooltips:true,            //show tool tips on cells
            addRowPos:"top",          //when adding a new row, add it to the top of the table
            history:true,             //allow undo and redo actions on the table
            movableColumns:true,      //allow column order to be changed
            resizableRows:true,       //allow row order to be changed
            initialSort:[             //set the initial sort order of the data
                {column:"index", dir:"asc"},
            ],
            maxHeight:"500px", // For frozenRows
            columns:[
                { 
                  title: "Commodity", 
                  field: "name", 
                  width: "35%",
                  formatter: function(cell, formatterParams) {
                    const sector = cell.getRow().getData();
                    let stateCode = '';

                    if (sector.location.includes('-')) {
                      stateCode = sector.location.split('-')[1];
                    }
                    const demandHash = `demand=${sector.code}/${sector.location}`;
                    const stateParam = stateCode ? `&state=${stateCode}` : '';
                    const indexHash = `index=${sector.index}`; // legacy support for old links
                    return `<a href="/useeio.js/footprint/sector_profile.html#${demandHash}${stateParam}">${sector.name}</a>`;
                  }
                },
                {title:"Code", field:"code", width:70, hozAlign:"right", headerSortStartingDir:"desc", sorter:"number" },
                {title:"Location", field:"location", width:90, hozAlign:"right", headerSortStartingDir:"desc" },
                {title:"Description", field:"description", minWidth:320, hozAlign:"left", headerSortStartingDir:"desc" }
            ],
            rowClick:function(e, row) {
                row.toggleSelect(); //toggle row selected state on row click

                console.log("row:");
                console.log(row); // Single row component
                console.log(e); // Info about PointerEvent - the click event object
                if (location.host.indexOf('localhost') >= 0) {
                    alert("rowClick naics.js on localhost");
                }
                // Added let Feb 2024
                let currentRowIDs = [];
                //e.forEach(function (row) {
                    //console.log(row.geoid);
                    currentRowIDs.push(row._row.data.id);
                //});
                //alert(currentRowIDs.toString())

                // Possible way to get currently selected rows - not sure is this includes rows not in DOM
                // var selectedRows = $("#tabulator-industrytable").tabulator("getSelectedRows"); //get array of currently selected row components.

                // Merge with existing naics values from hash. This allows map to match.
                let hash = getHash();
                if (row.isSelected()) {
                    if(hash.naics) {
                        //hash.naics = hash.naics + "," + currentRowIDs.toString();
                        hash.naics = hash.naics + "," + row._row.data.id;
                    } else {
                        hash.naics = currentRowIDs.toString();
                    }
                } else { // Uncheck
                    // Remove only unchecked row.
                    //$.each(currentRowIDs, function(index, value) {
                        hash.naics = hash.naics.split(',').filter(e => e !== row._row.data.id).toString();
                    //}
                }
                goHash({'naics':hash.naics});

                //var selectedData = industrytable.getSelectedData(); // Array of currently selected
                //alert(selectedData);
            },
            rowSelectionChanged: function(e, row) {
                //alert("rowSelectionChanged")

                //console.log("rowSelectionChanged");
                //console.log(e); // Contains all selected rows.

                //console.log("Row Selection (checkbox) Changed");
                //console.log(row); // Has extra levels

                /*
                currentRowIDs = [];
                e.forEach(function (row) {
                    //console.log(row.geoid); // naics now, will be sector
                    currentRowIDs.push(row.id)
                });
                */

                if (row[0]) {
                    //console.log(e[0].id); // the geoid

                    // Works - but currently showing first item in array of objects:
                    //console.log(row[0]._row.data.id); // .data.geoid

                    //this.recalc();
                }
            },
        });

        //industrytable.selectRow(industrytable.getRows().filter(row => row.getData().name == 'Fulton County, GA'));
        //industrytable.selectRow(industrytable.getRows().filter(row => row.getData().name.includes('Ba')));

        // Place click-through on checkbox - allows hashchange to update row.
        //$('.tabulator-row input:checkbox').prop('pointer-events', 'none'); // Bug - this only checks visible
        
        sectortable.on("dataLoaded", function(data){
            $("#sectors_totalcount").remove(); // Prevent dup - this will also remove events bound to the element.
            let totalcount_div = Object.assign(document.createElement('div'),{id:"sectors_totalcount",style:"margin-bottom:10px"})
            $("#tabulator-sectortable-count").append(totalcount_div);
            totalcount_div.innerHTML = data.length-1 + " sectors";  
        });

    } else {
      attempts = attempts + 1;
      if (attempts < 200) {
        // To do: Add a loading image after a coouple seconds. 2000 waits about 300 seconds.
        setTimeout( function() {
          //showIndustryTabulatorList(attempts);
          showSectorTabulatorList(attempts)
        }, 20 );
      } else {
        alert("Tabulator JS not available for displaying list.")
      }
    }
}

// From naics2.js for v2

var industrytable = {};
function showIndustryTabulatorList(attempts) {
    let hash = getHash();
    if (typeof Tabulator !== 'undefined') {
        console.log("showIndustryTabulatorList localObject.industryCounties.length");
        console.log("Row count: " + localObject.industryCounties.length) // Almost 40,000
        console.log(localObject.industryCounties.slice(0, 10));

        // Try this with 5.0. Currently prevents row click from checking box.
        // selectable:true,

        // For fixed header, also allows only visible rows to be loaded. See "Row Display Test" below.
        // maxHeight:"100%",

        // More filter samples
        // https://stackoverflow.com/questions/2722159/how-to-filter-object-array-based-on-attributes

        // Already sent to console
        //console.log("data:localObject.industries");

        // $("#tabulator-industrytable-count").append(totalcount_div);

        // ToDo: Replace width on Industry with a cell that fills any excess space.

        // {title:"Population", field:"Population", hozAlign:"right", minWidth:120, headerSortStartingDir:"desc", sorter:"number", formatter:"money", formatterParams:{precision:false} },
                
        industrytable = new Tabulator("#tabulator-industrytable", {
            data:localObject.industryCounties,     //load row data from array of objects
            layout:"fitColumns",      //fit columns to width of table
            responsiveLayout:"hide",  //hide columns that dont fit on the table
            tooltips:true,            //show tool tips on cells
            addRowPos:"top",          //when adding a new row, add it to the top of the table
            history:true,             //allow undo and redo actions on the table
            movableColumns:true,      //allow column order to be changed
            resizableRows:true,       //allow row order to be changed
            initialSort:[             //set the initial sort order of the data - NOT WORKING
                {column:"Employees", dir:"desc"},
            ],
            maxHeight:"480px", // For frozenRows
            paginationX:true, //enable.
            paginationSizeX:10,
            columns:[
                {title:"Naics", field:"Naics", minWidth:60},
                {title:"Industry", field:"Industry", minWidth:300},
                {title:"Payroll", field:"Payroll", hozAlign:"right", minWidth:120, headerSortStartingDir:"desc", sorter:"number", formatter:"money", formatterParams:{precision:false,symbol:"$"} },
                {title:"Locations", field:"Establishments", hozAlign:"right", minWidth:80, headerSortStartingDir:"desc", sorter:"number", formatter:"money", formatterParams:{precision:false} },
                {title:"Employees", field:"Employees", hozAlign:"right", minWidth:100, headerSortStartingDir:"desc", sorter:"number", formatter:"money", formatterParams:{precision:false} },
                {title:"County FIPS", field:"Fips", hozAlign:"right", minWidth:100, headerSortStartingDir:"desc", sorter:"number" }
            ],
            rowClick:function(e, row) {
                row.toggleSelect(); //toggle row selected state on row click

                console.log("row:");
                console.log(row); // Single row component
                console.log(e); // Info about PointerEvent - the click event object

                currentRowIDs = [];
                //e.forEach(function (row) {
                    //console.log(row.geoid);
                    currentRowIDs.push(row._row.data.id);
                //});
                //alert(currentRowIDs.toString())

                // Possible way to get currently selected rows - not sure is this includes rows not in DOM
                // var selectedRows = $("#tabulator-industrytable").tabulator("getSelectedRows"); //get array of currently selected row components.

                // Merge with existing naics values from hash. This allows map to match.
                let hash = getHash();
                if (row.isSelected()) {
                    if(hash.naics) {
                        //hash.naics = hash.naics + "," + currentRowIDs.toString();
                        hash.naics = hash.naics + "," + row._row.data.id;
                    } else {
                        hash.naics = currentRowIDs.toString();
                    }
                } else { // Uncheck
                    // Remove only unchecked row.
                    //$.each(currentRowIDs, function(index, value) {
                        hash.naics = hash.naics.split(',').filter(e => e !== row._row.data.id).toString();
                    //}
                }
                goHash({'naics':hash.naics});

                //var selectedData = industrytable.getSelectedData(); // Array of currently selected
                //alert(selectedData);
            },
            rowSelectionChanged: function(e, row) {
                //alert("rowSelectionChanged")

                //console.log("rowSelectionChanged");
                //console.log(e); // Contains all selected rows.

                //console.log("Row Selection (checkbox) Changed");
                //console.log(row); // Has extra levels

                /*
                currentRowIDs = [];
                e.forEach(function (row) {
                    //console.log(row.geoid); // naics now, will be sector
                    currentRowIDs.push(row.id)
                });
                */

                if (row[0]) {
                    //console.log(e[0].id); // the geoid

                    // Works - but currently showing first item in array of objects:
                    //console.log(row[0]._row.data.id); // .data.geoid

                    //this.recalc();
                }
            },
        });

        //industrytable.selectRow(industrytable.getRows().filter(row => row.getData().name == 'Fulton County, GA'));
        //industrytable.selectRow(industrytable.getRows().filter(row => row.getData().name.includes('Ba')));

        // Place click-through on checkbox - allows hashchange to update row.
        //$('.tabulator-row input:checkbox').prop('pointer-events', 'none'); // Bug - this only checks visible
        
        if (1==2) { // Not in use because we display directly from data (below).
            industrytable.on("dataLoaded", function(data){
                $("#industries_totalcount").remove(); // Prevent dup - this will also remove events bound to the element.
                let totalcount_div = Object.assign(document.createElement('div'),{id:"industries_totalcount",style:"margin-bottom:10px"})
                $("#tabulator-industrytable-count").append(totalcount_div);
                totalcount_div.innerHTML = data.length + " industries";  
            });
        }
    } else {
      attempts = attempts + 1;
      if (attempts < 200) {
        // To do: Add a loading image after a coouple seconds. 2000 waits about 300 seconds.
        setTimeout( function() {
          showIndustryTabulatorList(attempts);
        }, 20 );
      } else {
        alert("Tabulator JS not available for displaying list.")
      }
    }
}
// TO DO: Initially 6-digit naics. Store naics when number changes to 2 and 4 digit to avoid reloading file.
// TO DO: Put a promise on just the industries
function callPromises(industryLocDataFile) { // From naics2.js
    let promises = [
        // GET 2 DATASETS - values[0] and values[1]
        d3.csv(industryTitleFile, function(d) {
            industries.set(d.id, d.title);
            return d;
        }),
        d3.csv(industryLocDataFile)
    ]
    Promise.all(promises).then(promisesReady);
    function promisesReady(values) { // Wait for 

        localObject.industries = values[0]; // NAICS industry titles

        // TO DO: Append here for multiple states
        localObject.industryCounties = values[1]; // Exceeds 40,000

        // CGet industry titles using naics 'id' in localObject.industries
        const industryMap = new Map(localObject.industries.map(ind => [ind.id, ind.title]));

        // Merge titles into county data
        localObject.industryCounties = localObject.industryCounties
          .map(county => ({
            ...county,
            Industry: industryMap.get(county.Naics) // Match by Naics and add Industry
          }))
          //.filter(county => county.Industry); // Remove rows with no Industry match
          // Uncomment line above once we figure out why some Naics lookups have no titles.

        //localObject.locList = makeRowValuesNumeric(data, dp.numColumns, dp.valueColumn);
          
        // Make element key always lowercase
        //dp.data_lowercase_key;

        //processOutput(dp,map,map2,whichmap,whichmap2,basemaps1,basemaps2,function(results){});

        //alert(fips) // 13189,13025,13171
        //fips = [13189,13025,13171]; // TEMP
        //fips = ["US13189","US13025","US13171"];

        fips = [];
        //let hash = getHash();
        //if (hash.geo) {
        //    fips = hash.geo.replace(/US/g,'').split(","); // Remove US from geo values to create array of fips.
        //}

        // Only had 2 in naics2.js.  Other one has dataSet, dataNames, fips, hash // Renders header and processes county values
        topRatesInFipsNew(localObject, fips); // Renders header and processes county values

        industriesDetails = "localObject.industries " + industryLocDataFile + "<br>";
        industriesDetails += "localObject.industries length " + localObject.industries.length + "<br>";
        industriesDetails += "localObject.industryCounties length " + localObject.industryCounties.length + "<br>";
        $("#industries_details").append(industriesDetails);

        let industries_details= Object.assign(document.createElement('div'),{id:"industries_details",style:"margin-bottom:10px"})
        $("#tabulator-industrytable-count").append(industries_details);
        
        // Display count directly from data
        industries_details.innerHTML = localObject.industryCounties.length + " industries"; 

        // Returns Logging
        //alert(industries.get("113310"));

        showIndustryTabulatorList(0); 
    }
}

/*
function getModelFolderName() {
    let hash = getUrlHash();
    let theModel = "USEEIOv2.0.1-411";
    if (hash.state) { // Prior to 2024 states were GA, ME, MN, OR, WA
        let thestate = hash.state.split(",")[0].toUpperCase();
        theModel = thestate + "EEIOv1.0-s-20"
    }
    return theModel;
}
function getEpaModel() {
    let theModel = getModelFolderName()
    return useeio.modelOf({
      //endpoint: 'http://localhost:8887/OpenFootprint/impacts/2020',

      // Relative path avoids CORS error
      endpoint: '/OpenFootprint/impacts/2020',

      model: theModel,
      asJsonFiles: true,
    });
}
*/
console.log("end naics.js")