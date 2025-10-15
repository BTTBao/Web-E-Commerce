import React from "react";
import Header from "./Header";
import MobileHeader from "./MobileHeader";
import "./HeaderWrapper.css"; 

const HeaderWrapper = () => {
  return (
    <>
      <div className="header-desktop">
        <Header />
      </div>
      <div className="header-mobile">
        <MobileHeader />
      </div>
    </>
  );
};

export default HeaderWrapper;
