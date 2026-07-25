// static/js/ribbon-service/ribbon-utils.js

// ==============================
// Ribbon Renderer
// ==============================
export function renderRibbon() {
  const wrapper = document.createElement("div");
  wrapper.className = "code-ecrivain";

  wrapper.innerHTML = `
    <header class="top-ribbon">
      <video class="top-ribbon-video top-ribbon-dark-video"
        poster="static/assets/images/stars_lq.jpg"
        muted loop autoplay playsinline disablePictureInPicture preload="none">
        <source src="static/assets/videos/stars_hq.mp4" type="video/mp4" />
      </video>
      <video class="top-ribbon-video top-ribbon-light-video hidden"
        poster="static/assets/images/clouds_lq.jpg"
        muted loop autoplay playsinline disablePictureInPicture preload="none">
      </video>
      <div class="top-ribbon-controls-container">
        <div class="theme-toggle-container">
          <span class="material-icons theme-icon" title="Dark Mode Active">
            dark_mode
          </span>
          <label class="theme-toggle-switch" title="Toggle Theme">
            <input type="checkbox" class="theme-toggle-checkbox hidden"
              aria-label="Toggle dark/light theme" />
            <span class="theme-toggle-slider"></span>
          </label>
        </div>
        <div class="bg-audio-help-container">
          <audio class="bg-audio" data-src="static/assets/audio/background-music.mp3"></audio>
          <span class="material-icons top-ribbon-bg-audio-btn"
            title="Toggle audio" aria-label="Toggle audio">
            volume_up
          </span>
          <span class="material-icons top-ribbon-help-btn"
            title="Help Center" aria-label="Help">
            question_mark
          </span>
        </div>
      </div>
    </header>
  `;

  return wrapper;
}

// ==============================
// Theme Toggle Logic
// ==============================
export function toggleTheme() {
  const toggle = document.querySelector('.theme-toggle-checkbox');
  const themeIcon = document.querySelector('.theme-icon');
  const body = document.body;
  const darkVideo = document.querySelector('.top-ribbon-dark-video');
  const lightVideo = document.querySelector('.top-ribbon-light-video');

  let isLightVideoLoaded = false;

  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      body.classList.add('light-theme');
      themeIcon.textContent = 'light_mode';
      themeIcon.title = 'Light Mode Active';

      darkVideo.pause();
      darkVideo.currentTime = 0;
      darkVideo.classList.add('hidden');

      if (!isLightVideoLoaded) {
        const source = document.createElement('source');
        source.src = 'static/assets/videos/clouds_hq.mp4';
        source.type = 'video/mp4';
        lightVideo.appendChild(source);
        lightVideo.load();
        isLightVideoLoaded = true;
      }

      lightVideo.classList.remove('hidden');
      lightVideo.currentTime = 0;
      lightVideo.play();
    } else {
      body.classList.remove('light-theme');
      themeIcon.textContent = 'dark_mode';
      themeIcon.title = 'Dark Mode Active';

      lightVideo.pause();
      lightVideo.currentTime = 0;
      lightVideo.classList.add('hidden');

      darkVideo.classList.remove('hidden');
      darkVideo.currentTime = 0;
      darkVideo.play();
    }
  });
}


// ==============================
// Background Audio Logic
// ==============================
export function bgAudio() {
  const audio = document.querySelector('.bg-audio');
  const toggleBtn = document.querySelector('.top-ribbon-bg-audio-btn');
  let isSrcSet = false;

  if (!audio || !toggleBtn) return;

  audio.volume = 0.5;

  toggleBtn.addEventListener('mouseenter', () => {
    if (!isSrcSet) {
      const src = audio.getAttribute('data-src');
      if (src) {
        audio.src = src;
        isSrcSet = true;
      }
    }
  });

  toggleBtn.addEventListener('click', async () => {
    if (audio.paused) {
      try { await audio.play(); } catch (e) { console.error(e); }
      toggleBtn.textContent = 'volume_off';
    } else {
      audio.pause();
      toggleBtn.textContent = 'volume_up';
    }
  });

  audio.addEventListener('ended', () => {
    toggleBtn.textContent = 'volume_up';
  });
}

// ==============================
// Help Center Logic
// ==============================
export function helpCenter() {
  const helpBtn = document.querySelector(".top-ribbon-help-btn");
  helpBtn.addEventListener("click", () => {
    window.open("../help.html", "_blank");
  });
}