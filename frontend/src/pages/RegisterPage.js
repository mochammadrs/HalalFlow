import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Icon from '../components/Icon';
import Logo from '../components/Logo';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { fullName, email, password, confirmPassword, agreeTerms } = formData;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Semua kolom formulir harus diisi');
      return;
    }

    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok');
      return;
    }

    if (!agreeTerms) {
      setError('Anda harus menyetujui Syarat & Ketentuan HalalFlow');
      return;
    }

    setLoading(true);
    try {
      await authService.register(fullName, email, password);
      setSuccess('Pendaftaran berhasil! Mengalihkan ke halaman login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Register error:', err);
      setError(
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Gagal mendaftar. Silakan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      {/* Left Side: Branding */}
      <div className="auth-hero-side">
        <div className="auth-hero-brand">
          <Logo size="lg" variant="light" />
        </div>

        <div className="auth-hero-content">
          <h1 className="auth-hero-headline">
            Mulai Perjalanan Keuangan yang Berkah & Terencana Hari Ini.
          </h1>
          
          <div className="auth-feature-pills">
            <div className="auth-feature-item">
              <Icon icon="mdi:check-decagram" size={22} color="var(--color-accent)" />
              <span>100% Bebas Riba & Prinsip Syariah Terjaga</span>
            </div>
            <div className="auth-feature-item">
              <Icon icon="mdi:chart-arc" size={22} color="var(--color-accent)" />
              <span>Monitoring Budgeting Real-time & Akurat</span>
            </div>
            <div className="auth-feature-item">
              <Icon icon="mdi:calculator-variant" size={22} color="var(--color-accent)" />
              <span>Kalkulator Zakat Maal Otomatis Sesuai Nisab</span>
            </div>
          </div>
        </div>

        <div className="auth-hero-footer">
          © 2026 HalalFlow. Aplikasi Manajemen Keuangan Islami Terpercaya.
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="auth-form-side">
        <div className="auth-card-box">
          <div className="auth-tabs">
            <button 
              className="auth-tab-btn" 
              type="button"
              onClick={() => navigate('/login')}
            >
              Masuk (Login)
            </button>
            <button className="auth-tab-btn active" type="button">
              Daftar Akun Baru
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>
              Buat Akun HalalFlow
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
              Lengkapi data untuk memulai pencatatan keuangan Anda.
            </p>
          </div>

          {error && (
            <div className="form-error-alert">
              <Icon icon="mdi:alert-circle-outline" size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="form-success-alert">
              <Icon icon="mdi:check-circle-outline" size={18} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input
                type="text"
                name="fullName"
                className="form-input"
                placeholder="Contoh: Muhammad Rizky"
                value={fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alamat Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="nama@email.com"
                value={email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Kata Sandi (Minimal 6 karakter)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={handleChange}
                  required
                  style={{ paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                  }}
                  tabIndex="-1"
                >
                  <Icon icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'} size={18} />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Konfirmasi Kata Sandi</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: '20px', fontSize: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', color: 'var(--color-text-body)' }}>
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={agreeTerms}
                  onChange={handleChange}
                  style={{ marginTop: '3px' }}
                />
                <span>
                  Saya menyetujui <strong>Syarat & Ketentuan</strong> serta kebijakan privasi HalalFlow.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Icon icon="mdi:loading" size={18} className="animate-spin" />
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : (
                <>
                  <span>Daftar Akun Sekarang</span>
                  <Icon icon="mdi:arrow-right" size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
            Sudah memiliki akun?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary-container)', fontWeight: 700 }}>
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;