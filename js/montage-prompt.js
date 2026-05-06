(function () {
  function getValue(selector) {
    const el = document.querySelector(selector);
    if (!el) return "";
    return "value" in el ? el.value.trim() : el.textContent.trim();
  }

  function buildPrompt() {
    const location = getValue("#keywordsTB");
    const request = getValue("#requests");
    const country =
      getValue("#country") ||
      getValue("#countrySelect") ||
      getValue("[name='country']");

    const parts = [];

    if (location) {
      parts.push(`Create a cinematic image/video montage for this location: ${location}.`);
    }

    if (country) {
      parts.push(`Use country context: ${country}.`);
    }

    if (request) {
      parts.push(`Additional context: ${request}.`);
    }

    parts.push("Include realistic environmental details, local culture, and visually engaging scenes.");

    return parts.join("\n");
  }

  function ensurePromptUI() {
    if (document.querySelector("#montagePromptWrap")) return;

    const requests = document.querySelector("#requests");
    if (!requests || !requests.parentNode) return;

    const wrap = document.createElement("div");
    wrap.id = "montagePromptWrap";
    wrap.style.margin = "12px 0";

    wrap.innerHTML = `
      <label for="montagePrompt" style="display:block;font-weight:600;margin-bottom:4px;">
        Montage Prompt
      </label>

      <textarea
        id="montagePrompt"
        rows="4"
        style="width:100%;max-width:720px;"
        placeholder="Prompt will be generated from selected location and filters..."
      ></textarea>

      <div style="margin-top:8px;">
        <button type="button" id="sendToMontageBtn">Montage</button>
        <button type="button" id="sendToChatBtn">Chat</button>
      </div>
    `;

    requests.parentNode.insertBefore(wrap, requests);
  }

  function updatePrompt() {
    const field = document.querySelector("#montagePrompt");
    if (field) field.value = buildPrompt();
  }

  function bindEvents() {
    ["#keywordsTB", "#requests", "#country", "#countrySelect", "[name='country']"].forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        el.addEventListener("input", updatePrompt);
        el.addEventListener("change", updatePrompt);
      });
    });

    document.addEventListener("click", function () {
      setTimeout(updatePrompt, 150);
    });

    const montageBtn = document.querySelector("#sendToMontageBtn");
    if (montageBtn) {
      montageBtn.addEventListener("click", function () {
        window.location.href = "/montage/?prompt=" + encodeURIComponent(getValue("#montagePrompt"));
      });
    }

    const chatBtn = document.querySelector("#sendToChatBtn");
    if (chatBtn) {
      chatBtn.addEventListener("click", function () {
        window.open("https://chatgpt.com/?q=" + encodeURIComponent(getValue("#montagePrompt")), "_blank");
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    ensurePromptUI();
    bindEvents();
    updatePrompt();
  });
})();