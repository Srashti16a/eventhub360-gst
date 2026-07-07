import React, { useState, useMemo } from 'react';
import './QRPassCenter.css';

const PASS_DATA = [
  {
    id: 1,
    name: 'Alexander Thorne',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120&h=120',
    type: 'VIP',
    status: 'Active',
    lastActivity: '2 mins ago',
    passId: 'EH-VIP-2901',
    expires: '12 Oct 2024',
    badgeText: 'VIP ACCESS GRANTED',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: 2,
    name: 'Elena Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120',
    type: 'Attendee',
    status: 'Scanned',
    lastActivity: '1 hour ago',
    passId: 'EH-ATT-3024',
    expires: '15 Oct 2024',
    badgeText: 'ATTENDEE PASS VERIFIED',
    sha256: '7c6f4948a3f89025e1a3bc84db57e6ada71a7a10cd2d8fd89b9d34ca495f543e'
  },
  {
    id: 3,
    name: 'Marcus Chen',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120',
    type: 'Staff',
    status: 'Active',
    lastActivity: 'Just now',
    passId: 'EH-STF-0842',
    expires: '10 Oct 2024',
    badgeText: 'STAFF PASS ACTIVE',
    sha256: '9a93c44db57e62a8427ae41e4649b934ca49599c149afbfa290124ca495f7823f'
  },
  {
    id: 4,
    name: 'Sophia Lang',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120&h=120',
    type: 'VIP',
    status: 'Revoked',
    lastActivity: 'Yesterday',
    passId: 'EH-VIP-9912',
    expires: '05 Oct 2024',
    badgeText: 'PASS REVOKED',
    sha256: 'f8c44298a4fbf4c8996fb92427ae41e4649b934ca495991b7852b855e3b0c12a'
  }
];

