// DISPLAYS TWO LEAFLET MAPS
// 1. ITEM LOCATIONS ON LARGE MAP
// 2. LOCATION DETAILS ON SIDE MAP
// Top geomap is displayed by map-filters.js

// For each map, RenderMap calls addIcons

// To Do: Rename, use or remove dataParameters

// INIT
var dataParameters = []; // Probably can be removed, along with instances below.
var sideTopOffsetEnabled = true;
var sideTopOffsetEnabledBig = false;

if(typeof styleObject=='undefined'){ var styleObject={}; } // https://docs.mapbox.com/mapbox-gl-js/style-spec/root/
console.log("map.js styleObject.layers");
styleObject.layers = [];

if(typeof layerControls=='undefined'){ var layerControls = {}; }// Object containing one control for each map on page.

if(typeof hash === 'undefined') {
  // Need to figure out where already declared.
  // Avoid putting var in front, else "Identifier 'hash' has already been declared" error occurs here: http://localhost:8887/localsite/map/
  //hash = {};
}
if(typeof dataObject == 'undefined') {
  var dataObject = {};
}
if(typeof localObject == 'undefined') {
    var localObject = {};
}
if(typeof localObject.layerCategories == 'undefined') {
    localObject.layerCategories = {}; // Categories from Google Sheet tab.
}

// Set your own Mapbox access token below.
// Restrict which domains your token is loaded through.
// https://blog.mapbox.com/url-restrictions-for-access-tokens-5f7f7eb90092
var mbAttr = '<a href="https://www.mapbox.com/">Mapbox</a>', mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZWUyZGV2IiwiYSI6ImNqaWdsMXJvdTE4azIzcXFscTB1Nmcwcm4ifQ.hECfwyQtM7RtkBtydKpc5g';

//////////////////////////////////////////////////////////////////
// Loads from JSON API, Google Sheet or CSV file
//  longitude, latitude for position (lon, lat also supported)
//  one numerical or categorical attribute to be visualized
//  + (optional) attributes like  "address" to be shown in tooltip and list.
// 
// 1. set class of aside element above to match the name of the data
// 2. insert data into aside element
// 3. specify the following dp (data parameters) 
// 4. initialize map center with [lat, lon]
// 5. Load Layers Asynchronously
//
// options for scales:
// "scaleThreshold", "scaleOrdinal", "scaleOrdinal" or "scaleQuantile"
//
//////////////////////////////////////////////////////////////////

/////////// LOAD FROM HTML ///////////

// INTERMODAL PORTS - was here

console.log("localsite_map defined here");
var localsite_map = true; // Used by man-embed.js and localsite.js to detect map.js load.

/*
var localsite_map = localsite_map || (function(){
    var _args = {}; // private

    return {
        init : function(Args) {
            _args = Args;
            // some other initialising
        },
    };
}());
*/

// FOR MAP LAYERS - A group for removing prior layers.
// https://stackoverflow.com/questions/38845292/filter-leaflet-geojson-object-based-on-checkbox-status/38845970#38845970

/* Allows map to remove selected shapes when backing up. */
document.addEventListener('hashChangeEvent', function (elem) {
  console.log("map.js detects URL hashChangeEvent");
  hashChangedMap();
}, false);
document.addEventListener('hiddenhashChangeEvent', function (elem) {
  console.log("Doing nothing: map.js detects hiddenhashChangeEvent, calls hashChangedMap()");
  // Instead, we'll create a hash change event without changing the hash.
  
  // But needed for io center column red bars (not)
  //hashChangedMap();
}, false);

// MAP 1
// var map1 = {};
var showprevious = undefined;
var tabletop; // Allows us to wait for tabletop to load.

function clearListDisplay() {
  $(".listTitle").html(""); // Clear
  $(".listSubtitle").html(""); // Clear
  $(".listSpecs").html(""); // Clear
  $(".sideListSpecs").html(""); // Clear
  $("#listcolumnList").html(""); // Clear
  $("#dataList").html(""); // Clear
  $("#detaillist").html(""); // Clear
}

let dp = {}; // So available on .detail click for popMapPoint() and zoomMapPoint().

