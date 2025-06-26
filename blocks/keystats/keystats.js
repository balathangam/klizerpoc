export default function decorate(block) {
    const rows = [...block.children];
  
    const container = document.createElement('div');
    container.className = 'stats-container';
  
    rows.forEach((row, index) => {
      const [labelCell, valueCell] = row.children;
      const stat = document.createElement('div');
      stat.className = 'stat-item';
  
      // Add "no-border" class to the last item to skip right border
      if (index === rows.length - 1) {
        stat.classList.add('no-border');
      }
  
      stat.innerHTML = `
        <div class="stat-value">${valueCell?.textContent.trim()}</div>
        <div class="stat-label">${labelCell?.textContent.trim()}</div>
      `;
  
      container.appendChild(stat);
    });
  
    block.innerHTML = '';
    block.appendChild(container);
  }
  