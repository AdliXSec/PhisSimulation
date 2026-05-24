import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineRocketLaunch, HiOutlineSparkles, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import LandingPageBuilder from './LandingPageBuilder';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({ 
    name: '', 
    theme: '', 
    difficulty: 'MEDIUM', 
    target_departments: [],
    email_mode: 'ai',
    email_subject: '',
    email_sender: '',
    email_body: '',
    link_mode: 'internal',
    external_url: '',
    landing_page_mode: 'ai',
    landing_page_config: { theme_style: 'ai' },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [campRes, deptRes, tmplRes] = await Promise.all([
        api.get('/campaigns'),
        api.get('/departments'),
        api.get('/landing-pages').catch(() => ({ data: [] }))
      ]);
      setCampaigns(campRes.data);
      setDepartments(deptRes.data);
      setTemplates(tmplRes.data);
    } catch (err) {
      toast.error('Gagal memuat data');
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
          external_url: form.external_url || undefined,
        });
        toast.success('Kampanye berhasil diperbarui!');
      } else {
        // If link_mode is external, override landing page settings
        const payload = { ...form };
        if (payload.link_mode === 'external') {
          payload.landing_page_mode = 'external';
          payload.landing_page_config = { url: payload.external_url };
        }

        await api.post('/campaigns', payload);
        toast.success('Kampanye berhasil dibuat!');
      }
      setShowForm(false);
      setEditId(null);
      setForm({ 
        name: '', 
        theme: '', 
        difficulty: 'MEDIUM', 
        target_departments: [], 
        email_mode: 'ai',
        email_subject: '',
        email_sender: '',
        email_body: '',
        link_mode: 'internal',
        external_url: '',
        landing_page_mode: 'ai', 
        landing_page_config: { theme_style: 'ai' } 
      });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Gagal menyimpan kampanye');
    }
  };

  const handleEdit = async (c) => {
    try {
      toast.loading('Memuat data...', { id: 'edit-load' });
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
        ...form,
        name: detail.name,
        theme: detail.theme || '',
        difficulty: detail.difficulty || 'MEDIUM',
        link_mode: linkMode,
        external_url: extUrl,
      });
      setEditId(c.id);
      setShowForm(true);
      toast.dismiss('edit-load');
    } catch (err) {
      toast.error('Gagal memuat detail kampanye', { id: 'edit-load' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus kampanye "${name}"? Semua data terkait (target, template, log) akan dihapus secara permanen.`)) return;
    try {
      await api.delete(`/campaigns/${id}`);
      toast.success('Kampanye berhasil dihapus');
      loadData();
    } catch (err) {
      toast.error('Gagal menghapus kampanye');
    }
  };

  const handleGenerate = async (id) => {
    try {
      toast.loading('AI sedang membuat template...', { id: 'gen' });
      await api.post(`/campaigns/${id}/generate`);
      toast.success('Template berhasil di-generate!', { id: 'gen' });
      loadData();
    } catch (err) {
      toast.error('Gagal generate template', { id: 'gen' });
    }
  };

  const handleLaunch = async (id) => {
    if (!confirm('Yakin ingin meluncurkan kampanye ini?')) return;
    try {
      await api.post(`/campaigns/${id}/launch`);
      toast.success('Kampanye berhasil diluncurkan!');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Gagal meluncurkan');
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

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Kampanye Phishing</h1>
          <p>Kelola simulasi phishing dan pantau hasilnya</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setEditId(null);
          setForm({ 
            name: '', theme: '', difficulty: 'MEDIUM', target_departments: [], 
            email_mode: 'ai', email_subject: '', email_sender: '', email_body: '',
            link_mode: 'internal', external_url: '',
            landing_page_mode: 'ai', landing_page_config: { theme_style: 'ai' } 
          });
          setShowForm(!showForm);
        }}>
          <HiOutlinePlus size={18} /> Buat Kampanye
        </button>
      </div>

      {showForm && (
        <div className="card-glow" style={{ marginBottom: 'var(--space-2xl)' }}>
          <h3 style={{ marginBottom: 'var(--space-lg)', borderBottom: '1px solid var(--divider)', paddingBottom: 'var(--space-sm)' }}>
            {editId ? 'Edit Kampanye' : 'Kampanye Baru'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>

            {/* Section 1: Basic Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              <h4 style={{ color: 'var(--accent-primary)', fontSize: 'var(--font-size-md)' }}>01 // Informasi Dasar</h4>
              <div className="input-group">
                <label>Nama Kampanye</label>
                <input className="input" placeholder="Misal: Simulasi Q4 2026" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label>Tema</label>
                  <input className="input" placeholder="Misal: Peringatan Keamanan" value={form.theme} onChange={e => setForm({ ...form, theme: e.target.value })} />
                </div>
                <div className="input-group">
                  <label>Tingkat Kesulitan</label>
                  <select className="input" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                    <option value="LOW">Rendah</option>
                    <option value="MEDIUM">Menengah</option>
                    <option value="HIGH">Tinggi</option>
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label>Target Departemen</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {departments.map(d => (
                    <button type="button" key={d.id} className={`btn btn-sm ${form.target_departments.includes(d.id) ? 'btn-primary' : 'btn-secondary'}`} onClick={() => toggleDept(d.id)} disabled={!!editId}>
                      {d.name} ({d.employee_count})
                    </button>
                  ))}
                </div>
                {editId && <small style={{ color: 'var(--text-muted)' }}>Target departemen tidak dapat diubah setelah kampanye dibuat.</small>}
              </div>

              {/* Link Mode Selection */}
              <div className="input-group" style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--divider)' }}>
                <label>Tujuan Tautan Phishing</label>
                <div className="lpb-tabs" style={{ marginBottom: '8px' }}>
                  <button type="button" className={`lpb-tab ${form.link_mode === 'internal' ? 'active' : ''}`} onClick={() => setForm({...form, link_mode: 'internal'})}>
                    Internal Landing Page
                  </button>
                  <button type="button" className={`lpb-tab ${form.link_mode === 'external' ? 'active' : ''}`} onClick={() => setForm({...form, link_mode: 'external'})}>
                    Link Eksternal
                  </button>
                </div>
              </div>

              {form.link_mode === 'external' && (
                <div className="input-group">
                  <label>URL Eksternal</label>
                  <input className="input" type="url" placeholder="https://example.com" value={form.external_url} onChange={e => setForm({...form, external_url: e.target.value})} />
                  <small style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                    {editId ? 'Ubah URL ini untuk memperbarui tujuan target. (Boleh dikosongkan jika belum ada)' : 'Target akan diarahkan ke URL ini setelah klik dilacak. (Boleh dikosongkan sementara jika Anda ingin membuat API Key terlebih dahulu)'}
                  </small>
                </div>
              )}
            </div>

            {!editId && (
              <>
                {/* Section 2: Email Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--divider)' }}>
                  <h4 style={{ color: 'var(--accent-primary)', fontSize: 'var(--font-size-md)' }}>02 // Pengaturan Email</h4>
                  <div className="input-group">
                    <label>Metode Pembuatan Email</label>
                    <div className="lpb-tabs" style={{ marginBottom: '8px' }}>
                      <button type="button" className={`lpb-tab ${form.email_mode === 'ai' ? 'active' : ''}`} onClick={() => setForm({...form, email_mode: 'ai'})}>
                        <HiOutlineSparkles /> AI Generated
                      </button>
                      <button type="button" className={`lpb-tab ${form.email_mode === 'custom' ? 'active' : ''}`} onClick={() => setForm({...form, email_mode: 'custom'})}>
                        ✏️ Custom Email
                      </button>
                    </div>
                  </div>

                  {form.email_mode === 'custom' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                      <div className="input-group">
                        <label>Sender Name</label>
                        <input className="input" placeholder="e.g. IT Support" value={form.email_sender} onChange={e => setForm({...form, email_sender: e.target.value})} required={form.email_mode === 'custom'} />
                      </div>
                      <div className="input-group">
                        <label>Email Subject</label>
                        <input className="input" placeholder="Subject email phishing" value={form.email_subject} onChange={e => setForm({...form, email_subject: e.target.value})} required={form.email_mode === 'custom'} />
                      </div>
                      <div className="input-group">
                        <label>Email Body (HTML)</label>
                        <textarea
                          className="input"
                          rows="6"
                          value={form.email_body}
                          onChange={e => setForm({...form, email_body: e.target.value})}
                          required={form.email_mode === 'custom'}
                          placeholder={'<p>Dear Employee, please login at <a href="{{tracking_link}}">this portal</a>.</p>'}
                        />
                        <div style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: 'rgba(0, 240, 255, 0.06)', borderRadius: '4px', borderLeft: '3px solid var(--neon-cyan)', fontSize: '0.8rem' }}>
                          <strong>Penting:</strong> Masukkan tag <code style={{ userSelect: 'all', background: 'rgba(0,240,255,0.1)', padding: '2px 4px', borderRadius: '4px', color: 'var(--neon-cyan)', fontWeight: 'bold' }}>{`{{tracking_link}}`}</code> di dalam HTML agar sistem dapat melacak klik target.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Landing Page */}
                {form.link_mode === 'internal' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--divider)' }}>
                    <h4 style={{ color: 'var(--accent-primary)', fontSize: 'var(--font-size-md)' }}>03 // Desain Landing Page</h4>
                    <div className="input-group">
                      <label>Tampilan Halaman Phishing</label>
                      <LandingPageBuilder
                        value={form.landing_page_config}
                        onChange={cfg => setForm(f => ({ ...f, landing_page_config: cfg, landing_page_mode: cfg.theme_style === 'raw_html' ? 'raw' : 'custom' }))}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div style={{ display: 'flex', gap: '8px', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--divider)' }}>
              <button type="submit" className="btn btn-primary">{editId ? 'Simpan Perubahan' : '>> Buat Kampanye'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}>Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Status</th>
              <th>Kesulitan</th>
              <th>Tema</th>
              <th>Target</th>
              <th>Dibuat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Belum ada kampanye</td></tr>
            ) : campaigns.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td><span className={statusBadge(c.status)}>{c.status}</span></td>
                <td>{c.difficulty}</td>
                <td>{c.theme || '-'}</td>
                <td>{c.target_count} orang</td>
                <td>{new Date(c.created_at).toLocaleDateString('id-ID')}</td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {(c.status === 'DRAFT' || c.status === 'READY') && (
                      <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(c)} title="Edit">
                        <HiOutlinePencil size={14} />
                      </button>
                    )}
                    {c.status === 'DRAFT' && (
                      <button className="btn btn-sm btn-secondary" onClick={() => handleGenerate(c.id)} title="Generate AI Template">
                        <HiOutlineSparkles size={14} /> Generate
                      </button>
                    )}
                    {c.status === 'READY' && (
                      <button className="btn btn-sm btn-primary" onClick={() => handleLaunch(c.id)} title="Luncurkan">
                        <HiOutlineRocketLaunch size={14} /> Launch
                      </button>
                    )}
                    <Link to={`/dashboard/reports/${c.id}`} className="btn btn-sm btn-ghost">Detail</Link>
                    {(c.status === 'DRAFT' || c.status === 'READY' || c.status === 'STOPPED' || c.status === 'COMPLETED') && (
                      <button className="btn btn-sm btn-ghost" onClick={() => handleDelete(c.id, c.name)} title="Hapus" style={{ color: 'var(--danger)' }}>
                        <HiOutlineTrash size={14} />
                      </button>
                    )}
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
