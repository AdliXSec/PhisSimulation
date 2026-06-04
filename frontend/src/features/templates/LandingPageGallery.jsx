import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineDocumentText, HiOutlineTrash, HiOutlineEye, HiXMark, HiOutlinePlus } from 'react-icons/hi2';

export default function LandingPageGallery() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', description: '', raw_html: '' });

  const loadTemplates = async () => {
    try {
      const res = await api.get('landing-pages');
      setTemplates(res.data);
    } catch (_err) {
      toast.error('Gagal memuat template landing page');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleDelete = async (id, name, is_default) => {
    if (is_default) {
      toast.error('Template default tidak bisa dihapus');
      return;
    }
    if (!confirm(`Hapus template ${name}?`)) return;
    try {
      await api.delete(`landing-pages/${id}`);
      toast.success('Template berhasil dihapus');
      loadTemplates();
    } catch (_err) {
      toast.error('Gagal menghapus template');
    }
  };

  const handleSaveNew = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newTemplate.name,
        description: newTemplate.description,
        config: {
          theme_style: 'raw_html',
          raw_html: newTemplate.raw_html,
          title: newTemplate.name,
        }
      };
      await api.post('landing-pages', payload);
      toast.success('Template berhasil disimpan');
      setShowAddModal(false);
      setNewTemplate({ name: '', description: '', raw_html: '' });
      loadTemplates();
    } catch (_err) {
      toast.error('Gagal menyimpan template');
    }
  };

  const handlePreview = async (tmpl) => {
    console.log("handlePreview called with:", tmpl);
    if (tmpl.config?.theme_style === 'raw_html' && !tmpl.config.raw_html) {
      setLoading(true);
      try {
        console.log("Fetching full template for id:", tmpl.id);
        const res = await api.get(`landing-pages/${tmpl.id}`);
        console.log("Fetch success, res.data:", res.data);
        setPreviewTemplate(res.data);
      } catch (_err) {
        console.error("Fetch error:", _err);
        toast.error('Gagal memuat detail template');
      } finally {
        setLoading(false);
      }
    } else {
      console.log("No fetch needed, setting preview directly");
      setPreviewTemplate(tmpl);
    }
  };

  // Preview Modal
  const previewModal = previewTemplate ? createPortal(
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        zIndex: 99999,
        padding: '24px'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) setPreviewTemplate(null); }}
    >
      <div 
        className="fade-in" 
        style={{ 
          width: '800px', maxWidth: '90vw', maxHeight: '85vh', height: '800px',
          display: 'flex', flexDirection: 'column', 
          backgroundColor: '#fff',
          borderRadius: '12px',
          border: '1px solid rgba(0, 240, 255, 0.15)',
          boxShadow: '0 0 40px rgba(0, 240, 255, 0.1), 0 20px 60px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}
      >
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          padding: '16px 24px', 
          borderBottom: '1px solid #ccc',
          background: '#f5f5f5',
          flexShrink: 0
        }}>
          <h3 style={{ margin: 0, color: '#333', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
            <HiOutlineEye size={20} /> Preview: {previewTemplate.name}
          </h3>
          <button 
            onClick={() => setPreviewTemplate(null)} 
            style={{ background: '#fff', border: '1px solid #ccc', borderRadius: '6px', color: '#666', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <HiXMark size={20} />
          </button>
        </div>
        
        <div style={{ flex: 1, overflow: 'hidden', padding: 0 }}>
          {previewTemplate.config?.raw_html ? (
            <iframe 
              srcDoc={previewTemplate.config.raw_html}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Preview"
            />
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
              Preview tidak tersedia untuk builder custom.
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  // Add Modal
  const addModal = showAddModal ? createPortal(
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        zIndex: 99999,
        padding: '24px'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
    >
      <div 
        className="fade-in" 
        style={{ 
          width: '600px', maxWidth: '90vw',
          display: 'flex', flexDirection: 'column', 
          backgroundColor: 'var(--bg-base)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          boxShadow: '0 0 40px rgba(0, 240, 255, 0.1)',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-sidebar)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Tambah Landing Page Template</h3>
          <button onClick={() => setShowAddModal(false)} className="btn-icon"><HiXMark size={20} /></button>
        </div>
        <form onSubmit={handleSaveNew} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group">
            <label>Nama Template</label>
            <input required className="input" value={newTemplate.name} onChange={e => setNewTemplate({...newTemplate, name: e.target.value})} placeholder="Contoh: Login Portal 2" />
          </div>
          <div className="input-group">
            <label>Deskripsi</label>
            <input className="input" value={newTemplate.description} onChange={e => setNewTemplate({...newTemplate, description: e.target.value})} placeholder="Deskripsi singkat" />
          </div>
          <div className="input-group">
            <label>Raw HTML Code</label>
            <textarea required className="input" rows="8" value={newTemplate.raw_html} onChange={e => setNewTemplate({...newTemplate, raw_html: e.target.value})} style={{ fontFamily: 'monospace' }} placeholder="<html>..." />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary">Simpan Template</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Galeri Landing Page</h1>
          <p>Kelola template landing page phishing (HTML kustom & default).</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <HiOutlinePlus size={18} /> Tambah Template
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-center"><div className="spinner"></div></div>
        ) : templates.length === 0 ? (
          <div className="empty-state">
            <HiOutlineDocumentText size={48} style={{ color: 'var(--border)' }} />
            <h3>Belum Ada Template</h3>
            <p>Klik tombol tambah template untuk membuat landing page baru.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Tipe</th>
                  <th>Deskripsi</th>
                  <th>Tanggal Dibuat</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {templates.map(tmpl => (
                  <tr key={tmpl.id}>
                    <td style={{ fontWeight: 500, color: 'var(--neon-cyan)' }}>
                      {tmpl.name}
                      {tmpl.is_default && <span className="badge badge-info" style={{ marginLeft: '8px', fontSize: '10px' }}>Default</span>}
                    </td>
                    <td>{tmpl.config?.theme_style === 'raw_html' ? 'Raw HTML' : 'Custom Builder'}</td>
                    <td><span className="truncate-mobile" title={tmpl.description}>{tmpl.description || '-'}</span></td>
                    <td>{new Date(tmpl.created_at).toLocaleDateString('id-ID')}</td>
                    <td>
                      <div className="table-actions" style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn-icon" 
                          onClick={() => handlePreview(tmpl)} 
                          title="Preview"
                          style={{ 
                            background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.2)', 
                            color: 'var(--neon-cyan)', padding: '6px', borderRadius: '4px', cursor: 'pointer'
                          }}
                        >
                          <HiOutlineEye size={18} />
                        </button>
                        {!tmpl.is_default && (
                          <button 
                            className="btn-icon text-danger" 
                            onClick={() => handleDelete(tmpl.id, tmpl.name, tmpl.is_default)} 
                            title="Hapus"
                            style={{ 
                              background: 'transparent', border: '1px solid transparent', 
                              color: 'var(--text-muted)', padding: '6px', borderRadius: '4px', cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(255, 62, 62, 0.1)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                          >
                            <HiOutlineTrash size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {previewModal}
      {addModal}
    </div>
  );
}
