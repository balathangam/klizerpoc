import { events } from '@dropins/tools/event-bus.js';
import { render as provider } from '@dropins/storefront-cart/render.js';
import * as Cart from '@dropins/storefront-cart/api.js';

// Dropin Containers
import CartSummaryList from '@dropins/storefront-cart/containers/CartSummaryList.js';
import OrderSummary from '@dropins/storefront-cart/containers/OrderSummary.js';
import EstimateShipping from '@dropins/storefront-cart/containers/EstimateShipping.js';
import EmptyCart from '@dropins/storefront-cart/containers/EmptyCart.js';
import Coupons from '@dropins/storefront-cart/containers/Coupons.js';
import GiftCards from '@dropins/storefront-cart/containers/GiftCards.js';
import GiftOptions from '@dropins/storefront-cart/containers/GiftOptions.js';

// API
import { publishShoppingCartViewEvent } from '@dropins/storefront-cart/api.js';

// Initializers
import '../../scripts/initializers/cart.js';

import { readBlockConfig } from '../../scripts/aem.js';
import { rootLink } from '../../scripts/scripts.js';
import freeShippingLogic from './freeShippingLogic.js';
import fetchDynamicPrice from '../../scripts/custom_dropins/appBuilderActions/fetchERpprice.js';

// import { updateProductsFromCart } from '@/cart/api/updateProductsFromCart';

import { updateProductsFromCart } from '@dropins/storefront-cart/api.js';
import showERPMessage from '../../scripts/custom_dropins/uicustoms/showAlerts.js';

// --- ERP Stock API ---
const basicauthtoken = 'ZDc0MzRlMTUtMjc5Yi00ZmVlLWIzMjktYWU4NmM2MmE3YThlOndQZm5sU0lyNDR2NXJvR3c1UzYyZmhJYTRCcWkyMUxoM3czV2xRRzZtbjRYR3AyMGtMSDVEaDhiQWowRWFVYTE=';

async function fetchERPStock(sku) {
  const resp = await fetch(
    'https://adobeioruntime.net/api/v1/web/3676633-kiransampleapp-stage/default/FetchERPprice',
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicauthtoken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sku }),
    }
  );
  if (!resp.ok) throw new Error(`ERP API error for SKU ${sku}: ${resp.status}`);
  return resp.json();
}

