import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Icon from '../components/Icon';
import Logo from '../components/Logo';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { email, password, rememberMe } = formData;

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

    if (!email || !password) {
      setError('Email dan kata sandi harus diisi');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Gagal masuk. Periksa kembali email dan kata sandi Anda.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      {/* Left Side: Branding & Value Proposition */}
      <div className="auth-hero-side">
        <div className="auth-hero-brand">
          <Logo size="lg" variant="light" />
        </div>

        <div className="auth-hero-content">
          <h1 className="auth-hero-headline">
            Kelola Keuangan Pribadi Sesuai Syariah dengan Tenang & Berkah.
          </h1>
          
          <div className="auth-feature-pills">
            <div className="auth-feature-item">
              <Icon icon="mdi:hand-heart" size={22} color="var(--color-accent)" />
              <span>Automated Zakat & Infaq Tracker</span>
            </div>
            <div className="auth-feature-item">
              <Icon icon="mdi:chart-timeline-variant" size={22} color="var(--color-accent)" />
              <span>Smart Shariah-compliant Budget Planning</span>
            </div>
            <div className="auth-feature-item">
              <Icon icon="mdi:shield-check" size={22} color="var(--color-accent)" />
              <span>End-to-End Privacy & Keamanan Data</span>
            </div>
          </div>
        </div>

        <div className="auth-hero-footer">
          © 2026 HalalFlow. Membantu keluarga muslim merencanakan masa depan finansial yang berkah.
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="auth-form-side">
        <div className="auth-card-box">
          <div className="auth-tabs">
            <button className="auth-tab-btn active" type="button">
              Masuk (Login)
            </button>
            <button 
              className="auth-tab-btn" 
              type="button" 
              onClick={() => navigate('/register')}
            >
              Daftar Akun Baru
            </button>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
              Selamat Datang Kembali
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
              Masukkan email dan kata sandi untuk mengakses akun Anda.
            </p>
          </div>

          {error && (
            <div className="form-error-alert">
              <Icon icon="mdi:alert-circle-outline" size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Alamat Email</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
            </div>

            <div className="form-group">
              <label className="form-label">Kata Sandi</label>
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

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              fontSize: '0.85rem'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--color-text-body)' }}>
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={rememberMe}
                  onChange={handleChange}
                />
                <span>Ingat saya</span>
              </label>

              <Link to="/forgot-password" style={{ color: 'var(--color-primary-container)', fontWeight: 600 }}>
                Lupa kata sandi?
              </Link>
            </div>

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Icon icon="mdi:loading" size={18} className="animate-spin" />
                  <span>Memproses Masuk...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Akun Saya</span>
                  <Icon icon="mdi:arrow-right" size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
            Belum memiliki akun?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary-container)', fontWeight: 700 }}>
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;