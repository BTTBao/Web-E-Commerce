import React, { useEffect } from 'react'
import { useState, useMemo } from 'react';
import { createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import cartApi from '../api/cartApi';
import productApi from '../api/productApi';

const LOCAL_CART_KEY = 'cart';
export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountId, setAccountId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const account = JSON.parse(localStorage.getItem('account'));
    if (token && account) {
      setIsLoggedIn(true);
      setAccountId(account.accountId);
      loadCartFromServer(account.accountId);
    } else {
      setIsLoggedIn(false);
      loadCartFromLocalStorage();
    }
  }, []);

  // Load giỏ hàng từ server (khi đã đăng nhập)
  const loadCartFromServer = async (accountId) => {
    try {
      setLoading(true);
      const response = await cartApi.getCartByAccountId(accountId);
      setCart(response.data.cart.cartItems || []);
    } catch (error) {
      console.error('Lỗi khi tải giỏ hàng:', error);
      // toast.error('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  // Load giỏ hàng từ localStorage (khi chưa đăng nhập)
  const loadCartFromLocalStorage = () => {
    try {
      const savedCart = localStorage.getItem(LOCAL_CART_KEY);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Lỗi khi tải giỏ hàng local:', error);
    }
  };

  // Lưu giỏ hàng vào localStorage (khi chưa đăng nhập)
  const saveCartToLocalStorage = (cartData) => {
    try {
      if (!cartData || cartData.length === 0) {
        localStorage.removeItem(LOCAL_CART_KEY);
      } else {
        localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cartData));
      }
    } catch (error) {
      console.error('Lỗi khi lưu giỏ hàng local:', error);
    }
  };

  // Đồng bộ giỏ hàng local lên server khi đăng nhập
  const syncCartToServer = async (accountId, localCart) => {
    if (localCart.length === 0) return;

    try {
      setLoading(true);
      // Thêm từng sản phẩm trong giỏ local lên server
      for (const item of localCart) {
        await cartApi.AddItem({
          accountId,
          productId: item.id,
          variantId: item.variantId,
          quantity: item.quantity
        });
      }

      // Xóa giỏ hàng local sau khi đồng bộ
      localStorage.removeItem(LOCAL_CART_KEY);
      toast.success('Đã đồng bộ giỏ hàng của bạn');

      // Tải lại giỏ hàng từ server
      await loadCartFromServer(accountId);
    } catch (error) {
      console.error('Lỗi khi đồng bộ giỏ hàng:', error);
      // toast.error('Không thể đồng bộ giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  // Hàm gọi khi user đăng nhập
  const onLogin = async (accountId) => {
    setIsLoggedIn(true);
    setAccountId(accountId);

    // Lấy giỏ hàng local hiện tại
    const localCart = [...cart];

    // Tải giỏ hàng từ server
    await loadCartFromServer(accountId);

    // Đồng bộ giỏ hàng local lên server nếu có
    if (localCart.length > 0) {
      await syncCartToServer(accountId, localCart);
    }
  };

  // Hàm gọi khi user đăng xuất
  const onLogout = () => {
    setIsLoggedIn(false);
    setAccountId(null);
    // setCart([]);
  };

  // lấy thông tin tồn kho sản phẩm 
  const getStockInfo = async (productId, variantId) => {
    const res = await productApi.getById(productId);
    const productData = res.data.data;

    const variant = productData?.productVariants?.find(
      (v) => v.variantId === variantId
    );

    return {
      stock: variant ? variant.stockQuantity : productData.stockQuantity,
      productData,
    };
  };
  // kiểm tra tồn kho
  const validateStock = async (productId, variantId, quantity) => {
    const { stock } = await getStockInfo(productId, variantId);

    if (stock <= 0) {
      toast.error("Sản phẩm hiện đã hết hàng");
      return false;
    }

    if (quantity > stock) {
      toast.warning(`Chỉ còn ${stock} sản phẩm trong kho`);
      return false;
    }

    return true;
  };

  // Thêm sản phẩm vào giỏ hàng
  const addItem = async (item) => {
    toast.dismiss();
    if (!item || !item.id) {
      console.error("Sản phẩm không hợp lệ:", item);
      toast.error("Không thể thêm sản phẩm vào giỏ hàng");
      return;
    }
    if (item.variantId == 0) {
      toast.warning("Vui lòng chọn biến thể");
      return;
    }
    try {
      setLoading(true);
      // Kiểm tra trùng sản phẩm trong giỏ hiện tại
      const isDuplicate = cart.some(
        (i) => i.id === item.id && i.variantId === item.variantId
      );
      if (isDuplicate) {
        toast.warning("Sản phẩm này đã có trong giỏ hàng");
        return;
      }

      // Kiểm tra tồn kho
      const isStockValid = await validateStock(
        item.id || item.productId,
        item.variantId,
        item.quantity
      );
      if (!isStockValid) return;

      const newItem = {
        ...item,
        quantity: item.quantity > 0 ? item.quantity : 1,
      };
      // Nếu đã đăng nhập → gọi API + cập nhật local state
      if (isLoggedIn && accountId) {
        await cartApi.AddItem({
          accountId,
          productId: newItem.id,
          variantId: newItem.variantId,
          quantity: newItem.quantity,
        });
      }

      // Cập nhật giỏ hàng local (dù đăng nhập hay chưa)
      setCart((prevCart) => {
        const updatedCart = [...prevCart, newItem];

        if (!isLoggedIn) {
          saveCartToLocalStorage(updatedCart);
        }

        return updatedCart;
      });
      toast.success(`Đã thêm "${item.name}${item.variantName ? " - " + item.variantName : ""}" vào giỏ hàng`);
    } catch (error) {
      console.error('Lỗi khi thêm sản phẩm:', error);
      toast.error('Không thể thêm sản phẩm vào giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật số lượng sản phẩm
  const updateQuantity = async (id, variantId, quantity) => {
    toast.dismiss();
    if (quantity <= 0) {
      removeItem(id, variantId);
    }
    if (quantity > 10) {
      toast.warning("Số lượng tối đa mỗi sản phẩm là 10")
      return;
    }

    try {
      setLoading(true);

      // Kiểm tra tồn kho
      const isStockValid = await validateStock(id, variantId, quantity);
      if (!isStockValid) return;
      // Cập nhật state local

      setCart((prevCart) => {
        const newCart = prevCart.map((item) =>
          (item.id || item.productId) === id && item.variantId === variantId
            ? { ...item, quantity }
            : item
        );

        if (!isLoggedIn) {
          saveCartToLocalStorage(newCart);
        }

        return newCart;
      });

      // gọi API (nếu đăng nhập)
      if (isLoggedIn && accountId) {
        // Đã đăng nhập: Gọi API
        await cartApi.UpdateItem({
          accountId,
          productId: id,
          variantId,
          quantity,
        });
      }

      toast.success('Đã cập nhật số lượng sản phẩm');
    } catch (error) {
      console.error('Lỗi khi cập nhật số lượng:', error);
      toast.error('Không thể cập nhật số lượng');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId, variantId) => {
    toast.dismiss();
    try {
      setLoading(true);
      const itemToRemove = cart.find(
        (item) => (item.id || item.productId) === productId && item.variantId === variantId);

      if (isLoggedIn && accountId) {
        // Đã đăng nhập: Gọi API
        await cartApi.RemoveItem(accountId, productId, variantId);
      }

      // Cập nhật state local
      setCart((prevCart) => {
        const newCart = prevCart.filter(
          (item) => !((item.id || item.productId) === productId && item.variantId == variantId)
        );

        if (!isLoggedIn) {
          saveCartToLocalStorage(newCart);
        }
        navigate(0)
        return newCart;
      });
      if (itemToRemove) {
        toast.success(`Đã xóa "${itemToRemove.name || itemToRemove.productName}" khỏi giỏ hàng`);
      }
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error);
      toast.error('Không thể xóa sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    try {
      setLoading(true);

      if (isLoggedIn && accountId) {
        // Đã đăng nhập: Xóa từng item trên server
        for (const item of cart) {
          await cartApi.RemoveItem(accountId, (item.id || item.productId), item.variantId);
        }
      } else {
        // Chưa đăng nhập: Xóa localStorage
        localStorage.removeItem(LOCAL_CART_KEY);
        // navigate(0)
      }
      setCart([]);
      navigate(0)
      toast.success('Giỏ hàng đã được dọn dẹp');
    } catch (error) {
      console.error('Lỗi khi xóa giỏ hàng:', error);
      toast.error('Không thể xóa giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const shipping = useMemo(() => {
    // return subtotal > 1000000 ? 0 : 30000;
    return 0;
  }, [subtotal]);

  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);

  const itemCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // const cartCount = useMemo(() => cart.length, [cart]);
  const cartCount = cart.length;
  const value = {
    cart,
    onLogin,
    onLogout,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    shipping,
    total,
    itemCount,
    cartCount,
    validateStock
  };
  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  )
}

export const CartContext = createContext();