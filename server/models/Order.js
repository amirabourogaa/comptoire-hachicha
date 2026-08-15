const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  product_title: {
    type: String,
    required: true
  },
  product_price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  }
}, {
  timestamps: { createdAt: 'created_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

orderItemSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const orderSchema = new mongoose.Schema({
  customer_name: {
    type: String,
    required: [true, 'Le nom du client est requis']
  },
  customer_email: {
    type: String,
    required: [true, 'L\'email est requis']
  },
  customer_phone: {
    type: String,
    default: null
  },
  customer_address: {
    type: String,
    required: [true, 'L\'adresse est requise']
  },
  order_items: [orderItemSchema],
  total_amount: {
    type: Number,
    required: true
  },
  discount_amount: {
    type: Number,
    default: null
  },
  coupon_code: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'delivered', 'returned', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

orderSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Order', orderSchema);
