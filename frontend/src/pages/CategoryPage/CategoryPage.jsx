import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader, AlertCircle } from 'lucide-react';
import ProductGrid from '../../components/ProductGrid/ProductGridWithSearch';
import './CategoryPage.css';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Gọi API từ backend
        const response = await fetch(
          `https://localhost:7132/api/product/category/${categoryName}`
        );

        if (!response.ok) {
          throw new Error(`Lỗi: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if ((data.status === "success" && Array.isArray(data.data)) || Array.isArray(data)) {
            setProducts(data.data);
        } else {
            throw new Error("Định dạng dữ liệu không hợp lệ");
        }

      } catch (err) {
        console.error('Lỗi khi tải sản phẩm:', err);
        setError(err.message || 'Không thể tải sản phẩm. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) {
      fetchProducts();
    }
  }, [categoryName]);

  // Loading state
  if (loading) {
    return (
      <div className="category-page">
        <div className="loading-container">
          <Loader className="loading-spinner" />
          <p>Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="category-page">
        <div className="error-container">
          <AlertCircle className="error-icon" />
          <h2>Đã xảy ra lỗi</h2>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Format category name for display
  const formattedCategoryName = categoryName
    ? categoryName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : 'Sản phẩm';

  return (
    <div className="category-page">
      <div className="category-header">
        <h1 className="category-title">{formattedCategoryName}</h1>
        <p className="category-subtitle">
          {products.length > 0
            ? `${products.length} sản phẩm có sẵn`
            : 'Không có sản phẩm nào'}
        </p>
      </div>

      {products.length > 0 ? (
        <div className="category-content">
          <ProductGrid products={products} />
        </div>
      ) : (
        <div className="empty-category">
          <p>Hiện chưa có sản phẩm trong danh mục này.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;