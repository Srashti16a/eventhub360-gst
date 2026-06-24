import React from 'react';

export default function StatCards({ stats }) {
  const { total, confirmed, pending, vip } = stats;

  return (
    <div className="guest-stats-grid">
      {/* Total Guests Card */}
      <div className="stat-card">
        <div className="stat-card-header">
          <div className="stat-card-icon-wrapper guests">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className="stat-trend-badge positive">+4.2%</span>
        </div>
        <div className="stat-card-body">
          <h3>{total.toLocaleString()}</h3>
          <p>Total Guests</p>
        </div>
      </div>

      {/* Confirmed Card */}
      <div className="stat-card">
        <div className="stat-card-header">
          <div className="stat-card-icon-wrapper confirmed">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="stat-trend-badge positive">+12%</span>
        </div>
        <div className="stat-card-body">
          <h3>{confirmed.toLocaleString()}</h3>
          <p>Confirmed</p>
        </div>
      </div>

      {/* Pending RSVP Card */}
      <div className="stat-card">
        <div className="stat-card-header">
          <div className="stat-card-icon-wrapper pending">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="stat-trend-badge negative">-2%</span>
        </div>
        <div className="stat-card-body">
          <h3>{pending.toLocaleString()}</h3>
          <p>Pending RSVP</p>
        </div>
      </div>

      {/* VIP Status Card */}
      <div className="stat-card">
        <div className="stat-card-header">
          <div className="stat-card-icon-wrapper vip">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
        </div>
        <div className="stat-card-body">
          <h3>{vip}</h3>
          <p>VIP Status</p>
        </div>
      </div>
    </div>
  );
}
