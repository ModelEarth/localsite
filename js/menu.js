var currentAccess = 0;
function accessBool(minlevel,alevel) {
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
function itemtypeBool(partnerMenu, item) {
    if (item.basetype) {
        if (item.basetype.split(",").indexOf(partnerMenu.basetype) >= 0) {
            return true;
        }
        return false;
    } else {
        return true;
    }
}
// Rename from map-filters.js
function getDirectMenuLink(partnerMenu,item) {
    let directlink = item.directlink;
    let rootfolder = item.rootfolder;
    //let layer = item.item;

    //console.log("incoming partnerMenu.itemid: " + partnerMenu.itemid);
    if (item.link) {
        if (partnerMenu.itemid) {
            //item.link = item.link.replace(/ /g,"-");

            let regex = /\[itemid\]/g;
            item.link = item.link.replace(regex, partnerMenu.itemid);
            if (partnerMenu.partnerid && parseInt(partnerMenu.partnerid) > 0) {
                regex = /\[partnerid\]/g;
                item.link = item.link.replace(regex, partnerMenu.partnerid);
            } else {
                regex = /&p=\[partnerid\]/g; // Remove preceding & symbol
                item.link = item.link.replace(regex, "");
                regex = /p=\[partnerid\]/g;
                item.link = item.link.replace(regex, "");
            }
        }
        if (itemtypeBool(partnerMenu, item)) { // for events only.
            //item.link = item.link.replace(/ /g,"-");

            let regex = /\[dateid\]/g;
            if (partnerMenu.dateID && parseInt(partnerMenu.dateID) > 0) {
                regex = /\[dateid\]/g;
                item.link = item.link.replace(regex, partnerMenu.dateID);
            } else {
                regex = /&?dateid=\[dateid\]/g; // Remove optional preceding & symbol
                item.link = item.link.replace(regex, "");
            }
        }
        directlink = item.link;
    }

    /*
    if (directlink) {
        directlink = removeFrontMenuFolder(directlink);
    } else if (rootfolder) {
        if (rootfolder.indexOf('/explore/') < 0) {
            //rootfolder = "/explore/" + rootfolder;
        }
        directlink = removeFrontMenuFolder(rootfolder + "#" + layer);
        //console.log("directlink rootfolder: " + directlink);
    }
    */
    //console.log("directlink final: " + directlink);
    return(directlink);
}
function removeFrontMenuFolder(path) {
    //return("../.." + path);
    return(path);
}


function initMenu(partnerMenu) {

    // Used by Open Footprint navigation

    // Greenville - Pull data from a public Google Sheet and create a Leaflet Map and shareable GeoJSON
    // https://github.com/codeforgreenville/leaflet-google-sheets-template
    // Samples: https://data.openupstate.org/map-layers

    let layerJson = partnerMenu.layerJson; 
    //console.log(layerJson);

    //alert("layerJson: " + layerJson);
    $.getJSON(layerJson, function (data) {
        displaypartnerCheckboxes(partnerMenu, data);
    	/*
        dp.data = readJsonData(data, dp.numColumns, dp.valueColumn);
        processOutput(dp,map,map2,whichmap,whichmap2,basemaps1,basemaps2,function(results){
          callback(); // Triggers initialHighlight()
        });
        */
        //console.log("initMenu() fetched menu for div " + partnerMenu.menuDiv);
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
			}
			
	  	event.stopPropagation();
	});

  $(document).on("click", partnerMenu.revealButton, function(event) {
  	console.log("showPartnerMenu " + partnerMenu.revealButton);
    $(partnerMenu.menuDiv).show();
    $(partnerMenu.menuDiv).prependTo($(this).parent());
    event.stopPropagation();
  });

} // end initMenu

function addSValueToLinks(partnerMenu) {

    if (typeof (BrowserUtil) != "undefined") {
        if (BrowserUtil.host.indexOf("localhost") >= 0) {
            // Update any of the navigation links that don't already have an s value
            $(partnerMenu.menuDiv + ' a[href]').not('[href^="http"]').not('[href^="javascript"]').not('[href="#"]')
                .attr('href', addSValueToLink);
            $(partnerMenu.menuDiv + ' div[data-link]').not('[data-link^="http"]').not('[data-link^="javascript"]').not('[data-link="#"]')
                .attr('data-link', addSValueToLink);
        }
    }
}

