# Github Submodules

Note: You'll switch the branch in GitHub Desktop to get updates to a submodule, then commit your main project so it's using the most recent version of the submodule.

Afterward, you can request an update in Cloudflare (but it should just start automatically).


Working with submodules
https://github.blog/2016-02-01-working-with-submodules/

git submodule add https://github.com/<user>/rubber-band rubber-band
git commit -m "rubber-band submodule"
git submodule update --init --recursive


git submodule update --init --recursive

Or try this for detached HEAD message in Github Desktop:
git checkout -b io

git submodule add https://github.com/modelearth/io io
git submodule add https://github.com/dreamstudioapp/construction construction


Add your token to github.com path (perhaps only necessary if submodule repo is private.)
https://stackoverflow.com/questions/72786625/deploying-repos-with-submodules-using-cloudflare-pages


GitHub > Settings > Developer Setting (bottom of left column)

Using Github access token with submodules
https://medium.com/@alexander.sirenko/using-github-access-token-with-submodules-5038b6d639e8


[submodule "localsite"]
	path = localsite
	url = https://github.com/modelearth/localsite
[submodule "construction"]
	path = construction
	url = https://[token]@github.com/[account]/[repo]
[submodule "io"]
	path = io
	url = https://github.com/modelearth/io


Cloudflare > Wokers & Pages > Overview > (Choose your site)