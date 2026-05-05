import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import styles from './ReportsPage.module.css';

const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#059669','#f97316','#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'8px 14px', fontSize:'0.8rem', boxShadow:'var(--shadow-lg)' }}>
        <div style={{ color:'var(--text-secondary)', marginBottom:3 }}>{label}</div>
        <div style={{ color:'var(--accent)', fontWeight:700, fontFamily:'var(--font-display)' }}>₹{Number(payload[0].value).toFixed(2)}</div>
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportAPI.sales().then(r => setSales(r.data)).finally(() => setLoading(false));
  }, []);

  const totalRevenue = sales.reduce((s, o) => s + Number(o.totalPrice || 0), 0);
  const avgOrderValue = sales.length ? totalRevenue / sales.length : 0;

  const byDate = {};
  sales.forEach(o => {
    const d = new Date(o.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short' });
    byDate[d] = (byDate[d] || 0) + Number(o.totalPrice || 0);
  });
  const barData = Object.entries(byDate).map(([date, total]) => ({ date, total }));

  const productTotals = {};
  sales.forEach(o => {
    o.items?.forEach(item => {
      const name = item.productName || 'Unknown';
      if (!productTotals[name]) productTotals[name] = { qty:0, revenue:0 };
      productTotals[name].qty += item.quantity;
      productTotals[name].revenue += Number(item.price) * item.quantity;
    });
  });
  const topProducts = Object.entries(productTotals)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 6)
    .map(([name, { qty, revenue }]) => ({ name, qty, revenue }));
  const pieData = topProducts.map(p => ({ name: p.name, value: p.revenue }));

  if (loading) return <div className={styles.loading}><span className={styles.spinner} /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Sales Reports</h1>
          <p className={styles.subtitle}>Analytics overview — Admin only</p>
        </div>
        <div className={styles.dateChip}>📅 All Time</div>
      </div>

      <div className={styles.kpis}>
        {[
          { label:'Total Revenue', value:`₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits:2 })}`, delay:'0.05s' },
          { label:'Total Orders', value:sales.length, delay:'0.1s' },
          { label:'Avg Order Value', value:`₹${avgOrderValue.toLocaleString('en-IN', { minimumFractionDigits:2 })}`, delay:'0.15s' },
          { label:'Products Sold', value:topProducts.reduce((s,p) => s+p.qty, 0), delay:'0.2s' },
        ].map(k => (
          <div key={k.label} className={styles.kpi} style={{ animationDelay:k.delay }}>
            <span className={styles.kpiLabel}>{k.label}</span>
            <span className={styles.kpiValue}>{k.value}</span>
          </div>
        ))}
      </div>

      {sales.length > 0 ? (
        <>
          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <div className={styles.cardTitle}>📊 Daily Revenue</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top:5, right:10, left:0, bottom:0 }}>
                  <XAxis dataKey="date" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} width={55} tickFormatter={v => `₹${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" fill="var(--accent)" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.chartCard}>
              <div className={styles.cardTitle}>🥧 Revenue by Product</div>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => `₹${Number(v).toFixed(2)}`} contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, fontSize:'0.8rem' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize:'0.75rem', color:'var(--text-secondary)' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className={styles.noData}>No product data yet</div>}
            </div>
          </div>

          {topProducts.length > 0 && (
            <div className={styles.tableCard}>
              <div className={styles.cardTitle}>🏆 Top Products</div>
              <table className={styles.table}>
                <thead>
                  <tr><th>#</th><th>Product</th><th>Units Sold</th><th>Revenue</th></tr>
                </thead>
                <tbody>
                  {topProducts.map((p, i) => (
                    <tr key={p.name}>
                      <td>
                        <span className={`${styles.rankBadge} ${i===0?styles.rank1:i===1?styles.rank2:i===2?styles.rank3:styles.rankOther}`}>{i+1}</span>
                      </td>
                      <td><span className={styles.productName}>{p.name}</span></td>
                      <td style={{ color:'var(--text-secondary)' }}>{p.qty}</td>
                      <td><span className={styles.revenue}>₹{p.revenue.toLocaleString('en-IN', { minimumFractionDigits:2 })}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div className={styles.noData}>No sales data available yet.</div>
      )}
    </div>
  );
}
