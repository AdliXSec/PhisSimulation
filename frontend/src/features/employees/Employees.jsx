import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import toast from 'react-hot-toast';
import usePolling from '../../hooks/usePolling';
import StepWizard from '../../components/wizard/StepWizard';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineArrowRight, HiOutlineArrowLeft } from 'react-icons/hi2';

const INITIAL_FORM = { name: '', email: '', department_id: '', position: '', is_active: true };

export default function Employees() {
  const { t } = useTranslation();

  const WIZARD_STEPS = [
    { label: t('admin_dashboard.employees.step1_title') },
    { label: t('admin_dashboard.employees.step2_title') },
  ];
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [step, setStep] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get('/employees', { params: { limit: 100 } }),
        api.get('/departments'),
      ]);
      setEmployees(empRes.data.data || []);
      setDepartments(deptRes.data);
    } catch (err) {
      if (loading) toast.error(t('admin_dashboard.employees.messages.load_failed'));
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => { loadData(); }, []);

  usePolling(loadData, 5000);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, department_id: form.department_id ? parseInt(form.department_id) : null };
      if (editId) {
        await api.put(`/employees/${editId}`, payload);
        toast.success(t('admin_dashboard.employees.messages.update_success'));
      } else {
        await api.post('/employees', payload);
        toast.success(t('admin_dashboard.employees.messages.add_success'));
      }
      setShowForm(false);
      setEditId(null);
      setForm({ ...INITIAL_FORM });
      setStep(0);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || t('admin_dashboard.employees.messages.save_failed'));
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
    setStep(0);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(t('admin_dashboard.employees.messages.delete_confirm').replace('{{name}}', name))) return;
    try {
      await api.delete(`/employees/${id}`);
      toast.success(t('admin_dashboard.employees.messages.delete_success'));
      loadData();
    } catch (err) {
      toast.error(t('admin_dashboard.employees.messages.delete_failed'));
    }
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  const openNewForm = () => {
    setEditId(null);
    setForm({ ...INITIAL_FORM });
    setStep(0);
    setShowForm(!showForm);
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>{t('admin_dashboard.employees.title')}</h1>
          <p>{t('admin_dashboard.employees.desc')}</p>
        </div>
        <button className="btn btn-primary" onClick={openNewForm}>
          <HiOutlinePlus size={18} /> {t('admin_dashboard.employees.btn_add')}
        </button>
      </div>

      {showForm && (
        <div className="card-glow" style={{ marginBottom: 'var(--space-2xl)' }}>
          <h3 style={{ marginBottom: 'var(--space-lg)', borderBottom: '1px solid var(--divider)', paddingBottom: 'var(--space-sm)' }}>
            {editId ? t('admin_dashboard.employees.form_edit') : t('admin_dashboard.employees.form_new')}
          </h3>

          <StepWizard steps={WIZARD_STEPS} currentStep={step} onStepClick={(i) => { if (i <= step) setStep(i); }} />

          <form onSubmit={handleSubmit}>
            {/* ===== STEP 1: Data Pribadi ===== */}
            {step === 0 && (
              <div className="wizard-content" key="step-0">
                <div className="wizard-step-header">
                  <h3>{t('admin_dashboard.employees.step1_header')}</h3>
                  <p>{t('admin_dashboard.employees.step1_desc')}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                  <div className="input-group">
                    <label>{t('admin_dashboard.employees.full_name')}</label>
                    <input className="input" placeholder={t('admin_dashboard.employees.name_placeholder')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="input-group">
                    <label>{t('admin_dashboard.employees.email_addr')}</label>
                    <input className="input" type="email" placeholder="email@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                  </div>
                </div>

                <div className="wizard-nav">
                  <div className="wizard-nav-left">
                    <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditId(null); }}>{t('admin_dashboard.campaigns.form.btn_cancel')}</button>
                  </div>
                  <div className="wizard-nav-right">
                    <button type="button" className="btn btn-primary" disabled={!form.name.trim() || !form.email.trim()} onClick={() => setStep(1)}>
                      {t('admin_dashboard.campaigns.form.btn_next')} <HiOutlineArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== STEP 2: Data Organisasi ===== */}
            {step === 1 && (
              <div className="wizard-content" key="step-1">
                <div className="wizard-step-header">
                  <h3>{t('admin_dashboard.employees.step2_header')}</h3>
                  <p>{t('admin_dashboard.employees.step2_desc')}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                  <div className="input-group">
                    <label>{t('admin_dashboard.employees.department')}</label>
                    <select className="input" value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })}>
                      <option value="">{t('admin_dashboard.employees.select_dept')}</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>{t('admin_dashboard.employees.position')}</label>
                    <input className="input" placeholder={t('admin_dashboard.employees.pos_placeholder')} value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} />
                  </div>
                  {editId && (
                    <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" id="isActive" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                      <label htmlFor="isActive" style={{ margin: 0 }}>{t('admin_dashboard.employees.is_active')}</label>
                    </div>
                  )}
                </div>

                <div className="wizard-nav">
                  <div className="wizard-nav-left">
                    <button type="button" className="btn btn-secondary" onClick={() => setStep(0)}>
                      <HiOutlineArrowLeft size={16} /> {t('admin_dashboard.campaigns.form.btn_back')}
                    </button>
                  </div>
                  <div className="wizard-nav-right">
                    <button type="submit" className="btn btn-primary">{editId ? t('admin_dashboard.employees.btn_save') : t('admin_dashboard.employees.btn_add_submit')}</button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <input className="input" style={{ maxWidth: 360 }} placeholder={t('admin_dashboard.employees.search_placeholder')} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>{t('admin_dashboard.employees.col_name')}</th>
              <th>{t('admin_dashboard.employees.col_email')}</th>
              <th>{t('admin_dashboard.employees.col_status')}</th>
              <th>{t('admin_dashboard.employees.department')}</th>
              <th>{t('admin_dashboard.employees.position')}</th>
              <th>{t('admin_dashboard.employees.col_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>{t('admin_dashboard.employees.empty_table')}</td></tr>
            ) : filtered.map(e => (
              <tr key={e.id}>
                <td><strong>{e.name}</strong></td>
                <td style={{ color: 'var(--text-secondary)' }}>{e.email}</td>
                <td><span className={`badge ${e.is_active ? 'badge-success' : 'badge-danger'}`}>{e.is_active ? t('admin_dashboard.employees.status_active') : t('admin_dashboard.employees.status_inactive')}</span></td>
                <td>{e.department_name || '-'}</td>
                <td>{e.position || '-'}</td>
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
