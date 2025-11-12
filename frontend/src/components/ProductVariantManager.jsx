// src/components/ProductVariantManager.jsx

import React, { useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';

// Form inline được chuyển vào đây
function InlineVariantForm({ initialData, onSave, onCancel, isEditing }) {
  const [form, setForm] = useState(initialData);
  
  const isValid = () => form.SKU?.trim() && form.Price >= 0 && form.StockQuantity >= 0;

  const handleSave = () => {
    onSave(form);
  };

  return (
    <div className="variant-form-grid">
      <div className="form-group">
        <label>Size</label>
        <input
          className="form-input"
          placeholder="VD: S / M / L"
          value={form.Size}
          onChange={(e) => setForm({ ...form, Size: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>Màu</label>
        <input
          className="form-input"
          placeholder="VD: Đen / Đỏ"
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
          type="number" min={0} step="1000" className="form-input"
          placeholder="0"
          value={form.Price}
          onChange={(e) => setForm({ ...form, Price: Number(e.target.value || 0) })}
        />
      </div>
      <div className="form-group">
        <label>Tồn kho</label>
        <input
          type="number" min={0} step="1" className="form-input"
          placeholder="0"
          value={form.StockQuantity}
          onChange={(e) => setForm({ ...form, StockQuantity: Number(e.target.value || 0) })}
        />
      </div>
      <div className="variant-form-actions">
        <button type="button" className="button-outline" onClick={onCancel}>Hủy</button>
        <button type="button" className="button-primary" disabled={!isValid()} onClick={handleSave}>
          {isEditing ? 'Cập nhật' : 'Lưu'}
        </button>
      </div>
    </div>
  );
}

// Component quản lý chính
export function ProductVariantManager({ variants, onSaveVariant, onRemoveVariant }) {
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null); // Lưu trữ variant (với LocalId) đang sửa

  const emptyForm = { Size: '', Color: '', SKU: '', Price: 0, StockQuantity: 0 };

  const startAddVariant = () => {
    setEditingVariant(null);
    setShowVariantForm(true);
  };

  const startEditVariant = (v) => {
    setEditingVariant(v); // Lưu cả object
    setShowVariantForm(true);
  };

  const cancelVariant = () => {
    setShowVariantForm(false);
    setEditingVariant(null);
  };

  const handleSave = (form) => {
    const success = onSaveVariant(form, editingVariant?.LocalId);
    if (success) { // Chỉ đóng form nếu hook báo thành công (không trùng SKU)
      cancelVariant();
    }
  };

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Biến thể</h2>
        <div className="section-right">
          <button 
            type="button" 
            className="button-primary button-sm" 
            onClick={startAddVariant}
            disabled={showVariantForm}
          >
            <Plus width={16} height={16} style={{ marginRight: 4 }} /> Thêm biến thể
          </button>
        </div>
      </div>
      <div className="section-body">
        {showVariantForm && (
          <div className="inline-variant-card">
            <InlineVariantForm
              initialData={editingVariant || emptyForm}
              onSave={handleSave}
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
                    <button 
                      type="button" 
                      className="button-secondary button-sm" 
                      onClick={() => startEditVariant(v)} 
                      disabled={showVariantForm}
                    >
                      <Pencil width={16} height={16} style={{ marginRight: 4 }} /> Sửa
                    </button>
                    <button 
                      type="button" 
                      className="button-destructive button-sm" 
                      onClick={() => onRemoveVariant(v.LocalId)}
                      disabled={showVariantForm}
                    >
                      <Trash2 width={16} height={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !showVariantForm && (
            <div className="empty-state">Chưa có biến thể nào. Nhấn "Thêm biến thể" để tạo mới.</div>
          )
        )}
      </div>
    </>
  );
}