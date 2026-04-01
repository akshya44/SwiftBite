import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

function MenuItemCard({ item, restaurantId, onAdd }) {
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAdd = () => {
    addToCart({ ...item, quantity: qty }, restaurantId);
    onAdd(item.name);
  };

  if (!item.isAvailable) return null;

  return (
    <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
      {/* Image */}
      <div style={{
        width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0,
        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
      }}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🍽️</div>
        )}
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem', color: '#f8fafc' }}>{item.name}</h4>
        {item.description && (
          <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '0.5rem',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.description}
          </p>
        )}
        <div style={{ fontWeight: 700, color: '#f97316', fontSize: '1rem' }}>₹{item.price}</div>
      </div>

      {/* Add control */}
      {isAuthenticated && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '6px',
                width: '28px', height: '28px', cursor: 'pointer', color: 'white', fontSize: '1rem' }}
            >−</button>
            <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 600 }}>{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '6px',
                width: '28px', height: '28px', cursor: 'pointer', color: 'white', fontSize: '1rem' }}
            >+</button>
          </div>
          <button
            onClick={handleAdd}
            className="btn-primary"
            style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', whiteSpace: 'nowrap' }}
          >
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div>
      <div className="skeleton" style={{ height: '280px', borderRadius: '16px', marginBottom: '1.5rem' }} />
      <div className="skeleton" style={{ height: '28px', width: '50%', marginBottom: '0.75rem' }} />
      <div className="skeleton" style={{ height: '18px', width: '30%', marginBottom: '1rem' }} />
      {[1,2,3].map(i => (
        <div key={i} className="skeleton" style={{ height: '90px', marginBottom: '0.75rem', borderRadius: '12px' }} />
      ))}
    </div>
  );
}

export default function RestaurantDetail() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(`/restaurants/${id}`),
      api.get(`/restaurants/${id}/menu`),
    ]).then(([rRes, mRes]) => {
      setRestaurant(rRes.data);
      setMenu(mRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  // Group menu by category
  const grouped = menu.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const handleAdd = (name) => setToast({ message: `${name} added to cart!`, type: 'success' });

  if (loading) return <div className="page-container"><SkeletonDetail /></div>;
  if (!restaurant) return <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>Restaurant not found</div>;

  return (
    <div className="page-container animate-fadeIn">
      {/* Restaurant Header */}
      <div style={{ marginBottom: '2rem', overflow: 'hidden', borderRadius: '20px', position: 'relative' }}>
        <div style={{
          height: '280px', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          position: 'relative', overflow: 'hidden',
        }}>
          {restaurant.imageUrl ? (
            <img src={restaurant.imageUrl} alt={restaurant.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '6rem' }}>🍽️</div>
          )}
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
            background: 'linear-gradient(to top, rgba(15,15,19,1), transparent)',
          }} />
          {/* Info overlay */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                  {restaurant.name}
                </h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{restaurant.cuisineType}</span>
                  <span style={{ color: '#64748b' }}>•</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>📍 {restaurant.address}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ color: '#fbbf24', fontSize: '1.1rem' }}>★</span>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{restaurant.rating?.toFixed(1)}</span>
                </div>
                <span className={`badge badge-${restaurant.isOpen ? 'open' : 'closed'}`}>
                  {restaurant.isOpen ? '● Open Now' : '● Closed'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {restaurant.description && (
        <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.7 }}>{restaurant.description}</p>
      )}

      {/* Menu */}
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Menu
      </h2>

      {Object.keys(grouped).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          No menu items available yet.
        </div>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} style={{ marginBottom: '2.5rem' }}>
            <h3 style={{
              fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.1rem',
              color: '#f97316', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span style={{ width: '4px', height: '1.2em', background: '#f97316', borderRadius: '2px', display: 'inline-block' }} />
              {category}
            </h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {items.map((item) => (
                <MenuItemCard key={item._id} item={item} restaurantId={id} onAdd={handleAdd} />
              ))}
            </div>
          </div>
        ))
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
