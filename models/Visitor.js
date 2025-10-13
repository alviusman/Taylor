const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true
  },
  userAgent: String,
  page: String,
  referrer: String,
  country: String,
  city: String,
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'unknown'],
    default: 'unknown'
  }
}, {
  timestamps: true
});

// Index untuk query cepat
visitorSchema.index({ createdAt: 1 });
visitorSchema.index({ ip: 1 });

module.exports = mongoose.model('Visitor', visitorSchema);