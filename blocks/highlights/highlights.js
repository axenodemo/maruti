function parseItems(textCol) {
  const category = textCol.querySelector('h4');
  const headings = Array.from(textCol.querySelectorAll('h3'));
  const items = headings.map((h, idx) => {
    const link = h.querySelector('a');
    const desc = h.nextElementSibling;
    const hasDesc = desc && desc.tagName === 'P' && !desc.querySelector('a');
    return {
      num: String(idx + 1).padStart(2, '0'),
      title: h.textContent.trim(),
      href: link ? link.getAttribute('href') : '#',
      description: hasDesc ? desc.textContent.trim() : '',
      isFirst: idx === 0,
    };
  });
  return {
    category: category ? category.textContent.trim() : '',
    items,
  };
}

function buildCard(row) {
  const cols = Array.from(row.querySelectorAll(':scope > div'));
  const imageCol = cols[0];
  const textCol = cols[1];

  const picture = imageCol ? imageCol.querySelector('picture') : null;
  const { category, items } = textCol ? parseItems(textCol) : { category: '', items: [] };

  const card = document.createElement('div');
  card.className = 'highlights-card';

  // Left: text content
  const left = document.createElement('div');
  left.className = 'highlights-card-text';

  const catLabel = document.createElement('span');
  catLabel.className = 'highlights-card-category';
  catLabel.textContent = category;
  left.append(catLabel);

  const list = document.createElement('div');
  list.className = 'highlights-card-list';

  items.forEach((item) => {
    const entry = document.createElement('div');
    entry.className = 'highlights-card-item';
    if (item.isFirst) entry.classList.add('active');

    const num = document.createElement('span');
    num.className = 'highlights-card-num';
    num.textContent = item.num;

    const body = document.createElement('div');
    body.className = 'highlights-card-item-body';

    const title = document.createElement('a');
    title.className = 'highlights-card-item-title';
    title.href = item.href;
    title.textContent = item.title;
    body.append(title);

    if (item.description) {
      const desc = document.createElement('p');
      desc.className = 'highlights-card-item-desc';
      desc.textContent = item.description;
      body.append(desc);

      const readMore = document.createElement('a');
      readMore.className = 'highlights-card-readmore';
      readMore.href = item.href;
      readMore.innerHTML = 'Read more <span>\u2197</span>';
      body.append(readMore);
    }

    entry.append(num, body);

    entry.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      list.querySelectorAll('.highlights-card-item').forEach((s) => s.classList.remove('active'));
      entry.classList.add('active');
    });

    list.append(entry);
  });

  left.append(list);
  card.append(left);

  // Right: image
  if (picture) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'highlights-card-image';
    imgWrap.append(picture);
    card.append(imgWrap);
  }

  return card;
}

export default function decorate(block) {
  const rows = Array.from(block.querySelectorAll(':scope > div'));
  const count = rows.length;

  const track = document.createElement('div');
  track.className = 'highlights-track';

  rows.forEach((row) => {
    track.append(buildCard(row));
  });

  block.textContent = '';

  const viewport = document.createElement('div');
  viewport.className = 'highlights-viewport';
  viewport.append(track);
  block.append(viewport);

  let current = 0;

  function goTo(idx) {
    let target = idx;
    if (target < 0) target = count - 1;
    if (target >= count) target = 0;
    const firstCard = track.querySelector('.highlights-card');
    const step = firstCard ? firstCard.offsetWidth + 24 : 852;
    track.style.transform = `translateX(-${target * step}px)`;
    current = target;
  }

  // Arrows only (no dots)
  const nav = document.createElement('div');
  nav.className = 'highlights-nav';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'highlights-nav-btn';
  prevBtn.setAttribute('aria-label', 'Previous');
  prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  prevBtn.addEventListener('click', () => goTo(current - 1));

  const nextBtn = document.createElement('button');
  nextBtn.className = 'highlights-nav-btn';
  nextBtn.setAttribute('aria-label', 'Next');
  nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  nextBtn.addEventListener('click', () => goTo(current + 1));

  nav.append(prevBtn, nextBtn);
  block.append(nav);

  // Start at first card (already centered via CSS padding)
  goTo(0);
}
