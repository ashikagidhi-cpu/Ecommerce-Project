/**
 * VÉLORA Atelier - Orders API Controller
 * Stores completed orders and line items into SQLite3 database.
 */

const express = require('express');
const router = express.Router();
const db = require('../database');

/**
 * POST /api/orders
 * Record a completed checkout order and its line items
 */
router.post('/', (req, res) => {
  const { customer, shippingMethod, items, subtotal, discount, shipping, total, promoCode } = req.body;

  if (!customer || !items || items.length === 0) {
    return res.status(400).json({ error: 'Customer information and cart items are required.' });
  }

  const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

  const orderSql = `
    INSERT INTO orders (
      id, customer_name, customer_email, customer_address, customer_city,
      customer_postal, customer_country, shipping_method, subtotal, discount,
      shipping_cost, total, promo_code, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed')
  `;

  const orderParams = [
    orderId,
    customer.name,
    customer.email,
    customer.address,
    customer.city,
    customer.postal,
    customer.country,
    shippingMethod || 'standard',
    Number(subtotal) || 0,
    Number(discount) || 0,
    Number(shipping) || 0,
    Number(total) || 0,
    promoCode || null
  ];

  db.run(orderSql, orderParams, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to record order: ' + err.message });
    }

    // Insert order items
    const itemStmt = db.prepare(`
      INSERT INTO order_items (
        order_id, product_id, product_name, size, color, price, quantity, image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    items.forEach(item => {
      itemStmt.run(
        orderId,
        item.productId,
        item.name,
        item.size,
        item.color,
        item.price,
        item.quantity,
        item.image
      );
    });

    itemStmt.finalize((itemErr) => {
      if (itemErr) {
        console.error('Error inserting order items:', itemErr.message);
      }

      res.status(201).json({
        success: true,
        message: 'Order confirmed and registered in Atelier database.',
        order: {
          orderId,
          createdAt: new Date().toISOString(),
          customer,
          shippingMethod,
          items,
          subtotal,
          discount,
          shipping,
          total,
          promoCode,
          status: 'Confirmed'
        }
      });
    });
  });
});

/**
 * GET /api/orders
 * Retrieve list of orders with item summaries
 */
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM orders ORDER BY created_at DESC LIMIT 50';
  db.all(sql, [], (err, orders) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(orders);
  });
});

module.exports = router;
