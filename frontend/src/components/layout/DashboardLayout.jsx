import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { HiOutlineBars3 } from 'react-icons/hi2';
import Sidebar from './Sidebar';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: '1.5px solid var(--neon-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--neon-cyan)',
            fontSize: '14px',
            fontWeight: 700,
            boxShadow: '0 0 8px var(--neon-cyan-glow)',
          }}>P</div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--neon-cyan)',
            letterSpacing: '0.05em',
            textShadow: '0 0 6px var(--neon-cyan-glow)',
          }}>PHISIM</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(true)}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid rgba(0, 240, 255, 0.15)',
            background: 'rgba(0, 240, 255, 0.04)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          <HiOutlineBars3 size={22} color="var(--neon-cyan)" />
        </button>
      </div>

      <Sidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
      
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="sidebar-overlay" onClick={() => setIsMobileOpen(false)}></div>
      )}

      <main className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
