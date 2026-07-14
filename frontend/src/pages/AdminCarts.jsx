import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllCarts } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminCarts = () => {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);
  const navigate = useNavigate();

  // Guard: admin only
  useEffect(() => {
    const userJson = localStorage.getItem('sangeet_user');
    const user = userJson ? JSON.parse(userJson) : null;
    if (!user || user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/');
    }
  }, [navigate]);

  const fetchAllCarts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllCarts();
      setCarts(res.data.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load carts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllCarts(); }, [fetchAllCarts]);

  const fmt = p =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  if (loading) return <LoadingSpinner message="Loading all customer carts..." />;

  const totalRevenuePotential = carts.reduce((sum, c) => sum + (c.total || 0), 0);

  return (
    <main className="container page-enter" style={{ padding: '2rem 1rem' }}>
      {/* Header */}
      <div className="sec-header">
        <p className="sec-kicker">Admin Panel</p>
        <h1 className="sec-title">Customer <span className="gold-word">Carts</span></h1>
        <div className="sec-rule" />
        <p className="sec-desc">View all active customer carts and their selected items.</p>
      </div>

      {/* Stats Bar */}
      <div className="admin-carts-stats">
        <div className="admin-stat-chip">
          <i className="bi bi-people" />
          <div>
            <div className="admin-stat-num">{carts.length}</div>
            <div className="admin-stat-lbl">Active Carts</div>
          </div>
        </div>
        <div className="admin-stat-chip">
          <i className="bi bi-basket2" />
          <div>
            <div className="admin-stat-num">{carts.reduce((s, c) => s + c.items.length, 0)}</div>
            <div className="admin-stat-lbl">Total Items</div>
          </div>
        </div>
        <div className="admin-stat-chip">
          <i className="bi bi-cash-stack" />
          <div>
            <div className="admin-stat-num">{fmt(totalRevenuePotential)}</div>
            <div className="admin-stat-lbl">Potential Revenue</div>
          </div>
        </div>
        <button className="admin-refresh-btn" onClick={fetchAllCarts}>
          <i className="bi bi-arrow-clockwise" /> Refresh
        </button>
      </div>

      {carts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <i className="bi bi-basket2" style={{ fontSize: '3rem', opacity: 0.4, display: 'block', marginBottom: '1rem' }} />
          <h3>No active carts yet</h3>
          <p>Customer carts will appear here once they add items.</p>
        </div>
      ) : (
        <div className="admin-carts-list">
          {carts.map(cart => (
            <div key={cart._id} className="admin-cart-card">
              {/* User Header */}
              <div
                className="admin-cart-header"
                onClick={() => setExpandedUser(expandedUser === cart._id ? null : cart._id)}
              >
                <div className="admin-cart-user-info">
                  <div className="admin-cart-avatar">
                    <i className="bi bi-person-circle" />
                  </div>
                  <div>
                    <div className="admin-cart-username">{cart.user?.username || 'Unknown User'}</div>
                    <div className="admin-cart-joined">
                      Member since {new Date(cart.user?.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </div>
                <div className="admin-cart-summary-chips">
                  <span className="admin-cart-chip">
                    <i className="bi bi-basket2" /> {cart.items.length} items
                  </span>
                  <span className="admin-cart-chip gold">
                    <i className="bi bi-currency-rupee" /> {fmt(cart.total)}
                  </span>
                  <span className="admin-cart-chip">
                    <i className={`bi bi-chevron-${expandedUser === cart._id ? 'up' : 'down'}`} />
                  </span>
                </div>
              </div>

              {/* Expanded Items */}
              {expandedUser === cart._id && (
                <div className="admin-cart-items">
                  {cart.items.map(item => {
                    const p = item.product;
                    if (!p) return null;
                    const imgUrl = p.images?.[0]?.url || p.image || '';
                    return (
                      <div key={item._id} className="admin-cart-item">
                        <div className="admin-cart-item-img-wrap">
                          {imgUrl ? (
                            <img src={imgUrl} alt={p.name} className="admin-cart-item-img" />
                          ) : (
                            <div className="admin-cart-item-img-placeholder">🪷</div>
                          )}
                        </div>
                        <div className="admin-cart-item-details">
                          <div className="admin-cart-item-name">{p.name}</div>
                          <div className="admin-cart-item-meta">
                            <span>{p.category}</span> · <span>Size: {p.size}</span>
                          </div>
                        </div>
                        <div className="admin-cart-item-right">
                          <div className="admin-cart-item-qty">Qty: {item.quantity}</div>
                          <div className="admin-cart-item-price">{fmt(p.price * item.quantity)}</div>
                        </div>
                      </div>
                    );
                  })}
                  {/* WhatsApp Contact */}
                  <div className="admin-cart-footer">
                    <div className="admin-cart-footer-total">
                      Total: <strong>{fmt(cart.total)}</strong>
                    </div>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `✨ SANGEET – Cart Details for ${cart.user?.username}\n\n` +
                        cart.items.map(item => {
                          const p = item.product;
                          return `• ${p?.name} (${p?.size}) — ₹${p?.price} × ${item.quantity}`;
                        }).join('\n') +
                        `\n\n💰 Total: ${fmt(cart.total)}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-cart-wa-btn"
                    >
                      <i className="bi bi-whatsapp" /> Share Cart
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default AdminCarts;
