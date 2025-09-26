/*******************************************

LOCALSITE.JS - JAM Stack Data Science Visualization Framework
Location-based navigation and map filters for LLM integration
Source: model.earth/localsite/js/localsite.js
Github: modelearth/localsite

To do: Dynamically add target _parent to external link when in an iFrame and no existing target.

Localsite Path Library - A global namespace singleton
Define a new object if localsite library does not exist yet.
*/

var localStart = Date.now(); // A var so waitForVariableNav detects in navigation.js.

if(typeof onlineApp == 'undefined') {
  // During air travel, set to Offline in Settings. Doing so sets local to no state. Requires community-data locally.
  var onlineApp = true; // Avoid editing this line.
} else {
  consoleLog("ALERT: Page loads localsite.js more than once.")
}
let localsiteTitle = "Localsite";
let defaultState = "";
if (location.host.indexOf('localhost') >= 0) {
  defaultState = "";  // Set to GA to include additional map layers in top nav.
}
consoleLog("start localsite");
var local_app = local_app || (function(module) {
    let _args = {}; // private, also worked as []
    let localsite_repo;
    return {
        init : function(Args) {
            _args = Args;
            // some other initialising
        },
        helloWorld : function() {
            //alert('Hello World! -' + _args[0]);
            //alert('Hello World! -' + _args.test1);
            alert(Object.keys(_args)[0]);
        },
        localsite_root : function() {
            if (localsite_repo) { // Intensive, so allows to only run once
              return(localsite_repo);
            }
            //alert("get localsite_repo");

            let scripts = document.getElementsByTagName('script'); 
            let myScript; // = scripts[ scripts.length - 1 ]; // Last script on page, typically the current script localsite.js
            // Now try to find localsite.js
            //alert(myScript.length)
            for (var i = 0; i < scripts.length; ++i) {
                if(scripts[i].src && scripts[i].src.indexOf('localsite.js') !== -1){
                  myScript = scripts[i];
                }
            }
            if (!myScript) { // Now try to find one containging map-embed.js
              for (var i = 0; i < scripts.length; ++i) {
                if(scripts[i].src && scripts[i].src.indexOf('map-embed.js') !== -1){
                  myScript = scripts[i];
                }
              }
            }
            if (!myScript) {
              console.log('%cALERT: the current script localsite.js was not yet recognized in the DOM. Hit refresh.', 'color: red; background: yellow; font-size: 14px');
              
              // If this setTimeout works, we'll add it before extractHostnameAndPort is called.
              setTimeout( function() {
                for (var i = 0; i < scripts.length; ++i) {
                    if(scripts[i].src && scripts[i].src.indexOf('localsite.js') !== -1){
                      myScript = scripts[i];
                    }
                    console.log('%cGot script from DOM after delay! We need to modify code here to add additional attempts. ', 'color: green; background: yellow; font-size: 14px');
              
                }
              }, 1000 );

            }

            let hostnameAndPort = extractHostnameAndPort(myScript.src);
            console.log("location.host " + location.host);
            let theroot = location.protocol + '//' + location.host + '/localsite/';

            if (location.host.indexOf("georgia") >= 0) { // For feedback link within embedded map, and ga-layers.json
              // Might need (hopefully not) for https://www.georgia.org/center-of-innovation/energy/smart-mobility - needed occasionally for js/jquery.min.js below, not needed when hitting reload.
              //theroot = "https://map.georgia.org/localsite/";
              
              // This could be breaking top links to Location and Good & Services.
              // But reactivating after smart-mobility page tried to get js/jquery.min.js from geogia.org
              // Re-omitting because js/jquery.min.js still used geogia.org on first load, once. (not 100% sure if old page was cached)
              //theroot = hostnameAndPort + "/localsite/";
            }
            
            if (hostnameAndPort != window.location.hostname + ((window.location.port) ? ':'+window.location.port :'')) {
              console.log("hostnameAndPort " + hostnameAndPort);
              theroot = hostnameAndPort + "/localsite/";
              //consoleLog("myScript.src hostname and port: " + extractHostnameAndPort(myScript.src));
              //consoleLog("window.location hostname and port: " + window.location.hostname + ((window.location.port) ? ':'+window.location.port :''));
            }
            if (location.host.indexOf('localhost') >= 0) {
              // For testing embedding without locathost repo in site theroot. Rename your localsite folder.
              // Why don't we reach ".showApps click" when activatied?:
              //theroot = "https://model.earth/localsite/";
            }
            localsite_repo = theroot; // Save to reduce DOM hits
            return (theroot);
        },
        community_data_root : function() { // General US states and eventually some international
            let theroot = "https://model.earth/community-data/";
            if (location.host.indexOf('localhost') >= 0 && !onlineApp) {
              theroot = location.protocol + '//' + location.host + '/community-data/';
            }
            return (theroot);
        },
        modelearth_root : function() { // General US states and eventually some international
            let theroot = "https://model.earth";
            // TO DO: Check if localsite.js include div contains "https://model.earth" (non-relative)
            
            // Currently assuming all other ports don't have localsite folder.
            if ((location.host.indexOf('localhost') >= 0 && location.port == "8887") || location.host.indexOf('127.0.0.1') >= 0) {
              theroot = location.protocol + '//' + location.host;
            }
            return (theroot);
        },
        topojson_root : function() { // General US states and eventually some international
            // These repos will typically reside on github, so no localhost.
            let theroot = "https://model.earth";
            if (!onlineApp) {
              theroot = "";
            }
            return (theroot);
        },
        custom_data_root : function() { // Unique US states - will use javascript, domain, cookies and json.
            let theroot = location.protocol + '//' + location.host + '/georgia-data/';
            if (location.host.indexOf('localhost') < 0) {
              theroot = "https://neighborhood.org/georgia-data/";
            }
            return (theroot);
        }
    };

    // EXPORTS
    //module.init = init;
    //module.setData = setData;
}());

//local_app.loctitle = "what"
//alert(local_app.loctitle);

//local_app.init(["somevalue", 1, "controlId"]); // Does not work since switched from array to objdec
//local_app.init({test1: "1", controlId: "okay"});
//local_app.helloWorld("test2");

// Above can also be used as alternative to placing params in javascript include path:
// https://stackoverflow.com/questions/2190801/passing-parameters-to-javascript-files


// USE params (plural) to isolate within functions when creating embedable widgets.
// USE param for any html page using localsite.js.
// mix gives priority to the first (allowing it to delete using blanks). extend gives priority to the second.
let paramIncludeFile = getParamInclude(); // From localsite.js include file param.

if(typeof hiddenhash == 'undefined') {
  var hiddenhash = {};
}
if (hiddenhash.geoview) {
    alert("BUG L1 hiddenhash.geoview " + hiddenhash.geoview);
}
// param values from page are placed in hiddenhash. (UNLESS THEY ARE ALREADY IN THE HASH.)
// hiddenhash is loaded into hash in gethash if hash does not have an existing value.
// priorHash holds the initial param value hardcoded in page, then changes with each hash update.
if(typeof param != 'undefined') { // From settings in HTML page
  // hiddenhash and hash allow params to be altered after initial load.
  // hiddenhash DOES NOT contain location.search
  hiddenhash = mix(hiddenhash,paramIncludeFile); // Before URL values added. Priority to hiddenhash.
  hiddenhash = mix(param,hiddenhash); // param set in page takes priority over param set on localsite.js URL.

  // param includes location.search, but might not need to.
  // param is coming in from page settings, so we give it priority over localsite.js includes and the URL
  param = mix(param,loadParams(location.search,location.hash)); // Priority to first, the param values set in page.
  param = mix(param,paramIncludeFile);

} else { // No param object in page, but could be set in localsite.js include.
  hiddenhash = mix(hiddenhash,paramIncludeFile);
  // Now we add in the hash, after hiddenhash is set without hash
  var param = structuredClone(extend(true, loadParams(location.search,location.hash), paramIncludeFile)); // Subsequent overrides first giving priority to setting in page over URL. Clone/copy object without entanglement. 
  //param = loadParams(location.search,location.hash); // Includes localsite.js include.
}

if (param.state) {
  defaultState = param.state; // For /explore/locations/index.html
}
// TO DO: Add paramIncludeFile to call once rather than in both function
function getParamInclude() {
  let paramInclude = {};
  let scripts = document.getElementsByTagName('script'); 
  let myScript = scripts[ scripts.length - 1 ]; // Last script on page, typically the current script localsite.js
  // But use localsite.js
  for (var i = 0; i < scripts.length; ++i) {
      if(scripts[i].src && scripts[i].src.indexOf('localsite.js') !== -1){
        myScript = scripts[i];
      }
  }
  //let myScript = null;
  // Now try to find one containing map-embed.js
  /*
  for (var i = 0; i < scripts.length; ++i) {
      if(scripts[i].src && scripts[i].src.indexOf('map-embed.js') !== -1){
        myScript = scripts[i];
      }
  }
  */

  // Check if script resides on current server.
  //alert("myScript.src hostname and port: " + extractHostnameAndPort(myScript.src) + "\rwindow.location hostname and port: " + window.location.hostname + ((window.location.port) ? ':'+window.location.port :''));

  //local_app.localsite_root("https://model.earth");
  //alert(local_app.localsite_root())

  let includepairs = myScript.src.substring(myScript.src.indexOf('?') + 1).split('&');
  for (let i = 0; i < includepairs.length; i++) {
    if(!includepairs[i]) continue;
    let pair = includepairs[i].split('=');
    if (pair[1]) {
      paramInclude[pair[0].toLowerCase()] = decodeURIComponent(pair[1].replace(/\+/g, " "));
      //consoleLog("Param from javascript include: " + pair[0].toLowerCase() + " " + decodeURIComponent(pair[1]));
    }
  }
  return paramInclude;
}

// Loads params with priority given to:
// 1. Hash values on URL.
// 2. Parameters on URL.
// 3. Parameters on javascript include file.
function loadParams(paramStr,hashStr) {
  paramStr = paramStr.substring(paramStr.indexOf('?') + 1);
  hashStr = hashStr.substring(hashStr.indexOf('#') + 1);
  // NOTE: Hardcoded to pull params from last script, else 'embed-map.js' only
  // Get Script - https://stackoverflow.com/questions/403967/how-may-i-reference-the-script-tag-that-loaded-the-currently-executing-script
  let scripts = document.getElementsByTagName('script'); 
  //let myScript = scripts[ scripts.length - 1 ]; // Last script on page, typically the current script localsite.js
  let myScript = null;

  for (var i = 0; i < scripts.length; ++i) {
      if(scripts[i].src && scripts[i].src.indexOf('localsite.js') !== -1){
        myScript = scripts[i];
        break;
      }
  }

  // Now try to find one containging embed-map - to be removed
  //for (var i = 0; i < scripts.length; ++i) {
  //    if(scripts[i].src && scripts[i].src.indexOf('map-embed.js') !== -1){
  //      myScript = scripts[i];
  //    }
  //}
  //alert(myScript.src);

  let params = {};
  //console.log("Get param from " + myScript.src);
  let includepairs = myScript.src.substring(myScript.src.indexOf('?') + 1).split('&');
  for (let i = 0; i < includepairs.length; i++) {
    if(!includepairs[i]) continue;
    let pair = includepairs[i].split('=');
    params[pair[0].toLowerCase()] = decodeURIComponent(pair[1]);
    //consoleLog("Param from javascript include: " + pair[0].toLowerCase() + " " + decodeURIComponent(pair[1]));
  }

  let pairs = paramStr.split('&');
  for (let i = 0; i < pairs.length; i++) {
      if(!pairs[i])
          continue;
      let pair = pairs[i].split('=');
      params[decodeURIComponent(pair[0]).toLowerCase()] = decodeURIComponent(pair[1]);
  }
   
  let hashPairs = hashStr.split('&');
  for (let i = 0; i < hashPairs.length; i++) {
      if(!hashPairs[i])
          continue;
      if (i==0 && hashPairs[i].indexOf("=") == -1) {
        params[""] = hashPairs[i];  // Allows for initial # params without =.
        continue;
      }
      let hashPair = hashPairs[i].split('=');
      params[decodeURIComponent(hashPair[0]).toLowerCase()] = decodeURIComponent(hashPair[1]);
   }
   
   return params;
}
function mix(incoming, target) { // Combine two objects, priority to incoming. Delete blanks indicated by incoming.
   let target2;

   let target1 = structuredClone(extend(true, {}, target)); // Clone/copy object without entanglement - prevents making hashhidden = hash
   //console.log("mix incoming and default (target). Incoming has priority.");
   //console.log(incoming);
   //console.log(target);
   if (window.jQuery) {
    target2 = structuredClone(extend(true, target1, incoming)); // structuredClone prevents entanglement, subsequent overrides first.
   } else {
    consoleLog("USING non-jquery extend")
    // This non-JQuery extend results in "Uncaught (in promise) RangeError: Maximum call stack size exceeded" with map.js mix(dp,defaults)
    target2 = structuredClone(extend(true, target1, incoming)); // Clone/copy object without entanglement, subsequent overrides first.
   }
   for(var key in incoming) {
     if (incoming.hasOwnProperty(key)) {
        if (incoming[key] === null || incoming[key] === undefined || incoming[key] === '') {
          delete target2[key];
        } else {
          // Already set by extend above.
          //target2[key] = incoming[key];
        }
     }
   }
   //console.log("mixed output");
   //console.log(target2);
   return target2;
}
function getHash() {
  return (mix(getHashOnly(),hiddenhash)); // Includes hiddenhash
}
function getHashOnly() {
  return (function (pairs) {
    if (pairs == "") return {};
    var result = {};
    pairs.forEach(function (pair) {
      // Split the pair on "=" to get key and value
      let keyValue = pair.split('=');
      let key = keyValue[0];
      let value = keyValue.slice(1).join('=');
      // Replace "%26" with "&" in the value
      value = value.replace(/%26/g, '&');
      
      // Handle nested object structure for any dotted keys
      if (key.includes('.')) {
        let keys = key.split('.');
        let current = result;
        
        // Navigate/create the nested structure
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        
        // Set the final value
        current[keys[keys.length - 1]] = value;
      } else {
        result[key] = value;
      }
    });
    return result;
  })(window.location.hash.substr(1).split('&'));
}

// Avoids triggering hash change event. 
// Also called by goHash, which does trigger hash change event.

function updateHash(addToHash, addToExisting, removeFromHash) {
    //alert("updateHash object: " + JSON.stringify(addToHash))
    let hash = {}; // Limited to this function
    if (addToExisting != false) {
      hash = getHashOnly(); // Include all existing. Excludes hiddenhash.
    }
    console.log(addToHash)
    const newObj = {}; // For removal of blank keys in addToHash
    Object.entries(addToHash).forEach(([k, v]) => {
      if (v != null) {
        newObj[k] = addToHash[k];
      }
    });
    // Secondary way to remove, using a string
    if (removeFromHash) {
      if (typeof removeFromHash == "string") {
        removeFromHash = removeFromHash.split(",");
      }
      for(var i = 0; i < removeFromHash.length; i++) {
          delete hash[removeFromHash[i]];
          delete hiddenhash[removeFromHash[i]];
      }
    }
    hash = mix(newObj,hash); // Gives priority to addToHash
    
    // Flatten nested objects for URLSearchParams
    const flatHash = {};
    Object.entries(hash).forEach(([key, value]) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            // Flatten nested object properties
            Object.entries(value).forEach(([subKey, subValue]) => {
                flatHash[`${key}.${subKey}`] = subValue;
            });
        } else {
            flatHash[key] = value;
        }
    });
    
    const hashString = decodeURIComponent(new URLSearchParams(flatHash).toString()); // decode to display commas and slashes in URL hash values
    var pathname = window.location.pathname.replace(/\/\/+/g, '\/')
    var queryString = "";
    if (window.location.search) { // Existing, for parameters that are retained as hash changes.
      queryString += window.location.search; // Contains question mark (?)
    }
    if (hashString) { // Remove the hash here if adding to other 
      queryString += "#" + hashString;
    }
    let searchTitle = 'Page ' + hashString;
    //alert(queryString)
    window.history.pushState("", searchTitle, pathname + queryString);
}
function goHash(addToHash,removeFromHash) {
  consoleLog("goHash\n" + JSON.stringify(addToHash, null, 2));
  // Get and normalize the current hash
  const currentHash = normalizeHash(window.location.hash);
  updateHash(addToHash,true,removeFromHash); // true = Include all of existing hash
  // Get and normalize the new hash after updateHash() runs
  const newHash = normalizeHash(window.location.hash);
  // Only trigger the event if the normalized hash actually changed
  if (currentHash !== newHash) {
    triggerHashChangeEvent();
  }
}
function go(addToHash) {
  consoleLog("go ")
  // Get and normalize the current hash
  const currentHash = normalizeHash(window.location.hash);
  updateHash(addToHash,false); // Drop existing
  // Get and normalize the new hash after updateHash() runs
  const newHash = normalizeHash(window.location.hash);
  // Only trigger the event if the normalized hash actually changed
  if (currentHash !== newHash) {
    triggerHashChangeEvent();
  }
}

