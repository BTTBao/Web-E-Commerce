// src/pages/Admin/CustomerList.jsx

import React, { useState } from 'react';
import { Eye, Search, Lock, Unlock } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Thêm hook

// Import file CSS chung VÀ file CSS riêng
import './Vouchers.css'; // Dùng chung .card, .table, .badge, .search-input...
import './CustomerList.css'; // Dùng cho .badge-red

// Dữ liệu mẫu (giữ nguyên)
const customers = [
  {
    id: 'U001',
    username: 'nguyenvana',
    email: 'nguyenvana@email.com',
    phone: '0901234567',
    fullName: 'Nguyễn Văn A',
    registeredDate: '2025-01-15',
    isActive: true,
    totalOrders: 12,
  },
  {
    id: 'U002',
    username: 'tranthib',
    email: 'tranthib@email.com',
    phone: '0912345678',
    fullName: 'Trần Thị B',
    registeredDate: '2025-02-20',
    isActive: true,
    totalOrders: 8,
  },
  {
    id: 'U003',
    username: 'levanc',
    email: 'levanc@email.com',
    phone: '0923456789',
    fullName: 'Lê Văn C',
    registeredDate: '2025-03-10',
    isActive: true,
    totalOrders: 5,
  },
  {
    id: 'U004',
    username: 'phamthid',
    email: 'phamthid@email.com',
    phone: '0934567890',
    fullName: 'Phạm Thị D',
    registeredDate: '2025-04-05',
    isActive: false,
    totalOrders: 3,
  },
  {
    id: 'U005',
    username: 'hoangvane',
    email: 'hoangvane@email.com',
    phone: '0945678901',
    fullName: 'Hoàng Văn E',
    registeredDate: '2025-05-12',
    isActive: true,
    totalOrders: 15,
  },
];

// Bỏ props, dùng hook
export default function CustomerList() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate(); // Khởi tạo hook

  // Logic lọc (giữ nguyên)
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    return matchesSearch;
  });

  // Hàm điều hướng mới
  const handleViewCustomer = (customerId) => {
    navigate(`/admin/customers/${customerId}`); // Cần router cho '/admin/customers/:id'
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Khách hàng</h1>
          <p className="page-subtitle">Quản lý thông tin và lịch sử khách hàng</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        <div className="card-content">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Họ tên</th>
                  <th>Ngày đăng ký</th>
                  <th>Đơn hàng</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.username}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.fullName}</td>
                    <td>{new Date(customer.registeredDate).toLocaleDateString('vi-VN')}</td>
                    <td>{customer.totalOrders}</td>
                    <td>
                      <span
                        className={`badge ${
                          customer.isActive ? 'badge-green' : 'badge-red'
                        }`}
                      >
                        {customer.isActive ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons">
                        <button
                          className="action-button"
                          onClick={() => handleViewCustomer(customer.id)}
                        >
                          <Eye width={16} height={16} />
                          Xem
                        </button>
                        <button className="action-button">
                          {customer.isActive ? (
                            <>
                              <Lock width={16} height={16} />
                              Khóa
                            </>
                          ) : (
                            <>
                              <Unlock width={16} height={16} />
                              Mở khóa
                            </>
                          )}
                        </button>
                      </div>
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