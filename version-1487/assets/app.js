(function () {
    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function bindMobileNav() {
        var button = document.querySelector('.mobile-trigger');
        if (!button) {
            return;
        }
        button.addEventListener('click', function () {
            document.body.classList.toggle('nav-open');
        });
    }

    function applyFilters() {
        var keywordInput = document.querySelector('.movie-search');
        var categoryFilter = document.querySelector('.category-filter');
        var yearFilter = document.querySelector('.year-filter');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid .movie-card'));

        if (!keywordInput || cards.length === 0) {
            return;
        }

        function update() {
            var keyword = normalize(keywordInput.value);
            var category = categoryFilter ? normalize(categoryFilter.value) : 'all';
            var year = yearFilter ? normalize(yearFilter.value) : '';

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-keywords'));
                var cardCategory = normalize(card.getAttribute('data-category'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                var categoryMatch = category === 'all' || cardCategory === category;
                var yearMatch = !year || cardYear.indexOf(year) !== -1;
                card.classList.toggle('hidden-card', !(keywordMatch && categoryMatch && yearMatch));
            });
        }

        keywordInput.addEventListener('input', update);
        if (categoryFilter) {
            categoryFilter.addEventListener('change', update);
        }
        if (yearFilter) {
            yearFilter.addEventListener('input', update);
        }

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            keywordInput.value = q;
            update();
        }
    }

    window.initMoviePlayer = function (src) {
        var video = document.getElementById('movie-player');
        var button = document.getElementById('player-start');
        var shell = video ? video.closest('.player-shell') : null;
        var hlsInstance = null;

        if (!video || !src) {
            return;
        }

        function loadSource() {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (video.src !== src) {
                    video.src = src;
                }
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                    });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                }
                return Promise.resolve();
            }

            if (video.src !== src) {
                video.src = src;
            }
            return Promise.resolve();
        }

        function start() {
            loadSource().then(function () {
                var promise = video.play();
                if (promise && typeof promise.then === 'function') {
                    promise.catch(function () {});
                }
                if (shell) {
                    shell.classList.add('is-playing');
                }
            });
        }

        if (button) {
            button.addEventListener('click', start);
        }

        video.addEventListener('play', function () {
            if (shell) {
                shell.classList.add('is-playing');
            }
        });

        video.addEventListener('pause', function () {
            if (shell && video.currentTime === 0) {
                shell.classList.remove('is-playing');
            }
        });

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        bindMobileNav();
        applyFilters();
    });
})();
