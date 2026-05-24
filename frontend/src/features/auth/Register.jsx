import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineShieldCheck, HiOutlineLockClosed, HiOutlineUser, HiOutlineEnvelope, HiOutlineArrowLeft } from 'react-icons/hi2';
import { GoogleLogin } from '@react-oauth/google';
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
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.email) {
      toast.error('Username, Email, dan Password wajib diisi');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registrasi gagal');
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
        <Link to="/" className="back-link" title="Kembali ke Beranda">
          <HiOutlineArrowLeft size={18} />
        </Link>
        <div className="login-header">
          <div className="login-logo">
            <HiOutlineShieldCheck size={36} />
          </div>
          <h1>Buat Akun</h1>
          <p>Daftar Sebagai Admin Baru</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="reg-username">Username *</label>
            <div className="input-icon-wrapper">
              <HiOutlineUser className="input-icon" size={18} />
              <input
                id="reg-username"
                type="text"
                className="input input-with-icon"
                placeholder="Pilih username unik"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="reg-email">Email *</label>
            <div className="input-icon-wrapper">
              <HiOutlineEnvelope className="input-icon" size={18} />
              <input
                id="reg-email"
                type="email"
                className="input input-with-icon"
                placeholder="email@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="reg-fullname">Nama Lengkap</label>
            <div className="input-icon-wrapper">
              <HiOutlineUser className="input-icon" size={18} />
              <input
                id="reg-fullname"
                type="text"
                className="input input-with-icon"
                placeholder="Opsional"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="reg-password">Password *</label>
            <div className="input-icon-wrapper">
              <HiOutlineLockClosed className="input-icon" size={18} />
              <input
                id="reg-password"
                type="password"
                className="input input-with-icon"
                placeholder="Min. 6 karakter"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? <span className="spinner"></span> : '>> DAFTAR SEKARANG'}
          </button>
        </form>

        <div style={{ margin: 'var(--space-xl) 0', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ position: 'relative', background: 'var(--bg-primary)', padding: '0 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>ATAU</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              setLoading(true);
              try {
                await googleLogin(credentialResponse.credential);
                toast.success('Daftar/Login Google berhasil!');
                navigate('/dashboard');
              } catch (err) {
                toast.error(err.response?.data?.detail || 'Login Google gagal');
              } finally {
                setLoading(false);
              }
            }}
            onError={() => {
              toast.error('Gagal terhubung ke Google');
            }}
            theme="filled_black"
            shape="rectangular"
            text="signup_with"
            size="large"
            width="100%"
          />
        </div>

        <div className="login-footer" style={{ marginTop: 'var(--space-xl)' }}>
          <p>Sudah punya akun? <Link to="/login" style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>Login di sini</Link></p>
        </div>
      </div>
    </div>
  );
}
