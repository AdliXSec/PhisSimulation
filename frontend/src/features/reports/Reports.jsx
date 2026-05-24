import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineSparkles } from 'react-icons/hi2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Reports() {
  const { campaignId } = useParams();
  const [report, setReport] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (campaignId) loadReport();
    else setLoading(false);
  }, [campaignId]);

  const loadReport = async () => {
    try {
      const res = await api.get(`/reports/campaigns/${campaignId}`);
      setReport(res.data);
    } catch (err) {
      toast.error('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await api.post(`/reports/campaigns/${campaignId}/ai-analysis`);
      setAiAnalysis(res.data.analysis);
      toast.success('Analisis AI berhasil digenerate!');
    } catch (err) {
      toast.error('Gagal generate analisis');
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
            <h1>Laporan</h1>
            <p>Pilih kampanye dari halaman Kampanye untuk melihat laporan detail</p>
          </div>
        </div>
        <div className="empty-state">
          <h3>Pilih kampanye untuk melihat laporan</h3>
          <p>Buka halaman Kampanye dan klik "Detail" pada salah satu kampanye</p>
        </div>
      </div>
    );
  }

  const summary = report?.summary;
  const chartData = summary ? [
    { name: 'Terkirim', value: summary.sent, fill: '#3b82f6' },
    { name: 'Dibuka', value: summary.opened, fill: '#22d3ee' },
    { name: 'Diklik', value: summary.clicked, fill: '#f59e0b' },
    { name: 'Submit', value: summary.submitted, fill: '#ef4444' },
  ] : [];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Laporan: {report?.campaign?.name}</h1>
          <p>
            Status: <span className="badge badge-info">{report?.campaign?.status}</span>
            {' '} | Kesulitan: {report?.campaign?.difficulty} | Tema: {report?.campaign?.theme}
          </p>
        </div>
        <button className="btn btn-primary" onClick={generateAnalysis} disabled={analyzing}>
          <HiOutlineSparkles size={18} />
          {analyzing ? 'Menganalisis...' : 'Generate Analisis AI'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="card-glow">
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--info)' }}>{summary?.total_targets || 0}</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Total Target</div>
        </div>
        <div className="card-glow">
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--accent-secondary)' }}>{summary?.open_rate || 0}%</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Open Rate</div>
        </div>
        <div className="card-glow">
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--warning)' }}>{summary?.click_rate || 0}%</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Click Rate</div>
        </div>
        <div className="card-glow">
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--danger)' }}>{summary?.submit_rate || 0}%</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Submit Rate</div>
        </div>
      </div>

      {/* Funnel Chart */}
      <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
        <h3 style={{ marginBottom: 'var(--space-lg)' }}>Funnel Interaksi</h3>
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
            <HiOutlineSparkles size={20} style={{ color: 'var(--accent-primary)' }} /> Analisis AI
          </h3>
          <div className="markdown-content" style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiAnalysis}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Target Table (Internal) */}
      <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
        <h3 style={{ marginBottom: 'var(--space-lg)' }}>Detail Target & Data (Internal)</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Departemen</th>
                <th>Status</th>
                <th>Data Disubmit</th>
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
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>Submisi Web Eksternal</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>API Key</th>
                  <th>Target Email (Jika Ada)</th>
                  <th>IP Address</th>
                  <th>Data Disubmit</th>
                </tr>
              </thead>
              <tbody>
                {report.external_submissions.map((sub, idx) => (
                  <tr key={idx}>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(sub.created_at).toLocaleString('id-ID')}</td>
                    <td>
                      <span className="badge badge-info">{sub.api_key_name}</span>
                    </td>
                    <td>
                      {sub.matched_email ? (
                        <>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{sub.matched_email}</span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Tidak Dikenali</span>
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
