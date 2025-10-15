import React, { useState, useRef } from "react";
import { Search, User, ShoppingBag } from "lucide-react";
import logo from "../../assets/logo2.webp";
import "./Header.css";
import { Link } from "react-router-dom"
import { menuData } from "./data";


const Header = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const hideMenuTimeout = useRef(null);
  const hideSubMenuTimeout = useRef(null);

  // Delay đóng menu cấp 1
  const handleMenuEnter = (menu) => {
    clearTimeout(hideMenuTimeout.current);
    setActiveMenu(menu);
  };

  const handleMenuLeave = () => {
    hideMenuTimeout.current = setTimeout(() => {
      setActiveMenu(null);
      setActiveSubMenu(null);
    }, 250); // chờ 250ms mới đóng
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

  return (
    <header className="header">
      <Link to="/"><img src={logo} alt="logo" className="logo" /></Link>

      <nav className="nav">
        {Object.keys(menuData).map((menu) => (
          <div
            key={menu}
            className="menu-item"
            onMouseEnter={() => handleMenuEnter(menu)}
            onMouseLeave={handleMenuLeave}
          >
            <span
              className={`menu-text ${activeMenu === menu ? "active" : ""}`}
            >
              {menu}
            </span>

            {menu === "SHOP" && activeMenu === "SHOP" && (
              <div className="dropdown">
                {Object.keys(menuData.SHOP.items).map((sub) => (
                  <div
                    key={sub}
                    className="dropdown-item"
                    onMouseEnter={() => handleSubEnter(sub)}
                    onMouseLeave={handleSubLeave}
                  >
                    {sub}

                    {menuData.SHOP.items[sub].length > 0 &&
                      activeSubMenu === sub && (
                        <div className="sub-dropdown">
                          {menuData.SHOP.items[sub].map((item) => (
                            <div key={item} className="sub-item">
                              {item}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="icons">
        <div className="search-box">
          <input type="text" placeholder="Tìm kiếm..." />
          <Search size={18} className="search-icon" />
        </div>
        <Link to="/auth/login"><User size={22} className="icon" /></Link>
        <Link to="/cart">
          <div className="cart">
            <ShoppingBag size={22} className="icon" />
            <span className="cart-count">0</span>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
