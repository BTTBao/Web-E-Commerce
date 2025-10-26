// src/pages/Admin/Orders.jsx

import React, { useState } from 'react';
import { Eye, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Import file CSS (sẽ tạo ở bước 2)
import './Orders.css';

// Dữ liệu mẫu (giữ nguyên)
const orders = [
  {
    id: 'DH001',
    customer: 'Nguyễn Văn A',
    date: '2025-10-25',
    total: 1500000,
    status: 'Pending',
    paymentStatus: 'Unpaid',
  },
  {
    id: 'DH002',
    customer: 'Trần Thị B',
    date: '2025-10-25',
    total: 2300000,
    status: 'Confirmed',
    paymentStatus: 'Paid',
  },
  {
    id: 'DH003',
    customer: 'Lê Văn C',
    date: '2025-10-24',
    total: 890000,
    status: 'Shipped',
    paymentStatus: 'Paid',
  },
  {
    id: 'DH004',
    customer: 'Phạm Thị D',
    date: '2025-10-24',
    total: 3200000,
    status: 'Delivered',
    paymentStatus: 'Paid',
  },
  {
    id: 'DH005',
    customer: 'Hoàng Văn E',
    date: '2025-10-23',
    total: 1750000,
    status: 'Cancelled',
    paymentStatus: 'Refunded',
  },
  {
    id: 'DH006',
    customer: 'Đỗ Thị F',
    date: '2025-10-23',
    total: 4500000,
    status: 'Pending',
    paymentStatus: 'Unpaid',
  },
  {
    id: 'DH007',
    customer: 'Vũ Văn G',
    date: '2025-10-22',
    total: 2100000,
    status: 'Confirmed',
    paymentStatus: 'Paid',
  },
  {
    id: 'DH008',
    customer: 'Bùi Thị H',
    date: '2025-10-22',
    total: 1250000,
    status: 'Shipped',
    paymentStatus: 'Paid',
  },
];

// Thay thế các class Tailwind bằng class CSS thuần
const statusColors = {
  Pending: 'status-pending',
  Confirmed: 'status-confirmed',
  Shipped: 'status-shipped',
  Delivered: 'status-delivered',
  Cancelled: 'status-cancelled',
};

// Giữ nguyên để hiển thị text
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

  // Logic lọc (giữ nguyên)
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleViewOrder = (orderId) => {
    // Điều hướng đến trang chi tiết
    navigate(`/admin/orders/${orderId}`);
  };

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
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}