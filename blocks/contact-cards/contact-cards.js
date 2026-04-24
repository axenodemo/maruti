const ICONS = {
  phone: '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 6.75H9a2.25 2.25 0 0 0-2.25 2.25A20.25 20.25 0 0 0 27 29.25 2.25 2.25 0 0 0 29.25 27v-4.5l-6.75-2.25-2.25 3.375A14.625 14.625 0 0 1 12.375 15.75L15.75 13.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  book: '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.75 6.75h9v22.5h-9zM15.75 6.75h9v22.5h-9z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.25 15.75h3.375M20.25 20.25h3.375M12.375 15.75H9M12.375 20.25H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  pin: '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 19.125a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z" stroke="currentColor" stroke-width="1.5"/><path d="M29.25 14.625c0 9-11.25 17.625-11.25 17.625S6.75 23.625 6.75 14.625a11.25 11.25 0 0 1 22.5 0z" stroke="currentColor" stroke-width="1.5"/></svg>',
  note: '<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.25 29.25H9a2.25 2.25 0 0 1-2.25-2.25V9A2.25 2.25 0 0 1 9 6.75h18A2.25 2.25 0 0 1 29.25 9v11.25z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.25 22.5v6.75L29.25 20.25H22.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.5 13.5h9M13.5 18h4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
};

function getIconSvg(text) {
  const lower = text.toLowerCase();
  if (lower.includes('call') || lower.includes('phone')) return ICONS.phone;
  if (lower.includes('brochure') || lower.includes('detail')) return ICONS.book;
  if (lower.includes('dealer') || lower.includes('locate')) return ICONS.pin;
  return ICONS.note;
}

function decorateCard(row) {
  row.classList.add('contact-card');

  const cols = Array.from(row.querySelectorAll(':scope > div'));
  const imageCol = cols[0];
  const textCol = cols[1] || cols[0];

  // Add icon to the image column
  if (imageCol && !imageCol.querySelector('picture')) {
    const fullText = textCol ? textCol.textContent : '';
    imageCol.classList.add('contact-card-icon');
    imageCol.innerHTML = getIconSvg(fullText);
  }

  // Style text column
  if (textCol) {
    textCol.classList.add('contact-card-text');
    const paragraphs = Array.from(textCol.querySelectorAll('p'));
    if (paragraphs[0]) paragraphs[0].classList.add('contact-card-label');
    if (paragraphs[1]) paragraphs[1].classList.add('contact-card-value');
  }

  // Make clickable via first link
  const link = row.querySelector('a');
  if (link) {
    row.addEventListener('click', (e) => {
      if (!e.target.closest('a')) window.location.href = link.href;
    });
    row.style.cursor = 'pointer';
  }
}

export default function decorate(block) {
  const rows = Array.from(block.querySelectorAll(':scope > div'));

  // Wrap in grid container (MOVE rows, preserve DOM)
  const grid = document.createElement('div');
  grid.className = 'contact-cards-grid';
  rows.forEach((row) => {
    decorateCard(row);
    grid.append(row);
  });
  block.append(grid);
}