// TO DO: Can we avoid calling outside of the localsite repo by files in community, including community/map/starter/embed-map.js 
function loadMap1(calledBy, show, dp_incoming) {
  // Calls loadDataset
  let hash = getHash();
  let showDirectory = true;
  if (!show && param["show"]) {
    show = param["show"];
  }
  console.log('loadMap1 start. CalledBy ' + calledBy + '. Show: ' + show + '. Cat: ' + hash.cat);

  dp = {}; // Clear prior
  if (dp_incoming) { // Parameters set in page or layer json
    dp = dp_incoming;
  }
  
  let layers = hash.layers;
  var basemaps1 = {};
  var basemaps2 = {};

  let theState;
  if (hash.state) {
    theState = hash.state.split(",")[0].toUpperCase()
  }

  waitForElm('#state_select').then((elm) => {

    if (theState != "") {
      //  = $("#state_select").find(":selected").val()
      let kilometers_wide = $("#state_select").find(":selected").attr("km");
      //zoom = 1/kilometers_wide * 1800000;
      zoom = zoomFromKm2(kilometers_wide,theState);
      dp.latitude = $("#state_select").find(":selected").attr("lat");
      dp.longitude = $("#state_select").find(":selected").attr("lon");
      //alert("dp.longitude " + dp.longitude)

      // The above loads async. 
      // May need to check if map1 and map2 are already loaded if not always recentering.
    }
  });

  dp.listLocation = false; // Hides Waze direction link in list, remains in popup.

  dp.show = show;
  if (show && show.length) {
    $("." + show).show(); // Show layer's divs, after hiding all layer-specific above.
  }
  $("#filterbaroffset").height($("#filterFieldsHolder").height() + "px"); // Adjust incase reveal/hide changes height.

  // Google Sheets must be published with File > Publish to Web to avoid error: 
  // "blocked by CORS policy: No 'Access-Control-Allow-Origin' header" 

  // Temp - until widget includes local industry lists
  if((show == "industries" || show == "vehicles" || show == "bioeconomy") && location.href.indexOf('/info') == -1) {
    ////location.href = "/localsite/info/" + location.hash;
    //location.href = "/localsite/info/#show=" + show;
  }

  if (show == "farmfresh") { // In naics.js we also default to GA for this one topic // && theState
    if (!theState) {
      theState = "GA"; // Since there is not a national dataset for map.
      updateHash({"state":theState});
    }
    dp.listTitle = "USDA Farm Produce";
    if (theState) {
      //if (location.host.indexOf('localhost') >= 0) {
        //dp.categories = "farm = Direct from Farm, market = Farmers Markets";
        dp.categories = {"onfarmmarket": {"title":"Direct from Farm","color":"#b2df8a"}, "farmersmarket": {"title":"Farmers Markets","color":"#33a02c"}};
        // Green colors above
        // #b2df8a, #33a02c 
        dp.valueColumn = "type";
        dp.valueColumnLabel = "Type";
        // https://model.earth/community-data
        
        // Delete these files. From before 2022. Used until 2024
        //dp.dataset = local_app.community_data_root() + "us/state/" + theState + "/" + theState.toLowerCase() + "-farmfresh.csv";
      
        dp.dataset = local_app.community_data_root() + "locations/farmfresh/us/" + theState + "/" + theState.toLowerCase() + "-farmfresh.csv";

        // https://model.earth/community-data/locations/farmfresh/us/state/GA/ga-farmfresh.csv

      //} else {
      //  // Older data
      //  dp.valueColumn = "Prepared";
      //  dp.dataset = local_app.custom_data_root()  + "farmfresh/farmersmarkets-" + theState.toLowercase() + ".csv";
      //}
      //dp.name = "Local Farms"; // To remove
    }
    dp.dataTitle = "Farm Fresh Produce";

    dp.markerType = "google"; // BUGBUG doesn't seem to work with county boundary background (showShapeMap)
    //dp.showShapeMap = true;

    dp.search = {"In Type": "type","In Market Name": "MarketName","In County": "County","In City": "city","In Street": "street","In Zip": "zip","In Website": "Website"};
    // These were marketname
    dp.nameColumn = "name";
    dp.titleColumn = "name";
    dp.searchFields = "name";
    dp.addressColumn = "street";
    dp.stateColumn = "state";
    dp.stateRequired = "true";
    dp.addlisting = "https://www.ams.usda.gov/services/local-regional/food-directories-update";
    // community/farmfresh/ 
    dp.mapInfo = "Farmers markets and local farms providing fresh produce directly to consumers. <a style='white-space: nowrap' href='https://model.earth/community/farmfresh/'>About Data</a> | <a href='https://www.ams.usda.gov/local-food-directories/farmersmarkets'>Update Listings</a>";
  } else if (show == "buses") {
    dp.listTitle = "Bus Locations";
    dp.dataset = "https://api.marta.io/buses";
    dp.datatype = "json";
    dp.nameColumn = "route";
    dp.namePrefix = "Route";
    dp.skips = "route";
    dp.itemsColumn = "DIRECTION";
    dp.valueColumn = "DIRECTION";
    dp.valueColumnLabel = "Direction";
    dp.latitude = 33.74;
    dp.longitude = -84.38;
    dp.zoom = 12;
    dp.refreshminutes = "1";
    dp.mapInfo = "View train station arrival times at <a href='https://marta.io/'>MARTA.io</a><br>API enhancements by Code for Atlanta member jakswa. <a href='https://github.com/jakswa/marta_ui'>GitHub</a>"

    // , "In Address": "address", "In County Name": "county", "In Website URL": "website"
    dp.search = {"In Route Number": "ROUTE", "In Vehicle Number": "VEHICLE"}; // Or lowercase?
  } else if (show == "trees" && theState == "CA") {
    dp.listTitle = "Trees";
    dp.dataset = "https://storage.googleapis.com/public-tree-map/data/map.json";
    dp.nameColumn = "name_botanical";
    // , "In Address": "address", "In County Name": "county", "In Website URL": "website"
    dp.search = {"Common Name": "family_common_name", "Family Name": "family_name_botanical", "Botanical Name": "name_botanical"};
  } else if (show == "beyondcarbon") {
    dp.listTitle = "Beyond Carbon";
    dp.dataset = "https://assets.bbhub.io/dotorg/sites/40/2019/05/beyondcarbon-States_Territories-data-sample-5_22-data-06_06.csv";
    dp.itemsColumn = "Has [XX] committed to 100% clean energy?"; // For side nav search
    dp.valueColumn = "Has [XX] committed to 100% clean energy?";
    dp.nameColumn = "Has [XX] committed to 100% clean energy?";
  } else if (show == "solar") {
        // Currently showing for all states even though only Georgia solar list in Google Sheet.
        dp.listTitle = "Solar Companies";
        dp.editLink = "https://docs.google.com/spreadsheets/d/1yt_saLpiBNPR1g_r2mn9-U5DozqLoVJHVwfR-4f0HTU/edit?usp=sharing";
        dp.googleDocID = "1yt_saLpiBNPR1g_r2mn9-U5DozqLoVJHVwfR-4f0HTU";
        dp.sheetName = "Companies";
        dp.mapInfo = "Post comments in our <a href='https://docs.google.com/spreadsheets/d/1yt_saLpiBNPR1g_r2mn9-U5DozqLoVJHVwfR-4f0HTU/edit?usp=sharing'>Google Sheet</a> to submit map updates.<br>View Georgia's <a href='https://www.solarpowerworldonline.com/2020-top-georgia-contractors/'>top solar contractors by KW installed</a>.";
        dp.valueColumn = "firm type";
        dp.valueColumnLabel = "Firm Type";
        dp.markerType = "google";
        dp.search = {"In Location Name": "name", "In Address": "address", "In County Name": "county", "In Website URL": "website"};      
  } else if (layers == "brigades" || show == "brigades") { // To do: Check an array of layers
        dp.listTitle = "Coding Brigades";
        dp.dataTitle = "Brigades";
        dp.dataset = "https://neighborhood.org/brigade-information/organizations.json";
        dp.datatype = "json";
        dp.mapInfo = "<a href='https://neighborhood.org/brigade-information/'>Source</a> - <a href='https://projects.brigade.network/'>Brigade Project List</a> and <a href='https://neighborhood.org/brigade-project-index/get-indexed/'>About Project Index</a> ";
        dp.markerType = "google"; // BUGBUG doesn't seem to work with county boundary background (showShapeMap)
        // , "In Address": "address", "In County Name": "county", "In Website URL": "website"
        dp.search = {"In Location Name": "name"};
        dp.valueColumn = "type";
        dp.valueColumnLabel = "Type";
        dp.latitude = 34.82;
        dp.longitude = -98.57;
        dp.zoom = 4;
  } else if (show == "openepd") {
        dp.listTitle = "Environmental Product Declarations";
        dp.mapInfo = "EPD directory data from <a href='https://BuildingTransparency.org' target='_blank'>Building Transparency</a>";
        dp.datatype = "json";
        // Limited to 20 reduces time to 4 seconds, verse 8 seconds for 250.  251 returns 250.
        dp.dataset = "https://buildingtransparency.org/api/materials?page_number=1&page_size=251&soft_search_terms=true&category=b03dba1dca5b49acb1a5aa4daab546b4&jurisdiction=[jurisdiction]&epd__date_validity_ends__gt=2021-08-24";
        dp.headerAuth = "{'Authorization':'Bearer 204ad15687571d9c62bdfa780526b1514c090f68'}";

        dp.latColumn = "plant_or_group.latitude";
        dp.lonColumn = "plant_or_group.longitude";
  } else if (show == "trade") {
        dp.listTitle = "Georgia Exporters";
        dp.googleCategories = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQjvrzFMi_5ZPpcHj4uzjyA9aHyrlo6eJpdlLB6Mo5Fxtp9dfajgLKOfa16-HlZOPTKNQLbSWbkL6SR/pub?gid=0&single=true&output=csv";
        
        //dp.valueColumn = "category";
        //dp.valueColumnLabel = "Category";

        dp.catColumn = "Category";
        //dp.subcatColumn = "Materials Accepted";
        dp.dataset = "https://georgiadata.github.io/display/products/exporters/export.csv";
        dp.nameColumn = "account name"; // Lowercase even though capitalized in CSV.
        dp.titleColumn = "Account Name";
        dp.searchFields = "Account Name";
        //dp.addressColumn = "address";

        //dp.valueColumn = "category"; // Avoid because we have multiple categories in value column.
        //dp.valueColumnLabel = "Category";
        dp.catColumn = "Industries Trade";
        dp.mapable = "false";
        //dp.subcatColumn = "Materials Accepted";
        //dp.itemsColumn = "Materials Accepted"; // Needs to remain capitalized.

        // https://map.georgia.org/recycling/
        dp.editLink = "";
        dp.mapInfo = "<a href='https://map.georgia.org/display/products/'>View active version</a>";
        dp.search = {"In Company Name": "Account Name", "In Industries": "Industries Trade"};

      } else if (show == "opendata") {

        dp.editLink = "https://docs.google.com/spreadsheets/d/1bvD9meJgMqLywdoiGwe3f93sw1IVI_ZRjWSuCLSebZo/edit?usp=sharing";
        dp.dataTitle = "Georgia Open Data";
        dp.listTitle = "Georgia Open Data Resources";
        dp.googleDocID = "1bvD9meJgMqLywdoiGwe3f93sw1IVI_ZRjWSuCLSebZo";
        dp.sheetName = "OpenData";
        dp.itemsColumn = "Category1"; // For side nav search
        dp.valueColumn = "Category1";
        dp.valueColumnLabel = "Type";
        dp.mapInfo = "<a href='https://docs.google.com/spreadsheets/d/1bvD9meJgMqLywdoiGwe3f93sw1IVI_ZRjWSuCLSebZo/edit?usp=sharing'>Update Google Sheet</a>.";
        dp.search = {"In Dataset Name": "name", "In Type": "Category1", "In Website URL": "website"};
        dp.datastates = ["GA"];    
      } else if (show == "360") {
        dp.listTitle = "Birdseye Views";
        dp.dataset =  local_app.custom_data_root() + "360/GeorgiaPowerSites.csv";
        dp.search = {"In Location Name": "name", "In City": "CITY", "In Property URL": "property_link"};
        dp.color = "#ff9819"; // orange - Since there is no type column. An item column is filtered.
        dp.markerType = "google";
        dp.datastates = ["GA"];
      } else if (show == "dmap") {
        dp.listTitle = "Georgia Map";
        dp.googleCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRPe-t3GBhimUV6JN62lLmtpZ5XsmLDXPusjOfrJ-_tW7BZlVrvcVT4oLFXtAtRX79WSAgVQe9zK2Ik/pub?gid=0&single=true&output=csv";
        
        dp.nameColumn = "recipient_name";
        dp.titleColumn = "recipient_name";
        dp.searchFields = "recipient_name";
        dp.addressColumn = "address";

        //dp.valueColumn = "naics";
        dp.valueColumn = "naics description";
        //dp.valueColumnLabel = "2-digit NAICS";

        dp.showKeys = "naics description";
        dp.showLabels = "Industry";
        dp.search = {"In Company Name": "recipient_name", "In naics description": "naics description", "In Address" : "address"};
        dp.itemsColumn = "NAICS Description"; // The column being search
        dp.datastates = ["GA"];
      } else if (show == "recyclers") {
        dp.listTitle = "Georgia B2B Recyclers";
        dp.dataTitle = "B2B Recyclers";
        dp.adminNote = "maps.g";
        dp.googleCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBRXb005Plt3mmmJunBMk6IejMu-VAJOPdlHWXUpyecTAF-SK4OpfSjPHNMN_KAePShbNsiOo2hZzt/pub?gid=1924677788&single=true&output=csv";
        
        // Materials Tab
        dp.googleCategories = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBRXb005Plt3mmmJunBMk6IejMu-VAJOPdlHWXUpyecTAF-SK4OpfSjPHNMN_KAePShbNsiOo2hZzt/pub?gid=381237740&single=true&output=csv";
        dp.nameColumn = "organization name";
        dp.titleColumn = "organization name";
        dp.searchFields = "organization name";
        dp.addressColumn = "address";

        dp.valueColumn = "category";
        dp.valueColumnLabel = "Category";
        dp.catColumn = "Category";
        dp.subcatColumn = "Materials Accepted";
        dp.itemsColumn = "Materials Accepted"; // Needs to remain capitalized.
        dp.color = "#E31C79"; // When no category

        dp.markerType = "google";
        // https://map.georgia.org/recycling/
        dp.editLink = "https://docs.google.com/spreadsheets/d/1YmfBPEFpfmaKmxcnxijPU8-esVkhaVBE1wLZqPNOKtY/edit?usp=sharing";
        dp.listInfo = "<a href='https://map.georgia.org/recycling/georgia/'>View Recycling Datasets</a>";
        dp.mapInfo = "Add <a href='https://map.georgia.org/recycling/'>B2B&nbsp;Recycler Listings</a> or post comments to submit additions to our <a href='https://docs.google.com/spreadsheets/d/1YmfBPEFpfmaKmxcnxijPU8-esVkhaVBE1wLZqPNOKtY/edit?usp=sharing' target='georgia_recyclers_sheet'>Google&nbsp;Sheet</a>.";
        dp.search = {"In Main Category": "Category", "In Materials Accepted": "Materials Accepted", "In Location Name": "organization name", "In Address": "address", "In County Name": "county", "In Website URL": "website"};
        dp.datastates = ["GA"];
      } else if (show == "wastewater") {
        //alert("wastewater4")
        dp.listTitle = "Georgia Wastewater Facilities (2023)";
        dp.editLink = "https://docs.google.com/spreadsheets/d/1YmfBPEFpfmaKmxcnxijPU8-esVkhaVBE1wLZqPNOKtY/edit?usp=sharing";
        dp.mapInfo = "View&nbsp;<a href='/recycling/georgia/'>Solid Waste and Recycling&nbsp;Datasets</a>.";
        // Wastewater tab. Path including gid from sheet's Share > Publish [choose tab]
        dp.googleCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBRXb005Plt3mmmJunBMk6IejMu-VAJOPdlHWXUpyecTAF-SK4OpfSjPHNMN_KAePShbNsiOo2hZzt/pub?gid=2016874057&single=true&output=csv";
        
        // From sheet tab with SIC values
        // SIC Tab
        dp.googleCategories = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBRXb005Plt3mmmJunBMk6IejMu-VAJOPdlHWXUpyecTAF-SK4OpfSjPHNMN_KAePShbNsiOo2hZzt/pub?gid=1844952458&single=true&output=csv";
        
        dp.catColumn = "sic_code_list";

        // PERMIT_NAME
        // BUGBUG - Allow these to start with uppercase to match sheet
        dp.nameColumn = "permit_name"; // PERMIT_NAME
        dp.titleColumn = "permit_name";
        dp.searchFields = "permit_name";
        //dp.addressColumn = "FACILITY_ADDR";
        dp.addressColumn = "facility_addr";

        // ONLY WORKS WHEN UPPERCASE, Column in database is UPPERCASE
        // TO DO: convert to lowercase in data object, then compare all as lowercase.
        dp.valueColumn = "SIC_CODE_LIST"; 
        dp.valueColumnLabel = "SIC Code";
        ////dp.showKeys = "description"; // How would this be used?

        //dp.subcatColumn = "siccode";
        dp.itemsColumn = "SIC_CODE_LIST"; // Needs to remain capitalized.
        

        dp.markerType = "google";
        dp.color = "#339";
        dp.search = {"In Name": "PERMIT_NAME", "In Address": "facility_addr", "In County Name": "county", "SIC Code": "SIC_CODE_LIST", };
        dp.datastates = ["GA"];
      } else if (show == "landfills") {
        dp.listTitle = "Georgia Landfills (2017)";
        dp.editLink = "https://docs.google.com/spreadsheets/d/1YmfBPEFpfmaKmxcnxijPU8-esVkhaVBE1wLZqPNOKtY/edit?usp=sharing";
        dp.mapInfo = "Post comments in our <a href='https://docs.google.com/spreadsheets/d/1YmfBPEFpfmaKmxcnxijPU8-esVkhaVBE1wLZqPNOKtY/edit?usp=sharing' target='georgia_recyclers_sheet'>Google&nbsp;Sheet</a> to provide updates.<br>Source: <a href='https://epd.georgia.gov/about-us/land-protection-branch/solid-waste/regulated-solid-waste-facilities'>EPD Regulated Solid Waste</a>. &nbsp;View&nbsp;<a href='/recycling/georgia/'>Wastewater and Recycling&nbsp;Datasets</a>.";

        // From Landfills tab (temporary until Solid Waste ready)
        dp.googleCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBRXb005Plt3mmmJunBMk6IejMu-VAJOPdlHWXUpyecTAF-SK4OpfSjPHNMN_KAePShbNsiOo2hZzt/pub?gid=2088666243&single=true&output=csv";
        // Old data from approx 2017 or earlier
        // The lastest data resides at: https://epd.georgia.gov/about-us/land-protection-branch/solid-waste/permitted-solid-waste-facilities and has been pulled into the Solid Waste tab

        // BUGBUG - Allow these to start with uppercase to match sheet
        dp.nameColumn = "name";
        dp.titleColumn = "name";
        dp.searchFields = "name";

        // hack
        dp.addressColumn = "name";

        dp.search = {"In Name": "Name","In County": "County"};
    
        dp.markerType = "google";
        dp.color = "#393";
        dp.latColumn = "latitude"; // Only works when lowercase, despite Google Sheet column being uppercase
        dp.lonColumn = "longitude";
        dp.datastates = ["GA"];
      } else if (show == "solidwaste") {
        dp.listTitle = "Georgia Solid Waste (Oct 2023)";
        dp.editLink = "https://docs.google.com/spreadsheets/d/1YmfBPEFpfmaKmxcnxijPU8-esVkhaVBE1wLZqPNOKtY/edit?usp=sharing";
        dp.mapInfo = "Post comments in our <a href='https://docs.google.com/spreadsheets/d/1YmfBPEFpfmaKmxcnxijPU8-esVkhaVBE1wLZqPNOKtY/edit?usp=sharing' target='georgia_recyclers_sheet'>Google&nbsp;Sheet</a> to provide updates. Source: <a href='https://epd.georgia.gov/about-us/land-protection-branch/solid-waste/regulated-solid-waste-facilities'>EPD Regulated Solid Waste</a>. &nbsp;View&nbsp;<a href='/recycling/georgia/'>More&nbsp;Recycling&nbsp;Datasets</a>.";
      
        // From Solid Waste 2023-10 tab
        dp.googleCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBRXb005Plt3mmmJunBMk6IejMu-VAJOPdlHWXUpyecTAF-SK4OpfSjPHNMN_KAePShbNsiOo2hZzt/pub?gid=1567915085&single=true&output=csv";
        // BUGBUG - Allow these to start with uppercase to match sheet
        dp.nameColumn = "facility name";
        dp.titleColumn = "facility name";
        dp.searchFields = "facility name";
        dp.search = {"In Name": "Facility Name","In Address": "Address", "Status": "Operating Status", "Permit Number": "Permit Number"};

        //dp.showWhenStatus = "Operating"
        dp.catColumn = "Operating Status";
        dp.valueColumn = "operating status";
        dp.valueColumnLabel = "Operating Status";

        dp.markerType = "google";
        dp.color = "#933";
        dp.datastates = ["GA"];
      } else if (show == "solidwaste-old") { // This tab can be deleted in Google Sheet
        dp.listTitle = "Georgia Solid Waste (Old)";
        dp.editLink = "https://docs.google.com/spreadsheets/d/1YmfBPEFpfmaKmxcnxijPU8-esVkhaVBE1wLZqPNOKtY/edit?usp=sharing";
        dp.mapInfo = "Post comments in our <a href='https://docs.google.com/spreadsheets/d/1YmfBPEFpfmaKmxcnxijPU8-esVkhaVBE1wLZqPNOKtY/edit?usp=sharing' target='georgia_recyclers_sheet'>Google&nbsp;Sheet</a> to provide updates. Source: <a href='https://epd.georgia.gov/about-us/land-protection-branch/solid-waste/regulated-solid-waste-facilities'>EPD Regulated Solid Waste</a>. &nbsp;View&nbsp;<a href='/recycling/georgia/'>More&nbsp;Recycling&nbsp;Datasets</a>.";
      
        // From "Solid Waste Old" tab
        dp.googleCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBRXb005Plt3mmmJunBMk6IejMu-VAJOPdlHWXUpyecTAF-SK4OpfSjPHNMN_KAePShbNsiOo2hZzt/pub?gid=809637033&single=true&output=csv";
        // BUGBUG - Allow these to start with uppercase to match sheet
        dp.nameColumn = "facility name";
        dp.titleColumn = "facility name";
        dp.searchFields = "facility name";
        dp.search = {"In Name": "Facility Name","In Address": "Address", "Status": "Operating Status"};

        //dp.showWhenStatus = "Operating"
        dp.catColumn = "Operating Status";
        dp.valueColumn = "operating status";
        dp.valueColumnLabel = "Operating Status";

        dp.markerType = "google";
        dp.color = "#933";
        dp.datastates = ["GA"];
      } else if (show == "cameraready-locations") {
        dp.listTitle = "CameraReady Film Locations";
        dp.dataTitle = "Filming Locations";
        dp.datatype = "json";
        dp.dataset = "https://raw.githubusercontent.com/GeorgiaFilm/cameraready_locations_curl/main/cameraready.json";
        //dp.color = "#548d1a"; // green
        dp.markerType = "google";
        dp.filters = {tag:"Locations"}; // Supports comma separated values
        dp.showKeys = "hours_saturday";
        dp.showLabels = "Saturday";
        dp.search = {"In Location Name": "name", "In Address": "address", "In County Name": "county", "In Website URL": "website", "Type": "tag"};
        dp.datastates = ["GA"];
      } else if (show == "cameraready") {
        dp.listTitle = "CameraReady County Liaisons";
        dp.dataTitle = "CameraReady Liaisons";
        dp.datatype = "json";
        dp.dataset = "https://raw.githubusercontent.com/GeorgiaFilm/cameraready_locations_curl/main/cameraready.json";
        dp.color = "#ff9819"; // orange - Since there is no type column. An item column is filtered. To do: Pull types from a tab and relate to the first type in each column.
        dp.markerType = "google";
        dp.filters = {tag:"Liaisons"}; // Supports comma separated values
        dp.search = {"In Location Name": "name", "In Address": "address", "In County Name": "county", "In Website URL": "website", "Type": "tag"};
        dp.datastates = ["GA"];
      } else if (show == "aerospace") {
        dp.listTitle = "Georgia Aerospace Directory";
        dp.dataTitle = "Aerospace Directory";
        dp.mapInfo = "The Aerospace Directory is a free listing service provided by the Center of Innovation for Aerospace for any aerospace-related company or organization in Georgia. <a href='https://www.cognitoforms.com/GDECD1/GeorgiaDirectory' target='_blank'>Add and Update Listings</a>";
        // Participating in this directory gives a company/organization visibility to national, regional, and state partners who are looking for local suppliers or potential suppliers for new economic development prospects. 

        dp.nameColumn = "organization name";
        dp.titleColumn = "organization name";
        dp.searchFields = "organization name";

        dp.googleCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSkK4mAiyQoplKH40yhYondpbZCctjz7EHDq5ZSCHVTTYC4Pmk7J-C_k361MXXNRY8YGuNeripB6cwU/pub?gid=851472293&single=true&output=csv";
        dp.markerType = "google";
        //dp.color = "#ff9819"; // orange - Since there is no type column. An item column is filtered. To do: Pull types from a tab and relate to the first type in each column.
        
        //dp.filters = {tag:"Liaisons"}; // Supports comma separated values
        //dp.search = {"In Location Name": "name", "In Address": "address", "In County Name": "county", "In Website URL": "website", "Type": "tag"};
        
        // CatAerospace Tab
        dp.googleCategories = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSkK4mAiyQoplKH40yhYondpbZCctjz7EHDq5ZSCHVTTYC4Pmk7J-C_k361MXXNRY8YGuNeripB6cwU/pub?gid=239772657&single=true&output=csv";
        dp.catColumn = "categories";

        ////dp.showWhenStatus = "Operating"
        dp.valueColumn = "categories";
        dp.valueColumnLabel = "Categories";

        dp.omitColumns = "lastconfirmed,pdf,salesforce"; // Currently make these lowercase here regardless of column capitalization
        // Questions: Can the pdf column be deleted?
        // Can the free listing / premium listing column be deleted?
        // Should the green "RETAIN IN CONTACTS LIST" also be deleted?
        // Proably to delete: georgiadirectory_id
        // Can 12 "Air Transport" be renamed to "Air Transportation" (which has 50+ rows, and it's a main category)

        dp.filters = {type:"aerospace"}; // Supports comma separated values
        dp.search = {"In Main Category": "Category", "In Location Name": "Organization Name", "In Address": "address", "In County Name": "county", "In Website URL": "website"};
        dp.datastates = ["GA"];
      } else if (1==2 && (show == "recycling" || show == "transfer" || show == "recyclers" || show == "inert" || show == "landfillsX")) { // recycling-processors
        // NOT USED - LOOK ABOVE
        if (theState == "GA") {
          dp.editLink = "https://docs.google.com/spreadsheets/d/1YmfBPEFpfmaKmxcnxijPU8-esVkhaVBE1wLZqPNOKtY/edit?usp=sharing";
          //dp.googleDocID = "1YmfBPEFpfmaKmxcnxijPU8-esVkhaVBE1wLZqPNOKtY";
          dp.googleCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBRXb005Plt3mmmJunBMk6IejMu-VAJOPdlHWXUpyecTAF-SK4OpfSjPHNMN_KAePShbNsiOo2hZzt/pub?gid=1924677788&single=true&output=csv";
          if (show == "transfer") {
            dp.listTitle = "Georgia Transfer Stations";
            dp.sheetName = "Transfer Stations";
            dp.valueColumn = "waste type"; // Bug - need to support uppercase too.
            dp.valueColumnLabel = "Waste Type";
          } else if (show == "recyclers") {
            dp.listTitle = "Georgia Companies that Recycle During Manufacturing";
            dp.sheetName = "Manufacturer Recyclers";
            dp.valueColumn = "category"; // Bug - need to support uppercase too. Also, most don't have a Category value
            dp.valueColumnLabel = "Recycles";
          } else if (show == "landfillsX") {
            dp.listTitle = "Georgia Landfills";
            dp.sheetName = "Landfills";
            dp.valueColumn = "sector"; // Bug - need to support uppercase too.
            dp.valueColumnLabel = "Sector";
          } else if (show == "inert") {
            dp.listTitle = "Georgia Inert Waste Landfills";
            dp.sheetName = "Inert Waste Landfills";
            dp.valueColumn = "sector"; // Bug - need to support uppercase too.
            dp.valueColumnLabel = "Sector";
          } else {
            dp.listTitle = "Georgia Recycling Processors";
            dp.sheetName = "Recycling Processors";
            dp.valueColumn = "category";
            dp.valueColumnLabel = "Materials Category";
          }
          // May need to add here
          //dp.nameColumn = "organizationname";
          //dp.titleColumn = "organizationname";

          dp.mapInfo = "<span>View <a href='/recycling/georgia/'>Recycling Datasets</a>.</span><br>Submit updates by posting comments in our 5 <a href='https://docs.google.com/spreadsheets/d/1YmfBPEFpfmaKmxcnxijPU8-esVkhaVBE1wLZqPNOKtY/edit?usp=sharing'>Google Sheet Tabs</a>.";
          
          //dp.latColumn = "latitude";
          //dp.lonColumn = "longitude";
          dp.search = {"In Location Name": "name", "In Address": "address", "In County Name": "county", "In Website URL": "website"};
        }
      } else if (show == "vehicles" || show == "ev") {
        //dp.listTitle = "Motor Vehicle and Motor Vehicle Equipment Manufacturing";
        dp.listTitle = "Parts and Vehicle Manufacturing";
        dp.shortTitle = "EV Parts and Vehicle Manufacturing";
        if (show == "ev") {
          dp.listTitle = "Electric Vehicle Manufacturing";
        }
        // Is this in use?
        dp.editLink = "https://docs.google.com/spreadsheets/d/1OX8TsLby-Ddn8WHa7yLKNpEERYN_RlScMrC0sbnT1Zs/edit?usp=sharing";
        //dp.googleDocID = "1OX8TsLby-Ddn8WHa7yLKNpEERYN_RlScMrC0sbnT1Zs";

        //https://docs.google.com/spreadsheets/d/e/2PACX-1vSEbtuDxqld2wdlFqUh23MQl-BO7faEm1DGSkgJ4A5wNqkK5TOj82bkIjtRsOWx5yAThbcC6IsxPzYV/pubhtml
        //dp.googleCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBRXb005Plt3mmmJunBMk6IejMu-VAJOPdlHWXUpyecTAF-SK4OpfSjPHNMN_KAePShbNsiOo2hZzt/pub?gid=1924677788&single=true&output=csv";
        dp.googleCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSEbtuDxqld2wdlFqUh23MQl-BO7faEm1DGSkgJ4A5wNqkK5TOj82bkIjtRsOWx5yAThbcC6IsxPzYV/pub?gid=0&single=true&output=csv";

        // Not sure if any of these are needed.
        dp.sheetName = "Automotive";
        dp.nameColumn = "name";
        dp.latColumn = "latitude";
        dp.lonColumn = "longitude";
        dp.categories = {"Yes": {"title":"EV or Batteries","color":""}, "No": {"title":"ICE Specific","color":""}};
        // , "null": {"title":"Either","color":""}
        dp.catColumn = "EV Industry";
        dp.showWhenStatus = "null"
        // Temp, prior to change from Google API 2 to 3
        //dp.dataset = "https://model.earth/georgia-data/automotive/automotive.csv";
        dp.datastates = ["GA"];
        // Dark green map points indicate electric vehicle parts manufacturing.<br>
        dp.mapInfo = "From 2020 to 2022 Georgia added more than 20 EV-related projects. <a href='https://www.georgiatrend.com/2022/07/29/electric-revolution/'>Learn&nbsp;more</a>";
        // <br>Dark Green: Electric Vehicle (EV) Industry<br>Lite Green: Potential EV Parts Manufacturer<br>Dark Blue: Internal Combustion Engine (ICE)
        dp.listInfo = "Post comments in our <a href='https://docs.google.com/spreadsheets/d/1OX8TsLby-Ddn8WHa7yLKNpEERYN_RlScMrC0sbnT1Zs/edit?usp=sharing' target='vehicles_data'>Google Sheet</a> to submit updates. <a href='/localsite/info/input/'>Contact Us</a> to become an editor. Learn about <a href='../../community/projects/mobility/'>data&nbsp;sources</a>.";
        dp.valueColumn = "ev industry";
        dp.valueColumnLabel = "EV Industry";
        dp.markerType = "google";
        dp.search = {"EV Industry": "EV Industry", "In Location Name": "name", "In Address": "address", "In County Name": "county", "In Website URL": "website"};
      } else if (show == "smart") { // param["data"] for legacy: https://www.georgia.org/smart-mobility
        dp.shortTitle = "Smart Data Projects";
        dp.listTitle = "Data Driven Decision Making";
        //dp.listSubtitle = "Smart & Sustainable Movement of Goods & Services";
        dp.industryListTitle = "Mobility Tech";

        console.log("map.js loading " + local_app.custom_data_root() + "communities/map-georgia-smart.csv");

        dp.dataset =  local_app.custom_data_root() + "communities/map-georgia-smart.csv";
        dp.mapInfo = "Includes <a href='https://smartcities.gatech.edu/georgia-smart' target='_blank'>Georgia Smart</a> Community Projects. <a href='https://github.com/GeorgiaData/georgia-data/blob/master/communities/map-georgia-smart.csv'>Submit changes</a>";
        dp.search = {"In Title": "title", "In Description": "description", "In Website URL": "website", "In Address": "address", "In City Name": "city", "In Zip Code" : "zip"};
        dp.markerType = "google";
        //dp.showShapeMap = true; // Shows county borders
        dp.latitude = 32.8;
        dp.longitude = -83.4;
        dp.zoom = 7;
        dp.colorColumn = "name"; // Invokes color as alternative to valueColumn

        dp.valueColumn = "city";
        dp.valueColumnLabel = "City";
      } else if (show == "logistics") { // "http://" + param["domain"]

        dp.listTitle = "Logistics";

        dp.mapInfo = "Select a category to filter your results.";
        //dp.dataset = "https://georgiadata.github.io/display/data/logistics/coi_with_cognito.csv";
        dp.dataset = "../../display/data/logistics/coi_with_cognito.csv";

        dp.dataTitle = "Manufacturers and Distributors";
        dp.itemsColumn = "items";
        dp.valueColumn = "type";
        dp.valueColumnLabel = "Type";
        dp.markerType = "google";
        //dp.keywords = "items";
        // "In Business Type": "type", "In State Name": "state", "In Postal Code" : "zip"
        dp.search = {"In Items": "items", "In Website URL": "website", "In City Name": "city", "In Zip Code" : "zip"};
        dp.nameColumn = "title";
        dp.latColumn = "lat_rand";
        dp.lonColumn = "lon_rand";

        dp.nameColumn = "company";
        dp.latColumn = "latitude";
        dp.lonColumn = "longitude";
        dp.showLegend = false;

        dp.listLocation = false;

      } else if (show == "restaurants") {
        // Fulton County 5631 restaurants
        dp.listTitle = "Restaurant Ratings";
        dp.dataTitle = "Restaurant Ratings";
        dp.dataset = "/community/tools/map.csv";
        dp.latitude = 32.9;
        dp.longitude = -83.4; 
        dp.name = "Fulton County Restaurants";
        dp.titleColumn = "restaurant";
        dp.nameColumn = "restaurant";

        dp.valueColumnLabel = "Health safety score";
        dp.valueColumn = "score";

        dp.latColumn = "latitude";
        dp.lonColumn = "longitude";

        dp.dataset = "/community/farmfresh/usa/georgia/fulton_county_restaurants.csv"; // Just use 50
        dp.dataTitle = "Restaurant Scores";
        dp.titleColumn = "restaurant";
        dp.mapInfo = "Fulton County";
      } else if (show == "pickup") {
        // Atlanta Pickup
        dp.latitude = 33.76;
        dp.longitude = -84.3880;
        dp.zoom = 14;

        // CURBSIDE PICKUP
        dp.listTitle = "Restaurants with Curbside Pickup";
        dp.mapInfo = "Data provided by coastapp.com. <a href='https://coastapp.com/takeoutcovid/atl/' target='_blank'>Make Updates</a>";
        dp.dataset = "/community/places/usa/ga/restaurants/atlanta-coastapp.csv";
        dp.dataTitle = "Curbside Pickup";
        // 
        dp.markerType = "google";
        dp.search = {"In Restaurant Name": "Name", "In Description": "Description", "In City Name": "City", "In Address" : "Address"};
        dp.nameColumn = "Name";
        dp.titleColumn = "Description";
        //dp.addressColumn = "Address";
        //dp.website = "Link";
        dp.valueColumnLabel = "Delivery";
        dp.valueColumn = "Delivery";
        dp.listLocation = true;

      } else {
        showDirectory = false;
      }

  if (theState == "CA") {
    //alert("theState " + theState)
    if (show == "businesses") { // San Diego - Mike
        dp.nameColumn = "Name";
        dp.titleColumn = "Name";

        dp.listTitle = "Businesses";
        dp.dataTitle = "Businesses";
        dp.dataset = "/apps/benchmarks/data/beyond_businesses.csv";
        dp.latitude = 32.71;
        dp.longitude = -117.16;
        dp.zoom = 11;
        dp.latColumn = "lat";
        dp.lonColumn = "lon";
        dp.valueColumnLabel = "NAICS";
        dp.valueColumn = "NAICS";
      } else if (show == "buildings") { // San Diego - Mike
        dp.nameColumn = "Name";
        dp.listTitle = "Buildings";
        dp.dataTitle = "Buildings";
        dp.dataset = "/apps/benchmarks/data/beyond_carbon.csv";
        dp.latitude = 32.71;
        dp.longitude = -117.16;
        dp.zoom = 11;
        dp.latColumn = "lat";
        dp.lonColumn = "lon";
        dp.valueColumnLabel = "ENERGY STAR";
        dp.valueColumn = "ENERGY STAR";
      }
  }

  if(dp.dataset) {
    if (theState) {
      dp.dataset = dp.dataset.replace("[jurisdiction]","US-" + theState);
    } else {
      dp.dataset = dp.dataset.replace("[jurisdiction]","US");
    }
  }


  if (Array.isArray(dp.datastates) && !dp.datastates.includes(theState)) {
    showDirectory = false;
  }
  if (showDirectory) { // Load the map using settings above
    // INIT - geo fetches the county for filtering.
    hash = $.extend(true, {}, getHash()); // Clone/copy object without entanglement
    if (!hash.state && hash.geo) { // Wait for geo load when no state to center.
      loadGeos(hash.geo,0,function(results) {
        loadDataset('map1','map2', dp, basemaps1, basemaps2, 1, function(results) {
          initialHighlight(hash);
        });
      });
    } else {
      if (!hash.state) {
        $(".locationTabText").text("Locations");
      } else {
        $("#state_select").val(theState);
        $(".locationTabText").text($("#state_select").find(":selected").text());
        $(".locationTabText").attr("title",$("#state_select").find(":selected").text());
      }
      loadDataset('map1','map2', dp, basemaps1, basemaps2, 1, function(results) {
        initialHighlight(hash);  
      });
    }
  } else {
    hideDirectoryDivs(show);
  }
  // Return to top for mobile users on search.
  if (document.body.clientWidth <= 500) {
    window.scrollTo({
      top: 0,
      left: 0
    });
  }
  showprevious = show;

  // Sulfer Dioxide - Good indicator of smoke stacks, Source of acidity
  // https://earth.nullschool.net/#current/chem/surface/level/overlay=so2smass/orthographic=-94.02,32.31,1023

  // Surface wind
  // https://earth.nullschool.net/#current/wind/surface/level/orthographic=-73.52,34.52,532

  // US East Coast Ocean Currant
  // https://earth.nullschool.net/#current/wind/surface/currents/overlay=wind/orthographic=-73.52,34.52,1101

  // Was getting called here on display/exporters/
  //loadIframe("mainframe","https://earth.nullschool.net/#current/wind/surface/level/orthographic=" +  dp.longitude + "," + dp.latitude + ",1381");


  console.log("End loadMap1. Cat: " + hash.cat);

} // loadMap1

