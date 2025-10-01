import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiHome, FiTruck, FiSettings, FiLogOut } from 'react-icons/fi';
import '../styles/dashboardLayout.scss';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const isDarkMode = useSelector(state => state.theme?.isDark);

  const navigationItems = [
    { path: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { path: '/tow-requests', icon: <FiTruck />, label: 'Tow Requests' },
    { path: '/settings', icon: <FiSettings />, label: 'Settings' },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
  };

  return (
    <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <img src="/images/logo.png" alt="Car Tow Logo" />
          </div>
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="icon"><FiLogOut /></span>
            <span className="label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <button className="mobile-menu-btn" onClick={toggleSidebar}>
            <FiMenu />
          </button>
          <div className="user-info">
            {/* Add user profile info here */}
          </div>
        </header>

        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;