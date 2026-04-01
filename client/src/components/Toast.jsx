import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icon = type === 'success' ? '✅' : '❌';

  return (
    <div className={`toast ${type === 'error' ? 'error' : ''}`}>
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
      <button
        onClick={onClose}
        style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.1rem' }}
      >×</button>
    </div>
  );
}
