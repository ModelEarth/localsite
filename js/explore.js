// Pulls files from a GitHub repo to create galleries and reports
function exploreFiles(param) {

        const owner = param.owner; // owner_username
        const repo = param.repo; // repository_name
        const branch = param.branch; // or whichever branch you want to access
        const subfolder = param.subfolder; // TODO - activate

        if (!param.entirerepo) {
            // Get the current subfolders to limit display
            const url = window.location.origin + window.location.pathname;
            function parseCurrentURL(param) {
              
              const urlObj = new URL(url);

              // Extract the GitHub account name from hostname
              const gitAccount = urlObj.hostname.split('.')[0];

              // Break path into parts and filter out empty strings
              const segments = urlObj.pathname.split('/').filter(Boolean);

              // Locate "tree" and extract everything after "tree/{branch}"
              const treeIndex = segments.indexOf('tree');
              let subfolderArray = segments.slice(treeIndex + 2); // Skip 'tree' and the branch

              // Remove final segment if it appears to be a filename (contains '.')
              if (subfolderArray.length && subfolderArray.at(-1).includes('.')) {
                subfolderArray.pop();
              }

              return { gitAccount, subfolderArray };
            }
            const { gitAccount, subfolderArray } = parseCurrentURL(url, param);
            //alert(gitAccount);       // "datascape"
            //alert("subfolder: " + subfolderArray);   // ["reports", "myreport"]
        }

        // Make AJAX request to GitHub API to get list of files
        $.ajax({
            url: `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
            method: 'GET',
            success: function(data) {
                // Filter out only image files (you may need to adjust this)
                // Omiting png since used for arrow images.
                const imageFiles = data.tree.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file.path));
                const otherFiles = data.tree.filter(file => !/\.(jpg|jpeg|png|gif)$/i.test(file.path));
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
                if (param.showother) {
                    otherFiles.forEach(function(file) {
                        // You can use file.path, file.url, file.size, file.type, etc.
                        const fileURL = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
                        const createdAt = file.created_at; // Date created
                        const updatedAt = file.updated_at; // Date updated

                        // Create thumbnail and add to gallery
                        const fileoutput = `<div class="">
                            <a href="${fileURL}" alt="${file.path}">${file.path}</a>

                            <!--
                            <p>Created: ${createdAt}</p>
                            <p>Updated: ${updatedAt}</p>
                            -->
                        </div>`;
                        $('#gallery').append(fileoutput);
                    });
                }
            },
            error: function(err) {
                console.error('Error fetching data:', err);
            }
        });
    
}