import React, { useState, useEffect } from 'react';
import './CheckinDashboard.css';

export default function CheckinDashboard() {
  // Check-in Dashboard States
  const [dashboardTab, setDashboardTab] = useState('dashboard'); // 'dashboard', 'live', 'history', 'staff'
  const [attendanceActive, setAttendanceActive] = useState(true);
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [trendView, setTrendView] = useState('hourly'); // 'hourly', 'realtime'
  const [scannerActive, setScannerActive] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Real Database Synchronized States
  const [stats, setStats] = useState({
    totalExpected: 2450,
    checkedInCount: 0,
    vipTotalCount: 0,
    vipCheckedInCount: 0,
    gates: {
      northGate: 0,
      mainBallroom: 0,
      vipLounge: 0
    }
  });
  
  const [dashboardAlerts, setDashboardAlerts] = useState([]);
  const [recentCheckins, setRecentCheckins] = useState([]);

  // Fetch all dashboard data from backend PostgreSQL APIs
  const fetchDashboardData = async () => {
    try {
      // 1. Fetch check-in stats
      const statsRes = await fetch('/api/dashboard/checkin/stats');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // 2. Fetch recent check-ins (filtered by text search)
      const recentRes = await fetch(`/api/dashboard/checkin/recent?search=${encodeURIComponent(dashboardSearch)}`);
      const recentData = await recentRes.json();
      if (recentData.success) {
        setRecentCheckins(recentData.data);
      }

      // 3. Fetch VIP Arrival Alerts
      const alertsRes = await fetch('/api/dashboard/checkin/alerts');
      const alertsData = await alertsRes.json();
      if (alertsData.success) {
        setDashboardAlerts(alertsData.data);
      }
    } catch (err) {
      console.error('Error loading check-in dashboard data from PostgreSQL:', err);
    }
  };

  // Trigger search auto-fetch and mount fetch
  useEffect(() => {
    fetchDashboardData();
    // Setup occasional sync if auto-attendance is checked
    let interval;
    if (attendanceActive) {
      interval = setInterval(fetchDashboardData, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [dashboardSearch, attendanceActive]);

  const triggerToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // SIMULATE QR Scan: updates backend PostgreSQL database
  const handleRescanQRCode = async () => {
    if (scannerActive) return;
    setScannerActive(true);
    triggerToast('Initializing QR camera scanner...');
    
    setTimeout(async () => {
      setScannerActive(false);
      try {
        const res = await fetch('/api/dashboard/checkin/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        
        if (data.success) {
          const guest = data.data;
          triggerToast(`Check-in ${guest.checkinStatus} for ${guest.name}!`);
          fetchDashboardData();
        } else {
          triggerToast(`Error: ${data.error?.message || 'Scan failed'}`);
        }
      } catch (err) {
        triggerToast('Database sync connection error.');
      }
    }, 1500);
  };

  // MANUAL Check-in: creates or updates a guest status in database
  const handleManualCheckin = async () => {
    const name = prompt("Enter guest name for manual check-in:");
    if (!name || !name.trim()) return;
    
    try {
      const res = await fetch('/api/dashboard/checkin/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), entrance: 'Main Ballroom' })
      });
      const data = await res.json();
      
      if (data.success) {
        triggerToast(`Checked in ${data.data.name} directly to database!`);
        fetchDashboardData();
      } else {
        triggerToast(`Check-in failed: ${data.error?.message}`);
      }
    } catch (err) {
      triggerToast('Database manual registration failed.');
    }
  };

  // APPROVED Flagged ticket: updates status in database
  const handleReviewFlagged = async (id, name) => {
    try {
      const res = await fetch(`/api/dashboard/checkin/approve/${id}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`Approved and updated status for ${name}!`);
        fetchDashboardData();
      } else {
        triggerToast(`Approval failed: ${data.error?.message}`);
      }
    } catch (err) {
      triggerToast('Database approval transaction failed.');
    }
  };

  // Dynamic calculations
  const attendancePct = stats.totalExpected > 0 ? Math.round((stats.checkedInCount / stats.totalExpected) * 100) : 0;
  const radialDashoffset = 264 - (264 * Math.min(attendancePct, 100)) / 100;

  // Helpers for text labels
  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getVipBadgeDetails = (guest) => {
    if (guest.isSpeaker) return { type: 'SPEAKER', badgeClass: 'keynote' };
    if (guest.isVip) return { type: 'VIP', badgeClass: 'gold' };
    return { type: 'PLATINUM', badgeClass: 'platinum' };
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const d = new Date(timeString);
      return d.toTimeString().split(' ')[0];
    } catch (e) {
      return '';
    }
  };

  const timeAgo = (timeString) => {
    if (!timeString) return '';
    try {
      const diffMs = Date.now() - new Date(timeString).getTime();
      const diffMins = Math.max(0, Math.floor(diffMs / 60000));
      if (diffMins === 0) return 'Arrived Just Now';
      return `Arrived ${diffMins}m ago`;
    } catch (e) {
      return 'Arrived';
    }
  };

  return (
    <div className="checkin-dashboard-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="dash-toast">
          <span>✨</span> {toastMessage}
        </div>
      )}

      {/* Sub-Header / Tab Bar */}
      <div className="dashboard-tab-bar">
        <div className="dashboard-tabs">
          {[
            { id: 'dashboard', label: 'Check-in Dashboard' },
            { id: 'live', label: 'Live View' },
            { id: 'history', label: 'History' },
            { id: 'staff', label: 'Staff' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`dashboard-tab-btn ${dashboardTab === tab.id ? 'active' : ''}`}
              onClick={() => setDashboardTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="dashboard-header-right">
          <div className="dashboard-search-wrap">
            <span className="dashboard-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search database..."
              value={dashboardSearch}
              onChange={(e) => setDashboardSearch(e.target.value)}
              className="dashboard-search-input"
            />
          </div>
          
          <button type="button" className="icon-btn-dash" title="Refresh" onClick={() => { fetchDashboardData(); triggerToast('Synced with database.'); }}>
            🔄
          </button>
          
          <button type="button" className="icon-btn-dash" title="Alerts" onClick={() => triggerToast(`${dashboardAlerts.length} VIP alerts loaded.`)}>
            <span style={{ position: 'relative' }}>
              🔔
              {dashboardAlerts.length > 0 && <span className="dash-badge-dot"></span>}
            </span>
          </button>

          <div className="manager-profile">
            <div className="profile-details">
              <span className="profile-name">Julian Rossi</span>
              <span className="profile-role">Event Manager</span>
            </div>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120"
              alt="Julian Rossi"
              className="profile-avatar"
            />
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      {dashboardTab === 'dashboard' && (
        <>
          <div className="dashboard-stats-grid">
            <div className="dash-stat-card">
              <div className="dash-card-header">
                <div className="dash-card-icon expected">👥</div>
                <span className="trend-badge positive">DB Live</span>
              </div>
              <div className="dash-card-body">
                <span className="dash-card-label">TOTAL EXPECTED</span>
                <span className="dash-card-value">{stats.totalExpected.toLocaleString()}</span>
              </div>
            </div>

            <div className="dash-stat-card">
              <div className="dash-card-header">
                <div className="dash-card-icon attendance">✓</div>
                <label className="toggle-wrapper-dash">
                  <input
                    type="checkbox"
                    checked={attendanceActive}
                    onChange={(e) => {
                      setAttendanceActive(e.target.checked);
                      triggerToast(e.target.checked ? 'Database auto-sync activated (5s interval)' : 'Database auto-sync paused');
                    }}
                    className="toggle-input-dash"
                  />
                  <div className="toggle-switch-dash"></div>
                </label>
              </div>
              <div className="dash-card-body">
                <span className="dash-card-label">CURRENT ATTENDANCE</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span className="dash-card-value">{attendancePct}%</span>
                  <span className="dash-card-subtext">({stats.checkedInCount} guests)</span>
                </div>
              </div>
            </div>

            <div className="dash-stat-card">
              <div className="dash-card-header">
                <div className="dash-card-icon vip-icon">⭐</div>
                <span className="dash-pulse-dot"></span>
              </div>
              <div className="dash-card-body">
                <span className="dash-card-label">VIPS ON-SITE</span>
                <span className="dash-card-value">{stats.vipCheckedInCount}<span style={{ fontSize: '1.2rem', color: '#94a3b8', fontWeight: '500' }}> / {stats.vipTotalCount}</span></span>
              </div>
            </div>

            <div className="dash-stat-card">
              <div className="dash-card-header">
                <div className="dash-card-icon flow-rate">⚡</div>
                <span className="dash-realtime-badge">Rate</span>
              </div>
              <div className="dash-card-body">
                <span className="dash-card-label">PEAK FLOW RATE</span>
                <span className="dash-card-value">
                  {stats.checkedInCount > 0 ? Math.min(25, Math.ceil(stats.checkedInCount / 8)) : 0}
                  <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: '600', marginLeft: '0.25rem' }}>p/min</span>
                </span>
              </div>
            </div>
          </div>

          <div className="dashboard-content-split">
            <div className="dashboard-column-left">
              <div className="dashboard-panel-card">
                <div className="panel-card-header">
                  <h3 className="panel-title">Live QR Scanner</h3>
                  <span className="scanner-status-badge active">
                    <span className="status-badge-dot"></span>
                    Active
                  </span>
                </div>
                
                <div className="scanner-viewport-container">
                  <div className={`scanner-viewport ${scannerActive ? 'scanning' : ''}`}>
                    <div className="scanner-laser-line"></div>
                    <div className="scanner-target-box"></div>
                    {scannerActive && <div className="scanner-overlay-text">Accessing database...</div>}
                  </div>
                </div>

                <div className="scanner-actions">
                  <button
                    type="button"
                    className="btn-rescan-qr"
                    onClick={handleRescanQRCode}
                    disabled={scannerActive}
                  >
                    <span>📷</span> {scannerActive ? 'Scanning...' : 'Rescan QR Code'}
                  </button>
                  <button
                    type="button"
                    className="btn-manual-checkin"
                    onClick={handleManualCheckin}
                  >
                    <span>⌨️</span> Manual Check-in
                  </button>
                </div>
              </div>

              <div className="dashboard-panel-card" style={{ marginTop: '1.5rem' }}>
                <div className="panel-card-header">
                  <h3 className="panel-title">VIP Arrival Alerts</h3>
                </div>
                <div className="vip-alerts-list">
                  {dashboardAlerts.length === 0 ? (
                    <div style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                      No VIPs checked in yet.
                    </div>
                  ) : (
                    dashboardAlerts.map(alert => {
                      const vipBadge = getVipBadgeDetails(alert);
                      return (
                        <div key={alert.id} className="vip-alert-item">
                          <div className="vip-alert-left">
                            <div className={`vip-alert-icon-circle ${vipBadge.badgeClass}`}>
                              <span>👤</span>
                            </div>
                            <div className="vip-alert-details">
                              <div className="vip-alert-name-row">
                                <span className="vip-alert-name">{alert.name}</span>
                                <span className={`vip-alert-badge ${vipBadge.badgeClass}`}>{vipBadge.type}</span>
                              </div>
                              <span className="vip-alert-loc">{alert.checkinEntrance || 'VIP Lounge'}</span>
                            </div>
                          </div>
                          <span className="vip-alert-time">{timeAgo(alert.checkinTime)}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="dashboard-column-right">
              <div className="dashboard-panel-card">
                <div className="panel-card-header" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <h3 className="panel-title">Check-in Trend</h3>
                    <p className="panel-subtitle">Velocity tracking for peak management</p>
                  </div>
                  <div className="trend-toggle-buttons">
                    <button
                      type="button"
                      className={`trend-toggle-btn ${trendView === 'hourly' ? 'active' : ''}`}
                      onClick={() => setTrendView('hourly')}
                    >
                      Hourly
                    </button>
                    <button
                      type="button"
                      className={`trend-toggle-btn ${trendView === 'realtime' ? 'active' : ''}`}
                      onClick={() => setTrendView('realtime')}
                    >
                      Real-time
                    </button>
                  </div>
                </div>

                <div className="trend-chart-container">
                  <div className="trend-bars-wrapper">
                    {[30, 45, 60, 85, 100, 90, 55, 35].map((val, idx) => (
                      <div key={idx} className="trend-bar-column">
                        <div className="trend-bar-hover-val">{val}%</div>
                        <div
                          className="trend-bar"
                          style={{
                            height: `${val}%`,
                            background: 'linear-gradient(to top, rgba(255, 122, 69, 0.4) 0%, rgba(255, 77, 79, 0.8) 100%)'
                          }}
                        ></div>
                        <span className="trend-bar-label">{13 + idx}:00</span>
                      </div>
                    ))}
                  </div>

                  <div className="capacity-gauge-box">
                    <div className="gauge-circular-progress">
                      <svg className="gauge-svg" viewBox="0 0 100 100">
                        <circle className="gauge-track" cx="50" cy="50" r="42" />
                        <circle
                          className="gauge-fill"
                          cx="50"
                          cy="50"
                          r="42"
                          style={{ strokeDashoffset: radialDashoffset }}
                        />
                      </svg>
                      <div className="gauge-text-overlay">
                        <span className="gauge-pct">{attendancePct}%</span>
                        <span className="gauge-lbl">CAPACITY</span>
                      </div>
                    </div>
                    <span className="gauge-completion-est">Estimated completion<br />by 20:30</span>
                  </div>
                </div>
              </div>

              <div className="entrance-summary-row" style={{ marginTop: '1.5rem' }}>
                <div className="entrance-summary-card">
                  <div className="entrance-header">
                    <span className="entrance-icon blue">🚧</span>
                    <span className="entrance-name">NORTH GATE</span>
                  </div>
                  <div className="entrance-body">
                    <span className="entrance-count">{stats.gates.northGate}</span>
                    <span className="entrance-status clear">Clear Flow</span>
                  </div>
                </div>

                <div className="entrance-summary-card">
                  <div className="entrance-header">
                    <span className="entrance-icon red">🚧</span>
                    <span className="entrance-name">MAIN BALLROOM</span>
                  </div>
                  <div className="entrance-body">
                    <span className="entrance-count">{stats.gates.mainBallroom}</span>
                    <span className="entrance-status warning">Queuing</span>
                  </div>
                </div>

                <div className="entrance-summary-card">
                  <div className="entrance-header">
                    <span className="entrance-icon green">🍹</span>
                    <span className="entrance-name">VIP LOUNGE</span>
                  </div>
                  <div className="entrance-body">
                    <span className="entrance-count">{stats.gates.vipLounge}</span>
                    <span className="entrance-status clear">Fast Lane</span>
                  </div>
                </div>
              </div>

              <div className="dashboard-panel-card" style={{ marginTop: '1.5rem' }}>
                <div className="panel-card-header">
                  <h3 className="panel-title">Recent Check-ins</h3>
                  <span
                    className="view-logs-link"
                    onClick={() => {
                      setDashboardTab('history');
                      triggerToast('Loading full history logs...');
                    }}
                  >
                    View All Logs
                  </span>
                </div>

                <div className="recent-checkins-table-wrap">
                  <table className="recent-checkins-table">
                    <thead>
                      <tr>
                        <th>GUEST NAME</th>
                        <th>CHECK-IN TIME</th>
                        <th>ENTRANCE</th>
                        <th>STATUS</th>
                        <th style={{ textAlign: 'center' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentCheckins.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>
                            No matching check-ins in database.
                          </td>
                        </tr>
                      ) : (
                        recentCheckins.map(checkin => (
                          <tr key={checkin.id}>
                            <td>
                              <div className="checkin-guest-cell">
                                <div className="checkin-guest-avatar">
                                  {getInitials(checkin.name)}
                                </div>
                                <span className="checkin-guest-name">{checkin.name}</span>
                              </div>
                            </td>
                            <td className="checkin-time-cell">{formatTime(checkin.checkinTime)}</td>
                            <td className="checkin-entrance-cell">{checkin.checkinEntrance || 'Main Entrance'}</td>
                            <td>
                              <span className={`checkin-status-badge ${checkin.checkinStatus ? checkin.checkinStatus.toLowerCase() : 'success'}`}>
                                {checkin.checkinStatus || 'SUCCESS'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {checkin.checkinStatus === 'FLAGGED' ? (
                                <button
                                  type="button"
                                  className="btn-review-flagged"
                                  onClick={() => handleReviewFlagged(checkin.id, checkin.name)}
                                >
                                  Review
                                </button>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>—</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {dashboardTab === 'live' && (
        <div className="tab-placeholder-card">
          <h4>Live View Camera Streams</h4>
          <p>Live security camera feeds and gate turnstile scans are simulated here. Integration status is normal.</p>
          <div className="live-camera-grid">
            <div className="camera-feed-box">
              <div className="camera-feed-name">North Gate Turnstile</div>
              <div className="camera-status-dot green"></div>
            </div>
            <div className="camera-feed-box">
              <div className="camera-feed-name">Main Ballroom Entrance</div>
              <div className="camera-status-dot green"></div>
            </div>
          </div>
        </div>
      )}

      {dashboardTab === 'history' && (
        <div className="tab-placeholder-card">
          <h4>Full Check-in History Logs</h4>
          <p>Displaying all past scans. Showing {stats.checkedInCount} items.</p>
          <table className="recent-checkins-table" style={{ marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>GUEST NAME</th>
                <th>CHECK-IN TIME</th>
                <th>ENTRANCE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recentCheckins.map(checkin => (
                <tr key={checkin.id}>
                  <td>{checkin.name}</td>
                  <td>{formatTime(checkin.checkinTime)}</td>
                  <td>{checkin.checkinEntrance || 'Main Ballroom'}</td>
                  <td>
                    <span className={`checkin-status-badge ${checkin.checkinStatus ? checkin.checkinStatus.toLowerCase() : 'success'}`}>
                      {checkin.checkinStatus || 'SUCCESS'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dashboardTab === 'staff' && (
        <div className="tab-placeholder-card">
          <h4>Staff Assignments</h4>
          <p>Current concierge and scanning staff on duty:</p>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', lineHeight: '1.8' }}>
            <li><strong>Agent Smith</strong> - Grand Ballroom Gate</li>
            <li><strong>Agent Peterson</strong> - North Gate</li>
            <li><strong>Agent Henderson</strong> - VIP Lounge Concierge</li>
          </ul>
        </div>
      )}
    </div>
  );
}
