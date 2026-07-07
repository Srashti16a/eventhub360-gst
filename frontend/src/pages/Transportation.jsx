import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import './Transportation.css';
import AllocationMatrix from '../components/Transportation/AllocationMatrix';
import { getDrivers, getTransfers, getActivityLogs, getDashboardOverview, getVehicles, createDriver, updateDriver, deleteDriver } from '../services/transportationService';

// Initial Seed data for drivers & fleet
const INITIAL_DRIVERS = [
  {
    id: 'd1',
    driverName: 'James Whitaker',
    driverId: 'EH-092',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    vehicle: 'Mercedes V-Class (2024)',
    status: 'Active', // Active, Resting, On-Break
    route: 'Airport ➔ Grand Hall'
  },
  {
    id: 'd2',
    driverName: 'Sarah Jenkins',
    driverId: 'EH-104',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    vehicle: 'Tesla Model X (White)',
    status: 'Resting',
    route: '—'
  },
  {
    id: 'd3',
    driverName: "Michael O'Brien",
    driverId: 'EH-058',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    vehicle: 'Sprinter Exec-Bus B12',
    status: 'On-Break',
    route: 'Shuttle Loop C'
  },
  {
    id: 'd4',
    driverName: 'David Chen',
    driverId: 'EH-112',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    vehicle: 'Executive Sedan S1',
    status: 'Active',
    route: 'Terminal 1 ➔ Main Gate'
  }
];

const INITIAL_ARRIVALS = [
  { id: 'a1', title: 'VIP Guest - Room 402', time: '14:20', detail: 'Mercedes V-Class • James W.', eta: '2 mins away', statusClass: 'green', dbStatus: 'In Transit' },
  { id: 'a2', title: 'Speaker - Dr. Elena R.', time: '14:45', detail: 'Tesla Model X • Sarah K.', eta: 'In Transit', statusClass: 'orange', dbStatus: 'In Transit' }
];

const INITIAL_DEPARTURES = [
  { id: 'dp1', title: 'Main Gate Shuttle', time: '14:15', detail: 'Bus B12 • Michael O.', capacity: '14/15', eta: 'Departed', statusClass: 'grey', status: 'Completed' },
  { id: 'dp2', title: 'Airport Express', time: '15:00', detail: 'Executive Sedan • Lucas P.', capacity: 'Boarding', eta: 'Boarding', statusClass: 'gold', status: 'Boarding' }
];

const INITIAL_LOGS = [
  { id: 'l1', title: 'Route Completed', desc: 'Fleet 12 arrived at Venue A', time: '3 mins ago', status: 'green' },
  { id: 'l2', title: 'Dispatch Alert', desc: 'New arrival scheduled for 15:30', time: '12 mins ago', status: 'orange' },
  { id: 'l3', title: 'Maintenance Flag', desc: 'Vehicle #240 fuel warning', time: '45 mins ago', status: 'yellow' }
];

// Initial mock chat messages mapping by driverId
const MOCK_CONVERSATIONS = {
  'EH-092': [
    { text: "Hi James, what is your ETA at the Airport Terminal?", time: "14:10", sender: "operator" },
    { text: "Just picked up the VIP guests. Leaving the terminal now, ETA is 10 minutes.", time: "14:12", sender: "driver" }
  ],
  'EH-104': [
    { text: "Sarah, are you available for a dispatch pick-up at 15:00?", time: "13:45", sender: "operator" },
    { text: "Currently resting, but I can clear for route duty by 14:50.", time: "13:48", sender: "driver" }
  ],
  'EH-058': [
    { text: "Michael, is the shuttle loop running on schedule?", time: "14:02", sender: "operator" },
    { text: "Yes, currently taking my scheduled break. Loop shuttle will restart in 5 minutes.", time: "14:05", sender: "driver" }
  ],
  'EH-112': [
    { text: "David, please confirm luggage capacity in Sedan S1.", time: "14:18", sender: "operator" },
    { text: "S1 is fully loaded. On route now.", time: "14:20", sender: "driver" }
  ]
};

// Seed data for the Fleet Usage Chart (Last 7 Days)
const CHART_DATA = [
  { day: 'Mon', suv: 8, vans: 18 },
  { day: 'Tue', suv: 14, vans: 12 },
  { day: 'Wed', suv: 10, vans: 28 },
  { day: 'Thu', suv: 20, vans: 16 },
  { day: 'Fri', suv: 32, vans: 24 },
  { day: 'Sat', suv: 16, vans: 36 },
  { day: 'Sun', suv: 24, vans: 30 }
];

// Helper to generate a smooth Bezier curve path string (horizontal spline)
const getCurvePath = (points) => {
  if (points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cp1x = p0.x + (p1.x - p0.x) / 2;
    const cp1y = p0.y;
    const cp2x = p1.x - (p1.x - p0.x) / 2;
    const cp2y = p1.y;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }
  return d;
};

