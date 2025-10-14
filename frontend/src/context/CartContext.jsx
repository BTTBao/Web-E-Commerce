import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart(prev => {
      const exist = prev.find(i => i.productID === item.productID);
      if(exist){
        return prev.map(i => i.productID === item.productID ? {...i, quantity: i.quantity + (item.quantity||1)} : i);
      }
      return [...prev, {...item, quantity: item.quantity||1}];
    });
  };

  const removeFromCart = (productID) => {
    setCart(prev => prev.filter(i => i.productID !== productID));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
