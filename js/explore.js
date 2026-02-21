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
                if (imageFiles.length) {
                    let thumbnailList = '';
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
                        thumbnailList += thumbnail;
                    });
                    $('#exploreOutput').append(`<div class="tableSurround">${thumbnailList}</div>`);
                }
                if (csvFiles) {
                    loadScript(theroot + 'js/earthscape.js', function(results) {
                        //$('#exploreOutput').append("<h2>Reports (CSV Files)</h2>");
                        $('#exploreOutput').append("<style>.tableSurround{border:1px solid #aaa;border-radius:20px;background:#fff;padding:18px 8px 18px 18px;display:flow-root} .dark .tableSurround{background:#313131}</style");
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
                                <div style="font-size:18px;margin-bottom:6px;clear:both">${my.title}</div>
                                <div id="${my.elementID}"></div>
                                <div style="font-size:11px;margin-top:8px">&nbsp;<a href="${githubURL}">${file.path}</a> | <a href="${fileURL}">raw</a></div>
                                <!--
                                <p>Created: ${createdAt}</p>
                                <p>Updated: ${updatedAt}</p>
                                -->
                            </div>`;
                            $('#exploreOutput').append(fileoutput);
                        });
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

// Enhanced chart display for ML reports - Updated per Loren's request
// Shows ALL files in folder: charts, CSVs, and links to everything else
function displayCharts(param) {
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
            
            // Filter all files in current folder only
            const allFiles = data.tree.filter(file => {
                if (file.type !== 'blob') return false; // Only files, not directories
                const fileFolder = file.path.substring(0, file.path.lastIndexOf('/'));
                const matches = fileFolder === currentFolder;
                if (matches) {
                    console.log('[displayCharts] Found file:', file.path);
                }
                return matches;
            });

            console.log('[displayCharts] Total files found:', allFiles.length);

            // Categorize files by type
            const pngFiles = allFiles.filter(f => /\.png$/i.test(f.path));
            const csvFiles = allFiles.filter(f => /\.csv$/i.test(f.path));
            const mdFiles = allFiles.filter(f => /\.(md|txt)$/i.test(f.path));
            const pdfFiles = allFiles.filter(f => /\.pdf$/i.test(f.path));
            const otherFiles = allFiles.filter(f => 
                !/\.(png|csv|md|txt|pdf|html)$/i.test(f.path)
            );

            // Don't show index.html in the file list
            const displayOtherFiles = otherFiles.filter(f => 
                !/index\.html$/i.test(f.path)
            );

            if (allFiles.length === 0) {
                console.warn('[displayCharts] No files found in folder:', currentFolder);
                $('#exploreOutput').append('<p style="color:#999;">No files found in this folder.</p>');
                return;
            }

            // Add styling
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
                    .tableSurround {
                        border: 1px solid #aaa;
                        border-radius: 20px;
                        background: #fff;
                        padding: 18px 8px 18px 18px;
                        display: flow-root;
                        margin-bottom: 30px;
                    }
                    .file-list {
                        background: #f8f9fa;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    .file-list h3 {
                        margin: 0 0 12px 0;
                        color: #2c3e50;
                        font-size: 16px;
                        font-weight: 600;
                    }
                    .file-list ul {
                        list-style: none;
                        padding: 0;
                        margin: 0;
                    }
                    .file-list li {
                        padding: 8px 12px;
                        margin: 4px 0;
                        background: white;
                        border-radius: 4px;
                        border-left: 3px solid #007bff;
                    }
                    .file-list a {
                        color: #007bff;
                        text-decoration: none;
                        font-size: 14px;
                    }
                    .file-list a:hover {
                        text-decoration: underline;
                    }
                    .file-icon {
                        margin-right: 8px;
                        opacity: 0.6;
                    }
                    .dark .chart-card { background: #313131; }
                    .dark .chart-card h3 { color: #fff; }
                    .dark .tableSurround { background: #313131; }
                    .dark .file-list { background: #2a2a2a; }
                    .dark .file-list h3 { color: #fff; }
                    .dark .file-list li { background: #313131; }
                </style>
            `);

            // Display PNG charts
            if (pngFiles.length > 0) {
                $('#exploreOutput').append(`
                    <h2>Analysis Visualizations</h2>
                    <div class="chart-grid" id="chartGrid"></div>
                `);

                pngFiles.forEach(file => {
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
            }

            // Display CSV files as tables
            if (csvFiles.length > 0) {
                $('#exploreOutput').append('<h2>Data Tables</h2>');
                
                csvFiles.forEach(function(file, index) {
                    const fileURL = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
                    const githubURL = `https://github.com/${owner}/${repo}/tree/${branch}/${file.path}`;
                    
                    let my = {};
                    my.dataset = fileURL;
                    my.elementID = "exploreTable" + (index + 1);
                    
                    my.title = file.path
                        .split('/').pop()
                        .split('.').slice(0, -1).join('.')
                        .replace(/[_-]/g, ' ')
                        .replace(/\b\w/g, char => char.toUpperCase());

                    const fileoutput = `
                        <div class="tableSurround">
                            <div style="font-size:18px;margin-bottom:6px;clear:both;font-weight:600">${my.title}</div>
                            <div id="${my.elementID}"></div>
                            <div style="font-size:11px;margin-top:8px;color:#666">
                                <a href="${githubURL}">${file.path}</a> | <a href="${fileURL}">download</a>
                            </div>
                        </div>
                    `;
                    $('#exploreOutput').append(fileoutput);
                    
                    // Load table after DOM is ready
                    setTimeout(() => loadEarthScape(my), 100);
                });
            }

            // Display other files as downloadable links
            let hasOtherFiles = false;
            let filesHTML = '<div class="file-list"><h3>📁 Additional Files</h3><ul>';

            // Add markdown/text files
            if (mdFiles.length > 0) {
                hasOtherFiles = true;
                mdFiles.forEach(file => {
                    const fileURL = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
                    const fileName = file.path.split('/').pop();
                    const icon = fileName.toLowerCase().includes('readme') ? '📖' : '📄';
                    filesHTML += `
                        <li>
                            <span class="file-icon">${icon}</span>
                            <a href="${fileURL}" target="_blank">${fileName}</a>
                        </li>
                    `;
                });
            }

            // Add PDF files
            if (pdfFiles.length > 0) {
                hasOtherFiles = true;
                pdfFiles.forEach(file => {
                    const fileURL = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
                    const fileName = file.path.split('/').pop();
                    filesHTML += `
                        <li>
                            <span class="file-icon">📕</span>
                            <a href="${fileURL}" target="_blank">${fileName}</a>
                        </li>
                    `;
                });
            }

            // Add other files
            if (displayOtherFiles.length > 0) {
                hasOtherFiles = true;
                displayOtherFiles.forEach(file => {
                    const fileURL = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
                    const fileName = file.path.split('/').pop();
                    const ext = fileName.split('.').pop().toLowerCase();
                    
                    // Choose icon based on file extension
                    let icon = '📎';
                    if (ext === 'py') icon = '🐍';
                    else if (ext === 'ipynb') icon = '📓';
                    else if (ext === 'json' || ext === 'yaml' || ext === 'yml') icon = '⚙️';
                    else if (ext === 'zip' || ext === 'tar' || ext === 'gz') icon = '📦';
                    
                    filesHTML += `
                        <li>
                            <span class="file-icon">${icon}</span>
                            <a href="${fileURL}" target="_blank">${fileName}</a>
                            <span style="color:#999;font-size:12px;margin-left:8px">(${ext.toUpperCase()})</span>
                        </li>
                    `;
                });
            }

            filesHTML += '</ul></div>';

            // Only append if there are files to show
            if (hasOtherFiles) {
                $('#exploreOutput').append(filesHTML);
            }
            
            console.log('[displayCharts] Successfully displayed', pngFiles.length, 'charts,', csvFiles.length, 'tables, and', (mdFiles.length + pdfFiles.length + displayOtherFiles.length), 'other files');
        },
        error: function(err) {
            console.error('[displayCharts] Error fetching from GitHub:', err);
            $('#exploreOutput').append('<p style="color:red;">Error loading files. Check console for details.</p>');
        }
    });
}
