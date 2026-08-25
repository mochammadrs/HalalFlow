import React, { useState, useEffect, useCallback, useMemo } from 'react';
import budgetService from '../services/budgetService';
import dashboardService from '../services/dashboardService';
import Icon from '../components/Icon';
import { useTheme } from '../context/ThemeContext';

const formatRupiah = (number) => {
  const val = Number(number) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};

const BudgetPlannerPage = () => {
  const { isDark } = useTheme();

  const getInitialIncome = () => {
    const saved = localStorage.getItem('halalflow_planner_income');
    return saved || '10.000.000';
  };

  const [pemasukanInput, setPemasukanInput] = useState(getInitialIncome());
  const [rawPemasukan, setRawPemasukan] = useState(() => {
    const saved = localStorage.getItem('halalflow_planner_income') || '10000000';
    return parseInt(saved.replace(/[^0-9]/g, ''), 10) || 10000000;
  });
  const [savingsPercent, setSavingsPercent] = useState(20);
  const [expenseData, setExpenseData] = useState([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Zakat Maal interactive calculator state
  const [zakatTotalHarta, setZakatTotalHarta] = useState(85000000);
  const [hargaEmasPerGram] = useState(1400000); // Estimasi harga emas per gram
  const nishabTahunan = 85 * hargaEmasPerGram; // 85 gram emas = Rp 119.000.000

  // 100% Instant & Synchronous reactive calculation
  const calculationResult = useMemo(() => {
    if (!rawPemasukan || rawPemasukan <= 0) return null;
    const pZakat = 2.5;
    const pTabungan = Number(savingsPercent) || 0;
    const pKebutuhan = Math.max(0, 100 - pZakat - pTabungan);
    const zakatVal = (pZakat / 100) * rawPemasukan;
    const tabunganVal = (pTabungan / 100) * rawPemasukan;
    const kebutuhanVal = rawPemasukan - zakatVal - tabunganVal;

    return {
      total_pemasukan: rawPemasukan,
      alokasi: {
        zakat: zakatVal,
        tabungan: tabunganVal,
        kebutuhan_harian: kebutuhanVal,
      },
      persentase: {
        zakat: pZakat,
        tabungan: pTabungan,
        kebutuhan_harian: pKebutuhan,
      },
    };
  }, [rawPemasukan, savingsPercent]);

  const fetchPlannerData = useCallback(async () => {
    setError('');
    try {
      const [settingsRes, expCatRes] = await Promise.all([
        budgetService.getSettings().catch(() => ({ data: { percent_tabungan: 20 } })),
        dashboardService.getExpenseByCategory().catch(() => ({ data: { labels: [], data: [] } })),
      ]);

      if (settingsRes.data && settingsRes.data.percent_tabungan !== undefined) {
        setSavingsPercent(Number(settingsRes.data.percent_tabungan) || 20);
      }

      if (expCatRes.data && expCatRes.data.labels) {
        const catLabels = expCatRes.data.labels || [];
        const catSpent = expCatRes.data.data || [];
        const mapped = catLabels.map((label, idx) => ({
          category: label,
          spent: catSpent[idx] || 0,
          limit: 3000000,
        }));
        setExpenseData(mapped);
      }
    } catch (err) {
      console.error('Error fetching planner data:', err);
    }
  }, []);

  useEffect(() => {
    fetchPlannerData();
  }, [fetchPlannerData]);

  const handlePemasukanChange = (e) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    if (!rawVal) {
      setRawPemasukan(0);
      setPemasukanInput('');
      localStorage.removeItem('halalflow_planner_income');
      return;
    }
    const num = parseInt(rawVal, 10);
    const formatted = num.toLocaleString('id-ID');
    setRawPemasukan(num);
    setPemasukanInput(formatted);
    localStorage.setItem('halalflow_planner_income', formatted);
  };

  const handleSliderChange = (e) => {
    setSavingsPercent(Number(e.target.value));
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setSuccessMsg('');
    setError('');
    try {
      await budgetService.updateSettings(savingsPercent);
      await budgetService.calculateBudget(rawPemasukan, savingsPercent).catch(() => {});
      setSuccessMsg(`Pengaturan persentase tabungan (${savingsPercent}%) berhasil disimpan ke database!`);
    } catch (err) {
      console.error('Save settings error:', err);
      setError('Gagal menyimpan pengaturan tabungan ke database.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Zakat Maal calculation
  const isWajibZakat = zakatTotalHarta >= nishabTahunan;
  const nominalZakatMaal = isWajibZakat ? zakatTotalHarta * 0.025 : 0;

  return (
    <div>
      {/* 1. Header Overview Health Card */}
      <div
        className="budget-health-card"
        style={{
          backgroundColor: isDark ? '#17201B' : '#FFFFFF',
          border: isDark ? '1px solid #24332A' : '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '22px 28px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.4)' : '0 2px 10px rgba(0,0,0,0.03)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Icon icon="mdi:shield-star" size={26} color={isDark ? '#34D399' : '#0F5238'} />
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.3rem',
                fontWeight: 800,
                color: isDark ? '#F3F6F4' : '#0F5238',
                letterSpacing: '-0.015em',
                margin: 0,
              }}
            >
              Alokasi & Kesehatan Anggaran Syariah
            </h2>
          </div>
          <p
            style={{
              fontSize: '0.88rem',
              color: isDark ? '#C5CEC8' : '#4B5563',
              maxWidth: '680px',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Formula keuangan Islami memprioritaskan hak sosial (Zakat & Infaq 2.5%), proteksi masa depan (Tabungan), dan efisiensi kebutuhan harian.
          </p>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: isDark ? '#84938A' : '#6B7280',
              display: 'block',
              marginBottom: '4px',
            }}
          >
            TARGET TABUNGAN
          </span>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.85rem',
              fontWeight: 800,
              color: isDark ? '#34D399' : '#0F5238',
              lineHeight: 1.1,
            }}
          >
            {savingsPercent}%
          </div>
        </div>
      </div>

      {error && (
        <div className="form-error-alert">
          <Icon icon="mdi:alert-circle-outline" size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="form-success-alert">
          <Icon icon="mdi:check-circle-outline" size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. Main 2-Column Content */}
      <div className="planner-grid-2col">
        {/* Left Column: Budget Calculator & Settings */}
        <div className="card-white" style={{ backgroundColor: isDark ? '#17201B' : '#FFFFFF', border: isDark ? '1px solid #24332A' : '1px solid var(--color-border)' }}>
          <div className="section-header-row">
            <div className="section-title-wrapper">
              <Icon icon="mdi:calculator-variant" size={20} color="var(--color-primary-container)" />
              <h3 className="section-title" style={{ color: isDark ? '#F3F6F4' : 'var(--color-text-main)' }}>Kalkulator Alokasi Pemasukan</h3>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSaveSettings(); }}>
            <div className="amount-input-container">
              <label className="amount-label">NOMINAL PEMASUKAN / GAJI</label>
              <div className="amount-input-box">
                <span className="currency-prefix">Rp</span>
                <input
                  type="text"
                  className="amount-input"
                  placeholder="10.000.000"
                  value={pemasukanInput}
                  onChange={handlePemasukanChange}
                />
              </div>
            </div>

            {/* Savings percentage slider */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label">Persentase Tabungan & Investasi</label>
                <span style={{ fontWeight: 700, color: isDark ? '#34D399' : 'var(--color-primary)', fontSize: '1rem' }}>{savingsPercent}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={savingsPercent}
                onChange={handleSliderChange}
                style={{ width: '100%', accentColor: 'var(--color-primary-container)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
                <span>Min: 5%</span>
                <span>20% (Ideal)</span>
                <span>Max: 50%</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn-modal-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleSaveSettings}
                disabled={savingSettings}
              >
                <Icon icon="mdi:content-save-outline" size={18} />
                <span>{savingSettings ? 'Menyimpan...' : 'Simpan Pengaturan %'}</span>
              </button>
            </div>
          </form>

          {/* Allocation Results */}
          {calculationResult && (
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border-light)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: isDark ? '#F3F6F4' : 'var(--color-text-main)', marginBottom: '14px' }}>
                Rekomendasi Pembagian Dana (Berdasarkan {formatRupiah(calculationResult.total_pemasukan)}):
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Zakat */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: isDark ? '#2A1A05' : 'var(--color-accent-light)', borderRadius: 'var(--radius-md)', border: isDark ? '1px solid #78350F' : '1px solid rgba(233, 196, 106, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon icon="mdi:hand-heart" size={20} color={isDark ? '#FDE68A' : 'var(--color-accent-dark)'} />
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: isDark ? '#F3F6F4' : 'var(--color-text-main)' }}>Zakat & Sedekah</span>
                      <span style={{ fontSize: '0.75rem', color: isDark ? '#C5CEC8' : 'var(--color-text-muted)', display: 'block' }}>Kewajiban {calculationResult.persentase.zakat}%</span>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: isDark ? '#FDE68A' : 'var(--color-accent-dark)', fontSize: '1rem' }}>
                    {formatRupiah(calculationResult.alokasi.zakat)}
                  </span>
                </div>

                {/* Tabungan */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: isDark ? '#064E3B' : 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', border: isDark ? '1px solid #10B981' : '1px solid rgba(45, 106, 79, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon icon="mdi:piggy-bank-outline" size={20} color={isDark ? '#34D399' : 'var(--color-primary)'} />
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: isDark ? '#F3F6F4' : 'var(--color-text-main)' }}>Tabungan & Dana Darurat</span>
                      <span style={{ fontSize: '0.75rem', color: isDark ? '#C5CEC8' : 'var(--color-text-muted)', display: 'block' }}>Alokasi {calculationResult.persentase.tabungan}%</span>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: isDark ? '#34D399' : 'var(--color-primary)', fontSize: '1rem' }}>
                    {formatRupiah(calculationResult.alokasi.tabungan)}
                  </span>
                </div>

                {/* Kebutuhan Harian */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: isDark ? '#1F2B24' : 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: isDark ? '1px solid #24332A' : '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon icon="mdi:shopping-outline" size={20} color={isDark ? '#C5CEC8' : 'var(--color-text-body)'} />
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: isDark ? '#F3F6F4' : 'var(--color-text-main)' }}>Kebutuhan Hidup Maksimal</span>
                      <span style={{ fontSize: '0.75rem', color: isDark ? '#84938A' : 'var(--color-text-muted)', display: 'block' }}>Sisa {calculationResult.persentase.kebutuhan_harian}%</span>
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: isDark ? '#F3F6F4' : 'var(--color-text-main)', fontSize: '1rem' }}>
                    {formatRupiah(calculationResult.alokasi.kebutuhan_harian)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Zakat Maal Dedicated Calculator */}
        <div className="zakat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Icon icon="mdi:scale-balance" size={24} color={isDark ? '#FDE68A' : 'var(--color-accent-dark)'} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: isDark ? '#F3F6F4' : 'var(--color-text-main)' }}>
              Kalkulator Zakat Maal (Harta)
            </h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: isDark ? '#C5CEC8' : 'var(--color-text-body)', lineHeight: 1.5, marginBottom: '16px' }}>
            Zakat Maal wajib dikeluarkan sebesar <strong>2.5%</strong> apabila total harta simpanan telah mencapai nisab setara <strong>85 gram emas murni</strong> dan telah tersimpan selama 1 tahun (haul).
          </p>

          <div style={{ backgroundColor: isDark ? '#2A1A05' : 'var(--color-accent-light)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', border: isDark ? '1px solid #78350F' : '1px solid rgba(233, 196, 106, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
              <span style={{ color: isDark ? '#C5CEC8' : 'var(--color-text-muted)' }}>Standar Nisab Emas (85g):</span>
              <strong style={{ color: isDark ? '#FDE68A' : 'var(--color-accent-dark)' }}>{formatRupiah(nishabTahunan)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: isDark ? '#C5CEC8' : 'var(--color-text-muted)' }}>Status Harta Anda:</span>
              <strong style={{ color: isWajibZakat ? (isDark ? '#34D399' : 'var(--color-success)') : (isDark ? '#84938A' : 'var(--color-text-subtle)') }}>
                {isWajibZakat ? '✓ Wajib Zakat (Tercapai Nisab)' : 'Belum Mencapai Nisab'}
              </strong>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">TOTAL HARTA SIMPANAN (TABUNGAN + EMAS + INVESTASI)</label>
            <input
              type="number"
              className="form-input"
              value={zakatTotalHarta}
              onChange={(e) => setZakatTotalHarta(Number(e.target.value) || 0)}
              step="1000000"
            />
          </div>

          <div style={{ padding: '16px', backgroundColor: isDark ? '#1F2B24' : 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: isDark ? '1px solid #24332A' : '1px solid var(--color-border)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#84938A' : 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
              ESTIMASI ZAKAT MAAL YANG HARUS DITUNAIKAN
            </span>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: isWajibZakat ? (isDark ? '#34D399' : 'var(--color-primary)') : (isDark ? '#5C6B62' : 'var(--color-text-subtle)'), marginTop: '4px' }}>
              {formatRupiah(nominalZakatMaal)}
            </div>
            {isWajibZakat && (
              <p style={{ fontSize: '0.78rem', color: isDark ? '#34D399' : 'var(--color-success)', marginTop: '4px' }}>
                Alhamdulillah, tunaikan zakat untuk mensucikan dan menumbuhkan harta.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Category Spending Progress Cards */}
      {expenseData.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: isDark ? '#F3F6F4' : 'var(--color-text-main)', marginBottom: '16px' }}>
            Monitoring Pengeluaran per Kategori Bulan Ini
          </h3>
          <div className="budget-grid-cards">
            {expenseData.map((item, idx) => {
              const percentUsed = Math.min(100, Math.round((item.spent / item.limit) * 100));
              let statusClass = 'safe';
              if (percentUsed > 85) statusClass = 'danger';
              else if (percentUsed > 65) statusClass = 'warning';

              return (
                <div key={idx} className="budget-card" style={{ backgroundColor: isDark ? '#17201B' : '#FFFFFF', border: isDark ? '1px solid #24332A' : '1px solid var(--color-border)' }}>
                  <div className="budget-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', backgroundColor: isDark ? '#064E3B' : 'var(--color-primary-light)', color: isDark ? '#34D399' : 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon icon="mdi:tag-outline" size={16} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isDark ? '#F3F6F4' : 'var(--color-text-main)' }}>
                        {item.category}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: statusClass === 'danger' ? '#F87171' : (isDark ? '#34D399' : 'var(--color-primary)') }}>
                      {percentUsed}%
                    </span>
                  </div>

                  <div className="budget-progress-track" style={{ backgroundColor: isDark ? '#131A16' : 'var(--color-surface-dim)' }}>
                    <div
                      className={`budget-progress-fill ${statusClass}`}
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: isDark ? '#84938A' : 'var(--color-text-muted)' }}>
                    <span>Terpakai: {formatRupiah(item.spent)}</span>
                    <span>Batas: {formatRupiah(item.limit)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPlannerPage;
