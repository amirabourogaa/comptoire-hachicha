const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema({
  title: {
    type: String,
    default: null
  },
  subtitle: {
    type: String,
    default: null
  },
  image_url: {
    type: String,
    required: [true, 'L\'image est requise']
  },
  button_text: {
    type: String,
    default: null
  },
  button_link: {
    type: String,
    default: null
  },
  display_order: {
    type: Number,
    default: 0
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

heroSlideSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('HeroSlide', heroSlideSchema);
