/**
 * VÉLORA Atelier - User Profile REST Controller
 * Manages client portfolio, measurements, and user order histories in SQLite3.
 */

const express = require('express');
const router = express.Router();
const db = require('../database');

/**
 * GET /api/user/profile
 */
router.get('/profile', (req, res) => {
  const sql = 'SELECT * FROM user_profile WHERE id = "client_default"';
  db.get(sql, [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User profile not found.' });

    res.json({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      avatar: row.avatar,
      tier: row.tier,
      points: row.points,
      measurements: row.measurements ? JSON.parse(row.measurements) : {},
      addresses: row.addresses ? JSON.parse(row.addresses) : []
    });
  });
});

/**
 * PUT /api/user/profile
 */
router.put('/profile', (req, res) => {
  const { firstName, lastName, email, phone, avatar } = req.body;
  const sql = `
    UPDATE user_profile
    SET first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        avatar = COALESCE(?, avatar),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = "client_default"
  `;

  db.run(sql, [firstName, lastName, email, phone, avatar], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Profile updated in SQLite3.' });
  });
});

/**
 * PUT /api/user/measurements
 */
router.put('/measurements', (req, res) => {
  const { measurements } = req.body;
  if (!measurements) return res.status(400).json({ error: 'Measurements required.' });

  const sql = `
    UPDATE user_profile
    SET measurements = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = "client_default"
  `;

  db.run(sql, [JSON.stringify(measurements)], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Measurements saved in SQLite3.' });
  });
});

/**
 * GET /api/user/orders
 * Retrieve orders along with their line items
 */
router.get('/orders', (req, res) => {
  const ordersSql = 'SELECT * FROM orders ORDER BY created_at DESC';
  
  db.all(ordersSql, [], (err, orders) => {
    if (err) return res.status(500).json({ error: err.message });
    if (orders.length === 0) return res.json([]);

    const itemsSql = 'SELECT * FROM order_items WHERE order_id IN (' + orders.map(() => '?').join(',') + ')';
    const orderIds = orders.map(o => o.id);

    db.all(itemsSql, orderIds, (itemErr, items) => {
      if (itemErr) return res.status(500).json({ error: itemErr.message });

      // Group items by order_id
      const itemsByOrder = {};
      items.forEach(item => {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
        itemsByOrder[item.order_id].push({
          productId: item.product_id,
          name: item.product_name,
          size: item.size,
          color: item.color,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        });
      });

      const fullOrders = orders.map(o => ({
        orderId: o.id,
        createdAt: o.created_at,
        customer: {
          name: o.customer_name,
          email: o.customer_email,
          address: o.customer_address,
          city: o.customer_city,
          postal: o.customer_postal,
          country: o.customer_country
        },
        shippingMethod: o.shipping_method,
        subtotal: o.subtotal,
        discount: o.discount,
        shipping: o.shipping_cost,
        total: o.total,
        promoCode: o.promo_code,
        status: o.status,
        items: itemsByOrder[o.id] || []
      }));

      res.json(fullOrders);
    });
  });
});

module.exports = router;
