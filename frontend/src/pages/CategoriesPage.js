import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import categoryService from '../services/categoryService';
import transactionService from '../services/transactionService';
import AuthContext from '../context/AuthContext';
import Icon from '../components/Icon';
import EmptyState from '../components/EmptyState';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

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
    return { icon: 'mdi:silverware-fork-knife', bg: '#E8F5EE', color: '#0F5238', tag: 'Kebutuhan Pokok' };
  }
  if (n.includes('trans') || n.includes('bensin') || n.includes('ojek') || n.includes('mobil') || n.includes('motor') || n.includes('kendaraan')) {
    return { icon: 'mdi:car-side', bg: '#FEF3C7', color: '#B45309', tag: 'Operasional' };
  }
  if (n.includes('zakat') || n.includes('infaq') || n.includes('sedekah') || n.includes('donasi') || n.includes('sosial')) {
    return { icon: 'mdi:hand-heart', bg: '#E0F2FE', color: '#0284C7', tag: 'Sosial / Agama' };
  }
  if (n.includes('belanja') || n.includes('shopping') || n.includes('pasar') || n.includes('supermarket') || n.includes('mall')) {
    return { icon: 'mdi:shopping-outline', bg: '#FCE7F3', color: '#DB2777', tag: 'Kebutuhan Pokok' };
  }
  if (n.includes('gaji') || n.includes('salary') || n.includes('upah') || n.includes('honor') || n.includes('income')) {
    return { icon: 'mdi:cash-multiple', bg: '#DCFCE7', color: '#16A34A', tag: 'Penghasilan Utama' };
  }
  if (n.includes('rumah') || n.includes('listrik') || n.includes('air') || n.includes('kos') || n.includes('sewa') || n.includes('wifi')) {
    return { icon: 'mdi:home-outline', bg: '#EDE9FE', color: '#7C3AED', tag: 'Tempat Tinggal / Utilitas' };
  }
  if (n.includes('kesehatan') || n.includes('obat') || n.includes('dokter') || n.includes('medis')) {
    return { icon: 'mdi:medical-bag', bg: '#FEE2E2', color: '#DC2626', tag: 'Kesehatan' };
  }
  if (n.includes('pendidikan') || n.includes('sekolah') || n.includes('kursus') || n.includes('buku')) {
    return { icon: 'mdi:school-outline', bg: '#FEF9C3', color: '#CA8A04', tag: 'Pendidikan' };
  }
  if (n.includes('investasi') || n.includes('reksadana') || n.includes('saham') || n.includes('emas') || n.includes('tabungan')) {
    return { icon: 'mdi:trending-up', bg: '#D1FAE5', color: '#059669', tag: 'Investasi & Masa Depan' };
  }
  if (n.includes('hiburan') || n.includes('wisata') || n.includes('liburan') || n.includes('game') || n.includes('hobi')) {
    return { icon: 'mdi:gamepad-variant-outline', bg: '#F3E8FF', color: '#9333EA', tag: 'Gaya Hidup' };
  }
  const isInc = String(type).toUpperCase() === 'INCOME';
  if (isInc) {
    return { icon: 'mdi:arrow-bottom-left-bold-box-outline', bg: '#E8F5EE', color: '#0F5238', tag: 'Pemasukan' };
  }
  return { icon: 'mdi:tag-outline', bg: '#F3F4F6', color: '#4B5563', tag: 'Pengeluaran' };
};

