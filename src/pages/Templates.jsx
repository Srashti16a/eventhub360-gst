import React, { useState, useEffect } from 'react';
import './Templates.css';

// Seed categories and template formats
const TEMPLATE_COPIES = {
  invitation: {
    subtitle: 'PRIVATE ENGAGEMENT',
    body: 'We are delighted to invite you to the upcoming {{event_name}}, a curated evening of digital excellence and networking.',
    btnText: 'Confirm Your Attendance',
    footer: 'Please RSVP by Friday evening.'
  },
  rsvp: {
    subtitle: 'RSVP REQUIRED',
    body: 'Please confirm your availability for {{event_name}} on {{event_date}}. We look forward to hosting you in style.',
    btnText: 'Submit RSVP Status',
    footer: 'Responses requested by: {{rsvp_deadline}}.'
  },
  reminder: {
    subtitle: 'UPCOMING ADVISORY',
    body: 'This is a friendly reminder that {{event_name}} is scheduled soon. Please review your personalized timetable below.',
    btnText: 'View Event Itinerary',
    footer: 'If you have any luggage or arrival changes, contact concierge support.'
  },
  thankyou: {
    subtitle: 'WITH GRATITUDE',
    body: 'Dear {{guest_name}}, thank you for sharing your evening with us at {{event_name}}. We hope you enjoyed the networking sessions.',
    btnText: 'View Event Gallery & Slides',
    footer: 'Photos and recap files are now accessible online.'
  }
};