// Used only when comparing if hash has changed.
// Function to normalize the hash by sorting key-value pairs and converting keys to lowercase
function normalizeHash(hashString) {
  if (!hashString.startsWith("#")) return "";

  const params = new URLSearchParams(hashString.substring(1));
  const sortedParams = new URLSearchParams();

  // Normalize keys to lowercase, keep values unchanged, and sort by keys
  [...params.entries()]
    .map(([key, value]) => [key.toLowerCase(), value]) // Only lowercase keys
    .sort()
    .forEach(([key, value]) => {
      sortedParams.append(key, value);
    });

  return sortedParams.toString();
}

// Used by navigation.js, map.js
if(typeof priorHash == 'undefined') {
  var priorHash = {};
}
//let nextPriorHash = {};
let nextPriorHash = structuredClone(param); // Param values set in pages and the include URL are passed forward as a hiddenhash.
// Triggers custom hashChangeEvent in multiple widgets.
// Exception, React widgets use a different process.
var triggerHashChangeEvent = function () {
    // priorHash includes remaining values in hiddenhash (which originate from param values in page)
    priorHash = structuredClone($.extend(true, {}, nextPriorHash));
    //alert("hiddenhash.geoview " + hiddenhash.geoview);
    //nextPriorHash = getHashOnly();
    nextPriorHash = getHash(); // Includes hiddenhash

    // Create a new event
    var event = new CustomEvent('hashChangeEvent');
    // Dispatch the event
    document.dispatchEvent(event);
};

// COMMON
function loadScript(url, callback)
{
  //let urlID = url.replace(/^.*\/\/[^\/]+/, ''); // Allows id's to always omit the domain.
  let urlID = getUrlID3(url);
  var loadFile = true;

    // TODO: load a comma separated list of filenames in param.existing_files into an array that can be searched here. Try to allow for
    // minified and debug versions, i.e. use the filename only and no extension. Load the array outside of this function so the array
    // doesn't have to be rebuilt each time this function is called.
  if (param.existing_files == "jquery" && url.indexOf(param.existing_files) >= 0) {
     loadFile = false;
  }

  // Nested calls are described here: https://books.google.com/books?id=ZOtVCgAAQBAJ&pg=PA6&lpg=PA6
  if (loadFile && !document.getElementById(urlID)) { // Prevents multiple loads.
      consoleLog("loadScript seeking " + url + " via urlID: " + urlID);
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      script.id = urlID; // Prevents multiple loads.

      var head = document.getElementsByTagName('head')[0];
      head.appendChild(script);

      script.onload = function() {
        consoleLog("loadScript loaded: " + url); // Once the entire file is processed.
        callback();
      }
  } else {
    consoleLog("loadScript script already available: " + url + " via ID: " + urlID);
    if(callback) callback();
  }
}

var localsite_repo3; // TEMP HERE
/*
function extractHostnameAndPort(url) { // TEMP HERE
    consoleLog("hostname from: " + url);
    let hostname;
    let protocol = "";
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1) {
        protocol = url.split('//')[0] + "//"; // Retain http or https
        hostname = protocol + url.split('/')[2];
    } else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    //hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    console.log("hostname: " + hostname);
    return hostname;
}
*/

function toggleFullScreen(alsoToggleHeader) {
  if (document.fullscreenElement && !alsoToggleHeader) { // Already fullscreen and not small header
    consoleLog("Already fullscreenElement");
    if (alsoToggleHeader) {
      hideHeaderBar();
    }
    if (document.exitFullscreen) {
      consoleLog("Exit fullscreen")
      document.exitFullscreen();
      if (alsoToggleHeader) {
        showHeaderBar();
        $('.reduceSlider').hide();
        $('.expandSlider').show();
      } else {
        $('.reduceFromFullscreen').hide();
        $('.expandToFullscreen').show();
      }
      return;
    }
  }
  if ((document.fullScreenElement && document.fullScreenElement !== null) ||    
   (!document.mozFullScreen && !document.webkitIsFullScreen)) {
    // EXPAND
    // Only if video is not visible. Otherwise become black.
    $('.moduleBackground').css({'z-index':'0'});   
    $('.expandFullScreen span').text("Shrink");
    // To do: Change icon to &#xE5D1;
    if (document.documentElement.requestFullScreen) {  
      document.documentElement.requestFullScreen();  
    } else if (document.documentElement.mozRequestFullScreen) {  
      document.documentElement.mozRequestFullScreen();  
    } else if (document.documentElement.webkitRequestFullScreen) {  
      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);  
    }
    
    if (alsoToggleHeader) { // Use only small header
      hideHeaderBar();
      $("#filterFieldsHolder").addClass("filterFieldsHolderFixed");
      $("body").addClass("filterFieldsBodyTop");
      $(".pagecolumn").removeClass("pagecolumnLower");
      $('.expandSlider').hide();
      $('.reduceSlider').show();
    } else {
      $('.expandToFullscreen').hide();
      $('.reduceFromFullscreen').show();
    }
  } else {
    $('.moduleBackground').css({'z-index':'-1'}); // Allows video to overlap.
    $('.expandFullScreen span').text("Expand");
    if (document.cancelFullScreen) {  
      document.cancelFullScreen();  
    } else if (document.mozCancelFullScreen) {  
      document.mozCancelFullScreen();  
    } else if (document.webkitCancelFullScreen) {  
      document.webkitCancelFullScreen();  
    }
    if (alsoToggleHeader) { // Restore taller header bar
      showHeaderBar();
      $("#filterFieldsHolder").removeClass("filterFieldsHolderFixed");
      $("body").removeClass("filterFieldsBodyTop");
      $(".pagecolumn").addClass("pagecolumnLower");
      $(".pagecolumn").removeClass("pagecolumnToTop");
      $('.reduceSlider').hide();
      $('.expandSlider').show();
    } else {
      $('.reduceFromFullscreen').hide();
      $('.expandToFullscreen').show();
    }
  }
}

var theroot = get_localsite_root(); // Try using let instead of var to find other declarations.
function get_localsite_root() { // Also in two other places
  if (localsite_repo3) { // Intensive, so limit to running once.
    //alert(localsite_repo);
    return(localsite_repo3);
  }

  let scripts = document.getElementsByTagName('script'); 
  let myScript = scripts[ scripts.length - 1 ]; // Last script on page, typically the current script localsite.js
  //let myScript = null;
  // Now try to find one containging map-embed.js
  for (var i = 0; i < scripts.length; ++i) {
      if(scripts[i].src && scripts[i].src.indexOf('map-embed.js') !== -1){
        myScript = scripts[i];
      }
  }
  let hostnameAndPort = extractHostnameAndPort(myScript.src);
  //consoleLog("hostnameAndPort: " + hostnameAndPort);
  let theroot = location.protocol + '//' + location.host + '/localsite/';

  if (location.host.indexOf("georgia") >= 0) { // For feedback link within embedded map
    //theroot = "https://map.georgia.org/localsite/";
    theroot = hostnameAndPort + "/localsite/";
  }
  if (hostnameAndPort != window.location.hostname + ((window.location.port) ? ':'+window.location.port :'')) {
    theroot = hostnameAndPort + "/localsite/";
    //console.log("theroot: " + theroot);
    //consoleLog("window.location hostname and port: " + window.location.hostname + ((window.location.port) ? ':'+window.location.port :''));
  }
  if (location.host.indexOf('localhost') >= 0) {
    // Enable to test embedding without locathost repo in site theroot. Rename your localsite folder.
    //theroot = "https://model.earth/localsite/";
  }
  localsite_repo3 = theroot; // Save to reduce DOM hits
  return (theroot);
}

function clearHash(toClear) {
  let hash = getHashOnly(); // Include all existing
  let clearArray = toClear.split(/\s*,\s*/);
  for(var i = 0; i < clearArray.length; i++) {
    delete hash[clearArray[i]];
  }
  var hashString = decodeURIComponent($.param(hash)); // decode to display commas in URL
  var pathname = window.location.pathname;
  var queryString = "";
  if (window.location.search) { // Existing, for parameters that are retained as hash changes.
    queryString += window.location.search; // Contains question mark (?)
  }
  let searchTitle = 'Page';
  if (hashString) { // Remove the hash here if adding to other 
    queryString += "#" + hashString;
    searchTitle = 'Page ' + hashString;
  }
  window.history.pushState("", searchTitle, pathname + queryString);
}

var consoleLogHolder = ""; // Hold until div available in DOM
function consoleLog(text,value) {
  let thetime = (Date.now() - localStart)/1000;
  if (value) {
    console.log((Date.now() - localStart)/1000 + ": " + text, value);
  } else {
    console.log((Date.now() - localStart)/1000 + ": " + text);
  }
  
  // Avoiding waitForElm("#logText") here because it would get called numerous times.
  // Instead, hold in consoleLogHolder until #logText is available.

  let dsconsole = document.getElementById("logText");
  if (1==2 && dsconsole) { // Once in DOM
    //dsconsole.style.display = 'none'; // hidden
    if (consoleLogHolder.length > 0) { // Called only once to display pre-DOM values
      //dsconsole.innerHTML = consoleLogHolder;

      // New alternative to above line, haven't fully tested
      let contentPreDom = document.createTextNode(consoleLogHolder + "DOM NOW AVAILABLE\n");
      dsconsole.appendChild(contentPreDom);

      consoleLogHolder = "";
    }
    dsconsole.style.display = 'block';
    if (value) {
      //dsconsole.innerHTML += (text + " " + value + "\n");
      let content = document.createTextNode(text + " " + value + "\n");
      dsconsole.appendChild(content);

    } else {
      //dsconsole.innerHTML += (text + "\n");
      let content = document.createTextNode(thetime + ": " + text + "\n");
      dsconsole.appendChild(content);
    }

    // Avoid since this would run many times
    //dsconsole.scrollTo({ top: dsconsole.scrollHeight, behavior: 'smooth'});

  } else {

    if (value) {
      consoleLogHolder += (text + " " + value + "\n");
    } else {
      consoleLogHolder += (text + "\n");
    }
  }
  
}

