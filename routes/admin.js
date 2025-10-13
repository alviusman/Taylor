const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Order = require('../models/Order');
const Service = require('../models/Service');
const Visitor = require('../models/Visitor');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');

// Login Admin
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password harus diisi'
      });
    }

    // Cari admin
    const admin = await Admin.findOne({ username });

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    // Cek password
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'taylor-secret-key-2025',
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        username: admin.username,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// Logout Admin
router.post('/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.json({
    success: true,
    message: 'Logout berhasil'
  });
});

// Get Dashboard Stats
router.get('/stats', protect, async (req, res, next) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Orders stats
    const totalOrders = await Order.countDocuments();
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const completedOrders = await Order.countDocuments({ status: 'completed' });

    // Revenue stats
    const ordersWithService = await Order.find({ status: 'completed' }).populate('service');
    const totalRevenue = ordersWithService.reduce((sum, order) => sum + (order.service?.price || 0), 0);

    const thisMonthOrders = await Order.find({
      status: 'completed',
      createdAt: { $gte: thisMonth }
    }).populate('service');
    const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + (order.service?.price || 0), 0);

    // Visitor stats
    const totalVisitors = await Visitor.countDocuments();
    const todayVisitors = await Visitor.countDocuments({ createdAt: { $gte: today } });
    const thisMonthVisitors = await Visitor.countDocuments({ createdAt: { $gte: thisMonth } });

    // Popular services
    const popularServices = await Order.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'services', localField: '_id', foreignField: '_id', as: 'serviceData' } },
      { $unwind: '$serviceData' }
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .populate('service')
      .sort({ createdAt: -1 })
      .limit(10);

    // Visitor chart data (last 7 days)
    const visitorChart = await Visitor.aggregate([
      { $match: { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Order chart data (last 30 days)
    const orderChart = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Device stats
    const deviceStats = await Visitor.aggregate([
      {
        $group: {
          _id: '$device',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        orders: {
          total: totalOrders,
          today: todayOrders,
          pending: pendingOrders,
          processing: processingOrders,
          completed: completedOrders
        },
        revenue: {
          total: totalRevenue,
          thisMonth: thisMonthRevenue
        },
        visitors: {
          total: totalVisitors,
          today: todayVisitors,
          thisMonth: thisMonthVisitors
        },
        popularServices,
        recentOrders,
        charts: {
          visitors: visitorChart,
          orders: orderChart
        },
        deviceStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// Verify Token
router.get('/verify', protect, (req, res) => {
  res.json({
    success: true,
    data: {
      username: req.admin.username,
      fullName: req.admin.fullName,
      email: req.admin.email,
      role: req.admin.role
    }
  });
});

module.exports = router;