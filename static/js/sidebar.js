// ==============================
// Sidebar Setup Logic
// ==============================
function initializeSidebar(sectionElement) {
  const sidebar = sectionElement.querySelector(".section-sidebar");
  const sectionMain = sectionElement.querySelector(".section-main");
  const contentBlocks = sectionMain.querySelectorAll(".section-content");
  const sidebarItems = sidebar.querySelectorAll(".sidebar-item");
  let collapseTimeout;

  sidebarItems.forEach(item => {
    const icon = item.querySelector(".material-icons, .sidebar-icon");
    if (icon) icon.classList.remove("active");
  });

  contentBlocks.forEach(block => {
    block.classList.add("hidden");
    block.classList.remove("active");
  });

  sidebar.addEventListener("mouseenter", () => {
    clearTimeout(collapseTimeout);
    sidebar.classList.add("expanded");
  });

  sidebar.addEventListener("mouseleave", () => {
    collapseTimeout = setTimeout(() => {
      sidebar.classList.remove("expanded");
    }, 300);
  });

  sidebarItems.forEach(item => {
    item.addEventListener("click", () => {
      const topic = item.getAttribute("data-topic");

      sidebarItems.forEach(i => {
        const icon = i.querySelector(".material-icons, .sidebar-icon");
        if (icon) icon.classList.remove("active");
      });

      const clickedIcon = item.querySelector(".material-icons, .sidebar-icon");
      if (clickedIcon) clickedIcon.classList.add("active");

      activateContentBlock(topic, sectionMain, contentBlocks);
    });
  });

  const firstItem = sidebarItems[0];
  if (firstItem) {
    const topic = firstItem.getAttribute("data-topic");
    const firstIcon = firstItem.querySelector(".material-icons, .sidebar-icon");
    if (firstIcon) firstIcon.classList.add("active");
    activateContentBlock(topic, sectionMain, contentBlocks);
  }
}

// ==============================
// Content Activation Logic
// ==============================
function activateContentBlock(topic, sectionMain, contentBlocks) {
  contentBlocks.forEach(block => {
    block.classList.add("hidden");
    block.classList.remove("active");
  });

  // Show selected block
  const activeBlock = sectionMain.querySelector(`.section-content[data-content="${topic}"]`);

  if (activeBlock) {
    activeBlock.classList.remove("hidden");
    activeBlock.classList.add("active");

    // 🎯 Initialize timeline only when "journey" is activated
    if (topic === "journey") {
      initJourney(activeBlock);
    }

    // 🎯 Initialize carousel only when "interests" is activated
    if (topic === "interests") {
      initInterests(activeBlock);
    }

    // 🎯 Initialize sticky Skills stack only when "skills" is activated
    if (topic === "skills") {
      initSkills(activeBlock);
    }
      // 🎯 Initialize sticky Skills stack only when "skills" is activated
    if (topic === "tools") {
      initTools(activeBlock);
    }
  }
}

