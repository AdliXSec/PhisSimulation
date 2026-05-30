import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineShieldCheck, HiOutlineLockClosed, HiOutlineUser, HiOutlineEnvelope, HiOutlineArrowLeft } from 'react-icons/hi2';
import { useGoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './Login.css';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
  });
  const [loading, setLoading] = useState(false);
  const { googleLogin } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        await googleLogin({ access_token: tokenResponse.access_token });
        toast.success(t('admin_dashboard.auth.google_reg_success'));
        navigate('/dashboard');
      } catch (err) {
        toast.error(err.response?.data?.detail || t('admin_dashboard.auth.google_failed'));
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error(t('admin_dashboard.auth.google_error'));
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.email) {
      toast.error(t('admin_dashboard.auth.missing_reg_fields'));
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success(t('admin_dashboard.auth.reg_success'));
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || t('admin_dashboard.auth.reg_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-effects">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>

      <div className="login-card fade-in" style={{ maxWidth: '460px' }}>
        <Link to="/" className="back-link" title={t('admin_dashboard.auth.back_home')}>
          <HiOutlineArrowLeft size={18} />
        </Link>
        <div className="login-header">
          <div className="login-logo">
            <HiOutlineShieldCheck size={36} />
          </div>
          <h1>{t('admin_dashboard.auth.reg_title')}</h1>
          <p>{t('admin_dashboard.auth.reg_desc')}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="reg-username">{t('admin_dashboard.auth.username_req')}</label>
            <div className="input-icon-wrapper">
              <HiOutlineUser className="input-icon" size={18} />
              <input
                id="reg-username"
                type="text"
                className="input input-with-icon"
                placeholder={t('admin_dashboard.auth.username_unique')}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="reg-email">{t('admin_dashboard.auth.email_req')}</label>
            <div className="input-icon-wrapper">
              <HiOutlineEnvelope className="input-icon" size={18} />
              <input
                id="reg-email"
                type="email"
                className="input input-with-icon"
                placeholder={t('admin_dashboard.auth.email_placeholder')}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="reg-fullname">{t('admin_dashboard.auth.fullname_label')}</label>
            <div className="input-icon-wrapper">
              <HiOutlineUser className="input-icon" size={18} />
              <input
                id="reg-fullname"
                type="text"
                className="input input-with-icon"
                placeholder={t('admin_dashboard.auth.optional')}
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="reg-password">{t('admin_dashboard.auth.password_req')}</label>
            <div className="input-icon-wrapper">
              <HiOutlineLockClosed className="input-icon" size={18} />
              <input
                id="reg-password"
                type="password"
                className="input input-with-icon"
                placeholder={t('admin_dashboard.auth.password_min')}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? <span className="spinner"></span> : t('admin_dashboard.auth.btn_register')}
          </button>
        </form>

        <div style={{ margin: 'var(--space-xl) 0', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ position: 'relative', background: 'var(--bg-primary)', padding: '0 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('admin_dashboard.auth.or')}</span>
        </div>

        <div style={{ width: '100%' }}>
          <button 
            type="button" 
            className="btn btn-secondary btn-lg" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
            onClick={() => loginWithGoogle()}
            disabled={loading}
          >
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="22px" height="22px" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            {t('admin_dashboard.auth.btn_google')}
          </button>
        </div>

        <div className="login-footer" style={{ marginTop: 'var(--space-xl)' }}>
          <p>{t('admin_dashboard.auth.has_account')}<Link to="/login" style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>{t('admin_dashboard.auth.login_here')}</Link></p>
        </div>
      </div>
    </div>
  );
}
