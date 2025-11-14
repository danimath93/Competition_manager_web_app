import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import Header from './Header';
import Sidebar from './Sidebar';
import './styles/Layout.css';

const Layout = ({ user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="layout">
      <Header />
      
      {user && (
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      )}

      <div className={`layout-content ${user ? 'with-sidebar' : ''}`}>
        {user && (
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <FaBars />
          </button>
        )}
        
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
