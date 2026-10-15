/**
 * Automated Verification Script for Express + SQLite3 Backend
 */

const http = require('http');
const path = require('path');
const fs = require('fs');

// Launch server in-process for testing
const { app, server } = require('./server');

function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: path,
      method: method,
      headers: { ...headers }
    };

    if (body && typeof body === 'object') {
      body = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', err => reject(err));
    if (body) req.write(body);
    req.end();
  });
}

async function runTests() {
  console.log('\n--- STARTING BACKEND INTEGRATION TESTS ---\n');

  try {
    // 1. Health Check
    console.log('[1/7] Testing GET /api/health...');
    const health = await makeRequest('/api/health');
    console.log('Result:', health.status, health.data.server, health.data.database);
    if (health.status !== 200 || health.data.status !== 'ok') throw new Error('Health check failed');

    // 2. Products List
    console.log('[2/7] Testing GET /api/products...');
    const products = await makeRequest('/api/products');
    console.log('Products count:', products.data.length);
    if (products.status !== 200 || products.data.length !== 10) throw new Error('Expected 10 products');

    // 3. Filtered Products
    console.log('[3/7] Testing GET /api/products?category=outerwear...');
    const outerwear = await makeRequest('/api/products?category=outerwear');
    console.log('Outerwear count:', outerwear.data.length);
    if (outerwear.status !== 200 || outerwear.data.length < 2) throw new Error('Outerwear filter failed');

    // 4. Promo Code Validation
    console.log('[4/7] Testing POST /api/promo/validate with VELORA15...');
    const promo = await makeRequest('/api/promo/validate', 'POST', { code: 'VELORA15', subtotal: 100 });
    console.log('Promo result:', promo.data.valid, 'Discount amount:', promo.data.discountAmount);
    if (!promo.data.valid || promo.data.discountAmount !== 15) throw new Error('Promo validation failed');

    // 5. User Profile
    console.log('[5/7] Testing GET /api/user/profile...');
    const user = await makeRequest('/api/user/profile');
    console.log('User name:', user.data.firstName, user.data.lastName, 'Tier:', user.data.tier);
    if (!user.data.firstName || user.data.tier !== 'VIP PRIVÉ') throw new Error('User profile failed');

    // 6. User Orders
    console.log('[6/7] Testing GET /api/user/orders...');
    const orders = await makeRequest('/api/user/orders');
    console.log('Orders found:', orders.data.length, 'First order ID:', orders.data[0]?.orderId);
    if (!orders.data[0]?.orderId) throw new Error('Order history failed');

    // 7. Place Order
    console.log('[7/7] Testing POST /api/orders...');
    const newOrderPayload = {
      customer: {
        name: 'Sophia Laurent',
        email: 'sophia@example.com',
        address: '77 Avenue Montaigne',
        city: 'Paris',
        postal: '75008',
        country: 'France'
      },
      shippingMethod: 'standard',
      items: [
        {
          productId: 'vel-004',
          name: 'Chunky Ribbed Cashmere Sweater',
          size: 'M',
          color: 'Oatmeal Melange',
          price: 320,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000'
        }
      ],
      subtotal: 320,
      discount: 32,
      shipping: 0,
      total: 288,
      promoCode: 'VELORA10'
    };
    const placeOrder = await makeRequest('/api/orders', 'POST', newOrderPayload);
    console.log('Order created successfully:', placeOrder.data.order?.orderId, 'Status:', placeOrder.data.order?.status);
    if (placeOrder.status !== 201 || !placeOrder.data.order?.orderId) throw new Error('Order creation failed');

    console.log('\n>>> ALL 7 BACKEND TESTS PASSED SUCCESSFULLY! <<<\n');
  } catch (err) {
    console.error('Test error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
}

// Give server 500ms to bind, then run tests
setTimeout(runTests, 500);
