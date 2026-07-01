import React, { useState } from 'react';

export default function RSVPCharts({ stats = { total: 0, accepted: 0, declined: 0, pending: 0 }, guests = [] }) {
  const [trendView, setTrendView] = useState('weekly'); // 'weekly' or 'monthly'

  // Dynamically generate SVG path from real data
  const generateChartPaths = () => {
    const counts = [];
    const now = new Date();
    
    if (trendView === 'weekly') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        d.setHours(0,0,0,0);
        counts.push({ label: d.toLocaleDateString('en-US', {weekday: 'short'}).toUpperCase(), count: 0, date: d });
      }
      
      guests.forEach(g => {
        if (!g.updatedAt && !g.createdAt) return;
        const gDate = new Date(g.updatedAt || g.createdAt);
        gDate.setHours(0,0,0,0);
        const match = counts.find(c => c.date.getTime() === gDate.getTime());
        if (match) match.count++;
      });
    } else {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        counts.push({ label: `WEEK ${4-i}`, count: 0, weekOffset: i });
      }
      
      guests.forEach(g => {
        if (!g.updatedAt && !g.createdAt) return;
        const gDate = new Date(g.updatedAt || g.createdAt);
        const diffDays = Math.floor((now - gDate) / (1000 * 60 * 60 * 24));
        const weekOffset = Math.floor(diffDays / 7);
        if (weekOffset >= 0 && weekOffset < 4) {
          const match = counts.find(c => c.weekOffset === weekOffset);
          if (match) match.count++;
        }
      });
    }

    // Scale to fit the SVG (width 640, height 110)
    const maxCount = Math.max(...counts.map(c => c.count), 5); 
    const xStep = 640 / (counts.length - 1 || 1);
    
    const points = counts.map((c, i) => {
      const x = 30 + (i * xStep);
      const y = 140 - ((c.count / maxCount) * 110);
      return { x, y, ...c };
    });
    
    // Create smooth bezier curve
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const curr = points[i];
      const prev = points[i-1];
      const cx = (prev.x + curr.x) / 2;
      path += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    
    const areaPath = `${path} L 670 140 L 30 140 Z`;
    
    return { path, areaPath, points };
  };

  const chartData = generateChartPaths();

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
              className="chart-area-animate"
              d={chartData.areaPath}
              fill="url(#chartGradient)"
            />

            {/* The Main Smooth Line */}
            <path
              className="chart-path-animate"
              d={chartData.path}
              fill="none"
              stroke="#ff4d4f"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Node Points on peaks/data points */}
            {chartData.points.map((pt, i) => (
              <circle 
                key={i} 
                className="chart-node-animate"
                cx={pt.x} 
                cy={pt.y} 
                r="4" 
                fill="#ff4d4f" 
                stroke="#fff" 
                strokeWidth="2" 
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <title>{pt.label}: {pt.count} RSVPs</title>
              </circle>
            ))}
          </svg>
        </div>

        {/* X-Axis Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1rem 0 1.25rem' }}>
          {chartData.points.map((pt, i) => (
            <span key={i} style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-light)' }}>{pt.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
