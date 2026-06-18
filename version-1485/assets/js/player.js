var MoviePlayer = (function () {
  function boot(streamUrl) {
    var video = document.querySelector(".movie-video");
    var overlay = document.querySelector(".play-overlay");
    var started = false;
    var hlsInstance = null;

    if (!video || !overlay || !streamUrl) {
      return;
    }

    function requestPlay() {
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {});
      }
    }

    function attachStream() {
      if (started) {
        requestPlay();
        return;
      }

      started = true;
      overlay.classList.add("is-hidden");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.addEventListener("loadedmetadata", requestPlay, { once: true });
        video.load();
        requestPlay();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          maxBufferLength: 30
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, requestPlay);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hlsInstance) {
            hlsInstance.destroy();
            video.src = streamUrl;
            video.load();
          }
        });
        requestPlay();
        return;
      }

      video.src = streamUrl;
      video.load();
      requestPlay();
    }

    overlay.addEventListener("click", attachStream);
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
  }

  return {
    boot: boot
  };
})();
