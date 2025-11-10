// src/pages/Admin/Orders.jsx

import React, { useState, useEffect } from 'react'; // <--- 1. Thêm useState, useEffect
import { Eye, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Orders.css';

// --- 2. ĐỊNH NGHĨA API URL (Bạn hãy thay đổi cho đúng) ---
const API_URL = 'https://localhost:7132/api/orders';

// (Xóa mảng dữ liệu mẫu 'orders' ở đây)

// Giữ nguyên các đối tượng mapping
const statusColors = {
  Pending: 'status-pending',
  Confirmed: 'status-confirmed',
  Shipped: 'status-shipped',
  Delivered: 'status-delivered',
  Cancelled: 'status-cancelled',
};

const statusLabels = {
  Pending: 'Chờ xử lý',
  Confirmed: 'Đã xác nhận',
  Shipped: 'Đang giao',
  Delivered: 'Đã giao',
  Cancelled: 'Đã hủy',
};

const paymentStatusLabels = {
  Unpaid: 'Chưa thanh toán',
  Paid: 'Đã thanh toán',
  Refunded: 'Đã hoàn tiền',
};


export default function Orders() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // --- 3. THÊM STATE ĐỂ LƯU DỮ LIỆU TỪ API ---
  const [orders, setOrders] = useState([]); // State cho danh sách đơn hàng
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 4. GỌI API KHI COMPONENT TẢI LẦN ĐẦU ---
  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then(res => {
        if (!res.ok) {
          throw new Error('Không thể tải danh sách đơn hàng.');
        }
        return res.json();
      })
      .then(data => {
        setOrders(data); // Cập nhật state với dữ liệu từ API
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi fetch:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []); // [] = Chỉ chạy 1 lần

  // Logic lọc (giờ sẽ dùng 'orders' từ state)
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()); // <-- Lưu ý: đổi 'customer' thành 'customerName' hoặc tên trường đúng từ API
    return matchesStatus && matchesSearch;
  });

  const handleViewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  // --- 5. THÊM HIỂN THỊ TRẠNG THÁI LOADING VÀ LỖI ---
  if (loading) {
    return <div className="orders-container">Đang tải dữ liệu đơn hàng...</div>;
  }

  if (error) {
    return <div className="orders-container error-message">Lỗi: {error}</div>;
  }

  // --- Giao diện giữ nguyên, chỉ thay đổi nguồn dữ liệu ---
  return (
    <div className="orders-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Đơn hàng</h1>
          <p className="page-subtitle">Theo dõi và quản lý tất cả đơn hàng</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="filter-bar">
            <div className="search-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã đơn hàng hoặc tên khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Pending">Chờ xử lý</option>
              <option value="Confirmed">Đã xác nhận</option>
              <option value="Shipped">Đang giao</option>
              <option value="Delivered">Đã giao</option>
              <option value="Cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="card-content">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mã ĐH</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái ĐH</th>
                  <th>Thanh toán</th>
                  <th className="text-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {/* 6. Kiểm tra nếu không có đơn hàng */}
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center' }}>
                      Không tìm thấy đơn hàng nào.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      {/* 7. Đảm bảo tên trường khớp với API (ví dụ: customerName) */}
                      <td>{order.customerName || 'N/A'}</td>
                      <td>{new Date(order.date).toLocaleDateString('vi-VN')}</td>
                      <td>{order.total.toLocaleString('vi-VN')} đ</td>
                      <td>
                        <span className={`badge ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </td>
                      <td>
                        <span className="payment-status">
                          {paymentStatusLabels[order.paymentStatus]}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          className="action-button"
                          onClick={() => handleViewOrder(order.id)}
                        >
                          <Eye className="action-icon" />
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}