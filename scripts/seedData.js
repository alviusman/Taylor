require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('../models/Service');

const services = [
  {
    name: 'Jahit Baju Baru',
    description: 'Pembuatan baju custom sesuai desain dan ukuran Anda',
    price: 150000,
    duration: '5-7 hari',
    image: 'img/1.webp'
  },
  {
    name: 'Jahit Kebaya',
    description: 'Pembuatan kebaya untuk acara formal dan pernikahan',
    price: 500000,
    duration: '7-10 hari',
    image: 'img/2.webp'
  },
  {
    name: 'Jahit Jas',
    description: 'Pembuatan jas pria untuk acara resmi sesuai dengan ukuran anda',
    price: 750000,
    duration: '7-10 hari',
    image: 'img/3.webp'
  },
  {
    name: 'Jahit Celana',
    description: 'Pembuatan celana panjang atau pendek sesuai ukuran',
    price: 100000,
    duration: '3-5 hari',
    image: 'img/4.webp'
  },
  {
    name: 'Permak Pakaian',
    description: 'Memperbaiki atau mengubah ukuran pakaian',
    price: 50000,
    duration: '2-3 hari',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400'
  },
  {
    name: 'Jahit Kemeja',
    description: 'Pembuatan kemeja custom dengan berbagai model',
    price: 200000,
    duration: '5-7 hari',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400'
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Service.deleteMany({});
    console.log('Old data cleared');

    // Insert new data
    await Service.insertMany(services);
    console.log('✅ Sample data inserted successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedData();
