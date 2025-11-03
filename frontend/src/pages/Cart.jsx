import React from 'react'
import { CartProvider } from '../context/CartContext'
import ShoppingCart from '../components/Cart/ShoppingCart';

function Cart() {
  return (
    <CartProvider>
      <div className="bg-gray-100 text-gray-800">
        <ShoppingCart />
      </div>
    </CartProvider>
  )
}

export default Cart