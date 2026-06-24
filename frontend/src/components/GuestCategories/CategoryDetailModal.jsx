import React from 'react';

export default function CategoryDetailModal({ isOpen, onClose, category, guests }) {
  if (!isOpen || !category) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>{category.name} Class Members</h2>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close details">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
            List of registered attendees categorized under <strong>{category.name}</strong> (`guest.category` column).
          </p>

          <div className="category-members-list">
            {guests.length === 0 ? (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', padding: '2rem 0', display: 'block', textAlign: 'center' }}>
                No attendees registered under this classification yet.
              </span>
            ) : (
              guests.map((g) => (
                <div key={g.guest_id} className="category-member-item">
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)' }}>{g.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.phone}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                    {g.email || 'No email'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