function loadLocalTemplate() {
  consoleLog("loadLocalTemplate()");
  let datascapeFile = theroot + "info/template-main.html";
  let datascapeFileDiv = "#datascape";
  waitForElm(datascapeFileDiv).then((elm) => {

    $.get(datascapeFile, function(theTemplate) { // Get and append template-main.html to #datascape
      $(theTemplate).appendTo(datascapeFileDiv);

      //$("#insertedTextSource").remove(); // For map/index.html. Avoids dup header.

      //$('img').each(function() {
      //  $(this).attr('src', 'https://model.earth' + $(this).attr('src'));
      //});

      let elemDiv = document.createElement('div');
      elemDiv.id = "localsiteDetails";
      elemDiv.style.cssText = "display:none";
      elemDiv.innerHTML = "testing";
      document.body.appendChild(elemDiv);

      consoleLog("Template Loaded: " + datascapeFile);
      initSitelook();
      if (typeof relocatedStateMenu != "undefined") {
        relocatedStateMenu.appendChild(state_select); // For apps hero
        $(".stateFilters").hide();
      }
      if (typeof relocatedScopeMenu != "undefined") {
        relocatedScopeMenu.appendChild(selectScope); // For apps hero
      }
      waitForElm('#filterClickLocation').then((elm) => {
        if (param.showstates != "false") {
            $("#filterClickLocation").show();
        }
        $("#mapFilters").prependTo("#main-content");
        // Move back up to top. Used when header.html loads search-filters later (when clicking search icon)
        $("#main-header").insertBefore("#main-container");
        //$("#headerbaroffset").prependTo("#main-container");
        //$("#headerbar").prependTo("#main-container");
      });
      
      waitForElm('#main-container').then((elm) => {
        $("#main-header").insertBefore("#main-container");

        //$("#headerbaroffset").prependTo("#main-container");
        //$("#headerbar").prependTo("#main-container"); // Move back up to top.


        //$("#bodyMainHolder").prependTo("#main-container"); // Move back up to top.
        $("#rightSideTabs").prependTo("#main-container"); // Move back up to top.

        // Replace paths in div

        if(location.host.indexOf("desktop") >= 0) {
          waitForElm('#desktop-nav').then((elm) => {
            $("#desktop-nav a").each(function() {
              $(this).attr('href', $(this).attr('href').replace(/\/desktop\//g,"\/"));
            });
          });
        }
        if(location.host.indexOf("dreamstudio") >= 0 || location.host.indexOf("planet.live") >= 0) {
          $("#dreamstudio-nav a").each(function() {
            $(this).attr('href', $(this).attr('href').replace(/\/dreamstudio\//g,"\/"));
          });
        }
        if (param.shortheader != "true") {
          //showHeaderBar();
        }
      });

      if (location.host.indexOf('model') >= 0) {
        $(".showSearch").show();
        $(".showSearch").removeClass("local");
      }
      if (param.showyear == "true") {
        $("#selectYear").show();
      }
    });
  });
}
function hideHeaderBar() {
  // what$('#headerbar').addClass("headerbarhide");
  $('#local-header').hide();
  $('#headerbar').hide();
  $('.bothSideIcons').removeClass('sideIconsLower');
}
function showHeaderBar() {
  waitForElm('#headerbar').then((elm) => {
    console.log("showHeaderBar")
    //$('.headerOffset').show(); 
    $('#headerbar').show();
    $('#headerbar').removeClass("headerbarhide");
    $('.bothSideIcons').addClass('sideIconsLower');
    $(".pagecolumn").addClass("pagecolumnLower"); // Didn't seem to be working
    waitForElm('#main-nav').then((elm) => {
      $("#main-nav").addClass("pagecolumnLower");
    });
    if (param.shortheader != "true") {
      $('#local-header').show();
    }
  });
}

function loadSearchFilterCss() {
  includeCSS3(theroot + 'css/base.css',theroot);
  includeCSS3(theroot + 'css/menu.css',theroot);
  includeCSS3(theroot + 'css/search-filters.css',theroot);
  if (param.preloadmap != "false") {
    includeCSS3(theroot + 'css/map-display.css',theroot);
  }
}
// || param.display == "d3"
function loadLeafletAndMapFilters() {
  console.log("loadLeafletAndMapFilters() param.showheader " + param.showheader)
  //if (param.shownav) {

  // URL ? value does not currently override include.
  //alert("param.showheader " + param.showheader);

  if (param.showheader != "false" || param.showsearch == "true") {
    loadScript(theroot + 'js/navigation.js', function(results) {
      //$(document).ready(function () {
      // Apparently this is NOT triggered when backing up and reloading. Reload must be hit a second time.
      // But navigation.js won't be in the DOM if we don't waitForElm('#bodyloaded'). Used $(document).ready above instead.
      waitForElm('#bodyloaded').then((elm) => {
        console.log("body is now available"); // If missing header persists, remove waitForElm('#bodyloaded') here (line above annd closure)
        // Puts space above flexmain for main-nav to be visible after header
        $("body").prepend("<div id='local-header' class='flexheader noprint' style='display:none'></div>\r");
        waitForElm('#local-header').then((elm) => {
          $("#local-header").prependTo("#main-container"); // Move back up to top. Used when header.html loads search-filters later (when clicking search icon)
          if (param.shortheader != "true") {
            // Inital page load
            $('#local-header').show();
          }
        });

      });
    });
  }
  if ((param.display == "map" || param.display == "everything") && param.show) {
    // Later we could omit map.js from info page unless dp.dataset or googleDocID.
    loadScript(theroot + 'js/d3.v5.min.js', function(results) { // For getScale
      // Had to add these two here since calling within map.js did not value from leaflet.icon-material.js
      // Leaflet L.IconMaterial undefined = leaflet.icon-material.js not loaded
      loadScript(theroot + 'js/leaflet.js', function(results) {
        loadScript(theroot + 'js/leaflet.icon-material.js', function(results) { // Could skip when map does not use material icon colors
          loadScript(theroot + 'js/map.js', function(results) {
          });
        });
      });
    });
  }
}
if (typeof Cookies != 'undefined') {
  alert(Cookies.get('sitelook'));
};
// WAIT FOR JQuery
loadScript(theroot + 'js/jquery.min.js', function(results) {
  var waitForJQuery = setInterval(function () { // Waits for $ within jquery.min.js file to become available.

    if (typeof $ != 'undefined') {

      //Doc ready was here, now further down

      consoleLog("Ready DOM Loaded (But not template yet). Using theroot: " + theroot)
      // Add id to body tag
      //document.body.id = "bodyloaded"; //Works, but avoid incase body already has an id.

      //var divForBodyLoaded = '<div id="bodyloaded"></div>'; // Tells us the body is loaded, since body is not detected.
      var divForBodyLoaded = document.createElement('div');
      divForBodyLoaded.id = "bodyloaded";
      divForBodyLoaded.innerHTML = '<span style="display:none">&nbsp;</span>'; // Tells us the body is loaded, since body is not detected.
      
      $(document).ready(function () {
        useSet(); // Below

        // This approach brakes events. Do not "add" to innerHTML. Use DOM API e.g. appendChild
        //document.getElementsByTagName('body')[0].innerHTML += divForBodyLoaded;
        
        document.body.appendChild(divForBodyLoaded);

        let sitelook;
        if (typeof Cookies != 'undefined' && Cookies.get('sitelook')) {
          sitelook = Cookies.get('sitelook');
        }
        if (param.sitelook) {
          sitelook = param.sitelook;
        }
        if (sitelook == "light") {
          removeElement('/localsite/css/bootstrap.darkly.min.css');
          removeElement('/explore/css/site-dark.css');
          //includeCSS3(theroot + 'css/light.css',theroot);
          if (typeof Cookies != 'undefined') {
              waitForElm('#sitelook').then((elm) => {
                $("#sitelook").val(sitelook);
              });
              Cookies.set('sitelook', sitelook);
              console.log("Bring on the sitelook: " + Cookies.get('sitelook'));
          }
        }
      });

      $(document).on('click', function(event) { // Hide open menus in core
        $('.hideOnDocClick').hide();
      });

      $(document).on("click", ".uOut", function(event) {
        console.log(".uOut clicked");
        Cookies.remove('at_a');
        localStorage.removeItem('email');
        window.location = "/"
        return;

        //event.stopPropagation();
      });


      function isValidEmail(email) {
          var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
      }
      function isValid(email) { // loc a
          var vDom=['Z2VvcmdpYS5vcmc=', 'Z2FhcnRzLm9yZw==']; var eDom=email.split('@')[1]; for (var i = 0; i < vDom.length; i++) {if (eDom === atob(vDom[i])) {return true;}} return false;
      }

      // The handleEvent(e) function is wrapped inside an Immediately Invoked Function Expression (IIFE), 
      // so it becomes scoped and cannot be accessed from elsewhere in the code.
      (function() {

          $(document).on("click", ".uIn", function(event) {
            handleEmail(event);
          });

          $(document).on('keypress', function(e) {
            if (e.which === 13 && $('#input123').is(':focus')) { // Return is key code 13.
                //alert("return")
                handleEmail(e);
                //console.log("Return key pressed in #input123");
            }
          });

          // Handle gravatar checkbox and email field changes
          $(document).on('change', '#getGravatar', function() {
            updateGravatarDisplay();
          });

          $(document).on('input', '#input123', function() {
            updateGravatarDisplay();
          });

          function updateGravatarDisplay() {
            const email = $('#input123').val().trim();
            const gravatarChecked = $("#getGravatar").is(":checked");
            const gravatarLine = $("#getGravatar").parent();
            
            // Hide gravatar line when email is blank
            if (!email) {
              gravatarLine.hide();
              $("#gravatarImg").empty();
              return;
            } else {
              gravatarLine.show();
            }
            
            // Show/hide gravatar image based on checkbox and valid email
            if (gravatarChecked && isValidEmail(email)) {
              loadScript('http://pajhome.org.uk/crypt/md5/md5.js', function(results) {
                let userImg = $.gravatar(email);
                if (userImg) {
                  localStorage.userImg = userImg;
                  $("#gravatarImg").html("<img src='" + localStorage.userImg + "' style='width:100%;max-width:220px;border-radius:30px;'><br><br>");
                }
              });
            } else {
              $("#gravatarImg").empty();
            }
          }

          function handleEmail(e) {
              // For both keypress and click events
              let email = $('#input123').val();
              if (isValidEmail(email)) {
                localStorage.email = email;

                if (isValid(email)) {
                  Cookies.set('golog', window.location.href);
                  window.location = "/explore/menu/login/azure/";
                  return;
                } else {
                  //window.location = "/";
                }

                if ($("#getGravatar").is(":checked")) {
                  // BUGBUG - Redirect above will bypass.
                  loadScript('http://pajhome.org.uk/crypt/md5/md5.js', function(results) {
                    let userImg = $.gravatar(email);
                    if (userImg) {
                      localStorage.userImg = userImg;
                      //alert("userImg: " + localStorage.userImg)
                      $("#gravatarImg").html("<img src='" + localStorage.userImg + "' style='width:100%;max-width:200px;border-radius:30px;'><br><br>")
                    }
                  });
                }

              } else {
                alert("email required"); // TO DO: Display in browser
                $("#input123").focus();
              }
          }

          // Initialize gravatar display when DOM is ready
          $(document).ready(function() {
            if (typeof waitForElm === 'function') {
              waitForElm('#input123').then(() => {
                updateGravatarDisplay();
              });
            } else {
              // Fallback if waitForElm is not available
              setTimeout(() => {
                if ($("#input123").length) {
                  updateGravatarDisplay();
                }
              }, 100);
            }
          });
      })();

      $.gravatar = function(emailAddress, overrides)
      { // Requires http://pajhome.org.uk/crypt/md5/md5.js
          //alert("what up2 " + emailAddress);
            let options = $.extend({
                // Defaults are not hardcoded here in case gravatar changes them on their end.
                // integer size: between 1 and 512, default 80 (in pixels)
                size: '300',
                // rating: g (default), pg, r, x
                rating: '',
                // url to define a default image (can also be one of: identicon, monsterid, wavatar)
                image: '',
                // secure
                secure: true,
                // support css on img element
                classes: ''
            }, overrides);

            let baseUrl = options.secure ? 'https://secure.gravatar.com/avatar/' : 'http://www.gravatar.com/avatar/';

            return baseUrl +
                hex_md5(emailAddress) +
                '.jpg?' +
                (options.size ? 's=' + options.size + '&' : '') +
                (options.rating ? 'r=' + options.rating + '&' : '') +
                (options.image ? 'd=' + encodeURIComponent(options.image) : '');

            return $('<img src="' + baseUrl +
                hex_md5(emailAddress) +
                '.jpg?' +
                (options.size ? 's=' + options.size + '&' : '') +
                (options.rating ? 'r=' + options.rating + '&' : '') +
                (options.image ? 'd=' + encodeURIComponent(options.image) : '') +
                '"' +
                (options.classes ? ' class="' + options.classes + '"' : '') +
                ' />').bind('error', function()
                {
                    $(this).remove();
                });
        
      };

      (function() {
    function handleEvent(e) {
        // Your shared logic for both keypress and click events
    }
})();


      $(document).ready(function () {
        /*! jQuery & Zepto Lazy v1.7.10 - http://jquery.eisbehr.de/lazy - MIT&GPL-2.0 license - Copyright 2012-2018 Daniel 'Eisbehr' Kern */
        // Used by data-src attr. DS earth.
        
        !function(t,e){"use strict";function r(r,a,i,u,l){function f(){L=t.devicePixelRatio>1,i=c(i),a.delay>=0&&setTimeout(function(){s(!0)},a.delay),(a.delay<0||a.combined)&&(u.e=v(a.throttle,function(t){"resize"===t.type&&(w=B=-1),s(t.all)}),u.a=function(t){t=c(t),i.push.apply(i,t)},u.g=function(){return i=n(i).filter(function(){return!n(this).data(a.loadedName)})},u.f=function(t){for(var e=0;e<t.length;e++){var r=i.filter(function(){return this===t[e]});r.length&&s(!1,r)}},s(),n(a.appendScroll).on("scroll."+l+" resize."+l,u.e))}function c(t){var i=a.defaultImage,o=a.placeholder,u=a.imageBase,l=a.srcsetAttribute,f=a.loaderAttribute,c=a._f||{};t=n(t).filter(function(){var t=n(this),r=m(this);return!t.data(a.handledName)&&(t.attr(a.attribute)||t.attr(l)||t.attr(f)||c[r]!==e)}).data("plugin_"+a.name,r);for(var s=0,d=t.length;s<d;s++){var A=n(t[s]),g=m(t[s]),h=A.attr(a.imageBaseAttribute)||u;g===N&&h&&A.attr(l)&&A.attr(l,b(A.attr(l),h)),c[g]===e||A.attr(f)||A.attr(f,c[g]),g===N&&i&&!A.attr(E)?A.attr(E,i):g===N||!o||A.css(O)&&"none"!==A.css(O)||A.css(O,"url('"+o+"')")}return t}function s(t,e){if(!i.length)return void(a.autoDestroy&&r.destroy());for(var o=e||i,u=!1,l=a.imageBase||"",f=a.srcsetAttribute,c=a.handledName,s=0;s<o.length;s++)if(t||e||A(o[s])){var g=n(o[s]),h=m(o[s]),b=g.attr(a.attribute),v=g.attr(a.imageBaseAttribute)||l,p=g.attr(a.loaderAttribute);g.data(c)||a.visibleOnly&&!g.is(":visible")||!((b||g.attr(f))&&(h===N&&(v+b!==g.attr(E)||g.attr(f)!==g.attr(F))||h!==N&&v+b!==g.css(O))||p)||(u=!0,g.data(c,!0),d(g,h,v,p))}u&&(i=n(i).filter(function(){return!n(this).data(c)}))}function d(t,e,r,i){++z;var o=function(){y("onError",t),p(),o=n.noop};y("beforeLoad",t);var u=a.attribute,l=a.srcsetAttribute,f=a.sizesAttribute,c=a.retinaAttribute,s=a.removeAttribute,d=a.loadedName,A=t.attr(c);if(i){var g=function(){s&&t.removeAttr(a.loaderAttribute),t.data(d,!0),y(T,t),setTimeout(p,1),g=n.noop};t.off(I).one(I,o).one(D,g),y(i,t,function(e){e?(t.off(D),g()):(t.off(I),o())})||t.trigger(I)}else{var h=n(new Image);h.one(I,o).one(D,function(){t.hide(),e===N?t.attr(C,h.attr(C)).attr(F,h.attr(F)).attr(E,h.attr(E)):t.css(O,"url('"+h.attr(E)+"')"),t[a.effect](a.effectTime),s&&(t.removeAttr(u+" "+l+" "+c+" "+a.imageBaseAttribute),f!==C&&t.removeAttr(f)),t.data(d,!0),y(T,t),h.remove(),p()});var m=(L&&A?A:t.attr(u))||"";h.attr(C,t.attr(f)).attr(F,t.attr(l)).attr(E,m?r+m:null),h.complete&&h.trigger(D)}}function A(t){var e=t.getBoundingClientRect(),r=a.scrollDirection,n=a.threshold,i=h()+n>e.top&&-n<e.bottom,o=g()+n>e.left&&-n<e.right;return"vertical"===r?i:"horizontal"===r?o:i&&o}function g(){return w>=0?w:w=n(t).width()}function h(){return B>=0?B:B=n(t).height()}function m(t){return t.tagName.toLowerCase()}function b(t,e){if(e){var r=t.split(",");t="";for(var a=0,n=r.length;a<n;a++)t+=e+r[a].trim()+(a!==n-1?",":"")}return t}function v(t,e){var n,i=0;return function(o,u){function l(){i=+new Date,e.call(r,o)}var f=+new Date-i;n&&clearTimeout(n),f>t||!a.enableThrottle||u?l():n=setTimeout(l,t-f)}}function p(){--z,i.length||z||y("onFinishedAll")}function y(t,e,n){return!!(t=a[t])&&(t.apply(r,[].slice.call(arguments,1)),!0)}var z=0,w=-1,B=-1,L=!1,T="afterLoad",D="load",I="error",N="img",E="src",F="srcset",C="sizes",O="background-image";"event"===a.bind||o?f():n(t).on(D+"."+l,f)}function a(a,o){var u=this,l=n.extend({},u.config,o),f={},c=l.name+"-"+ ++i;return u.config=function(t,r){return r===e?l[t]:(l[t]=r,u)},u.addItems=function(t){return f.a&&f.a("string"===n.type(t)?n(t):t),u},u.getItems=function(){return f.g?f.g():{}},u.update=function(t){return f.e&&f.e({},!t),u},u.force=function(t){return f.f&&f.f("string"===n.type(t)?n(t):t),u},u.loadAll=function(){return f.e&&f.e({all:!0},!0),u},u.destroy=function(){return n(l.appendScroll).off("."+c,f.e),n(t).off("."+c),f={},e},r(u,l,a,f,c),l.chainable?a:u}var n=t.jQuery||t.Zepto,i=0,o=!1;n.fn.Lazy=n.fn.lazy=function(t){return new a(this,t)},n.Lazy=n.lazy=function(t,r,i){if(typeof (r) ==='function' &&(i=r,r=[]),typeof (i) === 'function'){t=n.isArray(t)?t:[t],r=n.isArray(r)?r:[r];for(var o=a.prototype.config,u=o._f||(o._f={}),l=0,f=t.length;l<f;l++)(o[t[l]]===e||typeof (o[t[l]]) === 'function')&&(o[t[l]]=i);for(var c=0,s=r.length;c<s;c++)u[r[c]]=t[0]}},a.prototype.config={name:"lazy",chainable:!0,autoDestroy:!0,bind:"load",threshold:500,visibleOnly:!1,appendScroll:t,scrollDirection:"both",imageBase:null,defaultImage:"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",placeholder:null,delay:-1,combined:!1,attribute:"data-src",srcsetAttribute:"data-srcset",sizesAttribute:"data-sizes",retinaAttribute:"data-retina",loaderAttribute:"data-loader",imageBaseAttribute:"data-imagebase",removeAttribute:!0,handledName:"handled",loadedName:"loaded",effect:"show",effectTime:0,enableThrottle:!0,throttle:250,beforeLoad:e,afterLoad:e,onError:e,onFinishedAll:e},n(t).on("load",function(){o=!0})}(window);
        $(function() {
              $('.lazy').Lazy(); // Lazy load all divs with class .lazy
        });
        
      });

      $(window).on('hashchange', function() { // Avoid window.onhashchange since overridden by map and widget embeds  
        consoleLog("window hashchange");
        consoleLog("delete hiddenhash.name");
        delete hiddenhash.name; // Not sure where this is set.
        delete hiddenhash.cat; // Not sure where this is set.
        //delete hiddenhash.geo; // Not sure where this is set.

        triggerHashChangeEvent();
      });
      //MutationObserver.observe(hiddenhash, triggerHashChangeEvent);


      var strVarCss = "<style>";
      if (param["show"] == "suppliers" || param["show"] == "smart") {
        console.log("Custom for suppliers and smart");
        if (location.host == 'georgia.org' || location.host == 'www.georgia.org') {
          // display:block !important // Caused space above fixed header in Drupal. Prevented movement to top during scrolling.
          strVarCss += ".headerOffsetOne {height:75px;}.headerOffset {height:75px !important;}"; 
        }
        strVarCss += "h1 {font-size:38px;margin-top:20px}"; // Larger header for Drupal
        //strVarCss += ".headerOffsetOne{display:none !important}";
        strVarCss += ".component--main_content{margin-top:70px}";

        // Limit where this occurs
        strVarCss += "p {margin: 0 0 2.2rem;}"; // Overrides Drupal 3.4rem bottom
      }
      strVarCss += "<\/style>";
      //document.write(strVarCss);
      document.head.insertAdjacentHTML("beforeend", strVarCss);

      $(document).on("click", ".expandSlider, .reduceSlider", function(event) {
        toggleFullScreen(true);
      });
      $(document).on("click", ".expandToFullscreen, .reduceFromFullscreen", function(event) {
        toggleFullScreen(false);
      });
      $(document).on("click", ".showSearch", function(event) {
        showSearchFilter();
        // Auto-close right navigation on narrow screens
        if (window.innerWidth <= 1000) {
            if (typeof goHash === 'function') {
                goHash({'sidetab':''});
            } else {
                updateHash({"sidetab":""});
            }
        }
      });
      
      clearInterval(waitForJQuery); // Escape the loop

      if (param.showsearch == "true") {
        waitForElm('#mapFilters').then((elm) => {
          showSearchFilter();
        });
      }

  /**
  *  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
  *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables*/
  /*
  var disqus_config = function () {
  this.page.url = PAGE_URL;  // Replace PAGE_URL with your page's canonical URL variable
  this.page.identifier = PAGE_IDENTIFIER; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
  };
  */

  /* Avoiding because disqus places doubleclick cookie */
  /* Uncomment to reactivate
  (function() { // DON'T EDIT BELOW THIS LINE
  var d = document, s = d.createElement('script');
  s.src = 'https://locally.disqus.com/embed.js';
  s.setAttribute('data-timestamp', +new Date());
  (d.head || d.body).appendChild(s);
  })();
  */


  /*
  <link rel="stylesheet" href="css/reveal.css">
  <link rel="stylesheet" href="css/theme/night.css">

  */



  /*  placed before loadMarkdown 

  Configuration
  https://github.com/hakimel/reveal.js#markdown
  */
  /*
  <script src="js/reveal.js"></script>
  <script>
    Reveal.initialize();

    // For long slides
    function resetSlideScrolling(slide) {
        slide.classList.remove('scrollable-slide');
    }

    function handleSlideScrolling(slide) {
        if (slide.scrollHeight >= 800) {
            slide.classList.add('scrollable-slide');
        }
    }
    Reveal.addEventListener('ready', function (event) {
        handleSlideScrolling(event.currentSlide);
    });

    Reveal.addEventListener('slidechanged', function (event) {
        if (event.previousSlide) {
            resetSlideScrolling(event.previousSlide);
        }
        handleSlideScrolling(event.currentSlide);
    });

  </script>
  */


  let fullsite = false;
  // FULL SITE - everything or map
  if (param.showheader == "true" || param.showsearch == "true" || param.display == "everything" || param.display == "locfilters" || param.display == "navigation" || param.display == "map") {
    //alert("added param.show above as test " + param.show)
    if (param.showheader != "false" || param.showsearch == "true" || param.display == "map") {

      fullsite = true;
      includeCSS3(theroot + 'css/map.css',theroot); // Before naics.js so #industries can be overwritten.

      // TODO - Try limiting to param.display == "everything"
      //includeCSS3(theroot + 'css/naics.css',theroot);
      
      // customD3loaded
      if (param.preloadmap != "false" && (param.showheader == "true" || param.shownav == "true" || param.display == "map" || param.display == "everything")) {
        loadScript(theroot + 'js/navigation.js', function(results) {
          //if (param.shownav == "true" || param.display == "map" || param.display == "everything") {
            loadLeafletAndMapFilters();
          //}
        });
      }
      if (param.display == "everything") {
        loadTabulator();
        includeCSS3(theroot + 'css/naics.css',theroot);
        loadScript(theroot + '../io/build/lib/useeio_widgets.js', function(results) {
          loadScript(theroot + 'js/d3.v5.min.js', function(results) {
            waitForVariable('customD3loaded', function() {
              loadScript(theroot + 'js/naics.js', function(results) {
                console.log("everything");
              });
            });
          });
        });
        includeCSS3(theroot + '../io/build/widgets.css',theroot);
        includeCSS3(theroot + '../io/build/iochart.css',theroot);
      }
      loadSearchFilterCss();
      includeCSS3(theroot + 'css/leaflet.icon-material.css',theroot);
    }
    if (param.geoview || param.appview) {
      loadMapAndMapFilters();
    }

  } else if (param.showsearch == "true" || param.showmap || param.appview) { // Second two were hash, but not defined here
    loadLocalTemplate();
    loadMapAndMapFilters();
  } else {
    includeCSS3(theroot + 'css/base.css',theroot);
  }

  function loadMapAndMapFilters() {
    console.log("loadScript called from localsite.js");
    loadSearchFilterCss(); 
    loadScript(theroot + 'js/navigation.js', function(results) {
    });
    //loadScript(theroot + 'js/map.js', function(results) { // Load list before map
    //});
  }

  if (param.material_icons != "false") {
    param.material_icons = "true"; // Could lazy load if showSideTabs changed to graphic.
  }
  if (fullsite || param.material_icons == "true") {
    // This was inside FULL SITE above, but it is needed for menus embedded in external sites.
    !function() {
      // Setting up listener for font checking
      var font = "1rem 'Material Icons'";

      // Not sure why we had this. It renders on load, and then again each time browser is resized.
      //document.fonts.addEventListener('loadingdone', function(event) {
      //    console.log("Font loaded: ${font}: ${ document.fonts.check(font)}");
      //})

      // Loading font
      let link = document.createElement('link'),
          head = document.getElementsByTagName('head')[0];

      link.addEventListener('load', function() {
          //alert('Font loaded');
          $(document).ready(function () {
            //$(".show-on-load").show(); // This might only get applied to first instance of class.
            $(".show-on-load").removeClass("show-on-load");
          });
      })

      link.type = 'text/css';
      link.rel = 'stylesheet';
      link.href = theroot + 'css/fonts/materialicons/icon.css';
      // Haven't tested if this external URL works with multiple load prevention.
      //link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
      link.id = getUrlID3(link.href,"");
      
      if (!document.getElementById(link.id)) { // Prevents multiple loads.
        head.appendChild(link);
        console.log("head.appendChild link for font");
        $(document).ready(function () {
          //body.appendChild(link); // Doesn't get appended. Error: body is not defined
        });
      } else {
        console.log("link.id " + link.id);
      }
    }();
  }



  } else { // jQuery not available yet!

    if(location.host.indexOf('localhost') >= 0) {
      alert("Localhost alert: JQUERY NOT YET AVAILABLE - JQuery probably needs to be added to calling page.");
    } else {
      console.log('%cALERT: JQUERY NOT YET AVAILABLE! JQuery probably needs to be added to calling page.', 'color: red; background: yellow; font-size: 14px');    
    }
  }
  

  // NULLSCHOOL
  $(document).on("click", "#earthClose", function(event) { // ZOOM IN
    $("#nullschoolHeader").hide();
    $("#hero_holder").show();
    event.stopPropagation();
  });
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
    console.log("map.js getEarthObject " + url);
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

}, 10); // End block, could move to end of jQuery loadScript.

}); // End JQuery loadScript

// Might REPLACE WITH loadGeos(), not sure yet
// 
function getStateFips(hash) {

  // Called three times, once per map?
  //alert("getStateFips")

  if (hash.geo) {
      //if (hash.geo.includes(",")) {
          var geos=hash.geo.split(",");
          fips=[]
          for (var i = 0; i < geos.length; i++){
              let fip = geos[i].split("US")[1];
              if (fip) {
                  if (fip.startsWith("0")){
                      fips.push(parseInt(geos[i].split("US0")[1]))
                  } else {
                      fips.push(parseInt(geos[i].split("US")[1]))
                  }
              } else {
                  console.log("fip without US = " + geos[i]);
              }
          }
          st=(geos[0].split("US")[1]).slice(0,2)
          if (st.startsWith("0")){
              dataObject.stateshown=(geos[0].split("US0")[1]).slice(0,1)
          } else {
              if (geos[0].split("US")[1].length==4){
                  dataObject.stateshown=(geos[0].split("US")[1]).slice(0,1)
              } else {
                  dataObject.stateshown=(geos[0].split("US")[1]).slice(0,2)
              }
              
          }
          /* BUG - was loading Westion County from Wyoming when only one county selected.
          } else {
              //alert("split on US")
              fip=hash.geo.split("US")[1]
              
              if (fip.startsWith("0")){
                  fips=parseInt(hash.geo.split("US0")[1])
              } else {
                  fips=parseInt(hash.geo.split("US")[1])
              }
              st=(hash.geo.split("US")[1]).slice(0,2)
              if (st.startsWith("0")){
                      dataObject.stateshown=(hash.geo.split("US0")[1]).slice(0,1)
              } else {
                  if (hash.geo.split("US")[1].length==4){
                      dataObject.stateshown=(hash.geo.split("US")[1]).slice(0,1)
                  } else {
                      dataObject.stateshown=(hash.geo.split("US")[1]).slice(0,2)
                  }
              
              }
          }
          */
  } else if (hash.state) {
      //fips = $("#state_select").find(":selected").attr("stateid").trimLeft("0");
      fips = stateID[hash.state.split(",")[0].toUpperCase()];
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

function loadGeos(geo, attempts, callback) {
  // Commented out in navigation.js since being called from map.js too.

  // load only, no search filter display - get county name from geo value.
  // created from a copy of loadStateCounties() in search-filters.js

  // Not being reached.
  //alert("loadGeos")
  
  if (typeof d3 !== 'undefined') {

    let hash = getHash();
    let stateID = {AL:1,AK:2,AZ:4,AR:5,CA:6,CO:8,CT:9,DE:10,FL:12,GA:13,HI:15,ID:16,IL:17,IN:18,IA:19,KS:20,KY:21,LA:22,ME:23,MD:24,MA:25,MI:26,MN:27,MS:28,MO:29,MT:30,NE:31,NV:32,NH:33,NJ:34,NM:35,NY:36,NC:37,ND:38,OH:39,OK:40,OR:41,PA:42,RI:44,SC:45,SD:46,TN:47,TX:48,UT:49,VT:50,VA:51,WA:53,WV:54,WI:55,WY:56,AS:60,GU:66,MP:69,PR:72,VI:78,}
    //let theState = "GA"; // TEMP - TODO: loop trough states from start of geo
    let theState = hash.state ? hash.state.split(",")[0].toUpperCase() : undefined;
    if (!theState) {
      goHash({'geoview':'state'});
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

        //alert("localStorage.length ");
        //alert(localStorage.length);
        //alert(theState)
        // Doesn't get populated: localStorage.geos[theState]

        // TO DO: We'll probably push on multiple sets of counties for different states (plus individual states and countries: AK and US)
        localStorage.setItem("geos", JSON.stringify(geoArray));

        //localStorage.setItem("geos.GA", JSON.stringify(geoArray));

        console.log("localStorage.geos")
        //console.log(JSON.parse(localStorage.geos)); // Works
        //console.log(JSON.parse(localStorage.geos.GA)); // Nope

        // About localStorage 
        // https://blog.logrocket.com/localstorage-javascript-complete-guide/

        //alert("loadGeos return");
        callback(); // TypeError: callback is not a function
        return;
      });
    }
  } else {
    attempts = attempts + 1;
        if (attempts < 2000) {
          // To do: Add a loading image after a coouple seconds. 2000 waits about 300 seconds.
          setTimeout( function() {
            loadGeos(geo,attempts,callback);
          }, 20 );
        } else {
          alert("D3 javascript not available for loading counties csv.")
        }
  }
}

function includeCSS3(url,theroot) {
    console.log("includeCSS3 url: " + url);
    let urlID = getUrlID3(url,theroot); // AVOID using theroot parameter. It can be eliminated.
    if (!document.getElementById(urlID)) { // Prevents multiple loads.
        var link  = document.createElement('link');
        link.id   = urlID;
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        link.media = 'all';
        //$(document).ready(function () { /* Not necessary if appending to head */
            //var body  = document.getElementsByTagName('body')[0];
            //body.appendChild(link);
        //});
        var head  = document.getElementsByTagName('head')[0];
        
        // Not using because css needs to follow site.css.
        //head.insertBefore(link, head.firstChild);
        // Beaware, not all html pages contain a head tag. https://www.stevesouders.com/blog/2010/05/11/appendchild-vs-insertbefore/
        // Also see "postscribe" use in this page.
        head.appendChild(link); // Since site-narrow.css comes after site.css
    }
}
function getDomain(url) {

    url = url.replace(/(https?:\/\/)?(www.)?/i, '');


        //url = url.split('.');

        //url = url.slice(url.length - 2).join('.');


    if (url.indexOf('/') !== -1) {
        return url.split('/')[0];
    }

    return url;
}

function getUrlID3(url,theroot) {

  // AVOID using theroot parameter. It can be eliminated.

  // TODO: .NET compatible id will use underscores.  Also lowercase it and removing starter slash:
  // id="icon_family_material_icons"
  // Already added to go, walker

  let startingUrl = url;
  // Remove hash since it has no effect when on an include tag.
  if (url.indexOf('#') > 0) {
    url = url.substring(0,url.indexOf('#')); 
  }

  // Remove domain and port from url
  // url = "/" +   BUG: Added double // as in //localsite/css/dev.css
  url = url.replace(/^[a-z]{4,5}\:\/{2}[a-z]{1,}\:[0-9]{1,4}.(.*)/, '$1'); // http or https
  if (url.indexOf("//") == -1 && url[0] != "/") { // Not https:// and not already starting with /
    url = "/" + url;
  }
  //url = theroot + url;

  // Retain domain if not local. Prevents two external IDs from matching.
  let domain = getDomain(url);
  if (domain) {
    // No changes to url
    console.log("getUrlID3 no change to url since domain: " + url + " Domain: " + domain);
  } else {
    // url = url.replace("/localsite/../localsite/","/localsite/"); // hack for /localsite/../localsite/css/tabulator.min.css
              
    console.log("getUrlID3 url: " + url);
    // Remove front folder for each ../
    
      if (100==100) {
        //alert("url before " + url);

        let climbcount = (url.match(/\.\.\//g) || []).length; // Number of ../ instances in url
        // TODO: Adjust for non-consecutive ../
        if (climbcount >= 1) {
            let beginning = url.split("../");

            
              //alert(url);
              //alert(beginning[0]);

              let newbeginning = beginning[0].replace(/^\/+|\/+$/g, ''); // Remove beginning and ending slashes
              let beginningFolder = newbeginning.split("/"); // Split on remaining slashes
              if (beginningFolder.length >= 1) {
                
                let keepcount = beginningFolder.length - climbcount;
                if (keepcount < 0) {
                  keepcount = 0;
                }
                keepfolders = "/";
                // Omit from right side of front.
                for (i = 0; i < beginningFolder.length; i++) {
                  if (i < keepcount) {
                    keepfolders += beginningFolder[i] + keepfolders;
                  }
                }
              }
              //alert("keepfolders: " + keepfolders);
              //alert("trim " + beginning[0] + " from " + url);
              //alert(url.trimLeft(beginning[0]));
              //url = keepfolders + url.trimLeft(beginning[0]); // Didn't work

              //alert(url.replace(beginning[0],""));
              //alert(url);

              url = keepfolders + url.replace(beginning[0],"").replace(new RegExp('../', 'g'),""); // All instances of ../
              //alert(url);
              console.log("beginningFolder.length " + beginningFolder.length + " for " + startingUrl  + " leads to urlID " + url);
        }
      }
  }

  //let urlID = url.replace(theroot,"").replace("https://","").replace("http://","");
  ////.replace(/\//g,"-").replace(/\./g,"-");

  let urlID = url

  if (urlID.indexOf('?') > 0) {
    // Keeping an external site reuses the same file path with different parameters.
    //urlID = urlID.substring(0,urlID.indexOf('?')); // Remove parameter so ?v=1 is not included in id.
  }

  urlID = urlID.replace(/^.*\/\/[^\/]+/, '');

  //console.log("urlID after adjustment: " + urlID);
  return urlID;
}

function loadMapFiltersJS(theroot, count) {
  console.log("loadMapFiltersJS");
  if (typeof customD3loaded !== 'undefined' && typeof localsite_map !== 'undefined') {
      if (document.getElementById("/icon?family=Material+Icons")) {
          $(".show-on-load").removeClass("show-on-load");
      }
  } else if (count<100) { // Wait a milisecond and try again
    setTimeout( function() {
      consoleLog("try loadMapFiltersJS again")
      loadMapFiltersJS(theroot,count+1);
    }, 10 );
  } else {
    consoleLog("ERROR: loadMapFiltersJS exceeded 100 attempts.");
    if (typeof customD3loaded === 'undefined') {
      consoleLog("REASON customD3loaded undefined");
    }
    if (typeof localsite_map === 'undefined') {
      consoleLog("REASON localsite_map undefined");
    }
  }

} 

// Pass in the objects to merge as arguments.
// For a deep extend, set the first argument to `true`.
// https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
function extend () {

  // Variables
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  // Check if a deep merge
  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  // Merge the object into the extended object
  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        // If deep merge and property is an object, merge properties
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = structuredClone(extend( true, extended[prop], obj[prop] ));
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

function loadTabulator() {
  if (typeof Tabulator === 'undefined') {
    includeCSS3(theroot + 'css/tabulator.min.css',theroot);
    includeCSS3(theroot + 'css/base-tabulator.css',theroot);
    
    // BUGBUG - Tabulator v6.2.0 error at http://localhost:8887/localsite/info/#geoview=country
    // Uncaught RangeError: Maximum call stack size exceeded
    //loadScript(theroot + 'js/tabulator.min.js', function(results) {});

    // HACK - using 5.5.2 until above resolved
    //alert("tabulator552")
    loadScript(theroot + 'js/tabulator552.min.js', function(results) {});
  }
}

// Serialize a key/value object.
//var params = { width:1680, height:1050 };
//var str = jQuery.param( params );
//alert( str ); // Returns:  width=1680&height=1050

function updateHiddenhash(hashObject) {

  for (var key in hashObject) {
    if (hashObject.hasOwnProperty(key)) {
        //alert(key + " -> " + hashObject[key]);

        // Currently needed for heatmap, else coal appears first
        hiddenhash[key] = hashObject[key];

        // To Do: Populate hiddenhash div instead.
        
        // Temp - remove these two lines after activating hiddenhash div.
        var event = new CustomEvent('hiddenhashChangeEvent');
        document.dispatchEvent(event); // Dispatch the event

    }
  }
  return;
}

function extractHostnameAndPort(url) {
    //consoleLog("hostname from: " + url);
    let hostname;
    let protocol = "";
    // find & remove protocol (http, ftp, etc.) and get hostname
    if (url.indexOf("//") > -1) {
        protocol = url.split('//')[0] + "//"; // Retain http or https
        hostname = protocol + url.split('/')[2];
    } else {
        hostname = url.split('/')[0];
    }
    //find & remove "?" and parameters
    hostname = hostname.split('?')[0];
    //console.log("extractHostnameAndPort hostname: " + hostname);
    return hostname;
}


// Error on storage page: this.replace is not a function
// So renamed to toTitleCaseFormatFormat. Haven't confirmed.
String.prototype.toTitleCaseFormat = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}
function getState(stateCode) {
  switch (stateCode)
  {
      case "AL": return "Alabama";
      case "AK": return "Alaska";
      case "AS": return "American Samoa";
      case "AZ": return "Arizona";
      case "AR": return "Arkansas";
      case "CA": return "California";
      case "CO": return "Colorado";
      case "CT": return "Connecticut";
      case "DE": return "Delaware";
      case "DC": return "District Of Columbia";
      case "FM": return "Federated States Of Micronesia";
      case "FL": return "Florida";
      case "GA": return "Georgia";
      case "GU": return "Guam";
      case "HI": return "Hawaii";
      case "ID": return "Idaho";
      case "IL": return "Illinois";
      case "IN": return "Indiana";
      case "IA": return "Iowa";
      case "KS": return "Kansas";
      case "KY": return "Kentucky";
      case "LA": return "Louisiana";
      case "ME": return "Maine";
      case "MH": return "Marshall Islands";
      case "MD": return "Maryland";
      case "MA": return "Massachusetts";
      case "MI": return "Michigan";
      case "MN": return "Minnesota";
      case "MS": return "Mississippi";
      case "MO": return "Missouri";
      case "MT": return "Montana";
      case "NE": return "Nebraska";
      case "NV": return "Nevada";
      case "NH": return "New Hampshire";
      case "NJ": return "New Jersey";
      case "NM": return "New Mexico";
      case "NY": return "New York";
      case "NC": return "North Carolina";
      case "ND": return "North Dakota";
      case "MP": return "Northern Mariana Islands";
      case "OH": return "Ohio";
      case "OK": return "Oklahoma";
      case "OR": return "Oregon";
      case "PW": return "Palau";
      case "PA": return "Pennsylvania";
      case "PR": return "Puerto Rico";
      case "RI": return "Rhode Island";
      case "SC": return "South Carolina";
      case "SD": return "South Dakota";
      case "TN": return "Tennessee";
      case "TX": return "Texas";
      case "UT": return "Utah";
      case "VT": return "Vermont";
      case "VI": return "Virgin Islands";
      case "VA": return "Virginia";
      case "WA": return "Washington";
      case "WV": return "West Virginia";
      case "WI": return "Wisconsin";
      case "WY": return "Wyoming";
  }
}

function showSearchFilter() {
  if ($("#filterFieldsHolder").is(':visible') ) {
    $("#filterFieldsHolder").hide();
    $("#showSideFromHeader").show();
    return;
  }
  let loadFilters = false;
  let headerHeight = $("#headerbar").height(); // Not sure why this is 99 rather than 100
  //closeSideTabs(); // Later search will be pulled into side tab.
  if (!$("#filterFieldsHolder").length) { // Resides in template-main.html. Filter doesn't exist yet, initial map/index.html load.
    //if (!$("#datascape").length) {
    //  $('body').prepend("<div id='datascape'></div>");
    //}
    //loadLocalTemplate(); // Loaded a second time on community page
    loadSearchFilterCss();
    loadScript(theroot + 'js/navigation.js', function(results) {
      //console.log('DEACTIVATED %cloadLeafletAndMapFilters called by showSearchFilter(). Might cause dup', 'color: red; background: yellow; font-size: 14px');
      //loadLeafletAndMapFilters();
    });
    $('html,body').scrollTop(0);
    loadFilters = true;
  } else {
    let filterTop = $("#filterFieldsHolder").offset().top - window.pageYOffset;
    consoleLog("showSearchFilter #filterFieldsHolder offset top: " + filterTop);
    //  || (!$("#headerbar").is(':visible') && filterTop >= 0)
    if ($("#filterFieldsHolder").is(':visible') && (($("#headerbar").is(':visible') && filterTop >= headerHeight) )) { // Might need to allow for coverage by header.
      consoleLog("Hide #filterFieldsHolder");
      $("#filterFieldsHolder").hide();
      $("#filterFieldsHolder").addClass("filterFieldsHidden");
    } else {
      // #datascape is needed for map/index.html to apply $("#filterFieldsHolder").show()
      // Also prevents search filter from flashing briefly in map/index.html before moving into #datascape
        
      if (document.getElementById("filterFieldContent") == null) { 
        //alert("load filter.html")
        let filterFile = local_app.modelearth_root() + "/localsite/map/filter.html";
        $("#filterFieldsHolder").load(filterFile, function( response, status, xhr ) {

        }); // End $("#filters").load

        loadFilters = true;
      } else { // Already exists, show filters
        revealFilters();
      }
    }

    let expandIcon = '<div class="hideNarrow" style="position:absolute;z-index:10000">' +
            '<div class="closeSideTabs expandToFullscreen iconPadding" style="border:0px;"><i class="material-icons menuTopIcon" style="font-size:42px;opacity:0.7;margin-top:-4px">&#xE5D0;</i></div>' +
            '<div class="closeSideTabs reduceFromFullscreen iconPadding" style="display:none; border:0px;"><i class="material-icons menuTopIcon" style="font-size:42px;opacity:0.7;margin-top:-4px">&#xE5D1;</i></div>' +
        '</div>';
    //$('#datascape').prepend(expandIcon);

    if (loadFilters) {
      waitForElm('#datascape #filterFieldContent').then((elm) => {
        revealFilters();
      });
    }
  }

}
function closeSideTabs() {
  console.log("closeSideTabs()");
  updateHash({"sidetab":""});
  $("#rightSideTabs").hide();
  $("body").removeClass("bodyRightMargin");
  if (!$('body').hasClass('bodyLeftMargin')) {
    $('body').removeClass('mobileView');
  }
  $("#closeSideTabs").hide();
  $("#showSideTabs").show();
}
function revealFilters() {
  //console.log("show #filterFieldsHolder");
  $("#showSideFromHeader").hide();
  $("#filterFieldsHolder").show();
  $("#filterFieldsHolder").removeClass("filterFieldsHidden");
  //$("#filterbaroffset").show();
  $(".hideWhenPop").show();
  $('html,body').scrollTop(0);
}
function showGlobalMap(globalMap) { // Used by community/index.html, green-sah
  $("#nullschoolHeader").show();

  if($("#globalMapHolder").length <= 1) {
    //$("#globalMapHolder").html('<iframe src="https://earth.nullschool.net/#current/chem/surface/currents/overlay=no2/orthographic=-115.84,31.09,1037" class="iframe" name="mainframe" id="mainframe"></iframe><div id="mapText" style="padding-left:20px"></div>');
    
    // Two steps prevent loading error
    $("#globalMapHolder").html('<iframe src="" class="iframe" name="mainframe" id="mainframe"></iframe><div id="mapText" style="padding-left:20px"></div>');
    
    loadIframe("mainframe",globalMap);

    // Chem Currents NO2 - Since Wind makes NO2 clouds hard to see
    //loadIframe("mainframe","https://earth.nullschool.net/#current/chem/surface/currents/overlay=no2/orthographic=-115.84,31.09,1037");

  }
}
function loadIframe(iframeName, url) {  
  var $iframe = $('#' + iframeName);
  if ($iframe.length) {
      //alert("loadIframe" + url)
      $iframe.attr('src',url);
      $("#nullschoolHeader #mainbucket").show();
      $("#nullschoolHeader #earthZoom").show();
      return false;
  }
  return true;
}


function waitForSubObject(theObject, theSubObject, callback) { // To confirm: Declare object using var since let will not be detected.
  var interval = setInterval(function() {
    if (window[theObject]) {
      console.log('waitForSubObject. theObject: ' + theObject + '. Waiting for theSubObject: ' + theSubObject);
      if (theSubObject in window[theObject] && Object.keys(window[theObject][theSubObject]).length > 0) {
        //consoleLog("layers count " + );

        //if (window[theObject].layers["bioeconomy"].section) {

          clearInterval(interval);
          consoleLog('waitForSubObject found ' + theObject + '.' + theSubObject);
          callback();
          return;
        //}
      }
    }
    //consoleLog('waitForSubObject ' + theObject + '.' + theSubObject);
  }, 300);
}

// To Do, add object
if(typeof waitingForVarSince == 'undefined') {
  var waitingForVarSince = {};
}
function waitForVariable(variable, callback) { // Declare variable using var since "let" will not be detected.
  var interval = setInterval(function() {
    if(!waitingForVarSince[variable]) {
      waitingForVarSince[variable] = Date.now();
    }
    if (Date.now() - waitingForVarSince[variable] > 20000) { // 20 seconds
      clearInterval(interval);
      consoleLog('waitForVariable "' + variable + '" exceeded 20 seconds. ' + (Date.now() - waitingForVarSince[variable])/1000);
      return;
    }
    if (window[variable]) {
      waitingForVarSince[variable] = null;
      clearInterval(interval);
      consoleLog('waitForVariable found: ' + variable);
      callback();
      return;
    }
    consoleLog('waitForVariable "' + variable + '" since ' + waitingForVarSince[variable]);
  }, 100);
}

// TO DO: Optimize by checking just the nodes in the mutations
// https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            consoleLog("waitForElm found " + selector);
            return resolve(document.querySelector(selector));
        }
        if (document.body) {
          waitForElmKickoff(selector,resolve);
        } else {
          // Wait for body to be available, but not stylesheets, images. Prevents error when body not yet available: TypeError: Failed to execute 'observe' on 'MutationObserver': parameter 1 is not of type 'Node'.
          document.addEventListener("DOMContentLoaded", function(event) {
            waitForElmKickoff(selector,resolve);
          });
        }
    });
}
function waitForElmKickoff(selector, resolve) {
  consoleLog("waitForElm waiting for " + selector);
  const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
          resolve(document.querySelector(selector));
          observer.disconnect();
      }
  });

  observer.observe(document.body, {
      childList: true, //This is a must have for the observer with subtree
      subtree: true //Set to true if changes must also be observed in descendants.
  });
}