function hideDirectoryDivs(show) {
  console.log("no show text match for listing map: " + show);
  $(".displayMapForLoad").hide();
  $("#list_main").hide();
  $("#mapInfo").hide();
  $("#listInfo").hide();
}
function initialHighlight(hash) {
  // When is this called - not for list highlight
  if (hash.name) {
    let locname = hash.name.replace(/_/g," ").replace(/ & /g,' AND ');

    // console.log("Auto select the first location in list")
    //$("#detaillist > [name=\""+locname+"\"]" ).trigger("click");

    //$("#detaillist").scrollTop($("#detaillist").scrollTop() + $("#detaillist > [name=\""+locname+"\"]" ).position().top);

    // https://stackoverflow.com/questions/2346011/how-do-i-scroll-to-an-element-within-an-overflowed-div?noredirect=1&lq=1

    //var element = document.getElementById("detaillist");
    //element.scrollTop = element.scrollHeight;
    //$("#detaillist").scrollTop(200);

    $("#detaillist").scrollTo("#detaillist > [name=\""+locname+"\"]");
  }
}
function showSubcatList() {
  $("#viewAllCategories").hide();
  $("#subcatListUL").show();
  event.stopPropagation();
  event.preventDefault();
}
//jQuery.fn.scrollTo = function(elem) {

    // BUG Reactivate test with http://localhost:8887/localsite/info/#show=ppe&name=Code_the_South
    /*
    if (typeof $(elem) !== "undefined" && typeof $(this) !== "undefined") { // Exists
      $(this).scrollTop($(this).scrollTop() - $(this).offset().top + $(elem).offset().top);
      return this;
    } else {
      // element does not exist
    }
    */
//};

function centerMap(lat,lon,name,map,whichmap) {
    console.log("centerMap " + whichmap);
    $("#sidemapCard").show(); // map2 - show first to maximize time tiles have to see full size of map div.
    $('.detail').removeClass("detailActiveHold"); // Remove prior

    $('#sidemapName').text($(this).attr("name"));

    //$(this).css("border","1px solid #ccc");
    //$(this).css("background-color","rgb(250, 250, 250)");
    //$(this).css("padding","15px");
    $(this).addClass("detailActive");
    $(this).addClass("detailActiveHold");
    if ($(".detailActive").height() < 250) {
      $("#changeHublistHeight").hide();
    }
    
    // Hide all listings, show clicked listing
    //$("#detaillist .detail").hide();
    //$("#dataList").hide();
    //$("#detaillist .detail[name='" + locname +"']").show();

    var listingsVisible = $('#detaillist .detail:visible').length;
    if (listingsVisible == 1 || hash.cat) {
      $(".viewAllLink").show();
    }
    if (lat && lon) {
      let color = "#cc7777";
      centerMapPoint(map, lat, lon);
      popMapPoint(dp, map, lat, lon, name, color);
      if(whichmap == "map2") {
        // Lower map
        
        zoomMapPoint(dp, map, lat, lon, name, color);

        // Scroll to area with map2
        /*
        window.scrollTo({
          top: $("#sidemapCard").offset().top - 140,
          left: 0
        });
        */

      }
    }
    $(".go_local").show();
}
function showDetail() {
    //let locname = $(this).attr("name").replace(/ AND /g," & ").replace(/_/g," ");
    //alert("click detail This: " + $(this).attr("name"));
    //alert("click detail: " + locname);

    let locnameUrl = $(this).attr("name").replace(/ & /g," AND ").replace(/ /g,"_");
    let hash = getHash(); 
    // ToDO (Make sure "View Details" button is not using goHash
    
    let latitude = $(this).attr("latitude");
    let longitude = $(this).attr("longitude");
    console.log("Used name to fetch lat " + latitude);
    //goHash({"show":hash.show,"name":locnameUrl});
    updateHash({"show":hash.show,"name":locnameUrl,"m":""}); 
    if (latitude && longitude) { // To do: Add a IsValidGeo function here
      centerMap(latitude, longitude, name, map1, "map1");
      centerMap(latitude, longitude, name, map2, "map2");
    } else {
      console.log("No lat lon for listing");
    }
    if ($(this).attr("m")) {
      loadScript(theroot + 'js/map-filters.js', function(results) {
        let mapframe = getMapframeUrl($(this).attr("m"));
        if (mapframe) {
          $("#mapframe").prop("src", mapframe);
          $(".mapframeClass").show();
          window.scrollTo({
              top: $('#mapframe').offset().top - 95,
              left: 0
            });
        }
      });
    }
}
$(document).on("click", "#listcolumnList .detail, #detaillist .detail", function(event) { // Provides close-up using map2
    console.log("detail click updates hash. hashChangedMap() hides other names.");
    let hash = getHash();
    let locnameUrl = $(this).attr("name").replace(/ & /g," AND ").replace(/ /g,"_");
    let m = $(this).attr("m"); // iFrame
    goHash({"show":hash.show,"name":locnameUrl,"m":m});
    event.stopPropagation();
});
$(document).on("click", ".showItemMenu", function(event) { 
  $("#listingMenu").show();
  $("#listingMenu").prependTo($(this).parent());
  event.stopPropagation();
});
$(document).on("click", ".showLocMenu", function(event) { 
  $(".locMenu").show();
  //event.stopPropagation();
});
$('#hideSideMap').click(function () {
  $("#sidemapCard").hide(); // map2
});

function shortenMapframe(mapframeLong) {
  let mapframeUrl = "";
  if (mapframeLong && mapframeLong.length) {
    if (mapframeLong.toLowerCase().includes("kuula.co")) {
      // viewID resides at the end of Kuula incomoing link.
      let pieces = mapframeLong.split("/");
      let viewID = pieces[pieces.length-1];
      if(viewID.includes("?")) {
        viewID = viewID.split("?")[0];
      }
      // Embed Format: "https://kuula.co/share/collection/" + viewID + "?fs=1&vr=1&zoom=0&initload=1&thumbs=1&chromeless=1&logo=-1";
      mapframeUrl = "kuula_" + viewID; // Allows for shorter URLs
    } else if (mapframeLong.toLowerCase().includes("roundme")) {
      // Incoming: https://roundme.com/tour/463798/view/1595277/
      // Embed Format: https://roundme.com/embed/463798/1595277
      mapframeUrl = "roundme_" + mapframeLong.replace("https://roundme.com/tour/","").replace("view/","");
    } else {
      console.log("Unable to shorten mapframe " + mapframeLong);
      mapframeUrl = mapframeLong;
    }
  }
  return(mapframeUrl);
}
function getMapframeUrl(m) {
    //alert("getMapframeUrl " + m);
    if (m == "ej") {
        mapframe = "https://ejscreen.epa.gov/mapper/";
    } else if (m == "peach") {
        mapframe = "https://kuula.co/share/collection/7PYZK?fs=1&vr=1&zoom=0&initload=1&thumbs=1&chromeless=1&logo=-1";
    } else if (m && m.includes("kuula_")) {
        mapframe = "https://kuula.co/share/collection/" + m.replace("kuula_","") + "?fs=1&vr=1&zoom=1&initload=1&thumbs=1&chromeless=1&logo=-1";
    } else if (m && m.includes("roundme_")) {
        mapframe = "https://roundme.com/embed/" + m.replace("roundme_","");
    } else {
        //mapframe = m + "?fs=1&vr=1&zoom=0&initload=1&thumbs=1&chromeless=1&logo=-1";
        //mapframe = "https://kuula.co/share/collection/7lrpl?fs=1&vr=1&zoom=0&initload=1&thumbs=1&chromeless=1&logo=-1";
        mapframe = m;
    }
    return mapframe;
}

let subcatObject = {};
let subcatArray = [];
let subcatList = "";

