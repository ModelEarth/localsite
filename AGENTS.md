# AGENTS.md

The AGENTS.md is the equivalent to CLAUDE.md

### HTML File Standards
**UTF-8 Character Encoding**: Always include `<meta charset="UTF-8">` in the `<head>` section of new HTML pages to ensure proper character rendering and prevent display issues with special characters.

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <!-- other meta tags and content -->
</head>
```

**Exceptions**: Do not add charset declarations to redirect pages or template fragments that are included in other pages, as they inherit encoding from their parent documents.

### Alert Messages

Avoid including \n line breaks in alert popups since they prevent text from being copied.

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
  const hash = getHash(); // Returns {param1: 'value1', param2: 'value2'}
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
- **Use on multiple page**: Allows multiple widgets in a page to independently responde to changing URL hash values.
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