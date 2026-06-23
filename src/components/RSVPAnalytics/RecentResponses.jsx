import React, { useState } from 'react';

export default function RecentResponses({ responses, onViewAllGuests }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'confirmed';
      case 'declined': return 'declined';
      case 'pending':
      default: return 'pending';
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const filteredResponses = selectedCategory === 'All'
    ? responses
    : responses.filter(r => r.category === selectedCategory);

  return (
    <div className="recent-responses-card">
      <div className="recent-responses-card-header">
        <h3>Recent Responses</h3>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select
            className="dropdown-styled"
            style={{ padding: '0.375rem 2rem 0.375rem 0.75rem', fontSize: '0.8rem' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="VIP">VIP</option>
            <option value="Speaker">Speaker</option>
            <option value="Sponsor">Sponsor</option>
            <option value="Media">Media</option>
            <option value="Staff">Staff</option>
          </select>
          <button type="button" className="control-btn" style={{ width: '32px', height: '32px' }} onClick={() => alert('Filter clicked.')}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table className="premium-table">
          <thead>
            <tr>
              <th>Guest Name</th>
              <th>Category</th>
              <th>RSVP Status</th>
              <th>Response Date</th>
              <th style={{ width: '60px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredResponses.map((row) => (
              <tr key={row.id}>
                <td>
                  <div className="guest-info-cell">
                    {row.avatarUrl ? (
                      <img src={row.avatarUrl} alt={row.name} className="guest-avatar" style={{ width: '32px', height: '32px' }} />
                    ) : (
                      <div className="guest-avatar-placeholder" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                        {getInitials(row.name)}
                      </div>
                    )}
                    <div className="guest-name-wrap">
                      <span className="guest-name" style={{ fontSize: '0.875rem' }}>{row.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{row.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`guest-badge ${row.category?.toLowerCase() === 'vip' ? 'vip' : 'bridal-party'}`}>
                    {row.category}
                  </span>
                </td>
                <td>
                  <span className={`status-pill ${getStatusClass(row.status)}`} style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>
                    <span className={`status-indicator ${row.status?.toLowerCase() === 'accepted' ? 'active' : row.status?.toLowerCase() === 'declined' ? 'draft' : 'archived'}`} style={{ marginRight: '0.25rem' }}></span>
                    {row.status}
                  </span>
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {row.responseDate}
                </td>
                <td>
                  <button type="button" className="btn-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '16px', height: '16px' }}>
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="recent-responses-footer">
        <span className="recent-responses-footer-link" onClick={onViewAllGuests}>
          View All 1,248 Guests
        </span>
      </div>
    </div>
  );
}
