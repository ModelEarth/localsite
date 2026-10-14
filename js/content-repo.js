// Lets site visitors keep content in their own GitHub fork of DesktopFolders/content.
// Signs in with the same popup handshake Sveltia CMS uses, through the auth_base_url
// relay in the cms: block of support/site/config.yaml (CloudRoot Worker's /api/cms/auth),
// or Netlify's default service when that isn't set. Used by localsite/edit/.

(function() {
    var UPSTREAM = 'DesktopFolders/content';
    var TOKEN_KEY = 'contentRepoToken';   // sessionStorage: cleared when the tab closes
    var FORK_KEY = 'contentRepoFork';     // localStorage: the visitor's fork, e.g. "octocat/content"
    var API = 'https://api.github.com';

    function authUrl(scope) {
        var cms = window.CMS_SITE_CONFIG || {};
        var base, siteId = location.hostname;
        if (cms.auth_base_url) {
            base = cms.auth_base_url.replace(/\/$/, '') + '/' + (cms.auth_endpoint || 'api/cms/auth').replace(/^\//, '');
        } else {
            // Same default as Sveltia CMS. Netlify only accepts localhost as cms.netlify.com.
            base = 'https://api.netlify.com/auth';
            if (siteId === 'localhost') siteId = 'cms.netlify.com';
        }
        return base + '?' + new URLSearchParams({ provider: 'github', site_id: siteId, scope: scope }).toString();
    }

    // Must be called directly from a click handler so the popup isn't blocked.
    function signIn(scope) {
        var url = authUrl(scope || 'public_repo');
        var origin = new URL(url).origin;
        var popup = window.open(url, 'contentRepoSignIn', 'width=600,height=720');
        if (!popup) return Promise.reject(new Error('The sign-in popup was blocked. Allow popups for this site and try again.'));

        return new Promise(function(resolve, reject) {
            var closedTimer = setInterval(function() {
                if (popup.closed) { cleanup(); reject(new Error('Sign-in was cancelled.')); }
            }, 1000);
            function cleanup() {
                clearInterval(closedTimer);
                window.removeEventListener('message', onMessage);
            }
            function onMessage(event) {
                if (event.source !== popup || event.origin !== origin || typeof event.data !== 'string') return;
                if (event.data === 'authorizing:github') {
                    popup.postMessage(event.data, origin);
                    return;
                }
                var match = event.data.match(/^authorization:github:(success|error):(.+)$/);
                if (!match) return;
                cleanup();
                popup.close();
                var result = {};
                try { result = JSON.parse(match[2]); } catch (e) { result = { error: 'Malformed sign-in response.' }; }
                if (match[1] === 'success' && result.token) {
                    sessionStorage.setItem(TOKEN_KEY, result.token);
                    resolve(result.token);
                } else {
                    reject(new Error(result.error || 'Sign-in failed.'));
                }
            }
            window.addEventListener('message', onMessage);
        });
    }

    function getToken() { return sessionStorage.getItem(TOKEN_KEY); }

    function signOut() {
        sessionStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(FORK_KEY);
    }

    function api(path, options) {
        options = options || {};
        var headers = { Accept: 'application/vnd.github+json' };
        var token = getToken();
        if (token) headers.Authorization = 'Bearer ' + token;
        if (options.body) headers['Content-Type'] = 'application/json';
        return fetch(API + path, { method: options.method || 'GET', headers: headers, body: options.body ? JSON.stringify(options.body) : undefined })
            .then(function(response) {
                if (response.status === 404 && options.allow404) return null;
                return response.json().catch(function() { return {}; }).then(function(data) {
                    if (!response.ok) throw new Error('GitHub: ' + (data.message || response.status));
                    return data;
                });
            });
    }

    function getUser() { return api('/user'); }

    function wait(ms) { return new Promise(function(resolve) { setTimeout(resolve, ms); }); }

    // Creates the fork if needed (GitHub returns the existing fork otherwise) and waits
    // until it can be read, since GitHub creates forks in the background. The upstream's
    // own account can't fork it, so it uses the upstream directly. upstream defaults to
    // DesktopFolders/content; any other repo, e.g. one holding a README, works too.
    function ensureFork(upstream) {
        upstream = upstream || UPSTREAM;
        return getUser().then(function(user) {
            if (user.login.toLowerCase() === upstream.split('/')[0].toLowerCase()) return { full_name: upstream };
            return api('/repos/' + upstream + '/forks', { method: 'POST', body: { default_branch_only: true } });
        })
            .then(function(fork) {
                var fullName = fork.full_name;
                var attempts = 0;
                function ready() {
                    return api('/repos/' + fullName + '/contents/', { allow404: true }).then(function(contents) {
                        if (contents) return fullName;
                        if (++attempts >= 20) throw new Error('Your fork ' + fullName + ' is still being created. Try again in a minute.');
                        return wait(1500).then(ready);
                    });
                }
                return ready();
            })
            .then(function(fullName) {
                if (upstream === UPSTREAM) localStorage.setItem(FORK_KEY, fullName);
                return fullName;
            });
    }

    function getFork() { return localStorage.getItem(FORK_KEY); }

    function toBase64(buffer) {
        var bytes = new Uint8Array(buffer), binary = '';
        for (var i = 0; i < bytes.length; i += 0x8000) {
            binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
        }
        return btoa(binary);
    }

    // Copies a file from a URL (e.g. raw.githubusercontent.com) into the fork at path.
    function saveFromUrl(fork, path, sourceUrl, message) {
        return fetch(sourceUrl)
            .then(function(response) {
                if (!response.ok) throw new Error('Could not download ' + sourceUrl);
                return response.arrayBuffer();
            })
            .then(function(buffer) {
                return api('/repos/' + fork + '/contents/' + path, { allow404: true }).then(function(existing) {
                    var body = { message: message || 'Add ' + path, content: toBase64(buffer) };
                    if (existing && existing.sha) body.sha = existing.sha;
                    return api('/repos/' + fork + '/contents/' + path, { method: 'PUT', body: body });
                });
            })
            .then(function(result) { return result.content; });
    }

    // Lets Sveltia CMS start signed in with this token, so it skips its own sign-in page.
    // Sveltia signs in automatically from a cached { backendName, token } user (the
    // Netlify/Decap CMS format). An existing cached user is left alone.
    function useTokenInCms(token) {
        var key = 'sveltia-cms.user', cached = null;
        try { cached = JSON.parse(localStorage.getItem(key)); } catch (e) {}
        if (cached && cached.token) return;
        localStorage.setItem(key, JSON.stringify({ backendName: 'github', token: token }));
    }

    // Signs in if needed (call from a click so the popup isn't blocked), makes sure the
    // visitor's fork of upstream (default DesktopFolders/content) exists, and hands the token to
    // Sveltia CMS. Resolves with the fork, e.g. "octocat/content", for the CMS backend repo.
    function connect(scope, upstream) {
        var token = getToken();
        var signedIn = token ? Promise.resolve(token) : signIn(scope || 'repo');
        return signedIn.then(function(token) {
            useTokenInCms(token);
            return ensureFork(upstream);
        });
    }

    // Creates branch name in repo from base (e.g. "main") unless it already exists, so an owner,
    // who can't fork their own repo, can edit away from the base branch. Resolves with the name.
    function ensureBranch(repo, base, name) {
        return api('/repos/' + repo + '/git/ref/heads/' + name, { allow404: true }).then(function(existing) {
            if (existing) return name;
            return api('/repos/' + repo + '/git/ref/heads/' + base).then(function(baseRef) {
                return api('/repos/' + repo + '/git/refs', { method: 'POST', body: { ref: 'refs/heads/' + name, sha: baseRef.object.sha } });
            }).then(function() { return name; });
        });
    }

    window.ContentRepo = {
        ensureBranch: ensureBranch,
        upstream: UPSTREAM,
        signIn: signIn,
        signOut: signOut,
        connect: connect,
        useTokenInCms: useTokenInCms,
        getToken: getToken,
        getUser: getUser,
        ensureFork: ensureFork,
        getFork: getFork,
        saveFromUrl: saveFromUrl
    };
})();
