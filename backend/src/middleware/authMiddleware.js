const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
  // 1. Ambil token dari header
  const authHeader = req.header('Authorization');

  // 2. Cek jika tidak ada token
  if (!authHeader) {
    return res.status(401).json({ message: 'Tidak ada token, otorisasi ditolak' });
  }

  try {
    // 3. Ekstrak token ("Bearer <token>" atau raw token)
    let token = authHeader;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }
    if (!token) {
      return res.status(401).json({ message: 'Format token salah' });
    }

    // 4. Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Tempel payload (berisi user.id) ke request
    req.user = decoded.user;
    next(); // Lanjutkan ke controller!
  } catch (err) {
    res.status(401).json({ message: 'Token tidak valid' });
  }
};