import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineShieldCheck, HiOutlineLockClosed, HiOutlineUser, HiOutlineArrowLeft } from 'react-icons/hi2';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

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

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              setLoading(true);
              try {
                await googleLogin(credentialResponse.credential);
                toast.success('Login Google berhasil!');
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
            text="continue_with"
            size="large"
            width="100%"
          />
        </div>

        <div className="login-footer">
          <p>Belum punya akun? <Link to="/register" style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>Daftar sekarang</Link></p>
        </div>
      </div>
    </div>
  );
}
