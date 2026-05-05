import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { tenantAPI } from '../services/api';
import styles from './CreateTenantPage.module.css';

export default function CreateTenantPage() {
  const [step, setStep] = useState(1);
  const [tenant, setTenant] = useState({ name:'', companyEmail:'' });
  const [createdTenant, setCreatedTenant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await tenantAPI.create(tenant);
      setCreatedTenant(res.data); setStep(2);
    } catch (err) { setError(err.response?.data?.message || 'Failed to create store. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.topbar}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <svg viewBox="0 0 28 28" fill="none" width="16" height="16"><path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" fill="currentColor" opacity="0.9"/><path d="M14 8L20 11V17L14 20L8 17V11L14 8Z" fill="white" opacity="0.85"/></svg>
            </div>
            <span className={styles.brandName}>MultiStore<span className={styles.brandSub}>Sync</span></span>
          </div>
          <div className={styles.steps}>
            <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}><span className={styles.stepNum}>1</span><span>Create Store</span></div>
            <div className={styles.stepLine} />
            <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}><span className={styles.stepNum}>2</span><span>Register Admin</span></div>
          </div>
        </div>

        {step === 1 && (
          <div className={styles.card}>
            <h2 className={styles.title}>Set up your store</h2>
            <p className={styles.subtitle}>Create a new tenant workspace for your business</p>
            {error && <div className={styles.error}>⚠ {error}</div>}
            <form onSubmit={handleCreate} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Store Name</label>
                <input className={styles.input} type="text" placeholder="e.g. My Retail Store" value={tenant.name} onChange={e => setTenant(t => ({...t, name:e.target.value}))} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Company Email</label>
                <input className={styles.input} type="email" placeholder="contact@mystore.com" value={tenant.companyEmail} onChange={e => setTenant(t => ({...t, companyEmail:e.target.value}))} required />
              </div>
              <button className={styles.btn} type="submit" disabled={loading}>
                {loading ? <span className={styles.spinner} /> : 'Create Store →'}
              </button>
            </form>
            <div className={styles.footer}>Already have an account? <Link to="/login" className={styles.link}>Sign in</Link></div>
          </div>
        )}

        {step === 2 && createdTenant && (
          <div className={styles.card}>
            <div className={styles.successCard}>
              <div className={styles.successEmoji}>🎉</div>
              <div className={styles.successTitle}>Store Created!</div>
              <div className={styles.successSub}>Save your Tenant ID — you'll need it to register admin users and invite your team.</div>
              <div className={styles.idBox}>
                <div className={styles.idLabel}>Your Tenant ID</div>
                <div className={styles.idValue}>#{createdTenant.id}</div>
                <div className={styles.idNote}>{createdTenant.name} · {createdTenant.companyEmail}</div>
              </div>
              <Link to="/register" className={styles.btn} style={{ textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
                Register Admin User →
              </Link>
              <div className={styles.footer} style={{ marginTop:'1rem' }}>
                <Link to="/login" className={styles.link}>Sign in instead</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
