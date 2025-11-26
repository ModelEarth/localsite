// Pulls files from a GitHub repo to create galleries and reports
function exploreFiles(param) {

        if (param.showother && window.location.origin.indexOf('github') < 0) {
            // To view from github when on another domain
            param.owner = 'modelearth'; // owner_username
            param.repo = 'reports'; // repository_name
            param.branch = 'main'; // or whichever branch you want to access
        }

        let owner = param.owner; // owner_username
        let repo = param.repo; // repository_name
        let branch = param.branch; // or whichever branch you want to access
        //let subfolder = param.subfolder; // TODO - activate

        if (!param.repo && window.location.origin.indexOf('github') >= 0) { // Get repo from current path
            
            // Get the current subfolders to limit display
            const url = window.location.origin + window.location.pathname;
            function parseCurrentURL(param) {
              
              const urlObj = new URL(url);

              // Extract the GitHub account name from hostname
              const gitAccount = urlObj.hostname.split('.')[0];

              // Break path into parts and filter out empty strings
              const segments = urlObj.pathname.split('/').filter(Boolean);
              const repoName = segments[0];

              // Locate "tree" and extract everything after "tree/{branch}"
              const treeIndex = segments.indexOf('tree');
              let subfolderArray = segments.slice(treeIndex + 2); // Skip 'tree' and the branch

              // Remove final segment if it appears to be a filename (contains '.')
              if (subfolderArray.length && subfolderArray.at(-1).includes('.')) {
                subfolderArray.pop();
              }

              return { gitAccount, repoName, subfolderArray };
            }
            const { gitAccount, repoName, subfolderArray } = parseCurrentURL(url, param);
            owner = gitAccount;
            repo = repoName;
            if(!branch) {
                branch = "main";
            }
        }
        if(window.location.origin.indexOf('github') >= 0) {
            //alert("owner " + owner); // "datascape"
            //alert("repo " + repo);
            //alert("branch " + branch)
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
                const mdFiles = data.tree.filter(file => /\.(md)$/i.test(file.path));
                const htmlFiles = data.tree.filter(file => /\.(htm|html)$/i.test(file.path));
                const csvFiles = data.tree.filter(file => /\.(csv)$/i.test(file.path));
                const otherFiles = data.tree.filter(file => !/\.(jpg|jpeg|png|gif|md|htm|html|csv)$/i.test(file.path));
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
                    $('#exploreOutput').append(thumbnail);
                });
                if (csvFiles) {
                    //$('#exploreOutput').append("<h2>Reports (CSV Files)</h2>");
                    $('#exploreOutput').append("<style>.tableSurround{border:1px solid #aaa;border-radius:20px;background:#fff;padding:20px}.dark .tableSurround{background:#313131}</style");
                    csvFiles.forEach(function(file, index) {
                        // You can use file.path, file.url, file.size, file.type, etc.
                        const fileURL = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
                        const githubURL = `https://github.com/${owner}/${repo}/tree/${branch}/${file.path}`;
                        const createdAt = file.created_at; // Date created
                        const updatedAt = file.updated_at; // Date updated

                        my = {}; // Drops entanglement
                        my.dataset = fileURL;
                        my.elementID = "exploreTable" + (index + 1);
                        loadEarthScape(my);

                        my.title = file.path
                          .split('/').pop()           // Get filename after last slash
                          .split('.').slice(0, -1).join('.') // Remove file extension
                          .replace(/[_-]/g, ' ')      // Replace underscores and dashes with spaces
                          .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word

                        // Create thumbnail and add to gallery
                        const fileoutput = `<div style="margin-bottom:30px" class="tableSurround">
                            <div style="font-size:18px;margin-bottom:6px">${my.title}</div>
                            <div id="${my.elementID}"></div>
                            <div style="font-size:11px;margin-top:8px">&nbsp;<a href="${githubURL}">${file.path}</a> | <a href="${fileURL}">raw</a></div>
                            <!--
                            <p>Created: ${createdAt}</p>
                            <p>Updated: ${updatedAt}</p>
                            -->
                        </div>`;
                        $('#exploreOutput').append(fileoutput);
                    });
                }
                if (param.showother) { // Non image files
                    if (location.host.indexOf('localhost') >= 0) {
                        $('#exploreOutput').append("<h2>Explore Output (Localhost)</h2>(Under Development)");
                        otherFiles.forEach(function(file) {
                            // You can use file.path, file.url, file.size, file.type, etc.
                            const fileURL = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
                            const createdAt = file.created_at; // Date created
                            const updatedAt = file.updated_at; // Date updated

                            // Create thumbnail and add to gallery
                            const fileoutput = `<div class="">
                                ${file.path}

                                <!--
                                <p>Created: ${createdAt}</p>
                                <p>Updated: ${updatedAt}</p>
                                -->
                            </div>`;
                            $('#exploreOutput').append(fileoutput);
                        });
                    }
                }
            },
            error: function(err) {
                console.error('Error fetching data:', err);
            }
        });
}


