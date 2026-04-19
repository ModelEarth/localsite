(function () {
  const pageConfig = window.localsiteSlidesConfig || {};
  const defaultConfig = {
    mountSelector: '#slidesMount',
    templatePath: '/localsite/start/slides/slide-template.html',
    stylesheetPath: '/localsite/start/slides/css/slides.css',
    sliderId: 'sample1',
    autoplayDelay: 4000,
    transitionEffect: 'fade',
    transitionSpeed: 800,
    playerSelector: '#player1',
    playerProvider: 'youtube',
    playerEmbedId: 'oV2_YtrqgyQ',
    plyrOptions: {
      autopause: true,
      hideControls: true
    }
  };

  const config = {
    ...defaultConfig,
    ...pageConfig,
    plyrOptions: {
      ...defaultConfig.plyrOptions,
      ...(pageConfig.plyrOptions || {})
    }
  };

  function whenGlobal(name, callback, tries) {
    if (window[name]) {
      callback();
      return;
    }
    if ((tries || 0) > 200) {
      console.warn('slides.js could not find global:', name);
      return;
    }
    setTimeout(function () {
      whenGlobal(name, callback, (tries || 0) + 1);
    }, 25);
  }

  function loadAssets(callback) {
    includeCSS3('/localsite/css/swiper/swiper-bundle.min.css');
    includeCSS3('/localsite/css/swiper/plyr.css');
    includeCSS3('/localsite/css/swiper/swiper.css');
    includeCSS3(config.stylesheetPath);

    loadScript('/localsite/js/polyfill.min.js?features=es6,Array.prototype.includes,CustomEvent,Object.entries,Object.values,URL', function () {
      loadScript('/localsite/js/plyr.min.js', function () {
        whenGlobal('Plyr', function () {
          loadScript('/localsite/js/swiper/swiper-bundle.min.js', function () {
            whenGlobal('Swiper', callback);
          });
        });
      });
    });
  }

  function toggleButtons(scope, sliderIdentifier, showPlay, showPause) {
    scope.querySelectorAll('.swiper-button-play-' + sliderIdentifier).forEach(function (elem) {
      elem.style.display = showPlay ? '' : 'none';
    });
    scope.querySelectorAll('.swiper-button-pause-' + sliderIdentifier).forEach(function (elem) {
      elem.style.display = showPause ? '' : 'none';
    });
  }

  function buildSwiperSlider(scope, sliderElm) {
    const sliderIdentifier = sliderElm.id;
    const autoplayStyleId = 'customCSS-' + sliderIdentifier;
    let autoplayStopTimer = null;
    let autoplayTimer = null;
    let autoplayRunning = false;
    const nextEl = scope.querySelector('.swiper-button-next-' + sliderIdentifier);
    const prevEl = scope.querySelector('.swiper-button-prev-' + sliderIdentifier);
    const paginationEl = scope.querySelector('.swiper-pagination-' + sliderIdentifier);

    const homeSwiper = new Swiper('#' + sliderIdentifier, {
      slidesPerView: 1,
      spaceBetween: 0,
      speed: config.transitionSpeed,
      rewind: true,
      lazy: {
        loadPrevNext: true
      },
      pagination: {
        el: paginationEl,
        clickable: true
      },
      effect: config.transitionEffect,
      fadeEffect: { crossFade: true },
      simulateTouch: false,
      mousewheelX: true,
      releaseOnEdgesX: true,
      keyboard: {
        enabled: true,
        onlyInViewport: false
      },
      direction: 'horizontal',
      observer: true,
      observeParents: true
    });

    homeSwiper.update();

    function setAutoplayIndicator(isActive) {
      let style = document.getElementById(autoplayStyleId);
      clearTimeout(autoplayStopTimer);
      autoplayStopTimer = null;
      if (isActive) {
        if (!style) {
          style = document.createElement('style');
          style.id = autoplayStyleId;
          document.head.appendChild(style);
        }
        style.textContent = '.swiper-pagination-' + sliderIdentifier + ' .swiper-pagination-bullet-active { background: green !important; }';
        toggleButtons(scope, sliderIdentifier, false, true);
      } else {
        if (style) {
          style.remove();
        }
        scope.querySelectorAll('.swiper-button-pause-' + sliderIdentifier).forEach(function (elem) {
          elem.style.display = 'none';
          elem.classList.remove('showPauseQuick');
          elem.classList.remove('overrideShowPauseQuick');
        });
        scope.querySelectorAll('.swiper-button-play-' + sliderIdentifier).forEach(function (elem) {
          elem.style.display = '';
        });
      }
    }

    function scheduleAutoplay() {
      clearTimeout(autoplayTimer);
      if (!autoplayRunning) {
        return;
      }
      autoplayTimer = setTimeout(function () {
        goToNext();
        scheduleAutoplay();
      }, config.autoplayDelay);
    }

    function startAutoplay() {
      clearTimeout(autoplayStopTimer);
      autoplayStopTimer = null;
      autoplayRunning = true;
      setAutoplayIndicator(true);
      scheduleAutoplay();
    }

    function stopAutoplay() {
      clearTimeout(autoplayTimer);
      autoplayTimer = null;
      autoplayRunning = false;
      setAutoplayIndicator(false);
    }

    function toggleAutoplay(advanceOnStart) {
      if (autoplayRunning) {
        stopAutoplay();
      } else {
        if (advanceOnStart) {
          goToNext();
        }
        startAutoplay();
      }
    }

    sliderElm.localsiteSlidesController = {
      startAutoplay: startAutoplay,
      stopAutoplay: stopAutoplay,
      toggleAutoplay: toggleAutoplay
    };

    function goToNext() {
      homeSwiper.slideNext();
    }

    function goToPrev() {
      homeSwiper.slidePrev();
    }

    scope.querySelectorAll('.swiper-button-pause-' + sliderIdentifier).forEach(function (elem) {
      elem.addEventListener('click', function () {
        elem.classList.add('overrideShowPauseQuick');
        stopAutoplay();
      });
    });

    scope.querySelectorAll('.swiper-button-play-' + sliderIdentifier).forEach(function (elem) {
      elem.addEventListener('click', function () {
        goToNext();
        startAutoplay();
      });
    });

    if (prevEl) {
      prevEl.addEventListener('click', function () {
        goToPrev();
        startAutoplay();
      });
    }

    if (nextEl) {
      nextEl.addEventListener('click', function () {
        goToNext();
        startAutoplay();
      });
    }

    if (paginationEl) {
      paginationEl.addEventListener('click', function (event) {
        if (!event.target.closest('.swiper-pagination-bullet')) {
          return;
        }
        startAutoplay();
      });
    }

    sliderElm.querySelectorAll('.slide-autoplay-toggle').forEach(function (elem) {
      elem.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        toggleAutoplay(true);
      });
      elem.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ') {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        toggleAutoplay(true);
      });
    });

    startAutoplay();
  }

  function initPlayer() {
    const playerElement = document.querySelector(config.playerSelector);
    const slideContainer = document.getElementById(config.sliderId);
    if (!playerElement || !slideContainer || typeof Plyr === 'undefined') {
      return;
    }

    if (config.playerProvider) {
      playerElement.setAttribute('data-plyr-provider', config.playerProvider);
    }
    if (config.playerEmbedId) {
      playerElement.setAttribute('data-plyr-embed-id', config.playerEmbedId);
    }

    function stopSlideAutoplay() {
      const sliderController = slideContainer.localsiteSlidesController;
      if (sliderController && typeof sliderController.stopAutoplay === 'function') {
        sliderController.stopAutoplay();
      }
    }

    function updateCenterOverlayVisibility(player, event) {
      const playerContainer = player && player.elements ? player.elements.container : null;
      if (!playerContainer) {
        return;
      }
      if (!player.playing) {
        playerContainer.classList.remove('center-overlay-active');
        return;
      }

      const rect = playerContainer.getBoundingClientRect();
      const hotspotWidth = Math.min(160, rect.width * 0.32);
      const hotspotHeight = Math.min(160, rect.height * 0.32);
      const centerX = rect.left + (rect.width / 2);
      const centerY = rect.top + (rect.height / 2);
      const isCentered =
        event.clientX >= centerX - (hotspotWidth / 2) &&
        event.clientX <= centerX + (hotspotWidth / 2) &&
        event.clientY >= centerY - (hotspotHeight / 2) &&
        event.clientY <= centerY + (hotspotHeight / 2);

      playerContainer.classList.toggle('center-overlay-active', isCentered);
    }

    function setOverlayButtonState(isPlaying) {
      const overlayButton = slideContainer.querySelector('.plyr__control--overlaid[data-plyr="play"]');
      if (!overlayButton) {
        return;
      }
      const iconUse = overlayButton.querySelector('use');
      const iconName = isPlaying ? 'pause' : 'play';
      const labelText = isPlaying ? 'Pause' : 'Play';

      if (iconUse) {
        const hrefValue = iconUse.getAttribute('href') || iconUse.getAttribute('xlink:href');
        if (hrefValue) {
          const nextHref = hrefValue.replace(/(.*-)(play|pause)$/, '$1' + iconName);
          iconUse.setAttribute('href', nextHref);
          iconUse.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', nextHref);
        }
      }

      overlayButton.setAttribute('aria-label', labelText);
      overlayButton.classList.toggle('is-pause-icon', isPlaying);
      const label = overlayButton.querySelector('.plyr__sr-only');
      if (label) {
        label.textContent = labelText;
      }
    }

    slideContainer.addEventListener('click', function (event) {
      if (!event.target.closest('.plyr__control--overlaid[data-plyr="play"]')) {
        return;
      }
      stopSlideAutoplay();
    });

    try {
      const player = new Plyr(config.playerSelector, config.plyrOptions);
      player.on('ready', function () {
        setOverlayButtonState(false);
        if (player.elements && player.elements.container) {
          player.elements.container.addEventListener('mousemove', function (event) {
            updateCenterOverlayVisibility(player, event);
          });
          player.elements.container.addEventListener('mouseleave', function () {
            player.elements.container.classList.remove('center-overlay-active');
          });
        }
      });
      player.on('play', function () {
        stopSlideAutoplay();
        setOverlayButtonState(true);
        const overlayButton = slideContainer.querySelector('.plyr__control--overlaid[data-plyr="play"]');
        if (overlayButton) {
          overlayButton.blur();
        }
        slideContainer.classList.add('video-playing');
      });
      player.on('pause', function () {
        setOverlayButtonState(false);
        if (player.elements && player.elements.container) {
          player.elements.container.classList.remove('center-overlay-active');
        }
        slideContainer.classList.remove('video-playing');
      });
      player.on('ended', function () {
        setOverlayButtonState(false);
        if (player.elements && player.elements.container) {
          player.elements.container.classList.remove('center-overlay-active');
        }
        slideContainer.classList.remove('video-playing');
        player.restart();
      });
      window.player = player;
    } catch (error) {
      console.error('slides.js Plyr init failed:', error);
    }
  }

  function clampHeightState(state) {
    return Math.max(0, Math.min(2, state));
  }

  function updateHeightToggleButtons(container) {
    const currentState = clampHeightState(Number(container.dataset.heightState || 0));
    const upButton = document.querySelector('#swiper-height-toggle .swiper-height-up');
    const downButton = document.querySelector('#swiper-height-toggle .swiper-height-down');

    [upButton, downButton].forEach(function (button) {
      if (!button) {
        return;
      }
      button.classList.remove('is-disabled');
      button.removeAttribute('aria-disabled');
    });

    if (upButton && currentState === 0) {
      upButton.classList.add('is-disabled');
      upButton.setAttribute('aria-disabled', 'true');
    }
    if (downButton && currentState === 2) {
      downButton.classList.add('is-disabled');
      downButton.setAttribute('aria-disabled', 'true');
    }
  }

  function setHeightState(container, nextState) {
    container.dataset.heightState = String(clampHeightState(nextState));
    updateHeightToggleButtons(container);
  }

  function updateFullVideoHeight(container) {
    const videoSlide = container.querySelector('.swiper-slide-container');
    const targetWidth = videoSlide ? videoSlide.clientWidth : container.clientWidth;
    if (!targetWidth) {
      return;
    }

    const fullHeight = Math.max(500, Math.ceil(targetWidth * 9 / 16));
    container.style.setProperty('--slides-full-max-height', fullHeight + 'px');
    container.style.setProperty('--slides-full-slide-height', fullHeight + 'px');
  }

  function initHeightToggle() {
    const container = document.getElementById(config.sliderId);
    if (!container) {
      return;
    }

    updateFullVideoHeight(container);
    setHeightState(container, Number(container.dataset.heightState || 0));

    if (!container.localsiteSlidesHeightWatcher) {
      if (typeof ResizeObserver === 'function') {
        const resizeObserver = new ResizeObserver(function () {
          updateFullVideoHeight(container);
        });
        resizeObserver.observe(container);
        const videoSlide = container.querySelector('.swiper-slide-container');
        if (videoSlide) {
          resizeObserver.observe(videoSlide);
        }
        container.localsiteSlidesHeightWatcher = resizeObserver;
      } else {
        const resizeHandler = function () {
          updateFullVideoHeight(container);
        };
        window.addEventListener('resize', resizeHandler);
        container.localsiteSlidesHeightWatcher = resizeHandler;
      }
    }
  }

  function bindHeightToggle() {
    if (!window.localsiteSlidesHeightToggleBound) {
      window.localsiteSlidesHeightToggleBound = true;
      document.addEventListener('click', function (event) {
        const button = event.target.closest('#swiper-height-toggle .swiper-height-button');
        const container = document.getElementById(config.sliderId);
        if (!button || !container || button.classList.contains('is-disabled')) {
          return;
        }

        const delta = button.dataset.heightDirection === 'up' ? -1 : 1;
        const currentState = Number(container.dataset.heightState || 0);
        setHeightState(container, currentState + delta);
      });
    }

    initHeightToggle();
  }

  function initSlides(scope) {
    bindHeightToggle();
    initPlayer();
    scope.querySelectorAll('.swiper-container').forEach(function (slider) {
      buildSwiperSlider(scope, slider);
    });
  }

  function mountSlides(target) {
    fetch(config.templatePath)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Unable to load slideshow template: ' + config.templatePath);
        }
        return response.text();
      })
      .then(function (html) {
        target.innerHTML = html;
        initSlides(target);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  function start() {
    if (typeof includeCSS3 !== 'function' || typeof loadScript !== 'function') {
      console.warn('slides.js requires localsite.js to load first.');
      return;
    }

    const waitForTarget = typeof waitForElm === 'function'
      ? waitForElm(config.mountSelector)
      : Promise.resolve(document.querySelector(config.mountSelector));

    waitForTarget.then(function (target) {
      if (!target) {
        console.warn('slides.js mount target not found:', config.mountSelector);
        return;
      }
      loadAssets(function () {
        mountSlides(target);
      });
    });
  }

  window.localsiteSlides = {
    config: config,
    init: start
  };

  start();
})();
