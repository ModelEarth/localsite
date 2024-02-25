# Quick Local Site Install 

You can use [Localsite Pages](../) to create websites and stories with free GitHub hosting.

If you get stuck at any point, feel free to DM Loren at [twitter.com/LorenHeyns](https://twitter.com/LorenHeyns).

### Quick local install for contributors

Fork <a href="https://github.com/ModelEarth/data-pipeline" target="_blank">our data-pipeline</a> repo and place your GitHub account name in the cmd below. Run in a local folder called "webroot":

	git clone https://github.com/ModelEarth/localsite localsite &&  
	git clone https://github.com/ModelEarth/io io &&  
	git clone https://github.com/[YOUR GITHUB ACCOUNT]/data-pipeline data-pipeline &&
	git clone https://github.com/ModelEarth/community community &&  
	python -m http.server 8887

If you are a REACT contributor, also fork the io folder.

Now you can open our active projects page at: [localhost:8887/io](http://localhost:8887/io/)
For futher commands, open a new terminal window since the prior is now dedicated to being an http server.

### Refresh you local repos

Run the following weekly in your webroot to pull down our recent updates.
(If you are contributing to updates, change "ModelEarth" to your GitHub account to pull from your forks.)

	cd localsite &&  
	git pull https://github.com/ModelEarth/localsite main &&  
	cd ../io &&  
	git pull https://github.com/ModelEarth/io main &&  
	cd ../data-pipeline &&  
	git pull https://github.com/[YOUR GITHUB ACCOUNT]/data-pipeline main &&  
	cd ../community &&  
	git pull https://github.com/ModelEarth/community master &&  
	cd ../

TO DO: Add a #gitaccount textbox at the top of this page for saving one's GitHub account in the browser cache. Repopulate [YOUR GITHUB ACCOUNT] in the cmds above when opening the page.

<!--
	Not using currently, made a physcial copy instead
	https://github.com/ModelGeorgia/io/compare/master...modelearth:master

	Removed domain model.georgia.org from GitHub pages.

	https://github.com/modelearth/localsite/compare/master...localsite:master

	Georgia Data
	https://github.com/GeorgiaData/io/compare/master...modelearth:master
	https://github.com/GeorgiaData/localsite/compare/master...modelearth:master
-->
<br>

# Detailed steps for deploying static websites

The following steps are elaborated on after this summary.  

1. [Activate a local webroot](#webroot) on your local computer for [http://localhost:8887](http://localhost:8887/)
2. Fork the [localsite repo](https://github.com/modelearth/localsite) and turn on [GitHub Pages](#github-pages).  
After a few minutes, you can view your fork at [[your account].github.io/localsite](https://modelearth.github.io/apps)  
3. [Clone the forked repos](#clone) into your local webroot folder.
4. Deploy your updates
5. [Fetch upstream](#fetch-upstream) changes to your forked repos.
6. [Point a domain](#domain) at your repos (optional)

If your site will be displaying environmental [impact widgets](https://model.earth/io/charts/), also fork the [io repo](https://github.com/modelearth/io).
For samples of location parameters, view and fork the ModelEarth [apps repo](https://model.earth/apps).  

You can generate images locally using [StableStudio](http://dreamstudio.com/studio/), the open source UX behind the [DreamStudio.ai](https://dreamstudio.ai) frontend.
<br>

<section id="webroot"></section>

## 1. Activate a webroot folder on your computer

The following will allow you to launch [http://localhost:8887/localsite/](http://localhost:8887/localsite/).&nbsp; You'll view multiple repos in the same webroot.

Create a webroot folder called "Web" in your "Documents" folder or anywhere you prefer.
Go to the webroot folder and run the following to view pages locally at http://localhost:8887  

	python -m http.server 8887

You can run the command above to start localhost whenever you restart your computer.
If that dose't work, here are more options for [activating your webroot](../webroot).



<section id="github-pages"></section>

## 2. Click the "Fork" button in the upper right of the [localsite repo](https://github.com/modelearth/localsite)

Also fork the [io repo](https://github.com/modelearth/io) and [data-pipeline repo](https://github.com/modelearth/data-pipeline). 

Activate GitHub Pages for each of your forked repos by going to "Settings > Pages" and choosing "main" (or master) then save.

<div style="border:1px solid #ccc; padding:15px; display:inline-block; margin-bottom:20px">
<img src="../img/github-pages.png">
</div>

IMPORTANT: DO NOT SELECT A THEME - The Jekyll theme will break the modular site integration.  

Wait a few minutes for a new GitHub Pages site to become available at a link in the following format:

https://[your account].Github.io/[repo name]  


<section id="clone"></section>

## 3. Clone forked repos into your webroot

Now go to [your github account](https://github.com) and clone the forked repos listed above.

To clone, click the green "Code" button followed by "Open in GitHub Desktop."

Save the clone in the webroot folder you created in step 1.  

A static page should now be visible at [http://localhost:8887/localsite/](http://localhost:8887/localsite/)  

Also clone the <a href='https://github.com/modelearth/io/'>io repo</a> into the same webroot to include the input-output widgets. [Learn more](../../../io/charts/)    

Also clone the <a href='https://github.com/modelearth/apps/'>apps repo</a> if you are making a custom page.  

To redirect into a repo, you can place an index.html file in your webroot with the following:  

	<script language="JavaScript">window.location="localsite/"</script>


## 4. Deploy your updates

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


**Mac Users:** To avoid commiting your local .DS\_Store files to GitHub, you can run the following to ignore .DS\_Store files during commits forever. The .DS\_Store files will continue to set icon sizes in your local file manager.   
 
<!-- Avoid .DS_Store file creation over network connections (article from 2011, confirm this still occurs)
	https://support.apple.com/en-us/HT1629 -->
	git config --global core.excludesfile ~/.gitignore  
	echo .DS_Store >> ~/.gitignore

If you encounter the error "xcrun: error: invalid active developer path", [install the Xcode toolkit](https://ma.ttias.be/mac-os-xcrun-error-invalid-active-developer-path-missing-xcrun/) first.  

You can view hidden files by toggling Command+Shift+Dot. Note that .DS_Store will not be displayed.<br>
To fix conflicts, you may need delete .DS_Store files within the Github.com website.  


<section id="fetch-upstream"></section>

## 5. Fetch upstream changes to your forked repos

Occasionally merge in updates from parent repos by clicking "Fetch Upstream > Fetch and Merge" in GitHub.

Or run the script to refresh your local clones on the [io/charts](../../../io/charts/) page.

<!--
In the old days you had to do the following:

- On your forked repo: Click Compare 
- Flip the order. (Pick a third repo temporarily because if the two match a warning occurs.)
- Create pull request > Give the pull request a title 
- Create pull request (again) 
- Merge pull request (scroll down) > Confirm merge.  

[Images of steps for updating your fork](https://stackoverflow.com/questions/20984802/how-can-i-keep-my-fork-in-sync-without-adding-a-separate-remote/21131381#21131381)

-->

<section id="domain"></section>

## 6. Point a domain at your repos (optional)

You can point a domain at all the repos in your Github account with the steps below.  


- Use CloudFlare.com as a free proxy for your domain name - [setup steps](../cloudflare/) - [more about Cloudflare with GitHub](https://www.toptal.com/github/unlimited-scale-web-hosting-github-pages-cloudflare). AWS can also be used.  
- Important: If you are using the same domain for Google email accounts, avoid adding the 4 Google A records (these prevent adding the CNAME record). You'll only need to add the 5 MX records provided by Google.  
- Create a repo in your primary account matching the name of the account: [github username].github.io  
- Click settings and activate GitHub Pages for your [github username].github.io and each repo that will be an additional subfolder in your site. (This requires also doing the Special Trick below.)  
- Add your custom domain name to the root repo called [github username].github.io.  
- Special Trick: When you add a CNAME record for your domain in CloudFlare use @ to indicate the root, and point a different secondary account in Github as [secondary github username].github.io. By using a secondary GitHub username, more than one adjacent repo folder will be accessible through your primary domain. (The "localsite" repo can then be forked and shared locally with your primary site.) 

- Wait 2 to 10 minutes for new GitHub Pages site to become available.
- Activate GitHub Pages for each additional repo residing within the primary account. These can be forks from other accounts.  
- Avoid putting referenced files in your [github username].github.io root repo because it won't be the root of your site when you view on localhost.  
- Fork the "[localsite](https://github.com/modelearth/localsite/)" repo into your GitHub account if you'd like to include it's functionality in any of your sites. Turn on GitHub pages to display at YourDomain.com/localsite/  

We sometimes [use Github .submodules](../submodules/) to deploy multiple repos into a single [Cloudflare site](../cloudflare/). A super high traffic site can use Cloudflare's free CDN to avoid exceeding limits in Github.


## Additional Resources

<a href="/localsite/">The Localsite Framework</a> is designed to allow multiple Github repos to communicate using hash values.  

<a href="../../../apps/">View Starter Samples</a> - maps, charts, widgets.

Learn more about [JAM Stack Development](https://jamstack.org) - the process of creating fast sites using static pages with CSV files, JSON and APIs.  

Edit online using [stackedit.io](https://stackedit.io/) and [Dillinger Markdown to HTML](https://dillinger.io/)  

[AWS Amplify, and site hosting info](https://model.earth/aws/amplify/) - Azure, Firebase, GitHub Pages, Netlify and more.

---
<br>

[Edit the page above in Github](https://github.com/modelearth/localsite/blob/master/start/README.md) - [Edit in StackEdit](https://stackedit.io/app#providerId=githubWorkspace&owner=localsite&repo=localsite&branch=) - Click folder icon in upper right within StackEdit. ([Direct links are not yet available in StackEdit](https://community.stackedit.io/t/open-file-from-github-using-a-link/495))






