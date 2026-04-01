import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive ? 'text-orange-400' : 'text-slate-400 hover:text-white'
    }`;

  return (
    <nav style={{
      background: 'rgba(15,15,19,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🔥</span>
            <span style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.35rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #f97316, #fbbf24)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>SwiftBite</span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
            <NavLink to="/restaurants" className={navLinkClass} style={{ textDecoration: 'none' }}>
              Restaurants
            </NavLink>

            {isAuthenticated && (
              <NavLink to="/orders" className={navLinkClass} style={{ textDecoration: 'none' }}>
                Orders
              </NavLink>
            )}

            {isAuthenticated && (
              <NavLink to="/profile" className={navLinkClass} style={{ textDecoration: 'none' }}>
                Profile
              </NavLink>
            )}

            {/* Cart */}
            <Link to="/cart" style={{ position: 'relative', textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(249,115,22,0.12)',
                border: '1px solid rgba(249,115,22,0.25)',
                borderRadius: '10px',
                padding: '0.5rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={e => e.currentTarget.style.background='rgba(249,115,22,0.2)'}
              onMouseOut={e => e.currentTarget.style.background='rgba(249,115,22,0.12)'}
              >
                <span style={{ fontSize: '1.1rem' }}>🛒</span>
                {totalItems > 0 && (
                  <span style={{
                    background: '#f97316',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '0 0.4rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    minWidth: '20px',
                    textAlign: 'center',
                  }}>{totalItems}</span>
                )}
              </div>
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Hi, <strong style={{ color: '#f8fafc' }}>{user.name.split(' ')[0]}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-ghost"
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <button className="btn-ghost" style={{ fontSize: '0.85rem' }}>Login</button>
                </Link>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <button className="btn-primary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}>
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
