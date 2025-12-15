const { Pool } = require('pg');
require('dotenv').config();

// Buat koneksi pool baru menggunakan variabel dari .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Ekspor satu fungsi 'query' yang bisa kita pakai di mana saja
module.exports = {
  query: (text, params) => pool.query(text, params),
};