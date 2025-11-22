import { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Eye, EyeOff, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import './Orders.css';
import './Products.css';

const statusColors = {
  Active: 'badge-green',
  Hidden: 'badge-gray',
};

const ITEMS_PER_PAGE = 10;

export default function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

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
        if (!response.ok) throw new Error(`Lỗi: ${response.statusText}`);

        const data = await response.json();
        setProducts(data.data || []);
        
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
        setError(err.message);
      }
    };

    fetchProducts();
    loadCategories();
  }, []);

  // -----------------------------
  //  FILTER + CACHE RESULT
  // -----------------------------
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory =
        categoryFilter === "all" || product.categoryId === Number(categoryFilter);

      const matchStatus =
        statusFilter === "all" || product.status === statusFilter;

      const matchSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase());

      return matchCategory && matchStatus && matchSearch;
    });
  }, [products, categoryFilter, statusFilter, searchTerm]);

  // -----------------------------
  //  RESET TRANG KHI FILTER ĐỔI
  // -----------------------------
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, statusFilter, searchTerm]);

  // -----------------------------
  //  PHÂN TRANG
  // -----------------------------
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;

  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleAddProduct = () => navigate('/admin/products/add');
  const handleEditProduct = (productId) => navigate(`/admin/products/edit/${productId}`);

  const handleChangeStatus = async (product) => {
    const newStatus = product.status === "Active" ? "Hidden" : "Active";

    setProducts(prev =>
      prev.map(p => p.productId === product.productId ? { ...p, status: newStatus } : p)
    );

    try {
      await axios.put(`https://localhost:7132/api/product/${product.productId}/status`, {
        status: newStatus
      });
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
    }
  };

  const updateProducts = async (product) => {
    try {
      // Tính minPrice và totalStock
      const minPrice = product.productVariants?.length
        ? Math.min(...product.productVariants.map(v => Number(v.price)))
        : Number(product.price);

      const totalStock = product.productVariants?.length
        ? product.productVariants.reduce((sum, v) => sum + Number(v.stockQuantity), 0)
        : Number(product.stockQuantity);

      const dto = { ...product, price: minPrice, stockQuantity: totalStock };

      const res = await fetch(`https://localhost:7132/api/product/${product.productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });

      if (!res.ok) throw new Error('Cập nhật thất bại');

      return dto;
    } catch (err) {
      console.error(err);
      return null;
    }
  };
  // useEffect(() => {
  //   const syncProducts = async () => {
  //     const updatedProducts = await Promise.all(
  //       products.map(p => updateProducts(p))
  //     );
  //     setProducts(updatedProducts.filter(Boolean));
  //   };

  //   if (products.length) syncProducts();
  // }, [products]);

  return (
    <div className="orders-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Sản phẩm</h1>
          <p className="page-subtitle">Quản lý toàn bộ sản phẩm trong cửa hàng</p>
        </div>

        <button onClick={handleAddProduct} className="button-primary">
          <Plus width={16} height={16} style={{ marginRight: "8px" }} />
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
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Tất cả danh mục</option>
              {categories
                // .filter((c) => c.parentId !== null)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>

            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
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
                  <th>Giá thấp nhất</th>
                  <th>Tồn kho</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {currentProducts.map((product) => {
                  updateProducts(product);
                  const { productId, name, categoryId, status, price, stockQuantity, productVariants } = product;

                  const categoryName = categories.find((c) => c.id === categoryId)?.name || "";

                  const badgeClass = `badge ${statusColors[status]}`;

                  return (
                    <tr key={productId}>
                      <td>{name}</td>
                      <td>{categoryName}</td>
                      <td>{product.price?.toLocaleString("vi-VN")} đ</td>
                      <td className={product.stockQuantity < 10 ? "stock-low" : "stock-normal"}>
                        {product.stockQuantity || '-'}
                      </td>
                      <td>
                        <span className={badgeClass}>
                          {status === "Active" ? "Hiển thị" : "Đã ẩn"}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="action-buttons">
                          <button
                            className="action-button-icon"
                            onClick={() => handleEditProduct(productId)}
                          >
                            <Edit width={16} height={16} />
                          </button>
                          <button
                            className="action-button-icon"
                            onClick={() => handleChangeStatus(product)}
                          >
                            {status === "Active" ? (
                              <EyeOff width={16} height={16} />
                            ) : (
                              <Eye width={16} height={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>


            </table>
          </div>

          {/* ------------------ PAGINATION ------------------ */}
          {/* PHÂN TRANG GIỐNG ORDERS */}
          <div className="pagination-footer">
            <span className="pagination-summary">
              Hiển thị <strong>{indexOfFirstItem + 1}</strong>
              - <strong>{Math.min(indexOfLastItem, filteredProducts.length)}</strong>
              {" "} của <strong>{filteredProducts.length}</strong> sản phẩm
            </span>

            <div className="pagination-controls">

              {/* Nút Prev */}
              <button
                className={`page-btn ${currentPage === 1 ? "disabled" : ""}`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
              </button>

              {/* Hiển thị danh sách số trang — giống Orders */}
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                return (
                  <button
                    key={pageNum}
                    className={`page-number ${currentPage === pageNum ? "active" : ""}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Nút Next */}
              <button
                className={`page-btn ${currentPage === totalPages ? "disabled" : ""}`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={18} />
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
