(function () {
  var header = document.querySelector('.site-header');
  var navToggle = document.querySelector('.nav-toggle');

  if (header && navToggle) {
    navToggle.addEventListener('click', function () {
      header.classList.toggle('nav-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    var nextSlide = function () {
      if (slides.length > 0) {
        showSlide((current + 1) % slides.length);
      }
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(nextSlide, 5200);
      });
    });

    if (slides.length > 1) {
      timer = setInterval(nextSlide, 5200);
    }
  }

  var bindFilters = function () {
    var input = document.querySelector('[data-search-input]');
    var select = document.querySelector('[data-category-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card, [data-card-list] .ranking-card'));

    if (!cards.length) {
      return;
    }

    var apply = function () {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var category = select ? select.value.trim() : '';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-category') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        var inCategory = !category || (card.getAttribute('data-category') || '') === category;
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.classList.toggle('card-hidden', !(inCategory && matched));
      });
    };

    if (input) {
      input.addEventListener('input', apply);
    }

    if (select) {
      select.addEventListener('change', apply);
    }
  };

  bindFilters();

  var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

  players.forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-toggle');
    var stream = shell.getAttribute('data-stream');
    var hlsInstance = null;
    var started = false;

    if (!video || !button || !stream) {
      return;
    }

    var start = function () {
      if (started) {
        video.play();
        return;
      }

      started = true;
      button.classList.add('is-hidden');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.play();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play();
        });
        return;
      }

      video.src = stream;
      video.play();
    };

    button.addEventListener('click', start);
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        return;
      }
      button.classList.remove('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
