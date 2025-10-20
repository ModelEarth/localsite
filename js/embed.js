// Load localsite.js and supporting files for embed.js (for map)
// Optimized loading strategy: parallel JS batches, non-blocking CSS
(function() {
// Create or ensure local_app exists
var local_app = local_app || {}; // Same as localsite.js

// Extract hostname and port from the script src (like localsite.js does)
function extractHostnameAndPort(url) {
    let hostname;
    let protocol = "";
    // find & remove protocol (http, ftp, etc.) and get hostname
    if (url.indexOf("//") > -1) {
        protocol = url.split('//')[0] + "//"; // Retain http or https
        hostname = protocol + url.split('/')[2];
    } else {
        hostname = url.split('/')[0];
    }
    //find & remove "?" and parameters
    hostname = hostname.split('?')[0];
    return hostname;
}

// Process widget script to extract web root
function processWidgetScript(widgetScript) {
    let hostnameAndPort = extractHostnameAndPort(widgetScript.src);
    console.log("embed.js: script src hostname and port: " + hostnameAndPort);
    
    // Extract the path and find the webroot (everything before /localsite/js/embed.js)
    const scriptPath = new URL(widgetScript.src).pathname;
    const teamIndex = scriptPath.lastIndexOf('/localsite/js/embed.js');
    if (teamIndex !== -1) {
        const webroot = scriptPath.substring(0, teamIndex);
        const fullWebroot = hostnameAndPort + webroot;
        console.log("embed.js: final web_root = " + fullWebroot);
        return fullWebroot;
    }
    
    // If path parsing fails, just return the hostname
    console.log("embed.js: path parsing failed, returning hostname: " + hostnameAndPort);
    return hostnameAndPort;
}

// Helper function to find widget script with multiple delay attempts
function findWidgetScript() {
    return new Promise((resolve) => {
        const delays = [100, 500, 1500]; // Multiple delay attempts
        let attemptIndex = 0;
        
        function tryFindScript() {
            let scripts = document.getElementsByTagName('script');
            let widgetScript;
            
            // Look for embed.js script
            for (var i = 0; i < scripts.length; ++i) {
                if(scripts[i].src && scripts[i].src.indexOf('embed.js') !== -1){
                    widgetScript = scripts[i];
                    break;
                }
            }
            
            if (widgetScript) {
                //alert('embed.js: found script after ' + (attemptIndex === 0 ? 'immediate try' : delays[attemptIndex-1] + 'ms delay'));
                resolve(widgetScript);
            } else if (attemptIndex < delays.length) {
                console.log('embed.js: script not found, trying again in', delays[attemptIndex] + 'ms');
                setTimeout(tryFindScript, delays[attemptIndex]);
                attemptIndex++;
            } else {
                console.log('embed.js: script not found after all delay attempts');
                resolve(null);
            }
        }
        
        // Start with immediate try
        tryFindScript();
    });
}

// Extract parameters from embed.js URL
function getWidgetParameters() {
    let scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; ++i) {
        if(scripts[i].src && scripts[i].src.indexOf('embed.js') !== -1){
            const src = scripts[i].src;
            const paramIndex = src.indexOf('?');
            if (paramIndex !== -1) {
                const embedParams = src.substring(paramIndex); // includes the '?'
                alert('embed.js tag parameters: ' + embedParams);
                return embedParams;
            }
            break;
        }
    }
    return '';
}

function initializeParamFromEmbedScript() {
    let scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; ++i) {
        if(scripts[i].src && scripts[i].src.indexOf('embed.js') !== -1){
            embedSrc = scripts[i].src;
            const url = new URL(embedSrc);
            const params = {};
            
            // Extract all URL parameters
            url.searchParams.forEach((value, key) => {
                params[key.toLowerCase()] = value;
            });
            
            //alert('embed.js: initialized param object from script URL: ' + JSON.stringify(params));
            console.log('embed.js: initialized param object from script URL:', params);
            return params;
        }
    }
    return {};
}



let embedSrc;

// Make local_app globally available for localsite.js to use
window.local_app = local_app;

