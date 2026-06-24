import React from 'react';

export default function CategoryTimeline({ categoryCounts, timelineEvents }) {
  // Find maximum category count to calculate proportions
  const maxCount = Math.max(...categoryCounts.map(c => c.count), 1);

  return (
    <div className="rsvp-lower-grid">
      {/* Guest Category Breakdown (Left Card) */}
      <div className="breakdown-card">
        <h3>Guest Category Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', marginTop: '0.5rem' }}>
          {categoryCounts.map((cat) => {
            const percentage = (cat.count / maxCount) * 100;
            return (
              <div key={cat.name} className="progress-group">
                <div className="progress-header">
                  <span>{cat.name}</span>
                  <span>{cat.count}</span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className={`progress-bar-fill ${cat.name.toLowerCase()}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Response Timeline (Right Card) */}
      <div className="timeline-card">
        <div className="timeline-card-header">
          <h3>Response Timeline</h3>
          <span className="realtime-badge">Real-time</span>
        </div>
        
        <div className="timeline-flow" style={{ marginTop: '0.5rem' }}>
          {timelineEvents.map((evt) => (
            <div key={evt.id} className="timeline-item">
              <div className={`timeline-icon-wrap ${evt.status}`}>
                {evt.status === 'accepted' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : evt.status === 'declined' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div className="timeline-content-wrap">
                <span className="timeline-desc">
                  <strong>{evt.guestName}</strong> {evt.actionText}
                </span>
                <span className="timeline-meta">
                  {evt.timeAgo} • {evt.category} Category
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
