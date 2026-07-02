import React, { useState, useMemo, useEffect } from 'react';
import './AllocationMatrix.css';
import {
  getAllocVehicles,
  getGuestQueue,
  assignGuestToVehicle,
  unassignGuestFromVehicle,
  getDashboardOverview
} from '../../services/transportationService';

export default function AllocationMatrix({ eventId, onAssignmentUpdate }) {
  const [vehicles, setVehicles] = useState([]);
  const [guestQueue, setGuestQueue] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGuestForAssign, setActiveGuestForAssign] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalVehicles: 0 });
  const [draggedOverVehicleId, setDraggedOverVehicleId] = useState(null);
  
  // Matrix Filters States
  const [showAllocFilterDropdown, setShowAllocFilterDropdown] = useState(false);
  const [allocStatusFilter, setAllocStatusFilter] = useState('All');
  const [allocCapacityFilter, setAllocCapacityFilter] = useState('All');

  // Fetch all necessary data from the backend
  const fetchData = () => {
    if (!eventId) return;
    setLoading(true);
    Promise.all([
      getAllocVehicles(eventId),
      getGuestQueue(eventId),
      getDashboardOverview(eventId)
    ])
      .then(([vehiclesRes, queueRes, overviewRes]) => {
        if (vehiclesRes.success && vehiclesRes.data) {
          const mappedVehicles = vehiclesRes.data.map(v => {
            const guestsList = (v.transfers || []).map(t => ({
              id: t.guest.id,
              name: t.guest.name,
              type: t.guest.isVip ? 'VIP' : 'Standard'
            }));

            let statusColor = '#f59e0b'; // orange
            if (v.status === 'Maintenance') {
              statusColor = '#94a3b8'; // grey
            } else if (v.status === 'On Route' || v.status === 'Active') {
              statusColor = '#10b981'; // green
            }

            return {
              id: v.id,
              name: v.name,
              license: v.licenseNumber,
              type: v.type?.toLowerCase() || 'van',
              status: v.status === 'Active' ? 'On Route' : v.status,
              statusColor,
              capacity: v.capacity,
              driver: v.driver ? v.driver.fullName : null,
              driverAvatar: v.driver ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80' : null,
              guests: guestsList,
              placeholder: v.status === 'Maintenance' ? 'Vehicle currently unavailable for allocation.' : null
            };
          });
          setVehicles(mappedVehicles);
        }

        if (queueRes.success && queueRes.data) {
          const mappedQueue = queueRes.data.map(g => ({
            id: g.id,
            name: g.name,
            type: g.isVip ? 'VIP GUEST' : g.isSpeaker ? 'KEYNOTE SPEAKER' : 'Standard',
            eta: g.isVip ? '11:45 AM' : '12:15 PM',
            location: g.assignedHotel ? g.assignedHotel.name : 'Terminal 3, Gate B12',
            bags: 2,
            priority: g.isVip ? 'High Priority' : 'Standard',
            priorityColor: g.isVip ? '#ef4444' : '#64748b'
          }));
          setGuestQueue(mappedQueue);
        }

        if (overviewRes.success && overviewRes.data) {
          setStats(overviewRes.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching allocation matrix data:", err);
        setLoading(false);
      });
  };

  // Re-fetch data whenever eventId updates
  useEffect(() => {
    fetchData();
  }, [eventId]);

  // Search filters
  const filteredVehicles = useMemo(() => {
    let result = vehicles;

    // Status filter
    if (allocStatusFilter !== 'All') {
      result = result.filter(v => v.status === allocStatusFilter);
    }

    // Capacity filter
    if (allocCapacityFilter !== 'All') {
      result = result.filter(v => {
        const hasSeats = v.guests.length < v.capacity;
        return allocCapacityFilter === 'Has Seats' ? hasSeats : !hasSeats;
      });
    }

    if (!searchQuery) return result;
    const query = searchQuery.trim().toLowerCase();
    return result.filter(v =>
      (v.name || '').toLowerCase().includes(query) ||
      (v.license || '').toLowerCase().includes(query) ||
      (v.driver || '').toLowerCase().includes(query) ||
      (v.guests || []).some(g => (g.name || '').toLowerCase().includes(query))
    );
  }, [vehicles, searchQuery, allocStatusFilter, allocCapacityFilter]);

  const filteredQueue = useMemo(() => {
    if (!searchQuery) return guestQueue;
    const query = searchQuery.trim().toLowerCase();
    return guestQueue.filter(g =>
      (g.name || '').toLowerCase().includes(query) ||
      (g.type || '').toLowerCase().includes(query) ||
      (g.location || '').toLowerCase().includes(query) ||
      (g.priority || '').toLowerCase().includes(query)
    );
  }, [guestQueue, searchQuery]);

  // Compute conflicts dynamically: vehicles where occupied seats exceed capacity
  const conflictsCount = useMemo(() => {
    return vehicles.filter(v => v.guests.length > v.capacity).length;
  }, [vehicles]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Drag and drop mechanics
  const handleDragStart = (e, guestId) => {
    e.dataTransfer.setData('text/plain', guestId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, vehicleId) => {
    e.preventDefault();
    if (draggedOverVehicleId !== vehicleId) {
      setDraggedOverVehicleId(vehicleId);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDraggedOverVehicleId(null);
  };

  const handleDrop = (e, vehicleId) => {
    e.preventDefault();
    setDraggedOverVehicleId(null);
    const guestId = e.dataTransfer.getData('text/plain');
    if (guestId) {
      handleAssignGuest(guestId, vehicleId);
    }
  };

  // Assign guest to vehicle in database
  const handleAssignGuest = (guestId, vehicleId) => {
    const guest = guestQueue.find(g => g.id === guestId) || vehicles.flatMap(v => v.guests).find(g => g.id === guestId);
    if (!guest) return;

    const targetVehicle = vehicles.find(v => v.id === vehicleId);
    if (!targetVehicle) return;

    if (targetVehicle.status === 'Maintenance') {
      showToast(`Cannot assign to ${targetVehicle.name} under maintenance.`);
      setActiveGuestForAssign(null);
      return;
    }

    // Check if duplicate assignment
    const duplicate = targetVehicle.guests.some(g => g.id === guestId);
    if (duplicate) {
      showToast(`Guest ${guest.name} is already assigned to ${targetVehicle.name}.`);
      setActiveGuestForAssign(null);
      return;
    }

    assignGuestToVehicle({ guestId, vehicleId, eventId })
      .then(res => {
        if (res.success) {
          showToast(`Assigned ${guest.name} to ${targetVehicle.name}.`);
          fetchData();
          if (onAssignmentUpdate) {
            onAssignmentUpdate();
          }
        } else {
          showToast(res.error?.message || 'Assignment failed');
        }
      })
      .catch(err => {
        console.error(err);
        showToast(err.message || 'Error assigning guest');
      });

    setActiveGuestForAssign(null);
  };

  // Remove guest assignment from database
  const handleUnassignGuest = (vehicleId, guestObj) => {
    const targetVehicle = vehicles.find(v => v.id === vehicleId);
    if (!targetVehicle) return;

    unassignGuestFromVehicle({ guestId: guestObj.id, vehicleId, eventId })
      .then(res => {
        if (res.success) {
          showToast(`Removed ${guestObj.name} from ${targetVehicle.name}.`);
          fetchData();
          if (onAssignmentUpdate) {
            onAssignmentUpdate();
          }
        } else {
          showToast(res.error?.message || 'Removal failed');
        }
      })
      .catch(err => {
        console.error(err);
        showToast(err.message || 'Error removing guest');
      });
  };

  // AI seating routes optimizer
  const handleOptimizeRoutes = () => {
    setIsOptimizing(true);
    showToast('Initiating AI Route Seating Optimizer...');

    setTimeout(() => {
      const overcapacityVehicles = vehicles.filter(v => v.guests.length > v.capacity);
      if (overcapacityVehicles.length === 0) {
        setIsOptimizing(false);
        showToast('Fleet seating is already optimized.');
        return;
      }

      const promises = [];
      const availableVehicles = vehicles.filter(v => v.status !== 'Maintenance' && v.guests.length < v.capacity);

      overcapacityVehicles.forEach(v => {
        const guestsToMove = v.guests.slice(v.capacity);
        guestsToMove.forEach(g => {
          const target = availableVehicles.find(av => av.guests.length < av.capacity);
          if (target) {
            promises.push(
              assignGuestToVehicle({ guestId: g.id, vehicleId: target.id, eventId })
            );
            target.guests.push(g);
          }
        });
      });

      if (promises.length > 0) {
        Promise.all(promises)
          .then(() => {
            showToast('Optimization Complete! All overcapacity warnings resolved.');
            fetchData();
            if (onAssignmentUpdate) {
              onAssignmentUpdate();
            }
          })
          .catch(err => {
            console.error(err);
            showToast('Optimization failed');
          })
          .finally(() => {
            setIsOptimizing(false);
          });
      } else {
        setIsOptimizing(false);
        showToast('Optimization complete. No available vehicles with free capacity.');
      }
    }, 1500);
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
            <span className="stat-num">{stats.totalVehicles}</span>
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
        <div className="alloc-action-ctas" style={{ position: 'relative' }}>
          <button 
            type="button" 
            className="btn-alloc-filter" 
            onClick={() => setShowAllocFilterDropdown(!showAllocFilterDropdown)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filter</span>
          </button>

          {showAllocFilterDropdown && (
            <div className="filter-dropdown-menu alloc-menu" style={{ right: 'auto', left: 0 }}>
              <div className="filter-dropdown-section">
                <h4>Vehicle Status</h4>
                <div className="filter-options-grid">
                  {['All', 'Available', 'On Route', 'Maintenance'].map(status => (
                    <label key={status} className="filter-option-label">
                      <input 
                        type="radio" 
                        name="allocStatusFilter" 
                        value={status}
                        checked={allocStatusFilter === status} 
                        onChange={() => setAllocStatusFilter(status)} 
                      />
                      <span>{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-dropdown-section" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                <h4>Capacity Level</h4>
                <div className="filter-options-grid">
                  {['All', 'Has Seats', 'Full / Over'].map(opt => (
                    <label key={opt} className="filter-option-label">
                      <input 
                        type="radio" 
                        name="allocCapacityFilter" 
                        value={opt}
                        checked={allocCapacityFilter === opt} 
                        onChange={() => setAllocCapacityFilter(opt)} 
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-dropdown-footer">
                <button type="button" className="btn-filter-reset" onClick={() => { setAllocStatusFilter('All'); setAllocCapacityFilter('All'); setShowAllocFilterDropdown(false); }}>Reset</button>
                <button type="button" className="btn-filter-apply" onClick={() => setShowAllocFilterDropdown(false)}>Apply</button>
              </div>
            </div>
          )}

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
          {filteredVehicles.map(v => {
            const isFull = v.guests.length >= v.capacity;
            const isOver = v.guests.length > v.capacity;
            const fillPercentage = Math.min(100, (v.guests.length / v.capacity) * 100);

            return (
              <div 
                key={v.id} 
                className={`vehicle-alloc-card ${v.status === 'Maintenance' ? 'maintenance' : ''} ${isOver ? 'overcapacity' : ''}`}
                onDragOver={(e) => handleDragOver(e, v.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, v.id)}
                style={draggedOverVehicleId === v.id ? { borderColor: '#ff4d4f', backgroundColor: '#fff1f0', transform: 'scale(1.015)', transition: 'all 0.25s ease' } : { transition: 'all 0.25s ease' }}
              >
                {/* Header Profile Row */}
                <div className="vehicle-card-hdr">
                  <div className="vehicle-profile-info">
                    <div className="vehicle-avatar-box">
                      <span className="veh-emoji">{v.type === 'van' || v.type === 'minibus' ? '🚐' : v.type === 'suv' ? '🚙' : '🚗'}</span>
                    </div>
                    <div>
                      <h4>{v.name}</h4>
                      <span className="license-tag">License: {v.license}</span>
                    </div>
                  </div>

                  <div className="vehicle-status-tag">
                    <span 
                      className={`status-indicator-dot ${v.status?.toLowerCase() || ''}`}
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
                      className={`cap-fill ${isOver ? 'fill-red' : ''}`} 
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
                      <img src={v.driverAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} alt={v.driver} className="driver-avatar-mini" />
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
                ) : (
                  <div className="driver-assign-row" style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
                    No driver assigned to vehicle.
                  </div>
                )}

                {/* Assigned Guests list */}
                <div className="assigned-guests-wrap">
                  <span className="assigned-guests-lbl">Assigned Guests</span>
                  
                  {v.status === 'Maintenance' ? (
                    <div className="maintenance-placeholder-dotted">
                      {v.placeholder || 'Vehicle currently unavailable.'}
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
                          showToast('Select a guest card in the queue and use the dropdown to assign to this vehicle.');
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

              return (
                <div 
                  key={guest.id} 
                  className={`guest-queue-card-item ${activeGuestForAssign?.id === guest.id ? 'active' : ''}`}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, guest.id)}
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