function showList(dp,map) {
  console.log("showList");
  console.log("Call showList for " + dp.dataTitle + " list");
  let hash = getHash();
  var iconColor, iconColorRGB;
  let count = 0
  let countDisplay = 0;
  let validRowCount = 0;
  let showCount = 0;

  var productMatchFound = 0;
  var dataMatchCount = 0;
      // Keyword Search
  var keyword = "";
  var products = "";
  var productcodes = "";
  var products_array = [];
  var productcode_array = [];
  let shortout = "";

  isObject = function(a) {
      return (!!a) && (a.constructor === Object);
  }
  if (dp.listTitle) {
    $(".listTitle").html(dp.listTitle);
    $(".listTitle").show();
    $("#navcolumnTitle").html(dp.shortTitle ? dp.shortTitle : dp.listTitle);
    $("#navcolumnTitle").show();
    $(".sidelistHeader").html(dp.shortTitle ? dp.shortTitle : dp.listTitle);
  } else {
    $("#navcolumnTitle").hide();
  }
  if (dp.listSubtitle) {$(".listSubtitle").html(dp.listSubtitle); $(".listSubtitle").show()};
  $("#listInfo").hide();
  $("#mapInfo").hide();

  // Add checkboxes
  console.log("dp.search ")
  console.log(dp.search)

  if (!dp.latColumn) {
    dp.latColumn = "latitude";
  }
  if (!dp.lonColumn) {
    dp.lonColumn = "longitude";
  }
  console.log("Clear prior list results");
  $("#detaillist").text(""); // Clear prior results
  $("#detaillist").remove(); // Used to trigger waitfor
  if (dp.search && $("#activeLayer").text() != dp.dataTitle) { // Only set when active layer changes, otherwise selection overwritten on change.
    let search = [];
    if (param["search"]) {
      search = param["search"].replace(/\+/g," ").toLowerCase().split(",");
    }

    if (hash.show !== priorHash.show) {
      //alert("Render checkboxes " + hash.show + " priorHash.show " + priorHash.show);
      let checkCols = "";
      let checked = "";
      $.each(dp.search, function( key, value ) {
        checked = "";
        if (search.length == 0) {
          checked = "checked"; // No hash value limiting to specific columns.
        } else if(jQuery.inArray(value.toLowerCase(), search) !== -1) {
          checked = "checked";
        }
        checkCols += '<div><input type="checkbox" class="selected_col" name="in" id="' + value + '" ' + checked + '><label for="' + value + '" class="filterCheckboxTitle"> ' + key + '</label></div>';
      });
      $("#selected_col_checkboxes").html(checkCols);
    }

    // BUGBUG - When toggling the activeLayer is added, this will need to be cleared to prevent multiple calls to loadMap1
     
    //$('.selected_col[type=checkbox]').change(function() {
    $(document).on('change', '.selected_col[type=checkbox]', function(event) {
        let search = $('.selected_col:checked').map(function() {return this.id;}).get().join(','); 
        let q = $("#keywordsTB").val();
        goHash({"search":search,"q":q});
        event.stopPropagation();
    });
    $(document).on("click", ".filterBubble", function(event) {
        console.log('filterBubble click (stopPropagation so other boxes can be checked)')
        event.stopPropagation(); // To keep location filter open when clicking .selected_col checkboxes
    });
  }

  var allItemsPhrase = "all categories";
  //if ($("#keywordsTB").val()) {
  if (hash.q) {
    //keyword = $("#keywordsTB").val().toLowerCase();
    keyword = hash.q;
  } else if (hash.subcat) {
    //keyword = hash.subcat;
  } else if (hash.cat) {
    //keyword = hash.cat;
  }
  if (hash.cat) {
    hash.cat = hash.cat.replace(/\_/g," ");
  }

  // Filter by all subcategories
  
  subcatObject["null"] = {};
  subcatObject["null"].count = 0; // To store a count of rows with no subcategoires
  if (localObject.layerCategories[dp.show] && localObject.layerCategories[dp.show].length >= 0) {
    //if (localObject.layerCategories[dp.show][hash.cat] >= 0) {
      subcatList = ""; // Clear prior
      subcatArray = [];
      $.each(localObject.layerCategories[dp.show], function(index,value) {
        if (value.Category == hash.cat || !hash.cat) {
          let subcatTitle = value.SubCategoryLong || value.SubCategory;
          if (value.SubCategory) {
            //alert(value.SubCategory.count); // Not available here
            subcatList += "<li><a href='#' onClick='goHash({\"cat\":\"" + value.Category + "\", \"subcat\":\"" + value.SubCategory.replace("&","%26") + "\"}); return false;'>" + subcatTitle + "</a></li>"; // subcatObject[value.SubCategory].count
            subcatArray.push(value.SubCategory);
            if (value.SubCategory.length > 0) {
              //console.log("value.SubCategory " + value.SubCategory)
              subcatObject[value.SubCategory] = {};
              subcatObject[value.SubCategory].count = 0; // Actual count added later. Here we have only one per subcat.
            }
          } else {
            subcatList += "<li><a href='#' onClick='goHash({\"cat\":\"" + value.Category + "\"}); return false;'>" + subcatTitle + "</a></li>";
          }
        }
      });
    //}
  }

  if ($("#catSearch").val()) {
    products = $("#catSearch").val().replace(" AND ",";").toLowerCase().replace(allItemsPhrase,"");
    products_array = products.split(/\s*;\s*/);
  }
  if ($("#productCodes").val()) {
    // For each product ID - Still to implement, copied for map-filters.js
    productcodes = $("#productCodes").val().replace(";",",");
    productcode_array = productcodes.split(/\s*,\s*/); // Removes space when splitting on comma
  }

  let selected_col = [];
  selected_col = $('.selected_col:checked').map(function() {return this.id;});
  //let selected_columns_object = {}; // For count of each

  if (selected_col.length == 0 && keyword && keyword != allItemsPhrase && products_array.length == 0) {
    $("#keywordFields").show();
    if (location.host.indexOf('localhost') >= 0) {
      alert("LOCAL: Please check at least one column to search.");
    }
  }
  var data_sorted = []; // An array of objects
  var data_out = [];
  let catList = {}; // An object of objects, one for each unique category

  //console.log("layerCategories test");
  //console.log(localObject.layerCategories[hash.show])
  if (localObject.layerCategories[hash.show] && localObject.layerCategories[hash.show].length >= 0) { // The length includes multiple subcats for each cat
    catList = localObject.layerCategories[hash.show];
  }

  
  // INACTIVE
  if (1==2) {
    // ADD DISTANCE
    dp.data.forEach(function(element) {
        if (element.plant_or_group) {
          alert(element.plant_or_group);
          console.log(element.plant_or_group);
        }
        if (element[dp.latColumn]) {

          if (dp.latColumn.includes(".")) { // ToDo - add support for third level
            element[dp.latColumn] = element[dp.latColumn.split(".")[0]][dp.latColumn.split(".")[1]];
            element[dp.lonColumn] = element[dp.lonColumn.split(".")[0]][dp.lonColumn.split(".")[1]];
          }
          //output += "distance: " + calculateDistance(element[dp.latColumn], element[dp.lonColumn], dp.latitude, dp.longitude, "M");
          element.distance = calculateDistance(element[dp.latColumn], element[dp.lonColumn], dp.latitude, dp.longitude, "M").toFixed(2);
        }
        data_sorted.push(element);
    });
    data_sorted.sort((a, b) => { // Sort by proximity
        return a.distance - b.distance;
    });

    dp.data = data_sorted;
  }

  console.log("showlist() VIEW DATA (dp.data) - Limit to: " + hash.name);
  console.log(dp.data);

  let output = "";
  let output_details = "";
  let avoidRepeating = ["description","address","website","phone","email","email address","county","admin note","your name","organization name","cognito_id"];
  if (dp.omitColumns) {
    let omit_array = dp.omitColumns.split(/\s*,\s*/); // Removes space when splitting possible values on comma
    for(let i = 0; i < omit_array.length; i++) {
      if (omit_array[i].length > 0) {
        avoidRepeating.push(omit_array[i]);
      }
    }
  }
  if (dp.categories) {
    // dp.scale is already set here.
    console.log("dp.categories " + dp.categories)

    if (!dp.scale) {
      //alert("dp.scale2 " + dp.scale)
      dp.scale = getScale(dp.data, dp.scaleType, dp.valueColumn);
    }

    //if (catList.length <= 0) {
    if (dp.categories) {
      catList = dp.categories;
      localObject.layerCategories[hash.show] = dp.categories;
      /*
      catList = dp.categories.split(",").reduce(function(obj, str, index) {
        let strParts = str.split("="); // Split and get rid of extra spaces at ends
        if (strParts[0] && strParts[1]) { // Make sure the key & value are not undefined
          //let 
          let catKey = strParts[1].trim();
          let iconColor = "#777"; // Grey - for side category list
          if (dp.color) {
            iconColor = dp.color;
          } else {
            iconColor = dp.scale(catKey);
          }
          let thisCatsObject = {"title": catKey, "count":.5, "color": iconColor}; //HACK - include count to display in side.
          
          // add something like this above instead (not a funtion error):   .replace(/\s+/g, '')
          obj[strParts[0].replace(/\s+/g, '')] = thisCatsObject; // Get rid of extra spaces at beginning of value strings

          //catList[catKey].color = iconColor;

        } else if (strParts[0]) { // Use cat key as title
          // Not needed since key is used as title by default. But we could capitalize.
          //let thisCatsObject = {"title", strParts[0].trim()};
          //obj[strParts[0].replace(/\s+/g, '')] = thisCatsObject;
        }
        return obj;
      }, {});
      */

      console.log("catList");
      console.log(catList);
    }
  }

  if (dp.valueColumn) { // Avoids showing "Category" twice since catergory is already in default details.
    avoidRepeating.push(dp.valueColumn);
  }
  dp.data.forEach(function(elementRaw) {
    count++;
    foundMatch = 0;
    productMatchFound = 0;
    catFound = 0;
    let filterMatchFound = true;

    if (count > 10000) {
        console.log("Count exceeds 10000");
        return;
    }
    //console.log("elementRaw:");
    //console.log(elementRaw);
    let showIt = true;
    if (hash.name && elementRaw["name"]) { // Match company name from URL to isolate as profile page.
      //console.log("elementRaw[name] " + elementRaw["name"]);
      if (hash.name.replace(/\_/g," ") == elementRaw["name"]) {
        //alert(hash["name"])
        showCount++;
      } else {
        showIt = false; // Hide others to show profile below map with all.
      }
    } 

    /*
    if (keyword == allItemsPhrase) { // Use a div argument instead
        keyword == ""; products = "";
        $("#keywordsTB").text(""); // Not working
        foundMatch++;
    } else 
    */
    
    /*
    if (products == allItemsPhrase) {
        console.log("products == allItemsPhrase")
        productMatchFound++;
    } else 
    */

    // Layer's categories are from a unique tab in a Google sheet
    if (localObject.layerCategories[dp.show] && localObject.layerCategories[dp.show].length >= 0) {
      if (elementRaw[dp.catColumn] && elementRaw[dp.catColumn] == hash.cat) {
        if (dp.subcatColumn && elementRaw[dp.subcatColumn].length <= 0) {
          subcatObject["null"].count = subcatObject["null"].count + 1;
        } else {
          // Walk the array of possible subcats for the category.
          // Since some will have multiple subcats
          // This could be performed asynchronously during second iteration of rows.

          // console.log(localObject.layerCategories[dp.show])
          $.each(localObject.layerCategories[dp.show], function(index,value) {
            //console.log("value.SubCategory: " + value.SubCategory);
            if (elementRaw[dp.subcatColumn] && elementRaw[dp.subcatColumn] == subcatObject[value.SubCategory]) {
              subcatObject[value.SubCategory].count = subcatObject[value.SubCategory].count + 1;
              //subcatObject[value.SubCategory].count = 12345;
              console.log(subcatObject[value.SubCategory]);
              //alert(subcatObject[value.Category].count)
            }
          });
        }
      }
    }

    // Filter by an object containing a set of keys and their possible values
    if (dp.filters) {
      filterMatchFound = false;
      $.each(dp.filters, function(index,value) {
        if (typeof value == 'string' && value.length >= 0) {
          //console.log("value " + value);
          let value_array = value.split(/\s*,\s*/); // Removes space when splitting possible values on comma
          for(let i = 0; i < value_array.length; i++) {
            if (value_array[i].length > 0) {
              //console.log("dp.filters key: " + index + " value " + value_array[i]);
              if (elementRaw[index] == value_array[i]) {
                //console.log("found match dp.filters key: " + index + " value " + value_array[i]);
                filterMatchFound = true;
              }
            }
          }
        }
      });

      /*
      if (elementRaw[dp.filterKeys].length > && elementRaw[dp.filterValues].length > 0) {
        if (dp.subcatColumn && elementRaw[dp.subcatColumn].length <= 0) {
          subcatObject["null"].count = subcatObject["null"].count + 1;
        } else {

          // Should we walk on the current subcatObject?
          console.log(localObject.layerCategories[dp.filterKeys])
          $.each(localObject.layerCategories[dp.show], function(index,value) {
            console.log("value.SubCategory: " + value.SubCategory);
            //console.log(subcatObject[value.SubCategory]);
            if (subcatObject[value.SubCategory] == elementRaw[dp.subcatColumn]) {
              
              subcatObject[value.SubCategory].count = subcatObject[value.SubCategory].count + 1;
              subcatObject[value.SubCategory].count = 12345;
              console.log(subcatObject[value.SubCategory]);
              //alert(subcatObject[value.Category].count)
            }
          });
        }
      }
      */

    }
    if (!filterMatchFound) {
      console.log("No filterMatchFound")
      return; // Go to next in foreach
    }

    if (hash.cat || hash.subcat || keyword.length > 0 || products_array.length > 0 || productcode_array.length > 0) {
      //console.log("keyword.length " + keyword.length);
      //console.log("products_array.length " + products_array.length);
      //console.log("productcode_array.length " + productcode_array.length);

      //consoleLog('Begin foundMatch');
      if (products_array.length > 0) { // A list from #catSearch field, typically just one
        for(var p = 0; p < products_array.length; p++) {
          if (products_array[p].length > 0) {

              // Maybe element[] needs to be available here so we know we're using lowercase.
              //console.log("elementRaw[dp.itemsColumn] " + elementRaw[dp.itemsColumn]);
              //console.log("elementRaw['Category'] " + elementRaw['Category']);
              //console.log("products_array[p].toLowerCase() " + products_array[p].toLowerCase());
              if (elementRaw[dp.itemsColumn] && elementRaw[dp.itemsColumn].toLowerCase().indexOf(products_array[p].toLowerCase()) >= 0) {
              //if (element[dp.itemsColumn] && element[dp.itemsColumn].toLowerCase().indexOf(products_array[p].toLowerCase()) >= 0) {

                productMatchFound++;

                //console.log("foundMatch: " + elementRaw[dp.itemsColumn] + " contains: " + products_array[p]);
                
              } else {
                //console.log("No Match. \"" + products_array[p] + "\" not in: " + elementRaw[dp.itemsColumn]);
              }
          }
        }
      } else {
        //productMatchFound = 1; // Matches all products
      }

      if (dataObject.geos && elementRaw[dp.countyColumn]) { // Use name of county pre-loaded into dataObject.
        //console.log('Use name of county pre-loaded');
        for(var g = 0; g < dataObject.geos.length; g++) {
          if (dataObject.geos[g][1].active == true) {
            //alert(elementRaw[dp.countyColumn])
            //alert(dataObject.geos[g][1].name)
            if(elementRaw[dp.countyColumn].toLowerCase() == dataObject.geos[g][1].name.toLowerCase()) { // If the current row matches an active county

              //alert(dataObject.geos[g][1].name); // The county name
              foundMatch++;
            }
            
          }
        }
      } else if (keyword.length > 0) {

        //console.log('Search for "' + keyword.toLowerCase().replace(/\_/g," ") + '" - Fields to search: ' + JSON.stringify(dp.search));
        
        if (typeof dp.search != "undefined") { // An object containing interface labels and names of columns to search.

          //console.log("Search in selected_col ")
          //console.log(selected_col)

          $.each(dp.search, function( key, value ) { // Works for arrays and objects. key is the index value for arrays.
            //console.log(value + " " + elementRaw[value]);
            //selected_columns_object[key] = 0;
            if (elementRaw[value]) {
              if (elementRaw[value].toString().toLowerCase().indexOf(keyword.toLowerCase().replace(/\_/g," ")) >= 0) {
                foundMatch++;
              }
            }

          });

        } else { // dp.search is not defined, so try titlecolumn
          //console.log("no dp.search, try: " + elementRaw[dp.titleColumn]);
          if (elementRaw[dp.titleColumn] && elementRaw[dp.titleColumn].toLowerCase().indexOf(keyword) >= 0) {
            //console.log("foundMatch in title");
            foundMatch++;
          }
          if (elementRaw[dp.valueColumn] && elementRaw[dp.valueColumn].toLowerCase().indexOf(keyword) >= 0) {
            //console.log("foundMatch in value");
            foundMatch++;
          }

          // MIGHT REMOVE
          if ($("#findKeywords").is(":checked") > 0 && elementRaw[dp.keywords] && elementRaw[dp.keywords].toLowerCase().indexOf(keyword) >= 0) {
            console.log("SWITCH TO SEACH OBJECT - foundMatch keywords");
            foundMatch++;
          }

        }

        //foundMatch++; // TEMP

        /*
        //if ($(dataSet[i][0].length > 0)) {
          if ($("#findCompany").is(":checked") > 0 && dataSet[i][0].toString().toLowerCase().indexOf(keyword) >= 0) {
            console.log("foundMatch A");
            foundMatch++;
          }
        //}
        if ($("#findWebsite").is(":checked") > 0 && dataSet[i][1].toString().toLowerCase().indexOf(keyword) >= 0) {
          console.log("foundMatch B");
          foundMatch++;
        }
        if ($("#findDetails").is(":checked") > 0 && dataSet[i][2].toString().toLowerCase().indexOf(keyword) >= 0) {
          console.log("foundMatch C");
          foundMatch++;
        }
        if ($("#findProduct").is(":checked") > 0 && dataSet[i][3].toString().toLowerCase().indexOf(keyword) >= 0) {
          console.log("foundMatch D");
          foundMatch++;
        }
        if ($("#findProduct").is(":checked") > 0 && dataSet[i][4].toString().toLowerCase().indexOf(keyword) >= 0) { // Description
          console.log("foundMatch E");
          foundMatch++;
        }
        */

      } else if (hash.subcat == "null") {
        console.log("Check for subcat ");
        if (elementRaw[dp.catColumn] == hash.cat && !elementRaw[dp.subcatColumn]) {
          foundMatch++; // Blank subcatgory column found.
        }
      } else if (hash.subcat) {
        // TO DO - include other filters
        //console.log("Check for subcat match for " + hash.subcat + " in " + elementRaw[dp.subcatColumn]);

        if (elementRaw[dp.subcatColumn].toLowerCase().indexOf(hash.subcat.toLowerCase()) >= 0) {
          foundMatch++; // Subcat found in Subcategory.
        }
      } else if (hash.cat) {
        console.log("Look for cat " + hash.cat + " in catColumn: " + dp.catColumn);
        if (elementRaw[dp.valueColumn] && elementRaw[dp.valueColumn].toLowerCase().indexOf(hash.cat.toLowerCase()) >= 0) {
          foundMatch++; // Cat found in Category valueColumn, which may contain multiple cats
          catFound++;
          console.log("catFound in valueColumn");
        }
        if (!foundMatch) {
          //console.log("Attempt cat search " + hash.cat.toLowerCase() + " in " + dp.catColumn);
          
          if (elementRaw[dp.catColumn]) {
            //console.log("Column exists: " + elementRaw[dp.catColumn]);
          }
          if (elementRaw[dp.catColumn] && elementRaw[dp.catColumn].toLowerCase().indexOf(hash.cat.toLowerCase()) >= 0) {
            foundMatch++; // Cat found in Category
            catFound++;
            console.log("catFound in catColumn");
          }
          // Also check for the cat in the subcat column.
          else if (elementRaw[dp.subcatColumn] && elementRaw[dp.subcatColumn].toLowerCase().indexOf(hash.cat.toLowerCase()) >= 0) {
            foundMatch++; // Cat found in Category
            catFound++;
            console.log("catFound in subcatColumn")
          }
        }
      } else {
        // PPE arrives here even with cat
        foundMatch++; // No geo or keyword filter
      }

      //console.log("foundMatch " + foundMatch)
      //if (1==2) { // Not yet tested here
        //console.log("Check if listing's product HS codes match.");
        for(var pc = 0; pc < productcode_array.length; pc++) { 
          if (productcode_array[pc].length > 0) {
            if (isInt(productcode_array[pc])) { // Int
              //var codesArray = $(this.childNodes[3]).text().replace(";",",").split(/\s*,\s*/);
              var codesArray = dataSet[i][5].toString().replace(";",",").split(/\s*,\s*/);
              for(var j = 0; j < codesArray.length; j++) {
                if (isInt(codesArray[j])) {
                  if (codesArray[j].startsWith(productcode_array[pc])) { // If columns values start with search values.
                    console.log("codesArray " + j + " " + codesArray[j] + " starts with " + productcode_array[pc]);
                  
                    console.log("foundMatch D");
                    productMatchFound++;
                    //foundMatch++;
                    //$(this).show();
                  }
                }
              }
            } else {
              console.log("productcode not int")
              // TO DO: Match the product description instead.

                //productMatchFound++;

            }
          }
        }
      //}

    } else {
      // Automatically find match since there are no filters
      //console.log("foundMatch - since no filters");
      foundMatch++;
    }

    //console.log("foundMatch: " + foundMatch + ", productMatchFound: " + productMatchFound);

    // If no subcat in URL, use all of the category's subcats to find matches.
    if (!hash.subcat && foundMatch == 0 && productMatchFound == 0 && catFound == 0) {
      if (subcatArray && subcatArray.length > 0) {
        let subcatColumn = "SubCategory";
        if (dp.subcatColumn) {
          subcatColumn = dp.subcatColumn;
        }
        if (elementRaw[subcatColumn].length > 0) {
          console.log("subcatArray");
          console.log(subcatArray);
          for (let subcat of subcatArray) {
              if (elementRaw[subcatColumn]) {
                subcat = subcat.toLowerCase();
                //console.log("Row subcategories: " + elementRaw[subcatColumn] + " - Looking for: " + subcat);
                // Do a split and trim instead
                let rowSubcats = elementRaw[subcatColumn].split(',');
                rowSubcats = rowSubcats.map(element => {return element.trim().toLowerCase();}); // Trim and lowercase all array values
                if (rowSubcats.includes(subcat)) {
                  //console.log("found cat's subcat '" + subcat + "' in Subcategory column content: " + elementRaw[subcatColumn]);
                  foundMatch++;
                }
              }
          }
        }
      }
    }
    var key, keys = Object.keys(elementRaw);
    var n = keys.length;
    var element={};
    output_details = ""; // Reuse for each row

    while (n--) {
      key = keys[n];
      element[key.toLowerCase()] = elementRaw[key];
      if (hash.details == "true") {
        if (key && elementRaw[key]) {
          if (avoidRepeating.indexOf(key.toLowerCase()) < 0) {
            output_details += "<b>" + key + "</b>: " + elementRaw[key] + "<br>";
          }
        }
      }
    }

    //iconColorRGB = hex2rgb(iconColor);
    //console.log("element state2 " + element.state + " iconColor: " + iconColor)

    // Occurs for every row
    if (dp.valueColumn && element[dp.valueColumn]) {
      // BUILD LIST OF CATEGORIES FROM COLUMN VALUES
      // Supports rows with multiple cats in a cell.  Set dp.categories instead when multiple values in cells, or to give each category a title.
      // INCREMENT THE CATEGORY COUNT for the value in the row's valueColumn
      //console.log("element[dp.valueColumn] " + element[dp.valueColumn]);

      // Split row's category's on commas.
      let rowsCatArray = element[dp.valueColumn].split(",");
      for(var i = 0 ; i < rowsCatArray.length ; i++) {
        // Reactivate and test aerospace
        //$("#" + rowsCatArray[i]).prop('checked', true);
        let catKey = rowsCatArray[i].trim(); // From element[dp.valueColumn] - Uses first value for icon color
        if(!catList[catKey]) {
          catList[catKey] = {};
          catList[catKey].count = 1;
        } else {
          catList[catKey].count++;
        }
        iconColor = dp.scale(catKey);

        if (!iconColor && dp.color) { 
          iconColor = dp.color;
        } else if (!iconColor && !dp.color) { 
          iconColor = "#777"; // Grey - for side category list
        }
        catList[catKey].color = iconColor;
      }
    }
    // BUGBUG - Is it valid to search above before making key lowercase? Should elementRaw key be made lowercase?

    if (foundMatch > 0 || productMatchFound > 0) {
      //console.log("Increment dataMatchCount. foundMatch " + foundMatch);
      dataMatchCount++;

      data_out.push(elementRaw);


      let name = element.name;
      if (element[dp.nameColumn]) {
        name = element[dp.nameColumn];
      } else if (element.title) {
        name = element.title;
      }
      name = capitalizeFirstLetter(name);
      if (dp.namePrefix) {
        name = dp.namePrefix + " " + name;
      }

      // Also repeated below, move here
      /*
      Update - Active - Show on map
      Current - Active - All info is correct - Show on map

      (Pending) - New, waiting to vet (blank). Has Timestamp, not yet reviewed and approved
      Hide - Temporarily closed
      Delete
      */
      //console.log("Status: " + element.status + ". Name: " + name)
      if (!jQuery.isEmptyObject(element.status) && element.status != "Update" && element.status != "Active") {
          if (dp.showWhenStatus != "null") { // Allow status column to be blank. Used by EV.
            foundMatch = 0;
          }
      } else {
        validRowCount++;
        //console.log("validRowCount " + validRowCount);
        //console.log("Status: " + element.status + ". Name: " + name)
      }


      /*
      // Make dp lowercase and add element.
      var key, keys = Object.keys(dp);
      var n = keys.length;
      var element={};
      while (n--) {
        key = keys[n];
        if (key != "data") { // Skip dp.data
          element[key.toLowerCase()] = dp[key];
          // BUGBUG, did I accidentally leave off second () here:
          dp[key.toLowerCase()] = dp[key].toLowerCase; // Creates some dups, but fastest that way. Lowercase values then match below
        }
      }
      */

      // Bug, this overwrote element.latitude and element.longitude
      //element = mix(dp,element); // Adds existing column names, giving priority to dp assignments made within calling page.
      
      if (element.website && !element.website.toLowerCase().includes("http")) {
        element.website = "http://" + element.website;
      }
      element.mapframe = shortenMapframe(element.virtual_tour);
      let showListing = true;
      if (element.status && !jQuery.isEmptyObject(element.status) && (element.status != "Update" && element.status != "Active")) {
          showListing = false;
          console.log("Excluded element.status " + element.status);
      }
      if (foundMatch == 0) {
        showListing = false;
      }
      if (showListing) {
        countDisplay++;
        // DETAILS LIST

        if (dp.latColumn && dp.latColumn.includes(".")) { // ToDo - add support for third level
          element[dp.latColumn] = element[dp.latColumn.split(".")[0]][dp.latColumn.split(".")[1]];
          element[dp.lonColumn] = element[dp.lonColumn.split(".")[0]][dp.lonColumn.split(".")[1]];
        }

        let bulletColor = "#E31C79"; // Hot pink
        if (dp.color) {
          bulletColor = dp.color;
        }

        // TO REACTIVATE
        
        if (dp.valueColumn && element[dp.valueColumn]) {
          let bulletColorFromColorScale = dp.scale(element[dp.valueColumn]);
          if (bulletColorFromColorScale != undefined) {
            bulletColor = bulletColorFromColorScale;
          }
        }
        
        let extraAttributes = "";
        if (element.mapframe) {
          extraAttributes += " m='" + element.mapframe + "'";
        }

        // Hide all until displayed after adding to dom
        if (element[dp.latColumn] && element[dp.lonColumn]) {
          output += "<div style='clear:both;display:none' class='detail' name='" + name.replace(/'/g,'&#39;') + "' latitude='" + element[dp.latColumn] + "' longitude='" + element[dp.lonColumn] + "'" + extraAttributes + " color='" + bulletColor + "'>";
        } else {
          output += "<div style='clear:both;display:none' class='detail' name='" + name.replace(/'/g,'&#39;') + "'" + extraAttributes + " color='" + bulletColor + "'>";
        }

        if (element.photo1) {
          //output += "<img style='width:100%;max-width:200px;float:right' src='" + element.photo1 + "'>";

          output += "<div class='listThumb' style='max-width:200px;float:right'><a href='" + element.photo1 + "'><img style='width:100%;border-radius:12px;' loading='lazy' src='" + element.photo1 + "'></a></div>";

          // unique data-id used by buildSwiperSlider to init multiple sliders.
          // Might not need id
          //Reactivete these 3 lines
          //output += "<div class='swiper-container' id='swiper" + count + "' data-id='swiper" + count + "'><div class='swiper-wrapper'><div class='swiper-slide'>";
          //output += "<img style='width:100%;max-width:800px' class='swiper-lazy' data-src='" + element.photo1 + "'>";
          //output += "</div></div></div>";
        }

        output += "<div class='showItemMenu' style='position:absolute;right:14px;top:16px'>&mldr;</div>";

        //console.log("dp.valueColumn 1 " + element[dp.valueColumn]); // Works, but many recyclers have blank Category value.
        //console.log("dp.valueColumn 3 " + element["category"]); // Lowercase required (basing on recyclers)

        output += "<div style='padding-bottom:4px;float:left'><div class='detailBullet' style='background:" + bulletColor + "'></div></div>";

        //output += "<div style='position:relative'><div style='float:left;min-width:28px;margin-top:2px'><input name='contact' type='checkbox' value='" + name + "'></div><div style='overflow:auto'><div>" + name + "</div>";
        
        output += "<div style='overflow:auto;margin-top:-7px'>";

          output += "<div class='detailTitle'>" + name + "</div>";
          if (element[dp.description]) {
            output += "<div>" + element[dp.description] + "</div>";
          } else if (element.description) {
            output += "<div>" + element.description + "</div>";
          } else if (element["business description"]) {
            output += "<div>" + element["business description"] + "</div>";
          }

          // Lower
          output += "<div style='clear:both;font-size:0.95em;line-height:1.5em'>";

          if (element.items) {
            output += "<b>Items:</b> " + element.items + "<br>";
          }
          if (element.tags) { // Farmfresh
            output += element.tags.replace(/;/g,', ') + "<br><br>";
          }
          var outaddress = "";
          if (element[dp.addressColumn]) { 
              outaddress +=  element[dp.addressColumn] + "<br>"; 
          } 
          //else // Removed use of else so farmfresh showed city, state, zip
          if (element.address || element.city || element.state || element.zip) {
            if (element.address) {
              outaddress += element.address + "<br>";
            }

            // Assumes that if sheet also has these columns, they are not in the address row. (Farmfresh)
            if (element.city) {
              outaddress += element.city;
            }
            if (element.state || element.zip) {
              outaddress += ", ";
            }
            if (element.state) {
              outaddress += element.state + " ";
            }
            if (element.zip) {
              outaddress += element.zip;
            }
            if (element.city || element.state || element.zip) {
              outaddress += "<br>";
            }
            
          }
          if (outaddress) {
            //output += "<b>Location:</b> " + outaddress; // Not using because address is on two lines.
            output += outaddress;
          }
          if (element.county) {
            output += '<b>County:</b> ' + element.county + " County<br>";
          }

          if (element.website) {
            if (element.website.length <= 50) {
              output += "<b>Website:</b> <a href='" + element.website + "' target='_blank'>" + element.website.replace("https://","").replace("http://","").replace("www.","").replace(/\/$/, "") + "</a><br>";
            } else {
              // To Do: Display domain only
              output += "<b>Website:</b> <a href='" + element.website + "' target='_blank'>" + element.website.replace("https://","").replace("http://","").replace("www.","").replace(/\/$/, "") + "</a><br>"; 
            }
          } else if (element.webpage) {
            // Switch to calling Webpage, probably add linkify above.
            output += '<b>Webpage:</b> ' + linkify(element.webpage + "<br>");
          }
          if (element.category1) {
            output += "<b>Type:</b> " + element.category1 + "<br>";
          }
          if (element.district) {
            output += "<b>District:</b> " + element.district + "<br>";
          }
          if (element.location) {
            if (isObject(element.location)) {
              // No need to display since Location is also proviced as a string in Brigade data
              //output += "<b>Location Object:</b><br>" + element.location + "<br>";
              //for (e in element.location){
              //  output += "<div>" + e + ": " + element.location[e] + "</div>";
              //}             
            } else {
              output += "<b>Location:</b> " + element.location + "<br>";
            }
          }

          let markerID = dataMatchCount;
          if (outaddress) { // Only listings with locations, for map points.

            // To do: Adjust so Google link is used when address has no latitude and longitude for map.
            if (element[dp.latColumn] && element[dp.lonColumn]) {
              shortout += "<div class='detail' markerid='" + markerID + "' name='" + name.replace(/'/g,'&#39;') + "' latitude='" + element[dp.latColumn] + "' longitude='" + element[dp.lonColumn] + "' color='" + bulletColor + "'" + extraAttributes + ">";
            } else {
              shortout += "<div class='detail' markerid='" + markerID + "' name='" + name.replace(/'/g,'&#39;') + "' color='" + bulletColor + "'" + extraAttributes + ">";
            }
            shortout += "<div class='detailTitle'>" + name + "</div>";
            if (outaddress) {
              shortout += "<div class='detailLocation'>" + outaddress + "</div>";
            }
            shortout += "</div>";
          }

          if (element.comments) {
            output += element.comments + "<br>";
          }
          if (element.availability) {
            output += element.availability + "<br>";
          }
          //output += element.name + " View Details<br>";

          if (element.phone || element.phone_afterhours) {
            if (element.phone) {
              output += "<b>Phone:</b> " + element.phone + " ";
            }
            if (element.phone_afterhours) {
             output += element.phone_afterhours;
            }
            output += "<br>";
          }

          if (element.schedule) {
            output += "<b>Hours:</b> " + element.schedule + "<br>";
          }
          if (element["jobs range"]) {
            output += "<b>Employees:</b> " + element["jobs range"] + "<br>";
          } else if (element["jobs 2021"]) {
            output += "<b>Employees:</b> " + element["jobs 2021"] + "<br>";
          }


          if (element[dp.valueColumn]) {
            if (dp.valueColumnLabel) {
              output += "<b>" + dp.valueColumnLabel + ":</b> " + element[dp.valueColumn] + "<br>";
            } else if (element[dp.valueColumn] != element.name) {
              output += element[dp.valueColumn] + "<br>";
            }
          }
          if (element["permit number"]) {
            output += "<b>Permit:</b> <a target='permit_info' href='https://github.com/GeorgiaMap/recycling/tree/main/georgia/data/counties'>" + element["permit number"] + "</a><br>";
          }
          if (element[dp.showKeys]) {
            output += "<b>" + dp.showLabels + ":</b> " + element[dp.showKeys] + "<br>";
          }

          if(output_details) {
            //output += "<br>Details:<br>" + output_details;
            output += output_details;
          }

          output += "<div style='height:10px'></div>";

          // Reactivate after distance columns removed from FarmFresh
          if (1==2 && element.distance) {
            output += "<b>Distance:</b> " + element.distance + " miles<br>";    
          }
          output += "<div class='detailLinks'>";
            if (element.mapframe) {
                output += "<a href='#show=360&name=" + name.replace(/'/g,'&#39;') + "&m=" + encodeURIComponent(element.mapframe) + "'>Birdseye View<br>";
                //console.log("encodeURIComponent " + encodeURIComponent(element.mapframe))
            }
            if (element.property_link) {
                output += "<a href='" + element.property_link + "'>Property Details</a><br>";
            }

            var googleMapLink;
            if (name.length || element.address || element.county) {
              googleMapLink = name;
              if (element.address) {
                googleMapLink += ', ' + element.address;
              }
              if (element.county) {
                googleMapLink += ', ' + element.county + ' County';
              }
              if (hash.state) {
                googleMapLink += ', ' + hash.state.split(",")[0].toUpperCase();
              }
            }
            if (googleMapLink) {
              googleMapLink = 'https://www.google.com/maps/search/' + (googleMapLink).replace(/ /g,"+");
            }
            if (googleMapLink) {
                output += '<a href="' + googleMapLink + '" target="_blank">Google Map</a>';
            }
            
            if (hash.details != "true") {
              if (hash.name) {
                output += " | <a href='" + window.location + "&details=true'>Details</a>";
              } else {
                output += " | <a href='" + window.location + "&name=" + name.replace(/ & /g,' AND ').replace(/ /g,"+") + "&details=true'>Details</a>";
              }
            }
            if (dp.editLink) {
              if (googleMapLink) {
                output += " | "
              }
              output += "<a href='" + dp.editLink + "' target='edit" + param["show"] + "'>Make Updates</a><br>";
            }
            
            if (!element.mapable == "false" && !element.county && !(element[dp.latColumn] && element[dp.lonColumn])) {
              if (!element[dp.lonColumn]) {
                output += "<span>Add latitude and longitude</span><br>";
              } else {
                output += "<span>Add address or lat/lon values</span><br>";
              }
            }

            //alert(dp.listLocation)
            if (dp.listLocation != false) {
              
              if (element[dp.latColumn]) {
                  output += "<a href='https://www.waze.com/ul?ll=" + element[dp.latColumn] + "%2C" + element[dp.lonColumn] + "&navigate=yes&zoom=17'>Waze Directions</a>";
              }
            }

            if (element.facebook) {
              if (element.facebook.toLowerCase().indexOf('facebook.com') < 0) {
                element.facebook = 'https://facebook.com/search/top/?q=' + element.facebook.replace(/'/g,'%27').replace(/ /g,'%20')
              }
              if (element[dp.latColumn] && dp.listLocation != false) {
                output += " | ";
              } else { // To do: Check if details link shown.
                output += " | ";
              }
              output += "<a href='" + element.facebook + "' target='_blank'>Facebook</a>";
            }
            if (element.twitter) {
              if (element[dp.latColumn] || element.facebook) {
                output += " | ";
              }
              output += "<a href='" + element.twitter + "' target='_blank'>Twitter</a>";
            }
            if ((element[dp.latColumn] && dp.listLocation != false) || element.facebook || element.twitter) {
              output += "<br>";
            }

            if (element.county) {
              //output += element.county + " County<br>";
            }

            if (dp.skips) {
              dp.skips = "," + dp.skips + ",";
              for (i in element) {
                if (element[i] != null && dp.skips.indexOf("," + i + ",") == -1) {
                  output += "<b>" + i + ":</b> " + element[i] + "<br>"; 
                }
              }
            }
          output += "</div>"; // detailLinks

        output += "</div>"; // End Lower
        output += "</div>"; // End overflow:auto
        output += "<div style='clear:both'></div></div>"; // Clea align:right .listThumb and end detail.
      }
    }
  });

  waitForElm('#detaillistHolder').then((elm) => {
    $("#detaillistHolder").append("<div id='detaillist'>" + output + "</div>");
    $("#detaillist").append("<div style='height:60px'></div>"); // For space behind absolute buttons at bottom.

    if (subcatObject["null"].count > 0) {
      //subcatList += "<li><a href='#' onClick='goHash({\"cat\":\"" + hash.cat + "\", \"subcat\":\"null\"}); return false;'>No subcategory (" + subcatObject["null"].count + ")</a></li>";
    }
    // At this point we don't yet know if any are null. So "no subcategory" link is appended later.
    if (subcatArray.length > 1) {
      if (!hash.name) { // Omit when looking at listing detail
        $("#dataList").prepend("<a href='#' onClick='showSubcatList(); return false;' id='viewAllCategories'>View All Categories</a>");
        $("#dataList").prepend("<ul id='subcatListUL' style='margin:0px;display:none'>" + subcatList + "</ul><br>");
        if(hash.cat){
          //Already appears above
          //$("#dataList").prepend("<h3>" + hash.cat.replace(/_/g,' ') + "</h3>");
        }
      }
    }

    if (subcatObject["null"].count > 0 && hash.subcat == "null") {
      let spreadsheetLink = "";
      if (dp.editLink) {
        if (dp.subcatColumn) {
          spreadsheetLink = " <a href='" + dp.editLink + "'>" + dp.subcatColumn + " column</a>";
        } else {
          spreadsheetLink = " <a href='" + dp.editLink + "'>Google Sheet</a>";
        }
      }
      $("#dataList").append("<b>Volunteer Project</b><br>" + subcatObject["null"].count + " " + hash.cat.toLowerCase() + " listings need a subcategory.<br><a href='/localsite/info/input/'>Contact us</a> to help update the " + spreadsheetLink + ".<br>");
      //  Volunteer
      $("#dataList").append("<br>");
    }
    console.log("Total " + dp.dataTitle + " " + countDisplay + " of " + count);

    if (hash.show != showprevious || $("#tableSide > .catList").text().length == 0) { // Prevents selected category from being overwritten.
      //alert("a catList " + catList);
      renderCatList(catList,hash.cat);
    }
    if (hash.name && $("#detaillist > [name=\""+ hash.name.replace(/_/g,' ').replace(/ AND /g,' & ') + "\"]").length) {
      let listingName = hash.name.replace(/_/g,' ').replace(/ AND /g,' & ');
      //$("#detaillist > [name=\""+ listingName.replace(/'/g,'&#39;') +"\"]").show(); // To do: check if this or next line for apostrophe in name.
      
      $("#detaillist > [name=\""+ listingName +"\"]").show();
      
      //alert("show detail for " + hash.name);
      // Clickit
      /*
      setTimeout(function(){  
        $("#detaillist > [name='"+ listingName +"']" ).trigger("click"); // Not working to show close-up map
        $("#detaillist > [name='"+ listingName +"']" ).removeClass("detailActive");
        $("#detaillist > [name='"+ listingName +"']" ).addClass("detailCurrent");
        $("#changeHublistHeight").hide(); // Since only one is being displayed
      }, 100);
      */
    } else {
      $("#detaillist .detail").show(); // Show all
      $("#changeHublistHeight").show();
    }
    //$("#detaillist > [name='"+ name.replace(/'/g,'&#39;').replace(/& /g,'AND ') +"']").show();

    //$(".sidelist").html(shortout);
    $("#listcolumnList").html(shortout);

    // Show the side columns
    if (!$("#listcolumn").is(":visible")) { // #listcolumn may already be visible if icon clicked while page is loading.
        $("#showListInBar").show();
    }
    //$("#showSideInBar").show(); // Added 2024 May 28
    $(".sidelistHolder").show();

    $('.detail').mouseenter(function(event){

      // Get the cound of the current div
      let markerID = event.target.getAttribute("markerid");

      //console.log("markerid " + markerID); // Not sure why nulls occur when moving over several rapidly.
      if (markerID !== null) {
        $("#map1 .leaflet-marker-pane svg").removeClass("activeMarker");
        $("#map1 .leaflet-marker-pane svg:nth-child(" + markerID +")").addClass("activeMarker");
      }
      // This older script can be used to change the mappoint color, but the color is not removed.
      // map is not available here
      //popMapPoint(dp, map, $(this).attr("latitude"), $(this).attr("longitude"), $(this).attr("name"), $(this).attr("color"));
    });

    var imenu = "<div style='display:none'>";
    imenu += "<div id='listingMenu' class='popMenu filterBubble'>";
    imenu += "<div>View On Map</div>";
    imenu += "<div class='localonly mock-up' style='display:none'>Supplier Impact</div>";
    imenu += "<div class='localonly mock-up' style='display:none'>Production Impact</div>";
    imenu += "<div class='localonly mock-up' style='display:none'>Add to Collections</div>";
    imenu += "<hr class='localonly mock-up' style='display:none;padding:0px !important'>";
    imenu += "<div class='localonly mock-up' style='display:none' id='showLocalNews'>Submit Updates</div>";
    imenu += "</div>";
    imenu += "</div>";
    $("body").append(imenu);

    var locmenu = "<div class='showLocMenu' style='float:right;font-size: 24px;cursor: pointer;'>…</div>";
    locmenu += "<div class='locMenu popMenu filterBubble' style='float:right;display:none'>";
    locmenu += "<div class='filterBubble greyDiv'>";
    locmenu += "<div id='hideSidemap' class='close-X' style='position:absolute;right:0px;top:8px;padding-right:10px;color:#999'>&#10005; Close Map</div>";
    locmenu += "</div>";
    locmenu += "</div>";
    //$("#sidemapbar").prepend(locmenu);

    let searchFor = "";
    if (dp.mapInfo) {
      $(".mapInfo").html(dp.mapInfo);
      $("#mapInfo").show();
    }
    if (dp.listInfo) {
      $(".listInfo").html(dp.listInfo);
      $("#listInfo").show();
    }

    let listTitle = dp.listTitle;
    //if ($("#catSearch").val() && hash.cat) {
    //  listTitle = $("#catSearch").val();
    //} else
    if (hash.cat) {
      listTitle = "Category: " + hash.cat.replace(/_/g,' ') + " <!-- In column " + dp.catColumn + " -->";
    }
    if (hash.subcat) { // Overwrite the title with the subtitle
      if (hash.subcat == "null") {
        listTitle = listTitle;
        if (dp.subcatColumn) {
          $(".listSubtitle").html("Blank column: " + dp.subcatColumn);
        } else {
          $(".listSubtitle").html("No subcategory");
        }
      } else {
        listTitle = "Category: " + hash.subcat;
      }
    }
    //listTitle = "title"; // name;

    $(".listTitle").html(listTitle); // Title is also set in naics.js
    let inactiveCount = validRowCount - countDisplay;
    if ($("#catSearch").val() || hash.cat || hash.subcat) {
      //searchFor += " - ";
    }
    if (countDisplay == validRowCount) {
      if (countDisplay == 1) {
        searchFor += countDisplay + " record ";
      } else {
        searchFor += countDisplay + " records ";
      }
      console.log("dataMatchCount: " + dataMatchCount);
      console.log("Active records: " + countDisplay);
      console.log("Rows: " + count);
    } else if (count==1) {
      searchFor += countDisplay + " active record. (" + inactiveCount + " inactive.) ";
    } else if (validRowCount > 0) { // Hide when status row is not in use.
      searchFor += countDisplay+ " active records. (" + inactiveCount  + " inactive.) ";
    } else if (countDisplay == 1) {
      searchFor += countDisplay + " record. ";
    } else {
      searchFor += countDisplay + " records. ";
    }
    // alert("showCount " + showCount); // 0 unless filtering for a profile
    //if (showCount == 1 && count - dataMatchCount > 1) {
    if (showCount != dataMatchCount && count != dataMatchCount) {
      if (showCount >= 1) {
        if (showCount > 1) {
          searchFor += " Viewing " + showCount;
        }
        //line below was here
      }
    }
    $(".listSpecs").html(searchFor);
    $(".sideListSpecs").html(searchFor);

    // We're not using "loc" yet, but it seems better than using id to avoid conflicts.
    // Remove name from hash to trigger refresh
    let viewListLink = "<br><br><a href='' onclick='return false;' class='showTopics btn btn-success'>View List</a>";
    let showAllLink = " <span class='viewAllLink' style='display:none;'><a onclick='goHash({},[\"name\",\"loc\",\"cat\",\"subcat\"]); return false;' href='#show=" + param["show"] + "'>Show All</a></span>";
    //$(".sidelistText").html(searchFor + viewListLink);

    //$("#dataList").append(showAllLink); // Maybe move elsewhere, not needed with View All button lower down.
    $("#resultsPanel").show();
    $("#dataList").show();

    if (dataMatchCount > 0) {
      $("#hublist .listTitle").show();
    } else {
      $("#hublist .listTitle").hide();
      $("#dataList").append("No match found in " + count + " records. <a href='' onclick='return clearButtonClick();'>Clear Filters</a><br>");
        
      // Remove use of dataSet? No available   " + (dataSet.length - 1) + " 
      let noMatch = "<div>No match found in records. <a href='' onclick='return clearButtonClick();'>Clear filters</a>.</div>"
      $("#nomatchText").html(noMatch);
      $("#nomatchPanel").show();
    }
    //console.log(selected_col);
    //alert(selected_columns_object[2].value)

    $(document).click(function(event) { // Hide open menus
        $('#listingMenu').hide();
        $('#locMenu').hide();
    });
  }); // end waitForElm #detaillist
  dp.data = data_out;
  return dp;
} // showList

$(document).on("click", ".showList", function(event) {
  $("#listcolumn").show();
  if ($("#navcolumn").is(":hidden")) {
    // Display showNavColumn in bar
    $("#showNavColumn").hide();
    $("#showSideInBar").show();
  }
  showListBodyMargin();
  $(".showList").hide();
  event.stopPropagation();
  event.preventDefault(); // Prevents #navcolumn from being hidden.
});
function showListBodyMargin() {
  if ($("#fullcolumn > .datascape").is(":visible")) { // When NOT embedded
    $('body').addClass('bodyLeftMarginList');
    if ($("#navcolumn").is(":visible") && $("#listcolumn").is(":visible")) {
      $('#listcolumn').removeClass('listcolumnOnly');
      $('body').addClass('bodyLeftMarginFull'); // Creates margin on left for both fixed sidetabs.
    } else if ($("#listcolumn").is(":visible")) {
      $('#listcolumn').addClass('listcolumnOnly');
      $('body').addClass('bodyLeftMarginList');
    }
  }
}

function renderCatList(catList,cat) {
  let hash = getHash();
  console.log("the catList");
  console.log(catList);
  let show = hash.show;
  if (!hash.show) {
    // hash.show might not be available when passed in on localsite.js embed link.
    // If that's so, maybe set hash.show in localsite.js to include param.show from embed link.
    show = param.show;
  }
  if ($("#mainCatList").attr("show") == show) {
    console.log("Exit renderCatList, show did not chamge. " + showprevious);
    return; // Avoid rerendering
  }
  if (catList && Object.keys(catList).length > 0) {
    let catNavSide = "<div class='all_categories'><div class='legendDot'></div>All Categories</div>";

    //console.log("Object.keys(catList)");
    //console.log(Object.keys(catList));
    console.log("localObject.layerCategories[show]");
    console.log(localObject.layerCategories[show]);

    //BUGBUG - catList already contains CatTitle at this point
    // SO THE FOLLOWING LOOP MAY NOT BE NECESSARY if we fetch from catList instead. Test with wastewater.

    // Loop through possible categories from SIC tab and append the titles to our catList object
    //alert("Cats " + localObject.layerCategories[show].length);
    if (show == "wastewater" || show == "aerospace") {
      // This would cause recyclers subcategory to appear in left legend
      for (var i = 0; i < localObject.layerCategories[show].length; i++) {
          let arrayEntry = localObject.layerCategories[show][i];
          let name = "";
          if (arrayEntry) {
            let catKey = Object.values(arrayEntry)[0];
            name = Object.keys(arrayEntry)[1]; // HACK, need to specify CatTitle instead of 1. Note that 0 returns the single digit SIC from SIC tab.
            // Until fixed, color is now #______ occurs for some
            //console.log(catKey + " - " + name + " is now " + arrayEntry[name]);
            if(catList[catKey]) {
              catList[catKey].title = arrayEntry[name];
            } else {
              // Multiple keys split by commas
              //console.log("catKey " + catKey + " Does not exist in listings for category: " + arrayEntry[name]);
            }
          }
      }
    }

    let maxCatTitleChars = 0;
    Object.keys(catList).forEach(key => {
      // The key is pulled from the first key-value pair in the row's object.
      if (key != "") {
        let catTitle = key; // Number index, starting from 0.
        // For wastewater, the value is the SIC number from the listing rows. Sometimes the SIC value is comma separated.

        // The count is the number of rows found in that category.
        // Count won't be available here if cats defined in dp.categories.
        if (dp.categories || catList[key].count) { // Hides when none. BUGBUG - need to figure out why wastewater include 1002 none.
          //console.log(catList[key].count + " Parse localObject.layerCategories[\"" + show + "\"] for " + key);

          if (localObject.layerCategories[show] && localObject.layerCategories[show][key]) {
            // For wastewater, use titles from SIC tab.
            if (catList[key].title) { // From dp.categories object
              catTitle = catList[key].title;
            } else {
              //catTitle = key; // Some are current Multiple SIC for wastewater, where no match was found due to comma list
            }
            //console.log("catTitle:" + catTitle);
            if (catTitle.length > maxCatTitleChars) {
              maxCatTitleChars = catTitle.length;
            }
          }
          catNavSide += "<div title='" + key + "'><div style='background:" + catList[key].color + ";' class='legendDot'></div><div style='overflow:hidden'>" + catTitle;
          if (catList[key].count || dp.categories) {
            // The number of occurances of the category
            if (show == "solidwaste" || show == "wastewater") {
              // Show the count
              catNavSide += "<span>&nbsp;(" + catList[key].count + ")</span>";
            } else if (catList[key].count) {
              catNavSide += "<span class='local'>&nbsp;(" + catList[key].count + ")</span>";
            }
          }
          catNavSide += "</div></div>"
        }
      }
    });
    //console.log(catNavSide)

    // Cat list gets rerendered even if the show value has not changed. Might be possible to avoid rerendering.
    $("#listLeft").html(""); // Clear
    // <div style='margin-left:10px'><b>CATEGORIES</b></div>
    $("#listLeft").append("<div id='mainCatList' class='catList' show='" + show + "'>" + catNavSide + "<br></div>");
    if (maxCatTitleChars <= 32) {
      $("#mainCatList").addClass("catListAddMargin");
    }
    let fullcolumnWidth = $('#fullcolumn').width();
    if (fullcolumnWidth > 500) {
      showNavColumn();
    }
  }
}
function capitalizeFirstLetter(str, locale=navigator.language) {
  if (!str) return "";
  return str.replace(/^\p{CWU}/u, char => char.toLocaleUpperCase(locale));
}
function linkify(inputText) { // https://stackoverflow.com/questions/37684/how-to-replace-plain-urls-with-links
  //return(inputText);
  var replacedText, replacePattern1, replacePattern2, replacePattern3;

  //URLs starting with http://, https://, or ftp://
  replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
  replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">Website</a>');

  //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
  replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">Website</a>');

  //Change email addresses to mailto:: links.
  //replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
  //replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
  // https://outlook.office365.com/owa/calendar/WhitfieldVaccineSchedule@gets.onmicrosoft.com/bookings/

  return replacedText;
}
function popMapPoint(dp, map, latitude, longitude, name, color) {
  // Place large icon on map
  //color = "#666"; // Override incoming
  if (!latitude || !longitude) {
    console.log("No latitude or longitude for " + name)
    return;
  }
  console.log("popMapPoint on " + map + " for: " + name);

  // TODO: Remove prior red highlighted markers

  // Add a single map point
  var iconColor, iconColorRGB, iconName;

  // Add this to g and double width
  // transform: scale(2);

  iconColorRGB = hex2rgb(color);
  iconName = dp.iconName;
  var busIcon = L.IconMaterial.icon({
    icon: iconName,            // Name of Material icon - star
    iconColor: '#fff',         // Material icon color (could be rgba, hex, html name...)
    markerColor: 'rgba(' + iconColorRGB + ',0.7)',  // Marker fill color
    outlineColor: 'rgba(' + iconColorRGB + ',0.7)', // Marker outline color
    outlineWidth: 1,                   // Marker outline width 
  })

  //dp.group2.clearLayers();

  // Attach the icon to the marker and add to the map
  //dp.group2 = 

  // To do: Make this point clickable. Associate popup somehow. OR allow click to pass through to mappoint below.
  // Currently appears on map1
  circle = L.marker([latitude,longitude], {icon: busIcon}).addTo(map)

  // Temp - shows name only
  circle.bindPopup(name + " &nbsp;");

  // TO DO - send in output or other
  //circle.bindPopup(L.popup({paddingTopLeft:[200,200]}).setContent(output));
  //console.log("what2");

  //var markerGroup = L.layerGroup().addTo(map);
  //L.marker([latitude,longitude]).addTo(markerGroup);

  // Didn't work here
  /*
  if (dp.markerType == "google") {
      if (location.host == 'georgia.org' || location.host == 'www.georgia.org') {
        circle = L.marker([element[dp.latColumn], element[dp.lonColumn]]).addTo(dp.group);
      } else {
        // If this line returns an error, try setting dp1.latColumn and dp1.latColumn to the names of your latitude and longitude columns.
        circle = L.marker([latitude,longitude], {icon: busIcon}).addTo(dp.group); // Works, but not in Drupal site.
      }
  } else {
    circle = L.circle([element[dp.latColumn], element[dp.lonColumn]], {
              color: colorScale(element[dp.valueColumn]),
              fillColor: colorScale(element[dp.valueColumn]),
              fillOpacity: 1,
              radius: markerRadius(1,map) // was 50.  Aiming for 1 to 10
          }).addTo(dp.group);
  }
  */
}
function centerMapPoint(map, latitude, longitude) {
  let center = [latitude,longitude];
  //let zoom = map.getZoom();
  // Need to adjust centering by how much of map is visible.
  map.setView(center);
}
function zoomMapPoint(dp, map, latitude, longitude, name, color) {
  // Place large icon on side map and zoom
  if (!latitude || !longitude) {
    console.log("No latitude or longitude for " + name)
    return;
  }
  console.log("zoomMapPoint for: " + name);

  let center = [latitude,longitude];

  // BUGBUG - causes map point on other map to temporarily disappear.
  //map.flyTo(center, 15); // 19 in lake

  // Because flyTo causes points on other map to disappear
  // TODO IMPORTANT: Reactivate this for some clicks, but not rollover.
  map.setView(center, 11);

  // Add a single map point - RED, uses a star Google Material Icon
  var iconColor, iconColorRGB, iconName;
  //var colorScale = dp.scale;

  iconColorRGB = hex2rgb(color);
  iconName = dp.iconName;
  /*
  var busIcon = L.IconMaterial.icon({
    icon: iconName,            // Name of Material icon - star
    iconColor: '#fff',         // Material icon color (could be rgba, hex, html name...)
    markerColor: 'rgba(' + iconColorRGB + ',0.7)',  // Marker fill color
    outlineColor: 'rgba(' + iconColorRGB + ',0.7)', // Marker outline color
    outlineWidth: 1,                   // Marker outline width 
  })
  */
  //dp.group2.clearLayers();

  // Attach the icon to the marker and add to the map
  //dp.group2 = 

  // To do: Make this point clickable. Associate popup somehow.
  //circle = L.marker([latitude,longitude], {icon: busIcon}).addTo(map)
  //circle.bindPopup(name + " &nbsp;");

  //var markerGroup = L.layerGroup().addTo(map);
  //L.marker([latitude,longitude]).addTo(markerGroup);

  // Didn't work here
  /*
  if (dp.markerType == "google") {
      if (location.host == 'georgia.org' || location.host == 'www.georgia.org') {
        circle = L.marker([element[dp.latColumn], element[dp.lonColumn]]).addTo(dp.group);
      } else {
        // If this line returns an error, try setting dp1.latColumn and dp1.latColumn to the names of your latitude and longitude columns.
        circle = L.marker([latitude,longitude], {icon: busIcon}).addTo(dp.group); // Works, but not in Drupal site.
      }
  } else {
    circle = L.circle([element[dp.latColumn], element[dp.lonColumn]], {
              color: colorScale(element[dp.valueColumn]),
              fillColor: colorScale(element[dp.valueColumn]),
              fillOpacity: 1,
              radius: markerRadius(1,map) // was 50.  Aiming for 1 to 10
          }).addTo(dp.group);
  }

  if (param["initial"] == "response") {
    if (dp.public == "Yes") {
      $(".suppliers_pre_message").hide();
    } else {
      //alert(dp.public)
      $(".suppliers_pre_message").show();
    }
  }
  */
}

// Scales: http://d3indepth.com/scales/
function getScale(data, scaleType, valueCol) {
  console.log("getScale scaleType: " + scaleType + " for data valueCol: " + valueCol + " with data.length: " + data.length)
  //console.log(data);
  var scale;
  if (scaleType === "scaleThreshold") { // Not Usable, cream too light, 
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
      .domain(data.map(function(d) { return d[valueCol]; }))
      .range(d3.schemePaired);
      console.log("d3.schemePaired");
      console.log(d3.schemePaired);
  } else {
      //alert("scaleType not recognized " + scaleType);
      scale = d3.scaleOrdinal()
      .domain(data.map(function(d) { return d[valueCol]; }))
      .range(d3.schemePaired);
      console.log("d3.schemePaired");
      console.log(d3.schemePaired);
  }
  //console.log(scale.range);
  return scale;
}

// For pipe separated
function readData(selector, delimiter, columnsNum, valueCol) {
  var psv = d3.dsvFormat(delimiter);
  var initialData = psv.parse(removeWhiteSpaces(d3.select(selector).text())); 
  _data = initialData.filter(function(e) { return e[valueCol].length !== 0; });
  console.log("Skipped: " + (initialData.length - _data.length) + " rows.");
  
  if (typeof columnsNum !== "undefined") {
    _data.forEach( function (row) {
      convertToNumber(row, columnsNum);
    });
  }
  //console.log(_data);
  return _data;
}
function readJsonData(_data, columnsNum, valueCol) {

  //console.log("_data")
  //console.log(_data)
  //return _data;



  // Not needed. Since it's json, first array (row) may not have the same quantity as next ones.
  /*
  var col = [];
   for (var i = 0; i < _data.length; i++) {
        for (var key in _data[i]) {
            if (col.indexOf(key) === -1) {
                col.push(key);
            }
        }
    }
  */

  /*
  // Convert numbers to number. Works, but we might not need
    for (var i = 0; i < _data.length; i++) {
      console.log("TTTTEEESSSTTT");
      console.log(_data[i]);
      //for (var j = 0; j < _data[i].length; j++) {
      for (j in _data[i] ) { // For each key in object containing the row's key-value pairs
        //console.log("TTTT3 " + j);
        //for (d in _data[i][j] ) {

        //for (var key in _data[i]) {
          //row = removeWhiteSpaces(row);
          //convertToNumber(row, columnsNum);
          //console.log(_data[i][j]);
          if (isNumeric(_data[i][j])) {
            _data[i][j] = +_data[i][j]; // convert number strings to number
          }
        //}
      }
    };
  */
  return _data;
  
}
function isNumeric(str) {
  if (typeof str != "string") return false // we only process strings!  
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
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

function removeWhiteSpaces (str) {
  return str.replace(/^\s+|\s+$|\s+(?=\s)/g, "");
}


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


// FIXED MAP POSITION ON SCROLL
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


 // Anchors corresponding to menu items

/*
var scrollItems = menuItems.map(function(){
   var item = $($(this).attr("href"));
    if (item.length) { return item; }
});
var topMenuHeight = 150;
*/

var mapFixed = false;
var previousScrollTop = $(window).scrollTop();
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
          $('#local-header').show();
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
          $('#local-header').show();
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

$(document).on("click", "#iZoomButton", function(event) {
  $( "#iZoom" ).prop("checked", !$( "#iZoom" ).prop("checked")); // Toggle on/off
  if ($('#iZoom').is(':checked')) {
    $('#iframeCover').hide();
    $('.showIframeCover').show();
  } else {
    $('#iframeCover').show();
    $('.showIframeCover').hide();
  }
  event.stopPropagation();
});

$(document).on("click", "#changeHublistHeight", function(event) {
  $("#hublist").addClass("hublistFull");
  $("#changeHublistHeight").hide();
});

function calculateDistance(lat1, lon1, lat2, lon2, unit) {
  var radlat1 = Math.PI * lat1/180
  var radlat2 = Math.PI * lat2/180
  //var radlon1 = Math.PI * lon1/180
  //var radlon2 = Math.PI * lon2/180
  var theta = lon1-lon2
  var radtheta = Math.PI * theta/180
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist)
  dist = dist * 180/Math.PI
  dist = dist * 60 * 1.1515
  if (unit=="K") { dist = dist * 1.609344 } // Kilometers
  if (unit=="N") { dist = dist * 0.8684 } // Nautical miles
  return dist
}
$(window).resize(function() {
  $("#filterbaroffset").height($("#filterFieldsHolder").height() + "px");
});

//////////////////
// CHOROPLETH MAP

/*
function styleShape(feature) {
    // Called for each topojson row
    // console.log("feature.properties.COUNTYFP: " + feature.properties.COUNTYFP);
    var fillColor = '#ff0000';
    
    // Hack - because region1 did not work like in did in maps/poverty
    dp.data.forEach(function(datarow) { // For each county row from the region lookup table
      if (datarow.county_num == feature.properties.COUNTYFP) {
        //fillColor = color(datarow.io_region);
      }
    })
    return {
        weight: 1,
        opacity: .5,
        color: fillColor, // '#ccc', // 'white'
        //dashArray: '3',
        fillOpacity: 0.7,
        fillColor: fillColor
    };
    
}
*/

// DISPLAY geomap - first of three maps

var overlays = {};
var overlays1 = {};
var overlays2 = {};

//Tyring, might be necessary to be outside loadDataset for .detail click. Test it inside.
let map1 = {};
let map2 = {};
let priorLayer;
function loadDataset(whichmap,whichmap2,dp,basemaps1,basemaps2,attempts,callback) {
  let hash = getHash();
  loadScript(theroot + 'js/d3.v5.min.js', function(results) { // Used by customD3loaded below

  // Pre-load Asynhronously the first time.
  /*
  loadScript(theroot + 'js/leaflet.js', function(results) {
    loadScript(theroot + 'js/leaflet.icon-material.js', function(results) {}); // Required leaflet.js, else: L is not defined
  });
  loadMapFiltersJS(theroot,1); 
  */

  // Calls processOutput after fetching data from Google Sheet. processOutput calls showList.

  if (attempts > 40) {
    console.log("loadDataset attempts exceed 40.");
    return;
  }

  console.log("TO DO - place prior dataset in object within processOutput() to avoid reloading")

  let stateAllowed = true;

  if (dp.datastates && hash.state) {

    let theState = hash.state.split(",")[0].toUpperCase();
    if (Array.isArray(dp.datastates) && !dp.datastates.includes(theState)) {

      stateAllowed = false;
      console.log("State of " + theState + " not in dp.datastates indicated for " + hash.show);
      // Avoiding so user can retain show and switch to another state.
      //updateHash({'show':''}); // Remove from URL hash without invoking hashChanged event.
      // TO DO: Show message: "State does not have data for " + hash.show;

      hideDirectoryDivs(hash.show);

      // Might not need these now that hideDirectoryDivs() added
      $("#list_main").hide();
      $("#navcolumnTitle").hide();
      $("#listLeft").hide();
      $("#map1").hide();

      return;
    }
  }

  if (dp.dataset && stateAllowed && (dp.dataset.toLowerCase().includes(".json") || dp.datatype === "json")) { // To Do: only check that it ends with .json
    // Cameraready uses .json from file synced to Gitub.
    if (dp.headerAuth) {
      //dp.headerAuth = $.parseJSON(dp.headerAuth); // TO DO: Add object below
      $.ajaxSetup({
          headers : {
            'Authorization' : 'Bearer 204ad15687571d9c62bdfa780526b1514c090f68'
          }
      });
    }
    $.getJSON(dp.dataset, function (data) {
      dp.data = readJsonData(data, dp.numColumns, dp.valueColumn);
      processOutput(dp,map1,map2,whichmap,whichmap2,basemaps1,basemaps2,function(results){
        callback(); // Triggers initialHighlight()
        return;
      });
    });
  } else if (dp.dataset) {
    loadScript(theroot + 'js/d3.v5.min.js', function(results) {
    waitForVariable('customD3loaded', function() {
    d3.csv(dp.dataset).then(function(data) { // One row per line
        consoleLog("dataset loaded");
        clearListDisplay();
        //console.log("To do: store data in browser to avoid repeat loading from CSV.");

        //dp.data = makeRowValuesNumeric(data, dp.numColumns, dp.valueColumn);
        dp.data = data;
      
        // Make element key always lowercase
        //dp.data_lowercase_key;

        // TO DO - Need to verify this is needed, and where.
        // Convert all keys to lowercase
        /*
        // THIS BREAKS FARMFRESH, was never deployed, keys are already entered as lowercase
        for (var i = 0, l = dp.data.length; i < l; i++) {
          var key, keys = Object.keys(dp.data[i]);
          var n = keys.length;
          //var newobj={}
          dp.data[i] = {};
          while (n--) {
            key = keys[n];
            //if (key.toLowerCase() != key) {
              dp.data[i][key.toLowerCase()] = dp.data[i][key];
              //dp.data[i][key] = null;
            //}
          }
          //console.log("TEST dp.data[i]");
          //console.log(dp.data[i]);
        }
        */
        // For both maps:
        processOutput(dp,map1,map2,whichmap,whichmap2,basemaps1,basemaps2,function(results){});
    });
    });
    });
  } else if (dp.googleCSV) {
    if (!onlineApp) {
      alert("onlineApp=false in localsite.js so not pulling from Google Sheet")
      return;
    }
    loadScript(theroot + 'js/d3.v5.min.js', function(results) {
    waitForVariable('customD3loaded', function() {
    consoleLog("Google data requested " + dp.googleCSV);
    //dp.googleCSV = "DISABLEX"
    d3.csv(dp.googleCSV).then(function(data,error) { // One element containing all rows from spreadsheet

      consoleLog("Google data loaded");
      // LOAD GOOGLE SHEET
        //dp.data = makeRowValuesNumeric(data, dp.numColumns, dp.valueColumn);
        dp.data = data;
        if (dp.googleCategories) {            
          d3.csv(dp.googleCategories).then(function(data) {

            // BUGBUG
            // Seems to be an array of object, then arrays (key value pairs where the value is an object containing count and color)
            //console.log(data);

            //BUGBUG - commas need to be split for wastewater before here.
            // TO DO Loop through data and check for commas:
            for (let i = 0; i < data.length; i++) {
              //console.log("Are we reaching hear with wastewater?");
              if (data[i]) {
                  //console.log("data.key: ");
                  //console.log(data[i]);
              }
            }

            // LOAD CATEGORIES TAB - Category, SubCategory, SubCategoryLong
            //localObject.layerCategories[dp.show] = makeRowValuesNumeric(data, dp.numColumns, dp.valueColumn);
            
            // The category look up, not the actual counts.
            localObject.layerCategories[dp.show] = data;

            console.log("FOR CATEGORIES NAV - Some may not be used")
            console.log(localObject.layerCategories[dp.show]); // Include color for mappoint at this point.
            processOutput(dp,map1,map2,whichmap,whichmap2,basemaps1,basemaps2,function(results){});
          });
        } else {
          processOutput(dp,map1,map2,whichmap,whichmap2,basemaps1,basemaps2,function(results){});
        }
    }, function(error, rows) {
        consoleLog("ERROR fetching google sheet. " + error);
        // if not 404, try again here after .5 second settimeout. Display status in browser.

        setTimeout(function() {
          attempts = attempts + 1;
          loadDataset(whichmap,whichmap2,dp,basemaps1,basemaps2,attempts,callback);
        }, 500);
    });
    });
    });
  }
  });
} // end function loadDataset

// Move after processOutput once done creating
function renderMap(dp,map,whichmap,parentDiv,basemaps,zoom,markerType,callback) {
  //alert("renderMap " + whichmap);
  waitForElm('#' + parentDiv + ' #' + whichmap).then((elm) => { // Didn't help with map refresh.
  let hash = $.extend(true, {}, getHash());
  if (whichmap == "map1") {
    if (hash.name) { // Viewing a listing so top map becomes a header.
      $('#' + whichmap).height("250px");
    } else {
      $('#' + whichmap).height("85vh");
    }
  }
  $('#' + whichmap).show();
  let mapDiv = "#" + whichmap;
  if (parentDiv) {
    mapDiv = "#" + parentDiv + " #" + whichmap;
  }
  
  let dataTitle = dp.dataTitle;
  if (hash.subcat) {
    dataTitle = hash.subcat;
  } else if (hash.cat) {
    dataTitle = hash.cat;
  }
  if (!dataTitle) {dataTitle = dp.listTitle;}
  let mapCenter = [32.16,-82.9]; // A center is needed, or error will occur when first using flyTo.
  if (dp.latitude && dp.longitude) {
      mapCenter = [dp.latitude,dp.longitude];
  }
  if (!zoom && dp.zoom) {
    zoom = dp.zoom
  }

  if (!basemaps) {
    basemaps = {
      //'Grayscale' : L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr}),
      'Grayscale' : L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            maxZoom: 18, attribution: '<a href="https://neighborhood.org">Neighborhood.org</a> | <a href="http://openstreetmap.org">OpenStreetMap</a> | <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
      }),
      'Satellite' : L.tileLayer(mbUrl, {maxZoom: 25, id: 'mapbox.satellite', attribution: mbAttr}),
      //'Streets' : L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: mbAttr}),
      'OpenStreetMap' : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19, attribution: '<a href="https://neighborhood.org">Neighborhood.org</a> | <a href="http://openstreetmap.org">OpenStreetMap</a> | <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
      }),
      
    }
  }

  //overlays[dataTitle] = dp.group2; Added a dup checkbox
  //console.log(whichmap + " length: " + $(mapDiv).length);
  if($(mapDiv).text().trim().length > 1) {
    console.log("Existing map found, center it. (Map point refresh needed.) " + whichmap);
    if (whichmap=="map1") {
      map = map1;
      overlays = overlays1;
    } else {
      map = map2;
      overlays = overlays2;
    } 
    consoleLog(mapDiv + " div found. Length: " + $(mapDiv).text().trim().length);
    //map = document.querySelector(mapDiv)._leaflet_map; // Recall existing map. Didn't work. Declared map1 and map2 externally instead.
    //alert("typeof map: " + typeof map);

    map.setView(mapCenter,zoom);

    let layerGroup = L.layerGroup();
    addIcons(dp,map,whichmap,layerGroup,zoom,markerType); // Adds to both map1 and map2

  } else {
    consoleLog("Initiate map " + mapDiv + " ");
    overlays = { // This is universally available for both map1 and map2.
      'Rail' : L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
            minZoom: 2, maxZoom: 19, tileSize: 256, attribution: '<a href="https://www.openrailwaymap.org/">OpenRailwayMap</a>'
        }),
    };
    //var containerExists = L.DomUtil.get(map); // NOT NEEDED

    // https://help.openstreetmap.org/questions/12935/error-map-container-is-already-initialized
    // if(container != null){ container._leaflet_id = null; }

    //if (containerExists == null) { // NOT NEEDED - need to detect L.map
      // Runagain was here

      // Error: Map container not found.
      // This can be deleted since return occurs above.
      map = L.map(whichmap, { // var --> Map container is already initialized.
        center: mapCenter,
        scrollWheelZoom: false,
        zoom: zoom,
        dragging: !L.Browser.mobile, 
        tap: !L.Browser.mobile
      });
      layerControls[whichmap] = L.control.layers(basemaps, overlays, {position: 'bottomleft'}).addTo(map); // Init layer checkboxes (add checkbox later)
      if (onlineApp) {
        if (whichmap == "map2") {
          basemaps["OpenStreetMap"].addTo(map);
        } else {
          basemaps["Grayscale"].addTo(map); // Set the initial baselayer.
        }
      } else {
        $(".mapLoadingIcon").hide();
      }
      console.log("layerControls[whichmap]");
      console.log(layerControls[whichmap]);
      $("#" + whichmap).append('<div class="dragHandle"><i class="material-icons show-on-load" style="font-size:30px;line-height:17px;font-weight:100;pointer-events:none">&#xE25D;</i></div>');
    //}
  }
  
  map.on('click', function() {
    //Toggle scrollwheel zoom - Click to activate zooming with mousewheel.
    if (this.scrollWheelZoom.enabled()) {
      this.scrollWheelZoom.disable();
    }
    else {
      this.scrollWheelZoom.enable();
    }
  })


  // ADD BACKGROUND BASEMAP
  /*
  if (layerControls[whichmap] == undefined) {
    alert("layerControls undefined")
    layerControls[whichmap] = L.control.layers(basemaps, overlays).addTo(map); // Init layer checkboxes
    basemaps["Grayscale"].addTo(map); // Set the initial baselayer.  OpenStreetMap
  } else {
    // Move up
    //layerControls[whichmap].addOverlay(layerGroup, dataTitle); // Add layer checkbox
  }
  */

  let layerGroup = L.layerGroup(); // Was dp.group2

  // ADD BACKGROUND BASEMAP to Side Map
  if (layerControls[whichmap] == undefined) {
    /* REACTIVATE THIS, BUT USE ONE FUNCTION FOR BOTH map1 and map2
    layerControls[whichmap2] = L.control.layers(basemaps2, overlays2).addTo(map2); // Init layer checkboxes
    if (location.host.indexOf('localhost') >= 0) {
      // OpenStreetMap tiles stopped working on localhost in March of 2022. Using Grayscale locally for small map instead.
      // "Access denied. See https://operations.osmfoundation.org/policies/tiles/"
      //basemaps2["Grayscale"].addTo(map2); // Set the initial baselayer.
      basemaps2["OpenStreetMap"].addTo(map2); // Set the initial baselayer. // Working as of June 2022.
    } else {
      basemaps2["OpenStreetMap"].addTo(map2); // Set the initial baselayer.
    }
    */
  } else {

    if (priorLayer && overlays[priorLayer]) {
      //alert("found overlay " + whichmap)
      // This removed checkbox entirely from second map, but mappoints were still there.
      //layerControls[whichmap].removeLayer(overlays["Georgia Solid Waste (2023)"])

      // Partially works! - Unchecked on second map.
      //map.removeLayer(overlays[priorLayer]); // Remove overlay but not checkbox. 

      // Only map1 is getting updated.
      map1.removeLayer(overlays1[priorLayer]);
      map2.removeLayer(overlays2[priorLayer]);
    }
    //alert("addOverlay - typeof overlays[dataTitle] " + typeof overlays[dataTitle])

    if (typeof overlays[dataTitle] != "object") { // Prevent adding duplicate checkbox
      
    }
    //map.addOverlay(layerGroup, dataTitle);

    
      // WHAT'S HAPPENING
      // Assuming this gets pointed at just the second map.
      // Then the above removeLayer only works with (unchecks) the second map.
      //console.log("layerGroup");
      //console.log(layerGroup); // Object contains HTML, including leaflet-popup-text.
      
      if (typeof overlays[dataTitle] != "object") { // Prevent adding duplicate checkbox
        layerControls[whichmap].addOverlay(layerGroup, dataTitle); // Add layer checkbox - works
        addIcons(dp,map,whichmap,layerGroup,zoom,markerType); // Adds to both map1 and map2
        overlays[dataTitle] = layerGroup; // Available to both map1 and map2
      } else {
        //alert("TODO: highlight mappoint here for existing maps")

        console.log("TO DO: Use the name to fetch the lat and lon from div.")
        //centerMap(element[dp.latColumn], element[dp.lonColumn], name, map, whichmap);
      }
      if (overlays) {
        // Checks the box, which displays the layer. (Basically boxes and icons are ready at this point.)
        map.addLayer(overlays[dataTitle]);
      }

  }

  if (dp.showLegend != false) {
    //alert("addLegend")
    //addLegend(map, dp.scale, dp.scaleType, dp.name); // Too big and d3-legend.js file is not available in embed, despite 
  }

  // ADD ICONS TO MAP
  // All layers reside in dataParameters object:
  //console.log("dataParameters:");
  //console.log(dataParameters);

  // Didn't help to refresh, placed below instead
  //if (document.querySelector(mapDiv)._leaflet_map) {
  //  document.querySelector(mapDiv)._leaflet_map.invalidateSize(); // Refresh map tiles.
  //}

  if (whichmap=="map1") {
    map1 = map;
    overlays1[dataTitle] = layerGroup; // Seems hacky, but the layerGroup points at specific map.  Otherwise map2 (the most recent) would be the only one pointed to.
    map1.invalidateSize(); // Refresh map tiles.
  } else {
    map2 = map;
    overlays2[dataTitle] = layerGroup;
    priorLayer = dataTitle; // Only change after map2
    map2.invalidateSize(); // Refresh map tiles.
  } 
  
  }); // waitForElm
}

