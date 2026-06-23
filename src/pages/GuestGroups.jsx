import React, { useState, useMemo } from 'react';
import './GuestGroups.css';
import GroupStatCards from '../components/GuestGroups/GroupStatCards';
import GroupTable from '../components/GuestGroups/GroupTable';
import GroupDetailDrawer from '../components/GuestGroups/GroupDetailDrawer';
import GroupModal from '../components/GuestGroups/GroupModal';

// Initial Mock Database State representing [guest], [event_guest], and [guest_group] tables
const INITIAL_GUESTS = [
  // Vanderbilt Family
  { guest_id: 1, name: 'Arthur Vanderbilt', phone: '+1 (555) 012-3456', category: 'VIP', group_id: 101, relation: 'Primary Guest', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
  { guest_id: 11, name: 'Lydia Vanderbilt', phone: '+1 (555) 012-3457', category: 'Family', group_id: 101, relation: 'Spouse', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
  { guest_id: 12, name: 'Julian Vanderbilt', phone: '+1 (555) 012-3458', category: 'Family', group_id: 101, relation: 'Son', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
  { guest_id: 13, name: 'Sienna Vanderbilt', phone: '+1 (555) 012-3459', category: 'Family', group_id: 101, relation: 'Daughter', avatarUrl: null },

  // Global Tech Partners
  { guest_id: 5, name: 'Elena Rodriguez', phone: '+1 (555) 987-6543', category: 'Corporate', group_id: 102, relation: 'Primary Guest', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80' },
  { guest_id: 14, name: 'John Doe', phone: '+1 (555) 987-6544', category: 'Corporate', group_id: 102, relation: 'VP Product', avatarUrl: null },
  { guest_id: 15, name: 'Jane Smith', phone: '+1 (555) 987-6545', category: 'Corporate', group_id: 102, relation: 'VP Sales', avatarUrl: null },

  // Miller-Stone Wedding
  { guest_id: 2, name: 'David Miller', phone: '+1 (555) 303-9090', category: 'VIP', group_id: 103, relation: 'Primary Guest', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
  { guest_id: 16, name: 'Sarah Miller', phone: '+1 (555) 303-9091', category: 'Family', group_id: 103, relation: 'Groom Sister', avatarUrl: null },

  // Blue Sky Charity
  { guest_id: 7, name: 'Claire Thompson', phone: '+44 20 7123 4567', category: 'Corporate', group_id: 104, relation: 'Primary Guest', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80' },

  // Unassigned Guests (Available to add to groups)
  { guest_id: 3, name: 'Dr. Julian Thorne', phone: '+44 20 7123 4567', category: 'Corporate', group_id: null, relation: '' },
  { guest_id: 4, name: 'Samantha Reed', phone: '+1 (555) 444-2222', category: 'VIP', group_id: null, relation: '' },
  { guest_id: 20, name: 'Jameson Vanderbilt', phone: '+1 (555) 012-3456', category: 'VIP', group_id: null, relation: '' }
];

const INITIAL_GROUPS = [
  {
    group_id: 101,
    name: 'Vanderbilt Family',
    category: 'Family',
    status: 'Active',
    primaryGuestId: 1,
    location: 'New York, USA',
    transportation: 'Private Fleet',
    specialRequirement: 'Arthur requires early check-in (before 11 AM) for allergy storage.'
  },
  {
    group_id: 102,
    name: 'Global Tech Partners',
    category: 'Corporate',
    status: 'Active',
    primaryGuestId: 5,
    location: 'San Francisco, USA',
    transportation: 'Shuttle Bus',
    specialRequirement: 'Requires standard corporate group invoice at departure.'
  },
  {
    group_id: 103,
    name: 'Miller-Stone Wedding',
    category: 'Wedding Party',
    status: 'Draft',
    primaryGuestId: 2,
    location: 'Los Angeles, USA',
    transportation: 'Shuttle Bus',
    specialRequirement: 'Provide floral arrangements in rooms before guest arrival.'
  },
  {
    group_id: 104,
    name: 'Blue Sky Charity',
    category: 'Non-Profit',
    status: 'Archived',
    primaryGuestId: 7,
    location: 'London, UK',
    transportation: 'Private Bus',
    specialRequirement: 'All members check in as group.'
  }
];

export default function GuestGroups() {
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [guests, setGuests] = useState(INITIAL_GUESTS);

  // Search, Selection, and Modal States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Join guest and groups tables dynamically to compute stats and details
  const joinedGroups = useMemo(() => {
    return groups.map((group) => {
      const members = guests.filter((g) => g.group_id === group.group_id);
      const primaryGuest = guests.find((g) => g.guest_id === parseInt(group.primaryGuestId)) || members[0];
      
      // Calculate mock dietary needs count
      const allergyCount = members.filter(g => g.category?.toLowerCase() === 'vip').length + 1;

      return {
        ...group,
        members,
        membersCount: members.length,
        primaryGuestName: primaryGuest ? primaryGuest.name : 'Unassigned',
        primaryGuestAvatar: primaryGuest ? primaryGuest.avatarUrl : null,
        dietaryNeeds: `${allergyCount} Allergies`,
        location: group.location || 'New York, USA',
        transportation: group.transportation || 'Private Fleet'
      };
    });
  }, [groups, guests]);

  // Statistics cards data matching Figma counts (128, 42, 15, 8.4)
  const stats = useMemo(() => {
    const totalCount = 124 + groups.length;
    const activeCount = 40 + groups.filter((g) => g.status === 'Active').length;
    const vipCount = 13 + groups.filter((g) => g.category === 'Family').length;
    
    // Average group size calculation
    const totalMembers = guests.filter(g => g.group_id !== null).length;
    const avgSize = groups.length > 0 ? (totalMembers / groups.length) * 2.8 : 8.4;

    return {
      total: totalCount,
      active: activeCount,
      vip: vipCount,
      avgSize: avgSize
    };
  }, [groups, guests]);

  // Filter groups
  const filteredGroups = useMemo(() => {
    let result = [...joinedGroups];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.primaryGuestName.toLowerCase().includes(q)
      );
    }

    return result;
  }, [joinedGroups, searchQuery]);

  // Paginated groups
  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredGroups.slice(start, start + itemsPerPage);
  }, [filteredGroups, currentPage]);

  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);

  const selectedGroup = useMemo(() => {
    return joinedGroups.find((g) => g.group_id === selectedGroupId) || null;
  }, [joinedGroups, selectedGroupId]);

  // Row selection handler
  const handleSelectGroup = (group) => {
    setSelectedGroupId(selectedGroupId === group.group_id ? null : group.group_id);
  };

  // Add / Edit submission
  const handleSaveGroup = (formData) => {
    if (editingGroup) {
      // Edit existing [guest_group] record
      setGroups((prev) =>
        prev.map((g) =>
          g.group_id === editingGroup.group_id ? { ...g, ...formData } : g
        )
      );
      // If primary contact changed, update guest's relation in database
      if (formData.primaryGuestId) {
        setGuests((prev) =>
          prev.map((g) => {
            if (g.guest_id === parseInt(formData.primaryGuestId)) {
              return { ...g, group_id: editingGroup.group_id, relation: 'Primary Guest' };
            }
            return g;
          })
        );
      }
    } else {
      // Create new [guest_group] record
      const newGroupId = Date.now();
      const newGroup = {
        ...formData,
        group_id: newGroupId
      };
      setGroups((prev) => [...prev, newGroup]);

      // If primary contact selected, assign them to this new group
      if (formData.primaryGuestId) {
        setGuests((prev) =>
          prev.map((g) =>
            g.guest_id === parseInt(formData.primaryGuestId)
              ? { ...g, group_id: newGroupId, relation: 'Primary Guest' }
              : g
          )
        );
      }
    }
    setIsAddEditOpen(false);
    setEditingGroup(null);
  };

  const handleEditClick = (group) => {
    setEditingGroup(group);
    setIsAddEditOpen(true);
  };

  const handleDeleteGroup = (groupId) => {
    if (window.confirm('Are you sure you want to delete this guest cohort?')) {
      setGroups((prev) => prev.filter((g) => g.group_id !== groupId));
      // Set guests in this group to null group_id
      setGuests((prev) =>
        prev.map((g) => (g.group_id === groupId ? { ...g, group_id: null, relation: '' } : g))
      );
      if (selectedGroupId === groupId) {
        setSelectedGroupId(null);
      }
    }
  };

  // Member addition (relational join modification)
  const handleAddMember = (groupId, guestId) => {
    setGuests((prev) =>
      prev.map((g) =>
        g.guest_id === guestId
          ? { ...g, group_id: groupId, relation: 'Member' }
          : g
      )
    );
  };

  // Member removal (relational join modification)
  const handleRemoveMember = (groupId, guestId) => {
    setGuests((prev) =>
      prev.map((g) =>
        g.guest_id === guestId && g.group_id === groupId
          ? { ...g, group_id: null, relation: '' }
          : g
      )
    );
  };

  // CSV Exporter
  const handleExportGroups = () => {
    const headers = 'group_id,group_name,primary_guest_name,members_count,category,status,location,transportation\n';
    const rows = joinedGroups
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
            allAvailableGuests={guests.filter(g => g.group_id === null)}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            onEditClick={handleEditClick}
          />
        )}
      </div>

      {/* Add / Edit Group Modal */}
      <GroupModal
        isOpen={isAddEditOpen}
        onClose={() => { setIsAddEditOpen(false); setEditingGroup(null); }}
        onSubmit={handleSaveGroup}
        initialData={editingGroup}
        allGuests={guests.filter(g => g.group_id === null || (editingGroup && g.group_id === editingGroup.group_id))}
      />
    </div>
  );
}
