// static\js\utils.js
// ==============================
// Stylesheet Loader Logic
// ==============================
export async function loadCSS(name) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `./static/css/${name}`;

    link.onload = () => resolve(link.href);
    link.onerror = () => reject(new Error(`Failed to load CSS: ${link.href}`));

    document.head.appendChild(link);
  });
}


// ==============================
// Global Loader Logic
// ==============================
export function hideGlobalLoader() {
  console.log("# Hiding global loader...");    
  const loaderEl = document.querySelector('.global-loader');
  if (loaderEl) {
    loaderEl.remove();
  }
}



// ==============================
// Section Loader Logic
// ==============================
export function showSectionLoader(loaderEl, sectionEl) {
  if (loaderEl) loaderEl.classList.remove('hidden');
  if (sectionEl) sectionEl.classList.remove('active');
}

export function hideSectionLoader(loaderEl, sectionEl) {
  if (loaderEl) loaderEl.classList.add('hidden');
  if (sectionEl) sectionEl.classList.add('active');
}