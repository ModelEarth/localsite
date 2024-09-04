# Push from Colab to Github

### Step 1: Generate a GitHub Token

1. **Create a Personal Access Token**:  
    - Generate a personal access token on GitHub with the necessary `repo` permissions.
    
2. **Store the Token in Colab**:  
    - Save this token in the Colab notebook's Secrets section as `YOUR_COLAB_TOKEN_SECRET_NAME`. Ensure that the notebook has access to this secret.

### Step 2: Install Git and Set Up User Information

1. Install Git

		!apt-get install git

2. **Retrieve Colab Token Secret**

		from google.colab import userdata
		token = userdata.get('YOUR_COLAB_TOKEN_SECRET_NAME')

3. **Set Up User Information**:

	USERNAME = "YOUR_USERNAME"
	REPO_NAME = "YOUR_TARGET_REPO"
	EMAIL = "YOUR_EMAIL_ADDRESS"

4. **Configure Git Global Settings**:

	!git config --global user.email {EMAIL}
	!git config --global user.name {USERNAME}

### Step 3: Specify Target Repo url and Clone 

1. **Specify the Repository URL**:  

	- Construct the repository URL with your GitHub token for authentication:
	repo_url = f"https://{token}@github.com/{USERNAME}/{REPO_NAME}.git"

2. Clone the repo
	`!git clone {repo_url}`

### Step 4: Move Files to Repo and Move CWD

	!mv YOUR_FILE.CSV YOUR_REPO_PATH
	%cd YOUR_REPO_PATH

### Step 5: Add, Commit, and Push Changes

	`!git add YOUR_FILE.CSV`
	`!git commit -m "YOUR_MESSAGE"`
	`!git push {repo_url}`

# Send Data from Streamlit to GitHub

Our Realitystream Streamlit app can push user-generated model performance reports directly to a designated repository location [/output/user_generated_json](https://github.com/ModelEarth/RealityStream/tree/main/output/user_generated_json). 

To configure your credentials, simply copy the example_secrets.toml file to secrets.toml and update it with your own information. The secret is stored under the [.streamlit directory](https://github.com/ModelEarth/RealityStream/tree/main/.streamlit).

When a user runs a model, the report is sent to the specified repository location, and a download option is provided.