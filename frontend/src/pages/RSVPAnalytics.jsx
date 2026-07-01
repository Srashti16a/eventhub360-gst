import React, { useState, useEffect, useMemo } from 'react';
import './RSVPAnalytics.css';
import RSVPStats from '../components/RSVPAnalytics/RSVPStats';
import RSVPCharts from '../components/RSVPAnalytics/RSVPCharts';
import CategoryTimeline from '../components/RSVPAnalytics/CategoryTimeline';
import RecentResponses from '../components/RSVPAnalytics/RecentResponses';
import RSVPListModal from '../components/RSVPAnalytics/RSVPListModal';

export default function RSVPAnalytics({ onViewAllGuests }) {
  const [guests, setGuests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  
  // Fetch real stats from backend
  const [stats, setStats] = useState({ total: 0, accepted: 0, declined: 0, pending: 0 });

  const fetchData = () => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          setStats({
            total: res.data.totalGuests.value,
            totalGrowth: res.data.totalGuests.growth,
            accepted: res.data.confirmed.value,
            acceptedGrowth: res.data.confirmed.growth,
            declined: res.data.totalGuests.value - res.data.confirmed.value - res.data.pendingRsvp.value,
            declinedGrowth: null,
            pending: res.data.pendingRsvp.value,
            pendingGrowth: res.data.pendingRsvp.growth
          });
        }
      })
      .catch(err => console.error('Error fetching RSVP stats:', err));

    fetch('/api/guests?limit=1000')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          setGuests(res.data);
        }
      })
      .catch(err => console.error('Error fetching guests:', err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteGuest = async (id) => {
    try {
      const res = await fetch(`/api/guests/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert('Failed to delete guest: ' + (data.error?.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error deleting guest:', err);
      alert('Network error while deleting guest.');
    }
  };

  const handleEditGuestStatus = async (id, newStatus) => {
    try {
      const dbStatus = newStatus === 'Accepted' ? 'CONFIRMED' : newStatus === 'Declined' ? 'DECLINED' : 'PENDING';
      const res = await fetch(`/api/guests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: dbStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert('Failed to update guest: ' + (data.error?.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error updating guest:', err);
      alert('Network error while updating guest.');
    }
  };

  // Compute Category Breakdown dynamically
  const categoryCounts = useMemo(() => {
    if (!guests.length) return [];
    const counts = {};
    guests.forEach(g => {
      let cat = 'Standard';
      if (g.isVip) cat = 'VIP';
      else if (g.isSpeaker) cat = 'Speaker';
      else if (g.isBridalParty) cat = 'Family';
      else if (g.isPrimaryGuest) cat = 'Corporate';
      else if (g.category) cat = g.category;
      
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // top 5 categories
  }, [guests]);

  // Compute all responses mapped to the table format
  const allResponses = useMemo(() => {
    return [...guests]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .map(g => {
        let cat = 'Standard';
        if (g.isVip) cat = 'VIP';
        else if (g.isSpeaker) cat = 'Speaker';
        else if (g.isBridalParty) cat = 'Family';
        else if (g.isPrimaryGuest) cat = 'Corporate';
        else if (g.category) cat = g.category;
        
        return {
          id: g.id,
          name: g.name,
          email: g.email,
          category: cat,
          status: (g.status === 'CONFIRMED' ? 'Accepted' : g.status === 'DECLINED' ? 'Declined' : 'Pending'),
          responseDate: new Date(g.updatedAt || g.createdAt).toLocaleDateString(),
          avatarUrl: null
        };
      });
  }, [guests]);

  // Compute Timeline dynamically
  const timelineEvents = useMemo(() => {
    return [...guests]
      .filter(g => g.status === 'CONFIRMED' || g.status === 'DECLINED')
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)
      .map((g, idx) => {
        let cat = 'Standard';
        if (g.isVip) cat = 'VIP';
        else if (g.isSpeaker) cat = 'Speaker';
        else if (g.isBridalParty) cat = 'Family';
        else if (g.isPrimaryGuest) cat = 'Corporate';
        else if (g.category) cat = g.category;
        
        return {
          id: g.id || idx,
          guestName: g.name,
          actionText: g.status === 'CONFIRMED' ? 'accepted the invitation' : 'declined the invitation',
          timeAgo: new Date(g.updatedAt).toLocaleDateString(),
          category: cat,
          status: g.status === 'CONFIRMED' ? 'accepted' : 'declined'
        };
      });
  }, [guests]);

  // CSV Report exporter
  const handleExportReport = () => {
    const headers = 'metric,value,growth_trend\n';
    const rows = [
      `"Total Invitations","${stats.total}","+12%"`,
      `"Accepted Responses","${stats.accepted}","+8.4%"`,
      `"Declined Responses","${stats.declined}","-2.1%"`,
      `"Pending RSVPs","${stats.pending}","-0.5%"`,
      `"Conversion Rate","${stats.total ? ((stats.accepted/stats.total)*100).toFixed(1) : 0}%","+5.4%"`
    ].join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rsvp_analytics_report_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rsvp-analytics-container">
      {/* Header section with breadcrumbs path */}
      <header className="rsvp-header">
        <div className="rsvp-title-area">
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            Analytics <span style={{ margin: '0 0.35rem', color: 'var(--text-light)' }}>/</span> <span style={{ color: '#ff4d4f' }}>RSVP Status</span>
          </div>
          <h1>RSVP Analytics</h1>
          <p>Gala Dinner & Awards Ceremony 2024</p>
        </div>
        
        <button
          type="button"
          className="btn-secondary"
          style={{ borderColor: 'var(--border-hover)', color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
          onClick={handleExportReport}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Export Report</span>
        </button>
      </header>

      {/* Top summary stats */}
      <RSVPStats stats={stats} onCardClick={setActiveModal} />

      {/* Conversion Rate columns and line charts */}
      <RSVPCharts stats={stats} guests={guests} />

      {/* Category breakdown bar ratios and timelines */}
      <CategoryTimeline
        categoryCounts={categoryCounts}
        timelineEvents={timelineEvents}
      />

      {/* Bottom recent responses */}
      <RecentResponses
        responses={allResponses}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onViewAllGuests={onViewAllGuests}
        onDeleteGuest={handleDeleteGuest}
        onEditGuestStatus={handleEditGuestStatus}
      />

      {/* RSVP List Modal */}
      <RSVPListModal 
        type={activeModal} 
        guests={allResponses} 
        onClose={() => setActiveModal(null)} 
      />
    </div>
  );
}
