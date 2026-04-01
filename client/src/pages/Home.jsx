import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <section style={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background gradient orbs */}
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div style={{ textAlign: 'center', maxWidth: '800px', position: 'relative' }} className="animate-fadeIn">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)',
            borderRadius: '20px', padding: '0.4rem 1rem', marginBottom: '2rem',
            fontSize: '0.85rem', color: '#f97316', fontWeight: 600,
          }}>
            🚀 Fast Delivery • Fresh Food • Great Price
          </div>

          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '1.5rem',
            color: '#f8fafc',
          }}>
            Hungry? We've Got<br />
            <span className="gradient-text">Your Next Meal</span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#94a3b8', marginBottom: '2.5rem', lineHeight: 1.7, maxWidth: '550px', margin: '0 auto 2.5rem' }}>
            Order from the best local restaurants and track your delivery in real-time. Fast, fresh, and delivered to your door.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/restaurants" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.9rem 2rem' }}>
                🍽️ Browse Restaurants
              </button>
            </Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ fontSize: '1rem', padding: '0.9rem 2rem' }}>
                Join SwiftBite
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem',
            marginTop: '4rem', padding: '2rem', background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px',
          }}>
            {[
              { value: '200+', label: 'Restaurants' },
              { value: '50K+', label: 'Orders Delivered' },
              { value: '30 min', label: 'Avg Delivery' },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#f97316' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ textAlign: 'center', fontFamily: "'Outfit', sans-serif", fontSize: '2rem', fontWeight: 700, marginBottom: '3rem' }}>
          Why Choose <span className="gradient-text">SwiftBite</span>?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: '⚡', title: 'Lightning Fast', desc: 'Get your food delivered in 30 minutes or less, guaranteed.' },
            { icon: '🍕', title: 'Huge Selection', desc: 'Choose from 200+ local restaurants with diverse cuisines.' },
            { icon: '📍', title: 'Live Tracking', desc: 'Track your order in real-time from kitchen to your door.' },
            { icon: '💰', title: 'Best Prices', desc: 'Competitive pricing with no hidden fees and flat delivery rates.' },
          ].map((f) => (
            <div key={f.title} className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
