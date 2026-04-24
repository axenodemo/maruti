/* Hero entry animations — staggered on DOMContentLoaded */
function animateHeroEntry(block) {
  const bg = block.querySelector('.hero-bg');
  const h1 = block.querySelector('h1');
  const subtext = block.querySelector('.hero-content > p:not(.button-container)');
  const primaryCta = block.querySelector('.hero-content .button-container a.button:not(.secondary)');
  const secLink = block.querySelector('.hero-content .button-container a.button.secondary');
  const scrollIndicator = block.querySelector('.hero-scroll-indicator');

  // Initial states
  if (bg) {
    bg.style.transform = 'scale(1.08)';
    bg.style.opacity = '0.85';
  }

  const fadeUp = (el, y = 40) => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = `translateY(${y}px)`;
  };

  fadeUp(subtext, 20);
  if (primaryCta) {
    primaryCta.style.opacity = '0';
    primaryCta.style.transform = 'translateX(-20px)';
  }
  if (secLink) secLink.style.opacity = '0';
  if (scrollIndicator) {
    scrollIndicator.style.opacity = '0';
    scrollIndicator.style.transform = 'translateY(10px)';
  }

  // Split H1 into lines
  if (h1) {
    const text = h1.innerHTML;
    const parts = text.split('<br>').length > 1
      ? text.split('<br>')
      : text.split('\n').filter((l) => l.trim());
    if (parts.length >= 2) {
      h1.innerHTML = `<span class="hero-h1-line">${parts[0].trim()}</span><br><span class="hero-h1-line">${parts.slice(1).join(' ').trim()}</span>`;
    } else {
      h1.innerHTML = `<span class="hero-h1-line">${text}</span>`;
    }
    h1.querySelectorAll('.hero-h1-line').forEach((line) => {
      line.style.opacity = '0';
      line.style.transform = 'translateY(40px)';
      line.style.display = 'inline-block';
    });
  }

  // Animate
  requestAnimationFrame(() => {
    if (bg) {
      bg.style.transition = 'transform 900ms ease-out, opacity 900ms ease-out';
      bg.style.transform = 'scale(1)';
      bg.style.opacity = '1';
    }

    const lines = h1 ? h1.querySelectorAll('.hero-h1-line') : [];
    if (lines[0]) {
      lines[0].style.transition = 'opacity 600ms ease-out 100ms, transform 600ms ease-out 100ms';
      lines[0].style.opacity = '1';
      lines[0].style.transform = 'translateY(0)';
    }
    if (lines[1]) {
      lines[1].style.transition = 'opacity 600ms ease-out 250ms, transform 600ms ease-out 250ms';
      lines[1].style.opacity = '1';
      lines[1].style.transform = 'translateY(0)';
    }
    if (subtext) {
      subtext.style.transition = 'opacity 500ms ease-out 400ms, transform 500ms ease-out 400ms';
      subtext.style.opacity = '1';
      subtext.style.transform = 'translateY(0)';
    }
    if (primaryCta) {
      primaryCta.style.transition = 'opacity 400ms ease-out 550ms, transform 400ms ease-out 550ms';
      primaryCta.style.opacity = '1';
      primaryCta.style.transform = 'translateX(0)';
    }
    if (secLink) {
      secLink.style.transition = 'opacity 400ms ease-in 650ms';
      secLink.style.opacity = '1';
    }
    if (scrollIndicator) {
      scrollIndicator.style.transition = 'opacity 400ms ease-out 800ms, transform 400ms ease-out 800ms';
      scrollIndicator.style.opacity = '1';
      scrollIndicator.style.transform = 'translateY(0)';
    }
  });
}

