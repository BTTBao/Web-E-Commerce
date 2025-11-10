import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import CheckoutOrderSummary from '../../components/Checkout/CheckoutOrderSummary'
import PaymentOptions from '../../components/Checkout/PaymentOptions'
import ShippingMethod from '../../components/Checkout/ShippingMethod'
import ShippingForm from '../../components/Checkout/ShippingForm'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { ArrowLeftIcon } from 'lucide-react'
import './Checkout.css'

function Checkout() {
  const [isFormValid, setIsFormValid] = useState(false)
  const { cart } = useCart()
  const navigate = useNavigate();
  const [shippingFee, setShippingFee] = useState(30000)

  useEffect(() => {
    // Nếu giỏ hàng trống, tự động quay về trang giỏ hàng
    if (cart.length === 0) {
      // navigate(-1);
      toast.warning("Không có sản phẩm")
    }
  }, [cart])

  const handlePlaceOrder = () => {
    if (!isFormValid) {
      alert("Vui lòng điền đầy đủ thông tin nhận hàng.")
      return
    }
    toast.success("Đặt hàng thành công!")
    // Nơi xử lý logic gửi đơn hàng đi, ví dụ: gọi API đến server
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
                  <ShippingForm onFormValidityChange={setIsFormValid} />
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
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout