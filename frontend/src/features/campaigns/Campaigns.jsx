import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineRocketLaunch, HiOutlineSparkles, HiOutlinePencil, HiOutlineTrash, HiOutlineArrowRight, HiOutlineArrowLeft } from 'react-icons/hi2';
import LandingPageBuilder from './LandingPageBuilder';
import StepWizard from '../../components/wizard/StepWizard';

// We will move WIZARD_STEPS inside the component to support i18n

const INITIAL_FORM = {
  name: '', 
  theme: '', 
  difficulty: 'MEDIUM', 
  target_departments: [],
  email_mode: 'ai',
  email_subject: '',
  email_sender: '',
  email_body: '',
  ai_instructions: '',
  link_mode: 'internal',
  external_url: '',
  use_qr_code: false,
  landing_page_mode: 'ai',
  landing_page_config: { theme_style: 'ai' },
};

export default function Campaigns() {
  const { t, i18n } = useTranslation();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [step, setStep] = useState(0);

  const WIZARD_STEPS = [
    { label: t('admin_dashboard.campaigns.form.step1_short', 'Informasi Dasar') },
    { label: t('admin_dashboard.campaigns.form.step2_short', 'Pengaturan Email') },
    { label: t('admin_dashboard.campaigns.form.step3_short', 'Landing Page') },
  ];

  useEffect(() => {
    loadData();
  }, []);

  // Polling logic for active background tasks (AI Generation or Campaign Launching)
  useEffect(() => {
    const needsPolling = campaigns.some(c => c.status === 'GENERATING' || c.status === 'LAUNCHING');
    
    let interval;
    if (needsPolling) {
      interval = setInterval(() => {
        // Refresh only campaigns list quietly
        api.get('/campaigns').then(res => {
          setCampaigns(res.data);
        }).catch(err => console.error("Polling error", err));
      }, 4000); // Poll every 4 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [campaigns]);

  const loadData = async () => {
    try {
      const [campRes, deptRes, tmplRes, savedTmplRes] = await Promise.all([
        api.get('/campaigns'),
        api.get('/departments'),
        api.get('/landing-pages').catch(() => ({ data: [] })),
        api.get('/saved-templates').catch(() => ({ data: [] }))
      ]);
      setCampaigns(campRes.data);
      setDepartments(deptRes.data);
      setTemplates(tmplRes.data);
      setSavedTemplates(savedTmplRes.data);
    } catch (err) {
      toast.error(t('admin_dashboard.campaigns.messages.load_data_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        // Update campaign (only basic details can be updated once created)
        await api.put(`/campaigns/${editId}`, {
          name: form.name,
          theme: form.theme,
          difficulty: form.difficulty,
          landing_page_mode: form.link_mode === 'external' ? 'external' : 'internal',
          external_url: form.link_mode === 'external' ? (form.external_url || undefined) : "",
        });
        toast.success(t('admin_dashboard.campaigns.messages.update_success'));
      } else {
        // If link_mode is external, override landing page settings
        const payload = { ...form };
        if (payload.link_mode === 'external') {
          payload.landing_page_mode = 'external';
          payload.landing_page_config = { url: payload.external_url };
        }
        
        if (payload.email_mode === 'template') {
          payload.email_mode = 'custom';
        }
        
        // Ensure use_qr_code is sent
        payload.use_qr_code = form.use_qr_code;

        await api.post('/campaigns', payload);
        toast.success(t('admin_dashboard.campaigns.messages.create_success'));
      }
      setShowForm(false);
      setEditId(null);
      setForm({ ...INITIAL_FORM });
      setStep(0);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || t('admin_dashboard.campaigns.messages.save_failed'));
    }
  };

  const handleEdit = async (c) => {
    try {
      toast.loading(t('admin_dashboard.campaigns.messages.loading_data'), { id: 'edit-load' });
      const res = await api.get(`/campaigns/${c.id}`);
      const detail = res.data;
      
      let linkMode = 'internal';
      let extUrl = '';
      if (detail.templates && detail.templates.length > 0) {
        const tmpl = detail.templates[0];
        if (tmpl.landing_page_mode === 'external') {
          linkMode = 'external';
          extUrl = tmpl.landing_page_config?.url || '';
        }
      }

      setForm({
        ...INITIAL_FORM,
        name: detail.name,
        theme: detail.theme || '',
        difficulty: detail.difficulty || 'MEDIUM',
        link_mode: linkMode,
        external_url: extUrl,
      });
      setEditId(c.id);
      setStep(0);
      setShowForm(true);
      toast.dismiss('edit-load');
    } catch (err) {
      toast.error(t('admin_dashboard.campaigns.messages.load_detail_failed'), { id: 'edit-load' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(t('admin_dashboard.campaigns.messages.delete_confirm').replace('{{name}}', name))) return;
    try {
      await api.delete(`/campaigns/${id}`);
      toast.success(t('admin_dashboard.campaigns.messages.delete_success'));
      loadData();
    } catch (err) {
      toast.error(t('admin_dashboard.campaigns.messages.delete_failed'));
    }
  };

  const handleGenerate = async (id) => {
    try {
      toast.loading(t('admin_dashboard.campaigns.messages.generating_template'), { id: 'gen' });
      await api.post(`/campaigns/${id}/generate`);
      toast.success(t('admin_dashboard.campaigns.messages.generate_success'), { id: 'gen' });
      loadData();
    } catch (err) {
      toast.error(t('admin_dashboard.campaigns.messages.generate_failed'), { id: 'gen' });
    }
  };

  const handleLaunch = async (id) => {
    if (!confirm(t('admin_dashboard.campaigns.messages.launch_confirm'))) return;
    try {
      await api.post(`/campaigns/${id}/launch`);
      toast.success(t('admin_dashboard.campaigns.messages.launch_success'));
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || t('admin_dashboard.campaigns.messages.launch_failed'));
    }
  };

  const statusBadge = (s) => {
    const map = {
      DRAFT: 'badge-default', GENERATING: 'badge-info', READY: 'badge-warning',
      LAUNCHING: 'badge-info', ACTIVE: 'badge-success', COMPLETED: 'badge-success', STOPPED: 'badge-danger',
    };
    return `badge ${map[s] || 'badge-default'}`;
  };

  const toggleDept = (id) => {
    setForm(f => ({
      ...f,
      target_departments: f.target_departments.includes(id)
        ? f.target_departments.filter(d => d !== id)
        : [...f.target_departments, id]
    }));
  };

  const canGoNext = () => {
    if (step === 0) return form.name.trim() !== '';
    return true;
  };

  const openNewForm = () => {
    setEditId(null);
    setForm({ ...INITIAL_FORM });
    setStep(0);
    setShowForm(!showForm);
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>{t('admin_dashboard.campaigns.title')}</h1>
          <p>{t('admin_dashboard.campaigns.desc')}</p>
        </div>
        <button className="btn btn-primary" onClick={openNewForm}>
          <HiOutlinePlus size={18} /> {t('admin_dashboard.campaigns.btn_new')}
        </button>
      </div>

      {showForm && (
        <div className="card-glow" style={{ marginBottom: 'var(--space-2xl)' }}>
          <h3 style={{ marginBottom: 'var(--space-lg)', borderBottom: '1px solid var(--divider)', paddingBottom: 'var(--space-sm)' }}>
            {editId ? t('admin_dashboard.campaigns.form.title_edit') : t('admin_dashboard.campaigns.form.title_new')}
          </h3>

          {/* Wizard Stepper */}
          <StepWizard 
            steps={editId ? WIZARD_STEPS.slice(0, 2) : WIZARD_STEPS} 
            currentStep={step} 
            onStepClick={(i) => { if (i <= step) setStep(i); }}
          />

          <form onSubmit={handleSubmit}>
            {/* ===== STEP 1: Informasi Dasar ===== */}
            {step === 0 && (
              <div className="wizard-content" key="step-0">
                <div className="wizard-step-header">
                  <h3>{t('admin_dashboard.campaigns.form.step1_title')}</h3>
                  <p>{t('admin_dashboard.campaigns.form.step1_desc')}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                  <div className="input-group">
                    <label>{t('admin_dashboard.campaigns.form.name')}</label>
                    <input className="input" placeholder={t('admin_dashboard.campaigns.form.name_placeholder')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="grid-2">
                    <div className="input-group">
                      <label>{t('admin_dashboard.campaigns.form.theme')}</label>
                      <input className="input" placeholder={t('admin_dashboard.campaigns.form.theme_placeholder')} value={form.theme} onChange={e => setForm({ ...form, theme: e.target.value })} />
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{t('admin_dashboard.campaigns.form.theme_desc')}</small>
                    </div>
                    <div className="input-group">
                      <label>{t('admin_dashboard.campaigns.form.difficulty')}</label>
                      <select className="input" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                        <option value="LOW">{t('admin_dashboard.campaigns.form.diff_low')}</option>
                        <option value="MEDIUM">{t('admin_dashboard.campaigns.form.diff_medium')}</option>
                        <option value="HIGH">{t('admin_dashboard.campaigns.form.diff_high')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="input-group">
                    <label>{t('admin_dashboard.campaigns.form.departments')}</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {departments.map(d => (
                        <button type="button" key={d.id} className={`btn btn-sm ${form.target_departments.includes(d.id) ? 'btn-primary' : 'btn-secondary'}`} onClick={() => toggleDept(d.id)} disabled={!!editId}>
                          {d.name} ({d.employee_count})
                        </button>
                      ))}
                    </div>
                    {editId && <small style={{ color: 'var(--text-muted)' }}>{t('admin_dashboard.campaigns.form.dept_warning')}</small>}
                  </div>
                </div>

                {/* Navigation */}
                <div className="wizard-nav">
                  <div className="wizard-nav-left">
                    <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditId(null); }}>{t('admin_dashboard.campaigns.form.btn_cancel')}</button>
                  </div>
                  <div className="wizard-nav-right">
                    <button type="button" className="btn btn-primary" disabled={!canGoNext()} onClick={() => setStep(1)}>
                      {t('admin_dashboard.campaigns.form.btn_next')} <HiOutlineArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== STEP 2: Pengaturan Email ===== */}
            {step === 1 && (
              <div className="wizard-content" key="step-1">
                <div className="wizard-step-header">
                  <h3>{t('admin_dashboard.campaigns.form.step2_title')}</h3>
                  <p>{t('admin_dashboard.campaigns.form.step2_desc')}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                  {/* Link Mode */}
                  <div className="input-group">
                    <label>{t('admin_dashboard.campaigns.form.link_target')}</label>
                    <div className="lpb-tabs" style={{ marginBottom: '8px' }}>
                      <button type="button" className={`lpb-tab ${form.link_mode === 'internal' ? 'active' : ''}`} onClick={() => setForm({...form, link_mode: 'internal'})}>
                        {t('admin_dashboard.campaigns.form.link_internal')}
                      </button>
                      <button type="button" className={`lpb-tab ${form.link_mode === 'external' ? 'active' : ''}`} onClick={() => setForm({...form, link_mode: 'external'})}>
                        {t('admin_dashboard.campaigns.form.link_external')}
                      </button>
                    </div>
                  </div>

                  {form.link_mode === 'external' && (
                    <div className="input-group">
                      <label>{t('admin_dashboard.campaigns.form.ext_url')}</label>
                      <input className="input" type="url" placeholder="https://example.com" value={form.external_url} onChange={e => setForm({...form, external_url: e.target.value})} />
                      <small style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                        {t('admin_dashboard.campaigns.form.ext_url_desc')}
                      </small>
                    </div>
                  )}

                  {/* Quishing Option */}
                  {!editId && (
                    <div className="input-group" style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      gap: '12px', 
                      background: 'rgba(255, 0, 170, 0.05)', 
                      padding: '12px 16px', 
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(255, 0, 170, 0.2)' 
                    }}>
                      <input 
                        type="checkbox" 
                        id="use_qr_code"
                        checked={form.use_qr_code} 
                        onChange={e => setForm({...form, use_qr_code: e.target.checked})} 
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor="use_qr_code" style={{ cursor: 'pointer', margin: 0, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'var(--neon-magenta)', fontWeight: 600, fontSize: '1rem' }}>{t('admin_dashboard.campaigns.form.quishing')}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 400, marginTop: '2px' }}>
                          {t('admin_dashboard.campaigns.form.quishing_desc')}
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Email Mode */}
                  {!editId && (
                    <div className="input-group" style={{ paddingTop: 'var(--space-md)', borderTop: '1px solid var(--divider)' }}>
                      <label>{t('admin_dashboard.campaigns.form.email_method')}</label>
                      <div className="lpb-tabs" style={{ marginBottom: '8px' }}>
                        <button type="button" className={`lpb-tab ${form.email_mode === 'ai' ? 'active' : ''}`} onClick={() => setForm({...form, email_mode: 'ai'})}>
                          <HiOutlineSparkles /> {t('admin_dashboard.campaigns.form.email_ai')}
                        </button>
                        <button type="button" className={`lpb-tab ${form.email_mode === 'custom' ? 'active' : ''}`} onClick={() => setForm({...form, email_mode: 'custom'})}>
                          {t('admin_dashboard.campaigns.form.email_custom')}
                        </button>
                        <button type="button" className={`lpb-tab ${form.email_mode === 'template' ? 'active' : ''}`} onClick={() => setForm({...form, email_mode: 'template'})}>
                          {t('admin_dashboard.campaigns.form.email_gallery')}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Note for templates */}
                  {!editId && form.email_mode === 'template' && (
                    <div className="input-group" style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <label>{t('admin_dashboard.campaigns.form.select_template')}</label>
                      <select 
                        className="input" 
                        onChange={e => {
                          const t = savedTemplates.find(x => x.id === e.target.value);
                          if (t) {
                            setForm({
                              ...form,
                              email_sender: t.email_sender_name || '',
                              email_subject: t.email_subject || '',
                              email_body: t.email_body_html || '',
                            });
                          }
                        }}
                        style={{ marginBottom: 'var(--space-md)' }}
                      >
                        <option value="">-- Pilih Template --</option>
                        {savedTemplates.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.email_subject})</option>
                        ))}
                      </select>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        <div className="input-group">
                          <label>{t('admin_dashboard.campaigns.form.sender')}</label>
                          <input className="input" value={form.email_sender} onChange={e => setForm({...form, email_sender: e.target.value})} required />
                        </div>
                        <div className="input-group">
                          <label>{t('admin_dashboard.campaigns.form.subject')}</label>
                          <input className="input" value={form.email_subject} onChange={e => setForm({...form, email_subject: e.target.value})} required />
                        </div>
                        <div className="input-group">
                          <label>{t('admin_dashboard.campaigns.form.email_body')}</label>
                          <textarea className="input" rows="6" value={form.email_body} onChange={e => setForm({...form, email_body: e.target.value})} required />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Instructions */}
                  {!editId && form.email_mode === 'ai' && (
                    <div className="input-group" style={{ background: 'rgba(0, 240, 255, 0.03)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0, 240, 255, 0.1)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <HiOutlineSparkles size={16} style={{ color: 'var(--neon-cyan)' }} />
                        {t('admin_dashboard.campaigns.form.ai_instructions')}
                      </label>
                      <textarea
                        className="input"
                        rows="4"
                        value={form.ai_instructions}
                        onChange={e => setForm({...form, ai_instructions: e.target.value})}
                        placeholder={t('admin_dashboard.campaigns.form.ai_instructions_placeholder')}
                        style={{ lineHeight: '1.6' }}
                      />
                      <small style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                        {t('admin_dashboard.campaigns.form.ai_instructions_desc')}
                      </small>
                    </div>
                  )}

                  {/* Custom Email Fields */}
                  {!editId && form.email_mode === 'custom' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                      <div className="input-group">
                        <label>{t('admin_dashboard.campaigns.form.sender')}</label>
                        <input className="input" placeholder="e.g. IT Support" value={form.email_sender} onChange={e => setForm({...form, email_sender: e.target.value})} required={form.email_mode === 'custom'} />
                      </div>
                      <div className="input-group">
                        <label>{t('admin_dashboard.campaigns.form.subject')}</label>
                        <input className="input" placeholder="Subject email phishing" value={form.email_subject} onChange={e => setForm({...form, email_subject: e.target.value})} required={form.email_mode === 'custom'} />
                      </div>
                      <div className="input-group">
                        <label>{t('admin_dashboard.campaigns.form.email_body')}</label>
                        <textarea
                          className="input"
                          rows="6"
                          value={form.email_body}
                          onChange={e => setForm({...form, email_body: e.target.value})}
                          required={form.email_mode === 'custom'}
                          placeholder={'<p>Dear Employee, please login at <a href="{{tracking_link}}">this portal</a>.</p>'}
                        />
                        <div style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: 'rgba(0, 240, 255, 0.06)', borderRadius: '4px', borderLeft: '3px solid var(--neon-cyan)', fontSize: '0.8rem' }}>
                          <strong>{t('admin_dashboard.campaigns.form.tracking_hint_strong', 'Penting:')}</strong> {t('admin_dashboard.campaigns.form.tracking_hint_1', 'Masukkan tag')} <code style={{ userSelect: 'all', background: 'rgba(0,240,255,0.1)', padding: '2px 4px', borderRadius: '4px', color: 'var(--neon-cyan)', fontWeight: 'bold' }}>{`{{tracking_link}}`}</code> {t('admin_dashboard.campaigns.form.tracking_hint_2', 'di dalam HTML agar sistem dapat melacak klik target.')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="wizard-nav">
                  <div className="wizard-nav-left">
                    <button type="button" className="btn btn-secondary" onClick={() => setStep(0)}>
                      <HiOutlineArrowLeft size={16} /> {t('admin_dashboard.campaigns.form.btn_back')}
                    </button>
                  </div>
                  <div className="wizard-nav-right">
                    {editId ? (
                      <button type="submit" className="btn btn-primary">
                        {t('admin_dashboard.campaigns.form.btn_save')}
                      </button>
                    ) : form.link_mode === 'external' ? (
                      <button type="submit" className="btn btn-primary">
                        <HiOutlineRocketLaunch size={16} /> {t('admin_dashboard.campaigns.form.btn_save')}
                      </button>
                    ) : (
                      <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
                        {t('admin_dashboard.campaigns.form.btn_next')} <HiOutlineArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ===== STEP 3: Landing Page ===== */}
            {step === 2 && !editId && (
              <div className="wizard-content" key="step-2">
                <div className="wizard-step-header">
                  <h3>{t('admin_dashboard.campaigns.form.step3_title')}</h3>
                  <p>{t('admin_dashboard.campaigns.form.step3_desc')}</p>
                </div>

                <div className="input-group">
                  <LandingPageBuilder
                    value={form.landing_page_config}
                    onChange={cfg => setForm(f => ({ ...f, landing_page_config: cfg, landing_page_mode: cfg.theme_style === 'raw_html' ? 'raw' : 'custom' }))}
                  />
                </div>

                {/* Navigation */}
                <div className="wizard-nav">
                  <div className="wizard-nav-left">
                    <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                      <HiOutlineArrowLeft size={16} /> {t('admin_dashboard.campaigns.form.btn_back')}
                    </button>
                  </div>
                  <div className="wizard-nav-right">
                    <button type="submit" className="btn btn-primary">
                      <HiOutlineRocketLaunch size={16} /> {t('admin_dashboard.campaigns.form.btn_save')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>{t('admin_dashboard.campaigns.table.name')}</th>
              <th>{t('admin_dashboard.campaigns.table.status')}</th>
              <th>{t('admin_dashboard.campaigns.table.difficulty')}</th>
              <th>Tema</th>
              <th>{t('admin_dashboard.campaigns.table.targets')}</th>
              <th>{t('admin_dashboard.campaigns.table.created')}</th>
              <th>{t('admin_dashboard.campaigns.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Belum ada kampanye</td></tr>
            ) : campaigns.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className={statusBadge(c.status)}>{c.status}</span>
                    {(c.status === 'LAUNCHING' || c.status === 'ACTIVE' || c.status === 'COMPLETED') && (
                      <div style={{ width: '100%', minWidth: '100px' }}>
                        <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--divider)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ 
                            height: '100%', 
                            width: `${(c.processed_count / c.target_count) * 100}%`, 
                            backgroundColor: 'var(--neon-cyan)',
                            transition: 'width 0.3s ease'
                          }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', marginTop: '2px' }}>
                          <span>{c.processed_count}/{c.target_count}</span>
                          {c.error_count > 0 && <span style={{ color: 'var(--danger)' }}>{c.error_count} gagal</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td>{c.difficulty}</td>
                <td>{c.theme || '-'}</td>
                <td>{c.target_count} {t('admin_dashboard.campaigns.table.people', 'orang')}</td>
                <td>{new Date(c.created_at).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'id-ID')}</td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px', opacity: 0.8 }} className="row-actions">
                      {c.status === 'READY' && (
                        <button className="btn btn-ghost" onClick={() => handleLaunch(c.id)} title={t('admin_dashboard.campaigns.actions.launch', 'Luncurkan')}>
                          <HiOutlineRocketLaunch size={18} />
                        </button>
                      )}
                      <Link to={`/dashboard/reports/${c.id}`} className="btn btn-ghost" title={t('admin_dashboard.campaigns.actions.detail', 'Detail')}>
                        <HiOutlineArrowRight size={18} />
                      </Link>
                      {c.status === 'DRAFT' && (
                        <>
                          <button className="btn btn-ghost" onClick={() => handleEdit(c)} title={t('admin_dashboard.campaigns.actions.edit', 'Edit')}>
                            <HiOutlinePencil size={18} />
                          </button>
                          <button className="btn btn-ghost" onClick={() => handleGenerate(c.id)} title={t('admin_dashboard.campaigns.actions.generate', 'Generate Template')}>
                            <HiOutlineSparkles size={18} />
                          </button>
                        </>
                      )}
                      <button className="btn btn-ghost text-danger" onClick={() => handleDelete(c.id, c.name)} title={t('admin_dashboard.campaigns.actions.delete', 'Hapus')}>
                        <HiOutlineTrash size={18} />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
