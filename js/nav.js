// Standalone Navigation System - JavaScript

class StandaloneNavigation {
    constructor(options = {}) {
        // Singleton pattern to prevent multiple instances
        if (StandaloneNavigation.instance) {
            return StandaloneNavigation.instance;
        }
        
        // Auto-detect webroot container from script path
        const autoDetected = this.detectWebrootFromScriptPath();
        console.log('[Constructor] Auto-detected values:', autoDetected);
        console.log('[Constructor] Options passed in:', options);
        
        this.options = {
            basePath: options.basePath || '',
            currentPage: options.currentPage || 'admin',
            // Use auto-detected values if they exist, otherwise fall back to options
            isWebrootContainer: autoDetected.isWebrootContainer !== null ? autoDetected.isWebrootContainer : (options.isWebrootContainer || false),
            repoFolderName: autoDetected.repoFolderName || options.repoFolderName || null,
            webrootFolderName: autoDetected.webrootFolderName || options.webrootFolderName || null,
            isExternalSite: options.isExternalSite || false,
            ...options
        };
        
        // Override any conflicting options with auto-detected values if they exist
        if (autoDetected.repoFolderName) {
            this.options.repoFolderName = autoDetected.repoFolderName;
        }
        if (autoDetected.webrootFolderName) {
            this.options.webrootFolderName = autoDetected.webrootFolderName;
        }
        if (autoDetected.isWebrootContainer !== null) {
            this.options.isWebrootContainer = autoDetected.isWebrootContainer;
        }
        
        console.log('[Constructor] Final options:', this.options);
        
        // Initialize collapsed state from localStorage immediately to prevent flash
        const savedCollapsed = localStorage.getItem('standaloneNavCollapsed');
        const savedLocked = localStorage.getItem('standaloneNavLocked');
        
        // Check screen size immediately on refresh
        this.isMobile = window.innerWidth <= 768;
        
        // Force collapsed state on narrow screens regardless of saved preference
        if (this.isMobile) {
            console.log('INIT: Narrow screen detected on refresh - forcing collapsed state');
            this.isCollapsed = true;
            this.isLocked = false;
        } else {
            // Use saved preferences on wide screens
            this.isCollapsed = savedCollapsed === 'true' || savedCollapsed === null; // Default to collapsed
            this.isLocked = savedLocked === 'true'; // Default to unlocked
        }
        
        this.mobileOpen = false;
        
        console.log('INIT: Screen width:', window.innerWidth, 'isMobile:', this.isMobile, 'isCollapsed:', this.isCollapsed);
        
        // Store event listeners for cleanup
        this.eventListeners = [];
        this.featherTimeout = null;
        this.resizeTimeout = null;
        this.faviconUpdateInterval = null;
        this.currentFavicon = null;
        
        StandaloneNavigation.instance = this;
        this.loadFeatherIcons();
        this.init();
    }
    
    init() {
        this.checkMobile();
        
        // Check for shownav parameter in script src URL
        let showNav = true;
        const scripts = document.getElementsByTagName('script');
        for (const script of scripts) {
            if (script.src && script.src.includes('nav.js')) {
                try {
                    // Handle both absolute and relative URLs
                    const scriptUrl = script.src.includes('://') ? 
                        new URL(script.src) : 
                        new URL(script.src, window.location.href);
                    if (scriptUrl.searchParams.get('shownav') === 'false') {
                        showNav = false;
                        console.log('Found shownav=false in script URL:', script.src);
                        break;
                    }
                } catch (e) {
                    // Fallback: parse manually if URL constructor fails
                    if (script.src.includes('shownav=false')) {
                        showNav = false;
                        console.log('Found shownav=false via string match in:', script.src);
                        break;
                    }
                }
            }
        }
        
        // Also check page URL for backward compatibility
        if (showNav) {
            const urlParams = new URLSearchParams(window.location.search);
            showNav = urlParams.get('shownav') !== 'false';
        }
        
        if (showNav) {
            this.createNavigation();
            this.setupEventListeners();
            this.setupMobileHandlers();
        } else {
            console.log('Navigation disabled due to shownav=false parameter');
        }
        
        this.initializeFeatherIcons();
        this.startPeriodicFaviconUpdate();
    }
    
    // Auto-detect webroot container from script path
    detectWebrootFromScriptPath() {
        // Get the current script path
        const scripts = document.getElementsByTagName('script');
        let scriptSrc = '';
        
        // Find the nav.js script - check both src and resolved URL
        for (const script of scripts) {
            if (script.src && script.src.includes('nav.js')) {
                scriptSrc = script.src;
                console.log('[WebrootDetector] Found script element with src:', script.getAttribute('src'), 'resolved to:', script.src);
                break;
            }
        }
        
        if (!scriptSrc) {
            console.log('[WebrootDetector] Could not find nav.js script src');
            return { isWebrootContainer: false, repoFolderName: null, webrootFolderName: null };
        }
        
        console.log('[WebrootDetector] Script src:', scriptSrc);
        
        // Parse URL to get pathname
        try {
            const url = new URL(scriptSrc);
            const pathname = url.pathname;
            console.log('[WebrootDetector] Script pathname:', pathname);
            
            // Check for webroot container patterns
            // Pattern 1: /{webrootFolder}/{repoFolder}/js/nav.js (two-level structure)
            let match = pathname.match(/^\/([^\/]+)\/([^\/]+)\/js\/nav\.js$/);
            
            if (match) {
                const [, firstFolder, secondFolder] = match;
                
                // Check if first folder looks like a webroot container name
                const webrootNames = ['webroot', 'www', 'public', 'html', 'htdocs', 'public_html'];
                const isLikelyWebroot = webrootNames.includes(firstFolder.toLowerCase());
                
                if (isLikelyWebroot && secondFolder === 'localsite') {
                    console.log('[WebrootDetector] Detected webroot container with localsite:', { webrootName: firstFolder });
                    
                    return {
                        isWebrootContainer: true,
                        repoFolderName: 'localsite',
                        webrootFolderName: firstFolder
                    };
                } else if (secondFolder === 'localsite') {
                    // Cross-repo access pattern like /comparison/localsite/js/nav.js
                    console.log('[WebrootDetector] Detected cross-repo access to localsite:', { callingRepo: firstFolder });
                    
                    return {
                        isWebrootContainer: true,
                        repoFolderName: 'localsite',
                        webrootFolderName: null
                    };
                }
            }
            
            // Pattern for direct repo serving: /{repoFolder}/js/nav.js
            match = pathname.match(/^\/([^\/]+)\/js\/nav\.js$/);
            if (match) {
                const [, repoFolder] = match;
                if (repoFolder === 'localsite') {
                    console.log('[WebrootDetector] Detected direct localsite serving');
                    
                    return {
                        isWebrootContainer: false,
                        repoFolderName: 'localsite',
                        webrootFolderName: null
                    };
                }
            }
            
            console.log('[WebrootDetector] No pattern matched, assuming relative path');
            return { isWebrootContainer: false, repoFolderName: null, webrootFolderName: null };
            
        } catch (error) {
            console.warn('[WebrootDetector] Error parsing script URL:', error);
            return { isWebrootContainer: false, repoFolderName: null, webrootFolderName: null };
        }
    }

