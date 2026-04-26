/**
 * Stats block — pinned section with scroll-linked car + stats marquee.
 *
 * On scroll: section pins, car moves horizontally from right edge to left,
 * stats marquee follows the car position in sync.
 *
 * xwalk model (3 rows):
 *   Row 1: image (background)
 *   Row 2: carImage (aerial car — partially visible on load, slides on scroll)
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

function easeOutQuad(t) { return t * (2 - t); }

function animateCounter(el, target, duration, delay) {
  const { value, suffix, raw } = parseNumber(target);
  el.textContent = '0';
  setTimeout(() => {
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = easeOutQuad(progress) * value;
      el.textContent = `${formatNumber(current, raw)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, delay);
}

function buildStatsMarquee(stats) {
  const marquee = document.createElement('div');
  marquee.className = 'stats-marquee';

  stats.forEach((stat, i) => {
    const item = document.createElement('div');
    item.className = 'stats-marquee-item';

    const num = document.createElement('span');
    num.className = 'stats-marquee-number';
    num.dataset.target = stat.number;
    num.dataset.delay = String(i * 150);
    num.dataset.duration = String(800 + i * 200);
    num.textContent = stat.number;

    const label = document.createElement('span');
    label.className = 'stats-marquee-label';
    label.textContent = stat.label;

    item.append(num, label);
    marquee.append(item);
  });

  return marquee;
}

function setupScrollAnimation(block, carWrap, marquee) {
  const section = block.closest('.section') || block;
  const travelDistance = window.innerWidth * 0.8;
  let countersAnimated = false;

  function onScroll() {
    const rect = section.getBoundingClientRect();
    const sectionH = section.offsetHeight;
    const vh = window.innerHeight;

    // Progress: 0 when top enters, 1 when bottom exits
    const total = sectionH + vh;
    const traveled = vh - rect.top;
    const progress = Math.min(Math.max(traveled / total, 0), 1);

    // Car: starts partially visible (30% in from right), moves left
    const carStart = travelDistance * 0.3;
    const carX = carStart - (progress * travelDistance);
    carWrap.style.transform = `translateX(${carX}px)`;

    // Marquee follows car but offset lower and slower
    const marqueeX = carStart * 0.8 - (progress * travelDistance * 0.7);
    marquee.style.transform = `translateX(${marqueeX}px)`;

    // Trigger counter animation when marquee becomes visible (~60% scroll)
    if (progress > 0.5 && !countersAnimated) {
      countersAnimated = true;
      block.querySelectorAll('.stats-marquee-number').forEach((el) => {
        animateCounter(
          el,
          el.dataset.target,
          parseInt(el.dataset.duration, 10),
          parseInt(el.dataset.delay, 10),
        );
      });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
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
          statementP = p.cloneNode(true);
        }
      });
    }
  }

  // Dark overlay
  const overlay = document.createElement('div');
  overlay.className = 'stats-overlay';
  block.append(overlay);

  // Statement text (bottom-left)
  if (statementP) {
    const stWrap = document.createElement('div');
    stWrap.className = 'stats-statement';
    statementP.classList.add('stats-statement-text');
    stWrap.append(statementP);
    block.append(stWrap);
  }

  // Car image (positioned right, scroll-animated)
  const carWrap = document.createElement('div');
  carWrap.className = 'stats-car';
  if (carPicture) carWrap.append(carPicture);
  block.append(carWrap);

  // Stats marquee (bottom, scroll-animated)
  const marquee = buildStatsMarquee(stats);
  block.append(marquee);

  // Scroll-linked animation
  setupScrollAnimation(block, carWrap, marquee);
}
