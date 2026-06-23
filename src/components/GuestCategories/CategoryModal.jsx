import React from 'react';
import CategoryForm from './CategoryForm';

export default function CategoryModal({ isOpen, onClose, onSubmit }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h2>Create Guest Classification</h2>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close dialog">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <CategoryForm onSubmit={onSubmit} onCancel={onClose} />
        </div>
      </div>
    </div>
  );
}
