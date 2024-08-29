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
let onlineApp = true;
let localsiteTitle = "Localsite";
let defaultState = "";
if (location.host.indexOf('localhost') >= 0) {
  // Set onlineApp to false during air travel. Also sets local to no state.
  // Requires community-data locally
  //onlineApp = false; // During airplane mode
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
              theroot = "";
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
    pairs.forEach(function(pair) {
      // Split the pair on "=" to get key and value
      var keyValue = pair.split('=');
      var key = keyValue[0];
      var value = keyValue.slice(1).join('=');

      // Replace "%26" with "&" in the value
      value = value.replace(/%26/g, '&');

      // Set the key-value pair in the result object
      result[key] = value;
    });
    return result;
  })(window.location.hash.substr(1).split('&'));
}
function updateHash(addToHash, addToExisting, removeFromHash) { // Avoids triggering hash change event. Also called by goHash, which does trigger hash change event.
    let hash = {}; // Limited to this function
    if (addToExisting != false) {
      hash = getHashOnly(); // Include all existing. Excludes hiddenhash.
    }
    console.log(addToHash)
    const newObj = {}; // For removal of blank keys in addToHash
    Object.entries(addToHash).forEach(([k, v]) => {
      if (v === Object(v)) {
        newObj[k] = removeEmpty(v);
        delete hash[k];
        delete hiddenhash[k];
      } else if (v != null) {
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

    var hashString = decodeURIComponent($.param(hash)); // decode to display commas in URL
    var pathname = window.location.pathname.replace(/\/\//g, '\/')
    var queryString = "";
    if (window.location.search) { // Existing, for parameters that are retained as hash changes.
      queryString += window.location.search; // Contains question mark (?)
    }
    if (hashString) { // Remove the hash here if adding to other 
      queryString += "#" + hashString;
    }
    let searchTitle = 'Page ' + hashString;
    window.history.pushState("", searchTitle, pathname + queryString);
}
function goHash(addToHash,removeFromHash) {
  consoleLog("goHash ")
  console.log(addToHash)
  updateHash(addToHash,true,removeFromHash); // true = Include all of existing hash
  triggerHashChangeEvent();
}
function go(addToHash) {
  consoleLog("go ")
  updateHash(addToHash,false); // Drop existing
  triggerHashChangeEvent();
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

  //alert(urlID)
  if (loadFile && !document.getElementById(urlID)) { // Prevents multiple loads.
      consoleLog("loadScript seeking " + url + " via urlID: " + urlID);
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      script.id = urlID; // Prevents multiple loads.

      //$(document).ready(function () { // Only needed if appending to body
       var head = document.getElementsByTagName('head')[0];
       head.appendChild(script);
      //});

      // NOT NEEDED, this did not yet resolve function not being found in navigation.js
      /*
      let cleanUrlID = urlID.replace(/^\/+|\/+$/g, '').replace(/\//g, '-').replace(/\./g, '-'); // Remove / and . and beginning and ending slashes;
      var script2 = document.createElement('script');
      script2.type = 'text/javascript';
      script2.src = ""; // Later we might try changing the id of existing scripts instead (to remove slashes).
      script2.id = cleanUrlID + "-inserted";
      head.appendChild(script2);
      */

      // Bind the event to the callback function. Two events for cross browser compatibility.
      ////script.onreadystatechange = callback; // This apparently is never called by Brave, but needed for some of the other browsers.
      //script.onreadystatechange = function() { // Cound eliminate these 3 lines and switch back to the line above.
      //  consoleLog("loadScript ready: " + url); // This apparently is never called by Brave.
      //  callback();
      //}
      //script.onload = callback;
      script.onload = function() {
        //waitForElm(cleanUrlID).then((elm) => { // Since script.onload does not validate script is actually active in the DOM.
          consoleLog("loadScript loaded: " + url); // Once the entire file is processed.
          callback();
        //});
      }

        
  } else {
    consoleLog("loadScript script already available: " + url + " via ID: " + urlID);
    if(callback) callback();
  }
  // Nested calls are described here: https://books.google.com/books?id=ZOtVCgAAQBAJ&pg=PA6&lpg=PA6
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

var theroot = get_localsite_root(); // Avoid using let instead of var, or error: Identifier 'theroot' has already been declared.
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
  //var dsconsole = document.getElementById("log_display textarea");
  //let dsconsole = document.getElementById("log_display > textarea");
  let dsconsole = document.getElementById("logText");

  if (dsconsole) { // Once in DOM
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
    //dsconsole.scrollTop(dsconsole[0].scrollHeight - dsconsole.height() - 17); // Adjusts for bottom alignment
    dsconsole.scrollTo({ top: dsconsole.scrollHeight, behavior: 'smooth'});

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

    //$(datascapeFileDiv).load(datascapeFile, function( response, status, xhr ) { // This overwrote navcolumn and listcolumn
    $.get(datascapeFile, function(theTemplate) { // Get and append template-main.html to #datascape
      //$(theTemplate).find("#insertedText").appendTo(datascapeFileDiv);
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
      waitForElm('#filterClickLocation').then((elm) => {
        if (param.showstates != "false") {
            $("#filterClickLocation").show();
        }
        $("#mapFilters").prependTo("#fullcolumn");
        // Move back up to top. Used when header.html loads search-filters later (when clicking search icon)
        $("#local-header").prependTo("#fullcolumn");
        $("#headerbar").prependTo("#fullcolumn");
      });
      //waitForElm('#local-header').then((elm) => {
      //  $("#local-header").prependTo("#fullcolumn"); // Move back up to top. Used when header.html loads search-filters later (when clicking search icon)
      //});

      waitForElm('#fullcolumn').then((elm) => {
        $("#headerbar").prependTo("#fullcolumn"); // Move back up to top.
        //$("#bodyMainHolder").prependTo("#fullcolumn"); // Move back up to top.
        $("#sideTabs").prependTo("#fullcolumn"); // Move back up to top.

        // Replace paths in div

        if(location.host.indexOf("desktop") >= 0) {
          waitForElm('#desktop-nav').then((elm) => {
            $("#desktop-nav a").each(function() {
              $(this).attr('href', $(this).attr('href').replace(/\/desktop\//g,"\/"));
            });
          });
        }
        if(location.host.indexOf("dreamstudio") >= 0) {
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
    waitForElm('#navcolumn').then((elm) => {
      $("#navcolumn").addClass("pagecolumnLower");
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
        // Puts space above flexmain for navcolumn to be visible after header
        $("body").prepend("<div id='local-header' class='flexheader noprint' style='display:none'></div>\r");
        waitForElm('#local-header').then((elm) => {
          $("#local-header").prependTo("#fullcolumn"); // Move back up to top. Used when header.html loads search-filters later (when clicking search icon)
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
      $(document).on("click", ".uIn", function(event) {
        var email = $('#input123').val();
        if (isValidEmail(email)) {
          localStorage.email = email;
          if (isValid(email)) {
            Cookies.set('golog', window.location.href);
            window.location = "/explore/menu/login/azure/";
            return;
          } else {
            window.location = "/";
          }
        } else {
          alert("email required"); // TO DO: Display in browser
          $("#input123").focus();
        }
      });
      function isValidEmail(email) {
          var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
      }
      function isValid(email) { // loc a
          var vDom=['Z2VvcmdpYS5vcmc=', 'Z2FhcnRzLm9yZw==']; var eDom=email.split('@')[1]; for (var i = 0; i < vDom.length; i++) {if (eDom === atob(vDom[i])) {return true;}} return false;
      }

      // Load when body div becomes available, faster than waiting for all DOM .js files to load.
      waitForElm('#bodyloaded').then((elm) => {
       consoleLog("#bodyloaded becomes available");
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
          $("#" + param.insertafter).append("<div id='datascape'></div>");
        } else if(document.getElementById("datascape") == null) {
          $('body').prepend("<div id='datascape'></div>");
        }

        if(param.showheader == "true") {
          // border:1px solid #555;
          // sideIconsLower
          $('body').prepend("<div id='sideIcons' class='noprint bothSideIcons' style='position:fixed;left:0;width:32px'><div id='showNavColumn' class='showNavColumn' style='left:-28px;display:none'><i class='material-icons show-on-load' style='font-size:35px; opacity:1; background:#fcfcfc; color:#333; padding-left:2px; padding-right:2px; border: 1px solid #555; border-radius:8px; min-width: 38px;'>&#xE5D2;</i></div></div>");
        }

        if (param.showheader == "true" || param.showsearch == "true" || param.display == "everything" || param.display == "locfilters" || param.display == "map") {
          //if (param.templatepage != "true") { // Prevents dup header on map/index.html - Correction, this is needed. param.templatepage can probably be removed.
            //if (param.shownav != "true") { // Test for mentors page, will likely revise
              loadLocalTemplate();
            //}
          //}
        }
      

        // LOAD INFO TEMPLATE - Holds input-output widgets
        // View html source: https://model.earth/localsite/info/template-charts.html
        if (!$("#infoFile").length) {
          $('body').append("<div id='infoFile'></div>");
        }
        if (param.display == "everything") {
          let infoFile = theroot + "info/template-charts.html #template-charts"; // Including #template-charts limits to div within page, prevents other includes in page from being loaded.
          //console.log("Before template Loaded infoFile: " + infoFile);
          $("#infoFile").load(infoFile, function( response, status, xhr ) {
            consoleLog("Info Template Loaded: " + infoFile);
            $("#industryFilters").appendTo("#append_industryFilters");
          });
        }

        // Move local-footer to the end of body
        let foundTemplate = false;
        // When the template (map/index.html) becomes available
        waitForElm('#templateLoaded').then((elm) => {
          foundTemplate = true;
          $("#local-footer").appendTo("body");
        });
        if (foundTemplate == false) { // An initial move to the bottom - occurs when the template is not yet available.
          $("#local-footer").appendTo("body");
        }
      }); // End body ready

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
      document.fonts.addEventListener('loadingdone', function(event) {
          console.log("Font loaded: ${font}: ${ document.fonts.check(font)}");
      })

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
        consoleLog("head.appendChild link for font");
        $(document).ready(function () {
          //body.appendChild(link); // Doesn't get appended. Error: body is not defined
        });
      } else {
        consoleLog("link.id " + link.id);
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
      console.log('DEACTIVATED %cloadLeafletAndMapFilters called by showSearchFilter(). Might cause dup', 'color: red; background: yellow; font-size: 14px');
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
      //$("#filterbaroffset").hide();
      ////$("#pageLinksHolder").hide();
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
        /*
        console.log("show #filterFieldsHolder");
        $("#filterFieldsHolder").show();
        $("#filterFieldsHolder").removeClass("filterFieldsHidden");
        //$("#filterbaroffset").show();
        $(".hideWhenPop").show();
        $('html,body').scrollTop(0);
        */
      });
    }
    return;



      // NOT CURRENTLY USED


      //$(".filterFields").hide();
    

      //$(".moduleBackgroundImage").addClass("moduleBackgroundImageDarken"); // Not needed since filters are not over image.
      //$(".siteHeaderImage").addClass("siteHeaderImageDarken"); // Not needed since filters are not over image.

      //$('.topButtons').show(); // Avoid showing bar when no layer.
      $(".layerContent").show(); // For main page, over video.

      //$(".showFilters").hide(); // Avoid hiding because title jumps.
      //$(".hideFilters").show();

      // Coming soon - Select if searching Georgia.org or Georgia.gov
      //$(".searchModuleIconLinks").show();
      $(".hideWhenFilters").hide();

      $(".filterPanelHolder").show();
      //$(".filterPanelWidget").show();
      $("#filterPanel").show(); // Don't use "normal", causes overflow:hidden.
      $(".searchHeader").show();
      $("#panelHolder").show();


      $(".showFiltersClick").hide();
      $(".hideFiltersClick").show();

      // Would remove active from Overview Map
      $(".horizontalButtons .layoutTab").removeClass("active");
      $(".showFiltersButton").addClass("active");

      $(".hideSearch").show();
      //$(".hideFilters").show(); // X not needed since magnifying glass remains visible now.
      //$("#hideSearch").show();
      if ($("#menuHolder").is(':visible')) {
          $('.hideMetaMenu').trigger("click");
      }
      //updateOffsets();

      // Hide because map is displayed, causing overlap.
      // Could be adjusted to reside left of search filters.
      //$(".quickMenu").hide();
  }
}
function closeSideTabs() {
  console.log("closeSideTabs()");
  updateHash({"sidetab":""});
  $("#sideTabs").hide();
  $("body").removeClass("bodyRightMargin");
  if (!$('body').hasClass('bodyLeftMargin')) {
    $('body').removeClass('mobileView');
  }
  $("#closeSideTabs").hide();
  $("#showSideTabs").show();
}
function revealFilters() {
  //console.log("show #filterFieldsHolder");
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
      loadMarkdown(pagePath, divID, target, attempts+1, callback); // Do we need , callback here?
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

      // Append rather than overwrite
      
      loadIntoDiv(pageFolder,divID,html,callback);

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
        console.log("Showdown link update: " + pageFolder + " plus " + currentElement.getAttribute('href'));
      }
      // Check if the link is not a full URL
      else if (!/^http/.test(currentElement.getAttribute("href"))) {
        console.log("ALERT Adjust: " + currentElement.getAttribute('href'));
        // Update the href attribute with the pageFolder
        currentElement.setAttribute("href", pageFolder + currentElement.getAttribute('href'));
        console.log("Showdown link update2: " + pageFolder + " plus " + currentElement.getAttribute('href'));
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
    let globecenter;
    let modelsite;

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
        if (Cookies.get('globecenter')) {
            $("#globecenter").val(Cookies.get('globecenter'));
            globecenter = Cookies.get('globecenter');
        }
        if (Cookies.get('modelsite')) {
            $("#modelsite").val(Cookies.get('modelsite'));
            modelsite = Cookies.get('modelsite');
        }
    }
    if (param["sitelook"]) { // From URL
        sitelook = param["sitelook"]; 
    }
    setSitelook(sitelook);
    setDevmode(devmode);
    setModelsite(modelsite);
    setGlobecenter(globecenter);
    if (localStorage.email) {
      $("#input123").val(localStorage.email);
      $(".uIn").hide();$(".uOut").show();
    } else {
      $(".uOut").hide();$(".uIn").show();
    }
}

function setSitemode(sitemode) {
  // Not copied over from settings.js
}
function setSitelook(siteLook) {
    console.log("setSitelook init: " + sitelook);

    //let root = "/explore/"; // TEMP
    //let root = "/localsite/";
    consoleLog("setSiteLook: " + siteLook);
    
    // Force the brower to reload by changing version number. Avoid on localhost for in-browser editing. If else.
    var forceReload = (location.host.indexOf('localhost') >= 0 ? "" : "?v=3");
    $("body").removeClass("dark");
    if (siteLook == "dark") {
        $('.sitebasemap').val("dark").change();
        //toggleVideo("show","nochange");
        $("body").addClass("dark");
        //removeElement('/localsite/css/light.css');
        includeCSS3('/localsite/css/bootstrap.darkly.min.css');
        $("#css-site-dark-css").removeAttr('disabled');
        $("#css-site-green-css").attr("disabled", "disabled");
        $("#css-site-plain-css").attr("disabled", "disabled");
        $('.searchTextHolder').append($('.searchTextMove'));
    } else if (siteLook == "gc") {
        $('.sitebasemap').val("osm").change();
        //toggleVideo("hide","pauseVideo");
        //includeCSS3(root + 'css/site-green.css' + forceReload);
        $("#css-site-green-css").removeAttr('disabled');
        $("#css-site-dark-css").attr("disabled", "disabled");
        $("#css-site-plain-css").attr("disabled", "disabled");
        $('.searchTextHolder').append($('.searchTextMove'));
    } else if (siteLook == "default") {
        //removeElement('/localsite/css/light.css');
        removeElement('/localsite/css/bootstrap.darkly.min.css');
        $("#css-site-green-css").removeAttr('disabled');
        $("#css-site-dark-css").attr("disabled", "disabled");
        $("#css-site-plain-css").attr("disabled", "disabled");
        //$('.searchTextHolder').append($('.searchTextMove'));
    } else { // Light
        //includeCSS3(root + 'css/light.css'); // + forceReload
        removeElement('/localsite/css/bootstrap.darkly.min.css');
        //removeElement(root + 'css/site-dark.css');

        $('.sitebasemap').val("positron_light_nolabels").change();
        //includeCSS3(root + 'css/site-plain.css' + forceReload);

        /*
        $("#css-site-plain-css").removeAttr('disabled');
        $("#css-site-dark-css").attr("disabled", "disabled");
        $("#css-site-green-css").attr("disabled", "disabled");
        */

        //$(".layoutTabHolder").show();
    }
    //setTimeout(function(){ updateOffsets(); }, 200); // Allows time for css file to load.
    //setTimeout(function(){ updateOffsets(); }, 4000);
}
function setDevmode(devmode) {
  if (devmode == "dev") {
    includeCSS3(local_app.localsite_root() + 'css/dev.css');
  } else {
    removeElement('/localsite/css/dev.css');
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
    // Avoid calling refrehsh here since runs when page loads.
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
consoleLog("end localsite");
