import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineBuildingOffice2,
  HiOutlineEnvelope,
  HiOutlineEnvelopeOpen,
  HiOutlineChartBarSquare,
  HiOutlineShieldCheck,
  HiOutlineArrowRightOnRectangle,
  HiOutlineXMark,
  HiOutlineKey,
  HiOutlineUser,
  HiOutlineGlobeAlt,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineDocumentText,
} from 'react-icons/hi2';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', labelKey: 'dashboard', icon: HiOutlineHome },
  { path: '/dashboard/campaigns', labelKey: 'campaigns', icon: HiOutlineEnvelope },
  { path: '/dashboard/templates', labelKey: 'templates', icon: HiOutlineEnvelopeOpen },
  { path: '/dashboard/landing-pages', labelKey: 'landing_pages', icon: HiOutlineDocumentText },
  { path: '/dashboard/osint', labelKey: 'osint', icon: HiOutlineGlobeAlt },
  { path: '/dashboard/intel', labelKey: 'intel', icon: HiOutlineShieldCheck },
  { path: '/dashboard/employees', labelKey: 'employees', icon: HiOutlineUserGroup },
  { path: '/dashboard/departments', labelKey: 'departments', icon: HiOutlineBuildingOffice2 },
  { path: '/dashboard/reports', labelKey: 'reports', icon: HiOutlineChartBarSquare },
  { path: '/dashboard/api-keys', labelKey: 'api_keys', icon: HiOutlineKey },
  { path: '/dashboard/profile', labelKey: 'profile', icon: HiOutlineUser },
];

export default function Sidebar({ isOpen, onClose }) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'id' : 'en';
    i18n.changeLanguage(newLang);
  };

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
        <div className="nav-section-label">{t('dashboard_layout.mobile_menu').toUpperCase()}</div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            end={item.path === '/dashboard'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{t(`dashboard_layout.menus.${item.labelKey}`)}</span>
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
        <button
          className="btn-ghost logout-btn"
          onClick={toggleLanguage}
          title="Ubah Bahasa / Change Language"
          style={{ color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8rem' }}
        >
          {i18n.language === 'en' ? 'ID' : 'EN'}
        </button>
        <button
          className="btn-ghost logout-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? t('dashboard_layout.light_mode') : t('dashboard_layout.dark_mode')}
          style={{ color: 'var(--neon-cyan)' }}
        >
          {theme === 'dark' ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
        </button>
        <button className="btn-ghost logout-btn" onClick={logout} title={t('dashboard_layout.logout')}>
          <HiOutlineArrowRightOnRectangle size={20} />
        </button>
      </div>
    </aside>
  );
}
