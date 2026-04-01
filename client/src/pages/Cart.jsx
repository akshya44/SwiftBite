import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Toast from '../components/Toast';
import Spinner from '../components/Spinner';

const DELIVERY_FEE = 40;

export default function Cart() {
  const { cartItems, restaurantId, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const total = subtotal + DELIVERY_FEE;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!address.trim()) { setToast({ message: 'Please enter a delivery address', type: 'error' }); return; }
    setLoading(true);
    try {
      await api.post('/orders', {
        restaurantId,
        items: cartItems.map((i) => ({ menuItemId: i._id, quantity: i.quantity })),
        deliveryAddress: address,
      });
      clearCart();
      setToast({ message: '🎉 Order placed successfully!', type: 'success' });
      setTimeout(() => navigate('/orders'), 1500);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to place order', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="page-container animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🛒</div>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Your cart is empty
        </h2>
        <p style={{ color: '#94a3b8', marginBottom: '2rem', maxWidth: '350px' }}>
          Add some delicious items from our restaurants to get started!
        </p>
        <Link to="/restaurants" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}>
            🍽️ Browse Restaurants
          </button>
        </Link>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>Please log in to checkout</p>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <button className="btn-primary">Login to Continue</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container animate-fadeIn">
      <h1 className="section-title" style={{ marginBottom: '2rem' }}>🛒 Your Cart</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
        {/* Cart Items */}
        <div>
          <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {cartItems.map((item) => (
              <div key={item._id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Image */}
                <div style={{ width: '70px', height: '70px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0,
                  background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>🍽️</div>
                  )}
                </div>

                {/* Name + price */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{item.name}</h4>
                  <div style={{ color: '#f97316', fontWeight: 700 }}>₹{item.price}</div>
                </div>

                {/* Quantity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '6px',
                      width: '32px', height: '32px', cursor: 'pointer', color: 'white', fontSize: '1.1rem' }}
                  >−</button>
                  <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 600, fontSize: '1rem' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '6px',
                      width: '32px', height: '32px', cursor: 'pointer', color: 'white', fontSize: '1.1rem' }}
                  >+</button>
                </div>

                {/* Line total */}
                <div style={{ minWidth: '70px', textAlign: 'right', fontWeight: 700, color: '#f8fafc' }}>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item._id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.25rem', flexShrink: 0 }}
                  title="Remove"
                >🗑️</button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary + Checkout */}
        <div>
          <div className="glass-card" style={{ padding: '1.75rem', position: 'sticky', top: '80px' }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.9rem' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.9rem' }}>
                <span>Delivery Fee</span>
                <span>₹{DELIVERY_FEE}</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem',
                display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
                <span>Total</span>
                <span style={{ color: '#f97316' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Delivery address */}
            <form onSubmit={handleCheckout}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: '#cbd5e1' }}>
                  📍 Delivery Address
                </label>
                <textarea
                  id="delivery-address"
                  className="input-field"
                  placeholder="Enter your full delivery address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                id="place-order-btn"
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1rem' }}
                disabled={loading}
              >
                {loading ? <><Spinner size={18} /> Placing Order...</> : '🛍️ Place Order'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
