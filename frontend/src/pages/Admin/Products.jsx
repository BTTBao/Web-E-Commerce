// src/pages/Admin/Products.jsx

import React, { useState } from 'react';
import { Plus, Edit, Eye, EyeOff, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import CSS (Dùng chung Orders.css và thêm Products.css)
import './Orders.css'; 
import './Products.css'; 

// Dữ liệu mẫu (giữ nguyên)
const products = [
  {
    id: 'P001',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
    name: 'iPhone 15 Pro Max',
    category: 'Điện thoại',
    price: 29990000,
    stock: 45,
    status: 'Active',
  },
  {
    id: 'P002',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c',
    name: 'Samsung Galaxy S24 Ultra',
    category: 'Điện thoại',
    price: 26990000,
    stock: 32,
    status: 'Active',
  },
  {
    id: 'P003',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',
    name: 'Laptop Dell XPS 15',
    category: 'Laptop',
    price: 42990000,
    stock: 15,
    status: 'Active',
  },
  {
    id: 'P004',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
    name: 'AirPods Pro 2',
    category: 'Tai nghe',
    price: 6990000,
    stock: 78,
    status: 'Active',
  },
  {
    id: 'P005',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0',
    name: 'iPad Air M2',
    category: 'Tablet',
    price: 16990000,
    stock: 5, // < 10, sẽ bị tô đỏ
    status: 'Active',
  },
  {
    id: 'P006',
    image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9',
    name: 'Apple Watch Series 9',
    category: 'Đồng hồ thông minh',
    price: 10990000,
    stock: 0, // < 10, sẽ bị tô đỏ
    status: 'Hidden',
  },
];

// Định nghĩa class màu (giống Orders.css)
const statusColors = {
  Active: 'badge-green',
  Hidden: 'badge-gray',
};

export default function Products() {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Logic lọc (giữ nguyên)
  const filteredProducts = products.filter((product) => {
    const matchesCategory = categoryFilter === 'all' || product.category === 'Tất cả danh mục' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Hàm điều hướng
  const handleAddProduct = () => {
    navigate('/admin/products/add');
  };

  const handleEditProduct = (productId) => {
    navigate(`/admin/products/edit/${productId}`);
  };

  return (
    <div className="orders-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Sản phẩm</h1>
          <p className="page-subtitle">Quản lý toàn bộ sản phẩm trong cửa hàng</p>
        </div>
        <button onClick={handleAddProduct} className="button-primary">
          <Plus width={16} height={16} style={{ marginRight: '8px' }} />
          Thêm sản phẩm
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="filter-bar">
            <div className="search-wrapper">
              <Search className="search-icon" />
              <input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="filter-select">
              <option value="all">Tất cả danh mục</option>
              <option value="Điện thoại">Điện thoại</option>
              <option value="Laptop">Laptop</option>
              <option value="Tai nghe">Tai nghe</option>
              <option value="Tablet">Tablet</option>
              <option value="Đồng hồ thông minh">Đồng hồ thông minh</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
              <option value="all">Tất cả trạng thái</option>
              <option value="Active">Đang hiển thị</option>
              <option value="Hidden">Đã ẩn</option>
            </select>
          </div>
        </div>
        <div className="card-content">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Tồn kho</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-table-image"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/80'}
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.price.toLocaleString('vi-VN')} đ</td>
                    <td>
                      <span className={product.stock < 10 ? 'stock-low' : 'stock-normal'}>
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${statusColors[product.status]}`}>
                        {product.status === 'Active' ? 'Hiển thị' : 'Đã ẩn'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons">
                        <button
                          className="action-button-icon"
                          onClick={() => handleEditProduct(product.id)}
                        >
                          <Edit width={16} height={16} />
                        </button>
                        <button className="action-button-icon">
                          {product.status === 'Active' ? (
                            <EyeOff width={16} height={16} />
                          ) : (
                            <Eye width={16} height={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}