// Pulls files from a GitHub repo to create galleries and reports
function exploreFiles(param) {
    const owner = param.owner; // owner_username
    const repo = param.repo; // repository_name
    const branch = param.branch; // or whichever branch you want to access

    // Make AJAX request to GitHub API to get list of files
    $.ajax({
        url: `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        method: 'GET',
        success: function(data) {
            // Filter out only image files (you may need to adjust this)
            // Omiting png since used for arrow images.
            const imageFiles = data.tree.filter(file => /\.(jpg|jpeg|gif)$/i.test(file.path));

            // Now you have the list of image files with their details
            imageFiles.forEach(function(file) {
                // You can use file.path, file.url, file.size, file.type, etc.
                const imagePath = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
                const createdAt = file.created_at; // Date created
                const updatedAt = file.updated_at; // Date updated

                // Create thumbnail and add to gallery
                const thumbnail = `<div class="thumbnail">
                    <a href="${imagePath}" alt="${file.path}"><img src="${imagePath}" alt="${file.path}"></a>

                    <!--
                    <p>Created: ${createdAt}</p>
                    <p>Updated: ${updatedAt}</p>
                    -->
                </div>`;
                $('#gallery').append(thumbnail);
            });
        },
        error: function(err) {
            console.error('Error fetching data:', err);
        }
    });
}