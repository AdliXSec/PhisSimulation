import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineXMark, HiOutlineUser, HiOutlineEnvelope, HiOutlineBuildingOffice2, HiOutlineBriefcase, HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi2';

import { createPortal } from 'react-dom';

export default function EmployeeModal({ departments, editData, onClose, onSuccess }) {
  const { t } = useTranslation();
  const isEdit = !!editData;

  // State for single edit
  const [form, setForm] = useState(editData || { name: '', email: '', department_id: '', position: '', is_active: true });
  
  // State for mass add
  const [massDeptId, setMassDeptId] = useState('');
  const [massEmployees, setMassEmployees] = useState([{ name: '', email: '', position: '', is_active: true }]);

  const [loading, setLoading] = useState(false);

  const handleRowCountChange = (count) => {
    const newCount = Math.max(1, Math.min(100, count));
    const currentCount = massEmployees.length;
    
    if (newCount > currentCount) {
      const toAdd = newCount - currentCount;
      const newRows = Array(toAdd).fill().map(() => ({ name: '', email: '', position: '', is_active: true }));
      setMassEmployees([...massEmployees, ...newRows]);
    } else if (newCount < currentCount) {
      setMassEmployees(massEmployees.slice(0, newCount));
    }
  };

  const updateMassEmployee = (index, field, value) => {
    const updated = [...massEmployees];
    updated[index] = { ...updated[index], [field]: value };
    setMassEmployees(updated);
  };

  const removeMassEmployee = (index) => {
    if (massEmployees.length <= 1) return;
    const updated = massEmployees.filter((_, i) => i !== index);
    setMassEmployees(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        const payload = { ...form, department_id: form.department_id ? parseInt(form.department_id) : null };
        await api.put(`/employees/${editData.id}`, payload);
        toast.success('Employee updated successfully');
      } else {
        if (!massDeptId) {
          toast.error('Silakan pilih departemen terlebih dahulu.');
          setLoading(false);
          return;
        }

        const validEmployees = massEmployees.filter(emp => emp.name.trim() && emp.email.trim());
        if (validEmployees.length === 0) {
          toast.error('Silakan isi minimal satu baris karyawan dengan nama dan email.');
          setLoading(false);
          return;
        }

        // Fire all POST requests concurrently
        const promises = validEmployees.map(emp => {
          const payload = { 
            name: emp.name, 
            email: emp.email, 
            position: emp.position, 
            is_active: emp.is_active,
            department_id: parseInt(massDeptId) 
          };
          return api.post('/employees', payload);
        });

        await Promise.all(promises);
        toast.success(`Berhasil menambahkan ${validEmployees.length} karyawan.`);
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || t('admin_dashboard.employees.messages.save_failed', 'Failed to save'));
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: isEdit ? '500px' : '900px', width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', borderBottom: '1px solid var(--divider)', paddingBottom: 'var(--space-sm)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{isEdit ? 'Edit Employee' : 'Tambah Karyawan Massal'}</h3>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '4px' }}>
            <HiOutlineXMark size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {isEdit ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HiOutlineUser size={16} />
                  {t('admin_dashboard.employees.full_name', 'Full Name')}
                </label>
                <input 
                  className="input" 
                  placeholder={t('admin_dashboard.employees.name_placeholder', 'e.g. John Doe')} 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  required 
                />
              </div>

              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HiOutlineEnvelope size={16} />
                  {t('admin_dashboard.employees.email_addr', 'Email Address')}
                </label>
                <input 
                  className="input" 
                  type="email"
                  placeholder="email@company.com" 
                  value={form.email} 
                  onChange={e => setForm({ ...form, email: e.target.value })} 
                  required 
                />
              </div>

              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HiOutlineBuildingOffice2 size={16} />
                  {t('admin_dashboard.employees.department', 'Department')}
                </label>
                <select 
                  className="input" 
                  value={form.department_id} 
                  onChange={e => setForm({ ...form, department_id: e.target.value })}
                  required
                >
                  <option value="">{t('admin_dashboard.employees.select_dept', 'Select Department')}</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HiOutlineBriefcase size={16} />
                  {t('admin_dashboard.employees.position', 'Position (Optional)')}
                </label>
                <input 
                  className="input" 
                  placeholder={t('admin_dashboard.employees.pos_placeholder', 'e.g. Staff')} 
                  value={form.position} 
                  onChange={e => setForm({ ...form, position: e.target.value })} 
                />
              </div>

              <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <input 
                  type="checkbox" 
                  id="emp-active"
                  checked={form.is_active} 
                  onChange={e => setForm({ ...form, is_active: e.target.checked })} 
                  style={{ width: '16px', height: '16px', accentColor: 'var(--neon-cyan)', cursor: 'pointer' }}
                />
                <label htmlFor="emp-active" style={{ cursor: 'pointer', margin: 0, textTransform: 'none', color: 'var(--text-primary)' }}>
                  {t('admin_dashboard.employees.is_active', 'Active Employee')}
                </label>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--divider)' }}>
                <div className="input-group" style={{ flex: 2, marginBottom: 0 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                    <HiOutlineBuildingOffice2 size={16} />
                    Pilih Departemen Tujuan
                  </label>
                  <select 
                    className="input" 
                    value={massDeptId} 
                    onChange={e => setMassDeptId(e.target.value)}
                    required
                  >
                    <option value="">-- Pilih Departemen --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label style={{ color: 'var(--text-primary)' }}>Jumlah Baris</label>
                  <input 
                    type="number" 
                    className="input" 
                    min="1" max="50" 
                    value={massEmployees.length}
                    onChange={(e) => handleRowCountChange(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                {massEmployees.map((emp, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ flex: 2 }}>
                      <input 
                        className="input" 
                        placeholder="Nama Lengkap" 
                        value={emp.name}
                        onChange={e => updateMassEmployee(idx, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div style={{ flex: 2 }}>
                      <input 
                        className="input" 
                        type="email"
                        placeholder="Email Address" 
                        value={emp.email}
                        onChange={e => updateMassEmployee(idx, 'email', e.target.value)}
                        required
                      />
                    </div>
                    <div style={{ flex: 1.5 }}>
                      <input 
                        className="input" 
                        placeholder="Posisi (Opsional)" 
                        value={emp.position}
                        onChange={e => updateMassEmployee(idx, 'position', e.target.value)}
                      />
                    </div>
                    <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', height: '40px' }}>
                      <button 
                        type="button" 
                        className="btn btn-ghost" 
                        style={{ padding: '8px', color: 'var(--danger)' }}
                        onClick={() => removeMassEmployee(idx)}
                        disabled={massEmployees.length <= 1}
                        title="Hapus baris"
                      >
                        <HiOutlineTrash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => handleRowCountChange(massEmployees.length + 1)} style={{ fontSize: '0.8rem', padding: '6px 16px', gap: '6px', borderRadius: '20px' }}>
                  <HiOutlinePlus size={14} /> Tambah Baris
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: 'var(--space-xl)' }}>
            <button type="submit" className="btn btn-primary" disabled={loading || (!isEdit && !massDeptId)}>
              {loading ? 'Menyimpan...' : (isEdit ? 'Update' : `Simpan ${massEmployees.length} Karyawan`)}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
