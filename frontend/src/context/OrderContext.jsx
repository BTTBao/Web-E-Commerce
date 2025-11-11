import React, { createContext, useState } from "react";

// Tạo context
export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orderData, setOrderData] = useState({
    accountId: null,
    addressId: null,
    paymentMethod: "COD",
    items: [],
  });

  // Hàm cập nhật linh hoạt theo key
  const updateOrderData = (key, value) => {
    setOrderData((prev) => ({ ...prev, [key]: value }));
  };

  const clearOrder = () => setOrderData({
    accountId: null,
    addressId: null,
    paymentMethod: "COD",
    items: [],
  });

  return (
    <OrderContext.Provider value={{ orderData, updateOrderData, clearOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

