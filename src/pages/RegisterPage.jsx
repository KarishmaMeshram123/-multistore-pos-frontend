import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ username:'', password:'', role:'ADMIN', tenantId:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await authAPI.register({ ...form, tenantId: Number(form.tenantId) });
      login(res.data); navigate('/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Registration failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <svg viewBox="0 0 28 28" fill="none" width="16" height="16"><path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" fill="currentColor" opacity="0.9"/><path d="M14 8L20 11V17L14 20L8 17V11L14 8Z" fill="white" opacity="0.85"/></svg>
          </div>
          <span className={styles.brandName}>MultiStore<span className={styles.brandSub}>Sync</span></span>
        </div>
        <h2 className={styles.title}>Register Account</h2>
        <p className={styles.subtitle}>Create an admin account for your store</p>
        {error && <div className={styles.error}>⚠ {error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Tenant ID</label>
            <input className={styles.input} type="number" placeholder="Your store's tenant ID" value={form.tenantId} onChange={e => setForm(f=>({...f, tenantId:e.target.value}))} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Username</label>
            <input className={styles.input} type="text" placeholder="Choose a username" value={form.username} onChange={e => setForm(f=>({...f, username:e.target.value}))} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" placeholder="Choose a strong password" value={form.password} onChange={e => setForm(f=>({...f, password:e.target.value}))} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Role</label>
            <select className={styles.input} value={form.role} onChange={e => setForm(f=>({...f, role:e.target.value}))}>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="CASHIER">Cashier</option>
            </select>
          </div>
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Create Account →'}
          </button>
        </form>
        <div className={styles.footer}>Already have an account? <Link to="/login" className={styles.link}>Sign in</Link></div>
      </div>
    </div>
  );
}
