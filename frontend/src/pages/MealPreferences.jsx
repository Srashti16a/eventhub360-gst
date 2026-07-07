import React, { useState, useMemo } from 'react';
import './MealPreferences.css';

// Pre-defined mock data to guarantee the correct values are displayed
const MOCK_GUESTS = [
  {
    id: 1,
    name: 'Julianne Smith',
    email: 'j.smith@techcorp.com',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDagv6LSbx5zZTxRxLEhwRBThV9E17RwXZwnQQsyaOFFHK8Bdb1XG1a4xexUOwD47jr0jGkVaNYaqVRpcdVW0yHtQVng6uxF7JJf5Zk6AllcpshniXUYbikUGCjNpmknbaUDVkwjYqpKIuVf8WvCYHrJ_7fcQL8WrRezkJxMhAfC3XWFS7DhLmX2oSBkRUHAhxWS91r_etfVMelgIb5goHS6ZutREr352iC6jIDttTlw2Gvj0HT8VybWV5vvDl3lkIvWUAI8_Zvzg8',
    preference: 'Vegan',
    allergies: 'Nuts (Severe)',
    category: 'Speaker',
    status: 'Confirmed'
  },
  {
    id: 2,
    name: 'Marcus Wright',
    email: 'marcus.w@global.io',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBp0zHu48zV1cHQI3fU7NsCG92KR7Rs1U0VLPTh-qfHIQyVY_o5q1Lebdf2WxiX0bnjpDSFrhwEWlR7fLbGMEMYPBkytq9HUoqjE-EPe12A86GDv4c2sFTDdVk21D9UPP4CZH1mDV0axYXYr6_yvgzxd4wyFmoT2ZhHMQfO_wh9XNKJvekrAt-eTFnPH2VDINjH3y9-pKvFjzay3pjBADFPpH0HCUxZhVsX7-S5NpYz3urye_zu4Vc21FkbiZU-XiXIW3TDT9QXpxM',
    preference: 'Non-Veg',
    allergies: 'None',
    category: 'VIP',
    status: 'Confirmed'
  },
  {
    id: 3,
    name: 'Sarah Chen',
    email: 's.chen@innovate.net',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAl1o_afMaHTijb3ZaTepuMiuCwZDCkN3yEIIjiyOWyTMLjiJ4pdYIRU2I1myGgFBFLTyi3rMEnDu2RvK-tOt9K-UJNZJglY6DXXJZVs-k_qNCYEEI2agbf7e-2v9H4QmsN75tYP1InHGrrkuJgJEyQR6qPVTNvkDHDd9O_Uda-tAMzq-WD_fXL-29WqCmSoETol-QleDUi7w6quKtDmKPjm3GJqY61U3yymBTWyv1Lb929KDwlgCszgkpR-jZ_Ia-WliUWBUyhHI',
    preference: 'Gluten-Free',
    allergies: 'Shellfish',
    category: 'Attendee',
    status: 'Pending'
  },
  {
    id: 4,
    name: 'David Miller',
    email: 'd.miller@exective.com',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHy3HKuTC_R7QwW76y2cSDwMq6x6bklWzJRGJK--d_Xw0FVSLEV-NYgeSWoQ5eyaFhfAG_WnbQIUfnAqAC89Q2yGcTa9K8xKH8CapU2RoI0DTVzEF7ib0Yj2sXLWiiuCHgJd8f9BDgYMi4y7Qf-sHkmP_Kq8huJClpDV14X2d5SMiX-IHMUStSTg2NRG8dC0xNcKa2AWNaJMpPw0Aw-dW8HdwqJKx-_lDJ2MuzhuZjND-EppfcpCIQnyfoqWRxcFdhBb4PSlfSlHY',
    preference: 'Keto',
    allergies: 'None',
    category: 'VIP',
    status: 'Confirmed'
  }
];

