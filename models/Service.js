const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    ru: {
      type: String,
      required: true
    },
    de: {
      type: String,
      required: true
    }
  },
  price: {
    ru: {
      type: String,
      required: true
    },
    de: {
      type: String,
      required: true
    }
  },
  description: {
    ru: {
      type: String,
      required: true
    },
    de: {
      type: String,
      required: true
    }
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
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

module.exports = mongoose.model('Service', serviceSchema); 