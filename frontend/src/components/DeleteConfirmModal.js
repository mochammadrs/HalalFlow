import React from 'react';
import Icon from './Icon';

const DeleteConfirmModal = ({
  isOpen,
  title = 'Hapus Item Ini?',
  description = 'Tindakan ini tidak dapat dibatalkan. Data akan dihapus secara permanen dari sistem.',
  onCancel,
  onConfirm,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-fixed" onClick={onCancel}>
      <div 
        className="modal-container modal-container-sm" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="delete-modal-content">
          <div className="delete-modal-icon-circle">
            <Icon icon="mdi:trash-can-outline" size={32} color="#DC2626" />
          </div>
          <h3 className="delete-modal-title">{title}</h3>
          <p className="delete-modal-desc">{description}</p>
        </div>

        <div className="delete-modal-actions">
          <button 
            type="button" 
            className="btn-modal-secondary" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Batal
          </button>
          <button 
            type="button" 
            className="btn-modal-danger" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
