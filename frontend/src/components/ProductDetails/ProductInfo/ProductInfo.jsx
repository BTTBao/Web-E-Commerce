import { useState, useCallback, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '../../../utils/formatPrice';
import { useCart } from '../../../hooks/useCart';
import './ProductInfo.css'

function ProductInfo({ product }) {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState(null);
  const [variantId, setVariantId] = useState(undefined)
  const { addItem, validateStock } = useCart();

  const { productId, name, price, productImages, reviews, soldCount } = product;
  const variants = product.productVariants && product.productVariants.length
    ? product.productVariants
    : [];
  // Khi product thay đổi, gán variantId mặc định
  useEffect(() => {
    if (variants.length > 0) {
      setVariantId(0); // lấy biến thể đầu tiên mặc định
    } else {
      setVariantId(undefined); // không có biến thể
    }
  }, [variants]);

  const image = useMemo(
    () => productImages.find(img => img?.isPrimary)?.imageUrl || undefined,
    [productImages]
  );
  const singleItem = {
    id: productId,
    name: name,
    price: price,
    quantity: 1,
    variantId: variantId ?? undefined,
    variantName: selectedSize,
    image
  };
  const handleBuyNow = useCallback(async () => {
    // validate biến thể
    if (variantId == 0) {
      toast.dismiss();
      toast.warning("Vui lòng chọn biến thể");
      return;
    }
    // Kiểm tra tồn kho
    const isStockValid = await validateStock(
      singleItem.id || singleItem.productId,
      singleItem.variantId,
      singleItem.quantity
    );

    if (!isStockValid) return;

    navigate('/checkout?type=buynow', {
      state: { items: [singleItem], mode: 'buynow' },
      replace: false,
    });
  }, [product, variantId, selectedSize]);

  return (
    <div class="product-info">
      <div class="product-header">
        <h1>{name}</h1>
        <div class="price-section">
          <span class="price">{formatPrice(price)}</span>
          <span class="old-price">{formatPrice(price * 0.9)}</span>
        </div>
        <p>Đã bán: {soldCount}+</p>
      </div>

      {/* Size Selection */}
      <div class="size-section">
        <div class="size-header">
          {variants.length ? <label>Chọn biến thể</label> : ""}
        </div>
        <div class="size-options">
          {variants.map((size) => (
            <button
              key={size.variantId}
              type="button"
              onClick={() => {
                setVariantId(size.variantId);
                setSelectedSize(size.size || size.color)
              }}
              className={selectedSize === (size.size || size.color) ? 'size-btn active' : 'size-btn'}
            >
              {size.size || size.color}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div class="action-buttons">
        <Link
          className="btn-cart btn-add-cart"
          to="/cart"
          onClick={(e) => {
            e.preventDefault();
            addItem({
              id: productId,
              name: name,
              price: price,
              quantity: 1,
              variantId,
              variantName: selectedSize,
              image
            })
          }}
        >
          <ShoppingCart />Thêm vào giỏ hàng
        </Link>
        <button
          onClick={handleBuyNow}
          className="btn-cart btn-secondary">
          Mua ngay
        </button>
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