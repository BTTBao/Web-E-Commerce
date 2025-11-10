import React, { useState, useMemo } from 'react';
import { ChevronDown, X } from 'lucide-react';
import ProductCard from '../ProductCard/ProductCard';
import './ProductGrid.css';

const ROWS_PER_PAGE = 7;
const MAX_VISIBLE_PAGES = 4;

const PRICE_RANGES = [
  { id: 'under100k', label: 'Dưới 100.000 VNĐ', min: 0, max: 100000 },
  { id: '100-200k', label: '100.000 - 200.000 VNĐ', min: 100000, max: 200000 },
  { id: '200-300k', label: '200.000 - 300.000 VNĐ', min: 200000, max: 300000 },
  { id: '300-400k', label: '300.000 - 400.000 VNĐ', min: 300000, max: 400000 },
  { id: '400-500k', label: '400.000 - 500.000 VNĐ', min: 400000, max: 500000 },
  { id: 'over500k', label: 'Trên 500.000 VNĐ', min: 500000, max: Infinity },
];

const COLORS = ['Đen', 'Trắng', 'Xanh dương', 'Đỏ', 'Vàng', 'Titan Tự nhiên', 'Xám'];
const SIZES = ['128GB', '256GB', '512GB', '1TB', 'S', 'M', 'L', 'XL'];

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Liên quan' },
  { id: 'price-asc', label: 'Giá: Thấp → Cao' },
  { id: 'price-desc', label: 'Giá: Cao → Thấp' },
  { id: 'newest', label: 'Mới nhất' },
];

const FilterDropdown = ({ title, options, selectedItems, onToggle, onClear, id, openDropdown, setOpenDropdown }) => {
  const isOpen = openDropdown === id; // Mở nếu id trùng dropdown đang mở

  const handleToggle = () => {
    setOpenDropdown(isOpen ? null : id); // Mở dropdown này, đóng dropdown khác
  };

  return (
    <div className="filter-dropdown-wrapper">
      <button
        className={`filter-dropdown-btn ${selectedItems.length > 0 ? 'active' : ''}`}
        onClick={handleToggle}
      >
        <span>{title}</span>
        {selectedItems.length > 0 && <span className="filter-badge">{selectedItems.length}</span>}
        <ChevronDown width={16} height={16} />
      </button>

      {isOpen && (
        <div className="filter-dropdown-menu">
          <div className="filter-options">
            {options.map(option => (
              <label key={option.id} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(option.id)}
                  onChange={() => onToggle(option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {selectedItems.length > 0 && (
            <button className="filter-clear-btn" onClick={onClear}>
              <X width={14} height={14} /> Xóa lọc
            </button>
          )}
        </div>
      )}
    </div>
  );
};


const ProductGridWithSearch = ({ products }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [openDropdown, setOpenDropdown] = useState(null); // 'price', 'color', 'size' hoặc null


  const ITEMS_PER_ROW = 4;
  const ITEMS_PER_PAGE = ROWS_PER_PAGE * ITEMS_PER_ROW;

  // Lọc sản phẩm
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter(product => {
      // Lọc giá
      if (selectedPrices.length > 0) {
        const matchPrice = selectedPrices.some(priceId => {
          const range = PRICE_RANGES.find(r => r.id === priceId);
          return product.price >= range.min && product.price <= range.max;
        });
        if (!matchPrice) return false;
      }

      // Lọc màu
      if (selectedColors.length > 0) {
        const hasColor = selectedColors.some(color =>
          product.colors?.includes(color) || product.color === color
        );
        if (!hasColor) return false;
      }

      // Lọc size
      if (selectedSizes.length > 0) {
        const hasSize = selectedSizes.some(size =>
          product.sizes?.includes(size) || product.size === size
        );
        if (!hasSize) return false;
      }

      return true;
    });
  }, [products, selectedPrices, selectedColors, selectedSizes]);

  // Sắp xếp sản phẩm
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default: // relevance
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  // Phân trang
  const totalPages = useMemo(() => {
    if (sortedProducts.length === 0) return 1;
    return Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  }, [sortedProducts, ITEMS_PER_PAGE]);

  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedProducts.slice(startIndex, endIndex);
  }, [sortedProducts, currentPage, ITEMS_PER_PAGE]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePriceToggle = (priceId) => {
    setSelectedPrices(prev =>
      prev.includes(priceId) ? prev.filter(p => p !== priceId) : [...prev, priceId]
    );
    setCurrentPage(1);
  };

  const handleColorToggle = (color) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
    setCurrentPage(1);
  };

  const handleSizeToggle = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const renderPageNumbers = () => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return [...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
          onClick={() => handlePageChange(index + 1)}
        >
          {index + 1}
        </button>
      ));
    }

    let pages = [];
    const DOTS = '...';

    pages.push(1);

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    if (startPage > 2) {
      pages.push(DOTS);
    }

    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    if (endPage < totalPages - 1) {
      pages.push(DOTS);
    }

    if (totalPages !== 1 && pages[pages.length - 1] !== totalPages) {
      pages.push(totalPages);
    }

    pages = pages.filter((page, index) => page !== DOTS || pages[index - 1] !== DOTS);

    return pages.map((page, index) => {
      if (page === DOTS) {
        return <span key={index} className="pagination-dots">{DOTS}</span>;
      }

      return (
        <button
          key={index}
          className={`pagination-number ${currentPage === page ? 'active' : ''}`}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </button>
      );
    });
  };

  if (!products || products.length === 0) {
    return <div className="product-grid-empty">Không có sản phẩm nào để hiển thị.</div>;
  }

  return (
    <div className="product-grid-container">
      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-controls">
          <FilterDropdown
            id="price"
            title="Giá"
            options={PRICE_RANGES}
            selectedItems={selectedPrices}
            onToggle={handlePriceToggle}
            onClear={() => { setSelectedPrices([]); setCurrentPage(1); }}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />

          <FilterDropdown
            id="color"
            title="Màu sắc"
            options={COLORS.map(color => ({ id: color, label: color }))}
            selectedItems={selectedColors}
            onToggle={handleColorToggle}
            onClear={() => { setSelectedColors([]); setCurrentPage(1); }}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />

          <FilterDropdown
            id="size"
            title="Size"
            options={SIZES.map(size => ({ id: size, label: size }))}
            selectedItems={selectedSizes}
            onToggle={handleSizeToggle}
            onClear={() => { setSelectedSizes([]); setCurrentPage(1); }}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />

        </div>

        <div className="sort-controls">
          <select value={sortBy} onChange={handleSortChange} className="sort-select">
            {SORT_OPTIONS.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result info */}
      <div className="filter-result-info">
        {sortedProducts.length > 0 ? (
          <span>Tìm thấy {sortedProducts.length} sản phẩm</span>
        ) : (
          <span className="no-result">Không tìm thấy sản phẩm phù hợp</span>
        )}
      </div>

      {/* Product Grid */}
      {sortedProducts.length > 0 ? (
        <>
          <div className="product-grid">
            {currentProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <div className="pagination-info">
                Trang {currentPage} trên {totalPages}
              </div>
              <div className="pagination-buttons">
                {currentPage > 1 && (
                  <button
                    className="pagination-button"
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Trang trước
                  </button>
                )}

                {renderPageNumbers()}

                {currentPage < totalPages && (
                  <button
                    className="pagination-button"
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Trang kế tiếp
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="product-grid-empty">Không có sản phẩm nào phù hợp với bộ lọc.</div>
      )}
    </div>
  );
};

export default ProductGridWithSearch;