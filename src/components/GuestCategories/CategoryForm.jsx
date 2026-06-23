import React, { useState } from 'react';

export default function CategoryForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    abbr: '',
    priority: 'Low', // Critical, High, Medium, Low
    iconType: 'guest'
  });

  const [errors, setErrors] = useState({});

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

  const selectIcon = (type) => {
    setFormData((prev) => ({ ...prev, iconType: type }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Category Name is required';
    if (!formData.abbr.trim()) {
      newErrors.abbr = 'Abbreviation is required';
    } else if (formData.abbr.length > 4) {
      newErrors.abbr = 'Abbreviation must be 4 characters or less';
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="form-group">
        <label htmlFor="catNameInput">Category Name *</label>
        <input
          id="catNameInput"
          type="text"
          name="name"
          className="form-input"
          value={formData.name}
          onChange={(e) => {
            const val = e.target.value;
            // auto-abbreviate if empty
            const generatedAbbr = val.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3);
            setFormData(prev => ({ ...prev, name: val, abbr: prev.abbr ? prev.abbr : generatedAbbr }));
            if (errors.name) setErrors(prev => ({ ...prev, name: null }));
          }}
          placeholder="e.g. VIP Host, Delegate"
        />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="catAbbrInput">Abbreviation (Max 4 chars) *</label>
        <input
          id="catAbbrInput"
          type="text"
          name="abbr"
          className="form-input"
          value={formData.abbr}
          onChange={handleChange}
          placeholder="e.g. DLG, VIP"
        />
        {errors.abbr && <span className="form-error">{errors.abbr}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="catPrioritySelect">Priority Rank</label>
        <select
          id="catPrioritySelect"
          name="priority"
          className="form-input"
          value={formData.priority}
          onChange={handleChange}
        >
          <option value="Critical">Critical Priority</option>
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>
      </div>

      {/* Visual Icon Grid Selection */}
      <div className="form-group">
        <label>Visual Vector Icon</label>
        <div className="cat-icon-select" style={{ marginTop: '0.25rem' }}>
          {[
            { type: 'vip', label: '⭐' },
            { type: 'speaker', label: '🎤' },
            { type: 'sponsor', label: '💎' },
            { type: 'media', label: '📷' },
            { type: 'staff', label: '📋' },
            { type: 'guest', label: '👤' }
          ].map((opt) => (
            <div
              key={opt.type}
              className={`cat-icon-option ${formData.iconType === opt.type ? 'selected' : ''}`}
              onClick={() => selectIcon(opt.type)}
            >
              <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{opt.label}</div>
              <span style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>{opt.type}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Add Category
        </button>
      </div>
    </form>
  );
}
