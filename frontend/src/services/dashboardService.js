import axios from 'axios';

// URL dasar API kita (dari .env atau default)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1';

// Fungsi untuk MENGAMBIL data rangkuman (summary)
const getSummary = () => {
  // Axios sudah otomatis pasang header token dari AuthContext
  return axios.get(`${API_URL}/dashboard/summary`);
};

// Fungsi untuk MENGAMBIL data chart
const getExpenseByCategory = () => {
  return axios.get(`${API_URL}/dashboard/expense-by-category`);
};

const dashboardService = {
  getSummary,
  getExpenseByCategory,
};

export default dashboardService;