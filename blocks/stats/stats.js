/**
 * Stats block with scroll-linked horizontal animation.
 *
 * xwalk model (2 cells, each = 1 row with 1 column):
 *   Row 1: image → background image
 *   Row 2: text → richtext containing:
 *     - Statement paragraph
 *     - Car top-view picture (embedded in richtext)
 *     - Stats lines as "Number | Label"
 */

function parseStats(text) {
  const specs = [];
  const parts = text.split('|').map((p) => p.trim());
  if (parts.length === 2) {
    specs.push({ number: parts[0], label: parts[1] });
  }
  return specs;
}

function buildStatsMarquee(stats) {
  const marquee = document.createElement('div');
  marquee.className = 'stats-marquee';

  stats.forEach((stat) => {
    const item = document.createElement('div');
    item.className = 'stats-marquee-item';

    const num = document.createElement('span');
    num.className = 'stats-marquee-number';
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
  const section = block.closest('.section');
  if (!section) return;

  const travelDistance = 1200;

  function onScroll() {
    const rect = section.getBoundingClientRect();
    const sectionHeight = section.offsetHeight;
    const viewportHeight = window.innerHeight;

    // Progress: 0 at section enter, 1 at section exit
    const totalTravel = sectionHeight + viewportHeight;
    const traveled = viewportHeight - rect.top;
    const progress = Math.min(Math.max(traveled / totalTravel, 0), 1);

    const carX = (1 - progress) * travelDistance;
    const marqueeX = (1 - progress) * travelDistance * 0.8;

    carWrap.style.transform = `translateX(${carX}px)`;
    marquee.style.transform = `translateX(${marqueeX}px)`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

export default function decorate(block) {
  const rows = Array.from(block.querySelectorAll(':scope > div'));

  // Row 1: background image
  const bgRow = rows[0];
  const bgCol = bgRow ? bgRow.querySelector(':scope > div') : null;
  const bgPicture = bgCol ? bgCol.querySelector('picture') : null;

  // Row 2: richtext (statement + car picture + stats)
  const textRow = rows[1];
  const textCol = textRow ? textRow.querySelector(':scope > div') : null;

  // Extract from richtext: statement paragraph + stats lines
  let statementP = null;
  const stats = [];

  if (textCol) {
    Array.from(textCol.querySelectorAll('p')).forEach((p) => {
      const text = p.textContent.trim();
      if (text.includes('|')) {
        parseStats(text).forEach((s) => stats.push(s));
      } else if (!statementP) {
        statementP = p;
      }
    });
  }

  // Clear and rebuild
  block.textContent = '';

  // Background image
  if (bgPicture) {
    const bg = document.createElement('div');
    bg.className = 'stats-bg';
    bg.append(bgPicture);
    block.append(bg);
  }

  // Dark overlay
  const overlay = document.createElement('div');
  overlay.className = 'stats-overlay';
  block.append(overlay);

  // Statement text
  if (statementP) {
    const statement = document.createElement('div');
    statement.className = 'stats-statement';
    statement.append(statementP);
    block.append(statement);
  }

  // Car image placeholder (decorative, scroll-animated)
  const carWrap = document.createElement('div');
  carWrap.className = 'stats-car';
  block.append(carWrap);

  // Stats marquee (scroll-animated)
  const marquee = buildStatsMarquee(stats);
  block.append(marquee);

  // Scroll animation
  setupScrollAnimation(block, carWrap, marquee);
}
