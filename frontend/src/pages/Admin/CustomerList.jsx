import React, { useState, useEffect, useMemo } from 'react'; // Thêm useState, useEffect
import { Eye, Search, Lock, Unlock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import CSS
import './Vouchers.css';
import './CustomerList.css';

// --- CẤU HÌNH API ---
// (Sử dụng port 7132 mà bạn đã đề cập ở các lỗi trước)
const API_URL = 'https://localhost:7132/api/customers';

export default function CustomerList() {
  // --- STATE MỚI ---
  const [allCustomers, setAllCustomers] = useState([]); // State cho danh sách gốc
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- 1. [EFFECT] GỌI API ĐỂ LẤY DỮ LIỆU ---
  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then(res => {
        if (!res.ok) {
          throw new Error('Không thể tải danh sách khách hàng. Lỗi CORS hoặc server sập?');
        }
        return res.json();
      })
      .then(data => {
        setAllCustomers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi fetch:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []); // [] = Chỉ chạy 1 lần khi component mount

  // --- 2. [HÀM] GỌI API ĐỂ KHÓA/MỞ KHÓA ---
  const handleToggleStatus = (customerId) => {
    // Tìm customer hiện tại để biết trạng thái của nó
    const customer = allCustomers.find(c => c.id === customerId);
    if (!customer) return;

    // Gửi yêu cầu PATCH đến API
    fetch(`${API_URL}/${customerId}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('Cập nhật trạng thái thất bại.');
      }
      return res.json();
    })
    .then(data => {
      // data trả về là { newStatus: true/false }
      
      // Cập nhật lại state của `allCustomers`
      setAllCustomers(prevCustomers =>
        prevCustomers.map(c =>
          c.id === customerId
            ? { ...c, isActive: data.newStatus } // Cập nhật trạng thái mới
            : c
        )
      );
    })
    .catch(err => {
      console.error('Lỗi khi cập nhật trạng thái:', err);
      // (Trong tương lai, bạn có thể thêm thông báo toast tại đây)
    });
  };

  // Logic lọc (dùng state 'allCustomers' thay vì mock data)
  const filteredCustomers = useMemo(() => 
    allCustomers.filter((customer) => {
      const search = searchTerm.toLowerCase();
      // (Dùng 'email' thay cho 'username' vì DB của bạn không có username)
      return (
        customer.email.toLowerCase().includes(search) ||
        (customer.fullName && customer.fullName.toLowerCase().includes(search)) ||
        (customer.phone && customer.phone.includes(search))
      );
    }),
    [allCustomers, searchTerm]
  );

  // Hàm điều hướng (giữ nguyên)
  const handleViewCustomer = (customerId) => {
    navigate(`/admin/customers/${customerId}`);
  };

  // --- RENDER ---
  
  if (loading) {
    return <div className="page-container">Đang tải dữ liệu khách hàng...</div>;
  }

  if (error) {
    return <div className="page-container error-message">Lỗi: {error}</div>;
  }

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
              placeholder="Tìm kiếm theo email, họ tên, số điện thoại..."
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
                  <th>Email (Username)</th>
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
                    <td>{customer.email}</td>
                    <td>{customer.phone || 'N/A'}</td>
                    <td>{customer.fullName || 'N/A'}</td>
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
                        {/* Cập nhật onClick cho nút Khóa/Mở */}
                        <button 
                          className="action-button"
                          onClick={() => handleToggleStatus(customer.id)}
                        >
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