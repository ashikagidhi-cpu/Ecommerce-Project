/**
 * VÉLORA Atelier - User Profile & Order Tracking Controller
 * Manages client portfolio, order history, tailoring measurements, and address preferences.
 */

class ProfileController {
  constructor() {
    this.user = this.loadUserProfile();
    this.measurements = this.loadMeasurements();
    this.orders = [];
  }

  init() {
    // 1. Initialize Theme
    window.UI.initTheme();

    // 2. Subscribe Cart & Wishlist
    if (window.cartStore) {
      window.cartStore.subscribe((store) => {
        window.UI.renderCartDrawer(store);
        window.UI.renderWishlistDrawer(store);
      });
    }

    // 3. Populate initial profile details into DOM
    this.populateDom();

    // 4. Bind tab switching & forms
    this.bindEvents();

    // 5. Load and render orders
    this.loadOrders();
  }

  loadUserProfile() {
    try {
      const saved = localStorage.getItem('velora_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return {
      firstName: 'Eleanor',
      lastName: 'Vance',
      email: 'eleanor.vance@atelier.com',
      phone: '+1 (212) 555-0198',
      tier: 'VIP PRIVÉ',
      points: 2450,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop'
    };
  }

  loadMeasurements() {
    try {
      const saved = localStorage.getItem('velora_user_measurements');
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return {
      topSize: 'M',
      waistSize: '30',
      fitType: 'oversized',
      chest: 102,
      waist: 78,
      hips: 98,
      height: 178
    };
  }

  saveUserProfile() {
    localStorage.setItem('velora_user_profile', JSON.stringify(this.user));
  }

  saveMeasurements() {
    localStorage.setItem('velora_user_measurements', JSON.stringify(this.measurements));
  }

  populateDom() {
    const fullName = `${this.user.firstName} ${this.user.lastName}`;
    const headerName = document.getElementById('profileHeaderName');
    const headerEmail = document.getElementById('profileHeaderEmail');
    const avatarImg = document.getElementById('profileAvatarImg');
    const pointsEl = document.getElementById('profilePointsValue');

    if (headerName) headerName.textContent = fullName;
    if (headerEmail) headerEmail.textContent = this.user.email;
    if (avatarImg && this.user.avatar) avatarImg.src = this.user.avatar;
    if (pointsEl) pointsEl.textContent = this.user.points.toLocaleString();

    // Fill Account Details Form
    const fnInput = document.getElementById('accFirstName');
    const lnInput = document.getElementById('accLastName');
    const emailInput = document.getElementById('accEmail');
    const phoneInput = document.getElementById('accPhone');

    if (fnInput) fnInput.value = this.user.firstName;
    if (lnInput) lnInput.value = this.user.lastName;
    if (emailInput) emailInput.value = this.user.email;
    if (phoneInput) phoneInput.value = this.user.phone || '';

    // Fill Measurements Form
    const topSize = document.getElementById('prefTopSize');
    const waistSize = document.getElementById('prefWaistSize');
    const fitType = document.getElementById('prefFitType');
    const chest = document.getElementById('measureChest');
    const waist = document.getElementById('measureWaist');
    const hips = document.getElementById('measureHips');
    const height = document.getElementById('measureHeight');

    if (topSize) topSize.value = this.measurements.topSize;
    if (waistSize) waistSize.value = this.measurements.waistSize;
    if (fitType) fitType.value = this.measurements.fitType;
    if (chest) chest.value = this.measurements.chest;
    if (waist) waist.value = this.measurements.waist;
    if (hips) hips.value = this.measurements.hips;
    if (height) height.value = this.measurements.height;
  }

  bindEvents() {
    // 1. Tab Switching
    const tabBtns = document.querySelectorAll('.profile-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const targetTab = btn.dataset.targetTab;
        document.querySelectorAll('.profile-tab-content').forEach(panel => {
          panel.classList.add('d-none');
        });

        const activePanel = document.getElementById(`tabContent${targetTab.charAt(0).toUpperCase() + targetTab.slice(1)}`);
        if (activePanel) {
          activePanel.classList.remove('d-none');
        }
      });
    });

