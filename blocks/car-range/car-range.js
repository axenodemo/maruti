function buildSpecItem(label, value) {
  const spec = document.createElement('div');
  spec.className = 'car-range-spec';

  const specLabel = document.createElement('span');
  specLabel.className = 'car-range-spec-label';
  specLabel.textContent = label;

  const specValue = document.createElement('span');
  specValue.className = 'car-range-spec-value';
  specValue.textContent = value;

  spec.append(specLabel, specValue);
  return spec;
}

function parseSpecs(text) {
  const specs = [];
  const parts = text.split('|').map((p) => p.trim());
  parts.forEach((part) => {
    const colonIdx = part.indexOf(':');
    if (colonIdx > -1) {
      specs.push({
        label: part.substring(0, colonIdx).trim(),
        value: part.substring(colonIdx + 1).trim(),
      });
    }
  });
  return specs;
}

function decorateCard(row) {
  const cols = Array.from(row.querySelectorAll(':scope > div'));
  const imageCol = cols[0];
  const textCol = cols[1];

  // Dataset label rows
  const hasPicture = row.querySelector('picture');
  if (!hasPicture && imageCol) {
    const text = imageCol.textContent.trim().toLowerCase();
    if (text.length > 0 && text.length < 30) {
      row.classList.add('car-range-dataset-label');
      row.dataset.dataset = text;
      return;
    }
  }

  row.classList.add('car-range-card');

  if (imageCol) imageCol.classList.add('car-range-card-image');

  if (textCol) {
    textCol.classList.add('car-range-card-content');

    const heading = textCol.querySelector('h3');
    const link = heading ? heading.querySelector('a') : null;
    if (heading) heading.classList.add('car-range-card-name-wrap');
    if (link) link.classList.add('car-range-card-name');

    const paragraphs = Array.from(textCol.querySelectorAll('p'));
    paragraphs.forEach((p) => {
      const text = p.textContent;
      if (text.includes('|')) {
        const specs = parseSpecs(text);
        const specsRow = document.createElement('div');
        specsRow.className = 'car-range-specs';
        specs.forEach((s) => specsRow.append(buildSpecItem(s.label, s.value)));
        p.replaceWith(specsRow);
      } else {
        p.classList.add('car-range-card-desc');
      }
    });
  }

  // CTA button
  const link = row.querySelector('h3 a');
  const href = link ? link.getAttribute('href') : '#';
  const titleAttr = link ? link.getAttribute('data-cta') : null;
  const cta = document.createElement('a');
  cta.className = 'car-range-card-cta';
  cta.href = href;
  cta.textContent = titleAttr || 'Learn More';
  row.append(cta);

  row.addEventListener('click', (e) => {
    if (!e.target.closest('a')) window.location.href = href;
  });
}

function splitDatasets(block) {
  const rows = Array.from(block.querySelectorAll(':scope > div'));
  const datasets = {};
  let currentLabel = 'arena';

  rows.forEach((row) => {
    if (row.classList.contains('car-range-dataset-label')) {
      currentLabel = row.dataset.dataset;
      if (!datasets[currentLabel]) datasets[currentLabel] = [];
      return;
    }
    if (row.classList.contains('car-range-card')) {
      if (!datasets[currentLabel]) datasets[currentLabel] = [];
      datasets[currentLabel].push(row);
    }
  });

  return datasets;
}

function buildToggle(datasets) {
  const labels = Object.keys(datasets);
  if (labels.length < 2) return null;

  const toggle = document.createElement('div');
  toggle.className = 'car-range-toggle';

  labels.forEach((label, idx) => {
    const btn = document.createElement('button');
    btn.className = 'car-range-toggle-btn';
    btn.textContent = label.toUpperCase();
    btn.setAttribute('aria-label', `Show ${label} cars`);
    if (idx === 0) btn.classList.add('active');

    btn.addEventListener('click', () => {
      toggle.querySelectorAll('.car-range-toggle-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      Object.entries(datasets).forEach(([key, cards]) => {
        cards.forEach((card) => {
          card.style.display = key === label ? '' : 'none';
        });
      });
    });

    toggle.append(btn);
  });

  return toggle;
}

