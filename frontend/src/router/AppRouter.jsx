import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home/Home";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout/Checkout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Profile from "../pages/Profile/Profile";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/Admin/Dashboard";
import Products from "../pages/Admin/Products";
import Orders from "../pages/Admin/Orders";
import Categories from "../pages/Admin/CategoryList";
import OrderDetail from "../pages/Admin/OrderDetail";
import ProductForm from "../pages/Admin/ProductForm";
import ChatSupport from "../pages/Admin/ChatSupport";
import AboutUs from "../pages/AboutUs";
import VoucherList from "../pages/Admin/Vouchers";
import ReviewList from "../pages/Admin/ReviewList";
import CustomerList from "../pages/Admin/CustomerList";
import CustomerDetail from "../pages/Admin/CustomerDetail";
import Vouchers from "../pages/Admin/Vouchers";
import CategoryPage from "../pages/CategoryPage/CategoryPage";
import BestsellerPage from "../pages/CategoryPage/BestsellerPage";
import OrderSuccess from "../pages/OrderSuccess/OrderSuccess";
import ProtectedRouter from "./ProtectedRouter";
import NotFound from "../pages/NotFound/NotFound";
import ProductReview from "../pages/Product/ProductReview";
import ProductDetail from "../pages/Product/ProductDetail";
import OrdersDetail from "../pages/OrdersDetail/OrdersDetail";

export default function AppRouter() {
  return (
    <Routes>
      <Route path='/' element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="review/:id" element={<ProductReview />} />
        <Route path="orders/:id" element={<OrdersDetail />} />
        <Route path="/order-success/:orderId" element={<OrderSuccess />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="profile" element={<ProtectedRouter requiredRole={0}><Profile /></ProtectedRouter>} />
        <Route path="aboutUs" element={<AboutUs />} />
        <Route path="vouchers" element={<VoucherList />} />
        <Route path="best-seller" element={<BestsellerPage />} />
        <Route path="reviews" element={<ReviewList />} />
        <Route path="search" element={<CategoryPage />} />
        <Route path="category/:categoryName" element={<CategoryPage />} />
        <Route path="shop" element={<CategoryPage />} />
      </Route>

      <Route path="/admin" element={
        <ProtectedRouter requiredRole={1}>
          <AdminLayout />
        </ProtectedRouter>
      }>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/add" element={<ProductForm />} /> {/* Trang thêm mới */}
        <Route path="products/edit/:productId" element={<ProductForm />} /> {/* Trang sửa */}
        <Route path="orders" element={<Orders />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/:customerId" element={<CustomerDetail />} />
        <Route path="categories" element={<Categories />} />
        <Route path="orders/:orderId" element={<OrderDetail />} />
        <Route path="chat" element={<ChatSupport />} />
        <Route path="vouchers" element={<Vouchers />} />
        <Route path="reviews" element={<ReviewList />} />
      </Route>

      <Route path="*" element={<NotFound/>}></Route>
    </Routes>

  );
}
