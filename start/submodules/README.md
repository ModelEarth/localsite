# Github Submodules

### Sync multiple repos to one Cloudflare site

The following will create a .gitmodules file.
This allows Cloudflare to sync multiple repos into one website.

[Working with submodules](https://github.blog/2016-02-01-working-with-submodules/)

git submodule add https://github.com/[user]/[repo] [repo]
git commit -m "[repo] submodule"
git submodule update --init --recursive

Lastly, push within Github Desktop. (The repo will already be commited.) 
You'll then see the submodule in the Github website.

**Example:**
git submodule add https://github.com/DreamStudioApp/StableStudio StableStudio
git commit -m "StableStudio submodule"
git submodule update --init --recursive

<!--Note: You'll switch the branch in GitHub Desktop to get updates to a submodule, then commit your main project so it's using the most recent version of each submodule.-->

To bring in changes to a submodule, change (cd) to the folder and do

	git pull

If a conflict occurs, [reset](https://stackoverflow.com/questions/6335681/how-do-i-get-the-latest-version-of-my-code) before pulling.

	git reset --hard HEAD
	git clean -xffd
	git pull

Or you may need to specify the path and branch. Example:

	git pull http://github.com/modelearth/localsite main

<!-- Cloudflare will automatically pull in updates when submodule repos are updated.-->
You can request a pull within Cloudflare here (both go to the same page):  

Cloudflare > Worker Routes > Manage Workers
Cloudflare > Workers & Pages > Overview > (Choose your site)


### Detached HEAD message

Try this for detached HEAD message in Github Desktop:

git checkout -b io

### Use Tokens for Private Repos

If submodule repo is private, add a token. [details](https://stackoverflow.com/questions/72786625/deploying-repos-with-submodules-using-cloudflare-pages)

Generate a token within a repo at:
GitHub > Settings > Developer Setting (bottom of left column)

[Using Github access token with submodules](https://medium.com/@alexander.sirenko/using-github-access-token-with-submodules-5038b6d639e8)


### Example of .gitmodules file

[submodule "localsite"]
	path = localsite
	url = https://github.com/modelearth/localsite
[submodule "privatestuff"]
	path = privatestuff
	url = https://[token]@github.com/[account]/[repo]
[submodule "io"]
	path = io
	url = https://github.com/modelearth/io

Note that simply adding or editing the .gitmodules file does not work. 
The add, commit and update steps above will get you set up and syncing smoothly.
