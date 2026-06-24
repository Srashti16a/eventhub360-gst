import React from 'react';

export default function GuestFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  activeStatusTab,
  onStatusTabChange,
  vipOnly,
  onVipToggle,
  sortAsc,
  onSortToggle,
  layout,
  onLayoutChange
}) {
  return (
    <div className="guest-filters-row">
      <div className="filters-left">
        {/* Search Input */}
        <div className="filter-group">
          <span className="filter-label">Search</span>
          <div className="search-wrapper">
            <svg
              className="search-icon"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search guests..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Event Category Dropdown */}
        <div className="filter-group">
          <span className="filter-label">Event Category</span>
          <select
            className="dropdown-styled"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="All">All Events</option>
            <option value="Corporate Gala">Corporate Gala</option>
            <option value="Spring Wedding">Spring Wedding</option>
            <option value="Charity Gala">Charity Gala</option>
            <option value="Product Launch">Product Launch</option>
          </select>
        </div>

        {/* RSVP Status Tabs */}
        <div className="filter-group">
          <span className="filter-label">RSVP Status</span>
          <div className="tabs-styled">
            {['All', 'Confirmed', 'Pending', 'Declined'].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`tab-btn ${activeStatusTab === tab ? 'active' : ''}`}
                onClick={() => onStatusTabChange(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* VIP Only Toggle */}
        <div className="filter-group">
          <span className="filter-label">Segment</span>
          <label className="toggle-wrapper">
            <input
              type="checkbox"
              className="toggle-input"
              checked={vipOnly}
              onChange={(e) => onVipToggle(e.target.checked)}
            />
            <div className="toggle-switch"></div>
            <span className="toggle-label">VIP Only</span>
          </label>
        </div>
      </div>

      <div className="filters-right">
        {/* Sort Button */}
        <button
          type="button"
          className={`control-btn ${sortAsc ? 'active' : ''}`}
          onClick={onSortToggle}
          title="Sort A-Z"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ width: '20px', height: '20px' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
            />
          </svg>
        </button>

        {/* Layout: Grid */}
        <button
          type="button"
          className={`control-btn ${layout === 'grid' ? 'active' : ''}`}
          onClick={() => onLayoutChange('grid')}
          title="Grid View"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ width: '20px', height: '20px' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        </button>

        {/* Layout: List */}
        <button
          type="button"
          className={`control-btn ${layout === 'list' ? 'active' : ''}`}
          onClick={() => onLayoutChange('list')}
          title="List View"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ width: '20px', height: '20px' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
