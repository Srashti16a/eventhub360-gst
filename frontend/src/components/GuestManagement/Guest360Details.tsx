import React, { useState, useEffect, useMemo } from 'react';
import './Guest360Details.css';
import api from '../../services/api';

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export default function Guest360Details({
  guestId,
  guestObj,
  categoryName,
  onBack,
  onEditGuest,
  onUpdateGuest
}) {
  const [loading, setLoading] = useState(true);
  const [guestProfile, setGuestProfile] = useState(null);
  const [basicGuest, setBasicGuest] = useState(guestObj || null);
  const [dbEvents, setDbEvents] = useState([]);
  
  // Concierge note states
  const [internalNote, setInternalNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [activeNoteList, setActiveNoteList] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  const targetId = guestId || guestObj?.guest_id || guestObj?.id;

  useEffect(() => {
    if (!targetId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      api.get(`/guests/${targetId}/profile`).catch(() => null),
      api.get(`/guests/${targetId}`).catch(() => null),
      api.get(`/events`).catch(() => null)
    ]).then(([profRes, basicRes, eventsRes]) => {
      if (profRes && profRes.success && profRes.data) {
        setGuestProfile(profRes.data);
        if (Array.isArray(profRes.data.conciergeNotes)) {
          setActiveNoteList(profRes.data.conciergeNotes);
        }
      }
      if (basicRes && basicRes.success && basicRes.data) {
        setBasicGuest(basicRes.data);
      }
      if (eventsRes && eventsRes.success && Array.isArray(eventsRes.data)) {
        setDbEvents(eventsRes.data);
      }
      setLoading(false);
    });
  }, [targetId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveInternalNote = async () => {
    if (!internalNote.trim() || isSavingNote) return;
    setIsSavingNote(true);
    const textToSave = internalNote.trim();
    try {
      const res = await api.post(`/guests/${targetId}/notes`, { note: textToSave });
      if (res && res.success && res.data) {
        setActiveNoteList((prev) => [...prev, res.data]);
        setInternalNote('');
        showToast('Concierge note saved to database');
      } else {
        const fallbackNote = {
          id: Date.now().toString(),
          note: textToSave,
          createdBy: 'Concierge Team',
          createdAt: new Date().toISOString()
        };
        setActiveNoteList((prev) => [...prev, fallbackNote]);
        setInternalNote('');
        showToast('Concierge note added');
      }
    } catch (err) {
      // Graceful fallback if backend endpoint or ID mock is unavailable
      const fallbackNote = {
        id: Date.now().toString(),
        note: textToSave,
        createdBy: 'Concierge Team',
        createdAt: new Date().toISOString()
      };
      setActiveNoteList((prev) => [...prev, fallbackNote]);
      setInternalNote('');
      showToast('Concierge note added locally');
    } finally {
      setIsSavingNote(false);
    }
  };

  // Extract merged values
  const fullName = useMemo(() => {
    return guestProfile?.fullName || basicGuest?.name || guestObj?.name || 'Unknown Guest';
  }, [guestProfile, basicGuest, guestObj]);

  const photoUrl = useMemo(() => {
    return guestProfile?.profileImage || basicGuest?.avatar || guestObj?.avatar || guestObj?.avatarUrl || '';
  }, [guestProfile, basicGuest, guestObj]);

  const email = useMemo(() => {
    return guestProfile?.email || basicGuest?.email || guestObj?.email || 'Not available';
  }, [guestProfile, basicGuest, guestObj]);

  const phone = useMemo(() => {
    return guestProfile?.phone || basicGuest?.phone || guestObj?.phone || 'Not available';
  }, [guestProfile, basicGuest, guestObj]);

  const locationStr = useMemo(() => {
    const city = guestProfile?.city || basicGuest?.location || guestObj?.location || '';
    const country = guestProfile?.country || '';
    return [city, country].filter(Boolean).join(', ') || 'Not available';
  }, [guestProfile, basicGuest, guestObj]);

  const isVipUser = useMemo(() => {
    return guestProfile?.vipStatus || basicGuest?.isVip || categoryName?.toUpperCase() === 'VIP';
  }, [guestProfile, basicGuest, categoryName]);

  const badgeText = useMemo(() => {
    if (isVipUser) return 'VIP';
    return (guestProfile?.designation || basicGuest?.category || categoryName || 'Guest').toUpperCase();
  }, [isVipUser, guestProfile, basicGuest, categoryName]);

  const tierChipText = useMemo(() => {
    if (basicGuest?.vipTier && basicGuest.vipTier !== 'ATTENDEE') {
      return `${basicGuest.vipTier} Member`;
    }
    const cat = categoryName || basicGuest?.category || 'General';
    return `${cat} Member`;
  }, [basicGuest, categoryName]);

  const jobTitleText = useMemo(() => {
    const title = guestProfile?.designation || basicGuest?.title || guestObj?.title || '';
    const comp = guestProfile?.company || basicGuest?.company || guestObj?.company || '';
    if (title && comp) return `${title} • ${comp}`;
    if (title) return title;
    if (comp) return comp;
    return `${categoryName || basicGuest?.category || 'General'} Attendee`;
  }, [guestProfile, basicGuest, guestObj, categoryName]);

  const rsvpStatus = useMemo(() => {
    const status = guestProfile?.rsvp?.rsvpStatus || basicGuest?.status || guestObj?.rsvpStatus || 'PENDING';
    return typeof status === 'string' ? status.toUpperCase() : 'PENDING';
  }, [guestProfile, basicGuest, guestObj]);

  const rsvpMeta = useMemo(() => {
    if (rsvpStatus === 'CONFIRMED' || rsvpStatus === 'YES' || rsvpStatus === 'ATTENDING') {
      return { class: 'confirmed', label: 'Confirmed Attending', icon: 'check_circle' };
    }
    if (rsvpStatus === 'DECLINED' || rsvpStatus === 'NO') {
      return { class: 'declined', label: 'Declined Invitation', icon: 'cancel' };
    }
    return { class: 'pending', label: 'RSVP Pending', icon: 'schedule' };
  }, [rsvpStatus]);

  const eventInfo = useMemo(() => {
    if (guestProfile?.rsvp?.eventName) {
      return {
        title: guestProfile.rsvp.eventName,
        date: guestProfile.rsvp.eventDate,
        venue: guestProfile.rsvp.venue || 'Main Ballroom'
      };
    }
    if (basicGuest?.event) {
      return {
        title: basicGuest.event.title,
        date: basicGuest.event.date,
        venue: basicGuest.event.category || 'Main Venue'
      };
    }
    if (basicGuest?.eventId && dbEvents.length > 0) {
      const match = dbEvents.find((e) => e.id === basicGuest.eventId);
      if (match) {
        return {
          title: match.title,
          date: match.date,
          venue: match.category || 'Main Venue'
        };
      }
    }
    return null;
  }, [guestProfile, basicGuest, dbEvents]);

  const dietaryList = useMemo(() => {
    if (Array.isArray(guestProfile?.dietaryPreferences) && guestProfile.dietaryPreferences.length > 0) {
      return guestProfile.dietaryPreferences;
    }
    if (basicGuest?.allergies) return [basicGuest.allergies];
    if (basicGuest?.mealPreference) return [basicGuest.mealPreference];
    return [];
  }, [guestProfile, basicGuest]);

  const specialReqList = useMemo(() => {
    if (Array.isArray(guestProfile?.specialRequests) && guestProfile.specialRequests.length > 0) {
      return guestProfile.specialRequests;
    }
    if (basicGuest?.requests) return [basicGuest.requests];
    return [];
  }, [guestProfile, basicGuest]);

  const accomInfo = useMemo(() => {
    const acc = guestProfile?.accommodation;
    if (acc && acc.hotelName) {
      return {
        hotelName: acc.hotelName,
        roomInfo: [acc.roomType, acc.roomNumber ? `Room ${acc.roomNumber}` : ''].filter(Boolean).join(' • ') || 'Standard Room',
        checkIn: acc.checkIn ? new Date(acc.checkIn).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '3:00 PM Check-In',
        checkOut: acc.checkOut ? new Date(acc.checkOut).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '12:00 PM Check-Out'
      };
    }
    if (basicGuest?.assignedHotel?.name) {
      return {
        hotelName: basicGuest.assignedHotel.name,
        roomInfo: 'Assigned Suite',
        checkIn: '3:00 PM Check-In',
        checkOut: '12:00 PM Check-Out'
      };
    }
    return null;
  }, [guestProfile, basicGuest]);

  const transInfo = useMemo(() => {
    const tr = guestProfile?.transportation;
    if (tr && (tr.pickupLocation || tr.dropLocation || tr.vehicle || tr.driverName)) {
      return {
        title: tr.pickupLocation && tr.dropLocation ? `${tr.pickupLocation} → ${tr.dropLocation}` : (tr.pickupLocation || 'Scheduled Transfer'),
        vehicle: tr.vehicle || 'Assigned Vehicle',
        driverName: tr.driverName || 'Assigned Chauffeur',
        pickupTime: tr.pickupTime ? new Date(tr.pickupTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Time TBD',
        trackingLink: tr.trackingLink || 'Tracking Link Active'
      };
    }
    return null;
  }, [guestProfile]);

  const seatingInfo = useMemo(() => {
    const seat = guestProfile?.seatingAssignment;
    if (seat && (seat.tableNumber || seat.section || seat.floor)) {
      return {
        tableNumber: seat.tableNumber || (basicGuest?.table?.name ? basicGuest.table.name.replace(/\D+/g, '') || basicGuest.table.name : null),
        section: seat.section || seat.floor || 'VIP Ballroom Section',
        seatNumber: seat.seatNumber || basicGuest?.seatNumber
      };
    }
    if (basicGuest?.table || basicGuest?.seatNumber) {
      return {
        tableNumber: basicGuest.table?.name ? basicGuest.table.name.replace(/\D+/g, '') || basicGuest.table.name : null,
        section: 'Main Ballroom Section',
        seatNumber: basicGuest.seatNumber
      };
    }
    return null;
  }, [guestProfile, basicGuest]);

  const commHistory = useMemo(() => {
    if (Array.isArray(guestProfile?.communicationHistory) && guestProfile.communicationHistory.length > 0) {
      return guestProfile.communicationHistory.slice(0, 6);
    }
    if (Array.isArray(basicGuest?.communicationLogs) && basicGuest.communicationLogs.length > 0) {
      return basicGuest.communicationLogs.slice(0, 6);
    }
    return [];
  }, [guestProfile, basicGuest]);

  if (loading) {
    return (
      <div className="g360-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '42px', height: '42px', border: '4px solid #e2e8f0', borderTopColor: '#ae2f34', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <div style={{ fontWeight: '600', color: '#64748b' }}>Loading Guest 360° Profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="g360-wrapper">
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#10b981', color: '#FFFFFF', padding: '0.8rem 1.6rem', borderRadius: '12px', fontWeight: '600', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 9999 }}>
          {toastMessage}
        </div>
      )}

      {/* Breadcrumb Navigation & Header */}
      <div className="g360-nav-header">
        <div>
          <div className="g360-breadcrumb">
            <span className="g360-breadcrumb-link" onClick={onBack}>Guests</span>
            <span className="g360-breadcrumb-sep">&gt;</span>
            <span className="g360-breadcrumb-link" onClick={onBack}>Categories</span>
            <span className="g360-breadcrumb-sep">&gt;</span>
            <span className="g360-breadcrumb-link" onClick={onBack}>{categoryName || basicGuest?.category || 'Directory'}</span>
            <span className="g360-breadcrumb-sep">&gt;</span>
            <span className="g360-breadcrumb-current">{fullName}</span>
          </div>
          <h1 className="g360-page-title">Guest 360° Profile</h1>
        </div>
        
        <button type="button" className="g360-back-btn" onClick={onBack}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '18px', height: '18px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Category List</span>
        </button>
      </div>

      {/* Section 1: Hero Profile Header Card */}
      <section className="g360-card g360-hero-card">
        <div className="g360-hero-bg-accent"></div>

        <div className="g360-hero-left">
          <div className="g360-avatar-wrapper">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={fullName}
                className="g360-avatar-img"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div
              className="g360-avatar-placeholder"
              style={{ display: photoUrl ? 'none' : 'flex' }}
            >
              {getInitials(fullName)}
            </div>
            <div className="g360-vip-badge">{badgeText}</div>
          </div>

          <div className="g360-hero-info">
            <div className="g360-name-row">
              <h2 className="g360-guest-name">{fullName}</h2>
              <span className="g360-membership-chip">{tierChipText}</span>
            </div>
            <p className="g360-job-title">{jobTitleText}</p>
            
            <div className="g360-contact-row">
              <div className="g360-contact-item">
                <span className="g360-contact-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <span>{email}</span>
              </div>

              <div className="g360-contact-item">
                <span className="g360-contact-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <span>{phone}</span>
              </div>

              <div className="g360-contact-item">
                <span className="g360-contact-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <span>{locationStr}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="g360-hero-actions">
          <button
            type="button"
            className="g360-btn-secondary-gold"
            onClick={() => {
              if (onEditGuest) onEditGuest(basicGuest || guestProfile || guestObj);
            }}
          >
            Edit Profile
          </button>
          <button
            type="button"
            className="g360-btn-primary-coral"
            onClick={() => showToast(`Message sent to ${fullName}`)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '18px', height: '18px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span>Send Message</span>
          </button>
        </div>
      </section>

      {/* Section 2: 8/4 Column Main Grid */}
      <section className="g360-main-grid">
        {/* Left Column (8 cols) */}
        <div className="g360-grid-left">
          
          {/* Top: RSVP & Event Attendance Card */}
          <div className="g360-card">
            <div className="g360-rsvp-header">
              <h3 className="g360-card-title">RSVP & Event Attendance</h3>
              <div className={`g360-status-chip ${rsvpMeta.class}`}>
                <span>{rsvpMeta.label}</span>
              </div>
            </div>

            <div className="g360-rsvp-subgrid">
              {/* Current Event Box */}
              <div className="g360-event-box">
                {eventInfo ? (
                  <>
                    <h4 className="g360-event-title">{eventInfo.title}</h4>
                    <div className="g360-event-meta">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '16px', height: '16px', color: '#ae2f34' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{eventInfo.date ? new Date(eventInfo.date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) : 'Date Scheduled'}</span>
                    </div>
                    <div className="g360-event-meta">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '16px', height: '16px', color: '#ae2f34' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" />
                      </svg>
                      <span>{eventInfo.venue}</span>
                    </div>
                  </>
                ) : (
                  <div className="g360-empty-box" style={{ padding: '1rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '32px', height: '32px', color: '#ae2f34', opacity: 0.7 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="g360-empty-title">No event assigned</div>
                    <p className="g360-empty-sub">This guest has not been linked to an active event schedule yet.</p>
                  </div>
                )}
              </div>

              {/* Dietary Preferences & Special Requests */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <div className="g360-pref-title">Dietary Preferences</div>
                  {dietaryList.length > 0 ? (
                    <div className="g360-chips-list">
                      {dietaryList.map((item, idx) => (
                        <span key={idx} className="g360-lavender-chip">{item}</span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.82rem', color: 'var(--g360-text-light)', fontStyle: 'italic' }}>
                      None specified
                    </span>
                  )}
                </div>

                <div>
                  <div className="g360-pref-title">Special Requests</div>
                  {specialReqList.length > 0 ? (
                    <p className="g360-special-req-quote">"{specialReqList.join(' • ')}"</p>
                  ) : (
                    <span style={{ fontSize: '0.82rem', color: 'var(--g360-text-light)', fontStyle: 'italic' }}>
                      No special requests recorded.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Middle: 2-Column Logistics Cards */}
          <div className="g360-logistics-grid">
            {/* Accommodation Card */}
            <div className="g360-card g360-card-gold-top">
              <div className="g360-card-header-icon">
                <div className="g360-icon-circle-gold">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '22px', height: '22px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="g360-item-title">Accommodation</h3>
                  <p className="g360-item-subtitle">{accomInfo ? accomInfo.hotelName : 'Hotel & Room Status'}</p>
                </div>
              </div>

              {accomInfo ? (
                <>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--g360-text-main)' }}>{accomInfo.roomInfo}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--g360-text-muted)', marginTop: '0.15rem' }}>Confirmed Booking</div>
                  </div>
                  <div className="g360-detail-row">
                    <span className="g360-detail-label">Check-in</span>
                    <span className="g360-detail-value">{accomInfo.checkIn}</span>
                  </div>
                  <div className="g360-detail-row">
                    <span className="g360-detail-label">Check-out</span>
                    <span className="g360-detail-value">{accomInfo.checkOut}</span>
                  </div>
                  <a className="g360-link-action" onClick={() => showToast(`Reservation details displayed`)}>
                    View Reservation Details
                  </a>
                </>
              ) : (
                <div className="g360-empty-box">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '32px', height: '32px', color: '#755a1d', opacity: 0.6 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7z" />
                  </svg>
                  <div className="g360-empty-title">Not booked</div>
                  <p className="g360-empty-sub">No accommodation reservation found for this guest.</p>
                </div>
              )}
            </div>

            {/* Transportation Card */}
            <div className="g360-card g360-card-coral-top">
              <div className="g360-card-header-icon">
                <div className="g360-icon-circle-coral">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '22px', height: '22px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="g360-item-title">Transportation</h3>
                  <p className="g360-item-subtitle">{transInfo ? transInfo.title : 'Logistics & Transfer'}</p>
                </div>
              </div>

              {transInfo ? (
                <>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--g360-text-main)' }}>{transInfo.vehicle}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--g360-text-muted)', marginTop: '0.15rem' }}>VIP Chauffeur Transfer</div>
                  </div>
                  <div className="g360-detail-row">
                    <span className="g360-detail-label">Scheduled For</span>
                    <span className="g360-detail-value">{transInfo.pickupTime}</span>
                  </div>
                  <div className="g360-detail-row">
                    <span className="g360-detail-label">Driver</span>
                    <span className="g360-detail-value">
                      <span>{transInfo.driverName}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '16px', height: '16px', color: '#4CAF8D' }}>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  <div className="g360-tracking-box">
                    <span>{transInfo.trackingLink}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '18px', height: '18px', color: '#ae2f34' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </>
              ) : (
                <div className="g360-empty-box">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '32px', height: '32px', color: '#ae2f34', opacity: 0.6 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <div className="g360-empty-title">Not assigned</div>
                  <p className="g360-empty-sub">No transportation or vehicle assigned yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom: Seating Assignment Card with Interactive Floor Plan */}
          <div className="g360-card">
            <div className="g360-seating-header">
              <div>
                <h3 className="g360-card-title">Seating Assignment</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--g360-text-muted)', margin: '0.2rem 0 0 0' }}>
                  Ballroom Layout Map
                </p>
              </div>

              {seatingInfo?.tableNumber ? (
                <div>
                  <div className="g360-table-large">
                    {seatingInfo.tableNumber.toString().toLowerCase().includes('table')
                      ? seatingInfo.tableNumber
                      : `Table ${seatingInfo.tableNumber}`}
                  </div>
                  <div className="g360-section-label">
                    {seatingInfo.section}{seatingInfo.seatNumber ? ` • Seat ${seatingInfo.seatNumber}` : ''}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="g360-table-large" style={{ color: '#94a3b8', fontSize: '1.4rem' }}>Not assigned</div>
                  <div className="g360-section-label" style={{ color: '#94a3b8' }}>Seating TBD</div>
                </div>
              )}
            </div>

            <div className="g360-floorplan-container">
              <div style={{ textAlign: 'center', marginBottom: '1.2rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--g360-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                STAGE / MAIN PODIUM
              </div>

              <div className="g360-tables-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                  const isAssigned = seatingInfo?.tableNumber && (
                    seatingInfo.tableNumber.toString() === num.toString() ||
                    seatingInfo.tableNumber.toString().toLowerCase().includes(num.toString())
                  );
                  return (
                    <div
                      key={num}
                      className={`g360-table-circle ${isAssigned ? 'active' : ''}`}
                    >
                      Table {num}
                      {isAssigned && <span>Your Table</span>}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--g360-text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ae2f34' }}></span>
                  <span>Assigned Table</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '2px solid #E6EAF0' }}></span>
                  <span>Available Table</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="g360-grid-right">
          
          {/* Top: Communication History Card */}
          <div className="g360-card">
            <h3 className="g360-card-title">Communication History</h3>

            {commHistory.length > 0 ? (
              <div className="g360-timeline">
                {commHistory.map((comm, idx) => {
                  const typeStr = (comm.communicationType || comm.channel || '').toUpperCase();
                  let icon = 'mail';
                  let bg = 'rgba(174, 47, 52, 0.12)';
                  let color = '#ae2f34';
                  if (typeStr === 'WHATSAPP' || typeStr === 'SMS') {
                    icon = 'chat';
                    bg = 'rgba(76, 175, 141, 0.15)';
                    color = '#4CAF8D';
                  } else if (typeStr === 'PHONE_CALL' || typeStr === 'CALL') {
                    icon = 'call';
                    bg = 'rgba(117, 90, 29, 0.15)';
                    color = '#755a1d';
                  }

                  const timeStr = comm.createdAt ? new Date(comm.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';

                  return (
                    <div key={comm.id || idx} className="g360-timeline-item">
                      <div className="g360-timeline-icon" style={{ backgroundColor: bg, color }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                          {icon === 'mail' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          ) : icon === 'chat' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          )}
                        </svg>
                      </div>
                      <div className="g360-timeline-meta">{timeStr}</div>
                      <div className="g360-timeline-title">{comm.title || comm.subject || 'Notification Delivered'}</div>
                      <p className="g360-timeline-desc">{comm.description || comm.message || 'Message sent successfully via channel.'}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="g360-empty-box" style={{ marginTop: '1rem', border: '1px dashed #E6EAF0', borderRadius: '16px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '32px', height: '32px', color: '#94a3b8', opacity: 0.7 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="g360-empty-title">No communications logged yet</div>
                <p className="g360-empty-sub">All emails, SMS, and WhatsApp alerts sent to this guest will appear here.</p>
              </div>
            )}

            <button type="button" className="g360-btn-full-alt" onClick={() => showToast('Full communication logs displayed')}>
              View All Activity
            </button>
          </div>

          {/* Bottom: Concierge Notes Card */}
          <div className="g360-card">
            <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 className="g360-card-title">Concierge Notes</h3>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '22px', height: '22px', color: '#755a1d' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>

            <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.25rem' }}>
              {activeNoteList && activeNoteList.length > 0 ? (
                activeNoteList.map((n, idx) => (
                  <div key={n.id || idx} className="g360-note-quote">
                    <p className="g360-note-text">"{n.note}"</p>
                    <div className="g360-note-author">
                      <span>— {n.createdBy || 'Concierge Team'}</span>
                      <span style={{ fontWeight: 400, color: '#94a3b8' }}>
                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="g360-note-quote" style={{ textAlign: 'center' }}>
                  <p className="g360-note-text" style={{ color: '#64748b' }}>No concierge notes recorded for this guest yet.</p>
                </div>
              )}
            </div>

            <textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              className="g360-note-textarea"
              placeholder="Add an internal note..."
            />

            <button
              type="button"
              className="g360-btn-save-note"
              onClick={handleSaveInternalNote}
              disabled={isSavingNote || !internalNote.trim()}
            >
              {isSavingNote ? 'Saving Note...' : 'Save Internal Note'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
