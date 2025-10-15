import { useState } from 'react'
import './App.css'
import HeaderWrapper from './components/Header/HeaderWrapper'
import ProductDetail from './pages/ProductDetail'
import AppRouter from './router/AppRouter'
function App() {
  return (
    <>
      <AppRouter/>
    </>
  )
}

export default App;
