const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const PORT = 5000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Multer: local disk storage ──────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `product-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ── In-Memory Product Store ─────────────────────────────────
let products = [
  {
    _id: uuidv4(),
    name: 'Royal Banarasi Lehenga',
    price: 12999,
    size: 'M',
    category: 'Bridal',
    description: 'Handwoven Banarasi silk lehenga with intricate gold zari work. A timeless piece for the modern bride.',
    image: '',
    createdAt: new Date().toISOString(),
  },
  {
    _id: uuidv4(),
    name: 'Emerald Anarkali Suit',
    price: 5499,
    size: 'L',
    category: 'Festive',
    description: 'Flowing Anarkali in deep emerald green with gold embroidery. Perfect for festive occasions.',
    image: '',
    createdAt: new Date().toISOString(),
  },
  {
    _id: uuidv4(),
    name: 'Classic Sherwani Set',
    price: 8999,
    size: 'XL',
    category: 'Wedding',
    description: 'Regal ivory sherwani with gold buttons and a matching stole. Dressed for the grand occasion.',
    image: '',
    createdAt: new Date().toISOString(),
  },
  {
    _id: uuidv4(),
    name: 'Silk Saree – Gold Zari',
    price: 7499,
    size: 'Free Size',
    category: 'Ethnic',
    description: 'Pure Kanjivaram silk saree with rich gold zari border. A classic that never goes out of style.',
    image: '',
    createdAt: new Date().toISOString(),
  },
];

// ── Helper: build image URL ─────────────────────────────────
const getImageUrl = (req, filename) => {
  if (!filename) return '';
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

// ── ROUTES ──────────────────────────────────────────────────

// GET /api/products  (+ ?search= & ?size=)
app.get('/api/products', (req, res) => {
  const { search = '', size = '' } = req.query;
  let result = [...products];

  if (search.trim()) {
    result = result.filter(p =>
      p.name.toLowerCase().includes(search.trim().toLowerCase())
    );
  }
  if (size && size !== 'All') {
    result = result.filter(p => p.size === size);
  }

  res.json({ success: true, count: result.length, data: result });
});

// GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p._id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, data: product });
});

// POST /api/products
app.post('/api/products', upload.single('image'), (req, res) => {
  const { name, price, size, description = '', category = 'Ethnic' } = req.body;

  if (!name || !price || !size) {
    return res.status(400).json({ success: false, message: 'Name, price and size are required' });
  }

  const imageFile = req.file ? req.file.filename : '';

  const product = {
    _id: uuidv4(),
    name: name.trim(),
    price: parseFloat(price),
    size,
    category,
    description: description.trim(),
    image: imageFile ? getImageUrl(req, imageFile) : '',
    imageFile,
    createdAt: new Date().toISOString(),
  };

  products.unshift(product);
  res.status(201).json({ success: true, message: 'Product added successfully', data: product });
});

// PUT /api/products/:id
app.put('/api/products/:id', upload.single('image'), (req, res) => {
  const idx = products.findIndex(p => p._id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Product not found' });

  const { name, price, size, description, category } = req.body;
  const existing = products[idx];

  // If a new image was uploaded, delete the old file
  if (req.file && existing.imageFile) {
    const oldPath = path.join(__dirname, 'uploads', existing.imageFile);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const imageFile = req.file ? req.file.filename : existing.imageFile;

  products[idx] = {
    ...existing,
    name: name ? name.trim() : existing.name,
    price: price !== undefined ? parseFloat(price) : existing.price,
    size: size || existing.size,
    description: description !== undefined ? description.trim() : existing.description,
    category: category || existing.category,
    image: imageFile ? getImageUrl(req, imageFile) : existing.image,
    imageFile,
    updatedAt: new Date().toISOString(),
  };

  res.json({ success: true, message: 'Product updated successfully', data: products[idx] });
});

// DELETE /api/products/:id
app.delete('/api/products/:id', (req, res) => {
  const idx = products.findIndex(p => p._id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Product not found' });

  // Delete image file if exists
  const product = products[idx];
  if (product.imageFile) {
    const imgPath = path.join(__dirname, 'uploads', product.imageFile);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  products.splice(idx, 1);
  res.json({ success: true, message: 'Product deleted successfully' });
});

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: '✨ SANGEET API running', products: products.length });
});

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ success: false, message: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 SANGEET Backend → http://localhost:${PORT}`);
  console.log(`📦 ${products.length} demo products loaded`);
  console.log(`🖼️  Images served at http://localhost:${PORT}/uploads/\n`);
});
