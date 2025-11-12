import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import ProductGrid from '../../components/ProductGrid/ProductGridWithSearch';
import './CategoryPage.css'; // Dùng lại CSS của CategoryPage

const BestsellerPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBestsellers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('https://localhost:7132/api/product/bestseller');

        if (!response.ok) {
          throw new Error(`Lỗi: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if ((data.status === "success" && Array.isArray(data.data)) || Array.isArray(data)) {
          setProducts(data.data || data);
        } else {
          throw new Error("Định dạng dữ liệu không hợp lệ");
        }

      } catch (err) {
        console.error('Lỗi khi tải sản phẩm bán chạy:', err);
        setError(err.message || 'Không thể tải sản phẩm bán chạy. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchBestsellers();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="category-page">
        <div className="loading-container">
          <Loader className="loading-spinner" />
          <p>Đang tải sản phẩm bán chạy...</p>
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

  return (
    <div className="category-page">
      <div className="category-header">
        <h1 className="category-title">Sản phẩm bán chạy</h1>
        <p className="category-subtitle">
          {products.length > 0
            ? `${products.length} sản phẩm được mua nhiều nhất`
            : 'Không có sản phẩm nào'}
        </p>
      </div>

      {products.length > 0 ? (
        <div className="category-content">
          <ProductGrid products={products} />
        </div>
      ) : (
        <div className="empty-category">
          <p>Hiện chưa có sản phẩm bán chạy nào.</p>
        </div>
      )}
    </div>
  );
};

export default BestsellerPage;
