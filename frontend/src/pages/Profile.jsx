import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();

  const HandleExit = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('account');
    navigate('/login');
  };
  const user = JSON.parse(localStorage.getItem('account')) || {};

  return (
    <div className="container py-5" style={{ maxWidth: '500px' }}>
      <div className="card shadow-sm p-4 rounded-3" style={{ backgroundColor: '#f8f9fa' }}>
        <h3 className="mb-4 text-center" style={{ fontWeight: '700', color: '#222' }}>Trang cá nhân</h3>
        
        <div className="d-flex align-items-center mb-4">
          <img
            src={user.user?.AvatarURL || '/default-avatar.png'}
            alt="Avatar"
            style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginRight: 20 }}
          />
          <div>
            <h5 className="mb-1" style={{ fontWeight: '600' }}>{user.username || 'Username'}</h5>
            <p className="mb-0 text-muted">{user.user?.FullName || 'Full Name'}</p>
          </div>
        </div>

        <div className="mb-3">
          <strong>Email:</strong> <span>{user.email || 'Chưa cập nhật'}</span>
        </div>

        <div className="mb-3">
          <strong>Số điện thoại:</strong> <span>{user.phone || 'Chưa cập nhật'}</span>
        </div>

        <div className="mb-4">
          <strong>Vai trò:</strong> <span>{user.role || 'Khách'}</span>
        </div>

        <button
          onClick={HandleExit}
          className="btn btn-dark w-100"
          style={{ fontWeight: '600', letterSpacing: '1px' }}
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
