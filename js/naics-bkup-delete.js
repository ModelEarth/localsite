// Default is currently state13 for GA.
// The value after naics is the number of digits in the naics code

//  Sample: Columns from 6_state_all
// id  COUNTY  GEO_TTL NAICS_Sector    NAICS2012_TTL   state   relevant_naics  estab_agg   emp_agg payann_agg  emp_api payann_api  estab_api
// 759 13  999 Statewide   55  Corporate, subsidiary, and regional managing offices    13  551114  1541.3499999999995  110283.20000000004  11605999.4  116336.0    12059746.4  1542.8


let params = loadParams(location.search,location.hash);
params = mix(param,params); // Add include file's param values.

if(typeof dataObject == 'undefined') {
    var dataObject = {};
}
let stateID = {AL:1,AK:2,AZ:4,AR:5,CA:6,CO:8,CT:9,DE:10,FL:12,GA:13,HI:15,ID:16,IL:17,IN:18,IA:19,KS:20,KY:21,LA:22,ME:23,MD:24,MA:25,MI:26,MN:27,MS:28,MO:29,MT:30,NE:31,NV:32,NH:33,NJ:34,NM:35,NY:36,NC:37,ND:38,OH:39,OK:40,OR:41,PA:42,RI:44,SC:45,SD:46,TN:47,TX:48,UT:49,VT:50,VA:51,WA:53,WV:54,WI:55,WY:56,AS:60,GU:66,MP:69,PR:72,VI:78,}
let stateAbbr;
//alert(getKeyByValue(stateID,12));

// INIT
// We could set hiddenhash=param, but we'd need to see if it gets sent to the url
//if (param.naics) { 
//    hiddenhash.naics = param.naics;
//}
//if (param.indicators) {
//    hiddenhash.indicators = param.indicators;
//}

if (params.geo){
    fip=params.geo.split("US")[1]   
    if(fip.startsWith("0")){
        dataObject.stateshown = params.geo.split("US0")[1]
    }else{
        dataObject.stateshown = params.geo.split("US")[1]
    }
}
[fips,dataObject.stateshown]=getStateFips(params);

function getStateFips(params){
    let hash = getHash();
    if (params.geo) {
        //if (params.geo.includes(",")) {
            var geos=params.geo.split(",");
            fips=[]
            for (var i = 0; i<geos.length; i++){
                fip=geos[i].split("US")[1]
                if(fip.startsWith("0")){
                    fips.push(parseInt(geos[i].split("US0")[1]))
                }else{
                    fips.push(parseInt(geos[i].split("US")[1]))
                }
            }
            st=(geos[0].split("US")[1]).slice(0,2)
            if(st.startsWith("0")){
                dataObject.stateshown=(geos[0].split("US0")[1]).slice(0,1)
            }else{
                if(geos[0].split("US")[1].length==4){
                    dataObject.stateshown=(geos[0].split("US")[1]).slice(0,1)
                }else{
                    dataObject.stateshown=(geos[0].split("US")[1]).slice(0,2)
                }
                
            }
        /* BUG - was loading Westion County from Wyoming when only one county selected.
        } else {
            //alert("split on US")
            fip=params.geo.split("US")[1]
            
            if(fip.startsWith("0")){
                fips=parseInt(params.geo.split("US0")[1])
            }else{
                fips=parseInt(params.geo.split("US")[1])
            }
            st=(params.geo.split("US")[1]).slice(0,2)
            if(st.startsWith("0")){
                    dataObject.stateshown=(params.geo.split("US0")[1]).slice(0,1)
            }else{
                if(params.geo.split("US")[1].length==4){
                    dataObject.stateshown=(params.geo.split("US")[1]).slice(0,1)
                }else{
                    dataObject.stateshown=(params.geo.split("US")[1]).slice(0,2)
                }
            
            }
        }
        */
    } else if (hash.state) {
        //fips = $("#state_select").find(":selected").attr("stateid").trimLeft("0");
        fips = stateID[hash.state];
        dataObject.stateshown = fips;
        //alert("the fips " + fips)
    } else {
        fips = dataObject.stateshown;
    }
    stuff=[]
    stuff.push(fips)
    stuff.push(dataObject.stateshown)
    return stuff
}

console.log("fips" + fips)
console.log("dataObject.stateshown: " + dataObject.stateshown);


// INIT
let priorHash_naicspage = {};
refreshNaicsWidget();
//loadNationalIfNoState(); // Caused duplicate call to applyIO when using param.state

function loadNationalIfNoState() {
    let hash = getHash()
    if (!hash.state) { // No naics filter, use national
        applyIO();
    }
}
document.addEventListener('hashChangeEvent', function (elem) {
    if (hiddenhash.debug && location.host.indexOf('localhost') >= 0) {
        //alert('Localhost Alert: hashChangeEvent invoked by naics.js'); // Invoked twice by iogrid inflow-outflow chart
    }
    //let params = loadParams(location.search,location.hash);
    refreshNaicsWidget();                    
 }, false);

function refreshNaicsWidget() {
    //alert("refreshNaicsWidget")
    let hash = getHash(); // Includes hiddenhash
    if (hash.show == "undefined") { // To eventually remove
        delete hash.show; // Fix URL bug from indicator select hamburger menu
        updateHash({'show':''}); // Remove from URL hash without invoking hashChanged event.
        console.log("REMOVED hash=undefined");
    }

    params = loadParams(location.search,location.hash); // Also used by loadIndustryData(hash)
    params = mix(param,params); // Add include file's param values.

    if (!params.catsort) {
        params.catsort = "payann";
    }
    if (!params.catsize) {
       params.catsize = 6;
    }
    if (!params.census_scope) {
       params.census_scope = 'state';
    }

    
    if (hash.naics != priorHash_naicspage.naics) { // IF NAICS, AVOID THEME NAICS (from show) 

    } else if (hash.show != priorHash_naicspage.show) { // GET NAICS BASED ON THEME (recycing, bioeconomy, etc.)
        // Initial load
        getNaics_setHiddenHash2(hash.show); // Sets hiddenhash.naics for use by other widgets.

        // Get the hash again because hiddenhash.naics is set in getNaics_setHiddenHash2
        hash = getHash(); // Get new hiddenhash

    } else if (hash.state != priorHash_naicspage.state) {
        // Not working yet
        //getNaics_setHiddenHash2(hash.show); // Show the state name above naics list.
    } else if (hash.catsize != priorHash_naicspage.catsize) {
        //getNaics_setHiddenHash2(hash.show);
    }

    
    // The following will narrow the naics to the current location
    if (hash.regiontitle != priorHash_naicspage.regiontitle) {

        if (!hash.regiontitle) {
            if(!hash.geo) {
                
            }
        } else {
            hiddenhash.loctitle = hash.regiontitle;
            $("#region_select").val(hash.regiontitle.replace(/\+/g," "));
            hiddenhash.geo = $("#region_select option:selected").attr("geo");
            hash.geo = hiddenhash.geo;
            params.geo = hiddenhash.geo; // Used by naics.js
        }
        loadIndustryData(hash);
    } else if (hash.state != priorHash_naicspage.state) {
        // Initial load, if there is a state
        console.log("hash.state change call loadIndustryData(hash)")
        loadIndustryData(hash); // Occurs on INIT
    } else if (hash.geo != priorHash_naicspage.geo) {
        //alert("hash.geo " + hash.geo);
        loadIndustryData(hash);
    } else if (hash.naics != priorHash_naicspage.naics) {
        //alert("hash.naics " + hash.naics);
        loadIndustryData(hash);
    } else if (hash.catsize != priorHash_naicspage.catsize) {
        loadIndustryData(hash);
    } else if (hash.catsort != priorHash_naicspage.catsort) {
        loadIndustryData(hash);
    } else if (hash.indicators != priorHash_naicspage.indicators) {
        // Avoid invoking change to widget since indicators is auto-detected
        //alert("hash.indicators " + hash.indicators);
        // initial
    } else if (hash.sectors != priorHash_naicspage.sectors) {
        // Avoid invoking change to widget since sectors is auto-detected
    } else {
        // Danger, watch for loops
        console.log("No state selected for naics.");
        
        //applyIO("");

        // TEMP
        //hiddenhash.naics = "541511,541512,551114,611310";
        //loadIndustryData(hash); // WHy does this not trigger applyio?
        //alert("call applyIO from no change");
        //alert("hiddenhash.naics " + hiddenhash.naics)
        //applyIO(hiddenhash.naics); // TEMP - why is hiddenhash.naics null here?
    }

    priorHash_naicspage = getHash();
}

