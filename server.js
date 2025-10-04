const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Database simulasi (dalam production gunakan MongoDB/PostgreSQL)
let orders = [];
let services = [
  {
    id: 1,
    name: 'Jahit Baju Baru',
    description: 'Pembuatan baju custom sesuai desain dan ukuran Anda',
    price: 150000,
    duration: '5-7 hari',
    image: 'img/1.webp'
  },
  {
    id: 2,
    name: 'Jahit Kebaya',
    description: 'Pembuatan kebaya untuk acara formal dan pernikahan',
    price: 50000,
    duration: '2-6 hari',
    image: 'img/2.webp'
  },
  {
    id: 3,
    name: 'JAS',
    description: 'Pembuatan jas pria untuk acara resmi sesuai dengan ukuran anda',
    price: 75000,
    duration: '3-6 hari',
    image: 'img/3.webp'
  },
  {
    id: 4,
    name: 'Jahit Celana',
    description: 'Pembuatan celana panjang atau pendek sesuai ukuran',
    price: 500000,
    duration: '3-4 hari',
    image: 'img/4.webp'
  },
  {
    id: 5,
    name: 'Jahit Kemeja',
    description: 'Pembuatan kemeja custom dengan berbagai model',
    price: 200000,
    duration: '5-7 hari',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400'
  },
  {
    id: 6,
    name: 'Jahit Celana',
    description: 'Pembuatan celana panjang atau pendek sesuai ukuran',
    price: 150000,
    duration: '4-6 hari',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400'
  }
];

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all services
app.get('/api/services', (req, res) => {
  res.json({ success: true, data: services });
});

// Get single service
app.get('/api/services/:id', (req, res) => {
  const service = services.find(s => s.id === parseInt(req.params.id));
  if (service) {
    res.json({ success: true, data: service });
  } else {
    res.status(404).json({ success: false, message: 'Layanan tidak ditemukan' });
  }
});

// Create order
app.post('/api/orders', (req, res) => {
  const { name, phone, email, serviceId, notes, address } = req.body;
  
  if (!name || !phone || !serviceId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Nama, telepon, dan layanan harus diisi' 
    });
  }

  const service = services.find(s => s.id === parseInt(serviceId));
  if (!service) {
    return res.status(404).json({ 
      success: false, 
      message: 'Layanan tidak ditemukan' 
    });
  }

  const order = {
    id: orders.length + 1,
    name,
    phone,
    email,
    serviceId: parseInt(serviceId),
    serviceName: service.name,
    price: service.price,
    notes,
    address,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  res.status(201).json({ 
    success: true, 
    message: 'Pesanan berhasil dibuat',
    data: order 
  });
});

// Get all orders
app.get('/api/orders', (req, res) => {
  res.json({ success: true, data: orders });
});

// Get single order
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));
  if (order) {
    res.json({ success: true, data: order });
  } else {
    res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
  }
});

// Update order status
app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const order = orders.find(o => o.id === parseInt(req.params.id));
  
  if (!order) {
    return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();
  
  res.json({ 
    success: true, 
    message: 'Status pesanan berhasil diupdate',
    data: order 
  });
});

// Contact form
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'Semua field harus diisi' 
    });
  }

  // Dalam production, kirim email atau simpan ke database
  console.log('Pesan kontak:', { name, email, message });
  
  res.json({ 
    success: true, 
    message: 'Pesan Anda berhasil dikirim. Kami akan segera menghubungi Anda.' 
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});