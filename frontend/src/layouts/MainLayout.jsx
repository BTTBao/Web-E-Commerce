import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import HeaderWrapper from '../components/Header/HeaderWrapper';
import Footer from '../components/Footer/Footer';

export default function MainLayout() {

  // không dùng footer
  const location = useLocation();
  const noFooterRouters = ["/cart", "/checkout", "/product", "/order-success"]

  const hideFooter = noFooterRouters.some((path) =>
    location.pathname.startsWith(path)
  );
  // end

  return (
    <>
      <HeaderWrapper />
      <main className="container my-4">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </>
  );
}
