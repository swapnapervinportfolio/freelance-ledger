import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

function Navbar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
    navigate('/login');
  };

  const linkStyle = ({ isActive }) => ({
    padding: '8px 14px',
    borderRadius: '4px',
    textDecoration: 'none',
    fontWeight: 'bold',
    color: isActive ? '#fff' : '#1f2d3d',
    background: isActive ? '#007bff' : 'transparent',
  });

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '12px 20px',
        background: '#f5f5f5',
        borderBottom: '1px solid #ddd',
        fontFamily: 'Arial',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 'bold', fontSize: '18px', marginRight: '10px' }}>
          FreelanceLedger
        </span>
        <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
        <NavLink to="/transactions" style={linkStyle}>Transactions</NavLink>
      </div>

      <button
        onClick={handleLogout}
        style={{
          background: '#dc3545',
          color: 'white',
          border: 'none',
          padding: '8px 15px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        Logout
      </button>
    </nav>
  );
}

export default Navbar;