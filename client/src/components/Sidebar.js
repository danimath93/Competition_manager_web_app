import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaTrophy, 
  FaUsers, 
  FaUniversity, 
  FaGavel, 
  FaTags, 
  FaCog 
} from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  const menuItems = [
    { path: '/dashboard', icon: FaTachometerAlt, label: t('dashboard') },
    { path: '/competitions', icon: FaTrophy, label: t('competitions') },
    { path: '/athletes', icon: FaUsers, label: t('athletes') },
    { path: '/clubs', icon: FaUniversity, label: t('clubs') },
    { path: '/judges', icon: FaGavel, label: t('judges') },
    { path: '/categories', icon: FaTags, label: t('categories') },
    { path: '/settings', icon: FaCog, label: t('settings') },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item, index) => (
              <li key={index} className="nav-item">
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => 
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                  onClick={onClose}
                >
                  <item.icon className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