export default function QRPassCenter() {
  const [selectedPassId, setSelectedPassId] = useState(2); // Elena Rodriguez selected by default as in screenshot
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set([3])); // Marcus Chen checked by default as in screenshot

  // Filter Popover States
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState(new Set(['VIP', 'Attendee', 'Staff']));
  const [selectedStatuses, setSelectedStatuses] = useState(new Set(['Active', 'Scanned', 'Revoked']));

  const selectedPass = useMemo(() => {
    return PASS_DATA.find(p => p.id === selectedPassId) || PASS_DATA[0];
  }, [selectedPassId]);

  const filteredPasses = useMemo(() => {
    return PASS_DATA.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.passId.toLowerCase().includes(q);
      const matchType = selectedTypes.has(p.type);
      const matchStatus = selectedStatuses.has(p.status);
      return matchSearch && matchType && matchStatus;
    });
  }, [searchQuery, selectedTypes, selectedStatuses]);

  const handleToggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredPasses.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelectOne = (e, id) => {
    e.stopPropagation();
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  const handleToggleFilterType = (type) => {
    const updated = new Set(selectedTypes);
    if (updated.has(type)) {
      if (updated.size > 1) updated.delete(type); // Keep at least one checked
    } else {
      updated.add(type);
    }
    setSelectedTypes(updated);
  };

  const handleToggleFilterStatus = (status) => {
    const updated = new Set(selectedStatuses);
    if (updated.has(status)) {
      if (updated.size > 1) updated.delete(status); // Keep at least one checked
    } else {
      updated.add(status);
    }
    setSelectedStatuses(updated);
  };

  const handleResetFilters = () => {
    setSelectedTypes(new Set(['VIP', 'Attendee', 'Staff']));
    setSelectedStatuses(new Set(['Active', 'Scanned', 'Revoked']));
    setSearchQuery('');
  };

  const handleBulkActions = () => {
    alert(`Executing bulk actions on ${selectedIds.size} selected passes...`);
  };

  const handleExportLogs = () => {
    alert('Exporting scanner activity logs to CSV...');
  };

  const handleGenerateBatch = () => {
    alert('Generating a new batch of QR passes...');
  };

  const handleDownload = (passName) => {
    alert(`Downloading QR pass PDF for ${passName}...`);
  };

  const handleShare = (method, passName) => {
    alert(`Sharing pass for ${passName} via ${method}...`);
  };

  return (
    <div className="qr-center-container">
      {/* Top Header Row exactly matching the layout of mockup */}
      <header className="qr-center-header">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2rem' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.65rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            QR Pass Center
          </h1>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>
            <span style={{ cursor: 'pointer' }} onClick={handleBulkActions}>Bulk Actions</span>
            <span style={{ cursor: 'pointer' }} onClick={handleExportLogs}>Export Logs</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Action icon links */}
          <span style={{ fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }} title="Notifications">🔔</span>
          <span style={{ fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }} title="Scan History">🕒</span>
          
          <button 
            type="button" 
            className="btn-qr-secondary" 
            style={{ borderRadius: '9999px', padding: '0.5rem 1.25rem', borderColor: '#ff4d4f', color: '#ff4d4f' }}
            onClick={() => alert('Opening Help Docs...')}
          >
            Help
          </button>
          
          <button 
            type="button" 
            className="btn-qr-primary" 
            style={{ borderRadius: '9999px', padding: '0.5rem 1.25rem' }}
            onClick={handleGenerateBatch}
          >
            Generate Batch
          </button>
        </div>
      </header>

      {/* Top Stat Cards */}
      <section className="qr-stats-grid">
        {/* Total Passes */}
        <div className="qr-stat-card">
          <div className="qr-card-header">
            <div className="qr-icon-wrap total" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <span className="qr-card-trend up">↗ 12%</span>
          </div>
          <div className="qr-card-body">
            <h3>Total Passes Generated</h3>
            <p className="qr-val">2,482</p>
          </div>
        </div>

        {/* Scanned / Active */}
        <div className="qr-stat-card">
          <div className="qr-card-header">
            <div className="qr-icon-wrap active" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="qr-card-trend up">↗ 8%</span>
          </div>
          <div className="qr-card-body">
            <h3>Scanned/Active</h3>
            <p className="qr-val">1,894</p>
          </div>
        </div>

        {/* Pending Delivery */}
        <div className="qr-stat-card">
          <div className="qr-card-header">
            <div className="qr-icon-wrap pending" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <span className="qr-card-trend stable">Stable</span>
          </div>
          <div className="qr-card-body">
            <h3>Pending Delivery</h3>
            <p className="qr-val">128</p>
          </div>
        </div>

        {/* Security Health */}
        <div className="qr-stat-card">
          <div className="qr-card-header">
            <div className="qr-icon-wrap health" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="qr-card-trend optimal">🛡️ Optimal</span>
          </div>
          <div className="qr-card-body">
            <h3>Security Health</h3>
            <p className="qr-val">99.9%</p>
          </div>
        </div>
      </section>

      {/* Split Layout */}
      <section className="qr-split-layout">
        {/* Left Column: Pass Registry */}
        <div className="qr-panel">
          <div className="qr-panel-header">
            <h2>Pass Registry</h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div className="qr-search-bar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input 
                  type="text" 
                  className="qr-search-input" 
                  placeholder="Search guests..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Interactive Filter Dropdown Popover */}
              <div className="qr-filter-wrapper">
                <button 
                  type="button" 
                  className="btn-qr-filter-icon" 
                  title="Filter & Reset" 
                  onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                  style={{ borderColor: isFilterMenuOpen ? '#ff4d4f' : undefined, color: isFilterMenuOpen ? '#ff4d4f' : undefined }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="4" y1="21" x2="4" y2="14" />
                    <line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" />
                    <line x1="20" y1="16" x2="20" y2="3" />
                    <line x1="1" y1="14" x2="7" y2="14" />
                    <line x1="9" y1="8" x2="15" y2="8" />
                    <line x1="17" y1="16" x2="23" y2="16" />
                  </svg>
                </button>

                {isFilterMenuOpen && (
                  <div className="qr-filter-popover">
                    {/* Pass Type Filter section */}
                    <div className="qr-filter-section">
                      <p className="qr-filter-title">Pass Type</p>
                      <div className="qr-filter-options">
                        {['VIP', 'Attendee', 'Staff'].map(type => (
                          <label key={type} className="qr-filter-option">
                            <input 
                              type="checkbox" 
                              checked={selectedTypes.has(type)}
                              onChange={() => handleToggleFilterType(type)}
                            />
                            <span>{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Status Filter section */}
                    <div className="qr-filter-section">
                      <p className="qr-filter-title">Status</p>
                      <div className="qr-filter-options">
                        {['Active', 'Scanned', 'Revoked'].map(status => (
                          <label key={status} className="qr-filter-option">
                            <input 
                              type="checkbox" 
                              checked={selectedStatuses.has(status)}
                              onChange={() => handleToggleFilterStatus(status)}
                            />
                            <span>{status}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="qr-filter-footer">
                      <button type="button" className="btn-qr-filter-link" onClick={handleResetFilters}>
                        Reset All
                      </button>
                      <button type="button" className="btn-qr-filter-link apply" onClick={() => setIsFilterMenuOpen(false)}>
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="qr-table-wrap">
            <table className="qr-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <label className="qr-checkbox-container">
                      <input 
                        type="checkbox" 
                        onChange={handleToggleSelectAll}
                        checked={selectedIds.size === filteredPasses.length && filteredPasses.length > 0}
                      />
                      <span className="qr-checkbox-custom"></span>
                    </label>
                  </th>
                  <th>Guest Name</th>
                  <th>Pass Type</th>
                  <th>Status</th>
                  <th>Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {filteredPasses.map(p => (
                  <tr 
                    key={p.id} 
                    className={selectedPassId === p.id ? 'selected' : ''}
                    onClick={() => setSelectedPassId(p.id)}
                  >
                    <td onClick={e => e.stopPropagation()}>
                      <label className="qr-checkbox-container">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(p.id)}
                          onChange={e => handleToggleSelectOne(e, p.id)}
                        />
                        <span className="qr-checkbox-custom"></span>
                      </label>
                    </td>
                    <td onClick={() => setSelectedPassId(p.id)}>
                      <div className="qr-guest-cell">
                        <img src={p.avatar} alt={p.name} className="qr-guest-avatar" />
                        <span className="qr-guest-name">{p.name}</span>
                      </div>
                    </td>
                    <td onClick={() => setSelectedPassId(p.id)}>
                      <span className={`qr-badge ${p.type.toLowerCase()}`}>
                        {p.type}
                      </span>
                    </td>
                    <td onClick={() => setSelectedPassId(p.id)}>
                      <span className={`qr-status-indicator ${p.status.toLowerCase()}`}>
                        <span className="qr-status-dot"></span>
                        {p.status}
                      </span>
                    </td>
                    <td onClick={() => setSelectedPassId(p.id)} style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '500' }}>
                      {p.lastActivity}
                    </td>
                  </tr>
                ))}
                {filteredPasses.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontWeight: 600 }}>
                      No passes found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="qr-pagination">
            <span className="qr-pagination-text">Showing {filteredPasses.length} of 2,482 guests</span>
            <div className="qr-pagination-btns">
              <button type="button" className="btn-qr-action">Previous</button>
              <button type="button" className="btn-qr-action">Next</button>
            </div>
          </div>
        </div>

        {/* Right Column: Pass Preview & Scans */}
        <div className="qr-details-panel">
          {/* Pass Preview Card */}
          <div className="pass-preview-card">
            <span className="pass-preview-title">Pass Preview</span>
            
            {/* Styled QR Code Box with dynamic color states */}
            <div className="pass-qr-frame">
              <svg className="pass-qr-code-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Outermost border positioning marks */}
                <rect x="5" y="5" width="20" height="20" stroke="#ff4d4f" strokeWidth="4" rx="2" />
                <rect x="10" y="10" width="10" height="10" fill="#ff7a45" rx="1" />
                
                <rect x="75" y="5" width="20" height="20" stroke="#ff4d4f" strokeWidth="4" rx="2" />
                <rect x="80" y="10" width="10" height="10" fill="#ff7a45" rx="1" />
                
                <rect x="5" y="75" width="20" height="20" stroke="#ff4d4f" strokeWidth="4" rx="2" />
                <rect x="10" y="80" width="10" height="10" fill="#ff7a45" rx="1" />

                {/* Simulated QR matrix codes */}
                <rect x="35" y="5" width="8" height="8" fill="#ff4d4f" rx="1" />
                <rect x="47" y="12" width="12" height="6" fill="#ff7a45" rx="1" />
                <rect x="63" y="7" width="6" height="10" fill="#ff4d4f" rx="1" />

                <rect x="5" y="35" width="8" height="8" fill="#ff4d4f" rx="1" />
                <rect x="15" y="47" width="12" height="6" fill="#ff7a45" rx="1" />
                <rect x="7" y="63" width="6" height="10" fill="#ff4d4f" rx="1" />

                {/* Center matrix details */}
                <rect x="35" y="35" width="30" height="30" fill="url(#qr-gradient)" rx="4" />
                <rect x="42" y="42" width="16" height="16" fill="#1a2230" rx="2" />
                <circle cx="50" cy="50" r="4" fill="#ff4d4f" />

                <rect x="75" y="35" width="10" height="15" fill="#ff4d4f" rx="1" />
                <rect x="88" y="45" width="7" height="12" fill="#ff7a45" rx="1" />

                <rect x="35" y="75" width="15" height="8" fill="#ff7a45" rx="1" />
                <rect x="40" y="87" width="18" height="8" fill="#ff4d4f" rx="1" />
                <rect x="75" y="75" width="20" height="20" stroke="#ff7a45" strokeWidth="2" rx="2" strokeDasharray="3 3" />
                <rect x="81" y="81" width="8" height="8" fill="#ff4d4f" rx="1" />

                <defs>
                  <linearGradient id="qr-gradient" x1="35" y1="35" x2="65" y2="65" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ff7a45" />
                    <stop offset="1" stopColor="#ff4d4f" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div 
              className="pass-preview-badge"
              style={{
                backgroundColor: selectedPass.status === 'Revoked' ? '#fee2e2' : undefined,
                color: selectedPass.status === 'Revoked' ? '#ef4444' : undefined,
                borderColor: selectedPass.status === 'Revoked' ? '#fecaca' : undefined
              }}
            >
              {selectedPass.badgeText}
            </div>

            {/* Pass preview info grid formatted to match mockup exactly */}
            <div className="pass-info-grid">
              <div className="pass-info-row-full">
                <div className="pass-info-label">Guest Name</div>
                <div className="pass-info-val">{selectedPass.name}</div>
              </div>
              <div className="pass-info-row-split">
                <div>
                  <div className="pass-info-label">Pass ID</div>
                  <div className="pass-info-val">{selectedPass.passId}</div>
                </div>
                <div>
                  <div className="pass-info-label">Expires</div>
                  <div className="pass-info-val">{selectedPass.expires}</div>
                </div>
              </div>
            </div>

            <button type="button" className="btn-download-pass" onClick={() => handleDownload(selectedPass.name)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateY(-1px)' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download Pass</span>
            </button>

            <div className="pass-share-row">
              <button type="button" className="btn-share-pass" onClick={() => handleShare('Email', selectedPass.name)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>Email</span>
              </button>
              <button type="button" className="btn-share-pass" onClick={() => handleShare('WhatsApp', selectedPass.name)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.156 5.156.003 11.5.003C14.577.001 17.476 1.2 19.65 3.37c2.176 2.174 3.37 5.073 3.37 8.151c-.003 6.344-5.156 11.5-11.5 11.5c-2.002-.001-3.973-.521-5.717-1.509L0 24zm6.27-1.834l.354.21c1.516.899 3.264 1.374 5.048 1.375c5.679 0 10.302-4.622 10.305-10.3c.001-2.75-1.066-5.334-3.003-7.273c-1.936-1.937-4.522-3.004-7.271-3.005C6.128 1.173 1.505 5.795 1.502 11.474c-.001 1.862.486 3.684 1.412 5.213l.223.365L2.14 20.25l3.32-.87.354.21z" />
                </svg>
                <span>WhatsApp</span>
              </button>
            </div>

            <div className="pass-security-footer">
              <div className="pass-security-row">
                <span className="pass-security-status">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ transform: 'translateY(-1px)' }}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <span>Security Verified</span>
                </span>
                <span className="pass-security-link" onClick={() => alert(`Verification details:\nSHA-256 Hash: ${selectedPass.sha256}`)}>Details</span>
              </div>
              <div className="pass-security-hash">
                SHA-256: {selectedPass.sha256}
              </div>
            </div>
          </div>

          {/* Recent Scans Card */}
          <div className="recent-scans-card">
            <div className="recent-scans-header">
              <h3>Recent Scans</h3>
              <span 
                style={{ fontSize: '0.9rem', cursor: 'pointer', color: '#ff4d4f' }}
                onClick={() => alert('Opening full scan histories...')}
                title="View All Histories"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </span>
            </div>
            <div className="recent-scans-list">
              <div className="recent-scan-item">
                <span className="recent-scan-title">Grand Ballroom Entrance</span>
                <span className="recent-scan-meta">Scanned by Agent Smith • 2m ago</span>
              </div>
              <div className="recent-scan-item">
                <span className="recent-scan-title">Valet Parking Zone 1</span>
                <span className="recent-scan-meta">Automatic Scanner • 14m ago</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
