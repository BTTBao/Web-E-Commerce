import React, { useState } from "react";
import { FiMenu, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { ShoppingBag } from "lucide-react";
import "./MobileHeader.css";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.webp";
import { menuData } from "./data";
import useCartCount from "../../hooks/useCartCount";

export default function MobileHeader() {
  const [open, setOpen] = useState(false);
  const [activeMain, setActiveMain] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const cartCount = useCartCount();

  const toggleMain = (title) => {
    setActiveMain(activeMain === title ? null : title);
    setActiveSub(null);
  };

  const toggleSub = (title) => {
    setActiveSub(activeSub === title ? null : title);
  };

  return (
    <>
      {/* Header */}
      <header className="mobile-header">
        <button className="menu-btn" onClick={() => setOpen(true)}>
          <FiMenu size={24} />
        </button>

        <div className="mobile-logo">
          <img src={logo} alt="Logo" />
        </div>

        <Link to="/cart">
          <div className="cart">
            <ShoppingBag size={22} className="icon" />
            <span className="cart-count">{cartCount}</span>
          </div>
        </Link>
      </header>

      {/* Overlay menu */}
      {open && (
        <div className="mobile-menu-overlay">
          <div className="menu-container">
            <div className="menu-header">
              <img src={logo} alt="Logo" className="menu-logo" />
              <FiX className="close-btn" onClick={() => setOpen(false)} size={26} color="#fff"/>
            </div>

            <input className="search-input" placeholder="Tìm kiếm..." />

            <ul className="menu-list">
              {Object.entries(menuData).map(([mainTitle, data]) => (
                <li key={mainTitle}>
                  {data.items ? (
                    // Có submenu (SHOP)
                    <div
                      className="menu-item"
                      onClick={() => toggleMain(mainTitle)}
                    >
                      <span>{mainTitle}</span>
                      {activeMain === mainTitle ? <FiChevronUp /> : <FiChevronDown />}
                    </div>
                  ) : (
                    // Không có submenu → gắn Link
                    <Link
                      to={data.path}
                      className="menu-item"
                      onClick={() => setOpen(false)}
                    >
                      {mainTitle}
                    </Link>
                  )}

                  {/* Submenu cấp 1 */}
                  {data.items && (
                    <ul
                      className={`submenu ${
                        activeMain === mainTitle ? "submenu-open" : "submenu-closed"
                      }`}
                    >
                      {Object.entries(data.items).map(([subTitle, subItems]) => (
                        <li key={subTitle}>
                          <div
                            className="submenu-item"
                            onClick={() =>
                              subItems.length > 0
                                ? toggleSub(subTitle)
                                : setOpen(false)
                            }
                          >
                            <span>{subTitle}</span>
                            {subItems.length > 0 &&
                              (activeSub === subTitle ? <FiChevronUp /> : <FiChevronDown />)}
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
