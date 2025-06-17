const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema({
  title: {
    ru: {
      type: String,
      required: false
    },
    de: {
      type: String,
      required: false
    }
  },
  category: {
    type: String,
    required: true,
    enum: ['manicure', 'pedicure', 'design', 'extensions']
  },
  imageUrl: {
    type: String,
    required: false
  },
  thumbnailUrl: {
    type: String
  },
  color: {
    type: String,
    default: '#ff6b9d'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GalleryItem', galleryItemSchema); 