
import { useState } from 'react'
import './App.css'
import HeaderWrapper from './components/Header/HeaderWrapper'

function App() {

 

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AboutUs from "./pages/AboutUs";
import Header from "./components/Header";
function Home() {
  return (
    <div>
      <h1>Trang chủ</h1>
      <p>Đây là trang chính.</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <nav >
        <Link to="/">Home </Link>
        <Link to="/about"> About Us</Link>
      </nav>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
    </Router>
  );
}

export default App;
