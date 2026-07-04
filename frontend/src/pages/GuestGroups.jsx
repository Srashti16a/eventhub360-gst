import React, { useState, useMemo, useEffect } from 'react';
import './GuestGroups.css';
import GroupStatCards from '../components/GuestGroups/GroupStatCards';
import GroupTable from '../components/GuestGroups/GroupTable';
import GroupDetailDrawer from '../components/GuestGroups/GroupDetailDrawer';
import GroupModal from '../components/GuestGroups/GroupModal';
import GuestForm from '../components/GuestManagement/GuestForm';

export default function GuestGroups() {
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [savingMember, setSavingMember] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const fetchGroups = () => {
    fetch('/api/groups')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          const mapped = res.data.map((group) => {
            const members = group.members || [];
            const primaryGuest = members.find((m) => m.id === group.primaryGuestId) || members[0];
            const allergyCount = members.filter((g) => g.isVip).length;

            return {
              ...group,
              group_id: group.id,
              members,
              membersCount: members.length,
              primaryGuestName: primaryGuest ? primaryGuest.name : 'Unassigned',
              primaryGuestAvatar: primaryGuest ? primaryGuest.avatar : null,
              dietaryNeeds: `${allergyCount} Allergies`,
              location: group.location || 'New York, USA',
              transportation: group.transportation || 'Private Fleet'
            };
          });
          setGroups(mapped);
        }
      })
      .catch((err) => console.error('Error fetching groups:', err));
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const stats = useMemo(() => {
    const totalCount = groups.length;
    const activeCount = groups.filter((g) => g.status === 'Active').length;
    const vipCount = groups.filter((g) => g.category === 'Family').length;
    
    // Average group size
    const totalMembers = groups.reduce((acc, g) => acc + g.membersCount, 0);
    const avgSize = totalCount > 0 ? (totalMembers / totalCount) : 0;

    return {
      total: totalCount,
      active: activeCount,
      vip: vipCount,
      avgSize: parseFloat(avgSize.toFixed(1))
    };
  }, [groups]);

  const filteredGroups = useMemo(() => {
    let result = [...groups];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.primaryGuestName.toLowerCase().includes(q)
      );
    }

    return result;
  }, [groups, searchQuery]);

  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredGroups.slice(start, start + itemsPerPage);
  }, [filteredGroups, currentPage]);

  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);

  const selectedGroup = useMemo(() => {
    return groups.find((g) => g.group_id === selectedGroupId) || null;
  }, [groups, selectedGroupId]);

  const handleSelectGroup = (group) => {
    setSelectedGroupId(selectedGroupId === group.group_id ? null : group.group_id);
  };

  const handleSaveGroup = (formData) => {
    const isEdit = !!editingGroup;
    const url = isEdit ? `/api/groups/${editingGroup.id}` : '/api/groups';
    const method = isEdit ? 'PUT' : 'POST';

    if (!formData.name || !formData.name.trim()) {
      alert("Group name is required");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      status: formData.status,
      location: formData.location || '',
      transportation: formData.transportation || '',
      specialRequirement: formData.specialRequirement || '',
      primaryGuestId: isEdit ? (formData.primaryGuestId || null) : null
    };

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          fetchGroups();
          setIsAddEditOpen(false);
          setEditingGroup(null);
        } else {
          alert('Error: ' + (res.error?.message || 'Failed to save group details'));
        }
      })
      .catch((err) => console.error('Error saving group:', err));
  };

  const handleEditClick = (group) => {
    setEditingGroup(group);
    setIsAddEditOpen(true);
  };

  const handleDeleteGroup = (groupId) => {
    if (window.confirm('Are you sure you want to delete this guest cohort?')) {
      fetch(`/api/groups/${groupId}`, { method: 'DELETE' })
        .then((r) => r.json())
        .then((res) => {
          if (res.success) {
            fetchGroups();
            if (selectedGroupId === groupId) {
              setSelectedGroupId(null);
            }
          } else {
            alert('Error: ' + (res.error?.message || 'Failed to delete group'));
          }
        })
        .catch((err) => console.error('Error deleting group:', err));
    }
  };

  const handleAddMember = (groupId, guestId) => {
    fetch(`/api/groups/${groupId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestId })
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          fetchGroups();
        } else {
          alert('Error: ' + (res.error?.message || 'Failed to add member'));
        }
      })
      .catch((err) => console.error('Error adding member:', err));
  };

  const handleRemoveMember = (groupId, guestId) => {
    fetch(`/api/groups/${groupId}/members/${guestId}`, { method: 'DELETE' })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          fetchGroups();
        } else {
          alert('Error: ' + (res.error?.message || 'Failed to remove member'));
        }
      })
      .catch((err) => console.error('Error removing member:', err));
  };

  const handleEditMemberClick = (member) => {
    setEditingMember(member);
  };

  const handleSaveMember = (formData) => {
    setSavingMember(true);
    fetch('/api/events')
      .then((r) => r.json())
      .then((resEvents) => {
        let eventId = '';
        if (resEvents.success && resEvents.data.length > 0) {
          const match = resEvents.data.find((e) => e.category === formData.eventName);
          eventId = match ? match.id : resEvents.data[0].id;
        }

        fetch('/api/hotels')
          .then((r) => r.json())
          .then((resHotels) => {
            let assignedHotelId = null;
            if (resHotels.success && formData.assignedHotel && formData.assignedHotel !== '—') {
              const matchHotel = resHotels.data.find((h) => h.name === formData.assignedHotel);
              if (matchHotel) assignedHotelId = matchHotel.id;
            }

            const payload = {
              name: formData.name.trim(),
              phone: formData.phone.trim(),
              email: formData.email.trim(),
              status: formData.rsvpStatus.toUpperCase(),
              isVip: formData.category === 'VIP',
              isSpeaker: formData.groupName?.toLowerCase() === 'speakers',
              isBridalParty: formData.category === 'Family',
              isPrimaryGuest: formData.groupName?.toLowerCase() === 'primary guest',
              eventId,
              assignedHotelId,
              tableId: null,
              seatNumber: formData.seat_no ? parseInt(formData.seat_no) : null
            };

            fetch(`/api/guests/${editingMember.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            })
              .then((r) => r.json())
              .then((guestRes) => {
                if (guestRes.success) {
                  fetchGroups();
                  setEditingMember(null);
                } else {
                  alert('Error: ' + (guestRes.error?.message || 'Failed to update member details'));
                }
              })
              .finally(() => setSavingMember(false));
          });
      })
      .catch((err) => {
        console.error('Error saving member:', err);
        setSavingMember(false);
      });
  };

  const handleExportGroups = () => {
    const headers = 'group_id,group_name,primary_guest_name,members_count,category,status,location,transportation\n';
    const rows = filteredGroups
      .map(
        (g) =>
          `"${g.group_id}","${g.name}","${g.primaryGuestName}","${g.membersCount}","${g.category}","${g.status}","${g.location}","${g.transportation}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `guest_cohorts_export_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMappedMemberData = (m) => {
    if (!m) return null;
    return {
      guest_id: m.id,
      name: m.name,
      phone: m.phone || '',
      email: m.email || '',
      category: m.isVip ? 'VIP' : (m.isBridalParty ? 'Family' : 'Corporate'),
      groupName: m.isSpeaker ? 'Speakers' : (m.isBridalParty ? 'Bridal Party' : (m.isPrimaryGuest ? 'Primary Guest' : '')),
      eventName: m.event?.category || 'Corporate Gala',
      rsvpStatus: m.status ? m.status.toLowerCase() : 'pending',
      table_no: m.table ? m.table.name : '',
      seat_no: m.seatNumber ? m.seatNumber.toString() : '',
      assignedHotel: m.assignedHotel ? m.assignedHotel.name : ''
    };
  };

  return (
    <div className="groups-container">
      {/* Header section */}
      <header className="groups-header">
        <div className="groups-title-area">
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-light)', marginBottom: '0.5rem' }}>
            CRM <span style={{ margin: '0 0.35rem', color: 'var(--text-light)' }}>&gt;</span> <span style={{ color: '#ff4d4f' }}>Guest Groups</span>
          </div>
          <h1>Guest Groups</h1>
          <p>Organize and manage guest cohorts for multi-day itineraries.</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          style={{ background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => {
            setEditingGroup(null);
            setIsAddEditOpen(true);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '18px', height: '18px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span>Create Group</span>
        </button>
      </header>

      {/* Top summary stats */}
      <GroupStatCards stats={stats} />

      {/* Main split dashboard section */}
      <div className="groups-split-layout">
        {/* Left Side: Table & Filters */}
        <div className="groups-left-panel">
          <div className="groups-card-box">
            {/* Action/Filter header inside card */}
            <div className="groups-card-header-bar">
              <h2>Active Management</h2>
              
              <div className="groups-card-header-actions">
                {/* Global Filter Search */}
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search groups..."
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '0.45rem 0.75rem 0.45rem 2rem',
                      fontSize: '0.85rem',
                      outline: 'none',
                      width: '200px'
                    }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filter and Export buttons inside card */}
                <button type="button" className="control-btn" title="Toggle Filters" onClick={() => alert('Filter toggles clicked.')}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
                
                <button type="button" className="control-btn" title="Export cohorts CSV" onClick={handleExportGroups}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Groups active table rendering */}
            <GroupTable
              groups={paginatedGroups}
              selectedGroupId={selectedGroupId}
              onSelectGroup={handleSelectGroup}
              onEditGroup={handleEditClick}
              onDeleteGroup={handleDeleteGroup}
            />

            {/* Pagination Controls */}
            <div className="pagination-row">
              <div className="pagination-info">
                <span>Showing 1-{filteredGroups.length} of {stats.total} groups</span>
              </div>
              <div className="pagination-controls">
                <button
                  type="button"
                  className="pagination-btn"
                  style={{ width: 'auto', padding: '0 0.75rem' }}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.max(1, totalPages) }, (_, i) => (
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
                  style={{ width: 'auto', padding: '0 0.75rem' }}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Detail Drawer Card */}
        {selectedGroupId && (
          <GroupDetailDrawer
            group={selectedGroup}
            onClose={() => setSelectedGroupId(null)}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            onEditClick={handleEditClick}
            onEditMember={handleEditMemberClick}
          />
        )}
      </div>

      {/* Add / Edit Group Modal */}
      <GroupModal
        isOpen={isAddEditOpen}
        onClose={() => { setIsAddEditOpen(false); setEditingGroup(null); }}
        onSubmit={handleSaveGroup}
        initialData={editingGroup}
        allGuests={[]}
      />

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="modal-overlay" onClick={() => setEditingMember(null)}>
          <div className="modal-container" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Member details</h2>
              <button type="button" className="btn-close" onClick={() => setEditingMember(null)} aria-label="Close dialog">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <GuestForm
                initialData={getMappedMemberData(editingMember)}
                onSubmit={handleSaveMember}
                onCancel={() => setEditingMember(null)}
                saving={savingMember}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
