[Starter Samples](../)
# Local Site Install

You can use [Localsite Pages](../) to create websites and stories with free GitHub hosting.  
If you get stuck at any point, feel free to DM Loren at [twitter.com/LorenHeyns](https://twitter.com/LorenHeyns).

### Quick setup for contributors

Run in your webroot folder to start a local http server.

	python -m http.server 8887

**1.** Fork our <a href="https://github.com/ModelEarth/localsite" target="_blank">localsite</a> and <a href="https://github.com/ModelEarth/io" target="_blank">io</a> repos to preview your contributions using Github Pages.

**2.** Enter your GitHub account to insert within in cmds below.

<input type="text" id="gitAccount" class="textInput" style="width:210px" placeholder="YOUR ACCOUNT"  autofocus onfocus="this.select()" oninput="updateGitCmds()"><br>

**3.** Indicate the repos you've forked:
<!-- Also add to checkboxIds array -->
<input id="localsiteForked" type="checkbox" onclick="updateGitCmds()">localsite &nbsp;&nbsp; <input id="ioForked" type="checkbox" onclick="updateGitCmds()">io &nbsp;&nbsp; <input id="data-commonsForked" type="checkbox" onclick="updateGitCmds()">data-commons &nbsp;&nbsp; <input id="data-pipelineForked" type="checkbox"  onclick="updateGitCmds()">data-pipeline  &nbsp;&nbsp; <input id="projectsForked" type="checkbox"  onclick="updateGitCmds()">projects &nbsp;&nbsp; <input id="requestsForked" type="checkbox"  onclick="updateGitCmds()">requests

Also fork <a href="https://github.com/ModelEarth/data-commons" target="_blank">data-commons</a> if you are a DemocracyLab Observable Framework data visualization volunteer.  
Also fork <a href="https://github.com/ModelEarth/data-pipeline" target="_blank">data-pipeline</a> if you are contributing python to data prep and machine learning projects.  
Also fork <a href="https://github.com/ModelEarth/projects" target="_blank">projects</a> if you are contributing to the Open WebUI interface and related python additions.
Also fork <a href="https://github.com/ModelEarth/requests" target="_blank">requests</a> if you are adding to our image and video [storyboard generation](/data-pipeline/research/stream).

**4.** Run in your local webroot folder:

<textarea id="cloneCmd" class="codetext" rows="6">
git clone https://github.com/ModelEarth/localsite localsite &&
git clone https://github.com/ModelEarth/io io &&
git clone https://github.com/ModelEarth/data-commons data-commons &&
git clone https://github.com/ModelEarth/data-pipeline data-pipeline &&
git clone https://github.com/ModelEarth/projects projects &&
git clone https://github.com/ModelEarth/requests requests</textarea>

<!-- Activate GitHub Pages so we can preview your contributions. -->

Now you can open our Projects page at: [localhost:8887/projects](http://localhost:8887/projects/)

If you encounter a broken link locally, view the page at [model.earth](https://model.earth/) or clone one of the [additional repos](https://github.com/modelearth/).

### Quick way to start your web server

To simply type "localsite" in your terminal, add a shortcut command:

On a Mac: Add to your .bash_profile file. Change /webroot to your webroot path.

	alias localsite="python3 -m http.server 8887 -d /webroot"

On a PC: Save a localsite.bat file in a directory in your system's PATH environment variables, such as C:\Windows\System32.

	@echo off
	python -m http.server 8887 -d \Site

QUESTION: How can we run the above automatically when our computer's restart?

### Refresh you local repos

To avoid merge conflicts, click "Sync Fork" on your forks in GitHub, then pull locally using GitHub Desktop. Or you can pull locally quickly by runing the cmd below after you clicked "Sync Fork" on your forked repos. (Or use the "Alternative Sync" command below.)

**1.** First go to the forks in your [Github Account](https://github.com/) and click "Sync Fork"

**2.** Run the following weekly in any repo to pull down recent updates.
Run before editing pages that others might also be editing, or pull down within Github Desktop.

<textarea id="refreshCmd" class="codetext" rows="6">
cd ../localsite && git pull https://github.com/ModelEarth/localsite main &&  
cd ../data-commons && git pull https://github.com/ModelEarth/data-commons main && 
cd ../data-pipeline && git pull https://github.com/ModelEarth/data-pipeline main &&  
cd ../projects && git pull https://github.com/ModelEarth/projects main &&  
cd ../requests && git pull https://github.com/ModelEarth/requests main &&  
cd ../io && git pull https://github.com/ModelEarth/io main
cd ../data-commons</textarea>

After pulling down [data-commons](https://github.com/modelearth/data-commons), build your static site, generating ./dist

	yarn build	

Then visit the following to view:
<http://localhost:8887/data-commons/dist>
<http://localhost:8887/data-commons/docs>

That's it! &nbsp;You can stop the steps here. Your updated local site is now visible at: [localhost:8887/io](http://localhost:8887/io/)
<br>


## Deployment: How to Send a Pull Request

We typically use GitHub.com and GitHub Desktop to deploy changes.

1. Update your forks by clicking "Sync" for each in GitHub.com.
2. Use the Update command above to pull locally. If a conflict occurs, make a backup of your local folder, reclone and move your change files into the local clone.
3. Commit and push your local changes up to your fork.
4. Then go to our fork in GitHub.com and click "Pull Request" to submit to the main parent repo.

Alternative Sync using commands:

**1.** Fetch our main upsteam repo to sync up, then moves your local changes into your fork:

<textarea id="pullRequestCmd" class="codetext" rows="3">
git remote add upstream https://github.com/modelearth/data-pipeline &&
git fetch upstream && git checkout main && git merge upstream/main &&
git push origin main # Push the changes to your forked repository</textarea>

**2.** The submit a pull request in the GitHub website, or run:

First install hub and ask it to authenticate you through your browser:

	brew install hub && hub browse

Your browser will open a page in GitHub.com
After granting access, you'll be redirected to a page displaying an authorization token to copy.

**3.** Use GitHub Desktop and click to "Commit" changes so you can review. Then click "Push origin" in the upper right. (It's easy to forget the "Push origin" step.)

**4.**  Then run a command to submit a pull request (or submit through the GitHub website):

	hub pull-request -b modelearth:data-pipeline -h [Your GitHub Account]:data-pipeline -m "Fix typo in README" -m "This pull request fixes a typo in the README file."

The 1st quote above is for a short description. The 2nd is for extra details.

<!--
To run further commands, open a new terminal window - the prior is now dedicated to being an http server.

Or use an http server that loads URLs without including .html

	npx http-server

The npx http-server command displays your local site here:
[http://127.0.0.1:8080](http://127.0.0.1:8080)
[http://192.168.1.210:8080](http://192.168.1.210:8080)
-->

<br>
---
<br>

# Detailed steps for deploying static websites

The following steps are elaborated on after this summary.  

1. [Activate a local webroot](#webroot) on your local computer for [http://localhost:8887](http://localhost:8887/)
2. Fork the [localsite repo](https://github.com/modelearth/localsite) and turn on [GitHub Pages](#github-pages).  
After a few minutes, you can view your fork at [[your account].github.io/localsite](https://modelearth.github.io/localsite)  
3. [Clone the forked repos](#clone) into your local webroot folder.
4. Deploy your updates
5. [Fetch upstream](#fetch-upstream) changes to your forked repos.
6. [Point a domain](#domain) at your repos (optional)

<section id="webroot"></section>

## 1. Activate a webroot folder on your computer

The following will allow you to launch [http://localhost:8887/localsite/](http://localhost:8887/localsite/).&nbsp; You'll view multiple repos in the same webroot.

Create a webroot folder called "webroot" in your "Documents" folder, or anywhere you prefer.
Go to the webroot folder and run the following to view pages locally at http://localhost:8887  

	python -m http.server 8887

Run the command above to restart your localhost server whenever you restart your computer.
If that doesn't work, here are more options for [activating your webroot](../webroot).


<section id="github-pages"></section>

## 2. Click the "Fork" button in the upper right of the [localsite repo](https://github.com/modelearth/localsite)

Fork both the [localsite repo](https://github.com/modelearth/localsite) and the [io repo](https://github.com/modelearth/io).
If you are making pipeline updates, also fork [data-pipeline repo](https://github.com/modelearth/data-pipeline). 
If you are generating data updates, fork [community-data](https://github.com/modelearth/community-data) and [community-forecasting](https://github.com/modelearth/community-forecasting) for timeline data. 

Activate GitHub Pages for each of your forked repos by going to "Settings > Pages" and choosing "main" (or master) then save.

<div style="border:1px solid #ccc; padding:15px; display:inline-block; margin-bottom:20px">
<img src="../img/github-pages.png">
</div>

IMPORTANT: DO NOT SELECT A THEME - The Jekyll theme will break the modular site integration.  

Wait a few minutes for a new GitHub Pages site to become available in the following link format:

https://[your account].github.io/io
https://[your account].github.io/localsite


<section id="clone"></section>

## 3. Clone forked repos into your webroot

Now go to [your github account](https://github.com) and clone the forked repos listed above.

To clone, click the green "Code" button followed by "Open in GitHub Desktop."

Save the clone in the webroot folder you created in step 1.  

A static page should now be visible at [http://localhost:8887/localsite/](http://localhost:8887/localsite/)  

Also clone the <a href='https://github.com/modelearth/io/'>io repo</a> into the same webroot to include the input-output widgets. [Learn more](../../../io/charts/)    

If you are making a custom page, also clone the <a href='https://github.com/modelearth/apps/'>apps repo</a>.

To redirect into a repo, you can place an index.html file in your webroot with the following redirect:  

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

Learn more about [JAM Stack Development](https://jamstack.org) - the process of creating fast sites using static pages with CSV files, JSON&nbsp;and&nbsp;APIs.  

Edit online using [stackedit.io](https://stackedit.io/) and [Dillinger Markdown to HTML](https://dillinger.io/)  

[AWS Amplify, and site hosting info](https://model.earth/aws/amplify/) - Azure, Firebase, GitHub Pages, Netlify and more.

---
<br>

[Edit the page above in Github](https://github.com/modelearth/localsite/blob/master/start/README.md) - [Edit in StackEdit](https://stackedit.io/app#providerId=githubWorkspace&owner=localsite&repo=localsite&branch=) - Click folder icon in upper right within StackEdit. ([Direct links are not yet available in StackEdit](https://community.stackedit.io/t/open-file-from-github-using-a-link/495))






