import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineBuildingOffice2,
  HiOutlineEnvelope,
  HiOutlineChartBarSquare,
  HiOutlineShieldCheck,
  HiOutlineArrowRightOnRectangle,
  HiOutlineXMark,
  HiOutlineKey,
  HiOutlineUser,
} from 'react-icons/hi2';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
  { path: '/dashboard/campaigns', label: 'Kampanye', icon: HiOutlineEnvelope },
  { path: '/dashboard/employees', label: 'Karyawan', icon: HiOutlineUserGroup },
  { path: '/dashboard/departments', label: 'Departemen', icon: HiOutlineBuildingOffice2 },
  { path: '/dashboard/reports', label: 'Laporan', icon: HiOutlineChartBarSquare },
  { path: '/dashboard/api-keys', label: 'API Keys', icon: HiOutlineKey },
  { path: '/dashboard/profile', label: 'Profil Saya', icon: HiOutlineUser },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <HiOutlineShieldCheck size={28} />
          <div>
            <h2>PhiSim</h2>
            <span>Security Platform</span>
          </div>
        </div>
        {/* Mobile close button */}
        <button className="btn-ghost mobile-close-btn" onClick={onClose}>
          <HiOutlineXMark size={24} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">MENU</div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            end={item.path === '/dashboard'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.full_name?.[0] || user?.username?.[0] || 'A'}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.full_name || user?.username}</span>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>
        <button className="btn-ghost logout-btn" onClick={logout} title="Logout">
          <HiOutlineArrowRightOnRectangle size={20} />
        </button>
      </div>
    </aside>
  );
}
