import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Navbar from './components/Navbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const handleLogout = () => setIsAuthenticated(false);

  // লগইন করা ইউজারের পেজগুলোর জন্য: উপরে Navbar + নিচে পেজ
  const withNavbar = (page) =>
    isAuthenticated ? (
      <>
        <Navbar onLogout={handleLogout} />
        {page}
      </>
    ) : (
      <Navigate to="/login" />
    );

  return (
    <Router>
      <div>
        <Routes>
          {/* Login Route */}
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px' }}>
                  <Login onLogin={() => setIsAuthenticated(true)} />
                </div>
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />

          {/* Register Route */}
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={withNavbar(<Dashboard onLogout={handleLogout} />)} />
          <Route path="/transactions" element={withNavbar(<Transactions onLogout={handleLogout} />)} />

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;