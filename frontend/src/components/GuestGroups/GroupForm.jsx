import React, { useState, useEffect } from 'react';

export default function GroupForm({ initialData, allGuests, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    // guest_group table columns
    name: '',
    event_id: 1, // default event id
    eventName: 'Corporate Gala',

    // Helper display fields matching drawer cards
    category: 'Family', // Family, Corporate, Wedding Party, Non-Profit
    status: 'Active', // Active, Draft, Archived
    primaryGuestId: '',
    location: '',
    transportation: '',
    specialRequirement: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        event_id: initialData.event_id || 1,
        eventName: initialData.eventName || 'Corporate Gala',
        category: initialData.category || 'Family',
        status: initialData.status || 'Active',
        primaryGuestId: initialData.primaryGuestId || '',
        location: initialData.location || '',
        transportation: initialData.transportation || '',
        specialRequirement: initialData.specialRequirement || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Group Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Group Info */}
      <div className="form-grid">
        <div className="form-grid-full" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem', marginBottom: '0.25rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#ff4d4f', fontFamily: 'var(--font-title)' }}>
            Guest Group
          </h4>
        </div>

        <div className="form-group form-grid-full">
          <label htmlFor="groupNameInput">Group Name *</label>
          <input
            id="groupNameInput"
            type="text"
            name="name"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Vanderbilt Family"
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="eventSelect">Assigned Event</label>
          <select
            id="eventSelect"
            name="eventName"
            className="form-input"
            value={formData.eventName}
            onChange={(e) => {
              const val = e.target.value;
              const idMap = { 'Corporate Gala': 1, 'Spring Wedding': 2, 'Charity Gala': 3, 'Product Launch': 4 };
              setFormData(prev => ({ ...prev, eventName: val, event_id: idMap[val] || 1 }));
            }}
          >
            <option value="Corporate Gala">Corporate Gala</option>
            <option value="Spring Wedding">Spring Wedding</option>
            <option value="Charity Gala">Charity Gala</option>
            <option value="Product Launch">Product Launch</option>
          </select>
        </div>

        {/* External drawer configurations */}
        <div className="form-grid-full" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem', marginTop: '1rem', marginBottom: '0.25rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#ff4d4f', fontFamily: 'var(--font-title)' }}>
            Group Details & Status
          </h4>
        </div>

        <div className="form-group">
          <label htmlFor="categorySelect">Cohort Category</label>
          <select
            id="categorySelect"
            name="category"
            className="form-input"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="Family">Family</option>
            <option value="Corporate">Corporate</option>
            <option value="Wedding Party">Wedding Party</option>
            <option value="Non-Profit">Non-Profit</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="statusSelect">Status</label>
          <select
            id="statusSelect"
            name="status"
            className="form-input"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="primaryGuestSelect">Primary Guest Contact</label>
          <select
            id="primaryGuestSelect"
            name="primaryGuestId"
            className="form-input"
            value={formData.primaryGuestId}
            onChange={handleChange}
          >
            <option value="">Unassigned</option>
            {allGuests.map((g) => (
              <option key={g.guest_id} value={g.guest_id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="locationInput">Primary Location</label>
          <input
            id="locationInput"
            type="text"
            name="location"
            className="form-input"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. New York, USA"
          />
        </div>

        <div className="form-group">
          <label htmlFor="transportationInput">Transportation Details</label>
          <input
            id="transportationInput"
            type="text"
            name="transportation"
            className="form-input"
            value={formData.transportation}
            onChange={handleChange}
            placeholder="e.g. Private Fleet, Shuttle Bus"
          />
        </div>

        <div className="form-group form-grid-full">
          <label htmlFor="requirementsInput">Special Requirements</label>
          <textarea
            id="requirementsInput"
            name="specialRequirement"
            className="form-input"
            style={{ minHeight: '80px', fontFamily: 'var(--font-body)', resize: 'vertical' }}
            value={formData.specialRequirement}
            onChange={handleChange}
            placeholder="e.g. Requires early check-in or allergy accommodation..."
          />
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {initialData ? 'Save Details' : 'Create Group'}
        </button>
      </div>
    </form>
  );
}
