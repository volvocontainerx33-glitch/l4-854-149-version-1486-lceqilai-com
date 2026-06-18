(() => {
  const box = document.querySelector('[data-player-box]');

  if (!box) {
    return;
  }

  const video = box.querySelector('video');
  const overlay = box.querySelector('[data-overlay]');
  const playButton = box.querySelector('[data-play-button]');
  let hlsInstance = null;

  if (!video) {
    return;
  }

  const url = video.getAttribute('data-stream');

  const prepare = () => {
    if (!url || video.getAttribute('data-ready') === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.setAttribute('data-ready', '1');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
      video.setAttribute('data-ready', '1');
      return;
    }

    video.src = url;
    video.setAttribute('data-ready', '1');
  };

  const play = () => {
    prepare();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    const started = video.play();

    if (started && typeof started.catch === 'function') {
      started.catch(() => {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  };

  const togglePlay = () => {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  };

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  if (playButton) {
    playButton.addEventListener('click', (event) => {
      event.stopPropagation();
      play();
    });
  }

  video.addEventListener('click', togglePlay);
  video.addEventListener('play', () => {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });
  video.addEventListener('pause', () => {
    if (video.currentTime === 0 && overlay) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('pagehide', () => {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();
