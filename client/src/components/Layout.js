import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import HeaderMenu from './HeaderMenu';
import './styles/Layout.css';

const Layout = ({ user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Su mobile forza chiusura sidebar
      if (mobile) {
        setSidebarOpen(false);
      } else {
        // Su desktop apri la sidebar
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="layout">
      {!user && (
        <Header />
      )}
      
      {user && isMobile && (
        <HeaderMenu onMenuClick={toggleSidebar} />
      )}
      
      {user && (
        <Sidebar 
          isOpen={sidebarOpen} 
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
          onNavigate={closeSidebar}
        />
      )}

      <div className={`layout-content ${user ? (isMobile ? 'with-header-menu' : (sidebarOpen ? 'with-sidebar-open' : 'with-sidebar-closed')) : ''}`}>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
