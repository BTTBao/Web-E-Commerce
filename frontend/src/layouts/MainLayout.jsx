import React from 'react';
import { Outlet } from 'react-router-dom';
import HeaderWrapper from '../components/Header/HeaderWrapper';
import Footer from '../components/Footer/Footer';

export default function MainLayout(){
  return (
    <>
      <HeaderWrapper />
      <main className="container my-4">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
