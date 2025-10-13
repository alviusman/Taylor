const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// Get all services
router.get('/', async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
});

// Get single service
router.get('/:id', async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ 
        success: false, 
        message: 'Layanan tidak ditemukan' 
      });
    }
    res.json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
});

module.exports = router;