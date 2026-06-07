import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import './PrintableReport.css';

const RISK_COLORS = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
};

export default function PrintableReport({ detail, reportData, aiAnalysis, pieData, funnelData }) {
  if (!detail) return null;

  // Calculate rates
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

  return (
    <div id="printable-report" className="printable-report">
      <div className="printable-report-header">
        <div className="printable-report-title">
          <h1>{detail.name}</h1>
          <p>Campaign Analysis Report • Generated on {new Date().toLocaleString()}</p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '12px', color: '#333' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#111' }}>CONFIDENTIAL</p>
          <p style={{ margin: 0, color: '#111' }}>Phishing Simulation Platform</p>
        </div>
      </div>

      <div className="printable-report-section">
        <h2>Executive Summary</h2>
        <div className="printable-stats-grid">
          <div className="printable-stat-box">
            <h3>Total Targets</h3>
            <p>{total}</p>
          </div>
          <div className="printable-stat-box">
            <h3>Open Rate</h3>
            <p>{openRate}%</p>
          </div>
          <div className="printable-stat-box">
            <h3>Click Rate</h3>
            <p>{clickRate}%</p>
          </div>
          <div className="printable-stat-box">
            <h3>Submit Rate</h3>
            <p>{submitRate}%</p>
          </div>
        </div>
      </div>

      <div className="printable-report-section">
        <h2>Campaign Details</h2>
        <table className="printable-table">
          <tbody>
            <tr>
              <th style={{ width: '25%' }}>Theme</th>
              <td>{detail.theme || '-'}</td>
              <th style={{ width: '25%' }}>Difficulty</th>
              <td>{detail.difficulty || '-'}</td>
            </tr>
            <tr>
              <th>Target Departments</th>
              <td>{detail.target_departments?.length || 0} Departments</td>
              <th>Status</th>
              <td>{detail.status}</td>
            </tr>
            <tr>
              <th>Creation Date</th>
              <td>{new Date(detail.created_at).toLocaleString()}</td>
              <th>Link Mode</th>
              <td>{detail.link_mode === 'external' ? 'External Tool' : 'Internal Platform'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="printable-report-section">
        <h2>Performance Charts</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #eee', padding: '15px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '15px', color: '#333' }}>Target Response (Pie Chart)</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {pieData && pieData.length > 0 ? (
                <>
                  <PieChart width={180} height={180}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || '#888'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                  <div style={{ fontSize: '12px', color: '#111' }}>
                    {pieData.map((entry, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#111' }}>
                        <span style={{ width: '12px', height: '12px', background: entry.fill, display: 'inline-block', borderRadius: '50%' }}></span>
                        <strong>{entry.name}:</strong> {entry.value}
                      </div>
                    ))}
                  </div>
                </>
              ) : <p style={{ color: '#888', fontSize: '12px' }}>No response data available.</p>}
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #eee', padding: '15px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '15px', color: '#333' }}>Funnel Metrics</h3>
            {funnelData && funnelData.length > 0 ? (
              <BarChart width={300} height={200} data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#666' }} axisLine={{ stroke: '#ccc' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#666' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#4f46e5" radius={[2, 2, 0, 0]} />
              </BarChart>
            ) : <p style={{ color: '#888', fontSize: '12px' }}>No funnel data available.</p>}
          </div>
        </div>
      </div>

      {aiAnalysis && aiAnalysis !== '_GENERATING_AI_' && aiAnalysis !== '_FAILED_' && (
        <div className="printable-report-section" style={{ pageBreakBefore: 'always' }}>
          <h2>AI Analysis & Recommendations</h2>
          <div className="printable-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiAnalysis}</ReactMarkdown>
          </div>
        </div>
      )}

      {reportData?.external_actions && reportData.external_actions.length > 0 && (
        <div className="printable-report-section" style={{ pageBreakBefore: 'always' }}>
          <h2>External Submissions Log</h2>
          <p style={{ fontSize: '12px', color: '#555', marginBottom: '10px' }}>Showing recorded payload data from external targets.</p>
          <table className="printable-table">
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Time</th>
                <th style={{ width: '15%' }}>IP Address</th>
                <th style={{ width: '25%' }}>User Agent</th>
                <th style={{ width: '40%' }}>Data Submitted</th>
              </tr>
            </thead>
            <tbody>
              {reportData.external_actions.map((act, i) => (
                <tr key={i}>
                  <td>{new Date(act.created_at).toLocaleString()}</td>
                  <td>{act.ip_address || '-'}</td>
                  <td style={{ fontSize: '10px', color: '#111' }}>{act.user_agent || '-'}</td>
                  <td style={{ fontSize: '10px', fontFamily: 'monospace', color: '#111' }}>
                    {act.submitted_data ? JSON.stringify(act.submitted_data) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
