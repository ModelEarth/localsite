# Google secretmanager

## Enable Google Cloud Secret Manager API in project

	gcloud services enable secretmanager.googleapis.com --project=your-project-id

## Create the secret with your GitHub token
data-file=- tells the command to use the token provided, rather than a text file path.

	echo "YOUR_ACTUAL_GITHUB_TOKEN_HERE" | gcloud secrets create github-token-stream2025 \
	    --project=your-project-id \
	    --data-file=-

## Add each approved user (replace token name, project id and google email addresses)

	gcloud secrets add-iam-policy-binding github-token-name \
	    --project=your-project-id \
	    --member="user:who@email.com" \
	    --role="roles/secretmanager.secretAccessor"


Python for testing resides in step near end of [Run Models colab](../../../../realitystream/).