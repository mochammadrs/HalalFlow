// 1. Impor library yang kita butuhkan
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config(); // Memuat variabel dari file .env

// Impor file rute
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// 2. Buat aplikasi Express
const app = express();

// 3. Tentukan PORT
//    Kita ambil dari file .env, atau default ke 5000 jika tidak ada
const PORT = process.env.PORT || 5000;

// 4. Gunakan Middleware
app.use(cors()); // Izinkan request dari frontend
app.use(morgan('dev')); // Logger untuk request di terminal
app.use(express.json()); // Izinkan server membaca JSON

// Log untuk debugging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toLocaleTimeString()}`);
  next();
});

// 5. Rute "Hello World" (Rute Tes)
//    Ini adalah rute dasar kita
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Selamat datang di HalalFlow API v1',
  });
});

// Gunakan rute untuk autentikasi
// Server akan merespon request yg dimulai dg /api/v1/auth
// ke file authRoutes.js
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/budget', budgetRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/transactions', transactionRoutes);

// 6. Jalankan Server
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
