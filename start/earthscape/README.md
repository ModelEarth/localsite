# Earthscape

Earthscape is a fork of [Chatbot UI](https://github.com/mckaywrigley/chatbot-ui).  

## Earthscape Update

Once you've installed locally, run the following to launch and update:

	python3 -m venv .env &&
	source .env/bin/activate &&
	npm run update

If you run a hosted instance you'll also need to run: 

	npm run db-push

## Earthscape Install

The following condenses the [local install steps](https://github.com/modelearth/earthscape/)

If you don't have it as an app on you computer yet, [install Docker](https://docs.docker.com/get-docker/)

In your webroot:

	git clone https://github.com/modelearth/earthscape.git earthscape &&
	cd earthscape

Run in a virtual environment:

	python3 -m venv .env &&
	source .env/bin/activate

	npm install



Mac cmd. For Windows [see steps](https://github.com/modelearth/earthscape/)

	brew install supabase/tap/supabase

Install and start superbase (Windows differs, see doc)

	supabase start &&
	cp .env.local.example .env.local &&
	supabase status

