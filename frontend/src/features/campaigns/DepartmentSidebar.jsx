import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineXMark, HiOutlineUserGroup, HiOutlineUser } from 'react-icons/hi2';
import api from '../../services/api';
import './CampaignSidebar.css'; // Reusing the same CSS

export default function DepartmentSidebar({ department, departmentId, departmentName, onClose, onEdit, onDelete }) {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!departmentId) return;
    
    setLoading(true);
    setError(null);
    // Fetch employees for this specific department
    api.get('/employees', { params: { department_id: departmentId, limit: 100 } })
      .then(res => {
        setEmployees(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load employees:", err);
        setError(t('admin_dashboard.employees.messages.load_failed', 'Gagal memuat daftar karyawan'));
        setLoading(false);
      });
  }, [departmentId, t]);

  if (!departmentId) return null;

  return (
    <div className={`campaign-sidebar ${departmentId ? 'open' : ''}`}>
      <div className="campaign-sidebar-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
              <HiOutlineUserGroup style={{ color: 'var(--neon-magenta)' }} />
              {departmentName || t('admin_dashboard.departments.details_title', 'Detail Departemen')}
            </h2>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '8px' }} title={t('admin_dashboard.campaigns.btn_cancel', 'Tutup')}>
            <HiOutlineXMark size={24} />
          </button>
        </div>
      </div>

      <div className="sidebar-content" style={{ overflowY: 'auto', padding: '24px' }}>
        {loading ? (
          <div className="loading-center" style={{ minHeight: '200px' }}><div className="spinner"></div></div>
        ) : error ? (
          <div className="empty-state" style={{ minHeight: '200px', color: 'var(--danger)' }}>
            <p>{error}</p>
          </div>
        ) : (
          <div className="fade-in">
            <div style={{ marginBottom: '20px' }}>
              <span className="badge badge-info" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                {t('admin_dashboard.departments.total_target', 'Total Target')}: {employees.length} {t('admin_dashboard.departments.people', 'orang')}
              </span>
            </div>

            {employees.length === 0 ? (
              <div className="empty-state" style={{ background: 'rgba(255,255,255,0.02)', padding: '32px 16px', borderRadius: '8px' }}>
                <HiOutlineUserGroup size={40} style={{ color: 'var(--text-muted)' }} />
                <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
                  {t('admin_dashboard.departments.empty_employees', 'Tidak ada karyawan di departemen ini.')}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {employees.map(emp => (
                  <div key={emp.id} style={{
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0, 240, 255, 0.1)',
                      color: 'var(--neon-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <HiOutlineUser size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {emp.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {emp.email}
                      </div>
                    </div>
                    <div>
                      <span className={`badge ${emp.is_active ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                        {emp.is_active ? t('admin_dashboard.employees.status_active', 'Aktif') : t('admin_dashboard.employees.status_inactive', 'Inaktif')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: '20px 24px', borderTop: '1px solid var(--divider)', background: 'rgba(0,0,0,0.3)', display: 'flex', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
        <button className="btn btn-sm btn-secondary" onClick={() => onEdit(department)} style={{ flex: 1, justifyContent: 'center' }}>
          {t('admin_dashboard.campaigns.btn_edit', 'Edit')}
        </button>
        <button className="btn btn-sm btn-danger" onClick={() => onDelete(departmentId, departmentName)} style={{ flex: 1, justifyContent: 'center' }}>
          {t('admin_dashboard.campaigns.btn_delete', 'Hapus')}
        </button>
      </div>
    </div>
  );
}
