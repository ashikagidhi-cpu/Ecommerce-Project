/**
 * VÉLORA Atelier - UI Renderer & Interaction Engine
 * Renders product cards, modals, slide-out drawers, checkout stepper,
 * live toast messages, and dark/light mode toggles.
 */

const UI = {
  activeQuickViewProduct: null,
  selectedModalSize: null,
  selectedModalColor: null,
  activeCurrency: 'USD',
  currencyRates: {
    USD: { symbol: '$', rate: 1.0 },
    EUR: { symbol: '€', rate: 0.92 },
    GBP: { symbol: '£', rate: 0.79 },
    INR: { symbol: '₹', rate: 83.5 }
  },

  /**
   * Currency formatter helper
   */
  formatMoney(amountInUSD) {
    if (amountInUSD === null || amountInUSD === undefined) return '';
    const config = this.currencyRates[this.activeCurrency] || this.currencyRates.USD;
    const converted = Math.round(amountInUSD * config.rate);
    return `${config.symbol}${converted.toLocaleString()}`;
  },

  /**
   * Render product grid cards
   */
  renderProducts(products, containerEl) {
    if (!containerEl) return;

    if (!products || products.length === 0) {
      containerEl.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="p-5 bg-surface rounded-4 border border-subtle">
            <i class="bi bi-search fs-1 text-muted mb-3 d-block"></i>
            <h4 class="font-editorial mb-2">No Matching Garments Found</h4>
            <p class="text-muted mb-4">Try clearing filters or searching for another silhouette or fabric.</p>
            <button class="btn btn-velora-primary" id="btn-reset-filters-empty">Clear All Filters</button>
          </div>
        </div>
      `;
      const resetBtn = document.getElementById('btn-reset-filters-empty');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (window.app) window.app.resetFilters();
        });
      }
      return;
    }

    containerEl.innerHTML = products.map(product => {
      const isWishlisted = window.cartStore ? window.cartStore.isInWishlist(product.id) : false;
      const primaryImg = product.images?.[0] || 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1000';
      const secondaryImg = product.images?.[1] || primaryImg;

      // Badge markup
      let badgeHtml = '';
      if (product.badge) {
        let badgeClass = 'badge-new';
        if (product.badge.includes('SALE')) badgeClass = 'badge-sale';
        else if (product.badge.includes('LOW STOCK')) badgeClass = 'badge-stock';
        else if (product.badge.includes('BESTSELLER')) badgeClass = 'badge-bestseller';
        badgeHtml = `<span class="product-badge ${badgeClass}">${product.badge}</span>`;
      }

      // Swatches preview
      const swatchesHtml = (product.colors || []).map(c => 
        `<span class="card-mini-swatch" style="background-color: ${c.hex};" title="${c.name}"></span>`
      ).join('');

      return `
        <div class="col-12 col-sm-6 col-lg-4 col-xl-3 mb-4">
          <div class="product-card" data-product-id="${product.id}">
            <!-- Card Media -->
            <div class="product-image-container">
              <div class="product-badge-group">
                ${badgeHtml}
              </div>

              <button class="btn-card-wishlist ${isWishlisted ? 'active' : ''}" 
                      data-wishlist-id="${product.id}" 
                      aria-label="Save to Wishlist" 
                      title="Save to Wishlist">
                <i class="bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'}"></i>
              </button>

              <img src="${primaryImg}" alt="${product.name}" class="product-img-primary" loading="lazy">
              <img src="${secondaryImg}" alt="${product.name}" class="product-img-secondary" loading="lazy">

              <!-- Quick Action Overlay -->
              <div class="card-quick-actions">
                <button class="btn-quick-view" data-quickview-id="${product.id}">
                  <i class="bi bi-eye me-1"></i> Quick View
                </button>
                <button class="btn-card-add" data-quickadd-id="${product.id}" title="Select Size & Add">
                  <i class="bi bi-bag-plus"></i>
                </button>
              </div>
            </div>

            <!-- Card Body -->
            <div class="product-card-body">
              <div class="product-category-label">${product.category} • ${product.gender}</div>
              <h5 class="product-title" title="${product.name}">${product.name}</h5>
              
              <div class="product-rating-box">
                <i class="bi bi-star-fill"></i>
                <span class="fw-bold text-dark">${product.rating}</span>
                <span>(${product.reviewCount})</span>
              </div>

              <div class="product-price-row">
                <span class="price-current">${this.formatMoney(product.price)}</span>
                ${product.originalPrice ? `<span class="price-original">${this.formatMoney(product.originalPrice)}</span>` : ''}
              </div>

              <div class="product-card-swatches">
                ${swatchesHtml}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Open Quick View modal with rich details
   */
  openQuickView(product) {
    if (!product) return;
    this.activeQuickViewProduct = product;
    this.selectedModalSize = product.sizes?.[0] || 'M';
    this.selectedModalColor = product.colors?.[0] || null;

    const modalTitle = document.getElementById('quickViewModalLabel');
    const modalCategory = document.getElementById('quickViewCategory');
    const modalPrice = document.getElementById('quickViewPrice');
    const modalOriginalPrice = document.getElementById('quickViewOriginalPrice');
    const modalRating = document.getElementById('quickViewRating');
    const modalReviews = document.getElementById('quickViewReviews');
    const modalDescription = document.getElementById('quickViewDescription');
    const modalMainImg = document.getElementById('quickViewMainImg');
    const modalThumbsContainer = document.getElementById('quickViewThumbs');
    const modalColorContainer = document.getElementById('quickViewColors');
    const modalSizeContainer = document.getElementById('quickViewSizes');
    const modalStockAlert = document.getElementById('quickViewStockAlert');
    const modalSpecsFabric = document.getElementById('quickViewFabric');
    const modalSpecsFit = document.getElementById('quickViewFit');
    const modalSpecsCare = document.getElementById('quickViewCare');
    const modalQtyInput = document.getElementById('quickViewQty');

    if (modalTitle) modalTitle.textContent = product.name;
    if (modalCategory) modalCategory.textContent = `${product.category} — ${product.gender}`;
    if (modalPrice) modalPrice.textContent = this.formatMoney(product.price);
    if (modalOriginalPrice) {
      if (product.originalPrice) {
        modalOriginalPrice.textContent = this.formatMoney(product.originalPrice);
        modalOriginalPrice.classList.remove('d-none');
      } else {
        modalOriginalPrice.classList.add('d-none');
      }
    }
    if (modalRating) modalRating.textContent = product.rating;
    if (modalReviews) modalReviews.textContent = `(${product.reviewCount} verified reviews)`;
    if (modalDescription) modalDescription.textContent = product.description;

    // Gallery
    if (modalMainImg && product.images?.[0]) {
      modalMainImg.src = product.images[0];
    }
    if (modalThumbsContainer) {
      modalThumbsContainer.innerHTML = (product.images || []).map((imgUrl, idx) => `
        <div class="modal-thumb-item ${idx === 0 ? 'active' : ''}" data-img-src="${imgUrl}">
          <img src="${imgUrl}" alt="Angle preview">
        </div>
      `).join('');

      // Add thumbnail click event
      modalThumbsContainer.querySelectorAll('.modal-thumb-item').forEach(thumb => {
        thumb.addEventListener('click', (e) => {
          modalThumbsContainer.querySelectorAll('.modal-thumb-item').forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
          if (modalMainImg) modalMainImg.src = thumb.dataset.imgSrc;
        });
      });
    }

    // Color swatches
    if (modalColorContainer) {
      modalColorContainer.innerHTML = (product.colors || []).map((col, idx) => `
        <button type="button" 
                class="color-swatch-item ${idx === 0 ? 'active' : ''}" 
                style="background-color: ${col.hex};" 
                data-color-index="${idx}" 
                title="${col.name}">
        </button>
      `).join('');

      modalColorContainer.querySelectorAll('.color-swatch-item').forEach(item => {
        item.addEventListener('click', () => {
          modalColorContainer.querySelectorAll('.color-swatch-item').forEach(i => i.classList.remove('active'));
          item.classList.add('active');
          const idx = parseInt(item.dataset.colorIndex, 10);
          this.selectedModalColor = product.colors[idx];
          const colorNameLabel = document.getElementById('quickViewSelectedColorName');
          if (colorNameLabel) colorNameLabel.textContent = this.selectedModalColor.name;
        });
      });
      const initialColorLabel = document.getElementById('quickViewSelectedColorName');
      if (initialColorLabel && this.selectedModalColor) initialColorLabel.textContent = this.selectedModalColor.name;
    }

    // Size Pills
    if (modalSizeContainer) {
      modalSizeContainer.innerHTML = (product.sizes || []).map((sz, idx) => `
        <button type="button" class="size-chip-btn ${idx === 0 ? 'active' : ''}" data-size="${sz}">
          ${sz}
        </button>
      `).join('');

      modalSizeContainer.querySelectorAll('.size-chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          modalSizeContainer.querySelectorAll('.size-chip-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.selectedModalSize = btn.dataset.size;
          this.updateStockAlert(product, this.selectedModalSize);
        });
      });
    }

    // Stock alert for selected size
    this.updateStockAlert(product, this.selectedModalSize);

    // Specs Accordion
    if (modalSpecsFabric) modalSpecsFabric.textContent = product.specs?.fabric || 'High-grade sustainable textile';
    if (modalSpecsFit) modalSpecsFit.textContent = product.specs?.fit || 'Tailored contemporary cut';
    if (modalSpecsCare) modalSpecsCare.textContent = product.specs?.care || 'Care instructions included on garment tag';

    // Reset Quantity
    if (modalQtyInput) modalQtyInput.value = 1;

    // Show bootstrap modal
    const modalEl = document.getElementById('quickViewModal');
    if (modalEl && window.bootstrap) {
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.show();
    }
  },

  /**
   * Update stock badge in modal based on size
   */
  updateStockAlert(product, size) {
    const stockAlertEl = document.getElementById('quickViewStockAlert');
    if (!stockAlertEl || !product.stock) return;

    const count = product.stock[size] !== undefined ? product.stock[size] : 5;
    if (count === 0) {
      stockAlertEl.className = 'stock-alert-pill bg-danger text-white';
      stockAlertEl.innerHTML = `<i class="bi bi-x-circle-fill"></i> Currently Sold Out in Size ${size}`;
    } else if (count <= 3) {
      stockAlertEl.className = 'stock-alert-pill stock-low';
      stockAlertEl.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> Only ${count} left in Size ${size} — order soon!`;
    } else {
      stockAlertEl.className = 'stock-alert-pill stock-in';
      stockAlertEl.innerHTML = `<i class="bi bi-check-circle-fill"></i> In Stock & Ready to Ship (Size ${size})`;
    }
  },

  /**
   * Open Size Guide Modal
   */
  openSizeGuide(product) {
    if (!product) product = this.activeQuickViewProduct;
    if (!product || !product.sizeChart) return;

    const sizeGuideTableBody = document.getElementById('sizeGuideTableBody');
    const sizeGuideHeaders = document.getElementById('sizeGuideHeaders');
    if (!sizeGuideTableBody) return;

    const sampleRow = product.sizeChart[0] || {};
    const keys = Object.keys(sampleRow);

    if (sizeGuideHeaders) {
      sizeGuideHeaders.innerHTML = keys.map(k => `<th>${k.toUpperCase()}</th>`).join('');
    }

    sizeGuideTableBody.innerHTML = product.sizeChart.map(row => `
      <tr>
        ${keys.map(k => `<td class="${k === 'size' ? 'fw-bold' : ''}">${row[k]}</td>`).join('')}
      </tr>
    `).join('');

    const modalEl = document.getElementById('sizeGuideModal');
    if (modalEl && window.bootstrap) {
      const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
      bsModal.show();
    }
  },

  /**
   * Render Cart Offcanvas Drawer
   */
  renderCartDrawer(cartStore) {
    const cartCountBadges = document.querySelectorAll('.cart-badge-count');
    const itemsContainer = document.getElementById('cartDrawerItems');
    const subtotalEl = document.getElementById('cartSubtotalAmount');
    const discountEl = document.getElementById('cartDiscountAmount');
    const shippingEl = document.getElementById('cartShippingAmount');
    const totalEl = document.getElementById('cartTotalAmount');
    const freeShipText = document.getElementById('freeShipRemainingText');
    const freeShipProgressFill = document.getElementById('freeShipProgressFill');
    const emptyState = document.getElementById('cartDrawerEmpty');
    const footerSummary = document.getElementById('cartDrawerFooterSummary');

    const totalCount = cartStore.getItemCount();
    cartCountBadges.forEach(badge => {
      badge.textContent = totalCount;
      badge.style.display = totalCount > 0 ? 'flex' : 'none';
    });

    // Free shipping bar calculation
    const progress = cartStore.getFreeShippingProgress();
    if (freeShipProgressFill) {
      freeShipProgressFill.style.width = `${progress.percentage}%`;
    }
    if (freeShipText) {
      if (progress.unlocked) {
        freeShipText.innerHTML = `<strong class="text-success"><i class="bi bi-check2-circle"></i> Congratulations! You've unlocked Complimentary Express Shipping!</strong>`;
      } else {
        freeShipText.innerHTML = `Add <strong>${this.formatMoney(progress.remaining)}</strong> more to unlock <strong>Free Express Shipping</strong>.`;
      }
    }

    // Empty state check
    if (cartStore.items.length === 0) {
      if (itemsContainer) itemsContainer.innerHTML = '';
      if (emptyState) emptyState.classList.remove('d-none');
      if (footerSummary) footerSummary.classList.add('d-none');
      return;
    }

    if (emptyState) emptyState.classList.add('d-none');
    if (footerSummary) footerSummary.classList.remove('d-none');

    // Render Cart Items
    if (itemsContainer) {
      itemsContainer.innerHTML = cartStore.items.map(item => `
        <div class="cart-item-row" data-cart-id="${item.cartItemId}">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-info">
            <h6 class="cart-item-name">${item.name}</h6>
            <div class="cart-item-meta">
              <span>Size: <strong>${item.size}</strong></span> | 
              <span>Color: <strong>${item.color}</strong></span>
            </div>
            <div class="d-flex align-items-center justify-content-between mt-2">
              <div class="qty-stepper">
                <button type="button" class="qty-btn btn-cart-minus" data-cart-id="${item.cartItemId}">-</button>
                <input type="text" class="qty-value" value="${item.quantity}" readonly>
                <button type="button" class="qty-btn btn-cart-plus" data-cart-id="${item.cartItemId}">+</button>
              </div>
              <div class="fw-bold">${this.formatMoney(item.price * item.quantity)}</div>
            </div>
          </div>
          <button class="cart-item-remove-btn" data-cart-id="${item.cartItemId}" title="Remove item">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
      `).join('');

      // Item Actions
      itemsContainer.querySelectorAll('.btn-cart-minus').forEach(btn => {
        btn.addEventListener('click', () => cartStore.updateQuantity(btn.dataset.cartId, -1));
      });
      itemsContainer.querySelectorAll('.btn-cart-plus').forEach(btn => {
        btn.addEventListener('click', () => cartStore.updateQuantity(btn.dataset.cartId, 1));
      });
      itemsContainer.querySelectorAll('.cart-item-remove-btn').forEach(btn => {
        btn.addEventListener('click', () => cartStore.removeItem(btn.dataset.cartId));
      });
    }

    // Summary Totals
    const subtotal = cartStore.getSubtotal();
    const discount = cartStore.getDiscountAmount();
    const shipping = cartStore.getShippingFee();
    const total = cartStore.getFinalTotal();

    if (subtotalEl) subtotalEl.textContent = this.formatMoney(subtotal);
    if (discountEl) {
      if (discount > 0) {
        discountEl.textContent = `-${this.formatMoney(discount)}`;
        document.getElementById('cartDiscountRow')?.classList.remove('d-none');
      } else {
        document.getElementById('cartDiscountRow')?.classList.add('d-none');
      }
    }
    if (shippingEl) {
      shippingEl.textContent = shipping === 0 ? 'FREE' : this.formatMoney(shipping);
      if (shipping === 0) shippingEl.classList.add('text-success', 'fw-bold');
      else shippingEl.classList.remove('text-success', 'fw-bold');
    }
    if (totalEl) totalEl.textContent = this.formatMoney(total);
  },

  /**
   * Render Wishlist Drawer
   */
  renderWishlistDrawer(cartStore) {
    const wishlistBadgeCount = document.querySelectorAll('.wishlist-badge-count');
    const container = document.getElementById('wishlistDrawerItems');
    const emptyState = document.getElementById('wishlistEmpty');

    const count = cartStore.getWishlistCount();
    wishlistBadgeCount.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });

    if (count === 0) {
      if (container) container.innerHTML = '';
      if (emptyState) emptyState.classList.remove('d-none');
      return;
    }

    if (emptyState) emptyState.classList.add('d-none');

    const wishlistedProducts = MOCK_PRODUCTS.filter(p => cartStore.isInWishlist(p.id));

    if (container) {
      container.innerHTML = wishlistedProducts.map(p => `
        <div class="cart-item-row" data-product-id="${p.id}">
          <img src="${p.images?.[0]}" alt="${p.name}" class="cart-item-img">
          <div class="cart-item-info">
            <h6 class="cart-item-name">${p.name}</h6>
            <div class="cart-item-meta text-muted">${p.category} • ${p.gender}</div>
            <div class="fw-bold mt-1">${this.formatMoney(p.price)}</div>
            <div class="mt-2 d-flex gap-2">
              <button class="btn btn-sm btn-velora-primary py-1 px-3 fs-7 btn-wishlist-to-cart" data-product-id="${p.id}">
                Move to Bag
              </button>
              <button class="btn btn-sm btn-outline-secondary py-1 px-2 fs-7 btn-wishlist-remove" data-product-id="${p.id}">
                Remove
              </button>
            </div>
          </div>
        </div>
      `).join('');

      container.querySelectorAll('.btn-wishlist-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
          const product = MOCK_PRODUCTS.find(p => p.id === btn.dataset.productId);
          if (product) {
            cartStore.addItem(product, product.sizes[0], product.colors[0], 1);
            cartStore.toggleWishlist(product.id);
            this.showToast(`Moved "${product.name}" to your bag.`, 'success');
          }
        });
      });

      container.querySelectorAll('.btn-wishlist-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          cartStore.toggleWishlist(btn.dataset.productId);
          this.showToast('Item removed from wishlist.', 'info');
        });
      });
    }
  },

  /**
   * Launch Toast notification
   */
  showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    let icon = 'bi-check-circle-fill text-success';
    if (type === 'error') icon = 'bi-exclamation-triangle-fill text-danger';
    if (type === 'info') icon = 'bi-info-circle-fill text-primary';

    const toast = document.createElement('div');
    toast.className = 'toast-custom';
    toast.innerHTML = `
      <i class="bi ${icon} toast-icon"></i>
      <div class="flex-grow-1 fs-7 fw-500">${message}</div>
      <button type="button" class="btn-close ms-2 fs-8" aria-label="Close"></button>
    `;

    toast.querySelector('.btn-close').addEventListener('click', () => toast.remove());
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  },

  /**
   * Toggle Theme (Light vs Dark)
   */
  initTheme() {
    const saved = localStorage.getItem('velora_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    this.updateThemeButton(saved);

    const toggleBtn = document.getElementById('btnThemeToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('velora_theme', next);
        this.updateThemeButton(next);
        this.showToast(`Theme switched to ${next} mode.`, 'info');
      });
    }
  },

  updateThemeButton(theme) {
    const toggleBtn = document.getElementById('btnThemeToggle');
    if (!toggleBtn) return;
    const icon = toggleBtn.querySelector('i');
    if (icon) {
      if (theme === 'dark') {
        icon.className = 'bi bi-sun-fill text-warning';
      } else {
        icon.className = 'bi bi-moon-stars-fill';
      }
    }
  }
};

window.UI = UI;
