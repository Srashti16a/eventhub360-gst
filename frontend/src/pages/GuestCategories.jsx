import React, { useState, useMemo } from 'react';
import './GuestCategories.css';
import CategoryChart from '../components/GuestCategories/CategoryChart';
import CategoryCard from '../components/GuestCategories/CategoryCard';
import CategoryModal from '../components/GuestCategories/CategoryModal';
import CategoryDetailModal from '../components/GuestCategories/CategoryDetailModal';
import GuestModal from '../components/GuestManagement/GuestModal';

import api from '../services/api';

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'VIP', abbr: 'VIP', priority: 'Critical', iconType: 'vip' },
  { id: 2, name: 'Speaker', abbr: 'SPK', priority: 'High', iconType: 'speaker' },
  { id: 3, name: 'Sponsor', abbr: 'SPN', priority: 'High', iconType: 'sponsor' },
  { id: 4, name: 'Media', abbr: 'MED', priority: 'Medium', iconType: 'media' },
  { id: 5, name: 'Staff', abbr: 'STF', priority: 'Low', iconType: 'staff' },
  { id: 6, name: 'Guest', abbr: 'GST', priority: 'Low', iconType: 'guest' }
];

const loadCategories = () => {
  try {
    const saved = localStorage.getItem('guest_categories');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return DEFAULT_CATEGORIES;
};

const INITIAL_CATEGORIES = [
  { id: 1, name: 'VIP', abbr: 'VIP', priority: 'Critical', iconType: 'vip', baseCount: 0 },
  { id: 2, name: 'Speaker', abbr: 'SPK', priority: 'High', iconType: 'speaker', baseCount: 0 },
  { id: 3, name: 'Sponsor', abbr: 'SPN', priority: 'High', iconType: 'sponsor', baseCount: 0 },
  { id: 4, name: 'Media', abbr: 'MED', priority: 'Medium', iconType: 'media', baseCount: 0 },
  { id: 5, name: 'Staff', abbr: 'STF', priority: 'Low', iconType: 'staff', baseCount: 0 },
  { id: 6, name: 'Guest', abbr: 'GST', priority: 'Low', iconType: 'guest', baseCount: 0 }
];

export default function GuestCategories() {
  const [categories, setCategories] = useState(loadCategories);
  const [guests, setGuests] = useState([]);
  const [dbEvents, setDbEvents] = useState([]);
  const [toast, setToast] = useState(null);

  // Modal visibilities
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Edit / Delete states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [pendingDeleteName, setPendingDeleteName] = useState('');

  // Category Edit / Delete states
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteCategoryConfirmOpen, setDeleteCategoryConfirmOpen] = useState(false);
  const [pendingDeleteCategoryId, setPendingDeleteCategoryId] = useState(null);
  
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  React.useEffect(() => {
    fetchGuests();
    api.get('/events').then(res => {
      if (res.success) setDbEvents(res.data);
    }).catch(err => console.error(err));
  }, []);

  const fetchGuests = async () => {
    try {
      // Fetch all guests with a large limit to avoid pagination issues in frontend filtering
      const res = await api.get('/guests?page=1&limit=5000');
      if (res.success) {
        // Map backend guest to frontend format
        const mapped = res.data.map(bg => {
          // Custom mapping to local categories since backend only has flags
          let category = 'Guest';
          if (bg.isVip) category = 'VIP';
          else if (bg.isSpeaker) category = 'Speaker';
          else if (bg.isBridalParty) category = 'Family';
          
          // Override if stored in localStorage
          const localMapping = localStorage.getItem(`guest_cat_${bg.id}`);
          if (localMapping) {
            category = localMapping;
          }

          return {
            guest_id: bg.id,
            name: bg.name,
            phone: bg.phone,
            category: category,
            email: bg.email,
            rsvpStatus: bg.status ? bg.status.toLowerCase() : 'pending',
          };
        });
        setGuests(mapped);
      }
    } catch (err) {
      console.error('Error fetching guests:', err);
      showToast('Error connecting to backend API', 'error');
    }
  };

  const saveCategories = (cats) => {
    setCategories(cats);
    localStorage.setItem('guest_categories', JSON.stringify(cats));
  };

  // Dynamically calculate counts based on guest database queries
  const computedCategories = useMemo(() => {
    return categories.map((cat) => {
      const matchCount = guests.filter(
        (g) => g.category?.toLowerCase() === cat.name.toLowerCase()
      ).length;
      return {
        ...cat,
        count: matchCount
      };
    });
  }, [categories, guests]);

  const totalGuestsCount = useMemo(() => {
    return computedCategories.reduce((sum, cat) => sum + cat.count, 0);
  }, [computedCategories]);

  // Add category handler
  const handleAddCategory = (formData) => {
    const newCategory = {
      id: Date.now(),
      name: formData.name,
      abbr: formData.abbr,
      priority: formData.priority,
      iconType: formData.iconType,
    };
    saveCategories([...categories, newCategory]);
    showToast(`Category "${formData.name}" created!`);
    setIsAddModalOpen(false);
  };

  const handleCardClick = (cat) => {
    setSelectedCategory(cat);
    setIsDetailModalOpen(true);
  };

  const filteredCategoryGuests = useMemo(() => {
    if (!selectedCategory) return [];
    return guests.filter(
      (g) => g.category?.toLowerCase() === selectedCategory.name.toLowerCase()
    );
  }, [guests, selectedCategory]);

  const handleEditGuest = (guest) => {
    setEditingGuest(guest);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (formData) => {
    try {
      if (!formData.email || formData.email.trim() === '') {
        showToast('Email is required', 'error');
        return;
      }

      const matchingEvent = dbEvents.find(e => e.category === formData.eventName) || dbEvents[0];
      const eventId = matchingEvent ? matchingEvent.id : null;
      
      if (!eventId) {
        showToast('No active events found in the database.', 'error');
        return;
      }

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: (formData.rsvpStatus === 'yes' || formData.rsvpStatus === 'confirmed') ? 'CONFIRMED' : 
                (formData.rsvpStatus === 'no' || formData.rsvpStatus === 'declined') ? 'DECLINED' : 'PENDING',
        isVip: formData.category === 'VIP',
        isSpeaker: formData.category === 'Speaker' || formData.category === 'Speakers',
        eventId
      };
      
      const isEdit = !!editingGuest?.guest_id;
      const res = isEdit 
        ? await api.put(`/guests/${editingGuest.guest_id}`, payload)
        : await api.post(`/guests`, payload);
        
      if (res.success) {
        const guestId = isEdit ? editingGuest.guest_id : res.data.id;
        
        // Persist local category override
        if (formData.category !== 'VIP' && formData.category !== 'Speaker') {
          localStorage.setItem(`guest_cat_${guestId}`, formData.category);
        } else {
          localStorage.removeItem(`guest_cat_${guestId}`);
        }
        
        await fetchGuests();
        setIsEditModalOpen(false);
        setEditingGuest(null);
        showToast(`Guest ${isEdit ? 'updated' : 'added'} successfully!`);
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving guest', 'error');
    }
  };

  const handleDeleteGuest = (guest) => {
    setPendingDeleteId(guest.guest_id);
    setPendingDeleteName(guest.name);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const res = await api.delete(`/guests/${pendingDeleteId}`);
      if (res.success) {
        await fetchGuests();
        setDeleteConfirmOpen(false);
        setPendingDeleteId(null);
        showToast('Guest deleted successfully!');
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting guest', 'error');
    }
  };

  const handleAddGuestToCategory = (cat) => {
    // Pre-fill the category for the new guest
    setEditingGuest({ category: cat.name });
    setIsEditModalOpen(true);
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setIsEditCategoryModalOpen(true);
  };

  const handleSaveCategoryEdit = (formData) => {
    const updated = categories.map(c => 
      c.id === editingCategory.id ? { ...c, name: formData.name, abbr: formData.abbr, priority: formData.priority, iconType: formData.iconType } : c
    );
    saveCategories(updated);
    setIsEditCategoryModalOpen(false);
    setEditingCategory(null);
    showToast('Category updated successfully!');
  };

  const handleDeleteCategory = (cat) => {
    setPendingDeleteCategoryId(cat.id);
    setDeleteCategoryConfirmOpen(true);
  };

  const handleConfirmDeleteCategory = async () => {
    // Uncategorize guests
    const categoryToDelete = categories.find(c => c.id === pendingDeleteCategoryId);
    if (categoryToDelete) {
      const guestsToUpdate = guests.filter(g => g.category?.toLowerCase() === categoryToDelete.name.toLowerCase());
      for (const g of guestsToUpdate) {
        // Clear local storage
        localStorage.removeItem(`guest_cat_${g.guest_id}`);
        // Clear DB flags if VIP or Speaker
        if (categoryToDelete.name === 'VIP' || categoryToDelete.name === 'Speaker') {
          try {
            await api.put(`/guests/${g.guest_id}`, { isVip: false, isSpeaker: false });
          } catch (e) { console.error('Error uncategorizing guest', e); }
        }
      }
    }

    const updated = categories.filter(c => c.id !== pendingDeleteCategoryId);
    saveCategories(updated);
    setDeleteCategoryConfirmOpen(false);
    setPendingDeleteCategoryId(null);
    showToast('Category deleted successfully!');
    fetchGuests(); // refresh guests to show them as uncategorized
  };

  return (
    <div className="categories-container">
      {toast && (
        <div className={`toast-notification toast-${toast.type || 'success'}`} style={{ position: 'fixed', bottom: '20px', right: '20px', padding: '1rem 2rem', background: toast.type === 'error' ? '#ef4444' : '#10b981', color: 'white', borderRadius: '8px', zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          {toast.message}
        </div>
      )}
      {/* Header section */}
      <header className="categories-header">
        <div className="categories-title-area">
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-light)', marginBottom: '0.5rem' }}>
            Guests <span style={{ margin: '0 0.35rem', color: 'var(--text-light)' }}>&gt;</span> <span style={{ color: '#ff4d4f' }}>Categories</span>
          </div>
          <h1>Guest Categories</h1>
          <p>Manage attendee classifications and priority levels for your upcoming high-profile events.</p>
        </div>
        
        <button
          type="button"
          className="btn-primary"
          style={{ background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => setIsAddModalOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '18px', height: '18px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span>Add Category</span>
        </button>
      </header>

      {/* Categories Distribution Visual breakdown column/bar chart */}
      <CategoryChart
        categories={computedCategories}
        guestsCount={totalGuestsCount}
      />

      {/* Grid listing Category Cards */}
      <div className="categories-grid">
        {computedCategories.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            onClick={() => handleCardClick(cat)}
            onAddGuest={() => handleAddGuestToCategory(cat)}
            onEditCategory={() => handleEditCategory(cat)}
            onDeleteCategory={() => handleDeleteCategory(cat)}
          />
        ))}
      </div>

      {/* Modals */}
      
      {/* Create Modal Form */}
      <CategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddCategory}
      />

      {/* Category Detail list popup */}
      <CategoryDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedCategory(null); }}
        category={selectedCategory}
        guests={filteredCategoryGuests}
        onEdit={handleEditGuest}
        onDelete={handleDeleteGuest}
      />

      {/* Edit Guest Modal */}
      <GuestModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingGuest(null); }}
        onSubmit={handleSaveEdit}
        initialData={editingGuest}
        saving={false}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-body" style={{ textAlign: 'center', paddingTop: '2rem' }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%', background: '#fee2e2',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem'
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
              <button type="button" className="btn-secondary" onClick={() => setDeleteConfirmOpen(false)} style={{ minWidth: '110px' }}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
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

      {/* Edit Category Modal */}
      <CategoryModal
        isOpen={isEditCategoryModalOpen}
        onClose={() => setIsEditCategoryModalOpen(false)}
        onSubmit={handleSaveCategoryEdit}
        initialData={editingCategory}
      />

      {/* Delete Category Confirmation Modal */}
      {deleteCategoryConfirmOpen && (
        <div className="modal-overlay" onClick={() => setDeleteCategoryConfirmOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-body" style={{ textAlign: 'center', paddingTop: '2rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#dc2626" style={{ width: '28px', height: '28px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Are you sure?</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Delete this category? All guests in this category will become uncategorized. This cannot be undone.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', gap: '1rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setDeleteCategoryConfirmOpen(false)} style={{ minWidth: '110px' }}>Cancel</button>
              <button type="button" className="btn-primary" onClick={handleConfirmDeleteCategory} style={{ minWidth: '110px', background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