    // Immediate resize handler for responsive behavior
    checkMobile() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        console.log('CHECK MOBILE: width', window.innerWidth, 'wasMobile:', wasMobile, 'isMobile:', this.isMobile);
        
        if (wasMobile !== this.isMobile) {
            this.handleMobileChange();
        }
    }
    
    handleMobileChange() {
        console.log('MOBILE CHANGE: isMobile changed to', this.isMobile, 'isCollapsed:', this.isCollapsed);
        const sidenav = document.querySelector('#side-nav');
        const overlay = document.querySelector('.mobile-overlay');
        
        if (this.isMobile) {
            console.log('MOBILE CHANGE: Switching to mobile mode - applying collapsed state');
            // Apply collapsed state like manual toggle does (to hide titles/arrows)
            sidenav?.classList.remove('expanded', 'hovered');
            sidenav?.classList.add('collapsed');
            overlay?.classList.remove('active');
            this.isLocked = false;
            // Update body class
            document.body.classList.remove('sidenav-expanded', 'sidenav-hovered');
            document.body.classList.add('sidenav-collapsed');
        } else {
            console.log('MOBILE CHANGE: Switching to desktop mode - checking if should restore expanded');
            sidenav?.classList.remove('mobile-open');
            this.mobileOpen = false;
            
            // Restore expanded state when switching back to desktop if not user-collapsed
            if (!this.isCollapsed) {
                console.log('MOBILE CHANGE: Restoring expanded class for desktop');
                sidenav?.classList.remove('collapsed', 'locked');
                sidenav?.classList.add('expanded');
                document.body.classList.add('sidenav-expanded');
                document.body.classList.remove('sidenav-collapsed');
            } else {
                console.log('MOBILE CHANGE: Staying collapsed as per user preference');
                sidenav?.classList.add('collapsed');
                if (this.isLocked) {
                    sidenav?.classList.add('locked');
                }
                document.body.classList.add('sidenav-collapsed');
                document.body.classList.remove('sidenav-expanded');
            }
        }
        
        // Update toggle icon after mobile state change
        this.debouncedUpdateToggleIcon();
    }
    
    createNavigation() {
        // Check if navigation already exists to prevent duplicates
        const existingSidebar = document.getElementById('side-nav');
        if (existingSidebar) {
            // Remove existing navigation to recreate it
            existingSidebar.remove();
        }
        
        // Also remove any existing app-container to ensure clean slate
        /*
        const existingAppContainer = document.querySelector('.app-container');
        if (existingAppContainer) {
            // Move main content back to body before removing container
            const mainContent = existingAppContainer.querySelector('.main-content');
            if (mainContent) {
                const children = [...mainContent.children];
                children.forEach(child => {
                    document.body.appendChild(child);
                });
            }
            existingAppContainer.remove();
        }
        */

        const existingAppContainer = document.querySelector('body');
        const basePath = this.options.basePath || '';
        const isWebrootContainer = this.options.isWebrootContainer;
        const repoFolderName = this.options.repoFolderName;
        const isExternalSite = this.options.isExternalSite;
        
        // Calculate paths based on container type
        let rootPath, adminPath, logoPath, teamPath;
        const webrootFolderName = this.options.webrootFolderName;
        if (isExternalSite) {
            // Called from external site, use absolute paths to repo folder
            const repoName = repoFolderName || 'localsite';
            rootPath = `/${repoName}/`;
            adminPath = `/${repoName}/admin/`;
            teamPath = `/team/`;
            // Favicon is in localsite repo
            logoPath = `/localsite/img/logo/neighborhood/favicon.png`;
        } else if (isWebrootContainer && repoFolderName) {
            // In webroot container, need to include both webroot and repo folder in paths
            if (webrootFolderName) {
                // Root path points to webroot folder
                rootPath = `/${webrootFolderName}/`;
                adminPath = `/${webrootFolderName}/team/admin/`;
                teamPath = `/${webrootFolderName}/team/`;
                // Favicon is in localsite repo
                logoPath = `/${webrootFolderName}/localsite/img/logo/neighborhood/favicon.png`;
            } else {
                // Webroot name unknown - root path goes up one level to repo collection
                rootPath = `../`;
                adminPath = `../team/admin/`;
                teamPath = `../team/`;
                // Favicon is in localsite repo
                logoPath = `../localsite/img/logo/neighborhood/favicon.png`;
            }
        } else {
            // Direct repo serving - go up to root level where all repos are
            rootPath = basePath ? `${basePath}/../` : '../';
            adminPath = basePath ? `${basePath}/../team/admin/` : '../team/admin/';
            teamPath = basePath ? `${basePath}/../team/` : '../team/';
            // Favicon is in localsite repo
            // Calculate additional ../ needed based on current URL depth
            const currentPath = window.location.pathname;
            const pathSegments = currentPath.split('/').filter(segment => segment && !segment.endsWith('.html'));
            const extraLevels = Math.max(0, pathSegments.length - 1); // Subtract 1 for the base repo level
            const additionalDotDots = '../'.repeat(extraLevels);
            
            logoPath = basePath ? `${basePath}/../team/img/logo/neighborhood/favicon.png` : `${additionalDotDots}../team/img/logo/neighborhood/favicon.png`;
        }
        
        // Debug logging
        console.log('Navigation paths:', { 
            repoFolderName, 
            webrootFolderName, 
            isWebrootContainer, 
            isExternalSite, 
            basePath, 
            rootPath, 
            adminPath, 
            teamPath,
            logoPath,
            'options': this.options
        });
        
        // Apply initial collapsed state to prevent flash
        const initialClasses = [
            isExternalSite ? 'external-site' : '',
            // Apply collapsed class immediately if narrow screen OR user preference
            this.isCollapsed || this.isMobile ? 'collapsed' : '',
            this.isLocked && !this.isMobile ? 'locked' : ''
        ].filter(Boolean).join(' ');
        
        console.log('INIT: Creating navigation with classes:', initialClasses);
        
        const navHTML = `
            <div class="sidebar ${initialClasses}${!this.isCollapsed && !this.isMobile ? ' expanded' : ''}" id="side-nav">
                <!--
                <div class="sidebar-header" ${isExternalSite ? 'style="display: none;"' : ''}>
                    <div class="logo">
                        <a href="${rootPath}"><img id="sidebar-logo" src="${logoPath}" alt="Up" /></a>
                    </div>
                    <span class="logo-text">PartnerTools</span>
                </div>
                -->

                <div id="side-nav-content">
                    <div id="side-nav-menu">
                        <div class="nav-section">
                            <div class="nav-item">
                                <button class="nav-link" data-section="home" data-href="${teamPath}">
                                    <i class="nav-icon" data-feather="home"></i>
                                    <span class="nav-text">Welcome</span>
                                    <i class="nav-arrow" data-feather="chevron-right"></i>
                                </button>
                                <div class="subnav">
                                    <a href="${teamPath}#home" class="subnav-link">
                                        <i class="subnav-icon" data-feather="smile"></i>
                                        <span>Welcome</span>
                                    </a>
                                    <a href="${teamPath}#home/documentation" class="subnav-link">
                                        <i class="subnav-icon" data-feather="book"></i>
                                        <span>Getting Started</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div class="nav-section earth" style="display:none">
                            <div class="nav-item">
                                <button class="nav-link" data-section="projects" data-href="${teamPath}#projects">
                                    <i class="nav-icon" data-feather="folder"></i>
                                    <span class="nav-text">Projects</span>
                                    <i class="nav-arrow" data-feather="chevron-right"></i>
                                </button>
                                <div class="subnav">
                                    <a href="${rootPath}projects" class="subnav-link">
                                        <i class="subnav-icon" data-feather="globe"></i>
                                        <span>Active Projects</span>
                                    </a>
                                    <a href="https://github.com/modelearth/projects/issues/" class="subnav-link">
                                        <i class="subnav-icon" data-feather="check-square"></i>
                                        <span>ToDos (GitHub)</span>
                                    </a>
                                    <a href="${rootPath}projects/hub/" class="subnav-link">
                                        <i class="subnav-icon" data-feather="target"></i>
                                        <span>Our Project Hub</span>
                                    </a>
                                    <a href="${teamPath}projects/#list=democracylab" class="subnav-link">
                                        <i class="subnav-icon" data-feather="code"></i>
                                        <span>Democracy Lab Projects</span>
                                    </a>
                                    <div style="display:none">
                                    Before removing, investigate via: Reveal opportunities section on the team/index.html page
                                    <a href="${teamPath}#projects/opportunities" class="subnav-link">
                                        <i class="subnav-icon" data-feather="target"></i>
                                        <span>Opportunities</span>
                                    </a>
                                    </div>
                                    <!--
                                    <a href="${teamPath}#projects/assigned-tasks" class="subnav-link">
                                        <i class="subnav-icon" data-feather="check-square"></i>
                                        <span>Assigned Tasks</span>
                                    </a>
                                    <a href="/data-commons/docs/data/" class="subnav-link">
                                        <i class="subnav-icon" data-feather="calendar"></i>
                                        <span>UN Timelines</span>
                                    </a>
                                    -->
                                </div>
                            </div>
                        </div>

                        <div class="nav-section earth" style="display:none">
                            <div class="nav-item">
                                <button class="nav-link" data-section="people" data-href="${teamPath}#people">
                                    <i class="nav-icon" data-feather="users"></i>
                                    <span class="nav-text">People & Places</span>
                                    <i class="nav-arrow" data-feather="chevron-right"></i>
                                </button>
                                <div class="subnav">
                                    <a href="${rootPath}projects/#list=modelteam" class="subnav-link">
                                        <i class="subnav-icon" data-feather="map"></i>
                                        <span>Model Team</span>
                                    </a>
                                    <a href="${teamPath}#people/people" class="subnav-link">
                                        <i class="subnav-icon" data-feather="user"></i>
                                        <span>People</span>
                                    </a>
                                    <a href="${teamPath}#people/teams" class="subnav-link">
                                        <i class="subnav-icon" data-feather="users"></i>
                                        <span>Teams</span>
                                    </a>
                                    <a href="${teamPath}#people/organizations" class="subnav-link">
                                        <i class="subnav-icon" data-feather="grid"></i>
                                        <span>Organizations</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div class="nav-section earth" style="display:none">
                            <div class="nav-item">
                                <button class="nav-link" data-section="account" data-href="${teamPath}#account">
                                    <i class="nav-icon" data-feather="settings"></i>
                                    <span class="nav-text">My Account</span>
                                    <i class="nav-arrow" data-feather="chevron-right"></i>
                                </button>
                                <div class="subnav">
                                    <a href="${teamPath}#account/preferences" class="subnav-link">
                                        <i class="subnav-icon" data-feather="sliders"></i>
                                        <span>Preferences</span>
                                    </a>
                                    <a href="${teamPath}#account/skills" class="subnav-link">
                                        <i class="subnav-icon" data-feather="award"></i>
                                        <span>Skills</span>
                                    </a>
                                    <a href="${teamPath}#account/interests" class="subnav-link">
                                        <i class="subnav-icon" data-feather="heart"></i>
                                        <span>Interests</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div class="nav-section">
                            <div class="nav-item">
                                <button class="nav-link" data-section="realitystream" data-href="${teamPath}projects/#list=all">
                                    <i class="nav-icon" data-feather="activity"></i>
                                    <span class="nav-text">Data Insights</span>
                                    <i class="nav-arrow" data-feather="chevron-right"></i>
                                </button>
                                <div class="subnav">
                                    
                                    <div style="display:none" class="geo">
                                    <a href="${teamPath}projects/map/#list=cities" class="subnav-link">
                                        <i class="subnav-icon" data-feather="map"></i>
                                        <span>Location Visits Map</span>
                                    </a>
                                    </div>
                                    <div style="display:none" class="geo">
                                    <a href="${teamPath}projects/#list=geo" class="subnav-link">
                                        <i class="subnav-icon" data-feather="heart"></i>
                                        <span>Location Insights</span>
                                    </a>
                                    </div>
                                    <div style="display:none" class="geo">
                                    <a href="${teamPath}projects/#list=film-scouting" class="subnav-link">
                                        <i class="subnav-icon" data-feather="film"></i>
                                        <span>Film Scout Insights</span>
                                    </a>
                                    </div>
                                    <div style="display:none" class="geo">
                                    <a href="${rootPath}localsite/info/#state=GA" class="subnav-link">
                                        <i class="subnav-icon" data-feather="bar-chart-2"></i>
                                        <span>Industry Comparisons</span>
                                    </a>
                                    </div>
                                    <div style="display:none" class="earth">
                                    <a href="${rootPath}localsite/info/" class="subnav-link">
                                        <i class="subnav-icon" data-feather="bar-chart-2"></i>
                                        <span>Industry Comparisons</span>
                                    </a>
                                    </div>
                                    <div style="display:none" class="earth">
                                    <a href="${rootPath}realitystream/models/" class="subnav-link">
                                        <i class="subnav-icon" data-feather="trending-up"></i>
                                        <span>Forecasting Models</span>
                                    </a>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                        
                        <div class="nav-section">
                            <div class="nav-item">
                                <button class="nav-link ${this.options.currentPage === 'admin' ? 'active' : ''}" data-section="admin" data-href="${teamPath}admin">
                                    <i class="nav-icon" data-feather="tool"></i>
                                    <span class="nav-text">Partner Tools</span>
                                    <i class="nav-arrow" data-feather="chevron-right"></i>
                                </button>
                                <div class="subnav">
                                    <div style="display:none" class="earth">
                                    <a href="${teamPath}projects/" class="subnav-link">
                                        <i class="subnav-icon" data-feather="users"></i>
                                        <span>Meetup Integration</span>
                                    </a>
                                    </div>
                                    <a href="${teamPath}admin/server/" class="subnav-link">
                                        <i class="subnav-icon" data-feather="zap"></i>
                                        <span>Configure Server</span>
                                    </a>
                                    <a href="${teamPath}admin/sql/panel/" class="subnav-link">
                                        <i class="subnav-icon" data-feather="database"></i>
                                        <span>Database Admin</span>
                                    </a>
                                    <a href="${teamPath}admin/import-data.html" class="subnav-link">
                                        <i class="subnav-icon" data-feather="upload"></i>
                                        <span>Data Import</span>
                                    </a>
                                    <a href="${teamPath}admin/log-output/" class="subnav-link">
                                        <i class="subnav-icon" data-feather="monitor"></i>
                                        <span>Log Monitor</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="side-nav-footer" class="sidebar-footer">
                    <button class="sidebar-toggle" id="sidebar-toggle">
                        <i data-feather="chevrons-left"></i>
                    </button>
                </div>
                
                <div class="sidebar-expander" id="sidebar-expander" title="Click to expand navigation"></div>
            </div>
            
            <div class="mobile-overlay" id="mobile-overlay"></div>
        `;
        
        // Create app container if it doesn't exist
        //let appContainer = document.querySelector('.app-container');

        /* Might use this to move body in navigation.html

        if (!appContainer) {
            // Store existing content efficiently
            const existingContent = [...document.body.children];
            
            // Create and setup app container
            appContainer = document.createElement('div');
            appContainer.className = 'app-container';
            
            // Clear body and add app container
            document.body.innerHTML = '';
            document.body.appendChild(appContainer);
            
            // Add navigation
            appContainer.innerHTML = navHTML;
            
            // Create main content area
            const mainContent = document.createElement('div');
            mainContent.className = 'main-content';
            appContainer.appendChild(mainContent);
            
            // Move existing content with bounds checking
            existingContent.forEach(element => {
                if (element && element.nodeType === Node.ELEMENT_NODE) {
                    mainContent.appendChild(element);
                }
            });
        }
        */

        // Check for shownav parameter to hide navigation
        const urlParams = new URLSearchParams(window.location.search);
        const showNav = urlParams.get('shownav') !== 'false';
        
        if (showNav) {
            document.body.insertAdjacentHTML('afterbegin', navHTML);
        } else {
            console.log('Navigation hidden due to shownav=false parameter');
        }

        // Set initial body class for headerbar positioning and sidenav expanded state
        if (this.isCollapsed || this.isMobile) {
            console.log('INIT: Setting body to sidenav-collapsed');
            document.body.classList.add('sidenav-collapsed');
            document.body.classList.remove('sidenav-expanded');
        } else {
            console.log('INIT: Setting body to sidenav-expanded');
            document.body.classList.add('sidenav-expanded');
            document.body.classList.remove('sidenav-collapsed');
            // Also add expanded class to sidenav when not collapsed
            const sidenav = document.getElementById('side-nav');
            if (sidenav) {
                sidenav.classList.add('expanded');
            }
        }

        // Check for custom favicon from environment/config
        // Skip favicon update if common.js is handling it
        if (!window.updateFaviconPath) {
            this.updateLogoFromConfig().catch(error => {
                console.log('Failed to update logo/favicon from config:', error);
            });
        } else {
            console.log('[FaviconManager] Skipping - common.js will handle favicon updates');
        }
    }
    
    // Update logo and favicon based on SITE_FAVICON environment variable or config
    async updateLogoFromConfig() {
        let siteFavicon = null;

        // First, try to fetch current config from the server
        try {
            const apiUrl = 'http://localhost:8081/api/config/current';
            const response = await fetch(apiUrl); // Since a connection error would be network-level, it cannot be surpressed by javascript
            if (response.ok) {
                const config = await response.json();
                if (config.site_favicon) {
                    siteFavicon = config.site_favicon;
                    console.log('[FaviconManager] Found site_favicon:', siteFavicon);
                }
            }
        } catch (error) {
            console.log('Could not fetch server config, falling back to client-side detection:', error);
        }
        
        // Fallback to client-side detection if server config not available
        if (!siteFavicon) {
            // Check if it's available as a global variable
            if (typeof SITE_FAVICON !== 'undefined' && SITE_FAVICON) {
                siteFavicon = SITE_FAVICON;
            }
            // Check if it's in a config object
            else if (typeof window.config !== 'undefined' && window.config.SITE_FAVICON) {
                siteFavicon = window.config.SITE_FAVICON;
            }
            // Check if it's in process.env (if available in browser context)
            else if (typeof process !== 'undefined' && process.env && process.env.SITE_FAVICON) {
                siteFavicon = process.env.SITE_FAVICON;
            }
        }
        
        // Update both sidebar logo and page favicon if a custom favicon is found
        console.log('[FaviconManager] Final siteFavicon:', siteFavicon, 'currentFavicon:', this.currentFavicon);
        if (siteFavicon && siteFavicon !== this.currentFavicon) {
            console.log('[FaviconManager] Updating favicon from', this.currentFavicon, 'to', siteFavicon);
            
            // Update sidebar logo
            const logoImg = document.getElementById('sidebar-logo');
            if (logoImg) {
                logoImg.src = siteFavicon;
                console.log('[FaviconManager] Updated sidebar logo to:', siteFavicon);
            } else {
                console.log('[FaviconManager] No sidebar-logo element found');
            }
            
            // Update page favicon
            try {
                await this.updatePageFavicon(siteFavicon);
                this.currentFavicon = siteFavicon;
                console.log('[FaviconManager] Successfully updated page favicon to:', siteFavicon);
            } catch (error) {
                console.warn('[FaviconManager] Failed to update page favicon:', error);
            }
        } else {
            console.log('[FaviconManager] No favicon update needed - same as current or no favicon found');
        }
    }
    
    // Update the page favicon with validation
    async updatePageFavicon(faviconUrl) {
        return new Promise((resolve, reject) => {
            // Validate the image URL before setting it
            const testImg = new Image();
            
            testImg.onload = () => {
                // Image is valid, proceed with setting favicon
                this.applyPageFavicon(faviconUrl);
                console.log('Updated page favicon to:', faviconUrl);
                resolve();
            };
            
            testImg.onerror = () => {
                console.warn('Invalid favicon URL:', faviconUrl);
                reject(new Error('Invalid favicon URL'));
            };
            
            testImg.src = faviconUrl;
        });
    }
    
    // Apply the favicon to the page
    applyPageFavicon(faviconUrl) {
        // Remove existing favicon links
        const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
        existingFavicons.forEach(favicon => favicon.remove());

        // Create new favicon link
        const favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.type = 'image/png'; // Assume PNG, but browsers are flexible
        favicon.href = faviconUrl;

        // Add to document head
        document.head.appendChild(favicon);

        // For older browsers, also create a shortcut icon link
        const shortcutFavicon = document.createElement('link');
        shortcutFavicon.rel = 'shortcut icon';
        shortcutFavicon.type = 'image/png';
        shortcutFavicon.href = faviconUrl;
        document.head.appendChild(shortcutFavicon);
    }
    
    // Start periodic updates to check for favicon changes
    startPeriodicFaviconUpdate() {
        // Disabled periodic favicon updates to reduce unnecessary API calls
        // The favicon will be set once on initialization
        console.log('[FaviconManager] Periodic updates disabled');
        /*
        // Check for updates every 30 seconds
        this.faviconUpdateInterval = setInterval(() => {
            this.updateLogoFromConfig().catch(error => {
                console.log('Periodic favicon update failed:', error);
            });
        }, 30000);
        */
    }
    
    // Manual refresh method for external use
    async refreshFavicon() {
        console.log('Manual favicon refresh requested');
        try {
            await this.updateLogoFromConfig();
            return true;
        } catch (error) {
            console.warn('Manual favicon refresh failed:', error);
            return false;
        }
    }
    
    setupEventListeners() {
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            const toggleHandler = () => this.toggleSidebar();
            sidebarToggle.addEventListener('click', toggleHandler);
            this.eventListeners.push({ element: sidebarToggle, event: 'click', handler: toggleHandler });
        }
        
        // Window resize with cleanup tracking
        const resizeHandler = () => this.checkMobile();
        window.addEventListener('resize', resizeHandler);
        this.eventListeners.push({ element: window, event: 'resize', handler: resizeHandler });
        
        // Navigation hover effects
        const sidenav = document.getElementById('side-nav');
        if (sidenav) {
            const mouseEnterHandler = () => {
                if (this.isCollapsed && !this.isLocked && !this.isMobile) {
                    sidenav.classList.add('hovered');
                    // Update body class for headerbar positioning
                    document.body.classList.add('sidenav-hovered');
                }
            };
            
            const mouseLeaveHandler = () => {
                if (this.isCollapsed && !this.isLocked && !this.isMobile) {
                    sidenav.classList.remove('hovered');
                    // Update body class for headerbar positioning
                    document.body.classList.remove('sidenav-hovered');
                }
            };
            
            sidenav.addEventListener('mouseenter', mouseEnterHandler);
            sidenav.addEventListener('mouseleave', mouseLeaveHandler);
            
            this.eventListeners.push(
                { element: sidenav, event: 'mouseenter', handler: mouseEnterHandler },
                { element: sidenav, event: 'mouseleave', handler: mouseLeaveHandler }
            );
        }
        
        // Sidebar expander click handler
        const sidebarExpander = document.getElementById('sidebar-expander');
        if (sidebarExpander) {
            const expanderHandler = () => {
                if (this.isCollapsed && this.isLocked && !this.isMobile) {
                    this.unlockSidebar();
                }
            };
            
            sidebarExpander.addEventListener('click', expanderHandler);
            this.eventListeners.push({ element: sidebarExpander, event: 'click', handler: expanderHandler });
        }
        
        // Navigation click handling - differentiate between arrow and main button clicks
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const clickHandler = (e) => {
                if (e.target.closest('.nav-arrow') || e.target.classList.contains('nav-arrow')) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // For all nav arrows, toggle the subnav
                    this.toggleSubnav(link);
                } else {
                    // Handle main button clicks - check if already on target page
                    if (link.hasAttribute('data-href')) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const href = link.getAttribute('data-href');
                        const hashMatch = href.match(/#([^']+)/);
                        
                        if (hashMatch) {
                            const targetHash = hashMatch[1];
                            const currentHash = window.location.hash.substring(1);
                            
                            // Check if we're on the root index.html page
                            const isRootPage = window.location.pathname === '/' || 
                                             window.location.pathname.endsWith('/index.html') ||
                                             window.location.pathname.endsWith('/team/') ||
                                             window.location.pathname.endsWith('/team/index.html');
                            
                            if (isRootPage) {
                                // On root page, use hash navigation only
                                window.location.hash = targetHash;
                            } else {
                                // On other pages, use full href navigation
                                window.location.href = href;
                            }
                        } else {
                            // Direct navigation (like admin path)
                            window.location.href = href;
                        }
                    }
                }
            };
            
            // Tooltip handlers for collapsed nav
            const mouseEnterHandler = (e) => {
                if (this.isCollapsed && this.isLocked) {
                    this.showTooltip(e, link);
                }
            };
            
            const mouseLeaveHandler = () => {
                if (this.isCollapsed && this.isLocked) {
                    // Add a small delay to allow moving to the tooltip
                    setTimeout(() => {
                        const tooltip = document.getElementById('nav-tooltip');
                        if (tooltip && !tooltip.matches(':hover')) {
                            this.hideTooltip();
                        }
                    }, 100);
                }
            };
            
            link.addEventListener('click', clickHandler);
            link.addEventListener('mouseenter', mouseEnterHandler);
            link.addEventListener('mouseleave', mouseLeaveHandler);
            
            this.eventListeners.push(
                { element: link, event: 'click', handler: clickHandler },
                { element: link, event: 'mouseenter', handler: mouseEnterHandler },
                { element: link, event: 'mouseleave', handler: mouseLeaveHandler }
            );
        });
        
        // Global click handler for mobile menu
        const globalClickHandler = (e) => {
            if (this.isMobile && this.mobileOpen) {
                const sidenav = document.getElementById('side-nav');
                if (sidenav && !sidenav.contains(e.target)) {
                    this.closeMobileMenu();
                }
            }
        };
        
        document.addEventListener('click', globalClickHandler);
        this.eventListeners.push({ element: document, event: 'click', handler: globalClickHandler });
        
        // Click handler for side-nav-content area to expand when collapsed
        const sideNavContent = document.getElementById('side-nav-content');
        if (sideNavContent) {
            const contentClickHandler = (e) => {
                // Only handle clicks on the content area itself, not on nav-links or other interactive elements
                if (e.target === sideNavContent || e.target.id === 'side-nav-menu') {
                    if (this.isCollapsed && !this.isMobile) {
                        console.log('CONTENT CLICK: Expanding sidebar from content area click');
                        this.toggleSidebar();
                    }
                }
            };
            
            sideNavContent.addEventListener('click', contentClickHandler);
            this.eventListeners.push({ element: sideNavContent, event: 'click', handler: contentClickHandler });
        }
    }
    
    setupMobileHandlers() {
        // Mobile menu toggle button
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        if (mobileToggle) {
            const toggleHandler = () => this.toggleMobileMenu();
            mobileToggle.addEventListener('click', toggleHandler);
            this.eventListeners.push({ element: mobileToggle, event: 'click', handler: toggleHandler });
        }
        
        // Overlay click to close
        const overlay = document.getElementById('mobile-overlay');
        if (overlay) {
            const overlayHandler = () => this.closeMobileMenu();
            overlay.addEventListener('click', overlayHandler);
            this.eventListeners.push({ element: overlay, event: 'click', handler: overlayHandler });
        }
    }
    
    toggleSidebar() {
        if (this.isMobile) {
            this.toggleMobileMenu();
            return;
        }
        
        const sidenav = document.getElementById('side-nav');
        if (sidenav) {
            if (this.isCollapsed) {
                // Expanding - add expanded class
                this.isCollapsed = false;
                this.isLocked = false;
                sidenav.classList.remove('collapsed', 'locked', 'hovered');
                sidenav.classList.add('expanded');
                // Update body class for headerbar positioning
                document.body.classList.remove('sidenav-collapsed');
                document.body.classList.add('sidenav-expanded');
            } else {
                // Collapsing - remove expanded class and lock it collapsed
                this.isCollapsed = true;
                this.isLocked = true;
                sidenav.classList.remove('expanded', 'hovered');
                sidenav.classList.add('collapsed', 'locked');
                // Update body class for headerbar positioning
                document.body.classList.remove('sidenav-expanded');
                document.body.classList.add('sidenav-collapsed');
            }
            
            // Update toggle icon with debouncing
            this.debouncedUpdateToggleIcon();
            
            // Update expander tooltip
            this.updateExpanderTooltip();
            
            // Store state in localStorage
            localStorage.setItem('standaloneNavCollapsed', this.isCollapsed);
            localStorage.setItem('standaloneNavLocked', this.isLocked);
        }
    }
    
    unlockSidebar() {
        const sidenav = document.getElementById('side-nav');
        if (sidenav) {
            this.isCollapsed = false;
            this.isLocked = false;
            sidenav.classList.remove('collapsed', 'locked', 'hovered');
            sidenav.classList.add('expanded');
            // Update body class for headerbar positioning
            document.body.classList.remove('sidenav-collapsed');
            document.body.classList.add('sidenav-expanded');
            
            // Update toggle icon with debouncing
            this.debouncedUpdateToggleIcon();
            
            // Update expander tooltip
            this.updateExpanderTooltip();
            
            // Store state in localStorage
            localStorage.setItem('standaloneNavCollapsed', this.isCollapsed);
            localStorage.setItem('standaloneNavLocked', this.isLocked);
        }
    }
    
    // Debounced icon update to prevent excessive DOM manipulation
    debouncedUpdateToggleIcon() {
        if (this.featherTimeout) {
            clearTimeout(this.featherTimeout);
        }
        
        this.featherTimeout = setTimeout(() => {
            this.updateToggleIcon();
        }, 50);
    }
    
    updateToggleIcon() {
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (!sidebarToggle) return;
        
        // Check actual sidenav state from DOM
        const sidenav = document.getElementById('side-nav');
        const actuallyCollapsed = sidenav?.classList.contains('collapsed') || false;
        const mobileOpen = sidenav?.classList.contains('mobile-open') || false;
        
        // Sync the class property with actual DOM state
        this.isCollapsed = actuallyCollapsed;
        
        // Target icon based on state - consider both collapsed state and mobile-open
        let targetIcon;
        if (this.isMobile) {
            // On mobile: right arrow when collapsed, left arrow when mobile-open (expanded)
            targetIcon = mobileOpen ? 'chevrons-left' : 'chevrons-right';
        } else {
            // On desktop: right arrow when collapsed, left arrow when expanded
            targetIcon = this.isCollapsed ? 'chevrons-right' : 'chevrons-left';
        }
        
        console.log('UPDATE ICON: collapsed:', this.isCollapsed, 'mobileOpen:', mobileOpen, 'isMobile:', this.isMobile, 'targetIcon:', targetIcon);
        
        // Clear all existing icons (both <i> and <svg> elements)
        sidebarToggle.innerHTML = '';
        
        // Create new icon element
        const icon = document.createElement('i');
        icon.setAttribute('data-feather', targetIcon);
        sidebarToggle.appendChild(icon);
        
        // Debounced feather icon refresh
        this.refreshFeatherIcons();
    }
    
    toggleMobileMenu() {
        const sidenav = document.getElementById('side-nav');
        const overlay = document.getElementById('mobile-overlay');
        
        this.mobileOpen = !this.mobileOpen;
        
        console.log('TOGGLE MOBILE: mobileOpen:', this.mobileOpen);
        
        sidenav?.classList.toggle('mobile-open', this.mobileOpen);
        overlay?.classList.toggle('active', this.mobileOpen);
        
        // Update toggle icon to reflect new state
        this.debouncedUpdateToggleIcon();
    }
    
    closeMobileMenu() {
        const sidenav = document.getElementById('side-nav');
        const overlay = document.getElementById('mobile-overlay');
        
        this.mobileOpen = false;
        
        sidenav?.classList.remove('mobile-open');
        overlay?.classList.remove('active');
    }
    
    toggleSubnav(navLink) {
        const subnav = navLink.parentElement?.querySelector('.subnav');
        const arrow = navLink.querySelector('.nav-arrow');
        
        if (subnav && arrow) {
            const isExpanded = subnav.classList.contains('expanded');
            
            subnav.classList.toggle('expanded', !isExpanded);
            arrow.classList.toggle('expanded', !isExpanded);
        }
    }
    
    navigateToRoot(hash = '') {
        const basePath = this.options.basePath;
        const rootPath = basePath ? `${basePath}/index.html` : './index.html';
        window.location.href = rootPath + hash;
    }
    
    navigateToAdmin() {
        const basePath = this.options.basePath;
        const adminPath = basePath ? `${basePath}/admin/` : './admin/';
        window.location.href = adminPath;
    }
    
    // Load feather icons script if not already loaded
    loadFeatherIcons() {
        if (typeof feather !== 'undefined') {
            // Already loaded
            return;
        }
        
        // Check if script is already in the DOM
        const existingScript = document.querySelector('script[src*="feather-icons"]');
        if (existingScript) {
            return;
        }
        
        // Load feather icons script
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/feather-icons';
        script.onload = () => {
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        };
        document.head.appendChild(script);
    }

    // Debounced feather icon refresh
    refreshFeatherIcons() {
        if (this.featherTimeout) {
            clearTimeout(this.featherTimeout);
        }
        
        this.featherTimeout = setTimeout(() => {
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        }, 100);
    }
    
    // Public method to force immediate feather icon refresh
    replaceFeatherIcons() {
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }
    
    initializeFeatherIcons() {
        this.refreshFeatherIcons();
    }
    
    // Initialize state after DOM is ready (no longer changes state, just updates UI)
    restoreState() {
        // Update expander tooltip based on current state
        this.updateExpanderTooltip();
        
        // Update icon to match current state
        this.debouncedUpdateToggleIcon();
    }
    
    updateExpanderTooltip() {
        const expander = document.getElementById('sidebar-expander');
        if (expander) {
            if (this.isCollapsed && this.isLocked) {
                expander.title = 'Click to unlock navigation';
            } else if (this.isCollapsed && !this.isLocked) {
                expander.title = 'Hover to expand navigation';
            } else {
                expander.title = 'Click arrow to collapse navigation';
            }
        }
    }
    
    showTooltip(event, navLink) {
        // Remove existing tooltip
        this.hideTooltip();
        
        // Get the nav text content
        const navText = navLink.querySelector('.nav-text');
        if (!navText) return;
        
        const tooltipText = navText.textContent.trim();
        if (!tooltipText) return;
        
        // Get the nav icon
        const navIcon = navLink.querySelector('.nav-icon');
        if (!navIcon) return;
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'nav-tooltip show';
        tooltip.id = 'nav-tooltip';
        
        // Create clickable link wrapper
        const tooltipLink = document.createElement('button');
        tooltipLink.className = 'tooltip-link';
        
        // Copy the navigation functionality from the main nav button
        const href = navLink.getAttribute('data-href');
        if (href) {
            tooltipLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const hashMatch = href.match(/#([^']+)/);
                
                if (hashMatch) {
                    const targetHash = hashMatch[1];
                    const currentHash = window.location.hash.substring(1);
                    
                    // Check if we're on the root index.html page
                    const isRootPage = window.location.pathname === '/' || 
                                     window.location.pathname.endsWith('/index.html') ||
                                     window.location.pathname.endsWith('/team/') ||
                                     window.location.pathname.endsWith('/team/index.html');
                    
                    if (isRootPage) {
                        // On root page, use hash navigation only
                        window.location.hash = targetHash;
                    } else {
                        // On other pages, use full href navigation
                        window.location.href = href;
                    }
                } else {
                    // Direct navigation (like admin path)
                    window.location.href = href;
                }
            });
        }
        
        // Clone the icon and create tooltip content
        const iconClone = navIcon.cloneNode(true);
        
        // Handle both <i> and <svg> elements properly
        if (iconClone.tagName === 'svg') {
            iconClone.classList.add('tooltip-icon');
        } else {
            iconClone.className = 'tooltip-icon';
        }
        
        const textSpan = document.createElement('span');
        textSpan.className = 'tooltip-text';
        textSpan.textContent = tooltipText;
        
        // Add icon and text to tooltip link
        tooltipLink.appendChild(iconClone);
        tooltipLink.appendChild(textSpan);
        
        // Add link to tooltip
        tooltip.appendChild(tooltipLink);
        
        // Add tooltip event handlers to keep it visible when hovering
        const tooltipMouseEnterHandler = () => {
            tooltip.classList.add('show');
        };
        
        const tooltipMouseLeaveHandler = () => {
            this.hideTooltip();
        };
        
        tooltip.addEventListener('mouseenter', tooltipMouseEnterHandler);
        tooltip.addEventListener('mouseleave', tooltipMouseLeaveHandler);
        
        // Store handlers for cleanup
        tooltip._enterHandler = tooltipMouseEnterHandler;
        tooltip._leaveHandler = tooltipMouseLeaveHandler;
        
        // Add to body
        document.body.appendChild(tooltip);
        
        // Refresh feather icons for the cloned icon
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
        
        // Position tooltip
        const rect = navLink.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        // Position tooltip so the icon aligns with the original nav circle
        const left = rect.left;
        const top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }
    
    hideTooltip() {
        const existingTooltip = document.getElementById('nav-tooltip');
        if (existingTooltip) {
            // Clean up event listeners
            if (existingTooltip._enterHandler) {
                existingTooltip.removeEventListener('mouseenter', existingTooltip._enterHandler);
            }
            if (existingTooltip._leaveHandler) {
                existingTooltip.removeEventListener('mouseleave', existingTooltip._leaveHandler);
            }
            existingTooltip.remove();
        }
    }
    
    // Clean up event listeners to prevent memory leaks
    destroy() {
        // Clear all timeouts and intervals
        if (this.featherTimeout) {
            clearTimeout(this.featherTimeout);
        }
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        if (this.faviconUpdateInterval) {
            clearInterval(this.faviconUpdateInterval);
        }
        
        // Remove any tooltips
        this.hideTooltip();
        
        // Remove all event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        
        this.eventListeners = [];
        
        // Clear singleton instance
        StandaloneNavigation.instance = null;
    }
}

