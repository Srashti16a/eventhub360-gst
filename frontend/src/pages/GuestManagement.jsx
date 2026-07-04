import React, { useState, useMemo, useEffect } from 'react';
import './GuestManagement.css';
import StatCards from '../components/GuestManagement/StatCards';
import GuestFilters from '../components/GuestManagement/GuestFilters';
import GuestTable from '../components/GuestManagement/GuestTable';
import GuestModal from '../components/GuestManagement/GuestModal';
import { BulkImportModal, QRCodeModal } from '../components/GuestManagement/ImportExportModals';

// Data mapping helper
const mapBackendGuestToFrontend = (bg, checkedInIds) => {
  let category = 'Corporate';
  if (bg.isVip) category = 'VIP';
  else if (bg.isBridalParty) category = 'Family';

  let groupName = '';
  if (bg.isSpeaker) groupName = 'Speakers';
  else if (bg.isBridalParty) groupName = 'Bridal Party';
  else if (bg.isPrimaryGuest) groupName = 'Primary Guest';

  return {
    guest_id: bg.id,
    name: bg.name,
    phone: bg.phone,
    category: category,
    email: bg.email,
    eventName: bg.event ? bg.event.category : 'Corporate Gala',
    groupName: groupName,
    invited: true,
    rsvpStatus: bg.status ? bg.status.toLowerCase() : 'pending',
    pax: bg.isVip ? 2 : 1,
    table_no: bg.table ? bg.table.name : '',
    seat_no: bg.seatNumber ? bg.seatNumber.toString() : '',
    preference: bg.isVip ? 'Non-veg' : 'Veg',
    assignedHotel: bg.assignedHotel ? bg.assignedHotel.name : '—',
    checkedInAt: checkedInIds.has(bg.id) ? new Date().toISOString() : null,
    qr_code: `QR_${bg.id}`
  };
};

