import React, { useState } from 'react';
import { loginUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(formData);
      setMessage('Login successful! Welcome back.');
      
      // ব্যাকএন্ড থেকে আসা টোকেনটি লোকালস্টোরেজে সেভ করা
      localStorage.setItem('token', response.data.token || response.data);

      if (onLogin) {
        onLogin();
      }
      navigate('/dashboard');
      
    } catch (error) {
      setMessage(error.response?.data?.message || 'Invalid email or password!');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Freelancer Login</h2>
      {message && <p style={{ color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label><br />
          <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label><br />
          <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#28A745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Login</button>
      </form>

      {/* নতুন অ্যাকাউন্ট খোলার লিংক */}
      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Don't have an account? <a href="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Register here</a>
      </p>
    </div>
  );
}