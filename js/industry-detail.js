/**
 * Industry Detail Page Controller
 * Loads and displays industry details with related products from products-data repository
 * 
 * @description This module handles the display of individual NAICS industry details,
 * including loading related products from the products-data repository and rendering
 * them as interactive cards with environmental impact data.
 */

console.log('[IndustryDetail] Script loaded!');

// Configuration
const PRODUCTS_DATA_BASE_URL = 'https://raw.githubusercontent.com/ModelEarth/products-data/main/US';
const PRODUCTS_PER_PAGE = 24;

// State
let productCategoryMapping = null;
let currentNaicsCode = null;
let loadedProducts = [];
let currentProductIndex = 0;
let allProductFiles = [];

/**
 * Initialize industry detail functionality
 * Loads the product-category mapping file
 */
async function initIndustryDetail() {
    try {
        // Use full URL for GitHub Pages, relative path for localhost
        const baseUrl = window.location.hostname.includes('github.io')
            ? 'https://mohammed-saalim.github.io'
            : '';
        const response = await fetch(`${baseUrl}/io/naics/product-category-mapping.json`);
        if (response.ok) {
            productCategoryMapping = await response.json();
            console.log('[IndustryDetail] Product mapping loaded:', Object.keys(productCategoryMapping.mappings).length, 'categories');
        }
    } catch (error) {
        console.warn('[IndustryDetail] Could not load product mapping:', error);
    }
}

/**
 * Show industry detail page for a specific NAICS code
 * @param {string} naicsCode - The NAICS code to display
 * @param {object} sectorData - Optional sector data from USEEIO
 */
async function showIndustryDetail(naicsCode, sectorData) {
    console.log('[IndustryDetail] Showing detail for NAICS:', naicsCode);
    
    currentNaicsCode = naicsCode;
    currentProductIndex = 0;
    loadedProducts = [];
    allProductFiles = [];
    
    // Update header
    document.getElementById('industryNaicsCode').textContent = 'NAICS ' + naicsCode;
    
    // Try to find sector info from USEEIO data
    if (sectorData) {
        document.getElementById('industryDetailTitle').textContent = sectorData.name || 'Industry ' + naicsCode;
        document.getElementById('industryDetailDescription').textContent = sectorData.description || '';
    } else {
        // Fallback: try to get from mapping
        const categoryInfo = getCategoryInfoForNaics(naicsCode);
        if (categoryInfo) {
            document.getElementById('industryDetailTitle').textContent = categoryInfo.description || 'Industry ' + naicsCode;
            document.getElementById('industryDetailDescription').textContent = 'Products in categories: ' + categoryInfo.categories.join(', ');
        } else {
            document.getElementById('industryDetailTitle').textContent = 'Industry ' + naicsCode;
            document.getElementById('industryDetailDescription').textContent = '';
        }
    }
    
    // Reset stats (will be populated by naics.js if available)
    document.getElementById('industryEmployment').textContent = '--';
    document.getElementById('industryEstablishments').textContent = '--';
    document.getElementById('industryPayroll').textContent = '--';

    // Load products
    await loadProductsForNaics(naicsCode);

    // Load environmental impact data
    loadImpactData(naicsCode);

    // Load supply chain links
    loadSupplyChain(naicsCode);
}

/**
 * Get category info for a NAICS code from the mapping
 * @param {string} naicsCode - The NAICS code
 * @returns {object|null} Category info or null
 */
function getCategoryInfoForNaics(naicsCode) {
    if (!productCategoryMapping || !productCategoryMapping.reverseIndex) {
        return null;
    }
    
    // Try exact match first
    let categories = productCategoryMapping.reverseIndex[naicsCode];
    
    // Try with different formats (e.g., 327320 vs 3273)
    if (!categories) {
        // Try shorter codes
        for (let len = naicsCode.length; len >= 3; len--) {
            const shortCode = naicsCode.substring(0, len);
            categories = productCategoryMapping.reverseIndex[shortCode];
            if (categories) break;
        }
    }
    
    if (!categories || categories.length === 0) {
        return null;
    }
    
    // Get description from first category
    const firstCategory = productCategoryMapping.mappings[categories[0]];
    
    return {
        categories: categories,
        description: firstCategory ? firstCategory.description : null,
        totalProducts: categories.reduce((sum, cat) => {
            const mapping = productCategoryMapping.mappings[cat];
            return sum + (mapping ? mapping.productCount || 0 : 0);
        }, 0)
    };
}

