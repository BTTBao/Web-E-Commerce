import { useState, useEffect } from "react";

/**
 * Hook lấy số lượng sản phẩm trong giỏ hàng từ backend
 * @returns {number} cartCount - số lượng sản phẩm hiện tại
 */
export default function useCartCount() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function fetchCount() {
      try {
        const res = await fetch("/api/cart/count", { credentials: "include" });
        if (!res.ok) 
            throw new Error("Status " + res.status);
        const data = await res.json();
        if (mounted) 
            setCartCount(Number(data.count) || 0);
      } catch (err) {
        console.error("Lỗi khi tải cart count:", err);
      }
    }

    fetchCount();
    const intervalId = setInterval(fetchCount, 20000); 

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return cartCount;
}
