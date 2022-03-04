var currentAccess = 0;
function access(minlevel,alevel) {
    var level = 0;
    if (alevel) { level = parseInt(alevel) }
    if (minlevel >= level) {
        //console.log("TRUE minlevel " + minlevel + " level " + level);
        return true;
    } else {
        //console.log("FALSE minlevel " + minlevel + " level " + level);
        return false;
    }
}

// Rename from map-filters.js
function getDirectMenuLink(partnerMenu,item) {
    let directlink = item.directlink;
    let rootfolder = item.rootfolder;
    let layer = item.item;

    console.log("incoming partnerMenu.itemid: " + partnerMenu.itemid);
    if (item.link) {
        if (partnerMenu.itemid) {
            //item.link = item.link.replace(/ /g,"-");

            let regex = /\[itemid\]/g;
            item.link = item.link.replace(regex, partnerMenu.itemid);
            if (partnerMenu.partnerid && parseInt(partnerMenu.partnerid) > 0) {
                regex = /\[partnerid\]/g;
                item.link = item.link.replace(regex, partnerMenu.partnerid);
            } else {
                regex = /p=\[partnerid\]/g;
                item.link = item.link.replace(regex, "");
            }
        }
        directlink = item.link;
    }

    if (directlink) {
        directlink = removeFrontMenuFolder(directlink);
    } else if (rootfolder) {
        if (rootfolder.indexOf('/explore/') < 0) {
            //rootfolder = "/explore/" + rootfolder;
        }
        directlink = removeFrontMenuFolder(rootfolder + "#" + layer);
        console.log("directlink rootfolder: " + directlink);
    }
    console.log("directlink final: " + directlink);
    return(directlink);
}
function removeFrontMenuFolder(path) {
    //return("../.." + path);
    return(path);
}


