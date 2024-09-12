# Push files from a Colab to Github

### Step 1: Retreice GitHub Personal Token

**Create a Personal Access Token**:  
	Generate a personal access token on GitHub with the necessary `repo` permissions.
    
**Store the Token in Colab**:  
	Save this token in the Colab notebook's Secrets section as `YOUR_COLAB_TOKEN_SECRET_NAME`. Ensure that the notebook has access to this secret.

### Step 2: Install Git and Set Up User Information

**Install Git**:

		!apt-get install git

**Retrieve Colab Token Secret**:

		from google.colab import userdata
		token = userdata.get('YOUR_COLAB_TOKEN_SECRET_NAME')

**Set Up User Information**:

		USERNAME = "YOUR_USERNAME"
		REPO_NAME = "YOUR_TARGET_REPO"
		EMAIL = "YOUR_EMAIL_ADDRESS"

**Configure Git Global Settings**:

		!git config --global user.email {EMAIL}
		!git config --global user.name {USERNAME}

### Step 3: Specify Target Repo url and Clone 

**Specify the Repository URL**:  
	Construct the repository URL with your GitHub token for authentication. This variable needs to be in the same code block with user information variables.

		repo_url = f"https://{token}@github.com/{USERNAME}/{REPO_NAME}.git"

Clone the repo

		!git clone {repo_url}

### Step 4: Move Files to Repo and Move CWD

		!mv YOUR_FILE.CSV YOUR_REPO_PATH
		%cd YOUR_REPO_PATH

### Step 5: Add, Commit, and Push Changes

		!git add YOUR_FILE.CSV
		!git commit -m "YOUR_MESSAGE"
		!git push {repo_url}

<br>

# Use Personal Supabase Key in Google Colab

In the left navigation panel, click on the key icon to input the secret value for your Supabase personal key. Add a new secret, name it 'supabase_key', and paste your key value. Then, grant notebook access to your ExiobaseSupabase Colab.

