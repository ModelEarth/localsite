# AGENTS.md

The AGENTS.md is the equivalent to CLAUDE.md

Use modern clean designs inspired by claude.ai

### HTML File Standards

New index.html pages can use a copy of the template:
/localsite/start/template/index.html

The template .html includes localsite.js and base.css

**UTF-8 Character Encoding**: Always include `<meta charset="UTF-8">` in the `<head>` section of new HTML pages to ensure proper character rendering and prevent display issues with special characters.

**Exceptions**: Do not add charset declarations to redirect pages, or to html template fragments that are included in other pages, as they inherit encoding from their parent documents.

### Icons

material-icons are available to pages that include localsite/js/localsite.js

### Alert Messages

Avoid including \n line breaks in alerts since they prevent text from being copied.

### DOM Element Waiting
- **NEVER use setTimeout() for waiting for DOM elements**
- **ALWAYS use waitForElm(selector)** from localsite/js/localsite.js instead
- Check if localsite/js/localsite.js is included in the page before using waitForElm
- If not included, ask user if localsite/js/localsite.js should be added to the page
- Example: `waitForElm('#element-id').then(() => { /* code */ });`
- waitForElm does not use timeouts and waits indefinitely until element appears

### Hash Management and URL State
Use these functions from localsite/js/localsite.js for hash-based state management:

#### Hash Reading and Manipulation
- **getHash()**: Returns hash parameters as an object
  ```javascript
  let hash = getHash(); // Returns {param1: 'value1', param2: 'value2'}
  ```

- **goHash(object)**: Updates hash with new parameters and triggers hashChangeEvent
  ```javascript
  goHash({'team': 'Marketing', 'view': 'list'}); // Triggers hash change event
  ```

- **updateHash(object)**: Updates hash without triggering hashChangeEvent
  ```javascript  
  updateHash({'team': 'Marketing'}); // Silent hash update, no event fired
  ```

#### Hash Change Listening
- **hashChangeEvent**: Custom event that fires when hash changes via goHash() and when URL hash is changed directly by the user.
- **Use on multiple page**: Allows multiple widgets in a page to independently respond to changing URL hash values.
  ```javascript
  document.addEventListener('hashChangeEvent', function (elem) {
      const hash = getHash();
      // Handle hash changes
  });
  ```

#### When to Use Each Function
- **Use goHash()**: When you want other components to react to hash changes
- **Use updateHash()**: When you want to update the hash without triggering reactions
- **Use hashChangeEvent**: To listen for hash changes triggered by goHash()
- **Always check function existence**: `if (typeof getHash === 'function')`

#### Detecting Hash Changes with priorHash
The `window.priorHash` object stores the previous hash state and is automatically maintained by localsite.js:

- **Automatically updated**: Updated by localsite.js whenever the hash changes (via goHash() or direct URL edit)
- **NOT updated by updateHash()**: Silent updates don't change priorHash, allowing intentional bypassing of change detection
- **Use for change detection**: Compare current hash with priorHash to detect actual changes and prevent unnecessary updates

Example usage pattern (from localsite/js/navigation.js):
```javascript
function handleHashChange() {
    const hash = getHash();
    const priorHashValue = window.priorHash?.paramName;

    // Only process if the parameter actually changed
    if (hash.paramName !== priorHashValue) {
        // Parameter changed, update the view
        updateView(hash.paramName);
    }
}

document.addEventListener('hashChangeEvent', handleHashChange);
```

**Why use priorHash?**
- Prevents double-processing when hash change handlers are called multiple times
- Avoids re-rendering when the same item is selected repeatedly
- Ensures map updates only happen when coordinates actually change
- Critical for preventing "every-other-click" bugs where caching happens before comparison

**Important**: Always use goHash() (not updateHash()) when you want priorHash to be updated and change detection to work properly.

#### Dual-Purpose Menu System (Food and Product Views)
The profile/item/menu.html page demonstrates hash-based view switching:

- **Food View (default)**: No `layout` parameter in hash
  - Shows food categories and USDA nutrition search
  - Country dropdown filters food search results (US = "American", IN = "India")

- **Product View**: `layout=product` in hash
  - Shows product categories from products-data repository
  - Country parameter (US or IN) determines which product catalog to display
  - Without product ID: displays category sidebar for browsing
  - With product ID: loads specific product environmental impact label

- **Hash Parameters**:
  - `layout`: "product" or absent (for food view)
  - `country`: "US" or "IN" (default: "US")
  - `id`: Product UUID (only in product view)

Example hash change handler:
```javascript
document.addEventListener('hashChangeEvent', loadMenu, false);
function loadMenu() {
    const hash = getHash();
    if (hash.layout == "product") {
        // Load product categories or specific product
        if (hash.id) {
            loadProductByCountryAndId(hash.country, hash.id);
        } else {
            loadProductCategorySidebar();
        }
    } else {
        // Load food categories
        loadFoodCategorySidebar();
    }
}
```
