import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import './styles/Layout.css';

const Layout = ({ user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      // Su mobile forza chiusura sidebar
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    // Permetti toggle solo su desktop
    if (!isMobile) {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <div className="layout">
      {!user && (
        <Header />
      )}
      
      {user && (
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      )}

      <div className={`layout-content ${user ? (sidebarOpen ? 'with-sidebar-open' : 'with-sidebar-closed') : ''}`}>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
