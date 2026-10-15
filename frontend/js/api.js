/**
 * VÉLORA Atelier - Decoupled API Service Layer
 * Automatically detects if the Express + SQLite3 backend is online.
 * Features full REST methods for Products, Orders, and Local Image Uploads.
 */

class ClothingAPI {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
    this.isBackendOnline = false;
  }

  /**
   * Check if the Express server is reachable
   */
  async checkBackendHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, { 
        method: 'GET', 
        headers: { 'Accept': 'application/json' } 
      });
      if (response.ok) {
        const data = await response.json();
        this.isBackendOnline = true;
        console.log('Connected to live Express backend:', data);
        return true;
      }
    } catch (err) {
      this.isBackendOnline = false;
      console.info('Express backend not detected on /api. Using decoupled client state.');
    }
    return false;
  }

  /**
   * Fetch products with optional filtering (category, gender, size, color, maxPrice, search, sort)
   */
  async getProducts(filters = {}) {
    if (this.isBackendOnline) {
      try {
        const queryParams = new URLSearchParams(filters).toString();
        const res = await fetch(`${this.baseUrl}/products?${queryParams}`);
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Backend query failed, falling back to client dataset:', e);
      }
    }

    // Client-Side Decoupled Implementation
    let products = [...MOCK_PRODUCTS];

    if (filters.category && filters.category !== 'all') {
      products = products.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
    }

    if (filters.gender && filters.gender !== 'all') {
      products = products.filter(p => p.gender === filters.gender || p.gender === 'unisex');
    }

    if (filters.size && filters.size !== 'all') {
      products = products.filter(p => p.sizes.includes(filters.size));
    }

    if (filters.color && filters.color !== 'all') {
      products = products.filter(p => p.colors.some(c => c.name.toLowerCase().includes(filters.color.toLowerCase())));
    }

    if (filters.maxPrice) {
      products = products.filter(p => p.price <= Number(filters.maxPrice));
    }

    if (filters.inStockOnly) {
      products = products.filter(p => {
        const totalStock = Object.values(p.stock || {}).reduce((a, b) => a + b, 0);
        return totalStock > 0;
      });
    }

    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.tagline.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'rating-desc':
          products.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          products.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
          break;
        case 'featured':
        default:
          break;
      }
    }

    return products;
  }

  /**
   * Fetch a single product by ID
   */
  async getProductById(id) {
    if (this.isBackendOnline) {
      try {
        const res = await fetch(`${this.baseUrl}/products/${id}`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, falling back:', e);
      }
    }
    return MOCK_PRODUCTS.find(p => p.id === id) || null;
  }

  /**
   * Upload an image file to the local uploads/ folder via Express Multer
   */
  async uploadImage(file) {
    if (!this.isBackendOnline) {
      // Return temporary object URL if backend is offline
      return {
        success: true,
        fileUrl: URL.createObjectURL(file),
        filename: file.name
      };
    }

    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      throw new Error('Image upload failed');
    }

    return await res.json();
  }

  /**
   * Create a new product in the SQLite3 database
   */
  async createProduct(productPayload) {
    if (this.isBackendOnline) {
      const res = await fetch(`${this.baseUrl}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productPayload)
      });
      return await res.json();
    }

    // Client mock addition
    const newId = 'vel-' + Math.floor(100 + Math.random() * 900);
    const newProduct = {
      id: newId,
      rating: 5.0,
      reviewCount: 0,
      isNew: true,
      badge: 'NEW',
      ...productPayload
    };
    MOCK_PRODUCTS.unshift(newProduct);
    return { success: true, id: newId, product: newProduct };
  }

  /**
   * Validate a promotional voucher
   */
  async validatePromo(code, subtotal) {
    const cleanCode = (code || '').trim().toUpperCase();
    const promo = PROMO_CODES[cleanCode];

    if (!promo) {
      return { valid: false, message: 'Invalid or expired promotional code.' };
    }

    if (subtotal < promo.minOrder) {
      return { 
        valid: false, 
        message: `Order subtotal must be at least $${promo.minOrder} to apply this voucher.` 
      };
    }

    let discountAmount = 0;
    if (promo.discountType === 'percent') {
      discountAmount = (subtotal * promo.value) / 100;
    } else if (promo.discountType === 'fixed') {
      discountAmount = Math.min(promo.value, subtotal);
    } else if (promo.discountType === 'shipping') {
      discountAmount = 'FREE_SHIPPING';
    }

    return {
      valid: true,
      code: cleanCode,
      discountType: promo.discountType,
      discountAmount,
      description: promo.description
    };
  }

  /**
   * Submit completed checkout order to SQLite3
   */
  async createOrder(orderPayload) {
    if (this.isBackendOnline) {
      try {
        const res = await fetch(`${this.baseUrl}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend order recording failed, using local fallback:', e);
      }
    }

    // Client Storage Fallback
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const orderRecord = {
      orderId,
      createdAt: new Date().toISOString(),
      ...orderPayload,
      status: 'Confirmed'
    };

    const history = JSON.parse(localStorage.getItem('velora_order_history') || '[]');
    history.unshift(orderRecord);
    localStorage.setItem('velora_order_history', JSON.stringify(history));

    return {
      success: true,
      order: orderRecord
    };
  }
}

// Global API instance
window.clothingAPI = new ClothingAPI();
