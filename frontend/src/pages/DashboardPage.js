import React, { useState, useEffect, useContext } from 'react';
import dashboardService from '../services/dashboardService';
import AuthContext from '../context/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import Icon from '../components/Icon';

ChartJS.register(ArcElement, Tooltip, Legend);

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
};

// SummaryCard Component
const SummaryCard = ({ title, icon, value, color }) => (
  <div className="summary-card" style={color ? { background: color } : {}}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '1.5rem' }}>
        <Icon icon={icon} size={24} color="inherit" />
      </span>
      <h3>{title}</h3>
    </div>
    <div className="value">{value}</div>
  </div>
);

// ExpenseChart Component
const ExpenseChart = ({ data }) => {
  if (!data || data.labels.length === 0) {
    return (
      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon icon="mdi:chart-pie" size={24} />
          Pengeluaran per Kategori
        </h3>
        <p style={{ textAlign: 'center', color: 'var(--color-text)', opacity: 0.7 }}>
          Belum ada data pengeluaran bulan ini untuk ditampilkan di chart.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Icon icon="mdi:chart-pie" size={24} />
        Pengeluaran per Kategori
      </h3>
      <div style={{ maxWidth: '500px', margin: '0 auto', position: 'relative' }}>
        <Pie 
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: 'var(--color-text)',
                  font: {
                    size: 13,
                    weight: '600'
                  },
                  padding: 15,
                  usePointStyle: true,
                  pointStyle: 'circle',
                  boxWidth: 12,
                  boxHeight: 12
                }
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#FFFFFF',
                bodyColor: '#FFFFFF',
                borderColor: 'var(--color-primary)',
                borderWidth: 1,
                padding: 12,
                titleFont: {
                  size: 13,
                  weight: 'bold'
                },
                bodyFont: {
                  size: 12
                },
                displayColors: true,
                callbacks: {
                  label: function(context) {
                    return context.label + ': ' + formatRupiah(context.parsed);
                  }
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, chartRes] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getExpenseByCategory(),
      ]);

      setSummary(summaryRes.data);

      setChartData({
        labels: chartRes.data.labels,
        datasets: [
          {
            label: 'Pengeluaran',
            data: chartRes.data.data,
            backgroundColor: [
              'rgba(45, 106, 79, 0.8)',     // Primary green
              'rgba(233, 196, 106, 0.8)',   // Accent gold
              'rgba(220, 53, 69, 0.8)',     // Error red
              'rgba(64, 145, 108, 0.8)',    // Secondary green
              'rgba(40, 167, 69, 0.8)',     // Success green
              'rgba(255, 193, 7, 0.8)',     // Warning yellow
              'rgba(23, 162, 184, 0.8)',    // Info cyan
            ],
            borderColor: [
              'rgba(45, 106, 79, 1)',
              'rgba(233, 196, 106, 1)',
              'rgba(220, 53, 69, 1)',
              'rgba(64, 145, 108, 1)',
              'rgba(40, 167, 69, 1)',
              'rgba(255, 193, 7, 1)',
              'rgba(23, 162, 184, 1)',
            ],
            borderWidth: 2,
          },
        ],
      });

      setLoading(false);
    } catch (err) {
      console.error('Gagal mengambil data dashboard:', err);
      setError('Gagal memuat data dashboard. Silakan coba lagi.');
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    if (user && isMounted) {
      fetchDashboardData();
    } else if (!user) {
      setLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem' }}>Memuat dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span className="alert-icon">
          <Icon icon="mdi:alert-circle" size={20} />
        </span>
        <div>
          <strong>Error:</strong> {error}
          <button 
            onClick={fetchDashboardData} 
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="info">Silakan login untuk melihat dashboard.</div>;
  }

  const balance = summary?.total_income - summary?.total_expense || 0;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon icon="mdi:chart-line" size={28} />
          Dashboard HalalFlow
        </h1>
        <p style={{ color: 'var(--color-text)', opacity: 0.8 }}>
          Selamat datang, <strong>{user.full_name || user.email}</strong>! Berikut ringkasan keuangan Anda.
        </p>
      </div>

      {/* Summary Cards Grid */}
      {summary && (
        <div className="grid grid-3">
          <SummaryCard
            title="Total Pemasukan"
            value={formatRupiah(summary.total_income)}
            icon="mdi:arrow-bottom-left"
            color="linear-gradient(135deg, #2D6A4F 0%, rgba(45, 106, 79, 0.7) 100%)"
          />
          <SummaryCard
            title="Total Pengeluaran"
            value={formatRupiah(summary.total_expense)}
            icon="mdi:arrow-top-right"
            color="linear-gradient(135deg, #DC3545 0%, rgba(220, 53, 69, 0.7) 100%)"
          />
          <SummaryCard
            title="Saldo"
            value={formatRupiah(balance)}
            icon={balance >= 0 ? "mdi:check-circle" : "mdi:alert-circle"}
            color={balance >= 0 
              ? "linear-gradient(135deg, #28A745 0%, rgba(40, 167, 69, 0.7) 100%)"
              : "linear-gradient(135deg, #FFC107 0%, rgba(255, 193, 7, 0.7) 100%)"
            }
          />
        </div>
      )}

      {/* Expense Chart */}
      <div style={{ marginTop: '2rem' }}>
        <ExpenseChart data={chartData} />
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button 
          onClick={fetchDashboardData} 
          className="btn btn-primary"
        >
          <Icon icon="mdi:refresh" size={18} style={{ marginRight: '0.5rem' }} />
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
