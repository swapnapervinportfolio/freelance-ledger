import axios from 'axios';

const API = axios.create({
  baseURL: 'https://freelance-ledger.onrender.com/api',
});

// Request Interceptor: attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth APIs
export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (userData) => API.post('/auth/login', userData);

// Transaction APIs
export const getTransactions = () => API.get('/transactions');
export const addTransaction = (transactionData) => API.post('/transactions', transactionData);
export const updateTransaction = (id, transactionData) => API.put(`/transactions/${id}`, transactionData);
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`);
export const getTransactionSummary = () => API.get('/transactions/summary');