const FONTS_LIST = [
  { name: 'Hanken Grotesk', value: "'Plus Jakarta Sans', sans-serif" }, // use built-in matching fallback
  { name: 'Outfit', value: "'Outfit', sans-serif" },
  { name: 'Inter', value: "'Inter', sans-serif" },
  { name: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', sans-serif" }
];

const COLOR_SWATCHES = [
  { label: 'Crimson', value: '#a61e22' },
  { label: 'Olive', value: '#854d0e' },
  { label: 'Dark Indigo', value: '#1e1b4b' },
  { label: 'White', value: '#ffffff' },
  { label: 'Coral', value: '#ff7a45' }
];

export default function Templates() {
  // Screen views and editor states
  const [activeTab, setActiveTab] = useState('builder'); // builder, preview, variables
  const [editorMode, setEditorMode] = useState('email'); // email, whatsapp
  const [previewDevice, setPreviewDevice] = useState('desktop'); // desktop, mobile
  const [category, setCategory] = useState('invitation');

  // Custom typography states
  const [fontFamily, setFontFamily] = useState("'Plus Jakarta Sans', sans-serif");
  const [fontFamilyName, setFontFamilyName] = useState('Hanken Grotesk');
  const [fontSize, setFontSize] = useState('16px');
  
  // Design details
  const [selectedColor, setSelectedColor] = useState('#a61e22');
  const [paddingTop, setPaddingTop] = useState(24);
  const [paddingBottom, setPaddingBottom] = useState(24);
  const [paddingLeft, setPaddingLeft] = useState(24);
  const [paddingRight, setPaddingRight] = useState(24);

  // Template editable content
  const [templateContent, setTemplateContent] = useState(TEMPLATE_COPIES.invitation);
  const [toastMessage, setToastMessage] = useState(null);
  const [showToastNotice, setShowToastNotice] = useState(true);

  // Sync template text when category changes
  useEffect(() => {
    setTemplateContent(TEMPLATE_COPIES[category]);
  }, [category]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Simulated content block insertions
  const handleInsertBlock = (blockType) => {
    triggerToast(`Added ${blockType} block to template layout.`);
  };

  const handleInsertVariable = (variable) => {
    // Insert variable token into current template body copy
    setTemplateContent(prev => ({
      ...prev,
      body: prev.body + ` {{${variable}}}`
    }));
    triggerToast(`Inserted variable {{${variable}}} into body copy.`);
  };

  const handleSaveDraft = () => {
    triggerToast('Draft template saved successfully.');
  };

  const handlePublishTemplate = () => {
    triggerToast('Template published successfully to Active Campaigns.');
  };

  // Convert raw curly variables to readable text for high fidelity mockup
  const formatBodyText = (text, isWhatsApp = false) => {
    let result = text
      .replace('{{guest_name}}', 'Dr. Julianne Moore')
      .replace('{{event_name}}', 'Annual Tech Excellence Gala')
      .replace('{{event_date}}', 'Friday, October 24th')
      .replace('{{rsvp_deadline}}', 'Friday evening');

    if (isWhatsApp) {
      // WhatsApp markup simulations: bold (*), italics (_)
      result = result
        .split('*').map((item, idx) => idx % 2 === 1 ? `<strong>${item}</strong>` : item).join('')
        .split('_').map((item, idx) => idx % 2 === 1 ? `<em>${item}</em>` : item).join('');
    }
    return result;
  };

  return (
    <div className="template-container">
      {/* Dynamic Toast Feedback alerts */}
      {toastMessage && (
        <div className="temp-toast-box">
          <span>⚙️</span> {toastMessage}
        </div>
      )}

      {/* Header bar section */}
      <header className="temp-header-row">
        <div className="temp-title-area">
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            Digital Concierge <span style={{ margin: '0 0.35rem', color: '#94a3b8' }}>/</span> <span style={{ color: '#ff4d4f' }}>Templates</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <h1 className="active-head-tab">Template Builder</h1>
            <span className="inactive-head-tab" onClick={() => setActiveTab('variables')}>Variables</span>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="temp-header-actions">
          <button type="button" className="btn-temp-preview-action" onClick={() => triggerToast('Launching high-fidelity live web preview page...')}>
            Preview
          </button>
          
          <button type="button" className="btn-temp-save-action" onClick={handlePublishTemplate}>
            Save Template
          </button>
        </div>
      </header>

      {/* Main 3-column layout splits */}
      <div className="temp-editor-layout">
        {/* Left Side: Editor Sidebar panel controls */}
        <aside className="editor-control-panel">
          {/* Editor sub-tabs Email vs WhatsApp */}
          <div className="editor-type-tabs">
            <button 
              type="button" 
              className={`editor-type-btn ${editorMode === 'email' ? 'active' : ''}`}
              onClick={() => setEditorMode('email')}
            >
              Email Editor
            </button>
            <button 
              type="button" 
              className={`editor-type-btn ${editorMode === 'whatsapp' ? 'active' : ''}`}
              onClick={() => setEditorMode('whatsapp')}
            >
              WhatsApp Editor
            </button>
          </div>

          <div className="editor-controls-scrollable">
            {/* Dynamic variables list */}
            <div className="control-section-card">
              <label className="section-label-header">Dynamic Variables</label>
              <div className="dropdown-variable-selector">
                <select 
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleInsertVariable(e.target.value);
                      e.target.value = ''; // reset selection
                    }
                  }}
                >
                  <option value="" disabled>Insert Variable...</option>
                  <option value="guest_name">guest_name (Dr. Julianne Moore)</option>
                  <option value="event_name">event_name (Annual Tech Gala)</option>
                  <option value="event_date">event_date (Oct 24th)</option>
                  <option value="rsvp_deadline">rsvp_deadline (Friday evening)</option>
                </select>
              </div>
            </div>

            {/* Content blocks palette */}
            <div className="control-section-card">
              <label className="section-label-header">Content Blocks</label>
              <div className="content-blocks-grid">
                <button type="button" className="content-block-item" onClick={() => handleInsertBlock('Text')}>
                  <span className="block-icon text-icon">T</span>
                  <span className="block-lbl">Text</span>
                </button>
                <button type="button" className="content-block-item" onClick={() => handleInsertBlock('Image')}>
                  <span className="block-icon image-icon">🖼️</span>
                  <span className="block-lbl">Image</span>
                </button>
                <button type="button" className="content-block-item" onClick={() => handleInsertBlock('Button')}>
                  <span className="block-icon button-icon">🔗</span>
                  <span className="block-lbl">Button</span>
                </button>
                <button type="button" className="content-block-item" onClick={() => handleInsertBlock('Spacer')}>
                  <span className="block-icon spacer-icon">⎵</span>
                  <span className="block-lbl">Spacer</span>
                </button>
                <button type="button" className="content-block-item" onClick={() => handleInsertBlock('Divider')}>
                  <span className="block-icon divider-icon">―</span>
                  <span className="block-lbl">Divider</span>
                </button>
                <button type="button" className="content-block-item" onClick={() => handleInsertBlock('Columns')}>
                  <span className="block-icon columns-icon">⚏</span>
                  <span className="block-lbl">Columns</span>
                </button>
              </div>
            </div>

            {/* Settings panel details */}
            <div className="control-section-card">
              <div className="settings-header-row">
                <span className="section-label-header">Block Settings</span>
                <span className="block-type-info">Text Block</span>
              </div>

              {/* Typography controls */}
              <div className="setting-control-row">
                <label className="settings-sub-lbl">Typography</label>
                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                  <select 
                    style={{ flex: 1 }}
                    value={fontFamilyName}
                    onChange={(e) => {
                      const selected = FONTS_LIST.find(f => f.name === e.target.value);
                      setFontFamilyName(e.target.value);
                      setFontFamily(selected.value);
                    }}
                  >
                    {FONTS_LIST.map(f => (
                      <option key={f.name} value={f.name}>{f.name}</option>
                    ))}
                  </select>

                  <select 
                    style={{ width: '80px' }}
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                  >
                    <option value="14px">14px</option>
                    <option value="16px">16px</option>
                    <option value="18px">18px</option>
                    <option value="20px">20px</option>
                  </select>
                </div>
              </div>

              {/* Color swatches */}
              <div className="setting-control-row">
                <label className="settings-sub-lbl">Color Palette</label>
                <div className="color-swatches-row">
                  {COLOR_SWATCHES.map(swatch => {
                    const isActive = selectedColor === swatch.value;
                    return (
                      <button
                        key={swatch.label}
                        type="button"
                        className={`color-swatch-circle ${isActive ? 'active' : ''}`}
                        style={{ 
                          backgroundColor: swatch.value,
                          border: swatch.value === '#ffffff' ? '1px solid #cbd5e1' : 'none'
                        }}
                        onClick={() => setSelectedColor(swatch.value)}
                        title={swatch.label}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Padding settings */}
              <div className="setting-control-row">
                <label className="settings-sub-lbl">Padding (Outer)</label>
                <div className="padding-inputs-grid">
                  <div className="padding-input-wrap">
                    <span className="pad-lbl">TOP</span>
                    <input 
                      type="number" 
                      value={paddingTop} 
                      onChange={(e) => setPaddingTop(Number(e.target.value))} 
                    />
                  </div>
                  <div className="padding-input-wrap">
                    <span className="pad-lbl">BOTTOM</span>
                    <input 
                      type="number" 
                      value={paddingBottom} 
                      onChange={(e) => setPaddingBottom(Number(e.target.value))} 
                    />
                  </div>
                  <div className="padding-input-wrap">
                    <span className="pad-lbl">LEFT</span>
                    <input 
                      type="number" 
                      value={paddingLeft} 
                      onChange={(e) => setPaddingLeft(Number(e.target.value))} 
                    />
                  </div>
                  <div className="padding-input-wrap">
                    <span className="pad-lbl">RIGHT</span>
                    <input 
                      type="number" 
                      value={paddingRight} 
                      onChange={(e) => setPaddingRight(Number(e.target.value))} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Left panel Sticky Footer Buttons */}
          <footer className="editor-control-footer">
            <button type="button" className="btn-temp-save-draft" onClick={handleSaveDraft}>
              Save Draft
            </button>
            <button type="button" className="btn-temp-publish" onClick={handlePublishTemplate}>
              Publish Template
            </button>
          </footer>
        </aside>

        {/* Right Side: Preview Display Area */}
        <main className="editor-preview-panel">
          <div className="preview-top-toolbar">
            {/* Device framer size switches */}
            <div className="device-switcher-pills">
              <button
                type="button"
                className={`device-pill-btn ${previewDevice === 'desktop' ? 'active' : ''}`}
                onClick={() => setPreviewDevice('desktop')}
              >
                🖥️ Desktop
              </button>
              
              <button
                type="button"
                className={`device-pill-btn ${previewDevice === 'mobile' ? 'active' : ''}`}
                onClick={() => setPreviewDevice('mobile')}
              >
                📱 Mobile
              </button>
            </div>

            {/* Template context categorization selector */}
            <div className="category-switcher-row">
              <span className="category-select-lbl">Category:</span>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="category-dropdown-field"
              >
                <option value="invitation">Invitation</option>
                <option value="rsvp">RSVP Confirmation</option>
                <option value="reminder">Advisory Reminder</option>
                <option value="thankyou">Thank You Note</option>
              </select>
            </div>
          </div>

          {/* Active Canvas Display */}
          <div className={`preview-canvas-wrapper ${previewDevice === 'mobile' ? 'mobile-frame' : ''}`}>
            
            {/* EMAIL EDITOR CANVAS */}
            {editorMode === 'email' && (
              <div 
                className="email-preview-card"
                style={{
                  paddingTop: `${paddingTop}px`,
                  paddingBottom: `${paddingBottom}px`,
                  paddingLeft: `${paddingLeft}px`,
                  paddingRight: `${paddingRight}px`,
                  fontFamily: fontFamily
                }}
              >
                {/* Bouquet header image card */}
                <div className="email-header-image-box">
                  <img 
                    src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&auto=format&fit=crop&q=80" 
                    alt="Rose Bouquet" 
                    className="email-header-photo"
                  />
                  <div className="email-header-image-overlay">
                    <h2>You're Invited</h2>
                  </div>
                </div>

                {/* Email Body details */}
                <div className="email-card-content-body">
                  <span className="email-card-category-tag" style={{ color: selectedColor }}>
                    {templateContent.subtitle}
                  </span>
                  
                  <h3 className="email-card-greeting">Hello {"{{guest_name}}"},</h3>
                  
                  <p className="email-card-main-text" style={{ fontSize: fontSize }}>
                    {formatBodyText(templateContent.body)}
                  </p>

                  {/* Two column split information details */}
                  <div className="email-card-split-details">
                    <div className="split-column">
                      <span className="split-column-lbl">WHEN</span>
                      <span className="split-column-val">{"{{event_date}}"}</span>
                    </div>

                    <div className="split-column">
                      <span className="split-column-lbl">WHERE</span>
                      <span className="split-column-val">Grand Ballroom, Azure Heights</span>
                    </div>
                  </div>

                  {/* Dynamic styled click trigger button */}
                  <div className="email-card-cta-row">
                    <button 
                      type="button" 
                      className="btn-email-preview-cta"
                      style={{ 
                        background: selectedColor === '#ffffff' ? '#ffffff' : `linear-gradient(135deg, ${selectedColor}dd 0%, ${selectedColor} 100%)`,
                        color: selectedColor === '#ffffff' ? '#1e293b' : '#ffffff',
                        border: selectedColor === '#ffffff' ? '1px solid #cbd5e1' : 'none'
                      }}
                      onClick={() => triggerToast('Interacting with template Call-To-Action...')}
                    >
                      {templateContent.btnText}
                    </button>
                  </div>

                  {/* Footer message details */}
                  <div className="email-card-footer-msg">
                    {templateContent.footer}
                  </div>
                </div>
              </div>
            )}

            {/* WHATSAPP EDITOR CANVAS */}
            {editorMode === 'whatsapp' && (
              <div className="whatsapp-phone-mockup">
                {/* Green header row */}
                <div className="whatsapp-phone-hdr">
                  <span className="wa-back-arrow">←</span>
                  <div className="wa-avatar-mock">💬</div>
                  <div className="wa-contact-details">
                    <span className="wa-contact-name">Digital Concierge</span>
                    <span className="wa-online-status">Online</span>
                  </div>
                </div>

                {/* Chat bubble screen area */}
                <div className="whatsapp-chat-screen-canvas">
                  <div className="whatsapp-message-bubble-item">
                    <div 
                      className="wa-bubble-content-text"
                      dangerouslySetInnerHTML={{
                        __html: `
                          <div class="wa-subtitle-mock" style="color: ${selectedColor}; font-weight: 700; font-size: 0.75rem; margin-bottom: 0.25rem;">
                            ${templateContent.subtitle}
                          </div>
                          <div style="font-size: 0.825rem; font-family: ${fontFamily}; line-height: 1.45;">
                            Hello {{guest_name}},<br/><br/>
                            ${formatBodyText(templateContent.body, true)}<br/><br/>
                            <strong>*When*</strong>: {{event_date}}<br/>
                            <strong>*Where*</strong>: Grand Ballroom, Azure Heights<br/><br/>
                            Link: <span style="color: #0284c7; text-decoration: underline;">eventhub360.co/invite/guest</span>
                          </div>
                        `
                      }}
                    />
                    
                    {/* WhatsApp Action button link */}
                    <div className="whatsapp-quick-reply-btn-mock">
                      <span className="wa-btn-arrow">🔗</span> {templateContent.btnText}
                    </div>

                    <span className="wa-bubble-timestamp">15:28</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Dismissible guide toast badge */}
          {showToastNotice && (
            <div className="drag-helper-badge-pill">
              <span className="helper-icon">⚡</span>
              <span className="helper-txt">Drag blocks into the workspace</span>
              <button 
                type="button" 
                className="btn-close-helper-badge"
                onClick={() => setShowToastNotice(false)}
              >
                ✕
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