function addSValueToLink(index, currentValue) {
    //console.debug('before: ' + currentValue);
    var $this = $(this);
    var queryStringParams = $.extend({}, BrowserUtil.queryStringParams);
    var tmpQueryString = {};
    if (typeof (queryStringParams.s) != "undefined") {
        tmpQueryString.s = queryStringParams.s;
    }
    if (typeof (queryStringParams.db) != "undefined") {
        tmpQueryString.db = queryStringParams.db;
    }

    if (currentValue.indexOf('s=') >= 0) {
        var urlQueryString = BrowserUtil.parseQueryString(currentValue.substr(currentValue.indexOf('?')));
        var sValueArray = urlQueryString.s.split('.');

        if (sValueArray.length == 1) {
            tmpQueryString.s = sValueArray[0] + '.0.0.' + partnerMenu.siteID; // only s value itemid present.
        }
        else {
            tmpQueryString.s = urlQueryString.s; // assume full s value is present
        }

        currentValue = currentValue.replace('s=' + urlQueryString.s, ''); // remove the s value

        if ((currentValue.indexOf('?') == currentValue.length - 1) || (currentValue.indexOf('&') == currentValue.length - 1)) {
            currentValue = currentValue.substr(0, currentValue.length - 1); // remove the trailing '?' character
        }
        currentValue = currentValue.replace('?&', '?'); // removed s value may be the first of multiple query string values.
    }
    else {
        tmpQueryString.s = '0.0.0.' + partnerMenu.siteID;
    }

    if ($this.attr('href') !== undefined) {
        $this.attr('href', currentValue + (currentValue.indexOf('?') >= 0 ? '&' : '?') + $.param(tmpQueryString));
    }
    if ($this.attr('data-link') !== undefined) {
        $this.attr('data-link', currentValue + (currentValue.indexOf('?') >= 0 ? '&' : '?') + $.param(tmpQueryString));
    }
    //console.debug('after: ' + $(this).attr('href'));
}

function clearAll(siteObject) {
    $('.layersCB:checked').each(function() {
        var checkedLayer = $(this).attr("id");
        // From explore embed
        //hideLayer(checkedLayer.replace('go-',''),siteObject);
    });
}


function showSubmenu(id) { //onmouseclick
    if ($("#" + id).hasClass("openMenu")) {
        console.log("hide showSubmenu for id: " + id);
        $("#" + id).removeClass("openMenu");
        $("#" + id + ' .layerCbRow').hide();
        if ($(".sideMenuColumn").width() < 50) { 
            $("#" + id + " .layerSectionTitle").hide();
        }
    } else {
        console.log("showSubmenu for id: " + id);
        if ($("#" + id).find('div.layerCbRow').length !== 0) {
            $("#" + id).addClass("openMenu");
            $("#" + id + ' .layerCbRow').show();
            $("#" + id + " .layerSectionTitle").show();
        } else {
            console.log("This section has no sub-menus.")
        }
    }
}
// For narrow nav
function showMenuNav(id) { //onmouseenter
    if ($(".sideMenuColumn").width() <= 64) { // Only do rollover popout when side column is narrow.
        //console.log("showMenuNav " + id);
        $(".sideMenuColumn").addClass("sideMenuColumnNarrow"); // Adds black background
        $(".sideMenuColumn").removeClass("sideMenuColumnWide");
        $("#" + id + " .layerSectionTitle").show();
    } else {
        $(".sideMenuColumn").addClass("sideMenuColumnWide");
        $(".sideMenuColumn").removeClass("sideMenuColumnNarrow");
    }
}
function hideMenuNav(id) { //onmouseleave
    
    //return; // TEMP
    //console.log(".sideMenuColumn " + $(".sideMenuColumn").width());

    // BUGBUG - Need to check parent .sideMenuColumn since multiple instances may reside on page.
    // http://localhost:8887/localsite/partner-menu.html
    if ($(".sideMenuColumn").width() <= 64) { // Only hide when side is narrow.
        //console.log("hideMenuNav " + id);
        // Check parent has narrow class
        const sideMenuColumnNarrow = $("#" + id + " .layerSectionTitle").closest(".sideMenuColumnNarrow");  
        if(sideMenuColumnNarrow.length > 0) { // Only hide when in .sideMenuColumnNarrow
            $("#" + id).removeClass("openMenu");
            //$(".layerSection-" + id).removeClass("openMenu");
            $("#" + id + " .layerSectionTitle").hide();
            $("#" + id + " .layerCbRow").hide();
        }
        event.stopPropagation(); //cancel bubbling
    }
}

