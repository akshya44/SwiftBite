import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Toast from '../components/Toast';
import Spinner from '../components/Spinner';

export default function Profile() {
  const { user, login, token } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', address: user?.address || '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  if (!user) return (
    <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>
      <p style={{ color: '#94a3b8' }}>Please log in to view your profile</p>
    </div>
  );

  const roleLabel = { customer: '🛒 Customer', restaurant: '🍳 Restaurant Owner', admin: '⚡ Admin' };
  const roleColors = { customer: '#3b82f6', restaurant: '#f97316', admin: '#a855f7' };

  return (
    <div className="page-container animate-fadeIn" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="section-title" style={{ marginBottom: '2rem' }}>👤 My Profile</h1>

      {/* Profile Card */}
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
        {/* Avatar */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1rem',
          background: 'linear-gradient(135deg, #f97316, #ea580c)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', fontWeight: 700,
        }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.4rem', marginBottom: '0.25rem' }}>
          {user.name}
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{user.email}</p>
        <span style={{
          display: 'inline-block', padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
          background: `rgba(${roleColors[user.role] === '#3b82f6' ? '59,130,246' : roleColors[user.role] === '#f97316' ? '249,115,22' : '168,85,247'},0.15)`,
          color: roleColors[user.role],
          border: `1px solid ${roleColors[user.role]}40`,
        }}>
          {roleLabel[user.role]}
        </span>
      </div>

      {/* Edit form */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.05rem' }}>
          Account Details
        </h3>

        {/* Email read-only */}
        <div style={{ marginBottom: '1.1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: '#cbd5e1' }}>
            Email
          </label>
          <div className="input-field" style={{ color: '#64748b', cursor: 'not-allowed' }}>
            {user.email}
          </div>
        </div>

        <div style={{ marginBottom: '1.1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: '#cbd5e1' }}>
            Full Name
          </label>
          <input
            type="text"
            className="input-field"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: '#cbd5e1' }}>
            Default Delivery Address
          </label>
          <textarea
            className="input-field"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            rows={3}
            style={{ resize: 'vertical' }}
          />
        </div>

        <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1rem' }}>
          ℹ️ Profile editing coming soon — currently displaying your registration data.
        </p>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
