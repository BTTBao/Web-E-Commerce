// src/pages/Admin/ProductForm.jsx

import React, { useState } from 'react';
import { ArrowLeft, Upload, X, Plus, Trash2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

// Import CSS (Cần cả 2 file)
import './Orders.css'; /* Dùng chung .card, .button-primary, .filter-select */
import './ProductForm.css'; /* Style riêng cho form */

// Dữ liệu mẫu (Giả lập fetch)
const mockProduct = {
  name: 'iPhone 15 Pro Max',
  description: 'iPhone 15 Pro Max với chip A17 Pro mạnh mẽ, camera chuyên nghiệp và khung titan cao cấp.',
  category: 'Điện thoại',
  status: 'Active',
  price: 29990000,
  stock: 45,
  images: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5',
  ],
  primaryImageIndex: 0,
  variants: [
    { id: 1, name: '256GB - Titan Tự nhiên', sku: 'IP15PM-256-TN', price: 29990000, stock: 25 },
    { id: 2, name: '512GB - Titan Tự nhiên', sku: 'IP15PM-512-TN', price: 34990000, stock: 20 },
  ]
};

export default function ProductForm() {
  const { productId } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();

  // Load dữ liệu (giả lập)
  const [productData] = useState(productId ? mockProduct : null);
  
  const [activeTab, setActiveTab] = useState('general');
  const [images, setImages] = useState(productData?.images || []);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(productData?.primaryImageIndex || 0);
  const [variants, setVariants] = useState(productData?.variants || []);

  const handleBack = () => {
    navigate('/admin/products');
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { id: Date.now(), name: '', sku: '', price: 0, stock: 0 },
    ]);
  };

  const handleRemoveVariant = (id) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  const handleVariantChange = (id, field, value) => {
    setVariants(variants.map(v =>
      v.id === id ? { ...v, [field]: value } : v
    ));
  };

  return (
    <div className="product-form-container">
      <div className="order-detail-header">
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft className="back-icon" />
          Quay lại
        </button>
        <h1 className="order-detail-title">
          {productId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        </h1>
        <div className="header-spacer-right" />
      </div>

      <div className="card">
        <div className="card-content" style={{ paddingTop: '24px' }}>
          <div className="tabs-container">
            <nav className="tabs-list">
              <button 
                className={`tabs-trigger ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
              >
                Thông tin chung
              </button>
              <button 
                className={`tabs-trigger ${activeTab === 'pricing' ? 'active' : ''}`}
                onClick={() => setActiveTab('pricing')}
              >
                Giá & Kho
              </button>
              <button 
                className={`tabs-trigger ${activeTab === 'images' ? 'active' : ''}`}
                onClick={() => setActiveTab('images')}
              >
                Hình ảnh
              </button>
              <button 
                className={`tabs-trigger ${activeTab === 'variants' ? 'active' : ''}`}
                onClick={() => setActiveTab('variants')}
              >
                Biến thể
              </button>
            </nav>

            {/* Tab 1: General Info */}
            <div className={`tabs-content ${activeTab === 'general' ? 'active' : ''}`}>
              <div className="form-group">
                <label htmlFor="name">Tên sản phẩm</label>
                <input
                  id="name"
                  className="form-input"
                  placeholder="Nhập tên sản phẩm"
                  defaultValue={productData?.name || ''}
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Mô tả</label>
                <textarea
                  id="description"
                  className="form-textarea"
                  placeholder="Nhập mô tả sản phẩm"
                  rows={6}
                  defaultValue={productData?.description || ''}
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Danh mục</label>
                <select id="category" className="filter-select" defaultValue={productData?.category || ''}>
                  <option value="">Chọn danh mục</option>
                  <option value="Điện thoại">Điện thoại</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Tai nghe">Tai nghe</option>
                  <option value="Đồng hồ thông minh">Đồng hồ thông minh</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="status">Trạng thái</label>
                <select id="status" className="filter-select" defaultValue={productData?.status || 'Active'}>
                  <option value="Active">Hiển thị</option>
                  <option value="Hidden">Ẩn</option>
                </select>
              </div>
            </div>

            {/* Tab 2: Pricing & Inventory */}
            <div className={`tabs-content ${activeTab === 'pricing' ? 'active' : ''}`}>
              <div className="info-box info-box-blue">
                <p>
                  Lưu ý: Nếu sản phẩm có biến thể, giá và số lượng tồn kho sẽ được tính từ các biến thể.
                </p>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="price">Giá bán (VNĐ)</label>
                  <input
                    id="price"
                    type="number"
                    className="form-input"
                    placeholder="0"
                    defaultValue={productData?.price || ''}
                    disabled={variants.length > 0}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="stock">Số lượng tồn kho</label>
                  <input
                    id="stock"
                    type="number"
                    className="form-input"
                    placeholder="0"
                    defaultValue={productData?.stock || ''}
                    disabled={variants.length > 0}
                  />
                </div>
              </div>
            </div>

            {/* Tab 3: Images */}
            <div className={`tabs-content ${activeTab === 'images' ? 'active' : ''}`}>
              <div className="form-group">
                <label>Hình ảnh sản phẩm</label>
                <div className="image-grid">
                  {images.map((image, index) => (
                    <div key={index} className="image-preview-wrapper">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="image-preview"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                      />
                      <div className="image-overlay">
                        <button
                          className={`button-secondary button-sm ${primaryImageIndex === index ? 'button-primary' : ''}`}
                          onClick={() => setPrimaryImageIndex(index)}
                        >
                          {primaryImageIndex === index ? 'Ảnh chính' : 'Chọn'}
                        </button>
                        <button
                          className="button-destructive button-sm"
                          onClick={() => setImages(images.filter((_, i) => i !== index))}
                        >
                          <X width={16} height={16} />
                        </button>
                      </div>
                      {primaryImageIndex === index && (
                        <div className="image-primary-badge">Ảnh chính</div>
                      )}
                    </div>
                  ))}
                  <button className="image-upload-box">
                    <Upload width={32} height={32} />
                    <span>Tải ảnh lên</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Tab 4: Variants */}
            <div className={`tabs-content ${activeTab === 'variants' ? 'active' : ''}`}>
              <div className="variants-header">
                <label>Biến thể sản phẩm</label>
                <button onClick={handleAddVariant} className="button-primary button-sm">
                  <Plus width={16} height={16} style={{ marginRight: '4px' }}/>
                  Thêm biến thể
                </button>
              </div>

              <div className="variants-list">
                {variants.map((variant, index) => (
                  <div key={variant.id} className="card variant-card">
                    <div className="card-header variant-header">
                      <h4 className="card-title-sm">Biến thể {index + 1}</h4>
                      <button
                        className="button-icon-destructive"
                        onClick={() => handleRemoveVariant(variant.id)}
                      >
                        <Trash2 width={16} height={16} />
                      </button>
                    </div>
                    <div className="card-content form-grid-2">
                      <div className="form-group">
                        <label>Tên biến thể</label>
                        <input
                          className="form-input"
                          placeholder="VD: Đỏ, Size L"
                          value={variant.name}
                          onChange={(e) => handleVariantChange(variant.id, 'name', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>SKU</label>
                        <input
                          className="form-input"
                          placeholder="Mã SKU"
                          value={variant.sku}
                          onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Giá (VNĐ)</label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="0"
                          value={variant.price}
                          onChange={(e) => handleVariantChange(variant.id, 'price', Number(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Số lượng tồn</label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="0"
                          value={variant.stock}
                          onChange={(e) => handleVariantChange(variant.id, 'stock', Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {variants.length === 0 && (
                <div className="empty-state">
                  Chưa có biến thể nào. Nhấn "Thêm biến thể" để tạo mới.
                </div>
              )}
            </div>
          </div>

          <div className="form-footer">
            <button className="button-outline" onClick={handleBack}>
              Hủy
            </button>
            <button className="button-primary">
              {productId ? 'Cập nhật' : 'Tạo sản phẩm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}