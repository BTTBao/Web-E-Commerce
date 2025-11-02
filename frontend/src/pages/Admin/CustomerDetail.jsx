// src/pages/Admin/CustomerDetail.jsx

import React from 'react';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

// Import file CSS (Cần file CSS chung VÀ file CSS riêng)
import './Vouchers.css'; // Dùng chung .card, .table, .badge...
import './CustomerDetail.css'; // Dùng cho style riêng của trang này

// Dữ liệu mẫu (giữ nguyên)
const customerData = {
  U001: {
    id: 'U001',
    username: 'nguyenvana',
    email: 'nguyenvana@email.com',
    phone: '0901234567',
    fullName: 'Nguyễn Văn A',
    registeredDate: '2025-01-15',
    isActive: true,
    addresses: [
      { id: 1, name: 'Địa chỉ nhà riêng', address: '123 Nguyễn Huệ, Quận 1, TP.HCM', phone: '0901234567', isDefault: true },
      { id: 2, name: 'Địa chỉ công ty', address: '456 Lê Lợi, Quận 3, TP.HCM', phone: '0901234567', isDefault: false },
    ],
    orders: [
      { id: 'DH001', date: '2025-10-25', total: 1500000, status: 'Delivered' },
      { id: 'DH015', date: '2025-10-18', total: 2300000, status: 'Delivered' },
      { id: 'DH032', date: '2025-10-10', total: 890000, status: 'Delivered' },
    ],
  },
  // Thêm data cho các user khác nếu cần
};

// Hàm lấy class CSS
const getStatusColor = (status) => {
  switch (status) {
    case 'Pending': return 'badge-orange';
    case 'Confirmed': return 'badge-blue';
    case 'Shipped': return 'badge-purple'; // Cần định nghĩa .badge-purple
    case 'Delivered': return 'badge-green';
    case 'Cancelled': return 'badge-red';
    default: return 'badge-gray';
  }
};

// Hàm lấy text
const getStatusLabel = (status) => {
  switch (status) {
    case 'Pending': return 'Chờ xử lý';
    case 'Confirmed': return 'Đã xác nhận';
    case 'Shipped': return 'Đang giao';
    case 'Delivered': return 'Đã giao';
    case 'Cancelled': return 'Đã hủy';
    default: return status;
  }
};

// Bỏ props, dùng hook
export default function CustomerDetail() {
  const { customerId } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate(); // Dùng để quay lại
  
  // Lấy data khách hàng
  const customer = customerId ? customerData[customerId] : null;

  const handleBack = () => {
    navigate(-1); // Quay lại trang trước
  };

  if (!customer) {
    return (
      <div className="page-container">
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft className="back-icon" />
          Quay lại
        </button>
        <p>Không tìm thấy khách hàng với ID: {customerId}</p>
      </div>
    );
  }

  // Tính toán
  const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0);
  const avgOrderValue = totalSpent > 0 ? totalSpent / customer.orders.length : 0;

  return (
    <div className="page-container">
      <div className="order-detail-header">
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft className="back-icon" />
          Quay lại
        </button>
        <h1 className="order-detail-title">Chi tiết khách hàng</h1>
        <div className="header-spacer-right" />
      </div>

      <div className="main-grid">
        {/* Cột trái */}
        <div className="grid-left-col">
          {/* Lịch sử đơn hàng */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Lịch sử đơn hàng</h3>
            </div>
            <div className="card-content">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Mã ĐH</th>
                      <th>Ngày đặt</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{new Date(order.date).toLocaleDateString('vi-VN')}</td>
                        <td>{order.total.toLocaleString('vi-VN')} đ</td>
                        <td>
                          <span className={`badge ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Địa chỉ</h3>
            </div>
            <div className="card-content address-list">
              {customer.addresses.map((address) => (
                <div key={address.id} className="address-block">
                  <div className="address-header">
                    <h4 className="address-name">{address.name}</h4>
                    {address.isDefault && (
                      <span className="badge badge-blue">Mặc định</span>
                    )}
                  </div>
                  <div className="address-details">
                    <div className="address-line">
                      <MapPin width={16} height={16} />
                      <span>{address.address}</span>
                    </div>
                    <div className="address-line">
                      <Phone width={16} height={16} />
                      <span>{address.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cột phải */}
        <div className="grid-right-col">
          {/* Thông tin khách hàng */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Thông tin khách hàng</h3>
            </div>
            <div className="card-content info-card-content">
              <div className="info-row">
                <p className="info-label">Họ tên</p>
                <p className="info-value">{customer.fullName}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Username</p>
                <p className="info-value">{customer.username}</p>
              </div>
              <div className="info-row-icon">
                <Mail width={16} height={16} className="info-icon" />
                <div className="info-text-group">
                  <p className="info-label">Email</p>
                  <p className="info-value">{customer.email}</p>
                </div>
              </div>
              <div className="info-row-icon">
                <Phone width={16} height={16} className="info-icon" />
                <div className="info-text-group">
                  <p className="info-label">Số điện thoại</p>
                  <p className="info-value">{customer.phone}</p>
                </div>
              </div>
              <div className="info-row">
                <p className="info-label">Ngày đăng ký</p>
                <p className="info-value">{new Date(customer.registeredDate).toLocaleDateString('vi-VN')}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Trạng thái</p>
                <span className={`badge ${customer.isActive ? 'badge-green' : 'badge-red'}`}>
                  {customer.isActive ? 'Hoạt động' : 'Đã khóa'}
                </span>
              </div>
            </div>
          </div>

          {/* Thống kê */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Thống kê</h3>
            </div>
            <div className="card-content info-card-content">
              <div className="info-row">
                <p className="info-label">Tổng đơn hàng</p>
                <p className="stats-value">{customer.orders.length}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Tổng chi tiêu</p>
                <p className="stats-value">{totalSpent.toLocaleString('vi-VN')} đ</p>
              </div>
              <div className="info-row">
                <p className="info-label">Giá trị trung bình</p>
                <p className="stats-value">{avgOrderValue.toLocaleString('vi-VN')} đ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}