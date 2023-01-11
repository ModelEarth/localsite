console.log("HERE settings.js loaded.")
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
/*******************************************/

let params = parseQuery(scriptParamString);
let showLogin = true;
var workoffline = false;
function embedded() {
    if (params["embed"] == "1" || params["embed"] == "true") {
        return true;
    } else {
        return false;
    }
}

initEvents(); //explore/js/embed.js

$(document).ready(function () {
    initElements();
});
function initElements() {

    let layerName = "main"; // Added, could change to hash.show

    var sitemode;
    var sitesource;
    var sitelook;
    if(typeof Cookies!='undefined') {
        sitemode = Cookies.get('sitemode');
        sitesource = Cookies.get('sitesource');
        sitelook = Cookies.get('sitelook');
        if (param["sitemode"]) { // From URL
            sitemode = param["sitemode"]; 
            Cookies.set('sitemode', sitemode);
            $(".sitemode").val(sitemode);
        } else if (params["sitemode"]) { // From index.html
            sitemode = params["sitemode"];
            $(".sitemode").val(sitemode);
            console.log("Set sitemode from index.html: " + sitemode);
        } else {
            setSiteMode(sitemode);
        }
    }
    $(".moduleIntroHolder").append($(".moduleIntro"));

    if ($(".insertFilters").length > 0) {
        $(".insertFilters").append($(".filterHolder"));
        //$("#contractors-table").hide();
        //$("#contractors-table").prepend($(".k-grid-pager"));
        $(".showFiltersButton").hide();
    }

    // TEMP
    //$(".filterPanelHolder").show();
    //$(".showFiltersButton").addClass("active"); // No effect
    ////$(".showFiltersButton").hide(); // No effect


    if ($(".insertTopbuttons").length > 0) {
        //$(".insertTopbuttons").append($(".topButtons"));
    }
    // We avoid called setSiteMode because displayed dropdown value does not change without .change() - which would cause loop if we called from within setSiteMode.
    //setSiteMode(sitemode); // Hides fullnav.

    // Initial load
    //$(".sitemode").val("widget").change();

    $(document).ready(function () {

        //applyHash();

        //$(".moduleCenter").css("max-width","1200px");
        $(".moduleContent").insertAfter($(".moduleContentPosition")); // .moduleContent resides in menu/wrap.html
        $(".smartHolderInsert").append($(".smartHolder")); // Used by dod

        if (params["sitemode"] != "widget") { // Hides for /defense
            //$(".topTitleBar").show();
        }

        //setSiteSource(sitesource);
        if(layerName == "main") {
            $(".videoHeightHolder").show();
        }
        if (workoffline) {
            $(".iconText").show();
        }
        if(!$('#expandPanel').is(":visible")) {
            if(inIframe()) { 
                $(".expandFromWidget").show();
            }
        }
        if (params["logo"]) {
            //$( "#siteHeader" ).append( "<a href='/'><img src='" + params["logo"] + "' style='" + params["logostyle"] + "' /></a>" );
        }
        if (params["headerElement"]) {
            $("#siteHeader").append( params["headerElement"] );
        }
        if ($(".sitemode").val() != "fullnav") {
            // Never fix the navTop, always fix the siteHeader
            //$('#siteHeader').css("position","fixed");
            //$('.moduleBackgroundImage').css("position","fixed");
            // What about offset here?
        }
        if (params["heroheight"]) {
            // Add space here: https://localhost/explore/defense/contractors/
            //$(".panelMinHeight").css("min-height",params["heroheight"] + "px");
            var heroHeight = parseInt(params["heroheight"]) + parseInt($("#siteHeader").height());
            $(".moduleBackgroundImage").css("min-height",heroHeight + "px");
            $(".sitemoduleBackground").hide();
            $(".siteHeaderImage").hide();
        }
        /*
        setTimeout(function(){
            setHeaderOnScroll(); // Init the header height
        }, 100);
        setTimeout(function(){
            setHeaderOnScroll(); // Init the header height
        }, 1000);
        setTimeout(function(){
            setHeaderOnScroll(); // Init the header height
        }, 3000);
        */
        if (window.location.search) {
            // Reactivate ASAP
            if (!$(".filterPanelHolder").is(':visible')) {
                // Causes Chinese page to also show filters.
                $('.showFiltersButton').trigger("click");
            }
            /* Limit to search parameters */
            //alert("pre goSearch");
            // Not needed for cid, need to test if zip and counties URL works wihout this
            if (param["cid"] || param["zip"] || param["counties"]) {
                //alert("goSearch"); 
                // Causes list to appear below detailsPanel
                // Might also cause redirect, though does not seem to.
                //goSearch("noredirect");
            }
            
        }

        // Need to loop through
        $('.bigThumbUl .user-4').detach(); // Prevents gap due to hidden divs when using nth-child in site.css

    });
    if(typeof Cookies!='undefined') {
        if (Cookies.get('sitemode')) {
            $(".sitemode").val(Cookies.get('sitemode'));
        }
        if (Cookies.get('sitesource')) {
            $(".sitesource").val(Cookies.get('sitesource'));
        }
        if (Cookies.get('sitebasemap')) {
            $(".sitebasemap").val(Cookies.get('sitebasemap'));
        }
    }
    
    if (!$("#sitelook").is(':visible')) {
        sitelook = "default"; // For now, filterPanel background is always an image.
    }

    if (param["sitelook"]) { // From URL
        sitelook = param["sitelook"]; 
        //Cookies.set('sitelook', sitelook);
    } else if (params["sitelook"]) { // From widget
        sitelook = params["sitelook"]; 
        // Prevent video from appearing when going to menu. Cookies probably need to be specific to domain.
        //Cookies.set('sitelook', sitelook);
    } else if (typeof Cookies!='undefined' && Cookies.get('sitelook')) {
        sitelook = Cookies.get('sitelook');
    }
    console.log("sitelook init: " + sitelook);
    setSiteLook(sitelook,layerName);
    if (typeof Cookies!='undefined') {
        $("#sitelook").val(Cookies.get('sitelook'));
    }
}
function getLayerName() {
    consoleLog("getLayerName location.hash: " + location.hash);
    // To do: fetch from embed.js?go=
    //if (!location.hash) return "main";

    return getCurrentLayer();
}
function hideSettings() {
    $(".hideSettings").hide();
    $(".showSettings").show();
    $(".showSettings").show();
    $(".showSettingsClick").show();
    $(".settingsPanel").addClass("column-hidden");
}
var loc_hash="";
function getCurrentLayer() {
    //Sample - #companies:aerospace:runways returns companies
    loc_hash = location.hash;
    param = loadParams(location.search,location.hash);
    //consoleLog('getCurrentLayer() param[""] ' + param[""]);
    
    if (param[""]) {
        //alert('getCurrentLayer() param[""]: ' + param[""]);
        var theLayer = param[""];
        if (theLayer.indexOf(":") >= 0) {
            var splitParam = param[""].split(":");
            theLayer = splitParam[1];
        }
        consoleLog("getCurrentLayer(): " + theLayer);
        return theLayer;
    } else {
        if (params["go"]) {
            return(params["go"]); // Set within calling page.
        }
        //return "main"; // Jan 2017

        // This will be changed sice it prevents a use of header without layer showing.
        if (location.host == 'recycling.georgia.org') {
            return "recycling";
        }
        return "";
    }
}
// These were in explore/js/embed.js siteObject function, which we are no longer calling.
// These will reside in a new .js file.
$(document).on("change", ".sitemode", function(event) {
    if ($(".sitemode").val() == "fullnav" && $('#siteHeader').is(':empty')) { // #siteHeader exists. This will likely need to be changed later.
        layerName = getLayerName();
        window.location = "./#" + layerName;
    }
    sitemode = $(".sitemode").val();
    setSiteMode($(".sitemode").val());
    hideSettings();
    Cookies.set('sitemode', $(".sitemode").val());
    if ($(".sitemode").val() == "fullnav") {
        $('.showSearchClick').trigger("click");
    }
    event.stopPropagation();
});
$(document).on("change", ".sitesource", function(event) {
    sitesource = $(".sitesource").val();
    Cookies.set('sitesource', $(".sitesource").val());
    setSiteSource($(".sitesource").val());
    event.stopPropagation();
});
$(document).on("change", "#sitelook", function(event) { // Style: default, coi, gc
    if (typeof Cookies!='undefined') {
        Cookies.set('sitelook', $("#sitelook").val());
    }
    changeSiteLook();
    event.stopPropagation();
});
$(document).on("change", ".sitebasemap", function(event) {
    sitebasemap = $(".sitebasemap").val();
    if (typeof Cookies!='undefined') {
        Cookies.set('sitebasemap', $(".sitebasemap").val());
    }
    setSiteSource($(".sitebasemap").val());
    event.stopPropagation();
});

