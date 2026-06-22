require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/products');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB Atlas ─────────────────────────────────
connectDB();

// ── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Routes ───────────────────────────────────────────────
app.use('/api/products', productRoutes);

// ── Health Check ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '✨ SANGEET – Tune of Trends API is live',
    database: 'MongoDB Atlas',
    storage: 'Cloudinary',
    version: '2.0.0',
  });
});

// ── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 SANGEET Backend   → http://localhost:${PORT}`);
  console.log(`🗄️  Database         → MongoDB Atlas`);
  console.log(`🖼️  Image Storage    → Cloudinary\n`);
});
