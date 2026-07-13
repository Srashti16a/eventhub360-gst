import React, { useState, useEffect, useRef } from 'react';

export default function GuestConversations() {
  const [guestsData, setGuestsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeGuestId, setActiveGuestId] = useState(null);
  
  // Filters
  const [guestFilter, setGuestFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('All Messages');
  
  // Compose & Replies
  const [newMessage, setNewMessage] = useState('');
  const [composeChannel, setComposeChannel] = useState('Email');
  const [replyingTo, setReplyingTo] = useState(null); // { id: string, text: string }
  
  // Message Menu & Reactions
  const [activeMenuMessageId, setActiveMenuMessageId] = useState(null);
  
  // New Message Modal
  const [showModal, setShowModal] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalGuestId, setModalGuestId] = useState('');
  const [modalChannel, setModalChannel] = useState('Email');
  const [modalMessage, setModalMessage] = useState('');
  
  const chatEndRef = useRef(null);

  // Close menus when clicking elsewhere
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveMenuMessageId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const fetchGuests = (searchQuery = '', callback = null) => {
    setLoading(true);
    setError(null);
    
    const params = new URLSearchParams();
    params.append('limit', '1000');
    params.append('sortBy', 'createdAt');
    params.append('sortOrder', 'desc');
    params.append('t', Date.now().toString());
    
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }

    fetch(`/api/guests?${params.toString()}`)
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          console.log("Communication Hub - Fetched guests from backend:", res.data.length, "guests");
          const colors = ['#3182ce', '#e53e3e', '#38a169', '#d69e2e', '#805ad5', '#dd6b20'];
          
          let storedHistory = {};
          try {
            const stored = localStorage.getItem('eventhub_guest_conversations_v3');
            if (stored) storedHistory = JSON.parse(stored);
          } catch (e) {
            console.error("Error reading localStorage:", e);
          }

          const mapped = res.data.map((g, i) => {
            // Bulletproof initials parser (never crashes on null, undefined, empty, or spacing)
            const cleanName = (g.name || '').trim() || 'Unknown Guest';
            const initials = cleanName.split(/\s+/).map(n => n[0] || '').join('').slice(0, 2).toUpperCase() || 'UG';
            
            // Check stored history, fallback to randomized demo messages if none exists yet
            let history = storedHistory[g.id];
            if (!history) {
              const demoTemplates = [
                {
                  guest: "Hi! I wanted to check my invitation details for the event.",
                  team: `Hi ${cleanName}! Your invitation is confirmed. Let us know if you need anything else!`,
                  channel: "Email",
                  guestTime: "Yesterday, 4:15 PM",
                  teamTime: "Yesterday, 4:22 PM",
                  previewTime: "Yesterday"
                },
                {
                  guest: "Hello, can I update my meal preference to Gluten-free?",
                  team: `Yes of course, ${cleanName.split(' ')[0]}. I've updated your preference to Gluten-free in our registry.`,
                  channel: "WhatsApp",
                  guestTime: "Yesterday, 9:02 AM",
                  teamTime: "Yesterday, 9:05 AM",
                  previewTime: "Yesterday"
                },
                {
                  guest: "Hey, is it possible to bring a plus one to the Gala?",
                  team: `Hi ${cleanName.split(' ')[0]}, let me check our seating capacity. I'll get back to you shortly!`,
                  channel: "SMS",
                  guestTime: "2 days ago, 11:30 AM",
                  teamTime: "2 days ago, 11:45 AM",
                  previewTime: "2 days ago"
                },
                {
                  guest: "What time is the check-in at the hotel?",
                  team: `Hi ${cleanName}! Hotel check-in is at 3:00 PM. Early check-in can be requested at the desk.`,
                  channel: "Email",
                  guestTime: "3 days ago, 1:15 PM",
                  teamTime: "3 days ago, 2:00 PM",
                  previewTime: "3 days ago"
                },
                {
                  guest: "Is airport shuttle service provided for speakers?",
                  team: `Yes! Your shuttle is scheduled for tomorrow at 2:00 PM. Check the transport tab for driver details.`,
                  channel: "WhatsApp",
                  guestTime: "Yesterday, 8:12 AM",
                  teamTime: "Yesterday, 8:18 AM",
                  previewTime: "Yesterday"
                },
                {
                  guest: "I haven't received my QR entry pass yet.",
                  team: `Hi ${cleanName}, I just resent your QR pass to your email. Please check your spam folder as well!`,
                  channel: "Email",
                  guestTime: "Oct 12, 10:05 AM",
                  teamTime: "Oct 12, 10:15 AM",
                  previewTime: "Oct 12"
                }
              ];
              
              // Pick template deterministically based on index so it stays consistent
              const tmpl = demoTemplates[i % demoTemplates.length];
              
              const demoMsg1 = { id: `dm-${g.id}-1`, text: tmpl.guest, channel: tmpl.channel, time: tmpl.guestTime, status: '', isMine: false, reactions: [] };
              const demoMsg2 = { id: `dm-${g.id}-2`, text: tmpl.team, channel: tmpl.channel, time: tmpl.teamTime, status: 'Read', isMine: true, reactions: [] };
              
              history = {
                messages: [demoMsg1, demoMsg2],
                lastMessage: demoMsg2.text,
                time: tmpl.previewTime,
                channel: tmpl.channel
              };
            }
            
            return {
              id: g.id,
              name: cleanName,
              email: g.email || '',
              initials: initials,
              color: colors[i % colors.length],
              vip: !!g.isVip,
              speaker: !!g.isSpeaker,
              lastMessage: history.lastMessage,
              time: history.time,
              unread: 0,
              channel: history.channel,
              messages: history.messages
            };
          });
          setGuestsData(mapped);
          if (callback && typeof callback === 'function') {
            callback(mapped);
          }
        } else {
          setError(res.error?.message || "Failed to load guests from database.");
        }
      })
      .catch(err => {
        console.error("Error fetching guests:", err);
        setError("Unable to connect to the backend server. Please verify the API connection.");
      })
      .finally(() => setLoading(false));
  };

  // Fetch real guests on mount & debounced sidebar search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchGuests(search);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  // Debounced modal search
  useEffect(() => {
    if (!showModal) return;
    const delayDebounce = setTimeout(() => {
      fetchGuests(modalSearch);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [modalSearch, showModal]);

  // Save messages to localStorage whenever guestsData updates with histories
  useEffect(() => {
    if (guestsData.length === 0) return;
    const historyMap = {};
    guestsData.forEach(g => {
      if (g.messages && g.messages.length > 0) {
        historyMap[g.id] = {
          messages: g.messages,
          lastMessage: g.lastMessage,
          time: g.time,
          channel: g.channel
        };
      }
    });
    
    // Always sync, even if empty (to handle deletions resulting in 0 messages)
    // But verify the data array is loaded so we don't clear on initial empty loads
    if (!loading) {
      localStorage.setItem('eventhub_guest_conversations_v3', JSON.stringify(historyMap));
    }
  }, [guestsData, loading]);

  // Scroll to bottom when opening a chat or sending message
  useEffect(() => {
    if (activeGuestId) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeGuestId, guestsData]);

  const activeGuest = guestsData.find(g => g.id === activeGuestId);

  // Sync active guest channel to compose channel
  useEffect(() => {
    if (activeGuest) {
      setComposeChannel(activeGuest.channel || 'Email');
    }
  }, [activeGuestId, guestsData]);

  // ─── Filter Logic ───
  let filteredGuests = guestsData.filter(g => (g.name || '').toLowerCase().includes(search.toLowerCase()));
  if (guestFilter === 'Unread') {
    filteredGuests = filteredGuests.filter(g => g.unread > 0);
  } else if (['Email', 'WhatsApp', 'SMS'].includes(guestFilter)) {
    filteredGuests = filteredGuests.filter(g => g.channel === guestFilter);
  } else if (guestFilter === 'Unreplied') {
    filteredGuests = filteredGuests.filter(g => {
        const lastMsg = g.messages[g.messages.length - 1];
        return lastMsg && !lastMsg.isMine;
    });
  }

  let displayedMessages = activeGuest ? activeGuest.messages : [];
  if (channelFilter !== 'All Messages') {
    displayedMessages = displayedMessages.filter(m => m.channel === channelFilter);
  }
  
  // ─── Stats Calculation ───
  const totalConversations = guestsData.length;
  const unreadTotal = guestsData.reduce((sum, g) => sum + g.unread, 0);
  const unrepliedTotal = guestsData.filter(g => g.messages.length > 0 && !g.messages[g.messages.length - 1].isMine).length;

  // ─── Handlers ───
  const handleSend = () => {
    if (!newMessage.trim() || !activeGuestId) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setGuestsData(prev => prev.map(g => {
      if (g.id === activeGuestId) {
        return {
          ...g,
          lastMessage: newMessage,
          time: timeString,
          channel: composeChannel,
          messages: [
            ...g.messages,
            { id: `m${Date.now()}`, text: newMessage, channel: composeChannel, time: 'Just now', status: 'Sent', isMine: true, replyTo: replyingTo ? replyingTo.text : null, reactions: [] }
          ]
        };
      }
      return g;
    }));
    
    setNewMessage('');
    setReplyingTo(null);
  };

  const handleModalSend = () => {
    if (!modalMessage.trim() || !modalGuestId) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setGuestsData(prev => prev.map(g => {
      if (g.id === modalGuestId) {
        return {
          ...g,
          lastMessage: modalMessage,
          time: timeString,
          channel: modalChannel,
          messages: [
            ...g.messages,
            { id: `m${Date.now()}`, text: modalMessage, channel: modalChannel, time: 'Just now', status: 'Sent', isMine: true, replyTo: null, reactions: [] }
          ]
        };
      }
      return g;
    }));
    
    setActiveGuestId(modalGuestId);
    setShowModal(false);
    setModalMessage('');
    setModalGuestId('');
    setModalSearch('');
  };

  const handleDeleteMessage = (guestId, messageId) => {
    setGuestsData(prev => prev.map(g => {
      if (g.id === guestId) {
        const filteredMessages = g.messages.filter(m => m.id !== messageId);
        const lastMsg = filteredMessages[filteredMessages.length - 1];
        return {
          ...g,
          messages: filteredMessages,
          lastMessage: lastMsg ? lastMsg.text : 'No messages yet',
          time: lastMsg ? (lastMsg.time === 'Just now' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : lastMsg.time) : ''
        };
      }
      return g;
    }));
    setActiveMenuMessageId(null);
  };

  const handleAddReaction = (guestId, messageId, emoji) => {
    setGuestsData(prev => prev.map(g => {
      if (g.id === guestId) {
        return {
          ...g,
          messages: g.messages.map(m => {
            if (m.id === messageId) {
              const reactions = m.reactions || [];
              const hasReaction = reactions.includes(emoji);
              return {
                ...m,
                reactions: hasReaction ? reactions.filter(r => r !== emoji) : [...reactions, emoji]
              };
            }
            return m;
          })
        };
      }
      return g;
    }));
    setActiveMenuMessageId(null);
  };

  const handleOpenNewMessageModal = () => {
    fetchGuests();
    setShowModal(true);
  };

  const modalFilteredGuests = guestsData.filter(g => (g.name || '').toLowerCase().includes(modalSearch.toLowerCase()));

  // Card matching standard layout
  const CardStyle = { background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '1.5rem', display: 'flex', flexDirection: 'column' };

  return (
    <div style={{ padding: '2rem' }}>
      {error && (
        <div style={{ color: '#e53e3e', background: '#fff5f5', border: '1px solid rgba(229,62,62,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}
      {/* ─── Header ─── */}
      <div className="cc-header-row" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="cc-title">Communication Hub</h1>
          <p className="cc-subtitle">Manage all guest conversations across every channel.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="cc-export-btn">Export</button>
          <button 
            className="cc-alert-btn-primary" 
            style={{ background: '#e53e3e', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            onClick={handleOpenNewMessageModal}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <line x1="10" y1="4" x2="10" y2="16"/><line x1="4" y1="10" x2="16" y2="10"/>
            </svg>
            New Message
          </button>
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={CardStyle}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
             Total Conversations
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>{loading ? '-' : totalConversations}</div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', background: '#dcfce7', display: 'inline-block', padding: '2px 8px', borderRadius: '6px', fontWeight: 600, alignSelf: 'flex-start', mt: 'auto' }}>Active Chats</div>
        </div>
        
        <div style={CardStyle}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
             Unread Messages
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: '#ea580c' }}>{loading ? '-' : unreadTotal}</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Across all channels</div>
        </div>
        
        <div style={CardStyle}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
             Unreplied
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: '#e53e3e' }}>{loading ? '-' : unrepliedTotal}</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Awaiting your response</div>
        </div>
        
        <div style={CardStyle}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
             Resolved Today
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: '#16a34a' }}>0</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Closed conversations</div>
        </div>
      </div>

      {/* ─── Main Workspace ─── */}
      <div style={{ display: 'flex', gap: '1.5rem', height: '650px' }}>
        
        {/* LEFT PANEL */}
        <div style={{ ...CardStyle, flex: '0 0 350px', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid #e2e8f0', background: '#fdfdfd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 1rem 0' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>All Guests ({totalConversations})</h3>
              <button 
                onClick={() => fetchGuests()} 
                title="Refresh Guests List"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.1rem', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#e53e3e'}
                onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
              >
                🔄
              </button>
            </div>
            <input 
              type="text" 
              className="cc-search-input" 
              placeholder="Search guests..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', marginBottom: '1rem', background: '#f8fafc' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', scrollbarWidth: 'none' }}>
              {['All', 'Email', 'WhatsApp', 'SMS', 'Unread', 'Unreplied'].map(f => (
                <button 
                  key={f}
                  onClick={() => setGuestFilter(f)}
                  style={{
                    background: guestFilter === f ? '#fff5f5' : '#f1f5f9',
                    color: guestFilter === f ? '#e53e3e' : '#475569',
                    border: `1px solid ${guestFilter === f ? 'rgba(229,62,62,0.2)' : 'transparent'}`,
                    padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', background: 'white' }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading guests...</div>
            ) : filteredGuests.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No guests found</div>
            ) : filteredGuests.map(g => (
              <div 
                key={g.id} 
                onClick={() => setActiveGuestId(g.id)}
                style={{ 
                  display: 'flex', padding: '1.1rem 1.25rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', alignItems: 'center', gap: '1rem',
                  background: activeGuestId === g.id ? 'linear-gradient(90deg, #fff5f5 0%, #ffffff 100%)' : 'transparent',
                  borderLeft: activeGuestId === g.id ? '3px solid #e53e3e' : '3px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: g.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, textTransform: 'uppercase' }}>
                  {g.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</span>
                    {g.vip && <span style={{ background: '#fef08a', color: '#713f12', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>VIP</span>}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>{g.lastMessage}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                  <span>{g.time}</span>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span title={g.channel}>{g.channel === 'Email' ? '📧' : g.channel === 'WhatsApp' ? '💬' : '📱'}</span>
                    {g.unread > 0 && <span style={{ background: '#e53e3e', color: 'white', fontSize: '0.7rem', fontWeight: 800, minWidth: '18px', height: '18px', padding: '0 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9px' }}>{g.unread}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ ...CardStyle, flex: 1, padding: 0, overflow: 'hidden' }}>
          {activeGuest ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Header */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: activeGuest.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {activeGuest.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {activeGuest.name}
                      {activeGuest.vip && <span style={{ background: '#fef08a', color: '#713f12', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>VIP</span>}
                      {activeGuest.speaker && <span style={{ background: '#ebf8ff', color: '#2b6cb0', border: '1px solid #bee3f8', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>Speaker</span>}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{activeGuest.email}</div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '2rem', padding: '0 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#fafaf9' }}>
                {['All Messages', 'Email', 'WhatsApp', 'SMS'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setChannelFilter(t)}
                    style={{
                      padding: '1rem 0', border: 'none', background: 'transparent', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
                      color: channelFilter === t ? '#e53e3e' : '#64748b', borderBottom: `2px solid ${channelFilter === t ? '#e53e3e' : 'transparent'}`
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Chat Area */}
              <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#f8fafc', scrollBehavior: 'smooth' }}>
                <div style={{ textAlign: 'center', margin: '1.5rem 0', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid #e2e8f0', zIndex: 1 }}></div>
                  <span style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', padding: '4px 12px', borderRadius: '12px', fontWeight: 600, position: 'relative', zIndex: 2 }}>Conversation Started</span>
                </div>
                
                {displayedMessages.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', width: '100%', justifyContent: msg.isMine ? 'flex-end' : 'flex-start', position: 'relative' }}>
                    <div 
                      className="msg-bubble-wrap"
                      style={{
                        maxWidth: '65%', padding: '0.85rem 1.15rem', borderRadius: '16px', fontSize: '0.95rem', lineHeight: 1.5, position: 'relative', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        background: msg.isMine ? 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)' : 'white',
                        color: msg.isMine ? 'white' : '#1e293b',
                        border: msg.isMine ? 'none' : '1px solid #e2e8f0',
                        borderBottomRightRadius: msg.isMine ? '4px' : '16px',
                        borderBottomLeftRadius: msg.isMine ? '16px' : '4px',
                        marginBottom: (msg.reactions && msg.reactions.length > 0) ? '0.75rem' : '0'
                      }}
                    >
                      {/* Replying Indicator inside message */}
                      {msg.replyTo && (
                        <div style={{ background: msg.isMine ? 'rgba(255,255,255,0.15)' : '#f1f5f9', borderLeft: '3px solid #e53e3e', padding: '0.35rem 0.6rem', borderRadius: '6px', marginBottom: '0.5rem', fontSize: '0.8rem', color: msg.isMine ? 'rgba(255,255,255,0.9)' : '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          Replying to: <em>"{msg.replyTo}"</em>
                        </div>
                      )}

                      {/* Three dot context trigger button */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenuMessageId(activeMenuMessageId === msg.id ? null : msg.id); }}
                        title="Options"
                        style={{ position: 'absolute', top: '4px', right: msg.isMine ? 'auto' : '-24px', left: msg.isMine ? '-24px' : 'auto', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.1rem', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        className="msg-menu-btn"
                      >
                        ⋮
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuMessageId === msg.id && (
                        <div 
                          onClick={e => e.stopPropagation()}
                          style={{
                            position: 'absolute', top: '24px', right: msg.isMine ? 'auto' : 0, left: msg.isMine ? 0 : 'auto', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '130px', padding: '4px 0',
                            animation: 'fadeInMenu 0.15s ease'
                          }}
                        >
                          {/* Reactions Inline */}
                          <div style={{ display: 'flex', gap: '0.35rem', padding: '6px 12px', borderBottom: '1px solid #f1f5f9', justifyContent: 'space-between' }}>
                            {['👍', '❤️', '😂', '😮', '🙏'].map(emoji => (
                              <span 
                                key={emoji} 
                                onClick={() => handleAddReaction(activeGuestId, msg.id, emoji)}
                                style={{ cursor: 'pointer', fontSize: '1.05rem', transition: 'transform 0.1s' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                              >
                                {emoji}
                              </span>
                            ))}
                          </div>

                          <button 
                            onClick={() => { setReplyingTo(msg); setActiveMenuMessageId(null); }}
                            style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            <span>↩</span> Reply
                          </button>
                          
                          {msg.isMine && (
                            <button 
                              onClick={() => handleDeleteMessage(activeGuestId, msg.id)}
                              style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#e53e3e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                              <span>🗑</span> Delete
                            </button>
                          )}
                        </div>
                      )}

                      {/* Main Message Text */}
                      <div>{msg.text}</div>
                      
                      {/* Meta */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 600, color: msg.isMine ? 'rgba(255,255,255,0.8)' : '#94a3b8', justifyContent: msg.isMine ? 'flex-end' : 'flex-start' }}>
                        <span title={msg.channel}>{msg.channel === 'Email' ? '📧' : msg.channel === 'WhatsApp' ? '💬' : '📱'}</span>
                        {msg.time}
                        {msg.status && <span>• {msg.status}</span>}
                      </div>
                      
                      {msg.unread && (
                        <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '10px', height: '10px', background: '#3182ce', borderRadius: '50%' }}></div>
                      )}

                      {/* Reaction Badges */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div style={{ position: 'absolute', bottom: '-14px', right: msg.isMine ? '8px' : 'auto', left: msg.isMine ? 'auto' : '8px', display: 'flex', gap: '2px', background: 'white', border: '1px solid #e2e8f0', padding: '1px 6px', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', zIndex: 5 }}>
                          {msg.reactions.map((r, ri) => (
                            <span key={ri} style={{ fontSize: '0.75rem' }}>{r}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <style>{`
                .msg-menu-btn { opacity: 0; transition: opacity 0.2s; }
                .msg-bubble-wrap:hover .msg-menu-btn { opacity: 1 !important; }
                @keyframes fadeInMenu {
                  from { opacity: 0; transform: translateY(-4px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>

              {/* Replying Alert Bar */}
              {replyingTo && (
                <div style={{ padding: '0.5rem 1.5rem', background: '#f1f5f9', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.85rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85%' }}>
                    Replying to: <strong>"{replyingTo.text}"</strong>
                  </div>
                  <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>Cancel</button>
                </div>
              )}

              {/* Compose Bar */}
              <div style={{ padding: '1.25rem 1.5rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input 
                  type="text"
                  placeholder={`Type a message to ${activeGuest.name.split(' ')[0]}...`}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  style={{ flex: 1, padding: '0.85rem 1.25rem', border: '1px solid #e2e8f0', borderRadius: '24px', outline: 'none', fontFamily: 'inherit', fontSize: '0.95rem', background: '#f8fafc', transition: 'all 0.2s' }}
                />
                <button 
                  onClick={handleSend} 
                  title="Send"
                  style={{ background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)', color: 'white', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(229,62,62,0.3)', transition: 'all 0.2s' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', background: '#f8fafc' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="64" height="64" style={{ marginBottom: '1rem', color: '#cbd5e1' }}>
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
              </svg>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#475569', fontFamily: 'Outfit, sans-serif' }}>No Conversation Selected</h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Select a guest from the left panel to view their history or send a message.</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── New Message Modal ─── */}
      {showModal && (
        <div className="cc-modal-overlay" onClick={() => { setShowModal(false); setModalSearch(''); setModalGuestId(''); }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="cc-modal" onClick={e => e.stopPropagation()} style={{ background: 'white', width: '500px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div className="cc-modal-header" style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem' }}>New Message</h3>
              <button onClick={() => { setShowModal(false); setModalSearch(''); setModalGuestId(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.2rem' }}>✕</button>
            </div>
            <div className="cc-modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Search Guest</label>
                <input 
                  type="text" 
                  className="cc-search-input" 
                  placeholder="Type name to search..."
                  value={modalSearch}
                  onChange={e => { setModalSearch(e.target.value); setModalGuestId(''); }}
                  style={{ width: '100%' }}
                />
                
                {!modalGuestId && (
                  <div style={{ marginTop: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', maxHeight: '150px', overflowY: 'auto', background: 'white' }}>
                    {modalFilteredGuests.length > 0 ? modalFilteredGuests.map(g => (
                      <div 
                        key={g.id} 
                        onClick={() => setModalGuestId(g.id)}
                        style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                      >
                         <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: g.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>{g.initials}</div>
                         <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{g.name}</span>
                      </div>
                    )) : (
                      <div style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.9rem' }}>No guests found</div>
                    )}
                  </div>
                )}
                {modalGuestId && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#10b981' }}>✓</span> Selected: <strong>{guestsData.find(g => g.id === modalGuestId)?.name}</strong>
                    <button onClick={() => setModalGuestId('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#e53e3e', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>Change</button>
                  </div>
                )}
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Channel</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['Email', 'WhatsApp', 'SMS'].map(c => (
                    <button 
                      key={c}
                      onClick={() => setModalChannel(c)}
                      style={{ 
                        flex: 1, padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
                        background: modalChannel === c ? '#fff5f5' : '#f8fafc',
                        border: `1px solid ${modalChannel === c ? '#e53e3e' : '#e2e8f0'}`,
                        color: modalChannel === c ? '#e53e3e' : '#475569'
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Message</label>
                <textarea 
                  rows="4" 
                  value={modalMessage}
                  onChange={e => setModalMessage(e.target.value)}
                  placeholder="Type your message here..."
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

            </div>
            <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="cc-export-btn" onClick={() => { setShowModal(false); setModalSearch(''); setModalGuestId(''); }}>Cancel</button>
              <button 
                onClick={handleModalSend}
                disabled={!modalGuestId || !modalMessage.trim()}
                style={{ 
                  background: (!modalGuestId || !modalMessage.trim()) ? '#cbd5e1' : 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)', 
                  color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: (!modalGuestId || !modalMessage.trim()) ? 'not-allowed' : 'pointer' 
                }}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
