/**
 * Stats block — scroll-hijacked 2-slide horizontal panel.
 * Slide 1: statement text (left) + car image (right)
 * Slide 2: stats counters with count-up animation
 *
 * xwalk model (3 rows):
 *   Row 1: image (background)
 *   Row 2: carImage (aerial car)
 *   Row 3: text (statement + stats lines as "Number | Label")
 */

function parseStats(text) {
  const parts = text.split('|').map((p) => p.trim());
  if (parts.length === 2) return { number: parts[0], label: parts[1] };
  return null;
}

function parseNumber(str) {
  const clean = str.replace(/[+,]/g, '').trim();
  let multiplier = 1;
  if (clean.includes('M')) multiplier = 1000000;
  else if (clean.includes('K')) multiplier = 1000;
  const num = parseFloat(clean.replace(/[MK]/g, ''));
  return { value: num * multiplier, suffix: str.includes('+') ? '+' : '', raw: str };
}

function formatNumber(val, raw) {
  if (raw.includes('M')) {
    const m = val / 1000000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (raw.includes('K')) return `${Math.round(val / 1000)}K`;
  return `${Math.round(val)}`;
}

function easeOutQuad(t) {
  return t * (2 - t);
}

function animateCounter(el, target, duration, delay) {
  const { value, suffix, raw } = parseNumber(target);
  el.textContent = '0';

  setTimeout(() => {
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuad(progress);
      const current = eased * value;
      el.textContent = `${formatNumber(current, raw)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, delay);
}

function buildSlide1(statement, carPicture) {
  const slide = document.createElement('div');
  slide.className = 'stats-slide stats-slide-1';

  const textWrap = document.createElement('div');
  textWrap.className = 'stats-slide1-text';
  if (statement) {
    statement.classList.add('stats-statement');
    textWrap.append(statement);
  }
  slide.append(textWrap);

  const carWrap = document.createElement('div');
  carWrap.className = 'stats-slide1-car';
  if (carPicture) carWrap.append(carPicture);
  slide.append(carWrap);

  return slide;
}

function buildSlide2(stats) {
  const slide = document.createElement('div');
  slide.className = 'stats-slide stats-slide-2';

  const grid = document.createElement('div');
  grid.className = 'stats-counters';

  stats.forEach((stat, i) => {
    const item = document.createElement('div');
    item.className = 'stats-counter-item';

    const num = document.createElement('span');
    num.className = 'stats-counter-number';
    num.textContent = '0';
    num.dataset.target = stat.number;
    num.dataset.duration = String(800 + i * 200);
    num.dataset.delay = String(i * 150);

    const label = document.createElement('span');
    label.className = 'stats-counter-label';
    label.textContent = stat.label;

    item.append(num, label);
    grid.append(item);
  });

  slide.append(grid);
  return slide;
}

function buildNav(block, track, slideCount) {
  const nav = document.createElement('div');
  nav.className = 'stats-nav';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'stats-nav-btn';
  prevBtn.setAttribute('aria-label', 'Previous');
  prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'stats-nav-btn';
  nextBtn.setAttribute('aria-label', 'Next');
  nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  let current = 0;
  let countersAnimated = false;

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, slideCount - 1));
    track.style.transform = `translateX(-${current * 100}vw)`;

    // Trigger counter animation on slide 2
    if (current === 1 && !countersAnimated) {
      countersAnimated = true;
      block.querySelectorAll('.stats-counter-number').forEach((el) => {
        animateCounter(
          el,
          el.dataset.target,
          parseInt(el.dataset.duration, 10),
          parseInt(el.dataset.delay, 10),
        );
      });
      // Animate labels after numbers
      block.querySelectorAll('.stats-counter-label').forEach((el, i) => {
        const numDuration = 800 + i * 200;
        const numDelay = i * 150;
        setTimeout(() => el.classList.add('visible'), numDelay + numDuration);
      });
    }

    // Animate slide 1 elements
    if (current === 0) {
      block.querySelector('.stats-slide1-car')?.classList.add('visible');
      block.querySelector('.stats-slide1-text')?.classList.add('visible');
    }
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  nav.append(prevBtn, nextBtn);
  block.append(nav);

  return goTo;
}

function setupScrollHijack(block, goTo) {
  const isMobile = window.innerWidth < 768;
  if (isMobile) return;

  let hijacked = false;
  let scrollStart = 0;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
        if (!hijacked) {
          hijacked = true;
          scrollStart = window.scrollY;
          goTo(0);
        }
      }
    });
  }, { threshold: [0, 0.5, 1] });

  observer.observe(block);

  window.addEventListener('scroll', () => {
    if (!hijacked) return;
    const scrollDelta = window.scrollY - scrollStart;
    const blockHeight = block.offsetHeight;

    if (scrollDelta > blockHeight * 0.5) {
      goTo(1);
    } else {
      goTo(0);
    }

    if (scrollDelta > blockHeight * 1.2) {
      hijacked = false;
    }
    if (window.scrollY < scrollStart - 100) {
      hijacked = false;
    }
  }, { passive: true });
}

export default function decorate(block) {
  const rows = Array.from(block.querySelectorAll(':scope > div'));

  // Row 1: background image
  const bgRow = rows[0];
  if (bgRow) bgRow.classList.add('stats-bg-row');
  const bgCol = bgRow ? bgRow.querySelector(':scope > div') : null;
  if (bgCol) bgCol.classList.add('stats-bg');

  // Row 2: car image (authorable)
  const carRow = rows[1];
  const carPicture = carRow ? carRow.querySelector('picture') : null;
  if (carRow) carRow.style.display = 'none';

  // Row 3: text (statement + stats)
  const textRow = rows[2];
  let statementP = null;
  const stats = [];

  if (textRow) {
    textRow.style.display = 'none';
    const col = textRow.querySelector(':scope > div');
    if (col) {
      Array.from(col.querySelectorAll('p')).forEach((p) => {
        const text = p.textContent.trim();
        if (text.includes('|')) {
          const parsed = parseStats(text);
          if (parsed) stats.push(parsed);
        } else if (!statementP) {
          statementP = p;
        }
      });
    }
  }

  // Build slides
  const track = document.createElement('div');
  track.className = 'stats-track';

  const slide1 = buildSlide1(statementP, carPicture);
  const slide2 = buildSlide2(stats);

  track.append(slide1, slide2);

  // Dark overlay
  const overlay = document.createElement('div');
  overlay.className = 'stats-overlay';
  block.append(overlay);

  block.append(track);

  // Nav arrows
  const goTo = buildNav(block, track, 2);

  // Trigger slide 1 animations
  setTimeout(() => goTo(0), 100);

  // Scroll hijack (desktop/tablet only)
  setupScrollHijack(block, goTo);
}
