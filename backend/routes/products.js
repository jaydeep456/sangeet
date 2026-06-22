const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { upload, cloudinary } = require('../middleware/upload');

// ─────────────────────────────────────────────
// GET /api/products
// Get all products with optional search & filter
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search, size } = req.query;

    // Build query object
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (size && size !== 'All') {
      query.size = size;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/products/:id
// Get single product by ID
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/products
// Create a new product (with optional image upload)
// ─────────────────────────────────────────────
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, price, size, description, category } = req.body;

    const productData = {
      name,
      price: parseFloat(price),
      size,
      description,
      category,
    };

    // If image was uploaded to Cloudinary, attach URL
    if (req.file) {
      productData.image = req.file.path;
      productData.cloudinaryId = req.file.filename;
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
// PUT /api/products/:id
// Update an existing product
// ─────────────────────────────────────────────
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { name, price, size, description, category } = req.body;

    const updateData = {
      name: name || product.name,
      price: price !== undefined ? parseFloat(price) : product.price,
      size: size || product.size,
      description: description !== undefined ? description : product.description,
      category: category || product.category,
    };

    // If a new image is uploaded, delete old from Cloudinary and set new one
    if (req.file) {
      if (product.cloudinaryId) {
        await cloudinary.uploader.destroy(product.cloudinaryId);
      }
      updateData.image = req.file.path;
      updateData.cloudinaryId = req.file.filename;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/products/:id
// Delete a product and its Cloudinary image
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Delete image from Cloudinary if it exists
    if (product.cloudinaryId) {
      await cloudinary.uploader.destroy(product.cloudinaryId);
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