function formatLinkId(section,title) {
    return (section + "-" + title).replace(/\&/g, "").replace(/ /g, "_").replace(/^.*\/\/[^\/]+/, '').toLowerCase();
}
function displaypartnerCheckboxes(partnerMenu,menuDataset) { // For Layer Icon on map - Master
    if ($(partnerMenu.menuDiv).text().length > 0) {
        console.log("displaypartnerCheckboxes already loaded: " + partnerMenu.menuDiv)
		return; // Already loaded
	}
    //console.log("displaypartnerCheckboxes start location.hash: " + location.hash);
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
    var rowCount = 0;
    //for(item in menuDataset.items) {
    menuDataset.forEach(function(item) {
        //console.log("displaypartnerCheckboxes section: " + item.section);
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
        
        // && item.section.toLowerCase() != rowCount
        if (itemtypeBool(partnerMenu, item) && accessBool(currentAccess,menuaccess) && currentAccess <= menuaccessmax) {
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
                            overlayList += '<div class="user-' + menuaccess + '"><div ' + layerSectionDisplay + ' class="dontsplit layerSection layerSection-' + item.section.toLowerCase().replace(/ /g,"-") + '" menulevel="' + menulevel + '"><div style="clearX:both; pointer-events: auto;" class="layerSectionClick">';
                            if (partnerMenu.showArrows) {
                                overlayList += '<div class="sectionArrowHolder"><div class="leftArrow"></div></div>';
                            }
                            overlayList += item.section + '</div>';
                        }
                    }
                    if (showSublevel) {
                        overlayList += '<div class="user-' + menuaccess + '"><div class="layerCbRow" data-trigger="go-' + rowCount + '">';
                        // data-link="' + directlink + '"
                        overlayList += '<div class="overlayAction"><i class="material-icons active-' + rowCount + '" style="float:right;color:#ccc;display:none">&#xE86C;</i></div><div class="layerCbTitle">' + title + '</div>';
                    }
                    
                    overlayList += '</div></div><div style="clearX:both"></div>';
                    previousOverlaySet = item.section;
                }

                let directlink = getDirectMenuLink(partnerMenu, item); // Replaces [itemid] with current ItemID
                // MENU
                if (item.section && item.section != previousSet) {
                    //console.log("TITLE: " + title);
                    // rowCount ==  || 
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
                    let linktext = "";
                    if (directlink)  {
                        if (!showSublevel) {
                            linktext = ' link="' + directlink + '"';
                        }
                    }
                    partnerCheckboxes += '<div class="layerSectionAccess user-' + menuaccess + '" id="' + formatLinkId(item.section,item.title + "_parent") + '" style="display:none">'; //  onmouseleave="hideMenuNav(this.id)"
                    partnerCheckboxes += '<div ' + layerSectionDisplay + ' id="' + formatLinkId(item.section,item.title) + '" class="dontsplit layerSection layerSectionOpen layerSection-' + item.section.toLowerCase().replace(/ /g,"-") + '" menulevel="' + menulevel + '" onmouseenter="showMenuNav(this.id)" onmouseleave="hideMenuNav(this.id)"><div style="clearX:both; pointer-events: auto;" data-layer-section="' + item.section + '"' + linktext + '" class="layerSectionClick" onclick="showSubmenu(this.parentElement.id)">';
                    if (partnerMenu.showArrows) {
                        partnerCheckboxes += '<div class="sectionArrowHolder"><div class="leftArrow"></div></div>';
                    }
                    if (item.icon) {
                        if (item.icon.includes("<")) {
                            partnerCheckboxes += '<div style="float:left;padding-right:10px;color:#4F4F4F">' + item.icon + '</div>';
                        } else {
                            partnerCheckboxes += '<img class="layerSectionIcon" src="' + item.icon + '" style="float:left; height:18px; padding-right:12px">';  
                        }
                    }
                    partnerCheckboxes += '<div class="layerSectionTitle">' + item.section + '</div></div>';
                } // Check circle // Was around title: <label for="go-' + rowCount + '" style="width:100%; overflow:auto">
                // <i class="material-icons" style="float:right;color:#ccc">&#xE86C;</i>
                
                
                // Link is applied dynamically using [itemid] in attr data-link
                if (showSublevel) {
                    partnerCheckboxes += '<div class="user-' + menuaccess + '"><div class="layerCbRow row-' + rowCount + '" data-link="' + directlink + '"><div><a data-link="' + directlink + '" href="' + directlink + '" class="layerAction">';
                    /*
                    if (item.feed) {
                        partnerCheckboxes += '<div class="layerActionIcon" data-link="' + directlink + '"></div>';
                    } else {
                        partnerCheckboxes += '<div class="layerActionIcon layerActionIconNoFeed" data-link="' + directlink + '"></div>';
                    }
                    */

                    //partnerCheckboxes += '</a></div><div class="layerCbTitle"><input type="checkbox" class="layersCB" name="layersCB" id="go-' + rowCount + '" value="' + rowCount + '"><a href="' + item.link + '">' + title + '</a></div></div></div>';
                    partnerCheckboxes += '</a></div><div class="layerCbTitle"><a href="' + item.link + '">' + title + '</a></div></div></div>';
                    
                }
                //partnerCheckboxes += '<div style="clearX:both"></div>';
                previousSet = item.section;
            }
        }
        if (item.directoryframe) {
            topTabs += '<div>' + item.title + '</div>';
        }
        rowCount++;
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
        addSValueToLinks(partnerMenu);
    });
	
	$(".overlaysInSide").append(overlayList);
    

    // Temp, need to adjust to use access level. 

    // This didn't work...
    $('.layerSectionAccess').show();
    // So wait 0.2 seconds and 1 second.
    setTimeout(() => {
      $('.layerSectionAccess').show();
    },200)
    setTimeout(() => {
      $('.layerSectionAccess').show();
    },1000)
    

    // json loaded within initmenuDataset. location.hash:
    //console.log("displaypartnerCheckboxes location.hash: " + location.hash);
    //console.log("displaypartnerCheckboxes - Layer Icon on map, stores active layers without map load");

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
    //$(document).on("click", partnerMenu.menuDiv + ' .layerAction', function(event) { // Second level menus
    $(document).on("click", ".layerCbRow", function(event) { // Second level menus
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
    
    /*
    $(".layerSection").mouseenter(function(){
      //$("p").css("background-color", "yellow");

      $(".layerSectionTitle").show();
      //console.log("enter")
    });
    $(".layerSection").mouseleave(function(){
      //$("p").css("background-color", "yellow");

      $(".layerSectionTitle").hide();
      alert("leave")

    });
    */

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

    $(document).on("click", partnerMenu.menuDiv + ' .layerSectionClick', function(event) { // Top level
        //alert("parent width: " + $(this).parent().parent().parent().parent().width()); // Same as the following, 38px when narrow:
        
        //let menuColumnWidth = $(this).width(); // Bug - Uses width after resize.
        let menuColumnWidth = $(this).parent().parent().parent().parent().width(); 
        // Not working
        //let menuColumnWidth = $(partnerMenu.menuDiv + '.layerSectionClick').parent().width();
        console.log("This partnerMenu.menuDiv width: " + menuColumnWidth);

        if (1==2 && menuColumnWidth < 120) { // Only use section as link when side is narrow
            console.log("Click narrow - " + partnerMenu.menuDiv);
            let link = $(this).attr("link");
            if (typeof link !== 'undefined' && link !== false) { // For diff browsers

                //window.location = link;
                console.log("Click link disabled: " + link);
            } else {
                console.log("Clicked " + $(this).attr("data-layer-section") + ", but no link provided in json")
            }
            event.stopPropagation();
            return;
        } else {
            console.log(partnerMenu.menuDiv + " .layerSectionClick");
            
            if ($(this).attr("data-layer-section")) {
                //layerSectionOpen($(this).attr("data-layer-section").toLowerCase().replace(/ /g,"-"));
                let pageLink = $(this).attr("link");
                if (pageLink) {
                    window.location = pageLink;
                } else {
                    console.log("CLICKED - But no link attr on data-layer-section for a section with no subnav");
                }
            } else {
                alert("layerSectionClick click, no data-layer-section attr");
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
    $('.partnerCheckboxes :checkbox').on('change', function () {

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
