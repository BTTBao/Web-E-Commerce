import { useState } from 'react'
import './App.css'
<<<<<<< Updated upstream
import HeaderWrapper from './components/Header/HeaderWrapper'
import ProductDetail from './pages/ProductDetail'
import AppRouter from './router/AppRouter'
function App() {
  return (
    <>
      <AppRouter/>
=======

import { Routes, Route, Link } from "react-router-dom";
import AboutUs from "./pages/AboutUs";

function Home() {
  return ;
}

function App() {
  return (
    <>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
>>>>>>> Stashed changes
    </>
  )
}

export default App;