// Initialize param object if not already defined (before map.js loads)
//if(typeof param === 'undefined') {
if (typeof window.param == 'undefined') {
    console.log("window.param inititated in embed.js")
    // Extract parameters from embed.js script embed tag
    window.param = initializeParamFromEmbedScript();

    //alert("embed.js fetched window.param.map " + window.param.map)
    //alert("param.map is now also: " + param.map); // Apparently setting window.param also sets param

    // Apparently the above overwrites param values sent via localsite.js below, but that's okay

} else if (typeof window.param.map == 'undefined') { // Localsite.js was loaded outside embed.js, but we still need to get the map.
    
    // BUT this might not be okay.
    // BUGBUG - Currently this will probably overwrites param values when localsite.js is declared outside, prior to embed.js
    window.param = initializeParamFromEmbedScript();


    //window.param.map = "liaisons"; // TEMP
    //alert("Set param.map to: " + window.param.map)
}


// Check if web_root already exists, if not create it
if (typeof local_app.web_root !== 'function') {
    let cachedWebRoot = null; // Cache the result
    
    local_app.web_root = function() {
        if (cachedWebRoot) {
            console.log("Using cached path for embed.js from initial load.")
            return cachedWebRoot;
        }
        
        // Try immediate detection first
        let scripts = document.getElementsByTagName('script');
        let widgetScript;
        
        for (var i = 0; i < scripts.length; ++i) {
            if(scripts[i].src && scripts[i].src.indexOf('embed.js') !== -1){
                widgetScript = scripts[i];
                break;
            }
        }
        //alert("widgetScript.src " + widgetScript.src); // Provides path to embedded embed.js
        if (!widgetScript) {
            console.log('embed.js: script not found immediately, async detection in progress');
            // Start async detection to cache result for future calls
            findWidgetScript().then(script => {
                if (script) {
                    cachedWebRoot = processWidgetScript(script);
                    console.log('embed.js: cached web_root =', cachedWebRoot);
                }
            });
            // Return fallback domain unless current domain matches
            const currentDomain = window.location.protocol + '//' + window.location.host;
            const fallbackDomain = 'https://locations.pages.dev';
            return currentDomain === fallbackDomain ? currentDomain : fallbackDomain;
        }
        
        // Process the script and cache the result
        cachedWebRoot = processWidgetScript(widgetScript);
        return cachedWebRoot;
    };
}

// Configuration - use local_app.web_root() (also accessible as widgetWebroot for backward compatibility)
const widgetWebroot = local_app.web_root();
console.log('embed.js: Final widgetWebroot value =', widgetWebroot);

// Helper function to load script with promise
function loadScript(src, id) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;
        if (id) script.id = id;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Helper function to load CSS (non-blocking)
function loadCSS(href, id) {
    const link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = href;
    if (id) link.id = id;
    document.head.appendChild(link);
}

// Load base.css early (non-blocking)
loadCSS(widgetWebroot + '/localsite/css/base.css', '/localsite/css/base.css');

// Get widget parameters to pass to localsite.js
//const widgetParams = getWidgetParameters();

// Load essential JS files in parallel (batch 1 - no waiting)
const essentialScripts = [
    { src: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', id: '/leaflet.js', integrity: 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=', crossorigin: 'anonymous' },
    { src: widgetWebroot + '/team/js/leaflet.js', id: '/team/js/leaflet.js' },
    { src: widgetWebroot + '/team/js/common.js', id: '/team/js/common.js' }
];
// Add localsite.js to the beginning if not already loaded
if (!window.localsiteLoaded) {
    //essentialScripts.unshift({ src: widgetWebroot + '/localsite/js/localsite.js' + widgetParams }); // No id for localsite.js, append widget parameters
    essentialScripts.unshift({ src: widgetWebroot + '/localsite/js/localsite.js'});
    //alert("Get embed.js essentials including localsite.js");
} else {
    //alert("Get embed.js essentials - we already have localsite.js");
}

