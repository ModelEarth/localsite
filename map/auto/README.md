# Google Autocomplete

Search utilizes [Google Places API autocomplete](https://developers.google.com/maps/documentation/javascript/places-autocomplete) functionality, returning Google's Place "predictions" as the user is typing in a search term. Once the user makes a selection, the details of the selection (geo coordinates, address, phone, website, etc..) are returned from the API.

For the address search to work, you'll need to get a new Google Maps API key. You can get yours and enable it by following these instructions: [https://developers.google.com/maps/documentation/javascript/get-api-key](https://developers.google.com/maps/documentation/javascript/get-api-key)  

When you get a key, set the google_api_key in localsite/map/auto/config.json

## Setup

1. You'll need to [enable billing](https://console.cloud.google.com/projectselector2/billing/enable). You can use the $300 free credits.  Click "Payment Method" to see if your card has expired.  

2. Aquire a [Google API Key](https://developers.google.com/maps/documentation/javascript/get-api-key) - Create a project and then Create Credentials > API Key.  

3. Add your API key in config.json -> googleAPIKey  

4. Go to [Google Cloud Console](https://console.cloud.google.com/) > Go to API overview > Library

	Search and Enable `Places API` and `Maps JavaScript API` for autocomplete to work.  

5. Restrict the API key to only allow specific origin access (website domain)

	[Google Cloud Console](https://console.cloud.google.com/) > your project > APIs & Services (in left side menu) > Credentials > your API Key > Application restrictions > HTTP referers  

	You can use a wildcard before the domain `(*.example.com)` to allow all subdomains, likewise a wildcard after the domain `(*.example.com/*)` to allow all paths.  

	<!-- Using data.georgia.org  -->

---
<br>

You can also use the [Google Geocode API Directly](https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY) to fetch lat/lon values for addresses. Add your API key to the link. 
You can make up to 40,000 calls per month to the [Google Maps API](https://developers.google.com/maps/documentation/geocoding/start) at no charge.  

 

