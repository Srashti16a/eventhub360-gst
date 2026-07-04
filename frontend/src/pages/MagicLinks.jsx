import React, { useState, useMemo, useEffect } from 'react';
import './MagicLinks.css';

// Mock Guest Database for Link Generation
const MOCK_GUEST_DATABASE = [
  { guest_id: 101, name: 'Arthur Vanderbilt', category: 'VIP Host', avatarColor: '#ff4d4f' },
  { guest_id: 102, name: 'Jameson Vanderbilt', category: 'VIP', avatarColor: '#7c3aed' },
  { guest_id: 103, name: 'Lydia Vanderbilt', category: 'Family Member', avatarColor: '#db2777' },
  { guest_id: 104, name: 'Eleanor Fitzwilliam', category: 'Family', avatarColor: '#059669' },
  { guest_id: 105, name: 'Dr. Julian Thorne', category: 'Corporate', avatarColor: '#2563eb' },
  { guest_id: 106, name: 'Samantha Reed', category: 'VIP Partner', avatarColor: '#7c3aed' },
  { guest_id: 107, name: 'Elena Rodriguez', category: 'Keynote Speaker', avatarColor: '#d97706' },
  { guest_id: 108, name: 'Marcus Wright', category: 'VIP Corporate', avatarColor: '#b45309' },
  { guest_id: 109, name: 'Julianne Smith', category: 'Premium Guest', avatarColor: '#db2777' },
  { guest_id: 110, name: 'Elena Lopez', category: 'General Admission', avatarColor: '#4b5563' }
];

// Initial Active Magic Links list
const INITIAL_LINKS = [
  {
    id: 'ml_1',
    guestId: 109,
    guestName: 'Julianne Smith',
    category: 'Premium Guest',
    avatarColor: '#ff7a45',
    linkUrl: 'event.hub/ml/8f9b2d8c',
    createdDate: 'Oct 24, 2023',
    expiryDate: 'Nov 01, 2023',
    status: 'Active', // Active, Expiring Soon, Expired
    uses: 12
  },
  {
    id: 'ml_2',
    guestId: 108,
    guestName: 'Marcus Wright',
    category: 'VIP Corporate',
    avatarColor: '#b45309',
    linkUrl: 'event.hub/ml/3x2a5f1d',
    createdDate: 'Oct 25, 2023',
    expiryDate: 'Oct 26, 2023',
    status: 'Expiring Soon',
    uses: 8
  },
  {
    id: 'ml_3',
    guestId: 110,
    guestName: 'Elena Lopez',
    category: 'General Admission',
    avatarColor: '#4b5563',
    linkUrl: 'event.hub/ml/9p4e8r7t',
    createdDate: 'Oct 10, 2023',
    expiryDate: 'Oct 11, 2023',
    status: 'Expired',
    uses: 0
  }
];

