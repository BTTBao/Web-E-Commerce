import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Home.css";

import slide1 from "../../assets/slide-img1.webp";
import slide2 from "../../assets/slide-img2.webp";
import slide3 from "../../assets/slide-img3.webp";
import xxx1 from "../../assets/xxx_6.webp";
import xxx2 from "../../assets/xxx_7.webp";
import logo1 from "../../assets/brand1.webp";
import logo2 from "../../assets/brand2.webp";
import logo3 from "../../assets/brand3.webp";
import logo4 from "../../assets/brand4.webp";

import CategoryList from "../../components/Category/CategoryList";

export default function Home() {
  const navigate = useNavigate();
  const images = [slide1, slide2, slide3];
  const [current, setCurrent] = useState(0);
  
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    fetch('https://localhost:7132/api/category')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => setCategories(data))
        .catch(error => console.error('Fetch error:', error));

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <>
    <div className="container">
    <h1>Danh mục sản phẩm</h1>
    <CategoryList categories={categories} />
    </div>

      {/* 🖼️ Banner */}
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

        <section>
            <div className="container">
                <div className="row">
                    <div className="col-xs-12 col-sm-6">
                        <Link to="/best-seller" title="BEST SELLER">
                            <img src={xxx1} alt="Best Seller 1" />
                        </Link>
                        <div class="cap-xxx">
                            <h3>BEST SELLER</h3>
                        </div>
                    </div>
                    <div className="col-xs-12 col-sm-6">
                        <Link to="/best-seller" title="BEST SELLER">
                            <img src={xxx2} alt="Best Seller 2" />
                        </Link>
                        <div class="cap-xxx">
                            <h3>BEST SELLER</h3>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section className="brand-section text-center">
            <h2 className="brand-title">THƯƠNG HIỆU</h2>

            <div className="container">
                <div className="row justify-content-center align-items-center">
                    <div className="col-6 col-sm-3 brand-item">
                        <img src={logo1} alt="Emblem Logo" className="brand-img" />
                    </div>

                    <div className="col-6 col-sm-3 brand-item">
                        <img src={logo2} alt="Signature Y" className="brand-img" />
                    </div>

                    <div className="col-6 col-sm-3 brand-item">
                        <img src={logo3} alt="Dico Comfy" className="brand-img" />
                    </div>

                    <div className="col-6 col-sm-3 brand-item">
                        <img src={logo4} alt="Dico Star" className="brand-img" />
                    </div>
                </div>
            </div>
        </section>


    </>
  );
}
