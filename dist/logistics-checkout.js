/**
 * Logistics Checkout JS
 * Version: 1.0.8
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

    this.services.forEach((service, index) => {
      const optionId = `radio-control-${index}-${service.id}`;
      const isFirst = index === 0;
      const isLast = index === this.services.length - 1;

      const optionHtml = `
        <label class="wc-block-components-radio-control__option logistics-shipping-option
          ${isFirst ? 'wc-block-components-radio-control--highlight-checked--first-selected' : ''}
          ${isLast ? 'wc-block-components-radio-control--highlight-checked--last-selected' : ''}
          wc-block-components-radio-control--highlight-checked"
          for="${optionId}">
          <input id="${optionId}"
                 class="wc-block-components-radio-control__input"
                 type="radio"
                 name="shipping_method[0]"
                 aria-describedby="${optionId}__secondary-label"
                 aria-disabled="false"
                 value="${service.id}"
                 data-raw-price="${service.fee}">
          <div class="wc-block-components-radio-control__option-layout">
            <div class="wc-block-components-radio-control__label-group">
              <span id="${optionId}__label" class="wc-block-components-radio-control__label">${service.name}</span>
              <span id="${optionId}__secondary-label" class="wc-block-components-radio-control__secondary-label">
                <span class="wc-block-checkout__shipping-option--price">₵${service.fee}</span>
              </span>
            </div>
          </div>
        </label>
      `;

      shippingContainer.insertAdjacentHTML('beforeend', optionHtml);
    });

    // Uncheck free shipping if our options are present
    const freeShippingInput = document.querySelector('input[value="free_shipping:1"]');
    if (freeShippingInput && document.querySelector('.logistics-shipping-option')) {
      freeShippingInput.checked = false;
    }
  }

  setupEventListeners() {
    // Handle shipping method selection
    document.addEventListener('change', (e) => {
      if (e.target.name === 'shipping_method[0]') {
        if (e.target.value === 'free_shipping:1') {
          this.selectedService = null;
        } else {
          this.selectedService = this.services.find(s => s.id === e.target.value);
        }
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
    // Update the displayed fee in the order summary
    const shippingTotal = document.querySelector('.wp-block-woocommerce-checkout-order-summary-shipping-block .wc-block-components-totals-item__value');
    if (shippingTotal) {
      shippingTotal.innerHTML = this.selectedService
        ? `<span class="wc-block-formatted-money-amount wc-block-components-formatted-money-amount">₵${this.selectedService.fee}</span>`
        : `<strong>Free</strong>`;
    }

    // Update the total
    const subtotal = parseFloat(
      document.querySelector('.wp-block-woocommerce-checkout-order-summary-subtotal-block .wc-block-components-formatted-money-amount')
        ?.textContent?.replace(/[^\d.]/g, '') || 0
    );
    const newTotal = subtotal + (this.selectedService?.fee || 0);

    const totalElement = document.querySelector('.wc-block-components-totals-footer-item .wc-block-components-formatted-money-amount');
    if (totalElement) {
      totalElement.textContent = `₵${newTotal.toFixed(2)}`;
    }

    // Force WooCommerce to recalculate totals
    if (typeof jQuery !== 'undefined') {
      jQuery(document.body).trigger('update_checkout');
    }
  }

  // ... (keep all other methods the same as previous implementation)
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
