import React from 'react';

const ViewPlaceholder = ({ name, description, icon }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: '80vh',
    padding: '2rem',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    boxSizing: 'border-box'
  }}>
    <div style={{
      fontSize: '3rem',
      marginBottom: '1.5rem',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '80px',
      height: '80px',
      borderRadius: '20px',
      background: 'linear-gradient(135deg, #ff7a45 0%, #ff4d4f 100%)',
      color: '#ffffff',
      boxShadow: '0 10px 25px rgba(255, 77, 79, 0.2)'
    }}>
      {icon}
    </div>
    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem', color: '#1e293b', letterSpacing: '-0.02em' }}>
      {name} Section
    </h2>
    <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '480px', lineHeight: '1.6', margin: '0 auto 2rem auto' }}>
      {description}
    </p>
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '9999px',
      fontSize: '0.8rem',
      fontWeight: '600',
      color: '#ff4d4f',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
    }}>
      <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ff4d4f' }} />
      Premium Concierge Feature
    </div>
  </div>
);

export default ViewPlaceholder;
