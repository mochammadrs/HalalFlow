const db = require('../db');

// @desc    Ambil rangkuman (summary) keuangan
// @route   GET /api/v1/dashboard/summary
// @access  Private
exports.getSummary = async (req, res, next) => {
  try {
    // Kita ambil rangkuman untuk bulan dan tahun saat ini
    const now = new Date();
    const month = now.getMonth() + 1; // getMonth() 0-11, jadi +1
    const year = now.getFullYear();

    // 1. Kueri untuk Total Pemasukan (INCOME)
    const incomeResult = await db.query(
      `SELECT SUM(amount) AS total_income 
       FROM transactions 
       WHERE user_id = $1 AND type = 'INCOME' 
       AND EXTRACT(MONTH FROM date) = $2 
       AND EXTRACT(YEAR FROM date) = $3`,
      [req.user.id, month, year]
    );

    // 2. Kueri untuk Total Pengeluaran (EXPENSE)
    const expenseResult = await db.query(
      `SELECT SUM(amount) AS total_expense 
       FROM transactions 
       WHERE user_id = $1 AND type = 'EXPENSE' 
       AND EXTRACT(MONTH FROM date) = $2 
       AND EXTRACT(YEAR FROM date) = $3`,
      [req.user.id, month, year]
    );

    // 3. Siapkan data (pastikan bukan null jika tidak ada transaksi)
    const total_income = parseFloat(incomeResult.rows[0].total_income) || 0;
    const total_expense = parseFloat(expenseResult.rows[0].total_expense) || 0;
    const balance = total_income - total_expense;

    res.status(200).json({
      total_income,
      total_expense,
      balance,
      month,
      year,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// @desc    Ambil data pengeluaran per kategori (untuk pie chart)
// @route   GET /api/v1/dashboard/expense-by-category
// @access  Private
exports.getExpenseByCategory = async (req, res, next) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Kueri SQL canggih:
    // 1. GABUNGKAN (JOIN) tabel transactions dan categories
    // 2. KELOMPOKKAN (GROUP BY) berdasarkan nama kategori
    // 3. JUMLAHKAN (SUM) total 'amount' untuk setiap grup
    // 4. FILTER hanya untuk user ini, tipe EXPENSE, dan bulan/tahun ini
    
    const { rows } = await db.query(
      `SELECT c.name, SUM(t.amount) AS total
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 
       AND t.type = 'EXPENSE' 
       AND EXTRACT(MONTH FROM t.date) = $2 
       AND EXTRACT(YEAR FROM t.date) = $3
       GROUP BY c.name`,
      [req.user.id, month, year]
    );

    // Format data agar ramah untuk Chart.js
    const labels = rows.map(row => row.name);
    const data = rows.map(row => parseFloat(row.total));

    res.status(200).json({
      labels,
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// @desc    Ambil tren cashflow bulanan (6 bulan terakhir)
// @route   GET /api/v1/dashboard/monthly-trend
// @access  Private
exports.getMonthlyTrend = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT 
         TO_CHAR(date, 'Mon YYYY') AS month_label,
         DATE_TRUNC('month', date) AS month_date,
         SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) AS income,
         SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) AS expense
       FROM transactions
       WHERE user_id = $1
       GROUP BY month_date, month_label
       ORDER BY month_date ASC
       LIMIT 6`,
      [req.user.id]
    );

    const labels = rows.map(r => r.month_label);
    const incomeData = rows.map(r => parseFloat(r.income));
    const expenseData = rows.map(r => parseFloat(r.expense));

    res.status(200).json({
      labels,
      income: incomeData,
      expense: expenseData,
    });
  } catch (err) {
    console.error('Error monthly trend:', err);
    res.status(500).send('Server error');
  }
};