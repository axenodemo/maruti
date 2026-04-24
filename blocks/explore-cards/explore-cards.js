function buildCard(row) {
  const cols = Array.from(row.querySelectorAll(':scope > div'));
  const imageCol = cols[0];
  const textCol = cols[1];

  const picture = imageCol ? imageCol.querySelector('picture') : null;
  const heading = textCol ? textCol.querySelector('h3') : null;
  const desc = textCol ? textCol.querySelector('p') : null;
  const link = heading ? heading.querySelector('a') : null;
  const href = link ? link.getAttribute('href') : '#';

  const card = document.createElement('a');
  card.className = 'explore-card';
  card.href = href;

  // Image with gradient overlay
  if (picture) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'explore-card-image';
    imgWrap.append(picture);
    card.append(imgWrap);
  }

  // Content overlay (bottom)
  const content = document.createElement('div');
  content.className = 'explore-card-content';

  if (heading) {
    const title = document.createElement('span');
    title.className = 'explore-card-title';
    title.textContent = heading.textContent;
    content.append(title);
  }

  if (desc) {
    const descEl = document.createElement('span');
    descEl.className = 'explore-card-desc';
    descEl.textContent = desc.textContent;
    content.append(descEl);
  }

  // Arrow icon
  const arrow = document.createElement('span');
  arrow.className = 'explore-card-arrow';
  arrow.innerHTML = '\u2197';
  content.append(arrow);

  card.append(content);
  return card;
}

function addNav(block, track) {
  const nav = document.createElement('div');
  nav.className = 'explore-cards-nav';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'explore-cards-nav-btn';
  prevBtn.setAttribute('aria-label', 'Previous');
  prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -426, behavior: 'smooth' });
  });

  const nextBtn = document.createElement('button');
  nextBtn.className = 'explore-cards-nav-btn explore-cards-nav-btn-active';
  nextBtn.setAttribute('aria-label', 'Next');
  nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: 426, behavior: 'smooth' });
  });

  nav.append(prevBtn, nextBtn);
  block.append(nav);
}

export default function decorate(block) {
  const rows = Array.from(block.querySelectorAll(':scope > div'));

  // Build header + carousel layout
  const header = document.createElement('div');
  header.className = 'explore-cards-header';

  const title = document.createElement('h2');
  title.className = 'explore-cards-title';
  title.textContent = 'Keep Exploring';

  const subtitle = document.createElement('p');
  subtitle.className = 'explore-cards-subtitle';
  subtitle.textContent = 'Scroll to explore the world of Maruti Suzuki';

  header.append(title, subtitle);

  // Carousel track
  const track = document.createElement('div');
  track.className = 'explore-cards-track';

  rows.forEach((row) => {
    track.append(buildCard(row));
  });

  // Clear and rebuild
  block.textContent = '';

  const layout = document.createElement('div');
  layout.className = 'explore-cards-layout';
  layout.append(header);

  const trackWrap = document.createElement('div');
  trackWrap.className = 'explore-cards-viewport';
  trackWrap.append(track);
  layout.append(trackWrap);

  block.append(layout);
  addNav(block, track);
}
