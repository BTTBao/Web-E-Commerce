import { useCallback, useMemo } from 'react';
import { useCart } from '../../hooks/useCart';
import './ProductCard.css';
import { FaStar, FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { productId, name, price, productImages, reviews } = product;
  const { addItem } = useCart();
  const navigate = useNavigate();

  // Lấy ảnh chính: tránh chuỗi rỗng -> dùng undefined để React không render attribute
  const primaryImage = useMemo(
    () => productImages.find(img => img?.isPrimary)?.imageUrl || undefined,
    [productImages]
  );

  // Tính trung bình rating
  const rating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  // thêm vào giỏ hàng
  const handleAddToCart = useCallback(() => {
    addItem({
      id: productId,
      name,
      price,
      quantity: 1,
      variantId: 1,
      variantName: "Test",
      image: primaryImage ?? null,
    });
  }, [addItem, productId, name, price, primaryImage]);

  //chuyển hướng sang chi tiết sản phẩm
  const handleClick = () => {
    navigate(`/product/${productId}`)
  }
  return (
    <div
      onClick={handleClick}
      className="product-card"
    >
      <div className="product-image-container">
        <img src={primaryImage} alt={name} className="product-image" />
      </div>

      <div className="product-details">
        <h3 className="product-title">{name}</h3>

        <div className="price-section">
          <span className="current-price">{price.toLocaleString()}₫</span>
        </div>

        <div className="review-and-action-section">
          <div className="rating-section">
            <span className="rating-score">{rating}</span>
            <div className="star-icons single-star">
              <FaStar className="star-filled" />
            </div>
          </div>

          <button
            className="add-to-cart-button"
            aria-label="Thêm vào giỏ hàng"
            onClick={handleAddToCart}
          >
            <FaShoppingCart className="cart-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
