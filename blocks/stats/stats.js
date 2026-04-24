function parseStats(text) {
  const specs = [];
  const parts = text.split('|').map((p) => p.trim());
  if (parts.length === 2) {
    specs.push({ number: parts[0], label: parts[1] });
  }
  return specs;
}

function setupScrollAnimation(block, marquee) {
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

    const marqueeX = (1 - progress) * travelDistance * 0.8;
    marquee.style.transform = `translateX(${marqueeX}px)`;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

export default function decorate(block) {
  const rows = Array.from(block.querySelectorAll(':scope > div'));

  // Row 1: background image
  const bgRow = rows[0];
  if (bgRow) {
    bgRow.classList.add('stats-bg-row');
    const col = bgRow.querySelector(':scope > div');
    if (col) col.classList.add('stats-bg');
  }

  // Row 2: text with statement + stats
  const textRow = rows[1];
  const stats = [];

  if (textRow) {
    textRow.classList.add('stats-text-row');
    const col = textRow.querySelector(':scope > div');
    if (col) {
      const paragraphs = Array.from(col.querySelectorAll('p'));
      paragraphs.forEach((p) => {
        const text = p.textContent.trim();
        if (text.includes('|')) {
          parseStats(text).forEach((s) => stats.push(s));
          p.style.display = 'none';
        } else {
          p.classList.add('stats-statement');
        }
      });
    }
  }

  // Dark overlay
  const overlay = document.createElement('div');
  overlay.className = 'stats-overlay';
  block.append(overlay);

  // Stats marquee
  if (stats.length > 0) {
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
    block.append(marquee);
    setupScrollAnimation(block, marquee);
  }
}
