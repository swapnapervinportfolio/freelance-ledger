import axios from 'axios';

const API = axios.create({
  baseURL: window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://freelance-ledger.onrender.com/api',
});

// Request Interceptor: লোকালস্টোরেজ থেকে টোকেন নিয়ে হেডার-এ যুক্ত করার জন্য
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
export const getTransactionSummary = () => API.get('/transactions/summary');