function processOutput(dp,map1,map2,whichmap,whichmap2,basemaps1,basemaps2,callback) {
  consoleLog("processOutput");

  if (typeof map1 === 'undefined' || !map1.length) {
    console.log("processOutput: map1 not yet defined or populated. We'll render with renderMap()"); // Ok, so let's define it with renderMap below.
  }
  
  let dataTitle = dp.dataTitle;
  if (!dp.dataTitle) {dataTitle = dp.listTitle;}

  // getScale uses D3. Loading from .json does not require D3, but Google and .CSV have already loaded it.
  //loadScript(theroot + 'js/d3.v5.min.js', function(results) { // NOT HELPING for colorscale, REMOVE AND REACTIVATE THE FOLLOWING
  //  waitForVariable('customD3loaded', function() { // NOT HELPING for colorscale,


      dp.iconName = 'star';
      dp.scale = getScale(dp.data, dp.scaleType, dp.valueColumn);

      console.log("dp.scale")
      console.log(dp.scale)

      //dataParameters.push(dp);

      clearListDisplay();

      // RENDER THE LIST - from dp.data
      $("#widgetTitle").text(dataTitle);  
      dp = showList(dp,map1); // Reduces list based on filters

  //  }); 
  //}); 

  /*
  includeCSS3(theroot + 'css/leaflet.css',theroot);
  loadScript(theroot + 'js/leaflet.js', function(results) {
    waitForVariable('L', function() {
      console.log("Got L")

    });
  });
  */

  let showMap = true; 
    if (showMap) { // Async loading of map while showList proceeds
      includeCSS3(theroot + 'css/leaflet.css',theroot);
      loadScript(theroot + 'js/d3.v5.min.js', function(results) { // BUG - change so map-filters.js does not require this on it's load
      loadScript(theroot + 'js/leaflet.js', function(results) {
      waitForVariable('L', function() {
        loadScript(theroot + 'js/leaflet.icon-material.js', function(results) { // Does not get used (in time?) for L.IconMaterial. Had to wrap map.js load in localsite.js instead.

          loadMapFiltersJS(theroot,1); // Loads map-filters.js.  Uses local_app library in localsite.js for community_data_root
          
          //FROM PROCESS OUTPUT

          dp.group = L.layerGroup();
          //dp.group2 = L.layerGroup();

          let zoomLevel1 = 7;
          if (dp.zoom) zoomLevel1 = dp.zoom;
          let zoomLevel2 = 7;

          //console.log("call renderMap")
          //console.log(dp.data);
          renderMap(dp,map1,"map1","datascape",null,zoomLevel1,"google");

          waitForElm('#datascape #map2').then((elm) => {
            $("#sidemapCard").show();
            $("#list_main").show();
            $("#tableSide").show();
            renderMap(dp,map2,"map2","datascape",null,zoomLevel2,"");
          });

      });
    }); // L avaialable for leaflet.icon-material.js
    });
    });
  } // showmap = true
}




