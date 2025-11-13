import React, { useState } from "react";
import { FiMenu, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { ShoppingBag, User } from "lucide-react";
import "./MobileHeader.css";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.webp";
import { menuData } from "./data";
import { useCart } from "../../hooks/useCart";

export default function MobileHeader() {
  const [open, setOpen] = useState(false);
  const [activeMain, setActiveMain] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const toggleMain = (title) => {
    setActiveMain(activeMain === title ? null : title);
    setActiveSub(null);
  };

  const toggleSub = (title) => {
    setActiveSub(activeSub === title ? null : title);
  };

  // Xử lý click vào category (Top, Bottom, etc.)
  const handleCategoryClick = (category) => {
    const categoryPath = `/category/${category.toLowerCase()}`;
    navigate(categoryPath);
    setOpen(false);
    setActiveMain(null);
    setActiveSub(null);
  };

  const handleLogin = () => {
    if (localStorage.getItem("token") != null) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  return (
    <>
      {/* Header */}
      <header className="mobile-header">
        <button className="menu-btn" onClick={() => setOpen(true)}>
          <FiMenu size={24} />
        </button>

        <Link to="/">
          <div className="mobile-logo">
            <img src={logo} alt="Logo" />
          </div>
        </Link>

        <div className="mobile-icons">
          <User
            size={22}
            className="icon"
            onClick={handleLogin}
            style={{ cursor: "pointer" }}
          />
          <Link to="/cart">
            <div className="cart">
              <ShoppingBag size={22} className="icon" />
              <span className="cart-count">{cartCount}</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Overlay menu */}
      {open && (
        <div className="mobile-menu-overlay">
          <div className="menu-container">
            <div className="menu-header">
              <img src={logo} alt="Logo" className="menu-logo" />
              <FiX
                className="close-btn"
                onClick={() => setOpen(false)}
                size={26}
                color="#fff"
              />
            </div>

            <input className="search-input" placeholder="Tìm kiếm..." />

            <ul className="menu-list1">
              {Object.entries(menuData).map(([mainTitle, data]) => (
                <li key={mainTitle}>
                  {data.items ? (
                    // Có submenu (SHOP)
                    <div
                      className="menu-item1"
                      onClick={() => toggleMain(mainTitle)}
                      style={{ cursor: "pointer" }}
                    >
                      <Link to={data.path} onClick={() => setOpen(false)}>{mainTitle}</Link>
                      {activeMain === mainTitle ? (
                        <FiChevronUp />
                      ) : (
                        <FiChevronDown />
                      )}
                    </div>
                  ) : (
                    // Không có submenu → gắn Link
                    <Link
                      to={data.path}
                      className="menu-item1"
                      onClick={() => setOpen(false)}
                    >
                      {mainTitle}
                    </Link>
                  )}

                  {/* Submenu cấp 1 */}
                  {data.items && (
                    <ul
                      className={`submenu ${
                        activeMain === mainTitle
                          ? "submenu-open"
                          : "submenu-closed"
                      }`}
                    >
                      {Object.entries(data.items).map(([subTitle, subItems]) => (
                        <li key={subTitle}>
                          <div className="submenu-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                            <span
                              onClick={() => {
                                if (subItems.length === 0) {
                                  // Không có items cấp 2 → navigate ngay
                                  handleCategoryClick(subTitle);
                                } else {
                                  // Có items cấp 2 → navigate tới category chính
                                  handleCategoryClick(subTitle);
                                }
                              }}
                              style={{ flex: 1 }}
                            >
                              {subTitle}
                            </span>
                            {subItems.length > 0 && (
                              <span
                                onClick={() => toggleSub(subTitle)}
                                style={{ cursor: "pointer", paddingLeft: "10px" }}
                              >
                                {activeSub === subTitle ? (
                                  <FiChevronUp />
                                ) : (
                                  <FiChevronDown />
                                )}
                              </span>
                            )}
                          </div>

                          {/* Submenu cấp 2 */}
                          {subItems.length > 0 && (
                            <ul
                              className={`sub-submenu ${
                                activeSub === subTitle
                                  ? "sub-submenu-open"
                                  : "sub-submenu-closed"
                              }`}
                            >
                              {subItems.map((item, idx) => (
                                <li key={idx} className="sub-item2">
                                  <Link
                                    to={item.path}
                                    onClick={() => setOpen(false)}
                                  >
                                    {item.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}