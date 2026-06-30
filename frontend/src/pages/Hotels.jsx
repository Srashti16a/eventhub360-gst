import React, { useState, useMemo, useEffect } from 'react';
import './Hotels.css';

// Initial Seed data reflecting standard allocations matching the mockup and extra records for interactive paging
const INITIAL_ALLOCATIONS = [
  {
    id: 1,
    guestName: 'Jordan Smith',
    guestId: '#RE-9012',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    hotel: 'Grand Ballroom Hotel',
    roomNumber: '412A',
    roomType: 'Standard',
    checkIn: '2023-10-14',
    checkOut: '2023-10-18',
    status: 'Checked-In'
  },
  {
    id: 2,
    guestName: 'Amara Okafor',
    guestId: '#RE-9013',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    hotel: 'Azure Heights Resort',
    roomNumber: '805',
    roomType: 'Suite',
    checkIn: '2023-10-15',
    checkOut: '2023-10-20',
    status: 'Confirmed'
  },
  {
    id: 3,
    guestName: 'Lars Knudsen',
    guestId: '#RE-9014',
    avatar: null, // will show LK initials
    hotel: 'Grand Ballroom Hotel',
    roomNumber: '218',
    roomType: 'Standard',
    checkIn: '2023-10-16',
    checkOut: '2023-10-17',
    status: 'Pending'
  },
  {
    id: 4,
    guestName: 'Eleanor Vance',
    guestId: '#RE-9015',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    hotel: 'The Ritz-Central',
    roomNumber: '401',
    roomType: 'Suite',
    checkIn: '2023-10-12',
    checkOut: '2023-10-18',
    status: 'Confirmed'
  },
  {
    id: 5,
    guestName: 'Marcus Thorne',
    guestId: '#RE-9016',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    hotel: 'The Ritz-Central',
    roomNumber: '902',
    roomType: 'Penthouse',
    checkIn: '2023-10-13',
    checkOut: '2023-10-19',
    status: 'Pending'
  },
  {
    id: 6,
    guestName: 'Sienna Miller',
    guestId: '#RE-9017',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    hotel: 'Harbor View',
    roomNumber: '305',
    roomType: 'Suite',
    checkIn: '2023-10-14',
    checkOut: '2023-10-21',
    status: 'Checked-In'
  },
  {
    id: 7,
    guestName: 'Johnathan Doe',
    guestId: '#RE-9018',
    avatar: null,
    hotel: 'Summit Lodge',
    roomNumber: '204',
    roomType: 'Executive',
    checkIn: '2023-10-15',
    checkOut: '2023-10-18',
    status: 'Pending'
  },
  {
    id: 8,
    guestName: 'Clara Oswald',
    guestId: '#RE-9019',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    hotel: 'Harbor View',
    roomNumber: '112',
    roomType: 'Standard',
    checkIn: '2023-10-16',
    checkOut: '2023-10-20',
    status: 'Confirmed'
  },
  {
    id: 9,
    guestName: 'Danny Pink',
    guestId: '#RE-9020',
    avatar: null,
    hotel: 'Summit Lodge',
    roomNumber: '109',
    roomType: 'Standard',
    checkIn: '2023-10-14',
    checkOut: '2023-10-17',
    status: 'Checked-In'
  },
  {
    id: 10,
    guestName: 'Sarah Jane Smith',
    guestId: '#RE-9021',
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&auto=format&fit=crop&q=80',
    hotel: 'Azure Heights Resort',
    roomNumber: '614',
    roomType: 'Executive',
    checkIn: '2023-10-12',
    checkOut: '2023-10-16',
    status: 'Checked-In'
  },
  {
    id: 11,
    guestName: 'Rose Tyler',
    guestId: '#RE-9022',
    avatar: null,
    hotel: 'Grand Ballroom Hotel',
    roomNumber: '315',
    roomType: 'Suite',
    checkIn: '2023-10-15',
    checkOut: '2023-10-19',
    status: 'Confirmed'
  },
  {
    id: 12,
    guestName: 'Jack Harkness',
    guestId: '#RE-9023',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    hotel: 'The Ritz-Central',
    roomNumber: '702',
    roomType: 'Penthouse',
    checkIn: '2023-10-13',
    checkOut: '2023-10-20',
    status: 'Confirmed'
  }
];

