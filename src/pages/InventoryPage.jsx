import React, { useState, useEffect } from 'react';
import { inventoryAPI, productAPI } from '../services/api';
import { Plus, Pencil, Layers, AlertTriangle, Search, X } from 'lucide-react';
import styles from './InventoryPage.module.css';

function Modal({ title, onClose, children }) {
  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}><X size={15} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ productId:'', quantity:'' });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [inv, prod] = await Promise.all([inventoryAPI.list(), productAPI.list()]);
      setInventory(inv.data); setProducts(prod.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function openAdd() { setForm({ productId:'', quantity:'' }); setEditing(null); setError(''); setModal('form'); }
  function openEdit(item) { setForm({ productId:String(item.product?.id||''), quantity:String(item.quantity) }); setEditing(item); setError(''); setModal('form'); }

  async function handleSave(e) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (editing) {
        const res = await inventoryAPI.update(editing.product.id, { productId:Number(form.productId), quantity:Number(form.quantity) });
        setInventory(inv => inv.map(i => i.id === editing.id ? res.data : i));
      } else {
        await inventoryAPI.create({ productId:Number(form.productId), quantity:Number(form.quantity) });
        const updated = await inventoryAPI.list(); setInventory(updated.data);
      }
      setModal(null);
    } catch (e) { setError(e.response?.data?.message || 'Failed to save inventory.'); }
    finally { setSaving(false); }
  }

  const getStatus = (qty) => {
    if (qty === 0) return { label:'Out of Stock', cls:styles.statusOut };
    if (qty < 10) return { label:'Low Stock', cls:styles.statusLow };
    return { label:'In Stock', cls:styles.statusIn };
  };

  const filtered = inventory.filter(i => (i.product?.name||'').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Inventory</h1>
          <p>Track and manage stock levels</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}><Search size={15} /></span>
            <input className={styles.searchInput} placeholder="Search inventory…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className={styles.addBtn} onClick={openAdd}><Plus size={16} />Add Stock</button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}><span className={styles.spinner} /></div>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className={styles.empty}><p>No inventory items found.</p></td></tr>
              ) : filtered.map(item => {
                const status = getStatus(item.quantity);
                return (
                  <tr key={item.id}>
                    <td><span className={styles.productName}>{item.product?.name || '—'}</span></td>
                    <td><span className={styles.qtyBig}>{item.quantity}</span></td>
                    <td><span className={`${styles.statusBadge} ${status.cls}`}>{status.label}</span></td>
                    <td>
                      <button className={styles.editBtn} onClick={() => openEdit(item)} title="Edit"><Pencil size={13} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal === 'form' && (
        <Modal title={editing ? 'Update Stock' : 'Add Stock'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Product</label>
              <select className={styles.select} value={form.productId} onChange={e => setForm(f => ({...f, productId:e.target.value}))} required disabled={!!editing}>
                <option value="">Select a product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Quantity</label>
              <input className={styles.input} type="number" min="0" placeholder="0" value={form.quantity} onChange={e => setForm(f => ({...f, quantity:e.target.value}))} required />
            </div>
            {error && <div className={styles.errorMsg}>⚠ {error}</div>}
            <button className={styles.saveBtn} type="submit" disabled={saving}>
              {saving ? <span className={styles.spinner} /> : (editing ? 'Update Stock' : 'Add Stock')}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
