import axios from 'axios';

// URL dasar API kita (dari .env atau default)
const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api/v1' : 'http://localhost:5001/api/v1');

// Fungsi untuk MENGAMBIL data rangkuman (summary)
const getSummary = () => {
  // Axios sudah otomatis pasang header token dari AuthContext
  return axios.get(`${API_URL}/dashboard/summary`);
};

// Fungsi untuk MENGAMBIL data chart
const getExpenseByCategory = () => {
  return axios.get(`${API_URL}/dashboard/expense-by-category`);
};

// Fungsi untuk MENGAMBIL data tren cashflow bulanan
const getMonthlyTrend = () => {
  return axios.get(`${API_URL}/dashboard/monthly-trend`);
};

const dashboardService = {
  getSummary,
  getExpenseByCategory,
  getMonthlyTrend,
};

export default dashboardService;