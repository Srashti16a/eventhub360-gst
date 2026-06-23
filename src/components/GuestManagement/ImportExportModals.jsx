import React, { useState } from 'react';

// Bulk Import Modal Component
export function BulkImportModal({ isOpen, onClose, onImportSuccess }) {
  const [fileSelected, setFileSelected] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [importCount, setImportCount] = useState(0);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) {
        setFileSelected(file);
      } else {
        alert('Please upload a valid CSV or Excel (.xlsx) file.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileSelected(file);
    }
  };

  const handleImportSubmit = () => {
    if (!fileSelected) return;

    setUploading(true);
    // Simulate API POST /api/v1/events/{id}/guests/import with mock delay
    setTimeout(() => {
      setUploading(false);
      // Generate some mock guests to add
      const mockImportedGuests = [
        {
          guest_id: Date.now(),
          name: 'Harvey Specter',
          phone: '+1 (555) 303-9090',
          category: 'VIP',
          email: 'specter@pearsonhardman.com',
          eventName: 'Corporate Gala',
          groupName: 'Speakers',
          invited: true,
          rsvpStatus: 'yes',
          pax: 2,
          table_no: 'T2',
          seat_no: 'S1',
          preference: 'Non-veg',
          assignedHotel: 'The Ritz-Carlton'
        },
        {
          guest_id: Date.now() + 1,
          name: 'Mike Ross',
          phone: '+1 (555) 303-9091',
          category: 'Corporate',
          email: 'mross@pearsonhardman.com',
          eventName: 'Corporate Gala',
          groupName: 'Speakers',
          invited: true,
          rsvpStatus: 'maybe',
          pax: 1,
          table_no: 'T2',
          seat_no: 'S2',
          preference: 'Veg',
          assignedHotel: '—'
        },
        {
          guest_id: Date.now() + 2,
          name: 'Donna Paulsen',
          phone: '+1 (555) 303-9092',
          category: 'VIP',
          email: 'donna@pearsonhardman.com',
          eventName: 'Corporate Gala',
          groupName: 'Speakers',
          invited: true,
          rsvpStatus: 'yes',
          pax: 1,
          table_no: 'T2',
          seat_no: 'S3',
          preference: 'Veg',
          assignedHotel: 'The Ritz-Carlton'
        }
      ];
      onImportSuccess(mockImportedGuests);
      setImportCount(mockImportedGuests.length);
      setFileSelected(null);
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h2>Bulk Import Guests</h2>
          <button type="button" className="btn-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          {importCount > 0 ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ display: 'inline-flex', background: '#def7ec', color: '#03543f', width: '56px', height: '56px', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '28px', height: '28px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--font-title)' }}>Import Successful</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 1.5rem 0' }}>
                Successfully imported {importCount} guests into this event registry.
              </p>
              <button type="button" className="btn-primary" onClick={() => { setImportCount(0); onClose(); }}>
                Done
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Upload a guest roster in CSV or Excel format. Ensure column names map to our standard fields.
              </p>

              <div
                className="dropzone-area"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('csvFileInput').click()}
              >
                <input
                  id="csvFileInput"
                  type="file"
                  accept=".csv,.xlsx"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <svg className="dropzone-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                {fileSelected ? (
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)' }}>{fileSelected.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{(fileSelected.size / 1024).toFixed(1)} KB</span>
                  </div>
                ) : (
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)' }}>Drag & drop file here</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>or click to browse from files (.csv, .xlsx)</span>
                  </div>
                )}
              </div>

              <div style={{ background: '#f8fafc', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <strong>API Endpoint Reference:</strong>
                <code style={{ display: 'block', marginTop: '0.25rem', color: '#a61e22', fontFamily: 'monospace' }}>
                  POST /api/v1/events/&#123;id&#125;/guests/import
                </code>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={onClose} disabled={uploading}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleImportSubmit}
                  disabled={!fileSelected || uploading}
                >
                  {uploading ? 'Processing File...' : 'Begin Import'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// QR Code Preview & Scanner Modal
export function QRCodeModal({ isOpen, onClose, guest, onSimulateCheckin }) {
  if (!isOpen || !guest) return null;

  const handlePrintBadge = () => {
    alert(`Badge queued for printing: \nGuest: ${guest.name}\nGroup: ${guest.groupName || 'None'}\nTable: ${guest.table_no || 'Unassigned'}`);
  };

  const getQRPayload = () => {
    // Return standard schema properties inside QR token format
    return JSON.stringify({
      guest_id: guest.guest_id,
      name: guest.name,
      phone: guest.phone,
      qr_code: guest.qr_code || `QR_${guest.guest_id}`
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h2>Guest Digital QR Badge</h2>
          <button type="button" className="btn-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="qr-container">
            <h3 style={{ margin: 0, fontFamily: 'var(--font-title)', fontSize: '1.2rem' }}>{guest.name}</h3>
            <span className="guest-badge vip" style={{ fontSize: '0.75rem' }}>{guest.category || 'Standard'}</span>

            <div style={{ position: 'relative', display: 'inline-block' }}>
              {/* Scan simulation line */}
              <div className="qr-scanner-line"></div>
              {/* Mock QR SVG representation */}
              <svg className="qr-code-svg-mock" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                {/* Outer anchor squares */}
                <rect x="5" y="5" width="25" height="25" fill="#1e293b" />
                <rect x="10" y="10" width="15" height="15" fill="white" />
                <rect x="13" y="13" width="9" height="9" fill="#1e293b" />

                <rect x="70" y="5" width="25" height="25" fill="#1e293b" />
                <rect x="75" y="10" width="15" height="15" fill="white" />
                <rect x="78" y="13" width="9" height="9" fill="#1e293b" />

                <rect x="5" y="70" width="25" height="25" fill="#1e293b" />
                <rect x="10" y="75" width="15" height="15" fill="white" />
                <rect x="13" y="78" width="9" height="9" fill="#1e293b" />

                {/* Random QR code pixels inside */}
                <rect x="35" y="5" width="8" height="8" fill="#1e293b" />
                <rect x="50" y="5" width="12" height="4" fill="#1e293b" />
                <rect x="35" y="18" width="15" height="8" fill="#1e293b" />
                <rect x="55" y="20" width="10" height="10" fill="#1e293b" />
                
                <rect x="5" y="35" width="18" height="8" fill="#1e293b" />
                <rect x="5" y="48" width="8" height="12" fill="#1e293b" />
                
                <rect x="35" y="35" width="30" height="30" fill="#1e293b" />
                <rect x="42" y="42" width="16" height="16" fill="white" />
                <rect x="47" y="47" width="6" height="6" fill="#1e293b" />

                <rect x="75" y="35" width="12" height="18" fill="#1e293b" />
                <rect x="70" y="60" width="22" height="10" fill="#1e293b" />
                
                <rect x="35" y="70" width="18" height="12" fill="#1e293b" />
                <rect x="35" y="85" width="10" height="10" fill="#1e293b" />
                <rect x="55" y="75" width="12" height="15" fill="#1e293b" />
                
                <rect x="70" y="75" width="20" height="20" fill="#1e293b" />
                <rect x="75" y="80" width="10" height="10" fill="white" />
              </svg>
            </div>

            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', padding: '0.5rem 0', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-light)' }}>QR Token Payload:</span>
                <code style={{ color: 'var(--text-main)', fontSize: '0.75rem' }}>{`QR_${guest.guest_id}`}</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', padding: '0.5rem 0', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-light)' }}>Check-in Status:</span>
                <span style={{
                  fontWeight: 600,
                  color: guest.checkedInAt ? 'var(--status-confirmed-text)' : 'var(--status-pending-text)'
                }}>
                  {guest.checkedInAt ? `Arrived at ${new Date(guest.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not Checked In'}
                </span>
              </div>
            </div>
            
            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.7rem', color: 'var(--text-muted)', width: '100%', textAlign: 'left' }}>
              <strong>API Operations:</strong>
              <div style={{ fontFamily: 'monospace', color: '#a61e22', marginTop: '0.25rem' }}>
                POST /api/v1/checkin (Payload: &#123; qr_code: 'QR_{guest.guest_id}' &#125;)
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
          {!guest.checkedInAt ? (
            <button type="button" className="btn-primary" onClick={() => onSimulateCheckin(guest)}>
              Mark as Checked In
            </button>
          ) : (
            <button type="button" className="btn-secondary" style={{ color: '#e53e3e', borderColor: '#fecaca' }} onClick={() => onSimulateCheckin(guest, true)}>
              Undo Check-in
            </button>
          )}
          <button type="button" className="btn-primary" style={{ background: 'var(--secondary-gradient)' }} onClick={handlePrintBadge}>
            Print Badge
          </button>
        </div>
      </div>
    </div>
  );
}