function loadText(pagePath, divID, target) { // For html and yaml
  const theDivID = (divID.startsWith('#') || divID.startsWith('.')) ? divID : '#' + divID;
  waitForElm(theDivID).then((elm) => {
    const theDiv = document.getElementById(divID);
    //theDiv.load(pagePath, function( response, status, xhr ) {
    //  loadIntoDiv(pagePath,theDivID,response,callback);
    //});


    fetch(pagePath)
        .then(function(response) {
            // Check if the response is successful
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('Network response was not ok');
            }
        })
        .then(function(data) {
            // Insert the content into the div
            theDiv.innerHTML = data;

            // loadIntoDiv(pagePath,theDivID,response,callback);

            // Execute the callback function
            //callback(data, 'success', null);
        })
        .catch(function(error) {
            // Handle any errors
            callback(null, 'error', error);
        });



  });
}


function forkEditLink(pageURL) {
    // Base URL to be appended
    const baseUrl = "https://holocron.so/github/pr/";

    // Object for GitHub account based on URL
    const githubAccounts = {"locations.georgia.org": "georgiadata", "locations.pages.dev": "georgiadata"};
    const domain = (new URL(window.location.href)).hostname;
    const repo = githubAccounts[domain] || "modelearth";

    // Object for non-main branches
    const nonMainBranches = {"community": "master"};

    // Extract the path after the domain
    const url = new URL(pageURL);
    const path = url.pathname;

    // Identify the repository name dynamically
    const pathSegments = path.split('/');
    
    // Assuming the first segment is always empty because path starts with '/'
    // and the second segment is the repository name
    const repoName = pathSegments[1];

    // Determine the branch
    const branch = nonMainBranches[repoName] || "main";

    // The part to be inserted
    const insertPart = `${branch}/editor/`;

    // Construct the final URL by inserting 'branch/editor/' after the repo name
    const newPath = `/${repoName}/${insertPart}${pathSegments.slice(2).join('/')}`;

    // Construct the final URL
    const finalUrl = baseUrl + repo + newPath;

    return finalUrl;
}

