import React from 'react';

export default function RSVPStats({ stats, onCardClick }) {
  const { total, totalGrowth, accepted, acceptedGrowth, declined, declinedGrowth, pending, pendingGrowth } = stats;

  const renderBadge = (growth, customStyle = {}) => {
    if (!growth) return null;
    const isPositive = !growth.startsWith('-');
    const className = `stat-trend-badge ${isPositive ? 'positive' : 'negative'}`;
    const prefix = isPositive && !growth.startsWith('+') ? '+' : '';
    const arrow = isPositive ? '▲ ' : '▼ ';
    return (
      <span className={className} style={customStyle}>
        {arrow}{prefix}{growth}
      </span>
    );
  };

  return (
    <div className="guest-stats-grid">
      {/* Total Invitations */}
      <div className="stat-card" onClick={() => onCardClick('total')} style={{ cursor: 'pointer' }}>
        <div className="stat-card-header">
          <div className="stat-card-icon-wrapper guests" style={{ backgroundColor: 'rgba(255, 77, 79, 0.1)', color: '#ff4d4f' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          {renderBadge(totalGrowth)}
        </div>
        <div className="stat-card-body">
          <h3>{total?.toLocaleString() || 0}</h3>
          <p>Total Invitations</p>
        </div>
      </div>

      {/* Accepted */}
      <div className="stat-card" onClick={() => onCardClick('accepted')} style={{ cursor: 'pointer' }}>
        <div className="stat-card-header">
          <div className="stat-card-icon-wrapper confirmed" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          {renderBadge(acceptedGrowth)}
        </div>
        <div className="stat-card-body">
          <h3>{accepted?.toLocaleString() || 0}</h3>
          <p>Accepted</p>
        </div>
      </div>

      {/* Declined */}
      <div className="stat-card" onClick={() => onCardClick('declined')} style={{ cursor: 'pointer' }}>
        <div className="stat-card-header">
          <div className="stat-card-icon-wrapper pending" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          {renderBadge(declinedGrowth)}
        </div>
        <div className="stat-card-body">
          <h3>{declined?.toLocaleString() || 0}</h3>
          <p>Declined</p>
        </div>
      </div>

      {/* Pending */}
      <div className="stat-card" onClick={() => onCardClick('pending')} style={{ cursor: 'pointer' }}>
        <div className="stat-card-header">
          <div className="stat-card-icon-wrapper vip" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          {renderBadge(pendingGrowth, { backgroundColor: '#eff6ff', color: '#1d4ed8' })}
        </div>
        <div className="stat-card-body">
          <h3>{pending?.toLocaleString() || 0}</h3>
          <p>Pending</p>
        </div>
      </div>
    </div>
  );
}
