import axios from 'axios';

// Ambil URL dasar API kita dari file .env
// (Kita harus buat file .env di frontend nanti)
const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api/v1' : 'http://localhost:5001/api/v1');

// Fungsi untuk Register
const register = (full_name, email, password) => {
  return axios.post(`${API_URL}/auth/register`, {
    full_name,
    email,
    password,
  });
};

// Fungsi untuk Login
const login = (email, password) => {
  return axios.post(`${API_URL}/auth/login`, {
    email,
    password,
  });
};

// Fungsi untuk Forgot Password
const forgotPassword = (email) => {
  return axios.post(`${API_URL}/auth/forgot-password`, { email });
};

// Fungsi untuk Reset Password
const resetPassword = (token, newPassword) => {
  return axios.post(`${API_URL}/auth/reset-password`, {
    token,
    newPassword,
  });
};

// Kita ekspor fungsi-fungsi ini
const authService = {
  register,
  login,
  forgotPassword,
  resetPassword,
};

export default authService;