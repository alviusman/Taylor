const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Service = require('../models/Service');
const { validateOrder } = require('../middleware/validator');
const { sendOrderConfirmation, sendStatusUpdate } = require('../config/email');

// Create order
router.post('/', validateOrder, async (req, res, next) => {
  try {
    const { name, phone, email, serviceId, notes, address } = req.body;
    
    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ 
        success: false, 
        message: 'Layanan tidak ditemukan' 
      });
    }

    const order = await Order.create({
      name,
      phone,
      email,
      service: serviceId,
      notes,
      address
    });

    // Populate service data
    await order.populate('service');

    if (order.email) {
      sendOrderConfirmation(order).catch(err => 
        console.error('Email send failed:', err.message)
      );
    }

    res.status(201).json({ 
      success: true, 
      message: 'Pesanan berhasil dibuat',
      data: order 
    });
  } catch (error) {
    next(error);
  }
});

// Get all orders
router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('service')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
});

// Get single order
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('service');
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pesanan tidak ditemukan' 
      });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// Update order status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('service');

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pesanan tidak ditemukan' 
      });
    }

    // TAMBAH INI: Send status update email
    if (order.email) {
      sendStatusUpdate(order, status).catch(err => 
        console.error('Email send failed:', err.message)
      );
    }

    res.json({ 
      success: true, 
      message: 'Status pesanan berhasil diupdate',
      data: order 
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;