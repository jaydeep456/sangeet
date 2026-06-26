const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      maxlength: [100, 'Group name cannot exceed 100 characters'],
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);
