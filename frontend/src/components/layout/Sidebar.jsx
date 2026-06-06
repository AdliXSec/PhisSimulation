import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
  HiOutlineEllipsisVertical,
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
];

export default function Sidebar({ isOpen, onClose, isDesktopOpen = true, onToggleDesktop }) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMenuOpen && popupRef.current && !popupRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'id' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''} ${!isDesktopOpen ? 'desktop-closed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <HiOutlineShieldCheck size={28} />
            <div>
              <h2>PhiSim</h2>
              <span>Security Platform</span>
            </div>
          </div>
          {/* Desktop collapse button */}
          <button className="btn-ghost desktop-close-btn" onClick={onToggleDesktop} title={isDesktopOpen ? "Hide Sidebar" : "Expand Sidebar"}>
            {isDesktopOpen ? <HiOutlineChevronDoubleLeft size={20} /> : <HiOutlineChevronDoubleRight size={20} />}
          </button>
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
          <div className="user-info" onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} title="Menu Profil">
            <div className="user-avatar">
              {user?.full_name?.[0] || user?.username?.[0] || 'A'}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.full_name || user?.username}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>

          <div className="menu-toggle-icon" onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}>
            <HiOutlineEllipsisVertical size={20} />
          </div>
        </div>
      </aside>

      {isMenuOpen && (
        <div className={`user-menu-popup fade-in ${!isDesktopOpen ? 'minimized' : ''}`} ref={popupRef}>
          <button
            className="popup-menu-item"
            onClick={() => {
              navigate('/dashboard/profile');
              setIsMenuOpen(false);
              if (!isDesktopOpen) onClose();
            }}
          >
            <HiOutlineUser size={18} />
            Profile Management
          </button>
          <div className="popup-divider"></div>
          <button className="popup-menu-item" onClick={toggleLanguage}>
            <HiOutlineGlobeAlt size={18} />
            {i18n.language === 'en' ? 'Language: English' : 'Bahasa: Indonesia'}
          </button>
          <button className="popup-menu-item" onClick={toggleTheme}>
            {theme === 'dark' ? <HiOutlineSun size={18} /> : <HiOutlineMoon size={18} />}
            {theme === 'dark' ? t('dashboard_layout.light_mode') : t('dashboard_layout.dark_mode')}
          </button>
          <div className="popup-divider"></div>
          <button className="popup-menu-item danger" onClick={logout}>
            <HiOutlineArrowRightOnRectangle size={18} />
            {t('dashboard_layout.logout')}
          </button>
        </div>
      )}
    </>
  );
}
