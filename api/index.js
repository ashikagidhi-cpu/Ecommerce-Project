// Vercel Serverless Function Entrypoint
// Bridges Vercel serverless requests directly to the Express.js application
const app = require('../backend/server');

module.exports = app;
