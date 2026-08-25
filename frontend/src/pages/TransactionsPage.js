import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import transactionService from '../services/transactionService';
import categoryService from '../services/categoryService';
import AuthContext from '../context/AuthContext';
import Icon from '../components/Icon';
import EmptyState from '../components/EmptyState';
import TransactionModal from '../components/TransactionModal';
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

const TransactionsPage = () => {
  const { user } = useContext(AuthContext);

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'income' | 'expense'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    transaction: null,
    loading: false,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [txRes, catRes] = await Promise.all([
        transactionService.getTransactions(),
        categoryService.getCategories(),
      ]);
      setTransactions(txRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Gagal memuat daftar transaksi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }

    // Auto-refresh when transaction is created/edited globally
    const handleTxUpdate = () => fetchData();
    window.addEventListener('halalflow:transaction-updated', handleTxUpdate);
    return () => {
      window.removeEventListener('halalflow:transaction-updated', handleTxUpdate);
    };
  }, [user, fetchData]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Filter by type
      if (filterType !== 'ALL' && tx.type.toLowerCase() !== filterType.toLowerCase()) {
        return false;
      }

      // Filter by category
      if (selectedCategory !== 'ALL' && String(tx.category_id) !== String(selectedCategory)) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const descMatch = tx.description?.toLowerCase().includes(query);
        const catMatch = tx.category_name?.toLowerCase().includes(query);
        if (!descMatch && !catMatch) return false;
      }

      return true;
    });
  }, [transactions, filterType, selectedCategory, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  // Stats calculation
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((tx) => {
      const amount = Number(tx.amount) || 0;
      const isInc = String(tx.type).toUpperCase() === 'INCOME';
      if (isInc) income += amount;
      else expense += amount;
    });
    return {
      totalCount: filteredTransactions.length,
      income,
      expense,
      balance: income - expense,
    };
  }, [filteredTransactions]);

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (formData) => {
    if (editingTransaction) {
      await transactionService.updateTransaction(
        editingTransaction.id,
        formData.date,
        formData.amount,
        formData.type,
        formData.category_id,
        formData.description
      );
    } else {
      await transactionService.createTransaction(
        formData.date,
        formData.amount,
        formData.type,
        formData.category_id,
        formData.description
      );
    }
    await fetchData();
    window.dispatchEvent(new CustomEvent('halalflow:transaction-updated'));
  };

  const handleOpenDelete = (tx) => {
    setDeleteModalState({
      isOpen: true,
      transaction: tx,
      loading: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalState.transaction) return;
    setDeleteModalState((prev) => ({ ...prev, loading: true }));
    try {
      await transactionService.deleteTransaction(deleteModalState.transaction.id);
      setDeleteModalState({ isOpen: false, transaction: null, loading: false });
      await fetchData();
      window.dispatchEvent(new CustomEvent('halalflow:transaction-updated'));
    } catch (err) {
      console.error('Delete transaction error:', err);
      setDeleteModalState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('Tidak ada data transaksi untuk diekspor.');
      return;
    }

    const headers = ['Tanggal', 'Deskripsi', 'Kategori', 'Tipe', 'Nominal'];
    const rows = filteredTransactions.map((tx) => [
      `"${new Date(tx.date).toISOString().split('T')[0]}"`,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
      `"${(tx.category_name || 'Umum').replace(/"/g, '""')}"`,
      `"${String(tx.type).toUpperCase() === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}"`,
      tx.amount,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Transaksi_HalalFlow_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && transactions.length === 0) {
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
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Memuat riwayat transaksi...</p>
      </div>
    );
  }

  return (
    <div>
      {/* 1. Summary Quick Cards */}
      <div className="tx-stats-grid">
        <div className="tx-stat-card">
          <span className="tx-stat-label">TOTAL TRANSAKSI</span>
          <div className="tx-stat-value">
            {stats.totalCount} <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>data</span>
          </div>
        </div>
        <div className="tx-stat-card">
          <span className="tx-stat-label">PEMASUKAN TERFILTER</span>
          <div className="tx-stat-value" style={{ color: 'var(--color-success)' }}>
            {formatRupiah(stats.income)}
          </div>
        </div>
        <div className="tx-stat-card">
          <span className="tx-stat-label">PENGELUARAN TERFILTER</span>
          <div className="tx-stat-value" style={{ color: 'var(--color-error)' }}>
            {formatRupiah(stats.expense)}
          </div>
        </div>
        <div className="tx-stat-card">
          <span className="tx-stat-label">SELISIH KAS</span>
          <div className="tx-stat-value" style={{ color: stats.balance >= 0 ? 'var(--color-primary)' : 'var(--color-error)' }}>
            {formatRupiah(stats.balance)}
          </div>
        </div>
      </div>

      {/* 2. Filter Toolbar */}
      <div className="filter-toolbar">
        {/* Segmented Type Filter */}
        <div className="segmented-control">
          <button
            type="button"
            className={`segment-btn ${filterType === 'ALL' ? 'active' : ''}`}
            onClick={() => { setFilterType('ALL'); setCurrentPage(1); }}
          >
            Semua
          </button>
          <button
            type="button"
            className={`segment-btn ${filterType === 'expense' ? 'active' : ''}`}
            onClick={() => { setFilterType('expense'); setCurrentPage(1); }}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            className={`segment-btn ${filterType === 'income' ? 'active' : ''}`}
            onClick={() => { setFilterType('income'); setCurrentPage(1); }}
          >
            Pemasukan
          </button>
        </div>

        {/* Filter by Category & Search */}
        <div className="filter-actions">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => {
              const isInc = String(c.type).toUpperCase() === 'INCOME';
              return (
                <option key={c.id} value={c.id}>
                  {c.name} ({isInc ? 'Pemasukan' : 'Pengeluaran'})
                </option>
              );
            })}
          </select>

          <div className="search-input-box">
            <Icon icon="mdi:magnify" size={18} className="search-icon-inside" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <button
            type="button"
            className="btn-modal-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem', height: '40px' }}
            onClick={handleExportCSV}
            title="Download file CSV laporan transaksi"
          >
            <Icon icon="mdi:file-download-outline" size={18} />
            <span>Ekspor CSV</span>
          </button>

          <button
            className="btn-primary-header"
            onClick={handleOpenAdd}
          >
            <Icon icon="mdi:plus" size={18} />
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="form-error-alert">
          <Icon icon="mdi:alert-circle-outline" size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 3. Transaction Data Table */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          title="Tidak Ada Transaksi Ditemukan"
          description={searchQuery || filterType !== 'ALL' || selectedCategory !== 'ALL'
            ? 'Tidak ada transaksi yang cocok dengan kriteria filter saat ini.'
            : 'Mulai catat transaksi pemasukan atau pengeluaran Anda.'}
          actionLabel="+ Tambah Transaksi"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="table-container">
          <table className="custom-data-table">
            <thead>
              <tr>
                <th>TANGGAL</th>
                <th>DESKRIPSI & KATEGORI</th>
                <th>TIPE</th>
                <th>NOMINAL</th>
                <th style={{ textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((tx) => {
                const isIncome = String(tx.type).toUpperCase() === 'INCOME';
                const dateObj = new Date(tx.date);
                const formattedDate = new Intl.DateTimeFormat('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                }).format(dateObj);

                return (
                  <tr key={tx.id}>
                    <td style={{ whiteSpace: 'nowrap', fontWeight: 500, color: 'var(--color-text-main)' }}>
                      {formattedDate}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: isIncome ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                            color: isIncome ? 'var(--color-success)' : 'var(--color-error)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Icon icon={isIncome ? 'mdi:arrow-down' : 'mdi:arrow-up'} size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
                            {tx.description || tx.category_name || '-'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            Kategori: {tx.category_name || 'Umum'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`table-badge ${isIncome ? 'income' : 'expense'}`}>
                        {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>
                      <span style={{ color: isIncome ? 'var(--color-success)' : 'var(--color-text-main)' }}>
                        {isIncome ? '+' : '-'} {formatRupiah(tx.amount)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button
                          className="action-icon-btn"
                          onClick={() => handleOpenEdit(tx)}
                          title="Edit transaksi"
                        >
                          <Icon icon="mdi:pencil-outline" size={18} />
                        </button>
                        <button
                          className="action-icon-btn delete"
                          onClick={() => handleOpenDelete(tx)}
                          title="Hapus transaksi"
                        >
                          <Icon icon="mdi:trash-can-outline" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Table Pagination Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderTop: '1px solid var(--color-border-light)',
            fontSize: '0.85rem',
            color: 'var(--color-text-muted)'
          }}>
            <div>
              Menampilkan {Math.min((currentPage - 1) * itemsPerPage + 1, filteredTransactions.length)} - {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} dari {filteredTransactions.length} transaksi
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn-modal-secondary"
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                ← Sebelumnya
              </button>
              <button
                className="btn-modal-secondary"
                style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Berikutnya →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTransaction}
        initialData={editingTransaction}
        isEditing={!!editingTransaction}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Hapus Transaksi Ini?"
        description={`Tindakan ini tidak dapat dibatalkan. Transaksi sebesar ${formatRupiah(deleteModalState.transaction?.amount)} (${deleteModalState.transaction?.description || deleteModalState.transaction?.category_name}) akan dihapus secara permanen.`}
        onCancel={() => setDeleteModalState({ isOpen: false, transaction: null, loading: false })}
        onConfirm={handleConfirmDelete}
        isLoading={deleteModalState.loading}
      />
    </div>
  );
};

export default TransactionsPage;
