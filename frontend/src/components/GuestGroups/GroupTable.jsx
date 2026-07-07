import React, { useState } from 'react';

export default function GroupTable({
  groups,
  selectedGroupId,
  onSelectGroup,
  onEditGroup,
  onDeleteGroup
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);

  const toggleMenu = (e, groupId) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === groupId ? null : groupId);
  };

  React.useEffect(() => {
    const handleClose = () => setActiveMenuId(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const getLetterAvatarClass = (name) => {
    if (!name) return 'default';
    const initial = name[0].toLowerCase();
    if (['v', 'g', 'm', 'b'].includes(initial)) {
      return initial;
    }
    return 'default';
  };

  const getPrimaryInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table className="groups-table">
        <thead>
          <tr>
            <th>Group Name</th>
            <th>Primary Guest</th>
            <th>Members</th>
            <th>Category</th>
            <th>Status</th>
            <th style={{ width: '60px' }}></th>
          </tr>
        </thead>
        <tbody>
          {groups.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '3rem' }}>
                No guest groups found. Click "+ Create Group" to add a cohort.
              </td>
            </tr>
          ) : (
            groups.map((group) => {
              const letterClass = getLetterAvatarClass(group.name);
              const isSelected = selectedGroupId === group.group_id;

              return (
                <tr
                  key={group.group_id}
                  className={isSelected ? 'selected' : ''}
                  onClick={() => onSelectGroup(group)}
                >
                  <td>
                    <div className="group-name-cell">
                      <div className={`group-letter-avatar ${letterClass}`}>
                        {group.name ? group.name[0].toUpperCase() : '?'}
                      </div>
                      <span className="group-name-text">{group.name}</span>
                      {group.isVipGroup && (
                        <span
                          style={{
                            marginLeft: '0.5rem',
                            backgroundColor: '#fffbeb',
                            color: '#b45309',
                            border: '1px solid #fde68a',
                            borderRadius: '4px',
                            padding: '1px 5px',
                            fontSize: '0.65rem',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                        >
                          ⭐ VIP
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="primary-guest-cell">
                      {group.primaryGuestAvatar ? (
                        <img
                          src={group.primaryGuestAvatar}
                          alt={group.primaryGuestName}
                          className="primary-guest-avatar"
                        />
                      ) : (
                        <div className="primary-guest-placeholder">
                          {getPrimaryInitials(group.primaryGuestName)}
                        </div>
                      )}
                      <span>{group.primaryGuestName || '—'}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {group.membersCount}
                  </td>
                  <td>
                    <span className={`category-pill ${group.category?.toLowerCase() || 'family'}`}>
                      {group.category || 'Family'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-indicator ${group.status?.toLowerCase() || 'active'}`}>
                      {group.status || 'Active'}
                    </span>
                  </td>
                  <td>
                    <div className="actions-menu-wrapper">
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={(e) => toggleMenu(e, group.group_id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          style={{ width: '16px', height: '16px' }}
                        >
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      {activeMenuId === group.group_id && (
                        <div className="dropdown-menu-custom" style={{ top: '100%', right: 0 }}>
                          <button
                            type="button"
                            className="dropdown-item-custom"
                            onClick={() => onSelectGroup(group)}
                          >
                            Open Details
                          </button>
                          <button
                            type="button"
                            className="dropdown-item-custom"
                            onClick={() => onEditGroup(group)}
                          >
                            Edit Group
                          </button>
                          <button
                            type="button"
                            className="dropdown-item-custom danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteGroup(group.group_id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
