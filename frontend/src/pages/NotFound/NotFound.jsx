import { CircleQuestionMark } from "lucide-react";
import React from "react";
import { BsQuestionCircle } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100 bg-light text-center px-3">
      <div className="notfound-card mx-auto">
        <QuestionMarkCircleIcon className="icon-404 mb-4" />

        <h1 className="display-1 fw-bold text-dark">404</h1>

        <h2 className="fs-3 fw-semibold text-dark mt-3 mb-2">
          Oops! Trang không tồn tại
        </h2>

        <p className="text-muted mb-4 mx-auto" style={{ maxWidth: "350px" }}>
          Có vẻ như bạn đã đi lạc. Trang bạn đang tìm kiếm không có ở đây. Hãy
          quay lại và khám phá những sản phẩm thời trang tuyệt vời nhé.
        </p>

        <button
          onClick={() => navigate("/")}
          className="btn btn-dark px-4 py-2"
        >
          Quay về trang chủ
        </button>
      </div>
    </div>
  );
}
const QuestionMarkCircleIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.879 7.51c.217-1.019 1.44-1.785 2.83-1.785 1.74 0 3.121 1.038 3.121 2.5 0 1.121-.836 2.053-2.02 2.45-1.18.397-2.14.983-2.14 1.94s.96 1.54 2.14 1.54c1.18 0 2.14-.597 2.14-1.54"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 18.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);
export default NotFound;
