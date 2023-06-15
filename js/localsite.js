// Updates originate in GitHub localsite/js/localsite.js
// To do: dynamically add target _parent to external link when in an iFrame and no existing target.
// To do: If community folder is not parallel, link to model.earth domain.

// Localsite Path Library - A global namespace singleton
// Define a new object if localsite library does not exist yet.
var local_app = local_app || (function(module){
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
            let theroot = location.protocol + '//' + location.host + '/localsite/';

            if (location.host.indexOf("georgia") >= 0) { // For feedback link within embedded map, and ga-layers.json
              // Might need (hopefully not) for https://www.georgia.org/center-of-innovation/energy/smart-mobility - needed occasionally for js/jquery.min.js below, not needed when hitting reload.
              //theroot = "https://map.georgia.org/localsite/";
              
              // This could be breaking top links to Location and Good & Services.
              // But reactivating after smart-mobility page tried to get js/jquery.min.js from geogia.org
              // Re-omitting because js/jquery.min.js still used geogia.org on first load, once. (not 100% sure if old page was cachec)
              //theroot = hostnameAndPort + "/localsite/";
            }
            
            if (hostnameAndPort != window.location.hostname + ((window.location.port) ? ':'+window.location.port :'')) {
              // Omit known hosts of "localsite" repo here.

              //theroot = "https://model.earth/localsite/";
              theroot = hostnameAndPort + "/localsite/";
              consoleLog("myScript.src hostname and port: " + extractHostnameAndPort(myScript.src));
              consoleLog("window.location hostname and port: " + window.location.hostname + ((window.location.port) ? ':'+window.location.port :''));
            }
            if (location.host.indexOf('localhost') >= 0) {
              // For testing embedding without locathost repo in site theroot. Rename your localsite folder.
              // Why don't we reach ".showApps click" when activatied?:
              //theroot = "https://model.earth/localsite/";
              //alert("theroot " + theroot)
            }
            localsite_repo = theroot; // Save to reduce DOM hits
            return (theroot);
        },
        community_data_root : function() { // General US states and eventually some international
            let theroot = location.protocol + '//' + location.host + '/community-data/';
            //if (location.host.indexOf('localhost') < 0) {
              theroot = "https://model.earth/community-data/"; 
            //}
            return (theroot);
        },
        modelearth_root : function() { // General US states and eventually some international
            // These repos will typically reside on github, so no localhost.
            let theroot = "https://model.earth"; // Probably will also remove slash from the ends of others.
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
if(typeof param != 'undefined') { // From settings in HTML page
  hiddenhash = mix(hiddenhash,paramIncludeFile); // Before URL values added. Priority to hiddenhash.
  hiddenhash = mix(param,hiddenhash); // param set in page takes priority over param set on localsite.js URL.
  param = mix(param,loadParams(location.search,location.hash)); // Priority to first, the param values set in page.
} else { // No param object in page, but could be set in localsite.js include.
  hiddenhash = mix(hiddenhash,paramIncludeFile);
  //var param = {}; // Clone paramIncludeFile
  var param = extend(true, loadParams(location.search,location.hash), paramIncludeFile); // Subsequent overrides first giving priority to setting in page over URL. Clone/copy object without entanglement. 
  //param = loadParams(location.search,location.hash); // Includes localsite.js include.
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
  console.log("Get param from " + myScript.src);
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
   //target2 = $.extend(true, {}, target); // Clone/copy object without entanglement
   
   target2 = extend(true, target, incoming); // Clone/copy object without entanglement, subsequent overrides first.
   
   for(var key in incoming) {
     if (incoming.hasOwnProperty(key)) {
        if (incoming[key] === null || incoming[key] === undefined || incoming[key] === '') {
          delete target2[key];
        } else {
          target2[key] = incoming[key];
        }
     }
   }   return target2;
}
function getHash() { // Includes hiddenhash
    return (mix(getHashOnly(),hiddenhash));
}
function getHashOnly() {
    return (function (a) {
      if (a == "") return {};
      var b = {};
      for (var i = 0; i < a.length; ++i) {
          var p = a[i].split('=');
          if (p.length != 2) continue;
          b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
      }
      return b;
    })(window.location.hash.substr(1).split('&'));
}
function updateHash(addToHash, addToExisting, removeFromHash) { // Avoids triggering hash change event.
    let hash = {}; // Limited to this function
    if (addToExisting != false) {
      hash = getHashOnly(); // Include all existing. Excludes hiddenhash.
    }
    hash = mix(addToHash,hash); // Gives priority to addToHash

    if (removeFromHash) {
      if (typeof removeFromHash == "string") {
        removeFromHash = removeFromHash.split(",");
      }
      for(var i = 0; i < removeFromHash.length; i++) {
          delete hash[removeFromHash[i]];
          delete hiddenhash[removeFromHash[i]];
      }
    }
    
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
  consoleLog(addToHash)
  updateHash(addToHash,true,removeFromHash); // true = Include all of existing hash
  triggerHashChangeEvent();
}
function go(addToHash) {
  consoleLog("go ")
  updateHash(addToHash,false); // Drop existing
  triggerHashChangeEvent();
}
// Triggers custom hashChangeEvent in multiple widgets.
// Exception, React widgets use a different process.
var triggerHashChangeEvent = function () {
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
    consoleLog("loadScript seeking: " + url + " via urlID: " + urlID);
    var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      script.id = urlID; // Prevents multiple loads.
      // Bind the event to the callback function. Two events for cross browser compatibility.
      //script.onreadystatechange = callback; // This apparently is never called by Brave, but needed for some of the other browsers.
      script.onreadystatechange = function() { // Cound eliminate these 3 lines and switch back to the line above.
        consoleLog("loadScript ready: " + url); // This apparently is never called by Brave.
            callback();
        }
      //script.onload = callback;
      script.onload = function() {
            consoleLog("loadScript loaded: " + url); // Once the entire file is processed.
            callback();
        } 

        //$(document).ready(function () { // Only needed if appending to body
         var head = document.getElementsByTagName('head')[0];
         head.appendChild(script);
        //});
        
  } else {
    consoleLog("loadScript script already available: " + url + " via ID: " + urlID);
    if(callback) callback();
  }
  // Nested calls are described here: https://books.google.com/books?id=ZOtVCgAAQBAJ&pg=PA6&lpg=PA6
}

var localsite_repo3; // TEMP HERE
/*
function extractHostnameAndPort(url) { // TEMP HERE
    console.log("hostname from: " + url);
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
function get_localsite_root3() { // Also in two other places
//alert("call localsite_repo");
            if (localsite_repo3) { // Intensive, so allows to only run once
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
            console.log("hostnameAndPort: " + hostnameAndPort);
            let theroot = location.protocol + '//' + location.host + '/localsite/';

            if (location.host.indexOf("georgia") >= 0) { // For feedback link within embedded map
              //theroot = "https://map.georgia.org/localsite/";
              theroot = hostnameAndPort + "/localsite/";
            }
            
            if (hostnameAndPort != window.location.hostname + ((window.location.port) ? ':'+window.location.port :'')) {
              // Omit known hosts of "localsite" repo here.

              // This is called on http://localhost/. Is it called when embedding on other domains?
              //theroot = "https://model.earth/localsite/";
              theroot = hostnameAndPort + "/localsite/";
              console.log("theroot: " + theroot);
              consoleLog("window.location hostname and port: " + window.location.hostname + ((window.location.port) ? ':'+window.location.port :''));
            }
            if (location.host.indexOf('localhost') >= 0) {
              // Enable to test embedding without locathost repo in site theroot. Rename your localsite folder.
              //theroot = "https://model.earth/localsite/";
            }
            localsite_repo3 = theroot; // Save to reduce DOM hits
            return (theroot);
}

// Called from header.html files
function toggleFullScreen() {
  if (document.fullscreenElement) { // Already fullscreen
    consoleLog("Already fullscreenElement");
    if (document.exitFullscreen) {
      consoleLog("Attempt to exit fullscreen")
      document.exitFullscreen();
      $('.reduceFromFullscreen').hide();
      $('.expandToFullscreen').show();
      return;
    }
  }
  if ((document.fullScreenElement && document.fullScreenElement !== null) ||    
   (!document.mozFullScreen && !document.webkitIsFullScreen)) {
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
    $('.expandToFullscreen').hide();
    $('.reduceFromFullscreen').show(); 
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
    $('.reduceFromFullscreen').hide();
    $('.expandToFullscreen').show();
  }
}

var theroot = get_localsite_root3(); // BUGBUG if let: Identifier 'theroot' has already been declared.
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
  if (value) {
    console.log(text, value);
  } else {
    console.log(text);
  }

  //var dsconsole = document.getElementById("log_display textarea");
  //let dsconsole = document.getElementById("log_display > textarea");
  let dsconsole = document.getElementById("logText");

  if (dsconsole) { // Once in DOM
    //dsconsole.style.display = 'none'; // hidden
    if (consoleLogHolder.length > 0) { // Called only once to display pre-DOM values
      dsconsole.innerHTML = consoleLogHolder;
      consoleLogHolder = "";
    }
    dsconsole.style.display = 'block';
    if (value) {
      //dsconsole.innerHTML += (text + " " + value + "\n");
      let content = document.createTextNode(text + " " + value + "\n");
      dsconsole.appendChild(content);

    } else {
      //dsconsole.innerHTML += (text + "\n");
      let content = document.createTextNode(text + "\n");
      dsconsole.appendChild(content);
    }
    //dsconsole.scrollTop(dsconsole[0].scrollHeight - dsconsole.height() - 17); // Adjusts for bottom alignment
  } else {

    if (value) {
      consoleLogHolder += (text + " " + value + "\n");
    } else {
      consoleLogHolder += (text + "\n");
    }
  }
}

function loadLocalTemplate() {
  let bodyFile = theroot + "map/index.html #insertedText";
  //alert("Before template Loaded: " + bodyFile);

  let bodyFileDiv = "#bodyFile";
  //bodyFileDiv = "body";

  $(bodyFileDiv).load(bodyFile, function( response, status, xhr ) {
    $("#insertedTextSource").remove(); // For map/index.html. Avoids dup header.

    //$('img').each(function() {
    //  $(this).attr('src', 'https://model.earth' + $(this).attr('src'));
    //});

    let elemDiv = document.createElement('div');
    elemDiv.id = "localsiteDetails";
    elemDiv.style.cssText = "display:none";
    elemDiv.innerHTML = "testing";
    document.body.appendChild(elemDiv);

    console.log("Template Loaded: " + bodyFile);
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
      if(location.host.indexOf("dreamstudio") >= 0) {
        $("#dreamstudio-nav a").each(function() {
          $(this).attr('href', $(this).attr('href').replace(/\/dreamstudio\//g,"\/"));
        });
      }
      showHeaderBar();
    });

    if (location.host.indexOf('model') >= 0) {
      $(".showSearch").show();
      $(".showSearch").removeClass("local");
    }
  });
}
function showHeaderBar() {
  //$('.headerOffset').show(); 
  $('#headerbar').show();
  $('#headerbar').removeClass("headerbarhide");
  $('#local-header').show();
  //alert("showHeaderBar")
}

function loadSearchFilterIncludes() {
  includeCSS3(theroot + 'css/base.css',theroot);
  includeCSS3(theroot + 'css/menu.css',theroot);
  includeCSS3(theroot + 'css/search-filters.css',theroot);
  if (param.preloadmap != "false") {
    includeCSS3(theroot + 'css/map-display.css',theroot);
  }
}
function loadLeafletAndMapFilters() {
  //alert("param.showheader " + param.showheader)
  //if (param.shownav) {
  if (param.showheader != "false") {
    loadScript(theroot + 'js/navigation.js', function(results) {
      waitForElm('body').then((elm) => {
        console.log("body is now available"); // If missing header persists, remove waitForElm('body') here (line above annd closure)
        // Puts space above flexmain for sidecolumn to be visible after header
        $("body").prepend("<div id='local-header' class='flexheader hideprint' style='display:none'></div>\r");
        waitForElm('#local-header').then((elm) => {
          $("#local-header").prependTo("#fullcolumn"); // Move back up to top. Used when header.html loads search-filters later (when clicking search icon)
        
        });
        // Might need to add a check here. Occasional:
        // Uncaught ReferenceError: applyNavigation is not defined

        // if #local-header already exists, abort


        // To Do: wait for div from navigation.js
        //waitForElm('body').then((elm) => {

        //});

        //setTimeout( function() {

        //  console.log("applyNavigation() after 200 ms delay"); // 10 ms returned error on CloudFlare, but fine locally.
          applyNavigation();
        //}, 200 ); // Bugbug - better to wait for a div to be available. Try inserting from within navigation.js before DOM ready.
      });
    });
  }
  loadScript(theroot + 'js/d3.v5.min.js', function(results) { // BUG - change so map-filters.js does not require this on it's load
    includeCSS3(theroot + 'css/leaflet.css',theroot);
    loadScript(theroot + 'js/leaflet.js', function(results) {
      loadScript(theroot + 'js/leaflet.icon-material.js', function(results) { // Could skip when map does not use material icon colors
        loadScript(theroot + 'js/map.js', function(results) {
          // Loads map-filters.js
          loadMapFiltersJS(theroot,1); // Uses local_app library in localsite.js for community_data_root
        });
      });
    });

  });
}
// WAIT FOR JQuery
loadScript(theroot + 'js/jquery.min.js', function(results) {

  var waitForJQuery = setInterval(function () { // Waits for $ within jquery.min.js file to become available.

    if (typeof $ != 'undefined') {

      //Doc ready was here, now further down

      console.log("Ready DOM Loaded (But not template yet). Using theroot: " + theroot)

      $(document).click(function(event) { // Hide open menus in core
        $('.hideOnDocClick').hide();
      });

      // Load when body div becomes available, faster than waiting for all DOM .js files to load.
      waitForElm('body').then((elm) => {
       console.log("body becomes available")
        if(location.host.indexOf('localhost') >= 0 || param["view"] == "local") {
          var div = $("<div />", {
              html: '<style>.local{display:inline !important}.localonly{display:block !important}</style>'
            }).appendTo("body");
        } else {
          // Inject style rule
            var div = $("<div />", {
              html: '<style>.local{display:none}.localonly{display:none}</style>'
            }).appendTo("body");
        }

        // LOAD HTML TEMPLATE - Holds search filters and maps
        // View html source: https://model.earth/localsite/map
        // Consider pulling in HTML before DOM is loaded, then send to page once #bodyFile is available.

       if (param.insertafter && $("#" + param.insertafter).length) {
          $("#" + param.insertafter).append("<div id='bodyFile'></div>");
        //} else if (!$("#bodyFile").length) {
        } else if(document.getElementById("bodyFile") == null) {
          $('body').prepend("<div id='bodyFile'></div>");
        }

        $('body').prepend("<div id='showSide' class='showSide' style='topX:100px;left:-28px;position:absolute'><i class='material-icons show-on-load' style='font-size:35px; opacity:0.4; padding-right:3px; border:1px solid #555; border-radius:8px;'>&#xE5D2;</i></div>");
        waitForElm('#fullcolumn').then((elm) => {
          $("#showSide").prependTo("#fullcolumn"); 
        });

        if (param.showheader == "true" || param.showsearch == "true" || param.display == "everything" || param.display == "locfilters" || param.display == "map") {
          //if (param.templatepage != "true") { // Prevents dup header on map/index.html - Correction, this is needed. param.templatepage can probably be removed.
            //if (param.shownav != "true") { // Test for mentors page, will likely revise
              loadLocalTemplate();
            //}
          //}
        }
      

        // LOAD INFO TEMPLATE - Holds input-output widgets
        // View html source: https://model.earth/localsite/info/info-template.html
        if (!$("#infoFile").length) {
          $('body').append("<div id='infoFile'></div>");
        }
        if (param.display == "everything") {
          let infoFile = theroot + "info/info-template.html #info-template"; // Including #info-template limits to div within page, prevents other includes in page from being loaded.
          //console.log("Before template Loaded infoFile: " + infoFile);
          //alert("Before template Loaded: " + bodyFile);
          $("#infoFile").load(infoFile, function( response, status, xhr ) {
            console.log("Info Template Loaded: " + infoFile);
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
        /*! jQuery & Zepto Lazy v1.7.6 - http://jquery.eisbehr.de/lazy - MIT&GPL-2.0 license - Copyright 2012-2017 Daniel 'Eisbehr' Kern */
        //!function(t,e){"use strict";function r(r,a,i,u,l){function f(){L=t.devicePixelRatio>1,i=c(i),a.delay>=0&&setTimeout(function(){s(!0)},a.delay),(a.delay<0||a.combined)&&(u.e=v(a.throttle,function(t){"resize"===t.type&&(w=B=-1),s(t.all)}),u.a=function(t){t=c(t),i.push.apply(i,t)},u.g=function(){return i=n(i).filter(function(){return!n(this).data(a.loadedName)})},u.f=function(t){for(var e=0;e<t.length;e++){var r=i.filter(function(){return this===t[e]});r.length&&s(!1,r)}},s(),n(a.appendScroll).on("scroll."+l+" resize."+l,u.e))}function c(t){var i=a.defaultImage,o=a.placeholder,u=a.imageBase,l=a.srcsetAttribute,f=a.loaderAttribute,c=a._f||{};t=n(t).filter(function(){var t=n(this),r=m(this);return!t.data(a.handledName)&&(t.attr(a.attribute)||t.attr(l)||t.attr(f)||c[r]!==e)}).data("plugin_"+a.name,r);for(var s=0,d=t.length;s<d;s++){var A=n(t[s]),g=m(t[s]),h=A.attr(a.imageBaseAttribute)||u;g===N&&h&&A.attr(l)&&A.attr(l,b(A.attr(l),h)),c[g]===e||A.attr(f)||A.attr(f,c[g]),g===N&&i&&!A.attr(E)?A.attr(E,i):g===N||!o||A.css(O)&&"none"!==A.css(O)||A.css(O,"url('"+o+"')")}return t}function s(t,e){if(!i.length)return void(a.autoDestroy&&r.destroy());for(var o=e||i,u=!1,l=a.imageBase||"",f=a.srcsetAttribute,c=a.handledName,s=0;s<o.length;s++)if(t||e||A(o[s])){var g=n(o[s]),h=m(o[s]),b=g.attr(a.attribute),v=g.attr(a.imageBaseAttribute)||l,p=g.attr(a.loaderAttribute);g.data(c)||a.visibleOnly&&!g.is(":visible")||!((b||g.attr(f))&&(h===N&&(v+b!==g.attr(E)||g.attr(f)!==g.attr(F))||h!==N&&v+b!==g.css(O))||p)||(u=!0,g.data(c,!0),d(g,h,v,p))}u&&(i=n(i).filter(function(){return!n(this).data(c)}))}function d(t,e,r,i){++z;var o=function(){y("onError",t),p(),o=n.noop};y("beforeLoad",t);var u=a.attribute,l=a.srcsetAttribute,f=a.sizesAttribute,c=a.retinaAttribute,s=a.removeAttribute,d=a.loadedName,A=t.attr(c);if(i){var g=function(){s&&t.removeAttr(a.loaderAttribute),t.data(d,!0),y(T,t),setTimeout(p,1),g=n.noop};t.off(I).one(I,o).one(D,g),y(i,t,function(e){e?(t.off(D),g()):(t.off(I),o())})||t.trigger(I)}else{var h=n(new Image);h.one(I,o).one(D,function(){t.hide(),e===N?t.attr(C,h.attr(C)).attr(F,h.attr(F)).attr(E,h.attr(E)):t.css(O,"url('"+h.attr(E)+"')"),t[a.effect](a.effectTime),s&&(t.removeAttr(u+" "+l+" "+c+" "+a.imageBaseAttribute),f!==C&&t.removeAttr(f)),t.data(d,!0),y(T,t),h.remove(),p()});var m=(L&&A?A:t.attr(u))||"";h.attr(C,t.attr(f)).attr(F,t.attr(l)).attr(E,m?r+m:null),h.complete&&h.trigger(D)}}function A(t){var e=t.getBoundingClientRect(),r=a.scrollDirection,n=a.threshold,i=h()+n>e.top&&-n<e.bottom,o=g()+n>e.left&&-n<e.right;return"vertical"===r?i:"horizontal"===r?o:i&&o}function g(){return w>=0?w:w=n(t).width()}function h(){return B>=0?B:B=n(t).height()}function m(t){return t.tagName.toLowerCase()}function b(t,e){if(e){var r=t.split(",");t="";for(var a=0,n=r.length;a<n;a++)t+=e+r[a].trim()+(a!==n-1?",":"")}return t}function v(t,e){var n,i=0;return function(o,u){function l(){i=+new Date,e.call(r,o)}var f=+new Date-i;n&&clearTimeout(n),f>t||!a.enableThrottle||u?l():n=setTimeout(l,t-f)}}function p(){--z,i.length||z||y("onFinishedAll")}function y(t,e,n){return!!(t=a[t])&&(t.apply(r,[].slice.call(arguments,1)),!0)}var z=0,w=-1,B=-1,L=!1,T="afterLoad",D="load",I="error",N="img",E="src",F="srcset",C="sizes",O="background-image";"event"===a.bind||o?f():n(t).on(D+"."+l,f)}function a(a,o){var u=this,l=n.extend({},u.config,o),f={},c=l.name+"-"+ ++i;return u.config=function(t,r){return r===e?l[t]:(l[t]=r,u)},u.addItems=function(t){return f.a&&f.a("string"===n.type(t)?n(t):t),u},u.getItems=function(){return f.g?f.g():{}},u.update=function(t){return f.e&&f.e({},!t),u},u.force=function(t){return f.f&&f.f("string"===n.type(t)?n(t):t),u},u.loadAll=function(){return f.e&&f.e({all:!0},!0),u},u.destroy=function(){return n(l.appendScroll).off("."+c,f.e),n(t).off("."+c),f={},e},r(u,l,a,f,c),l.chainable?a:u}var n=t.jQuery||t.Zepto,i=0,o=!1;n.fn.Lazy=n.fn.lazy=function(t){return new a(this,t)},n.Lazy=n.lazy=function(t,r,i){if(n.isFunction(r)&&(i=r,r=[]),n.isFunction(i)){t=n.isArray(t)?t:[t],r=n.isArray(r)?r:[r];for(var o=a.prototype.config,u=o._f||(o._f={}),l=0,f=t.length;l<f;l++)(o[t[l]]===e||n.isFunction(o[t[l]]))&&(o[t[l]]=i);for(var c=0,s=r.length;c<s;c++)u[r[c]]=t[0]}},a.prototype.config={name:"lazy",chainable:!0,autoDestroy:!0,bind:"load",threshold:500,visibleOnly:!1,appendScroll:t,scrollDirection:"both",imageBase:null,defaultImage:"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",placeholder:null,delay:-1,combined:!1,attribute:"data-src",srcsetAttribute:"data-srcset",sizesAttribute:"data-sizes",retinaAttribute:"data-retina",loaderAttribute:"data-loader",imageBaseAttribute:"data-imagebase",removeAttribute:!0,handledName:"handled",loadedName:"loaded",effect:"show",effectTime:0,enableThrottle:!0,throttle:250,beforeLoad:e,afterLoad:e,onError:e,onFinishedAll:e},n(t).on("load",function(){o=!0})}(window);
        
        /*! jQuery & Zepto Lazy v1.7.10 - http://jquery.eisbehr.de/lazy - MIT&GPL-2.0 license - Copyright 2012-2018 Daniel 'Eisbehr' Kern */
        !function(t,e){"use strict";function r(r,a,i,u,l){function f(){L=t.devicePixelRatio>1,i=c(i),a.delay>=0&&setTimeout(function(){s(!0)},a.delay),(a.delay<0||a.combined)&&(u.e=v(a.throttle,function(t){"resize"===t.type&&(w=B=-1),s(t.all)}),u.a=function(t){t=c(t),i.push.apply(i,t)},u.g=function(){return i=n(i).filter(function(){return!n(this).data(a.loadedName)})},u.f=function(t){for(var e=0;e<t.length;e++){var r=i.filter(function(){return this===t[e]});r.length&&s(!1,r)}},s(),n(a.appendScroll).on("scroll."+l+" resize."+l,u.e))}function c(t){var i=a.defaultImage,o=a.placeholder,u=a.imageBase,l=a.srcsetAttribute,f=a.loaderAttribute,c=a._f||{};t=n(t).filter(function(){var t=n(this),r=m(this);return!t.data(a.handledName)&&(t.attr(a.attribute)||t.attr(l)||t.attr(f)||c[r]!==e)}).data("plugin_"+a.name,r);for(var s=0,d=t.length;s<d;s++){var A=n(t[s]),g=m(t[s]),h=A.attr(a.imageBaseAttribute)||u;g===N&&h&&A.attr(l)&&A.attr(l,b(A.attr(l),h)),c[g]===e||A.attr(f)||A.attr(f,c[g]),g===N&&i&&!A.attr(E)?A.attr(E,i):g===N||!o||A.css(O)&&"none"!==A.css(O)||A.css(O,"url('"+o+"')")}return t}function s(t,e){if(!i.length)return void(a.autoDestroy&&r.destroy());for(var o=e||i,u=!1,l=a.imageBase||"",f=a.srcsetAttribute,c=a.handledName,s=0;s<o.length;s++)if(t||e||A(o[s])){var g=n(o[s]),h=m(o[s]),b=g.attr(a.attribute),v=g.attr(a.imageBaseAttribute)||l,p=g.attr(a.loaderAttribute);g.data(c)||a.visibleOnly&&!g.is(":visible")||!((b||g.attr(f))&&(h===N&&(v+b!==g.attr(E)||g.attr(f)!==g.attr(F))||h!==N&&v+b!==g.css(O))||p)||(u=!0,g.data(c,!0),d(g,h,v,p))}u&&(i=n(i).filter(function(){return!n(this).data(c)}))}function d(t,e,r,i){++z;var o=function(){y("onError",t),p(),o=n.noop};y("beforeLoad",t);var u=a.attribute,l=a.srcsetAttribute,f=a.sizesAttribute,c=a.retinaAttribute,s=a.removeAttribute,d=a.loadedName,A=t.attr(c);if(i){var g=function(){s&&t.removeAttr(a.loaderAttribute),t.data(d,!0),y(T,t),setTimeout(p,1),g=n.noop};t.off(I).one(I,o).one(D,g),y(i,t,function(e){e?(t.off(D),g()):(t.off(I),o())})||t.trigger(I)}else{var h=n(new Image);h.one(I,o).one(D,function(){t.hide(),e===N?t.attr(C,h.attr(C)).attr(F,h.attr(F)).attr(E,h.attr(E)):t.css(O,"url('"+h.attr(E)+"')"),t[a.effect](a.effectTime),s&&(t.removeAttr(u+" "+l+" "+c+" "+a.imageBaseAttribute),f!==C&&t.removeAttr(f)),t.data(d,!0),y(T,t),h.remove(),p()});var m=(L&&A?A:t.attr(u))||"";h.attr(C,t.attr(f)).attr(F,t.attr(l)).attr(E,m?r+m:null),h.complete&&h.trigger(D)}}function A(t){var e=t.getBoundingClientRect(),r=a.scrollDirection,n=a.threshold,i=h()+n>e.top&&-n<e.bottom,o=g()+n>e.left&&-n<e.right;return"vertical"===r?i:"horizontal"===r?o:i&&o}function g(){return w>=0?w:w=n(t).width()}function h(){return B>=0?B:B=n(t).height()}function m(t){return t.tagName.toLowerCase()}function b(t,e){if(e){var r=t.split(",");t="";for(var a=0,n=r.length;a<n;a++)t+=e+r[a].trim()+(a!==n-1?",":"")}return t}function v(t,e){var n,i=0;return function(o,u){function l(){i=+new Date,e.call(r,o)}var f=+new Date-i;n&&clearTimeout(n),f>t||!a.enableThrottle||u?l():n=setTimeout(l,t-f)}}function p(){--z,i.length||z||y("onFinishedAll")}function y(t,e,n){return!!(t=a[t])&&(t.apply(r,[].slice.call(arguments,1)),!0)}var z=0,w=-1,B=-1,L=!1,T="afterLoad",D="load",I="error",N="img",E="src",F="srcset",C="sizes",O="background-image";"event"===a.bind||o?f():n(t).on(D+"."+l,f)}function a(a,o){var u=this,l=n.extend({},u.config,o),f={},c=l.name+"-"+ ++i;return u.config=function(t,r){return r===e?l[t]:(l[t]=r,u)},u.addItems=function(t){return f.a&&f.a("string"===n.type(t)?n(t):t),u},u.getItems=function(){return f.g?f.g():{}},u.update=function(t){return f.e&&f.e({},!t),u},u.force=function(t){return f.f&&f.f("string"===n.type(t)?n(t):t),u},u.loadAll=function(){return f.e&&f.e({all:!0},!0),u},u.destroy=function(){return n(l.appendScroll).off("."+c,f.e),n(t).off("."+c),f={},e},r(u,l,a,f,c),l.chainable?a:u}var n=t.jQuery||t.Zepto,i=0,o=!1;n.fn.Lazy=n.fn.lazy=function(t){return new a(this,t)},n.Lazy=n.lazy=function(t,r,i){if(n.isFunction(r)&&(i=r,r=[]),n.isFunction(i)){t=n.isArray(t)?t:[t],r=n.isArray(r)?r:[r];for(var o=a.prototype.config,u=o._f||(o._f={}),l=0,f=t.length;l<f;l++)(o[t[l]]===e||n.isFunction(o[t[l]]))&&(o[t[l]]=i);for(var c=0,s=r.length;c<s;c++)u[r[c]]=t[0]}},a.prototype.config={name:"lazy",chainable:!0,autoDestroy:!0,bind:"load",threshold:500,visibleOnly:!1,appendScroll:t,scrollDirection:"both",imageBase:null,defaultImage:"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",placeholder:null,delay:-1,combined:!1,attribute:"data-src",srcsetAttribute:"data-srcset",sizesAttribute:"data-sizes",retinaAttribute:"data-retina",loaderAttribute:"data-loader",imageBaseAttribute:"data-imagebase",removeAttribute:!0,handledName:"handled",loadedName:"loaded",effect:"show",effectTime:0,enableThrottle:!0,throttle:250,beforeLoad:e,afterLoad:e,onError:e,onFinishedAll:e},n(t).on("load",function(){o=!0})}(window);
        $(function() {
              $('.lazy').Lazy(); // Lazy load all divs with class .lazy
        });
      });

      $(window).on('hashchange', function() { // Avoid window.onhashchange since overridden by map and widget embeds  
        consoleLog("window hashchange");
        consoleLog("delete hiddenhash.name");
        delete hiddenhash.name; // Not sure where this is set.
        delete hiddenhash.cat; // Not sure where this is set.
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

      $(document).on("click", ".expandToFullscreen, .reduceFromFullscreen", function(event) {
        toggleFullScreen();  
      });
      $(document).on("click", ".showSearch", function(event) {
          //loadLeafletAndMapFilters();
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
  if (param.showheader == "true" || param.display == "everything" || param.display == "locfilters" || param.display == "navigation" || param.display == "map") {
    //alert("added param.show above as test " + param.show)
    if (param.showheader != "false" || param.display == "map") {

      fullsite = true;
      includeCSS3(theroot + 'css/map.css',theroot); // Before naics.js so #industries can be overwritten.

      // TODO - Try limiting to param.display == "everything"
      includeCSS3(theroot + 'css/naics.css',theroot);
      
      // customD3loaded
      if (param.preloadmap != "false" && (param.showheader == "true" || param.shownav == "true" || param.display == "map")) {
        loadLeafletAndMapFilters();
      }

      //includeCSS3(theroot + 'css/bootstrap.darkly.min.css',theroot);

      if (param.display == "everything") {

        loadScript(theroot + '../io/build/lib/useeio_widgets.js', function(results) {
          if (param.omit_old_naics == "true") {
            loadScript(theroot + 'js/naics2.js', function(results) {
            });
          } else {
            loadScript(theroot + 'js/d3.v5.min.js', function(results) {
              loadScript(theroot + 'js/naics.js', function(results) {
                console.log("everything");
              });
            });
          }
        });
      }

      loadTabulator();
      
      if (param.display == "everything") {
        includeCSS3(theroot + '../io/build/widgets.css',theroot);
        includeCSS3(theroot + '../io/build/iochart.css',theroot);
      }
      
      loadSearchFilterIncludes();

      includeCSS3(theroot + 'css/leaflet.icon-material.css',theroot);
      
      //loadScript(theroot + 'js/table-sort.js', function(results) {}); // For county grid column sort

      /*
      if (param.display == "everything") {
        //if(param.showbubbles) {
          loadScript(theroot + 'js/d3.v5.min.js', function(results) {
            loadScript(theroot + '../io/charts/bubble/js/bubble.js', function(results) { // moved to naics.js instead
              // HACK - call twice so rollovers work.
                //refreshBubbleWidget();
                //alert("go")

                // Instead, called from naics.js
                //displayImpactBubbles(1);
                //setTimeout( function() {
                  
                  // No luck...
                  //displayImpactBubbles(1);
                //}, 1000 );
            });
          });
        //}
      } // end everything
      */

    }
  }

  //} else { // Show map or list without header

  

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
      var link = document.createElement('link'),
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
      link.href = theroot + '../localsite/css/fonts/materialicons/icon.css';
      //link.href = theroot + 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
      link.id = getUrlID3(link.href,"");
      
      // TO DO: Need to check if icon.css already in page.
      head.appendChild(link);
      $(document).ready(function () {
        //body.appendChild(link); // Doesn't get appended
      });
    }();
  }



  } else { // jQuery not available yet!

    if(location.host.indexOf('localhost') >= 0) {
      alert("Localhost alert: JQUERY NOT YET AVAILABLE - JQuery probably needs to be added to calling page.");
    } else {
      console.log('%cALERT: JQUERY NOT YET AVAILABLE! JQuery probably needs to be added to calling page.', 'color: red; background: yellow; font-size: 14px');    
    }
  }
      
}, 10); // End block, could move to end of jQuery loadScript.


}); // End JQuery loadScript


