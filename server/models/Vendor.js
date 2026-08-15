const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du vendeur est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    minlength: [8, 'Le mot de passe doit avoir au moins 8 caractères'],
    select: false
  },
  phone: {
    type: String,
    trim: true,
    default: null
  },
  description: {
    type: String,
    trim: true,
    default: null
  },
  logo_url: {
    type: String,
    default: null
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Address fields
  address_street: {
    type: String,
    default: null
  },
  address_city: {
    type: String,
    default: null
  },
  address_state: {
    type: String,
    default: null
  },
  address_zip: {
    type: String,
    default: null
  },
  address_country: {
    type: String,
    default: 'Tunisie'
  },
  // Bank details
  bank_name: {
    type: String,
    default: null
  },
  account_number: {
    type: String,
    default: null
  },
  rib: {
    type: String,
    default: null
  },
  // Status
  commission_rate: {
    type: Number,
    default: 10,
    min: 0,
    max: 100
  },
  is_active: {
    type: Boolean,
    default: true
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  // Stats
  total_products: {
    type: Number,
    default: 0
  },
  total_orders: {
    type: Number,
    default: 0
  },
  total_revenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for id
vendorSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Hash password before saving
vendorSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
vendorSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Index for searching
vendorSchema.index({ name: 'text', email: 'text' });

module.exports = mongoose.model('Vendor', vendorSchema);
