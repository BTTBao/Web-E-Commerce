// src/pages/Home/Home.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader, AlertCircle } from "lucide-react";

import slide1 from "../../assets/slide-img1.webp";
import slide2 from "../../assets/slide-img2.webp";
import slide3 from "../../assets/slide-img3.webp";
import xxx1 from "../../assets/xxx_6.webp";
import xxx2 from "../../assets/xxx_7.webp";
import logo1 from "../../assets/brand1.webp";
import logo2 from "../../assets/brand2.webp";
import logo3 from "../../assets/brand3.webp";
import logo4 from "../../assets/brand4.webp";

import ProductGrid from "../../components/ProductGrid/ProductGrid";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const images = [slide1, slide2, slide3];
  const [current, setCurrent] = useState(0);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "https://localhost:7132/api/product"
        );

        if (!response.ok) {
          throw new Error(`Lỗi: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status === "success" && Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
        setError(err.message || "Không thể tải sản phẩm. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <section className="banner">
        <div className="slider">
          {images.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`banner-${index}`}
              className={index === current ? "active" : ""}
              onClick={() => navigate("/shop")}
            />
          ))}
        </div>
        <div className="dots">
          {images.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === current ? "active" : ""}`}
              onClick={() => setCurrent(index)}
            ></span>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <section className="product-section">
        <div className="container">
          <h2 className="section-title1">TẤT CẢ SẢN PHẨM</h2>

          {loading ? (
            <div className="loading-container">
              <Loader className="loading-spinner" />
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <AlertCircle className="error-icon" />
              <p>{error}</p>
            </div>
          ) : products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <p>Hiện chưa có sản phẩm nào.</p>
          )}
        </div>
      </section>

      {/* BEST SELLER Section */}
      <section>
        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-sm-6">
              <div className="best-seller-card" onClick={() => navigate("/best-seller")}>
                <img src={xxx1} alt="Best Seller 1" />
                <div className="cap-xxx">
                  <h3>BEST SELLER</h3>
                </div>
              </div>
            </div>
            <div className="col-xs-12 col-sm-6">
              <div className="best-seller-card" onClick={() => navigate("/best-seller")}>
                <img src={xxx2} alt="Best Seller 2" />
                <div className="cap-xxx">
                  <h3>BEST SELLER</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Thương hiệu */}
      <section className="brand-section text-center">
        <h2 className="brand-title">THƯƠNG HIỆU</h2>
        <div className="container">
          <div className="row justify-content-center align-items-center">
            {[logo1, logo2, logo3, logo4].map((logo, i) => (
              <div key={i} className="col-6 col-sm-2 brand-item">
                <img src={logo} alt={`Brand ${i + 1}`} className="brand-img" />
              </div>
            ))}
          </div>
        </div>
      </section>

      
    </>
  );
}
