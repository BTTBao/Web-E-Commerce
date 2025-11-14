import { ArrowLeftIcon, StarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./css/ProductReview.css";

const StarRatingInput = ({ rating, setRating }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="star-btn"
          onMouseEnter={() => setHoverRating(star)}
          onClick={() => setRating(star)}
        >
          <StarIcon
            stroke="none"
            fill="currentColor"
            className={
              star <= (hoverRating || rating) ? "star-active" : "star-inactive"
            }
            size={32}
          />
        </button>
      ))}
    </div>
  );
};

const ProductReviewForm = ({ item, review, onReviewChange }) => {
  return (
    <div className="review-card">
      <div className="row g-4">
        <div className="col-12 col-sm-3 text-center text-sm-start">
          <img
            src={item.imageUrl}
            alt={item.productName}
            className="review-img"
          />
        </div>

        <div className="col-12 col-sm-9">
          <p className="font-semibold text-gray-800">{item.productName}</p>
          <p className="text-gray-500">
            Size: {item.size} / Màu: {item.color}
          </p>

          <div className="mt-4">
            <p className="font-medium text-gray-700 mb-2">
              Chất lượng sản phẩm:
            </p>
            <StarRatingInput
              rating={review.rating}
              setRating={(newRating) =>
                onReviewChange({ ...review, rating: newRating })
              }
            />
          </div>

          <div className="mt-4">
            <label htmlFor={`cmt-${item.cartId}`} className="mb-1 font-medium">
              Bình luận của bạn:
            </label>
            <textarea
              id={`cmt-${item.cartId}`}
              rows={3}
              value={review.comment}
              onChange={(e) =>
                onReviewChange({ ...review, comment: e.target.value })
              }
              className="review-textarea"
              placeholder="Hãy chia sẻ cảm nhận của bạn..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

function ProductReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [reviews, setReviews] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/orders/DH${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  // Tạo state reviews AN TOÀN sau khi order có dữ liệu
  useEffect(() => {
    if (order) {
      const initial = {};
      order.items.forEach((item) => {
        initial[item.productId] = { rating: 0, comment: "" };
      });
      setReviews(initial);
    }
  }, [order]);

  if (loading) return <h3 className="text-center my-5">Đang tải...</h3>;
  if (error) return <h3 className="text-center text-danger my-5">{error}</h3>;
  if (!order) return null;

  const handleReviewChange = (productId, review) => {
    setReviews((prev) => ({ ...prev, [productId]: review }));
  };

  const handleSubmit = () => {
    console.log("Submitted reviews:", reviews);
    alert("Cảm ơn bạn đã gửi đánh giá! (Test: Chưa lưu backend)");
    setTimeout(() => navigate(-1), 1000);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <button
            onClick={() => {
              setTimeout(() => navigate("/profile"), 500);
            }}
            className="btn-back mb-4"
          >
            <ArrowLeftIcon size={20} />
            Quay lại Lịch sử đơn hàng
          </button>

          <h1
            className="font-bold text-gray-900 mb-1"
            style={{ fontSize: "32px" }}
          >
            Đánh giá sản phẩm
          </h1>

          <p className="text-gray-500 mb-4">
            Đơn hàng: <span className="font-semibold">{order.id}</span>
          </p>

          <div className="mb-4">
            {order.items.map((item) => (
              <div className="mb-4" key={item.productId}>
                <ProductReviewForm
                  item={item}
                  review={reviews[item.productId] || { rating: 0, comment: "" }}
                  onReviewChange={(r) => handleReviewChange(item.productId, r)}
                />
              </div>
            ))}
          </div>

          <button onClick={handleSubmit} className="btn-submit">
            Gửi đánh giá
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductReview;
