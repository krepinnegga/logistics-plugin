/**
 * Logistics Checkout JS
 * Version: 1.0.7
 */

class LogisticsCheckoutHandler {
  constructor() {
    this.services = [
      { id: "delivery-glovo", name: "Glovo Delivery", fee: 50 },
      { id: "delivery-chowdeck", name: "Chowdeck Delivery", fee: 40 }
    ];

    this.selectedService = null;
    this.pickupData = {
      address: "123 Main St",
      city: "Lagos",
      state: "Lagos",
      countryCode: "NG",
      countryName: "Nigeria",
      postalCode: "100001",
      contactName: "Warehouse Manager",
      contactPhone: "+2348012345678"
    };

    this.init();
  }

  init() {
    this.injectShippingOptions();
    this.setupEventListeners();
    console.log('LogisticsCheckoutHandler initialized');
  }

  injectShippingOptions() {
    const shippingContainer = document.querySelector('.wc-block-components-shipping-rates-control__package');

    if (!shippingContainer) {
      console.warn('Shipping options container not found');
      setTimeout(() => this.injectShippingOptions(), 500);
      return;
    }

    // Clear existing injected options
    document.querySelectorAll('.logistics-shipping-option').forEach(el => el.remove());

    this.services.forEach(service => {
      const optionId = `shipping_method_${service.id}`;

      const optionHtml = `
        <div class="wc-block-components-radio-control__option logistics-shipping-option">
          <label for="${optionId}" class="wc-block-components-radio-control__option">
            <input type="radio"
                   id="${optionId}"
                   class="wc-block-components-radio-control__input"
                   name="shipping_method[0]"
                   value="${service.id}"
                   data-raw-price="${service.fee}">
            <div class="wc-block-components-radio-control__option-layout">
              <div class="wc-block-components-radio-control__label-group">
                <span class="wc-block-components-radio-control__label">${service.name}</span>
                <span class="wc-block-components-radio-control__secondary-label">
                  <span class="wc-block-checkout__shipping-option--price">₵${service.fee}</span>
                </span>
              </div>
            </div>
          </label>
        </div>
      `;

      shippingContainer.insertAdjacentHTML('beforeend', optionHtml);
    });
  }

  setupEventListeners() {
    // Handle shipping method selection
    document.addEventListener('change', (e) => {
      if (e.target.name === 'shipping_method[0]') {
        this.selectedService = this.services.find(s => s.id === e.target.value);
        this.updateShippingFee();
      }
    });

    // Re-inject options when checkout updates
    if (typeof jQuery !== 'undefined') {
      jQuery(document.body).on('updated_checkout', () => {
        this.injectShippingOptions();
      });
    }

    // Capture order data on submission
    document.addEventListener('click', (e) => {
      if (e.target.closest('.wc-block-components-checkout-place-order-button')) {
        this.handleOrderSubmission();
      }
    });
  }

  updateShippingFee() {
    if (!this.selectedService) return;

    // Update the displayed fee in the order summary
    const shippingTotal = document.querySelector('.wp-block-woocommerce-checkout-order-summary-shipping-block .wc-block-components-totals-item__value');
    if (shippingTotal) {
      shippingTotal.innerHTML = `
        <span class="wc-block-formatted-money-amount wc-block-components-formatted-money-amount">
          ₵${this.selectedService.fee}
        </span>
      `;
    }

    // Update the total
    const subtotal = parseFloat(
      document.querySelector('.wp-block-woocommerce-checkout-order-summary-subtotal-block .wc-block-components-formatted-money-amount')
        ?.textContent?.replace(/[^\d.]/g, '') || 0
    );
    const newTotal = subtotal + this.selectedService.fee;

    const totalElement = document.querySelector('.wc-block-components-totals-footer-item .wc-block-components-formatted-money-amount');
    if (totalElement) {
      totalElement.textContent = `₵${newTotal.toFixed(2)}`;
    }

    // Force WooCommerce to recalculate totals
    if (typeof jQuery !== 'undefined') {
      jQuery(document.body).trigger('update_checkout');
    }
  }

  getShippingAddress() {
    return {
      address: document.querySelector('#shipping-address_1')?.value || '',
      city: document.querySelector('#shipping-city')?.value || '',
      state: document.querySelector('#shipping-state')?.value || '',
      countryCode: document.querySelector('#shipping-country')?.value || 'NG',
      countryName: document.querySelector('#shipping-country option:checked')?.textContent || 'Nigeria',
      postalCode: document.querySelector('#shipping-postcode')?.value || '',
      customerName: `${document.querySelector('#shipping-first_name')?.value || ''} ${document.querySelector('#shipping-last_name')?.value || ''}`.trim(),
      customerPhone: document.querySelector('#shipping-phone')?.value || '',
      shippingOption: this.selectedService?.id || ''
    };
  }

  handleOrderSubmission() {
    if (!this.selectedService) {
      console.warn('No shipping method selected');
      return;
    }

    const orderData = {
      item: this.getProductData(),
      pickup: this.pickupData,
      delivery: this.getShippingAddress(),
      meta: {
        images: this.getProductImages(),
        additionalServices: [],
        insurance: { type: "basic", amount: 0 }
      }
    };

    console.log('Logistics Order Data:', orderData);
    // this.sendToLogisticsAPI(orderData);
  }

  getProductData() {
    const productItem = document.querySelector('.wc-block-components-order-summary-item');
    return {
      description: productItem?.querySelector('.wc-block-components-product-name')?.textContent || 'Product',
      weight: this.extractWeightFromDescription(productItem),
      value: parseFloat(
        productItem?.querySelector('.wc-block-components-order-summary-item__total-price .wc-block-components-formatted-money-amount')
          ?.textContent?.replace(/[^\d.]/g, '') || 0
      ),
      isDocument: false
    };
  }

  extractWeightFromDescription(productItem) {
    const metadata = productItem?.querySelector('.wc-block-components-product-metadata__description')?.textContent;
    if (metadata && metadata.match(/weight:\s*([\d.]+)/i)) {
      return parseFloat(metadata.match(/weight:\s*([\d.]+)/i)[1]);
    }
    return 1.0;
  }

  getProductImages() {
    const images = [];
    const imgElement = document.querySelector('.wc-block-components-order-summary-item__image img');
    if (imgElement && imgElement.src) {
      images.push(imgElement.src);
    }
    return images;
  }

  sendToLogisticsAPI(data) {
    return fetch('https://your-logistics-api.com/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new LogisticsCheckoutHandler();
});

// Reinitialize when checkout updates via AJAX
if (typeof jQuery !== 'undefined') {
  jQuery(document.body).on('updated_checkout', () => {
    if (!document.querySelector('.logistics-shipping-option')) {
      new LogisticsCheckoutHandler();
    }
  });
}
