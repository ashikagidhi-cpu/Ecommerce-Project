/**
 * VÉLORA Atelier - Promo Vouchers API Controller
 */

const express = require('express');
const router = express.Router();

const PROMO_CODES = {
  "VELORA15": { discountType: "percent", value: 15, minOrder: 50, description: "15% off orders above $50" },
  "FREESHIP": { discountType: "shipping", value: 0, minOrder: 0, description: "Free Worldwide Express Delivery" },
  "WELCOME20": { discountType: "fixed", value: 20, minOrder: 100, description: "$20 off on your first drop above $100" }
};

/**
 * POST /api/promo/validate
 */
router.post('/validate', (req, res) => {
  const { code, subtotal } = req.body;
  const cleanCode = (code || '').trim().toUpperCase();
  const promo = PROMO_CODES[cleanCode];

  if (!promo) {
    return res.status(400).json({ valid: false, message: 'Invalid or expired promotional code.' });
  }

  const orderSubtotal = Number(subtotal) || 0;
  if (orderSubtotal < promo.minOrder) {
    return res.status(400).json({
      valid: false,
      message: `Order subtotal must be at least $${promo.minOrder} to apply this voucher.`
    });
  }

  let discountAmount = 0;
  if (promo.discountType === 'percent') {
    discountAmount = (orderSubtotal * promo.value) / 100;
  } else if (promo.discountType === 'fixed') {
    discountAmount = Math.min(promo.value, orderSubtotal);
  } else if (promo.discountType === 'shipping') {
    discountAmount = 'FREE_SHIPPING';
  }

  res.json({
    valid: true,
    code: cleanCode,
    discountType: promo.discountType,
    discountAmount,
    description: promo.description
  });
});

module.exports = router;
