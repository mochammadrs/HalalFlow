import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import Icon from '../components/Icon';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      setLoading(false);
      setSuccess(true);
      
      // Dalam development, backend mengirim token
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
      }
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
            <Icon icon="mdi:lock-reset" size={48} color="var(--color-primary)" />
          </div>
          <h1 className="auth-title">Lupa Password?</h1>
          <p className="auth-subtitle">
            Masukkan email Anda dan kami akan mengirim link untuk reset password
          </p>
        </div>

        {/* Form Section */}
        {!success ? (
          <form onSubmit={handleSubmit} noValidate className="auth-form">
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
                  Mengirim...
                </>
              ) : (
                <>
                  <Icon icon="mdi:send" size={18} style={{ marginRight: '0.5rem' }} />
                  Kirim Link Reset
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="success-message">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <Icon icon="mdi:check-circle" size={64} color="var(--color-success)" />
            </div>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Link Terkirim!</h3>
            <p style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              {resetToken ? (
                <>
                  <strong>Development Mode:</strong> Token reset Anda adalah:
                  <br />
                  <code style={{ 
                    display: 'block', 
                    padding: '1rem', 
                    background: 'var(--color-background)', 
                    borderRadius: '8px',
                    marginTop: '1rem',
                    wordBreak: 'break-all'
                  }}>
                    {resetToken}
                  </code>
                  <br />
                  <Link to={`/reset-password?token=${resetToken}`} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Reset Password Sekarang
                  </Link>
                </>
              ) : (
                'Jika email terdaftar, kami telah mengirim link reset password ke email Anda.'
              )}
            </p>
          </div>
        )}

        {/* Footer Links */}
        <div className="auth-footer">
          <p>
            Ingat password Anda?{' '}
            <Link to="/login" className="link">
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
