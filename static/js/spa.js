// ==============================
// Site Loading Logic
// ==============================
function initAppLoader() {
  const loader = document.querySelector('.global-loader');
  const app = document.querySelector('.app-container');
  const darkVideo = document.querySelector('.dark-video');
  const profileImg = document.querySelector('.profile-photo');
  const logoImg = document.querySelector('.logo');

  const hqAssets = {
    videoSrc: 'assets/videos/stars_hq.mp4',
    profileSrc: 'assets/images/profile_picture_hq.png',
    logoSrc: 'assets/images/earth_logo_hq.png'
  };

  document.addEventListener('DOMContentLoaded', () => {
    loader.classList.remove('hidden');
    app.classList.add('hidden');

    const posterSrc = darkVideo?.getAttribute('poster');
    if (!posterSrc) {
      console.error('Poster not found on dark video.');
      return;
    }

    const poster = new Image();
    poster.src = posterSrc;

    poster.onload = () => {
      loader.classList.add('hidden');
      app.classList.remove('hidden');

      const hqProfile = new Image();
      hqProfile.src = hqAssets.profileSrc;
      hqProfile.onload = () => {
        profileImg.src = hqProfile.src;
        document.dispatchEvent(new CustomEvent('hq-profile-loaded', { detail: { src: hqProfile.src } }));
      };

      const hqLogo = new Image();
      hqLogo.src = hqAssets.logoSrc;
      hqLogo.onload = () => {
        logoImg.src = hqLogo.src;

        const canvas = document.createElement('canvas');
        canvas.width = hqLogo.width;
        canvas.height = hqLogo.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(hqLogo, 0, 0);

        const favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.type = 'image/png';
        favicon.href = canvas.toDataURL('image/png');
        document.head.appendChild(favicon);
      };
    };

    poster.onerror = () => {
      console.error('Poster failed to load. Loader will remain visible.');
    };
  });
}

initAppLoader();

// ==============================
// Theme Toggle Logic
// ==============================

function initThemeToggle() {
  const toggle = document.querySelector('.mode-toggle');
  const modeIcon = document.querySelector('.mode-icon');
  const body = document.body;
  const darkVideo = document.querySelector('.dark-video');
  const lightVideo = document.querySelector('.light-video');

  let isLightVideoLoaded = false;

  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      body.classList.add('light-theme');
      modeIcon.textContent = 'light_mode';
      modeIcon.title = 'Light Mode Active';

      // Pause and reset dark video
      darkVideo.pause();
      darkVideo.currentTime = 0;
      darkVideo.classList.add('hidden');

      // Lazy-load light video source if not already loaded
      if (!isLightVideoLoaded) {
        const source = document.createElement('source');
        source.src = 'assets/videos/clouds_hq.mp4';
        source.type = 'video/mp4';
        lightVideo.appendChild(source);
        lightVideo.load(); // triggers download
        isLightVideoLoaded = true;
      }

      lightVideo.classList.remove('hidden');
      lightVideo.currentTime = 0;
      lightVideo.play();
    } else {
      body.classList.remove('light-theme');
      modeIcon.textContent = 'dark_mode';
      modeIcon.title = 'Dark Mode Active';

      lightVideo.pause();
      lightVideo.currentTime = 0;
      lightVideo.classList.add('hidden');

      darkVideo.classList.remove('hidden');
      darkVideo.currentTime = 0;
      darkVideo.play();
    }
  });
}

initThemeToggle();

// ==============================
// Audio Controls Logic
// ==============================
function initAudio() {
  const audio = document.querySelector('.bg-audio');
  const playBtn = document.querySelector('.play-btn');
  const pauseBtn = document.querySelector('.pause-btn');
  let isSrcSet = false;

  if (!audio) return;

  audio.volume = 0.5;

  const updateButtonOpacity = () => {
    const paused = audio.paused;
    playBtn?.classList.toggle('dimmed', !paused);
    pauseBtn?.classList.toggle('dimmed', paused);
  };

  playBtn?.addEventListener('mouseenter', () => {
    if (!isSrcSet) {
      const src = audio.getAttribute('data-src');
      if (src) {
        audio.src = src;
        isSrcSet = true;
      }
    }
  });

  playBtn?.addEventListener('click', async () => {
    audio.currentTime = 0;
    try { await audio.play(); } catch (e) { console.error(e); }
    updateButtonOpacity();
  });

  pauseBtn?.addEventListener('click', () => {
    audio.pause();
    updateButtonOpacity();
  });

  ['play', 'pause', 'ended'].forEach(evt => {
    audio.addEventListener(evt, updateButtonOpacity);
  });

  updateButtonOpacity();
}

initAudio()

