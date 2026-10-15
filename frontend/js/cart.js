/**
 * VÉLORA Atelier - Shopping Cart & Wishlist State Store
 * Handles client-side cart logic, free shipping threshold calculations,
 * coupon redemption, and persistence with LocalStorage.
 */

class CartStore {
  constructor() {
    this.storageKey = 'velora_cart_items';
    this.wishlistKey = 'velora_wishlist_ids';
    this.items = this.loadCart();
    this.wishlist = this.loadWishlist();
    this.appliedPromo = null;
    this.freeShippingThreshold = 150; // $150 unlocks free express courier
    this.standardShippingFee = 15;
    this.listeners = [];
  }

  // --- Cart Persistence & Retrieval ---
  loadCart() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading cart from storage', e);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
      this.notify();
    } catch (e) {
      console.error('Error saving cart to storage', e);
    }
  }

  // --- Wishlist Persistence & Retrieval ---
  loadWishlist() {
    try {
      const saved = localStorage.getItem(this.wishlistKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  saveWishlist() {
    try {
      localStorage.setItem(this.wishlistKey, JSON.stringify(this.wishlist));
      this.notify();
    } catch (e) {
      console.error('Error saving wishlist', e);
    }
  }

  // --- Subscriber Pattern ---
  subscribe(callback) {
    this.listeners.push(callback);
    callback(this);
  }

  notify() {
    this.listeners.forEach(cb => cb(this));
  }

  // --- Cart Operations ---
  addItem(product, size, color, quantity = 1) {
    if (!product || !size) return false;

    // Unique cart item key based on product ID, selected size, and color
    const cartItemId = `${product.id}_${size}_${(color?.name || 'Default').replace(/\s+/g, '')}`;

    const existingIndex = this.items.findIndex(item => item.cartItemId === cartItemId);

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        cartItemId,
        productId: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        size: size,
        color: color ? color.name : (product.colors?.[0]?.name || 'Standard'),
        colorHex: color ? color.hex : '#111111',
        image: product.images?.[0] || '',
        quantity: quantity
      });
    }

    this.saveCart();
    return true;
  }

  updateQuantity(cartItemId, delta) {
    const item = this.items.find(i => i.cartItemId === cartItemId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(cartItemId);
    } else {
      this.saveCart();
    }
  }

  removeItem(cartItemId) {
    this.items = this.items.filter(i => i.cartItemId !== cartItemId);
    this.saveCart();
  }

  clearCart() {
    this.items = [];
    this.appliedPromo = null;
    this.saveCart();
  }

  getItemCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  // --- Financial Calculations ---
  getSubtotal() {
    return this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  getFreeShippingProgress() {
    const subtotal = this.getSubtotal();
    const remaining = Math.max(0, this.freeShippingThreshold - subtotal);
    const percentage = Math.min(100, Math.round((subtotal / this.freeShippingThreshold) * 100));
    return {
      unlocked: subtotal >= this.freeShippingThreshold || this.appliedPromo?.discountType === 'shipping',
      remaining,
      percentage
    };
  }

  getShippingFee() {
    if (this.items.length === 0) return 0;
    if (this.getSubtotal() >= this.freeShippingThreshold) return 0;
    if (this.appliedPromo?.discountType === 'shipping') return 0;
    return this.standardShippingFee;
  }

  getDiscountAmount() {
    if (!this.appliedPromo) return 0;
    const subtotal = this.getSubtotal();

    if (this.appliedPromo.discountType === 'percent') {
      return (subtotal * this.appliedPromo.value) / 100;
    }
    if (this.appliedPromo.discountType === 'fixed') {
      return Math.min(this.appliedPromo.value, subtotal);
    }
    return 0; // Shipping discounts are handled by getShippingFee()
  }

  getTaxAmount() {
    const taxableAmount = Math.max(0, this.getSubtotal() - this.getDiscountAmount());
    return Math.round(taxableAmount * 0.08 * 100) / 100; // Standard 8% simulated tax
  }

  getFinalTotal() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    const discount = this.getDiscountAmount();
    const shipping = this.getShippingFee();
    const tax = this.getTaxAmount();
    return Math.max(0, subtotal - discount + shipping + tax);
  }

  applyPromo(promoResult) {
    this.appliedPromo = promoResult;
    this.notify();
  }

  removePromo() {
    this.appliedPromo = null;
    this.notify();
  }

  // --- Wishlist Operations ---
  toggleWishlist(productId) {
    const index = this.wishlist.indexOf(productId);
    let added = false;
    if (index > -1) {
      this.wishlist.splice(index, 1);
      added = false;
    } else {
      this.wishlist.push(productId);
      added = true;
    }
    this.saveWishlist();
    return added;
  }

  isInWishlist(productId) {
    return this.wishlist.includes(productId);
  }

  getWishlistCount() {
    return this.wishlist.length;
  }
}

// Global Cart Store instance
window.cartStore = new CartStore();
