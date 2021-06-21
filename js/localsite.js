// Updates originate in GitHub localsite/js/localsite.js
// To do: dynamically add target _parent to external link when in an iFrame and no existing target.


// Localsite Path Library - A global namespace singleton
// If local_app library exists then use it, else define a new object.
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
            //alert("call localsite_repo");
            if (localsite_repo) { // Intensive, so allows to only run once
              //alert(localsite_repo);
              return(localsite_repo);
            }

            let scripts = document.getElementsByTagName('script'); 
            let myScript; // = scripts[ scripts.length - 1 ]; // Last script on page, typically the current script localsite.js
            // Now try to find localsite.js
            //alert(myScript.length)
            for (var i = 0; i < scripts.length; ++i) {
                //alert(scripts[i].src)
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
            let hostnameAndPort = extractHostnameAndPort(myScript.src);
            let theroot = location.protocol + '//' + location.host + '/localsite/';

            if (location.host.indexOf("georgia") >= 0) { // For feedback link within embedded map
              //theroot = "https://map.georgia.org/localsite/";
              theroot = hostnameAndPort + "/localsite/";
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
              //theroot = "https://model.earth/localsite/";
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

// Above is alternative to placing params in javascript include path:
// https://stackoverflow.com/questions/2190801/passing-parameters-to-javascript-files


// USE params (plural) to isolate within functions when creating embedable widgets.
// USE param for any html page using localsite.js.
if(typeof param == 'undefined') {
    var param = {};
    param = loadParams(location.search,location.hash);
} else {
  param = mix(param,loadParams(location.search,location.hash));
}
if(typeof hiddenhash == 'undefined') {
    var hiddenhash = {};
}
initateHiddenhash();
function initateHiddenhash() { // Load in values from params on javascript include file.
  let scripts = document.getElementsByTagName('script'); 
  let myScript = scripts[ scripts.length - 1 ]; // Last script on page, typically the current script localsite.js
  //let myScript = null;
  // Now try to find one containging map-embed.js
  for (var i = 0; i < scripts.length; ++i) {
      if(scripts[i].src && scripts[i].src.indexOf('map-embed.js') !== -1){
        myScript = scripts[i];
      }
  }
  
  // Check if script resides on current server.
  //alert("myScript.src hostname and port: " + extractHostnameAndPort(myScript.src) + "\rwindow.location hostname and port: " + window.location.hostname + ((window.location.port) ? ':'+window.location.port :''));

  //local_app.localsite_root("https://model.earth");
  //alert(local_app.localsite_root())

  let includepairs = myScript.src.substring(myScript.src.indexOf('?') + 1).split('&');
  for (let i = 0; i < includepairs.length; i++) {
    if(!includepairs[i]) continue;
    let pair = includepairs[i].split('=');
    hiddenhash[pair[0].toLowerCase()] = decodeURIComponent(pair[1]);
    //consoleLog("Param from javascript include: " + pair[0].toLowerCase() + " " + decodeURIComponent(pair[1]));
  }
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
  let myScript = scripts[ scripts.length - 1 ]; // Last script on page, typically the current script localsite.js
  //let myScript = null;

  // This will be removed
  for (var i = 0; i < scripts.length; ++i) {
      if(scripts[i].src && scripts[i].src.indexOf('embed-map.js') !== -1){
        myScript = scripts[i];
      }
  }

  // Now try to find one containging embed-map
  for (var i = 0; i < scripts.length; ++i) {
      if(scripts[i].src && scripts[i].src.indexOf('map-embed.js') !== -1){
        myScript = scripts[i];
      }
  }
  //alert(myScript.src);

  let params = {};
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
    //return getHashOnly(); // Test
    //alert("cat test in " + hiddenhash.cat);
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
function updateHash(addToHash, addToExisting) {
    let hash = {}; // Limited to this function
    if (addToExisting != false) {
      hash = getHashOnly(); // Include all existing. Excludes hiddenhash.
    }
    hash = mix(addToHash,hash); // Gives priority to addToHash

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
function goHash(addToHash) {
  consoleLog("goHash ")
  consoleLog(addToHash)
  updateHash(addToHash);
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

  //alert(urlID)
  if (!document.getElementById(urlID)) { // Prevents multiple loads.
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


// WAIT FOR JQUERY
loadScript(theroot + 'js/jquery.min.js', function(results) {

  var waitForJQuery = setInterval(function () { // Waits for $ within jquery.min.js file to become available.

    if (typeof $ != 'undefined') {

      $(document).ready(function () {

        consoleLog("Ready","DOM Loaded (But not template yet). Using theroot: " + theroot)

        /*! jQuery & Zepto Lazy v1.7.6 - http://jquery.eisbehr.de/lazy - MIT&GPL-2.0 license - Copyright 2012-2017 Daniel 'Eisbehr' Kern */
        !function(t,e){"use strict";function r(r,a,i,u,l){function f(){L=t.devicePixelRatio>1,i=c(i),a.delay>=0&&setTimeout(function(){s(!0)},a.delay),(a.delay<0||a.combined)&&(u.e=v(a.throttle,function(t){"resize"===t.type&&(w=B=-1),s(t.all)}),u.a=function(t){t=c(t),i.push.apply(i,t)},u.g=function(){return i=n(i).filter(function(){return!n(this).data(a.loadedName)})},u.f=function(t){for(var e=0;e<t.length;e++){var r=i.filter(function(){return this===t[e]});r.length&&s(!1,r)}},s(),n(a.appendScroll).on("scroll."+l+" resize."+l,u.e))}function c(t){var i=a.defaultImage,o=a.placeholder,u=a.imageBase,l=a.srcsetAttribute,f=a.loaderAttribute,c=a._f||{};t=n(t).filter(function(){var t=n(this),r=m(this);return!t.data(a.handledName)&&(t.attr(a.attribute)||t.attr(l)||t.attr(f)||c[r]!==e)}).data("plugin_"+a.name,r);for(var s=0,d=t.length;s<d;s++){var A=n(t[s]),g=m(t[s]),h=A.attr(a.imageBaseAttribute)||u;g===N&&h&&A.attr(l)&&A.attr(l,b(A.attr(l),h)),c[g]===e||A.attr(f)||A.attr(f,c[g]),g===N&&i&&!A.attr(E)?A.attr(E,i):g===N||!o||A.css(O)&&"none"!==A.css(O)||A.css(O,"url('"+o+"')")}return t}function s(t,e){if(!i.length)return void(a.autoDestroy&&r.destroy());for(var o=e||i,u=!1,l=a.imageBase||"",f=a.srcsetAttribute,c=a.handledName,s=0;s<o.length;s++)if(t||e||A(o[s])){var g=n(o[s]),h=m(o[s]),b=g.attr(a.attribute),v=g.attr(a.imageBaseAttribute)||l,p=g.attr(a.loaderAttribute);g.data(c)||a.visibleOnly&&!g.is(":visible")||!((b||g.attr(f))&&(h===N&&(v+b!==g.attr(E)||g.attr(f)!==g.attr(F))||h!==N&&v+b!==g.css(O))||p)||(u=!0,g.data(c,!0),d(g,h,v,p))}u&&(i=n(i).filter(function(){return!n(this).data(c)}))}function d(t,e,r,i){++z;var o=function(){y("onError",t),p(),o=n.noop};y("beforeLoad",t);var u=a.attribute,l=a.srcsetAttribute,f=a.sizesAttribute,c=a.retinaAttribute,s=a.removeAttribute,d=a.loadedName,A=t.attr(c);if(i){var g=function(){s&&t.removeAttr(a.loaderAttribute),t.data(d,!0),y(T,t),setTimeout(p,1),g=n.noop};t.off(I).one(I,o).one(D,g),y(i,t,function(e){e?(t.off(D),g()):(t.off(I),o())})||t.trigger(I)}else{var h=n(new Image);h.one(I,o).one(D,function(){t.hide(),e===N?t.attr(C,h.attr(C)).attr(F,h.attr(F)).attr(E,h.attr(E)):t.css(O,"url('"+h.attr(E)+"')"),t[a.effect](a.effectTime),s&&(t.removeAttr(u+" "+l+" "+c+" "+a.imageBaseAttribute),f!==C&&t.removeAttr(f)),t.data(d,!0),y(T,t),h.remove(),p()});var m=(L&&A?A:t.attr(u))||"";h.attr(C,t.attr(f)).attr(F,t.attr(l)).attr(E,m?r+m:null),h.complete&&h.trigger(D)}}function A(t){var e=t.getBoundingClientRect(),r=a.scrollDirection,n=a.threshold,i=h()+n>e.top&&-n<e.bottom,o=g()+n>e.left&&-n<e.right;return"vertical"===r?i:"horizontal"===r?o:i&&o}function g(){return w>=0?w:w=n(t).width()}function h(){return B>=0?B:B=n(t).height()}function m(t){return t.tagName.toLowerCase()}function b(t,e){if(e){var r=t.split(",");t="";for(var a=0,n=r.length;a<n;a++)t+=e+r[a].trim()+(a!==n-1?",":"")}return t}function v(t,e){var n,i=0;return function(o,u){function l(){i=+new Date,e.call(r,o)}var f=+new Date-i;n&&clearTimeout(n),f>t||!a.enableThrottle||u?l():n=setTimeout(l,t-f)}}function p(){--z,i.length||z||y("onFinishedAll")}function y(t,e,n){return!!(t=a[t])&&(t.apply(r,[].slice.call(arguments,1)),!0)}var z=0,w=-1,B=-1,L=!1,T="afterLoad",D="load",I="error",N="img",E="src",F="srcset",C="sizes",O="background-image";"event"===a.bind||o?f():n(t).on(D+"."+l,f)}function a(a,o){var u=this,l=n.extend({},u.config,o),f={},c=l.name+"-"+ ++i;return u.config=function(t,r){return r===e?l[t]:(l[t]=r,u)},u.addItems=function(t){return f.a&&f.a("string"===n.type(t)?n(t):t),u},u.getItems=function(){return f.g?f.g():{}},u.update=function(t){return f.e&&f.e({},!t),u},u.force=function(t){return f.f&&f.f("string"===n.type(t)?n(t):t),u},u.loadAll=function(){return f.e&&f.e({all:!0},!0),u},u.destroy=function(){return n(l.appendScroll).off("."+c,f.e),n(t).off("."+c),f={},e},r(u,l,a,f,c),l.chainable?a:u}var n=t.jQuery||t.Zepto,i=0,o=!1;n.fn.Lazy=n.fn.lazy=function(t){return new a(this,t)},n.Lazy=n.lazy=function(t,r,i){if(n.isFunction(r)&&(i=r,r=[]),n.isFunction(i)){t=n.isArray(t)?t:[t],r=n.isArray(r)?r:[r];for(var o=a.prototype.config,u=o._f||(o._f={}),l=0,f=t.length;l<f;l++)(o[t[l]]===e||n.isFunction(o[t[l]]))&&(o[t[l]]=i);for(var c=0,s=r.length;c<s;c++)u[r[c]]=t[0]}},a.prototype.config={name:"lazy",chainable:!0,autoDestroy:!0,bind:"load",threshold:500,visibleOnly:!1,appendScroll:t,scrollDirection:"both",imageBase:null,defaultImage:"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",placeholder:null,delay:-1,combined:!1,attribute:"data-src",srcsetAttribute:"data-srcset",sizesAttribute:"data-sizes",retinaAttribute:"data-retina",loaderAttribute:"data-loader",imageBaseAttribute:"data-imagebase",removeAttribute:!0,handledName:"handled",loadedName:"loaded",effect:"show",effectTime:0,enableThrottle:!0,throttle:250,beforeLoad:e,afterLoad:e,onError:e,onFinishedAll:e},n(t).on("load",function(){o=!0})}(window);
        $(function() {
              $('.lazy').Lazy(); // Lazy load all divs with class .lazy
        });

        if(location.host.indexOf('localhost') >= 0 || param["view"] == "local") {
          var div = $("<div />", {
              html: '<style>.local{display:inline-block !important}.localonly{display:block !important}</style>'
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
        if (!$("#bodyFile").length) {
          $('body').append("<div id='bodyFile'></div>");
        }
        if (param.display == "everything" || param.display == "map") {
          let bodyFile = theroot + "map/index.html #insertedText";
          console.log("Before template Loaded: " + bodyFile);
          //alert("Before template Loaded: " + bodyFile);
          $("#bodyFile").load(bodyFile, function( response, status, xhr ) {
            consoleLog("Template Loaded: " + bodyFile);
            if (typeof relocatedStateMenu != "undefined") {
              relocatedStateMenu.appendChild(state_select); // For apps/beyondcarbon
            }
            if (param.showstates != "false") {
              $("#filterClickLocation").show();
            }
          });
        }

        // LOAD INFO TEMPLATE - Holds input-output widgets
        // View html source: https://model.earth/localsite/info/info-template.html
        if (!$("#infoFile").length) {
          $('body').append("<div id='infoFile'></div>");
        }
        if (param.display == "everything") {
          let infoFile = theroot + "info/info-template.html #info-template";
          console.log("Before template Loaded: " + bodyFile);
          //alert("Before template Loaded: " + bodyFile);
          $("#infoFile").load(infoFile, function( response, status, xhr ) {
            consoleLog("Info Template Loaded: " + infoFile);
          });
        }


      });
      



      $(window).on('hashchange', function() { // Avoid window.onhashchange since overridden by map and widget embeds  
        consoleLog("window hashchange");
        consoleLog("delete hiddenhash.name");
        delete hiddenhash.name; // Not sure where this is set.
        delete hiddenhash.cat; // Not sure where this is set.
        triggerHashChangeEvent();
      });
      //MutationObserver.observe(hiddenhash, triggerHashChangeEvent);


      clearInterval(waitForJQuery); // Escape the loop



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
  if (param.display == "everything" || param.display == "map") {

    includeCSS3(theroot + 'css/map.css',theroot); // Before naics.js so #industries can be overwritten.
    includeCSS3(theroot + 'css/naics.css',theroot);
// customD3loaded
    if (param.preloadmap != "false") {
      loadScript(theroot + 'js/d3.v5.min.js', function(results) { // BUG - change so map-filters.js does not require this on it's load
          includeCSS3(theroot + 'css/leaflet.css',theroot);
          loadScript(theroot + 'js/leaflet.js', function(results) {
            loadScript(theroot + 'js/leaflet.icon-material.js', function(results) { // Could skip when map does not use material icon colors
              $(".show-on-load").show();
              loadScript(theroot + 'js/map.js', function(results) {
                // Loads map-filters.js
                loadSearchFilters3(theroot,1); // Uses local_app library in localsite.js for community_data_root
              });
            });
          });

          //if (param.shownav) {
            loadScript(theroot + 'js/navigation.js', function(results) {});
          //}
        });
      
    }

    //includeCSS3(theroot + 'css/bootstrap.darkly.min.css',theroot);

    if (param.display == "everything") {

      loadScript(theroot + '../io/build/lib/useeio_widgets.js', function(results) {
        loadScript(theroot + 'js/naics.js', function(results) {
          //if(!param.state) {
            //applyIO("");
          //}
        });
      });
    }
      

    includeCSS3(theroot + '../io/build/widgets.css',theroot);
    includeCSS3(theroot + '../io/build/slider.css',theroot);


    includeCSS3(theroot + 'css/base.css',theroot);
    includeCSS3(theroot + 'css/search-filters.css',theroot);
    if (param.preloadmap != "false") {
      includeCSS3(theroot + 'css/map-display.css',theroot);
    }
    

    includeCSS3('https://fonts.googleapis.com/icon?family=Material+Icons',theroot);
    includeCSS3(theroot + 'css/leaflet.icon-material.css',theroot);
    
    loadScript(theroot + 'js/table-sort.js', function(results) {}); // For county grid column sort


    if (param.display == "everything") {
      //if(param.showbubbles) {
        loadScript(theroot + 'js/d3.v5.min.js', function(results) {
          loadScript(theroot + '../io/charts/bubble/js/bubble.js', function(results) {
            // HACK - call twice so rollovers work.
              refreshBubbleWidget();
              setTimeout( function() {
                
                // No luck...
              displayImpactBubbles(1);
              //displayImpactBubbles(1);
              //refreshBubbleWidget();
            }, 1000 );
          });
        });
      //}
    } // end everything

  } // end everything or map


      } else {
      if(location.host.indexOf('localhost') >= 0) {
        alert("Localhost alert: JQUERY NOT YET AVAILABLE!");
      } else {
        consoleLog("JQUERY NOT YET AVAILABLE! Use this more widely.");
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
        //alert(url);

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
              url = keepfolders + url.replace(beginning[0],"").replace("../","");
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

function loadSearchFilters3(theroot, count) {
  if (typeof customD3loaded !== 'undefined' && typeof localsite_map !== 'undefined') {
    //alert("localsite_map " + localsite_map)
    //loadScript(theroot + 'https://cdn.jsdelivr.net/npm/vue', function(results) { // Need to check if function loaded
      loadScript(theroot + 'js/map-filters.js', function(results) {});
    //});
  } else if (count<100) { // Wait a milisecond and try again
    setTimeout( function() {
        consoleLog("try loadSearchFilters again")
      loadSearchFilters(theroot,count+1);
      }, 10 );
  } else {
    consoleLog("ERROR: loadSearchFilters exceeded 100 attempts.");
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

function extractHostnameAndPortDELETE(url) {
    let hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    //hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

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
          if (value[c].length >1){

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
    } 
    
    /*if (Object.keys(value).length >1){
      consoleLog(b);
    }*/

      // value.constructor === Array

    else if (isArray(value))  { // was b.   && selected_array.includes(key)  seems to prevent overload for DiffBot. Need to identify why.
      //consoleLog(value.length);

      consoleLog("isArray: " + key + " " + value + " " + value.length);
      if (value.length > 0) {

        for (c in value) {
          curLine=""            
          //consoleLog(value[c],b,c); //c is 0,1,2 index
          
          if (isObject(value[c]) || isArray(value[c])) {
            for (d in value[c]){
            
              if (isObject(value[c][d])) { // Error in Drupal json
                //addHtml += "<b>Add something else here</b>\n";
                for (e in value[c][d]) {
                  //if (isObject(value[c][d][e]) || isArray(value[c][d][e])) {
                  //if (e !== null && e !== undefined) { // 
                    
                    // BUGBUG - Uncomment after preventoing error here: http://localhost:8887/community/resources/diffbot/?zip=91945
                    //addHtml += formatRow(e,value[c][d][e],level);

                  //}
                  //addHtml += "<div class='level5'>" + e + ": " + value[c][d][e] + "</div>\n";
                }
              } else {
                //consoleLog("Found: " + value[c][d])
                addHtml += formatRow(d,value[c][d],level);
                //addHtml += "<div class='level4'>" + d + ":: " + value[c][d] + "</div>\n";
              }

              // if (value[c].constructor === Array && selected_array.includes(c) )  {
              //  addHtml += "<b>Add loop here</b>\n";
              // }
              // if (isArray(value[c][d])) {
              //  addHtml += "<b>Add something here</b>\n";
              // }
              
            }
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
    //consoleLog('click ' + Date.now())
    var anchor = getParentAnchor(e.target);
    if(anchor !== null) {
      //$('#log_display').hide();
      document.getElementById("log_display").style.display = 'none';
    }
  }, false);
});



String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};
