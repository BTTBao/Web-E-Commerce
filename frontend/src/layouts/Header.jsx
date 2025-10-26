// src/layouts/Header.jsx
import { Menu } from 'lucide-react';
// Import file CSS (chúng ta sẽ tạo ở Bước 4)
import './Header.css';

export default function Header({ onMenuClick }) {
  return (
    // Xóa class Tailwind, dùng class của mình
    <header className="header">
      
      {/* Nút menu cho mobile */}
      <button
        className="menu-toggle"
        onClick={onMenuClick}
      >
        <Menu  width={20} />
      </button>

      {/* Phần trống để đẩy user-info qua phải */}
      <div className="header-spacer"></div>

      {/* Thông tin user */}
      <div className="user-section">
        <div className="user-details">
          <p className="user-name">Admin User</p>
          <p className="user-role">Quản trị viên</p>
        </div>
        <div className="user-avatar">
          A
        </div>
      </div>
    </header>
  );
}