function getNaics_setHiddenHash2(go) {

    let showtitle, showtab;
    let cat_filter = [];
    let states = "";

    // NAICS FROM community/projects/biotech
    let computers = "541511,541512,551114,611310"
    let bio_input = "113000,321113,113310,32121,32191,562213,322121,322110,"; // Omitted 541620
    let bio_output = "325211,325991,3256,335991,325120,326190,";
    let green_energy = "221117,221111,221113,221114,221115,221116,221118,";
    let fossil_energy = "221112,324110,325110,";
    let electric = "335910,335911,335912,";
    let auto_parts = "336390,336211,336340,336370,336320,336360,331221,336111,336330,";
    let parts = "336412,336413,339110,333111,325211,326112,332211,336370,336390,326199,331110,336320,";
    let solar = "221114,334313,335999";
    let combustion_engine = "333613,326220,336350,336310,333618,";
    let parts_carpets = "325520,314110,313110,313210,"
    let ppe_suppliers = "622110,621111,325414,339113,423450,"
    let farmfresh = "311612,311615,311911,311919,311830,311824,311941,311710,311611,115114,311613,311811,311942,311991,311999,311211,311224,311920,"
    let recycling = "423930,562111,562112,562119,562211,562212,562213,562219,562910,562920,562991,562998,56299";

    //if (param.naics) {
    //    cat_filter = param.naics.split(',');
    //}
    //else 
    if (go){

        if (go == "opendata") {
            states = "GA";
        } else if (go == "bioeconomy") {
            showtab = "Bioeconomy and Energy";
            showtitle = "Bioeconomy and Energy Industries";
            cat_filter = (bio_input + bio_output + green_energy + fossil_energy).split(',');
        } else if (go == "farmfresh") {
            showtitle = "Farm Fresh";
            cat_filter = (farmfresh).split(',');
        } else if (go == "smart") {
            // smart also shows list of data-driven mobility projects
            cat_filter = (electric + auto_parts).split(',');
        } else if (go == "ev") {
            showtab = "EV Ecosystem";
            showtitle = "EV Related Manufacturing";
            // smart also shows list of data-driven mobility projects
            cat_filter = (electric + auto_parts).split(',');
        } else if (go == "parts") {
            showtitle = "Parts Manufacturing";
            cat_filter = (electric + auto_parts + parts + combustion_engine).split(',');
        } else if (go == "ppe") {
            showtitle = "Healthcare Industries";
            cat_filter = (ppe_suppliers).split(',');
            states = "GA";
        } else if (go == "solar") {
            showtab = "Solar";
            showtitle = "Solar Power";
            cat_filter = (solar).split(',');
        } else if (go == "vehicles") {
            showtab = "Automotive"
            showtitle = "Vehicles and Vehicle Parts";
            cat_filter = (electric + auto_parts + parts).split(',');
        } else if (go == "recycling") {
            showtab = "Recycling";
            showtitle = "Recycling Processors (B2B)";
            cat_filter = (recycling).split(',');
            states = "GA";
        } else if (go == "transfer") {
            showtab = "Transfer Stations";
            showtitle = "Recycling Transfer Stations (B2B)";
            cat_filter = (recycling).split(',');
            states = "GA";
        } else if (go == "recyclers") {
            showtab = "Recyclers";
            showtitle = "Companies that Recycle during Manufacturing";
            cat_filter = (recycling).split(',');
            states = "GA";
        } else if (go == "inert") {
            showtab = "Inert Waste Landfills";
            showtitle = "Inert Waste Landfills";
            cat_filter = (recycling).split(',');
            states = "GA";
        } else if (go == "landfills") {
            showtab = "Landfills";
            showtitle = "Landfills";
            cat_filter = (recycling).split(',');
            states = "GA";
        } else if (go=="manufacturing") {
            showtitle = "Manufacturing";
            cat_filter=["manufacturing placeholder"];
        } else if (go=="industries") {
            showtitle = "Local Industries";
            $("#keywordsTB").attr("placeholder","City name..."); // For layers = brigades
        } else if (param.naics) {
            showtitle = go.charAt(0).toUpperCase() + go.substr(1).replace(/\_/g," ");
            cat_filter = param.naics.split(',');
        } else {
            showtitle = go.charAt(0).toUpperCase() + go.substr(1).replace(/\_/g," ");
        }

        if (cat_filter.length) {
            cat_filt=[]
            for(i=0;i<cat_filter.length;i++){
                cat_filt.push(cat_filter[i].slice(0,6));
            }
            cat_filter=cat_filt
            //console.log(cat_filter)
        }
        if (!showtab) {
            showtab = showtitle;
        }
        if (!showtab) {
            showtab = hash.show.charAt(0).toUpperCase() + hash.show.substr(1).replace(/\_/g," ");
        }

        if (states.length <= 0) { // All states
            //$("#selected_states").show();
        }
        
    } else if (param.naics) {
        showtitle = "Local Industries";
        //
        showtab = "Local Industries";
        cat_filter = param.naics.split(',');
    }

    // BUGBUG - Not sure where this sends the naics to the URL hash, which might be good until widget updates are tested.
    // Problem, naics in URL is not updated after initial load.
    console.log("Start hiddenhash.naics")
    hiddenhash.naics = cat_filter.join(); // Overrides the existing naics

    delete hash.naics; // Since show value invokes new hiddenhash
    //delete hiddenhash.naics;
    //clearHash("naics"); // Assuming this does not trigger a hash change event.
    updateHash({'naics':''})

    // If states are available yet, wait for DOM.
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
    } else {
        //alert("local_app.loctitle " + local_app.loctitle)
        //$(".regiontitle").text(local_app.loctitle);
    }
    return cat_filter;
}
function populateTitle(showtitle,showtab) {
    hash = getHash();
    if (hiddenhash.loctitle) {
        showtitle = hiddenhash.loctitle + " - " + showtitle;
    } else if (hash.state) {
        $("#state_select").val(hash.state.toUpperCase().split(",")[0]);
        let thestate = $("#state_select").find(":selected").text();
        hiddenhash.loctitle = thestate;

        if (showtitle) {
            showtitle = thestate + " - " + showtitle;
        } else {
            showtitle = thestate + " - Local Industries";
        }
        
    }

    delete hiddenhash.loctitle; // Clear until we are setting elsewhere.
    $("#showAppsText").text(showtab);
    $("#showAppsText").attr("title",showtab); // Swaps in when viewing app thumbs
    $(".regiontitle").text(showtitle);
}



