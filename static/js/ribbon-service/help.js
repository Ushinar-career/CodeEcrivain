function showLoader() {
    document.querySelector('.global-loader').classList.remove('hidden');
    document.querySelector('.code-ecrivain-help').classList.add('hidden');
}

function hideLoader() {
    document.querySelector('.global-loader').classList.add('hidden');
    document.querySelector('.code-ecrivain-help').classList.remove('hidden');
}

async function loadMarkdown() {
    const content = document.querySelector(".help-content");
    try {
        const res = await fetch("README.md");
        if (!res.ok) throw new Error(res.statusText);
        const text = await res.text();
        content.innerHTML = marked.parse(text);

        const headings = content.querySelectorAll("h1,h2,h3,h4,h5,h6");
        const links = document.querySelector(".help-sidebar-links");
        links.innerHTML = "";
        headings.forEach((h, i) => {
            if (!h.id) {
                const slug = h.textContent
                    .toLowerCase()
                    .trim()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-');
                h.id = slug || `heading-${i}`;
            }

            const a = document.createElement("a");
            a.textContent = h.textContent;
            a.className = `topic-link level-${h.tagName.substring(1)}`;
            a.href = `#${h.id}`;
            links.appendChild(a);
        });

        enableSmoothScroll();
        content.scrollTop = 0;
    } catch (err) {
        console.error("Failed to load markdown:", err);
        content.textContent = "Error loading help content.";
    }
}

function initSidebarToggle() {
    const btn = document.querySelector(".help-sidebar-toggle");
    const sidebar = document.querySelector(".help-sidebar");
    btn.onclick = () => { sidebar.classList.toggle("collapsed"); };
}

function setSidebarInitialState() {
    const sidebar = document.querySelector(".help-sidebar");
    if (window.innerWidth <= 900) {
        sidebar.classList.add("collapsed");
    } else {
        sidebar.classList.remove("collapsed");
    }
}

function enableSmoothScroll() {
    document.querySelectorAll(".topic-link").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute("href"));
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });
}

function initContentClickCollapse() {
    const content = document.querySelector(".help-content");
    const sidebar = document.querySelector(".help-sidebar");

    content.addEventListener("click", () => {
        if (window.innerWidth <= 700) {
            sidebar.classList.add("collapsed");
        }
    });
}

function initSearch() {
  const searchInput = document.getElementById("help-search");
  const content = document.querySelector(".help-content");

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    const elements = content.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li");

    // Clear previous highlights
    elements.forEach(el => {
      el.innerHTML = el.textContent;
    });

    if (query.length > 0) {
      elements.forEach(el => {
        if (el.textContent.toLowerCase().includes(query)) {
          // Highlight matches
          const regex = new RegExp(`(${query})`, "gi");
          el.innerHTML = el.textContent.replace(regex, `<mark>$1</mark>`);
        }
      });
    }
  });
}

window.addEventListener("DOMContentLoaded", async () => {
    showLoader();
    await loadMarkdown();
    initSidebarToggle();
    setSidebarInitialState();
    initContentClickCollapse();
    hideLoader();
});

window.addEventListener("resize", setSidebarInitialState);
