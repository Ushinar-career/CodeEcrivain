// ==============================
// Journey Visuals
// ==============================
let wiggleTimeout;
let wiggleActive = false;
let hasDragged = false;
let journeyDemoRunning = false;

function initJourney(container) {
  if (!container) return;

  const scrollable = container.querySelector('.journey-container');
  scrollable.scrollTo({ top: 0, behavior: 'smooth' });

  const steps = container.querySelectorAll('.journey-step');
  const svg = document.querySelector('.connector');

  function updateConnectors() {
    if (!svg) return;
    svg.innerHTML = '';
    const containerRect = svg.getBoundingClientRect();

    steps.forEach((step, i) => {
      if (i === steps.length - 1) return;
      const nextStep = steps[i + 1];
      const r1 = step.getBoundingClientRect();
      const r2 = nextStep.getBoundingClientRect();

      const x1 = r1.left + r1.width / 2 - containerRect.left;
      const y1 = r1.bottom - containerRect.top;
      const x2 = r2.left + r2.width / 2 - containerRect.left;
      const y2 = r2.top - containerRect.top;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("stroke", "var(--primary-color)");
      path.setAttribute("fill", "transparent");
      path.setAttribute("stroke-width", "1");
      path.setAttribute("d", `M${x1},${y1} C${x1},${(y1 + y2)/2} ${x2},${(y1 + y2)/2} ${x2},${y2}`);
      svg.appendChild(path);
    });
  }

  function enableHorizontalDrag() {
    steps.forEach(el => {
      let isDragging = false, startX, startLeft;

      function getClientX(e) {
        return e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
      }

      function onStart(e) {
        isDragging = true;
        startX = getClientX(e);
        const containerRect = el.parentElement.getBoundingClientRect();
        startLeft = el.getBoundingClientRect().left - containerRect.left;
        el.style.transform = "none";
        e.preventDefault();
      }

      function onMove(e) {
        if (!isDragging) return;
        const dx = getClientX(e) - startX;
        const containerRect = el.parentElement.getBoundingClientRect();
        const stepWidth = el.offsetWidth;
        const remToPx = (rem) => rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
        const margin = remToPx(3);
        let newLeft = startLeft + dx;
        newLeft = Math.max(margin, Math.min(newLeft, containerRect.width - stepWidth - margin));
        el.style.marginLeft = `${newLeft}px`;
        updateConnectors();
        e.preventDefault();
      }

      function onEnd() {
        isDragging = false;
      }

      el.addEventListener("mousedown", onStart);
      el.addEventListener("touchstart", onStart, { passive: false });
      document.addEventListener("mousemove", onMove);
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("mouseup", onEnd);
      document.addEventListener("touchend", onEnd);
    });
  }

  function runJourneyDemo() {
    if (journeyDemoRunning) return;
    const step = container.querySelector('.journey-step');
    if (!step) return;

    journeyDemoRunning = true;

    clearTimeout(wiggleTimeout);
    step.style.transition = "transform 0.3s ease";
    step.style.transform = "rotate(0deg)";
    step.style.removeProperty("border-color");

    wiggleActive = true;
    hasDragged = false;

    function wiggleLoop() {
      if (!wiggleActive) return;

      step.style.transition = "transform 0.3s ease";
      step.style.transform = "rotate(-3deg)";
      step.style.borderColor = "var(--hover-color";

      setTimeout(() => step.style.transform = "rotate(3deg)", 200);
      setTimeout(() => step.style.transform = "rotate(0deg)", 300);
      wiggleTimeout = setTimeout(wiggleLoop, 1500);
    }

    function stopWiggle() {
      wiggleActive = false;
      clearTimeout(wiggleTimeout);
      step.style.transition = "transform 0.3s ease";
      step.style.transform = "rotate(0deg)";
      step.style.removeProperty("border-color");
      journeyDemoRunning = false;
    }

    function resumeWiggle() {
      if (!hasDragged) {
        wiggleActive = true;
        wiggleLoop();
      }
    }

    let isDragging = false;

    function onStart() {
      isDragging = true;
    }

    function onMove() {
      if (isDragging && !hasDragged) {
        hasDragged = true;
        stopWiggle();
      }
    }

    function onEnd() {
      isDragging = false;
    }

    wiggleLoop();

    step.addEventListener("mouseenter", stopWiggle);
    step.addEventListener("mouseleave", resumeWiggle);
    step.addEventListener("mousedown", onStart);
    step.addEventListener("touchstart", onStart, { passive: false });
    document.addEventListener("mousemove", onMove);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchend", onEnd);
  }

  function resetStepPositions() {
    const containerRect = container.getBoundingClientRect();
    steps.forEach(step => {
      const stepWidth = step.offsetWidth;
      const centerX = (containerRect.width - stepWidth) / 2;
      step.style.marginLeft = `${centerX}px`;
    });
  }

  resetStepPositions();
  enableHorizontalDrag();
  runJourneyDemo();
  updateConnectors();

  window.addEventListener("resize", () => {
    resetStepPositions();
    updateConnectors();
  });
}