// Get the URL of the current page
const currentPageURL = window.location.href;
//const newURL = forkEditLink(currentPageURL);
//alert(newURL);

function escapeUnderscoresOutsideCodeBlocks(markdown) {
  // Split the markdown into lines for processing
  const lines = markdown.split('\n');
  const processedLines = [];
  
  let inCodeFence = false;
  let codeBlockType = null;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Check for code fences (```bash, ```javascript, etc.)
    if (line.trim().startsWith('```')) {
      inCodeFence = !inCodeFence;
      if (inCodeFence) {
        codeBlockType = line.trim().substring(3);
      } else {
        codeBlockType = null;
      }
      processedLines.push(line);
      continue;
    }
    
    // Check for tab-indented code blocks (4 spaces or tab at start)
    const isTabIndented = line.match(/^(\t|    )/);
    
    // If we're in a code block or this line is tab-indented, don't process underscores
    if (inCodeFence || isTabIndented) {
      processedLines.push(line);
      continue;
    }
    
    // Process inline code spans (`code`) by temporarily replacing them
    // Match pairs of backticks with content between them (including empty)
    const inlineCodeRegex = /`[^`]*`/g;
    const inlineCodeBlocks = [];
    let tempLine = line.replace(inlineCodeRegex, (match) => {
      const placeholder = `XYZINLINECODEXYZ${inlineCodeBlocks.length}XYZENDXYZ`;
      inlineCodeBlocks.push(match);
      return placeholder;
    });
    
    // Process HTML elements by temporarily replacing them
    // Match HTML tags with attributes that might contain underscores
    const htmlElementRegex = /<(a|img|pre|code|script|style|link|meta)[^>]*>.*?<\/\1>|<(a|img|pre|code|script|style|link|meta|br|hr|input)[^>]*\/?>/gi;
    const htmlElements = [];
    tempLine = tempLine.replace(htmlElementRegex, (match) => {
      const placeholder = `XYZHTMLELEMENTXYZ${htmlElements.length}XYZENDXYZ`;
      htmlElements.push(match);
      return placeholder;
    });
    
    // Also handle HTML attributes specifically (href, src, etc.) that might span lines or be standalone
    const attributeRegex = /\b(href|src|action|data-[a-z-]+|class|id|style|alt|title)\s*=\s*(['"]?)([^'">\s]*)\2/gi;
    const attributes = [];
    tempLine = tempLine.replace(attributeRegex, (match) => {
      const placeholder = `XYZATTRIBUTEXYZ${attributes.length}XYZENDXYZ`;
      attributes.push(match);
      return placeholder;
    });
    
    // Now escape underscores in the remaining text (not already escaped)
    tempLine = tempLine.replace(/(?<!\\)_/g, '\\_');
    
    // Restore attributes
    attributes.forEach((attribute, index) => {
      const placeholder = `XYZATTRIBUTEXYZ${index}XYZENDXYZ`;
      tempLine = tempLine.split(placeholder).join(attribute);
    });
    
    // Restore HTML elements
    htmlElements.forEach((htmlElement, index) => {
      const placeholder = `XYZHTMLELEMENTXYZ${index}XYZENDXYZ`;
      tempLine = tempLine.split(placeholder).join(htmlElement);
    });
    
    // Restore inline code blocks
    inlineCodeBlocks.forEach((codeBlock, index) => {
      const placeholder = `XYZINLINECODEXYZ${index}XYZENDXYZ`;
      tempLine = tempLine.split(placeholder).join(codeBlock);
    });
    
    processedLines.push(tempLine);
  }
  
  return processedLines.join('\n');
}

function formatBuckets(htmlText) {
  // Create a temporary div to work with the HTML
  var tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlText;
  
  // Convert to array of child nodes for easier processing
  var nodes = Array.from(tempDiv.childNodes);
  
  // Clear the temp div to rebuild it
  tempDiv.innerHTML = '';
  
  var currentBucket = null;
  var currentBucketContent = null;
  
  // Process each node sequentially
  nodes.forEach(function(node) {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === 'h2') {
      // Close previous bucket if it exists
      if (currentBucket && currentBucketContent) {
        currentBucket.appendChild(currentBucketContent);
        tempDiv.appendChild(currentBucket);
      }
      
      // Start new bucket
      currentBucket = document.createElement('div');
      currentBucket.className = 'bucket';
      
      // Add h2 to the bucket
      currentBucket.appendChild(node);
      
      // Create new bucketcontent div
      currentBucketContent = document.createElement('div');
      currentBucketContent.className = 'bucketcontent';
    } else if (currentBucket && currentBucketContent) {
      // Add content to current bucket
      if (node.nodeType === Node.ELEMENT_NODE || 
          (node.nodeType === Node.TEXT_NODE && node.textContent.trim())) {
        currentBucketContent.appendChild(node);
      }
    } else {
      // Content before first h2 - add directly to tempDiv
      if (node.nodeType === Node.ELEMENT_NODE || 
          (node.nodeType === Node.TEXT_NODE && node.textContent.trim())) {
        tempDiv.appendChild(node);
      }
    }
  });
  
  // Close final bucket if it exists
  if (currentBucket && currentBucketContent) {
    currentBucket.appendChild(currentBucketContent);
    tempDiv.appendChild(currentBucket);
  }
  
  // Return the processed HTML
  return tempDiv.innerHTML;
}

function loadMarkdown(pagePath, divID, target, attempts, callback) {
  if (typeof attempts === 'undefined') {
    attempts = 1;
  }
  // WAIT FOR SCRIPT THAT LOADS README.md Files
  loadScript(theroot + 'js/d3.v5.min.js', function(results) {
  //loadScript(theroot + 'js/jquery.min.js', function(results) {
  loadScript(theroot + 'js/showdown.min.js', function(results) {

  if (typeof customD3loaded !== 'undefined' && typeof showdownLoaded !== 'undefined') { // Ready
  } else if (attempts < 300) { // Wait and try again
    setTimeout( function() {
      //consoleLog("try loadMarkdown again")
      loadMarkdown(pagePath, divID, target, attempts+1, callback);
    }, 30 );
    return;
  } else {
    consoleLog("ERROR: loadMarkdown exceeded " + attempts + " attempts.");
    if (typeof customD3loaded === 'undefined') {
      consoleLog("REASON customD3loaded undefined");
    }
    if (typeof showdownLoaded === 'undefined') {
      consoleLog("REASON showdownLoaded undefined");
    }
    return;
  }

  //waitForElm(customD3loaded).then((elm) => {

    // getPageFolder:
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

    if (pageFolder.indexOf('https://raw.githubusercontent.com/wiki') >= 0) {
      pageFolder = pageFolder.replace("https://raw.githubusercontent.com/wiki/","https://github.com/") + "/wiki/"; 
    }

    // Get the levels below root
    //let foldercount = (location.pathname.split('/').length - 1); // - (location.pathname[location.pathname.length - 1] == '/' ? 1 : 0) // Removed because ending with slash or filename does not effect levels. Increased -1 to -2.
    
    // Might not be used
    //alert(location.pathname)
    ////let foldercount = (location.pathname.split('/').length - 1);
    /*
    let foldercount = (pagePath.split('/').length - 1);
    foldercount = foldercount - 2;
    let climbcount = foldercount;
    if(location.host.indexOf('localhost') >= 0) {
      climbcount = foldercount - 0;
    }
    let climbpath = "";
    for (let i = 0; i < climbcount; i++) {
      climbpath += "../";
    }
    if(climbpath == "") {
      //climbpath == "./";
    }
    */
    d3.text(pagePath).then(function(data) {

      // Path is replaced further down page. Reactivate after adding menu.
      //let downloadReadme = "<div class='markdownEye' style='position:absolute;z-index:1px;cursor:pointer;font-size:28px;right:0px;top:0px;text-decoration:none;opacity:.7'><a href='" + pagePath + "' style='color:#555'>…</a></div>";
      //alert(pagePath)

      /////let linkEditFork = "https://holocron.so/github/pr/modelearth/data-commons/main/editor/docs/water/index.md";

      let pageURL = window.location.href;
      let linkEditFork = forkEditLink(pageURL) + pagePath;
      let editReadme = "<div class='editInFork' style='float:right;z-index:1;cursor:pointer;text-decoration:none;opacity:.7'><a href='" + linkEditFork + "'><i class='material-icons' style='font-size:16px;opacity:0.7;margin-top:-4px'>&#xE3C9;</i></a></div>";
      
      // TEMP - Holocron may have converted iFrame to broken HTML
      editReadme = "";

      // CUSTOM About YAML metadata converter: https://github.com/showdownjs/showdown/issues/260

      // Also try adding simpleLineBreaks http://demo.showdownjs.com/

      // Escape underscores outside of code blocks in the markdown data
      data = escapeUnderscoresOutsideCodeBlocks(data);

      var converter = new showdown.Converter({tables:true, metadata:true, simpleLineBreaks: true}),
      html = editReadme + converter.makeHtml(data);

      var metadata = converter.getMetadata(true); // returns a string with the raw metadata
      var metadataFormat = converter.getMetadataFormat(); // returns the format of the metadata

      // This returns YAML and JSON at top of README.md page.
      if (metadata) {
        //alert(metadata);

        /*
        // UNDER DEVELOPMENT
        // Planning to use one of these:
        // https://github.com/jeremyfa/yaml.js  (See: https://www.npmjs.com/package/yamljs)
        // https://github.com/nodeca/js-yaml

        obj = jsYaml.load(metadata, { schema: SEXY_SCHEMA });

        result.setOption('mode', 'javascript');
        result.setValue(inspect(obj, false, 10));

        convertToHtmlTable(obj);

        html = metadata + html;
        */
      }

      // Apply formatBuckets when on localhost
      //if (location.host.indexOf('localhost') >= 0) { // Might limit to specific pages instead
        html = formatBuckets(html);
      //}

      // Appends rather than overwrites
      loadIntoDiv(pageFolder,divID,html, function() {
        // Call the main callback after loadIntoDiv finishes
        if (typeof callback === 'function') {
          //alert("valid") // BUGBUG Not reaching
          setTimeout( function() {
            callback();
          }, 30 );
        }
      });

    });
  });
  });
  //});
}
function loadIntoDiv(pageFolder,divID,html,callback) {
  const theDivID = (divID.startsWith('#') || divID.startsWith('.')) ? divID : '#' + divID;
  waitForElm(theDivID).then((elm) => {
    const thediv = document.getElementById(divID);
    var newcontent = document.createElement('div');
    newcontent.innerHTML = html;
    while (newcontent.firstChild) {
        thediv.appendChild(newcontent.firstChild);
    }

    document.getElementById(divID).style.display = "block";
    document.getElementById(divID).style.position = "relative"; // So upper right eye icon remains within div.
    document.getElementById(divID).style.overflow = "auto"; // Prevents text from falling below adjacent float.

    //alert("climbpath works for deeper: " + climbpath);
    //alert("pageFolder shows path: " + pageFolder);
    //alert(pagePath);

    // To do: might apply to html parameter above rather than DOM.
    let element = document.getElementById(divID);

    // Get all the anchor (a) elements with 'href' attribute inside the element
    let links = element.querySelectorAll('a[href]');

    // Loop through the links and perform your desired actions


    /* DELETE
    for (var i = 0; i < links.length; i++) {
    // Replaced this JQuery version
    //$("#" + divID + " a[href]").each(function() {

      //if (pagePath.indexOf('../') >= 0) { // If .md file is not in the current directory
      //$("#" + divID + " a[href]").each(function() {
      if($(this).attr("href").toLowerCase().indexOf("http") < 0){ // Relative links only        
          //$(this).attr("href", climbpath + $(this).attr('href'));
          $(this).attr("href", pageFolder + $(this).attr('href'));
          //console.log("Showdown link update: " + pageFolder + " plus " + $(this).attr('href'));
      } 
      else if (!/^http/.test($(this).attr("href"))) { // Also not Relative link
          console.log("ALERT Adjust: " + $(this).attr('href'));
          $(this).attr("href", pageFolder + $(this).attr('href'));
          //console.log("Showdown link update2: " + pageFolder + " plus " + $(this).attr('href'));
      }
      else {
          //console.log("Showdown link update3 none: " + pageFolder + " plus " + $(this).attr('href'));
      }
    }
    */

    links.forEach(function(currentElement) {
      // Check if the link is a relative link
      if (currentElement.getAttribute("href").toLowerCase().indexOf("http") < 0) {
        // Update the href attribute with the pageFolder
        currentElement.setAttribute("href", pageFolder + currentElement.getAttribute('href'));
        //console.log("Showdown link update: " + pageFolder + " plus " + currentElement.getAttribute('href'));
      }
      // Check if the link is not a full URL
      else if (!/^http/.test(currentElement.getAttribute("href"))) {
        console.log("ALERT Adjust: " + currentElement.getAttribute('href'));
        // Update the href attribute with the pageFolder
        currentElement.setAttribute("href", pageFolder + currentElement.getAttribute('href'));
        //console.log("Showdown link update2: " + pageFolder + " plus " + currentElement.getAttribute('href'));
      }
    });


    if(callback) callback();
  });
}

/* Allows map to remove selected shapes when backing up. */
/*
document.addEventListener('localHashChangeEvent', function (elem) {
  console.log("localsite.js detects URL localHashChangeEvent");
  localHashChanged();
}, false);

function localHashChanged() {
  let hash = getHash();
  if (hash.geoview && !priorHash.geoview) {

  }
}
*/
function removeElement(divID) {
    // parentNode is used for IE.
    let element = document.getElementById(divID);
    if (element) {
      element.parentNode.removeChild(element);
    }
}

function useSet() {
    let uAcc = 0;
    if (Cookies.get('at_a')) {
        if (location.host.indexOf('localhost') >= 0) {
            uAcc = 8; // Local
        } else {
            uAcc = 5;
        }
    } // Others can reside here, Git recap
    else {
        uAcc = 0;
    }
    loadUse(uAcc); // Place style

    //alert("param.minuse: " + param.minuse + " uAcc: " + uAcc);
    if (param.minuse && param.minuse > uAcc) { // Todo: Detect multiple acccess levels.
        if (uAcc < 5) {
          Cookies.set('golog', window.location.href);
          if (param.minred) {
            window.location = param.minred;
          } else {
            window.location = "/explore/menu/login/azure";
          }
          return;
        }
    }
}
function loadUse(use) {
    var strUseCss = "<style>";
    if (use==0) {
      strUseCss += ".default{display:block !important}";
    } else {
      strUseCss += ".use-1{display:block !important}";
      if (use==8) {
        strUseCss += ".use-5{display:block !important}";
      }
      strUseCss += ".use-" + use + "{display:block !important}";
    }
    strUseCss += "<\/style>";
    document.head.insertAdjacentHTML("beforeend", strUseCss);
}


// Source: explore/js/embed.js

/*******************************************/

/*!
 * JavaScript Cookie v2.1.1
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        var OldCookies = window.Cookies;
        var api = window.Cookies = factory();
        api.noConflict = function () {
            window.Cookies = OldCookies;
            return api;
        };
    }
}(function () {
    function extend () {
        var i = 0;
        var result = {};
        for (; i < arguments.length; i++) {
            var attributes = arguments[ i ];
            for (var key in attributes) {
                result[key] = attributes[key];
            }
        }
        return result;
    }

    function init (converter) {
        function api (key, value, attributes) {
            var result;
            if (typeof document === 'undefined') {
                return;
            }

            // Write

            if (arguments.length > 1) {
                attributes = extend({
                    path: '/'
                }, api.defaults, attributes);

                if (typeof attributes.expires === 'number') {
                    var expires = new Date();
                    expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
                    attributes.expires = expires;
                }

                try {
                    result = JSON.stringify(value);
                    if (/^[\{\[]/.test(result)) {
                        value = result;
                    }
                } catch (e) {}

                if (!converter.write) {
                    value = encodeURIComponent(String(value))
                        .replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
                } else {
                    value = converter.write(value, key);
                }

                key = encodeURIComponent(String(key));
                key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
                key = key.replace(/[\(\)]/g, escape);

                return (document.cookie = [
                    key, '=', value,
                    attributes.expires && '; expires=' + attributes.expires.toUTCString(), // use expires attribute, max-age is not supported by IE
                    attributes.path    && '; path=' + attributes.path,
                    attributes.domain  && '; domain=' + attributes.domain,
                    attributes.secure ? '; secure' : ''
                ].join(''));
            }

            // Read

            if (!key) {
                result = {};
            }

            // To prevent the for loop in the first place assign an empty array
            // in case there are no cookies at all. Also prevents odd result when
            // calling "get()"
            var cookies = document.cookie ? document.cookie.split('; ') : [];
            var rdecode = /(%[0-9A-Z]{2})+/g;
            var i = 0;

            for (; i < cookies.length; i++) {
                var parts = cookies[i].split('=');
                var name = parts[0].replace(rdecode, decodeURIComponent);
                var cookie = parts.slice(1).join('=');

                if (cookie.charAt(0) === '"') {
                    cookie = cookie.slice(1, -1);
                }

                try {
                    cookie = converter.read ?
                        converter.read(cookie, name) : converter(cookie, name) ||
                        cookie.replace(rdecode, decodeURIComponent);

                    if (this.json) {
                        try {
                            cookie = JSON.parse(cookie);
                        } catch (e) {}
                    }

                    if (key === name) {
                        result = cookie;
                        break;
                    }

                    if (!key) {
                        result[name] = cookie;
                    }
                } catch (e) {}
            }

            return result;
        }

        api.set = api;
        api.get = function (key) {
            return api(key);
        };
        api.getJSON = function () {
            return api.apply({
                json: true
            }, [].slice.call(arguments));
        };
        api.defaults = {};

        api.remove = function (key, attributes) {
            api(key, '', extend(attributes, {
                expires: -1
            }));
        };

        api.withConverter = init;

        return api;
    }

    return init(function () {});
}));
/* End jQuery Cookie Plugin */

// End: explore/js/embed.js

// Copied from setting.js initElements()
function initSitelook() {
    let sitemode;
    let sitesource;
    let sitelook;
    let devmode;
    let onlinemode;
    let globecenter;
    let modelsite;
    let gitrepo;

    if(typeof Cookies != 'undefined') {
        if (Cookies.get('sitelook')) {
          $("#sitelook").val(Cookies.get('sitelook'));
          sitelook = Cookies.get('sitelook');
        }
        if (Cookies.get('sitemode')) {
            $(".sitemode").val(Cookies.get('sitemode'));
        }
        if (Cookies.get('sitesource')) {
            $("#sitesource").val(Cookies.get('sitesource'));
            sitesource = Cookies.get('sitesource');
        }
        if (Cookies.get('sitebasemap')) {
            $(".sitebasemap").val(Cookies.get('sitebasemap'));
        }
        if (Cookies.get('devmode')) {
            $("#devmode").val(Cookies.get('devmode'));
            devmode = Cookies.get('devmode');
        }
        if (Cookies.get('onlinemode')) {
            $("#onlinemode").val(Cookies.get('onlinemode'));
            onlinemode = Cookies.get('onlinemode');
        }
        if (Cookies.get('globecenter')) {
            $("#globecenter").val(Cookies.get('globecenter'));
            globecenter = Cookies.get('globecenter');
        }
        if (Cookies.get('modelsite')) {
            $("#modelsite").val(Cookies.get('modelsite'));
            modelsite = Cookies.get('modelsite');
        }
        if (Cookies.get('gitrepo')) {
            $("#gitrepo").val(Cookies.get('gitrepo'));
            gitrepo = Cookies.get('gitrepo');
        }
    }
    if (param["sitelook"]) { // From URL
        sitelook = param["sitelook"]; 
    }
    setSitelook(sitelook);
    setDevmode(devmode);
    setModelsite(modelsite);
    setGitrepo(modelsite);
    setOnlinemode(onlinemode);
    setGlobecenter(globecenter);
    if (localStorage.email) {
      $("#input123").val(localStorage.email);
      $(".uIn").hide();$(".uOut").show();
    } else {
      $(".uOut").hide();$(".uIn").show();
    }
}

// Update automatically whenever mode change occurs on user computer
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyColorSchemeClass);
function applyColorSchemeClass() {
    let siteLook = Cookies.get('sitelook');
    if (!siteLook) {
        siteLook = "default";
    }
    setSitelook(siteLook);
}

// Run when body tag is available, but don't wait for entire DOM
function waitForBody(callback) {
    if (document.body) {
        callback();
    } else {
        setTimeout(() => waitForBody(callback), 10);
    }
}
waitForBody(applyColorSchemeClass);


function setSitemode(sitemode) {
  // Not copied over from settings.js
}
function setSitelook(siteLook) {
    //let root = "/explore/"; // TEMP
    //let root = "/localsite/";
    if (!siteLook) {
      siteLook = "default"
    }
    consoleLog("setSiteLook: " + siteLook);
    
    // Set sitelook select value
    const sitelookElement = document.getElementById("sitelook");
    if (sitelookElement) {
        sitelookElement.value = siteLook;
    }

    // Force the brower to reload by changing version number. Avoid on localhost for in-browser editing. If else.
    //var forceReload = (location.host.indexOf('localhost') >= 0 ? "" : "?v=3");
    
    if (siteLook == "computer") {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        siteLook = "dark"
      }
    } else if (siteLook == "default" && (Cookies.get('modelsite') == "dreamstudio" || location.host.indexOf("dreamstudio") >= 0 || location.host.indexOf("planet.live") >= 0)) {
      siteLook = "dark"
    }
    if (siteLook == "dark") {
        // Set sitebasemap value and trigger change event
        const sitebasemapElements = document.querySelectorAll('.sitebasemap');
        sitebasemapElements.forEach(element => {
            element.value = "dark";
            element.dispatchEvent(new Event('change'));
        });
        
        //toggleVideo("show","nochange");
        document.body.classList.add("dark");
        //removeElement('/localsite/css/light.css');
        includeCSS3('/localsite/css/bootstrap.darkly.min.css');
  
        // Move search text elements
        const searchTextHolder = document.querySelector('.searchTextHolder');
        const searchTextMove = document.querySelector('.searchTextMove');
        if (searchTextHolder && searchTextMove) {
            searchTextHolder.appendChild(searchTextMove);
        }
    } else if (siteLook == "default") {
        document.body.classList.remove("dark");
        removeElement('/localsite/css/bootstrap.darkly.min.css');
    } else { // Light
        document.body.classList.remove("dark");
        removeElement('/localsite/css/bootstrap.darkly.min.css');
        //const sitebasemapElements = document.querySelectorAll('.sitebasemap');
        //sitebasemapElements.forEach(element => {
        //    element.value = "positron_light_nolabels";
        //    element.dispatchEvent(new Event('change'));
        //});
    }
}
function setDevmode(devmode) {
  if (devmode == "dev") {
    includeCSS3(local_app.localsite_root() + 'css/dev.css');
  } else {
    removeElement('/localsite/css/dev.css');
  }
}
function setOnlinemode(onlinemode) {
  if (onlinemode == "true") {
    onlineApp = true;
    $("#log_display").hide();
  } else if (onlinemode == "false")  {
    onlineApp = false;
    if (Cookies.get('showlog') != "0") {
      $("#log_display").show();
    }
  }
}
function setGlobecenter(globecenter, promptForCurrentPosition) {
  // Invoked when page loads, and when user changes "Map Center" setting.
  if (globecenter == "me") {
    if (promptForCurrentPosition) { // False when page is loading.
      getGeolocation(); // Updates localStorage.latitude if user grants location permission.
    }
    $("#globeLatitude").val(localStorage.latitude);
    $("#globeLongitude").val(localStorage.longitude);
  } else { // Get lat and lon from dropdown menu attributes.
    $("#globeLatitude").val($("#globecenter option:selected").attr("lat"));
    $("#globeLongitude").val($("#globecenter option:selected").attr("lon"));
    // We avoid setting localStorage.latitude to center of oceans since these are used by SeeClickFix
  }
  //alert("Lat: " + $("#globeLongitude").val());

  // Limit to when nullschool already visible.
  if ($('#nullschoolHeader').is(':visible')) {
    if ($("#globeLatitude").val() && $("#globeLongitude").val()) {
        // Add latlon validation
        let globeZoom = "800"; // "1037";

        // Move these into dropdown attributes
        if ($("#globeLongitude").val() == "-160") {
          globeZoom = "300"; // For Pacific
        } else if ($("#globeLongitude").val() == "80") {
          globeZoom = "600"; // For India
        }

        let latLonZoom = $("#globeLongitude").val() + "," + $("#globeLatitude").val() + "," + globeZoom;
        showGlobalMap(`https://earth.nullschool.net/#current/wind/surface/level/orthographic=${latLonZoom}`);
    }
  }
}
function getGeolocation() {
    if (navigator.geolocation) {
        // Prompts user for permission to provide their current location.
        navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
    } else {
        consoleLog('Geolocation is not supported by this browser.');
    }
}
function geoError(err) {
    consoleLog(`Failed to locate. Error: ${err.message}`);
}
function geoSuccess(pos) {
    localStorage.latitude = pos.coords.latitude.toFixed(3);
    localStorage.longitude = pos.coords.longitude.toFixed(3);
    $("#globeLatitude").val(localStorage.latitude);
    $("#globeLongitude").val(localStorage.longitude);
}