/////////////////////////////////////////
// map helper functions
/////////////////////////////////////////
function addLegend(map, scale, scaleType, title) {
  /*
  $("#allLegends").text(""); // Clear prior results
  var svg = d3.select("#allLegends")
    .append("div")
      .attr("class", "legend "  + title)
    .append("svg")
      .style("width", 200);
      // .styleX("height", 300)

  svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(20,20)");


  var legend = d3.legendColor()
    .labelFormat(d3.format(".2f"))
    .title(title);

  if (scaleType === "scaleThreshold") {
    legend = legend.labels(d3.legendHelpers.thresholdLabels);
  }

  legend.scale(scale);  

  svg.select("g.legend")
    .call(legend);

  //alert($(".legendCells .cell").length)
  $("#legendHolder").height(80 + $(".legendCells .cell").length * 19);
  */

  // Source: https://leafletjs.com/examples/choropleth/
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 10, 20, 50, 100, 200, 500, 1000],
          labels = [];

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
  };

  legend.addTo(map);


}
function getColor(d) {
    return d > 1000 ? '#800026' :
           d > 500  ? '#BD0026' :
           d > 200  ? '#E31A1C' :
           d > 100  ? '#FC4E2A' :
           d > 50   ? '#FD8D3C' :
           d > 20   ? '#FEB24C' :
           d > 10   ? '#FED976' :
                      '#FFEDA0';
}

