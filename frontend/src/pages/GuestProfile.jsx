import React, { useState, useEffect } from 'react';
import './GuestProfile.css';

export default function GuestProfile({ guest, onBack }) {
  // ── Local State Initialization ──
  const initialData = guest || {
    name: 'Jameson Vanderbilt',
    company: 'Vanderbilt Global Enterprises',
    title: 'Chairman',
    email: 'j.vanderbilt@vge.com',
    phone: '+1 (555) 012-3456',
    rsvpStatus: 'Confirmed',
    isVip: true,
    groupName: 'Platinum Member',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256&h=256',
    dietary: ['Shellfish Allergy', 'Keto-Friendly Preferred'],
    requests: 'Prefers sparkling water with fresh lime at all times. Requesting a quiet lounge access for a 30-min call at 9 PM.',
    accomHotel: 'The Ritz-Carlton, Manhattan',
    accomRoom: 'Executive Suite, Room 402',
    accomIn: 'Oct 11, 3:00 PM',
    accomOut: 'Oct 13, 12:00 PM',
    transType: 'Airport Pickup (JFK)',
    transVehicle: 'Cadillac Escalade ESV • Black',
    transTime: 'Oct 11, 10:30 AM',
    transDriver: 'Robert S.'
  };

  // Safe extract names if not explicitly provided
  const guestName = initialData.name || `${initialData.firstName || ''} ${initialData.lastName || ''}`.trim() || 'Unknown Guest';
  const guestStatus = initialData.rsvpStatus || initialData.status || 'Pending';

  const [profileData, setProfileData] = useState({
    ...initialData,
    name: guestName,
    rsvpStatus: guestStatus
  });

  const [internalNote, setInternalNote] = useState('');
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState(profileData);
  const [msgForm, setMsgForm] = useState({ channel: 'Email', subject: '', body: '' });

  // Sync edit form when modal opens
  useEffect(() => {
    if (showEditModal) setEditForm(profileData);
  }, [showEditModal, profileData]);

  const handleSaveProfile = () => {
    setProfileData(editForm);
    setShowEditModal(false);
  };

  const handleSendMessage = () => {
    if (!msgForm.body.trim()) return alert('Please enter a message');
    alert(`Message sent via ${msgForm.channel}!`);
    setMsgForm({ channel: 'Email', subject: '', body: '' });
    setShowMsgModal(false);
  };

  const handleSaveNote = () => {
    if (!internalNote.trim()) return;
    alert(`Internal note saved: ${internalNote}`);
    setInternalNote('');
  };

  const handleAvatarChange = (e) => {
    // Simulate image upload
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setProfileData(p => ({ ...p, avatarUrl: url }));
    }
  };

  const handleRemoveAvatar = (e) => {
    e.stopPropagation();
    setProfileData(p => ({ ...p, avatarUrl: '' }));
  };

  return (
    <div className="gp-page">
      {/* ── Top Navigation Bar ── */}
      <div className="gp-topbar">
        <div className="gp-topbar-left">
          <button className="gp-back-btn" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
              <polyline points="15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Registry
          </button>
          <div className="gp-search-wrap">
            <svg className="gp-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round"/>
            </svg>
            <input type="text" className="gp-search-input" placeholder="Search guests, events, or bookings..." />
          </div>
        </div>
        <div className="gp-topbar-links">
          <a href="#">Directory</a>
          <a href="#">Resources</a>
        </div>
        <div className="gp-topbar-icons">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20, cursor: 'pointer' }}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20, cursor: 'pointer' }}><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
          <div className="gp-avatar">EH</div>
        </div>
      </div>

      <div className="gp-container">
        {/* ── Main Column (Left) ── */}
        <div className="gp-main-col">
          
          {/* Profile Card */}
          <div className="gp-card gp-profile-card">
            <div className="gp-profile-img-wrap">
              {profileData.avatarUrl ? (
                <>
                  <img src={profileData.avatarUrl} alt="Profile" className="gp-profile-img" />
                  <div className="gp-avatar-edit-overlay">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 24, height: 24 }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                    <span>Change</span>
                    <button className="gp-avatar-remove" onClick={handleRemoveAvatar}>Remove</button>
                    <input type="file" accept="image/*" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={handleAvatarChange} />
                  </div>
                </>
              ) : (
                <div className="gp-avatar-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 24, height: 24, marginBottom: 4 }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                  <span>Upload Photo</span>
                  <input type="file" accept="image/*" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={handleAvatarChange} />
                </div>
              )}
              {profileData.isVip && (
                <div className="gp-profile-badge">
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 10, height: 10 }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  VIP
                </div>
              )}
            </div>
            
            <div className="gp-profile-info">
              <div className="gp-profile-name-row">
                <h1 className="gp-profile-name">{profileData.name}</h1>
                <span className="gp-tag-platinum">{profileData.groupName || 'Platinum Member'}</span>
              </div>
              <p className="gp-profile-title">{profileData.title || 'Guest'}, {profileData.company || 'N/A'}</p>
              
              <div className="gp-profile-contact">
                <div className="gp-contact-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  {profileData.email || 'No email provided'}
                </div>
                <div className="gp-contact-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                  {profileData.phone || 'No phone provided'}
                </div>
                <div className="gp-contact-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  New York, USA
                </div>
              </div>
            </div>

            <div className="gp-profile-actions">
              <button className="gp-btn-outline" onClick={() => setShowEditModal(true)}>Edit Profile</button>
              <button className="gp-btn-primary" onClick={() => setShowMsgModal(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Send Message
              </button>
            </div>
          </div>

          {/* RSVP & Diet Card */}
          <div className="gp-card">
            <div className="gp-card-header">
              <h2 className="gp-card-title">RSVP &amp; Event Attendance</h2>
              <span className="gp-status-tag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: 12, height: 12 }}><polyline points="20 6 9 17 4 12"/></svg>
                {profileData.rsvpStatus.toLowerCase() === 'confirmed' ? 'CONFIRMED' : profileData.rsvpStatus.toUpperCase()}
              </span>
            </div>
            
            <div className="gp-rsvp-card">
              <div className="gp-event-box">
                <div className="gp-event-label">CURRENT EVENT</div>
                <h3 className="gp-event-name">Corporate Gala 2024:<br/>Innovation Tomorrow</h3>
                <div className="gp-event-meta">
                  <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Oct 12, 2024</span>
                  <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> Metropolitan Museum</span>
                </div>
              </div>

              <div className="gp-diet-section" style={{ marginTop: '1rem' }}>
                <h4>Dietary Preferences</h4>
                <div className="gp-diet-tags">
                  {profileData.dietary && profileData.dietary.length > 0 ? (
                    profileData.dietary.map((tag, i) => <span key={i} className="gp-diet-tag">{tag}</span>)
                  ) : <span className="gp-diet-tag" style={{ background: '#f1f5f9', color: '#64748b' }}>None</span>}
                </div>
                <h4>Special Requests</h4>
                <p className="gp-requests">{profileData.requests || 'None specified.'}</p>
              </div>
            </div>
          </div>

          {/* Accom & Trans */}
          <div className="gp-split-row">
            <div className="gp-info-card gp-info-card--accom">
              <div className="gp-info-header">
                <div className="gp-icon-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg></div>
                Accommodation
              </div>
              <h3 className="gp-info-title">{profileData.accomHotel || 'Unassigned'}</h3>
              <p className="gp-info-sub">{profileData.accomRoom || 'No room selected'}</p>
              <div className="gp-info-grid">
                <div className="gp-info-item"><span className="gp-info-label">Check-in</span><span className="gp-info-val">{profileData.accomIn || '-'}</span></div>
                <div className="gp-info-item"><span className="gp-info-label">Check-out</span><span className="gp-info-val">{profileData.accomOut || '-'}</span></div>
              </div>
              <button className="gp-link-btn" onClick={() => setShowEditModal(true)}>Edit Reservation Details</button>
            </div>

            <div className="gp-info-card gp-info-card--trans">
              <div className="gp-info-header">
                <div className="gp-icon-circle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><rect x="3" y="8" width="18" height="8" rx="2"/><circle cx="7.5" cy="16" r="2"/><circle cx="16.5" cy="16" r="2"/></svg></div>
                Transportation
              </div>
              <h3 className="gp-info-title">{profileData.transType || 'Unassigned'}</h3>
              <p className="gp-info-sub">{profileData.transVehicle || 'No vehicle'}</p>
              <div className="gp-info-grid">
                <div className="gp-info-item"><span className="gp-info-label">Scheduled For</span><span className="gp-info-val">{profileData.transTime || '-'}</span></div>
                <div className="gp-info-item"><span className="gp-info-label">Driver</span><span className="gp-info-val" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{profileData.transDriver || '-'} <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" style={{ width: 14, height: 14 }}><polyline points="20 6 9 17 4 12"/></svg></span></div>
              </div>
              <div className="gp-status-bar">
                <span>Tracking Link Sent</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M5 12l5 5L20 7"/></svg>
              </div>
            </div>
          </div>

          {/* Seating Assignment Map */}
          <div className="gp-card">
            <div className="gp-seating-meta">
              <div>
                <h2 className="gp-card-title">Seating Assignment</h2>
                <div className="gp-seating-desc">Main Ballroom Floor Plan</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="gp-seating-table">Table 12</div>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.05em' }}>VIP SECTION A</div>
              </div>
            </div>
            <div className="gp-map-box">
              <div className="gp-map-overlay">
                <div className="gp-map-pin">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>You are here</span>
                </div>
              </div>
              <button className="gp-expand-btn" onClick={() => setShowMapModal(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                Expand Map
              </button>
            </div>
          </div>

        </div>

        {/* ── Side Column (Right) ── */}
        <div className="gp-side-col">
          
          {/* Communication History */}
          <div className="gp-card">
            <h2 className="gp-card-title" style={{ marginBottom: '1.25rem' }}>Communication History</h2>
            <div className="gp-timeline">
              <div className="gp-tl-item">
                <div className="gp-tl-icon gp-tl-icon--email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
                <div className="gp-tl-content">
                  <div className="gp-tl-time">Today, 9:15 AM</div>
                  <h4 className="gp-tl-title">Welcome Packet Sent</h4>
                  <p className="gp-tl-desc">Digital itinerary and venue map delivered via email.</p>
                </div>
              </div>

              <div className="gp-tl-item">
                <div className="gp-tl-icon gp-tl-icon--call"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg></div>
                <div className="gp-tl-content">
                  <div className="gp-tl-time">Yesterday, 2:40 PM</div>
                  <h4 className="gp-tl-title">Inbound Inquiry: Logistics</h4>
                  <p className="gp-tl-desc">Confirmed pickup time and dietary allergy details.</p>
                </div>
              </div>

              <div className="gp-tl-item">
                <div className="gp-tl-icon gp-tl-icon--chat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg></div>
                <div className="gp-tl-content">
                  <div className="gp-tl-time">Oct 5, 11:00 AM</div>
                  <h4 className="gp-tl-title" style={{ color: 'var(--gp-muted)' }}>WhatsApp Confirmation</h4>
                  <p className="gp-tl-desc" style={{ color: 'var(--gp-light)' }}>RSVP status moved to 'Confirmed'.</p>
                </div>
              </div>
            </div>
            <button className="gp-btn-full" onClick={() => alert('Opening full activity log...')}>View All Activity</button>
          </div>

          {/* Concierge Notes */}
          <div className="gp-card">
            <div className="gp-card-header" style={{ marginBottom: '1.25rem' }}>
              <h2 className="gp-card-title">Concierge Notes</h2>
              <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </div>
            <div className="gp-notes-list">
              <div className="gp-note-item">
                <p className="gp-note-text">"Guest is highly sensitive to fragrance. Ensure room 402 is aired out 3 hours prior and use unscented linens only."</p>
                <p className="gp-note-author">- Sarah J., Head Concierge</p>
              </div>
            </div>
            <textarea
              className="gp-note-input"
              placeholder="Add an internal note..."
              value={internalNote}
              onChange={e => setInternalNote(e.target.value)}
            />
            <button className="gp-btn-full gp-btn-full--primary" onClick={handleSaveNote}>Save Internal Note</button>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      
      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="gp-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="gp-modal" onClick={e => e.stopPropagation()}>
            <div className="gp-modal-header">
              <h3>Edit Guest Profile</h3>
              <button className="gp-modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="gp-modal-body">
              <div className="gp-toggle-wrap">
                <div className="gp-toggle-label">
                  VIP Guest
                  <span className="gp-toggle-desc">Enable VIP priority handling and routing</span>
                </div>
                <label className="gp-switch">
                  <input type="checkbox" checked={editForm.isVip} onChange={e => setEditForm({ ...editForm, isVip: e.target.checked })} />
                  <span className="gp-slider"></span>
                </label>
              </div>

              <h4 style={{ margin: '1rem 0 0.5rem', color: 'var(--gp-text)' }}>Personal Details</h4>
              <div className="gp-form-row">
                <div className="gp-form-field">
                  <label className="gp-form-label">Full Name</label>
                  <input type="text" className="gp-form-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                </div>
                <div className="gp-form-field">
                  <label className="gp-form-label">RSVP Status</label>
                  <select className="gp-form-select" value={editForm.rsvpStatus} onChange={e => setEditForm({...editForm, rsvpStatus: e.target.value})}>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>
              </div>
              <div className="gp-form-row">
                <div className="gp-form-field">
                  <label className="gp-form-label">Title</label>
                  <input type="text" className="gp-form-input" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                </div>
                <div className="gp-form-field">
                  <label className="gp-form-label">Company</label>
                  <input type="text" className="gp-form-input" value={editForm.company} onChange={e => setEditForm({...editForm, company: e.target.value})} />
                </div>
              </div>
              <div className="gp-form-row">
                <div className="gp-form-field">
                  <label className="gp-form-label">Email</label>
                  <input type="email" className="gp-form-input" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                </div>
                <div className="gp-form-field">
                  <label className="gp-form-label">Phone</label>
                  <input type="tel" className="gp-form-input" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                </div>
              </div>

              <h4 style={{ margin: '1.5rem 0 0.5rem', color: 'var(--gp-text)' }}>Logistics & Preferences</h4>
              <div className="gp-form-field">
                <label className="gp-form-label">Dietary & Special Requests</label>
                <textarea className="gp-form-textarea" value={editForm.requests} onChange={e => setEditForm({...editForm, requests: e.target.value})}></textarea>
              </div>
              
              <div className="gp-form-row">
                <div className="gp-form-field">
                  <label className="gp-form-label">Hotel</label>
                  <input type="text" className="gp-form-input" value={editForm.accomHotel} onChange={e => setEditForm({...editForm, accomHotel: e.target.value})} />
                </div>
                <div className="gp-form-field">
                  <label className="gp-form-label">Transport Type</label>
                  <input type="text" className="gp-form-input" value={editForm.transType} onChange={e => setEditForm({...editForm, transType: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="gp-modal-footer">
              <button className="gp-btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="gp-btn-primary" onClick={handleSaveProfile}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showMsgModal && (
        <div className="gp-modal-overlay" onClick={() => setShowMsgModal(false)}>
          <div className="gp-modal" onClick={e => e.stopPropagation()}>
            <div className="gp-modal-header">
              <h3>Send Message to {profileData.name}</h3>
              <button className="gp-modal-close" onClick={() => setShowMsgModal(false)}>✕</button>
            </div>
            <div className="gp-modal-body">
              <div className="gp-form-field">
                <label className="gp-form-label">Channel</label>
                <select className="gp-form-select" value={msgForm.channel} onChange={e => setMsgForm({...msgForm, channel: e.target.value})}>
                  <option>Email</option>
                  <option>WhatsApp</option>
                  <option>SMS</option>
                </select>
              </div>
              {msgForm.channel === 'Email' && (
                <div className="gp-form-field">
                  <label className="gp-form-label">Subject</label>
                  <input type="text" className="gp-form-input" value={msgForm.subject} onChange={e => setMsgForm({...msgForm, subject: e.target.value})} placeholder="Message subject..." />
                </div>
              )}
              <div className="gp-form-field">
                <label className="gp-form-label">Message Body</label>
                <textarea className="gp-form-textarea" style={{ minHeight: '120px' }} value={msgForm.body} onChange={e => setMsgForm({...msgForm, body: e.target.value})} placeholder="Type your message here..."></textarea>
              </div>
            </div>
            <div className="gp-modal-footer">
              <button className="gp-btn-outline" onClick={() => setShowMsgModal(false)}>Cancel</button>
              <button className="gp-btn-primary" onClick={handleSendMessage}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expand Map Modal */}
      {showMapModal && (
        <div className="gp-modal-overlay" onClick={() => setShowMapModal(false)}>
          <div className="gp-modal gp-modal-large" onClick={e => e.stopPropagation()}>
            <div className="gp-modal-header">
              <h3>Main Ballroom Floor Plan - Table 12</h3>
              <button className="gp-modal-close" onClick={() => setShowMapModal(false)}>✕</button>
            </div>
            <div className="gp-modal-body" style={{ padding: 0 }}>
              <div style={{ width: '100%', height: '500px', backgroundImage: "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200')", backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="gp-map-pin" style={{ transform: 'scale(1.5)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>Table 12 - VIP Section A</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="gp-modal-footer">
              <button className="gp-btn-primary" onClick={() => setShowMapModal(false)}>Close Map</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
