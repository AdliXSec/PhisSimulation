import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import usePolling from '../../hooks/usePolling';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineUserGroup,
  HiOutlineEnvelope,
  HiOutlineCursorArrowRays,
  HiOutlineExclamationTriangle,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlineChevronRight,
  HiOutlineCalendarDays,
  HiOutlineShieldCheck,
  HiOutlineShieldExclamation,
  HiOutlineInformationCircle,
  HiOutlineLightBulb,
  HiOutlinePlus,
  HiOutlineChartBarSquare,
} from 'react-icons/hi2';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import './Dashboard.css';

const RISK_COLORS = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
};

const RISK_LABELS = {
  LOW: 'Rendah',
  MEDIUM: 'Sedang',
  HIGH: 'Tinggi',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const res = await api.get('/reports/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  // Real-time polling every 5 seconds
  usePolling(loadStats, 5000);

  if (loading) {
    return (
      <div className="loading-center" style={{ minHeight: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const riskData = stats?.risk_distribution
    ? Object.entries(stats.risk_distribution).map(([name, value]) => ({ name, value }))
    : [];

  const eventData = stats?.event_stats
    ? Object.entries(stats.event_stats).map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        value,
      }))
    : [];

  const totalRisk = riskData.reduce((s, d) => s + d.value, 0);
  const clickRate = stats?.click_rate || 0;

  // Determine Organization Health
  let healthStatus = 'Sehat';
  let healthColor = 'var(--success)';
  let healthIcon = <HiOutlineShieldCheck size={28} />;
  let healthMessage = 'Karyawan Anda memiliki kesadaran keamanan yang baik. Pertahankan!';
  
  if (clickRate > 30 || (stats?.risk_distribution?.HIGH || 0) > 10) {
    healthStatus = 'Kritis';
    healthColor = 'var(--danger)';
    healthIcon = <HiOutlineShieldExclamation size={28} />;
    healthMessage = 'Tingkat klik sangat tinggi! Segera jalankan simulasi edukasi.';
  } else if (clickRate > 10 || (stats?.risk_distribution?.HIGH || 0) > 0) {
    healthStatus = 'Waspada';
    healthColor = 'var(--warning)';
    healthIcon = <HiOutlineExclamationTriangle size={28} />;
    healthMessage = 'Beberapa karyawan rentan terhadap serangan. Perlu perhatian ekstra.';
  }

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 18 ? 'Selamat Siang' : 'Selamat Malam';
  const firstName = (user?.full_name || user?.username || 'Admin').split(' ')[0];

  return (
    <div className="dashboard fade-in">
      {/* Header & Health Status */}
      <div className="dash-header-block" style={{ marginBottom: 'var(--space-2xl)', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="dash-greeting">
            <HiOutlineCalendarDays size={14} style={{ color: 'var(--neon-cyan)' }} />
            <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <h1 className="dash-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: '8px' }}>
            {greeting}, {firstName}! 👋
          </h1>
          <p className="dash-subtitle" style={{ fontSize: '1rem' }}>
            Berikut adalah ringkasan keamanan organisasi Anda hari ini.
          </p>
        </div>

        {/* Health Card */}
        <div style={{
          background: `color-mix(in srgb, ${healthColor} 8%, transparent)`,
          border: `1px solid color-mix(in srgb, ${healthColor} 30%, transparent)`,
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          maxWidth: '450px',
          boxShadow: `0 8px 32px color-mix(in srgb, ${healthColor} 10%, transparent)`,
        }}>
          <div style={{ color: healthColor, background: `color-mix(in srgb, ${healthColor} 15%, transparent)`, padding: '12px', borderRadius: '12px' }}>
            {healthIcon}
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: healthColor, marginBottom: '4px' }}>
              Status Organisasi: {healthStatus}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              {healthMessage}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 'var(--space-2xl)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Link to="/dashboard/campaigns" className="btn btn-primary" style={{ padding: '12px 20px', fontSize: '0.9rem', gap: '8px' }}>
          <HiOutlinePlus size={18} /> Buat Simulasi Baru
        </Link>
        <Link to="/dashboard/reports" className="btn btn-secondary" style={{ padding: '12px 20px', fontSize: '0.9rem', gap: '8px' }}>
          <HiOutlineChartBarSquare size={18} /> Lihat Laporan Lengkap
        </Link>
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <HiOutlineInformationCircle size={18} style={{ color: 'var(--neon-cyan)' }} />
        <h2 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)' }}>Statistik Utama</h2>
      </div>

      {/* Stat Cards - Simplified descriptions */}
      <div className="stats-grid">
        <StatCard
          icon={<HiOutlineUserGroup size={22} />}
          label="Total Karyawan"
          value={stats?.total_employees || 0}
          desc="Jumlah orang yang dilindungi"
          color="#3b82f6"
        />
        <StatCard
          icon={<HiOutlineEnvelope size={22} />}
          label="Simulasi Berjalan"
          value={stats?.total_campaigns || 0}
          desc="Total email pancingan terkirim"
          color="#8b5cf6"
        />
        <StatCard
          icon={<HiOutlineCursorArrowRays size={22} />}
          label="Tingkat Tertipu"
          value={`${clickRate}%`}
          desc={clickRate > 0 ? `${clickRate}% orang mengklik tautan bahaya` : 'Tidak ada yang mengklik tautan'}
          color={clickRate > 30 ? '#ef4444' : clickRate > 10 ? '#f59e0b' : '#10b981'}
          trend={clickRate > 30 ? 'up' : 'down'}
        />
        <StatCard
          icon={<HiOutlineExclamationTriangle size={22} />}
          label="Berisiko Tinggi"
          value={stats?.risk_distribution?.HIGH || 0}
          desc="Orang yang butuh pelatihan segera"
          color="#ef4444"
        />
      </div>

      {/* Navigation Cards */}
      <div className="nav-cards">
        <Link to="/dashboard/campaigns" className="nav-card">
          <div className="nav-card-content">
            <h4>Kampanye</h4>
            <p>Buat & kelola simulasi phishing</p>
          </div>
          <HiOutlineChevronRight size={18} />
        </Link>
        <Link to="/dashboard/employees" className="nav-card">
          <div className="nav-card-content">
            <h4>Karyawan</h4>
            <p>Kelola data karyawan target</p>
          </div>
          <HiOutlineChevronRight size={18} />
        </Link>
        <Link to="/dashboard/departments" className="nav-card">
          <div className="nav-card-content">
            <h4>Departemen</h4>
            <p>Atur struktur departemen</p>
          </div>
          <HiOutlineChevronRight size={18} />
        </Link>
        <Link to="/dashboard/reports" className="nav-card">
          <div className="nav-card-content">
            <h4>Laporan</h4>
            <p>Analisis hasil kampanye</p>
          </div>
          <HiOutlineChevronRight size={18} />
        </Link>
      </div>

      {/* Charts Section */}
      <div className="grid-2" style={{ marginTop: 'var(--space-lg)' }}>
        {/* Risk Distribution */}
        <div className="card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Distribusi Risiko Karyawan</h3>
            <span className="chart-badge">{totalRisk} karyawan</span>
          </div>
          {riskData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {riskData.map((entry) => (
                      <Cell key={entry.name} fill={RISK_COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(6, 10, 20, 0.95)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                    }}
                    formatter={(value, name) => [value, RISK_LABELS[name] || name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                {riskData.map(({ name, value }) => (
                  <div key={name} className="legend-row">
                    <div className="legend-left">
                      <span className="legend-dot" style={{ background: RISK_COLORS[name] }} />
                      <span>{RISK_LABELS[name] || name}</span>
                    </div>
                    <div className="legend-right">
                      <span className="legend-value">{value}</span>
                      <span className="legend-pct">{totalRisk > 0 ? Math.round((value / totalRisk) * 100) : 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p>Belum ada data risiko</p>
            </div>
          )}
        </div>

        {/* Event Tracking */}
        <div className="card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Event Tracking</h3>
            <span className="chart-badge">Semua kampanye</span>
          </div>
          {eventData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(6, 10, 20, 0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                  }}
                />
                <Bar dataKey="value" fill="var(--neon-cyan)" radius={[4, 4, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p>Belum ada data event</p>
            </div>
          )}
        </div>
      </div>

      {/* Security Tips */}
      <div className="card" style={{ marginTop: 'var(--space-xl)', background: 'rgba(8, 145, 178, 0.04)', borderColor: 'rgba(8, 145, 178, 0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ background: 'rgba(8, 145, 178, 0.15)', padding: '8px', borderRadius: '8px', color: 'var(--neon-cyan)' }}>
            <HiOutlineLightBulb size={24} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>Tips Keamanan Hari Ini</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Phishing sering terjadi pada hari libur atau akhir pekan ketika karyawan lengah. 
          Jadwalkan kampanye simulasi secara acak untuk melatih kewaspadaan mereka di segala situasi. 
          Gunakan topik yang relevan dengan pekerjaan sehari-hari seperti "Pembaruan Kebijakan Cuti" atau "Reset Password Email Kantor".
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, desc, color, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="stat-icon" style={{ color, background: `${color}12`, border: `1px solid ${color}18` }}>
          {icon}
        </div>
        {trend && (
          <div className={`stat-trend ${trend}`}>
            {trend === 'up'
              ? <HiOutlineArrowTrendingUp size={14} />
              : <HiOutlineArrowTrendingDown size={14} />}
          </div>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-desc">{desc}</div>
    </div>
  );
}
