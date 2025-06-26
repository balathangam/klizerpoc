export default function decorate(block) {
    const rows = [...block.children];
  
    const data = {};
    rows.forEach(row => {
      const [key, value] = row.children;
      if (!key || !value) return;
  
      const name = key.textContent.trim().toLowerCase();
      if (name === 'youtube_url') {
        data.url = value.textContent.trim();
      } else if (name === 'youtube_thumbnail_image') {
        const img = value.querySelector('img');
        if (img) {
          data.thumbnail = img.src;
          data.alt = img.alt || 'YouTube Video';
        }
      }
    });
  
    // Cleanup
    block.innerHTML = '';
  
    if (!data.url) {
      block.textContent = 'No YouTube URL provided.';
      return;
    }
  
    // Extract YouTube video ID
    const videoId = data.url.split('/').pop();
  
    // Render thumbnail and embed iframe on click
    const wrapper = document.createElement('div');
    wrapper.className = 'youtube-wrapper';
  
    const thumbnail = document.createElement('img');
    thumbnail.src = data.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    thumbnail.alt = data.alt || 'YouTube Video Thumbnail';
    thumbnail.className = 'youtube-thumb';
  
    const playBtn = document.createElement('div');
    playBtn.className = 'youtube-play';
    playBtn.innerHTML = '&#9658;'; // ▶ play icon
  
    wrapper.appendChild(thumbnail);
    wrapper.appendChild(playBtn);
    block.appendChild(wrapper);
  
    wrapper.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('allow', 'autoplay; encrypted-media');
      iframe.className = 'youtube-iframe';
  
      block.innerHTML = '';
      block.appendChild(iframe);
    });
  }
  