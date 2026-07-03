import React, { useState, useEffect } from 'react';

export default function GroupDetailDrawer({
  group,
  onClose,
  onAddMember,
  onRemoveMember,
  onEditClick,
  onEditMember
}) {
  const [showAddSelect, setShowAddSelect] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);

  useEffect(() => {
    if (!showAddSelect) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedGuest(null);
      return;
    }
    setSearching(true);
    fetch(`/api/groups/${group.group_id}/search-guests?q=${encodeURIComponent(searchQuery)}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setSearchResults(res.data);
        }
      })
      .catch((err) => console.error('Error searching guests:', err))
      .finally(() => setSearching(false));
  }, [searchQuery, showAddSelect, group.group_id]);

  if (!group) return null;

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="groups-detail-drawer">
      {/* Header */}
      <div className="drawer-header">
        <div>
          <h3>{group.name}</h3>
          <p>{group.category || 'FAMILY'} GROUP DETAILS</p>
        </div>
        <button type="button" className="btn-close" onClick={onClose} aria-label="Close details">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 2x2 Metrics Grid */}
      <div className="drawer-metrics-grid">
        <div className="metric-block">
          <div className="metric-block-label">Primary Guest</div>
          <div className="metric-block-value">{group.primaryGuestName || 'Unassigned'}</div>
        </div>
        <div className="metric-block">
          <div className="metric-block-label">Primary Location</div>
          <div className="metric-block-value">{group.location || 'New York, USA'}</div>
        </div>
        <div className="metric-block">
          <div className="metric-block-label">Dietary Needs</div>
          <div className="metric-block-value">{group.dietaryNeeds || 'None Reported'}</div>
        </div>
        <div className="metric-block">
          <div className="metric-block-label">Transportation</div>
          <div className="metric-block-value">{group.transportation || 'Standard Bus'}</div>
        </div>
      </div>

      {/* Members Section */}
      <div>
        <div className="drawer-members-header" style={{ marginBottom: '0.75rem' }}>
          <div className="drawer-members-title">
            <span>Members</span>
            <span className="members-count-badge">{group.members?.length || 0}</span>
          </div>
          <button type="button" className="btn-add-member" onClick={() => setShowAddSelect(!showAddSelect)}>
            {showAddSelect ? 'Cancel' : '+ Add Member'}
          </button>
        </div>

        {/* Add Member Selector with Autocomplete Search */}
        {showAddSelect && (
          <div className="member-search-container" style={{ marginBottom: '1rem', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedGuest(null);
              }}
              style={{ width: '100%', paddingRight: '2rem', boxSizing: 'border-box' }}
            />
            {searching && (
              <span style={{ position: 'absolute', right: '0.75rem', top: '25%', transform: 'translateY(-20%)', fontSize: '0.8rem', color: 'var(--text-light)' }}>
                 ⌛
              </span>
            )}

            {/* Results Dropdown */}
            {searchQuery.trim().length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                maxHeight: '180px',
                overflowY: 'auto',
                zIndex: 10,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                marginTop: '0.25rem'
              }}>
                {searching ? (
                  <div style={{ padding: '0.5rem', fontSize: '0.8rem', color: 'var(--text-light)' }}>Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div style={{ padding: '0.5rem', fontSize: '0.8rem', color: 'var(--text-light)' }}>No guests found</div>
                ) : (
                  searchResults.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => {
                        setSelectedGuest(g);
                        setSearchQuery(g.name);
                        setSearchResults([]);
                      }}
                      style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        background: selectedGuest?.id === g.id ? '#f1f5f9' : 'transparent',
                        borderBottom: '1px solid #f1f5f9'
                      }}
                    >
                      <div style={{ fontWeight: '600' }}>{g.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{g.email || 'No email'} | {g.phone || 'No phone'}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem' }}
                disabled={!selectedGuest}
                onClick={() => {
                  onAddMember(group.group_id, selectedGuest.id);
                  setSelectedGuest(null);
                  setSearchQuery('');
                  setShowAddSelect(false);
                }}
              >
                Add Selected Member
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.45rem', fontSize: '0.8rem' }}
                onClick={() => setShowAddSelect(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Members List */}
        <div className="drawer-members-list">
          {(!group.members || group.members.length === 0) ? (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', padding: '0.5rem 0', display: 'block' }}>
              No members in this group yet.
            </span>
          ) : (
            group.members.map((member) => (
              <div key={member.id} className="drawer-member-row">
                <div className="member-info-left">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                  ) : (
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#f1f5f9',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {getInitials(member.name)}
                    </div>
                  )}
                  <div>
                    <span className="member-name">{member.name}</span>
                    <div className="member-relation">
                      {member.id === group.primaryGuestId ? 'Primary contact' : 'Member'}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    className="btn-remove-member"
                    style={{ background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer', padding: '4px' }}
                    onClick={() => onEditMember(member)}
                    title="Edit member details"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '14px', height: '14px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="btn-remove-member"
                    onClick={() => onRemoveMember(group.group_id, member.id)}
                    title="Remove from group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '14px', height: '14px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Special Requirements */}
      <div className="special-requirements-box">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="special-requirements-content">
          <strong>Special Requirements</strong>
          <ul>
            <li>
              {group.specialRequirement || `${group.primaryGuestName || 'Primary'} requires standard check-in procedures.`}
            </li>
          </ul>
        </div>
      </div>

      {/* Edit Details Action Button */}
      <button type="button" className="btn-slate-action" onClick={() => onEditClick(group)}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        <span>Edit Group Details</span>
      </button>
    </div>
  );
}