function setModelsite(modelsite) {
  if (modelsite != "") {
    console.log("setModelsite() is not currently used.");
    // Avoid calling refresh here since runs when page loads.
  }
}
function setGitrepo(gitrepo) {
  if (gitrepo != "") {
    console.log("setGitrepo() is not currently used.");
    // Avoid calling refresh here since runs when page loads.
  }
}

function safeStringify(obj, replacer = null, spaces = 2) {
    const seen = new WeakSet();
    return JSON.stringify(obj, function(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);
        }
        if (replacer && typeof replacer === 'function') {
            return replacer.call(this, key, value);
        }
        return value;
    }, spaces);
}

// Convert json to html
var selected_array=[];
var omit_array=[];
var fetchedPreviewCount = 0;

function formatRow(key,value,level,item) {
  // item parameter in use by Community-Forecasting pages comunity/zip/leaflet
  level = level + 1;
  var addHtml = "";
  if (level==1 && value && value.length >= 20) {
    const rowmax = 10;
    addHtml += value.length + " rows, showing " + rowmax;
    value = value.slice(0, rowmax);
  }
  //consoleLog("level " + level + " formatRow: " + key + " " + value);
  
  if (key == 'color') { // JQuery uses .colorHolder to set the bar color for class level1 immediately above this div in Community-Forecasting.
    addHtml += "<div class='colorHolder' currentlevel='" + level + "' currentitem='" + item + "' color='" + value + "'></div>"
  }

  // Reactivate after investigating
  if (level==1 && selected_array.length > 0 && !selected_array.includes(key) )  {
    //return addHtml + "</div>";
  }
  if (level==1 && omit_array.length > 0 && omit_array.includes(key) )  {
    //return addHtml + "</div>";
  }

  //if (level==1) { // Span rightcell
  //  level=2;
  //  addHtml += "<div class='hidden titlecell level1' style='width:100%'>" + key + "</div><div style='clear:both' class='hidden level" + level + "'>"
  //} else {
  if (level==1 || level==2) {
    if(key) { // Avoids large left margin for Nasa level1
      //if(value && value.length > 0) { // Hides blank for nutrition
      if(value) { // Hides blank for nutrition
        // level" + level + " 
        addHtml += "<div class='keyonly titlecell celltop'><b>" + key + "</b></div>";
      }
    }
  } else {
    if(key) { // Level 0 won't have a key
      var indentIcon = ""
      if (typeof value != "string" && typeof value != "number") {
        for (var i = 4; i <= level; i++) {
            //indentIcon = indentIcon + "-";
        }
      }
      //addHtml += "<div style='clear:both'></div>";
      addHtml += "<span class='hidden titlecell celltop level" + level + "' style='float:left'>" + indentIcon + " " + key + "</span>";
    }
  }

  if (isObject(value)) {

      var insertStyle = "";
      if (Object.keys(value).length == 1) { // Could we use this to avoid return in GDC hierarchy?
        
        // Did not seem to have an effect here
        //addHtml += "<div style='clear:both'></div>";
      } else {
        if (level >= 4) {
          //insertStyle += "border:1px solid #ccc;";
        }
      }
      var barTitle = "";
      var validTitles = "title,name,summary,facetId,code,type,link_type"; // link_type is for civictechlinks
      // Convert the validTitles string into an array
      var validTitlesArray = validTitles.split(',');

      // Check if a title key exists in the value object
      for (var i = 0; i < validTitlesArray.length; i++) {
          var keyName = validTitlesArray[i];
          if (value.hasOwnProperty(keyName)) {
              barTitle = value[keyName];
              delete value[keyName];
              break;
          }
      }
      if (barTitle && Object.keys(value).length >= 8) {
        barTitle = barTitle + " (" + Object.keys(value).length + " rows)";
        insertStyle += "padding-top:0px;";
      }
      if (barTitle) {
        addHtml += "<div class='floating-object celltop rowlevel" + level + " objectcell objectcell-lines' style='" + insertStyle + "'>"; // Around rows
        addHtml += "<div keyname='" + keyName + "' class='barTitle child-count-" + Object.keys(value).length + "'>" + barTitle + "</div>\n";
      } else {
        addHtml += "<!--Child count " + Object.keys(value).length + "-->";
        addHtml += "<div class='floating-object celltop rowlevel" + level + " objectcell' style='" + insertStyle + "'>"; // Around rows
      
      }
      for (c in value) {
        //consoleLog("isObject: " + key + " " + value);
        
        //if (json.data[a].constructor === Array && selected_array.includes(a) )  {
        if (isObject(value[c])) {
          // Entaglement is removed by parsing back to an object after Stringifing to a string
          addHtml += formatRow(c,JSON.parse(safeStringify(value[c])),level);
        } else if (value[c] == "") {
          // Key without a value. In some circumstance we show these.
          if (c == "index") { // We insert "0" for first record in USEEIO Impact Flow which has index=0
            addHtml += formatRow(c,"0",level);
          }
        } else {
          addHtml += formatRow(c,value[c],level);
        }
        addHtml += "<div class='objectcell-line' style='clear:both'></div>";
      }
      addHtml += "</div>";

  } else if (isArray(value)) {

    consoleLog("formatRow Array value length: " + value.length);

    //consoleLog("isArray: " + key + " " + value + " " + value.length);

    if (value.length > 0) {
      // Surrounding All
      // Level 1 - An array of objects
      addHtml += "<div class='celltop' style='overflow:auto; bottom:10px; padding-top:10px'>";
      value.forEach(item => { // For each row in array
        //consoleLog(value[c],b,c); //c is 0,1,2 index
        
        //addHtml += formatRow(c,value[c],level);

        //consoleLog("Array's object row");
        //consoleLog(item);
        addHtml += formatRow("",item,level);

        // REMOVED HERE.
      });   
      addHtml += "</div>"; // End surrounding
        
    } else { // Array value is a string

      consoleLog("Array of 0: " + key + " " + value);
      //addHtml += formatRow(c,value[c],level);
      addHtml += "<div class='level" + level + "'>" + value + "&nbsp;</div>\n";

    }
  } else if (key == "hdurl" || key == "image_full") { // hdurl from NASA, image_full SeeClickFix
      addHtml += "<a href='" + value + "'><img class='valueimg' loading='lazy' src='" + value + "'></a>"
  } else if (key == "url" || key == "link") { // url from NASA, link from RSS
      addHtml += "<a href='" + value + "'>" + value + "</a>"
  } else if (key.indexOf("Uri")>=0 && value) {
      uriLink = (value.indexOf("http")==0) ? value : "https://" + value; // Brittle
      addHtml += "<a href='" + uriLink + "'>" + value + "</a>"
  } else if (key == "logo") {
      addHtml += "<img src='" + value + "' class='rightlogo'><br>"
  } else if (key.toLowerCase().includes("timestamp")) {
      addHtml += "<div class='level" + level + "'>" +  new Date(value) + "</div>\n";
  } else {
      consoleLog("Last: " + key + " " + value);
      addHtml += "<div class='valueonly celltop'>";
      if (key == "description") {
        // || key == "website" // Most of these in feed=epd lack images, and there are 5 per listing (50 total with 10 rows)
        let urlPattern = /http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/;
        let match = value.match(urlPattern);
        let postText = value;
        if (match) {
          postText = value.replace(match[0], '');
        } 
        addHtml += postText;
        if (match) {
          fetchedPreviewCount++;
          let divID = "fetchedPreview-" + Date.now() + "-" + fetchedPreviewCount;
          addHtml += "<div id='" + divID + "' style='max-width:500px'><a href='" + match[0] + "'>" + match[0] + "</a></div>\n"; // If content is not fetched, the first URL found is shown.
          getSitePreview(match[0], divID);
        }
      } else {
        addHtml += value;
      }
      addHtml += "</div>\n"; // close div containing value
  }
  //addHtml += "</div>\n";

  // Avoid, place on .objectcell instead
  //addHtml += "<div style='margin-top:5px;border-bottom:#ccc solid 1px;'></div>" // Last one hidden by css in base.css
  return addHtml;
}
isObject = function(a) {
    return (!!a) && (a.constructor === Object);
};
function isArray(obj){
  //return !!obj && obj.constructor === Array;
  //return Array.isArray(obj);
  //if (obj.toString.indexOf("[") != 0) {
  if (typeof obj == "string") {
    //return false; // no effect
  }
  //return $.isArray(obj);
  return Array.isArray(obj);
}
Object.size = function(obj) {
    return Object.keys(obj).length;
}
function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

