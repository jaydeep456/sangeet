const mongoose = require('mongoose');

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
    size: {
      type: String,
      required: [true, 'Size is required'],
      enum: {
        values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'],
        message: '{VALUE} is not a valid size',
      },
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
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    // Cloudinary public image URL (shown to users)
    image: {
      type: String,
      default: '',
    },
    // Cloudinary public_id — used to DELETE the image from Cloudinary
    cloudinaryPublicId: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
