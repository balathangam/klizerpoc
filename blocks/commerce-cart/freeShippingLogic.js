export default function freeShippingLogic(payload) {
   const threshold = 200; // Example: free shipping above $200
  const cartTotal = payload?.total?.includingTax?.value || 0;

  // Calculate remaining value
  const remaining = threshold - cartTotal;

  console.log(threshold,cartTotal,remaining,"calc details")

  // Find or create banner container
  let banner = document.querySelector('.free-shipping-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.className = 'free-shipping-banner';
    banner.style.cssText =
    'background:transparent;color:#0369a1;padding:10px;margin:10px 0;border-radius:6px;text-align:center;font-weight:600;border:0.5px solid';
    document.querySelector('.cart-page')?.prepend(banner); // adjust selector if needed
  }

  // Update banner text based on cart value
  if (cartTotal >= threshold) {
    banner.textContent = '🎉 You have unlocked FREE Shipping!';
  } else {
    banner.textContent = `Add $${remaining.toFixed(2)} more to unlock Free Shipping.`;
  }
  // Append banner only once, to cart container
  const cartContainer = document.querySelector('.cart-order-summary');
  if (cartContainer) {
    cartContainer.prepend(banner);
  }
}
