import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMyCart, updateCartItem, removeCartItem, clearCart } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userJson = localStorage.getItem('sangeet_user');
  const user = userJson ? JSON.parse(userJson) : null;

  // Redirect non-logged-in users
  useEffect(() => {
    const token = localStorage.getItem('sangeet_token');
    if (!token) {
      toast('Please login to view your cart', { icon: '🔐' });
      navigate('/login');
    }
  }, [navigate]);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyCart();
      setCart(res.data.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      const res = await updateCartItem(itemId, newQty);
      setCart(res.data.data);
    } catch (err) {
      toast.error(err.message || 'Failed to update quantity');
    }
  };

  const handleRemove = async (itemId, productName) => {
    try {
      const res = await removeCartItem(itemId);
      setCart(res.data.data);
      toast.success(`"${productName}" removed from cart`);
    } catch (err) {
      toast.error(err.message || 'Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Clear your entire cart?')) return;
    try {
      await clearCart();
      setCart(prev => ({ ...prev, items: [], total: 0 }));
      toast.success('Cart cleared!');
    } catch (err) {
      toast.error(err.message || 'Failed to clear cart');
    }
  };

  const fmt = p =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  if (loading) return <LoadingSpinner message="Loading your cart..." />;

  const items = cart?.items || [];
  const total = cart?.total || 0;

  return (
    <main className="cart-page container page-enter">
      {/* Header */}
      <div className="sec-header" style={{ paddingTop: '2rem' }}>
        <p className="sec-kicker">Shopping</p>
        <h1 className="sec-title">My <span className="gold-word">Cart</span></h1>
        <div className="sec-rule" />
        <p className="sec-desc">Review your selected pieces before enquiring.</p>
      </div>

      {items.length === 0 ? (
        <div className="cart-empty">
          <i className="bi bi-basket2" style={{ fontSize: '4rem', color: 'var(--gold)', opacity: 0.5, display: 'block', marginBottom: '1rem' }} />
          <h3>Your cart is empty</h3>
          <p>Browse our collection and add pieces you love.</p>
          <Link to="/products" className="btn-royal btn-royal-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
            <i className="bi bi-grid-3x3-gap" /> Browse Collection
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Items List */}
          <div className="cart-items-col">
            <div className="cart-items-header">
              <span>{items.length} item{items.length !== 1 ? 's' : ''} in your cart</span>
              <button className="cart-clear-btn" onClick={handleClearCart}>
                <i className="bi bi-trash3" /> Clear All
              </button>
            </div>

            {items.map(item => {
              const p = item.product;
              if (!p) return null;
              const imgUrl = p.images?.[0]?.url || p.image || '';
              return (
                <div key={item._id} className="cart-item-card">
                  {/* Product Image */}
                  <div className="cart-item-img-wrap">
                    {imgUrl ? (
                      <img src={imgUrl} alt={p.name} className="cart-item-img" />
                    ) : (
                      <div className="cart-item-img-placeholder">🪷</div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="cart-item-info">
                    <h4 className="cart-item-name">{p.name}</h4>
                    <div className="cart-item-meta">
                      <span className="cart-item-badge">{p.category || 'Ethnic'}</span>
                      <span className="cart-item-size">Size: {p.size}</span>
                    </div>
                    <div className="cart-item-price">{fmt(p.price)}</div>
                  </div>

                  {/* Qty + Remove */}
                  <div className="cart-item-controls">
                    <div className="cart-qty-control">
                      <button
                        className="cart-qty-btn"
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >−</button>
                      <span className="cart-qty-val">{item.quantity}</span>
                      <button
                        className="cart-qty-btn"
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                      >+</button>
                    </div>
                    <div className="cart-item-subtotal">{fmt(p.price * item.quantity)}</div>
                    <button
                      className="cart-remove-btn"
                      onClick={() => handleRemove(item._id, p.name)}
                      title="Remove from cart"
                    >
                      <i className="bi bi-x-circle" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="cart-summary-col">
            <div className="cart-summary-card">
              <h3 className="cart-summary-title">
                <i className="bi bi-receipt" /> Order Summary
              </h3>
              <div className="cart-summary-row">
                <span>Items ({items.length})</span>
                <span>{fmt(total)}</span>
              </div>
              <div className="cart-summary-divider" />
              <div className="cart-summary-total">
                <span>Total</span>
                <span className="cart-total-price">{fmt(total)}</span>
              </div>

              <div className="cart-summary-note">
                <i className="bi bi-info-circle" />
                Prices shown are exclusive of taxes. Contact us to place your order.
              </div>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `✨ Hi! I'm interested in placing an order from SANGEET.\n\n` +
                  items.map(item => {
                    const p = item.product;
                    return `• ${p?.name} (${p?.size}) — ₹${p?.price} × ${item.quantity}`;
                  }).join('\n') +
                  `\n\n💰 Total: ${fmt(total)}\n\nPlease confirm availability.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cart-whatsapp-btn"
              >
                <i className="bi bi-whatsapp" /> Enquire on WhatsApp
              </a>

              <Link to="/products" className="cart-continue-btn">
                <i className="bi bi-arrow-left" /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Cart;
