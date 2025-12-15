const express = require('express');
const router = express.Router();
const {
  getSummary,
  getExpenseByCategory,
} = require('../controllers/dashboardController');

// Impor "Penjaga Pintu" (Middleware) kita
const authMiddleware = require('../middleware/authMiddleware');

// Lindungi semua rute di file ini
router.use(authMiddleware);

// Definisikan rute
// GET /api/v1/dashboard/summary
router.get('/summary', getSummary);

// GET /api/v1/dashboard/expense-by-category
router.get('/expense-by-category', getExpenseByCategory);

module.exports = router;