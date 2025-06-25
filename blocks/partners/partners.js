
export default function decorate(block) {
    const rows = [...block.children];
  
    const content = {};
    rows.forEach((row) => {
      const key = row.children[0]?.textContent.trim().toLowerCase();
      const value = row.children[1]?.textContent.trim() 
                        || row.children[1]?.querySelector('img')?.src 
                        || '';

      if (key && value) content[key] = value;
    });

    // Clear original block content
    block.innerHTML = '';
  
    // Create new structure
    const section = document.createElement('div');
    section.className = 'partners-wrapper';
  
    if (content.header) {
      const header = document.createElement('h2');
      header.className = 'partners-header';
      header.textContent = content.header;
      section.appendChild(header);
    }
  
    const logosContainer = document.createElement('div');
    logosContainer.className = 'partners-logos';
   
    Object.entries(content).forEach(([key, value]) => {
      if (key.startsWith('logo')) {
        const img = document.createElement('img');
        img.src = value;
        img.alt = 'Partner Logo';
        img.className = 'partner-logo';
        logosContainer.appendChild(img);
      }
    });
  
    section.appendChild(logosContainer);
    block.appendChild(section);
  }
  