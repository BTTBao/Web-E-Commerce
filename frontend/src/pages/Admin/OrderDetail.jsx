// src/pages/Admin/OrderDetail.jsx

import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
// THÊM 2 DÒNG NÀY:
import { useParams, useNavigate } from 'react-router-dom';

// Dữ liệu mẫu
const orderDetails = {
  DH001: {
    id: 'DH001',
    customer: 'Nguyễn Văn A',
    phone: '0901234567',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    date: '2025-10-25 14:30',
    note: 'Giao giờ hành chính',
    status: 'Pending',
    paymentMethod: 'COD',
    paymentStatus: 'Unpaid',
    items: [
      { id: 1, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', name: 'iPhone 15 Pro Max', variant: '256GB - Titan Tự nhiên', quantity: 1, price: 29990000 },
      { id: 2, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f', name: 'AirPods Pro 2', variant: null, quantity: 2, price: 6990000 },
    ],
    subtotal: 43970000,
    shipping: 30000,
    discount: 0,
    total: 44000000,
  },
  // Bạn có thể thêm data cho DH002, DH003... ở đây
  DH002: {
    id: 'DH002',
    customer: 'Trần Thị B',
    phone: '0901234568',
    address: '456 Lê Lợi, Quận 3, TP.HCM',
    date: '2025-10-25 10:00',
    note: '',
    status: 'Confirmed',
    paymentMethod: 'Chuyển khoản',
    paymentStatus: 'Paid',
    items: [
      { id: 1, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', name: 'Samsung Galaxy S24', variant: '128GB - Đen', quantity: 1, price: 23000000 },
    ],
    subtotal: 23000000,
    shipping: 0,
    discount: 0,
    total: 23000000,
  },
};

const statusLabels = {
  Pending: 'Chờ xử lý',
  Confirmed: 'Đã xác nhận',
  Shipped: 'Đang giao',
  Delivered: 'Đã giao',
  Cancelled: 'Đã hủy',
};

// Import file CSS (giữ nguyên)
import './OrderDetail.css';

// XÓA BỎ PROPS (orderId, onBack)
export default function OrderDetail() {
  // SỬ DỤNG HOOKS CỦA REACT ROUTER
  const { orderId } = useParams(); // Lấy 'orderId' (ví dụ: 'DH001') từ URL
  const navigate = useNavigate(); // Dùng để điều hướng (quay lại)

  // SỬA LẠI LOGIC LẤY ORDER
  // Lấy order dựa trên orderId từ URL
  const order = orderId ? orderDetails[orderId] : null; 
  const [status, setStatus] = useState(order ? order.status : 'Pending');

  // HÀM MỚI ĐỂ QUAY LẠI
  const handleBack = () => {
    navigate(-1); // Quay lại trang trước đó (trang danh sách Orders)
  };

  if (!order) {
    return (
      <div className="order-detail-container">
        {/* SỬ DỤNG HÀM MỚI */}
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft className="back-icon" />
          Quay lại
        </button>
        {/* Cập nhật thông báo lỗi */}
        <p>Không tìm thấy đơn hàng với ID: {orderId}</p>
      </div>
    );
  }

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        {/* SỬ DỤNG HÀM MỚI */}
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft className="back-icon" />
          Quay lại
        </button>
        <h1 className="order-detail-title">Chi tiết đơn hàng: {order.id}</h1>
        <div className="header-spacer-right" />
      </div>

      {/* TOÀN BỘ PHẦN BÊN DƯỚI (main-grid, card...) GIỮ NGUYÊN
        VÌ BẠN ĐÃ SỬA LỖI ESLINT (DÙNG Object.entries) RỒI
      */}

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
                {order.items.map((item) => (
                  <div key={item.id} className="order-item">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="item-image"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/80'} // Fallback
                    />
                    <div className="item-info">
                      <h3 className="item-name">{item.name}</h3>
                      {item.variant && (
                        <p className="item-variant">{item.variant}</p>
                      )}
                      <p className="item-quantity">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="item-price-section">
                      <p className="item-price">{item.price.toLocaleString('vi-VN')} đ</p>
                      <p className="item-line-total">
                        Thành tiền: {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-section">
                <div className="summary-row">
                  <span>Tạm tính:</span>
                  <span>{order.subtotal.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="summary-row">
                  <span>Phí vận chuyển:</span>
                  <span>{order.shipping.toLocaleString('vi-VN')} đ</span>
                </div>
                {order.discount > 0 && (
                  <div className="summary-row discount">
                    <span>Giảm giá:</span>
                    <span>-{order.discount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
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
          {/* Thông tin khách hàng */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Thông tin khách hàng</h3>
            </div>
            <div className="card-content info-card-content">
              <div className="info-row">
                <p className="info-label">Tên khách hàng</p>
                <p className="info-value">{order.customer}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Số điện thoại</p>
                <p className="info-value">{order.phone}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Địa chỉ giao hàng</p>
                <p className="info-value">{order.address}</p>
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
                <p className="info-value">{order.date}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Ghi chú</p>
                <p className="info-value">{order.note || 'Không có'}</p>
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
                <p className="info-value">{order.paymentMethod}</p>
              </div>
              <div className="info-row">
                <p className="info-label">Trạng thái thanh toán</p>
                <span className="badge badge-orange">
                  {order.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
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
                <p className="info-label" style={{ marginBottom: '8px' }}>Trạng thái hiện tại</p>
                <select
                  className="filter-select" // Dùng chung class với trang Orders
                  style={{ width: '100%' }} // Style cho nó full-width
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {/* Dùng Object.entries để fix lỗi ESLint */}
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <button className="button-primary full-width">
                Cập nhật trạng thái
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}