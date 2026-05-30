import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  HiOutlineShieldCheck, 
  HiOutlineKey, 
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineDocumentDuplicate,
  HiOutlineArrowPath,
  HiOutlineShieldExclamation
} from 'react-icons/hi2';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './PasswordIntel.css';

export default function PasswordIntel() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'generate'
  
  // Audit State
  const [auditPassword, setAuditPassword] = useState('');
  const [auditResult, setAuditResult] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Generate State
  const [genOptions, setGenOptions] = useState({
    length: 16,
    use_uppercase: true,
    use_numbers: true,
    use_symbols: true
  });
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAudit = async (e) => {
    e.preventDefault();
    if (!auditPassword) return;
    
    setIsAuditing(true);
    try {
      const res = await api.post('/intel/password/check', { password: auditPassword });
      setAuditResult(res.data);
      if (res.data.risk_level === 'CRITICAL') {
        toast.error(t('admin_dashboard.intel.messages.audit_critical'));
      } else if (res.data.risk_level === 'LOW') {
        toast.success(t('admin_dashboard.intel.messages.audit_low'));
      }
    } catch (err) {
      toast.error(t('admin_dashboard.intel.messages.audit_failed'));
    } finally {
      setIsAuditing(false);
    }
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    setIsGenerating(true);
    try {
      const res = await api.post('/intel/password/generate', genOptions);
      setGeneratedPassword(res.data.password);
      toast.success(t('admin_dashboard.intel.messages.gen_success'));
    } catch (err) {
      toast.error(t('admin_dashboard.intel.messages.gen_failed'));
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    toast.success(t('admin_dashboard.intel.messages.copied'));
  };

  const renderAuditResult = () => {
    if (!auditResult) return null;

    const { score, entropy, risk_level, feedback, is_in_rockyou, pwned_count } = auditResult;
    
    let riskColor = 'var(--neon-cyan)';
    if (risk_level === 'CRITICAL') riskColor = 'var(--danger)';
    else if (risk_level === 'HIGH') riskColor = 'var(--warning)';
    else if (risk_level === 'MEDIUM') riskColor = 'var(--neon-purple)';
    else if (risk_level === 'LOW') riskColor = 'var(--success)';

    return (
      <div className="audit-result slide-up">
        <div className="risk-banner" style={{ borderColor: riskColor, boxShadow: `0 0 20px ${riskColor}33` }}>
          <h2 style={{ color: riskColor }}>
            {t('admin_dashboard.intel.risk_level')} {risk_level}
          </h2>
          <div className="score-meter">
            <div 
              className="score-fill" 
              style={{ 
                width: `${(score / 6) * 100}%`, 
                backgroundColor: riskColor,
                boxShadow: `0 0 10px ${riskColor}`
              }}
            ></div>
          </div>
          <p className="entropy-text">{t('admin_dashboard.intel.entropy_score')} {entropy} bits</p>
        </div>

        <div className="grid-2" style={{ marginTop: 'var(--space-lg)' }}>
          <div className={`intel-card ${is_in_rockyou ? 'danger-glow' : 'success-glow'}`}>
            <div className="intel-icon">
              {is_in_rockyou ? <HiOutlineXCircle color="var(--danger)" /> : <HiOutlineCheckCircle color="var(--success)" />}
            </div>
            <div className="intel-info">
              <h3>Local Dictionary (RockYou)</h3>
              <p>{is_in_rockyou ? t('admin_dashboard.intel.rockyou_found') : t('admin_dashboard.intel.rockyou_clean')}</p>
            </div>
          </div>

          <div className={`intel-card ${pwned_count > 0 ? 'danger-glow' : 'success-glow'}`}>
            <div className="intel-icon">
              {pwned_count > 0 ? <HiOutlineExclamationTriangle color="var(--danger)" /> : <HiOutlineShieldCheck color="var(--success)" />}
            </div>
            <div className="intel-info">
              <h3>Global Breach (HaveIBeenPwned)</h3>
              <p>{pwned_count > 0 ? t('admin_dashboard.intel.pwned_found').replace('{{count}}', pwned_count.toLocaleString()) : t('admin_dashboard.intel.pwned_clean')}</p>
            </div>
          </div>
        </div>

        {feedback.length > 0 && (
          <div className="feedback-box">
            <h4>{t('admin_dashboard.intel.feedback_title')}</h4>
            <ul>
              {feedback.map((msg, i) => <li key={i}>{msg}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <HiOutlineShieldExclamation /> {t('admin_dashboard.intel.title')}
          </h1>
          <p>{t('admin_dashboard.intel.desc')}</p>
        </div>
      </div>

      <div className="card card-glow" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="intel-tabs">
          <button 
            className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <HiOutlineShieldCheck size={20} />
            {t('admin_dashboard.intel.tab_audit')}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'generate' ? 'active' : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            <HiOutlineKey size={20} />
            {t('admin_dashboard.intel.tab_gen')}
          </button>
        </div>

        <div className="tab-content" style={{ padding: 'var(--space-xl)' }}>
          {activeTab === 'audit' && (
            <div className="audit-panel">
              <p style={{ marginBottom: 'var(--space-lg)', color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: t('admin_dashboard.intel.audit_desc') }} />
              
              <form onSubmit={handleAudit} className="audit-form">
                <div className="input-group">
                  <input
                    type="text"
                    className="input"
                    placeholder={t('admin_dashboard.intel.audit_placeholder')}
                    value={auditPassword}
                    onChange={(e) => setAuditPassword(e.target.value)}
                    style={{ fontSize: '1.2rem', padding: '15px' }}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={!auditPassword || isAuditing}
                  style={{ width: '100%', marginTop: 'var(--space-md)' }}
                >
                  {isAuditing ? <span className="spinner"></span> : t('admin_dashboard.intel.btn_run_audit')}
                </button>
              </form>

              {renderAuditResult()}
            </div>
          )}

          {activeTab === 'generate' && (
            <div className="generate-panel slide-up">
              <div className="generated-display">
                <input 
                  type="text" 
                  className="input generated-input" 
                  value={generatedPassword} 
                  readOnly 
                  placeholder={t('admin_dashboard.intel.gen_placeholder')}
                />
                <button className="btn btn-secondary icon-btn" onClick={copyToClipboard} title="Copy">
                  <HiOutlineDocumentDuplicate size={24} />
                </button>
              </div>

              <div className="gen-options grid-2">
                <div className="input-group">
                  <label>{t('admin_dashboard.intel.len_label')} ({genOptions.length})</label>
                  <input 
                    type="range" 
                    min="8" 
                    max="64" 
                    value={genOptions.length}
                    onChange={(e) => setGenOptions({...genOptions, length: parseInt(e.target.value)})}
                    className="range-slider"
                  />
                </div>
                <div className="checkbox-group-container">
                  <label className="cyber-checkbox">
                    <input 
                      type="checkbox" 
                      checked={genOptions.use_uppercase}
                      onChange={(e) => setGenOptions({...genOptions, use_uppercase: e.target.checked})}
                    />
                    <span className="checkmark"></span>
                    {t('admin_dashboard.intel.opt_upper')}
                  </label>
                  <label className="cyber-checkbox">
                    <input 
                      type="checkbox" 
                      checked={genOptions.use_numbers}
                      onChange={(e) => setGenOptions({...genOptions, use_numbers: e.target.checked})}
                    />
                    <span className="checkmark"></span>
                    {t('admin_dashboard.intel.opt_numbers')}
                  </label>
                  <label className="cyber-checkbox">
                    <input 
                      type="checkbox" 
                      checked={genOptions.use_symbols}
                      onChange={(e) => setGenOptions({...genOptions, use_symbols: e.target.checked})}
                    />
                    <span className="checkmark"></span>
                    {t('admin_dashboard.intel.opt_symbols')}
                  </label>
                </div>
              </div>

              <button 
                className="btn btn-primary btn-lg" 
                onClick={handleGenerate} 
                disabled={isGenerating}
                style={{ width: '100%', marginTop: 'var(--space-xl)' }}
              >
                {isGenerating ? <span className="spinner"></span> : <><HiOutlineArrowPath size={20} /> {t('admin_dashboard.intel.btn_generate')}</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
