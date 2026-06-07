import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineXMark, HiOutlineUser, HiOutlineEnvelope, HiOutlineBriefcase, HiOutlinePencil, HiOutlineUserGroup, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import api from '../../services/api';

export default function EmployeeSidebar({ departmentId, departmentName, employees, onClose, onEdit, onDelete }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Reset search query when department changes
  useEffect(() => {
    setSearchQuery('');
  }, [departmentId]);

  if (!departmentId) return null;

  const deptEmployees = (employees || []).filter(e => {
    const isMatchDept = e.department_id === parseInt(departmentId) || e.department_id === departmentId;
    if (!isMatchDept) return false;
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (e.name && e.name.toLowerCase().includes(query)) ||
      (e.email && e.email.toLowerCase().includes(query)) ||
      (e.position && e.position.toLowerCase().includes(query))
    );
  });

  return (
    <div className={`campaign-sidebar ${departmentId ? 'open' : ''}`}>
      <div className="campaign-sidebar-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 0 }}>
              {t('admin_dashboard.employees.title', 'Daftar Karyawan')}
            </h2>
            <span className="badge badge-outline" style={{ marginTop: '8px', display: 'inline-block' }}>
              {departmentName}
            </span>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '8px' }} title={t('admin_dashboard.campaigns.btn_cancel', 'Tutup')}>
            <HiOutlineXMark size={24} />
          </button>
        </div>
      </div>

      <div className="sidebar-content" style={{ overflowY: 'auto', padding: '24px' }}>
        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span className="badge badge-info" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              {t('admin_dashboard.departments.total_target', 'Total')}: {deptEmployees.length} {t('admin_dashboard.departments.people', 'orang')}
            </span>
          </div>
          
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <HiOutlineMagnifyingGlass size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input" 
              placeholder="Cari nama, email, atau jabatan..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '38px', width: '100%', background: 'rgba(255,255,255,0.02)' }}
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {deptEmployees.length === 0 ? (
            <div className="empty-state" style={{ background: 'rgba(255,255,255,0.02)', padding: '32px 16px', borderRadius: '8px' }}>
              <HiOutlineUserGroup size={40} style={{ color: 'var(--text-muted)' }} />
              <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
                {searchQuery ? 'Tidak ada karyawan yang cocok dengan pencarian.' : t('admin_dashboard.departments.empty_employees', 'Tidak ada karyawan di departemen ini.')}
              </p>
            </div>
          ) : (
            deptEmployees.map(emp => (
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
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {emp.name}
                    <span className={`badge ${emp.is_active ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                      {emp.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {emp.email}
                  </div>
                  {emp.position && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                      {emp.position}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button className="btn btn-ghost" onClick={() => onEdit(emp)} style={{ padding: '4px', color: 'var(--text-secondary)' }} title="Edit Employee">
                    <HiOutlinePencil size={16} />
                  </button>
                  <button className="btn btn-ghost" onClick={() => onDelete(emp.id, emp.name)} style={{ padding: '4px', color: 'var(--danger)' }} title="Hapus Employee">
                    <HiOutlineXMark size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
