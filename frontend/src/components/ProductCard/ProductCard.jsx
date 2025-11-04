import './ProductCard.css';
import { FaStar, FaShoppingCart } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  const { id, imageUrl, title, currentPrice, oldPrice, rating } = product;

  const handleAddToCart = async () => {
    const user = JSON.parse(localStorage.getItem('user')); 

    if (!user) {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingItem = cart.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      alert(`🛒 Đã thêm sản phẩm "${title}" vào giỏ hàng (guest mode)`);
    } else {
      try {
        const response = await fetch('http://localhost:8080/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`, 
          },
          body: JSON.stringify({
            userId: user.id,
            productId: id,
            quantity: 1,
          }),
        });

        if (response.ok) {
          alert(`✅ Đã thêm "${title}" vào giỏ hàng của bạn`);
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
        <img src={imageUrl} alt={title} className="product-image" />
      </div>

      <div className="product-details">
        <h3 className="product-title">{title}</h3>

        <div className="price-section">
          <span className="current-price">{currentPrice}₫</span>
          {oldPrice && <span className="old-price">{oldPrice}₫</span>}
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