addEventListener("load", function(){
  var getParentAnchor = function (element) {
    while (element !== null && element.tagName !== undefined) {
      if (element.tagName.toUpperCase() === "A") {
        return element;
      }
      element = element.parentNode;
    }
    return null;
  };
  document.querySelector("body").addEventListener('click', function(e) {
    $(".hideOnBodyClick").hide();
    var anchor = getParentAnchor(e.target);
    if(anchor !== null) {
      //$('#log_display').hide();
      if (document.getElementById("log_display")) {
        if (document.getElementById("log_display").length >= 0) {
          document.getElementById("log_display").style.display = 'none';
        }
      }
    }
  }, false);
});

function objectsMatch(object1, object2) {
    // Function to filter out keys with null or blank values and sort the keys
    function filterAndSortKeys(obj) {
        const filtered = Object.fromEntries(Object.entries(obj).filter(([k, v]) => v !== null && v !== ''));
        return Object.fromEntries(Object.entries(filtered).sort());
    }

    // Filter the keys in both objects
    const filteredObject1 = filterAndSortKeys(object1);
    const filteredObject2 = filterAndSortKeys(object2);

    if (JSON.stringify(filteredObject1) === JSON.stringify(filteredObject2)) {
      //alert("objects Match\r\r" + JSON.stringify(filteredObject1) + "\r\robject2:\r\r" + JSON.stringify(filteredObject2));
    } else {
      //alert("Objects Don't Match\r\r" + JSON.stringify(filteredObject1) + "\r\robject2:\r\r" + JSON.stringify(filteredObject2));
    }
    
    // Compare the filtered objects
    return JSON.stringify(filteredObject1) === JSON.stringify(filteredObject2);
}

