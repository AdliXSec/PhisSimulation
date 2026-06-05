import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { HiOutlineShieldCheck, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import './Login.css'; // Reuse login styles

export default function VerifyEmail() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(t('admin_dashboard.auth.verify_email.missing_token'));
      return;
    }

    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(res.data.message || t('admin_dashboard.auth.verify_email.default_success'));
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.detail || t('admin_dashboard.auth.verify_email.default_error'));
      }
    };

    verify();
  }, [token]);

  return (
    <div className="login-page">
      <div className="login-bg-effects">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>

      <div className="login-card fade-in" style={{ textAlign: 'center', padding: 'var(--space-2xl) var(--space-xl)' }}>
        <div className="login-header" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="login-logo">
            <HiOutlineShieldCheck size={48} />
          </div>
          <h1>{t('admin_dashboard.auth.verify_email.title')}</h1>
        </div>

        {status === 'verifying' && (
          <div style={{ padding: 'var(--space-xl) 0' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto var(--space-md)' }}></div>
            <p style={{ color: 'var(--text-muted)' }}>{t('admin_dashboard.auth.verify_email.verifying_msg')}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="fade-in">
            <HiOutlineCheckCircle size={64} style={{ color: 'var(--neon-green)', marginBottom: 'var(--space-md)' }} />
            <h2 style={{ color: 'var(--neon-green)', marginBottom: 'var(--space-sm)' }}>{t('admin_dashboard.auth.verify_email.success_title')}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>{message}</p>
            <Link to="/login" className="btn btn-primary btn-lg" style={{ display: 'inline-block', width: '100%' }}>
              {t('admin_dashboard.auth.verify_email.btn_login')}
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="fade-in">
            <HiOutlineXCircle size={64} style={{ color: 'var(--neon-magenta)', marginBottom: 'var(--space-md)' }} />
            <h2 style={{ color: 'var(--neon-magenta)', marginBottom: 'var(--space-sm)' }}>{t('admin_dashboard.auth.verify_email.error_title')}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>{message}</p>
            <Link to="/register" className="btn btn-secondary btn-lg" style={{ display: 'inline-block', width: '100%', marginBottom: 'var(--space-md)' }}>
              {t('admin_dashboard.auth.verify_email.btn_register')}
            </Link>
            <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'underline' }}>
              {t('admin_dashboard.auth.verify_email.already_verified')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
