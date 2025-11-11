import React, { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import CheckoutOrderSummary from '../../components/Checkout/CheckoutOrderSummary'
import PaymentOptions from '../../components/Checkout/PaymentOptions'
import ShippingMethod from '../../components/Checkout/ShippingMethod'
import ShippingForm from '../../components/Checkout/ShippingForm'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { ArrowLeftIcon } from 'lucide-react'
import { OrderProvider } from '../../context/OrderContext'
import './Checkout.css'

export default function Checkout() {
  return (
    <OrderProvider>
      <CheckoutContent />
    </OrderProvider>
  );
}

function CheckoutContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isFormValid, setIsFormValid] = useState(false)
  const [shippingFee, setShippingFee] = useState(0)
  const [account, setAccount] = useState(null)
  const { cart } = useCart()

  // Ưu tiên buynow
  const isBuyNow = location?.state?.mode === 'buynow';

  const lineItems = useMemo(() => {
    if (isBuyNow && Array.isArray(location.state.items)) return location.state.items;
    return cart; // thanh toán toàn giỏ khi không phải buynow
  }, [isBuyNow, location.state, cart]);

  const handlePlaceOrder = () => {
    if (!isFormValid) {
      toast.warning("Vui lòng điền đầy đủ thông tin nhận hàng.")
      return
    }
    toast.success("Đặt hàng thành công!")
    // Nơi xử lý logic gửi đơn hàng đi, ví dụ: gọi API đến server
  }
  useEffect(() => {
    const storedAccount = localStorage.getItem("account");

    if (!storedAccount) {
      navigate("/login", { state: { from: "/checkout" } });
    } else {
      setAccount(JSON.parse(storedAccount));
    }
  }, [navigate])

  if (!account) {
    return <p>Đang chuyển hướng tới trang đăng nhập...</p>;
  }
  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="row justify-content-center">
          <div className="col-12">
            <button
              onClick={() => navigate(-1)}
              className="back-button"
            >
              <ArrowLeftIcon className="back-button-icon" />
              Quay lại
            </button>

            <div className="row g-4">
              <div className="col-12 col-lg-8">
                <div className="d-flex flex-column gap-4">
                  <ShippingForm onFormValidityChange={setIsFormValid} account={account}/>
                  <ShippingMethod
                    onShippingChange={setShippingFee}
                    disabled={!isFormValid}
                  />
                  <PaymentOptions disabled={!isFormValid} />
                </div>
              </div>

              <div className="col-12 col-lg-4">
                <CheckoutOrderSummary
                  shippingFee={shippingFee}
                  onPlaceOrder={handlePlaceOrder}
                  isCheckoutActive={isFormValid}
                  items={lineItems}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