const INITIAL_HOTELS = [
  { name: 'Grand Ballroom Hotel', occupancy: 85, capacity: 100 },
  { name: 'Azure Heights Resort', occupancy: 70, capacity: 100 },
  { name: 'The Ritz-Central', occupancy: 95, capacity: 100 },
  { name: 'Harbor View', occupancy: 50, capacity: 100 },
  { name: 'Summit Lodge', occupancy: 80, capacity: 100 }
];

export default function Hotels({ isBookRoomOpen, setIsBookRoomOpen }) {
  const [allocations, setAllocations] = useState(INITIAL_ALLOCATIONS);
  const [hotelsData, setHotelsData] = useState(INITIAL_HOTELS);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHotel, setSelectedHotel] = useState('All Hotels');
  const [selectedRoomType, setSelectedRoomType] = useState('Room Type');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Active Dropdown Actions Menu Row ID
  const [activeActionsRowId, setActiveActionsRowId] = useState(null);

  // Booking Modal State
  const [bookingFormData, setBookingFormData] = useState({
    guestName: '',
    hotel: 'Grand Ballroom Hotel',
    roomNumber: '',
    roomType: 'Standard',
    checkIn: '',
    checkOut: '',
    status: 'Confirmed'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // VIP Quick view (Assign toggle/status indicator dots helper)
  const [showAllVips, setShowAllVips] = useState(false);

  // Utility to format dates for visual presentation: 'Oct 14, 2023'
  const formatDateString = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  // Close actions dropdown when clicking elsewhere
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveActionsRowId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Recalculated metrics dynamically based on bookings list
  const metrics = useMemo(() => {
    const totalRooms = 500;
    const assignedCount = 380 + allocations.length * 2.5; // Scaled base + current
    const occupancyPercent = ((assignedCount / totalRooms) * 100).toFixed(1);
    const unassignedCount = Math.max(0, 112 - allocations.length);
    const vipBooked = allocations.filter(a => a.roomType === 'Suite' || a.roomType === 'Penthouse').length + 6;

    return {
      occupancy: `${occupancyPercent}%`,
      assigned: Math.round(assignedCount),
      totalRooms,
      unassigned: unassignedCount,
      vipBooked: Math.min(15, vipBooked),
      vipTotal: 15
    };
  }, [allocations]);

  // Recalculated Hotels utilization chart values dynamically
  const updatedHotelsChart = useMemo(() => {
    return hotelsData.map(h => {
      const matchCount = allocations.filter(a => a.hotel === h.name).length;
      // occupancy adjusts based on counts
      const dynamicOcc = Math.min(100, Math.max(10, h.occupancy + (matchCount - 2) * 5));
      return { ...h, occupancy: dynamicOcc };
    });
  }, [allocations, hotelsData]);

  // Filter logic
  const filteredAllocations = useMemo(() => {
    return allocations.filter(item => {
      // Search match (Guest Name, Hotel Name, Room Number)
      const matchesSearch = searchQuery.trim() === '' || 
        item.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.hotel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.guestId.toLowerCase().includes(searchQuery.toLowerCase());

      // Hotel Dropdown match
      const matchesHotel = selectedHotel === 'All Hotels' || item.hotel === selectedHotel;

      // Room Type Dropdown match
      const matchesRoomType = selectedRoomType === 'Room Type' || item.roomType === selectedRoomType;

      // Status Dropdown match
      const matchesStatus = selectedStatus === 'All Status' || item.status === selectedStatus;

      return matchesSearch && matchesHotel && matchesRoomType && matchesStatus;
    });
  }, [allocations, searchQuery, selectedHotel, selectedRoomType, selectedStatus]);

  // Pagination slice
  const paginatedAllocations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAllocations.slice(start, start + itemsPerPage);
  }, [filteredAllocations, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAllocations.length / itemsPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedHotel, selectedRoomType, selectedStatus]);

  // Export report as CSV file
  const handleExportCSV = () => {
    const csvHeaders = 'Guest,ID,Hotel,Room Number,Room Type,Check In,Check Out,Status\n';
    const csvRows = filteredAllocations.map(a => 
      `"${a.guestName}","${a.guestId}","${a.hotel}","${a.roomNumber}","${a.roomType}","${a.checkIn}","${a.checkOut}","${a.status}"`
    ).join('\n');

    const blob = new Blob([csvHeaders + csvRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hotel_accommodation_allocations_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!bookingFormData.guestName.trim()) errors.guestName = 'Guest name is required';
    if (!bookingFormData.roomNumber.trim()) errors.roomNumber = 'Room number is required';
    if (!bookingFormData.checkIn) errors.checkIn = 'Check-in date is required';
    if (!bookingFormData.checkOut) errors.checkOut = 'Check-out date is required';
    if (bookingFormData.checkIn && bookingFormData.checkOut && new Date(bookingFormData.checkIn) > new Date(bookingFormData.checkOut)) {
      errors.checkOut = 'Check-out must be after check-in';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Book / Edit submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEditing) {
      // Edit mode
      setAllocations(prev => prev.map(a => 
        a.id === editingId ? { ...a, ...bookingFormData } : a
      ));
      setIsBookRoomOpen(false);
      setIsEditing(false);
      setEditingId(null);
    } else {
      // Create mode
      const newId = allocations.length > 0 ? Math.max(...allocations.map(a => a.id)) + 1 : 1;
      const randomIdSuffix = Math.floor(1000 + Math.random() * 9000);
      const newAllocation = {
        id: newId,
        guestName: bookingFormData.guestName,
        guestId: `#RE-${randomIdSuffix}`,
        avatar: null,
        hotel: bookingFormData.hotel,
        roomNumber: bookingFormData.roomNumber,
        roomType: bookingFormData.roomType,
        checkIn: bookingFormData.checkIn,
        checkOut: bookingFormData.checkOut,
        status: bookingFormData.status
      };
      setAllocations(prev => [newAllocation, ...prev]);
      setIsBookRoomOpen(false);
    }

    // Reset Form
    setBookingFormData({
      guestName: '',
      hotel: 'Grand Ballroom Hotel',
      roomNumber: '',
      roomType: 'Standard',
      checkIn: '',
      checkOut: '',
      status: 'Confirmed'
    });
  };

  // Trigger editing from list
  const startEditBooking = (item) => {
    setBookingFormData({
      guestName: item.guestName,
      hotel: item.hotel,
      roomNumber: item.roomNumber,
      roomType: item.roomType,
      checkIn: item.checkIn,
      checkOut: item.checkOut,
      status: item.status
    });
    setIsEditing(true);
    setEditingId(item.id);
    setIsBookRoomOpen(true);
  };

  // Delete an allocation record
  const deleteAllocation = (id) => {
    if (window.confirm('Are you sure you want to delete this room allocation?')) {
      setAllocations(prev => prev.filter(a => a.id !== id));
    }
  };

  // Toggle Check-In status quickly
  const toggleCheckInStatus = (item) => {
    const nextStatus = item.status === 'Checked-In' ? 'Confirmed' : 'Checked-In';
    setAllocations(prev => prev.map(a => 
      a.id === item.id ? { ...a, status: nextStatus } : a
    ));
  };

  // VIP Quick selection profiles (Top list matching visual design)
  const vipAllocationsList = useMemo(() => {
    const list = allocations.filter(a => a.roomType === 'Suite' || a.roomType === 'Penthouse');
    return showAllVips ? list : list.slice(0, 3);
  }, [allocations, showAllVips]);

  return (
    <div className="hotels-container">
      {/* Top Accommodation Dashboard Header */}
      <header className="hotels-header">
        <div className="hotels-title-area">
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            Accommodation <span style={{ margin: '0 0.35rem', color: '#94a3b8' }}>/</span> <span style={{ color: '#ff4d4f' }}>Accommodation Dashboard</span>
          </div>
          <h1>Accommodation Dashboard</h1>
          <p>Manage room inventories and guest allocations across all event partners.</p>
        </div>

        <div className="hotels-header-actions">
          {/* Calendar Picker Mock */}
          <button type="button" className="date-picker-trigger" onClick={() => alert('Opening calendar date range selector...')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Oct 12 - Oct 18, 2023</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Export CSV Button */}
          <button type="button" className="btn-export" onClick={handleExportCSV}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export Report</span>
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <section className="metrics-grid">
        {/* Total Occupancy Card */}
        <div className="metric-card">
          <div className="metric-card-header">
            <div className="metric-icon-wrap occupancy">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="8" rx="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="6" y1="18" x2="6.01" y2="18" />
              </svg>
            </div>
            <span className="metric-badge green">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="18 15 12 9 6 15" />
              </svg>
              +3.2%
            </span>
          </div>
          <div className="metric-card-body">
            <h3>Total Occupancy</h3>
            <p className="metric-val">{metrics.occupancy}</p>
          </div>
          <div className="metric-card-footer">
            vs. last week
          </div>
        </div>

        {/* Rooms Assigned Card */}
        <div className="metric-card">
          <div className="metric-card-header">
            <div className="metric-icon-wrap assigned">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                <path d="M2 21v-2a4 4 0 0 1 4-4h5a4 4 0 0 1 4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
              </svg>
            </div>
            <span className="metric-badge gray">
              82% Cap
            </span>
          </div>
          <div className="metric-card-body">
            <h3>Rooms Assigned</h3>
            <p className="metric-val">
              {metrics.assigned} <span style={{ fontSize: '1.1rem', color: '#94a3b8', fontWeight: 600 }}>/ {metrics.totalRooms}</span>
            </p>
            <div className="metric-progress-container">
              <div className="metric-progress-bar" style={{ width: '82%' }}></div>
            </div>
          </div>
        </div>

        {/* Unassigned Guests Card */}
        <div className="metric-card">
          <div className="metric-card-header">
            <div className="metric-icon-wrap unassigned">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <span className="metric-badge purple" style={{ color: '#7c3aed', backgroundColor: '#f3e8ff' }}>
              Priority
            </span>
          </div>
          <div className="metric-card-body">
            <h3>Unassigned Guests</h3>
            <p className="metric-val">{metrics.unassigned}</p>
          </div>
          <div className="metric-card-footer">
            Requires allocation
          </div>
        </div>

        {/* VIP Suites Booked Card */}
        <div className="metric-card">
          <div className="metric-card-header">
            <div className="metric-icon-wrap vip-suites">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 12 12 2l6 10-6 10z" />
              </svg>
            </div>
          </div>
          <div className="metric-card-body">
            <h3>VIP Suites Booked</h3>
            <p className="metric-val">
              {metrics.vipBooked} <span style={{ fontSize: '1.1rem', color: '#94a3b8', fontWeight: 600 }}>/ {metrics.vipTotal}</span>
            </p>
          </div>
          <div className="metric-card-footer">
            {metrics.vipTotal - metrics.vipBooked} Ultra-luxury remaining
          </div>
        </div>
      </section>

      {/* Graphs Section & VIP Allocations Split panel */}
      <section className="mid-section">
        {/* Left Column: Hotel Utilization Trends */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h2>Hotel Utilization Trends</h2>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-dot occupancy"></span>
                <span>Occupancy</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot capacity"></span>
                <span>Capacity</span>
              </div>
            </div>
          </div>

          <div className="bar-chart-container">
            {updatedHotelsChart.map((hotel, idx) => (
              <div key={idx} className="bar-col">
                <div className="bar-tooltip">
                  Occupancy: {hotel.occupancy}% | Max: {hotel.capacity}%
                </div>
                <div className="bar-track">
                  <div className="bar-capacity-fill"></div>
                  <div className="bar-occupancy-fill" style={{ height: `${hotel.occupancy}%` }}></div>
                </div>
                <div className="bar-label" title={hotel.name}>
                  {hotel.name.replace(' Hotel', '').replace(' Resort', '')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: VIP Allocations */}
        <div className="vip-card">
          <div className="vip-card-header">
            <h2>VIP Allocations</h2>
            <span 
              className="vip-view-all" 
              onClick={() => setShowAllVips(!showAllVips)}
            >
              {showAllVips ? 'Show Less' : 'View All'}
            </span>
          </div>

          <div className="vip-list">
            {vipAllocationsList.map((vip) => (
              <div key={vip.id} className="vip-item-row">
                <div className="vip-user-info">
                  {vip.avatar ? (
                    <img src={vip.avatar} alt={vip.guestName} className="vip-avatar" />
                  ) : (
                    <div className="vip-avatar-placeholder">
                      {vip.guestName.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  <div>
                    <div className="vip-name">{vip.guestName}</div>
                    <div className="vip-room">
                      {vip.roomType} Suite • {vip.roomNumber}
                    </div>
                  </div>
                </div>
                <span className={`vip-badge ${vip.status === 'Checked-In' || vip.status === 'Confirmed' ? 'assigned' : 'pending'}`}>
                  {vip.status === 'Checked-In' || vip.status === 'Confirmed' ? 'ASSIGNED' : 'PENDING'}
                </span>
              </div>
            ))}
            {vipAllocationsList.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
                No VIP allocations found.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom Section: Room Allocation Table */}
      <section className="allocation-card">
        <div className="allocation-card-header">
          <h2>Room Allocation Management</h2>

          {/* Filtering controls bar */}
          <div className="alloc-filter-row">
            {/* Search inputs */}
            <div className="alloc-search-wrap">
              <span className="alloc-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search guests or hotels..."
                className="alloc-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Hotel Selector */}
            <select
              className="alloc-select"
              value={selectedHotel}
              onChange={(e) => setSelectedHotel(e.target.value)}
            >
              <option value="All Hotels">All Hotels</option>
              <option value="Grand Ballroom Hotel">Grand Ballroom Hotel</option>
              <option value="Azure Heights Resort">Azure Heights Resort</option>
              <option value="The Ritz-Central">The Ritz-Central</option>
              <option value="Harbor View">Harbor View</option>
              <option value="Summit Lodge">Summit Lodge</option>
            </select>

            {/* Room Type Selector */}
            <select
              className="alloc-select"
              value={selectedRoomType}
              onChange={(e) => setSelectedRoomType(e.target.value)}
            >
              <option value="Room Type">Room Type</option>
              <option value="Standard">Standard</option>
              <option value="Suite">Suite</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Executive">Executive</option>
            </select>

            {/* Status Selector */}
            <select
              className="alloc-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All Status">All Status</option>
              <option value="Checked-In">Checked-In</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Room Allocations Data Table */}
        <div className="alloc-table-wrap">
          <table className="alloc-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Hotel</th>
                <th>Room Number</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAllocations.map((item) => (
                <tr key={item.id}>
                  {/* Guest Profile Cell */}
                  <td>
                    <div className="guest-profile-cell">
                      {item.avatar ? (
                        <img src={item.avatar} alt={item.guestName} className="vip-avatar" />
                      ) : (
                        <div className="vip-avatar-placeholder" style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>
                          {item.guestName.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <div className="guest-profile-info">
                        <span className="guest-profile-name">{item.guestName}</span>
                        <span className="guest-profile-id">ID: {item.guestId}</span>
                      </div>
                    </div>
                  </td>

                  {/* Hotel Cell */}
                  <td>{item.hotel}</td>

                  {/* Room Number */}
                  <td style={{ fontWeight: 600 }}>{item.roomNumber}</td>

                  {/* Check-In */}
                  <td>{formatDateString(item.checkIn)}</td>

                  {/* Check-Out */}
                  <td>{formatDateString(item.checkOut)}</td>

                  {/* Status badge */}
                  <td>
                    <span 
                      className={`status-badge ${item.status.toLowerCase()}`}
                      style={{ cursor: 'pointer' }}
                      title="Click to toggle Check-In"
                      onClick={() => toggleCheckInStatus(item)}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* Actions Dropdown triggers */}
                  <td style={{ textAlign: 'center', position: 'relative' }}>
                    <button
                      type="button"
                      className="btn-action-trigger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveActionsRowId(activeActionsRowId === item.id ? null : item.id);
                      }}
                    >
                      &#8942;
                    </button>

                    {activeActionsRowId === item.id && (
                      <div className="actions-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                        <button 
                          type="button" 
                          className="actions-dropdown-item"
                          onClick={() => {
                            toggleCheckInStatus(item);
                            setActiveActionsRowId(null);
                          }}
                        >
                          {item.status === 'Checked-In' ? '⚠️ Confirm Booking' : '✅ Check-In'}
                        </button>
                        <button 
                          type="button" 
                          className="actions-dropdown-item"
                          onClick={() => {
                            startEditBooking(item);
                            setActiveActionsRowId(null);
                          }}
                        >
                          ✏️ Edit Allocation
                        </button>
                        <button 
                          type="button" 
                          className="actions-dropdown-item danger"
                          onClick={() => {
                            deleteAllocation(item.id);
                            setActiveActionsRowId(null);
                          }}
                        >
                          ❌ Delete Allocation
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {paginatedAllocations.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontWeight: 600 }}>
                    No room allocations matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table pagination Row matching mockup exactly */}
        <div className="alloc-pagination-row">
          <div className="alloc-pagination-info">
            Showing {filteredAllocations.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredAllocations.length)} of {filteredAllocations.length} allocations
          </div>
          <div className="alloc-pagination-controls">
            <button
              type="button"
              className="alloc-page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                type="button"
                className={`alloc-page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              type="button"
              className="alloc-page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              &gt;
            </button>
          </div>
        </div>
      </section>

      {/* Book Room Modal Dialog */}
      {isBookRoomOpen && (
        <div className="hotels-modal-overlay" onClick={() => setIsBookRoomOpen(false)}>
          <form className="hotels-modal-container" onClick={(e) => e.stopPropagation()} onSubmit={handleFormSubmit}>
            <div className="hotels-modal-header">
              <h2>{isEditing ? 'Edit Room Allocation' : 'Book Room Allocation'}</h2>
              <button 
                type="button" 
                className="btn-hotels-modal-close"
                onClick={() => {
                  setIsBookRoomOpen(false);
                  setIsEditing(false);
                  setEditingId(null);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="hotels-modal-body">
              <div className="hotels-form-grid">
                {/* Guest Name input */}
                <div className="hotels-form-group hotels-form-full">
                  <label htmlFor="guestName">Guest Name</label>
                  <input
                    type="text"
                    id="guestName"
                    className="hotels-form-input"
                    placeholder="Enter guest's full name"
                    value={bookingFormData.guestName}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, guestName: e.target.value })}
                  />
                  {formErrors.guestName && <span className="hotels-form-error">{formErrors.guestName}</span>}
                </div>

                {/* Hotel choice selector */}
                <div className="hotels-form-group">
                  <label htmlFor="hotel">Hotel Partner</label>
                  <select
                    id="hotel"
                    className="hotels-form-input"
                    value={bookingFormData.hotel}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, hotel: e.target.value })}
                  >
                    <option value="Grand Ballroom Hotel">Grand Ballroom Hotel</option>
                    <option value="Azure Heights Resort">Azure Heights Resort</option>
                    <option value="The Ritz-Central">The Ritz-Central</option>
                    <option value="Harbor View">Harbor View</option>
                    <option value="Summit Lodge">Summit Lodge</option>
                  </select>
                </div>

                {/* Room Number field */}
                <div className="hotels-form-group">
                  <label htmlFor="roomNumber">Room Number</label>
                  <input
                    type="text"
                    id="roomNumber"
                    className="hotels-form-input"
                    placeholder="e.g. 412A"
                    value={bookingFormData.roomNumber}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, roomNumber: e.target.value })}
                  />
                  {formErrors.roomNumber && <span className="hotels-form-error">{formErrors.roomNumber}</span>}
                </div>

                {/* Room Type */}
                <div className="hotels-form-group">
                  <label htmlFor="roomType">Room Type</label>
                  <select
                    id="roomType"
                    className="hotels-form-input"
                    value={bookingFormData.roomType}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, roomType: e.target.value })}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Suite">Suite</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>

                {/* Booking Status */}
                <div className="hotels-form-group">
                  <label htmlFor="status">Allocation Status</label>
                  <select
                    id="status"
                    className="hotels-form-input"
                    value={bookingFormData.status}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, status: e.target.value })}
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Checked-In">Checked-In</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                {/* Check In date */}
                <div className="hotels-form-group">
                  <label htmlFor="checkIn">Check In Date</label>
                  <input
                    type="date"
                    id="checkIn"
                    className="hotels-form-input"
                    value={bookingFormData.checkIn}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, checkIn: e.target.value })}
                  />
                  {formErrors.checkIn && <span className="hotels-form-error">{formErrors.checkIn}</span>}
                </div>

                {/* Check Out date */}
                <div className="hotels-form-group">
                  <label htmlFor="checkOut">Check Out Date</label>
                  <input
                    type="date"
                    id="checkOut"
                    className="hotels-form-input"
                    value={bookingFormData.checkOut}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, checkOut: e.target.value })}
                  />
                  {formErrors.checkOut && <span className="hotels-form-error">{formErrors.checkOut}</span>}
                </div>
              </div>
            </div>

            <div className="hotels-modal-footer">
              <button 
                type="button" 
                className="btn-hotels-secondary"
                onClick={() => {
                  setIsBookRoomOpen(false);
                  setIsEditing(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn-hotels-primary">
                {isEditing ? 'Save Changes' : 'Confirm Allocation'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
