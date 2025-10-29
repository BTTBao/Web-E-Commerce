// src/layouts/AdminLayout.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header'; 

// Import file CSS (chúng ta sẽ tạo file này ở Bước 2)
import './AdminLayout.css'; 

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // Xóa class Tailwind, dùng class của mình
    <div className="admin-layout"> 
      
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />

      {/* Overlay cho mobile */}
      {sidebarOpen && (
        <div 
          className="layout-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="main-content">
        
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}