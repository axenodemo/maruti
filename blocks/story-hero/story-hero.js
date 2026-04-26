/* ============================================================
   Story Hero Block — MSIL Corporate Design System
   Full-bleed image hero; content row at bottom (Figma: 6532-25341)
   Left: H1 | Right: subtext + divider + CTAs
   ============================================================ */

function animateEntry(block) {
  const bg = block.querySelector('.story-hero-bg');
  const overlay = block.querySelector('.story-hero-overlay');
  const lines = block.querySelectorAll('.story-hero-h1-line');
  const subtext = block.querySelector('.story-hero-subtext');
  const divider = block.querySelector('.story-hero-divider');
  const primaryCta = block.querySelector('.story-hero-cta a.button:not(.secondary)');
  const secondaryCta = block.querySelector('.story-hero-cta a.button.secondary');

  // ---- Initial hidden states ----
  if (bg) {
    bg.style.transform = 'scale(1.06)';
    bg.style.opacity = '0';
  }
  if (overlay) overlay.style.opacity = '0';

  lines.forEach((line) => {
    line.style.opacity = '0';
    line.style.transform = 'translateX(-40px)';
  });
  if (subtext) {
    subtext.style.opacity = '0';
    subtext.style.transform = 'translateY(20px)';
  }
  if (divider) divider.style.opacity = '0';
  if (primaryCta) {
    primaryCta.style.opacity = '0';
    primaryCta.style.transform = 'translateY(10px)';
  }
  if (secondaryCta) secondaryCta.style.opacity = '0';

  // ---- Trigger transitions ----
  requestAnimationFrame(() => {
    if (bg) {
      bg.style.transition = 'transform 900ms ease-out, opacity 900ms ease-out';
      bg.style.transform = 'scale(1)';
      bg.style.opacity = '1';
    }
    if (overlay) {
      overlay.style.transition = 'opacity 600ms ease-out';
      overlay.style.opacity = '1';
    }
    if (lines[0]) {
      lines[0].style.transition = 'opacity 600ms ease-out 150ms, transform 600ms ease-out 150ms';
      lines[0].style.opacity = '1';
      lines[0].style.transform = 'translateX(0)';
    }
    if (lines[1]) {
      lines[1].style.transition = 'opacity 600ms ease-out 300ms, transform 600ms ease-out 300ms';
      lines[1].style.opacity = '1';
      lines[1].style.transform = 'translateX(0)';
    }
    if (subtext) {
      subtext.style.transition = 'opacity 500ms ease-out 450ms, transform 500ms ease-out 450ms';
      subtext.style.opacity = '1';
      subtext.style.transform = 'translateY(0)';
    }
    if (divider) {
      divider.style.transition = 'opacity 400ms ease-out 500ms';
      divider.style.opacity = '1';
    }
    if (primaryCta) {
      primaryCta.style.transition = 'opacity 400ms ease-out 600ms, transform 400ms ease-out 600ms';
      primaryCta.style.opacity = '1';
      primaryCta.style.transform = 'translateY(0)';
    }
    if (secondaryCta) {
      secondaryCta.style.transition = 'opacity 400ms ease-in 700ms';
      secondaryCta.style.opacity = '1';
    }
  });
}

export default function decorate(block) {
  const rows = Array.from(block.querySelectorAll(':scope > div'));

  // ---- Full-bleed background image ----
  const bgDiv = document.createElement('div');
  bgDiv.className = 'story-hero-bg';
  if (rows[0]) {
    const picture = rows[0].querySelector('picture');
    if (picture) bgDiv.append(picture);
  }

  // ---- Gradient overlay ----
  const overlay = document.createElement('div');
  overlay.className = 'story-hero-overlay';

  // ---- Content row: H1 left | subtext+CTAs right ----
  const contentRow = document.createElement('div');
  contentRow.className = 'story-hero-content';

  // Left: H1 heading
  const headingDiv = document.createElement('div');
  headingDiv.className = 'story-hero-heading';

  // Right column: subtext + divider + CTAs
  const rightCol = document.createElement('div');
  rightCol.className = 'story-hero-right-col';

  const subtextWrap = document.createElement('div');
  subtextWrap.className = 'story-hero-subtext-wrap';

  const divider = document.createElement('div');
  divider.className = 'story-hero-divider';

  if (rows[1]) {
    const col = rows[1].querySelector(':scope > div') || rows[1];

    // H1 — split into individually animated line spans
    const h1 = col.querySelector('h1');
    if (h1) {
      const raw = h1.innerHTML;
      const parts = raw.split(/<br\s*\/?>/i).map((s) => s.trim()).filter(Boolean);
      h1.innerHTML = (parts.length >= 2 ? parts : [raw])
        .map((s) => `<span class="story-hero-h1-line">${s}</span>`)
        .join('<br>');
      headingDiv.append(h1);
    }

    // Paragraphs → subtext or CTA row
    Array.from(col.querySelectorAll('p')).forEach((p) => {
      if (p.classList.contains('button-container')) {
        // EDS lib already decorated — add secondary class to 2nd+ links
        p.classList.add('story-hero-cta');
        p.querySelectorAll('a').forEach((a, i) => {
          if (i > 0) a.classList.add('secondary');
        });
        rightCol.append(p);
      } else if (!p.querySelector('a')) {
        p.classList.add('story-hero-subtext');
        subtextWrap.append(p);
      } else {
        // Undecorated link paragraph — decorate manually
        p.classList.add('story-hero-cta', 'button-container');
        p.querySelectorAll('a').forEach((a, i) => {
          a.classList.add('button');
          if (i > 0) a.classList.add('secondary');
        });
        rightCol.append(p);
      }
    });
  }

  // Divider sits between subtext and CTAs
  subtextWrap.append(divider);
  rightCol.prepend(subtextWrap);

  contentRow.append(headingDiv, rightCol);

  // ---- Rebuild block DOM ----
  block.innerHTML = '';
  block.append(bgDiv, overlay, contentRow);

  animateEntry(block);
}
