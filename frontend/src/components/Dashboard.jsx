import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransactions, addTransaction, getTransactionSummary } from '../services/api';

function Dashboard() {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netProfit: 0 });
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [client, setClient] = useState('');
  const [currency, setCurrency] = useState('USD'); // ১. কারেন্সি স্টেট যোগ করা হলো
  const [message, setMessage] = useState('');

  // ড্যাশবোর্ড লোড হওয়ার সাথে সাথে ডাটাফেচ করা
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const txResponse = await getTransactions();
      setTransactions(txResponse.data);

      const summaryResponse = await getTransactionSummary();
      setSummary(summaryResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  // লগআউট হ্যান্ডলার
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // নতুন ট্রানজেকশন সাবমিট করা
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    try {
      const newTx = {
        title,
        amount: parseFloat(amount),
        type,
        client: type === 'income' ? client : undefined,
        currency // ২. ট্রানজেকশন অবজেক্টে কারেন্সি যুক্ত করা হলো
      };

      await addTransaction(newTx);
      setTitle('');
      setAmount('');
      setClient('');
      setCurrency('USD');
      setMessage('');
      
      // ডেটা রিফ্রেশ করা
      fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add transaction');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial' }}>
      {/* Header with Logout Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>FreelanceLedger Dashboard</h2>
        <button 
          onClick={handleLogout}
          style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Logout
        </button>
      </div>

      {message && <p style={{ color: 'red' }}>{message}</p>}
      
      {/* Summary Cards */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '5px', flex: 1, margin: '0 5px' }}>
          <h4>Net Profit / Balance</h4>
          <h3>${summary.netProfit || 0}</h3>
        </div>
        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '5px', flex: 1, margin: '0 5px' }}>
          <h4>Total Income</h4>
          <h3 style={{ color: 'green' }}>${summary.totalIncome || 0}</h3>
        </div>
        <div style={{ background: '#ffebee', padding: '15px', borderRadius: '5px', flex: 1, margin: '0 5px' }}>
          <h4>Total Expense</h4>
          <h3 style={{ color: 'red' }}>${summary.totalExpense || 0}</h3>
        </div>
      </div>

      {/* Add Transaction Form */}
      <form onSubmit={handleAddTransaction} style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <h4>Add New Transaction</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Transaction Title (e.g. Web Project)" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required
              style={{ flex: 2, padding: '8px' }}
            />
            <input 
              type="number" 
              placeholder="Amount" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              required
              style={{ flex: 1, padding: '8px' }}
            />
            {/* ৩. কারেন্সি সিলেক্ট করার ড্রপডাউন */}
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ padding: '8px' }}>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="BDT">BDT (৳)</option>
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: '8px' }}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          {type === 'income' && (
            <input 
              type="text" 
              placeholder="Client Name (Required for Income)" 
              value={client} 
              onChange={(e) => setClient(e.target.value)} 
              required
              style={{ padding: '8px' }}
            />
          )}
        </div>
        <button type="submit" style={{ background: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>
          Add Transaction
        </button>
      </form>

      {/* Transactions List */}
      <h3>Transaction History</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {transactions.length === 0 ? (
          <p>No transactions found. Add your first transaction above!</p>
        ) : (
          transactions.map(t => (
            <li key={t._id} style={{ display: 'flex', justifyContent: 'space-between', background: '#fff', border: '1px solid #ddd', padding: '10px', marginBottom: '8px', borderRadius: '4px' }}>
              <div>
                <strong>{t.title}</strong>
                {t.client && <small style={{ display: 'block', color: '#666' }}>Client: {t.client}</small>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: t.type === 'income' ? 'green' : 'red', fontWeight: 'bold' }}>
                  {t.type === 'income' ? '+' : '-'}{t.amount} {t.currency || 'USD'}
                </span>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default Dashboard;