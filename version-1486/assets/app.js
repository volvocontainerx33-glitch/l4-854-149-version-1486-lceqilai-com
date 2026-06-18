(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
            document.body.classList.toggle("no-scroll", menu.classList.contains("is-open"));
        });
        menu.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                menu.classList.remove("is-open");
                document.body.classList.remove("no-scroll");
            });
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        function play() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }
        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            play();
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });
        hero.addEventListener("mouseenter", function () {
            if (timer) {
                window.clearInterval(timer);
            }
        });
        hero.addEventListener("mouseleave", restart);
        play();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-button]"));
            var categorySelect = scope.querySelector("[data-category-select]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            var emptyState = scope.querySelector("[data-empty-state]");
            var activeType = "all";
            function apply() {
                var query = normalize(input ? input.value : "");
                var categoryValue = categorySelect ? categorySelect.value : "all";
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.genre,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.region
                    ].join(" "));
                    var typeMatch = activeType === "all" || card.dataset.type === activeType;
                    var categoryMatch = categoryValue === "all" || card.dataset.category === categoryValue;
                    var queryMatch = !query || haystack.indexOf(query) !== -1;
                    var show = typeMatch && categoryMatch && queryMatch;
                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });
                if (emptyState) {
                    emptyState.style.display = visible ? "none" : "block";
                }
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            if (categorySelect) {
                categorySelect.addEventListener("change", apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeType = button.dataset.filterType || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    function initSort() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var grid = scope.querySelector("[data-card-grid]");
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-sort-button]"));
            if (!grid || !buttons.length) {
                return;
            }
            var original = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var key = button.dataset.sortKey || "default";
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    var sorted = original.slice();
                    if (key !== "default") {
                        sorted.sort(function (a, b) {
                            return Number(b.dataset["sort" + key.charAt(0).toUpperCase() + key.slice(1)] || 0) - Number(a.dataset["sort" + key.charAt(0).toUpperCase() + key.slice(1)] || 0);
                        });
                    }
                    sorted.forEach(function (card) {
                        grid.appendChild(card);
                    });
                });
            });
        });
    }

    function initPlayer() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var playButton = player.querySelector("[data-play]");
            var stream = player.getAttribute("data-stream");
            var hlsReady = false;
            if (!video || !stream) {
                return;
            }
            function hideLayer() {
                if (playButton) {
                    playButton.classList.add("is-hidden");
                }
            }
            function start() {
                hideLayer();
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    if (!video.getAttribute("src")) {
                        video.setAttribute("src", stream);
                    }
                    video.play().catch(function () {});
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    if (!hlsReady) {
                        var hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(stream);
                        hls.attachMedia(video);
                        video._hls = hls;
                        hlsReady = true;
                    }
                    video.play().catch(function () {});
                    return;
                }
                if (!video.getAttribute("src")) {
                    video.setAttribute("src", stream);
                }
                video.play().catch(function () {});
            }
            if (playButton) {
                playButton.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
        });
    }

    ready(function () {
        initNavigation();
        initHero();
        initFilters();
        initSort();
        initPlayer();
    });
})();
