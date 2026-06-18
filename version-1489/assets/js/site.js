(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var siteNav = document.querySelector('[data-site-nav]');

    if (navToggle && siteNav) {
        navToggle.addEventListener('click', function () {
            siteNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function nextSlide() {
        showSlide(current + 1);
    }

    function startHero() {
        if (slides.length > 1) {
            timer = window.setInterval(nextSlide, 5200);
        }
    }

    function resetHero() {
        if (timer) {
            window.clearInterval(timer);
        }
        startHero();
    }

    document.querySelectorAll('[data-hero-next]').forEach(function (button) {
        button.addEventListener('click', function () {
            nextSlide();
            resetHero();
        });
    });

    document.querySelectorAll('[data-hero-prev]').forEach(function (button) {
        button.addEventListener('click', function () {
            showSlide(current - 1);
            resetHero();
        });
    });

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            resetHero();
        });
    });

    showSlide(0);
    startHero();

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    document.querySelectorAll('[data-card-filter]').forEach(function (panel) {
        var input = panel.querySelector('[data-card-search]');
        var select = panel.querySelector('[data-year-filter]');
        var targetSelector = panel.getAttribute('data-target') || 'body';
        var target = document.querySelector(targetSelector) || document;
        var cards = Array.prototype.slice.call(target.querySelectorAll('[data-movie-card]'));
        var empty = target.querySelector('[data-empty-state]');

        function applyFilter() {
            var keyword = normalize(input ? input.value : '');
            var year = select ? select.value : '';
            var visibleCount = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.textContent
                ].join(' '));
                var cardYear = card.getAttribute('data-year') || '';
                var visible = (!keyword || haystack.indexOf(keyword) !== -1) && (!year || cardYear === year);
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visibleCount === 0);
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (select) {
            select.addEventListener('change', applyFilter);
        }
        applyFilter();
    });
})();
