import { Handle, Position } from '@xyflow/react';
import { HiOutlineRocketLaunch, HiOutlineBuildingOffice } from 'react-icons/hi2';

export function CampaignNode({ data, selected }) {
  const statusColor = {
    ACTIVE: 'var(--success)',
    COMPLETED: 'var(--success)',
    READY: 'var(--warning)',
    DRAFT: 'var(--text-muted)',
    LAUNCHING: 'var(--neon-cyan)',
    GENERATING: 'var(--neon-cyan)',
    STOPPED: 'var(--danger)'
  }[data.status] || 'var(--text-muted)';

  return (
    <div style={{
      padding: '12px 16px',
      background: 'rgba(20, 20, 30, 0.9)',
      border: `2px solid ${selected ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: '12px',
      minWidth: '200px',
      boxShadow: selected ? '0 0 16px rgba(0, 240, 255, 0.4)' : '0 4px 6px rgba(0,0,0,0.3)',
      transition: 'all 0.2s',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: 'var(--neon-cyan)' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: 'var(--neon-cyan)' }} />
      
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        background: `rgba(${statusColor === 'var(--success)' ? '0,255,100' : '0,240,255'}, 0.1)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${statusColor}`
      }}>
        <HiOutlineRocketLaunch size={20} style={{ color: statusColor }} />
      </div>
      <div>
        <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.95rem' }}>
          {data.name}
        </div>
        <div style={{ fontSize: '0.75rem', color: statusColor, marginTop: '2px', fontWeight: 500, letterSpacing: '0.05em' }}>
          {data.status}
        </div>
      </div>
    </div>
  );
}

export function DepartmentNode({ data }) {
  return (
    <div style={{
      padding: '10px 16px',
      background: 'rgba(40, 20, 40, 0.9)',
      border: '1px solid rgba(255, 0, 170, 0.3)',
      borderRadius: '8px',
      minWidth: '150px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      backdropFilter: 'blur(10px)'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: 'var(--neon-magenta)' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: 'var(--neon-magenta)' }} />
      
      <HiOutlineBuildingOffice size={20} style={{ color: 'var(--neon-magenta)' }} />
      <div>
        <div style={{ fontWeight: 500, color: '#ffffff', fontSize: '0.9rem' }}>
          {data.name}
        </div>
        <div style={{ fontSize: '0.7rem', color: '#a0aec0' }}>
          {data.count} target
        </div>
      </div>
    </div>
  );
}