// ==============================
// Interests Visuals
// ==============================
function initInterests(container) {
  if (!container) return;
  const scrollable = container.querySelector('.interests-container');
  scrollable.scrollTo({ top: 0, behavior: 'smooth' });

  const track = container.querySelector('.carousel-track');
  const leftArrow = container.querySelector('.arrow-left');
  const rightArrow = container.querySelector('.arrow-right');
  const dotsContainer = container.querySelector('.carousel-dots');

  if (!track || !leftArrow || !rightArrow || !dotsContainer) return;

  // Cleanup if already initialized
  if (container._carouselCleanup) {
    container._carouselCleanup();
    container._carouselCleanup = null;
  }

  if (!container._originalTrackHTML) {
    container._originalTrackHTML = track.innerHTML;
  }
  track.innerHTML = container._originalTrackHTML;

  const originals = Array.from(track.querySelectorAll('.block'));
  const total = originals.length;
  if (total === 0) return;

  // Clone first and last for infinite loop
  const firstClone = originals[0].cloneNode(true);
  const lastClone = originals[total - 1].cloneNode(true);
  firstClone.dataset.clone = 'true';
  lastClone.dataset.clone = 'true';

  track.innerHTML = '';
  track.appendChild(lastClone);
  originals.forEach(el => track.appendChild(el));
  track.appendChild(firstClone);

  let index = 1;
  let isTransitioning = false;
  let isDragging = false;
  let startX = 0;

  const setTransform = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
  };
  const enableTransition = () => {
    track.style.transition = 'transform 1.5s ease';
  };
  const disableTransition = () => {
    track.style.transition = 'none';
  };
  const updatePosition = () => {
    isTransitioning = true;
    enableTransition();
    setTransform();
  };

  disableTransition();
  setTransform();

  // --- DOTS ---
  dotsContainer.innerHTML = '';
  const dots = [];
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot';
    if (i === 0) dot.classList.add('active');
    dotsContainer.appendChild(dot);
    dots.push(dot);

    dot.addEventListener('click', () => {
      if (isTransitioning) return;
      index = i + 1;
      updatePosition();
    });
  }

  function updateDots() {
    dots.forEach(dot => dot.classList.remove('active'));
    let logicalIndex = index - 1;
    if (logicalIndex >= total) logicalIndex = 0;
    if (logicalIndex < 0) logicalIndex = total - 1;
    dots[logicalIndex].classList.add('active');
  }

  // --- Transition End ---
  const onTransitionEnd = (e) => {
    if (e.propertyName && e.propertyName !== 'transform') return;
    if (index === 0) {
      disableTransition();
      index = total;
      setTransform();
      track.offsetHeight;
    } else if (index === total + 1) {
      disableTransition();
      index = 1;
      setTransform();
      track.offsetHeight;
    }
    scrollable.scrollTo({ top: 0, behavior: 'smooth' });
    requestAnimationFrame(() => {
      isTransitioning = false;
      updateDots();
    });
  };

  // --- Navigation ---
  const goLeft = () => {
    if (isTransitioning) return;
    index--;
    updatePosition();
  };
  const goRight = () => {
    if (isTransitioning) return;
    index++;
    updatePosition();
  };

  // --- Event Handlers ---
  const onLeftClick = () => goLeft();
  const onRightClick = () => goRight();
  const onLeftTouch = (e) => { if (!isTransitioning) { e.preventDefault(); goLeft(); } };
  const onRightTouch = (e) => { if (!isTransitioning) { e.preventDefault(); goRight(); } };

  const onMouseDown = (e) => { if (!isTransitioning) { isDragging = true; startX = e.clientX; } };
  const onMouseUp = (e) => {
    if (!isDragging) return;
    const endX = e.clientX;
    if (startX - endX > 10) goRight();
    else if (endX - startX > 10) goLeft();
    isDragging = false;
  };
  const onMouseLeave = () => { if (isDragging) isDragging = false; };
  const onTouchStart = (e) => { startX = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    if (startX - endX > 10) goRight();
    else if (endX - startX > 10) goLeft();
  };

  // --- Bind Events ---
  track.addEventListener('transitionend', onTransitionEnd);
  leftArrow.addEventListener('click', onLeftClick);
  rightArrow.addEventListener('click', onRightClick);
  leftArrow.addEventListener('touchstart', onLeftTouch, { passive: false });
  rightArrow.addEventListener('touchstart', onRightTouch, { passive: false });
  container.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);
  container.addEventListener('mouseleave', onMouseLeave);
  track.addEventListener('touchstart', onTouchStart, { passive: true });
  track.addEventListener('touchend', onTouchEnd);

  // --- Arrow State ---
  const setArrows = (enabled) => {
    const pointerValue = enabled ? 'auto' : 'none';
    const opacityValue = enabled ? '1' : '0.5';
    leftArrow.style.pointerEvents = pointerValue;
    rightArrow.style.pointerEvents = pointerValue;
    leftArrow.style.opacity = opacityValue;
    rightArrow.style.opacity = opacityValue;
  };
  container._setArrows = setArrows;

  // --- Cleanup ---
  container._carouselCleanup = () => {
    track.removeEventListener('transitionend', onTransitionEnd);
    leftArrow.removeEventListener('click', onLeftClick);
    rightArrow.removeEventListener('click', onRightClick);
    leftArrow.removeEventListener('touchstart', onLeftTouch);
    rightArrow.removeEventListener('touchstart', onRightTouch);
    container.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mouseup', onMouseUp);
    container.removeEventListener('mouseleave', onMouseLeave);
    track.removeEventListener('touchstart', onTouchStart);
    track.removeEventListener('touchend', onTouchEnd);
  };
}

