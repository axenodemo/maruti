/**
 * Timeline block — horizontal timeline with pill tabs + per-era content.
 *
 * xwalk model: filter-based container.
 * Each child item (timeline-item) has: image + text
 *   text: H2 (era title), H3 (sub-label), p (description), year in first line
 *   image: primary photo (secondary photo as second picture if present)
 *
 * Content structure per row:
 *   Col 1 (image): <picture> primary, optionally second <picture> for secondary
 *   Col 2 (text):  <h2>Era Title</h2><h3>Sub-label</h3><p>Description</p>
 *                  Year is extracted from first line or h2 prefix
 */

function parseItem(row) {
  const cols = Array.from(row.querySelectorAll(':scope > div'));
  const imageCol = cols[0];
  const textCol = cols[1];

  const pictures = imageCol ? Array.from(imageCol.querySelectorAll('picture')) : [];
  const h2 = textCol ? textCol.querySelector('h2') : null;
  const h3 = textCol ? textCol.querySelector('h3') : null;
  const desc = textCol ? textCol.querySelector('p') : null;

  // Extract year from h2 text or first strong/em
  let year = '';
  let era = '';
  if (h2) {
    const text = h2.textContent.trim();
    const yearMatch = text.match(/^(\d{4})/);
    if (yearMatch) {
      [, year] = yearMatch;
      era = text.substring(4).trim().replace(/^[:\-–—\s]+/, '');
    } else {
      era = text;
      // Try to find year in a separate element
      const yearEl = textCol.querySelector('.timeline-year');
      if (yearEl) year = yearEl.textContent.trim();
    }
  }

  return {
    year,
    era,
    subLabel: h3 ? h3.textContent.trim() : '',
    description: desc ? desc.textContent.trim() : '',
    primaryPic: pictures[0] || null,
    secondaryPic: pictures[1] || null,
    row,
  };
}

function getDecade(year) {
  const y = parseInt(year, 10);
  if (Number.isNaN(y)) return '';
  return `${Math.floor(y / 10) * 10}s`;
}

function buildNav(decades, block) {
  const nav = document.createElement('div');
  nav.className = 'timeline-nav';

  const pills = document.createElement('div');
  pills.className = 'timeline-pills';

  // Sliding pill indicator
  const slider = document.createElement('div');
  slider.className = 'timeline-pill-slider';
  pills.append(slider);

  decades.forEach((decade, i) => {
    const btn = document.createElement('button');
    btn.className = 'timeline-pill';
    btn.textContent = decade;
    btn.dataset.index = i;
    if (i === 0) btn.classList.add('active');

    btn.addEventListener('click', () => {
      block.dispatchEvent(new CustomEvent('tabchange', { detail: i }));
    });

    pills.append(btn);
  });

  nav.append(pills);
  block.prepend(nav);

  // Position slider on first pill
  requestAnimationFrame(() => {
    const firstPill = pills.querySelector('.timeline-pill');
    if (firstPill) {
      slider.style.width = `${firstPill.offsetWidth}px`;
      slider.style.transform = `translateX(${firstPill.offsetLeft}px)`;
    }
  });

  return { nav, pills, slider };
}

function buildPanel(item, index) {
  const panel = document.createElement('div');
  panel.className = 'timeline-panel';
  if (index === 0) panel.classList.add('active');
  panel.dataset.index = index;

  // Left: vertical line + rotated year
  const left = document.createElement('div');
  left.className = 'timeline-panel-left';

  const line = document.createElement('div');
  line.className = 'timeline-line';

  const yearLabel = document.createElement('span');
  yearLabel.className = 'timeline-year-label';
  yearLabel.textContent = item.year;

  left.append(line, yearLabel);
  panel.append(left);

  // Right: content
  const right = document.createElement('div');
  right.className = 'timeline-panel-right';

  const eraH = document.createElement('h2');
  eraH.className = 'timeline-era';
  eraH.textContent = item.era;
  right.append(eraH);

  // Nav arrows
  const arrows = document.createElement('div');
  arrows.className = 'timeline-arrows';
  const prevBtn = document.createElement('button');
  prevBtn.className = 'timeline-arrow-btn';
  prevBtn.setAttribute('aria-label', 'Previous');
  prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const nextBtn = document.createElement('button');
  nextBtn.className = 'timeline-arrow-btn';
  nextBtn.setAttribute('aria-label', 'Next');
  nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  arrows.append(prevBtn, nextBtn);
  right.append(arrows);

  // Sub-content area
  const sub = document.createElement('div');
  sub.className = 'timeline-sub';

  if (item.subLabel) {
    const subEl = document.createElement('h3');
    subEl.className = 'timeline-sublabel';
    subEl.textContent = item.subLabel;
    sub.append(subEl);
  }

  if (item.description) {
    const descEl = document.createElement('p');
    descEl.className = 'timeline-desc';
    descEl.textContent = item.description;
    sub.append(descEl);
  }

  right.append(sub);

  // Photos
  const photos = document.createElement('div');
  photos.className = 'timeline-photos';

  if (item.primaryPic) {
    const p1 = document.createElement('div');
    p1.className = 'timeline-photo-primary';
    p1.append(item.primaryPic);
    photos.append(p1);
  }
  if (item.secondaryPic) {
    const p2 = document.createElement('div');
    p2.className = 'timeline-photo-secondary';
    p2.append(item.secondaryPic);
    photos.append(p2);
  }

  right.append(photos);
  panel.append(right);

  return { panel, prevBtn, nextBtn };
}

