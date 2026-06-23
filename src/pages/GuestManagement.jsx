import React, { useState, useMemo } from 'react';
import './GuestManagement.css';
import StatCards from '../components/GuestManagement/StatCards';
import GuestFilters from '../components/GuestManagement/GuestFilters';
import GuestTable from '../components/GuestManagement/GuestTable';
import GuestModal from '../components/GuestManagement/GuestModal';
import { BulkImportModal, QRCodeModal } from '../components/GuestManagement/ImportExportModals';

// Initial Mock data reflecting database relations
const INITIAL_GUESTS = [
  {
    guest_id: 1,
    name: 'Jameson Vanderbilt',
    phone: '+1 (555) 012-3456',
    category: 'VIP',
    email: 'j.vanderbilt@luxmail.com',
    eventName: 'Corporate Gala',
    groupName: 'Speakers',
    invited: true,
    rsvpStatus: 'yes', // Confirmed
    pax: 2,
    table_no: 'T1',
    seat_no: 'S1',
    preference: 'Non-veg',
    assignedHotel: 'The Ritz-Carlton',
    checkedInAt: null,
    qr_code: 'QR_VANDERBILT_1'
  },
  {
    guest_id: 2,
    name: 'Eleanor Fitzwilliam',
    phone: '+1 (555) 987-6543',
    category: 'Family',
    email: 'eleanor.f@gmail.com',
    eventName: 'Spring Wedding',
    groupName: 'Bridal Party',
    invited: true,
    rsvpStatus: 'maybe', // Pending
    pax: 1,
    table_no: 'T3',
    seat_no: 'S4',
    preference: 'Veg',
    assignedHotel: 'Boutique Manor',
    checkedInAt: null,
    qr_code: 'QR_FITZWILLIAM_2'
  },
  {
    guest_id: 3,
    name: 'Dr. Julian Thorne',
    phone: '+44 20 7123 4567',
    category: 'Corporate',
    email: 'thorne.med@hospital.org',
    eventName: 'Charity Gala',
    groupName: 'Primary Guest',
    invited: true,
    rsvpStatus: 'no', // Declined
    pax: 0,
    table_no: '',
    seat_no: '',
    preference: '',
    assignedHotel: '—',
    checkedInAt: null,
    qr_code: 'QR_THORNE_3'
  },
  {
    guest_id: 4,
    name: 'Samantha Reed',
    phone: '+1 (555) 444-2222',
    category: 'VIP',
    email: 'sam.reed@techcorp.io',
    eventName: 'Product Launch',
    groupName: 'VIP',
    invited: true,
    rsvpStatus: 'yes', // Confirmed
    pax: 1,
    table_no: 'T5',
    seat_no: 'S2',
    preference: 'Jain',
    assignedHotel: 'Hyatt Regency',
    checkedInAt: null,
    qr_code: 'QR_REED_4'
  }
];

