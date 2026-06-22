const mongoose = require('mongoose');

/**
 * Product Schema for SANGEET clothing brand.
 * Stores product details including Cloudinary image URL.
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    size: {
      type: String,
      required: [true, 'Product size is required'],
      enum: {
        values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'],
        message: 'Size must be one of: XS, S, M, L, XL, XXL, Free Size',
      },
    },
    image: {
      type: String,
      default: '',
    },
    cloudinaryId: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: 'Ethnic',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
