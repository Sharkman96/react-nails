const mongoose = require('mongoose');

const pageViewSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  page: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'Unknown'
  },
  city: {
    type: String,
    default: 'Unknown'
  },
  referrer: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'ru'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Индексы для быстрого поиска
pageViewSchema.index({ timestamp: -1 });
pageViewSchema.index({ country: 1 });
pageViewSchema.index({ page: 1 });
pageViewSchema.index({ ip: 1, timestamp: -1 });

module.exports = mongoose.model('PageView', pageViewSchema); 