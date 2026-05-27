import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineEnvelopeOpen, HiOutlineTrash, HiOutlineEye, HiXMark } from 'react-icons/hi2';

export default function TemplateLibrary() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await api.get('/saved-templates');
      setTemplates(res.data);
    } catch (err) {
      toast.error('Gagal memuat galeri template');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus template "${name}" secara permanen?`)) return;
    try {
      await api.delete(`/saved-templates/${id}`);
      toast.success('Template berhasil dihapus');
      loadTemplates();
    } catch (err) {
      toast.error('Gagal menghapus template');
    }
  };

  // Preview Modal rendered via Portal
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
          width: '800px', maxWidth: '90vw', maxHeight: '85vh', 
          display: 'flex', flexDirection: 'column', 
          backgroundColor: 'var(--bg-base, #0a0e17)',
          borderRadius: '12px',
          border: '1px solid rgba(0, 240, 255, 0.15)',
          boxShadow: '0 0 40px rgba(0, 240, 255, 0.1), 0 20px 60px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          padding: '16px 24px', 
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-sidebar)',
          flexShrink: 0
        }}>
          <h3 style={{ margin: 0, color: 'var(--neon-cyan)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontFamily: 'var(--font-display)' }}>
            <HiOutlineEye size={20} /> Preview Template
          </h3>
          <button 
            onClick={() => setPreviewTemplate(null)} 
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <HiXMark size={20} />
          </button>
        </div>
        
        {/* Meta Info */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)', display: 'flex', gap: '32px', flexWrap: 'wrap', flexShrink: 0 }}>
          <div style={{ fontSize: '13px' }}>
            <strong style={{ color: 'var(--text-muted)', marginRight: '8px' }}>Subjek:</strong> 
            <span style={{ color: 'var(--text-primary)' }}>{previewTemplate.email_subject}</span>
          </div>
          <div style={{ fontSize: '13px' }}>
            <strong style={{ color: 'var(--text-muted)', marginRight: '8px' }}>Pengirim:</strong> 
            <span style={{ color: 'var(--text-primary)' }}>{previewTemplate.email_sender_name}</span>
          </div>
        </div>
        
        {/* Email Body */}
        <div 
          style={{ 
            flex: 1, 
            overflowY: 'auto', overflowX: 'auto',
            padding: '24px', 
            background: '#ffffff', color: '#000000', 
            minHeight: '300px'
          }} 
          dangerouslySetInnerHTML={{ __html: previewTemplate.email_body_html }} 
        />
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Galeri Template</h1>
          <p>Koleksi template phishing siap pakai. Anda dapat menggunakannya kembali saat membuat kampanye baru.</p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-center"><div className="spinner"></div></div>
        ) : templates.length === 0 ? (
          <div className="empty-state">
            <HiOutlineEnvelopeOpen size={48} style={{ color: 'var(--border)' }} />
            <h3>Belum Ada Template Tersimpan</h3>
            <p>Untuk menyimpan template, buka laporan kampanye yang sudah selesai dan klik "Simpan ke Galeri".</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nama Template</th>
                  <th>Subjek Email</th>
                  <th>Pengirim</th>
                  <th>Tanggal Disimpan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {templates.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500, color: 'var(--neon-cyan)' }}>{t.name}</td>
                    <td>
                      <span className="truncate-mobile" title={t.email_subject}>
                        {t.email_subject}
                      </span>
                    </td>
                    <td>
                      <span className="truncate-mobile" title={t.email_sender_name}>
                        {t.email_sender_name}
                      </span>
                    </td>
                    <td>{new Date(t.created_at).toLocaleDateString('id-ID')}</td>
                    <td>
                      <div className="table-actions" style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn-icon" 
                          onClick={() => setPreviewTemplate(t)} 
                          title="Preview Template"
                          style={{ 
                            background: 'rgba(0, 240, 255, 0.1)', 
                            border: '1px solid rgba(0, 240, 255, 0.2)', 
                            color: 'var(--neon-cyan)',
                            padding: '6px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >
                          <HiOutlineEye size={18} />
                        </button>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleDelete(t.id, t.name)} 
                          title="Hapus Template"
                          style={{ 
                            background: 'transparent', 
                            border: '1px solid transparent', 
                            color: 'var(--text-muted)',
                            padding: '6px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(255, 62, 62, 0.1)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                        >
                          <HiOutlineTrash size={18} />
                        </button>
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
    </div>
  );
}
