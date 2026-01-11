// ==============================
// App Loading Logic
// ==============================
function initApp() {
  const darkVideo = document.querySelector('.dark-video');
  const profileImg = document.querySelector('.profile-photo');
  const logoImg = document.querySelector('.logo');
  const wrapper = document.querySelector('.content-wrapper');

  const globalLoaderEl = document.querySelector('.global-loader');
  const appContainerEl = document.querySelector('.app-container');

  const hqAssets = {
    videoSrc: 'assets/videos/stars_hq.mp4',
    profileSrc: 'assets/images/profile_picture_hq.png',
    logoSrc: 'assets/images/earth_logo_hq.png'
  };

  document.addEventListener('DOMContentLoaded', () => {
    initHeightGuard(wrapper, 400);

    showGlobalLoader(globalLoaderEl, appContainerEl);

    const posterSrc = darkVideo?.getAttribute('poster');
    if (!posterSrc) {
      console.error('Poster not found on dark video.');
      return;
    }

    const poster = new Image();
    poster.src = posterSrc;

    poster.onload = () => {
      hideGlobalLoader(globalLoaderEl, appContainerEl);

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

initApp();

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

      darkVideo.pause();
      darkVideo.currentTime = 0;
      darkVideo.classList.add('hidden');

      if (!isLightVideoLoaded) {
        const source = document.createElement('source');
        source.src = 'assets/videos/clouds_hq.mp4';
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

function initAudio() {
  const audio = document.querySelector('.bg-audio');
  const toggleBtn = document.querySelector('.audio-toggle');
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

initAudio();


// ==============================
// Image Popup Logic
// ==============================
function initImagePopup() {
  const popup = document.querySelector(".generic-popup");
  const popupContent = document.querySelector(".popup-content");
  const closeIcon = document.querySelector(".close-icon");
  const profilePhoto = document.querySelector(".profile-photo");

  const popupImage = document.createElement("img");
  popupImage.alt = "Profile Image";
  popupImage.title = "My Avatar";
  popupImage.classList.add("popup-image", "hidden");

  popupContent.appendChild(popupImage);

  popupImage.src = profilePhoto.src;

  let popupImageUpgraded = false;
  document.addEventListener("hq-profile-loaded", (e) => {
    if (!popupImageUpgraded) {
      popupImage.src = e.detail.src;
      popupImageUpgraded = true;
    }
  });

  function showImagePopup() {
    popup.classList.remove("hidden");
    popupImage.classList.remove("hidden");
  }

  profilePhoto.addEventListener("click", showImagePopup);

  closeIcon.addEventListener("click", () => {
    popup.classList.add("hidden");
  });

  popup.addEventListener("click", (event) => {
    if (!popupContent.contains(event.target) && !closeIcon.contains(event.target)) {
      popup.classList.add("hidden");
    }
  });
}

initImagePopup();

// ==============================
// Navigation Logic
// ==============================
function initNavigation() {
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const sectionElements = Array.from(document.querySelectorAll('.content-section'));
  const sectionLoaderEl = document.querySelector('.section-loader'); // constant reference

  if (!navLinks.length || !sectionElements.length || !sectionLoaderEl) return;

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
        showSectionLoader(sectionLoaderEl, sectionEl);
      }

      await loadingSections.get(section);

      if (showLoader && !edge) {
        hideSectionLoader(sectionLoaderEl, sectionEl);
      }
      return;
    }

    const loadPromise = (async () => {
      try {
        if (showLoader && !edge) {
          showSectionLoader(sectionLoaderEl, sectionEl);
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
          hideSectionLoader(sectionLoaderEl, sectionEl);
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