/**
 * Load products for a NAICS code
 * @param {string} naicsCode - The NAICS code
 */
async function loadProductsForNaics(naicsCode) {
    const grid = document.getElementById('productGrid');
    const loading = document.getElementById('productLoading');
    const noProducts = document.getElementById('noProductsMessage');
    const loadMore = document.getElementById('loadMoreProducts');
    const countSpan = document.getElementById('productCount');
    
    // Show loading
    grid.innerHTML = '';
    loading.style.display = 'block';
    noProducts.style.display = 'none';
    loadMore.style.display = 'none';
    
    // Get categories for this NAICS
    const categoryInfo = getCategoryInfoForNaics(naicsCode);
    
    if (!categoryInfo || categoryInfo.categories.length === 0) {
        loading.style.display = 'none';
        noProducts.style.display = 'block';
        countSpan.textContent = '(0 products)';
        console.log('[IndustryDetail] No categories found for NAICS:', naicsCode);
        return;
    }
    
    console.log('[IndustryDetail] Found categories:', categoryInfo.categories);
    countSpan.textContent = '(' + categoryInfo.totalProducts.toLocaleString() + ' products available)';
    
    // For now, we'll load a sample of products from each category
    // In production, this could use an index file or API
    try {
        const products = await fetchProductSamples(categoryInfo.categories, PRODUCTS_PER_PAGE);
        
        loading.style.display = 'none';
        
        if (products.length === 0) {
            noProducts.style.display = 'block';
            return;
        }
        
        // Render products
        loadedProducts = products;
        renderProducts(products);
        
        // Ensure no products message is hidden
        noProducts.style.display = 'none';
        
        // Show load more if there might be more products
        if (categoryInfo.totalProducts > PRODUCTS_PER_PAGE) {
            loadMore.style.display = 'block';
        }
        
    } catch (error) {
        console.error('[IndustryDetail] Error loading products:', error);
        loading.style.display = 'none';
        noProducts.style.display = 'block';
    }
}

/**
 * Fetch sample products from categories
 * @param {array} categories - Array of category names
 * @param {number} limit - Maximum products to fetch
 * @param {number} skip - Number of products to skip (for pagination)
 * @returns {array} Array of product objects
 */
async function fetchProductSamples(categories, limit, skip = 0) {
    const products = [];
    const productsPerCategory = Math.ceil(limit / categories.length);
    const skipPerCategory = Math.ceil(skip / categories.length);

    for (const category of categories) {
        if (products.length >= limit) break;

        try {
            // Fetch the products.csv or a sample file for this category
            // For now, we'll try to load a few known product files
            const categoryProducts = await fetchCategoryProducts(category, productsPerCategory, skipPerCategory);
            products.push(...categoryProducts);
        } catch (error) {
            console.warn('[IndustryDetail] Could not load products for category:', category, error);
        }
    }

    return products.slice(0, limit);
}

/**
 * Fetch products from a specific category
 * @param {string} category - Category name
 * @param {number} limit - Maximum products to fetch
 * @param {number} skip - Number of products to skip (for pagination)
 * @returns {array} Array of product objects
 */
async function fetchCategoryProducts(category, limit, skip = 0) {
    const products = [];

    // Try to fetch from the US folder structure
    // Products are in: US/{Category}/{uuid}.yaml

    // For demonstration, we'll use a hardcoded list of known product IDs
    // In production, this should use an index file
    const knownProducts = getKnownProductsForCategory(category);

    // Slice the known products to implement pagination
    const startIndex = skip;
    const endIndex = skip + limit;
    const productsToFetch = knownProducts.slice(startIndex, endIndex);

    for (const productId of productsToFetch) {
        try {
            const url = `${PRODUCTS_DATA_BASE_URL}/${category}/${productId}.yaml`;
            const response = await fetch(url);

            if (response.ok) {
                const yamlText = await response.text();
                const product = parseYamlProduct(yamlText, productId, category);
                if (product) {
                    products.push(product);
                }
            }
        } catch (error) {
            // Skip failed products silently
        }
    }

    return products;
}

