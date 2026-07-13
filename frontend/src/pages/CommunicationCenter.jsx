import React, { useState, useMemo, useCallback } from 'react';
import './CommunicationCenter.css';
import GuestConversations from './GuestConversations';

// ─── Shared mock data ─────────────────────────────────────────────────────────
const ALL_LOGS = [
  { id: 1,  datetime: 'Oct 24, 2023\n14:20:12', channel: 'Email',    recipient: 'Julian Thorne',    contact: 'julian@company.com',  status: 'Delivered', result: 'Accepted by SMTP, bounce check passed.' },
  { id: 2,  datetime: 'Oct 24, 2023\n14:18:45', channel: 'WhatsApp', recipient: 'Sarah Montgomery', contact: '+1 (555) 098-1234',   status: 'Sent',      result: 'Handed off to WhatsApp gateway.' },
  { id: 3,  datetime: 'Oct 24, 2023\n14:15:22', channel: 'SMS',      recipient: 'David Kincaid',    contact: '+44 7700 900123',     status: 'Failed',    result: 'Invalid Number: Carrier reported 404.' },
  { id: 4,  datetime: 'Oct 24, 2023\n14:12:01', channel: 'Email',    recipient: 'Emily Zhang',      contact: 'ezhang@techflow.io',  status: 'Pending',   result: 'Carrier Delay: Retrying in 5 minutes.' },
  { id: 5,  datetime: 'Oct 24, 2023\n14:10:55', channel: 'WhatsApp', recipient: 'Robert De Luca',   contact: '+39 312 456 7890',    status: 'Read',      result: 'Read by Recipient (Double Blue Tick).' },
  { id: 6,  datetime: 'Oct 24, 2023\n14:08:33', channel: 'SMS',      recipient: 'Priya Nair',       contact: '+91 98765 43210',     status: 'Delivered', result: 'Accepted by telecom, delivery confirmed.' },
  { id: 7,  datetime: 'Oct 24, 2023\n14:06:20', channel: 'Email',    recipient: 'Marco Ricci',      contact: 'm.ricci@domain.it',   status: 'Failed',    result: 'Bounce: User mailbox full.' },
  { id: 8,  datetime: 'Oct 24, 2023\n14:04:00', channel: 'WhatsApp', recipient: 'Anna Kowalski',    contact: '+48 601 234 567',     status: 'Sent',      result: 'Handed off to WhatsApp gateway.' },
  { id: 9,  datetime: 'Oct 24, 2023\n14:01:45', channel: 'Email',    recipient: 'Liam Okafor',      contact: 'liam.ok@mail.ng',     status: 'Pending',   result: 'Queued — SMTP server responding slowly.' },
  { id: 10, datetime: 'Oct 24, 2023\n13:59:10', channel: 'SMS',      recipient: 'Chloe Dupont',     contact: '+33 6 12 34 56 78',   status: 'Delivered', result: 'Accepted by Orange FR gateway.' },
  { id: 11, datetime: 'Oct 24, 2023\n13:55:00', channel: 'Email',    recipient: 'James Thornton',   contact: 'jt@thorntonlaw.co',   status: 'Read',      result: 'Opened by recipient (tracking pixel fired).' },
  { id: 12, datetime: 'Oct 24, 2023\n13:52:18', channel: 'WhatsApp', recipient: 'Sofia Alvarez',    contact: '+34 612 345 678',     status: 'Failed',    result: 'Template not approved. Message blocked.' },
  { id: 13, datetime: 'Oct 24, 2023\n13:48:45', channel: 'SMS',      recipient: 'Yu Wei',           contact: '+86 139 0000 0000',   status: 'Delivered', result: 'Delivered via China Unicom.' },
  { id: 14, datetime: 'Oct 24, 2023\n13:46:30', channel: 'Email',    recipient: 'Amara Diallo',     contact: 'a.diallo@corp.sn',    status: 'Sent',      result: 'Queued at recipient MX — awaiting delivery report.' },
  { id: 15, datetime: 'Oct 24, 2023\n13:43:02', channel: 'WhatsApp', recipient: 'Ivan Petrov',      contact: '+7 910 123 4567',     status: 'Read',      result: 'Read by Recipient (Double Blue Tick).' },
  { id: 16, datetime: 'Oct 24, 2023\n13:40:11', channel: 'Email',    recipient: 'Natalie Brooks',   contact: 'nat@brooks.io',       status: 'Failed',    result: 'Invalid address: MX record lookup failed.' },
  { id: 17, datetime: 'Oct 24, 2023\n13:37:55', channel: 'SMS',      recipient: 'Kenji Yamamoto',   contact: '+81 90 1234 5678',    status: 'Delivered', result: 'Delivered via SoftBank JP.' },
  { id: 18, datetime: 'Oct 24, 2023\n13:34:20', channel: 'WhatsApp', recipient: 'Fatima Al-Rashid', contact: '+971 50 123 4567',    status: 'Pending',   result: 'WhatsApp rate limit — retry in 10 min.' },
  { id: 19, datetime: 'Oct 24, 2023\n13:30:00', channel: 'Email',    recipient: 'Lucas Mendes',     contact: 'lm@agencia.com.br',   status: 'Sent',      result: 'Accepted by SendGrid relay.' },
  { id: 20, datetime: 'Oct 24, 2023\n13:27:15', channel: 'SMS',      recipient: 'Aiko Sato',        contact: '+81 80 9876 5432',    status: 'Failed',    result: 'DND registry block. Message not delivered.' },
];

const CAMPAIGNS = [
  {
    id: 'c1', name: 'Gala 2024 Final Invite', subtitle: 'Sent to VIP Members',
    channel: 'Email', status: 'Sent',
    metrics: { open: '89%', click: '12%', scheduled: null },
  },
  {
    id: 'c2', name: 'Security Briefing – Day 1', subtitle: 'Staff & Security Group',
    channel: 'WhatsApp', status: 'Scheduled',
    metrics: { open: null, click: null, scheduled: 'Oct 24, 09:00 AM' },
  },
  {
    id: 'c3', name: 'Urgent: Venue Shift Update', subtitle: 'All Registrants',
    channel: 'SMS', status: 'Draft',
    metrics: { open: null, click: null, scheduled: null },
  },
];

const SEGMENTS = [
  { id: 's1', name: 'VIP Attendees',      desc: '1,240 members', color: '#e53e3e', icon: '⭐' },
  { id: 's2', name: 'Early Birds',        desc: '3,892 members', color: '#d97706', icon: '🎟' },
  { id: 's3', name: 'Sponsors & Partners',desc: '142 members',   color: '#7c3aed', icon: '🤝' },
];

const PAGE_SIZE = 10;

const CHANNEL_META = {
  Email:    { color: '#e53e3e', bg: '#fff5f5' },
  WhatsApp: { color: '#25d366', bg: '#f0fff4' },
  SMS:      { color: '#3182ce', bg: '#ebf8ff' },
};

const STATUS_META = {
  Delivered: { color: '#276749', bg: '#c6f6d5', dot: '#38a169' },
  Sent:      { color: '#276749', bg: '#c6f6d5', dot: '#38a169' },
  Failed:    { color: '#9b2c2c', bg: '#fed7d7', dot: '#e53e3e' },
  Pending:   { color: '#7b341e', bg: '#feebc8', dot: '#dd6b20' },
  Read:      { color: '#1a365d', bg: '#bee3f8', dot: '#3182ce' },
  Scheduled: { color: '#1a365d', bg: '#bee3f8', dot: '#3182ce' },
  Draft:     { color: '#4a5568', bg: '#edf2f7', dot: '#718096' },
};

// ─── Shared tiny components ───────────────────────────────────────────────────
const ChannelBadge = ({ channel }) => {
  const meta = CHANNEL_META[channel] || {};
  const icons = { Email: '✉', WhatsApp: '💬', SMS: '🗨' };
  return (
    <span className="cc-channel-badge" style={{ background: meta.bg, border: `1px solid ${meta.color}22`, color: meta.color }}>
      <span>{icons[channel]}</span>
      <span>{channel}</span>
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || { color: '#555', bg: '#eee', dot: '#888' };
  return (
    <span className="cc-status-badge" style={{ background: meta.bg, color: meta.color }}>
      <span className="cc-status-dot" style={{ background: meta.dot }} />
      {status}
    </span>
  );
};

// ─── Bar chart (pure CSS/SVG, no lib) ────────────────────────────────────────
const BarChart = ({ bars, color }) => {
  const max = Math.max(...bars);
  return (
    <div className="cc-bar-chart">
      {bars.map((v, i) => (
        <div key={i} className="cc-bar-wrap">
          <div
            className="cc-bar"
            style={{
              height: `${(v / max) * 100}%`,
              background: color,
              opacity: 0.4 + (v / max) * 0.6,
            }}
          />
        </div>
      ))}
    </div>
  );
};

// ─── Calendar mini ────────────────────────────────────────────────────────────
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const MiniCalendar = ({ campaigns = [] }) => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const DAY_HEADS = ['M','T','W','T','F','S','S'];

  // Collect scheduled campaign days for this month
  const campaignDays = {};
  campaigns.forEach(c => {
    if (c.metrics && c.metrics.scheduled) {
      const d = new Date(c.metrics.scheduled);
      if (!isNaN(d) && d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!campaignDays[day]) campaignDays[day] = [];
        campaignDays[day].push(c.name);
      }
    }
  });

  // Build grid starting Monday
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay + 6) % 7;

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const isToday = (d) => d && today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  return (
    <div className="cc-calendar">
      <div className="cc-calendar-label">CAMPAIGN CALENDAR</div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.1rem', padding: '2px 6px', borderRadius: '4px', lineHeight: 1 }}
          title="Previous month"
        >&#8249;</button>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1e293b' }}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.1rem', padding: '2px 6px', borderRadius: '4px', lineHeight: 1 }}
          title="Next month"
        >&#8250;</button>
      </div>

      <div className="cc-cal-header">
        {DAY_HEADS.map((d, i) => <span key={i} className="cc-cal-day-head">{d}</span>)}
      </div>

      {weeks.map((week, wi) => (
        <div key={wi} className="cc-cal-week">
          {week.map((day, di) => {
            const hasCampaign = day && campaignDays[day];
            const todayClass  = isToday(day) ? 'cc-cal-today' : '';
            const campClass   = hasCampaign && !isToday(day) ? 'cc-cal-event' : '';
            return (
              <span
                key={di}
                className={`cc-cal-day ${todayClass} ${campClass}`}
                title={hasCampaign ? campaignDays[day].join(', ') : ''}
                style={{ visibility: day ? 'visible' : 'hidden' }}
              >
                {day || ''}
              </span>
            );
          })}
        </div>
      ))}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.6rem', fontSize: '0.7rem', color: '#64748b' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#e53e3e', display: 'inline-block' }}/> Today
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f6e05e', display: 'inline-block' }}/> Campaign
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ── INBOX VIEW (Campaigns Dashboard) ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function InboxView() {
  const [campaigns, setCampaigns]         = useState(CAMPAIGNS);
  const [searchQuery, setSearchQuery]     = useState('');
  const [showNewModal, setShowNewModal]   = useState(false);
  const [newCampaign, setNewCampaign]     = useState({ name: '', channel: 'Email', status: 'Draft' });
  const [menuOpenId, setMenuOpenId]       = useState(null);
  const [showSegModal, setShowSegModal]   = useState(null); // segment id

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return campaigns;
    const q = searchQuery.toLowerCase();
    return campaigns.filter(c => c.name.toLowerCase().includes(q) || c.channel.toLowerCase().includes(q) || c.status.toLowerCase().includes(q));
  }, [campaigns, searchQuery]);

  const handleExportCampaigns = () => {
    const rows = ['Name,Channel,Status', ...campaigns.map(c => `"${c.name}","${c.channel}","${c.status}"`)].join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'campaigns.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateCampaign = () => {
    if (!newCampaign.name.trim()) return;
    setCampaigns(prev => [...prev, {
      id: `c${Date.now()}`,
      name: newCampaign.name,
      subtitle: 'All Guests',
      channel: newCampaign.channel,
      status: 'Draft',
      metrics: { open: null, click: null, scheduled: null },
    }]);
    setNewCampaign({ name: '', channel: 'Email', status: 'Draft' });
    setShowNewModal(false);
  };

  const handleDeleteCampaign = (id) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    setMenuOpenId(null);
  };

  const handleDuplicate = (c) => {
    setCampaigns(prev => [...prev, { ...c, id: `c${Date.now()}`, name: `${c.name} (Copy)`, status: 'Draft' }]);
    setMenuOpenId(null);
  };

  return (
    <div className="cc-inbox-wrap">
      {/* ── Top stats ── */}
      <div className="cc-inbox-stats">
        <div className="cc-inbox-stat-card">
          <div className="cc-inbox-stat-icon" style={{ background: '#fff5f5' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          </div>
          <div>
            <div className="cc-inbox-stat-label">Overall Deliverability</div>
            <div className="cc-inbox-stat-big">98.4%</div>
            <div className="cc-inbox-stat-sub" style={{ color: '#38a169' }}>↑ +2.1% from last month</div>
          </div>
        </div>

        <div className="cc-inbox-stat-card">
          <div className="cc-inbox-stat-icon" style={{ background: '#fffaf0' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <div>
            <div className="cc-inbox-stat-label">Avg. Open Rate</div>
            <div className="cc-inbox-stat-big">42.8%</div>
            <div className="cc-inbox-stat-sub" style={{ color: '#64748b' }}>— Stable across channels</div>
          </div>
        </div>

        <div className="cc-inbox-stat-card">
          <div className="cc-inbox-stat-icon" style={{ background: '#ebf8ff' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#3182ce" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/></svg>
          </div>
          <div>
            <div className="cc-inbox-stat-label">Active Campaigns</div>
            <div className="cc-inbox-stat-big">12</div>
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '4px' }}>
              <span className="cc-mini-tag cc-mini-tag--orange">4 Drafts</span>
              <span className="cc-mini-tag cc-mini-tag--blue">2 Sending</span>
            </div>
          </div>
        </div>

        <div className="cc-inbox-new-campaign-card">
          <div className="cc-new-campaign-label">New Campaign</div>
          <p className="cc-new-campaign-desc">Engage your guests across any channel instantly.</p>
          <button id="cc-launch-now-btn" className="cc-launch-btn" onClick={() => setShowNewModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Launch Now
          </button>
        </div>
      </div>

      {/* ── Main content grid ── */}
      <div className="cc-inbox-main-grid">
        {/* Left: Recent Campaigns */}
        <div className="cc-campaigns-card">
          <div className="cc-campaigns-header">
            <div>
              <h2 className="cc-campaigns-title">Recent Campaigns</h2>
              <p className="cc-campaigns-sub">Manage and track your latest communications.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button id="cc-campaign-filter-btn" className="cc-campaigns-btn" onClick={() => alert('Filter panel coming soon')}>Filter</button>
              <button id="cc-campaign-export-btn" className="cc-campaigns-btn" onClick={handleExportCampaigns}>Export</button>
            </div>
          </div>

          <table className="cc-table cc-campaigns-table">
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Metrics</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="cc-empty-row">No campaigns match your search.</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="cc-table-row">
                  <td className="cc-recipient-cell">
                    <span className="cc-recipient-name">{c.name}</span>
                    <span className="cc-recipient-contact">{c.subtitle}</span>
                  </td>
                  <td><ChannelBadge channel={c.channel} /></td>
                  <td><StatusBadge status={c.status} /></td>
                  <td className="cc-metrics-cell">
                    {c.metrics.open   && <span><strong>{c.metrics.open}</strong> Open</span>}
                    {c.metrics.click  && <span><strong>{c.metrics.click}</strong> Click</span>}
                    {c.metrics.scheduled && <span className="cc-result-cell">{c.metrics.scheduled}</span>}
                    {!c.metrics.open && !c.metrics.scheduled && <span className="cc-result-cell">N/A</span>}
                  </td>
                  <td style={{ position: 'relative' }}>
                    <button
                      className="cc-action-btn"
                      id={`cc-campaign-menu-${c.id}`}
                      onClick={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)}
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="4" r="1.5"/><circle cx="10" cy="10" r="1.5"/><circle cx="10" cy="16" r="1.5"/></svg>
                    </button>
                    {menuOpenId === c.id && (
                      <div className="cc-dropdown-menu">
                        <button onClick={() => { alert(`Editing: ${c.name}`); setMenuOpenId(null); }}>✏️ Edit</button>
                        <button onClick={() => handleDuplicate(c)}>📋 Duplicate</button>
                        <button onClick={() => handleDeleteCampaign(c.id)} style={{ color: '#e53e3e' }}>🗑 Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: Audience Segments + Calendar */}
        <div className="cc-right-col">
          {/* Audience Segments */}
          <div className="cc-segments-card">
            <div className="cc-segments-header">
              <h3 className="cc-segments-title">Audience Segments</h3>
              <button id="cc-manage-segments-btn" className="cc-manage-link" onClick={() => alert('Segment management coming soon')}>Manage</button>
            </div>
            <div className="cc-segments-list">
              {SEGMENTS.map(seg => (
                <button
                  key={seg.id}
                  id={`cc-segment-${seg.id}`}
                  className="cc-segment-row"
                  onClick={() => setShowSegModal(seg)}
                >
                  <span className="cc-seg-icon" style={{ background: `${seg.color}18` }}>{seg.icon}</span>
                  <span className="cc-seg-info">
                    <span className="cc-seg-name">{seg.name}</span>
                    <span className="cc-seg-desc">{seg.desc}</span>
                  </span>
                  <svg className="cc-seg-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="7 5 13 10 7 15" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))}
            </div>
            <MiniCalendar campaigns={campaigns} />
          </div>
        </div>
      </div>

      {/* ── Channel Orchestration ── */}
      <div className="cc-orchestration-card">
        <div className="cc-orch-header">
          <div>
            <h2 className="cc-campaigns-title">Channel Orchestration</h2>
            <p className="cc-campaigns-sub">Real-time performance across communication mediums.</p>
          </div>
          <div className="cc-orch-legend">
            <span><span className="cc-legend-dot" style={{ background: '#e53e3e' }}/>Email</span>
            <span><span className="cc-legend-dot" style={{ background: '#25d366' }}/>WhatsApp</span>
            <span><span className="cc-legend-dot" style={{ background: '#718096' }}/>SMS</span>
          </div>
        </div>

        <div className="cc-orch-grid">
          {/* Email */}
          <div className="cc-orch-channel">
            <div className="cc-orch-channel-header">
              <span className="cc-channel-badge" style={{ background: '#fff5f5', border: '1px solid #e53e3e22', color: '#e53e3e' }}>✉ Email</span>
              <span className="cc-orch-trend cc-orch-trend--up">+12% vs last wk</span>
            </div>
            <BarChart bars={[40,55,35,65,45,80,95]} color="#e53e3e" />
            <div className="cc-orch-metrics">
              <div className="cc-orch-metric"><span>Delivery Rate</span><strong>99.2%</strong></div>
              <div className="cc-orch-metric"><span>Bounce Rate</span><strong>0.4%</strong></div>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="cc-orch-channel">
            <div className="cc-orch-channel-header">
              <span className="cc-channel-badge" style={{ background: '#f0fff4', border: '1px solid #25d36622', color: '#25d366' }}>💬 WhatsApp</span>
              <span className="cc-orch-trend cc-orch-trend--up">+45% vs last wk</span>
            </div>
            <BarChart bars={[30,40,50,55,70,85,100]} color="#25d366" />
            <div className="cc-orch-metrics">
              <div className="cc-orch-metric"><span>Avg. Response Time</span><strong>4.2m</strong></div>
              <div className="cc-orch-metric"><span>Interactive Rate</span><strong>28.4%</strong></div>
            </div>
          </div>

          {/* SMS */}
          <div className="cc-orch-channel">
            <div className="cc-orch-channel-header">
              <span className="cc-channel-badge" style={{ background: '#f7fafc', border: '1px solid #71809622', color: '#718096' }}>🗨 SMS</span>
              <span className="cc-orch-trend cc-orch-trend--flat">Flat</span>
            </div>
            <BarChart bars={[60,62,58,63,60,65,61]} color="#718096" />
            <div className="cc-orch-metrics">
              <div className="cc-orch-metric"><span>Local Rate</span><strong>100%</strong></div>
              <div className="cc-orch-metric"><span>Opt-out Rate</span><strong>0.12%</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating compose button */}
      <button id="cc-compose-fab" className="cc-fab" onClick={() => setShowNewModal(true)} title="Compose new campaign">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* ── New Campaign Modal ── */}
      {showNewModal && (
        <div className="cc-modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="cc-modal" onClick={e => e.stopPropagation()}>
            <div className="cc-modal-header">
              <h3>Create New Campaign</h3>
              <button className="cc-modal-close" onClick={() => setShowNewModal(false)}>✕</button>
            </div>
            <div className="cc-modal-body" style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem' }}>
              <div className="cc-form-field">
                <label>Campaign Name</label>
                <input
                  id="cc-new-campaign-name"
                  type="text"
                  placeholder="e.g. VIP Welcome Message"
                  value={newCampaign.name}
                  onChange={e => setNewCampaign(p => ({ ...p, name: e.target.value }))}
                  className="cc-search-input"
                  style={{ borderRadius: '8px', padding: '0.6rem 0.9rem' }}
                />
              </div>
              <div className="cc-form-field" style={{ marginTop: '1rem' }}>
                <label>Channel</label>
                <select
                  id="cc-new-campaign-channel"
                  className="cc-status-select"
                  style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 0.9rem', width: '100%', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.85rem' }}
                  value={newCampaign.channel}
                  onChange={e => setNewCampaign(p => ({ ...p, channel: e.target.value }))}
                >
                  <option>Email</option>
                  <option>WhatsApp</option>
                  <option>SMS</option>
                </select>
              </div>
            </div>
            <div className="cc-modal-footer" style={{ gap: '0.75rem' }}>
              <button className="cc-alert-btn-secondary" onClick={() => setShowNewModal(false)}>Cancel</button>
              <button id="cc-create-campaign-btn" className="cc-alert-btn-primary" onClick={handleCreateCampaign}>Create Campaign</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Segment Detail Modal ── */}
      {showSegModal && (
        <div className="cc-modal-overlay" onClick={() => setShowSegModal(null)}>
          <div className="cc-modal" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="cc-modal-header">
              <h3>{showSegModal.icon} {showSegModal.name}</h3>
              <button className="cc-modal-close" onClick={() => setShowSegModal(null)}>✕</button>
            </div>
            <div className="cc-modal-body" style={{ padding: '1.25rem 1.5rem' }}>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
                <strong style={{ color: '#1e293b' }}>{showSegModal.desc}</strong> · Auto-updated from RSVP data
              </p>
              <div className="cc-analysis-row"><span>Segment Type</span><strong>Dynamic</strong></div>
              <div className="cc-analysis-row"><span>Last Updated</span><strong>Oct 24, 2023</strong></div>
              <div className="cc-analysis-row"><span>Campaign Eligibility</span><strong>Active</strong></div>
              <div className="cc-analysis-row"><span>Avg. Open Rate</span><strong>47.2%</strong></div>
            </div>
            <div className="cc-modal-footer">
              <button className="cc-alert-btn-secondary" onClick={() => setShowSegModal(null)}>Close</button>
              <button className="cc-alert-btn-primary" onClick={() => { setShowNewModal(true); setShowSegModal(null); }}>Send Campaign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── BROADCASTS VIEW (Communication Logs) ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function BroadcastsView() {
  const [searchQuery, setSearchQuery]       = useState('');
  const [activeChannel, setActiveChannel]   = useState('All Channels');
  const [statusFilter, setStatusFilter]     = useState('All');
  const [currentPage, setCurrentPage]       = useState(1);
  const [selectedLog, setSelectedLog]       = useState(null);
  const [showAlert, setShowAlert]           = useState(true);
  const [rerouteActive, setRerouteActive]   = useState(false);
  const [showFailureMap, setShowFailureMap] = useState(false);

  const failedCount = ALL_LOGS.filter(l => l.status === 'Failed').length;

  const filtered = useMemo(() => {
    let data = ALL_LOGS;
    if (activeChannel !== 'All Channels') data = data.filter(l => l.channel === activeChannel);
    if (statusFilter !== 'All')           data = data.filter(l => l.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(l =>
        l.recipient.toLowerCase().includes(q) ||
        l.contact.toLowerCase().includes(q) ||
        l.result.toLowerCase().includes(q) ||
        l.channel.toLowerCase().includes(q)
      );
    }
    return data;
  }, [activeChannel, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleChannelChange = useCallback((ch) => { setActiveChannel(ch); setCurrentPage(1); setSelectedLog(null); }, []);
  const handleSearch = useCallback((e) => { setSearchQuery(e.target.value); setCurrentPage(1); setSelectedLog(null); }, []);
  const handlePageChange = useCallback((p) => { setCurrentPage(p); setSelectedLog(null); }, []);

  const handleExport = () => {
    const rows = ['Date & Time,Channel,Recipient,Contact,Status,Result',
      ...ALL_LOGS.map(l => `"${l.datetime.replace('\n',' ')}","${l.channel}","${l.recipient}","${l.contact}","${l.status}","${l.result}"`)
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'comm_logs.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleReroute = () => {
    setRerouteActive(true);
    setTimeout(() => { setShowAlert(false); setRerouteActive(false); }, 1800);
  };

  const pageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <>
      {/* Header */}
      <div className="cc-header-row">
        <div>
          <h1 className="cc-title">Communication Logs</h1>
          <p className="cc-subtitle">Real-time monitoring of all guest and vendor communications.</p>
        </div>
        <button id="cc-export-btn" className="cc-export-btn" onClick={handleExport}>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 16v1a1 1 0 001 1h12a1 1 0 001-1v-1" strokeLinecap="round"/><path d="M10 3v10m0 0l-3-3m3 3l3-3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Export Logs
        </button>
      </div>

      {/* Stats */}
      <div className="cc-stats-grid">
        <div className="cc-stat-card">
          <div className="cc-stat-icon cc-stat-icon--red"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
          <div><div className="cc-stat-badge cc-stat-badge--up">+4.2%</div><div className="cc-stat-label">Total Logs</div><div className="cc-stat-value">45,280</div></div>
        </div>
        <div className="cc-stat-card">
          <div className="cc-stat-icon cc-stat-icon--green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
          <div><div className="cc-stat-badge cc-stat-badge--target">Target met</div><div className="cc-stat-label">Successful Deliveries</div><div className="cc-stat-value">98.2%</div></div>
        </div>
        <div className="cc-stat-card">
          <div className="cc-stat-icon cc-stat-icon--orange"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round"/><line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round"/></svg></div>
          <div><div className="cc-stat-badge cc-stat-badge--down">-2 active</div><div className="cc-stat-label">Active Failures</div><div className="cc-stat-value">{failedCount + 9}</div></div>
        </div>
        <div className="cc-stat-card">
          <div className="cc-stat-icon cc-stat-icon--purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
          <div><div className="cc-stat-badge cc-stat-badge--neutral">Low latency</div><div className="cc-stat-label">Average Latency</div><div className="cc-stat-value">1.2s</div></div>
        </div>
      </div>

      {/* Table card */}
      <div className="cc-table-card">
        <div className="cc-filters-row">
          <div className="cc-channel-tabs">
            {['All Channels','Email','WhatsApp','SMS'].map(ch => (
              <button key={ch} id={`cc-tab-${ch.replace(' ','-').toLowerCase()}`}
                className={`cc-channel-tab ${activeChannel === ch ? 'active' : ''}`}
                onClick={() => handleChannelChange(ch)}>{ch}</button>
            ))}
          </div>
          <div className="cc-right-filters">
            <div className="cc-filter-pill">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 14, height: 14 }}><path d="M3 5h14M5 10h10M7 15h6" strokeLinecap="round"/></svg>
              <span>Status:</span>
              <select id="cc-status-filter" className="cc-status-select" value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                {['All','Delivered','Sent','Failed','Pending','Read'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="cc-filter-pill">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 14, height: 14 }}><rect x="2" y="3" width="16" height="15" rx="2"/><line x1="2" y1="7" x2="18" y2="7" strokeLinecap="round"/><line x1="6" y1="2" x2="6" y2="5" strokeLinecap="round"/><line x1="14" y1="2" x2="14" y2="5" strokeLinecap="round"/></svg>
              <span>Oct 24, 2023 – Today</span>
            </div>
            <div className="cc-results-count">
              Showing {Math.min((currentPage-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(currentPage*PAGE_SIZE, filtered.length)} of <strong>{filtered.length.toLocaleString()}</strong> results
            </div>
          </div>
        </div>

        {/* Search inside broadcasts */}
        <div style={{ padding: '0.5rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
          <div className="cc-search-wrap" style={{ maxWidth: '340px' }}>
            <svg className="cc-search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="9" r="6"/><path d="M13.5 13.5l4 4" strokeLinecap="round"/></svg>
            <input id="cc-broadcasts-search" type="text" placeholder="Search logs, recipients..." value={searchQuery} onChange={handleSearch} className="cc-search-input" style={{ paddingTop: '0.4rem', paddingBottom: '0.4rem' }}/>
          </div>
        </div>

        <div className="cc-table-wrap">
          <table className="cc-table">
            <thead>
              <tr><th>Date &amp; Time</th><th>Channel</th><th>Recipient</th><th>Status</th><th>Delivery Result</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={6} className="cc-empty-row">No logs match your filters.</td></tr>
              ) : paginated.map(log => (
                <tr key={log.id} className={`cc-table-row ${selectedLog?.id === log.id ? 'selected' : ''}`}
                  onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}>
                  <td className="cc-date-cell">
                    {log.datetime.split('\n').map((line,i) => <span key={i} className={i===0?'cc-date-main':'cc-date-time'}>{line}</span>)}
                  </td>
                  <td><ChannelBadge channel={log.channel} /></td>
                  <td className="cc-recipient-cell">
                    <span className="cc-recipient-name">{log.recipient}</span>
                    <span className="cc-recipient-contact">{log.contact}</span>
                  </td>
                  <td><StatusBadge status={log.status} /></td>
                  <td className="cc-result-cell">{log.result}</td>
                  <td>
                    <button className="cc-action-btn" onClick={e => { e.stopPropagation(); setSelectedLog(selectedLog?.id === log.id ? null : log); }}>
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10" cy="10" r="8"/><line x1="10" y1="7" x2="10" y2="7.5" strokeLinecap="round" strokeWidth="2"/><line x1="10" y1="10" x2="10" y2="14" strokeLinecap="round"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cc-pagination">
          <button className="cc-page-btn cc-page-nav" disabled={currentPage===1} onClick={() => handlePageChange(currentPage-1)} id="cc-prev-btn">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="13 5 7 10 13 15" strokeLinecap="round" strokeLinejoin="round"/></svg>Previous
          </button>
          <div className="cc-page-numbers">
            {pageNumbers().map((p,i) => p==='...' ? <span key={`e${i}`} className="cc-page-ellipsis">…</span> :
              <button key={p} id={`cc-page-${p}`} className={`cc-page-btn ${currentPage===p?'active':''}`} onClick={() => handlePageChange(p)}>{p}</button>)}
          </div>
          <button className="cc-page-btn cc-page-nav" disabled={currentPage===totalPages} onClick={() => handlePageChange(currentPage+1)} id="cc-next-btn">
            Next<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="7 5 13 10 7 15" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      {/* Bottom */}
      <div className="cc-bottom-row">
        <div className="cc-analysis-card">
          <div className="cc-analysis-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
          <h3 className="cc-analysis-title">Live Analysis</h3>
          {selectedLog ? (
            <div className="cc-analysis-detail">
              <div className="cc-analysis-detail-header"><span className="cc-analysis-detail-name">{selectedLog.recipient}</span><StatusBadge status={selectedLog.status}/></div>
              <div className="cc-analysis-row"><span>Channel</span><ChannelBadge channel={selectedLog.channel}/></div>
              <div className="cc-analysis-row"><span>Contact</span><strong>{selectedLog.contact}</strong></div>
              <div className="cc-analysis-row"><span>Timestamp</span><strong>{selectedLog.datetime.replace('\n',' ')}</strong></div>
              <div className="cc-analysis-row cc-analysis-row--full"><span>Delivery Result</span><span className="cc-analysis-result-text">{selectedLog.result}</span></div>
              <div className="cc-analysis-row"><span>Header Payload</span><code className="cc-analysis-code">X-Message-ID: MSG_{String(selectedLog.id).padStart(6,'0')}</code></div>
              <div className="cc-analysis-row"><span>Retry History</span><span>{selectedLog.status==='Failed'?'3 retries (last: 5 min ago)':'No retries needed'}</span></div>
            </div>
          ) : (
            <p className="cc-analysis-placeholder">Select any log entry to view detailed header information, payload data, and retry history.</p>
          )}
        </div>

        {showAlert ? (
          <div className="cc-alert-card">
            <div className="cc-alert-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth="2" style={{ width:20, height:20, flexShrink:0 }}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="cc-alert-title">Automation Alert</span>
              <button className="cc-alert-close" onClick={() => setShowAlert(false)} id="cc-alert-close">✕</button>
            </div>
            <p className="cc-alert-body">We detected <strong>12 delivery failures</strong> in the last 15 minutes. Would you like to re-route via secondary SMS gateway?</p>
            <div className="cc-alert-actions">
              <button id="cc-reroute-btn" className={`cc-alert-btn-primary ${rerouteActive?'loading':''}`} onClick={handleReroute} disabled={rerouteActive}>
                {rerouteActive ? <><span className="cc-spinner"/>Rerouting…</> : 'Re-route Traffic'}
              </button>
              <button id="cc-failure-map-btn" className="cc-alert-btn-secondary" onClick={() => setShowFailureMap(true)}>View Failure Map</button>
            </div>
          </div>
        ) : (
          <div className="cc-alert-card cc-alert-card--success">
            <div className="cc-alert-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="#38a169" strokeWidth="2" style={{ width:20, height:20 }}><polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="cc-alert-title" style={{ color:'#276749' }}>Traffic Re-routed</span>
            </div>
            <p className="cc-alert-body">All 12 failed messages have been re-routed via the secondary SMS gateway successfully.</p>
            <button className="cc-alert-btn-secondary" style={{ marginTop:'0.5rem' }} onClick={() => setShowAlert(true)}>View Alert Again</button>
          </div>
        )}
      </div>

      {showFailureMap && (
        <div className="cc-modal-overlay" onClick={() => setShowFailureMap(false)}>
          <div className="cc-modal" onClick={e => e.stopPropagation()}>
            <div className="cc-modal-header"><h3>Delivery Failure Map</h3><button className="cc-modal-close" onClick={() => setShowFailureMap(false)}>✕</button></div>
            <div className="cc-modal-body">
              <table className="cc-table">
                <thead><tr><th>Recipient</th><th>Channel</th><th>Reason</th></tr></thead>
                <tbody>
                  {ALL_LOGS.filter(l => l.status==='Failed').map(l => (
                    <tr key={l.id} className="cc-table-row">
                      <td className="cc-recipient-cell"><span className="cc-recipient-name">{l.recipient}</span><span className="cc-recipient-contact">{l.contact}</span></td>
                      <td><ChannelBadge channel={l.channel}/></td>
                      <td className="cc-result-cell">{l.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="cc-modal-footer"><button className="cc-alert-btn-primary" onClick={() => setShowFailureMap(false)}>Close</button></div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Templates placeholder ────────────────────────────────────────────────────
function TemplatesView() {
  const TEMPLATE_LIST = [
    { id:'t1', name: 'VIP Welcome',         channel: 'Email',    type: 'Onboarding',    lastUsed: 'Oct 22, 2023', opens: '91%' },
    { id:'t2', name: 'RSVP Reminder',        channel: 'WhatsApp', type: 'Reminder',      lastUsed: 'Oct 23, 2023', opens: '76%' },
    { id:'t3', name: 'Schedule Update',      channel: 'SMS',      type: 'Notification',  lastUsed: 'Oct 20, 2023', opens: '88%' },
    { id:'t4', name: 'Day-of Check-in',      channel: 'Email',    type: 'Operational',   lastUsed: 'Oct 24, 2023', opens: '94%' },
    { id:'t5', name: 'Thank You Post-Event', channel: 'Email',    type: 'Follow-up',     lastUsed: 'Oct 19, 2023', opens: '68%' },
    { id:'t6', name: 'Venue Directions',     channel: 'WhatsApp', type: 'Notification',  lastUsed: 'Oct 21, 2023', opens: '82%' },
  ];
  const [search, setSearch] = useState('');
  const filtered = TEMPLATE_LIST.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.channel.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="cc-header-row">
        <div>
          <h1 className="cc-title">Message Templates</h1>
          <p className="cc-subtitle">Reusable content blocks for every communication channel.</p>
        </div>
        <button id="cc-new-template-btn" className="cc-export-btn" onClick={() => alert('Template editor coming soon')}>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="3" x2="10" y2="17" strokeLinecap="round"/><line x1="3" y1="10" x2="17" y2="10" strokeLinecap="round"/></svg>
          New Template
        </button>
      </div>

      <div style={{ padding: '0 2rem' }}>
        <div className="cc-search-wrap" style={{ maxWidth: '340px', marginBottom: '1rem' }}>
          <svg className="cc-search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="9" r="6"/><path d="M13.5 13.5l4 4" strokeLinecap="round"/></svg>
          <input id="cc-template-search" type="text" placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} className="cc-search-input"/>
        </div>

        <div className="cc-table-card">
          <div className="cc-table-wrap">
            <table className="cc-table">
              <thead><tr><th>Template Name</th><th>Channel</th><th>Type</th><th>Last Used</th><th>Open Rate</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="cc-table-row">
                    <td className="cc-recipient-name" style={{ padding: '0.85rem 1rem' }}>{t.name}</td>
                    <td><ChannelBadge channel={t.channel}/></td>
                    <td><span className="cc-mini-tag cc-mini-tag--purple">{t.type}</span></td>
                    <td className="cc-date-main" style={{ padding: '0.85rem 1rem', color: '#64748b' }}>{t.lastUsed}</td>
                    <td><strong style={{ color: '#276749' }}>{t.opens}</strong></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="cc-action-btn" title="Edit" onClick={() => alert(`Editing template: ${t.name}`)}>
                          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2a2 2 0 012 2v1l-9 9H5v-2L14 3V2z"/><path d="M3 17h14" strokeLinecap="round"/></svg>
                        </button>
                        <button className="cc-action-btn" title="Use in Campaign" onClick={() => alert(`Using template: ${t.name}`)}>
                          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 10h10M12 7l3 3-3 3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── Root: CommunicationCenter with tab nav ────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const TABS = ['Inbox', 'Broadcasts', 'Templates', 'Conversations'];

export default function CommunicationCenter() {
  const [activeTab, setActiveTab] = useState('Inbox');

  return (
    <div className="cc-page">
      {/* ── Global Tab Bar ── */}
      <div className="cc-tab-bar">
        <div className="cc-tab-bar-inner">
          <nav className="cc-tabs">
            {TABS.map(tab => (
              <button
                key={tab}
                id={`cc-tab-${tab.toLowerCase()}`}
                className={`cc-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="cc-tab-content">
        {activeTab === 'Inbox'      && <InboxView />}
        {activeTab === 'Broadcasts' && <BroadcastsView />}
        {activeTab === 'Templates'  && <TemplatesView />}
        {activeTab === 'Conversations' && <GuestConversations />}
      </div>
    </div>
  );
}
