// Lets site visitors keep content in their own GitHub copy of DesktopFolders/content, created
// private from that template repository (they can make it public later). Signs in with the same popup handshake Sveltia CMS uses, through the auth_base_url
// relay in the cms: block of support/site/config.yaml (CloudRoot Worker's /api/cms/auth),
// or Netlify's default service when that isn't set. Used by localsite/edit/.

(function() {
    var UPSTREAM = 'DesktopFolders/content';
    var TOKEN_KEY = 'contentRepoToken';   // localStorage: shared by every page until sign-out
    var FORK_KEY = 'contentRepoFork';     // localStorage: the visitor's copy, e.g. "octocat/content"
    var SCOPE_KEY = 'contentRepoScope';   // localStorage: the token's scopes, e.g. "repo", when GitHub reports them
    var COPY_NAMES = ['content', 'content-2', 'content-3']; // used in turn when the visitor has an unrelated repo by that name
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
        scope = scope || 'repo';
        var url = authUrl(scope);
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
                    localStorage.setItem(TOKEN_KEY, result.token);
                    localStorage.setItem(SCOPE_KEY, scope);
                    resolve(result.token);
                } else {
                    // code is e.g. MISCONFIGURED_CLIENT when the relay has no OAuth app yet.
                    var error = new Error(result.error || 'Sign-in failed.');
                    error.code = result.errorCode;
                    reject(error);
                }
            }
            window.addEventListener('message', onMessage);
        });
    }

    function getToken() { return localStorage.getItem(TOKEN_KEY); }

    var CMS_USER_KEY = 'sveltia-cms.user';

    // Also signs Sveltia CMS out when it holds the same token.
    function signOut() {
        var token = getToken(), cached = null;
        try { cached = JSON.parse(localStorage.getItem(CMS_USER_KEY)); } catch (e) {}
        if (token && cached && cached.token === token) localStorage.removeItem(CMS_USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(FORK_KEY);
        localStorage.removeItem(SCOPE_KEY);
    }

    // Whether the token covers scope. "repo" (private repos too) includes "public_repo". Unknown
    // scopes, e.g. a fine-grained token's, count as covered, and GitHub's reply says otherwise.
    function hasScope(scope) {
        var scopes = localStorage.getItem(SCOPE_KEY);
        if (scopes === null) return true;
        var list = scopes.split(/\s*,\s*/);
        return list.indexOf(scope) >= 0 || (scope === 'public_repo' && list.indexOf('repo') >= 0);
    }

    // Signs in with a token from elsewhere, e.g. one pasted on the keys page, in place of the
    // popup. A different token may be another account, so the previous sign-in is cleared first.
    function setToken(token) {
        if (!token || token === getToken()) return;
        signOut();
        localStorage.setItem(TOKEN_KEY, token);
    }

    function api(path, options) {
        options = options || {};
        var headers = { Accept: 'application/vnd.github+json' };
        var token = getToken();
        if (token) headers.Authorization = 'Bearer ' + token;
        if (options.body) headers['Content-Type'] = 'application/json';
        return fetch(API + path, { method: options.method || 'GET', headers: headers, body: options.body ? JSON.stringify(options.body) : undefined })
            .then(function(response) {
                // GitHub lists an OAuth or classic token's scopes, so connect() knows when to sign in again.
                var scopes = response.headers.get('X-OAuth-Scopes');
                if (token && scopes !== null && token === getToken()) localStorage.setItem(SCOPE_KEY, scopes);
                if (response.status === 404 && options.allow404) return null;
                return response.json().catch(function() { return {}; }).then(function(data) {
                    if (!response.ok) throw new Error('GitHub: ' + (data.message || response.status));
                    return data;
                });
            });
    }

    function getUser() { return api('/user'); }

    function wait(ms) { return new Promise(function(resolve) { setTimeout(resolve, ms); }); }

    // Resolves with fullName once it can be read, since GitHub creates forks and template
    // copies in the background.
    function whenReadable(fullName, what) {
        var attempts = 0;
        function ready() {
            return api('/repos/' + fullName + '/contents/', { allow404: true }).then(function(contents) {
                if (contents) return fullName;
                if (++attempts >= 20) throw new Error('Your ' + what + ' ' + fullName + ' is still being created. Try again in a minute.');
                return wait(1500).then(ready);
            });
        }
        return ready();
    }

    // Creates the fork if needed (GitHub returns the existing fork otherwise) and waits
    // until it can be read. The upstream's own account can't fork it, so it uses the
    // upstream directly. For a repo such as one holding a README; DesktopFolders/content
    // uses ensureCopy() instead.
    function ensureFork(upstream) {
        return getUser().then(function(user) {
            if (user.login.toLowerCase() === upstream.split('/')[0].toLowerCase()) return { full_name: upstream };
            return api('/repos/' + upstream + '/forks', { method: 'POST', body: { default_branch_only: true } });
        }).then(function(fork) { return whenReadable(fork.full_name, 'fork'); });
    }

    // Whether repo came from DesktopFolders/content: a copy of the template, or an earlier fork.
    function isFromUpstream(repo) {
        var source = repo.template_repository || repo.parent;
        return !!source && source.full_name.toLowerCase() === UPSTREAM.toLowerCase();
    }

    // The visitor's own copy of DesktopFolders/content, e.g. "octocat/content". A new one is
    // created private from the template (DesktopFolders/content is a template repository), with
    // no fork link, so it can stay private. A copy or fork made earlier is used as is, and the
    // upstream's own account uses the upstream.
    function ensureCopy() {
        return getUser().then(function(user) {
            return findCopy(user, true);
        }).then(function(fullName) {
            return whenReadable(fullName, 'copy');
        }).then(function(fullName) {
            localStorage.setItem(FORK_KEY, fullName);
            return fullName;
        });
    }

    // The signed-in visitor's existing copy (or earlier fork) of DesktopFolders/content, or null
    // when they're signed out or don't have one yet. Doesn't create one. Remembers what it finds.
    function getCopy() {
        if (!getToken()) return Promise.resolve(null);
        return getUser().then(function(user) {
            return findCopy(user, false);
        }).then(function(fullName) {
            if (fullName) localStorage.setItem(FORK_KEY, fullName);
            return fullName;
        });
    }

    // The saved copy, else the first of COPY_NAMES that came from DesktopFolders/content.
    // With create, a missing copy is made from the template; otherwise it resolves with null.
    function findCopy(user, create) {
        if (user.login.toLowerCase() === UPSTREAM.split('/')[0].toLowerCase()) return Promise.resolve(UPSTREAM);
        var saved = getFork();
        var known = saved && saved.split('/')[0].toLowerCase() === user.login.toLowerCase()
            ? api('/repos/' + saved, { allow404: true }) : Promise.resolve(null);
        return known.then(function(repo) {
            return repo ? repo.full_name : findCopyByName(user.login, 0, create);
        });
    }

    function findCopyByName(login, index, create) {
        if (index >= COPY_NAMES.length) {
            if (!create) return Promise.resolve(null);
            return Promise.reject(new Error('Your GitHub account already has repos named ' + COPY_NAMES.join(', ') + ', so a copy of ' + UPSTREAM + ' needs another name.'));
        }
        var name = COPY_NAMES[index];
        return api('/repos/' + login + '/' + name, { allow404: true }).then(function(repo) {
            if (repo && isFromUpstream(repo)) return repo.full_name;
            if (repo) return findCopyByName(login, index + 1, create);
            if (!create) return findCopyByName(login, index + 1, create);
            return api('/repos/' + UPSTREAM + '/generate', { method: 'POST', body: {
                owner: login, name: name, private: true, description: 'My content, copied from ' + UPSTREAM
            } }).then(function(created) { return created.full_name; });
        });
    }

    function getRepo(fullName) { return api('/repos/' + fullName); }

    // branch when repo has it; for a missing "main", "master" (or the reverse); else the repo's
    // default branch. Pages assume "main", which older repos call "master".
    function resolveBranch(fullName, branch) {
        var other = branch === 'main' ? 'master' : (branch === 'master' ? 'main' : null);
        var has = function(name) {
            return api('/repos/' + fullName + '/branches/' + encodeURIComponent(name), { allow404: true });
        };
        return has(branch).then(function(found) {
            if (found) return branch;
            return (other ? has(other) : Promise.resolve(null)).then(function(alt) {
                if (alt) return other;
                return getRepo(fullName).then(function(info) { return info.default_branch; });
            });
        });
    }

    // Makes repo private or public. GitHub keeps a fork of a public repo public.
    function setPrivate(fullName, isPrivate) {
        return api('/repos/' + fullName, { method: 'PATCH', body: { private: isPrivate } });
    }

    // The files in a folder of repo ([] when it doesn't exist), each with path and name.
    function listFiles(fullName, folder) {
        return api('/repos/' + fullName + '/contents/' + folder, { allow404: true }).then(function(files) {
            return Array.isArray(files) ? files.filter(function(f) { return f.type === 'file'; }) : [];
        });
    }

    // A file's contents through the API with the visitor's token, so files in a private repo
    // load too (raw.githubusercontent.com only serves public ones). Resolves with a Blob.
    function readFile(fullName, path) {
        var headers = { Accept: 'application/vnd.github.raw' };
        var token = getToken();
        if (token) headers.Authorization = 'Bearer ' + token;
        return fetch(API + '/repos/' + fullName + '/contents/' + path, { headers: headers }).then(function(response) {
            if (!response.ok) throw new Error('GitHub: ' + response.status + ' for ' + path);
            return response.blob();
        });
    }

    // A URL for an image from repo, private or public, for <img src>. Revoke it with
    // URL.revokeObjectURL when the image is removed.
    function fileUrl(fullName, path) {
        return readFile(fullName, path).then(function(blob) { return URL.createObjectURL(blob); });
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
    // Netlify/Decap CMS format). A different cached token is replaced, since it may have
    // expired (GitHub OAuth apps can expire tokens after 8 hours).
    function useTokenInCms(token) {
        var cached = null;
        try { cached = JSON.parse(localStorage.getItem(CMS_USER_KEY)); } catch (e) {}
        if (cached && cached.token === token) return;
        localStorage.setItem(CMS_USER_KEY, JSON.stringify({ backendName: 'github', token: token }));
    }

    // Signs in if needed (call from a click so the popup isn't blocked), makes sure the
    // visitor's copy of DesktopFolders/content (or fork of another upstream) exists, and hands
    // the token to Sveltia CMS. Resolves with the repo, e.g. "octocat/content", for the CMS backend.
    function connect(scope, upstream) {
        scope = scope || 'repo';
        var token = getToken();
        // A token from an earlier public_repo sign-in can't reach private repos, so sign in again.
        if (token && !hasScope(scope)) {
            signOut();
            token = null;
        }
        var signedIn = token ? Promise.resolve(token) : signIn(scope);
        return signedIn.then(function(token) {
            useTokenInCms(token);
            return (upstream && upstream.toLowerCase() !== UPSTREAM.toLowerCase()) ? ensureFork(upstream) : ensureCopy();
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
        setToken: setToken,
        connect: connect,
        useTokenInCms: useTokenInCms,
        getToken: getToken,
        getUser: getUser,
        ensureFork: ensureFork,
        ensureCopy: ensureCopy,
        getCopy: getCopy,
        getFork: getFork,
        getRepo: getRepo,
        resolveBranch: resolveBranch,
        setPrivate: setPrivate,
        listFiles: listFiles,
        readFile: readFile,
        fileUrl: fileUrl,
        hasScope: hasScope,
        saveFromUrl: saveFromUrl
    };
})();
