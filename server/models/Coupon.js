const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Le code est requis'],
    unique: true,
    uppercase: true
  },
  description: {
    type: String,
    default: null
  },
  discount_type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discount_value: {
    type: Number,
    required: true,
    min: 0
  },
  minimum_amount: {
    type: Number,
    default: null
  },
  maximum_uses: {
    type: Number,
    default: null
  },
  current_uses: {
    type: Number,
    default: 0
  },
  start_date: {
    type: Date,
    default: null
  },
  end_date: {
    type: Date,
    default: null
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

couponSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Coupon', couponSchema);