export default async function decorate(block) {
  // Configuration
  const {
    'hide-heading': hideHeading = 'false',
    'max-items': maxItems,
    'hide-attributes': hideAttributes = '',
    'enable-item-quantity-update': enableUpdateItemQuantity = 'false',
    'enable-item-remove': enableRemoveItem = 'true',
    'enable-estimate-shipping': enableEstimateShipping = 'false',
    'start-shopping-url': startShoppingURL = '',
    'checkout-url': checkoutURL = '',
  } = readBlockConfig(block);

  const cart = Cart.getCartDataFromCache();
  const isEmptyCart = isCartEmpty(cart);

  // Layout
  const fragment = document.createRange().createContextualFragment(`
    <div class="cart__wrapper">
      <div class="cart__left-column">
        <div class="cart__list"></div>
      </div>
      <div class="cart__right-column">
        <div class="cart__order-summary"></div>
        <div class="cart__gift-options"></div>
      </div>
    </div>

    <div class="cart__empty-cart"></div>

    <div id="erp-message-popup" class="erp-popup hidden">
      <div class="erp-popup-content">
        <p class="erp-popup-message"></p>
        <button id="erp-ok" class="erp-btn ok">OK</button>
      </div>
    </div>
  `);

  const $wrapper = fragment.querySelector('.cart__wrapper');
  const $list = fragment.querySelector('.cart__list');
  const $summary = fragment.querySelector('.cart__order-summary');
  const $emptyCart = fragment.querySelector('.cart__empty-cart');
  const $giftOptions = fragment.querySelector('.cart__gift-options');

  block.innerHTML = '';
  block.appendChild(fragment);

  function toggleEmptyCart(state) {
    if (state) {
      $wrapper.setAttribute('hidden', '');
      $emptyCart.removeAttribute('hidden');
    } else {
      $wrapper.removeAttribute('hidden');
      $emptyCart.setAttribute('hidden', '');
    }
  }

  toggleEmptyCart(isEmptyCart);

  // Render Containers
  await Promise.all([
    provider.render(CartSummaryList, {
      hideHeading: hideHeading === 'true',
      routeProduct: (product) =>
        rootLink(`/products/${product.url.urlKey}/${product.topLevelSku}`),
      routeEmptyCartCTA: startShoppingURL
        ? () => rootLink(startShoppingURL)
        : undefined,
      maxItems: parseInt(maxItems, 10) || undefined,
      attributesToHide: hideAttributes.split(',').map((attr) => attr.trim().toLowerCase()),
      enableUpdateItemQuantity: enableUpdateItemQuantity === 'true',
      enableRemoveItem: enableRemoveItem === 'true',
    })($list),

    provider.render(OrderSummary, {
      routeProduct: (product) =>
        rootLink(`/products/${product.url.urlKey}/${product.topLevelSku}`),
      routeCheckout: checkoutURL ? () => rootLink(checkoutURL) : undefined,
      slots: {
        EstimateShipping: async (ctx) => {
          if (enableEstimateShipping === 'true') {
            const wrapper = document.createElement('div');
            await provider.render(EstimateShipping, {})(wrapper);
            ctx.replaceWith(wrapper);
          }
        },
        Coupons: (ctx) => {
          const coupons = document.createElement('div');
          provider.render(Coupons)(coupons);
          ctx.appendChild(coupons);
        },
        GiftCards: (ctx) => {
          const giftCards = document.createElement('div');
          provider.render(GiftCards)(giftCards);
          ctx.appendChild(giftCards);
        },
      },
    })($summary),

    provider.render(EmptyCart, {
      routeCTA: startShoppingURL ? () => rootLink(startShoppingURL) : undefined,
    })($emptyCart),

    provider.render(GiftOptions, {
      view: 'order',
      dataSource: 'cart',
    })($giftOptions),
  ]);

  let cartViewEventPublished = false;

  // --- ERP Stock Validation on Cart Event ---
  events.on(
    'cart/data',
    async (payload) => {
      toggleEmptyCart(isCartEmpty(payload));

      if (!cartViewEventPublished) {
        cartViewEventPublished = true;
        publishShoppingCartViewEvent();
      }

      freeShippingLogic(payload);

      if (!payload?.items?.length) return;

      // Check each SKU in the cart
      for (const item of payload.items) {
        try {
          const erpData = await fetchDynamicPrice(item.sku);

          if (erpData?.dynamicPrice && (erpData?.stock == 0 || erpData?.stock == null || item?.quantity > erpData?.stock)) {
            let message1 = (item?.quantity > erpData?.stock && erpData?.stock !== null)
              ? `The product "${item.name}" has a quantity in your cart (${item.quantity}) exceeding the available stock in ERP (${erpData.stock}).\n\nThe cart quantity will be updated.`
              : `The product "${item.name}" is Out of Stock in ERP.\n\nThe item will be removed from your cart.`;
          
            showERPMessage(message1, () => {
              try {
                updateProductsFromCart([
                  {             
                    uid: item.uid,
                    quantity: (item?.quantity > erpData?.stock && erpData?.stock !== null) ? erpData?.stock : 0,
                  },
                ]);
          
                let message2 = (item?.quantity > erpData?.stock && erpData?.stock !== null)
                  ? `"${item.name}" has been updated in your cart based on ERP stock.`
                  : `"${item.name}" has been removed/updated from your cart.`;
          
                showERPMessage(message2); // second popup after first is dismissed
              } catch (err) {
                console.error('Failed to remove/update item:', err);
              }
            });
          }
          
        } catch (err) {
          console.warn('ERP check failed:', err);
        }
      }
    },
    { eager: true }
  );

  return Promise.resolve();
}

function isCartEmpty(cart) {
  return cart ? cart.totalQuantity < 1 : true;
}
