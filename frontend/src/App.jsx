import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
          <Route 
            path="/register" 
            element={<Register />} 
          />

          {/* Dashboard Route (Protected) */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
            } 
          />

          {/* Default Redirect */}
          <Route 
            path="*" 
            element={<Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;