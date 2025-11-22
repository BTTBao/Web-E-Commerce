// src/layouts/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingCart, Package, FolderTree, 
  Users, Tag, MessageSquare, X , Star, LogOut
} from 'lucide-react';
// Import file CSS (chúng ta sẽ tạo ở Bước 6)
import './Sidebar.css';

const menuItems = [
 { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { id: 'orders', label: 'Quản lý Đơn hàng', icon: ShoppingCart, path: '/admin/orders' },
  { id: 'products', label: 'Quản lý Sản phẩm', icon: Package, path: '/admin/products' },
  { id: 'categories', label: 'Quản lý Danh mục', icon: FolderTree, path: '/admin/categories' },
  { id: 'customers', label: 'Quản lý Khách hàng', icon: Users, path: '/admin/customers' },
  { id: 'vouchers', label: 'Quản lý Vouchers', icon: Tag, path: '/admin/vouchers' },
  { id: 'reviews', label: 'Quản lý Đánh giá', icon: Star, path: '/admin/reviews' },
  { id: 'chat', label: 'Hỗ trợ Trực tuyến', icon: MessageSquare, path: '/admin/chat' },
  { id: 'logout', label: 'Đăng xuất', icon: LogOut, action: 'logout' },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();

  return (
    // Thêm class 'open' khi sidebarOpen là true
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          {/* Bạn có thể thay icon ở đây */}
          <LayoutDashboard color="#fff" />
          <div style={{ color: 'white' }}>Admin Panel</div>
        </div>
        {/* Nút đóng cho mobile */}
        <button
          className="sidebar-close-btn"
          onClick={() => setSidebarOpen(false)}
        >
          <X height={20} width={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                           (item.path !== '/admin' && location.pathname.startsWith(item.path));
          if(item.action === 'logout')
          {
            return (
              <button
                key={item.id}
                className="nav-link"
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('account');
                  setSidebarOpen(false);
                  window.location.href = '/login';
                }}
              >
                <Icon className="nav-icon" />
                <span>{item.label}</span>
              </button>
            );
          }
          return (
            // Dùng class 'active'
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-icon" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}