// src/components/ProductImageManager.jsx

import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

export function ProductImageManager({ images, primaryImageIndex, onImageUpload, onRemoveImage, onSetPrimary }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    // --- SỬA 1: Lưu 'target' vào một biến tạm ---
    const inputTarget = e.currentTarget;
    const file = e.target.files?.[0];
    // --- HẾT SỬA 1 ---

    if (!file) return;

    setIsUploading(true);
    await onImageUpload(file); // Gọi hàm từ hook
    setIsUploading(false);
    
    // --- SỬA 2: Sử dụng biến tạm 'inputTarget' ---
    if (inputTarget) {
      inputTarget.value = ''; // Reset input (sẽ không bị null)
    }
    // --- HẾT SỬA 2 ---
  };

  return (
    <div className="image-grid">
      {images.length > 0 ? (
        images.map((image, index) => (
          <div key={index} className="image-preview-wrapper">
            <img
              src={image.imageUrl} // Đọc 'imageUrl' từ object
              alt={`Product ${index + 1}`}
              className="image-preview"
              onError={(e) => (e.currentTarget.src = 'https://mms.img.susercontent.com/vn-11134513-7ra0g-ma9ikz1jh88i38@resize_ss1242x600!@crop_w1242_h600_cT')}
            />
            <div className="image-overlay">
              <button 
                type="button" 
                className={`button-secondary button-sm ${primaryImageIndex === index ? 'button-primary' : ''}`} 
                onClick={() => onSetPrimary(index)}
              >
                {primaryImageIndex === index ? 'Ảnh chính' : 'Chọn'}
              </button>
              <button 
                type="button" 
                className="button-destructive button-sm" 
                onClick={() => onRemoveImage(index)}
              >
                <X width={16} height={16} />
              </button>
            </div>
            {primaryImageIndex === index && <div className="image-primary-badge">Ảnh chính</div>}
          </div>
        ))
      ) : (
        <div>Chưa có ảnh sản phẩm</div>
      )}

      {/* Upload Box (Giữ nguyên) */}
      <label className="image-upload-box" style={{ cursor: isUploading ? 'wait' : 'pointer' }}>
        {isUploading ? (
          <span>Đang tải...</span>
        ) : (
          <>
            <Upload width={32} height={32} />
            <span>Tải ảnh lên</span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          disabled={isUploading}
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}