import React, { useEffect, useState } from "react";
import { formatPrice } from "../../utils/formatPrice";
import { useNavigate, useParams } from "react-router-dom";
import { formatDate } from "../../utils/formatDate";
import "./OrdersDetail.css";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CreditCardIcon,
  UserIcon,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";

function OrdersDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/orders/DH${id}`);
        setOrder(res.data);
        setProducts(res.data.items);
      } catch (err) {
        console.error(err);
        setError("Không thể tải đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <h3 className="text-center my-5">Đang tải...</h3>;
  if (error) return <h3 className="text-center text-danger my-5">{error}</h3>;
  if (!order) return null;
  return (
    <div className="container page-container">
      <div className="mx-auto" style={{ maxWidth: "900px" }}>
        <button
          onClick={() => {navigate('/shop')}} 
          className="btn-back">
          <ArrowLeftIcon size={20} />
          Tiếp tục mua sắm
        </button>

        {/* Header */}
        <div className="row align-items-center mb-4">
          <div className="col-md-8">
            <h1 className="fw-bold" style={{ fontSize: "32px", color: "#111" }}>
              Chi tiết đơn hàng
            </h1>
            <p className="text-muted mt-1">
              Mã đơn hàng: <span className="fw-semibold">{order.id}</span>
            </p>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0 text-muted">
            Ngày đặt:{" "}
            <span className="fw-semibold">{formatDate(order.date)}</span>
          </div>
        </div>

        {/* Tracker */}
        <div className="card-custom mb-4">
          <OrderStatusTracker status={order.status} />
        </div>

        {/* Cards 3 column */}
        <div className="row g-4 mb-4">
          {/* Giao hàng */}
          <div className="col-lg-4">
            <InfoCard title="Thông tin giao hàng" icon={<UserIcon size={22} />}>
              <p className="fw-semibold">
                {order.shippingAddress.receiverFullName}
              </p>
              <p>{order.shippingAddress.receiverPhone}</p>
              <p className="mt-2 pt-2 border-top">
                {`${order.shippingAddress.addressLine}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.province}`}
              </p>
            </InfoCard>
          </div>

          {/* Thanh toán */}
          <div className="col-lg-4">
            <InfoCard
              title="Phương thức thanh toán"
              icon={<CreditCardIcon size={22} />}
            >
              <p>{order.paymentMethod}</p>
              <p>
                Trạng thái:{" "}
                <span
                  className={`fw-semibold ${
                    order.paymentMethod.toLowerCase() === "cod" && order.status.toLowerCase() != "delivered"
                      ? "text-danger"
                      : "text-success"
                  }`}
                >
                  {order.paymentMethod.toLowerCase() === "cod" && order.status.toLowerCase() != "delivered"
                    ? "Chưa thanh toán"
                    : "Đã thanh toán"}
                </span>
              </p>
            </InfoCard>
          </div>

          {/* Tổng tiền */}
          <div className="col-lg-4">
            <InfoCard
              title="Tóm tắt đơn hàng"
              icon={<CreditCardIcon size={22} />}
            >
              <div className="d-flex justify-content-between">
                <span>Tạm tính:</span>
                <span className="fw-semibold">{formatPrice(order.total)}</span>
              </div>

              <div className="d-flex justify-content-between">
                <span>Phí vận chuyển:</span>
                <span className="fw-semibold">{formatPrice(0)}</span>
              </div>

              <div className="d-flex justify-content-between fw-bold pt-2 border-top mt-2">
                <span>Tổng cộng:</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </InfoCard>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="card-custom">
          <h3 className="fw-bold mb-3">Sản phẩm đã đặt</h3>

          {products.map((item) => (
            <div
              key={item.productId}
              className="order-item d-flex gap-3 align-items-center"
            >
              <img src={item.imageUrl} alt={item.productName} />

              <div className="flex-grow-1">
                <p className="fw-semibold">{item.productName}</p>
                <p className="text-muted small">
                  Size: {item.size} / Màu: {item.color}
                </p>
                <p className="text-muted small">Số lượng: {item.quantity}</p>
              </div>

              <div className="text-end">
                <p className="fw-semibold">{formatPrice(item.subTotal)}</p>
                <p className="text-muted small">
                  ({formatPrice(item.unitPrice)} mỗi sản phẩm)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const InfoCard = ({ title, icon, children }) => (
  <div className="card-custom h-100">
    <div className="d-flex align-items-center mb-3">
      {icon}
      <h3 className="info-title">{title}</h3>
    </div>
    <div>{children}</div>
  </div>
);

const steps = [
  { key: "pending", label: "Chờ xử lý" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "shipped", label: "Đang giao hàng" },
  { key: "delivered", label: "Đã giao" },
  { key: "cancelled", label: "Đã hủy" },
];

const OrderStatusTracker = ({ status }) => {
  const current = steps.findIndex((x) => x.key === status.toLowerCase());
  const isCancelled = status.toLowerCase() === "cancelled";

  return (
    <div>
      <h3 className="fw-bold text-center mb-4">Tình trạng đơn hàng</h3>

      {/* Nếu đơn hàng đã hủy → chỉ hiện mục Đã hủy */}
      {isCancelled ? (
        <div className="mt-3 d-flex flex-column align-items-center">
          <div className="step-circle cancelled border-danger bg-danger text-white">
            <CheckCircleIcon size={22} />
          </div>
          <div className="step-label text-danger fw-bold">Đã hủy</div>
        </div>
      ) : (
        /* Ngược lại → Hiển thị các step bình thường */
        <div className="d-flex justify-content-between align-items-center">
          {steps.map((step, index) => {
            if (step.key === "cancelled") return null; // Ẩn step cancelled trong tracker chính

            const completed = index <= current;
            const last = index === steps.length - 2;

            return (
              <React.Fragment key={step.key}>
                <div className="step-process text-center">
                  <div
                    className={`step-circle ${completed ? "completed" : ""}`}
                  >
                    <CheckCircleIcon size={22} />
                  </div>
                  <div className={`step-label ${completed ? "completed" : ""}`}>
                    {step.label}
                  </div>
                </div>

                {!last && (
                  <div
                    className={`step-line ${completed ? "completed" : ""}`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersDetail;
