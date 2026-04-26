/**
 * Story Hero — full-width BG image, bottom content bar.
 * H1 on bottom-left, subtext + CTAs on bottom-right.
 *
 * xwalk model (2 rows, imageAlt collapsed):
 *   Row 1: image (full-width BG)
 *   Row 2: text (H1 + subtext + CTAs)
 */

function animateEntry(block) {
  const bg = block.querySelector('.story-hero-image');
  const overlay = block.querySelector('.story-hero-gradient');
  const h1 = block.querySelector('h1');
  const subtext = block.querySelector('.story-hero-subtext');
  const ctaPrimary = block.querySelector('.button-container a.button:not(.secondary)');
  const ctaSecondary = block.querySelector('.button-container a.button.secondary');

  // Initial states
  if (bg) {
    bg.style.transform = 'scale(1.06)';
    bg.style.opacity = '0';
  }
  if (overlay) overlay.style.opacity = '0';

  // Split H1 into lines
  if (h1) {
    const html = h1.innerHTML;
    const parts = html.split(/<br\s*\/?>/i);
    if (parts.length >= 2) {
      h1.innerHTML = parts.map((p) => `<span class="story-hero-line">${p.trim()}</span>`).join('');
    } else {
      h1.innerHTML = `<span class="story-hero-line">${html}</span>`;
    }
    h1.querySelectorAll('.story-hero-line').forEach((line) => {
      line.style.opacity = '0';
      line.style.transform = 'translateX(-40px)';
    });
  }

  if (subtext) {
    subtext.style.opacity = '0';
    subtext.style.transform = 'translateY(20px)';
  }
  if (ctaPrimary) {
    ctaPrimary.style.opacity = '0';
    ctaPrimary.style.transform = 'translateY(10px)';
  }
  if (ctaSecondary) ctaSecondary.style.opacity = '0';

  // Animate
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

    const lines = h1 ? h1.querySelectorAll('.story-hero-line') : [];
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
    if (ctaPrimary) {
      ctaPrimary.style.transition = 'opacity 400ms ease-out 600ms, transform 400ms ease-out 600ms';
      ctaPrimary.style.opacity = '1';
      ctaPrimary.style.transform = 'translateY(0)';
    }
    if (ctaSecondary) {
      ctaSecondary.style.transition = 'opacity 400ms ease-in 700ms';
      ctaSecondary.style.opacity = '1';
    }
  });
}

export default function decorate(block) {
  const rows = Array.from(block.querySelectorAll(':scope > div'));

  // Row 1: BG image
  const imageRow = rows[0];
  if (imageRow) {
    imageRow.classList.add('story-hero-image');
  }

  // Row 2: text content — restructure into left (H1) + right (subtext + CTAs)
  const textRow = rows[1];
  if (textRow) {
    textRow.classList.add('story-hero-content');
    const col = textRow.querySelector(':scope > div');
    if (col) {
      col.classList.add('story-hero-content-inner');

      // Find elements
      const h1 = col.querySelector('h1');
      const allP = Array.from(col.querySelectorAll('p'));

      // Create right-side container
      const right = document.createElement('div');
      right.className = 'story-hero-right';

      allP.forEach((p) => {
        const links = p.querySelectorAll('a');
        if (links.length > 0) {
          // CTA paragraph — auto-decorate if needed
          if (!p.classList.contains('button-container')) {
            p.classList.add('button-container');
            links.forEach((a, i) => {
              a.classList.add('button');
              if (i > 0) a.classList.add('secondary');
            });
          }
          right.append(p);
        } else if (p.textContent.trim().length > 20) {
          // Subtext
          p.classList.add('story-hero-subtext');
          right.append(p);
        }
      });

      // H1 stays in the inner, right goes after it
      if (h1) col.append(h1);
      col.append(right);
    }
  }

  // Add gradient overlay
  const gradient = document.createElement('div');
  gradient.className = 'story-hero-gradient';
  block.append(gradient);

  // Entry animations
  animateEntry(block);
}
