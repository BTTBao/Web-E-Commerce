import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ArrowLeft, Upload, X, Plus, Trash2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Orders.css';
import './ProductForm.css';

function VariantModal({ showModal, editingVariant, variantForm, setVariantForm, onSave, onClose }) {
  if (!showModal) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{editingVariant ? 'Chỉnh sửa biến thể' : 'Thêm biến thể mới'}</h3>
          <button className="close-button" onClick={onClose}>
            <X width={20} height={20} />
          </button>
        </div>
        <div className="modal-body form-grid-2">
          {/* Nội dung modal */}
        </div>
        <div className="modal-footer">
          <button className="button-outline" onClick={onClose}>Hủy</button>
          <button className="button-primary" onClick={onSave}>Lưu</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function ProductForm() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState([]);

  const loadCategories = async () => {
    try {
      const res = await axios.get("https://localhost:7132/api/category");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (!productId) {
      // Nếu là form thêm mới thì không cần load product
      setProduct(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`https://localhost:7132/api/product/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Lỗi khi tải dữ liệu sản phẩm');
        return res.json();
      })
      .then((data) => {
        setProduct(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        setProduct(null);
      });
  }, [productId]);

  // Các state khác
  const [activeTab, setActiveTab] = useState('general');
  const [images, setImages] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    if (product) {
      setImages(product.productImages || []);
      setPrimaryImageIndex(0);
      setVariants(product.productVariants || []);
    } else {
      setImages([]);
      setPrimaryImageIndex(0);
      setVariants([]);
    }
  }, [product]);

  const handleBack = () => navigate('/admin/products');
  const handleRemoveVariant = (id) => setVariants(variants.filter(v => v.id !== id));

  const [showModal, setShowModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantForm, setVariantForm] = useState({
    size: '',
    color: '',
    sku: '',
    price: 0,
    stock: 0,
  });

  const handleSaveVariant = () => {
    if (editingVariant) {
      setVariants(variants.map(v => v.id === editingVariant.id ? { ...variantForm, id: v.id } : v));
    } else {
      setVariants([...variants, { ...variantForm, id: Date.now() }]);
    }
    setShowModal(false);
    setVariantForm({ size: '', color: '', sku: '', price: 0, stock: 0 });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVariant(null);
  };

  useEffect(() => {
    if (editingVariant) setVariantForm(editingVariant);
    else setVariantForm({ size: '', color: '', sku: '', price: 0, stock: 0 });
  }, [editingVariant]);

  // Phần kiểm tra loading + productId chính xác
  if (productId) {
    if (loading) return <div>Đang tải dữ liệu sản phẩm...</div>;
    if (!product) return <div>Không tìm thấy sản phẩm</div>;
  }

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
                  defaultValue={product?.name || ''}
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Mô tả</label>
                <textarea
                  id="description"
                  className="form-textarea"
                  placeholder="Nhập mô tả sản phẩm"
                  rows={6}
                  defaultValue={product?.description || ''}
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Danh mục</label>
                <select id="category" className="filter-select" defaultValue={product?.categoryId || ''}>
                  <option value="">Chọn danh mục</option>
                  {categories.map(c => {
                    if(c.parentId !== null)
                    return(
                    <option key={c.id} value={c.id}>{c.name}</option>
                  )})}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="status">Trạng thái</label>
                <select id="status" className="filter-select" defaultValue={product?.status || 'Active'}>
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
                    defaultValue={product?.price || ''}
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
                    defaultValue={product?.stockQuantity || ''}
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
                  {images.length > 0 ? images.map((image, index) => (
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
                  )) : (
                    <div>Chưa có ảnh sản phẩm</div>
                  )}
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
                <button
                  onClick={() => {
                    setEditingVariant(null);
                    setShowModal(true);
                  }}
                  className="button-primary button-sm"
                >
                  <Plus width={16} height={16} style={{ marginRight: '4px' }} />
                  Thêm biến thể
                </button>
              </div>

              {variants.length > 0 ? (
                <table className="variants-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Size</th>
                      <th>Màu</th>
                      <th>SKU</th>
                      <th>Giá (VNĐ)</th>
                      <th>Tồn kho</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant, index) => (
                      <tr key={variant.id}>
                        <td>{index + 1}</td>
                        <td>{variant.size}</td>
                        <td>{variant.color}</td>
                        <td>{variant.sku}</td>
                        <td>{variant.price.toLocaleString()}</td>
                        <td>{variant.stock}</td>
                        <td className="action-buttons">
                          <button
                            className="button-secondary button-sm"
                            onClick={() => {
                              setEditingVariant(variant);
                              setShowModal(true);
                            }}
                          >
                            Sửa
                          </button>
                          <button
                            className="button-destructive button-sm"
                            onClick={() => handleRemoveVariant(variant.id)}
                          >
                            <Trash2 width={16} height={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
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

      <VariantModal
        showModal={showModal}
        editingVariant={editingVariant}
        variantForm={variantForm}
        setVariantForm={setVariantForm}
        onSave={handleSaveVariant}
        onClose={handleCloseModal}
      />
    </div>
  );
}
