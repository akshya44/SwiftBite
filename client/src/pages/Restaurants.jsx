import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function RestaurantSkeleton() {
  return (
    <div style={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
      <div className="skeleton" style={{ width: '100%', height: '180px' }} />
      <div style={{ padding: '1.25rem' }}>
        <div className="skeleton" style={{ height: '20px', width: '70%', marginBottom: '0.75rem' }} />
        <div className="skeleton" style={{ height: '14px', width: '50%', marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ height: '14px', width: '40%' }} />
      </div>
    </div>
  );
}

const CUISINES = ['All', 'Indian', 'Chinese', 'Italian', 'Mexican', 'Japanese', 'American', 'Thai'];

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('All');

  useEffect(() => {
    api.get('/restaurants')
      .then((res) => setRestaurants(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = restaurants.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisineType.toLowerCase().includes(search.toLowerCase());
    const matchesCuisine = cuisine === 'All' || r.cuisineType.toLowerCase() === cuisine.toLowerCase();
    return matchesSearch && matchesCuisine;
  });

  return (
    <div className="page-container animate-fadeIn">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title" style={{ marginBottom: '0.5rem' }}>
          🍽️ All Restaurants
        </h1>
        <p style={{ color: '#94a3b8' }}>Discover amazing food near you</p>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
          <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>🔍</span>
          <input
            id="restaurant-search"
            type="text"
            className="input-field"
            placeholder="Search by name or cuisine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        {/* Cuisine chips */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {CUISINES.map((c) => (
            <button
              key={c}
              onClick={() => setCuisine(c)}
              style={{
                padding: '0.45rem 1rem',
                border: `1px solid ${cuisine === c ? '#f97316' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '20px',
                background: cuisine === c ? 'rgba(249,115,22,0.15)' : 'transparent',
                color: cuisine === c ? '#f97316' : '#94a3b8',
                fontSize: '0.82rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: "'Inter', sans-serif",
              }}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {Array(6).fill(0).map((_, i) => <RestaurantSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍽️</div>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.4rem', marginBottom: '0.5rem' }}>
            No restaurants found
          </h3>
          <p style={{ color: '#94a3b8' }}>Try adjusting your search or filter</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filtered.map((r) => (
            <Link key={r._id} to={`/restaurants/${r._id}`} style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{ overflow: 'hidden', height: '100%' }}>
                {/* Image */}
                <div style={{
                  width: '100%', height: '180px', overflow: 'hidden',
                  background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                  position: 'relative',
                }}>
                  {r.imageUrl ? (
                    <img
                      src={r.imageUrl}
                      alt={r.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
                      🍽️
                    </div>
                  )}
                  {/* Open/Closed badge */}
                  <span
                    className={`badge badge-${r.isOpen ? 'open' : 'closed'}`}
                    style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}
                  >
                    {r.isOpen ? '● Open' : '● Closed'}
                  </span>
                </div>

                {/* Info */}
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.35rem' }}>
                    {r.name}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{r.cuisineType}</p>
                  {r.description && (
                    <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.75rem', lineHeight: 1.5,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span style={{ color: '#fbbf24' }}>★</span>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.rating?.toFixed(1)}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>📍 {r.address?.split(',')[0]}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
