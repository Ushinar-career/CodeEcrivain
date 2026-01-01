// ==============================
// Global Cursor Logic
// ==============================
  function initLivingCursor() {
  // Set <html> style to "cursor: none;"
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const DOT_COUNT   = 50;
  const CHASE_SPEED = 0.5;
  const IDLE_DELAY  = 500;
  const WOBBLE      = 0.5;

  // Read colors from :root
  const styles = getComputedStyle(document.documentElement);
  const PRIMARY_COLOR = styles.getPropertyValue('--primary-color').trim();
  const HOVER_COLOR   = styles.getPropertyValue('--hover-color').trim();

  // Create container
  let container = document.querySelector('.global-cursor');
  if (!container) {
    container = document.createElement('div');
    container.className = 'global-cursor';
    document.body.appendChild(container);
  }

  Object.assign(container.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    overflow: 'hidden',
    cursor: 'none',
    display: 'flex',
    mixBlendMode: 'difference',
    zIndex: '9999'
  });

  // Set initial CSS variable for cursor color
  document.documentElement.style.setProperty('--cursor-color', PRIMARY_COLOR);

  // SVG filter
  const svgFilter = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgFilter.setAttribute('width', '0');
  svgFilter.setAttribute('height', '0');
  svgFilter.innerHTML = `
    <defs>
      <filter id="goo">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
        <feColorMatrix in="blur" mode="matrix"
          values="1 0 0 0 0  
                  0 1 0 0 0  
                  0 0 1 0 0  
                  0 0 0 35 -15" result="goo"/>
        <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
      </filter>
    </defs>
  `;
  container.appendChild(svgFilter);

  // Dot container
  const cursorEl = document.createElement('div');
  cursorEl.className = 'cursor';
  Object.assign(cursorEl.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    filter: 'url(#goo)',
    pointerEvents: 'none'
  });
  container.appendChild(cursorEl);

  // Ripple container
  const rippleLayer = document.createElement('div');
  rippleLayer.className = 'ripple-container';
  Object.assign(rippleLayer.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none'
  });
  container.appendChild(rippleLayer);

  const dots = [];
  let mouseX = innerWidth / 2,
      mouseY = innerHeight / 2,
      idle   = false,
      idleTimer;

  class Dot {
    constructor(i) {
      this.index = i;
      this.x = mouseX;
      this.y = mouseY;
      this.angleX = 0;
      this.angleY = 0;
      this.angleSpeed = 0.03;
      const scale = 0.9 - (i / DOT_COUNT) * 1;
      this.range = WOBBLE / 3 - (WOBBLE / 3 * scale) + 3;
      this.lockX = this.x;
      this.lockY = this.y;

      this.el = document.createElement('span');
      this.el.classList.add('dot');
      Object.assign(this.el.style, {
        position: 'absolute',
        width: '1rem',
        height: '1rem',
        borderRadius: '50%',
        backgroundColor: 'var(--cursor-color)',
        transform: `translate(-50%,-50%) scale(${scale * 0.9})`,
        opacity: `${1 - i / DOT_COUNT}`,
        transition: 'background-color 1.5s ease'
      });
      cursorEl.appendChild(this.el);
    }

    lockPosition() {
      this.lockX = this.x;
      this.lockY = this.y;
      this.angleX = Math.random() * Math.PI * 3;
      this.angleY = Math.random() * Math.PI * 3;
    }

    update() {
      const target = this.index === 0
        ? { x: mouseX, y: mouseY }
        : { x: dots[this.index - 1].x, y: dots[this.index - 1].y };

      if (!idle) {
        this.x += (target.x - this.x) * CHASE_SPEED;
        this.y += (target.y - this.y) * CHASE_SPEED;
      } else {
        this.angleX += this.angleSpeed;
        this.angleY += this.angleSpeed;
        this.x = this.lockX + Math.sin(this.angleX) * this.range;
        this.y = this.lockY + Math.sin(this.angleY) * this.range;
      }

      this.el.style.left = `${this.x}px`;
      this.el.style.top = `${this.y}px`;
    }
  }

  class Ripple {
    constructor(x, y) {
      this.el = document.createElement('span');
      this.el.classList.add('ripple');
      Object.assign(this.el.style, {
        position: 'absolute',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: 'var(--cursor-color)',
        opacity: '1',
        transform: 'translate(-50%, -50%) scale(0)',
        transition: 'transform 0.6s ease-out, opacity 0.6s ease-out',
        filter: 'none',
        left: `${x}px`,
        top: `${y}px`
      });
      rippleLayer.appendChild(this.el);

      requestAnimationFrame(() => {
        this.el.style.transform = 'translate(-50%, -50%) scale(2)';
        this.el.style.opacity = '0';
      });

      setTimeout(() => {
        rippleLayer.removeChild(this.el);
      }, 600);
    }
  }

  function resetIdle() {
    clearTimeout(idleTimer);
    idle = false;
    idleTimer = setTimeout(() => {
      idle = true;
      dots.forEach(d => d.lockPosition());
    }, IDLE_DELAY);
  }

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    resetIdle();
  });

  window.addEventListener('mousedown', e => {
    if (e.button === 0) new Ripple(mouseX, mouseY);
  });

  for (let i = 0; i < DOT_COUNT; i++) {
    dots.push(new Dot(i));
  }

  // Toggle CSS variable every 3 seconds
  let usePrimary = true;
  setInterval(() => {
    usePrimary = !usePrimary;
    document.documentElement.style.setProperty(
      '--cursor-color',
      usePrimary ? PRIMARY_COLOR : HOVER_COLOR
    );
  }, 3000);

  resetIdle();
  (function animate() {
    dots.forEach(d => d.update());
    requestAnimationFrame(animate);
  })();
}

initLivingCursor();

// ==============================
// Global Loader Logic
// ==============================
function showLoader(loaderSelector = '.global-loader', appSelector = '.app-container') {
  const loader = document.querySelector(loaderSelector);
  const app = document.querySelector(appSelector);

  if (loader) loader.classList.remove('hidden');
  if (app) app.classList.add('hidden');
}

function hideLoader(loaderSelector = '.global-loader', appSelector = '.app-container') {
  const loader = document.querySelector(loaderSelector);
  const app = document.querySelector(appSelector);

  if (loader) loader.classList.add('hidden');
  if (app) app.classList.remove('hidden');
}

// ==============================
// Height Guard Logic
// ==============================

function initHeightGuard(container, options = {}) {
  const threshold = options.threshold || 400;
  const message = options.message || 
    "❌ Error: Window height is too small to display all sections properly! Please zoom-out or increase window height vertically.";

  // Create notification element if not already present
  let notice = document.querySelector(".height-notice");
  if (!notice) {
    notice = document.createElement("div");
    notice.className = "height-notice";
    notice.textContent = message;
    document.body.appendChild(notice);

    // Inject styles dynamically
    const style = document.createElement("style");
    style.textContent = `
      .height-notice {
        display: none;
        position: fixed;
        bottom: 1rem;
        align-self: center;
        text-align: center;
        padding: 0.75rem 1.25rem;
        background-color: black;
        color: red;
        border-radius: 0.5rem;
        border: 0.1rem solid #5dade2;
      }
    `;
    document.head.appendChild(style);
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

  // Run on load and resize
  window.addEventListener("resize", checkHeight);
  window.addEventListener("load", checkHeight);
  checkHeight();
}

function initHelp() {
  const helpBtn = document.querySelector(".help-btn");
  helpBtn.addEventListener("click", () => {
    // Open help.html from static/content/
    window.open("help.html", "_blank");
  });
}

// Initialize
initHelp();




