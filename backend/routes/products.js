const express  = require('express');
const router   = express.Router();
const Product  = require('../models/Product');
const { upload, cloudinary } = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/auth');

// ─── Helper: Delete image from Cloudinary ────────────────────────────────
const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`🗑️  Cloudinary image deleted: ${publicId}`);
  } catch (err) {
    console.error(`⚠️  Could not delete Cloudinary image ${publicId}:`, err.message);
  }
};

// ─── GET /api/products ───────────────────────────────────────────────────
// Supports: ?search=name   &size=M
router.get('/', protect, async (req, res) => {
  try {
    const { search = '', size = '' } = req.query;
    const query = {};

    if (search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }
    if (size && size !== 'All') {
      query.size = size;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/products/:id ───────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/products ──────────────────────────────────────────────────
// Creates a new product. Image upload is optional (multipart/form-data).
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { name, price, size, description = '', category = 'Ethnic' } = req.body;

    const productData = {
      name: name?.trim(),
      price: parseFloat(price),
      size,
      description: description.trim(),
      category,
    };

    // Attach Cloudinary image info if uploaded
    if (req.file) {
      productData.image             = req.file.path;      // secure Cloudinary URL
      productData.cloudinaryPublicId = req.file.filename; // Cloudinary public_id
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product added to the collection ✨',
      data: product,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msgs = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: msgs.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/products/:id ───────────────────────────────────────────────
// Updates a product. If a new image is uploaded, the old Cloudinary image is deleted.
router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const { name, price, size, description, category } = req.body;

    const updateData = {
      name:        name?.trim()        || product.name,
      price:       price !== undefined  ? parseFloat(price) : product.price,
      size:        size                || product.size,
      description: description !== undefined ? description.trim() : product.description,
      category:    category            || product.category,
    };

    // If a new image was uploaded — delete old one from Cloudinary, store new one
    if (req.file) {
      await deleteCloudinaryImage(product.cloudinaryPublicId);
      updateData.image              = req.file.path;
      updateData.cloudinaryPublicId = req.file.filename;
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Product updated successfully ✨', data: updated });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msgs = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: msgs.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/products/:id ────────────────────────────────────────────
// Deletes the product from MongoDB AND removes its image from Cloudinary.
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // ✅ Delete image from Cloudinary FIRST
    await deleteCloudinaryImage(product.cloudinaryPublicId);

    // Then delete the product record from MongoDB
    await product.deleteOne();

    res.json({ success: true, message: 'Product and its image deleted permanently' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
