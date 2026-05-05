import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, Package, Layers, ShoppingCart, Users2,
  ClipboardList, BarChart2, LogOut, ChevronLeft, ChevronRight,
  User, Sun, Moon, Store
} from 'lucide-react';
import styles from './DashboardLayout.module.css';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN','MANAGER','CASHIER'] },
  { to: '/products', icon: Package, label: 'Products', roles: ['ADMIN','MANAGER','CASHIER'] },
  { to: '/inventory', icon: Layers, label: 'Inventory', roles: ['ADMIN','MANAGER'] },
  { to: '/billing', icon: ShoppingCart, label: 'New Bill', roles: ['ADMIN','MANAGER','CASHIER'] },
  { to: '/orders', icon: ClipboardList, label: 'Orders', roles: ['ADMIN','MANAGER'] },
  { to: '/reports', icon: BarChart2, label: 'Reports', roles: ['ADMIN'] },
  { to: '/users', icon: Users2, label: 'Team', roles: ['ADMIN'] },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allowed = NAV.filter(n => n.roles.includes(user?.role));

  const roleColor = { ADMIN: styles.roleAdmin, MANAGER: styles.roleManager, CASHIER: styles.roleCashier };

  return (
    <div className={`${styles.root} ${collapsed ? styles.collapsed : ''}`}>
      <aside className={styles.sidebar}>
        {/* Brand */}
        <div className={styles.sideTop}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <svg viewBox="0 0 28 28" fill="none" width="16" height="16">
                <path d="M14 2L26 8V20L14 26L2 20V8L14 2Z" fill="currentColor" opacity="0.9"/>
                <path d="M14 8L20 11V17L14 20L8 17V11L14 8Z" fill="white" opacity="0.85"/>
              </svg>
            </div>
            {!collapsed && (
              <span className={styles.brandName}>MultiStore<span className={styles.brandSub}>Sync</span></span>
            )}
          </div>
          <button className={styles.collapseBtn} onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand' : 'Collapse'}>
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Tenant */}
        {!collapsed && (
          <div className={styles.tenantBadge}>
            <Store size={12} className={styles.tenantIcon} />
            <span className={styles.tenantName}>{user?.tenantName || 'Store'}</span>
          </div>
        )}

        {/* Nav */}
        <nav className={styles.nav}>
          {!collapsed && <div className={styles.navSection}>MENU</div>}
          {allowed.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={17} className={styles.navIcon} />
              {!collapsed && <span className={styles.navLabel}>{label}</span>}
              {!collapsed && <span className={styles.navIndicator} />}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className={styles.sideBottom}>
          <button className={styles.themeToggle} onClick={toggle} title="Toggle theme">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          <div className={styles.userCard}>
            <div className={styles.userAvatar}>
              <User size={13} />
            </div>
            {!collapsed && (
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user?.username}</span>
                <span className={`${styles.roleBadge} ${roleColor[user?.role]}`}>{user?.role}</span>
              </div>
            )}
            <button className={styles.logoutBtn} onClick={handleLogout} title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
