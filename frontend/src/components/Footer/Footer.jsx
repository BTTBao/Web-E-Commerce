import "./Footer.css";

export default function Footer() {
  return (
    <>
        <footer className="footer bg-light pt-5 pb-3">
            <div className="container">
                <div className="row gy-4">
                    {/* ABOUT US */}
                    <div className="col-12 col-md-3">
                        <h5 className="footer-title">ABOUT US</h5>
                        <p>
                            Được thành lập vào cuối năm 2016 trong bối cảnh thời trang
                            streetstyle dần nhen nhóm vào thị trường Việt Nam. Sau 9 năm phát
                            triển, SWE - Street Wear Eazy với slogan
                            Young kids with a mission™ đã chiếm được tình cảm
                            của hầu hết các bạn trẻ yêu mến thời trang đường phố trên khắp cả
                            nước.
                        </p>
                    </div>

                    {/* CHÍNH SÁCH */}
                    <div className="col-12 col-md-3">
                        <h5 className="footer-title">CHÍNH SÁCH</h5>
                        <ul className="list-unstyled footer-list2">
                        <li>Hướng dẫn mua hàng</li>
                        <li>Phương thức thanh toán</li>
                        <li>Chính sách bảo mật</li>
                        <li>Chính sách đổi và bảo hành sản phẩm</li>
                        <li>Chính sách giao nhận - vận chuyển</li>
                        <li>Chính sách Membership</li>
                        </ul>
                    </div>

                    {/* HỆ THỐNG CỬA HÀNG */}
                    <div className="col-12 col-md-3">
                        <h5 className="footer-title">HỆ THỐNG CỬA HÀNG SWE</h5>
                        <ul className="list-unstyled footer-list">
                            <li>
                                <i className="bi bi-geo-alt text-secondary me-2"></i>
                                44A Trần Quang Diệu, Phường Nhiêu Lộc, TP.HCM
                            </li>
                            <li>
                                <i className="bi bi-geo-alt text-secondary me-2"></i>
                                TNP, 26 Lý Tự Trọng, Phường Sài Gòn, TP.HCM
                            </li>
                            <li>
                                <i className="bi bi-geo-alt text-secondary me-2"></i>
                                Store 29-30 TNP, Tầng B1, Vincom Center Đồng Khởi, TP.HCM
                            </li>
                            <li>
                                <i className="bi bi-geo-alt text-secondary me-2"></i>
                                TRC, 180 Đê La Thành, Hà Nội
                            </li>
                            <li>
                                <i className="bi bi-telephone text-secondary me-2"></i>
                                0357 420 420
                            </li>
                            <li>
                                <i className="bi bi-envelope text-secondary me-2"></i>
                                streetweareazy@gmail.com
                            </li>
                        </ul>
                    </div>


                    {/* MẠNG XÃ HỘI */}
                    <div className="col-12 col-md-3">
                        <h5 className="footer-title">MẠNG XÃ HỘI</h5>
                        <div className="social-icons">
                        <a
                            href="https://www.facebook.com/"
                            target="_blank"
                            rel="noreferrer"
                            className="social-link"
                        >
                            <i className="bi bi-facebook"></i>
                        </a>
                        <a
                            href="https://www.instagram.com/"
                            target="_blank"
                            rel="noreferrer"
                            className="social-link"
                        >
                            <i className="bi bi-instagram"></i>
                        </a>
                        <a
                            href="https://shopee.vn/"
                            target="_blank"
                            rel="noreferrer"
                            className="social-link"
                        >
                            <i className="bi bi-shop"></i>
                        </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
        <div className="text-center end-ft">
            Copyright © 2025 SWE (STREETWEAREAZY). Powered by Haravan.
        </div>
    </>

  );
}
