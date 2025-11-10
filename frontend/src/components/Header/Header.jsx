import React, { useState, useRef } from "react";
import { Search, User, ShoppingBag } from "lucide-react";
import logo from "../../assets/logo.webp";
import "./Header.css";
import { Link } from "react-router-dom";
import { menuData } from "./data";
import { useNavigate } from 'react-router-dom';
import { useCart } from "../../hooks/useCart";

const Header = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const hideMenuTimeout = useRef(null);
  const hideSubMenuTimeout = useRef(null);
  const { cartCount } = useCart();
  const navigator = useNavigate();
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

  const HandleLogin = () =>{
    if(localStorage.getItem('token') != null)
    {
      navigator('/profile');
    }else navigator('/login')
  }
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
              {/* Nếu có đường dẫn (CONTACT, ABOUT US...) thì là Link */}
              {menuItem.path ? (
                <Link to={menuItem.path} className="menu-text">
                  {menu}
                </Link>
              ) : (
                <span
                  className={`menu-text ${
                    activeMenu === menu ? "active" : ""
                    }`}
                >
                  {menu}
                </span>
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
        <User size={22} className="icon" onClick={e =>{e.preventDefault(); HandleLogin();}} />


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
