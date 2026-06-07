import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiOutlineXMark, HiOutlineDocumentChartBar, HiOutlineInformationCircle, HiOutlineSparkles, HiOutlineDocumentArrowDown } from 'react-icons/hi2';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import html2pdf from 'html2pdf.js';
import PrintableReport from './PrintableReport';
import './CampaignSidebar.css';

export default function CampaignSidebar({ campaignId, campaign, onClose, onEdit, onDelete, onLaunch, onGenerate }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'report'
  const [detail, setDetail] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  const isAnalyzing = reportData?.ai_analysis === '_GENERATING_AI_';

  useEffect(() => {
    if (!campaignId) return;

    setLoading(true);
    setError(null);

    Promise.all([
      api.get(`/campaigns/${campaignId}`),
      api.get(`/reports/campaigns/${campaignId}`).catch(() => ({ data: null }))
    ])
      .then(([campRes, repRes]) => {
        setDetail(campRes.data);
        if (repRes.data) {
          setReportData(repRes.data);
          if (repRes.data.ai_analysis) {
            setAiAnalysis(repRes.data.ai_analysis);
          } else {
            setAiAnalysis('');
          }
        } else {
          setReportData(null);
          setAiAnalysis('');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load campaign details:", err);
        setError("Gagal memuat detail kampanye");
        setLoading(false);
      });
  }, [campaignId]);

  // Polling for AI Analysis
  useEffect(() => {
    let interval;
    if (isAnalyzing && campaignId) {
      interval = setInterval(() => {
        api.get(`/reports/campaigns/${campaignId}`).then(res => {
          if (res.data) {
            setReportData(res.data);
            if (res.data.ai_analysis && res.data.ai_analysis !== '_GENERATING_AI_') {
              setAiAnalysis(res.data.ai_analysis);
              clearInterval(interval);
              if (res.data.ai_analysis === '_FAILED_') {
                toast.error(t('admin_dashboard.reports.messages.ai_failed', 'Gagal membuat analisis AI.'));
                setAiAnalysis('');
              } else {
                toast.success(t('admin_dashboard.reports.messages.ai_success', 'Analisis berhasil dibuat.'));
              }
            }
          }
        }).catch(err => console.error("Polling error", err));
      }, 4000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isAnalyzing, campaignId, t]);

  if (!campaignId) return null;

  const statusBadge = (s) => {
    const map = {
      DRAFT: 'badge-default', GENERATING: 'badge-info', READY: 'badge-warning',
      LAUNCHING: 'badge-info', ACTIVE: 'badge-success', COMPLETED: 'badge-success', STOPPED: 'badge-danger',
    };
    return `badge ${map[s] || 'badge-default'}`;
  };

  const exportPDF = () => {
    setExporting(true);
    setTimeout(() => {
      const element = document.getElementById('printable-report');
      if (!element) {
        setExporting(false);
        return;
      }
      
      const opt = {
        margin:       [10, 10, 10, 10],
        filename:     `Report_${detail?.name || 'Campaign'}.pdf`,
        image:        { type: 'jpeg', quality: 1 },
        html2canvas:  { scale: 4, useCORS: true, backgroundColor: '#ffffff', logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).save().then(() => {
        setExporting(false);
        toast.success(t('admin_dashboard.reports.messages.pdf_success', 'Laporan berhasil diunduh'));
      }).catch(err => {
        console.error("PDF Export Error:", err);
        setExporting(false);
        toast.error(t('admin_dashboard.reports.messages.pdf_failed', 'Gagal mengunduh laporan PDF'));
      });
    }, 100);
  };

  const generateAnalysis = async () => {
    try {
      await api.post(`/reports/campaigns/${campaignId}/ai-analysis`);
      toast.success(t('admin_dashboard.reports.messages.ai_started', 'Pembuatan analisis AI telah dimulai...'));
      setReportData(prev => ({ ...prev, ai_analysis: '_GENERATING_AI_' }));
      setAiAnalysis('_GENERATING_AI_');
    } catch (err) {
      toast.error(t('admin_dashboard.reports.messages.ai_failed', 'Gagal memulai analisis AI.'));
    }
  };

  // Funnel Stats Calculation
  let total = 0;
  let opened = 0;
  let clicked = 0;
  let submitted = 0;

  if (detail?.target_stats) {
    const s = detail.target_stats;
    total = Object.values(s).reduce((a, b) => a + b, 0);
    opened = (s['OPENED'] || 0) + (s['CLICKED'] || 0) + (s['SUBMITTED'] || 0);
    clicked = (s['CLICKED'] || 0) + (s['SUBMITTED'] || 0);
    submitted = s['SUBMITTED'] || 0;
  }

  const openRate = total > 0 ? Math.round((opened / total) * 100) : 0;
  const clickRate = total > 0 ? Math.round((clicked / total) * 100) : 0;
  const submitRate = total > 0 ? Math.round((submitted / total) * 100) : 0;

  const ignored = total > 0 ? total - opened : 0;
  const justOpened = opened - clicked;
  const justClicked = clicked - submitted;

  const pieData = [
    { name: t('admin_dashboard.reports.stat_ignored', 'Ignored'), value: ignored, color: '#666666' },
    { name: t('admin_dashboard.reports.stat_opened', 'Opened'), value: justOpened, color: '#facc15' },
    { name: t('admin_dashboard.reports.stat_clicked', 'Clicked'), value: justClicked, color: '#ff00aa' },
    { name: t('admin_dashboard.reports.stat_submit', 'Submitted'), value: submitted, color: '#ef4444' },
  ].filter(d => d.value > 0);

  if (pieData.length === 0 && total > 0) {
    pieData.push({ name: t('admin_dashboard.reports.stat_sent', 'Sent'), value: total, color: '#666666' });
  } else if (total === 0) {
    pieData.push({ name: t('admin_dashboard.reports.stat_no_targets', 'No Targets'), value: 1, color: '#222222' });
  }

  const funnelData = [
    { name: t('admin_dashboard.reports.stat_sent', 'Sent'), value: total },
    { name: t('admin_dashboard.reports.stat_opened', 'Opened'), value: opened },
    { name: t('admin_dashboard.reports.stat_clicked', 'Clicked'), value: clicked },
    { name: t('admin_dashboard.reports.stat_submit', 'Submitted'), value: submitted },
  ];

  return (
    <div className="campaign-sidebar open" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="campaign-sidebar-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="sidebar-title">{loading ? t('common.loading', 'Memuat...') : detail?.name}</h2>
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
            {t('admin_dashboard.campaigns.tab_info', 'Informasi')}
          </button>
          <button
            className={`sidebar-tab ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => setActiveTab('report')}
          >
            <HiOutlineDocumentChartBar size={18} />
            {t('admin_dashboard.campaigns.tab_report', 'Laporan')}
          </button>
        </div>
      </div>

      <div className="campaign-sidebar-content" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {loading ? (
          <div className="loading-center" style={{ height: '200px' }}><div className="spinner"></div></div>
        ) : error ? (
          <div style={{ color: 'var(--danger)', textAlign: 'center', padding: '2rem' }}>{error}</div>
        ) : activeTab === 'info' ? (
          <div className="info-tab fade-in">
            <div className="info-item">
              <span className="info-label">{t('admin_dashboard.campaigns.detail_difficulty', 'Difficulty')}</span>
              <span className="info-value">
                <span className={`badge badge-${detail.difficulty === 'HIGH' ? 'danger' : detail.difficulty === 'MEDIUM' ? 'warning' : 'success'}`}>
                  {detail.difficulty}
                </span>
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">{t('admin_dashboard.campaigns.detail_theme', 'Tema Kampanye')}</span>
              <span className="info-value">{detail.theme || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">{t('admin_dashboard.campaigns.detail_departments', 'Target Departemen')}</span>
              <span className="info-value">{detail.target_departments?.length || 0} {t('admin_dashboard.campaigns.dept_selected', 'departemen terpilih')}</span>
            </div>
            <div className="info-item">
              <span className="info-label">{t('admin_dashboard.campaigns.detail_total_target', 'Total Target')}</span>
              <span className="info-value">{total} {t('admin_dashboard.campaigns.people', 'orang')}</span>
            </div>
            <div className="info-item">
              <span className="info-label">{t('admin_dashboard.campaigns.detail_created_at', 'Tanggal Dibuat')}</span>
              <span className="info-value">{new Date(detail.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ) : (
          <div className="report-tab fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Action Buttons for Report */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={async () => {
                    if (!reportData?.templates?.[0]) return toast.error(t('admin_dashboard.reports.messages.tpl_not_found', 'Template tidak ditemukan'));
                    const name = prompt(t('admin_dashboard.reports.messages.tpl_prompt', 'Masukkan nama template untuk disimpan:'));
                    if (!name) return;
                    try {
                      await api.post(`/saved-templates/from-campaign/${reportData.templates[0].id}?name=${encodeURIComponent(name)}`);
                      toast.success(t('admin_dashboard.reports.messages.tpl_saved', 'Template berhasil disimpan'));
                    } catch (e) {
                      toast.error(t('admin_dashboard.reports.messages.tpl_failed', 'Gagal menyimpan template'));
                    }
                  }}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {t('admin_dashboard.reports.btn_save_tpl', 'Save Template')}
                </button>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={generateAnalysis}
                  disabled={isAnalyzing}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <HiOutlineSparkles size={16} />
                  {isAnalyzing ? t('admin_dashboard.reports.btn_analyzing', 'Analyzing...') : t('admin_dashboard.reports.btn_gen_ai', 'Generate AI Analysis')}
                </button>
              </div>
              <button
                className="btn btn-sm btn-secondary"
                onClick={exportPDF}
                disabled={exporting}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <HiOutlineDocumentArrowDown size={16} />
                {exporting ? t('admin_dashboard.reports.btn_exporting', 'Exporting...') : t('admin_dashboard.reports.btn_export_pdf', 'Download PDF')}
              </button>
            </div>

            {/* AI Analysis Markdown */}
            {aiAnalysis && aiAnalysis !== '_GENERATING_AI_' && aiAnalysis !== '_FAILED_' && (
              <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--neon-cyan)' }}>
                  <HiOutlineSparkles size={18} /> AI Analysis
                </h4>
                <div className="markdown-content" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiAnalysis}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--info)' }}>{total}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('admin_dashboard.reports.card_total', 'Total Targets')}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-secondary)' }}>{openRate}%</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('admin_dashboard.reports.card_open', 'Open Rate')}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>{clickRate}%</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('admin_dashboard.reports.card_click', 'Click Rate')}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>{submitRate}%</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('admin_dashboard.reports.card_submit', 'Submit Rate')}</div>
              </div>
            </div>

            {/* Engagement Breakdown Pie Chart */}
            <div>
              <h4 style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>{t('admin_dashboard.reports.engagement_breakdown', 'Engagement Breakdown')}</h4>
              <div style={{ width: '100%', height: '180px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center' }}>
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)', borderRadius: '8px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ width: '50%', paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#666666' }}>● {t('admin_dashboard.reports.stat_ignored', 'Ignored')}: {ignored}</div>
                  <div style={{ fontSize: '0.75rem', color: '#facc15' }}>● {t('admin_dashboard.reports.stat_opened', 'Opened')}: {justOpened}</div>
                  <div style={{ fontSize: '0.75rem', color: '#ff00aa' }}>● {t('admin_dashboard.reports.stat_clicked', 'Clicked')}: {justClicked}</div>
                  <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>● {t('admin_dashboard.reports.stat_submit', 'Submitted')}: {submitted}</div>
                </div>
              </div>
            </div>

            {/* Funnel Chart */}
            <div>
              <h4 style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>{t('admin_dashboard.reports.funnel_title', 'Interaction Funnel')}</h4>
              <div style={{ width: '100%', height: '180px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px', padding: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={funnelData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--neon-cyan)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--neon-cyan)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: 'var(--neon-cyan)' }} />
                    <Area type="monotone" dataKey="value" stroke="var(--neon-cyan)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Target Details Table */}
            {reportData?.targets && reportData.targets.length > 0 && (
              <div>
                <h4 style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>{t('admin_dashboard.reports.internal_title', 'Target Details & Data (Internal)')}</h4>
                <div style={{ background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                    <thead style={{ background: 'rgba(255, 255, 255, 0.05)', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      <tr>
                        <th style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{t('admin_dashboard.reports.col_name', 'Name / Email')}</th>
                        <th style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{t('admin_dashboard.reports.col_dept', 'Dept')}</th>
                        <th style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{t('admin_dashboard.reports.col_status', 'Status')}</th>
                        <th style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{t('admin_dashboard.reports.col_data', 'Data')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.targets.map((t, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <td style={{ padding: '12px', fontSize: '0.8rem' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>{t.employee_name}</strong><br />
                            <span style={{ color: 'var(--text-secondary)' }}>{t.employee_email}</span>
                          </td>
                          <td style={{ padding: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.department || '-'}</td>
                          <td style={{ padding: '12px' }}>
                            <span className={`badge ${t.status === 'SUBMITTED' ? 'badge-danger' :
                                t.status === 'CLICKED' ? 'badge-warning' :
                                  t.status === 'OPENED' ? 'badge-info' :
                                    t.status === 'SENT' ? 'badge-success' : 'badge-default'
                              }`} style={{ fontSize: '0.65rem' }}>{t.status}</span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            {t.submissions && t.submissions.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {t.submissions.map((sub, idx) => (
                                  <div key={idx} style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--divider)', borderRadius: '4px', padding: '8px', fontSize: '0.75rem' }}>
                                    {Object.entries(sub.submitted_data || {}).map(([key, val]) => (
                                      <div key={key} style={{ display: 'flex', gap: '4px', marginBottom: '2px' }}>
                                        <strong style={{ color: 'var(--text-secondary)' }}>{key}:</strong>
                                        <span style={{ fontFamily: 'monospace', color: 'var(--danger)', wordBreak: 'break-all' }}>{String(val)}</span>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* External Submissions Table */}
            {reportData?.external_submissions && reportData.external_submissions.length > 0 && (
              <div>
                <h4 style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>{t('admin_dashboard.reports.external_title', 'External Submissions')}</h4>
                <div style={{ background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead style={{ background: 'rgba(255, 255, 255, 0.05)', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      <tr>
                        <th style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{t('admin_dashboard.reports.col_time', 'Time')}</th>
                        <th style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{t('admin_dashboard.reports.col_apikey', 'API Key')}</th>
                        <th style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{t('admin_dashboard.reports.col_target_email', 'Target Email')}</th>
                        <th style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{t('admin_dashboard.reports.col_ip', 'IP')}</th>
                        <th style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>{t('admin_dashboard.reports.col_data', 'Data')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.external_submissions.map((sub, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <td style={{ padding: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(sub.created_at).toLocaleString()}</td>
                          <td style={{ padding: '12px' }}>
                            <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{sub.api_key_name}</span>
                          </td>
                          <td style={{ padding: '12px', fontSize: '0.8rem' }}>
                            {sub.matched_email ? (
                              <span style={{ color: 'var(--text-secondary)' }}>{sub.matched_email}</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>{t('admin_dashboard.reports.unknown_target', 'Unknown')}</span>
                            )}
                          </td>
                          <td style={{ padding: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sub.ip}</td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--divider)', borderRadius: '4px', padding: '8px', fontSize: '0.75rem' }}>
                              {Object.entries(sub.submitted_data || {}).map(([key, val]) => (
                                <div key={key} style={{ display: 'flex', gap: '4px', marginBottom: '2px' }}>
                                  <strong style={{ color: 'var(--text-secondary)' }}>{key}:</strong>
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
        )}
      </div>

      {/* Hidden Printable Report for PDF Export */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <PrintableReport 
          detail={detail} 
          reportData={reportData} 
          aiAnalysis={aiAnalysis} 
          pieData={pieData} 
          funnelData={funnelData} 
        />
      </div>

      {!loading && !error && campaign && (
        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--divider)', background: 'rgba(0,0,0,0.3)', display: 'flex', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
          {campaign.status === 'READY' && (
            <button className="btn btn-sm btn-primary" onClick={() => onLaunch(campaign.id)} style={{ flex: 1, justifyContent: 'center' }}>{t('admin_dashboard.campaigns.btn_launch', 'Luncurkan')}</button>
          )}
          {campaign.status === 'DRAFT' && (
            <>
              <button className="btn btn-sm btn-secondary" onClick={() => onEdit(campaign)} style={{ flex: 1, justifyContent: 'center' }}>{t('admin_dashboard.campaigns.btn_edit', 'Edit')}</button>
              <button className="btn btn-sm btn-secondary" onClick={() => onGenerate(campaign.id)} style={{ flex: 1, justifyContent: 'center' }}>{t('admin_dashboard.campaigns.btn_ai_content', 'AI Content')}</button>
            </>
          )}
          <button className="btn btn-sm btn-danger" onClick={() => {
            onDelete(campaign.id, campaign.name);
            onClose();
          }} style={{ flex: 1, justifyContent: 'center' }}>{t('admin_dashboard.campaigns.btn_delete', 'Hapus')}</button>
        </div>
      )}
    </div>
  );
}
