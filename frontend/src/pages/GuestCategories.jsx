import React, { useState, useMemo } from 'react';
import './GuestCategories.css';
import CategoryChart from '../components/GuestCategories/CategoryChart';
import CategoryCard from '../components/GuestCategories/CategoryCard';
import CategoryModal from '../components/GuestCategories/CategoryModal';
import CategoryDetailModal from '../components/GuestCategories/CategoryDetailModal';

// Mock Guest Database for category queries
const INITIAL_GUESTS = [
  { guest_id: 1, name: 'Arthur Vanderbilt', phone: '+1 (555) 012-3456', email: 'arthur.v@luxmail.com', category: 'VIP' },
  { guest_id: 2, name: 'Lydia Vanderbilt', phone: '+1 (555) 012-3457', email: 'lydia.v@luxmail.com', category: 'VIP' },
  { guest_id: 3, name: 'Jameson Vanderbilt', phone: '+1 (555) 012-3458', email: 'j.vanderbilt@luxmail.com', category: 'VIP' },
  { guest_id: 4, name: 'Samantha Reed', phone: '+1 (555) 444-2222', email: 'sam.reed@techcorp.io', category: 'VIP' },
  
  { guest_id: 5, name: 'Elena Rodriguez', phone: '+1 (555) 987-6543', email: 'elena.r@gmail.com', category: 'Speaker' },
  { guest_id: 6, name: 'Dr. Julian Thorne', phone: '+44 20 7123 4567', email: 'thorne.med@hospital.org', category: 'Speaker' },
  
  { guest_id: 7, name: 'Claire Thompson', phone: '+44 20 7123 4568', email: 'claire@charity.org', category: 'Sponsor' },
  { guest_id: 8, name: 'John Doe', phone: '+1 (555) 123-4567', email: 'johndoe@media.com', category: 'Media' },
  { guest_id: 9, name: 'Jane Smith', phone: '+1 (555) 123-4568', email: 'janesmith@staff.com', category: 'Staff' }
];

const INITIAL_CATEGORIES = [
  { id: 1, name: 'VIP', abbr: 'VIP', priority: 'Critical', iconType: 'vip', baseCount: 38 },
  { id: 2, name: 'Speaker', abbr: 'SPK', priority: 'High', iconType: 'speaker', baseCount: 26 },
  { id: 3, name: 'Sponsor', abbr: 'SPN', priority: 'High', iconType: 'sponsor', baseCount: 14 },
  { id: 4, name: 'Media', abbr: 'MED', priority: 'Medium', iconType: 'media', baseCount: 33 },
  { id: 5, name: 'Staff', abbr: 'STF', priority: 'Low', iconType: 'staff', baseCount: 109 },
  { id: 6, name: 'Guest', abbr: 'GST', priority: 'Low', iconType: 'guest', baseCount: 1019 }
];

export default function GuestCategories() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [guests, setGuests] = useState(INITIAL_GUESTS);

  // Modal visibilities
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Dynamically calculate counts based on guest database queries
  const computedCategories = useMemo(() => {
    return categories.map((cat) => {
      const matchCount = guests.filter(
        (g) => g.category?.toLowerCase() === cat.name.toLowerCase()
      ).length;
      return {
        ...cat,
        count: cat.baseCount + matchCount
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
      baseCount: 0
    };
    setCategories((prev) => [...prev, newCategory]);
    setIsAddModalOpen(false);
  };

  const handleCardClick = (cat) => {
    setSelectedCategory(cat);
    setIsDetailModalOpen(true);
  };

  // Filter members list matching category
  const filteredCategoryGuests = useMemo(() => {
    if (!selectedCategory) return [];
    return guests.filter(
      (g) => g.category?.toLowerCase() === selectedCategory.name.toLowerCase()
    );
  }, [guests, selectedCategory]);

  return (
    <div className="categories-container">
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
      />
    </div>
  );
}
