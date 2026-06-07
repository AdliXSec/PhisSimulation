import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineXMark, HiOutlineBuildingOffice2, HiOutlineDocumentText } from 'react-icons/hi2';

import { createPortal } from 'react-dom';

export default function DepartmentModal({ editData, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(editData || { name: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editData) {
        await api.put(`/departments/${editData.id}`, form);
        toast.success('Department updated successfully');
      } else {
        await api.post('/departments', form);
        toast.success(t('admin_dashboard.departments.messages.add_success', 'Department added successfully'));
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || t('admin_dashboard.departments.messages.save_failed', 'Failed to save'));
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content card-glow" style={{ maxWidth: '500px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', borderBottom: '1px solid var(--divider)', paddingBottom: 'var(--space-sm)' }}>
          <h3 style={{ margin: 0 }}>{editData ? 'Edit Department' : t('admin_dashboard.departments.form_new', 'Add Department')}</h3>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '4px' }}>
            <HiOutlineXMark size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HiOutlineBuildingOffice2 size={16} />
                {t('admin_dashboard.departments.dept_name', 'Department Name')}
              </label>
              <input 
                className="input" 
                placeholder={t('admin_dashboard.departments.name_placeholder', 'e.g. IT Security')} 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })} 
                required 
              />
            </div>

            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HiOutlineDocumentText size={16} />
                {t('admin_dashboard.departments.desc_label', 'Description')}
              </label>
              <textarea
                className="input"
                rows="3"
                placeholder={t('admin_dashboard.departments.desc_placeholder', 'Description of the department')}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: 'var(--space-xl)' }}>
            <button type="submit" className="btn btn-primary" disabled={!form.name.trim() || loading}>
              {loading ? 'Menyimpan...' : (editData ? 'Update' : t('admin_dashboard.departments.btn_add_submit', 'Save'))}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
