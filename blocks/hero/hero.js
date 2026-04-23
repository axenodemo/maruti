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

function getVideoUrl(block) {
  // xwalk: check for videoUrl field hint
  const videoUrlEl = block.querySelector('[data-aue-prop="videoUrl"]');
  if (videoUrlEl && videoUrlEl.textContent.trim()) {
    return videoUrlEl.textContent.trim();
  }

  // Fallback: find video link in content
  const links = Array.from(block.querySelectorAll('a'));
  const videoLink = links.find((link) => {
    const { href } = link;
    return href && (href.includes('youtube') || href.includes('youtu.be') || href.includes('vimeo'));
  });
  if (videoLink) {
    const url = videoLink.href;
    const buttonContainer = videoLink.closest('.button-container');
    if (buttonContainer) {
      buttonContainer.remove();
    } else {
      videoLink.remove();
    }
    return url;
  }
  return null;
}

/**
 * Build the featured video card (bottom-right thumbnail with "Watch full Video")
 * matching Figma node 6124:26150
 */
function buildFeaturedVideoCard(block, videoUrl) {
  // Find video thumbnail — second picture in the block, or a dedicated row
  const rows = Array.from(block.querySelectorAll(':scope > div'));
  let thumbnail = null;
  let description = '';

  // Look for a row that contains a second picture (video thumbnail)
  rows.forEach((row) => {
    const pics = row.querySelectorAll('picture');
    const texts = row.querySelectorAll('p');
    if (pics.length > 0 && row !== rows[0]) {
      [thumbnail] = pics;
      if (texts.length > 0) {
        description = texts[0].textContent.trim();
      }
      row.remove();
    }
  });

  const card = document.createElement('div');
  card.className = 'hero-featured-video';

  // Thumbnail image
  if (thumbnail) {
    card.append(thumbnail);
  }

  // Content overlay
  const content = document.createElement('div');
  content.className = 'hero-featured-video-content';

  // Play button with triangle icon
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

  if (description) {
    const desc = document.createElement('p');
    desc.textContent = description;
    content.append(desc);
  }

  card.append(content);

  // Click anywhere on card opens video
  card.addEventListener('click', () => {
    openVideoModal(videoUrl);
  });

  block.append(card);
}

function decorateVideoPreview(block) {
  const videoUrl = getVideoUrl(block);
  if (!videoUrl) return;
  buildFeaturedVideoCard(block, videoUrl);
}

export default function decorate(block) {
  if (!block.querySelector(':scope > div:first-child picture')) {
    block.classList.add('no-image');
  }

  if (block.classList.contains('video-preview')) {
    decorateVideoPreview(block);
  }
}
