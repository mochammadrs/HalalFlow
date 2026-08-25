import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import transactionService from '../services/transactionService';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import Icon from '../components/Icon';
import EmptyState from '../components/EmptyState';
import TransactionModal from '../components/TransactionModal';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const formatRupiah = (number) => {
  const val = Number(number) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};

const getCategoryIconInfo = (name, type) => {
  const n = (name || '').toLowerCase();
  if (n.includes('makan') || n.includes('minum') || n.includes('kuliner') || n.includes('food') || n.includes('restoran')) {
    return { icon: 'mdi:silverware-fork-knife', bg: '#E8F5EE', color: '#0F5238' };
  }
  if (n.includes('trans') || n.includes('bensin') || n.includes('ojek') || n.includes('mobil') || n.includes('motor')) {
    return { icon: 'mdi:car-side', bg: '#FEF3C7', color: '#B45309' };
  }
  if (n.includes('zakat') || n.includes('infaq') || n.includes('sedekah') || n.includes('donasi')) {
    return { icon: 'mdi:hand-heart', bg: '#E0F2FE', color: '#0284C7' };
  }
  if (n.includes('belanja') || n.includes('shopping') || n.includes('pasar') || n.includes('supermarket')) {
    return { icon: 'mdi:shopping-outline', bg: '#FCE7F3', color: '#DB2777' };
  }
  if (n.includes('gaji') || n.includes('salary') || n.includes('upah') || n.includes('income')) {
    return { icon: 'mdi:cash-multiple', bg: '#DCFCE7', color: '#16A34A' };
  }
  const isInc = String(type).toUpperCase() === 'INCOME';
  if (isInc) {
    return { icon: 'mdi:arrow-bottom-left', bg: '#E8F5EE', color: '#0F5238' };
  }
  return { icon: 'mdi:arrow-top-right', bg: '#FEE2E2', color: '#DC2626' };
};

