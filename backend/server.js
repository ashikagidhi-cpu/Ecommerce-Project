/**
 * VÉLORA Atelier - Express.js Decoupled Server
 * Connects SQLite3 database, handles local file uploads, and serves the decoupled frontend.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Ensure database module is initialized & seeded
require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure local uploads directory exists
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// 1. Static Asset Serving: Local Uploads Folder
app.use('/uploads', express.static(uploadsPath));

// 2. Static Asset Serving: Decoupled Frontend
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// 3. API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'VÉLORA Atelier Decoupled API',
    database: 'SQLite3',
    uploadFolder: 'local /uploads',
    timestamp: new Date().toISOString()
  });
});

// 4. Mount API Route Handlers
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const uploadRouter = require('./routes/upload');
const userRouter = require('./routes/user');
const promoRouter = require('./routes/promo');

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/user', userRouter);
app.use('/api/promo', promoRouter);

// 5. Fallback route to frontend index.html for Single Page Application navigation
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found.' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

let server;
if (require.main === module || !process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  VÉLORA Atelier Server Running on Port ${PORT}`);
    console.log(`  Frontend App:     http://localhost:${PORT}`);
    console.log(`  API Health:       http://localhost:${PORT}/api/health`);
    console.log(`  Local Uploads:    http://localhost:${PORT}/uploads`);
    console.log(`  Database:         SQLite3`);
    console.log(`====================================================`);
  });
}

module.exports = app;
module.exports.app = app;
module.exports.server = server;
