export default function injectFinancingWidget(productData) {
  // Find Add to Cart area inside PDP drop-in
//   const addToCartEl = document.querySelector('.product-details__buttons__add-to-cart button');
  const addToCartEl = document.querySelector('.product-details__buttons');
  console.log(addToCartEl,"addToCartEl")

  if (!addToCartEl) return;

  // Create widget container
  const widget = document.createElement('div');
  widget.classList.add('financing-widget');

  // Example financing calculation (custom logic)
  const price = (productData.prices?.final?.amount) || 0;
  console.log(price,"price")
  const emi = (price / 12).toFixed(2);

  console.log(productData,"productData")

  widget.innerHTML = `
    <div class="financing-offer">
      <strong>Easy EMI Option:</strong> Pay just $${emi}/month for 12 months.<br/>
      <button id="learn-more-financing">Learn More</button>
    </div>
  `;

  // Insert widget after Add to Cart
  addToCartEl.insertAdjacentElement('afterend', widget);

  // Custom button action
  document.querySelector('#learn-more-financing')
    .addEventListener('click', () => {
      alert(`Financing available for ${productData.name}`);
    });
}