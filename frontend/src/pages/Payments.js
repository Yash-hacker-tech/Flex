import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

// Load Razorpay script dynamically
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Payments() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');
  const [paying, setPaying] = useState(false);
  const [successModal, setSuccessModal] = useState(null);

  const fetchTransactions = useCallback(async () => {
    try {
      const { data } = await API.get('/payments/history');
      setTransactions(data.transactions || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const totalAmount = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.netAmount || t.amount), 0);

  const typeIcon = (type) => ({
    escrow_fund: '🔒',
    milestone_release: '✅',
    refund: '↩️',
    platform_fee: '💸',
  }[type] || '💳');

  const statusColor = (status) => ({
    completed: 'var(--green)',
    pending: 'var(--gold)',
    failed: 'var(--red)',
    processing: 'var(--accent2)',
    refunded: 'var(--text2)',
  }[status] || 'var(--text2)');

  // ── Razorpay Payment Handler ──────────────────────────────────────────
  const handleRazorpayPayment = async () => {
    const amt = parseFloat(payAmount);
    if (!amt || amt < 1) { toast.error('Enter a valid amount (min ₹1)'); return; }

    const loaded = await loadRazorpay();
    if (!loaded) { toast.error('Razorpay SDK failed to load. Check your connection.'); return; }

    setPaying(true);
    try {
      // Create order on backend
      const { data: order } = await API.post('/payments/razorpay/create-order', {
        amount: Math.round(amt * 100), // paise
        currency: 'INR',
        notes: { description: payNote || 'FleX Payment' },
      });

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'FleX Platform',
        description: payNote || 'Freelancing Payment',
        order_id: order.id,
        image: 'https://via.placeholder.com/48x48/6c63ff/fff?text=F',
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: '#6c63ff' },
        handler: async (response) => {
          try {
            // Verify payment on backend
            const { data: verified } = await API.post('/payments/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: amt,
              description: payNote,
            });
            setSuccessModal({ amount: amt, paymentId: response.razorpay_payment_id });
            setPayModalOpen(false);
            setPayAmount('');
            setPayNote('');
            fetchTransactions(); // refresh
          } catch (err) {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        modal: {
          ondismiss: () => { setPaying(false); },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        toast.error(`Payment failed: ${resp.error.description}`);
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment');
      setPaying(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="page">
      <div className="container">
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="section-title">Payments</h1>
            <p style={{ color: 'var(--text2)' }}>Transaction history and payment management</p>
          </div>
          {user?.role === 'client' && (
            <button className="btn btn-primary" onClick={() => setPayModalOpen(true)}>
              💳 Make Payment
            </button>
          )}
        </div>

        {/* Razorpay badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border2)', borderRadius: 20, padding: '6px 14px', fontSize: '0.8rem', color: 'var(--text2)' }}>
          <RazorpayBadge />
          Payments secured by Razorpay
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ color: 'var(--text2)', fontSize: '0.82rem', marginBottom: 6 }}>
              {user?.role === 'client' ? 'Total Spent' : 'Total Earned'}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--green)' }}>
              ₹{((user?.role === 'client' ? user?.totalSpent : user?.totalEarnings) || 0).toLocaleString()}
            </div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ color: 'var(--text2)', fontSize: '0.82rem', marginBottom: 6 }}>Total Transactions</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--accent2)' }}>
              {transactions.length}
            </div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ color: 'var(--text2)', fontSize: '0.82rem', marginBottom: 6 }}>Completed</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--accent3)' }}>
              {transactions.filter(t => t.status === 'completed').length}
            </div>
          </div>
        </div>

        {/* How Payments Work */}
        <div className="card ai-card" style={{ marginBottom: 28, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <RazorpayBadge size={20} />
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>How FleX × Razorpay Payments Work</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 14 }}>
            {[
              { icon: '🔒', title: 'Escrow Protection', desc: 'Client funds held securely until milestone approval' },
              { icon: '✅', title: 'Milestone Approval', desc: 'Client reviews and approves work before payment' },
              { icon: '💳', title: 'Instant Release', desc: 'Payment released immediately via Razorpay' },
              { icon: '💰', title: 'Platform Fee', desc: '1-5% client fee · 2-5% freelancer fee' },
            ].map(item => (
              <div key={item.title} style={{ background: 'var(--bg3)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>{item.title}</div>
                <div style={{ color: 'var(--text2)', fontSize: '0.78rem', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction list */}
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Transaction History</h2>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 70 }} />)}
          </div>
        ) : transactions.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>💳</div>
            <p style={{ color: 'var(--text2)', marginBottom: 16 }}>No transactions yet</p>
            {user?.role === 'client'
              ? <Link to="/post-project" className="btn btn-primary">Post a Project</Link>
              : <Link to="/projects" className="btn btn-primary">Find Work</Link>
            }
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {transactions.map(t => (
              <div key={t._id} className="card" style={{ padding: '14px 20px' }}>
                <div className="flex-between" style={{ flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: '1.4rem' }}>{typeIcon(t.type)}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {t.type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </div>
                      <div style={{ color: 'var(--text3)', fontSize: '0.78rem' }}>
                        {t.project?.title} · {new Date(t.createdAt).toLocaleDateString()}
                      </div>
                      {t.razorpayPaymentId && (
                        <div style={{ color: 'var(--text3)', fontSize: '0.72rem', marginTop: 2, fontFamily: 'monospace' }}>
                          ID: {t.razorpayPaymentId}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem' }}>
                      ₹{t.amount?.toFixed(2)}
                    </div>
                    {t.platformFee > 0 && (
                      <div style={{ color: 'var(--text3)', fontSize: '0.72rem' }}>Fee: ₹{t.platformFee?.toFixed(2)}</div>
                    )}
                    {t.netAmount > 0 && t.netAmount !== t.amount && (
                      <div style={{ color: 'var(--green)', fontSize: '0.78rem', fontWeight: 600 }}>Net: ₹{t.netAmount?.toFixed(2)}</div>
                    )}
                    <div style={{ color: statusColor(t.status), fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize', marginTop: 4 }}>
                      {t.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PCI note */}
        <div style={{ marginTop: 24, padding: '12px 16px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10, fontSize: '0.78rem', color: 'var(--text3)', textAlign: 'center' }}>
          🔒 All payments are PCI-DSS compliant via Razorpay. Your card data never touches FleX servers.
        </div>
      </div>

      {/* ── RAZORPAY PAYMENT MODAL ──────────────────────────────────────── */}
      {payModalOpen && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setPayModalOpen(false); }}>
          <div className="modal fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <RazorpayBadge size={22} />
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Make a Payment</h2>
                </div>
                <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>Secure payment via Razorpay</p>
              </div>
              <button onClick={() => setPayModalOpen(false)} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text2)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>✕</button>
            </div>

            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input
                type="number" min="1" step="0.01"
                placeholder="e.g. 5000"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
              />
              <span className="form-hint">Minimum ₹1 • Maximum ₹5,00,000</span>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Note (optional)</label>
              <input
                type="text"
                placeholder="e.g. Milestone 1 payment"
                value={payNote}
                onChange={e => setPayNote(e.target.value)}
                maxLength={100}
              />
            </div>

            {payAmount && parseFloat(payAmount) > 0 && (
              <div style={{ background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.15)', borderRadius: 10, padding: '14px 16px', marginBottom: 20, fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text2)' }}>Amount</span>
                  <span>₹{parseFloat(payAmount || 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text2)' }}>Platform fee (2%)</span>
                  <span>₹{(parseFloat(payAmount || 0) * 0.02).toFixed(2)}</span>
                </div>
                <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--green)' }}>₹{(parseFloat(payAmount || 0) * 1.02).toFixed(2)}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleRazorpayPayment}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', gap: 10 }}
              disabled={paying || !payAmount || parseFloat(payAmount) < 1}
            >
              {paying ? <><span className="spinner" />Processing...</> : <><RazorpayBadge size={16} />Pay with Razorpay</>}
            </button>

            <p style={{ fontSize: '0.72rem', color: 'var(--text3)', textAlign: 'center', marginTop: 12 }}>
              🔒 256-bit SSL encrypted · PCI-DSS compliant
            </p>
          </div>
        </div>
      )}

      {/* ── SUCCESS MODAL ───────────────────────────────────────────────── */}
      {successModal && (
        <div className="modal-overlay">
          <div className="modal fade-in" style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16, animation: 'fadeIn 0.4s ease' }}>🎉</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>Payment Successful!</h2>
            <p style={{ color: 'var(--text2)', marginBottom: 20 }}>
              ₹{successModal.amount.toFixed(2)} has been processed successfully via Razorpay.
            </p>
            <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: '0.82rem', color: 'var(--text3)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              Payment ID: {successModal.paymentId}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setSuccessModal(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => { setSuccessModal(null); fetchTransactions(); }}>View Transactions</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RazorpayBadge({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 5h16l-2 14H6L4 5z" fill="#3395FF" />
      <path d="M9 10l2 4 3-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
