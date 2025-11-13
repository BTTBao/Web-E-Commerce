import { MessageCircleMore, StarIcon, StarsIcon } from 'lucide-react';
import "../ProductReview/ProductReview.css";
import { formatDate } from '../../../utils/formatDate';
import axiosClient from '../../../api/axiosClient';
import { useEffect, useState } from 'react';

const RatingBar = ({ rating, percentage }) => (
    <div className="d-flex align-items-center mb-2">
        <span className="me-2 d-flex align-items-center">
            {rating}
            <StarIcon
                width={16}
                height={16}
                stroke="none"
                fill="currentColor"
                className="ms-1 text-warning"
            />
        </span>
        <div className="flex-grow-1 bg-light rounded-pill rating-bar">
            <div
                className="bg-warning rounded-pill h-100"
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
        <span className="ms-2 text-muted">{percentage}%</span>
    </div>
);
function ProductReview({ product }) {
    const reviews = product.reviews || [];

    // Tính trung bình và số lượng
    const reviewCount = reviews.length;
    const rating =
        reviewCount > 0
            ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount
            : 0;

    if (reviewCount === 0) {
        return (
            <div className="product-reviews card p-4 p-md-5">
                <h2 className="text-center mb-4 fw-bold">Đánh giá sản phẩm</h2>
                <div className="text-center text-muted">
                    <MessageCircleMore width={64} height={64} className="text-secondary mb-3" />
                    <h5 className="fw-semibold text-dark">Chưa có đánh giá</h5>
                    <p>Hãy là người đầu tiên chia sẻ cảm nhận của bạn!</p>
                    <button className="btn btn-dark mt-3 px-4 py-2">Đặt hàng ngay</button>
                </div>
            </div>
        );
    }

    // Tính phân bố sao
    const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
        const count = reviews.filter((r) => r.rating === star).length;
        const percentage = Math.round((count / reviewCount) * 100);
        return { rating: star, percentage };
    });

    return (
        <div className="product-reviews card p-4 p-md-5">
            <h2 className="fw-bold mb-4">Đánh giá sản phẩm</h2>

            <div className="row mb-4">
                <div className="col-md-4 text-center border-end mb-4 mb-md-0">
                    <p className="display-5 fw-bold mb-1 text-dark">
                        {rating.toFixed(1)} <span className="fs-5 text-muted">/ 5</span>
                    </p>
                    <div className="d-flex justify-content-center mb-2">
                        {[...Array(5)].map((_, i) => (
                            <StarIcon
                                key={i}
                                width={24}
                                height={24}
                                stroke="none"
                                fill="currentColor"
                                className={i < Math.round(rating) ? "text-warning" : "text-secondary"}
                            />
                        ))}
                    </div>
                    <p className="text-muted small">({reviewCount} đánh giá)</p>
                </div>

                <div className="col-md-8">
                    {ratingDistribution.map((item) => (
                        <RatingBar key={item.rating} rating={item.rating} percentage={item.percentage} />
                    ))}
                </div>
            </div>

            <div
                className={`review-list border-top pt-3 ${reviews.length > 3 ? "overflow-y-auto" : ""
                    }`}
                style={reviews.length > 3 ? { maxHeight: "400px" } : {}}
            >
                {reviews.map((review) => (
                    <ReviewItem key={review.reviewId} review={review} />
                ))}
            </div>
        </div>
    );
}
const ReviewItem = ({ review }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axiosClient.get(`/User/${review.accountId}`)
                setUser(res.data);
            } catch (error) {
                console.log("Lỗi khi lấy người dùng: " + error)
            }
        };
        fetchUser();
    }, [review.accountId]);

    return (
        <div key={review.reviewId} className="review-item mb-4">
            <div className="d-flex align-items-center mb-2">
                <img
                    src={user?.avatarUrl || "https://maunailxinh.com/wp-content/uploads/2025/06/avatar-an-danh-38.jpg"}
                    alt={user?.fullName}
                    className="avt-review"
                />
                <div>
                    <p className="mb-0 fw-semibold">{user ? user.fullName : "Đang tải..."}</p>
                    <small className="text-muted">{formatDate(review.createdAt)}</small>
                </div>
            </div>

            <div className="d-flex mb-1">
                {[...Array(5)].map((_, i) => (
                    <StarIcon
                        key={i}
                        width={16}
                        height={16}
                        stroke="none"
                        fill="currentColor"
                        className={i < review.rating ? "text-warning" : "text-secondary"}
                    />
                ))}
            </div>

            <p className="text-muted">{review.comment}</p>
        </div>
    );
}
export default ProductReview