// ==============================
// Skills Visuals
// ==============================
function initSkills(container) {
  const stack = container.querySelector(".stack");
  const scrollDown = container.querySelector(".scroll-down");
  const scrollUp = container.querySelector(".scroll-up");
  const panels = container.querySelectorAll(".panel");

  if (!stack || !scrollDown || !scrollUp || panels.length === 0) return;

  stack.scrollTo({ top: 0, behavior: "smooth" });

  scrollDown.classList.add("glow");
  scrollDown.addEventListener("click", () => {
    stack.scrollTo({ top: stack.scrollHeight, behavior: "smooth" });
  });

  const updatePanelVisuals = () => {
    const threshold = 150;
    const atTop = stack.scrollTop < threshold;
    const atBottom =
      stack.scrollTop + stack.clientHeight >= stack.scrollHeight - threshold;

    scrollDown.style.display = atTop ? "block" : "none";
    scrollUp.style.display = atBottom ? "block" : "none";

    const stackRect = stack.getBoundingClientRect();

    panels.forEach((panel, index) => {
      const rect = panel.getBoundingClientRect();
      const relativeTop = rect.top - stackRect.top;
      const progress = 1 - Math.min(Math.max(relativeTop / stack.clientHeight, 0), 1);

      panel.style.opacity = progress;

      const nextPanel = panels[index + 1];
      if (nextPanel) {
        const nextRect = nextPanel.getBoundingClientRect();
        const overlap = rect.bottom - nextRect.top;
        const fadeAmount = Math.min(Math.max(overlap / panel.offsetHeight, 0), 1);
        const textOpacity = 1 - fadeAmount;

        panel.style.opacity = textOpacity;
      }
    });
  };

  stack.addEventListener("scroll", updatePanelVisuals);
  updatePanelVisuals();

  scrollUp.addEventListener("click", () => {
    stack.scrollTo({ top: 0, behavior: "smooth" });
  });
}


