// src/pages/Admin/CategoryList.jsx

import React, { useState } from 'react';
import { Plus, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';

// Import file CSS (chỉ cần 1 file này)
import './CategoryList.css';

// Dữ liệu mẫu (giữ nguyên)
const categories = [
  {
    id: 'C001',
    name: 'Điện thoại',
    parentId: null,
    children: [
      { id: 'C001-1', name: 'iPhone', parentId: 'C001' },
      { id: 'C001-2', name: 'Samsung', parentId: 'C001' },
      { id: 'C001-3', name: 'Xiaomi', parentId: 'C001' },
    ],
  },
  {
    id: 'C002',
    name: 'Laptop',
    parentId: null,
    children: [
      { id: 'C002-1', name: 'Dell', parentId: 'C002' },
      { id: 'C002-2', name: 'MacBook', parentId: 'C002' },
      { id: 'C002-3', name: 'Asus', parentId: 'C002' },
    ],
  },
  { id: 'C003', name: 'Tai nghe', parentId: null, children: [ /* ... */ ] },
  { id: 'C004', name: 'Tablet', parentId: null },
  { id: 'C005', name: 'Đồng hồ thông minh', parentId: null },
];

// --- Component con để render cây đệ quy ---
function CategoryTreeItem({ category, level = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className="tree-branch">
      <div
        className="tree-item"
        // Style inline này rất quan trọng để tạo thụt đầu dòng
        style={{ paddingLeft: `${level * 24 + 16}px` }}
      >
        <div className="tree-item-content">
          {hasChildren ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="tree-toggle-btn"
            >
              {expanded ? <ChevronDown width={16} height={16} /> : <ChevronRight width={16} height={16} />}
            </button>
          ) : (
            // Spacer để các item thẳng hàng
            <div className="tree-item-spacer" />
          )}
          <span className="tree-item-name">{category.name}</span>
          <span className="tree-item-id">({category.id})</span>
        </div>
        <div className="tree-item-actions">
          <button className="action-button-icon">
            <Edit width={16} height={16} />
          </button>
          <button className="action-button-icon-destructive">
            <Trash2 width={16} height={16} />
          </button>
        </div>
      </div>
      {/* Phần đệ quy */}
      {expanded && hasChildren && (
        <div className="tree-children">
          {category.children.map((child) => (
            <CategoryTreeItem key={child.id} category={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Component chính ---
export default function CategoryList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const handleOpenDialog = (isEditing = false) => {
    setIsEdit(isEditing);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Danh mục</h1>
          <p className="page-subtitle">Tổ chức và quản lý danh mục sản phẩm</p>
        </div>
        <button className="button-primary" onClick={() => handleOpenDialog(false)}>
          <Plus width={16} height={16} style={{ marginRight: '8px' }} />
          Thêm danh mục
        </button>
      </div>

      {/* Cây danh mục */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Cây danh mục</h3>
        </div>
        <div className="card-content" style={{ padding: 0 }}>
          <div className="category-tree-wrapper">
            {categories.map((category) => (
              <CategoryTreeItem key={category.id} category={category} />
            ))}
          </div>
        </div>
      </div>

      {/* --- Dialog (Modal) Thêm/Sửa --- */}
      {dialogOpen && (
        <div className="dialog-overlay" onClick={handleCloseDialog}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3 className="dialog-title">
                {isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
              </h3>
            </div>
            <div className="form-group-stack">
              <div className="form-group">
                <label htmlFor="category-name">Tên danh mục</label>
                <input id="category-name" className="form-input" placeholder="Nhập tên danh mục" />
              </div>
              <div className="form-group">
                <label htmlFor="parent-category">Danh mục cha (tùy chọn)</label>
                <select id="parent-category" className="filter-select">
                  <option value="none">Không có (danh mục gốc)</option>
                  <option value="C001">Điện thoại</option>
                  <option value="C002">Laptop</option>
                  <option value="C003">Tai nghe</option>
                  <option value="C004">Tablet</option>
                  <option value="C005">Đồng hồ thông minh</option>
                </select>
              </div>
            </div>
            <div className="form-footer">
              <button className="button-outline" onClick={handleCloseDialog}>
                Hủy
              </button>
              <button className="button-primary" onClick={handleCloseDialog}>
                {isEdit ? 'Cập nhật' : 'Tạo danh mục'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}