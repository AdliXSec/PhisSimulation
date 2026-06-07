import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineXMark, HiOutlineUser, HiOutlineEnvelope, HiOutlineBuildingOffice2, HiOutlineBriefcase } from 'react-icons/hi2';

import { createPortal } from 'react-dom';

export default function EmployeeModal({ departments, editData, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(editData || { name: '', email: '', department_id: '', position: '', is_active: true });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, department_id: form.department_id ? parseInt(form.department_id) : null };
      if (editData) {
        await api.put(`/employees/${editData.id}`, payload);
        toast.success('Employee updated successfully');
      } else {
        await api.post('/employees', payload);
        toast.success(t('admin_dashboard.employees.messages.add_success', 'Employee added successfully'));
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
      <div className="modal-content card-glow" style={{ maxWidth: '500px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', borderBottom: '1px solid var(--divider)', paddingBottom: 'var(--space-sm)' }}>
          <h3 style={{ margin: 0 }}>{editData ? 'Edit Employee' : t('admin_dashboard.employees.form_new', 'Add Employee')}</h3>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '4px' }}>
            <HiOutlineXMark size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: 'var(--space-xl)' }}>
            <button type="submit" className="btn btn-primary" disabled={!form.name.trim() || !form.email.trim() || !form.department_id || loading}>
              {loading ? 'Menyimpan...' : (editData ? 'Update' : t('admin_dashboard.employees.btn_add_submit', 'Save'))}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
