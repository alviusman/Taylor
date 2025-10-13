const Visitor = require('../models/Visitor');

const trackVisitor = async (req, res, next) => {
  try {
    // Jangan track admin routes
    if (req.path.startsWith('/admin') || req.path.startsWith('/api/admin')) {
      return next();
    }

    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const page = req.path;
    const referrer = req.headers.referer || req.headers.referrer || 'direct';

    // Detect device type
    let device = 'desktop';
    if (/mobile/i.test(userAgent)) {
      device = 'mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
      device = 'tablet';
    }

    // Save visitor (non-blocking)
    Visitor.create({
      ip,
      userAgent,
      page,
      referrer,
      device
    }).catch(err => console.error('Visitor tracking error:', err));

  } catch (error) {
    console.error('Visitor tracking error:', error);
  }
  
  next();
};

module.exports = { trackVisitor };