const navParam = getNavParam();
//const testParam = getNavParam('https://example.com?features.path=dashboard&user.name=john#features.story=onboarding&user.age=25&features.path=old-dashboard');
//console.log(JSON.stringify(testParam, null, 2));
//alert(testParam.features.story);

// Static property for singleton pattern
StandaloneNavigation.instance = null;

// Global instance
let standaloneNav;

// Initialize navigation function
function initializeStandaloneNav() {
    //let hash = getHash();
    const defaultToGeo = (navParam.list == "geo" || window.location.hostname.includes('geo') || window.location.hostname.includes('location'));
    if (defaultToGeo) {
        //return; // Return for maps with Add City Visit
    }
    console.log('[StandaloneNav] initializeStandaloneNav called, existing instance:', !!StandaloneNavigation.instance);
    
    // Clean up existing instance if it exists
    if (standaloneNav) {
        console.log('[StandaloneNav] Destroying existing navigation instance');
        standaloneNav.destroy();
    }
    
    // Clear singleton instance to force recreation
    StandaloneNavigation.instance = null;
    
    // Determine base path based on current location
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(segment => segment && !segment.endsWith('.html'));
    let basePath = '';
    let repoFolderName = null;
    let isWebrootContainer = false;
    let isExternalSite = false;
    
    // Auto-detect repository folder name by checking for known files
    // Look for typical repo files to identify the repository folder
    const knownRepoFiles = ['Cargo.toml', 'package.json', 'README.md', 'CLAUDE.md'];
    let detectedRepoName = null;
    
    /*
    // Try to detect repo folder from current path
    for (const segment of pathSegments) {
        // Skip common non-repo segments
        if (!['admin', 'js', 'css', 'img', 'preferences'].includes(segment)) {
            detectedRepoName = segment;
            break;
        }
    }
    
    // Fallback detection logic
    if (!detectedRepoName) {
        // Check if we have any path segments that could be a repo
        const possibleRepoSegment = pathSegments.find(segment => 
            !['admin', 'js', 'css', 'img', 'preferences', 'src', 'target'].includes(segment)
        );
        if (possibleRepoSegment) {
            detectedRepoName = possibleRepoSegment;
        }
    }
    */
    
    // Check if we're being called from an external site or within a webroot container
    if (detectedRepoName && pathSegments.includes(detectedRepoName)) {
        // We're inside the repository folder
        repoFolderName = detectedRepoName;
        isWebrootContainer = true;
        const repoIndex = pathSegments.indexOf(detectedRepoName);
        const segmentsAfterRepo = pathSegments.slice(repoIndex + 1);
        
        if (segmentsAfterRepo.length > 0) {
            basePath = '../'.repeat(segmentsAfterRepo.length);
            basePath = basePath.replace(/\/$/, '');
        }
    } else if (pathSegments.length > 0 && detectedRepoName) {
        // We're in a different site in the webroot, need to reference detected repo folder
        isExternalSite = true;
        repoFolderName = detectedRepoName;
        basePath = `/${detectedRepoName}`;
    } else if (pathSegments.length === 0) {
        // We're at root level - check if it's actually direct repo serving
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Local development - likely direct repo serving
            isExternalSite = false;
            basePath = './';
        } else {
            // External site at root - use fallback name
            isExternalSite = true;
            repoFolderName = 'explore'; // Default fallback
            basePath = '/explore';
        }
    } else {
        // Direct repo serving (legacy behavior)
        if (pathSegments.length > 1) {
            basePath = '../'.repeat(pathSegments.length - 1);
            basePath = basePath.replace(/\/$/, '');
        }
    }
    
    // Determine current page
    let currentPage = 'home';
    if (currentPath.includes('/admin/')) {
        currentPage = 'admin';
    }
    
    // Initialize standalone navigation
    standaloneNav = new StandaloneNavigation({
        basePath: basePath,
        currentPage: currentPage,
        isWebrootContainer: isWebrootContainer,
        repoFolderName: repoFolderName,
        isExternalSite: isExternalSite
    });
    
    // Make instance globally accessible
    window.standaloneNav = standaloneNav;
    
    // Restore state after initialization
    setTimeout(() => {
        standaloneNav.restoreState();
    }, 100);
}


