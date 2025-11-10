import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import axios from 'axios';
import './CategoryList.css';

// --- Component con để render cây đệ quy ---
function CategoryTreeItem({ category, level = 0, onDelete, onEdit }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className="tree-branch">
      <div
        className="tree-item"
        style={{ paddingLeft: `${level * 24 + 16}px` }}
      >
        <div className="tree-item-content">
          {hasChildren ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="tree-toggle-btn"
            >
              {expanded ? (
                <ChevronDown width={16} height={16} />
              ) : (
                <ChevronRight width={16} height={16} />
              )}
            </button>
          ) : (
            <div className="tree-item-spacer" />
          )}
          <span className="tree-item-name">{category.name}</span>
          <span className="tree-item-id">({category.id})</span>
        </div>
        <div className="tree-item-actions">
          <button
            className="action-button-icon"
            onClick={() => onEdit(category)} // ✅ Gọi hàm chỉnh sửa
          >
            <Edit width={16} height={16} />
          </button>
          <button
            className="action-button-icon-destructive"
            onClick={() => onDelete(category.id, category.name)}
          >
            <Trash2 width={16} height={16} />
          </button>
        </div>
      </div>

      {expanded && hasChildren && (
        <div className="tree-children">
          {category.children.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              level={level + 1}
              onDelete={onDelete}
              onEdit={onEdit}
            />
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
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [parentName, setParentName] = useState("none");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await axios.get("https://localhost:7132/api/category");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // ✅ Mở dialog thêm/sửa
  const handleOpenDialog = (isEditing = false, category = null) => {
    setIsEdit(isEditing);
    if (isEditing && category) {
      setEditCategoryId(category.id);
      setCategoryName(category.name);
      setParentName(category.parentName || "none");
    } else {
      setEditCategoryId(null);
      setCategoryName("");
      setParentName("none");
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => setDialogOpen(false);

  // ✅ Xử lý thêm / sửa
  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      alert("Vui lòng nhập tên danh mục!");
      return;
    }

    const payload = {
      name: categoryName,
      parentName: parentName === "none" ? null : parentName,
    };

    try {
      let res;
      if (isEdit && editCategoryId) {
        res = await axios.put(`https://localhost:7132/api/category/${editCategoryId}`, payload);
      } else {
        res = await axios.post("https://localhost:7132/api/category", payload);
      }

      if (res.data.status === "success") {
        alert(res.data.message);
        await loadCategories();
        handleCloseDialog();
      } else {
        alert(res.data.message || "Có lỗi xảy ra!");
      }
    } catch (err) {
      console.error("Lỗi gửi dữ liệu:", err);
      alert("Không thể kết nối tới server!");
    }
  };

  // ✅ Xóa danh mục
  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}" không?`)) return;

    try {
      const res = await axios.delete(`https://localhost:7132/api/category/${id}`);
      if (res.data.status === "success") {
        alert(res.data.message);
        await loadCategories();
      } else {
        alert(res.data.message || "Không thể xóa danh mục này!");
      }
    } catch (err) {
      console.error("Lỗi khi xóa:", err);
      alert("Không thể kết nối tới server!");
    }
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

      {/* --- Cây danh mục --- */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Cây danh mục</h3>
        </div>
        <div className="card-content" style={{ padding: 0 }}>
          <div className="category-tree-wrapper">
            {categories.length > 0 ? (
              categories.map((category) => (
                <CategoryTreeItem
                  key={category.id}
                  category={category}
                  onDelete={handleDeleteCategory}
                  onEdit={(cat) => handleOpenDialog(true, cat)}
                />
              ))
            ) : (
              <p style={{ padding: '16px', color: '#666' }}>Chưa có danh mục nào</p>
            )}
          </div>
        </div>
      </div>

      {/* --- Dialog (Modal) Thêm/Sửa --- */}
      {dialogOpen && (
        <div className="dialog-overlay" onClick={handleCloseDialog}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3 className="dialog-title">
                {isEdit ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </h3>
            </div>
            <div className="form-group-stack">
              <div className="form-group">
                <label htmlFor="category-name">Tên danh mục</label>
                <input
                  id="category-name"
                  className="form-input"
                  placeholder="Nhập tên danh mục"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="parent-category">Danh mục cha (tùy chọn)</label>
                <select
                  id="parent-category"
                  className="filter-select"
                  value={parentName || "none"}
                  onChange={(e) => setParentName(e.target.value)}
                >
                  <option value="none">Không có (danh mục gốc)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-footer">
              <button className="button-outline" onClick={handleCloseDialog}>
                Hủy
              </button>
              <button className="button-primary" onClick={handleSubmit}>
                {isEdit ? "Cập nhật" : "Tạo danh mục"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
