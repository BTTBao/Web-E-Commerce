import React from 'react'
import { useCart } from '../../hooks/useCart';
import { TrashIcon } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';
import './css/OrderSummary.css'
import { useNavigate } from 'react-router-dom';

function OrderSummary({ onOpenClearCartModal }) {
    const navigate = useNavigate();
    const { subtotal, shipping, total } = useCart();
    return (
        <div className="order-summary-card">
            <h2 className="order-summary-title">
                Tóm tắt đơn hàng
            </h2>

            <div className="order-summary-details">
                <div className="order-summary-row">
                    <span>Tạm tính</span>
                    <span className="order-summary-value">
                        {formatPrice(subtotal)}
                    </span>
                </div>

                <div className="order-summary-row">
                    <span>Phí vận chuyển</span>
                    <span className="order-summary-value">
                        {shipping === 0 ? "Miễn phí" : formatPrice(shipping)}
                    </span>
                </div>

                <div className="order-summary-total">
                    <span>Tổng cộng</span>
                    <span>{formatPrice(total)}</span>
                </div>
            </div>

            <button 
                onClick={() => navigate("/checkout")}
                className="checkout-button">
                Tiến hành thanh toán
            </button>

            <button
                onClick={onOpenClearCartModal}
                className="clear-cart-button"
            >
                <TrashIcon className="w-5 h-5" />
                Dọn dẹp giỏ hàng
            </button>
        </div>
    )
}

export default OrderSummary