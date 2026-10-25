import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getTransactions, getTransactionSummary } from '../services/api';

function Dashboard({ onLogout }) {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netProfit: 0 });
  const [loading, setLoading] = useState(true);

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
        localStorage.removeItem('token');
        if (onLogout) onLogout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const recent = transactions.slice(0, 5);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>Dashboard</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
            <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '5px', flex: 1, minWidth: '180px' }}>
              <h4>Net Profit / Balance</h4>
              <h3>${summary.netProfit || 0}</h3>
            </div>
            <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '5px', flex: 1, minWidth: '180px' }}>
              <h4>Total Income</h4>
              <h3 style={{ color: 'green' }}>${summary.totalIncome || 0}</h3>
            </div>
            <div style={{ background: '#ffebee', padding: '15px', borderRadius: '5px', flex: 1, minWidth: '180px' }}>
              <h4>Total Expense</h4>
              <h3 style={{ color: 'red' }}>${summary.totalExpense || 0}</h3>
            </div>
          </div>

          {/* Recent Transactions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Recent Transactions</h3>
            <Link to="/transactions" style={{ color: '#007bff', fontWeight: 'bold', textDecoration: 'none' }}>
              View all / Add new
            </Link>
          </div>

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {recent.length === 0 ? (
              <p>No transactions yet. Go to the Transactions page to add your first one!</p>
            ) : (
              recent.map((t) => (
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
        </>
      )}
    </div>
  );
}

export default Dashboard;