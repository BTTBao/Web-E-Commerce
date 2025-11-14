// src/pages/Admin/Products.jsx
import { useState, useEffect } from "react";
import { Plus, Edit, Eye, EyeOff, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import './Orders.css';
import './Products.css';

const statusColors = {
  Active: 'badge-green',
  Hidden: 'badge-gray',
};

export default function Products() {
  const navigate = useNavigate();

  // ✅ Các hook phải nằm bên trong component
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);

  // ✅ useEffect cũng phải nằm trong component
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await axios.get("https://localhost:7132/api/category");
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://localhost:7132/api/product");
        if (!response.ok) {
          throw new Error(`Lỗi: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (data.status === "success" && Array.isArray(data.data)) {
          console.log(data.data);
          setProducts(data.data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
        setError(err.message || "Không thể tải sản phẩm. Vui lòng thử lại.");
      }
    };
    fetchProducts();
    loadCategories();
  }, []);

  // Lọc sản phẩm
  const filteredProducts = products.filter((product) => {
    const matchesCategory = categoryFilter === 'all' || product.categoryId === Number(categoryFilter);
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleAddProduct = () => navigate('/admin/products/add');
  const handleEditProduct = (productId) => navigate(`/admin/products/edit/${productId}`);
  const handleChangeStatus = (product) =>{
    const newProduct = {...product, status: product.status === 'Active' ? 'Hidden' : 'Active'};

    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.productId === product.productId ? newProduct : p
      )
    );
    fetch(`https://localhost:7132/api/product/${product.productId}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(newProduct)
    }).then((res) =>{
      if(!res.ok) throw new Error('Lỗi cập nhật');
      return res.json();
    }).then((data)=> console.log(data))
    .catch((error) => console.log(error));
  }

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
              {categories.map((c =>{
                if(c.parentId !== null)
                return(
                  <option key={c.id} value={c.id}>{c.name}</option>
                );
              }))}
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
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Tồn kho</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {
                filteredProducts.map((product) => {
                  const categoryName = categories.find(c => c.id === product.categoryId)?.name || '';

                  const minPrice =
                    product.productVariants && product.productVariants.length > 0
                      ? Math.min(...product.productVariants.map(v => Number(v.price) || 0))
                      : Number(product.price) || 0;

                  const totalStock =
                    product.productVariants && product.productVariants.length > 0
                      ? product.productVariants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0)
                      : Number(product.stockQuantity) || 0;

                  product.price = minPrice;
                  product.stockQuantity = totalStock;

                      
                  return(  
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{categoryName}</td>
                    <td>{product.price != null ? product.price.toLocaleString('vi-VN') + ' đ' : '-'}</td>
                    <td>
                    <span className={product.stockQuantity < 10 ? 'stock-low' : 'stock-normal'}>
                      {product.stockQuantity != null && product.stockQuantity !== 0 ? product.stockQuantity : '-'}
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
                          onClick={() => handleEditProduct(product.productId)}
                        >
                          <Edit width={16} height={16} />
                        </button>
                        <button className="action-button-icon" onClick={() =>(handleChangeStatus(product))}>
                          {product.status === 'Active' ? (
                            <EyeOff width={16} height={16} />
                          ) : (
                            <Eye width={16} height={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
