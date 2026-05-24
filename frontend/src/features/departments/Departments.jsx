import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi2';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      toast.error('Gagal memuat departemen');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/departments/${editId}`, form);
        toast.success('Departemen berhasil diperbarui');
      } else {
        await api.post('/departments', form);
        toast.success('Departemen berhasil ditambahkan');
      }
      setShowForm(false);
      setEditId(null);
      setForm({ name: '', description: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Gagal menyimpan departemen');
    }
  };

  const handleEdit = (dept) => {
    setForm({ name: dept.name, description: dept.description || '' });
    setEditId(dept.id);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus departemen "${name}"?`)) return;
    try {
      await api.delete(`/departments/${id}`);
      toast.success('Departemen dihapus');
      loadData();
    } catch (err) {
      toast.error('Gagal menghapus');
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Departemen</h1>
          <p>Kelola departemen perusahaan</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setEditId(null);
          setForm({ name: '', description: '' });
          setShowForm(!showForm);
        }}>
          <HiOutlinePlus size={18} /> Tambah Departemen
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>
            {editId ? 'Edit Departemen' : 'Departemen Baru'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div className="grid-2">
              <div className="input-group">
                <label>Nama Departemen</label>
                <input className="input" placeholder="Misal: Marketing" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>Deskripsi</label>
                <input className="input" placeholder="Opsional" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn btn-primary">{editId ? 'Simpan Perubahan' : 'Tambah'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}>Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="stats-grid">
        {departments.map(d => (
          <div className="card-glow" key={d.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '4px' }}>{d.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>{d.description || 'Tidak ada deskripsi'}</p>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(d)} title="Edit">
                  <HiOutlinePencil size={16} />
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(d.id, d.name)} style={{ color: 'var(--danger)' }} title="Hapus">
                  <HiOutlineTrash size={16} />
                </button>
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-lg)', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--accent-primary)' }}>{d.employee_count}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>karyawan</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
