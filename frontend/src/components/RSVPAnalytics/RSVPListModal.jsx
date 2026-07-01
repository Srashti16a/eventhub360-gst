import React, { useMemo } from 'react';

export default function RSVPListModal({ type, guests, onClose }) {
  if (!type) return null;

  const filteredGuests = useMemo(() => {
    if (type === 'total') return guests;
    if (type === 'accepted') return guests.filter(g => g.status?.toLowerCase() === 'accepted' || g.status?.toLowerCase() === 'confirmed');
    if (type === 'declined') return guests.filter(g => g.status?.toLowerCase() === 'declined');
    if (type === 'pending') return guests.filter(g => !g.status || g.status?.toLowerCase() === 'pending');
    return guests;
  }, [type, guests]);

  const titleMap = {
    total: 'Total Invitations',
    accepted: 'Accepted Guests',
    declined: 'Declined Guests',
    pending: 'Pending Guests'
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <h2>{titleMap[type]} ({filteredGuests.length})</h2>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body" style={{ overflowY: 'auto', padding: '0', flex: 1 }}>
          <table className="premium-table" style={{ margin: 0, border: 'none' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-card)', zIndex: 10 }}>
              <tr>
                <th style={{ paddingLeft: '1.5rem' }}>Guest Name</th>
                <th>Category</th>
                <th>RSVP Status</th>
                <th style={{ paddingRight: '1.5rem' }}>Response Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
                    No guests found in this category.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((row) => (
                  <tr key={row.id}>
                    <td style={{ paddingLeft: '1.5rem' }}>
                      <div className="guest-info-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {row.avatarUrl ? (
                          <img src={row.avatarUrl} alt={row.name} className="guest-avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div className="guest-avatar-placeholder" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {getInitials(row.name)}
                          </div>
                        )}
                        <div className="guest-name-wrap" style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className="guest-name" style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-dark)' }}>{row.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{row.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge" style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: 'var(--bg-main)', color: 'var(--text-dark)' }}>
                        {row.category}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${row.status?.toLowerCase() === 'accepted' || row.status?.toLowerCase() === 'confirmed' ? 'confirmed' : row.status?.toLowerCase() === 'declined' ? 'declined' : 'pending'}`} style={{ fontSize: '0.75rem' }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ paddingRight: '1.5rem', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                      {row.responseDate || 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
