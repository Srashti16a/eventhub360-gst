import React, { useState, useMemo } from 'react';
import './RSVPAnalytics.css';
import RSVPStats from '../components/RSVPAnalytics/RSVPStats';
import RSVPCharts from '../components/RSVPAnalytics/RSVPCharts';
import CategoryTimeline from '../components/RSVPAnalytics/CategoryTimeline';
import RecentResponses from '../components/RSVPAnalytics/RecentResponses';

const INITIAL_RESPONSES = [
  { id: 1, name: 'Jonathan Doe', email: 'jonathan.d@globaltech.com', category: 'Sponsor', status: 'Accepted', responseDate: 'May 12, 2024', avatarUrl: null },
  { id: 2, name: 'Sarah Jenkins', email: 's.jenkins@creative.co', category: 'VIP', status: 'Declined', responseDate: 'May 11, 2024', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
  { id: 3, name: 'Michael Kim', email: 'm.kim@financesolutions.org', category: 'Staff', status: 'Pending', responseDate: 'Invitation Sent', avatarUrl: null }
];

const INITIAL_TIMELINE = [
  { id: 1, guestName: 'Sophia Loren', actionText: 'accepted the invitation', timeAgo: '2 minutes ago', category: 'VIP', status: 'accepted' },
  { id: 2, guestName: 'Marcus Chen', actionText: 'declined the invitation', timeAgo: '14 minutes ago', category: 'Speaker', status: 'declined' },
  { id: 3, guestName: 'Elena Rodriguez', actionText: 'accepted the invitation', timeAgo: '42 minutes ago', category: 'Sponsor', status: 'accepted' },
  { id: 4, guestName: 'James Wilson', actionText: 'opened the invitation email', timeAgo: '1 hour ago', category: 'Staff', status: 'opened' }
];

const CATEGORY_BREAKDOWN = [
  { name: 'VIP', count: 124 },
  { name: 'Speaker', count: 42 },
  { name: 'Sponsor', count: 88 },
  { name: 'Media', count: 15 },
  { name: 'Staff', count: 60 }
];

export default function RSVPAnalytics({ onViewAllGuests }) {
  const [responses, setResponses] = useState(INITIAL_RESPONSES);
  const [timeline, setTimeline] = useState(INITIAL_TIMELINE);

  // Baseline stats matching Figma dashboard
  const stats = {
    total: 1248,
    accepted: 842,
    declined: 156,
    pending: 250
  };

  // CSV Report exporter
  const handleExportReport = () => {
    const headers = 'metric,value,growth_trend\n';
    const rows = [
      `"Total Invitations","${stats.total}","+12%"`,
      `"Accepted Responses","${stats.accepted}","+8.4%"`,
      `"Declined Responses","${stats.declined}","-2.1%"`,
      `"Pending RSVPs","${stats.pending}","-0.5%"`,
      `"Conversion Rate","67.5%","+5.4%"`
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
          style={{ borderColor: 'var(--border-hover)', color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={handleExportReport}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '16px', height: '16px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Export Report</span>
        </button>
      </header>

      {/* Top summary stats */}
      <RSVPStats stats={stats} />

      {/* Conversion Rate columns and line charts */}
      <RSVPCharts />

      {/* Category breakdown bar ratios and timelines */}
      <CategoryTimeline
        categoryCounts={CATEGORY_BREAKDOWN}
        timelineEvents={timeline}
      />

      {/* Bottom recent responses */}
      <RecentResponses
        responses={responses}
        onViewAllGuests={onViewAllGuests}
      />
    </div>
  );
}