    // 2. Avatar Upload Change
    const avatarInput = document.getElementById('avatarUploadInput');
    if (avatarInput) {
      avatarInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const newUrl = URL.createObjectURL(file);
          this.user.avatar = newUrl;
          document.getElementById('profileAvatarImg').src = newUrl;
          this.saveUserProfile();
          window.UI.showToast('Profile portrait updated.', 'success');
        }
      });
    }

    // 3. Sizing Profile Submit
    const formMeasurements = document.getElementById('formMeasurements');
    if (formMeasurements) {
      formMeasurements.addEventListener('submit', (e) => {
        e.preventDefault();
        this.measurements = {
          topSize: document.getElementById('prefTopSize').value,
          waistSize: document.getElementById('prefWaistSize').value,
          fitType: document.getElementById('prefFitType').value,
          chest: Number(document.getElementById('measureChest').value),
          waist: Number(document.getElementById('measureWaist').value),
          hips: Number(document.getElementById('measureHips').value),
          height: Number(document.getElementById('measureHeight').value)
        };
        this.saveMeasurements();
        window.UI.showToast('Bespoke tailoring measurements saved to your client portfolio.', 'success');
      });
    }

    // 4. Account Details Submit
    const formAccount = document.getElementById('formAccountDetails');
    if (formAccount) {
      formAccount.addEventListener('submit', (e) => {
        e.preventDefault();
        this.user.firstName = document.getElementById('accFirstName').value;
        this.user.lastName = document.getElementById('accLastName').value;
        this.user.email = document.getElementById('accEmail').value;
        this.user.phone = document.getElementById('accPhone').value;
        this.saveUserProfile();
        this.populateDom();
        window.UI.showToast('Personal details updated successfully.', 'success');
      });
    }

    // 5. Sign Out Simulation
    const logoutBtn = document.getElementById('btnLogoutSim');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        window.UI.showToast('You have been signed out of Atelier Privé.', 'info');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1200);
      });
    }
  }

  async loadOrders() {
    let savedOrders = [];
    try {
      const local = localStorage.getItem('velora_order_history');
      if (local) savedOrders = JSON.parse(local);
    } catch (e) {}

    // If no orders yet, seed a realistic sample order for demonstration
    if (savedOrders.length === 0) {
      savedOrders = [
        {
          orderId: "ORD-948120",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: "In Transit",
          trackingNumber: "EXP-9842104-US",
          courier: "White-Glove Express Air",
          total: 515,
          subtotal: 515,
          discount: 0,
          shipping: 0,
          customer: {
            name: "Eleanor Vance",
            address: "142 Mercer Street, Suite 502",
            city: "New York",
            country: "United States"
          },
          items: [
            {
              name: "Architectural Wool Overcoat",
              size: "M",
              color: "Onyx Black",
              price: 380,
              quantity: 1,
              image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1000"
            },
            {
              name: "Heavyweight Boxy Hoodie",
              size: "M",
              color: "Sand Dune",
              price: 135,
              quantity: 1,
              image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000"
            }
          ]
        }
      ];
      localStorage.setItem('velora_order_history', JSON.stringify(savedOrders));
    }

    this.orders = savedOrders;
    this.renderOrders(this.orders);
  }

  renderOrders(orders) {
    const container = document.getElementById('profileOrdersListContainer');
    const badge = document.getElementById('orderHistoryCountBadge');

    if (badge) badge.textContent = `${orders.length} ${orders.length === 1 ? 'Order' : 'Orders'}`;
    if (!container) return;

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="filter-card p-5 text-center">
          <i class="bi bi-box2 fs-1 text-muted mb-3 d-block"></i>
          <h5 class="font-editorial mb-2">No Past Orders Found</h5>
          <p class="text-muted fs-8 mb-4">When you commission garments from VÉLORA Atelier, your tracking and receipts will appear here.</p>
          <a href="index.html" class="btn btn-velora-primary btn-sm px-4">Explore Collections</a>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => {
      const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const isDelivered = order.status === 'Delivered';
      const statusPillClass = isDelivered ? 'bg-success text-white' : 'bg-dark text-warning';

      const itemsHtml = (order.items || []).map(item => `
        <div class="d-flex align-items-center gap-3 py-2 border-bottom border-subtle">
          <img src="${item.image || 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=300'}" 
               alt="${item.name}" 
               class="rounded-2 object-fit-cover" 
               style="width: 52px; height: 65px;">
          <div class="flex-grow-1">
            <h6 class="fs-7 fw-bold mb-1">${item.name}</h6>
            <div class="fs-8 text-muted">${item.size} • ${item.color} | Qty: ${item.quantity}</div>
          </div>
          <div class="fw-bold fs-7">${window.UI.formatMoney(item.price * item.quantity)}</div>
        </div>
      `).join('');

      return `
        <div class="filter-card p-4">
          <!-- Order Card Header -->
          <div class="d-flex flex-wrap justify-content-between align-items-center border-bottom pb-3 mb-3 gap-2">
            <div>
              <span class="fs-9 text-uppercase text-muted fw-semibold">Order Reference</span>
              <div class="fw-bold fs-6 font-monospace text-dark">${order.orderId}</div>
            </div>
            <div>
              <span class="fs-9 text-uppercase text-muted fw-semibold">Date Commissioned</span>
              <div class="fs-7 text-dark fw-500">${orderDate}</div>
            </div>
            <div>
              <span class="fs-9 text-uppercase text-muted fw-semibold">Total Amount</span>
              <div class="fw-bold fs-6 text-dark">${window.UI.formatMoney(order.total)}</div>
            </div>
            <div>
              <span class="badge ${statusPillClass} rounded-pill px-3 py-1 fs-8">
                <i class="bi bi-clock-history me-1"></i> ${order.status || 'Confirmed'}
              </span>
            </div>
          </div>

          <!-- Tracking Timeline Indicator -->
          <div class="bg-secondary p-3 rounded-3 mb-3">
            <div class="d-flex justify-content-between align-items-center mb-2 fs-8">
              <span class="fw-semibold text-dark"><i class="bi bi-truck me-1"></i> ${order.courier || 'White-Glove Express Courier'}</span>
              <span class="font-monospace fs-9 text-muted">Tracking: <strong>${order.trackingNumber || 'EXP-' + Math.floor(1000000 + Math.random() * 9000000)}</strong></span>
            </div>
            <div class="progress" style="height: 6px;">
              <div class="progress-bar bg-dark" role="progressbar" style="width: ${isDelivered ? '100%' : '65%'};"></div>
            </div>
            <div class="d-flex justify-content-between fs-9 text-muted mt-2">
              <span>Atelier Prepared</span>
              <span class="fw-bold text-dark">In Transit with Courier</span>
              <span>Delivered</span>
            </div>
          </div>

          <!-- Items Breakdown -->
          <div class="mb-3">
            ${itemsHtml}
          </div>

          <!-- Card Actions -->
          <div class="d-flex justify-content-between align-items-center pt-2">
            <div class="fs-8 text-muted">
              Delivering to: <strong>${order.customer?.address || '142 Mercer St, New York'}</strong>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-dark rounded-pill px-3 fs-8" onclick="window.print()">
                <i class="bi bi-receipt me-1"></i> Invoice
              </button>
              <button class="btn btn-sm btn-velora-primary rounded-pill px-3 fs-8" onclick="window.UI.showToast('Courier coordinates synced with live satellite tracking.', 'info')">
                Track Package
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Instantiate profile controller on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.profileController = new ProfileController();
  window.profileController.init();
});
