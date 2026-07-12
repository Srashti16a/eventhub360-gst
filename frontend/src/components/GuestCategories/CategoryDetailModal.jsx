import React, { useState, useMemo, useEffect, useRef } from 'react';

export default function CategoryDetailModal({ isOpen, onClose, category, guests, onEdit, onDelete, onViewGuest360 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
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
                <div
                  key={g.guest_id}
                  className="category-member-item"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background-color 0.15s' }}
                  onClick={() => { if (onViewGuest360) onViewGuest360(g, category); }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ flex: '2', display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{g.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.email || 'No email'}</span>
                  </div>
                  
                  <div style={{ flex: '1.5', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                    {g.phone || 'No phone'}
                  </div>
                  
                  <div style={{ flex: '1' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '12px', 
                      backgroundColor: g.rsvpStatus === 'confirmed' ? '#dcfce7' : g.rsvpStatus === 'declined' ? '#fee2e2' : '#f3f4f6',
                      color: g.rsvpStatus === 'confirmed' ? '#166534' : g.rsvpStatus === 'declined' ? '#991b1b' : '#374151'
                    }}>
                      {(g.rsvpStatus || 'Pending').toUpperCase()}
                    </span>
                  </div>
                  
                  <div style={{ position: 'relative' }} ref={openMenuId === g.guest_id ? menuRef : null}>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === g.guest_id ? null : g.guest_id); }}
                      style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    {openMenuId === g.guest_id && (
                      <div style={{
                        position: 'absolute', top: '100%', right: '0', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 20, minWidth: '135px', padding: '0.25rem 0'
                      }}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); if (onViewGuest360) onViewGuest360(g, category); }}
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#1e293b', fontWeight: '600', background: 'transparent', border: 'none', cursor: 'pointer' }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          View 360 Profile
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); onEdit(g); }}
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#374151', background: 'transparent', border: 'none', cursor: 'pointer' }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          Edit Guest
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); onDelete(g); }}
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          Delete Guest
                        </button>
                      </div>
                    )}
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
