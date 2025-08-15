/**
 * Logistics Checkout JS
 * Version: 1.0.2
 */
(function(window, document) {
  'use strict';

  const config = {
      debug: true,
      selectors: {
          checkoutForm: 'form.woocommerce-checkout',
          bannerContainer: '#logistics-banner-container'
      }
  };

  class LogisticsCheckout {
      constructor() {
          this.init();
      }

      init() {
         console.log('Logging here....');
          if (!this.isCheckoutPage()) return;

          this.injectBanner();
          this.bindEvents();


          if (config.debug) {
              console.log('Logistics Checkout initialized');
          }
      }

      isCheckoutPage() {
          return !!document.querySelector(config.selectors.checkoutForm);
      }

      injectBanner() {
          if (document.querySelector(config.selectors.bannerContainer)) return;

          console.log('injecting banner here....');

          const banner = document.createElement('div');
          banner.id = 'logistics-banner-container';
          banner.innerHTML = `
              <div style="
                  padding: 15px;
                  background:rgb(184, 16, 16);
                  color: white;
                  text-align: center;
                  margin-bottom: 20px;
                  font-size: 25px;
              ">
                  Hello from External JS!
              </div>
          `;

          const checkoutForm = document.querySelector(config.selectors.checkoutForm);
          if (checkoutForm) {
              checkoutForm.parentNode.insertBefore(banner, checkoutForm);
          }
      }

      bindEvents() {
          // Example: Handle form changes
          document.addEventListener('change', (e) => {
              if (e.target.closest(config.selectors.checkoutForm)) {
                  this.onCheckoutChange(e);
              }
          });
      }

      onCheckoutChange(event) {
          if (config.debug) {
              console.log('Checkout field changed', event.target);
          }
      }
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
      new LogisticsCheckout();
  });

  // Error tracking
window.addEventListener('error', (e) => {
  if (window.logisticsData && window.logisticsData.ajax_url) {
      fetch(window.logisticsData.ajax_url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
              action: 'logistics_error',
              message: e.message,
              stack: e.error?.stack || '',
              nonce: window.logisticsData.nonce
          })
      });
  }
});

  // Make available globally if needed
  window.LogisticsCheckout = LogisticsCheckout;

})(window, document);
