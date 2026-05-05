import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { productAPI, inventoryAPI, billingAPI } from '../services/api';
import { Package, Layers, ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './DashboardPage.module.css';

function StatCard({ label, value, icon: Icon, color, sub, delay }) {
  return (
    <div className={`${styles.statCard} ${styles[color]}`} style={{ animationDelay: `${delay}s` }}>
      <div className={styles.statIconWrap}><Icon size={20} /></div>
      <div className={styles.statBody}>
        <div className={styles.statValue}>{value ?? '—'}</div>
        <div className={styles.statLabel}>{label}</div>
        {sub && <div className={styles.statSub}>{sub}</div>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'8px 14px', fontSize:'0.8rem', boxShadow:'var(--shadow-lg)' }}>
        <div style={{ color:'var(--text-secondary)', marginBottom:3 }}>{label}</div>
        <div style={{ color:'var(--accent)', fontWeight:700, fontFamily:'var(--font-display)' }}>₹{payload[0].value?.toFixed(2)}</div>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, inventory: 0, orders: 0, revenue: 0 });
  const [chartData, setChartData] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const promises = [productAPI.list(), inventoryAPI.list()];
        if (['ADMIN','MANAGER'].includes(user?.role)) promises.push(billingAPI.listOrders());
        const results = await Promise.allSettled(promises);
        const products = results[0].status === 'fulfilled' ? results[0].value.data : [];
        const inventory = results[1].status === 'fulfilled' ? results[1].value.data : [];
        const orders = results[2]?.status === 'fulfilled' ? results[2].value.data : [];
        const revenue = orders.reduce((s, o) => s + Number(o.totalPrice || 0), 0);
        setStats({ products: products.length, inventory: inventory.length, orders: orders.length, revenue });
        setLowStock(inventory.filter(i => i.quantity < 10).slice(0, 4));
        const byDate = {};
        orders.forEach(o => {
          const date = new Date(o.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short' });
          byDate[date] = (byDate[date] || 0) + Number(o.totalPrice || 0);
        });
        const chartArr = Object.entries(byDate).slice(-7).map(([date, total]) => ({ date, total }));
        setChartData(chartArr.length ? chartArr : [{ date: 'No data', total: 0 }]);
        setRecentSales(orders.slice(0, 5));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [user]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return (
    <div className={styles.loading}>
      <span className={styles.loadSpinner} />
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.greeting}>{greeting}, <strong>{user?.username}</strong> 👋</p>
          <h1 className={styles.title}>Dashboard</h1>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.dateChip}>
            📅 {new Date().toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short', year:'numeric' })}
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard label="Total Products" value={stats.products} icon={Package} color="blue" delay={0.05} />
        <StatCard label="Inventory Items" value={stats.inventory} icon={Layers} color="purple" delay={0.1} />
        {['ADMIN','MANAGER'].includes(user?.role) && (
          <>
            <StatCard label="Total Orders" value={stats.orders} icon={ShoppingCart} color="green" delay={0.15} />
            <StatCard label="Total Revenue" value={`₹${stats.revenue.toLocaleString('en-IN', { minimumFractionDigits:2, maximumFractionDigits:2 })}`} icon={TrendingUp} color="amber" delay={0.2} />
          </>
        )}
      </div>

      <div className={styles.grid2}>
        {['ADMIN','MANAGER'].includes(user?.role) && chartData.length > 0 && (
          <div className={styles.chartCard}>
            <h3 className={styles.cardTitle}>📈 Revenue Overview</h3>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={chartData} margin={{ top:5, right:10, left:0, bottom:0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} width={55} tickFormatter={v => `₹${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total" stroke="var(--accent)" strokeWidth={2.5} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {lowStock.length > 0 && (
          <div className={styles.alertCard}>
            <h3 className={styles.cardTitle}><AlertCircle size={16} style={{ color:'var(--red)', marginRight:6 }} />Low Stock Alert</h3>
            {lowStock.map(item => (
              <div key={item.id} className={styles.alertRow}>
                <span className={styles.alertName}>{item.product?.name || 'Unknown'}</span>
                <span className={`${styles.alertQty} ${item.quantity === 0 ? styles.outOfStock : ''}`}>
                  {item.quantity === 0 ? 'OUT' : `${item.quantity} left`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {['ADMIN','MANAGER'].includes(user?.role) && recentSales.length > 0 && (
        <div className={styles.tableCard}>
          <h3 className={styles.cardTitle}>🧾 Recent Orders</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Total</th>
                <th>Items</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map(sale => (
                <tr key={sale.id}>
                  <td><span className={styles.orderId}>#{sale.id}</span></td>
                  <td><span className={styles.amount}>₹{Number(sale.totalPrice).toLocaleString('en-IN', { minimumFractionDigits:2 })}</span></td>
                  <td style={{ color:'var(--text-secondary)' }}>{sale.items?.length ?? 0} items</td>
                  <td style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>
                    {new Date(sale.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
