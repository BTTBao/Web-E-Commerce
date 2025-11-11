import React, { useEffect, useState } from 'react';
import { ArrowLeft, Upload, X, Plus, Trash2, Pencil } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Orders.css';
import './ProductForm.css';


function Section({ title, right, children }) {
  return (
    <section className="section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <div className="section-right">{right}</div>
      </div>
      <div className="section-body">{children}</div>
    </section>
  );
}

function InlineVariantForm({ form, setForm, onSave, onCancel, isEditing }) {
  const isValid = () => form.SKU?.trim() && form.Price >= 0 && form.StockQuantity >= 0;

  return (
    <div className="variant-form-grid">
      <div className="form-group">
        <label>Size</label>
        <input
          className="form-input"
          placeholder="VD: S / M / L (có thể bỏ trống)"
          value={form.Size}
          onChange={(e) => setForm({ ...form, Size: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>Màu</label>
        <input
          className="form-input"
          placeholder="VD: Đen / Đỏ (có thể bỏ trống)"
          value={form.Color}
          onChange={(e) => setForm({ ...form, Color: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>SKU <span className="text-muted">(bắt buộc, duy nhất)</span></label>
        <input
          className="form-input"
          placeholder="Mã SKU"
          value={form.SKU}
          onChange={(e) => setForm({ ...form, SKU: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>Giá (VNĐ)</label>
        <input
          type="number"
          min={0}
          step="1000"
          className="form-input"
          placeholder="0"
          value={form.Price}
          onChange={(e) => setForm({ ...form, Price: Number(e.target.value || 0) })}
        />
      </div>
      <div className="form-group">
        <label>Tồn kho</label>
        <input
          type="number"
          min={0}
          step="1"
          className="form-input"
          placeholder="0"
          value={form.StockQuantity}
          onChange={(e) => setForm({ ...form, StockQuantity: Number(e.target.value || 0) })}
        />
      </div>
      <div className="variant-form-actions">
        <button className="button-outline" onClick={onCancel}>Hủy</button>
        <button className="button-primary" disabled={!isValid()} onClick={onSave}>
          {isEditing ? 'Cập nhật' : 'Lưu'}
        </button>
      </div>
    </div>
  );
}

export default function ProductForm() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Thông tin sản phẩm (controlled inputs)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('Active');

  // Giá & Kho cho sản phẩm không có biến thể
  const [basePrice, setBasePrice] = useState(0);
  const [baseStock, setBaseStock] = useState(0);

  // Hình ảnh (giữ dạng URL string cho UI, khi submit map sang DTO)
  const [images, setImages] = useState([]); // string[] URLs
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  // Biến thể
  // Shape UI: { LocalId (UI-only), VariantID (DB id hoặc 0 nếu mới), Size, Color, SKU, Price, StockQuantity }
  const [variants, setVariants] = useState([]);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantForm, setVariantForm] = useState({ Size: '', Color: '', SKU: '', Price: 0, StockQuantity: 0 });

  const [isSaving, setIsSaving] = useState(false);

  const makeLocalId = () =>
    (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'v-' + Date.now() + '-' + Math.random().toString(36).slice(2);

  // Load categories
  const loadCategories = async () => {
    try {
      const res = await axios.get('https://localhost:7132/api/category');
      setCategories(res.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  // Load product nếu có productId
  useEffect(() => {
    if (!productId) return; // tạo mới
    setLoading(true);
    fetch(`https://localhost:7132/api/product/${productId}`)
      .then((res) => { if (!res.ok) throw new Error('Lỗi khi tải dữ liệu sản phẩm'); return res.json(); })
      .then((data) => {
        const p = data.data;
        setName(p?.name || '');
        setDescription(p?.description || '');
        setCategoryId(p?.categoryId || '');
        setStatus(p?.status || 'Active');
        // Chuẩn hóa images: chấp nhận cả string hoặc ProductImageDto
        const imgs = (p?.productImages || []).map(img => typeof img === 'string' ? img : (img?.imageUrl || ''));
        setImages(imgs);
        const primaryIdx = Math.max(0, (p?.productImages || []).findIndex(img => img?.isPrimary));
        setPrimaryImageIndex(primaryIdx === -1 ? 0 : primaryIdx);
        // Map variants -> UI shape với LocalId
        setVariants((p?.productVariants || []).map(v => ({
          LocalId: makeLocalId(),
          VariantID: v.variantId ?? v.variantID ?? v.id ?? 0,
          Size: v.size ?? v.Size ?? '',
          Color: v.color ?? v.Color ?? '',
          SKU: v.sku ?? v.SKU ?? '',
          Price: Number(v.price ?? v.Price ?? 0),
          StockQuantity: Number(v.stockQuantity ?? v.StockQuantity ?? 0),
        })));
        setBasePrice(Number(p?.price || 0));
        setBaseStock(Number(p?.stockQuantity || 0));
        setLoading(false);
      })
      .catch((err) => { console.error(err); setLoading(false); });
  }, [productId]);

  // Handlers chung
  const handleBack = () => navigate('/admin/products');

  // Image helpers
  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));

  // Variant helpers
  const startAddVariant = () => {
    setEditingVariant(null);
    setVariantForm({ Size: '', Color: '', SKU: '', Price: 0, StockQuantity: 0 });
    setShowVariantForm(true);
  };

  const startEditVariant = (v) => {
    setEditingVariant(v);
    setVariantForm({ ...v });
    setShowVariantForm(true);
  };

  const cancelVariant = () => {
    setShowVariantForm(false);
    setEditingVariant(null);
    setVariantForm({ Size: '', Color: '', SKU: '', Price: 0, StockQuantity: 0 });
  };

const saveVariant = () => {
  // 1️⃣ Kiểm tra xem SKU có bị trùng (và không phải chính variant đang sửa)
  const isDuplicateSKU = variants.some((v) =>
    v.SKU.trim().toLowerCase() === variantForm.SKU.trim().toLowerCase() &&
    v.LocalId !== editingVariant?.LocalId
  );

  if (isDuplicateSKU) {
    alert('SKU đã tồn tại trong danh sách biến thể.');
    return;
  }

  // 2️⃣ Nếu đang chỉnh sửa biến thể
  if (editingVariant) {
    setVariants((prevVariants) =>
      prevVariants.map((v) =>
        v.LocalId === editingVariant.LocalId
          ? {
              ...variantForm,                // dữ liệu mới từ form
              LocalId: v.LocalId,             // giữ nguyên LocalId
              VariantID: v.VariantID ?? 0     // nếu chưa có ID thì gán = 0
            }
          : v
      )
    );
  }
  // 3️⃣ Nếu thêm mới biến thể
  else {
    setVariants((prevVariants) => [
      ...prevVariants,
      {
        ...variantForm,                     // dữ liệu mới
        LocalId: makeLocalId(),             // tạo ID tạm
        VariantID: 0                        // VariantID mặc định = 0
      }
    ]);
  }

  // 4️⃣ Reset form sau khi lưu
  cancelVariant();
};


  const removeVariant = (localId) => setVariants((prev) => prev.filter((v) => v.LocalId !== localId));

  // ===== Submit (POST/PUT) =====
  const handleSubmit = async () => {
    // Validate cơ bản
    if (!name.trim()) { alert('Vui lòng nhập tên sản phẩm'); return; }
    if (!variants.length && (basePrice ?? 0) < 0) { alert('Giá không hợp lệ'); return; }

    setIsSaving(true);

    // Chuẩn hóa ảnh -> ProductImageDto
    const productImagesPayload = images.map((imgUrl, idx) => ({
      imageId: 0,
      productId: 0, // backend nên override
      imageUrl: imgUrl,
      isPrimary: idx === primaryImageIndex
    }));

    // Chuẩn hóa biến thể -> ProductVariantDto (variantId 0 nếu mới)
    const productVariantsPayload = variants.map(v => ({
      variantId: v.VariantID ? Number(v.VariantID) : 0,
      productId: 0, // backend nên override
      size: v.Size || null,
      color: v.Color || null,
      sku: (v.SKU || '').trim(),
      price: v.Price != null ? Number(v.Price) : null,
      stockQuantity: v.StockQuantity != null ? Number(v.StockQuantity) : null,
    }));

    // Hàm build payload chung
    const buildPayload = (pid) => ({
      productId: pid || 0,
      categoryId: categoryId ? Number(categoryId) : null,
      name,
      description,
      price: variants.length ? null : (basePrice != null ? Number(basePrice) : null),
      stockQuantity: variants.length ? null : (baseStock != null ? Number(baseStock) : null),
      soldCount: null,
      status,
      createdAt: null,
      productImages: productImagesPayload.map(x => ({ ...x, productId: pid || 0 })),
      productVariants: productVariantsPayload.map(x => ({ ...x, productId: pid || 0 })),
      reviews: []
    });

    try {
      if (!productId) {
        // Bước 1: POST tối thiểu để lấy ProductId thật
        const payloadCreate = {
          productId: 0,
          categoryId: categoryId ? Number(categoryId) : null,
          name,
          description,
          price: variants.length ? null : (basePrice != null ? Number(basePrice) : null),
          stockQuantity: variants.length ? null : (baseStock != null ? Number(baseStock) : null),
          soldCount: null,
          status,
          createdAt: null,
          productImages: [],
          productVariants: [],
          reviews: []
        };

        const resCreate = await axios.post('https://localhost:7132/api/product', payloadCreate);
        console.log(resCreate);
        const newId = resCreate?.data?.data?.productId || resCreate?.data?.data?.ProductId;
        if (!newId) throw new Error('Không nhận được ProductId khi tạo sản phẩm');

        // Bước 2: PUT đầy đủ (ảnh + biến thể) với ProductId thật
        const payloadFull = buildPayload(Number(newId));
        await axios.put(`https://localhost:7132/api/product/${newId}`, payloadFull);
        alert('Tạo sản phẩm thành công');
      } else {
        // Update 1 bước
        const payloadFull = buildPayload(Number(productId));
        await axios.put(`https://localhost:7132/api/product/${productId}`, payloadFull);
        alert('Cập nhật sản phẩm thành công');
      }

      navigate('/admin/products');
    } catch (err) {
      console.error('Lỗi lưu sản phẩm:', err?.response?.data || err);
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm' + err;
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Guard khi có productId
  if (productId && loading) return <div>Đang tải dữ liệu sản phẩm...</div>;

  return (
    <div className="product-form-container">
      {/* Header */}
      <div className="order-detail-header">
        <button className="back-button" onClick={handleBack}>
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
              <input id="name" className="form-input" placeholder="Nhập tên sản phẩm" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="description">Mô tả</label>
              <textarea id="description" className="form-textarea" rows={6} placeholder="Nhập mô tả sản phẩm" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="category">Danh mục</label>
                <select id="category" className="filter-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">Chọn danh mục</option>
                  {categories.filter((c) => c.parentId !== null).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="status">Trạng thái</label>
                <select id="status" className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Active">Hiển thị</option>
                  <option value="Hidden">Ẩn</option>
                </select>
              </div>
            </div>
          </Section>

          {/* === Giá & Kho === */}
          <Section title="Giá & Kho">
            {variants.length > 0 && (
              <div className="info-box info-box-blue" style={{ marginBottom: 16 }}>
                <p>Lưu ý: Sản phẩm có biến thể, giá và tồn kho sẽ tính theo từng biến thể bên dưới.</p>
              </div>
            )}
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="price">Giá bán (VNĐ)</label>
                <input id="price" type="number" className="form-input" placeholder="0" value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value || 0))} disabled={variants.length > 0} />
              </div>
              <div className="form-group">
                <label htmlFor="stock">Số lượng tồn kho</label>
                <input id="stock" type="number" className="form-input" placeholder="0" value={baseStock} onChange={(e) => setBaseStock(Number(e.target.value || 0))} disabled={variants.length > 0} />
              </div>
            </div>
          </Section>

          {/* === Hình ảnh === */}
          <Section title="Hình ảnh">
            <div className="image-grid">
              {images.length > 0 ? (
                images.map((image, index) => (
                  <div key={index} className="image-preview-wrapper">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="image-preview"
                      onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
                    />
                    <div className="image-overlay">
                      <button className={`button-secondary button-sm ${primaryImageIndex === index ? 'button-primary' : ''}`} onClick={() => setPrimaryImageIndex(index)}>
                        {primaryImageIndex === index ? 'Ảnh chính' : 'Chọn'}
                      </button>
                      <button className="button-destructive button-sm" onClick={() => removeImage(index)}>
                        <X width={16} height={16} />
                      </button>
                    </div>
                    {primaryImageIndex === index && <div className="image-primary-badge">Ảnh chính</div>}
                  </div>
                ))
              ) : (
                <div>Chưa có ảnh sản phẩm</div>
              )}

              {/* Upload đơn giản: chọn file -> tạo URL tạm để preview */}
              <label className="image-upload-box" style={{ cursor: 'pointer' }}>
                <Upload width={32} height={32} />
                <span>Tải ảnh lên</span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    setImages((prev) => [...prev, url]);
                    setPrimaryImageIndex((prevIdx) => (images.length === 0 ? 0 : prevIdx));
                    e.currentTarget.value = '';
                  }}
                />
              </label>
            </div>
          </Section>

          {/* === Biến thể === */}
          <Section
            title="Biến thể"
            right={
              <button className="button-primary button-sm" onClick={startAddVariant}>
                <Plus width={16} height={16} style={{ marginRight: 4 }} /> Thêm biến thể
              </button>
            }
          >
            {/* Form inline hiển thị khi thêm/sửa */}
            {showVariantForm && (
              <div className="inline-variant-card">
                <InlineVariantForm
                  form={variantForm}
                  setForm={setVariantForm}
                  onSave={saveVariant}
                  onCancel={cancelVariant}
                  isEditing={!!editingVariant}
                />
              </div>
            )}

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
                  {variants.map((v, idx) => (
                    <tr key={v.LocalId}>
                      <td>{idx + 1}</td>
                      <td>{v.Size || '-'}</td>
                      <td>{v.Color || '-'}</td>
                      <td>{v.SKU}</td>
                      <td>{Number(v.Price).toLocaleString()}</td>
                      <td>{Number(v.StockQuantity)}</td>
                      <td className="action-buttons">
                        <button className="button-secondary button-sm" onClick={() => startEditVariant(v)}>
                          <Pencil width={16} height={16} style={{ marginRight: 4 }} /> Sửa
                        </button>
                        <button className="button-destructive button-sm" onClick={() => removeVariant(v.LocalId)}>
                          <Trash2 width={16} height={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">Chưa có biến thể nào. Nhấn "Thêm biến thể" để tạo mới.</div>
            )}
          </Section>

          {/* Footer actions */}
          <div className="form-footer">
            <button className="button-outline" onClick={handleBack}>Hủy</button>
            <button className="button-primary" onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'Đang lưu...' : (productId ? 'Cập nhật' : 'Tạo sản phẩm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
