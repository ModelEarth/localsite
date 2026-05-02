(function() {
  const EVENT_DEFAULT_TARGET_IDS = [
    'mission-title-text',
    'mission-name',
    'event',
    'btn-overview',
    'btn-follow',
    'btn-speed',
    'btn-solar-system',
    'telemetry',
    'event-video-wrap',
    'event-video-frame'
  ];

  const state = {
    config: null,
    options: {},
    menuOpen: false
  };

  function parseYamlScalar(yamlText, key) {
    const match = `${yamlText || ''}`.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
    if (!match) return '';
    return match[1].trim().replace(/^['"]|['"]$/g, '');
  }

  function parseYamlBoolean(yamlText, key, fallback) {
    const value = parseYamlScalar(yamlText, key);
    if (!value) return fallback;
    return !/^(false|0|no|off)$/i.test(value);
  }

  function parseYamlNestedScalar(yamlText, parentKey, childKey) {
    const blockMatch = `${yamlText || ''}`.match(new RegExp(`^${parentKey}:\\s*\\n([\\s\\S]*?)(?=^\\S|$)`, 'm'));
    if (!blockMatch) return '';
    const childMatch = blockMatch[1].match(new RegExp(`^\\s+${childKey}:\\s*(.+)$`, 'm'));
    if (!childMatch) return '';
    return childMatch[1].trim().replace(/^['"]|['"]$/g, '');
  }

  function getHashParams() {
    if (typeof getHash === 'function') {
      return { ...(getHash() || {}) };
    }
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    return Object.fromEntries(params.entries());
  }

  function setHashParam(name, value) {
    const next = getHashParams();
    if (value === null || value === undefined || value === '') delete next[name];
    else next[name] = value;
    setHashParams(next);
  }

  function setHashParams(next) {
    if (typeof goHash === 'function') {
      goHash(next);
      return;
    }
    const params = new URLSearchParams(next);
    const nextHash = params.toString();
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}${nextHash ? `#${nextHash}` : ''}`);
  }

  function buildAdminHref(baseHref, eventId, hashKey) {
    const href = `${baseHref || ''}`.trim();
    if (!href) return '';
    const nextEventId = `${eventId || ''}`.trim();
    if (!nextEventId) return href;
    const nextHashKey = `${hashKey || 'node'}`.trim() || 'node';
    const parts = href.split('#');
    const pathPart = parts[0] || '';
    const existingHash = parts[1] || '';
    const params = new URLSearchParams(existingHash);
    params.set(nextHashKey, nextEventId);
    const hashText = params.toString();
    return `${pathPart}${hashText ? `#${hashText}` : ''}`;
  }

  function shouldShowAdminLink(baseHref) {
    if (!`${baseHref || ''}`.trim()) return false;
    return !window.location.pathname.includes('/admin');
  }

  function escapeHtml(value) {
    return `${value || ''}`
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function toDisplayText(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    try {
      return JSON.stringify(value);
    } catch (err) {
      return String(value);
    }
  }

  function escapeSelectorValue(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') {
      return window.CSS.escape(value);
    }
    return `${value || ''}`.replace(/["\\]/g, '\\$&');
  }

  function isNarrowBootstrapUi() {
    return Math.max(window.innerWidth || 0, document.documentElement ? document.documentElement.clientWidth || 0 : 0) <= 700;
  }

  function getBootstrapOverviewLabel(label) {
    const nextLabel = `${label || 'Overview'}`.trim();
    return isNarrowBootstrapUi() ? nextLabel.replace(/\s+Overview$/i, '') || nextLabel : nextLabel;
  }

  function getCurrentEventId() {
    const select = document.getElementById('event');
    const selectedId = select ? select.value : '';
    if (selectedId) return selectedId;
    return window.__initialEventId || window.__pageDefaultEventId || '';
  }

  function getHudRoot() {
    return document.getElementById('hud');
  }

  function getMissionMenu() {
    return document.getElementById('mission-menu');
  }

  function hasInitialMetaTargets(targetIds) {
    return (targetIds || []).every((id) => document.getElementById(id));
  }

  function scheduleInitialMetaRetry(targetIds) {
    if (window.__initialEventMetaRetryScheduled || hasInitialMetaTargets(targetIds)) return;
    if ((window.__initialEventMetaRetryCount || 0) > 120) return;
    window.__initialEventMetaRetryScheduled = true;
    requestAnimationFrame(function() {
      window.__initialEventMetaRetryScheduled = false;
      window.__initialEventMetaRetryCount = (window.__initialEventMetaRetryCount || 0) + 1;
      if (typeof window.__applyInitialEventMetaToDom === 'function') {
        window.__applyInitialEventMetaToDom();
      }
      if (!hasInitialMetaTargets(targetIds)) {
        scheduleInitialMetaRetry(targetIds);
      }
    });
  }

  function updateHudVisibility() {
    const phaseEl = document.getElementById('phase-text');
    const metEl = document.getElementById('met-counter');
    const missionStatusEl = phaseEl ? phaseEl.closest('.mission-status') : null;
    if (missionStatusEl) {
      missionStatusEl.hidden = !phaseEl || !phaseEl.textContent.trim();
    }
    if (metEl) {
      metEl.hidden = !metEl.textContent.trim();
    }
  }

  function applyInitialMetaToDom() {
    const meta = window.__latestInitialEventMeta;
    if (!meta) return;
    const titleEl = document.getElementById('mission-title-text');
    const nameEl = document.getElementById('mission-name');
    const phaseEl = document.getElementById('phase-text');
    const metEl = document.getElementById('met-counter');
    const eventSelect = document.getElementById('event');
    const overviewButton = document.getElementById('btn-overview');
    const followButton = document.getElementById('btn-follow');
    const simButton = document.getElementById('btn-speed');
    const solarSystemButton = document.getElementById('btn-solar-system');
    const telemetry = document.getElementById('telemetry');
    const eventVideoWrap = document.getElementById('event-video-wrap');
    const eventVideoFrame = document.getElementById('event-video-frame');
    const sourceLink = document.getElementById('hud-source-link');
    const detailsRoot = document.getElementById('hud-details');
    const detailsSource = document.getElementById('hud-detail-source');
    const detailsDate = document.getElementById('hud-detail-date');
    const detailsCost = document.getElementById('hud-detail-cost');
    const detailsSummary = document.getElementById('hud-detail-summary');
    const adminLink = document.getElementById('hud-admin-link');

    if (titleEl) titleEl.textContent = meta.titleText || '';
    if (nameEl) {
      const missionName = meta.missionName || '';
      nameEl.textContent = missionName;
      nameEl.classList.toggle('mission-name-long', missionName.length > 25);
      nameEl.classList.toggle('mission-name-xlong', missionName.length > 50);
    }
    if (phaseEl && !phaseEl.textContent.trim()) phaseEl.textContent = meta.phaseText || '';
    if (metEl && !metEl.textContent.trim()) metEl.textContent = meta.metText || '';
    if (sourceLink) {
      const hasSourceUrl = Boolean((meta.sourceUrl || '').trim());
      sourceLink.hidden = !hasSourceUrl;
      sourceLink.href = hasSourceUrl ? meta.sourceUrl : '#';
    }
    if (detailsRoot) {
      const detailSourceText = toDisplayText(meta.detailSource);
      const detailDateText = toDisplayText(meta.detailPublishedDate);
      const detailCostText = toDisplayText(meta.detailCost);
      const detailSummaryText = toDisplayText(meta.detailSummary);
      const detailParts = [detailSourceText, detailDateText, detailCostText, detailSummaryText]
        .filter(function(value) { return Boolean(value.trim()); });
      detailsRoot.hidden = detailParts.length === 0;
      if (detailsSource) detailsSource.textContent = detailSourceText;
      if (detailsDate) detailsDate.textContent = detailDateText;
      if (detailsCost) detailsCost.textContent = detailCostText;
      if (detailsSummary) detailsSummary.textContent = detailSummaryText;
    }
    if (adminLink) {
      const adminHref = state.options.adminLinkHref || '';
      const hash = getHashParams();
      const adminEventId = hash.event || hash.node || meta.eventId || getCurrentEventId() || '';
      const adminHashKey = state.options.adminLinkHashKey || 'node';
      adminLink.hidden = !shouldShowAdminLink(adminHref);
      adminLink.href = adminHref ? buildAdminHref(adminHref, adminEventId, adminHashKey) : '#';
    }
    updateHudVisibility();
    if (overviewButton) overviewButton.textContent = getBootstrapOverviewLabel(meta.overviewLabel || 'Overview');
    if (followButton) followButton.textContent = meta.followLabel || 'Follow';
    if (simButton) simButton.textContent = 'Model Speed 1x';
    if (solarSystemButton) solarSystemButton.style.display = meta.showSolarSystem === false ? 'none' : '';
    if (eventSelect) {
      if (eventSelect.options.length <= 1 && window.__eventsConfig && Array.isArray(window.__eventsConfig.events)) {
        eventSelect.innerHTML = window.__eventsConfig.events.map(function(eventEntry) {
          return `<option value="${escapeHtml(eventEntry.id)}" data-follow-hash="">${escapeHtml(eventEntry.label)}</option>`;
        }).join('');
      }
      eventSelect.value = meta.eventId;
    }
    if (telemetry && eventVideoWrap && eventVideoFrame) {
      const youtubeId = (meta.videoYoutubeId || '').trim();
      const hasVideo = Boolean(youtubeId);
      telemetry.classList.toggle('has-video', hasVideo);
      if (hasVideo) {
        const nextSrc = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&playsinline=1&rel=0`;
        if (eventVideoFrame.dataset.youtubeId !== youtubeId) {
          eventVideoFrame.src = nextSrc;
          eventVideoFrame.dataset.youtubeId = youtubeId;
        }
      } else {
        eventVideoFrame.src = 'about:blank';
        eventVideoFrame.dataset.youtubeId = '';
      }
    }
    refreshMissionMenu();
  }

  function applyInitialEventMeta(meta) {
    if (!meta) return;
    window.__latestInitialEventMeta = meta;
    applyInitialMetaToDom();
    scheduleInitialMetaRetry(state.options.initialMetaTargetIds || EVENT_DEFAULT_TARGET_IDS);
  }

  function loadInitialEventMeta(yamlText, options) {
    const eventId = window.__initialEventId;
    const label = parseYamlScalar(yamlText, 'label') || eventId;
    const missionName = parseYamlScalar(yamlText, 'mission_name');
    const browserTitle = parseYamlScalar(yamlText, 'browser_title');
    const kind = parseYamlScalar(yamlText, 'kind');
    const overviewLabel = parseYamlScalar(yamlText, 'overview_label') || 'Overview';
    const followLabel = parseYamlScalar(yamlText, 'follow_label') || 'Follow';
    const showSolarSystem = parseYamlBoolean(yamlText, 'show_solar_system', true);
    const videoYoutubeId = parseYamlScalar(yamlText, 'video_youtube_id') || parseYamlScalar(yamlText, 'youtube_id');
    const sourcePublisher = parseYamlNestedScalar(yamlText, 'source_confirmed', 'publisher');
    const sourcePublishedDate = parseYamlNestedScalar(yamlText, 'source_confirmed', 'published_date');
    const sourceUrl = parseYamlScalar(yamlText, 'source_url');
    const costRange = parseYamlScalar(yamlText, 'cost_range_usd');
    const conceptNote = parseYamlScalar(yamlText, 'concept_note');
    const sourceNote = parseYamlScalar(yamlText, 'source_note');
    const summaryText = conceptNote || sourceNote || browserTitle || '';
    const titleText = kind === 'orion' ? 'NASA · CSA' : '';
    if (browserTitle && options.applyBrowserTitle !== false) {
      document.title = browserTitle;
    }
    const meta = {
      eventId,
      label,
      missionName,
      browserTitle,
      kind,
      overviewLabel,
      followLabel,
      showSolarSystem,
      videoYoutubeId,
      sourceUrl: sourceUrl || '',
      titleText,
      detailSource: sourcePublisher || '',
      detailPublishedDate: sourcePublishedDate || '',
      detailCost: costRange || '',
      detailSummary: summaryText || '',
      phaseText: options.initialPhaseText || '',
      metText: options.initialMetText || ''
    };
    applyInitialEventMeta(meta);
    return meta;
  }

  function buildHudMarkup(mode) {
    const detailsMarkup = state.options.showDetails
      ? `
          <div class="mission-details" id="hud-details" hidden>
            <div class="mission-details-meta">
              <span class="mission-detail-chip" id="hud-detail-source"></span>
              <span class="mission-detail-chip" id="hud-detail-date"></span>
            </div>
            <div class="mission-detail-cost" id="hud-detail-cost"></div>
            <div class="mission-detail-summary" id="hud-detail-summary"></div>
          </div>
        `
      : '';
    return `
      <div id="hud" class="event-hud event-hud-${mode}">
        <div id="hud-left" role="button" tabindex="0" aria-label="Choose mission">
          <div class="mission-title-row">
            <div class="mission-title" id="mission-title-text"></div>
            <a id="hud-source-link" class="mission-source-link" href="#" target="_blank" rel="noopener noreferrer" aria-label="Open source article" title="Open source article" hidden>
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3Zm5 16V11h2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9v2H4v15h15Z"></path>
              </svg>
            </a>
          </div>
          <div class="mission-name-row">
            <div class="mission-name" id="mission-name"></div>
            <div class="mission-dropdown-arrow" aria-hidden="true">
              <svg viewBox="0 0 16 16" focusable="false" aria-hidden="true">
                <path d="M4.5 6.25a1 1 0 0 1 1.42.04L8 8.54l2.08-2.25a1 1 0 0 1 1.46 1.36l-2.8 3.02a1 1 0 0 1-1.46 0l-2.8-3.02a1 1 0 0 1 .02-1.42Z"></path>
              </svg>
            </div>
          </div>
          <div class="mission-status">
            <div class="status-dot"></div>
            <span id="phase-text"></span>
          </div>
          <div class="met-counter" id="met-counter"></div>
          ${detailsMarkup}
          <a id="hud-admin-link" class="mission-admin-link" href="#" hidden>
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <path d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11Zm14.71-9.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.96 1.96 3.75 3.75 2.13-1.79Z"></path>
            </svg>
            <span>Admin</span>
          </a>
        </div>
      </div>
      <div id="mission-menu" class="event-hud-${mode}" aria-hidden="true">
        <div class="mission-menu-backdrop"></div>
        <div class="mission-menu-panel" role="dialog" aria-label="Choose mission">
          <div class="mission-menu-header">
            <div class="mission-menu-header-title">Missions</div>
            <button class="mission-menu-close" type="button">Close</button>
          </div>
          <div class="mission-menu-list" id="mission-menu-list"></div>
        </div>
      </div>
      <select class="hint-select" id="event" aria-hidden="true" tabindex="-1"></select>
    `;
  }

  function setMissionMenuOpen(open) {
    state.menuOpen = Boolean(open);
    const hudLeft = document.getElementById('hud-left');
    const missionMenu = getMissionMenu();
    const eventSelect = document.getElementById('event');
    if (hudLeft) hudLeft.classList.toggle('is-open', state.menuOpen);
    if (missionMenu) missionMenu.classList.toggle('open', state.menuOpen);
    if (eventSelect) eventSelect.style.display = 'none';
    if (hudLeft) hudLeft.setAttribute('aria-hidden', state.menuOpen ? 'true' : 'false');
    if (missionMenu) missionMenu.setAttribute('aria-hidden', state.menuOpen ? 'false' : 'true');
  }

  function toggleMissionMenu(forceOpen) {
    const nextOpen = forceOpen === null || forceOpen === undefined ? !state.menuOpen : Boolean(forceOpen);
    setMissionMenuOpen(nextOpen);
  }

  function setEventOptionMeta(eventId, meta) {
    const select = document.getElementById('event');
    const option = select ? select.querySelector(`option[value="${escapeSelectorValue(eventId)}"]`) : null;
    if (!option || !meta) return;
    if (Object.prototype.hasOwnProperty.call(meta, 'followHash')) {
      option.dataset.followHash = meta.followHash || '';
    }
  }

  function getEventMenuItemLabel(eventId) {
    const configEvent = state.config && Array.isArray(state.config.events)
      ? state.config.events.find((eventEntry) => eventEntry.id === eventId)
      : null;
    return configEvent ? configEvent.label : eventId;
  }

  function refreshMissionMenu() {
    const list = document.getElementById('mission-menu-list');
    const select = document.getElementById('event');
    if (!list || !select || !state.config || !Array.isArray(state.config.events)) return;
    const currentEventId = getCurrentEventId();
    list.innerHTML = state.config.events.map(function(eventEntry) {
      const option = select.querySelector(`option[value="${escapeSelectorValue(eventEntry.id)}"]`);
      const followHash = option && option.dataset ? option.dataset.followHash || '' : '';
      const isActive = eventEntry.id === currentEventId ? ' active' : '';
      return `
        <button type="button" class="mission-menu-item${isActive}" data-event-id="${escapeHtml(eventEntry.id)}" data-follow-hash="${escapeHtml(followHash)}">
          <div class="mission-menu-item-label">${escapeHtml(eventEntry.id)}</div>
          <div class="mission-menu-item-name">${escapeHtml(getEventMenuItemLabel(eventEntry.id))}</div>
        </button>
      `;
    }).join('');
  }

  function hydrateEventMenu(selectedEventId) {
    const select = document.getElementById('event');
    if (!select || !state.config || !Array.isArray(state.config.events)) return;
    if (select.options.length <= 1) {
      select.innerHTML = state.config.events.map(function(eventEntry) {
        return `<option value="${escapeHtml(eventEntry.id)}" data-follow-hash="">${escapeHtml(eventEntry.label)}</option>`;
      }).join('');
    }
    if (selectedEventId) {
      select.value = selectedEventId;
    }
    refreshMissionMenu();
  }

  async function defaultOnMissionSelect(missionId) {
    const nextHash = getHashParams();
    nextHash.event = missionId;
    if (state.options.clearSectionHashUnlessSingle) {
      const keepSectionHash = typeof state.options.isSingleSectionView === 'function'
        ? !!state.options.isSingleSectionView()
        : false;
      if (!keepSectionHash) {
        delete nextHash.section;
      }
    }
    setHashParams(nextHash);
    const specText = await loadEventSpecTextById(missionId);
    loadInitialEventMeta(specText, state.options);
    hydrateEventMenu(missionId);
  }

  function bindHudEvents() {
    const hudLeft = document.getElementById('hud-left');
    const sourceLink = document.getElementById('hud-source-link');
    const missionMenu = getMissionMenu();
    const backdrop = missionMenu ? missionMenu.querySelector('.mission-menu-backdrop') : null;
    const closeButton = missionMenu ? missionMenu.querySelector('.mission-menu-close') : null;
    const eventSelect = document.getElementById('event');
    if (hudLeft && !hudLeft.dataset.eventHudBound) {
      hudLeft.addEventListener('click', function() {
        toggleMissionMenu();
      });
      hudLeft.addEventListener('keydown', function(domEvent) {
        if (domEvent.key === 'Enter' || domEvent.key === ' ') {
          domEvent.preventDefault();
          toggleMissionMenu();
        }
      });
      hudLeft.dataset.eventHudBound = 'true';
    }
    if (sourceLink && !sourceLink.dataset.eventHudBound) {
      sourceLink.addEventListener('click', function(domEvent) {
        domEvent.stopPropagation();
      });
      sourceLink.dataset.eventHudBound = 'true';
    }
    if (backdrop && !backdrop.dataset.eventHudBound) {
      backdrop.addEventListener('click', function() {
        setMissionMenuOpen(false);
      });
      backdrop.dataset.eventHudBound = 'true';
    }
    if (closeButton && !closeButton.dataset.eventHudBound) {
      closeButton.addEventListener('click', function() {
        setMissionMenuOpen(false);
      });
      closeButton.dataset.eventHudBound = 'true';
    }
    if (eventSelect && !eventSelect.dataset.eventHudBound) {
      eventSelect.addEventListener('change', function() {
        selectMissionFromMenu(eventSelect.value);
      });
      eventSelect.dataset.eventHudBound = 'true';
    }
    if (missionMenu && !missionMenu.dataset.eventHudBound) {
      missionMenu.addEventListener('click', function(domEvent) {
        const button = domEvent.target.closest('.mission-menu-item');
        if (!button) return;
        const missionId = button.getAttribute('data-event-id') || '';
        if (missionId) {
          selectMissionFromMenu(missionId);
        }
      });
      missionMenu.dataset.eventHudBound = 'true';
    }
    if (!document.body.dataset.eventHudEscBound) {
      document.addEventListener('keydown', function(domEvent) {
        if (domEvent.key === 'Escape' && state.menuOpen) {
          setMissionMenuOpen(false);
        }
      });
      document.body.dataset.eventHudEscBound = 'true';
    }
  }

  async function selectMissionFromMenu(missionId) {
    const select = document.getElementById('event');
    const option = select ? select.querySelector(`option[value="${escapeSelectorValue(missionId)}"]`) : null;
    if (select) select.value = missionId;
    if (typeof state.options.onMissionSelect === 'function') {
      await state.options.onMissionSelect(missionId, option);
    } else {
      await defaultOnMissionSelect(missionId);
    }
    refreshMissionMenu();
    setMissionMenuOpen(false);
  }

  function resolveSpecFileForEvent(config, eventId, defaultEventId) {
    if (!config || !Array.isArray(config.events)) return '';
    const eventEntry = config.events.find((entry) => entry.id === eventId) || config.events.find((entry) => entry.id === defaultEventId) || config.events[0];
    return eventEntry ? eventEntry.specFile : '';
  }

  function getEventsBasePath() {
    return state.options.eventsBasePath || './events';
  }

  function loadEventSpecTextById(eventId) {
    return (window.__eventsConfigPromise || Promise.resolve(state.config)).then(function(config) {
      const specFile = resolveSpecFileForEvent(config, eventId, window.__pageDefaultEventId || eventId);
      if (!specFile) {
        throw new Error(`Unable to resolve spec file for event: ${eventId}`);
      }
      return fetch(`${getEventsBasePath()}/${specFile}`, { cache: 'no-cache' }).then(function(response) {
        if (!response.ok) throw new Error(`Unable to load event spec: ${specFile}`);
        return response.text();
      });
    });
  }

  function bootstrap(options) {
    state.options = {
      applyBrowserTitle: true,
      initialMetaTargetIds: EVENT_DEFAULT_TARGET_IDS,
      ...options
    };
    const requestedEventId = options && Object.prototype.hasOwnProperty.call(options, 'requestedEventId')
      ? options.requestedEventId || ''
      : (getHashParams().event || '');
    state.options.openMenuByDefault = !requestedEventId;
    const defaultEventId = Object.prototype.hasOwnProperty.call(options || {}, 'defaultEventId')
      ? (options.defaultEventId || '')
      : 'orion2026';
    window.__pageDefaultEventId = defaultEventId;
    window.__initialEventId = requestedEventId || defaultEventId;
    window.__latestInitialEventMeta = null;
    window.__applyInitialEventMetaToDom = applyInitialMetaToDom;
    window.__applyInitialEventMeta = applyInitialEventMeta;
    window.__eventsConfigPromise = fetch(`${getEventsBasePath()}/events.json`, { cache: 'no-cache' })
      .then(function(response) {
        if (!response.ok) throw new Error(`Unable to load ${getEventsBasePath()}/events.json`);
        return response.json();
      })
      .then(function(config) {
        state.config = config;
        window.__eventsConfig = config;
        const allIds = new Set((config.events || []).map((eventEntry) => eventEntry.id));
        if (requestedEventId && !allIds.has(requestedEventId)) {
          const fallbackEvent = config.defaultEventId || (config.events[0] ? config.events[0].id : '');
          window.__initialEventId = fallbackEvent || defaultEventId;
        }
        return config;
      });
    window.__initialEventSpecTextPromise = (!requestedEventId || requestedEventId === defaultEventId)
      ? (defaultEventId
          ? fetch(`${getEventsBasePath()}/${defaultEventId}.yaml`, { cache: 'no-cache' }).then(function(response) {
              if (!response.ok) throw new Error(`Unable to load event spec: ${defaultEventId}.yaml`);
              return response.text();
            })
          : Promise.resolve(''))
      : window.__eventsConfigPromise.then(function(config) {
          const specFile = resolveSpecFileForEvent(config, window.__initialEventId, defaultEventId);
          return fetch(`${getEventsBasePath()}/${specFile}`, { cache: 'no-cache' }).then(function(response) {
            if (!response.ok) throw new Error(`Unable to load event spec: ${specFile}`);
            return response.text();
          });
        });
    window.__initialEventMetaPromise = window.__initialEventSpecTextPromise
      .then(function(yamlText) {
        return loadInitialEventMeta(yamlText, state.options);
      })
      .catch(function(error) {
        console.error(error);
        return null;
      });
    return window.__eventsConfigPromise;
  }

  function mountHud(options) {
    const mountOptions = {
      mode: 'overlay',
      insertPosition: 'beforeend',
      ...options
    };
    state.options = {
      ...state.options,
      ...mountOptions
    };
    const mountTarget = document.querySelector(mountOptions.targetSelector);
    if (!mountTarget) {
      console.warn(`SharedEventUI mount target not found: ${mountOptions.targetSelector}`);
      return;
    }
    const existingHud = getHudRoot();
    const existingMenu = getMissionMenu();
    const existingSelect = document.getElementById('event');
    if (existingHud) existingHud.remove();
    if (existingMenu) existingMenu.remove();
    if (existingSelect) existingSelect.remove();
    mountTarget.insertAdjacentHTML(mountOptions.insertPosition, buildHudMarkup(mountOptions.mode));
    const hud = getHudRoot();
    if (hud) {
      hud.dataset.eventHudMode = mountOptions.mode;
    }
    bindHudEvents();
    setMissionMenuOpen(Boolean(state.options.openMenuByDefault));
    window.__eventsConfigPromise.then(function(config) {
      state.config = config;
      hydrateEventMenu(window.__initialEventId || window.__pageDefaultEventId || '');
      if (window.__latestInitialEventMeta) {
        applyInitialMetaToDom();
      }
    }).catch(function(error) {
      console.error(error);
    });
    if (window.__initialEventMetaPromise) {
      window.__initialEventMetaPromise.then(function(meta) {
        if (meta) applyInitialEventMeta(meta);
      });
    }
  }

  window.SharedEventUI = {
    bootstrap,
    mountHud,
    hydrateEventMenu,
    refreshMissionMenu,
    setMissionMenuOpen,
    toggleMissionMenu,
    selectMissionFromMenu,
    setEventOptionMeta,
    loadEventSpecTextById,
    setHashParam,
    setHashParams,
    getHashParams,
    applyInitialEventMeta,
    updateHudVisibility
  };
})();
