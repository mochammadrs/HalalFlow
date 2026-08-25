const db = require('../db'); // Impor database kita

// @desc    Ambil semua kategori milik user
// @route   GET /api/v1/categories
// @access  Private
exports.getCategories = async (req, res, next) => {
  try {
    // req.user.id didapat dari token (via authMiddleware)
    const { rows } = await db.query('SELECT * FROM categories WHERE user_id = $1', [
      req.user.id,
    ]);

    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// @desc    Buat kategori baru
// @route   POST /api/v1/categories
// @access  Private
exports.createCategory = async (req, res, next) => {
  const { name, type } = req.body; // type adalah 'INCOME' atau 'EXPENSE'
  
  if (!name || !type) {
    return res.status(400).json({ message: 'Nama dan Tipe kategori dibutuhkan' });
  }

  const normalizedType = String(type).toUpperCase();
  if (normalizedType !== 'INCOME' && normalizedType !== 'EXPENSE') {
    return res.status(400).json({ message: 'Tipe kategori harus INCOME atau EXPENSE' });
  }

  try {
    const { rows } = await db.query(
      'INSERT INTO categories (user_id, name, type) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, name.trim(), normalizedType]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ message: 'Gagal membuat kategori di database' });
  }
};

// @desc    Update kategori
// @route   PUT /api/v1/categories/:id
// @access  Private
exports.updateCategory = async (req, res, next) => {
  const { id } = req.params;
  const { name, type } = req.body;

  if (!name || !type) {
    return res.status(400).json({ message: 'Nama dan Tipe kategori dibutuhkan' });
  }

  const normalizedType = String(type).toUpperCase();
  if (normalizedType !== 'INCOME' && normalizedType !== 'EXPENSE') {
    return res.status(400).json({ message: 'Tipe kategori harus INCOME atau EXPENSE' });
  }

  try {
    // Pastikan kategori milik user yang login
    const { rows } = await db.query(
      'UPDATE categories SET name = $1, type = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [name.trim(), normalizedType, id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan atau tidak memiliki akses' });
    }

    console.log('✅ Category updated successfully:', { id, name, normalizedType });
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error('❌ Update category error:', err);
    res.status(500).json({ message: 'Gagal memperbarui kategori di database' });
  }
};

// @desc    Hapus kategori
// @route   DELETE /api/v1/categories/:id
// @access  Private
exports.deleteCategory = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Pastikan kategori milik user yang login
    const { rows } = await db.query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan atau tidak memiliki akses' });
    }

    console.log('✅ Category deleted successfully:', id);
    res.status(200).json({ message: 'Kategori berhasil dihapus', deleted: rows[0] });
  } catch (err) {
    console.error('❌ Delete category error:', err);
    res.status(500).send('Server error');
  }
};