var mycount = 0;
function includeCSS3(url,theroot) {
    let urlID = getUrlID3(url,theroot);
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
  url = "/" + url.replace(/^[a-z]{4,5}\:\/{2}[a-z]{1,}\:[0-9]{1,4}.(.*)/, '$1'); // http or https

  //url = theroot + url;

  // Retain domain if not local. Prevents two external IDs from matching.
  let domain = getDomain(url);
  mycount++;

  let myfeedback = "";
  //if (domain != getDomain(theroot)) {
  if (domain) {
    // No changes to url
    if (100==100) {
      myfeedback = ("Count: " + mycount + "\nurl: " + url + "\nDomain: " + domain + "\ntheroot: " + theroot + "\nDomain of theroot: " + getDomain(theroot));
    }
  } else {
    
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

              url = url.replace("/localsite/../localsite/","/localsite/"); // hack for /localsite/../localsite/css/tabulator.min.css
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

  if (100==100) {
    //alert(myfeedback + "\nResulting urlID: " + urlID);
  }

  //console.log("urlID after adjustment: " + urlID);
  return urlID;
}

function loadMapFiltersJS(theroot, count) {
  if (typeof customD3loaded !== 'undefined' && typeof localsite_map !== 'undefined') {
    //alert("localsite_map " + localsite_map)
    //loadScript(theroot + 'https://cdn.jsdelivr.net/npm/vue', function(results) { // Need to check if function loaded
      loadScript(theroot + 'js/map-filters.js', function(results) {});

      if (document.getElementById("/icon?family=Material+Icons")) {
          $(".show-on-load").removeClass("show-on-load");
      }
    //});
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
          extended[prop] = extend( true, extended[prop], obj[prop] );
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
  // Tabulator
  if (typeof Tabulator === 'undefined') {
    //includeCSS3('https://unpkg.com/tabulator-tables/dist/css/tabulator.min.css',theroot);
    // Also loads tabulator.min.css.map originally from https://unpkg.com/tabulator-tables@5.3.0/dist/css/tabulator.min.css.map
    includeCSS3(theroot + '../localsite/css/tabulator.min.css',theroot);
    includeCSS3(theroot + '../localsite/css/base-tabulator.css',theroot);
    loadScript(theroot + 'js/tabulator.min.js', function(results) {});
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
    console.log("hostname from: " + url);
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
    console.log("extractHostnameAndPort hostname: " + hostname);
    return hostname;
}

// Convert json to html
var selected_array=[];
var omit_array=[];
function formatRow(key,value,level,item) {

  var addHtml = '';
  
  if (key == 'color') {
    // JQuery uses this attribute to set the bar color where class level1 immediately above this div.
    addHtml += "<div class='colorHolder' currentlevel='" + level + "' currentitem='" + item + "' color='" + value + "'></div>"
  }

  if (level==1 && selected_array.length > 0 && !selected_array.includes(key) )  {
    return addHtml;
  }
  if (level==1 && omit_array.length > 0 && omit_array.includes(key) )  {
    return addHtml;
  }

  level = level + 1;
  //if (level==1) { // Span rightcell
  //  level=2;
  //  addHtml += "<div class='hidden titlecell level1' style='width:100%'>" + key + "</div><div style='clear:both' class='hidden level" + level + "'>"
  //} else {
    addHtml += "<div class='hidden titlecell level" + level + "'>" + key + "</div><div class='hidden rightcell level" + level + "'>"
  //}  
  //if (value.length == 0) {
  //    addHtml += "<div class='level" + level + "'>&nbsp;</div>\n";
  //    consoleLog("Blank: " + key + " " + value);
  //} else 
  if (isObject(value)) {
      for (c in value) {

        consoleLog("isObject: " + key + " " + value);
        
        //if (json.data[a].constructor === Array && selected_array.includes(a) )  {
        if (isObject(value[c])) {

          // NEVER REACHED?
          consoleLog("This code is reached for location: " + key + " " + value);
          if (value[c].length > 1){

            for (d in value[c]){  
                
              if (isObject(value[c][d])) {
                //addHtml += "<b>Add something else here</b>\n";
                for (e in value[c][d]){
                  //addHtml += "<div class='level" + level + "'>" + e + ":: " + value[c][d][e] + "</div>\n";
                  addHtml += formatRow(e,"-- " + value[c][d][e],level);
                }
              } else {
                //addHtml += "<div class='level" + level + "'>" + d + "::: " + value[c][d] + "</div>\n";
                addHtml += formatRow(d,"---- " + value[c][d],level);
              }

            }
          }

      } else {
        addHtml += formatRow(c,value[c],level);
          //addHtml += "<div class='level'>" + c + ":::: " + value[c] + "</div>\n";
        }
      }       
     
    
    /*if (Object.keys(value).length >1){
      consoleLog(b);
    }*/

      // value.constructor === Array

  } else if (isArray(value)) { // was b.   && selected_array.includes(key)  seems to prevent overload for DiffBot. Need to identify why.
      //consoleLog(value.length);

      //consoleLog("isArray: " + key + " " + value + " " + value.length);
      console.log(value)
      if (value.length > 0) {

        for (c in value) { // FOR EACH PROJECT
          curLine=""            
          //consoleLog(value[c],b,c); //c is 0,1,2 index
          
          if (isObject(value[c])) {
            addHtml += "<div style='background:#999;color:#fff;padding:4px; clear:both'>" + (+c+1) + "</div>\n";

            for (d in value[c]) { // Projects metatags
              console.log(d)
              console.log(value[c])

              /*
              if (!value[c][d] || typeof value[c][d] == "undefined") {
                  addHtml += formatRow(d,"",level);
                } else if (typeof value[c][d] == "string") {
                  addHtml += formatRow(d,value[c][d],level);
              */
                if (typeof value[c] == "undefined") {
                  addHtml += formatRow(d,"",level);
                } else if (typeof value[c][d] == "string" || typeof value[c][d] == "number") {
                  addHtml += formatRow(d,value[c][d],level);
                } else if (typeof value[c][d] == "object" ) {
                //} else if (isObject(value[c][d]) || isArray(value[c][d])) {
                  if (value[c][d].length > 1) {
                    addHtml += formatRow(d,value[c][d],level); // 2021
                  }
                } else if (typeof value[c][d] != "undefined") {
                  addHtml += formatRow(d, value[c][d],level);
                } else {
                  addHtml += formatRow(d,value[c][d],level);
                  //addHtml += "<div class='level" + level + "'>" + value[c][d] + "</div>\n";
                }


                /*
                if (isObject(value[c][d])) {
                  //addHtml += "<b>Add something else here</b>\n";
                  for (e in value[c][d]) {
                    //if (isObject(value[c][d][e]) || isArray(value[c][d][e])) {
                    //if (e !== null && e !== undefined) { // 
                      
                      // BUGBUG - Uncomment after preventoing error here: http://localhost:8887/community/resources/diffbot/?zip=91945
                      //addHtml += formatRow(e,value[c][d][e],level);

                      //addHtml += "TEST"
                      addHtml += "<div class='level" + level + "'>TEST: " + e + "</div>\n";

                    //}
                    //addHtml += "<div class='level5'>" + e + ": " + value[c][d][e] + "</div>\n";
                  }
                }
                */

            }

          } else if (isArray(value[c])) {
              for (d in value[c]) {
                consoleLog("Found Array: " + value[c][d])
                addHtml += formatRow(d,value[c][d],level);
                //addHtml += "<div class='level4'>" + d + ":: " + value[c][d] + "</div>\n";
              
              }
              // if (value[c].constructor === Array && selected_array.includes(c) )  {
              //  addHtml += "<b>Add loop here</b>\n";
              // }
              // if (isArray(value[c][d])) {
              //  addHtml += "<b>Add something here</b>\n";
              // }
              
            


          /*
          } else if (isArray(value[c])) {
            for (d in value[c]) {
              if (isObject(value[c][d])) {
                //addHtml += "<b>Add something else here</b>\n";
                for (e in value[c][d]){
                  addHtml += formatRow(e,value[c][d][e],level);
                  //addHtml += "<div class='level5'>" + e + ": " + value[c][d][e] + "</div>\n";
                }
              } else {
                //consoleLog("Found: " + value[c][d]); // Returns error since not object
                consoleLog("Found: " + d);
                //addHtml += formatRow(d,d,level); // BUG
                addHtml += "<div class='level4'>" + d + "</div>\n";
              }

              //addHtml += "<div class='level" + level + "'>" + value[c] + "</div>\n";
            }
            */
          } else {
              // For much of first level single names.
              addHtml += "<div class='level" + level + "'>" + value[c] + "</div>\n";
          }
        }    
                        
        
          
    } else {
      consoleLog("Array of 0: " + key + " " + value);
      //addHtml += formatRow(c,value[c],level);
      addHtml += "<div class='level" + level + "'>" + value + "&nbsp;</div>\n";
    }
  } else if (key == "url" || key == "hdurl") { // hdurl from NASA
      addHtml += "<a href='" + value + "'>" + value + "</a>"
  } else if (key.indexOf("Uri")>=0 && value) {
      uriLink = (value.indexOf("http")==0) ? value : "https://" + value; // Brittle
      addHtml += "<a href='" + uriLink + "'>" + value + "</a>"
  } else if (key == "logo") {
      addHtml += "<img src='" + value + "' class='rightlogo'><br>"
    } else if (key.toLowerCase().includes("timestamp")) {
      addHtml += "<div class='level" + level + "'>" +  new Date(value) + "</div>\n";
  } else {
      //consoleLog("Last: " + key + " " + value);
      addHtml += "<div class='level" + level + "'>" + value + "</div>\n";
  }
  addHtml += "</div>\n";

    //result.innerHTML = result.innerHTML + addHtml;

  addHtml += "<div style='border-bottom:#ccc solid 1px; clear:both'></div>" // Last one hidden by css in base.css

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

    $("#hideMenu").hide(); // Avoids double clicking.
    $("#showSideTabs").show();

    //consoleLog('click ' + Date.now())
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



String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};
function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

function getState(stateCode) {
  switch (stateCode)
  {
      case "AL":
          return "Alabama";

      case "AK":
          return "Alaska";

      case "AS":
          return "American Samoa";

      case "AZ":
          return "Arizona";

      case "AR":
          return "Arkansas";

      case "CA":
          return "California";

      case "CO":
          return "Colorado";

      case "CT":
          return "Connecticut";

      case "DE":
          return "Delaware";

      case "DC":
          return "District Of Columbia";

      case "FM":
          return "Federated States Of Micronesia";

      case "FL":
          return "Florida";

      case "GA":
          return "Georgia";

      case "GU":
          return "Guam";

      case "HI":
          return "Hawaii";

      case "ID":
          return "Idaho";

      case "IL":
          return "Illinois";

      case "IN":
          return "Indiana";

      case "IA":
          return "Iowa";

      case "KS":
          return "Kansas";

      case "KY":
          return "Kentucky";

      case "LA":
          return "Louisiana";

      case "ME":
          return "Maine";

      case "MH":
          return "Marshall Islands";

      case "MD":
          return "Maryland";

      case "MA":
          return "Massachusetts";

      case "MI":
          return "Michigan";

      case "MN":
          return "Minnesota";

      case "MS":
          return "Mississippi";

      case "MO":
          return "Missouri";

      case "MT":
          return "Montana";

      case "NE":
          return "Nebraska";

      case "NV":
          return "Nevada";

      case "NH":
          return "New Hampshire";

      case "NJ":
          return "New Jersey";

      case "NM":
          return "New Mexico";

      case "NY":
          return "New York";

      case "NC":
          return "North Carolina";

      case "ND":
          return "North Dakota";

      case "MP":
          return "Northern Mariana Islands";

      case "OH":
          return "Ohio";

      case "OK":
          return "Oklahoma";

      case "OR":
          return "Oregon";

      case "PW":
          return "Palau";

      case "PA":
          return "Pennsylvania";

      case "PR":
          return "Puerto Rico";

      case "RI":
          return "Rhode Island";

      case "SC":
          return "South Carolina";

      case "SD":
          return "South Dakota";

      case "TN":
          return "Tennessee";

      case "TX":
          return "Texas";

      case "UT":
          return "Utah";

      case "VT":
          return "Vermont";

      case "VI":
          return "Virgin Islands";

      case "VA":
          return "Virginia";

      case "WA":
          return "Washington";

      case "WV":
          return "West Virginia";

      case "WI":
          return "Wisconsin";

      case "WY":
          return "Wyoming";
  }
}


function showSearchFilter() {
  let loadFilters = false;
  let headerHeight = $("#headerbar").height(); // Not sure why this is 99 rather than 100
  if (!$("#filterFieldsHolder").length) { // Filter doesn't exist yet, initial map/index.html load.
    if (!$("#bodyFile").length) {
      $('body').prepend("<div id='bodyFile'></div>");
    }
    //loadLocalTemplate(); // Loaded a second time on community page
    loadSearchFilterIncludes();
    console.log('%cloadLeafletAndMapFilters called by showSearchFilter(). Might cause dup', 'color: red; background: yellow; font-size: 14px');
    loadLeafletAndMapFilters();
    $('html,body').scrollTop(0);
    loadFilters = true;
  } else {

    let filterTop = $("#filterFieldsHolder").offset().top - window.pageYOffset;

    console.log("showSearchFilter #filterFieldsHolder offset top: " + filterTop);
    //  || (!$("#headerbar").is(':visible') && filterTop >= 0)
    if ($("#filterFieldsHolder").is(':visible') && (($("#headerbar").is(':visible') && filterTop >= headerHeight) )) { // Might need to allow for coverage by header.
      console.log("Hide #filterFieldsHolder");
      $("#filterFieldsHolder").hide();
      $("#filterFieldsHolder").addClass("filterFieldsHidden");
      //$("#filterbaroffset").hide();
      ////$("#pageLinksHolder").hide();
    } else {
      // #bodyFile is needed for map/index.html to apply $("#filterFieldsHolder").show()
      // Also prevents search filter from flashing briefly in map/index.html before moving into #bodyFile
        
      if (document.getElementById("filterFieldContent") == null) { 
        //alert("load filter.html")
        let filterFile = "/localsite/map/filter.html";
        $("#filterFieldsHolder").load(filterFile, function( response, status, xhr ) {

        }); // End $("#filters").load

        loadFilters = true;
      } else { // Already exists, show filters
        revealFilters();
      }
    }

    if (loadFilters) {
      waitForElm('#bodyFile #filterFieldContent').then((elm) => {
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

// TO DO: Optimize by checking just the nodes in the mutations
// https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
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


function loadMarkdown(pagePath, divID, target, callback) {
  // WAIT FOR SCRIPT THAT LOADS README.md Files
  loadScript(theroot + 'js/d3.v5.min.js', function(results) {
  //loadScript(theroot + 'js/jquery.min.js', function(results) {
  loadScript(theroot + 'js/showdown.min.js', function(results) {

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
    //let foldercount = (location.pathname.split('/').length - 1);
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
    if (typeof customD3loaded === 'undefined') {
      console.log("ALERT - d3 not available yet. This may occur if showdown.min.js is included in page, but not d3.v5.min.js")
    }
    d3.text(pagePath).then(function(data) {
      // Path is replaced further down page. Reactivate after adding menu.
      var pencil = "<div class='markdownEye' style='display:none;position:absolute;font-size:28px;right:0px;text-decoration:none;opacity:.7'><a href='" + pagePath + "' style='color:#555'>…</a></div>";
      // CUSTOM About YAML metadata converter: https://github.com/showdownjs/showdown/issues/260

      // Also try adding simpleLineBreaks http://demo.showdownjs.com/

      var converter = new showdown.Converter({tables:true, metadata:true, simpleLineBreaks: true}),
      html = pencil + converter.makeHtml(data);

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
      //document.getElementById(divID).innerHTML = html; // Overwrites

      // Append rather than overwrite
      var thediv = document.getElementById(divID);
      loadIntoDiv(pageFolder,divID,thediv,html,0,callback);

    });
  });
  });
  //});
}
function loadIntoDiv(pageFolder,divID,thediv,html,attempts,callback) {
  if (thediv) {
    //alert("loadIntoDiv attempts: " + attempts);
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
    $("#" + divID + " a[href]").each(function() {

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
    })
    if(callback) callback();
  } else { // Try again
    attempts = attempts + 1;
    if (attempts < 100) {
      setTimeout( function() {
        thediv = document.getElementById(divID);
        loadIntoDiv(pageFolder,divID,thediv,html,attempts,callback);
      }, 100 );
    } else {
      console.log("ALERT: " + divID + " not available in page for showdown to insert text after " + attempts + " attempts.");
    }
  }

}