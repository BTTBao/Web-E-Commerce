import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import ProductGrid from '../../components/ProductGrid/ProductGridWithSearch';
import './CategoryPage.css';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // --- Lấy query param "q" (từ khóa tìm kiếm) từ URL ---
  const query = new URLSearchParams(location.search);
  const urlSearchQuery = query.get('q') || '';

  // --- State ---
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // lưu danh sách gốc khi không tìm kiếm
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(urlSearchQuery);
  const [isSearching, setIsSearching] = useState(false);

  // --- Hàm fetch dữ liệu chính ---
  const fetchData = useCallback(async (currentSearchTerm) => {
    setError(null);
    let list = [];

    if (currentSearchTerm.trim()) {
      // Nếu có từ khóa tìm kiếm
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://localhost:7132/api/product/search?keyword=${encodeURIComponent(currentSearchTerm)}`
        );
        if (!response.ok) throw new Error(`Lỗi ${response.status}: ${response.statusText}`);

        const data = await response.json();
        list = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);

        // Nếu đang ở trang category, lọc theo category
        if (categoryName) {
          list = list.filter(
            (product) => product.category?.toLowerCase() === categoryName.toLowerCase()
          );
        }
      } catch (err) {
        console.error('Lỗi khi tìm kiếm sản phẩm:', err);
        setError(err.message || 'Không thể tìm kiếm sản phẩm. Vui lòng thử lại.');
      } finally {
        setIsSearching(false);
      }
    } else {
      // Nếu không có từ khóa → fetch theo category hoặc tất cả sản phẩm
      const endpoint = categoryName
        ? `https://localhost:7132/api/product/category/${categoryName}`
        : `https://localhost:7132/api/product`;

      try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`Lỗi ${response.status}: ${response.statusText}`);

        const data = await response.json();
        list = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
        setAllProducts(list);
      } catch (err) {
        console.error('Lỗi khi tải sản phẩm:', err);
        setError(err.message || 'Không thể tải sản phẩm. Vui lòng thử lại.');
        setAllProducts([]);
      }
    }

    setProducts(list);
  }, [categoryName]);

  // --- Theo dõi thay đổi URL hoặc category ---
  useEffect(() => {
    setSearchTerm(urlSearchQuery);

    if (urlSearchQuery.trim()) {
      setIsSearching(true);
      const timeoutId = setTimeout(() => fetchData(urlSearchQuery), 500); // debounce 500ms
      return () => clearTimeout(timeoutId);
    } else {
      fetchData('');
    }
  }, [urlSearchQuery, categoryName, fetchData]);

  // --- Xử lý thay đổi input tìm kiếm ---
  const handleSearchChange = (e) => {
    const newTerm = e.target.value;
    setSearchTerm(newTerm);

    const currentPath = location.pathname.startsWith('/search')
      ? '/search'
      : categoryName
      ? `/category/${categoryName}`
      : '/shop';

    const newUrl = newTerm.trim()
      ? `${currentPath}?q=${encodeURIComponent(newTerm)}`
      : currentPath;

    navigate(newUrl, { replace: true });
  };

  // --- Xử lý xóa tìm kiếm ---
  const handleClearSearch = () => {
    setSearchTerm('');
    const currentPath = categoryName ? `/category/${categoryName}` : '/shop';
    navigate(currentPath, { replace: true });
  };

  // --- Render lỗi ---
  if (error && !isSearching) {
    return (
      <div className="category-page">
        <div className="error-container">
          <AlertCircle className="error-icon" />
          <h2>Đã xảy ra lỗi</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // --- Render nội dung ---
  const displaySearchTerm = urlSearchQuery || searchTerm;
  const headerTitle = displaySearchTerm
    ? `KẾT QUẢ CHO "${displaySearchTerm.toUpperCase()}"`
    : categoryName
    ? categoryName.toUpperCase()
    : 'TẤT CẢ SẢN PHẨM';

  return (
    <div className="category-page">
      <div className="category-header">
        <h1 className="category-title">{headerTitle}</h1>

        {/* Phụ đề */}
        <p className="category-subtitle">
          {displaySearchTerm && !isSearching
            ? `Tìm thấy ${products.length} sản phẩm cho "${displaySearchTerm}"`
            : products.length > 0
            ? `${products.length} sản phẩm có sẵn`
            : 'Không có sản phẩm nào'}
        </p>
      </div>

      {/* Danh sách sản phẩm */}
      {products.length > 0 ? (
        <div className="category-content">
          <ProductGrid products={products} />
        </div>
      ) : (
        <div className="empty-category">
          <p>
            {displaySearchTerm
              ? `Không tìm thấy sản phẩm nào phù hợp với "${displaySearchTerm}"`
              : 'Hiện chưa có sản phẩm nào để hiển thị.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
