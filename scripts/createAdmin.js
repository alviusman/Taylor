require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Cek apakah sudah ada admin
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin sudah ada!');
      console.log('Username:', existingAdmin.username);
      console.log('Email:', existingAdmin.email);
      
      // Update password jika mau
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('Reset password? (y/n): ', async (answer) => {
        if (answer.toLowerCase() === 'y') {
          existingAdmin.password = 'admin123'; // Password akan auto-hash
          await existingAdmin.save();
          console.log('✅ Password direset ke: admin123');
        }
        readline.close();
        process.exit(0);
      });
      
      return;
    }

    // Buat admin baru
    const admin = await Admin.create({
      username: 'admin',
      email: 'admin@taylor-ku.com',
      password: 'admin123', // Akan di-hash otomatis
      fullName: 'Administrator',
      role: 'super-admin'
    });

    console.log('✅ Admin berhasil dibuat!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username:', admin.username);
    console.log('Email:', admin.email);
    console.log('Password: admin123');
    console.log('Role:', admin.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  PENTING: Ganti password setelah login pertama kali!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createAdmin();