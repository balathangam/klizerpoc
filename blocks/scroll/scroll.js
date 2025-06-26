export default function decorate(block) {
    const rows = [...block.children];
  
    const data = {};
    rows.forEach(row => {
      const [key, value] = row.children;
      if (key && value) {
        data[key.textContent.trim().toLowerCase()] = value.textContent.trim();
      }
    });
  
    // Clear the block before rendering
    block.innerHTML = '';
  
    // Create marquee container
    const container = document.createElement('div');
    container.className = 'scrolltext-container';
  
    const line = document.createElement('div');
    line.className = 'scrolltext-line';
    line.textContent = data.text || 'No scroll text found.';
  
    container.appendChild(line);
    block.appendChild(container);
  }
  