// Enhanced chart display for ML reports - Added by Akhil
function displayCharts(param) {
    // Set defaults if coming from external domain
    if (param.showother && window.location.origin.indexOf('github') < 0) {
        param.owner = 'modelearth';
        param.repo = 'reports';
        param.branch = 'main';
    }

    let owner = param.owner || 'akhilaguska27';
    let repo = param.repo || 'reports';
    let branch = param.branch || 'main';

    console.log('[displayCharts] Starting with params:', {owner, repo, branch});

    // Get current path from URL for GitHub Pages
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    let currentFolder = pathParts.slice(1).join('/'); // Skip repo name
    
    console.log('[displayCharts] Current folder:', currentFolder);

    $.ajax({
        url: `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        method: 'GET',
        success: function(data) {
            console.log('[displayCharts] GitHub API response:', data);
            
            // Filter PNG files in current folder only
            const allPNGs = data.tree.filter(file => {
                if (!/\.png$/i.test(file.path)) return false;
                const fileFolder = file.path.substring(0, file.path.lastIndexOf('/'));
                const matches = fileFolder === currentFolder;
                if (matches) {
                    console.log('[displayCharts] Found chart:', file.path);
                }
                return matches;
            });

            console.log('[displayCharts] Total PNG files found:', allPNGs.length);

            if (allPNGs.length === 0) {
                console.warn('[displayCharts] No PNG files found in folder:', currentFolder);
                $('#exploreOutput').append('<p style="color:#999;">No chart visualizations found in this folder.</p>');
                return;
            }

            // Add styling and container
            $('#exploreOutput').append(`
                <style>
                    .chart-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
                        gap: 24px;
                        margin: 30px 0;
                    }
                    @media (max-width: 768px) {
                        .chart-grid { grid-template-columns: 1fr; }
                    }
                    .chart-card {
                        background: white;
                        border-radius: 12px;
                        padding: 24px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                        transition: transform 0.2s;
                    }
                    .chart-card:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 6px 20px rgba(0,0,0,0.12);
                    }
                    .chart-card h3 {
                        margin: 0 0 16px 0;
                        color: #2c3e50;
                        font-size: 18px;
                        font-weight: 600;
                    }
                    .chart-card img {
                        width: 100%;
                        height: auto;
                        border-radius: 8px;
                        cursor: pointer;
                    }
                    .dark .chart-card { background: #313131; }
                    .dark .chart-card h3 { color: #fff; }
                </style>
                <h2>Analysis Visualizations</h2>
                <div class="chart-grid" id="chartGrid"></div>
            `);

            // Display each PNG file
            allPNGs.forEach(file => {
                const imagePath = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
                const fileName = file.path.split('/').pop().replace('.png', '').replace(/_/g, ' ');
                const title = fileName.charAt(0).toUpperCase() + fileName.slice(1);
                
                console.log('[displayCharts] Adding chart:', title);
                
                const chartHTML = `
                    <div class="chart-card">
                        <h3>${title}</h3>
                        <a href="${imagePath}" target="_blank">
                            <img src="${imagePath}" alt="${title}" loading="lazy">
                        </a>
                    </div>
                `;
                $('#chartGrid').append(chartHTML);
            });
            
            console.log('[displayCharts] Successfully displayed', allPNGs.length, 'charts');
        },
        error: function(err) {
            console.error('[displayCharts] Error fetching from GitHub:', err);
            $('#exploreOutput').append('<p style="color:red;">Error loading charts. Check console for details.</p>');
        }
    });
}
