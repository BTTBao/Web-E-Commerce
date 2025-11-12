// src/pages/Admin/ReviewList.jsx

import React, { useState, useEffect, useMemo } from 'react';
// --- SỬA 1: Thêm 'FileText' ---
import { Eye, EyeOff, Trash2, FileText } from 'lucide-react'; 
import axios from 'axios';

// Import file CSS
import './Vouchers.css';
import './ReviewList.css';

// --- Cấu hình API ---
const API_URL = 'https://localhost:7132/api/reviews';

// --- Component chính ---
export default function ReviewList() {
  // --- STATE ---
  const [reviews, setReviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- SỬA 2: Thêm state cho Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  // --- HẾT SỬA 2 ---

  // --- (Các hàm API: fetchReviews, handleToggleStatus, handleDelete giữ nguyên) ---
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = () => {
    setLoading(true);
    axios.get(API_URL)
      .then(res => {
        setReviews(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi fetch reviews:", err);
        setError("Không thể tải danh sách đánh giá.");
        setLoading(false);
      });
  };

  const handleToggleStatus = (reviewId) => {
    axios.patch(`${API_URL}/${reviewId}/toggle`)
      .then(res => {
        setReviews(prevReviews =>
          prevReviews.map(r =>
            r.id === reviewId ? { ...r, status: res.data.newStatus } : r
          )
        );
      })
      .catch(err => {
        console.error("Lỗi toggle status:", err);
        alert("Không thể cập nhật trạng thái.");
      });
  };

  const handleDelete = (reviewId, customerName) => {
    if (window.confirm(`Bạn có chắc muốn xóa đánh giá của ${customerName}?`)) {
      axios.delete(`${API_URL}/${reviewId}`)
        .then(() => {
          setReviews(prevReviews =>
            prevReviews.filter(r => r.id !== reviewId)
          );
        })
        .catch(err => {
          console.error("Lỗi xóa review:", err);
          alert("Không thể xóa đánh giá này.");
        });
    }
  };

  // --- SỬA 3: Thêm hàm xử lý Modal ---
  const handleOpenModal = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };
  // --- HẾT SỬA 3 ---


  // --- Logic lọc (giữ nguyên) ---
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      if (statusFilter === 'all') return true;
      return review.status === statusFilter;
    });
  }, [reviews, statusFilter]);

  // --- Các hàm render (giữ nguyên) ---
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'badge-green';
      case 'Pending': return 'badge-orange';
      default: return 'badge-gray';
    }
  };

  // --- RENDER CHÍNH ---
  if (loading) {
    return <div className="page-container">Đang tải danh sách đánh giá...</div>;
  }

  if (error) {
    return <div className="page-container error-message">{error}</div>;
  }

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
          {/* (Phần filter giữ nguyên) */}
          <h3 className="card-title">Danh sách đánh giá</h3>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
            style={{ minWidth: '200px' }}
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
                {filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px' }}>
                      Không tìm thấy đánh giá nào.
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((review) => (
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
                        {/* (Giữ nguyên) */}
                        <p className="comment-truncate">{review.comment}</p>
                      </td>
                      <td>{new Date(review.date).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <span className={`badge ${getStatusColor(review.status)}`}>
                          {review.status === 'Approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                        </span>
                      </td>
                      <td className="text-right">
                        {/* --- SỬA 4: Thêm nút "Xem" --- */}
                        <div className="action-buttons">
                          <button 
                            className="action-button-icon"
                            title="Xem chi tiết"
                            onClick={() => handleOpenModal(review)}
                          >
                            <FileText width={16} height={16} />
                          </button>
                          
                          <button 
                            className="action-button"
                            onClick={() => handleToggleStatus(review.id)}
                          >
                            {review.status === 'Pending' ? (
                              <>
                                <Eye width={16} height={16} /> Duyệt
                              </>
                            ) : (
                              <>
                                <EyeOff width={16} height={16} /> Ẩn
                              </>
                            )}
                          </button>
                          <button 
                            className="action-button-icon-destructive"
                            title="Xóa"
                            onClick={() => handleDelete(review.id, review.customer)}
                          >
                            <Trash2 width={16} height={16} />
                          </button>
                        </div>
                        {/* --- HẾT SỬA 4 --- */}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- SỬA 5: Thêm JSX cho Modal --- */}
      {isModalOpen && selectedReview && (
        <div className="dialog-overlay" onClick={handleCloseModal}>
          <div className="dialog-content review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3 className="dialog-title">Chi tiết đánh giá (ID: {selectedReview.id})</h3>
            </div>
            
            <div className="dialog-body form-group-stack">
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Khách hàng</label>
                  <p className="modal-info-text">{selectedReview.customer}</p>
                </div>
                <div className="form-group">
                  <label>Ngày đánh giá</label>
                  <p className="modal-info-text">{new Date(selectedReview.date).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              
              <div className="form-group">
                <label>Sản phẩm</label>
                <p className="modal-info-text">{selectedReview.product}</p>
              </div>
              
              <div className="form-group">
                <label>Xếp hạng</label>
                {renderStars(selectedReview.rating)}
              </div>

              <div className="form-group">
                <label>Nội dung bình luận</label>
                {/* Dùng <p> để hiển thị đầy đủ, không bị cắt */}
                <p className="full-comment">{selectedReview.comment}</p>
              </div>
            </div>

            <div className="form-footer">
              <button className="button-primary" onClick={handleCloseModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- HẾT SỬA 5 --- */}

    </div>
  );
}