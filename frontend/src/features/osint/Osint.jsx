import React, { useState, useEffect, useCallback } from 'react';
import { 
  HiOutlineGlobeAlt, 
  HiOutlineTrash, 
  HiOutlinePlus,
  HiOutlineArrowRight,
  HiOutlineArrowLeft
} from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import toast from 'react-hot-toast';
import usePolling from '../../hooks/usePolling';
import StepWizard from '../../components/wizard/StepWizard';
import './Osint.css';

export default function Osint() {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState([]);

  const WIZARD_STEPS = [
    { label: t('admin_dashboard.osint.step1_title', 'Data Target') },
    { label: t('admin_dashboard.osint.step2_title', 'Data OSINT') },
  ];
  const [loading, setLoading] = useState(true);
  
  // State for form
  const [showForm, setShowForm] = useState(false);
  const [osintForm, setOsintForm] = useState({ target_name: '', target_role: '', public_data: '' });
  const [osintUrl, setOsintUrl] = useState('');
  const [isOsintLoading, setIsOsintLoading] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [step, setStep] = useState(0);
  
  // State for detail view
  const [selectedProfile, setSelectedProfile] = useState(null);

  const loadProfiles = useCallback(async () => {
    try {
      const res = await api.get('/osint');
      setProfiles(res.data);
    } catch (err) {
      if (loading) toast.error(t('admin_dashboard.osint.messages.load_failed'));
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => { loadProfiles(); }, []);

  // Real-time polling every 5 seconds
  usePolling(loadProfiles, 5000);

  const handleOsintScrape = async () => {
    if (!osintUrl) return toast.error(t('admin_dashboard.osint.messages.url_required'));
    setIsScraping(true);
    toast.loading(t('admin_dashboard.osint.messages.scraping'), { id: 'scrape' });
    try {
      const res = await api.post('/osint/scrape', { url: osintUrl });
      setOsintForm(prev => ({ 
        ...prev, 
        public_data: prev.public_data ? `${prev.public_data}\n\n[Scraped from ${osintUrl}]:\n${res.data.text}` : `[Scraped from ${osintUrl}]:\n${res.data.text}`
      }));
      setOsintUrl('');
      toast.success(t('admin_dashboard.osint.messages.scrape_success'), { id: 'scrape' });
    } catch (err) {
      toast.error(err.response?.data?.detail || t('admin_dashboard.osint.messages.scrape_failed'), { id: 'scrape' });
    } finally {
      setIsScraping(false);
    }
  };

  const handleOsintAnalyze = async (e) => {
    e.preventDefault();
    if (!osintForm.target_name || !osintForm.public_data) return toast.error(t('admin_dashboard.osint.messages.form_required'));
    
    setIsOsintLoading(true);
    toast.loading(t('admin_dashboard.osint.messages.analyzing'), { id: 'osint' });
    try {
      const res = await api.post('/osint/analyze', osintForm);
      toast.success(t('admin_dashboard.osint.messages.analyze_success'), { id: 'osint' });
      setOsintForm({ target_name: '', target_role: '', public_data: '' });
      setSelectedProfile(res.data);
      setShowForm(false);
      setStep(0);
      loadProfiles(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.detail || t('admin_dashboard.osint.messages.analyze_failed'), { id: 'osint' });
    } finally {
      setIsOsintLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm(t('admin_dashboard.osint.messages.delete_confirm'))) return;
    try {
      await api.delete(`/osint/${id}`);
      toast.success(t('admin_dashboard.osint.messages.delete_success'));
      if (selectedProfile?.id === id) setSelectedProfile(null);
      loadProfiles();
    } catch (err) {
      toast.error(t('admin_dashboard.osint.messages.delete_failed'));
    }
  };

  const renderDetail = () => {
    if (!selectedProfile) return null;
    return (
      <div className="osint-detail card card-glow slide-up">
        <div className="detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <h2 style={{ color: 'var(--neon-cyan)' }}>{selectedProfile.target_name}</h2>
          <button className="btn btn-secondary" onClick={() => setSelectedProfile(null)}>{t('admin_dashboard.osint.btn_close')}</button>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>{t('admin_dashboard.osint.role_label')} {selectedProfile.target_role || '-'}</p>

        <div className="risk-banner" style={{ 
          borderColor: selectedProfile.risk_level === 'CRITICAL' ? 'var(--danger)' : selectedProfile.risk_level === 'HIGH' ? 'var(--warning)' : 'var(--neon-purple)',
          padding: 'var(--space-md)',
          marginBottom: 'var(--space-md)'
        }}>
          <h3 style={{ color: selectedProfile.risk_level === 'CRITICAL' ? 'var(--danger)' : 'var(--warning)', marginBottom: '8px' }}>
            {t('admin_dashboard.osint.risk_label')} {selectedProfile.risk_level}
          </h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            {selectedProfile.vulnerability_summary}
          </p>
        </div>

        <div className="intel-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
          <h4 style={{ color: 'var(--neon-cyan)', marginBottom: '10px' }}>{t('admin_dashboard.osint.attack_vectors')}</h4>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            {selectedProfile.attack_vectors?.map((vec, i) => (
              <li key={i} style={{ marginBottom: '8px' }}>{vec}</li>
            ))}
          </ul>
        </div>

        <div className="intel-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 'var(--space-md)', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)', marginBottom: 'var(--space-md)' }}>
          <h4 style={{ color: 'var(--accent-primary)', marginBottom: '10px' }}>{t('admin_dashboard.osint.phishing_draft')}</h4>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', width: '100%' }}>
            <p><strong>From:</strong> {selectedProfile.example_phishing_email?.sender}</p>
            <p><strong>Subject:</strong> {selectedProfile.example_phishing_email?.subject}</p>
            <hr style={{ borderColor: 'var(--border)', margin: '10px 0' }} />
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {selectedProfile.example_phishing_email?.body}
            </div>
          </div>
        </div>

        <div className="intel-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 'var(--space-md)' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>{t('admin_dashboard.osint.raw_data')}</h4>
          <pre style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>
            {selectedProfile.public_data}
          </pre>
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1><HiOutlineGlobeAlt size={28} style={{ verticalAlign: 'bottom', marginRight: '10px', color: 'var(--neon-cyan)' }}/> {t('admin_dashboard.osint.page_title')}</h1>
          <p>{t('admin_dashboard.osint.page_desc')}</p>
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setSelectedProfile(null); setStep(0); setOsintForm({ target_name: '', target_role: '', public_data: '' }); }}>
            <HiOutlinePlus size={18} /> {t('admin_dashboard.osint.btn_new_profile')}
          </button>
        )}
      </div>

      {showForm ? (
        <div className="card card-glow slide-down">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
            <h2>{t('admin_dashboard.osint.form_title')}</h2>
          </div>
          
          <p style={{ marginBottom: 'var(--space-lg)', color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: t('admin_dashboard.osint.form_desc') }} />

          <StepWizard steps={WIZARD_STEPS} currentStep={step} onStepClick={(i) => { if (i <= step) setStep(i); }} />

          <form onSubmit={handleOsintAnalyze} className="osint-form">
            {/* ===== STEP 1: Data Target ===== */}
            {step === 0 && (
              <div className="wizard-content" key="step-0">
                <div className="wizard-step-header">
                  <h3>{t('admin_dashboard.osint.step1_title')}</h3>
                  <p>{t('admin_dashboard.osint.step1_desc')}</p>
                </div>
                <div className="grid-2">
                  <div className="input-group">
                    <label>{t('admin_dashboard.osint.target_name')}</label>
                    <input type="text" className="input" placeholder="e.g. Budi Santoso" value={osintForm.target_name} onChange={e => setOsintForm({...osintForm, target_name: e.target.value})} required />
                  </div>
                  <div className="input-group">
                    <label>{t('admin_dashboard.osint.target_role')}</label>
                    <input type="text" className="input" placeholder="e.g. HR Manager" value={osintForm.target_role} onChange={e => setOsintForm({...osintForm, target_role: e.target.value})} />
                  </div>
                </div>

                <div className="wizard-nav">
                  <div className="wizard-nav-left">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>{t('admin_dashboard.campaigns.form.btn_cancel', 'Batal')}</button>
                  </div>
                  <div className="wizard-nav-right">
                    <button type="button" className="btn btn-primary" disabled={!osintForm.target_name.trim()} onClick={() => setStep(1)}>
                      {t('admin_dashboard.campaigns.form.btn_next', 'Selanjutnya')} <HiOutlineArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== STEP 2: Data OSINT ===== */}
            {step === 1 && (
              <div className="wizard-content" key="step-1">
                <div className="wizard-step-header">
                  <h3>{t('admin_dashboard.osint.step2_title')}</h3>
                  <p>{t('admin_dashboard.osint.step2_desc')}</p>
                </div>

                <div className="input-group">
                  <label>{t('admin_dashboard.osint.scrape_url')}</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="url" className="input" placeholder="https://..." value={osintUrl} onChange={e => setOsintUrl(e.target.value)} />
                    <button type="button" className="btn btn-secondary" onClick={handleOsintScrape} disabled={isScraping || !osintUrl}>
                      {isScraping ? '...' : 'Scrape'}
                    </button>
                  </div>
                  <small style={{ color: 'var(--text-muted)', marginTop: '5px' }}>{t('admin_dashboard.osint.scrape_hint')}</small>
                </div>

                <div className="input-group">
                  <label>{t('admin_dashboard.osint.digital_footprint')}</label>
                  <textarea 
                    className="input" 
                    rows="6" 
                    value={osintForm.public_data} 
                    onChange={e => setOsintForm({...osintForm, public_data: e.target.value})}
                    required
                  ></textarea>
                </div>

                <div className="wizard-nav">
                  <div className="wizard-nav-left">
                    <button type="button" className="btn btn-secondary" onClick={() => setStep(0)}>
                      <HiOutlineArrowLeft size={16} /> {t('admin_dashboard.campaigns.form.btn_back', 'Sebelumnya')}
                    </button>
                  </div>
                  <div className="wizard-nav-right">
                    <button type="submit" className="btn btn-primary" disabled={isOsintLoading || !osintForm.public_data.trim()}>
                      {isOsintLoading ? <span className="spinner"></span> : t('admin_dashboard.osint.btn_run_ai')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      ) : (
        <div className="osint-layout">
          <div className="osint-list card card-glow">
            <h3 style={{ marginBottom: 'var(--space-md)', color: 'var(--neon-cyan)' }}>{t('admin_dashboard.osint.history_title')}</h3>
            {profiles.length === 0 ? (
              <div className="empty-state">{t('admin_dashboard.osint.history_empty')}</div>
            ) : (
              <div className="profile-list">
                {profiles.map(p => (
                  <div 
                    key={p.id} 
                    className={`profile-item ${selectedProfile?.id === p.id ? 'active' : ''}`}
                    onClick={() => setSelectedProfile(p)}
                  >
                    <div className="profile-info">
                      <strong>{p.target_name}</strong>
                      <span className="role">{p.target_role || 'No Role'}</span>
                    </div>
                    <div className="profile-actions">
                      <span className={`badge ${p.risk_level === 'CRITICAL' ? 'badge-danger' : p.risk_level === 'HIGH' ? 'badge-warning' : 'badge-default'}`}>
                        {p.risk_level}
                      </span>
                      <button className="delete-btn" title="Hapus Profil" onClick={(e) => handleDelete(e, p.id)}>
                        <HiOutlineTrash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="osint-content">
            {selectedProfile ? (
              renderDetail()
            ) : (
              <div className="empty-state card card-glow" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {t('admin_dashboard.osint.detail_empty')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
