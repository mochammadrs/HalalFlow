import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import Icon from '../components/Icon';

const RegisterPage = () => {
  const [full_name, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors(null);
    setLoading(true);

    try {
      await authService.register(full_name, email, password);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.data && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors([{ msg: err.response?.data?.message || 'Registrasi gagal.' }]);
      }
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
          <h1 className="auth-title">Buat Akun Baru</h1>
          <p className="auth-subtitle">Mulai mengelola keuangan dengan bijak</p>
        </div>

        {/* Form Section */}
        {!success ? (
          <form onSubmit={handleRegister} noValidate className="auth-form">
            <div className="form-group">
              <label htmlFor="full_name">Nama Lengkap</label>
              <input
                id="full_name"
                type="text"
                value={full_name}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Masukkan nama lengkap Anda"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Alamat Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="nama@example.com"
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
                placeholder="Buat password yang kuat"
              />
              <p className="password-hint">Gunakan kombinasi huruf, angka, dan simbol untuk keamanan maksimal</p>
            </div>

            {errors && (
              <div className="alert alert-error">
                <span className="alert-icon">
                  <Icon icon="mdi:alert-circle" size={20} />
                </span>
                <div>
                  {errors.map((error, index) => (
                    <p key={index} className="alert-message">{error.msg}</p>
                  ))}
                </div>
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
                  Sedang mendaftar...
                </>
              ) : (
                <>
                  <Icon icon="mdi:account-plus" size={18} style={{ marginRight: '0.5rem' }} />
                  Daftar
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="alert alert-success" style={{ marginTop: '2rem' }}>
            <span className="alert-icon">
              <Icon icon="mdi:check-circle" size={20} />
            </span>
            <div>
              <p className="alert-message" style={{ fontWeight: '600' }}>Registrasi berhasil!</p>
              <p className="alert-message">Silakan tunggu, Anda akan dialihkan ke halaman login...</p>
            </div>
          </div>
        )}

        {/* Footer Section */}
        {!success && (
          <div className="auth-footer">
            <p className="auth-footer-text">
              Sudah punya akun?{' '}
              <Link to="/login" className="auth-link">
                Masuk di sini
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;