const CategoriesPage = () => {
  const { user } = useContext(AuthContext);

  // Active tab: 'expense' | 'income'
  const [activeTab, setActiveTab] = useState('expense');
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [modalForm, setModalForm] = useState({
    name: '',
    type: 'expense',
    icon: 'mdi:tag-outline',
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Delete State
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    category: null,
    loading: false,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [catRes, txRes] = await Promise.all([
        categoryService.getCategories(),
        transactionService.getTransactions().catch(() => ({ data: [] })),
      ]);
      setCategories(catRes.data || []);
      setTransactions(txRes.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Gagal memuat daftar kategori.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }

    const handleUpdate = () => fetchData();
    window.addEventListener('halalflow:transaction-updated', handleUpdate);
    return () => {
      window.removeEventListener('halalflow:transaction-updated', handleUpdate);
    };
  }, [user, fetchData]);

  // Filtered categories by active tab (case-insensitive)
  const expenseCategories = useMemo(() => categories.filter((c) => c.type && c.type.toLowerCase() === 'expense'), [categories]);
  const incomeCategories = useMemo(() => categories.filter((c) => c.type && c.type.toLowerCase() === 'income'), [categories]);
  const currentList = activeTab === 'expense' ? expenseCategories : incomeCategories;

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setModalForm({
      name: '',
      type: activeTab,
      icon: 'mdi:tag-outline',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setModalForm({
      name: category.name,
      type: category.type?.toLowerCase() || 'expense',
      icon: category.icon || 'mdi:tag-outline',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!modalForm.name.trim()) {
      setModalError('Nama kategori wajib diisi.');
      return;
    }

    setModalLoading(true);
    setModalError('');
    try {
      const typeToSend = modalForm.type.toUpperCase();
      if (editingCategory) {
        await categoryService.updateCategory(
          editingCategory.id,
          modalForm.name.trim(),
          typeToSend
        );
      } else {
        await categoryService.createCategory(
          modalForm.name.trim(),
          typeToSend
        );
      }
      setIsModalOpen(false);
      fetchData();
      window.dispatchEvent(new CustomEvent('halalflow:transaction-updated'));
    } catch (err) {
      console.error('Category save error:', err);
      setModalError(err.response?.data?.message || 'Gagal menyimpan kategori.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenDelete = (category) => {
    setDeleteModalState({
      isOpen: true,
      category,
      loading: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalState.category) return;
    setDeleteModalState((prev) => ({ ...prev, loading: true }));
    try {
      await categoryService.deleteCategory(deleteModalState.category.id);
      setDeleteModalState({ isOpen: false, category: null, loading: false });
      fetchData();
      window.dispatchEvent(new CustomEvent('halalflow:transaction-updated'));
    } catch (err) {
      console.error('Category delete error:', err);
      setDeleteModalState((prev) => ({ ...prev, loading: false }));
    }
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
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Memuat manajemen kategori...</p>
      </div>
    );
  }

  return (
    <div>
      {/* 1. Header Toolbar */}
      <div className="filter-toolbar" style={{ marginBottom: '24px' }}>
        {/* Segmented Type Tab */}
        <div className="segmented-control">
          <button
            type="button"
            className={`segment-btn ${activeTab === 'expense' ? 'active' : ''}`}
            onClick={() => setActiveTab('expense')}
          >
            Kategori Pengeluaran ({expenseCategories.length})
          </button>
          <button
            type="button"
            className={`segment-btn ${activeTab === 'income' ? 'active' : ''}`}
            onClick={() => setActiveTab('income')}
          >
            Kategori Pemasukan ({incomeCategories.length})
          </button>
        </div>

        <button
          className="btn-primary-header"
          onClick={handleOpenAdd}
        >
          <Icon icon="mdi:plus" size={18} />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {error && (
        <div className="form-error-alert">
          <Icon icon="mdi:alert-circle-outline" size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Category Cards Grid */}
      {currentList.length === 0 ? (
        <EmptyState
          title={`Belum Ada Kategori ${activeTab === 'expense' ? 'Pengeluaran' : 'Pemasukan'}`}
          description={`Buat kategori baru untuk mengelompokkan ${activeTab === 'expense' ? 'pengeluaran' : 'pemasukan'} Anda.`}
          actionLabel="Tambah Kategori Sekarang"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="category-cards-grid">
          {currentList.map((cat) => {
            const isIncome = String(cat.type).toUpperCase() === 'INCOME';
            const iconInfo = getCategoryIconInfo(cat.name, cat.type);
            const catTxs = transactions.filter((t) => String(t.category_id) === String(cat.id));
            const txCount = catTxs.length;
            const totalAmount = catTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

            return (
              <div 
                key={cat.id} 
                className="category-card-compact"
              >
                {/* Top Section: Icon, Title, Actions */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '14px',
                        backgroundColor: iconInfo.bg,
                        color: iconInfo.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      }}
                    >
                      <Icon icon={iconInfo.icon} size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-text-main)', margin: '0 0 3px 0', lineHeight: 1.2 }}>
                        {cat.name}
                      </h3>
                      <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', display: 'block' }}>
                        {txCount > 0 ? `${txCount} Transaksi • Total ${formatRupiah(totalAmount)}` : '0 Transaksi bulan ini'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      className="action-icon-btn"
                      onClick={() => handleOpenEdit(cat)}
                      title="Edit kategori"
                    >
                      <Icon icon="mdi:pencil-outline" size={17} />
                    </button>
                    <button
                      className="action-icon-btn delete"
                      onClick={() => handleOpenDelete(cat)}
                      title="Hapus kategori"
                    >
                      <Icon icon="mdi:trash-can-outline" size={17} />
                    </button>
                  </div>
                </div>

                {/* Bottom Row: Tag Badge & Flow Type */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--color-border-light)' }}>
                  <span 
                    style={{ 
                      fontSize: '0.72rem', 
                      fontWeight: 600, 
                      padding: '3px 9px', 
                      borderRadius: '999px',
                      backgroundColor: iconInfo.bg,
                      color: iconInfo.color,
                      border: `1px solid ${iconInfo.color}30`,
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}
                  >
                    {iconInfo.tag}
                  </span>
                  <span style={{ fontSize: '0.76rem', fontWeight: 600, color: isIncome ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                    {isIncome ? '+ Pemasukan' : '- Pengeluaran'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="modal-backdrop-fixed" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-container modal-container-sm"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <div className="modal-title-box">
                <Icon
                  icon={editingCategory ? 'mdi:pencil-box-outline' : 'mdi:tag-plus-outline'}
                  size={22}
                  color="var(--color-primary-container)"
                />
                <h2 className="modal-title">{editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Tutup"
              >
                <Icon icon="mdi:close" size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory}>
              <div className="modal-body">
                {modalError && (
                  <div className="form-error-alert">
                    <Icon icon="mdi:alert-circle-outline" size={18} />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* Type Switcher */}
                <div className="transaction-type-switcher">
                  <button
                    type="button"
                    className={`type-switch-btn expense ${modalForm.type === 'expense' ? 'active' : ''}`}
                    onClick={() => setModalForm((prev) => ({ ...prev, type: 'expense' }))}
                  >
                    <Icon icon="mdi:arrow-down-bold" size={16} />
                    <span>Pengeluaran</span>
                  </button>
                  <button
                    type="button"
                    className={`type-switch-btn income ${modalForm.type === 'income' ? 'active' : ''}`}
                    onClick={() => setModalForm((prev) => ({ ...prev, type: 'income' }))}
                  >
                    <Icon icon="mdi:arrow-up-bold" size={16} />
                    <span>Pemasukan</span>
                  </button>
                </div>

                {/* Category Name Input */}
                <div className="form-group">
                  <label className="form-label">NAMA KATEGORI</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Makanan, Transportasi, Gaji..."
                    value={modalForm.name}
                    onChange={(e) => setModalForm((prev) => ({ ...prev, name: e.target.value }))}
                    autoFocus
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-modal-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-modal-primary"
                  disabled={modalLoading}
                >
                  <Icon icon="mdi:check" size={18} />
                  <span>{modalLoading ? 'Menyimpan...' : 'Simpan Kategori'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Hapus Kategori?"
        message={`Apakah Anda yakin ingin menghapus kategori "${deleteModalState.category?.name}"? Transaksi yang terkait dengan kategori ini tidak akan dihapus, tetapi kategorinya akan diatur ke umum.`}
        confirmLabel="Hapus Kategori"
        loading={deleteModalState.loading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalState({ isOpen: false, category: null, loading: false })}
      />
    </div>
  );
};

export default CategoriesPage;