export default function MagicLinks() {
  const [activeLinks, setActiveLinks] = useState(() => {
    try {
      const saved = localStorage.getItem('magicLinks');
      return saved ? JSON.parse(saved) : INITIAL_LINKS;
    } catch (error) {
      console.error('Error loading magic links from localStorage:', error);
      return INITIAL_LINKS;
    }
  });
  // Persist activeLinks to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('magicLinks', JSON.stringify(activeLinks));
    } catch (error) {
      console.error('Error saving magic links to localStorage:', error);
    }
  }, [activeLinks]);

  const [searchQuery, setSearchQuery] = useState('');

  // Selection/Generation States
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [guestSearch, setGuestSearch] = useState('');
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
  const [registeredGuests, setRegisteredGuests] = useState([]);
  const [hasLoadedGuests, setHasLoadedGuests] = useState(false);

  const [expirationSettings, setExpirationSettings] = useState('7_days'); // '24_hours', '7_days', '30_days', 'no_expiration'
  const [singleUse, setSingleUse] = useState(false);
  const [ipLockdown, setIpLockdown] = useState(true);

  const [generatedLink, setGeneratedLink] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Filters on active links table
  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Active', 'Expiring Soon', 'Expired'
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Selection and deletion states
  const [selectedLinks, setSelectedLinks] = useState(new Set());
  // Bulk action dialogs visibility
  const [showExpireSelectedDialog, setShowExpireSelectedDialog] = useState(false);
  const [showReactivateSelectedDialog, setShowReactivateSelectedDialog] = useState(false);
  const [deleteSingleId, setDeleteSingleId] = useState(null);
  const [showDeleteSelectedDialog, setShowDeleteSelectedDialog] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  // Bulk Generate modal state
  const [showBulkGenerateDialog, setShowBulkGenerateDialog] = useState(false);
  const [bulkSearch, setBulkSearch] = useState('');
  const [bulkSelectedGuestIds, setBulkSelectedGuestIds] = useState(new Set());

  // Trigger temporary visual feedback toasts
  const triggerToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  useEffect(() => {
    loadGuestsData();
  }, []);

  const loadGuestsData = () => {
    fetch('/api/guests?limit=1000')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.data)) {
          const mappedGuests = data.data.map(g => ({
            guest_id: g.id || g.guest_id,
            name: g.name || g.guest_name || '',
            category: g.isVip
              ? 'VIP'
              : g.isBridalParty
                ? 'Family'
                : 'Corporate',
            avatarColor: g.avatarColor || '#4b5563'
          }));
          setRegisteredGuests(mappedGuests);
          setHasLoadedGuests(true);
        }
      })
      .catch(() => {
        setHasLoadedGuests(true);
      });
  };

  const handleGuestSearchFocus = () => {
    loadGuestsData();
    setIsGuestDropdownOpen(false);
  };

  // Filter guest options from database based on user typing
  const filteredGuestOptions = useMemo(() => {
    if (!guestSearch.trim()) return [];

    const q = guestSearch.toLowerCase();

    const result = registeredGuests.filter(g =>
      (g.name || "").toLowerCase().includes(q) ||
      (g.category || "").toLowerCase().includes(q)
    );

    console.log("Filtered Guests:", result);

    return result;
  }, [guestSearch, registeredGuests]);

  // Compute Expiry Date string based on selection
  const getExpiryDateString = (setting) => {
    const d = new Date();
    if (setting === '24_hours') {
      d.setDate(d.getDate() + 1);
    } else if (setting === '7_days') {
      d.setDate(d.getDate() + 7);
    } else if (setting === '30_days') {
      d.setDate(d.getDate() + 30);
    } else {
      return 'No Expiration';
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  // Generate a random link code
  const handleCreateMagicLink = () => {
    if (!selectedGuest) {
      triggerToast('Please select a guest first.');
      return;
    }

    // Check if a link already exists for this guest
    const linkCode = Math.random().toString(16).substring(2, 10);
    const newLinkUrl = `event.hub/ml/${linkCode}`;

    const newLink = {
      id: `ml_${Date.now()}`,
      guestId: selectedGuest.guest_id,
      guestName: selectedGuest.name,
      category: selectedGuest.category,
      avatarColor: selectedGuest.avatarColor || '#4b5563',
      linkUrl: newLinkUrl,
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      expiryDate: getExpiryDateString(expirationSettings),
      status: expirationSettings === '24_hours' || expirationSettings === '7_days' ? 'Active' : (expirationSettings === 'no_expiration' ? 'Active' : 'Active'),
      uses: 0
    };

    // If expiration settings is 24 hours, let's keep status Active, if expired, Expired, etc.
    setActiveLinks(prev => [newLink, ...prev]);
    setGeneratedLink(newLinkUrl);
    triggerToast(`Magic link generated for ${selectedGuest.name}!`);
  };

  // Handle Bulk Generate (simulation)
  const handleBulkGenerate = () => {
    const unlinkedGuests = registeredGuests.filter(g =>
      !activeLinks.some(link => link.guestId === g.guest_id)
    );

    if (unlinkedGuests.length === 0) {
      triggerToast('All registered guests already have active magic links.');
      return;
    }

    const newGenerated = unlinkedGuests.map((guest, idx) => {
      const code = Math.random().toString(16).substring(2, 10);
      return {
        id: `ml_bulk_${Date.now()}_${idx}`,
        guestId: guest.guest_id,
        guestName: guest.name,
        category: guest.category,
        avatarColor: guest.avatarColor,
        linkUrl: `event.hub/ml/${code}`,
        createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        expiryDate: getExpiryDateString(expirationSettings),
        status: 'Active',
        uses: 0
      };
    });

    setActiveLinks(prev => [...newGenerated, ...prev]);
    triggerToast(`Successfully bulk generated ${newGenerated.length} magic links!`);
  };

  // Copy helper
  const handleCopyLinkText = (text) => {
    if (!text) {
      triggerToast('No link generated to copy. Create one first.');
      return;
    }
    navigator.clipboard.writeText(text);
    triggerToast('Link copied to clipboard!');
  };

  // Renew link row handler (+7 days)
  const handleRenewLink = (id) => {
    setActiveLinks(prev => prev.map(link => {
      if (link.id === id) {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        const newExpiry = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        return {
          ...link,
          expiryDate: newExpiry,
          status: 'Active'
        };
      }
      return link;
    }));
    triggerToast('Magic link expiry extended by 7 days.');
  };

  // Revoke link row handler (set status to Expired)
  const handleRevokeLink = (id) => {
    setActiveLinks(prev => prev.map(link => {
      if (link.id === id) {
        return {
          ...link,
          status: 'Expired',
          expiryDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        };
      }
      return link;
    }));
    triggerToast('Magic link has been revoked/deactivated.');
  };

  // Bulk Expire handler (set selected links to Expired)
  const handleExpireSelected = () => {
    setActiveLinks(prev => prev.map(link => {
      if (selectedLinks.has(link.id)) {
        return {
          ...link,
          status: 'Expired',
          expiryDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        };
      }
      return link;
    }));
    triggerToast(`${selectedLinks.size} magic link(s) expired.`);
    setSelectedLinks(new Set());
    setShowExpireSelectedDialog(false);
  };

  // Bulk Reactivate handler (set selected links to Active)
  const handleReactivateSelected = () => {
    setActiveLinks(prev => prev.map(link => {
      if (selectedLinks.has(link.id)) {
        return { ...link, status: 'Active' };
      }
      return link;
    }));
    triggerToast(`${selectedLinks.size} magic link(s) reactivated.`);
    setSelectedLinks(new Set());
    setShowReactivateSelectedDialog(false);
  };

  // Delete single link handler
  const handleDeleteLink = (id) => {
    setActiveLinks(prev => prev.filter(link => link.id !== id));
    setDeleteSingleId(null);
    triggerToast('Magic link deleted.');
  };

  // Selection handlers
  const handleSelectLink = (id) => {
    setSelectedLinks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedLinks.size === filteredActiveLinks.length) {
      setSelectedLinks(new Set());
    } else {
      setSelectedLinks(new Set(filteredActiveLinks.map(link => link.id)));
    }
  };

  // Delete selected links handler
  const handleDeleteSelected = () => {
    setActiveLinks(prev => prev.filter(link => !selectedLinks.has(link.id)));
    setSelectedLinks(new Set());
    setShowDeleteSelectedDialog(false);
    triggerToast(`${selectedLinks.size} magic link(s) deleted.`);
  };
  // Open Bulk Generate modal
  const openBulkGenerateModal = () => setShowBulkGenerateDialog(true);
  const closeBulkGenerateModal = () => {
    setShowBulkGenerateDialog(false);
    setBulkSearch('');
    setBulkSelectedGuestIds(new Set());
  };

  // Toggle guest selection in bulk modal
  const toggleBulkGuest = (guestId) => {
    setBulkSelectedGuestIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(guestId)) {
        newSet.delete(guestId);
      } else {
        newSet.add(guestId);
      }
      return newSet;
    });
  };

  // Confirm Bulk Generate
  const handleBulkGenerateConfirm = () => {
    const selectedGuests = registeredGuests.filter(g => bulkSelectedGuestIds.has(g.guest_id));
    const unlinked = selectedGuests.filter(g => !activeLinks.some(link => link.guestId === g.guest_id));
    if (unlinked.length === 0) {
      triggerToast('All selected guests already have active magic links.');
      return;
    }
    const newGenerated = unlinked.map((guest, idx) => {
      const code = Math.random().toString(16).substring(2, 10);
      return {
        id: `ml_bulk_${Date.now()}_${idx}`,
        guestId: guest.guest_id,
        guestName: guest.name,
        category: guest.category,
        avatarColor: guest.avatarColor,
        linkUrl: `event.hub/ml/${code}`,
        createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        expiryDate: getExpiryDateString(expirationSettings),
        status: 'Active',
        uses: 0
      };
    });
    setActiveLinks(prev => [...newGenerated, ...prev]);
    triggerToast(`Successfully generated ${newGenerated.length} magic link(s)!`);
    closeBulkGenerateModal();
  };

  // Share simulations
  const handleShareEmail = () => {
    if (!selectedGuest) {
      triggerToast('Select a guest first to share.');
      return;
    }
    const link = generatedLink || `event.hub/ml/preview_${selectedGuest.guest_id}`;
    alert(`Email invitation dispatch queued for:\nRecipient: ${selectedGuest.name} (${selectedGuest.name.toLowerCase().replace(' ', '.')}@eventhub360.com)\nLink: ${link}\n\nSubject: Your Premium Concierge Digital Check-in Link`);
    triggerToast('Invitation email sent!');
  };

  const handleShareWhatsApp = () => {
    if (!selectedGuest) {
      triggerToast('Select a guest first to share.');
      return;
    }
    const link = generatedLink || `event.hub/ml/preview_${selectedGuest.guest_id}`;
    alert(`WhatsApp API payload queued:\nRecipient: ${selectedGuest.name}\nMessage: "Hello! Here is your exclusive concierge access link: ${link}"`);
    triggerToast('WhatsApp message sent!');
  };

  // CSV Report exporter
  const handleExportCSV = () => {
    const headers = 'guest_name,category,link_url,created_date,expiry_date,status,uses\n';
    const rows = activeLinks
      .map(l => `"${l.guestName}","${l.category}","${l.linkUrl}","${l.createdDate}","${l.expiryDate}","${l.status}","${l.uses}"`)
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `magic_links_registry_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process filters on links table
  const filteredActiveLinks = useMemo(() => {
    let result = [...activeLinks];

    // Search query matching guest name or category
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      result = result.filter(l =>
        l.guestName.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter(l => l.status === statusFilter);
    }

    return result;
  }, [activeLinks, tableSearch, statusFilter]);

  // Compute pagination elements
  const paginatedLinks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredActiveLinks.slice(start, start + itemsPerPage);
  }, [filteredActiveLinks, currentPage]);

  const totalPages = Math.ceil(filteredActiveLinks.length / itemsPerPage) || 1;

  // Generate smart page numbers for pagination display
  const getPageNumbers = () => {
    const pages = [];
    const range = 1; // Show 1 page before and after current page

    // Always add page 1
    pages.push(1);

    // Determine the range around current page
    const start = Math.max(2, currentPage - range);
    const end = Math.min(totalPages - 1, currentPage + range);

    // Add ... if there's a gap between page 1 and start
    if (start > 2) {
      pages.push('...');
    }

    // Add pages in range
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ... if there's a gap between end and last page
    if (end < totalPages - 1) {
      pages.push('...');
    }

    // Add last page (if totalPages > 1)
    if (totalPages > 1 && pages[pages.length - 1] !== totalPages) {
      pages.push(totalPages);
    }

    return pages;
  };

  // Active stats calculations
  const totalActiveCount = useMemo(() => {
    return filteredActiveLinks.filter(l => l.status === 'Active').length;
  }, [filteredActiveLinks]);

  const expiringSoonCount = useMemo(() => {
    return filteredActiveLinks.filter(l => l.status === 'Expiring Soon').length;
  }, [filteredActiveLinks]);

  return (
    <div className="magic-links-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#1e293b',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
          zIndex: 9999,
          fontWeight: '600',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderLeft: '4px solid #ff4d4f',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span>✨</span> {toastMessage}
        </div>
      )}

      {/* Header bar matching Figma design style */}
      <header className="magic-links-header">
        <div className="magic-links-title-area">
          <h1>Magic Link Generator</h1>
        </div>

        {/* Figma Nav-Tabs + Search on Top Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Top navigation selectors */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', height: '40px', gap: '1.25rem' }}>
            {['Overview', 'Analytics', 'Export'].map((tab) => (
              <button
                key={tab}
                style={{
                  border: 'none',
                  background: 'none',
                  color: tab === 'Overview' ? '#ff4d4f' : '#64748b',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  padding: '0 0.25rem',
                  borderBottom: tab === 'Overview' ? '3px solid #ff4d4f' : '3px solid transparent',
                  boxSizing: 'border-box'
                }}
                onClick={() => {
                  if (tab === 'Export') handleExportCSV();
                  else triggerToast(`${tab} view simulated successfully.`);
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Field */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.9rem' }}>🔍</span>
            <input
              type="text"
              placeholder="Search guests..."
              className="search-input"
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '9999px',
                padding: '0.45rem 1rem 0.45rem 2.25rem',
                fontSize: '0.8rem',
                outline: 'none',
                width: '180px',
                backgroundColor: '#ffffff'
              }}
              value={tableSearch}
              onChange={(e) => { setTableSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.15rem' }}>🔔</button>

          <button
            type="button"
            style={{
              background: 'linear-gradient(135deg, #ff7a45 0%, #ff4d4f 100%)',
              border: 'none',
              color: '#fff',
              fontWeight: '600',
              fontSize: '0.85rem',
              padding: '0.5rem 1.15rem',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 77, 79, 0.2)'
            }}
            onClick={() => {
              if (selectedGuest) handleCreateMagicLink();
              else triggerToast('Please select a guest in the form to create a link.');
            }}
          >
            Create Link
          </button>
        </div>
      </header>

      {/* Stats Cards Section */}
      <div className="guest-stats-grid">
        {/* Total Active Links Card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon-wrapper guests" style={{ backgroundColor: 'rgba(255, 122, 69, 0.1)', color: '#ff7a45' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <span className="stat-trend-badge positive">+12%</span>
          </div>
          <div className="stat-card-body">
            <h3>{totalActiveCount.toLocaleString()}</h3>
            <p>Total Active Links</p>
          </div>
        </div>

        {/* Expiring Soon Card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon-wrapper pending" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="stat-card-body">
            <h3>{expiringSoonCount}</h3>
            <p>Expiring Soon</p>
          </div>
        </div>

        {/* Total Uses Card */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon-wrapper vip" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 00-2 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Lifetime</span>
          </div>
          <div className="stat-card-body">
            <h3>15.8k</h3>
            <p>Total Uses</p>
          </div>
        </div>
      </div>

      {/* Generator Split Grid */}
      <div className="generator-split-grid">
        {/* Left Side: Form */}
        <div className="generate-link-card">
          <h3>Generate Magic Link</h3>

          {/* Guest Selection */}
          <div className="form-group" style={{ position: 'relative' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'block' }}>
              Guest Selection
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}>👤</span>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.25rem', width: '100%', boxSizing: 'border-box' }}
                placeholder="Search for a guest from your list..."
                value={guestSearch}
                onChange={(e) => {
                  setGuestSearch(e.target.value);
                  if (selectedGuest) setSelectedGuest(null);
                  setIsGuestDropdownOpen(e.target.value.trim().length > 0);
                }}
                onFocus={handleGuestSearchFocus}
              />

              {/* Dropdown Options */}
              {isGuestDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '105%',
                  left: 0,
                  width: '100%',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  zIndex: 200,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  padding: '0.5rem 0'
                }}>
                  {filteredGuestOptions.length === 0 ? (
                    <div style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'var(--text-light)', textAlign: 'center' }}>
                      No guests match your search.
                    </div>
                  ) : (
                    filteredGuestOptions.map((g) => (
                      <div
                        key={g.guest_id}
                        style={{
                          padding: '0.5rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          backgroundColor: selectedGuest?.guest_id === g.guest_id ? '#f1f5f9' : 'transparent',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseDown={() => {
                          setSelectedGuest(g);
                          setGuestSearch(g.name);
                          setIsGuestDropdownOpen(false);
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: g.avatarColor,
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: '700'
                          }}>
                            {g.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>{g.name}</span>
                        </div>
                        <span style={{ fontSize: '0.725rem', backgroundColor: '#f1f5f9', padding: '0.125rem 0.35rem', borderRadius: '4px', color: 'var(--text-muted)' }}>
                          {g.category}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Expiration Settings */}
          <div className="form-group">
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'block' }}>
              Expiration Settings
            </label>
            <div className="expiry-tabs">
              {[
                { id: '24_hours', label: '24 Hours' },
                { id: '7_days', label: '7 Days' },
                { id: '30_days', label: '30 Days' },
                { id: 'no_expiration', label: 'No Expiration' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  className={`expiry-tab-btn ${expirationSettings === opt.id ? 'active' : ''}`}
                  onClick={() => setExpirationSettings(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Security Settings */}
          <div className="security-settings-block">
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', display: 'block' }}>
              Security Settings
            </label>

            {/* Single Use Only Toggle */}
            <div className="security-toggle-row">
              <div className="security-toggle-label">
                <span>Single Use Only</span>
                <p>Invalidate link after the guest checks in once</p>
              </div>
              <label className="toggle-wrapper">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={singleUse}
                  onChange={(e) => setSingleUse(e.target.checked)}
                />
                <div className="toggle-switch"></div>
              </label>
            </div>

            {/* IP Lockdown Toggle */}
            <div className="security-toggle-row">
              <div className="security-toggle-label">
                <span>IP Lockdown</span>
                <p>Restrict link activation to the guest's primary device network</p>
              </div>
              <label className="toggle-wrapper">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={ipLockdown}
                  onChange={(e) => setIpLockdown(e.target.checked)}
                />
                <div className="toggle-switch"></div>
              </label>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #ff7a45 0%, #ff4d4f 100%)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.25rem',
                border: 'none',
                color: '#fff',
                fontWeight: '600',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onClick={handleCreateMagicLink}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span>Create Magic Link</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={openBulkGenerateModal}
            >
              <span>Bulk Generate</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              onClick={() => handleCopyLinkText(generatedLink)}
              disabled={!generatedLink}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 00-2 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Copy Link</span>
            </button>
          </div>
        </div>

        {/* Right Side: QR Preview & Sharing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Live QR Preview Card */}
          <div className="qr-preview-card">
            <h4>Live QR Preview</h4>

            <div className="tilted-qr-wrapper">
              <div className="tilted-qr-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="68" height="68" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer square markers */}
                  <rect x="0" y="0" width="28" height="28" rx="2" fill="#a61e22" />
                  <rect x="4" y="4" width="20" height="20" rx="1" fill="#ffffff" />
                  <rect x="8" y="8" width="12" height="12" rx="1" fill="#a61e22" />

                  <rect x="72" y="0" width="28" height="28" rx="2" fill="#a61e22" />
                  <rect x="76" y="4" width="20" height="20" rx="1" fill="#ffffff" />
                  <rect x="80" y="8" width="12" height="12" rx="1" fill="#a61e22" />

                  <rect x="0" y="72" width="28" height="28" rx="2" fill="#a61e22" />
                  <rect x="4" y="76" width="20" height="20" rx="1" fill="#ffffff" />
                  <rect x="8" y="80" width="12" height="12" rx="1" fill="#a61e22" />

                  {/* QR Grid dots & blocks simulation */}
                  <rect x="36" y="0" width="8" height="8" rx="1" fill="#a61e22" />
                  <rect x="48" y="0" width="16" height="4" rx="0.5" fill="#a61e22" />
                  <rect x="36" y="16" width="16" height="8" rx="1" fill="#a61e22" />
                  <rect x="56" y="12" width="12" height="12" rx="1.5" fill="#a61e22" />

                  <rect x="0" y="36" width="12" height="8" rx="1" fill="#a61e22" />
                  <rect x="0" y="48" width="8" height="16" rx="1" fill="#a61e22" />

                  <rect x="36" y="36" width="28" height="28" rx="2" fill="#a61e22" />
                  <rect x="42" y="42" width="16" height="16" rx="1" fill="#ffffff" />
                  <rect x="47" y="47" width="6" height="6" fill="#a61e22" />

                  <rect x="72" y="36" width="16" height="16" rx="1" fill="#a61e22" />
                  <rect x="68" y="60" width="24" height="8" rx="1" fill="#a61e22" />

                  <rect x="36" y="72" width="16" height="12" rx="1" fill="#a61e22" />
                  <rect x="36" y="88" width="8" height="8" rx="1" fill="#a61e22" />
                  <rect x="56" y="76" width="12" height="16" rx="1" fill="#a61e22" />

                  <rect x="72" y="72" width="24" height="24" rx="2" fill="#a61e22" />
                  <rect x="78" y="78" width="12" height="12" rx="1" fill="#ffffff" />
                </svg>
              </div>
            </div>

            <p className="qr-caption-text">
              "Instantly grants access to the VIP Concierge dashboard upon scanning."
            </p>
          </div>

          {/* Distribute Link Card */}
          <div className="distribute-card">
            <h4>Distribute Link</h4>
            <div className="distribute-buttons-row">
              <button
                type="button"
                className="dist-channel-btn email"
                onClick={handleShareEmail}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Email</span>
              </button>

              <button
                type="button"
                className="dist-channel-btn whatsapp"
                onClick={handleShareWhatsApp}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Magic Links Card & Table */}
      <div className="table-card" style={{ marginTop: '1rem' }}>
        {/* Table Action Header Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)'
        }}>
          {/* Accent vertical bar next to title */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{
              fontSize: '1.15rem',
              fontWeight: '700',
              margin: 0,
              position: 'relative',
              paddingLeft: '0.75rem',
              color: 'var(--text-main)'
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                top: '3px',
                bottom: '3px',
                width: '4px',
                backgroundColor: '#7c3aed', // Purple accent
                borderRadius: '9999px'
              }}></span>
              Active Magic Links
            </h2>
          </div>

          {/* Search, Filter, Export Action Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
            {/* Inline search box inside card */}
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.8rem' }}>🔍</span>
              <input
                type="text"
                placeholder="Search active links..."
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '0.35rem 0.5rem 0.35rem 1.75rem',
                  fontSize: '0.775rem',
                  outline: 'none',
                  width: '160px',
                  backgroundColor: '#ffffff'
                }}
                value={tableSearch}
                onChange={(e) => { setTableSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>

            {/* Filter Toggle */}
            <button
              type="button"
              className={`control-btn ${statusFilter !== 'All' ? 'active' : ''}`}
              style={{ width: '32px', height: '32px' }}
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              title="Filter by status"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '15px', height: '15px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>

            {/* Filter Dropdown Popover */}
            {isFilterDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '110%',
                right: '40px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 300,
                minWidth: '130px',
                padding: '0.25rem 0'
              }}>
                {['All', 'Active', 'Expiring Soon', 'Expired'].map(st => (
                  <button
                    key={st}
                    type="button"
                    style={{
                      border: 'none',
                      background: 'none',
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.5rem 1rem',
                      fontSize: '0.8rem',
                      color: statusFilter === st ? '#ff4d4f' : 'var(--text-main)',
                      fontWeight: statusFilter === st ? '600' : 'normal',
                      cursor: 'pointer',
                      backgroundColor: statusFilter === st ? '#fff8f6' : 'transparent'
                    }}
                    onClick={() => {
                      setStatusFilter(st);
                      setIsFilterDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                  >
                    {st} {st === 'All' ? '' : 'Links'}
                  </button>
                ))}
              </div>
            )}

            {/* Download/Export CSV */}
            <button
              type="button"
              className="control-btn"
              style={{ width: '32px', height: '32px' }}
              onClick={handleExportCSV}
              title="Export CSV active registry"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '15px', height: '15px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>

            {/* Bulk Actions Bar */}
            {selectedLinks.size > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                gap: '0.5rem',
                alignItems: 'center',
                border: '2px solid #1c1b1bff',
                borderRadius: '8px',
                padding: '1rem 1.2rem'
              }}>
                {/* Expire Selected */}
                <button
                  type="button"
                  className="control-btn"
                  style={{
                    background: '#ff7a45',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    padding: '1rem 2rem',
                    minWidth: '140px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowExpireSelectedDialog(true)}
                  title={`Expire ${selectedLinks.size} selected link(s)`}
                >
                  ⏰ Expire ({selectedLinks.size})
                </button>
                {/* Reactivate Selected */}
                <button
                  type="button"
                  className="control-btn"
                  style={{
                    background: '#48a55aff',
                    color: '#ffffffff',
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    padding: '1rem 2rem',
                    minWidth: '140px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowReactivateSelectedDialog(true)}
                  title={`Reactivate ${selectedLinks.size} selected link(s)`}
                >
                  ♻️ Reactivate ({selectedLinks.size})
                </button>
                {/* Delete Selected */}
                <button
                  type="button"
                  className="control-btn"
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    padding: '1rem 2rem',
                    minWidth: '140px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowDeleteSelectedDialog(true)}
                  title={`Delete ${selectedLinks.size} selected link(s)`}
                >
                  🗑️ Delete ({selectedLinks.size})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table responsive scroll area */}
        <div className="table-responsive">
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedLinks.size > 0 && selectedLinks.size === filteredActiveLinks.length}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th>Guest Name</th>
                <th>Link URL</th>
                <th>Created Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLinks.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '3rem' }}>
                    No active magic links found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedLinks.map((link) => (
                  <tr
                    key={link.id}
                    style={{
                      backgroundColor: selectedLinks.has(link.id) ? 'rgba(255, 122, 69, 0.05)' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <td style={{ width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedLinks.has(link.id)}
                        onChange={() => handleSelectLink(link.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <div className="guest-info-cell">
                        <div className="guest-avatar-placeholder" style={{ backgroundColor: link.avatarColor, background: link.avatarColor }}>
                          {link.guestName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className="guest-name-wrap">
                          <span className="guest-name" style={{ cursor: 'default' }}>{link.guestName}</span>
                          <div className="guest-badges-row">
                            <span className={`guest-badge ${link.category.toLowerCase().includes('vip') ? 'vip' : 'primary-guest'}`}>
                              {link.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div
                        className={`link-url-block ${link.status === 'Expired' ? 'expired' : ''}`}
                        onClick={() => handleCopyLinkText(link.linkUrl)}
                        title="Click to copy link"
                      >
                        <span>{link.linkUrl}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 00-2 2h10a2 2 0 002-2v-1M8 5a2 2 0 00-2-2h2a2 2 0 002-2" />
                        </svg>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{link.createdDate}</span>
                    </td>

                    <td>
                      <span style={{
                        fontSize: '0.85rem',
                        color: link.status === 'Expired' ? 'var(--text-light)' : 'var(--text-main)',
                        fontWeight: link.status === 'Expiring Soon' ? '600' : 'normal'
                      }}>
                        {link.expiryDate}
                      </span>
                    </td>

                    <td>
                      <span className={`status-pill ${link.status === 'Active' ? 'confirmed' : (link.status === 'Expired' ? 'declined' : 'pending')
                        }`}>
                        {link.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        {/* Renew action button */}
                        <button
                          type="button"
                          className="btn-revoke-action"
                          onClick={() => handleRenewLink(link.id)}
                          title="Renew link (+7 days)"
                          style={{ color: '#059669' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
                          </svg>
                        </button>

                        {/* Revoke action button */}
                        <button
                          type="button"
                          className="btn-revoke-action"
                          onClick={() => handleRevokeLink(link.id)}
                          title="Deactivate / Revoke link"
                          disabled={link.status === 'Expired'}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>

                        {/* Delete action button */}
                        <button
                          type="button"
                          className="btn-revoke-action"
                          onClick={() => setDeleteSingleId(link.id)}
                          title="Delete magic link"
                          style={{ color: '#ef4444' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Row */}
        <div className="pagination-row">
          <div className="pagination-info">
            <span>Showing {Math.min(filteredActiveLinks.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredActiveLinks.length, currentPage * itemsPerPage)} of {filteredActiveLinks.length} active links</span>
          </div>
          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              &lt;
            </button>
            {getPageNumbers().map((page, idx) =>
              page === '...' ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="pagination-btn"
                  style={{ cursor: 'default', pointerEvents: 'none' }}
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              )
            )}
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Delete Single Link Confirmation Dialog */}
      {deleteSingleId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-main)' }}>Delete Magic Link?</h3>
            <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
              Are you sure you want to delete this magic link? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setDeleteSingleId(null)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteLink(deleteSingleId)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Selected Links Confirmation Dialog */}
      {showDeleteSelectedDialog && selectedLinks.size > 0 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-main)' }}>Delete {selectedLinks.size} Magic Link(s)?</h3>
            <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
              Are you sure you want to delete {selectedLinks.size} selected magic link(s)? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowDeleteSelectedDialog(false)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  fontWeight: '6'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSelected}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expire Selected Confirmation Dialog */}
      {showExpireSelectedDialog && selectedLinks.size > 0 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-main)' }}>Expire {selectedLinks.size} Magic Link(s)?</h3>
            <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
              Are you sure you want to expire the selected magic link(s)? This will set their status to "Expired".
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowExpireSelectedDialog(false)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExpireSelected}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#ff7a45',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Expire
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reactivate Selected Confirmation Dialog */}
      {showReactivateSelectedDialog && selectedLinks.size > 0 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-main)' }}>Reactivate {selectedLinks.size} Magic Link(s)?</h3>
            <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
              Reactivate the selected magic link(s) by setting their status back to "Active".
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowReactivateSelectedDialog(false)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReactivateSelected}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#34d371ff',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Reactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkGenerateDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-main)' }}>Generate Magic Links</h3>
            <input
              type="text"
              placeholder="Search guests..."
              value={bulkSearch}
              onChange={e => setBulkSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '4px'
              }}
            />
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
              {registeredGuests
                .filter(g => {
                  const q = bulkSearch.toLowerCase();
                  return g.name.toLowerCase().includes(q) || g.category.toLowerCase().includes(q);
                })
                .map(g => (
                  <div key={g.guest_id} style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                    <input
                      type="checkbox"
                      checked={bulkSelectedGuestIds.has(g.guest_id)}
                      onChange={() => toggleBulkGuest(g.guest_id)}
                      style={{ marginRight: '0.75rem' }}
                    />
                    <span>{g.name} ({g.category})</span>
                  </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={closeBulkGenerateModal}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkGenerateConfirm}
                disabled={bulkSelectedGuestIds.size === 0}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: bulkSelectedGuestIds.size === 0 ? '#ccc' : '#ff7a45',
                  color: '#fff',
                  cursor: bulkSelectedGuestIds.size === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                Generate ({bulkSelectedGuestIds.size})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}