// DISPLAYS THREE LEAFLET MAPS
// 1. EXPANDABLE MAP IN TOP SEARCH FILTERS
// 2. ITEM LOCATIONS ON LARGE MAP
// 3. LOCATION DETAILS ON SIDE MAP

// INIT
var dataParameters = []; // Probably can be removed, along with instances below.

let styleObject = {}; // https://docs.mapbox.com/mapbox-gl-js/style-spec/root/
styleObject.layers = [];

var layerControl = {}; // Object containing one control for each map on page.
if(typeof hash === 'undefined') {
  // Need to figure out where already declared.
  // Avoid putting var in front, else "Identifier 'hash' has already been declared" error occurs here: http://localhost:8887/localsite/map/
  hash = {};
}
if(typeof dataObject == 'undefined') {
  var dataObject = {};
}
if(typeof priorHash == 'undefined') {
  var priorHash = {};
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
// hashChanged() resides within map-filters.js. In the index.html pages, any hash change invokes loadMap1
//////////////////////////////////////////////////////////////////

/////////// LOAD FROM HTML ///////////

// INTERMODAL PORTS - was here

var localsite_map = true; // Used by man-embed.js to detect map.js load.

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
  console.log("map.js detects hiddenhashChangeEvent");
  hashChangedMap();
}, false);

var priorHashMap = {};
function hashChangedMap() {
  let hash = getHash();

  if (hash.show == "undefined") { // To eventually remove
    delete hash.show; // Fix URL bug from indicator select hamburger menu
    updateHash({'show':''}); // Remove from URL hash without invoking hashChanged event.
  }

  // For PPE embed, also in map-filters.js. Will likely change
  if (!hash.show) {
    // For embed link
    hash.show = param.show;
    hiddenhash.show = param.show;
  }
  if (!hash.state && param.state) {
    // For embed link

    // Reactivate if needed
    //hash.state = param.state;
    //hiddenhash.state = param.state;
  }

  // Temp for PPE
  if ((hash.show == "ppe" || hash.show == "suppliers") && !hash.state && location.host.indexOf("georgia") >= 0) {
    hash.state = "GA";
    hiddenhash.state = "GA";
  }

  if (hash.cat || hash.name) {
    $(".viewAllLink").show();
  } else {
    $(".viewAllLink").hide();
  }
  $("#changeHublistHeight").show();

  if (hash.name !== priorHashMap.name) {
    loadMap1("hashChanged() in map.js new name for View Details " + hash.name, hash.show);
    $(document).ready(function () {
      let offTop = $("#list_main").offset().top - $("#headerbar").height() - $("#filterFieldsHolder").height();
      window.scroll(0, offTop);
    });
  } else if (hash.layers !== priorHashMap.layers) {
    //applyIO(hiddenhash.naics);
    loadMap1("hashChangedMap() in map.js layers", hash.show);
  } else if (hash.show !== priorHashMap.show) {
    //applyIO(hiddenhash.naics);
    loadMap1("hash.show hashChangedMap() in map.js", hash.show);
  } else if (hash.state && hash.state !== priorHashMap.state) {
    // Why are new map points not appearing

    let dp = {};
    // Copied from map-filters.js
    if($("#state_select").find(":selected").val()) {
      let theState = $("#state_select").find(":selected").val();
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
        }
    } else {
      console.log("ERROR #state_select not available in hashChangedMap()");
    }    

    loadMap1("hashChanged() in map.js new state(s) " + hash.state, hash.show, dp);

  } else if (hash.cat !== priorHashMap.cat) {
    loadMap1("hashChanged() in map.js new cat " + hash.cat, hash.show);
  } else if (hash.subcat !== priorHashMap.subcat) {
    loadMap1("hashChanged() in map.js new subcat " + hash.subcat, hash.show);
  } else if (hash.details !== priorHashMap.details) {
    loadMap1("hashChanged() in map.js new details = " + hash.details, hash.show);
  }
  priorHashMap = getHash();
}
$(document).ready(function () {
  // INIT
  hashChangedMap();
});

// Allows layers to be fetched using: layerControl[whichmap].getOverlays(); // { Truck 1: true, Truck 2: false, Truck 3: false }
// the key is the name of the layer. If the layer is showing, it has a value of of true.
L.Control.Layers.include({
  getOverlays: function() { // A custom function used for multiple maps
    // create hash to hold all layers
    var control, layers;
    layers = {};
    control = this;

    // loop thru all layers in control
    control._layers.forEach(function(obj) {
      var layerName;

      // check if layer is an overlay
      if (obj.overlay) {
        // get name of overlay
        layerName = obj.name;
        // store whether it's present on the map or not
        return layers[layerName] = control._map.hasLayer(obj.layer);
      }
    });

    return layers;
  }
});


// NULLSCHOOL
$(document).on("click", "#earthZoom .leaflet-control-zoom-in", function(event) { // ZOOM IN
  zoomEarth(200);
  event.stopPropagation();
});
$(document).on("click", "#earthZoom .leaflet-control-zoom-out", function(event) { // ZOOM IN
  zoomEarth(-200);
  event.stopPropagation();
});
function zoomEarth(zoomAmount) {
  if (!localObject.earth) {
    let earthSrc = document.getElementById("mainframe").src; // Only returns the initial cross-domain uri.
    localObject.earth = getEarthObject(earthSrc.split('#')[1]);
  }
  // Add 100 to orthographic map zoom
  let orthographic = localObject.earth.orthographic.split(",");
  localObject.earth.orthographic = orthographic[0] + "," + orthographic[1] + "," + (+orthographic[2] + zoomAmount);
  
  /*
  let theMonth = 6;
  let theDay = 1;
  let theHour = 0;

  let monthStr = String(theMonth).padStart(2, '0');
  let dayStr = String(theDay).padStart(2, '0');
  let hourStr = String(theHour).padStart(2, '0');
  $("#mapText").html("NO<sub>2</sub> - " + monthStr  + "/" + dayStr + "/2022 " + " " + theHour + ":00 GMT (7 PM EST)");
  */

  let earthUrl = "https://earth.nullschool.net/#";
  if (localObject.earth.date) {
    earthUrl += localObject.earth.date + "/" + localObject.earth.time + "/";
  } else {
    earthUrl += "current/";
  }
  earthUrl += localObject.earth.mode + "/overlay=" + localObject.earth.overlay + "/orthographic=" + localObject.earth.orthographic;
  loadIframe("mainframe", earthUrl);
  //loadIframe("mainframe","https://earth.nullschool.net/#2022/" + monthStr + "/" + dayStr + "/" + hourStr + "00Z/chem/surface/currents/overlay=no2/orthographic=-115.84,31.09,1037");  
}
function getEarthObject(url) {
  if (url == undefined) {
    console.log("BUG - getEarthObject url undefined");
    return;
  }
  let urlPart = url.split('/');
  let params = {};
  if (urlPart.length > 6) { // URL contains date and time
    params.date = urlPart[0] + "/" + urlPart[1] + "/" + urlPart[2];
    params.time = urlPart[3];
    params.mode = urlPart[4] + "/" + urlPart[5] + "/" + urlPart[6];
  } else {
    params.mode = urlPart[1] + "/" + urlPart[2] + "/" + urlPart[3];
  }
  for (let i = 4; i < urlPart.length; i++) {
      if(!urlPart[i])
          continue;
      if (i==0 && urlPart[i].indexOf("=") == -1) {
        params[""] = urlPart[i];  // Allows for initial # params without =.
        continue;
      }
      let hashPair = urlPart[i].split('=');
      params[decodeURIComponent(hashPair[0]).toLowerCase()] = decodeURIComponent(hashPair[1]);
   }
   return params;
}
function loadIframe(iframeName, url) {
  localObject.earth = getEarthObject(url.split('#')[1]);
  
  var $iframe = $('#' + iframeName);
  if ($iframe.length) {
      //alert("loadIframe" + url)
      $iframe.attr('src',url);
      ///localObject.earthSrc = url;
      $("#nullschoolHeader #mainbucket").show();
      return false;
  }
  return true;
}
function showGlobalMap() { // Used by community/index.html
  $("#nullschoolHeader").show();

  if($("#globalMapHolder").length <= 1) {
    //$("#globalMapHolder").html('<iframe src="https://earth.nullschool.net/#current/chem/surface/currents/overlay=no2/orthographic=-115.84,31.09,1037" class="iframe" name="mainframe" id="mainframe"></iframe><div id="mapText" style="padding-left:20px"></div>');
    
    // Two steps prevent loading error
    $("#globalMapHolder").html('<iframe src="" class="iframe" name="mainframe" id="mainframe"></iframe><div id="mapText" style="padding-left:20px"></div>');
    
    loadIframe("mainframe","https://earth.nullschool.net/#current/wind/surface/level/orthographic=-73.52,34.52,532");

    // Chem Currents NO2 - Since Wind makes NO2 clouds hard to see
    //loadIframe("mainframe","https://earth.nullschool.net/#current/chem/surface/currents/overlay=no2/orthographic=-115.84,31.09,1037");

  }
}
function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}
async function loopMap() {
  await delay(200);
  let theMonth = 6;
  let theDay = 1;
  let theHour = 0;
  while (theDay <= 20) {
    let monthStr = String(theMonth).padStart(2, '0');
    let dayStr = String(theDay).padStart(2, '0');
    let hourStr = String(theHour).padStart(2, '0');
    $("#mapText").html("NO<sub>2</sub> - " + monthStr  + "/" + dayStr + "/2022 " + " " + theHour + ":00 GMT (7 PM EST)");

    loadIframe("mainframe","https://earth.nullschool.net/#2022/" + monthStr + "/" + dayStr + "/" + hourStr + "00Z/chem/surface/currents/overlay=no2/orthographic=-115.84,31.09,1037");  
    await delay(1000);

    $("#mapText").html("NO<sub>2</sub> - " + monthStr  + "/" + dayStr + "/2022 " + " 12:00 GMT (7 AM EST)");
    loadIframe("mainframe","https://earth.nullschool.net/#2022/" + monthStr + "/" + dayStr + "/1200Z/chem/surface/currents/overlay=no2/orthographic=-115.84,31.09,1037");  
    await delay(1000);

    theDay += 1;
    //theHour += 2;   
  }
}
$(document).ready(function () {
  // Run animation - add a button for this
  //loopMap();
});
// END NULLSCHOOL


