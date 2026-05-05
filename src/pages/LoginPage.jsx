import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.root}>
      {/* Left decorative panel */}
      <div className={styles.leftPanel}>
        <div className={styles.topbar}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
                <path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" fill="currentColor" opacity="0.9"/>
                <path d="M14 8L20 11V17L14 20L8 17V11L14 8Z" fill="white" opacity="0.85"/>
              </svg>
            </div>
            <span className={styles.brandName}>MultiStore<span className={styles.brandSub}>Sync</span></span>
          </div>
          <button className={styles.themeBtn} onClick={toggle} title="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.badge}>Multi-Tenant SaaS Platform</div>
          <h1 className={styles.heroTitle}>
            Modern Retail,<br />
            <span className={styles.heroGrad}>Simplified.</span>
          </h1>
          <p className={styles.heroDesc}>
            A complete point-of-sale solution with tenant isolation, role-based access, and real-time analytics.
          </p>

          <div className={styles.featureList}>
            {[
              { icon: '⚡', label: 'Real-time inventory tracking' },
              { icon: '🔐', label: 'Role-based access control' },
              { icon: '📊', label: 'Advanced sales analytics' },
              { icon: '🏪', label: 'Multi-store tenant isolation' },
            ].map((f, i) => (
              <div key={f.label} className={styles.featureItem} style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative blobs */}
        <div className={styles.blob1} aria-hidden />
        <div className={styles.blob2} aria-hidden />

        {/* Floating card mockup */}
        <div className={styles.floatingCard}>
          <div className={styles.fcTop}>
            <span className={styles.fcDot} style={{ background: 'var(--green)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Today's Revenue</span>
          </div>
          <div className={styles.fcValue}>₹48,290</div>
          <div className={styles.fcSub}>↑ 12% from yesterday</div>
        </div>
      </div>

      {/* Right form panel */}
      <div className={styles.rightPanel}>
        <div className={styles.formWrap}>
          <div className={`${styles.formCard} animate-up`}>
            <div className={styles.formHeader}>
              <p className={styles.eyebrow}>Welcome back</p>
              <h2 className={styles.formTitle}>Sign in to your store</h2>
              <p className={styles.formSub}>Enter your credentials to access the dashboard</p>
            </div>

            {error && (
              <div className={`${styles.errorBox} animate-in`}>
                <span>⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Username</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </span>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Enter your username"
                    value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input
                    className={styles.input}
                    type="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? (
                  <span className={styles.spinner} />
                ) : (
                  <>Sign In <span className={styles.arrow}>→</span></>
                )}
              </button>
            </form>

            <div className={styles.divider}><span>New to MultiStore Sync POS?</span></div>
            <div className={styles.footer}>
              <Link to="/setup" className={styles.setupLink}>Create your store →</Link>
              <span className={styles.sep}>·</span>
              <Link to="/register" className={styles.registerLink}>Register account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
