import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiOutlineXMark, HiOutlineDocumentChartBar, HiOutlineInformationCircle } from 'react-icons/hi2';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../services/api';
import './CampaignSidebar.css';

export default function CampaignSidebar({ campaignId, campaign, onClose, onEdit, onDelete, onLaunch, onGenerate }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'report'
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!campaignId) return;
    
    setLoading(true);
    setError(null);
    api.get(`/campaigns/${campaignId}`)
      .then(res => {
        setDetail(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load campaign details:", err);
        setError("Gagal memuat detail kampanye");
        setLoading(false);
      });
  }, [campaignId]);

  if (!campaignId) return null;

  const statusBadge = (s) => {
    const map = {
      DRAFT: 'badge-default', GENERATING: 'badge-info', READY: 'badge-warning',
      LAUNCHING: 'badge-info', ACTIVE: 'badge-success', COMPLETED: 'badge-success', STOPPED: 'badge-danger',
    };
    return `badge ${map[s] || 'badge-default'}`;
  };

  // Funnel Stats Calculation
  let total = 0;
  let opened = 0;
  let clicked = 0;
  let submitted = 0;

  if (detail?.target_stats) {
    const s = detail.target_stats;
    // Total is sum of all targets
    total = Object.values(s).reduce((a, b) => a + b, 0);
    // Opened is OPENED + CLICKED + SUBMITTED
    opened = (s['OPENED'] || 0) + (s['CLICKED'] || 0) + (s['SUBMITTED'] || 0);
    // Clicked is CLICKED + SUBMITTED
    clicked = (s['CLICKED'] || 0) + (s['SUBMITTED'] || 0);
    // Submitted is SUBMITTED
    submitted = s['SUBMITTED'] || 0;
  }

  const openRate = total > 0 ? Math.round((opened / total) * 100) : 0;
  const clickRate = total > 0 ? Math.round((clicked / total) * 100) : 0;
  const submitRate = total > 0 ? Math.round((submitted / total) * 100) : 0;

  const ignored = total > 0 ? total - opened : 0;
  const justOpened = opened - clicked;
  const justClicked = clicked - submitted;

  const pieData = [
    { name: 'Ignored', value: ignored, color: '#666666' },
    { name: 'Opened', value: justOpened, color: '#facc15' },
    { name: 'Clicked', value: justClicked, color: '#ff00aa' },
    { name: 'Submitted', value: submitted, color: '#ef4444' },
  ].filter(d => d.value > 0);

  if (pieData.length === 0 && total > 0) {
    pieData.push({ name: 'Sent', value: total, color: '#666666' });
  } else if (total === 0) {
    pieData.push({ name: 'No Targets', value: 1, color: '#222222' });
  }

  const funnelData = [
    { name: 'Sent', value: total },
    { name: 'Opened', value: opened },
    { name: 'Clicked', value: clicked },
    { name: 'Submitted', value: submitted },
  ];

  return (
    <div className="campaign-sidebar open">
      <div className="campaign-sidebar-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="sidebar-title">{loading ? 'Memuat...' : detail?.name}</h2>
            {!loading && detail && (
              <span className={statusBadge(detail.status)} style={{ marginTop: '8px', display: 'inline-block' }}>
                {detail.status}
              </span>
            )}
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '8px' }}>
            <HiOutlineXMark size={24} />
          </button>
        </div>

        <div className="sidebar-tabs">
          <button 
            className={`sidebar-tab ${activeTab === 'info' ? 'active' : ''}`} 
            onClick={() => setActiveTab('info')}
          >
            <HiOutlineInformationCircle size={18} />
            Informasi
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'report' ? 'active' : ''}`} 
            onClick={() => setActiveTab('report')}
          >
            <HiOutlineDocumentChartBar size={18} />
            Laporan
          </button>
        </div>
      </div>

      <div className="campaign-sidebar-content">
        {loading ? (
          <div className="loading-center" style={{ height: '200px' }}><div className="spinner"></div></div>
        ) : error ? (
          <div style={{ color: 'var(--danger)', textAlign: 'center', padding: '2rem' }}>{error}</div>
        ) : activeTab === 'info' ? (
          <div className="info-tab fade-in">
            <div className="info-item">
              <span className="info-label">Difficulty</span>
              <span className="info-value">
                <span className={`badge badge-${detail.difficulty === 'HIGH' ? 'danger' : detail.difficulty === 'MEDIUM' ? 'warning' : 'success'}`}>
                  {detail.difficulty}
                </span>
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Tema Kampanye</span>
              <span className="info-value">{detail.theme || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Target Departemen</span>
              <span className="info-value">{detail.target_departments?.length || 0} departemen terpilih</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Target</span>
              <span className="info-value">{total} orang</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tanggal Dibuat</span>
              <span className="info-value">{new Date(detail.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ) : (
          <div className="report-tab fade-in">
            <h4 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Engagement Breakdown</h4>
            <div style={{ width: '100%', height: '220px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)', borderRadius: '8px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ width: '50%', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.8rem', color: '#666666' }}>● Ignored: {ignored}</div>
                <div style={{ fontSize: '0.8rem', color: '#facc15' }}>● Opened: {justOpened}</div>
                <div style={{ fontSize: '0.8rem', color: '#ff00aa' }}>● Clicked: {justClicked}</div>
                <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>● Submitted: {submitted}</div>
              </div>
            </div>

            <div className="funnel-container">
              <h4 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Interaction Funnel</h4>
              <div style={{ width: '100%', height: '220px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px', padding: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={funnelData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--neon-cyan)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--neon-cyan)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: 'var(--neon-cyan)' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="var(--neon-cyan)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ marginTop: '32px' }}>
              <Link to={`/dashboard/reports/${campaignId}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <HiOutlineDocumentChartBar size={18} style={{ marginRight: '8px' }} />
                Detail Laporan
              </Link>
            </div>
          </div>
        )}
      </div>

      {!loading && !error && campaign && (
        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--divider)', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
          {campaign.status === 'READY' && (
            <button className="btn btn-sm btn-primary" onClick={() => onLaunch(campaign.id)} style={{ flex: 1, justifyContent: 'center' }}>Luncurkan</button>
          )}
          {campaign.status === 'DRAFT' && (
            <>
              <button className="btn btn-sm btn-secondary" onClick={() => onEdit(campaign)} style={{ flex: 1, justifyContent: 'center' }}>Edit</button>
              <button className="btn btn-sm btn-secondary" onClick={() => onGenerate(campaign.id)} style={{ flex: 1, justifyContent: 'center' }}>AI Content</button>
            </>
          )}
          <button className="btn btn-sm btn-danger" onClick={() => {
            onDelete(campaign.id, campaign.name);
            onClose();
          }} style={{ flex: 1, justifyContent: 'center' }}>Hapus</button>
        </div>
      )}
    </div>
  );
}
