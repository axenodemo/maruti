/**
 * Contact Cards block.
 *
 * xwalk model (block with model, 2 cells per row):
 *   Row 1: image (icon) + text (label line 1 + bold line 2 + optional link)
 *   Row 2: ...
 *
 * JS parses each row as a card with icon + two-line text.
 */

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
  if (lower.includes('quote') || lower.includes('price')) return ICONS.note;
  return ICONS.note;
}

function buildCard(row) {
  const cols = Array.from(row.querySelectorAll(':scope > div'));
  const textCol = cols[1] || cols[0];
  const paragraphs = textCol
    ? Array.from(textCol.querySelectorAll('p'))
    : [];
  const link = textCol ? textCol.querySelector('a') : null;
  const href = link ? link.getAttribute('href') : '#';
  const fullText = paragraphs
    .map((p) => p.textContent.trim())
    .join('\n');

  // Split into label (first line) and value (second line)
  const lines = fullText.split('\n').filter((l) => l.length > 0);
  const label = lines[0] || '';
  const value = lines[1] || '';

  const card = document.createElement('a');
  card.className = 'contact-card';
  card.href = href;

  // Icon
  const iconWrap = document.createElement('div');
  iconWrap.className = 'contact-card-icon';
  iconWrap.innerHTML = getIconSvg(fullText);
  card.append(iconWrap);

  // Text
  const textWrap = document.createElement('div');
  textWrap.className = 'contact-card-text';

  const labelEl = document.createElement('span');
  labelEl.className = 'contact-card-label';
  labelEl.textContent = label;
  textWrap.append(labelEl);

  const valueEl = document.createElement('span');
  valueEl.className = 'contact-card-value';
  valueEl.textContent = value;
  textWrap.append(valueEl);

  card.append(textWrap);
  return card;
}

export default function decorate(block) {
  const rows = Array.from(block.querySelectorAll(':scope > div'));

  const grid = document.createElement('div');
  grid.className = 'contact-cards-grid';

  rows.forEach((row) => {
    grid.append(buildCard(row));
  });

  block.textContent = '';
  block.append(grid);
}
