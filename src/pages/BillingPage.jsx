import React, { useState, useEffect } from 'react';
import { productAPI, billingAPI, paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Minus, Trash2, ShoppingCart, Search, Package, X, CreditCard, Banknote, CheckCircle } from 'lucide-react';
import styles from './BillingPage.module.css';

// ── Razorpay test key — replace with your real key later ──
const RAZORPAY_KEY = 'rzp_test_Shl0c3JmIIymJs'; // 👈 paste your Key ID here

export default function BillingPage() {
  const { user } = useAuth();
  const [products, setProducts]     = useState([]);
  const [cart, setCart]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [error, setError]           = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Payment flow states
  const [orderData, setOrderData]       = useState(null);  // order created on backend
  const [showPayModal, setShowPayModal] = useState(false);
  const [payMethod, setPayMethod]       = useState(null);  // 'razorpay' | 'cash'
  const [payLoading, setPayLoading]     = useState(false);
  const [success, setSuccess]           = useState(null);  // final success object

  useEffect(() => {
    productAPI.list()
      .then(r => setProducts(r.data))
      .finally(() => setLoading(false));
  }, []);

  // ── Cart helpers ──
  function addToCart(product) {
    setCart(c => {
      const ex = c.find(i => i.productId === product.id);
      if (ex) return c.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...c, { productId: product.id, name: product.name, price: Number(product.price), quantity: 1 }];
    });
  }

  function updateQty(productId, delta) {
    setCart(c =>
      c.map(i => i.productId === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
       .filter(i => i.quantity > 0)
    );
  }

  function removeFromCart(productId) {
    setCart(c => c.filter(i => i.productId !== productId));
  }

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  // ── Step 1: Place order → then show payment modal ──
  async function handlePlaceOrder() {
    if (!cart.length) return;
    setPlacingOrder(true); setError('');
    try {
      const res = await billingAPI.createOrder({
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity }))
      });
      setOrderData(res.data);
      setShowPayModal(true);
      setCart([]);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to place order. Check inventory levels.');
    } finally {
      setPlacingOrder(false);
    }
  }

  // ── Step 2a: Cash payment ──
  async function handleCashPayment() {
    setPayLoading(true);
    // Small delay for UX feel
    await new Promise(r => setTimeout(r, 800));
    setShowPayModal(false);
    setSuccess({
      orderId: orderData.id,
      total: orderData.totalPrice,
      items: orderData.items,
      method: 'Cash',
      paymentId: null,
    });
    setPayLoading(false);
    setOrderData(null);
  }

  // ── Step 2b: Razorpay payment ──
  async function handleRazorpayPayment() {
    setPayLoading(true); setError('');
    try {
      // Try to create Razorpay order from backend
      // Falls back to test mode if backend route not available
      let rzpOrderId = null;
      try {
        const rzpRes = await paymentAPI.createRazorpayOrder({
          amount: Math.round(total * 100), // paise
          currency: 'INR',
          orderId: orderData.id,
        });
        rzpOrderId = rzpRes.data.razorpayOrderId;
      } catch {
        // Backend not set up yet — open Razorpay in test mode directly
        rzpOrderId = null;
      }

      const options = {
        key: RAZORPAY_KEY,
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'MultiStore Sync POS',
        description: `Order #${orderData.id}`,
        order_id: rzpOrderId,
        handler: async function (response) {
          // Payment successful
          setShowPayModal(false);
          setSuccess({
            orderId: orderData.id,
            total: orderData.totalPrice,
            items: orderData.items,
            method: 'Razorpay',
            paymentId: response.razorpay_payment_id,
          });
          setOrderData(null);

          // Verify with backend if possible
          try {
            await paymentAPI.verifyPayment({
              orderId: orderData.id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
          } catch { /* verification optional for test mode */ }
        },
        prefill: {
          name: user?.username || 'Customer',
          email: 'customer@multistore.com',
          contact: '9000000000',
        },
        theme: { color: '#6366f1' },
        modal: {
          ondismiss: () => { setPayLoading(false); }
        }
      };

      if (!window.Razorpay) {
        setError('Razorpay SDK not loaded. Check your internet connection.');
        setPayLoading(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        setError('Payment failed. Please try again or choose Cash.');
        setPayLoading(false);
      });
      rzp.open();
    } catch (e) {
      setError('Could not initiate Razorpay. Try cash payment.');
    } finally {
      setPayLoading(false);
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // ── SUCCESS SCREEN ──
  if (success) {
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successIconWrap}>
            <CheckCircle size={52} className={styles.successIcon} />
          </div>
          <div className={styles.successTitle}>Payment Successful!</div>
          <div className={styles.successSub}>
            {success.method === 'Cash'
              ? 'Cash payment received. Order is confirmed.'
              : 'Razorpay payment confirmed. Order is complete.'}
          </div>

          <div className={styles.successDetails}>
            <div className={styles.successRow}>
              <span className={styles.successRowLabel}>Order ID</span>
              <span className={styles.successRowValue}>#{success.orderId}</span>
            </div>
            <div className={styles.successRow}>
              <span className={styles.successRowLabel}>Total Paid</span>
              <span className={styles.successRowValue}>
                ₹{Number(success.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className={styles.successRow}>
              <span className={styles.successRowLabel}>Payment Method</span>
              <span className={`${styles.successRowValue} ${success.method === 'Cash' ? styles.cashBadge : styles.rzpBadge}`}>
                {success.method === 'Cash' ? '💵 Cash' : '💳 Razorpay'}
              </span>
            </div>
            {success.paymentId && (
              <div className={styles.successRow}>
                <span className={styles.successRowLabel}>Payment ID</span>
                <span className={styles.successRowValue} style={{ fontSize:'0.78rem', wordBreak:'break-all' }}>
                  {success.paymentId}
                </span>
              </div>
            )}
          </div>

          <button className={styles.newBillBtn} onClick={() => setSuccess(null)}>
            + New Bill
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>New Bill</h1>
        <p>Select products → Place order → Choose payment method</p>
      </div>

      <div className={styles.layout}>
        {/* ── PRODUCTS ── */}
        <div className={styles.left}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}><Search size={15} /></span>
            <input
              className={styles.searchInput}
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {loading ? (
            <div className={styles.loading}><span className={styles.spinner} /></div>
          ) : (
            <div className={styles.productsGrid}>
              {filtered.map((p, i) => (
                <div
                  key={p.id}
                  className={styles.productCard}
                  style={{ animationDelay: `${i * 0.04}s` }}
                  onClick={() => addToCart(p)}
                >
                  <div className={styles.productIcon}><Package size={18} /></div>
                  <div className={styles.productName}>{p.name}</div>
                  <div className={styles.productPrice}>
                    ₹{Number(p.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className={styles.noProducts}>No products found</div>
              )}
            </div>
          )}
        </div>

        {/* ── CART ── */}
        <div className={styles.cart}>
          <div className={styles.cartTitle}>
            <ShoppingCart size={18} /> Cart
            {cart.length > 0 && (
              <span className={styles.cartCount}>
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>

          {cart.length === 0 ? (
            <div className={styles.cartEmpty}>
              <div className={styles.cartEmptyIcon}>🛒</div>
              <div>Click products to add them here</div>
            </div>
          ) : (
            <>
              <div className={styles.cartItems}>
                {cart.map(item => (
                  <div key={item.productId} className={styles.cartItem}>
                    <span className={styles.cartItemName}>{item.name}</span>
                    <div className={styles.qtyControls}>
                      <button className={styles.qtyBtn} onClick={() => updateQty(item.productId, -1)}>
                        <Minus size={10} />
                      </button>
                      <span className={styles.qty}>{item.quantity}</span>
                      <button className={styles.qtyBtn} onClick={() => updateQty(item.productId, 1)}>
                        <Plus size={10} />
                      </button>
                    </div>
                    <span className={styles.cartItemPrice}>
                      ₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <button className={styles.removeBtn} onClick={() => removeFromCart(item.productId)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <div className={styles.divider} />
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total Amount</span>
                <span className={styles.totalValue}>
                  ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </>
          )}

          <button
            className={styles.placeBtn}
            onClick={handlePlaceOrder}
            disabled={placingOrder || cart.length === 0}
          >
            {placingOrder ? <span className={styles.spinner} /> : <>Proceed to Payment →</>}
          </button>
          {error && <div className={styles.errorBox}>⚠ {error}</div>}
        </div>
      </div>

      {/* ── PAYMENT METHOD MODAL ── */}
      {showPayModal && orderData && (
        <div className={styles.overlay} onClick={e => e.target === e.currentTarget && setShowPayModal(false)}>
          <div className={styles.payModal}>
            <div className={styles.payModalHeader}>
              <div>
                <h3 className={styles.payModalTitle}>Choose Payment Method</h3>
                <p className={styles.payModalSub}>
                  Order #{orderData.id} · ₹{Number(orderData.totalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <button className={styles.closeBtn} onClick={() => setShowPayModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className={styles.payAmountBanner}>
              <span className={styles.payAmountLabel}>Amount to Pay</span>
              <span className={styles.payAmountValue}>
                ₹{Number(orderData.totalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className={styles.payMethods}>
              {/* Razorpay option */}
              <button
                className={`${styles.payMethodBtn} ${payMethod === 'razorpay' ? styles.payMethodSelected : ''}`}
                onClick={() => setPayMethod('razorpay')}
              >
                <div className={styles.payMethodIcon} style={{ background:'#2563eb12', color:'#2563eb' }}>
                  <CreditCard size={22} />
                </div>
                <div className={styles.payMethodInfo}>
                  <span className={styles.payMethodName}>Pay Online</span>
                  <span className={styles.payMethodDesc}>UPI · Card · Netbanking · Wallet</span>
                </div>
                <div className={styles.rzpBadgePill}>Razorpay</div>
                <div className={styles.payRadio}>{payMethod === 'razorpay' && <div className={styles.payRadioInner} />}</div>
              </button>

              {/* Cash option */}
              <button
                className={`${styles.payMethodBtn} ${payMethod === 'cash' ? styles.payMethodSelected : ''}`}
                onClick={() => setPayMethod('cash')}
              >
                <div className={styles.payMethodIcon} style={{ background:'#05966912', color:'#059669' }}>
                  <Banknote size={22} />
                </div>
                <div className={styles.payMethodInfo}>
                  <span className={styles.payMethodName}>Cash Payment</span>
                  <span className={styles.payMethodDesc}>Customer pays with cash at counter</span>
                </div>
                <div className={styles.payRadio}>{payMethod === 'cash' && <div className={styles.payRadioInner} />}</div>
              </button>
            </div>

            {error && <div className={styles.payError}>⚠ {error}</div>}

            <button
              className={styles.confirmPayBtn}
              disabled={!payMethod || payLoading}
              onClick={payMethod === 'cash' ? handleCashPayment : handleRazorpayPayment}
            >
              {payLoading ? (
                <span className={styles.spinner} />
              ) : payMethod === 'cash' ? (
                '✓ Confirm Cash Payment'
              ) : payMethod === 'razorpay' ? (
                '💳 Pay with Razorpay'
              ) : (
                'Select a payment method'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
