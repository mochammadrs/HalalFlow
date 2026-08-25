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
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Kata sandi baru minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok');
      return;
    }

    if (!token) {
      setError('Token pemulihan tidak valid atau kadaluarsa');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat mereset kata sandi.');
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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div className="brand-logo-container">
            <div className="brand-logo-icon">
              <Icon icon="mdi:mosque" size={24} color="#FFFFFF" />
            </div>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>
              HalalFlow
            </span>
          </div>
        </div>

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
            <Icon icon={success ? 'mdi:check-decagram' : 'mdi:key-change'} size={32} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '8px' }}>
            {success ? 'Kata Sandi Diperbarui!' : 'Atur Ulang Kata Sandi'}
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', maxWidth: '340px' }}>
            {success
              ? 'Kata sandi Anda telah berhasil diubah. Mengalihkan ke halaman login...'
              : 'Silakan masukkan kata sandi baru untuk akun Anda.'}
          </p>
        </div>

        {error && (
          <div className="form-error-alert">
            <Icon icon="mdi:alert-circle-outline" size={18} />
            <span>{error}</span>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">KATA SANDI BARU</label>
              <input
                type="password"
                className="form-input"
                placeholder="Minimal 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">KONFIRMASI KATA SANDI</label>
              <input
                type="password"
                className="form-input"
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <span>Menyimpan Kata Sandi...</span>
                </>
              ) : (
                <span>Perbarui Kata Sandi</span>
              )}
            </button>
          </form>
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

export default ResetPasswordPage;
