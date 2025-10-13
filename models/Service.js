const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama layanan harus diisi'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Deskripsi harus diisi']
  },
  price: {
    type: Number,
    required: [true, 'Harga harus diisi'],
    min: [0, 'Harga tidak boleh negatif']
  },
  duration: {
    type: String,
    required: [true, 'Durasi harus diisi']
  },
  image: {
    type: String,
    required: [true, 'URL gambar harus diisi']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);