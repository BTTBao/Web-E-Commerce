import React, { useState, useRef } from "react";
import { Search, User, ShoppingBag } from "lucide-react";
import logo from "../../assets/logo.webp";
import "./Header.css";
import { Link, useNavigate } from "react-router-dom";
import { menuData } from "./data";
import { useCart } from "../../hooks/useCart";

const Header = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const hideMenuTimeout = useRef(null);
  const hideSubMenuTimeout = useRef(null);
  const { cartCount } = useCart();
  const navigate = useNavigate();

  // Delay đóng menu cấp 1
  const handleMenuEnter = (menu) => {
    clearTimeout(hideMenuTimeout.current);
    setActiveMenu(menu);
  };

  const handleMenuLeave = () => {
    hideMenuTimeout.current = setTimeout(() => {
      setActiveMenu(null);
      setActiveSubMenu(null);
    }, 250);
  };

  // Delay đóng menu cấp 2
  const handleSubEnter = (sub) => {
    clearTimeout(hideSubMenuTimeout.current);
    setActiveSubMenu(sub);
  };

  const handleSubLeave = () => {
    hideSubMenuTimeout.current = setTimeout(() => {
      setActiveSubMenu(null);
    }, 250);
  };

  // Xử lý click vào category (Top, Bottom, etc.)
  const handleCategoryClick = (category) => {
    const categoryPath = `/category/${category.toLowerCase()}`;
    navigate(categoryPath);
    setActiveMenu(null);
    setActiveSubMenu(null);
  };

  const handleLogin = () => {
    if (localStorage.getItem("token") != null) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  return (
    <header className="header">
      {/* Logo */}
      <Link to="/">
        <img src={logo} alt="logo" className="logo" />
      </Link>

      {/* Navbar */}
      <nav className="nav">
        {Object.keys(menuData).map((menu) => {
          const menuItem = menuData[menu];

          return (
            <div
              key={menu}
              className="menu-item"
              onMouseEnter={() => handleMenuEnter(menu)}
              onMouseLeave={handleMenuLeave}
            >
              {/* Nếu có submenu items (SHOP) */}
              {menuItem.items && Object.keys(menuItem.items).length > 0 ? (
                <span
                  className={`menu-text ${activeMenu === menu ? "active" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  {menu}
                </span>
              ) : (
                // Nếu chỉ có path (CONTACT, ABOUT US, BEST SELLER)
                <Link to={menuItem.path} className="menu-text">
                  {menu}
                </Link>
              )}

              {/* Dropdown SHOP */}
              {menu === "SHOP" && activeMenu === "SHOP" && (
                <div className="dropdown">
                  {Object.keys(menuData.SHOP.items).map((sub) => (
                    <div
                      key={sub}
                      className="dropdown-item"
                      onMouseEnter={() => handleSubEnter(sub)}
                      onMouseLeave={handleSubLeave}
                      onClick={() => {
                        // Click vào category (Top, Bottom) để chuyển trang
                        handleCategoryClick(sub);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {sub}

                      {/* Sub-dropdown */}
                      {menuData.SHOP.items[sub].length > 0 &&
                        activeSubMenu === sub && (
                          <div className="sub-dropdown">
                            {menuData.SHOP.items[sub].map((item) => (
                              <Link
                                key={item.name}
                                to={item.path}
                                className="sub-item"
                                onClick={() => {
                                  setActiveMenu(null);
                                  setActiveSubMenu(null);
                                }}
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Icons */}
      <div className="icons">
        <div className="search-box">
          <input type="text" placeholder="Tìm kiếm..." />
          <Search size={18} className="search-icon" />
        </div>

        {/* Icon đăng nhập */}
        <User
          size={22}
          className="icon"
          onClick={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          style={{ cursor: "pointer" }}
        />

        {/* Icon giỏ hàng */}
        <Link to="/cart">
          <div className="cart">
            <ShoppingBag size={22} className="icon" />
            <span className="cart-count">{cartCount}</span>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;