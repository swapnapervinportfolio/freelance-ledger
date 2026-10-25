import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransactions, addTransaction } from '../services/api';

function Transactions({ onLogout }) {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [client, setClient] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const txResponse = await getTransactions();
      setTransactions(txResponse.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        if (onLogout) onLogout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    try {
      const newTx = {
        title,
        amount: parseFloat(amount),
        type,
        client: type === 'income' ? client : undefined,
        currency,
      };

      await addTransaction(newTx);
      setTitle('');
      setAmount('');
      setClient('');
      setCurrency('USD');
      setMessage('');

      fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add transaction');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>Transactions</h2>

      {message && <p style={{ color: 'red' }}>{message}</p>}

      {/* Add Transaction Form */}
      <form
        onSubmit={handleAddTransaction}
        style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}
      >
        <h4>Add New Transaction</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Transaction Title (e.g. Web Project)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ flex: 2, minWidth: '160px', padding: '8px' }}
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              style={{ flex: 1, minWidth: '100px', padding: '8px' }}
            />
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
        <button
          type="submit"
          style={{ background: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Add Transaction
        </button>
      </form>

      {/* Full Transactions List */}
      <h3>Transaction History</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {transactions.length === 0 ? (
            <p>No transactions found. Add your first transaction above!</p>
          ) : (
            transactions.map((t) => (
              <li
                key={t._id}
                style={{ display: 'flex', justifyContent: 'space-between', background: '#fff', border: '1px solid #ddd', padding: '10px', marginBottom: '8px', borderRadius: '4px' }}
              >
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
      )}
    </div>
  );
}

export default Transactions;