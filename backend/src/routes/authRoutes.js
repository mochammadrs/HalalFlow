const express = require('express');
const router = express.Router();

// 1. Impor { body, validationResult } dari express-validator
const { body, validationResult } = require('express-validator');

// 2. Impor controller kita
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController');

// 3. Tambahkan "middleware" validasi di antara rute dan controller
router.post(
  '/register',
  [
    // Cek 'email', pastikan itu email, dan normalisasi
    body('email', 'Email tidak valid').isEmail().normalizeEmail(),
    // Cek 'password', pastikan minimal 6 karakter
    body('password', 'Password minimal 6 karakter').isLength({ min: 6 }),
  ],
  register // <-- Controller tetap di akhir
);

// (Rute login bisa kita biarkan dulu, atau tambahkan validasi serupa)
router.post('/login', login);

// Forgot password route
router.post('/forgot-password', forgotPassword);

// Reset password route
router.post('/reset-password', resetPassword);

module.exports = router;