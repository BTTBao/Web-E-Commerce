import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CheckCircleIcon, TruckIcon } from "lucide-react";
import { formatPrice } from "../../utils/formatPrice";
import "./OrderSuccess.css";
import { useEffect } from "react";

function OrderSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams();
  // Nếu không có state (người dùng reload hoặc vào trực tiếp) → quay về trang chủ
  useEffect(() => {
    if (!state?.order) {
      navigate("/");
    }
  }, [state, navigate]);

  if (!state?.order) return null;
  const { order } = state;
  const isCOD = order.paymentMethod === "COD"
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

        {/* Thông tin đơn hàng */}
        <div className="order-info border rounded-3 p-4 bg-light">
          <div className="row mb-3">
            <div className="col-6 text-secondary">Mã đơn hàng:</div>
            <div className="col-6 text-end fw-bold fs-5">{orderId}</div>
          </div>
          <div className="row mb-3">
            <div className="col-6 text-secondary">Tổng thanh toán:</div>
            <div className="col-6 text-end fw-semibold text-end">
              {formatPrice(order.totalAmount)}
            </div>
          </div>
          <div className="row">
            <div className="col-6 text-secondary">Thanh toán qua:</div>
            <div className="col-6 text-end fw-semibold">
              {isCOD ? "Thanh toán khi nhận hàng" : "Thanh toán bằng phương thức VNPAY"}
            </div>
          </div>
        </div>

        {/* Thông báo COD hoặc online */}
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
                    Đơn hàng sẽ được giao trong vài ngày tới. Vui lòng chuẩn bị tiền mặt để thanh toán cho nhân viên giao hàng.
                  </p>
                </>
              ) : (
                <>
                  <h5 className="fw-semibold mb-1">Thanh toán đã hoàn tất</h5>
                  <p className="text-muted mb-0 small">
                    Chúng tôi đã nhận được thanh toán của bạn. Đơn hàng sẽ được xử lý và giao đến bạn sớm nhất.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Nút điều hướng */}
        <div className="row mt-5 order-btns">
          <div className="col-12 col-sm-6">
            <button 
              onClick={() => navigate("/", { replace: true, state: null })}
              className="btn btn-dark w-100 py-3 fw-semibold">
              Quay về trang chủ
            </button>
          </div>
          <div className="col-12 col-sm-6">
            <button
              onClick={() => navigate("/profile", { replace: true, state: null })}
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
