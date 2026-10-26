import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getTransactions, getTransactionSummary } from '../services/api';
import { formatMoney, formatDate } from '../utils/format';

const DEFAULT_RATES = { USD: '120', EUR: '', GBP: '' };

const loadRates = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('rates'));
    return { ...DEFAULT_RATES, ...(saved || {}) };
  } catch (e) {
    return DEFAULT_RATES;
  }
};

function Dashboard({ onLogout }) {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totals: {}, clientEarnings: [] });
  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState(loadRates());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [txResponse, summaryResponse] = await Promise.all([
        getTransactions(),
        getTransactionSummary(),
      ]);
      setTransactions(txResponse.data);
      setSummary({
        totals: summaryResponse.data.totals || {},
        clientEarnings: summaryResponse.data.clientEarnings || [],
      });
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

  const handleRateChange = (cur) => (e) => {
    const next = { ...rates, [cur]: e.target.value };
    setRates(next);
    try {
      localStorage.setItem('rates', JSON.stringify(next));
    } catch (err) {
      // ignore storage errors
    }
  };

  const currencies = Object.keys(summary.totals);
  const foreign = currencies.filter((c) => c !== 'BDT');
  const missing = foreign.filter((c) => !(parseFloat(rates[c]) > 0));
  const recent = transactions.slice(0, 5);
  const topClients = summary.clientEarnings.slice(0, 5);

  const toBdt = (amount, cur) =>
    cur === 'BDT' ? amount : amount * (parseFloat(rates[cur]) || 0);

  const grand = currencies.reduce(
    (acc, cur) => {
      if (cur !== 'BDT' && missing.includes(cur)) return acc;
      const t = summary.totals[cur];
      acc.income += toBdt(t.income, cur);
      acc.expense += toBdt(t.expense, cur);
      return acc;
    },
    { income: 0, expense: 0 }
  );
  grand.net = grand.income - grand.expense;

  if (loading) {
    return <div className="loading">Loading your dashboard...</div>;
  }

  return (
    <div className="page">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Your freelance income at a glance.</p>

      {/* Combined total in BDT (only when there is a foreign currency) */}
      {foreign.length > 0 && (
        <div className="currency-block">
          <div className="section-head">
            <h3 className="section-title">Total in BDT</h3>
            <span className="currency-tag">BDT</span>
          </div>
          <div className="stat-grid">
            <div className="stat primary">
              <div className="stat-label">Balance</div>
              <div className="stat-value">{formatMoney(grand.net, 'BDT')}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Total Income</div>
              <div className="stat-value green">{formatMoney(grand.income, 'BDT')}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Total Expense</div>
              <div className="stat-value red">{formatMoney(grand.expense, 'BDT')}</div>
            </div>
          </div>
          {missing.length > 0 && (
            <div className="note">
              Set a rate for {missing.join(', ')} below to include it in this total.
            </div>
          )}
        </div>
      )}

      {/* Exchange rate box */}
      {foreign.length > 0 && (
        <div className="card">
          <div className="section-head">
            <h3 className="section-title">Exchange Rates</h3>
          </div>
          <p className="page-sub" style={{ marginBottom: 14 }}>
            Enter the rate you actually get when you cash out. It is saved on this device.
          </p>
          <div className="rate-grid">
            {foreign.map((cur) => (
              <div className="rate-row" key={cur}>
                <span className="rate-label">1 {cur} =</span>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Rate"
                  value={rates[cur] || ''}
                  onChange={handleRateChange(cur)}
                />
                <span className="rate-label">BDT</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Totals for each currency, kept separate */}
      {currencies.length === 0 ? (
        <div className="card">
          <div className="empty">
            No data yet. <Link to="/transactions" className="link">Add your first transaction</Link>
          </div>
        </div>
      ) : (
        currencies.map((cur) => {
          const t = summary.totals[cur];
          return (
            <div className="currency-block" key={cur}>
              <div className="section-head">
                <h3 className="section-title">Overview</h3>
                <span className="currency-tag">{cur}</span>
              </div>
              <div className="stat-grid">
                <div className="stat primary">
                  <div className="stat-label">Balance</div>
                  <div className="stat-value">{formatMoney(t.net, cur)}</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Total Income</div>
                  <div className="stat-value green">{formatMoney(t.income, cur)}</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Total Expense</div>
                  <div className="stat-value red">{formatMoney(t.expense, cur)}</div>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Top Clients */}
      {topClients.length > 0 && (
        <div className="card">
          <div className="section-head">
            <h3 className="section-title">Top Clients</h3>
          </div>
          <ul className="tx-list">
            {topClients.map((c) => (
              <li className="tx-item" key={`${c.client}-${c.currency}`}>
                <div className="avatar">{c.client.charAt(0).toUpperCase()}</div>
                <div className="tx-main">
                  <div className="tx-title">{c.client}</div>
                  <div className="tx-meta">{c.currency}</div>
                </div>
                <div className="tx-amount income">{formatMoney(c.total, c.currency)}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="card">
        <div className="section-head">
          <h3 className="section-title">Recent Transactions</h3>
          <Link to="/transactions" className="link">View all</Link>
        </div>

        {recent.length === 0 ? (
          <div className="empty">No transactions yet.</div>
        ) : (
          <ul className="tx-list">
            {recent.map((t) => (
              <li className="tx-item" key={t._id}>
                <div className={`tx-icon ${t.type}`}>{t.type === 'income' ? '↑' : '↓'}</div>
                <div className="tx-main">
                  <div className="tx-title">{t.title}</div>
                  <div className="tx-meta">
                    {formatDate(t.date)}
                    {t.client ? ` · ${t.client}` : ''}
                  </div>
                </div>
                <div className={`tx-amount ${t.type}`}>
                  {t.type === 'income' ? '+' : '-'}
                  {formatMoney(t.amount, t.currency)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard;