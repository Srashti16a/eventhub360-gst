import React, { useState } from 'react';
import GuestManagement from './pages/GuestManagement';
import GuestGroups from './pages/GuestGroups';
import GuestCategories from './pages/GuestCategories';
import RSVPAnalytics from './pages/RSVPAnalytics';
import MagicLinks from './pages/MagicLinks';
import Hotels from './pages/Hotels';
import RoomAllocation, { INITIAL_ROOMS, INITIAL_UNASSIGNED } from './pages/RoomAllocation';
import Transportation from './pages/Transportation';
import Templates from './pages/Templates';


// Sidebar Icons - SVG components matching premium design
const TransportationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="22" height="13" rx="2" ry="2" />
    <path d="M7 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
  </svg>
);

const RoomAllocationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const TemplatesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

const CampaignsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);

const ReservationsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M9 16l2 2 4-4" />
  </svg>
);

const HotelsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4v16" />
    <path d="M2 16h20" />
    <path d="M22 8v12" />
    <path d="M4 8h8a4 4 0 0 1 4 4v4H2Z" />
    <circle cx="8" cy="11" r="1" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const CRMIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="12" r="3" />
    <path d="M14 10h4M14 14h4M6 19c0-2 2-3 3-3s3 1 3 3" />
  </svg>
);

const GuestsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const EventsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const WeddingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const VendorsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const AIHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8.01" y2="16" />
    <line x1="16" y1="16" x2="16.01" y2="16" />
  </svg>
);

// Coming Soon / View Placeholder Component
const ViewPlaceholder = ({ name, description, icon }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: '80vh',
    padding: '2rem',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    boxSizing: 'border-box'
  }}>
    <div style={{
      fontSize: '3rem',
      marginBottom: '1.5rem',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '80px',
      height: '80px',
      borderRadius: '20px',
      background: 'linear-gradient(135deg, #ff7a45 0%, #ff4d4f 100%)',
      color: '#ffffff',
      boxShadow: '0 10px 25px rgba(255, 77, 79, 0.2)'
    }}>
      {icon}
    </div>
    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem', color: '#1e293b', letterSpacing: '-0.02em' }}>
      {name} Section
    </h2>
    <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '480px', lineHeight: '1.6', margin: '0 auto 2rem auto' }}>
      {description}
    </p>
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '9999px',
      fontSize: '0.8rem',
      fontWeight: '600',
      color: '#ff4d4f',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
    }}>
      <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ff4d4f' }} />
      Premium Concierge Feature
    </div>
  </div>
);

export default function App() {
  const [activeView, setActiveView] = useState('transportation'); // default to transportation view
  const [isGuestsDropdownOpen, setIsGuestsDropdownOpen] = useState(true);
  const [isAccommodationDropdownOpen, setIsAccommodationDropdownOpen] = useState(true);
  const [isTransportationDropdownOpen, setIsTransportationDropdownOpen] = useState(true);
  const [isBookRoomOpen, setIsBookRoomOpen] = useState(false);
  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem('eh360_rooms');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 60) {
        return parsed;
      }
    }
    return INITIAL_ROOMS;
  });
  const [unassignedGuests, setUnassignedGuests] = useState(() => {
    const saved = localStorage.getItem('eh360_unassigned_guests');
    return saved ? JSON.parse(saved) : INITIAL_UNASSIGNED;
  });

  const handleGuestsClick = () => {
    setIsGuestsDropdownOpen(!isGuestsDropdownOpen);
    const isCurrentlyGuest = ['guests', 'groups', 'categories', 'magic_links'].includes(activeView);
    if (!isCurrentlyGuest) {
      setActiveView('guests');
    }
  };

  const handleAccommodationClick = () => {
    setIsAccommodationDropdownOpen(!isAccommodationDropdownOpen);
    setActiveView('hotels'); // open Accommodation Dashboard when parent is clicked
  };

  const handleTransportationClick = () => {
    setIsTransportationDropdownOpen(!isTransportationDropdownOpen);
    setActiveView('transportation');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <DashboardIcon />, view: 'dashboard' },
    { name: 'Reservations', icon: <ReservationsIcon />, view: 'reservations' },
    {
      name: 'Accommodation',
      icon: <HotelsIcon />,
      view: 'hotels', // Clicking parent directly opens Hotels dashboard
      isDropdown: true,
      subItems: [
        { name: 'Room Allocation', view: 'room_allocation' }
      ]
    },
    { name: 'CRM', icon: <CRMIcon />, view: 'crm' },
    { name: 'Templates', icon: <TemplatesIcon />, view: 'templates' },
    { name: 'Campaigns', icon: <CampaignsIcon />, view: 'campaigns' },
    {
      name: 'Transportation',
      icon: <TransportationIcon />,
      view: 'transportation',
      isDropdown: true,
      subItems: [
        { name: 'Logistics Matrix', view: 'allocation_matrix' }
      ]
    },
    {
      name: 'Guests',
      icon: <GuestsIcon />,
      view: 'guests_parent',
      isDropdown: true,
      subItems: [
        { name: 'Registry', view: 'guests' },
        { name: 'Groups', view: 'groups' },
        { name: 'Directory', view: 'categories' },
        { name: 'Magic Links', view: 'magic_links' }
      ]
    },
    { name: 'Events', icon: <EventsIcon />, view: 'events' },
    { name: 'Weddings', icon: <WeddingsIcon />, view: 'weddings' },
    { name: 'Vendors', icon: <VendorsIcon />, view: 'vendors' },
    { name: 'Analytics', icon: <AnalyticsIcon />, view: 'analytics' },
    { name: 'AI Hub', icon: <AIHubIcon />, view: 'ai_hub' },
    { name: 'Settings', icon: <SettingsIcon />, view: 'settings' }
  ];


  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#0f172a' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .sidebar-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: none;
          background: transparent;
          color: #64748b;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.875rem;
          text-align: left;
          width: 100%;
          transition: all 0.2s;
          outline: none;
          box-sizing: border-box;
        }
        .sidebar-btn:hover {
          background-color: #f8fafc;
          color: #1e293b;
        }
        .sidebar-btn.active {
          background-color: #fff1f0;
          color: #a61e22;
          border-right: 3px solid #ff4d4f;
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
        .sidebar-btn.active:hover {
          background-color: #fff1f0;
        }
        .sub-item-btn {
          display: flex;
          align-items: center;
          border: none;
          background: transparent;
          color: #64748b;
          padding: 0.55rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.825rem;
          text-align: left;
          width: 100%;
          transition: all 0.2s;
          position: relative;
          outline: none;
        }
        .sub-item-btn:hover {
          color: #1e293b;
          background-color: #f8fafc;
        }
        .sub-item-btn.active {
          color: #a61e22;
          font-weight: 700;
          background-color: #fff1f0;
        }
      `}} />
      {/* Sidebar - Matching Figma Design */}
      <aside style={{
        width: '240px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
        boxSizing: 'border-box'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '2rem', paddingLeft: '0.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#ff4d4f', fontWeight: '800', letterSpacing: '-0.02em' }}>EventHub360</h2>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>Premium Concierge</span>
        </div>

        {/* Menu Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {menuItems.map((item) => {
            if (item.isDropdown) {
              const isDropdownActive = item.subItems.map(sub => sub.view).includes(activeView) || activeView === item.view;
              const isOpen = 
                item.view === 'guests_parent' ? isGuestsDropdownOpen :
                item.view === 'hotels' ? isAccommodationDropdownOpen :
                item.view === 'transportation' ? isTransportationDropdownOpen : false;

              const toggleHandler = 
                item.view === 'guests_parent' ? handleGuestsClick :
                item.view === 'hotels' ? handleAccommodationClick :
                item.view === 'transportation' ? handleTransportationClick : () => {};
              return (
                <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <button
                    className={`sidebar-btn ${isDropdownActive ? 'active' : ''}`}
                    onClick={toggleHandler}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {item.icon}
                      <span>{item.name}</span>
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transition: 'transform 0.2s',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  
                  {isOpen && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      paddingLeft: '1.25rem',
                      marginLeft: '1.25rem',
                      borderLeft: '1.5px solid #e2e8f0',
                      marginTop: '0.25rem',
                      marginBottom: '0.25rem'
                    }}>
                      {item.subItems.map((subItem) => {
                        const isSubActive = activeView === subItem.view;
                        return (
                          <button
                            key={subItem.name}
                            className={`sub-item-btn ${isSubActive ? 'active' : ''}`}
                            onClick={() => setActiveView(subItem.view)}
                          >
                            {isSubActive && (
                              <span style={{
                                position: 'absolute',
                                left: '-1.35rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#ff4d4f'
                              }} />
                            )}
                            {subItem.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = activeView === item.view;
            return (
              <button
                key={item.name}
                className={`sidebar-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveView(item.view)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {item.icon}
                  <span>{item.name}</span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* Create Event & Help */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>


          {activeView === 'events' && (
            <button style={{
              background: 'linear-gradient(135deg, #ff7a45 0%, #ff4d4f 100%)',
              border: 'none',
              color: '#fff',
              fontWeight: '600',
              fontSize: '0.875rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 77, 79, 0.2)'
            }} onClick={() => alert('Opening Create Event Dialog...')}>
              + New Event
            </button>
          )}
          
          <button style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            fontSize: '0.85rem',
            padding: '0.5rem',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '500'
          }}>
            <span>❓</span> Help Center
          </button>
          <button style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            fontSize: '0.85rem',
            padding: '0.5rem',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '500'
          }}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Navbar */}
        <header style={{
          height: '70px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          boxSizing: 'border-box'
        }}>
          {/* Header Search, Switcher & Info Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', height: '100%' }}>
            <div style={{ position: 'relative', width: '200px' }}>
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.9rem' }}>🔍</span>
              <input
                type="text"
                placeholder="Search..."
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '9999px',
                  padding: '0.5rem 1rem 0.5rem 2.25rem',
                  fontSize: '0.85rem',
                  outline: 'none',
                  width: '100%',
                  backgroundColor: '#f8fafc',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            {/* View Switcher Pills for Registry and Groups (visible when Guests is active) */}
            {(activeView === 'guests' || activeView === 'groups' || activeView === 'categories') && (
              <div style={{
                display: 'flex',
                backgroundColor: '#f1f5f9',
                padding: '0.25rem',
                borderRadius: '8px',
                gap: '0.25rem'
              }}>
                <button
                  style={{
                    border: 'none',
                    background: activeView === 'guests' ? '#ffffff' : 'transparent',
                    color: activeView === 'guests' ? '#ff4d4f' : '#64748b',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    boxShadow: activeView === 'guests' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setActiveView('guests')}
                >
                  Registry
                </button>
                <button
                  style={{
                    border: 'none',
                    background: activeView === 'groups' ? '#ffffff' : 'transparent',
                    color: activeView === 'groups' ? '#ff4d4f' : '#64748b',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    boxShadow: activeView === 'groups' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setActiveView('groups')}
                >
                  Groups
                </button>
              </div>
            )}

            {/* Navbar Directory Navigation (Figma Match) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', height: '100%', paddingLeft: '0.5rem', flexShrink: 0 }}>
              <span
                style={{
                  color: activeView === 'categories' ? '#ff4d4f' : '#64748b',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: activeView === 'categories' ? '3px solid #ff4d4f' : '3px solid transparent',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => {
                  setActiveView('categories');
                }}
              >
                Directory
              </span>
              
              <span
                style={{
                  color: '#64748b',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '3px solid transparent',
                  boxSizing: 'border-box',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => alert('Resources section clicked.')}
              >
                Resources
              </span>
            </div>
          </div>

          {/* User Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>🔔</button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>💬</button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid #e2e8f0', paddingLeft: '1.25rem' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>
                  {activeView === 'magic_links' ? 'Alex Rivera' : 'Sarah Jenkins'}
                </span>
                <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>
                  {activeView === 'magic_links' ? 'Event Director' : 'Senior Concierge'}
                </span>
              </div>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff7a45 0%, #ff4d4f 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.9rem'
              }}>
                {activeView === 'magic_links' ? 'AR' : 'SJ'}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Screen Area */}
        <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8fafc' }}>
          {activeView === 'guests' ? (
            <GuestManagement />
          ) : activeView === 'groups' ? (
            <GuestGroups />
          ) : activeView === 'categories' ? (
            <GuestCategories />
          ) : activeView === 'magic_links' ? (
            <MagicLinks />
          ) : activeView === 'room_allocation' ? (
            <RoomAllocation 
              rooms={rooms}
              setRooms={setRooms}
              unassignedGuests={unassignedGuests}
              setUnassignedGuests={setUnassignedGuests}
            />
          ) : activeView === 'hotels' ? (
            <Hotels isBookRoomOpen={isBookRoomOpen} setIsBookRoomOpen={setIsBookRoomOpen} rooms={rooms} />
          ) : activeView === 'transportation' ? (
            <Transportation activeTab="overview" />
          ) : activeView === 'allocation_matrix' ? (
            <Transportation activeTab="allocation" />
          ) : activeView === 'driver_portal' ? (
            <Transportation activeTab="drivers" />
          ) : activeView === 'templates' ? (
            <Templates />
          ) : activeView === 'campaigns' ? (
            <ViewPlaceholder
              name="Campaigns"
              icon={<CampaignsIcon />}
              description="Deploy and track email and WhatsApp broadcast campaigns, log dispatch outcomes, and monitor delivery analytics."
            />
          ) : activeView === 'reservations' ? (
            <ViewPlaceholder
              name="Reservations"
              icon={<ReservationsIcon />}
              description="Manage block bookings, check lists, guest list imports and reservation histories for all hotel partners."
            />
          ) : activeView === 'settings' ? (
            <ViewPlaceholder
              name="Settings"
              icon={<SettingsIcon />}
              description="Configure room types, hotel partners API integration keys, metadata mappings, and pricing rules."
            />
          ) : activeView === 'analytics' ? (
            <RSVPAnalytics onViewAllGuests={() => setActiveView('guests')} />
          ) : activeView === 'dashboard' ? (
            <ViewPlaceholder
              name="Dashboard"
              icon={<DashboardIcon />}
              description="Get a bird's-eye view of all your events, RSVPs, guest attendance, and real-time activity metrics on the interactive dashboard."
            />
          ) : activeView === 'crm' ? (
            <ViewPlaceholder
              name="CRM"
              icon={<CRMIcon />}
              description="Manage VIP client profiles, relationships, client notes, preferences, and automated communications in one unified platform."
            />
          ) : activeView === 'events' ? (
            <ViewPlaceholder
              name="Events"
              icon={<EventsIcon />}
              description="Create, edit, and organize multiple events, schedules, timelines, and keep track of session details seamlessly."
            />
          ) : activeView === 'weddings' ? (
            <ViewPlaceholder
              name="Weddings"
              icon={<WeddingsIcon />}
              description="Curate wedding registries, seating arrangements, personalized details, and wedding-specific timelines for couples."
            />
          ) : activeView === 'vendors' ? (
            <ViewPlaceholder
              name="Vendors"
              icon={<VendorsIcon />}
              description="Co-ordinate vendor lists, contacts, contracts, quote sheets, assignments, and payments all in a single centralized space."
            />
          ) : activeView === 'ai_hub' ? (
            <ViewPlaceholder
              name="AI Hub"
              icon={<AIHubIcon />}
              description="Leverage artificial intelligence to automate guest invites, optimize seating charts, predict RSVP turnout, and draft invitations."
            />
          ) : (
            <Hotels isBookRoomOpen={isBookRoomOpen} setIsBookRoomOpen={setIsBookRoomOpen} rooms={rooms} />
          )}
        </main>
      </div>
    </div>
  );
}