function changeSiteLook() {
    alert("changeSiteLook 1")
    layerName = getLayerName();
    consoleLog("changeSiteLook: " + $("#sitelook").val());
    setSiteLook($("#sitelook").val(),layerName);
    hideSettings();
    //changeLayer(layerName,siteObject,"clearall"); // To load header image
}


function includeCssExplore(url) {
    let root = "/explore/"; // TEMP
    var urlID = url.replace(root,"").replace("https://","").replace(/\//g,"-").replace(/\./g,"-");
    if (urlID.indexOf('?') > 0) {
        urlID = urlID.substring(0,urlID.indexOf('?')); // Remove parameter so ?v=1 is not included in id.
    }
    if (!document.getElementById(urlID)) { // Prevents multiple loads.
        var link  = document.createElement('link');
        link.id   = urlID;
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        link.media = 'all';
        $(document).ready(function () { /* Not necessary if appending to head */
            //var body  = document.getElementsByTagName('body')[0];
            //body.appendChild(link);
        });
        var head  = document.getElementsByTagName('head')[0];
        
        // Not using because css needs to follow site.css.
        //head.insertBefore(link, head.firstChild);
        // Beaware, not all html pages contain a head tag. https://www.stevesouders.com/blog/2010/05/11/appendchild-vs-insertbefore/
        // Also see "postscribe" use in this page.
        head.appendChild(link); // Since site-narrow.css comes after site.css
    }
}


function setSiteLook(siteLook,layerName) {

    let root = "/explore/"; // TEMP
    consoleLog("setSiteLook: " + siteLook);
    
    // Force the brower to reload by changing version number. Avoid on localhost for in-browser editing. If else.
    var forceReload = (location.host.indexOf('localhost') >= 0 ? "" : "?v=3");
    if (siteLook == "dark") {
        $('.sitebasemap').val("dark").change();
        //toggleVideo("show","nochange");
        includeCssExplore(root + 'css/site-dark.css' + forceReload); // To remove
        includeCssExplore('/localsite/css/dark.css' + forceReload);
        $("#css-site-dark-css").removeAttr('disabled');
        $("#css-site-green-css").attr("disabled", "disabled");
        $("#css-site-plain-css").attr("disabled", "disabled");
        $('.searchTextHolder').append($('.searchTextMove'));
    } else if (siteLook == "gc" && layerName != "main") {
        $('.sitebasemap').val("osm").change();
        //toggleVideo("hide","pauseVideo");
        includeCssExplore(root + 'css/site-green.css' + forceReload);
        $("#css-site-green-css").removeAttr('disabled');
        $("#css-site-dark-css").attr("disabled", "disabled");
        $("#css-site-plain-css").attr("disabled", "disabled");
        if (layerName != "main") {
            $('.showSearchClick').trigger("click");
        }
        $('.searchTextHolder').append($('.searchTextMove'));
    } else if (siteLook == "default") {
        if (layerName == "contractor-directory") {
            $('.sitebasemap').val("osm").change(); // quick implementation
        }
        $("#css-site-green-css").removeAttr('disabled');
        $("#css-site-dark-css").attr("disabled", "disabled");
        $("#css-site-plain-css").attr("disabled", "disabled");
        //$('.searchTextHolder').append($('.searchTextMove'));
    } else { // Light
        $('.sitebasemap').val("positron_light_nolabels").change();
        includeCssExplore(root + 'css/site-plain.css' + forceReload);
        $("#css-site-plain-css").removeAttr('disabled');
        $("#css-site-dark-css").attr("disabled", "disabled");
        $("#css-site-green-css").attr("disabled", "disabled");

        //$("#sectionCategoriesToggle").hide();
        //$("#sectionNavigation").append($(".customFilters"));

        //$('#sectionNavigation').append($('.searchTextMove'));
        //$(".filterPanelHolder").show(); // Might need for COI
        $(".layoutTabHolder").show();
    }
    //setTimeout(function(){ updateOffsets(); }, 200); // Allows time for css file to load.
    //setTimeout(function(){ updateOffsets(); }, 4000);
}
function setSiteSource(sitesource) {
    if ($(".sitesource").val() == "directory") {
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
}
function loadUserAccess(userAccess) {
    currentAccess = userAccess;
    // For group access version, see /core/item/scripts/util.js
    $('.user-0').show(); // Shows for all. Allows div to be hidden until access is fetched.
    //alert("userAccess " + userAccess);
    if (userAccess >= 1) {
        $('.user-0').hide(); // show elements for anonymous users
        
        for (var i = 1; i <= 9; i++) {
            if (userAccess >= i) {
                $('.user-' + i).show();
            }
            if (userAccess == i) {
                $('.onlyuser-' + i + '-only').show();
            }
        }
    }
    else {
        for (var i = 1; i <= 9; i++) {
            $('.user-' + i).hide();
        }
        //$('.user-0-only').show(); // User user-0 instead.
    }
    for (var i = 1; i <= 9; i++) {
        if (userAccess <= i) {
            $('.user-' + i + '-andbelow').show();
        }
    }
}

function parseQuery (query) {
   var Params = new Object ();
   if ( ! query ) return Params; // return empty object
   var Pairs = query.split(/[;&]/);
   for ( var i = 0; i < Pairs.length; i++ ) {
      var KeyVal = Pairs[i].split('=');
      if ( ! KeyVal || KeyVal.length != 2 ) continue;
      var key = unescape( KeyVal[0] ).toLowerCase();
      var val = unescape( KeyVal[1] );
      val = val.replace(/\+/g, ' ');
      Params[key] = val;
   }
   return Params;
}
var scripts = document.getElementsByTagName('script');
var myScript = scripts[ scripts.length - 1 ];
var scriptParamString = myScript.src.replace(/^[^\?]+\??/,''); // Parameters on javascript include file.
function setSiteMode(sitemode) {

    if (sitemode == "fullnav" && $(".moduleJS").width() > 800) { // Full Header - With Navigation
        
        $(".sitemode").val("fullnav");
        $(".showFull").show();
        $(".hideWithFull").show();
        //$("#navTopFromTop").removeClass("headerHeightShort");

        $(".sectionBarBkgd").addClass("sectionBarBkgdColor");
        //$(".sectionBarSpacer").hide();
        $("#navTopFromTop").show(); 
        //$("#headerHolder").show(); // Show on rollover

        // Might isolate these...
        $('.headerElements').hide();
        $('.navTopTitle').hide();
        $('.sectionTitle').show();
        $('#headerHolder').show();

        $('.standardLogos').hide();

        if ($('.filterPanelWidget').is(':visible') && $('#filterPanel').is(':visible')) {
            $('.layerTitleAndArrow').hide();
        }
        $('.layerTitleLine').hide();
        $('.searchHeader').show();
        
        // Avoid, causes two clicks to display after initial load.
        //$('.navTopRight .showFilters').hide();
        //$('.navTopRight .hideFilters').show();

        $('#heroContent').show();
        $(".videoHeightHolder").show();
        $('#filterPanel').removeClass('filterPanelAbsolute');

        $('.universalHeader').show();

        //$(".moduleCenter").prepend($(".sectionBar"));
        $(".sectionBar").removeClass("sectionBarFixed");

        //$(".fullnavRightIcons").append($(".burgerNav")); // This can be cleaned out.
        $('.rightTopIconsRows').removeClass('rightTopIconsAbsolute');

        // This causes title to be overlapped when switching from image header to fullnav:
        //$('#siteHeader').css("height",$('#headerHolder').height() + $('.navTop').height());
        
        // siteHeaderSpacer height is set below.
        $(".navTopAlignment").addClass("navTopAlignmentFull");
        $('.headerHolderRollover').show();
    } else { // SECTION NAVIGATION
        var headerOffset = 90;
        $(".showFull").hide();
        $('.sectionBarBkgd2').css('background-position-y', -headerOffset);
        if (params["navloc"] != "top") { // Not Film
            //$(".sectionBarBkgd").removeClass("sectionBarBkgdColor");
        }
        //$(".sectionBarSpacer").show();

        $(".sectionBarAtTop").prepend($(".sectionBar"));
        $(".sectionBar").addClass("sectionBarFixed");
        $(".horizontalSection").addClass("topcolor");

        $('.universalHeader').hide();

        $('.headerElements').show();
        $('.standardLogos').show();
        $(".hideWithFull").hide();
        $(".sectionBarSpacer").show();
        $(".sectionBar").show();
        //$("#navTopFromTop").addClass("headerHeightShort");
        $("#navTopFromTop").hide(); // Since full header is not displayed from menu/js
        // To Do: Omit for layer main.
        //if (params["embed"] == "1") { // REACTIVATE MAYBE
            
            // To do: eliminate the content, or move.
            $("#smartPanel1").hide();
            //$(".layerTitleAndArrow").hide();
            
            // Display filters on one line
            
            /* TO DO - Reactivate and Revise */
            if (embedded()) {
                /*
                $(".horizontalFilters").append($(".customFilters"));
                $(".horizontalFilters").append($(".searchElements"));
                $(".horizontalFilters").append($(".searchField"));
                */
            }
        //}
        $('.showSearchClick').show();
        if (embedded()) {
            if (inIframe()) {
                // No longer needed. If using, needs title added. Appears in 3 dot menu.
                //$('.expandFromIFrame').show();
            } else if ($(".moduleJS").width() < $(window).width() || $(window).width() > 800) { // Need actual screen width here to truely omit on mobile.
                // Concept might be appropriate elsewhere (when not in an iFrame), but here it continues to show icon once expanded and icon spawns new tab.
                //$('.expandFromIFrame').show();
            }

            $('.modulePanels').append($('.accountPanel'));
            $('.modulePanels').append($('.settingsPanel'));

            $(".filterLabelMain").hide();
            $('.contentarea').hide(); // Hide Recycling logos
            $('.sectionTitle').hide(); // For COI
            $('.showSearchClick').trigger("click"); // For COI
            $('.searchHeader').show(); // For COI
            $('.hideEmbed').hide();
            if (params["navbymap"] == "1") {
                $('.tabSections').hide();
                $('.byMap').prepend($('.tabSections'));
                //$('.showLayers').trigger("click");
            }
        } else {
            $('.layerTitleLine').show();
            $('.navTopRight .hideFilters').hide();
            $('.showFilters').show();
            //$('.filterPanel').hide(); // No effect
        }

        if (!embedded()) { // Otherwise retain in mapBar.
            $(".burgerNavPosition").prepend($(".burgerNav"));
            $('.rightTopIconsRows').addClass('rightTopIconsAbsolute');
        }

        $(".navTopAlignment").removeClass("navTopAlignmentFull");
        $(".siteHeaderImage").show();
        //$(".siteHeaderSpacer").show();
        //$('#siteHeader').css("height",$('.sectionBarBkgd').height() + $('.navTop').height());
    }
}
function initEvents() { // Once included file1 is loaded.
    $(document).ready(function () {
        if(typeof Cookies!='undefined'){
            Cookies.remove('access_token'); // temp
            Cookies.remove('a_access_token'); // temp
            Cookies.remove('p_access_token'); // temp
            Cookies.remove('mode'); // temp
            if (Cookies.get('at_a')) {
                if (location.host.indexOf('localhost') >= 0) {
                    loadUserAccess(8); // Local access for dev links.
                } else {
                    loadUserAccess(5);
                }
            } else if (Cookies.get('at_f')) {
                loadUserAccess(1);
            } else {
                loadUserAccess(0);
            }
        }
        if (showLogin) {
            $(".showAccountTools").show();
        }
        // https://www.mapbox.com/mapbox.js/example/v1.0.0/layers/
        //addLayer(L.mapbox.tileLayer('mapbox.streets'), 'Base Map', 1);
        //addLayer(L.mapbox.tileLayer('examples.bike-lanes'), 'Bike Lanes', 2);
        //addLayer(L.mapbox.tileLayer('examples.bike-locations'), 'Bike Stations', 3);

        function addLayer(layer, name, zIndex) {
             layer
                .setZIndex(zIndex)
                .addTo(map);

            // Create a simple layer switcher that toggles layers on and off.
            var link = document.createElement('a');
                link.href = '#';
                link.className = 'active';
                link.innerHTML = name;

            link.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();

                if (map.hasLayer(layer)) {
                    map.removeLayer(layer);
                    this.className = '';
                } else {
                    map.addLayer(layer);
                    this.className = 'active';
                }
            };

            layers.appendChild(link);
        }

        var consoleTime = null;
        function timeStamp() {
            var mydate = new Date();
            if (consoleTime == null) {
                consoleTime = mydate;
            }
            
            var m = mydate.getMinutes() - consoleTime.getMinutes(),
                s = mydate.getSeconds() - consoleTime.getSeconds();
                //ms = mydate.getMilliseconds() - consoleTime.getMilliseconds();
                
            return (Math.abs(m) > 0 ? Math.abs(m) + ':' : '') + Math.abs(s) + ':' + Math.abs(mydate.getMilliseconds()) + ' - ';
            //return (mydate.getMinutes() + ':' + mydate.getSeconds() + ':' + mydate.getMilliseconds() + ' - ');
            
        }
        function geoSelected() {
            //$('#distanceField').insertAfter($('#distanceInNear'));
        }
        
        function filterULSelect(locationFilter) {
            // This function could eventually replace $(".filterUL li").click(function(e)

            $(".filterUL li").removeClass("selected");
            //$(this).addClass("selected");

            //$("#filterClickLocation .filterSelected").html($(this).text()).data('selected', $(this).data('id'));

            // Might not be in use anymore
            //$("#locationDD option[value='" + locationFilter + "']").prop("selected", true).trigger("change");
        }

        // EVENT HANDLERS - BUTTON CLICKS

        $('#keywordsTB').click(function(event) {
            //$("#filterClickLocation .filterBubbleHolder").hide();
            $("#showAdvanced").hide();
            $("#hideAdvanced").show();
            if (!$(".fieldSelector").is(':visible')) {
                $(".fieldSelector").show();
            } else {
                $(".fieldSelector").hide();
            }
        });
        $('#keywordsTB').keypress(function() {
            $(".fieldSelector").hide(); // Hide when typing
        });
        function hideFieldSelector() {
            $("#hideAdvanced").hide();
            $("#showAdvanced").show();
            $(".fieldSelector").hide();
            $('#keywordsTB').focus();
        }
        $('#hideAdvanced').click(function(event) {
            hideFieldSelector();
        });

        $('.expandFromIFrame').click(function(event) {
            //window.parent.location.href = window.location.href;

            // Open in new tab
            var win = window.open(window.location.href, '_blank');
            win.focus();
        });
         
        $('#keywordsTB').click(function(event) {
            $('.keywordBubble').show();
            event.stopPropagation(); // Prevent advanced from closing
        });
        if (location.host.indexOf('localhost') >= 0) {
            $('.sitesourceHolder').show();
        }
        if (embedded()) {
            $('.rightTopIconsRows').removeClass('rightTopIconsAbsolute');
            $(".threeDotNavClick").addClass("topButton");
            $(".threeDotNavClick").removeClass("threeDotNavClicksectionBar");
            $('.showEmbed').show();
            $(".burgerNav").css("float","right");

            $(".sectionBar").hide(); // No effect here, gets overriddend somewhere so also hidden above.
            $(".navTopAlignment").hide();
            
            //$("#siteHeader").hide();
            $(".siteHeaderSpacer").hide();
            $(".primaryHeader").hide();
        } else {
            $('.sitemodeHolder').show();
        }
        $('#hideHoneycomb').click(function(event) {
            $("#honeycombPanel").hide();
        });
        $('#findLocation').click(function(event) {
            if($('#findLocation').prop('checked')){
                $("#findLocationWith").show();
            } else {
                $("#findLocationWith").hide();
            }
        });
        $('.threeDotNavClick, .threeDotMobile').click(function(event) {

            if ($('.titleMenuHolder .toplevel').hasClass('open')) {
                $('.titleMenuHolder .burger').trigger("click");
            }
            if ($(".rightTopMenuInner").is(':visible')) {
                $(".rightTopMenu").hide();
            } else {        
                $(".floater").hide();
                $('.upperRightIcons').show();
                
                $(".navTopRight").show();
                $(".rightTopMenuInner").show();
                $(".appMenu").hide();

                // move topic menu beside right menu
                //$(".rightTopMenuLeft").append($(".layerPanel"));
            }
            event.stopPropagation();
        });

        // , .topTitleClick
        $('.backArrowClick, .topTitleClick').click(function() {
            $('.backArrowClick').hide();
            // TO DO: Clear cid here, also make 
            if ($(".contentButtonClick").is(':visible')) {
                $('.contentButton').trigger("click");
            } else {
                $('.showDirectory').trigger("click");
            }
            return;

            /*
            clearID('.backArrowClick');
            updateTheURL(""); // Remove cid

            $(".detailsPanel").hide();
            $(".listPanelRows").show();
            $(".moduleIntroHolder").show(); // For Film page
            $('.showDirectory').addClass('active');
            //if ($(".showSideList").is(':visible')) { // Avoiding, list does not show when initial loaded from cid.
                $('.showSideList').trigger("click");

                $(".besideLeftHolder").show();
                $(".listPanelHolder").show();
            //}
            $(".listingCaption").hide();
            $(".sectionCaption").show();

            // Restore to height held in data-height
            // Avoiding so page does not jump
            //$(".siteHeaderSpacer").css('height', $(".siteHeaderSpacer").data('height'));
            */
        });
        // $('.editRow').click was here

        $('.contactUs').click(function(event) {
            //window.location = "https://www.georgia.org/about-us/contact-us/";
            window.open('https://www.georgia.org/about-us/contact-us/','_blank');
            event.stopPropagation();
        });
        $('.addthis_button').click(function(event) {
            window.location = "https://www.addthis.com/bookmark.php?v=250&amp;pub=xa-4a9818987bca104e";
            event.stopPropagation();
        });

        /*
        function hideOtherPopOuts() {
            $('.accountPanelClose').trigger("click");
            hideSettings();
        }
        */
        //$(document).on("click", ".rightTopMenuInner>div", function(event) {
        function closeExpandedMenus() {
            $(".rightTopMenuInner>div").removeClass("active");
            $(event.currentTarget).addClass("active");
            $(".menuExpanded").hide(); // Hide any open
            //alert("rightTopMenuInner 3");
        }
        $(document).on("click", ".showSections", function(event) {
            closeExpandedMenus();
            //$('.menuExpanded').hide();
            $(".topicsPanel").show();
            //alert("showSections clicked2")
        });
        $(document).on("click", ".showSettings", function(event) {
            $('.menuExpanded').hide();
            //hideOtherPopOuts();
            //$("#showSettings").hide();
            //$(".showSettings").hide(); // If used, would need to redisplay after changning Style > Header Images
            //$(".showSettingsClick").hide();
            //$(".hideSettings").show();
            if ($(".settingsPanel").is(':visible')) { 
                hideSettings();
            } else {
                $(".settingsPanel").show();
                //$("#rightTopMenu").hide();
            }
            //event.stopPropagation();
        });
        $(document).on("click", ".hideSettings", function(event) {
            //hideSettings();
            $(".menuExpanded").hide(); // Hide any open
        });

        $(document).on("click", ".showPrintOptions, .print_button", function(event) {
        //$('.showPrintOptions, .print_button').click(function(event) {
            //alert("show print2")
            $('.menuExpanded').hide();
            $('.printOptionsText').show();
            $('.printOptionsHolderWide').show();
            event.stopPropagation();
        });

        $('.logoutAccount').click(function(event) {
            $('.accountSignout').trigger("click");
        });
        $('.showAccount').click(function(event) {
            if ($(".moduleJS").width() <= 800) { // Narrow
                $('.hideApps').trigger("click"); // For mobile
            }
            hideSettings();
            $(".smartPanel").show(); // Not sure why this is hidden. Wasn't occuring on localhost.
            //$(".showAccount").hide();
            //$(".hideAccount").show(); // hideAccount can be eliminated.

            $(".accountPanel").show();
        });
        $('.accountPanelClose').click(function(event) {
            //$(".hideAccount").hide();
            //$(".showAccount").show(); // Bug, this caused menu item to appear when closing settings.
            $(".accountPanel").hide();
        });

        $('#toggleDirectory').click(function(event) {
            toggleDirectory(); /* Resides in /maps */
        });

        $('.zoom-in').click(function(event) {
            alert("zoom-in");
            $('.leaflet-control-zoom-in').hide();
            $('.leaflet-control-zoom-in').trigger("click");
        });
        $('.zoom-out').click(function(event) {
            alert("zoom-out");
            $('.leaflet-control-zoom-out').trigger("click");
        });

        $('.hideList, .hideLegend, .hideLayers').click(function(event) {
            $("#mapTabsPanel").removeClass("rightPercent");
            hideList();
        });

        $('.hideList').click(function(event) {
            //$('.listPanelRows').hide();
            //$('.listHeader').hide();
            //$('.hideList').hide(); // When deleting this line, also delete .hideList show lines.
            $('.showList').show(); // Button
            hideGrid();
            $('.hideDirectory').trigger("click");
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
        $('.toggleListFormats').click(function(event) {
            if ($('.toggleListFormats').hasClass("expand")) {
                $('.toggleListFormats').removeClass("expand");
                $('.listFormats').hide();
            } else {
                $('.toggleListFormats').addClass("expand");
                $('.listFormats').show();
            }
            event.stopPropagation();
        });
        $('.showSideList').click(function(event) {
            //$('html,body').animate({ scrollTop: 0 });
            $('.listPanel').insertAfter($('.listPanelPosition'));
            $('.showDirectory').removeClass("active");
            $('.showDirectory').trigger("click");
            $(".listPanelHolder").show();
            $('.listTable').addClass('listTableMaxHeight');
            $('.bottomButtonHolder').show();
        });

        /*
            $('.showAll').trigger("click"); // Removes selected cid. Triggers search submit.

            $('.primaryRows').css('max-height','auto');
            $(".listPanelHolder").show(); // Was $(".listPanel").show();
            $('.besideLeftHolder').hide();

            $('.toggleListFormats').removeClass("expand");
            $('.listFormats').hide();

            $('.showList').hide();
            $('.hideList').show();
            $('.showDirectory').removeClass("active");
            $('.listFormats').hide();
        */

        function makeListFullPage() {
            $('.showSideList').show();
            $('.primaryRows').css('max-height','auto');
            $('.gridPanelHolder').removeClass('gridPanelHolderMaxHeight');

            //$('#gridTable_body').css('overflow-y','auto'); // Turn off scrolling
            $('#gridTable_body').removeClass('gridTableYScroll');

            //$(".listPanelHolder").show();
            $('.besideLeftHolder').hide();
            $(".listPanelHolder").hide();

            // Close
            $('.toggleListFormats').removeClass("expand");
            $('.listFormats').hide();

            $('.showList').hide();
            $('.hideList').show();
            $('.showDirectory').removeClass("active");
            $('.listFormats').hide();
            if ($(".moduleJS").width() > 800) {
                $('html,body').animate({
                    scrollTop: $(".listPanel").offset().top - $("#siteHeader").height()
                });
            }
            if (map) {
                map.invalidateSize(); // Force Leaflet map to resize when list is removed - Add tiles when more of map becomes visible.
            }
        }

        $('.moveListAbove').click(function(event) {
            $('.showAll').trigger("click"); // Removes selected cid. Triggers search submit.
            $('.beforeMap').append($('.listPanel'));
            makeListFullPage();
            $('.moveListAbove').hide();
            $('.moveListBelow').show();
            $('.moveListBeside').show();
            $('.showSideList').show();
            $('.listTable').removeClass('listTableMaxHeight');
            event.stopPropagation();
        });

        $('.moveListBelow, .moveListBelowButton').click(function(event) {
            $('.showAll').trigger("click"); // Removes selected cid. Triggers search submit.
            $('.afterMap').append($('.listPanel'));
            makeListFullPage();
            $('.moveListAbove').show();
            $('.moveListBeside').show();
            $('.bottomButtonHolder').hide();
            $('.listTable').removeClass('listTableMaxHeight');
            $(".listPanelHolder").hide();
            $(".layoutTab").removeClass("active");
            $('.overviewMapButton').addClass("active");
            setTimeout(function(){ // Allow for append time
                $('.moveListBelow').hide();
            }, 200);
            event.stopPropagation();
        });

        $('.moveListBeside').click(function(event) {
            $('.listPanel').insertAfter($('.listPanelPosition'));
            $(".listPanelHolder").show();
            $('.besideLeftHolder').show();
            $('.moveListBeside').hide();
            $('.moveListAbove').show();
            $('.moveListBelow').show();
            $('.showList').hide();
            $('.hideList').show();
            $('.toggleListFormats').removeClass("expand");
            $('.listFormats').hide();
            $('.listTable').addClass('listTableMaxHeight');
            event.stopPropagation();
        });
        $('.printPage').click(function(event) {

            var allowTime = 0;
            if ($('#printmap').is(':checked')) {
                $('#map').css('max-height','580px'); // Prevents bottom of map appearing on next page.
                $('.moduleJS .listHeader').css('position','relative'); // Fixes bug because .listHeaderOffset is not holding space.
                $('.moduleJS .listHeaderOffset').hide();
                // Todo: store existing position and restore below.

                $('.overviewMapButton').trigger("click");
                $('.moveListBelow').trigger("click");
                $('.afterMap').removeClass('hidePrint');
                $('.panelMinHeightHolder').removeClass('hidePrint'); // Show map
                $('.listPanelInner').removeClass('listPanelInnerBorderRight');
                allowTime += 500;
                if ($('#landscape').is(':checked') && $('#printcontent').is(':checked')) {
                    $('.addPrintBreakWhenMap').addClass('pageBreakForMap'); // For GDX
                } else {
                    $('.addPrintBreakWhenMap').removeClass('pageBreakForMap'); // For GDX
                }
            } else {
                if (!$('#printcontent').is(':checked')) {
                    $('.panelMinHeightHolder').addClass('hidePrint'); // Hide filters and map
                }
            }
            if ($('#printlist').is(':checked')) {

                $('.moveListBelow').trigger("click");

                allowTime += 500;

                $('.afterMap').removeClass('hidePrint'); // Show list if previously hidden.
            
                $('.listPanelInner').removeClass('listPanelInnerBorderRight');
            } else {
                $('.moveListBelow').trigger("click");
                $('.afterMap').addClass('hidePrint'); // Hide list
            }
            if ($('#printcontent').is(':checked')) {
                if ($(".moduleContent").html().length > 0) {
                    $('.moduleContent').removeClass('hidePrint');
                    $(".moduleContent").show();
                    if ($('#printmap').is(':checked')) {
                        allowTime += 1000; // Add extra time for map points to load.
                    }
                }
            } else {
                $('.moduleContent').addClass('hidePrint'); // Hide content
            }
            if ($('#printgrid').is(':checked')) {
                //$(".moduleContent").hide();
                $('.showGrid').trigger("click");
                if ($('#printmap').is(':checked')) {
                    $('.addPrintBreakWhenMap').addClass('pageBreakForMap');
                }
            }
            var size = "portrait";
            if ($('#landscape').is(':checked')) {
                size = "landscape";
            }
            printOrientation(size);
            
            if (allowTime > 0) { 
                setTimeout(function(){ // Allow time for map to resize and map points to reappear.
                    window.print();
                }, allowTime);
            } else {
                window.print();
            }

            $('.moduleContent').removeClass('hidePrint');
        });

        function printOrientation(size) {
            // size: auto;
            // size: portrait;
            // size: landscape;

            var css = '@page { size: ' + size + '; }',
            head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

            style.type = 'text/css';
            style.media = 'print';

            if (style.styleSheet){
              style.styleSheet.cssText = css;
            } else {
              style.appendChild(document.createTextNode(css));
            }
            head.appendChild(style);
        }

        // Adjust if switching back to async county load.
        $('.countyList :checkbox').change(function () {
            $('#goSearch').trigger("click");
        });

        $('.showCounties').click(function(event) { // Not available to countyText click
            if ($(".countyList").is(':visible')) {
                $(".showCounties").removeClass("active");
                closeMenu();
            } else {
                $(".layoutTab").removeClass("active");
                $('.showCounties').addClass("active");
                showCounties();
            }
        });
        $('.showOutlines').click(function(event) {
            $('.showOutlines').hide();
            $('.hideOutlines').show();
            countyMap();
        });

        $('.showLegend').click(function(event) {

            deselectMenusAndTabs();
            mapbuttonsNeutral();
            $('.showLegend').hide();
            $('.hideLegend').show();
            $('.hideLayers').hide();
            $('.showLayersTab').show();

            // BUGBUG - Need to check for map to load

            // Move legend into tabs
            //$("div.cartodb-legend-stack").addClass("cartodb-legend-stack-move");
            //$('div.cartodb-legend-stack').insertAfter($('#cartodb-legend-stack-position'));
            
            //$('div.cartodb-legend-stack').show();

        });


        $('.expandFromWidget').click(function(event) {
            $('.expandFromWidget').hide();
            // Same as expandFromIFrame()
            // Open in new tab
            var win = window.open(window.location.href.replace("/widget.html","/../directory/").replace("/widget-local.html","/../directory/"), '_blank');
            win.focus();       
        });

        $('.showVideo').click(function(event) {
            setTimeout(function(){ // After shown by changeLayer
                //$('.hideLayers').trigger("click");
            }, 100);
            event.stopPropagation();
        });
        
        $('.showImages').click(function(event) {
            $('.revealImage').trigger("click");
            $(".captionPanel").hide();
            if ($(".moduleJS").width() <= 800) { // Narrow
                $('html,body').animate({
                    scrollTop: 0
                });
            }
            event.stopPropagation();
        });

        /*
        // showOverlays ?
        $('.showLayers, .sectionTitle, .showLayersTab, .navTopTitle, .forwardArrowInBar').click(function(event) {
            if ($(".tabSections").is(':visible')) {
            } else {
            }
        });
        */
        $('.showLayers').click(function(event) {
            if ($(".overlaysInSide").is(':visible')) {
                $('.overlaysInSide').hide();
            } else {
                $('.overlaysInSide').show();
            }
        });

        $('.sectionProviderTitle').click(function(event) {
            //might be used to load layer list into header.
            
           
        });
        $('.hideLayers').click(function(event) { // X on layers box.
            $('.hideLayers').hide();
            $('.hideAllSections').hide();
            $('.showLayerMenuButton').show(); $('.showSectionMenu').css("margin-left", "0px");
            $('.hideLayerMenuButton').hide();
            $('.showLayers').show();
            $('.leftPop').hide();
            $('.showLegend').hide();
            $(".navTopLeftWidth").removeClass('navTopLeftWidthWide');
            $(".appMenuList").hide();
            $('.showLayersMapBar').show();
            //$('div.cartodb-legend-stack').insertAfter($('.cartodb-tooltip'));
            //$('div.cartodb-legend-stack').removeClass("cartodb-legend-stack-move");
            //$('.cartodb-legend-stack').show();
            //$(".layerContent").css('overflow', 'visible');
            $(".navTopTitleText").css("padding-left","3px")
        });


        $('#addLayer').click(function(event) {
            alert("Not yet implemented.");
        });

        function hideExtrasPanel() {

        }

         // EVENT HANDLERS - FILTERS
        $("#filterClickCategory").click(function(event) {
            $("#filterClickLocation .filterBubbleHolder").hide();
            $("#filterClickCategory .filterBubbleHolder").toggle();
            event.stopPropagation();
        });
        $("#filterClickLocation").click(function(event) {
            //$('.hideMetaMenuClick').trigger("click"); // Otherwise covers location popup. Problem: hides hideLayers/hideLocationsMenu.
            if ($("#showLocations").is(':visible')) {
                hideFieldSelector();
                $("#showLocations").hide();
                $("#hideLocations").show();
            } else {
                $("#showLocations").show();
                $("#hideLocations").hide();
            }
            $("#filterClickLocation .filterBubbleHolder").toggle();

            //$("#filterClickCategory .filterBubbleHolder").hide();
            
            // TO DO: Display cities, etc. somehow without clicking submenu.
            // 
            event.stopPropagation();
        });

        $(".filterBubbleHolder").click(function(e) {
            e.stopPropagation(); // Prevent bubble from closing
         });
        
        $(".filterUL li").click(function(e) {
            $(".filterBubbleHolder").hide();
            e.preventDefault();
            $(".filterUL li").removeClass("selected");
            $(this).addClass("selected");
            //$(".filterSelected").html($(this).text() + '<i class="entypo-down-open" style="font-size:13pt"></i>');
            $("#filterClickLocation .filterSelected").html($(this).text()).data('selected', $(this).data('id'));
            $("#locationDD option[value='" + $(this).data('id') + "']").prop("selected", true).trigger("change");
            
            $("#locationStatus").hide();

            consoleLog("Call locationFilterChange from .filterUL li click: " + $(this).data('id'));
            locationFilterChange($(this).data('id'));
            e.stopPropagation(); // Prevents click on containing #filterClickLocation.
         });

        $(".showMultiselect").click(function(event) {
            $(".showMultiselect").hide();
            $(".hideMultiselect").show();
            $(".iconCheckbox").show();
            $('.showCats').trigger("click");
            $("#sectionCategories .sectionCat input").show();
            event.stopPropagation();
        });
        $(".hideMultiselect").click(function(event) {
            $(".hideMultiselect").hide();
            $(".showMultiselect").show();
            $(".iconCheckbox").hide();
            $('.showCats').trigger("click");
            $("#sectionCategories .sectionCat input").hide();
            event.stopPropagation();
        });
        $(".showEmbedTag").click(function(event) {
            var win = window.open('widget.html#aerospace', 'widget_window');
            if(win){
                //Browser has allowed it to be opened
                win.focus();
            }else{
                //Broswer has blocked it
                alert('Please allow popups for this site.');
            }
            return;
            if (!$(".embedTag").is(':visible')) {
                $(".embedTag").show();
            } else {
                $(".embedTag").hide();
            }
        });
        $("#sectionCategories").click(function(event) {
            event.stopPropagation();
        });
        $('.filterUL [data-id="counties"]').click(function(event) {
            $('.showCountiesTab').trigger("click");
        });

        $( "#bt" ).change(function() {
            setButtonDisplay($("#bt").val());
            Cookies.set('bt', $("#bt").val());
        });

        // HIDE MENUS WHEN CLICKING ELSEWHERE.  WHEN NO MENUS OPEN, HIDE ENTIRE CONTENT AREA.
        //  .moduleCenter prevents map point click, so we turn off event.stopPropagation();
        // BUG .moduleBackground, here causes heroImage to be clicked twice, shrinking newly expanded.
        $(".heroImage, .moduleCenter, .sectionBar, .carouselHolder, .moduleVideo").click(function(event) {
            consoleLog("Clicked: " + event.target.id+", Class: "+$(event.target).attr('class'));
            //alert("Clicked: " + event.target.id+", Class: "+$(event.target).attr('class'));
            $('.mobileTitle').show();
            if ($(".floater").is(':visible')) {
                $(".floater").hide(); // Hide open menus
                $('.mobileTitle').show(); // No reached, hence the line several above.
                return;
            }
            if ($(".layerContent").is(':visible')) {
                // || $(event.target).attr('class') == "video-thumb"

                if ($(event.target).attr('class') == "owl-lazy showListingDetails") {
                    
                    if ($('.carouselHolder').height() != $(".siteHeaderSpacer").height()) {
                        $(".siteHeaderSpacer").css('height', $('.carouselHolder').height());
                        repositionDots();
                        $(".headerHolderRollover").hide();
                    } else {
                        //alert("$(window).scrollTop()  " + $(window).scrollTop())
                        if ($(window).scrollTop() >= 350) {
                            // Display big image by scrolling down
                            consoleLog("scroll down. Current moduleJS offset " + $(".moduleJS").offset().top);
                            $('html,body').animate({
                                scrollTop: 0
                            });
                        } else { // Return details to top
                            // TO DO: If click is on left or right side, pan carousel.

                            consoleLog("scroll up. Current moduleJS offset " + $(".moduleJS").offset().top);
                            var topOffset = 350;
                            if (1==2) {
                                topOffset = 42;
                            }
                            $('html,body').animate({
                                scrollTop: $(".moduleCenter").offset().top - topOffset
                            });
                        }
                    }
                }
                if ($(event.target).attr('class') == "heroImage") {
                    //alert("1234")
                    toggleHeaderView();
                }
                
                // Hide little menus.
                $(".filterBubbleHolder").hide();
                $(".floatBox").hide();
                $(".listOptions").hide(); $('.toggleListOptions').removeClass("expand");
                $(".listFormats").hide(); $('.toggleListFormats').removeClass("expand");
                $(".leftPop").hide();
                $(".upperRightIcons").hide();
                $(".rightTopMenu").hide();
                $(".appMenu").hide();
                $(".appMenuList").hide();
                $(".settingsPanel").hide(); // Need to adjust for dropdown changes.
                $(".footerlogos").hide(); // Contains logos by footer
                $('.threeDotNavClick').show();
                $("#rowsIcons").hide();
            } else {
                consoleLog('data-margin-top ' + $('.heroImage').attr('data-margin-top'))
                $('.heroImage').css('margin-top',$('.heroImage').attr('data-margin-top'));
                showContent();
            }
            // Avoid with .moduleCenter click so clicks reach map points.
            //event.stopPropagation();
        });
        $('.hideAll').click(function(event) {
            toggleHeaderView();
            $(".listOptions").hide(); $('.toggleListOptions').removeClass("expand");
            event.stopPropagation();
        });
        $('.revealImage').click(function(event) {
            if ($('.showImages').is(':visible')) {
                $(".horizontalButtons .layoutTab").removeClass("active");
                $('.showImages').addClass("active");
            }
            $(".listOptions").hide(); $('.toggleListOptions').removeClass("expand");

            $(".hideInfoLink").hide();
            //$(".showInfo").show(); // Shows .showInfoLink and .showInfoButton

            if ($('.carouselHolder').height() > 0) {
                $(".siteHeaderSpacer").css('height', $('.carouselHolder').height());
            } else {
                $(".siteHeaderSpacer").css('height', $('.heroImageScroll').height());
            }
            $('.revealImage').hide();
            $('.reduceHeader').show();
            $(".toggleArrow").html("&#xE5C7;");
            repositionDots();

            $('html,body').animate({
                scrollTop: 0
            });
            event.stopPropagation();
        });
        $('.reduceHeader').click(function(event) {
            $(".siteHeaderSpacer").css('height', 0);
            $(".captionPanel").hide();
            $('.reduceHeader').hide();
            $('.revealImage').show();
            $(".toggleArrow").html("&#xE5C5;");
            $('html,body').animate({
                scrollTop: 0
            });
        });
        $('.layerContentHide').click(function(event) {
            //toggleHeaderView();
        });
        function showContent() {
            $('.showListingDetails').trigger("click");
            $(".heroright").show();
        }
        
        $(".rightTopItem").click(function(event) {
            $(".upperRightIcons").hide();
            $(".rightTopMenu").hide();
        });
        $("#filterPanel").click(function () { // Since clickThrough is blocked to prevent clicking video.

              //hideFieldSelector();
              $(".filterBubbleHolder").hide();
            
        });
        $(window).on('hashchange', function() { // Refresh param values when user changes URL after #.
            param = loadParams(location.search,location.hash);    
        });
    });
}