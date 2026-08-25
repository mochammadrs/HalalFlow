import React, { useState, useEffect } from 'react';
import categoryService from '../services/categoryService';
import Icon from './Icon';

const TransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isEditing = false,
}) => {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [rawAmount, setRawAmount] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch categories
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Set initial data if editing
  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'expense');
      const numAmount = initialData.amount ? Math.round(Number(initialData.amount)) : 0;
      setRawAmount(numAmount);
      setAmount(numAmount ? numAmount.toLocaleString('id-ID') : '');
      setCategoryId(initialData.category_id || '');
      setDate(
        initialData.date
          ? new Date(initialData.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setDescription(initialData.description || '');
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories in modal:', err);
    }
  };

  const resetForm = () => {
    setType('expense');
    setAmount('');
    setRawAmount(0);
    setCategoryId('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setError('');
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (!value) {
      setAmount('');
      setRawAmount(0);
      return;
    }
    const num = parseInt(value, 10);
    setRawAmount(num);
    setAmount(num.toLocaleString('id-ID'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!rawAmount || rawAmount <= 0) {
      setError('Nominal transaksi harus lebih dari 0');
      return;
    }

    if (!categoryId) {
      setError('Pilih kategori transaksi');
      return;
    }

    if (!date) {
      setError('Tanggal transaksi harus diisi');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        amount: rawAmount,
        type: type.toUpperCase(),
        category_id: categoryId,
        date,
        description,
      });
      onClose();
      resetForm();
    } catch (err) {
      console.error('Submit transaction error:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Gagal menyimpan transaksi'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Filter categories by type (case-insensitive)
  const filteredCategories = categories.filter((c) => c.type && c.type.toLowerCase() === type.toLowerCase());

  return (
    <div className="modal-backdrop-fixed" onClick={onClose}>
      <div 
        className="modal-container modal-container-md" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <Icon icon={isEditing ? 'mdi:pencil-box-outline' : 'mdi:plus-circle-outline'} size={22} color="var(--color-primary-container)" />
            <h2 className="modal-title">{isEditing ? 'Edit Transaksi' : 'Catat Transaksi'}</h2>
          </div>
          <button 
            type="button" 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Tutup"
          >
            <Icon icon="mdi:close" size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="form-error-alert">
                <Icon icon="mdi:alert-circle-outline" size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Type Switcher */}
            <div className="transaction-type-switcher">
              <button
                type="button"
                className={`type-switch-btn expense ${type === 'expense' ? 'active' : ''}`}
                onClick={() => {
                  setType('expense');
                  setCategoryId('');
                }}
              >
                <Icon icon="mdi:arrow-down-bold" size={16} />
                <span>Pengeluaran</span>
              </button>
              <button
                type="button"
                className={`type-switch-btn income ${type === 'income' ? 'active' : ''}`}
                onClick={() => {
                  setType('income');
                  setCategoryId('');
                }}
              >
                <Icon icon="mdi:arrow-up-bold" size={16} />
                <span>Pemasukan</span>
              </button>
            </div>

            {/* Large Amount Field */}
            <div className="amount-input-container">
              <label className="amount-label">NOMINAL TRANSAKSI</label>
              <div className="amount-input-box">
                <span className="currency-prefix">Rp</span>
                <input
                  type="text"
                  className="amount-input"
                  placeholder="0"
                  value={amount}
                  onChange={handleAmountChange}
                  autoFocus
                />
              </div>
            </div>

            {/* Grid fields */}
            <div className="form-grid-2col">
              {/* Category selector */}
              <div className="form-group">
                <label className="form-label">Kategori *</label>
                <select
                  className="form-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">Pilih Kategori...</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="form-group">
                <label className="form-label">Tanggal Transaksi *</label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Notes / Description */}
            <div className="form-group">
              <label className="form-label">Catatan / Deskripsi (Opsional)</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Contoh: Belanja mingguan, Sedekah subuh, Gaji bulanan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-modal-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-modal-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Icon icon="mdi:loading" size={18} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Icon icon="mdi:check" size={18} />
                  <span>{isEditing ? 'Perbarui Transaksi' : 'Simpan Transaksi'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
