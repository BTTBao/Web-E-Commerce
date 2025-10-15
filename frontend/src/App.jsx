import './App.css'
import HeaderWrapper from './components/Header/HeaderWrapper'
import { Routes, Route, Link } from "react-router-dom";
import AboutUs from "./pages/AboutUs";

function Home() {
  return ;
}

function App() {
  return (
    <>
      <HeaderWrapper />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
    </>
  );
}

export default App;
