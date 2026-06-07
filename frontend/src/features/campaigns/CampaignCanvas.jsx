import { useState, useCallback, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ReactFlow, MiniMap, Controls, ControlButton, Background, useNodesState, useEdgesState } from '@xyflow/react';
import { HiOutlineLockClosed, HiOutlineLockOpen, HiOutlineRocketLaunch, HiOutlineBuildingOffice2, HiOutlineUserGroup, HiChevronRight } from 'react-icons/hi2';
import '@xyflow/react/dist/style.css';
import { CampaignNode, DepartmentNode, EmployeeNode } from './CanvasNodes';
import CampaignSidebar from './CampaignSidebar';
import DepartmentSidebar from './DepartmentSidebar';
import EmployeeSidebar from './EmployeeSidebar';
import api from '../../services/api';

const nodeTypes = {
  campaign: CampaignNode,
  department: DepartmentNode,
  employee: EmployeeNode,
};

export default function CampaignCanvas({ campaigns, departments, employees, onEdit, onDelete, onLaunch, onGenerate, onNewCampaign, onNewDepartment, onNewEmployee, onEditDepartment, onDeleteDepartment, onEditEmployee, onDeleteEmployee, onReload }) {
  const { t } = useTranslation();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [selectedEmployeeDeptId, setSelectedEmployeeDeptId] = useState(null);
  const [layoutKey, setLayoutKey] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  useEffect(() => {
    // Fetch initial lock status from database
    api.get('/auth/me').then(res => {
      setIsLocked(res.data.canvas_locked || false);
    }).catch(err => console.error("Gagal mengambil status gembok:", err));
  }, []);

  const handleToggleLock = useCallback(() => {
    const newVal = !isLocked;
    setIsLocked(newVal);
    api.put('/auth/me', { canvas_locked: newVal }).catch(err => {
      console.error("Gagal menyimpan status gembok:", err);
      setIsLocked(!newVal); // revert on error
    });
  }, [isLocked]);

  // Layout the graph whenever campaigns, departments or layoutKey change
  useEffect(() => {
    const newNodes = [];
    const newEdges = [];

    // Base configurations for grid wrapping
    const itemsPerRow = 4;

    // Campaigns at the top
    const campStartY = 50;
    const campXSpacing = 300;
    const campYSpacing = 200;
    const maxCampRow = campaigns.length > 0 ? Math.floor((campaigns.length - 1) / itemsPerRow) : 0;
    const campStartX = -((Math.min(campaigns.length, itemsPerRow) - 1) * campXSpacing) / 2;

    // Departments below campaigns
    // Ensure departments start far enough below the last row of campaigns
    const deptStartY = campStartY + (maxCampRow + 1) * campYSpacing + 100;
    const deptXSpacing = 350;
    const deptYSpacing = 350; // Extra spacing because employee groups sit below departments
    const deptStartX = -((Math.min(departments.length, itemsPerRow) - 1) * deptXSpacing) / 2;

    const deptMap = {};

    departments.forEach((d, i) => {
      deptMap[d.id] = true;
      const id = `dept-${d.id}`;
      
      const col = i % itemsPerRow;
      const row = Math.floor(i / itemsPerRow);

      const pos = {
        x: d.ui_position_x != null ? d.ui_position_x : deptStartX + col * deptXSpacing,
        y: d.ui_position_y != null ? d.ui_position_y : deptStartY + row * deptYSpacing
      };

      newNodes.push({
        id,
        type: 'department',
        position: pos,
        data: { name: d.name, count: d.employee_count }
      });
      
      // Add EmployeeNode below Department
      const deptEmployees = employees?.filter(e => e.department_id === d.id) || [];
      if (deptEmployees.length > 0) {
        const empId = `emp-${d.id}`;
        const empPos = {
          x: d.emp_ui_position_x != null ? d.emp_ui_position_x : pos.x,
          y: d.emp_ui_position_y != null ? d.emp_ui_position_y : pos.y + 180
        };
        newNodes.push({
          id: empId,
          type: 'employee',
          position: empPos, // Positioned right beneath dept by default
          data: { employees: deptEmployees, departmentName: d.name },
        });
        
        newEdges.push({
          id: `e-dept-${d.id}-emp`,
          source: id,
          target: empId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'var(--neon-cyan)', strokeWidth: 2 }
        });
      }
    });

    campaigns.forEach((c, i) => {
      const id = `camp-${c.id}`;
      const col = i % itemsPerRow;
      const row = Math.floor(i / itemsPerRow);

      const pos = {
        x: c.ui_position_x != null ? c.ui_position_x : campStartX + col * campXSpacing,
        y: c.ui_position_y != null ? c.ui_position_y : campStartY + row * campYSpacing
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
      setSelectedEmployeeDeptId(null);
    } else if (node.type === 'department') {
      const deptId = node.id.replace('dept-', '');
      setSelectedDepartmentId(deptId);
      setSelectedCampaignId(null);
      setSelectedEmployeeDeptId(null);
    } else if (node.type === 'employee') {
      const deptId = node.id.replace('emp-', '');
      setSelectedEmployeeDeptId(deptId);
      setSelectedDepartmentId(null);
      setSelectedCampaignId(null);
    } else {
      setSelectedCampaignId(null);
      setSelectedDepartmentId(null);
      setSelectedEmployeeDeptId(null);
    }
  }, []);

  const onNodeDragStop = useCallback((event, node) => {
    if (!node || !node.id) return;
    const isCamp = node.type === 'campaign';
    const isDept = node.type === 'department';
    const isEmp = node.type === 'employee';
    
    // We only save positions for campaign, department, and employee
    if (!isCamp && !isDept && !isEmp) return;
    
    if (isEmp) {
      const id = node.id.replace('emp-', '');
      const payload = {
        emp_ui_position_x: node.position.x,
        emp_ui_position_y: node.position.y
      };
      api.put(`/departments/${id}`, payload).catch(err => {
        console.error('Failed to save employee node position', err);
      });
      return;
    }

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
        promises.push(api.put(`/departments/${d.id}`, { ui_position_x: -9999.0, ui_position_y: -9999.0, emp_ui_position_x: -9999.0, emp_ui_position_y: -9999.0 }));
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
        nodesDraggable={!isLocked}
        nodesConnectable={!isLocked}
        elementsSelectable={!isLocked}
      >
        <Background color="rgba(0, 240, 255, 0.2)" gap={20} size={1.5} />
        <Controls showInteractive={false}>
          <ControlButton onClick={handleToggleLock} title={isLocked ? "Buka Kunci Canvas" : "Kunci Canvas"}>
            {isLocked ? <HiOutlineLockClosed color="var(--neon-cyan)" /> : <HiOutlineLockOpen />}
          </ControlButton>
        </Controls>
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
          <div>
            <button className="btn btn-primary" onClick={() => setShowAddMenu(true)} style={{ boxShadow: '0 4px 12px rgba(0,240,255,0.3)', transform: 'none' }}>
              + Add
            </button>
            {showAddMenu && createPortal(
              <div className="modal-overlay" onClick={() => setShowAddMenu(false)} style={{ zIndex: 9999 }}>
                <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', width: '100%', padding: '0', background: 'var(--bg-secondary)', border: '1px solid var(--border)', backdropFilter: 'none', borderRadius: '12px' }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--divider)' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>What would you like to create?</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', padding: '12px', gap: '8px' }}>
                    <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', width: '100%', background: 'rgba(255,255,255,0.02)' }} onClick={() => { setShowAddMenu(false); onNewCampaign?.(); }}>
                      <div style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '8px', borderRadius: '8px', marginRight: '16px', display: 'flex' }}>
                        <HiOutlineRocketLaunch size={20} style={{ color: 'var(--neon-cyan)' }} />
                      </div>
                      <span style={{ flex: 1, textAlign: 'left', fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>Campaign</span>
                      <HiChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                    </button>
                    
                    <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', width: '100%', background: 'rgba(255,255,255,0.02)' }} onClick={() => { setShowAddMenu(false); onNewDepartment?.(); }}>
                      <div style={{ background: 'rgba(255, 0, 255, 0.1)', padding: '8px', borderRadius: '8px', marginRight: '16px', display: 'flex' }}>
                        <HiOutlineBuildingOffice2 size={20} style={{ color: 'var(--neon-magenta)' }} />
                      </div>
                      <span style={{ flex: 1, textAlign: 'left', fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>Department</span>
                      <HiChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                    </button>

                    <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', width: '100%', background: 'rgba(255,255,255,0.02)' }} onClick={() => { setShowAddMenu(false); onNewEmployee?.(); }} disabled={!departments || departments.length === 0}>
                      <div style={{ background: 'rgba(0, 255, 136, 0.1)', padding: '8px', borderRadius: '8px', marginRight: '16px', display: 'flex' }}>
                        <HiOutlineUserGroup size={20} style={{ color: '#00ff88' }} />
                      </div>
                      <span style={{ flex: 1, textAlign: 'left', fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>Employee</span>
                      <HiChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>
          <button className="btn btn-secondary" onClick={handleResetPositions} style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
            Reset Posisi
          </button>
        </div>
      </div>

      {/* Campaign Sidebar Overlay */}
      <CampaignSidebar
        campaignId={selectedCampaignId}
        campaign={campaigns.find(x => x.id === selectedCampaignId)}
        departments={departments}
        onClose={() => setSelectedCampaignId(null)}
        onEdit={onEdit}
        onDelete={onDelete}
        onLaunch={onLaunch}
        onGenerate={onGenerate}
      />

      {/* Department Sidebar Overlay */}
      <DepartmentSidebar
        department={departments.find(x => x.id == selectedDepartmentId)}
        departmentId={selectedDepartmentId}
        departmentName={departments.find(x => x.id == selectedDepartmentId)?.name}
        onClose={() => setSelectedDepartmentId(null)}
        onEdit={(dept) => onEditDepartment(dept)}
        onDelete={(id, name) => { onDeleteDepartment(id, name); setSelectedDepartmentId(null); }}
      />

      {/* Employee Sidebar Overlay */}
      <EmployeeSidebar
        departmentId={selectedEmployeeDeptId}
        departmentName={departments.find(x => x.id == selectedEmployeeDeptId)?.name}
        employees={employees}
        onClose={() => setSelectedEmployeeDeptId(null)}
        onEdit={(emp) => onEditEmployee(emp)}
        onDelete={(id, name) => { onDeleteEmployee(id, name); setSelectedEmployeeDeptId(null); }}
      />
    </div>
  );
}
