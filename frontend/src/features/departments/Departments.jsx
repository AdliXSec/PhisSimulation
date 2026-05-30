import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import toast from 'react-hot-toast';
import usePolling from '../../hooks/usePolling';
import StepWizard from '../../components/wizard/StepWizard';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlineArrowRight, HiOutlineArrowLeft } from 'react-icons/hi2';

const INITIAL_FORM = { name: '', description: '' };

export default function Departments() {
  const { t } = useTranslation();

  const WIZARD_STEPS = [
    { label: t('admin_dashboard.departments.step1_title') },
    { label: t('admin_dashboard.departments.step2_title') },
  ];
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [step, setStep] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      if (loading) toast.error(t('admin_dashboard.departments.messages.load_failed'));
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => { loadData(); }, []);

  usePolling(loadData, 5000);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/departments/${editId}`, form);
        toast.success(t('admin_dashboard.departments.messages.update_success'));
      } else {
        await api.post('/departments', form);
        toast.success(t('admin_dashboard.departments.messages.add_success'));
      }
      setShowForm(false);
      setEditId(null);
      setForm({ ...INITIAL_FORM });
      setStep(0);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || t('admin_dashboard.departments.messages.save_failed'));
    }
  };

  const handleEdit = (dept) => {
    setForm({ name: dept.name, description: dept.description || '' });
    setEditId(dept.id);
    setStep(0);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(t('admin_dashboard.departments.messages.delete_confirm').replace('{{name}}', name))) return;
    try {
      await api.delete(`/departments/${id}`);
      toast.success(t('admin_dashboard.departments.messages.delete_success'));
      loadData();
    } catch (err) {
      toast.error(t('admin_dashboard.departments.messages.delete_failed'));
    }
  };

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
          <h1>{t('admin_dashboard.departments.title')}</h1>
          <p>{t('admin_dashboard.departments.desc')}</p>
        </div>
        <button className="btn btn-primary" onClick={openNewForm}>
          <HiOutlinePlus size={18} /> {t('admin_dashboard.departments.btn_add')}
        </button>
      </div>

      {showForm && (
        <div className="card-glow" style={{ marginBottom: 'var(--space-2xl)' }}>
          <h3 style={{ marginBottom: 'var(--space-lg)', borderBottom: '1px solid var(--divider)', paddingBottom: 'var(--space-sm)' }}>
            {editId ? t('admin_dashboard.departments.form_edit') : t('admin_dashboard.departments.form_new')}
          </h3>

          <StepWizard steps={WIZARD_STEPS} currentStep={step} onStepClick={(i) => { if (i <= step) setStep(i); }} />

          <form onSubmit={handleSubmit}>
            {/* ===== STEP 1: Nama Departemen ===== */}
            {step === 0 && (
              <div className="wizard-content" key="step-0">
                <div className="wizard-step-header">
                  <h3>{t('admin_dashboard.departments.step1_header')}</h3>
                  <p>{t('admin_dashboard.departments.step1_desc')}</p>
                </div>

                <div className="input-group">
                  <label>{t('admin_dashboard.departments.dept_name')}</label>
                  <input className="input" placeholder={t('admin_dashboard.departments.name_placeholder')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>

                <div className="wizard-nav">
                  <div className="wizard-nav-left">
                    <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditId(null); }}>{t('admin_dashboard.campaigns.form.btn_cancel')}</button>
                  </div>
                  <div className="wizard-nav-right">
                    <button type="button" className="btn btn-primary" disabled={!form.name.trim()} onClick={() => setStep(1)}>
                      {t('admin_dashboard.campaigns.form.btn_next')} <HiOutlineArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== STEP 2: Detail & Deskripsi ===== */}
            {step === 1 && (
              <div className="wizard-content" key="step-1">
                <div className="wizard-step-header">
                  <h3>{t('admin_dashboard.departments.step2_header')}</h3>
                  <p>{t('admin_dashboard.departments.step2_desc')}</p>
                </div>

                <div className="input-group">
                  <label>{t('admin_dashboard.departments.desc_label')}</label>
                  <textarea
                    className="input"
                    rows="3"
                    placeholder={t('admin_dashboard.departments.desc_placeholder')}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="wizard-nav">
                  <div className="wizard-nav-left">
                    <button type="button" className="btn btn-secondary" onClick={() => setStep(0)}>
                      <HiOutlineArrowLeft size={16} /> {t('admin_dashboard.campaigns.form.btn_back')}
                    </button>
                  </div>
                  <div className="wizard-nav-right">
                    <button type="submit" className="btn btn-primary">{editId ? t('admin_dashboard.departments.btn_save') : t('admin_dashboard.departments.btn_add_submit')}</button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      <div className="stats-grid">
        {departments.map(d => (
          <div className="card-glow" key={d.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '4px' }}>{d.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>{d.description || t('admin_dashboard.departments.no_desc')}</p>
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
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{t('admin_dashboard.departments.employee_count')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
