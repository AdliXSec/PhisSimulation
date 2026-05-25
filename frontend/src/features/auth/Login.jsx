import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineShieldCheck, HiOutlineLockClosed, HiOutlineUser, HiOutlineArrowLeft } from 'react-icons/hi2';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        await googleLogin({ access_token: tokenResponse.access_token });
        toast.success('Login Google berhasil!');
        navigate('/dashboard');
      } catch (err) {
        toast.error(err.response?.data?.detail || 'Login Google gagal');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error('Gagal terhubung ke Google');
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Username dan password wajib diisi');
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      toast.success('Login berhasil!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login gagal');
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

      <div className="login-card fade-in">
        <Link to="/" className="back-link" title="Kembali ke Beranda">
          <HiOutlineArrowLeft size={18} />
        </Link>
        <div className="login-header">
          <div className="login-logo">
            <HiOutlineShieldCheck size={36} />
          </div>
          <h1>PhiSim</h1>
          <p>Security Awareness Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <div className="input-icon-wrapper">
              <HiOutlineUser className="input-icon" size={18} />
              <input
                id="username"
                type="text"
                className="input input-with-icon"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-icon-wrapper">
              <HiOutlineLockClosed className="input-icon" size={18} />
              <input
                id="password"
                type="password"
                className="input input-with-icon"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading}>
            {loading ? <span className="spinner"></span> : '>> AKSES SISTEM'}
          </button>
        </form>

        <div style={{ margin: 'var(--space-xl) 0', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ position: 'relative', background: 'var(--bg-primary)', padding: '0 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>ATAU</span>
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
            LANJUTKAN DENGAN GOOGLE
          </button>
        </div>

        <div className="login-footer">
          <p>Belum punya akun? <Link to="/register" style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>Daftar sekarang</Link></p>
        </div>
      </div>
    </div>
  );
}
