import React, { useState } from 'react';
import { FaBars } from 'react-icons/fa';
import Header from './Header';
import Sidebar from './Sidebar';
import './styles/Layout.css';

const Layout = ({ children }) => {
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
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className="layout-content">
        <button 
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <FaBars />
        </button>
        
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
