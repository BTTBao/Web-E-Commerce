// src/pages/Admin/ReviewList.jsx

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Trash2, FileText } from 'lucide-react';
import axios from 'axios';
import './Vouchers.css';
import './ReviewList.css';
import { toast } from 'sonner';

const API_URL = 'https://localhost:7132/api/reviews';

export default function ReviewList() {
  const [reviews, setReviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');

  // --- Phân trang ---
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);


  useEffect(() => {
    fetchReviews();
  }, [page, statusFilter]);

  const fetchReviews = () => {
    setLoading(true);

    axios
      .get(`${API_URL}/paged`, {
        params: {
          page,
          pageSize,
          status: statusFilter
        }
      })
      .then((res) => {
        setReviews(res.data.items);
        setTotalPages(res.data.totalPages);
        setLoading(false);
      })
      .catch((err) => {
        toast.error("Không thể tải dữ liệu!");
        setLoading(false);
      });
  };

  const handleToggleStatus = (reviewId) => {
    axios
      .patch(`${API_URL}/${reviewId}/toggle`)
      .then((res) => {
        fetchReviews(); // reload
      })
      .catch(() => toast.error('Không thể cập nhật trạng thái.'));
  };

  const handleDelete = (reviewId, customerName) => {
    if (!window.confirm(`Bạn muốn xóa đánh giá của ${customerName}?`)) return;

    axios
      .delete(`${API_URL}/${reviewId}`)
      .then(() => fetchReviews())
      .catch(() => toast.error('Không thể xóa đánh giá.'));
  };

  const handleOpenModal = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedReview(null);
    setIsModalOpen(false);
  };


  const renderStars = (rating) => (
    <div className="star-rating">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < rating ? 'star-filled' : 'star-empty'}>
          ★
        </span>
      ))}
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'badge-green';
      case 'Pending': return 'badge-orange';
      default: return 'badge-gray';
    }
  };

  // ------------------ UI -----------------------

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
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="filter-select"
            style={{ minWidth: '200px' }}
          >
            <option value="all">Tất cả</option>
            <option value="Pending">Chờ duyệt</option>
            <option value="Approved">Đã duyệt</option>
          </select>
        </div>

        <div className="card-content">
          {loading ? (
            <p style={{ padding: 20 }}>Đang tải...</p>
          ) : (
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
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: 32 }}>
                        Không có dữ liệu.
                      </td>
                    </tr>
                  ) : (
                    reviews.map((review) => (
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
                            
                            <button 
                              className="action-button-icon"
                              onClick={() => handleOpenModal(review)}
                            >
                              <FileText size={16} />
                            </button>

                            <button
                              className="action-button"
                              onClick={() => handleToggleStatus(review.id)}
                            >
                              {review.status === 'Pending' ? (
                                <>
                                  <Eye size={16} /> Duyệt
                                </>
                              ) : (
                                <>
                                  <EyeOff size={16} /> Ẩn
                                </>
                              )}
                            </button>

                            <button 
                              className="action-button-icon-destructive"
                              onClick={() => handleDelete(review.id, review.customer)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --- PHÂN TRANG --- */}
        <div className="pagination">
          <button 
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            «
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={page === i + 1 ? 'active' : ''}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            »
          </button>
        </div>
        {/* --- END PAGINATION --- */}
      </div>

      {/* ---------- MODAL ---------- */}
      {isModalOpen && selectedReview && (
        <div className="dialog-overlay" onClick={handleCloseModal}>
          <div className="dialog-content review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3 className="dialog-title">
                Chi tiết đánh giá (ID: {selectedReview.id})
              </h3>
            </div>

            <div className="dialog-body form-group-stack">
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Khách hàng</label>
                  <p>{selectedReview.customer}</p>
                </div>

                <div className="form-group">
                  <label>Ngày đánh giá</label>
                  <p>{new Date(selectedReview.date).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              <div className="form-group">
                <label>Sản phẩm</label>
                <p>{selectedReview.product}</p>
              </div>

              <div className="form-group">
                <label>Xếp hạng</label>
                {renderStars(selectedReview.rating)}
              </div>

              <div className="form-group">
                <label>Nội dung bình luận</label>
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

    </div>
  );
}
