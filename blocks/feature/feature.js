export default function decorate(block) {
  const data = {};

  const rows = [...block.children];
  rows.forEach((row) => {
    const cols = row.querySelectorAll('div');
    const key = cols[0]?.textContent?.trim();
    const value = cols[1]?.textContent?.trim();
    if (key && value) {
      data[key] = value;
    }
  });

  const container = document.createElement('div');
  container.className = 'featuretext-container';

  container.innerHTML = `
    <div class="featuretext-wrapper">
      <h2 class="featuretext-title">
        <span class="title-part-one">${data.title_one || ''}</span><br>
        <span class="title-part-two">${data.title_two || ''}</span>
      </h2>
      <p class="featuretext-description">${data.feature_text || ''}</p>
    </div>
  `;

  block.innerHTML = '';
  block.append(container);
}