function hex2rgb(hex) {
  // long version
  r = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (r) {
    return r.slice(1,4).map(function(x) { return parseInt(x, 16); });
  }
  // short version
  r = hex.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  if (r) {
    return r.slice(1,4).map(function(x) { return 0x11 * parseInt(x, 16); });
  }
  return null;
}

function addIcons(dp,map,whichmap,layerGroup,zoom,markerType) {  // layerGroup replaced use of dp.group and dp.group2
  var circle;
  var iconColor, iconColorRGB, iconName;

  let hash = getHash();
  let uniqueID = 0;
  let radius = markerRadius(zoom,map);
  let currentName;
  if (hash.name) {
    currentName = hash.name.replace(/_/g,' ').replace(/ AND /g,' & ');
  }
  console.log(whichmap + " addIcons dp.color " + dp.color);
  loadScript(theroot + 'js/leaflet.icon-material.js', function(results) { // Might not get used (in time?) for L.IconMaterial. Previously, had to wrap map.js load in localsite.js instead.
  waitForVariable('leafletIconLoaded', function() {
    dp.data.forEach(function(element) {
      uniqueID++;
      // Add a lowercase instance of each column name
      var key, keys = Object.keys(element);
      var n = keys.length;
      //var element={};
      while (n--) {
        key = keys[n];
        element[key.toLowerCase()] = element[key];
      }

      let name = element.name;
      if (element[dp.nameColumn]) {
        name = element[dp.nameColumn];
      } else if (element.title) {
        name = element.title;
      }

      if (dp.colorColumn) {
        iconColor = dp.scale(element[dp.colorColumn]);
      } else if (dp.valueColumn) {
        // If the valueColumn = type, the item column may be filtered. For PPE the item contains multiple types.

        //console.log("dp.valueColumn: " + dp.valueColumn);
        //console.log("dp.valueColumn value valueColumn: " + element[dp.valueColumn]);
        //console.log("dp.valueColumn value 'Type' column: " + element["type"]); // Had to be lowercase for farmfresh
        //console.log("dp.valueColumn value Category: " + element["Category"]);
        
        // A function that returns colors based on the categories in the Values column
        iconColor = dp.scale(element[dp.valueColumn]);

      } else if (dp.color) {
        iconColor = dp.color;
      } else {
        iconColor = "#548d1a"; // Green. Was "blue"
      }
      
      //console.log("element[dp.valueColumn] " + element[dp.valueColumn] + " iconColor: " + iconColor + " dp.valueColumn: " + dp.valueColumn + " " + name);
      
      if (typeof dp.latColumn == "undefined") {
        dp.latColumn = "latitude";
      }
      if (typeof dp.lonColumn == "undefined") {
        dp.lonColumn = "longitude";
      }

      //console.log("iconColor: " + iconColor);
      //console.log("---");
      iconColorRGB = hex2rgb(iconColor);
      iconName = dp.iconName;
      if (typeof L === 'undefined') {
        if (location.host.indexOf('localhost') >= 0) {
          alert("localhost Alert: Leaflet L not yet loaded");
        } else {
          console.log("Leaflet L not yet loaded");
        }
      } else if (typeof L.IconMaterial === 'undefined') {
        if (location.host.indexOf('localhost') >= 0) {
          console.log("ALERT Leaflet L.IconMaterial undefined = leaflet.icon-material.js not loaded");
        } else {
          console.log("Leaflet L.IconMaterial undefined = leaflet.icon-material.js not loaded");
        }
      }

      if (dp.latColumn.includes(".")) { // ToDo - add support for third level
        element[dp.latColumn] = element[dp.latColumn.split(".")[0]][dp.latColumn.split(".")[1]];
        element[dp.lonColumn] = element[dp.lonColumn.split(".")[0]][dp.lonColumn.split(".")[1]];
      }
      if (!element[dp.latColumn] || !element[dp.lonColumn]) {
        console.log("Missing lat/lon: " + name + ". For columns: " + dp.latColumn + " and " + dp.lonColumn);
        return;
      }
      if (markerType == "google") {
        var busIcon = L.IconMaterial.icon({
          icon: iconName,            // Name of Material icon - star
          iconColor: '#fff',         // Material icon color (could be rgba, hex, html name...)
          markerColor: 'rgba(' + iconColorRGB + ',0.7)',  // Marker fill color
          outlineColor: 'rgba(' + iconColorRGB + ',0.7)', // Marker outline color
          outlineWidth: 1,                   // Marker outline width 
        })
        // Show an old-style marker when Google Material Icon version not supported
        //circle = L.marker([element[dp.latColumn], element[dp.lonColumn]]).addTo(layerGroup);

        // Attach the icon to the marker and add to the map
        // If this line returns an error, try setting dp1.latColumn and dp1.latColumn to the names of your latitude and longitude columns.
        circle = L.marker([element[dp.latColumn], element[dp.lonColumn]], {icon: busIcon}).addTo(layerGroup); // Works, but not in Drupal site.
      } else {
        circle = L.circle([element[dp.latColumn], element[dp.lonColumn]], {
            color: "#cc7777",
            fillColor: "#cc7777",
            fillOpacity: 1,
            radius: radius
        }).addTo(layerGroup);
        circle.setRadius(100);
        // For both colors above, but it's a light blue that looks like water
        // dp.scale(element[dp.valueColumn])
        // radius was 50.  Aiming for 1 to 10. 8.5 radius arrives from markerRadius(zoom,map)
        //console.log(whichmap + " color " + dp.scale(element[dp.valueColumn])); // Returns a6cee3
      }

      // MAP POPUP
      var output = "<b>" + name + "</b><br>";
      if (element.description) {
        output += element.description + "<br>";
      } else if (element.description) {
        output += element.description + "<br>";
      } else if (element["business description"]) {
        output += element["business description"] + "<br>";
      }
      if (element[dp.addressColumn]) {
        output +=  element[dp.addressColumn] + "<br>";
      } else if (element.address || element.city || element.state || element.zip) { 
        if (element.address) {
          output += element.address + "<br>";
        } else {
          if (element.city) {
            output += element.city;
          }
          if (element.state || element.zip) {
            output += ", ";
          }
          if (element.state) {
            output += element.state + " ";
          }
          if (element.zip) {
            output += element.zip;
          }
          output += "<br>";
        }
      }

      if (element.phone || element.phone_afterhours) {
        if (element.phone) {
          output += element.phone + " ";
        }
        if (element.phone_afterhours) {
         output += element.phone_afterhours;
        }
        output += "<br>";
      }
      if (element[dp.valueColumn]) {
        if (dp.valueColumnLabel) {
          output += "<b>" + dp.valueColumnLabel + ":</b> " + element[dp.valueColumn].replace(/,/g,", ") + "<br>";
        } else if (element[dp.valueColumn] != element.name) {
          output += element[dp.valueColumn].replace(/,/g,", ") + "<br>";
        }
      }
      if (element[dp.showKeys]) {
        output += "<b>" + dp.showLabels + ":</b> " + element[dp.showKeys] + "<br>";
      }
      if (element.schedule) {
        output += "Hours: " + element.schedule + "<br>";
      }
      if (element.items) {
        output += "<b>Items:</b> " + element.items + "<br>";
      }

      if (element.website && !element.website.toLowerCase().includes("http")) {
          element.website = "http://" + element.website;
      }
      if (element.website) {
        if (element.website.length <= 50) {
          output += "<b>Website:</b> <a href='" + element.website + "' target='_blank'>" + element.website.replace("https://","").replace("http://","").replace("www.","").replace(/\/$/, "") + "</a>";
        } else {
          // To Do: Display domain only
          output += "<b>Website:</b> <a href='" + element.website + "' target='_blank'>" + element.website.replace("https://","").replace("http://","").replace("www.","").replace(/\/$/, "") + "</a>"; 
        }
      }
      if (dp.listLocation != false) {
        if (element[dp.latColumn]) {
          if (element.website) {
            output += " | ";
          }
          //console.log("latitude2: " + dp.latColumn + " " + element.latitude);
          //output += "<div class='detail' latitude='" + element[dp.latColumn] + "' longitude='" + element[dp.lonColumn] + "'>Zoom In</div> | ";
          output += "<a href='https://www.waze.com/ul?ll=" + element[dp.latColumn] + "%2C" + element[dp.lonColumn] + "&navigate=yes&zoom=17'>Waze Directions</a><br>";
        }
      } else if (element.website) {
        output += "<br>";
      }
      if (dp.distance) {
        output += "distance: " + dp.distance + "<br>";
      }

      element.mapframe = shortenMapframe(element.virtual_tour);
      if (element.mapframe) {
        output += "<a href='#show=360&m=" + element.mapframe + "'>Birdseye View<br>";
      }
      output = "<div class='leaflet-popup-text'>" + output + "</div>";
      if (element.property_link) {
        output += "<a href='" + element.property_link + "'>Property Details</a><br>";
      } else if (element[dp.nameColumn] || element["name"]) {
        let entityName = element[dp.nameColumn] || element["name"];
        // Doesn't work .replace(/'/g,"\'")
        entityName = entityName.replace(/\ /g,"_")
        entityName = encodeURIComponent(entityName);
        // Needs to remove m,q,search
        // onclick='goHash({\"show\":\"" + hash.show + "\",\"name\":\"" + entityName + "\"}); return false;' 
        output += "<a class='btn btn-success' style='margin-top:10px' href=\"#show=" + hash.show + "&name=" + entityName + "\">View Details</a><br>";
      }
      // ADD POPUP BUBBLES TO MAP POINTS
      if (circle) {
        circle.bindPopup(L.popup({paddingTopLeft:[200,200]}).setContent(output));
      }

      // Center on a MapPoint from name in URL
      if (currentName && currentName == name && element[dp.latColumn] && element[dp.lonColumn]) {
        // Called for each map
        centerMap(element[dp.latColumn], element[dp.lonColumn], name, map, whichmap);
      }

    });
  });
  });

  // Also see community-forecasting/map/leaflet/index.html for sample of svg layer that resizes with map
  map.on('zoomend', function() { // zoomend
    //L.layerGroup().eachLayer(function (marker) {
    layerGroup.eachLayer(function (marker) { // This hits every point individually. A CSS change might be less script processing intensive
      //console.log('zoom ' + map.getZoom());
      if (marker.setRadius) {
        // Only reached when circles are used instead of map points.
        console.log("marker.setRadius diabled for test")
        //marker.setRadius(markerRadius(zoom,map));
      }
    });


    //if (map.getZoom() === 15)  {
    //alert(map.getZoom()) 
    
    // NOTE - This will get called for each layer
    //alert("zoomed"); // Occurs twice
    var elements = document.getElementsByClassName('l-icon-material');
    for (var i=0, max=elements.length; i < max; i++) {
      //elements[i].style.backgroundColor = "transparent"; // "rgba(0, 0, 0, 0)";

      if (map.getZoom() >= 9)  {
        elements[i].style.marginTop = "-42px"; // Move circle to default when mappoint shape displayed.
        elements[i].childNodes[0].style.opacity = 1; // The path within SVG. Show mappoint shape around circle with icon. Undoes custom hide in leaflet.icon-material.js line 57.
      } else {
        elements[i].style.marginTop = "-14px"; // Move circle down when mappoint shape not displayed.
        elements[i].childNodes[0].style.opacity = 0;
      }
      //elements[i].child.style.opacity = 1;
      // path.setAttribute('opacity', 0);

      //elements[i].style.fillOpacity = 0;
      //elements[i].style.opacity = 0; // works
      //elements[i].style.width      = 6; // works sorta - crops

      //elements[i].style.display = "none"; // works
      //elements[i].style.width      = 16;
      //elements[i].style.height     = 20;
      //elements[i].style.marginLeft = 8;
      //elements[i].style.marginTop  = 22;
    }
  });
  /* REACTIVATE THIS, BUT USE ONE FUNCTION FOR BOTH map1 and map2 */
  map.on('zoomend', function() { // zoomend
    // Resize the circle to avoid large circles on close-ups
    layerGroup.eachLayer(function (marker) { // This hits every point individually. A CSS change might be less processing intensive
      //console.log('zoom ' + map.getZoom());
      if (marker.setRadius) {
        // Test
        //marker.setRadius(markerRadius(1,map2));
      }
    });
    $(".leaflet-interactive").show();
  });
  map.on('zoom', function() {
    // Hide the circles so they don't fill screen. Set small to hide.
    $(".leaflet-interactive").hide();
    $(".l-icon-material").show();
  });
}

