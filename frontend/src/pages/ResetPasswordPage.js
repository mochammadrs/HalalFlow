import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import authService from '../services/authService';
import Icon from '../components/Icon';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Ambil token dari URL query
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validasi
    if (newPassword.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    if (!token) {
      setError('Token tidak valid');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, newPassword);
      setLoading(false);
      setSuccess(true);
      
      // Redirect ke login setelah 2 detik
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Header Section */}
        <div className="auth-header">
          <div className="auth-logo">
            <Icon icon="mdi:key-variant" size={48} color="var(--color-primary)" />
          </div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Masukkan password baru Anda</p>
        </div>

        {/* Form Section */}
        {!success ? (
          <form onSubmit={handleSubmit} noValidate className="auth-form">
            <div className="form-group">
              <label htmlFor="newPassword">Password Baru</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Masukkan password baru"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Konfirmasi Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Ketik ulang password baru"
              />
              <p className="password-hint">Password minimal 6 karakter</p>
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
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Mereset...
                </>
              ) : (
                <>
                  <Icon icon="mdi:check" size={18} style={{ marginRight: '0.5rem' }} />
                  Reset Password
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="success-message">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <Icon icon="mdi:check-circle" size={64} color="var(--color-success)" />
            </div>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Password Berhasil Direset!</h3>
            <p style={{ textAlign: 'center' }}>
              Password Anda telah berhasil direset. Anda akan diarahkan ke halaman login...
            </p>
          </div>
        )}

        {/* Footer Links */}
        <div className="auth-footer">
          <p>
            <Link to="/login" className="link">
              Kembali ke Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
