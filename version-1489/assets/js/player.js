(function () {
    function loadScript(src, callback) {
        var script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = callback;
        document.head.appendChild(script);
    }

    function playVideo(video, overlay) {
        var stream = video.getAttribute('data-stream');

        function begin() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        function attach() {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                begin();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, begin);
                return;
            }

            video.src = stream;
            begin();
        }

        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        video.setAttribute('controls', 'controls');

        if (!window.Hls && !video.canPlayType('application/vnd.apple.mpegurl')) {
            loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js', attach);
        } else {
            attach();
        }
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('[data-play-overlay]');
        if (!video) {
            return;
        }

        if (overlay) {
            overlay.addEventListener('click', function () {
                playVideo(video, overlay);
            });
        }

        video.addEventListener('click', function () {
            if (!video.getAttribute('src')) {
                playVideo(video, overlay);
            }
        });
    });
})();
