import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { Plus, Trash2, X, Users, ShieldCheck, User, UserCheck } from 'lucide-react';
import styles from './UsersPage.module.css';

const ROLE_META = {
  ADMIN:   { label: 'Admin',   icon: '👑', cls: 'admin'   },
  MANAGER: { label: 'Manager', icon: '🧑‍💼', cls: 'manager' },
  CASHIER: { label: 'Cashier', icon: '🧑‍💻', cls: 'cashier' },
};

function Modal({ onClose, children }) {
  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>{children}</div>
    </div>
  );
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null); // 'add' | 'delete'
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm]           = useState({ username: '', password: '', role: 'MANAGER' });
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try {
      const res = await userAPI.list();
      setUsers(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function openAdd() {
    setForm({ username: '', password: '', role: 'MANAGER' });
    setError(''); setSuccess('');
    setModal('add');
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await userAPI.create({
        username: form.username,
        password: form.password,
        role: form.role,
        tenantId: currentUser.tenantId,
      });
      setSuccess(`${ROLE_META[form.role].label} "${form.username}" created successfully!`);
      setModal(null);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await userAPI.delete(deleteTarget.id);
      setUsers(u => u.filter(x => x.id !== deleteTarget.id));
      setDeleteTarget(null); setModal(null);
    } catch (e) {
      console.error(e);
    }
  }

  const stats = {
    total:   users.length,
    admins:  users.filter(u => u.role === 'ADMIN').length,
    managers:users.filter(u => u.role === 'MANAGER').length,
    cashiers:users.filter(u => u.role === 'CASHIER').length,
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>User Management</h1>
          <p>Create and manage your store team members</p>
        </div>
        <button className={styles.addBtn} onClick={openAdd}>
          <Plus size={16} /> Add Team Member
        </button>
      </div>

      {/* Success banner */}
      {success && (
        <div className={styles.successBanner}>
          <span>✅ {success}</span>
          <button onClick={() => setSuccess('')}><X size={14} /></button>
        </div>
      )}

      {/* Stats */}
      <div className={styles.statsRow}>
        {[
          { label: 'Total Users', value: stats.total, icon: <Users size={18} />, color: 'blue' },
          { label: 'Admins',      value: stats.admins,   icon: <ShieldCheck size={18} />, color: 'purple' },
          { label: 'Managers',    value: stats.managers, icon: <UserCheck size={18} />,   color: 'green' },
          { label: 'Cashiers',    value: stats.cashiers, icon: <User size={18} />,         color: 'amber' },
        ].map((s, i) => (
          <div key={s.label} className={`${styles.statCard} ${styles[s.color]}`}
            style={{ animationDelay: `${i * 0.07}s` }}>
            <div className={styles.statIcon}>{s.icon}</div>
            <div className={styles.statBody}>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      {loading ? (
        <div className={styles.loading}><span className={styles.spinner} /></div>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Role</th>
                <th>Store</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={5} className={styles.empty}>No users found.</td></tr>
              ) : users.map((u, i) => {
                const meta = ROLE_META[u.role] || ROLE_META.CASHIER;
                const isMe = u.username === currentUser?.username;
                return (
                  <tr key={u.id} className={styles.row}>
                    <td className={styles.rowNum}>{i + 1}</td>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.userAvatar}>{u.username[0].toUpperCase()}</div>
                        <div>
                          <div className={styles.userName}>{u.username}</div>
                          {isMe && <span className={styles.youBadge}>You</span>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.roleBadge} ${styles[meta.cls]}`}>
                        {meta.icon} {meta.label}
                      </span>
                    </td>
                    <td className={styles.tenantCell}>{u.tenantName || '—'}</td>
                    <td>
                      {isMe ? (
                        <span className={styles.selfNote}>Cannot delete yourself</span>
                      ) : u.role === 'ADMIN' ? (
                        <span className={styles.selfNote}>Admin protected</span>
                      ) : (
                        <button
                          className={styles.deleteBtn}
                          onClick={() => { setDeleteTarget(u); setModal('delete'); }}
                          title={`Delete ${u.username}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── ADD USER MODAL ── */}
      {modal === 'add' && (
        <Modal onClose={() => setModal(null)}>
          <div className={styles.modalHeader}>
            <div>
              <h3 className={styles.modalTitle}>Add Team Member</h3>
              <p className={styles.modalSub}>Create a new Manager or Cashier for your store</p>
            </div>
            <button className={styles.closeBtn} onClick={() => setModal(null)}><X size={16} /></button>
          </div>

          {/* Role picker */}
          <div className={styles.rolePicker}>
            {['MANAGER', 'CASHIER'].map(r => (
              <button
                key={r}
                className={`${styles.rolePickBtn} ${form.role === r ? styles.rolePickActive : ''}`}
                onClick={() => setForm(f => ({ ...f, role: r }))}
                type="button"
              >
                <span className={styles.rolePickIcon}>{ROLE_META[r].icon}</span>
                <span className={styles.rolePickLabel}>{ROLE_META[r].label}</span>
                <span className={styles.rolePickDesc}>
                  {r === 'MANAGER' ? 'Products, Inventory, Orders, Billing' : 'Products & Billing only'}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleCreate} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Username</label>
              <input
                className={styles.input}
                type="text"
                placeholder={`e.g. ${form.role === 'MANAGER' ? 'manager1' : 'cashier1'}`}
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
                autoFocus
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input
                className={styles.input}
                type="password"
                placeholder="Set a strong password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
              />
              <span className={styles.fieldHint}>Minimum 6 characters</span>
            </div>

            {error && <div className={styles.errorBox}>⚠ {error}</div>}

            <button className={styles.saveBtn} type="submit" disabled={saving}>
              {saving ? <span className={styles.spinner} /> : (
                <>
                  <Plus size={16} />
                  Create {ROLE_META[form.role].label}
                </>
              )}
            </button>
          </form>
        </Modal>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {modal === 'delete' && deleteTarget && (
        <Modal onClose={() => { setModal(null); setDeleteTarget(null); }}>
          <div className={styles.deleteModal}>
            <div className={styles.deleteEmoji}>🗑️</div>
            <h3 className={styles.deleteTitle}>Remove Team Member?</h3>
            <p className={styles.deleteDesc}>
              Are you sure you want to remove <strong>{deleteTarget.username}</strong> ({ROLE_META[deleteTarget.role]?.label})?
              They will lose access to the dashboard immediately.
            </p>
            <div className={styles.deleteActions}>
              <button className={styles.cancelBtn} onClick={() => { setModal(null); setDeleteTarget(null); }}>
                Cancel
              </button>
              <button className={styles.confirmDeleteBtn} onClick={handleDelete}>
                Yes, Remove
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
