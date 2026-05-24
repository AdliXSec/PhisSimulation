import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineUser, HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineShieldCheck, HiOutlineCpuChip } from 'react-icons/hi2';

export default function Profile() {
  const { user, fetchUser } = useAuth();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    password_confirm: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        full_name: user.full_name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.password_confirm) {
      toast.error('Password baru dan konfirmasi tidak cocok');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
      };
      if (form.password) {
        payload.password = form.password;
      }

      await api.put('/auth/me', payload);
      toast.success('Profil berhasil diperbarui');
      
      // Clear password fields
      setForm(f => ({ ...f, password: '', password_confirm: '' }));
      
      // Refresh user context
      await fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const userInitials = (user?.full_name || user?.username || 'U').substring(0, 2).toUpperCase();

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Manajemen Profil</h1>
          <p>Konfigurasi identitas dan kredensial akses sistem Anda</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        
        {/* Left Side: Identity Card */}
        <div className="card-glow" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-md)' }}>
          <div style={{
            width: '120px', height: '120px', 
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(255, 0, 85, 0.2))',
            border: '2px solid var(--neon-cyan)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.4), inset 0 0 20px rgba(0, 240, 255, 0.2)',
            fontSize: '3rem', fontWeight: 'bold', color: 'var(--text-primary)',
            letterSpacing: '2px',
            marginBottom: 'var(--space-sm)'
          }}>
            {userInitials}
          </div>
          
          <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)', margin: 0 }}>
            {user?.full_name || user?.username}
          </h2>
          <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <HiOutlineCpuChip /> ID: {user?.username}
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '20px',
            background: 'rgba(255, 0, 85, 0.1)', border: '1px solid var(--neon-magenta)',
            color: 'var(--neon-magenta)', fontSize: 'var(--font-size-xs)', fontWeight: 'bold',
            marginTop: 'var(--space-sm)'
          }}>
            <HiOutlineShieldCheck size={16} />
            {user?.role === 'ADMIN' ? 'SYSTEM ADMINISTRATOR' : user?.role || 'USER'}
          </div>
        </div>

        {/* Right Side: Edit Form */}
        <div className="card-glow">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            
            <h3 style={{ borderBottom: '1px solid var(--divider)', paddingBottom: 'var(--space-sm)', color: 'var(--neon-cyan)' }}>
              Informasi Pribadi
            </h3>

            <div className="input-group">
              <label>Nama Lengkap</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--text-muted)' }}>
                  <HiOutlineUser size={20} />
                </div>
                <input 
                  className="input" 
                  placeholder="Masukkan nama lengkap" 
                  value={form.full_name} 
                  onChange={e => setForm({ ...form, full_name: e.target.value })} 
                  required 
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>
            
            <div className="input-group">
              <label>Alamat Email</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--text-muted)' }}>
                  <HiOutlineEnvelope size={20} />
                </div>
                <input 
                  type="email"
                  className="input" 
                  placeholder="Masukkan alamat email" 
                  value={form.email} 
                  onChange={e => setForm({ ...form, email: e.target.value })} 
                  required 
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <h3 style={{ borderBottom: '1px solid var(--divider)', paddingBottom: 'var(--space-sm)', marginTop: 'var(--space-md)', color: 'var(--neon-cyan)' }}>
              Kredensial Keamanan
            </h3>
            
            <div className="input-group">
              <label>Password Baru</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--text-muted)' }}>
                  <HiOutlineLockClosed size={20} />
                </div>
                <input 
                  type="password"
                  className="input" 
                  placeholder="Kosongkan jika tidak ingin mengubah" 
                  value={form.password} 
                  onChange={e => setForm({ ...form, password: e.target.value })} 
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>
            
            <div className="input-group">
              <label>Konfirmasi Password</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--text-muted)' }}>
                  <HiOutlineLockClosed size={20} />
                </div>
                <input 
                  type="password"
                  className="input" 
                  placeholder="Ulangi password baru" 
                  value={form.password_confirm} 
                  onChange={e => setForm({ ...form, password_confirm: e.target.value })} 
                  disabled={!form.password}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--divider)', marginTop: 'var(--space-sm)' }}>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '10px 24px', letterSpacing: '1px' }}>
                {loading ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
