<!--
https://chat.openai.com/c/94f107ae-5e51-4719-b64f-651eaa7f2b27
https://chat.openai.com/share/82ca2102-1acd-4e94-8581-280365e012e3
-->
# About ChatGPT Dev

There was still a lot of tweaking to get the form elements looking good.
The following would have benefited from more guidance about css and layout.
Should have told it to:

## Provided to ChatGPT 3.5

Create a JQuery Web form for choosing API Providers and entering API keys for each provider using a repeating form section called aProviders that initially shows one section panel followed by an "Add API" button. As changes are made, update an object stored in localStorage call aPro and use that object to repopulate form content when reloading the html page.

On the right side of the repeating aProviders form section panel, include a div with style="float:left;" that contains one dropdown menu with id="apiProvider1" with the title over over the dropdown element being "API Provider". The dropdown should show "Select a provider..." prior to making a selection. Add a blank value attribute to the first option in the 'apiProvider' dropdown.

The API Provider dropdown should contain 20 popular API providers in alphabetical order followed with the choice "Other". Include the following in the list of API Providers: Observable API, Google Data Commons, ChatGPT Pro, ChatGPT Assistant, GitHub, Replicate API, Building Transparency.  Include additional popular API Providers in this list so the total is 25.  When "Other" is selected, reveal a text field with id="apiProviderOther1" below the dropdown with the placeholder text "Other Provider". When "Other" is not selected in the apiProvider dropdown, hide the apiProviderOther text field.

To the right of the API Provider div, include an adjacent div with style="overflow:auto" containing a text input field id="apiKey1" with text over it saying "API Key". Use css to make this right div (in the repeating section) fall under the left div when the screen is narrow. When an apiKey text field is cleared, delete the corresponding key-value pair in the aPro object which is stored in localStorage. If the user hits return while their cursor is in a cleared field containing no text, hide that repeating section, unless it is the first repeating section.

Display an "Add API" button for revealing additional instances of the repeating sections so the user can add additional API keys, up to 50.  As section panels are added, increment the panel form element id numbers - so the second panel instance would contain: apiProvider2, apiProviderOther2 and apiKey2. When changes are made, update an object in localStorage called aPro with key-value pairs . Use the apiProvider selections (and apiProviderOther value when visible and not blank) as the keys and the apiKey text entered as the value. If the "Other" option is selected, use the API Provider title entered in the other text field as the key. When using the API Providers as keys in the aPro object, replace spaces with underscores. If the incoming key-value pairs have the same API Provider more than once, in the key name append "2" to the second repetition, append "3" after the third, etc. Avoid appending "1" to the first instance. 

When the html page is reloaded, display and populate repeating aProviders panels using a function that uses the key-value pairs from the aPro object pulled from localStorage. To find key matches in the dropdown, modify the key by removing the number appended to the right of the apiProvider key names and replace underscores with spaces. If a match is not found in the dropdown options, display this modified key in the panel's apiProviderOther field, show the apiProviderOther field and set the panel's dropdown to "Other".

Provide a "Copy" button that allows the user to copy the aPro object as yaml from a textarea with id="aProOutput" revealed when clicking the "Copy" button. Also copy the yaml into their clipboard when they click "Copy". Display a "Close" button after the aProOutput textarea. When clicking "Close", hide the aProOutput textarea and hide the ""Close" button.

Provide a "Paste" button that reveals a textarea with id="aProInput" for the user to paste the copied yaml string to add keys. When they click an "Update" button below the aProInput textarea, add the key-value pairs from the pasted yaml to the aPro object in localStorage as long as the incoming key-value pairs are not already represented. When checking if a key-value pair is already represented, exclude the appended numbers on the right side of both the existing object keys and the incoming keys from the yaml during comparisons of API Provider strings. Only replace a key-value pair if the incoming yaml key string exactly matches an apiProvider key string in the aPro object. When inserting into the aPro object, append numbers starting with 2 if the API Provider already exists in the aPro object. If 2 already exist, then append 3, etc.

Include a "Clear All" button that prompts the user: Are you sure? Enter "YES" to proceed. Show a text field for typing in the word YES.  If the user enters "YES" and hits return, then clear the aPro object from localStorage and set all the repeating sections to blank. Display a confirmation: Your API Keys have been cleared from local storage, and hide the field where they entered "YES".

<!--
#3498db, #2980b9 (Blue)
#2ecc71, #27ae60 (Green)
#e74c3c, #c0392b (Red)
#f39c12, #e67e22 (Orange)
#9b59b6, #8e44ad (Purple)
#1abc9c, #16a085 (Turquoise)
#e67e22, #d35400 (Pumpkin)
#34495e, #2c3e50 (Navy)
#f1c40f, #f39c12 (Yellow)
#95a5a6, #7f8c8d (Grey)
-->

<!--
		function generateRepeatingSectionVerbose(index) {
	  var popularProviders = [
	    "Amazon Web Services (AWS)",
	    "Building Transparency API",
	    "ChatGPT Assistant API",
	    "ChatGPT Pro API",
	    "Dropbox API",
	    "eBay API",
	    "Facebook Graph API",
	    "GitHub API",
	    "Google API",
	    "Google Data Commons API",
	    "IBM Watson API",
	    "Instagram Graph API",
	    "LinkedIn API",
	    "Mailchimp API",
	    "Microsoft Azure API",
	    "Observable API",
	    "PayPal API",
	    "Reddit API",
	    "Replicate API",
	    "Salesforce API",
	    "SendGrid API",
	    "Shopify API",
	    "Slack API",
	    "Spotify Web API",
	    "Stripe API",
	    "Twilio API",
	    "Twitter API",
	    "Yelp API",
	    "YouTube API",
	    "Zoom API"
	  ];

	  popularProviders.sort();

	  var html = '<div class="repeating-section" id="panel' + index + '">' +
	             '  <div style="float: left;">' +
	             '    <label for="apiProvider' + index + '">API Provider</label>' +
	             '    <select id="apiProvider' + index + '">' +
	             '      <option>Select a provider...</option>';

	  for (var i = 0; i < popularProviders.length; i++) {
	    html += '<option>' + popularProviders[i] + '</option>';
	  }

	  html += '      <option>Other</option>' +
	          '    </select>' +
	          '    <input type="text" id="apiProviderOther' + index + '" placeholder="Other Provider" style="display: none;">' +
	          '  </div>' +
	          '  <div style="overflow: auto;">' +
	          '    <label for="apiKey' + index + '">API Key</label>' +
	          '    <input type="text" id="apiKey' + index + '">' +
	          '  </div>' +
	          '</div>';
	  return html;
	}
-->