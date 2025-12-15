import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Icon from '../components/Icon';

const LoginPage = () => {
  const { login } = useContext(AuthContext); 
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      setLoading(false);
      navigate('/');
    } catch (err) {
      setLoading(false);
      const errorMsg = err.response?.data?.message || 'Login gagal, coba lagi.';
      setError(errorMsg);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Header Section */}
        <div className="auth-header">
          <div className="auth-logo">
            <Icon icon="mdi:leaf" size={48} color="var(--color-primary)" />
          </div>
          <h1 className="auth-title">Masuk ke HalalFlow</h1>
          <p className="auth-subtitle">Kelola keuangan dengan bijak</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Alamat Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="nama@example.com"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Masukkan password Anda"
            />
            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <Link to="/forgot-password" className="link" style={{ fontSize: '0.875rem' }}>
                Lupa password?
              </Link>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              <span className="alert-icon">
                <Icon icon="mdi:alert-circle" size={20} />
              </span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-login"
          >
            {loading ? (
              <>
                <span className="spinner-mini"></span>
                Sedang masuk...
              </>
            ) : (
              <>
                <Icon icon="mdi:login" size={18} style={{ marginRight: '0.5rem' }} />
                Masuk
              </>
            )}
          </button>
        </form>

        {/* Footer Section */}
        <div className="auth-footer">
          <p className="auth-footer-text">
            Belum punya akun?{' '}
            <Link to="/register" className="auth-link">
              Buat akun baru
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;