// ==============================
// Tools Visuals
// ==============================
function initTools(section) {
  const scroller = section.querySelector('.tools-container');
  const scrollSpace = scroller.querySelector('.scroll-space');
  const cards = Array.from(section.querySelectorAll('.card'));
  const totalCards = cards.length;

  const scrollDown = section.querySelector('.scroll-down');
  const scrollUp = section.querySelector('.scroll-up');

  if (!scroller || !scrollSpace || !scrollDown || !scrollUp || totalCards === 0) return;

  const clamp01 = x => Math.max(0, Math.min(1, x));

  function setScrollHeight() {
    scrollSpace.style.height = `${scroller.clientHeight * (totalCards - 1)}px`;
  }

  function update() {
    const scrollY = scroller.scrollTop;
    const maxScroll = scroller.scrollHeight - scroller.clientHeight;

    const threshold = 150;
    const atTop = scrollY < threshold;
    const atBottom = scrollY + scroller.clientHeight >= scroller.scrollHeight - threshold;

    scrollDown.style.display = atTop ? "block" : "none";
    scrollUp.style.display = atBottom ? "block" : "none";

    const segmentSize = maxScroll / (totalCards - 1);
    let segmentIndex = Math.floor(scrollY / segmentSize);
    segmentIndex = Math.max(0, Math.min(totalCards - 1, segmentIndex));

    const segmentStart = segmentIndex * segmentSize;
    const p = clamp01((scrollY - segmentStart) / segmentSize);

    cards.forEach(card => {
      card.classList.remove('is-current','is-next','is-hidden','is-locked');
      card.style.setProperty('--p', 0);
    });

    if (scrollY >= maxScroll - 1) {
      cards.forEach((card, i) => {
        if (i === totalCards - 1) card.classList.add('is-locked');
        else card.classList.add('is-hidden');
      });
      return;
    }

    const current = cards[segmentIndex];
    const next = cards[segmentIndex + 1];

    current.classList.add('is-current');
    current.style.setProperty('--p', p);

    if (next) {
      next.classList.add('is-next');
      next.style.setProperty('--p', p);
    }

    cards.forEach(card => {
      if (card !== current && card !== next) card.classList.add('is-hidden');
    });
  }

  scrollDown.classList.add("glow");
  scrollDown.addEventListener("click", () => {
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
  });
  scrollUp.addEventListener("click", () => {
    scroller.scrollTo({ top: 0, behavior: "smooth" });
  });

  scroller.addEventListener('scroll', update);
  window.addEventListener('resize', () => {
    setScrollHeight();
    update();
  });

  cards.forEach(card => {
    card.addEventListener('wheel', e => {
      scroller.scrollTop += e.deltaY;
    }, { passive: true });
  });

  setScrollHeight();
  scroller.scrollTo({ top: 0, behavior: "smooth" });
  cards.forEach(card => card.classList.add('is-hidden'));
  cards[0].classList.remove('is-hidden');
  cards[0].classList.add('is-current');
  cards[0].style.setProperty('--p', 0);
  update();
}