// Helper to generate a closed area path string under the curve
const getAreaPath = (points, baselineY) => {
  if (points.length === 0) return '';
  const curve = getCurvePath(points);
  const first = points[0];
  const last = points[points.length - 1];
  return `${curve} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
};

const formatLogTime = (dateStr) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Just now';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function Transportation({ activeTab: propActiveTab }) {
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [arrivals, setArrivals] = useState(INITIAL_ARRIVALS);
  const [departures, setDepartures] = useState(INITIAL_DEPARTURES);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [dashboardOverview, setDashboardOverview] = useState({
    totalVehicles: 0,
    activeDrivers: 0,
    onRouteVehicles: 0,
    availableVehicles: 0,
    efficiencyRating: 94.5
  });
  const [chartData, setChartData] = useState([]);
  const [vehiclesData, setVehiclesData] = useState([]);
  
  // Filter Panel States
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [vehicleFilter, setVehicleFilter] = useState('All Vehicles');

  // Fetch events list once on mount
  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data && res.data.length > 0) {
          setEvents(res.data);
          const forum = res.data.find(e => e.title.includes('Forum') || e.category.includes('Gala')) || res.data[0];
          setActiveEvent(forum);
        }
      })
      .catch(err => console.error("Error loading events in Transportation:", err));
  }, []);

  // Fetch data function
  const loadData = useCallback(() => {
    if (!activeEvent) return;

    Promise.all([
      getDrivers(),
      getTransfers(activeEvent.id),
      getActivityLogs(),
      getDashboardOverview(activeEvent.id),
      getVehicles()
    ])
      .then(([driversRes, transfersRes, logsRes, overviewRes, vehiclesRes]) => {
        if (driversRes.success && driversRes.data) {
          const mappedDrivers = driversRes.data.map((d, index) => {
            const assignedVehicle = d.vehicles && d.vehicles[0] ? d.vehicles[0] : null;
            const activeTransfer = d.transfers?.find(t => t.status === 'In Transit') || d.transfers?.[0];
            const route = activeTransfer 
              ? (activeTransfer.route?.routeName || activeTransfer.transferType) 
              : (d.status === 'Active' ? 'Airport ➔ Grand Hall' : '—');
            const guestNames = d.transfers ? d.transfers.map(t => t.guest?.name).filter(Boolean) : [];

            return {
              id: d.id,
              driverName: d.fullName,
              phoneNumber: d.phoneNumber || '',
              driverId: assignedVehicle ? assignedVehicle.licenseNumber : `EH-${100 + index}`,
              avatar: d.fullName.toLowerCase().includes('sarah') 
                ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
                : d.fullName.toLowerCase().includes('james')
                ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                : d.fullName.toLowerCase().includes('michael')
                ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
                : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
              vehicle: assignedVehicle ? `${assignedVehicle.name}` : 'Unassigned',
              status: d.status,
              route,
              guestNames
            };
          });
          setDrivers(mappedDrivers);
        }

        if (transfersRes.success && transfersRes.data) {
          const arrs = transfersRes.data
            .filter(t => t.transferType.toLowerCase().includes('pickup') || t.transferType.toLowerCase().includes('transport') || t.transferType.toLowerCase().includes('vip'))
            .map(t => {
              let eta = 'Scheduled';
              let statusClass = 'grey';
              
              if (t.status === 'In Transit') {
                eta = '2 mins away';
                statusClass = 'green';
              } else if (t.status === 'Scheduled') {
                eta = t.vehicleId ? 'Assigned' : 'Pending';
                statusClass = t.vehicleId ? 'orange' : 'grey';
              } else if (t.status === 'Completed') {
                eta = 'Arrived';
                statusClass = 'green';
              } else if (t.status === 'Cancelled') {
                eta = 'Cancelled';
                statusClass = 'grey';
              }
              
              return {
                id: t.id,
                title: `${t.transferType} - ${t.guest ? t.guest.name : 'VIP Guest'}`,
                time: new Date(t.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                detail: t.vehicle ? `${t.vehicle.name} • ${t.driver ? t.driver.fullName : 'TBD'}` : 'Unassigned',
                eta,
                statusClass,
                dbStatus: t.status
              };
            });
          setArrivals(arrs);

          const deps = transfersRes.data
            .filter(t => t.transferType.toLowerCase().includes('dropoff') || t.transferType.toLowerCase().includes('shuttle'))
            .map(t => {
              let eta = t.status;
              let statusClass = 'grey';
              
              if (t.status === 'In Transit') {
                eta = 'In Transit';
                statusClass = 'orange';
              } else if (t.status === 'Scheduled') {
                eta = t.vehicleId ? 'Boarding' : 'Preparing';
                statusClass = t.vehicleId ? 'gold' : 'grey';
              } else if (t.status === 'Completed') {
                eta = 'Departed';
                statusClass = 'grey';
              } else if (t.status === 'Cancelled') {
                eta = 'Cancelled';
                statusClass = 'grey';
              }
              
              return {
                id: t.id,
                title: `${t.transferType}`,
                time: new Date(t.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                detail: t.vehicle ? `${t.vehicle.name} • ${t.driver ? t.driver.fullName : 'TBD'}` : 'Unassigned',
                capacity: 'Boarding',
                eta,
                status: t.status,
                statusClass
              };
            });
          setDepartures(deps);
        }

        if (logsRes.success && logsRes.data) {
          const mappedLogs = logsRes.data.map(l => ({
            id: l.id,
            title: l.activityType,
            desc: l.message,
            time: formatLogTime(l.createdAt),
            status: l.severity === 'Critical' ? 'red' : l.severity === 'Warning' ? 'orange' : 'green'
          }));
          setLogs(mappedLogs);
        }

        if (overviewRes.success && overviewRes.data) {
          setDashboardOverview(overviewRes.data);
          if (overviewRes.data.chartData) {
            setChartData(overviewRes.data.chartData);
          }
        }

        if (vehiclesRes.success && vehiclesRes.data) {
          setVehiclesData(vehiclesRes.data);
        }
      })
      .catch(err => console.error("Error loading dynamic transportation data:", err));
  }, [activeEvent]);

  // Sync data on mount and set polling interval to keep everything updated in sync
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Active Message Dialogue chat state
  const [selectedDriverForChat, setSelectedDriverForChat] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [typedMessage, setTypedMessage] = useState('');
  const [activeTab, setActiveTab] = useState(propActiveTab || 'overview');

  // Driver modal states
  const [showDriverModal, setShowDriverModal] = useState(null); // 'add' | 'edit' | null
  const [editingDriver, setEditingDriver] = useState(null);
  const [driverForm, setDriverForm] = useState({
    fullName: '',
    phoneNumber: '',
    status: 'Available'
  });

  // Synchronize prop changes to local tab state
  useEffect(() => {
    if (propActiveTab) {
      setActiveTab(propActiveTab);
    }
  }, [propActiveTab]);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const chatEndRef = useRef(null);

  // Compute coordinates and curve paths for rendering SVG chart
  const chartPoints = useMemo(() => {
    return chartData.map((d, i) => {
      const x = 40 + i * 85;
      const ySuv = 155 - (d.suv / 36) * 125;
      const yVans = 155 - (d.vans / 36) * 125;
      return { ...d, x, ySuv, yVans };
    });
  }, [chartData]);

  const suvPath = useMemo(() => {
    const pts = chartPoints.map(p => ({ x: p.x, y: p.ySuv }));
    return getCurvePath(pts);
  }, [chartPoints]);

  const vansPath = useMemo(() => {
    const pts = chartPoints.map(p => ({ x: p.x, y: p.yVans }));
    return getCurvePath(pts);
  }, [chartPoints]);

  const suvAreaPath = useMemo(() => {
    const pts = chartPoints.map(p => ({ x: p.x, y: p.ySuv }));
    return getAreaPath(pts, 155);
  }, [chartPoints]);

  const vansAreaPath = useMemo(() => {
    const pts = chartPoints.map(p => ({ x: p.x, y: p.yVans }));
    return getAreaPath(pts, 155);
  }, [chartPoints]);

  const fleetDistribution = useMemo(() => {
    const categories = {
      sedan: { name: 'Luxury Sedans', active: 0, total: 0, class: 'sedans' },
      van: { name: 'Sprinter Vans', active: 0, total: 0, class: 'vans' },
      suv: { name: 'SUVs (Escort)', active: 0, total: 0, class: 'suvs' }
    };

    vehiclesData.forEach(v => {
      const type = v.type?.toLowerCase() || '';
      let cat = null;
      if (type.includes('sedan')) {
        cat = categories.sedan;
      } else if (type.includes('van') || type.includes('minibus')) {
        cat = categories.van;
      } else if (type.includes('suv')) {
        cat = categories.suv;
      }

      if (cat) {
        cat.total++;
        if (v.status === 'On Route' || v.status === 'Staged' || v.status === 'Active') {
          cat.active++;
        }
      }
    });

    return Object.values(categories).map(cat => {
      const percentage = cat.total > 0 ? Math.round((cat.active / cat.total) * 100) : 0;
      return {
        ...cat,
        percentage
      };
    });
  }, [vehiclesData]);

  // Initialize chat conversations once
  useEffect(() => {
    setChatMessages(MOCK_CONVERSATIONS);
  }, []);

  // Auto-scroll chat box
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedDriverForChat, chatMessages]);

  const pendingArrivalsCount = useMemo(() => 
    arrivals.filter(a => a.dbStatus === 'Scheduled' || a.dbStatus === 'In Transit').length, 
    [arrivals]
  );

  const preparingDeparturesCount = useMemo(() => 
    departures.filter(d => d.status === 'Scheduled' || d.status === 'In Transit').length, 
    [departures]
  );

  // Search and dropdown filter for Drivers table
  const computedDrivers = useMemo(() => {
    return drivers.filter(d => {
      const matchesSearch = searchQuery.trim() === '' ||
        d.driverName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All Statuses' || d.status === statusFilter;

      const matchesVehicle = vehicleFilter === 'All Vehicles' || d.vehicle.toLowerCase().includes(vehicleFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesVehicle;
    });
  }, [drivers, searchQuery, statusFilter, vehicleFilter]);

  // Export report as CSV
  const handleExportCSV = () => {
    const csvHeaders = 'Driver,Driver ID,Vehicle,Status,Route\n';
    const csvRows = drivers.map(d => 
      `"${d.driverName}","${d.driverId}","${d.vehicle}","${d.status}","${d.route}"`
    ).join('\n');

    const blob = new Blob([csvHeaders + csvRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transport_fleet_report_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dispatch message sending simulator
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !selectedDriverForChat) return;

    const driverId = selectedDriverForChat.driverId;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append operator message
    const newMessage = { text: typedMessage, time: timestamp, sender: 'operator' };
    
    setChatMessages(prev => ({
      ...prev,
      [driverId]: [...(prev[driverId] || []), newMessage]
    }));

    const messageSent = typedMessage;
    setTypedMessage('');

    // Simulate delayed response from driver
    setTimeout(() => {
      const replyTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let replyText = "Understood. Copy that.";
      if (messageSent.toLowerCase().includes('eta')) {
        replyText = "About 5 minutes away. Traffic is moderate.";
      } else if (messageSent.toLowerCase().includes('delay') || messageSent.toLowerCase().includes('where')) {
        replyText = "Delayed slightly at main junction, proceeding shortly.";
      }

      const driverReply = { text: replyText, time: replyTimestamp, sender: 'driver' };
      setChatMessages(prev => ({
        ...prev,
        [driverId]: [...(prev[driverId] || []), driverReply]
      }));
    }, 1500);
  };

  // Open Chat Dialogue
  const openChatForDriver = (driver) => {
    setSelectedDriverForChat(driver);
  };

  const handleAddDriverClick = () => {
    setDriverForm({
      fullName: '',
      phoneNumber: '',
      status: 'Available'
    });
    setShowDriverModal('add');
  };

  const handleEditDriverClick = (driver) => {
    setEditingDriver(driver);
    setDriverForm({
      fullName: driver.driverName,
      phoneNumber: driver.phoneNumber || '',
      status: driver.status
    });
    setShowDriverModal('edit');
  };

  const handleDeleteDriverClick = (driver) => {
    if (window.confirm(`Are you sure you want to delete driver ${driver.driverName}? This will remove their fleet assignments.`)) {
      deleteDriver(driver.id)
        .then(res => {
          if (res.success) {
            loadData();
          } else {
            alert(res.error?.message || 'Failed to delete driver');
          }
        })
        .catch(err => console.error("Error deleting driver:", err));
    }
  };

  const handleDriverFormSubmit = (e) => {
    e.preventDefault();
    if (!driverForm.fullName.trim()) return;

    if (showDriverModal === 'add') {
      createDriver({
        fullName: driverForm.fullName,
        phoneNumber: driverForm.phoneNumber,
        status: driverForm.status
      })
        .then(res => {
          if (res.success) {
            loadData();
            setShowDriverModal(null);
          } else {
            alert(res.error?.message || 'Failed to add driver');
          }
        })
        .catch(err => console.error("Error creating driver:", err));
    } else if (showDriverModal === 'edit' && editingDriver) {
      updateDriver(editingDriver.id, {
        fullName: driverForm.fullName,
        phoneNumber: driverForm.phoneNumber,
        status: driverForm.status
      })
        .then(res => {
          if (res.success) {
            loadData();
            setShowDriverModal(null);
            setEditingDriver(null);
          } else {
            alert(res.error?.message || 'Failed to update driver');
          }
        })
        .catch(err => console.error("Error updating driver:", err));
    }
  };

  return (
    <div className="trans-container">
      {/* Header section matching style layouts */}
      <header className="trans-header">
        <div className="trans-title-area">
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            Transportation <span style={{ margin: '0 0.35rem', color: '#94a3b8' }}>/</span> <span style={{ color: '#ff4d4f' }}>Overview</span>
          </div>
          <h1>Transportation Overview</h1>
          <p>Real-time status for the Gala Dinner Arrivals</p>
        </div>

        <div className="trans-header-actions" style={{ position: 'relative' }}>
          {/* Header Action Buttons */}
          <button 
            type="button" 
            className={`btn-trans-filter ${isFilterPanelOpen ? 'active' : ''}`} 
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            style={{
              borderColor: isFilterPanelOpen ? '#ff4d4f' : undefined,
              backgroundColor: isFilterPanelOpen ? '#fff5f5' : undefined,
              color: isFilterPanelOpen ? '#ff4d4f' : undefined
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filters</span>
          </button>

          <button type="button" className="btn-trans-export" onClick={handleExportCSV}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export Report</span>
          </button>
        </div>
      </header>

      {/* Collapsible Filter Panel */}
      {isFilterPanelOpen && (
        <div className="trans-filter-panel" style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 20px -2px rgba(148, 163, 184, 0.08)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          alignItems: 'center',
          animation: 'slideDown 0.25s ease-out'
        }}>
          {/* Status Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Driver Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.5rem 1.5rem 0.5rem 0.75rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                outline: 'none',
                color: '#1e293b',
                backgroundColor: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Resting">Resting</option>
              <option value="On-Break">On-Break</option>
            </select>
          </div>

          {/* Vehicle Type Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vehicle Fleet</label>
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              style={{
                padding: '0.5rem 1.5rem 0.5rem 0.75rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                outline: 'none',
                color: '#1e293b',
                backgroundColor: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="All Vehicles">All Vehicles</option>
              <option value="Mercedes">Mercedes V-Class</option>
              <option value="Tesla">Tesla Model X</option>
              <option value="Sprinter">Sprinter Exec-Bus</option>
              <option value="Sedan">Executive Sedan</option>
            </select>
          </div>

          {/* Reset button */}
          <div style={{ display: 'flex', alignSelf: 'flex-end', marginLeft: 'auto', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('All Statuses');
                setVehicleFilter('All Vehicles');
                setSearchQuery('');
              }}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.825rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={() => setIsFilterPanelOpen(false)}
              style={{
                backgroundColor: '#1e293b',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.825rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Apply & Close
            </button>
          </div>
        </div>
      )}

      {/* Sub-navigation Tabs */}
      <div className="trans-tabs" style={{
        display: 'flex',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '2rem',
        gap: '2rem',
        marginTop: '-0.5rem'
      }}>
        <button
          className={`trans-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 0.5rem',
            fontWeight: 700,
            fontSize: '0.875rem',
            color: activeTab === 'overview' ? '#ff4d4f' : '#64748b',
            borderBottom: activeTab === 'overview' ? '3px solid #ff4d4f' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: '-1.5px',
            fontFamily: 'Outfit, sans-serif'
          }}
        >
          Fleet Overview
        </button>
        <button
          className={`trans-tab-btn ${activeTab === 'allocation' ? 'active' : ''}`}
          onClick={() => setActiveTab('allocation')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 0.5rem',
            fontWeight: 700,
            fontSize: '0.875rem',
            color: activeTab === 'allocation' ? '#ff4d4f' : '#64748b',
            borderBottom: activeTab === 'allocation' ? '3px solid #ff4d4f' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: '-1.5px',
            fontFamily: 'Outfit, sans-serif'
          }}
        >
          Allocation Matrix
        </button>
        <button
          className={`trans-tab-btn ${activeTab === 'drivers' ? 'active' : ''}`}
          onClick={() => setActiveTab('drivers')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 0.5rem',
            fontWeight: 700,
            fontSize: '0.875rem',
            color: activeTab === 'drivers' ? '#ff4d4f' : '#64748b',
            borderBottom: activeTab === 'drivers' ? '3px solid #ff4d4f' : '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: '-1.5px',
            fontFamily: 'Outfit, sans-serif'
          }}
        >
          Driver Portal
        </button>
      </div>

      {activeTab === 'overview' && (
        <>

      {/* Metrics Row */}
      <section className="trans-stats-grid">
        {/* Metric 1 */}
        <div className="trans-stat-card">
          <div className="trans-card-header">
            <div className="trans-icon-wrap vehicles">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="22" height="13" rx="2" ry="2" />
                <path d="M7 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
              </svg>
            </div>
            <span className="trans-badge-status green">+4% ➔</span>
          </div>
          <div className="trans-card-body">
            <h3>Total Vehicles</h3>
            <p className="trans-val">{dashboardOverview.totalVehicles}</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="trans-stat-card">
          <div className="trans-card-header">
            <div className="trans-icon-wrap drivers">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <span className="trans-badge-status orange" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>Steady</span>
          </div>
          <div className="trans-card-body">
            <h3>Active Drivers</h3>
            <p className="trans-val">{dashboardOverview.activeDrivers}</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="trans-stat-card">
          <div className="trans-card-header">
            <div className="trans-icon-wrap on-route">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <span className="trans-badge-status purple">Peak 🔥</span>
          </div>
          <div className="trans-card-body">
            <h3>On-Route</h3>
            <p className="trans-val">{dashboardOverview.onRouteVehicles}</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="trans-stat-card">
          <div className="trans-card-header">
            <div className="trans-icon-wrap efficiency">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <span className="trans-badge-status green">98.2% ✓</span>
          </div>
          <div className="trans-card-body">
            <h3>Efficiency Rating</h3>
            <p className="trans-val">{dashboardOverview.efficiencyRating}%</p>
          </div>
        </div>
      </section>

      {/* Mid Visuals Section */}
      <section className="trans-mid-grid">
        {/* Left: Fleet Usage Line Chart Card */}
        <div className="trans-card" style={{ alignSelf: 'start' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Fleet Usage (Last 7 Days)</h2>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', fontWeight: 600 }}>
              <span style={{ color: '#ff4d4f' }}>● Luxury SUV</span>
              <span style={{ color: '#7c3aed' }}>● Sprinter Vans</span>
            </div>
          </div>

          <div className="chart-content-area" style={{ height: '220px' }}>
            <svg viewBox="0 0 600 195" width="100%" height="100%" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="suvGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff4d4f" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ff4d4f" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="vansGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines */}
              <line x1="20" y1="30" x2="580" y2="30" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="20" y1="80" x2="580" y2="80" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="20" y1="130" x2="580" y2="130" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />

              {/* Hover vertical guide line */}
              {hoveredPoint && (
                <line 
                  x1={hoveredPoint.x} 
                  y1="15" 
                  x2={hoveredPoint.x} 
                  y2="155" 
                  stroke="#cbd5e1" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 4" 
                />
              )}

              {/* Shaded Area Paths */}
              <path d={suvAreaPath} fill="url(#suvGradient)" />
              <path d={vansAreaPath} fill="url(#vansGradient)" />

              {/* Line Spline Paths */}
              <path d={suvPath} fill="none" stroke="#ff4d4f" strokeWidth="3.5" strokeLinecap="round" />
              <path d={vansPath} fill="none" stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round" />

              {/* Interaction Circles */}
              {chartPoints.map((p, idx) => (
                <g key={`points-${idx}`}>
                  <circle
                    cx={p.x}
                    cy={p.ySuv}
                    r={hoveredPoint?.day === p.day ? 6 : 4}
                    fill="#ffffff"
                    stroke="#ff4d4f"
                    strokeWidth={hoveredPoint?.day === p.day ? 3.5 : 2.5}
                    style={{ transition: 'all 0.15s ease' }}
                  />
                  <circle
                    cx={p.x}
                    cy={p.yVans}
                    r={hoveredPoint?.day === p.day ? 6 : 4}
                    fill="#ffffff"
                    stroke="#7c3aed"
                    strokeWidth={hoveredPoint?.day === p.day ? 3.5 : 2.5}
                    style={{ transition: 'all 0.15s ease' }}
                  />
                </g>
              ))}

              {/* Day Labels at the bottom */}
              {chartPoints.map((p, idx) => (
                <text
                  key={`text-${idx}`}
                  x={p.x}
                  y="182"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="12"
                  fontWeight="600"
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  {p.day}
                </text>
              ))}

              {/* Hover Overlay Rectangles */}
              {chartPoints.map((p, idx) => (
                <rect
                  key={`rect-${idx}`}
                  x={p.x - 42}
                  y="10"
                  width="84"
                  height="180"
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}

              {/* Tooltip Overlay inside foreignObject */}
              {hoveredPoint && (
                <foreignObject
                  x={hoveredPoint.x - 60}
                  y={Math.min(hoveredPoint.ySuv, hoveredPoint.yVans) - 95}
                  width="120"
                  height="85"
                  style={{ pointerEvents: 'none', overflow: 'visible' }}
                >
                  <div style={{
                    backgroundColor: '#1e293b',
                    color: '#ffffff',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
                    border: '1px solid #334155',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    fontFamily: 'Plus Jakarta Sans, sans-serif'
                  }}>
                    <div style={{ fontWeight: 'bold', borderBottom: '1px solid #334155', paddingBottom: '2px', color: '#94a3b8' }}>
                      {hoveredPoint.day}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ff4d4f' }}></span>
                        SUV
                      </span>
                      <span style={{ fontWeight: 'bold' }}>{hoveredPoint.suv}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#7c3aed' }}></span>
                        Vans
                      </span>
                      <span style={{ fontWeight: 'bold' }}>{hoveredPoint.vans}</span>
                    </div>
                  </div>
                </foreignObject>
              )}
            </svg>
          </div>
        </div>

        {/* Right side Stack panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Route Map overview */}
          <div className="trans-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Route Overview</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                Live
              </span>
            </div>

            <div className="route-map-panel">
              <div className="map-route-indicator">Active Routes: 14</div>
              <div className="map-visual-vector">
                <span className="map-gps-point orange"></span>
                <span className="map-gps-point purple"></span>
                <span className="map-gps-point green"></span>
              </div>
              <div className="map-details-card">
                <div className="map-terminal-row">
                  <span className="map-terminal-icon orange">📍</span>
                  <span>Main Gate Terminal</span>
                </div>
                <div className="map-terminal-row">
                  <span className="map-terminal-icon purple">📍</span>
                  <span>Grand Hall North</span>
                </div>
              </div>
            </div>

            <button 
              type="button" 
              className="btn-map-network"
              onClick={() => alert('Launching GPS terminal route map overlays...')}
            >
              View Detailed Network Map
            </button>
          </div>

          {/* Fleet distributions progress */}
          <div className="trans-card">
            <h2 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Fleet Distribution</h2>
            <div className="distribution-list">
              {fleetDistribution.map(cat => (
                <div key={cat.name} className="distribution-item-row">
                  <div className="dist-meta">
                    <span>{cat.name}</span>
                    <span>{cat.active} / {cat.total}</span>
                  </div>
                  <div className="dist-bar-track">
                    <div className={`dist-bar-fill ${cat.class}`} style={{ width: `${cat.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lower split lists */}
      <section className="trans-lower-layout">
        {/* Left Side Trips columns */}
        <div className="live-trips-split">
          {/* Arrivals panel */}
          <div className="trips-panel">
            <div className="panel-header-row">
              <span className="panel-title arrivals">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="23 18 17 12 17 16 1 16 1 20 17 20 17 24" />
                  <path d="M3 10V6a4 4 0 0 1 4-4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4" />
                </svg>
                Live Arrivals
              </span>
              <span className="panel-badge arrivals">{pendingArrivalsCount} Active</span>
            </div>

            <div className="trips-list">
              {arrivals.map(item => (
                <div key={item.id} className="trip-card-item">
                  <div className="trip-icon-box">🏢</div>
                  <div className="trip-details">
                    <div className="trip-meta-line">
                      <span>{item.title}</span>
                      <span className="trip-time">{item.time}</span>
                    </div>
                    <span className="trip-desc">{item.detail}</span>
                    <span className={`trip-status-dot ${item.statusClass}`}>{item.eta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Departures panel */}
          <div className="trips-panel">
            <div className="panel-header-row">
              <span className="panel-title departures">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="1 6 7 12 7 8 23 8 23 4 7 4 7 0" />
                  <path d="M21 14v4a4 4 0 0 1-4 4H3a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h4" />
                </svg>
                Live Departures
              </span>
              <span className="panel-badge departures">{preparingDeparturesCount} Preparing</span>
            </div>

            <div className="trips-list">
              {departures.map(item => (
                <div key={item.id} className={`trip-card-item ${item.eta === 'Boarding' ? 'departure-boarding' : ''}`}>
                  <div className="trip-icon-box">✈️</div>
                  <div className="trip-details">
                    <div className="trip-meta-line">
                      <span>{item.title}</span>
                      <span className="trip-time">{item.time}</span>
                    </div>
                    <span className="trip-desc">{item.detail}</span>
                    <span className={`trip-status-dot ${item.statusClass}`}>
                      {item.eta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side Event activity logs */}
        <div className="log-panel">
          <h2 style={{ fontSize: '0.95rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Event Activity Log</h2>
          <div className="log-feed">
            {logs.map(log => (
              <div key={log.id} className="log-item-row">
                <span className={`log-line-bar ${log.status}`}></span>
                <div className="log-content">
                  <span className="log-title">{log.title}</span>
                  <span className="log-desc">{log.desc}</span>
                  <span className="log-time">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Driver Fleet Assignment Table */}
      <section className="driver-card">
        <div className="driver-card-header">
          <h2>Driver Fleet Assignment</h2>
          {/* Header Action controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.8rem' }}>🔍</span>
              <input
                type="text"
                placeholder="Search drivers..."
                className="alloc-search-input"
                style={{ width: '220px', padding: '0.45rem 0.75rem 0.45rem 2rem', borderRadius: '8px', fontSize: '0.8rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn-trans-export"
              style={{
                padding: '0.45rem 0.9rem',
                fontSize: '0.8rem',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              onClick={handleAddDriverClick}
            >
              <span>+ Add Driver</span>
            </button>
          </div>
        </div>

        {/* Mappings Table */}
        <div className="alloc-table-wrap">
          <table className="alloc-table">
            <thead>
              <tr>
                <th>Driver Name</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Route</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {computedDrivers.map(item => (
                <tr key={item.id}>
                  {/* Driver Profile */}
                  <td>
                    <div className="guest-profile-cell">
                      <img src={item.avatar} alt={item.driverName} className="vip-avatar" style={{ width: '32px', height: '32px' }} />
                      <div className="guest-profile-info">
                        <span className="guest-profile-name" style={{ fontSize: '0.85rem' }}>{item.driverName}</span>
                        <span className="guest-profile-id" style={{ fontSize: '0.7rem' }}>ID: {item.driverId}</span>
                        {item.guestNames && item.guestNames.length > 0 && (
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>
                            👤 {item.guestNames.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Vehicle specifications */}
                  <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.vehicle}</td>

                  {/* Status Badge */}
                  <td>
                    <span className={`status-badge ${
                      item.status === 'Active' ? 'checked-in' : item.status === 'Resting' ? 'pending' : 'confirmed'
                    }`} style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }}>
                      {item.status}
                    </span>
                  </td>

                  {/* Route details */}
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.route}</td>

                  {/* Actions Column triggers Message/Edit/Delete Dialogue */}
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                      <button 
                        type="button" 
                        className="btn-message-driver" 
                        title="Edit Driver"
                        onClick={() => handleEditDriverClick(item)}
                      >
                        ✏️
                      </button>
                      <button 
                        type="button" 
                        className="btn-message-driver" 
                        title="Delete Driver"
                        style={{ color: '#ef4444' }}
                        onClick={() => handleDeleteDriverClick(item)}
                      >
                        🗑️
                      </button>
                      <button 
                        type="button" 
                        className="btn-message-driver" 
                        title="Direct Message Driver"
                        onClick={() => openChatForDriver(item)}
                      >
                        💬
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {computedDrivers.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontWeight: 600 }}>
                    No driver fleet assignments match criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      </>
      )}

      {activeTab === 'allocation' && activeEvent && (
        <AllocationMatrix 
          eventId={activeEvent.id} 
          onAssignmentUpdate={() => {
            loadData();
          }} 
        />
      )}

      {activeTab === 'drivers' && (
        <div className="driver-portal-placeholder" style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', margin: '2rem 0' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>Driver Management Portal</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem auto', lineHeight: '1.5' }}>Monitor active driver dispatch telemetry, log rest breaks, and send broadcast announcements.</p>
          <button type="button" className="btn-trans-export" onClick={() => alert('Broadcasting push announcements to all drivers...')}>Send Broadcast Message</button>
        </div>
      )}

      {/* Message Driver Conversation Dialogue Modal */}
      {selectedDriverForChat && (
        <div className="chat-overlay" onClick={() => setSelectedDriverForChat(null)}>
          <div className="chat-box" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="chat-header">
              <h3 className="chat-title">Dispatch Chat: {selectedDriverForChat.driverName}</h3>
              <button 
                type="button" 
                className="chat-close-btn"
                onClick={() => setSelectedDriverForChat(null)}
              >
                ✕
              </button>
            </div>

            {/* Conversational timeline bubbles */}
            <div className="chat-history">
              {(chatMessages[selectedDriverForChat.driverId] || []).map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.sender === 'operator' ? 'sender' : 'receiver'}`}>
                  {msg.text}
                  <span className="chat-time">{msg.time}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Form messaging inputs */}
            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type message to driver..."
                className="chat-input-field"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                required
              />
              <button type="submit" className="btn-chat-send">Send</button>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Driver Modal */}
      {showDriverModal && (
        <div className="chat-overlay" onClick={() => {
          setShowDriverModal(null);
          setEditingDriver(null);
        }}>
          <div className="chat-box" onClick={e => e.stopPropagation()} style={{ width: '400px' }}>
            <div className="chat-header">
              <h3 className="chat-title">{showDriverModal === 'add' ? 'Add New Driver' : 'Edit Driver Details'}</h3>
              <button 
                type="button" 
                className="chat-close-btn"
                onClick={() => {
                  setShowDriverModal(null);
                  setEditingDriver(null);
                }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleDriverFormSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={driverForm.fullName}
                  onChange={e => setDriverForm({ ...driverForm, fullName: e.target.value })}
                  style={{
                    padding: '0.6rem 0.75rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}
                  placeholder="Enter driver name"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Phone Number</label>
                <input
                  type="text"
                  value={driverForm.phoneNumber}
                  onChange={e => setDriverForm({ ...driverForm, phoneNumber: e.target.value })}
                  style={{
                    padding: '0.6rem 0.75rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}
                  placeholder="Enter phone number"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status</label>
                <select
                  value={driverForm.status}
                  onChange={e => setDriverForm({ ...driverForm, status: e.target.value })}
                  style={{
                    padding: '0.6rem 0.75rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="Available">Available</option>
                  <option value="Active">Active</option>
                  <option value="Resting">Resting</option>
                  <option value="On-Break">On-Break</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowDriverModal(null);
                    setEditingDriver(null);
                  }}
                  style={{
                    padding: '0.6rem 1.25rem',
                    backgroundColor: '#f1f5f9',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: 'linear-gradient(135deg, #ff7a45 0%, #ff4d4f 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(255, 77, 79, 0.2)'
                  }}
                >
                  {showDriverModal === 'add' ? 'Add Driver' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
