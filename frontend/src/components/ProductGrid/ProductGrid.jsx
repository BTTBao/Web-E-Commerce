import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard'; 
import './ProductGrid.css';

const ROWS_PER_PAGE = 7; 
const MAX_VISIBLE_PAGES = 4; 

const ProductGrid = ({ products }) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_ROW = 4;
  
  const ITEMS_PER_PAGE = ROWS_PER_PAGE * ITEMS_PER_ROW;

  const totalPages = useMemo(() => {
    if (!products || products.length === 0) return 1;
    return Math.ceil(products.length / ITEMS_PER_PAGE);
  }, [products, ITEMS_PER_PAGE]);

  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return products ? products.slice(startIndex, endIndex) : [];
  }, [products, currentPage, ITEMS_PER_PAGE]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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
      <div className="product-grid">
        {currentProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

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
    </div>
  );
};

export default ProductGrid;