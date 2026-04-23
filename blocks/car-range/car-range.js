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
  const picture = row.querySelector('picture');
  const heading = row.querySelector('h3');
  const paragraphs = Array.from(row.querySelectorAll('p'));

  const cardEl = document.createElement('div');
  cardEl.className = 'car-range-card';

  const link = heading ? heading.querySelector('a') : null;
  const href = link ? link.getAttribute('href') : '#';

  // Image
  const imageWrap = document.createElement('div');
  imageWrap.className = 'car-range-card-image';
  if (picture) imageWrap.append(picture);
  cardEl.append(imageWrap);

  // Content
  const content = document.createElement('div');
  content.className = 'car-range-card-content';

  if (heading) {
    const name = document.createElement('a');
    name.className = 'car-range-card-name';
    name.href = href;
    name.textContent = heading.textContent;
    content.append(name);
  }

  const descP = paragraphs.find((p) => !p.textContent.includes('|'));
  if (descP) {
    const desc = document.createElement('p');
    desc.className = 'car-range-card-desc';
    desc.textContent = descP.textContent;
    content.append(desc);
  }

  const specsP = paragraphs.find((p) => p.textContent.includes('|'));
  if (specsP) {
    const specs = parseSpecs(specsP.textContent);
    const specsRow = document.createElement('div');
    specsRow.className = 'car-range-specs';
    specs.forEach((s) => {
      specsRow.append(buildSpecItem(s.label, s.value));
    });
    content.append(specsRow);
  }

  cardEl.append(content);
  cardEl.addEventListener('click', () => { window.location.href = href; });
  cardEl.style.cursor = 'pointer';
  return cardEl;
}

/**
 * Split rows into datasets by separator rows.
 * A separator row is one whose first cell text starts with "---" or is a brand label.
 * Content structure:
 *   Row: "arena" (dataset label)
 *   Row: car 1
 *   Row: car 2
 *   Row: "nexa" (dataset label)
 *   Row: car 3
 *   Row: car 4
 */
function splitDatasets(rows) {
  const datasets = {};
  let currentLabel = 'arena';

  rows.forEach((row) => {
    const firstCol = row.querySelector(':scope > div');
    const text = firstCol ? firstCol.textContent.trim().toLowerCase() : '';

    // Check if this row is a dataset label (no picture, short text)
    const hasPicture = row.querySelector('picture');
    const hasHeading = row.querySelector('h3');
    if (!hasPicture && !hasHeading && text.length > 0 && text.length < 30) {
      currentLabel = text;
      if (!datasets[currentLabel]) datasets[currentLabel] = [];
      return;
    }

    if (!datasets[currentLabel]) datasets[currentLabel] = [];
    datasets[currentLabel].push(row);
  });

  return datasets;
}

function buildToggle(datasets, track) {
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
      // Update active state
      toggle.querySelectorAll('.car-range-toggle-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // Swap cards
      track.textContent = '';
      datasets[label].forEach((row) => {
        const card = decorateCard(row.cloneNode(true));
        track.append(card);
      });

      // Reset scroll
      track.scrollTo({ left: 0 });
    });

    toggle.append(btn);
  });

  return toggle;
}

function addScrollControls(track, container) {
  const scrollBtn = document.createElement('button');
  scrollBtn.className = 'car-range-scroll-btn';
  scrollBtn.setAttribute('aria-label', 'Scroll right');
  scrollBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  scrollBtn.addEventListener('click', () => {
    track.scrollBy({ left: 320, behavior: 'smooth' });
  });
  container.append(scrollBtn);
}

export default function decorate(block) {
  const rows = Array.from(block.querySelectorAll(':scope > div'));

  const datasets = splitDatasets(rows);
  const labels = Object.keys(datasets);
  const firstLabel = labels[0] || 'arena';

  // Build carousel track with first dataset
  const track = document.createElement('div');
  track.className = 'car-range-track';

  (datasets[firstLabel] || []).forEach((row) => {
    const card = decorateCard(row);
    track.append(card);
  });

  // Clear block and rebuild
  block.textContent = '';

  // Move toggle into the section's default-content-wrapper (next to heading)
  const toggle = buildToggle(datasets, track);
  if (toggle) {
    const section = block.closest('.section');
    const dcw = section ? section.querySelector('.default-content-wrapper') : null;
    if (dcw) {
      dcw.append(toggle);
    } else {
      block.append(toggle);
    }
  }

  const container = document.createElement('div');
  container.className = 'car-range-container';
  container.append(track);

  addScrollControls(track, container);
  block.append(container);
}
