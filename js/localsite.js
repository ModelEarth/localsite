// Updates originate in GitHub localsite/js/localsite.js
// To do: dynamically add target _parent to external link when in an iFrame, and no existing target

// Localsite Path Library - A global namespace singleton
// If dual_map library exists then use it, else define a new object.
var dual_map = dual_map || (function(){
    var _args = {}; // private

    return {
        init : function(Args) {
            _args = Args;
            // some other initialising
        },
        helloWorld : function() {
            alert('Hello World! -' + _args[0]);
        },
        localsite_root : function() {
            let root = location.protocol + '//' + location.host + '/localsite/';
            if (location.host.indexOf("georgia") >= 0) { // For feedback link within embedded map
              root = 'https://map.georgia.org/localsite/';
            }
            if (location.host.indexOf('localhost') < 0) {
              // May be needed if embedding without locathost repo in site root.
              //root = "https://neighborhood.org/localsite/";
            }
            return (root);
        },
        community_data_root : function() { // General US states and eventually some international
            let root = location.protocol + '//' + location.host + '/community-data/';
            //if (location.host.indexOf('localhost') < 0) {
              root = "https://model.earth/community-data/"; 
            //}
            return (root);
        },
        modelearth_data_root : function() { // General US states and eventually some international
            // These repos will typically reside on github, so no localhost.
            let root = "https://model.earth"; // Probably will also remove slash from the ends of others.
            return (root);
        },
        custom_data_root : function() { // Unique US states - will use javascript, domain, cookies and json.
            let root = location.protocol + '//' + location.host + '/georgia-data/';
            if (location.host.indexOf('localhost') < 0) {
              root = "https://neighborhood.org/georgia-data/";
            }
            return (root);
        }
    };
}());

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
  // Now try to find one containging embed-map
  for (var i = 0; i < scripts.length; ++i) {
      if(scripts[i].src && scripts[i].src.indexOf('embed-map.js') !== -1){
        myScript = scripts[i];
      }
  }
  //alert(myScript.src);

  let params = {};
  let includepairs = myScript.src.substring(myScript.src.indexOf('?') + 1).split('&');
  for (let i = 0; i < includepairs.length; i++) {
    if(!includepairs[i])
          continue;
    let pair = includepairs[i].split('=');
    params[pair[0].toLowerCase()] = decodeURIComponent(pair[1]);
    //console.log("Param from javascript include: " + pair[0].toLowerCase() + " " + decodeURIComponent(pair[1]));
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
   target2 = jQuery.extend(true, {}, target); // Clone/copy object without entanglement
   for(var key in incoming) {
     if (incoming.hasOwnProperty(key)) {
        if (incoming[key] === null || incoming[key] === undefined || incoming[key] === '') {
          delete target2[key];
        } else {
          target2[key] = incoming[key];
        }
     }
   }
   //alert("cat test out " + hiddenhash.cat);
   return target2;
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
  console.log("goHash ")
  console.log(addToHash)
  updateHash(addToHash);
  triggerHashChangeEvent();
}
function go(addToHash) {
  console.log("go ")
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
$(window).on('hashchange', function() { // Avoid window.onhashchange since overridden by map and widget embeds  
  console.log("window hashchange");
  console.log("delete hiddenhash.name");
  delete hiddenhash.name; // Not sure where this is set.
  delete hiddenhash.cat; // Not sure where this is set.
  triggerHashChangeEvent();
});
//MutationObserver.observe(hiddenhash, triggerHashChangeEvent);


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

function consoleLog(text,value) {

  $("#log_display").show();
  if (value) {
    $("#log_display textarea").append(text + " " + value + "\n");
    console.log(text, value);
  } else {
    $("#log_display textarea").append(text + "\n");
    console.log(text);
  }

  var dsconsole = $("#log_display textarea");
    if(dsconsole.length)
       dsconsole.scrollTop(dsconsole[0].scrollHeight - dsconsole.height() - 17); // Adjusts for bottom alignment

  
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
  //    console.log("Blank: " + key + " " + value);
  //} else 
  if (isObject(value)) {
      for (c in value) {

        console.log("isObject: " + key + " " + value);
        
        //if (json.data[a].constructor === Array && selected_array.includes(a) )  {
        if (isObject(value[c])) {

          // NEVER REACHED?
          console.log("This code is reached for location: " + key + " " + value);
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
      console.log(b);
    }*/

      // value.constructor === Array

    else if (isArray(value))  { // was b.   && selected_array.includes(key)  seems to prevent overload for DiffBot. Need to identify why.
      //console.log(value.length);

      console.log("isArray: " + key + " " + value + " " + value.length);
      if (value.length > 0) {

        for (c in value) {
          curLine=""            
          //console.log(value[c],b,c); //c is 0,1,2 index
          
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
                //console.log("Found: " + value[c][d])
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
                //console.log("Found: " + value[c][d]); // Returns error since not object
                console.log("Found: " + d);
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
      console.log("Array of 0: " + key + " " + value);
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
      //console.log("Last: " + key + " " + value);
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
  return $.isArray(obj);
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
      $('#log_display').hide();
    }
  }, false);
});


console.log("localsite.js called");
var waitForJQuery = setInterval(function () {
    if (typeof $ != 'undefined') {

      $(document).ready(function () {
        /*! jQuery & Zepto Lazy v1.7.6 - http://jquery.eisbehr.de/lazy - MIT&GPL-2.0 license - Copyright 2012-2017 Daniel 'Eisbehr' Kern */
        !function(t,e){"use strict";function r(r,a,i,u,l){function f(){L=t.devicePixelRatio>1,i=c(i),a.delay>=0&&setTimeout(function(){s(!0)},a.delay),(a.delay<0||a.combined)&&(u.e=v(a.throttle,function(t){"resize"===t.type&&(w=B=-1),s(t.all)}),u.a=function(t){t=c(t),i.push.apply(i,t)},u.g=function(){return i=n(i).filter(function(){return!n(this).data(a.loadedName)})},u.f=function(t){for(var e=0;e<t.length;e++){var r=i.filter(function(){return this===t[e]});r.length&&s(!1,r)}},s(),n(a.appendScroll).on("scroll."+l+" resize."+l,u.e))}function c(t){var i=a.defaultImage,o=a.placeholder,u=a.imageBase,l=a.srcsetAttribute,f=a.loaderAttribute,c=a._f||{};t=n(t).filter(function(){var t=n(this),r=m(this);return!t.data(a.handledName)&&(t.attr(a.attribute)||t.attr(l)||t.attr(f)||c[r]!==e)}).data("plugin_"+a.name,r);for(var s=0,d=t.length;s<d;s++){var A=n(t[s]),g=m(t[s]),h=A.attr(a.imageBaseAttribute)||u;g===N&&h&&A.attr(l)&&A.attr(l,b(A.attr(l),h)),c[g]===e||A.attr(f)||A.attr(f,c[g]),g===N&&i&&!A.attr(E)?A.attr(E,i):g===N||!o||A.css(O)&&"none"!==A.css(O)||A.css(O,"url('"+o+"')")}return t}function s(t,e){if(!i.length)return void(a.autoDestroy&&r.destroy());for(var o=e||i,u=!1,l=a.imageBase||"",f=a.srcsetAttribute,c=a.handledName,s=0;s<o.length;s++)if(t||e||A(o[s])){var g=n(o[s]),h=m(o[s]),b=g.attr(a.attribute),v=g.attr(a.imageBaseAttribute)||l,p=g.attr(a.loaderAttribute);g.data(c)||a.visibleOnly&&!g.is(":visible")||!((b||g.attr(f))&&(h===N&&(v+b!==g.attr(E)||g.attr(f)!==g.attr(F))||h!==N&&v+b!==g.css(O))||p)||(u=!0,g.data(c,!0),d(g,h,v,p))}u&&(i=n(i).filter(function(){return!n(this).data(c)}))}function d(t,e,r,i){++z;var o=function(){y("onError",t),p(),o=n.noop};y("beforeLoad",t);var u=a.attribute,l=a.srcsetAttribute,f=a.sizesAttribute,c=a.retinaAttribute,s=a.removeAttribute,d=a.loadedName,A=t.attr(c);if(i){var g=function(){s&&t.removeAttr(a.loaderAttribute),t.data(d,!0),y(T,t),setTimeout(p,1),g=n.noop};t.off(I).one(I,o).one(D,g),y(i,t,function(e){e?(t.off(D),g()):(t.off(I),o())})||t.trigger(I)}else{var h=n(new Image);h.one(I,o).one(D,function(){t.hide(),e===N?t.attr(C,h.attr(C)).attr(F,h.attr(F)).attr(E,h.attr(E)):t.css(O,"url('"+h.attr(E)+"')"),t[a.effect](a.effectTime),s&&(t.removeAttr(u+" "+l+" "+c+" "+a.imageBaseAttribute),f!==C&&t.removeAttr(f)),t.data(d,!0),y(T,t),h.remove(),p()});var m=(L&&A?A:t.attr(u))||"";h.attr(C,t.attr(f)).attr(F,t.attr(l)).attr(E,m?r+m:null),h.complete&&h.trigger(D)}}function A(t){var e=t.getBoundingClientRect(),r=a.scrollDirection,n=a.threshold,i=h()+n>e.top&&-n<e.bottom,o=g()+n>e.left&&-n<e.right;return"vertical"===r?i:"horizontal"===r?o:i&&o}function g(){return w>=0?w:w=n(t).width()}function h(){return B>=0?B:B=n(t).height()}function m(t){return t.tagName.toLowerCase()}function b(t,e){if(e){var r=t.split(",");t="";for(var a=0,n=r.length;a<n;a++)t+=e+r[a].trim()+(a!==n-1?",":"")}return t}function v(t,e){var n,i=0;return function(o,u){function l(){i=+new Date,e.call(r,o)}var f=+new Date-i;n&&clearTimeout(n),f>t||!a.enableThrottle||u?l():n=setTimeout(l,t-f)}}function p(){--z,i.length||z||y("onFinishedAll")}function y(t,e,n){return!!(t=a[t])&&(t.apply(r,[].slice.call(arguments,1)),!0)}var z=0,w=-1,B=-1,L=!1,T="afterLoad",D="load",I="error",N="img",E="src",F="srcset",C="sizes",O="background-image";"event"===a.bind||o?f():n(t).on(D+"."+l,f)}function a(a,o){var u=this,l=n.extend({},u.config,o),f={},c=l.name+"-"+ ++i;return u.config=function(t,r){return r===e?l[t]:(l[t]=r,u)},u.addItems=function(t){return f.a&&f.a("string"===n.type(t)?n(t):t),u},u.getItems=function(){return f.g?f.g():{}},u.update=function(t){return f.e&&f.e({},!t),u},u.force=function(t){return f.f&&f.f("string"===n.type(t)?n(t):t),u},u.loadAll=function(){return f.e&&f.e({all:!0},!0),u},u.destroy=function(){return n(l.appendScroll).off("."+c,f.e),n(t).off("."+c),f={},e},r(u,l,a,f,c),l.chainable?a:u}var n=t.jQuery||t.Zepto,i=0,o=!1;n.fn.Lazy=n.fn.lazy=function(t){return new a(this,t)},n.Lazy=n.lazy=function(t,r,i){if(n.isFunction(r)&&(i=r,r=[]),n.isFunction(i)){t=n.isArray(t)?t:[t],r=n.isArray(r)?r:[r];for(var o=a.prototype.config,u=o._f||(o._f={}),l=0,f=t.length;l<f;l++)(o[t[l]]===e||n.isFunction(o[t[l]]))&&(o[t[l]]=i);for(var c=0,s=r.length;c<s;c++)u[r[c]]=t[0]}},a.prototype.config={name:"lazy",chainable:!0,autoDestroy:!0,bind:"load",threshold:500,visibleOnly:!1,appendScroll:t,scrollDirection:"both",imageBase:null,defaultImage:"data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",placeholder:null,delay:-1,combined:!1,attribute:"data-src",srcsetAttribute:"data-srcset",sizesAttribute:"data-sizes",retinaAttribute:"data-retina",loaderAttribute:"data-loader",imageBaseAttribute:"data-imagebase",removeAttribute:!0,handledName:"handled",loadedName:"loaded",effect:"show",effectTime:0,enableThrottle:!0,throttle:250,beforeLoad:e,afterLoad:e,onError:e,onFinishedAll:e},n(t).on("load",function(){o=!0})}(window);
        $(function() {
              $('.lazy').Lazy(); // Lazy load all divs with class .lazy
        });

        if(location.host.indexOf('localhost') >= 0 || param["view"] == "local") {
          var div = $("<div />", {
              html: '<style>.local{display:inline-block !important}.localonly{display:block !important}</style>'
            }).appendTo("body");
          console.log("localsite.js waitForJQuery called");
        } else {
          // Inject style rule
            var div = $("<div />", {
              html: '<style>.local{display:none}.localonly{display:none}</style>'
            }).appendTo("body");
        }
      });
      clearInterval(waitForJQuery); // Escape the loop
    }
}, 10);

String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};



// Called from header.html files
function toggleFullScreen() {
  if (document.fullscreenElement) { // Already fullscreen
    console.log("Already fullscreenElement");
    if (document.exitFullscreen) {
      console.log("Attempt to exit fullscreen")
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