function loadFromSheet(whichmap,whichmap2,dp,basemaps1,basemaps2,attempts,callback) {
  console.log("loadFromSheet - Might not need to call from Beyond Carbon when state not displayed.")
  // To Do: Map background could be loaded while waiting for D3 file. 
  // Move "d3.csv(dp.dataset).then" further down into a new function that starts with the following line.

  // Even without dataset, set titles since NAICS industries are still loaded.
  let defaults = {};
  defaults.zoom = 7;
  defaults.numColumns = ["zip","lat","lon"];
  defaults.nameColumn = "name";
  //defaults.valueColumn = "name"; // For color coding - Avoid because this invokes side legend
  defaults.latColumn = "latitude";
  defaults.lonColumn = "longitude";
  //defaults.scaleType = "scaleQuantile";
  defaults.scaleType = "scaleOrdinal";
  defaults.dataTitle = "Data Projects"; // Must match "map.addLayer(overlays" below.
  if (dp.latitude && dp.longitude) {
      mapCenter = [dp.latitude,dp.longitude];
  } else {
    mapCenter = [33.74,-84.38]; // Some center is always needed, else error will occur when first using flyTo.
  }

  // Make all keys lowercase - add more here, good to loop through array of possible keys
  if (dp.itemsColumn) {
    //dp.itemsColumn = dp.itemsColumn.toLowerCase(); // Prevented match with ElementRaw
  }

  if (dp.dataTitle) {
    $("#showAppsText").text(dp.dataTitle);
    $("#showAppsText").attr("title",dp.dataTitle);
    $(".regiontitle").text(dp.dataTitle);
  } else {
    // Handled by getNaics_setHiddenHash()
    //$("#showAppsText").text(hash.show.charAt(0).toUpperCase() + hash.show.substr(1).replace(/\_/g," "));  
  }
  if (dp.listTitle) {
    dp.dataTitle = dp.listTitle;
  }

  if (typeof d3 !== 'undefined') {
    if (!dp.dataset && !dp.googleCSV) {
      console.log('CANCEL loadFromSheet. No dataset selected for top map. May not be one for state.');
      /*
      if (!hash.state) {
        if (location.host.indexOf('localhost') >= 0) {
          alert("Localhost message: State may be required for requested data. Appending state GA.");
        }
        goHash({'state':'GA'});
        hash = getHash();
        return;
      }
      */
      $("#" + whichmap).hide();
      $("#list_main").hide();
      if (param.showsearch == "true") { // For EPD products io/template
        $(".keywordField").show();
      } else {
        $("#data-section").hide();
      }
      return;
    } else {
      console.log('loadFromSheet into #' + whichmap);
      $(".keywordField").show();
      if (dp.mapable != "false") {
        $("#" + whichmap).show();
      }
    }

    dp = mix(dp,defaults); // Gives priority to dp
    if (dp.addLink) {
      //console.log("Add Link: " + dp.addLink)
    }
    if (dp.showShapeMap) {
      let hash = getHash();
      renderMapShapes("map1", hash, 1); // County select map
    }
    
    // TRY AGAIN UNTIL #[whichmap] and (whichmap)._leaflet_map are available.
    //if (typeof document.querySelector('#' + whichmap)._leaflet_map === 'undefined') {
    if (typeof document.querySelector('#' + whichmap) === 'undefined' || typeof document.querySelector('#' + whichmap) === 'null') {
      console.log("#" + whichmap + " is undefined. Try again.  Attempt " + attempts);
      if (attempts <= 100) {
        setTimeout( function() {
          loadFromSheet(whichmap,whichmap2,dp,basemaps1,basemaps2,attempts+1,callback);
        }, 20 );
      } else {
        console.log("ERROR #" + whichmap + " - exceeded 100 attempts.");
      }
      return;
    } else if (document.querySelector('#' + whichmap) && typeof L.DomUtil != "object") { // Wait for Leaflet library
      //if (document.querySelector('#' + whichmap) && !document.querySelector'#' + whichmap)._leaflet_map) { // Won't work because ._leaflet_map always equals "undefined"
        console.log("L.DomUtil not available for #" + whichmap + ".  Try again. Attempt " + attempts);
        console.log(typeof L.DomUtil);
        if (attempts <= 100) {
          setTimeout( function() {
            loadFromSheet(whichmap,whichmap2,dp,basemaps1,basemaps2,attempts+1,callback);
          }, 20 );
        } else {
          console.log("ERROR - _leaflet_map null exceeded 100 attempts.");
        }
        return;
    }
    /*
    else {
        console.log("typeof document.querySelector ._leaflet_map: " + typeof document.querySelector('#' + whichmap)._leaflet_map);
    }
    */

    // Pevent error when backing up: map container is already initialized
    //if (map) {
    //  map.off();
    //  map.remove();
    //}


    //map2 = document.querySelector('#' + whichmap2)._leaflet_map; // Recall existing map
    //  var container2 = L.DomUtil.get(map2);
    //  if (container2 == null) { // Initialize map



    let map;
    //alert(whichmap + " length: " + $('#' + whichmap).length);
    if( $('#' + whichmap).length >= 1) {
      console.log("#" + whichmap + " is populated");
      map = document.querySelector('#'+whichmap)._leaflet_map; // Recall existing map
    } else {
      //alert("#" + whichmap + " not found");
      //var containerExists = L.DomUtil.get(map); // NOT NEEDED

      // https://help.openstreetmap.org/questions/12935/error-map-container-is-already-initialized
      // if(container != null){ container._leaflet_id = null; }

      //if (containerExists == null) { // NOT NEEDED - need to detect L.map
        if (location.host.indexOf('localhost') >= 0) {
          // BUGBUG
          console.log("Trying again - An errror occured because the #" + whichmap + " div was not yet rendered.");
          loadFromSheet(whichmap,whichmap2,dp,basemaps1,basemaps2,attempts,callback);
          return;
        }
        map = L.map(whichmap, { // var --> Map container is already initialized.
          center: mapCenter,
          scrollWheelZoom: false,
          zoom: dp.zoom,
          dragging: !L.Browser.mobile, 
          tap: !L.Browser.mobile
        });
      //}
    }

    console.log("typeof map: " + typeof map);
    console.log("typeof document.querySelector ._leaflet_map: " + typeof document.querySelector('#' + whichmap)._leaflet_map);
    
    // Might be able to rename/reconfig/reuse containerExists above to container and remove this line:
    var container = L.DomUtil.get(map);
    //dp.zoom = 18; // TEMP - Causes map to start with extreme close-up, then zooms out to about 5.
    // Otherwise starts with 7ish and zooms to 5ish.
    console.log("dp.zoom " + dp.zoom);
    if (container == null) { // Initialize map
      console.log("Initialize map again - this should not be reached.");
      map = L.map(whichmap, {
        center: mapCenter,
        scrollWheelZoom: false,
        zoom: dp.zoom,
        dragging: !L.Browser.mobile, 
        tap: !L.Browser.mobile
      });
      
      
      // setView does not seem to have an effect triggering map.on below
      /*
      map = L.map(whichmap,{
        center: mapCenter,
        scrollWheelZoom: false,
        zoom: dp.zoom,
        zoomControl: false
      });
      // Placing map.whenReady or map.on('load') here did not resolve
      map.setView(mapCenter,dp.zoom);
      */
      map.on('click', function() {
        if (location.host.indexOf('localhost') >= 0) {
          //alert('Toggle scrollwheel zoom')
        }
        if (this.scrollWheelZoom.enabled()) {
          this.scrollWheelZoom.disable();
        }
        else {
          this.scrollWheelZoom.enable();
        }
      })
    } else {
      console.log("dp.zoom 2 " + dp.zoom);
      map.setView(mapCenter,dp.zoom);
    }
    // Right column map
    let map2 = {};
    if (whichmap2) {
      $("#list_main").show();
      map2 = document.querySelector('#' + whichmap2)._leaflet_map; // Recall existing map
      var container2 = L.DomUtil.get(map2);
      if (container2 == null) { // Initialize map
        map2 = L.map(whichmap2, {
          center: mapCenter,
          scrollWheelZoom: false,
          zoom: 6,
          dragging: !L.Browser.mobile, 
          tap: !L.Browser.mobile
        });
      }
    }

    // 5. Load Layers Asynchronously
    //var dataset = "../community/map/zip/basic/places.csv";

    // Change below
    // latColumn: "lat",
    //      lonColumn: "lon",
    //var dataset = "https://datascape.github.io/community/map/zip/basic/places.csv";

    // ADD DATASET TO DUAL MAPS

    // We are currently loading dp.dataset from a CSV file.
    // Later we will check if the filename ends with .csv

    if (dp.googleCategories && !dp.googleCSV) {            
      d3.csv(dp.googleCategories).then(function(data) {
        // LOAD CATEGORIES TAB - Category, SubCategory, SubCategoryLong
        //localObject.layerCategories[dp.show] = makeRowValuesNumeric(data, dp.numColumns, dp.valueColumn);
        localObject.layerCategories[dp.show] = data;
        preCatList = localObject.layerCategories[hash.show];

        console.log("preCatList");
        console.log(preCatList);

        let catList = {};
        // Build catList object with category name as the key.
        let catColName = "Category"; // TO DO, apply this below.
        for (var i = 0, l = preCatList.length; i < l; i++) {

          let key = Object.keys(preCatList[i]);

          //iconColor = colorScale(element[dp.valueColumn]);
          //if (dp.color) { 
          //  iconColor = dp.color;
          //}
          iconColor = "blue";

          //console.log("element[dp.valueColumn] " + element[dp.valueColumn]);
          //if (dp.valueColumn) {
            // Requires only ONE category value in the valueColumn.
            if(!catList.Category) {
              catList[preCatList[i].Category] = {};
              catList[preCatList[i].Category].count = 1;
            } else {
              catList[preCatList[i].Category].count++;
            }
            catList[preCatList[i].Category].color = iconColor;
          //}
        }
        console.log("catList");
        console.log(catList);

        localObject.layerCategories[dp.show] = catList;

        renderCatList(catList);
        //processOutput(dp,map,map2,whichmap,whichmap2,basemaps1,basemaps2,function(results){});
      });
    }

    let stateAllowed = true;
    if (dp.datastates && hash.state) {
      if (dp.datastates.split(",").indexOf(hash.state.split(",")[0].toUpperCase()) == -1) {
        stateAllowed = false;
        //alert("State1 of " + hash.state + " has no map point data based on dp.datastates indicated.");
        $("#list_main").hide();
        $("#map1").hide();
        return;
      }
    }

    console.log("TO DO - place prior dataset in object within processOutput() to avoid reloading")
    if (dp.dataset && stateAllowed && (dp.dataset.toLowerCase().includes(".json") || dp.datatype === "json")) { // To Do: only check that it ends with .json
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
        processOutput(dp,map,map2,whichmap,whichmap2,basemaps1,basemaps2,function(results){
          callback(); // Triggers initialHighlight()
        });
      });
    } else if (dp.dataset) {
      d3.csv(dp.dataset).then(function(data) { // One row per line
          //console.log("To do: store data in browser to avoid repeat loading from CSV.");

          //dp.data = makeRowValuesNumeric(data, dp.numColumns, dp.valueColumn);
          dp.data = data;
        
          // Make element key always lowercase
          //dp.data_lowercase_key;

          //alert("okay1")
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
          processOutput(dp,map,map2,whichmap,whichmap2,basemaps1,basemaps2,function(results){});
      })
    } else if (dp.googleCSV) {
      d3.csv(dp.googleCSV).then(function(data) { // One row per line
        // LOAD GOOGLE SHEET
          //dp.data = makeRowValuesNumeric(data, dp.numColumns, dp.valueColumn);
          dp.data = data;
          if (dp.googleCategories) {            
            d3.csv(dp.googleCategories).then(function(data) {
              // LOAD CATEGORIES TAB - Category, SubCategory, SubCategoryLong
              //localObject.layerCategories[dp.show] = makeRowValuesNumeric(data, dp.numColumns, dp.valueColumn);
              localObject.layerCategories[dp.show] = data;
              processOutput(dp,map,map2,whichmap,whichmap2,basemaps1,basemaps2,function(results){});
            });
          } else {
            processOutput(dp,map,map2,whichmap,whichmap2,basemaps1,basemaps2,function(results){});
          }
      });
    }
    
    //.catch(function(error){ 
    //     alert("Data loading error: " + error)
    //})
  } else {
      attempts = attempts + 1;
      if (attempts < 2000) {
        // To do: Add a loading image after a coouple seconds. 2000 waits about 300 seconds.
        setTimeout( function() {
          loadFromSheet(whichmap,whichmap2,dp,basemaps1,basemaps2,attempts,callback);
        }, 20 );
      } else {
        alert("D3 javascript not available for loading map dataset.")
      }
  }
}

var overlays1 = {};
var overlays2 = {};

// DELETE in 2023 - Not in use
dataParameters.forEach(function(ele) {
  if (location.host.indexOf('localhost') >= 0) {
    alert("dataParameters in use")
  }
  overlays1[ele.name] = ele.group; // Add to layer menu
  overlays2[ele.name] = ele.group2; // Add to layer menu
})

function processOutput(dp,map,map2,whichmap,whichmap2,basemaps1,basemaps2,callback) {
  if (typeof map === 'undefined') {
    console.log("processOutput: map undefined");
  }
  dp.scale = getScale(dp.data, dp.scaleType, dp.valueColumn);
  dp.group = L.layerGroup();
  dp.group2 = L.layerGroup();
  dp.iconName = 'star';
  //dataParameters.push(dp);

   // Prevents dups of layer from appearing
   // Each dup shows a data subset when filter is being applied.

   if (overlays1 && overlays1[dp.dataTitle]) {
      if (map.hasLayer(overlays1[dp.dataTitle])){
        overlays1[dp.dataTitle].remove(); // clear the markers from the map for the layer
      }
      layerControl[whichmap].removeLayer(overlays1[dp.dataTitle]);
   }
   if (overlays2 && overlays2[dp.dataTitle]) {
      if (map2.hasLayer(overlays2[dp.dataTitle])){
        overlays2[dp.dataTitle].remove();
     }
      // Wasn't working, multiple checkboxes appeared ...seems to be fixed now, haven't seen multiple lately.
      layerControl[whichmap2].removeLayer(overlays2[dp.dataTitle]);
      //controlLayers.removeLayer(overlays2[dp.dataTitle]);
   }

  // Allows for use of dp.dataTitle with removeLayer and addLayer
  console.log("dp.group");
  console.log(dp.group); // Error here: http://localhost:8887/apps/brigades/
  
  if (overlays1) { // To avoid: Cannot set properties of undefined (setting 'Coding Brigades')
    overlays1[dp.dataTitle] = dp.group;
    overlays2[dp.dataTitle] = dp.group2;
  } else {
    console.log("ALERT: overlays1 not available.");
  }

  if (layerControl[whichmap] !== undefined) {
    // Remove existing instance of layer
    //layerControl[whichmap].removeLayer(overlays[dp.dataTitle]); // Remove from control 
    //map.removeLayer(overlays[dp.dataTitle]); // Remove from map
  }

  if (layerControl[whichmap] !== undefined && dp.group) {
      //layerControl[whichmap].removeLayer(dp.group);
  }


  // Still causes jump
  //overlays2["Intermodal Ports 2"] = overlays["Intermodal Ports"];

  // ADD BACKGROUND BASEMAP
  if (layerControl[whichmap] == undefined) {
    layerControl[whichmap] = L.control.layers(basemaps1, overlays1).addTo(map); // Init layer checkboxes
    basemaps1["Grayscale"].addTo(map); // Set the initial baselayer.  OpenStreetMap
  } else {
    layerControl[whichmap].addOverlay(dp.group, dp.dataTitle); // Add layer checkbox
  }
  // ADD BACKGROUND BASEMAP to Side Map
  if (layerControl[whichmap2] == undefined) {
    layerControl[whichmap2] = L.control.layers(basemaps2, overlays2).addTo(map2); // Init layer checkboxes
    if (location.host.indexOf('localhost') >= 0) {
      // OpenStreetMap tiles stopped working on localhost in March of 2022. Using Grayscale locally for small map instead.
      // "Access denied. See https://operations.osmfoundation.org/policies/tiles/"
      //basemaps2["Grayscale"].addTo(map2); // Set the initial baselayer.
      basemaps2["OpenStreetMap"].addTo(map2); // Set the initial baselayer. // Working as of June 2022.
    } else {
      basemaps2["OpenStreetMap"].addTo(map2); // Set the initial baselayer.
    }
  } else {
    layerControl[whichmap2].addOverlay(dp.group2, dp.dataTitle); // Add layer checkbox
  }

  if (dp.showLegend != false) {
    //alert("addLegend")
    //addLegend(map, dp.scale, dp.scaleType, dp.name); // Too big and d3-legend.js file is not available in embed, despite 
  }

  // ADD ICONS TO MAP
  // All layers reside in dataParameters object:
  //console.log("dataParameters:");
  //console.log(dataParameters);

  if (dp.showLayer != false) {
    $("#widgetTitle").text(dp.dataTitle);
    dp = showList(dp,map); // Reduces list based on filters
    addIcons(dp,map,map2);
    // These do not effect the display of layer checkboxes
    map.addLayer(overlays1[dp.dataTitle]);
    map2.addLayer(overlays2[dp.dataTitle]);
  }
  $("#activeLayer").text(dp.dataTitle); // Resides after showList

  //callback(map); // Sends to function(results).  "var map =" can be omitted when calling this function


  // Runs too soon, unless placed within d3.csv.
  // Otherwise causes: Cannot read property 'addOverlay' of undefined

  //map.whenReady(function(){ 
  //map.on('load',function(){ // Never runs
    //alert("loaded")
    callback(dp)
  //});

  /*
  // Neigher map.whenReady or map.on('load') seems to require SetView()
  if (document.body.clientWidth > 500) { // Since map tiles do not fully load when below list. Could use a .5 sec timeout perhaps.
    setTimeout( function() {
      //$("#sidemapCard").hide(); // Hide after size is available for tiles.
    }, 3000 ); // Allow ample time to load.
  }
  */
}


/////////// MAP SETTINGS ///////////

// 33.863516,-84.368775
//var mapCenter = [32.90,-83.35]; // [latitude, longitude]
var mapCenter = [33.7490,-84.3880]; // [latitude, longitude]

// Add above to include overlays WITHOUT showing in legend:
// layers: [dataParameters[0].group]

// If added both baseLayers and overlays WITHOUT showing in legend:
// layers: [grayscale, dataParameters[0].group]

// Avoid layers: [grayscale] above 
// - two sets of tiles would be loaded when upper baseLayer is changed using radio buttons.

// Two sets prevents one map from changing the other




