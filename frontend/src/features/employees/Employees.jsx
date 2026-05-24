import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', email: '', department_id: '', position: '', is_active: true });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get('/employees', { params: { limit: 100 } }),
        api.get('/departments'),
      ]);
      setEmployees(empRes.data.data || []);
      setDepartments(deptRes.data);
    } catch (err) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, department_id: form.department_id ? parseInt(form.department_id) : null };
      if (editId) {
        await api.put(`/employees/${editId}`, payload);
        toast.success('Karyawan berhasil diperbarui');
      } else {
        await api.post('/employees', payload);
        toast.success('Karyawan berhasil ditambahkan');
      }
      setShowForm(false);
      setEditId(null);
      setForm({ name: '', email: '', department_id: '', position: '', is_active: true });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Gagal menyimpan karyawan');
    }
  };

  const handleEdit = (emp) => {
    setForm({
      name: emp.name,
      email: emp.email,
      department_id: emp.department_id || '',
      position: emp.position || '',
      is_active: emp.is_active !== undefined ? emp.is_active : true,
    });
    setEditId(emp.id);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus karyawan "${name}"? Data target yang terkait mungkin akan hilang.`)) return;
    try {
      await api.delete(`/employees/${id}`);
      toast.success('Karyawan dihapus');
      loadData();
    } catch (err) {
      toast.error('Gagal menghapus karyawan');
    }
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Karyawan</h1>
          <p>Kelola data karyawan target simulasi</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setEditId(null);
          setForm({ name: '', email: '', department_id: '', position: '', is_active: true });
          setShowForm(!showForm);
        }}>
          <HiOutlinePlus size={18} /> Tambah Karyawan
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>
            {editId ? 'Edit Karyawan' : 'Karyawan Baru'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div className="grid-2">
              <div className="input-group">
                <label>Nama</label>
                <input className="input" placeholder="Nama lengkap" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input className="input" type="email" placeholder="email@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="grid-2">
              <div className="input-group">
                <label>Departemen</label>
                <select className="input" value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })}>
                  <option value="">Pilih departemen</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Jabatan</label>
                <input className="input" placeholder="Misal: Staff IT" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} />
              </div>
            </div>
            {editId && (
              <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="isActive" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                <label htmlFor="isActive" style={{ margin: 0 }}>Akun Aktif</label>
              </div>
            )}
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

      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <input className="input" style={{ maxWidth: 360 }} placeholder="Cari karyawan..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Departemen</th>
              <th>Jabatan</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Tidak ada karyawan</td></tr>
            ) : filtered.map(e => (
              <tr key={e.id}>
                <td><strong>{e.name}</strong></td>
                <td style={{ color: 'var(--text-secondary)' }}>{e.email}</td>
                <td>{e.department_name || '-'}</td>
                <td>{e.position || '-'}</td>
                <td><span className={`badge ${e.is_active ? 'badge-success' : 'badge-danger'}`}>{e.is_active ? 'AKTIF' : 'NONAKTIF'}</span></td>
                <td style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(e)} title="Edit">
                    <HiOutlinePencil size={14} />
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={() => handleDelete(e.id, e.name)} style={{ color: 'var(--danger)' }} title="Hapus">
                    <HiOutlineTrash size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
