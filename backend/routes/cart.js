const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { protect, adminOnly } = require('../middleware/auth');

// ─── GET /api/cart ─────────────────────────────────────────────
// Get logged-in user's cart (fully populated with product details)
router.get('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price size category description images image');

    if (!cart) {
      return res.json({ success: true, data: { items: [], total: 0 } });
    }

    // Filter out items whose product was deleted
    const validItems = cart.items.filter(item => item.product !== null);
    const total = validItems.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);

    res.json({ success: true, data: { ...cart.toObject(), items: validItems, total } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/cart/add ────────────────────────────────────────
// Add a product to the cart (or increase qty if already in cart)
router.post('/add', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // First time — create cart for this user
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId, quantity }],
      });
    } else {
      const existingIdx = cart.items.findIndex(
        item => item.product.toString() === productId
      );

      if (existingIdx > -1) {
        // Already in cart — increase quantity
        cart.items[existingIdx].quantity += quantity;
      } else {
        // New item — push to items array
        cart.items.push({ product: productId, quantity });
      }
      await cart.save();
    }

    // Return populated cart
    const populated = await Cart.findById(cart._id)
      .populate('items.product', 'name price size category description images image');

    const total = populated.items.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);

    res.json({ success: true, message: 'Added to cart ✨', data: { ...populated.toObject(), total } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/cart/update/:itemId ──────────────────────────────
// Update quantity of a specific cart item
router.put('/update/:itemId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });

    item.quantity = quantity;
    await cart.save();

    const populated = await Cart.findById(cart._id)
      .populate('items.product', 'name price size category description images image');

    const total = populated.items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

    res.json({ success: true, message: 'Cart updated', data: { ...populated.toObject(), total } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/cart/remove/:itemId ──────────────────────────
// Remove a specific item from cart
router.delete('/remove/:itemId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    await cart.save();

    const populated = await Cart.findById(cart._id)
      .populate('items.product', 'name price size category description images image');

    const total = populated.items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

    res.json({ success: true, message: 'Item removed from cart', data: { ...populated.toObject(), total } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/cart/clear ────────────────────────────────────
// Clear entire cart
router.delete('/clear', protect, async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [] },
      { new: true }
    );
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/cart/admin/all ───────────────────────────────────
// ADMIN: Get all users' carts with full details
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const carts = await Cart.find({ 'items.0': { $exists: true } }) // only non-empty carts
      .populate('user', 'username role createdAt')
      .populate('items.product', 'name price size category description images image');

    const cartsWithTotals = carts.map(cart => {
      const validItems = cart.items.filter(item => item.product !== null);
      const total = validItems.reduce((sum, item) => {
        return sum + (item.product?.price || 0) * item.quantity;
      }, 0);
      return { ...cart.toObject(), items: validItems, total };
    });

    res.json({ success: true, count: cartsWithTotals.length, data: cartsWithTotals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