// NOT USED IN CURRENT REPO - Check if still used when transitioning PPE map
function populateMap(whichmap, dp, callback) { // From JSON within page
    var circle;
    let defaults = {};
    defaults.zoom = 7;

    if (dp.latitude && dp.longitude) {
      mapCenter = [dp.latitude,dp.longitude]; 
    } else {
      mapCenter = [33.74,-84.38];
    }

    dp = mix(dp,defaults); // Gives priority to dp
    console.log("populateMap dp.zoom " + dp.zoom);

    let map = L.map(whichmap,{
      center: mapCenter,
      scrollWheelZoom: false,
      zoom: dp.zoom,
      zoomControl: false,
      dragging: !L.Browser.mobile, 
      tap: !L.Browser.mobile
    });

    map.setView(mapCenter,dp.zoom);

    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    overlays1[dp.dataTitle] = dp.group; // Allows for use of dp.name with removeLayer and addLayer

    // Adds checkbox, but unselects other map on page
    //overlays2[dp.dataTitle] = dp.group;
    overlays2[dp.dataTitle ] = dp.group2; //Haven't test switch to this

    /*
    if (layerControl[whichmap] == undefined) {
      baseLayers["Streets"].addTo(map); // Set the initial baselayer.

      //layerControl[whichmap] = L.control.layers(baseLayers, overlays).addTo(map);

    }
    */

    if (layerControl[whichmap] == undefined) {
      layerControl[whichmap] = L.control.layers(basemaps1, overlays1).addTo(map); // Push multple layers
      //basemaps1["Satellite"].addTo(map);
      basemaps1["Streets"].addTo(map);
    } else {
      layerControl[whichmap].addOverlay(dp.group, dp.dataTitle); // Appends to existing layers
    }
    
    // Attach the icon to the marker and add to the map
    //L.marker([33.74,-84.38], {icon: busIcon}).addTo(map)
    
    // Set .my-div-icon styles in CSS
    //var myIcon = L.divIcon({className: 'my-div-icon'});
    //L.marker([32.90,-83.83], {icon: myIcon}).addTo(map);

    addIcons(dp, map);
    map.addLayer(overlays1[dp.dataTitle]);
    
    // Both work
    map.on('load',function(){

      // Sample of single icon - place in addIcons function
      // Create a semi-transparent bus icon
      var busIcon = L.IconMaterial.icon({
        icon: 'local_shipping',            // Name of Material icon
        iconColor: '#fff',              // Material icon color (could be rgba, hex, html name...)
        markerColor: 'rgba(255,0,0,0.5)',  // Marker fill color
        outlineColor: 'rgba(255,0,0,0.5)',            // Marker outline color
        outlineWidth: 1,                   // Marker outline width 
      });

      callback(map)
    }); //  event handler before you load the map
    //map.whenReady(callback(map)); //  event handler before you load the map with SetView()
    
}



