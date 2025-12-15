const express = require('express');
const router = express.Router();
const {
  getBudgetSettings,
  updateBudgetSettings,
  calculateBudget,
} = require('../controllers/budgetController');

// Impor "Penjaga Pintu" (Middleware) kita
const authMiddleware = require('../middleware/authMiddleware');

// Lindungi semua rute di file ini
router.use(authMiddleware);

// Definisikan rute
// GET /api/v1/budget/settings
router.get('/settings', getBudgetSettings);

// PUT /api/v1/budget/settings
router.put('/settings', updateBudgetSettings);

// POST /api/v1/budget/calculate
router.post('/calculate', calculateBudget);

module.exports = router;