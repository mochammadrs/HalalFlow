import React, { useState } from 'react';
import budgetService from '../services/budgetService';
import Icon from '../components/Icon';

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
};

const BudgetPlannerPage = () => {
  const [pemasukan, setPemasukan] = useState(0);
  const [hasil, setHasil] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setHasil(null);

    if (!pemasukan || pemasukan <= 0) {
      setError('Masukkan pemasukan dengan nilai lebih dari 0');
      return;
    }

    try {
      setIsLoading(true);
      const response = await budgetService.calculateBudget(pemasukan);
      setHasil(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Gagal kalkulasi:', err);
      setError(err.response?.data?.message || 'Gagal melakukan kalkulasi.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Icon icon="mdi:cash" size={28} />
        Perencana Anggaran Syariah
      </h1>
      <p style={{ color: 'var(--color-text)', opacity: 0.8 }}>
        Hitung alokasi keuangan Anda berdasarkan prinsip syariah dengan persentase zakat dan tabungan.
      </p>

      <div className="grid grid-2" style={{ marginTop: '2rem' }}>
        {/* Input Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon icon="mdi:calculator" size={20} />
              Hitung Alokasi
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="form-standard">
            {error && <div className="alert alert-error"><span className="alert-icon"><Icon icon="mdi:alert-circle" size={20} /></span><span>{error}</span></div>}

            <div className="form-group">
              <label htmlFor="pemasukan">Pemasukan (Gaji) - IDR</label>
              <input
                id="pemasukan"
                type="number"
                value={pemasukan}
                onChange={(e) => setPemasukan(parseFloat(e.target.value) || 0)}
                placeholder="Contoh: 2000000"
                min="0"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
              style={{ width: '100%' }}
            >
              {isLoading ? (
                <>
                  <span className="spinner-mini"></span>
                  Menghitung...
                </>
              ) : (
                <>
                  <Icon icon="mdi:check" size={18} style={{ marginRight: '0.5rem' }} />
                  Hitung Alokasi
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: '6px', fontSize: '0.9rem', border: '1px solid var(--color-border)' }}>
            <p style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <Icon icon="mdi:information" size={20} />
              </span>
              <strong style={{ fontSize: '0.95rem' }}>Info Alokasi:</strong>
            </p>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem', opacity: 0.9, lineHeight: '1.6' }}>
              <li><strong>Zakat (tetap): 2.5%</strong> Untuk keperluan sosial dan keagamaan</li>
              <li><strong>Tabungan:</strong> Sesuai pengaturan Anda untuk masa depan dan darurat</li>
              <li><strong>Kebutuhan Harian:</strong> Untuk pengeluaran sehari-hari</li>
            </ul>
          </div>
        </div>

        {/* Results */}
        {hasil && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon icon="mdi:chart-line" size={20} />
                Hasil Alokasi
              </h3>
            </div>

            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: '6px' }}>
              <p style={{ margin: '0', fontSize: '0.9rem', opacity: 0.8 }}>Total Pemasukan</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                {formatRupiah(hasil.total_pemasukan)}
              </p>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {/* Zakat */}
              <div style={{
                padding: '1rem',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                borderLeft: '4px solid #DC3545',
                borderRadius: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon icon="mdi:coin" size={20} />
                    <div>
                      <p style={{ margin: '0', fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text)' }}>Zakat</p>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#DC3545', fontWeight: '500' }}>
                        {hasil.persentase.zakat}%
                      </p>
                    </div>
                  </div>
                  <p style={{ margin: '0', fontSize: '1.25rem', fontWeight: '700', color: '#DC3545' }}>
                    {formatRupiah(hasil.alokasi.zakat)}
                  </p>
                </div>
              </div>

              {/* Tabungan */}
              <div style={{
                padding: '1rem',
                backgroundColor: 'rgba(233, 196, 106, 0.1)',
                borderLeft: '4px solid #E9C46A',
                borderRadius: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon icon="mdi:piggy-bank" size={20} />
                    <div>
                      <p style={{ margin: '0', fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text)' }}>Tabungan</p>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#E9C46A', fontWeight: '500' }}>
                        {hasil.persentase.tabungan}%
                      </p>
                    </div>
                  </div>
                  <p style={{ margin: '0', fontSize: '1.25rem', fontWeight: '700', color: '#E9C46A' }}>
                    {formatRupiah(hasil.alokasi.tabungan)}
                  </p>
                </div>
              </div>

              {/* Kebutuhan Harian */}
              <div style={{
                padding: '1rem',
                backgroundColor: 'rgba(45, 106, 79, 0.1)',
                borderLeft: '4px solid #2D6A4F',
                borderRadius: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon icon="mdi:shopping-bag" size={20} />
                    <div>
                      <p style={{ margin: '0', fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text)' }}>Kebutuhan Harian</p>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#2D6A4F', fontWeight: '500' }}>
                        {hasil.persentase.kebutuhan_harian.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <p style={{ margin: '0', fontSize: '1.25rem', fontWeight: '700', color: '#2D6A4F' }}>
                    {formatRupiah(hasil.alokasi.kebutuhan_harian)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetPlannerPage;
