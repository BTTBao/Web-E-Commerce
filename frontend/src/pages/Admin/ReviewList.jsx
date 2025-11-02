// src/pages/Admin/ReviewList.jsx

import React, { useState } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';

// Import file CSS (Cần file CSS chung VÀ file CSS riêng)
import './Vouchers.css'; // Dùng chung .card, .table, .badge, .filter-select...
import './ReviewList.css'; // Dùng cho style riêng của trang này

// Dữ liệu mẫu (giữ nguyên)
const reviews = [
  {
    id: 'R001',
    product: 'iPhone 15 Pro Max',
    customer: 'Nguyễn Văn A',
    rating: 5,
    comment: 'Sản phẩm tuyệt vời! Chất lượng rất tốt, giao hàng nhanh.',
    date: '2025-10-25',
    status: 'Pending',
  },
  {
    id: 'R002',
    product: 'Samsung Galaxy S24 Ultra',
    customer: 'Trần Thị B',
    rating: 4,
    comment: 'Máy đẹp, camera chụp ảnh đẹp. Giá hơi cao.',
    date: '2025-10-24',
    status: 'Approved',
  },
  {
    id: 'R003',
    product: 'Laptop Dell XPS 15',
    customer: 'Lê Văn C',
    rating: 5,
    comment: 'Laptop mạnh mẽ, phù hợp cho công việc đồ họa.',
    date: '2025-10-23',
    status: 'Approved',
  },
  {
    id: 'R004',
    product: 'AirPods Pro 2',
    customer: 'Phạm Thị D',
    rating: 4,
    comment: 'Tai nghe chất lượng, chống ồn tốt.',
    date: '2025-10-22',
    status: 'Pending',
  },
  {
    id: 'R005',
    product: 'iPad Air M2',
    customer: 'Hoàng Văn E',
    rating: 5,
    comment: 'iPad rất mượt mà, màn hình đẹp.',
    date: '2025-10-21',
    status: 'Approved',
  },
  {
    id: 'R006',
    product: 'iPhone 15 Pro Max',
    customer: 'Đỗ Thị F',
    rating: 2,
    comment: 'Sản phẩm kém, không giống như mô tả.',
    date: '2025-10-20',
    status: 'Pending',
  },
];

export default function ReviewList() {
  const [statusFilter, setStatusFilter] = useState('all');

  // Logic lọc (giữ nguyên)
  const filteredReviews = reviews.filter((review) => {
    if (statusFilter === 'all') return true;
    return review.status === statusFilter;
  });

  // Hàm render sao (sửa lại để dùng class CSS)
  const renderStars = (rating) => {
    return (
      <div className="star-rating">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < rating ? 'star-filled' : 'star-empty'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  // Hàm lấy class CSS (thay cho Tailwind)
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'badge-green';
      case 'Pending':
        return 'badge-orange';
      default:
        return 'badge-gray';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Đánh giá</h1>
          <p className="page-subtitle">Kiểm duyệt và quản lý đánh giá sản phẩm</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header review-header">
          <h3 className="card-title">Danh sách đánh giá</h3>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
            style={{ minWidth: '200px' }} // Đặt chiều rộng
          >
            <option value="all">Tất cả</option>
            <option value="Pending">Chờ duyệt</option>
            <option value="Approved">Đã duyệt</option>
          </select>
        </div>
        <div className="card-content">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Khách hàng</th>
                  <th>Đánh giá</th>
                  <th>Bình luận</th>
                  <th>Ngày</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review) => (
                  <tr key={review.id}>
                    <td>{review.product}</td>
                    <td>{review.customer}</td>
                    <td>
                      <div className="rating-cell">
                        {renderStars(review.rating)}
                        <span className="rating-text">({review.rating})</span>
                      </div>
                    </td>
                    <td className="comment-cell">
                      <p className="comment-truncate">{review.comment}</p>
                    </td>
                    <td>{new Date(review.date).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <span className={`badge ${getStatusColor(review.status)}`}>
                        {review.status === 'Approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons">
                        {review.status === 'Pending' ? (
                          <button className="action-button">
                            <Eye width={16} height={16} />
                            Duyệt
                          </button>
                        ) : (
                          <button className="action-button">
                            <EyeOff width={16} height={16} />
                            Ẩn
                          </button>
                        )}
                        <button className="action-button-icon-destructive">
                          <Trash2 width={16} height={16} />
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