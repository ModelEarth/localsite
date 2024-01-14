// Site specific settings
// Maintained in localsite/js/navigation.js
//alert("navigation.js param.state " + param.state);
var navigationJsLoaded = "true";
if(typeof page_scripts == 'undefined') {  // Wraps script below to insure navigation.js is only loaded once.
if(typeof localObject == 'undefined') { var localObject = {};}
if(typeof localObject.layers == 'undefined') {
    localObject.layers = {}; // Holds layers.
}
const page_scripts = document.getElementsByTagName("script");
const current_code_path = page_scripts[page_scripts.length-1].src;
console.log("current_code_path " + current_code_path);
const slash_count = (current_code_path.match(/\//g) || []).length; // To set path to header.html
let earthFooter = false;
let showLeftIcon = false;
if(typeof param=='undefined'){ var param={}; }

if (window.location.protocol != 'https:' && location.host.indexOf('localhost') < 0) {
	location.href = location.href.replace("http://", "https://");
}
// Get the levels below root
var foldercount = (location.pathname.split('/').length - 1); // - (location.pathname[location.pathname.length - 1] == '/' ? 1 : 0) // Removed because ending with slash or filename does not effect levels. Increased -1 to -2.
foldercount = foldercount - 2;
var climbcount = foldercount;
if(location.host.indexOf('localhost') >= 0) {
	//climbcount = foldercount - 0;
}
var climbpath = "";
for (var i = 0; i < climbcount; i++) {
	climbpath += "../";
}
if (climbpath == "") {
	//climbpath += "./"; // Eliminates ? portion of URL
	console.log("climbpath = '', set to '../'")
	climbpath += "../";
}
//console.log("climbpath " + climbpath);

const changeFavicon = link => {
  let $favicon = document.querySelector('link[rel="icon"]')
  // If a <link rel="icon"> element already exists,
  // change its href to the given link.
  if ($favicon !== null) {
    $favicon.href = link
  	// Otherwise, create a new element and append it to <head>.
  } else {
    $favicon = document.createElement("link")
    $favicon.rel = "icon"
    $favicon.href = link
    document.head.appendChild($favicon)
  }
}


var modelpath = climbpath;
if (modelpath == "./") {
	//modelpath = "";
}
var modelroot = ""; // For links that start with /

if(location.host.indexOf('localhost') < 0 && location.host.indexOf('model.') < 0 && location.host.indexOf('neighborhood.org') < 0) { // When not localhost or other site that has a fork of io and community.
	// To do: allow "Input-Output Map" link in footer to remain relative.
	modelpath = "https://model.earth/" + modelpath; // Avoid - gets applied to #headerSiteTitle and hamburger menu
	modelroot = "https://model.earth";
}
console.log("modelpath " + modelpath);

// INIT
applyNavigation();
hashChangedNavigation();

document.addEventListener('hashChangeEvent', function (elem) {
	console.log("navigation.js detects URL hashChangeEvent");
 	hashChangedNavigation();
}, false);

function hashChangedNavigation() {
	// More hashChange events reside in map-filters.js
	let hash = getHash();

	// Also used for state change in apps without map which don't have geoview
	if (hash.state != priorHash.state) {
		// Load state hero graphic
        let theStateName; // Full name of state.
        let theStateNameLowercase;
        let imageUrl;
        let stateAbbrev = hash.state.split(",")[0].toUpperCase();
        waitForElm('#state_select').then((elm) => {
            $("#state_select").val(stateAbbrev);
            if ($("#state_select").find(":selected").val()) { // Omits top which has no text
                theStateName = $("#state_select").find(":selected").text();
                //theState = $("#state_select").find(":selected").val();
            }
            if (theStateName && theStateName.length > 0) {
                theStateNameLowercase = theStateName.toLowerCase();
                imageUrl = "https://model.earth/us-states/images/backgrounds/1280x720/landscape/" + theStateNameLowercase.replace(/\s+/g, '-') + ".jpg";
                if (theStateNameLowercase == "georgia") {
                	imageUrl = "/apps/img/hero/state/GA/GA-hero.jpg";
                }
                if (theStateName.length == 0) {
                	imageUrl = "/apps/img/hero/state/GA/GA-hero.jpg";
                }
            } else {
                imageUrl = "/apps/img/hero/state/GA/GA-hero.jpg";
            }
            let imageUrl_scr = "url(" + imageUrl + ")";
            //alert("imageUrl_scr  " + imageUrl_scr)
            $("#hero-landscape-image").css('background-image', imageUrl_scr);
        });
    }
    if (hash.show != priorHash.show) {
    	let show = hash.show;
    	if (!hash.show) {
    		show = "industries";
    	}
		//if (activeLayer) {
			$(".bigThumbMenuContent").removeClass("bigThumbActive");
	    	$(".bigThumbMenuContent[show='" + show +"']").addClass("bigThumbActive");
	    	let activeTitle = $(".bigThumbMenuContent[show='" + show +"'] .bigThumbText").text();
	    	$("#showAppsText").attr("title",activeTitle);
	    //}
	}
	if (hash.appview != priorHash.appview) {
		//alert("appview change")
        if (hash.appview) {
            console.log("hash.appview exists: " + hash.appview);
            //navigationJsLoaded
            waitForVariable('navigationJsLoaded', function() {
                showApps("#bigThumbMenu");
            });
        } else {
            closeAppsMenu();
        }
    }
}

// Not in use, but might be cool to use
function displayHexagonMenu(layerName, localObject) {

  var currentAccess = 0;
  consoleLog("Display HEXAGON MENU");

  $("#honeycombMenu").html(""); // Clear prior
  $("#honeycombPanel").show();
  var thelayers = localObject.layers;
  //console.log(thelayers);
  var sectionMenu = "";
  var categoryMenu = "";
  //var iconMenu = "";
  var layer;
  for(layer in thelayers) {

        var menuaccess = 10; // no one
        menuaccess = 0; //Temp
        try { // For IE error. Might not be necessary.
            if (typeof(localObject.layers[layer].menuaccess) === "undefined") {
                menuaccess = 0;
            } else {
                menuaccess = localObject.layers[layer].menuaccess;
            }
        } catch(e) {
            consoleLog("displayLayerCheckboxes: no menuaccess");
        }
        if (access(currentAccess,menuaccess)) {
            if (localObject.layers[layer].menulevel == "1") {
            //var layerTitleAndArrow = (thelayers[layer].navtitle ? thelayers[layer].navtitle : thelayers[layer].title);
            var layerTitleAndArrow = thelayers[layer].section;
                var icon = (thelayers[layer].icon ? thelayers[layer].icon : '<i class="material-icons">&#xE880;</i>');
             if (thelayers[layer].item != "main" && thelayers[layer].section != "Admin" && thelayers[layer].title != "") {
                // <h1 class='honeyTitle'>" + thelayers[layer].provider + "</h1>
                sectionMenu += "<li class='hex'><a class='hexIn hash-changer' href='#" + thelayers[layer].item + "'><img src='" + removeFrontFolder(thelayers[layer].image) + "' alt='' /> <p class='honeySubtitle'>" + layerTitleAndArrow + "</p></a></li>";
                }
            }
        }
  }
  $("#honeycombMenu").append("<ul id='hexGrid'>" + sectionMenu + "</ul>"); // Resides in template-main.html
  $("#bigThumbPanelHolder").show();
  //$("#iconMenu").append(iconMenu);
    $("#honeyMenuHolder").show();
}
function thumbClick(show,path) {
    let hash = getHashOnly(); // Not hiddenhash
	let priorShow = hash.show;
	hash.show = show;
	if (!hash.state && param.state) {
		hash.state = param.state; // At least until states are pulled from geo values.
	}
	delete hash.cat;
	delete hash.naics;
	delete hash.name;
	delete hash.details;
	delete hash.m; // Birdseye view
    let pageContainsInfoWidgets = false;
    if ($("#iogrid").length >= 0 || $("#sector-list").length >= 0) {
        pageContainsInfoWidgets = true; // Stay on the current page if it contains widgets.
    }
    // !pageContainsInfoWidgets && // Prevented bioeconomy from leaving map page.
	if (path && !window.location.pathname.includes(path)) {
        // Leave current page
		var hashString = decodeURIComponent($.param(hash));
		window.location = "/localsite/" + path + "#" + hashString;
	} else { // Remain in current page
		if (show != priorShow) {
	        delete hiddenhash.show;
	        delete hiddenhash.naics;
	        delete param.show;
	        if (typeof params != 'undefined') {
	            delete params.show;
	        }
	    }
	    $(".bigThumbMenuContent").removeClass("bigThumbActive");
		$(".bigThumbMenuContent[show='" + show +"']").addClass("bigThumbActive");
        console.log(hash);
		goHash(hash,"name,loc"); // Remove name and loc (loc is not used yet)
	}
}

function showSideTabs() {
	console.log("showSideTabs()");
	if(location.href.indexOf("/seasons") >= 0) {
		closeExpandedMenus(".showStories");
		$("#storiesPanel").show();
	} else {
		// check #topicsMenu
		if (location.host.indexOf('localhost') >= 0) {
	      //alert("LOCAL: ");
	    }
	    /*
	    //if (!hash.geoview) {
        	closeExpandedMenus($(".showSections")); // Close all sidetab's prior to opening new tab
        //}
        $("#topicsPanel").show();
        */
	}
	$('body').addClass('bodyRightMargin'); // Creates margin on right for fixed sidetabs.
	$('body').addClass('mobileView');
	$("#sideTabs").show();
	$("#showSideTabs").hide();
	$("#hideMenu").show();
}
function closeExpandedMenus(menuClicked) {
    $(".rightTopMenuInner div").removeClass("active");
    $(menuClicked).addClass("active");
    $(".menuExpanded").hide(); // Hide any open
    //alert("rightTopMenuInner 3");
}
function showNavColumn() {
	console.log("showNavColumn");
	$("#sideIcons").hide();
	$("#navcolumn").show(); $("#showSideInBar").hide();
	if ($("#fullcolumn > .datascape").is(":visible")) { // When NOT embedded.
		if ($("#listcolumn").is(":visible")) {
			$('body').addClass('bodyLeftMarginFull'); // Creates margin on left for both fixed side columns.
			$('#listcolumn').removeClass('listcolumnOnly');
		}
	}
	$("#showSideInBar").hide();
	if(document.getElementById("containerLayout") != null) {
		$('#navcolumn').addClass("navcolumnClear");
		$('body').addClass('bodyLeftMarginNone');
	} else {
		$("#fullcolumn #showNavColumn").hide();
		$('body').addClass('bodyLeftMargin'); // Margin on left for fixed nav column.
		$('body').addClass('mobileView');

		// Refreshs to load map tiles. Worked at one point.
		// Maybe vars map1 and map2 need to be called directly? They are now declaired universally.
		// Test is we need this with mobile.
		if (document.querySelector('#map1')._leaflet_map) {
			document.querySelector('#map1')._leaflet_map.invalidateSize(); // Refresh map tiles.
		}
		if (document.querySelector('#map2')._leaflet_map) {
			document.querySelector('#map2')._leaflet_map.invalidateSize(); // Refresh map tiles.
		}
	}
}
function applyNavigation() { // Called by localsite.js so local_app path is available.
	// To do: fetch the existing background-image.
	console.log("location.host: " + location.host + " " + location.host.indexOf("locations.pages.dev"));
	let hash = getHash();
	if (location.href.indexOf("dreamstudio") >= 0 || param.startTitle == "DreamStudio" || location.href.indexOf("/swarm/") >= 0) {
		localsiteTitle = "DreamStudio";
		$(".siteTitleShort").text("DreamStudio");
		param.titleArray = [];
		//param.headerLogo = "<a href='https://dreamstudio.com'><img src='https://dreamstudio.com/dreamstudio/img/logo/dreamstudio-text.png' style='height:23px'></a>";
		
		let siteRoot = "";
		if (location.host.indexOf("localhost") >= 0) {
			siteRoot = "/dreamstudio";
		}
		param.headerLogo = "<a href='" + siteRoot + "/'><img src='/storyboard/img/logo/ds/favicon.png' style='float:left;width:38px;margin-right:7px'><img src='/storyboard/img/logo/ds/dreamstudio-text.png' alt='DreamStudio' style='height:22px; margin-top:9px' class='headerLogoDesktop'></a>";
		param.headerLogoNoText = "<img src='/storyboard/img/logo/ds/favicon.png' style='float:left;width:38px;margin-right:7px'>";
		if (location.host.indexOf("dreamstudio") >= 0) {
			//param.headerLogo = param.headerLogo.replace(/\/dreamstudio\//g,"\/");
		}
		changeFavicon("/localsite/img/logo/apps/dreamstudio.png");
		showClassInline(".dreamstudio");
		if (location.host.indexOf('localhost') >= 0) {
			//showClassInline(".earth");
		}
	// 
	} else if (defaultState == "GA" && !Array.isArray(param.titleArray) && (location.host.indexOf('localhost') >= 0 && navigator && navigator.brave) || param.startTitle == "Georgia.org" || location.host.indexOf("georgia") >= 0 || location.host.indexOf("locations.pages.dev") >= 0) {
		// The localsite repo is open to use by any state or country.
		// Georgia Economic Development has been a primary contributor.
		// Show locally for Brave Browser only - insert before:  ) || false
		// && navigator && navigator.brave
		if (!param.state && !hash.state) {
			if (param.geoview != "earth") {
				if (onlineApp && defaultState) {
					param.state = defaultState; // For longer displayBigThumbnails menu in map-filters.js
				}
			}
		}
		showLeftIcon = true;
		$(".siteTitleShort").text("Model Georgia");
		param.titleArray = [];
		console.log("local_app.localsite_root() " + local_app.localsite_root()); // https://model.earth was in here: https://map.georgia.org/localsite/map/#show=recyclers
		param.headerLogo = "<a href='https://georgia.org'><img src='/localsite/img/logo/states/GA.png' style='width:140px;padding-top:4px'></a>";
		param.headerLogoNoText = "<a href='https://georgia.org'><img src='/localsite/img/logo/states/GA-notext.png' style='width:50px;padding-top:0px;margin-top:-1px'></a>";
		localsiteTitle = "Georgia.org";
		changeFavicon("/localsite/img/logo/states/GA-favicon.png");
		if (location.host.indexOf('localhost') >= 0 || location.host.indexOf("locations.pages.dev") >= 0 || location.host.indexOf("locations.georgia.org") >= 0) {
			showClassInline(".acct");
			showClassInline(".garesource");
		}
		showClassInline(".georgia");
		if (location.host.indexOf("locations.pages.dev") >= 0 || location.host.indexOf("locations.georgia.org") >= 0) {
			showClassInline(".earth");
		}
		$('#headerOffset').css('display', 'block'); // Show under site's Drupal header

		earthFooter = true;

	} else if (!Array.isArray(param.titleArray) && (param.startTitle == "Neighborhood.org" || location.host.indexOf('neighborhood.org') >= 0)) {
		showLeftIcon = true;
		$(".siteTitleShort").text("Neighborhood Modeling");
		param.titleArray = ["neighbor","hood"]
		param.headerLogoSmall = "<img src='/localsite/img/logo/apps/neighborhood.png' style='width:40px;opacity:0.7'>"
		localsiteTitle = "Neighborhood.org";
		changeFavicon("/localsite/img/logo/apps/neighborhood.png")
		showClassInline(".neighborhood");
		earthFooter = true;
	} else if (!Array.isArray(param.titleArray) && (location.host.indexOf("democracy.lab") >= 0)) {
		showLeftIcon = true;
		$(".siteTitleShort").text("Democracy Lab");

		param.headerLogo = "<img src='/localsite/img/logo/partners/democracy-lab.png' style='width:190px;margin-top:15px'>";
		param.headerLogoSmall = "<img src='/localsite/img/logo/partners/democracy-lab-icon.jpg' style='width:32px;margin:4px 8px 0 0'>";
		showClassInline(".dlab'");
		earthFooter = true;
	} else if (!Array.isArray(param.titleArray) && !param.headerLogo) {
	//} else if (location.host.indexOf('model.earth') >= 0) {
		showLeftIcon = true;
		if (location.host.indexOf("planet.live") >= 0) {
			$(".siteTitleShort").text("Planet Live");
			param.titleArray = ["planet","live"]
			localsiteTitle = "Planet Live";
		} else {
			$(".siteTitleShort").text("Model Earth");
			param.titleArray = ["model","earth"]
			localsiteTitle = "Model Earth";
		}
		param.headerLogoSmall = "<img src='/localsite/img/logo/earth/model-earth.png' style='width:34px; margin-right:2px'>";
		changeFavicon(modelpath + "../localsite/img/logo/earth/model-earth.png")
		showClassInline(".earth");
		console.log(".earth display");
		earthFooter = true;
	}

	if (document.title) {
 		document.title = localsiteTitle + " - " + document.title;
 	} else {
 		document.title = localsiteTitle;
 	}

	if (location.host.indexOf('model.earth') >= 0) { // Since above might not be detecting model.earth, probably is now.
		showLeftIcon = true;
		earthFooter = true;
	}

	if (param.footer || param.showfooter == false) {
		earthFooter = false;
		console.log("param.footer " + param.footer);
	}
	// Load when body div becomes available, faster than waiting for all DOM .js files to load.
   	waitForElm('#bodyloaded').then((elm) => {
	 	$("body").wrapInner( "<div id='fullcolumn'></div>"); // Creates space for navcolumn
	 	
	 	
	 	$("body").addClass("flexbody"); // For footer to stick at bottom on short pages
	 	$("body").wrapInner("<main class='flexmain' style='position:relative'></main>"); // To stick footer to bottom
	 	// min-height allows header to serve as #filterbaroffset when header.html not loaded
	 	// pointer-events:none; // Avoid because sub-divs inherite and settings dropdowns are then not clickable.
	 	if(document.getElementById("datascape") == null) {
			$("#fullcolumn").prepend("<div id='datascape' class='datascape'></div>\r");
		}
 	});
	waitForElm('#datascape').then((elm) => {
		let listColumnElement = "<div id='listcolumn' class='listcolumn pagecolumn sidelist pagecolumnLower' style='display:none'><div class='listHeader'><div class='hideSideList close-X-sm' style='position:absolute;right:0;top:0;z-index:1;margin-top:0px'>✕</div><h1 class='listTitle'></h1><div class='listSubtitle'></div><div class='listSpecs'></div></div><div id='listmain'><div id='listcolumnList'></div></div><div id='listInfo' class='listInfo content'></div></div>\r";
		if(document.getElementById("datascape") != null || document.getElementById("datascape1") != null) {
			$("#datascape").addClass("datascape");
			$("#datascape").addClass("datascapeEmbed");
			$("#fullcolumn > #datascape").removeClass("datascapeEmbed");  // When #datascape is NOT embedded.
			if (!$("#datascape").hasClass("datascapeEmbed")) {
				$("#datascape").addClass("datascapeTop");
			}

			$('body').removeClass('bodyLeftMarginFull'); // Gets added back if navcolumn is displayed.
			// Wait for template to be loaded so it doesn't overwrite listcolumn in #datascape.
			//waitForElm('#insertedText').then((elm) => {
			waitForElm('#fullcolumn > .datascapeTop').then((elm) => { // When #datascape is NOT embedded.
				// Place list in left margin for whole page use.
				//$("#datascape").prepend(listColumnElement);
				$("body").prepend(listColumnElement);
				listColumnElement = "";
				//$('body').addClass('bodyLeftMarginFull'); // Avoid here. Places gap on /community
			});
			
		} else {
			console.log("#datascape not available");
		}
		if(document.getElementById("navcolumn") == null) {
			let prependTo = "#datascape";
			// BUG #fullcolumn > .datascape does not seem to be loaded yet
			if ($("#fullcolumn > .datascape").is(":visible")) { // When NOT embedded
				console.log("Not embed");
				//prependTo = "body"; // Might not have worked intermintantly for the following prepend here: http://localhost:8887/recycling/
			}
			// min-height added since ds.ai html cropping to short side
			$(prependTo).prepend("<div id='navcolumn' class='navcolumn pagecolumn pagecolumnLower greyDiv noprint sidecolumnLeft liteDiv' style='display:none; min-height:300px'><div class='hideSide close-X-sm' style='position:absolute;right:0;top:0;z-index:1;margin-top:0px'>✕</div><div class='navcolumnBar'></div><div class='sidecolumnLeftScroll'><div id='navcolumnTitle' class='maincat'></div><div id='listLeft'></div><div id='cloneLeftTarget'></div></div></div>" + listColumnElement); //  listColumnElement will be blank if already applied above.
	 	} else {
	 		// TODO - change to fixed when side reaches top of page
	 		console.log("navigation.js report: navcolumn already exists")
	 		$("#navcolumn").addClass("navcolumn-inpage");
	 	}

	 	$(document).on("click", ".showNavColumn", function(event) {
	 		console.log(".showNavColumn click");
			if ($("#navcolumn").is(':hidden')) {
				showNavColumn();
			} else {
				$("#navcolumn").hide();
				$("#showNavColumn").show();$("#showSideInBar").hide();
				$('body').removeClass('bodyLeftMargin');
				$('body').removeClass('bodyLeftMarginFull');
				if (!$('body').hasClass('bodyRightMargin')) {
		        	$('body').removeClass('mobileView');
		    	}
			}
			let headerFixedHeight = $("#headerLarge").height();
			$('#cloneLeft').css("top",headerFixedHeight + "px");
		});
		$(document).on("click", ".hideSideList", function(event) {
	 		hideSide("list");
		});
	 	$(document).on("click", ".hideSide", function(event) {
	 		hideSide("");
		});

		$(document).on("click", ".showNavColumn, #navcolumn", function(event) {
		  event.stopPropagation();
		});
		$(document).on('click', function(event) {
			if ($("#navcolumn").is(':visible')) {
				if ($('#fullcolumn').width() <= 800) {
			  		hideSide();
				}
			}
		});

		function hideSide(which) {
			console.log("hideSide " + which);
			if (which != "list") {
				$("#navcolumn").hide();
				$('body').removeClass('bodyLeftMarginFull');
				if ($("#fullcolumn > .datascape").is(":visible")) { // When NOT embedded
					if ($("#listcolumn").is(':visible')) {
						$('#listcolumn').addClass('listcolumnOnly');
						console.log("addClass bodyLeftMarginList");
						$('body').addClass('bodyLeftMarginList');
					}
				}
			} else {
				$("#listcolumn").hide();
				$("#showListInBar").show();
			}
			if (!$("#navcolumn").is(':visible') && !$("#listcolumn").is(':visible')) {
				$("#showNavColumn").show();$("#showSideInBar").hide();
				$("#sideIcons").show();
			} else if (!$("#navcolumn").is(':visible') && $("#listcolumn").is(':visible')) {
				$("#showSideInBar").show();
			}
			if (!$("#navcolumn").is(':visible')) {
				$('body').removeClass('bodyLeftMargin');
			}
			if (!$("#listcolumn").is(':visible')) {
				$('body').removeClass('bodyLeftMarginList');
			}
			if (!$("#navcolumn").is(':visible') || !$("#listcolumn").is(':visible')) {
				$('body').removeClass('bodyLeftMarginFull');
			}
			if (!$('body').hasClass('bodyRightMargin')) {
	        	$('body').removeClass('mobileView');
	    	}
	    	// Might not need this with mobile

	    	// Stopped working after reconfuring to load map1 and map2 with same function.
	    	/*
			if (document.querySelector('#map1')._leaflet_map) {
				document.querySelector('#map1')._leaflet_map.invalidateSize(); // Refresh map tiles.
			}
			if (document.querySelector('#map2')._leaflet_map) {
				document.querySelector('#map2')._leaflet_map.invalidateSize(); // Refresh map tiles.
			}
			*/
			// Works instead
			if ($("#map1").text().trim().length > 1) {
				if (map1) {
					map1.invalidateSize(); // Refresh map tiles.
				}
			}
			if ($("#map2").text().trim().length > 1) {
				if (map2) {
					map2.invalidateSize(); // Refresh map tiles.
				}
			}
		}
	 	if (param["showapps"] && param["showapps"] == "false") {
	 		$(".showApps").hide();
			$("#appSelectHolder").hide();
	 	}
	 	if (param["showheader"] && param["showheader"] == "false") {

			//$(".filterPanel").addClass("filterPanel_fixed"); // This cause everything but top nav to disappear.
			//$(".filterbarOffset").hide();
			$(".headerOffset").hide();
			$("#headeroffset").hide();
			$(".headerOffset").hide();
			$("#headerbar").addClass("headerbarhide");

			// Insert for map filters since header.html file is not loaded.
			//$("body").prepend( "<div id='filterbaroffset' style='height:56px; pointer-events:none'></div>");

			// TO DO: Add support for custom headerpath

	 	} else {

	 		$(".headerOffset").show();
			$("#headeroffset").show();
			$(".headerOffset").show();

	 		// LOAD HEADER.HTML
	 		//if (earthFooter) {
		 		let headerFile;
		 		if (slash_count <= 4) { // Folder is the root of site
		 			// Currently avoid since "https://model.earth/" is prepended to climbpath above.
		 			//headerFile = climbpath + "../header.html";
		 		}
		 		
		 		if (param.header) {
					headerFile = modelroot + param.header;
				} else if (param.headerFile) {
		 			modelpath = ""; // Use the current repo when custom headerFile provided. Allows for site to reside within repo.
		 			headerFile = param.headerFile;
				} else {
					headerFile = modelroot + "/localsite/header.html";
				}

				//if (earthFooter && param.showSideTabs != "false") { // Sites includieng modelearth and neighborhood
				// 	$(".showSideTabs").show(); // Before load headerFile for faster display.
				//}
				if (headerFile) {
					// headerFile contains only navigation
					//alert("headerFile " + headerFile);
					waitForElm('#local-header').then((elm) => { 
					$("#local-header").load(headerFile, function( response, status, xhr ) {
						//alert("headerFile loaded");
						waitForElm('#sidecolumnContent').then((elm) => { // Resides in header.html
							//alert("got sidecolumnContent");
							console.log("Doc is ready, header file loaded, place #cloneLeft into #navcolumn")

							waitForElm('#navcolumn').then((elm) => { // #navcolumn is appended by this navigation.js script, so typically not needed.
								$("#showNavColumn").show();
							    if(location.host.indexOf("dreamstudio") >= 0) {
							        $("#sidecolumnContent a").each(function() {
							          $(this).attr('href', $(this).attr('href').replace(/\/dreamstudio\//g,"\/"));
							        });
							    }
								let colEleLeft = document.querySelector('#sidecolumnContent');
								let colCloneLeft = colEleLeft.cloneNode(true)
								colCloneLeft.id = "cloneLeft";
								$("#cloneLeftTarget").append(colCloneLeft);

								waitForElm('#topicsMenu').then((elm) => { // From info/template-main.html
									let colEleRight = document.querySelector('#sidecolumnContent');
									let colCloneRight = colEleRight.cloneNode(true)
									colCloneRight.id = "cloneRight";

		          					$("#topicsMenu").prepend(colCloneRight);

									if (location.href.indexOf('desktop') >= 0 || location.host.indexOf('dreamstudio') >= 0 || location.href.indexOf('dreamstudio') >= 0 || location.href.indexOf('/swarm/') >= 0 || location.href.indexOf('/LinearA/') >= 0) {
										let storiesFile = "https://dreamstudio.com/seasons/episodes.md";
										//console.log("location.href index: " + location.href.indexOf("/dreamstudio/"));
										if(location.host.indexOf('localhost') >= 0) {
											storiesFile = "/dreamstudio/seasons/episodes.md";
										} else if (location.href.indexOf("dreamstudio") >= 0) {
											storiesFile = "/seasons/episodes.md";
										}
										waitForElm('#storiesDiv').then((elm) => {
											// TO DO - Lazy load elsewhere, and avoid if already loaded
											loadMarkdown(storiesFile, "storiesDiv", "_parent");
											console.log("after storiesFile")
										});
									}
								});

							});

					 		// Move filterbarOffset and filterEmbedHolder immediately after body tag start.
					 		// Allows map embed to reside below intro text and additional navigation on page.

					 		//if (param.showSideTabs != "false") { // brig
					 		
					 		$("#filterEmbedHolder").insertAfter("#headeroffset");
					 		////$(".filterbarOffset").insertAfter("#headeroffset");
					 		
					 		//$(".filterbarOffset").insertAfter("#headerLarge");

					 		// Not needed since moved into header.html
					 		//$(".filterbarOffset").insertAfter("#headeroffset");

					 		//$(".filterbarOffset").insertAfter("#header");
					 		//$('body').prepend($(".filterbarOffset"));

					 		//$(".filterbarOffset").hide();

					 		// Make paths relative to current page
					 		// Only updates right side navigation, so not currently necessary to check if starts with / but doing so anyway.
					 		$("#local-header a[href]").each(function() {
					 		  if($(this).attr("href").toLowerCase().indexOf("http") < 0) {
					 		  	if($(this).attr("href").indexOf("/") != 0) { // Don't append if starts with /
					 		  		//alert($(this).attr('href'))
						      		$(this).attr("href", modelpath + $(this).attr('href'));
						        }
						  	  }
						    });
						    $("#local-header img[src]").each(function() {
					 		  	if($(this).attr("src").toLowerCase().indexOf("http") < 0) {
					 		  		if($(this).attr("src").indexOf("/") == 0) { // Starts with slash
					 		  			$(this).attr("src", modelroot + $(this).attr('src'));
					 		  		} else {
						      		$(this).attr("src", modelpath + $(this).attr('src'));
						      	}
						  	  }
						    });

						 	if(location.host.indexOf('neighborhood') >= 0) {
						 		// Since deactivated above due to conflict with header logo in app.
						 		$('.neighborhood').css('display', 'block');
						 	}
						 	if (param.titleArray && !param.headerLogo) {
						 		if (param.titleArray[1] == undefined) {
						 			if (param.titleArray[0] != undefined) {
						 				$('#headerSiteTitle').html(param.titleArray[0]);
						 			}
						 		} else {
							 		//let titleValue = "<span style='float:left'><a href='" + climbpath + "' style='text-decoration:none'>";
							 		let titleValue = "<span style='float:left'><a href='/' style='text-decoration:none'>";
							 		
							 		titleValue += "<span style='color: #777;'>" + param.titleArray[0] + "</span>";
							 		for (var i = 1; i < param.titleArray.length; i++) {
							 			titleValue += "<span id='titleTwo' style='color:#bbb;margin-left:1px'>" + param.titleArray[i] + "</span>";
							 		}
							 		titleValue += "</a></span>";
							 		$('#headerSiteTitle').html(titleValue);
							 		let theState = $("#state_select").find(":selected").text();
							 		if (theState) {
							 			//$(".locationTabText").text(theState);
							 		}
							 	}
						 	}

						 	if (param.favicon) {
						 		changeFavicon(param.favicon);
						 	}

							// WAS LIMITED TO HEADER
							//$(document).ready(function() { // Needed for info/index.html page. Fast, but could probably use a timeout delay instead since we are already within the header.html load.
							//alert("test2");
							// Equivalent to checking for #headerbar, but using #localsiteDetails since template pages already have a #headerbar.
							//waitForElm('#localsiteDetails').then((elm) => {
							waitForElm('#headerbar').then((elm) => {
								//alert("climbpath value: " + climbpath);

								waitForElm('#headerLogo').then((elm) => {
								 	if (!param.headerLogo && param.headerLogoSmall) {
								 		$('#headerLogo').html("<a href='" + climbpath + "' style='text-decoration:none'>" + param.headerLogoSmall + "</a>");
								 	} else if (param.headerLogo) {
								 		//alert("Display param.headerLogo")
								 		$('#headerLogo').html("<a href='" + climbpath + "' style='text-decoration:none'>" + param.headerLogo + "</a>");
								 	} else if (param.favicon) {
								 		let imageUrl = climbpath + ".." + param.favicon;
									 	$('#headerLogo').css('background-image', 'url(' + imageUrl + ')');
										$('#headerLogo').css('background-repeat', 'no-repeat');
									}
								});

								// Resides in map/filter.html
								waitForElm('#logoholderbar').then((elm) => { // Note, #logoholderbar becomes available after #localsiteDetails
									if (param.headerLogoSmall) {
										$('#logoholderbar').html("<a href='" + climbpath + "' style='text-decoration:none'>" + param.headerLogoSmall+ "</a>");
									} else if (param.headerLogoNoText) {
										$('#logoholderbar').html("<a href='" + climbpath + "' style='text-decoration:none'>" + param.headerLogoNoText + "</a>");
									} else if (param.headerLogo) {
										$('#logoholderbar').html("<a href='" + climbpath + "' style='text-decoration:none'>" + param.headerLogo + "</a>");
									}
								});

								
								// END WAS LIMITED TO HEADER
								$(".headerOffset").show();
								//$("#local-header").append( "<div id='filterbaroffset' style='display:none;height:56px; pointer-events:none; display:none'></div>"); // Might stop using now that search filters are in main.
								if ($("#filterFieldsHolder").length) {
									//$("#filterbaroffset").css('display','block');
								}

								// Slight delay
								setTimeout( function() {
									if ($("#filterFieldsHolder").length) {
										$("#filterbaroffset").css('display','block');
									}
								}, 200);
								setTimeout( function() {
									if ($("#filterFieldsHolder").length) {
										$("#filterbaroffset").css('display','block');
									}
								}, 1000);

								activateSideColumn();

								if (location.host.indexOf('localhost') >= 0 && earthFooter) {
									showLeftIcon = true;
								}
								if (showLeftIcon) {
									// Move to header


										// /localsite/img/icon/sidemenu.png  // width:15px;height:14px
						 					//<div class="showSideTabs" style="displayX:none; float:left;font-size:24px; color:#999;">
						 		}


						 		//$("#headerbar").show();
						 		//$("#headerbar").css("display:block");
						 		//alert("okay2")
						 	});


							if (param["showheader"] && param["showheader"] == "false") {
								// Don't show header
								$("#headerbar").addClass("headerbarhide");
							} else {
								//alert("#headerbar show")
								//$("#headerbar").show();
							}
						});
					}); // End $("#header").load
				
					});
				} // End header.html sidenav

				//waitForElm('#/icon?family=Material+Icons').then((elm) => {
					// Only apply if id="/icon?family=Material+Icons" is already in DOM.
			 		// Running here incase header has not loaded yet when the same runs in localsite.js.
			 		if (document.getElementById("/icon?family=Material+Icons")) {
			 			$(".show-on-load").removeClass("show-on-load");
			 		}
			 	//});
			//}
		}

		if (param.headerFile) {
			//$(document).ready(function () {
			setTimeout( function() {
				//$('body').prepend($("#local-header"));
				$('.headerOffsetOne').prepend($("#local-header"));

				//$("#headerLarge").hide();
			}, 1000);
			//});
		}

		/*
		var link = document.querySelector("link[rel~='icon']");
		alert("link " + link);
		if (!link) {
		    link = document.createElement('link');
		    link.rel = 'icon';
		    document.getElementsByTagName('head')[0].appendChild(link);
		}
		link.href = 'https://stackoverflow.com/favicon.ico';
		*/

		if(document.getElementById("footer") == null) {
			$("body").append( "<div id='local-footer' class='flexfooter noprint'></div>\r" );
		} else {
			//$("#footer").addClass("flexfooter");
			$("#footer").prepend( "<div id='local-footer' class='flexfooter noprint'></div>\r" );
		}
		if (location.host.indexOf('localhost') >= 0 && param.showfooter != false && !param.footer) {
			earthFooter = true; // Need to drive localhost by settings in a file ignored by .gitignore
		}
		if (param["showfooter"] && param["showfooter"] == "false") {
		} else if (earthFooter || param.footer) {
			var footerClimbpath = "";
			let footerFile = modelpath + "../localsite/footer.html"; // modelpath remains relative for site desgnated above as having a local copy of io and community.
			if (param.footer) {
				footerFile = param.footer; // Custom

				var footerFilePath = location.pathname + footerFile;
				if (footerFile.indexOf("/") > 0) {
					footerFilePath = footerFilePath.substr(0, footerFilePath.lastIndexOf("/") + 1); // Remove file name
				}

				console.log("footerFilePath " + footerFilePath);

				var upLevelInstance = (footerFilePath.match(/\.\.\//g) || []).length; // count of ../ in path.

				var climbLevels = ""
				for (var i = 0; i < upLevelInstance; i++) { // Remove ../ for each found
					climbLevels = climbLevels + "../";
				}	 	
			 	footerClimbpath = climbLevels; // Example: ../
			 	console.log("footerClimbpath (Levels up to current page): " + footerClimbpath);
			 	//alert(footerClimbpath)
			} else {
				footerClimbpath = climbpath;
			}
			$("#local-footer").load(footerFile, function( response, status, xhr ) {
				console.log("footerFile: " + footerFile);
				let pageFolder = getPageFolder(footerFile);
				// Append footerClimbpath to relative paths
				makeLinksRelative("local-footer", footerClimbpath, pageFolder);
			});
		}

	 	// SIDE NAV WITH HIGHLIGHT ON SCROLL

	 	// Not currently using nav.html, will likely use later for overrides.  Primary side nav resides in header.
	 	if (1==2 && param["navcolumn"]) {
	 		// Wait for header to load?

			let targetColumn = "#navcolumn";
			$(targetColumn).load( modelpath + "../localsite/nav.html", function( response, status, xhr ) {

				activateSideColumn();
			});
		}
		// END SIDE NAV WITH HIGHLIGHT ON SCROLL
	});
} // end applyNavigation function

$(document).ready(function () {
	//alert("word")
	$(document).on("click", ".hideMenu", function(event) {
		$("#menuHolder").show();
		$("#menuHolder").css('margin-right','-250px');
		//$("#listingMenu").appendTo($(this).parent().parent());
		event.stopPropagation();
	});
	$(document).on("click", ".hideGeoPicker", function(event) {
		console.log("hideGeoPicker")
		hideGeoPicker();
	});
	$(document).on("click", ".hideAdvanced", function(event) {
		console.log("hideAdvanced")
		hideAdvanced();
	});
	$(document).on("click", ".hideThumbMenu", function(event) {
		$("#bigThumbPanelHolder").hide();
		$(".showApps").removeClass("filterClickActive"); updateHash({'appview':''});
	});
	$(document).on("click", ".filterBubble", function(event) {
		console.log('filterBubble click')
	    event.stopPropagation(); // To keep location filter open when clicking
	});
});

$(document).on("click", ".showListings", function(event) {
	closeExpandedMenus(event.currentTarget);
	if (!$.trim($("#mapList1").html())) { // If the location list is not empty, load the list of types.
    	$("#bigThumbMenuInner").appendTo("#listingsPanelScroll");
        if (!document.getElementById("#bigThumbMenuInner")) {
            let hash = getHash();
            showThumbMenu(hash.show, "#listingsPanelScroll");
        }
    }
    $(".showListings").addClass("active");
    $("#listingsPanel").show();
    showSideTabs();
    event.stopPropagation();
});
$(document).on("click", ".showSettings", function(event) {
	closeExpandedMenus(event.currentTarget);
    $('.menuExpanded').hide();
    if ($(".settingsPanel").is(':visible')) { 

    } else {
        $(".settingsPanel").show();
        //$("#rightTopMenu").hide();
    }
});
$(document).on("click", ".showAccount", function(event) {
	closeExpandedMenus(event.currentTarget);
    //if ($(".moduleJS").width() <= 800) { // Narrow
    //    $('.hideApps').trigger("click"); // For mobile
    //}
    $("#accountPanel").show();
});
$('.contactUs').click(function(event) {
    alert("The Contact Us link is not active.")
    event.stopPropagation();
});
$('.shareThis').click(function(event) {
    window.location = "https://www.addthis.com/bookmark.php?v=250&amp;pub=xa-4a9818987bca104e";
    event.stopPropagation();
});

$(document).on("click", ".showSections", function(event) {
    closeExpandedMenus(event.currentTarget);
    //$('.menuExpanded').hide();
    $("#topicsPanel").show();
});
$(document).on("click", ".showStories", function(event) {
    closeExpandedMenus(event.currentTarget);
    $("#storiesPanel").show();
});
$(document).on("click", ".showDesktopNav", function(event) {
    closeExpandedMenus(event.currentTarget);
    $("#desktopPanel").show();
});

// SETTINGS
$(document).on("change", ".sitemode", function(event) {
    if ($(".sitemode").val() == "fullnav" && $('#siteHeader').is(':empty')) { // #siteHeader exists. This will likely need to be changed later.
        layerName = getLayerName();
        window.location = "./#" + layerName;
    }
    sitemode = $(".sitemode").val();
    setSiteMode($(".sitemode").val());
    Cookies.set('sitemode', $(".sitemode").val());
    if ($(".sitemode").val() == "fullnav") {
        $('.showSearchClick').trigger("click");
    }
    //event.stopPropagation();
});
$(document).on("change", ".sitesource", function(event) {
	// Options: Overview or Directory
    sitesource = $(".sitesource").val();
    Cookies.set('sitesource', $(".sitesource").val());
    setSitesource($(".sitesource").val());
    //event.stopPropagation();
});
$(document).on("change", "#sitelook", function(event) { // Style: default, coi, gc
    if (typeof Cookies != 'undefined') {
        Cookies.set('sitelook', $("#sitelook").val());
    }
    setSitelook($("#sitelook").val());
    //event.stopPropagation();
});
$(document).on("change", ".sitebasemap", function(event) {
    sitebasemap = $(".sitebasemap").val();
    if (typeof Cookies != 'undefined') {
        Cookies.set('sitebasemap', $(".sitebasemap").val());
    }
    //event.stopPropagation();
});

function setSitesource(sitesource) {
	console.log("setSitesource inactive");
	/*
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
    */
}

$(document).on("click", ".showPrintOptions, .print_button", function(event) {
//$('.showPrintOptions, .print_button').click(function(event) {
    //alert("show print2")
    $('.menuExpanded').hide();
    $('.printOptionsText').show();
    $('.printOptionsHolderWide').show();
    event.stopPropagation();
});

$(document).on("click", ".showTheMenu", function(event) { // Seasons
	console.log("Clicked .showTheMenu");
		$(".navLinks").show();
		//$("#showSideTabs").hide();
		//$("#hideMenu").show();
	event.stopPropagation();
});

$(document).on("click", ".showSideTabs", function(event) {
	showSideTabs();
	event.stopPropagation();
});

$(document).on('click', '.closeParent', function () {
	$(this).parent().fadeOut();
    event.stopPropagation();
});
$(document).on("click", ".closeSideTabs", function(event) {
	closeSideTabs();
});
$(document).on("click", ".showEarth", function(event) {
	if ($("#nullschoolHeader").is(':visible')) {
		$("#nullschoolHeader").hide();
		//$("#globalMapHolder").show();
		$("#hero_holder").show();
		closeSideTabs();
	} else {
		includeCSS3('/localsite/css/leaflet.css',''); // For zoom icons
		//$("#globalMapHolder").hide(); // Home page nullschool map.
		closeSideTabs();
		$("#hero_holder").hide();
		// Add a setting to choose map: Temperatures or just wind
		// Big blue: https://earth.nullschool.net/#current/wind/surface/level/orthographic=-35.06,40.67,511
		showGlobalMap("https://earth.nullschool.net/#current/wind/surface/level/overlay=temp/orthographic=-72.24,46.06,511"); //   /loc=-81.021,33.630
	}
	event.stopPropagation();
});
$(document).click(function(event) { // Hide open menus
	if($("#menuHolder").css('display') !== 'none') {
    	$("#menuHolder").hide(); // Since menu motion may freeze when going to another page.
    	if (!$(event.target).parents("#menuHolder").length) {
    		//event.preventDefault(); // Using requires double click
    	}
	}
	//$("#filterLocations").hide();
});

function loadLocalObjectLayers(layerName, callback) { // layerName is not currently used
    //alert("loadLocalObjectLayers " + layerName);
    // Do we need to load this function on init, for state hash for layers requiring a state.

    //console.log("loadLocalObjectLayers is deactivated. Using thumb menu load instead.")
    //return;

    let hash = getHash();
	//if(location.host.indexOf('localhost') >= 0) {
	    // Greenville:
	    // https://github.com/codeforgreenville/leaflet-google-sheets-template
	    // https://data.openupstate.org/map-layers

	    //var layerJson = local_app.community_data_root() + "us/state/GA/ga-layers.json"; // CORS prevents live
	    // The URL above is outdated. Now resides here:
	    let layerJson = local_app.localsite_root() + "info/data/ga-layers-array.json";
        if(location.host.indexOf("georgia") >= 0) {
	    	// For B2B Recyclers, since localsite folder does not reside on same server.
	    	layerJson = "https://model.earth/localsite/info/data/ga-layers-array.json";
	    	console.log("Set layerJson: " + layerJson);
		}
        //alert(layerJson)
	    //console.log(layerJson);

        if (localObject.layers.length >= 0) {
            callback();
            return;
        }
	    let layerObject = (function() {
            //alert("loadLocalObjectLayers layerObject " + layerName);
    
            if(!localObject.layers) {
                console.log("Error: no localObject.layers");
            }
            $.getJSON(layerJson, function (layers) {

                //console.log("The localObject.layers");
                //console.log(localObject.layers);

                // Create an object of objects so show.hash is the layers key
                $.each(layers, function (i) {

                    // To Do, avoid including "item" in object since it is already the key.
                    localObject.layers[layers[i].item] = layers[i];

                    //$.each(layerObject[i], function (key, val) {
                    //    alert(key + val);
                    //});
                });

                console.log("The localObject 2");
                console.log(localObject);

                //console.log("The localObject.layers");
                //console.log(localObject.layers);

                let layer = hash.show;
                //alert(hash.show)
                //alert(localObject.layers[layer].state)
                




          		// These should be lazy loaded when clicking menu
                //displayBigThumbnails(0, hash.show, "main");
                //displayHexagonMenu("", layerObject);
                
                if (!hash.show && !param.show) { // INITial load
                	// alert($("#fullcolumn").width()) = null
                	if ($("body").width() >= 800) {

                		//showThumbMenu(hash.show, "#bigThumbMenu");
                	}
            	}
                callback();
                return;
                //return layerObject;
	            
	        });
	    })(); // end layerObject
	    
	    
	//}
} // end loadLocalObjectLayers

/*
function callInitSiteObject(attempt) {
    alert("callInitSiteObject")
    if (typeof localObject.layers != 'undefined' && localObject.layers.length >= 0) {
        alert("localObject.layers already loaded " + localObject.layers.length)
        return;
    }
	if (typeof local_app !== 'undefined') {
		loadLocalObjectLayers("");
        return;
	} else if (attempt < 100) { // wait for local_app
		setTimeout( function() {
   			console.log("callInitSiteObject again")
			callInitSiteObject(attempt+1);
   		}, 100 );
	} else {
		console.log("ERROR: Too many search-filters local_app attempts. " + attempt);
	}
}
*/

function showThumbMenu(activeLayer, insertInto) {
	$("#menuHolder").css('margin-right','-250px');
    if (insertInto == "#bigThumbMenu") {
	   $("#bigThumbPanelHolder").show();
    }
	if (!$(".bigThumbMenuContent").length) {
		displayBigThumbnails(0, activeLayer, "main", insertInto);
	}
    if (insertInto != "#bigThumbMenu") {
        $("#bigThumbPanelHolder").hide();
        $(".showApps").removeClass("filterClickActive"); updateHash({'appview':''});
    } else {
    	//$('.showApps').addClass("filterClickActive");
    }
}

function removeFrontFolder(path) {
    //return("../.." + path);
    return(path);
}
function getDirectLink(livedomain,directlink,rootfolder,hashStr) {
    let hash = getHash();
    if (directlink) {
        directlink = removeFrontFolder(directlink);
    } else if (rootfolder) {
        if (rootfolder.indexOf('/explore/') < 0) {
            //rootfolder = "/explore/" + rootfolder;
        }
        directlink = removeFrontFolder(rootfolder + "#" + hashStr);
        //alert(directlink)
    } else {
        //directlink = removeFrontFolder("/explore/#" + hashStr);
    }
    if (hash.state && directlink.indexOf('state=') < 0) {
        if (directlink.indexOf('#') >= 0) {
            directlink = directlink + "&state=" + hash.state;
        } else {
            directlink = directlink + "#state=" + hash.state;
        }
    }
    if (livedomain && location.host.indexOf('localhost') < 0) {
    	return(livedomain + directlink);
    } else {
    	return(directlink);
	}
}
function access(minlevel,alevel) {
    var level = 0;
    if (alevel) { level = parseInt(alevel) }
    if (minlevel >= level) {
        //consoleLog("TRUE minlevel " + minlevel + " level " + level);
        return true;
    } else {
        //consoleLog("FALSE minlevel " + minlevel + " level " + level);
        return false;
    }
}
function displayBigThumbnails(attempts, activeLayer, layerName, insertInto) {
	if (!activeLayer) {
		activeLayer = "industries";
	}
	loadScript(theroot + 'js/map-filters.js', function(results) {
		loadLocalObjectLayers(activeLayer, function() {

		  waitForElm('#bigThumbPanelHolder').then((elm) => { //Not needed
		  	// Setting param.state in navigation.js passes to hash here for menu to use theState:
		    let hash = getHash();
		    let theState = $("#state_select").find(":selected").val();
		    if (param.state) { // Bugbug - might need a way to clear param.state
		        theState = param.state.split(",")[0].toUpperCase();
		    }
		    if (hash.state) {
		        theState = hash.state.split(",")[0].toUpperCase();
		    }
		    if (theState && theState.length > 2) {
		        theState = theState.substring(0,2);
		    }
			if ($('#bigThumbMenu').length <= 1) {
				console.log("Initial load of #bigThumbMenu");
			    var currentAccess = 0;
			    $(".bigThumbMenu").html("");

			    //$("#bigThumbPanelHolder").show();
			    var thelayers = localObject.layers;
			    var sectionMenu = "";
			    var categoryMenu = "";
			    var iconMenu = "";
			    var bigThumbSection = layerName;
			    var layer;
			    for(layer in thelayers) {
			        var menuaccess = 10; // no one
			        try { // For IE error. Might not be necessary.
			            if (typeof(localObject.layers[layer].menuaccess) === "undefined") {
			                menuaccess = 0;
			            } else {
			                menuaccess = localObject.layers[layer].menuaccess;
			            }
			        } catch(e) {
			            consoleLog("displayLayerCheckboxes: no menuaccess");
			        }
			        
			        var linkJavascript = "";
		            //alert(layer) // Returns a nummber: 1,2,3 etc
			        var directlink = getDirectLink(thelayers[layer].livedomain, thelayers[layer].directlink, thelayers[layer].rootfolder, thelayers[layer].item);
		            //alert("directlink " + directlink);
			        if (bigThumbSection == "main") {
			            if (thelayers[layer].menulevel == "1") {
			                if (access(currentAccess,menuaccess)) {
			                    //if (localObject.layers[layer].section == bigThumbSection && localObject.layers[layer].showthumb != '0' && bigThumbSection.replace(/ /g,"-").toLowerCase() != thelayers[layer].item) {
			                    
			                        var thumbTitle = ( thelayers[layer].thumbtitle ? thelayers[layer].thumbtitle : (thelayers[layer].section ? thelayers[layer].section : thelayers[layer].primarytitle));
			                        var thumbTitleSecondary = (thelayers[layer].thumbTitleSecondary ? thelayers[layer].thumbTitleSecondary : '&nbsp;');

			                        var icon = (thelayers[layer].icon ? thelayers[layer].icon : '<i class="material-icons">&#xE880;</i>');
			                           if (thelayers[layer].item != "main" && thelayers[layer].section != "Admin" && thelayers[layer].title != "") {
			                                console.log("Thumb title: " + thelayers[layer].title);
			                                var bkgdUrl = thelayers[layer].image;
			                                if (thelayers[layer].bigthumb) {
			                                    bkgdUrl = thelayers[layer].bigthumb;
			                                }
			                                bkgdUrl = removeFrontFolder(bkgdUrl);

			                                
			                                if (thelayers[layer].directlink) { // Omit thumbClick javascript
			                                    //hrefLink = "href='" + removeFrontFolder(thelayers[layer].directlink) + "'";
			                                } else if (thelayers[layer].rootfolder && thelayers[layer].rootfolder) {
			                                	// Change to pass entire hash

			                                	//linkJavascript = 'onclick="window.location = \'/localsite/' + thelayers[layer].rootfolder + '/#show=' + localObject.layers[layer].item + '\';return false;"';
			                                	linkJavascript = 'onclick="thumbClick(\'' + localObject.layers[layer].item + '\',\'' + thelayers[layer].rootfolder + '\');return false;"';
			                                //} else if ((directlink.indexOf('/map/') >= 0 && location.pathname.indexOf('/map/') >= 0) || (directlink.indexOf('/info/') >= 0 && location.pathname.indexOf('/info/') >= 0)) {
			                                } else if ((location.pathname.indexOf('/map/') >= 0) || (location.pathname.indexOf('/info/') >= 0)) {
			                                	// Stayon page when on map or info
			                                	//linkJavascript = "onclick='goHash({\"show\":\"" + localObject.layers[layer].item + "\",\"cat\":\"\",\"sectors\":\"\",\"naics\":\"\",\"go\":\"\",\"m\":\"\"}); return false;'"; // Remain in current page.
			                                	linkJavascript = 'onclick="thumbClick(\'' + localObject.layers[layer].item + '\',\'\');return false;"';
			                                } else {
			                                	linkJavascript = "";
			                                }

			                                // !thelayers[layer].states || (thelayers[layer].states == "GA" && (!param.state || param.state=="GA")  )
			                                if (menuaccess!=0 || (thelayers[layer].states == "GA")) {
			                                	// This one is hidden. If a related state, shown with geo-US13
			                                	let hideforAccessLevel = "";
			                                	if (menuaccess!=0) { // Also hiddden for access leven
			                                		hideforAccessLevel = "style='display:none'";
			                                	}
			                                	// TODO: lazy load images only when visible by moving img tag into an attribute.
			                                	// TODO: Add geo-US13 for other states
			                                    sectionMenu += "<div class='bigThumbMenuContent geo-US13 geo-limited' style='display:none' show='" + localObject.layers[layer].item + "'><div class='bigThumbWidth user-" + menuaccess + "' " + hideforAccessLevel + "><div class='bigThumbHolder'><a href='" + directlink + "' " + linkJavascript + "><div class='bigThumb' style='background-image:url(" + bkgdUrl + ");'><div class='bigThumbStatus'><div class='bigThumbSelected'></div></div></div><div class='bigThumbText'>" + thumbTitle + "</div><div class='bigThumbSecondary'>" + thumbTitleSecondary + "</div></a></div></div></div>";
			                                
			                                } else if (menuaccess==0) { // Quick hack until user-0 displays for currentAccess 1. In progress...
			                                    sectionMenu += "<div class='bigThumbMenuContent' show='" + localObject.layers[layer].item + "'><div class='bigThumbWidth user-" + menuaccess + "' style='displayX:none'><div class='bigThumbHolder'><a ";
		                                        if (directlink) { // This is a fallback and won't contain the hash values.
		                                            sectionMenu += "href='" + directlink + "' ";
		                                        }
		                                        sectionMenu += linkJavascript + "><div class='bigThumb' style='background-image:url(" + bkgdUrl + ");'><div class='bigThumbStatus'><div class='bigThumbSelected'></div></div></div><div class='bigThumbText'>" + thumbTitle + "</div><div class='bigThumbSecondary'>" + thumbTitleSecondary + "</div></a></div></div></div>";
			                                }
			                            }
			                    //}
			                }
			            }
			        } else {
			            if (access(currentAccess,menuaccess)) {
			                if (localObject.layers[layer].section == bigThumbSection && localObject.layers[layer].showthumb != '0' && bigThumbSection.replace(/ /g,"-").toLowerCase() != thelayers[layer].item) {
			                    var thumbTitle = (thelayers[layer].navtitle ? thelayers[layer].navtitle : thelayers[layer].title);
			                    var thumbTitleSecondary = (thelayers[layer].thumbTitleSecondary ? thelayers[layer].thumbTitleSecondary : '&nbsp;');

			                    var icon = (thelayers[layer].icon ? thelayers[layer].icon : '<i class="material-icons">&#xE880;</i>');
			                    if (!localObject.layers[layer].bigThumbSection) { // Omit the section parent
			                       if (thelayers[layer].item != "main" && thelayers[layer].section != "Admin" && thelayers[layer].title != "") {
			                            // <h1 class='honeyTitle'>" + thelayers[layer].provider + "</h1>
			                            //var thumbTitle = thelayers[layer].title;
			                            var bkgdUrl = thelayers[layer].image;
			                            if (thelayers[layer].bigthumb) {
			                                bkgdUrl = thelayers[layer].bigthumb;
			                            }
			                            bkgdUrl = removeFrontFolder(bkgdUrl);

			                            //var hrefLink = "";
			                            if (thelayers[layer].directlink) {
			                                //hrefLink = "href='" + removeFrontFolder(thelayers[layer].directlink) + "'";
			                            }
			                            sectionMenu += "<div class='bigThumbMenuContent' show='" + localObject.layers[layer].item + "'><div class='bigThumbWidth user-" + menuaccess + "' style='display:none'><div class='bigThumbHolder'><a href='" + directlink + "' " + linkJavascript + "><div class='bigThumb' style='background-image:url(" + bkgdUrl + ");'><div class='bigThumbStatus'><div class='bigThumbSelected'></div></div></div><div class='bigThumbText'>" + thumbTitle + "</div><div class='bigThumbSecondary'>" + thumbTitleSecondary + "</div></a></div></div></div>";
			                        }
			                    }
			                }
			            }
			        }
			    }
			    // Hidden to reduce clutter
		        $("#honeycombPanel").prepend("<div class='hideThumbMenu close-X' style='display:none; position:absolute; right:0px; top:0px;'><i class='material-icons' style='font-size:32px'>&#xE5CD;</i></div>");
			    $(insertInto).append("<div id='bigThumbMenuInner' class='bigThumbMenuInner'>" + sectionMenu + "</div>");

		        if (theState == "GA") {
			    // if (hash.state && hash.state.split(",")[0].toUpperCase() == "GA") {
			    	$(".geo-US13").show();
			    }
			    //$("#honeycombMenu").append("<ul class='bigThumbUl'>" + sectionMenu + "</ul>");
			    $("#iconMenu").append(iconMenu);
		        if (insertInto == "#bigThumbMenu") {
			       $("#bigThumbPanelHolder").show();
		        }
			    $("#honeyMenuHolder").show(); // Might be able to remove display:none on this

		        // 
			    //$(".thumbModule").append($("#bigThumbPanelHolder"));
			} else if ($("#bigThumbPanelHolder").css("display") == "none") {
		        if (insertInto == "#bigThumbMenu") {
				  $("#bigThumbPanelHolder").show();
		        }
			} else {
				$("#bigThumbPanelHolder").hide();
		        $(".showApps").removeClass("filterClickActive"); updateHash({'appview':''});
			}

			$('.bigThumbHolder').click(function(event) {
		        $("#bigThumbPanelHolder").hide(); // Could remain open when small version above map added. 
		        $(".showApps").removeClass("filterClickActive"); ////updateHash({'appview':''});     
		    });
		    if (activeLayer) {
		    	$(".bigThumbMenuContent[show='" + activeLayer +"']").addClass("bigThumbActive");
		    	let activeTitle = $(".bigThumbMenuContent[show='" + activeLayer +"'] .bigThumbText").text();
		    	if (activeTitle) { // Keep prior if activeLayer is not among app list.
		    		$("#showAppsText").attr("title",activeTitle);
		    	}
		    }
		  });
		});
	});
}

function showClassInline(theclass) {

	//$(theclass).css('display', 'inline');

	// Load when body head becomes available, faster than waiting for all DOM .js files to load.
    waitForElm('head').then((elm) => {
    	var div = $("<style />", {
        	html: theclass + ' {display: inline !important}'
        }).appendTo("head");
    });

	/*
	setTimeout( function() {
		$(theclass).css('display', 'inline');
	}, 1000);
	setTimeout( function() {
		$(theclass).css('display', 'inline');
	}, 2000);
	setTimeout( function() {
		$(theclass).css('display', 'inline');
	}, 5000);
	setTimeout( function() {
		$(theclass).css('display', 'inline');
	}, 10000);
	setTimeout( function() {
		$(theclass).css('display', 'inline');
	}, 30000);
	*/
}
function hideGeoPicker() {
	$("#geoPicker").hide();
}
function hideAdvanced() {
	// We might want to omit this line to retain geoview=earth
	updateHash({"geoview":""});
	// Should we show a search icon when closing?
	$(".fieldSelector").hide();
	$("#filterLocations").hide();
	$("#filterClickLocation").removeClass("filterClickActive");

	if (typeof relocatedStateMenu != "undefined") {
		relocatedStateMenu.appendChild(state_select); // For apps hero
	}
	$("#hero_holder").show();
	$(".locationTabText").text($(".locationTabText").attr("title"));
}
function activateSideColumn() {
	// Make paths relative to current page
		$("#navcolumn a[href]").each(function() {
			if($(this).attr("href").toLowerCase().indexOf("http") < 0) {
				if($(this).attr("href").indexOf("/") != 0) { // Don't append if starts with /
					$(this).attr("href", climbpath + $(this).attr('href'));
      		}
  		}
    })
		$("#navcolumn img[src]").each(function() {
			if($(this).attr("src").indexOf("/") != 0) { // Don't append if starts with /
      		$(this).attr("src", climbpath + $(this).attr('src'));
  		}
    })
	
	// Clone after path change
		
		// Might need to reactivate, but should we give a different ID?
		// Double use of ID seems to prevent display here: http://localhost:8887/recycling/
		//$("#headerLogo").clone().appendTo("#logoholderside");

		// ALL SIDE COLUMN ITEMS
		var topMenu = $("#cloneLeft");
		//console.log("topMenu:");
		//console.log(topMenu);
	var menuItems = topMenu.find("a");
	var scrollItems = menuItems.map(function(){ // Only include "a" tag elements that have an href.

		// Get the section using the names of hash tags (since id's start with #). Example: #intro, #objectives
		if ($(this).attr("href").includes('#')) {
			var sectionID = '#' + $(this).attr("href").split('#')[1].split('&')[0]; 
			if (sectionID.indexOf("=") >= 0) { // Sometimes the show (section) value may be passed without an equals sign.
				sectionID = sectionID.split('=')[0];
			}
		    var item = $(sectionID); //   .replace(/\//g, "").replace(/../g, "")    Use of replaces fixes error due to slash in path.
		    if (item.length) {
		    	return item;
		    }
		}
	});
	var bottomSection = "partners";

		// BIND CLICK HANDLER TO MENU ITEMS
	menuItems.click(function(e){
	  var href = $(this).attr("href");
	  /*
	  console.log('Clicked ' + href);
	  var offsetTop = href === "#" ? 0 : $(href).offset().top-topMenuHeight+1;
	  */
	  if (href.includes("#intro")) { 

	  	// If current page contains a section called intro
	  	if($('#intro').length > 0) {
		  	//alert("intro click")
		    $('html,body').scrollTop(0);

		    // BUGBUG - still need to set URL since this is needed to override default position:
		    e.preventDefault();
		}
	  }
	});

	/*
	// Alternative to flaky $(this).scrollTop()+topMenuHeight; // this is the window
	function getScrollTop(){
	    if(typeof pageYOffset != 'undefined'){
	        //most browsers except IE before #9
	        return pageYOffset;
	    }
	    else{
	        var B= document.body; //IE 'quirks'
	        var D= document.documentElement; //IE with doctype
	        D= (D.clientHeight)? D: B;
	        return D.scrollTop;
	    }
	}
	*/

	// HIGHLIGHT SIDE NAVIGATION ON SCROLL
	function currentSideID() {
		var scrollTop = window.pageYOffset || (document.documentElement.clientHeight ? document.documentElement.scrollTop : document.body.scrollTop) || 0;
		var topMenuHeight = 150;
		// Get container scroll position
		var fromTop = scrollTop+topMenuHeight; // this is the window
		//console.log('fromTop ' + fromTop);
		// Get id of current scroll item
		var cur = scrollItems.map(function(){
			// scrollItems is the sections fron nav.html, but just return the current one.
	   		//console.log('offset().top ' + $(this).offset().top)
	     	if ($(this).offset().top < fromTop) {
	     		//console.log('offset().top < fromTop ' + $(this).offset().top + ' < ' + fromTop);
	     		return this;
	       	}
		});
		if (cur.length == 0 && $("#allsections").length) {
			// At top, above top of intro section
			// To Do: Get the top most section
			// allsections
			return $("#allsections section:first").attr("id"); // "intro" when on tools page,
		}
		// Get the id of the last item fetched from scrollItems
		cur = cur[cur.length-1];
		var id = cur && cur.length ? cur[0].id : "";
		//console.log('currentSideID id: ' + id);
		return id;
	}
	var lastID;
	
	$(window).scroll(function() {
		var id = currentSideID();
		//console.log("id: " + id + " lastID: " + lastID);
	   if($('#' + bottomSection).length > 0 && $(window).scrollTop() + $(window).height() == $(document).height()) { // If bottomSection exists and at bottom
	      //console.log('at bottom');
	      menuItems.removeClass("active");
	      menuItems.filter("[href*='#"+bottomSection+"']").addClass("active");
	      lastID = bottomSection;
	   } else if (id && lastID !== id) { // Highlight side navigation
	      //console.log("CURRENT ID: " + id);
	      lastID = id;
	      menuItems.removeClass("active");
	      if (currentSection && currentSection.length) {
	      	if (id.length == 0) {
	      		// Page without sections
	      	} else if (id == "intro") {
	      		// To do: Change to highlight the uppermost section.
	      		menuItems.filter("[href='..\/tools\/#']").addClass("active");
	      	} else {
	      		//alert("id " + id)
	      		menuItems.filter("[href*='#"+id+"']").addClass("active"); // *= means contains
	      		menuItems.filter("[hashid='" + id + "']").addClass("active");
	      	}
	  	  }
	      /*
	      menuItems
	         .parent().removeClass("active")
	         .end().filter("[href*='#"+id+"']").parent().addClass("active");
	       */
	   } else {
	   		//console.log("Scrolling, no action");
	   }
	   
	  if (id == "intro") {
	  	console.log("headerbar show");
	    $('.headerbar').show();

	    // For when entering from a #intro link from another page.
	    // Would be better to disable browser jump to #intro elsewhere.
	    //$('html,body').scrollTop(0); 
	  }
	});

	// Initial page load
	var currentSection = currentSideID();
	//alert("currentSection " + currentSection)
	if (currentSection && currentSection.length) {
		if (currentSection == "intro") {
	      	// To do: Change to highlight the uppermost section.
	      	menuItems.filter("[href='..\/tools\/#']").addClass("active");
	      	lastID = "intro";
	    } else {
	    	menuItems.filter("[href*='#"+currentSection+"']").addClass("active");
	    	menuItems.filter("[hashid='" + currentSection + "']").addClass("active");
	    	// To do: If not found, try using folder name from link when no #
	    	//menuItems.filter("[href*='interns/']").addClass("active");
		}
	}
}

// INIT

//if (param.geoview == "state") {
//	loadScript(theroot + 'js/map.js', function(results) {
//		loadScript(theroot + 'js/map-filters.js', function(results) {
//			// geoview=state triggers display of location filter in map-filters.js. No additional script needed here.
//		});
//	});
//}

function makeLinksRelative(divID,climbpath,pageFolder) {
	  $("#" + divID + " a[href]").each(function() {

      //if (pagePath.indexOf('../') >= 0) { // If .md file is not in the current directory
      //$("#" + divID + " a[href]").each(function() {
      if($(this).attr("href").toLowerCase().indexOf("http") < 0){ // Relative links only        
          $(this).attr("href", climbpath + $(this).attr('href'));
      } else if (!/^http/.test($(this).attr("href"))) { // Also not Relative link
          alert("Adjust: " + $(this).attr('href'))
          $(this).attr("href", pageFolder + $(this).attr('href'));
      }
    })
}
function getPageFolder(pagePath) {
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
  return pageFolder;
}



} else { 
	if (location.host.indexOf('localhost') >= 0) {
		alert("ALERT: navigation.js is being loaded twice.");
	}
	console.log("ALERT: navigation.js is being loaded twice.")
} // End typeof page_scripts which checks if file is loaded twice.

$(document).on("change", "#state_select", function(event) {

    console.log("state_select change");
	if (this.value) {
    	$("#region_select").val("");
        // Later a checkbox could be added to retain geo values across multiple states
        // Omitting for BC apps page  ,'geoview':'state'
    	goHash({'state':this.value,'geo':'','name':'','regiontitle':''}); // triggers renderMapShapes("geomap", hash); // County select map
    	//$("#filterLocations").hide(); // So state appears on map immediately
    } else { // US selected
    	hiddenhash.state = ""; // BugFix - Without this prior state stays in dropdown when choosing no state using top option.
    	goHash({'geoview':'country','state':'','geo':''});
    }
});
$(document).on("click", "#filterClickLocation", function(event) {

	//delete(hiddenhash.geoview); // Not sure where this gets set.
	if ($("#geoPicker").is(':visible')) {
		console.log($("#filterLocations").offset().top);
	}
    let hash = getHash();
    if ($("#geoPicker").is(':visible') && $("#bigThumbPanelHolder").is(':visible')) {
    	//$("#bigThumbPanelHolder").hide();
    	//$("#filterClickLocation").removeClass("filterClickActive");
    	//$("#filterClickLocation").addClass("filterClickActive");
    	//goHash({"appview":""});
    	closeAppsMenu();
    	$("#filterClickLocation").addClass("filterClickActive");
    } else if ($("#geoPicker").is(':visible')) {
    	//if (hash.geoview && hash.appview) {
    	$("#geoPicker").hide();
    	closeAppsMenu();
    	$("#filterClickLocation").removeClass("filterClickActive");
    } else {
    	closeAppsMenu();
    	loadScript(theroot + 'js/map-filters.js', function(results) {
	    	$("#filterLocations").show();
	    	///$("#geoPicker").show();
	    	if (!hash.appview) {
	    		$("#filterClickLocation").addClass("filterClickActive");
	    	}
		    if(!hash.geoview && (hash.state || param.state)) {
		    	hash.geoview = "state";
		    	if (!hash.state) {
		    		hash.state = param.state + "";
		    	}
		    	goHash({"geoview":hash.geoview});
		    	//alert("updateHash " + hash.geoview);
		    } else {
		    	goHash({"geoview":"country"});
		    }

		    console.log("#filterClickLocation click hash.geoview: " + hash.geoview);
		});
		$('html,body').scrollTop(0);
	    /*
	     if (!hash.geoview) {
	    	if (!hash.appview) {
	    		closeAppsMenu();
	    	}
	    	loadScript(theroot + 'js/map-filters.js', function(results) {
				//if (!param.geoview) {
				// Hash change triggers call to filterClickLocation() and map display.
				if (mapviewState) {
					console.log("#filterClickLocation click go state");
		    		goHash({'geoview':'state'});
		    	} else {
		    		goHash({'geoview':'country'});
		    	}
	    	});
		} else {
			// Triggers closeLocationFilter()
			console.log("remove geoview from hash")
			goHash({"geoview":""}); // Remove from URL using gohash so priorhash is also reset
		}
		*/
	}
    event.stopPropagation();
});


$(document).on("click", ".showApps, .hideApps", function(event) {
	showApps("#bigThumbMenu");
  	event.stopPropagation();
});

function showApps(menuDiv) {
	loadScript(theroot + 'js/map-filters.js', function(results) {

		let hash = getHash();
		console.log('showApps in ' + menuDiv);
		$("#filterClickLocation").removeClass("filterClickActive"); // But leave open

	    if ($("#bigThumbPanelHolder").is(':visible')) { // CLOSE APPS MENU
		//if($("#bigThumbPanelHolder").is(':visible') && isElementInViewport($("#bigThumbPanelHolder"))) { // Prevented tab click from closing app menu
			updateHash({"appview":""});
			$("#appSelectHolder .select-menu-arrow-holder .material-icons").hide();
			$("#appSelectHolder .select-menu-arrow-holder .material-icons:first-of-type").show();

			$("#appSelectHolder .showApps").removeClass("filterClickActive"); updateHash({'appview':''});
			$("#showAppsText").text($("#showAppsText").attr("title"));
			$(".hideWhenPop").show();
	        // To do: Only up scroll AND SHOW if not visible
	        // Bug bug this closed filters
			$('html,body').animate({
				scrollTop: 0
			});
        	closeAppsMenu();
        	if (!hash.appview) {
	        	if ($("#filterLocations").is(':visible')) {
	        		$("#filterClickLocation").addClass("filterClickActive");
	        	}
	        }
		} else { // Show Apps, Close Locations (if no geoview)
			updateHash({"appview":"topics"});
			console.log("call showThumbMenu from navidation.js");
			if (!hash.geoview) {
	        	closeExpandedMenus($(".showSections")); // Close all sidetab's prior to opening new tab
	        }
	        $("#topicsPanel").show();

	        if ($("#filterLocations").is(':visible')) {
	        	////goHash({"geoview":""});
	        	// Deactivated so both apps and geoview shown on localsite/map:
	        	//goHash({},["geoview"]); //TODO - Alter so the above works instead.

	            ////filterClickLocation(); // Toggle county-select closedhttp://localhost:8887/localsite/map/#show=recyclers&state=GA
	        }
			$("#appSelectHolder .select-menu-arrow-holder .material-icons:first-of-type").hide();
			$("#appSelectHolder .select-menu-arrow-holder .material-icons:nth-of-type(2)").show();

			$("#showAppsText").text("Location Topics");
			waitForElm('#appSelectHolder').then((elm) => {
				$("#appSelectHolder .showApps").addClass("filterClickActive"); // Adds to local topics
			});
	        $("#bigThumbMenuInner").appendTo(menuDiv);
			showThumbMenu(hash.show, menuDiv);
			//$('.showApps').addClass("filterClickActive");
			waitForElm('#bigThumbPanelHolder').then((elm) => { 
		        $('html,body').animate({
		        	//- $("#filterFieldsHolder").height()  
		            scrollTop: $("#bigThumbPanelHolder").offset().top - $("#headerbar").height() - $("#filterFieldsHolder").height()
		        });
		    });
		}
	});
}
function closeAppsMenu() {
	$("#bigThumbPanelHolder").hide();
    $(".showApps").removeClass("filterClickActive"); updateHash({'appview':''});
}
function filterClickLocation(loadGeoTable) {
    console.log("filterClickLocation() " + loadGeoTable);
	$("#searchLocation").focus(); // Not working
	//document.getElementById("searchLocation").focus(); // Not working
	//$("#filterFieldsHolder").hide();

	$("#bigThumbPanelHolder").hide();
	$('.showApps').removeClass("filterClickActive"); ////updateHash({'appview':''});
    let distanceFilterFromTop = 120;
    if ($("#filterLocations").length) {
    	distanceFilterFromTop = $("#filterLocations").offset().top - $(document).scrollTop();
    }
    //alert("distanceFilterFromTop  " + distanceFilterFromTop);
	//$('.hideMetaMenuClick').trigger("click"); // Otherwise covers location popup. Problem: hides hideLayers/hideLocationsMenu.
	if ($("#filterLocations").is(':visible') && (distanceFilterFromTop < 300 || distanceFilterFromTop > 300)) {
        closeLocationFilter(); console.log("closeLocationFilter");
	} else { // OPEN MAP FILTER
		openMapLocationFilter();
	}
	$("#keywordFields").hide();
}

function openMapLocationFilter() {
    let hash = getHash();
    //alert("openMapLocationFilter param.state " + param.state);
    console.log("openMapLocationFilter()");
    loadScript(theroot + 'js/map-filters.js', function(results) {
	    if (!hash.geoview) {
	        let currentStates = [];
	        if(hash.geo && !hash.state) {
	            let geos = hash.geo.split(",");
	            for(var i = 0 ; i < geos.length ; i++) {
	                currentStates.push(getKeyByValue(us_stateIDs, Number(geos[i].replace("US","").substring(0,2))));
	            }
	        }
	        if (currentStates.length > 0) { // Multiple states, use first one.
	            goHash({"geoview":"state","state":currentStates[0]});
	        } else {
	            goHash({"geoview":"state"});
	        }
	    }
	    ///$("#geoPicker").show();
	    $("#filterLocations").show();
	    $(".locationTabText").text("Locations");
	    $("#topPanel").hide();
	    $("#showLocations").show();
	    $("#hideLocations").hide();

	    $("#hero_holder").hide();
	    if (typeof state_select_holder != "undefined") {
	        state_select_holder.appendChild(state_select); // For apps hero
	    }

	    if (hash.geoview == "state") {
		    locationFilterChange("counties");
		} else {
			console.log("Call locationFilterChange with no value")
			locationFilterChange("");
		}
	    if (hash.geo) {
	        let clearall = false;
	        if (hash.regiontitle != priorHash.regiontitle || hash.state != priorHash.state) {
	            clearall = true;
	        }
	        if (hash.geoview != "country") {
	            //if (loadGeoTable != false) { // Prevents loading twice on init
	            
	            // not needed, added hash = GetHash() to fix actual problem.
	            //waitForElm('#tabulator-geotable .tabulator-table > .tabulator-row').then((elm) => {
	                updateSelectedTableRows(hash.geo, clearall, 0);
	            //});
	        }
	    }
	    if (!hash.appview) {
		    waitForElm('#filterClickLocation').then((elm) => {
		    	$("#filterClickLocation").addClass("filterClickActive");
		    });
		}
	    //loadScript(theroot + 'js/map.js', function(results) { // Load list before map
	    	//console.log("Call renderMapShapes from navigation.js")
	        //renderMapShapes("geomap", hash, "", 1);// Called once map div is visible for tiles.
	    //});
	    if ($("#filterLocations").length) {
	        $('html,body').animate({
	            scrollTop: $("#filterLocations").offset().top - $("#headerbar").height() - $("#filterFieldsHolder").height()
	        });
	    } else {
	        console.log("ALERT #filterLocations not available yet.")
	    }
	    if (location.host == 'georgia.org' || location.host == 'www.georgia.org') { 
	        $("#header.nav-up").show();
	    }
	});
}
function closeLocationFilter() {
    //delete(hash.geoview); // BUGBUG, clears but still in filterClickLocation click
    console.log("closeLocationFilter() hash.geoview: " + hash.geoview);
    $(".locationTabText").text($(".locationTabText").attr("title"));
    $("#showLocations").hide();
    $("#hideLocations").show();
    //$(".locationTabText").text("Entire State");
    $("#filterLocations").hide();
    $("#filterClickLocation").removeClass("filterClickActive");
    if (location.host == 'georgia.org' || location.host == 'www.georgia.org') { 
        $("#header.nav-up").hide();
    }

    if (typeof relocatedStateMenu != "undefined") {
        relocatedStateMenu.appendChild(state_select); // For apps hero
    }
    $("#hero_holder").show();

    /*
    if(location.host.indexOf("localhost") >= 0 || location.host.indexOf("georgia") >= 0) { // TEMP until state is enforced while international map is still avalable. Applied when clicking "Top Industires" here: /localsite/map/#show=trade&geoview=countries
        console.log("Populate with state based on domain.")
        goHash({"geoview":"","state":"GA"});
    } else {
        //updateHash({"geoview":""});
        
    }
    */
}