export default function MealPreferences() {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedPreference, setSelectedPreference] = useState('All Preferences');
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedRecommendation, setAppliedRecommendation] = useState(false);

  const filteredGuests = useMemo(() => {
    return MOCK_GUESTS.filter(g => {
      const matchCat = selectedCategory === 'All Categories' || g.category === selectedCategory;
      const matchPref = selectedPreference === 'All Preferences' || g.preference === selectedPreference;
      return matchCat && matchPref;
    });
  }, [selectedCategory, selectedPreference]);

  const handleExportPDF = () => {
    alert('Exporting Meal Preferences Matrix as PDF...');
  };

  const handleManageMenu = () => {
    alert('Opening Catering & Dietary Menu Manager...');
  };

  const handleApplySuggestion = () => {
    setAppliedRecommendation(true);
    alert('Recommendation applied: Nut-Free appetizer procurement count increased by 15%.');
  };

  const handleAddCustom = () => {
    alert('Opening wizard to add custom dietary requirement...');
  };

  return (
    <div className="meal-pref-container">
      {/* Header Area */}
      <header className="meal-pref-header">
        <div className="meal-pref-title-area">
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            Accommodation <span style={{ margin: '0 0.35rem', color: '#94a3b8' }}>/</span> <span style={{ color: '#ff4d4f' }}>Meal Preferences</span>
          </div>
          <h1>Meal Preferences Matrix</h1>
          <p>Global Tech Summit 2024 • Catering & Dietary Management</p>
        </div>

        <div className="meal-pref-actions">
          <button type="button" className="btn-meal-secondary" onClick={handleExportPDF}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export PDF</span>
          </button>
          <button type="button" className="btn-meal-primary" onClick={handleManageMenu}>
            ✏️ Manage Menu
          </button>
        </div>
      </header>

      {/* Stats row */}
      <section className="meal-pref-stats-grid">
        {/* Total Guests */}
        <div className="meal-pref-stat-card">
          <div className="meal-pref-card-header">
            <div className="meal-pref-icon-wrap guests">👥</div>
            <span className="meal-pref-card-badge green">+12% vs last month</span>
          </div>
          <div className="meal-pref-card-body">
            <h3>Total Guests</h3>
            <p className="meal-pref-val">1,248</p>
            <div className="meal-pref-allergy-alert">
              ⚠️ 42 Allergy Alerts
            </div>
          </div>
        </div>

        {/* Vegan */}
        <div className="meal-pref-stat-card">
          <div className="meal-pref-card-header">
            <div className="meal-pref-icon-wrap vegan">🌱</div>
            <span className="meal-pref-card-badge grey">18% of total</span>
          </div>
          <div className="meal-pref-card-body">
            <h3>Vegan</h3>
            <p className="meal-pref-val">225</p>
            <div className="meal-pref-progress-bg">
              <div className="meal-pref-progress-fill vegan" style={{ width: '18%' }}></div>
            </div>
          </div>
        </div>

        {/* Vegetarian */}
        <div className="meal-pref-stat-card">
          <div className="meal-pref-card-header">
            <div className="meal-pref-icon-wrap vegetarian">🥚</div>
            <span className="meal-pref-card-badge grey">32% of total</span>
          </div>
          <div className="meal-pref-card-body">
            <h3>Vegetarian</h3>
            <p className="meal-pref-val">402</p>
            <div className="meal-pref-progress-bg">
              <div className="meal-pref-progress-fill vegetarian" style={{ width: '32%' }}></div>
            </div>
          </div>
        </div>

        {/* Non-Veg */}
        <div className="meal-pref-stat-card">
          <div className="meal-pref-card-header">
            <div className="meal-pref-icon-wrap nonveg">🍗</div>
            <span className="meal-pref-card-badge grey">50% of total</span>
          </div>
          <div className="meal-pref-card-body">
            <h3>Non-Veg</h3>
            <p className="meal-pref-val">621</p>
            <div className="meal-pref-progress-bg">
              <div className="meal-pref-progress-fill nonveg" style={{ width: '50%' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Split Section */}
      <section className="meal-pref-split-layout">
        {/* Left Column: Guest Preference Log */}
        <div className="meal-pref-panel">
          <div className="meal-pref-panel-header">
            <h2>Guest Preference Log</h2>
            <div className="meal-pref-filters">
              <select 
                className="meal-pref-select"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
              >
                <option value="All Categories">All Categories</option>
                <option value="VIP">VIP</option>
                <option value="Speaker">Speaker</option>
                <option value="Attendee">Attendee</option>
              </select>
              <select
                className="meal-pref-select"
                value={selectedPreference}
                onChange={e => setSelectedPreference(e.target.value)}
              >
                <option value="All Preferences">All Preferences</option>
                <option value="Vegan">Vegan</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Gluten-Free">Gluten-Free</option>
                <option value="Keto">Keto</option>
              </select>
              <button 
                type="button" 
                className="btn-meal-filter-icon" 
                title="Reset Filters"
                onClick={() => {
                  setSelectedCategory('All Categories');
                  setSelectedPreference('All Preferences');
                }}
              >
                🔄
              </button>
            </div>
          </div>

          <div className="meal-pref-table-wrap">
            <table className="meal-pref-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Preference</th>
                  <th>Allergies</th>
                  <th>Category</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map(g => (
                  <tr key={g.id}>
                    <td>
                      <div className="meal-pref-guest-cell">
                        <img src={g.avatar} alt={g.name} className="meal-pref-guest-avatar" />
                        <div className="meal-pref-guest-info">
                          <span className="meal-pref-guest-name">{g.name}</span>
                          <span className="meal-pref-guest-email">{g.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`meal-pref-badge ${g.preference.toLowerCase().replace('-', '')}`}>
                        {g.preference}
                      </span>
                    </td>
                    <td>
                      {g.allergies === 'None' ? (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>None</span>
                      ) : (
                        <span className="meal-pref-badge allergy-critical">{g.allergies}</span>
                      )}
                    </td>
                    <td>
                      <span className={`meal-pref-badge ${g.category.toLowerCase()}`}>
                        {g.category}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {g.status === 'Confirmed' ? (
                        <span className="meal-pref-status-icon check" title="Confirmed">✓</span>
                      ) : (
                        <span className="meal-pref-status-icon pending" title="Pending">⏳</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredGuests.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem', fontWeight: 600 }}>
                      No guests match the selected filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="meal-pref-pagination">
            <span className="meal-pref-pagination-text">Showing {filteredGuests.length} of 1,248 entries</span>
            <div className="meal-pref-pagination-btns">
              <button className="btn-meal-page" type="button" onClick={() => setCurrentPage(1)}>‹</button>
              <button className={`btn-meal-page ${currentPage === 1 ? 'active' : ''}`} type="button" onClick={() => setCurrentPage(1)}>1</button>
              <button className={`btn-meal-page ${currentPage === 2 ? 'active' : ''}`} type="button" onClick={() => setCurrentPage(2)}>2</button>
              <button className={`btn-meal-page ${currentPage === 3 ? 'active' : ''}`} type="button" onClick={() => setCurrentPage(3)}>3</button>
              <button className="btn-meal-page" type="button" onClick={() => setCurrentPage(3)}>›</button>
            </div>
          </div>
        </div>

        {/* Right Column Stack */}
        <div className="meal-pref-right-stack">
          {/* Procurement Card */}
          <div className="meal-pref-panel">
            <div className="meal-pref-panel-header" style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.05rem' }}>Procurement</h2>
              <span style={{ fontSize: '1rem', cursor: 'pointer', color: '#94a3b8' }} title="Procurement Metrics">ℹ️</span>
            </div>
            
            <div className="meal-procure-item">
              <div className="meal-procure-meta">
                <span>Poultry / Red Meat</span>
                <span>621 units</span>
              </div>
              <div className="meal-procure-bar">
                <div className="meal-procure-fill red" style={{ width: '50%' }}></div>
              </div>
            </div>

            <div className="meal-procure-item">
              <div className="meal-procure-meta">
                <span>Lacto-Ovo Vegetarian</span>
                <span>402 units</span>
              </div>
              <div className="meal-procure-bar">
                <div className="meal-procure-fill gold" style={{ width: '32%' }}></div>
              </div>
            </div>

            <div className="meal-procure-item">
              <div className="meal-procure-meta">
                <span>Plant-Based / Vegan</span>
                <span>225 units</span>
              </div>
              <div className="meal-procure-bar">
                <div className="meal-procure-fill green" style={{ width: '18%' }}></div>
              </div>
            </div>

            {/* Chef's Summary sub-card */}
            <div className="chef-summary-card">
              <div className="chef-summary-title">
                👨‍🍳 Chef's Summary
              </div>
              <ul className="chef-summary-list">
                <li className="chef-summary-row">
                  <span>Stock Alert: Chicken Breast</span>
                  <span className="chef-summary-val-low">Low</span>
                </li>
                <li className="chef-summary-row">
                  <span>Prep Start Time:</span>
                  <span>06:00 AM</span>
                </li>
                <li className="chef-summary-row">
                  <span>Special Request Count:</span>
                  <span>18</span>
                </li>
              </ul>
            </div>

            {/* Floating Action Button '+' */}
            <button type="button" className="btn-procure-fab" onClick={handleAddCustom} title="Add Procurement Request">
              +
            </button>
          </div>

          {/* Daily Special Card */}
          <div className="daily-special-banner">
            <img 
              className="daily-special-img" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuApwKHu5XhTKmig5zJlGNqRJzgIjkUF3EFyI29-Mvaqc4Cv0zLgjE0DOVBhnNA7XVTDyrUqg-N_7_YS3h3EW4iv0w3jV_N-GpG7bpRKI5xkm6q1KvmysA5uM2EbFFCPpivkv7QnEfShIxM7tePiMOHvLGlFJnKhIVQpdQWhQY8MdBVCO4MKNheHk_OUJrWr6LEhYeqdte3v6M30eCCIDulg0bv_i9qhMnc7pS4Fw8mQ3G8G2uVZD5IG04oJPL_f8wIpph2KcJMAM6E" 
              alt="Heritage Carrot & Miso Puree" 
            />
            <div className="daily-special-overlay">
              <span className="daily-special-badge">Daily Special</span>
              <h4 className="daily-special-title">Heritage Carrot & Miso Puree</h4>
              <p className="daily-special-desc">Curated for 225 Vegan guests</p>
            </div>
          </div>

          {/* Smart Suggestions Card */}
          <div className="suggestions-card">
            <div className="suggestions-title">
              💡 Smart Suggestions
            </div>
            <p className="suggestions-desc">
              Based on current data, we recommend increasing the <strong>Nut-Free</strong> appetizer count by 15% due to high severe allergy overlap.
            </p>
            <button 
              type="button" 
              className="btn-apply-suggestion" 
              onClick={handleApplySuggestion}
              disabled={appliedRecommendation}
              style={{
                backgroundColor: appliedRecommendation ? '#f1f5f9' : undefined,
                color: appliedRecommendation ? '#94a3b8' : undefined,
                borderColor: appliedRecommendation ? '#cbd5e1' : undefined,
                cursor: appliedRecommendation ? 'not-allowed' : 'pointer'
              }}
            >
              {appliedRecommendation ? 'Recommendation Applied ✓' : 'Apply Recommendation'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
