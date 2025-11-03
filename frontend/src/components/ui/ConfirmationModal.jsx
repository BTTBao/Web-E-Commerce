import React from 'react'
import './css/ConfirmationModal.css'

function ConfirmationModal({ isOpen, onClose, onConfirm, title, description }) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay" // Bạn có thể thêm lớp 'hidden' nếu không dùng JS để render có điều kiện
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Thêm .animate-fade-in-scale vào modal-panel khi modal được mở */}
      <div className="modal-panel animate-fade-in-scale">
        <div className="modal-content">
          <h3 className="modal-title" id="modal-title">
            {title}
          </h3>
          <div className="modal-description-container">
            <p className="modal-description">{description}</p>
          </div>
        </div>
        <div className="modal-button-group">
          <button
            type="button"
            onClick={onClose}
            className="modal-button modal-button-cancel"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="modal-button modal-button-confirm"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal