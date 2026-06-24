import React, { useState, useMemo } from 'react';
import './AllocationMatrix.css';

// Seed lists
const INITIAL_VEHICLES = [
  {
    id: 'v1',
    name: 'Mercedes V-Class',
    license: 'VH-402',
    type: 'van',
    status: 'On-Route',
    statusColor: '#10b981', // green
    capacity: 7,
    driver: 'James Whitaker',
    driverAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    guests: [
      { id: 'g_init1', name: 'Eleanor Rigby', type: 'VIP' },
      { id: 'g_init2', name: 'Thomas Muller', type: 'Standard' }
    ]
  },
  {
    id: 'v2',
    name: 'Tesla Model X',
    license: 'VH-108',
    type: 'suv',
    status: 'Staged',
    statusColor: '#f59e0b', // orange
    capacity: 5,
    driver: 'Sarah Jenkins',
    driverAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    guests: [
      { id: 'g_init3', name: 'Marcus Vane', type: 'Standard', warning: true },
      { id: 'g_init4', name: 'Lucas Scott', type: 'Standard' },
      { id: 'g_init5', name: 'Emma Watson', type: 'VIP' },
      { id: 'g_init6', name: 'Daniel Radcliffe', type: 'Standard' },
      { id: 'g_init7', name: 'Rupert Grint', type: 'Standard' }
    ],
    overcapacityWarning: true
  },
  {
    id: 'v3',
    name: 'Audi A8 L',
    license: 'VH-205',
    type: 'sedan',
    status: 'Maintenance',
    statusColor: '#94a3b8', // grey
    capacity: 3,
    driver: null,
    driverAvatar: null,
    guests: [],
    placeholder: 'Vehicle currently unavailable for allocation until 14:00 today.'
  }
];

const INITIAL_QUEUE = [
  {
    id: 'g_julianne',
    name: 'Dr. Julianne Moore',
    type: 'VIP GUEST',
    eta: '11:45 AM',
    location: 'Terminal 3, Gate B12',
    bags: 3,
    priority: 'High Priority',
    priorityColor: '#ef4444'
  },
  {
    id: 'g_robert',
    name: 'Robert Pattinson',
    type: 'KEYNOTE SPEAKER',
    eta: '12:15 PM',
    location: 'Grand Hyatt Hotel',
    bags: 1,
    priority: 'Standard',
    priorityColor: '#64748b'
  },
  {
    id: 'g_sarah',
    name: 'Sarah Connor',
    type: 'VIP GUEST',
    eta: '11:30 AM',
    location: 'Flight delayed by 45 mins',
    bags: 'IMMEDIATE ACTION',
    priority: 'Immediate Action',
    priorityColor: '#ef4444',
    isLate: true
  },
  // Waitlist filler
  { id: 'g_wait_1', name: 'Alice Cooper', type: 'Standard', eta: '12:45 PM', location: 'Terminal 2', bags: 1, priority: 'Standard' },
  { id: 'g_wait_2', name: 'Bob Dylan', type: 'VIP GUEST', eta: '01:10 PM', location: 'Grand Hall North', bags: 2, priority: 'High Priority' },
  { id: 'g_wait_3', name: 'Charlie Parker', type: 'Standard', eta: '01:25 PM', location: 'Terminal 1', bags: 2, priority: 'Standard' },
  { id: 'g_wait_4', name: 'David Bowie', type: 'Standard', eta: '01:40 PM', location: 'Main Gate Terminal', bags: 3, priority: 'Standard' },
  { id: 'g_wait_5', name: 'Ella Fitzgerald', type: 'VIP GUEST', eta: '01:55 PM', location: 'Terminal 3', bags: 1, priority: 'High Priority' },
  { id: 'g_wait_6', name: 'Frank Sinatra', type: 'Standard', eta: '02:00 PM', location: 'Airport Hotel', bags: 2, priority: 'Standard' },
  { id: 'g_wait_7', name: 'Grace Slick', type: 'Standard', eta: '02:15 PM', location: 'Terminal 2', bags: 1, priority: 'Standard' },
  { id: 'g_wait_8', name: 'Jimi Hendrix', type: 'VIP GUEST', eta: '02:30 PM', location: 'Grand Hall North', bags: 2, priority: 'High Priority' },
  { id: 'g_wait_9', name: 'Janis Joplin', type: 'Standard', eta: '02:45 PM', location: 'Terminal 1', bags: 1, priority: 'Standard' },
  { id: 'g_wait_10', name: 'Kurt Cobain', type: 'Standard', eta: '03:00 PM', location: 'Airport Hotel', bags: 2, priority: 'Standard' },
  { id: 'g_wait_11', name: 'Nina Simone', type: 'VIP GUEST', eta: '03:15 PM', location: 'Terminal 3', bags: 1, priority: 'High Priority' },
  { id: 'g_wait_12', name: 'Otis Redding', type: 'Standard', eta: '03:30 PM', location: 'Main Gate Terminal', bags: 2, priority: 'Standard' },
  { id: 'g_wait_13', name: 'Prince Nelson', type: 'Standard', eta: '03:45 PM', location: 'Terminal 2', bags: 1, priority: 'Standard' },
  { id: 'g_wait_14', name: 'Ray Charles', type: 'VIP GUEST', eta: '04:00 PM', location: 'Terminal 1', bags: 2, priority: 'High Priority' },
  { id: 'g_wait_15', name: 'Stevie Wonder', type: 'Standard', eta: '04:15 PM', location: 'Grand Hall North', bags: 1, priority: 'Standard' }
];

export default function AllocationMatrix() {
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [guestQueue, setGuestQueue] = useState(INITIAL_QUEUE);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGuestForAssign, setActiveGuestForAssign] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [conflictsCount, setConflictsCount] = useState(2);
  const [toastMessage, setToastMessage] = useState(null);

  // Search filter
  const filteredQueue = useMemo(() => {
    return guestQueue.filter(g =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.priority.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [guestQueue, searchQuery]);

  // Display brief feedback messages
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Assign guest to vehicle
  const handleAssignGuest = (guestId, vehicleId) => {
    const guestIndex = guestQueue.findIndex(g => g.id === guestId);
    if (guestIndex === -1) return;

    const targetVehicle = vehicles.find(v => v.id === vehicleId);
    if (!targetVehicle) return;

    if (targetVehicle.status === 'Maintenance') {
      showToast(`Cannot assign to ${targetVehicle.name} under maintenance.`);
      setActiveGuestForAssign(null);
      return;
    }

    // Check capacity
    const currentGuestsCount = targetVehicle.guests.length;
    if (currentGuestsCount >= targetVehicle.capacity) {
      // Overcapacity attempt
      setVehicles(prev => prev.map(v => {
        if (v.id === vehicleId) {
          // If Tesla Model X, show warnings
          return {
            ...v,
            overcapacityWarning: true,
            guests: [...v.guests, { ...guestQueue[guestIndex], warning: true }]
          };
        }
        return v;
      }));
      setConflictsCount(prev => prev + 1);
      showToast(`Warning: ${targetVehicle.name} is over capacity!`);
    } else {
      // Normal assignment
      setVehicles(prev => prev.map(v => {
        if (v.id === vehicleId) {
          return {
            ...v,
            guests: [...v.guests, { id: guestQueue[guestIndex].id, name: guestQueue[guestIndex].name, type: guestQueue[guestIndex].type === 'VIP GUEST' ? 'VIP' : 'Standard' }]
          };
        }
        return v;
      }));
      showToast(`Assigned ${guestQueue[guestIndex].name} to ${targetVehicle.name}.`);
    }

    // Remove from queue
    setGuestQueue(prev => prev.filter(g => g.id !== guestId));
    setActiveGuestForAssign(null);
  };

  // Remove guest from vehicle
  const handleUnassignGuest = (vehicleId, guestObj) => {
    // Check if the guest was an original seed guest or matches waitlist items
    const restoredGuest = INITIAL_QUEUE.find(g => g.id === guestObj.id) || {
      id: guestObj.id,
      name: guestObj.name,
      type: guestObj.type === 'VIP' ? 'VIP GUEST' : 'Standard',
      eta: 'Immediate',
      location: 'Unassigned',
      bags: 1,
      priority: 'Standard',
      priorityColor: '#64748b'
    };

    // Remove from vehicle
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        const remainingGuests = v.guests.filter(g => g.id !== guestObj.id);
        const isNowUnderCapacity = remainingGuests.length <= v.capacity;
        return {
          ...v,
          guests: remainingGuests,
          overcapacityWarning: v.id === 'v2' && !isNowUnderCapacity ? v.overcapacityWarning : false
        };
      }
      return v;
    }));

    // Put back to queue
    setGuestQueue(prev => [restoredGuest, ...prev]);

    // Recalculate conflicts
    if (vehicleId === 'v2') {
      setConflictsCount(prev => Math.max(0, prev - 1));
    }
    showToast(`Removed ${guestObj.name} from vehicle assignment.`);
  };

  // Optimize Routes Simulator
  const handleOptimizeRoutes = () => {
    setIsOptimizing(true);
    showToast('Initiating AI Route Seating Optimizer...');

    setTimeout(() => {
      // Re-distribute guests to solve capacity mismatch
      setVehicles(prev => {
        // Find overcapacity guests in Tesla (v2)
        const tesla = prev.find(v => v.id === 'v2');
        if (!tesla || tesla.guests.length <= tesla.capacity) {
          setIsOptimizing(false);
          return prev;
        }

        const overLimit = tesla.guests.length - tesla.capacity;
        const guestsToMove = tesla.guests.slice(tesla.capacity);
        const cleanTeslaGuests = tesla.guests.slice(0, tesla.capacity).map(g => ({ ...g, warning: false }));

        return prev.map(v => {
          if (v.id === 'v2') {
            return {
              ...v,
              guests: cleanTeslaGuests,
              overcapacityWarning: false
            };
          }
          if (v.id === 'v1') {
            // Move them to Mercedes
            const mappedGuests = guestsToMove.map(g => ({ ...g, warning: false }));
            return {
              ...v,
              guests: [...v.guests, ...mappedGuests]
            };
          }
          return v;
        });
      });

      setConflictsCount(0);
      setIsOptimizing(false);
      showToast('Optimization Complete! All overcapacity warnings resolved.');
    }, 1800);
  };

  // Export report as CSV
  const handleGenerateReport = () => {
    const csvHeaders = 'Guest Name,Priority,ETA,Terminal/Location,Checked Bags\n';
    const csvRows = guestQueue.map(g => 
      `"${g.name}","${g.priority}","${g.eta}","${g.location}","${g.bags}"`
    ).join('\n');

    const blob = new Blob([csvHeaders + csvRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `unassigned_guests_waitlist_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Waitlist report downloaded.');
  };

  return (
    <div className="alloc-container">
      {/* Toast Alert Feedback */}
      {toastMessage && (
        <div className="alloc-toast">
          <span>🔔</span> {toastMessage}
        </div>
      )}

      {/* Top Header stats overview */}
      <header className="alloc-stats-header">
        <div className="alloc-stats-row">
          <div className="alloc-stat-box">
            <span className="stat-lbl">TOTAL VEHICLES</span>
            <span className="stat-num">42</span>
          </div>
          <div className="alloc-stat-box border-left">
            <span className="stat-lbl">UNASSIGNED GUESTS</span>
            <span className="stat-num highlight">{guestQueue.length}</span>
          </div>

          {/* Conflict Alerts Banner */}
          <div className={`alloc-alert-banner ${conflictsCount > 0 ? 'has-alerts' : 'clean'}`}>
            <span className="alert-icon">⚠️</span>
            <div className="alert-info">
              {conflictsCount > 0 ? (
                <>
                  <span className="alert-title">{conflictsCount} Conflict Alerts</span>
                  <span className="alert-subtitle">Capacity & Timing mismatch</span>
                </>
              ) : (
                <>
                  <span className="alert-title text-success">0 Conflict Alerts</span>
                  <span className="alert-subtitle">Fleet seating fully optimized</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Header CTA Buttons */}
        <div className="alloc-action-ctas">
          <button type="button" className="btn-alloc-filter" onClick={() => alert('Opening guest queue filters...')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filter</span>
          </button>

          <button 
            type="button" 
            className={`btn-alloc-optimize ${isOptimizing ? 'loading' : ''}`}
            onClick={handleOptimizeRoutes}
            disabled={isOptimizing}
          >
            {isOptimizing ? (
              <span className="spinner-loader"></span>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            )}
            <span>{isOptimizing ? 'Optimizing...' : 'Optimize Routes'}</span>
          </button>
        </div>
      </header>

      {/* Main Board Split */}
      <div className="alloc-board-layout">
        {/* Left Side: Vehicles Grid */}
        <div className="alloc-vehicles-column">
          {vehicles.map(v => {
            const isFull = v.guests.length >= v.capacity;
            const isOver = v.guests.length > v.capacity;
            const fillPercentage = Math.min(100, (v.guests.length / v.capacity) * 100);

            return (
              <div 
                key={v.id} 
                className={`vehicle-alloc-card ${v.status === 'Maintenance' ? 'maintenance' : ''} ${isOver ? 'overcapacity' : ''}`}
              >
                {/* Header Profile Row */}
                <div className="vehicle-card-hdr">
                  <div className="vehicle-profile-info">
                    <div className="vehicle-avatar-box">
                      <span className="veh-emoji">{v.type === 'van' ? '🚐' : v.type === 'suv' ? '🚙' : '🚗'}</span>
                    </div>
                    <div>
                      <h4>{v.name}</h4>
                      <span className="license-tag">License: {v.license}</span>
                    </div>
                  </div>

                  <div className="vehicle-status-tag">
                    <span 
                      className={`status-indicator-dot ${v.status.toLowerCase()}`}
                      style={{ backgroundColor: v.statusColor }}
                    />
                    <span className="status-indicator-lbl">{v.status}</span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="capacity-bar-container">
                  <div className="capacity-bar-meta">
                    <span className="cap-lbl">Capacity Indicator</span>
                    <span className={`cap-fraction ${isOver ? 'red' : ''}`}>
                      {v.guests.length}/{v.capacity} Seats Occupied
                    </span>
                  </div>
                  <div className="cap-track">
                    <div 
                      className={`cap-fill ${v.id === 'v2' && isOver ? 'fill-red' : ''}`} 
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Over-capacity Alert message */}
                {isOver && (
                  <div className="overcapacity-card-alert">
                    <span className="alert-excl">⚠️</span>
                    <span>Warning: {v.guests.length - v.capacity} Over-capacity guest attempted</span>
                  </div>
                )}

                {/* Driver Section */}
                {v.driver ? (
                  <div className="driver-assign-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={v.driverAvatar} alt={v.driver} className="driver-avatar-mini" />
                      <div>
                        <span className="driver-sub-lbl">Driver</span>
                        <span className="driver-name-lbl">{v.driver}</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="btn-driver-call"
                      onClick={() => alert(`Simulating direct dial dispatch to ${v.driver}...`)}
                    >
                      📞
                    </button>
                  </div>
                ) : null}

                {/* Assigned Guests list */}
                <div className="assigned-guests-wrap">
                  <span className="assigned-guests-lbl">Assigned Guests</span>
                  
                  {v.status === 'Maintenance' ? (
                    <div className="maintenance-placeholder-dotted">
                      {v.placeholder}
                    </div>
                  ) : (
                    <>
                      <div className="assigned-guests-list">
                        {v.guests.map((g, idx) => (
                          <div 
                            key={`${v.id}-g-${idx}`} 
                            className={`guest-pill-badge ${g.warning ? 'warning-pill' : ''} ${g.type === 'VIP' ? 'vip' : ''}`}
                          >
                            <span>{g.name}</span>
                            {g.type === 'VIP' && <span className="pill-vip-lbl">VIP</span>}
                            {g.warning && <span className="pill-warning-lbl">!</span>}
                            <button 
                              type="button" 
                              className="btn-remove-guest-pill"
                              onClick={() => handleUnassignGuest(v.id, g)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Drop Target click to assign placeholder */}
                      <div 
                        className="guest-drop-target-area"
                        onClick={() => {
                          if (guestQueue.length === 0) {
                            showToast('Guest Queue is empty!');
                            return;
                          }
                          // Open dropdown next to first queue item or alert
                          showToast('Select a guest card in the queue to assign to this vehicle.');
                        }}
                      >
                        <span className="drop-plus">+</span>
                        <span className="drop-txt">Drop guest cards here to assign</span>
                      </div>
                    </>
                  )}
                </div>

                {isOver && (
                  <div className="card-bottom-warning-lbl">
                    Maximum Capacity Reached
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Side: Guest Queue Panel */}
        <aside className="alloc-queue-panel">
          <div className="queue-hdr">
            <h3>Guest Queue</h3>
            
            {/* Search Queue filter */}
            <div className="queue-search-wrap">
              <span className="queue-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Find guests..."
                className="queue-search-field"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="queue-search-clear" onClick={() => setSearchQuery('')}>
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Guest queue list */}
          <div className="queue-cards-list">
            {filteredQueue.map(guest => {
              const isVIP = guest.type.includes('VIP');
              const isLate = guest.isLate;

              return (
                <div 
                  key={guest.id} 
                  className={`guest-queue-card-item ${activeGuestForAssign?.id === guest.id ? 'active' : ''}`}
                  onClick={() => {
                    if (activeGuestForAssign?.id === guest.id) {
                      setActiveGuestForAssign(null);
                    } else {
                      setActiveGuestForAssign(guest);
                    }
                  }}
                >
                  <div className="drag-handle-column">
                    {/* Drag dots icon */}
                    <div className="drag-dots">
                      <span>::</span>
                      <span>::</span>
                    </div>
                  </div>

                  <div className="guest-card-body-details">
                    <div className="guest-card-meta-row">
                      <h4>{guest.name}</h4>
                      <span className="guest-card-eta">{guest.eta}</span>
                    </div>

                    <div className="guest-tags-row">
                      <span className={`guest-type-tag ${isVIP ? 'vip' : 'standard'}`}>
                        {guest.type}
                      </span>
                    </div>

                    <div className="guest-loc-details">
                      <span className="loc-marker">📍</span>
                      <span>{guest.location}</span>
                    </div>

                    <div className="guest-luggage-row">
                      <span className="luggage-icon">💼</span>
                      <span>{guest.bags} {typeof guest.bags === 'number' ? 'Checked Bags' : ''}</span>
                    </div>

                    <div className="guest-status-action-row">
                      <span 
                        className="guest-priority-badge"
                        style={{ color: guest.priorityColor }}
                      >
                        {guest.priority}
                      </span>
                      
                      {/* Click to allocate drop menu list */}
                      <button 
                        type="button" 
                        className="btn-card-allocate"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeGuestForAssign?.id === guest.id) {
                            setActiveGuestForAssign(null);
                          } else {
                            setActiveGuestForAssign(guest);
                          }
                        }}
                      >
                        Assign To ➔
                      </button>
                    </div>

                    {/* Quick Assignment Dropdown Menu Overlay */}
                    {activeGuestForAssign?.id === guest.id && (
                      <div className="assign-quick-picker-box" onClick={e => e.stopPropagation()}>
                        <span className="picker-header-title">Assign to Vehicle:</span>
                        {vehicles.map(v => (
                          <button
                            key={v.id}
                            type="button"
                            className={`picker-vehicle-item ${v.status === 'Maintenance' ? 'disabled' : ''}`}
                            onClick={() => handleAssignGuest(guest.id, v.id)}
                            disabled={v.status === 'Maintenance'}
                          >
                            <span className="pv-name">{v.name}</span>
                            <span className="pv-count">{v.guests.length}/{v.capacity}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredQueue.length === 0 && (
              <div className="queue-empty-feed">
                No matching unassigned guests.
              </div>
            )}
          </div>

          {/* Generate waitlist report */}
          <div className="queue-footer">
            <button 
              type="button" 
              className="btn-queue-report"
              onClick={handleGenerateReport}
            >
              Generate Waitlist Report
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