const DashboardPage = () => {
  const { isDark } = useTheme();
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, chartRes, txRes] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getExpenseByCategory(),
        transactionService.getTransactions(),
      ]);

      setSummary(summaryRes.data);
      setRecentTransactions((txRes.data || []).slice(0, 5));

      // Doughnut Chart Data
      if (chartRes.data && chartRes.data.labels && chartRes.data.labels.length > 0) {
        setChartData({
          labels: chartRes.data.labels,
          datasets: [
            {
              data: chartRes.data.data,
              backgroundColor: [
                '#10B981',
                '#E9C46A',
                '#EF4444',
                '#3B82F6',
                '#8B5CF6',
                '#F59E0B',
                '#06B6D4',
              ],
              borderColor: isDark ? '#17201B' : '#FFFFFF',
              borderWidth: 2,
              hoverOffset: 4,
            },
          ],
        });
      } else {
        setChartData(null);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Gagal memuat data dashboard. Pastikan server backend aktif.');
    } finally {
      setLoading(false);
    }
  }, [isDark]);

  useEffect(() => {
    fetchDashboardData();

    const handleTxUpdate = () => fetchDashboardData();
    window.addEventListener('halalflow:transaction-updated', handleTxUpdate);
    return () => {
      window.removeEventListener('halalflow:transaction-updated', handleTxUpdate);
    };
  }, [fetchDashboardData]);

  const handleCreateTransaction = async (data) => {
    await transactionService.createTransaction(
      data.date,
      data.amount,
      data.type,
      data.category_id,
      data.description
    );
    fetchDashboardData();
    window.dispatchEvent(new CustomEvent('halalflow:transaction-updated'));
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
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Memuat ringkasan keuangan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-error-alert" style={{ margin: '24px 0' }}>
        <Icon icon="mdi:alert-circle-outline" size={20} />
        <span>{error}</span>
      </div>
    );
  }

  const totalIncome = summary ? summary.total_income : 0;
  const totalExpense = summary ? summary.total_expense : 0;
  const netWorth = summary ? summary.balance : 0;
  const infaqEstimate = totalIncome * 0.025;

  return (
    <div>
      {/* 1. Bento Grid - Top 3 Metric Cards */}
      <div className="dashboard-grid-hero">
        {/* Metric 1: Total Saldo Kas Bersih (Hero Card) */}
        <div className="hero-balance-card">
          <div className="hero-balance-left">
            <span className="hero-balance-label">TOTAL SALDO KAS BERSIH</span>
            <div className="hero-balance-amount">
              {formatRupiah(netWorth)}
            </div>
            <div className="hero-balance-badge">
              <Icon icon="mdi:leaf" size={14} color="var(--color-accent)" />
              <span>Finansial Sehat & Syariah</span>
            </div>
          </div>
          <div className="hero-balance-actions">
            <button 
              className="hero-quick-btn"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Icon icon="mdi:plus" size={18} />
              <span>Catat Transaksi</span>
            </button>
          </div>
        </div>

        {/* Metric 2: Total Pemasukan */}
        <div className="card-white metric-card">
          <div className="metric-header">
            <span className="metric-title">
              TOTAL PEMASUKAN
            </span>
            <div className="metric-icon-box income">
              <Icon icon="mdi:arrow-down" size={18} />
            </div>
          </div>
          <div>
            <div className="metric-value" style={{ color: 'var(--color-success)' }}>
              {formatRupiah(totalIncome)}
            </div>
            <span className="metric-sub">Bulan Ini</span>
          </div>
        </div>

        {/* Metric 3: Total Pengeluaran */}
        <div className="card-white metric-card">
          <div className="metric-header">
            <span className="metric-title">
              TOTAL PENGELUARAN
            </span>
            <div className="metric-icon-box expense">
              <Icon icon="mdi:arrow-up" size={18} />
            </div>
          </div>
          <div>
            <div className="metric-value" style={{ color: 'var(--color-error)' }}>
              {formatRupiah(totalExpense)}
            </div>
            <span className="metric-sub">Sisa Kas: {formatRupiah(netWorth)}</span>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Section */}
      <div className="dashboard-main-columns">
        {/* Left Column: Transaksi Terkini */}
        <div className="dashboard-col">
          <div className="card-white" style={{ padding: '22px' }}>
            <div className="section-header" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon icon="mdi:history" size={22} color="var(--color-primary-container)" />
                <h2 className="section-title">Transaksi Terkini</h2>
              </div>
              <Link to="/transactions" className="btn-table-action" style={{ textDecoration: 'none', fontSize: '0.82rem' }}>
                Lihat Semua ({recentTransactions.length}) →
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <EmptyState
                title="Belum Ada Transaksi"
                description="Catat transaksi pemasukan atau pengeluaran pertama Anda."
                actionLabel="Catat Transaksi"
                onAction={() => setIsAddModalOpen(true)}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentTransactions.map((tx) => {
                  const isIncome = String(tx.type).toUpperCase() === 'INCOME';
                  const iconInfo = getCategoryIconInfo(tx.category_name, tx.type);
                  const formattedDate = new Date(tx.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                  });

                  return (
                    <div key={tx.id} className="recent-tx-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            backgroundColor: isDark ? 'var(--color-surface-dim)' : iconInfo.bg,
                            color: iconInfo.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Icon icon={iconInfo.icon} size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                            {tx.description || tx.category_name || 'Transaksi'}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            {tx.category_name || 'Umum'} • {formattedDate}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: isIncome ? 'var(--color-success)' : 'var(--color-text-main)' }}>
                        {isIncome ? `+ ${formatRupiah(tx.amount)}` : `- ${formatRupiah(tx.amount)}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Distribusi Pengeluaran & Zakat Card */}
        <div className="dashboard-col">
          {/* Distribusi Pengeluaran Card */}
          <div className="card-white" style={{ padding: '22px' }}>
            <div className="section-header" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon icon="mdi:chart-donut" size={20} color="var(--color-primary-container)" />
                <h2 className="section-title">Distribusi Pengeluaran</h2>
              </div>
            </div>

            {chartData ? (
              <div style={{ maxWidth: '230px', margin: '0 auto', position: 'relative' }}>
                <Doughnut
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    cutout: '68%',
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          boxWidth: 8,
                          padding: 8,
                          color: isDark ? '#C5CEC8' : '#404943',
                          font: { family: 'Inter', size: 10 },
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => ` ${ctx.label}: ${formatRupiah(ctx.parsed)}`,
                        },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '20px 0', fontSize: '0.82rem' }}>
                Belum ada data pengeluaran kategori bulan ini.
              </p>
            )}
          </div>

          {/* Zakat & Infaq Sunnah Card */}
          <div className="zakat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon icon="mdi:hand-heart" size={20} color="var(--color-accent-dark)" />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-text-main)' }}>
                  Alokasi Zakat Penghasilan
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-accent-dark)', backgroundColor: 'var(--color-accent-container)', padding: '2px 8px', borderRadius: '999px' }}>
                2.5% Nisab
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-body)', marginBottom: '10px' }}>
              Estimasi kewajiban zakat dari pemasukan bulan ini:
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {formatRupiah(infaqEstimate)}
              </span>
              <Link to="/planner" style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>
                Kalkulator Lengkap →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Global Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateTransaction}
      />
    </div>
  );
};

export default DashboardPage;
