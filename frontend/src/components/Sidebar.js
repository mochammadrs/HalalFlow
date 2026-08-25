import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Icon from './Icon';

import Logo from './Logo';

const Sidebar = ({ isMobileOpen, closeMobileSidebar, onOpenAddTransaction }) => {
  const { user, logout } = useContext(AuthContext);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: 'mdi:view-dashboard-outline' },
    { to: '/transactions', label: 'Riwayat Transaksi', icon: 'mdi:swap-horizontal' },
    { to: '/categories', label: 'Kategori', icon: 'mdi:tag-outline' },
    { to: '/planner', label: 'Budget Planner', icon: 'mdi:chart-arc' },
    { to: '/settings', label: 'Pengaturan', icon: 'mdi:cog-outline' },
  ];

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
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div className="sidebar-backdrop" onClick={closeMobileSidebar} />
      )}

      <aside className={`app-sidebar ${isMobileOpen ? 'sidebar-mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <Logo size="md" />
          {isMobileOpen && (
            <button className="sidebar-close-btn" onClick={closeMobileSidebar}>
              <Icon icon="mdi:close" size={20} />
            </button>
          )}
        </div>

        {/* Quick CTA button in sidebar */}
        <div className="sidebar-action-container">
          <button 
            className="sidebar-cta-btn"
            onClick={() => {
              if (onOpenAddTransaction) onOpenAddTransaction();
              if (closeMobileSidebar) closeMobileSidebar();
            }}
          >
            <Icon icon="mdi:plus-circle-outline" size={18} />
            <span>Catat Transaksi</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <span className="nav-section-title">MENU UTAMA</span>
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.to} className="nav-item">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'nav-link-active' : ''}`
                  }
                  onClick={closeMobileSidebar}
                  end={item.to === '/'}
                >
                  <span className="nav-active-pill" />
                  <Icon icon={item.icon} size={20} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile Card & Logout */}
        <div className="sidebar-footer">
          <div className="user-profile-card">
            <div className="user-avatar">
              {getInitials(user?.full_name || user?.name)}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.full_name || user?.name || 'Pengguna'}</span>
              <span className="user-email">{user?.email || 'user@halalflow.id'}</span>
            </div>
            <button 
              onClick={logout} 
              className="user-logout-btn" 
              title="Keluar dari akun"
              aria-label="Logout"
            >
              <Icon icon="mdi:logout" size={18} color="#DC2626" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
