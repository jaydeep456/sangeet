const express  = require('express');
const router   = express.Router();
const Product  = require('../models/Product');
const { upload, cloudinary } = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/auth');

// ─── Helper: Delete one image from Cloudinary ───────────────────────────
const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`🗑️  Cloudinary image deleted: ${publicId}`);
  } catch (err) {
    console.error(`⚠️  Could not delete Cloudinary image ${publicId}:`, err.message);
  }
};

// ─── Helper: Delete all images of a product from Cloudinary ─────────────
const deleteAllProductImages = async (product) => {
  if (product.images && product.images.length > 0) {
    for (const img of product.images) {
      await deleteCloudinaryImage(img.publicId);
    }
  }
  // Also clean up legacy single-image field
  if (product.cloudinaryPublicId) {
    await deleteCloudinaryImage(product.cloudinaryPublicId);
  }
};

// ─── GET /api/products ───────────────────────────────────────────────────
// Supports: ?search=  &size=  &category=  &minPrice=  &maxPrice=  &sort=
router.get('/', protect, async (req, res) => {
  try {
    const {
      search   = '',
      size     = '',
      category = '',
      minPrice = '',
      maxPrice = '',
      sort     = 'newest',
      ids      = '', // <-- Added for sharing multiple products
    } = req.query;

    const query = {};

    if (ids.trim()) {
      const idArray = ids.split(',').map(id => id.trim()).filter(id => id);
      if (idArray.length > 0) {
        query._id = { $in: idArray };
      }
    }

    if (search.trim()) {
      // Search across name AND description
      query.$or = [
        { name:        { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { category:    { $regex: search.trim(), $options: 'i' } },
      ];
    }
    if (size && size !== 'All') {
      query.size = { $regex: size.trim(), $options: 'i' };
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (minPrice !== '' || maxPrice !== '') {
      query.price = {};
      if (minPrice !== '' && !isNaN(minPrice)) query.price.$gte = parseFloat(minPrice);
      if (maxPrice !== '' && !isNaN(maxPrice)) query.price.$lte = parseFloat(maxPrice);
    }

    // Sort
    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc')  sortObj = { price: 1 };
    if (sort === 'price_desc') sortObj = { price: -1 };
    if (sort === 'name_asc')   sortObj = { name: 1 };
    if (sort === 'name_desc')  sortObj = { name: -1 };

    const products = await Product.find(query).sort(sortObj);

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
// Creates a new product. Accepts up to 10 images as multipart/form-data field "images"
router.post('/', protect, adminOnly, upload.array('images', 10), async (req, res) => {
  try {
    const { name, price, size, description = '', category = 'Ethnic' } = req.body;

    const productData = {
      name:        name?.trim(),
      price:       parseFloat(price),
      size:        size?.trim(),
      description: description.trim(),
      category,
    };

    // Build images array from uploaded files
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(f => ({
        url:      f.path,       // Cloudinary secure URL
        publicId: f.filename,   // Cloudinary public_id
      }));
      // Populate legacy fields for backward-compat
      productData.image             = productData.images[0].url;
      productData.cloudinaryPublicId = productData.images[0].publicId;
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
// Updates a product. Accepts up to 10 new images.
// Also accepts "removeImages" as a JSON array of publicIds to delete.
router.put('/:id', protect, adminOnly, upload.array('images', 10), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const { name, price, size, description, category, removeImages } = req.body;

    const updateData = {
      name:        name?.trim()        || product.name,
      price:       price !== undefined  ? parseFloat(price) : product.price,
      size:        size?.trim()        || product.size,
      description: description !== undefined ? description.trim() : product.description,
      category:    category            || product.category,
    };

    // Handle image removal
    let existingImages = product.images ? [...product.images] : [];
    if (removeImages) {
      let toRemove = [];
      try { toRemove = JSON.parse(removeImages); } catch {}
      for (const pid of toRemove) {
        await deleteCloudinaryImage(pid);
        existingImages = existingImages.filter(img => img.publicId !== pid);
      }
    }

    // Append newly uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => ({
        url:      f.path,
        publicId: f.filename,
      }));
      existingImages = [...existingImages, ...newImages];
    }

    updateData.images = existingImages;

    // Keep legacy fields in sync
    if (existingImages.length > 0) {
      updateData.image              = existingImages[0].url;
      updateData.cloudinaryPublicId = existingImages[0].publicId;
    } else {
      updateData.image              = '';
      updateData.cloudinaryPublicId = '';
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
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Delete all Cloudinary images
    await deleteAllProductImages(product);

    await product.deleteOne();
    res.json({ success: true, message: 'Product and all its images deleted permanently' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