function initMenu(partnerMenu) {
	//let layerName = partnerMenu.layerName;
	//let hash = getHash();
	//if(location.host.indexOf('localhost') >= 0) {
	    // Greenville:
	    // https://github.com/codeforgreenville/leaflet-google-sheets-template
	    // https://data.openupstate.org/map-layers

	    let layerJson = partnerMenu.layerJson; 
	    //console.log(layerJson);

	    //alert("layerJson: " + layerJson);
	    $.getJSON(layerJson, function (data) {
	    	displaypartnerCheckboxes(partnerMenu,data);
	    	/*
	        dp.data = readJsonData(data, dp.numColumns, dp.valueColumn);
	        processOutput(dp,map,map2,whichmap,whichmap2,basemaps1,basemaps2,function(results){
	          callback(); // Triggers initialHighlight()
	        });
	        */
            console.log("initMenu() fetched menu for div " + partnerMenu.menuDiv);
	    });

		$(document).on("click", partnerMenu.revealButton, function(event) {

  			console.log(partnerMenu.revealButton + ' click');

  			//if ($("#bigThumbPanelHolder").is(':visible')) {
  			//if($("#bigThumbPanelHolder").is(':visible') && isElementInViewport($("#bigThumbPanelHolder"))) {
  			if($(partnerMenu.menuDiv).is(':visible')) {

  				$(partnerMenu.menuDiv).hide();

  				
  				//$("#appSelectHolder .select-menu-arrow-holder .material-icons").hide();
  				//$("#appSelectHolder .select-menu-arrow-holder .material-icons:first-of-type").show();

  				//$("#appSelectHolder .showAdminNav").removeClass("filterClickActive");
  				//$("#showAdminNavText").text($("#showAdminNavText").attr("title"));
  				//$(".hideWhenPop").show();
  				//// To do: Only up scroll AND SHOW if not visible
  				//$('html,body').animate({
				//	scrollTop: 0
				//});

  				//$("#bigThumbPanelHolder").hide();
  				//$('.showAdminNav').removeClass("active");
				

  			} else {

  				$(partnerMenu.menuDiv).show();

  				/*
  				$("#appSelectHolder .select-menu-arrow-holder .material-icons:first-of-type").hide();
  				$("#appSelectHolder .select-menu-arrow-holder .material-icons:nth-of-type(2)").show();

  				//$("#showAdminNavText").text("Goods & Services");
  				//$("#appSelectHolder .showAdminNav").addClass("filterClickActive");
				//showThumbMenu(hash.show, adminNavObject);
				displaypartnerCheckboxes(partnerMenu,adminNavObject);
                $('html,body').animate({
                	//scrollTop: $("#bigThumbPanelHolder").offset().top - $("#headerbar").height() - $("#filterFieldsHolder").height()
                });
				*/
  			}
  			
		  	event.stopPropagation();
		});

	    /*
	    let adminNavObject = (function() {
	        let json = null;
	        $.ajax({
	            'type': 'GET',
	            'async': true,
	            'global': false,
	            'url': layerJson,
	            'jsonpCallback': 'callback',
	            'dataType': "jsonp",
	            'success': function (adminNavObject) {
	                consoleLog("Menu layers json loaded within initMenu. location.hash: " + location.hash);
	                
	                // adminNavObjectFunctions(adminNavObject); // could add to keep simple here
	                alert("success1")
	                displaypartnerCheckboxes(partnerMenu,adminNavObject);

	                
	          		// These should be lazy loaded when clicking menu
	                //displayBigThumbnails(hash.show, "main",adminNavObject);
	                //displayHexagonMenu("",adminNavObject);
	                
	                if (!hash.show && !param.show) { // INITial load
	                	// alert($("#fullcolumn").width()) = null
	                	if ($("body").width() >= 800) {

	                		//showThumbMenu(hash.show, adminNavObject);
	                	}
	            	}
	            	//return adminNavObject;
	            },
	          error: function (req, status, err) {
	              consoleLog('Error fetching adminNavObject json!: ', err);
	          }
	        });
	    })(); // end adminNavObject
	    */
	    
	//}

  $(document).on("click", partnerMenu.revealButton, function(event) {
  	alert("showPartnerMenu " + partnerMenu.revealButton);
    $(partnerMenu.menuDiv).show();
    $(partnerMenu.menuDiv).prependTo($(this).parent());
    event.stopPropagation();
  });

} // end initMenu


