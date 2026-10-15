/**
 * VÉLORA Atelier - Main Application Orchestrator
 * Coordinates state, filters, event listeners, and decoupled API communication.
 */

class VeloraApp {
  constructor() {
    this.currentFilters = {
      category: 'all',
      gender: 'all',
      size: 'all',
      color: 'all',
      maxPrice: 500,
      inStockOnly: false,
      sortBy: 'featured',
      search: ''
    };

    this.products = [];
  }

  async init() {
    // 1. Theme setup
    window.UI.initTheme();

    // 2. Subscribe Cart & Wishlist to UI updates
    if (window.cartStore) {
      window.cartStore.subscribe((store) => {
        window.UI.renderCartDrawer(store);
        window.UI.renderWishlistDrawer(store);
      });
    }

    // 3. Check if live Express backend is reachable
    await window.clothingAPI.checkBackendHealth();

    // 4. Bind UI event listeners
    this.bindEvents();

    // 5. Initial product fetch & render
    await this.fetchAndRender();
  }

  async fetchAndRender() {
    const grid = document.getElementById('productsGrid');
    if (grid) {
      grid.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="spinner-border text-dark" role="status">
            <span class="visually-hidden">Loading collections...</span>
          </div>
        </div>
      `;
    }

    this.products = await window.clothingAPI.getProducts(this.currentFilters);
    window.UI.renderProducts(this.products, grid);

    // Update result counter
    const countEl = document.getElementById('productsCountBadge');
    if (countEl) countEl.textContent = `${this.products.length} Garments`;
  }

  bindEvents() {
    // Category Pills (Header & Toolbar)
    const catPills = document.querySelectorAll('.cat-pill, .nav-cat-link');
    catPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        catPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.currentFilters.category = pill.dataset.category || 'all';
        this.fetchAndRender();
      });
    });

    // Gender Filter Radios
    const genderRadios = document.querySelectorAll('input[name="filterGender"]');
    genderRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.currentFilters.gender = e.target.value;
        this.fetchAndRender();
      });
    });

    // Size Filter Chips
    const sizeChips = document.querySelectorAll('.filter-size-btn');
    sizeChips.forEach(chip => {
      chip.addEventListener('click', () => {
        if (chip.classList.contains('active')) {
          chip.classList.remove('active');
          this.currentFilters.size = 'all';
        } else {
          sizeChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          this.currentFilters.size = chip.dataset.size;
        }
        this.fetchAndRender();
      });
    });

    // Color Swatches in Filter
    const colorSwatches = document.querySelectorAll('.filter-color-swatch');
    colorSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        if (swatch.classList.contains('active')) {
          swatch.classList.remove('active');
          this.currentFilters.color = 'all';
        } else {
          colorSwatches.forEach(s => s.classList.remove('active'));
          swatch.classList.add('active');
          this.currentFilters.color = swatch.dataset.color;
        }
        this.fetchAndRender();
      });
    });

    // Price Slider
    const priceSlider = document.getElementById('priceRangeSlider');
    const priceDisplay = document.getElementById('priceRangeDisplay');
    if (priceSlider && priceDisplay) {
      priceSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        priceDisplay.textContent = `$${val}`;
        this.currentFilters.maxPrice = val;
      });
      priceSlider.addEventListener('change', () => {
        this.fetchAndRender();
      });
    }

    // In Stock Only Toggle
    const inStockToggle = document.getElementById('filterInStock');
    if (inStockToggle) {
      inStockToggle.addEventListener('change', (e) => {
        this.currentFilters.inStockOnly = e.target.checked;
        this.fetchAndRender();
      });
    }

    // Sort Dropdown
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentFilters.sortBy = e.target.value;
        this.fetchAndRender();
      });
    }

    // Live Search
    const searchInput = document.getElementById('mainSearchInput');
    const searchClear = document.getElementById('searchClearBtn');
    if (searchInput) {
      let debounceTimer = null;
      searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (searchClear) searchClear.style.display = val.length > 0 ? 'block' : 'none';

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.currentFilters.search = val;
          this.fetchAndRender();
        }, 250);
      });

      if (searchClear) {
        searchClear.addEventListener('click', () => {
          searchInput.value = '';
          searchClear.style.display = 'none';
          this.currentFilters.search = '';
          this.fetchAndRender();
        });
      }
    }

    // Product Grid Delegate Events (Wishlist, Quick View, Quick Add)
    const grid = document.getElementById('productsGrid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        // Wishlist click
        const wishlistBtn = e.target.closest('.btn-card-wishlist');
        if (wishlistBtn) {
          e.stopPropagation();
          const pId = wishlistBtn.dataset.wishlistId;
          const isAdded = window.cartStore.toggleWishlist(pId);
          wishlistBtn.classList.toggle('active', isAdded);
          const icon = wishlistBtn.querySelector('i');
          if (icon) icon.className = isAdded ? 'bi bi-heart-fill' : 'bi bi-heart';
          window.UI.showToast(isAdded ? 'Added to your curated wishlist' : 'Removed from wishlist', 'info');
          return;
        }

        // Quick View click
        const qvBtn = e.target.closest('.btn-quick-view');
        if (qvBtn) {
          e.stopPropagation();
          const product = this.products.find(p => p.id === qvBtn.dataset.quickviewId) ||
                          MOCK_PRODUCTS.find(p => p.id === qvBtn.dataset.quickviewId);
          if (product) window.UI.openQuickView(product);
          return;
        }

        // Quick Add click
        const qaBtn = e.target.closest('.btn-card-add');
        if (qaBtn) {
          e.stopPropagation();
          const product = this.products.find(p => p.id === qaBtn.dataset.quickaddId) ||
                          MOCK_PRODUCTS.find(p => p.id === qaBtn.dataset.quickaddId);
          if (product) {
            // Open quick view to choose size
            window.UI.openQuickView(product);
          }
          return;
        }

        // Whole Card Click (triggers quick view)
        const card = e.target.closest('.product-card');
        if (card && !e.target.closest('button')) {
          const product = this.products.find(p => p.id === card.dataset.productId) ||
                          MOCK_PRODUCTS.find(p => p.id === card.dataset.productId);
          if (product) window.UI.openQuickView(product);
        }
      });
    }

    // Modal Add To Bag Button
    const modalAddBtn = document.getElementById('btnQuickViewAdd');
    if (modalAddBtn) {
      modalAddBtn.addEventListener('click', () => {
        const product = window.UI.activeQuickViewProduct;
        if (!product) return;

        const size = window.UI.selectedModalSize;
        const color = window.UI.selectedModalColor;
        const qty = parseInt(document.getElementById('quickViewQty')?.value || '1', 10);

        const success = window.cartStore.addItem(product, size, color, qty);
        if (success) {
          // Hide Quick View modal
          const qvModal = document.getElementById('quickViewModal');
          if (qvModal && window.bootstrap) {
            bootstrap.Modal.getInstance(qvModal)?.hide();
          }

          // Open cart drawer
          const cartDrawerEl = document.getElementById('offcanvasCart');
          if (cartDrawerEl && window.bootstrap) {
            bootstrap.Offcanvas.getOrCreateInstance(cartDrawerEl).show();
          }

          window.UI.showToast(`Added ${qty} × "${product.name}" (${size}) to your bag.`, 'success');
        }
      });
    }

    // Modal Quantity stepper
    const modalQtyMinus = document.getElementById('btnQuickViewQtyMinus');
    const modalQtyPlus = document.getElementById('btnQuickViewQtyPlus');
    const modalQtyInput = document.getElementById('quickViewQty');

    if (modalQtyMinus && modalQtyInput) {
      modalQtyMinus.addEventListener('click', () => {
        let v = parseInt(modalQtyInput.value, 10) || 1;
        if (v > 1) modalQtyInput.value = v - 1;
      });
    }
    if (modalQtyPlus && modalQtyInput) {
      modalQtyPlus.addEventListener('click', () => {
        let v = parseInt(modalQtyInput.value, 10) || 1;
        if (v < 10) modalQtyInput.value = v + 1;
      });
    }

    // Size Guide Trigger
    const sizeGuideBtn = document.getElementById('btnOpenSizeGuide');
    if (sizeGuideBtn) {
      sizeGuideBtn.addEventListener('click', () => {
        window.UI.openSizeGuide();
      });
    }

    // Promo Code Application
    const applyPromoBtn = document.getElementById('btnApplyPromo');
    const promoInput = document.getElementById('cartPromoInput');
    if (applyPromoBtn && promoInput) {
      applyPromoBtn.addEventListener('click', async () => {
        const code = promoInput.value.trim();
        if (!code) return;

        const subtotal = window.cartStore.getSubtotal();
        const result = await window.clothingAPI.validatePromo(code, subtotal);

        if (result.valid) {
          window.cartStore.applyPromo(result);
          promoInput.value = '';
          window.UI.showToast(`Promo "${result.code}" successfully applied! ${result.description}`, 'success');
        } else {
          window.UI.showToast(result.message, 'error');
        }
      });
    }

    // Currency Switcher
    const currencySelect = document.getElementById('currencySelector');
    if (currencySelect) {
      currencySelect.addEventListener('change', (e) => {
        window.UI.activeCurrency = e.target.value;
        this.fetchAndRender();
        window.UI.renderCartDrawer(window.cartStore);
        window.UI.renderWishlistDrawer(window.cartStore);
        window.UI.showToast(`Currency changed to ${e.target.value}`, 'info');
      });
    }

    // Clear Filters Button in Sidebar
    const clearSidebarBtn = document.getElementById('btnResetFilters');
    if (clearSidebarBtn) {
      clearSidebarBtn.addEventListener('click', () => this.resetFilters());
    }

    // Print Receipt button in Order Confirmation
    const printReceiptBtn = document.getElementById('btnPrintReceipt');
    if (printReceiptBtn) {
      printReceiptBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Atelier Studio: New Garment Creation & Local Upload
    const addGarmentForm = document.getElementById('formAddGarment');
    if (addGarmentForm) {
      addGarmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('btnSubmitNewGarment');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Uploading...`;
        }

        try {
          const fileInput = document.getElementById('newGarmentFile');
          let imageUrl = 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1000';

          if (fileInput && fileInput.files && fileInput.files[0]) {
            const uploadResult = await window.clothingAPI.uploadImage(fileInput.files[0]);
            if (uploadResult && uploadResult.fileUrl) {
              imageUrl = uploadResult.fileUrl;
            }
          }

          // Gather selected sizes
          const selectedSizes = [];
          document.querySelectorAll('.new-size-check:checked').forEach(cb => selectedSizes.push(cb.value));
          if (selectedSizes.length === 0) selectedSizes.push('M');

          // Gather color
          const colorName = document.getElementById('newGarmentColorName')?.value || 'Onyx Black';
          const colorHex = document.getElementById('newGarmentColorHex')?.value || '#111111';

          const productPayload = {
            name: document.getElementById('newGarmentName').value,
            tagline: document.getElementById('newGarmentTagline').value,
            category: document.getElementById('newGarmentCategory').value,
            gender: document.getElementById('newGarmentGender').value,
            price: parseFloat(document.getElementById('newGarmentPrice').value),
            originalPrice: document.getElementById('newGarmentOrigPrice').value ? parseFloat(document.getElementById('newGarmentOrigPrice').value) : null,
            badge: 'NEW',
            colors: [{ name: colorName, hex: colorHex }],
            sizes: selectedSizes,
            stock: selectedSizes.reduce((acc, sz) => { acc[sz] = 5; return acc; }, {}),
            images: [imageUrl],
            description: document.getElementById('newGarmentDesc').value || '',
            specs: {
              fabric: document.getElementById('newGarmentFabric').value || 'High-grade sustainable textile',
              fit: 'Contemporary tailored cut'
            }
          };

          const createResult = await window.clothingAPI.createProduct(productPayload);

          if (createResult && (createResult.success || createResult.id)) {
            // Close modal
            const modalEl = document.getElementById('modalAddGarment');
            if (modalEl && window.bootstrap) {
              bootstrap.Modal.getInstance(modalEl)?.hide();
            }

            addGarmentForm.reset();
            window.UI.showToast(`"${productPayload.name}" was published and saved to SQLite3!`, 'success');

            // Refresh products grid
            await this.fetchAndRender();
          } else {
            window.UI.showToast('Could not save garment. Please check inputs.', 'error');
          }
        } catch (err) {
          console.error('Error adding garment:', err);
          window.UI.showToast('Error uploading garment: ' + err.message, 'error');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="bi bi-upload me-1"></i> Upload & Publish`;
          }
        }
      });
    }
  }

  resetFilters() {
    this.currentFilters = {
      category: 'all',
      gender: 'all',
      size: 'all',
      color: 'all',
      maxPrice: 500,
      inStockOnly: false,
      sortBy: 'featured',
      search: ''
    };

    // Reset controls in DOM
    document.querySelectorAll('.cat-pill, .nav-cat-link').forEach(p => {
      p.classList.toggle('active', (p.dataset.category || 'all') === 'all');
    });

    const allGenderRadio = document.querySelector('input[name="filterGender"][value="all"]');
    if (allGenderRadio) allGenderRadio.checked = true;

    document.querySelectorAll('.filter-size-btn').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.filter-color-swatch').forEach(s => s.classList.remove('active'));

    const priceSlider = document.getElementById('priceRangeSlider');
    const priceDisplay = document.getElementById('priceRangeDisplay');
    if (priceSlider && priceDisplay) {
      priceSlider.value = 500;
      priceDisplay.textContent = '$500';
    }

    const inStockToggle = document.getElementById('filterInStock');
    if (inStockToggle) inStockToggle.checked = false;

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'featured';

    const searchInput = document.getElementById('mainSearchInput');
    const searchClear = document.getElementById('searchClearBtn');
    if (searchInput) searchInput.value = '';
    if (searchClear) searchClear.style.display = 'none';

    this.fetchAndRender();
    window.UI.showToast('All filters have been reset.', 'info');
  }
}

// Instantiate and start app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new VeloraApp();
  window.app.init();
});
