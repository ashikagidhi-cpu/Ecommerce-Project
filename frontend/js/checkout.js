/**
 * VÉLORA Atelier - Checkout & Order Processing Controller
 * Multi-step checkout simulation: Shipping -> Delivery Speed -> Payment -> Confirmation
 */

class CheckoutController {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 3;
    this.shippingData = {};
    this.selectedShippingMethod = 'standard';
    this.shippingCost = 0;
    this.initListeners();
  }

  initListeners() {
    // Open checkout modal trigger from Cart Drawer
    const proceedBtn = document.getElementById('btnProceedToCheckout');
    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => this.openCheckout());
    }

    // Step navigation buttons
    const nextBtn = document.getElementById('btnCheckoutNext');
    const backBtn = document.getElementById('btnCheckoutBack');
    const submitBtn = document.getElementById('btnCheckoutSubmit');

    if (nextBtn) nextBtn.addEventListener('click', () => this.goToNextStep());
    if (backBtn) backBtn.addEventListener('click', () => this.goToPrevStep());
    if (submitBtn) submitBtn.addEventListener('click', () => this.submitOrder());

    // Live Card Input Mirroring
    const cardNumInput = document.getElementById('checkoutCardNumber');
    const cardNameInput = document.getElementById('checkoutCardName');
    const cardExpInput = document.getElementById('checkoutCardExp');

    if (cardNumInput) {
      cardNumInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 16);
        let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
        e.target.value = formatted;
        document.getElementById('cardPreviewNumber').textContent = formatted || '•••• •••• •••• ••••';
      });
    }

    if (cardNameInput) {
      cardNameInput.addEventListener('input', (e) => {
        document.getElementById('cardPreviewHolder').textContent = e.target.value.toUpperCase() || 'YOUR NAME';
      });
    }

    if (cardExpInput) {
      cardExpInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
        e.target.value = val;
        document.getElementById('cardPreviewExpiry').textContent = val || 'MM/YY';
      });
    }

    // Shipping Method Radio Toggle
    const shippingRadios = document.querySelectorAll('input[name="shippingMethod"]');
    shippingRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.selectedShippingMethod = e.target.value;
        this.updateCheckoutSummary();
      });
    });
  }

  openCheckout() {
    if (!window.cartStore || window.cartStore.items.length === 0) {
      window.UI.showToast('Your bag is currently empty.', 'error');
      return;
    }

    // Hide cart offcanvas
    const cartOffcanvasEl = document.getElementById('offcanvasCart');
    if (cartOffcanvasEl && window.bootstrap) {
      const offcanvas = bootstrap.Offcanvas.getInstance(cartOffcanvasEl);
      if (offcanvas) offcanvas.hide();
    }

    this.currentStep = 1;
    this.renderStepView();
    this.updateCheckoutSummary();

    // Show checkout modal
    const checkoutModalEl = document.getElementById('checkoutModal');
    if (checkoutModalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getOrCreateInstance(checkoutModalEl);
      modal.show();
    }
  }

  renderStepView() {
    // Stepper pills
    for (let i = 1; i <= this.totalSteps; i++) {
      const indicator = document.getElementById(`checkoutStepIndicator${i}`);
      if (indicator) {
        if (i === this.currentStep) {
          indicator.classList.add('active');
        } else if (i < this.currentStep) {
          indicator.classList.add('completed');
          indicator.classList.remove('active');
        } else {
          indicator.classList.remove('active', 'completed');
        }
      }

      // Step content panels
      const panel = document.getElementById(`checkoutStepPanel${i}`);
      if (panel) {
        if (i === this.currentStep) panel.classList.remove('d-none');
        else panel.classList.add('d-none');
      }
    }

    // Button states
    const backBtn = document.getElementById('btnCheckoutBack');
    const nextBtn = document.getElementById('btnCheckoutNext');
    const submitBtn = document.getElementById('btnCheckoutSubmit');

    if (backBtn) backBtn.style.display = this.currentStep === 1 ? 'none' : 'inline-flex';
    if (nextBtn) nextBtn.style.display = this.currentStep === this.totalSteps ? 'none' : 'inline-flex';
    if (submitBtn) submitBtn.style.display = this.currentStep === this.totalSteps ? 'inline-flex' : 'none';
  }

  goToNextStep() {
    if (this.currentStep === 1) {
      // Validate Step 1 Form
      const form = document.getElementById('checkoutShippingForm');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      this.shippingData = {
        name: document.getElementById('checkoutName').value,
        email: document.getElementById('checkoutEmail').value,
        address: document.getElementById('checkoutAddress').value,
        city: document.getElementById('checkoutCity').value,
        postal: document.getElementById('checkoutPostal').value,
        country: document.getElementById('checkoutCountry').value
      };
    }

    this.currentStep = Math.min(this.totalSteps, this.currentStep + 1);
    this.renderStepView();
  }

  goToPrevStep() {
    this.currentStep = Math.max(1, this.currentStep - 1);
    this.renderStepView();
  }

  updateCheckoutSummary() {
    const listEl = document.getElementById('checkoutReviewItemsList');
    const subtotalEl = document.getElementById('checkoutSummarySubtotal');
    const shippingEl = document.getElementById('checkoutSummaryShipping');
    const totalEl = document.getElementById('checkoutSummaryTotal');

    if (!window.cartStore) return;

    if (listEl) {
      listEl.innerHTML = window.cartStore.items.map(item => `
        <div class="d-flex justify-content-between align-items-center py-2 border-bottom border-subtle fs-7">
          <div>
            <div class="fw-bold">${item.name}</div>
            <div class="text-muted">${item.size} • ${item.color} (x${item.quantity})</div>
          </div>
          <div class="fw-semibold">${window.UI.formatMoney(item.price * item.quantity)}</div>
        </div>
      `).join('');
    }

    const subtotal = window.cartStore.getSubtotal();
    let shipping = window.cartStore.getShippingFee();
    if (this.selectedShippingMethod === 'express') {
      shipping += 15; // Express priority upgrade
    }
    const discount = window.cartStore.getDiscountAmount();
    const finalTotal = Math.max(0, subtotal - discount + shipping);

    if (subtotalEl) subtotalEl.textContent = window.UI.formatMoney(subtotal);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : window.UI.formatMoney(shipping);
    if (totalEl) totalEl.textContent = window.UI.formatMoney(finalTotal);
  }

  async submitOrder() {
    const paymentForm = document.getElementById('checkoutPaymentForm');
    if (paymentForm && !paymentForm.checkValidity()) {
      paymentForm.reportValidity();
      return;
    }

    const submitBtn = document.getElementById('btnCheckoutSubmit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Securing Order...`;
    }

    const orderPayload = {
      customer: this.shippingData,
      shippingMethod: this.selectedShippingMethod,
      items: window.cartStore.items,
      subtotal: window.cartStore.getSubtotal(),
      discount: window.cartStore.getDiscountAmount(),
      shipping: window.cartStore.getShippingFee(),
      total: window.cartStore.getFinalTotal(),
      promoCode: window.cartStore.appliedPromo?.code || null
    };

    try {
      const response = await window.clothingAPI.createOrder(orderPayload);
      if (response && response.success) {
        // Clear Cart
        window.cartStore.clearCart();

        // Close Checkout Modal
        const checkoutModalEl = document.getElementById('checkoutModal');
        if (checkoutModalEl && window.bootstrap) {
          bootstrap.Modal.getInstance(checkoutModalEl)?.hide();
        }

        // Show Confirmation Modal
        this.showConfirmation(response.order);
      }
    } catch (err) {
      window.UI.showToast('Payment processing encountered an error. Please try again.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `Complete Purchase`;
      }
    }
  }

  showConfirmation(order) {
    const orderIdEl = document.getElementById('confirmOrderId');
    const dateEl = document.getElementById('confirmOrderDate');
    const customerEl = document.getElementById('confirmCustomerName');
    const addressEl = document.getElementById('confirmCustomerAddress');
    const totalEl = document.getElementById('confirmOrderTotal');
    const itemsListEl = document.getElementById('confirmItemsList');

    if (orderIdEl) orderIdEl.textContent = order.orderId;
    if (dateEl) dateEl.textContent = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (customerEl) customerEl.textContent = order.customer.name;
    if (addressEl) addressEl.textContent = `${order.customer.address}, ${order.customer.city}, ${order.customer.country}`;
    if (totalEl) totalEl.textContent = window.UI.formatMoney(order.total);

    if (itemsListEl) {
      itemsListEl.innerHTML = order.items.map(item => `
        <div class="d-flex justify-content-between py-1 border-bottom border-subtle">
          <span>${item.name} (${item.size}) × ${item.quantity}</span>
          <span class="fw-bold">${window.UI.formatMoney(item.price * item.quantity)}</span>
        </div>
      `).join('');
    }

    const confirmModalEl = document.getElementById('orderSuccessModal');
    if (confirmModalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getOrCreateInstance(confirmModalEl);
      modal.show();
    }
  }
}

window.checkoutController = new CheckoutController();
