const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB!');
    mongoose.connection.close(); // Tambahkan ini biar langsung keluar
  })
  .catch(err => console.error('❌ Connection error:', err));
