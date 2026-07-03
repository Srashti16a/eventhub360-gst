import React from 'react';

export default function CategoryChart({ categories, guestsCount }) {
  // Find maximum count value to calculate proportional heights
  const maxCount = Math.max(...categories.map((c) => c.count), 1);

  const getColorClass = (abbr) => {
    switch (abbr) {
      case 'VIP': return '#ff4d4f';
      case 'SPK': return '#d97706';
      case 'SPN': return '#8b5cf6';
      case 'MED': return '#2563eb';
      case 'STF': return '#4b5563';
      case 'GST': return '#0f172a';
      default: return '#64748b';
    }
  };

  return (
    <div className="distribution-card">
      <h2>Category Distribution</h2>
      <p>
        Visual breakdown of your {guestsCount.toLocaleString()} total registered guests across all active classifications.
      </p>

      <div className="distribution-layout">
        {/* Left Side List */}
        <div className="distribution-list">
          {categories.map((cat) => (
            <div key={cat.id} className="distribution-list-item">
              <div className="dist-label">
                <span
                  className="dist-bullet"
                  style={{ backgroundColor: getColorClass(cat.abbr) }}
                ></span>
                <span>{cat.name}</span>
              </div>
              <span className="dist-count">{cat.count}</span>
            </div>
          ))}
        </div>

        {/* Right Side Column Bar Chart */}
        <div className="chart-container">
          {categories.map((cat) => {
            const rawPercentage = (cat.count / maxCount) * 100;
            // Bug 2 Fix: set a minimum visible bar height of 8% for any category with at least 1 guest
            const barHeightPercentage = cat.count === 0 ? 0 : Math.max(rawPercentage, 8);
            const barColor = getColorClass(cat.abbr);
            return (
              <div key={cat.id} className="chart-column">
                {/* Tooltip on Hover */}
                <div className="chart-tooltip">
                  {cat.name}: {cat.count}
                </div>
                {/* Column Bar representation */}
                <div
                  className="chart-bar-fill"
                  style={{
                    height: `${barHeightPercentage}%`,
                    backgroundColor: barColor
                  }}
                ></div>
                {/* Abbreviation label */}
                <span className="chart-axis-label">{cat.abbr}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
