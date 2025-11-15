import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Search, Lock, Unlock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import './Vouchers.css';
import './CustomerList.css';

const API_URL = 'https://localhost:7132/api/customers';

export default function CustomerList() {
  const [allCustomers, setAllCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // ---------------------------
  // PHÂN TRANG
  // ---------------------------
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // ---------------------------
  // LOAD DATA
  // ---------------------------
  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error('Không thể tải danh sách khách hàng.');
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
  }, []);

  // ---------------------------
  // LỌC KHÁCH HÀNG
  // ---------------------------
  const filteredCustomers = useMemo(() =>
    allCustomers.filter(customer => {
      const s = searchTerm.toLowerCase();
      return (
        customer.email.toLowerCase().includes(s) ||
        (customer.fullName && customer.fullName.toLowerCase().includes(s)) ||
        (customer.phone && customer.phone.includes(s))
      );
    }),
    [allCustomers, searchTerm]
  );

  // ---------------------------
  // PHÂN TRANG – TÍNH TOÁN
  // ---------------------------
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Nếu tìm kiếm → reset về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // ---------------------------
  // HÀM KHÓA / MỞ KHÓA
  // ---------------------------
  const handleToggleStatus = (customerId) => {
    fetch(`${API_URL}/${customerId}/toggle-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => {
        if (!res.ok) throw new Error('Cập nhật trạng thái thất bại.');
        return res.json();
      })
      .then(data => {
        setAllCustomers(prev =>
          prev.map(c =>
            c.id === customerId ? { ...c, isActive: data.newStatus } : c
          )
        );
      })
      .catch(err => console.error(err));
  };

  const handleViewCustomer = (id) => navigate(`/admin/customers/${id}`);

  // ---------------------------
  // RENDER
  // ---------------------------
  if (loading) return <div className="page-container">Đang tải dữ liệu khách hàng...</div>;
  if (error) return <div className="page-container error-message">Lỗi: {error}</div>;

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
                {currentCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.email}</td>
                    <td>{customer.phone || 'N/A'}</td>
                    <td>{customer.fullName || 'N/A'}</td>
                    <td>{new Date(customer.registeredDate).toLocaleDateString('vi-VN')}</td>
                    <td>{customer.totalOrders}</td>
                    <td>
                      <span className={`badge ${customer.isActive ? 'badge-green' : 'badge-red'}`}>
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

          {/* ---------------------------
              PHÂN TRANG – FOOTER
          --------------------------- */}
          <div className="pagination-footer">
            <span className="pagination-summary">
              Hiển thị <strong>{indexOfFirstItem + 1}</strong> -
              <strong>{Math.min(indexOfLastItem, filteredCustomers.length)}</strong> /
              <strong>{filteredCustomers.length}</strong> khách hàng
            </span>

            <div className="pagination-controls">
              <button
                className={`page-btn ${currentPage === 1 ? "disabled" : ""}`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                «
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    className={`page-number ${currentPage === page ? "active" : ""}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                className={`page-btn ${currentPage === totalPages ? "disabled" : ""}`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                »
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
