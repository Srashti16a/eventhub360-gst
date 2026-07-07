import React, { useState } from 'react';

export default function GuestTable({
  guests,
  selectedGuestIds,
  onSelectGuest,
  onSelectAllGuests,
  onEditGuest,
  onDeleteGuest,
  onCheckinGuest,
  onViewQRCode,
  onViewDetails,
  layout
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);

  const toggleMenu = (e, guestId) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === guestId ? null : guestId);
  };

  // Close menu when clicking elsewhere
  React.useEffect(() => {
    const handleClose = () => setActiveMenuId(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'yes':
      case 'confirmed':
        return 'confirmed';
      case 'no':
      case 'declined':
        return 'declined';
      case 'maybe':
      case 'pending':
      default:
        return 'pending';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'yes':
      case 'confirmed':
        return 'Confirmed';
      case 'no':
      case 'declined':
        return 'Declined';
      case 'maybe':
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const isAllSelected = guests.length > 0 && guests.every((g) => selectedGuestIds.includes(g.guest_id));

  if (layout === 'grid') {
    return (
      <div className="guest-grid-view">
        {guests.map((g) => {
          const rsvpStatus = g.rsvpStatus || 'pending';
          const isVip = g.category?.toLowerCase().includes('vip') || g.isVip;
          const isSpeaker = g.groupName?.toLowerCase().includes('speaker') || g.isSpeaker;

          return (
            <div key={g.guest_id} className="guest-grid-card">
              <div className="guest-grid-card-header">
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <label className="custom-checkbox" style={{ marginRight: '2px', display: 'flex' }}>
                    <input
                      type="checkbox"
                      checked={selectedGuestIds.includes(g.guest_id)}
                      onChange={() => onSelectGuest(g.guest_id)}
                    />
                    <span className="checkbox-checkmark"></span>
                  </label>
                  {g.avatarUrl ? (
                    <img src={g.avatarUrl} alt={g.name} className="guest-avatar" />
                  ) : (
                    <div className="guest-avatar-placeholder">{getInitials(g.name)}</div>
                  )}
                  <div>
                    <h4 className="guest-name" style={{ margin: 0 }} onClick={() => onEditGuest(g)}>
                      {g.name}
                    </h4>
                    <div className="guest-badges-row" style={{ marginTop: '0.25rem' }}>
                      {isVip && <span className="guest-badge vip">VIP</span>}
                      {isSpeaker && <span className="guest-badge speaker">Speakers</span>}
                      {g.groupName && !isSpeaker && (
                        <span className={`guest-badge ${g.groupName.toLowerCase().includes('bridal') ? 'bridal-party' : 'primary-guest'}`}>
                          {g.groupName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="actions-menu-wrapper">
                  <button type="button" className="btn-icon" onClick={(e) => toggleMenu(e, g.guest_id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '16px', height: '16px' }}>
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                  {activeMenuId === g.guest_id && (
                    <div className="dropdown-menu-custom" style={{ top: '100%', right: 0 }}>
                      <button type="button" className="dropdown-item-custom" onClick={() => { setActiveMenuId(null); onViewDetails(g); }}>
                        View Guest Details
                      </button>
                      <button type="button" className="dropdown-item-custom" onClick={() => onEditGuest(g)}>
                        Edit Guest
                      </button>
                      <button type="button" className="dropdown-item-custom" onClick={() => onCheckinGuest(g)}>
                        {g.checkedInAt ? 'Update Check-in' : 'Check In'}
                      </button>
                      <button type="button" className="dropdown-item-custom" onClick={() => onViewQRCode(g)}>
                        View QR Code
                      </button>
                      <button type="button" className="dropdown-item-custom danger" onClick={() => onDeleteGuest(g.guest_id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="guest-grid-card-body">
                <div className="grid-card-row">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{g.phone || 'No phone'}</span>
                </div>
                {g.email && (
                  <div className="grid-card-row">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{g.email}</span>
                  </div>
                )}
                <div className="grid-card-row">
                  <span className="grid-card-label">Category:</span>
                  <span>{g.eventName || 'Unassigned Event'}</span>
                </div>
                <div className="grid-card-row">
                  <span className="grid-card-label">Status:</span>
                  <span className={`status-pill ${getStatusClass(rsvpStatus)}`}>{getStatusLabel(rsvpStatus)}</span>
                </div>
                <div className="grid-card-row">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{g.assignedHotel || '—'}</span>
                </div>
                {g.checkedInAt && (
                  <div className="grid-card-row" style={{ color: 'var(--status-confirmed-text)', fontWeight: 600 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Checked In: {new Date(g.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="premium-table">
        <thead>
          <tr>
            <th className="checkbox-cell">
              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => onSelectAllGuests(e.target.checked)}
                />
                <span className="checkbox-checkmark"></span>
              </label>
            </th>
            <th>Guest Name</th>
            <th>Contact Info</th>
            <th>Category</th>
            <th>Status</th>
            <th>Assigned Hotel</th>
            <th className="action-cell"></th>
          </tr>
        </thead>
        <tbody>
          {guests.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '3rem' }}>
                No guests found. Click the "+" button below or Bulk Import to get started.
              </td>
            </tr>
          ) : (
            guests.map((g) => {
              const isSelected = selectedGuestIds.includes(g.guest_id);
              const rsvpStatus = g.rsvpStatus || 'pending';
              const isVip = g.category?.toLowerCase().includes('vip') || g.isVip;
              const isSpeaker = g.groupName?.toLowerCase().includes('speaker') || g.isSpeaker;

              return (
                <tr key={g.guest_id}>
                  <td className="checkbox-cell">
                    <label className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectGuest(g.guest_id)}
                      />
                      <span className="checkbox-checkmark"></span>
                    </label>
                  </td>
                  <td>
                    <div className="guest-info-cell">
                      {g.avatarUrl ? (
                        <img src={g.avatarUrl} alt={g.name} className="guest-avatar" />
                      ) : (
                        <div className="guest-avatar-placeholder">{getInitials(g.name)}</div>
                      )}
                      <div className="guest-name-wrap">
                        <span className="guest-name" onClick={() => onEditGuest(g)}>
                          {g.name}
                        </span>
                        <div className="guest-badges-row">
                          {isVip && <span className="guest-badge vip">VIP</span>}
                          {isSpeaker && <span className="guest-badge speaker">Speakers</span>}
                          {g.groupName && !isSpeaker && (
                            <span
                              className={`guest-badge ${
                                g.groupName.toLowerCase().includes('bridal') ? 'bridal-party' : 'primary-guest'
                              }`}
                            >
                              {g.groupName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info-cell">
                      <span className="contact-email">{g.email || '—'}</span>
                      <span className="contact-phone">{g.phone || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>
                      {g.eventName || '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill ${getStatusClass(rsvpStatus)}`}>
                      {getStatusLabel(rsvpStatus)}
                    </span>
                  </td>
                  <td>
                    <div className="hotel-cell">
                      {g.assignedHotel && g.assignedHotel !== '—' ? (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span>{g.assignedHotel}</span>
                        </>
                      ) : (
                        <span>—</span>
                      )}
                    </div>
                  </td>
                  <td className="action-cell">
                    <div className="actions-menu-wrapper">
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={(e) => toggleMenu(e, g.guest_id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          style={{ width: '16px', height: '16px' }}
                        >
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      {activeMenuId === g.guest_id && (
                        <div className="dropdown-menu-custom">
                          <button
                            type="button"
                            className="dropdown-item-custom"
                            onClick={() => { setActiveMenuId(null); onViewDetails(g); }}
                          >
                            View Guest Details
                          </button>
                          <button
                            type="button"
                            className="dropdown-item-custom"
                            onClick={() => onEditGuest(g)}
                          >
                            Edit Guest
                          </button>
                          <button
                            type="button"
                            className="dropdown-item-custom"
                            onClick={() => onCheckinGuest(g)}
                          >
                            {g.checkedInAt ? 'Update Check-in' : 'Check In'}
                          </button>
                          <button
                            type="button"
                            className="dropdown-item-custom"
                            onClick={() => onViewQRCode(g)}
                          >
                            View QR Code
                          </button>
                          <button
                            type="button"
                            className="dropdown-item-custom danger"
                            onClick={() => onDeleteGuest(g.guest_id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
