import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { productAPI } from '../services/api';
import { Plus, Pencil, Trash2, X, Search, Package } from 'lucide-react';
import styles from './ProductsPage.module.css';

function Modal({ title, onClose, children }) {
  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const canEdit = ['ADMIN','MANAGER'].includes(user?.role);
  const canDelete = user?.role === 'ADMIN';

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    try { const res = await productAPI.list(); setProducts(res.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function openAdd() { setForm({ name:'', description:'', price:'' }); setEditing(null); setError(''); setModal('form'); }
  function openEdit(p) { setForm({ name:p.name, description:p.description||'', price:String(p.price) }); setEditing(p); setError(''); setModal('form'); }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (editing) {
        const res = await productAPI.update(editing.id, { ...form, price: Number(form.price) });
        setProducts(ps => ps.map(p => p.id === editing.id ? res.data : p));
      } else {
        const res = await productAPI.create({ ...form, price: Number(form.price) });
        setProducts(ps => [...ps, res.data]);
      }
      setModal(null);
    } catch (e) { setError(e.response?.data?.message || 'Failed to save product.'); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    try {
      await productAPI.delete(deleteConfirm.id);
      setProducts(ps => ps.filter(p => p.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (e) { console.error(e); }
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Products</h1>
          <p>Manage your product catalogue</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}><Search size={15} /></span>
            <input className={styles.searchInput} placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {canEdit && (
            <button className={styles.addBtn} onClick={openAdd}><Plus size={16} />Add Product</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}><span className={styles.spinner} /></div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📦</div>
          <h3>{search ? 'No products found' : 'No products yet'}</h3>
          <p>{search ? 'Try a different search term' : 'Add your first product to get started'}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((p, i) => (
            <div key={p.id} className={styles.card} style={{ animationDelay: `${i * 0.04}s` }}>
              <div className={styles.cardTop}>
                <div className={styles.cardIcon}><Package size={18} /></div>
                {canEdit && (
                  <div className={styles.cardActions}>
                    <button className={styles.iconBtn} onClick={() => openEdit(p)} title="Edit"><Pencil size={13} /></button>
                    {canDelete && <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => setDeleteConfirm(p)} title="Delete"><Trash2 size={13} /></button>}
                  </div>
                )}
              </div>
              <div className={styles.cardName}>{p.name}</div>
              <div className={styles.cardDesc}>{p.description || 'No description provided.'}</div>
              <div className={styles.cardPrice}>₹{Number(p.price).toLocaleString('en-IN', { minimumFractionDigits:2 })}<span className={styles.cardPriceSub}>/ unit</span></div>
            </div>
          ))}
        </div>
      )}

      {modal === 'form' && (
        <Modal title={editing ? 'Edit Product' : 'Add Product'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Product Name</label>
              <input className={styles.input} placeholder="e.g. Premium Coffee Beans" value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Description</label>
              <input className={styles.input} placeholder="Brief product description" value={form.description} onChange={e => setForm(f => ({...f, description:e.target.value}))} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Price (₹)</label>
              <input className={styles.input} type="number" step="0.01" min="0" placeholder="0.00" value={form.price} onChange={e => setForm(f => ({...f, price:e.target.value}))} required />
            </div>
            {error && <div className={styles.errorMsg}>⚠ {error}</div>}
            <button className={styles.saveBtn} type="submit" disabled={saving}>
              {saving ? <span className={styles.spinner} /> : (editing ? 'Save Changes' : 'Add Product')}
            </button>
          </form>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal title="" onClose={() => setDeleteConfirm(null)}>
          <div className={styles.deleteModal}>
            <div className={styles.deleteIcon}>🗑️</div>
            <div className={styles.deleteTitle}>Delete Product?</div>
            <div className={styles.deleteDesc}>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.</div>
            <div className={styles.deleteActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className={styles.confirmDeleteBtn} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
