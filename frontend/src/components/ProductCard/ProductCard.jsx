import './ProductCard.css';
import { FaStar, FaShoppingCart } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  const { productId, name, price, productImages, reviews } = product;

  // Lấy ảnh chính
  const primaryImage = productImages.find(img => img.isPrimary)?.url || '';

  // Tính trung bình rating
  const rating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const handleAddToCart = async () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingItem = cart.find(item => item.id === productId);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      alert(`🛒 Đã thêm sản phẩm "${name}" vào giỏ hàng (guest mode)`);
    } else {
      try {
        const response = await fetch('http://localhost:7132/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            userId: user.id,
            productId: productId,
            quantity: 1,
          }),
        });

        if (response.ok) {
          alert(`✅ Đã thêm "${name}" vào giỏ hàng của bạn`);
        } else {
          console.error('Lỗi khi thêm vào DB');
        }
      } catch (error) {
        console.error('Lỗi kết nối API:', error);
      }
    }
  };

  return (
    <div className="product-card">
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
