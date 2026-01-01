// ==============================
// App Loading Logic
// ==============================
function initAppLoader() {
  const darkVideo = document.querySelector('.dark-video');
  const profileImg = document.querySelector('.profile-photo');
  const logoImg = document.querySelector('.logo');
  const wrapper = document.querySelector(".content-wrapper");

  const hqAssets = {
    videoSrc: 'assets/videos/stars_hq.mp4',
    profileSrc: 'assets/images/profile_picture_hq.png',
    logoSrc: 'assets/images/earth_logo_hq.png'
  };

  document.addEventListener('DOMContentLoaded', () => {
    initHeightGuard(wrapper, 400);
    showLoader();

    const posterSrc = darkVideo?.getAttribute('poster');
    if (!posterSrc) {
      console.error('Poster not found on dark video.');
      return;
    }

    const poster = new Image();
    poster.src = posterSrc;

    poster.onload = () => {
      hideLoader();

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

// ==============================
// Chat Logic
// ==============================
function initChat() {
  const chatIcon = document.querySelector(".chat-icon");
  const contentWrapper = document.querySelector(".app-container");
  let chatContainer, chatSection, textarea, sendBtn, historyIcon, historySection, newIcon, warningEl;
  let currentChat = [], currentChatId = null;
  let firstOpen = true;
  let welcomeMsgEl = null;
  let requestCount = 0;
  const MAX_REQUESTS = 3;

  const WELCOME_MESSAGE = `
<div style="display:flex;flex-direction:column;gap:1rem;justify-content:center;align-items:center;text-align:center;">
    <h1><strong style="animation: colorswap var(--animation-fast) infinite alternate ease-in-out;">Welcome!</strong></h1>
    <p>I am <strong>MYA</strong>, a virtual AI assistant designed to converse with the users of <strong>CodeEcrivain</strong> regarding professional queries about Ushinar and the content of this website.</p>
    <i style="font-size:var(--font-size-sm);"><strong>MYA</strong> is an AI and may make mistakes.<br>Conversations are stored locally in your browser and removed when you delete them.</i>
    <strong>Please contact me to view a live demo.</strong>
</div>

  `;
  let thinkingEl = null;

  const showThinking = () => {
    if (thinkingEl) return;
    thinkingEl = renderMessage("<span class='thinking-inline'>Thinking <span class='dots'></span></span>", "ai");

    chatSection.appendChild(thinkingEl);

    chatSection.scrollTop = chatSection.scrollHeight;
  };

  const removeThinking = () => {
    if (thinkingEl && chatSection.contains(thinkingEl)) {
      thinkingEl.remove();
    }
    thinkingEl = null;
  };

  const renderMessage = (text, type) => {
    const msg = document.createElement("div");
    msg.classList.add("message", type);
    msg.innerHTML = type === "ai" ? marked.parse(text) : text;
    chatSection.appendChild(msg);
    chatSection.scrollTop = chatSection.scrollHeight;
    return msg;
  };

  const appendMessage = (text, type) => {
    renderMessage(text, type);
    currentChat.push({ text, type });
  };

  const saveChatToHistory = () => {
    if (!currentChat.length) return;
    const histories = JSON.parse(localStorage.getItem("chatHistories") || "[]");
    if (currentChatId) {
      const idx = histories.findIndex(h => h.id === currentChatId);
      if (idx !== -1) {
        histories[idx].chatData = currentChat;
        localStorage.setItem("chatHistories", JSON.stringify(histories));
        return;
      }
    }
    const newHistory = {
      id: Date.now(),
      firstMessage: currentChat[0].text,
      timestamp: new Date().toLocaleString(),
      chatData: currentChat
    };
    histories.push(newHistory);
    currentChatId = newHistory.id;
    localStorage.setItem("chatHistories", JSON.stringify(histories));
    renderHistory();
  };

  const renderHistory = () => {
    const histories = JSON.parse(localStorage.getItem("chatHistories") || "[]");
    historySection.innerHTML = histories.length ? "" : "No history yet.";
    histories.slice().reverse().forEach(h => {
      const card = document.createElement("div");
      card.classList.add("history-card");
      Object.assign(card.style, {
        display: "flex",
        justifyContent: "space-between",
        gap: "1rem",
        alignItems: "center",
        padding: "0.5rem",
        borderBottom: "var(--border)"
      });
      const left = document.createElement("div");
      left.style.flex = "1";
      left.innerHTML = `
        <div class="history-title section-text-base" style="cursor:pointer; color:var(--hover-color);">
          ${h.firstMessage.length > 30 ? h.firstMessage.slice(0, 30) + "..." : h.firstMessage}
        </div>
        <div class="history-time section-text-sm" style="cursor:pointer; color:var(--primary-color);">
          Started: ${h.timestamp}
        </div>`;
      left.onclick = () => {
        saveChatToHistory();
        chatSection.innerHTML = "";
        welcomeMsgEl = null;
        currentChat = [...h.chatData];
        currentChatId = h.id;
        currentChat.forEach(msg => renderMessage(msg.text, msg.type));
        historySection.classList.add("hidden");

        requestCount = currentChat.filter(m => m.type === "user").length;

        if (requestCount >= MAX_REQUESTS) {
          showWarning();
        } else {
          clearWarning();
          textarea.focus();
        }
      };

      const removeBtn = document.createElement("span");
      removeBtn.textContent = "✖";
      Object.assign(removeBtn.style, { color: "red", cursor: "pointer" });
      removeBtn.onclick = e => {
        e.stopPropagation();
        localStorage.setItem("chatHistories", JSON.stringify(histories.filter(x => x.id !== h.id)));
        renderHistory();
      };
      card.append(left, removeBtn);
      historySection.appendChild(card);
    });
  };

  const showWarning = () => {
    if (!warningEl) {
      warningEl = document.createElement("div");
      warningEl.textContent = `⚠️ Demo limit reached. Please start a new chat.`;
      Object.assign(warningEl.style, {
        background: "black",
        padding: "1rem",
        border: "var(--border)",
        borderRadius: "var(--radius-rounded)",
        color: "red",
        textAlign: "center",
        fontWeight: "bold",
        position: "absolute",
        bottom: "1rem",
        right: "1rem"

      });
      textarea.parentNode.insertBefore(warningEl, textarea);
    }
    textarea.disabled = true;
    textarea.placeholder = "";
    sendBtn.disabled = true;
  };

  const clearWarning = () => {
    if (warningEl) {
      warningEl.remove();
      warningEl = null;
    }
    textarea.disabled = false;
    textarea.placeholder = "Enter your query...";
    sendBtn.disabled = false;
  };

  const handleSend = () => {
    const text = textarea.value.trim();
    if (!text) return;

    if (requestCount >= MAX_REQUESTS) {
      showWarning();
      return;
    }

    if (welcomeMsgEl && chatSection.contains(welcomeMsgEl)) {
      chatSection.removeChild(welcomeMsgEl);
      welcomeMsgEl = null;
    }

    appendMessage(text, "user");
    textarea.value = "";
    showThinking();

    textarea.disabled = true;
    sendBtn.disabled = true;
    newIcon.disabled = true;
    historyIcon.disabled = true;
    textarea.placeholder = " ";
    textarea.classList.add("dimmed");
    sendBtn.classList.add("dimmed");
    newIcon.classList.add("dimmed");
    historyIcon.classList.add("dimmed");

    requestCount++;

    const messages = currentChat.map(m => ({
      role: m.type === "user" ? "user" : "ai",
      content: m.text
    }));

    fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    })
      .then(res => {
        if (!res.ok) throw new Error("Server not available");

        const reader = res.body.getReader();
        let aiMsgEl = renderMessage("", "ai");
        let decoder = new TextDecoder();
        let buffer = "";
        let hasStarted = false;

        function read() {
          reader.read().then(({ done, value }) => {
            if (done) {
              removeThinking();

              if (!buffer.trim()) {
                aiMsgEl.innerHTML = "<div style='color:red'>Error: LLM not responding!</div>";
              } else {
                currentChat.push({ text: buffer, type: "ai" });
                saveChatToHistory();
              }

              textarea.disabled = false;
              sendBtn.disabled = false;
              newIcon.disabled = false;
              historyIcon.disabled = false;
              textarea.placeholder = "Enter your query...";
              textarea.classList.remove("dimmed");
              sendBtn.classList.remove("dimmed");
              newIcon.classList.remove("dimmed");
              historyIcon.classList.remove("dimmed");

              textarea.focus();

              if (requestCount >= MAX_REQUESTS) {
                showWarning();
              }
              return;
            }


            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            if (!hasStarted) {
              removeThinking();
              hasStarted = true;
            }

            aiMsgEl.innerHTML = marked.parse(buffer);

            const threshold = 90;
            const isAtBottom =
              chatSection.scrollHeight - chatSection.scrollTop - chatSection.clientHeight < threshold;

            if (isAtBottom) {
              chatSection.scrollTop = chatSection.scrollHeight;
            }

            read();
          });
        }

        read();
      })

      .catch(err => {
        console.error("Chat backend error:", err);
        appendMessage("<div style='color:red'>Error: No Server Running!</div>Please contact me to view a live demo.", "ai");
        saveChatToHistory();

        // Re-enable controls
        textarea.disabled = false;
        sendBtn.disabled = false;
        newIcon.disabled = false;
        historyIcon.disabled = false;
        textarea.placeholder = "Enter your query...";
        textarea.classList.remove("dimmed");
        sendBtn.classList.remove("dimmed");
        newIcon.classList.remove("dimmed");
        historyIcon.classList.remove("dimmed");

        textarea.focus();
        removeThinking();

      });
  };

  chatIcon.addEventListener("click", async () => {
    chatContainer = document.querySelector(".chat-container");
    if (!chatContainer) {
      try {
        const html = await (await fetch("static/content/chat.html")).text();
        chatContainer = new DOMParser().parseFromString(html, "text/html").body.firstChild;
        contentWrapper.appendChild(chatContainer);
        chatSection = chatContainer.querySelector(".chat-section");
        textarea = chatContainer.querySelector(".chat-container-input");
        sendBtn = chatContainer.querySelector(".send-icon");
        historyIcon = chatContainer.querySelector(".history-icon");
        historySection = chatContainer.querySelector(".history-section");
        newIcon = chatContainer.querySelector(".new-icon");

        sendBtn.onclick = handleSend;
        textarea.onkeydown = e => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        };
        historyIcon.onclick = () => {
          historySection.classList.toggle("hidden");
          if (!historySection.classList.contains("hidden")) renderHistory();
        };

        newIcon.onclick = () => {
          saveChatToHistory();
          chatSection.innerHTML = "";
          currentChat = [];
          currentChatId = null;
          requestCount = 0;
          clearWarning();
          welcomeMsgEl = renderMessage(WELCOME_MESSAGE, "ai");
          textarea.value = "";
          textarea.focus();
        };
        renderHistory();
      } catch (err) {
        console.error("Error loading chat.html:", err);
        return;
      }
    }
    chatContainer.classList.toggle("hidden");

    if (firstOpen && !chatContainer.classList.contains("hidden")) {
      welcomeMsgEl = renderMessage(WELCOME_MESSAGE, "ai");
      firstOpen = false;
    }

    if (!chatContainer.classList.contains("hidden")) textarea.focus();
  });

  document.addEventListener("click", e => {
    chatContainer = document.querySelector(".chat-container");
    if (!chatContainer) return;
    historySection = chatContainer.querySelector(".history-section");
    historyIcon = chatContainer.querySelector(".history-icon");
    if (!chatContainer.classList.contains("hidden")) {
      if (!(chatContainer.contains(e.target) || chatIcon.contains(e.target))) {
        chatContainer.classList.add("hidden");
      }
    }
    if (historySection && !historySection.classList.contains("hidden")) {
      if (!(historySection.contains(e.target) || historyIcon.contains(e.target))) {
        historySection.classList.add("hidden");
      }
    }
  });
}

initChat();
