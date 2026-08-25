import React, { useState, useEffect, useContext } from 'react';
import budgetService from '../services/budgetService';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/Icon';

const SettingsPage = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('profile');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email] = useState(user?.email || '');
  const [percentTabungan, setPercentTabungan] = useState(20);
  const [infaqReminder, setInfaqReminder] = useState(true);
  const [currency] = useState('IDR (Rp) - Rupiah Indonesia');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Change password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setLoading(true);
      budgetService
        .getSettings()
        .then((response) => {
          if (response.data) {
            setPercentTabungan(Number(response.data.percent_tabungan) || 20);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching settings:', err);
          setLoading(false);
        });
    }
  }, [user]);

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (percentTabungan < 0 || percentTabungan > 100) {
      setMessageType('error');
      setMessage('Persentase tabungan harus antara 0% s.d. 100%.');
      return;
    }

    try {
      setIsSubmitting(true);
      await budgetService.updateSettings(percentTabungan);
      setMessageType('success');
      setMessage('Pengaturan berhasil diperbarui!');
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessageType('error');
      setMessage(err.response?.data?.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessageType('error');
      setMessage('Semua kolom kata sandi wajib diisi.');
      return;
    }

    if (newPassword.length < 6) {
      setMessageType('error');
      setMessage('Kata sandi baru minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessageType('error');
      setMessage('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setMessageType('success');
    setMessage('Kata sandi Anda berhasil diperbarui.');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-primary-container)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Memuat preferensi akun...</p>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return 'HF';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div>
      {/* 1. Navigation Tabs */}
      <div className="settings-tabs">
        <button
          type="button"
          className={`settings-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => { setActiveTab('profile'); setMessage(''); }}
        >
          <Icon icon="mdi:account-outline" size={18} />
          <span>Profil Pengguna</span>
        </button>
        <button
          type="button"
          className={`settings-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => { setActiveTab('security'); setMessage(''); }}
        >
          <Icon icon="mdi:shield-lock-outline" size={18} />
          <span>Keamanan & Sandi</span>
        </button>
        <button
          type="button"
          className={`settings-tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => { setActiveTab('preferences'); setMessage(''); }}
        >
          <Icon icon="mdi:tune-variant" size={18} />
          <span>Preferensi Syariah</span>
        </button>
      </div>

      {message && (
        <div className={messageType === 'success' ? 'form-success-alert' : 'form-error-alert'}>
          <Icon icon={messageType === 'success' ? 'mdi:check-circle' : 'mdi:alert-circle'} size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* 2. TAB: Profile */}
      {activeTab === 'profile' && (
        <div className="settings-layout-2col">
          <div className="card-white">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '16px' }}>
              Informasi Pribadi
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, var(--color-primary-container) 0%, var(--color-primary) 100%)',
                color: '#FFFFFF',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(45, 106, 79, 0.2)'
              }}>
                {getInitials(fullName)}
              </div>
              <div>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-main)', display: 'block' }}>
                  {fullName || 'Pengguna HalalFlow'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-success)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Icon icon="mdi:check-decagram" size={14} /> Akun Terverifikasi Syariah
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alamat Email Terdaftar</label>
              <input
                type="email"
                className="form-input"
                value={email}
                disabled
                style={{ backgroundColor: 'var(--color-surface-dim)', cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div className="card-white">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '16px' }}>
              Status Akun & Keanggotaan
            </h3>

            <div style={{ backgroundColor: 'var(--color-primary-light)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(45, 106, 79, 0.2)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Icon icon="mdi:mosque" size={20} color="var(--color-primary)" />
                <strong style={{ color: 'var(--color-primary)', fontSize: '0.92rem' }}>Paket HalalFlow Personal</strong>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-body)', lineHeight: 1.5 }}>
                Akses penuh ke pencatatan transaksi tanpa batas, budgeting bulanan, dan kalkulator zakat terpadu.
              </p>
            </div>

            <button
              type="button"
              className="btn-modal-danger"
              onClick={logout}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Icon icon="mdi:logout" size={18} />
              <span>Keluar dari Akun (Logout)</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. TAB: Security */}
      {activeTab === 'security' && (
        <div style={{ maxWidth: '540px' }}>
          <div className="card-white">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '6px' }}>
              Ganti Kata Sandi
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
              Pastikan Anda menggunakan kata sandi yang kuat dengan kombinasi huruf dan angka.
            </p>

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Kata Sandi Saat Ini</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kata Sandi Baru (Min. 6 karakter)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ulangi Kata Sandi Baru</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-modal-primary"
                style={{ marginTop: '12px' }}
              >
                Perbarui Kata Sandi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. TAB: Sharia Preferences */}
      {activeTab === 'preferences' && (
        <div style={{ width: '100%', maxWidth: '840px' }}>
          <div className="card-white">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '16px' }}>
              Preferensi Keuangan & Standar Syariah
            </h3>

            <form onSubmit={handleSavePreferences}>
              <div className="form-group">
                <label className="form-label">Mata Uang Utama</label>
                <input
                  type="text"
                  className="form-input"
                  value={currency}
                  disabled
                  style={{ backgroundColor: 'var(--color-surface-dim)' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Persentase Target Tabungan Bulanan (%)</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  max="100"
                  value={percentTabungan}
                  onChange={(e) => setPercentTabungan(Number(e.target.value))}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Akan digunakan secara otomatis pada kalkulator perencanaan anggaran.
                </span>
              </div>

              {/* Theme Preference */}
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Tema Tampilan (Mode)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => !isDark || toggleTheme()}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: !isDark ? '2px solid var(--color-primary-container)' : '1px solid var(--color-border)',
                      backgroundColor: !isDark ? 'var(--color-primary-light)' : 'var(--color-surface)',
                      color: !isDark ? 'var(--color-primary)' : 'var(--color-text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Icon icon="mdi:weather-sunny" size={20} color={!isDark ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                    <span>Mode Terang</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => isDark || toggleTheme()}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: isDark ? '2px solid var(--color-primary-container)' : '1px solid var(--color-border)',
                      backgroundColor: isDark ? 'var(--color-primary-light)' : 'var(--color-surface)',
                      color: isDark ? 'var(--color-primary)' : 'var(--color-text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Icon icon="mdi:weather-night" size={20} color={isDark ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
                    <span>Mode Gelap</span>
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '16px', padding: '14px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-text-main)', display: 'block' }}>
                      Pengingat Infaq & Sedekah Subuh
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      Tampilkan rekomendasi alokasi sosial 2.5% di Dashboard.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={infaqReminder}
                    onChange={(e) => setInfaqReminder(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-container)' }}
                  />
                </label>
              </div>

              <button
                type="submit"
                className="btn-modal-primary"
                style={{ marginTop: '20px' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Preferensi'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
