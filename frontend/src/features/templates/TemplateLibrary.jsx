import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineEnvelopeOpen, HiOutlineTrash, HiOutlineEye, HiXMark, HiOutlinePlus } from 'react-icons/hi2';

export default function TemplateLibrary() {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', description: '', email_subject: '', email_sender_name: '', email_body_html: '' });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await api.get('/saved-templates');
      setTemplates(res.data);
    } catch (err) {
      toast.error(t('admin_dashboard.templates.load_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(t('admin_dashboard.templates.delete_confirm').replace('{{name}}', name))) return;
    try {
      await api.delete(`/saved-templates/${id}`);
      toast.success(t('admin_dashboard.templates.delete_success'));
      loadTemplates();
    } catch (err) {
      toast.error(t('admin_dashboard.templates.delete_failed'));
    }
  };

  const handleSaveNew = async (e) => {
    e.preventDefault();
    try {
      await api.post('/saved-templates', newTemplate);
      toast.success('Template email berhasil disimpan');
      setShowAddModal(false);
      setNewTemplate({ name: '', description: '', email_subject: '', email_sender_name: '', email_body_html: '' });
      loadTemplates();
    } catch (err) {
      toast.error('Gagal menyimpan template email');
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
            <HiOutlineEye size={20} /> {t('admin_dashboard.templates.modal_preview')}
          </h3>
          <button 
            onClick={() => setPreviewTemplate(null)} 
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '50%', color: 'var(--text-secondary)' }}
            onMouseOver={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-soft)'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
            title="Tutup Preview"
          >
            <HiXMark size={24} />
          </button>
        </div>
        
        {/* Meta Info */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)', display: 'flex', gap: '32px', flexWrap: 'wrap', flexShrink: 0 }}>
          <div style={{ fontSize: '13px' }}>
            <strong style={{ color: 'var(--text-muted)', marginRight: '8px' }}>{t('admin_dashboard.templates.modal_subject')}</strong> 
            <span style={{ color: 'var(--text-primary)' }}>{previewTemplate.email_subject}</span>
          </div>
          <div style={{ fontSize: '13px' }}>
            <strong style={{ color: 'var(--text-muted)', marginRight: '8px' }}>{t('admin_dashboard.templates.modal_sender')}</strong> 
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
          <h3 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HiOutlinePlus size={20} style={{ color: 'var(--neon-cyan)' }} /> Tambah Email Template
          </h3>
          <button 
            type="button"
            onClick={() => setShowAddModal(false)} 
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: '50%', color: 'var(--text-secondary)' }}
            onMouseOver={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-soft)'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
            title="Tutup"
          >
            <HiXMark size={24} />
          </button>
        </div>
        <form onSubmit={handleSaveNew} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group">
            <label>Nama Template</label>
            <input required className="input" value={newTemplate.name} onChange={e => setNewTemplate({...newTemplate, name: e.target.value})} placeholder="Contoh: IT Support Notif" />
          </div>
          <div className="input-group">
            <label>Subjek Email</label>
            <input required className="input" value={newTemplate.email_subject} onChange={e => setNewTemplate({...newTemplate, email_subject: e.target.value})} placeholder="Action Required: ..." />
          </div>
          <div className="input-group">
            <label>Nama Pengirim</label>
            <input required className="input" value={newTemplate.email_sender_name} onChange={e => setNewTemplate({...newTemplate, email_sender_name: e.target.value})} placeholder="IT Department" />
          </div>
          <div className="input-group">
            <label>HTML Body</label>
            <textarea required className="input" rows="6" value={newTemplate.email_body_html} onChange={e => setNewTemplate({...newTemplate, email_body_html: e.target.value})} style={{ fontFamily: 'monospace' }} placeholder="<p>Dear Employee...</p>" />
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
          <h1>Galeri Email</h1>
          <p>{t('admin_dashboard.templates.desc')}</p>
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
            <HiOutlineEnvelopeOpen size={48} style={{ color: 'var(--border)' }} />
            <h3>{t('admin_dashboard.templates.empty_title')}</h3>
            <p>{t('admin_dashboard.templates.empty_desc')}</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('admin_dashboard.templates.table_name')}</th>
                  <th>{t('admin_dashboard.templates.table_subject')}</th>
                  <th>{t('admin_dashboard.templates.table_sender')}</th>
                  <th>{t('admin_dashboard.templates.table_date')}</th>
                  <th>{t('admin_dashboard.templates.table_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {templates.map(tmpl => (
                  <tr key={tmpl.id}>
                    <td style={{ fontWeight: 500, color: 'var(--neon-cyan)' }}>{tmpl.name}</td>
                    <td>
                      <span className="truncate-mobile" title={tmpl.email_subject}>
                        {tmpl.email_subject}
                      </span>
                    </td>
                    <td>
                      <span className="truncate-mobile" title={tmpl.email_sender_name}>
                        {tmpl.email_sender_name}
                      </span>
                    </td>
                    <td>{new Date(tmpl.created_at).toLocaleDateString(t('admin_dashboard.templates.table_date') === 'Date Saved' ? 'en-US' : 'id-ID')}</td>
                    <td>
                      <div className="table-actions" style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn-icon" 
                          onClick={() => setPreviewTemplate(tmpl)} 
                          title={t('admin_dashboard.templates.action_preview')}
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
                          onClick={() => handleDelete(tmpl.id, tmpl.name)} 
                          title={t('admin_dashboard.templates.action_delete')}
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
      {addModal}
    </div>
  );
}
