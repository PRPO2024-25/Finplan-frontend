import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PortfolioDetail from './pages/PortfolioDetail';
import PortfolioTransactions from './pages/PortfolioTransactions';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/portfolio/:id" element={
          <ProtectedRoute>
            <PortfolioDetail />
          </ProtectedRoute>
        } />
        <Route path="/portfolio/:id/transactions" element={
          <ProtectedRoute>
            <PortfolioTransactions />
          </ProtectedRoute>
        } />

        {/* Redirect unknown routes to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 