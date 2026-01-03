import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaTrophy, 
  FaUsers, 
  FaUniversity, 
  FaGavel, 
  FaTags, 
  FaCog,
  FaChevronRight,
  FaChevronLeft,
  FaSignOutAlt
} from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { hasPermission } from '../utils/permissions';
import './styles/Sidebar.css';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userPermissions = user ? user.permissions : [];

  const allMenuItems = [
    { path: '/dashboard', icon: FaTachometerAlt, label: t('dashboard'), permission: 'dashboard' },
    { path: '/competitions', icon: FaTrophy, label: t('competitions'), permission: 'competitions' },
    { path: '/athletes', icon: FaUsers, label: t('athletes'), permission: 'athletes' },
    { path: '/clubs/admin', icon: FaUniversity, label: t('clubs'), permission: 'clubs/admin' },
    { path: '/club', icon: FaUniversity, label: t('clubs'), permission: 'club' },
    { path: '/judges', icon: FaGavel, label: t('judges'), permission: 'judges' },
    { path: '/categories', icon: FaTags, label: t('categories'), permission: 'categories' },
  ];

  // Filtra i menu items in base ai permessi dell'utente
  const menuItems = allMenuItems.filter(item => 
    hasPermission(userPermissions, item.permission)
  );

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Overlay per mobile */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={toggleSidebar}
      />
      
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* Header Account */}
      <div className="sidebar-header">
        <button 
          className="sidebar-toggle-btn" 
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
          {isOpen && <span className="sidebar-header-text">Account</span>}
        </button>
      </div>

      {/* Club Logo, Nome Utente e Nome Club */}
      <div className="sidebar-club">
        <div 
          className="sidebar-club-logo"
          title={!isOpen ? `${user?.username || 'Utente'}${user?.clubName ? `\n${user.clubName}` : ''}` : ''}
        >
          {/* Placeholder per logo club - inserire immagine reale */}
          <img 
            src="/path/to/club-logo.png" 
            alt="Club Logo" 
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="sidebar-club-logo-placeholder">
            <FaUniversity />
          </div>
        </div>
        {isOpen && (
          <div className="sidebar-club-info">
            <div className="sidebar-user-name">
              {user?.username || 'Utente'}
            </div>
            {user?.clubName && (
              <div className="sidebar-club-name">
                {user.clubName}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Menu Navigation */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item, index) => (
            <li key={index} className="nav-item">
              <NavLink 
                to={item.path} 
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
                title={!isOpen ? item.label : ''}
              >
                <item.icon className="nav-icon" />
                {isOpen && <span className="nav-label">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Separatore */}
        <div className="sidebar-separator"></div>

        {/* Impostazioni */}
        {hasPermission(userPermissions, 'settings') && (
          <ul className="nav-list">
            <li className="nav-item">
              <NavLink 
                to="/settings" 
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
                title={!isOpen ? t('settings') : ''}
              >
                <FaCog className="nav-icon" />
                {isOpen && <span className="nav-label">{t('settings')}</span>}
              </NavLink>
            </li>
          </ul>
        )}
      </nav>

      {/* Logout Button */}
      <div className="sidebar-footer">
        <button 
          className="sidebar-logout-btn" 
          onClick={handleLogout}
          title={!isOpen ? 'Logout' : ''}
        >
          <FaSignOutAlt className="nav-icon" />
          {isOpen && <span className="nav-label">Logout</span>}
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
