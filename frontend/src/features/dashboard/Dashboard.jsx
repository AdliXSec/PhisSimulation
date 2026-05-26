import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import usePolling from '../../hooks/usePolling';
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

  return (
    <div className="dashboard fade-in">
      {/* Header */}
      <div className="dash-header">
        <div>
          <div className="dash-greeting">
            <HiOutlineShieldCheck size={20} style={{ color: 'var(--neon-cyan)', flexShrink: 0 }} />
            <span>Dashboard Overview</span>
          </div>
          <h1 className="dash-title">Pusat Kontrol Keamanan</h1>
          <p className="dash-subtitle">
            <HiOutlineCalendarDays size={14} />
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          icon={<HiOutlineUserGroup size={22} />}
          label="Total Karyawan"
          value={stats?.total_employees || 0}
          desc="Terdaftar dalam sistem"
          color="#3b82f6"
        />
        <StatCard
          icon={<HiOutlineEnvelope size={22} />}
          label="Total Kampanye"
          value={stats?.total_campaigns || 0}
          desc="Simulasi dibuat"
          color="#8b5cf6"
        />
        <StatCard
          icon={<HiOutlineCursorArrowRays size={22} />}
          label="Click Rate"
          value={`${clickRate}%`}
          desc={clickRate > 30 ? 'Perlu perhatian' : 'Dalam batas aman'}
          color={clickRate > 30 ? '#f59e0b' : '#10b981'}
          trend={clickRate > 30 ? 'up' : 'down'}
        />
        <StatCard
          icon={<HiOutlineExclamationTriangle size={22} />}
          label="Risiko Tinggi"
          value={stats?.risk_distribution?.HIGH || 0}
          desc="Karyawan berisiko"
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
