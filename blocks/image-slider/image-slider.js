function decorateSlide(row, index) {
  row.classList.add('image-slider-slide');
  if (index === 0) row.classList.add('active');

  const cols = Array.from(row.querySelectorAll(':scope > div'));
  const imageCol = cols[0];
  const textCol = cols[1];

  if (imageCol) imageCol.classList.add('image-slider-slide-bg');
  if (textCol) {
    textCol.classList.add('image-slider-slide-content');

    // Add slide number
    const num = document.createElement('span');
    num.className = 'image-slider-slide-num';
    num.textContent = String(index + 1).padStart(2, '0');
    textCol.prepend(num);

    // Style heading and paragraph
    const h3 = textCol.querySelector('h3');
    if (h3) h3.classList.add('image-slider-slide-title');
    const p = textCol.querySelector('p');
    if (p) p.classList.add('image-slider-slide-desc');
  }
}

function buildProgressBars(count, container) {
  const barsWrap = document.createElement('div');
  barsWrap.className = 'image-slider-progress';

  Array.from({ length: count }).forEach((_, i) => {
    const bar = document.createElement('button');
    bar.className = 'image-slider-progress-bar';
    if (i === 0) bar.classList.add('active');
    bar.setAttribute('aria-label', `Go to slide ${i + 1}`);
    bar.addEventListener('click', () => {
      container.dispatchEvent(new CustomEvent('goto', { detail: i }));
    });
    barsWrap.append(bar);
  });

  return barsWrap;
}

function buildNavArrows(container) {
  const nav = document.createElement('div');
  nav.className = 'image-slider-nav';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'image-slider-nav-btn';
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  prevBtn.addEventListener('click', () => {
    container.dispatchEvent(new CustomEvent('prev'));
  });

  const nextBtn = document.createElement('button');
  nextBtn.className = 'image-slider-nav-btn';
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  nextBtn.addEventListener('click', () => {
    container.dispatchEvent(new CustomEvent('next'));
  });

  nav.append(prevBtn, nextBtn);
  return nav;
}

function setupFadeInOnScroll(block) {
  const section = block.closest('.section');
  if (!section) return;

  section.classList.add('fade-in');

  requestAnimationFrame(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          section.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(section);
  });
}

export default function decorate(block) {
  const rows = Array.from(block.querySelectorAll(':scope > div'));
  const slideCount = rows.length;

  // Wrap rows in a slides container (MOVE, preserve DOM)
  const slidesWrap = document.createElement('div');
  slidesWrap.className = 'image-slider-slides';

  rows.forEach((row, i) => {
    decorateSlide(row, i);
    slidesWrap.append(row);
  });

  const container = document.createElement('div');
  container.className = 'image-slider-container';
  container.append(slidesWrap);

  // Progress bars
  const progressBars = buildProgressBars(slideCount, container);
  container.append(progressBars);

  // Nav arrows
  const nav = buildNavArrows(container);
  container.append(nav);

  // Slide state
  let current = 0;

  function goTo(idx) {
    let target = idx;
    if (target < 0) target = slideCount - 1;
    if (target >= slideCount) target = 0;

    rows[current].classList.remove('active');
    rows[target].classList.add('active');

    const bars = progressBars.querySelectorAll('.image-slider-progress-bar');
    bars[current].classList.remove('active');
    bars[target].classList.add('active');

    current = target;
  }

  container.addEventListener('prev', () => goTo(current - 1));
  container.addEventListener('next', () => goTo(current + 1));
  container.addEventListener('goto', (e) => goTo(e.detail));

  block.append(container);

  setupFadeInOnScroll(block);
}
