// src/pages/Admin/ProductForm.jsx

import React from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// 1. Import Hook (Controller) và Views
import { useProductForm } from '../../hooks/useProductForm';
import { ProductImageManager } from '../../components/ProductImageManager';
import { ProductVariantManager } from '../../components/ProductVariantManager';

// Import CSS
import './Orders.css';
import './ProductForm.css';

// Helper component (có thể tách ra file riêng)
function Section({ title, children }) {
  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
      </div>
      <div className="section-body">{children}</div>
    </section>
  );
}

// 2. View chính
export default function ProductForm() {
  const { productId } = useParams();

  // 3. Gọi "Controller" để lấy MỌI THỨ
  const {
    loading,
    isSaving,
    isUploading,
    states,
    setters,
    handlers
  } = useProductForm(productId);

  // 4. Render Loading
  if (productId && loading) return <div className="page-container">Đang tải dữ liệu sản phẩm...</div>;

  // 5. Render Form
  return (
    <div className="product-form-container">
      {/* Header */}
      <div className="order-detail-header">
        <button type="button" className="back-button" onClick={handlers.handleBack}>
          <ArrowLeft className="back-icon" />
          Quay lại
        </button>
        <h1 className="order-detail-title">{productId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h1>
        <div className="header-spacer-right" />
      </div>

      <div className="card">
        <div className="card-content" style={{ paddingTop: 24 }}>
          
          {/* === Thông tin chung === */}
          <Section title="Thông tin chung">
            <div className="form-group">
              <label htmlFor="name">Tên sản phẩm</label>
              <input id="name" className="form-input" placeholder="Nhập tên sản phẩm" value={states.name} onChange={(e) => setters.setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="description">Mô tả</label>
              <textarea id="description" className="form-textarea" rows={6} placeholder="Nhập mô tả sản phẩm" value={states.description} onChange={(e) => setters.setDescription(e.target.value)} />
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="category">Danh mục</label>
                <select id="category" className="filter-select" value={states.categoryId} onChange={(e) => setters.setCategoryId(e.target.value)}>
                  <option value="">Chọn danh mục</option>
                  {states.categories.filter((c) => c.parentId !== null).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="status">Trạng thái</label>
                <select id="status" className="filter-select" value={states.status} onChange={(e) => setters.setStatus(e.target.value)}>
                  <option value="Active">Hiển thị</option>
                  <option value="Hidden">Ẩn</option>
                </select>
              </div>
            </div>
          </Section>

          {/* === Giá & Kho === */}
          <Section title="Giá & Kho">
            {states.variants.length > 0 && (
              <div className="info-box info-box-blue" style={{ marginBottom: 16 }}>
                <p>Lưu ý: Sản phẩm có biến thể, giá và tồn kho sẽ tính theo từng biến thể bên dưới.</p>
              </div>
            )}
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="price">Giá bán (VNĐ)</label>
                <input id="price" type="number" className="form-input" placeholder="0" value={states.basePrice} onChange={(e) => setters.setBasePrice(Number(e.target.value || 0))} disabled={states.variants.length > 0} />
              </div>
              <div className="form-group">
                <label htmlFor="stock">Số lượng tồn kho</label>
                <input id="stock" type="number" className="form-input" placeholder="0" value={states.baseStock} onChange={(e) => setters.setBaseStock(Number(e.target.value || 0))} disabled={states.variants.length > 0} />
              </div>
            </div>
          </Section>

          {/* === Hình ảnh (Đã tách) === */}
          <Section title="Hình ảnh">
            <ProductImageManager
              images={states.images}
              primaryImageIndex={states.primaryImageIndex}
              onImageUpload={handlers.handleImageUpload}
              onRemoveImage={handlers.removeImage}
              onSetPrimary={setters.setPrimaryImageIndex}
            />
          </Section>

          {/* === Biến thể (Đã tách) === */}
          {/* (Component này đã bao gồm Section bên trong nó) */}
          <ProductVariantManager
            variants={states.variants}
            onSaveVariant={handlers.saveVariant}
            onRemoveVariant={handlers.removeVariant}
          />
          
          {/* Footer actions */}
          <div className="form-footer">
            <button type="button" className="button-outline" onClick={handlers.handleBack}>Hủy</button>
            <button 
              type="button" 
              className="button-primary" 
              onClick={handlers.handleSubmit} 
              disabled={isSaving || isUploading}
            >
              {isSaving ? 'Đang lưu...' : (isUploading ? 'Đang tải ảnh...' : (productId ? 'Cập nhật' : 'Tạo sản phẩm'))}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}