function animateIn(panel) {
  const year = panel.querySelector('.timeline-year-label');
  const era = panel.querySelector('.timeline-era');
  const sub = panel.querySelector('.timeline-sublabel');
  const desc = panel.querySelector('.timeline-desc');
  const photo1 = panel.querySelector('.timeline-photo-primary');
  const photo2 = panel.querySelector('.timeline-photo-secondary');

  const set = (el, o, t) => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = t;
  };

  set(year, 0, 'translateY(-20px)');
  set(era, 0, 'translateY(24px)');
  set(sub, 0, 'translateY(16px)');
  set(desc, 0, 'translateY(12px)');
  set(photo1, 0, 'translateX(30px)');
  set(photo2, 0, 'translateX(50px) scale(0.95)');

  requestAnimationFrame(() => {
    const anim = (el, dur, delay) => {
      if (!el) return;
      el.style.transition = `opacity ${dur}ms ease-out ${delay}ms, transform ${dur}ms ease-out ${delay}ms`;
      el.style.opacity = '1';
      el.style.transform = 'translateX(0) translateY(0) scale(1)';
    };
    anim(year, 300, 50);
    anim(era, 450, 100);
    anim(sub, 350, 200);
    anim(desc, 350, 280);
    anim(photo1, 500, 150);
    anim(photo2, 500, 250);
  });
}

function animateOut(panel) {
  panel.style.transition = 'opacity 200ms ease-in, transform 200ms ease-in';
  panel.style.opacity = '0.15';
  panel.style.transform = 'scale(1.02) translateY(-8px)';
}

export default function decorate(block) {
  const rows = Array.from(block.querySelectorAll(':scope > div'));
  const items = rows.map((row) => parseItem(row));

  // Group items by decade
  const decadeMap = new Map();
  items.forEach((item) => {
    const decade = getDecade(item.year) || 'Other';
    if (!decadeMap.has(decade)) decadeMap.set(decade, []);
    decadeMap.get(decade).push(item);
  });

  const decades = Array.from(decadeMap.keys());

  // Hide original rows
  rows.forEach((row) => { row.style.display = 'none'; });

  // Build nav
  const { pills, slider } = buildNav(decades, block);

  // Build panels
  const panelsContainer = document.createElement('div');
  panelsContainer.className = 'timeline-panels';

  const allPanels = [];
  let currentIndex = 0;

  function switchTo(idx) {
    if (idx === currentIndex) return;

    // Animate out current
    animateOut(allPanels[currentIndex]);
    allPanels[currentIndex].classList.remove('active');

    currentIndex = idx;

    // Show + animate in new
    setTimeout(() => {
      allPanels.forEach((p, i) => {
        p.style.opacity = i === idx ? '' : '';
        p.style.transform = '';
      });
      allPanels[idx].classList.add('active');
      animateIn(allPanels[idx]);

      // Update nav pill
      const decade = getDecade(items[idx].year);
      const decadeIdx = decades.indexOf(decade);
      pills.querySelectorAll('.timeline-pill').forEach((p, i) => {
        p.classList.toggle('active', i === decadeIdx);
      });
      const activePill = pills.querySelectorAll('.timeline-pill')[decadeIdx];
      if (activePill) {
        slider.style.transition = 'transform 350ms cubic-bezier(0.4,0,0.2,1), width 350ms cubic-bezier(0.4,0,0.2,1)';
        slider.style.width = `${activePill.offsetWidth}px`;
        slider.style.transform = `translateX(${activePill.offsetLeft}px)`;
      }
    }, 220);
  }

  items.forEach((item, i) => {
    const { panel, prevBtn, nextBtn } = buildPanel(item, i);
    allPanels.push(panel);
    panelsContainer.append(panel);

    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) switchTo(currentIndex - 1);
    });
    nextBtn.addEventListener('click', () => {
      if (currentIndex < allPanels.length - 1) switchTo(currentIndex + 1);
    });
  });

  block.append(panelsContainer);

  // Tab click handler
  block.addEventListener('tabchange', (e) => {
    const tabIdx = e.detail;
    const decade = decades[tabIdx];
    const firstItem = decadeMap.get(decade);
    if (firstItem && firstItem.length > 0) {
      const itemIdx = items.indexOf(firstItem[0]);
      if (itemIdx >= 0) switchTo(itemIdx);
    }
  });

  // Scroll-based tab switching
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idx = parseInt(entry.target.dataset.index, 10);
        if (idx !== currentIndex) switchTo(idx);
      }
    });
  }, { threshold: 0.6 });

  allPanels.forEach((p) => observer.observe(p));

  // Initial animation
  animateIn(allPanels[0]);
}