// ==============================
// Generic Popup Logic
// ==============================
function initGenericPopup() {
  const popup = document.querySelector(".generic-popup");
  const popupContent = document.querySelector(".popup-content");
  const closeIcon = document.querySelector(".close-icon");
  const profilePhoto = document.querySelector(".profile-photo");
  const chatIcon = document.querySelector(".chat-icon");

  const popupImage = document.createElement("img");
  popupImage.alt = "Profile Image";
  popupImage.title = "Ushinar Chatterjee";
  popupImage.classList.add("popup-image");

  const popupMessage = document.createElement("p");
  popupMessage.classList.add("popup-message");
  popupMessage.textContent = "Chat feature is currently under development.";

  popupContent.appendChild(popupImage);
  popupContent.appendChild(popupMessage);
  popupImage.classList.add("hidden");
  popupMessage.classList.add("hidden");

  popupImage.src = profilePhoto.src;

  let popupImageUpgraded = false;
  document.addEventListener('hq-profile-loaded', (e) => {
    if (!popupImageUpgraded) {
      popupImage.src = e.detail.src;
      popupImageUpgraded = true;
    }
  });

  function showPopup(contentType) {
    popup.classList.remove("hidden");

    if (contentType === 'profile') {
      popupImage.classList.remove("hidden");
      popupMessage.classList.add("hidden");
    } else if (contentType === 'chat') {
      popupMessage.classList.remove("hidden");
      popupImage.classList.add("hidden");
    }
  }

  profilePhoto.addEventListener("click", () => showPopup('profile'));
  chatIcon.addEventListener("click", () => showPopup('chat'));

  closeIcon.addEventListener("click", () => {
    popup.classList.add("hidden");
  });

  popup.addEventListener("click", (event) => {
  if (!popupContent.contains(event.target) && !closeIcon.contains(event.target)) {
    popup.classList.add("hidden");
  }
});
}

initGenericPopup();

// ==============================
// Navigation Logic
// ==============================
function initNavigation() {
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const sectionElements = Array.from(document.querySelectorAll('.content-section'));
  const loader = document.querySelector('.section-loader');

  if (!navLinks.length || !sectionElements.length || !loader) return;

  const htmlCache = {};
  const loadedAssets = new Set();
  const loadingSections = new Map();
  let sidebarLoaded = false;

  const isFirstOrLast = el =>
    el === sectionElements[0] || el === sectionElements[sectionElements.length - 1];

  const loadAssets = (section, sectionEl) => {
    if (isFirstOrLast(sectionEl) || loadedAssets.has(section)) return Promise.resolve();
    loadedAssets.add(section);

    const loadCSS = href =>
      new Promise(res => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = res;
        link.onerror = res;
        document.head.appendChild(link);
      });

    const loadJS = src =>
      new Promise(res => {
        const script = document.createElement('script');
        script.src = src;
        script.defer = true;
        script.onload = res;
        script.onerror = res;
        document.body.appendChild(script);
      });

    const promises = [];

    if (!sidebarLoaded) {
      sidebarLoaded = true;
      promises.push(loadCSS('static/css/sidebar.css'));
      promises.push(loadJS('static/js/sidebar.js'));
    }

    promises.push(loadCSS(`static/css/${section}.css`));
    promises.push(loadJS(`static/js/${section}.js`));

    return Promise.all(promises);
  };

  const loadSection = async (section, sectionEl, showLoader) => {
    if (!sectionEl) return;

    const edge = isFirstOrLast(sectionEl);

    if (loadingSections.has(section)) {
      if (showLoader && !edge) {
        loader.classList.remove('hidden');
        sectionEl.classList.remove('active');
      }

      await loadingSections.get(section);

      if (showLoader && !edge) {
        loader.classList.add('hidden');
        sectionEl.classList.add('active');
      }
      return;
    }

    const loadPromise = (async () => {
      try {
        if (showLoader && !edge) {
          loader.classList.remove('hidden');
          sectionEl.classList.remove('active');
        }

        if (!edge) await loadAssets(section, sectionEl);

        let html = htmlCache[section];
        if (!html) {
          const res = await fetch(`static/content/${section}.html`);
          html = await res.text();
          htmlCache[section] = html;
        }

        sectionEl.innerHTML = html;

        if (!edge && typeof initializeSidebar === 'function') {
          initializeSidebar(sectionEl);
        }
      } catch (err) {
        console.error(`Failed to load content for "${section}"`, err);
      } finally {
        if (showLoader && !edge) {
          loader.classList.add('hidden');
          sectionEl.classList.add('active');
        }
        loadingSections.delete(section);
      }
    })();

    loadingSections.set(section, loadPromise);
    await loadPromise;
  };

  navLinks.forEach(link => {
    const targetClass = Array.from(link.classList)
      .find(cls => cls.startsWith('section-'))
      ?.replace('section-', '');

    const sectionEl = document.querySelector(`.content-section.section-${targetClass}`);

    link.addEventListener('mouseenter', () => {
      if (!htmlCache[targetClass] && !isFirstOrLast(sectionEl)) {
        loadSection(targetClass, sectionEl, false);
      }
    });

    link.addEventListener('click', async e => {
      e.preventDefault();

      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      sectionElements.forEach(sec => {
        const show = sec.classList.contains(`section-${targetClass}`);
        sec.classList.toggle('active', show);
      });

      const activeSection = sectionEl;
      const needsLoading = activeSection.innerHTML.trim() === '';

      if (needsLoading) {
        await loadSection(targetClass, activeSection, true);
      }

      if (!isFirstOrLast(activeSection) && typeof initializeSidebar === 'function') {
        initializeSidebar(activeSection);
      }
    });
  });

  // Initial load
  const firstLink = navLinks[0];
  const firstTargetClass = Array.from(firstLink.classList)
    .find(cls => cls.startsWith('section-'))
    ?.replace('section-', '');
  const firstSection = document.querySelector(`.content-section.section-${firstTargetClass}`);

  if (firstLink && firstSection) {
    firstLink.classList.add('active');
    sectionElements.forEach(sec => sec.classList.toggle('active', sec === firstSection));
    loadSection(firstTargetClass, firstSection, true);
  }
}

initNavigation();

