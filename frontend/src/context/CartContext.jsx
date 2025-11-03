import React from 'react'
import { useState, useMemo } from 'react';
import { createContext } from 'react';
import { toast } from 'sonner';

const initialCart = [
  {
    id: 1,
    name: "Áo Thun Cổ Tròn",
    price: 350000,
    image: "https://picsum.photos/seed/fashion1/400/400",
    color: "Đen",
    size: "M",
    quantity: 1,
  },
  {
    id: 2,
    name: "Áo Khoác Denim",
    price: 1200000,
    image: "https://picsum.photos/seed/fashion2/400/400",
    color: "Xanh",
    size: "L",
    quantity: 1,
  },
  {
    id: 3,
    name: "Quần Chinos Slim Fit",
    price: 750000,
    image: "https://picsum.photos/seed/fashion3/400/400",
    color: "Be",
    size: "M",
    quantity: 2,
  },
];
export function CartProvider({ children }) {
  const [cart, setCart] = useState(initialCart);

  const addItem = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.id === item.id);
      if (existingItem) {
        return prevCart.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prevCart, item];
    });
  };

  const removeItem = (id) => {
    const itemToRemove = cart.find((item) => item.id === id);
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    if (itemToRemove) {
      toast.success(`Đã xoá "${itemToRemove.name}" khỏi giỏ hàng.`);
    }
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
      );
      toast.success("Đã cập nhật số lượng sản phẩm.");
    }
  };

  const clearCart = () => {
    setCart([]);
    toast.success("Giỏ hàng đã được dọn dẹp.");
  };

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const shipping = useMemo(() => {
    return subtotal > 1000000 ? 0 : 30000;
  }, [subtotal]);

  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);

  const itemCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const value = {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    shipping,
    total,
    itemCount
  };
  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  )
}

export const CartContext = createContext();