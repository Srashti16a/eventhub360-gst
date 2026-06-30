import React, { useState } from 'react';

export default function RSVPCharts({ stats = { total: 0, accepted: 0, declined: 0, pending: 0 } }) {
  const [trendView, setTrendView] = useState('weekly'); // 'weekly' or 'monthly'

  // Weekly and Monthly mock wave paths for SVG
  const weeklyPath = "M 30 110 Q 110 90 190 70 T 350 90 T 510 30 T 670 60";
  const weeklyAreaPath = `${weeklyPath} L 670 140 L 30 140 Z`;

  const monthlyPath = "M 30 100 Q 110 60 190 85 T 350 40 T 510 80 T 670 20";
  const monthlyAreaPath = `${monthlyPath} L 670 140 L 30 140 Z`;

  // Calculate dynamic heights for the mini bar chart
  const conversionRate = stats.total ? (stats.accepted / stats.total) * 100 : 0;
  
  // We'll generate a mock "trend" that leads up to the current conversion rate
  const generateTrendBars = () => {
    const bars = [];
    const maxVal = Math.max(conversionRate, 20); // ensure some height
    for (let i = 0; i < 9; i++) {
      // Create a nice ascending curve that ends at the current conversion rate
      const val = Math.min(100, Math.max(15, (conversionRate * 0.4) + (i * (conversionRate * 0.6) / 8)));
      bars.push(val);
    }
    return bars;
  };

  const dynamicBars = generateTrendBars();

  return (
    <div className="rsvp-charts-grid">
      {/* RSVP Conversion Rate (Left Card) */}
      <div className="conversion-card">
        <h3>RSVP Conversion Rate</h3>
        <p>Percentage of invitees who have responded to date.</p>
        
        <div className="conversion-value-row">
          <span className="conversion-val">{conversionRate.toFixed(1)}%</span>
          <span className="stat-trend-badge positive" style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem' }}>
            ▲ +5.4%
          </span>
        </div>

        {/* Dynamic Column Chart */}
        <div className="conv-bar-chart">
          {dynamicBars.map((h, idx) => (
            <div
              key={idx}
              className="conv-bar-col"
              style={{ height: `${h}%`, opacity: 0.3 + (idx / 12) }}
            ></div>
          ))}
        </div>
      </div>

      {/* RSVP Trends (Right Card) */}
      <div className="trends-card">
        <div className="trends-card-header">
          <h3>RSVP Trends</h3>
          <div className="tabs-styled" style={{ padding: '0.15rem' }}>
            <button
              type="button"
              className={`tab-btn ${trendView === 'weekly' ? 'active' : ''}`}
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
              onClick={() => setTrendView('weekly')}
            >
              Weekly
            </button>
            <button
              type="button"
              className={`tab-btn ${trendView === 'monthly' ? 'active' : ''}`}
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
              onClick={() => setTrendView('monthly')}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* SVG Wave Line Chart */}
        <div style={{ position: 'relative', width: '100%', height: '140px', marginTop: 'auto' }}>
          <svg viewBox="0 0 700 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff4d4f" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#ff4d4f" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            <line x1="30" y1="30" x2="670" y2="30" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="30" y1="85" x2="670" y2="85" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="30" y1="140" x2="670" y2="140" stroke="#e2e8f0" strokeWidth="1" />

            {/* Gradient Area under Wave */}
            <path
              d={trendView === 'weekly' ? weeklyAreaPath : monthlyAreaPath}
              fill="url(#chartGradient)"
            />

            {/* The Main Smooth Line */}
            <path
              d={trendView === 'weekly' ? weeklyPath : monthlyPath}
              fill="none"
              stroke="#ff4d4f"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Node Points on peaks */}
            <circle cx="190" cy={trendView === 'weekly' ? 70 : 85} r="5" fill="#ff4d4f" stroke="#fff" strokeWidth="2.5" />
            <circle cx="510" cy={trendView === 'weekly' ? 30 : 80} r="5" fill="#ff4d4f" stroke="#fff" strokeWidth="2.5" />
            <circle cx="350" cy={trendView === 'weekly' ? 90 : 40} r="5" fill="#ff4d4f" stroke="#fff" strokeWidth="2.5" />
          </svg>
        </div>

        {/* X-Axis Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1rem 0 1.25rem' }}>
          {trendView === 'weekly' ? (
            ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => (
              <span key={d} style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-light)' }}>{d}</span>
            ))
          ) : (
            ['WEEK 1', 'WEEK 2', 'WEEK 3', 'WEEK 4'].map((d) => (
              <span key={d} style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-light)' }}>{d}</span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
