# Push to GitHub

## Send Data from a CoLab or Streamlit to GitHub

Our Streamlit app can push user-generated model performance reports directly to a designated repository location (output/user_generated_json).

To configure your credentials, copy the example_secrets.toml file to secrets.toml and update it with your own information. The secret is stored under the .streamlit directory.

When a user runs a model, the report is sent to the specified repository location, and a download option is provided.