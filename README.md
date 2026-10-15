# VÉLORA Atelier — Decoupled Clothing E-Commerce Web App

A modern, high-end direct-to-consumer (D2C) clothing e-commerce web application featuring architectural minimalism, pure vanilla client-side interactivity, Bootstrap 5 CSS, and a decoupled Node.js + Express + SQLite3 backend.

---

## 🏛️ Architecture Overview

The application follows a **Decoupled Architecture**:
- **Frontend (`frontend/`)**: Completely independent Single Page Application built with Semantic HTML5, Vanilla JavaScript (ES6+), and Bootstrap 5 CSS layered with a bespoke luxury design system. It interacts with the backend strictly through REST API endpoints (`/api/*`).
- **Backend (`backend/`)**: Lightweight, robust Express.js API server connected to an embedded **SQLite3** database (`backend/database.sqlite`).
- **Uploads (`uploads/`)**: Dedicated local directory storing uploaded garment images via **Multer**.

```
ashika/
├── frontend/
│   ├── index.html            # Main Storefront & Interactive Discovery
│   ├── css/
│   │   └── style.css         # Bespoke Luxury Design System (Dark/Light Mode, Glassmorphism)
│   └── js/
│       ├── api.js            # Decoupled API service (with auto-detect and offline fallback)
│       ├── mockData.js       # Curated initial catalog dataset & promo vouchers
│       ├── cart.js           # Shopping Cart & Wishlist state engine (LocalStorage synced)
│       ├── ui.js             # UI Interaction Renderer (Modals, Offcanvas, Toasts)
│       ├── checkout.js       # Multi-step checkout with interactive card preview
│       └── app.js            # Main coordinator, filter engine & event delegation
├── backend/
│   ├── server.js             # Express application entry point & static routes
│   ├── database.js           # SQLite3 connection, schema migration & auto-seeding
│   └── routes/
│       ├── products.js       # Products REST API (query, filter, sort, create)
│       ├── orders.js         # Orders REST API (recording transactions and line items)
│       └── upload.js         # Local image upload handler via Multer
├── uploads/                  # Local folder storing uploaded garment imagery
└── package.json              # Project dependencies (express, sqlite3, multer, cors)
```

---

## 🚀 How to Run the Application

### 1. Install Backend Dependencies
Run the following in the project root folder:
```bash
npm install
```
*(Dependencies: `express`, `sqlite3`, `multer`, `cors`)*

### 2. Start the Express Server
```bash
npm start
```
or with nodemon:
```bash
npm run dev
```

The server will automatically:
- Initialize the SQLite3 database (`backend/database.sqlite`).
- Seed the luxury product catalog.
- Launch on **`http://localhost:5000`**.

### 3. Open in Browser
Visit **`http://localhost:5000`** in your browser.

> **Note on Decoupled Flexibility**: You can also open `frontend/index.html` directly via `file:///` without the server running! The frontend will gracefully use its local mock provider and LocalStorage, and automatically connect to `/api` once the Express server starts.

---

## 🌟 Key Features

1. **Editorial Fashion Discovery**:
   - High-impact hero drop section with lookbook trigger.
   - Dual-angle image swap on card hover (lifestyle shot to studio garment view).
   - Status badges (*BESTSELLER*, *NEW DROP*, *SALE*, *LOW STOCK*).
   - Real-time multi-currency support: USD ($), EUR (€), GBP (£), INR (₹).
   - Instant Dark / Light mode toggle.

2. **Multi-Faceted Filtering & Search**:
   - Filter by Category (*Outerwear*, *Tops*, *Knitwear*, *Trousers*, *Accessories*).
   - Department (*Men*, *Women*, *Unisex*).
   - Sizes (*XS*, *S*, *M*, *L*, *XL*) and Color swatches (*Onyx*, *Camel*, *Olive*, *Navy*, *Terracotta*).
   - Live price range slider ($50 – $500) and "In Stock Only" toggle.
   - Instant search with debouncing.

3. **Interactive Quick View & Size Guide**:
   - Multi-angle gallery with thumbnail switcher.
   - Dynamic stock indicators (*e.g., "Only 2 left in Size M!"*).
   - Measurement table modal (cm and inches).
   - Garment specifications accordion (GSM, fiber origin, tailoring fit, care).

4. **Cart Drawer & Coupon Engine**:
   - Slide-over glassmorphic drawer.
   - Free shipping progress bar (*"Add $25.00 more to unlock Free Express Delivery"*).
   - Working coupon codes:
     - `VELORA15` — 15% off orders over $50
     - `FREESHIP` — Complimentary shipping
     - `WELCOME20` — $20 off orders over $100
   - Cart and Wishlist saved across sessions via `localStorage`.

5. **Multi-Step Checkout**:
   - Step 1: Address validation.
   - Step 2: Delivery speed selector.
   - Step 3: Payment simulation with live **interactive card preview**.
   - Step 4: Printable Order Confirmation receipt with order reference ID.

6. **Atelier Studio (Local Image Upload + SQLite3)**:
   - Click the **"+ Add Garment"** button in the header.
   - Pick an image file from your computer — it is uploaded locally to `uploads/` via Multer.
   - The product record is saved to the SQLite3 `products` table and immediately displayed in the catalog!

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Server & database health check |
| `GET` | `/api/products` | Retrieve filtered products |
| `GET` | `/api/products/:id` | Retrieve single product details |
| `POST` | `/api/products` | Create a new garment in SQLite3 |
| `DELETE` | `/api/products/:id` | Delete a garment |
| `POST` | `/api/upload` | Upload image file to local `uploads/` folder |
| `POST` | `/api/orders` | Record a completed checkout order & line items |
| `GET` | `/api/orders` | Retrieve past orders |
| `GET` | `/api/user/profile` | Client portfolio & loyalty points |
| `PUT` | `/api/user/profile` | Update personal details |
| `PUT` | `/api/user/measurements` | Update tailoring sizing |
| `POST` | `/api/promo/validate` | Validate promo codes (`VELORA15`, `FREESHIP`, `WELCOME20`) |

---

## ☁️ Deploying to Vercel

The project includes pre-configured **`vercel.json`** and **`api/index.js`** serverless routing:

### Deploy via Vercel CLI
```bash
npm i -g vercel
vercel
```

### Deploy via GitHub
1. Push this repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com), click **"Add New Project"** and import the repository.
3. Keep default settings and click **Deploy**.
4. Vercel will automatically serve:
   - Storefront at `https://<your-project>.vercel.app`
   - User Profile at `https://<your-project>.vercel.app/profile`
   - Express REST API at `https://<your-project>.vercel.app/api/*`

