import React, { useState, useEffect, useRef } from 'react';

export default function RecentResponses({ responses, searchQuery, setSearchQuery, onViewAllGuests, onDeleteGuest, onEditGuestStatus }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [actionModal, setActionModal] = useState(null); // 'view', 'edit', null
  const [activeGuest, setActiveGuest] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const menuRef = useRef(null);
  const filterRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuRef, filterRef]);

  const handleDeleteClick = (id) => {
    setActiveMenuId(null);
    if (window.confirm('Are you sure you want to delete this guest?')) {
      onDeleteGuest(id);
    }
  };

  const handleEditClick = (guest) => {
    setActiveMenuId(null);
    setActiveGuest(guest);
    setEditStatus(guest.status);
    setActionModal('edit');
  };

  const handleViewClick = (guest) => {
    setActiveMenuId(null);
    setActiveGuest(guest);
    setActionModal('view');
  };

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

  const filteredResponses = responses.filter(r => {
    const matchesCat = selectedCategories.length === 0 || selectedCategories.includes(r.category);
    
    const rsvpStatus = r.status?.toLowerCase();
    const normalizedStatus = (rsvpStatus === 'accepted' || rsvpStatus === 'confirmed') ? 'Accepted' : 
                             (rsvpStatus === 'declined' ? 'Declined' : 'Pending');
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(normalizedStatus);

    const matchesSearch = !searchQuery || 
      (r.name && r.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (r.email && r.email.toLowerCase().includes(searchQuery.toLowerCase()));
      
    return matchesCat && matchesStatus && matchesSearch;
  });

  const displayedResponses = filteredResponses.slice(0, 10);

  return (
    <div className="recent-responses-card">
      <div className="recent-responses-card-header">
        <h3>Recent Responses</h3>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Search Input for filtering guests */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.8rem' }}>🔍</span>
            <input
              type="text"
              placeholder="Search guests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '0.375rem 0.75rem 0.375rem 2rem',
                fontSize: '0.8rem',
                outline: 'none',
                width: '160px',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          <div style={{ position: 'relative' }} ref={filterRef}>
            <button 
              type="button" 
              className={`control-btn ${isFilterOpen ? 'active' : ''}`}
              style={{ width: '32px', height: '32px', position: 'relative', backgroundColor: isFilterOpen ? 'var(--bg-hover)' : '#fff' }} 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {(selectedCategories.length > 0 || selectedStatuses.length > 0) && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ff4d4f', width: '8px', height: '8px', borderRadius: '50%' }}></span>
              )}
            </button>

            {isFilterOpen && (
              <div style={{ position: 'absolute', top: '100%', right: '0', marginTop: '0.5rem', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, width: '220px', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>Categories</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                  {['VIP', 'Speaker', 'Family', 'Corporate', 'Sponsor', 'Media', 'Staff', 'Standard'].map(cat => (
                    <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedCategories.includes(cat)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedCategories([...selectedCategories, cat]);
                          else setSelectedCategories(selectedCategories.filter(c => c !== cat));
                        }}
                      />
                      {cat}
                    </label>
                  ))}
                </div>

                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>Status</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {['Accepted', 'Declined', 'Pending'].map(status => (
                    <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedStatuses.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedStatuses([...selectedStatuses, status]);
                          else setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                        }}
                      />
                      {status}
                    </label>
                  ))}
                </div>
              </div>
            )}
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
            {displayedResponses.map((row) => (
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
                <td style={{ position: 'relative' }}>
                  <button 
                    type="button" 
                    className="btn-icon" 
                    onClick={() => setActiveMenuId(activeMenuId === row.id ? null : row.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '16px', height: '16px' }}>
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                  
                  {activeMenuId === row.id && (
                    <div 
                      ref={menuRef}
                      style={{
                        position: 'absolute',
                        right: '100%',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        padding: '0.5rem 0',
                        minWidth: '140px',
                        zIndex: 100,
                        marginRight: '8px'
                      }}
                    >
                      <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', color: '#1e293b' }} onClick={() => handleViewClick(row)}>View Details</button>
                      <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', color: '#1e293b' }} onClick={() => handleEditClick(row)}>Edit RSVP</button>
                      <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} onClick={() => handleDeleteClick(row.id)}>Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredResponses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
            No guests found matching your search.
          </div>
        )}
      </div>

      <div className="recent-responses-footer">
        <span className="recent-responses-footer-link" onClick={onViewAllGuests}>
          View All Guests
        </span>
      </div>

      {/* View Details Modal */}
      {actionModal === 'view' && activeGuest && (
        <div className="modal-overlay" onClick={() => setActionModal(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', padding: '1.5rem' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: '#1e293b' }}>Guest Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: '#475569' }}>
              <div><strong>Name:</strong> {activeGuest.name}</div>
              <div><strong>Email:</strong> {activeGuest.email}</div>
              <div><strong>Category:</strong> {activeGuest.category}</div>
              <div><strong>RSVP Status:</strong> {activeGuest.status}</div>
              <div><strong>Response Date:</strong> {activeGuest.responseDate}</div>
            </div>
            <button className="btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => setActionModal(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Edit RSVP Modal */}
      {actionModal === 'edit' && activeGuest && (
        <div className="modal-overlay" onClick={() => setActionModal(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', padding: '1.5rem' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: '#1e293b' }}>Edit RSVP Status</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>Status for {activeGuest.name}</label>
              <select 
                className="dropdown-styled" 
                value={editStatus} 
                onChange={(e) => setEditStatus(e.target.value)}
                style={{ padding: '0.5rem', width: '100%' }}
              >
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Declined">Declined</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setActionModal(null)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => {
                onEditGuestStatus(activeGuest.id, editStatus);
                setActionModal(null);
              }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