export default function GuestManagement() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [dbStats, setDbStats] = useState({ total: 0, confirmed: 0, pending: 0, vip: 0 });
  const [meta, setMeta] = useState({ totalGuests: 0, page: 1, limit: 4, totalPages: 1 });
  const [checkedInIds, setCheckedInIds] = useState(new Set());

  // Database lists for mapping relation fields in forms
  const [dbEvents, setDbEvents] = useState([]);
  const [dbHotels, setDbHotels] = useState([]);
  const [dbTables, setDbTables] = useState([]);

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

  // Delete Confirmation Modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [pendingDeleteName, setPendingDeleteName] = useState('');
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  // Load relation dropdown data once on mount
  useEffect(() => {
    fetch('/api/events').then(r => r.json()).then(res => { if (res.success) setDbEvents(res.data); });
    fetch('/api/hotels').then(r => r.json()).then(res => { if (res.success) setDbHotels(res.data); });
    fetch('/api/seating/tables').then(r => r.json()).then(res => { if (res.success) setDbTables(res.data); });
  }, []);

  // Show toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch guests function
  const fetchGuests = () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.append('page', currentPage.toString());
    params.append('limit', itemsPerPage.toString());
    params.append('sortBy', 'name');
    params.append('sortOrder', sortAsc ? 'asc' : 'desc');

    if (searchQuery.trim()) {
      params.append('search', searchQuery);
    }
    if (selectedCategory !== 'All') {
      params.append('eventCategory', selectedCategory);
    }
    if (activeStatusTab !== 'All') {
      params.append('rsvpStatus', activeStatusTab.toUpperCase());
    }
    if (vipOnly) {
      params.append('vipOnly', 'true');
    }

    fetch(`/api/guests?${params.toString()}`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          const mapped = res.data.map(g => mapBackendGuestToFrontend(g, checkedInIds));
          setGuests(mapped);
          if (res.meta) {
            setMeta(res.meta);
          }
          setError(null);
        }
      })
      .catch(err => {
        console.error("Error fetching guests:", err);
        setError('Unable to connect to the backend server. Please ensure the server is running on port 3000.');
      })
      .finally(() => setLoading(false));
  };

  // Fetch statistics function
  const fetchStats = () => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          setDbStats({
            total: res.data.totalGuests.value,
            confirmed: res.data.confirmed.value,
            pending: res.data.pendingRsvp.value,
            vip: res.data.vipStatus.value
          });
        }
      })
      .catch(err => console.error("Error fetching stats:", err));
  };

  // Fetch data on criteria changes
  useEffect(() => {
    fetchGuests();
  }, [searchQuery, selectedCategory, activeStatusTab, vipOnly, sortAsc, currentPage, checkedInIds]);

  // Fetch stats when guests change
  useEffect(() => {
    fetchStats(); // Fetch initial statistics on mount!
    // Listen for guest updates to refresh analytics data
    const handleGuestUpdate = () => {
      fetchStats();
    };
    window.addEventListener('guest-updated', handleGuestUpdate);
    return () => {
      window.removeEventListener('guest-updated', handleGuestUpdate);
    };
  }, []);

  // Stats mapped to database stats
  const stats = {
    total: dbStats.total,
    confirmed: dbStats.confirmed,
    pending: dbStats.pending,
    vip: dbStats.vip
  };

  // Selections
  const handleSelectGuest = (guestId) => {
    setSelectedGuestIds((prev) =>
      prev.includes(guestId) ? prev.filter((id) => id !== guestId) : [...prev, guestId]
    );
  };

  const handleSelectAllGuests = (checked) => {
    if (checked) {
      setSelectedGuestIds(guests.map((g) => g.guest_id));
    } else {
      setSelectedGuestIds([]);
    }
  };

  // Save guest details (Add/Edit)
  const handleSaveGuest = (formData) => {
    // 1. Resolve Event ID
    const matchingEvent = dbEvents.find(e => e.category === formData.eventName) || dbEvents[0];
    const eventId = matchingEvent ? matchingEvent.id : null;

    if (!eventId) {
      showToast('No active events found in the database.', 'error');
      return;
    }

    // 2. Resolve Hotel ID
    const matchingHotel = dbHotels.find(h => h.name === formData.assignedHotel);
    const assignedHotelId = matchingHotel ? matchingHotel.id : null;

    // 3. Resolve Table ID & Seat
    const tableNoMatch = formData.table_no ? formData.table_no.match(/\d+/) : null;
    const tableNum = tableNoMatch ? tableNoMatch[0] : null;
    const matchingTable = tableNum ? dbTables.find(t => t.name === `Table ${tableNum}`) : null;
    const tableId = matchingTable ? matchingTable.id : null;
    const seatNumber = formData.seat_no ? parseInt(formData.seat_no) : null;

    const payload = {
      name: formData.name,
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: formData.phone,
      status: (formData.rsvpStatus === 'yes' || formData.rsvpStatus === 'confirmed') ? 'CONFIRMED' : 
              (formData.rsvpStatus === 'no' || formData.rsvpStatus === 'declined') ? 'DECLINED' : 'PENDING',
      isVip: formData.category === 'VIP',
      isSpeaker: formData.groupName?.toLowerCase() === 'speakers',
      isBridalParty: formData.category === 'Family',
      isPrimaryGuest: formData.groupName?.toLowerCase() === 'primary guest' || (!formData.groupName && formData.category === 'Corporate'),
      eventId,
      assignedHotelId,
      tableId,
      seatNumber
    };

    const isEdit = !!editingGuest;
    const url = isEdit ? `/api/guests/${editingGuest.guest_id}` : '/api/guests';
    const method = isEdit ? 'PUT' : 'POST';

    setSaving(true);
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          fetchGuests();
          fetchStats();
          setIsAddEditOpen(false);
          setEditingGuest(null);
          showToast(isEdit ? `Guest "${formData.name}" updated successfully!` : `Guest "${formData.name}" created successfully!`);
          // Notify other pages (e.g., Analytics) to refresh data
          if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new Event('guest-updated'));
          }
        } else {
          const errMsg = res.error?.details
            ? res.error.details.map(d => `${d.field}: ${d.message}`).join(', ')
            : res.error?.message || 'Validation error';
          showToast(`Error: ${errMsg}`, 'error');
        }
      })
      .catch(err => {
        console.error("Error saving guest:", err);
        showToast('Failed to connect to the backend server.', 'error');
      })
      .finally(() => setSaving(false));
  };

  const handleEditClick = (guest) => {
    setEditingGuest(guest);
    setIsAddEditOpen(true);
  };

  // Delete guest — opens confirm modal
  const handleDeleteClick = (guestId) => {
    const guest = guests.find(g => g.guest_id === guestId);
    setPendingDeleteId(guestId);
    setPendingDeleteName(guest ? guest.name : 'this guest');
    setDeleteConfirmOpen(true);
  };

  // Confirmed deletion
  const handleConfirmDelete = () => {
    if (!pendingDeleteId) return;
    const guestId = pendingDeleteId;
    const guestName = pendingDeleteName;
    setDeleteConfirmOpen(false);
    setPendingDeleteId(null);
    setPendingDeleteName('');
    fetch(`/api/guests/${guestId}`, {
      method: 'DELETE'
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          fetchGuests();
          fetchStats();
          setSelectedGuestIds(prev => prev.filter(id => id !== guestId));
          showToast(`Guest "${guestName}" deleted successfully.`);
          // Notify other pages to refresh data
          if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new Event('guest-updated'));
          }
        } else {
          showToast(`Error deleting guest: ${res.error?.message || 'Unknown error'}`, 'error');
        }
      })
      .catch(err => {
        console.error("Error deleting guest:", err);
        showToast('Failed to delete guest. Server may be unavailable.', 'error');
      });
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setPendingDeleteId(null);
    setPendingDeleteName('');
  };

  // Bulk actions operations
  const executeBulkGroup = () => {
    const groupSelect = document.getElementById('bulkGroupSelect');
    if (!groupSelect) return;
    const groupVal = groupSelect.value;
    
    const updateBody = {
      isSpeaker: groupVal === 'Speaker',
      isBridalParty: groupVal === 'BridalParty',
      isPrimaryGuest: groupVal === 'PrimaryGuest'
    };

    setLoading(true);
    Promise.all(
      selectedGuestIds.map(id =>
        fetch(`/api/guests/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateBody)
        }).then(r => r.json())
      )
    )
      .then(results => {
        fetchGuests();
        setSelectedGuestIds([]);
        showToast(`Successfully grouped ${results.filter(r => r.success).length} guest(s).`);
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new Event('guest-updated'));
        }
      })
      .catch(err => {
        console.error("Error bulk grouping:", err);
        showToast('Error grouping guests.', 'error');
      })
      .finally(() => setLoading(false));
  };

  const executeBulkAssignEvent = () => {
    const eventSelect = document.getElementById('bulkEventSelect');
    if (!eventSelect) return;
    const eventId = eventSelect.value;

    setLoading(true);
    Promise.all(
      selectedGuestIds.map(id =>
        fetch(`/api/guests/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId })
        }).then(r => r.json())
      )
    )
      .then(results => {
        fetchGuests();
        setSelectedGuestIds([]);
        showToast(`Successfully assigned ${results.filter(r => r.success).length} guest(s) to new event.`);
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new Event('guest-updated'));
        }
      })
      .catch(err => {
        console.error("Error bulk assigning event:", err);
        showToast('Error assigning event.', 'error');
      })
      .finally(() => setLoading(false));
  };

  const executeBulkUpdateRsvp = () => {
    const rsvpSelect = document.getElementById('bulkRsvpSelect');
    if (!rsvpSelect) return;
    const status = rsvpSelect.value;

    setLoading(true);
    Promise.all(
      selectedGuestIds.map(id =>
        fetch(`/api/guests/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        }).then(r => r.json())
      )
    )
      .then(results => {
        fetchGuests();
        setSelectedGuestIds([]);
        showToast(`Successfully updated RSVP status for ${results.filter(r => r.success).length} guest(s).`);
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new Event('guest-updated'));
        }
      })
      .catch(err => {
        console.error("Error bulk updating RSVP status:", err);
        showToast('Error updating RSVP status.', 'error');
      })
      .finally(() => setLoading(false));
  };

  const executeBulkSendInvitation = () => {
    showToast(`Invitations sent successfully to ${selectedGuestIds.length} guest(s).`);
    setSelectedGuestIds([]);
  };

  const handleExportSelected = () => {
    const selectedGuests = guests.filter(g => selectedGuestIds.includes(g.guest_id));
    if (selectedGuests.length === 0) {
      showToast('No selected guests found in the current view to export.', 'error');
      return;
    }

    const headers = ["Name", "Email", "Phone", "Category", "Status", "Assigned Hotel"];
    const rows = selectedGuests.map(g => [
      g.name || '',
      g.email || '',
      g.phone || '',
      g.category || '',
      g.rsvpStatus || '',
      g.assignedHotel || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `selected_guests_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${selectedGuests.length} selected guest(s) to CSV.`);
  };

  const handleConfirmBulkDelete = () => {
    setBulkDeleteConfirmOpen(false);
    setLoading(true);
    Promise.all(
      selectedGuestIds.map(id =>
        fetch(`/api/guests/${id}`, { method: 'DELETE' }).then(r => r.json())
      )
    )
      .then(results => {
        const successes = results.filter(r => r.success).length;
        const failures = results.length - successes;
        fetchGuests();
        setSelectedGuestIds([]);
        if (failures === 0) {
          showToast(`Successfully deleted ${successes} guest(s).`);
        } else {
          showToast(`Deleted ${successes} guest(s); ${failures} failed.`, 'warning');
        }
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new Event('guest-updated'));
        }
      })
      .catch(err => {
        console.error("Error executing bulk deletion:", err);
        showToast('Error executing bulk deletion.', 'error');
      })
      .finally(() => setLoading(false));
  };

  // Check-in simulator operations
  const handleCheckinGuest = (guest) => {
    setCheckedInIds(prev => {
      const next = new Set(prev);
      if (next.has(guest.guest_id)) {
        next.delete(guest.guest_id);
      } else {
        next.add(guest.guest_id);
      }
      return next;
    });
  };

  const handleQRCheckinAction = (guest, undo = false) => {
    setCheckedInIds(prev => {
      const next = new Set(prev);
      if (undo) {
        next.delete(guest.guest_id);
      } else {
        next.add(guest.guest_id);
      }
      return next;
    });
    setIsQRCodeOpen(false);
    setViewingQRCodeGuest(null);
  };

  const handleViewQRCodeClick = (guest) => {
    setViewingQRCodeGuest(guest);
    setIsQRCodeOpen(true);
  };

  // Bulk Import
  const handleImportSuccess = (importedGuests) => {
    fetchGuests();
    fetchStats();
  };

  // CSV Export
  const handleExportList = () => {
    const params = new URLSearchParams();
    params.append('limit', '10000');
    if (searchQuery.trim()) params.append('search', searchQuery);
    if (selectedCategory !== 'All') params.append('eventCategory', selectedCategory);
    if (activeStatusTab !== 'All') params.append('rsvpStatus', activeStatusTab.toUpperCase());
    if (vipOnly) params.append('vipOnly', 'true');

    window.open(`/api/guests/export?${params.toString()}`, '_blank');
  };

  // Backend paginates for us, so paginatedGuests is just guests
  const paginatedGuests = guests;
  const totalPages = meta.totalPages || 1;

  return (
    <div className="guest-mgmt-container">
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
          padding: '0.85rem 1.25rem', borderRadius: '10px',
          color: '#fff', fontWeight: 600, fontSize: '0.875rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          background: toast.type === 'error'
            ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
            : 'linear-gradient(135deg, #059669, #047857)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          animation: 'fadeInDown 0.3s ease-out',
          maxWidth: '420px'
        }}>
          <span>{toast.type === 'error' ? '✕' : '✓'}</span>
          <span>{toast.message}</span>
        </div>
      )}

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
        {/* Loading State */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '1rem' }}>
            <div style={{
              width: '40px', height: '40px', border: '3px solid #e2e8f0',
              borderTopColor: '#ff4d4f', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Loading guests from database...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeInDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#dc2626' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef2f2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#dc2626" style={{ width: '24px', height: '24px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.999L13.732 4.001c-.77-1.333-2.694-1.333-3.464 0L3.34 16.001C2.57 17.334 3.532 19 5.072 19z" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Connection Error</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '360px', margin: '0 auto 1.25rem' }}>{error}</p>
            <button type="button" className="btn-primary" onClick={fetchGuests} style={{ fontSize: '0.85rem' }}>Retry</button>
          </div>
        )}

        {/* Guest Table / Grid — only render when not loading and no error */}
        {!loading && !error && (
          <>
            {/* Bulk Actions Toolbar */}
            {selectedGuestIds.length > 0 && (
              <div className="bulk-actions-toolbar">
                <div className="bulk-selected-count">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '18px', height: '18px', color: 'var(--active-red)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span><strong>{selectedGuestIds.length}</strong> Guest{selectedGuestIds.length > 1 ? 's' : ''} Selected</span>
                </div>
                
                <div className="bulk-actions-buttons">
                  {/* Create Group */}
                  <div className="bulk-action-item">
                    <select id="bulkGroupSelect" className="bulk-select">
                      <option value="Speaker">Speaker Group</option>
                      <option value="BridalParty">Bridal Party Group</option>
                      <option value="PrimaryGuest">Primary Guest Group</option>
                    </select>
                    <button type="button" className="btn-bulk" onClick={executeBulkGroup} disabled={selectedGuestIds.length === 0}>Create Group</button>
                  </div>

                  {/* Assign to Event */}
                  <div className="bulk-action-item">
                    <select id="bulkEventSelect" className="bulk-select">
                      {dbEvents.map(e => (
                        <option key={e.id} value={e.id}>{e.category}</option>
                      ))}
                    </select>
                    <button type="button" className="btn-bulk" onClick={executeBulkAssignEvent} disabled={selectedGuestIds.length === 0}>Assign to Event</button>
                  </div>

                  {/* Update RSVP Status */}
                  <div className="bulk-action-item">
                    <select id="bulkRsvpSelect" className="bulk-select">
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PENDING">Pending</option>
                      <option value="DECLINED">Declined</option>
                    </select>
                    <button type="button" className="btn-bulk" onClick={executeBulkUpdateRsvp} disabled={selectedGuestIds.length === 0}>Update RSVP Status</button>
                  </div>

                  {/* Send Invitation */}
                  <button type="button" className="btn-bulk" onClick={executeBulkSendInvitation} disabled={selectedGuestIds.length === 0}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '14px', height: '14px', marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
                    </svg>
                    <span>Send Invitation</span>
                  </button>

                  {/* Export Selected */}
                  <button type="button" className="btn-bulk" onClick={handleExportSelected} disabled={selectedGuestIds.length === 0}>Export Selected</button>

                  {/* Delete Selected */}
                  <button type="button" className="btn-bulk danger" onClick={() => setBulkDeleteConfirmOpen(true)} disabled={selectedGuestIds.length === 0}>Delete Selected</button>

                  {/* Clear Selection */}
                  <button type="button" className="btn-bulk-text" onClick={() => setSelectedGuestIds([])}>Clear Selection</button>
                </div>
              </div>
            )}

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
          </>
        )}

        {/* Custom Table Pagination matching the Figma screen */}
        <div className="pagination-row">
          <div className="pagination-info">
            {searchQuery || selectedCategory !== 'All' || activeStatusTab !== 'All' || vipOnly ? (
              <span>Showing 1-{guests.length} of {meta.totalGuests} guests (Filtered)</span>
            ) : (
              <span>Showing 1-{guests.length} of {meta.totalGuests} guests</span>
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
            
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                type="button"
                className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

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

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '420px' }}
          >
            <div className="modal-header">
              <h2 style={{ color: '#dc2626' }}>Delete Guest Record</h2>
              <button type="button" className="btn-close" onClick={handleCancelDelete} aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: '#fef2f2', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 1.25rem'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                  stroke="#dc2626" style={{ width: '28px', height: '28px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                Are you sure?
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                You are about to permanently delete the record for{' '}
                <strong style={{ color: 'var(--text-main)' }}>{pendingDeleteName}</strong>.
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', gap: '1rem' }}>
              <button type="button" className="btn-secondary" onClick={handleCancelDelete} style={{ minWidth: '110px' }}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                id="confirm-delete-btn"
                onClick={handleConfirmDelete}
                style={{
                  minWidth: '110px',
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  boxShadow: '0 4px 12px rgba(220,38,38,0.35)'
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteConfirmOpen && (
        <div className="modal-overlay" onClick={() => setBulkDeleteConfirmOpen(false)}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '420px' }}
          >
            <div className="modal-header">
              <h2 style={{ color: '#dc2626' }}>Delete Selected Guests</h2>
              <button type="button" className="btn-close" onClick={() => setBulkDeleteConfirmOpen(false)} aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: '#fef2f2', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 1.25rem'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                  stroke="#dc2626" style={{ width: '28px', height: '28px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                Are you sure?
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                You are about to permanently delete the records for{' '}
                <strong style={{ color: 'var(--text-main)' }}>{selectedGuestIds.length} selected guest(s)</strong>.
                This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', gap: '1rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setBulkDeleteConfirmOpen(false)} style={{ minWidth: '110px' }}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                id="confirm-bulk-delete-btn"
                onClick={handleConfirmBulkDelete}
                style={{
                  minWidth: '110px',
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  boxShadow: '0 4px 12px rgba(220,38,38,0.35)'
                }}
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <GuestModal
        isOpen={isAddEditOpen}
        onClose={() => { setIsAddEditOpen(false); setEditingGuest(null); }}
        onSubmit={handleSaveGuest}
        initialData={editingGuest}
        saving={saving}
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
                Drag and drop guests below onto tables to configure the layout.
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
                <strong>Important:</strong> Emails will include unique guest QR codes for fast attendance tracking.
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
