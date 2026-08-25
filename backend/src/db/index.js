const { Pool } = require('pg');
require('dotenv').config();

// Buat koneksi pool: mendukung DATABASE_URL (1 baris) atau variabel terpisah
const isProduction = process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true';

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 5432,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

// Ekspor satu fungsi 'query' yang bisa kita pakai di mana saja
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};