export default function GuestManagement() {
  const [guests, setGuests] = useState(INITIAL_GUESTS);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeStatusTab, setActiveStatusTab] = useState('All');
  const [vipOnly, setVipOnly] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const [layout, setLayout] = useState('list'); // list or grid
  const [selectedGuestIds, setSelectedGuestIds] = useState([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Modals Visibility
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  
  const [isImportOpen, setIsImportOpen] = useState(false);
  
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);
  const [viewingQRCodeGuest, setViewingQRCodeGuest] = useState(null);

  const [isSeatingOpen, setIsSeatingOpen] = useState(false);
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);

  // Dynamic Dashboard Stats matching mockup baseline numbers (1248, 892, 315, 42)
  const stats = useMemo(() => {
    const totalCount = 1244 + guests.length;
    const confirmedCount = 890 + guests.filter(g => g.rsvpStatus === 'yes' || g.rsvpStatus === 'confirmed').length;
    const pendingCount = 313 + guests.filter(g => g.rsvpStatus === 'maybe' || g.rsvpStatus === 'pending').length;
    const vipCount = 40 + guests.filter(g => g.category?.toLowerCase() === 'vip').length;

    return {
      total: totalCount,
      confirmed: confirmedCount,
      pending: pendingCount,
      vip: vipCount
    };
  }, [guests]);

  // Handle Search & Filter logic
  const filteredGuests = useMemo(() => {
    let result = [...guests];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.phone.toLowerCase().includes(q) ||
          (g.email && g.email.toLowerCase().includes(q))
      );
    }

    // Category Select (maps to EventName category)
    if (selectedCategory !== 'All') {
      result = result.filter((g) => g.eventName === selectedCategory);
    }

    // Status Tab Select (maps to RSVP status)
    if (activeStatusTab !== 'All') {
      const statusMap = {
        Confirmed: 'yes',
        Pending: 'maybe',
        Declined: 'no'
      };
      result = result.filter((g) => g.rsvpStatus === statusMap[activeStatusTab]);
    }

    // VIP segment toggle
    if (vipOnly) {
      result = result.filter((g) => g.category?.toLowerCase() === 'vip');
    }

    // Sorting A-Z
    result.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return sortAsc ? -1 : 1;
      if (nameA > nameB) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [guests, searchQuery, selectedCategory, activeStatusTab, vipOnly, sortAsc]);

  // Paginated output
  const paginatedGuests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredGuests.slice(start, start + itemsPerPage);
  }, [filteredGuests, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredGuests.length / itemsPerPage));

  // Selection handlers
  const handleSelectGuest = (guestId) => {
    setSelectedGuestIds((prev) =>
      prev.includes(guestId) ? prev.filter((id) => id !== guestId) : [...prev, guestId]
    );
  };

  const handleSelectAllGuests = (checked) => {
    if (checked) {
      setSelectedGuestIds(paginatedGuests.map((g) => g.guest_id));
    } else {
      setSelectedGuestIds([]);
    }
  };

  // Add / Edit submission
  const handleSaveGuest = (formData) => {
    if (editingGuest) {
      // Modify existing guest
      setGuests((prev) =>
        prev.map((g) =>
          g.guest_id === editingGuest.guest_id ? { ...g, ...formData } : g
        )
      );
    } else {
      // Create new guest
      const newGuest = {
        ...formData,
        guest_id: Date.now(),
        qr_code: `QR_${Date.now()}`,
        checkedInAt: null
      };
      setGuests((prev) => [newGuest, ...prev]);
    }
    setIsAddEditOpen(false);
    setEditingGuest(null);
  };

  const handleEditClick = (guest) => {
    setEditingGuest(guest);
    setIsAddEditOpen(true);
  };

  const handleDeleteClick = (guestId) => {
    if (window.confirm('Are you sure you want to delete this guest record?')) {
      setGuests((prev) => prev.filter((g) => g.guest_id !== guestId));
      setSelectedGuestIds((prev) => prev.filter((id) => id !== guestId));
    }
  };

  // Check-in simulator operations
  const handleCheckinGuest = (guest) => {
    setGuests((prev) =>
      prev.map((g) =>
        g.guest_id === guest.guest_id
          ? { ...g, checkedInAt: g.checkedInAt ? null : new Date().toISOString() }
          : g
      )
    );
  };

  const handleQRCheckinAction = (guest, undo = false) => {
    setGuests((prev) =>
      prev.map((g) =>
        g.guest_id === guest.guest_id
          ? { ...g, checkedInAt: undo ? null : new Date().toISOString() }
          : g
      )
    );
    setIsQRCodeOpen(false);
    setViewingQRCodeGuest(null);
  };

  const handleViewQRCodeClick = (guest) => {
    setViewingQRCodeGuest(guest);
    setIsQRCodeOpen(true);
  };

  // Bulk Import Success Callback
  const handleImportSuccess = (importedGuests) => {
    setGuests((prev) => [...importedGuests, ...prev]);
  };

  // CSV Export simulator
  const handleExportList = () => {
    // Generate simple CSV content based on database schema structure
    const headers = 'guest_id,name,phone,category,email,invited,rsvp_status,pax,table_no,seat_no,meal_pref,hotel,checked_in\n';
    const rows = guests
      .map(
        (g) =>
          `"${g.guest_id}","${g.name}","${g.phone}","${g.category}","${g.email || ''}","${g.invited}","${g.rsvpStatus}","${g.pax}","${g.table_no || ''}","${g.seat_no || ''}","${g.preference || ''}","${g.assignedHotel || ''}","${g.checkedInAt || ''}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `guest_registry_export_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="guest-mgmt-container">
      {/* Upper Navigation & Titles */}
      <header className="guest-mgmt-header">
        <div className="guest-mgmt-title-area">
          <h1>Guest Management</h1>
          <p>Managing {stats.total.toLocaleString()} attendees across 12 active events.</p>
        </div>
        <div className="guest-mgmt-actions">
          <button type="button" className="btn-secondary" onClick={() => setIsImportOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Bulk Import</span>
          </button>
          <button type="button" className="btn-secondary" onClick={handleExportList}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export List</span>
          </button>
        </div>
      </header>

      {/* Stats Cards Section */}
      <StatCards stats={stats} />

      {/* Filter and Searching Row */}
      <GuestFilters
        searchQuery={searchQuery}
        onSearchChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
        selectedCategory={selectedCategory}
        onCategoryChange={(val) => { setSelectedCategory(val); setCurrentPage(1); }}
        activeStatusTab={activeStatusTab}
        onStatusTabChange={(val) => { setActiveStatusTab(val); setCurrentPage(1); }}
        vipOnly={vipOnly}
        onVipToggle={(val) => { setVipOnly(val); setCurrentPage(1); }}
        sortAsc={sortAsc}
        onSortToggle={() => setSortAsc(!sortAsc)}
        layout={layout}
        onLayoutChange={(lay) => setLayout(lay)}
      />

      {/* Main Table / Grid card */}
      <div className="table-card">
        <GuestTable
          guests={paginatedGuests}
          selectedGuestIds={selectedGuestIds}
          onSelectGuest={handleSelectGuest}
          onSelectAllGuests={handleSelectAllGuests}
          onEditGuest={handleEditClick}
          onDeleteGuest={handleDeleteClick}
          onCheckinGuest={handleCheckinGuest}
          onViewQRCode={handleViewQRCodeClick}
          layout={layout}
        />

        {/* Custom Table Pagination matching the Figma screen */}
        <div className="pagination-row">
          <div className="pagination-info">
            {searchQuery || selectedCategory !== 'All' || activeStatusTab !== 'All' || vipOnly ? (
              <span>Showing 1-{filteredGuests.length} of {filteredGuests.length} guests (Filtered)</span>
            ) : (
              <span>Showing 1-4 of {stats.total.toLocaleString()} guests</span>
            )}
          </div>
          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              &lt;
            </button>
            
            {/* If filtered, display actual dynamic page buttons */}
            {searchQuery || selectedCategory !== 'All' || activeStatusTab !== 'All' || vipOnly ? (
              Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  type="button"
                  className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))
            ) : (
              <>
                <button type="button" className={`pagination-btn ${currentPage === 1 ? 'active' : ''}`} onClick={() => setCurrentPage(1)}>1</button>
                <button type="button" className="pagination-btn" onClick={() => alert('Simulated pagination page 2')}>2</button>
                <button type="button" className="pagination-btn" onClick={() => alert('Simulated pagination page 3')}>3</button>
                <span className="pagination-ellipsis">...</span>
                <button type="button" className="pagination-btn" onClick={() => alert('Simulated pagination page 312')}>312</button>
              </>
            )}

            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) for rapid adding */}
      <button
        type="button"
        className="fab-btn"
        onClick={() => { setEditingGuest(null); setIsAddEditOpen(true); }}
        title="Add New Guest"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Bottom Campaign Cards */}
      <div className="lower-campaign-grid">
        {/* Email Campaign Card */}
        <div className="campaign-card email">
          <div className="campaign-info">
            <div className="campaign-title">
              <h3>Email Campaign</h3>
            </div>
            <p className="campaign-desc">
              Broadcast RSVP reminders or digital itineraries to all confirmed guests.
            </p>
            <a
              href="#email-campaign"
              className="campaign-link email"
              onClick={(e) => { e.preventDefault(); setIsCampaignOpen(true); }}
            >
              <span>Start New Campaign</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
          <div className="campaign-icon-wrapper">
            <svg className="illustration" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Seating Arranger Card */}
        <div className="campaign-card seating">
          <div className="campaign-info">
            <div className="campaign-title">
              <h3>Seating Arranger</h3>
            </div>
            <p className="campaign-desc">
              Visual table planning with drag-and-drop ease for all active events.
            </p>
            <a
              href="#seating-arranger"
              className="campaign-link seating"
              onClick={(e) => { e.preventDefault(); setIsSeatingOpen(true); }}
            >
              <span>Open Floor Plan</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
          <div className="campaign-icon-wrapper">
            <svg className="illustration" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}
      
      {/* Create / Edit Modal */}
      <GuestModal
        isOpen={isAddEditOpen}
        onClose={() => { setIsAddEditOpen(false); setEditingGuest(null); }}
        onSubmit={handleSaveGuest}
        initialData={editingGuest}
      />

      {/* CSV Bulk Import Modal */}
      <BulkImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* QR Code and Check-in Modal */}
      <QRCodeModal
        isOpen={isQRCodeOpen}
        onClose={() => { setIsQRCodeOpen(false); setViewingQRCodeGuest(null); }}
        guest={viewingQRCodeGuest}
        onSimulateCheckin={handleQRCheckinAction}
      />

      {/* Seating Arranger Floor Plan Modal */}
      {isSeatingOpen && (
        <div className="modal-overlay" onClick={() => setIsSeatingOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h2>Visual Floor Plan Arranger</h2>
              <button type="button" className="btn-close" onClick={() => setIsSeatingOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Drag and drop guests below onto tables to configure the layout. Operates on the <code>[seating]</code> table.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {['T1', 'T2', 'T3', 'T4', 'T5', 'T6'].map((tbl) => {
                  const seatedGuests = guests.filter(g => g.table_no === tbl);
                  return (
                    <div key={tbl} style={{ border: '2px dashed var(--border-hover)', borderRadius: 'var(--radius-md)', padding: '1rem', background: '#fafbfc' }}>
                      <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem', color: '#b58900' }}>Table {tbl}</strong>
                      {seatedGuests.length === 0 ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Empty Table</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {seatedGuests.map(g => (
                            <div key={g.guest_id} style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
                              {g.name} <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>({g.seat_no})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.725rem', color: 'var(--text-muted)', textAlign: 'left' }}>
                <strong>API Endpoint Schema:</strong>
                <code style={{ display: 'block', marginTop: '0.25rem', color: '#a61e22', fontFamily: 'monospace' }}>
                  PATCH /api/v1/seating/&#123;id&#125; (Payload: &#123; table_no: string, seat_no: string &#125;)
                </code>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-primary" onClick={() => setIsSeatingOpen(false)}>
                Save Arrangements
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Campaign Modal */}
      {isCampaignOpen && (
        <div className="modal-overlay" onClick={() => setIsCampaignOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Launch Email Campaign</h2>
              <button type="button" className="btn-close" onClick={() => setIsCampaignOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                You are about to launch an RSVP verification or itinerary broadcast campaign.
              </p>

              <div className="form-group">
                <label>Target Audience</label>
                <select className="form-input" defaultValue="confirmed">
                  <option value="confirmed">RSVP Status: Confirmed ({guests.filter(g => g.rsvpStatus === 'yes').length} guests)</option>
                  <option value="pending">RSVP Status: Pending ({guests.filter(g => g.rsvpStatus === 'maybe').length} guests)</option>
                  <option value="all">All RSVP States ({guests.length} guests)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Email Template</label>
                <select className="form-input" defaultValue="rsvp_reminder">
                  <option value="rsvp_reminder">RSVP Confirmation & Check-in QR Code</option>
                  <option value="itinerary">Digital Itinerary & Seating Info</option>
                  <option value="thank_you">Post-Event Thank You & Feedback Link</option>
                </select>
              </div>

              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
                <strong>Important:</strong> Emails will include unique guest QR codes linked to the <code>guest_checkin.qr_code</code> table column.
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setIsCampaignOpen(false)}>Cancel</button>
              <button type="button" className="btn-primary" onClick={() => { alert('Campaign Broadcast initiated successfully!'); setIsCampaignOpen(false); }}>
                Launch Broadcast
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