function addScrollControls(container, track) {
  const scrollBtn = document.createElement('button');
  scrollBtn.className = 'car-range-scroll-btn';
  scrollBtn.setAttribute('aria-label', 'Scroll right');
  scrollBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  scrollBtn.addEventListener('click', () => {
    track.scrollBy({ left: 320, behavior: 'smooth' });
  });
  container.append(scrollBtn);
}

/**
 * Scroll-in animations via IntersectionObserver:
 *  - Section labels: opacity 0 + translateY(20-30) → visible, stagger 100ms
 *  - Cards: opacity 0 + translateY(40) → visible, stagger index * 100ms
 *  - Toggle: opacity 0 + translateX(20) → visible, delay 500ms
 */
function setupScrollAnimations(block, toggle) {
  const section = block.closest('.section');
  if (!section) return;

  // Make "Our Range" uppercase
  const subtitle = section.querySelector('.default-content-wrapper > p:first-child');
  if (subtitle) subtitle.style.textTransform = 'uppercase';

  // Fix escaped HTML tags in heading (AEM title component escapes <strong>)
  const h2 = section.querySelector('.default-content-wrapper h2');
  if (h2 && h2.textContent.includes('<strong>')) {
    h2.innerHTML = h2.textContent;
  }

  // Style <strong> inside heading as accent color
  const strong = h2 ? h2.querySelector('strong') : null;
  if (strong) strong.classList.add('car-range-accent');

  // Animate section labels (Our Range, heading)
  const dcw = section.querySelector('.default-content-wrapper');
  if (dcw) {
    const labels = Array.from(dcw.children);
    labels.forEach((el, i) => {
      if (el.classList.contains('car-range-toggle')) return;
      el.style.opacity = '0';
      el.style.transform = `translateY(${20 + i * 5}px)`;
    });

    const labelObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          labels.forEach((el, i) => {
            if (el.classList.contains('car-range-toggle')) return;
            const delay = i * 100;
            el.style.transition = `opacity 400ms ease-out ${delay}ms, transform 500ms ease-out ${delay}ms`;
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          });
          // Trigger toggle animation
          if (toggle) toggle.classList.add('visible');
          labelObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    labelObserver.observe(section);
  }

  // Animate cards on scroll
  const cards = block.querySelectorAll('.car-range-card');
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        cards.forEach((card, i) => {
          if (card.style.display === 'none') return;
          const delay = i * 100;
          card.style.transition = `opacity 400ms ease-out ${delay}ms, transform 400ms ease-out ${delay}ms`;
          card.classList.add('visible');
        });
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  cardObserver.observe(block);
}

export default function decorate(block) {
  const rows = Array.from(block.querySelectorAll(':scope > div'));

  // Decorate each row in-place
  rows.forEach((row) => decorateCard(row));

  // Split datasets
  const datasets = splitDatasets(block);
  const labels = Object.keys(datasets);

  // Hide non-first dataset
  if (labels.length > 1) {
    labels.slice(1).forEach((label) => {
      datasets[label].forEach((card) => { card.style.display = 'none'; });
    });
  }

  // Wrap in track (MOVE rows, preserve DOM)
  const track = document.createElement('div');
  track.className = 'car-range-track';
  rows.forEach((row) => track.append(row));

  const container = document.createElement('div');
  container.className = 'car-range-container';
  container.append(track);
  addScrollControls(container, track);
  block.append(container);

  // Toggle
  const toggle = buildToggle(datasets);
  if (toggle) {
    const section = block.closest('.section');
    const dcw = section ? section.querySelector('.default-content-wrapper') : null;
    if (dcw) {
      dcw.append(toggle);
    } else {
      block.prepend(toggle);
    }
  }

  // Scroll-in animations
  setupScrollAnimations(block, toggle);
}
