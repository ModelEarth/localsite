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
            '000732f4bc634964bac4968d4510ed0e',
            '000c1c639b18479cb2c55ea08693949d',
            '000cee52ac524c0193af8f93e8c825bc',
            '000e22ce2e134d4a95f6f83b245f1c79',
            '000e693366964320940c92b79ef0c973',
            '000f7fca7f4e42c7bd4da4991d7c2187',
            '0010b05572a54c52b0bedd1074a95daf',
            '0011aa2f95af4c76b85af7fff050bbc8'
        ],
        'Shotcrete': [
            // Add from Shotcrete folder when available
        ],
        'Flowable_Concrete_Fill': [
            // Add from Flowable_Concrete_Fill folder when available
        ],
        'High_Strength_Cement-Based_Grout': [
            // Add from grout folder when available
        ],
        'Acoustical_Ceilings': [
            '61a3d3f6469b4e9baa9da7605650a63d'
        ],
        'Cement': [
            // Add from Cement folder when available
        ],
        'Steel': [
            // Add from Steel folder when available
        ],
        'Gypsum_Board': [
            // Add from Gypsum_Board folder when available
        ],
        'Carpet': [
            // Add from Carpet folder when available
        ],
        'Asphalt': [
            // Add from Asphalt folder when available
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIndustryDetail);
} else {
    initIndustryDetail();
}

