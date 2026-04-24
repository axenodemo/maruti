function decorateCard(row) {
  const cols = Array.from(row.querySelectorAll(':scope > div'));
  const imageCol = cols[0];
  const textCol = cols[1];

  row.classList.add('highlights-card');

  if (imageCol) imageCol.classList.add('highlights-card-image');

  if (textCol) {
    textCol.classList.add('highlights-card-text');

    const category = textCol.querySelector('h4');
    if (category) category.classList.add('highlights-card-category');

    const headings = Array.from(textCol.querySelectorAll('h3'));
    const list = document.createElement('div');
    list.className = 'highlights-card-list';

    headings.forEach((h, idx) => {
      const entry = document.createElement('div');
      entry.className = 'highlights-card-item';
      if (idx === 0) entry.classList.add('active');

      const num = document.createElement('span');
      num.className = 'highlights-card-num';
      num.textContent = String(idx + 1).padStart(2, '0');

      const body = document.createElement('div');
      body.className = 'highlights-card-item-body';

      const link = h.querySelector('a');
      const title = document.createElement('a');
      title.className = 'highlights-card-item-title';
      title.href = link ? link.getAttribute('href') : '#';
      title.textContent = h.textContent;
      body.append(title);

      // Description = next sibling p
      const desc = h.nextElementSibling;
      if (desc && desc.tagName === 'P' && !desc.querySelector('a')) {
        desc.classList.add('highlights-card-item-desc');
        body.append(desc);

        const readMore = document.createElement('a');
        readMore.className = 'highlights-card-readmore';
        readMore.href = title.href;
        readMore.innerHTML = 'Read more <span>↗</span>';
        body.append(readMore);
      }

      entry.append(num, body);
      entry.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        list.querySelectorAll('.highlights-card-item').forEach((s) => s.classList.remove('active'));
        entry.classList.add('active');
      });

      list.append(entry);
      h.remove();
    });

    textCol.append(list);
  }
}

export default function decorate(block) {
  const rows = Array.from(block.querySelectorAll(':scope > div'));
  const count = rows.length;

  // Wrap in viewport + track (MOVE rows, preserve DOM)
  const track = document.createElement('div');
  track.className = 'highlights-track';
  rows.forEach((row) => {
    decorateCard(row);
    track.append(row);
  });

  const viewport = document.createElement('div');
  viewport.className = 'highlights-viewport';
  viewport.append(track);
  block.append(viewport);

  // Arrows
  let current = 0;
  const nav = document.createElement('div');
  nav.className = 'highlights-nav';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'highlights-nav-btn';
  prevBtn.setAttribute('aria-label', 'Previous');
  prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  prevBtn.addEventListener('click', () => {
    current = current <= 0 ? count - 1 : current - 1;
    const step = track.querySelector('.highlights-card');
    const w = step ? step.offsetWidth + 24 : 852;
    track.style.transform = `translateX(-${current * w}px)`;
  });

  const nextBtn = document.createElement('button');
  nextBtn.className = 'highlights-nav-btn';
  nextBtn.setAttribute('aria-label', 'Next');
  nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  nextBtn.addEventListener('click', () => {
    current = current >= count - 1 ? 0 : current + 1;
    const step = track.querySelector('.highlights-card');
    const w = step ? step.offsetWidth + 24 : 852;
    track.style.transform = `translateX(-${current * w}px)`;
  });

  nav.append(prevBtn, nextBtn);
  block.append(nav);
}
