import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineEnvelopeOpen, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi2';

export default function TemplateLibrary() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

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
          <div className="table-responsive">
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
                    <td>{t.email_subject}</td>
                    <td>{t.email_sender_name}</td>
                    <td>{new Date(t.created_at).toLocaleDateString('id-ID')}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn-icon danger" onClick={() => handleDelete(t.id, t.name)} title="Hapus Template">
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
    </div>
  );
}
