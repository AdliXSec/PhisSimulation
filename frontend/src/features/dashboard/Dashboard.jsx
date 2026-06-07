import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
        <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>{t('admin_dashboard.loading')}</p>
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

  const RISK_LABELS = {
    LOW: t('admin_dashboard.charts.risk_low'),
    MEDIUM: t('admin_dashboard.charts.risk_medium'),
    HIGH: t('admin_dashboard.charts.risk_high'),
  };

  // Determine Organization Health
  let healthStatus = t('admin_dashboard.health.status_healthy');
  let healthColor = 'var(--success)';
  let healthIcon = <HiOutlineShieldCheck size={28} />;
  let healthMessage = t('admin_dashboard.health.msg_healthy');
  
  if (clickRate > 30 || (stats?.risk_distribution?.HIGH || 0) > 10) {
    healthStatus = t('admin_dashboard.health.status_critical');
    healthColor = 'var(--danger)';
    healthIcon = <HiOutlineShieldExclamation size={28} />;
    healthMessage = t('admin_dashboard.health.msg_critical');
  } else if (clickRate > 10 || (stats?.risk_distribution?.HIGH || 0) > 0) {
    healthStatus = t('admin_dashboard.health.status_warning');
    healthColor = 'var(--warning)';
    healthIcon = <HiOutlineExclamationTriangle size={28} />;
    healthMessage = t('admin_dashboard.health.msg_warning');
  }

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('admin_dashboard.greeting.morning') : hour < 18 ? t('admin_dashboard.greeting.afternoon') : t('admin_dashboard.greeting.evening');
  const firstName = (user?.full_name || user?.username || 'Admin').split(' ')[0];

  return (
    <div className="dashboard fade-in">
      {/* Header & Health Status */}
      <div className="dash-header-block" style={{ marginBottom: 'var(--space-2xl)', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="dash-greeting">
            <HiOutlineCalendarDays size={14} style={{ color: 'var(--neon-cyan)' }} />
            <span>{new Date().toLocaleDateString(t('admin_dashboard.greeting.morning') === 'Good Morning' ? 'en-US' : 'id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <h1 className="dash-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: '8px' }}>
            {greeting}, {firstName}! 👋
          </h1>
          <p className="dash-subtitle" style={{ fontSize: '1rem' }}>
            {t('admin_dashboard.greeting.subtitle')}
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
              {t('admin_dashboard.health.title')} {healthStatus}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              {healthMessage}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 'var(--space-2xl)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Link to="/dashboard/campaigns" className="btn btn-primary" style={{ flex: '1 1 200px', padding: '12px', justifyContent: 'center' }}>
          <HiOutlinePlus size={20} /> {t('admin_dashboard.quick_actions.new_campaign')}
        </Link>
        <Link to="/dashboard/campaigns" className="btn btn-secondary" style={{ flex: '1 1 200px', padding: '12px', justifyContent: 'center' }}>
          <HiOutlineChartBarSquare size={20} /> {t('admin_dashboard.quick_actions.view_report')}
        </Link>
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <HiOutlineInformationCircle size={18} style={{ color: 'var(--neon-cyan)' }} />
        <h2 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)' }}>{t('admin_dashboard.stats.total_campaigns')} Overview</h2>
      </div>

      {/* Stat Cards - Simplified descriptions */}
      <div className="stats-grid">
        <StatCard
          icon={<HiOutlineUserGroup size={22} />}
          label={t('admin_dashboard.nav_cards.employees.title')}
          value={stats?.total_employees || 0}
          desc={t('admin_dashboard.nav_cards.employees.desc')}
          color="#3b82f6"
        />
        <StatCard
          icon={<HiOutlineEnvelope size={22} />}
          label={t('admin_dashboard.stats.total_campaigns')}
          value={stats?.total_campaigns || 0}
          desc={t('admin_dashboard.stats.targets_reached')}
          color="#8b5cf6"
        />
        <StatCard
          icon={<HiOutlineCursorArrowRays size={22} />}
          label={t('admin_dashboard.stats.overall_click_rate')}
          value={`${clickRate}%`}
          desc={clickRate > 0 ? `${clickRate}% clicked` : '0%'}
          color={clickRate > 30 ? '#ef4444' : clickRate > 10 ? '#f59e0b' : '#10b981'}
          trend={clickRate > 30 ? 'up' : 'down'}
        />
        <StatCard
          icon={<HiOutlineExclamationTriangle size={22} />}
          label={t('admin_dashboard.stats.high_risk')}
          value={stats?.risk_distribution?.HIGH || 0}
          desc="Action needed"
          color="#ef4444"
        />
      </div>

      {/* Navigation Cards */}
      <div className="nav-cards">
        <Link to="/dashboard/campaigns" className="nav-card">
          <div className="nav-card-content">
            <h4>{t('admin_dashboard.nav_cards.campaigns.title')}</h4>
            <p>{t('admin_dashboard.nav_cards.campaigns.desc')}</p>
          </div>
          <HiOutlineChevronRight size={18} />
        </Link>
        <Link to="/dashboard/employees" className="nav-card">
          <div className="nav-card-content">
            <h4>{t('admin_dashboard.nav_cards.employees.title')}</h4>
            <p>{t('admin_dashboard.nav_cards.employees.desc')}</p>
          </div>
          <HiOutlineChevronRight size={18} />
        </Link>
        <Link to="/dashboard/departments" className="nav-card">
          <div className="nav-card-content">
            <h4>{t('admin_dashboard.nav_cards.departments.title')}</h4>
            <p>{t('admin_dashboard.nav_cards.departments.desc')}</p>
          </div>
          <HiOutlineChevronRight size={18} />
        </Link>
        <Link to="/dashboard/campaigns" className="nav-card">
          <div className="nav-card-content">
            <h4>{t('admin_dashboard.nav_cards.reports.title')}</h4>
            <p>{t('admin_dashboard.nav_cards.reports.desc')}</p>
          </div>
          <HiOutlineChevronRight size={18} />
        </Link>
      </div>

      {/* Charts Section */}
      <div className="grid-2" style={{ marginTop: 'var(--space-lg)' }}>
        {/* Risk Distribution */}
        <div className="card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">{t('admin_dashboard.charts.employee_risk')}</h3>
            <span className="chart-badge">{totalRisk} {t('admin_dashboard.nav_cards.employees.title')}</span>
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
              <p>{t('admin_dashboard.charts.no_data')}</p>
            </div>
          )}
        </div>

        {/* Event Tracking */}
        <div className="card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Event Tracking</h3>
            <span className="chart-badge">{t('admin_dashboard.buttons.all_campaigns')}</span>
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
              <p>{t('admin_dashboard.charts.no_data')}</p>
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
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>{t('admin_dashboard.tips.title')}</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {t('admin_dashboard.tips.desc')}
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
