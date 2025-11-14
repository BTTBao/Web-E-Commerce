import React, { useMemo, useState } from "react";
import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../utils/formatPrice";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import "./css/CheckoutOrderSummary.css";
import { toast } from "sonner";
import axiosClient from "../../api/axiosClient";
import { useOrder } from "../../hooks/useOrder";
import { useNavigate } from "react-router-dom";

function CheckoutOrderSummary({ shippingFee, onPlaceOrder, isCheckoutActive, items }) {
    const [isItemListVisible, setIsItemListVisible] = useState(true);
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const { orderData, clearOrder } = useOrder();

    const updatedItems = items.map(item => ({
        productId: item.productId || item.id,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.price, // đổi tên price → unitPrice
    }));
    const newOrderData = { ...orderData, items: updatedItems }; // tạo object mới với items
    const newItems = newOrderData.items;

    //Tính tổng tiền
    const subtotal = useMemo(() => {
        return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    }, [items]);
    const total = subtotal + shippingFee;
    
    const handleCheckout = async () => {
        console.log(newOrderData)
        try {
            const res = await axiosClient.post("/Orders", newOrderData);
            toast.success(`Đặt hàng thành công`);
            // Chuyển sang trang xác nhận, gửi dữ liệu qua state
            const order = res.data
            navigate(`/order-success/${order.orderId}`, { replace: true, state: { order } });
            clearCart();
            clearOrder();
        } catch (err) {
            console.error("l"+ err);
            toast.error("Không thể đặt hàng !!");
        }
    };

    return (
        <div className="order-summary-box">
            <h2 className="order-title">Thông tin đơn hàng</h2>

            <button
                onClick={() => setIsItemListVisible(!isItemListVisible)}
                className="toggle-item-btn"
            >
                <span>
                    {isItemListVisible ? "Ẩn" : "Hiển thị"} thông tin sản phẩm
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
                            <img src={item.image || item.imageUrl} alt={item.name} />
                            <span className="item-qty">{item.quantity}</span>
                        </div>

                        <div className="item-info">
                            <p className="item-name">{item.name || item.productName}</p>
                            <p className="item-desc">
                                {item.variantName ? `Biến thể: ${item.variantName}` : ""}
                            </p>
                        </div>

                        <p className="item-price">
                            {item.price ? `${formatPrice(item.price * item.quantity)}` : ""}
                            {/* {formatPrice(item.price * item.quantity)} */}
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
                    <span>{formatPrice(subtotal || 0)}</span>
                </div>

                <div className="summary-row">
                    <span>Phí vận chuyển</span>
                    <span>{formatPrice(shippingFee)}</span>
                </div>

                <div className="summary-total">
                    <span>Tổng cộng</span>
                    <span>{formatPrice(total || 0)}</span>
                </div>
            </div>

            <button
                onClick={() => {
                    onPlaceOrder
                    handleCheckout()
                }}
                disabled={!isCheckoutActive}
                className={`place-order-btn ${!isCheckoutActive ? "disabled" : ""}`}
            >
                Đặt hàng
            </button>
        </div>
    );
}

export default CheckoutOrderSummary;
