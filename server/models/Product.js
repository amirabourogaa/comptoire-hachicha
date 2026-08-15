const mongoose = require('mongoose');

const productColorSchema = new mongoose.Schema({
  color_name: {
    type: String,
    required: true
  },
  color_code: String,
  image_url: {
    type: String,
    required: true
  }
});

const productSizeSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    default: 0
  }
});

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true
  },
  description: {
    type: String,
    default: null
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: 0
  },
  promo_price: {
    type: Number,
    default: null
  },
  image_url: {
    type: String,
    default: null
  },
  images: [{
    type: String
  }],
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null
  },
  is_active: {
    type: Boolean,
    default: true
  },
  is_approved: {
    type: Boolean,
    default: false
  },
  is_flash_sale: {
    type: Boolean,
    default: false
  },
  product_colors: [productColorSchema],
  product_sizes: [productSizeSchema]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for id (to match Supabase UUID format)
productSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Product', productSchema);
