require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/groups');
const User       = require('./models/User');
const bcrypt     = require('bcryptjs');

const app  = express();
const PORT = process.env.PORT || 5000;

// Helper to seed admin user if not exists
const seedAdmin = async () => {
  try {
    const admin = await User.findOne({ username: 'Sangeet' });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Sangeet@123', salt);
      await User.create({
        username: 'Sangeet',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('👑 Admin user seeded successfully (Sangeet / Sangeet@123)');
    }
  } catch (err) {
    console.error('⚠️  Admin seeding failed:', err.message);
  }
};

// ── Connect to MongoDB Atlas ─────────────────────────────────
connectDB().then(() => {
  seedAdmin();
});

// ── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/groups', groupRoutes);

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
