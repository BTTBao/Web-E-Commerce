import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import ProductGrid from '../../components/ProductGrid/ProductGridWithSearch';
import './CategoryPage.css';

const CategoryPage = () => {
  const { categoryName } = useParams();
  // Khởi tạo products là mảng rỗng. 
  // Trong khi chờ fetch, UI sẽ hiển thị "Hiện chưa có sản phẩm nào để hiển thị."
  const [products, setProducts] = useState([]); 
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setError(null);

      // Xác định endpoint API
      const isCategoryRoute = !!categoryName;
      const endpoint = isCategoryRoute
        ? `https://localhost:7132/api/product/category/${categoryName}`
        : `https://localhost:7132/api/product`; 

      try {
        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Kiểm tra xem API trả về gì
        let list = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data?.data && Array.isArray(data.data)) {
          list = data.data;
        } else {
          if (Object.keys(data).length === 0) {
            list = [];
          } else {
            throw new Error('Định dạng dữ liệu không hợp lệ');
          }
        }

        setProducts(list);
      } catch (err) {
        console.error('Lỗi khi tải sản phẩm:', err);
        setError(err.message || 'Không thể tải sản phẩm. Vui lòng thử lại.');
        setProducts([]);
      }
    };

    fetchProducts();
  }, [categoryName]);

  // Trạng thái lỗi (sẽ hiển thị ngay lập tức nếu fetchProducts() gặp lỗi)
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

  // Nếu không có lỗi, hiển thị nội dung chính.
  // Trong lúc chờ tải, products là [], nên sẽ hiển thị thông báo "Hiện chưa có sản phẩm nào..."
  const headerTitle = categoryName
    ? categoryName.toUpperCase()
    : 'TẤT CẢ SẢN PHẨM';

  return (
    <div className="category-page">
      <div className="category-header">
        <h1 className="category-title">{headerTitle}</h1>
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
          <p>Hiện chưa có sản phẩm nào để hiển thị.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;