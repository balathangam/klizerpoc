export default function decorate(block) {
  const cards = [...block.children].map((row) => {
    const cols = row.querySelectorAll('div');
    const icon = cols[0]?.querySelector('img')?.src 
    const title = cols[1]?.textContent?.trim();
    const desc = cols[2]?.textContent?.trim();
    const ctaText = cols[3]?.textContent?.trim();
    const ctaUrl = cols[4]?.textContent?.trim();

    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div class="card-icon">
        <img src="${icon}" alt="${title}" loading="lazy" />
      </div>
      <div class="titleWrapper"><div class="card-title"><h3 class="title">${title}</h3></div>
      <div class="card-desc"><p class="desc">${desc}</p></div></div>
      <div class="card-cta"><a href="${ctaUrl}" class="cta">${ctaText}</a></div>
    `;

    return card;
  });

  block.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'cards-container';
  cards.forEach(card => container.appendChild(card));
  block.appendChild(container);
}
