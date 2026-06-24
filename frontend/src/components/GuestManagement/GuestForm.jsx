import React, { useState, useEffect } from 'react';

export default function GuestForm({ initialData, onSubmit, onCancel, saving }) {
  const [formData, setFormData] = useState({
    // guest table
    name: '',
    phone: '',
    category: 'Corporate', // VIP/Family/Corporate
    email: '', // Visual display helper (not in DB schema but matches Figma contact UI)
    
    // event_guest & guest_group table
    eventName: 'Corporate Gala', // Maps to event_id
    groupName: '', // Maps to guest_group.name (e.g. Speakers, Bridal Party)
    invited: true, // event_guest.invited (boolean)

    // rsvp table
    rsvpStatus: 'pending', // maps to rsvp.status (pending/confirmed/declined)
    pax: 1, // rsvp.pax
    responded_at: '', // rsvp.responded_at

    // seating table
    table_no: '', // seating.table_no
    seat_no: '', // seating.seat_no

    // meal_pref table
    preference: '', // meal_pref.preference (Veg/Non-veg/Jain/Allergy)

    // assigned hotel helper
    assignedHotel: '' // visual hotel selector
  });

  const [errors, setErrors] = useState({});
  const [events, setEvents] = useState([]);
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setEvents(res.data);
      })
      .catch((err) => console.error('Error loading events', err));

    fetch('/api/hotels')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setHotels(res.data);
      })
      .catch((err) => console.error('Error loading hotels', err));
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        phone: initialData.phone || '',
        category: initialData.category || 'Corporate',
        email: initialData.email || '',
        eventName: initialData.eventName || 'Corporate Gala',
        groupName: initialData.groupName || '',
        invited: initialData.invited !== undefined ? initialData.invited : true,
        rsvpStatus: initialData.rsvpStatus || 'pending',
        pax: initialData.pax || 1,
        responded_at: initialData.responded_at || '',
        table_no: initialData.table_no || '',
        seat_no: initialData.seat_no || '',
        preference: initialData.preference || '',
        assignedHotel: initialData.assignedHotel || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Guest Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (formData.phone.trim() && formData.phone.trim().length < 5) newErrors.phone = 'Phone number must be at least 5 characters';
    
    // Validate email format if provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    // Validate RSVP Pax
    if (formData.pax < 0) {
      newErrors.pax = 'Pax must be greater than or equal to 0';
    }

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
    <form onSubmit={handleSubmit} className="guest-editor-form">
      <div className="form-grid">
        {/* ================= GUEST TABLE DETAILS ================= */}
        <div className="form-grid-full" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#ff4d4f', fontFamily: 'var(--font-title)' }}>
            [guest] Table Columns
          </h4>
        </div>

        <div className="form-group">
          <label htmlFor="name">Guest Name *</label>
          <input
            id="name"
            type="text"
            name="name"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Jameson Vanderbilt"
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input
            id="phone"
            type="tel"
            name="phone"
            className="form-input"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. +1 (555) 012-3456"
          />
          {errors.phone && <span className="form-error">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="category">Guest category</label>
          <select
            id="category"
            name="category"
            className="form-input"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="VIP">VIP</option>
            <option value="Corporate">Corporate</option>
            <option value="Family">Family</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address (UI helper)</label>
          <input
            id="email"
            type="email"
            name="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. email@example.com"
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        {/* ================= EVENT GUEST & GROUP DETAILS ================= */}
        <div className="form-grid-full" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginTop: '1rem', marginBottom: '0.25rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#ff4d4f', fontFamily: 'var(--font-title)' }}>
            [event_guest] & [guest_group] Table Columns
          </h4>
        </div>

        <div className="form-group">
          <label htmlFor="eventName">Assigned Event</label>
          <select
            id="eventName"
            name="eventName"
            className="form-input"
            value={formData.eventName}
            onChange={handleChange}
          >
            {events.length > 0 ? (
              events.map((event) => (
                <option key={event.id} value={event.category}>
                  {event.category}
                </option>
              ))
            ) : (
              <>
                <option value="Corporate Gala">Corporate Gala</option>
                <option value="Spring Wedding">Spring Wedding</option>
                <option value="Charity Gala">Charity Gala</option>
                <option value="Product Launch">Product Launch</option>
              </>
            )}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="groupName">Group Label (e.g. Speakers, Bridal Party)</label>
          <input
            id="groupName"
            type="text"
            name="groupName"
            className="form-input"
            value={formData.groupName}
            onChange={handleChange}
            placeholder="e.g. Bridal Party"
          />
        </div>

        <div className="form-group form-grid-full" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
          <input
            id="invited"
            type="checkbox"
            name="invited"
            className="custom-checkbox-input"
            checked={formData.invited}
            onChange={handleChange}
          />
          <label htmlFor="invited" style={{ textTransform: 'none', cursor: 'pointer', fontSize: '0.85rem' }}>
            Invitation sent (`invited` column)
          </label>
        </div>

        {/* ================= RSVP DETAILS ================= */}
        <div className="form-grid-full" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginTop: '1rem', marginBottom: '0.25rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#ff4d4f', fontFamily: 'var(--font-title)' }}>
            [rsvp] Table Columns
          </h4>
        </div>

        <div className="form-group">
          <label htmlFor="rsvpStatus">RSVP Status</label>
          <select
            id="rsvpStatus"
            name="rsvpStatus"
            className="form-input"
            value={formData.rsvpStatus}
            onChange={handleChange}
          >
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="declined">Declined</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="pax">Confirmed Headcount (Pax)</label>
          <input
            id="pax"
            type="number"
            name="pax"
            className="form-input"
            value={formData.pax}
            onChange={handleChange}
            min="0"
          />
          {errors.pax && <span className="form-error">{errors.pax}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="responded_at">Responded At (Date)</label>
          <input
            id="responded_at"
            type="date"
            name="responded_at"
            className="form-input"
            value={formData.responded_at}
            onChange={handleChange}
          />
        </div>

        {/* ================= SEATING DETAILS ================= */}
        <div className="form-grid-full" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginTop: '1rem', marginBottom: '0.25rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#ff4d4f', fontFamily: 'var(--font-title)' }}>
            [seating] Table Columns
          </h4>
        </div>

        <div className="form-group">
          <label htmlFor="table_no">Table Number</label>
          <input
            id="table_no"
            type="text"
            name="table_no"
            className="form-input"
            value={formData.table_no}
            onChange={handleChange}
            placeholder="e.g. T7"
          />
        </div>

        <div className="form-group">
          <label htmlFor="seat_no">Seat Number</label>
          <input
            id="seat_no"
            type="text"
            name="seat_no"
            className="form-input"
            value={formData.seat_no}
            onChange={handleChange}
            placeholder="e.g. S3"
          />
        </div>

        {/* ================= MEAL DETAILS ================= */}
        <div className="form-grid-full" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginTop: '1rem', marginBottom: '0.25rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#ff4d4f', fontFamily: 'var(--font-title)' }}>
            [meal_pref] Table Columns
          </h4>
        </div>

        <div className="form-group form-grid-full">
          <label htmlFor="preference">Meal Preference (Veg / Non-veg / Jain / Allergy)</label>
          <input
            id="preference"
            type="text"
            name="preference"
            className="form-input"
            value={formData.preference}
            onChange={handleChange}
            placeholder="e.g. Non-veg, No Shellfish"
          />
        </div>

        {/* ================= EXTERNAL HOTEL DETAILS ================= */}
        <div className="form-grid-full" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginTop: '1rem', marginBottom: '0.25rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#ff4d4f', fontFamily: 'var(--font-title)' }}>
            External Relations (Visual Display helpers)
          </h4>
        </div>

        <div className="form-group form-grid-full">
          <label htmlFor="assignedHotel">Assigned Hotel</label>
          <select
            id="assignedHotel"
            name="assignedHotel"
            className="form-input"
            value={formData.assignedHotel}
            onChange={handleChange}
          >
            <option value="—">No Hotel Assigned</option>
            {hotels.length > 0 ? (
              hotels.map((hotel) => (
                <option key={hotel.id} value={hotel.name}>
                  {hotel.name}
                </option>
              ))
            ) : (
              <>
                <option value="The Ritz-Carlton">The Ritz-Carlton</option>
                <option value="Boutique Manor">Boutique Manor</option>
                <option value="Hyatt Regency">Hyatt Regency</option>
              </>
            )}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Guest')}
        </button>
      </div>
    </form>
  );
}