function markerRadius(mapZoom,map) {
  let radiusValue = 1;
  let radiusOut = 12;
  if (map.length > 0) {
    mapZoom = map.getZoom();
  }
  let smallerWhenClose = 30;
  if (mapZoom >= 4) { smallerWhenClose = 10};
  if (mapZoom >= 5) { smallerWhenClose = 9};
  if (mapZoom >= 6) { smallerWhenClose = 8.5};
  if (mapZoom >= 8) { smallerWhenClose = 6};
  if (mapZoom >= 9) { smallerWhenClose = 3};
  if (mapZoom >= 10) { smallerWhenClose = 2};
  if (mapZoom >= 11) { smallerWhenClose = 1.8};
  if (mapZoom >= 12) { smallerWhenClose = 1.4};
  if (mapZoom >= 13) { smallerWhenClose = 1};
  if (mapZoom >= 14) { smallerWhenClose = .8};
  if (mapZoom >= 15) { smallerWhenClose = .4};
  if (mapZoom >= 17) { smallerWhenClose = .3};
  if (mapZoom >= 18) { smallerWhenClose = .2};
  if (mapZoom >= 20) { smallerWhenClose = .1};
  if ($(window).width() < 600) {
    smallerWhenClose = smallerWhenClose * 3; // Larger dots for clicking on mobile
  }
  //radiusOut = ((radiusValue * 2000) / mapZoom) * smallerWhenClose;
  radiusOut = smallerWhenClose;

  //} else {
  //  console.log("map object not populated yet for mapZoom. Maybe we could we send dp.zoom into markerRadius()")
  //}

  //console.log("mapZoom: " + mapZoom + " radiusValue: " + radiusValue + " radiusOut: " + radiusOut);
  return radiusOut;
}

function hashChangedMap() {
  let hash = getHash();
  if (priorHash.show && hash.show !== priorHash.show) {
    clearListDisplay();
  } else if (hash.state !== priorHash.state) {
    clearListDisplay();
  }
  if (hash.show == "undefined") { // To eventually remove
    delete hash.show; // Fix URL bug from indicator select hamburger menu
    updateHash({'show':''}); // Remove from URL hash without invoking hashChanged event.
  }

  if (hash.cat || hash.name) {
    $(".viewAllLink").show();
  } else {
    $(".viewAllLink").hide();
  }

  //alert("priorHash.show: " + priorHash.show)
  //alert("priorHash.cat: " + priorHash.cat + " " + hash.cat);
  //alert("hash.name " + hash.name + " priorHash.name " + priorHash.name)

  if (hash.name !== priorHash.name) {
    if (!hash.name) { // Reveal list
      $("#detaillist .detail").show(); // Show all
      $("#changeHublistHeight").show();
    } else {
      waitForElm('#detaillist').then((elm) => {
        console.log("Limit to details matching name.");
        $("#changeHublistHeight").hide();
        $("#detaillist .detail").hide(); // Hide all
        let thename = hash.name.replace(/_/g,' ').replace(/ AND /g,' & ');
        $("#detaillist > [name=\"" + thename + "\"]").show();
        //let mapframe = $("#detaillist > [name=\"" + thename + "\"]").attr("m");
        let mapframe = $("#detaillist > [name=\"" + thename + "\"]").attr("m");
        if (mapframe) {
          mapframe = getMapframeUrl(mapframe);
          //alert("Redundent call");
          $("#mapframe").prop("src", mapframe);
          $(".mapframeClass").show();
        }
      });
    }
    //loadMap1("hashChanged() in map.js new name for View Details " + hash.name, hash.show);
    $(document).ready(function () {
      if (document.getElementById("list_main") !== null) { //if exists. may not be loaded into Dom yet.
        let offTop = $("#list_main").offset().top - $("#headerbar").height() - $("#filterFieldsHolder").height();
        window.scroll(0, offTop);
      }
    });
  }

  let whatChanged = "";
  if (hash.layers !== priorHash.layers) {
    //applyIO(hiddenhash.naics);
    whatChanged = "hashChangedMap() in map.js layers";
  } else if (hash.show !== priorHash.show) {
    //applyIO(hiddenhash.naics);
    whatChanged = "hash.show hashChangedMap() in map.js";
  } else if (hash.state && hash.state !== priorHash.state) {
    // Why are new map points not appearing

    loadScript(theroot + 'js/map-filters.js', function(results) { // map.js depends on map-filters.js
      waitForElm('#state_select').then((elm) => {
        // Async, so this occurs while the rest proceeds.
        let dp = {};
        // Copied from map-filters.js
        $("#state_select").val(hash.state.split(",")[0].toUpperCase());
        if($("#state_select").find(":selected").val()) {
          let theState = $("#state_select").find(":selected").val(); // 2 characters
            if (theState != "") {
              let kilometers_wide = $("#state_select").find(":selected").attr("km");
              //zoom = 1/kilometers_wide * 1800000;
      
              if (theState == "HI") { // Hawaii
                  zoom = 6
              } else if (kilometers_wide > 1000000) { // Alaska
                  zoom = 4
              } else {
                  zoom = 7; // For Georgia map
              }
              dp.latitude = $("#state_select").find(":selected").attr("lat");
              dp.longitude = $("#state_select").find(":selected").attr("lon");
              //alert("dp.longitude  " + dp.longitude)
            }
        } else {
          console.log("ERROR #state_select not available in hashChangedMap()2");
        }
      });
    });
    whatChanged = "hashChangedMap() in map.js new state(s) " + hash.state;
  } else if (hash.cat !== priorHash.cat) {
    whatChanged = "hashChangedMap() in map.js new cat " + hash.cat;
  } else if (hash.subcat !== priorHash.subcat) {
    whatChanged = "hashChangedMap() in map.js new subcat " + hash.subcat;
  } else if (hash.details !== priorHash.details) {
    whatChanged = "hashChangedMap() in map.js new details = " + hash.details;
  } else if (hash.q !== priorHash.q) {
    whatChanged = "hashChangedMap() in map.js new search q = " + hash.q;
  } else if (hash.search !== priorHash.search) {
    //alert("hash.search: " + hash.search)
    whatChanged = "hashChangedMap() in map.js new search filters = " + hash.search;
  }

  if (whatChanged.length > 0) {
    loadMap1(whatChanged, hash.show);
  }
  
  if (hash.m != priorHash.m) { // For 360 iFrame
    //$(".mapframeClass").hide();
    //$("#mapframe").prop("src", "about:blank");
    if (hash.m) {
      let mapframe = getMapframeUrl(hash.m);
      if (mapframe) {
        $("#mapframe").prop("src", mapframe);
        //alert("mapframe changed " + mapframe)
        $(".mapframeClass").show();
        window.scrollTo({
          top: $('#mapframe').offset().top - 95,
          left: 0
        });
      }
    } else {
      $("#mapframe").prop("src", "");
      $(".mapframeClass").hide();
    }
  }
}

$(document).ready(function () {
  // INIT
  hashChangedMap();
});

function zoomFromKm2(kilometers_wide, theState) {
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
  if (theState == "DE") {
    zoom = zoom + 3;
  }
  return zoom;
}


// DELETE in 2023 - Not in use
/*
dataParameters.forEach(function(ele) {
  if (location.host.indexOf('localhost') >= 0) {
    alert("dataParameters in use")
  }
  overlays1[ele.name] = ele.group; // Add to layer menu
  overlays2[ele.name] = ele.group2; // Add to layer menu
})
*/


// Why does this work on /community/start/maps/counties/counties.html
//console.timeEnd("End of localsite/js/map.js: ");
//console.timeEnd("Processing time: ");

console.log('end of localsite/js/map.js');