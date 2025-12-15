import axios from 'axios';

// URL dasar API kita (dari .env atau default)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1';

// Fungsi untuk MENGAMBIL semua kategori
const getCategories = () => {
  // Axios sudah otomatis pasang header token dari AuthContext
  return axios.get(`${API_URL}/categories`);
};

// Fungsi untuk MEMBUAT kategori baru
const createCategory = (name, type) => {
  return axios.post(`${API_URL}/categories`, {
    name,
    type,
  });
};

// Fungsi untuk MENGHAPUS kategori
const deleteCategory = (id) => {
  return axios.delete(`${API_URL}/categories/${id}`);
};

// Fungsi untuk UPDATE kategori
const updateCategory = (id, name, type) => {
  return axios.put(`${API_URL}/categories/${id}`, {
    name,
    type,
  });
};

const categoryService = {
  getCategories,
  createCategory,
  deleteCategory,
  updateCategory,
};

export default categoryService;
