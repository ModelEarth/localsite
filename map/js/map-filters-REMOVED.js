// Google Autocomplete
// Load Google API key fron config.json

// This differs from localsite/map/auto in effort to prevent flackiness. 
// Not working immediately, sometimes works when returning to browser.

  var GOOGLE_MAP_KEY;
  $.getJSON(local_app.localsite_root() + "map/auto/config.json", function(json) {
    GOOGLE_MAP_KEY = json.googleAPIKey;
    window.onload = loadGoogleScript();
  });
  
  function loadGoogleScript() {

  	// ADD LIST OF ALLOWED DOMAIN FOR GOOGLE ADDRESS AUTOCOMPLETE

  	// DISALLOWED
  	if (location.host.indexOf('localhost') >= 0) {
		return; // Since not authorized for localhost
	}

  	var script = document.createElement('script');
  	var scriptsrc = 'https://maps.googleapis.com/maps/api/js' + '?key=' + GOOGLE_MAP_KEY +'&libraries=places';
    script.src = scriptsrc;
    //document.head.appendChild(script);

    // Adding this had no improvment
    loadScript(scriptsrc, function(results) {
		//alert("loadGoogleScript for autocomplete");
		googPlacesApp();
    	googlePlacesApiLoaded(1); // Initiate calling function until "google" found.
	});
  }

// BUGBUG - Could break if another script is already loaded containing "google"
function googlePlacesApiLoaded(count) {
	if (typeof google === 'object' && typeof google.maps === 'object') {
		console.log('FOUND google.maps.places. count:' + count)
	} else if (count<100) { // Wait a 100th of a second and try again
		setTimeout( function() {
   			console.log("try googlePlacesApiLoaded for auto complete again")
			googlePlacesApiLoaded(count+1);
   		}, 10 );
	} else {
		console.log("ERROR: googlePlacesApiLoaded exceeded 100 attempts.");
	}
}


function googPlacesApp() {
  // Uses https://cdn.jsdelivr.net/npm/vue above.
  var app = new Vue({ 
    el: '#app',
    mounted() {
    	
	      // BUG Give Google script time to load before calling google.maps.places.Autocomplete
	      // FIXED! - Rework this - might not need setTimeout here now...
	      //setTimeout(() => {
	        this.autocomplete = new google.maps.places.Autocomplete(
	          document.getElementById('searchloc'),
	          {types: ['establishment', 'geocode'],
                componentRestrictions: {country: "us"}}
	        );
	        //console.log("google.maps.places.Autocomplete: ");
	        //console.log(this.autocomplete);
	        this.autocomplete.addListener('place_changed', this.getPlaceData);
	      //},10)
		  
    },
    data: {
      lat: '',
      lng: '',
      address: '',
      phone: '',
      website: '',
      state: ''
    },
    methods: {
      deriveState (addr_components) {
        for (let c of addr_components) {
          if (c.types.includes('administrative_area_level_1')) return c.short_name;
        }
      },
      getPlaceData () {
        console.log("getPlaceData");
        const place = this.autocomplete.getPlace();
        this.lat = place.geometry.location.lat();
        this.lng = place.geometry.location.lng();
        this.address = place.formatted_address;
        this.state = this.deriveState(place.address_components);
        this.phone = place.formatted_phone_number;
        this.website = place.website;

        //alert(place.geometry.location.lat());
        $("#coordFields").show();
        goHash({"lat":place.geometry.location.lat(),"lon":place.geometry.location.lng(),"zoom":"10"});
        $("#filterLocations").hide();
        $("#filterClickLocation").removeClass("filterClickActive");
      }
    }
  });
}
// End Google Autocomplete