/////////////////////////////////////////
// helper functions
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
function addIcons(dp,map,map2) {
  var circle,circle2;
  var iconColor, iconColorRGB, iconName;
  var colorScale = dp.scale;
  let hash = getHash();

  dp.data.forEach(function(element) {
    // Add a lowercase instance of each column name
    var key, keys = Object.keys(element);
    var n = keys.length;
    //var element={};
    while (n--) {
      key = keys[n];
      element[key.toLowerCase()] = element[key];
    }

    if (dp.color) {
      iconColor = dp.color;
    } else if (dp.colorColumn) {
      iconColor = colorScale(element[dp.colorColumn]);
    } else if (dp.valueColumn) {
      // If the valueColumn = type, the item column my be filtered. For PPE the item contains multiple types.

      //console.log("dp.valueColumn: " + dp.valueColumn);
      //console.log("dp.valueColumn value: " + element[dp.valueColumn]);
      //console.log("dp.valueColumn value Type: " + element["Type"]);
      //console.log("dp.valueColumn value Category: " + element["Category"]);
      iconColor = colorScale(element[dp.valueColumn]);
    } else {
      iconColor = "blue";
    }
    

    //console.log("element state " + element.state + " iconColor: " + iconColor)
    if (typeof dp.latColumn == "undefined") {
      dp.latColumn = "lat";
    }
    if (typeof dp.lonColumn == "undefined") {
      dp.lonColumn = "lon";
    }

    iconColorRGB = hex2rgb(iconColor);
    iconName = dp.iconName;
    if (typeof L === 'undefined') {
      if (location.host.indexOf('localhost') >= 0) {
        alert("Leaflet L not yet loaded");
      }
    } else if (typeof L.IconMaterial === 'undefined') {
      if (location.host.indexOf('localhost') >= 0) {
        alert("Leaflet L.IconMaterial undefined = leaflet.icon-material.js not loaded");
      }
    }
    var busIcon = L.IconMaterial.icon({ /* Cannot read property 'icon' of undefined = leaflet.icon-material.js not loaded */
      icon: iconName,            // Name of Material icon - star
      iconColor: '#fff',         // Material icon color (could be rgba, hex, html name...)
      markerColor: 'rgba(' + iconColorRGB + ',0.7)',  // Marker fill color
      outlineColor: 'rgba(' + iconColorRGB + ',0.7)', // Marker outline color
      outlineWidth: 1,                   // Marker outline width 
    })

    let name = element.name;
    if (element[dp.nameColumn]) {
      name = element[dp.nameColumn];
    } else if (element.title) {
      name = element.title;
    }

    //alert(element["plant_or_group"]["latitude"]);

    if (dp.latColumn.includes(".")) { // ToDo - add support for third level
      element[dp.latColumn] = element[dp.latColumn.split(".")[0]][dp.latColumn.split(".")[1]];
      element[dp.lonColumn] = element[dp.lonColumn.split(".")[0]][dp.lonColumn.split(".")[1]];
    }
    if (!element[dp.latColumn] || !element[dp.lonColumn]) {
      console.log("Missing lat/lon: " + name);
      return;
    }
    // Attach the icon to the marker and add to the map
    //L.marker([element[dp.latColumn], element[dp.lonColumn]], {icon: busIcon}).addTo(map)

    if (dp.markerType == "google") {
        if (1==2 && param["show"] != "suppliers" && (location.host == 'georgia.org' || location.host == 'www.georgia.org')) {
          // Show an old-style marker when Google Material Icon version not supported
          circle = L.marker([element[dp.latColumn], element[dp.lonColumn]]).addTo(dp.group);
          circle2 = L.marker([element[dp.latColumn], element[dp.lonColumn]]).addTo(dp.group2);
        } else {
          //if (!dp.showShapeMap) {
            // If this line returns an error, try setting dp1.latColumn and dp1.latColumn to the names of your latitude and longitude columns.
            circle = L.marker([element[dp.latColumn], element[dp.lonColumn]], {icon: busIcon}).addTo(dp.group); // Works, but not in Drupal site.
            //circle2 = L.marker([element[dp.latColumn], element[dp.lonColumn]], {icon: busIcon}).addTo(dp.group2);
          //}
          // Display a small circle on small side map2
          circle2 = L.circle([element[dp.latColumn], element[dp.lonColumn]], {
                color: colorScale(element[dp.valueColumn]),
                fillColor: colorScale(element[dp.valueColumn]),
                fillOpacity: 1,
                radius: markerRadius(1,map2) // was 50.  Aiming for 1 to 10
            }).addTo(dp.group2);
        }
    } else {
      circle = L.circle([element[dp.latColumn], element[dp.lonColumn]], {
                color: colorScale(element[dp.valueColumn]),
                fillColor: colorScale(element[dp.valueColumn]),
                fillOpacity: 1,
                radius: markerRadius(1,map) // was 50.  Aiming for 1 to 10
            }).addTo(dp.group);
      circle2 = L.circle([element[dp.latColumn], element[dp.lonColumn]], {
                color: colorScale(element[dp.valueColumn]),
                fillColor: colorScale(element[dp.valueColumn]),
                fillOpacity: 1,
                radius: markerRadius(1,map2) // was 50.  Aiming for 1 to 10
            }).addTo(dp.group2);
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

    element.mapframe = getMapframe(element);
    if (element.mapframe) {
      output += "<a href='#show=360&m=" + element.mapframe + "'>Birdseye View<br>";
    }
    if (element.property_link) {
      output += "<a href='" + element.property_link + "'>Property Details</a><br>";
    } else if (element[dp.nameColumn] || element["name"]) {
      let entityName = element[dp.nameColumn] || element["name"];
      entityName = entityName.replace(/\ /g,"_").replace(/'/g,"\'")
      output += "<a onclick='goHash({\"name\":\"" + entityName + "\"}); return false;' href='#show=" + hash.show + "&name=" + entityName + "'>View Details</a><br>";
    }
    // ADD POPUP BUBBLES TO MAP POINTS
    if (circle) {
      circle.bindPopup(output);
    }
    circle2.bindPopup(output);

    /*
    map.on('zoomend', function() {
      console.log('zoomend',map.getZoom())
      circle.setRadius(markerRadius(1,map));
    });
    */

  });

  // Also see community-forecasting/map/leaflet/index.html for sample of svg layer that resizes with map
  map.on('zoomend', function() { // zoomend
    //L.layerGroup().eachLayer(function (marker) {
    dp.group.eachLayer(function (marker) { // This hits every point individually. A CSS change might be less script processing intensive
      //console.log('zoom ' + map.getZoom());
      if (marker.setRadius) {
        // Only reached when circles are used instead of map points.
        marker.setRadius(markerRadius(1,map));
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
  map2.on('zoomend', function() { // zoomend
    // Resize the circle to avoid large circles on close-ups
    dp.group2.eachLayer(function (marker) { // This hits every point individually. A CSS change might be less processing intensive
      //console.log('zoom ' + map.getZoom());
      if (marker.setRadius) {
        marker.setRadius(markerRadius(1,map2));
      }
    });
    $(".leaflet-interactive").show();
  });
  map2.on('zoom', function() {
    // Hide the circles so they don't fill screen. Set small to hide.
    $(".leaflet-interactive").hide();
    $(".l-icon-material").show();
  });

  $('.detail').click(function() { // Provides close-up with map2
      $("#sidemapCard").show(); // map2 - show first to maximize time tiles have to see full size of map div.

      // Reduce the size of all circles - to do: when zoom is going in 
      /* No effect
      dp.group2.eachLayer(function (marker) { // This hits every point individually. A CSS change might be less script processing intensive
        //console.log('zoom ' + map.getZoom());
        if (marker.setRadius) {
          console.log("marker.setRadius" + markerRadiusSmall(1,map2));
          marker.setRadius(markerRadiusSmall(1,map2));
        }
      });
      */
      

      //$('.detail').css("border","none");
      //$('.detail').css("background-color","inherit");
      //$('.detail').css("padding","12px 0 12px 4px");
      $('.detail').removeClass("detailActive");

      console.log("List detail click");
      let locname = $(this).attr("name").replace(/ /g,"_");
      updateHash({"name":locname});
      $('#sidemapName').text($(this).attr("name"));

      //$(this).css("border","1px solid #ccc");
      //$(this).css("background-color","rgb(250, 250, 250)");
      //$(this).css("padding","15px");
      $(this).addClass("detailActive");
      if ($(".detailActive").height() < 250) {
        $("#changeHublistHeight").hide();
      }
      
      var listingsVisible = $('#detaillist .detail:visible').length;
      if (listingsVisible == 1 || hash.cat) {
        $(".viewAllLink").show();
      }

      if ($(this).attr("latitude") && $(this).attr("longitude")) {
        popMapPoint(dp, map2, $(this).attr("latitude"), $(this).attr("longitude"), $(this).attr("name"));
      } else {
        $("#sidemapCard").hide();
      }
      // Might reactivate scrolling to map2
      /*
      window.scrollTo({
        top: $("#sidemapCard").offset().top - 140,
        left: 0
      });
      */

      $(".go_local").show();
    }
  );
  $('.showItemMenu').click(function () {
    $("#listingMenu").show();

    $("#listingMenu").prependTo($(this).parent());

    event.stopPropagation();
    //$("#map").show();
    // $(this).css('border', 'solid 1px #aaa');
  });
  $('.showLocMenu').click(function () {
    $(".locMenu").show();
    //event.stopPropagation();
  });
  $('#hideSideMap').click(function () {
    $("#sidemapCard").hide(); // map2
  });

}

function markerRadiusSmall(radiusValue,map) {
  return .00001;
}
function markerRadius(radiusValue,map) {
  //return 100;
  // Standard radiusValue = 1
  let mapZoom = map.getZoom();
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
  let radiusOut = ((radiusValue * 2000) / mapZoom) * smallerWhenClose;

  //console.log("mapZoom:" + mapZoom + " radiusValu:" + radiusValue + " radiusOut:" + radiusOut);
  return radiusOut;
}

// MAP 1
// var map1 = {};
var showprevious = param["show"];

var tabletop; // Allows us to wait for tabletop to load.

function zoomFromKm(kilometers_wide) {
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
  return zoom;
}
function loadMap1(calledBy, show, dp_incoming) { // Called by this page. Maybe still index.html, map-embed.js

  console.log('loadMap1 calledBy ' + calledBy + ' show: ' + show);

  let dp = {};
  if (dp_incoming) { // Parameters set in page or layer json
    dp = dp_incoming;
  }

  if (!show && param["show"]) {
    show = param["show"];
  }
  
  let hash = getHash(); // Includes hiddenhash
  let layers = hash.layers;

  $("#dataList").html("");
  $("#detaillist").html("<img src='" + local_app.localsite_root() + "img/icon/loading.gif' style='margin:40px; width:120px' alt='Loading'>");

  //if (!show && param["go"]) {
  //  show = param["go"].toLowerCase();
  //}
  if (show != showprevious) {
    //changeCat(""); // Clear side
    $("#topPanel").hide();
    if (showprevious) {
      clearHash("cat");
    }
    //$("#tableSide").hide();
  }
  //$("#list_main").hide(); // Hide list and map2 until displayed by state-specific data

  // To do: limit to when layer changes
  //$(".layerclass").hide(); // Hides suppliers, and other layer-specific css
  
  // Note: light_nolabels does not work on https. Remove if so. Was positron_light_nolabels.
  var basemaps1 = {
    //'Grayscale' : L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr}), // No longer works, may require registration change.
    // OpenStreetMap_BlackAndWhite:
      'Grayscale' : L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
          maxZoom: 18, attribution: '<a href="https://neighborhood.org">Neighborhood.org</a> | <a href="http://openstreetmap.org">OpenStreetMap</a> | <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
      }),

    // https://github.com/CartoDB/basemap-styles
    //'Grayscale' : L.tileLayer('https://{s}.tile.cartocdn.com/{z}/{x}/{y}.png', {
    //   attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
    //   subdomains: 'abcd',
    //   maxZoom: 20,
    //   minZoom: 0
    // }),
    'Satellite' : L.tileLayer(mbUrl, {maxZoom: 25, id: 'mapbox.satellite', attribution: mbAttr}),
    //'Streets' : L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: mbAttr}),
    'OpenStreetMap' : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '<a href="https://neighborhood.org">Neighborhood.org</a> | <a href="http://openstreetmap.org">OpenStreetMap</a> | <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    }),
  }
  var basemaps2 = {
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
  var baselayers = {
    'Rail' : L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
        minZoom: 2, maxZoom: 19, tileSize: 256, attribution: '<a href="https://www.openrailwaymap.org/">OpenRailwayMap</a>'
    }),
  }
  /*
    'Positron' : L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
      attributionX: 'positron_lite_rainbow'
    }),
    'Litegreen' : L.tileLayer('//{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
        attribution: 'Tiles <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a>'
    }),
    'EsriSatellite' : L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP'
    }),
    'Dark' : L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png', {
        attribution: 'Mapbox <a href="http://mapbox.com/about/maps" target="_blank">Terms &amp; Feedback</a>'
    }),
  */

  // This was outside of functions, but caused error because L was not available when dual-map.js loaded before leaflet.
  // Not sure if it was working, or if it will contine to work here.
  // Recall existing map https://github.com/leaflet/issues/6298
  // https://plnkr.co/edit/iCgbRjW4aymAjoVoicZQ?p=preview&preview
  L.Map.addInitHook(function () {
    // Store a reference of the Leaflet map object on the map container,
    // so that it could be retrieved from DOM selection.
    // https://leafletjs.com/reference-1.3.4.html#map-getcontainer
    this.getContainer()._leaflet_map = this;
  });

  let community_root = local_app.community_data_root();
  let state_abbreviation = "";
  if (hash.state) {
    state_abbreviation = hash.state.split(",")[0].toUpperCase();
  }

  
  // Might use when height is 280px
  dp.latitude = 31.6074;
  dp.longitude = -81.8854;

  // Georgia
  //dp.latitude = 32.9;
  //dp.longitude = -83.4;
  dp.zoom = 7;

  let theState = $("#state_select").find(":selected").val();
  if (!theState && param["state"]) {
    theState = param["state"].toUpperCase();
  }
  if (theState != "") {
    let kilometers_wide = $("#state_select").find(":selected").attr("km");
    //zoom = 1/kilometers_wide * 1800000;
    zoom = zoomFromKm(kilometers_wide);
    dp.latitude = $("#state_select").find(":selected").attr("lat");
    dp.longitude = $("#state_select").find(":selected").attr("lon");
  }

  dp.listLocation = false; // Hides Waze direction link in list, remains in popup.

  dp.show = show;
  if (show && show.length) {
    $("." + show).show(); // Show layer's divs, after hiding all layer-specific above.
  }
  $("#filterbaroffset").height($("#filterFieldsHolder").height() + "px"); // Adjust incase reveal/hide changes height.

  // Google Sheets must be published with File > Publish to Web to avoid error: "blocked by CORS policy: No 'Access-Control-Allow-Origin' header" 

  //if (dp_incoming && dp_incoming.dataset) { // Parameters set in page or layer json
  //  dp = dp_incoming;
  //} else 

  // Temp - until widget includes local industry lists
  if((show == "industries" || show == "parts" || show == "vehicles" || show == "bioeconomy") && location.href.indexOf('/info') == -1) {
    ////location.href = "/localsite/info/" + location.hash;
    //location.href = "/localsite/info/#show=" + show;
  }

  if (show == "beyondcarbon") {
    dp.listTitle = "Beyond Carbon";
    dp.dataset = "https://assets.bbhub.io/dotorg/sites/40/2019/05/beyondcarbon-States_Territories-data-sample-5_22-data-06_06.csv";
    dp.itemsColumn = "Has [XX] committed to 100% clean energy?"; // For side nav search
    dp.valueColumn = "Has [XX] committed to 100% clean energy?";
    dp.nameColumn = "Has [XX] committed to 100% clean energy?";

  } else if (show == "farmfresh" && state_abbreviation) {
    dp.listTitle = "USDA Farm Produce";
    //if (location.host.indexOf('localhost') >= 0) {
      dp.valueColumn = "type";
      dp.valueColumnLabel = "Type";
      dp.dataset = "https://model.earth/community-data/us/state/" + state_abbreviation.toUpperCase() + "/" + state_abbreviation.toLowerCase() + "-farmfresh.csv";
    //} else {
    //  // Older data
    //  dp.valueColumn = "Prepared";
    //  dp.dataset = local_app.custom_data_root()  + "farmfresh/farmersmarkets-" + state_abbreviation + ".csv";
    //}
    //dp.name = "Local Farms"; // To remove
    dp.dataTitle = "Farm Fresh Produce";

    dp.markerType = "google"; // BUGBUG doesn't seem to work with county boundary background (showShapeMap)
    //dp.showShapeMap = true;

    dp.search = {"In Type": "type","In Market Name": "MarketName","In County": "County","In City": "city","In Street": "street","In Zip": "zip","In Website": "Website"};
    // These were marketname
    dp.nameColumn = "name";
    dp.titleColumn = "name";
    dp.searchFields = "name";
    dp.addressColumn = "street";
    //dp.latColumn = "latitude";
    //dp.lonColumn = "longitude";
    dp.stateColumn = "state";

    dp.addlisting = "https://www.ams.usda.gov/services/local-regional/food-directories-update";
    // community/farmfresh/ 
    dp.listInfo = "Farmers markets and local farms providing fresh produce directly to consumers. <a style='white-space: nowrap' href='https://model.earth/community/farmfresh/'>About Data</a> | <a href='https://www.ams.usda.gov/local-food-directories/farmersmarkets'>Update Listings</a>";
  
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
    dp.listInfo = "View train station arrival times at <a href='https://marta.io/'>MARTA.io</a><br>API enhancements by Code for Atlanta member jakswa. <a href='https://github.com/jakswa/marta_ui'>GitHub</a>"

    // , "In Address": "address", "In County Name": "county", "In Website URL": "website"
    dp.search = {"In Route Number": "ROUTE", "In Vehicle Number": "VEHICLE"}; // Or lowercase?

  } else if (show == "trees" && theState == "CA") {
    dp.listTitle = "Trees";
    dp.dataset = "https://storage.googleapis.com/public-tree-map/data/map.json";
    dp.nameColumn = "name_botanical";
    // , "In Address": "address", "In County Name": "county", "In Website URL": "website"
    dp.search = {"Common Name": "family_common_name", "Family Name": "family_name_botanical", "Botanical Name": "name_botanical"};
  } else if (show == "solar") {
        // Currently showing for all states even though only Georgia solar list in Google Sheet.
        dp.listTitle = "Solar Companies";
        dp.editLink = "https://docs.google.com/spreadsheets/d/1yt_saLpiBNPR1g_r2mn9-U5DozqLoVJHVwfR-4f0HTU/edit?usp=sharing";
        dp.googleDocID = "1yt_saLpiBNPR1g_r2mn9-U5DozqLoVJHVwfR-4f0HTU";
        dp.sheetName = "Companies";
        dp.listInfo = "Post comments in our <a href='https://docs.google.com/spreadsheets/d/1yt_saLpiBNPR1g_r2mn9-U5DozqLoVJHVwfR-4f0HTU/edit?usp=sharing'>Google Sheet</a> to submit map updates.<br>View Georgia's <a href='https://www.solarpowerworldonline.com/2020-top-georgia-contractors/'>top solar contractors by KW installed</a>.";
        dp.valueColumn = "firm type";
        dp.valueColumnLabel = "Firm Type";
        dp.markerType = "google";
        dp.search = {"In Location Name": "name", "In Address": "address", "In County Name": "county", "In Website URL": "website"};      
  } else if (layers == "brigades" || show == "brigades") { // To do: Check an array of layers
        dp.listTitle = "Coding Brigades";
        dp.dataset = "https://neighborhood.org/brigade-information/organizations.json";
        dp.datatype = "json";
        dp.listInfo = "<a href='https://neighborhood.org/brigade-information/'>Source</a> - <a href='https://projects.brigade.network/'>Brigade Project List</a> and <a href='https://neighborhood.org/brigade-project-index/get-indexed/'>About Project Index</a> ";
        dp.markerType = "google"; // BUGBUG doesn't seem to work with county boundary background (showShapeMap)
        // , "In Address": "address", "In County Name": "county", "In Website URL": "website"
        dp.search = {"In Location Name": "name"};
        dp.valueColumn = "type";
        dp.valueColumnLabel = "Type";
        dp.zoom = 4;
  } else if (show == "openepd") {
        dp.listTitle = "Environmental Product Declarations";
        dp.listInfo = "EPD directory data from <a href='https://BuildingTransparency.org' target='_blank'>Building Transparency</a>";
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
        //dp.itemsColumn = "Materials Accepted"; // Needs to remain capitalized. Equivalent to PPE items column, checkboxes

        // https://map.georgia.org/recycling/
        dp.editLink = "";
        dp.listInfo = "<a href='https://map.georgia.org/display/products/'>View active version</a>";
        dp.search = {"In Company Name": "Account Name", "In Industries": "Industries Trade"};

  } else if (theState == "GA") {

      if (show == "opendata") {
        dp.editLink = "https://docs.google.com/spreadsheets/d/1bvD9meJgMqLywdoiGwe3f93sw1IVI_ZRjWSuCLSebZo/edit?usp=sharing";
        dp.dataTitle = "Georgia Open Data";
        dp.listTitle = "Georgia Open Data Resources";
        dp.googleDocID = "1bvD9meJgMqLywdoiGwe3f93sw1IVI_ZRjWSuCLSebZo";
        dp.sheetName = "OpenData";
        dp.itemsColumn = "Category1"; // For side nav search
        dp.valueColumn = "Category1";
        dp.valueColumnLabel = "Type";
        dp.listInfo = "<a href='https://docs.google.com/spreadsheets/d/1bvD9meJgMqLywdoiGwe3f93sw1IVI_ZRjWSuCLSebZo/edit?usp=sharing'>Update Google Sheet</a>.";
        dp.search = {"In Dataset Name": "name", "In Type": "Category1", "In Website URL": "website"};
              
      } else if (show == "360") {
        dp.listTitle = "Birdseye Views";
        //  https://model.earth/community-data/us/state/GA/VirtualTourSites.csv
        dp.dataset =  local_app.custom_data_root() + "360/GeorgiaPowerSites.csv";

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

      } else if (show == "recyclers") {
        dp.listTitle = "Georgia B2B Recyclers";
        dp.adminNote = "maps.g";
        dp.googleCSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBRXb005Plt3mmmJunBMk6IejMu-VAJOPdlHWXUpyecTAF-SK4OpfSjPHNMN_KAePShbNsiOo2hZzt/pub?gid=1924677788&single=true&output=csv";
        dp.googleCategories = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBRXb005Plt3mmmJunBMk6IejMu-VAJOPdlHWXUpyecTAF-SK4OpfSjPHNMN_KAePShbNsiOo2hZzt/pub?gid=381237740&single=true&output=csv";
        dp.nameColumn = "organization name";
        dp.titleColumn = "organization name";
        dp.searchFields = "organization name";
        dp.addressColumn = "address";

        dp.valueColumn = "category";
        dp.valueColumnLabel = "Category";
        dp.catColumn = "Category";
        dp.subcatColumn = "Materials Accepted";
        dp.itemsColumn = "Materials Accepted"; // Needs to remain capitalized. Equivalent to PPE items column, checkboxes

        // https://map.georgia.org/recycling/
        dp.editLink = "https://docs.google.com/spreadsheets/d/1YmfBPEFpfmaKmxcnxijPU8-esVkhaVBE1wLZqPNOKtY/edit?usp=sharing";
        dp.listInfo = "<a href='https://map.georgia.org/recycling/'>Add Recycler Listings</a> or post comments in our <a href='https://docs.google.com/spreadsheets/d/1YmfBPEFpfmaKmxcnxijPU8-esVkhaVBE1wLZqPNOKtY/edit?usp=sharing' target='georgia_recyclers_sheet'>Google&nbsp;Sheet</a>.&nbsp; View&nbsp;<a href='../map/recycling/ga/'>Recycling&nbsp;Datasets</a>.";
        dp.search = {"In Main Category": "Category", "In Materials Accepted": "Materials Accepted", "In Location Name": "organization name", "In Address": "address", "In County Name": "county", "In Website URL": "website"};
      } else if (show == "cameraready") {
        dp.listTitle = "Cameraready";
        dp.datatype = "json";
        dp.dataset = "https://raw.githubusercontent.com/GeorgiaFilm/cameraready_locations_curl/main/cameraready.json";
      } else if (1==2 && (show == "recycling" || show == "transfer" || show == "recyclers" || show == "inert" || show == "landfills")) { // recycling-processors
        if (hash.state == "GA") {
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
            dp.valueColumn = "category"; // Bug - need to support uppercase too.
            dp.valueColumnLabel = "Recycles";
          } else if (show == "landfills") {
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

          dp.listInfo = "<span>View <a href='../map/recycling/ga/'>Recycling Datasets</a>.</span><br>Submit updates by posting comments in our 5 <a href='https://docs.google.com/spreadsheets/d/1YmfBPEFpfmaKmxcnxijPU8-esVkhaVBE1wLZqPNOKtY/edit?usp=sharing'>Google Sheet Tabs</a>.";
          
          //dp.latColumn = "latitude";
          //dp.lonColumn = "longitude";
          dp.search = {"In Location Name": "name", "In Address": "address", "In County Name": "county", "In Website URL": "website"};
        }
      } else if (show == "vehicles" || show == "ev") {
        dp.listTitle = "Motor Vehicle and Motor Vehicle Equipment Manufacturing";
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

        dp.showWhenStatus = "null"
        // Temp, prior to change from Google API 2 to 3
        //dp.dataset = "https://model.earth/georgia-data/automotive/automotive.csv";
        dp.datastates = "GA";
        // Dark green map points indicate electric vehicle parts manufacturing.<br>
        dp.listInfo = "From 2020 to 2022 Georgia added more than 20 EV-related projects. <a href='https://www.georgiatrend.com/2022/07/29/electric-revolution/'>Learn&nbsp;more</a><br>Dark Green: Electric Vehicle (EV) Industry<br>Dark Blue: Internal Combustion Engine (ICE)<br>Post comments in our <a href='https://docs.google.com/spreadsheets/d/1OX8TsLby-Ddn8WHa7yLKNpEERYN_RlScMrC0sbnT1Zs/edit?usp=sharing'>Google Sheet</a> to submit updates.<br><a href='/localsite/info/input/'>Contact Us</a> to help maintain the sheet directly. Learn about <a href='../../community/projects/mobility/'>data sources</a>.";
        dp.valueColumn = "ev industry";
        dp.valueColumnLabel = "EV Industry";
        dp.markerType = "google";
        dp.search = {"EV Industry": "EV Industry", "In Location Name": "name", "In Address": "address", "In County Name": "county", "In Website URL": "website"};
      } else if (show == "vax" || show == "vac") { // Phase out vac
        dp.listTitle = "Vaccine Locations";
        //dp.dataset = "https://docs.google.com/spreadsheets/d/1odIH33Y71QGplQhjJpkYhZCfN5gYCA6zXALTctSavwE/gviz/tq?tqx=out:csv&sheet=Sheet1"; // MapBox sample
        // Link above works, but Google enforces CORS with this link to Vaccine data:
        //dp.dataset = "https://docs.google.com/spreadsheets/d/1q5dvOEaAoTFfseZDqP_mIZOf2PhD-2fL505jeKndM88/gviz/tq?tqx=out:csv&sheet=Sheet3";
        dp.editLink = "https://docs.google.com/spreadsheets/d/1_wvZXUWFnpbgSAZGuIb1j2ni8p9Gqj3Qsvd8gV95i90/edit?ts=60233cb5#gid=698462553";
        dp.googleDocID = "1_wvZXUWFnpbgSAZGuIb1j2ni8p9Gqj3Qsvd8gV95i90";
        dp.sheetName = "Current Availability";
        dp.listInfo = "<br><br><a href='https://docs.google.com/spreadsheets/d/1_wvZXUWFnpbgSAZGuIb1j2ni8p9Gqj3Qsvd8gV95i90/edit?ts=60233cb5#gid=698462553'>Help update Google Sheet data by posting comments</a>.<br><br><a href='https://myvaccinegeorgia.com/'>Preregister with myvaccinegeorgia.com</a> and join the <a href='https://vaxstandby.com/'>VAX Standby</a> list to receive a message when extra doses are available. Also receive text messages on availability from <a href='https://twitter.com/DiscoDroidAI'>Disco Droid</a> or check their <a href='https://twitter.com/DiscoDroidAI'>Tweets</a>.<br><br><a href='https://www.vaccinatega.com/vaccination-sites/providers-in-georgia'>Check provider status</a> at <a href='https://VaccinateGA.com'>VaccinateGA.com</a> and <a href='neighborhood/'>assist with data and coding</a>.";
        // <a href='neighborhood/vaccines/'>view availability and contribute updates</a>
        dp.search = {"In Location Name": "name", "In Address": "address", "In County Name": "county", "In Website URL": "website"};
        // "In Description": "description", "In City Name": "city", "In Zip Code" : "zip"
        dp.valueColumn = "county";
        dp.valueColumnLabel = "County";
        dp.countyColumn = "county";
        dp.itemsColumn = "Category1";
      } else if (show == "smart") { // param["data"] for legacy: https://www.georgia.org/smart-mobility
        dp.dataTitle = "Smart and Sustainable";
        dp.listTitle = "Data Driven Decision Making";
        //dp.listSubtitle = "Smart & Sustainable Movement of Goods & Services";
        dp.industryListTitle = "Mobility Tech";

        console.log("map.js loading " + local_app.custom_data_root() + "communities/map-georgia-smart.csv");

        dp.dataset =  local_app.custom_data_root() + "communities/map-georgia-smart.csv";
        dp.listInfo = "Includes <a href='https://smartcities.gatech.edu/georgia-smart' target='_blank'>Georgia Smart</a> Community Projects. <a href='https://github.com/GeorgiaData/georgia-data/blob/master/communities/map-georgia-smart.csv'>Submit changes</a>";
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

        dp.listInfo = "Select a category to filter your results.";
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
        dp.addLink = "https://www.georgia.org/covid19response"; // Not yet used

      } else if (show == "suppliers" || show == "ppe") {

        // https://docs.google.com/spreadsheets/d/1bqMTVgaMpHIFQBNdiyMe3ZeMMr_lp9qTgzjdouRJTKI/edit?usp=sharing
        dp.listTitle = "Georgia COVID-19 Response"; // Appears at top of list
        //dp.listTitle = "Georgia PPE Suppliers"; // How do we set the layer title for checkbox?
        //dp.editLink = "";
        //dp.googleDocID = "1bqMTVgaMpHIFQBNdiyMe3ZeMMr_lp9qTgzjdouRJTKI"; // Producing 404's
        dp.sheetName = "GA Suppliers List";
        dp.listInfo = "Select a category to the left to filter results. View&nbsp;<a href='https://map.georgia.org/display/products/suppliers/us_ga_suppliers_ppe_2021_08_09.csv' target='_parent'>PDF&nbsp;version</a>&nbsp;of&nbsp;the&nbsp;complete&nbsp;list.";
        dp.dataset = "https://map.georgia.org/display/products/suppliers/us_ga_suppliers_ppe_2021_08_09.csv";

        //dp.dataTitle = "Manufacturers and Distributors";
        dp.dataTitle = "PPE Suppliers";
        dp.itemsColumn = "items";
        dp.valueColumn = "type";
        dp.valueColumnLabel = "Type";
        dp.color = "#ff9819"; // orange - Since there is no type column. An item column is filtered. To do: Pull types from a tab and relate to the first type in each column.
        dp.markerType = "google";
        dp.search = {"In Company Name": "company", "In Items": "items", "In Website URL": "website", "In City Name": "city", "In Zip Code" : "zip"};
        dp.nameColumn = "company";

      } else if (show == "suppliersX" || show == "ppeX") { // "http://" + param["domain"]

        dp.listTitle = "Georgia COVID-19 Response";
        dp.listTitle = "Georgia Suppliers of&nbsp;Critical Items <span style='white-space:nowrap'>to Fight COVID-19</span>"; // For iFrame site
        // https://www.georgia.org/sites/default/files/2021-01 
        dp.listInfo = "Select a category to the left to filter results. View&nbsp;<a href='https://map.georgia.org/display/products/suppliers-pdf/ga_suppliers_list_2021-03-10.pdf' target='_parent'>PDF&nbsp;version</a>&nbsp;of&nbsp;the&nbsp;complete&nbsp;list.";
        dp.dataset = "https://map.georgia.org/display/products/suppliers/us_ga_suppliers_ppe_2021_02_24.csv";
        //dp.dataset = "/display/products/suppliers/us_ga_suppliers_ppe_2020_06_17.csv";

        dp.dataTitle = "Manufacturers and Distributors";
        dp.itemsColumn = "items";
        dp.valueColumn = "type";
        dp.valueColumnLabel = "Type";
        dp.color = "#ff9819"; // orange
        dp.markerType = "google";
        //dp.keywords = "items";
        // "In Business Type": "type", "In State Name": "state", "In Postal Code" : "zip"
        dp.search = {"In Items": "items", "In Website URL": "website", "In City Name": "city", "In Zip Code" : "zip"};
        dp.nameColumn = "title";
        dp.latColumn = "lat_rand";
        dp.lonColumn = "lon_rand";

        if (param["initial"] != "response") {
          dp.nameColumn = "company";
          dp.latColumn = "latitude";
          dp.lonColumn = "longitude";
          dp.showLegend = false;
        }

        dp.listLocation = false;
        dp.addLink = "https://www.georgia.org/covid19response"; // Not yet used

      } else if (show == "restaurants") {
        // Fulton County 5631 restaurants
        dp.listTitle = "Restaurant Ratings";
        dp.dataTitle = "Restaurant Ratings";
        dp.dataset = "/community/tools/map.csv";
        dp.latitude = 32.9;
        dp.longitude = -83.4;

        //dp.showLayer = false;
        dp.name = "Fulton County Restaurants";
        dp.titleColumn = "restaurant";
        dp.nameColumn = "restaurant";

        dp.valueColumnLabel = "Health safety score";
        dp.valueColumn = "score";
        dp.scale = "scaleThreshold";

        dp.latColumn = "latitude";
        dp.lonColumn = "longitude";

        dp.dataset = "/community/farmfresh/usa/georgia/fulton_county_restaurants.csv"; // Just use 50
        dp.dataTitle = "Restaurant Scores";
        dp.titleColumn = "restaurant";
        dp.listInfo = "Fulton County";
      } else if (show == "pickup") {
        // Atlanta Pickup
        dp.latitude = 33.76;
        dp.longitude = -84.3880;
        dp.zoom = 14;

        // CURBSIDE PICKUP
        dp.listTitle = "Restaurants with Curbside Pickup";
        dp.listInfo = "Data provided by coastapp.com. <a href='https://coastapp.com/takeoutcovid/atl/' target='_blank'>Make Updates</a>";
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
        console.log("no show text match for listing map: " + show);
      }

  } // end state GA

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
        dp.scale = "scaleThreshold"; // No effect?
      }
  }
  console.log("loadMap1 dp.zoom " + dp.zoom);

  if(dp.dataset) {
    if (hash.state) {
      dp.dataset = dp.dataset.replace("[jurisdiction]","US-" + hash.state.split(",")[0].toUpperCase());
    } else {
      dp.dataset = dp.dataset.replace("[jurisdiction]","US");
    }
  }
  // Load the map using settings above

  // INIT - geo fetches the county for filtering.
  hash = getHash();
  if (hash.geo) {
    loadGeos(hash.geo,0,function(results) {
      loadFromSheet('map1','map2', dp, basemaps1, basemaps2, 0, function(results) {
        initialHighlight(hash);
      });
    });
  } else {
    if (!hash.state) {
      $(".locationTabText").text("Locations");
    } else {
      $("#state_select").val(hash.state.split(",")[0].toUpperCase());
      $(".locationTabText").text($("#state_select").find(":selected").text());
      $(".locationTabText").attr("title",$("#state_select").find(":selected").text());
    }
    loadFromSheet('map1','map2', dp, basemaps1, basemaps2, 0, function(results) {
      initialHighlight(hash);  
    });
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

  loadIframe("mainframe","https://earth.nullschool.net/#current/wind/surface/level/orthographic=" +  dp.longitude + "," + dp.latitude + ",1381");

}
function initialHighlight(hash) {
  if (hash.name) {
    let locname = hash.name.replace(/_/g," ");

    // console.log("Auto select the first location in list")
    //$("#detaillist > [name='"+locname+"']" ).trigger("click");

    //$("#detaillist").scrollTop($("#detaillist").scrollTop() + $("#detaillist > [name='"+locname+"']" ).position().top);

    // https://stackoverflow.com/questions/2346011/how-do-i-scroll-to-an-element-within-an-overflowed-div?noredirect=1&lq=1

    //var element = document.getElementById("detaillist");
    //element.scrollTop = element.scrollHeight;
    //$("#detaillist").scrollTop(200);

    $("#detaillist").scrollTo("#detaillist > [name='"+locname+"']");

  } else {
    if (!(param["show"] == "suppliers" || param["show"] == "ppe")) {
        // console.log("Auto select the first location in list")
        //$("#detaillist > div:first-of-type" ).trigger("click");
    }
  }
}

jQuery.fn.scrollTo = function(elem) {

    // BUG Reactivate test with http://localhost:8887/localsite/info/#show=ppe&name=Code_the_South
    /*
    if (typeof $(elem) !== "undefined" && typeof $(this) !== "undefined") { // Exists
      $(this).scrollTop($(this).scrollTop() - $(this).offset().top + $(elem).offset().top);
      return this;
    } else {
      // element does not exist
    }
    */
};

function onTabletopLoad(dp1) {
  //createDocumentSettings(tabletop.sheets(constants.informationSheetName).elements); // Custom - remove
  // Custom
  documentSettings = {

  }

  var points = tabletop.sheets(dp1.sheetName).elements;
  //var layers = determineLayers(points);
  if (documentSettings["Map Type:"] === 'Heatmap') {
    //mapHeatmap(points);
  } else {
    //mapPoints(points, layers);
    //displayListVax(points, layers);
  }
  //console.log(points)
}



function loadGeos(geo, attempts, callback) {
  // load only, no search filter display - get county name from geo value.
  // created from a copy of loadStateCounties() in search-filters.js

  if (typeof d3 !== 'undefined') {

    let hash = getHash();
    let stateID = {AL:1,AK:2,AZ:4,AR:5,CA:6,CO:8,CT:9,DE:10,FL:12,GA:13,HI:15,ID:16,IL:17,IN:18,IA:19,KS:20,KY:21,LA:22,ME:23,MD:24,MA:25,MI:26,MN:27,MS:28,MO:29,MT:30,NE:31,NV:32,NH:33,NJ:34,NM:35,NY:36,NC:37,ND:38,OH:39,OK:40,OR:41,PA:42,RI:44,SC:45,SD:46,TN:47,TX:48,UT:49,VT:50,VA:51,WA:53,WV:54,WI:55,WY:56,AS:60,GU:66,MP:69,PR:72,VI:78,}
    //let theState = "GA"; // TEMP - TODO: loop trough states from start of geo
    let theState = hash.state ? hash.state.split(",")[0].toUpperCase() : undefined;
    if (!theState) {
      goHash({'mapview':'state'});
      filterClickLocation();
    }
    //if (theState && theState.includes(",")) {
    //  theState = theState.substring(0, 2);
    //}
    var geos=geo.split(",");
    fips=[]
    for (var i = 0; i < geos.length; i++){
        fip=geos[i].split("US")[1]
        if (fip) {
          if(fip.startsWith("0")){
              fips.push(parseInt(geos[i].split("US0")[1]))
          }else{
              fips.push(parseInt(geos[i].split("US")[1]))
          }
        } else {
          console.log("ALERT: geo value does not start with US.")
        }
    }
    if (geos[0].split("US")[1]) {
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
    } else {
      console.log("ALERT: geos[0].split(US)[1] does not start with US.")
    }

    //Load in contents of CSV file
    if (theState) {
      d3.csv(local_app.community_data_root() + "us/state/" + theState + "/" + theState + "counties.csv").then(function(myData,error) {
        if (error) {
          //alert("error")
          console.log("Error loading file. " + error);
        }
        let geoArray = [];

        myData.forEach(function(d, i) {

          let geoParams = {};
          d.difference =  d.US_2007_Demand_$;

          // OBJECTID,STATEFP10,COUNTYFP10,GEOID10,NAME10,NAMELSAD10,totalpop18,Reg_Comm,Acres,sq_miles,Label,lat,lon
          //d.name = ;
          //d.idname = "US" + d.GEOID + "-" + d.NAME + " County";

          //d.perMile = Math.round(d.totalpop18 / d.sq_miles).toLocaleString(); // Breaks sort
          d.perMile = Math.round(d.totalpop18 / d.sq_miles);

          d.sq_miles = Number(Math.round(d.sq_miles).toLocaleString());
          var activeGeo = false;
          var theGeo = "US" + d.GEOID;
          //alert(geo + " " + theGeo)
          let geos=geo.split(",");
          //fips=[]
          for (var i = 0; i<geos.length; i++){
              if (geos[i] == theGeo) {
                activeGeo = true;
              }
          }


          geoParams.name = d.NAME;
          geoParams.pop = d.totalpop18;
          geoParams.permile = d.perMile;
          geoParams.active = activeGeo;

          geoArray.push([theGeo, geoParams]); // Append a key-value with an object as the value
        });

        console.log("geoArray")
        console.log(geoArray)
        dataObject.geos = geoArray;
        callback();
      });
    }
  } else {
    attempts = attempts + 1;
        if (attempts < 2000) {
          // To do: Add a loading image after a coouple seconds. 2000 waits about 300 seconds.
          setTimeout( function() {
            loadGeos(geo,attempts);
          }, 20 );
        } else {
          alert("D3 javascript not available for loading counties csv.")
        }
  }
}

function getMapframe(element) {
  if (element.virtual_tour) {
    if (element.virtual_tour.toLowerCase().includes("kuula.co")) {
      // viewID resides at the end of Kuula incomoing link.
      let pieces = element.virtual_tour.split("/");
      let viewID = pieces[pieces.length-1];
      // Embed Format: "https://kuula.co/share/collection/" + viewID + "?fs=1&vr=1&zoom=0&initload=1&thumbs=1&chromeless=1&logo=-1";
      element.mapframe = "kuula_" + viewID;
    } else {
      // Incoming: https://roundme.com/tour/463798/view/1595277/
      // Embed Format: https://roundme.com/embed/463798/1595277
      element.mapframe = "roundme_" + element.virtual_tour.replace("https://roundme.com/tour/","").replace("view/","");
    }
  }
  return(element.mapframe);
}

function showList(dp,map) {
  
  console.log("Call showList for " + dp.dataTitle + " list")
  var iconColor, iconColorRGB;
  var colorScale = dp.scale;
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

  isObject = function(a) {
      return (!!a) && (a.constructor === Object);
  };

  if (dp.listTitle) {$(".listTitle").html(dp.listTitle); $(".listTitle").show()};
  if (dp.listSubtitle) {$(".listSubtitle").html(dp.listSubtitle); $(".listSubtitle").show()};

  // Add checkboxes
  console.log("dp.search ")
  console.log(dp.search)

  $("#detaillist").text(""); // Clear prior results
  if (dp.search && $("#activeLayer").text() != dp.dataTitle) { // Only set when active layer changes, otherwise selection overwritten on change.
    
    let search = [];
    if (param["search"]) {
      search = param["search"].replace(/\+/g," ").toLowerCase().split(",");
    }
    let checkCols = "";
    let checked = "";
    $.each(dp.search, function( key, value ) {
      checked = "";
      if (search.length == 0) {
        checked = "checked"; // No hash value limiting to specific columns.
      } else if(jQuery.inArray(value, search) !== -1) {
        checked = "checked";
      }
      checkCols += '<div><input type="checkbox" class="selected_col" name="in" id="' + value + '" ' + checked + '><label for="' + value + '" class="filterCheckboxTitle"> ' + key + '</label></div>';
    });
    $("#selected_col_checkboxes").html(checkCols);
    // Populate from hash
    //alert("populate")


    // BUGBUG - When toggling the activeLayer is added, this will need to be cleared to prevent multiple calls to loadMap1
     
    $('.selected_col[type=checkbox]').change(function() {
        //$('#topPanel').hide();
        let search = $('.selected_col:checked').map(function() {return this.id;}).get().join(','); 
        //alert(search)
        /* delete
        var hash = getHash(); 
        if (hash["q"]) {
          alert(hash["q"])
        }
        */
        if ($("#keywordsTB").val()) {
          updateHash({"search":search});
          loadMap1("map.js keywordsTB");
        }
        event.stopPropagation();
    });

  }

  let hash = getHash();
  var allItemsPhrase = "all categories";
  if ($("#keywordsTB").val()) {
    keyword = $("#keywordsTB").val().toLowerCase();
  } else if (hash.subcat) {
    keyword = hash.subcat;
  } else if (hash.cat) {
    keyword = hash.cat;
  }

  // Filter by all subcategories
  let subcatArray = [];
  let subcatObject = {};
  subcatObject["null"] = {};
  subcatObject["null"].count = 0; // To store a count of rows with no subcategoires
  if (localObject.layerCategories[dp.show] && localObject.layerCategories[dp.show].length >= 0) {
    //if (localObject.layerCategories[dp.show][hash.cat] >= 0) {
      let subcatList = "";
      
      $.each(localObject.layerCategories[dp.show], function(index,value) {
        if (value.Category == hash.cat || !hash.cat) {
          let subcatTitle = value.SubCategoryLong || value.SubCategory;
          subcatList += "<li><a href='#' onClick='goHash({\"cat\":\"" + value.Category + "\", \"subcat\":\"" + value.SubCategory.replace("&","%26") + "\"}); return false;'>" + subcatTitle + "</a></li>";
          subcatArray.push(value.SubCategory);
          if (value.SubCategory.length > 0) {
            //console.log("value.SubCategory " + value.SubCategory)
            subcatObject[value.SubCategory] = {};
            subcatObject[value.SubCategory].count = 0; // A count for matches later
          }
        }
      });
      if (subcatArray.length > 1) {
        if (!hash.name) { // Omit when looking at listing detail
          $("#detaillist").prepend("<ul style='margin:0px'>" + subcatList + "</ul><br>");
        }
      }
    //}
  }

  if ($("#catSearch").val()) {
    products = $("#catSearch").val().replace(" AND ",";").toLowerCase().replace(allItemsPhrase,"");
    products_array = products.split2(/\s*;\s*/);
  }
  if ($("#productCodes").val()) {
    // For each product ID - Still to implement, copied for map-filters.js
    productcodes = $("#productCodes").val().replace(";",",");
    productcode_array = productcodes.split2(/\s*,\s*/); // Removes space when splitting on comma
  }

  let selected_col = [];
  selected_col = $('.selected_col:checked').map(function() {return this.id;});
  //let selected_columns_object = {}; // For count of each

  if (selected_col.length == 0 && keyword && keyword != allItemsPhrase && products_array.length == 0) {
    $("#keywordFields").show();
    alert("Please check at least one column to search.")
  }
  var data_sorted = []; // An array of objects
  var data_out = [];
  let catList = {}; // An array of objects, one for each unique category
  if (localObject.layerCategories[hash.show] && localObject.layerCategories[hash.show].toLowerCase >= 0) {
    catList = localObject.layerCategories[hash.show];
  }

  

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

  console.log("showlist() VIEW DATA (dp.data) ")
  console.log(dp.data)

  dp.data.forEach(function(elementRaw) {
    count++;
    foundMatch = 0;
    productMatchFound = 0;

    if (count > 4000) {
        return;
    }

    let showIt = true;
    if (hash["name"] && elementRaw["name"]) { // Match company name from URL to isolate as profile page.
      //console.log("elementRaw[name] " + elementRaw["name"]);
      if (hash["name"].replace(/\_/g," ") == elementRaw["name"]) {
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

    // count "filtered" populated for active rows only
    if (localObject.layerCategories[dp.show] && localObject.layerCategories[dp.show].length >= 0) {
      if (elementRaw[dp.catColumn].length > 0 && elementRaw[dp.catColumn] == hash.cat) {
        if (dp.subcatColumn && elementRaw[dp.subcatColumn].length <= 0) {
          subcatObject["null"].count = subcatObject["null"].count + 1;
        } else {
          // Walk the array of possible subcats for the category.
          // Since some will have multiple subcats
          // This could be performed asynchronously during second iteration of rows.

          // Should we walk on the current subcatObject?
          console.log(localObject.layerCategories[dp.show])
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
    }

    //if (keyword.length > 0 || products_array.length > 0 || productcode_array.length > 0) {

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

          //console.log('Begin foundMatch');
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

          } else {
            // PPE arrives here even with cat
            foundMatch++; // No geo or keyword filter
          }

          //console.log("foundMatch " + foundMatch)
          //if (1==2) { // Not yet tested here
            console.log("Check if listing's product HS codes match.");
            for(var pc = 0; pc < productcode_array.length; pc++) { 
              if (productcode_array[pc].length > 0) {
                if (isInt(productcode_array[pc])) { // Int
                  //var codesArray = $(this.childNodes[3]).text().replace(";",",").split(/\s*,\s*/);
                  var codesArray = dataSet[i][5].toString().replace(";",",").split2(/\s*,\s*/);
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

    //} else {
    //  // Automatically find match since there are no filters
    //  //console.log("foundMatch - since no filters");
    //  foundMatch++;
    //}

    //console.log("foundMatch: " + foundMatch + ", productMatchFound: " + productMatchFound);

    if (foundMatch == 0 && productMatchFound == 0) {
      if (subcatArray.length > 0) {
        let subcatColumn = "SubCategory";
        if (dp.subcatColumn) {
          subcatColumn = dp.subcatColumn;
        }
        if (elementRaw[subcatColumn].length > 0) {
          for (const subcat of subcatArray) {
              //console.log("What: " + elementRaw[subcatColumn] + " - " + subcat);
              if (elementRaw[subcatColumn] && elementRaw[subcatColumn].indexOf(subcat) >= 0) {
                //alert("fount subcat")
                foundMatch++;
              }
          }
        }
      }
    }

    var key, keys = Object.keys(elementRaw);
    var n = keys.length;
    var element={};
    let output = "";
    let output_details = "";
    let avoidRepeating = ["description","address","website","phone","email","email address","county","admin note","your name","organization name","cognito_id"];
    while (n--) {
      key = keys[n];
      //element[key] = elementRaw[key]; // Also keep uppercase for element["Prepared"]
      element[key.toLowerCase()] = elementRaw[key];
      if (hash.details == "true") {
        if (key && elementRaw[key]) {
          if (avoidRepeating.indexOf(key.toLowerCase()) < 0) {
            output_details += "<b>" + key + "</b>: " + elementRaw[key] + "<br>";
          }
        }
      }
    }

    iconColor = colorScale(element[dp.valueColumn]);
    if (dp.color) { 
      iconColor = dp.color;
    }
    //iconColorRGB = hex2rgb(iconColor);
    //console.log("element state2 " + element.state + " iconColor: " + iconColor)

    //console.log("element[dp.valueColumn] " + element[dp.valueColumn]);
    if (dp.valueColumn) {
      // Requires only ONE category value in the valueColumn.
      if(!catList[element[dp.valueColumn]]) {
        catList[element[dp.valueColumn]] = {};
        catList[element[dp.valueColumn]].count = 1;
      } else {
        catList[element[dp.valueColumn]].count++;
      }
      catList[element[dp.valueColumn]].color = iconColor;
    }
    // BUGBUG - Is it valid to search above before making key lowercase? Should elementRaw key be made lowercase?

    //if (foundMatch > 0 && productMatchFound > 0) {
    if (foundMatch > 0 || productMatchFound > 0) {
      dataMatchCount++;
    //if (count <= 500) {

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
      if (!jQuery.isEmptyObject(element.status) && (element.status != "Update" && element.status != "Active")) {
          if (dp.showWhenStatus != "null") { // Allow status column to be blank. Used by EV.
            foundMatch = 0;
          }
      } else {
        validRowCount++;
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
      element.mapframe = getMapframe(element);

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
        // colorScale(element[dp.valueColumn])
        //console.log("iconColor test here: " + iconColor)
        //console.log("color test here: " + colorScale(elementRaw[dp.valueColumn]))

        if (dp.latColumn.includes(".")) { // ToDo - add support for third level
          element[dp.latColumn] = element[dp.latColumn.split(".")[0]][dp.latColumn.split(".")[1]];
          element[dp.lonColumn] = element[dp.lonColumn.split(".")[0]][dp.lonColumn.split(".")[1]];
        }

        // Hide all until displayed after adding to dom
        if (element[dp.latColumn] && element[dp.lonColumn]) {
          output += "<div style='display:none' class='detail' name='" + name.replace(/'/g,'&#39;') + "' latitude='" + element[dp.latColumn] + "' longitude='" + element[dp.lonColumn] + "'>";
        } else {
          output += "<div style='display:none' class='detail' name='" + name.replace(/'/g,'&#39;') + "'>";
        }

        output += "<div class='showItemMenu' style='float:right'>&mldr;</div>"; 
        output += "<div style='padding-bottom:4px'><div style='width:15px;height:15px;margin-right:6px;margin-top:8px;background:" + colorScale(elementRaw[dp.valueColumn]) + ";float:left'></div>";

        //output += "<div style='position:relative'><div style='float:left;min-width:28px;margin-top:2px'><input name='contact' type='checkbox' value='" + name + "'></div><div style='overflow:auto'><div>" + name + "</div>";
                  
        //output += "<div style='overflow:auto'>";
        
        output += "<b style='font-size:20px; font-weight:400; color:#333;'>" + name + "</b></div>";
        if (element[dp.description]) {
          output += "<div style='padding-bottom:8px'>" + element[dp.description] + "</div>";
        } else if (element.description) {
          output += "<div style='padding-bottom:8px'>" + element.description + "</div>";
        } else if (element["business description"]) {
          output += "<div style='padding-bottom:8px'>" + element["business description"] + "</div>";
        }

        // Lower
        output += "<div style='font-size:0.95em;line-height:1.5em'>";

        if (element.items) {
          output += "<b>Items:</b> " + element.items + "<br>";
        }
        
        if (element[dp.addressColumn]) { 
            output +=  element[dp.addressColumn] + "<br>"; 
        } else if (element.address || element.city || element.state || element.zip) {
          output += "<b>Location:</b> ";
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
            if (element.city || element.state || element.zip) {
              output += "<br>";
            }
          }
        }
        if (element.county) {
          output += '<b>Location:</b> ' + element.county + " County<br>";
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
        if (element[dp.showKeys]) {
          output += "<b>" + dp.showLabels + ":</b> " + element[dp.showKeys] + "<br>";
        }

        if(output_details) {
          //output += "<br>Details:<br>" + output_details;
          output += output_details;
        }

        output += "<div style='height:10px'></div>";
        if (element.mapframe) {
            output += "<a href='#show=360&m=" + element.mapframe + "'>Birdseye View<br>";
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
            googleMapLink += ', ' + hash.state;
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
            output += "&nbsp; | &nbsp;<a href='" + window.location + "&details=true'>Details</a>";
          } else {
            output += "&nbsp; | &nbsp;<a href='" + window.location + "&name=" + name.replace(/ /g,"+") + "&details=true'>Details</a>";
          }
        }
        if (dp.editLink) {
          if (googleMapLink) {
            output += "&nbsp; | &nbsp;"
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

        
        if (element.distance) {
            output += "<b>Distance:</b> " + element.distance + " miles<br>"; 
          
        }

        if (dp.skips) {
          dp.skips = "," + dp.skips + ",";
          for (i in element) {
            if (element[i] != null && dp.skips.indexOf("," + i + ",") == -1) {
              output += "<b>" + i + ":</b> " + element[i] + "<br>"; 
            }
          }
        }

        output += "</div>"; // End Lower
        output += "</div>"; // End detail
        
        // Here display:none is used when listings are excluded. Do we use script to show these, or simply re-run the list?
        $("#detaillist").append(output);
      }
    }
  });
  $("#detaillist").append("<div style='height:60px'></div>"); // For space behind absolute buttons at bottom.

  /*
  if (localObject.layerCategories[dp.show].length >= 0) {
    //alert("found")
    let subcatList = "";
    $.each(localObject.layerCategories[dp.show], function(index,value) {
      //$('select.mrdDisplayBox').addOption(value.Id, value.Id + ' - ' + value.Number, false);
      subcatList += value.SubCategory + "<br>";
    });
    $("#detaillist").prepend(subcatList);
  }
  */
  $("#detaillist").prepend("<hr>");
  if (subcatObject["null"].count > 0) {
    $("#detaillist").prepend(hash.cat + " rows needing subcategory: " + subcatObject["null"].count);
  }
  console.log("Total " + dp.dataTitle + " " + countDisplay + " of " + count);

  if (hash.show != showprevious || $("#tableSide > .catList").text().length == 0) { // Prevents selected category from being overwritten.
    renderCatList(catList);
  }
  if (hash.name && $("#detaillist > [name='"+ hash.name.replace(/_/g,' ') +"']").length) {
    let listingName = hash.name.replace(/_/g,' ');
    $("#detaillist > [name='"+ listingName.replace(/'/g,'&#39;') +"']").show(); // To do: check if this or next line for apostrophe in name.
    $("#detaillist > [name='"+ listingName +"']").show();
    // Clickit
    setTimeout(function(){  
      $("#detaillist > [name='"+ listingName +"']" ).trigger("click"); // Not working to show close-up map
    }, 100);
  } else {
    $("#detaillist .detail").show(); // Show all
  }
    //$("#detaillist > [name='"+ name.replace(/'/g,'&#39;') +"']").show();

  // BUGBUG - May need to clear first to avoid multiple calls.
  $('.detail').mouseover(
      function() { 
        //popMapPoint(dp, map, $(this).attr("latitude"), $(this).attr("longitude"));
      }
  );

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
  locmenu += "<div class='filterBubble'>";
  locmenu += "<div id='hideSidemap' class='close-X' style='position:absolute;right:0px;top:8px;padding-right:10px;color:#999'>&#10005; Close Map</div>";
  locmenu += "</div>";
  locmenu += "</div>";
  //$("#sidemapbar").prepend(locmenu);

  let searchFor = "";
  if (dp.listInfo) {
    searchFor += dp.listInfo;
    searchFor += "<hr styleX='margin-bottom:16px'>";
  }
  if (dataMatchCount > 0) {
      if (searchFor) {
        //searchFor += "<br>"
      }
      if ($("#catSearch").val() && hash.cat) {
        searchFor += "<b>" + $("#catSearch").val() + "</b>";
      }
      if (hash.subcat) {
        searchFor += "<b>: " + hash.subcat + "</b>";
      }
      if (hash.cat) {
        searchFor += " - ";
      }
      if (countDisplay == validRowCount) {
        if (countDisplay == 1) {
          searchFor += countDisplay + " active record. ";
        } else {
          searchFor += countDisplay + " active records. ";
        }
        console.log("Active records: ") + countDisplay;
        console.log("Rows: ") + count;
      } else if (count==1) {
        searchFor += countDisplay + " displayed from " + validRowCount + " active record. ";
      } else if (validRowCount > 0) { // Hide when status row is not in use.
        searchFor += countDisplay+ " displayed from " + validRowCount  + " active records. ";
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
      // We're not using "loc" yet, but it seems better than using id to avoid conflicts.
      // Remove name from hash to trigger refresh
      searchFor += " <span class='viewAllLink' style='display:none;'><a onclick='goHash({},[\"name\",\"loc\",\"cat\",\"subcat\"]); return false;' href='#show=" + param["show"] + "'>View All</a></span>";

      $("#dataList").html(searchFor);
      $("#resultsPanel").show();
      $("#dataList").show();

      //console.log(selected_col);
      //alert(selected_columns_object[2].value)
  } else {
      $("#dataList").html("No match found in " + count + " records. <a href='' onclick='return clearButtonClick();'>Clear Filters</a><br>");
          
    var noMatch = "<div>No match found in " + (dataSet.length - 1) + " records. <a href='' onclick='return clearButtonClick();'>Clear filters</a>.</div>"
    $("#nomatchText").html(noMatch);
    $("#nomatchPanel").show();
  }

  $(document).click(function(event) { // Hide open menus
      $('#listingMenu').hide();
      $('#locMenu').hide();
  });

  dp.data = data_out;
  return dp;
}
function renderCatList(catList) {
  console.log("catList");
  console.log(catList);
  // Using param since hash.show is not available when passed in on localsite.js embed link.
  if (param.show != "ppe" && param.show != "suppliers") { // PPE cats are still hardcoded in localsite/map/index.html. "suppliers" is used in site embed
      if (catList && Object.keys(catList).length > 0) {
        let catNavSide = "<div class='all_categories'>All Categories</div>";

        Object.keys(catList).forEach(key => {
          if (key != "") {
            catNavSide += "<div style='background:" + catList[key].color + ";padding:0px;width:13px;height:13px;border:1px solid #ccc;margin-top:12px;margin-left:12px;margin-right:5px;float:left'></div><div title='" + key + "' style='min-height:38px'>" + key + "<span class='local'>&nbsp;(" + catList[key].count + ")</span></div>";
          }
        });
        //console.log(catNavSide)
        $("#tableSide").html(""); // Clear
        $("#tableSide").append("<div class='catList' style='white-space:nowrap; margin:15px; margin-left:10px;'>" + catNavSide + "</div>");
        //alert("did it 3")
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

// For stateImpact colors

var colorTheStateCarbon = d3.scaleThreshold()
    .domain(d3.range(2, 10))
    .range(d3.schemeBlues[9]);

var colorTheCountry = d3.scaleThreshold()
    .domain(d3.range(2, 1000000))
    .range(d3.schemeBlues[9]);

function popMapPoint(dp, map, latitude, longitude, name) {
  //return;
  let center = [latitude,longitude];

  // BUGBUG - causes map point on other map to temporarily disappear.
  //map.flyTo(center, 15); // 19 in lake

  // Because flyTo causes points on other map to disappear
  map.setView(center, 11);

  // Add a single map point
  var iconColor, iconColorRGB, iconName;
  var colorScale = dp.scale;

  iconColor = "#440";
  if (dp.color) {
    iconColor = dp.color;
  }
  iconColorRGB = hex2rgb(iconColor);
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

  // To do: Make this point clickable. Associate popup somehow.
  circle = L.marker([latitude,longitude], {icon: busIcon}).addTo(map)
  circle.bindPopup(name);


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
  if (param["initial"] == "response") {
    if (dp.public == "Yes") {
      $(".suppliers_pre_message").hide();
    } else {
      //alert(dp.public)
      $(".suppliers_pre_message").show();
    }
  }
}

// Scales: http://d3indepth.com/scales/
function getScale(data, scaleType, valueCol) {
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
      .domain(data.map(function(d) { return d[valueCol]; }))
      .range(d3.schemePaired);
  }
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
/*
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
*/
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
$('#sidecolumnContent a').click(function(event) {
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
  var hangover = 10; // Extend into the next section, so map remains visible.
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
    $("#headerLarge").addClass("headerLargeHide"); $('.headerbar').hide(); $('.headerOffset').hide(); $('#logoholderbar').show(); $('#logoholderside').show();
    $("#filterFieldsHolder").addClass("filterFieldsHolderFixed");
    if (param.showheader != "false") {
      $('.showMenuSmNav').show(); 
    }
    $('#filterFieldsHolder').hide();
    $('.headerOffset').hide();

    $('#sidecolumnContent').css("top","54px");
    $('#showSide').css("top","7px");

    if (!$("#filterFieldsHolder").is(':visible')) { // Retain search filters space at top, unless they are already hidden
      $('#headerLarge').hide();
    }
    
    revealHeader = true; // For next manual scroll
  } else if ($(window).scrollTop() > previousScrollTop) { // Scrolling Up
    if ($(window).scrollTop() > previousScrollTop + 20) { // Scrolling Up fast
      $("#headerLarge").addClass("headerLargeHide"); $('.headerbar').hide(); $('.headerOffset').hide(); $('#logoholderbar').show(); 

      // BUGBUG - occuring on initial reload when page is a little from top.
      //$('#logoholderside').show();
      //alert("load")

      $("#filterFieldsHolder").addClass("filterFieldsHolderFixed");
      if (param.showheader != "false") {
        $('.showMenuSmNav').show(); 
      }
      //$('#filterFieldsHolder').hide();
      $('.headerOffset').hide();
      //alert("4")
      $('#sidecolumnContent').css("top","54px");
      $('#showSide').css("top","7px");
      if (!$("#filterFieldsHolder").is(':visible')) { // Retain search filters space at top, unless they are already hidden
        $('#headerLarge').hide();
      }
    }
  } else { // Scrolling Down
    if ($(window).scrollTop() < (previousScrollTop - 20)) { // Reveal if scrolling down fast
      $("#headerLarge").removeClass("headerLargeHide"); $('.headerbar').show(); $('#logoholderbar').hide(); $('#logoholderside').hide();
      //$('#filterFieldsHolder').show();
      $("#filterFieldsHolder").removeClass("filterFieldsHolderFixed");
      if ($("#headerbar").length) {
        if (param.showheader != "false") {
          $('.headerOffset').show();
          $('.showMenuSmNav').hide();
        }
        $('#sidecolumnContent').css("top","150px");
        $('#showSide').css("top","108px");
      }
      $('#headerLarge').show();
    } else if ($(window).scrollTop() == 0) { // At top
      $("#headerLarge").removeClass("headerLargeHide"); $('.headerbar').show(); $('#logoholderbar').hide(); $('#logoholderside').hide();
      //$('#filterFieldsHolder').show();
      $("#filterFieldsHolder").removeClass("filterFieldsHolderFixed");
      if ($("#headerbar").length) {
        if (param.showheader != "false") {
          $('.headerOffset').show();
          $('.showMenuSmNav').hide();
        }
        $('#sidecolumnContent').css("top","150px");
        $('#showSide').css("top","108px");
      }
      $('#headerLarge').show();
    }
  }
  previousScrollTop = $(window).scrollTop();

  lockSidemap(mapFixed);
  let headerFixedHeight = $("#headerLarge").height();
  $('#sidecolumnContent').css("top",headerFixedHeight + "px");
});
function lockSidemap() {
  // Detect when #hublist is scrolled into view and add class mapHolderFixed.
  // Include mapHolderBottom when at bottom.
  if (bottomReached('#hublist')) {
    if (mapFixed==true) { // Only unstick when crossing thresehold to minimize interaction with DOM.
      //console.log('bottom Visible');
      $('#mapHolderInner').removeClass('mapHolderFixed');
      $('#mapHolderInner').addClass('mapHolderBottom');
      // Needs to be at bottom of dev
      mapFixed = false;
    }
  } else if (topReached('#hublist')) {
    if (mapFixed==false) {
      let mapHolderInner = $('#mapHolderInner').width();
      //alert(mapHolderInner)
      $('#mapHolderInner').addClass('mapHolderFixed');
      $("#mapHolderInner").css("width",mapHolderInner);
      $('#mapHolderInner').removeClass('mapHolderBottom');
      //alert("fixed position")
      mapFixed = true;
    }
  } else if(!topReached('#hublist') && mapFixed == true) { // Not top reached (scrolling down)
    $('#mapHolderInner').removeClass('mapHolderFixed');
    mapFixed = false;
  }
}

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

// To do: try moving back to map=filters.js
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

function styleShape(feature) { // Called FOR EACH topojson row

  let hash = getHash(); // To do: pass in as parameter
  //console.log("feature: ", feature)

  var fillColor = 'rgb(51, 136, 255)'; // 
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
  } else if (hash.mapview == "country" && hash.state && hash.state.includes(stateID)) {
      fillColor = 'red';
      fillOpacity = .2;
  } else if (hash.mapview == "countries") {
      let theValue = 2;
      //console.log("country: " + (feature.properties.name));
      if (localObject.countries && localObject.countries[feature.id]) {
        //alert("Country 2020 " + localObject.countries[feature.id]["2020"]);
        theValue = localObject.countries[feature.id]["2020"];
      }
      // TO DO - Adjust for 2e-7
      theValue = theValue/10000000;
      fillColor = colorTheCountry(theValue);
      console.log("fillColor: " + fillColor + "; theValue: " + theValue + " " + feature.properties.name);
      fillOpacity = .5;
  } else if ((hash.mapview == "country" || (hash.mapview == "state" && !hash.state)) && typeof localObject.state != 'undefined') {
      let theValue = 2;
       if (localObject.state[getState(stateID)] && localObject.state[getState(stateID)].CO2_per_capita != "No data") {
        console.log(stateID + " " + getState(stateID));
        console.log(stateID + " " + localObject.state[getState(stateID)].CO2_per_capita);
        theValue = localObject.state[getState(stateID)].CO2_per_capita;
      }
      theValue = theValue/4; // Ranges from 0 to 26
      fillColor = colorTheStateCarbon(theValue);
      console.log("fillColor: " + fillColor + "; theValue: " + theValue + " " + feature.properties.name);
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

function getIDfromStateName(stateName) {
  let theStateID;
  $("#state_select option").map(function(index) {
    if ($("#state_select option").get(index).text == stateName) {
      theStateID = $("#state_select option").get(index).value.toString();
    }
  });
  return(theStateID);
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

// DISPLAY geomap - first of three maps

var geojsonLayer; // Hold the prior letter. We can use an array or object instead.
var overlays = {}; // Also overlays1 and overlays2 above.
function renderMapShapes(whichmap, hash, attempts) {
  //alert("renderMapShapes state: " + hash.state + " attempts: " + attempts);

  loadScript(local_app.modelearth_root() + '/localsite/js/topojson-client.min.js', function(results) {
    
    renderMapShapeAfterPromise(whichmap, hash, attempts);

  });
}

function renderMapShapeAfterPromise(whichmap, hash, attempts) {


  // Same as https://unpkg.com/topojson-client@3

  //alert(whichmap + " " + local_app.modelearth_root() + '/localsite/js/topojson-client.min.js');
  // Oddly, this is still reached when 404 returned by call to topojson-client.min.js above.

  //alert(local_app.modelearth_root() + '/localsite/js/topojson-client.min.js')
  
  if (typeof topojson != "undefined") {
    console.log("renderMapShapes - topojson-client.min.js loaded for #" + whichmap + " after " + attempts + " attempts.");
  } else {
    if (attempts <= 100) {
      setTimeout(function(){
        renderMapShapes(whichmap, hash, attempts+1);
      }, 100);
    } else {
      console.log("Failed to load topojson from topojson-client.min.js for #" + whichmap + " after 100 attempts.")
    }
    return;
  }

  let stateAbbr = "";
  if (hash.state) {
    stateAbbr = hash.state.split(",")[0].toUpperCase();
  }
  // In addition, the state could also be derived from the geo values.

  var stateCount = typeof hash.state !== "undefined" ? hash.state.split(",").length : 0;
  if (stateCount > 1 && hash.mapview != "country") {
    hash.state.split(",").forEach(function(state) {
      hashclone = $.extend(true, {}, hash); // Clone/copy object without entanglement
      hashclone.state = state.toUpperCase(); // One state at a time
      //alert(whichmap + " renderMapShapes attempt " + attempts + "  " + hashclone.state);
      renderMapShapes(whichmap, hashclone, 0); // Using clone since hash could be modified mid-loop by another widget,
    });
    return;
  }

  if (stateAbbr == "GA") { // TO DO: Add regions for all states
    $(".regionFilter").show();
  } else {
    $(".regionFilter").hide();
  }
  $("#state_select").val(stateAbbr); // Used for lat lon fetch


  $("#geoPicker").show();
  if (!$("#" + whichmap).is(":visible")) {
    console.log("Error: whichmap not visible " + whichmap);
    return; // Prevents incomplete tiles
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
  if (hash.mapview == "zip") {
    layerName = "Zipcodes";
    if (stateAbbr) {
      url = local_app.modelearth_root() + "/community-forecasting/map/zcta/states/" + getState(stateAbbr) + ".topo.json";
    } else {
      url = local_app.modelearth_root() + "/community-forecasting/map/zip/topo/zips_us_topo.json";
    }
    topoObjName = "topoob.objects.data";
    $("#geomap").width("700px");
  }  else if (hash.mapview == "country" && stateAbbr.length != 2) { // USA
    layerName = "States";
    url = local_app.modelearth_root() + "/localsite/map/topo/states-10m.json";
    topoObjName = "topoob.objects.states";
    $("#geomap").width("700px");
    //$(".geoListHolder").hide();
  } else if (stateAbbr && stateAbbr.length <= 2) { // COUNTIES
    layerName = stateAbbr + " Counties";
    let stateNameLowercase = getStateNameFromID(stateAbbr).toLowerCase();
    let countyFileTerm = "-counties.json";
    let countyTopoTerm = "_county_20m";
    if (stateNameLowercase == "louisiana") {
      countyFileTerm = "-parishes.json";
      countyTopoTerm = "_parish_20m";
    }

    //$("#geomap").width("440px");
    $("#geomap").width("700px");
    //$(".geoListHolder").show();
    url = local_app.modelearth_root() + "/topojson/countries/us-states/" + stateAbbr + "-" + state2char + "-" + stateNameLowercase.replace(/\s+/g, '-') + countyFileTerm;
    topoObjName = "topoob.objects.cb_2015_" + stateNameLowercase.replace(/\s+/g, '_') + countyTopoTerm;

    //url = local_app.modelearth_root() + "/opojson/countries/us-states/GA-13-georgia-counties.json";
    // IMPORTANT: ALSO change localhost setting that uses cb_2015_alabama_county_20m below
  } else { // ALL COUNTIRES
  //} else if (hash.mapview == "earth") {
    if (hash.mapview == "earth") {
      hideAdvanced();
      showGlobalMap();
    } 

    url = local_app.modelearth_root() + "/topojson/world-countries-sans-antarctica.json";
    topoObjName = "topoob.objects.countries1";
  }

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
          //        layerControl[whichmap].clearLayers();

          

          //console.log('neigh', neighbors)
       //}
      //catch(e){
      //  geojson = {};
      //   console.log(e)
      //}


      //console.log(topodata)




    //// USA
    //var lat = 38.3;
    //var lon = -96.5;
    //var zoom = 5;

    // Georgia 32.1656° N, 82.9001° W
    

    if (hash.mapview == "earth" && theState == "") {
      zoom = 2
      lat = "25"
      lon = "0"
    } else if (hash.mapview == "country" && theState == "") {
      zoom = 4
      lat = "39.5"
      lon = "-96"
    } else if ($("#state_select").find(":selected").attr("lat")) {
      let kilometers_wide = $("#state_select").find(":selected").attr("km");
      zoom = zoomFromKm(kilometers_wide);
      lat = $("#state_select").find(":selected").attr("lat");
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
      overlays[layerName] = L.geoJson(topodata, {style:styleShape, onEachFeature: onEachFeature}).addTo(map); // Called within addTo(map)
  
      layerControl[whichmap] = L.control.layers(basemaps1, overlays).addTo(map); // Push multple layers
      basemaps1["Grey"].addTo(map);


  //} else if (geojsonLayer) { // INDICATES TOPO WAS ALREADY LOADED
  } else if (map.hasLayer(overlays[layerName])) {

    // TESTING
    //alert("HAS LAYER " + layerName)

      // Add 
    //geojsonLayer = L.geoJson(topodata, {style:styleShape, onEachFeature: onEachFeature}).addTo(map); // Called within addTo(map)
  
    //map.removeLayer(overlays[layerName]);

    // layerControl[whichmap]
    map.removeLayer(overlays[layerName]); // Removed overlay but not checkbox. (Temp reduction of doubling)

    //map.removeOverlay(overlays[layerName]);

    //layerControl[whichmap].addOverlay(overlays[layerName], layerName); // Sorta works - use to add a duplicate check box
    
    //layerControl[whichmap].removeOverlay(layerName);
    //layerControl[whichmap].removeOverlay(overlays[layerName], layerName);

    overlays[layerName] = L.geoJson(topodata, {
          style: styleShape, 
          onEachFeature: onEachFeature
    }).addTo(map);

    /*
    var geojsonLayer = L.geoJson(topodata, {
          style: styleShape, 
          onEachFeature: onEachFeature
    }).addTo(map);
    overlays[layerName] = geojsonLayer;
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

        //alert(overlays[layerName])
        overlays[layerName].remove(); // Prevent thick overlapping colors
        //overlays[layerName].clearLayers();
        map.removeLayer(overlays[layerName]);
      
      //map.geojsonLayer.clearLayers(); // Clear prior
      */

      map.setView(mapCenter,zoom);

      // setView(lng, lat, zoom = zoom_level)
    

      
  } else { // Add the new state

    overlays[layerName] = L.geoJson(topodata, {
          style: styleShape, 
          onEachFeature: onEachFeature
    }).addTo(map);

    map.setView(mapCenter,zoom);
  }
  



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





  /// JUNK, probably

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
      //overlays[ele.name] = ele.group; // Allows for use of dp.name with removeLayer and addLayer
      //console.log("Layer added: " + ele.name);
    //})

    //if(layerControl[whichmap] === false) { // First time, add new layer
      // Add the layers control to the map
    //  layerControl_CountyMap = L.control.layers(baseLayers, overlays).addTo(map);
    //}

    if (typeof layerControl != "undefined") {
      //alert("OKAY: layerControl is available to CountyMap.")

      // layerControl object is declared in map.js. Contains element for each map.
      if (layerControl[whichmap] != undefined) {
        if (overlays[stateAbbr + " Counties"]) {
          // Reached on county click, but shapes are not removed.
          //console.log("overlays: ");
          //console.log(overlays);
          
          //resetHighlight(layerControl[whichmap].);
          // No effect
          //layerControl[whichmap].removeLayer(overlays["Counties"]);

          //geojsonLayer.remove();

          // Might work a little

          //alert("Remove the prior topo layer")
          //map.removeLayer(geojsonLayer); // Remove the prior topo layer
        }
    }

      // layerControl wasn't yet available in loading sequence.
      // Could require localsite/js/map.js load first, but top maps might not always be loaded.
      // Or only declare layerControl object if not yet declared.

      if (map) {
          if (layerControl[whichmap] == undefined) { //NEW MAP
            //TESTING
            //alert("NEW MAP " + whichmap)

            //overlays = {
            //  [layerName]: geojsonLayer
            //};
            //overlays[layerName] = geojsonLayer;


            //layerControl[whichmap] = L.control.layers(basemaps1, overlays).addTo(map); // Push multple layers
            //basemaps1["Grey"].addTo(map);



            // layerControl[whichmap]
        
            /*
            // create the master layer group
            var masterLayerGroup = L.layerGroup().addTo(map);

            // create layer groups
            var aLayerGroup = L.layerGroup([
              // create a bunch of layers
            ]);

            masterLayerGroup.addLayer(aLayerGroup);
            */

          //} else if (!overlays[layerName]) {
          } else if (!map.hasLayer(overlays[layerName])) { // LAYER NOT ADDED YET

            // Error: Cannot read property 'on' of undefined
            //layerControl[whichmap].addOverlay(dp.group, dp.dataTitle); // Appends to existing layers
            //alert("Existing " + whichmap + " has no overlay for: " + layerName)

            

            //if(map.hasLayer(geojsonLayer)) {
              //alert("HAS LAYER")
              //map.removeLayer(geojsonLayer); // Remove the prior topo layer - BUGBUG this hid the new layer.
              ////map.geojsonLayer.clearLayers();
            //}

            //overlays[layerName] = geojsonLayer; // Add element to existing overlays object.

            //overlays[layerName] = stateAbbr + " Counties";

            // Add dup
            //layerControl[whichmap].addOverlay(geojsonLayer, stateAbbr + " Counties");


            //layerControl[whichmap].addLayer(stateAbbr + " Counties");
            //layerControl[whichmap].addOverlay(geojsonLayer, overlays);

            //layerControl[whichmap].addOverlay(basemaps1, overlays); // Appends to existing layers
            //layerControl[whichmap] = L.control.layers(basemaps1, overlays).addTo(map); 
          } else {
            //alert("DELETE ALL OF THIS PART layer already exists2: " + layerName);
            //overlays[layerName].remove(); // Also above
            
            //map.removeLayer(overlays[layerName]);
            //layerControl[whichmap].removeOverlay(overlays[layerName]);

            console.log("getOverlays");
            console.log(layerControl[whichmap].getOverlays());
            if (location.host.indexOf('localhost') >= 0) {
              let layerString = "";
              Object.keys(layerControl[whichmap].getOverlays()).forEach(key => {
                layerString += key;
                if (layerControl[whichmap].getOverlays()[key]) {
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

      if(layerControl === false) {
        //layerControl = L.control.layers(baseLayers, overlays).addTo(map);
      }
    }

    // To add additional layers:
    //layerControl.addOverlay(dp.group, dp.name); // Appends to existing layers


      /* Rollover effect */
      function highlightFeature(e){
        var layer = e.target;
        layer.setStyle({
          weight: 3,
          color: '#665',
          dashArray: '',
          fillOpacity: .7})
          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
          }
        // Send text to side box
        info.update(layer.feature.properties);
      }
 
      function resetHighlight(e){
        overlays[layerName].resetStyle(e.target);
        info.update();
      }

      // CLICK SHAPE ON MAP
      function mapFeatureClick(e) {
        param = loadParams(location.search,location.hash); // param is declared in localsite.js
        var layer = e.target;
        //map.fitBounds(e.target.getBounds()); // Zoom to boundary area clicked
        if (layer.feature.properties.COUNTYFP) {
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
          goHash({'geo':param.geo,'regiontitle':''});
        } else if (layer.feature.properties.name) { // Full state name
            let hash = getHash();
            let theStateID = getIDfromStateName(layer.feature.properties.name);
            //alert("theStateID " + theStateID)
            if (hash.state) {
              if (hash.state.includes(theStateID)) {
                hash.state = jQuery.grep(hash.state.split(",")[0].toUpperCase(), function(value) {
                  return value != theStateID;
                }).toString();
              } else {
                hash.state = theStateID + "," + hash.state;
              }
            } else {
              hash.state = theStateID;
            }
            // ,'geo':'','regiontitle':''
            console.log("COULD BE ISSUE WITH MULTISTATE: goHash " + hash.state);
            goHash({'state':hash.state});
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
            //alert("no props")
            $(".info.leaflet-control").hide();
          }
          // National
          //this._div.innerHTML = "<h4>Zip code</h4>" + (props ? props.zip + '</br>' + props.name + ' ' + props.state + '</br>' : "Hover over map")
          
          if (props && props.COUNTYFP) {
            this._div.innerHTML = "" 
            + (props ? "<b>" + props.NAME + " County</b><br>" : "Hover over map") 
            + (props ? "FIPS 13" + props.COUNTYFP : "")
          } else { // US
            this._div.innerHTML = "" 
            + (props ? "<b>" + props.name + "</b><br>" : "Hover over map")
          }

          // To fix if using state - id is not defined
          // Also, other state files may need to have primary node renamed to "data"
          //this._div.innerHTML = "<h4>Zip code</h4>" + (1==1 ? id + '</br>' : "Hover over map")
      }
      if (map) {
        info.addTo(map);
      }
    }
  }
}



$(document).on("click", "#show_county_colors", function(event) {
  let hash = getHash();
  let layerName = hash.state.split(",")[0].toUpperCase() + " Counties";
  overlays[layerName].eachLayer(function (layer) {  
    //if(layer.feature.properties.COUNTYFP == '121') { // Fulton County
      layer.setStyle({fillColor :'blue', fillOpacity:.5 }) 
      // Or call a function:
      // layer.setStyle(function...)
    //}
  });
  //alert("done"); // Occurs before layers above appear.
});

console.log('end of localsite/js/map.js');

// Why does this work on /community/start/maps/counties/counties.html
//console.timeEnd("End of localsite/js/map.js: ");
//console.timeEnd("Processing time: ");
