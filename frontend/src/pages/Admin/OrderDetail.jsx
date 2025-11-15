// src/pages/Admin/OrderDetail.jsx

import React, { useState, useEffect } from 'react'; // <-- Thêm useEffect
import { ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import './OrderDetail.css'; // <-- Import CSS của bạn
import { toast } from 'sonner';

// --- ĐỊNH NGHĨA API (Giống như trang Orders.jsx) ---
const API_URL = 'https://localhost:7132/api/orders';

// (Giữ nguyên các labels)
const statusLabels = {
  Pending: 'Chờ xử lý',
  Confirmed: 'Đã xác nhận',
  Shipped: 'Đang giao',
  Delivered: 'Đã giao',
  Cancelled: 'Đã hủy',
};

// Định nghĩa các label cho trạng thái thanh toán
const paymentStatusLabels = {
  Pending: 'Chưa thanh toán',
  Paid: 'Đã thanh toán',
  Failed: 'Thất bại',
  Unpaid: 'Chưa thanh toán', // Thêm Unpaid nếu backend trả về
  Refunded: 'Đã hoàn tiền',
};

// --- COMPONENT CHÍNH ---
export default function OrderDetail() {
  const { orderId } = useParams(); // Lấy ID từ URL (ví dụ: 'DH00001')
  const navigate = useNavigate();

  // --- STATE ĐỂ LƯU DỮ LIỆU ---
  const [order, setOrder] = useState(null); // Lưu chi tiết đơn hàng
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State riêng cho dropdown, để người dùng thay đổi
  const [status, setStatus] = useState(''); 

  // --- 1. GỌI API ĐỂ LẤY DỮ LIỆU KHI TẢI TRANG ---
  useEffect(() => {
    if (!orderId) {
      setError('Không có ID đơn hàng.');
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`${API_URL}/${orderId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Không tìm thấy đơn hàng (Lỗi ${res.status})`);
        }
        return res.json();
      })
      .then(data => {
        setOrder(data); // Lưu dữ liệu đơn hàng vào state
        setStatus(data.status); // Cập nhật dropdown với trạng thái hiện tại
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi fetch chi tiết đơn hàng:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [orderId]); // Chỉ chạy lại nếu orderId thay đổi

  // --- 2. HÀM XỬ LÝ CẬP NHẬT TRẠNG THÁI ---
  const handleUpdateStatus = () => {
    // (Trong tương lai, bạn có thể thêm 1 state 'isUpdating' để disable nút)
    
    fetch(`${API_URL}/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      // Gửi lên trạng thái mới mà người dùng đã chọn
      body: JSON.stringify({ status: status }), 
    })
    .then(res => {
      if (!res.ok) {
        // Thử đọc lỗi JSON từ backend
        return res.json().then(err => { throw new Error(err.message || 'Cập nhật thất bại'); });
      }
      return res.json();
    })
    .then(data => {
      // Cập nhật lại trạng thái trong state 'order'
      setOrder(prevOrder => ({ ...prevOrder, status: status }));
      toast.success(data.message || 'Cập nhật trạng thái thành công!');
    })
    .catch(err => {
      console.error("Lỗi cập nhật trạng thái:", err);
      toast.error(`Lỗi: ${err.message}`);
    });
  };

  // --- 3. HÀM QUAY LẠI ---
  const handleBack = () => {
    navigate(-1); // Quay lại trang danh sách
  };

  // --- RENDER TRẠNG THÁI LOADING ---
  if (loading) {
    return (
      <div className="order-detail-container">
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft className="back-icon" />
          Quay lại
        </button>
        <p>Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  // --- RENDER TRẠNG THÁI LỖI ---
  if (error || !order) {
    return (
      <div className="order-detail-container">
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft className="back-icon" />
          Quay lại
        </button>
        <h1>Lỗi</h1>
        <p>{error || `Không tìm thấy đơn hàng với ID: ${orderId}`}</p>
      </div>
    );
  }

  // --- RENDER DỮ LIỆU THẬT TỪ API ---
  // (Đổi `order.customer` -> `order.customerName`, `order.items` -> `order.items`)
  // (Đổi `item.variant` -> `item.size`, `item.color`)
  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft className="back-icon" />
          Quay lại
        </button>
        <h1 className="order-detail-title">Chi tiết đơn hàng: {order.id}</h1>
        <div className="header-spacer-right" />
      </div>

      <div className="main-grid">
        {/* Cột trái */}
        <div className="grid-left-col">
          {/* Sản phẩm đã đặt */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Sản phẩm đã đặt</h3>
            </div>
            <div className="card-content">
              <div className="order-item-list">
                
                {/* Lấy từ `order.items` (API trả về) */}
                {order.items.map((item) => (
                  <div key={item.productId} className="order-item">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="item-image"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/80'} // Fallback
                    />
                    <div className="item-info">
                      <h3 className="item-name">{item.productName}</h3>
                      
                      {/* --- SỬA LOGIC BIẾN THỂ --- */}
                      {(item.size || item.color) && (
                        <p className="item-variant">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && ' - '}
                          {item.color && `Màu: ${item.color}`}
                        </p>
                      )}
                      
                      <p className="item-quantity">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="item-price-section">
                      <p className="item-price">{item.unitPrice.toLocaleString('vi-VN')} đ</p>
                      <p className="item-line-total">
                        Thành tiền: {item.subTotal.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tạm thời ẩn phần summary này vì DTO chi tiết không có
                  (Bạn có thể tự tính tổng subTotal từ mảng items nếu muốn)
                  <div className="summary-section">
                    ...
                  </div> 
              */}
              <div className="summary-section">
                <div className="summary-row total">
                  <span>Tổng cộng:</span>
                  <span>{order.total.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Cột phải */}
        <div className="grid-right-col">
          {/* Thông tin khách hàng (Lấy từ shippingAddress) */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Thông tin khách hàng</h3>
            </div>
            <div className="card-content info-card-content">
              <div className="info-row">
                <p className="info-label">Tên người nhận</p>
                <p className="info-value">{order.shippingAddress?.receiverFullName || 'N/A'}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Số điện thoại</p>
                <p className="info-value">{order.shippingAddress?.receiverPhone || order.customerPhone || 'N/A'}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Email đặt hàng</p>
                <p className="info-value">{order.customerEmail || 'N/A'}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Địa chỉ giao hàng</p>
                <p className="info-value">
                  {/* Ghép địa chỉ lại */}
                  {[
                    order.shippingAddress?.addressLine,
                    order.shippingAddress?.ward,
                    order.shippingAddress?.district,
                    order.shippingAddress?.province
                  ].filter(Boolean).join(', ') || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin đơn hàng */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Thông tin đơn hàng</h3>
            </div>
            <div className="card-content info-card-content">
              <div className="info-row">
                <p className="info-label">Mã đơn hàng</p>
                <p className="info-value">{order.id}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Ngày đặt</p>
                <p className="info-value">
                  {new Date(order.date).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin thanh toán */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Thông tin thanh toán</h3>
            </div>
            <div className="card-content info-card-content">
              <div className="info-row">
                <p className="info-label">Phương thức</p>
                <p className="info-value">{order.paymentMethod || 'N/A'}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Trạng thái thanh toán</p>
                <span className={`badge ${
                  order.paymentStatus === 'Paid' ? 'badge-green' : 'badge-orange'
                }`}>
                  {paymentStatusLabels[order.paymentStatus] || order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Cập nhật trạng thái */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Cập nhật trạng thái</h3>
            </div>
            <div className="card-content info-card-content">
              <div className="info-row">
                <p className="info-label" style={{ marginBottom: '8px' }}>
                  Trạng thái đơn hàng
                </p>
                <select
                  className="filter-select"
                  style={{ width: '100%' }} 
                  value={status} // <-- Lấy từ state
                  onChange={(e) => setStatus(e.target.value)} // <-- Cập nhật state
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* GỌI HÀM CẬP NHẬT MỚI */}
              <button 
                className="button-primary full-width"
                onClick={handleUpdateStatus}
              >
                Cập nhật trạng thái
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}