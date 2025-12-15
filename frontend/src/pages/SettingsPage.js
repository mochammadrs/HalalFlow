import React, { useState, useEffect, useContext } from 'react';
import budgetService from '../services/budgetService';
import AuthContext from '../context/AuthContext';
import Icon from '../components/Icon';

const SettingsPage = () => {
  const { user } = useContext(AuthContext);
  const [percentTabungan, setPercentTabungan] = useState(20);
  const [loading, setLoading] = useState(true);
  const [messageType, setMessageType] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      budgetService.getSettings()
        .then(response => {
          setPercentTabungan(parseFloat(response.data.percent_tabungan));
          setLoading(false);
        })
        .catch(err => {
          console.error('Gagal ambil settings:', err);
          setLoading(false);
          setMessageType('error');
          setMessage('Gagal memuat pengaturan.');
        });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (percentTabungan < 0 || percentTabungan > 100) {
      setMessageType('error');
      setMessage('Persentase tabungan harus antara 0-100%.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await budgetService.updateSettings(percentTabungan);
      setMessageType('success');
      setMessage('Pengaturan berhasil disimpan!');
      setIsSubmitting(false);
    } catch (err) {
      console.error('Gagal update settings:', err);
      setMessageType('error');
      setMessage(err.response?.data?.message || 'Gagal menyimpan pengaturan.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem' }}>Memuat pengaturan...</p>
      </div>
    );
  }

  if (!user) {
    return <div className="info">Silakan login untuk melihat halaman ini.</div>;
  }

  return (
    <div>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Icon icon="mdi:cog" size={28} />
        Pengaturan Anggaran
      </h1>
      <p style={{ color: 'var(--color-text)', opacity: 0.8 }}>
        Atur preferensi alokasi keuangan Anda.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        {/* Left: Form */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon icon="mdi:sliders" size={20} />
                Preferensi Alokasi
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="form-standard">
              {messageType === 'success' && (
                <div className="alert alert-success"><span className="alert-icon"><Icon icon="mdi:check-circle" size={20} /></span><span>{message}</span></div>
              )}
              {messageType === 'error' && (
                <div className="alert alert-error"><span className="alert-icon"><Icon icon="mdi:alert-circle" size={20} /></span><span>{message}</span></div>
              )}

              {/* Zakat Info (Read-only) */}
              <div className="form-group">
                <label>Persentase Zakat (Tetap)</label>
                <input
                  type="text"
                  value="2.5%"
                  disabled
                  style={{ backgroundColor: 'var(--color-bg)', cursor: 'not-allowed' }}
                />
                <small style={{ display: 'block', marginTop: '0.5rem', opacity: 0.7 }}>
                  Zakat adalah kewajiban dalam Islam dan tidak dapat diubah.
                </small>
              </div>

              {/* Tabungan Input */}
              <div className="form-group">
                <label htmlFor="tabungan">Persentase Tabungan (%)</label>
                <input
                  id="tabungan"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={percentTabungan}
                  onChange={(e) => setPercentTabungan(parseFloat(e.target.value) || 0)}
                  required
                />
                <small style={{ display: 'block', marginTop: '0.5rem', opacity: 0.7 }}>
                  Sesuaikan persentase tabungan sesuai kemampuan finansial Anda (0-100%).
                </small>
              </div>

              {/* Kebutuhan Harian Info */}
              <div className="form-group">
                <label>Persentase Kebutuhan Harian</label>
                <input
                  type="text"
                  value={`${(100 - 2.5 - percentTabungan).toFixed(1)}%`}
                  disabled
                  style={{ backgroundColor: 'var(--color-bg)', cursor: 'not-allowed' }}
                />
                <small style={{ display: 'block', marginTop: '0.5rem', opacity: 0.7 }}>
                  Otomatis dihitung dari: 100% - Zakat (2.5%) - Tabungan ({percentTabungan}%)
                </small>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-mini"></span>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:check" size={18} style={{ marginRight: '0.5rem' }} />
                    Simpan Pengaturan
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Info Card */}
        <div>
          <div className="card">
            <h4 style={{ marginTop: '0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon icon="mdi:information" size={20} />
              Cara Kerja Alokasi
            </h4>
            <p style={{ opacity: 0.8 }}>
              Ketika Anda memasukkan gaji/pemasukan di Perencana Anggaran, sistem akan otomatis menghitung:
            </p>
            <ul style={{ opacity: 0.8, paddingLeft: '1.25rem', lineHeight: '1.8' }}>
              <li><strong>Zakat (2.5%):</strong> Untuk keperluan sosial dan keagamaan</li>
              <li><strong>Tabungan (sesuai pengaturan):</strong> Untuk masa depan dan darurat</li>
              <li><strong>Kebutuhan Harian (sisanya):</strong> Untuk pengeluaran sehari-hari</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
