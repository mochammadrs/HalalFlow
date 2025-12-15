const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

// Impor "Penjaga Pintu" (Middleware) kita
const authMiddleware = require('../middleware/authMiddleware');

// Terapkan middleware 'authMiddleware' ke SEMUA rute di file ini
// Ini berarti semua rute di bawah ini TERLINDUNGI
router.use(authMiddleware);

// Definisikan rute
// GET /api/v1/categories
router.get('/', getCategories);

// POST /api/v1/categories
router.post('/', createCategory);

// PUT /api/v1/categories/:id
router.put('/:id', updateCategory);

// DELETE /api/v1/categories/:id
router.delete('/:id', deleteCategory);

module.exports = router;