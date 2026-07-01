import React, { useState, useEffect, useRef } from 'react';

const CustomDropdown = ({ value, options, onChange, width = '150px' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div style={{ position: 'relative', width }} ref={ref}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.375rem 0.75rem',
          backgroundColor: '#fff',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          fontSize: '0.8rem',
          color: 'var(--text-main)',
          cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          transition: 'all 0.2s',
          outline: isOpen ? '2px solid var(--primary-color)' : 'none',
        }}
      >
        <span>{selectedOption.label}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#94a3b8', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          backgroundColor: '#fff',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 50,
          maxHeight: '250px',
          overflowY: 'auto',
          padding: '4px 0'
        }}>
          {options.map((opt) => (
            <div 
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                backgroundColor: value === opt.value ? 'var(--bg-hover)' : 'transparent',
                color: value === opt.value ? 'var(--primary-color)' : 'var(--text-main)',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (value !== opt.value) e.target.style.backgroundColor = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                if (value !== opt.value) e.target.style.backgroundColor = 'transparent';
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function RecentResponses({ responses, searchQuery, setSearchQuery, onViewAllGuests, onDeleteGuest, onEditGuestStatus }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [actionModal, setActionModal] = useState(null); // 'view', 'edit', null
  const [activeGuest, setActiveGuest] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuRef]);

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
    const matchesCat = selectedCategory === 'All' || r.category === selectedCategory;
    
    const rsvpStatus = r.status?.toLowerCase();
    const normalizedStatus = (rsvpStatus === 'accepted' || rsvpStatus === 'confirmed') ? 'Accepted' : 
                             (rsvpStatus === 'declined' ? 'Declined' : 'Pending');
    const matchesStatus = selectedStatus === 'All' || normalizedStatus === selectedStatus;

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

          <CustomDropdown 
            width="160px"
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={[
              { value: 'All', label: 'All Categories' },
              { value: 'VIP', label: 'VIP' },
              { value: 'Speaker', label: 'Speaker' },
              { value: 'Family', label: 'Family' },
              { value: 'Corporate', label: 'Corporate' },
              { value: 'Sponsor', label: 'Sponsor' },
              { value: 'Media', label: 'Media' },
              { value: 'Staff', label: 'Staff' },
              { value: 'Standard', label: 'Standard' }
            ]}
          />

          <CustomDropdown 
            width="140px"
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[
              { value: 'All', label: 'All Status' },
              { value: 'Accepted', label: 'Accepted' },
              { value: 'Declined', label: 'Declined' },
              { value: 'Pending', label: 'Pending' }
            ]}
          />
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
                  <span className={`guest-badge ${
                    row.category?.toLowerCase() === 'vip' ? 'vip' :
                    row.category?.toLowerCase() === 'speaker' ? 'speaker' :
                    row.category?.toLowerCase() === 'family' ? 'bridal-party' :
                    'primary-guest'
                  }`}>
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
