import React from 'react';
import Icon from './Icon';

const EmptyState = ({
  icon = 'mdi:receipt-text-outline',
  title = 'Belum Ada Transaksi Bulan Ini',
  description = 'Mulai catat pemasukan dan pengeluaran Anda untuk melihat analisis cashflow yang rapi dan berkah.',
  actionLabel = 'Catat Transaksi Pertama',
  onAction,
}) => {
  return (
    <div className="empty-state-container">
      <div className="empty-state-illustration">
        <div className="empty-state-circle-bg" />
        <div className="empty-state-icon-wrapper">
          <Icon icon={icon} size={56} color="var(--color-primary-container)" />
          <div className="empty-state-badge">
            <Icon icon="mdi:leaf" size={18} color="var(--color-primary)" />
          </div>
        </div>
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionLabel && onAction && (
        <button className="empty-state-cta" onClick={onAction}>
          <Icon icon="mdi:plus" size={18} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
