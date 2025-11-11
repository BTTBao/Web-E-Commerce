import React, { useState } from "react";
import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../utils/formatPrice";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import "./css/CheckoutOrderSummary.css";

function CheckoutOrderSummary({ shippingFee, onPlaceOrder, isCheckoutActive, items }) {
    const { subtotal } = useCart();
    const [isItemListVisible, setIsItemListVisible] = useState(true);
    const total = subtotal + shippingFee;

    return (
        <div className="order-summary-box">
            <h2 className="order-title">Thông tin đơn hàng</h2>

            <button
                onClick={() => setIsItemListVisible(!isItemListVisible)}
                className="toggle-item-btn"
            >
                <span>
                    {isItemListVisible ? "Ẩn" : "Hiển thị"} thông tin sản phẩm ({items.length})
                </span>
                {isItemListVisible ? (
                    <ChevronUpIcon width={18} height={18} />
                ) : (
                    <ChevronDownIcon width={18} height={18} />
                )}
            </button>

            <div className={`item-list ${isItemListVisible ? "show" : "hide"}`}>
                {items.map(item => (
                    <div key={item.id} className="cart-item">
                        <div className="item-thumb">
                            <img src={item.image} alt={item.name} />
                            <span className="item-qty">{item.quantity}</span>
                        </div>

                        <div className="item-info">
                            <p className="item-name">{item.name}</p>
                            <p className="item-desc">
                                Biến thể: {item.variantName}
                            </p>
                        </div>

                        <p className="item-price">
                            {formatPrice(item.price * item.quantity)}
                        </p>
                    </div>
                ))}
            </div>

            <div className="coupon-box">
                <input type="text" placeholder="Nhập mã giảm giá" />
                <button>Áp dụng</button>
            </div>

            <div className="summary-prices">
                <div className="summary-row">
                    <span>Tạm tính</span>
                    <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="summary-row">
                    <span>Phí vận chuyển</span>
                    <span>{formatPrice(shippingFee)}</span>
                </div>

                <div className="summary-total">
                    <span>Tổng cộng</span>
                    <span>{formatPrice(total)}</span>
                </div>
            </div>

            <button
                onClick={onPlaceOrder}
                disabled={!isCheckoutActive}
                className={`place-order-btn ${!isCheckoutActive ? "disabled" : ""}`}
            >
                Đặt hàng
            </button>
        </div>
    );
}

export default CheckoutOrderSummary;
