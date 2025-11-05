import React from 'react'
import './ProductInfo.css'
import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../../utils/formatPrice';

function ProductInfo({product}) {
  const [selectedSize, setSelectedSize] = useState(null);
  const variants = product.productVariants || ['S','M','L','XL'] // fallback
  
  return (
    <div class="product-info">
      <div class="product-header">
        <h1>{product.name}</h1>
        <div class="price-section">
          <span class="price">{formatPrice(product.price)}</span>
          <span class="old-price">{formatPrice(product.price * 0.9)}</span>
        </div>
      </div>

      {/* Size Selection */}
      <div class="size-section">
        <div class="size-header">
          <label>Chọn kích cỡ</label>
        </div>
        <div class="size-options">
          {variants.map((size) => (
            <button
              key={size.variantId}
              type="button"
              onClick={() => setSelectedSize(size.variantName)}
              className={selectedSize === size.variantName ? 'size-btn active' : 'size-btn'}
            >
              {size.variantName.substring(size.variantName.indexOf(" ") + 1)}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div class="action-buttons">
        <Link className="btn-cart btn-add-cart" to="/cart">
          <ShoppingCart />Thêm vào giỏ hàng
        </Link>
        <Link className="btn-cart btn-secondary" to="/checkout">
          Mua ngay
        </Link>
      </div>

      {/* Product Details */}
      <div class="product-details">
        <h3>Chi tiết sản phẩm</h3>
        <ul>
          <li>Kích thước: XS - S - M - L - XL</li>
          <li>Chất liệu: Cotton</li>
          <li>Regular fit</li>
          <li>Artwork được áp dụng kỹ thuật in lụa và thêu đắp mảnh (Patches)</li>
        </ul>
      </div>

      {/* Size Chart */}
      <div class="size-chart">
        <h3>Bảng size</h3>
        <div class="size-chart-image">
          <img src="https://bizweb.dktcdn.net/100/369/010/files/sc-regular-t-shirt-2024-1.png" alt="Size Chart" />
        </div>
      </div>
    </div>
  )
}

export default ProductInfo