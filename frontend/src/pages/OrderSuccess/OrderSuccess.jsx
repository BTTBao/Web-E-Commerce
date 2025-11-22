import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CheckCircleIcon, TruckIcon } from "lucide-react";
import { formatPrice } from "../../utils/formatPrice";
import "./OrderSuccess.css";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { toast } from "sonner";
import { useCart } from "../../hooks/useCart";

function OrderSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState(state?.order || null);
  const [loading, setLoading] = useState(!state?.order);

  useEffect(() => {
    // Nếu không có state => fetch dữ liệu từ backend
    if (!state?.order) {
      axiosClient.get(`/orders/${orderId}`)
        .then(res => {
          setOrder(res.data);
          setLoading(false);
        })
        .catch(() => {
          // Không tìm thấy đơn hoặc lỗi -> quay về trang chủ
          // navigate("/", { replace: true });
        });
    }
  }, [state, orderId, navigate]);

  if (loading) return <div className="text-center mt-5">Đang tải dữ liệu...</div>;
  if (!order) return null;
  else {
    toast.success("Đặt hàng thành công");
  }

  const getId = () => {
    const rawId = order?.orderId || order?.id || "";
    return Number(rawId.replace("DH", ""));
  };
  const isCOD = order.paymentMethod === "COD";
  const totalAmount = order.totalAmount || order.total

  return (
    <div className="container order-success-page d-flex align-items-center justify-content-center min-vh-100">
      <div className="order-card shadow-lg p-5 bg-white rounded-4 border">
        <div className="text-center mb-4">
          <div className="icon-circle mx-auto mb-3">
            <CheckCircleIcon size={40} className="text-primary" />
          </div>
          <h1 className="fw-bold fs-2 text-dark">Đặt hàng thành công!</h1>
          <p className="text-muted mt-3">
            Cảm ơn bạn đã tin tưởng và mua sắm. Đơn hàng của bạn đã được xác nhận.
          </p>
        </div>

        <div className="order-info border rounded-3 p-4 bg-light">
          <div className="row mb-3">
            <div className="col-6 text-secondary">Mã đơn hàng:</div>
            <div className="col-6 text-end fw-bold fs-5">{orderId}</div>
          </div>
          <div className="row mb-3">
            <div className="col-6 text-secondary">Tổng thanh toán:</div>
            <div className="col-6 text-end fw-semibold">
              {formatPrice(totalAmount)}
            </div>
          </div>
          <div className="row">
            <div className="col-6 text-secondary">Thanh toán qua:</div>
            <div className="col-6 text-end fw-semibold">
              {isCOD ? "Thanh toán khi nhận hàng" : "Thanh toán bằng VNPAY"}
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-3 border info-box">
          <div className="row align-items-center">
            <div className="col-auto">
              {isCOD ? (
                <TruckIcon size={40} className="text-primary" />
              ) : (
                <CheckCircleIcon size={40} className="text-primary" />
              )}
            </div>
            <div className="col">
              {isCOD ? (
                <>
                  <h5 className="fw-semibold mb-1">Vui lòng chuẩn bị thanh toán</h5>
                  <p className="text-muted mb-0 small">
                    Đơn hàng sẽ được giao trong vài ngày tới. Vui lòng chuẩn bị tiền mặt.
                  </p>
                </>
              ) : (
                <>
                  <h5 className="fw-semibold mb-1">Thanh toán đã hoàn tất</h5>
                  <p className="text-muted mb-0 small">
                    Chúng tôi đã nhận được thanh toán của bạn.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="row mt-5 order-btns">
          <div className="col-12 col-sm-6">
            <button
              onClick={() => navigate("/", { replace: true })}
              className="btn btn-dark w-100 py-3 fw-semibold">
              Quay về trang chủ
            </button>
          </div>
          <div className="col-12 col-sm-6">
            <button
              onClick={() => navigate(`/orders/${getId()}`, { replace: true })}
              className="btn btn-outline-secondary w-100 py-3 fw-semibold">
              Xem chi tiết đơn hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
