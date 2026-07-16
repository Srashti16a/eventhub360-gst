import React from 'react';
import GuestForm from './GuestForm';

export default function GuestModal({ isOpen, onClose, onSubmit, initialData, saving, dietaryOnly = false }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{dietaryOnly ? (initialData ? 'Edit Guest Preference' : 'Update Preference') : (initialData ? 'Edit Guest Record' : 'Add New Guest')}</h2>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <GuestForm initialData={initialData} onSubmit={onSubmit} onCancel={onClose} saving={saving} dietaryOnly={dietaryOnly} />
        </div>
      </div>
    </div>
  );
}
