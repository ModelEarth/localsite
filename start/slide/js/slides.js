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
          elem.style.display = '';
          elem.classList.add('showPauseQuick');
        });
        autoplayStopTimer = setTimeout(function () {
          autoplayStopTimer = null;
          scope.querySelectorAll('.swiper-button-pause-' + sliderIdentifier).forEach(function (elem) {
            elem.style.display = 'none';
            elem.classList.remove('showPauseQuick');
            elem.classList.remove('overrideShowPauseQuick');
          });
        }, 1000);
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

    try {
      const player = new Plyr(config.playerSelector, config.plyrOptions);
      player.on('play', function () {
        slideContainer.classList.add('video-playing');
      });
      player.on('pause', function () {
        slideContainer.classList.remove('video-playing');
      });
      player.on('ended', function () {
        slideContainer.classList.remove('video-playing');
        player.restart();
      });
      window.player = player;
    } catch (error) {
      console.error('slides.js Plyr init failed:', error);
    }
  }

  function bindHeightToggle() {
    if (window.localsiteSlidesHeightToggleBound) {
      return;
    }
    window.localsiteSlidesHeightToggleBound = true;
    document.addEventListener('click', function (event) {
      const toggle = event.target.closest('#swiper-height-toggle');
      const container = document.getElementById(config.sliderId);
      if (!toggle || !container) {
        return;
      }
      const expanded = container.classList.toggle('video-expanded');
      toggle.title = expanded ? 'Collapse slideshow height' : 'Expand slideshow height';
    });
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
