# Earthscape

Earthscape is a fork of [Chatbot UI](https://github.com/mckaywrigley/chatbot-ui).  

## Earthscape Update

Once you've installed locally, run the following to launch and update:

	python3 -m venv .env.local &&
	source .env.local/bin/activate &&
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
<!--
Using .env resulted in: failed to load .env: read .env: is a directory.
So using existing .env*.local from .gitignor for folder named .env.local
-->

	python3 -m venv .env.local &&
	source .env.local/bin/activate &&
	npm install

Mac cmd. For Windows [see steps](https://github.com/modelearth/earthscape/)

	brew install supabase/tap/supabase

Start superbase and fill secrets:

	supabase start &&
	cp .env.local.example .env.local &&
	supabase status


File for global API Keys:
.env.local.example

## Current errors:

npm run update
failed to connect to postgres: failed to connect to `host=127.0.0.1 user=postgres database=postgres`: dial error (dial tcp 127.0.0.1:54322: connect: connection refused)

supabase start
failed to start docker container: Error response from daemon: Mounts denied: approving /Users/helix/Library/Data/earthscape/supabase/functions: file does not exist

supabase status
Error response from daemon: No such container: supabase_db_chatbotui