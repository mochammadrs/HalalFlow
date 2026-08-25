import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';

const TopHeader = ({ onToggleMobileSidebar, onOpenAddTransaction }) => {
  const { user } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const getPageMeta = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'Dashboard Keuangan',
          subtitle: `Assalamu'alaikum, ${user?.full_name?.split(' ')[0] || 'Sobat'}! Pantau keberkahan finansial Anda.`,
        };
      case '/transactions':
        return {
          title: 'Riwayat Transaksi',
          subtitle: 'Daftar catatan arus kas masuk dan keluar secara terperinci.',
        };
      case '/categories':
        return {
          title: 'Manajemen Kategori',
          subtitle: 'Atur dan kelola pos anggaran serta kategori transaksi.',
        };
      case '/planner':
        return {
          title: 'Budget Planner',
          subtitle: 'Perencanaan alokasi anggaran bulanan & kalkulator zakat.',
        };
      case '/settings':
        return {
          title: 'Pengaturan Akun',
          subtitle: 'Kelola preferensi akun, keamanan, dan aturan Syariah.',
        };
      default:
        return {
          title: 'HalalFlow',
          subtitle: 'Aplikasi Manajemen Keuangan Islami',
        };
    }
  };

  const { title, subtitle } = getPageMeta();

  // Current date formatted in Indonesian
  const currentDateFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          className="mobile-menu-toggle"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle menu"
        >
          <Icon icon="mdi:menu" size={24} />
        </button>
        <div className="header-titles">
          <h1 className="header-title">{title}</h1>
          <p className="header-subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="header-right">
        {/* Dark Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isDark ? '#FBBF24' : '#6B7280',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease',
          }}
        >
          <Icon icon={isDark ? 'mdi:weather-sunny' : 'mdi:weather-night'} size={20} />
        </button>

        {/* Date badge */}
        <div className="header-date-badge">
          <Icon icon="mdi:calendar-month-outline" size={16} color="var(--color-primary-container)" />
          <span>{currentDateFormatted}</span>
        </div>

        {/* Quick Add Transaction CTA */}
        <button
          className="btn-primary-header"
          onClick={onOpenAddTransaction}
        >
          <Icon icon="mdi:plus" size={20} />
          <span>Transaksi Baru</span>
        </button>
      </div>
    </header>
  );
};

export default TopHeader;