// USES CORS PROXY
function getSitePreview(url, divID) {
    let proxyUrl = 'https://cors-anywhere.herokuapp.com/' + url; // Replace with your CORS proxy URL
    $.ajax({
        url: proxyUrl,
        type: 'GET',
        dataType: 'html',
        success: function(data) {
            var doc = new DOMParser().parseFromString(data, 'text/html');
            var titleElement = doc.querySelector('title');
            var title = titleElement ? titleElement.textContent : 'No title found';
            
            var imageElement = doc.querySelector('meta[property="og:image"]');
            var image = imageElement ? imageElement.getAttribute('content') : '';

            var descriptionElement = doc.querySelector('meta[name="description"]');
            var description = descriptionElement ? descriptionElement.getAttribute('content') : '<a href="' + url + '"">' + url + '</a>'; // URL can be added here

            var html = '<div>';
            html += '<h3>' + title + '</h3>';
            html += '<p>' + description + '</p>';
            if (image) {
                html += '<img src="' + image + '" style="width:100%">';
            }
            html += '</div>';
            
            $('#' + divID).html(html);
        },
        error: function(xhr, status, error) {
            console.error('Error fetching link preview:', error);
        }
    });
}
function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}


function formatCell(input, format) {
    //alert("format: " + format)
    // Debug: log the input value
    if (Math.abs(input) < 1e-10 && input !== 0) {
        console.log('formatCell received very small value:', input, 'type:', typeof input);
    }
    
    // If format is none or blank, return input as it is.
    if (format === 'none' || format === '') {
        return input;
    }

    // Format as scientific notation
    if (format === 'scientific') {
        return input.toExponential(1);
    }

    // Format as full number with all decimal places
    if (format === 'full') {
        if (Math.abs(input) < 1e-6) {
            return input.toFixed(20).replace(/0+$/, '').replace(/\.$/, '');
        } else {
            return input.toString();
        }
    }

    // Format as easy - explicit check to ensure this path is taken
    if (format === 'easy') {
        // Use the same logic as the default format but ensure it's explicitly called
        // (This will fall through to the default format logic below)
    }

    // Handle positive values
    if (input >= 1e12) {
        return (input / 1e12).toFixed(3) + ' Trillion';
    } else if (input >= 1e9) {
        return (input / 1e9).toFixed(1) + ' Billion';
    } else if (input >= 1e6) {
        return (input / 1e6).toFixed(1) + ' Million';
    } else if (input >= 1000) {
        return (input / 1000).toFixed(1) + ' K';
    } else if (input >= 1) {
        // Round to one decimal. Remove .0
        return input.toFixed(1).replace(/\.0$/, '');
    } else if (input > 0) {
        // Small positive values - for very small numbers, use named suffixes
        if (input <= 1e-33) { // decillionth or less
            return (input / 1e-33).toFixed(3) + ' Decillionth';
        } else if (input <= 1e-30) { // nonillionth or less
            return (input / 1e-30).toFixed(3) + ' Nonillionth';
        } else if (input <= 1e-27) { // octillionth or less
            return (input / 1e-27).toFixed(3) + ' Octillionth';
        } else if (input <= 1e-24) { // septillionth or less
            return (input / 1e-24).toFixed(3) + ' Septillionth';
        } else if (input <= 1e-21) { // sextillionth or less
            return (input / 1e-21).toFixed(3) + ' Sextillionth';
        } else if (input <= 1e-18) { // quintillionth or less
            return (input / 1e-18).toFixed(3) + ' Quintillionth';
        } else if (input <= 1e-15) { // quadrillionth or less
            return (input / 1e-15).toFixed(3) + ' Quadrillionth';
        } else if (input <= 1e-12) { // trillionth or less
            return (input / 1e-12).toFixed(3) + ' Trillionth';
        } else if (input <= 1e-9) { // billionth or less
            return (input / 1e-9).toFixed(3) + ' Billionth';
        } else if (input <= 1e-6) { // millionth or less
            return (input / 1e-6).toFixed(3) + ' Millionth';
        }
        // Show up to 15 decimal places, removing trailing zeros
        let formatted = input.toFixed(15).replace(/0+$/, '').replace(/\.$/, '');
        console.log('Small positive formatting:', input, '->', formatted);
        return formatted === '' ? '0' : formatted;
    } else if (input === 0) {
        return '0';
    }
    // Handle negative values
    else if (input <= -1e12) {
        return (input / 1e12).toFixed(3) + ' Trillion';
    } else if (input <= -1e9) {
        return (input / 1e9).toFixed(1) + ' Billion';
    } else if (input <= -1e6) {
        return (input / 1e6).toFixed(1) + ' Million';
    } else if (input <= -1000) {
        return (input / 1e3).toFixed(1) + ' K';
    } else if (input <= -1) {
        // Round to one decimal. Remove .0
        return input.toFixed(1).replace(/\.0$/, '');
    } else if (input < 0) {
        // Small negative values - for very small numbers, use named suffixes
        if (input <= -1e-33) { // decillionth or less
            return (input / 1e-33).toFixed(3) + ' Decillionth';
        } else if (input <= -1e-30) { // nonillionth or less
            return (input / 1e-30).toFixed(3) + ' Nonillionth';
        } else if (input <= -1e-27) { // octillionth or less
            return (input / 1e-27).toFixed(3) + ' Octillionth';
        } else if (input <= -1e-24) { // septillionth or less
            return (input / 1e-24).toFixed(3) + ' Septillionth';
        } else if (input <= -1e-21) { // sextillionth or less
            return (input / 1e-21).toFixed(3) + ' Sextillionth';
        } else if (input <= -1e-18) { // quintillionth or less
            return (input / 1e-18).toFixed(3) + ' Quintillionth';
        } else if (input <= -1e-15) { // quadrillionth or less
            return (input / 1e-15).toFixed(3) + ' Quadrillionth';
        } else if (input <= -1e-12) { // trillionth or less
            return (input / 1e-12).toFixed(3) + ' Trillionth';
        } else if (input <= -1e-9) { // billionth or less
            return (input / 1e-9).toFixed(3) + ' Billionth';
        } else if (input <= -1e-6) { // millionth or less
            return (input / 1e-6).toFixed(3) + ' Millionth';
        }
        // Show up to 15 decimal places, removing trailing zeros
        let formatted = input.toFixed(15).replace(/0+$/, '').replace(/\.$/, '');
        console.log('Small negative formatting:', input, '->', formatted);
        return formatted === '' || formatted === '-' ? '0' : formatted;
    } else {
        // Fallback for any edge cases
        return input.toExponential(1);
    }
}

// Test cases
//console.log(formatCell(42262000000, 'easy')); // Output: "42.3 Billion"
//console.log(formatCell(9500000, 'easy'));     // Output: "9.5 Million"
//console.log(formatCell(50000, 'easy'));       // Output: "50.0 K"
//console.log(formatCell(99.99, 'easy') + " - BUG, let's avoid adding .0 when rounding");        // Output: "100.0" - 
//console.log(formatCell(0.0005, 'easy'));      // Output: "5.0e-4"
// console.log(formatCell(45000000, 'scientific')); // Output: "4.5e+7"

function formatCellX(input, format) {
    // If format is none or blank, return input as it is.
    if (format === 'none' || format === '' || input === '') {
        return ''
    }
    input = parseFloat(input); // Convert input to a number
    // Format as scientific notation
    if (format === 'scientific') {
        return input.toExponential(1);
    }

    // Format as easy
    if (input >= 1e12) {
        // Round to billions
        return (input / 1e12).toFixed(3) + ' Trillion';
    } else if (input >= 1e9) {
        // Round to billions
        return (input / 1e9).toFixed(1) + ' Billion';
    } else if (input >= 1e6) {
        // Round to millions
        return (input / 1e6).toFixed(1) + ' Million';
    } else if (input >= 1000) {
        // Round to thousands
        return (input / 1000).toFixed(1) + ' K';
    } else if (input >= 1) {
        // Round to one decimal. Remove .0
        //console.log("input:" + input + "-")
        return input.toFixed(1).replace(/\.0$/, '');
    } else if (input > 0) {
        // Small positive values - for very small numbers, use named suffixes
        if (input <= 1e-33) { // decillionth or less
            return (input / 1e-33).toFixed(3) + ' Decillionth';
        } else if (input <= 1e-30) { // nonillionth or less
            return (input / 1e-30).toFixed(3) + ' Nonillionth';
        } else if (input <= 1e-27) { // octillionth or less
            return (input / 1e-27).toFixed(3) + ' Octillionth';
        } else if (input <= 1e-24) { // septillionth or less
            return (input / 1e-24).toFixed(3) + ' Septillionth';
        } else if (input <= 1e-21) { // sextillionth or less
            return (input / 1e-21).toFixed(3) + ' Sextillionth';
        } else if (input <= 1e-18) { // quintillionth or less
            return (input / 1e-18).toFixed(3) + ' Quintillionth';
        } else if (input <= 1e-15) { // quadrillionth or less
            return (input / 1e-15).toFixed(3) + ' Quadrillionth';
        } else if (input <= 1e-12) { // trillionth or less
            return (input / 1e-12).toFixed(3) + ' Trillionth';
        } else if (input <= 1e-9) { // billionth or less
            return (input / 1e-9).toFixed(3) + ' Billionth';
        } else if (input <= 1e-6) { // millionth or less
            return (input / 1e-6).toFixed(3) + ' Millionth';
        }
        // Show up to 15 decimal places, removing trailing zeros
        let formatted = input.toFixed(15).replace(/0+$/, '').replace(/\.$/, '');
        return formatted === '' ? '0' : formatted;
    } else if (input === 0) {
        return '0';
    } else if (input <= -1e12) {
        return (input / 1e12).toFixed(3) + ' Trillion';
    } else if (input <= -1e9) {
        return (input / 1e9).toFixed(1) + ' Billion';
    } else if (input <= -1e6) {
        return (input / 1e6).toFixed(1) + ' Million';
    } else if (input <= -1000) {
        return (input / 1e3).toFixed(1) + ' K';
    } else if (input <= -1) {
        // Round to one decimal. Remove .0
        return input.toFixed(1).replace(/\.0$/, '');
    } else if (input < 0) {
        // Small negative values - for very small numbers, use named suffixes
        if (input <= -1e-33) { // decillionth or less
            return (input / 1e-33).toFixed(3) + ' Decillionth';
        } else if (input <= -1e-30) { // nonillionth or less
            return (input / 1e-30).toFixed(3) + ' Nonillionth';
        } else if (input <= -1e-27) { // octillionth or less
            return (input / 1e-27).toFixed(3) + ' Octillionth';
        } else if (input <= -1e-24) { // septillionth or less
            return (input / 1e-24).toFixed(3) + ' Septillionth';
        } else if (input <= -1e-21) { // sextillionth or less
            return (input / 1e-21).toFixed(3) + ' Sextillionth';
        } else if (input <= -1e-18) { // quintillionth or less
            return (input / 1e-18).toFixed(3) + ' Quintillionth';
        } else if (input <= -1e-15) { // quadrillionth or less
            return (input / 1e-15).toFixed(3) + ' Quadrillionth';
        } else if (input <= -1e-12) { // trillionth or less
            return (input / 1e-12).toFixed(3) + ' Trillionth';
        } else if (input <= -1e-9) { // billionth or less
            return (input / 1e-9).toFixed(3) + ' Billionth';
        } else if (input <= -1e-6) { // millionth or less
            return (input / 1e-6).toFixed(3) + ' Millionth';
        }
        // Show up to 15 decimal places, removing trailing zeros
        let formatted = input.toFixed(15).replace(/0+$/, '').replace(/\.$/, '');
        return formatted === '' || formatted === '-' ? '0' : formatted;
    } else {
        // Fallback for any edge cases
        return input.toExponential(1);
    }
}

// AnythingLLM left side navigation header adjustment
// Monitors header visibility and adjusts top positioning while keeping content within flexMain
function adjustAnythingLLMNavigation() {
  if (!document.getElementById('root') || !document.getElementById('root').classList.contains('h-screen')) {
    return; // Only apply to AnythingLLM instances
  }
  
  const root = document.getElementById('root');
  const headerbar = document.getElementById('headerbar');
  const localHeader = document.getElementById('local-header');
  
  function updateHeaderState() {
    const isHeaderbarVisible = headerbar && !headerbar.classList.contains('headerbarhide') && headerbar.style.display !== 'none';
    const isLocalHeaderVisible = localHeader && localHeader.style.display !== 'none';
    const hasDoubleHeader = isHeaderbarVisible && isLocalHeaderVisible;
    
    // Add body class for CSS targeting
    if (hasDoubleHeader) {
      document.body.classList.add('double-header');
    } else {
      document.body.classList.remove('double-header');
    }
    
    // Apply top offset to the entire sidebar container, not just the inner parts
    const sidebarContainer = root.querySelector('div[style*="width: 292px"], div[style*="width:292px"]'); // AnythingLLM sidebar outer container
    
    if (sidebarContainer) {
      // Ensure the sidebar container has proper positioning
      sidebarContainer.style.position = 'relative';
      sidebarContainer.style.zIndex = '10';
      
      if (hasDoubleHeader) {
        // Double header: offset entire sidebar by ~140px on desktop, ~128px on mobile  
        const offset = window.innerWidth <= 600 ? '128px' : '140px';
        sidebarContainer.style.paddingTop = offset;
      } else {
        // Single header: offset entire sidebar by ~80px on desktop, ~64px on mobile
        const offset = window.innerWidth <= 600 ? '64px' : '80px';
        sidebarContainer.style.paddingTop = offset;
      }
    }
    
    // Reset any padding from root to keep main content in normal position
    root.style.paddingTop = '';
    root.style.marginTop = '';
  }
  
  // Initial check
  updateHeaderState();
  
  // Monitor header changes
  if (headerbar) {
    const observer = new MutationObserver(updateHeaderState);
    observer.observe(headerbar, { 
      attributes: true, 
      attributeFilter: ['class', 'style'] 
    });
  }
  
  // Monitor scroll events that might affect header visibility
  window.addEventListener('scroll', updateHeaderState);
  
  // Monitor window resize for responsive offset adjustments
  window.addEventListener('resize', updateHeaderState);
}

// Initialize AnythingLLM navigation adjustments when DOM is ready
document.addEventListener('DOMContentLoaded', adjustAnythingLLMNavigation);

// Auth Modal Integration - lazy load and show modal
function showAuthModal() {
  if (typeof window.authModal !== 'undefined' && window.authModal) {
    window.authModal.show();
  } else {
    // Lazy load the auth modal script
    const authModalPath = local_app.localsite_root() + '../team/js/auth-modal.js';
    loadScript(authModalPath, function() {
      // Modal initializes immediately when script loads, so show it
      if (window.authModal) {
        window.authModal.show();
      }
    });
  }
}

consoleLog("end localsite");
