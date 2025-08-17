/**
 * Logistics Checkout JS
 * Version: 1.1.0
 */

class LogisticsCheckoutHandler {
  constructor() {
    this.pickupData = this.getStoreAddress();
    this.init();
  }

  init() {
    this.setupEventListeners();
    console.log('LogisticsCheckoutHandler initialized');
  }

  getStoreAddress() {
    const storeData = wcSettings?.storeData || {};

    return {
      address: storeData?.address?.address_1 || '123 Main St',
      city: storeData?.address?.city || 'Lagos',
      state: storeData?.address?.state || 'Lagos',
      countryCode: storeData?.address?.country || 'NG',
      countryName: this.getCountryName(storeData?.address?.country) || 'Nigeria',
      postalCode: storeData?.address?.postcode || '100001',
      contactName: storeData?.storeName || 'Store Manager',
      contactPhone: storeData?.address?.phone || '+2348012345678'
    };
  }

  getCountryName(countryCode) {
    const countries = {
      'NG': 'Nigeria',
      'US': 'United States',
      'UK': 'United Kingdom',
      'GH': 'Ghana',
      'KE': 'Kenya'
    };
    return countries[countryCode] || countryCode;
  }

  getOrderItemData() {
    const cartItems = wcSettings?.cartData?.items || [];
    if (cartItems.length === 0) return null;

    // For simplicity, we'll use the first item
    const firstItem = cartItems[0];

    return {
      description: firstItem.name || '',
      weight: firstItem.weight || 0,
      value: firstItem.price || 0,
      isDocument: false // Default to false unless you have a way to determine this
    };
  }

  getDeliveryData() {
    const shippingAddress = wcSettings?.checkoutData?.shipping || {};

    return {
      address: shippingAddress?.address_1 || '',
      city: shippingAddress?.city || '',
      state: shippingAddress?.state || '',
      countryCode: shippingAddress?.country || '',
      countryName: this.getCountryName(shippingAddress?.country) || '',
      postalCode: shippingAddress?.postcode || '',
      customerName: `${wcSettings?.checkoutData?.billing?.first_name || ''} ${wcSettings?.checkoutData?.billing?.last_name || ''}`.trim(),
      customerPhone: wcSettings?.checkoutData?.billing?.phone || ''
    };
  }

  getMetaData() {
    const cartItems = wcSettings?.cartData?.items || [];
    const firstItemImage = cartItems[0]?.images?.[0]?.src || '';

    return {
      images: firstItemImage ? [firstItemImage] : [],
      additionalServices: [], // Empty array by default
      insurance: {} // Empty object by default
    };
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('.wc-block-components-checkout-place-order-button')) {
        this.handleOrderSubmission();
      }
    });
  }

  handleOrderSubmission() {
    const selectedShippingMethod = document.querySelector('input[name="shipping_method[0]"]:checked')?.value;

    if (!selectedShippingMethod) {
      console.warn('No shipping method selected');
      return;
    }

    const orderData = {
      item: this.getOrderItemData(),
      pickup: this.pickupData,
      delivery: this.getDeliveryData(),
      meta: this.getMetaData()
    };

    console.log('Formatted order data:', orderData);

    // Here you would send this data to your backend
    // Example:
    // fetch('/your-api-endpoint', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(orderData)
    // });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (typeof wcSettings !== 'undefined') {
    new LogisticsCheckoutHandler();
  } else {
    const observer = new MutationObserver(() => {
      if (typeof wcSettings !== 'undefined') {
        observer.disconnect();
        new LogisticsCheckoutHandler();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
});

if (typeof jQuery !== 'undefined') {
  jQuery(document.body).on('updated_checkout', () => {
    new LogisticsCheckoutHandler();
  });
}
