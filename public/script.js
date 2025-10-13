// Auto-detect API URL
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : `${window.location.origin}/api`;

// Mobile Navigation
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
});

document.querySelectorAll(".nav-links a").forEach(n => 
  n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  })
);

// Sticky Header on Scroll
const header = document.querySelector("header");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

// Load Services
async function loadServices() {
  const grid = document.getElementById('servicesGrid');
  grid.innerHTML = '<div class="loading">Memuat layanan...</div>';
  
  try {
    const response = await fetch(`${API_URL}/services`);
    const result = await response.json();
    
    if (result.success && result.data.length > 0) {
      displayServices(result.data);
      populateServiceSelect(result.data);
    } else {
      grid.innerHTML = '<p class="no-data">Saat ini belum ada layanan tersedia.</p>';
    }
  } catch (error) {
    console.error('Error loading services:', error);
    grid.innerHTML = '<p class="error">Gagal memuat layanan. Silakan refresh halaman.</p>';
  }
}

function displayServices(services) {
  const grid = document.getElementById('servicesGrid');
  grid.innerHTML = services.map(service => `
    <div class="service-card">
      <img src="${service.image}" alt="${service.name}" class="service-image" loading="lazy">
      <div class="service-content">
        <h3>${service.name}</h3>
        <p>${service.description}</p>
        <div class="service-price">Rp ${service.price.toLocaleString('id-ID')}</div>
        <div class="service-duration">⏱️ Estimasi ${service.duration}</div>
        <button class="order-btn" onclick="scrollToOrder('${service._id}')">Pesan Layanan Ini</button>
      </div>
    </div>
  `).join('');
}

function populateServiceSelect(services) {
  const select = document.getElementById('service');
  select.innerHTML = '<option value="">-- Pilih salah satu layanan --</option>';
  services.forEach(service => {
    const option = document.createElement('option');
    option.value = service._id;
    option.textContent = `${service.name} - Rp ${service.price.toLocaleString('id-ID')}`;
    select.appendChild(option);
  });
}

function scrollToOrder(serviceId = null) {
  document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
  if (serviceId) {
    setTimeout(() => {
      document.getElementById('service').value = serviceId;
    }, 500);
  }
}

// Form Submission dengan WhatsApp Integration
document.getElementById('orderForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitBtn = e.target.querySelector('.submit-btn');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Mengirim...';
  submitBtn.disabled = true;
  
  const formData = {
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    serviceId: document.getElementById('service').value,
    address: document.getElementById('address').value,
    notes: document.getElementById('notes').value
  };
  
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      const order = result.data;
      
      // Buat pesan WhatsApp
      const waMessage = `Halo, saya ${formData.name}. Saya baru saja membuat pesanan:\n\n` +
        `📋 Order ID: #${order._id.substring(0, 8).toUpperCase()}\n` +
        `🧵 Layanan: ${order.service.name}\n` +
        `💰 Harga: Rp ${order.service.price.toLocaleString('id-ID')}\n` +
        `⏱️ Estimasi: ${order.service.duration}\n` +
        `📝 Catatan: ${formData.notes || '-'}\n` +
        `📞 Telepon: ${formData.phone}\n\n` +
        `Mohon konfirmasi pesanan saya. Terima kasih!`;
      
      // Nomor WhatsApp Taylor-Ku (GANTI DENGAN NOMOR ANDA)
      const whatsappNumber = '6282369854688'; // Format: 628xxx (tanpa +)
      const waURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMessage)}`;
      
      // Tampilkan modal dengan tombol WhatsApp
      showModalWithWhatsApp(formData.name, order._id, waURL);
      
      document.getElementById('orderForm').reset();
    } else {
      if (result.errors && Array.isArray(result.errors)) {
        const errorMessages = result.errors.map(err => `- ${err.message}`).join('\n');
        showModal(`❌ Terjadi kesalahan:\n\n${errorMessages}`, true);
      } else {
        showModal(`❌ ${result.message}`, true);
      }
    }
  } catch (error) {
    console.error('Error submitting order:', error);
    showModal('❌ Terjadi kesalahan koneksi. Silakan coba lagi.', true);
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// Modal Functions
function showModal(message, isError = false) {
  const modal = document.getElementById('successModal');
  const modalMessage = document.getElementById('modalMessage');
  const modalTitle = modal.querySelector('h2');
  
  modalMessage.innerHTML = message;
  
  if (isError) {
    modalTitle.textContent = '⚠️ Perhatian';
    modalTitle.style.color = '#e74c3c';
  } else {
    modalTitle.textContent = '✅ Pesanan Berhasil Terkirim!';
    modalTitle.style.color = '#667eea';
  }
  
  modal.style.display = 'block';
}

// BARU: Modal dengan WhatsApp button
function showModalWithWhatsApp(customerName, orderId, waURL) {
  const modal = document.getElementById('successModal');
  const modalMessage = document.getElementById('modalMessage');
  const modalTitle = modal.querySelector('h2');
  
  modalTitle.textContent = '✅ Pesanan Berhasil Terkirim!';
  modalTitle.style.color = '#667eea';
  
  modalMessage.innerHTML = `
    <p style="margin-bottom: 1rem;">
      Terima kasih, <strong>${customerName}</strong>! Pesanan Anda telah kami terima.
    </p>
    <div style="background: #f0f0f0; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
      <strong>Order ID:</strong> #${orderId.substring(0, 8).toUpperCase()}
    </div>
    <p style="margin-bottom: 1.5rem;">
      Klik tombol di bawah untuk konfirmasi pesanan via WhatsApp:
    </p>
    <a href="${waURL}" target="_blank" 
       style="display: inline-block; background: #25D366; color: white; padding: 1rem 2rem; 
              border-radius: 8px; text-decoration: none; font-weight: 600; margin-bottom: 1rem;">
      <i class="bi bi-whatsapp"></i> Konfirmasi via WhatsApp
    </a>
    <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
      📍 Lacak status pesanan Anda di: 
      <a href="/tracking.html" style="color: #667eea; font-weight: 600;">Taylor-Ku Tracking</a>
    </p>
    <p style="margin-top: 0.5rem; font-size: 0.85rem; color: #999;">
      ${document.getElementById('email').value ? 'Kami juga telah mengirim konfirmasi ke email Anda.' : ''}
    </p>
  `;
  
  modal.style.display = 'block';
}

function closeModal() {
  document.getElementById('successModal').style.display = 'none';
}

window.onclick = function(event) {
  const modal = document.getElementById('successModal');
  if (event.target === modal) {
    closeModal();
  }
}

// Phone number formatting
document.getElementById('phone').addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, '');
  
  if (value.startsWith('8')) {
    value = '0' + value;
  }
  
  e.target.value = value;
});

// Initialize
document.addEventListener('DOMContentLoaded', loadServices);

async function loadPage(page) {
  const container = document.getElementById('content');
  container.innerHTML = '<p style="text-align:center;">⏳ Memuat halaman...</p>';

  try {
    const response = await fetch(page);
    const html = await response.text();
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = '<p style="color:red;text-align:center;">Gagal memuat halaman.</p>';
    console.error(err);
  }
}