/* Scroll indicator at bottom center */
function addScrollIndicator(block) {
  const indicator = document.createElement('div');
  indicator.className = 'hero-scroll-indicator';
  indicator.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="white" stroke-width="1.5">
      <path d="M7.5 1v13M1 8l6.5 6L14 8"/>
    </svg>
    <span>Scroll Down to Explore Maruti</span>
  `;
  block.append(indicator);
  return indicator;
}

/* Video card — supports DAM video (.mp4) or external URL */
function buildVideoCard(block, videoRow) {
  if (!videoRow) return;

  const col = videoRow.querySelector(':scope > div');
  if (!col) return;

  // Check for video element or link
  const videoEl = col.querySelector('video, a[href$=".mp4"]');
  const picture = col.querySelector('picture');
  let videoSrc = '';

  if (videoEl) {
    videoSrc = videoEl.tagName === 'VIDEO'
      ? (videoEl.querySelector('source')?.src || videoEl.src)
      : videoEl.href;
  } else {
    const text = col.textContent.trim();
    if (text) videoSrc = text;
  }

  if (!videoSrc) return;

  // Hide the video row
  videoRow.style.display = 'none';

  const card = document.createElement('div');
  card.className = 'hero-featured-video';

  // Video element for DAM videos (.mp4)
  if (videoSrc.includes('.mp4') || videoSrc.includes('/media_')) {
    const video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = false;
    video.preload = 'metadata';
    const source = document.createElement('source');
    source.src = videoSrc;
    source.type = 'video/mp4';
    video.append(source);
    card.append(video);

    // Dark loading overlay
    const overlay = document.createElement('div');
    overlay.className = 'hero-video-loading';
    card.append(overlay);

    // Play video when card appears
    const startVideo = () => {
      video.play().then(() => {
        overlay.style.transition = 'opacity 400ms ease-in 300ms';
        overlay.style.opacity = '0';
      }).catch(() => {});
    };

    card.dataset.startVideo = '';
    card.addEventListener('videostart', startVideo, { once: true });
  } else if (picture) {
    // Use thumbnail picture as fallback
    card.append(picture.cloneNode(true));
  }

  // Content overlay
  const content = document.createElement('div');
  content.className = 'hero-featured-video-content';

  const label = document.createElement('span');
  label.className = 'hero-video-label';
  label.innerHTML = '<svg viewBox="0 0 7 14" fill="white"><path d="M0 0L7 7L0 14V0Z"/></svg> Watch full Video';

  const caption = document.createElement('p');
  caption.className = 'hero-video-caption';
  caption.textContent = 'Experience the new Grand Vitara\'s intelligent design.';

  content.append(label, caption);
  card.append(content);
  block.append(card);

  // IntersectionObserver — trigger when hero ~40% scrolled
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        card.classList.add('visible');
        if (card.dataset.startVideo !== undefined) {
          setTimeout(() => card.dispatchEvent(new Event('videostart')), 500);
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  observer.observe(block);
}

export default function decorate(block) {
  const rows = Array.from(block.querySelectorAll(':scope > div'));

  // Row 1: background image
  const bgRow = rows[0];
  if (bgRow) bgRow.classList.add('hero-bg');

  // Row 2: text content
  const textRow = rows[1];
  if (textRow) {
    textRow.classList.add('hero-content');
    const col = textRow.querySelector(':scope > div');
    if (col) {
      col.classList.add('hero-content-inner');

      // Fix CTAs: if links are in a single <p> without button class, decorate them
      col.querySelectorAll('p').forEach((p) => {
        const links = p.querySelectorAll('a');
        if (links.length > 0 && !p.classList.contains('button-container')) {
          p.classList.add('button-container');
          links.forEach((a, i) => {
            a.classList.add('button');
            if (i > 0) a.classList.add('secondary');
          });
        }
      });
    }
  }

  // Row 3: video (DAM reference or URL)
  const videoRow = rows[2];

  // No-image fallback
  if (!block.querySelector('picture')) {
    block.classList.add('no-image');
  }

  // Add scroll indicator
  addScrollIndicator(block);

  // Video preview variant
  if (block.classList.contains('video-preview') && videoRow) {
    buildVideoCard(block, videoRow);
  }

  // Entry animations
  animateHeroEntry(block);
}
