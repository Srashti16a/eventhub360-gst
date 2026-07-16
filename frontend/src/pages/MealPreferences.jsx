import React, { useState, useEffect, useMemo } from 'react';
import './MealPreferences.css';
import GuestModal from '../components/GuestManagement/GuestModal';
import api from '../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const mapPrefGuestToForm = (g) => {
  return {
    guest_id: g.id,
    name: g.name,
    email: g.email,
    phone: g.phone || '',
    category: g.guestCategory === 'VIP' ? 'VIP' : g.guestCategory === 'Family' ? 'Family' : 'Corporate',
    groupName: g.guestCategory === 'Speaker' ? 'Speakers' : '',
    eventName: g.event ? g.event.category : 'Corporate Gala',
    rsvpStatus: g.status ? g.status.toLowerCase() : 'pending',
    preference: g.mealPreference || 'Non-Veg',
    allergies: g.allergies || 'None',
    assignedHotel: g.hotel ? g.hotel.name : '',
    table_no: '',
    seat_no: ''
  };
};

export default function MealPreferences() {
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedPreference, setSelectedPreference] = useState('All Preferences');
  const [selectedAllergy, setSelectedAllergy] = useState('All Allergies');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination & Loading States
  const [guests, setGuests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Stats & Panels States
  const [summaryData, setSummaryData] = useState(null);
  const [procurementData, setProcurementData] = useState(null);
  const [chefSummary, setChefSummary] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  // Modal / Action States
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dbEvents, setDbEvents] = useState([]);
  const [dbHotels, setDbHotels] = useState([]);
  const [appliedRecommendation, setAppliedRecommendation] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  // Active filter state from dashboard "Allergy Alerts" click drill-down
  const [showOnlyAllergies, setShowOnlyAllergies] = useState(false);

  // Quick Search Modal State ("Find & Edit Guest Preference")
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [quickSearchResults, setQuickSearchResults] = useState([]);
  const [quickSearchLoading, setQuickSearchLoading] = useState(false);

  // Menu Manager States
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [dailySpecialItem, setDailySpecialItem] = useState(null);
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuDesc, setNewMenuDesc] = useState('');
  const [newMenuCategory, setNewMenuCategory] = useState('Vegan');

  // Load Menu from LocalStorage or Defaults
  useEffect(() => {
    const stored = localStorage.getItem('eh360_catering_menu');
    if (stored) {
      const parsed = JSON.parse(stored);
      setMenuItems(parsed);
      const activeDS = parsed.find(item => item.isDailySpecial);
      setDailySpecialItem(activeDS || parsed[0] || null);
    } else {
      const defaultMenu = [
        {
          id: 'ds-1',
          name: 'Heritage Carrot & Miso Puree',
          desc: 'Roasted heirloom carrots pureed with red miso and toasted almonds.',
          category: 'Vegan',
          isDailySpecial: true
        },
        {
          id: 'ds-2',
          name: 'Pan-Seared Organic Chicken',
          desc: 'Free-range chicken breast served over roasted root vegetables.',
          category: 'Non-Veg',
          isDailySpecial: false
        },
        {
          id: 'ds-3',
          name: 'Spinach & Ricotta Ravioli',
          desc: 'House-made ravioli in wild mushroom cream sauce.',
          category: 'Vegetarian',
          isDailySpecial: false
        }
      ];
      localStorage.setItem('eh360_catering_menu', JSON.stringify(defaultMenu));
      setMenuItems(defaultMenu);
      setDailySpecialItem(defaultMenu[0]);
    }
  }, []);

  // Fetch Events and Hotels for Guest Modal
  useEffect(() => {
    api.get('/events')
      .then(res => { if (res.success) setDbEvents(res.data); })
      .catch(err => console.error('Error loading events:', err));
    
    api.get('/hotels')
      .then(res => { if (res.success) setDbHotels(res.data); })
      .catch(err => console.error('Error loading hotels:', err));
  }, []);

  // Toast helper (mirrors GuestManagement pattern)
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Quick Search: fetch guests when query changes (debounced 300ms)
  useEffect(() => {
    if (!isQuickSearchOpen || !quickSearchQuery.trim()) {
      setQuickSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setQuickSearchLoading(true);
      api.get(`/catering/preferences?search=${encodeURIComponent(quickSearchQuery)}&limit=6&page=1`)
        .then(res => {
          if (res.success) setQuickSearchResults(res.data);
          setQuickSearchLoading(false);
        })
        .catch(() => setQuickSearchLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [quickSearchQuery, isQuickSearchOpen]);

  // Fetch Static Dashboards & Dynamic Suggestions
  const loadDashboardData = () => {
    api.get('/catering/summary')
      .then(res => { if (res.success) setSummaryData(res.data); })
      .catch(err => console.error('Error loading catering summary:', err));

    api.get('/catering/procurement')
      .then(res => { if (res.success) setProcurementData(res.data); })
      .catch(err => console.error('Error loading procurement forecast:', err));

    api.get('/catering/chef-summary')
      .then(res => { if (res.success) setChefSummary(res.data); })
      .catch(err => console.error('Error loading chef summary:', err));

    api.get('/catering/suggestions')
      .then(res => { if (res.success) setSuggestions(res.data); })
      .catch(err => console.error('Error loading suggestions:', err));
  };

  // Fetch Guest preference registry
  const loadGuestPreferences = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('page', currentPage.toString());
    params.append('limit', '4');

    if (searchQuery.trim()) {
      params.append('search', searchQuery);
    }
    if (selectedCategory !== 'All Categories') {
      params.append('guestCategory', selectedCategory);
    }
    if (selectedPreference !== 'All Preferences') {
      params.append('preference', selectedPreference);
    }
    if (showOnlyAllergies) {
      params.append('allergy', 'Has Allergies');
    } else if (selectedAllergy !== 'All Allergies') {
      params.append('allergy', selectedAllergy);
    }

    api.get(`/catering/preferences?${params.toString()}`)
      .then(res => {
        if (res.success) {
          setGuests(res.data);
          setTotalPages(res.meta.totalPages || 1);
          setTotalCount(res.meta.totalCount || 0);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading guest preferences:', err);
        setLoading(false);
      });
  };

  // Load Dashboard data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Reload guest preference registry when page, filters or showOnlyAllergies change
  useEffect(() => {
    loadGuestPreferences();
  }, [currentPage, selectedCategory, selectedPreference, selectedAllergy, searchQuery, showOnlyAllergies]);

  // Reset page to 1 when filters or search change
  const handleFilterChange = (setter, val) => {
    if (setter === setSelectedAllergy) {
      setShowOnlyAllergies(false);
    }
    setter(val);
    setCurrentPage(1);
  };

  const handleExportPDF = () => {
    // Build filter params matching the current view (same as listCateringPreferences)
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery);
    if (selectedCategory !== 'All Categories') params.append('guestCategory', selectedCategory);
    if (selectedPreference !== 'All Preferences') params.append('preference', selectedPreference);
    
    if (showOnlyAllergies) {
      params.append('allergy', 'Has Allergies');
    } else if (selectedAllergy !== 'All Allergies') {
      params.append('allergy', selectedAllergy);
    }

    showToast('Preparing PDF download...', 'info');

    // Fetch the full filtered dataset (no pagination limit) via the export API
    api.get(`/catering/export?${params.toString()}`)
      .then(res => {
        if (!res.success || !res.data) {
          showToast('Failed to fetch export data.', 'error');
          return;
        }

        const exportGuests = res.data;

        // Initialize jsPDF in landscape mode, A4 paper size, coordinates in pt (points)
        // A4 landscape width: 841.89 pt, height: 595.28 pt
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'pt',
          format: 'a4'
        });

        // EventHub360 Branding top accent bar
        doc.setFillColor(255, 77, 79); // #ff4d4f (EventHub360 primary red)
        doc.rect(0, 0, 842, 8, 'F');

        // EventHub360 logo text / branding
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(255, 77, 79);
        doc.text('EVENTHUB360', 40, 35);

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42); // slate-900 (#0f172a)
        doc.text('Meal Preferences Matrix', 40, 60);

        // Subtitle / context
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // slate-500 (#64748b)
        doc.text('Global Tech Summit 2024 • Catering & Dietary Management Log', 40, 75);

        // Timestamp
        const timestamp = new Date().toLocaleString();
        doc.text(`Exported: ${timestamp}`, 40, 90);

        // Construct Filter Summary text
        const filterNoteList = [
          selectedCategory !== 'All Categories' ? `Category: ${selectedCategory}` : null,
          selectedPreference !== 'All Preferences' ? `Preference: ${selectedPreference}` : null,
          showOnlyAllergies ? `Allergies: Yes` : (selectedAllergy !== 'All Allergies' ? `Allergy: ${selectedAllergy}` : null),
          searchQuery.trim() ? `Search: "${searchQuery}"` : null,
        ].filter(Boolean);
        const filterSummaryText = filterNoteList.length > 0 ? filterNoteList.join('  |  ') : 'None (Showing All)';

        // Draw Meta Box (Active Filters & Totals)
        doc.setFillColor(248, 250, 252); // slate-50 (#f8fafc)
        doc.setDrawColor(226, 232, 240); // slate-200 (#e2e8f0)
        doc.rect(40, 105, 762, 50, 'FD');

        // Draw Meta Content
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105); // slate-600 (#475569)
        doc.text('Active Filters:', 55, 124);
        doc.text('Total Exported Records:', 55, 142);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(filterSummaryText, 130, 124);
        doc.text(`${exportGuests.length} guests`, 175, 142);

        // Add summary counts if summaryData is loaded
        if (summaryData) {
          const statsStr = `Vegan: ${summaryData.vegan.value} (${summaryData.vegan.percentage}%)   |   Vegetarian: ${summaryData.vegetarian.value} (${summaryData.vegetarian.percentage}%)   |   Non-Veg: ${summaryData.nonVeg.value} (${summaryData.nonVeg.percentage}%)   |   Allergy Alerts: ${summaryData.totalGuests.allergyAlerts}`;
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(71, 85, 105);
          doc.text('Dietary Counts:', 400, 142);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(15, 23, 42);
          doc.text(statsStr, 480, 142);
        }

        // Prepare Table Columns and Data
        const tableHeaders = [['Guest', 'Email Address', 'Meal Preference', 'Allergies', 'Category', 'RSVP Status']];
        const tableRows = exportGuests.map(g => [
          g.name,
          g.email,
          g.mealPreference || 'Non-Veg',
          g.allergies || 'None',
          g.guestCategory || 'Attendee',
          g.status || 'PENDING'
        ]);

        // Draw Table using jspdf-autotable
        autoTable(doc, {
          startY: 175,
          head: tableHeaders,
          body: tableRows,
          theme: 'striped',
          margin: { left: 40, right: 40, bottom: 45 },
          headStyles: {
            fillColor: [255, 77, 79], // EventHub360 primary red (#ff4d4f)
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
            cellPadding: 8
          },
          bodyStyles: {
            fontSize: 8.5,
            cellPadding: 7,
            textColor: [51, 65, 85] // slate-700
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252] // slate-50
          },
          columnStyles: {
            0: { cellWidth: 120, fontStyle: 'bold' }, // Guest
            1: { cellWidth: 180 }, // Email
            2: { cellWidth: 110 }, // Meal Preference
            3: { cellWidth: 160 }, // Allergies
            4: { cellWidth: 90 },  // Category
            5: { cellWidth: 102 }  // RSVP Status
          },
          didDrawPage: (data) => {
            // Footer drawing on every page
            const totalPages = doc.internal.getNumberOfPages();
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184); // slate-400
            
            // "Page X of Y" style footer
            const pageStr = `Page ${doc.internal.getCurrentPageInfo().pageNumber}`;
            
            // Print page number bottom left
            doc.text(pageStr, 40, 565);
            
            // Print system identifier bottom right
            doc.text('EventHub360 Guest Management System • Confidential Report', 802 - 250, 565);
          }
        });

        // Trigger browser direct download
        doc.save('eventhub360_meal_preferences.pdf');
        showToast('PDF downloaded successfully.', 'success');
      })
      .catch((err) => {
        console.error('Error exporting PDF', err);
        showToast('Failed to generate export. Please try again.', 'error');
      });
  };

  const handleManageMenu = () => {
    setIsMenuModalOpen(true);
  };

  const handleApplySuggestion = () => {
    setAppliedRecommendation(true);
    showToast('Recommendation applied: Nut-Free appetizer procurement increased by 15% for kitchen prep.');
  };

  // Opens the quick-search modal so the user can find an existing guest to edit their preference
  const handleOpenQuickSearch = () => {
    setQuickSearchQuery('');
    setQuickSearchResults([]);
    setIsQuickSearchOpen(true);
  };

  const handleQuickSearchSelect = (g) => {
    setIsQuickSearchOpen(false);
    handleEditRowClick(g);
  };

  const handleEditRowClick = (g) => {
    setEditingGuest(mapPrefGuestToForm(g));
    setIsAddEditOpen(true);
  };

  const handleSaveGuest = (formData) => {
    // 1. Resolve Event ID
    const eventId = dbEvents[0]?.id || null;
    
    // 2. Resolve Hotel ID
    const matchingHotel = dbHotels.find(h => h.name === formData.assignedHotel);
    const assignedHotelId = matchingHotel ? matchingHotel.id : null;

    // 3. Construct save payload
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
      mealPreference: formData.preference || 'Non-Veg',
      allergies: formData.allergies || 'None'
    };

    const isEdit = !!editingGuest;
    const url = isEdit ? `/guests/${editingGuest.guest_id}` : '/guests';
    const method = isEdit ? 'PUT' : 'POST';

    setSaving(true);
    
    const requestPromise = method === 'PUT' ? api.put(url, payload) : api.post(url, payload);

    requestPromise
      .then(res => {
        setSaving(false);
        if (res.success) {
          setIsAddEditOpen(false);
          setEditingGuest(null);
          showToast(isEdit ? 'Guest preference updated successfully.' : 'Guest created successfully.');
          loadDashboardData();
          loadGuestPreferences();
        } else {
          showToast('Error saving: ' + (res.error?.message || 'Unknown error'), 'error');
        }
      })
      .catch(err => {
        setSaving(false);
        console.error('Error saving preference:', err);
        showToast('An error occurred while saving. Please try again.', 'error');
      });
  };

  // Menu Manager Add / Toggle / Delete Handlers
  const handleAddMenuItem = (e) => {
    e.preventDefault();
    if (!newMenuName.trim()) return;

    const newItem = {
      id: 'menu-' + Date.now(),
      name: newMenuName,
      desc: newMenuDesc,
      category: newMenuCategory,
      isDailySpecial: false
    };

    const updated = [...menuItems, newItem];
    localStorage.setItem('eh360_catering_menu', JSON.stringify(updated));
    setMenuItems(updated);

    setNewMenuName('');
    setNewMenuDesc('');
  };

  const handleToggleDailySpecial = (id) => {
    const updated = menuItems.map(item => ({
      ...item,
      isDailySpecial: item.id === id
    }));
    localStorage.setItem('eh360_catering_menu', JSON.stringify(updated));
    setMenuItems(updated);

    const activeDS = updated.find(item => item.isDailySpecial);
    setDailySpecialItem(activeDS || null);
  };

  const handleDeleteMenuItem = (id) => {
    const updated = menuItems.filter(item => item.id !== id);
    localStorage.setItem('eh360_catering_menu', JSON.stringify(updated));
    setMenuItems(updated);

    // Update active special if we deleted it
    if (dailySpecialItem && dailySpecialItem.id === id) {
      setDailySpecialItem(updated[0] || null);
    }
  };

  return (
    <div className="meal-pref-container">
      {/* Toast Notification (same pattern as GuestManagement) */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
          padding: '0.85rem 1.25rem', borderRadius: '10px',
          color: '#fff', fontWeight: 600, fontSize: '0.875rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          background: toast.type === 'error'
            ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
            : toast.type === 'info'
            ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
            : 'linear-gradient(135deg, #059669, #047857)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          animation: 'fadeInDown 0.3s ease-out',
          maxWidth: '420px',
          pointerEvents: 'none'
        }}>
          <span>{toast.type === 'error' ? '✕' : toast.type === 'info' ? 'ℹ' : '✓'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Area */}
      <header className="meal-pref-header">
        <div className="meal-pref-title-area">
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            Accommodation <span style={{ margin: '0 0.35rem', color: '#94a3b8' }}>/</span> <span style={{ color: '#ff4d4f' }}>Meal Preferences</span>
          </div>
          <h1>Meal Preferences Matrix</h1>
          <p>Global Tech Summit 2024 • Catering & Dietary Management</p>
        </div>

        <div className="meal-pref-actions">
          <button type="button" className="btn-meal-secondary" onClick={handleExportPDF} title="Download a PDF report of the filtered preferences log">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export PDF</span>
          </button>
          <button type="button" className="btn-meal-primary" onClick={handleManageMenu}>
            ✏️ Manage Menu
          </button>
        </div>
      </header>

      {/* Stats row */}
      <section className="meal-pref-stats-grid">
        {/* Total Guests */}
        <div 
          className={`meal-pref-stat-card ${
            selectedPreference === 'All Preferences' && 
            !showOnlyAllergies && 
            selectedAllergy === 'All Allergies' && 
            selectedCategory === 'All Categories' && 
            searchQuery.trim() === '' ? 'active' : ''
          }`}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setSelectedCategory('All Categories');
            setSelectedPreference('All Preferences');
            setSelectedAllergy('All Allergies');
            setShowOnlyAllergies(false);
            setSearchQuery('');
            setCurrentPage(1);
          }}
          title="Click to reset and show all guests"
        >
          <div className="meal-pref-card-header">
            <div className="meal-pref-icon-wrap guests">👥</div>
            <span className="meal-pref-card-badge green">{summaryData?.totalGuests?.growth || '+12% vs last month'}</span>
          </div>
          <div className="meal-pref-card-body">
            <h3>Total Guests</h3>
            <p className="meal-pref-val">{summaryData?.totalGuests?.value || 0}</p>
            <div 
              className={`meal-pref-allergy-alert ${showOnlyAllergies ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                setShowOnlyAllergies(true);
                setSelectedAllergy('All Allergies'); // reset dropdown filter
                setCurrentPage(1);
                
                // Smooth scroll directly to the Guest Preference Log title row
                const titleEl = document.querySelector('.meal-pref-panel-title-row');
                if (titleEl) {
                  titleEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              title="Click to view guests with allergies"
            >
              ⚠️ {summaryData?.totalGuests?.allergyAlerts || 0} Allergy Alerts
            </div>
          </div>
        </div>

        {/* Vegan */}
        <div 
          className={`meal-pref-stat-card ${selectedPreference === 'Vegan' ? 'active' : ''}`}
          style={{ cursor: 'pointer' }}
          onClick={() => handleFilterChange(setSelectedPreference, 'Vegan')}
          title="Click to filter by Vegan preference"
        >
          <div className="meal-pref-card-header">
            <div className="meal-pref-icon-wrap vegan">🌱</div>
            <span className="meal-pref-card-badge grey">{summaryData?.vegan?.percentage || 0}% of total</span>
          </div>
          <div className="meal-pref-card-body">
            <h3>Vegan</h3>
            <p className="meal-pref-val">{summaryData?.vegan?.value || 0}</p>
            <div className="meal-pref-progress-bg">
              <div className="meal-pref-progress-fill vegan" style={{ width: `${summaryData?.vegan?.percentage || 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* Vegetarian */}
        <div 
          className={`meal-pref-stat-card ${selectedPreference === 'Vegetarian' ? 'active' : ''}`}
          style={{ cursor: 'pointer' }}
          onClick={() => handleFilterChange(setSelectedPreference, 'Vegetarian')}
          title="Click to filter by Vegetarian preference"
        >
          <div className="meal-pref-card-header">
            <div className="meal-pref-icon-wrap vegetarian">🥚</div>
            <span className="meal-pref-card-badge grey">{summaryData?.vegetarian?.percentage || 0}% of total</span>
          </div>
          <div className="meal-pref-card-body">
            <h3>Vegetarian</h3>
            <p className="meal-pref-val">{summaryData?.vegetarian?.value || 0}</p>
            <div className="meal-pref-progress-bg">
              <div className="meal-pref-progress-fill vegetarian" style={{ width: `${summaryData?.vegetarian?.percentage || 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* Non-Veg */}
        <div 
          className={`meal-pref-stat-card ${selectedPreference === 'Non-Veg' ? 'active' : ''}`}
          style={{ cursor: 'pointer' }}
          onClick={() => handleFilterChange(setSelectedPreference, 'Non-Veg')}
          title="Click to filter by Non-Veg preference"
        >
          <div className="meal-pref-card-header">
            <div className="meal-pref-icon-wrap nonveg">🍗</div>
            <span className="meal-pref-card-badge grey">{summaryData?.nonVeg?.percentage || 0}% of total</span>
          </div>
          <div className="meal-pref-card-body">
            <h3>Non-Veg</h3>
            <p className="meal-pref-val">{summaryData?.nonVeg?.value || 0}</p>
            <div className="meal-pref-progress-bg">
              <div className="meal-pref-progress-fill nonveg" style={{ width: `${summaryData?.nonVeg?.percentage || 0}%` }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Split Section */}
      <section className="meal-pref-split-layout">
        {/* Left Column: Guest Preference Log */}
        <div className="meal-pref-panel">
          <div className="meal-pref-panel-title-row">
            <h2>Guest Preference Log</h2>
          </div>

          {showOnlyAllergies && (
            <div 
              className="active-filter-chip"
              onClick={() => setShowOnlyAllergies(false)}
              title="Click to clear filter and show all guests"
            >
              <span>⚠️ Showing only guests with allergies</span>
              <button type="button" className="clear-chip-btn">✕</button>
            </div>
          )}
          <div className="meal-pref-filter-bar-row">
            <div className="meal-pref-filters">
              <input
                type="text"
                className="meal-pref-select search-input"
                placeholder="🔍 Search name/email..."
                value={searchQuery}
                disabled={loading}
                onChange={e => handleFilterChange(setSearchQuery, e.target.value)}
              />
              <select 
                className="meal-pref-select"
                value={selectedCategory}
                disabled={loading}
                onChange={e => handleFilterChange(setSelectedCategory, e.target.value)}
              >
                <option value="All Categories">All Categories</option>
                <option value="VIP">VIP</option>
                <option value="Speaker">Speaker</option>
                <option value="Attendee">Attendee</option>
              </select>
              <select
                className="meal-pref-select"
                value={selectedPreference}
                disabled={loading}
                onChange={e => handleFilterChange(setSelectedPreference, e.target.value)}
              >
                <option value="All Preferences">All Preferences</option>
                <option value="Vegan">Vegan</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Gluten-Free">Gluten-Free</option>
                <option value="Keto">Keto</option>
              </select>
              <select
                className="meal-pref-select"
                value={selectedAllergy}
                disabled={loading}
                onChange={e => handleFilterChange(setSelectedAllergy, e.target.value)}
              >
                <optgroup label="Filter by Status">
                  <option value="All Allergies">All Allergies (Show All)</option>
                  <option value="None">No Allergies</option>
                </optgroup>
                <optgroup label="Filter by Specific Type">
                  <option value="Nuts">Nuts</option>
                  <option value="Shellfish">Shellfish</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Gluten">Gluten</option>
                </optgroup>
              </select>
              <button 
                type="button" 
                className="btn-meal-filter-icon" 
                title="Reset Filters"
                onClick={() => {
                  setSelectedCategory('All Categories');
                  setSelectedPreference('All Preferences');
                  setSelectedAllergy('All Allergies');
                  setShowOnlyAllergies(false);
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
              >
                🔄
              </button>
            </div>
          </div>

          <div className="meal-pref-table-wrap" style={{ opacity: loading ? 0.65 : 1, pointerEvents: loading ? 'none' : 'auto', transition: 'opacity 0.15s ease' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '0.95rem' }}>
                ⌛ Loading Guest Preferences...
              </div>
            ) : (
              <table className="meal-pref-table">
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Preference</th>
                    <th>Allergies</th>
                    <th>Category</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No guest preferences found matching the filters.
                      </td>
                    </tr>
                  ) : (
                    guests.map(g => (
                      <tr 
                        key={g.id} 
                        style={{ cursor: 'pointer' }} 
                        onClick={() => handleEditRowClick(g)}
                        title="Click to edit guest preferences"
                      >
                        <td>
                          <div className="meal-pref-guest-cell">
                            <img src={g.avatar} alt={g.name} className="meal-pref-guest-avatar" />
                            <div className="meal-pref-guest-info">
                              <span className="meal-pref-guest-name">{g.name}</span>
                              <span className="meal-pref-guest-email">{g.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`meal-pref-badge ${g.mealPreference?.toLowerCase().replace('-', '') || 'nonveg'}`}>
                            {g.mealPreference}
                          </span>
                        </td>
                        <td>
                          <span className={`meal-pref-badge ${g.allergies && g.allergies !== 'None' ? 'allergy-critical' : 'attendee'}`}>
                            {g.allergies}
                          </span>
                        </td>
                        <td>
                          <span className={`meal-pref-badge ${g.guestCategory?.toLowerCase()}`}>
                            {g.guestCategory}
                          </span>
                        </td>
                         <td style={{ textAlign: 'center' }}>
                           <span className={`meal-pref-status-badge ${g.status?.toLowerCase() === 'confirmed' ? 'confirmed' : g.status?.toLowerCase() === 'declined' ? 'declined' : 'pending'}`}>
                             {g.status || 'PENDING'}
                           </span>
                         </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="meal-pref-pagination">
            <span className="meal-pref-pagination-text">
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} total guests)
            </span>
            <div className="meal-pref-pagination-btns">
              <button 
                type="button" 
                className="btn-meal-page" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                ◀
              </button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                .filter(page => Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages)
                .map((page, index, arr) => (
                  <React.Fragment key={page}>
                    {index > 0 && arr[index - 1] !== page - 1 && (
                      <span style={{ padding: '0.25rem', color: '#94a3b8' }}>...</span>
                    )}
                    <button 
                      type="button" 
                      className={`btn-meal-page ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              <button 
                type="button" 
                className="btn-meal-page" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                ▶
              </button>
            </div>
          </div>
        </div>

        {/* Right Column Sidebar stack */}
        <div className="meal-pref-right-stack">
          {/* Procurement Card */}
          <div className="meal-pref-panel">
            <div className="meal-pref-panel-header" style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.05rem' }}>Procurement</h2>
              <span style={{ fontSize: '1rem', cursor: 'pointer', color: '#94a3b8' }} title="Procurement Metrics">ℹ️</span>
            </div>
            
            {procurementData?.categories.map((cat, idx) => (
              <div className="meal-procure-item" key={cat.name}>
                <div className="meal-procure-meta">
                  <span>{cat.name}</span>
                  <span>{cat.units} units</span>
                </div>
                <div className="meal-procure-bar">
                  <div 
                    className={`meal-procure-fill ${idx === 0 ? 'red' : idx === 1 ? 'gold' : 'green'}`} 
                    style={{ width: `${cat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}

            {/* Chef's Summary sub-card */}
            <div className="chef-summary-card">
              <div className="chef-summary-title">
                👨‍🍳 Chef's Summary
              </div>
              <ul className="chef-summary-list">
                {chefSummary?.inventoryAlerts.map(alert => (
                  <li className="chef-summary-row" key={alert.ingredient}>
                    <span>Stock Alert: {alert.ingredient}</span>
                    <span className="chef-summary-val-low">{alert.status} ({alert.remainingUnits} left)</span>
                  </li>
                ))}
                <li className="chef-summary-row">
                  <span>Prep Start Time:</span>
                  <span>{chefSummary?.preparationStartTime || '06:00 AM'}</span>
                </li>
                <li className="chef-summary-row">
                  <span>Special Request Count:</span>
                  <span>{chefSummary?.specialRequestCount || 0}</span>
                </li>
              </ul>
            </div>
            
            {/* Floating Action Button: Assign / Add Guest Preference */}
            <button type="button" className="btn-procure-fab" onClick={handleOpenQuickSearch} title="Assign / Add Guest Preference">
              +
            </button>
          </div>

          {/* Daily Special Card */}
          {dailySpecialItem && (
            <div className="daily-special-banner">
              <img 
                className="daily-special-img" 
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400" 
                alt={dailySpecialItem.name} 
              />
              <div className="daily-special-overlay">
                <span className="daily-special-badge">Daily Special</span>
                <h4 className="daily-special-title">{dailySpecialItem.name}</h4>
                <p className="daily-special-desc">{dailySpecialItem.desc}</p>
              </div>
            </div>
          )}

          {/* Smart Suggestions Card */}
          {suggestions.length > 0 && (
            <div className="suggestions-card">
              <div className="suggestions-title">
                💡 Smart Suggestions
              </div>
              <p className="suggestions-desc">
                {suggestions[0].description}
              </p>
              <button 
                type="button" 
                className="btn-apply-suggestion" 
                onClick={handleApplySuggestion}
                disabled={appliedRecommendation}
                style={{
                  backgroundColor: appliedRecommendation ? '#f1f5f9' : undefined,
                  color: appliedRecommendation ? '#94a3b8' : undefined,
                  borderColor: appliedRecommendation ? '#cbd5e1' : undefined,
                  cursor: appliedRecommendation ? 'not-allowed' : 'pointer'
                }}
              >
                {appliedRecommendation ? 'Recommendation Applied ✓' : 'Apply Recommendation'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Guest Add / Edit Modal Drawer */}
      <GuestModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setEditingGuest(null);
        }}
        onSubmit={handleSaveGuest}
        initialData={editingGuest}
        saving={saving}
        dietaryOnly={true}
      />

      {/* Quick Guest Search Modal — "Assign / Add Guest Preference" */}
      {isQuickSearchOpen && (
        <div className="menu-modal-overlay" onClick={() => setIsQuickSearchOpen(false)}>
          <div className="meal-quick-search-modal" onClick={e => e.stopPropagation()}>
            <div className="menu-modal-header">
              <h2>Assign / Add Guest Preference</h2>
              <button className="menu-modal-close" onClick={() => setIsQuickSearchOpen(false)}>✕</button>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: 0, marginBottom: '1rem' }}>
                Search for an existing guest to assign or add a meal preference and allergies.
              </p>
              <input
                type="text"
                className="menu-input"
                placeholder="🔍 Search guest to assign preference..."
                value={quickSearchQuery}
                onChange={e => setQuickSearchQuery(e.target.value)}
                autoFocus
                style={{ width: '100%', boxSizing: 'border-box', marginBottom: '1rem' }}
              />
              {quickSearchLoading && (
                <div style={{ color: '#94a3b8', fontSize: '0.875rem', textAlign: 'center', padding: '1.25rem 0' }}>
                  Searching...
                </div>
              )}
              {!quickSearchLoading && quickSearchQuery.trim() && quickSearchResults.length === 0 && (
                <div style={{ color: '#94a3b8', fontSize: '0.875rem', textAlign: 'center', padding: '1.25rem 0' }}>
                  No guests found matching &ldquo;{quickSearchQuery}&rdquo;.
                </div>
              )}
              {!quickSearchLoading && !quickSearchQuery.trim() && (
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                  Start typing to search guests...
                </div>
              )}
              <div className="meal-quick-search-results">
                {quickSearchResults.map(g => (
                  <div
                    key={g.id}
                    className="meal-quick-search-row"
                    onClick={() => handleQuickSearchSelect(g)}
                    title="Click to edit this guest's preference"
                  >
                    <img src={g.avatar} alt={g.name} className="meal-pref-guest-avatar" style={{ width: 36, height: 36, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.email}</div>
                    </div>
                    <span className={`meal-pref-badge ${g.mealPreference?.toLowerCase().replace(/[^a-z]/g, '') || 'nonveg'}`} style={{ fontSize: '0.7rem', flexShrink: 0 }}>
                      {g.mealPreference || 'Non-Veg'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Local Menu Management Modal */}
      {isMenuModalOpen && (
        <div className="menu-modal-overlay" onClick={() => setIsMenuModalOpen(false)}>
          <div className="menu-modal-container" onClick={e => e.stopPropagation()}>
            <div className="menu-modal-header">
              <h2>Catering & Dietary Menu Manager</h2>
              <button className="menu-modal-close" onClick={() => setIsMenuModalOpen(false)}>✕</button>
            </div>
            <div className="menu-modal-body">
              <div className="menu-item-list">
                {menuItems.map(item => (
                  <div key={item.id} className={`menu-item-card ${item.isDailySpecial ? 'active' : ''}`}>
                    <div className="menu-item-info">
                      <h4>{item.name}</h4>
                      <p>{item.desc} • <strong>{item.category}</strong></p>
                      {item.isDailySpecial && <span className="menu-item-badge">Daily Special ★</span>}
                    </div>
                    <div className="menu-item-actions">
                      {!item.isDailySpecial && (
                        <button 
                          className="btn-menu-action special" 
                          onClick={() => handleToggleDailySpecial(item.id)}
                        >
                          Make Special
                        </button>
                      )}
                      <button 
                        className="btn-menu-action"
                        onClick={() => handleDeleteMenuItem(item.id)}
                        style={{ color: '#ef4444' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Menu Item Form */}
              <form onSubmit={handleAddMenuItem} className="menu-form-box">
                <h3>Add New Menu Option</h3>
                <div className="menu-input-group">
                  <label>Item Name</label>
                  <input 
                    type="text" 
                    className="menu-input" 
                    placeholder="e.g. Quinoa Salad" 
                    value={newMenuName}
                    onChange={e => setNewMenuName(e.target.value)}
                  />
                </div>
                <div className="menu-input-group">
                  <label>Description</label>
                  <input 
                    type="text" 
                    className="menu-input" 
                    placeholder="Brief description of ingredients" 
                    value={newMenuDesc}
                    onChange={e => setNewMenuDesc(e.target.value)}
                  />
                </div>
                <div className="menu-input-group">
                  <label>Category</label>
                  <select 
                    className="menu-input" 
                    value={newMenuCategory}
                    onChange={e => setNewMenuCategory(e.target.value)}
                  >
                    <option value="Vegan">Vegan</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </div>
                <button type="submit" className="btn-menu-add">Add to Menu</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
