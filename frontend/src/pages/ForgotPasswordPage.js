import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import Icon from '../components/Icon';
import Logo from '../components/Logo';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Masukkan alamat email yang terdaftar');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Gagal mengirim email pemulihan. Pastikan email terdaftar.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: 'var(--color-bg)'
    }}>
      <div className="auth-card-box" style={{ maxWidth: '480px' }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <Logo size="lg" />
        </div>

        {/* Icon & Title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            color: 'var(--color-primary)'
          }}>
            <Icon icon={success ? 'mdi:email-check-outline' : 'mdi:lock-reset'} size={32} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '8px' }}>
            {success ? 'Tautan Terkirim!' : 'Lupa Kata Sandi?'}
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', maxWidth: '340px' }}>
            {success
              ? `Kami telah mengirimkan tautan pemulihan kata sandi ke ${email}. Silakan periksa kotak masuk atau folder spam Anda.`
              : 'Masukkan email yang terdaftar. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.'}
          </p>
        </div>

        {error && (
          <div className="form-error-alert">
            <Icon icon="mdi:alert-circle-outline" size={18} />
            <span>{error}</span>
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">ALAMAT EMAIL</label>
              <input
                type="email"
                className="form-input"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Icon icon="mdi:loading" size={18} className="animate-spin" />
                  <span>Mengirim Email...</span>
                </>
              ) : (
                <span>Kirim Tautan Pemulihan</span>
              )}
            </button>
          </form>
        ) : (
          <button
            type="button"
            className="btn-auth-submit"
            onClick={() => setSuccess(false)}
            style={{ backgroundColor: 'var(--color-surface-dim)', color: 'var(--color-text-main)' }}
          >
            Kirim Ulang Email
          </button>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.88rem' }}>
          <Link to="/login" style={{ color: 'var(--color-primary-container)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Icon icon="mdi:arrow-left" size={16} />
            <span>Kembali ke halaman Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
