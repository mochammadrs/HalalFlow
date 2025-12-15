import axios from 'axios';

// URL dasar API kita (dari .env atau default)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1';

// Fungsi untuk MENGAMBIL pengaturan
const getSettings = () => {
  // Axios sudah otomatis pasang header token dari AuthContext
  return axios.get(`${API_URL}/budget/settings`);
};

// Fungsi untuk UPDATE pengaturan
const updateSettings = (percent_tabungan) => {
  return axios.put(`${API_URL}/budget/settings`, {
    percent_tabungan,
  });
};

// Fungsi untuk MENGHITUNG anggaran
const calculateBudget = (pemasukan) => {
  return axios.post(`${API_URL}/budget/calculate`, {
    pemasukan,
  });
};

const budgetService = {
  getSettings,
  updateSettings,
  calculateBudget,
};

export default budgetService;