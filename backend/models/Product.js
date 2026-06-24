const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url:      { type: String, required: true },
    publicId: { type: String, default: '' },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    // Free-text size — no enum restriction so admin can type custom sizes
    size: {
      type: String,
      required: [true, 'Size is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'Ethnic',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    // Multiple images array (up to 10)
    images: {
      type: [imageSchema],
      default: [],
    },
    // ── Legacy single-image fields (kept for backward-compat) ──────────
    // Populated from images[0] if images[] is non-empty, else kept as-is
    image: {
      type: String,
      default: '',
    },
    cloudinaryPublicId: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Virtual: primary image URL (first in array, or legacy field)
productSchema.virtual('primaryImage').get(function () {
  return (this.images && this.images.length > 0) ? this.images[0].url : this.image;
});

module.exports = mongoose.model('Product', productSchema);
