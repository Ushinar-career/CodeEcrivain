
// ==============================
// Chat Logic
// ==============================
export async function initChat() {
  const chatIcon = document.querySelector(".chat-icon");
  const contentWrapper = document.querySelector(".code-ecrivain");
  let chatContainer, messagesSection, textarea, sendBtn, historyIcon, historySection, newIcon, warningEl;
  let currentChat = [], currentChatId = null;
  let firstOpen = true;
  let requestCount = 0;
  const MAX_REQUESTS = 3;
  let thinkingEl = null;
  let welcomeScreen;

  const showThinking = () => {
    if (thinkingEl) return;
    thinkingEl = renderMessage("<span class='thinking-inline'>Thinking <span class='dots'></span></span>", "ai");

    messagesSection.appendChild(thinkingEl);

    messagesSection.scrollTop = messagesSection.scrollHeight;
  };

  const removeThinking = () => {
    if (thinkingEl && messagesSection.contains(thinkingEl)) {
      thinkingEl.remove();
    }
    thinkingEl = null;
  };

  const renderMessage = (text, type) => {
    const msg = document.createElement("div");
    msg.classList.add("message", type);
    msg.innerHTML = type === "ai" ? marked.parse(text) : text;
    messagesSection.appendChild(msg);
    messagesSection.scrollTop = messagesSection.scrollHeight;
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
    historySection.innerHTML = histories.length ? "" : '<p class="global-text-base" style="padding:1rem;">No history yet.</p>';
    histories.slice().reverse().forEach(h => {
      const card = document.createElement("div");
      card.classList.add("history-card");
      const left = document.createElement("div");
      left.style.flex = "1";
      left.innerHTML = `
        <div class="history-title global-text-base" style="cursor:pointer; color:var(--hover-color);">
          ${h.firstMessage.length > 30 ? h.firstMessage.slice(0, 30) + "..." : h.firstMessage}
        </div>
        <div class="history-time" style="cursor:pointer; color:var(--primary-color);">
          Started: ${h.timestamp}
        </div>`;
      left.onclick = () => {
        saveChatToHistory();
        messagesSection.innerHTML = "";
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

  function showWelcome() {
    if (welcomeScreen) welcomeScreen.classList.remove("hidden");
  }

  function hideWelcome() {
    if (welcomeScreen) welcomeScreen.classList.add("hidden");
  }

  const handleSend = () => {
    const text = textarea.value.trim();
    if (!text) return;

    if (requestCount >= MAX_REQUESTS) {
      showWarning();
      return;
    }
    hideWelcome();
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
    console.log(messages)

    fetch("http://127.0.0.1:5000/chat", {
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

            const threshold = 60;
            const isAtBottom =
              messagesSection.scrollHeight - messagesSection.scrollTop - messagesSection.clientHeight < threshold;

            if (isAtBottom) {
              messagesSection.scrollTop = messagesSection.scrollHeight;
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

        messagesSection = chatContainer.querySelector(".chat-container-messages-section");
        textarea = chatContainer.querySelector(".chat-container-input");
        sendBtn = chatContainer.querySelector(".send-icon");
        historyIcon = chatContainer.querySelector(".history-icon");
        historySection = chatContainer.querySelector(".chat-history-container");
        newIcon = chatContainer.querySelector(".new-icon");

        let scrollDownBtn = document.createElement("button");
        scrollDownBtn.textContent = "arrow_circle_down";
        scrollDownBtn.classList.add("material-icons", "scroll-down-btn");
        scrollDownBtn.title = "Scroll to bottom";
        chatContainer.appendChild(scrollDownBtn);
        welcomeScreen = chatContainer.querySelector(".chat-container-messages-section-welcome-screen");

        scrollDownBtn.onclick = () => {
          messagesSection.scrollTo({
            top: messagesSection.scrollHeight,
            behavior: "smooth"
          });
          scrollDownBtn.classList.remove("visible");
        };

        const toggleScrollBtn = () => {
          const threshold = 50;
          const isAtBottom =
            messagesSection.scrollHeight - messagesSection.scrollTop - messagesSection.clientHeight < threshold;
          if (isAtBottom) {
            scrollDownBtn.classList.remove("visible");
          } else {
            scrollDownBtn.classList.add("visible");
          }
        };
        messagesSection.addEventListener("scroll", toggleScrollBtn);

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
          messagesSection.innerHTML = "";
          messagesSection.appendChild(welcomeScreen);
          showWelcome();
          currentChat = [];
          currentChatId = null;
          requestCount = 0;
          clearWarning();
          textarea.value = "";
          textarea.focus();
          scrollDownBtn.classList.remove("visible");
        };

        renderHistory();
      } catch (err) {
        console.error("Error loading chat.html:", err);
        return;
      }
    }

    chatContainer.classList.toggle("hidden");
    if (firstOpen && !chatContainer.classList.contains("hidden")) {
      showWelcome();
      firstOpen = false;
    }
    if (!chatContainer.classList.contains("hidden")) textarea.focus();
  });

  document.addEventListener("click", e => {
    chatContainer = document.querySelector(".chat-container");
    if (!chatContainer) return;

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
