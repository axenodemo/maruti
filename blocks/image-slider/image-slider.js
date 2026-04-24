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

/**
 * Split text into word spans for scroll-linked color reveal.
 * Each word transitions from rgba(0,0,0,0.2) → rgba(0,0,0,1)
 * as it enters the viewport, using IntersectionObserver with
 * threshold steps [0, 0.25, 0.5, 0.75, 1].
 */
function setupTextReveal(section) {
  const h2 = section.querySelector('.default-content-wrapper h2');
  if (!h2) return;

  // Split h2 into word spans (preserve <em> structure)
  const wrapWords = (node) => {
    const frag = document.createDocumentFragment();
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const words = child.textContent.split(/(\s+)/);
        words.forEach((w) => {
          if (w.trim()) {
            const span = document.createElement('span');
            span.className = 'reveal-word';
            span.style.color = 'rgb(0 0 0 / 20%)';
            span.style.transition = 'color 300ms ease-out';
            span.textContent = w;
            frag.append(span);
          } else if (w) {
            frag.append(document.createTextNode(w));
          }
        });
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const clone = child.cloneNode(false);
        clone.append(wrapWords(child));
        frag.append(clone);
      }
    });
    return frag;
  };

  const wrapped = wrapWords(h2);
  h2.textContent = '';
  h2.append(wrapped);

  const allWords = Array.from(h2.querySelectorAll('.reveal-word'));
  const totalWords = allWords.length;

  // IntersectionObserver with threshold steps
  const thresholds = [0, 0.25, 0.5, 0.75, 1];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const ratio = entry.intersectionRatio;
      // Map ratio to how many words should be fully revealed
      const revealCount = Math.floor(ratio * totalWords);

      allWords.forEach((word, i) => {
        if (i < revealCount) {
          word.style.color = 'rgb(0 0 0 / 100%)';
        } else if (i === revealCount) {
          // Partially reveal the current word
          const partial = (ratio * totalWords) - revealCount;
          const opacity = 0.2 + (partial * 0.8);
          word.style.color = `rgb(0 0 0 / ${Math.round(opacity * 100)}%)`;
        } else {
          word.style.color = 'rgb(0 0 0 / 20%)';
        }
      });
    });
  }, { threshold: thresholds });

  observer.observe(h2);
}

function setupFadeInOnScroll(block) {
  const section = block.closest('.section');
  if (!section) return;

  // Text reveal animation for the large statement
  setupTextReveal(section);

  // Section fade-in
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
