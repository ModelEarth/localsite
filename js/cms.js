// Fetches the cms: block from the first available webroot.yaml and exposes
// window.CMS_SITE_CONFIG + window.launchCMS for use by the CMS fork and page buttons.

(function() {
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

  if (typeof window.loadWebrootYaml === 'function') {
    window.loadWebrootYaml().then(function(result) {
      if (result.text) applyCmsConfig(result.path, result.text);
    });
  } else {
    // standalone fallback when loaded without localsite.js
    var WEBROOT_PATHS = ['/webroot.yaml', '/docker/webroot.yaml', '/cms/webroot.yaml'];
    var SESSION_KEY = 'webrootYamlPath';

    function tryPath(index) {
      if (index >= WEBROOT_PATHS.length) { sessionStorage.setItem(SESSION_KEY, 'none'); return; }
      fetch(WEBROOT_PATHS[index])
        .then(function(r) { return r.ok ? r.text() : null; })
        .then(function(text) {
          if (text !== null) { sessionStorage.setItem(SESSION_KEY, WEBROOT_PATHS[index]); applyCmsConfig(WEBROOT_PATHS[index], text); }
          else { tryPath(index + 1); }
        })
        .catch(function() { tryPath(index + 1); });
    }

    var cached = sessionStorage.getItem(SESSION_KEY);
    if (cached && cached !== 'none') {
      fetch(cached)
        .then(function(r) { return r.ok ? r.text() : null; })
        .then(function(text) {
          if (text !== null) { applyCmsConfig(cached, text); }
          else { sessionStorage.removeItem(SESSION_KEY); tryPath(0); }
        })
        .catch(function() { sessionStorage.removeItem(SESSION_KEY); tryPath(0); });
    } else if (cached !== 'none') {
      tryPath(0);
    }
  }
})();
