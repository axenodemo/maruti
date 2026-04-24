function decorateCard(row) {
  row.classList.add('explore-card');

  const cols = Array.from(row.querySelectorAll(':scope > div'));
  const imageCol = cols[0];
  const textCol = cols[1];

  if (imageCol) imageCol.classList.add('explore-card-image');
  if (textCol) textCol.classList.add('explore-card-content');

  // Add arrow icon
  const arrow = document.createElement('span');
  arrow.className = 'explore-card-arrow';
  arrow.textContent = '↗';
  row.append(arrow);

  // Make whole row a link if h3 > a exists
  const link = textCol ? textCol.querySelector('h3 a') : null;
  if (link) {
    row.addEventListener('click', (e) => {
      if (!e.target.closest('a')) window.location.href = link.href;
    });
    row.style.cursor = 'pointer';
  }
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
  // Wrap all rows in a layout + track without destroying DOM
  const rows = Array.from(block.querySelectorAll(':scope > div'));

  // Create header
  const header = document.createElement('div');
  header.className = 'explore-cards-header';
  const title = document.createElement('h2');
  title.className = 'explore-cards-title';
  title.textContent = 'Keep Exploring';
  const subtitle = document.createElement('p');
  subtitle.className = 'explore-cards-subtitle';
  subtitle.textContent = 'Scroll to explore the world of Maruti Suzuki';
  header.append(title, subtitle);

  // Create track and MOVE (not clone) rows into it
  const track = document.createElement('div');
  track.className = 'explore-cards-track';
  rows.forEach((row) => {
    decorateCard(row);
    track.append(row);
  });

  // Build layout
  const layout = document.createElement('div');
  layout.className = 'explore-cards-layout';
  layout.append(header);

  const viewport = document.createElement('div');
  viewport.className = 'explore-cards-viewport';
  viewport.append(track);
  layout.append(viewport);

  block.append(layout);
  addNav(block, track);
}
