import React, { useState } from 'react';
import './GuestDetailModal.css';

const getInitials = (name) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const getStatusMeta = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
    case 'yes':
      return { label: 'Confirmed', cls: 'confirmed', icon: '✓' };
    case 'declined':
    case 'no':
      return { label: 'Declined', cls: 'declined', icon: '✕' };
    default:
      return { label: 'Pending', cls: 'pending', icon: '◑' };
  }
};

const InfoRow = ({ icon, label, value }) => (
  <div className="gd-info-row">
    <span className="gd-info-icon">{icon}</span>
    <div className="gd-info-content">
      <span className="gd-info-label">{label}</span>
      <span className="gd-info-value">{value || '—'}</span>
    </div>
  </div>
);

const Badge = ({ text, type = 'default' }) => (
  <span className={`gd-badge gd-badge-${type}`}>{text}</span>
);

export default function GuestDetailModal({ guest, onClose, onEditGuest }) {
  const [showQRFull, setShowQRFull] = useState(false);

  if (!guest) return null;

  const status = getStatusMeta(guest.rsvpStatus);
  const isVip = guest.category?.toLowerCase() === 'vip' || guest.isVip;
  const isSpeaker = guest.groupName?.toLowerCase().includes('speaker') || guest.isSpeaker;
  const isBridalParty = guest.category?.toLowerCase() === 'family' || guest.isBridalParty;
  const isPrimary = guest.groupName?.toLowerCase().includes('primary') || guest.isPrimaryGuest;

  // Format the check-in time if available
  const checkedInLabel = guest.checkedInAt
    ? new Date(guest.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const handleEditGuest = () => {
    onClose();
    if (onEditGuest) onEditGuest(guest);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="gd-backdrop" onClick={onClose} />

      {/* Slide-over panel */}
      <div className="gd-panel" role="dialog" aria-modal="true" aria-label="Guest Details">
        {/* Close button */}
        <button type="button" className="gd-close-btn" onClick={onClose} aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* ── Hero Section ── */}
        <div className="gd-hero">
          <div className="gd-hero-bg" />
          <div className="gd-hero-content">
            {/* Avatar */}
            <div className="gd-avatar-wrapper">
              {guest.avatarUrl ? (
                <img src={guest.avatarUrl} alt={guest.name} className="gd-avatar-img" />
              ) : (
                <div className="gd-avatar-placeholder">{getInitials(guest.name)}</div>
              )}
              {isVip && (
                <div className="gd-avatar-vip-badge">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '10px', height: '10px' }}>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  VIP
                </div>
              )}
            </div>

            {/* Name & badges */}
            <div className="gd-hero-info">
              <h2 className="gd-guest-name">{guest.name}</h2>
              <div className="gd-hero-badges">
                {isVip && <Badge text="VIP" type="vip" />}
                {isSpeaker && <Badge text="Speaker" type="speaker" />}
                {isBridalParty && <Badge text="Bridal Party" type="bridal" />}
                {isPrimary && !isBridalParty && !isSpeaker && <Badge text="Primary Guest" type="primary" />}
                <span className={`gd-status-chip gd-status-${status.cls}`}>
                  <span className="gd-status-dot" />
                  {status.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="gd-body">

          {/* ── Contact Information ── */}
          <section className="gd-section">
            <h3 className="gd-section-title">
              <span className="gd-section-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              Contact Information
            </h3>
            <div className="gd-info-grid">
              <InfoRow
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
                label="Email Address"
                value={guest.email}
              />
              <InfoRow
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                }
                label="Phone Number"
                value={guest.phone}
              />
            </div>
          </section>

          {/* ── Event & RSVP Details ── */}
          <section className="gd-section">
            <h3 className="gd-section-title">
              <span className="gd-section-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              Event &amp; RSVP Details
            </h3>
            <div className="gd-info-grid">
              <InfoRow
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                }
                label="Event / Category"
                value={guest.eventName}
              />
              <InfoRow
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                label="RSVP Status"
                value={
                  <span className={`gd-inline-status gd-status-${status.cls}`}>
                    {status.icon} {status.label}
                  </span>
                }
              />
              <InfoRow
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
                label="Guest Category"
                value={guest.category}
              />
              <InfoRow
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
                label="Group / Role"
                value={guest.groupName || 'Standard Guest'}
              />
              <InfoRow
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
                label="Pax (Party Size)"
                value={guest.pax ? `${guest.pax} person${guest.pax > 1 ? 's' : ''}` : '1 person'}
              />
              <InfoRow
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
                label="Invited"
                value={guest.invited ? 'Yes — Invitation Sent' : 'Not yet invited'}
              />
            </div>
          </section>

          {/* ── Accommodation & Seating ── */}
          <section className="gd-section">
            <h3 className="gd-section-title">
              <span className="gd-section-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </span>
              Accommodation &amp; Seating
            </h3>
            <div className="gd-info-grid">
              <InfoRow
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
                label="Assigned Hotel"
                value={guest.assignedHotel && guest.assignedHotel !== '—' ? guest.assignedHotel : 'No hotel assigned'}
              />
              <InfoRow
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                }
                label="Table Number"
                value={guest.table_no || 'Not assigned'}
              />
              <InfoRow
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                }
                label="Seat Number"
                value={guest.seat_no || 'Not assigned'}
              />
              <InfoRow
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-1.5-.454M9 6l3 3m0 0l3-3m-3 3V2" />
                  </svg>
                }
                label="Dietary Preference"
                value={guest.preference || 'Not specified'}
              />
            </div>
          </section>

          {/* ── Check‑in Status ── */}
          <section className="gd-section">
            <h3 className="gd-section-title">
              <span className="gd-section-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              Check‑in Status
            </h3>
            <div className={`gd-checkin-card ${checkedInLabel ? 'checked-in' : 'not-checked-in'}`}>
              {checkedInLabel ? (
                <>
                  <div className="gd-checkin-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="gd-checkin-label">Checked In</div>
                    <div className="gd-checkin-time">at {checkedInLabel} today</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="gd-checkin-icon pending">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="gd-checkin-label">Not Yet Checked In</div>
                    <div className="gd-checkin-time">Awaiting arrival</div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ── QR Code ── */}
          <section className="gd-section">
            <h3 className="gd-section-title">
              <span className="gd-section-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </span>
              Guest QR Badge
            </h3>

            {!showQRFull ? (
              <div className="gd-qr-card">
                {/* Mini QR preview */}
                <div className="gd-qr-mini">
                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '64px', height: '64px' }}>
                    <rect x="5" y="5" width="25" height="25" fill="#1e293b" />
                    <rect x="10" y="10" width="15" height="15" fill="white" />
                    <rect x="13" y="13" width="9" height="9" fill="#1e293b" />
                    <rect x="70" y="5" width="25" height="25" fill="#1e293b" />
                    <rect x="75" y="10" width="15" height="15" fill="white" />
                    <rect x="78" y="13" width="9" height="9" fill="#1e293b" />
                    <rect x="5" y="70" width="25" height="25" fill="#1e293b" />
                    <rect x="10" y="75" width="15" height="15" fill="white" />
                    <rect x="13" y="78" width="9" height="9" fill="#1e293b" />
                    <rect x="35" y="5" width="8" height="8" fill="#1e293b" />
                    <rect x="50" y="5" width="12" height="4" fill="#1e293b" />
                    <rect x="35" y="18" width="15" height="8" fill="#1e293b" />
                    <rect x="55" y="20" width="10" height="10" fill="#1e293b" />
                    <rect x="5" y="35" width="18" height="8" fill="#1e293b" />
                    <rect x="5" y="48" width="8" height="12" fill="#1e293b" />
                    <rect x="35" y="35" width="30" height="30" fill="#1e293b" />
                    <rect x="42" y="42" width="16" height="16" fill="white" />
                    <rect x="47" y="47" width="6" height="6" fill="#1e293b" />
                    <rect x="75" y="35" width="12" height="18" fill="#1e293b" />
                    <rect x="70" y="60" width="22" height="10" fill="#1e293b" />
                    <rect x="35" y="70" width="18" height="12" fill="#1e293b" />
                    <rect x="35" y="85" width="10" height="10" fill="#1e293b" />
                    <rect x="55" y="75" width="12" height="15" fill="#1e293b" />
                    <rect x="70" y="75" width="20" height="20" fill="#1e293b" />
                    <rect x="75" y="80" width="10" height="10" fill="white" />
                  </svg>
                </div>
                <div className="gd-qr-info">
                  <div className="gd-qr-code-text">{guest.qr_code || `QR_${guest.guest_id}`}</div>
                  <div className="gd-qr-sub">Scan at event entrance for check‑in</div>
                  <button
                    type="button"
                    className="gd-qr-expand-btn"
                    onClick={() => setShowQRFull(true)}
                  >
                    View Full QR Badge →
                  </button>
                </div>
              </div>
            ) : (
              /* Full QR view */
              <div className="gd-qr-full">
                <div className="gd-qr-full-inner">
                  <div className="gd-qr-full-name">{guest.name}</div>
                  <span className="gd-qr-category-pill">{guest.category || 'Standard'}</span>
                  <div style={{ position: 'relative', display: 'inline-block', marginTop: '0.75rem' }}>
                    <div className="gd-qr-scan-line" />
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: '140px', height: '140px', display: 'block' }}>
                      <rect x="5" y="5" width="25" height="25" fill="#1e293b" />
                      <rect x="10" y="10" width="15" height="15" fill="white" />
                      <rect x="13" y="13" width="9" height="9" fill="#1e293b" />
                      <rect x="70" y="5" width="25" height="25" fill="#1e293b" />
                      <rect x="75" y="10" width="15" height="15" fill="white" />
                      <rect x="78" y="13" width="9" height="9" fill="#1e293b" />
                      <rect x="5" y="70" width="25" height="25" fill="#1e293b" />
                      <rect x="10" y="75" width="15" height="15" fill="white" />
                      <rect x="13" y="78" width="9" height="9" fill="#1e293b" />
                      <rect x="35" y="5" width="8" height="8" fill="#1e293b" />
                      <rect x="50" y="5" width="12" height="4" fill="#1e293b" />
                      <rect x="35" y="18" width="15" height="8" fill="#1e293b" />
                      <rect x="55" y="20" width="10" height="10" fill="#1e293b" />
                      <rect x="5" y="35" width="18" height="8" fill="#1e293b" />
                      <rect x="5" y="48" width="8" height="12" fill="#1e293b" />
                      <rect x="35" y="35" width="30" height="30" fill="#1e293b" />
                      <rect x="42" y="42" width="16" height="16" fill="white" />
                      <rect x="47" y="47" width="6" height="6" fill="#1e293b" />
                      <rect x="75" y="35" width="12" height="18" fill="#1e293b" />
                      <rect x="70" y="60" width="22" height="10" fill="#1e293b" />
                      <rect x="35" y="70" width="18" height="12" fill="#1e293b" />
                      <rect x="35" y="85" width="10" height="10" fill="#1e293b" />
                      <rect x="55" y="75" width="12" height="15" fill="#1e293b" />
                      <rect x="70" y="75" width="20" height="20" fill="#1e293b" />
                      <rect x="75" y="80" width="10" height="10" fill="white" />
                    </svg>
                  </div>
                  <div className="gd-qr-token">
                    <span className="gd-qr-token-label">QR Token:</span>
                    <code className="gd-qr-token-val">{guest.qr_code || `QR_${guest.guest_id}`}</code>
                  </div>
                  <div className="gd-qr-status-row">
                    <span>Check-in Status:</span>
                    <span style={{ fontWeight: 700, color: guest.checkedInAt ? '#03543f' : '#92400e' }}>
                      {guest.checkedInAt ? `✓ Arrived at ${checkedInLabel}` : '⏳ Not Checked In'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="gd-qr-collapse-btn"
                    onClick={() => setShowQRFull(false)}
                  >
                    ← Collapse
                  </button>
                </div>
              </div>
            )}
          </section>

        </div>{/* end gd-body */}

        {/* ── Footer Actions ── */}
        <div className="gd-footer">
          <button type="button" className="gd-footer-btn gd-footer-btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="gd-footer-btn gd-footer-btn-primary"
            onClick={handleEditGuest}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Guest
          </button>
        </div>
      </div>
    </>
  );
}
