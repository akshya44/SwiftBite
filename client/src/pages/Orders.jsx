import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_ORDER = ['pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];

function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status.replace(/-/g, ' ')}</span>;
}

function OrderCard({ order, isOwnerView, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await api.put(`/orders/${order._id}/status`, { status: newStatus });
      setStatus(newStatus);
      if (onStatusChange) onStatusChange(order._id, newStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="glass-card" style={{ overflow: 'hidden', transition: 'all 0.3s ease' }}>
      {/* Header */}
      <div
        style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Restaurant emoji */}
        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(249,115,22,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
          🍽️
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
            {order.restaurantId?.name || 'Restaurant'}
          </div>
          {isOwnerView && order.customerId && (
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              👤 {order.customerId.name} ({order.customerId.email})
            </div>
          )}
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>{date}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
          <StatusBadge status={status} />
          <span style={{ fontWeight: 700, color: '#f97316' }}>₹{order.totalAmount.toFixed(2)}</span>
        </div>

        <span style={{ color: '#64748b', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }}>▾</span>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Items */}
          <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Order Items
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.88rem' }}>
                <span style={{ color: '#cbd5e1' }}>{item.name} × {item.quantity}</span>
                <span style={{ color: '#f97316', fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Address */}
          <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1rem' }}>
            📍 {order.deliveryAddress}
          </div>

          {/* Status update for restaurant owners */}
          {isOwnerView && status !== 'delivered' && status !== 'cancelled' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Update Status:</span>
              <select
                value={status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                disabled={updating}
                style={{
                  background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                  padding: '0.45rem 0.75rem', color: '#f8fafc', fontSize: '0.85rem',
                  cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                }}
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>
                ))}
              </select>
              {updating && <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Updating...</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  const { user } = useAuth();
  const [myOrders, setMyOrders] = useState([]);
  const [restaurantOrders, setRestaurantOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my');
  const isOwner = user?.role === 'restaurant' || user?.role === 'admin';

  const fetchOrders = useCallback(async () => {
    try {
      const [myRes] = await Promise.all([api.get('/orders/my')]);
      setMyOrders(myRes.data);

      if (isOwner) {
        const ownerRes = await api.get('/orders/restaurant');
        setRestaurantOrders(ownerRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isOwner]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleStatusChange = (orderId, newStatus) => {
    setRestaurantOrders((prev) =>
      prev.map((o) => o._id === orderId ? { ...o, status: newStatus } : o)
    );
  };

  const displayOrders = activeTab === 'my' ? myOrders : restaurantOrders;

  return (
    <div className="page-container animate-fadeIn">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="section-title">📦 Orders</h1>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Auto-refreshes every 30s</span>
      </div>

      {/* Tabs for restaurant owners */}
      {isOwner && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {[
            { id: 'my', label: '🛒 My Orders' },
            { id: 'incoming', label: '🍳 Incoming Orders' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.6rem 1.25rem',
                border: `1px solid ${activeTab === tab.id ? '#f97316' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '10px',
                background: activeTab === tab.id ? 'rgba(249,115,22,0.12)' : 'transparent',
                color: activeTab === tab.id ? '#f97316' : '#94a3b8',
                fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease',
                fontFamily: "'Inter', sans-serif", fontSize: '0.9rem',
              }}
            >{tab.label}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {[1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '16px' }} />
          ))}
        </div>
      ) : displayOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.4rem', marginBottom: '0.5rem' }}>
            No orders {activeTab === 'my' ? 'yet' : 'incoming'}
          </h3>
          <p style={{ color: '#94a3b8' }}>
            {activeTab === 'my' ? "You haven't placed any orders yet" : 'No incoming orders from customers'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {displayOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              isOwnerView={activeTab === 'incoming'}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
