// Site specific settings
// Maintained in localsite/js/navigation.js

if(typeof page_scripts == 'undefined') {  // initial navigation.js load
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
 	
 	if(location.host.indexOf('localhost') < 0 && location.host.indexOf('model.') < 0 && location.host.indexOf('neighborhood.org') < 0) { // When not localhost or other sites that have a fork of io and community.
 		// To do: allow "Input-Output Map" link in footer to remain relative.
 		modelpath = "https://model.earth/" + modelpath; // Avoid - gets applied to #headerSiteTitle and hamburger menu
 		modelroot = "https://model.earth";
 	}
	function closeExpandedMenus(menuClicked) {
        $(".rightTopMenuInner div").removeClass("active");
        $(menuClicked).addClass("active");
        $(".menuExpanded").hide(); // Hide any open
        //alert("rightTopMenuInner 3");
    }
	function applyNavigation() { // Called by localsite.js so local_app path is available.
		// To do: fetch the existing background-image.
		console.log("location.host: " + location.host + " " + location.host.indexOf("locations.pages.dev"));
		if (location.href.indexOf("dreamstudio") >= 0 || param.startTitle == "DreamStudio") {
			//showLeftIcon = true;
			$(".siteTitleShort").text("DreamStudio");
			param.titleArray = [];
			//param.headerLogo = "<a href='https://dreamstudio.com'><img src='https://dreamstudio.com/dreamstudio/img/logo/dreamstudio-text.png' style='height:23px'></a>";
			
			let siteRoot = "";
			if (location.host.indexOf("localhost") >= 0) {
				siteRoot = "/dreamstudio";
			}
			param.headerLogo = "<a href='" + siteRoot + "/'><img src='/storyboard/img/logo/ds/favicon.png' style='float:left;width:38px;margin-right:7px'><img src='/storyboard/img/logo/ds/dreamstudio-text.png' alt='DreamStudio' style='height:22px; margin-top:9px'></a>";
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
		} else if ((location.host.indexOf('localhost') >= 0 && navigator && navigator.brave) || param.startTitle == "Georgia.org" || location.host.indexOf("georgia") >= 0 || location.host.indexOf("locations.pages.dev") >= 0) {
			// The localsite repo is open to use by any state or country.
			// Georgia Economic Development has been a primary driver of development.
			// Show locally for Brave Browser only - insert before:  ) || false
			// && navigator && navigator.brave
			if (!param.state) {
				if (param.mapview != "earth") {
					param.state = "GA"; // For displayBigThumbnails menu in map-filters.js
				}
			}
			showLeftIcon = true;
			$(".siteTitleShort").text("Model Georgia");
			param.titleArray = [];
			param.headerLogo = "<a href='https://georgia.org'><img src='" + local_app.localsite_root() + "img/logo/states/GA.png' style='width:140px;padding-top:4px'></a>";
			param.headerLogoNoText = "<a href='https://georgia.org'><img src='" + local_app.localsite_root() + "img/logo/states/GA-notext.png' style='width:50px;padding-top:0px;margin-top:-1px'></a>";
			if (document.title) {
		 		document.title = "Georgia.org - " + document.title;
		 	} else {
		 		document.title = "Georgia.org";
		 	}
			changeFavicon("/localsite/img/logo/states/GA-favicon.png");
			if (location.host.indexOf('localhost') >= 0 || location.host.indexOf("intranet") >= 0 || location.host.indexOf("locations.pages.dev") >= 0) {
				showClassInline(".intranet");
			}
			showClassInline(".georgia");
			if (location.host.indexOf("intranet") < 0 && location.host.indexOf("locations.pages.dev") < 0) { // Since intranet site does not include community submodule
				showClassInline(".earth");
			}
			$('#headerOffset').css('display', 'block'); // Show under site's Drupal header

			earthFooter = true;

		} else if (!Array.isArray(param.titleArray) && (param.startTitle == "Neighborhood.org" || location.host.indexOf('neighborhood.org') >= 0)) {
			showLeftIcon = true;
			$(".siteTitleShort").text("Neighborhood Modeling");
			param.titleArray = ["neighbor","hood"]
			param.headerLogoSmall = "<img src='/localsite/img/logo/partners/neighborhood-icon.png' style='width:40px;opacity:0.7'>"
			document.title = "Neighborhood.org - " + document.title
			changeFavicon("/localsite/img/logo/partners/neighborhood-icon.png")
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
				document.title = "Planet Live - " + document.title
			} else {
				$(".siteTitleShort").text("Model Earth");
				param.titleArray = ["model","earth"]
				document.title = "Model Earth - " + document.title
			}
			param.headerLogoSmall = "<img src='/localsite/img/logo/earth/model-earth.png' style='width:34px; margin-right:2px'>";
			changeFavicon(modelpath + "../localsite/img/logo/earth/model-earth.png")
			showClassInline(".earth");
			console.log(".earth display");
			earthFooter = true;
		}
		if (location.host.indexOf('model.earth') >= 0) { // Since above might not be detecting model.earth, probably is now.
			showLeftIcon = true;
			earthFooter = true;
		}

		if (param.footer || param.showfooter == false) {
			earthFooter = false;
			console.log("param.footer " + param.footer);
		}

	 	$("body").wrapInner( "<div id='fullcolumn'></div>"); // Creates space for navcolumn
	 	
	 	
	 	$("body").addClass("flexbody"); // For footer to stick at bottom on short pages
	 	$("body").wrapInner("<main class='flexmain' style='position:relative'></main>"); // To stick footer to bottom
	 	// min-height allows header to serve as #filterbaroffset when header.html not loaded
	 	// pointer-events:none; // Avoid because sub-divs inherite and settings dropdowns are then not clickable.

		if(document.getElementById("bodyFile") == null) {
			$("#fullcolumn").prepend("<div id='bodyFile'></div>\r");
		}

		if(document.getElementById("navcolumn") == null) {
	 		$("body").prepend( "<div id='navcolumn' class='hideprint sidecolumnLeft' style='display:none'><div class='hideSide close-X-sm' style='position:absolute;right:0;top:0;z-index:1;margin-top:0px'>✕</div><div class='sidecolumnLeftScroll'><div id='cloneLeftTarget'></div></div></div>\r" );
	 	} else {
	 		// TODO - change to fixed when side reaches top of page
	 		console.log("navigation.js report: navcolumn already exists")
	 		$("#navcolumn").addClass("navcolumn-inpage");
	 	}

	 	$(document).on("click", "#showSide", function(event) {
			//$("#showSide").hide();
			if ($("#navcolumn").is(':visible')) {
				//$("#showSide").css("opacity","1");
				$("#navcolumn").hide();
				$("#showSide").show();
				$('body').removeClass('bodyLeftMargin'); // Creates margin on right for fixed sidetabs.
				if (!$('body').hasClass('bodyRightMargin')) {
		        	$('body').removeClass('mobileView');
		    	}
			} else {
				$("#fullcolumn #showSide").hide();
				//////$("#filterFieldsHolder").removeClass("leftOffset");
				$('body').addClass('bodyLeftMargin'); // Creates margin on right for fixed sidetabs.
		        $('body').addClass('mobileView');
				$("#navcolumn").show();
			}
			let headerFixedHeight = $("#headerLarge").height();
			$('#cloneLeft').css("top",headerFixedHeight + "px");
		});
	 	$(document).on("click", ".hideSide", function(event) {
			$("#navcolumn").hide();
			$("#showSide").show();
			$('body').removeClass('bodyLeftMargin'); // Creates margin on right for fixed sidetabs.
			if (!$('body').hasClass('bodyRightMargin')) {
	        	$('body').removeClass('mobileView');
	    	}
		});
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
		 		let headerFile = modelroot + "/localsite/header.html";
		 		if (slash_count <= 4) { // Folder is the root of site
		 			// Currently avoid since "https://model.earth/" is prepended to climbpath above.
		 			//headerFile = climbpath + "../header.html";
		 		}
		 		if (param.headerFile) {
		 			modelpath = ""; // Use the current repo when custom headerFile provided.
		 			headerFile = param.headerFile;
		 		}

				if (param.header) headerFile = param.header;

				if (earthFooter && param.showSideTabs != "false") { // Sites includieng modelearth and neighborhood
				 	$(".showSideTabs").show(); // Before load headerFile for faster display.
				}

				// headerFile contains only navigation
				$("#local-header").load(headerFile, function( response, status, xhr ) {

						console.log("Doc is ready, header file loaded, place #cloneLeft into #navcolumn")

						waitForElm('#navcolumn').then((elm) => { // #navcolumn is appended by this navigation.js script, so typically not needed.
							//$("#cloneLeft").clone().appendTo($("#navcolumn"));
							//$("#cloneLeft").show(); // Still hidden, just removing the div that prevents initial exposure.
							if(location.host.indexOf("intranet") >= 0) {
						        $("#sidecolumnContent a").each(function() {
						          $(this).attr('href', $(this).attr('href').replace(/\/docs\//g,"\/"));
						        });
						    }
						    if(location.host.indexOf("dreamstudio") >= 0) {
						        $("#sidecolumnContent a").each(function() {
						          $(this).attr('href', $(this).attr('href').replace(/\/dreamstudio\//g,"\/"));
						        });
						    }

							let colEleLeft = document.querySelector('#sidecolumnContent');
							let colCloneLeft = colEleLeft.cloneNode(true)
							colCloneLeft.id = "cloneLeft";
							$("#cloneLeftTarget").append(colCloneLeft);

							waitForElm('#topicsMenu').then((elm) => {
								let colEleRight = document.querySelector('#sidecolumnContent');
								let colCloneRight = colEleRight.cloneNode(true)
								colCloneRight.id = "cloneRight";
								$("#topicsMenu").prepend(colCloneRight);
								
								if (location.host.indexOf('dreamstudio') >= 0 || location.href.indexOf('dreamstudio') >= 0) {
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
				 		
				 		if (location.host.indexOf('localhost') >= 0) {
				 			console.log("LOCAL ONLY - Show menu icon for localhost")
				 			$(".showSideTabs").show();
				 			$(".upperIcons .earth").show();
				 			setTimeout( function() {
								$(".showSideTabs").show();
				 				//$(".upperIcons .earth").show();
				 				//$(".earth").show();
							}, 1000);
				 		}
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
				    })
				    $("#local-header img[src]").each(function() {
			 		  	if($(this).attr("src").toLowerCase().indexOf("http") < 0) {
			 		  		if($(this).attr("src").indexOf("/") == 0) { // Starts with slash
			 		  			$(this).attr("src", modelroot + $(this).attr('src'));
			 		  		} else {
				      		$(this).attr("src", modelpath + $(this).attr('src'));
				      	}
				  	  }
				    })

				 	if(location.host.indexOf('neighborhood') >= 0) {
				 		// Since deactivated above due to conflict with header logo in app.
				 		$('.neighborhood').css('display', 'block');
				 	}
				 	if (param.titleArray && !param.headerLogo) {
				 		if (param.titleArray[1] == undefined) {
				 			$('#headerSiteTitle').html("");
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
					
					// Equivalent to checking for #headerbar, but using #localsiteDetails since template pages already have a #headerbar.
					waitForElm('#localsiteDetails').then((elm) => {
						//console.log("climbpath value: " + climbpath);

						waitForElm('#localsiteDetails').then((elm) => {
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

						$(document).on("click", ".showTheMenu", function(event) { // Seasons
							console.log("Clicked .showTheMenu");
		          			$(".navLinks").show();
					 		//$("#showSideTabs").hide();
					 		//$("#hideMenu").show();
							event.stopPropagation();
						});

						$(document).on("click", ".showSideTabs", function(event) {
							console.log("Clicked .showSideTabs");
		          			loadScript('/localsite/js/settings.js', function(results) {}); // For "Settings" popup

		          			if(location.href.indexOf("/seasons") >= 0) {
		          				closeExpandedMenus(".showStories");
            					$("#storiesPanel").show();
		          			}
		          			$('body').addClass('bodyRightMargin'); // Creates margin on right for fixed sidetabs.
		          			$('body').addClass('mobileView');
		          			$("#sideTabs").show();
					 		$("#showSideTabs").hide();
					 		$("#hideMenu").show();
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
								//$("#globalMapHolder").hide(); // Home page nullschool map.
								closeSideTabs();
								$("#hero_holder").hide();
								// Add a setting to choose map: Temperatures or just wind
								// Big blue: https://earth.nullschool.net/#current/wind/surface/level/orthographic=-35.06,40.67,511
								showGlobalMap("https://earth.nullschool.net/#current/wind/surface/level/overlay=temp/orthographic=-72.24,46.06,511"); //   /loc=-81.021,33.630
								event.stopPropagation();
							}
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

				 		// Only apply if id="/icon?family=Material+Icons" is already in DOM.
				 		// Running here incase header has not loaded yet when the same runs in localsite.js.
				 		if (document.getElementById("/icon?family=Material+Icons")) {
				 			$(".show-on-load").removeClass("show-on-load");
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
				}); // End $("#header").load
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
	} // end applyNavigation function

	function closeSideTabs() {
		$("#sideTabs").hide();
		$("body").removeClass("bodyRightMargin");
		if (!$('body').hasClass('bodyLeftMargin')) {
			$('body').removeClass('mobileView');
		}
		//$("#hideMenu").hide();
		$("#closeSideTabs").hide();
		$("#showSideTabs").show();
	}
	$(document).ready(function () {
		//alert("word")
		$(document).on("click", ".hideMenu", function(event) {
			$("#menuHolder").show();
			$("#menuHolder").css('margin-right','-250px');
			//$("#listingMenu").appendTo($(this).parent().parent());
			event.stopPropagation();
		});
		$(document).on("click", ".hideAdvanced", function(event) {
			console.log("hideAdvanced")
			hideAdvanced();
		});
		$(document).on("click", ".hideThumbMenu", function(event) {
			$("#bigThumbPanelHolder").hide();
			$(".showApps").removeClass("filterClickActive");
		});
		$(document).on("click", ".filterBubble", function(event) {
			console.log('filterBubble click')
		    event.stopPropagation(); // To keep location filter open when clicking
		});
	});

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

	function hideAdvanced() {
		// We might want to omit this line to retain mapview=earth
		updateHash({"mapview":""});
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
		 		$("#headerLogo").clone().appendTo("#logoholderside");

		 		// ALL SIDE COLUMN ITEMS
		 		var topMenu = $("#cloneLeft");
		 		//console.log("topMenu:");
		 		//console.log(topMenu);
				var menuItems = topMenu.find("a");
				var scrollItems = menuItems.map(function(){ // Only include "a" tag elements that have an href.

					// Get the section using the names of hash tags (since id's start with #). Example: #intro, #objectives
					if ($(this).attr("href").includes('#')) {
						var sectionID = '#' + $(this).attr("href").split('#')[1].split('&')[0]; // Assumes first hash param does not use an equals sign.
					
						//console.log('Get hash: ' + sectionID);

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
	console.log("ALERT: navigation.js is being loaded twice.")
}
