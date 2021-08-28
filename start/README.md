# Getting Started  

You can use these steps to create a website with free GitHub hosting  

<!--

	Not using curretnly, made a physcial copy instead
	https://github.com/ModelGeorgia/io/compare/master...modelearth:master

	Removed domain model.georgia.org from GitHub pages.

	https://github.com/modelearth/localsite/compare/master...localsite:master

	Georgia Data
	https://github.com/GeorgiaData/io/compare/master...modelearth:master
	https://github.com/GeorgiaData/localsite/compare/master...modelearth:master
-->

### We'll help you create a new website repo, or a custom page within our "apps" repo

First, clone the [apps repo](https://github.com/modelearth/apps), the [localsite repo](https://github.com/modelearth/localsite), and the [io repo](https://github.com/modelearth/io).  Place all three in the same local webroot folder.<br><br> 


# Local Webroot Setup

## 1. Activate a webroot folder on your computer

The following will allow you to launch [http://localhost:8887/localsite/](http://localhost:8887localsite/) to view multiple repos in the same webroot.

WITH A PYTHON COMMAND:

Go to the folder where you'd like your webroot to reside and run the following to view pages on localhost:  
Run this command to start localhost whenever you restart your computer.

	python -m http.server 8887

 Or run anywhere and include a path to your webroot. Change /Sites to your custom path.  
 You may be prompted to install XCode if this is your first use of Python 3.  

 	python3 -m http.server 8887 -d /Sites

If the above do not work, you can also try:  

	python -m SimpleHTTPServer 8887

If you receive the message: "This site can't provide a secure connection", [upgrade](https://www.freecodecamp.org/news/python-version-on-mac-update/) from Python 2.7 to 3+.

MORE OPTIONS:  

ON A PC: [Install IIS](https://www.techwalla.com/articles/how-to-circumvent-mcafee-dlp) to view using http://localhost/  &nbsp; With this approach you'd avoid typing the port number.


 WITH CHORME: Alternatively, you can install [Web Server for Chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb?hl=en) to view and develop pages offline using http://localhost:8887 on your computer. Web Server for Chrome also allows you to [load a custom domain](https://medium.com/@jmatix/using-chrome-as-a-local-web-server-af04baffd581). Web Server for Chrome does not work as a Brave browser extension on Mac (as of December 2019), but you can add as a Chrome extension, then utilize from within Brave.

 On a Mac, you can add a shorthand "localsite" command in your .bash_profile file. Change /Site to your webroot:

 	alias localsite="python3 -m http.server 8887 -d /Site"

## 2. Clone the "localsite" repo into your webroot 

Place the <a href='https://github.com/modelearth/localsite/'>localsite repo</a> within the root of your local web folder, along with other repos that reference&nbsp;it, such as the [apps repo](https://github.com/modelearth/apps) and the [io repo](https://github.com/modelearth/io).  

Fork any repo you intend to edit, such as the apps repo. (Click the Fork button in the upper right, then clone from your fork.) 

Click the green "Code" button and "clone" the repos you don't plan to edit. (You can convert a clone to a fork later.)   

Choose "Open with Github Desktop" to pull down using <a href="https://desktop.github.com/">GitHub Desktop</a>.  

Save the file in the webroot folder you created in step 1.  

A static page should now be visible at [http://localhost:8887/localsite/](http://localhost:8887/localsite/)  
An industry impact widget is embedded on the page.  

Also clone the <a href='https://github.com/modelearth/apps/'>apps repo</a> if you are making a custom entry page.  

Also clone the <a href='https://github.com/modelearth/io/'>io repo</a> into the same webroot to include the input-output widgets. [Learn more](../../../io/charts/)    


For the address search to work, you'll need to get a new Google Maps API key. You can get yours and enable it by following these instructions: [https://developers.google.com/maps/documentation/javascript/get-api-key](https://developers.google.com/maps/documentation/javascript/get-api-key)  

When you get a key, set the google_api_key in localsite/map/auto/config.json
<!--
\_config.yml.
-->

## 3. Deploy your updates

Deploy your updates using GitHub. If you are not a project collaborator, GitHub Desktop will prompt you to create a project fork on GitHub. Place a pull request when your updates are ready for review.  

<!--
- <a href='https://github.com/modelearth/io'>io</a> - overview
- <a href='https://github.com/georgiadata/smartdata'>smartdata</a> - data

A 404 error will occur for the private smartdata folder if you are not a collaborator. 
-->

<!--
## 4. Update markdown pages

Add notes and links in the README.md files which are pulled into index.html pages.  

- [Bioeconomy Planner - BEA](../../bea)  
- [Industry Impact](../../industries)  
- [Localization - Places](../../places)  
-->

<!--
## 5. Update dataset layouts

Use a Google Sheet or CSV file to [prototype a list or chart](../dataset) and update [EEIO Widgets](https://model.earth/io/charts/) that load from JSON files generated by the USEEIO API.  
-->

<!--
1. [Set up crowdsourced editing](../../../crowdsource/editor) of data for lists and maps.

1. Copy the "starter" folder inside community and give it the name of your community or module.
-->


### Mac Users
To avoid commiting your local .DS\_Store files to GitHub, you can run the following to ignore .DS\_Store files during commits forever. The .DS\_Store files will continue to set icon sizes in your local file manager.   
 
<!-- Avoid .DS_Store file creation over network connections (article from 2011, confirm this still occurs)
	https://support.apple.com/en-us/HT1629 -->
	git config --global core.excludesfile ~/.gitignore  
	echo .DS_Store >> ~/.gitignore

If you encounter the error "xcrun: error: invalid active developer path", [install the Xcode toolkit](https://ma.ttias.be/mac-os-xcrun-error-invalid-active-developer-path-missing-xcrun/) first.  

You can toggle hidden file viewing using Command+Shift+Dot, .DS_Store will not be displayed. 
To fix a conflict you may need delete the .DS_Store within the Github.com website.  


## 4. Activate your website

### Turn on Github Pages to view your site online

To activate GitHub Pages on your fork’s settings page, set the Github Pages Source to “Branch: master” with “/(root)“. Wait a few minutes for new GitHub Pages site to become available at the Github.io link.  You can point a domain at all the repos in your Github account with the steps below.  

### How to host multiple repos in one site using Github Pages - without using subdomains

- Use CloudFlare.com as a free proxy for your domain name - [setup steps](cloudflare/) - [more about Cloudflare with GitHub](https://www.toptal.com/github/unlimited-scale-web-hosting-github-pages-cloudflare)  
- Important: If you are using the same domain for Google email accounts, avoid adding the 4 Google A records (these prevent adding the CNAME record). You'll only need to add the 5 MX records provided by Google.  
- Create a repo in your primary account matching the name of the account: [github username].github.io  
- Click settings and activate GitHub Pages for your [github username].github.io and each repo that is a subfolder in your site.  
- Add your custom domain name to the root repo called [github username].github.io.  
- Add a CNAME record for your domain in CloudFlare with @ and [secondary github username].github.io. Using a secondary GitHub username allows more than one repo folder to be accessible through your primary domain.   

- Wait 2 to 10 minutes for new GitHub Pages site to become available.
- Activate GitHub Pages for each additional repo residing within the primary account. These can be forks from other accounts.  
- Avoid putting referenced files in your [github username].github.io root repo because it won't be the root of your site when you view on localhost.  
- Fork the "[localsite](https://github.com/modelearth/localsite/)" repo into your GitHub account if you'd like to include it's functionality in any of your sites. Turn on GitHub pages to display at YourDomain.com/localsite/  


## 5. Update your forked repos

### Occasionally merge in updates from the main repos (localsite and io) by doing a "pull request"

- On your forked repo: Click Compare 
- Flip the order. (Pick a third repo temporarily because if the two match a warning occurs.)<!-- switching the base (if you have not switched already) -->
- Create pull request > Give the pull request a title 
- Create pull request (again) 
- Merge pull request (scroll down) > Confirm merge.  

[Images of steps for updating your fork](https://stackoverflow.com/questions/20984802/how-can-i-keep-my-fork-in-sync-without-adding-a-separate-remote/21131381#21131381)


## Additional Resources

<a href="https://neighborhood.org/localsite/">The Localsite Framework</a> is designed to allow multiple Github repos to communicate using hash values.  

<a href="../../community/start/">View Starter Samples</a> - maps, charts, widgets.  <a href="../../io/team/">Contact our team for pointers</a> and <a href="../../community/challenge/meetups/">join us on Slack</a>.  

Learn more about [JAM Stack Development](https://jamstack.org) - the process of creating fast sites using static pages with CSV files, JSON and APIs.  

Edit online using [stackedit.io](https://stackedit.io/) and [Dillinger Markdown to HTML](https://dillinger.io/)  

[AWS Amplify, and site hosting info](https://model.earth/aws/amplify/) - Azure, Firebase, GitHub Pages, Netlify and more.

<!--stackedit_data:
eyJkaXNjdXNzaW9ucyI6eyJUVnA4TEhxcU93YTk2N1Y2Ijp7In
N0YXJ0Ijo3MTU5LCJlbmQiOjcxNjMsInRleHQiOiJFZGl0In19
LCJjb21tZW50cyI6eyJoZnUwbjMwM0RrdEV6d25uIjp7ImRpc2
N1c3Npb25JZCI6IlRWcDhMSHFxT3dhOTY3VjYiLCJzdWIiOiJn
aDoyNjAwNDIzOSIsInRleHQiOiJJcyBhbnlvbmUgZWxzZSB1c2
luZyBzdGFja2VkaXQuaW8/IEl0J3MgY29vbC4iLCJjcmVhdGVk
IjoxNjA4MzkzMTE2NjUxfX0sImhpc3RvcnkiOlsxNzcyNzQ2OD
Y5LDE0MTk2NDEzOTFdfQ==
-->


---
<br>
[Edit the page above in Github](https://github.com/modelearth/localsite/blob/master/start/README.md) - 
[Edit in StackEdit](https://stackedit.io/app#providerId=githubWorkspace&owner=localsite&repo=localsite&branch=) - Click folder icon in upper right within StackEdit. ([Direct links are not yet available in StackEdit](https://community.stackedit.io/t/open-file-from-github-using-a-link/495))






