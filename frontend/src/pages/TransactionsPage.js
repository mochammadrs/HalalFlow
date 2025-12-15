import React, { useState, useEffect, useContext } from 'react';
import transactionService from '../services/transactionService';
import categoryService from '../services/categoryService';
import AuthContext from '../context/AuthContext';
import Icon from '../components/Icon';

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

const TransactionsPage = () => {
  const { user } = useContext(AuthContext);
  
  // State untuk transaksi
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State untuk form
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    type: 'EXPENSE'
  });
  
  // State untuk filter
  const [filterType, setFilterType] = useState('ALL');
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, categoriesRes] = await Promise.all([
        transactionService.getTransactions(),
        categoryService.getCategories()
      ]);
      
      setTransactions(transactionsRes.data || []);
      setCategories(categoriesRes.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Gagal mengambil data:', err);
      setError('Gagal memuat data. Silakan coba lagi.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      category_id: '',
      type: 'EXPENSE'
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.amount || !formData.date || !formData.category_id) {
      setError('Harap isi semua field yang wajib.');
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingId) {
        // Update transaksi
        const response = await transactionService.updateTransaction(
          editingId,
          formData.date,
          parseFloat(formData.amount),
          formData.type,
          parseInt(formData.category_id),
          formData.description
        );
        
        setTransactions(prev =>
          prev.map(t => t.id === editingId ? response.data : t)
        );
      } else {
        // Buat transaksi baru
        const response = await transactionService.createTransaction(
          formData.date,
          parseFloat(formData.amount),
          formData.type,
          parseInt(formData.category_id),
          formData.description
        );
        
        setTransactions(prev => [response.data, ...prev]);
      }

      resetForm();
      setIsSubmitting(false);
    } catch (err) {
      console.error('Gagal menyimpan transaksi:', err);
      setError(err.response?.data?.message || 'Gagal menyimpan transaksi.');
      setIsSubmitting(false);
    }
  };

  const handleEdit = (transaction) => {
    setFormData({
      amount: transaction.amount.toString(),
      description: transaction.description || '',
      date: transaction.date.split('T')[0],
      category_id: transaction.category_id.toString(),
      type: transaction.type
    });
    setEditingId(transaction.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      return;
    }

    try {
      await transactionService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Gagal menghapus transaksi:', err);
      setError('Gagal menghapus transaksi.');
    }
  };

  // Filter transaksi
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const transactionMonth = transactionDate.getMonth() + 1;
    const transactionYear = transactionDate.getFullYear();
    
    const matchType = filterType === 'ALL' || t.type === filterType;
    const matchMonth = filterMonth === 0 || transactionMonth === parseInt(filterMonth);
    const matchYear = transactionYear === parseInt(filterYear);
    
    return matchType && matchMonth && matchYear;
  });

  // Hitung total
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  if (loading && user) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem' }}>Memuat transaksi...</p>
      </div>
    );
  }

  if (!user) {
    return <div className="info">Silakan login untuk melihat halaman ini.</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Icon icon="mdi:wallet" size={28} />
            Transaksi Keuangan
          </h1>
          <p style={{ color: 'var(--color-text)', opacity: 0.8, margin: '0.5rem 0 0 0' }}>
            Kelola semua pemasukan dan pengeluaran Anda.
          </p>
        </div>
        
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Icon icon={showForm ? "mdi:close" : "mdi:plus"} size={18} />
          {showForm ? 'Tutup' : 'Transaksi Baru'}
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon icon={editingId ? "mdi:pencil" : "mdi:plus-circle"} size={20} />
              {editingId ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="form-standard">
            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">
                  <Icon icon="mdi:alert-circle" size={20} />
                </span>
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-2">
              <div className="form-group">
                <label htmlFor="type">Tipe Transaksi *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="EXPENSE">Pengeluaran</option>
                  <option value="INCOME">Pemasukan</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="amount">Jumlah (IDR) *</label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Contoh: 50000"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label htmlFor="category_id">Kategori *</label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {categories
                    .filter(cat => cat.type === formData.type)
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="date">Tanggal *</label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Deskripsi (Opsional)</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Contoh: Belanja bulanan di supermarket"
                rows="3"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ flex: 1 }}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-mini"></span>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:check" size={18} style={{ marginRight: '0.5rem' }} />
                    {editingId ? 'Update Transaksi' : 'Simpan Transaksi'}
                  </>
                )}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Filter Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon icon="mdi:filter" size={20} color="var(--color-primary)" />
            <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>Filter:</span>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="custom-select"
          >
            <option value="ALL">Semua Tipe</option>
            <option value="INCOME">Pemasukan</option>
            <option value="EXPENSE">Pengeluaran</option>
          </select>

          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(parseInt(e.target.value))}
            className="custom-select"
          >
            <option value="0">Semua Bulan</option>
            <option value="1">Januari</option>
            <option value="2">Februari</option>
            <option value="3">Maret</option>
            <option value="4">April</option>
            <option value="5">Mei</option>
            <option value="6">Juni</option>
            <option value="7">Juli</option>
            <option value="8">Agustus</option>
            <option value="9">September</option>
            <option value="10">Oktober</option>
            <option value="11">November</option>
            <option value="12">Desember</option>
          </select>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(parseInt(e.target.value))}
            className="custom-select"
          >
            <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
            <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
            <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
        <div className="summary-card" style={{ background: 'linear-gradient(135deg, #28A745 0%, #20803a 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon icon="mdi:arrow-down-bold-circle" size={24} color="#fff" />
            <h3 style={{ color: '#fff' }}>Pemasukan</h3>
          </div>
          <div className="value" style={{ color: '#fff' }}>{formatRupiah(totalIncome)}</div>
        </div>

        <div className="summary-card" style={{ background: 'linear-gradient(135deg, #DC3545 0%, #b02a37 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon icon="mdi:arrow-up-bold-circle" size={24} color="#fff" />
            <h3 style={{ color: '#fff' }}>Pengeluaran</h3>
          </div>
          <div className="value" style={{ color: '#fff' }}>{formatRupiah(totalExpense)}</div>
        </div>

        <div className="summary-card" style={{ background: 'linear-gradient(135deg, #2D6A4F 0%, #1e4a37 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon icon="mdi:wallet" size={24} color="#fff" />
            <h3 style={{ color: '#fff' }}>Saldo</h3>
          </div>
          <div className="value" style={{ color: '#fff' }}>{formatRupiah(totalIncome - totalExpense)}</div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon icon="mdi:format-list-bulleted" size={20} />
            Daftar Transaksi ({filteredTransactions.length})
          </h3>
        </div>

        {filteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', opacity: 0.7 }}>
            <Icon icon="mdi:file-document-outline" size={48} color="var(--color-text)" />
            <p style={{ marginTop: '1rem', fontSize: '1rem' }}>
              {transactions.length === 0
                ? 'Belum ada transaksi. Klik tombol "Transaksi Baru" untuk menambah.'
                : 'Tidak ada transaksi yang sesuai dengan filter.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Tipe</th>
                  <th>Kategori</th>
                  <th>Deskripsi</th>
                  <th style={{ textAlign: 'right' }}>Jumlah</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {formatDate(transaction.date)}
                    </td>
                    <td>
                      <span className={`badge ${transaction.type === 'INCOME' ? 'badge-success' : 'badge-error'}`}>
                        {transaction.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>
                    <td>{transaction.category_name || '-'}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {transaction.description || '-'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '600', color: transaction.type === 'INCOME' ? 'var(--color-success)' : 'var(--color-error)' }}>
                      {formatRupiah(transaction.amount)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="btn-icon"
                          title="Edit"
                        >
                          <Icon icon="mdi:pencil" size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="btn-icon btn-icon-danger"
                          title="Hapus"
                        >
                          <Icon icon="mdi:delete" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
