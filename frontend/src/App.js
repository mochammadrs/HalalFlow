import React, { useContext } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CategoriesPage from './pages/CategoriesPage';
import TransactionsPage from './pages/TransactionsPage';
import SettingsPage from './pages/SettingsPage'; 
import BudgetPlannerPage from './pages/BudgetPlannerPage'; 
import DashboardPage from './pages/DashboardPage';
import AuthContext from './context/AuthContext';
import Icon from './components/Icon';
import './App.css';

// Navbar Component dengan HTML murni
const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <Icon icon="mdi:leaf" size={24} color="var(--color-primary)" style={{ marginRight: '0.5rem' }} />
          HalalFlow
        </Link>
      </div>
      
      <div className="navbar-menu">
        {user ? (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/transactions">Transaksi</Link>
            <Link to="/categories">Kategori</Link>
            <Link to="/planner">Perencana</Link>
            <Link to="/settings">Pengaturan</Link>
            <button onClick={logout} className="btn-logout">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

function App() {
  const { user, loading } = useContext(AuthContext);

  console.log('[App] rendering - user:', user, 'loading:', loading);

  // Tampilkan loading indicator
  if (loading) {
    console.log('[App] showing loading state');
    return (
      <div className="loading-container">
        <h1>Memuat...</h1>
      </div>
    );
  }

  // Jika tidak ada user, langsung tampil login page
  if (!user) {
    console.log('[App] showing login page (user not logged in)');
    return (
      <>
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </>
    );
  }

  // Jika ada user, tampil full app dengan navbar
  console.log('[App] showing app with navbar');
  return (
    <>
      <Navbar /> 
      <div className="app-container">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/planner" element={<BudgetPlannerPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
