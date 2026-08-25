const db = require('../db'); // Impor database kita

// @desc    Ambil pengaturan anggaran user
// @route   GET /api/v1/budget/settings
// @access  Private
exports.getBudgetSettings = async (req, res, next) => {
  try {
    // Coba ambil pengaturan user
    let { rows } = await db.query(
      'SELECT * FROM budget_settings WHERE user_id = $1',
      [req.user.id]
    );

    // Jika user BELUM punya pengaturan (user baru), buatkan satu
    if (rows.length === 0) {
      const newSettings = await db.query(
        'INSERT INTO budget_settings (user_id) VALUES ($1) RETURNING *',
        [req.user.id]
      );
      rows = newSettings.rows;
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// @desc    Update pengaturan anggaran user
// @route   PUT /api/v1/budget/settings
// @access  Private
exports.updateBudgetSettings = async (req, res, next) => {
  // User hanya boleh update persentase tabungan
  const { percent_tabungan } = req.body;

  if (percent_tabungan === undefined) {
    return res.status(400).json({ message: 'Persentase tabungan dibutuhkan' });
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO budget_settings (user_id, percent_zakat, percent_tabungan, updated_at)
       VALUES ($1, 2.50, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id)
       DO UPDATE SET percent_tabungan = EXCLUDED.percent_tabungan, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.user.id, percent_tabungan]
    );

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error('Error updating budget settings:', err);
    res.status(500).send('Server error');
  }
};

// @desc    Kalkulasi alokasi anggaran
// @route   POST /api/v1/budget/calculate
// @access  Private
exports.calculateBudget = async (req, res, next) => {
  const { pemasukan, percent_tabungan } = req.body; // Ambil jumlah pemasukan dan opsi persentase

  if (!pemasukan || pemasukan <= 0) {
    return res.status(400).json({ message: 'Jumlah pemasukan tidak valid' });
  }

  try {
    // 1. Ambil dulu pengaturan user (zakat & tabungan)
    let { rows } = await db.query(
      'SELECT percent_zakat, percent_tabungan FROM budget_settings WHERE user_id = $1',
      [req.user.id]
    );

    if (rows.length === 0) {
      const newSettings = await db.query(
        'INSERT INTO budget_settings (user_id, percent_zakat, percent_tabungan) VALUES ($1, 2.50, 20.00) RETURNING *',
        [req.user.id]
      );
      rows = newSettings.rows;
    }

    const settings = rows[0];
    const pZakat = parseFloat(settings.percent_zakat) || 2.5;
    const pTabungan = percent_tabungan !== undefined 
      ? parseFloat(percent_tabungan) 
      : (parseFloat(settings.percent_tabungan) || 20);

    // 2. Lakukan perhitungan
    const alokasiZakat = (pZakat / 100) * pemasukan;
    const alokasiTabungan = (pTabungan / 100) * pemasukan;
    const sisa = pemasukan - alokasiZakat - alokasiTabungan;

    // 3. Kirim hasilnya
    res.status(200).json({
      total_pemasukan: pemasukan,
      alokasi: {
        zakat: alokasiZakat,
        tabungan: alokasiTabungan,
        kebutuhan_harian: sisa,
      },
      persentase: {
        zakat: pZakat,
        tabungan: pTabungan,
        kebutuhan_harian: 100 - pZakat - pTabungan,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};