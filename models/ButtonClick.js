const mongoose = require('mongoose');

const buttonClickSchema = new mongoose.Schema({
  buttonType: {
    type: String,
    enum: ['whatsapp', 'instagram', 'phone'],
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  lastClicked: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Создаем уникальный индекс для типа кнопки
buttonClickSchema.index({ buttonType: 1 }, { unique: true });

module.exports = mongoose.model('ButtonClick', buttonClickSchema); 