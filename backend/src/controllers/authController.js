const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

// @desc    Register pengguna baru
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  console.log('🔵 Register request received:', { email: req.body.email, full_name: req.body.full_name });
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { full_name, email, password } = req.body;

  // Validasi full_name
  if (!full_name || full_name.trim().length === 0) {
    return res.status(400).json({ 
      errors: [{ msg: 'Nama lengkap harus diisi' }] 
    });
  }

  try {
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ 
        errors: [{ msg: 'Email sudah terdaftar' }] 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.query(
      'INSERT INTO users (full_name, email, password_hash, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [full_name, email, hashedPassword]
    );

    const payload = {
      user: {
        id: newUser.rows[0].id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        console.log('✅ User registered successfully:', email);
        res.status(201).json({
          message: 'Registrasi berhasil!',
          token: token,
          user: {
            id: newUser.rows[0].id,
            full_name: newUser.rows[0].full_name,
            email: newUser.rows[0].email,
          },
        });
      }
    );

  } catch (err) {
    console.error('❌ Register error:', err);
    res.status(500).json({ 
      errors: [{ msg: 'Server error, silakan coba lagi' }] 
    });
  }
};

// @desc    Login pengguna
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  console.log('🔵 Login request received:', { email: req.body.email });
  
  const errors = validationResult(req);
  const { email, password } = req.body;

  try {
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Email atau password salah' });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email atau password salah' });
    }

    const payload = {
      user: {
        id: user.rows[0].id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        console.log('✅ User logged in successfully:', email);
        res.status(200).json({
          message: 'Login berhasil!',
          token: token,
          user: {
            id: user.rows[0].id,
            full_name: user.rows[0].full_name,
            email: user.rows[0].email,
          },
        });
      }
    );

  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).send('Server error');
  }
};

// @desc    Request password reset (forgot password)
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email harus diisi' });
  }

  try {
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (user.rows.length === 0) {
      return res.status(200).json({ 
        message: 'Jika email terdaftar, link reset password telah dikirim' 
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 jam

    await db.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [resetToken, resetTokenExpiry, user.rows[0].id]
    );

    console.log('🔑 Reset token generated for:', email, '- Token:', resetToken);

    res.status(200).json({ 
      message: 'Jika email terdaftar, link reset password telah dikirim',
      resetToken: resetToken // Hapus di production
    });

  } catch (err) {
    console.error('❌ Forgot password error:', err);
    res.status(500).send('Server error');
  }
};

// @desc    Reset password with token
// @route   POST /api/v1/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token dan password baru harus diisi' });
  }

  try {
    const user = await db.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
      [token]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Token tidak valid atau sudah expired' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [hashedPassword, user.rows[0].id]
    );

    console.log('✅ Password reset successful for:', user.rows[0].email);

    res.status(200).json({ message: 'Password berhasil direset' });

  } catch (err) {
    console.error('❌ Reset password error:', err);
    res.status(500).send('Server error');
  }
};