function getNavParam(url = window.location.href) {
  const urlObj = new URL(url);
  const quickNavParam = {};
  
  // Helper function to set nested object properties using dot notation
  function setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    // Navigate to the parent object, creating nested objects as needed
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
        current[key] = {};
      }
      current = current[key];
    }
    
    // Set the final property
    const finalKey = keys[keys.length - 1];
    current[finalKey] = value;
  }
  
  // Parse hash parameters first (lower priority)
  const hashParams = new URLSearchParams(urlObj.hash.substring(1));
  for (const [key, value] of hashParams.entries()) {
    setNestedProperty(quickNavParam, key, value);
  }
  
  // Parse query parameters second (higher priority - will override hash params)
  const queryParams = urlObj.searchParams;
  for (const [key, value] of queryParams.entries()) {
    setNestedProperty(quickNavParam, key, value);
  }
  
  return quickNavParam;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeStandaloneNav);

// Re-initialize on page visibility change (when coming back to a page)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && !StandaloneNavigation.instance) {
        // Page became visible again - only reinitialize if no instance exists
        console.log('[StandaloneNav] Visibility change - reinitializing navigation');
        setTimeout(initializeStandaloneNav, 100);
    }
});

// Re-initialize on focus (when coming back to a page)
window.addEventListener('focus', function() {
    if (!StandaloneNavigation.instance) {
        // Only reinitialize if no instance exists
        console.log('[StandaloneNav] Focus event - reinitializing navigation');
        setTimeout(initializeStandaloneNav, 100);
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (standaloneNav) {
        standaloneNav.destroy();
    }
});

// Global function for manual favicon refresh
window.refreshFavicon = function() {
    if (standaloneNav && standaloneNav.refreshFavicon) {
        return standaloneNav.refreshFavicon();
    } else {
        console.warn('[FaviconManager] Navigation not initialized yet');
        return Promise.resolve(false);
    }
};