// Fetches the cms: block from the site config (support/site/config.yaml) and exposes
// window.CMS_SITE_CONFIG + window.launchCMS for use by Sveltia CMS and page buttons.
// window.cmsSiteConfigReady resolves to CMS_SITE_CONFIG, or null without a site config.

(function() {
  var resolveSiteConfig;
  window.cmsSiteConfigReady = window.cmsSiteConfigReady || new Promise(function(resolve) { resolveSiteConfig = resolve; });
  function siteConfigDone() {
    if (resolveSiteConfig) resolveSiteConfig(window.CMS_SITE_CONFIG || null);
  }

  if (typeof window.defineLaunchCMS === 'function') {
    window.defineLaunchCMS();
  }

  function parseCmsConfig(text) {
    var lines = text.split('\n');
    var cfg = { extra_css: [], extra_js: [] };
    var scope = 'root';
    var listKey = null;
    var logoIndent = -1;
    var listIndent = -1;

    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i];
      var trimmed = raw.replace(/^\s+/, '');
      var indent = raw.length - trimmed.length;
      if (!trimmed || trimmed[0] === '#') continue;

      var km = trimmed.match(/^([\w_]+):\s*(.*)/);
      var key = km ? km[1] : null;
      var val = km ? km[2].trim().replace(/^["']|["']$/g, '') : null;
      var isList = trimmed[0] === '-';

      if (scope === 'root') {
        if (key === 'cms' && !val && indent === 0) scope = 'cms';
        continue;
      }

      if (scope === 'cms') {
        if (indent === 0) break;
        if (!key) continue;
        if      (key === 'app_title')     cfg.app_title = val;
        else if (key === 'inline_editor') cfg.inline_editor = (val === 'true');
        else if (key === 'local_build')   cfg.local_build = (val === 'true');
        else if (key === 'auth_base_url') cfg.auth_base_url = val;
        else if (key === 'auth_endpoint') cfg.auth_endpoint = val;
        else if (key === 'logo' && !val)  { scope = 'logo'; logoIndent = indent; cfg.logo = {}; }
        else if (key === 'extra_css')     { scope = 'list'; listKey = 'extra_css'; listIndent = indent; }
        else if (key === 'extra_js')      { scope = 'list'; listKey = 'extra_js';  listIndent = indent; }
      } else if (scope === 'logo') {
        if (indent <= logoIndent) { scope = 'cms'; i--; continue; }
        if (!cfg.logo) cfg.logo = {};
        if      (key === 'show_in_header') cfg.logo.show_in_header = (val === 'true');
        else if (key === 'show_in_intro')  cfg.logo.show_in_intro  = (val === 'true');
      } else if (scope === 'list') {
        if (!isList || indent <= listIndent) { scope = 'cms'; i--; continue; }
        var v = trimmed.slice(1).trim().replace(/^["']|["']$/g, '');
        if (v) cfg[listKey].push(v);
      }
    }
    return cfg;
  }

  function applyCmsConfig(path, text) {
    var cfg = parseCmsConfig(text);
    window.CMS_SITE_CONFIG = cfg;
    if (cfg.inline_editor) window.cmsInlineEditor = true;
    if (!document.querySelector('link[rel="cms-config-url"]')) {
      var cfgLink = document.createElement('link');
      cfgLink.rel = 'cms-config-url';
      cfgLink.type = 'application/yaml';
      cfgLink.href = path;
      document.head.appendChild(cfgLink);
    }
  }

  // Sveltia CMS sets <html data-theme> from its Appearance preference. While that's Auto (the default,
  // which follows the system setting), follow the page's .dark mode instead. A Light or Dark choice in
  // Sveltia's settings (data-auto-theming="false") is left alone.
  function syncCmsTheme() {
    var root = document.documentElement;
    if (!document.body || root.dataset.autoTheming !== 'true') return;
    var theme = document.body.classList.contains('dark') ? 'dark' : 'light';
    if (root.dataset.theme !== theme) root.dataset.theme = theme;
  }
  new MutationObserver(syncCmsTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-auto-theming'] });
  document.addEventListener('sitelookchange', syncCmsTheme);
  if (document.body) {
    new MutationObserver(syncCmsTheme).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  if (typeof window.loadWebrootYaml === 'function') {
    window.loadWebrootYaml().then(function(result) {
      if (result.text) applyCmsConfig(result.path, result.text);
    }).finally(siteConfigDone);
  } else {
    // standalone fallback when loaded without localsite.js
    // model.earth serves the webroot repo's files from model.earth/webroot/
    var SITE_CONFIG_PATH = (location.hostname === 'model.earth' || location.hostname === 'www.model.earth') ? '/webroot/support/site/config.yaml' : '/support/site/config.yaml';
    var SESSION_KEY = 'webrootYamlPath';

    // TEMPORARY: model.earth ignores 'none', since it was saved before the config moved to /webroot/. Remove this exemption after Nov 1, 2026.
    var ignoreNone = location.hostname === 'model.earth' || location.hostname === 'www.model.earth';
    if (ignoreNone || sessionStorage.getItem(SESSION_KEY) !== 'none') {
      fetch(SITE_CONFIG_PATH)
        .then(function(r) { return r.ok ? r.text() : null; })
        .then(function(text) {
          if (text !== null) { sessionStorage.setItem(SESSION_KEY, SITE_CONFIG_PATH); applyCmsConfig(SITE_CONFIG_PATH, text); }
          else { sessionStorage.setItem(SESSION_KEY, 'none'); }
        })
        .catch(function() { sessionStorage.setItem(SESSION_KEY, 'none'); })
        .finally(siteConfigDone);
    } else {
      siteConfigDone();
    }
  }
})();