// Load all essential scripts in parallel
const scriptPromises = essentialScripts.map(script => {
    if (script.integrity) {
        // Handle external scripts with integrity
        return new Promise((resolve, reject) => {
            const scriptEl = document.createElement('script');
            scriptEl.src = script.src;
            if (script.id) scriptEl.id = script.id;
            if (script.integrity) scriptEl.integrity = script.integrity;
            if (script.crossorigin !== undefined) scriptEl.crossOrigin = script.crossorigin;
            scriptEl.onload = resolve;
            scriptEl.onerror = reject;
            document.head.appendChild(scriptEl);
        });
    } else {
        return loadScript(script.src, script.id);
    }
});

// Load CSS files as separate non-blocking batch
const cssFiles = [
    { href: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', id: '/leaflet.css', integrity: 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=', crossorigin: 'anonymous' },
    { href: widgetWebroot + '/team/css/common.css', id: '/team/css/common.css' },
    { href: widgetWebroot + '/team/css/widget.css', id: '/team/css/widget.css' }
];

cssFiles.forEach(css => {
    if (css.integrity) {
        // Handle external CSS with integrity
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = css.href;
        if (css.id) link.id = css.id;
        if (css.integrity) link.integrity = css.integrity;
        if (css.crossorigin !== undefined) link.crossOrigin = css.crossorigin;
        document.head.appendChild(link);
    } else {
        loadCSS(css.href, css.id);
    }
});

// Wait for essential scripts to load, then load team/js/map.js
Promise.all(scriptPromises).then(() => {
    console.log('Essential scripts loaded, loading team/js/map.js');
    
    // Get parameters from current script tag and hash
    let mapParam = '';
    let sourceParam = '';
    const currentScript = document.currentScript || document.querySelector('script[src*="embed.js"]');
    
    // TO DO: Only append showmap=true if not in call to embed.js. So showmap=false will override.
    
    // Check for map= parameter in URL hash first
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const hashMap = urlParams.get('map');
    if (hashMap) {
        // Use map= parameter from hash
        mapParam = '?showmap=true&map=' + hashMap;
        console.log('embed.js: Using map parameter from hash:', hashMap);
    } else if (currentScript && currentScript.src.includes('?')) {
        // Only if map= is not available in hash, check for list= in script URL and convert to map=
        const url = new URL(currentScript.src);
        const listFromScript = urlParams.get('list') || url.searchParams.get('list');
        if (listFromScript) {
            mapParam = '?showmap=true&map=' + listFromScript;
            console.log('embed.js: Converting list parameter to map:', listFromScript);
        }
    }
    
    if (currentScript && currentScript.src.includes('?')) {
        const url = new URL(currentScript.src);
        if (url.searchParams.get('source')) {
            sourceParam = '&source=' + url.searchParams.get('source');
        }
    }
    
    // Check if #teamwidget exists, if not create it at script location
    let teamwidgetExists = document.getElementById('teamwidget');
    if (!teamwidgetExists && currentScript) {
        console.log('Creating #teamwidget at script location');
        const teamwidgetDiv = document.createElement('div');
        teamwidgetDiv.id = 'teamwidget';
        
        // Insert the teamwidget div right after the script tag
        currentScript.parentNode.insertBefore(teamwidgetDiv, currentScript.nextSibling);
    }
    
    /// BUG - Better to pas to localsite so the parameters are in params object
    /// essentialScripts should already wait for localsite to be loaded

    // Load map.js with optional parameters... showmap=true
    //alert("mapParam: " + mapParam) // Starts with ?
    const fullParams = mapParam + sourceParam;
    //setTimeout(function() {
        return loadScript(widgetWebroot + '/team/js/map.js?' + fullParams, '/team/js/map.js');
    //}, 2000);
}).then(() => {
    console.log('team/js/map.js loaded successfully');
    
    // Load non-essential print-download.js last (optional)
    loadScript(widgetWebroot + '/team/js/print-download.js', '/team/js/print-download.js')
        .catch(err => console.warn('Print-download.js failed to load (non-critical):', err));
}).catch(err => {
    console.error('Failed to load essential scripts:', err);
});

})();