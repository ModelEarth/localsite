# API Key Form

This page ([index.html](index.html)) is a form for storing API provider names and API keys in the browser. Keys are kept in local storage and can be copied or pasted to move them between browsers.

## Current behaviour

**Single input row**
- There is one fixed input row: provider dropdown, optional "Other" field, and API key field (with show/hide).
- When you choose a provider and enter an API key, click **Add** to save. The key is added to storage and shown in the YAML box below; the input row is then cleared so you can enter the next key in the same place. The page does not grow with multiple repeating sections.

**Storage**
- Data is stored in `localStorage` under the key `aPro` as **JSON**.
- Each key in the object is a **provider name**; the value is the API key string.
- Duplicate providers use **parentheses**: first is `"GitHub"`, second is `"GitHub (2)"`, then `"GitHub (3)"`, and so on.

**Provider list**
- The dropdown offers 19 fixed providers: Azure AI, Building Transparency, Claude AI, Cohere AI, Data Commons, Dreamstudio AI, ChatGPT Pro, ChatGPT Assistant, Fireworks AI, Gemini AI, GitHub, Groq, Mistral AI, NVIDIA, Observable, Replicate, Serp, Together AI, X.com.
- **"Other"** is also an option; when selected, a text field appears for a custom provider name.

**Copy**
- The main textarea shows `aPro` as **YAML** (order matches key order).
- **"Copy"** selects that YAML and copies it to the clipboard.
- **"Close"** hides the output area and the Close button.

**Update (main textarea)**
- The user can edit the YAML in the main textarea and click **"Update"**.
- The page parses that YAML into `aPro`, then refreshes the display. If the YAML has duplicate top-level keys, an alert appears: "Duplicate provides. Please add (2) after second instance." and the update is not applied.

**Paste**
- **"Paste"** shows a second textarea (`aProInput`).
- The handler on **input** parses the pasted string as **JSON** (not YAML) and merges keys into `aPro` (same provider is not overwritten; duplicates get numbered keys like `(2)`). Display is then refreshed. The paste-from-another-browser flow is **JSON-based**.

**Clear All**
- **"Clear All"** immediately clears `aPro` from localStorage and resets the form to one empty input row. There is no "Enter YES" prompt and no confirmation message.

**Undo**
- Before some actions (e.g. Add, Update, Clear All), the previous state is saved.
- **"Undo"** appears and restores that state if used within 10 minutes; after that the backup is removed.

**Dependencies**
- jQuery, js-yaml, [base.css](../../../css/base.css), [localsite.js](../../../js/localsite.js).

---

## History

The form was originally generated from a prompt given to ChatGPT 3.5 and has been updated since (e.g. single input row with Add-then-clear, JSON storage, YAML for display/copy, duplicate keys as `Provider (2)`, Undo, show/hide key). The original spec described multiple repeating panels and a "Clear All" confirmation with "Enter YES"; the current behaviour differs as above.

<!--
id is appended below to avoid reloading
-->
<!--
<script src="https://code.jquery.com/jquery-3.6.0.min.js" id="/localsite/js/jquery.min.js"></script>
-->
<!--
https://chat.openai.com/c/94f107ae-5e51-4719-b64f-651eaa7f2b27
https://chat.openai.com/share/82ca2102-1acd-4e94-8581-280365e012e3
-->
<!--
#3498db, #2980b9 (Blue)
#2ecc71, #27ae60 (Green)
#e74c3c, #c0392b (Red)
#f39c12, #e67e22 (Orange)
#9b59b6, #8e44ad (Purple)
#1abc9c, #16a085 (Turquoise)
#e67e22, #d35400 (Pumpkin)
#34495e, #2c3e50 (Navy)
#f1c40f, #f39c12 (Yellow)
#95a5a6, #7f8c8d (Grey)
-->
