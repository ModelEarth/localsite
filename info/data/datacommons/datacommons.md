[Data Setup](../)  

# Install Data Commons Lite

You'll be running a local copy of the [datacommons.org](https://datacommons.org) website, but without local data.

Clone the Google Data Commons "[website](https://github.com/datacommonsorg/website/)" repo and run commands within your cloned folder.  

In the [Data Commons Developer Guide](https://github.com/datacommonsorg/website/blob/master/docs/developer_guide.md) page, scroll down to "Develop with Flask (simple/lite)". Get your gcloud connection working using the lite steps.  

After cloning the website repo, run to load submodule "mixer":  

	git submodule foreach git pull origin master

You may need to [update node.js](https://nodejs.org/en/download/current/) if your local version is older than 10.0.0. Run to check:

	node -v  

<!-- node install says: Make sure that /usr/local/bin is in your $PATH. -->

Also install chromedriver<!-- from developer guide -->

	npm install chromedriver

You'll need to have the Google cloud sdk installed and the app engine.  To confirm you have app-engine-python installed, run the following (If needed, install by running `gcloud components install app-engine-python`).  

	gcloud components list

Update to the latest Cloud SDK by running `gcloud components update` (which also updates other components).  
<!-- SDK Auth success takes you here: https://cloud.google.com/sdk/auth_success -->

You might need to set a default gcp project locally by running `gcloud config set project <PROJECT_ID>` 

Launch the lite server. This may also provide steps to activate your DataCommons GCP permissions.  

	./run_server.sh lite


For machine learning projects, use the full install with [Minikube](https://minikube.sigs.k8s.io/docs/start/) plus [Skaffold](https://skaffold.dev/docs/install/) and [Run GPU workloads on minikube](https://cloud.google.com/blog/products/containers-kubernetes/easier-kubernetes-development-from-your-laptop?utm_source=newsletter&utm_medium=email&utm_campaign=2019-january-gcp-newsletter-en)  

## Optional: Install "tools" repo

### For covid19-dashboard sample

NOTE: To view the "tools" repo samples locally, you'll need to initiate a server from the "website" repo first. (Looking for an alternative to this, or maybe "tools" should be a submodule of "website" so all the routes continue working for both "website" and "tools".)  

The Tools repos was created by a previous Google intern using React Web starter.  

To view and edit the tools repo locally, clone [datacommonsorg/tools](https://github.com/datacommonsorg/tools) repo or the [ModelEarth fork](https://github.com/modelearth/tools)  

Open terminal. (Type CTRL+\` if you're using VS Code.)  

	cd covid19-dashboard


Run the following and choose your Google account <!-- map.g 00 -->. You should be directed to a page saying "You are now authenticated with the Google Cloud SDK!"  

	gcloud auth application-default login

Or see if you are logged in:   

	gcloud auth list

If not, you can run:  

	gcloud auth login 'your_email@domain.com'

If that does not work, this will open a browser window (delete this after confirming above works)

	gcloud auth login `ACCOUNT`

Get the ID from one of your projects. The ID appears after the project name in the [GCP Dashboard](https://console.cloud.google.com/home/dashboard). This is referred to as the QUOTA\_PROJECT\_ID.  

[Steps](https://cloud.google.com/resource-manager/docs/creating-managing-projects) for creating a project and getting your QUOTA\_PROJECT\_ID  

Add a quota project  

	gcloud auth application-default set-quota-project QUOTA_PROJECT_ID [optional flags]

This may return:  API [cloudresourcemanager.googleapis.com] not enabled on project 
[404342046192]. Would you like to enable and retry (this will take a 
few minutes)? (y/N)?  Enter y.

You may be provided with a link to enable the Service Usage API. If so, enable it. 

<!--
Might not be needed - deleted this:  
Go to [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts?authuser=1) and click "Create Service Account"  
-->

<!--
	Note: Georgia Directory is listed under Resouces Pending Deletion
-->

To get info about set-quota-project:  

	gcloud auth application-default set-quota-project --help

CTRL+C returns you to terminal. To view addition gcloud commands:

	 gcloud help

<!--
Note, the step above does not fix the "Failed to compile" errow below.  Maybe we need to make additional Google Cloud settings, perhaps for a specific project?  
GCP Project datcom-tools-staging is mentioned on the readme.  


To prevent initial error:  

In package.json AND package-lock.json, change eslint from ^6.6.0 to:

	"eslint": "^7.13.0"
-->

<!--
Fix the dependency tree, follow these steps in the exact order. (Skip step 1 if you don't have a .lock file yet. Also skip step 2 if you don't have a node_modules folder yet.):

  1. Delete package-lock.json (not package.json!) in your project folder.
  2. Delete node_modules in your project folder.
  3. Remove "eslint" from dependencies and/or devDependencies in the package.json file in your project folder.
  4. Run npm install, depending on the package manager you use.
-->

## Create a Virtual Environment (optional)

Optional, run the following within your local **tools/covid19-dashboard** folder.  
Wasn't needed. You can skip to "Install and Start" below.<!-- virtualenv -->  

Setup the environment:

	python3 -m venv .env

Run one of these:

OSX / Linux:

	source .env/bin/activate

Windows:

	\.env\Scripts\activate.bat

Optional, upgrade pip  

	pip install --upgrade pip

Install dependencies

	pip install -r requirements.txt


## Install and Start

Start the server locally:
<!-- You’d need to have the google cloud sdk installed, as well as app engine (via “gcloud components install app-engine-python”). Maybe already had those. -->

	./run_locally.sh

Open a new terminal (the server will continue running in your previous terminal)  

<!--
Carolyn Au says this should no longer be necessary  

	npm audit fix --force
-->

Install dependencies (generates node_modules folder)

	npm install


Launch site. A browser will automatically launch at http://localhost:3000/  


	npm start

However, you may need to go to http://localhost:8080/ if you do not see data visualizations at port 3000. (This assumes you've already run `./run_server.sh lite` in the "website" repo.)  

If your not seeing data yet, try running the `./run_server.sh lite` command and other preliminary steps in the 
the [Developer Guide](https://github.com/datacommonsorg/website/blob/master/docs/developer_guide.md).  The website will also occupy pot 8080, so CTRL-C it before running the covid19 site.  

Note that the development build is not optimized.
To create a production build, use: 

	npm run build.

<!--
You'll briefly see the DataCommons.org header when refreshing, then a "Failed to compile" occurs with a long list starting with the following:  

	src/App.tsx
	  Line 25:9:    Replace `GeoIdToDataType,·GeoIdToPlaceInfoType,·KeyToTimeSeriesType` with `⏎··GeoIdToDataType,⏎··GeoIdToPlaceInfoType,⏎··KeyToTimeSeriesType,⏎`                    prettier/prettier
	  Line 38:3:    Delete `⏎`                                                                                                                                                         prettier/prettier
	  Line 66:27:   The 'URLSearchParams' is not supported until Node.js 10.0.0. The configured version range is '>=8.0.0'                                                             node/no-unsupported-features/node-builtins


Chaning to the following did not allow browser to launch  

    "@babel/eslint-parser": "^7.13.0",
    "@babel/eslint-plugin": "^7.13.0",

-->

The covid19-dashboard site the worked here at port 8080  
http://localhost:8080/dashboard/?dashboardId=socialWellness


# Deploy to gcloud

To deploy the application, usr the deploy_gcloud.sh script found in covid19-dashboard.  

If you only wish to deploy the default application and not use the covid-19 script, you can deploy using the following commands:  

### Change variable if deploying to different project.
	export GOOGLE_CLOUD_PROJECT="datcom-tools-staging"

### Set the project on gcloud.
	gcloud config set project $GOOGLE_CLOUD_PROJECT

$GOOGLE_CLOUD_PROJECT is the project ID, same as QUOTA\_PROJECT\_ID

### Deploy to App Engine.
	gcloud app deploy app.yaml



