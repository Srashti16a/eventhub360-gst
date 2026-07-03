import React, { useState, useRef, useEffect } from 'react';

export default function CategoryCard({ category, onClick, onAddGuest, onEditCategory, onDeleteCategory }) {
  const { name, count, priority, iconType } = category;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPriorityClass = (pri) => {
    switch (pri?.toLowerCase()) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
      default:
        return 'low';
    }
  };

  const getIconClass = (name) => {
    return name?.toLowerCase() || 'guest';
  };

  // SVGs for Icons
  const renderIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'vip':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      case 'speaker':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        );
      case 'sponsor':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'media':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'staff':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'guest':
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
    }
  };

  const iconClass = getIconClass(iconType);

  return (
    <div className="category-card-box" onClick={onClick} style={{ position: 'relative' }}>
      <div className="category-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`category-priority-badge ${getPriorityClass(priority)}`} style={{ margin: 0 }}>
            {priority} Priority
          </span>
        </div>
        <div className="category-card-menu-container" ref={menuRef} style={{ position: 'relative' }}>
          <button 
            type="button"
            className="category-card-menu-trigger"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Options"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          {menuOpen && (
            <div className="category-card-dropdown" style={{
              position: 'absolute', top: '100%', right: '0', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', zIndex: 20, minWidth: '150px', padding: '0.25rem 0'
            }}>
              <button 
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onAddGuest(category); }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#374151', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Add Guest
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEditCategory(category); }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#374151', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Edit Category
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDeleteCategory(category); }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Delete Category
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <div className={`category-card-icon ${iconClass}`} style={{ marginBottom: 0 }}>
          {renderIcon(iconType)}
        </div>
        <h3 className="category-card-title" style={{ margin: 0 }}>{name}</h3>
      </div>

      <div className="category-card-count-row">
        <span className="count-label">Attendee Count</span>
        <span className={`count-value ${iconClass}`}>{count.toLocaleString()}</span>
      </div>
    </div>
  );
}
