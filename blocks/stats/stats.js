/**
 * Stats block with scroll-linked horizontal animation.
 *
 * xwalk model (2 cells per row):
 *   Row 1: image (background) + text (statement paragraph)
 *   Row 2: image (car top-view) + text (stats: "16+ | Manufacturing Plants")
 *
 * On scroll, the section pins and the car + stats marquee
 * move horizontally across the screen in sync.
 */

function parseStats(textCol) {
  const paragraphs = Array.from(textCol.querySelectorAll('p'));
  return paragraphs.map((p) => {
    const text = p.textContent.trim();
    const pipeIdx = text.indexOf('|');
    if (pipeIdx > -1) {
      return {
        number: text.substring(0, pipeIdx).trim(),
        label: text.substring(pipeIdx + 1).trim(),
      };
    }
    return { number: text, label: '' };
  });
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

  // Total horizontal travel distance
  const travelDistance = 1200;

  function onScroll() {
    const rect = section.getBoundingClientRect();
    const sectionHeight = section.offsetHeight;
    const viewportHeight = window.innerHeight;

    // Progress: 0 at section enter, 1 at section exit
    const totalTravel = sectionHeight + viewportHeight;
    const traveled = viewportHeight - rect.top;
    const progress = Math.min(Math.max(traveled / totalTravel, 0), 1);

    // Map progress to horizontal position: start off-right, end at center-left
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
  if (rows.length < 2) return;

  // Row 1: background image + statement text
  const bgRow = rows[0];
  const bgCols = Array.from(bgRow.querySelectorAll(':scope > div'));
  const bgPicture = bgCols[0] ? bgCols[0].querySelector('picture') : null;
  const statementCol = bgCols[1];

  // Row 2: car image + stats data
  const dataRow = rows[1];
  const dataCols = Array.from(dataRow.querySelectorAll(':scope > div'));
  const carPicture = dataCols[0] ? dataCols[0].querySelector('picture') : null;
  const statsCol = dataCols[1];
  const stats = statsCol ? parseStats(statsCol) : [];

  // Clear and rebuild
  block.textContent = '';

  // Background image
  if (bgPicture) {
    const bg = document.createElement('div');
    bg.className = 'stats-bg';
    bg.append(bgPicture);
    block.append(bg);
  }

  // Dark overlay for lower section
  const overlay = document.createElement('div');
  overlay.className = 'stats-overlay';
  block.append(overlay);

  // Statement text
  if (statementCol) {
    const statement = document.createElement('div');
    statement.className = 'stats-statement';
    while (statementCol.firstChild) {
      statement.append(statementCol.firstChild);
    }
    block.append(statement);
  }

  // Car image (animated on scroll)
  const carWrap = document.createElement('div');
  carWrap.className = 'stats-car';
  if (carPicture) {
    carWrap.append(carPicture);
  }
  block.append(carWrap);

  // Stats marquee (animated on scroll)
  const marquee = buildStatsMarquee(stats);
  block.append(marquee);

  // Wire up scroll-linked animation
  setupScrollAnimation(block, carWrap, marquee);
}
