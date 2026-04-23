function createVideoModal() {
  const overlay = document.createElement('div');
  overlay.className = 'hero-video-modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'hero-video-modal-dialog';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'hero-video-modal-close';
  closeBtn.setAttribute('aria-label', 'Close video');
  closeBtn.innerHTML = '<span>&times;</span>';
  closeBtn.addEventListener('click', () => {
    overlay.remove();
    document.body.style.overflow = '';
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('keydown', function handler(e) {
    if (e.key === 'Escape' && document.querySelector('.hero-video-modal-overlay')) {
      overlay.remove();
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handler);
    }
  });

  modal.append(closeBtn);
  overlay.append(modal);
  return { overlay, modal };
}

function getVideoEmbedUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      let videoId = '';
      if (u.hostname.includes('youtu.be')) {
        videoId = u.pathname.slice(1);
      } else {
        videoId = u.searchParams.get('v') || u.pathname.split('/').pop();
      }
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    if (u.hostname.includes('vimeo.com')) {
      const vimeoId = u.pathname.split('/').pop();
      return `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
    }
    return url;
  } catch {
    return url;
  }
}

function openVideoModal(videoUrl) {
  const { overlay, modal } = createVideoModal();
  const embedUrl = getVideoEmbedUrl(videoUrl);
  const iframe = document.createElement('iframe');
  iframe.src = embedUrl;
  iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('frameborder', '0');
  modal.append(iframe);
  document.body.append(overlay);
  document.body.style.overflow = 'hidden';
}

/**
 * Build the featured video card (bottom-right thumbnail with "Watch full Video")
 * matching Figma node 6124:26150.
 * Uses the hero background image as the video card thumbnail.
 */
function buildFeaturedVideoCard(block, videoUrl, heroImage) {
  const card = document.createElement('div');
  card.className = 'hero-featured-video';

  // Clone the hero background image as thumbnail
  if (heroImage) {
    const thumb = heroImage.cloneNode(true);
    card.append(thumb);
  }

  // Content overlay with play button + description
  const content = document.createElement('div');
  content.className = 'hero-featured-video-content';

  const playBtn = document.createElement('button');
  playBtn.className = 'hero-featured-video-play';
  playBtn.setAttribute('aria-label', 'Watch full video');
  playBtn.innerHTML = '<svg viewBox="0 0 7 14" xmlns="http://www.w3.org/2000/svg"><path d="M0 0L7 7L0 14V0Z"/></svg><span>Watch full Video</span>';

  playBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openVideoModal(videoUrl);
  });

  content.append(playBtn);

  card.addEventListener('click', () => {
    openVideoModal(videoUrl);
  });

  card.append(content);
  block.append(card);
}

/**
 * Decorate hero block.
 *
 * xwalk model (3 cells after field collapsing, each cell = 1 row):
 *   Row 1: image + imageAlt (picture with alt — collapsed)
 *   Row 2: text (richtext — heading, subtitle, CTAs)
 *   Row 3: videoUrl (text — YouTube/Vimeo URL, empty for default hero)
 */
export default function decorate(block) {
  const rows = Array.from(block.querySelectorAll(':scope > div'));
  const imageCol = rows[0] ? rows[0].querySelector(':scope > div') : null;
  const textCol = rows[1] ? rows[1].querySelector(':scope > div') : null;
  const videoUrlCol = rows[2] ? rows[2].querySelector(':scope > div') : null;

  // Extract the picture element for full-width background
  const picture = imageCol ? imageCol.querySelector('picture') : null;

  // Extract video URL from col 4
  const videoUrl = videoUrlCol ? videoUrlCol.textContent.trim() : '';

  // Restructure: clear block and rebuild with bg image + content overlay
  block.textContent = '';

  // Background image container
  const bgDiv = document.createElement('div');
  bgDiv.className = 'hero-bg';
  if (picture) {
    bgDiv.append(picture);
  } else {
    block.classList.add('no-image');
  }
  block.append(bgDiv);

  // Content overlay
  const contentDiv = document.createElement('div');
  contentDiv.className = 'hero-content';
  if (textCol) {
    while (textCol.firstChild) {
      contentDiv.append(textCol.firstChild);
    }
  }
  block.append(contentDiv);

  // Video preview variant: build featured video card
  if (block.classList.contains('video-preview') && videoUrl) {
    buildFeaturedVideoCard(block, videoUrl, picture);
  }
}
