import React, { useState, useMemo, useEffect } from 'react';
import './RoomAllocation.css';

// Initial seed data for unassigned guests
const INITIAL_UNASSIGNED = [
  { id: 'u1', name: 'Dr. Marcus Vance', category: 'Speaker', dates: 'Oct 12 - Oct 15', request: 'High Floor', avatar: null },
  { id: 'u2', name: 'Elena Rodriguez', category: 'Sponsor', dates: 'Oct 12 - Oct 18', request: 'Near Elevator', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80' },
  { id: 'u3', name: 'David Chen', category: 'Attendee', dates: 'Oct 13 - Oct 15', request: 'No Special Requests', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
  { id: 'u4', name: 'Sarah Jenkins', category: 'Attendee', dates: 'Oct 12 - Oct 16', request: 'Low Floor preferred', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
  { id: 'u5', name: 'Jack Harkness', category: 'Speaker', dates: 'Oct 14 - Oct 18', request: 'Suite Preferred', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
  { id: 'u6', name: 'Rose Tyler', category: 'Attendee', dates: 'Oct 12 - Oct 18', request: 'Near Main Lobby', avatar: null },
  { id: 'u7', name: 'Martha Jones', category: 'Sponsor', dates: 'Oct 13 - Oct 17', request: 'High Floor', avatar: null },
  { id: 'u8', name: 'Amy Pond', category: 'Attendee', dates: 'Oct 12 - Oct 15', request: 'No Special Requests', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
  { id: 'u9', name: 'Rory Williams', category: 'Attendee', dates: 'Oct 12 - Oct 15', request: 'No Special Requests', avatar: null },
  { id: 'u10', name: 'Clara Oswald', category: 'Attendee', dates: 'Oct 14 - Oct 19', request: 'Near Exit', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80' },
  { id: 'u11', name: 'River Song', category: 'Speaker', dates: 'Oct 12 - Oct 16', request: 'Penthouse preferred', avatar: null },
  { id: 'u12', name: 'Danny Pink', category: 'Attendee', dates: 'Oct 15 - Oct 17', request: 'Low Floor preferred', avatar: null }
];

// Configurable room capacity fallback helper
const getRoomCapacity = (roomType) => {
  return 2;
};

// Initial seed data for rooms
const INITIAL_ROOMS = [
  // Floor 5
  {
    id: 501,
    floor: 5,
    roomNumber: '501',
    roomType: 'Executive Suite',
    status: 'Occupied',
    capacity: 4,
    hasConflict: false,
    guests: [{ name: 'Amara Okafor', category: 'Speaker', initials: 'AO', isVip: true }],
    details: 'King Bed, Lake view'
  },
  {
    id: 502,
    floor: 5,
    roomNumber: '502',
    roomType: 'King Deluxe',
    status: 'Occupied',
    capacity: 2,
    hasConflict: true,
    guests: [
      { name: 'Marcus Thorne', category: 'VIP', initials: 'MT', isVip: true },
      { name: 'Sienna Miller', category: 'Speaker', initials: 'SM', isVip: false },
      { name: 'David Tennant', category: 'Attendee', initials: 'DT', isVip: false }
    ],
    details: 'Maximum room capacity reached.'
  },
  {
    id: 503,
    floor: 5,
    roomNumber: '503',
    roomType: 'King Deluxe',
    status: 'Available',
    capacity: 2,
    hasConflict: false,
    guests: [],
    details: 'King Bed'
  },
  {
    id: 504,
    floor: 5,
    roomNumber: '504',
    roomType: 'Executive Suite',
    status: 'Reserved',
    capacity: 4,
    hasConflict: false,
    guests: [],
    details: 'Holding for Delegation...'
  },
  {
    id: 505,
    floor: 5,
    roomNumber: '505',
    roomType: 'Executive Suite',
    status: 'Available',
    capacity: 4,
    hasConflict: false,
    guests: [],
    details: 'Lake view Suite'
  },
  {
    id: 506,
    floor: 5,
    roomNumber: '506',
    roomType: 'King Deluxe',
    status: 'Occupied',
    capacity: 2,
    hasConflict: false,
    guests: [{ name: 'Eleanor Vance', category: 'VIP', initials: 'EV', isVip: true }],
    details: 'King Bed'
  },

  // Floor 4
  {
    id: 401,
    floor: 4,
    roomNumber: '401',
    roomType: 'Standard King',
    status: 'Occupied',
    capacity: 2,
    hasConflict: false,
    guests: [{ name: 'Jameson Blake', category: 'Attendee', initials: 'JB', isVip: false }],
    details: 'Standard King'
  },
  {
    id: 402,
    floor: 4,
    roomNumber: '402',
    roomType: 'Standard King',
    status: 'Occupied',
    capacity: 2,
    hasConflict: false,
    guests: [{ name: 'Sarah K. Lee', category: 'Media', initials: 'SK', isVip: false }],
    details: 'Standard King'
  },
  {
    id: 403,
    floor: 4,
    roomNumber: '403',
    roomType: 'Standard Queen',
    status: 'Available',
    capacity: 2,
    hasConflict: false,
    guests: [],
    details: 'Double Queen'
  },
  {
    id: 404,
    floor: 4,
    roomNumber: '404',
    roomType: 'Standard Queen',
    status: 'Available',
    capacity: 2,
    hasConflict: false,
    guests: [],
    details: 'Double Queen'
  },
  {
    id: 405,
    floor: 4,
    roomNumber: '405',
    roomType: 'Standard King',
    status: 'Available',
    capacity: 2,
    hasConflict: false,
    guests: [],
    details: 'King Bed'
  },
  {
    id: 406,
    floor: 4,
    roomNumber: '406',
    roomType: 'Standard Queen',
    status: 'Reserved',
    capacity: 2,
    hasConflict: false,
    guests: [],
    details: 'Staff Hold Block'
  }
];

export default function RoomAllocation() {
  const [activeSubTab, setActiveSubTab] = useState('Floor Plan'); // 'Floor Plan', 'Analytics', 'Reports'
  const [unassignedGuests, setUnassignedGuests] = useState(INITIAL_UNASSIGNED);
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [activeHotel, setActiveHotel] = useState('Grand Ballroom Hotel & Spa');
  const [isHotelDropdownOpen, setIsHotelDropdownOpen] = useState(false);

  // Search filter for unassigned list
  const [guestSearchQuery, setGuestSearchQuery] = useState('');

  // Selected Guest Highlight state
  const [selectedUnassignedGuest, setSelectedUnassignedGuest] = useState(null);

  // Popups/Modals state
  const [isAssignPopupOpen, setIsAssignPopupOpen] = useState(false);
  const [selectedRoomForAssign, setSelectedRoomForAssign] = useState(null);
  const [selectedGuestForAssignId, setSelectedGuestForAssignId] = useState('');

  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState(false);
  const [selectedRoomForDetail, setSelectedRoomForDetail] = useState(null);

  const [isConflictPopupOpen, setIsConflictPopupOpen] = useState(false);
  const [selectedRoomForConflict, setSelectedRoomForConflict] = useState(null);

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState('');

  // Auto-hide toast messages
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const hotelsList = [
    'Grand Ballroom Hotel & Spa',
    'Azure Heights Resort & Suites',
    'The Ritz-Central Executive',
    'Harbor View Boutique',
    'Summit Lodge Concierge'
  ];

  // Dynamic calculations for stats metrics
  const statsMetrics = useMemo(() => {
    const totalBlock = rooms.length;
    
    let assigned = 0;
    let availableCount = 0;
    let conflictRooms = 0;

    rooms.forEach(r => {
      const hasGuests = r.guests && r.guests.length > 0;
      if (hasGuests) {
        assigned += 1;
      } else {
        availableCount += 1;
      }
      if (r.hasConflict) {
        conflictRooms += 1;
      }
    });

    const assignedPercentage = totalBlock > 0 ? ((assigned / totalBlock) * 100).toFixed(0) : '0';

    return {
      totalBlock,
      assigned,
      assignedPercentage,
      available: availableCount,
      conflicts: conflictRooms
    };
  }, [rooms]);

  // Unique floors list extracted dynamically from the dataset
  const uniqueFloors = useMemo(() => {
    const floorsSet = new Set(rooms.map(r => r.floor));
    return Array.from(floorsSet).sort((a, b) => b - a);
  }, [rooms]);

  // Search filter unassigned guests
  const filteredUnassigned = useMemo(() => {
    return unassignedGuests.filter(g => 
      guestSearchQuery.trim() === '' || 
      g.name.toLowerCase().includes(guestSearchQuery.toLowerCase()) ||
      g.category.toLowerCase().includes(guestSearchQuery.toLowerCase())
    );
  }, [unassignedGuests, guestSearchQuery]);

  // Click handler to select an unassigned guest (for highlighting preferred rooms)
  const handleSelectUnassignedGuest = (guest) => {
    if (selectedUnassignedGuest?.id === guest.id) {
      setSelectedUnassignedGuest(null); // toggle off
    } else {
      setSelectedUnassignedGuest(guest);
      setToastMessage(`Tip: Highlighted rooms match ${guest.name}'s room preference.`);
    }
  };

  // Open Room Selection for allocation
  const handleRoomClick = (room) => {
    if (room.hasConflict) {
      setSelectedRoomForConflict(room);
      setIsConflictPopupOpen(true);
      return;
    }

    if (room.status === 'Reserved') {
      setToastMessage(`Room ${room.roomNumber} is currently on hold.`);
      return;
    }

    const currentOccupancy = room.guests ? room.guests.length : 0;
    const capacity = room.capacity !== undefined ? room.capacity : 2;

    if (currentOccupancy >= capacity) {
      setSelectedRoomForDetail(room);
      setIsDetailPopupOpen(true);
    } else {
      if (currentOccupancy > 0) {
        setSelectedRoomForDetail(room);
        setIsDetailPopupOpen(true);
      } else {
        setSelectedRoomForAssign(room);
        setSelectedGuestForAssignId(selectedUnassignedGuest ? selectedUnassignedGuest.id : (unassignedGuests[0]?.id || ''));
        setIsAssignPopupOpen(true);
      }
    }
  };

  // Confirm Allocation Form Submit
  const handleConfirmAssign = (e) => {
    e.preventDefault();
    if (!selectedGuestForAssignId || !selectedRoomForAssign) return;

    const assignedGuest = unassignedGuests.find(g => g.id === selectedGuestForAssignId);
    if (!assignedGuest) return;

    const targetRoom = rooms.find(r => r.id === selectedRoomForAssign.id);
    if (!targetRoom) return;

    const capacity = targetRoom.capacity !== undefined ? targetRoom.capacity : 2;
    if (targetRoom.guests.length >= capacity) {
      alert("Maximum room capacity reached.");
      setIsAssignPopupOpen(false);
      return;
    }

    const newGuest = {
      name: assignedGuest.name,
      category: assignedGuest.category,
      initials: assignedGuest.name.split(' ').map(n => n[0]).join(''),
      isVip: assignedGuest.category === 'Speaker' || assignedGuest.category === 'Sponsor'
    };

    setRooms(prev => prev.map(r => {
      if (r.id === targetRoom.id) {
        const updatedGuests = [...r.guests, newGuest];
        return {
          ...r,
          status: 'Occupied',
          hasConflict: updatedGuests.length > capacity,
          guests: updatedGuests
        };
      }
      return r;
    }));

    // Remove from unassigned list
    setUnassignedGuests(prev => prev.filter(g => g.id !== selectedGuestForAssignId));

    // Reset popup states
    setIsAssignPopupOpen(false);
    setSelectedRoomForAssign(null);
    setSelectedGuestForAssignId('');
    setSelectedUnassignedGuest(null);

    setToastMessage(`Successfully assigned ${assignedGuest.name} to Room ${targetRoom.roomNumber}!`);
  };

  // Unassign Guest handler
  const handleUnassignGuest = (room) => {
    let releasedGuests = [];

    if (room.guests && room.guests.length > 0) {
      room.guests.forEach((g, idx) => {
        releasedGuests.push({
          id: `u-${Date.now()}-${idx}`,
          name: g.name,
          category: g.category || 'Attendee',
          dates: 'Oct 12 - Oct 15',
          request: g.isVip ? 'VIP Allocation Release' : 'No Special Requests',
          avatar: null
        });
      });
    }

    // Add back to unassigned list
    setUnassignedGuests(prev => [...releasedGuests, ...prev]);

    // Reset room status to Available
    setRooms(prev => prev.map(r => 
      r.id === room.id ? { ...r, status: 'Available', hasConflict: false, guests: [] } : r
    ));

    // Close popups
    setIsDetailPopupOpen(false);
    setIsConflictPopupOpen(false);
    setSelectedRoomForDetail(null);
    setSelectedRoomForConflict(null);

    setToastMessage(`Room ${room.roomNumber} is now vacant & available.`);
  };

  // Unassign single guest from detail popup list
  const handleUnassignSingleGuest = (room, guestName) => {
    const guestToMove = room.guests.find(g => g.name === guestName);
    const remainingGuests = room.guests.filter(g => g.name !== guestName);
    const capacity = room.capacity !== undefined ? room.capacity : 2;

    setRooms(prev => prev.map(r => {
      if (r.id === room.id) {
        let newStatus = 'Available';
        if (remainingGuests.length > 0) {
          newStatus = r.status === 'Reserved' ? 'Reserved' : 'Occupied';
        }
        return {
          ...r,
          status: newStatus,
          hasConflict: remainingGuests.length > capacity,
          guests: remainingGuests
        };
      }
      return r;
    }));

    // Send the guest back to unassigned
    setUnassignedGuests(prev => [
      {
        id: `u-${Date.now()}`,
        name: guestToMove.name,
        category: guestToMove.category || 'Attendee',
        dates: 'Oct 12 - Oct 15',
        request: 'Guest Release',
        avatar: null
      },
      ...prev
    ]);

    const updatedRoom = {
      ...room,
      guests: remainingGuests,
      status: remainingGuests.length > 0 ? (room.status === 'Reserved' ? 'Reserved' : 'Occupied') : 'Available',
      hasConflict: remainingGuests.length > capacity
    };
    
    if (remainingGuests.length === 0) {
      setIsDetailPopupOpen(false);
      setSelectedRoomForDetail(null);
    } else {
      setSelectedRoomForDetail(updatedRoom);
    }

    setToastMessage(`${guestToMove.name} returned to unassigned panel.`);
  };

  // Move one guest to resolve double booking
  const handleResolveConflictMoveOne = (room, guestToMoveName) => {
    const guestToMove = room.guests.find(g => g.name === guestToMoveName);
    const remainingGuests = room.guests.filter(g => g.name !== guestToMoveName);
    const capacity = room.capacity !== undefined ? room.capacity : 2;

    setRooms(prev => prev.map(r => 
      r.id === room.id 
        ? {
            ...r,
            status: remainingGuests.length > 0 ? (r.status === 'Reserved' ? 'Reserved' : 'Occupied') : 'Available',
            hasConflict: remainingGuests.length > capacity,
            guests: remainingGuests
          }
        : r
    ));

    // Send the other back to unassigned
    setUnassignedGuests(prev => [
      {
        id: `u-${Date.now()}`,
        name: guestToMove.name,
        category: guestToMove.category || 'Attendee',
        dates: 'Oct 12 - Oct 15',
        request: 'Resolved Double Booking placement',
        avatar: null
      },
      ...prev
    ]);

    setIsConflictPopupOpen(false);
    setSelectedRoomForConflict(null);
    setToastMessage(`${guestToMove.name} returned to unassigned panel. Conflict resolved!`);
  };

  // Save changes handler
  const handleSaveMatrix = () => {
    setToastMessage('Success: Allocation changes stored in server repository.');
  };

  // Intelligent Auto-Assign logic simulator
  const handleAutoAssignAll = () => {
    if (unassignedGuests.length === 0) {
      setToastMessage('All guests have already been allocated rooms!');
      return;
    }

    let currentUnassigned = [...unassignedGuests];
    let currentRooms = [...rooms];
    let assignedCount = 0;

    currentRooms = currentRooms.map(room => {
      const capacity = room.capacity !== undefined ? room.capacity : 2;
      
      if (room.status !== 'Reserved' && room.guests.length < capacity && currentUnassigned.length > 0) {
        const updatedGuests = [...room.guests];
        
        while (updatedGuests.length < capacity && currentUnassigned.length > 0) {
          let matchIndex = -1;
          if (room.floor === 5) {
            matchIndex = currentUnassigned.findIndex(g => g.category === 'Speaker' || g.category === 'Sponsor');
          }
          if (matchIndex === -1) {
            matchIndex = 0;
          }

          const matchGuest = currentUnassigned[matchIndex];
          currentUnassigned.splice(matchIndex, 1);
          assignedCount += 1;

          updatedGuests.push({
            name: matchGuest.name,
            category: matchGuest.category,
            initials: matchGuest.name.split(' ').map(n => n[0]).join(''),
            isVip: matchGuest.category === 'Speaker' || matchGuest.category === 'Sponsor'
          });
        }

        return {
          ...room,
          status: 'Occupied',
          hasConflict: updatedGuests.length > capacity,
          guests: updatedGuests
        };
      }
      return room;
    });

    setRooms(currentRooms);
    setUnassignedGuests(currentUnassigned);
    setSelectedUnassignedGuest(null);
    setToastMessage(`Success: Auto-assigned ${assignedCount} guests matching room rules!`);
  };

  // Helper check to see if room is highlighted for preferred allocation
  const isRoomHighlighted = (room) => {
    if (!selectedUnassignedGuest || room.status !== 'Available') return false;
    const cat = selectedUnassignedGuest.category;
    if (cat === 'Speaker' || cat === 'Sponsor') {
      return room.floor === 5; // suites/deluxe preferred
    } else {
      return room.floor === 4; // standard rooms preferred
    }
  };

  return (
    <div className="alloc-matrix-container">
      {/* Sub Navigation Tabs */}
      <nav className="matrix-tabs-row">
        <div className="matrix-nav-links">
          <button 
            type="button" 
            className={`matrix-nav-link ${activeSubTab === 'Floor Plan' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('Floor Plan')}
          >
            Floor Plan
          </button>
          <button 
            type="button" 
            className={`matrix-nav-link ${activeSubTab === 'Analytics' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('Analytics')}
          >
            Analytics
          </button>
          <button 
            type="button" 
            className={`matrix-nav-link ${activeSubTab === 'Reports' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('Reports')}
          >
            Reports
          </button>
        </div>

        <div className="matrix-top-actions">
          {/* Header Action Buttons */}
          <button type="button" className="matrix-icon-btn" title="View History" onClick={() => alert('Opening allocation history log...')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 8v4l3 3" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </button>

          <button type="button" className="matrix-icon-btn" title="Notifications" onClick={() => alert('No new allocation alerts.')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>

          <button type="button" className="btn-pill-checkin" onClick={() => alert('Initiating check-in terminal sweep...')}>
            Check-In
          </button>
        </div>
      </nav>

      {activeSubTab === 'Floor Plan' ? (
        <div className="matrix-main-layout">
          {/* Left panel area */}
          <div className="matrix-left-panel">
            {/* Control Bar (Hotel Partners, Save changes) */}
            <div className="matrix-control-card">
              <div className="matrix-title-group" style={{ position: 'relative' }}>
                <h2>Room Allocation Matrix</h2>
                <button 
                  type="button" 
                  className="hotel-selector-trigger"
                  onClick={() => setIsHotelDropdownOpen(!isHotelDropdownOpen)}
                >
                  <span>{activeHotel}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isHotelDropdownOpen && (
                  <div className="hotel-selector-dropdown">
                    {hotelsList.map((hotel, idx) => (
                      <button 
                        key={idx}
                        type="button"
                        className="hotel-dropdown-item"
                        onClick={() => {
                          setActiveHotel(hotel);
                          setIsHotelDropdownOpen(false);
                          setToastMessage(`Switched block to ${hotel}`);
                        }}
                      >
                        {hotel}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button type="button" className="btn-save-matrix" onClick={handleSaveMatrix}>
                Save Changes
              </button>
            </div>

            {/* Metrics cards row */}
            <div className="matrix-stats-row">
              {/* Card 1 */}
              <div className="matrix-stat-card">
                <div className="matrix-stat-label">Total Block</div>
                <div className="matrix-stat-val-group">
                  <span className="matrix-stat-val">{statsMetrics.totalBlock}</span>
                  <span className="matrix-stat-sub">Rooms (Active Subset)</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="matrix-stat-card">
                <div className="matrix-stat-label">Assigned</div>
                <div className="matrix-stat-val-group">
                  <span className="matrix-stat-val" style={{ color: '#059669' }}>{statsMetrics.assigned}</span>
                  <span className="matrix-stat-badge">{statsMetrics.assignedPercentage}%</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="matrix-stat-card">
                <div className="matrix-stat-label">Available</div>
                <div className="matrix-stat-val-group">
                  <span className="matrix-stat-val available">{statsMetrics.available}</span>
                </div>
              </div>

              {/* Card 4 */}
              <div className="matrix-stat-card">
                <div className="matrix-stat-label">Conflicts</div>
                <div className="matrix-stat-val-group">
                  <span className="matrix-stat-val conflicts">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#ef4444' }}>
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    {statsMetrics.conflicts.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>

            {/* Room grid sections */}
            <div className="floor-matrix-card">
              {uniqueFloors.map(floorNum => {
                const floorRooms = rooms.filter(r => r.floor === floorNum);
                const suitesCount = floorRooms.filter(r => r.roomType.toLowerCase().includes('suite') || r.roomType.toLowerCase().includes('penthouse')).length;
                const standardCount = floorRooms.length - suitesCount;
                
                const subtitle = suitesCount > 0 
                  ? `${suitesCount} Suites • ${standardCount} Standard`
                  : `${standardCount} Standard Rooms`;

                return (
                  <div key={floorNum} className="floor-section">
                    <div className="floor-header">
                      <span className="floor-title">Floor {floorNum}</span>
                      <span className="floor-subtitle">{subtitle}</span>
                    </div>

                    <div className="floor-rooms-grid">
                      {floorRooms.map(room => {
                        const highlighted = isRoomHighlighted(room);
                        return (
                          <div 
                            key={room.id} 
                            className={`room-card ${room.status.toLowerCase()} ${room.hasConflict ? 'conflict' : ''} ${highlighted ? 'highlighted' : ''}`}
                            onClick={() => handleRoomClick(room)}
                            style={{
                              border: highlighted ? '2px solid #ff4d4f' : undefined,
                              backgroundColor: highlighted ? '#fff8f6' : undefined
                            }}
                          >
                            {room.status === 'Available' && !room.hasConflict ? (
                              <>
                                <div className="room-card-plus">+</div>
                                <div className="room-available-text">
                                  {room.roomNumber} - Available
                                  <span>{room.details}</span>
                                </div>
                              </>
                            ) : room.status === 'Reserved' && !room.hasConflict ? (
                              <>
                                <div className="room-card-top">
                                  <span className="room-number">{room.roomNumber}</span>
                                  <span className="reserved-badge">{room.floor === 4 ? 'HOLD' : 'RESERVED'}</span>
                                </div>
                                <div className="room-desc">{room.roomType}</div>
                                <div className="reserved-text">{room.details}</div>
                              </>
                            ) : room.hasConflict ? (
                              <>
                                <div className="room-card-top">
                                  <span className="room-number">{room.roomNumber}</span>
                                  <span className="conflict-warning-badge">⚠️</span>
                                </div>
                                <div className="room-desc">{room.roomType}</div>
                                <div className="conflict-inner-card">
                                  <span>⚠️ Maximum room capacity reached.</span>
                                </div>
                              </>
                            ) : (
                              // Occupied
                              <>
                                <div className="room-card-top">
                                  <span className="room-number">
                                    {room.roomNumber}
                                    {room.guests.some(g => g.isVip) && <span className="vip-badge-tag">VIP</span>}
                                  </span>
                                  {room.guests.some(g => g.isVip) && <span className="vip-star-badge">★</span>}
                                </div>
                                <div className="room-desc">{room.roomType}</div>
                                {room.guests.length > 0 && (() => {
                                  const firstGuest = room.guests[0];
                                  const guestLabel = room.guests.length > 1 
                                    ? `${firstGuest.name} (+${room.guests.length - 1})`
                                    : firstGuest.name;
                                  const roleLabel = room.guests.length > 1
                                    ? `${room.guests.length} Guests`
                                    : firstGuest.category;
                                  return (
                                    <div className="room-guest-row">
                                      <div className="room-guest-avatar">
                                        {firstGuest.initials}
                                      </div>
                                      <div className="room-guest-info">
                                        <span className="room-guest-name">{guestLabel}</span>
                                        <span className="room-guest-role">{roleLabel}</span>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Legend Panel */}
              <div className="matrix-legend-row">
                <div className="legend-block-item">
                  <span className="legend-square occupied"></span>
                  <span>Occupied</span>
                </div>
                <div className="legend-block-item">
                  <span className="legend-square available"></span>
                  <span>Available</span>
                </div>
                <div className="legend-block-item">
                  <span className="legend-square reserved"></span>
                  <span>Reserved/Hold</span>
                </div>
                <div className="legend-block-item">
                  <span className="legend-square conflict"></span>
                  <span>Conflict Warning</span>
                </div>
                <div className="legend-block-item">
                  <span style={{ color: '#eab308', fontSize: '1rem', lineHeight: 1 }}>★</span>
                  <span>VIP Placement</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right hand side guest panel list */}
          <div className="matrix-right-panel">
            <div className="unassigned-guest-panel">
              <h2 className="guest-panel-title">Guest Panel</h2>

              {/* Search bar */}
              <div className="guest-search-wrap">
                <span className="guest-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Find unassigned guest..."
                  className="guest-search-input"
                  value={guestSearchQuery}
                  onChange={(e) => setGuestSearchQuery(e.target.value)}
                />
              </div>

              <div className="guest-section-header">
                UNASSIGNED ({filteredUnassigned.length})
              </div>

              {/* Guests items */}
              <div className="unassigned-guest-list">
                {filteredUnassigned.map(guest => {
                  const selected = selectedUnassignedGuest?.id === guest.id;
                  return (
                    <div 
                      key={guest.id} 
                      className="unassigned-guest-card"
                      onClick={() => handleSelectUnassignedGuest(guest)}
                      style={{
                        borderColor: selected ? '#ff4d4f' : undefined,
                        backgroundColor: selected ? '#fff8f6' : undefined,
                        boxShadow: selected ? '0 4px 12px rgba(255, 77, 79, 0.1)' : undefined
                      }}
                    >
                      <div className="unassigned-card-top">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {guest.avatar ? (
                            <img 
                              src={guest.avatar} 
                              alt={guest.name} 
                              style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} 
                            />
                          ) : (
                            <div className="room-guest-avatar" style={{ width: '20px', height: '20px', fontSize: '0.6rem' }}>
                              {guest.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                          <span className="unassigned-guest-name" style={{ fontSize: '0.8rem', width: '130px' }} title={guest.name}>
                            {guest.name}
                          </span>
                        </div>
                        <span className={`role-badge ${guest.category.toLowerCase()}`}>
                          {guest.category}
                        </span>
                      </div>
                      <div className="unassigned-guest-dates">
                        {guest.dates}
                      </div>
                      <div className="unassigned-request-box">
                        <span>Request: {guest.request}</span>
                        <span className="drag-dots-icon" title="Click to highlight rooms">⋮⋮</span>
                      </div>
                    </div>
                  );
                })}

                {filteredUnassigned.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
                    No unassigned guests match search query.
                  </div>
                )}
              </div>

              {/* Auto Assign action block */}
              <button type="button" className="btn-auto-assign-all" onClick={handleAutoAssignAll}>
                <span>✨</span> Auto-Assign All
              </button>

              <div className="guest-panel-footer-text">
                Uses intelligent logic to match guest categories with preferred floor levels.
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Placeholders for Analytics or Reports sub tabs
        <div style={{ backgroundColor: '#ffffff', padding: '4rem 2rem', textAlign: 'center', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📈</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>
            Room {activeSubTab} Dashboard
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto', lineHeight: '1.5' }}>
            Visualize allocation distributions, room usage averages, vacancy predictions, and download custom formatted concierge check sheets.
          </p>
        </div>
      )}

      {/* Popups & Dialog Modals */}

      {/* 1. Assign Guest Popup Modal */}
      {isAssignPopupOpen && (
        <div className="alloc-popup-overlay" onClick={() => setIsAssignPopupOpen(false)}>
          <form className="alloc-popup-box" onClick={e => e.stopPropagation()} onSubmit={handleConfirmAssign}>
            <h3 className="alloc-popup-title">Assign Guest to Room {selectedRoomForAssign.roomNumber}</h3>
            <p className="alloc-popup-desc">Choose one of the unassigned guests to allocate to this vacant room ({selectedRoomForAssign.roomType}).</p>

            <select
              className="alloc-select-guest-field"
              value={selectedGuestForAssignId}
              onChange={(e) => setSelectedGuestForAssignId(e.target.value)}
              required
            >
              <option value="" disabled>-- Select Guest --</option>
              {unassignedGuests.map(g => (
                <option key={g.id} value={g.id}>{g.name} ({g.category})</option>
              ))}
            </select>

            <div className="alloc-popup-actions">
              <button type="button" className="btn-popup-cancel" onClick={() => setIsAssignPopupOpen(false)}>Cancel</button>
              <button type="submit" className="btn-popup-confirm" disabled={!selectedGuestForAssignId}>Confirm</button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Room Occupant Detail Modal */}
      {isDetailPopupOpen && (
        <div className="alloc-popup-overlay" onClick={() => setIsDetailPopupOpen(false)}>
          <div className="alloc-popup-box" onClick={e => e.stopPropagation()} style={{ width: '340px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 className="alloc-popup-title" style={{ fontSize: '1.15rem' }}>Room {selectedRoomForDetail.roomNumber}</h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ff4d4f', textTransform: 'uppercase' }}>{selectedRoomForDetail.roomType}</span>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Capacity: {selectedRoomForDetail.capacity !== undefined ? selectedRoomForDetail.capacity : 2} occupants
                </span>
              </div>
              <span className="legend-square occupied" style={{ width: '18px', height: '18px' }}></span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {selectedRoomForDetail.guests && selectedRoomForDetail.guests.map((g, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div className="room-guest-avatar" style={{ width: '38px', height: '38px', fontSize: '0.95rem' }}>
                    {g.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '0.9rem', color: '#1e293b', display: 'block' }}>{g.name}</strong>
                    <span className={`role-badge ${g.category.toLowerCase()}`} style={{ display: 'inline-block', marginTop: '0.15rem' }}>
                      {g.category}
                    </span>
                  </div>
                  <button 
                    type="button" 
                    className="btn-popup-confirm" 
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem', backgroundColor: '#ef4444' }}
                    onClick={() => handleUnassignSingleGuest(selectedRoomForDetail, g.name)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem' }}>
              <div>📅 <strong>Dates:</strong> Oct 12 - Oct 15, 2023</div>
              <div>🔑 <strong>Amenities:</strong> {selectedRoomForDetail.details}</div>
            </div>

            <div className="alloc-popup-actions">
              <button type="button" className="btn-popup-cancel" onClick={() => setIsDetailPopupOpen(false)}>Close</button>
              {selectedRoomForDetail.guests.length < (selectedRoomForDetail.capacity !== undefined ? selectedRoomForDetail.capacity : 2) && (
                <button 
                  type="button" 
                  className="btn-popup-confirm" 
                  onClick={() => {
                    setIsDetailPopupOpen(false);
                    setSelectedRoomForAssign(selectedRoomForDetail);
                    setSelectedGuestForAssignId(selectedUnassignedGuest ? selectedUnassignedGuest.id : (unassignedGuests[0]?.id || ''));
                    setIsAssignPopupOpen(true);
                  }}
                >
                  Add Guest
                </button>
              )}
              <button 
                type="button" 
                className="btn-popup-confirm" 
                style={{ backgroundColor: '#dc2626' }}
                onClick={() => handleUnassignGuest(selectedRoomForDetail)}
              >
                Unassign All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Conflict Warning Modal */}
      {isConflictPopupOpen && (
        <div className="alloc-popup-overlay" onClick={() => setIsConflictPopupOpen(false)}>
          <div className="alloc-popup-box" onClick={e => e.stopPropagation()} style={{ width: '350px' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <div>
                <h3 className="alloc-popup-title" style={{ color: '#b91c1c' }}>Capacity Conflict: Room {selectedRoomForConflict.roomNumber}</h3>
                <span style={{ fontSize: '0.7rem', color: '#7f1d1d', fontWeight: 600 }}>Maximum room capacity reached.</span>
              </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>
              Multiple occupants exceed the maximum capacity of {selectedRoomForConflict.capacity !== undefined ? selectedRoomForConflict.capacity : 2} guests for this room type. Select a guest to remove to resolve the conflict:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {selectedRoomForConflict.guests.map((g, idx) => (
                <div 
                  key={idx} 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fef2f2', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #fee2e2' }}
                >
                  <div>
                    <strong style={{ fontSize: '0.825rem', color: '#991b1b' }}>{g.name}</strong>
                    <span style={{ display: 'block', fontSize: '0.65rem', color: '#7f1d1d' }}>{g.category}</span>
                  </div>
                  <button 
                    type="button" 
                    className="btn-popup-confirm" 
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem', backgroundColor: '#ef4444' }}
                    onClick={() => handleResolveConflictMoveOne(selectedRoomForConflict, g.name)}
                  >
                    Move to Panel
                  </button>
                </div>
              ))}
            </div>

            <div className="alloc-popup-actions">
              <button type="button" className="btn-popup-cancel" onClick={() => setIsConflictPopupOpen(false)}>Cancel</button>
              <button 
                type="button" 
                className="btn-popup-confirm" 
                style={{ backgroundColor: '#dc2626' }}
                onClick={() => handleUnassignGuest(selectedRoomForConflict)}
              >
                Unassign All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating toast notification */}
      {toastMessage && <div className="toast-msg">{toastMessage}</div>}
    </div>
  );
}
