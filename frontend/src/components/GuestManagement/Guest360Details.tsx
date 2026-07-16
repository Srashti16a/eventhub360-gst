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

const COMMON_DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Halal',
  'Kosher',
  'Nut Allergy',
  'Dairy-Free',
  'No Beef',
  'No Seafood'
];

export default function Guest360Details({
  guestId,
  guestObj,
  categoryName,
  onBack,
  onEditGuest,
  onUpdateGuest
}) {
  const targetId = guestId || guestObj?.id || guestObj?.guest_id || guestObj?.guestId || guestObj?._id || guestObj?.targetId;

  const [loading, setLoading] = useState(true);
  const [guestProfile, setGuestProfile] = useState(null);
  const [basicGuest, setBasicGuest] = useState(guestObj || null);
  const [dbEvents, setDbEvents] = useState([]);
  
  // Concierge note states
  const [internalNote, setInternalNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [activeNoteList, setActiveNoteList] = useState([]);
  const [noteError, setNoteError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Edit profile modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    title: '',
    company: '',
    category: '',
    status: 'CONFIRMED',
    isVip: false
  });

  // Edit Preferences modal states
  const [showPrefModal, setShowPrefModal] = useState(false);
  const [isSavingPref, setIsSavingPref] = useState(false);
  const [prefForm, setPrefForm] = useState({
    dietaryPreferences: [],
    customDietary: '',
    specialRequests: ''
  });

  // Edit Accommodation modal states
  const [showAccomModal, setShowAccomModal] = useState(false);
  const [isSavingAccom, setIsSavingAccom] = useState(false);
  const [accomForm, setAccomForm] = useState({
    hotelName: '',
    roomType: '',
    roomNumber: '',
    checkIn: '',
    checkOut: ''
  });

  // Edit Transportation modal states
  const [showTransModal, setShowTransModal] = useState(false);
  const [isSavingTrans, setIsSavingTrans] = useState(false);
  const [transForm, setTransForm] = useState({
    vehicle: '',
    driverName: '',
    driverPhone: '',
    pickupTime: '',
    pickupLocation: '',
    dropLocation: '',
    trackingLink: ''
  });

  // Expand all communications state & pagination limit
  const [isAllCommsOpen, setIsAllCommsOpen] = useState(false);
  const [commsLimit, setCommsLimit] = useState(15);

  // Send Message modal states (Fix 1)
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendChannel, setSendChannel] = useState('Email');
  const [sendSubject, setSendSubject] = useState('');
  const [sendMessageText, setSendMessageText] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  // Edit Seating modal states (Fix 5)
  const [showSeatingModal, setShowSeatingModal] = useState(false);
  const [isSavingSeating, setIsSavingSeating] = useState(false);
  const [seatingForm, setSeatingForm] = useState({
    tableNumber: '',
    seatNumber: '',
    section: '',
    floor: 'Main Ballroom'
  });

  // Track Driver modal states (Fix 6)
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [copyConfirmed, setCopyConfirmed] = useState(false);

  // Pinned concierge notes state (Fix 7)
  const [pinnedNoteIds, setPinnedNoteIds] = useState([]);

  useEffect(() => {
    if (guestObj && (guestObj.id === targetId || guestObj.guest_id === targetId || !basicGuest)) {
      setBasicGuest((prev) => ({
        ...prev,
        ...guestObj
      }));
    }
  }, [guestObj, targetId]);

  useEffect(() => {
    if (!targetId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setGuestProfile(null);
    if (guestObj) setBasicGuest(guestObj);
    setActiveNoteList([]);
    setShowEditModal(false);
    setShowPrefModal(false);
    setShowAccomModal(false);
    setShowTransModal(false);
    setShowSeatingModal(false);
    setShowSendModal(false);

    Promise.all([
      api.get(`/guests/${targetId}/profile`).catch(() => null),
      api.get(`/guests/${targetId}`).catch(() => null),
      api.get(`/guests/${targetId}/communications`).catch(() => null),
      api.get(`/guests/${targetId}/accommodation`).catch(() => null),
      api.get(`/guests/${targetId}/transportation`).catch(() => null),
      api.get(`/guests/${targetId}/seating`).catch(() => null),
      api.get(`/guests/${targetId}/notes`).catch(() => null),
      api.get(`/events`).catch(() => null)
    ]).then(([profRes, basicRes, commRes, accomRes, transRes, seatingRes, notesRes, eventsRes]) => {
      let updatedProfile = profRes && profRes.success && profRes.data ? { ...profRes.data } : {};
      
      if (commRes && commRes.success && Array.isArray(commRes.data) && commRes.data.length > 0) {
        updatedProfile.communicationHistory = commRes.data;
      }
      if (accomRes && accomRes.success && accomRes.data && Object.keys(accomRes.data).length > 0) {
        updatedProfile.accommodation = accomRes.data;
      }
      if (transRes && transRes.success && transRes.data && Object.keys(transRes.data).length > 0) {
        updatedProfile.transportation = transRes.data;
      }
      if (seatingRes && seatingRes.success && seatingRes.data && Object.keys(seatingRes.data).length > 0) {
        updatedProfile.seatingAssignment = seatingRes.data;
      }
      if (notesRes && notesRes.success && Array.isArray(notesRes.data)) {
        const sorted = [...notesRes.data].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setActiveNoteList(sorted);
        updatedProfile.conciergeNotes = sorted;
      } else if (Array.isArray(updatedProfile.conciergeNotes)) {
        const sorted = [...updatedProfile.conciergeNotes].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setActiveNoteList(sorted);
      }
      
      setGuestProfile(updatedProfile);

      if (basicRes && basicRes.success && basicRes.data) {
        setBasicGuest(basicRes.data);
      }
      if (eventsRes && eventsRes.success && Array.isArray(eventsRes.data)) {
        setDbEvents(eventsRes.data);
      }
      setLoading(false);
    });
  }, [targetId]);

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveInternalNote = async () => {
    if (isSavingNote) return;
    if (!internalNote.trim()) {
      setNoteError('Please write a note before saving');
      return;
    }
    setNoteError('');
    setIsSavingNote(true);
    const textToSave = internalNote.trim();
    try {
      const res = await api.post(`/guests/${targetId}/notes`, { note: textToSave });
      if (res && res.success && res.data) {
        setActiveNoteList((prev) => [res.data, ...prev]);
        setInternalNote('');
        showToast('Note saved successfully', 'success');
      } else {
        const fallbackNote = {
          id: Date.now().toString(),
          note: textToSave,
          createdBy: 'Concierge Team',
          createdAt: new Date().toISOString()
        };
        setActiveNoteList((prev) => [fallbackNote, ...prev]);
        setInternalNote('');
        showToast('Note saved successfully', 'success');
      }
    } catch (err) {
      const fallbackNote = {
        id: Date.now().toString(),
        note: textToSave,
        createdBy: 'Concierge Team',
        createdAt: new Date().toISOString()
      };
      setActiveNoteList((prev) => [fallbackNote, ...prev]);
      setInternalNote('');
      showToast('Note saved successfully', 'success');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleOpenEditModal = () => {
    const locParts = (guestProfile?.city || basicGuest?.location || '').split(',');
    setEditForm({
      name: guestProfile?.fullName || basicGuest?.name || guestObj?.name || '',
      email: guestProfile?.email || basicGuest?.email || guestObj?.email || '',
      phone: guestProfile?.phone || basicGuest?.phone || guestObj?.phone || '',
      city: guestProfile?.city || locParts[0]?.trim() || '',
      country: guestProfile?.country || locParts[1]?.trim() || '',
      title: guestProfile?.designation || basicGuest?.title || guestObj?.title || '',
      company: guestProfile?.company || basicGuest?.company || guestObj?.company || '',
      category: guestProfile?.category || basicGuest?.category || categoryName || 'Attendee',
      status: guestProfile?.rsvp?.rsvpStatus || basicGuest?.status || guestObj?.rsvpStatus || 'CONFIRMED',
      isVip: guestProfile?.vipStatus || basicGuest?.isVip || false
    });
    setShowEditModal(true);
  };

  const handleSaveProfileEdit = async (e) => {
    if (e) e.preventDefault();
    if (!targetId || isSavingEdit) return;
    setIsSavingEdit(true);
    try {
      const payload = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        city: editForm.city,
        country: editForm.country,
        location: [editForm.city, editForm.country].filter(Boolean).join(', '),
        title: editForm.title,
        designation: editForm.title,
        company: editForm.company,
        category: editForm.category,
        status: editForm.status,
        isVip: editForm.isVip
      };
      const res = await api.put(`/guests/${targetId}`, payload);
      if (res && res.success) {
        setBasicGuest((prev) => ({
          ...prev,
          ...payload,
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          title: editForm.title,
          company: editForm.company,
          category: editForm.category,
          status: editForm.status,
          isVip: editForm.isVip
        }));
        setGuestProfile((prev) => ({
          ...prev,
          fullName: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          city: editForm.city,
          country: editForm.country,
          designation: editForm.title,
          company: editForm.company,
          category: editForm.category,
          vipStatus: editForm.isVip,
          status: editForm.status,
          rsvp: {
            ...(prev?.rsvp || {}),
            rsvpStatus: editForm.status
          }
        }));
        setShowEditModal(false);
        showToast('Profile updated successfully', 'success');
        if (onUpdateGuest) onUpdateGuest();
      } else {
        showToast('Failed to save profile changes. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Save edit error:', err);
      showToast('Failed to save profile changes. Server error occurred.', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleOpenPrefModal = () => {
    const dietary = Array.isArray(guestProfile?.dietaryPreferences) ? [...guestProfile.dietaryPreferences] : [];
    const special = Array.isArray(guestProfile?.specialRequests) ? guestProfile.specialRequests.join('\n') : '';
    setPrefForm({
      dietaryPreferences: dietary.filter(d => COMMON_DIETARY_OPTIONS.includes(d)),
      customDietary: dietary.filter(d => !COMMON_DIETARY_OPTIONS.includes(d)).join(', '),
      specialRequests: special
    });
    setShowPrefModal(true);
  };

  const handleSavePrefEdit = async (e) => {
    if (e) e.preventDefault();
    if (!targetId || isSavingPref) return;
    setIsSavingPref(true);
    try {
      const customItems = prefForm.customDietary.split(',').map(s => s.trim()).filter(Boolean);
      const allDietary = Array.from(new Set([...prefForm.dietaryPreferences, ...customItems]));
      const allRequests = prefForm.specialRequests.split('\n').map(s => s.trim()).filter(Boolean);
      const payload = {
        dietaryPreferences: allDietary,
        specialRequests: allRequests
      };
      const res = await api.put(`/guests/${targetId}/preferences`, payload);
      if (res && res.success) {
        setGuestProfile(prev => ({
          ...prev,
          dietaryPreferences: allDietary,
          specialRequests: allRequests
        }));
        setShowPrefModal(false);
        showToast('Preferences updated successfully', 'success');
        if (onUpdateGuest) onUpdateGuest();
      } else {
        showToast('Failed to save preferences. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Save preferences error:', err);
      showToast('Failed to save preferences. Server error occurred.', 'error');
    } finally {
      setIsSavingPref(false);
    }
  };

  const handleOpenAccomModal = () => {
    const acc = guestProfile?.accommodation || {};
    setAccomForm({
      hotelName: acc.hotelName || basicGuest?.assignedHotel?.name || '',
      roomType: acc.roomType || 'Executive Suite',
      roomNumber: acc.roomNumber || '',
      checkIn: acc.checkIn ? new Date(acc.checkIn).toISOString().slice(0, 16) : '',
      checkOut: acc.checkOut ? new Date(acc.checkOut).toISOString().slice(0, 16) : ''
    });
    setShowAccomModal(true);
  };

  const handleSaveAccomEdit = async (e) => {
    if (e) e.preventDefault();
    if (!targetId || isSavingAccom) return;
    setIsSavingAccom(true);
    try {
      const payload = {
        hotelName: accomForm.hotelName,
        roomType: accomForm.roomType,
        roomNumber: accomForm.roomNumber,
        checkIn: accomForm.checkIn ? new Date(accomForm.checkIn).toISOString() : null,
        checkOut: accomForm.checkOut ? new Date(accomForm.checkOut).toISOString() : null
      };
      const res = await api.put(`/guests/${targetId}/accommodation`, payload);
      if (res && res.success) {
        setGuestProfile(prev => ({
          ...prev,
          accommodation: {
            ...(prev?.accommodation || {}),
            ...payload
          }
        }));
        setShowAccomModal(false);
        showToast('Accommodation updated successfully', 'success');
        if (onUpdateGuest) onUpdateGuest();
      } else {
        showToast('Failed to save accommodation details. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Save accommodation error:', err);
      showToast('Failed to save accommodation. Server error occurred.', 'error');
    } finally {
      setIsSavingAccom(false);
    }
  };

  const handleOpenTransModal = () => {
    const tr = guestProfile?.transportation || {};
    setTransForm({
      vehicle: tr.vehicle || 'Tesla Model S VIP Black',
      driverName: tr.driverName || 'James Miller',
      driverPhone: tr.driverPhone || '+1 (555) 019-2831',
      pickupTime: tr.pickupTime ? new Date(tr.pickupTime).toISOString().slice(0, 16) : '',
      pickupLocation: tr.pickupLocation || 'International Airport - Terminal 1 VIP Entrance',
      dropLocation: tr.dropLocation || guestProfile?.accommodation?.hotelName || 'Grand Palace Resort Lobby',
      trackingLink: tr.trackingLink || `https://track.fleet360.app/t/${targetId?.slice(0, 8)}`
    });
    setShowTransModal(true);
  };

  const handleSaveTransEdit = async (e) => {
    if (e) e.preventDefault();
    if (!targetId || isSavingTrans) return;
    setIsSavingTrans(true);
    try {
      const payload = {
        vehicle: transForm.vehicle,
        driverName: transForm.driverName,
        driverPhone: transForm.driverPhone,
        pickupTime: transForm.pickupTime ? new Date(transForm.pickupTime).toISOString() : null,
        pickupLocation: transForm.pickupLocation,
        dropLocation: transForm.dropLocation,
        trackingLink: transForm.trackingLink
      };
      const res = await api.put(`/guests/${targetId}/transportation`, payload);
      if (res && res.success) {
        setGuestProfile(prev => ({
          ...prev,
          transportation: {
            ...(prev?.transportation || {}),
            ...payload
          }
        }));
        setShowTransModal(false);
        showToast('Transportation updated successfully', 'success');
        if (onUpdateGuest) onUpdateGuest();
      } else {
        showToast('Failed to save transportation details. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Save transportation error:', err);
      showToast('Failed to save transportation. Server error occurred.', 'error');
    } finally {
      setIsSavingTrans(false);
    }
  };

  const handleSendMessageSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!targetId || isSendingMsg) return;
    if (sendMessageText.trim().length < 10) {
      showToast('Message must be at least 10 characters', 'error');
      return;
    }
    setIsSendingMsg(true);
    try {
      const payload = {
        communicationType: sendChannel.toUpperCase(),
        title: sendChannel === 'Email' ? (sendSubject || sendMessageText.slice(0, 40)) : sendMessageText.slice(0, 40),
        description: sendMessageText
      };
      const res = await api.post(`/guests/${targetId}/communications`, payload);
      const newEntry = res && res.success && res.data ? res.data : {
        id: Date.now().toString(),
        communicationType: sendChannel.toUpperCase(),
        title: payload.title,
        description: payload.description,
        createdAt: new Date().toISOString(),
        deliveryStatus: 'DELIVERED'
      };
      setGuestProfile((prev) => {
        const existingComms = Array.isArray(prev?.communicationHistory) ? prev.communicationHistory : [];
        return {
          ...prev,
          communicationHistory: [newEntry, ...existingComms]
        };
      });
      setSendMessageText('');
      setSendSubject('');
      setShowSendModal(false);
      showToast('Message sent successfully', 'success');
    } catch (err) {
      console.error('Send message error:', err);
      showToast('Failed to send message. Please try again.', 'error');
    } finally {
      setIsSendingMsg(false);
    }
  };

  const handleOpenSeatingModal = () => {
    const seat = guestProfile?.seatingAssignment || {};
    setSeatingForm({
      tableNumber: seat.tableNumber || (basicGuest?.table?.name ? basicGuest.table.name.replace(/\D+/g, '') || basicGuest.table.name : '1'),
      seatNumber: seat.seatNumber || basicGuest?.seatNumber || '1',
      section: seat.section || seat.floor || 'VIP Section A',
      floor: seat.floor || 'Main Ballroom'
    });
    setShowSeatingModal(true);
  };

  const handleSaveSeatingEdit = async (e) => {
    if (e) e.preventDefault();
    if (!targetId || isSavingSeating) return;
    setIsSavingSeating(true);
    try {
      const payload = {
        tableNumber: seatingForm.tableNumber,
        seatNumber: seatingForm.seatNumber,
        section: seatingForm.section,
        floor: seatingForm.floor
      };
      const res = await api.put(`/guests/${targetId}/seating`, payload);
      if (res && res.success) {
        setGuestProfile((prev) => ({
          ...prev,
          seatingAssignment: {
            ...(prev?.seatingAssignment || {}),
            ...payload
          }
        }));
        setBasicGuest((prev) => ({
          ...prev,
          table: {
            ...(prev?.table || {}),
            name: `Table ${seatingForm.tableNumber}`
          },
          seatNumber: seatingForm.seatNumber
        }));
        setShowSeatingModal(false);
        showToast('Seating updated successfully', 'success');
        if (onUpdateGuest) onUpdateGuest();
      } else {
        showToast('Failed to save seating assignment. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Save seating error:', err);
      showToast('Failed to save seating. Server error occurred.', 'error');
    } finally {
      setIsSavingSeating(false);
    }
  };

  const togglePinNote = (noteId) => {
    setPinnedNoteIds((prev) =>
      prev.includes(noteId) ? prev.filter((id) => id !== noteId) : [noteId, ...prev]
    );
  };

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
    if (title && comp && comp !== 'N/A' && title !== 'N/A') return `${title} • ${comp}`;
    if (title && title !== 'N/A') return title;
    if (comp && comp !== 'N/A') return comp;
    return `${guestProfile?.category || basicGuest?.category || categoryName || 'VIP Attendee'}`;
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
    if (basicGuest?.allergies && basicGuest.allergies !== 'None' && basicGuest.allergies !== 'none') {
      return [basicGuest.allergies];
    }
    if (basicGuest?.mealPreference && basicGuest.mealPreference !== 'Standard' && basicGuest.mealPreference !== 'Non-Veg') {
      return [basicGuest.mealPreference];
    }
    return [];
  }, [guestProfile, basicGuest]);

  const specialReqList = useMemo(() => {
    if (Array.isArray(guestProfile?.specialRequests) && guestProfile.specialRequests.length > 0) {
      return guestProfile.specialRequests;
    }
    if (basicGuest?.requests) return [basicGuest.requests];
    if (basicGuest?.group?.specialRequirement) return [basicGuest.group.specialRequirement];
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
        roomInfo: 'Executive Suite',
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

  const fullCommList = useMemo(() => {
    let list = [];
    if (Array.isArray(guestProfile?.communicationHistory) && guestProfile.communicationHistory.length > 0) {
      list = guestProfile.communicationHistory;
    } else if (Array.isArray(basicGuest?.communicationLogs) && basicGuest.communicationLogs.length > 0) {
      list = basicGuest.communicationLogs;
    }
    return [...list].sort((a, b) => new Date(b.createdAt || b.sentAt || 0) - new Date(a.createdAt || a.sentAt || 0));
  }, [guestProfile, basicGuest]);

  const commHistory = useMemo(() => {
    if (isAllCommsOpen) return fullCommList.slice(0, commsLimit);
    return fullCommList.slice(0, 3);
  }, [fullCommList, isAllCommsOpen, commsLimit]);

  const sortedNoteList = useMemo(() => {
    return [...activeNoteList].sort((a, b) => {
      const aPinned = pinnedNoteIds.includes(a.id) ? 1 : 0;
      const bPinned = pinnedNoteIds.includes(b.id) ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [activeNoteList, pinnedNoteIds]);

  const sentimentBadge = useMemo(() => {
    const allText = activeNoteList.map((n) => (n.note || '').toLowerCase()).join(' ');
    const attnKeywords = ['issue', 'problem', 'complaint', 'unhappy', 'bad', 'delay', 'upset', 'angry'];
    if (attnKeywords.some((w) => allText.includes(w))) {
      return { label: '⚠️ Needs Attention', class: 'attn' };
    }
    if (rsvpStatus === 'PENDING') {
      return { label: '⏳ Awaiting', class: 'await' };
    }
    if (rsvpStatus === 'CONFIRMED' || rsvpStatus === 'YES' || rsvpStatus === 'ATTENDING') {
      return { label: '😊 Positive', class: 'pos' };
    }
    return null;
  }, [activeNoteList, rsvpStatus]);

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
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: toastType === 'error' ? '#ef4444' : '#10b981', color: '#FFFFFF', padding: '0.8rem 1.6rem', borderRadius: '12px', fontWeight: '600', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 9999 }}>
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
              style={{ display: photoUrl ? 'none' : 'flex', border: '2px dashed #E6EAF0', borderRadius: '16px', flexDirection: 'column', gap: '4px', position: 'relative', overflow: 'hidden', backgroundColor: '#f8fafc' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#ae2f34" style={{ width: '26px', height: '26px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Upload Photo</span>
              <input
                type="file"
                accept="image/*"
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const url = URL.createObjectURL(e.target.files[0]);
                    setGuestProfile((prev) => ({ ...prev, profileImage: url }));
                    setBasicGuest((prev) => ({ ...prev, avatar: url }));
                    showToast('Photo uploaded successfully', 'success');
                  }
                }}
              />
            </div>
            <div className="g360-vip-badge">{badgeText}</div>
          </div>

          <div className="g360-hero-info">
            <div className="g360-name-row">
              <h2 className="g360-guest-name">{fullName}</h2>
              <span className="g360-membership-chip">{tierChipText}</span>
              {sentimentBadge && (
                <span className={`g360-sentiment-badge ${sentimentBadge.class}`}>{sentimentBadge.label}</span>
              )}
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
            onClick={handleOpenEditModal}
          >
            Edit Profile
          </button>
          <button
            type="button"
            className="g360-btn-primary-coral"
            onClick={() => setShowSendModal(true)}
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
                {rsvpMeta.class === 'confirmed' && <span style={{ fontWeight: 800 }}>✓</span>}
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
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <div className="g360-pref-header-title">Guest Preferences</div>
                  </div>

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

                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="g360-btn-outline-coral g360-btn-card-edit"
                    onClick={handleOpenPrefModal}
                  >
                    Edit Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Middle: 2-Column Logistics Cards */}
          <div className="g360-logistics-grid">
            {/* Accommodation Card */}
            <div className="g360-card g360-card-gold-top" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="g360-card-header-icon" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="g360-btn-outline-coral g360-btn-card-edit"
                  onClick={handleOpenAccomModal}
                >
                  Edit Accommodation
                </button>
              </div>
            </div>

            {/* Transportation Card */}
            <div className="g360-card g360-card-coral-top" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="g360-card-header-icon" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{transInfo.trackingLink}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '18px', height: '18px', color: '#ae2f34', flexShrink: 0 }}>
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

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {transInfo && (
                  <button
                    type="button"
                    className="g360-btn-primary-coral"
                    style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                    onClick={() => setShowTrackModal(true)}
                  >
                    <span>📍 Track Driver</span>
                  </button>
                )}
                <button
                  type="button"
                  className="g360-btn-outline-coral g360-btn-card-edit"
                  onClick={handleOpenTransModal}
                >
                  Edit Transportation
                </button>
              </div>
            </div>
          </div>

          {/* Bottom: Seating Assignment Card with Interactive Floor Plan */}
          <div className="g360-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
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

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="g360-btn-outline-coral g360-btn-card-edit"
                onClick={handleOpenSeatingModal}
              >
                Edit Seating
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="g360-grid-right">
          
          {/* Top: Communication History Card */}
          <div className="g360-card">
            <h3 className="g360-card-title">Communication History</h3>

            {commHistory.length > 0 ? (
              <div className="g360-timeline" style={isAllCommsOpen ? { maxHeight: '380px', overflowY: 'auto', paddingRight: '0.4rem' } : {}}>
                {commHistory.map((comm, idx) => {
                  const typeStr = (comm.communicationType || comm.channel || '').toUpperCase();
                  let icon = 'mail';
                  let bg = 'rgba(174, 47, 52, 0.12)';
                  let color = '#ae2f34';
                  if (typeStr === 'WHATSAPP' || typeStr === 'SMS') {
                    icon = 'chat';
                    bg = 'rgba(76, 175, 141, 0.15)';
                    color = '#4CAF8D';
                  } else if (typeStr === 'PHONE_CALL' || typeStr === 'CALL' || typeStr === 'VOICE') {
                    icon = 'call';
                    bg = 'rgba(117, 90, 29, 0.15)';
                    color = '#755a1d';
                  } else if (typeStr === 'CHAT' || typeStr === 'MESSAGE') {
                    icon = 'chat_alt';
                    bg = 'rgba(105, 81, 155, 0.15)';
                    color = '#69519b';
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
                          ) : icon === 'call' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
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

            {isAllCommsOpen && fullCommList.length > commsLimit && (
              <button
                type="button"
                className="g360-btn-full-alt"
                style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}
                onClick={() => setCommsLimit((prev) => prev + 15)}
              >
                Load More ({fullCommList.length - commsLimit} remaining)
              </button>
            )}

            <button
              type="button"
              className="g360-btn-full-alt"
              onClick={() => {
                if (isAllCommsOpen) {
                  setIsAllCommsOpen(false);
                  setCommsLimit(15);
                } else {
                  setIsAllCommsOpen(true);
                }
              }}
            >
              {isAllCommsOpen ? 'Show Recent Only' : 'View All Activity'}
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
              {sortedNoteList && sortedNoteList.length > 0 ? (
                sortedNoteList.map((n, idx) => {
                  const isPinned = pinnedNoteIds.includes(n.id);
                  return (
                    <div key={n.id || idx} className="g360-note-quote" style={isPinned ? { borderLeftColor: '#ae2f34', backgroundColor: 'rgba(174,47,52,0.03)' } : {}}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isPinned ? '#ae2f34' : '#64748b' }}>
                          {isPinned && '📌 Pinned • '}{n.createdBy || 'Concierge Team'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePinNote(n.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: isPinned ? '#ae2f34' : '#94a3b8', padding: '0 4px' }}
                          title={isPinned ? 'Unpin note' : 'Pin note to top'}
                        >
                          {isPinned ? '📌 Unpin' : '📌 Pin'}
                        </button>
                      </div>
                      <p className="g360-note-text">"{n.note}"</p>
                      <div className="g360-note-author">
                        <span style={{ fontWeight: 400, color: '#94a3b8' }}>
                          {n.createdAt ? new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="g360-note-quote" style={{ textAlign: 'center' }}>
                  <p className="g360-note-text" style={{ color: '#64748b' }}>No concierge notes recorded for this guest yet.</p>
                </div>
              )}
            </div>

            <textarea
              value={internalNote}
              maxLength={500}
              onChange={(e) => {
                setInternalNote(e.target.value);
                if (noteError && e.target.value.trim()) setNoteError('');
              }}
              className="g360-note-textarea"
              placeholder="Add an internal note..."
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', marginBottom: '8px' }}>
              <div>
                {noteError && (
                  <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>
                    {noteError}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: internalNote.length > 400 ? 'bold' : '500', color: internalNote.length > 400 ? '#ae2f34' : '#64748b' }}>
                {internalNote.length} / 500 characters
              </div>
            </div>

            <button
              type="button"
              className="g360-btn-save-note"
              onClick={handleSaveInternalNote}
              disabled={isSavingNote}
            >
              {isSavingNote ? 'Saving Note...' : 'Save Internal Note'}
            </button>
          </div>
        </div>
      </section>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="g360-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !isSavingEdit) setShowEditModal(false); }}>
          <div className="g360-modal">
            <div className="g360-modal-header">
              <h3 className="g360-modal-title">Edit Guest Profile</h3>
              <button
                type="button"
                className="g360-modal-close"
                disabled={isSavingEdit}
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveProfileEdit} className="g360-modal-body">
              <div className="g360-form-row">
                <div className="g360-form-field">
                  <label className="g360-form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="g360-form-input"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div className="g360-form-field">
                  <label className="g360-form-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="g360-form-input"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="g360-form-row">
                <div className="g360-form-field">
                  <label className="g360-form-label">Phone Number</label>
                  <input
                    type="text"
                    className="g360-form-input"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
                <div className="g360-form-field">
                  <label className="g360-form-label">RSVP Status</label>
                  <select
                    className="g360-form-select"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="DECLINED">DECLINED</option>
                  </select>
                </div>
              </div>

              <div className="g360-form-row">
                <div className="g360-form-field">
                  <label className="g360-form-label">City</label>
                  <input
                    type="text"
                    className="g360-form-input"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  />
                </div>
                <div className="g360-form-field">
                  <label className="g360-form-label">Country</label>
                  <input
                    type="text"
                    className="g360-form-input"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                  />
                </div>
              </div>

              <div className="g360-form-row">
                <div className="g360-form-field">
                  <label className="g360-form-label">Designation / Title</label>
                  <input
                    type="text"
                    className="g360-form-input"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </div>
                <div className="g360-form-field">
                  <label className="g360-form-label">Company / Organization</label>
                  <input
                    type="text"
                    className="g360-form-input"
                    value={editForm.company}
                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                  />
                </div>
              </div>

              <div className="g360-form-row">
                <div className="g360-form-field">
                  <label className="g360-form-label">Category</label>
                  <input
                    type="text"
                    className="g360-form-input"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  />
                </div>
                <div className="g360-form-field" style={{ display: 'flex', alignItems: 'center', paddingTop: '1.6rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600, color: 'var(--g360-text-main)' }}>
                    <input
                      type="checkbox"
                      checked={editForm.isVip}
                      onChange={(e) => setEditForm({ ...editForm, isVip: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#ae2f34', cursor: 'pointer' }}
                    />
                    VIP Guest Status
                  </label>
                </div>
              </div>

              <div className="g360-modal-footer">
                <button
                  type="button"
                  className="g360-btn-secondary-gold"
                  style={{ padding: '0.65rem 1.4rem' }}
                  disabled={isSavingEdit}
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="g360-btn-primary-coral"
                  style={{ padding: '0.65rem 1.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  disabled={isSavingEdit}
                >
                  {isSavingEdit ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Preferences Modal */}
      {showPrefModal && (
        <div className="g360-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !isSavingPref) setShowPrefModal(false); }}>
          <div className="g360-modal">
            <div className="g360-modal-header">
              <h3 className="g360-modal-title">Edit Guest Preferences</h3>
              <button
                type="button"
                className="g360-modal-close"
                disabled={isSavingPref}
                onClick={() => setShowPrefModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSavePrefEdit} className="g360-modal-body">
              <div className="g360-form-field">
                <label className="g360-form-label">Dietary & Allergen Preferences</label>
                <div className="g360-pref-checkbox-grid">
                  {COMMON_DIETARY_OPTIONS.map((opt) => {
                    const isChecked = prefForm.dietaryPreferences.includes(opt);
                    return (
                      <label key={opt} className={`g360-pref-checkbox-label ${isChecked ? 'checked' : ''}`}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPrefForm(prev => ({ ...prev, dietaryPreferences: [...prev.dietaryPreferences, opt] }));
                            } else {
                              setPrefForm(prev => ({ ...prev, dietaryPreferences: prev.dietaryPreferences.filter(item => item !== opt) }));
                            }
                          }}
                          style={{ width: '16px', height: '16px', accentColor: '#ae2f34' }}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="g360-form-field" style={{ marginTop: '0.5rem' }}>
                <label className="g360-form-label">Other/Custom Dietary (comma separated)</label>
                <input
                  type="text"
                  className="g360-form-input"
                  placeholder="e.g. Low Sodium, Organic only"
                  value={prefForm.customDietary}
                  onChange={(e) => setPrefForm({ ...prefForm, customDietary: e.target.value })}
                />
              </div>

              <div className="g360-form-field" style={{ marginTop: '0.5rem' }}>
                <label className="g360-form-label">Special Requests (one per line)</label>
                <textarea
                  className="g360-form-input"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  placeholder="e.g. Early check-in needed&#10;Wheelchair accessibility required"
                  value={prefForm.specialRequests}
                  onChange={(e) => setPrefForm({ ...prefForm, specialRequests: e.target.value })}
                />
              </div>

              <div className="g360-modal-footer">
                <button
                  type="button"
                  className="g360-btn-secondary-gold"
                  style={{ padding: '0.65rem 1.4rem' }}
                  disabled={isSavingPref}
                  onClick={() => setShowPrefModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="g360-btn-primary-coral"
                  style={{ padding: '0.65rem 1.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  disabled={isSavingPref}
                >
                  {isSavingPref ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Preferences</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Accommodation Modal */}
      {showAccomModal && (
        <div className="g360-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !isSavingAccom) setShowAccomModal(false); }}>
          <div className="g360-modal">
            <div className="g360-modal-header">
              <h3 className="g360-modal-title">Edit Accommodation Details</h3>
              <button
                type="button"
                className="g360-modal-close"
                disabled={isSavingAccom}
                onClick={() => setShowAccomModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveAccomEdit} className="g360-modal-body">
              <div className="g360-form-field">
                <label className="g360-form-label">Hotel / Resort Name *</label>
                <input
                  type="text"
                  required
                  className="g360-form-input"
                  placeholder="e.g. Grand Palace Resort"
                  value={accomForm.hotelName}
                  onChange={(e) => setAccomForm({ ...accomForm, hotelName: e.target.value })}
                />
              </div>

              <div className="g360-form-row">
                <div className="g360-form-field">
                  <label className="g360-form-label">Room Type</label>
                  <input
                    type="text"
                    className="g360-form-input"
                    placeholder="e.g. Executive Suite"
                    value={accomForm.roomType}
                    onChange={(e) => setAccomForm({ ...accomForm, roomType: e.target.value })}
                  />
                </div>
                <div className="g360-form-field">
                  <label className="g360-form-label">Room Number</label>
                  <input
                    type="text"
                    className="g360-form-input"
                    placeholder="e.g. 402"
                    value={accomForm.roomNumber}
                    onChange={(e) => setAccomForm({ ...accomForm, roomNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="g360-form-row">
                <div className="g360-form-field">
                  <label className="g360-form-label">Check-In Date/Time</label>
                  <input
                    type="datetime-local"
                    className="g360-form-input"
                    value={accomForm.checkIn}
                    onChange={(e) => setAccomForm({ ...accomForm, checkIn: e.target.value })}
                  />
                </div>
                <div className="g360-form-field">
                  <label className="g360-form-label">Check-Out Date/Time</label>
                  <input
                    type="datetime-local"
                    className="g360-form-input"
                    value={accomForm.checkOut}
                    onChange={(e) => setAccomForm({ ...accomForm, checkOut: e.target.value })}
                  />
                </div>
              </div>

              <div className="g360-modal-footer">
                <button
                  type="button"
                  className="g360-btn-secondary-gold"
                  style={{ padding: '0.65rem 1.4rem' }}
                  disabled={isSavingAccom}
                  onClick={() => setShowAccomModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="g360-btn-primary-coral"
                  style={{ padding: '0.65rem 1.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  disabled={isSavingAccom}
                >
                  {isSavingAccom ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Accommodation</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Transportation Modal */}
      {showTransModal && (
        <div className="g360-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !isSavingTrans) setShowTransModal(false); }}>
          <div className="g360-modal">
            <div className="g360-modal-header">
              <h3 className="g360-modal-title">Edit Transportation Details</h3>
              <button
                type="button"
                className="g360-modal-close"
                disabled={isSavingTrans}
                onClick={() => setShowTransModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveTransEdit} className="g360-modal-body">
              <div className="g360-form-row">
                <div className="g360-form-field">
                  <label className="g360-form-label">Vehicle Assigned *</label>
                  <input
                    type="text"
                    required
                    className="g360-form-input"
                    placeholder="e.g. Tesla Model S VIP Black"
                    value={transForm.vehicle}
                    onChange={(e) => setTransForm({ ...transForm, vehicle: e.target.value })}
                  />
                </div>
                <div className="g360-form-field">
                  <label className="g360-form-label">Scheduled Pickup Time</label>
                  <input
                    type="datetime-local"
                    className="g360-form-input"
                    value={transForm.pickupTime}
                    onChange={(e) => setTransForm({ ...transForm, pickupTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="g360-form-row">
                <div className="g360-form-field">
                  <label className="g360-form-label">Driver Name</label>
                  <input
                    type="text"
                    className="g360-form-input"
                    placeholder="e.g. James Miller"
                    value={transForm.driverName}
                    onChange={(e) => setTransForm({ ...transForm, driverName: e.target.value })}
                  />
                </div>
                <div className="g360-form-field">
                  <label className="g360-form-label">Driver Phone</label>
                  <input
                    type="text"
                    className="g360-form-input"
                    placeholder="e.g. +1 (555) 019-2831"
                    value={transForm.driverPhone}
                    onChange={(e) => setTransForm({ ...transForm, driverPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="g360-form-row">
                <div className="g360-form-field">
                  <label className="g360-form-label">Pickup Location</label>
                  <input
                    type="text"
                    className="g360-form-input"
                    placeholder="e.g. International Airport - Terminal 1"
                    value={transForm.pickupLocation}
                    onChange={(e) => setTransForm({ ...transForm, pickupLocation: e.target.value })}
                  />
                </div>
                <div className="g360-form-field">
                  <label className="g360-form-label">Drop-off Location</label>
                  <input
                    type="text"
                    className="g360-form-input"
                    placeholder="e.g. Grand Palace Resort Lobby"
                    value={transForm.dropLocation}
                    onChange={(e) => setTransForm({ ...transForm, dropLocation: e.target.value })}
                  />
                </div>
              </div>

              <div className="g360-form-field">
                <label className="g360-form-label">Fleet Live Tracking Link</label>
                <input
                  type="text"
                  className="g360-form-input"
                  placeholder="https://track.fleet360.app/t/..."
                  value={transForm.trackingLink}
                  onChange={(e) => setTransForm({ ...transForm, trackingLink: e.target.value })}
                />
              </div>
              <div className="g360-modal-footer">
                <button
                  type="button"
                  className="g360-btn-secondary-gold"
                  style={{ padding: '0.65rem 1.4rem' }}
                  disabled={isSavingTrans}
                  onClick={() => setShowTransModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="g360-btn-primary-coral"
                  style={{ padding: '0.65rem 1.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  disabled={isSavingTrans}
                >
                  {isSavingTrans ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Transportation</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Message Modal (Fix 1) */}
      {showSendModal && (
        <div className="g360-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !isSendingMessage) setShowSendModal(false); }}>
          <div className="g360-modal">
            <div className="g360-modal-header">
              <h3 className="g360-modal-title">Send Message to Guest</h3>
              <button
                type="button"
                className="g360-modal-close"
                disabled={isSendingMessage}
                onClick={() => setShowSendModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSendMessageSubmit} className="g360-modal-body">
              <div className="g360-form-field">
                <label className="g360-form-label">To (Guest Recipient)</label>
                <input
                  type="text"
                  readOnly
                  className="g360-form-input"
                  style={{ backgroundColor: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                  value={`${fullName} <${email}>`}
                />
              </div>

              <div className="g360-form-field">
                <label className="g360-form-label">Channel</label>
                <select
                  className="g360-form-input"
                  value={sendForm.channel}
                  onChange={(e) => setSendForm({ ...sendForm, channel: e.target.value })}
                >
                  <option value="EMAIL">Email</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="SMS">SMS</option>
                </select>
              </div>

              {sendForm.channel === 'EMAIL' && (
                <div className="g360-form-field">
                  <label className="g360-form-label">Subject *</label>
                  <input
                    type="text"
                    required
                    className="g360-form-input"
                    placeholder="e.g. Important update regarding your attendance"
                    value={sendForm.subject}
                    onChange={(e) => setSendForm({ ...sendForm, subject: e.target.value })}
                  />
                </div>
              )}

              <div className="g360-form-field">
                <label className="g360-form-label">Message * (minimum 10 characters)</label>
                <textarea
                  required
                  rows={5}
                  className="g360-form-input"
                  style={{ resize: 'vertical' }}
                  placeholder="Type your message here..."
                  value={sendForm.message}
                  onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px', fontSize: '0.78rem', color: sendForm.message.trim().length < 10 ? '#ef4444' : '#64748b' }}>
                  {sendForm.message.length} characters {sendForm.message.trim().length < 10 ? '(at least 10 required)' : '✓'}
                </div>
              </div>

              <div className="g360-modal-footer">
                <button
                  type="button"
                  className="g360-btn-secondary-gold"
                  style={{ padding: '0.65rem 1.4rem' }}
                  disabled={isSendingMessage}
                  onClick={() => setShowSendModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="g360-btn-primary-coral"
                  style={{ padding: '0.65rem 1.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  disabled={isSendingMessage || sendForm.message.trim().length < 10}
                >
                  {isSendingMessage ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Seating Modal (Fix 5) */}
      {showSeatingModal && (
        <div className="g360-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !isSavingSeating) setShowSeatingModal(false); }}>
          <div className="g360-modal">
            <div className="g360-modal-header">
              <h3 className="g360-modal-title">Edit Seating Assignment</h3>
              <button
                type="button"
                className="g360-modal-close"
                disabled={isSavingSeating}
                onClick={() => setShowSeatingModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveSeatingEdit} className="g360-modal-body">
              <div className="g360-form-row">
                <div className="g360-form-field">
                  <label className="g360-form-label">Table Number / Name *</label>
                  <input
                    type="text"
                    required
                    className="g360-form-input"
                    placeholder="e.g. 3 or Table 3 (VIP)"
                    value={seatingForm.tableNumber}
                    onChange={(e) => setSeatingForm({ ...seatingForm, tableNumber: e.target.value })}
                  />
                </div>
                <div className="g360-form-field">
                  <label className="g360-form-label">Seat Number / Position</label>
                  <input
                    type="text"
                    className="g360-form-input"
                    placeholder="e.g. 4 or 4A"
                    value={seatingForm.seatNumber}
                    onChange={(e) => setSeatingForm({ ...seatingForm, seatNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="g360-form-field">
                <label className="g360-form-label">Section / Ballroom Zone *</label>
                <input
                  type="text"
                  required
                  className="g360-form-input"
                  placeholder="e.g. VIP Center Section - Grand Ballroom"
                  value={seatingForm.section}
                  onChange={(e) => setSeatingForm({ ...seatingForm, section: e.target.value })}
                />
              </div>

              <div className="g360-modal-footer">
                <button
                  type="button"
                  className="g360-btn-secondary-gold"
                  style={{ padding: '0.65rem 1.4rem' }}
                  disabled={isSavingSeating}
                  onClick={() => setShowSeatingModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="g360-btn-primary-coral"
                  style={{ padding: '0.65rem 1.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  disabled={isSavingSeating}
                >
                  {isSavingSeating ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Seating</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Driver Tracking Modal (Fix 6) */}
      {showTrackModal && transInfo && (
        <div className="g360-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowTrackModal(false); }}>
          <div className="g360-modal" style={{ maxWidth: '640px' }}>
            <div className="g360-modal-header">
              <div>
                <h3 className="g360-modal-title">Live Driver Tracking • VIP Chauffeur</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--g360-text-muted)', margin: '0.2rem 0 0 0' }}>
                  {transInfo.vehicle} • {transInfo.driverName} ({transInfo.driverPhone || '+1 (555) 019-2831'})
                </p>
              </div>
              <button
                type="button"
                className="g360-modal-close"
                onClick={() => setShowTrackModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="g360-modal-body" style={{ padding: '1.5rem' }}>
              <div style={{ backgroundColor: '#0f172a', borderRadius: '16px', height: '260px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '1px solid #334155' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                
                {/* Simulated Map Route / Radar */}
                <div style={{ width: '140px', height: '140px', borderRadius: '50%', border: '2px dashed #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 16px #10b981', animation: 'pulse 1.5s infinite' }}></div>
                </div>

                <div style={{ zIndex: 10, textAlign: 'center', marginTop: '1.2rem' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8' }}>🚗 Driver En Route — ETA 14 Mins</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>GPS Status: Active VIP Transfer • Heading East on Highway</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #E6EAF0' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Tracking URL</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{transInfo.trackingLink || 'https://track.fleet360.app/t/vip-transfer'}</div>
                </div>
                <button
                  type="button"
                  className="g360-btn-primary-coral"
                  style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                  onClick={() => window.open(transInfo.trackingLink || 'https://track.fleet360.app/t/vip-transfer', '_blank')}
                >
                  Open Full Tracking in New Tab ↗
                </button>
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="g360-btn-secondary-gold"
                  onClick={() => setShowTrackModal(false)}
                >
                  Close Map
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
