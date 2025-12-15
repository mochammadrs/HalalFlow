import React, { useState, useEffect, useContext } from 'react';
import categoryService from '../services/categoryService';
import AuthContext from '../context/AuthContext';
import Icon from '../components/Icon';

const CategoriesPage = () => {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();
      setCategories(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Gagal mengambil kategori:', err);
      setError('Gagal mengambil data kategori.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Nama kategori tidak boleh kosong.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newCategory = await categoryService.createCategory(name, type);
      
      setCategories([...categories, newCategory.data]);
      setName('');
      setType('EXPENSE');
      setIsSubmitting(false);
    } catch (err) {
      console.error('Gagal membuat kategori:', err);
      setError(err.response?.data?.message || 'Gagal membuat kategori.');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      return;
    }

    try {
      await categoryService.deleteCategory(id);
      setCategories(categories.filter(cat => cat.id !== id));
    } catch (err) {
      console.error('Gagal menghapus kategori:', err);
      setError('Gagal menghapus kategori.');
    }
  };

  if (loading && user) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem' }}>Memuat kategori...</p>
      </div>
    );
  }

  if (!user) {
    return <div className="info">Silakan login untuk melihat halaman ini.</div>;
  }

  return (
    <div>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Icon icon="mdi:folder-multiple" size={28} />
        Manajemen Kategori
      </h1>
      <p style={{ color: 'var(--color-text)', opacity: 0.8 }}>
        Kelola kategori pemasukan dan pengeluaran Anda.
      </p>

      <div className="grid grid-2" style={{ marginTop: '2rem' }}>
        {/* Form Section */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon icon="mdi:plus-circle" size={20} />
              Buat Kategori Baru
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="form-standard">
            {error && <div className="alert alert-error"><span className="alert-icon"><Icon icon="mdi:alert-circle" size={20} /></span><span>{error}</span></div>}

            <div className="form-group">
              <label htmlFor="name">Nama Kategori</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Makanan, Transportasi, dll"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Tipe</label>
              <select 
                id="type"
                value={type} 
                onChange={(e) => setType(e.target.value)}
              >
                <option value="EXPENSE">Pengeluaran</option>
                <option value="INCOME">Pemasukan</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%' }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-mini"></span>
                  Menambah...
                </>
              ) : (
                <>
                  <Icon icon="mdi:check" size={18} style={{ marginRight: '0.5rem' }} />
                  Tambah Kategori
                </>
              )}
            </button>
          </form>
        </div>

        {/* Categories List Section */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon icon="mdi:list" size={20} />
              Daftar Kategori ({categories.length})
            </h3>
          </div>

          {categories.length === 0 ? (
            <p style={{ color: 'var(--color-text)', opacity: 0.7, textAlign: 'center' }}>
              Anda belum memiliki kategori. Buat kategori pertama Anda!
            </p>
          ) : (
            <div>
              {/* Expense Categories */}
              {categories.filter(c => c.type === 'EXPENSE').length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: '#DC3545', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: '600' }}>
                    <Icon icon="mdi:arrow-top-right" size={20} />
                    Pengeluaran
                  </h4>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {categories.filter(c => c.type === 'EXPENSE').map((category) => (
                      <div 
                        key={category.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1rem',
                          backgroundColor: 'var(--color-bg)',
                          borderRadius: '6px',
                          borderLeft: '4px solid #DC3545',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                      >
                        <span style={{ fontWeight: '500', color: 'var(--color-text)' }}>{category.name}</span>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="btn btn-outline"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        >
                          <Icon icon="mdi:trash-can" size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Income Categories */}
              {categories.filter(c => c.type === 'INCOME').length > 0 && (
                <div>
                  <h4 style={{ color: '#28A745', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: '600' }}>
                    <Icon icon="mdi:arrow-bottom-left" size={20} />
                    Pemasukan
                  </h4>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {categories.filter(c => c.type === 'INCOME').map((category) => (
                      <div 
                        key={category.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1rem',
                          backgroundColor: 'var(--color-bg)',
                          borderRadius: '6px',
                          borderLeft: '4px solid #28A745',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                      >
                        <span style={{ fontWeight: '500', color: 'var(--color-text)' }}>{category.name}</span>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="btn btn-outline"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        >
                          <Icon icon="mdi:trash-can" size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
