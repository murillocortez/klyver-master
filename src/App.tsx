import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Checkout } from './pages/Billing/Checkout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { useAuthStore } from './store/authStore';
import { authMasterService } from './services/authMasterService';

/**
 * Wrapper for Login component to handle navigation and auth store updates
 */
const LoginPage = () => {
  const { setUser, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (email: string) => {
    try {
      const loggedUser = await authMasterService.login(email);
      setUser(loggedUser);
      navigate('/');
    } catch (error) {
      console.error("Login failed", error);
      alert("Erro ao fazer login");
    }
  };

  return <Login onLogin={handleLogin} />;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/billing/checkout" element={<Checkout />} />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route path="/*" element={<DashboardLayout />} />
    </Routes>
  );
}

export default App;