// nav-utils.js
import {showSectionLoader, hideSectionLoader} from "../utils/utils.js" 


// ==============================
// Height Guard Logic
// ==============================
function initHeightGuard(container, options = {}) {
  const threshold = options.threshold || 400;
  const message = options.message || 
    "❌ Error: Window height is too small to display all sections properly! Please zoom-out or increase window height vertically.";

  let notice = document.querySelector(".height-notice");
  if (!notice) {
    notice = document.createElement("div");
    notice.className = "height-notice";
    notice.textContent = message;
    document.body.appendChild(notice);
  }

  function checkHeight() {
    if (!container) return;
    const availableHeight = container.clientHeight;
    if (availableHeight < threshold) {
      notice.style.display = "block";
    } else {
      notice.style.display = "none";
    }
  }

  window.addEventListener("resize", checkHeight);
  window.addEventListener("load", checkHeight);
  checkHeight();
}


export function renderNavigation() {
  const parent = document.querySelector(".code-ecrivain");

  const nav = document.createElement("nav");
  nav.className = "nav-bar";
  nav.innerHTML = `
    <span class="nav-links">
      <a class="nav-link section-home active">Home</a>
      <a class="nav-link section-about">About</a>
      <a class="nav-link section-projects">Projects</a>
      <a class="nav-link section-contact">Contact</a>
    </span>
  `;
  parent.appendChild(nav);

  const main = document.createElement("main");
  main.className = "main-section-wrapper";
  main.innerHTML = `
    <img class="main-section-bg-logo" src="static/assets/images/earth_logo_lq.png" alt="Logo">

    <div class="main-section-loader hidden">
      <div></div>
      <div></div>
      <div></div>
    </div>

    <section class="main-section section-home active"></section>
    <section class="main-section section-about"></section>
    <section class="main-section section-projects"></section>
    <section class="main-section section-contact"></section>

    <span class="material-icons chat-icon" title="MYA - My AI Assistant">
      chat
    </span>
  `;
  parent.appendChild(main);
  initHeightGuard(main);

  const bgPhoto = main.querySelector(".main-section-bg-logo");
  const hqImage = new Image();
  hqImage.src = "static/assets/images/earth_logo_hq.png";
  hqImage.onload = () => {
    bgPhoto.src = hqImage.src;
  };
}



export function contentNavigation() {
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const sectionElements = Array.from(document.querySelectorAll('.main-section'));
    const sectionLoaderEl = document.querySelector('.main-section-loader');

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
            promises.push(loadJS('static/js/content-service/sidebar.js'));
        }

        promises.push(loadCSS(`static/css/${section}.css`));
        promises.push(loadJS(`static/js/content-service/${section}.js`));

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

        const sectionEl = document.querySelector(`.main-section.section-${targetClass}`);

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
    const firstSection = document.querySelector(`.main-section.section-${firstTargetClass}`);

    if (firstLink && firstSection) {
        firstLink.classList.add('active');
        sectionElements.forEach(sec => sec.classList.toggle('active', sec === firstSection));
        loadSection(firstTargetClass, firstSection, true);
    }
    initHeightGuard()
}

