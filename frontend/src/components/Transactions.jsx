import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from '../services/api';
import { formatMoney, formatDate } from '../utils/format';

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  title: '',
  amount: '',
  type: 'income',
  client: '',
  currency: 'USD',
  date: today(),
});

function Transactions({ onLogout }) {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

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

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) return;

    const payload = {
      title: form.title,
      amount: parseFloat(form.amount),
      type: form.type,
      client: form.type === 'income' ? form.client : '',
      currency: form.currency,
      date: form.date,
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateTransaction(editingId, payload);
      } else {
        await addTransaction(payload);
      }
      resetForm();
      fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (t) => {
    setEditingId(t._id);
    setForm({
      title: t.title,
      amount: String(t.amount),
      type: t.type,
      client: t.client || '',
      currency: t.currency || 'USD',
      date: t.date ? t.date.slice(0, 10) : today(),
    });
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await deleteTransaction(id);
      if (editingId === id) resetForm();
      fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to delete transaction');
    }
  };

  const filtered = transactions.filter((t) => filter === 'all' || t.type === filter);

  return (
    <div className="page">
      <h1 className="page-title">Transactions</h1>
      <p className="page-sub">Add, edit and track every income and expense.</p>

      {/* Add / Edit Form */}
      <form className="card" onSubmit={handleSubmit}>
        <div className="section-head">
          <h3 className="section-title">{editingId ? 'Edit Transaction' : 'Add New Transaction'}</h3>
        </div>

        {message && <div className="alert">{message}</div>}

        <div className="form-grid">
          <input
            className="input span-2"
            type="text"
            placeholder="Title (e.g. Website Project)"
            value={form.title}
            onChange={handleChange('title')}
            required
          />
          <input
            className="input"
            type="number"
            step="0.01"
            min="0"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange('amount')}
            required
          />
          <select className="input" value={form.currency} onChange={handleChange('currency')}>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="BDT">BDT (৳)</option>
          </select>

          <select className="input" value={form.type} onChange={handleChange('type')}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          {form.type === 'income' && (
            <input
              className="input span-2"
              type="text"
              placeholder="Client name (required for income)"
              value={form.client}
              onChange={handleChange('client')}
              required
            />
          )}

          <input className="input" type="date" value={form.date} onChange={handleChange('date')} />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update Transaction' : 'Add Transaction'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* History */}
      <div className="card">
        <div className="section-head">
          <h3 className="section-title">Transaction History</h3>
          <div className="tabs">
            {['all', 'income', 'expense'].map((f) => (
              <button
                key={f}
                type="button"
                className={filter === f ? 'tab active' : 'tab'}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">No transactions found.</div>
        ) : (
          <ul className="tx-list">
            {filtered.map((t) => (
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

                <div className="tx-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleEdit(t)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger-soft btn-sm"
                    onClick={() => handleDelete(t._id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Transactions;