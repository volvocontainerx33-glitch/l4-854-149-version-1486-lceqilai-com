(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function showHeroSlide(index) {
    if (!heroSlides.length) {
      return;
    }

    heroIndex = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === heroIndex);
    });

    heroDots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === heroIndex);
    });
  }

  heroDots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = Number(dot.getAttribute('data-hero-dot')) || 0;
      showHeroSlide(index);
    });
  });

  if (heroSlides.length > 1) {
    window.setInterval(function () {
      showHeroSlide(heroIndex + 1);
    }, 5200);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-search-input]')).forEach(function (input) {
    var targetSelector = input.getAttribute('data-target');
    var root = targetSelector ? document.querySelector(targetSelector) : document;

    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      var cards = root ? root.querySelectorAll('[data-card]') : [];

      Array.prototype.slice.call(cards).forEach(function (card) {
        var searchText = (card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('hidden', Boolean(query) && searchText.indexOf(query) === -1);
      });
    });
  });

  function setupPlayer(player) {
    var video = player.querySelector('video');
    var source = player.getAttribute('data-src');
    var loading = player.querySelector('[data-loading]');
    var error = player.querySelector('[data-error]');
    var playButtons = player.querySelectorAll('[data-play]');
    var muteButton = player.querySelector('[data-mute]');
    var fullscreenButton = player.querySelector('[data-fullscreen]');
    var hlsInstance = null;
    var started = false;

    if (!video || !source) {
      return;
    }

    function setError(message) {
      if (error) {
        error.textContent = message;
      }
      if (loading) {
        loading.classList.add('hidden');
      }
    }

    function hideOverlay() {
      Array.prototype.slice.call(playButtons).forEach(function (button) {
        if (button.classList.contains('play-overlay')) {
          button.classList.add('hidden');
        }
      });
    }

    function initSource() {
      if (started) {
        return;
      }

      started = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (loading) {
            loading.classList.add('hidden');
          }
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setError('视频加载失败，请稍后重试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          if (loading) {
            loading.classList.add('hidden');
          }
        }, { once: true });
      } else {
        setError('当前浏览器不支持在线播放');
      }
    }

    function playVideo() {
      initSource();
      hideOverlay();
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setError('点击播放器后可继续播放');
        });
      }
    }

    function togglePlay() {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    }

    Array.prototype.slice.call(playButtons).forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        togglePlay();
      });
    });

    video.addEventListener('click', togglePlay);
    video.addEventListener('play', function () {
      player.classList.add('playing');
      hideOverlay();
    });
    video.addEventListener('pause', function () {
      player.classList.remove('playing');
    });
    video.addEventListener('canplay', function () {
      if (loading) {
        loading.classList.add('hidden');
      }
    });

    if (muteButton) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '取消静音' : '静音';
      });
    }

    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (video.requestFullscreen) {
          video.requestFullscreen();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
})();
