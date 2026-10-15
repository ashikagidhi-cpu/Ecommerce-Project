/**
 * VÉLORA Atelier - SQLite3 Database Connection & Schema Setup
 * Manages database initialization, schema migration, and automatic catalog & profile seeding.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.VERCEL
  ? path.join('/tmp', 'database.sqlite')
  : path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite3 database:', err.message);
  } else {
    console.log('Connected to SQLite3 database at:', dbPath);
  }
});

// Full 10-Garment Luxury Catalog for Automatic Seeding
const SEED_PRODUCTS = [
  {
    id: "vel-001",
    name: "Architectural Wool Overcoat",
    tagline: "Double-faced virgin wool with structured notch lapels",
    category: "outerwear",
    gender: "unisex",
    price: 380,
    originalPrice: 450,
    rating: 4.9,
    reviewCount: 38,
    badge: "BESTSELLER",
    isNew: 0,
    colors: JSON.stringify([
      { name: "Onyx Black", hex: "#171717" },
      { name: "Camel Tan", hex: "#b59468" },
      { name: "Slate Charcoal", hex: "#43464b" }
    ]),
    sizes: JSON.stringify(["S", "M", "L", "XL"]),
    stock: JSON.stringify({ "S": 4, "M": 2, "L": 6, "XL": 1 }),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop"
    ]),
    description: "Crafted from 100% sustainable Italian virgin wool, this tailored overcoat offers an oversized yet structured silhouette. Features horn buttons, cupro satin lining, and deep welt pockets.",
    specs: JSON.stringify({
      fabric: "100% Virgin Italian Wool (580 GSM)",
      lining: "100% Bemberg Cupro",
      fit: "Relaxed tailored silhouette with drop shoulder",
      care: "Dry clean only. Store on shaped wooden hanger."
    }),
    sizeChart: JSON.stringify([
      { size: "S", chest: "106 cm / 41.7\"", length: "115 cm / 45.2\"", shoulder: "48 cm / 18.8\"" },
      { size: "M", chest: "112 cm / 44.0\"", length: "117 cm / 46.0\"", shoulder: "50 cm / 19.6\"" },
      { size: "L", chest: "118 cm / 46.4\"", length: "119 cm / 46.8\"", shoulder: "52 cm / 20.4\"" },
      { size: "XL", chest: "124 cm / 48.8\"", length: "121 cm / 47.6\"", shoulder: "54 cm / 21.2\"" }
    ])
  },
  {
    id: "vel-002",
    name: "Heavyweight Boxy Hoodie",
    tagline: "460 GSM organic loopback French Terry",
    category: "tops",
    gender: "unisex",
    price: 135,
    originalPrice: null,
    rating: 4.8,
    reviewCount: 92,
    badge: "NEW",
    isNew: 1,
    colors: JSON.stringify([
      { name: "Sand Dune", hex: "#d8cebe" },
      { name: "Onyx Black", hex: "#1c1c1e" },
      { name: "Sage Olive", hex: "#707865" }
    ]),
    sizes: JSON.stringify(["XS", "S", "M", "L", "XL"]),
    stock: JSON.stringify({ "XS": 3, "S": 8, "M": 14, "L": 5, "XL": 2 }),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop"
    ]),
    description: "Constructed with ultra-dense 460 GSM combed cotton. Pre-shrunk with an immaculate drape, seamless double-layer hood without drawstrings for a modern, architectural finish.",
    specs: JSON.stringify({
      fabric: "100% GOTS Certified Organic Cotton (460 GSM)",
      fit: "Boxy fit, dropped shoulders, cropped hem",
      care: "Machine wash cold inside out, hang dry."
    }),
    sizeChart: JSON.stringify([
      { size: "XS", chest: "110 cm / 43.3\"", length: "63 cm / 24.8\"", shoulder: "54 cm / 21.2\"" },
      { size: "S", chest: "116 cm / 45.6\"", length: "65 cm / 25.5\"", shoulder: "56 cm / 22.0\"" },
      { size: "M", chest: "122 cm / 48.0\"", length: "67 cm / 26.3\"", shoulder: "58 cm / 22.8\"" },
      { size: "L", chest: "128 cm / 50.3\"", length: "69 cm / 27.1\"", shoulder: "60 cm / 23.6\"" },
      { size: "XL", chest: "134 cm / 52.7\"", length: "71 cm / 27.9\"", shoulder: "62 cm / 24.4\"" }
    ])
  },
  {
    id: "vel-003",
    name: "Pleated Wide-Leg Trousers",
    tagline: "High-waisted tailored draping with double front pleats",
    category: "trousers",
    gender: "women",
    price: 195,
    originalPrice: 240,
    rating: 4.7,
    reviewCount: 45,
    badge: "SALE -20%",
    isNew: 0,
    colors: JSON.stringify([
      { name: "Cream White", hex: "#f3efe6" },
      { name: "Espresso Brown", hex: "#3b2f2f" },
      { name: "Jet Black", hex: "#111111" }
    ]),
    sizes: JSON.stringify(["XS", "S", "M", "L"]),
    stock: JSON.stringify({ "XS": 1, "S": 5, "M": 3, "L": 0 }),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop"
    ]),
    description: "Sculptural fluidity in motion. These wide-leg trousers feature pressed permanent creases, an extended waistband tab, and concealed hook-and-bar closure.",
    specs: JSON.stringify({
      fabric: "70% Tencel Lyocell, 30% Fine Worsted Wool",
      fit: "High-rise, relaxed wide-leg puddle hem",
      care: "Dry clean or delicate cold hand wash."
    }),
    sizeChart: JSON.stringify([
      { size: "XS", waist: "64 cm / 25.2\"", hip: "94 cm / 37.0\"", inseam: "82 cm / 32.2\"" },
      { size: "S", waist: "68 cm / 26.7\"", hip: "98 cm / 38.5\"", inseam: "83 cm / 32.6\"" },
      { size: "M", waist: "74 cm / 29.1\"", hip: "104 cm / 40.9\"", inseam: "84 cm / 33.0\"" },
      { size: "L", waist: "80 cm / 31.4\"", hip: "110 cm / 43.3\"", inseam: "85 cm / 33.4\"" }
    ])
  },
  {
    id: "vel-004",
    name: "Chunky Ribbed Cashmere Sweater",
    tagline: "7-gauge pure Mongolian cashmere yarn",
    category: "knitwear",
    gender: "unisex",
    price: 320,
    originalPrice: null,
    rating: 5.0,
    reviewCount: 29,
    badge: "LOW STOCK",
    isNew: 0,
    colors: JSON.stringify([
      { name: "Oatmeal Melange", hex: "#d5cbbf" },
      { name: "Midnight Navy", hex: "#1c2333" }
    ]),
    sizes: JSON.stringify(["S", "M", "L"]),
    stock: JSON.stringify({ "S": 2, "M": 1, "L": 3 }),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1000&auto=format&fit=crop"
    ]),
    description: "An investment piece of extraordinary softness. Knit with 4-ply Mongolian cashmere in an English rib stitch. Features a mock neck and ribbed cuffs that retain elasticity.",
    specs: JSON.stringify({
      fabric: "100% Grade-A Mongolian Cashmere",
      fit: "Classic relaxed fit with raglan sleeves",
      care: "Hand wash cold with wool detergent. Dry flat."
    }),
    sizeChart: JSON.stringify([
      { size: "S", chest: "104 cm / 40.9\"", length: "66 cm / 26.0\"", sleeve: "84 cm / 33.0\"" },
      { size: "M", chest: "110 cm / 43.3\"", length: "68 cm / 26.7\"", sleeve: "86 cm / 33.8\"" },
      { size: "L", chest: "116 cm / 45.6\"", length: "70 cm / 27.5\"", sleeve: "88 cm / 34.6\"" }
    ])
  },
  {
    id: "vel-005",
    name: "Minimalist Poplin Overshirt",
    tagline: "Crisp 120-thread count Egyptian cotton poplin",
    category: "tops",
    gender: "men",
    price: 145,
    originalPrice: 175,
    rating: 4.6,
    reviewCount: 54,
    badge: "SALE -17%",
    isNew: 0,
    colors: JSON.stringify([
      { name: "Crisp Sky", hex: "#c4d8e2" },
      { name: "Optic White", hex: "#ffffff" },
      { name: "Matte Olive", hex: "#52594a" }
    ]),
    sizes: JSON.stringify(["S", "M", "L", "XL"]),
    stock: JSON.stringify({ "S": 6, "M": 9, "L": 4, "XL": 3 }),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop"
    ]),
    description: "Versatile as both a lightweight jacket or a refined dress shirt. Features a hidden button placket, clean straight hem, and structured point collar.",
    specs: JSON.stringify({
      fabric: "100% Long-Staple Egyptian Giza Cotton",
      fit: "Straight modern cut",
      care: "Machine wash 30°C. Medium iron."
    }),
    sizeChart: JSON.stringify([
      { size: "S", chest: "108 cm / 42.5\"", length: "72 cm / 28.3\"", shoulder: "46 cm / 18.1\"" },
      { size: "M", chest: "114 cm / 44.8\"", length: "74 cm / 29.1\"", shoulder: "48 cm / 18.8\"" },
      { size: "L", chest: "120 cm / 47.2\"", length: "76 cm / 29.9\"", shoulder: "50 cm / 19.6\"" },
      { size: "XL", chest: "126 cm / 49.6\"", length: "78 cm / 30.7\"", shoulder: "52 cm / 20.4\"" }
    ])
  },
  {
    id: "vel-006",
    name: "Technical Water-Repellent Mac",
    tagline: "Japanese membrane bonded gabardine shell",
    category: "outerwear",
    gender: "men",
    price: 360,
    originalPrice: null,
    rating: 4.9,
    reviewCount: 31,
    badge: "NEW",
    isNew: 1,
    colors: JSON.stringify([
      { name: "Storm Charcoal", hex: "#2b2e36" },
      { name: "Khaki Taupe", hex: "#948b79" }
    ]),
    sizes: JSON.stringify(["S", "M", "L", "XL"]),
    stock: JSON.stringify({ "S": 5, "M": 7, "L": 3, "XL": 2 }),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop"
    ]),
    description: "Designed for inclement city weather without sacrificing sartorial elegance. Sealed seams, storm collar with throat latch, and magnetic pocket closures.",
    specs: JSON.stringify({
      fabric: "65% Recycled Nylon, 35% Organic Cotton with DWR coating",
      fit: "Tailored regular fit, hits right above knee",
      care: "Wipe with damp cloth or professional clean."
    }),
    sizeChart: JSON.stringify([
      { size: "S", chest: "110 cm / 43.3\"", length: "98 cm / 38.5\"", sleeve: "86 cm / 33.8\"" },
      { size: "M", chest: "116 cm / 45.6\"", length: "100 cm / 39.3\"", sleeve: "88 cm / 34.6\"" },
      { size: "L", chest: "122 cm / 48.0\"", length: "102 cm / 40.1\"", sleeve: "90 cm / 35.4\"" },
      { size: "XL", chest: "128 cm / 50.3\"", length: "104 cm / 40.9\"", sleeve: "92 cm / 36.2\"" }
    ])
  },
  {
    id: "vel-007",
    name: "Raw Indigo Selvedge Denim",
    tagline: "14oz Kuroki Japanese shuttle-loom denim",
    category: "trousers",
    gender: "men",
    price: 210,
    originalPrice: null,
    rating: 4.8,
    reviewCount: 68,
    badge: "BESTSELLER",
    isNew: 0,
    colors: JSON.stringify([
      { name: "Raw Deep Indigo", hex: "#192231" }
    ]),
    sizes: JSON.stringify(["S", "M", "L", "XL"]),
    stock: JSON.stringify({ "S": 4, "M": 8, "L": 6, "XL": 2 }),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1000&auto=format&fit=crop"
    ]),
    description: "Woven on vintage 1960s shuttle looms in Okayama, Japan. Features red-line selvedge ticker, copper rivets, and a button fly that breaks in uniquely to your body.",
    specs: JSON.stringify({
      fabric: "100% Zimbabwe Long-Staple Cotton (14oz Unwashed)",
      fit: "Straight leg with subtle taper below knee",
      care: "Wear for 6 months before first cold soak."
    }),
    sizeChart: JSON.stringify([
      { size: "S", waist: "76 cm / 29.9\"", hip: "98 cm / 38.5\"", inseam: "86 cm / 33.8\"" },
      { size: "M", waist: "82 cm / 32.2\"", hip: "104 cm / 40.9\"", inseam: "86 cm / 33.8\"" },
      { size: "L", waist: "88 cm / 34.6\"", hip: "110 cm / 43.3\"", inseam: "86 cm / 33.8\"" },
      { size: "XL", waist: "94 cm / 37.0\"", hip: "116 cm / 45.6\"", inseam: "86 cm / 33.8\"" }
    ])
  },
  {
    id: "vel-008",
    name: "Fine Knit Silk-Cotton Polo",
    tagline: "Ultra-soft 18-gauge luxury knit with open collar",
    category: "knitwear",
    gender: "men",
    price: 165,
    originalPrice: 195,
    rating: 4.7,
    reviewCount: 39,
    badge: "SALE -15%",
    isNew: 0,
    colors: JSON.stringify([
      { name: "Warm Terracotta", hex: "#b85d43" },
      { name: "Cream Ecru", hex: "#eae4d7" },
      { name: "Midnight Navy", hex: "#161c28" }
    ]),
    sizes: JSON.stringify(["S", "M", "L", "XL"]),
    stock: JSON.stringify({ "S": 3, "M": 7, "L": 5, "XL": 0 }),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1000&auto=format&fit=crop"
    ]),
    description: "An effortless sartorial staple. Blends mulberry silk with organic combed cotton for breathability, natural sheen, and zero itching against the skin.",
    specs: JSON.stringify({
      fabric: "55% Mulberry Silk, 45% Organic Cotton (18 Gauge)",
      fit: "Tailored slim fit with retro Johnny collar",
      care: "Hand wash cold, reshape, and dry flat."
    }),
    sizeChart: JSON.stringify([
      { size: "S", chest: "98 cm / 38.5\"", length: "67 cm / 26.3\"", shoulder: "42 cm / 16.5\"" },
      { size: "M", chest: "104 cm / 40.9\"", length: "69 cm / 27.1\"", shoulder: "44 cm / 17.3\"" },
      { size: "L", chest: "110 cm / 43.3\"", length: "71 cm / 27.9\"", shoulder: "46 cm / 18.1\"" },
      { size: "XL", chest: "116 cm / 45.6\"", length: "73 cm / 28.7\"", shoulder: "48 cm / 18.8\"" }
    ])
  },
  {
    id: "vel-009",
    name: "Full-Grain Leather Weekend Tote",
    tagline: "Vegetable-tanned Tuscan leather with brass hardware",
    category: "accessories",
    gender: "unisex",
    price: 290,
    originalPrice: null,
    rating: 4.9,
    reviewCount: 51,
    badge: "BESTSELLER",
    isNew: 0,
    colors: JSON.stringify([
      { name: "Cognac Amber", hex: "#94562b" },
      { name: "Matte Black", hex: "#111111" }
    ]),
    sizes: JSON.stringify(["One Size"]),
    stock: JSON.stringify({ "One Size": 8 }),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop"
    ]),
    description: "Handcrafted in Florence, Italy. Accommodates up to a 16-inch laptop with padded compartment, luggage trolley sleeve, and detachable shoulder strap.",
    specs: JSON.stringify({
      fabric: "100% Certified Italian Full-Grain Cowhide",
      hardware: "Solid Antiqued Brass",
      dimensions: "44cm (W) x 32cm (H) x 16cm (D)",
      care: "Condition annually with beeswax leather balm."
    }),
    sizeChart: JSON.stringify([
      { size: "One Size", dimensions: "44 x 32 x 16 cm (22 Liters volume)" }
    ])
  },
  {
    id: "vel-010",
    name: "Pure Linen Relaxed Resort Shirt",
    tagline: "Pre-washed Normandy French flax linen",
    category: "tops",
    gender: "women",
    price: 120,
    originalPrice: 150,
    rating: 4.8,
    reviewCount: 42,
    badge: "SALE -20%",
    isNew: 0,
    colors: JSON.stringify([
      { name: "Natural Ecru", hex: "#e5ded3" },
      { name: "Dusty Rose", hex: "#cb9993" },
      { name: "Sage Mist", hex: "#97a89b" }
    ]),
    sizes: JSON.stringify(["XS", "S", "M", "L"]),
    stock: JSON.stringify({ "XS": 2, "S": 6, "M": 8, "L": 4 }),
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop"
    ]),
    description: "Breezy comfort crafted from high-grade French flax. Becomes softer with each wear, featuring natural mother-of-pearl buttons and relaxed camp collar.",
    specs: JSON.stringify({
      fabric: "100% Normandy Flax Linen (170 GSM)",
      fit: "Relaxed resort silhouette",
      care: "Gentle machine wash cold, air dry in shade."
    }),
    sizeChart: JSON.stringify([
      { size: "XS", bust: "96 cm / 37.7\"", length: "62 cm / 24.4\"" },
      { size: "S", bust: "102 cm / 40.1\"", length: "64 cm / 25.1\"" },
      { size: "M", bust: "108 cm / 42.5\"", length: "66 cm / 25.9\"" },
      { size: "L", bust: "114 cm / 44.8\"", length: "68 cm / 26.7\"" }
    ])
  }
];

// Initialize database tables, schema migration and seed
function initializeDatabase() {
  db.serialize(() => {
    // 1. Create Products Table
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        tagline TEXT,
        category TEXT NOT NULL,
        gender TEXT NOT NULL,
        price REAL NOT NULL,
        original_price REAL,
        rating REAL DEFAULT 5.0,
        review_count INTEGER DEFAULT 0,
        badge TEXT,
        is_new INTEGER DEFAULT 0,
        colors TEXT,
        sizes TEXT,
        stock TEXT,
        images TEXT,
        description TEXT,
        specs TEXT,
        size_chart TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Create Orders Table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_address TEXT NOT NULL,
        customer_city TEXT NOT NULL,
        customer_postal TEXT NOT NULL,
        customer_country TEXT NOT NULL,
        shipping_method TEXT NOT NULL,
        subtotal REAL NOT NULL,
        discount REAL DEFAULT 0,
        shipping_cost REAL DEFAULT 0,
        total REAL NOT NULL,
        promo_code TEXT,
        status TEXT DEFAULT 'Confirmed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Create Order Items Table
    db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        size TEXT NOT NULL,
        color TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        image TEXT,
        FOREIGN KEY (order_id) REFERENCES orders(id)
      )
    `);

    // 4. Create User Profile Table
    db.run(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        avatar TEXT,
        tier TEXT DEFAULT 'VIP PRIVÉ',
        points INTEGER DEFAULT 2450,
        measurements TEXT,
        addresses TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Seed Products if empty
    db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
      if (!err && row && row.count === 0) {
        console.log('Seeding initial luxury catalog into SQLite3 database...');
        const insertStmt = db.prepare(`
          INSERT INTO products (
            id, name, tagline, category, gender, price, original_price,
            rating, review_count, badge, is_new, colors, sizes, stock,
            images, description, specs, size_chart
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        SEED_PRODUCTS.forEach(p => {
          insertStmt.run(
            p.id, p.name, p.tagline, p.category, p.gender, p.price, p.originalPrice,
            p.rating, p.reviewCount, p.badge, p.isNew, p.colors, p.sizes, p.stock,
            p.images, p.description, p.specs, p.sizeChart
          );
        });

        insertStmt.finalize(() => {
          console.log(`Seeded ${SEED_PRODUCTS.length} products successfully.`);
        });
      }
    });

    // 6. Seed Default User Profile if empty
    db.get('SELECT COUNT(*) as count FROM user_profile', (err, row) => {
      if (!err && row && row.count === 0) {
        const defaultMeasurements = JSON.stringify({
          topSize: 'M',
          waistSize: '30',
          fitType: 'oversized',
          chest: 102,
          waist: 78,
          hips: 98,
          height: 178
        });

        const defaultAddresses = JSON.stringify([
          {
            id: 'addr-1',
            type: 'PRIMARY RESIDENCE',
            name: 'Eleanor Vance',
            street: '142 Mercer Street, Suite 502',
            city: 'New York',
            postal: '10012',
            country: 'United States',
            phone: '+1 (212) 555-0198'
          }
        ]);

        db.run(`
          INSERT INTO user_profile (id, first_name, last_name, email, phone, avatar, tier, points, measurements, addresses)
          VALUES ('client_default', 'Eleanor', 'Vance', 'eleanor.vance@atelier.com', '+1 (212) 555-0198',
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
                  'VIP PRIVÉ', 2450, ?, ?)
        `, [defaultMeasurements, defaultAddresses]);
      }
    });

    // 7. Seed Initial Order if empty
    db.get('SELECT COUNT(*) as count FROM orders', (err, row) => {
      if (!err && row && row.count === 0) {
        const initialOrderId = 'ORD-948120';
        db.run(`
          INSERT INTO orders (
            id, customer_name, customer_email, customer_address, customer_city,
            customer_postal, customer_country, shipping_method, subtotal, discount,
            shipping_cost, total, promo_code, status
          ) VALUES (?, 'Eleanor Vance', 'eleanor.vance@atelier.com', '142 Mercer Street, Suite 502',
                    'New York', '10012', 'United States', 'White-Glove Express Air', 515, 0, 0, 515, null, 'In Transit')
        `, [initialOrderId], function() {
          db.run(`
            INSERT INTO order_items (order_id, product_id, product_name, size, color, price, quantity, image)
            VALUES (?, 'vel-001', 'Architectural Wool Overcoat', 'M', 'Onyx Black', 380, 1,
                    'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1000')
          `, [initialOrderId]);
          db.run(`
            INSERT INTO order_items (order_id, product_id, product_name, size, color, price, quantity, image)
            VALUES (?, 'vel-002', 'Heavyweight Boxy Hoodie', 'M', 'Sand Dune', 135, 1,
                    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000')
          `, [initialOrderId]);
        });
      }
    });
  });
}

initializeDatabase();

module.exports = db;
