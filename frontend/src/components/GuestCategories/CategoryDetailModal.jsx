import React, { useState, useMemo, useEffect } from 'react';

export default function CategoryDetailModal({ isOpen, onClose, category, guests, onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (isOpen) setCurrentPage(1);
  }, [isOpen, category]);

  const paginatedGuests = useMemo(() => {
    if (!guests) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return guests.slice(startIndex, startIndex + itemsPerPage);
  }, [guests, currentPage]);

  const totalPages = guests ? Math.ceil(guests.length / itemsPerPage) : 0;

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
              paginatedGuests.map((g) => (
                <div key={g.guest_id} className="category-member-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)' }}>{g.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                      {g.email || 'No email'}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        type="button" 
                        onClick={() => onEdit(g)}
                        style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Edit
                      </button>
                      <button 
                        type="button" 
                        onClick={() => onDelete(g)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button 
                type="button" 
                className="btn-secondary" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
              >
                Next
              </button>
            </div>
          )}
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
