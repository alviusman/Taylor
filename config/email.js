const nodemailer = require('nodemailer');

// Setup email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send order confirmation email
const sendOrderConfirmation = async (order) => {
  if (!order.email) return;

  const mailOptions = {
    from: `Taylor-Ku <${process.env.EMAIL_USER}>`,
    to: order.email,
    subject: `✅ Konfirmasi Pesanan #${order._id.toString().substring(0, 8).toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .order-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .order-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
          .label { color: #666; font-weight: 600; }
          .value { color: #333; text-align: right; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #25D366; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🧵 Taylor-Ku</h1>
            <p style="margin: 10px 0 0 0;">Terima Kasih atas Pesanan Anda!</p>
          </div>
          
          <div class="content">
            <h2 style="color: #333;">Halo, ${order.name}! 👋</h2>
            <p>Pesanan Anda telah kami terima dan akan segera diproses. Berikut detail pesanan Anda:</p>
            
            <div class="order-box">
              <h3 style="margin-top: 0; color: #667eea;">Detail Pesanan</h3>
              <div class="order-row">
                <span class="label">Order ID</span>
                <span class="value">#${order._id.toString().substring(0, 8).toUpperCase()}</span>
              </div>
              <div class="order-row">
                <span class="label">Layanan</span>
                <span class="value">${order.service.name}</span>
              </div>
              <div class="order-row">
                <span class="label">Harga</span>
                <span class="value">Rp ${order.service.price.toLocaleString('id-ID')}</span>
              </div>
              <div class="order-row">
                <span class="label">Estimasi</span>
                <span class="value">${order.service.duration}</span>
              </div>
              <div class="order-row" style="border-bottom: none;">
                <span class="label">Catatan</span>
                <span class="value">${order.notes || '-'}</span>
              </div>
            </div>
            
            <p>Untuk konfirmasi dan update pesanan, silakan hubungi kami via WhatsApp:</p>
            <center>
              <a href="https://wa.me/6282369854688?text=Halo,%20saya%20ingin%20konfirmasi%20pesanan%20%23${order._id.toString().substring(0, 8).toUpperCase()}" class="button">
                💬 Hubungi via WhatsApp
              </a>
            </center>
            
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              📍 Lacak status pesanan Anda kapan saja di: 
              <a href="http://localhost:3000/tracking.html" style="color: #667eea;">Taylor-Ku Tracking</a>
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">© 2025 Taylor-Ku. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">📞 0823-6985-4688 | 📧 ${process.env.EMAIL_USER}</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation email sent to:', order.email);
  } catch (error) {
    console.error('❌ Email error:', error.message);
  }
};

// Send status update email
const sendStatusUpdate = async (order, newStatus) => {
  if (!order.email) return;

  const statusInfo = {
    pending: { 
      icon: '📝', 
      title: 'Pesanan Menunggu Konfirmasi',
      message: 'Pesanan Anda sedang menunggu konfirmasi dari kami.',
      color: '#ffc107'
    },
    processing: { 
      icon: '🔧', 
      title: 'Pesanan Sedang Dikerjakan',
      message: 'Pesanan Anda sedang dalam proses pengerjaan oleh tim kami.',
      color: '#2196F3'
    },
    completed: { 
      icon: '✅', 
      title: 'Pesanan Selesai!',
      message: 'Pesanan Anda sudah selesai dan siap untuk diambil!',
      color: '#4CAF50'
    },
    cancelled: { 
      icon: '❌', 
      title: 'Pesanan Dibatalkan',
      message: 'Pesanan Anda telah dibatalkan.',
      color: '#f44336'
    }
  };

  const status = statusInfo[newStatus] || statusInfo.pending;

  const mailOptions = {
    from: `Taylor-Ku <${process.env.EMAIL_USER}>`,
    to: order.email,
    subject: `${status.icon} Update Status Pesanan #${order._id.toString().substring(0, 8).toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: ${status.color}; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .status-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${status.color}; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .button { display: inline-block; background: #25D366; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 3rem;">${status.icon}</h1>
            <h2 style="margin: 10px 0 0 0;">${status.title}</h2>
          </div>
          
          <div class="content">
            <h3>Halo, ${order.name}!</h3>
            <p>${status.message}</p>
            
            <div class="status-box">
              <p style="margin: 0;"><strong>Order ID:</strong> #${order._id.toString().substring(0, 8).toUpperCase()}</p>
              <p style="margin: 10px 0 0 0;"><strong>Layanan:</strong> ${order.service.name}</p>
            </div>
            
            ${newStatus === 'completed' ? `
              <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; color: #155724;">
                <p style="margin: 0; font-weight: 600;">🎉 Pesanan Anda sudah siap diambil!</p>
                <p style="margin: 10px 0 0 0; font-size: 14px;">Silakan hubungi kami untuk mengatur jadwal pengambilan.</p>
              </div>
            ` : ''}
            
            <center>
              <a href="https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20menanyakan%20pesanan%20%23${order._id.toString().substring(0, 8).toUpperCase()}" class="button">
                💬 Hubungi via WhatsApp
              </a>
            </center>
            
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              📍 Lacak status pesanan: 
              <a href="http://localhost:3000/tracking.html" style="color: #667eea;">Taylor-Ku Tracking</a>
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">© 2025 Taylor-Ku. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">📞 0823-6985-4688 | 📧 ${process.env.EMAIL_USER}</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Status update email (${newStatus}) sent to:`, order.email);
  } catch (error) {
    console.error('❌ Email error:', error.message);
  }
};

module.exports = { sendOrderConfirmation, sendStatusUpdate };