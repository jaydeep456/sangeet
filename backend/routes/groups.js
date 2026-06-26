const express = require('express');
const router = express.Router();
const Group = require('../models/Group');

// @route   POST /api/groups
// @desc    Create a new group
// @access  Public (or Viewers)
router.post('/', async (req, res) => {
  try {
    const { name, products } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Group name is required' });
    }

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: 'Products are required to create a group' });
    }

    const newGroup = await Group.create({
      name,
      products
    });

    res.status(201).json({ success: true, data: newGroup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/groups
// @desc    Get all groups
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Populate products to show counts or images if needed, or just return basic info
    const groups = await Group.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: groups.length, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
