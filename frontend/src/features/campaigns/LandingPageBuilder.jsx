import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineSparkles, HiOutlineCheckCircle, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi2';
import api from '../../services/api';
import toast from 'react-hot-toast';
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
  const { t } = useTranslation();
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

  const loadTemplate = async (id) => {
    console.log("loadTemplate called with id:", id);
    const tmpl = templates.find(t => t.id === id);
    console.log("Found template in list:", tmpl);
    if (tmpl) {
      if (tmpl.config?.theme_style === 'raw_html' && !tmpl.config.raw_html) {
        console.log("Fetching full config from API...");
        try {
          const res = await api.get(`landing-pages/${id}`);
          console.log("Fetch success, config:", res.data.config);
          onChange(res.data.config);
          setSelectedTemplate(id);
        } catch (_err) {
          console.error("Fetch error:", _err);
          toast.error('Gagal memuat detail template');
        }
      } else {
        console.log("No fetch needed, using config directly");
        onChange(tmpl.config);
        setSelectedTemplate(id);
      }
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
          <HiOutlineSparkles /> {t('admin_dashboard.campaigns.form.lpb.tab_ai')}
        </button>
        <button 
          type="button"
          className={`lpb-tab ${activeTab === 'custom' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('custom');
            onChange({ ...value, theme_style: value.theme_style === 'raw_html' || value.theme_style === 'ai' ? 'generic' : value.theme_style || 'generic' });
          }}
        >
          {t('admin_dashboard.campaigns.form.lpb.tab_custom')}
        </button>
        <button 
          type="button"
          className={`lpb-tab ${activeTab === 'template' ? 'active' : ''}`}
          onClick={() => setActiveTab('template')}
        >
          {t('admin_dashboard.campaigns.form.lpb.tab_template')}
        </button>
        <button 
          type="button"
          className={`lpb-tab ${activeTab === 'raw' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('raw');
            onChange({ ...value, theme_style: 'raw_html' });
          }}
        >
          {t('admin_dashboard.campaigns.form.lpb.tab_raw')}
        </button>
      </div>

      <div className="lpb-content">
        {activeTab === 'ai' && (
          <div className="lpb-ai-mode">
            <div className="lpb-ai-info">
              <HiOutlineSparkles size={32} style={{ color: 'var(--accent-primary)' }} />
              <h4>{t('admin_dashboard.campaigns.form.lpb.ai_title', 'AI Landing Page Generation')}</h4>
              <p>
                {t('admin_dashboard.campaigns.form.lpb.ai_desc', "The landing page configuration will be generated automatically by AI based on your campaign's Theme and Difficulty Level when you click 'Generate Template' on the main page.")}
              </p>
              <div className="lpb-badge-success" style={{ marginBottom: '1rem' }}>
                <HiOutlineCheckCircle /> {t('admin_dashboard.campaigns.form.lpb.ai_active', 'AI Mode Active')}
              </div>
            </div>
            
            <div className="input-group" style={{ background: 'rgba(0, 240, 255, 0.03)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0, 240, 255, 0.1)', textAlign: 'left', width: '100%', marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HiOutlineSparkles size={16} style={{ color: 'var(--neon-cyan)' }} />
                {t('admin_dashboard.campaigns.form.ai_instructions', 'Additional AI Instructions')}
              </label>
              <textarea 
                className="input" 
                rows="4" 
                placeholder={t('admin_dashboard.campaigns.form.ai_instructions_placeholder', 'Provide specific details for the AI to generate a more accurate landing page...')}
                value={value?.brand_context || ''}
                onChange={(e) => handleFieldChange('brand_context', e.target.value)}
                style={{ lineHeight: '1.6' }}
              ></textarea>
              <small className="text-muted" style={{ marginTop: '4px', display: 'block' }}>
                {t('admin_dashboard.campaigns.form.ai_instructions_desc', 'Optional — AI will use these details to generate a more realistic and personalized page.')}
              </small>
            </div>
          </div>
        )}

        {activeTab === 'template' && (
          <div className="lpb-template-mode">
            <h4>{t('admin_dashboard.campaigns.form.lpb.tmpl_title')}</h4>
            <div className="lpb-template-list">
              {templates.length === 0 ? (
                <p className="text-muted">{t('admin_dashboard.campaigns.form.lpb.tmpl_empty')}</p>
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
              <h5>{t('admin_dashboard.campaigns.form.lpb.raw_title')}</h5>
              <p className="text-muted" style={{ marginBottom: '16px' }}>
                {t('admin_dashboard.campaigns.form.lpb.raw_desc')}
              </p>
              <input type="file" accept=".html,.htm" className="input" onChange={handleFileUpload} />
              
              <div className="input-group" style={{ marginTop: '16px' }}>
                <label>{t('admin_dashboard.campaigns.form.lpb.raw_code')}</label>
                <textarea 
                  className="input" 
                  rows="12" 
                  style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}
                  value={value.raw_html || ''}
                  onChange={e => onChange({ ...value, raw_html: e.target.value, theme_style: 'raw_html' })}
                  placeholder={t('admin_dashboard.campaigns.form.lpb.raw_placeholder')}
                />
              </div>
            </div>
            
            <div className="lpb-preview" style={{ marginTop: '24px' }}>
              <h5>{t('admin_dashboard.campaigns.form.lpb.preview_title')}</h5>
              <div className="lpb-preview-wrapper" style={{ height: '500px', backgroundColor: '#fff', overflow: 'hidden', padding: 0 }}>
                {value.raw_html ? (
                  <iframe 
                    title="Preview HTML"
                    srcDoc={value.raw_html} 
                    style={{ width: '100%', height: '100%', border: 'none' }} 
                  />
                ) : (
                  <div style={{ padding: '20px', color: '#999' }}>{t('admin_dashboard.campaigns.form.lpb.preview_empty')}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'custom' || activeTab === 'template') && (
          <div className="lpb-custom-grid">
            {/* Editor Panel */}
            <div className="lpb-editor">
              {activeTab === 'template' && !selectedTemplate ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <h5>Pilih Template</h5>
                  <p>Silakan pilih template dari daftar di atas untuk melihat pratinjau.</p>
                </div>
              ) : value.theme_style === 'raw_html' ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <h5>Raw HTML Template</h5>
                  <p>Template ini menggunakan kode HTML kustom.</p>
                  <p>Beralih ke tab <strong>Raw HTML</strong> jika Anda ingin mengedit kode sumbernya.</p>
                </div>
              ) : (
                <>
                  <div className="lpb-editor-section">
                    <h5>{t('admin_dashboard.campaigns.form.lpb.edit_id')}</h5>
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
                <h5>{t('admin_dashboard.campaigns.form.lpb.edit_colors')}</h5>
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
                  <h5>{t('admin_dashboard.campaigns.form.lpb.edit_fields')}</h5>
                  <button type="button" className="btn btn-sm btn-ghost" onClick={addFormField}>
                    <HiOutlinePlus /> {t('admin_dashboard.campaigns.form.lpb.add_field')}
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
                <h5>{t('admin_dashboard.campaigns.form.lpb.edit_footer')}</h5>
                <div className="input-group">
                  <label>Footer Text</label>
                  <input className="input" value={value.footer_text || ''} onChange={e => handleFieldChange('footer_text', e.target.value)} />
                </div>
              </div>
              </>
              )}
            </div>

            {/* Preview Panel */}
            <div className="lpb-preview">
              <h5>{t('admin_dashboard.campaigns.form.lpb.preview_title')}</h5>
              {activeTab === 'template' && !selectedTemplate ? (
                <div className="lpb-preview-wrapper" style={{ height: '500px', backgroundColor: '#fff', overflow: 'hidden', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ padding: '20px', color: '#999' }}>Pratinjau akan muncul di sini</div>
                </div>
              ) : value.theme_style === 'raw_html' ? (
                <div className="lpb-preview-wrapper" style={{ height: '500px', backgroundColor: '#fff', overflow: 'hidden', padding: 0 }}>
                  {value.raw_html ? (
                    <iframe 
                      title="Preview HTML"
                      srcDoc={value.raw_html} 
                      style={{ width: '100%', height: '100%', border: 'none' }} 
                    />
                  ) : (
                    <div style={{ padding: '20px', color: '#999' }}>{t('admin_dashboard.campaigns.form.lpb.preview_empty')}</div>
                  )}
                </div>
              ) : (
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
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
