/**
 * VÉLORA Atelier - Products API Endpoints
 * Queries and updates the SQLite3 database for garment inventory.
 */

const express = require('express');
const router = express.Router();
const db = require('../database');

// Helper to safely parse JSON columns
function parseProductRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline || '',
    category: row.category,
    gender: row.gender,
    price: row.price,
    originalPrice: row.original_price,
    rating: row.rating,
    reviewCount: row.review_count,
    badge: row.badge,
    isNew: Boolean(row.is_new),
    colors: row.colors ? JSON.parse(row.colors) : [],
    sizes: row.sizes ? JSON.parse(row.sizes) : [],
    stock: row.stock ? JSON.parse(row.stock) : {},
    images: row.images ? JSON.parse(row.images) : [],
    description: row.description || '',
    specs: row.specs ? JSON.parse(row.specs) : {},
    sizeChart: row.size_chart ? JSON.parse(row.size_chart) : [],
    createdAt: row.created_at
  };
}

/**
 * GET /api/products
 * Query products with multi-faceted filtering and sorting
 */
router.get('/', (req, res) => {
  const { category, gender, size, color, maxPrice, inStockOnly, search, sortBy } = req.query;

  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category && category !== 'all') {
    sql += ' AND LOWER(category) = LOWER(?)';
    params.push(category);
  }

  if (gender && gender !== 'all') {
    sql += ' AND (gender = ? OR gender = "unisex")';
    params.push(gender);
  }

  if (maxPrice) {
    sql += ' AND price <= ?';
    params.push(Number(maxPrice));
  }

  if (search && search.trim() !== '') {
    sql += ' AND (LOWER(name) LIKE ? OR LOWER(tagline) LIKE ? OR LOWER(category) LIKE ? OR LOWER(description) LIKE ?)';
    const q = `%${search.toLowerCase().trim()}%`;
    params.push(q, q, q, q);
  }

  // Sort Order
  switch (sortBy) {
    case 'price-asc':
      sql += ' ORDER BY price ASC';
      break;
    case 'price-desc':
      sql += ' ORDER BY price DESC';
      break;
    case 'rating-desc':
      sql += ' ORDER BY rating DESC';
      break;
    case 'newest':
      sql += ' ORDER BY is_new DESC, created_at DESC';
      break;
    case 'featured':
    default:
      sql += ' ORDER BY created_at ASC';
      break;
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    let products = rows.map(parseProductRecord);

    // Filter post-query for JSON-array fields (size, color, in-stock)
    if (size && size !== 'all') {
      products = products.filter(p => p.sizes.includes(size));
    }

    if (color && color !== 'all') {
      products = products.filter(p => p.colors.some(c => c.name.toLowerCase().includes(color.toLowerCase())));
    }

    if (inStockOnly === 'true' || inStockOnly === true) {
      products = products.filter(p => {
        const totalStock = Object.values(p.stock || {}).reduce((a, b) => a + b, 0);
        return totalStock > 0;
      });
    }

    res.json(products);
  });
});

/**
 * GET /api/products/:id
 * Retrieve a specific product by its ID
 */
router.get('/:id', (req, res) => {
  const sql = 'SELECT * FROM products WHERE id = ?';
  db.get(sql, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Garment not found.' });
    res.json(parseProductRecord(row));
  });
});

/**
 * POST /api/products
 * Create a new product (e.g. from the Atelier Admin Studio)
 */
router.post('/', (req, res) => {
  const {
    name, tagline, category, gender, price, originalPrice,
    badge, colors, sizes, stock, images, description, specs, sizeChart
  } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required.' });
  }

  const id = 'vel-' + Math.floor(100 + Math.random() * 900);
  const sql = `
    INSERT INTO products (
      id, name, tagline, category, gender, price, original_price,
      badge, colors, sizes, stock, images, description, specs, size_chart
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    id,
    name,
    tagline || '',
    category.toLowerCase(),
    gender || 'unisex',
    Number(price),
    originalPrice ? Number(originalPrice) : null,
    badge || 'NEW',
    JSON.stringify(colors || [{ name: 'Default', hex: '#111111' }]),
    JSON.stringify(sizes || ['S', 'M', 'L']),
    JSON.stringify(stock || { 'S': 5, 'M': 5, 'L': 5 }),
    JSON.stringify(images || []),
    description || '',
    JSON.stringify(specs || {}),
    JSON.stringify(sizeChart || [])
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({
      success: true,
      message: 'Garment created successfully.',
      id: id
    });
  });
});

/**
 * DELETE /api/products/:id
 */
router.delete('/:id', (req, res) => {
  const sql = 'DELETE FROM products WHERE id = ?';
  db.run(sql, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Garment deleted.' });
  });
});

module.exports = router;
