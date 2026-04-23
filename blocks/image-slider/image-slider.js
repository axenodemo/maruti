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

function buildSlide(row, index) {
  const picture = row.querySelector('picture');
  const heading = row.querySelector('h3, h2');
  const paragraphs = Array.from(row.querySelectorAll('p'));

  const slide = document.createElement('div');
  slide.className = 'image-slider-slide';
  if (index === 0) slide.classList.add('active');

  // Background image
  if (picture) {
    const bg = document.createElement('div');
    bg.className = 'image-slider-slide-bg';
    bg.append(picture);
    slide.append(bg);
  }

  // Content overlay
  const content = document.createElement('div');
  content.className = 'image-slider-slide-content';

  // Slide number
  const num = document.createElement('span');
  num.className = 'image-slider-slide-num';
  num.textContent = String(index + 1).padStart(2, '0');
  content.append(num);

  // Title
  if (heading) {
    const title = document.createElement('h3');
    title.className = 'image-slider-slide-title';
    title.textContent = heading.textContent;
    content.append(title);
  }

  // Description
  const desc = paragraphs.find((p) => p.textContent.trim().length > 0);
  if (desc) {
    const descEl = document.createElement('p');
    descEl.className = 'image-slider-slide-desc';
    descEl.textContent = desc.textContent;
    content.append(descEl);
  }

  slide.append(content);
  return slide;
}

function setupFadeInOnScroll(block) {
  const section = block.closest('.section');
  if (!section) return;

  section.classList.add('fade-in');

  // Use requestAnimationFrame to ensure class is applied before observing
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

  // Build slides
  const slidesWrap = document.createElement('div');
  slidesWrap.className = 'image-slider-slides';

  const slides = rows.map((row, i) => buildSlide(row, i));
  slides.forEach((s) => slidesWrap.append(s));

  // Clear and rebuild
  block.textContent = '';

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

    slides[current].classList.remove('active');
    slides[target].classList.add('active');

    const bars = progressBars.querySelectorAll('.image-slider-progress-bar');
    bars[current].classList.remove('active');
    bars[target].classList.add('active');

    current = target;
  }

  container.addEventListener('prev', () => goTo(current - 1));
  container.addEventListener('next', () => goTo(current + 1));
  container.addEventListener('goto', (e) => goTo(e.detail));

  block.append(container);

  // Fade-in on scroll
  setupFadeInOnScroll(block);
}
