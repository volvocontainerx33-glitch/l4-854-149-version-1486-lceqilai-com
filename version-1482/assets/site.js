document.addEventListener("DOMContentLoaded", function () {
    setupMobileNavigation();
    setupHeroCarousel();
    setupCardFilters();
    setupSearchPage();
    setupHlsPlayers();
});

function setupMobileNavigation() {
    var button = document.querySelector(".mobile-menu-button");
    var panel = document.querySelector(".mobile-nav-panel");

    if (!button || !panel) {
        return;
    }

    button.addEventListener("click", function () {
        var opened = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!opened));
        panel.hidden = opened;
    });
}

function setupHeroCarousel() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
        return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function showSlide(index) {
        active = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === active);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === active);
        });
    }

    function startTimer() {
        stopTimer();
        timer = window.setInterval(function () {
            showSlide(active + 1);
        }, 5000);
    }

    function stopTimer() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
            startTimer();
        });
    });

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(active - 1);
            startTimer();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            showSlide(active + 1);
            startTimer();
        });
    }

    hero.addEventListener("mouseenter", stopTimer);
    hero.addEventListener("mouseleave", startTimer);

    showSlide(0);
    startTimer();
}

function setupCardFilters() {
    var filterInput = document.querySelector("[data-card-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
    var emptyState = document.querySelector("[data-empty-state]");

    if (!filterInput || cards.length === 0) {
        return;
    }

    function applyFilter() {
        var query = filterInput.value.trim().toLowerCase();
        var visibleCount = 0;

        cards.forEach(function (card) {
            var haystack = (card.getAttribute("data-search") || "").toLowerCase();
            var matched = !query || haystack.indexOf(query) !== -1;
            card.style.display = matched ? "" : "none";

            if (matched) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("is-visible", visibleCount === 0);
        }
    }

    filterInput.addEventListener("input", applyFilter);
    applyFilter();
}

function setupSearchPage() {
    var form = document.querySelector("[data-search-form]");
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");

    if (!form || !results || !window.MOVIE_SEARCH_DATA) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    var queryInput = form.querySelector("[name='q']");
    var categorySelect = form.querySelector("[name='category']");
    var yearSelect = form.querySelector("[name='year']");

    if (queryInput && initialQuery) {
        queryInput.value = initialQuery;
    }

    function renderCard(movie) {
        return [
            "<article class=\"movie-card\">",
            "    <a class=\"card-link\" href=\"video/" + escapeHtml(movie.id) + ".html\">",
            "        <figure class=\"poster-frame wide\">",
            "            <img class=\"poster-image\" src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" onerror=\"this.classList.add('is-missing');\">",
            "            <span class=\"duration\">" + escapeHtml(movie.duration) + "</span>",
            "        </figure>",
            "        <div class=\"card-body\">",
            "            <span class=\"category-pill\">" + escapeHtml(movie.category) + "</span>",
            "            <h3>" + escapeHtml(movie.title) + "</h3>",
            "            <div class=\"meta-line\">",
            "                <span>" + escapeHtml(movie.year) + "</span>",
            "                <span>" + escapeHtml(movie.region) + "</span>",
            "            </div>",
            "            <div class=\"tag-row\">" + movie.tags.slice(0, 2).map(function (tag) { return "<span class=\"tag-chip\">#" + escapeHtml(tag) + "</span>"; }).join("") + "</div>",
            "        </div>",
            "    </a>",
            "</article>"
        ].join("");
    }

    function applySearch(event) {
        if (event) {
            event.preventDefault();
        }

        var query = (queryInput ? queryInput.value : "").trim().toLowerCase();
        var category = categorySelect ? categorySelect.value : "";
        var year = yearSelect ? yearSelect.value : "";

        var matches = window.MOVIE_SEARCH_DATA.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.category,
                movie.tags.join(" ")
            ].join(" ").toLowerCase();

            var queryOk = !query || haystack.indexOf(query) !== -1;
            var categoryOk = !category || movie.categorySlug === category;
            var yearOk = !year || movie.year === year;

            return queryOk && categoryOk && yearOk;
        }).slice(0, 120);

        results.innerHTML = matches.map(renderCard).join("");

        if (summary) {
            summary.textContent = "当前展示 " + matches.length + " 条结果。";
        }
    }

    form.addEventListener("submit", applySearch);
    form.addEventListener("input", applySearch);
    form.addEventListener("change", applySearch);
    applySearch();
}

function setupHlsPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));

    shells.forEach(function (shell) {
        var video = shell.querySelector("video[data-hls]");
        var button = shell.querySelector(".player-start");
        var status = shell.querySelector(".player-status");

        if (!video || !button) {
            return;
        }

        button.addEventListener("click", function () {
            var source = video.getAttribute("data-hls");

            if (!source) {
                setPlayerStatus(status, "暂未绑定播放源");
                return;
            }

            button.disabled = true;
            setPlayerStatus(status, "正在加载播放源…");
            startHls(video, source, shell, status);
        });
    });
}

function startHls(video, source, shell, status) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        shell.classList.add("is-playing");
        playVideo(video, status);
        return;
    }

    if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            shell.classList.add("is-playing");
            setPlayerStatus(status, "播放源已就绪");
            playVideo(video, status);
        });

        hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
                return;
            }

            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                setPlayerStatus(status, "网络异常，正在重试…");
                hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                setPlayerStatus(status, "媒体解码异常，正在恢复…");
                hls.recoverMediaError();
            } else {
                setPlayerStatus(status, "播放失败，请稍后重试");
                hls.destroy();
            }
        });

        video._hls = hls;
        return;
    }

    setPlayerStatus(status, "当前浏览器不支持 HLS 播放");
}

function playVideo(video, status) {
    var promise = video.play();

    if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
            setPlayerStatus(status, "点击播放器上的播放键开始观看");
        });
    }
}

function setPlayerStatus(status, message) {
    if (status) {
        status.textContent = message;
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#039;");
}
