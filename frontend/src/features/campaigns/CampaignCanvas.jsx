import { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CampaignNode, DepartmentNode } from './CanvasNodes';
import CampaignSidebar from './CampaignSidebar';
import DepartmentSidebar from './DepartmentSidebar';
import api from '../../services/api';

const nodeTypes = {
  campaign: CampaignNode,
  department: DepartmentNode,
};

export default function CampaignCanvas({ campaigns, departments, onEdit, onDelete, onLaunch, onGenerate, onNewCampaign, onReload }) {
  const { t } = useTranslation();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [layoutKey, setLayoutKey] = useState(0);

  // Layout the graph whenever campaigns, departments or layoutKey change
  useEffect(() => {
    const newNodes = [];
    const newEdges = [];

    // Departments at the bottom
    const deptY = 400;
    const deptSpacing = 200;
    const startXDept = -(departments.length * deptSpacing) / 2;

    const deptMap = {};

    departments.forEach((d, i) => {
      deptMap[d.id] = true;
      const id = `dept-${d.id}`;
      const pos = {
        x: d.ui_position_x != null ? d.ui_position_x : startXDept + i * deptSpacing,
        y: d.ui_position_y != null ? d.ui_position_y : deptY
      };

      newNodes.push({
        id,
        type: 'department',
        position: pos,
        data: { name: d.name, count: d.employee_count },
      });
    });

    // Campaigns at the top
    const campY = 100;
    const campSpacing = 250;
    const startXCamp = -(campaigns.length * campSpacing) / 2;

    campaigns.forEach((c, i) => {
      const id = `camp-${c.id}`;
      const pos = {
        x: c.ui_position_x != null ? c.ui_position_x : startXCamp + i * campSpacing,
        y: c.ui_position_y != null ? c.ui_position_y : campY
      };

      newNodes.push({
        id,
        type: 'campaign',
        position: pos,
        data: {
          name: c.name,
          status: c.status,
          raw: c // pass full campaign for actions if needed
        },
      });

      // Fetch edges: campaign to its target departments
      // (Assuming c.target_departments is an array of IDs in the campaigns response,
      // but list_campaigns API might not return it. We might need to assume it's there or handle it)
      // Wait, list_campaigns doesn't return target_departments array. 
      // But we can just connect all campaigns to a central "Targets" node if we don't have it, 
      // OR we update list_campaigns to return it.
      // Let's connect to all departments for now or handle if target_departments exists.
      if (c.target_departments && Array.isArray(c.target_departments)) {
        c.target_departments.forEach(deptId => {
          if (deptMap[deptId]) {
            newEdges.push({
              id: `edge-${c.id}-${deptId}`,
              source: `camp-${c.id}`,
              target: `dept-${deptId}`,
              animated: c.status === 'ACTIVE' || c.status === 'LAUNCHING',
              style: { stroke: 'var(--neon-cyan)', strokeWidth: 2 }
            });
          }
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [campaigns, departments, layoutKey, setNodes, setEdges]);

  const onNodeClick = useCallback((event, node) => {
    if (node.type === 'campaign') {
      const campId = node.id.replace('camp-', '');
      setSelectedCampaignId(campId);
      setSelectedDepartmentId(null);
    } else if (node.type === 'department') {
      const deptId = node.id.replace('dept-', '');
      setSelectedDepartmentId(deptId);
      setSelectedCampaignId(null);
    } else {
      setSelectedCampaignId(null);
      setSelectedDepartmentId(null);
    }
  }, []);

  const onNodeDragStop = useCallback((event, node) => {
    if (!node || !node.id) return;
    const isCamp = node.type === 'campaign';
    const id = node.id.replace(isCamp ? 'camp-' : 'dept-', '');
    const payload = {
      ui_position_x: node.position.x,
      ui_position_y: node.position.y
    };
    
    api.put(`/${isCamp ? 'campaigns' : 'departments'}/${id}`, payload).catch(err => {
      console.error('Failed to save node position', err);
    });
  }, []);

  const handleResetPositions = async () => {
    try {
      const promises = [];
      campaigns.forEach(c => {
        promises.push(api.put(`/campaigns/${c.id}`, { ui_position_x: -9999.0, ui_position_y: -9999.0 }));
      });
      departments.forEach(d => {
        promises.push(api.put(`/departments/${d.id}`, { ui_position_x: -9999.0, ui_position_y: -9999.0 }));
      });
      await Promise.all(promises);
      if (onReload) onReload();
      else window.location.reload();
    } catch (err) {
      console.error('Failed to reset positions', err);
    }
  };

  const onPaneClick = useCallback(() => {
    // setSelectedCampaignId(null); // Disabled by user request: Sidebar should only close via X button
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', background: 'transparent', overflow: 'hidden', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
        panOnScroll={true}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ maxZoom: 1, padding: 0.2 }}
        colorMode="dark"
        style={{ background: 'transparent' }}
      >
        <Background color="rgba(0, 240, 255, 0.2)" gap={20} size={1.5} />
        <Controls />
      </ReactFlow>

      {/* Top Left Menu & Header */}
      <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 10, display: 'flex', flexDirection: 'column', gap: '16px', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, var(--font-size-3xl))', fontWeight: 700, margin: 0, textTransform: 'uppercase', background: 'var(--gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {t('admin_dashboard.campaigns.title')}
          </h1>
          {/* <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', margin: '4px 0 0 0', WebkitTextFillColor: 'unset' }}>
            {t('admin_dashboard.campaigns.desc')}
          </p> */}
        </div>
        <div style={{ display: 'flex', gap: '12px', pointerEvents: 'auto' }}>
          {onNewCampaign && (
            <button className="btn btn-primary" onClick={onNewCampaign} style={{ boxShadow: '0 4px 12px rgba(0,240,255,0.3)' }}>
              + {t('admin_dashboard.campaigns.btn_new')}
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleResetPositions} style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
            Reset Posisi
          </button>
        </div>
      </div>

      {/* Campaign Sidebar Overlay */}
      <CampaignSidebar
        campaignId={selectedCampaignId}
        campaign={campaigns.find(x => x.id === selectedCampaignId)}
        onClose={() => setSelectedCampaignId(null)}
        onEdit={onEdit}
        onDelete={onDelete}
        onLaunch={onLaunch}
        onGenerate={onGenerate}
      />

      {/* Department Sidebar Overlay */}
      <DepartmentSidebar
        departmentId={selectedDepartmentId}
        departmentName={departments.find(x => x.id == selectedDepartmentId)?.name}
        onClose={() => setSelectedDepartmentId(null)}
      />
    </div>
  );
}
