import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api/v1' : 'http://localhost:5001/api/v1');

const getTransactions = () => {
  return axios.get(`${API_URL}/transactions`);
};

const getTransactionById = (id) => {
  return axios.get(`${API_URL}/transactions/${id}`);
};

const createTransaction = (date, amount, type, category_id, description = '') => {
  return axios.post(`${API_URL}/transactions`, {
    date,
    amount,
    type,
    category_id,
    description,
  });
};

const updateTransaction = (id, date, amount, type, category_id, description = '') => {
  return axios.put(`${API_URL}/transactions/${id}`, {
    date,
    amount,
    type,
    category_id,
    description,
  });
};

const deleteTransaction = (id) => {
  return axios.delete(`${API_URL}/transactions/${id}`);
};

const transactionService = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};

export default transactionService;
