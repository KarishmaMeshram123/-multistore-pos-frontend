import React, { useState, useEffect } from 'react';
import { billingAPI } from '../services/api';
import { ClipboardList, ChevronDown, ChevronUp, Search } from 'lucide-react';
import styles from './OrdersPage.module.css';

function OrderRow({ order }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr className={styles.row} onClick={() => setExpanded(e => !e)}>
        <td><span className={styles.orderId}>#{order.id}</span></td>
        <td><span className={styles.amount}>₹{Number(order.totalPrice).toLocaleString('en-IN', { minimumFractionDigits:2 })}</span></td>
        <td style={{ color:'var(--text-secondary)' }}>{order.items?.length ?? 0} items</td>
        <td style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>
          {new Date(order.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
        </td>
        <td>
          <button className={styles.expandBtn}>{expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}</button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} style={{ padding:0 }}>
            <div className={styles.expandedContent}>
              <div className={styles.itemsHeader}>Order Items</div>
              <div className={styles.itemsGrid}>
                {order.items?.map(item => (
                  <div key={item.productId} className={styles.itemCard}>
                    <div className={styles.itemName}>{item.productName}</div>
                    <div className={styles.itemMeta}>
                      <span>×{item.quantity}</span>
                      <span>@ ₹{Number(item.price).toLocaleString('en-IN', { minimumFractionDigits:2 })}</span>
                      <span className={styles.itemSubTotal}>₹{(Number(item.price) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits:2 })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    billingAPI.listOrders().then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => String(o.id).includes(search) || String(o.totalPrice).includes(search));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Orders</h1>
          <p>View and manage all orders</p>
        </div>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}><Search size={15} /></span>
          <input className={styles.searchInput} placeholder="Search by order ID…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      {loading ? (
        <div className={styles.loading}><span className={styles.spinner} /></div>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th><th>Total</th><th>Items</th><th>Date</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className={styles.empty}>No orders found.</td></tr>
              ) : filtered.map(o => <OrderRow key={o.id} order={o} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