/**
 * Get known product IDs for a category
 * This is a temporary solution - in production use an index file
 * @param {string} category - Category name
 * @returns {array} Array of product UUIDs
 */
function getKnownProductsForCategory(category) {
    // Sample product IDs from the products-data repo for demonstration
    // In production, this should use an index file or API
    const knownProducts = {
        'Ready_Mix': [
            'ec3000d4', 'ec3001ax', 'ec30032d', 'ec3005gp',
            'ec300bpy', 'ec300c9d', 'ec300d8p', 'ec300db5'
        ],
        'Shotcrete': [
            'ec3003uy', 'ec3009ud', 'ec301qpu', 'ec302b3h',
            'ec303zpq', 'ec30708m', 'ec307pap', 'ec308nmc'
        ],
        'Flowable_Concrete_Fill': [],
        'High_Strength_Cement-Based_Grout': [],
        'Acoustical_Ceilings': [
            'ec34dgk1', 'ec3k6c1d'
        ],
        'Cement': [
            'ec33m9e1', 'ec34txjt', 'ec34zxa1', 'ec37nq12',
            'ec37y2bk', 'ec38s207', 'ec3gbqug', 'ec3htr2a'
        ],
        'Steel': [
            'ec3src6x'
        ],
        'Coil_Steel': [
            'ec30d2qj', 'ec3a646t', 'ec3a6ngm', 'ec3ahpea',
            'ec3fwne8', 'ec3hsdfw', 'ec3s17t8', 'ec3xar3h'
        ],
        'Structural_Steel': [
            'ec31zw5h', 'ec3mtme4', 'ec3sxgng', 'ec3ue4ae'
        ],
        'Gypsum_Board': [
            'ec32ayws', 'ec32p7es', 'ec32pye8', 'ec33a3y1',
            'ec33fp7p', 'ec35n87r', 'ec35x08r', 'ec35z4af'
        ],
        'Carpet': [
            'ec357t8x', 'ec375pgp', 'ec3954f2', 'ec3bayh4',
            'ec3bb7fn', 'ec3caufd', 'ec3epmm0', 'ec3ghy2j'
        ],
        'Asphalt': [
            'ec300sgk', 'ec3010gy', 'ec30d8db', 'ec30dd18',
            'ec30efeq', 'ec30nqkj', 'ec30ny02', 'ec30rtpm'
        ],
        'Brick': [
            'ec3dnrg4', 'ec3h3e48'
        ],
        'Concrete': [
            'ec376z7h', 'ec37pwz4', 'ec387kjm', 'ec3kzesx',
            'ec3rdre8', 'ec3t2tcs', 'ec3tmth5'
        ]
    };
    
    return knownProducts[category] || [];
}

/**
 * Parse YAML product data (simple parser for key fields)
 * @param {string} yamlText - Raw YAML text
 * @param {string} productId - Product UUID
 * @param {string} category - Category name
 * @returns {object} Parsed product object
 */
