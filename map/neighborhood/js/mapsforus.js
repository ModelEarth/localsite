// Original source: https://github.com/codeforatlanta/mapsforus by Code for Atlanta

window.onload = function () {

  var documentSettings = {};

  function createMarkerIcon(icon, prefix, markerColor, iconColor) {
    return L.AwesomeMarkers.icon({
      icon: icon,
      prefix: prefix,
      markerColor: markerColor,
      iconColor: iconColor
    });
  }

  function centerAndZoomMap(points) {
    var mapCenter = L.latLng();
    var mapZoom = 0;

    // center and zoom map based on points or to user-specified zoom and center
    if (documentSettings["Initial Center Latitude:"] !== '' && documentSettings["Initial Center Longitude:"] !== '') {
      // center and zoom
      mapCenter = L.latLng(documentSettings["Initial Center Latitude:"], documentSettings["Initial Center Longitude:"]);
      map.setView(mapCenter);
    } else {
      var groupBounds = points.getBounds();
      mapZoom = map.getBoundsZoom(groupBounds);
      mapCenter = groupBounds.getCenter();
    }

    if (documentSettings["Initial Zoom:"] !== '') {
      mapZoom = parseInt(documentSettings["Initial Zoom:"]);
    }

    map.setView(mapCenter, mapZoom);

    // once map is recentered, open popup in center of map
    if (documentSettings["Info Popup Text:"] !== '') {
      initInfoPopup(documentSettings["Info Popup Text:"], mapCenter);
    };
  }

  // possibly refactor this so you can add points to layers without knowing what all the layers are beforehand
  // run this function after document is loaded but before mapPoints()
  function determineLayers(points) {
    var layerNamesFromSpreadsheet = [];
    var layers = {};
    for (var i in points) {
      var pointLayerNameFromSpreadsheet = points[i].Layer;
      if (pointLayerNameFromSpreadsheet !== "" && layerNamesFromSpreadsheet.indexOf(pointLayerNameFromSpreadsheet) === -1) {
        layerNamesFromSpreadsheet.push(pointLayerNameFromSpreadsheet);
      }
    }

    // if none of the points have named layers or if there was only one name, return no layers
    if (layerNamesFromSpreadsheet.length === 1) {
      layers = undefined;
    } else {
      for (var i in layerNamesFromSpreadsheet) {
        var layerNameFromSpreadsheet = layerNamesFromSpreadsheet[i];
        layers[layerNameFromSpreadsheet] = L.layerGroup();
        layers[layerNameFromSpreadsheet].addTo(map);
      }
    }
    return layers;
  }

  // only run this after Tabletop has loaded (onTabletopLoad())
  function mapPoints(points, layers) {

    return; // Custom - Disabled until point['Marker Icon'] available
    var markerArray = [];
    for (var i in points) {
      var point = points[i];
      if (point.Latitude !== "" && point.Longitude !== "") {
        var marker = L.marker([point.Latitude, point.Longitude], {
          icon: createMarkerIcon(point['Marker Icon'], 'fa', point['Marker Color'].toLowerCase(), point['Marker Icon Color'])
        }).bindPopup("<b>" + point["Title"] + "</b><br>" + point["Description"]);
        if (layers !== undefined && layers.length !== 1) {
          marker.addTo(layers[point.Layer]);
        }
        markerArray.push(marker);
      }
    }

    var group = L.featureGroup(markerArray);
    // if layers.length === 0, add points to map instead of layer
    if (layers === undefined || layers.length === 0) {
      clusterMarkers(group);
    } else {
      L.control.layers(null, layers, {
        collapsed: false
      }).addTo(map);
    }
    centerAndZoomMap(group);

  }

  // New Additions - Custom
  function displayList(points, layers) {
    var markerArray = [];
    let html = "";
    for (var i in points) {
      var point = points[i];
      if (point.Latitude !== "" && point.Longitude !== "") {
        html += point["Title"] + "</b><br>" + point["Description"] + "<hr>";
      }
    }
    document.getElementById('maplist').innerHTML = html;
  }
  function displayListVax(points, layers) {

    
    var markerArray = [];
    let html = "";
    html +='<h2>Georgia Vaccine Distribution </h2>';
    // 
    html += 'Crowdsourced updates to Georgia Department of Health lists are maintained by volunteers at <a href="https://VaccinateGA.com">VaccinateGA.com</a><br>';
    html += '<a href="https://docs.google.com/spreadsheets/d/1_wvZXUWFnpbgSAZGuIb1j2ni8p9Gqj3Qsvd8gV95i90/edit?ts=60233cb5#gid=698462553">Update availability by posting comments</a> within the Vaccinate Availability Google Sheet.<br>';
    html += '<b><a href="../../#show=vax">View Map of Locations</a></b> | <a href="../">Assist with coding and data - Code For America</a> | <a href="https://www.vaccinatega.com/who-we-are">Twitter Updates</a><br><br>';
    html += 'Learn about the <a href="https://www.infinitus.ai/blog-posts/vaccinateca-covid19-automation">automated call system assisting volunteers in California</a> and several other states.<br>';
    
    html += '<br>';
    var rowcount = 0;
    for (i = 0; i < points.length; i++) {
      var point = points[i];
      if (point.Latitude !== "" && point.Longitude !== "") {
        //html += point["Title"] + "</b><br>" + point["Description"] + point["County"]  + "<hr>";

      }
      if (point["Status"] != "0") {
        rowcount++;
        var theTitle = capitalizeFirstLetter(point["Name"]);
        var theTitleLink = 'https://www.google.com/maps/search/' + (point["Name"] + ', ' + point["County"] + ' County').replace(/ /g,"+");
        //var theRow = 
        var theRow = '<b>' + rowcount + " - " + theTitle + '</b> ';
        if (point["County"]) {
          theRow += ' - ' + point["County"] + ' County';
        }
        if (point["District"]) {
          theRow += ' - ' + point["District"];
        }
        if (point["Description"]) {
          theRow += ' - ' + point["Description"];
        }
        if (point["Availability"]) {
          theRow += ' - ' + point["Availability"];
        }
        theRow += '<br>';
        if (point["County"]) {
          theRow += '<a href="' + theTitleLink + '">Google Map</a>';
        }
        if (point["Webpage"]) {
          theRow += '&nbsp; | &nbsp;' + linkify(point["Webpage"]);
        }
        html += theRow + '<hr>';
      }
    }
    document.getElementById('maplist').innerHTML = html;
  }
  function capitalizeFirstLetter(str, locale=navigator.language) {
    return str.replace(/^\p{CWU}/u, char => char.toLocaleUpperCase(locale));
  }
  function linkify(inputText) { // https://stackoverflow.com/questions/37684/how-to-replace-plain-urls-with-links
    //return(inputText);
    console.log(inputText)
    var replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">Website</a>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">Website</a>');

    //Change email addresses to mailto:: links.
    //replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    //replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
    // https://outlook.office365.com/owa/calendar/WhitfieldVaccineSchedule@gets.onmicrosoft.com/bookings/

    return replacedText;
  }

  // only run this after Tabletop has loaded (onTabletopLoad())
  function mapHeatmap(points) {
    var markerArray = [];
    var boundsArray = [];
    for (var i in points) {
      var point = points[i];
      if (point.Latitude !== "" && point.Longitude !== "") {
        markerArray.push([Number(point.Latitude), Number(point.Longitude), Number(point.Intensity)]);

        // TODO: use layers

        var marker = L.marker([point.Latitude, point.Longitude]); // TODO: this is only used for bounds, so it should be removed and bounds should be found another way
        boundsArray.push(marker);
      }
    }
    var heatmapMaxZoom = documentSettings["Heatmap Max Zoom:"] || 17;
    var heatmap = L.heatLayer(markerArray, {
      radius: 35,
      blur: 35,
      maxZoom: heatmapMaxZoom
    }).addTo(map);

    var group = L.featureGroup(boundsArray);
    centerAndZoomMap(group);
  }

  // reformulate documentSettings as a dictionary, e.g.
  // {"webpageTitle": "Leaflet Boilerplate", "infoPopupText": "Stuff"}
  function createDocumentSettings(settings) {

    documentSettings = {};

    for (var i in settings) {
      var setting = settings[i];
      documentSettings[setting.Setting] = setting.Customization;
    }
  }

  function clusterMarkers(group) {
    // cluster markers, or don't
    if (documentSettings["Markercluster:"] === 'on') {
        var cluster = L.markerClusterGroup({
            polygonOptions: {
                opacity: 0.3,
                weight: 3
            }
        });
        cluster.addLayer(group);
        map.addLayer(cluster);
    } else {
        map.addLayer(group);
    }
  }

  function onTabletopLoad() {
    //createDocumentSettings(tabletop.sheets(constants.informationSheetName).elements); // Custom - remove
    // Custom
    documentSettings = {

    }

    addBaseMap();
    // document.title = documentSettings["Webpage Title:"];  // Custom
    var points = tabletop.sheets(constants.pointsSheetName).elements;
    var layers = determineLayers(points);
    if (documentSettings["Map Type:"] === 'Heatmap') {
      mapHeatmap(points);
    } else {
      mapPoints(points, layers);
      displayListVax(points, layers);
    }
  }

  var tabletop = Tabletop.init( { key: constants.googleDocID, // from constants.js
    callback: function(data, tabletop) { onTabletopLoad() } 
  });

  function initInfoPopup(info, coordinates) {
    L.popup({className: 'intro-popup'})
      .setLatLng(coordinates) // this needs to change
      .setContent(info)
      .openOn(map);
  }
  
  function addBaseMap() {

    // Custom
    //var basemap = documentSettings["Tile Provider:"] === '' ? 'Stamen.TonerLite' : documentSettings["Tile Provider:"];
    var basemap = 'Stamen.TonerLite';

    L.tileLayer.provider(basemap, {
      maxZoom: 18
    }).addTo(map);

    L.control.attribution({
      position: 'bottomright'
    }).addTo(map);

    var attributionHTML = document.getElementsByClassName("leaflet-control-attribution")[0].innerHTML;
    var mapCreatorAttribution = documentSettings["Your Name:"] === '' ? 'Built with' : 'This map was built by ' + documentSettings["Your Name:"] + ' using';
    attributionHTML = mapCreatorAttribution + ' <a href="http://mapsfor.us/">mapsfor.us</a><br><a href="http://mapsfor.us/">Mapsfor.us</a> was created by <a href="http://www.codeforatlanta.org/">Code for Atlanta</a><br>' + attributionHTML;
    // Custom - Restore later
    //document.getElementsByClassName("leaflet-control-attribution")[0].innerHTML = attributionHTML;
  }
};