function clearAll(siteObject) {
    $('.layersCB:checked').each(function() {
        var checkedLayer = $(this).attr("id");
        // From explore embed
        //hideLayer(checkedLayer.replace('go-',''),siteObject);
    });
}
function displaypartnerCheckboxes(partnerMenu,menuDataset) { // For Layer Icon on map - Master
    if ($(partnerMenu.menuDiv).text().length > 0) {
		return; // Already loaded
	}
    console.log("displaypartnerCheckboxes start location.hash: " + location.hash);
    var partnerCheckboxes = "";
    var overlayList = ""; // Clicking selects checkbox in partnerCheckboxes list
    var previousSet = "";
    var previousOverlaySet = "";
    var closeLayerSet = false;

    // To Do: sort by view
    var item = ""; // Required for IE
    var layerSectionDisplay = "";
    var topTabs = "";
    var menulevel = 1;
    var menuaccessmax = 11;
    //for(item in menuDataset.items) {
    menuDataset.forEach(function(item) {
        var menuaccess = 10; // no one
        try { // For IE error
            if (typeof(item.menuaccess) === "undefined") {
                menuaccess = 0;
            } else {
                menuaccess = item.menuaccess;
            }
        } catch(e) {
            console.log("displaypartnerCheckboxes: no menuaccess");
        }
        menuaccessmax = 11;
        if (item.menuaccessmax) {
            menuaccessmax = item.menuaccessmax;
        }

        let showSublevel = true;
        if (partnerMenu.sublevels == 0) {
            showSublevel = false;
        }
        // location.host.indexOf('localhost') >= 0 || 
        
        // && item.section.toLowerCase() != item.item
        if (access(currentAccess,menuaccess) && currentAccess <= menuaccessmax) {
            var title = "";
            try { // For IE error
                title = ((item.navtitle) ? item.navtitle : item.title);
            } catch(e) {
                console.log("displaypartnerCheckboxes: no layer title");
                title = "----";
            }

            if (title) {
                // OVERLAYS
                if (item.feed && !item.omitOverlay) {
                    if (item.section && item.section != previousOverlaySet) {
                        if (previousOverlaySet != "") {
                            overlayList += '</div></div>'; // For columnizer
                        }
                        var overlaylevel = item.overlaylevel;
                        var hideOverlay = "";
                        if (!overlaylevel) {
                            overlayList += '<div class="user-' + menuaccess + '"><div ' + layerSectionDisplay + ' class="dontsplit layerSection layerSection-' + item.section.toLowerCase().replace(/ /g,"-") + '" menulevel="' + menulevel + '"><div style="clear:both; pointer-events: auto;" class="layerSectionClick">';
                            if (partnerMenu.showArrows) {
                                overlayList += '<div class="sectionArrowHolder"><div class="leftArrow"></div></div>';
                            }
                            overlayList += item.section + '</div>';
                        }
                    }
                    if (showSublevel) {
                        overlayList += '<div class="user-' + menuaccess + '"><div class="layerCbRow" data-trigger="go-' + item.item + '">';
                        // data-link="' + directlink + '"
                        overlayList += '<div class="overlayAction"><i class="material-icons active-' + item.item + '" style="float:right;color:#ccc;display:none">&#xE86C;</i></div><div class="layerCbTitle">' + title + '</div>';
                    }
                    
                    overlayList += '</div></div><div style="clear:both"></div>';
                    previousOverlaySet = item.section;
                }

                // MENU
                if (item.section && item.section != previousSet) {
                    //console.log("TITLE: " + title);
                    // item.item ==  || 
                    layerSectionDisplay = '';
                    menulevel = 1;
                    if (item.menulevel) {
                        menulevel = item.menulevel;
                    }
                    if ((item.menulevel == "3" || item.menulevel == "4")) {
                        layerSectionDisplay = ' style="display:none"';
                    }
                    if (previousSet != "") {
                        partnerCheckboxes += '</div></div>'; // For columnizer
                    }
                    closeLayerSet = true;
                    // First div is for columnizer
                    var sectionIcon = '<i class="material-icons menuTopIcon topHeaderIcon">&#xE53B;</i>';
                    if (item.sectionicon) {
                        //sectionIcon = item.sectionicon;
                    }
                    partnerCheckboxes += '<div class="layerSectionAccess user-' + menuaccess + '" style="display:none"><div ' + layerSectionDisplay + ' class="dontsplit layerSection layerSection-' + item.section.toLowerCase().replace(/ /g,"-") + '" menulevel="' + menulevel + '"><div style="clear:both; pointer-events: auto;" data-layer-section="' + item.section + '" class="layerSectionClick">';
                    if (partnerMenu.showArrows) {
                        partnerCheckboxes += '<div class="sectionArrowHolder"><div class="leftArrow"></div></div>';
                    }
                    if (item.icon) {
                        if (item.icon.includes("<")) {
                            partnerCheckboxes += '<div style="float:left;padding-right:10px;color:#bbb">' + item.icon + '</div>';
                        } else {
                            partnerCheckboxes += '<img class="layerSectionIcon" src="' + item.icon + '" style="float:left; height:18px; padding-right:12px">';  
                        }
                    }
                    partnerCheckboxes += '<div class="layerSectionTitle">' + item.section + '</div></div>';
                } // Check circle // Was around title: <label for="go-' + item.item + '" style="width:100%; overflow:auto">
                // <i class="material-icons" style="float:right;color:#ccc">&#xE86C;</i>
                var directlink = getDirectMenuLink(partnerMenu, item);
                
                // Link is applied dynamically using [itemid] in attr data-link
                if (showSublevel) {
                    partnerCheckboxes += '<div class="user-' + menuaccess + '"><div class="layerCbRow row-' + item.item + '"><div><a data-link="' + directlink + '" href="' + directlink + '" class="layerAction">';
                    /*
                    if (item.feed) {
                        partnerCheckboxes += '<div class="layerActionIcon" data-link="' + directlink + '"></div>';
                    } else {
                        partnerCheckboxes += '<div class="layerActionIcon layerActionIconNoFeed" data-link="' + directlink + '"></div>';
                    }
                    */

                    partnerCheckboxes += '</a></div><div class="layerCbTitle"><input type="checkbox" class="layersCB" name="layersCB" id="go-' + item.item + '" value="' + item.item + '"><a href="' + item.link + '">' + title + '</a></div></div></div>';
                    
                }
                partnerCheckboxes += '<div style="clear:both"></div>';
                previousSet = item.section;
            }
        }
        if (item.directoryframe) {
            topTabs += '<div>' + item.title + '</div>';
        }
    //}
	});
    if (closeLayerSet) {
        partnerCheckboxes += '</div></div>\n'; // For columnizer
        overlayList += '</div>\n'; // For columnizer
    }
    // Double div prevents prior layerSectionClick from being unchecked.
    //partnerCheckboxes += '<div><div class="showAllLayers dontsplit" style="display:none">More</div></div>\n';

    

    if (location.host.indexOf('localhost') >= 0) {
        //$(".siteTopTabs").append(topTabs);
    }
    
    $(document).ready(function () {
	   $(partnerMenu.menuDiv).append(partnerCheckboxes);
    });
	
	$(".overlaysInSide").append(overlayList);
    

    // Temp, need to adjust to use access level. This didn't work...
    $('.layerSectionAccess').show();

    // json loaded within initmenuDataset. location.hash:
    console.log("displaypartnerCheckboxes location.hash: " + location.hash);
    console.log("displaypartnerCheckboxes - Layer Icon on map, stores active layers without map load");

    //$('.partnerCheckboxes').columnize({ columns: 2 }); // Also called later since this won't have an effect when not visible.

    // APP MENU ACTIONS
    $(document).on("click", partnerMenu.menuDiv + ' .menuRectLink', function(event) {
        console.log('.menuRectLink click ' + $(this).attr("data-section").toLowerCase());
        showLayerMenu();

        $('.layerSection').hide();
        $('.layerSection-' + $(this).attr("data-section").toLowerCase()).show();
        //$('.layerSection-showAllLayers').show();
        $('.menuTopIconClose').hide();

        if ($('.layerSection-' + $(this).attr("data-section").toLowerCase()).find('.leftArrow').length) {
            // Only click if closed.
            //$('.layerSection-' + $(this).attr("data-section").toLowerCase() + ' > .layerSectionClick').trigger("click");
            
            // Replacing Above
            layerSectionOpen($(this).attr("data-section").toLowerCase());

            $('.showAllLayers').show();
        }
        event.stopPropagation();
    });

    // CHECKBOX ACTIONS
    $(document).on("click", partnerMenu.menuDiv + ' .layerActionIcon', function(event) {
        let layerName = $(this).parent().parent().find('.layersCB').val();
        //useRootPath(layerName);
        if($(this).attr("data-link")) {
            window.location = $(this).attr("data-link");
            return;
        }
        $(this).addClass('layerActionActive');
        console.log("Trigger hidden checkbox click from icon.");
        $(this).parent().parent().find('.layersCB').trigger('click');

        event.stopPropagation();
    });
    $(document).on("click", partnerMenu.menuDiv + ' .layerAction', function(event) {
        // Clear all layers
        clearAll(menuDataset);
        console.log('.layerAction');

        // Avoid if the current URL already contains data-link.
        // Stet, this caused contractor page to return to root
        //if($(this).attr("data-link") && window.location.pathname.indexOf($(this).attr("data-link")) < 0) {
        
        if($(this).attr("data-link")) {
            //alert('.layerAction data-link: ' + $(this).attr("data-link"));

            // Bugbug #specs is remaining in current rootfolder when these two lines are active:
            // Add, if first character is #, prepend path.
            window.location = $(this).attr("data-link");
            return;
        }
        console.log("Trigger hidden checkbox click from nav.");
        $(this).parent().find('.layersCB').trigger('click');
        $(this).parent().find('.layerActionIcon').addClass('layerActionActive');

        if ($(".moduleJS").width() <= 800) { // Narrow
            //$('.hideLocationsMenu').trigger("click");
            hideLocationsMenu();
        }
            
        event.stopPropagation();
    });
    
    // , .overlaysInSide .layerCbTitle
    $(document).on("click", partnerMenu.menuDiv + ' .overlaysInSide .layerCbRow', function(event) {
        //if (location.host.indexOf('localhost') >= 0) {
            console.log("overlaysInSide " + $(this).attr("data-trigger"))
        //}
        //$(".overlaysInSide").hide();
        //$(".showOverlays").removeClass("active");
        
        layerName = $(this).attr("data-trigger").replace('go-','');
        
        if (!$('.active-' + layerName).is(":visible")) {
            displayMap(layerName,menuDataset);
            $('.active-' + layerName).show(); // Show overlay icon. Has to occur after displayMap.
        } else {
            $('.active-' + layerName).hide();
            hideLayer(layerName,menuDataset);
        }
        // Causes header to change too:
        //$('#' + $(this).attr("data-trigger")).trigger("click"); // Toggles layersCB via '.partnerCheckboxes :checkbox'. Triggers changeLayer.
    });

    $(document).on("click", partnerMenu.menuDiv + ' .showAllLayers', function(event) {
        $('.layerCbRow').hide();
        $('.sideTip').hide();
        $('.layerSectionClick').find('.downArrow').addClass('leftArrow').removeClass('downArrow');
        // Make all arrows point right.

        showLayerMenu();
        $('.showAllLayers').hide();
        event.stopPropagation();
    });
    $(document).on("click", partnerMenu.menuDiv + ' .layerSectionClick', function(event) {
        if ($(this).attr("data-layer-section")) {
            layerSectionOpen($(this).attr("data-layer-section").toLowerCase().replace(/ /g,"-"));
        } else {
            console.log("layerSectionClick click");
            //$('.layerSection').hide();
            //$(this).parent().parent().show();
            //$(".listPanelHolder").show();// This shows list too.
            
            //$('.layerCbRow').hide(); // Hide All
            //$(this).parent().parent().find('.layerSectionClick').show();
            $(this).parent().find('.layerCbRow').toggle(); // Up to layerSection.
            //$(this).parent().parent().find('.layerCbRow').show(); // Up to layerSectionAccess.

            if ($(this).find('.leftArrow').length) {
                $(this).find('.leftArrow').addClass('downArrow').removeClass('leftArrow');
                // If any layers in the current section are feeds, show 3-dots tip.
                if ($(this).parent().parent().find('.layerActionIcon').length) {
                    //$(this).parent().parent().append($('.sideTip'));
                    $('.sideTip').show();
                    setTimeout(function() {
                        $(".sideTip").slideUp('slow')
                    }, 4000);
                } else {
                    $('.sideTip').hide();
                }
            } else {
                $(this).find('.downArrow').addClass('leftArrow').removeClass('downArrow');
            }
        }
        event.stopPropagation();
    });

    function layerSectionOpen(section) {
        //alert("function layerSectionOpen: " + section);
        //alert(".layerSection-" + section + " .layerCbRow");

        //if ($(".layerSection-" + section + " .sectionArrowHolder div").hasClass('downArrow')) {
        if ($(".layerSection-" + section).attr("opened") == "true") {
            $(".layerSection-" + section).attr("opened","false");
            $(".layerSection-" + section + " .layerCbRow").hide();
            $(".layerSection-" + section + " .sectionArrowHolder div").addClass('leftArrow').removeClass('downArrow');
        } else {
            $(".layerSection-" + section).attr("opened","true");
            $(".layerSection-" + section + " .layerCbRow").show();
            $(".layerSection-" + section + " .sectionArrowHolder div").addClass('downArrow').removeClass('leftArrow');
        }
    }
    function useRootPath(layerName) {
        var pathname = window.location.pathname.toLowerCase();

        // To do: Replace defense with any folder not at the root, except maybe "directory" folder
        if (pathname.indexOf('defense') >= 0 && $('.appMenuList').is(":visible")) { // Test for uppercase.
            // Exit the defense URL since Aerospace and other pages are not subsets of defense.
            //pathname = pathname.replace("/defense","");
            window.location = root + "#" + layerName;
            return;
        }
    }
    $('.partnerCheckboxes :checkbox').change(function () {

        if($(this).is(":checked")) { // Show Layer
            //$(this).parent().parent().find('.layerAction .layerActionIcon').css('color', '#3B99FC');
            $(this).parent().parent().find('.layerAction .layerActionIcon').addClass('layerActionActive');

            // Update hash without triggering listener
            //updateURL($(this).prop('value'));
            // History.pushState(historyParams, searchTitle, queryString);

            clearConsole();
            var layerName = $(this).prop('value');
            console.log("CHECKED " + layerName);
            if (embedded()) {
                window.top.location.href = root + "/#" + layerName
                return;
            }
            console.log("changeLayer called from .partnerCheckboxes :checkbox");

            useRootPath($(this).prop('value'));

            $('.topButtons').show();
            $('.layerContent').show(); // Since may be hidden on bigThumb page.

            clearID(".partnerCheckboxes :checkbox checked");
            //$('.cid').text(""); $('.cidTab').val("");
            updateTheURL($(this).prop('value'));
            var checkedCount = $('.layersCB:checked').length;
            if (checkedCount == 1) {
                console.log("TO DO: Clearall - Currently clearall only clears the previous layer.");
                changeLayer($(this).prop('value'),menuDataset,"clearall");
            } else {
                changeLayer($(this).prop('value'),menuDataset,"keepexisting");
            }
            // Limit to one title at top
            $("#sectionCategories").hide();
            $("#sectionCategoriesToggle").show();
            $('#cat-' + $(this).prop('value')).prop("checked", true);

            /* Hiding below now instead.
            if ($(".moduleJS").width() <= 800) { // Narrow
                $('.hideMetaMenu').trigger("click");
            } else if ($('.appMenuPosition').is(":visible")) {
                $('.hideMetaMenu').trigger("click");
            }
            */
            //$('.hideMainMenu').trigger("click"); // Has to reside after lines above.
            $('.active-' + $(this).prop('value')).show(); // Show overlay icon
            closeMenu();
        } else { // Hide Layer
            //$(this).parent().parent().find('.layerAction .layerActionIcon').css('color', '#ccc');
            $(this).parent().parent().find('.layerAction .layerActionIcon').removeClass('layerActionActive');
            console.log("hideLayer: " + $(this).prop('value'));
            clearID(".partnerCheckboxes :checkbox not checked");
            //$('.cid').text(""); $('.cidTab').val("");

            $('.active-' + $(this).prop('value')).hide(); // Hide overlay icon
            $('#cat-' + $(this).prop('value')).prop("checked", false);
            hideLayer($(this).prop('value'),menuDataset);
        }

        // Would hide list. Not needed for overlays click since list replaces overlays.
        //$(".besideLeftHolder").hide();
    });
}
