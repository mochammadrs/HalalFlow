const express = require('express');
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');

// Impor "Penjaga Pintu" (Middleware) kita
const authMiddleware = require('../middleware/authMiddleware');

// Lindungi semua rute di file ini
router.use(authMiddleware);

// Definisikan rute
// GET /api/v1/transactions
router.get('/', getTransactions);

// POST /api/v1/transactions
router.post('/', createTransaction);

// PUT /api/v1/transactions/:id
router.put('/:id', updateTransaction);

// DELETE /api/v1/transactions/:id
router.delete('/:id', deleteTransaction);

module.exports = router;