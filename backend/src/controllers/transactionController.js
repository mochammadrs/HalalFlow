const db = require('../db'); // Impor database kita

// @desc    Ambil semua transaksi milik user
// @route   GET /api/v1/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    // Ambil semua transaksi, diurutkan dari yang terbaru
    const { rows } = await db.query(
      `SELECT t.*, c.name AS category_name 
       FROM transactions t 
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 
       ORDER BY t.date DESC`,
      [req.user.id]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// @desc    Buat transaksi baru
// @route   POST /api/v1/transactions
// @access  Private
exports.createTransaction = async (req, res, next) => {
  const { amount, description, date, category_id, type } = req.body;

  if (!amount || !date || !category_id || !type) {
    return res.status(400).json({ message: 'Semua field (amount, date, category_id, type) dibutuhkan' });
  }

  const normalizedType = String(type).toUpperCase();
  if (normalizedType !== 'INCOME' && normalizedType !== 'EXPENSE') {
    return res.status(400).json({ message: 'Tipe transaksi harus INCOME atau EXPENSE' });
  }

  try {
    const { rows } = await db.query(
      'INSERT INTO transactions (user_id, amount, description, date, category_id, type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, amount, description, date, category_id, normalizedType]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create transaction error:', err);
    res.status(500).json({ message: 'Gagal membuat transaksi di database' });
  }
};

// @desc    Update transaksi
// @route   PUT /api/v1/transactions/:id
// @access  Private
exports.updateTransaction = async (req, res, next) => {
  const { id } = req.params; // ID transaksi dari URL
  const { amount, description, date, category_id, type } = req.body;

  const normalizedType = String(type).toUpperCase();
  if (normalizedType !== 'INCOME' && normalizedType !== 'EXPENSE') {
    return res.status(400).json({ message: 'Tipe transaksi harus INCOME atau EXPENSE' });
  }

  try {
    const { rows } = await db.query(
      `UPDATE transactions 
       SET amount = $1, description = $2, date = $3, category_id = $4, type = $5 
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [amount, description, date, category_id, normalizedType, id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan atau bukan milik Anda' });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// @desc    Hapus transaksi
// @route   DELETE /api/v1/transactions/:id
// @access  Private
exports.deleteTransaction = async (req, res, next) => {
  const { id } = req.params; // ID transaksi dari URL

  try {
    const result = await db.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    // rowCount akan memberi tahu kita jika ada baris yang terhapus
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan atau bukan milik Anda' });
    }

    res.status(200).json({ message: 'Transaksi berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};