function parseYamlProduct(yamlText, productId, category) {
    try {
        // Simple YAML parsing for key fields
        const getValue = (key) => {
            const regex = new RegExp(`^${key}:\\s*(.+)$`, 'm');
            const match = yamlText.match(regex);
            return match ? match[1].trim().replace(/^["']|["']$/g, '') : null;
        };
        
        const getNestedValue = (parent, key) => {
            const regex = new RegExp(`${parent}:[\\s\\S]*?${key}:\\s*(.+)$`, 'm');
            const match = yamlText.match(regex);
            return match ? match[1].trim().replace(/^["']|["']$/g, '') : null;
        };
        
        const name = getValue('name');
        const gwp = getValue('gwp');
        const gwp_z = parseFloat(getValue('gwp_z')) || 0;
        const declared_unit = getValue('declared_unit');
        const short_link = getValue('short_link');
        const doc = getValue('doc');
        const manufacturerName = getNestedValue('manufacturer', 'name');
        const categoryDisplayName = getNestedValue('category', 'display_name');
        
        if (!name) return null;

        // Ensure EPD link has proper protocol
        let epdLink = short_link || doc || `https://buildingtransparency.org/ec3/epds/${productId}`;

        // Fix relative URLs - add https:// if missing
        if (epdLink && !epdLink.startsWith('http://') && !epdLink.startsWith('https://')) {
            // If it looks like a BuildingTransparency.org URL, add https://
            if (epdLink.includes('buildingtransparency.org')) {
                epdLink = 'https://' + epdLink;
            } else {
                // Default to https://
                epdLink = 'https://buildingtransparency.org/' + epdLink.replace(/^\/+/, '');
            }
        }

        return {
            id: productId,
            name: name,
            gwp: gwp,
            gwp_z: gwp_z,
            declared_unit: declared_unit,
            manufacturer: { name: manufacturerName },
            category: { display_name: categoryDisplayName || category },
            short_link: short_link,
            doc: doc,
            epd_link: epdLink
        };
    } catch (error) {
        console.warn('[IndustryDetail] Error parsing product YAML:', error);
        return null;
    }
}

/**
 * Render products to the grid
 * @param {array} products - Array of product objects
 */
function renderProducts(products) {
    const grid = document.getElementById('productGrid');
    
    products.forEach(product => {
        const card = createProductCard(product);
        grid.appendChild(card);
    });
}

/**
 * Create a product card element
 * @param {object} product - Product data object
 * @returns {HTMLElement} Product card element
 */
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    // Apply critical inline styles to ensure layout works
    // This overrides any conflicting CSS from base.css or other stylesheets
    card.style.cssText = `
        background: white !important;
        border: 1px solid #e0e0e0 !important;
        border-radius: 12px !important;
        padding: 20px !important;
        display: flex !important;
        flex-direction: column !important;
        min-height: 200px !important;
        box-sizing: border-box !important;
    `;

    // Determine GWP status based on z-score
    let gwpClass = 'gwp-average';
    let gwpLabel = 'Average';
    
    if (product.gwp_z !== undefined && product.gwp_z !== null) {
        if (product.gwp_z < -0.5) {
            gwpClass = 'gwp-good';
            gwpLabel = 'Below Avg';
        } else if (product.gwp_z > 0.5) {
            gwpClass = 'gwp-poor';
            gwpLabel = 'Above Avg';
        }
    }
    
    // Format GWP value
    const gwpFormatted = formatGWP(product.gwp);
    
    // Truncate name if too long
    const displayName = truncateText(product.name, 60);
    const manufacturerName = product.manufacturer?.name || 'Unknown Manufacturer';
    
    // Determine badge background colors based on GWP class
    let badgeBgColor = '#fff3cd';  // average (yellow)
    let badgeTextColor = '#856404';
    if (gwpClass === 'gwp-good') {
        badgeBgColor = '#d4edda';
        badgeTextColor = '#155724';
    } else if (gwpClass === 'gwp-poor') {
        badgeBgColor = '#f8d7da';
        badgeTextColor = '#721c24';
    }

    // Determine metric value color
    let metricValueColor = '#856404';  // average
    if (gwpClass === 'gwp-good') {
        metricValueColor = '#28a745';
    } else if (gwpClass === 'gwp-poor') {
        metricValueColor = '#dc3545';
    }

    card.innerHTML = `
        <div class="product-card-header" style="display:flex !important; flex-direction:row !important; justify-content:space-between !important; align-items:flex-start !important; margin-bottom:8px !important; gap:10px !important; width:100% !important;">
            <div class="product-name" style="font-weight:600 !important; font-size:15px !important; color:#333 !important; line-height:1.4 !important; flex:1 !important; display:block !important; word-wrap:break-word !important;" title="${escapeHtml(product.name)}">${escapeHtml(displayName)}</div>
            <span class="gwp-badge ${gwpClass}" style="font-size:11px !important; padding:4px 8px !important; border-radius:4px !important; font-weight:500 !important; white-space:nowrap !important; flex-shrink:0 !important; background:${badgeBgColor} !important; color:${badgeTextColor} !important; height:fit-content !important;">${gwpLabel}</span>
        </div>
        <div class="product-manufacturer" style="font-size:13px !important; color:#666 !important; margin-bottom:15px !important; display:block !important; width:100% !important;">by ${escapeHtml(manufacturerName)}</div>
        <div class="product-metrics" style="display:grid !important; grid-template-columns:1fr 1fr !important; gap:10px !important; margin-bottom:15px !important; width:100% !important;">
            <div class="metric" style="background:#f8f9fa !important; padding:12px !important; border-radius:8px !important; display:flex !important; flex-direction:column !important;">
                <div class="metric-label" style="font-size:10px !important; color:#888 !important; text-transform:uppercase !important; letter-spacing:0.5px !important; margin-bottom:4px !important; display:block !important;">Carbon Footprint</div>
                <div class="metric-value" style="font-size:16px !important; font-weight:600 !important; color:#333 !important; display:block !important;">${gwpFormatted}</div>
            </div>
            <div class="metric" style="background:#f8f9fa !important; padding:12px !important; border-radius:8px !important; display:flex !important; flex-direction:column !important;">
                <div class="metric-label" style="font-size:10px !important; color:#888 !important; text-transform:uppercase !important; letter-spacing:0.5px !important; margin-bottom:4px !important; display:block !important;">vs Category</div>
                <div class="metric-value ${gwpClass}" style="font-size:16px !important; font-weight:600 !important; display:block !important; color:${metricValueColor} !important;">${gwpLabel}</div>
            </div>
        </div>
        <div class="product-card-footer" style="display:flex !important; justify-content:space-between !important; align-items:center !important; padding-top:12px !important; border-top:1px solid #eee !important; margin-top:auto !important;">
            <span style="font-size:12px; color:#888;">${escapeHtml(product.declared_unit || '')}</span>
            <a href="${escapeHtml(product.epd_link)}" target="_blank" rel="noopener noreferrer" class="view-epd-link" style="color:#007bff !important; text-decoration:none !important; font-size:13px !important; font-weight:500 !important; display:inline-flex !important; align-items:center !important; gap:4px !important; transition:color 0.2s ease !important;">
                <span>View EPD</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="flex-shrink:0 !important;">
                    <path d="M10.5 1.5H7.5M10.5 1.5V4.5M10.5 1.5L6 6M5 1.5H3.5C2.67157 1.5 2 2.17157 2 3V8.5C2 9.32843 2.67157 10 3.5 10H9C9.82843 10 10.5 9.32843 10.5 9V7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </a>
        </div>
    `;
    
    return card;
}

/**
 * Load more products (pagination)
 */
async function loadMoreProducts() {
    const categoryInfo = getCategoryInfoForNaics(currentNaicsCode);
    if (!categoryInfo) return;

    const loadMoreBtn = document.getElementById('loadMoreProducts');
    const grid = document.getElementById('productGrid');

    // Show loading state
    loadMoreBtn.innerHTML = '<span style="display:inline-block; width:14px; height:14px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spin 0.6s linear infinite;"></span> Loading...';
    loadMoreBtn.disabled = true;
    loadMoreBtn.style.opacity = '0.7';
    loadMoreBtn.style.cursor = 'not-allowed';

    try {
        // Calculate how many products we've already loaded
        const productsToSkip = loadedProducts.length;
        const productsToLoad = PRODUCTS_PER_PAGE;

        // Fetch next batch of products
        const newProducts = await fetchProductSamples(categoryInfo.categories, productsToLoad, productsToSkip);

        if (newProducts.length > 0) {
            // Append new products to the loaded list
            loadedProducts.push(...newProducts);

            // Render new products (append to grid)
            newProducts.forEach(product => {
                const card = createProductCard(product);
                grid.appendChild(card);
            });

            console.log('[IndustryDetail] Loaded', newProducts.length, 'more products. Total:', loadedProducts.length);
        }

        // Hide button if we've loaded all products or no more products available
        if (newProducts.length < productsToLoad || loadedProducts.length >= categoryInfo.totalProducts) {
            loadMoreBtn.style.display = 'none';
        } else {
            // Reset button state
            loadMoreBtn.innerHTML = 'Load More Products';
            loadMoreBtn.disabled = false;
            loadMoreBtn.style.opacity = '1';
            loadMoreBtn.style.cursor = 'pointer';
        }

    } catch (error) {
        console.error('[IndustryDetail] Error loading more products:', error);
        loadMoreBtn.innerHTML = 'Load More Products';
        loadMoreBtn.disabled = false;
        loadMoreBtn.style.opacity = '1';
        loadMoreBtn.style.cursor = 'pointer';
    }
}

/**
 * Update industry stats from Census/BEA data
 * @param {object} stats - Stats object with employment, establishments, payroll
 */
function updateIndustryStats(stats) {
    if (stats.employment !== undefined) {
        const employmentEl = document.getElementById('industryEmployment');
        if (employmentEl) {
            employmentEl.textContent = typeof stats.employment === 'number' ? stats.employment.toLocaleString() : stats.employment;
        } else {
            console.error('[updateIndustryStats] industryEmployment element not found!');
        }
    }
    if (stats.establishments !== undefined) {
        const establishmentsEl = document.getElementById('industryEstablishments');
        if (establishmentsEl) {
            establishmentsEl.textContent = typeof stats.establishments === 'number' ? stats.establishments.toLocaleString() : stats.establishments;
        } else {
            console.error('[updateIndustryStats] industryEstablishments element not found!');
        }
    }
    if (stats.payroll !== undefined) {
        const payrollEl = document.getElementById('industryPayroll');
        if (payrollEl) {
            payrollEl.textContent = typeof stats.payroll === 'number' ? '$' + (stats.payroll / 1000).toFixed(1) + 'M' : stats.payroll;
        } else {
            console.error('[updateIndustryStats] industryPayroll element not found!');
        }
    }
}

/**
 * Load USEEIO environmental impact data for a NAICS sector
 * Fetches indicators and D matrix to show impact profile
 * @param {string} naicsCode - The NAICS code
 */
async function loadImpactData(naicsCode) {
    const container = document.getElementById('industryImpactCharts');
    if (!container) return;

    container.innerHTML = '<div style="text-align:center; padding:20px; color:#666;">Loading environmental impact data...</div>';

    try {
        // Determine model and endpoint based on current state
        let hash = {};
        if (typeof getHash === 'function') {
            hash = getHash();
        } else {
            // Parse hash manually
            const hashStr = window.location.hash.substring(1);
            hashStr.split('&').forEach(pair => {
                const [k, v] = pair.split('=');
                if (k && v) hash[k] = v;
            });
        }

        // Always use the national model (411 sectors) for detailed impact data.
        // State models only have ~146 aggregated sectors (e.g., "327" not "327320"),
        // so they won't match specific NAICS codes.
        let endpoint = '/io/build/api';
        let modelName = 'USEEIOv2.0.1-411';

        const baseUrl = endpoint + '/' + modelName;

        // Fetch sectors, indicators, D matrix, and q vector in parallel
        const [sectors, indicators, matrixD, vectorQ] = await Promise.all([
            fetch(baseUrl + '/sectors.json').then(r => r.ok ? r.json() : []),
            fetch(baseUrl + '/indicators.json').then(r => r.ok ? r.json() : []),
            fetch(baseUrl + '/matrix/D.json').then(r => r.ok ? r.json() : []),
            fetch(baseUrl + '/matrix/q.json').then(r => r.ok ? r.json() : [])
        ]);

        if (!sectors.length || !indicators.length || !matrixD.length) {
            container.innerHTML = '<p style="color:#666;">Environmental impact data not available for this model.</p>';
            return;
        }

        // Find the sector matching this NAICS code
        const sector = sectors.find(s => s.code === naicsCode || s.code.startsWith(naicsCode) || naicsCode.startsWith(s.code));

        if (!sector) {
            container.innerHTML = '<p style="color:#666;">No USEEIO sector found matching NAICS ' + naicsCode + '.</p>';
            return;
        }

        // Update title/description if we found a better name from USEEIO
        const titleEl = document.getElementById('industryDetailTitle');
        if (titleEl && (titleEl.textContent === 'Industry ' + naicsCode || titleEl.textContent === '')) {
            titleEl.textContent = sector.name;
        }
        const descEl = document.getElementById('industryDetailDescription');
        if (descEl && sector.description) {
            descEl.textContent = sector.description;
        }

        // Key environmental indicators to display
        const keyIndicators = ['GHG', 'WATR', 'ENRG', 'JOBS', 'VADD', 'ACID', 'SMOG', 'LAND'];

        // Build impact data
        const impacts = [];
        indicators.forEach(ind => {
            if (!keyIndicators.includes(ind.code)) return;

            const dValue = matrixD[ind.index] ? matrixD[ind.index][sector.index] : 0;
            const qValue = vectorQ[sector.index] ? vectorQ[sector.index][0] : 0;
            const actualValue = dValue * qValue;

            impacts.push({
                code: ind.code,
                name: ind.simplename || ind.name,
                unit: ind.simpleunit || ind.unit,
                coefficient: dValue,
                actualValue: actualValue,
                index: ind.index
            });
        });

        // Sort: JOBS and VADD first, then by actual value descending
        impacts.sort((a, b) => {
            const priority = { 'JOBS': 0, 'VADD': 1, 'GHG': 2 };
            const pa = priority[a.code] !== undefined ? priority[a.code] : 10;
            const pb = priority[b.code] !== undefined ? priority[b.code] : 10;
            if (pa !== pb) return pa - pb;
            return Math.abs(b.actualValue) - Math.abs(a.actualValue);
        });

        // Find max for bar scaling
        const maxVal = Math.max(...impacts.map(i => Math.abs(i.coefficient)));

        // Render impact bars
        let html = '<div style="margin-bottom:10px; font-size:13px; color:#666;">Sector: <strong>' + escapeHtml(sector.name) + '</strong> (' + escapeHtml(sector.code) + ')</div>';
        html += '<div style="display:grid; gap:12px;">';

        impacts.forEach(impact => {
            const barWidth = maxVal > 0 ? Math.max(2, (Math.abs(impact.coefficient) / maxVal) * 100) : 0;
            const color = getIndicatorColor(impact.code);
            const formattedValue = formatImpactValue(impact.actualValue, impact.code);
            const coeffFormatted = impact.coefficient.toExponential(2);

            html += '<div style="display:grid; grid-template-columns:140px 1fr auto; align-items:center; gap:10px;">';
            html += '  <div style="font-size:13px; font-weight:500; color:#555;">' + escapeHtml(impact.name) + '</div>';
            html += '  <div style="background:#f0f0f0; border-radius:4px; overflow:hidden; height:24px;">';
            html += '    <div style="width:' + barWidth + '%; height:100%; background:' + color + '; border-radius:4px; transition:width 0.5s ease;"></div>';
            html += '  </div>';
            html += '  <div style="font-size:13px; font-weight:600; color:#333; min-width:100px; text-align:right;" title="Coefficient: ' + coeffFormatted + ' per $">' + formattedValue + '</div>';
            html += '</div>';
        });

        html += '</div>';
        html += '<p style="font-size:12px; color:#999; margin-top:15px;">Impact values from USEEIO v2 model. Hover values for per-dollar coefficients. Data: U.S. EPA</p>';

        container.innerHTML = html;

    } catch (error) {
        console.error('[IndustryDetail] Error loading impact data:', error);
        container.innerHTML = '<p style="color:#666;">Could not load environmental impact data. <a href="/io/charts/inflow-outflow/#naics=' + naicsCode + '" style="color:#007bff;">View in Inflow-Outflow Chart</a></p>';
    }
}

/**
 * Load supply chain information for a NAICS sector
 * @param {string} naicsCode - The NAICS code
 */
function loadSupplyChain(naicsCode) {
    const container = document.getElementById('industrySupplyChain');
    if (!container) return;

    // Parse current hash for state
    let hash = {};
    if (typeof getHash === 'function') {
        hash = getHash();
    } else {
        const hashStr = window.location.hash.substring(1);
        hashStr.split('&').forEach(pair => {
            const [k, v] = pair.split('=');
            if (k && v) hash[k] = v;
        });
    }

    const stateParam = hash.state ? '&state=' + hash.state : '';
    const inflowOutflowUrl = '/io/charts/inflow-outflow/#naics=' + naicsCode + stateParam;

    let html = '<div style="padding:20px; background:#f8f9fa; border-radius:8px;">';
    html += '  <p style="margin-bottom:15px; color:#555;">Explore which industries supply inputs to and receive outputs from this sector using the interactive Inflow-Outflow chart.</p>';
    html += '  <a href="' + inflowOutflowUrl + '" target="_blank" style="display:inline-flex; align-items:center; gap:8px; padding:10px 20px; background:#007bff; color:white; border-radius:6px; text-decoration:none; font-weight:500; transition:background 0.2s;">';
    html += '    View Supply Chain Analysis';
    html += '    <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M10.5 1.5H7.5M10.5 1.5V4.5M10.5 1.5L6 6M5 1.5H3.5C2.67157 1.5 2 2.17157 2 3V8.5C2 9.32843 2.67157 10 3.5 10H9C9.82843 10 10.5 9.32843 10.5 9V7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    html += '  </a>';
    html += '</div>';

    container.innerHTML = html;
}

/**
 * Get color for an environmental indicator
 * @param {string} code - Indicator code
 * @returns {string} CSS color
 */
function getIndicatorColor(code) {
    const colors = {
        'GHG': '#e74c3c',
        'WATR': '#3498db',
        'ENRG': '#f39c12',
        'JOBS': '#27ae60',
        'VADD': '#2ecc71',
        'ACID': '#e67e22',
        'SMOG': '#9b59b6',
        'LAND': '#1abc9c'
    };
    return colors[code] || '#95a5a6';
}

/**
 * Format impact value for display
 * @param {number} value - Raw impact value
 * @param {string} code - Indicator code
 * @returns {string} Formatted string
 */
function formatImpactValue(value, code) {
    if (!value || value === 0) return '--';

    if (code === 'JOBS') {
        return Math.round(value).toLocaleString() + ' jobs';
    }
    if (code === 'VADD') {
        if (value >= 1e9) return '$' + (value / 1e9).toFixed(1) + 'B';
        if (value >= 1e6) return '$' + (value / 1e6).toFixed(1) + 'M';
        if (value >= 1e3) return '$' + (value / 1e3).toFixed(1) + 'K';
        return '$' + Math.round(value).toLocaleString();
    }
    if (code === 'GHG') {
        if (value >= 1e9) return (value / 1e9).toFixed(1) + 'B kg CO₂e';
        if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M kg CO₂e';
        if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K kg CO₂e';
        return Math.round(value).toLocaleString() + ' kg CO₂e';
    }
    // Generic formatting
    if (Math.abs(value) >= 1e9) return (value / 1e9).toFixed(1) + 'B';
    if (Math.abs(value) >= 1e6) return (value / 1e6).toFixed(1) + 'M';
    if (Math.abs(value) >= 1e3) return (value / 1e3).toFixed(1) + 'K';
    if (Math.abs(value) >= 1) return value.toFixed(1);
    return value.toExponential(2);
}

// Helper Functions

/**
 * Format GWP value for display
 * @param {string|number} gwp - GWP value
 * @returns {string} Formatted GWP string
 */
function formatGWP(gwp) {
    if (!gwp) return '--';
    
    // Extract numeric value and unit
    const str = gwp.toString();
    const match = str.match(/([0-9.]+)\s*(.*)/);
    
    if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2] || 'kgCO₂e';
        
        if (value >= 1000) {
            return (value / 1000).toFixed(1) + ' t CO₂e';
        } else if (value >= 1) {
            return Math.round(value) + ' kg CO₂e';
        } else {
            return value.toFixed(2) + ' kg CO₂e';
        }
    }
    
    return gwp;
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export functions for global access
window.initIndustryDetail = initIndustryDetail;
window.showIndustryDetail = showIndustryDetail;
window.updateIndustryStats = updateIndustryStats;
window.loadMoreProducts = loadMoreProducts;
window.loadImpactData = loadImpactData;
window.loadSupplyChain = loadSupplyChain;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIndustryDetail);
} else {
    initIndustryDetail();
}

// Listen for hash changes to refresh industry detail when NAICS changes
window.addEventListener('hashchange', function() {
    const hashStr = window.location.hash.substring(1);
    const params = {};
    hashStr.split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        if (k && v) params[k] = decodeURIComponent(v);
    });

    // Only act if we have a single NAICS code and a state
    if (params.state && params.naics && params.naics.indexOf(',') < 0) {
        const detailDiv = document.getElementById('industryDetail');
        if (detailDiv && detailDiv.style.display !== 'none') {
            // NAICS changed while detail view is visible - refresh
            if (params.naics !== currentNaicsCode) {
                console.log('[IndustryDetail] Hash changed, refreshing for NAICS:', params.naics);
                showIndustryDetail(params.naics);
            }
        }
    }
});

