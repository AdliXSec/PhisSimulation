import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import toast from 'react-hot-toast';
import usePolling from '../../hooks/usePolling';
import { HiOutlineSparkles } from 'react-icons/hi2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Reports() {
  const { t } = useTranslation();
  const { campaignId } = useParams();
  const [report, setReport] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const loadReport = useCallback(async () => {
    if (!campaignId) return;
    try {
      const res = await api.get(`/reports/campaigns/${campaignId}`);
      setReport(res.data);
    } catch (err) {
      if (loading) toast.error(t('admin_dashboard.reports.messages.load_failed'));
    } finally {
      setLoading(false);
    }
  }, [campaignId, loading]);

  useEffect(() => {
    if (campaignId) loadReport();
    else setLoading(false);
  }, [campaignId]);

  // Load saved AI analysis when report data is loaded
  useEffect(() => {
    if (report?.ai_analysis && !aiAnalysis) {
      setAiAnalysis(report.ai_analysis);
    }
  }, [report]);

  // Real-time polling every 5 seconds (only when viewing a campaign report)
  usePolling(loadReport, 5000, !!campaignId);

  const generateAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await api.post(`/reports/campaigns/${campaignId}/ai-analysis`);
      setAiAnalysis(res.data.analysis);
      toast.success(t('admin_dashboard.reports.messages.ai_success'));
    } catch (err) {
      toast.error(t('admin_dashboard.reports.messages.ai_failed'));
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  if (!campaignId) {
    return (
      <div className="fade-in">
        <div className="page-header">
          <div>
            <h1>{t('admin_dashboard.reports.title')}</h1>
            <p>{t('admin_dashboard.reports.desc')}</p>
          </div>
        </div>
        <div className="empty-state">
          <h3>{t('admin_dashboard.reports.empty_title')}</h3>
          <p dangerouslySetInnerHTML={{ __html: t('admin_dashboard.reports.empty_desc') }} />
        </div>
      </div>
    );
  }

  const summary = report?.summary;
  const chartData = summary ? [
    { name: t('admin_dashboard.reports.stat_sent'), value: summary.sent, fill: '#3b82f6' },
    { name: t('admin_dashboard.reports.stat_opened'), value: summary.opened, fill: '#22d3ee' },
    { name: t('admin_dashboard.reports.stat_clicked'), value: summary.clicked, fill: '#f59e0b' },
    { name: t('admin_dashboard.reports.stat_submit'), value: summary.submitted, fill: '#ef4444' },
  ] : [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>{t('admin_dashboard.reports.report_for')} {report?.campaign?.name}</h1>
          <p style={{ marginTop: '8px' }}>
            {t('admin_dashboard.reports.report_desc')}
            <br />
            {t('admin_dashboard.reports.status_label')} <span className="badge badge-info">{report?.campaign?.status}</span>
            {' '} | {t('admin_dashboard.reports.theme_label')} {report?.campaign?.theme}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={async () => {
              if(!report?.templates?.[0]) return toast.error(t('admin_dashboard.reports.messages.tpl_not_found'));
              const name = prompt(t('admin_dashboard.reports.messages.tpl_prompt'));
              if(!name) return;
              try {
                await api.post(`/saved-templates/from-campaign/${report.templates[0].id}?name=${encodeURIComponent(name)}`);
                toast.success(t('admin_dashboard.reports.messages.tpl_saved'));
              } catch(e) {
                toast.error(t('admin_dashboard.reports.messages.tpl_failed'));
              }
            }}
          >
            {t('admin_dashboard.reports.btn_save_tpl')}
          </button>
          <button className="btn btn-primary" onClick={generateAnalysis} disabled={analyzing}>
            <HiOutlineSparkles size={18} />
            {analyzing ? t('admin_dashboard.reports.btn_analyzing') : t('admin_dashboard.reports.btn_gen_ai')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="card-glow">
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--info)' }}>{summary?.total_targets || 0}</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{t('admin_dashboard.reports.card_total')}</div>
        </div>
        <div className="card-glow">
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--accent-secondary)' }}>{summary?.open_rate || 0}%</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{t('admin_dashboard.reports.card_open')}</div>
        </div>
        <div className="card-glow">
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--warning)' }}>{summary?.click_rate || 0}%</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{t('admin_dashboard.reports.card_click')}</div>
        </div>
        <div className="card-glow">
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--danger)' }}>{summary?.submit_rate || 0}%</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{t('admin_dashboard.reports.card_submit')}</div>
        </div>
      </div>

      {/* Funnel Chart */}
      <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
        <h3 style={{ marginBottom: 'var(--space-lg)' }}>{t('admin_dashboard.reports.funnel_title')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 13 }} width={80} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI Analysis */}
      {aiAnalysis && (
        <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
          <h3 style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiOutlineSparkles size={20} style={{ color: 'var(--accent-primary)' }} /> {t('admin_dashboard.reports.ai_title')}
          </h3>
          <div className="markdown-content" style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiAnalysis}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Target Table (Internal) */}
      <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
        <h3 style={{ marginBottom: 'var(--space-lg)' }}>{t('admin_dashboard.reports.internal_title')}</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('admin_dashboard.reports.col_name')}</th>
                <th>{t('admin_dashboard.reports.col_email')}</th>
                <th>{t('admin_dashboard.reports.col_dept')}</th>
                <th>{t('admin_dashboard.reports.col_status')}</th>
                <th>{t('admin_dashboard.reports.col_data')}</th>
              </tr>
            </thead>
            <tbody>
              {report?.targets?.map((t, i) => (
                <tr key={i}>
                  <td><strong>{t.employee_name}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{t.employee_email}</td>
                  <td>{t.department || '-'}</td>
                  <td>
                    <span className={`badge ${
                      t.status === 'SUBMITTED' ? 'badge-danger' :
                      t.status === 'CLICKED' ? 'badge-warning' :
                      t.status === 'OPENED' ? 'badge-info' :
                      t.status === 'SENT' ? 'badge-success' : 'badge-default'
                    }`}>{t.status}</span>
                  </td>
                  <td>
                    {t.submissions && t.submissions.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {t.submissions.map((sub, idx) => (
                          <div key={idx} style={{
                            background: 'rgba(0, 0, 0, 0.2)',
                            border: '1px solid var(--divider)',
                            borderRadius: '4px',
                            padding: '8px',
                            fontSize: '0.85rem'
                          }}>
                            <div style={{ marginBottom: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {new Date(sub.created_at).toLocaleString('id-ID')}
                            </div>
                            {Object.entries(sub.submitted_data || {}).map(([key, val]) => (
                              <div key={key} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                                <strong style={{ color: 'var(--text-secondary)', minWidth: '80px' }}>{key}:</strong>
                                <span style={{ fontFamily: 'monospace', color: 'var(--danger)', wordBreak: 'break-all' }}>{String(val)}</span>
                              </div>
                            ))}
                            {sub.fingerprint && Object.keys(sub.fingerprint).length > 0 && (
                              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--neon-green)', marginBottom: '4px' }}>🛡️ Device Fingerprint:</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                  OS: {sub.fingerprint.os}<br/>
                                  Browser: {sub.fingerprint.userAgent?.split(' ')[0]}...<br/>
                                  Resolusi: {sub.fingerprint.screenResolution}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* External Submissions Table */}
      {report?.external_submissions && report.external_submissions.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>{t('admin_dashboard.reports.external_title')}</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>{t('admin_dashboard.reports.col_time')}</th>
                  <th>{t('admin_dashboard.reports.col_apikey')}</th>
                  <th>{t('admin_dashboard.reports.col_target_email')}</th>
                  <th>{t('admin_dashboard.reports.col_ip')}</th>
                  <th>{t('admin_dashboard.reports.col_data')}</th>
                </tr>
              </thead>
              <tbody>
                {report.external_submissions.map((sub, idx) => (
                  <tr key={idx}>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(sub.created_at).toLocaleString()}</td>
                    <td>
                      <span className="badge badge-info">{sub.api_key_name}</span>
                    </td>
                    <td>
                      {sub.matched_email ? (
                        <>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{sub.matched_email}</span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>{t('admin_dashboard.reports.unknown_target')}</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{sub.ip}</td>
                    <td>
                      <div style={{
                        background: 'rgba(0, 0, 0, 0.2)',
                        border: '1px solid var(--divider)',
                        borderRadius: '4px',
                        padding: '8px',
                        fontSize: '0.85rem'
                      }}>
                        {Object.entries(sub.submitted_data || {}).map(([key, val]) => (
                          <div key={key} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                            <strong style={{ color: 'var(--text-secondary)', minWidth: '80px' }}>{key}:</strong>
                            <span style={{ fontFamily: 'monospace', color: 'var(--danger)', wordBreak: 'break-all' }}>{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Need Cell import for individual bar colors
import { Cell } from 'recharts';