// POORLY DESIGNED - No need to load all 3 naics datasets for state.
// Calls promisesReady when completed.
function loadIndustryData(hash) {
    alert("loadIndustryData hash.naics " + hash.naics)
    console.log("loadIndustryData");
    let stateAbbr;
    //let hash = getHash(); // Includes hiddenhash
    if (hash.state && hash.state.length == 2) {
        stateAbbr = hash.state.toUpperCase();
    }
    $("#econ_list").html("<img src='" + local_app.localsite_root() + "img/icon/loading.gif' style='margin:40px; width:120px'><br>");
    
    // HACK BUGBUG - Until we have a path to data for entire country.
    if(!stateAbbr) {
        stateAbbr = "GA";
    }
    
    if(!stateAbbr) { // THIS IS NOT REACHED ON INIT, regardless of hack above.
        // Load US data here
        // TODO: When acivating, in info/index.html remove applyIO("")
        //alert("update for no state");
        delete hiddenhash.naics;
        delete hash.naics;
        console.log("call applyIO when no stateAbbr")
        alert("Load national, no naics stateAbbr " + stateAbbr);
        //applyIO(""); // Causes loop
    } else {
        //alert("stateAbbr1: " + stateAbbr);
        dataObject.stateshown=stateID[stateAbbr.toUpperCase()];
        var promises = [
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
            d3.tsv(local_app.community_data_root() + "us/state/" + stateAbbr + "/" + stateAbbr + "counties.csv")
        ]
        Promise.all(promises).then(promisesReady);
    }
}
function promisesReady(values) {
    let hash = getHash();
    if (hash.catsize) {
        params.catsize = hash.catsize;
    }
    if (hash.catsort) {
        params.catsort = hash.catsort;
    }
    console.log("promisesReady - promises loaded")
    $("#industryListHolder").show();
    d3.csv(local_app.community_data_root() + "us/id_lists/state_fips.csv").then( function(consdata) {
        var filteredData = consdata.filter(function(d) {
            if(d["FIPS"]==String(dataObject.stateshown)) {
                //let params = loadParams(location.search,location.hash);
                let lastParams = {};
                
                let industryData ={}
                subsetKeys = ['emp_reported','emp_est1','emp_est3', 'payann_reported','payann_est1','payann_est3', 'estab', 'NAICS2012_TTL','GEO_TTL','state','COUNTY','relevant_naics','estimate_est1','estimate_est3']
                subsetKeys_state = ['emp_agg', 'payann_agg', 'estab_agg', 'NAICS2012_TTL','GEO_TTL','state','COUNTY','relevant_naics']
                subsetKeys_state_api = ['emp_api', 'payann_api', 'estab_api', 'NAICS2012_TTL','GEO_TTL','state','COUNTY','relevant_naics']
                dataObject.subsetKeys=subsetKeys
                dataObject.subsetKeys_state=subsetKeys_state
                dataObject.subsetKeys_state_api=subsetKeys_state_api
                


                console.log("params.census_scope " + params.census_scope)
                industryData = {
                    'ActualRate': formatIndustryData(values[params.catsize/2],dataObject.subsetKeys),
                }
                dataObject.industryData = industryData;
                //console.log(dataObject.industryData)
                if (params.catsize==2){
                    industryDataState = {
                        'ActualRate': formatIndustryData(values[5],dataObject.subsetKeys_state)
                    }
                }else if (params.catsize==4){
                    industryDataState = {
                        'ActualRate': formatIndustryData(values[6],dataObject.subsetKeys_state)
                    }
                }else if (params.catsize==6){
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
                if (params.catsize==2){
                    industryDataStateApi = {
                        'ActualRate': formatIndustryData(values[5],dataObject.subsetKeys_state_api)
                    }
                }else if(params.catsize==4){
                    industryDataStateApi = {
                        'ActualRate': formatIndustryData(values[6],dataObject.subsetKeys_state_api)
                    }
                }else if(params.catsize==6){
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
                values[4].forEach(function(item){
                    if(item.abvr ==d['Name']){
                        counties.push(item.id)
                    }
                })
                dataObject.counties=counties;
                statelength=dataObject.counties.length
                [fips,dataObject.stateshown]=getStateFips(params)

                if (!params.state) {
                    params.state = hiddenhash.state; // Value from localhost.js include file.
                }
                if (!params.state) {
                    params.state = "GA"; // TEMP HACK
                    console.log("HACK params.state " + params.state);
                }

                renderIndustryChart(dataObject,values,params);
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
        let params = loadParams(location.search,location.hash);
        console.log("naics.js detects hash change hashChangeEvent");
        if(typeof value == 'undefined') {
            console.log("ALERT value object undefined in naics.js")
        } else {

            // Might need
            //renderIndustryChart(dataObject,values,params);
        }

    }, false);
    */

    if (document.getElementById("clearButton")) {
        document.getElementById("clearButton").addEventListener("click", function(){

            // Clears all counties, so reset title:
            let currentState = $("#state_select").find(":selected").text();
            if (currentState) {
                local_app.loctitle = currentState;
                local_app.showtitle = "Local Industries";
                $(".regiontitle").text(currentState + "'s Local Industries");
            } else {
                local_app.loctitle = "United States";
                local_app.showtitle = "Local Industries";
                $(".regiontitle").text("US Local Industries");
            }
            refreshNaicsWidget();
            return; 


            // Disabled

            clearHash("geo,regiontitle");

            console.log('clearButton clicked (but disabled)');

            // BUGBUG - This causes industry list removal and commodity list reduction.
            // Problem occurred before adding applyIO function and the newer script it contains.
            geoChanged(dataObject)


        }); 
    }
    //addGeoChangeDetectToDOM(1);
    function addGeoChangeDetectToDOM(count) { // Wait for county checkboxes to be added to DOM by map-filters.js
        if($(".geo").length) {
            //d3.selectAll(".geo").on("change",function() {
            $(".geo").change(function(e) {
                geoChanged(dataObject);
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

function renderIndustryChart(dataObject,values,params) {
    let stateAbbr 
    if (params.state) {
        stateAbbr = params.state;
        dataObject.stateshown=stateID[stateAbbr.toUpperCase()];
    } else {
        // TEMP BUGBUG TODO - until national NAICS generated
        stateAbbr = "GA";
        dataObject.stateshown="GA";
    }
    if(!params.catsort){
        params.catsort = "payann";
    }
    if(!params.catsize){
        params.catsize = 6;
    }
    if(!params.census_scope){
        params.census_scope='state'
    }

    // Reduce params to only those used
    // Phasing out use of go
    const filteredKeys = ['show','go','geo','regiontitle','catsort','catsize','catmethod','catpage','catcount','census_scope','naics','state','hs']; // hs not yet implemented for Harmonized System codes
    params = filteredKeys.reduce((obj, key) => ({ ...obj, [key]: params[key] }), {});

    console.log("params used by naics.js:")
    console.log(params)
    // Check which naics params have channged
    let whichHaveChanged = [];
    for (const key in params) {
      //if (watchingHash.includes(${key})) {
      if (params[key] != priorHash_naicspage[key]) {
        whichHaveChanged.push(key)
      }
    }
    console.log("whichHaveChanged: " + whichHaveChanged);
    if (whichHaveChanged.length == 0) {
        console.log("Cancel naics.js, no params have changed")
        return; // None have changed
    }

    subsetKeys = ['emp_reported','emp_est1','emp_est3', 'payann_reported','payann_est1','payann_est3', 'estab', 'NAICS2012_TTL','GEO_TTL','state','COUNTY','relevant_naics','estimate_est1','estimate_est3']
    subsetKeys_state = ['emp_agg', 'payann_agg', 'estab_agg', 'NAICS2012_TTL','GEO_TTL','state','COUNTY','relevant_naics']
    subsetKeys_state_api = ['emp_api', 'payann_api', 'estab_api', 'NAICS2012_TTL','GEO_TTL','state','COUNTY','relevant_naics']
    dataObject.subsetKeys=subsetKeys
    dataObject.subsetKeys_state=subsetKeys_state
    dataObject.subsetKeys_state_api=subsetKeys_state_api
    industryData = {
        'ActualRate': formatIndustryData(values[params.catsize/2],dataObject.subsetKeys),
    }
    dataObject.industryData = industryData;
    dataObject.industryData=industryData;
    if (params.catsize==2){
        industryDataState = {
            'ActualRate': formatIndustryData(values[5],dataObject.subsetKeys_state)
        }
    }else if(params.catsize==4){
        industryDataState = {
            'ActualRate': formatIndustryData(values[6],dataObject.subsetKeys_state)
        }
    }else if(params.catsize==6){
        industryDataState = {
            'ActualRate': formatIndustryData(values[7],dataObject.subsetKeys_state)
        }
    }
        
    dataObject.industryDataState=industryDataState;
    console.log(dataObject.industryDataState)
    if (params.catsize==2){
        industryDataStateApi = {
            'ActualRate': formatIndustryData(values[5],dataObject.subsetKeys_state_api)
        }
    }else if(params.catsize==4){
        industryDataStateApi = {
            'ActualRate': formatIndustryData(values[6],dataObject.subsetKeys_state_api)
        }
    }else if(params.catsize==6){
        industryDataStateApi = {
            'ActualRate': formatIndustryData(values[7],dataObject.subsetKeys_state_api)
        }
    }
        
    dataObject.industryDataStateApi=industryDataStateApi;
    [fips,dataObject.stateshown]=getStateFips(params)
    console.log("renderIndustryChart calls topRatesInFips with fips: " + fips);
    topRatesInFips(dataObject, dataObject.industryNames, fips, params);
}

//function for when the geo hash changes
function geoChanged(dataObject,params){

    // REMOVE

    return;



    if (!params) {
        params = loadParams(location.search,location.hash); // Pull from updated hash
    }
    [fips,dataObject.stateshown]=getStateFips(params)
    if (fips == dataObject.stateshown) {
        $(".county-view").hide();
        $(".state-view").show();
        //$(".industry_filter_settings").hide(); // temp
    } else {
        $(".state-view").hide();
        $(".county-view").show();
        //$(".industry_filter_settings").show(); // temp
    }
    

    if(dataObject.stateshown!=dataObject.laststateshown){
        //d3.csv(local_app.community_data_root() + "us/id_lists/state_fips.csv").then( function(consdata) {
        //    var filteredData = consdata.filter(function(d) {
        //        if(d["FIPS"]==String(dataObject.stateshown)) {
            console.log("geoChanged " + stateAbbr + " " + dataObject.stateshown + " Promises");

            var promises = [
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
            d3.tsv(local_app.community_data_root() + "us/state/" + stateAbbr + "/" + stateAbbr + "counties.csv")
            ]
            Promise.all(promises).then(promisesReady);
        //        }
        //    })
        //})
    }
    console.log("geoChanged calls topRatesInFips with fips: " + fips);
    topRatesInFips(dataObject, dataObject.industryNames, fips, params)
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


function keyFound(this_key, cat_filter, params) {
    if (!params.show) {
        params.show = params.go;
    }

    if (this_key <= 1) {
        return false;
    } else if (cat_filter == undefined) { // No filter
        return true;
    } else if (cat_filter.length == 0) { // No filter
        return true;
    } else if (params.show == "bioeconomy" && (this_key.startsWith("11") || this_key.startsWith("311"))) { // Quick hack, always include Agriculture
        return true;
    //} else if (params.show == "farmfresh" && (this_key.startsWith("11") || this_key.startsWith("311"))) { // Quick hack, always include Agriculture
    //    return true;
    } else if (params.show == "manufacturing" && (this_key.startsWith("31") || this_key.startsWith("32") || this_key.startsWith("33") )) { // All manufacturing
        return true;
    } else if ( (params.show == "bioeconomy" || params.show=="parts") && params.catsize == 2) { // Our 4 digit array matches key
        cat_filt=[]
        for(i=0;i<cat_filter.length;i++){
            cat_filt.push(cat_filter[i].slice(0,2))
        }
        if(cat_filt.includes(this_key.slice(0,2))){
            return true;
        }
    } else if ( (params.show == "bioeconomy" || params.show=="parts") && params.catsize == 4 ) { // Our 4 digit array matches key
        cat_filt=[]
        for(i=0;i<cat_filter.length;i++){
            cat_filt.push(cat_filter[i].slice(0,4))
        }
        if(cat_filt.includes(this_key.slice(0,4))){
            return true;
        }
    } else if ( (params.show == "bioeconomy" || params.show=="parts" || cat_filter.length > 0) && params.catsize == 6 && cat_filter.includes(this_key.slice(0,6))) { // Our 6 digit array matches key
        return true;
    } else {
        console.log("NO CAT MATCH FOUND FOR: " + params.show);
        return false;
    }
}

// Top rows for a specific set of fips (states and counties)
function topRatesInFips(dataSet, dataNames, fips, params) {
    let catcount = params.catcount || 40;
    let gotext = "";
    let hash = getHash();
    if (!params.show) {
        params.show = params.go;
    }
    if (params.show) {
        gotext = params.show.replace(/_/g," ").toTitleCase();
        if (gotext == "Smart") {
            gotext = "EV Ecosystem";
        } else if (gotext == "Ppe") {
            gotext = "Healthcare";
        }
    }

    console.log("topRatesInFips")
    //alert(String(dataObject.stateshown)) // State's fips number

    // Redirect occurs somewhere below....

    d3.csv(local_app.community_data_root() + "us/id_lists/state_fips.csv").then( function(consdata) {
        console.log("naics.js reports state_fips.csv loaded");
        var filteredData = consdata.filter(function(d) { // Loop through
            if(d["FIPS"]==String(dataObject.stateshown)) {
                if(params.catsort=='estab'){
                    which=params.catsort;
                }else{
                    if(params.catmethod==0){
                        which=params.catsort+'_reported'
                    }else if(params.catmethod==2){
                        which=params.catsort+'_est3'
                        estimed='estimate_est3'
                    }else{ // params.catmethod==1 or null
                        which= params.catsort+'_est1'
                        estimed='estimate_est1'
                    }
                }


                if(params['census_scope']=="state"){
                    which_state_api=params.catsort+'_api'
                }else{
                    which_state=params.catsort+'_agg'
                    
                }

                //alert("naics.js hiddenhash.naics: " + hiddenhash.naics);
                //var cat_filter = getNaics_setHiddenHash(params.show); // Resides in map-filters.js
                var cat_filter = hiddenhash.naics;

                //alert(cat_filter)
                var rates_dict = {};
                var rates_list = [];
                var forlist={}
                //selectedFIPS = fips;
                if (Array.isArray(fips)) {
                    for (var i = 0; i<fips.length; i++){
                        Object.keys(dataSet.industryData.ActualRate).forEach( this_key=>{
                            // this_key = parseInt(d.split("$")[1])
                            if (keyFound(this_key, cat_filter,params)){
                                this_rate = dataSet.industryData.ActualRate[this_key]
                                if (this_rate.hasOwnProperty(fips[i])){ 
                                    if(rates_dict[this_key]){
                                        forlist[this_key]=rates_dict[this_key]+parseFloat(this_rate[fips[i]][which])
                                        rates_dict[this_key] = rates_dict[this_key]+parseFloat(this_rate[fips[i]][which])      
                                    }else{
                                        rates_dict[this_key] = parseFloat(this_rate[fips[i]][which])
                                        forlist[this_key]=parseFloat(this_rate[fips[i]][which])
                                    }
                                    
                                } else {
                                    if(rates_dict[this_key]){
                                        rates_dict[this_key] = rates_dict[this_key]+0.0
                                        forlist[this_key]=rates_dict[this_key]+0.0
                                    }else{
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
                    
                        if(params['census_scope']=="state"){
                            Object.keys(dataSet.industryDataStateApi.ActualRate).forEach( this_key=>{
                                if (keyFound(this_key, cat_filter,params)){
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
                            if (keyFound(this_key, cat_filter,params)){
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

                }else{
                    Object.keys(dataSet.industryData.ActualRate).forEach( this_key=>{
                        if (keyFound(this_key, cat_filter,params)){
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

                if(Array.isArray(fips)){

                    for (var i=0; i<rates_list.length; i++) {
                        id = parseInt(getKeyByValue(rates_dict, rates_list[i]))
                        delete rates_dict[id]
                        rateInFips=0
                        rateArray={}
                        estim={}
                        naicscode=0
                        for (var j = 0; j<fips.length; j++){ 
                            if(dataSet.industryData.ActualRate[id]){ 
                                if (dataSet.industryData.ActualRate[id].hasOwnProperty(fips[j])) {
                                    rateInFips = rateInFips+parseFloat(dataSet.industryData.ActualRate[id][fips[j]][which])
                                    rateArray[j]=parseFloat(dataSet.industryData.ActualRate[id][fips[j]][which]);
                                    naicscode = dataSet.industryData.ActualRate[id][fips[j]]['relevant_naics']
                                    if(params.catmethod!=0 & params.catsort!='estab'){
                                        estim[j]=parseFloat(dataSet.industryData.ActualRate[id][fips[j]][estimed])
                                    }else{
                                        estim[j]=parseFloat(0)
                                    }
                                } else {
                                        rateInFips = rateInFips+0
                                        estim[j]=parseFloat(0)

                                }
                            }
                        }
                        if (keyFound(naicscode, cat_filter,params)){
                            if(dataNames[id]){
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
                }else{
                    // US Reaches here
                    //alert("fips " + fips + " dataObject.stateshown " + dataObject.stateshown);
                    if(fips==dataObject.stateshown){
                    
                        if(params['census_scope']=="state"){
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
                                
                                if (keyFound(naicscode, cat_filter,params)){
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
                                alert("Test2 " + dataSet.industryData.ActualRate[id]);
                                delete rates_dict[id]

                                if (dataSet.industryDataState.ActualRate[id] && dataSet.industryDataState.ActualRate[id].hasOwnProperty(fips)) {
                                    rateInFips = dataSet.industryDataState.ActualRate[id][fips][which_state]
                                    naicscode = dataSet.industryDataState.ActualRate[id][fips]['relevant_naics']
                                } else {
                                    rateInFips = 0
                                    naicscode = 1
                                }
                                
                                if (keyFound(naicscode, cat_filter,params)){
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
                    }else{
                        for (var i=0; i<rates_list.length; i++) {
                            id = parseInt(getKeyByValue(rates_dict, rates_list[i]))
                            delete rates_dict[id]

                            if (dataSet.industryData.ActualRate[id].hasOwnProperty(fips)) {
                                rateInFips = dataSet.industryData.ActualRate[id][fips][which]
                                naicscode = dataSet.industryData.ActualRate[id][fips]['relevant_naics']
                                if(params.catmethod!=0 & params.catsort != 'estab'){
                                    estim = dataSet.industryData.ActualRate[id][fips][estimed]
                                }else{
                                    estim=0
                                }
                                //console.log(estim)
                            } else {
                                rateInFips = 0
                                naicscode = 1
                                estim = 0
                            }
                            
                            if (keyFound(naicscode, cat_filter,params)){
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

                //console.log("naics.js top_data_list: " + top_data_list);

                let icon = "";
                let rightCol = "";
                let midCol="";
                let text = "";
                let dollar = ""; // optionally: $
                let totalLabel = "Total Payroll";
                let stateAbbr;
                
                if (hash.state) {
                    stateAbbr = hash.state.toUpperCase();
                } else {
                    stateAbbr = "GA"; // Temp HACK to show US
                }
                if(hash.catsort=="payann"){
                    totalLabel = "Total Payroll ($)";
                }
                let thestate = $("#state_select").find(":selected").text();

                if (stateAbbr) {
                //alert("stateAbbr2: " + stateAbbr);
                //BUGBUG - Contains all the counties in the US
                d3.csv(local_app.community_data_root() + "us/id_lists/county_id_list.csv").then( function(consdata) {
                    d3.csv(local_app.community_data_root() + "us/state/" + stateAbbr + "/" + stateAbbr + "counties.csv").then( function(latdata) {
                         // TABLE HEADER ROW
                         //alert("statelength " + statelength + " fips.length: " + fips.length);
                         // && statelength != fips.length
                        if(Array.isArray(fips)){

                            for(var i=0; i < fips.length; i++){

                                var filteredData = consdata.filter(function(d) {

                                    if(d["id"]==fips[i]){
                                        if(i == fips.length-1){
                                           text += "<div class='cell-right'>" + d["county"].split("County")[0] + " County</div>";
                                        }else{
                                            text += "<div class='cell-right'>" + d["county"].split(" County")[0] + " County</div>";
                                        }
                                    }
                                })
                            }
                        }
                        text = "<div class='row'><div class='cell'><!-- col 1 -->NAICS</div><div class='cell' style='min-width:300px'><!-- col 2 -->Industry</div>" + text + "<div class='cell-right'>" + totalLabel + "</div>";
                        if (fips == dataObject.stateshown && params.catsort == "payann") {
                            text += "<div class='cell' style='text-align:right'>Employees</div><div class='cell' style='text-align:right'>Firms</div>";
                        }
                        text += "</div>"; // #9933aa
                        
                        // INDUSTRY ROWS
                        y=Math.min(catcount, top_data_ids.length);
                        // y = top_data_ids.length; // Show over 800 rows
                        let naicshash = "";
                        $("#econ_list").html("<div><br>No results found.</div><br>");
                        console.log("Industry matches found (max of " + catcount + "): " + y);
                        for (i = 0; i < y; i++) { // Naics
                            rightCol="";
                            midCol="";
                            //console.log("NAICS ROW " + i);
                            // Update these:
                                let latitude = "";
                                let longitude = "";

                                // Populate maplink with Google Map URL for each industry

                                //d3.csv(local_app.community_data_root() + "us/id_lists/county_id_list.csv").then( function(consdata) {
                                    if(Array.isArray(fips) && statelength != fips.length) {
                                        mapLink=[]
                                        for(var j=0; j<fips.length; j++){
                                            var filteredData = consdata.filter(function(d) {
                                                var filteredData = latdata.filter(function(e) {
                                                    if(d["id"]==fips[j]){
                                                        if(d["county"]==e["NAMELSAD"]){
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
                                                if(d["id"]==fips ){      
                                                    if(d["county"]==e["NAMELSAD"]){
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


                            if(params.catsort=="payann"){
                                //text += top_data_list[i]['NAICScode'] + ": <b>" +top_data_list[i]['data_id']+"</b>, "+String(whichVal.node().options[whichVal.node().selectedIndex].text).slice(3, )+": $"+String((top_data_list[i][whichVal.node().value]/1000).toFixed(2))+" million <br>";
                                
                                // Multiple counties
                                if(Array.isArray(fips)) {

                                    //if(String((top_data_list[i][whichVal.node().value]/1000).toFixed(2)).length<7){
                                    if (1==1) { // Always use million
                                        
                                        // The county cell values
                                        for (var j = 0; j < fips.length; j++) { // For each county selected
                                            if(top_data_list[i]['ratearray'][j]){ // An array of payrole for only the selected conties
                                                if(top_data_list[i]['Estimate'][j]){    
                                                    if(top_data_list[i]['Estimate'][j]>0){ // Purple color for estimate
                                                        
                                                        midCol += "<div class='cell-right'>" + dollar +"<a href='" + mapLink[j] + "' target='_blank'>"+'<span style="color: #9933aa" >'+ String((top_data_list[i]['ratearray'][j]/1000).toFixed(2)) + " million</span></a></div>";
                                                    }else{
                                                        midCol += "<div class='cell-right'>" + dollar +"<a href='" + mapLink[j] + "' target='_blank'>"+ String((top_data_list[i]['ratearray'][j]/1000).toFixed(2)) + " million</a></div>";
                                                    }
                                                }else{
                                                    midCol += "<div class='cell-right'>" + dollar +"<a href='" + mapLink[j] + "' target='_blank'>"+ String((top_data_list[i]['ratearray'][j]/1000).toFixed(2)) + " million</a></div>";
                                                }
                                            } else {
                                                midCol += "<div class='cell-right'>" + "<a href='" + mapLink[j] + "' target='_blank'>" + "0</a></div>";
                                            }    
                                        }
                                        // The total
                                        rightCol += "<div class='cell-right'>" + dollar + String((top_data_list[i][which]/1000).toFixed(2)) + " million</div>";
                                    }else{
                                        for (var j = 0; j<fips.length; j++){
                                            if(top_data_list[i]['ratearray'][j]){
                                                
                                                    midCol += "<div class='cell-right'>" + dollar + String((top_data_list[i]['ratearray'][j]/1000000).toFixed(2)) + " million</div>";
                                                
                                            }else{
                                                    midCol +="<div class='cell-right'>" + "<a href='" + mapLink[j] + "' target='_blank'>" + "0</a></div>";
                                            }   
                                        }
                                        // <span style="color: #9933aa">
                                        rightCol += "<div class='cell-right'>" + dollar + String((top_data_list[i][which]/1000000).toFixed(2)) + " billion</div>";
                                    }
                                    
                                } else { // One entity (state or county)
                                    //if(String((top_data_list[i][whichVal.node().value]/1000).toFixed(2)).length<7){

                                    if(top_data_list[i]['Estimate']){    
                                        if(top_data_list[i]['Estimate'] > 0){
                                            rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+'<span style="color: #9933aa" >'+String((top_data_list[i][which]/1000).toFixed(2))+" million</span></a></div>";
                                        }else{
                                            rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((top_data_list[i][which]/1000).toFixed(2))+" million</a></div>";  
                                        }
                                    }else{
                                        if(fips==dataObject.stateshown){
                                            if(params['census_scope']=="state"){
                                                rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((top_data_list[i][which_state_api]/1000).toFixed(2))+" million</a></div>";  
                                            }else{
                                                rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((top_data_list[i][which_state]/1000).toFixed(2))+" million</a></div>";  
                                            }
                                        }else{
                                            rightCol = "<div class='cell-right'>" + dollar + "<a href='" + mapLink + "' target='_blank'>"+String((top_data_list[i][which]/1000).toFixed(2))+" million</a></div>";  
                                        
                                        }

                                        // ADDITIONAL COLUMNS

                                        // employee count
                                        if(fips==dataObject.stateshown){
                                            if(params['census_scope']=="state"){
                                                rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i]["emp_api"])) + "</a></div>";
                                            }else{
                                                //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i][which_state])) + "</a></div>";
                                            }
                                        }else{
                                            //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i][which])) + "</a></div>";
                                        }

                                        // establishments
                                        if(fips==dataObject.stateshown){
                                            if(params['census_scope']=="state"){
                                                rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i]["estab_api"])) + "</a></div>";
                                            }else{
                                                //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i][which_state])) + "</a></div>";
                                            }
                                        }else{
                                            //rightCol += "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i][which])) + "</a></div>";
                                        }
                                    }
                                }
                     
                            } else {

                                //rightCol = String(whichVal.node().options[whichVal.node().selectedIndex].text).slice(3, )+": "+Math.round(top_data_list[i][whichVal.node().value]);
                                if(Array.isArray(fips)){
                                    rightCol = ""
                                    midCol = ""
                                    for (var j = 0; j<fips.length; j++){
                                        if(top_data_list[i]['ratearray'][j]){

                                            if(params.catsort=="estab"){
                                                midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + String(Math.round(top_data_list[i]['ratearray'][j])) + "</a></div>";
                                                
                                            }else{
                                                if(top_data_list[i]['Estimate'][j]){    
                                                        if(top_data_list[i]['Estimate'][j]>0){
                                                            midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + '<span style="color: #9933aa" >'+String(Math.round(top_data_list[i]['ratearray'][j])) + "</span></a></div>";
                                                
                                                        }else{
                                                            midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + String(Math.round(top_data_list[i]['ratearray'][j])) + "</a></div>";
                                                
                                                        }
                                                    }else{
                                                        midCol += "<div class='cell-right'><a href='" + mapLink[j] + "' target='_blank'>" + String(Math.round(top_data_list[i]['ratearray'][j])) + "</a></div>";
                                                
                                                    }
                                            }

                                                
                                        } else {
                                                midCol += "<div class='cell-right'>" + "<a href='" + mapLink[j] + "' target='_blank'>" + "0</a></div>";
                                        } 
                                    }
                                    rightCol += "<div class='cell-right'>" + String(Math.round(top_data_list[i][which])) + "</div>";


                                    //rightCol = String(Math.round(top_data_list[i][whichVal.node().value]));
                                }else{
                                    if(params.catsort=="estab"){
                                        if(fips==dataObject.stateshown){
                                            if(params['census_scope']=="state"){
                                                rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i][which_state_api])) + "</a></div>";
                                            }else{
                                                rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i][which_state])) + "</a></div>";
                                            }
                                        }else{
                                            rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i][which])) + "</a></div>";
                                        }
                                    }else{

                                        if(top_data_list[i]['Estimate']){    
                                            if(top_data_list[i]['Estimate']>0){
                                                
                                                rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'><span style='color:#9933aa'>" + String(Math.round(top_data_list[i][which])) + "</span></a></div>";

                                            }else{
                                                rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i][which])) + "</a></div>";
                                            }
                                        }else{
                                            if(fips==dataObject.stateshown){
                                                if(params['census_scope']=="state"){
                                                    rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i][which_state_api])) + "</a></div>";
                                                }else{
                                                    rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i][which_state])) + "</a></div>";
                                                }
                                            }else{
                                                rightCol = "<div class='cell-right'><a href='" + mapLink + "' target='_blank'>" + String(Math.round(top_data_list[i][which])) + "</a></div>";
                                            }
                                        }
                                    }
                                }
                                
                            }


                            //rightCol += "<div class='cell mock-up' style='display:none'><img src='http://localhost:8887/localsite/info/img/plus-minus.gif' class='plus-minus'></div>";
                            ////text += top_data_list[i]['NAICScode'] + ": <b>" +top_data_list[i]['data_id']+"</b>, "+String(whichVal.node().options[whichVal.node().selectedIndex].text).slice(3, )+": "+Math.round(top_data_list[i][whichVal.node().value])+"<br>";
                            
                            text += "<div class='row'><div class='cell'><a href='#naics=" + top_data_list[i]['NAICScode'] + "' onClick='goHash({\"naics\":" + top_data_list[i]['NAICScode'] + "}); return false;' style='color:#aaa;white-space:nowrap'>" + icon + top_data_list[i]['NAICScode'] + "</a></div><div class='cell'>" + top_data_list[i]['data_id'].replace("Other ","") +"</div>"
                            if(Array.isArray(fips)) {
                                text +=  midCol; // Columns for counties
                            }
                            text += rightCol + "</div>";
                            
                            // use GoHash()
                            

                            if(i<=20){
                                if(i==0){
                                    naicshash = naicshash+top_data_list[i]['NAICScode'];
                                }else{
                                    naicshash = naicshash+","+top_data_list[i]['NAICScode']
                                }
                                
                            }
                        
                        } // End naics rows

                        let lowerMessage = "";
                        // If none estimated
                        if (!param.naics) {
                            lowerMessage += "Click NAICS number above to view industry's supply chain. ";
                        }
                        console.log("NAICS count: top " + y + " displayed out of " + top_data_ids.length);
                        if (y > 0) {
                            lowerMessage += "Purple&nbsp;text&nbsp;indicates approximated values. List does not yet include data for industries without state-level payroll reporting by BLS or BEA. - <a href='/localsite/info/data/'>More&nbsp;Details</a>";
                            $("#econ_list").html("<div id='sector_list'>" + text + "</div><br><p style='font-size:13px'>" + lowerMessage + "</p>");
                        }
                        console.log('send naics to #industry-list data-naics attribute: ' + naicshash)

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
                            alert("call applyIO B")
                            applyIO(naicshash);
                        //}
                        
                        // To Remove - Moveed into applyIO below instead. BugBug
                        //updateMosic(naicshash);

                        //updateHash({"naics":naicshash});
                        //params = loadParams(location.search,location.hash);
                        //midFunc(params.x,params.y,params.z,params);

                        //alert("#industries show");
                        //$("#industries").show();

                        })
                })
                d3.csv(local_app.community_data_root() + "us/id_lists/county_id_list.csv").then( function(consdata) {
                    //document.getElementById("industryheader").text = ""; // Clear initial.
                    $(".location_titles").text(""); //Clear

                    /*
                    if (params.show == "bioeconomy") {
                        $(".regiontitle").text("Bioeconomy and Energy");
                    } else if (params.show == "parts") {
                        $(".regiontitle").text("Parts Manufacturing");
                    } else if (params.show == "manufacturing") {
                        $(".regiontitle").text("Manufacturing");
                    } else if (params.show == "ppe") {
                        $(".regiontitle").text("Healthcare");
                    } else if (params.show == "vehicles") {
                        $(".regiontitle").text("Vehicle Manufacturing");
                    } else if (gotext) {
                        //$(".regiontitle").text(gotext);
                    }
                    */
                    //alert("statelength " + statelength + " fips.length " + fips.length)
                    //if(Array.isArray(fips) && statelength != fips.length) {
                    if(Array.isArray(fips)) {
                        if (!params.regiontitle) {
                            //if (params.show && fips.length == 1) {
                            //    // Remove " County" from this .replace(" County","")
                            //    $(".regiontitle").text(d["county"] + " - " + gotext);
                            //} else 
                            if (params.show) {
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
                        else if (params.regiontitle) {
                            local_app.loctitle = params.regiontitle.replace(/\+/g," ");
                            if (params.show) {
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
                                if(d["id"]==fips[i]){
                                    
                                    /*
                                    if(i==fips.length-1){
                                        document.getElementById("industryheader").innerHTML=document.getElementById("industryheader").innerHTML+'<font size="3">'+d["county"]+'</font>'
                                    }else if(i==0){
                                        document.getElementById("industryheader").innerHTML=document.getElementById("industryheader").innerHTML+'<font size="3">'+d["county"]+', '+'</font>'
                                    }else{
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
                            if (params.show) {
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
                        if (params.show == "bioeconomy") {
                            $(".regiontitle").text("Bioeconomy and Energy");
                        } else if (params.show == "parts") {
                            //$(".regiontitle").text("Parts Manufacturing");
                        } else if (params.show == "manufacturing") {
                            $(".regiontitle").text("Manufacturing");
                        } else if (params.show == "farmfresh") {
                            $(".regiontitle").text("Farm Fresh");
                        } else if (params.show == "ppe") {
                            $(".regiontitle").text("Healthcare Industries");
                        } else if (params.show == "smart") {
                            $(".regiontitle").text("Mobility Tech"); // data-driven list
                        } else if (params.show == "ev") {
                            $(".regiontitle").text("EV Related Manufacturing"); // Excludes parts and data-driven list
                        } else if (params.show == "vehicles") {
                            $(".regiontitle").text("Vehicles and Vehicle Parts");
                        } else if (gotext) {
                            // Would overwrite longer title from map.js loadFromSheet which includes non-datasets
                            //$(".regiontitle").text(gotext);
                        } else {
                            // Temp, reactivate after iogrid stops deleteing hash values.
                            $(".regiontitle").text("Industries");
                            //$(".regiontitle").text(String(d['Name'])+"'s Local Industries");
                        }
                        //alert("locationTabText2")
                        //$(".locationTabText").text("State"); // Temp
                        */
                    } else {
                        var filteredData = consdata.filter(function(d) {
                            if (params.show) {
                                // Remove " County" from this .replace(" County","")
                                local_app.loctitle = d["county"];
                                local_app.showtitle = gotext;
                                $(".regiontitle").text(d["county"] + " - " + gotext);
                            } else if(d["id"]==fips ) {
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


function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value)
}


if(typeof hiddenhash == 'undefined') {
    var hiddenhash = {};
}
function applyIO(naics) {
    console.log("applyIO with naics: " + naics);
    //alert("applyIO with naics: " + naics);
    
    if (!hiddenhash.naics) {
        //hiddenhash.naics = undefined;
    }
    //alert("hiddenhash.naics: " + hiddenhash.naics);
    /*
    var modelID = 'USEEIO';

    var model = useeio.model({
        endpoint: '/io/build/api',
        model: modelID,
        asJsonFiles: true,
    });

    var inputs = useeio.inputList({
        model: model,
        selector: '#inputs',
    });

    var sectorList = useeio.sectorList({
        model: model,
        selector: '#industry-list',
    });

    var outputs = useeio.outputList({
        model: model,
        selector: '#outputs',
    })
    */


    /*
    var naics = '11,45,62,211,314,331,425,452,488,521,561,721,925,1122,'
        + '1151,2213,2389,3121,3161,3251,3272,3322,3333,3346,'
        + '3366,4234,4245,4422,4482,4541,4851,4872,4922,5174,'
        + '5239,5323,5418,5619,6117,6223,7112,7213,8123,9231,'
        + '11115,11192,11233,11311,21221,22121,23721,23819,'
        + '23891,31142,31193,31322,31519,32121,32229,32519,'
        + '32591,32621,32741,33149,33251,33324,33422,33531,'
        + '33633,33711,33995,42333,42352,42383,42412,42444,'
        + '42469,42499,44221,44512,44711,44832,45321,45439,'
        + '48423,48691,48833,49312,51212,51521,52111,52239,'
        + '52411,52599,53212,54111,54137,54171,54191,56133,'
        + '56161,56211,61143,62132,62199,62412,71119,71311,'
        + '72111,81111,81219,81311,92111,92215,92512,111120,'
        + '111320,111421,112112,112420,113310,115116,212222,'
        + '212322,213114,221121,236210,238130,238320,311212,'
        + '311352,311520,311824,312111,313230,315190,321113,'
        + '321920,322219,324121,325199,325413,325991,326150,'
        + '327120,327410,331222,331512,332215,332431,332813,'
        + '332999,333249,333517,333922,333999,334416,334516,'
        + '335221,335921,336212,336390,336991,337212,339910,'
        + '339999,423390,423610,423840,424130,424450,424710,'
        + '425110,442210,444220,446110,448140,451211,453910,'
        + '454390,483113,485111,485999,488190,488999,511130,'
        + '512199,517110,521110,522294,523910,524130,525990,'
        + '532111,532411,541213,541380,541612,541820,541930,'
        + '561320,561492,561622,562112,611110,611610,621310,'
        + '621493,622310,624210,711211,712190,713990,722330,'
        + '811121,811411,812210,812990,813920,921190,923130,'
        + '926150';
    */
    //naics = '221100'; // TEMP
    //naics = '';

    // Add bioeconomy
    //naics = naics + "311615,311812,321113,221112,113310,322110,311821,311612,325211,311813,311911,311919,311830,311119,322121,311824,311941,325991,311710,311930";

    var naicsCodes;
    if (naics) {
        naicsCodes = naics.split(',');
    }
    //var handled = {};

    alert("hiddenhash.indicators " + hiddenhash.indicators);
    alert("param.indicators " + param.indicators);
    alert("params.indicators " + params.indicators); // How/why is this used?

    //var indicators = "VADD";
    var indicators = "";
    let hash = getHash();
    if (hash.indicators) {
        indicators = hash.indicators;
        hiddenhash.indicators = hash.indicators;
    }

    alert("indicators " + indicators);

    alert("applyIO with sectors: " + param.sectors);
    var indicatorCodes = indicators.split(',');

    // Probably not working, using config.update below instead.

    //hiddenhash.naics = naicsCodes;
    //hiddenhash.indicators = indicatorCodes;
    //hiddenhash.count = 10;

    //console.log("hiddenhash.naics set in naics.js " + hiddenhash.naics);

    /*
    hiddenhash = {
        indicators: "VADD",
        naics: naics,
        count: 20
    };
    */

    // Either array or comma separated list works
    //var beaCodes = useeio.toBEA(['11', '22']);
    //var beaCodes = useeio.toBEA('11,22');
    
    //var beaCodes = useeio.toBEA(naics); // Works
    //console.log("Hack: Get BEA directly from naics: " + beaCodes);

    //console.log("BUG - called multiple times when embedded iogrid chart checkbox checked.")
    /*
    var beaCodes = naicsCodes.map(useeio.toBEA)
        .filter(function (code) {
            // remove unmapped codes and duplicates
            if (!code || handled[code])
                return false;
            handled[code] = true;
            return true;
        });
    */

     

    var config = useeio.urlConfig();
    var modelID = config.get().model || 'USEEIOv2.0'; 
    // USEEIOv1.2 shows incorrect bars. $300.043 input per $1 for agriculture.
    // USEEIO showed fish for colleges

    //config.update({naics: ['11', '22']}) // filters the sectors
    //config.update({sectors: useeio.toBEA('336411','481000')})  // selects all these sectors

    //config.update({sectors: ['336411','481000']});



    // 
    //
    //if (!hash.go && !hash.geo && !hash.catsort && !hash.catsize) {

        

        //config.update({naics: naicsCodes, count: 20}); // filters the BEA sectors



        //  BUGBUG - THIS NEEDS TO STOP POPULATING NAICS IN THE HASH. FIND OTHER WAY.
        // To Reactivate BugBug
        //config.update({naics: naicsCodes, count: 20, indicators: indicatorCodes}); // filters the BEA sectors



        //config.update(hiddenhash);

        //document.dispatchEvent(new CustomEvent('hashChangeEvent'));

    //}

    //config.update({sectors: useeio.toBEA('336411','481000')})  // selects all these sectors

    //alert(config.sectors)

    var model = useeio.model({
        endpoint: '/io/build/api',
        model: modelID,
        asJsonFiles: true,
    });
    var ioGrid = useeio.ioGrid({
        model: model,
        selector: '#iogrid',
    });
    config.withDefaults({
        count: 20,
    })
    config.join(ioGrid);


    // For older 3 column IO layout
    // Also remove display:none from #ioPanelOld
    /*
    var config = {
        count: 20,
        naics: naicsCodes,
        sectors: useeio.toBEA(naicsCodes)
    };
    inputs.update(config);
    outputs.update(config);
    sectorList.update(config);
    sectorList.onChanged(function (change) {
        for (var prop in change) {
            if (change.hasOwnProperty(prop)) {
                config[prop] = change[prop];
            }
        }
        inputs.update(config);
        outputs.update(config);
        sectorList.update(config);
    });
    */

    // TEMP - Remove NAICS from has manually
    //updateHash({'naics':''});

    var sectorList = useeio.sectorList({
        model: model,
        selector: '.sector-list',
    });
    config.withDefaults({
        view: ["mosaic"],
        count: 50,
    })
    config.join(sectorList);

    // End Copied from sector_list.html, and changed to use withDefaults

}