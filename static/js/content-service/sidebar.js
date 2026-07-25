// ==============================
// Sidebar Setup Logic
// ==============================
function initializeSidebar(sectionElement) {
  const sidebar = sectionElement.querySelector(".main-section-sidebar");
  const sectionMain = sectionElement.querySelector(".main-section-container");
  const contentBlocks = sectionMain.querySelectorAll(".main-section-container-content");
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

  const activeBlock = sectionMain.querySelector(`.main-section-container-content[data-content="${topic}"]`);

  if (activeBlock) {
    activeBlock.classList.remove("hidden");
    activeBlock.classList.add("active");

    if (topic === "journey") {
      initJourney(activeBlock);
    }

    if (topic === "interests") {
      initInterests(activeBlock);
    }

    if (topic === "skills") {
      initSkills(activeBlock);
    }
    if (topic === "tools") {
      initTools(activeBlock);
    }
  }
}

